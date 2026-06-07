import React, { useState, useEffect } from "react";
import { Moon } from "lucide-react";

/**
 * Returns true when the current local time is within the user's quiet hours
 * window. Defaults: 22:00 → 06:00. Crosses midnight: 22:00–23:59 OR 00:00–05:59.
 */
export function isQuietNow(profile) {
  if (!profile || profile.quiet_hours_enabled === false) return false;
  const start = profile.quiet_start || "22:00";
  const end = profile.quiet_end || "06:00";
  const [sH, sM] = start.split(":").map(Number);
  const [eH, eM] = end.split(":").map(Number);
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const startMin = sH * 60 + sM;
  const endMin = eH * 60 + eM;
  // If end <= start, window crosses midnight.
  if (endMin <= startMin) return cur >= startMin || cur < endMin;
  return cur >= startMin && cur < endMin;
}

function formatTime(date = new Date()) {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? "am" : "am"; // 12-hour will be added correctly below
  const h12 = ((h + 11) % 12) + 1;
  const pm = h >= 12 ? "pm" : "am";
  return `${h12}:${String(m).padStart(2, "0")} ${pm}`;
}

/**
 * Renders Quiet Hours UI in place of the Today body, 22:00–06:00.
 * Deeper-dark theme via local CSS vars; moon glow; one breath card.
 * The header + bottom nav + floating Anchor stay (rendered by Home).
 */
export default function QuietHours() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{
        // Deeper-dark variant per spec
        "--t-bg": "#070a10",
        "--t-card": "#10141c",
        "--t-border": "#1b222d",
        "--t-muted": "#5a6270",
        background: "#070a10",
        backgroundImage:
          "radial-gradient(circle at 80% -10%, rgba(110,143,163,0.10), transparent 50%)",
        minHeight: "calc(100dvh - 0px)",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 72px)",
      }}
      className="pb-24"
    >
      <div className="px-7 max-w-lg mx-auto">
        {/* eyebrow with moon */}
        <div className="flex items-center gap-2 mb-6" style={{ color: "var(--t-accent)" }}>
          <Moon size={15} strokeWidth={1.7} />
          <span className="text-[10px] uppercase tracking-widest font-medium">
            Quiet hours · {formatTime(now)}
          </span>
        </div>

        <p
          className="font-display italic"
          style={{ fontSize: 36, color: "var(--t-text)", lineHeight: 1.15, marginBottom: 14 }}
        >
          It's late.<br />Just rest.
        </p>
        <p
          className="text-sm mb-9"
          style={{ color: "var(--t-muted)", lineHeight: 1.55, maxWidth: 320 }}
        >
          Spots, stats, suggestions — all paused until morning. Nothing tonight needs your attention.
        </p>

        {/* One breath card */}
        <div
          style={{
            padding: "22px 20px",
            borderRadius: 14,
            backgroundColor: "var(--t-card)",
            border: "1px solid var(--t-border)",
            marginBottom: 14,
          }}
        >
          <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: "var(--t-accent)" }}>
            One breath
          </p>
          <p
            className="font-display italic"
            style={{ fontSize: 18, color: "var(--t-text-warm)", lineHeight: 1.45 }}
          >
            “In for four. Out for eight.<br />That's enough for now.”
          </p>
        </div>

        {/* Tucked away note */}
        <div
          style={{
            padding: "14px 16px",
            borderRadius: 12,
            border: "1px dashed var(--t-border)",
            color: "var(--t-muted)",
            fontSize: 12,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Discover, Spots, and Today's Move<br />are tucked away. Back at sunrise.
        </div>
      </div>
    </div>
  );
}
