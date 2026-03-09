import React from "react";
import { useTheme } from "./ThemeContext";

export default function StreakRing({ days, size = 220, strokeWidth = 4 }) {
  const { t } = useTheme();
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(days / 365, 1);
  const offset = circumference - progress * circumference;
  const innerR = radius - strokeWidth * 2;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={innerR} fill={t.bg} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={t.border} strokeWidth={strokeWidth} fill="none"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={t.success} strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-6xl font-medium leading-none" style={{ color: t.text }}>
          {days.toLocaleString()}
        </span>
        <span className="small-caps text-xs tracking-widest-custom mt-2" style={{ color: t.success }}>
          Days
        </span>
      </div>
    </div>
  );
}