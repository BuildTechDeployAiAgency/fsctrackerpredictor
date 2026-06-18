import { flagUrl } from "../data/flags.js";
import { finalFourPicks } from "../data/finalfour.js";
import Flag from "./Flag.jsx";

// Display-only flourish: the country a player picked to lift the trophy,
// rendered as large angled flag art with the 2nd/3rd/4th picks as small
// chips beneath. No scoring — purely the pre-tournament call.
//
//   variant="full"    — Players scorecard hero block (default)
//   variant="compact" — small ribbon for the Board "you" footer
//
// Returns null when the player has no recorded Final-Four picks.
export default function ChampionPennant({ player, variant = "full" }) {
  const picks = finalFourPicks(player);
  if (!picks || !picks[0]) return null;

  const [champ, ...rest] = picks;
  const bg = flagUrl(champ);
  const labels = ["Runner-up", "3rd", "4th"];

  if (variant === "compact") {
    return (
      <div className="pennant pennant--compact" title={`${player}'s champion pick`}>
        <Flag team={champ} size={22} />
        <span className="pennant-kicker">Your champion</span>
        <span className="pennant-champ">{champ}</span>
      </div>
    );
  }

  return (
    <div className="pennant">
      {bg && (
        <span
          className="pennant-bg"
          aria-hidden="true"
          style={{ backgroundImage: `url(${bg})` }}
        />
      )}
      <div className="pennant-body">
        <span className="pennant-kicker">To lift the trophy</span>
        <div className="pennant-champ-row">
          <Flag team={champ} size={40} />
          <span className="pennant-champ">{champ}</span>
        </div>
        {rest.some(Boolean) && (
          <div className="pennant-chips">
            {rest.map((t, i) =>
              t ? (
                <span className="pennant-chip" key={i}>
                  <Flag team={t} size={16} />
                  <span className="pennant-chip-l">{labels[i]}</span>
                  <span className="pennant-chip-t">{t}</span>
                </span>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
}
