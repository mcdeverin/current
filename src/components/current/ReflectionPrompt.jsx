import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { hapticMedium, hapticLight } from "@/lib/haptics";

const CHOICES = [
  { key: "small_win", label: "A small win" },
  { key: "person", label: "A person" },
  { key: "made_it_through", label: "Just made it through" },
];

function getLocalDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getTimeLabel() {
  const now = new Date();
  const h = now.getHours() % 12 || 12;
  const m = String(now.getMinutes()).padStart(2, '0');
  const ampm = now.getHours() >= 12 ? 'pm' : 'am';
  return `Tonight · ${h}:${m} ${ampm}`;
}

export default function ReflectionPrompt({ onSaved }) {
  const [choice, setChoice] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existingId, setExistingId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    (async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) return;
      const user = await base44.auth.me();
      if (!user) return;
      setUserEmail(user.email);
      const today = getLocalDateStr();
      const existing = await base44.entities.Reflection.filter({ user_email: user.email, date: today });
      if (existing.length > 0) {
        const r = existing[0];
        setExistingId(r.id);
        setChoice(r.choice);
        setNote(r.note || "");
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!choice) return;
    setSaving(true);
    hapticMedium();
    const today = getLocalDateStr();
    const data = {
      user_email: userEmail,
      date: today,
      choice,
      note: note.slice(0, 240),
      created_at: new Date().toISOString(),
    };
    if (existingId) {
      await base44.entities.Reflection.update(existingId, data);
    } else {
      const r = await base44.entities.Reflection.create(data);
      setExistingId(r.id);
    }
    setSaving(false);
    setSaved(true);
    if (onSaved) onSaved();
  };

  if (saved) {
    return (
      <div className="py-8 text-center">
        <p className="font-display text-xl mb-2" style={{ color: 'var(--t-text)' }}>Saved.</p>
        <p className="text-sm" style={{ color: 'var(--t-muted)' }}>Saved to your thread. Only you ever see it.</p>
      </div>
    );
  }

  return (
    <div className="px-6 pb-10">
      <p className="text-[10px] uppercase tracking-widest font-medium mb-4" style={{ color: 'var(--t-muted)' }}>
        {getTimeLabel()}
      </p>
      <p className="font-display text-[28px] leading-snug mb-2 text-center" style={{ color: 'var(--t-text)' }}>
        What kept you here today?
      </p>
      <p className="text-[13px] text-center mb-8" style={{ color: 'var(--t-muted)' }}>
        One word, one breath, one tap. That's it.
      </p>

      <div className="space-y-2 mb-6">
        {CHOICES.map(c => (
          <button
            key={c.key}
            onClick={() => { hapticLight(); setChoice(c.key); }}
            className="w-full flex items-center justify-between px-4 py-4 rounded-xl border"
            style={{
              borderColor: choice === c.key ? 'var(--t-accent)' : 'var(--t-border)',
              backgroundColor: choice === c.key ? 'var(--t-accent-bg)' : 'var(--t-card)',
            }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--t-text)' }}>{c.label}</span>
            {choice === c.key && (
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--t-accent)', display: 'inline-block' }} />
            )}
          </button>
        ))}
      </div>

      {/* Optional note */}
      <div className="rounded-xl p-4 border mb-6" style={{ backgroundColor: 'var(--t-card)', borderColor: 'var(--t-border)' }}>
        <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--t-muted)' }}>
          What was it (optional)
        </p>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value.slice(0, 240))}
          placeholder=""
          rows={2}
          className="w-full text-sm bg-transparent focus:outline-none resize-none font-display italic"
          style={{ color: 'var(--t-text-warm)', caretColor: 'var(--t-accent)' }}
        />
        <p className="text-[10px] text-right mt-1" style={{ color: 'var(--t-muted)' }}>{note.length}/240</p>
      </div>

      <button
        onClick={handleSave}
        disabled={!choice || saving}
        className="w-full py-3.5 rounded-xl text-sm font-medium mb-4 disabled:opacity-30"
        style={{ backgroundColor: 'var(--t-accent)', color: 'var(--t-bg)' }}
      >
        {saving ? "Saving…" : "Save"}
      </button>
      <p className="text-[11px] text-center" style={{ color: 'var(--t-muted)' }}>
        Saved to your thread. Only you ever see it.
      </p>
    </div>
  );
}