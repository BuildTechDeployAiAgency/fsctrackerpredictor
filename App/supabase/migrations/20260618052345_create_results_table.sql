-- Migration: create results table
-- Description: Shared live match results for Fadi's World Cup Pool 2026.
-- Only `results` lives in the DB. Players / games / predictions stay in the
-- config file (src/data/wc2026.js). Engine + data are never changed.

-- 1. Table: one row per game that has a final score.
create table public.results (
  game_no    smallint primary key check (game_no between 1 and 104),
  home       smallint not null check (home  >= 0 and home  <= 99),
  away       smallint not null check (away  >= 0 and away  <= 99),
  updated_at timestamptz not null default now()
);

comment on table public.results is
  'Shared live results for the WC2026 friends pool. game_no maps to games[].n in src/data/wc2026.js. The only mutable table; predictions/players/games stay in the config file.';

-- 2. Keep updated_at fresh on every write.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger results_touch_updated_at
  before update on public.results
  for each row execute function public.touch_updated_at();

-- 3. Row Level Security. Friends-trust model for now: anyone holding the app
--    (anon key) can read and write the shared board. A commissioner gate
--    (Phase 2) can later restrict writes; reads stay open.
alter table public.results enable row level security;

create policy "Anyone can read results"
  on public.results for select
  to anon, authenticated
  using (true);

create policy "Anyone can insert results"
  on public.results for insert
  to anon, authenticated
  with check (true);

create policy "Anyone can update results"
  on public.results for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "Anyone can delete results"
  on public.results for delete
  to anon, authenticated
  using (true);

-- 4. Realtime: broadcast row changes so every phone updates live.
alter publication supabase_realtime add table public.results;
