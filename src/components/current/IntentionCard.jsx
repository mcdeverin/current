import React from "react";
import { getTodaysIntention } from "./intentions";

export default function IntentionCard() {
  const intention = getTodaysIntention();

  return (
    <div 
      className="rounded-xl p-5"
      style={{ backgroundColor: '#1a1918' }}
    >
      <p className="text-[10px] uppercase tracking-widest font-medium mb-3" style={{ color: '#c8a97e' }}>
        Today's Intention
      </p>
      <p className="font-display text-lg italic text-white leading-relaxed">
        "{intention}"
      </p>
    </div>
  );
}