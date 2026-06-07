import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { logPresence } from "@/lib/presence";
import { hapticLight } from "@/lib/haptics";
import BreathBlob from "@/components/current/BreathBlob";

const KINDS = [
  { key: "a_win", label: "A small win" },
  { key: "a_person", label: "A person" },
  { key: "made_it_through", label: "Just made it through" },
];

function formatNow(d = new Date()) {
  const h = d.getHours();
  const m = d.getMinutes();
  const h12 = ((h + 11) % 12) + 1;
  const pm = h >= 12 ? "PM" : "AM";
  return `${h12}:${String(m).padStart(2, "0")} ${pm}`;
}

export default function Reflection() {
  const navigate = useNavigate();
  const [kind, setKind] = useState("a_win");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [winddown, setWinddown] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => u && setUserId(u.id)).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    hapticLight();
    try {
      await base44.entities.Reflections.create({
        user_id: userId,
        logged_at: new Date().toISOString(),
        kind,
        note: note.trim() || null,
      });
      logPresence("reflection");
    } catch (err) {
      console.error("Reflection save failed:", err);
    }
    setSaved(true);
  };

  // 3-breath wind-down (calmer than Anchor — no log buttons, exits to Home)
  if (winddown) {
    return (
      <div
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
        style={{
          backgroundColor: '#0b0e14',
          backgroundImage: 'radial-gradient(circle at 50% 38%, rgba(110,143,163,0.18), transparent 60%)',
        }}
      >
        <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--t-accent)' }}>
          Three breaths
        </p>
        <p className="font-display italic mb-10" style={{ fontSize: 22, color: 'var(--t-text)' }}>
          Then sleep.
        </p>
        <BreathBlob size={200} />
        <button
          onClick={() => navigate("/")}
          className="mt-10 text-sm font-medium"
          style={{ color: 'var(--t-muted)' }}
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-bg)' }}>
      <div className="px-6 max-w-lg mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 mb-8" style={{ color: 'var(--t-accent)' }}>
          <ChevronLeft size={18} strokeWidth={1.5} />
          <span className="text-sm">Today</span>
        </button>

        <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--t-accent)' }}>
          Tonight · {formatNow()}
        </p>
        <p className="font-display font-medium mb-3 leading-tight" style={{ fontSize: 28, color: 'var(--t-text)' }}>
          What kept you here today?
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--t-muted)' }}>
          One word, one breath, one tap. That's it.
        </p>

        {!saved ? (
          <>
            <div className="space-y-2 mb-6">
              {KINDS.map(k => (
                <button
                  key={k.key}
                  onClick={() => { hapticLight(); setKind(k.key); }}
                  className="w-full rounded-xl p-4 text-left flex items-center justify-between"
                  style={{
                    backgroundColor: kind === k.key ? 'var(--t-accent-bg)' : 'var(--t-card)',
                    border: `1px solid ${kind === k.key ? 'var(--t-accent)' : 'var(--t-border)'}`,
                  }}
                >
                  <span className="text-sm" style={{ color: 'var(--t-text)' }}>{k.label}</span>
                  {kind === k.key && (
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--t-accent)' }} />
                  )}
                </button>
              ))}
            </div>

            <div
              className="rounded-xl p-4 mb-6"
              style={{ backgroundColor: 'var(--t-card)', border: '1px solid var(--t-border)' }}
            >
              <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--t-muted)' }}>
                What was it (optional)
              </p>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value.slice(0, 240))}
                placeholder="A line, if you want."
                rows={3}
                className="w-full bg-transparent text-sm resize-none focus:outline-none font-display italic"
                style={{ color: 'var(--t-text-warm)', fontSize: 15, lineHeight: 1.5 }}
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full py-3.5 rounded-xl text-sm font-medium"
              style={{ backgroundColor: 'var(--t-accent)', color: 'var(--t-bg)' }}
            >
              Save reflection
            </button>

            <p className="text-[11px] text-center mt-4" style={{ color: 'var(--t-muted)' }}>
              Saved to your thread. Only you ever see it.
            </p>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="font-display italic text-xl mb-2" style={{ color: 'var(--t-text)' }}>
              Noted.
            </p>
            <p className="text-sm mb-10" style={{ color: 'var(--t-muted)' }}>
              You showed up again today.
            </p>
            <button
              onClick={() => { hapticLight(); setWinddown(true); }}
              className="text-sm font-medium"
              style={{ color: 'var(--t-accent)' }}
            >
              Sit for a minute? →
            </button>
            <div className="mt-6">
              <button
                onClick={() => navigate(-1)}
                className="text-xs"
                style={{ color: 'var(--t-muted)' }}
              >
                Or just go to sleep
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
