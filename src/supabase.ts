import { createClient } from "@supabase/supabase-js";

const supabase = createClient('https://ddzlknjoifzrxzclbzop.supabase.co', process.env.REACT_APP_SUPABASE_KEY || '');

export const USER_DATA_TABLE = "user_data";
export const LEVELS_TABLE = "levels";

export default supabase;