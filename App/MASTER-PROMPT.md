# Master Kickoff Prompt — Fadi's World Cup Pool (friends app)

> Paste everything between the lines below into a **new Claude Code session** opened in this folder
> (after you've extracted it into its own directory and run `git init`).

---

You are picking up a standalone web app: **Fadi's World Cup Pool 2026** — a small, mobile-first prediction-pool tracker for a private group of friends following the 2026 World Cup. This is a **separate project** from a larger startup called "Pundit"; ignore Pundit — everything you need is in this folder.

## What this app is
- A 30-year friends' tradition: 27 players each predicted the scoreline of every World Cup match. Points are scored against real results, and a live leaderboard ranks everyone.
- It is intentionally **simple**: mobile-first, **web only (no native app)**, React + Vite, no backend yet (results persist in `localStorage`).
- It already works end-to-end with real data. Your job is to extend/polish it and (when asked) add a shared backend — **not** to rebuild it.

## Hard rules — do not break these
1. **Never change the scoring logic or the data.** `src/lib/scoring.js` (the engine) and `src/data/wc2026.js` (players, fixtures, all predictions, results, scoring tiers, manual adjustments, tiebreak order) are copied **verbatim** from the original and must produce **identical** standings. If you need new derived values, add a selector — don't edit the engine's math or the data.
2. **Keep the "Fadi" branding.** This is literally Fadi's pool. App name "Fadi's World Cup Pool 2026", the credit line, the roster names — all stay.
3. **Mobile-first, web only.** No React Native / Expo / native builds. Plain responsive web. Test layouts down to 360px wide.
4. **Keep it simple.** No heavy frameworks, no router library unless truly needed, no premature backend. Match the existing minimal stack.

## Current state (already built)
- **Stack:** React 18 + Vite 5. Entry `src/main.jsx` → `src/App.jsx`. Styles in `src/styles.css`.
- **Four tabs** (bottom nav): **Table** (live standings; tap a name to set it as "you"), **Games** (all 72 fixtures; enter/edit a result inline → everyone's points recompute; "All picks" expands all 27 predictions for a game), **Players** (pick anyone → their rank, totals, scored picks), **Rules** (the house rule book).
- **Persistence:** results edits save to `localStorage` (per device). No shared/live state yet.
- Verified: builds clean (`npm run build`), renders correctly, no horizontal overflow at 360px. Standings match the source data exactly (e.g. Fadi C = 49 pts, Diogo #15).

## Design system — "Sports Almanac" (keep this identity)
Editorial print look: warm paper stock, one loud vermillion accent, condensed athletic headlines, mono tabular data, "betting-slip" cards with a perforated top edge. Light-first (NOT dark mode). Tokens (already in `src/styles.css` `:root`):

- **Colours:** `--bone #F4EFE6` (page bg, warm paper) · `--bone-2 #EDE6D8` (card recess) · `--ink #161412` (text/headlines) · `--vermillion #E63920` (the single accent: CTAs, leader row, live pulse) · `--field #0B5D3B` (correct/up data state) · `--gold #C9982E` (1st place / medals) · `--slate #6B6256` (muted text, hairline rules).
- **Type (Google Fonts, already linked in `index.html`):** **Archivo Expanded** (900) for display/headlines, uppercase, tight leading. **Inter** (400–700) for body/UI. **Roboto Mono** (tabular figures) for **all** numbers — scores, points, ranks — so columns never jitter.
- **Signature element:** the **perforated betting-slip card** (`.slip` + `.perf` in CSS) — dashed/punched top edge, hairline-ruled rows, mono right-aligned numbers, vermillion stripe on the active/leading row. Use it for any new card UI.
- Voice: wry, confident, knows ball; numbers do the bragging. Short and punchy.

## Architecture
```
src/
  main.jsx            React entry
  App.jsx             all UI: 4 tabs + components (Board, Games, GameCard, Players, Rules)
  styles.css          the Sports Almanac theme (tokens + slip/row/match/tile/rules/tabbar)
  lib/scoring.js      engine — VERBATIM, do not modify
  data/wc2026.js      competition config — VERBATIM, do not modify
  data/index.js       getCompetition()
index.html            Google Fonts + #root
```
Data shape: `{ meta, players, games, results, scoring, rules }`. `games[n].p[i]` = `players[i]`'s `[home,away]` prediction. `results = { [gameNo]: [home,away] }` is the only mutable table. Engine: `buildStandings(comp, results)` → ranked rows; `scoreOne(pred, actual, tiers)` → `{pts, tier}`.

## Roadmap (suggested order — confirm with me before big changes)
1. **Shared live results via Supabase** (the big one). Right now each phone has its own `localStorage` results. Make one shared board: create a Supabase project (its OWN, unrelated to anything else), put the `results` object in a single table (`{ game_no, home, away }`), read it on load + subscribe to realtime, and write on edit. Optionally a light "commissioner" gate so only one person enters results. **Only `results` moves to the DB — players/games/predictions stay in the config file.**
2. **Match polish:** team **flags/crests** on fixtures; split Games into **Today / Past / Upcoming** sections; date grouping.
3. **Knockout stage:** the data is group-stage (72 games) only; add knockout fixtures to `data/wc2026.js` when they're known (same shape, no engine change).
4. **Nice-to-haves:** a "you vs them" compare on a game, share-a-screenshot of the table, simple deploy (Vercel/Netlify static — `npm run build` → `dist/`).

## How to run
```bash
npm install      # or pnpm install
npm run dev      # http://localhost:5173
npm run build    # production static build → dist/
```

## First thing to do
Read `README.md`, then `src/App.jsx` and `src/styles.css` to learn the patterns, run `npm run dev`, and confirm the app loads with the table showing Fadi C in 1st. Then ask me what to tackle first (likely the Supabase shared-results step). Do not start large changes without checking in.

---
