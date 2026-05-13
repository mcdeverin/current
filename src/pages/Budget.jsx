import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BudgetJar from "../components/current/BudgetJar";
import BudgetGoalDrawer from "../components/current/BudgetGoalDrawer";
import { getDaysSince } from "../components/current/milestoneData";

const WHAT_ROWS = [
  { num: (saved) => Math.floor(saved / 18), label: "good paperbacks" },
  { num: (saved) => Math.floor(saved / 55), label: "dinners out, with a friend" },
  { num: (saved) => Math.floor(saved / 350), label: "rounds of therapy" },
];

export default function Budget() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGoalDrawer, setShowGoalDrawer] = useState(false);

  useEffect(() => {
    base44.entities.UserProfile.list().then(p => {
      setProfile(p[0] || null);
      setLoading(false);
    });
  }, []);

  const handleSaveGoal = async (label, amount) => {
    if (!profile) return;
    const updated = { ...profile, budget_goal_label: label, budget_goal_amount: amount };
    setProfile(updated);
    await base44.entities.UserProfile.update(profile.id, { budget_goal_label: label, budget_goal_amount: amount });
    setShowGoalDrawer(false);
  };

  if (loading) return <div className="min-h-screen" style={{ backgroundColor: 'var(--t-bg)' }} />;

  const days = profile?.sobriety_date ? getDaysSince(profile.sobriety_date) : 0;
  const rate = profile?.daily_savings_rate || 15;
  const saved = days * rate;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-bg)', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>
      <div className="px-6 max-w-lg mx-auto">
        <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--t-muted)' }}>Quiet gains</p>
        <p className="text-sm mb-4" style={{ color: 'var(--t-muted)' }}>{days} days × ${rate}/day, give or take.</p>

        {/* Hero number */}
        <div className="text-center mb-8">
          <p className="font-display font-medium leading-none mb-1" style={{ color: 'var(--t-text)', fontSize: 60 }}>
            ${saved.toLocaleString()}
          </p>
          <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: 'var(--t-muted)' }}>
            Not spent · {days} days
          </p>
        </div>

        {/* Jar */}
        <div className="mb-6">
          <BudgetJar
            saved={saved}
            goal={profile?.budget_goal_amount}
            goalLabel={profile?.budget_goal_label}
            onTap={() => setShowGoalDrawer(true)}
          />
        </div>

        {/* What this could be */}
        <div className="rounded-xl overflow-hidden border mb-8" style={{ backgroundColor: 'var(--t-card-alt)', borderColor: 'var(--t-border)' }}>
          <p className="text-[10px] uppercase tracking-widest font-medium px-5 pt-4 pb-3" style={{ color: 'var(--t-muted)' }}>
            What this could be
          </p>
          {WHAT_ROWS.map((row, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-5 py-3"
              style={{ borderTop: i > 0 ? '1px solid var(--t-border)' : 'none' }}
            >
              <p className="font-display text-[20px] font-medium" style={{ color: 'var(--t-accent)' }}>
                {row.num(saved)}
              </p>
              <p className="text-[13px]" style={{ color: 'var(--t-text)' }}>{row.label}</p>
            </div>
          ))}
        </div>
      </div>

      {showGoalDrawer && (
        <BudgetGoalDrawer
          profile={profile}
          onClose={() => setShowGoalDrawer(false)}
          onSave={handleSaveGoal}
        />
      )}
    </div>
  );
}