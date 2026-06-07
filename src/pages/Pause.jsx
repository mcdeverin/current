import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { hapticLight } from "@/lib/haptics";

const DURATIONS = [
  { key: "one_day",    label: "One day",   sub: "Back tomorrow" },
  { key: "three_days", label: "Three days", sub: "A short rest" },
  { key: "one_week",   label: "One week",  sub: "Take your time" },
  { key: "open_ended", label: "Open",      sub: "Return when ready" },
];

export default function Pause() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [selected, setSelected] = useState("one_day");
  const [confirming, setConfirming] = useState(false);
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

    const durationDays = { one_day: 1, three_days: 3, one_week: 7, open_ended: null };
    const d = durationDays[selected];
    const pauseUntil = d ? new Date(Date.now() + d * 86400000).toISOString().slice(0, 10) : null;

    await base44.entities.UserProfile.update(profile.id, { paused: true, pause_until: pauseUntil });
    await base44.entities.Pauses.create({
      user_id: profile.id,
      started_at: new Date().toISOString(),
      duration_label: selected,
    });

    setSaving(false);
    setDone(true);
  };

  const handleResume = async () => {
    if (!profile) return;
    setSaving(true);
    hapticLight();
    await base44.entities.UserProfile.update(profile.id, { paused: false, pause_until: null });
    setProfile(prev => ({ ...prev, paused: false, pause_until: null }));
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
            <p className="text-sm mb-8" style={{ color: 'var(--t-muted)' }}>Your streak is held. Come back when you're ready.</p>
            <button onClick={() => navigate(-1)} className="text-sm font-medium" style={{ color: 'var(--t-accent)' }}>Back to Today</button>
          </div>
        ) : isPaused ? (
          <>
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--t-accent)' }}>Pause</p>
            <h1 className="font-display text-3xl font-medium mb-4 leading-tight" style={{ color: 'var(--t-text)' }}>You're paused.</h1>
            {profile?.pause_until && (
              <p className="text-sm mb-8" style={{ color: 'var(--t-muted)' }}>
                Streak held until {new Date(profile.pause_until + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}.
              </p>
            )}
            <button
              onClick={handleResume}
              disabled={saving}
              className="w-full py-3.5 rounded-xl text-sm font-medium disabled:opacity-40"
              style={{ backgroundColor: 'var(--t-accent)', color: 'var(--t-bg)' }}
            >
              {saving ? "Resuming…" : "Resume streak"}
            </button>
          </>
        ) : (
          <>
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--t-accent)' }}>Pause</p>
            <h1 className="font-display text-3xl font-medium mb-2 leading-tight" style={{ color: 'var(--t-text)' }}>Take a break.</h1>
            <p className="text-sm mb-8" style={{ color: 'var(--t-muted)' }}>
              Life isn't linear. Your streak is held while you pause — no days lost.
            </p>

            {!confirming ? (
              <>
                <div className="space-y-3 mb-8">
                  {DURATIONS.map(d => (
                    <button
                      key={d.key}
                      onClick={() => { hapticLight(); setSelected(d.key); }}
                      className="w-full rounded-xl p-4 text-left flex items-center justify-between"
                      style={{
                        backgroundColor: selected === d.key ? 'var(--t-accent-bg)' : 'var(--t-card)',
                        border: `1px solid ${selected === d.key ? 'var(--t-accent)' : 'var(--t-border)'}`,
                      }}
                    >
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--t-text)' }}>{d.label}</p>
                        <p className="text-xs" style={{ color: 'var(--t-muted)' }}>{d.sub}</p>
                      </div>
                      {selected === d.key && (
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--t-accent)' }} />
                      )}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { hapticLight(); setConfirming(true); }}
                  className="w-full py-3.5 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: 'var(--t-card)', color: 'var(--t-text)', border: '1px solid var(--t-border)' }}
                >
                  Continue
                </button>
              </>
            ) : (
              <div className="rounded-xl p-5 border mb-4" style={{ backgroundColor: 'var(--t-card)', borderColor: 'var(--t-border)' }}>
                <p className="font-display text-lg font-medium mb-2" style={{ color: 'var(--t-text)' }}>
                  Pause for {DURATIONS.find(d => d.key === selected)?.label.toLowerCase()}?
                </p>
                <p className="text-sm mb-6" style={{ color: 'var(--t-muted)' }}>Your streak stays exactly where it is.</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirming(false)} className="flex-1 py-2.5 rounded-xl text-xs font-medium" style={{ color: 'var(--t-muted)' }}>Cancel</button>
                  <button onClick={handlePause} disabled={saving} className="flex-1 py-2.5 rounded-xl text-xs font-medium disabled:opacity-40" style={{ backgroundColor: 'var(--t-accent)', color: 'var(--t-bg)' }}>
                    {saving ? "Pausing…" : "Yes, pause"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}