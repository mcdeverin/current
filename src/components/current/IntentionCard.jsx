import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

export default function IntentionCard() {
  const [intention, setIntention] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntention();
  }, []);

  const loadIntention = async () => {
    const content = await base44.entities.DailyContent.filter({
      type: "intention",
      active: true
    });

    if (content.length > 0) {
      const idx = getDayOfYear() % content.length;
      setIntention(content[idx].text);
    }
    setLoading(false);
  };

  if (loading) return null;

  return (
    <div 
      className="rounded-xl p-5"
      style={{ backgroundColor: '#1a2430' }}
    >
      <p className="text-[10px] uppercase tracking-widest font-medium mb-3" style={{ color: '#6F8FA4' }}>
        Today's Intention
      </p>
      <p className="font-display text-lg italic leading-relaxed" style={{ color: '#f0f2ee' }}>
        {intention}
      </p>
    </div>
  );
}