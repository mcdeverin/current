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

// Returns the next upcoming milestone past `days`, with its label and how many
// days remain. Past 730, falls back to the next annual anniversary.
export function getNextMilestone(days) {
  const next = milestones.find(m => m > days);
  if (next) return { label: getMilestoneLabel(next).replace(".", ""), daysLeft: next - days };
  const nextYear = Math.ceil((days + 1) / 365) * 365;
  return { label: getMilestoneLabel(nextYear).replace(".", ""), daysLeft: nextYear - days };
}

function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getDaysSince(dateString) {
  const start = parseLocalDate(dateString);
  const now = new Date();
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

export function formatDateRange(dateString) {
  const start = parseLocalDate(dateString);
  const now = new Date();
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${start.toLocaleDateString('en-US', options)} — ${now.toLocaleDateString('en-US', options)}`;
}