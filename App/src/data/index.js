// Single competition for this app: World Cup Theme Tracker.
// (Kept as a registry so adding another season/competition later is one file.)

import wc2026 from "./wc2026.js";

export const competition = wc2026;

export function getCompetition() {
  return wc2026;
}
