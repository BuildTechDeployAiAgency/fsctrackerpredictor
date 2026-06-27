// ============================================================
// Validate our standings against the live "FSC Cup" tracker
// (soccergurus.netlify.app), which is the commissioner's source of truth.
//
//   node App/scripts/validate-vs-gurus.mjs
//
// What it does:
//  1. Pulls the live results + adjustments from the tracker's Firebase doc
//     (public read; same data the tracker's own UI loads).
//  2. Runs OUR scoring engine on those results + adjustments and prints the
//     board. Because our players/predictions/scoring are byte-identical to the
//     tracker's, this board equals what the tracker shows.
//  3. If Supabase creds are present (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY),
//     fetches THIS app's live results and reports any game where they diverge
//     from the tracker — i.e. what still needs seeding.
//
// Never mutates anything. Read-only validation.
// ============================================================
import { buildStandings, gamesPlayed } from "../src/lib/scoring.js";
import comp from "../src/data/wc2026.js";

const FB_PROJECT = "world-cup-2026-pool-52315";
const FB_KEY = "AIzaSyDr22J2U32cVBcbHLTMNipNvJ3qNE455qg"; // public web API key (read-only doc)
const FB_DOC = `https://firestore.googleapis.com/v1/projects/${FB_PROJECT}/databases/(default)/documents/appstate/fsc26data?key=${FB_KEY}`;

async function fetchGurus() {
  const res = await fetch(FB_DOC);
  if (!res.ok) throw new Error(`Firebase HTTP ${res.status}`);
  const doc = await res.json();
  const sv = (k) => JSON.parse(doc.fields[k].stringValue);
  const results = sv("results");
  const adjRaw = sv("adjustments");
  const adj = {};
  for (const [name, arr] of Object.entries(adjRaw))
    adj[name] = arr.reduce((s, a) => s + (a.pts || 0), 0);
  return { results, adj };
}

async function fetchOurSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/results?select=game_no,home,away`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`Supabase HTTP ${res.status}`);
  const rows = await res.json();
  const out = {};
  for (const r of rows) out[r.game_no] = [Number(r.home), Number(r.away)];
  return out;
}

const { results, adj } = await fetchGurus();
const liveComp = { ...comp, scoring: { ...comp.scoring, adjustments: adj } };
const standings = buildStandings(liveComp, results);

console.log(`Tracker results: ${gamesPlayed(results)} games`);
console.log(`Tracker adjustments: ${JSON.stringify(adj)}\n`);
console.log("RANK  PTS  EX  RES  BON  PLAYER");
for (const r of standings)
  console.log(
    String(r.rank).padStart(3), String(r.pts).padStart(5),
    String(r.byTier.exact || 0).padStart(3), String(r.byTier.result || 0).padStart(4),
    String(r.bonus || 0).padStart(4), "  " + r.name
  );

const ours = await fetchOurSupabase().catch((e) => { console.error("\nSupabase check failed:", e.message); return null; });
if (!ours) {
  console.log("\n(No Supabase creds in env — skipped this-app comparison. Set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY to compare.)");
} else {
  const diffs = [];
  const allNos = new Set([...Object.keys(results), ...Object.keys(ours)].map(Number));
  for (const n of [...allNos].sort((a, b) => a - b)) {
    const g = results[n], o = ours[n];
    const gs = g ? g.join("-") : "—", os = o ? o.join("-") : "—";
    if (gs !== os) diffs.push(`  game ${n}: tracker ${gs} | this app ${os}`);
  }
  if (!diffs.length) console.log("\n✅ This app's Supabase results MATCH the tracker exactly.");
  else { console.log(`\n⚠️ ${diffs.length} game(s) differ (apply the seed migration to fix):`); console.log(diffs.join("\n")); }
}
