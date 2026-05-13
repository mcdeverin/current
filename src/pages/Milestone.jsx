import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MilestoneOverlay from "../components/current/MilestoneOverlay";
import { getDaysSince } from "../components/current/milestoneData";

export default function Milestone() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profiles = await base44.entities.UserProfile.list();
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch (err) {
      console.error("loadProfile error:", err);
    }
  };

  if (!profile) {
    return <div className="min-h-screen" style={{ backgroundColor: '#0e0e0f' }} />;
  }

  const days = getDaysSince(profile.sobriety_date);

  const handleShare = async () => {
    const text = `${days} days. Current.`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <MilestoneOverlay
      days={days}
      sobrietyDate={profile.sobriety_date}
      savingsRate={profile.daily_savings_rate || 15}
      onDismiss={() => navigate(createPageUrl("Home"))}
      onShare={handleShare}
    />
  );
}