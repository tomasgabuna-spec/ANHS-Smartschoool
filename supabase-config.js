/* ANHS SMARTSCHOOL - SUPABASE CONFIG
   Replace these placeholders with values from Supabase > Project Settings > API.
*/
const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-PUBLISHABLE-OR-ANON-KEY";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
