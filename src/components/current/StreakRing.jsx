import React from "react";

export default function StreakRing({ days, size = 220, strokeWidth = 4 }) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Cap at 365 for full ring, then reset visual
  const progress = Math.min(days / 365, 1);
  const offset = circumference - progress * circumference;

  // Inner circle radius slightly smaller than ring
  const innerR = radius - strokeWidth * 2;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Dark inner fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={innerR}
          fill="#1a2018"
        />
        {/* Background ring track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2d3d2e"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#8aab8e"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-6xl font-medium leading-none" style={{ color: '#f0f2ee' }}>
          {days.toLocaleString()}
        </span>
        <span className="small-caps text-xs tracking-widest-custom mt-2" style={{ color: '#8aab8e' }}>
          Days
        </span>
      </div>
    </div>
  );
}