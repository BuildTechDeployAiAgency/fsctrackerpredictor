import { useEffect, useMemo, useRef, useState } from "react";
import { getCompetition } from "./data/index.js";
import { buildStandings, scoreOne, gamesPlayed } from "./lib/scoring.js";
import { buildGroups } from "./lib/groups.js";
import { isShared, fetchResults, upsertResult, deleteResult, subscribeResults, verifyCommissioner } from "./lib/supabase.js";
import Landing from "./Landing.jsx";
import Flag from "./components/Flag.jsx";
import ChampionPennant from "./components/ChampionPennant.jsx";

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
  entered: "fwc_entered",
  commish: "fwc_commish",
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
  // Gate: show the landing page until the player enters (passcode + name).
  const [entered, setEntered] = useState(() => localStorage.getItem(LS.entered) === "1");
  // Commissioner passcode (only the commissioner can enter results). Held in
  // memory + localStorage, sent on each write; never shipped in the bundle.
  const [commishPass, setCommishPass] = useState(() => localStorage.getItem(LS.commish) || "");
  const isCommissioner = isShared ? !!commishPass : true; // offline/no-backend = editable locally

  // Keep a ref of the latest results so the realtime handler can merge safely.
  const resultsRef = useRef(results);
  useEffect(() => { resultsRef.current = results; }, [results]);

  // localStorage stays as an instant-paint cache + offline fallback.
  useEffect(() => {
    try { localStorage.setItem(LS.results, JSON.stringify(results)); } catch {}
  }, [results]);
  useEffect(() => { localStorage.setItem(LS.you, you); }, [you]);

  const enterPool = (name) => {
    if (name) setYou(name);
    localStorage.setItem(LS.entered, "1");
    setEntered(true);
  };
  const exitPool = () => {
    localStorage.removeItem(LS.entered);
    setEntered(false);
    setTab("board");
  };

  // Commissioner unlock: verify the passcode server-side before storing it.
  const commishLogin = async (pass) => {
    try {
      const ok = await verifyCommissioner(pass);
      if (ok) { setCommishPass(pass); localStorage.setItem(LS.commish, pass); }
      return ok;
    } catch { return false; }
  };
  const commishLogout = () => { setCommishPass(""); localStorage.removeItem(LS.commish); };

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
    const op = score ? upsertResult(n, score, commishPass) : deleteResult(n, commishPass);
    Promise.resolve(op)
      .then(() => setSync("live"))
      .catch(async (e) => {
        console.error("[pool] write failed, re-syncing", e);
        // Passcode rejected (or revoked): drop commissioner mode so the UI locks.
        if (e && (e.code === "42501" || /unauthor/i.test(e.message || ""))) {
          commishLogout();
          alert("Commissioner passcode rejected. Results are locked.");
        }
        try {
          const remote = await fetchResults();
          if (remote) setResults(remote);
        } catch {}
        setSync("live");
      });
  };

  if (!entered) {
    return <Landing comp={comp} standings={standings} defaultName={you} onEnter={enterPool} />;
  }

  return (
    <div className="app">
      <header className="masthead">
        <div className="masthead-top">
          <div className="wordmark"><span className="dot" aria-hidden="true" />{comp.meta.name.replace(" 2026 pool", "").replace("'s World Cup Pool 2026", "")}<span style={{ color: "var(--vermillion)" }}>'26</span></div>
          <span className="whoami mono" title="You — tap a name on the Table to change">
            <span className="whoami-l">YOU</span>{you}
          </span>
          <button className="linkish exit" onClick={exitPool} title="Back to the cover">Exit</button>
        </div>
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
      {tab === "games" && <Games results={results} setResult={setResult} you={you} isCommissioner={isCommissioner} canLogin={isShared} onLogin={commishLogin} onLogout={commishLogout} />}
      {tab === "players" && <Players standings={standings} results={results} you={you} setYou={setYou} />}
      {tab === "groups" && <Groups results={results} />}
      {tab === "rules" && <Rules />}

      <nav className="tabbar" aria-label="Sections">
        {[["board", "Table"], ["games", "Games"], ["groups", "Groups"], ["players", "Players"], ["rules", "Rules"]].map(([id, label]) => (
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
      <ChampionPennant player={you} variant="compact" />
    </div>
  );
}

// ============================== GAMES ==============================
const todayStr = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local

function Games({ results, setResult, you, isCommissioner, canLogin, onLogin, onLogout }) {
  const youIdx = comp.players.indexOf(you);

  // Split fixtures by the schedule, relative to today's date.
  const { today, upcoming, past } = useMemo(() => {
    const t = todayStr();
    const buckets = { today: [], upcoming: [], past: [] };
    for (const g of comp.games) {
      if (g.d === t) buckets.today.push(g);
      else if (g.d > t) buckets.upcoming.push(g);
      else buckets.past.push(g);
    }
    return buckets;
  }, []);

  const sections = [
    { id: "today", label: "Today", games: today, defaultOpen: true },
    { id: "upcoming", label: "Upcoming", games: upcoming, defaultOpen: today.length === 0 },
    { id: "past", label: "Past", games: past, defaultOpen: false },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <span className="kicker">Fixtures &amp; results</span>
        <h1>Games</h1>
        <p>{isCommissioner
          ? "Fixtures by the schedule — today, upcoming, past. Enter results as they come in; picks score automatically."
          : "Fixtures by the schedule — today, upcoming, past. Results are entered by the commissioner; the board updates live."}</p>
      </div>

      {canLogin && <CommishBar isCommissioner={isCommissioner} onLogin={onLogin} onLogout={onLogout} />}

      {sections.filter((s) => s.games.length).map((s) => (
        <GamesSection key={s.id} label={s.label} games={s.games} defaultOpen={s.defaultOpen}
          results={results} setResult={setResult} youIdx={youIdx} canEdit={isCommissioner} />
      ))}
    </div>
  );
}

function GamesSection({ label, games, defaultOpen, results, setResult, youIdx, canEdit }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="games-sec">
      <button className={`games-sec-head${open ? " open" : ""}`} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="arrow" aria-hidden="true">{open ? "▾" : "▸"}</span>
        <span className="games-sec-title">{label}</span>
        <span className="games-sec-count mono">{games.length}</span>
      </button>
      {open && games.map((g) => (
        <GameCard key={g.n} g={g} result={results[g.n]} setResult={setResult} youIdx={youIdx} canEdit={canEdit} />
      ))}
    </section>
  );
}

// Commissioner unlock / status strip on the Games tab.
function CommishBar({ isCommissioner, onLogin, onLogout }) {
  const [open, setOpen] = useState(false);
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const ok = await onLogin(pass.trim());
    setBusy(false);
    if (ok) { setOpen(false); setPass(""); }
    else setErr("Wrong commissioner passcode.");
  };

  if (isCommissioner) {
    return (
      <div className="commish-bar on">
        <span className="commish-tag">⚑ Commissioner — you can enter results</span>
        <button className="linkish" onClick={onLogout}>Lock</button>
      </div>
    );
  }
  return (
    <div className="commish-bar">
      {!open ? (
        <>
          <span className="commish-tag muted">🔒 Results locked — commissioner only</span>
          <button className="linkish" onClick={() => setOpen(true)}>Unlock</button>
        </>
      ) : (
        <form className="commish-form" onSubmit={submit}>
          <input
            type="password" autoComplete="off" autoFocus
            value={pass} onChange={(e) => { setPass(e.target.value); setErr(""); }}
            placeholder="Commissioner passcode"
            aria-label="Commissioner passcode"
          />
          <button className="btn sm" type="submit" disabled={busy}>{busy ? "…" : "Unlock"}</button>
          <button type="button" className="linkish" onClick={() => { setOpen(false); setErr(""); }}>Cancel</button>
          {err && <span className="commish-err">{err}</span>}
        </form>
      )}
    </div>
  );
}

