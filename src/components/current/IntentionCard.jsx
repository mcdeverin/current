import React from "react";
import { getTodaysIntention } from "./intentions";

export default function IntentionCard() {
  const intention = getTodaysIntention();

  return (
    <div 
      className="rounded-xl p-5"
      style={{ backgroundColor: '#161b24' }}
    >
      <p className="text-[10px] uppercase tracking-widest font-medium mb-3" style={{ color: '#8aab8e' }}>
        Today's Intention
      </p>
      <p className="font-display text-lg italic leading-relaxed" style={{ color: '#e8eaf0' }}>
        "{intention}"
      </p>
    </div>
  );
}