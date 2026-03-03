import React from "react";

export default function StatCard({ label, value, sublabel, premium }) {
  return (
    <div 
      className="flex-1 rounded-xl p-4 relative"
      style={{ backgroundColor: '#1a1918' }}
    >
      {premium && (
        <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#c8a97e' }} />
      )}
      <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: '#8a8478' }}>
        {label}
      </p>
      <p className="font-display text-2xl font-medium text-white leading-none">
        {value}
      </p>
      {sublabel && (
        <p className="text-[11px] mt-1" style={{ color: '#8a8478' }}>
          {sublabel}
        </p>
      )}
    </div>
  );
}