import React, { useState, useEffect } from "react";
import { hapticLight } from "@/lib/haptics";

const MOODS = [
  { label: "Steady", response: "That's worth something." },
  { label: "Getting by", response: "You're showing up. That counts." },
  { label: "Tough", response: "Still here. That matters." },
];

function getLocalDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getTodayKey() {
  return `mood_checkin_${getLocalDateString()}`;
}

export default function MoodCheckin({ bare = false }) {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(getTodayKey());
    if (saved) setSelected(saved);
  }, []);

  const handleSelect = (label) => {
    hapticLight();
    setSelected(label);
    sessionStorage.setItem(getTodayKey(), label);
  };

  const response = selected ? MOODS.find(m => m.label === selected)?.response : null;

  if (bare) {
   return (
     <div className="text-center">
       <p className="text-[10px] uppercase tracking-widest font-medium mb-3" style={{ color: '#6F8FA4' }}>
         How are you right now?
       </p>
        {!selected ? (
          <div className="flex gap-2">
            {MOODS.map(({ label }) => (
              <button
                key={label}
                onClick={() => handleSelect(label)}
                className="px-4 py-1.5 rounded-full text-xs font-medium border transition-all"
                style={{ borderColor: '#e8eaf0', color: '#6F8FA4', backgroundColor: '#e8eaf0' }}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: '#6F8FA4' }}>{response}</p>
        )}
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 4 }}>
      <p
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 9.5,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--t-accent)",
          marginBottom: 10,
        }}
      >
        How are you right now?
      </p>
      {!selected ? (
        <div style={{ display: "flex", gap: 8 }}>
          {MOODS.map(({ label }) => (
            <button
              key={label}
              onClick={() => handleSelect(label)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 12,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                border: "1px solid var(--t-border)",
                backgroundColor: "var(--t-card)",
                color: "var(--t-muted)",
                transition: "all 0.15s ease",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      ) : (
        <p className="font-display italic" style={{ fontSize: 14, color: "var(--t-text)" }}>
          {response}
        </p>
      )}
    </div>
  );
}