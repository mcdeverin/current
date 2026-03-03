import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronRight } from "lucide-react";
import BottomNav from "../components/current/BottomNav";
import { getDaysSince } from "../components/current/milestoneData";

export default function Profile() {
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
      // Check if deep-linked from exploring nudge
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
      <div className="min-h-screen" style={{ backgroundColor: '#f5f2ec' }}>
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
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#f5f2ec' }}>
      {/* Header */}
      <div className="px-6 pt-14 pb-8">
        <h1 className="font-display text-2xl font-medium text-gray-900">{profile.first_name}</h1>
        {sinceDate && <p className="text-xs mt-1" style={{ color: '#8a8478' }}>Since {sinceDate}</p>}
        {isExploring && !sinceDate && (
          <p className="text-xs mt-1" style={{ color: '#8a8478' }}>Exploring</p>
        )}

        {/* Streak large — only if streak mode */}
        {!isExploring && days != null && (
          <div className="mt-8 flex items-baseline gap-2">
            <span className="font-display text-6xl font-medium text-gray-900">{days}</span>
            <span className="small-caps text-sm tracking-widest" style={{ color: '#8a8478' }}>days</span>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="px-6">
        {/* Sobriety Date — label adapts to mode */}
        <SettingsItem
          label={isExploring && !sinceDate ? "Set a date (optional)" : "Sobriety date"}
          value={sinceDate || "Not set"}
          onTap={() => { setEditing("date"); setEditValue(profile.sobriety_date || ""); }}
        />

        {editing === "date" && (
          <EditPanel>
            {isExploring && !sinceDate && (
              <p className="text-xs mb-3 leading-relaxed" style={{ color: '#8a8478' }}>
                No pressure. This is just for you — it unlocks your streak and milestones.
              </p>
            )}
            <input
              type="date"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full text-sm bg-transparent border-b pb-2 focus:outline-none"
              style={{ borderColor: '#e8e4dd' }}
            />
            <EditActions
              onCancel={() => setEditing(null)}
              onSave={isExploring && !sinceDate ? handleSaveDateAndSwitchMode : () => saveField("sobriety_date", editValue)}
            />
          </EditPanel>
        )}

        {/* Daily Savings */}
        <SettingsItem
          label="Daily savings rate"
          value={`$${profile.daily_savings_rate || 15}/day`}
          onTap={() => { setEditing("savings"); setEditValue(String(profile.daily_savings_rate || 15)); }}
          premium
        />

        {editing === "savings" && (
          <EditPanel>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">$</span>
              <input
                type="number"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                className="w-full text-sm bg-transparent border-b pb-2 focus:outline-none"
                style={{ borderColor: '#e8e4dd' }}
              />
              <span className="text-sm text-gray-500">/day</span>
            </div>
            <EditActions onCancel={() => setEditing(null)} onSave={() => saveField("daily_savings_rate", Number(editValue))} />
          </EditPanel>
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
              style={{ borderColor: '#e8e4dd' }}
            />
            <EditActions onCancel={() => setEditing(null)} onSave={() => saveField("notification_time", editValue)} />
          </EditPanel>
        )}

        {/* Why I Started */}
        <SettingsItem
          label="Why I started"
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
              className="w-full text-sm bg-transparent border rounded-lg p-3 focus:outline-none resize-none"
              style={{ borderColor: '#e8e4dd' }}
            />
            <p className="text-[10px] mt-1 mb-3" style={{ color: '#8a8478' }}>
              This is never shared. It's yours alone.
            </p>
            <EditActions onCancel={() => setEditing(null)} onSave={() => saveField("why_i_started", editValue)} />
          </EditPanel>
        )}

        {/* Divider */}
        <div className="my-6 border-t" style={{ borderColor: '#e0dbd3' }} />

        {/* About */}
        <div className="mb-6">
          <h3 className="text-[10px] uppercase tracking-widest font-medium mb-4" style={{ color: '#8a8478' }}>
            About Current
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: '#8a8478' }}>
            Current is for people who are proud of who they are today. 
            No labels. No programs. Just presence.
          </p>
          <p className="text-xs mt-4" style={{ color: '#c8a97e' }}>
            Present tense. Always.
          </p>
        </div>

        {/* Logout */}
        <button
          onClick={() => base44.auth.logout()}
          className="w-full py-3 text-sm font-medium text-center rounded-xl border transition-colors"
          style={{ borderColor: '#e0dbd3', color: '#8a8478' }}
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
      style={{ borderColor: '#e8e4dd' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-900">{label}</span>
        {premium && (
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#c8a97e' }} />
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: '#8a8478' }}>{value}</span>
        <ChevronRight size={14} style={{ color: '#d4d0c8' }} />
      </div>
    </button>
  );
}

function EditPanel({ children }) {
  return (
    <div className="py-4 px-4 mb-2 rounded-xl border" style={{ backgroundColor: '#fff', borderColor: '#e8e4dd' }}>
      {children}
    </div>
  );
}

function EditActions({ onCancel, onSave }) {
  return (
    <div className="flex gap-2 mt-4">
      <button onClick={onCancel} className="flex-1 py-2 text-xs font-medium" style={{ color: '#8a8478' }}>
        Cancel
      </button>
      <button
        onClick={onSave}
        className="flex-1 py-2 rounded-lg text-xs font-medium text-white"
        style={{ backgroundColor: '#0e0e0f' }}
      >
        Save
      </button>
    </div>
  );
}