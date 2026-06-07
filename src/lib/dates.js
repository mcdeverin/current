/**
 * Shared date helpers — local-time aware.
 *
 * Always prefer these to `date.toISOString().slice(0,10)`, which silently
 * shifts a date by up to a day in any non-UTC timezone.
 */

/**
 * Today (or a given date) as `YYYY-MM-DD` in the user's local timezone.
 * Use for entity keys like `MoodLog.date`, `Reflection.date`, etc.
 */
export function getLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Day-of-year [1..366] for the given date (defaults to now). Useful for
 * deterministic "rotate today's pick by `idx % collection.length`" patterns.
 */
export function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / (1000 * 60 * 60 * 24));
}

/**
 * Parse a `YYYY-MM-DD` string as a local Date at midnight (avoids the
 * UTC-interpretation gotcha of `new Date("2026-04-01")`).
 */
export function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}
