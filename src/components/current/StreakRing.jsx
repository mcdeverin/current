import React from "react";
import { hapticMedium } from "@/lib/haptics";

export default function StreakRing({ days, size = 240, strokeWidth = 5 }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth * 2 - 20) / 2; // 20px inset for halo
  const circumference = 2 * Math.PI * r;
  const progress = Math.min(days / 365, 1);
  const offset = circumference - progress * circumference;

  // Head dot position: angle = -90 + progress * 360 degrees
  const angleDeg = -90 + progress * 360;
  const angleRad = (angleDeg * Math.PI) / 180;
  const dotX = cx + r * Math.cos(angleRad);
  const dotY = cy + r * Math.sin(angleRad);

  const gradientId = "ring-gradient";

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      onClick={hapticMedium}
    >
      <svg width={size} height={size} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5b7d92" />
            <stop offset="100%" stopColor="#8aa9bd" />
          </linearGradient>
          <radialGradient id="halo-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(110,143,163,0.10)" />
            <stop offset="70%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Outer halo */}
        <circle
          cx={cx}
          cy={cy}
          r={size / 2 - 2}
          fill="url(#halo-gradient)"
        />

        {/* Background ring track — hairline */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="var(--t-border)"
          strokeWidth={1}
          fill="none"
        />

        {/* Progress arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
        />

        {/* Glowing head dot */}
        {progress > 0 && (
          <circle
            cx={dotX}
            cy={dotY}
            r={6}
            fill="#a8c5d8"
            style={{
              filter: "drop-shadow(0 0 8px rgba(168,197,216,0.8))",
            }}
          />
        )}
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display leading-none"
          style={{
            fontSize: 86,
            fontWeight: 500,
            letterSpacing: "-0.03em",
            lineHeight: 0.9,
            color: "var(--t-text)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {days.toLocaleString()}
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 10.5,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            fontVariant: "small-caps",
            color: "#6F8FA4",
            marginTop: 8,
          }}
        >
          Clear days
        </span>
      </div>
    </div>
  );
}