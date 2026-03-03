import React from "react";

export default function StreakRing({ days, size = 220, strokeWidth = 4 }) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Cap at 365 for full ring, then reset visual
  const progress = Math.min(days / 365, 1);
  const offset = circumference - progress * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2a2826"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#c8a97e"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-6xl font-medium text-white leading-none">
          {days.toLocaleString()}
        </span>
        <span className="small-caps text-xs tracking-widest-custom mt-2" style={{ color: '#8a8478' }}>
          Days
        </span>
      </div>
    </div>
  );
}