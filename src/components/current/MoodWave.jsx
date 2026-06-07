import React from "react";

function getWeekdayName(offset) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

/**
 * 7-day mood waveform card. Renders a cubic-bezier line through `points`
 * (each in 0..4), with a glowing terminal dot and an auto-generated
 * caption describing the shape.
 *
 * Used both inline on Today (InlineMoodScale) and on the Progress page.
 *
 * Props:
 *   points        — array of mood values 0..4 (length 7 expected)
 *   title         — eyebrow text (default "This week")
 *   subtitle      — right-aligned tiny label (default "7 days")
 *   showCaption   — boolean, default true. If false, omits the "Mostly steady…" line.
 */
export default function MoodWave({
  points,
  title = "This week",
  subtitle = "7 days",
  showCaption = true,
}) {
  const W = 300;
  const H = 74;
  const padX = 8;
  const padY = 8;
  const usableW = W - padX * 2;
  const usableH = H - padY * 2;

  if (!points || points.length === 0) return null;

  const toY = (v) => padY + usableH - (v / 4) * usableH;
  const toX = (i) => padX + (i / Math.max(points.length - 1, 1)) * usableW;

  const coords = points.map((v, i) => ({ x: toX(i), y: toY(v) }));
  let d = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const cp1x = (coords[i].x + coords[i + 1].x) / 2;
    const cp1y = coords[i].y;
    const cp2x = cp1x;
    const cp2y = coords[i + 1].y;
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${coords[i + 1].x} ${coords[i + 1].y}`;
  }
  const fillPath = `${d} L ${coords[coords.length - 1].x} ${H} L ${coords[0].x} ${H} Z`;

  let caption = null;
  if (showCaption) {
    let lowestIdx = 0;
    let lowestVal = points[0];
    for (let i = 1; i < points.length; i++) {
      if (points[i] < lowestVal) { lowestVal = points[i]; lowestIdx = i; }
    }
    const lowestDay = getWeekdayName(points.length - 1 - lowestIdx);
    const avgVal = points.reduce((a, b) => a + b, 0) / points.length;
    const levelLabel = avgVal >= 2.5 ? "Mostly steady" : avgVal >= 1.5 ? "Getting through it" : "A harder stretch";
    caption = `${levelLabel}. One harder ${lowestDay}.`;
  }

  return (
    <div style={{ borderRadius: 12, backgroundColor: "var(--t-card)", border: "1px solid var(--t-border)", padding: 18 }}>
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--t-accent)" }}>
          {title}
        </span>
        <span style={{ fontSize: 11, color: "var(--t-muted)" }}>{subtitle}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        <path d={fillPath} fill="rgba(110,143,163,0.10)" />
        <path d={d} fill="none" stroke="var(--t-accent)" strokeWidth={1.5} />
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
      {caption && (
        <p className="text-center" style={{ fontSize: 11, color: "var(--t-muted)", marginTop: 8 }}>{caption}</p>
      )}
    </div>
  );
}
