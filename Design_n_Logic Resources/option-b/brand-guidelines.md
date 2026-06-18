# Pundit — Brand & Landing Design (Option B)

**Direction codename: "The Sports Almanac"**

An editorial, print-inspired identity. Pundit looks less like a glowing crypto dashboard and more like the back page of a great sports newspaper crossed with a numbers-running betting slip — warm paper stock, heavy ink headlines, condensed athletic type, one loud accent. Confident, tactile, and human. It deliberately rejects the dark-glass, violet-glow SaaS look in favour of something with **light, editorial altitude** and the texture of physical sports culture.

> This is Option B. It is built to stand clearly apart from a violet-on-dark "modern app" look (Option A). Where that direction is night-mode, neon, and screen-native, this one is daylight, ink-on-paper, and editorial.

---

## How this differs from a violet-on-dark look

| Dimension | Violet-dark (Option A) | Pundit Almanac (Option B) |
|---|---|---|
| Base canvas | Near-black / charcoal, dark mode default | Warm bone/cream paper, light-first |
| Accent family | Violet + cyan glow, gradients, neon | Single bold vermillion + ink black, flat |
| Type altitude | Geometric sans, techy, neutral | Condensed athletic display + editorial serif numerals |
| Texture | Glassmorphism, blur, glow | Paper grain, hairline rules, ticket perforation, halftone |
| Mood | Futuristic, calm, premium-tech | Loud, human, competitive, print-journalism |

---

## Palette (named hex roles)

Light-first. WCAG AA verified for the body/heading pairings noted.

| Role | Name | Hex | Use |
|---|---|---|---|
| `--bone` | Bone | `#F4EFE6` | Primary page background (warm paper) |
| `--ink` | Ink | `#161412` | Headlines, body text, primary surfaces (near-black, warm) |
| `--vermillion` | Vermillion | `#E63920` | The single signature accent — CTAs, scores, the "live" pulse, winning rank |
| `--field` | Field Green | `#0B5D3B` | Secondary accent — used sparingly for "up / correct / win" data states |
| `--gold` | Trophy Gold | `#C9982E` | Leader / 1st-place highlight, medal accents |
| `--slate` | Newsprint Slate | `#6B6256` | Muted captions, secondary text, hairline rules |

Supporting tints (derived, not separate brand colours): `--bone-2 #EDE6D8` (card recesses), `--ink-90 rgba(22,20,18,.9)` (footer).

Contrast notes: Ink `#161412` on Bone `#F4EFE6` ≈ 14:1 (AAA). Bone on Ink ≈ 14:1. Vermillion `#E63920` on Bone ≈ 4.0:1 — used for large/bold UI and accents only, never small body text; small text on vermillion uses Bone (AA large). Field Green and Gold are paired with Bone or Ink only at large sizes / bold weight.

---

## Type system (real Google Fonts)

- **Display / headlines — `Archivo Expanded`** (or `Archivo` at heavy weights). Wide, athletic, scoreboard-loud. Used for hero lines, section kickers, big numbers' labels. Set in heavy weights (700–900), tight leading, generous tracking on small caps kickers.
- **Body / UI — `Inter`**. Neutral, legible workhorse for paragraphs, nav, controls, helper text. Keeps the editorial display from feeling costume-y and keeps data tables clean.
- **Utility / data — `Roboto Mono`** (tabular). All scores, points, ranks, and prediction cells use mono **tabular figures** so columns never jitter as values change — critical for a live leaderboard. Also used for the "betting-slip" metadata (game numbers, kickoff times, odds-style tags).

Pairing logic: an expanded grotesque shouting the headlines, a quiet humanist sans carrying the reading load, and a monospace giving the data a tactile, ticket-printed precision. Three distinct jobs, no overlap.

---

## Layout concept

A **broadsheet grid**. Wide editorial column structure with strong hairline rules (1px ink/slate) dividing sections like a newspaper page. Big condensed headlines sit against generous bone whitespace. Section "kickers" (small-caps mono labels like `LIVE STANDINGS / WEEK 03`) sit above headlines like a newspaper section masthead. Cards read like **betting slips / box scores**: ruled rows, perforated top edge, mono data right-aligned, the leader's row flagged in vermillion/gold. Mobile collapses the broadsheet to a single stacked column but keeps the ruled-row rhythm.

## The single signature element

**The perforated ticket / box-score row.** Every piece of product UI — the leaderboard card, the match-prediction row — is rendered as a printed slip: a dashed perforation edge at the top, hairline-ruled rows, mono tabular numbers, and a vermillion accent stripe on the active/leading row. It's the through-line that says "this is a pool, your slip, your numbers" and it's instantly recognizable and ownable. No other prediction app looks like a printed betting slip rendered in editorial paper stock.

---

## Voice & tone

Wry, confident, knows its sport — the friend who calls the upset before kickoff and won't let you forget it. Short. Punchy. A little trash-talk, never mean. Numbers do the bragging.

## Sample UI copy

- Hero headline: **"Call it. Score it. Never let them forget it."**
- Sub: "Pundit runs your prediction pool by *your* house rules. Pick the scores, call the upsets, settle who actually knows ball."
- Empty leaderboard: "No slips in yet. First pick goes on the record."
- Live tag / CTA: "Lock your picks before kickoff →"
