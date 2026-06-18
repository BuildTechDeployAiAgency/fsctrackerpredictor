// ============================================================
// Each player's pre-tournament "Final Four" knockout picks, extracted
// verbatim from the master Excel ("WC 2026" sheet, rows 91-94:
// Champions / Runners Up / Semi Final / Semi Final), keyed by the same
// player names used in wc2026.js.
//
// DISPLAY ONLY. The scoring engine is untouched — these are not fed into
// any points calculation here. picks = [champion, runnerUp, third, fourth].
// Team names match the keys in ./flags.js (NAME_TO_ISO).
// ============================================================

export const finalFour = {
  "Fadi C":   { picks: ["England", "France", "Spain", "Portugal"] },
  "Ghassan":  { picks: ["France", "Spain", "Portugal", "Argentina"] },
  "KC":       { picks: ["Spain", "Portugal", "England", "France"] },
  "Mazen":    { picks: ["Spain", "Brazil", "Argentina", "France"] },
  "Salim":    { picks: ["Argentina", "Spain", "France", "Germany"] },
  "Kawkab":   { picks: ["France", "Spain", "Argentina", "Portugal"] },
  "Barbar":   { picks: ["Spain", "Brazil", "Argentina", "France"] },
  "Mo Man":   { picks: ["Portugal", "England", "Spain", "France"] },
  "S & R":    { picks: ["France", "Argentina", "Spain", "Brazil"] },
  "Nadim":    { picks: ["Brazil", "Spain", "France", "Portugal"] },
  "Milo":     { picks: ["France", "Spain", "Argentina", "Brazil"] },
  "Mark K":   { picks: ["Spain", "Argentina", "France", "Brazil"] },
  "Simon":    { picks: ["Portugal", "Holland", "Brazil", "Spain"] },
  "Elias Kh": { picks: ["France", "Brazil", "Spain", "Argentina"] },
  "Jawad":    { picks: ["England", "Spain", "France", "Argentina"] },
  "Hani":     { picks: ["France", "Brazil", "England", "Norway"] },
  "ISK":      { picks: ["Spain", "France", "Argentina", "England"] },
  "Nawaf":    { picks: ["France", "Brazil", "Argentina", "Portugal"] },
  "Diogo":    { picks: ["Brazil", "England", "Spain", "France"] },
  "Roger":    { picks: ["Holland", "Brazil", "Argentina", "Spain"] },
  "Razek":    { picks: ["France", "Brazil", "Argentina", "Spain"] },
  "Maria":    { picks: ["Brazil", "Spain", "Holland", "Portugal"] },
  "Rami M":   { picks: ["Argentina", "France", "Spain", "Brazil"] },
  "Imad":     { picks: ["Portugal", "France", "Brazil", "Spain"] },
  "Patrick":  { picks: ["Brazil", "Spain", "Argentina", "Germany"] },
  "Majd":     { picks: ["Spain", "Brazil", "France", "Argentina"] },
  "M. Saada": { picks: ["Brazil", "Portugal", "France", "England"] },
};

// Convenience selector — returns null when a player has no recorded picks.
export function championPick(player) {
  return finalFour[player]?.picks?.[0] ?? null;
}

export function finalFourPicks(player) {
  return finalFour[player]?.picks ?? null;
}

export default finalFour;
