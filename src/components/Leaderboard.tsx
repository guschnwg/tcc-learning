import { PostgrestError } from "@supabase/supabase-js";
import supabase, { BEST_GUESSES_TABLE, GAMES_TABLE, GAME_LEVELS_TABLE, LEVELS_TABLE, PROFILES_TABLE } from "../supabase";
import React, { FormEvent, useEffect, useState } from "react";
import Button from "./Button";

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

const InternalLeaderboard: React.FC<{ levels: LevelEntity[] }> = ({ levels }) => {
  const [data, setData] = useState<LeaderboardData[]>();
  const [, setError] = useState<PostgrestError>();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const guessLimit = Number((event.target as HTMLFormElement)["guess_limit"].value || "0");
    const levelId = Number((event.target as HTMLFormElement)["level_id"].value || "0");

    const { data, error } = await supabase
      .from(BEST_GUESSES_TABLE)
      .select(`*, ${GAME_LEVELS_TABLE}!inner(*, ${GAMES_TABLE}!inner(*, ${PROFILES_TABLE}!inner(*)))`)
      .eq(`${GAME_LEVELS_TABLE}.${GAMES_TABLE}.guess_limit`, guessLimit)
      .eq(`${GAME_LEVELS_TABLE}.level_id`, levelId)
      .order('distance')
      .limit(20);

    if (error) {
      setError(error);
    }
    if (data) {
      setData(data);
    }
  }

  return (
    <div className="leaderboard">
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="level_id">
            Nível
          </label>
          <select name="level_id" id="level_id" defaultValue={0}>
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
          <Button>Confirm</Button>
        </div>
      </form>

      {data && (
        <div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>Distância</th>
                <th>Tempo</th>
                <th>Dicas Usadas</th>
              </tr>
            </thead>

            <tbody>
              {data.map((d, index) => (
                <tr key={d.game_levels.games.profiles.name}>
                  <td>{index + 1}</td>
                  <td>{d.game_levels.games.profiles.name}</td>
                  <td>{d.distance.toFixed(2)}</td>
                  <td>{d.time_elapsed}</td>
                  <td>{d.hints_viewed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
