import { createClient } from "@supabase/supabase-js";

const supabase = createClient('https://ddzlknjoifzrxzclbzop.supabase.co', process.env.REACT_APP_SUPABASE_KEY || '');

export const GUESSES_TABLE = "guesses";
export const GAMES_TABLE = "games";
export const GAME_LEVELS_TABLE = "game_levels";
export const GAME_LEVEL_HINTS_TABLE = "game_level_hints";
export const LEVELS_TABLE = "levels";
export const HINTS_TABLE = "hints";
export const LEADERBOARD_TABLE = "leaderboard";

export async function fetchOrCreate<T>(table: string, match: Record<string, unknown>, insert: Record<string, unknown>): Promise<T | null> {
  let response = await supabase
    .from(table)
    .select()
    .match(match);

  if (response.data && response.data[0]) {
    return response.data[0];
  }

  response = await supabase
    .from(table)
    .insert({...match, ...insert });

  if (response.data && response.data[0]) {
    return response.data[0];
  }

  return null;
}

export default supabase;