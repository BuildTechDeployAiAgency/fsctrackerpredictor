# Fadi's World Cup Pool 2026 — project guide

## Session-start protocol (do this first, every new session)
1. **Read `Documentation/HANDOFF.md`** if it exists — it's the latest detailed session handoff (exact next step, open questions, recent decisions). It is gitignored/local.
2. Project **memory** auto-loads (`MEMORY.md` index in the project memory dir). Trust it for state: live URL, Supabase refs, what's built, roadmap.
3. **Caveman mode** is active automatically (SessionStart hook) — respond terse. Code/commits/security: write normal.
4. The feature **showcase + F-IDs** live in `Documentation/proposed-features.html`; the working plan is `~/.claude/plans/okay-great-start-so-melodic-sunbeam.md`.

## What this is
Mobile-first React 18 + Vite web app for a 27-player friends' WC2026 prediction pool. App lives in `App/`. Live at https://fsctrackerpredictor.vercel.app (Vercel git auto-deploy from GitHub `BuildTechDeployAiAgency/fsctrackerpredictor`, push to `main`). Shared results via Supabase (commissioner-locked), landing + passcode/name gate.

## Hard rules (do not break)
1. Never change scoring logic (`App/src/lib/scoring.js`) or the existing exports of the data (`App/src/data/wc2026.js`). Add selectors / new data files instead. Standings must stay identical (Fadi C #1 = 49, Diogo #15).
2. Keep the "Fadi" branding + credit line + roster.
3. Mobile-first, web only. No native. No horizontal overflow at 360px.
4. Keep it simple — match the minimal stack. No router lib (extend the `tab` useState). Keep the "Sports Almanac" design (tokens + `.slip`/`.perf` cards, Archivo/Inter/Roboto-Mono, vermillion accent, light-first).

## Run / ship
- `cd App && pnpm install && pnpm run dev` (localhost:5173) · `pnpm run build`.
- Deploy: commit + push `main` → Vercel auto-deploys (build config in root `vercel.json`, builds `App/` with npm).
- Verify in-browser with claude-in-chrome; check standings unchanged + 360px overflow before shipping.

## Secrets (never commit)
Live in gitignored `App/.env` + Vercel env vars. Member entry passcode + commissioner passcode are recorded in project memory, not here.