function GameCard({ g, result, setResult, youIdx, canEdit }) {
  const [editing, setEditing] = useState(false);
  const [showPicks, setShowPicks] = useState(false);
  const [showSim, setShowSim] = useState(false);
  const [simH, setSimH] = useState("");
  const [simA, setSimA] = useState("");
  const [eh, setEh] = useState(result ? String(result[0]) : "");
  const [ea, setEa] = useState(result ? String(result[1]) : "");

  const pick = g.p[youIdx];
  const sc = result ? scoreOne(pick, result, TIERS) : null;

  // What-if simulator (read-only, never writes). Scores YOUR pick against a
  // hypothetical scoreline AND tallies how the whole pool would score it.
  const simResult = simH !== "" && simA !== "" ? [parseInt(simH, 10), parseInt(simA, 10)] : null;
  const simSc = simResult ? scoreOne(pick, simResult, TIERS) : null;
  const simDist = simResult
    ? comp.players.reduce((acc, _, i) => {
        const t = scoreOne(g.p[i], simResult, TIERS).tier;
        acc[t] = (acc[t] || 0) + 1;
        return acc;
      }, {})
    : null;
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
        <span className="team"><Flag team={g.h} /><span className="nm">{g.h}</span></span>
        <span className={`score-box${result ? "" : " empty"}`}>{result ? `${result[0]} – ${result[1]}` : "– –"}</span>
        <span className="team away"><span className="nm">{g.a}</span><Flag team={g.a} /></span>
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
          {canEdit && <button className="linkish" onClick={() => setEditing((v) => !v)}>{result ? "Edit" : "Set result"}</button>}
          <button className="linkish toggle" aria-expanded={showSim} onClick={() => setShowSim((v) => !v)}><span className="caret" aria-hidden="true">{showSim ? "▾" : "▸"}</span>What if</button>
          <button className="linkish toggle" aria-expanded={showPicks} onClick={() => setShowPicks((v) => !v)}><span className="caret" aria-hidden="true">{showPicks ? "▾" : "▸"}</span>All picks</button>
        </span>
      </div>

      {showSim && (
        <div className="sim">
          <div className="sim-row">
            <span className="sim-kicker">WHAT IF</span>
            <span className="team-sm">{crest(g.h)}</span>
            <input type="number" inputMode="numeric" min="0" value={simH} onChange={(e) => setSimH(e.target.value)} aria-label={`${g.h} hypothetical goals`} />
            <span className="mono">–</span>
            <input type="number" inputMode="numeric" min="0" value={simA} onChange={(e) => setSimA(e.target.value)} aria-label={`${g.a} hypothetical goals`} />
            <span className="team-sm">{crest(g.a)}</span>
            {simSc
              ? <span className={`pts-chip${simSc.tier === "exact" ? " exact" : simSc.tier === "result" ? " win" : ""}`} style={{ marginLeft: "auto" }}>you +{simSc.pts}</span>
              : <span className="sim-hint">enter a score</span>}
          </div>
          {simDist && (
            <div className="sim-dist">
              <span className="dchip exact"><b>{simDist.exact || 0}</b> exact ·5</span>
              <span className="dchip win"><b>{simDist.result || 0}</b> result ·3</span>
              <span className="dchip"><b>{simDist.miss || 0}</b> miss ·0</span>
            </div>
          )}
        </div>
      )}

      {canEdit && editing && (
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
  const [sel, setSel] = useState(""); // start empty — user picks who to view
  const row = standings.find((r) => r.name === sel);
  const idx = comp.players.indexOf(sel);
  const scored = sel
    ? comp.games
        .filter((g) => results[g.n])
        .map((g) => ({ g, pick: g.p[idx], res: results[g.n], ...scoreOne(g.p[idx], results[g.n], TIERS) }))
    : [];

  return (
    <div className="page">
      <div className="page-head">
        <span className="kicker">Per-player scorecard</span>
        <h1>Players</h1>
        <p>Pick anyone to see their rank, totals, and every scored prediction.</p>
      </div>

      <select className="picker" value={sel} onChange={(e) => setSel(e.target.value)} style={{ marginBottom: 16 }} aria-label="Select player">
        <option value="" disabled>Select a player…</option>
        {comp.players.map((p) => <option key={p} value={p}>{p}{p === you ? " (you)" : ""}</option>)}
      </select>

      {!sel && (
        <div className="empty-pick">
          <p>Choose a player above to see their rank, totals, and every scored pick.</p>
        </div>
      )}

      {row && (
        <>
          <ChampionPennant player={sel} />
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

// ============================== GROUPS ==============================
function Groups({ results }) {
  const groups = useMemo(() => buildGroups(comp.games, results), [results]);

  return (
    <div className="page">
      <div className="page-head">
        <span className="kicker">Live group tables</span>
        <h1>Groups</h1>
        <p>Real standings (A–L) from entered results — played, W-D-L, goal diff, points. Top two qualify.</p>
      </div>

      <div className="grp-grid">
        {groups.map(({ grp, rows }) => (
          <div className="slip grp-card" key={grp}>
            <div className="slip-head">
              <span className="title">Group {grp}</span>
              <span className="tag">{rows.reduce((s, r) => s + r.P, 0) / 2 || 0}/6</span>
            </div>
            <div className="grp-table">
              <div className="grp-row grp-hd">
                <span className="grp-team">Team</span>
                <span>P</span><span>W</span><span>D</span><span>L</span>
                <span>GD</span><span className="grp-pts">Pts</span>
              </div>
              {rows.map((r, i) => (
                <div className={`grp-row${i < 2 ? " qual" : ""}`} key={r.team}>
                  <span className="grp-team"><Flag team={r.team} size={18} /><span className="nm">{r.team}</span></span>
                  <span>{r.P}</span><span>{r.W}</span><span>{r.D}</span><span>{r.L}</span>
                  <span>{r.GD > 0 ? `+${r.GD}` : r.GD}</span>
                  <span className="grp-pts">{r.Pts}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
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
