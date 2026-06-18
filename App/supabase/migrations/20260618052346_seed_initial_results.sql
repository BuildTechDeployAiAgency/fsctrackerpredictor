-- Migration: seed initial results
-- Description: Backfill the 21 results already recorded in src/data/wc2026.js
-- so the shared board starts identical to the local app. ON CONFLICT DO NOTHING
-- keeps this safe to re-run and never overwrites a live edit.

insert into public.results (game_no, home, away) values
  (1,2,0),(2,2,1),(3,1,1),(4,4,1),(5,1,1),(6,1,1),(7,0,1),(8,2,0),(9,7,1),(10,2,2),
  (11,1,0),(12,5,1),(13,0,0),(14,1,1),(15,1,1),(16,2,2),(17,3,1),(18,1,4),(19,3,0),(20,3,1),
  (21,1,1)
on conflict (game_no) do nothing;
