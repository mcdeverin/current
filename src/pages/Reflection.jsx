import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { logPresence } from "@/lib/presence";
import { hapticLight } from "@/lib/haptics";

const KINDS = [
  { key: "a_win", label: "A win", placeholder: "Something you handled well today…" },
  { key: "a_person", label: "A person", placeholder: "Someone you're grateful for…" },
  { key: "made_it_through", label: "Made it through", placeholder: "Something hard you got through…" },
];

export default function Reflection() {
  const navigate = useNavigate();
  const [kind, setKind] = useState("a_win");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => u && setUserId(u.id)).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!userId || !note.trim()) return;
    hapticLight();
    await base44.entities.Reflections.create({
      user_id: userId,
      logged_at: new Date().toISOString(),
      kind,
      note: note.trim(),
    });
    logPresence("reflection");
    setSaved(true);
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-bg)' }}>
      <div className="px-6 max-w-lg mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 mb-8" style={{ color: 'var(--t-accent)' }}>
          <ChevronLeft size={18} strokeWidth={1.5} />
          <span className="text-sm">Today</span>
        </button>

        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--t-accent)' }}>Tonight's reflection</p>
        <p className="font-display text-3xl font-medium mb-8 leading-tight" style={{ color: 'var(--t-text)' }}>
          Name one thing.
        </p>

        {/* Kind selector */}
        <div className="flex gap-2 mb-8">
          {KINDS.map(k => (
            <button
              key={k.key}
              onClick={() => { hapticLight(); setKind(k.key); }}
              className="flex-1 py-2 rounded-full text-xs font-medium transition-colors"
              style={{
                backgroundColor: kind === k.key ? 'var(--t-accent)' : 'var(--t-card)',
                color: kind === k.key ? 'var(--t-bg)' : 'var(--t-muted)',
                border: '1px solid var(--t-border)',
              }}
            >
              {k.label}
            </button>
          ))}
        </div>

        {saved ? (
          <div className="text-center py-12">
            <p className="font-display italic text-xl mb-2" style={{ color: 'var(--t-text)' }}>Noted.</p>
            <p className="text-sm" style={{ color: 'var(--t-muted)' }}>You showed up again today.</p>
          </div>
        ) : (
          <>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={KINDS.find(k => k.key === kind)?.placeholder}
              rows={5}
              className="w-full bg-transparent rounded-xl p-4 text-sm resize-none focus:outline-none mb-6"
              style={{ border: '1px solid var(--t-border)', color: 'var(--t-text)', fontFamily: "'DM Sans', sans-serif" }}
            />
            <button
              onClick={handleSave}
              disabled={!note.trim()}
              className="w-full py-3.5 rounded-xl text-sm font-medium transition-opacity disabled:opacity-30"
              style={{ backgroundColor: 'var(--t-accent)', color: 'var(--t-bg)' }}
            >
              Save reflection
            </button>
          </>
        )}
      </div>
    </div>
  );
}