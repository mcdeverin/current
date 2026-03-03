import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { X } from "lucide-react";

export default function ExploringNudge({ profile, onDismiss }) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = async () => {
    setDismissed(true);
    await base44.entities.UserProfile.update(profile.id, {
      exploring_nudge_dismissed: true,
    });
    onDismiss?.();
  };

  const handleSetDate = () => {
    navigate(createPageUrl("Profile") + "?setDate=true");
  };

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ delay: 0.4 }}
      className="mx-6 mt-4 rounded-xl p-4 flex items-start gap-3"
      style={{ backgroundColor: '#ffffff', border: '1px solid #e2e6e0' }}
    >
      <div className="flex-1">
        <p className="text-sm leading-relaxed" style={{ color: '#0f1219' }}>
          Want to set a date?
        </p>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: '#6a7280' }}>
          No pressure. It's just for you.
        </p>
        <button
          onClick={handleSetDate}
          className="text-xs font-medium mt-3 transition-colors"
          style={{ color: '#8aab8e' }}
        >
          Set a date →
        </button>
      </div>
      <button
        onClick={handleDismiss}
        className="mt-0.5 p-1 rounded-lg transition-colors"
        style={{ color: '#6a7280' }}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}