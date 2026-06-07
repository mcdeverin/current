import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BottomNav from "@/components/current/BottomNav";
import PullToRefresh from "@/components/current/PullToRefresh";

const WEEKS = 8;

// Build 8 weekly buckets of averaged value, oldest → newest.
// `pluck` returns the numeric value (or null) for a row.
function bucketByWeek(rows, pluck) {
  const buckets = Array.from({ length: WEEKS }, () => []);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  for (const row of rows) {
    const dateStr = row.date || (row.logged_at ? row.logged_at.slice(0, 10) : null);
    if (!dateStr) continue;
    const [y, m, d] = dateStr.split("-").map(Number);
    const rowDate = new Date(y, m - 1, d);
    const diffDays = Math.floor((now - rowDate) / 86400000);
    if (diffDays < 0 || diffDays >= WEEKS * 7) continue;
    const bucket = WEEKS - 1 - Math.floor(diffDays / 7);
    const v = pluck(row);
    if (v != null) buckets[bucket].push(v);
  }
  return buckets.map(b => (b.length === 0 ? null : b.reduce((a, x) => a + x, 0) / b.length));
}

function MiniLine({ series, max = 4, color }) {
  const W = 300;
  const H = 64;
  const padX = 4;
  const padY = 6;
  const filled = series.map(v => v ?? 0); // null → 0 just for drawing; opacity dimmed where missing
  if (filled.length < 2) {
    return (
      <p className="text-xs text-center" style={{ color: "var(--t-muted)" }}>
        Not enough data yet.
      </p>
    );
  }
  const stepX = (W - padX * 2) / (filled.length - 1);
  const toY = v => padY + (H - padY * 2) - (v / max) * (H - padY * 2);

  let d = `M ${padX} ${toY(filled[0])}`;
  for (let i = 1; i < filled.length; i++) {
    const px = padX + (i - 1) * stepX;
    const x = padX + i * stepX;
    const py = toY(filled[i - 1]);
    const y = toY(filled[i]);
    const cx = (px + x) / 2;
    d += ` C ${cx} ${py} ${cx} ${y} ${x} ${y}`;
  }
  const fillPath = `${d} L ${padX + (filled.length - 1) * stepX} ${H} L ${padX} ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <path d={fillPath} fill={color} opacity={0.10} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      {filled.map((v, i) => (
        <circle
          key={i}
          cx={padX + i * stepX}
          cy={toY(v)}
          r={i === filled.length - 1 ? 4 : 2.5}
          fill={i === filled.length - 1 ? "#a8c5d8" : color}
          opacity={series[i] == null ? 0.25 : 1}
        />
      ))}
    </svg>
  );
}

function trendInsight(series) {
  const real = series.filter(v => v != null);
  if (real.length < 4) return "Still gathering. Check back in a week.";
  const half = Math.floor(real.length / 2);
  const earlier = real.slice(0, half).reduce((a, b) => a + b, 0) / half;
  const later = real.slice(half).reduce((a, b) => a + b, 0) / (real.length - half);
  const delta = later - earlier;
  if (delta > 0.4) return "Up, gently. Whatever you're doing — keep doing it.";
  if (delta < -0.4) return "A softer stretch. Worth noticing, not fixing.";
  return "Steady. That's the work.";
}

export default function ProgressPage() {
  const [mood, setMood] = useState([]);
  const [energy, setEnergy] = useState([]); // null until MoodLog has energy_index
  const [sleep, setSleep] = useState([]);   // null until MoodLog has sleep_index
  const [drinkSeries, setDrinkSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) { setLoading(false); return; }
      const user = await base44.auth.me();

      // Mood (0..4 scale, persisted as mood_index)
      let moodLogs = [];
      try {
        moodLogs = await base44.entities.MoodLog.filter({ user_id: user.id }, "-logged_at", 200);
      } catch {}
      setMood(bucketByWeek(moodLogs, r => (typeof r.mood_index === "number" ? r.mood_index : null)));
      // Energy + sleep — only populate if the entity has those fields.
      // If not, leave the arrays empty so the chart hides cleanly.
      const hasEnergy = moodLogs.some(r => typeof r.energy_index === "number");
      const hasSleep = moodLogs.some(r => typeof r.sleep_index === "number");
      setEnergy(hasEnergy ? bucketByWeek(moodLogs, r => (typeof r.energy_index === "number" ? r.energy_index : null)) : []);
      setSleep(hasSleep ? bucketByWeek(moodLogs, r => (typeof r.sleep_index === "number" ? r.sleep_index : null)) : []);

      // Drinks (presence proxy: count of DrinkLogs per week)
      let drinkLogs = [];
      try {
        drinkLogs = await base44.entities.DrinkLogs.filter({ user_id: user.id }, "-logged_at", 200);
      } catch {}
      // For drinks, bucket the COUNT per week (each row = 1 incident)
      const buckets = Array.from({ length: WEEKS }, () => 0);
      const now = new Date(); now.setHours(0, 0, 0, 0);
      for (const row of drinkLogs) {
        const dateStr = row.date || (row.logged_at ? row.logged_at.slice(0, 10) : null);
        if (!dateStr) continue;
        const [y, m, d] = dateStr.split("-").map(Number);
        const diff = Math.floor((now - new Date(y, m - 1, d)) / 86400000);
        if (diff < 0 || diff >= WEEKS * 7) continue;
        buckets[WEEKS - 1 - Math.floor(diff / 7)] += 1;
      }
      setDrinkSeries(buckets.map(n => n)); // raw counts; null treatment not needed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const drinksThisWeek = drinkSeries[drinkSeries.length - 1] ?? 0;
  const drinksPrev = drinkSeries[drinkSeries.length - 2] ?? 0;
  const drinksDelta = drinksThisWeek - drinksPrev;

  return (
    <PullToRefresh onRefresh={load}>
      <div
        className="min-h-screen pb-24"
        style={{ backgroundColor: "var(--t-bg)", paddingTop: "calc(env(safe-area-inset-top,0px) + 72px)" }}
      >
        <div className="px-6 max-w-lg mx-auto">
          <p className="text-[10px] uppercase tracking-widest font-medium mb-1" style={{ color: "var(--t-accent)" }}>
            Progress
          </p>
          <h1 className="font-display font-medium mb-1" style={{ fontSize: 28, color: "var(--t-text)", lineHeight: 1.2 }}>
            Eight weeks.
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--t-muted)" }}>
            What you noticed, gently graphed.
          </p>

          {/* Mood */}
          <Card title="Mood" subtitle="0 = struggling, 4 = good">
            <MiniLine series={mood} max={4} color="var(--t-accent)" />
          </Card>

          {/* Drinks delta — shown as a single big number + tiny line */}
          <Card
            title="Drinks logged"
            subtitle={
              drinksDelta === 0
                ? "Same as last week."
                : drinksDelta > 0
                  ? `${drinksDelta} more than last week. That's still data.`
                  : `${Math.abs(drinksDelta)} fewer than last week.`
            }
          >
            <div className="flex items-baseline justify-between">
              <p
                className="font-display"
                style={{ fontSize: 44, color: "var(--t-text)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}
              >
                {drinksThisWeek}
              </p>
              <p className="text-[11px]" style={{ color: "var(--t-muted)" }}>this week</p>
            </div>
            <div className="mt-3">
              <MiniLine series={drinkSeries} max={Math.max(...drinkSeries, 1)} color="var(--t-accent)" />
            </div>
          </Card>

          {/* Energy + sleep — only render if MoodLog rows have those fields */}
          {(energy.length > 0 || sleep.length > 0) ? (
            <Card title="Energy & sleep">
              <div style={{ position: "relative" }}>
                {/* Stack two MiniLines with absolute positioning so both
                    appear on the same chart space. Energy = accent, sleep = sage. */}
                <div style={{ position: "relative" }}>
                  {energy.length > 0 && (
                    <MiniLine series={energy} max={4} color="var(--t-accent)" />
                  )}
                  {sleep.length > 0 && (
                    <div style={{
                      position: energy.length > 0 ? "absolute" : "relative",
                      inset: 0,
                      pointerEvents: "none",
                    }}>
                      <MiniLine series={sleep} max={4} color="#8FA298" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 mt-3">
                {energy.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span style={{ display: "inline-block", width: 10, height: 2, backgroundColor: "var(--t-accent)" }} />
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--t-muted)" }}>energy</span>
                  </span>
                )}
                {sleep.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span style={{ display: "inline-block", width: 10, height: 2, backgroundColor: "#8FA298" }} />
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--t-muted)" }}>sleep</span>
                  </span>
                )}
              </div>
            </Card>
          ) : (
            <Card
              title="Energy & sleep"
              subtitle="Coming when the daily check-in adds these. (Add `energy_index` and `sleep_index` to MoodLog.)"
            />
          )}

          {/* Noticed by Current */}
          <div
            style={{
              marginTop: 18,
              padding: 18,
              borderRadius: 12,
              backgroundColor: "var(--t-card-alt)",
              border: "1px solid var(--t-border)",
            }}
          >
            <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: "var(--t-accent)" }}>
              Noticed by Current
            </p>
            <p
              className="font-display italic"
              style={{ fontSize: 16, color: "var(--t-text-warm)", lineHeight: 1.5 }}
            >
              {loading ? "—" : trendInsight(mood)}
            </p>
          </div>
        </div>
        <BottomNav />
      </div>
    </PullToRefresh>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div
      className="mb-3"
      style={{
        padding: 18,
        borderRadius: 12,
        backgroundColor: "var(--t-card)",
        border: "1px solid var(--t-border)",
      }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--t-muted)" }}>{title}</p>
      </div>
      {children}
      {subtitle && (
        <p className="text-[11px] mt-3 text-center" style={{ color: "var(--t-muted)" }}>{subtitle}</p>
      )}
    </div>
  );
}
