import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { hapticLight } from "@/lib/haptics";
import { logPresence } from "@/lib/presence";

export default function Letters() {
  const navigate = useNavigate();
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWrite, setShowWrite] = useState(false);
  const [body, setBody] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadTodaysLetter();
    logPresence("why_read");
  }, []);

  const loadTodaysLetter = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const u = await base44.auth.me();
        setUserId(u.id);
      }
      // Get approved letters, pick today's by date seed
      const letters = await base44.entities.Letters.filter({ status: "approved" }, "-published_at", 50);
      if (letters.length > 0) {
        const day = new Date().toDateString();
        const seed = day.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        setLetter(letters[seed % letters.length]);
      }
    } catch (err) {
      console.error("loadTodaysLetter error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!userId || !body.trim()) return;
    hapticLight();
    await base44.entities.UserLetters.create({
      user_id: userId,
      body: body.trim(),
      submitted_at: new Date().toISOString(),
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-bg)' }}>
      <div className="px-6 max-w-lg mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 mb-8" style={{ color: 'var(--t-accent)' }}>
          <ChevronLeft size={18} strokeWidth={1.5} />
          <span className="text-sm">Mine</span>
        </button>

        <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--t-accent)' }}>Letters</p>
        <h1 className="font-display text-3xl font-medium mb-8 leading-tight" style={{ color: 'var(--t-text)' }}>
          A note for you.
        </h1>

        {loading ? (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: 'var(--t-muted)' }}>Loading…</p>
          </div>
        ) : letter ? (
          <div className="rounded-xl p-6 mb-8" style={{ backgroundColor: 'var(--t-card)', border: '1px solid var(--t-border)' }}>
            <p className="font-display leading-relaxed mb-6" style={{ fontSize: 17, color: 'var(--t-text)' }}>
              {letter.body}
            </p>
            <p className="text-xs italic" style={{ color: 'var(--t-muted)' }}>
              — {letter.anonymous_author_label}
            </p>
          </div>
        ) : (
          <div className="py-12 text-center mb-8">
            <p className="font-display italic text-lg mb-2" style={{ color: 'var(--t-text)' }}>Coming soon.</p>
            <p className="text-sm" style={{ color: 'var(--t-muted)' }}>Letters from the community are on their way.</p>
          </div>
        )}

        {/* Write your own */}
        {userId && !showWrite && (
          <button
            onClick={() => { hapticLight(); setShowWrite(true); }}
            className="text-sm font-medium"
            style={{ color: 'var(--t-accent)' }}
          >
            Write your own →
          </button>
        )}

        {showWrite && !submitted && (
          <div>
            <p className="font-display text-xl font-medium mb-2" style={{ color: 'var(--t-text)' }}>Your letter</p>
            <p className="text-xs mb-4" style={{ color: 'var(--t-muted)' }}>
              Anonymous. Reviewed before it reaches anyone.
            </p>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write something to someone who might need to hear it…"
              rows={6}
              className="w-full bg-transparent rounded-xl p-4 text-sm resize-none focus:outline-none mb-4"
              style={{ border: '1px solid var(--t-border)', color: 'var(--t-text)', fontFamily: "'DM Sans', sans-serif" }}
            />
            <button
              onClick={handleSubmit}
              disabled={!body.trim()}
              className="w-full py-3.5 rounded-xl text-sm font-medium transition-opacity disabled:opacity-30"
              style={{ backgroundColor: 'var(--t-accent)', color: 'var(--t-bg)' }}
            >
              Submit letter
            </button>
          </div>
        )}

        {submitted && (
          <div className="rounded-xl p-5 border text-center" style={{ backgroundColor: 'var(--t-card)', borderColor: 'var(--t-border)' }}>
            <p className="font-display italic text-lg mb-1" style={{ color: 'var(--t-text)' }}>Received.</p>
            <p className="text-sm" style={{ color: 'var(--t-muted)' }}>Someone will read this when they need it.</p>
          </div>
        )}
      </div>
    </div>
  );
}