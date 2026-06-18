// ============================================================
// Knockout bracket STRUCTURE (F08), transcribed verbatim from the master
// Excel "R2 to finals" sheet (games 73–104) — the authoritative bracket
// for this pool. NEW data file; the group-stage `games`/`results` exports
// in wc2026.js are untouched.
//
// Slot reference grammar (resolved at render time by ../lib/bracket.js):
//   { g: "A", pos: 1 }      → winner (pos 1) / runner-up (pos 2) of Group A
//   { third: ["A","B",...] }→ a best-third placed team from one of these
//                             candidate groups (FIFA combination slot)
//   { w: 73 }               → winner of match 73
//   { r: 101 }              → loser/runner of match 101 (feeds 3rd-place game)
//
// Display-only: there are no stored knockout match results or predictions,
// so group slots fill from completed groups and everything downstream shows
// as TBD until the bracket is played.
// ============================================================

export const knockout = [
  {
    id: "r32", title: "Round of 32",
    matches: [
      { n: 73, d: "2026-06-28", venue: "Los Angeles",  h: { g: "A", pos: 2 }, a: { g: "B", pos: 2 } },
      { n: 74, d: "2026-06-29", venue: "Houston",      h: { g: "C", pos: 1 }, a: { g: "F", pos: 2 } },
      { n: 75, d: "2026-06-29", venue: "Boston",       h: { g: "E", pos: 1 }, a: { third: ["A","B","C","D","F"] } },
      { n: 76, d: "2026-06-30", venue: "Monterrey",    h: { g: "F", pos: 1 }, a: { g: "C", pos: 2 } },
      { n: 77, d: "2026-06-30", venue: "Dallas",       h: { g: "E", pos: 2 }, a: { g: "I", pos: 2 } },
      { n: 78, d: "2026-07-01", venue: "New York NJ",  h: { g: "I", pos: 1 }, a: { third: ["C","D","F","G","H"] } },
      { n: 79, d: "2026-07-01", venue: "Mexico City",  h: { g: "A", pos: 1 }, a: { third: ["C","E","F","H","I"] } },
      { n: 80, d: "2026-07-01", venue: "Atlanta",      h: { g: "L", pos: 1 }, a: { third: ["E","H","I","J","K"] } },
      { n: 81, d: "2026-07-01", venue: "Seattle",      h: { g: "G", pos: 1 }, a: { third: ["A","E","H","I","J"] } },
      { n: 82, d: "2026-07-02", venue: "San Francisco", h: { g: "D", pos: 1 }, a: { third: ["B","E","F","I","J"] } },
      { n: 83, d: "2026-07-02", venue: "Los Angeles",  h: { g: "H", pos: 1 }, a: { g: "J", pos: 2 } },
      { n: 84, d: "2026-07-03", venue: "Toronto",      h: { g: "K", pos: 2 }, a: { g: "L", pos: 2 } },
      { n: 85, d: "2026-07-03", venue: "Vancouver",    h: { g: "B", pos: 1 }, a: { third: ["E","F","G","I","J"] } },
      { n: 86, d: "2026-07-03", venue: "Dallas",       h: { g: "D", pos: 2 }, a: { g: "G", pos: 2 } },
      { n: 87, d: "2026-07-04", venue: "Miami",        h: { g: "J", pos: 1 }, a: { g: "H", pos: 2 } },
      { n: 88, d: "2026-07-04", venue: "Kansas City",  h: { g: "K", pos: 1 }, a: { third: ["D","E","I","J","L"] } },
    ],
  },
  {
    id: "r16", title: "Round of 16",
    matches: [
      { n: 89, d: "2026-07-04", venue: "Houston",      h: { w: 73 }, a: { w: 76 } },
      { n: 90, d: "2026-07-05", venue: "Philadelphia", h: { w: 75 }, a: { w: 78 } },
      { n: 91, d: "2026-07-05", venue: "New York NJ",  h: { w: 74 }, a: { w: 77 } },
      { n: 92, d: "2026-07-06", venue: "Mexico City",  h: { w: 79 }, a: { w: 80 } },
      { n: 93, d: "2026-07-06", venue: "Dallas",       h: { w: 84 }, a: { w: 83 } },
      { n: 94, d: "2026-07-07", venue: "Seattle",      h: { w: 82 }, a: { w: 81 } },
      { n: 95, d: "2026-07-07", venue: "Atlanta",      h: { w: 87 }, a: { w: 86 } },
      { n: 96, d: "2026-07-07", venue: "Vancouver",    h: { w: 85 }, a: { w: 88 } },
    ],
  },
  {
    id: "qf", title: "Quarter-finals",
    matches: [
      { n: 97,  d: "2026-07-09", venue: "Boston",      h: { w: 90 }, a: { w: 89 } },
      { n: 98,  d: "2026-07-10", venue: "Los Angeles", h: { w: 93 }, a: { w: 94 } },
      { n: 99,  d: "2026-07-11", venue: "Miami",       h: { w: 91 }, a: { w: 92 } },
      { n: 100, d: "2026-07-11", venue: "Kansas City", h: { w: 95 }, a: { w: 96 } },
    ],
  },
  {
    id: "sf", title: "Semi-finals",
    matches: [
      { n: 101, d: "2026-07-14", venue: "Dallas",  h: { w: 97 }, a: { w: 98 } },
      { n: 102, d: "2026-07-15", venue: "Atlanta", h: { w: 99 }, a: { w: 100 } },
    ],
  },
  {
    id: "third", title: "Third-place play-off",
    matches: [
      { n: 103, d: "2026-07-18", venue: "Miami", h: { r: 101 }, a: { r: 102 } },
    ],
  },
  {
    id: "final", title: "Final",
    matches: [
      { n: 104, d: "2026-07-19", venue: "New York NJ", h: { w: 101 }, a: { w: 102 } },
    ],
  },
];

export default knockout;
