import React from "react";
import { hapticMedium } from "@/lib/haptics";

export default function StreakRing({ days, size = 220, strokeWidth = 4 }) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Cap at 365 for full ring, then reset visual
  const progress = Math.min(days / 365, 1);
  const offset = circumference - progress * circumference;

  // Inner circle radius slightly smaller than ring
  const innerR = radius - strokeWidth * 2;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }} onClick={hapticMedium}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Dark inner fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={innerR}
          fill="var(--t-bg)"
        />
        {/* Background ring track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--t-border)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#6E8FA3"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-6xl font-medium leading-none" style={{ color: 'var(--t-text)' }}>
          {days.toLocaleString()}
        </span>
        <span className="small-caps text-xs tracking-widest-custom mt-2" style={{ color: '#6F8FA4' }}>
          Days
        </span>
      </div>
    </div>
  );
}