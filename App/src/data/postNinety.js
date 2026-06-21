// ============================================================
// Manual post-90 adjustments — rare house rules the scoring engine
// cannot derive from a stored final score.
//
//   +1 "90:00 heartbreak": you had the EXACT score at the 90:00 mark,
//       then a stoppage/injury-time goal changed the final result.
//   +2 "knockout outcome" (knockout games only): the tie was decided
//       in extra time or on penalties — your 90' result was wrong but
//       you correctly called the team that advanced.
//
// The nightly results routine only FLAGS candidate games in its run
// summary (it never applies these). A human commissioner decides and
// records them here. These are MERGED into the standings adjustments at
// the call site in App.jsx — `scoring.js` and `wc2026.js` are never
// touched, so an empty list keeps standings identical to the pure
// engine output.
//
// Each entry:
//   { game: <gameNo>, player: "<exact roster name>", pts: 1 | 2,
//     type: "heartbreak" | "outcome", note: "<short reason>" }
// ============================================================
export const postNinety = [];

export default postNinety;
