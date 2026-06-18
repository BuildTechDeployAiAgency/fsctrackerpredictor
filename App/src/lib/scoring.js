// ============================================================
// Scoring engine — sport- and competition-agnostic.
// Copied VERBATIM from the original pool app so the calculations
// (standings, points, tiebreaks) are identical. No house rule is
// hard-coded here; everything comes from the competition config.
// ============================================================

export function sign(h, a) {
  return h === a ? 0 : h > a ? 1 : -1;
}

/**
 * Score a single prediction against a result using the competition's tiers.
 * Tiers are evaluated in order; the FIRST match wins (highest value first).
 *
 * Each tier: { id, pts, test(pred, actual) => boolean }
 * Built-in test ids you can reference by string: "exact", "result".
 * Or pass a custom test function for bespoke rules.
 */
const BUILTIN_TESTS = {
  exact: (p, a) => p[0] === a[0] && p[1] === a[1],
  result: (p, a) => sign(p[0], p[1]) === sign(a[0], a[1]),
};

export function scoreOne(pred, actual, tiers) {
  for (const tier of tiers) {
    const test = typeof tier.test === "function" ? tier.test : BUILTIN_TESTS[tier.id];
    if (test && test(pred, actual)) return { pts: tier.pts, tier: tier.id };
  }
  return { pts: 0, tier: "miss" };
}

/**
 * Build the full standings.
 * @param {object} comp  competition config (players, games, scoring)
 * @param {object} results { [gameNumber]: [homeGoals, awayGoals] }
 */
export function buildStandings(comp, results) {
  const { players, games, scoring } = comp;
  const tiers = scoring.tiers;
  const adjust = scoring.adjustments || {};
  const seed = scoring.tiebreakSeed || players;
  const seedIdx = (name) => {
    const i = seed.indexOf(name);
    return i === -1 ? 9999 : i;
  };

  const rows = players.map((name, i) => ({
    name,
    i,
    pts: adjust[name] || 0,
    bonus: adjust[name] || 0,
    played: 0,
    byTier: {}, // { exact: n, result: n, ... }
  }));

  for (const g of games) {
    const res = results[g.n];
    if (!res) continue;
    players.forEach((_, i) => {
      const s = scoreOne(g.p[i], res, tiers);
      rows[i].pts += s.pts;
      rows[i].played += 1;
      rows[i].byTier[s.tier] = (rows[i].byTier[s.tier] || 0) + 1;
    });
  }

  rows.sort(
    (x, y) =>
      y.pts - x.pts ||
      (y.byTier.exact || 0) - (x.byTier.exact || 0) ||
      seedIdx(x.name) - seedIdx(y.name)
  );
  rows.forEach((r, idx) => (r.rank = idx + 1));
  return rows;
}

/** Convenience: count of games that have a result entered. */
export function gamesPlayed(results) {
  return Object.keys(results || {}).length;
}
