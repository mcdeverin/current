import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const CHOICE_LABELS = {
  small_win: "A small win",
  person: "A person",
  made_it_through: "Just made it through",
};

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function groupByMonth(reflections) {
  const groups = {};
  for (const r of reflections) {
    const [y, m] = r.date.split("-");
    const key = `${y}-${m}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  }
  return groups;
}

function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function ReflectionThread() {
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me();
      if (!user) { setLoading(false); return; }
      const data = await base44.entities.Reflection.filter({ user_email: user.email }, '-date', 200);
      setReflections(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="py-16 text-center" style={{ color: 'var(--t-muted)', fontSize: 13 }}>Loading…</div>;

  if (reflections.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-display text-xl mb-2" style={{ color: 'var(--t-text)' }}>Nothing yet.</p>
        <p className="text-sm" style={{ color: 'var(--t-muted)' }}>Your thread starts tonight.</p>
      </div>
    );
  }

  const groups = groupByMonth(reflections);

  return (
    <div>
      {Object.entries(groups).map(([monthKey, entries]) => (
        <div key={monthKey} className="mb-8">
          <p className="text-[10px] uppercase tracking-widest font-medium mb-4" style={{ color: 'var(--t-muted)' }}>
            {monthLabel(monthKey)}
          </p>
          {entries.map((r, i) => (
            <div key={r.id} className="py-4" style={{ borderBottom: i < entries.length - 1 ? '1px solid var(--t-border)' : 'none' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--t-accent)' }}>{formatDate(r.date)}</p>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--t-text)' }}>{CHOICE_LABELS[r.choice]}</p>
              {r.note && (
                <p className="font-display text-sm italic leading-relaxed" style={{ color: 'var(--t-text-warm)' }}>{r.note}</p>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}