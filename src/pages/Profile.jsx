import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Settings } from "lucide-react";
import { useTheme } from "../components/current/ThemeContext";
import BottomNav from "../components/current/BottomNav";
import { getDaysSince } from "../components/current/milestoneData";
import JourneySection from "../components/current/JourneySection.jsx";
import { hapticLight } from "@/lib/haptics";
import { Capacitor } from "@capacitor/core";
import { takeProfilePhoto } from "@/lib/camera";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) { setIsGuest(true); setLoading(false); return; }
      const profiles = await base44.entities.UserProfile.list();
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      } else {
        base44.auth.redirectToLogin(window.location.href);
      }
    } catch (err) {
      console.error("loadProfile error:", err);
      setIsGuest(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen" style={{ backgroundColor: 'var(--t-bg)' }}><BottomNav /></div>;

  // ── GUEST MODE ───────────────────────────────────────────────────────────────
  if (isGuest) {
    return (
      <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-bg)' }}>
        <div className="px-6 pb-8 max-w-lg mx-auto relative" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>
          <h1 className="font-display text-2xl font-medium mb-2" style={{ color: 'var(--t-text)' }}>Mine</h1>
          <p className="text-sm mb-12" style={{ color: 'var(--t-muted)' }}>
            Sign in to track your streak, save your reason, and personalize your experience.
          </p>
          <button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="w-full py-3.5 rounded-xl text-sm font-medium mb-3"
            style={{ backgroundColor: 'var(--t-accent)', color: 'var(--t-bg)' }}
          >
            Sign in
          </button>
          <button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="w-full flex items-center justify-between py-4 border-b text-left"
            style={{ borderColor: 'var(--t-border)', color: 'var(--t-text)' }}
          >
            <span className="text-sm">Create an account</span>
            <ChevronRight size={14} style={{ color: 'var(--t-accent)' }} />
          </button>
          <div className="mt-12 pt-6">
            <a href="mailto:hello@currentapp.studio" className="text-xs font-medium" style={{ color: 'var(--t-accent)' }}>Contact</a>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── AUTHENTICATED MODE ───────────────────────────────────────────────────────
  const isExploring = profile.mode === "exploring";
  const days = profile.sobriety_date ? getDaysSince(profile.sobriety_date) : null;
  const sinceDate = profile.sobriety_date
    ? new Date(profile.sobriety_date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  // Placeholder counts — will be wired in later sections
  const savedTotal = days != null ? days * (profile.daily_savings_rate || 15) : 0;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-bg)' }}>
      {/* Header row */}
      <div className="px-6 relative" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)', paddingBottom: '4px' }}>
        {/* Gear icon */}
        <button
          onClick={() => { hapticLight(); navigate("/Settings"); }}
          className="absolute right-6"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 76px)' }}
        >
          <Settings size={18} strokeWidth={1.5} style={{ color: 'var(--t-muted)' }} />
        </button>

        {/* Profile photo (native only) */}
        {Capacitor.isNativePlatform() && (
          <button
            onClick={async () => {
              const dataUrl = await takeProfilePhoto();
              if (dataUrl) {
                await base44.entities.UserProfile.update(profile.id, { profile_photo: dataUrl });
                setProfile(prev => ({ ...prev, profile_photo: dataUrl }));
              }
            }}
            className="w-14 h-14 rounded-full mb-3 flex items-center justify-center overflow-hidden border"
            style={{ borderColor: 'var(--t-border)', backgroundColor: 'var(--t-card)' }}
          >
            {profile.profile_photo ? (
              <img src={profile.profile_photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-xl" style={{ color: 'var(--t-accent)' }}>
                {(profile.first_name || "?")[0].toUpperCase()}
              </span>
            )}
          </button>
        )}

        <h1 className="font-display text-3xl font-medium" style={{ color: 'var(--t-text)' }}>{profile.first_name}</h1>
        {!isExploring && sinceDate && <p className="text-xs mt-1" style={{ color: 'var(--t-muted)' }}>Since {sinceDate}</p>}
        {isExploring && <p className="text-xs mt-1 font-medium" style={{ color: 'var(--t-accent)' }}>Exploring</p>}

        {!isExploring && days != null && (
          <div className="mt-6 flex items-baseline gap-2">
            <span className="font-display text-6xl font-medium" style={{ color: 'var(--t-accent)', fontVariantNumeric: 'tabular-nums' }}>{days}</span>
            <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: 'var(--t-muted)' }}>days</span>
          </div>
        )}
      </div>

      {/* ── CONTENT CARDS ────────────────────────────────────────────── */}
      <div className="px-6 mt-8 max-w-lg mx-auto">

        {/* 2-col grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Presence */}
          <ContentCard
            onTap={() => { hapticLight(); navigate("/Presence"); }}
            eyebrow="Presence"
            headline={/* TODO: wire days_present */ "Your map"}
            sub="A quiet map of when you showed up."
          />

          {/* Budget */}
          {!isExploring && (
            <ContentCard
              onTap={() => { hapticLight(); navigate("/Budget"); }}
              eyebrow="Saved"
              headline={`$${savedTotal.toLocaleString()}`}
              sub={`not spent, ${days} days.`}
              headlineStyle={{ fontVariantNumeric: 'tabular-nums' }}
            />
          )}

          {/* Letters */}
          <ContentCard
            onTap={() => { hapticLight(); navigate("/Letters"); }}
            eyebrow="Letters"
            headline="A note waiting."
            sub="From strangers, who are also here."
          />

          {/* Progress */}
          <ContentCard
            onTap={() => { hapticLight(); navigate("/Progress"); }}
            eyebrow="Progress"
            headline="Patterns"
            sub="mood, energy, sleep."
          />
        </div>

        {/* ── SECONDARY LIST ────────────────────────────────────────── */}
        <div className="mt-6" style={{ borderTop: '1px solid var(--t-border)' }}>
          <SecondaryItem label="Journey" sub="path & date" onTap={() => {}} expandable>
            <div className="pb-2">
              <JourneySection profile={profile} onProfileUpdate={(updated) => setProfile(prev => ({ ...prev, ...updated }))} />
            </div>
          </SecondaryItem>
          <SecondaryItem label="Pause" sub="take a breath" onTap={() => { hapticLight(); navigate("/Pause"); }} />
          <SecondaryItem label="The Room" sub="today's prompt" onTap={() => { hapticLight(); navigate("/Room"); }} />
          <SecondaryItem label="Mocktails" sub="bar & home" onTap={() => { hapticLight(); navigate("/Mocktails"); }} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function ContentCard({ onTap, eyebrow, headline, sub, headlineStyle }) {
  return (
    <button
      onClick={onTap}
      className="rounded-xl p-4 text-left flex flex-col gap-1"
      style={{ backgroundColor: 'var(--t-card)', border: '1px solid var(--t-border)' }}
    >
      <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: 'var(--t-accent)' }}>{eyebrow}</p>
      <p className="font-display text-lg font-medium leading-tight" style={{ color: 'var(--t-text)', ...headlineStyle }}>{headline}</p>
      <p className="text-xs leading-snug" style={{ color: 'var(--t-muted)' }}>{sub}</p>
    </button>
  );
}

function SecondaryItem({ label, sub, onTap, children, expandable }) {
  const [open, setOpen] = useState(false);

  const handleTap = () => {
    hapticLight();
    if (expandable) { setOpen(v => !v); } else { onTap(); }
  };

  return (
    <div style={{ borderBottom: '1px solid var(--t-border)' }}>
      <button onClick={handleTap} className="w-full flex items-center justify-between py-3.5 text-left">
        <div>
          <span className="text-sm" style={{ color: 'var(--t-text)' }}>{label}</span>
          {sub && <span className="text-xs ml-2" style={{ color: 'var(--t-muted)' }}>· {sub}</span>}
        </div>
        <ChevronRight size={14} strokeWidth={1.5} style={{ color: 'var(--t-muted)', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {expandable && open && children}
    </div>
  );
}