import { base44 } from "@/api/base44Client";

export const ACTION_KEYS = [
  "opened", "mood", "moment", "spots", "mocktails",
  "why_read", "reflection", "anchor", "room"
];

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Idempotent: logs an action for today. Creates the row if missing, appends if new action.
 */
export async function logPresence(action) {
  try {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) return;

    const user = await base44.auth.me();
    const date = todayKey();

    const existing = await base44.entities.PresenceLog.filter({ user_id: user.id, date });

    if (existing.length === 0) {
      await base44.entities.PresenceLog.create({ user_id: user.id, date, actions: [action] });
    } else {
      const log = existing[0];
      const actions = Array.isArray(log.actions) ? log.actions : [];
      if (!actions.includes(action)) {
        await base44.entities.PresenceLog.update(log.id, { actions: [...actions, action] });
      }
    }
  } catch (err) {
    // Presence logging is best-effort — never block the UI
    console.error("logPresence error:", err);
  }
}