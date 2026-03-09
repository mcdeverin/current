import React from "react";
import { getTodaysIntention } from "./intentions";
import { useTheme } from "./ThemeContext";

export default function IntentionCard() {
  const intention = getTodaysIntention();
  const { t } = useTheme();

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: t.bgSecondary, border: `1px solid ${t.border}` }}>
      <p className="text-[10px] uppercase tracking-widest font-medium mb-3" style={{ color: t.success }}>
        Today's Intention
      </p>
      <p className="font-display text-lg italic leading-relaxed" style={{ color: t.text }}>
        "{intention}"
      </p>
    </div>
  );
}