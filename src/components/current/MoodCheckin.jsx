import React, { useState, useEffect } from "react";

const MOODS = [
  { label: "Good", response: "That's worth something." },
  { label: "Okay", response: "Okay is enough." },
  { label: "Hard day", response: "You still showed up. That counts." },
];

function getTodayKey() {
  return `mood_checkin_${new Date().toISOString().split("T")[0]}`;
}

export default function MoodCheckin({ bare = false }) {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(getTodayKey());
    if (saved) setSelected(saved);
  }, []);

  const handleSelect = (label) => {
    setSelected(label);
    sessionStorage.setItem(getTodayKey(), label);
  };

  const response = selected ? MOODS.find(m => m.label === selected)?.response : null;

  if (bare) {
    return (
      <div>
        <p className="text-[10px] uppercase tracking-widest font-medium mb-3" style={{ color: 'var(--subtext)' }}>
          How are you right now?
        </p>
        {!selected ? (
          <div className="flex gap-2">
            {MOODS.map(({ label }) => (
              <button
                key={label}
                onClick={() => handleSelect(label)}
                className="px-4 py-1.5 rounded-full text-xs font-medium border transition-all"
                style={{ borderColor: 'var(--card-border)', color: 'var(--subtext)', backgroundColor: 'transparent' }}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--accent)' }}>{response}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--card-border)' }}>
      <p className="text-[10px] uppercase tracking-widest font-medium mb-4" style={{ color: 'var(--accent)' }}>
        How are you right now?
      </p>
      {!selected ? (
        <div className="flex gap-2">
          {MOODS.map(({ label }) => (
            <button
              key={label}
              onClick={() => handleSelect(label)}
              className="flex-1 py-2.5 rounded-lg text-xs font-medium transition-all"
              style={{ backgroundColor: 'var(--card-border)', color: 'var(--text)' }}
            >
              {label}
            </button>
          ))}
        </div>
      ) : (
        <p className="font-display text-base italic leading-relaxed" style={{ color: 'var(--text)' }}>
          "{response}"
        </p>
      )}
    </div>
  );
}