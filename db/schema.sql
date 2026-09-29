-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.

create table if not exists public.users (
  id bigint generated always as identity primary key,
  name text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now()
);

-- With RLS on and no policies, the public anon key can't touch this table.
-- The server uses the service role key, which bypasses RLS.
alter table public.users enable row level security;

-- Sample rows matching the old in-memory data. On a fresh table these get
-- ids 1 and 2, so `npm run token` (which signs for user 1) still works.
insert into public.users (name) values ('Alex'), ('Sam');
