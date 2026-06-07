import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AnimatePresence } from "framer-motion";
import { scheduleDailyReminder } from "@/lib/notifications";
import { logPresence } from "@/lib/presence";
import PullToRefresh from "../components/current/PullToRefresh";
import StreakRing from "../components/current/StreakRing";
import BottomNav from "../components/current/BottomNav";
import MilestoneOverlay from "../components/current/MilestoneOverlay";
import ExploringNudge from "../components/current/ExploringNudge";
import TodaysMoment from "../components/current/TodaysMoment";
import InlineMoodScale from "../components/current/InlineMoodScale";
import QuietHours, { isQuietNow } from "../components/current/QuietHours";
import { getDaysSince, isMilestoneDay, getNextMilestone } from "../components/current/milestoneData";
import { Sparkles, ChevronRight, Anchor as AnchorIcon } from "lucide-react";

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
  const seed = day.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return headlines[seed % headlines.length];
}

export default function Home() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [showNudge, setShowNudge] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) { setIsGuest(true); setLoading(false); return; }

      const profiles = await base44.entities.UserProfile.list();
      if (profiles.length === 0 || !profiles[0].onboarding_complete) {
        setIsGuest(true);
        setLoading(false);
        return;
      }

      const p = profiles[0];
      setProfile(p);
      setIsGuest(false);

      scheduleDailyReminder(p.notification_time || "08:00");
      logPresence("opened");

      if (p.mode === "exploring" && !p.exploring_nudge_dismissed) {
        setShowNudge(true);
      }

      if (p.mode === "streak" && p.sobriety_date) {
        const days = getDaysSince(p.sobriety_date);
        const dismissed = sessionStorage.getItem(`milestone_${days}_dismissed`);
        if (isMilestoneDay(days) && !dismissed) setShowMilestone(true);
      }
    } catch (err) {
      console.error("loadProfile error:", err);
      setIsGuest(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen" style={{ backgroundColor: 'var(--t-bg)' }} />;

  // ── GUEST ──────────────────────────────────────────────────────────────────
  if (isGuest) {
    return (
      <PullToRefresh onRefresh={loadProfile}>
        <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-bg)' }}>
          <div className="px-6 pb-6 max-w-lg mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>
            <p className="font-display text-xl mb-10 text-center" style={{ color: 'var(--t-text)' }}>
              {getGreeting()}.
            </p>
            <div className="mb-10 flex justify-center">
              <div className="w-full max-w-xs"><TodaysMoment /></div>
            </div>
            <button
              onClick={() => navigate(createPageUrl("Spots"))}
              className="w-full max-w-xs mx-auto block rounded-xl p-4 text-left mb-8"
              style={{ backgroundColor: 'var(--t-card)', border: '1px solid var(--t-border)' }}
            >
              <p className="text-[10px] uppercase tracking-widest font-medium mb-2 text-center" style={{ color: 'var(--t-accent)' }}>Discover</p>
              <div className="flex items-center justify-between">
                <p className="text-sm flex-1" style={{ color: 'var(--t-muted)' }}>Places that don't need a drink to be good</p>
                <span className="ml-3 flex-shrink-0" style={{ color: 'var(--t-accent)' }}>→</span>
              </div>
            </button>
            <div className="rounded-xl p-5 border text-center" style={{ backgroundColor: 'var(--t-card)', borderColor: 'var(--t-border)' }}>
              <p className="font-display text-lg mb-1" style={{ color: 'var(--t-text)' }}>Track your days</p>
              <p className="text-sm mb-4" style={{ color: 'var(--t-muted)' }}>Whenever you're ready, we'll be here.</p>
              <button
                onClick={async () => {
                  const isAuth = await base44.auth.isAuthenticated();
                  if (isAuth) navigate(createPageUrl("Onboarding"));
                  else base44.auth.redirectToLogin(createPageUrl("Onboarding"));
                }}
                className="text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: 'var(--t-accent)' }}
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

  // ── AUTHENTICATED ──────────────────────────────────────────────────────────
  const isExploring = profile.mode === "exploring";
  const days = (!isExploring && profile.sobriety_date) ? getDaysSince(profile.sobriety_date) : null;
  const savingsRate = profile.daily_savings_rate || 15;

  // Contextual pill logic
  const hour = new Date().getHours();
  const dow = new Date().getDay(); // 0=Sun … 6=Sat
  const showReflectionPill = hour >= 19; // after 7pm
  const showRoomPill = hour >= 6 && hour < 19; // daytime
  const showMocktailsCard = dow === 4 || dow === 5 || dow === 6 || hour >= 17; // Thu/Fri/Sat or after 5pm
  const showAnchorButton = profile.anchor_button_enabled !== false;
  const isPaused = !!profile.paused;
  const quietActive = isQuietNow(profile);

  const handleEndPause = async () => {
    try {
      await base44.entities.UserProfile.update(profile.id, { paused: false, pause_until: null });
      setProfile(prev => ({ ...prev, paused: false, pause_until: null }));
    } catch (err) { console.error("End pause failed:", err); }
  };

  const handleShareMilestone = async () => {
    try {
      const text = `${days} days. Current.`;
      if (navigator.share) await navigator.share({ text });
      else await navigator.clipboard.writeText(text);
    } catch {}
  };

  // ── PAUSED ─────────────────────────────────────────────────────────────────
  if (isPaused) {
    const resumesOn = profile.pause_until
      ? new Date(profile.pause_until + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })
      : null;
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center px-6" style={{ backgroundColor: 'var(--t-bg)' }}>
        <p className="text-[10px] uppercase tracking-widest font-medium mb-3" style={{ color: 'var(--t-accent)' }}>
          Paused
        </p>
        <p className="font-display italic text-2xl mb-2 text-center" style={{ color: 'var(--t-text)' }}>
          Your days are held.
        </p>
        {resumesOn && (
          <p className="text-sm mb-8" style={{ color: 'var(--t-muted)' }}>
            Resumes {resumesOn}.
          </p>
        )}
        <button
          onClick={handleEndPause}
          className="text-sm font-medium mb-3"
          style={{ color: 'var(--t-accent)' }}
        >
          End pause now →
        </button>
        <BottomNav />
      </div>
    );
  }

  // ── QUIET HOURS ────────────────────────────────────────────────────────────
  if (quietActive) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#070a10' }}>
        <QuietHours />
        {showAnchorButton && (
          <button
            onClick={() => navigate("/Anchor")}
            style={{
              position: 'fixed',
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)',
              right: 20,
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'rgba(110,143,163,0.15)',
              border: '1px solid var(--t-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 40,
            }}
            aria-label="Anchor"
          >
            <AnchorIcon size={20} strokeWidth={1.5} style={{ color: 'var(--t-accent)' }} />
          </button>
        )}
        <BottomNav />
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={loadProfile}>
      <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-bg)' }}>

        <AnimatePresence>
          {showMilestone && days != null && (
            <MilestoneOverlay
              days={days}
              sobrietyDate={profile.sobriety_date}
              savingsRate={savingsRate}
              onDismiss={() => { sessionStorage.setItem(`milestone_${days}_dismissed`, "true"); setShowMilestone(false); }}
              onShare={handleShareMilestone}
            />
          )}
        </AnimatePresence>

        <div className="px-6 pb-6 max-w-lg mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>

          {/* ── EXPLORING ─────────────────────────────────────────────── */}
          {isExploring && (
            <>
              <div className="mb-6 pt-2 text-center">
                <p className="font-display text-5xl font-medium leading-tight mb-3" style={{ color: 'var(--t-text)', letterSpacing: '-0.02em' }}>
                  {getDailyHeadline()}
                </p>
                <p className="text-sm" style={{ color: 'var(--t-muted)' }}>You're here. That's enough.</p>
              </div>
              <div className="mb-5 flex justify-center">
                <div className="w-full max-w-xs"><TodaysMoment /></div>
              </div>
              <button
                onClick={() => navigate(createPageUrl("Spots"))}
                className="w-full max-w-xs mx-auto block rounded-xl p-4 text-left mb-4"
                style={{ backgroundColor: 'var(--t-card)', border: '1px solid var(--t-border)' }}
              >
                <p className="text-[10px] uppercase tracking-widest font-medium mb-2 text-center" style={{ color: 'var(--t-accent)' }}>Discover</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm flex-1" style={{ color: 'var(--t-muted)' }}>Places that don't need a drink to be good</p>
                  <span className="ml-3 flex-shrink-0" style={{ color: 'var(--t-accent)' }}>→</span>
                </div>
              </button>
              {showNudge && (
                <ExploringNudge profile={profile} onDismiss={() => setShowNudge(false)} />
              )}
            </>
          )}

          {/* ── STREAK ────────────────────────────────────────────────── */}
          {!isExploring && (
            <>
              {/* Ring — centred, full-width feel */}
              {days != null && (
                <div className="flex flex-col items-center mb-2">
                  <StreakRing days={days} />
                </div>
              )}

              {/* Milestone strip + closing line (merged in from Tracker) */}
              {days != null && days > 0 && (() => {
                const next = getNextMilestone(days);
                const closingLine = `${days} ${days === 1 ? "choice" : "choices"}.\nAll of them yours.`;
                return (
                  <div className="max-w-sm mx-auto w-full">
                    <div
                      className="w-full flex items-center justify-between"
                      style={{
                        marginTop: 22,
                        padding: "16px 20px",
                        borderRadius: 14,
                        backgroundColor: "var(--t-card)",
                        border: "1px solid var(--t-border)",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 9,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: "var(--t-accent)",
                            marginBottom: 6,
                          }}
                        >
                          Next milestone
                        </p>
                        <p className="font-display" style={{ fontSize: 18, color: "var(--t-text)", lineHeight: 1.2 }}>
                          {next.label} — in {next.daysLeft} {next.daysLeft === 1 ? "day" : "days"}
                        </p>
                      </div>
                      <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          border: "1.5px solid var(--t-border)",
                          marginLeft: 12,
                        }}
                      >
                        <span className="font-display" style={{ fontSize: 18, color: "var(--t-text)" }}>
                          {next.daysLeft}
                        </span>
                      </div>
                    </div>
                    <p
                      className="font-display italic text-center"
                      style={{
                        fontSize: 14,
                        color: "var(--t-muted)",
                        marginTop: 18,
                        lineHeight: 1.6,
                        whiteSpace: "pre-line",
                      }}
                    >
                      {closingLine}
                    </p>
                  </div>
                );
              })()}

              {/* Divider with copy */}
              <div style={{ textAlign: "center", margin: "24px 0 20px" }}>
                <p className="font-display italic" style={{ fontSize: 13, color: "var(--t-muted)", letterSpacing: "0.01em" }}>
                  and you, right now
                </p>
                <div style={{ width: 40, height: 1, backgroundColor: "var(--t-border)", margin: "8px auto 0" }} />
              </div>

              {/* Mood check-in */}
              <div className="w-full max-w-xs mx-auto mb-6">
                <InlineMoodScale />
              </div>

              {/* Today's moment */}
              <div className="mb-4 flex justify-center">
                <div className="w-full max-w-xs"><TodaysMoment /></div>
              </div>
            </>
          )}
        </div>

        {/* ── CONTEXTUAL PILLS ──────────────────────────────────────── */}
        <div className="px-6 max-w-lg mx-auto space-y-2 mb-4">

          {/* Tonight's Reflection — after 7pm */}
          {showReflectionPill && (
            <button
              onClick={() => navigate("/Reflection")}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: 999, backgroundColor: 'transparent', border: '1px solid var(--t-border)',
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
          )}

          {/* The Room — daytime */}
          {showRoomPill && (
            <button
              onClick={() => navigate("/Room")}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: 999, backgroundColor: 'transparent', border: '1px solid var(--t-border)',
              }}
            >
              <span style={{ fontSize: 13, color: 'var(--t-muted)', fontFamily: "'DM Sans', sans-serif" }}>Today's prompt · The Room</span>
              <ChevronRight size={12} strokeWidth={1.5} style={{ color: 'var(--t-muted)', flexShrink: 0 }} />
            </button>
          )}

          {/* Going out? — Thu/Fri/Sat or after 5pm */}
          {showMocktailsCard && (
            <button
              onClick={() => navigate("/Mocktails")}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: 12, backgroundColor: 'var(--t-card)', border: '1px solid var(--t-border)',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, color: 'var(--t-accent)', marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>Going out tonight?</p>
                <p style={{ fontSize: 13, color: 'var(--t-muted)', fontFamily: "'DM Sans', sans-serif" }}>Mocktails · bar & home kit</p>
              </div>
              <ChevronRight size={13} strokeWidth={1.5} style={{ color: 'var(--t-muted)', flexShrink: 0 }} />
            </button>
          )}
        </div>

        {/* ── FLOATING ANCHOR BUTTON ────────────────────────────────── */}
        {showAnchorButton && (
          <button
            onClick={() => navigate("/Anchor")}
            style={{
              position: 'fixed',
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)',
              right: 20,
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'var(--t-accent-bg)',
              border: '1px solid var(--t-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 40,
              animation: 'anchorPulse 4s ease-in-out infinite',
            }}
          >
            <AnchorIcon size={20} strokeWidth={1.5} style={{ color: 'var(--t-accent)' }} />
          </button>
        )}

        <style>{`
          @keyframes anchorPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(110,143,163,0.3); }
            50% { box-shadow: 0 0 0 8px rgba(110,143,163,0); }
          }
        `}</style>

        <BottomNav />
      </div>
    </PullToRefresh>
  );
}