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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getDailyHeadline() {
  const headlines = [
    "Present tense.",
    "Just today.",
    "Stay here.",
    "One moment at a time.",
    "Breathe.",
    "Still moving.",
    "You made it to today."
  ];
  const day = new Date().toDateString();
  const seed = day.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return headlines[seed % headlines.length];
}

function getClearDayText(count) {
  const word = count === 1 ? "day" : "days";
  return `${count} clear ${word}`;
}

export default function Home() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [spotsCount, setSpotsCount] = useState(0);

  useEffect(() => {
    loadProfile();
    loadSpotsCount();
  }, []);

  const loadSpotsCount = async () => {
    const approved = await base44.entities.Places.filter({ status: "approved" });
    setSpotsCount(approved.length);
  };

  const loadProfile = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      setIsGuest(true);
      setLoading(false);
      return;
    }

    const profiles = await base44.entities.UserProfile.list();
    if (profiles.length === 0 || !profiles[0].onboarding_complete) {
      setIsGuest(true);
      setLoading(false);
      return;
    }

    const p = profiles[0];
    setProfile(p);
    setIsGuest(false);

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

  if (loading) {
    return <div className="min-h-screen" style={{ backgroundColor: '#0f1219' }} />;
  }

  // ── GUEST MODE ──────────────────────────────────────────────────────────────
  if (isGuest) {
    return (
      <div className="min-h-screen pb-24" style={{ backgroundColor: '#0f1219' }}>
        <div className="px-6 pt-14 pb-6 max-w-lg mx-auto">
          <p className="font-display text-xl mb-10" style={{ color: '#e8eaf0' }}>
            {getGreeting()}.
          </p>

          {/* Intention */}
          <div className="mb-8">
            <IntentionCard />
          </div>

          {/* Today's Move */}
          <div className="border-t mb-6" style={{ borderColor: '#232a35' }} />
          <div className="mb-8">
            <TodaysMove days={1} bare />
          </div>

          {/* NYC Spots card */}
          <button
            onClick={() => navigate(createPageUrl("NearMe"))}
            className="w-full rounded-xl p-4 text-left mb-8"
            style={{ backgroundColor: '#161b24', border: '1px solid #232a35' }}
          >
            <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: '#6F8FA4' }}>
              Discover
            </p>
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: '#6a7280' }}>Discover sober-friendly places in NYC</p>
              <span className="ml-3 flex-shrink-0" style={{ color: '#6F8FA4' }}>→</span>
            </div>
          </button>

          {/* Sign up CTA */}
          <div className="rounded-xl p-5 border" style={{ backgroundColor: '#161b24', borderColor: '#232a35' }}>
            <p className="font-display text-lg mb-1" style={{ color: '#e8eaf0' }}>Track your journey.</p>
            <p className="text-sm mb-4" style={{ color: '#6a7280' }}>
              Create a free account to track your streak, save your reason, and more.
            </p>
            <button
              onClick={() => base44.auth.redirectToLogin(createPageUrl("Onboarding"))}
              className="w-full py-3 rounded-xl text-sm font-medium"
              style={{ backgroundColor: '#6F8FA4', color: '#0f1219' }}
            >
              Get started
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── AUTHENTICATED MODE ───────────────────────────────────────────────────────
  const isExploring = profile.mode === "exploring";
  const days = (!isExploring && profile.sobriety_date) ? getDaysSince(profile.sobriety_date) : null;
  const savingsRate = profile.daily_savings_rate || 15;
  const moneySaved = days != null ? days * savingsRate : null;
  const sinceDate = profile.sobriety_date
    ? new Date(profile.sobriety_date).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : null;

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
        {/* STREAK MODE */}
        {!isExploring && (
          <>
            <p className="font-display text-xl mb-10" style={{ color: '#e8eaf0' }}>
              {getGreeting()}, {profile.first_name}.
            </p>
            {days != null && (
              <div className="flex flex-col items-center mb-3">
                <StreakRing days={days} />
                <p className="text-xs mt-4" style={{ color: '#6a7280' }}>
                  Since {sinceDate}
                </p>
              </div>
            )}
          </>
        )}

        {/* EXPLORING MODE */}
        {isExploring && (
          <>
            <div className="mb-10 pt-4">
              <p className="text-xl mb-6 font-body" style={{ color: '#e8eaf0' }}>
                {getGreeting()}, {profile.first_name}.
              </p>
              <p className="font-display text-5xl font-medium leading-tight mb-3" style={{ color: '#e8eaf0', letterSpacing: '-0.02em', fontFamily: "'Playfair Display', serif" }}>
                {getDailyHeadline()}
              </p>
              <p className="text-sm" style={{ color: '#6a7280' }}>
                You're here. That's enough.
              </p>
            </div>

            <div className="mb-8">
              <IntentionCard />
            </div>

            <div className="border-t mb-6" style={{ borderColor: '#232a35' }} />
            <div className="mb-8">
              <TodaysMove days={1} bare />
            </div>

            <div className="mb-6">
              <MoodCheckin bare />
            </div>

            <button
              onClick={() => navigate(createPageUrl("NearMe"))}
              className="w-full rounded-xl p-4 text-left"
              style={{ backgroundColor: '#161b24', border: '1px solid #232a35' }}
            >
              <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: '#6F8FA4' }}>
                Discover
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: '#6a7280' }}>Discover {spotsCount > 0 ? `${spotsCount} ` : ''}sober-friendly places in NYC</p>
                <span className="ml-3 flex-shrink-0" style={{ color: '#6F8FA4' }}>→</span>
              </div>
            </button>
          </>
        )}

        {/* STREAK layout */}
        {!isExploring && (
          <>
            <div className="mt-8 mb-4">
              <IntentionCard />
            </div>
            <div className="mb-4">
              <TodaysMove days={days || 1} />
            </div>
            <div className="mb-6">
              <MoodCheckin />
            </div>
            <div className="flex gap-3">
              <StatCard label="Time" value={getYearsMonths()} />
              <StatCard label="Saved" value={`$${(moneySaved || 0).toLocaleString()}`} premium />
              <StatCard label="NYC Spots" value={String(spotsCount)} sublabel="places" />
            </div>
          </>
        )}
      </div>

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