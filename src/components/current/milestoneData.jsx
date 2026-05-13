export const milestones = [1, 7, 14, 30, 60, 90, 180, 365, 500, 730];

export const milestoneLabels = {
  1: "Day One.",
  7: "One Week.",
  14: "Two Weeks.",
  30: "Thirty Days.",
  60: "Sixty Days.",
  90: "Ninety Days.",
  180: "Six Months.",
  365: "One Year.",
  500: "Five Hundred Days.",
  730: "Two Years.",
};

export const milestoneQuotes = {
  1: "You chose this. That's everything.",
  7: "A week of choosing yourself. It looks good on you.",
  14: "Two weeks in. You're not counting—you're building.",
  30: "Thirty days. Every one of them was a decision. Every one of them was yours.",
  60: "Sixty days of presence. The world looks different when you're actually in it.",
  90: "Ninety days. You traded a habit for a life.",
  180: "Half a year. You didn't just stop something. You became someone.",
  365: "One full year. Three hundred and sixty-five choices. All of them yours.",
  500: "Five hundred days of being here. Not everyone can say that.",
  730: "Two years. This isn't a phase. This is who you are.",
};

export function getMilestoneLabel(days) {
  if (days >= 730) return `${days} Days.`;
  return milestoneLabels[days] || `${days} Days.`;
}

export function getMilestoneQuote(days) {
  // Find closest milestone
  const closest = milestones.reduce((prev, curr) =>
    Math.abs(curr - days) < Math.abs(prev - days) ? curr : prev
  );
  return milestoneQuotes[closest] || "Every single day was a choice. You keep making it.";
}

export function isMilestoneDay(days) {
  if (milestones.includes(days)) return true;
  // For days > 730, every 365 is a milestone
  if (days > 730 && days % 365 === 0) return true;
  return false;
}

function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// profile can be passed to honour pause ranges
export function getDaysSince(dateString, profile = null) {
  const start = parseLocalDate(dateString);
  const now = new Date();
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  let total = Math.floor((now - start) / (1000 * 60 * 60 * 24));

  if (profile?.pause_start) {
    const ps = parseLocalDate(profile.pause_start);
    ps.setHours(0, 0, 0, 0);
    // pause_end null means still paused (count to today)
    const pe = profile.pause_end ? parseLocalDate(profile.pause_end) : now;
    pe.setHours(0, 0, 0, 0);
    // Only subtract if pause is within the tracked window
    if (ps >= start) {
      const pausedDays = Math.floor((Math.min(pe, now) - ps) / (1000 * 60 * 60 * 24));
      total = Math.max(0, total - pausedDays);
    }
  }

  return total;
}

// Checks if profile is currently in a pause
export function isPaused(profile) {
  if (!profile?.pause_start) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ps = parseLocalDate(profile.pause_start);
  ps.setHours(0, 0, 0, 0);
  if (ps > today) return false;
  if (!profile.pause_end) return true; // open-ended
  const pe = parseLocalDate(profile.pause_end);
  pe.setHours(0, 0, 0, 0);
  return today <= pe;
}

export function formatDateRange(dateString) {
  const start = parseLocalDate(dateString);
  const now = new Date();
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${start.toLocaleDateString('en-US', options)} — ${now.toLocaleDateString('en-US', options)}`;
}