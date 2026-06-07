import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AnimatePresence } from "framer-motion";
import { scheduleDailyReminder } from "@/lib/notifications";
import PullToRefresh from "../components/current/PullToRefresh";
import StreakRing from "../components/current/StreakRing";
import BottomNav from "../components/current/BottomNav";
import MilestoneOverlay from "../components/current/MilestoneOverlay";
import ExploringNudge from "../components/current/ExploringNudge";
import TodaysMoment from "../components/current/TodaysMoment";
import InlineMoodScale from "../components/current/InlineMoodScale";
import { getDaysSince, isMilestoneDay } from "../components/current/milestoneData";
import { Sparkles, ChevronRight } from "lucide-react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getDailyHeadline() {
  const headlines = [
    "Stay here.",
    "Present tense.",
    "Just today.",
    "Keep going.",
    "One moment at a time."
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
    try {
      const approved = await base44.entities.Places.filter({ status: "approved" });
      setSpotsCount(approved.length);
    } catch (err) {
      console.error("loadSpotsCount error:", err);
    }
  };

  const loadProfile = async () => {
    try {
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

      scheduleDailyReminder(p.notification_time || "08:00");

      if (p.mode === "streak" && p.sobriety_date) {
        const days = getDaysSince(p.sobriety_date);
        const dismissed = sessionStorage.getItem(`milestone_${days}_dismissed`);
        if (isMilestoneDay(days) && !dismissed) {
          setShowMilestone(true);
        }
      }
    } catch (err) {
      console.error("loadProfile error:", err);
      setIsGuest(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen" style={{ backgroundColor: 'var(--t-bg)' }} />;
  }

  // ── GUEST MODE ──────────────────────────────────────────────────────────────
  if (isGuest) {
    return (
      <PullToRefresh onRefresh={loadProfile}>
      <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-bg)' }}>
        <div className="px-6 pb-6 max-w-lg mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>
          <p className="font-display text-xl mb-10 text-center" style={{ color: 'var(--t-text)' }}>
            {getGreeting()}.
          </p>

          {/* Today's Moment */}
          <div className="mb-12 flex justify-center">
            <div className="w-full max-w-xs">
              <TodaysMoment />
            </div>
          </div>

          {/* NYC Spots card */}
          <button
           onClick={() => navigate(createPageUrl("NearMe"))}
           className="w-full max-w-xs mx-auto block rounded-xl p-4 text-left mb-8"
           style={{ backgroundColor: 'var(--t-card)', border: '1px solid var(--t-border)' }}
           >
           <p className="text-[10px] uppercase tracking-widest font-medium mb-2 text-center" style={{ color: 'var(--t-accent)' }}>
             Discover
           </p>
           <div className="flex items-center justify-between">
              <p className="text-sm flex-1" style={{ color: 'var(--t-muted)' }}>Places that don't need a drink to be good</p>
              <span className="ml-3 flex-shrink-0" style={{ color: 'var(--t-accent)' }}>→</span>
            </div>
          </button>

          {/* Sign up CTA */}
          <div className="rounded-xl p-5 border text-center" style={{ backgroundColor: 'var(--t-card)', borderColor: 'var(--t-border)' }}>
          <p className="font-display text-lg mb-1" style={{ color: 'var(--t-text)' }}>Track your days</p>
          <p className="text-sm mb-4" style={{ color: 'var(--t-muted)' }}>
             Whenever you're ready, we'll be here.
           </p>
            <button
              onClick={async () => {
                const isAuth = await base44.auth.isAuthenticated();
                if (isAuth) {
                  navigate(createPageUrl("Onboarding"));
                } else {
                  base44.auth.redirectToLogin(createPageUrl("Onboarding"));
                }
              }}
              className="text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: '#6F8FA4' }}
            >
              Start tracking →
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
      </PullToRefresh>
    );
  }

  // ── AUTHENTICATED MODE ───────────────────────────────────────────────────────
  const isExploring = profile.mode === "exploring";
  const days = (!isExploring && profile.sobriety_date) ? getDaysSince(profile.sobriety_date) : null;
  const savingsRate = profile.daily_savings_rate || 15;
  const moneySaved = days != null ? days * savingsRate : null;
  const sinceDate = profile.sobriety_date
    ? new Date(profile.sobriety_date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
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
    try {
      const text = `${days} days. Current.`;
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {}
  };

  return (
    <PullToRefresh onRefresh={loadProfile}>
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-bg)' }}>
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

      <div className="px-6 pb-6 max-w-lg mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>
        {/* STREAK MODE */}
        {!isExploring && (
          <>
            {days != null && (
              <div className="flex flex-col items-center mb-2">
                <StreakRing days={days} />
                <p className="text-xs mt-3 font-medium" style={{ color: 'var(--t-text)' }}>
                  {getClearDayText(days)}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--t-muted)' }}>
                  Since {sinceDate}
                </p>
              </div>
            )}
          </>
        )}

        {/* EXPLORING MODE */}
        {isExploring && (
          <>
            <div className="flex items-center mb-6">
              <p className="text-sm font-body" style={{ color: 'var(--t-muted)' }}>
                {getGreeting()}, {profile.first_name}.
              </p>
            </div>
            <div className="mb-8 pt-2 text-center">
              <div className="max-w-sm mx-auto">
                <p className="font-display text-5xl font-medium leading-tight mb-3" style={{ color: 'var(--t-text)', letterSpacing: '-0.02em', fontFamily: "'Playfair Display', serif" }}>
                  {getDailyHeadline()}
                </p>
              </div>
              <p className="text-sm" style={{ color: 'var(--t-muted)' }}>
                You're here. That's enough.
              </p>
            </div>

            <div className="mb-5 flex justify-center">
              <div className="w-full max-w-xs">
                <TodaysMoment />
              </div>
            </div>

            <button
              onClick={() => navigate(createPageUrl("NearMe"))}
              className="w-full max-w-xs mx-auto block rounded-xl p-4 text-left mb-4"
              style={{ backgroundColor: 'var(--t-card)', border: '1px solid var(--t-border)' }}
            >
              <p className="text-[10px] uppercase tracking-widest font-medium mb-2 text-center" style={{ color: 'var(--t-accent)' }}>
                Discover
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm flex-1" style={{ color: 'var(--t-muted)' }}>Places that don't need a drink to be good</p>
                <span className="ml-3 flex-shrink-0" style={{ color: 'var(--t-accent)' }}>→</span>
              </div>
            </button>
          </>
        )}

        {/* STREAK layout — inline mood scale */}
        {!isExploring && (
          <>
            {/* Serif rule handoff */}
            <div style={{ textAlign: "center", margin: "28px 0 24px" }}>
              <p className="font-display italic" style={{ fontSize: 13, color: "var(--t-muted)", letterSpacing: "0.01em" }}>
                and you, right now
              </p>
              <div style={{ width: 40, height: 1, backgroundColor: "var(--t-border)", margin: "10px auto 0" }} />
            </div>

            <div className="w-full max-w-xs mx-auto mb-4">
              <InlineMoodScale />
            </div>

            <div className="mb-4 flex justify-center">
              <div className="w-full max-w-xs">
                <TodaysMoment />
              </div>
            </div>
          </>
        )}
      </div>

      {isExploring && showNudge && (
        <div className="px-6 pb-6 max-w-lg mx-auto">
          <ExploringNudge
            profile={profile}
            onDismiss={() => setShowNudge(false)}
          />
        </div>
      )}

      {/* Evening Reflection pill — always above bottom nav */}
      <div className="px-6 max-w-lg mx-auto mb-4">
        <button
          onClick={() => navigate("/Reflection")}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderRadius: 999,
            backgroundColor: 'transparent',
            border: '1px solid var(--t-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={12} strokeWidth={1.5} style={{ color: 'var(--t-accent)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--t-muted)', fontFamily: "'DM Sans', sans-serif" }}>
              Tonight's reflection · 1 minute
            </span>
          </div>
          <ChevronRight size={12} strokeWidth={1.5} style={{ color: 'var(--t-muted)', flexShrink: 0 }} />
        </button>
      </div>

      <BottomNav />
    </div>
    </PullToRefresh>
  );
}