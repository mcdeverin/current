import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { hapticLight } from "@/lib/haptics";
import { logPresence } from "@/lib/presence";
import MoodWave from "./MoodWave";

const STOPS = [
  { label: "struggling", response: "That's real. Just being here counts." },
  { label: null,         response: "Some days ask more of you." },
  { label: "steady",     response: "That's worth something." },
  { label: null,         response: "Hold onto this." },
  { label: "good",       response: "Notice it. That's the work." },
];

const DISPLAY_ANSWERS = [
  "Struggling, today.",
  "Getting through it.",
  "Steady, today.",
  "Doing well.",
  "Really good.",
];

export default function InlineMoodScale() {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [weekPoints, setWeekPoints] = useState([]);
  const [userId, setUserId] = useState(null);
  const [todayLogged, setTodayLogged] = useState(false);

  useEffect(() => {
    loadMoodHistory();
  }, []);

  const loadMoodHistory = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) { setWeekPoints([2,2,1,2,2,3,2]); return; }

      const user = await base44.auth.me();
      setUserId(user.id);

      const logs = await base44.entities.MoodLog.filter(
        { user_id: user.id },
        "-logged_at",
        30
      );

      // Build 7-day array (oldest → today)
      const today = new Date();
      const points = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const match = logs.find(l => l.logged_at && l.logged_at.slice(0, 10) === dateStr);
        points.push(match ? match.mood_index : 2); // default neutral
        if (i === 0 && match) {
          setSelectedIdx(match.mood_index);
          setTodayLogged(true);
        }
      }
      setWeekPoints(points);
    } catch (err) {
      console.error("loadMoodHistory", err);
      setWeekPoints([2,2,1,2,2,3,2]);
    }
  };

  const handleSelect = async (idx) => {
    hapticLight();
    setSelectedIdx(idx);
    setWeekPoints(prev => { const next = [...prev.slice(-7)]; next[6] = idx; return next; });
    setTodayLogged(true);

    if (!userId) return;
    const now = new Date().toISOString();
    await base44.entities.MoodLog.create({ user_id: userId, logged_at: now, mood_index: idx });
    logPresence("mood");
  };

  const displayIdx = selectedIdx ?? 2;
  const stop = STOPS[displayIdx];

  return (
    <div style={{ width: "100%" }}>
      {/* Eyebrow */}
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--t-accent)", marginBottom: 16 }}>
        How are you right now
      </p>

      {/* Display answer */}
      <p className="font-display" style={{ fontSize: 24, fontWeight: 500, color: "var(--t-text)", marginBottom: 24, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
        {selectedIdx !== null ? DISPLAY_ANSWERS[displayIdx] : <span style={{ color: "var(--t-muted)", fontStyle: "italic", fontSize: 18 }}>tap to check in</span>}
      </p>

      {/* 5-stop scale track */}
      <div style={{ marginBottom: 16, position: "relative", height: 56 }}>
        {/* Base track */}
        <div style={{ position: "absolute", top: "50%", left: 12, right: 12, height: 2, backgroundColor: "var(--t-border)", transform: "translateY(-50%)" }} />
        {/* Filled portion */}
        <div style={{
          position: "absolute", top: "50%", left: 12,
          width: `calc(${(displayIdx / 4) * 100}% - 24px * ${displayIdx / 4})`,
          height: 2, backgroundColor: "var(--t-accent)", transform: "translateY(-50%)",
          transition: "width 0.25s ease"
        }} />
        {/* Stops */}
        {STOPS.map((s, i) => {
          const pct = i / 4;
          const isActive = i === displayIdx;
          const isPast = i < displayIdx;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              style={{
                position: "absolute", top: "50%",
                left: `calc(${pct * 100}%)`,
                transform: "translate(-50%, -50%)",
                width: isActive ? 24 : 10,
                height: isActive ? 24 : 10,
                borderRadius: "50%",
                backgroundColor: isPast || isActive ? "var(--t-accent)" : "var(--t-border)",
                border: isActive ? "2px solid var(--t-bg)" : "none",
                boxShadow: isActive ? "0 0 0 4px rgba(110,143,163,0.18)" : "none",
                transition: "all 0.2s ease",
                cursor: "pointer",
                zIndex: 1,
              }}
            />
          );
        })}
      </div>

      {/* Labels under 0 / 2 / 4 */}
      <div style={{ display: "flex", justifyContent: "space-between", paddingLeft: 6, paddingRight: 6, marginBottom: 24 }}>
        {["struggling", null, "steady", null, "good"].map((lbl, i) =>
          lbl ? (
            <span key={i} style={{ fontSize: 10, color: "var(--t-muted)", fontFamily: "'DM Sans', sans-serif" }}>{lbl}</span>
          ) : (
            <span key={i} style={{ flex: 1 }} />
          )
        )}
      </div>

      {/* Italic response */}
      {selectedIdx !== null && (
        <p className="font-display italic text-center" style={{ fontSize: 14, color: "var(--t-text)", marginBottom: 24 }}>
          {stop.response}
        </p>
      )}

      {/* Waveform */}
      {weekPoints.length > 0 && <MoodWave points={weekPoints} />}
    </div>
  );
}