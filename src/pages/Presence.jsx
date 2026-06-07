import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BottomNav from "@/components/current/BottomNav";
import PullToRefresh from "@/components/current/PullToRefresh";
import { getLocalDateString } from "@/lib/dates";

const COLS = 22;
const ROWS = 7;
const TOTAL_DAYS = COLS * ROWS; // 154 cells, ~5 months

// Level colors per brief
function cellColor(actionCount) {
  if (actionCount === 0) return "#1a2230";
  if (actionCount === 1) return "rgba(110,143,163,0.30)";
  if (actionCount === 2) return "rgba(110,143,163,0.60)";
  return "var(--t-accent)";
}

// Build {YYYY-MM-DD: actionCount} from PresenceLog rows.
function indexLogs(logs) {
  const map = {};
  for (const row of logs) {
    if (!row.date) continue;
    const n = Array.isArray(row.actions) ? row.actions.length : 0;
    map[row.date] = n;
  }
  return map;
}

// Returns an array of TOTAL_DAYS entries, oldest → newest, each:
// { date, dow (0-6), actions, isToday }
function buildGrid(logsByDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const out = [];
  for (let i = TOTAL_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = getLocalDateString(d);
    out.push({
      date: key,
      dow: d.getDay(),
      actions: logsByDate[key] || 0,
      isToday: i === 0,
    });
  }
  return out;
}

function longestWeave(grid) {
  let best = 0, cur = 0;
  for (const c of grid) {
    if (c.actions > 0) { cur += 1; if (cur > best) best = cur; }
    else cur = 0;
  }
  return best;
}

function quietDays(grid) {
  return grid.filter(c => c.actions === 0).length;
}

function presentDaysThisYear(logsByDate) {
  const year = new Date().getFullYear();
  let n = 0;
  for (const date of Object.keys(logsByDate)) {
    if (date.startsWith(`${year}-`) && logsByDate[date] > 0) n += 1;
  }
  return n;
}

export default function Presence() {
  const [grid, setGrid] = useState(null);
  const [yearCount, setYearCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) { setGrid(buildGrid({})); return; }
      const user = await base44.auth.me();
      const logs = await base44.entities.PresenceLog.filter({ user_id: user.id }, "-date", 400);
      const indexed = indexLogs(logs);
      setGrid(buildGrid(indexed));
      setYearCount(presentDaysThisYear(indexed));
    } catch {
      setGrid(buildGrid({}));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const longest = grid ? longestWeave(grid) : 0;
  const quiet = grid ? quietDays(grid) : 0;

  return (
    <PullToRefresh onRefresh={load}>
      <div
        className="min-h-screen pb-24"
        style={{ backgroundColor: "var(--t-bg)", paddingTop: "calc(env(safe-area-inset-top,0px) + 72px)" }}
      >
        <div className="px-6 max-w-lg mx-auto">
          <p className="text-[10px] uppercase tracking-widest font-medium mb-1" style={{ color: "var(--t-accent)" }}>
            Presence
          </p>
          <h1 className="font-display font-medium" style={{ fontSize: 28, color: "var(--t-text)", lineHeight: 1.15 }}>
            {loading ? "—" : `${yearCount} days present`}
          </h1>
          <p className="text-sm mt-1 mb-6" style={{ color: "var(--t-muted)" }}>
            this year, in your own quiet way.
          </p>

          {/* Heat grid card */}
          <div
            style={{
              backgroundColor: "var(--t-card)",
              border: "1px solid var(--t-border)",
              borderRadius: 12,
              padding: 18,
            }}
          >
            <div className="flex items-baseline justify-between mb-3">
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--t-muted)" }}>
                last 22 weeks
              </p>
              {grid && (
                <p className="text-[11px]" style={{ color: "var(--t-accent)" }}>
                  this week +{grid.slice(-7).filter(c => c.actions > 0).length}
                </p>
              )}
            </div>

            {/* Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                gridAutoFlow: "column",
                gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                gap: 3,
              }}
            >
              {grid?.map((c) => (
                <div
                  key={c.date}
                  aria-hidden
                  style={{
                    aspectRatio: "1",
                    borderRadius: 2,
                    backgroundColor: cellColor(c.actions),
                    outline: c.isToday ? "1px solid var(--t-text)" : undefined,
                    outlineOffset: -1,
                  }}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-1.5 mt-4">
              <span className="text-[10px]" style={{ color: "var(--t-muted)" }}>quieter</span>
              {[0, 1, 2, 3].map((lvl) => (
                <div
                  key={lvl}
                  style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: cellColor(lvl) }}
                />
              ))}
              <span className="text-[10px]" style={{ color: "var(--t-muted)" }}>fuller</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-3 mt-3">
            <StatTile label="Longest weave" value={longest} unit="days" />
            <StatTile label="Quiet days" value={quiet} unit={null} />
          </div>

          <p
            className="font-display italic text-center mt-8"
            style={{ fontSize: 14, color: "var(--t-muted)", lineHeight: 1.6 }}
          >
            Not every day is loud.<br />The blanks count too.
          </p>
        </div>
        <BottomNav />
      </div>
    </PullToRefresh>
  );
}

function StatTile({ label, value, unit }) {
  return (
    <div
      className="flex-1"
      style={{
        padding: "14px 14px",
        borderRadius: 12,
        backgroundColor: "var(--t-card)",
        border: "1px solid var(--t-border)",
      }}
    >
      <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--t-muted)" }}>{label}</p>
      <p
        className="font-display mt-1"
        style={{ fontSize: 26, color: "var(--t-text)", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}
      >
        {value}
        {unit && <span className="text-xs ml-1" style={{ color: "var(--t-muted)", fontFamily: "'DM Sans', sans-serif" }}>{unit}</span>}
      </p>
    </div>
  );
}
