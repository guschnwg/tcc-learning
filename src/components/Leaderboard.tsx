import { PostgrestError } from "@supabase/supabase-js";
import React, { FormEvent, useEffect, useState } from "react";
import supabase from "../supabase";
import Button from "./Button";

const USER_DATA_TABLE = "user_data";

const Leaderboard = () => {
  const [data, setData] = useState<LeaderboardData[]>();
  const [error, setError] = useState<PostgrestError>();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const guessLimit = Number((event.target as HTMLFormElement)["guess_limit"].value || "0");

    const { data, error } = await supabase.from(USER_DATA_TABLE).select().eq("guess_limit", guessLimit);

    if (error) {
      setError(error);
    }
    if (data) {
      const userData = data as UserData[];

      setData(userData.map(ud => ({
        user: ud.user,
        guesses: ud.data.map(udd => {
          const bestGuess = udd.guesses.sort((g1, g2) => g1.distance - g2.distance)?.[0];

          return {
            id: udd.id,
            levelId: udd.level_id,
            distance: bestGuess ? bestGuess.distance : -1,
            hints: bestGuess.hints_viewed,
          }
        }),
      })));
    }
  }

  return (
    <div style={{background: "blue"}}>
      <form onSubmit={handleSubmit}>
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

        <Button>Confirm</Button>
      </form>

      <div>
        <ul>
          {data?.map(d => (
            <li key={d.user}>{d.user} {d.guesses.reduce((agg, crr) => agg + crr.distance + crr.hints * 100, 0)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Leaderboard;
