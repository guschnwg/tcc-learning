import { PostgrestError } from "@supabase/supabase-js";
import supabase, { BEST_GUESSES_TABLE, GAMES_TABLE, GAME_LEVELS_TABLE, LEVELS_TABLE, PROFILES_TABLE } from "../supabase";
import React, { FormEvent, useEffect, useState } from "react";
import Button from "./Button";
import { isSameOSMPlace } from "./OpenStreetMapData";

const Leaderboard: React.FC = () => {
  const [levels, setLevels] = useState<LevelEntity[]>();

  const fetchLevels = async () => {
    const { data, error } = await supabase.from(LEVELS_TABLE).select().order("id");
    if (data) {
      setLevels(data);
    }
  }

  useEffect(() => {
    if (!levels) fetchLevels()
  }, [levels]);

  if (!levels) {
    return null;
  }

  return <InternalLeaderboard levels={levels} />;
}

const fetchLeaderboard = async (guessLimit = 5, levelId = 0): Promise<{ data: LeaderboardData[] | null, error: PostgrestError | null }> => {
  let query = supabase
    .from(BEST_GUESSES_TABLE)
    .select(`*, ${GAME_LEVELS_TABLE}!inner(*, ${LEVELS_TABLE}!inner(*), ${GAMES_TABLE}!inner(*, ${PROFILES_TABLE}!inner(*)))`)
    .eq(`${GAME_LEVELS_TABLE}.${GAMES_TABLE}.guess_limit`, guessLimit);

  if (levelId !== 0) {
    query = query.eq(`${GAME_LEVELS_TABLE}.level_id`, levelId);
  }

  const { data, error } = await query.order('distance');

  return { data, error };
}

const LevelLeaderboard: React.FC<{ guessLimit: number, levelId: number  }> = ({ guessLimit, levelId }) => {
  const [data, setData] = useState<LeaderboardData[]>();
  const [, setError] = useState<PostgrestError>();

  useEffect(() => {
    setData(undefined);
    setError(undefined);
    fetchLeaderboard(guessLimit, levelId).then(({ data, error }) => {
      if (data) {
        setData(data);
      }
      if (error) {
        setError(error);
      }
    })
  }, [guessLimit, levelId]);

  if (!data) {
    return <span>Loading...</span>;
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nome</th>
            <th>Distância</th>
            <th>Acertou?</th>
            <th>Tempo</th>
            <th>Dicas Usadas</th>
          </tr>
        </thead>

        <tbody>
          {data.map((d, index) => (
            <tr key={d.game_levels.games.profiles.name}>
              <td>{index + 1}</td>
              <td>{d.game_levels.games.profiles.name}</td>
              <td>{(d.distance / 1000).toFixed(2)}</td>
              <td>{isSameOSMPlace(d.data.address, d.game_levels.levels.data.address) ? "SIM" : "NÃO"}</td>
              <td>{d.time_elapsed}</td>
              <td>{d.hints_viewed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const GeneralLeaderboard: React.FC<{ guessLimit: number }> = ({ guessLimit }) => {
  const [data, setData] = useState<GeneralLeaderboardData[]>();
  const [, setError] = useState<PostgrestError>();

  useEffect(() => {
    setData(undefined);
    setError(undefined);

    fetchLeaderboard(guessLimit).then(({ data, error }) => {
      if (data) {
        const generalData: GeneralLeaderboardData[] = [];
        for (const guess of data) {
          const userGeneralData = generalData.find(gd => gd.user.id === guess.game_levels.games.profiles.id);
          if (!userGeneralData) {
            generalData.push({
              user: guess.game_levels.games.profiles,
              guesses: [guess],
              totalGuesses: 0,
              totalTime: 0,
              totalDistance: 0,
              averageDistance: 0,
              averageTime: 0,
              correctGuesses: 0,
            })
          } else {
            userGeneralData.guesses.push(guess);
          }
        }

        for (const item of generalData) {
          item.totalGuesses = item.guesses.length;
          item.correctGuesses = item.guesses.reduce((agg, crr) => agg + Number(isSameOSMPlace(crr.data.address, crr.game_levels.levels.data.address)), 0);
          item.totalDistance = item.guesses.reduce((agg, crr) => agg + (crr.distance / 1000), 0);
          item.totalTime = item.guesses.reduce((agg, crr) => agg + crr.time_elapsed, 0);
          item.averageDistance = item.totalDistance / item.totalGuesses;
          item.averageTime = item.totalTime / item.totalGuesses;
        }

        // Sort by correctGuesses, then by averageDistance, then by Average Time
        setData(generalData.sort((a, b) => a.totalGuesses - b.totalGuesses || a.correctGuesses - b.correctGuesses || a.averageDistance - b.averageDistance || a.averageTime - b.averageTime));
      }
      if (error) {
        setError(error);
      }
    })
  }, [guessLimit]);

  if (!data) {
    return <span>Loading...</span>;
  }


  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nome</th>
            <th>Palpites Totais</th>
            <th>Palpites Acertados</th>
            <th>Distância Total</th>
            <th>Tempo Total</th>
            <th>Distância Média</th>
            <th>Tempo Médio</th>
          </tr>
        </thead>

        <tbody>
          {data.map((d, index) => (
            <tr key={d.user.id}>
              <td>{index + 1}</td>
              <td>{d.user.name}</td>
              <td>{d.totalGuesses}</td>
              <td>{d.correctGuesses}</td>
              <td>{d.totalDistance.toFixed(2)}</td>
              <td>{d.totalTime}s</td>
              <td>{d.averageDistance.toFixed(2)}</td>
              <td>{d.averageTime.toFixed(2)}s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const InternalLeaderboard: React.FC<{ levels: LevelEntity[] }> = ({ levels }) => {
  const [guessLimit, setGuessLimit] = useState<number>(5);
  const [levelId, setLevelId] = useState<number>(0);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setGuessLimit(Number((event.target as HTMLFormElement)["guess_limit"].value || "0"));
    setLevelId(Number((event.target as HTMLFormElement)["level_id"].value || "0"));
  }

  return (
    <div className="leaderboard">
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="level_id">
            Nível
          </label>
          <select name="level_id" id="level_id" defaultValue={0}>
            <option value={0}>Todos</option>
            {levels.map(level => <option key={level.id} value={level.id}>{level.id}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="guess_limit">
            Número de palpites
          </label>
          <select name="guess_limit" id="guess_limit" defaultValue={5}>
            <option value="0">Ilimitado</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
          </select>
        </div>

        <div>
          <Button>Confirmar</Button>
        </div>
      </form>

      {levelId === 0 ? (
        <GeneralLeaderboard guessLimit={guessLimit} />
      ) : (
        <LevelLeaderboard guessLimit={guessLimit} levelId={levelId} />
      )}
    </div>
  );
}

export default Leaderboard;
