import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { hapticLight } from "@/lib/haptics";
import { getLocalDateString } from "@/lib/dates";

const DURATIONS = [
  { key: "one_day",    label: "One day",          sub: "Travel, an off day", days: 1 },
  { key: "three_days", label: "Three days",       sub: "Sick, or moving", days: 3 },
  { key: "one_week",   label: "A week",           sub: "Holiday, big trip", days: 7 },
  { key: "open_ended", label: "Until I come back", sub: "No countdown", days: null },
];

export default function Pause() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [selected, setSelected] = useState("three_days"); // default per spec
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    base44.entities.UserProfile.list().then(p => p.length > 0 && setProfile(p[0])).catch(() => {});
  }, []);

  const isPaused = profile?.paused;

  const handlePause = async () => {
    if (!profile) return;
    setSaving(true);
    hapticLight();

    const opt = DURATIONS.find(d => d.key === selected);
    const startDate = new Date();
    const pauseUntil = opt?.days
      ? (() => { const d = new Date(); d.setDate(d.getDate() + opt.days); return getLocalDateString(d); })()
      : null;

    try {
      await base44.entities.UserProfile.update(profile.id, {
        paused: true,
        pause_until: pauseUntil,
      });
      await base44.entities.Pauses.create({
        user_id: profile.id,
        started_at: startDate.toISOString(),
        duration_label: selected,
      });
    } catch (err) {
      console.error("Pause save failed:", err);
    }
    setSaving(false);
    setDone(true);
  };

  const handleResume = async () => {
    if (!profile) return;
    setSaving(true);
    hapticLight();
    try {
      await base44.entities.UserProfile.update(profile.id, { paused: false, pause_until: null });
      setProfile(prev => ({ ...prev, paused: false, pause_until: null }));
    } catch {}
    setSaving(false);
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-bg)' }}>
      <div className="px-6 max-w-lg mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 mb-8" style={{ color: 'var(--t-accent)' }}>
          <ChevronLeft size={18} strokeWidth={1.5} />
          <span className="text-sm">Mine</span>
        </button>

        {done ? (
          <div className="text-center py-16">
            <p className="font-display italic text-2xl mb-3" style={{ color: 'var(--t-text)' }}>Paused.</p>
            <p className="text-sm mb-8" style={{ color: 'var(--t-muted)' }}>Your number is waiting where you left it.</p>
            <button onClick={() => navigate(-1)} className="text-sm font-medium" style={{ color: 'var(--t-accent)' }}>
              Back to Today
            </button>
          </div>
        ) : isPaused ? (
          <>
            <p className="text-[10px] uppercase tracking-widest font-medium mb-1" style={{ color: 'var(--t-accent)' }}>Quiet pause</p>
            <h1 className="font-display text-3xl font-medium mb-4 leading-tight" style={{ color: 'var(--t-text)' }}>You're paused.</h1>
            {profile?.pause_until && (
              <p className="text-sm mb-8" style={{ color: 'var(--t-muted)' }}>
                Your number is waiting until {new Date(profile.pause_until + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}.
              </p>
            )}
            <button
              onClick={handleResume}
              disabled={saving}
              className="w-full py-3.5 rounded-xl text-sm font-medium disabled:opacity-40"
              style={{ backgroundColor: 'var(--t-accent)', color: 'var(--t-bg)' }}
            >
              {saving ? "Resuming…" : "End pause"}
            </button>
            <p className="font-display italic text-center mt-4" style={{ fontSize: 13, color: 'var(--t-muted)' }}>
              You can come back whenever.
            </p>
          </>
        ) : (
          <>
            <p className="text-[10px] uppercase tracking-widest font-medium mb-1" style={{ color: 'var(--t-accent)' }}>Quiet pause</p>
            <h1 className="font-display text-3xl font-medium mb-3 leading-tight" style={{ color: 'var(--t-text)' }}>
              Take a breath.<br />Your days stay yours.
            </h1>
            <p className="text-sm mb-8" style={{ color: 'var(--t-muted)' }}>
              Pausing isn't restarting. Your number is waiting.
            </p>

            <div className="space-y-2 mb-6">
              {DURATIONS.map(d => (
                <button
                  key={d.key}
                  onClick={() => { hapticLight(); setSelected(d.key); }}
                  className="w-full rounded-xl p-4 text-left flex items-center justify-between"
                  style={{
                    backgroundColor: 'var(--t-card)',
                    border: `1px solid ${selected === d.key ? 'var(--t-accent)' : 'var(--t-border)'}`,
                  }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--t-text)' }}>{d.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--t-muted)' }}>{d.sub}</p>
                  </div>
                  <div
                    className="w-[18px] h-[18px] rounded-full flex-shrink-0"
                    style={{
                      border: `1.5px solid ${selected === d.key ? 'var(--t-accent)' : 'var(--t-border)'}`,
                      ...(selected === d.key && { boxShadow: 'inset 0 0 0 4px var(--t-accent)' }),
                    }}
                  />
                </button>
              ))}
            </div>

            <button
              onClick={handlePause}
              disabled={saving || !profile}
              className="w-full py-3.5 rounded-xl text-sm font-medium disabled:opacity-40"
              style={{ backgroundColor: 'var(--t-accent)', color: 'var(--t-bg)' }}
            >
              {saving ? "Pausing…" : "Begin pause"}
            </button>
            <p className="font-display italic text-center mt-4" style={{ fontSize: 13, color: 'var(--t-muted)' }}>
              You can come back whenever.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
