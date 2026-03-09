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
      style={{ backgroundColor: '#0f1219' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        <p className="text-[10px] uppercase tracking-widest font-medium mb-6" style={{ color: '#6F8FA4' }}>
          Milestone Reached
        </p>

        <h1 className="font-display text-4xl md:text-5xl font-medium text-white mb-3">
          {label}
        </h1>

        <p className="text-xs mb-10" style={{ color: '#6a7280' }}>
          {dateRange}
        </p>

        {/* Badge */}
        <div 
          className="w-32 h-32 rounded-full flex flex-col items-center justify-center mb-10 border-2"
          style={{ borderColor: '#6F8FA4', backgroundColor: '#0f1219' }}
        >
          <span className="font-display text-3xl font-medium" style={{ color: '#6F8FA4' }}>
            {days}
          </span>
          <span className="small-caps text-[10px] tracking-widest mt-1" style={{ color: '#6a7280' }}>
            Days
          </span>
        </div>

        <p className="font-display text-base italic text-white leading-relaxed mb-10 max-w-xs">
          "{quote}"
        </p>

        {/* Stats */}
        <div className="flex gap-6 mb-12">
          {[
            { label: "Days", value: days },
            { label: "Saved", value: `$${moneySaved.toLocaleString()}` },
            { label: "Hours", value: hoursReclaimed.toLocaleString() },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="font-display text-xl text-white">{s.value}</p>
              <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: '#6a7280' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={onShare}
          className="text-sm font-medium mb-4 transition-colors"
          style={{ color: '#6F8FA4' }}
        >
          Share this moment →
        </button>

        <button
          onClick={onDismiss}
          className="text-xs transition-colors"
          style={{ color: '#6a7280' }}
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}