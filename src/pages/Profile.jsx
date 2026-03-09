import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronRight } from "lucide-react";
import BottomNav from "../components/current/BottomNav";
import { getDaysSince } from "../components/current/milestoneData";
import JourneySection from "../components/current/JourneySection.jsx";
import { useTheme } from "../components/current/ThemeContext";

export default function Profile() {
  const { t, isDark, toggle } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const profiles = await base44.entities.UserProfile.list();
    if (profiles.length > 0) {
      const p = profiles[0];
      setProfile(p);
      const params = new URLSearchParams(window.location.search);
      if (params.get("setDate") === "true") {
        setEditing("date");
        setEditValue("");
      }
    }
    setLoading(false);
  };

  const saveField = async (field, value) => {
    if (!profile) return;
    await base44.entities.UserProfile.update(profile.id, { [field]: value });
    setProfile(prev => ({ ...prev, [field]: value }));
    setEditing(null);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: t.bg }}>
        <BottomNav />
      </div>
    );
  }

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
    <div className="min-h-screen pb-24" style={{ backgroundColor: t.bg }}>
      {/* Header */}
      <div className="px-6 pt-14 pb-8">
        <h1 className="font-display text-2xl font-medium" style={{ color: t.text }}>{profile.first_name}</h1>
        {!isExploring && sinceDate && <p className="text-xs mt-1" style={{ color: t.muted }}>Since {sinceDate}</p>}
        {isExploring && (
          <p className="text-xs mt-1 font-medium" style={{ color: t.success }}>Exploring</p>
        )}

        {!isExploring && days != null && (
          <div className="mt-8 flex items-baseline gap-2">
            <span className="font-display text-6xl font-medium" style={{ color: t.text }}>{days}</span>
            <span className="small-caps text-sm tracking-widest" style={{ color: t.muted }}>days</span>
          </div>
        )}
      </div>

      <div className="px-6">
        {/* Appearance */}
        <div className="w-full flex items-center justify-between py-4 border-b" style={{ borderColor: t.border }}>
          <span className="text-sm" style={{ color: t.text }}>Appearance</span>
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: t.muted }}>{isDark ? "Dark" : "Light"}</span>
            <button
              onClick={toggle}
              className="relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0"
              style={{ backgroundColor: isDark ? t.success : t.bgTertiary, border: `1px solid ${t.border}` }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 shadow"
                style={{
                  backgroundColor: '#fff',
                  left: isDark ? 'calc(100% - 22px)' : '2px',
                }}
              />
            </button>
          </div>
        </div>

        {/* Sobriety Date — only show in streak mode */}
        {!isExploring && (
          <>
            <SettingsItem
              label="Sobriety date"
              value={sinceDate || "Not set"}
              onTap={() => { setEditing("date"); setEditValue(profile.sobriety_date || ""); }}
              t={t}
            />
            {editing === "date" && (
              <EditPanel t={t}>
                <input
                  type="date"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full text-sm bg-transparent border-b pb-2 focus:outline-none"
                  style={{ borderColor: t.border, color: t.text, colorScheme: isDark ? 'dark' : 'light' }}
                />
                <EditActions t={t}
                  onCancel={() => setEditing(null)}
                  onSave={() => saveField("sobriety_date", editValue)}
                />
              </EditPanel>
            )}
          </>
        )}

        {/* Daily Savings */}
        {!isExploring && (
          <>
            <SettingsItem
              label="Daily savings rate"
              value={`$${profile.daily_savings_rate || 15}/day`}
              onTap={() => { setEditing("savings"); setEditValue(String(profile.daily_savings_rate || 15)); }}
              premium t={t}
            />
            {editing === "savings" && (
              <EditPanel t={t}>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: t.muted }}>$</span>
                  <input
                    type="number"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    className="w-full text-sm bg-transparent border-b pb-2 focus:outline-none"
                    style={{ borderColor: t.border, color: t.text }}
                  />
                  <span className="text-sm" style={{ color: t.muted }}>/day</span>
                </div>
                <EditActions t={t} onCancel={() => setEditing(null)} onSave={() => saveField("daily_savings_rate", Number(editValue))} />
              </EditPanel>
            )}
          </>
        )}

        {/* Notification Time */}
        <SettingsItem
          label="Daily intention time"
          value={profile.notification_time || "8:00 AM"}
          onTap={() => { setEditing("notification"); setEditValue(profile.notification_time || "08:00"); }}
          t={t}
        />
        {editing === "notification" && (
          <EditPanel t={t}>
            <input
              type="time"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="w-full text-sm bg-transparent border-b pb-2 focus:outline-none"
              style={{ borderColor: t.border, color: t.text, colorScheme: isDark ? 'dark' : 'light' }}
            />
            <EditActions t={t} onCancel={() => setEditing(null)} onSave={() => saveField("notification_time", editValue)} />
          </EditPanel>
        )}

        {/* Why I Started */}
        <SettingsItem
          label={isExploring ? "What brought me here" : "Why I started"}
          value={profile.why_i_started ? "Written" : "Add your reason"}
          onTap={() => { setEditing("why"); setEditValue(profile.why_i_started || ""); }}
          t={t}
        />
        {editing === "why" && (
          <EditPanel t={t}>
            <textarea
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              placeholder="This is private. Only you can see this."
              rows={4}
              className="w-full text-sm bg-transparent border rounded-lg p-3 focus:outline-none resize-none placeholder-gray-500"
              style={{ borderColor: t.border, color: t.text }}
            />
            <p className="text-[10px] mt-1 mb-3" style={{ color: t.muted }}>
              This is never shared. It's yours alone.
            </p>
            <EditActions t={t} onCancel={() => setEditing(null)} onSave={() => saveField("why_i_started", editValue)} />
          </EditPanel>
        )}

        <div className="my-6 border-t" style={{ borderColor: t.border }} />

        <JourneySection profile={profile} onProfileUpdate={(updated) => setProfile(prev => ({ ...prev, ...updated }))} />

        <div className="my-6 border-t" style={{ borderColor: t.border }} />

        <div className="mb-6">
          <h3 className="text-[10px] uppercase tracking-widest font-medium mb-4" style={{ color: t.muted }}>
            About Current
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: t.muted }}>
            Current is for people who are proud of who they are today. 
            No labels. No programs. Just presence.
          </p>
          <p className="text-xs mt-4" style={{ color: t.success }}>
            Present tense. Always.
          </p>
        </div>

        <button
          onClick={() => base44.auth.logout()}
          className="w-full py-3 text-sm font-medium text-center rounded-xl border transition-colors"
          style={{ borderColor: t.border, color: t.muted }}
        >
          Sign out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

function SettingsItem({ label, value, onTap, premium, t }) {
  return (
    <button
      onClick={onTap}
      className="w-full flex items-center justify-between py-4 border-b text-left"
      style={{ borderColor: t.border }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: t.text }}>{label}</span>
        {premium && (
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.success }} />
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: t.muted }}>{value}</span>
        <ChevronRight size={14} style={{ color: t.textSecondary }} />
      </div>
    </button>
  );
}

function EditPanel({ children, t }) {
  return (
    <div className="py-4 px-4 mb-2 rounded-xl border" style={{ backgroundColor: t.bgSecondary, borderColor: t.border }}>
      {children}
    </div>
  );
}

function EditActions({ onCancel, onSave, t }) {
  return (
    <div className="flex gap-2 mt-4">
      <button onClick={onCancel} className="flex-1 py-2 text-xs font-medium" style={{ color: t.muted }}>
        Cancel
      </button>
      <button
        onClick={onSave}
        className="flex-1 py-2 rounded-lg text-xs font-medium"
        style={{ backgroundColor: t.success, color: '#fff' }}
      >
        Save
      </button>
    </div>
  );
}