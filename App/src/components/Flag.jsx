import { flagUrl } from "../data/flags.js";

// Existing 3-letter fallback (kept identical to App.jsx's crest()).
const crest = (team) => team.replace(/[^A-Za-z ]/g, "").slice(0, 3).toUpperCase();

// Renders a country flag inside the existing ink-framed `.crest` badge so it
// reads as a stamped almanac mark. Falls back to the 3-letter badge for any
// team without a vendored flag — zero regression for unmapped names.
export default function Flag({ team, size }) {
  const url = flagUrl(team);
  const style = size ? { width: size, height: size } : undefined;
  if (!url) {
    return <span className="crest" style={style} aria-hidden="true">{crest(team)}</span>;
  }
  return (
    <span className="crest crest--flag" style={style} title={team}>
      <img src={url} alt="" loading="lazy" width="100%" height="100%" />
    </span>
  );
}
