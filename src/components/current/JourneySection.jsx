import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { getDaysSince } from "./milestoneData";
import { useTheme } from "./ThemeContext";

export default function JourneySection({ profile, onProfileUpdate }) {
  const { t } = useTheme();
  const [view, setView] = useState("idle");
  const [dateValue, setDateValue] = useState(profile.sobriety_date || "");
  const [dateConfirmed, setDateConfirmed] = useState(false);

  const isExploring = profile.mode === "exploring";
  const hasDate = !!profile.sobriety_date;
  const sinceDate = profile.sobriety_date
    ? new Date(profile.sobriety_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  const update = async (data) => {
    await base44.entities.UserProfile.update(profile.id, data);
    onProfileUpdate(data);
  };

  const handleSwitchToExploring = async () => {
    await update({ mode: "exploring" });
    setView("idle");
  };

  const handleSwitchBack = () => {
    if (hasDate) {
      setView("switching_back");
    } else {
      setDateValue("");
      setView("change_date");
    }
  };

  const handleKeepDate = async () => {
    await update({ mode: "streak" });
    setView("idle");
  };

  const handleChangeDate = () => {
    setDateValue(profile.sobriety_date || "");
    setDateConfirmed(false);
    setView("change_date");
  };

  const handleSaveDate = async () => {
    if (!dateValue) return;
    await update({ sobriety_date: dateValue, mode: "streak", exploring_nudge_dismissed: true });
    setDateConfirmed(true);
  };

  const panelStyle = { backgroundColor: t.bgSecondary, borderColor: t.border };

  return (
    <div className="mb-2">
      <h3 className="text-[10px] uppercase tracking-widest font-medium mb-4" style={{ color: t.muted }}>
        Your Journey
      </h3>

      <div className="mb-5 py-3 px-4 rounded-xl border" style={panelStyle}>
        {isExploring ? (
          <p className="text-sm" style={{ color: t.text }}>Exploring — no date set</p>
        ) : (
          <p className="text-sm" style={{ color: t.text }}>
            Tracking since <span style={{ color: t.success }}>{sinceDate}</span>
          </p>
        )}
      </div>

      {view === "idle" && (
        <div className="space-y-1">
          {!isExploring && (
            <ActionRow label="Change my sobriety date" onTap={() => { setDateValue(profile.sobriety_date || ""); setDateConfirmed(false); setView("change_date"); }} t={t} />
          )}
          {!isExploring && (
            <ActionRow label="Switch to Just Exploring" onTap={() => setView("confirm_exploring")} t={t} />
          )}
          {isExploring && (
            <ActionRow label="Set a sobriety date" onTap={handleSwitchBack} t={t} />
          )}
        </div>
      )}

      {view === "change_date" && (
        <div className="py-4 px-4 rounded-xl border" style={panelStyle}>
          {!hasDate && (
            <p className="text-xs mb-3 leading-relaxed" style={{ color: t.muted }}>
              Ready to set a date? It's just for you.
            </p>
          )}
          {!dateConfirmed ? (
            <>
              <input
                type="date"
                value={dateValue}
                onChange={e => setDateValue(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full text-sm bg-transparent border-b pb-2 focus:outline-none"
                style={{ borderColor: t.border, color: t.text, colorScheme: t.bg === '#0E1113' ? 'dark' : 'light' }}
              />
              <div className="flex gap-2 mt-4">
                <button onClick={() => setView("idle")} className="flex-1 py-2 text-xs font-medium" style={{ color: t.muted }}>
                  Cancel
                </button>
                <button
                  onClick={handleSaveDate}
                  disabled={!dateValue}
                  className="flex-1 py-2 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: dateValue ? t.success : t.bgTertiary, color: dateValue ? '#fff' : t.muted }}
                >
                  Save
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm leading-relaxed mb-4" style={{ color: t.text }}>
                Starting fresh. That's still a choice.
              </p>
              <button
                onClick={() => setView("idle")}
                className="w-full py-2 rounded-lg text-xs font-medium"
                style={{ backgroundColor: t.success, color: '#fff' }}
              >
                Got it
              </button>
            </>
          )}
        </div>
      )}

      {view === "confirm_exploring" && (
        <div className="py-4 px-4 rounded-xl border" style={panelStyle}>
          <p className="text-sm leading-relaxed mb-4" style={{ color: t.text }}>
            No streak, no clock. Just the app. Your call.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setView("idle")} className="flex-1 py-2 text-xs font-medium" style={{ color: t.muted }}>
              Cancel
            </button>
            <button
              onClick={handleSwitchToExploring}
              className="flex-1 py-2 rounded-lg text-xs font-medium"
              style={{ backgroundColor: t.success, color: '#fff' }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {view === "switching_back" && (
        <div className="py-4 px-4 rounded-xl border" style={panelStyle}>
          <p className="text-sm leading-relaxed mb-1" style={{ color: t.text }}>
            Welcome back. Your date is still here.
          </p>
          <p className="text-xs mb-5" style={{ color: t.success }}>{sinceDate}</p>
          <div className="flex gap-2">
            <button
              onClick={handleChangeDate}
              className="flex-1 py-2 rounded-lg text-xs font-medium border"
              style={{ borderColor: t.border, color: t.text }}
            >
              Change it
            </button>
            <button
              onClick={handleKeepDate}
              className="flex-1 py-2 rounded-lg text-xs font-medium"
              style={{ backgroundColor: t.success, color: '#fff' }}
            >
              Keep it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionRow({ label, onTap, t }) {
  return (
    <button
      onClick={onTap}
      className="w-full flex items-center justify-between py-4 border-b text-left"
      style={{ borderColor: t.border }}
    >
      <span className="text-sm" style={{ color: t.text }}>{label}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}