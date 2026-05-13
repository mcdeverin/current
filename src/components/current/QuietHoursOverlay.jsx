import React from "react";
import { Moon } from "lucide-react";

function getTimeLabel() {
  const now = new Date();
  const h = now.getHours() % 12 || 12;
  const m = String(now.getMinutes()).padStart(2, '0');
  const ampm = now.getHours() >= 12 ? 'pm' : 'am';
  return `${h}:${m} ${ampm}`;
}

export default function QuietHoursOverlay() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 pb-24 text-center"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>

      <div className="flex items-center gap-2 mb-8">
        <Moon size={14} style={{ color: 'var(--t-muted)' }} />
        <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: 'var(--t-muted)' }}>
          Quiet hours · {getTimeLabel()}
        </p>
      </div>

      <p className="font-display text-[36px] italic leading-tight mb-10" style={{ color: 'var(--t-text)' }}>
        It's late.<br />Just rest.
      </p>

      {/* One breath card */}
      <div className="w-full max-w-xs rounded-xl p-5 mb-8 border" style={{ backgroundColor: 'var(--t-card)', borderColor: 'var(--t-border)' }}>
        <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--t-accent)' }}>
          One breath
        </p>
        <p className="font-display text-[15px] italic" style={{ color: 'var(--t-text-warm)' }}>
          In for 4, hold for 7, out for 8.
        </p>
      </div>

      {/* Tucked away plate */}
      <div className="w-full max-w-xs rounded-xl p-4 border-2 border-dashed" style={{ borderColor: 'var(--t-border)' }}>
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--t-muted)' }}>
          Discover, Spots, and Today's Move are tucked away. Back at sunrise.
        </p>
      </div>
    </div>
  );
}