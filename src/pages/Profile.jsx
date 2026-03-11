import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronRight, Sun, Moon } from "lucide-react";
import DatePickerDrawer from "../components/current/DatePickerDrawer";
import { useTheme } from "../components/current/ThemeContext";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import BottomNav from "../components/current/BottomNav";
import { getDaysSince } from "../components/current/milestoneData";
import JourneySection from "../components/current/JourneySection.jsx";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [dateDrawerOpen, setDateDrawerOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      setIsGuest(true);
      setLoading(false);
      return;
    }

    const profiles = await base44.entities.UserProfile.list();
    if (profiles.length > 0) {
      const p = profiles[0];
      setProfile(p);
      const params = new URLSearchParams(window.location.search);
      if (params.get("setDate") === "true") {
        setEditing("date");
        setEditValue("");
      }
    } else {
      // Authenticated but no profile — redirect to onboarding
      base44.auth.redirectToLogin(window.location.href);
    }
    setLoading(false);
  };

  const saveField = async (field, value) => {
    if (!profile) return;
    // Optimistic update — close UI instantly
    setProfile(prev => ({ ...prev, [field]: value }));
    setEditing(null);
    await base44.entities.UserProfile.update(profile.id, { [field]: value });
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    if (profile) {
      await base44.entities.UserProfile.delete(profile.id);
    }
    base44.auth.logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--t-bg)' }}>
        <BottomNav />
      </div>
    );
  }

  // ── GUEST MODE ───────────────────────────────────────────────────────────────
  if (isGuest) {
    return (
      <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-bg)' }}>
        <div className="px-6 pb-8 max-w-lg mx-auto relative" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>
          <button
            onClick={toggleTheme}
            className="absolute right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
            style={{ top: 'calc(env(safe-area-inset-top, 0px) + 72px)', borderColor: 'var(--t-border)', backgroundColor: 'var(--t-card)' }}
          >
            {isDark ? <Moon size={13} style={{ color: 'var(--t-muted)' }} /> : <Sun size={13} style={{ color: 'var(--t-muted)' }} />}
            <span className="text-xs" style={{ color: 'var(--t-muted)' }}>{isDark ? 'Dark' : 'Light'}</span>
          </button>
          <h1 className="font-display text-2xl font-medium mb-2" style={{ color: 'var(--t-text)' }}>You</h1>
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

          <div className="mt-12 border-t pt-6 flex flex-col gap-3" style={{ borderColor: 'var(--t-border)' }}>
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

  const handleSaveDateAndSwitchMode = async () => {
    if (!editValue) return;
    await base44.entities.UserProfile.update(profile.id, {
      sobriety_date: editValue,
      mode: "streak",
      exploring_nudge_dismissed: true,
    });
    setProfile(prev => ({ ...prev, sobriety_date: editValue, mode: "streak", exploring_nudge_dismissed: true }));
    setEditing(null);
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-bg)' }}>
      {/* Header */}
      <div className="px-6 pb-8 relative" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>
        <button
          onClick={toggleTheme}
          className="absolute right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 72px)', borderColor: 'var(--t-border)', backgroundColor: 'var(--t-card)' }}
        >
          {isDark ? <Moon size={13} style={{ color: 'var(--t-muted)' }} /> : <Sun size={13} style={{ color: 'var(--t-muted)' }} />}
          <span className="text-xs" style={{ color: 'var(--t-muted)' }}>{isDark ? 'Dark' : 'Light'}</span>
        </button>
        <h1 className="font-display text-2xl font-medium" style={{ color: 'var(--t-text)' }}>{profile.first_name}</h1>
        {!isExploring && sinceDate && <p className="text-xs mt-1" style={{ color: 'var(--t-muted)' }}>Since {sinceDate}</p>}
        {isExploring && (
          <p className="text-xs mt-1 font-medium" style={{ color: 'var(--t-accent)' }}>Exploring</p>
        )}

        {!isExploring && days != null && (
          <div className="mt-8 flex items-baseline gap-2">
            <span className="font-display text-6xl font-medium" style={{ color: 'var(--t-accent)' }}>{days}</span>
            <span className="small-caps text-sm tracking-widest" style={{ color: 'var(--t-muted)' }}>days</span>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="px-6">
        {/* Sobriety Date — streak mode only */}
        {!isExploring && (
          <>
            <SettingsItem
              label="Start date"
              value={sinceDate || "Not set"}
              onTap={() => { setEditing("date"); setEditValue(profile.sobriety_date || ""); }}
            />
            {editing === "date" && (
              <EditPanel>
                <button
                  onClick={() => setDateDrawerOpen(true)}
                  className="w-full text-left border-b pb-2 text-sm focus:outline-none"
                  style={{ borderColor: 'var(--t-border)', color: editValue ? 'var(--t-text)' : 'var(--t-muted)' }}
                >
                  {editValue
                    ? (() => { const [y,m,d] = editValue.split("-").map(Number); return new Date(y,m-1,d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }); })()
                    : "Tap to select a date"}
                </button>
                <DatePickerDrawer
                  open={dateDrawerOpen}
                  onClose={() => setDateDrawerOpen(false)}
                  value={editValue}
                  onSelect={setEditValue}
                />
                <EditActions
                  onCancel={() => setEditing(null)}
                  onSave={() => saveField("sobriety_date", editValue)}
                />
              </EditPanel>
            )}
          </>
        )}

        {/* Why I Started */}
        <SettingsItem
          label="What brought me here"
          value={profile.why_i_started ? "Written" : "Add your reason"}
          onTap={() => { setEditing("why"); setEditValue(profile.why_i_started || ""); }}
        />
        {editing === "why" && (
          <EditPanel>
            <textarea
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              placeholder="This is private. Only you can see this."
              rows={4}
              className="w-full text-sm bg-transparent border rounded-lg p-3 focus:outline-none resize-none placeholder-gray-600"
              style={{ borderColor: 'var(--t-border)', color: 'var(--t-text)' }}
            />
            <p className="text-[10px] mt-1 mb-3" style={{ color: 'var(--t-muted)' }}>
              This is never shared. It's yours alone.
            </p>
            <EditActions onCancel={() => setEditing(null)} onSave={() => saveField("why_i_started", editValue)} />
          </EditPanel>
        )}

        {/* Divider */}
        <div className="h-16" />

        {/* Your Journey */}
        <JourneySection profile={profile} onProfileUpdate={(updated) => setProfile(prev => ({ ...prev, ...updated }))} />

        {/* Divider */}
        <div className="h-16" />

        {/* About */}
        <div className="mb-6">
          <h3 className="text-[10px] uppercase tracking-widest font-medium mb-4" style={{ color: 'var(--t-muted)' }}>
            About Current
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--t-muted)' }}>
            Current is for people who are proud of who they are today.
            No labels. No programs. Just presence.
          </p>
          <p className="text-xs mt-4" style={{ color: 'var(--t-accent)' }}>
            Present tense. Always.
          </p>
        </div>

        {/* Separator */}
        <div className="h-6" />

        {/* Legal & Contact links */}
        <div className="flex flex-col gap-3 mb-4">
          <a href="mailto:hello@currentapp.studio" className="text-xs font-medium" style={{ color: 'var(--t-accent)' }}>
            Contact
          </a>
        </div>

        {/* Sign out */}
        <button
          onClick={() => base44.auth.logout()}
          className="w-full py-3 text-sm font-medium text-center rounded-xl border transition-colors mb-3"
          style={{ borderColor: 'var(--t-border)', color: 'var(--t-muted)' }}
        >
          Sign out
        </button>

        {/* Delete account */}
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 text-sm font-medium text-center"
            style={{ color: 'var(--t-danger-muted)' }}
          >
            Delete account
          </button>
        ) : (
          <div className="p-4 rounded-xl border mb-4" style={{ backgroundColor: 'var(--t-card)', borderColor: 'var(--t-danger-border)' }}>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--t-text)' }}>Delete your account?</p>
            <p className="text-xs mb-4" style={{ color: 'var(--t-muted)' }}>
              This will permanently delete your profile data and sign you out. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium"
                style={{ color: 'var(--t-muted)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium disabled:opacity-40"
                style={{ backgroundColor: 'var(--t-danger)', color: '#e8eaf0' }}
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function SettingsItem({ label, value, onTap, premium }) {
  return (
    <button
      onClick={onTap}
      className="w-full flex items-center justify-between py-4 border-b text-left"
      style={{ borderColor: 'var(--t-border)' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--t-text)' }}>{label}</span>
        {premium && (
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--t-accent)' }} />
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--t-muted)' }}>{value}</span>
        <ChevronRight size={14} style={{ color: 'var(--t-accent)' }} />
      </div>
    </button>
  );
}

function EditPanel({ children }) {
  return (
    <div className="py-4 px-4 mb-2 rounded-xl border" style={{ backgroundColor: 'var(--t-card)', borderColor: 'var(--t-border)', borderTopColor: 'var(--t-bg)' }}>
      {children}
    </div>
  );
}

function EditActions({ onCancel, onSave }) {
  return (
    <div className="flex gap-2 mt-4">
      <button onClick={onCancel} className="flex-1 py-2 text-xs font-medium" style={{ color: 'var(--t-muted)' }}>
        Cancel
      </button>
      <button
        onClick={onSave}
        className="flex-1 py-2 rounded-lg text-xs font-medium"
        style={{ backgroundColor: 'var(--t-accent)', color: 'var(--t-bg)' }}
      >
        Save
      </button>
    </div>
  );
}