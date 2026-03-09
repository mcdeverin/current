import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import MomentumBoost from "./MomentumBoost";

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

export default function TodaysMove({ days, bare = false }) {
  const [move, setMove] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMove();
  }, []);

  const loadMove = async () => {
    const content = await base44.entities.DailyContent.filter({
      type: "move",
      active: true
    });

    if (content.length > 0) {
      const idx = getDayOfYear() % content.length;
      setMove(content[idx].text);
    }
    setLoading(false);
  };

  if (loading) return null;

  if (bare) {
    return (
      <div>
        <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: '#6F8FA4' }}>
          Today's Move
        </p>
        <p className="text-sm leading-relaxed" style={{ color: '#e8eaf0', fontFamily: 'DM Sans, sans-serif' }}>
          {move} →
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: '#161b24' }}>
      <p className="text-[10px] uppercase tracking-widest font-medium mb-3" style={{ color: '#6F8FA4' }}>
        Today's Move
      </p>
      <p className="text-base leading-relaxed" style={{ color: '#f0f2ee', fontFamily: 'DM Sans, sans-serif' }}>
        {move}
      </p>
      <MomentumBoost />
    </div>
  );
}