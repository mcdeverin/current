import React from "react";
import { getTodaysIntention } from "./intentions";

export default function IntentionCard() {
  const intention = getTodaysIntention();

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--card-border)' }}>
      <p className="text-[10px] uppercase tracking-widest font-medium mb-3" style={{ color: 'var(--accent)' }}>
        Today's Intention
      </p>
      <p className="font-display text-lg italic leading-relaxed" style={{ color: 'var(--text)' }}>
        "{intention}"
      </p>
    </div>
  );
}