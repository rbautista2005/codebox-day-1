const { createClient } = require("@supabase/supabase-js");

// Server-side only. The service role key bypasses Row Level Security, so it
// must never reach a browser or be committed — it lives in .env.
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

// Same fail-fast rule as JWT_SECRET: refuse to start half-configured.
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set. Copy .env.example to .env and fill them in from your Supabase project's API settings."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  // This is a server talking to the database, not a logged-in browser user,
  // so there is no session to store or refresh.
  auth: { persistSession: false, autoRefreshToken: false },
});

module.exports = supabase;
