import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { hapticMedium } from "@/lib/haptics";

const OPTIONS = [
  { label: "One day", sub: "Travel, an off day", days: 1 },
  { label: "Three days", sub: "Sick, or moving", days: 3 },
  { label: "A week", sub: "Holiday, big trip", days: 7 },
  { label: "Until I come back", sub: "No countdown", days: null },
];

function getLocalDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function PauseDrawer({ profile, onClose, onUpdate }) {
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleBeginPause = async () => {
    if (selected === null) return;
    setSaving(true);
    hapticMedium();
    const opt = OPTIONS[selected];
    const pause_start = getLocalDateStr(0);
    const pause_end = opt.days != null ? getLocalDateStr(opt.days) : null;
    const pause_reason = opt.label;
    await base44.entities.UserProfile.update(profile.id, { pause_start, pause_end, pause_reason });
    onUpdate({ pause_start, pause_end, pause_reason });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }} onClick={onClose}>
      <div
        className="w-full rounded-t-2xl px-6 pt-4 pb-10"
        style={{ backgroundColor: 'var(--t-card)', borderTop: '1px solid var(--t-border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-10 h-1.5 rounded-full mx-auto mb-5" style={{ backgroundColor: 'var(--t-border)' }} />

        <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--t-accent)' }}>
          Quiet pause
        </p>
        <p className="font-display text-[26px] leading-snug mb-3" style={{ color: 'var(--t-text)' }}>
          Take a breath.<br />Your days stay yours.
        </p>
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--t-muted)' }}>
          Pause the tracker for as long as you need. Pausing isn't restarting. Your number is waiting where you left it.
        </p>

        <div className="space-y-2 mb-6">
          {OPTIONS.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-left"
              style={{
                borderColor: selected === i ? 'var(--t-accent)' : 'var(--t-border)',
                backgroundColor: selected === i ? 'var(--t-accent-bg)' : 'var(--t-card-alt)',
              }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--t-text)' }}>{opt.label}</p>
                <p className="text-xs" style={{ color: 'var(--t-muted)' }}>{opt.sub}</p>
              </div>
              {selected === i && (
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--t-accent)' }} />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleBeginPause}
          disabled={selected === null || saving}
          className="w-full py-3.5 rounded-xl text-sm font-medium mb-4 disabled:opacity-30"
          style={{ backgroundColor: 'var(--t-accent)', color: 'var(--t-bg)' }}
        >
          {saving ? "Pausing…" : "Begin pause"}
        </button>
        <p className="font-display text-[13px] italic text-center" style={{ color: 'var(--t-muted)' }}>
          You can come back whenever.
        </p>
      </div>
    </div>
  );
}