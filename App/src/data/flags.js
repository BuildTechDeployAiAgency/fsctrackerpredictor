// ============================================================
// Team name -> ISO 3166-1 alpha-2 (flag) resolver.
// The wc2026 data uses some non-standard names; the domain is the closed
// set of 48 teams in this competition, so we keep an explicit, auditable
// table rather than a fuzzy library. Unmapped names return null and the
// UI falls back to the 3-letter crest badge.
// ============================================================

// flag-icons filenames: ISO alpha-2, plus "gb-eng" / "gb-sct" for the
// home nations (not ISO countries).
export const NAME_TO_ISO = {
  Algeria: "dz",
  Argentina: "ar",
  Australia: "au",
  Austria: "at",
  Belgium: "be",
  Bosnia: "ba",
  Brazil: "br",
  Canada: "ca",
  "Cape Verdi": "cv", // Cape Verde (original spelling preserved as the data key)
  Colombia: "co",
  Congo: "cg",
  Croatia: "hr",
  Curacao: "cw",
  Czechia: "cz",
  Ecuador: "ec",
  Egypt: "eg",
  England: "gb-eng",
  France: "fr",
  Germany: "de",
  Ghana: "gh",
  Haiti: "ht",
  Holland: "nl", // Netherlands
  Iran: "ir",
  Iraq: "iq",
  "Ivory Coast": "ci",
  Japan: "jp",
  Jordan: "jo",
  KSA: "sa", // Saudi Arabia
  Mexico: "mx",
  Morocco: "ma",
  "New Zealand": "nz",
  Norway: "no",
  Panama: "pa",
  Paraguay: "py",
  Portugal: "pt",
  Qatar: "qa",
  Scotland: "gb-sct",
  Senegal: "sn",
  "South Africa": "za",
  "South Korea": "kr",
  Spain: "es",
  Sweden: "se",
  Switzerland: "ch",
  Tunisia: "tn",
  Turkey: "tr",
  USA: "us",
  Uruguay: "uy",
  Uzbekistan: "uz",
};

export function isoFor(team) {
  return NAME_TO_ISO[team] || null;
}

// Vendored square (1x1) flag SVGs. Imported as asset URLs (NOT inlined into
// the JS bundle) so they're cached/lazy-loaded as small static files.
// Drop <iso>.svg files into src/assets/flags/ — no runtime dependency.
const modules = import.meta.glob("../assets/flags/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});
const URLS = {};
for (const path in modules) {
  const iso = path.split("/").pop().replace(".svg", "");
  URLS[iso] = modules[path];
}

/** Static URL for a team's flag SVG, or null if not vendored. */
export function flagUrl(team) {
  const iso = isoFor(team);
  return iso ? URLS[iso] || null : null;
}
