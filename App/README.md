# Fadi's World Cup Pool 2026

A simple, **mobile-first web app** for the friends' World Cup prediction pool. Self-contained, no backend — open it, track the games, watch the table move.

This folder is **standalone**: copy it out of the parent directory and start a brand-new project/git repo from it. It shares nothing with the Pundit startup app.

## What's inside (and what's identical to the original)
- **`src/lib/scoring.js`** — the scoring engine, copied **verbatim** from the original pool app. Same calculations (exact = 5, result = 3, manual bonuses, tiebreaks).
- **`src/data/wc2026.js`** — the original Fadi data, **byte-identical**: all 27 players, 72 group fixtures with everyone's predictions, results so far, scoring tiers, manual adjustments, and the official tiebreak order.
- **`src/App.jsx` + `src/styles.css`** — the only new part: a 4-tab UI (Table / Games / Players / Rules) in the **"Sports Almanac"** theme (warm paper, vermillion accent, condensed display + mono data, perforated betting-slip cards).

Because the engine and data are unchanged, the standings/points are **identical** to the original by construction.

## Run it
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve the built dist/
```

## How it works
- **Table** — live standings; tap a name to set it as "you" (highlighted).
- **Games** — all 72 fixtures. Tap **Set result / Edit** to enter a scoreline; everyone's points recompute instantly. **All picks** expands to show all 27 predictions for that game.
- **Players** — pick anyone to see their rank, totals, and every scored prediction.
- **Rules** — the full house rule book.

Results you enter are saved in your browser (**localStorage**) — they persist on this device across reloads. They are **not shared** between phones yet.

## Next step (optional): make it shared
Right now each person has their own local copy of results. To make one live shared board for the whole group, add a tiny backend later (e.g. **Supabase**): move the `results` object into a single table and read/write it. The engine and data files don't change — only where `results` comes from. That's the one and only piece to wire up.

## Stack
React 18 + Vite 5. No router, no state library, no backend. Mobile-first responsive.
