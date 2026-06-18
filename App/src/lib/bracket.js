// ============================================================
// Knockout bracket resolver (F08). Pure, display-only. Given the group
// tables (from ./groups.js) and the knockout STRUCTURE (../data/knockout.js),
// resolve each slot to a concrete team where it is known, otherwise hand the
// UI a human label and a `tbd` flag. No scoring — there are no stored
// knockout results or predictions.
// ============================================================

const GAMES_PER_GROUP = 6;

// A group is "decided" only when all six of its matches have results in.
function groupComplete(grp, games, results) {
  let played = 0;
  for (const g of games) {
    if (g.grp === grp && results[g.n]) played++;
  }
  return played >= GAMES_PER_GROUP;
}

// groups: output of buildGroups(games, results) — [{grp, rows:[...]}]
function groupRow(groups, grp, pos) {
  const grpObj = groups.find((x) => x.grp === grp);
  return grpObj ? grpObj.rows[pos - 1] : null;
}

// Resolve a single slot ref → { team|null, label, tbd }
function resolveSlot(slot, ctx) {
  const { groups, games, results } = ctx;

  if (slot.g) {
    const label = `${slot.g}${slot.pos}`; // e.g. "A1", "B2"
    if (groupComplete(slot.g, games, results)) {
      const row = groupRow(groups, slot.g, slot.pos);
      if (row) return { team: row.team, label, tbd: false };
    }
    return { team: null, label, tbd: true };
  }

  if (slot.third) {
    // Best-thirds assignment needs every group decided + the FIFA combination
    // table; until then this stays a labelled placeholder showing candidates.
    return { team: null, label: `3rd · ${slot.third.join("/")}`, tbd: true };
  }

  if (slot.w) return { team: null, label: `Winner ${slot.w}`, tbd: true };
  if (slot.r) return { team: null, label: `Loser ${slot.r}`, tbd: true };

  return { team: null, label: "TBD", tbd: true };
}

// Resolve the whole bracket. Returns the same round/match shape with each
// match carrying resolved { h, a } slot objects.
export function resolveBracket(knockout, groups, games, results) {
  const ctx = { groups, games, results };
  return knockout.map((round) => ({
    id: round.id,
    title: round.title,
    matches: round.matches.map((m) => ({
      n: m.n,
      d: m.d,
      venue: m.venue,
      h: resolveSlot(m.h, ctx),
      a: resolveSlot(m.a, ctx),
    })),
  }));
}

// How many group slots are filled vs total — for a progress hint in the UI.
export function bracketProgress(resolved) {
  let filled = 0, total = 0;
  for (const round of resolved) {
    for (const m of round.matches) {
      for (const s of [m.h, m.a]) {
        total++;
        if (s.team) filled++;
      }
    }
  }
  return { filled, total };
}

export default resolveBracket;
