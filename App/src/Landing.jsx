import { useState } from "react";

const PASSCODE = import.meta.env.VITE_APP_PASSCODE || "fadi26";

// Full "Sports Almanac" marketing landing for the World Cup Theme Tracker.
// Receives the live standings so the hero board is real, not mocked.
// `onEnter(name)` flips the app into the tabbed view with that player as "you".
export default function Landing({ comp, standings, defaultName, onEnter }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [pass, setPass] = useState("");
  const [name, setName] = useState(defaultName || comp.meta.highlightPlayer || comp.players[0]);
  const [err, setErr] = useState("");

  const top5 = standings.slice(0, 5);
  const openGate = () => { setErr(""); setGateOpen(true); setMenuOpen(false); };
  const closeMenu = () => setMenuOpen(false);

  const submit = (e) => {
    e.preventDefault();
    if (pass.trim() !== PASSCODE) { setErr("Wrong passcode. Ask the commissioner."); return; }
    if (!name) { setErr("Pick your name first."); return; }
    onEnter(name);
  };

  return (
    <div className="landing">
      {/* ---------- NAV ---------- */}
      <header className="lp-nav">
        <div className="wrap lp-nav-inner">
          <a className="lp-wordmark" href="#top" aria-label="World Cup Theme Tracker home" onClick={closeMenu}>
            <span className="dot" aria-hidden="true" />WC<span className="red">&nbsp;TRACKER</span>
          </a>
          <button
            className="lp-hamburger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span aria-hidden="true" />
          </button>
          <nav className={`lp-menu${menuOpen ? " open" : ""}`} aria-label="Primary">
            <a href="#how" onClick={closeMenu}>How it works</a>
            <a href="#board" onClick={closeMenu}>The table</a>
            <a href="#rules" onClick={closeMenu}>The rules</a>
            <button className="btn sm" onClick={openGate}>Enter the pool</button>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* ---------- HERO ---------- */}
        <section className="lp-hero" aria-labelledby="hero-h">
          <div className="wrap lp-hero-grid">
            <div>
              <span className="kicker">A 30-year prediction tradition · Since 1996</span>
              <h1 id="hero-h" className="display">Call it.<br />Score it.<br /><span className="red">Never let them<br />forget it.</span></h1>
              <p className="lede">
                {comp.players.length} friends. {comp.meta.totalGames} matches. One scoreline each, every game.
                Points land as the results do — and the <em>table</em> settles who actually knows ball.
              </p>
              <div className="lp-hero-cta">
                <button className="btn" onClick={openGate}>Enter the pool →</button>
                <a className="btn ghost" href="#board">See the table</a>
              </div>
              <div className="lp-hero-stats">
                <div className="stat"><div className="n mono">{comp.players.length}</div><div className="l">In the pool</div></div>
                <div className="stat"><div className="n mono">{comp.meta.totalGames}</div><div className="l">Matches called</div></div>
                <div className="stat"><div className="n mono">$3,900</div><div className="l">On the line</div></div>
              </div>
            </div>

            {/* HERO SLIP — real live standings */}
            <aside className="slip" id="board" aria-label="Live standings">
              <div className="perf" aria-hidden="true" />
              <div className="slip-head">
                <span className="title">Live Standings</span>
                <span className="tag"><span className="live" aria-hidden="true" />Group stage</span>
              </div>
              {top5.map((r) => (
                <div key={r.name} className={`lb-row${r.rank === 1 ? " leader" : ""}`}>
                  <span className="rank">{String(r.rank).padStart(2, "0")}</span>
                  <span className="name">
                    {r.rank <= 3 && <span className="medal" style={{ background: ["var(--gold)", "var(--slate)", "#b45309"][r.rank - 1] }} aria-hidden="true" />}
                    <span className="nm">{r.name}</span>
                  </span>
                  <span className="exact">{r.byTier.exact || 0} exact</span>
                  <span className="pts">{r.pts}</span>
                </div>
              ))}
            </aside>
          </div>
        </section>

        {/* ---------- HOW IT WORKS ---------- */}
        <section id="how" className="lp-sec" aria-labelledby="how-h">
          <div className="wrap">
            <div className="sec-head">
              <span className="kicker">The whole game in three moves</span>
              <h2 id="how-h">Predictions in.<br />Results land. Table moves.</h2>
              <p>No spreadsheet, no 2am arguments about scoring. Everyone's picks are already on the record — the board does the bragging.</p>
            </div>
            <div className="lp-cols">
              <div className="lp-col">
                <span className="no">01 / THE PICKS</span>
                <h3>One scoreline each</h3>
                <p>All {comp.players.length} players called the exact score of every one of the {comp.meta.totalGames} matches. Locked in, no take-backs.</p>
              </div>
              <div className="lp-col">
                <span className="no">02 / THE SCORING</span>
                <h3>Exact 5 · Result 3</h3>
                <p>Nail the scoreline, bank 5. Right winner or draw with the wrong score, take 3. Miss, and you get nothing.</p>
              </div>
              <div className="lp-col">
                <span className="no">03 / THE TABLE</span>
                <h3>Climb or get cooked</h3>
                <p>Results post, points settle, the standings reshuffle live for everyone on every phone. Someone's having a very good Sunday.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- RULES / PRIZES ---------- */}
        <section id="rules" className="lp-sec" aria-labelledby="rules-h">
          <div className="wrap">
            <div className="sec-head">
              <span className="kicker">The house rules &amp; the pot</span>
              <h2 id="rules-h">Points win games.<br />The pot wins bragging rights.</h2>
              <p>$150 a head, {comp.players.length} deep, paid to the top four. The full rule book lives inside.</p>
            </div>
            <div className="lp-pricecols">
              <div className="slip">
                <div className="perf" aria-hidden="true" />
                <div className="slip-head"><span className="title">Match Scoring</span><span className="tag">Per game</span></div>
                <div className="lb-row"><span className="rank">5</span><span className="name"><span className="nm">Exact score</span></span><span className="exact">nailed it</span><span className="pts">+5</span></div>
                <div className="lb-row"><span className="rank">3</span><span className="name"><span className="nm">Correct result</span></span><span className="exact">wrong score</span><span className="pts">+3</span></div>
                <div className="lb-row"><span className="rank">0</span><span className="name"><span className="nm">Miss</span></span><span className="exact">no tier</span><span className="pts">+0</span></div>
              </div>
              <div className="slip">
                <div className="perf" aria-hidden="true" />
                <div className="slip-head"><span className="title">The Pot</span><span className="tag"><span className="live" aria-hidden="true" />$3,900</span></div>
                <div className="lb-row leader"><span className="rank">01</span><span className="name"><span className="medal" style={{ background: "var(--gold)" }} aria-hidden="true" /><span className="nm">Champion</span></span><span className="exact" /><span className="pts">$1,250</span></div>
                <div className="lb-row"><span className="rank">02</span><span className="name"><span className="nm">Runner-up</span></span><span className="exact" /><span className="pts">$750</span></div>
                <div className="lb-row"><span className="rank">03</span><span className="name"><span className="nm">Third</span></span><span className="exact" /><span className="pts">$450</span></div>
                <div className="lb-row"><span className="rank">04</span><span className="name"><span className="nm">Fourth</span></span><span className="exact" /><span className="pts">$250</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- FINAL CTA ---------- */}
        <section className="lp-cta-final" aria-labelledby="start-h">
          <div className="wrap">
            <span className="kicker" style={{ color: "var(--vermillion)" }}>One board · Every phone · Live</span>
            <h2 id="start-h" className="display">Settle it on the <span className="red">board.</span></h2>
            <p>Punch in the passcode, claim your name, and watch the table move in real time.</p>
            <button className="btn" onClick={openGate}>Enter the pool →</button>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="wrap lp-foot-inner">
          <span className="lp-wordmark"><span className="dot" aria-hidden="true" />WC<span className="red">&nbsp;TRACKER</span></span>
          <span>{comp.meta.name}</span>
          <span className="mono">{comp.rules.credit}</span>
        </div>
      </footer>

      {/* ---------- GATE MODAL ---------- */}
      {gateOpen && (
        <div className="gate-overlay" role="dialog" aria-modal="true" aria-labelledby="gate-h" onClick={(e) => { if (e.target === e.currentTarget) setGateOpen(false); }}>
          <form className="gate slip" onSubmit={submit}>
            <div className="perf" aria-hidden="true" />
            <div className="slip-head">
              <span className="title" id="gate-h">Enter the pool</span>
              <button type="button" className="linkish" onClick={() => setGateOpen(false)} aria-label="Close">Close</button>
            </div>
            <div className="gate-body">
              <label className="gate-field">
                <span className="gate-label">Passcode</span>
                <input
                  type="password"
                  inputMode="text"
                  autoComplete="off"
                  value={pass}
                  onChange={(e) => { setPass(e.target.value); setErr(""); }}
                  placeholder="Group passcode"
                  autoFocus
                />
              </label>
              <label className="gate-field">
                <span className="gate-label">You are</span>
                <select className="picker" value={name} onChange={(e) => setName(e.target.value)}>
                  {comp.players.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              {err && <p className="gate-err">{err}</p>}
              <button type="submit" className="btn" style={{ width: "100%", justifyContent: "center" }}>Let me in →</button>
              <p className="gate-note">Private pool. Passcode from the commissioner.</p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
