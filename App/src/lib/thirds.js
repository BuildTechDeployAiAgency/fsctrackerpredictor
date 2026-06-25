// ============================================================
// Best third-placed teams selector. Pure, derived view layered on top
// of buildGroups() — does NOT touch the prediction scoring engine.
//
// WC2026 format: 12 groups (A–L). The top two of each group plus the
// EIGHT best third-placed teams advance to the Round of 32.
//
// Ranking of the twelve third-placed teams (FIFA order):
//   Pts → GD → GF → (fair play / draw of lots — not modelled) → name.
// Top `qualCount` (default 8) qualify; the rest are eliminated.
// ============================================================

// Take pre-sorted group tables (from buildGroups) and return the ranked
// third-placed teams. Each entry: { grp, ...row, played, rank, qualified }.
export function bestThirds(groups, qualCount = 8) {
  const thirds = [];
  for (const { grp, rows } of groups) {
    const r = rows[2]; // 3rd row in an already-sorted group table
    if (!r) continue;  // group has < 3 teams entered (shouldn't happen at WC)
    thirds.push({ grp, ...r });
  }

  thirds.sort((a, b) =>
    b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF || a.team.localeCompare(b.team)
  );

  return thirds.map((t, i) => ({
    ...t,
    rank: i + 1,
    qualified: i < qualCount && t.P > 0, // only "in" once they've actually played
  }));
}

export default bestThirds;
