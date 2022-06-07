import React, { useState, FormEvent, useEffect } from 'react';
import { PostgrestError } from '@supabase/supabase-js'

import Level from './Level';
import Path from './Path';
import Button from './Button';
import supabase, { LEVELS_TABLE, USER_DATA_TABLE } from '../supabase';

const Game: React.FC = () => {
  const [data, setData] = useState<UserData>();
  const [levels, setLevels] = useState<Level[]>();
  const [error, setError] = useState<PostgrestError>();
  const [guessesNumber, setGuessesNumber] = useState(window.localStorage.getItem("guess_limit") || "5");

  const fetchLevels = async () => {
    const { data, error } = await supabase.from(LEVELS_TABLE).select().order("id");

    if (error) {
      setError(error);
    }
    if (data) {
      setLevels(data);
    }
  }

  useEffect(() => {
    if (data && !levels) {
      fetchLevels();
    }
  }, [data, levels]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const user = (event.target as HTMLFormElement)["user"].value;
    const guessLimit = Number((event.target as HTMLFormElement)["guess_limit"].value || "0");

    if (!user) {
      alert("Informe o nome do jogador")
      return;
    }

    const { data, error } = await supabase.from(USER_DATA_TABLE).select().eq('user', user).eq('guess_limit', guessLimit);
    if (error) {
      setError(error);
      return;
    }
    if (data && data[0]) {
      setData(data[0]);
      window.localStorage.setItem("user", user);
      window.localStorage.setItem("guess_limit", guessLimit.toString());
      return;
    }

    if (window.confirm("Criar novo jogador?")) {
      const { data, error } = await supabase.from(USER_DATA_TABLE).insert([{ user, guess_limit: guessLimit, data: [] }]);

      if (data && data[0]) {
        setData(data[0]);
        window.localStorage.setItem("user", user);
        window.localStorage.setItem("guess_limit", guessLimit.toString());
      }

      if (error) {
        setError(error);
      }
    }
  }

  if (error) {
    return (
      <div className="login-container">
        <pre>
          {JSON.stringify(error, null, 2)}
        </pre>

        <Button onClick={() => setError(undefined)}>Retry</Button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="login-container">
        <form onSubmit={onSubmit}>
          <div>
            <label htmlFor="user">Nome do Jogador</label>
            <input name="user" id="user" defaultValue={window.localStorage.getItem("user") || ""} />
          </div>
          <div hidden>
            <label htmlFor="guess_limit">Número de Palpites: {guessesNumber === "0" ? "Ilimitado" : guessesNumber}</label>
            <input
              type="range"
              name="guess_limit"
              id="guess_limit"
              defaultValue={guessesNumber}
              onInput={e => setGuessesNumber((e.target as HTMLInputElement).value)}
              min="0"
              max="10"
            />
          </div>
          <div>
            <Button>Entrar</Button>
          </div>
        </form>

        {/* <Link to="/leaderboard">
          Leaderboard
        </Link> */}
      </div>
    );
  }

  if (!levels) {
    return (
      <div className="login-container">
        <span>
          Loading levels...
        </span>
      </div>
    )
  }

  return <InternalGame levels={levels} data={data} onUpdate={setData} />
}

interface GameProps {
  levels: Level[]
  data: UserData
  onUpdate: (data: UserData) => void
}

const InternalGame: React.FC<GameProps> = ({ levels, data, onUpdate }) => {
  const [index, setIndex] = useState(2);

  const update = async (theNewUserData: UserData, updateState = true) => {
    const { data } = await supabase.from<UserData>(USER_DATA_TABLE).update({ data: theNewUserData.data }).match({ id: theNewUserData.id });
    if (data && data[0]) {
      if (updateState) {
        onUpdate(data[0]);
      }
      return true;
    }

    return false;
  }

  const handleHintViewed = async (hintIndex: number, time: number) => {
    const theNewUserData = JSON.parse(JSON.stringify(data)) as UserData;

    const theHint: HintView = {
      id: hintIndex,
      viewed: true,
      timestamp: time,
    };
    const levelData = theNewUserData.data.find(ud => ud.level_id === index);
    if (levelData) {
      levelData.hints.push(theHint);
    } else {
      theNewUserData.data.push({
        "id": theNewUserData.data.length,
        "level_id": index,
        "current_time": 0,
        "hints": [theHint],
        "guesses": [],
        "completed": false,
      })
    }

    await update(theNewUserData);
  }

  const handleNext = async (toIndex?: number) => {
    const theNewUserData = JSON.parse(JSON.stringify(data)) as UserData;

    const nextIndex = toIndex || index + 1;
    const levelData = theNewUserData.data.find(ud => ud.level_id === nextIndex);
    if (!levelData) {
      theNewUserData.data.push({
        "id": theNewUserData.data.length,
        "level_id": nextIndex,
        "current_time": 0,
        "hints": [],
        "guesses": [],
        "completed": false,
      })
    }

    if (await update(theNewUserData)) {
      setIndex((prev) => toIndex || prev + 1)
    }
  }

  const handleGuess = async (marker: google.maps.LatLngLiteral, osmData: OSMData, time: number, distance: number) => {
    const theNewUserData = JSON.parse(JSON.stringify(data)) as UserData;

    const levelData = theNewUserData.data.find(ud => ud.level_id === index);
    const theGuess = {
      "id": levelData ? levelData.guesses.length + 1 : 1,
      "distance": distance,
      "coordinates": marker,
      "timestamp": time,
      "hints_viewed": levelData ? levelData.hints.length : 0,
      "data": osmData,
    };
    if (levelData) {
      levelData.guesses.push(theGuess);
    } else {
      theNewUserData.data.push({
        "id": theNewUserData.data.length,
        "level_id": index,
        "current_time": 0,
        "hints": [],
        "guesses": [theGuess],
        "completed": false,
      })
    }

    await update(theNewUserData);

    return theGuess;
  }

  const handleTimePassed = async (time: number) => {
    const theNewUserData = JSON.parse(JSON.stringify(data)) as UserData;

    const levelData = theNewUserData.data.find(ud => ud.level_id === index);
    if (levelData) {
      levelData.current_time = time;
    } else {
      theNewUserData.data.push({
        "id": theNewUserData.data.length,
        "level_id": index,
        "current_time": time,
        "hints": [],
        "guesses": [],
        "completed": false,
      })
    }

    await update(theNewUserData, false);
  }

  const level = levels.find(l => l.id === index);
  if (!level) {
    return <span>Nenhum nível aqui!</span>;
  }

  return (
    <div className="full">
      <Level
        current={level}
        guessLimit={data.guess_limit}
        userData={data.data.find(ud => ud.level_id === index)}
        onNext={handleNext}
        onGuess={handleGuess}
        onHintViewed={handleHintViewed}
        onTimePassed={handleTimePassed}
      />

      <Path
        levels={levels}
        userData={data.data}
        current={index}
        onLevelClick={handleNext}
      />
    </div>
  );
};

export default Game;
