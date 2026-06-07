import React, { useState } from "react";
import { hapticLight } from "@/lib/haptics";

const STOPS = [
  { label: "struggling", response: "That's real. Just being here counts." },
  { label: null, response: "Some days ask more of you." },
  { label: "steady", response: "That's worth something." },
  { label: null, response: "Hold onto this." },
  { label: "good", response: "Notice it. That's the work." },
];

const DISPLAY_ANSWERS = [
  "Struggling, today.",
  "Getting through it.",
  "Steady, today.",
  "Doing well.",
  "Really good.",
];

function getWeekdayName(offset) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function MoodWave({ points }) {
  const W = 300;
  const H = 74;
  const padX = 8;
  const padY = 8;
  const usableW = W - padX * 2;
  const usableH = H - padY * 2;

  if (!points || points.length === 0) return null;

  const toY = (v) => padY + usableH - (v / 4) * usableH;
  const toX = (i) => padX + (i / (points.length - 1)) * usableW;

  const coords = points.map((v, i) => ({ x: toX(i), y: toY(v) }));
  let d = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const cp1x = (coords[i].x + coords[i + 1].x) / 2;
    const cp1y = coords[i].y;
    const cp2x = (coords[i].x + coords[i + 1].x) / 2;
    const cp2y = coords[i + 1].y;
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${coords[i + 1].x} ${coords[i + 1].y}`;
  }
  const fillPath = `${d} L ${coords[coords.length - 1].x} ${H} L ${coords[0].x} ${H} Z`;

  let lowestIdx = 0;
  let lowestVal = points[0];
  for (let i = 1; i < points.length; i++) {
    if (points[i] < lowestVal) { lowestVal = points[i]; lowestIdx = i; }
  }
  const lowestDay = getWeekdayName(points.length - 1 - lowestIdx);
  const avgVal = points.reduce((a, b) => a + b, 0) / points.length;
  const levelLabel = avgVal >= 2.5 ? "Mostly steady" : avgVal >= 1.5 ? "Getting through it" : "A harder stretch";
  const caption = `${levelLabel}. One harder ${lowestDay}.`;

  return (
    <div style={{ borderRadius: 12, backgroundColor: "var(--t-card)", border: "1px solid var(--t-border)", padding: 18, marginTop: 0 }}>
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--t-accent)" }}>
          This week
        </span>
        <span style={{ fontSize: 11, color: "var(--t-muted)" }}>7 days</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        <path d={fillPath} fill="rgba(110,143,163,0.10)" />
        <path d={d} fill="none" stroke="var(--t-accent)" strokeWidth={1.5} />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={i === coords.length - 1 ? 4 : 2.5} fill={i === coords.length - 1 ? "#a8c5d8" : "var(--t-accent)"} />
        ))}
      </svg>
      <p className="text-center" style={{ fontSize: 11, color: "var(--t-muted)", marginTop: 8 }}>{caption}</p>
    </div>
  );
}

export default function InlineMoodScale() {
  const [selectedIdx, setSelectedIdx] = useState(2);
  const [weekPoints, setWeekPoints] = useState([2, 2, 1, 2, 2, 3, 2]);

  const handleSelect = (idx) => {
    hapticLight();
    setSelectedIdx(idx);
    setWeekPoints(prev => { const next = [...prev]; next[6] = idx; return next; });
  };

  const stop = STOPS[selectedIdx];

  return (
    <div style={{ width: "100%" }}>
      {/* Eyebrow */}
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--t-accent)", marginBottom: 16 }}>
        How are you right now
      </p>

      {/* Display answer */}
      <p className="font-display" style={{ fontSize: 28, fontWeight: 500, color: "var(--t-text)", marginBottom: 24, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
        {DISPLAY_ANSWERS[selectedIdx]}
      </p>

      {/* 5-stop scale */}
      <div style={{ marginBottom: 16, position: "relative", height: 56 }}>
        <div style={{ position: "absolute", top: "50%", left: 12, right: 12, height: 2, backgroundColor: "var(--t-border)", transform: "translateY(-50%)" }} />
        <div style={{ position: "absolute", top: "50%", left: 12, width: `calc(${(selectedIdx / 4) * 100}% - 24px * ${selectedIdx / 4})`, height: 2, backgroundColor: "var(--t-accent)", transform: "translateY(-50%)", transition: "width 0.25s ease" }} />
        {STOPS.map((s, i) => {
          const pct = i / 4;
          const isActive = i === selectedIdx;
          const isPast = i < selectedIdx;
          return (
            <button key={i} onClick={() => handleSelect(i)} style={{ position: "absolute", top: "50%", left: `calc(${pct * 100}%)`, transform: "translate(-50%, -50%)", width: isActive ? 26 : 10, height: isActive ? 26 : 10, borderRadius: "50%", backgroundColor: isPast || isActive ? "var(--t-accent)" : "var(--t-border)", border: isActive ? "2px solid var(--t-bg)" : "none", boxShadow: isActive ? "0 0 0 4px rgba(110,143,163,0.18)" : "none", transition: "all 0.2s ease", cursor: "pointer", zIndex: 1 }} />
          );
        })}
      </div>

      {/* Labels */}
      <div style={{ display: "flex", justifyContent: "space-between", paddingLeft: 6, paddingRight: 6, marginBottom: 24 }}>
        {["struggling", null, "steady", null, "good"].map((lbl, i) =>
          lbl ? (
            <span key={i} style={{ fontSize: 10, color: "var(--t-muted)", fontFamily: "'DM Sans', sans-serif" }}>{lbl}</span>
          ) : (
            <span key={i} style={{ flex: 1 }} />
          )
        )}
      </div>

      {/* Response */}
      <p className="font-display italic text-center" style={{ fontSize: 14, color: "var(--t-text)", marginBottom: 24 }}>
        {stop.response}
      </p>

      {/* Waveform */}
      <MoodWave points={weekPoints} />
    </div>
  );
}