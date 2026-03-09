import React from "react";

const BOOSTS = [
  "You're building momentum.",
  "Keep going.",
  "You're doing it.",
  "Stay with it.",
  "One step at a time.",
];

function getMomentumBoost() {
  const day = new Date().toDateString();
  const seed = day.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return BOOSTS[seed % BOOSTS.length];
}

export default function MomentumBoost() {
  return (
    <p className="text-xs mt-2" style={{ color: '#6a7280' }}>
      {getMomentumBoost()}
    </p>
  );
}