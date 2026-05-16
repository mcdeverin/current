import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { hapticLight } from "@/lib/haptics";
import BottomNav from "../components/current/BottomNav";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STOPS = [
  { label: "struggling", response: "That's real. Just being here counts." },
  { label: null, response: "Some days ask more of you." },
  { label: "steady", response: "That's worth something." },
  { label: null, response: "Hold onto this." },
  { label: "good", response: "Notice it. That's the work." },
];

function getLocalDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDisplayAnswer(idx) {
  const answers = [
    "Struggling, today.",
    "Getting through it.",
    "Steady, today.",
    "Doing well.",
    "Really good.",
  ];
  return answers[idx] ?? "Steady, today.";
}

function getWeekdayName(offset) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

// Simple SVG waveform from 7 data points
function MoodWave({ points }) {
  const W = 300;
  const H = 74;
  const padX = 8;
  const padY = 8;
  const usableW = W - padX * 2;
  const usableH = H - padY * 2;

  if (!points || points.length === 0) return null;

  // Map 0–4 to y (inverted: 4 = top, 0 = bottom)
  const toY = (v) => padY + usableH - (v / 4) * usableH;
  const toX = (i) => padX + (i / (points.length - 1)) * usableW;

  // Build smooth cubic bezier path
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

  // Find lowest day
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
    <div
      style={{
        borderRadius: 12,
        backgroundColor: "var(--t-card)",
        border: "1px solid var(--t-border)",
        padding: 18,
        marginTop: 0,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 9.5,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--t-accent)",
          }}
        >
          This week
        </span>
        <span style={{ fontSize: 11, color: "var(--t-muted)" }}>7 days</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        {/* Fill */}
        <path d={fillPath} fill="rgba(110,143,163,0.10)" />
        {/* Line */}
        <path d={d} fill="none" stroke="var(--t-accent)" strokeWidth={1.5} />
        {/* Dots */}
        {coords.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={i === coords.length - 1 ? 4 : 2.5}
            fill={i === coords.length - 1 ? "#a8c5d8" : "var(--t-accent)"}
          />
        ))}
      </svg>
      <p
        className="text-center"
        style={{ fontSize: 11, color: "var(--t-muted)", marginTop: 8 }}
      >
        {caption}
      </p>
    </div>
  );
}

export default function MoodScale() {
  const navigate = useNavigate();
  const [selectedIdx, setSelectedIdx] = useState(2);
  const [weekPoints, setWeekPoints] = useState([2, 2, 1, 2, 2, 3, 2]);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const auth = await base44.auth.isAuthenticated();
        if (!auth) return;
        const me = await base44.auth.me();
        setUserEmail(me?.email || null);
        // Load last 7 days mood logs
        // We just show placeholder data if none exist — the waveform degrades gracefully
      } catch {}
    })();
  }, []);

  const handleSelect = (idx) => {
    hapticLight();
    setSelectedIdx(idx);
    // Update today's point in week view
    setWeekPoints(prev => {
      const next = [...prev];
      next[6] = idx;
      return next;
    });
  };

  const stop = STOPS[selectedIdx];

  return (
    <div
      className="min-h-screen pb-28"
      style={{ backgroundColor: "var(--t-bg)" }}
    >
      {/* Back button */}
      <div
        className="px-6 flex items-center gap-2"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 20px)", paddingBottom: 12 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1"
          style={{ color: "var(--t-muted)" }}
        >
          <ChevronLeft size={18} />
          <span style={{ fontSize: 13 }}>Back</span>
        </button>
      </div>

      <div
        className="mx-auto px-6"
        style={{ maxWidth: 380 }}
      >
        {/* Display answer — large heading */}
        <p
          className="font-display text-center"
          style={{
            fontSize: 34,
            fontWeight: 500,
            color: "var(--t-text)",
            marginBottom: 28,
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
          }}
        >
          {getDisplayAnswer(selectedIdx)}
        </p>

        {/* 5-stop scale */}
        <div style={{ marginBottom: 20, position: "relative", height: 56 }}>
          {/* Track background */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 12,
              right: 12,
              height: 2,
              backgroundColor: "var(--t-border)",
              transform: "translateY(-50%)",
            }}
          />
          {/* Filled track */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 12,
              width: `calc(${(selectedIdx / 4) * 100}% - 24px * ${selectedIdx / 4})`,
              height: 2,
              backgroundColor: "var(--t-accent)",
              transform: "translateY(-50%)",
              transition: "width 0.25s ease",
            }}
          />
          {/* Stops */}
          {STOPS.map((s, i) => {
            const pct = i / 4;
            const isActive = i === selectedIdx;
            const isPast = i < selectedIdx;
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: `calc(${pct * 100}%)`,
                  transform: "translate(-50%, -50%)",
                  width: isActive ? 26 : 10,
                  height: isActive ? 26 : 10,
                  borderRadius: "50%",
                  backgroundColor: isPast || isActive ? "var(--t-accent)" : "var(--t-border)",
                  border: isActive ? "2px solid var(--t-bg)" : "none",
                  boxShadow: isActive ? "0 0 0 4px rgba(110,143,163,0.18)" : "none",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  zIndex: 1,
                }}
              />
            );
          })}
        </div>

        {/* Labels under 0, 2, 4 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingLeft: 6,
            paddingRight: 6,
            marginBottom: 30,
          }}
        >
          {["struggling", null, "steady", null, "good"].map((lbl, i) =>
            lbl ? (
              <span key={i} style={{ fontSize: 10, color: "var(--t-muted)", fontFamily: "'DM Sans', sans-serif" }}>
                {lbl}
              </span>
            ) : (
              <span key={i} style={{ flex: 1 }} />
            )
          )}
        </div>

        {/* Response line */}
        <p
          className="font-display italic text-center"
          style={{ fontSize: 15, color: "var(--t-text)", marginBottom: 30 }}
        >
          {stop.response}
        </p>

        {/* This week waveform */}
        <MoodWave points={weekPoints} />
      </div>

      <BottomNav />
    </div>
  );
}