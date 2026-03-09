import React from "react";
import { useTheme } from "./ThemeContext";

export default function StatCard({ label, value, sublabel, premium }) {
  const { t } = useTheme();
  return (
    <div 
      className="flex-1 rounded-xl p-4 relative border"
      style={{ backgroundColor: t.bgSecondary, borderColor: t.border }}
    >
      {premium && (
        <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.success }} />
      )}
      <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: t.muted }}>
        {label}
      </p>
      <p className="font-display text-2xl font-medium leading-none" style={{ color: t.text }}>
        {value}
      </p>
      {sublabel && (
        <p className="text-[11px] mt-1" style={{ color: t.muted }}>
          {sublabel}
        </p>
      )}
    </div>
  );
}