import React, { useState, useEffect } from "react";

const MOODS = [
  { label: "Feeling steady", response: "That's worth something." },
  { label: "Getting by", response: "You're showing up. That counts." },
  { label: "Today's tough", response: "Still here. That matters." },
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
    <div className="rounded-xl p-5 text-center" style={{ backgroundColor: 'var(--t-card)' }}>
      <p className="text-[10px] uppercase tracking-widest font-medium mb-4" style={{ color: '#6F8FA4' }}>
        How are you right now?
      </p>
      {!selected ? (
        <div className="flex gap-2">
          {MOODS.map(({ label }) => (
            <button
              key={label}
              onClick={() => handleSelect(label)}
              className="flex-1 py-2.5 rounded-lg text-xs font-medium transition-all"
              style={{ backgroundColor: 'var(--t-border)', color: 'var(--t-text)' }}
            >
              {label}
            </button>
          ))}
        </div>
      ) : (
        <p className="font-display text-base italic leading-relaxed" style={{ color: 'var(--t-text-warm)' }}>
          "{response}"
        </p>
      )}
    </div>
  );
}