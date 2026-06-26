# Updating results — how the board actually gets new scores

**Short version:** results are entered **manually**. There is **no automatic job**
that fetches finished matches and updates the app. If nobody enters a score, the
board never moves. This doc is the reliable way to do it.

## Why "it wasn't updating"

There is no scheduler anywhere in this project — not in GitHub Actions, not in
Vercel (`vercel.json` has no `crons`), not in Supabase (no `pg_cron`/edge
function), and not in any "Claude in the cloud" job. The data flow is:

```
commissioner enters a score  ──▶  Supabase `results` table  ──▶  realtime push  ──▶  all 27 phones update live
```

The score only enters at the first step, and only a human does that step today.

## Path A — enter a score in the app (simplest)

1. Open the live app: https://fsctrackerpredictor.vercel.app
2. Confirm the badge top-right says **LIVE** (not `LOCAL`). `LOCAL` means the
   shared backend is off for that device — see "Production checklist" below.
3. Go to **Games** → find the fixture → **Set result / Edit** → type the score.
4. It saves to Supabase and every phone updates within a second.

> If you're not logged in as commissioner, the app prompts for the commissioner
> passcode first. Writes are rejected server-side without it.

## Path B — publish via GitHub Actions (reliable, logged)

Use this when you're not on the phone, or want an audit trail.

1. Repo → **Actions** tab → **Publish match result** → **Run workflow**.
2. Fill: `mode = set`, `game_no`, `home`, `away` → **Run**.
3. To remove a score: `mode = clear` + `game_no`.

It calls the same commissioner-gated RPC as the app, so the board updates live.

### One-time setup for Path B

Add three repo secrets (**Settings → Secrets and variables → Actions**):

| Secret | Value |
|---|---|
| `SUPABASE_URL` | `https://YOUR-REF.supabase.co` |
| `SUPABASE_ANON_KEY` | the anon/publishable key (never the service_role key) |
| `COMMISSIONER_PASSCODE` | the commissioner passcode |

## Production checklist (run this if scores aren't sharing)

The code path is correct; problems are almost always config:

- [ ] **Vercel env vars set** — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
      `VITE_APP_PASSCODE` in the Vercel project. Missing → app runs `LOCAL`,
      edits stay on one phone. (Fix, then redeploy — Vite inlines env at build.)
- [ ] **Commissioner passcode set in the DB** — the default seeded passcode is a
      random UUID hash nobody knows; until it's set via migration
      `set_commissioner_passcode`, every write is rejected as unauthorized.
- [ ] **Migrations applied** to the live Supabase project, including
      `create_results_table` (which runs `alter publication supabase_realtime add
      table public.results` — without it, edits save but phones don't live-update
      until reload).

## game_no mapping

`game_no` is `games[].n` in `App/src/data/wc2026.js` (1–72 group stage, up to 104
for the full tournament). Open that file to match a fixture to its number.

## Note on automation (deferred)

We chose to keep results manual for now. A scheduled auto-updater was considered
but not built: the fixture list here is the pool's custom predicted draw, so
mapping a live football-API feed onto these game numbers is error-prone and would
need careful, per-match verification. Revisit only if manual entry becomes a
burden.
