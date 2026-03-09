import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "./ThemeContext";

export default function ToneGuideModal({ onClose }) {
  const { t } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-end justify-center"
      style={{ backgroundColor: 'rgba(14,17,19,0.7)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-lg rounded-t-2xl p-6 pb-10"
        style={{ backgroundColor: t.bgSecondary, border: `1px solid ${t.border}` }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-8 h-1 rounded-full mx-auto mb-6" style={{ backgroundColor: t.border }} />
        
        <h2 className="font-display text-xl font-medium mb-4" style={{ color: t.text }}>
          Before you share.
        </h2>
        
        <p className="text-sm leading-relaxed mb-3" style={{ color: t.muted }}>
          This is a space for moments, not advice.
        </p>
        <p className="text-sm leading-relaxed mb-3" style={{ color: t.muted }}>
          Share what's true. Keep it short.
        </p>
        <p className="text-sm leading-relaxed mb-6" style={{ color: t.muted }}>
          First names only. No one needs to know more.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl text-sm font-medium transition-colors"
          style={{ backgroundColor: t.success, color: '#fff' }}
        >
          Got it
        </button>
      </motion.div>
    </motion.div>
  );
}