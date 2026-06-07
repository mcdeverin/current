import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Send } from "lucide-react";
import { hapticLight } from "@/lib/haptics";
import { logPresence } from "@/lib/presence";
import { getLocalDateString } from "@/lib/dates";

// Deterministic delivery: hash(user_id + date) → index in approved letters.
function pickToday(letters, userId) {
  if (!letters || letters.length === 0) return null;
  const key = `${userId || "guest"}-${getLocalDateString()}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) & 0x7fffffff;
  return letters[h % letters.length];
}

export default function Letters() {
  const navigate = useNavigate();
  const [todays, setTodays] = useState(null);
  const [past, setPast] = useState([]); // up to 5 most recent before today
  const [loading, setLoading] = useState(true);
  const [showWrite, setShowWrite] = useState(false);
  const [body, setBody] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    load();
    logPresence("why_read");
  }, []);

  const load = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const u = await base44.auth.me();
        setUserId(u.id);
      }
      const all = await base44.entities.Letters.filter({ status: "approved" }, "-published_at", 50);
      const today = pickToday(all, userId);
      setTodays(today);
      setPast(all.filter(l => !today || l.id !== today.id).slice(0, 5));
    } catch (err) {
      console.error("Letters load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!userId || !body.trim()) return;
    hapticLight();
    try {
      await base44.entities.UserLetters.create({
        user_id: userId,
        body: body.trim(),
        submitted_at: new Date().toISOString(),
      });
      setSubmitted(true);
      setBody("");
    } catch (err) {
      console.error("UserLetters.create failed:", err);
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-bg)' }}>
      <div className="px-6 max-w-lg mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 mb-8" style={{ color: 'var(--t-accent)' }}>
          <ChevronLeft size={18} strokeWidth={1.5} />
          <span className="text-sm">Mine</span>
        </button>

        <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--t-accent)' }}>
          Letters
        </p>
        <h1 className="font-display font-medium mb-2 leading-tight" style={{ fontSize: 28, color: 'var(--t-text)' }}>
          From strangers,<br />who are also here.
        </h1>
        <p className="text-xs mb-8" style={{ color: 'var(--t-muted)' }}>
          Anonymous. Read-only. One each morning.
        </p>

        {loading ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--t-muted)' }}>—</p>
        ) : todays ? (
          <LetterCard letter={todays} isToday />
        ) : (
          <div className="text-center py-8">
            <p className="font-display italic text-lg mb-2" style={{ color: 'var(--t-text)' }}>Soon.</p>
            <p className="text-sm" style={{ color: 'var(--t-muted)' }}>Approved letters land here each morning.</p>
          </div>
        )}

        {past.length > 0 && (
          <div className="mt-6 space-y-3">
            {past.map(l => <LetterCard key={l.id} letter={l} />)}
          </div>
        )}

        {/* Leave one yourself */}
        <div className="mt-8">
          {submitted ? (
            <div
              className="rounded-xl p-5 text-center"
              style={{ backgroundColor: 'var(--t-card)', border: '1px solid var(--t-border)' }}
            >
              <p className="font-display italic text-lg mb-1" style={{ color: 'var(--t-text)' }}>Thanks.</p>
              <p className="text-xs" style={{ color: 'var(--t-muted)' }}>We read every letter before it goes out.</p>
            </div>
          ) : !showWrite ? (
            userId && (
              <button
                onClick={() => { hapticLight(); setShowWrite(true); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
                style={{ border: '1.5px dashed var(--t-border)', color: 'var(--t-muted)', backgroundColor: 'transparent' }}
              >
                <Send size={14} strokeWidth={1.5} />
                Leave one yourself
              </button>
            )
          ) : (
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: 'var(--t-card)', border: '1px solid var(--t-border)' }}
            >
              <p className="font-display italic mb-3" style={{ fontSize: 14, color: 'var(--t-muted)' }}>
                Anonymous. Read before it ships.
              </p>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value.slice(0, 280))}
                placeholder="A line for whoever needs it tomorrow…"
                rows={4}
                className="w-full bg-transparent text-sm resize-none focus:outline-none font-display italic"
                style={{ color: 'var(--t-text-warm)', fontSize: 15, lineHeight: 1.5 }}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px]" style={{ color: 'var(--t-muted)' }}>{body.length}/280</span>
                <button
                  onClick={handleSubmit}
                  disabled={!body.trim()}
                  className="px-4 py-1.5 rounded-full text-xs font-medium disabled:opacity-40"
                  style={{ backgroundColor: 'var(--t-accent)', color: 'var(--t-bg)' }}
                >
                  Submit anonymously
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LetterCard({ letter, isToday = false }) {
  return (
    <div
      className="relative rounded-xl p-5"
      style={{
        backgroundColor: isToday ? 'var(--t-card-alt)' : 'var(--t-card)',
        border: '1px solid var(--t-border)',
      }}
    >
      {isToday && (
        <span
          className="absolute right-4 top-4 text-[9px] uppercase font-medium"
          style={{ color: 'var(--t-accent)', letterSpacing: '0.2em' }}
        >
          Today
        </span>
      )}
      <p
        className="font-display italic"
        style={{ fontSize: 15, color: 'var(--t-text-warm)', lineHeight: 1.55 }}
      >
        “{letter.body}”
      </p>
      <p className="text-xs mt-3" style={{ color: 'var(--t-muted)' }}>
        — {letter.anonymous_author_label || "someone here"}
      </p>
    </div>
  );
}
