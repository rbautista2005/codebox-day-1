import { createClient } from "@supabase/supabase-js";

// Browser-side Supabase client, used only for sign-up / log-in / sessions.
// Todo data goes through our Express API (see api.js), not straight to the DB.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

export const supabase = supabaseConfigured ? createClient(url, anonKey) : null;
