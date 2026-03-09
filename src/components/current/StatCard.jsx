import React from "react";

export default function StatCard({ label, value, sublabel, premium }) {
  return (
    <div 
      className="flex-1 rounded-xl p-4 relative border"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}
    >
      {premium && (
        <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
      )}
      <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--subtext)' }}>
        {label}
      </p>
      <p className="font-display text-2xl font-medium leading-none" style={{ color: 'var(--text)' }}>
        {value}
      </p>
      {sublabel && (
        <p className="text-[11px] mt-1" style={{ color: 'var(--subtext)' }}>
          {sublabel}
        </p>
      )}
    </div>
  );
}