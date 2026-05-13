import React, { useState, useEffect, useRef } from "react";
import { hapticLight } from "@/lib/haptics";

// 4-7-8 pattern: inhale 4s, hold 7s, exhale 8s = 19s total
const PHASES = [
  { label: "Breathe in", duration: 4000 },
  { label: "Hold", duration: 7000 },
  { label: "Breathe out", duration: 8000 },
];
const TOTAL = PHASES.reduce((acc, p) => acc + p.duration, 0); // 19000ms

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function BreathRing({ size = 230 }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  const reduced = prefersReducedMotion();

  useEffect(() => {
    let raf;
    const tick = () => {
      const now = Date.now();
      const total = (now - startRef.current) % TOTAL;
      setElapsed(total);

      // Determine which phase
      let acc = 0;
      let idx = 0;
      for (let i = 0; i < PHASES.length; i++) {
        if (total < acc + PHASES[i].duration) { idx = i; break; }
        acc += PHASES[i].duration;
      }
      setPhaseIdx(prev => {
        if (prev !== idx) hapticLight();
        return idx;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Arc progress (0→1 across full cycle)
  const progress = elapsed / TOTAL;

  // Scale for inner circle based on phase
  let scale = 0.92;
  if (!reduced) {
    let acc = 0;
    for (let i = 0; i <= phaseIdx; i++) acc += i < phaseIdx ? PHASES[i].duration : 0;
    const phaseElapsed = elapsed - acc;
    const phaseFrac = phaseElapsed / PHASES[phaseIdx].duration;
    if (phaseIdx === 0) scale = 0.92 + phaseFrac * (1.04 - 0.92); // inhale → expand
    else if (phaseIdx === 1) scale = 1.04; // hold → steady
    else scale = 1.04 - phaseFrac * (1.04 - 0.92); // exhale → contract
  }

  const cx = size / 2;
  const cy = size / 2;
  const strokeW = 3;
  const r = (size - strokeW * 2) / 2 - 10;
  const circ = 2 * Math.PI * r;
  const offset = circ - progress * circ;
  const innerR = r - 24;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Halo */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(110,143,163,0.12), transparent 70%)',
        pointerEvents: 'none',
      }} />
      <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <linearGradient id="breathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5b7d92" />
            <stop offset="100%" stopColor="#8aa9bd" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--t-border)" strokeWidth={strokeW} />
        {/* Progress arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="url(#breathGrad)"
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dashoffset 0.1s linear' }}
        />
        {/* Inner circle fill */}
        <circle
          cx={cx} cy={cy} r={innerR}
          fill="var(--t-card)"
          style={!reduced ? { transform: `scale(${scale})`, transformOrigin: `${cx}px ${cy}px`, transition: 'transform 0.2s ease-out' } : {}}
        />
      </svg>
      <div className="relative flex flex-col items-center justify-center" style={{ zIndex: 1 }}>
        <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: 'var(--t-accent)' }}>
          {PHASES[phaseIdx].label}
        </p>
        <p className="font-display text-3xl font-medium mt-1" style={{ color: 'var(--t-text)', fontStyle: 'italic' }}>
          {phaseIdx === 0 ? "Breathe in" : phaseIdx === 1 ? "Hold" : "Breathe out"}
        </p>
      </div>
    </div>
  );
}