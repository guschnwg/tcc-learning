import React, { useState, FormEvent } from 'react';
import { createClient, PostgrestError } from '@supabase/supabase-js'

import game from '../data.json';

import Level from './Level';
import Path from './Path';

const supabase = createClient('https://ddzlknjoifzrxzclbzop.supabase.co', process.env.REACT_APP_SUPABASE_KEY || '');

const Game: React.FC = () => {
  const [data, setData] = useState<UserData>();
  const [error, setError] = useState<PostgrestError>();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const user = (event.target as HTMLFormElement)["user"].value;

    const { data, error } = await supabase.from('data').select().eq('user', user);
    if (error) {
      setError(error);
      return;
    }
    if (data && data[0]) {
      setData(data[0]);
      window.localStorage.setItem("user", user);
      return;
    }

    if (window.confirm("No user, create?")) {
      const { data, error } = await supabase.from('data').insert([{ user, data: [] }]);

      if (data && data[0]) {
        setData(data[0]);
        window.localStorage.setItem("user", user);
      }

      if (error) {
        setError(error);
      }
    }
  }

  if (!data) {
    return (
      <div>
        {error && (
          <div>
            <pre>
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div>
            <label htmlFor="name">User</label>
            <input name="user" id="user" defaultValue={window.localStorage.getItem("user") || ""} />
          </div>
          <div>
            <button>Confirm</button>
          </div>
        </form>
      </div>
    );
  }

  return <InternalGame data={data} onUpdate={setData} />
}

interface GameProps {
  data: UserData
  onUpdate: (data: UserData) => void
}

const InternalGame: React.FC<GameProps> = ({ data, onUpdate }) => {
  const [index, setIndex] = useState(1);

  const update = async (theNewUserData: UserData) => {
    const { data } = await supabase.from<UserData>('data').update({ data: theNewUserData.data }).match({ id: theNewUserData.id });
    if (data && data[0]) {
      onUpdate(data[0]);
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
        "hints": [],
        "guesses": [],
        "completed": false,
      })
    }

    if (await update(theNewUserData)) {
      setIndex((prev) => toIndex || prev + 1)
    }
  }

  const handleGuess = async (osmData: OSMData, time: number, distance: number) => {
    const theNewUserData = JSON.parse(JSON.stringify(data)) as UserData;

    const levelData = theNewUserData.data.find(ud => ud.level_id === index);
    const theGuess = {
      "id": levelData ? levelData.guesses.length + 1 : 1,
      "distance": distance,
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
        "hints": [],
        "guesses": [theGuess],
        "completed": false,
      })
    }

    await update(theNewUserData);
  }

  return (
    <div className="full">
      <Level
        // eslint-disable-next-line
        current={game.levels.find(l => l.id === index)!}
        userData={data.data.find(ud => ud.level_id === index)}
        onNext={handleNext}
        onGuess={handleGuess}
        onHintViewed={handleHintViewed}
      />

      <Path
        levels={game.levels}
        userData={data.data}
        current={index}
        onLevelClick={handleNext}
      />
    </div>
  );
};

export default Game;
