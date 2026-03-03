import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AnimatePresence } from "framer-motion";
import StreakRing from "../components/current/StreakRing";
import IntentionCard from "../components/current/IntentionCard";
import StatCard from "../components/current/StatCard";
import BottomNav from "../components/current/BottomNav";
import MilestoneOverlay from "../components/current/MilestoneOverlay";
import { getDaysSince, isMilestoneDay } from "../components/current/milestoneData";

export default function Home() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMilestone, setShowMilestone] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const profiles = await base44.entities.UserProfile.list();
    if (profiles.length === 0 || !profiles[0].onboarding_complete) {
      navigate(createPageUrl("Onboarding"));
      return;
    }
    const p = profiles[0];
    setProfile(p);

    const days = getDaysSince(p.sobriety_date);
    const dismissed = sessionStorage.getItem(`milestone_${days}_dismissed`);
    if (isMilestoneDay(days) && !dismissed) {
      setShowMilestone(true);
    }
    setLoading(false);
  };

  if (loading || !profile) {
    return <div className="min-h-screen" style={{ backgroundColor: '#0e0e0f' }} />;
  }

  const days = getDaysSince(profile.sobriety_date);
  const savingsRate = profile.daily_savings_rate || 15;
  const moneySaved = days * savingsRate;
  const sinceDate = new Date(profile.sobriety_date).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric"
  });

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const getYearsMonths = () => {
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    if (years > 0 && months > 0) return `${years}y ${months}m`;
    if (years > 0) return `${years}y`;
    if (months > 0) return `${months}m`;
    return `${days}d`;
  };

  const handleShareMilestone = async () => {
    const text = `${days} days. Current.`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#0e0e0f' }}>
      <AnimatePresence>
        {showMilestone && (
          <MilestoneOverlay
            days={days}
            sobrietyDate={profile.sobriety_date}
            savingsRate={savingsRate}
            onDismiss={() => {
              sessionStorage.setItem(`milestone_${days}_dismissed`, "true");
              setShowMilestone(false);
            }}
            onShare={handleShareMilestone}
          />
        )}
      </AnimatePresence>

      <div className="px-6 pt-14 pb-6 max-w-lg mx-auto">
        {/* Greeting */}
        <p className="font-display text-xl text-white mb-10">
          {getGreeting()}, {profile.first_name}.
        </p>

        {/* Streak Ring */}
        <div className="flex flex-col items-center mb-3">
          <StreakRing days={days} />
          <p className="text-xs mt-4" style={{ color: '#8a8478' }}>
            Since {sinceDate}
          </p>
        </div>

        {/* Intention */}
        <div className="mt-8 mb-6">
          <IntentionCard />
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <StatCard label="Time" value={getYearsMonths()} />
          <StatCard label="Saved" value={`$${moneySaved.toLocaleString()}`} premium />
          <StatCard label="Near Me" value="5" sublabel="places" />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}