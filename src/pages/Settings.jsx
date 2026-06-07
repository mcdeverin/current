import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Sun, Moon } from "lucide-react";
import { useTheme } from "../components/current/ThemeContext";
import DatePickerDrawer from "../components/current/DatePickerDrawer";
import JourneySection from "../components/current/JourneySection.jsx";
import { hapticLight } from "@/lib/haptics";
import { authenticateWithBiometrics } from "@/lib/biometrics";

export default function Settings() {
  const navigate = useNavigate();
  const { isDark, toggleTheme: rawToggleTheme } = useTheme();
  const toggleTheme = () => { hapticLight(); rawToggleTheme(); };

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [dateDrawerOpen, setDateDrawerOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const profiles = await base44.entities.UserProfile.list();
      if (profiles.length > 0) setProfile(profiles[0]);
    } catch (err) {
      console.error("Settings loadProfile error:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveField = async (field, value) => {
    if (!profile) return;
    setProfile(prev => ({ ...prev, [field]: value }));
    setEditing(null);
    await base44.entities.UserProfile.update(profile.id, { [field]: value });
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    if (profile) await base44.entities.UserProfile.delete(profile.id);
    base44.auth.logout();
  };

  const [exporting, setExporting] = useState(false);
  const handleExportData = async () => {
    if (!profile || exporting) return;
    setExporting(true);
    hapticLight();
    try {
      const user = await base44.auth.me().catch(() => null);
      const uid = user?.id;
      // Pull everything the user owns. Each call is best-effort; if an
      // entity isn't readable we just omit it from the export.
      const collect = async (name, query) => {
        try { return await base44.entities[name].filter(query, "-created_date", 500); }
        catch { return []; }
      };
      const payload = {
        exported_at: new Date().toISOString(),
        profile,
        mood_logs: uid ? await collect("MoodLog", { user_id: uid }) : [],
        reflections: uid ? await collect("Reflections", { user_id: uid }) : [],
        drink_logs: uid ? await collect("DrinkLogs", { user_id: uid }) : [],
        pauses: uid ? await collect("Pauses", { user_id: uid }) : [],
        presence_log: uid ? await collect("PresenceLog", { user_id: uid }) : [],
        user_letters: uid ? await collect("UserLetters", { user_id: uid }) : [],
        room_replies: uid ? await collect("RoomReplies", { user_id: uid }) : [],
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const today = new Date().toISOString().slice(0, 10);
      a.download = `current-export-${today}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="min-h-screen" style={{ backgroundColor: 'var(--t-bg)' }} />;

  const isExploring = profile?.mode === "exploring";
  const sinceDate = profile?.sobriety_date
    ? new Date(profile.sobriety_date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-bg)' }}>
      {/* Back header */}
      <div className="px-6 flex items-center gap-3" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)', paddingBottom: '16px' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1" style={{ color: 'var(--t-accent)' }}>
          <ChevronLeft size={18} strokeWidth={1.5} />
          <span className="text-sm">Mine</span>
        </button>
      </div>

      <div className="px-6 max-w-lg mx-auto">

        {/* ── ACCOUNT ─────────────────────────────────────────────── */}
        <SectionHeader label="Account" />

        <SettingsItem label="Display name" value={profile?.first_name || "—"} onTap={() => { setEditing("name"); setEditValue(profile?.first_name || ""); }} />
        {editing === "name" && (
          <EditPanel>
            <input
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              placeholder="Your first name"
              className="w-full text-sm bg-transparent border-b pb-2 focus:outline-none"
              style={{ borderColor: 'var(--t-border)', color: 'var(--t-text)' }}
            />
            <EditActions onCancel={() => setEditing(null)} onSave={() => saveField("first_name", editValue)} />
          </EditPanel>
        )}

        {!isExploring && (
          <>
            <SettingsItem
              label="Start date"
              value={sinceDate || "Not set"}
              onTap={() => { setEditing("date"); setEditValue(profile?.sobriety_date || ""); }}
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
                <DatePickerDrawer open={dateDrawerOpen} onClose={() => setDateDrawerOpen(false)} value={editValue} onSelect={setEditValue} />
                <EditActions onCancel={() => setEditing(null)} onSave={() => saveField("sobriety_date", editValue)} />
              </EditPanel>
            )}
          </>
        )}

        <SettingsItem
          label="Why I'm here"
          value={profile?.why_i_started ? "Written" : "Add your reason"}
          onTap={async () => {
            if (profile?.why_i_started) {
              const ok = await authenticateWithBiometrics("View your private note");
              if (!ok) return;
            }
            setEditing("why");
            setEditValue(profile?.why_i_started || "");
          }}
        />
        {editing === "why" && (
          <EditPanel>
            <textarea
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              placeholder="This is private. Only you can see this."
              rows={4}
              className="w-full text-sm bg-transparent border rounded-lg p-3 focus:outline-none resize-none"
              style={{ borderColor: 'var(--t-border)', color: 'var(--t-text)' }}
            />
            <p className="text-[10px] mt-1 mb-3" style={{ color: 'var(--t-muted)' }}>This is never shared. It's yours alone.</p>
            <EditActions onCancel={() => setEditing(null)} onSave={() => saveField("why_i_started", editValue)} />
          </EditPanel>
        )}

        <SettingsItem label="Emergency contact name" value={profile?.emergency_contact_name || "Not set"} onTap={() => { setEditing("ec_name"); setEditValue(profile?.emergency_contact_name || ""); }} />
        {editing === "ec_name" && (
          <EditPanel>
            <input value={editValue} onChange={e => setEditValue(e.target.value)} placeholder="Name" className="w-full text-sm bg-transparent border-b pb-2 focus:outline-none" style={{ borderColor: 'var(--t-border)', color: 'var(--t-text)' }} />
            <EditActions onCancel={() => setEditing(null)} onSave={() => saveField("emergency_contact_name", editValue)} />
          </EditPanel>
        )}

        <SettingsItem label="Emergency contact phone" value={profile?.emergency_contact_phone || "Not set"} onTap={() => { setEditing("ec_phone"); setEditValue(profile?.emergency_contact_phone || ""); }} />
        {editing === "ec_phone" && (
          <EditPanel>
            <input value={editValue} onChange={e => setEditValue(e.target.value)} placeholder="+1 555 000 0000" type="tel" className="w-full text-sm bg-transparent border-b pb-2 focus:outline-none" style={{ borderColor: 'var(--t-border)', color: 'var(--t-text)' }} />
            <EditActions onCancel={() => setEditing(null)} onSave={() => saveField("emergency_contact_phone", editValue)} />
          </EditPanel>
        )}

        {/* Mode switching via JourneySection */}
        <div className="mt-4">
          {profile && <JourneySection profile={profile} onProfileUpdate={(updated) => setProfile(prev => ({ ...prev, ...updated }))} />}
        </div>

        <div className="h-8" />

        {/* ── PREFERENCES ─────────────────────────────────────────── */}
        <SectionHeader label="Preferences" />

        <SettingsItem label="Daily savings rate" value={`$${profile?.daily_savings_rate || 15}/day`} onTap={() => { setEditing("savings_rate"); setEditValue(String(profile?.daily_savings_rate || 15)); }} />
        {editing === "savings_rate" && (
          <EditPanel>
            <input value={editValue} onChange={e => setEditValue(e.target.value)} placeholder="15" type="number" className="w-full text-sm bg-transparent border-b pb-2 focus:outline-none" style={{ borderColor: 'var(--t-border)', color: 'var(--t-text)' }} />
            <EditActions onCancel={() => setEditing(null)} onSave={() => saveField("daily_savings_rate", parseFloat(editValue) || 15)} />
          </EditPanel>
        )}

        <SettingsItem label="Savings goal" value={profile?.savings_goal_label || "A week in Lisbon"} onTap={() => { setEditing("goal_label"); setEditValue(profile?.savings_goal_label || "A week in Lisbon"); }} />
        {editing === "goal_label" && (
          <EditPanel>
            <input value={editValue} onChange={e => setEditValue(e.target.value)} placeholder="A week in Lisbon" className="w-full text-sm bg-transparent border-b pb-2 focus:outline-none" style={{ borderColor: 'var(--t-border)', color: 'var(--t-text)' }} />
            <EditActions onCancel={() => setEditing(null)} onSave={() => saveField("savings_goal_label", editValue)} />
          </EditPanel>
        )}

        <SettingsItem label="Savings goal amount" value={`$${profile?.savings_goal_amount || 5000}`} onTap={() => { setEditing("goal_amount"); setEditValue(String(profile?.savings_goal_amount || 5000)); }} />
        {editing === "goal_amount" && (
          <EditPanel>
            <input value={editValue} onChange={e => setEditValue(e.target.value)} placeholder="5000" type="number" className="w-full text-sm bg-transparent border-b pb-2 focus:outline-none" style={{ borderColor: 'var(--t-border)', color: 'var(--t-text)' }} />
            <EditActions onCancel={() => setEditing(null)} onSave={() => saveField("savings_goal_amount", parseFloat(editValue) || 5000)} />
          </EditPanel>
        )}

        <ToggleItem label="Quiet hours" value={profile?.quiet_hours_enabled !== false} onToggle={() => saveField("quiet_hours_enabled", !profile?.quiet_hours_enabled)} />
        <ToggleItem label="Anchor button" value={profile?.anchor_button_enabled !== false} onToggle={() => saveField("anchor_button_enabled", !profile?.anchor_button_enabled)} />
        <ToggleItem label="Evening reflection push" value={profile?.reflection_push_enabled !== false} onToggle={() => saveField("reflection_push_enabled", !profile?.reflection_push_enabled)} />
        <ToggleItem label="Letters" value={profile?.letters_enabled !== false} onToggle={() => saveField("letters_enabled", !profile?.letters_enabled)} />

        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between py-4 border-b text-left"
          style={{ borderColor: 'var(--t-border)' }}
        >
          <span className="text-sm" style={{ color: 'var(--t-text)' }}>Theme</span>
          <div className="flex items-center gap-2">
            {isDark ? <Moon size={13} style={{ color: 'var(--t-muted)' }} /> : <Sun size={13} style={{ color: 'var(--t-muted)' }} />}
            <span className="text-sm" style={{ color: 'var(--t-muted)' }}>{isDark ? 'Dark' : 'Light'}</span>
          </div>
        </button>

        <div className="h-8" />

        {/* ── ABOUT ───────────────────────────────────────────────── */}
        <SectionHeader label="About" />
        <div className="mb-6">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--t-muted)' }}>
            Current is for people who are proud of who they are today. No labels. No programs. Just presence.
          </p>
          <p className="text-xs mt-4" style={{ color: 'var(--t-accent)' }}>Present tense. Always.</p>
        </div>
        <div className="flex flex-col gap-3 mb-4">
          <a href="mailto:hello@currentapp.studio" className="text-xs font-medium" style={{ color: 'var(--t-accent)' }}>Contact</a>
        </div>

        <div className="h-8" />

        {/* ── DATA ────────────────────────────────────────────────── */}
        <SectionHeader label="Data" />

        <button
          onClick={handleExportData}
          disabled={exporting}
          className="w-full py-3 text-sm font-medium text-center rounded-xl border transition-colors mb-3 disabled:opacity-40"
          style={{ borderColor: 'var(--t-border)', color: 'var(--t-text)' }}
        >
          {exporting ? "Preparing…" : "Export my data (JSON)"}
        </button>

        <p className="text-[11px] text-center mb-4" style={{ color: 'var(--t-muted)' }}>
          Everything you've logged, in one file. It's yours.
        </p>

        <button
          onClick={() => base44.auth.logout()}
          className="w-full py-3 text-sm font-medium text-center rounded-xl border transition-colors mb-3"
          style={{ borderColor: 'var(--t-border)', color: 'var(--t-muted)' }}
        >
          Sign out
        </button>

        {!showDeleteConfirm ? (
          <button
            onClick={async () => {
              const ok = await authenticateWithBiometrics("Confirm to delete account");
              if (!ok) return;
              setShowDeleteConfirm(true);
            }}
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
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 rounded-xl text-xs font-medium" style={{ color: 'var(--t-muted)' }}>Cancel</button>
              <button onClick={handleDeleteAccount} disabled={deleting} className="flex-1 py-2.5 rounded-xl text-xs font-medium disabled:opacity-40" style={{ backgroundColor: 'var(--t-danger)', color: 'var(--t-text)' }}>
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ label }) {
  return (
    <p className="text-[10px] uppercase tracking-widest font-medium mb-2 mt-2" style={{ color: 'var(--t-muted)' }}>
      {label}
    </p>
  );
}

function SettingsItem({ label, value, onTap }) {
  return (
    <button onClick={onTap} className="w-full flex items-center justify-between py-4 border-b text-left" style={{ borderColor: 'var(--t-border)' }}>
      <span className="text-sm" style={{ color: 'var(--t-text)' }}>{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--t-muted)' }}>{value}</span>
        <ChevronLeft size={14} strokeWidth={1.5} style={{ color: 'var(--t-accent)', transform: 'rotate(180deg)' }} />
      </div>
    </button>
  );
}

function ToggleItem({ label, value, onToggle }) {
  return (
    <button onClick={onToggle} className="w-full flex items-center justify-between py-4 border-b text-left" style={{ borderColor: 'var(--t-border)' }}>
      <span className="text-sm" style={{ color: 'var(--t-text)' }}>{label}</span>
      <div
        className="w-10 h-6 rounded-full flex items-center transition-colors"
        style={{ backgroundColor: value ? 'var(--t-accent)' : 'var(--t-border)', padding: '2px' }}
      >
        <div
          className="w-5 h-5 rounded-full transition-transform"
          style={{ backgroundColor: 'var(--t-bg)', transform: value ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </div>
    </button>
  );
}

function EditPanel({ children }) {
  return (
    <div className="py-4 px-4 mb-2 rounded-xl border" style={{ backgroundColor: 'var(--t-card)', borderColor: 'var(--t-border)' }}>
      {children}
    </div>
  );
}

function EditActions({ onCancel, onSave }) {
  return (
    <div className="flex gap-2 mt-4">
      <button onClick={onCancel} className="flex-1 py-2 text-xs font-medium" style={{ color: 'var(--t-muted)' }}>Cancel</button>
      <button onClick={onSave} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: 'var(--t-accent)', color: 'var(--t-bg)' }}>Save</button>
    </div>
  );
}