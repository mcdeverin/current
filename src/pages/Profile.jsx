import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronRight, Sun, Moon } from "lucide-react";
import BottomNav from "../components/current/BottomNav";
import { getDaysSince } from "../components/current/milestoneData";
import JourneySection from "../components/current/JourneySection.jsx";
import { useTheme } from "../components/current/ThemeContext";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const { theme, toggleTheme } = useTheme();

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
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
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
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-6 pt-14 pb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-medium" style={{ color: 'var(--text)' }}>{profile.first_name}</h1>
            {!isExploring && sinceDate && <p className="text-xs mt-1" style={{ color: 'var(--subtext)' }}>Since {sinceDate}</p>}
            {isExploring && (
              <p className="text-xs mt-1 font-medium" style={{ color: 'var(--accent)' }}>Exploring</p>
            )}
          </div>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border transition-all"
            style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card)', color: 'var(--subtext)' }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Streak large — only if streak mode */}
        {!isExploring && days != null && (
          <div className="mt-8 flex items-baseline gap-2">
            <span className="font-display text-6xl font-medium" style={{ color: 'var(--text)' }}>{days}</span>
            <span className="small-caps text-sm tracking-widest" style={{ color: 'var(--subtext)' }}>days</span>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="px-6">
        {/* Sobriety Date — only show in streak mode */}
        {!isExploring && (
          <>
            <SettingsItem
              label="Sobriety date"
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
                  style={{ borderColor: 'var(--card-border)', color: 'var(--text)', colorScheme: 'inherit' }}
                />
                <EditActions
                  onCancel={() => setEditing(null)}
                  onSave={() => saveField("sobriety_date", editValue)}
                />
              </EditPanel>
            )}
          </>
        )}

        {/* Daily Savings — only show in streak mode */}
        {!isExploring && (
          <>
            <SettingsItem
              label="Daily savings rate"
              value={`$${profile.daily_savings_rate || 15}/day`}
              onTap={() => { setEditing("savings"); setEditValue(String(profile.daily_savings_rate || 15)); }}
              premium
            />
            {editing === "savings" && (
              <EditPanel>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: 'var(--subtext)' }}>$</span>
                  <input
                    type="number"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    className="w-full text-sm bg-transparent border-b pb-2 focus:outline-none"
                    style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
                  />
                  <span className="text-sm" style={{ color: 'var(--subtext)' }}>/day</span>
                </div>
                <EditActions onCancel={() => setEditing(null)} onSave={() => saveField("daily_savings_rate", Number(editValue))} />
              </EditPanel>
            )}
          </>
        )}

        {/* Notification Time */}
        <SettingsItem
          label="Daily intention time"
          value={profile.notification_time || "8:00 AM"}
          onTap={() => { setEditing("notification"); setEditValue(profile.notification_time || "08:00"); }}
        />
        {editing === "notification" && (
          <EditPanel>
            <input
              type="time"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="w-full text-sm bg-transparent border-b pb-2 focus:outline-none"
              style={{ borderColor: 'var(--card-border)', color: 'var(--text)', colorScheme: 'inherit' }}
            />
            <EditActions onCancel={() => setEditing(null)} onSave={() => saveField("notification_time", editValue)} />
          </EditPanel>
        )}

        {/* Why I Started */}
        <SettingsItem
          label={isExploring ? "What brought me here" : "Why I started"}
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
              style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
            />
            <p className="text-[10px] mt-1 mb-3" style={{ color: 'var(--subtext)' }}>
              This is never shared. It's yours alone.
            </p>
            <EditActions onCancel={() => setEditing(null)} onSave={() => saveField("why_i_started", editValue)} />
          </EditPanel>
        )}

        <div className="my-6 border-t" style={{ borderColor: 'var(--card-border)' }} />

        <JourneySection profile={profile} onProfileUpdate={(updated) => setProfile(prev => ({ ...prev, ...updated }))} />

        <div className="my-6 border-t" style={{ borderColor: 'var(--card-border)' }} />

        <div className="mb-6">
          <h3 className="text-[10px] uppercase tracking-widest font-medium mb-4" style={{ color: 'var(--subtext)' }}>
            About Current
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--subtext)' }}>
            Current is for people who are proud of who they are today. 
            No labels. No programs. Just presence.
          </p>
          <p className="text-xs mt-4" style={{ color: 'var(--accent)' }}>
            Present tense. Always.
          </p>
        </div>

        <button
          onClick={() => base44.auth.logout()}
          className="w-full py-3 text-sm font-medium text-center rounded-xl border transition-colors"
          style={{ borderColor: 'var(--card-border)', color: 'var(--subtext)' }}
        >
          Sign out
        </button>
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
      style={{ borderColor: 'var(--card-border)' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--text)' }}>{label}</span>
        {premium && (
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--subtext)' }}>{value}</span>
        <ChevronRight size={14} style={{ color: 'var(--subtext)' }} />
      </div>
    </button>
  );
}

function EditPanel({ children }) {
  return (
    <div className="py-4 px-4 mb-2 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
      {children}
    </div>
  );
}

function EditActions({ onCancel, onSave }) {
  return (
    <div className="flex gap-2 mt-4">
      <button onClick={onCancel} className="flex-1 py-2 text-xs font-medium" style={{ color: 'var(--subtext)' }}>
        Cancel
      </button>
      <button
        onClick={onSave}
        className="flex-1 py-2 rounded-lg text-xs font-medium"
        style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
      >
        Save
      </button>
    </div>
  );
}