const intentions = [
  "You showed up today. That's the whole thing.",
  "Nothing to prove. Nothing to fix. Just this.",
  "The version of you that chose this is still here.",
  "You don't have to earn rest.",
  "Present tense. Always.",
  "Clarity isn't a reward. It's what you chose.",
  "You're not missing out. You're right here.",
  "Today doesn't need to be extraordinary. It just needs to be yours.",
  "The quiet is not emptiness. It's space.",
  "Every single day was a choice. You keep making it.",
  "You already have what you need.",
  "There's no finish line. There's just this moment.",
  "Stillness isn't weakness. It's the loudest thing you can do.",
  "You chose yourself. That's not small.",
  "What you feel right now is real. Stay with it.",
  "No one else needs to understand this but you.",
  "You traded numbness for everything.",
  "The hard days count the same as the easy ones.",
  "Being here is the practice.",
  "You're allowed to feel good about this.",
  "Not every day is easy. Every day is worth it.",
  "The life you're building is already underway.",
  "You didn't just stop something. You started everything.",
  "Presence is the whole point.",
  "This version of you is the real one.",
  "You are not who you were. You are who you are.",
  "Softness is not regression.",
  "Your body remembers what you've done for it.",
  "There is nothing braver than choosing to feel.",
  "Today is not a test. It's yours.",
  "The world is louder when you're paying attention.",
  "You chose discomfort over disconnection.",
  "That restlessness? It means you're alive.",
  "No one gave you this. You gave it to yourself.",
  "You've already done the hardest part: starting.",
  "Boredom is just your brain remembering what quiet sounds like.",
  "You wake up clear. That's not nothing.",
  "Mornings don't owe you anything. But you keep showing up.",
  "The people around you notice. Even if they don't say it.",
  "Every hour sober is an hour you got back.",
  "You're not white-knuckling. You're building.",
  "The days add up. But each one stands alone.",
  "There is no small amount of time to be proud of.",
  "You remembered yourself.",
  "This is what it looks like to choose yourself.",
  "You have more capacity than you think.",
  "Right now is the only moment that exists.",
  "You're not surviving this. You're living it.",
  "The things you feel are yours to keep.",
  "Steady isn't boring. Steady is powerful.",
  "You already know the answer.",
  "Nothing is missing.",
  "What you've built doesn't need anyone's approval.",
  "Your best thinking got you here. Trust it.",
  "It's okay to want more. That's called being alive.",
];

export function getTodaysIntention() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  return intentions[dayOfYear % intentions.length];
}

export function getIntentionForDate(date) {
  const d = new Date(date);
  const dayOfYear = Math.floor(
    (d - new Date(d.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  return intentions[dayOfYear % intentions.length];
}

export default intentions;