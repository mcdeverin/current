import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronRight } from "lucide-react";
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    await base44.entities.UserProfile.update(profile.id, { [field]: value });
    setProfile(prev => ({ ...prev, [field]: value }));
    setEditing(null);
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
      <div className="min-h-screen" style={{ backgroundColor: '#0f1219' }}>
        <BottomNav />
      </div>
    );
  }

  // ── GUEST MODE ───────────────────────────────────────────────────────────────
  if (isGuest) {
    return (
      <div className="min-h-screen pb-24" style={{ backgroundColor: '#0f1219' }}>
        <div className="px-6 pt-14 pb-8 max-w-lg mx-auto">
          <h1 className="font-display text-2xl font-medium mb-2" style={{ color: '#e8eaf0' }}>You</h1>
          <p className="text-sm mb-12" style={{ color: '#6a7280' }}>
            Sign in to track your streak, save your reason, and personalize your experience.
          </p>

          <button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="w-full py-3.5 rounded-xl text-sm font-medium mb-3"
            style={{ backgroundColor: '#6F8FA4', color: '#0f1219' }}
          >
            Sign in
          </button>
          <button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="w-full py-3.5 rounded-xl text-sm font-medium border"
            style={{ borderColor: '#232a35', color: '#6a7280' }}
          >
            Create account
          </button>

          <div className="mt-12 border-t pt-6 flex flex-col gap-3" style={{ borderColor: '#232a35' }}>
            <a href="mailto:hello@currentapp.studio" className="text-xs font-medium" style={{ color: '#6F8FA4' }}>Contact</a>
            <Link to={createPageUrl("PrivacyPolicy")} className="text-xs font-medium" style={{ color: '#6F8FA4' }}>Privacy Policy</Link>
            <Link to={createPageUrl("TermsOfService")} className="text-xs font-medium" style={{ color: '#6F8FA4' }}>Terms of Service</Link>
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
    ? new Date(profile.sobriety_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
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
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#0f1219' }}>
      {/* Header */}
      <div className="px-6 pt-14 pb-8">
        <h1 className="font-display text-2xl font-medium" style={{ color: '#e8eaf0' }}>{profile.first_name}</h1>
        {!isExploring && sinceDate && <p className="text-xs mt-1" style={{ color: '#6a7280' }}>Since {sinceDate}</p>}
        {isExploring && (
          <p className="text-xs mt-1 font-medium" style={{ color: '#6F8FA4' }}>Exploring</p>
        )}

        {!isExploring && days != null && (
          <div className="mt-8 flex items-baseline gap-2">
            <span className="font-display text-6xl font-medium" style={{ color: '#e8eaf0' }}>{days}</span>
            <span className="small-caps text-sm tracking-widest" style={{ color: '#6a7280' }}>days</span>
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
                <input
                  type="date"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full text-sm bg-transparent border-b pb-2 focus:outline-none"
                  style={{ borderColor: '#232a35', color: '#e8eaf0', colorScheme: 'dark' }}
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
              style={{ borderColor: '#232a35', color: '#e8eaf0' }}
            />
            <p className="text-[10px] mt-1 mb-3" style={{ color: '#6a7280' }}>
              This is never shared. It's yours alone.
            </p>
            <EditActions onCancel={() => setEditing(null)} onSave={() => saveField("why_i_started", editValue)} />
          </EditPanel>
        )}

        {/* Divider */}
        <div className="my-6 border-t" style={{ borderColor: '#232a35' }} />

        {/* Your Journey */}
        <JourneySection profile={profile} onProfileUpdate={(updated) => setProfile(prev => ({ ...prev, ...updated }))} />

        {/* Divider */}
        <div className="my-6 border-t" style={{ borderColor: '#232a35' }} />

        {/* About */}
        <div className="mb-6">
          <h3 className="text-[10px] uppercase tracking-widest font-medium mb-4" style={{ color: '#6a7280' }}>
            About Current
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: '#6a7280' }}>
            Current is for people who are proud of who they are today.
            No labels. No programs. Just presence.
          </p>
          <p className="text-xs mt-4" style={{ color: '#6F8FA4' }}>
            Present tense. Always.
          </p>
        </div>

        {/* Separator */}
        <div className="my-6 border-t" style={{ borderColor: '#232a35' }} />

        {/* Legal & Contact links */}
        <div className="flex flex-col gap-3 mb-4">
          <a
            href="mailto:hello@currentapp.studio"
            className="text-xs font-medium"
            style={{ color: '#6F8FA4' }}
          >
            Contact
          </a>
          <Link
            to={createPageUrl("PrivacyPolicy")}
            className="text-xs font-medium"
            style={{ color: '#6F8FA4' }}
          >
            Privacy Policy
          </Link>
          <Link
            to={createPageUrl("TermsOfService")}
            className="text-xs font-medium"
            style={{ color: '#6F8FA4' }}
          >
            Terms of Service
          </Link>
        </div>

        {/* Sign out */}
        <button
          onClick={() => base44.auth.logout()}
          className="w-full py-3 text-sm font-medium text-center rounded-xl border transition-colors mb-3"
          style={{ borderColor: '#232a35', color: '#6a7280' }}
        >
          Sign out
        </button>

        {/* Delete account */}
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 text-sm font-medium text-center"
            style={{ color: '#4a3030' }}
          >
            Delete account
          </button>
        ) : (
          <div className="p-4 rounded-xl border mb-4" style={{ backgroundColor: '#161b24', borderColor: '#3a2020' }}>
            <p className="text-sm font-medium mb-1" style={{ color: '#e8eaf0' }}>Delete your account?</p>
            <p className="text-xs mb-4" style={{ color: '#6a7280' }}>
              This will permanently delete your profile data and sign you out. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium"
                style={{ color: '#6a7280' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium disabled:opacity-40"
                style={{ backgroundColor: '#7a2020', color: '#e8eaf0' }}
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
      style={{ borderColor: '#232a35' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: '#e8eaf0' }}>{label}</span>
        {premium && (
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#6F8FA4' }} />
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: '#6a7280' }}>{value}</span>
        <ChevronRight size={14} style={{ color: '#a0b8c8' }} />
      </div>
    </button>
  );
}

function EditPanel({ children }) {
  return (
    <div className="py-4 px-4 mb-2 rounded-xl border" style={{ backgroundColor: '#161b24', borderColor: '#232a35' }}>
      {children}
    </div>
  );
}

function EditActions({ onCancel, onSave }) {
  return (
    <div className="flex gap-2 mt-4">
      <button onClick={onCancel} className="flex-1 py-2 text-xs font-medium" style={{ color: '#6a7280' }}>
        Cancel
      </button>
      <button
        onClick={onSave}
        className="flex-1 py-2 rounded-lg text-xs font-medium"
        style={{ backgroundColor: '#6F8FA4', color: '#0f1219' }}
      >
        Save
      </button>
    </div>
  );
}