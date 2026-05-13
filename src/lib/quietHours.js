/**
 * Quiet Hours utility.
 * Returns true if the current local time falls within the user's quiet window.
 */
export function isQuietNow(profile) {
  if (!profile) return false;
  if (profile.quiet_hours_enabled === false) return false;

  const startStr = profile.quiet_start || "22:00";
  const endStr = profile.quiet_end || "06:00";

  const now = new Date();
  const curMins = now.getHours() * 60 + now.getMinutes();

  const [sh, sm] = startStr.split(":").map(Number);
  const [eh, em] = endStr.split(":").map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;

  // Handle midnight crossover (e.g. 22:00 → 06:00)
  if (startMins > endMins) {
    return curMins >= startMins || curMins < endMins;
  }
  return curMins >= startMins && curMins < endMins;
}

export function formatQuietTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}${ampm}` : `${hour}:${String(m).padStart(2, "0")}${ampm}`;
}