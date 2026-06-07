import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Phone } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { hapticLight, hapticMedium } from "@/lib/haptics";
import { logPresence } from "@/lib/presence";

// 4-7-8 cycle (seconds) — total 19s per breath
const PHASES = [
  { name: "Breathe in", secs: 4 },
  { name: "Hold", secs: 7 },
  { name: "Breathe out", secs: 8 },
];
const CYCLE = PHASES.reduce((a, p) => a + p.secs, 0);

function usePhase(reducedMotion) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (reducedMotion) return; // hold still
    let cumulative = 0;
    const timers = [];
    const schedule = () => {
      cumulative = 0;
      PHASES.forEach((p, i) => {
        cumulative += p.secs;
        const t = setTimeout(() => {
          setPhase((i + 1) % PHASES.length);
          hapticLight();
        }, cumulative * 1000);
        timers.push(t);
      });
      timers.push(setTimeout(schedule, CYCLE * 1000));
    };
    schedule();
    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);
  return phase;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

export default function Anchor() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [logged, setLogged] = useState(null); // 'almost' | 'drank' | null
  const reducedMotion = usePrefersReducedMotion();
  const phase = usePhase(reducedMotion);

  useEffect(() => {
    hapticMedium();
    logPresence("anchor");
    (async () => {
      try {
        const profiles = await base44.entities.UserProfile.list();
        if (profiles.length > 0) setProfile(profiles[0]);
      } catch {}
    })();
  }, []);

  const phaseName = PHASES[phase].name;
  const reason = profile?.why_i_started?.trim();
  const contactName = profile?.emergency_contact_name?.trim();
  const contactPhone = profile?.emergency_contact_phone?.trim();

  const handleText = () => {
    if (!contactPhone) return;
    hapticMedium();
    // iOS SMS deep link works in Capacitor via window.location
    window.location.href = `sms:${contactPhone}`;
  };

  const handleLog = async (kind) => {
    hapticLight();
    setLogged(kind);
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) return;
      const user = await base44.auth.me();
      await base44.entities.DrinkLogs.create({
        user_id: user.id,
        kind, // 'almost' | 'drank' — does not reset streak
        logged_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("DrinkLogs.create failed:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{
        backgroundColor: "var(--t-bg)",
        backgroundImage: "radial-gradient(circle at 50% 38%, rgba(110,143,163,0.22), transparent 60%)",
      }}
    >
      {/* Close */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-0 right-0 p-5"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)", color: "var(--t-muted)" }}
        aria-label="Close"
      >
        <X size={22} />
      </button>

      {/* Title */}
      <div className="text-center px-6" style={{ marginTop: "calc(env(safe-area-inset-top, 0px) + 72px)" }}>
        <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: "var(--t-accent)" }}>
          Right now
        </p>
        <p
          className="font-display italic"
          style={{ fontSize: 26, color: "var(--t-text)", letterSpacing: "-0.01em" }}
        >
          Just breathe.
        </p>
      </div>

      {/* Breath ring + blob */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="relative" style={{ width: 230, height: 230 }}>
          {/* Outer thin ring (static) */}
          <div
            style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: "1.5px solid var(--t-border)",
            }}
          />
          {/* Animated progress arc — one full sweep per cycle */}
          {!reducedMotion && (
            <svg width="230" height="230" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
              <circle
                cx="115" cy="115" r="113"
                stroke="var(--t-accent)"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="710"
                style={{
                  animation: `arcSweep ${CYCLE}s linear infinite`,
                }}
              />
            </svg>
          )}

          {/* Liquid blob */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{
              borderRadius: "50%",
              background: "rgba(110,143,163,0.10)",
              border: "1px solid rgba(110,143,163,0.30)",
              margin: 26,
              animation: reducedMotion ? "none" : `blob ${CYCLE}s ease-in-out infinite`,
            }}
          >
            <p
              className="font-display italic"
              style={{ fontSize: 22, color: "var(--t-text)" }}
            >
              {reducedMotion ? "Breathe with me" : phaseName}
            </p>
            <p
              className="mt-2 text-[10px] uppercase tracking-widest"
              style={{ color: "var(--t-muted)" }}
            >
              4 · 7 · 8
            </p>
          </div>
        </div>
      </div>

      {/* Why you're here */}
      {reason && (
        <div className="mx-6 mb-4">
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid var(--t-border)",
            }}
          >
            <p
              className="text-[10px] uppercase tracking-widest font-medium mb-1.5"
              style={{ color: "var(--t-accent)" }}
            >
              Why you're here
            </p>
            <p
              className="font-display italic"
              style={{ fontSize: 15, color: "var(--t-text-warm)", lineHeight: 1.45 }}
            >
              “{reason}”
            </p>
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="px-6 pb-6" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}>
        {/* Text contact */}
        {contactPhone ? (
          <button
            onClick={handleText}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium mb-2"
            style={{ backgroundColor: "var(--t-accent)", color: "var(--t-bg)" }}
          >
            <Phone size={15} strokeWidth={2} />
            Text {contactName || "your person"}
          </button>
        ) : (
          <button
            onClick={() => navigate("/Settings")}
            className="w-full py-3.5 rounded-xl text-sm font-medium mb-2"
            style={{ border: "1px solid var(--t-border)", color: "var(--t-muted)", backgroundColor: "transparent" }}
          >
            Add someone to text →
          </button>
        )}

        {/* Move */}
        <button
          className="w-full py-3 rounded-xl text-xs font-medium mb-4"
          style={{ border: "1px solid var(--t-border)", color: "var(--t-muted)", backgroundColor: "transparent" }}
          onClick={hapticLight}
        >
          Move — go outside for 5
        </button>

        {/* Log row — neither resets streak */}
        {logged ? (
          <p
            className="font-display italic text-center"
            style={{ fontSize: 13, color: "var(--t-text)" }}
          >
            {logged === "almost" ? "Noted. You held it." : "Noted. Still here."}
          </p>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => handleLog("almost")}
              className="flex-1 py-2.5 rounded-xl text-xs font-medium"
              style={{ border: "1px solid var(--t-border)", color: "var(--t-text)", backgroundColor: "transparent" }}
            >
              Almost · log it
            </button>
            <button
              onClick={() => handleLog("drank")}
              className="flex-1 py-2.5 rounded-xl text-xs font-medium"
              style={{ border: "1px solid var(--t-border)", color: "var(--t-text)", backgroundColor: "transparent" }}
            >
              I drank · log it
            </button>
          </div>
        )}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes blob {
          0%   { transform: scale(0.92); }
          ${(PHASES[0].secs / CYCLE * 100).toFixed(2)}%  { transform: scale(1.06); }
          ${((PHASES[0].secs + PHASES[1].secs) / CYCLE * 100).toFixed(2)}% { transform: scale(1.06); }
          100% { transform: scale(0.92); }
        }
        @keyframes arcSweep {
          from { stroke-dashoffset: 710; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
