// ============================================================
// Supabase client — shared live results only.
// If env vars are absent (e.g. local offline use), `supabase` is null
// and the app falls back to localStorage. The scoring engine and the
// competition data in src/data are NEVER touched by this layer.
// ============================================================
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** The shared backend is enabled only when both env vars are present. */
export const isShared = Boolean(url && anonKey);

export const supabase = isShared
  ? createClient(url, anonKey, {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 5 } },
    })
  : null;

const TABLE = "results";

// Map a DB row -> the engine's results shape value: [home, away].
const rowToEntry = (r) => [Number(r.home), Number(r.away)];

/** Read the whole results table as { [gameNo]: [home, away] }. */
export async function fetchResults() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from(TABLE)
    .select("game_no,home,away");
  if (error) throw error;
  const out = {};
  for (const r of data) out[r.game_no] = rowToEntry(r);
  return out;
}

// ---- Commissioner-gated writes ----
// Direct table writes are blocked by RLS. These go through SECURITY DEFINER
// RPCs that require the commissioner passcode (validated server-side).

/** True if the passcode matches the stored commissioner passcode. */
export async function verifyCommissioner(passcode) {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc("verify_commissioner", { p_passcode: passcode });
  if (error) throw error;
  return data === true;
}

/** Insert/update one game's score. Requires the commissioner passcode. */
export async function upsertResult(gameNo, [home, away], passcode) {
  if (!supabase) return false;
  const { error } = await supabase.rpc("set_result", {
    p_game_no: gameNo, p_home: home, p_away: away, p_passcode: passcode || "",
  });
  if (error) throw error;
  return true;
}

/** Remove one game's score. Requires the commissioner passcode. */
export async function deleteResult(gameNo, passcode) {
  if (!supabase) return false;
  const { error } = await supabase.rpc("clear_result", {
    p_game_no: gameNo, p_passcode: passcode || "",
  });
  if (error) throw error;
  return true;
}

/**
 * Subscribe to live changes on the results table.
 * `onChange(nextResults)` is called with the full, rebuilt results map on
 * every insert/update/delete. Returns an unsubscribe function.
 */
export function subscribeResults(getCurrent, onChange) {
  if (!supabase) return () => {};
  // Unique suffix avoids reusing an already-subscribed channel across remounts.
  const channel = supabase
    .channel(`results-live-${Math.random().toString(36).slice(2, 8)}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: TABLE },
      (payload) => {
        const next = { ...getCurrent() };
        if (payload.eventType === "DELETE") {
          delete next[payload.old.game_no];
        } else {
          const r = payload.new;
          next[r.game_no] = rowToEntry(r);
        }
        onChange(next);
      }
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
