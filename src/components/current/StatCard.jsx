import React from "react";

export default function StatCard({ label, value, sublabel, premium }) {
  return (
    <div 
      className="flex-1 rounded-xl p-4 relative border"
      style={{ backgroundColor: '#ffffff', borderColor: '#e2e6e0' }}
    >
      {premium && (
        <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#8aab8e' }} />
      )}
      <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: '#6a7280' }}>
        {label}
      </p>
      <p className="font-display text-2xl font-medium leading-none" style={{ color: '#0f1219' }}>
        {value}
      </p>
      {sublabel && (
        <p className="text-[11px] mt-1" style={{ color: '#6a7280' }}>
          {sublabel}
        </p>
      )}
    </div>
  );
}