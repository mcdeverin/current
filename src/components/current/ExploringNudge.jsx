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
      style={{ backgroundColor: '#161b24', border: '1px solid #232a35' }}
    >
      <div className="flex-1">
        <p className="text-sm leading-relaxed" style={{ color: '#e8eaf0' }}>
          Track your days
        </p>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: '#6a7280' }}>
          Whenever you're ready, we'll be here.
        </p>
        <button
          onClick={handleSetDate}
          className="text-xs font-medium mt-3 transition-colors"
          style={{ color: '#6F8FA4' }}
        >
          Start tracking →
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