import React from "react";
import { motion } from "framer-motion";
import { formatDateRange, getMilestoneLabel, getMilestoneQuote } from "./milestoneData";

export default function MilestoneOverlay({ days, sobrietyDate, savingsRate, onDismiss, onShare }) {
  const label = getMilestoneLabel(days);
  const quote = getMilestoneQuote(days);
  const dateRange = formatDateRange(sobrietyDate);
  const moneySaved = days * (savingsRate || 15);
  const hoursReclaimed = days * 3;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        <p className="text-[10px] uppercase tracking-widest font-medium mb-6" style={{ color: 'var(--accent)' }}>
          Milestone Reached
        </p>

        <h1 className="font-display text-4xl md:text-5xl font-medium mb-3" style={{ color: 'var(--text)' }}>
          {label}
        </h1>

        <p className="text-xs mb-10" style={{ color: 'var(--subtext)' }}>
          {dateRange}
        </p>

        <div 
          className="w-32 h-32 rounded-full flex flex-col items-center justify-center mb-10 border-2"
          style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--bg)' }}
        >
          <span className="font-display text-3xl font-medium" style={{ color: 'var(--accent)' }}>
            {days}
          </span>
          <span className="small-caps text-[10px] tracking-widest mt-1" style={{ color: 'var(--subtext)' }}>
            Days
          </span>
        </div>

        <p className="font-display text-base italic leading-relaxed mb-10 max-w-xs" style={{ color: 'var(--text)' }}>
          "{quote}"
        </p>

        <div className="flex gap-6 mb-12">
          {[
            { label: "Days", value: days },
            { label: "Saved", value: `$${moneySaved.toLocaleString()}` },
            { label: "Hours", value: hoursReclaimed.toLocaleString() },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="font-display text-xl" style={{ color: 'var(--text)' }}>{s.value}</p>
              <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: 'var(--subtext)' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <button onClick={onShare} className="text-sm font-medium mb-4 transition-colors" style={{ color: 'var(--accent)' }}>
          Share this moment →
        </button>

        <button onClick={onDismiss} className="text-xs transition-colors" style={{ color: 'var(--subtext)' }}>
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}