import React from "react";

const MOVES = [
  (d) => `You've done this ${d} times. Today is one more.`,
  (d) => `Tell someone what ${d} days feels like.`,
  () => `Find somewhere worth celebrating tonight.`,
  (d) => `${d} days means something. Let it.`,
  () => `You don't have to explain it to anyone today.`,
  () => `Open NYC Spots. You've earned a good night out.`,
  (d) => `${d} days in. Notice how different you feel.`,
  () => `Do one thing today that sober-you is proud of.`,
  (d) => {
    const word = d === 1 ? "morning" : "mornings";
    return `${d} ${word} clear. That matters.`;
  },
  () => `Text someone who's been rooting for you.`,
  () => `Buy yourself something small and good today.`,
  (d) => `Day ${d}. Still here. Still choosing this.`,
  () => `Go somewhere beautiful tonight. You can.`,
  () => `Write down one thing you'd have missed otherwise.`,
  (d) => `${d} days of waking up clear. Keep going.`,
  () => `Walk somewhere new after work today.`,
  () => `Make a reservation somewhere you've been meaning to go.`,
  (d) => `${d} days. Someone out there needs to hear that's possible.`,
  () => `Say no to something that doesn't serve you today.`,
  () => `Spend an hour doing exactly what you want.`,
  (d) => `You've built ${d} days. That's a foundation.`,
  () => `Find a new coffee spot. Linger.`,
  () => `Tell one person you're doing well. Because you are.`,
  (d) => `${d} days of showing up. Today's the same.`,
  () => `Do something tonight you couldn't have done before.`,
  () => `Let today be unremarkable. That's still a win.`,
  (d) => `Day ${d}: still the same choice, still worth it.`,
  () => `Go to bed at a time that respects your morning.`,
  (d) => `${d} days of proof that you can.`,
  () => `One small celebration. You decide what it looks like.`,
];

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

export default function TodaysMove({ days, bare = false }) {
  const idx = getDayOfYear() % MOVES.length;
  const move = MOVES[idx](days);

  if (bare) {
    return (
      <div>
        <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: '#6F8FA4' }}>
          Today's Move
        </p>
        <p className="text-sm leading-relaxed" style={{ color: '#e8eaf0', fontFamily: 'DM Sans, sans-serif' }}>
          {move} →
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: '#161b24' }}>
      <p className="text-[10px] uppercase tracking-widest font-medium mb-3" style={{ color: '#6F8FA4' }}>
        Today's Move
      </p>
      <p className="text-base leading-relaxed" style={{ color: '#f0f2ee', fontFamily: 'DM Sans, sans-serif' }}>
        {move}
      </p>
    </div>
  );
}