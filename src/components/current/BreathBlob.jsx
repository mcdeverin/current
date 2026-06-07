import React, { useEffect, useState } from "react";
import { hapticLight } from "@/lib/haptics";

// 4-7-8 cycle (seconds) — total 19s per breath
export const PHASES = [
  { name: "Breathe in", secs: 4 },
  { name: "Hold", secs: 7 },
  { name: "Out", secs: 8 },
];
export const CYCLE = PHASES.reduce((a, p) => a + p.secs, 0);

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

/**
 * Liquid breath blob with surrounding progress ring that sweeps each
 * 4-7-8 phase. Center label cycles Breathe in / Hold / Out.
 *
 * Honors prefers-reduced-motion: blob holds still, label reads
 * "Breathe with me", no arc sweep.
 *
 * Props:
 *   size: pixel diameter of the outer ring (default 230)
 */
export default function BreathBlob({ size = 230 }) {
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState(0);

  // Schedule phase transitions with cumulative timeouts; re-arms each cycle.
  useEffect(() => {
    if (reducedMotion) return;
    let cumulative = 0;
    const timers = [];
    const schedule = () => {
      cumulative = 0;
      PHASES.forEach((p, i) => {
        cumulative += p.secs;
        const t = setTimeout(() => {
          setPhase((i + 1) % PHASES.length);
          hapticLight();
        }, cumulative * 1000);
        timers.push(t);
      });
      timers.push(setTimeout(schedule, CYCLE * 1000));
    };
    schedule();
    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  // Inset to give the arc breathing room
  const inset = Math.round(size * 0.115);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer thin ring */}
      <div
        style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "1.5px solid var(--t-border)",
        }}
      />
      {/* Animated progress arc — one full sweep per cycle */}
      {!reducedMotion && (
        <svg width={size} height={size} style={{ position: "absolute", transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2} cy={size / 2} r={size / 2 - 2}
            stroke="var(--t-accent)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * (size / 2 - 2)}
            style={{ animation: `arcSweep ${CYCLE}s linear infinite` }}
          />
        </svg>
      )}

      {/* Liquid blob — scales with breath */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{
          borderRadius: "50%",
          background: "rgba(110,143,163,0.10)",
          border: "1px solid rgba(110,143,163,0.30)",
          margin: inset,
          animation: reducedMotion ? "none" : `breathBlob ${CYCLE}s ease-in-out infinite`,
        }}
      >
        <p
          className="font-display italic"
          style={{ fontSize: 22, color: "var(--t-text)" }}
        >
          {reducedMotion ? "Breathe with me" : PHASES[phase].name}
        </p>
        <p
          className="mt-2 text-[10px] uppercase tracking-widest"
          style={{ color: "var(--t-muted)" }}
        >
          4 · 7 · 8
        </p>
      </div>

      {/* Keyframes scoped via global <style> — values computed from PHASES */}
      <style>{`
        @keyframes breathBlob {
          0%   { transform: scale(0.92); }
          ${(PHASES[0].secs / CYCLE * 100).toFixed(2)}%  { transform: scale(1.06); }
          ${((PHASES[0].secs + PHASES[1].secs) / CYCLE * 100).toFixed(2)}% { transform: scale(1.06); }
          100% { transform: scale(0.92); }
        }
        @keyframes arcSweep {
          from { stroke-dashoffset: ${2 * Math.PI * (size / 2 - 2)}; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
