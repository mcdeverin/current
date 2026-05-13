import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send } from "lucide-react";
import { hapticMedium, hapticLight } from "@/lib/haptics";

function getLocalDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Deterministic letter selection: hash(userEmail + date) mod approvedCount
async function hashStr(str) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-1", enc.encode(str));
  const arr = new Uint8Array(buf);
  return arr.reduce((acc, b, i) => acc + b * (i + 1), 0);
}

export default function Letters() {
  const [letters, setLetters] = useState([]);
  const [todayLetter, setTodayLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [draftBody, setDraftBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [profile, setProfile] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) { setIsGuest(true); setLoading(false); return; }
    const user = await base44.auth.me();
    setUserEmail(user?.email);
    const profiles = await base44.entities.UserProfile.list();
    setProfile(profiles[0]);

    const approved = await base44.entities.Letter.filter({ status: "approved" }, '-created_at', 50);
    if (approved.length === 0) { setLoading(false); return; }

    const today = getLocalDateStr();
    const hashVal = await hashStr((user?.email || "guest") + today);
    const idx = hashVal % approved.length;
    setTodayLetter(approved[idx]);
    // Show up to 4 past letters (different from today)
    const others = approved.filter((_, i) => i !== idx).slice(0, 4);
    setLetters(others);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!draftBody.trim() || submitting) return;
    setSubmitting(true);
    hapticMedium();
    const authorDay = profile?.sobriety_date
      ? Math.floor((new Date() - new Date(profile.sobriety_date + "T00:00:00")) / 86400000)
      : 0;
    await base44.entities.Letter.create({
      body: draftBody.slice(0, 280),
      author_day: authorDay,
      status: "pending",
      created_at: new Date().toISOString(),
      delivered_count: 0,
    });
    setSubmitting(false);
    setSubmitted(true);
    setShowCompose(false);
    setDraftBody("");
  };

  if (loading) {
    return <div className="min-h-screen" style={{ backgroundColor: 'var(--t-bg)', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }} />;
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-bg)', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>
      <div className="px-6 max-w-lg mx-auto">
        <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--t-muted)' }}>Letters</p>
        <p className="font-display text-[28px] leading-snug mb-1" style={{ color: 'var(--t-text)' }}>
          From strangers, who are also here.
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--t-muted)' }}>Anonymous. Read-only. One delivered each morning.</p>

        {/* Today's letter */}
        {todayLetter && (
          <div className="rounded-xl p-5 mb-3 relative" style={{ backgroundColor: 'var(--t-card-alt)', border: '1px solid var(--t-border)' }}>
            <span className="absolute top-4 right-4 text-[9px] tracking-[0.2em] font-medium" style={{ color: 'var(--t-accent)' }}>TODAY</span>
            <p className="font-display text-[15px] italic leading-[1.55] mb-3" style={{ color: 'var(--t-text-warm)' }}>
              "{todayLetter.body}"
            </p>
            <p className="text-[11px]" style={{ color: 'var(--t-muted)' }}>
              — someone on day {todayLetter.author_day || "?"}
            </p>
          </div>
        )}

        {/* Past letters */}
        {letters.map(l => (
          <div key={l.id} className="rounded-xl p-5 mb-3" style={{ backgroundColor: 'var(--t-card)', border: '1px solid var(--t-border)' }}>
            <p className="font-display text-[15px] italic leading-[1.55] mb-3" style={{ color: 'var(--t-text-warm)' }}>
              "{l.body}"
            </p>
            <p className="text-[11px]" style={{ color: 'var(--t-muted)' }}>
              — someone on day {l.author_day || "?"}
            </p>
          </div>
        ))}

        {!todayLetter && !loading && (
          <div className="py-12 text-center">
            <p className="font-display text-xl mb-2" style={{ color: 'var(--t-text)' }}>Nothing here yet.</p>
            <p className="text-sm" style={{ color: 'var(--t-muted)' }}>Be the first to leave one.</p>
          </div>
        )}

        {/* Compose CTA */}
        {submitted ? (
          <div className="mt-6 rounded-xl p-5 text-center" style={{ backgroundColor: 'var(--t-card)', border: '1px solid var(--t-border)' }}>
            <p className="font-display text-lg mb-1" style={{ color: 'var(--t-text)' }}>Thanks.</p>
            <p className="text-sm" style={{ color: 'var(--t-muted)' }}>We read every letter before it goes out.</p>
          </div>
        ) : !showCompose ? (
          <button
            onClick={() => { hapticLight(); setShowCompose(true); }}
            className="mt-6 w-full py-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 border-2 border-dashed"
            style={{ borderColor: 'var(--t-border)', color: 'var(--t-muted)' }}
          >
            <Send size={15} />
            Leave one yourself
          </button>
        ) : (
          <div className="mt-6 rounded-xl p-5" style={{ backgroundColor: 'var(--t-card)', border: '1px solid var(--t-border)' }}>
            <p className="text-[10px] uppercase tracking-widest font-medium mb-3" style={{ color: 'var(--t-accent)' }}>Your letter</p>
            <textarea
              value={draftBody}
              onChange={e => setDraftBody(e.target.value.slice(0, 280))}
              placeholder="What do you wish someone had said to you?"
              rows={4}
              className="w-full text-sm bg-transparent focus:outline-none resize-none font-display italic"
              style={{ color: 'var(--t-text-warm)', caretColor: 'var(--t-accent)' }}
            />
            <div className="flex items-center justify-between mt-2 mb-4">
              <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>{280 - draftBody.length} left</p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!draftBody.trim() || submitting}
              className="w-full py-3 rounded-xl text-sm font-medium disabled:opacity-30"
              style={{ backgroundColor: 'var(--t-accent)', color: 'var(--t-bg)' }}
            >
              {submitting ? "Sending…" : "Submit anonymously"}
            </button>
            <button
              onClick={() => setShowCompose(false)}
              className="w-full py-2 mt-2 text-xs"
              style={{ color: 'var(--t-muted)' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}