import React, { useEffect, useState } from "react";
import { hapticMedium } from "@/lib/haptics";

// 12 tick marks at 30° increments (month markers)
function TickMarks({ cx, cy, r, size }) {
  const ticks = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    const innerR = r + 6;
    const outerR = r + 11;
    ticks.push(
      <line
        key={i}
        x1={cx + innerR * Math.cos(rad)}
        y1={cy + innerR * Math.sin(rad)}
        x2={cx + outerR * Math.cos(rad)}
        y2={cy + outerR * Math.sin(rad)}
        stroke="var(--t-border)"
        strokeWidth={1}
      />
    );
  }
  return <>{ticks}</>;
}

export default function StreakRing({ days, size = 260, strokeWidth = 5 }) {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setPulse(v => !v), 2000);
    return () => clearInterval(id);
  }, []);

  const total = days;
  const yearPct = (total % 365) / 365;
  const yearsDone = Math.floor(total / 365);

  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth * 2 - 32) / 2; // inset for ticks + halo
  const circumference = 2 * Math.PI * r;
  const offset = circumference - yearPct * circumference;

  // Head dot position at arc tip
  const angleDeg = -90 + yearPct * 360;
  const angleRad = (angleDeg * Math.PI) / 180;
  const dotX = cx + r * Math.cos(angleRad);
  const dotY = cy + r * Math.sin(angleRad);

  const dotOpacity = pulse ? 1 : 0.85;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      onClick={hapticMedium}
    >
      {/* Radial halo behind ring */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 50%, rgba(110,143,163,0.10), transparent 68%)",
          pointerEvents: "none",
        }}
      />

      <svg width={size} height={size} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5b7d92" />
            <stop offset="100%" stopColor="#8aa9bd" />
          </linearGradient>
        </defs>

        {/* Tick marks */}
        <TickMarks cx={cx} cy={cy} r={r} size={size} />

        {/* Background ring track */}
        <circle cx={cx} cy={cy} r={r} stroke="var(--t-border)" strokeWidth={1} fill="none" />

        {/* Progress arc */}
        {total > 0 && (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            stroke="url(#ring-grad)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
          />
        )}

        {/* Glowing head dot */}
        {total > 0 && (
          <circle
            cx={dotX}
            cy={dotY}
            r={6}
            fill="#a8c5d8"
            style={{
              opacity: dotOpacity,
              transition: "opacity 2s ease-in-out",
              filter: "drop-shadow(0 0 8px rgba(168,197,216,0.6))",
            }}
          />
        )}
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
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
          {total.toLocaleString()}
        </span>
        <span
          style={{
            fontFamily: "'DM Sans', monospace",
            fontSize: 10,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "var(--t-accent)",
            marginTop: 10,
          }}
        >
          Clear Days
        </span>
        {yearsDone >= 1 && (
          <span
            style={{
              fontFamily: "'DM Sans', monospace",
              fontSize: 9,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--t-muted)",
              marginTop: 4,
            }}
          >
            Year {yearsDone + 1}
          </span>
        )}
      </div>
    </div>
  );
}