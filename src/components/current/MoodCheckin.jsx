import React, { useState, useEffect } from "react";

const MOODS = [
  { label: "Good", response: "That's worth something." },
  { label: "Okay", response: "Okay is enough." },
  { label: "Hard day", response: "You still showed up. That counts." },
];

function getTodayKey() {
  return `mood_checkin_${new Date().toISOString().split("T")[0]}`;
}

export default function MoodCheckin() {
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

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: '#161b24' }}>
      <p className="text-[10px] uppercase tracking-widest font-medium mb-4" style={{ color: '#8aab8e' }}>
        How are you right now?
      </p>
      {!selected ? (
        <div className="flex gap-2">
          {MOODS.map(({ label }) => (
            <button
              key={label}
              onClick={() => handleSelect(label)}
              className="flex-1 py-2.5 rounded-lg text-xs font-medium transition-all"
              style={{ backgroundColor: '#232a35', color: '#e8eaf0' }}
            >
              {label}
            </button>
          ))}
        </div>
      ) : (
        <p className="font-display text-base italic leading-relaxed" style={{ color: '#f0f2ee' }}>
          "{response}"
        </p>
      )}
    </div>
  );
}