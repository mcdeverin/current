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
import ExploringNudge from "../components/current/ExploringNudge";
import TodaysMove from "../components/current/TodaysMove";
import MoodCheckin from "../components/current/MoodCheckin";
import { getDaysSince, isMilestoneDay } from "../components/current/milestoneData";

export default function Home() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMilestone, setShowMilestone] = useState(false);
  const [showNudge, setShowNudge] = useState(false);

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

    if (p.mode === "exploring" && !p.exploring_nudge_dismissed) {
      setShowNudge(true);
    }

    if (p.mode === "streak" && p.sobriety_date) {
      const days = getDaysSince(p.sobriety_date);
      const dismissed = sessionStorage.getItem(`milestone_${days}_dismissed`);
      if (isMilestoneDay(days) && !dismissed) {
        setShowMilestone(true);
      }
    }

    setLoading(false);
  };

  if (loading || !profile) {
    return <div className="min-h-screen" style={{ backgroundColor: '#0f1219' }} />;
  }

  const isExploring = profile.mode === "exploring";
  const days = (!isExploring && profile.sobriety_date) ? getDaysSince(profile.sobriety_date) : null;
  const savingsRate = profile.daily_savings_rate || 15;
  const moneySaved = days != null ? days * savingsRate : null;
  const sinceDate = profile.sobriety_date
    ? new Date(profile.sobriety_date).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : null;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const getYearsMonths = () => {
    if (days == null) return "—";
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
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#0f1219' }}>
      <AnimatePresence>
        {showMilestone && days != null && (
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
        <p className="font-display text-xl mb-10" style={{ color: '#e8eaf0' }}>
          {getGreeting()}, {profile.first_name}.
        </p>

        {/* STREAK MODE: Ring */}
        {!isExploring && days != null && (
          <div className="flex flex-col items-center mb-3">
            <StreakRing days={days} />
            <p className="text-xs mt-4" style={{ color: '#6a7280' }}>
              Since {sinceDate}
            </p>
          </div>
        )}

        {/* EXPLORING MODE: Hero statement */}
        {isExploring && (
          <div className="flex flex-col items-center mb-3 py-8">
            <p className="font-display text-5xl font-medium text-center leading-tight" style={{ color: '#e8eaf0', letterSpacing: '-0.02em' }}>
              Present tense.
            </p>
            <p className="text-sm mt-4 text-center max-w-xs" style={{ color: '#6a7280' }}>
              You're here. That's enough.
            </p>
          </div>
        )}

        {/* Intention */}
        <div className="mt-8 mb-4">
          <IntentionCard />
        </div>

        {/* Today's Move + Mood — streak mode only */}
        {!isExploring && (
          <>
            <div className="mb-4">
              <TodaysMove days={days || 1} />
            </div>
            <div className="mb-6">
              <MoodCheckin />
            </div>
          </>
        )}

        {/* Stats — only for streak mode */}
        {!isExploring && (
          <div className="flex gap-3">
            <StatCard label="Time" value={getYearsMonths()} />
            <StatCard label="Saved" value={`$${(moneySaved || 0).toLocaleString()}`} premium />
            <StatCard label="NYC Spots" value="18" sublabel="places" />
          </div>
        )}

        {/* Exploring: two cards */}
        {isExploring && (
          <div className="flex gap-3">
            <StatCard label="NYC Spots" value="18" sublabel="places" />
            <StatCard label="Days Free" value="1" sublabel="and counting" />
          </div>
        )}
      </div>

      {/* Exploring nudge — rendered outside padding container, no max-w */}
      <AnimatePresence>
        {isExploring && showNudge && (
          <ExploringNudge
            profile={profile}
            onDismiss={() => setShowNudge(false)}
          />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}