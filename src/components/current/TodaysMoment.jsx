import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

export default function TodaysMoment() {
  const [intention, setIntention] = useState("");
  const [move, setMove] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const intentions = await base44.entities.DailyContent.filter({
      type: "intention",
      active: true
    });

    const moves = await base44.entities.DailyContent.filter({
      type: "move",
      active: true
    });

    if (intentions.length > 0) {
      const idx = getDayOfYear() % intentions.length;
      setIntention(intentions[idx].text);
    }

    if (moves.length > 0) {
      const idx = getDayOfYear() % moves.length;
      setMove(moves[idx].text);
    }

    setLoading(false);
  };

  if (loading) return null;

  return (
    <div 
      className="rounded-xl p-5 text-center"
      style={{ backgroundColor: 'var(--t-card-alt)' }}
    >
      <p className="text-[10px] uppercase tracking-widest font-medium mb-4" style={{ color: '#6F8FA4' }}>
        Today's Moment
      </p>
      <p className="font-display text-lg italic leading-relaxed mb-3 text-center" style={{ color: 'var(--t-text-warm)' }}>
        {intention}
      </p>
      <p className="text-base leading-relaxed text-center" style={{ color: 'var(--t-text-warm)', fontFamily: 'DM Sans, sans-serif' }}>
        {move}
      </p>
    </div>
  );
}