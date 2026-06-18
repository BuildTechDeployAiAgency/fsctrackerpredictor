import { useEffect, useMemo, useRef, useState } from "react";
import { getCompetition } from "./data/index.js";
import { buildStandings, scoreOne, gamesPlayed } from "./lib/scoring.js";
import { isShared, fetchResults, upsertResult, deleteResult, subscribeResults } from "./lib/supabase.js";

const comp = getCompetition();
const TOTAL = comp.meta.totalGames || comp.games.length;
const TIERS = comp.scoring.tiers;

// ---- tiny helpers ----
const crest = (team) => team.replace(/[^A-Za-z ]/g, "").slice(0, 3).toUpperCase();
const fmtDate = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";
const LS = {
  results: "fwc_results",
  you: "fwc_you",
};
const loadResults = () => {
  try {
    const raw = localStorage.getItem(LS.results);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { ...comp.results };
};

export default function App() {
  const [tab, setTab] = useState("board");
  const [results, setResults] = useState(loadResults);
  const [you, setYou] = useState(() => localStorage.getItem(LS.you) || comp.meta.highlightPlayer || comp.players[0]);
  // "live"  = synced with the shared DB · "local" = offline / no backend · "syncing" = first load
  const [sync, setSync] = useState(isShared ? "syncing" : "local");

  // Keep a ref of the latest results so the realtime handler can merge safely.
  const resultsRef = useRef(results);
  useEffect(() => { resultsRef.current = results; }, [results]);

  // localStorage stays as an instant-paint cache + offline fallback.
  useEffect(() => {
    try { localStorage.setItem(LS.results, JSON.stringify(results)); } catch {}
  }, [results]);
  useEffect(() => { localStorage.setItem(LS.you, you); }, [you]);

  // Shared backend: hydrate from Supabase on load, then subscribe to live edits.
  useEffect(() => {
    if (!isShared) return;
    let unsub = () => {};
    let active = true;
    (async () => {
      try {
        const remote = await fetchResults();
        if (!active) return;
        if (remote) setResults(remote);
        setSync("live");
      } catch (e) {
        console.error("[pool] initial fetch failed, using local cache", e);
        if (!active) return;
        setSync("local");
      }
      if (!active) return; // effect was torn down mid-fetch (StrictMode) — don't subscribe
      unsub = subscribeResults(
        () => resultsRef.current,
        (next) => setResults(next)
      );
    })();
    return () => { active = false; unsub(); };
  }, []);

  const standings = useMemo(() => buildStandings(comp, results), [results]);
  const youRow = standings.find((r) => r.name === you);
  const played = gamesPlayed(results);
  const goals = useMemo(
    () => Object.values(results).reduce((s, [h, a]) => s + h + a, 0),
    [results]
  );

  // Optimistic local update, then persist to the shared DB (if enabled).
  // On failure we re-pull from the server so no phone is left out of sync.
  const setResult = (n, score) => {
    setResults((prev) => {
      const next = { ...prev };
      if (score) next[n] = score;
      else delete next[n];
      return next;
    });
    if (!isShared) return;
    const op = score ? upsertResult(n, score) : deleteResult(n);
    Promise.resolve(op)
      .then(() => setSync("live"))
      .catch(async (e) => {
        console.error("[pool] write failed, re-syncing", e);
        try {
          const remote = await fetchResults();
          if (remote) setResults(remote);
        } catch {}
        setSync("local");
      });
  };

  return (
    <div className="app">
      <header className="masthead">
        <div className="wordmark"><span className="dot" aria-hidden="true" />{comp.meta.name.replace(" 2026 pool", "").replace("'s World Cup Pool 2026", "")}<span style={{ color: "var(--vermillion)" }}>'26</span></div>
        <div className="sub mono">
          EST. 1996 · {comp.players.length} players · $3,900 pool
          {isShared && (
            <span className={`synctag ${sync}`} title={sync === "live" ? "Shared board · live for everyone" : sync === "syncing" ? "Connecting…" : "Offline — showing this device's copy"}>
              <span className="live" aria-hidden="true" />
              {sync === "live" ? "LIVE" : sync === "syncing" ? "SYNC" : "LOCAL"}
            </span>
          )}
        </div>
      </header>

      {tab === "board" && <Board standings={standings} youRow={youRow} you={you} setYou={setYou} played={played} goals={goals} />}
      {tab === "games" && <Games results={results} setResult={setResult} you={you} />}
      {tab === "players" && <Players standings={standings} results={results} you={you} setYou={setYou} />}
      {tab === "rules" && <Rules />}

      <nav className="tabbar" aria-label="Sections">
        {[["board", "Table"], ["games", "Games"], ["players", "Players"], ["rules", "Rules"]].map(([id, label]) => (
          <button key={id} className={tab === id ? "active" : ""} aria-current={tab === id} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

// ============================== LEADERBOARD ==============================
function Board({ standings, youRow, you, setYou, played, goals }) {
  return (
    <div className="page">
      <div className="page-head">
        <span className="kicker">The standings</span>
        <h1>The Table</h1>
        <p>Every player's running total — match points plus manual bonuses. Tap a name to make it yours.</p>
      </div>

      <div className="status">
        <span><b>{played}</b> / {TOTAL} games final</span>
        <span>Goals: <b>{goals}</b></span>
      </div>

      <div className="slip">
        <div className="perf" aria-hidden="true" />
        <div className="slip-head">
          <span className="title">Live Standings</span>
          <span className="tag"><span className="live" aria-hidden="true" />Group stage</span>
        </div>
        {standings.map((r) => {
          const isYou = r.name === you;
          return (
            <div
              key={r.name}
              role="button"
              tabIndex={0}
              className={`lb-row${r.rank === 1 ? " leader" : ""}${isYou ? " you" : ""}`}
              onClick={() => setYou(r.name)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setYou(r.name); } }}
              style={{ cursor: "pointer" }}
              title="Set as you"
            >
              <span className="rank">{String(r.rank).padStart(2, "0")}</span>
              <span className="name">
                {r.rank <= 3 && <span className="medal" style={{ background: ["var(--gold)", "var(--slate)", "var(--bronze,#b45309)"][r.rank - 1] }} aria-hidden="true" />}
                <span className="nm">{r.name}</span>
                {isYou && <span className="you-flag">YOU</span>}
                {r.bonus > 0 && <span className="bonus">+{r.bonus}</span>}
              </span>
              <span className="exact">{r.byTier.exact || 0} exact</span>
              <span className="pts">{r.pts}</span>
            </div>
          );
        })}
      </div>
      {youRow && (
        <p className="kicker" style={{ textAlign: "center" }}>
          You ({you}) · #{youRow.rank} of {standings.length} · {youRow.pts} pts
        </p>
      )}
    </div>
  );
}

// ============================== GAMES ==============================
const FILTERS = [["all", "All"], ["played", "Played"], ["upcoming", "Upcoming"]];

function Games({ results, setResult, you }) {
  const [filter, setFilter] = useState("all");
  const youIdx = comp.players.indexOf(you);

  const list = comp.games.filter((g) => {
    const has = !!results[g.n];
    return filter === "all" || (filter === "played" ? has : !has);
  });

  return (
    <div className="page">
      <div className="page-head">
        <span className="kicker">Fixtures &amp; results</span>
        <h1>Games</h1>
        <p>All 72 group fixtures. Enter results as they come in — your picks are scored automatically.</p>
      </div>

      <div className="status" style={{ gap: 6, justifyContent: "flex-start" }}>
        {FILTERS.map(([id, label]) => (
          <button key={id} className={`linkish`} style={{ color: filter === id ? "var(--vermillion)" : "var(--slate)" }} onClick={() => setFilter(id)}>
            {label}
          </button>
        ))}
      </div>

      {list.map((g) => (
        <GameCard key={g.n} g={g} result={results[g.n]} setResult={setResult} youIdx={youIdx} />
      ))}
    </div>
  );
}

function GameCard({ g, result, setResult, youIdx }) {
  const [editing, setEditing] = useState(false);
  const [showPicks, setShowPicks] = useState(false);
  const [eh, setEh] = useState(result ? String(result[0]) : "");
  const [ea, setEa] = useState(result ? String(result[1]) : "");

  const pick = g.p[youIdx];
  const sc = result ? scoreOne(pick, result, TIERS) : null;
  const save = () => {
    if (eh === "" || ea === "") return;
    setResult(g.n, [parseInt(eh, 10), parseInt(ea, 10)]);
    setEditing(false);
  };

  return (
    <div className="game">
      <div className="game-top">
        <span className="gbadge">{g.grp}</span>
        <span className="gmeta">GAME {g.n} · {fmtDate(g.d)}</span>
      </div>
      <div className="match-row">
        <span className="team"><span className="crest" aria-hidden="true">{crest(g.h)}</span><span className="nm">{g.h}</span></span>
        <span className={`score-box${result ? "" : " empty"}`}>{result ? `${result[0]} – ${result[1]}` : "– –"}</span>
        <span className="team away"><span className="nm">{g.a}</span><span className="crest" aria-hidden="true">{crest(g.a)}</span></span>
      </div>

      <div className="game-foot">
        <span className="verdict">
          Your pick {pick[0]}–{pick[1]}
          {sc && (sc.tier === "exact"
            ? <> · <span className="hit">Exact</span></>
            : sc.tier === "result"
              ? <> · <span className="hit">Result</span></>
              : <> · <span className="miss">Miss</span></>)}
        </span>
        <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {sc && <span className={`pts-chip${sc.tier === "exact" ? " exact" : sc.tier === "result" ? " win" : ""}`}>+{sc.pts}</span>}
          <button className="linkish" onClick={() => setEditing((v) => !v)}>{result ? "Edit" : "Set result"}</button>
          <button className="linkish" onClick={() => setShowPicks((v) => !v)}>{showPicks ? "Hide" : "All picks"}</button>
        </span>
      </div>

      {editing && (
        <div className="editor">
          <input type="number" inputMode="numeric" min="0" value={eh} onChange={(e) => setEh(e.target.value)} aria-label={`${g.h} goals`} />
          <span className="mono">–</span>
          <input type="number" inputMode="numeric" min="0" value={ea} onChange={(e) => setEa(e.target.value)} aria-label={`${g.a} goals`} />
          <button className="btn sm" onClick={save}>Save</button>
          {result && <button className="linkish" onClick={() => { setResult(g.n, null); setEditing(false); setEh(""); setEa(""); }}>Clear</button>}
        </div>
      )}

      {showPicks && (
        <div className="picks-grid">
          <div className="ph">All {comp.players.length} predictions{result ? " · scored" : ""}</div>
          {comp.players.map((name, i) => {
            const ps = result ? scoreOne(g.p[i], result, TIERS) : null;
            return (
              <div className="prow" key={name}>
                <span className="pn">{name}</span>
                <span className="pp">{g.p[i][0]}–{g.p[i][1]}</span>
                <span className="pp" style={{ color: ps ? (ps.pts ? "var(--field)" : "var(--slate)") : "var(--slate)", fontWeight: 700 }}>
                  {ps ? `+${ps.pts}` : "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================== PLAYERS ==============================
function Players({ standings, results, you, setYou }) {
  const [sel, setSel] = useState(you);
  const row = standings.find((r) => r.name === sel);
  const idx = comp.players.indexOf(sel);
  const scored = comp.games
    .filter((g) => results[g.n])
    .map((g) => ({ g, pick: g.p[idx], res: results[g.n], ...scoreOne(g.p[idx], results[g.n], TIERS) }));

  return (
    <div className="page">
      <div className="page-head">
        <span className="kicker">Per-player scorecard</span>
        <h1>Players</h1>
        <p>Pick anyone to see their rank, totals, and every scored prediction.</p>
      </div>

      <select className="picker" value={sel} onChange={(e) => setSel(e.target.value)} style={{ marginBottom: 16 }} aria-label="Select player">
        {comp.players.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>

      {row && (
        <>
          <div className="tiles">
            <div className="tile"><div className="v">{row.pts}</div><div className="l">Points</div></div>
            <div className="tile"><div className="v">#{row.rank}</div><div className="l">Rank</div></div>
            <div className="tile"><div className="v">{row.byTier.exact || 0}</div><div className="l">Exact</div></div>
            <div className="tile"><div className="v">{row.byTier.result || 0}</div><div className="l">Results</div></div>
          </div>
          {sel !== you && (
            <button className="btn sm" style={{ marginBottom: 16 }} onClick={() => setYou(sel)}>Make {sel} "you"</button>
          )}

          <div className="slip">
            <div className="perf" aria-hidden="true" />
            <div className="slip-head"><span className="title">{sel} · scored picks</span><span className="tag">{scored.length} games</span></div>
            {scored.length === 0 && <div style={{ padding: 16, color: "var(--slate)" }}>No games scored yet.</div>}
            {scored.map(({ g, pick, res, tier, pts }) => (
              <div className="match-row" key={g.n} style={{ borderBottom: "1px solid var(--rule)" }}>
                <span className="team"><span className="gbadge">{g.grp}</span><span className="nm">{g.h} v {g.a}</span></span>
                <span className="mono" style={{ fontSize: ".8rem", color: "var(--slate)" }}>{pick[0]}–{pick[1]} / {res[0]}–{res[1]}</span>
                <span className={`pts-chip${tier === "exact" ? " exact" : tier === "result" ? " win" : ""}`} style={{ justifySelf: "end" }}>+{pts}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================== RULES ==============================
function Rules() {
  return (
    <div className="page">
      <div className="page-head">
        <span className="kicker">The house rules</span>
        <h1>Rules</h1>
        <p>{comp.rules.tagline}</p>
      </div>
      {comp.rules.sections.map((sec) => (
        <div className="rule-sec" key={sec.id}>
          <h3>{sec.icon} {sec.title}</h3>
          <p className="blurb">{sec.blurb}</p>
          {sec.rows.map((r, i) => (
            <div className="rrow" key={i}>
              <span className="rp">{r.pts}</span>
              <span className="rl"><b>{r.label}</b>{r.desc && <span>{r.desc}</span>}</span>
            </div>
          ))}
        </div>
      ))}
      {comp.rules.credit && <p className="credit">{comp.rules.credit}</p>}
    </div>
  );
}
