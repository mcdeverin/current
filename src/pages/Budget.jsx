import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BottomNav from "@/components/current/BottomNav";
import PullToRefresh from "@/components/current/PullToRefresh";
import { getDaysSince } from "@/components/current/milestoneData";

// "What this could be" — kept light; not a hard money guide, just a reframe.
const COULD_BE = [
  { count: 114, label: "good paperbacks", per: 30 },
  { count: 28, label: "dinners out, with a friend", per: 120 },
  { count: 3, label: "rounds of therapy", per: 1000 },
];

function fmtMoney(n) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export default function Budget() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const profiles = await base44.entities.UserProfile.list();
      if (profiles.length > 0) setProfile(profiles[0]);
    } catch {
      // entity may not exist yet; surface as empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const isExploring = profile?.mode === "exploring";
  const days = (profile?.sobriety_date && !isExploring) ? getDaysSince(profile.sobriety_date) : 0;
  const rate = profile?.daily_savings_rate ?? 15;
  const savedTotal = days * rate;
  const goalAmount = profile?.savings_goal_amount ?? 0;
  const goalLabel = profile?.savings_goal_label ?? null;
  const pct = goalAmount > 0 ? Math.min(savedTotal / goalAmount, 1) : 0;
  const remaining = Math.max(goalAmount - savedTotal, 0);
  const daysToGoal = rate > 0 ? Math.ceil(remaining / rate) : null;

  return (
    <PullToRefresh onRefresh={loadProfile}>
      <div
        className="min-h-screen pb-24"
        style={{ backgroundColor: "var(--t-bg)", paddingTop: "calc(env(safe-area-inset-top,0px) + 72px)" }}
      >
        <div className="px-6 max-w-lg mx-auto">
          {/* Eyebrow + sub */}
          <p className="text-[10px] uppercase tracking-widest font-medium mb-1" style={{ color: "var(--t-accent)" }}>
            Quiet gains
          </p>
          <p className="text-sm mb-10" style={{ color: "var(--t-muted)" }}>
            {loading
              ? "—"
              : isExploring || days === 0
                ? "Set a start date in Mine to track this."
                : `${days} day${days === 1 ? "" : "s"} × $${rate}/day, give or take.`}
          </p>

          {/* Hero number */}
          <div className="text-center mb-10">
            <p
              className="font-display font-medium"
              style={{ fontSize: 60, color: "var(--t-text)", letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}
            >
              {fmtMoney(savedTotal)}
            </p>
            <p
              className="mt-2 text-[10px] uppercase tracking-widest font-medium"
              style={{ color: "var(--t-muted)" }}
            >
              Not spent · {days} days
            </p>
          </div>

          {/* Jar */}
          <div
            className="relative mb-6 overflow-hidden"
            style={{
              height: 180,
              borderRadius: 14,
              backgroundColor: "var(--t-card)",
              border: "1px solid var(--t-border)",
              padding: 18,
            }}
          >
            {/* Fill */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: `${pct * 100}%`,
                background: "linear-gradient(180deg, rgba(110,143,163,0.18), rgba(110,143,163,0.28))",
                borderTop: "1px solid var(--t-accent)",
                transition: "height 600ms ease-out",
              }}
            />
            {/* Foreground content */}
            <div style={{ position: "relative" }}>
              <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--t-accent)" }}>
                Saving toward
              </p>
              <p className="font-display italic mt-1" style={{ fontSize: 22, color: "var(--t-text)" }}>
                {goalLabel || "Set a goal →"}
              </p>
              {goalAmount > 0 ? (
                <p className="text-xs mt-1" style={{ color: "var(--t-muted)" }}>
                  {fmtMoney(savedTotal)} of {fmtMoney(goalAmount)}
                  {daysToGoal != null && remaining > 0 && ` · ~${daysToGoal} days to go`}
                </p>
              ) : (
                <p className="text-xs mt-1" style={{ color: "var(--t-muted)" }}>
                  Add a goal in Mine to fill the jar.
                </p>
              )}
            </div>
          </div>

          {/* "What this could be" */}
          <div
            className="overflow-hidden"
            style={{ borderRadius: 12, backgroundColor: "var(--t-card-alt)", border: "1px solid var(--t-border)" }}
          >
            {COULD_BE.map(({ count, label, per }, i) => {
              const possible = Math.floor(savedTotal / per);
              const show = Math.max(possible, 0);
              return (
                <div
                  key={label}
                  className="flex items-baseline justify-between"
                  style={{
                    padding: "14px 16px",
                    borderBottom: i < COULD_BE.length - 1 ? "1px solid var(--t-border)" : "none",
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--t-text)" }}>{label}</span>
                  <span
                    className="font-display"
                    style={{ fontSize: 20, color: "var(--t-accent)", fontVariantNumeric: "tabular-nums" }}
                  >
                    {show || count /* fall back to design's poetic count when jar is empty */}
                  </span>
                </div>
              );
            })}
          </div>

          <p
            className="font-display italic text-center mt-8"
            style={{ fontSize: 13, color: "var(--t-muted)", lineHeight: 1.6 }}
          >
            Numbers, but quietly.
          </p>
        </div>
        <BottomNav />
      </div>
    </PullToRefresh>
  );
}
