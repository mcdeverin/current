import React from "react";
import { milestones } from "./milestoneData";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function StreakRing({ days, size = 240, strokeWidth = 5, paused = false }) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(days / 365, 1);
  const offset = circumference - progress * circumference;
  const innerR = radius - strokeWidth * 2;
  const cx = size / 2, cy = size / 2;

  // Progress-head dot position
  const angle = -90 + progress * 360;
  const rad = (angle * Math.PI) / 180;
  const dotX = cx + radius * Math.cos(rad);
  const dotY = cy + radius * Math.sin(rad);

  // Next milestone strip
  const nextMilestone = milestones.find(m => m > days);
  const daysToNext = nextMilestone != null ? nextMilestone - days : null;
  const showStrip = daysToNext != null && daysToNext <= 30;

  const reduced = prefersReducedMotion();

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Radial halo */}
        <div style={{
          position: 'absolute',
          width: size + 40,
          height: size + 40,
          top: -20,
          left: -20,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(110,143,163,0.10), transparent 70%)',
          pointerEvents: 'none',
        }} />

        <svg
          width={size}
          height={size}
          style={!reduced ? { animation: 'ringBreath 4s ease-in-out infinite' } : {}}
        >
          <style>{`
            @keyframes ringBreath {
              0%, 100% { transform: scale(1.000); }
              50%       { transform: scale(1.012); }
            }
          `}</style>
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5b7d92" />
              <stop offset="100%" stopColor="#8aa9bd" />
            </linearGradient>
          </defs>

          {/* Inner fill */}
          <circle cx={cx} cy={cy} r={innerR} fill="var(--t-bg)" />
          {/* Track */}
          <circle cx={cx} cy={cy} r={radius} stroke="var(--t-border)" strokeWidth={strokeWidth} fill="none" />
          {/* Progress arc */}
          <circle
            cx={cx} cy={cy} r={radius}
            stroke="url(#ringGrad)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: `${cx}px ${cy}px`,
              transition: 'stroke-dashoffset 1.5s ease-out',
            }}
          />
          {/* Progress head dot */}
          {days > 0 && (
            <circle
              cx={dotX} cy={dotY} r={6}
              fill="#a8c5d8"
              style={{ filter: 'drop-shadow(0 0 8px rgba(168,197,216,0.7))' }}
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display font-medium leading-none"
            style={{ color: 'var(--t-text)', fontSize: 86, letterSpacing: '-0.03em', lineHeight: 0.9 }}
          >
            {days.toLocaleString()}
          </span>
          <span
            className="small-caps mt-2 font-medium"
            style={{ color: '#6F8FA4', fontSize: 11, letterSpacing: '0.3em' }}
          >
            {paused ? 'Paused' : 'Clear days'}
          </span>
        </div>
      </div>

      {/* Milestone strip */}
      {showStrip && (
        <div
          className="flex items-center justify-between w-full max-w-xs mt-3 px-4 py-3 rounded-xl"
          style={{ backgroundColor: 'var(--t-card-alt)', border: '1px solid var(--t-border)' }}
        >
          <div>
            <p className="text-[10px] uppercase tracking-widest font-medium mb-0.5" style={{ color: 'var(--t-muted)' }}>
              Next milestone
            </p>
            <p className="font-display text-[17px]" style={{ color: 'var(--t-text)' }}>
              {nextMilestone === 365 ? 'One Year' : `Day ${nextMilestone}`} · in {daysToNext} {daysToNext === 1 ? 'day' : 'days'}
            </p>
          </div>
          <div
            className="flex items-center justify-center"
            style={{
              width: 50, height: 50,
              borderRadius: '50%',
              border: '1.5px solid var(--t-accent)',
              flexShrink: 0,
            }}
          >
            <span className="font-display text-lg" style={{ color: 'var(--t-text)' }}>{daysToNext}</span>
          </div>
        </div>
      )}
    </div>
  );
}