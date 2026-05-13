import React, { useState } from "react";

export default function BudgetGoalDrawer({ profile, onClose, onSave }) {
  const [label, setLabel] = useState(profile.budget_goal_label || "");
  const [amount, setAmount] = useState(profile.budget_goal_amount ? String(profile.budget_goal_amount) : "");

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }} onClick={onClose}>
      <div
        className="w-full rounded-t-2xl px-6 pt-4 pb-10"
        style={{ backgroundColor: 'var(--t-card)', borderTop: '1px solid var(--t-border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 rounded-full mx-auto mb-5" style={{ backgroundColor: 'var(--t-border)' }} />
        <p className="text-[10px] uppercase tracking-widest font-medium mb-4" style={{ color: 'var(--t-accent)' }}>Your goal</p>

        <input
          type="text"
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="A week in Lisbon"
          className="w-full text-sm bg-transparent border-b pb-2 mb-4 focus:outline-none"
          style={{ borderColor: 'var(--t-border)', color: 'var(--t-text)' }}
        />
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Amount ($)"
          className="w-full text-sm bg-transparent border-b pb-2 mb-6 focus:outline-none"
          style={{ borderColor: 'var(--t-border)', color: 'var(--t-text)' }}
        />

        <button
          onClick={() => onSave(label, parseFloat(amount) || 0)}
          className="w-full py-3.5 rounded-xl text-sm font-medium"
          style={{ backgroundColor: 'var(--t-accent)', color: 'var(--t-bg)' }}
        >
          Save goal
        </button>
      </div>
    </div>
  );
}