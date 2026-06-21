// ============================================================
// Selectors for the manual post-90 adjustments (see data/postNinety.js).
// Pure helpers — they read the itemized list and never mutate the
// competition config or the scoring engine.
// ============================================================
import postNinety from "../data/postNinety.js";

/**
 * Merge a base { name: pts } adjustments map with the itemized post-90
 * events, returning a NEW map. Used at the standings call site so the
 * engine output stays authoritative while these extra points are layered on.
 */
export function mergeAdjustments(base = {}, extra = postNinety) {
  const out = { ...base };
  for (const e of extra) out[e.player] = (out[e.player] || 0) + (e.pts || 0);
  return out;
}

/** All post-90 entries for one player (empty array if none). */
export function postNinetyFor(player, extra = postNinety) {
  return extra.filter((e) => e.player === player);
}

/** All post-90 entries for one game number. */
export function postNinetyForGame(gameNo, extra = postNinety) {
  return extra.filter((e) => e.game === gameNo);
}

/** Total post-90 points awarded to a player. */
export function postNinetyTotal(player, extra = postNinety) {
  return postNinetyFor(player, extra).reduce((s, e) => s + (e.pts || 0), 0);
}
