import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BottomNav from "@/components/current/BottomNav";
import PullToRefresh from "@/components/current/PullToRefresh";
import { hapticLight } from "@/lib/haptics";
import { logPresence } from "@/lib/presence";
import { getLocalDateString, getDayOfYear } from "@/lib/dates";

const MAX_REPLY = 140;

// Fallback prompts when RoomPrompts entity is empty or unreachable.
const FALLBACK_PROMPTS = [
  "Where did you find yourself today?",
  "What surprised you this week?",
  "What's one thing you're not pretending about anymore?",
  "What did you almost not do today, but did?",
  "Who would you want to call right now, if you could?",
];

function pickFallback() {
  return FALLBACK_PROMPTS[getDayOfYear() % FALLBACK_PROMPTS.length];
}

export default function Room() {
  const [prompt, setPrompt] = useState(null); // full RoomPrompts row when from entity, else null
  const [promptText, setPromptText] = useState("");
  const [replies, setReplies] = useState([]);
  const [draft, setDraft] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const today = getLocalDateString();

  const load = async () => {
    setLoading(true);
    try {
      // Today's prompt — RoomPrompts schema: prompt_text + publish_date
      let p = null;
      try {
        const prompts = await base44.entities.RoomPrompts.filter({ publish_date: today }, "-publish_date", 1);
        p = prompts[0] || null;
      } catch {}
      setPrompt(p);
      setPromptText(p?.prompt_text || pickFallback());

      // Current user id (best effort — replies are anonymous to other users)
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const u = await base44.auth.me();
          setUserId(u.id);
        }
      } catch {}

      // Today's replies — filtered by prompt_id if a real prompt exists,
      // else nothing to show (fallback prompts have no entity rows attached)
      if (p?.id) {
        try {
          const all = await base44.entities.RoomReplies.filter({ prompt_id: p.id }, "-posted_at", 100);
          setReplies(all);
        } catch {
          setReplies([]);
        }
      } else {
        setReplies([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); logPresence("room"); }, []);

  const handleSubmit = async () => {
    if (!draft.trim() || !userId || !prompt?.id) return;
    hapticLight();
    try {
      const now = new Date();
      const expires = new Date(now);
      expires.setDate(now.getDate() + 1);
      expires.setHours(0, 0, 0, 0); // end of today, local
      await base44.entities.RoomReplies.create({
        prompt_id: prompt.id,
        user_id: userId,
        body: draft.trim(),
        posted_at: now.toISOString(),
        expires_at: expires.toISOString(),
      });
      setDraft("");
      setSubmitted(true);
      load();
    } catch (err) {
      console.error("Room reply submit failed:", err);
    }
  };

  return (
    <PullToRefresh onRefresh={load}>
      <div
        className="min-h-screen pb-24"
        style={{ backgroundColor: "var(--t-bg)", paddingTop: "calc(env(safe-area-inset-top,0px) + 72px)" }}
      >
        <div className="px-6 max-w-lg mx-auto">
          {/* Eyebrow */}
          <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: "var(--t-accent)" }}>
            The Room
          </p>

          {/* Today's prompt */}
          <h1
            className="font-display font-medium"
            style={{ fontSize: 26, color: "var(--t-text)", lineHeight: 1.2, letterSpacing: "-0.01em" }}
          >
            {loading ? "—" : promptText}
          </h1>
          <p className="text-xs mt-2 mb-8" style={{ color: "var(--t-muted)" }}>
            One question. Anonymous. Gone tomorrow.
          </p>

          {/* Reply input */}
          {!submitted ? (
            <div
              className="mb-8"
              style={{
                padding: 16,
                borderRadius: 12,
                backgroundColor: "var(--t-card)",
                border: "1px solid var(--t-border)",
              }}
            >
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, MAX_REPLY))}
                placeholder={
                  !userId
                    ? "Sign in to add your line."
                    : !prompt?.id
                      ? "Today's prompt isn't published yet."
                      : "A line. That's enough."
                }
                disabled={!userId || !prompt?.id}
                rows={3}
                className="w-full bg-transparent text-sm resize-none focus:outline-none"
                style={{ color: "var(--t-text)", fontFamily: "'DM Sans', sans-serif" }}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px]" style={{ color: "var(--t-muted)" }}>
                  {draft.length}/{MAX_REPLY}
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={!draft.trim() || !userId || !prompt?.id}
                  className="px-4 py-1.5 rounded-full text-xs font-medium disabled:opacity-40"
                  style={{ backgroundColor: "var(--t-accent)", color: "var(--t-bg)" }}
                >
                  Add your line
                </button>
              </div>
            </div>
          ) : (
            <p
              className="font-display italic text-center mb-8"
              style={{ fontSize: 14, color: "var(--t-text)" }}
            >
              Added. It'll be here today.
            </p>
          )}

          {/* Replies list */}
          {replies.length > 0 ? (
            <div className="space-y-3">
              {replies.map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    backgroundColor: "var(--t-card-alt)",
                    border: "1px solid var(--t-border)",
                  }}
                >
                  <p
                    className="font-display italic"
                    style={{ fontSize: 14, color: "var(--t-text-warm)", lineHeight: 1.5 }}
                  >
                    {r.body}
                  </p>
                </div>
              ))}
            </div>
          ) : !loading && (
            <p
              className="font-display italic text-center"
              style={{ fontSize: 13, color: "var(--t-muted)", marginTop: 4 }}
            >
              Be the first today.
            </p>
          )}
        </div>
        <BottomNav />
      </div>
    </PullToRefresh>
  );
}
