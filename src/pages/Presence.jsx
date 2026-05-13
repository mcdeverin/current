import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

function getLocalDateStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseLocalDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Build 22-week grid starting from week 0 of current year
function buildGrid() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now - startOfYear) / 86400000);
  const weeks = Math.min(Math.floor(dayOfYear / 7) + 1, 22);
  const cells = [];
  // Start from weeks ago
  const gridStart = new Date(now);
  gridStart.setDate(now.getDate() - (weeks - 1) * 7 - now.getDay());
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + w * 7 + d);
      if (date <= now) cells.push(getLocalDateStr(date));
    }
  }
  return { cells, weeks };
}

function getLongestStreak(activeDates) {
  if (!activeDates.size) return 0;
  const sorted = [...activeDates].sort();
  let max = 1, cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = parseLocalDate(sorted[i - 1]);
    const curr = parseLocalDate(sorted[i]);
    const diff = Math.round((curr - prev) / 86400000);
    if (diff === 1) { cur++; if (cur > max) max = cur; }
    else cur = 1;
  }
  return max;
}

function getThisWeekCount(activeDates) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  let count = 0;
  for (let i = 0; i <= now.getDay(); i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    if (activeDates.has(getLocalDateStr(d))) count++;
  }
  return count;
}

const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function Presence() {
  const [activeDates, setActiveDates] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me();
      if (!user) { setLoading(false); return; }
      const [moods, refs] = await Promise.all([
        base44.entities.MoodLog.filter({ user_email: user.email }),
        base44.entities.Reflection.filter({ user_email: user.email }),
      ]);
      const dates = new Set([
        ...moods.map(m => m.date),
        ...refs.map(r => r.date),
      ]);
      setActiveDates(dates);
      setLoading(false);
    })();
  }, []);

  const { cells, weeks } = buildGrid();
  const totalPresent = activeDates.size;
  const longestStreak = getLongestStreak(activeDates);
  const quietDays = cells.length - [...cells].filter(d => activeDates.has(d)).length;
  const thisWeek = getThisWeekCount(activeDates);

  const levelColors = [
    '#1a2230',
    'rgba(110,143,163,0.30)',
    'rgba(110,143,163,0.60)',
    '#6E8FA3',
  ];

  const getLevel = (date) => {
    if (!activeDates.has(date)) return 0;
    return 3; // single source = level 3 for now (could weight by both sources)
  };

  // Month labels: show at week boundaries
  const gridStartDate = cells[0] ? parseLocalDate(cells[0]) : new Date();

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-bg)', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>
      <div className="px-6 max-w-lg mx-auto">
        <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--t-muted)' }}>
          Presence
        </p>
        <p className="font-display text-4xl font-medium mb-1" style={{ color: 'var(--t-text)' }}>
          {totalPresent} days present
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--t-muted)' }}>this year, in your own quiet way.</p>

        {/* Heat grid */}
        <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'var(--t-card)', border: '1px solid var(--t-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>
              {/* Month labels */}
              {MONTH_ABBR[new Date().getMonth()]}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--t-accent)' }}>
              this week +{thisWeek}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${weeks}, 1fr)`,
              gridTemplateRows: 'repeat(7, 1fr)',
              gap: 3,
              gridAutoFlow: 'column',
            }}
          >
            {cells.map((date, i) => (
              <div
                key={date}
                title={date}
                style={{
                  aspectRatio: '1',
                  borderRadius: 2,
                  backgroundColor: levelColors[getLevel(date)],
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-[10px]" style={{ color: 'var(--t-muted)' }}>quieter</span>
            {levelColors.map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: c }} />
            ))}
            <span className="text-[10px]" style={{ color: 'var(--t-muted)' }}>fuller</span>
          </div>
        </div>

        {/* Summary cards */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1 rounded-xl p-4 border" style={{ backgroundColor: 'var(--t-card)', borderColor: 'var(--t-border)' }}>
            <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--t-muted)' }}>Longest weave</p>
            <p className="font-display text-[26px] leading-none" style={{ color: 'var(--t-text)' }}>
              {longestStreak} <span className="text-[11px] font-body" style={{ color: 'var(--t-muted)' }}>days</span>
            </p>
          </div>
          <div className="flex-1 rounded-xl p-4 border" style={{ backgroundColor: 'var(--t-card)', borderColor: 'var(--t-border)' }}>
            <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--t-muted)' }}>Quiet days</p>
            <p className="font-display text-[26px] leading-none" style={{ color: 'var(--t-text)' }}>
              {quietDays}
            </p>
          </div>
        </div>

        <p className="font-display text-sm italic text-center" style={{ color: 'var(--t-muted)' }}>
          Not every day is loud. The blanks count too.
        </p>
      </div>
    </div>
  );
}