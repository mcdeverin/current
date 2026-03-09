import React from "react";
import { getTodaysIntention } from "./intentions";

export default function IntentionCard() {
  const intention = getTodaysIntention();

  return (
    <div 
      className="rounded-xl p-5"
      style={{ backgroundColor: '#1a2430' }}
    >
      <p className="text-[10px] uppercase tracking-widest font-medium mb-3" style={{ color: '#6F8FA4' }}>
        Today's Intention
      </p>
      <p className="font-display text-lg italic leading-relaxed" style={{ color: '#f0f2ee' }}>
        "{intention}"
      </p>
    </div>
  );
}