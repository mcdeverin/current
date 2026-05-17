import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { getDaysSince, getMilestoneLabel } from "../components/current/milestoneData";
import StreakRing from "../components/current/StreakRing";
import BottomNav from "../components/current/BottomNav";

function getNextMilestone(days) {
  const milestones = [1, 7, 14, 30, 60, 90, 180, 365, 500, 730];
  const next = milestones.find(m => m > days);
  if (next) return { label: getMilestoneLabel(next).replace(".", ""), daysLeft: next - days };
  // Beyond 730 — next year anniversary
  const nextYear = Math.ceil(days / 365) * 365;
  return { label: getMilestoneLabel(nextYear).replace(".", ""), daysLeft: nextYear - days };
}

export default function Tracker() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const profiles = await base44.entities.UserProfile.list();
        if (profiles.length > 0) setProfile(profiles[0]);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="min-h-screen" style={{ backgroundColor: "var(--t-bg)" }} />;
  }

  const days = profile?.mode === "streak" && profile?.sobriety_date
    ? getDaysSince(profile.sobriety_date)
    : 0;

  const sinceDate = profile?.sobriety_date
    ? (() => {
        const d = new Date(profile.sobriety_date + "T00:00:00");
        const mo = d.toLocaleDateString("en-US", { month: "long" });
        const dy = d.getDate();
        const yr = d.getFullYear();
        return `${mo} ${dy} · ${yr}`;
      })()
    : null;

  const next = getNextMilestone(days);

  const closingLine = `${days} ${days === 1 ? "choice" : "choices"}.\nAll of them yours.`;

  return (
    <div
      className="min-h-screen pb-24 flex flex-col"
      style={{ backgroundColor: "var(--t-bg)" }}
    >
      <div
        className="flex flex-col items-center px-6 max-w-sm mx-auto w-full"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 80px)" }}
      >
        {/* Ring */}
        <StreakRing days={days} />

        {/* Since date caption */}
        {sinceDate && (
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--t-muted)",
              marginTop: 14,
            }}
          >
            Since {sinceDate}
          </p>
        )}

        {/* Milestone strip */}
        <div
          className="w-full flex items-center justify-between"
          style={{
            marginTop: 28,
            padding: "16px 20px",
            borderRadius: 14,
            backgroundColor: "var(--t-card)",
            border: "1px solid var(--t-border)",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 9,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--t-accent)",
                marginBottom: 6,
              }}
            >
              Next milestone
            </p>
            <p
              className="font-display"
              style={{ fontSize: 18, color: "var(--t-text)", lineHeight: 1.2 }}
            >
              {next.label} — in {next.daysLeft} {next.daysLeft === 1 ? "day" : "days"}
            </p>
          </div>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "1.5px solid var(--t-border)",
              marginLeft: 12,
            }}
          >
            <span
              className="font-display"
              style={{ fontSize: 18, color: "var(--t-text)" }}
            >
              {next.daysLeft}
            </span>
          </div>
        </div>

        {/* Closing line */}
        <p
          className="font-display italic text-center"
          style={{
            fontSize: 14,
            color: "var(--t-muted)",
            marginTop: 22,
            lineHeight: 1.6,
            whiteSpace: "pre-line",
          }}
        >
          {closingLine}
        </p>
      </div>

      <BottomNav />
    </div>
  );
}