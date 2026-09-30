-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Requires Supabase Auth (auth.users), which every Supabase project has.

create table if not exists public.todos (
  id bigint generated always as identity primary key,
  -- Deleting an account deletes that user's todos with it.
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 500),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Every query filters by user_id, so index it.
create index if not exists todos_user_id_idx on public.todos (user_id);

-- The Express server uses the service role key, which bypasses RLS, and
-- enforces ownership itself. These policies are a second line of defense in
-- case the public anon key is ever used against this table directly.
alter table public.todos enable row level security;

drop policy if exists "Users read own todos" on public.todos;
create policy "Users read own todos" on public.todos
  for select using (auth.uid() = user_id);

drop policy if exists "Users insert own todos" on public.todos;
create policy "Users insert own todos" on public.todos
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own todos" on public.todos;
create policy "Users update own todos" on public.todos
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users delete own todos" on public.todos;
create policy "Users delete own todos" on public.todos
  for delete using (auth.uid() = user_id);
