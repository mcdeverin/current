import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { hapticLight } from "@/lib/haptics";

const MOOD_LABELS = ["Struggling, today.", "Getting by, today.", "Steady, today.", "Decent, today.", "Good, today."];
const MOOD_RESPONSES = [
  "Still here. That matters.",
  "You're showing up. That counts.",
  "That's worth something.",
  "Keep going. You're doing it.",
  "Good. Hold onto that.",
];
const END_LABELS = ["struggling", "steady", "good"];

function getLocalDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function MoodHistory({ history }) {
  if (!history || history.length < 2) return null;
  const W = 220, H = 56;
  const max = 4, min = 0;
  const points = history.map((v, i) => {
    const x = (i / (history.length - 1)) * W;
    const y = H - ((v - min) / (max - min)) * H;
    return [x, y];
  });

  // Build smooth path with cubic bezier
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const cp1x = prev[0] + (cur[0] - prev[0]) / 3;
    const cp1y = prev[1];
    const cp2x = cur[0] - (cur[0] - prev[0]) / 3;
    const cp2y = cur[1];
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${cur[0]} ${cur[1]}`;
  }

  const last = points[points.length - 1];

  const avg = history.reduce((a, b) => a + b, 0) / history.length;
  const variance = history.reduce((a, b) => a + Math.abs(b - avg), 0) / history.length;
  let shapeText = "Mostly steady.";
  if (variance > 1.5) shapeText = "A week with some texture.";
  else if (avg >= 3) shapeText = "Mostly good this week.";
  else if (avg <= 1) shapeText = "A harder week. You're still here.";

  return (
    <div className="mt-4 rounded-xl p-4 border" style={{ backgroundColor: 'var(--t-card)', borderColor: 'var(--t-border)' }}>
      <p className="text-[10px] uppercase tracking-widest font-medium mb-3" style={{ color: 'var(--t-muted)' }}>Last 7 days</p>
      <svg width={W} height={H + 8} style={{ overflow: 'visible' }}>
        <path d={d} fill="none" stroke="var(--t-accent)" strokeWidth="1.5" strokeLinecap="round" />
        {/* Glow dot at final point */}
        <circle cx={last[0]} cy={last[1]} r={4} fill="#a8c5d8"
          style={{ filter: 'drop-shadow(0 0 6px rgba(168,197,216,0.8))' }} />
      </svg>
      <p className="text-[11px] mt-2" style={{ color: 'var(--t-muted)' }}>{shapeText}</p>
    </div>
  );
}

export default function MoodScale({ bare = false, userEmail = null }) {
  const [value, setValue] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadedEmail, setLoadedEmail] = useState(userEmail);

  useEffect(() => {
    (async () => {
      let email = userEmail;
      if (!email) {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const user = await base44.auth.me();
          email = user?.email;
        }
      }
      if (!email) return;
      setLoadedEmail(email);

      const today = getLocalDateStr();
      const logs = await base44.entities.MoodLog.filter({ user_email: email }, '-date', 7);
      const todayLog = logs.find(l => l.date === today);
      if (todayLog) setValue(todayLog.value);
      // Build history array (oldest first, 7 days)
      const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
      setHistory(sorted.map(l => l.value));
    })();
  }, [userEmail]);

  const handleSelect = async (v) => {
    hapticLight();
    setValue(v);
    if (!loadedEmail) return;
    const today = getLocalDateStr();
    const existing = await base44.entities.MoodLog.filter({ user_email: loadedEmail, date: today });
    const data = { user_email: loadedEmail, date: today, value: v, created_at: new Date().toISOString() };
    if (existing.length > 0) {
      await base44.entities.MoodLog.update(existing[0].id, data);
    } else {
      await base44.entities.MoodLog.create(data);
    }
    // Refresh history
    const logs = await base44.entities.MoodLog.filter({ user_email: loadedEmail }, '-date', 7);
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    setHistory(sorted.map(l => l.value));
  };

  const trackWidth = 220;
  const STOPS = [0, 1, 2, 3, 4];

  const ScaleUI = () => (
    <div>
      {value !== null && (
        <p className="font-display text-[28px] text-center mb-4" style={{ color: 'var(--t-text)' }}>
          {MOOD_LABELS[value]}
        </p>
      )}
      <div className="flex items-center justify-center mb-3">
        <div style={{ position: 'relative', width: trackWidth, height: 36 }}>
          {/* Track background */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: 'var(--t-border)',
            transform: 'translateY(-50%)',
          }} />
          {/* Filled track */}
          {value !== null && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              width: `${(value / 4) * 100}%`,
              height: 1.5,
              backgroundColor: 'var(--t-accent)',
              transform: 'translateY(-50%)',
              transition: 'width 0.2s ease',
            }} />
          )}
          {/* Stops */}
          {STOPS.map(v => {
            const isActive = value === v;
            const x = (v / 4) * trackWidth;
            return (
              <button
                key={v}
                onClick={() => handleSelect(v)}
                style={{
                  position: 'absolute',
                  left: x,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: isActive ? 26 : 10,
                  height: isActive ? 26 : 10,
                  borderRadius: '50%',
                  backgroundColor: isActive ? 'var(--t-accent)' : 'var(--t-border)',
                  border: isActive ? '4px solid var(--t-accent-bg)' : 'none',
                  transition: 'all 0.15s ease',
                  zIndex: isActive ? 2 : 1,
                }}
              />
            );
          })}
        </div>
      </div>
      {/* End labels */}
      <div className="flex justify-between" style={{ maxWidth: trackWidth, margin: '0 auto' }}>
        {["struggling", "steady", "good"].map((l, i) => (
          <p key={l} className="text-[10px]" style={{ color: 'var(--t-muted)' }}>{l}</p>
        ))}
      </div>
      {value !== null && (
        <p className="font-display text-sm italic text-center mt-3" style={{ color: 'var(--t-muted)' }}>
          {MOOD_RESPONSES[value]}
        </p>
      )}
      <MoodHistory history={history} />
    </div>
  );

  if (bare) {
    return (
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-widest font-medium mb-4" style={{ color: 'var(--t-accent)' }}>
          How are you right now?
        </p>
        <ScaleUI />
      </div>
    );
  }

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--t-card)' }}>
      <p className="text-[10px] uppercase tracking-widest font-medium mb-4 text-center" style={{ color: 'var(--t-accent)' }}>
        How are you right now?
      </p>
      <ScaleUI />
    </div>
  );
}