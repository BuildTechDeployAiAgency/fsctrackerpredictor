// ============================================================
// Group-stage standings selector (F09). Pure, derived view — reads the
// fixtures (with their `grp`) and the entered `results` and produces the
// live A–L tables. Does NOT touch the prediction scoring engine; this is
// real football table math (3/1/0), independent of player points.
//
// results shape: { [gameNo]: [homeGoals, awayGoals] }
// ============================================================

const blankRow = (team) => ({
  team, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, Pts: 0,
});

// Build ordered group tables from games + entered results.
// Returns: [{ grp, rows: [ {team,P,W,D,L,GF,GA,GD,Pts}... ] }, ...]
// sorted by group letter, rows sorted Pts → GD → GF → team name.
export function buildGroups(games, results) {
  const groups = new Map(); // grp -> Map(team -> row)

  for (const g of games) {
    if (!g.grp) continue;
    if (!groups.has(g.grp)) groups.set(g.grp, new Map());
    const tbl = groups.get(g.grp);
    if (!tbl.has(g.h)) tbl.set(g.h, blankRow(g.h));
    if (!tbl.has(g.a)) tbl.set(g.a, blankRow(g.a));

    const res = results[g.n];
    if (!res) continue; // unplayed — team listed but no stats added

    const [hg, ag] = res;
    const home = tbl.get(g.h);
    const away = tbl.get(g.a);

    home.P++; away.P++;
    home.GF += hg; home.GA += ag;
    away.GF += ag; away.GA += hg;

    if (hg > ag) { home.W++; home.Pts += 3; away.L++; }
    else if (hg < ag) { away.W++; away.Pts += 3; home.L++; }
    else { home.D++; away.D++; home.Pts++; away.Pts++; }
  }

  const out = [];
  for (const [grp, tbl] of groups) {
    const rows = [...tbl.values()];
    for (const r of rows) r.GD = r.GF - r.GA;
    rows.sort((a, b) =>
      b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF || a.team.localeCompare(b.team)
    );
    out.push({ grp, rows });
  }
  out.sort((a, b) => a.grp.localeCompare(b.grp));
  return out;
}

export default buildGroups;
