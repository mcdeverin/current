import React from "react";

export default function BudgetJar({ saved, goal, goalLabel, onTap }) {
  const fillPercent = goal > 0 ? Math.min((saved / goal) * 100, 100) : 100;
  const daysLeft = goal > 0 && saved < goal ? Math.ceil((goal - saved) / 15) : 0;

  return (
    <button
      onClick={onTap}
      className="w-full rounded-xl p-5 border text-left overflow-hidden relative"
      style={{ backgroundColor: 'var(--t-card)', borderColor: 'var(--t-border)', minHeight: 180 }}
    >
      {/* Fill rectangle */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${fillPercent}%`,
          background: 'linear-gradient(to top, rgba(110,143,163,0.25), rgba(110,143,163,0.08))',
          transition: 'height 1s ease-out',
        }}
      />
      <div className="relative z-10">
        <p className="text-[10px] uppercase tracking-widest font-medium mb-1" style={{ color: 'var(--t-muted)' }}>Saving toward</p>
        {goalLabel ? (
          <>
            <p className="font-display text-[22px] italic mb-1" style={{ color: 'var(--t-text)' }}>{goalLabel}</p>
            <p className="text-xs" style={{ color: 'var(--t-muted)' }}>
              ${saved.toLocaleString()} of ${goal?.toLocaleString() || "?"}{daysLeft > 0 ? ` · ~${daysLeft} days to go` : ' · reached'}
            </p>
          </>
        ) : (
          <p className="text-sm" style={{ color: 'var(--t-accent)' }}>Set a goal →</p>
        )}
      </div>
    </button>
  );
}