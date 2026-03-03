import React from "react";
import { motion } from "framer-motion";

export default function ToneGuideModal({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-end justify-center"
      style={{ backgroundColor: 'rgba(14,14,15,0.6)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-lg rounded-t-2xl p-6 pb-10"
        style={{ backgroundColor: '#f5f2ec' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-8 h-1 rounded-full mx-auto mb-6" style={{ backgroundColor: '#d4d0c8' }} />
        
        <h2 className="font-display text-xl font-medium text-gray-900 mb-4">
          Before you share.
        </h2>
        
        <p className="text-sm leading-relaxed mb-3" style={{ color: '#8a8478' }}>
          This is a space for moments, not advice.
        </p>
        <p className="text-sm leading-relaxed mb-3" style={{ color: '#8a8478' }}>
          Share what's true. Keep it short.
        </p>
        <p className="text-sm leading-relaxed mb-6" style={{ color: '#8a8478' }}>
          First names only. No one needs to know more.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: '#0e0e0f' }}
        >
          Got it
        </button>
      </motion.div>
    </motion.div>
  );
}