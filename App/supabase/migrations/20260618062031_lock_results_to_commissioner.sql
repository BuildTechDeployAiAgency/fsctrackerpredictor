-- Migration: lock results to a commissioner
-- Description: Results become read-only for everyone (anon) at the table level.
-- Writes are only possible through SECURITY DEFINER RPCs that require the
-- commissioner passcode, checked against a private config table that anon
-- cannot read. Reads + realtime stay open so every phone sees the live board.

-- 1. Private config (commissioner passcode lives here, hashed via pgcrypto).
create extension if not exists pgcrypto with schema extensions;

create table public.app_config (
  key   text primary key,
  value text not null
);
comment on table public.app_config is 'Private key/value config (e.g. hashed commissioner passcode). No anon access — only SECURITY DEFINER functions read it.';

-- RLS enabled with NO policies => anon/authenticated are denied all access.
alter table public.app_config enable row level security;

-- Seed an UNKNOWABLE random passcode hash as the default, so nobody is
-- commissioner until the real passcode is set out-of-band (never committed).
insert into public.app_config (key, value)
values ('commissioner_passcode', extensions.crypt(gen_random_uuid()::text, extensions.gen_salt('bf')))
on conflict (key) do nothing;

-- 2. Helper: does this passcode match the stored commissioner hash?
create or replace function public.verify_commissioner(p_passcode text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.app_config
    where key = 'commissioner_passcode'
      and value = extensions.crypt(p_passcode, value)
  );
$$;

-- 3. Write RPCs — only succeed with the commissioner passcode.
create or replace function public.set_result(p_game_no smallint, p_home smallint, p_away smallint, p_passcode text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.verify_commissioner(p_passcode) then
    raise exception 'unauthorized' using errcode = '42501';
  end if;
  insert into public.results (game_no, home, away)
  values (p_game_no, p_home, p_away)
  on conflict (game_no) do update set home = excluded.home, away = excluded.away;
end;
$$;

create or replace function public.clear_result(p_game_no smallint, p_passcode text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.verify_commissioner(p_passcode) then
    raise exception 'unauthorized' using errcode = '42501';
  end if;
  delete from public.results where game_no = p_game_no;
end;
$$;

-- 4. Lock down the table: drop the open write policies (read stays open).
drop policy if exists "Anyone can insert results" on public.results;
drop policy if exists "Anyone can update results" on public.results;
drop policy if exists "Anyone can delete results" on public.results;

-- 5. Grants: anon may read the table + call the gated RPCs (which enforce the passcode).
grant execute on function public.verify_commissioner(text) to anon, authenticated;
grant execute on function public.set_result(smallint, smallint, smallint, text) to anon, authenticated;
grant execute on function public.clear_result(smallint, text) to anon, authenticated;
