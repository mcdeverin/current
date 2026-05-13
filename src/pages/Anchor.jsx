import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { hapticMedium, hapticHeavy } from "@/lib/haptics";
import BreathRing from "../components/current/BreathRing";

export default function Anchor() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    hapticMedium();
    base44.entities.UserProfile.list().then(p => { if (p[0]) setProfile(p[0]); });
  }, []);

  const textContact = () => {
    if (!profile?.anchor_contact_phone) return;
    hapticHeavy();
    window.location.href = `sms:${profile.anchor_contact_phone}`;
  };

  const hasContact = profile?.anchor_contact_name && profile?.anchor_contact_phone;
  const whyText = profile?.why_i_started || "";

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--t-bg)', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {/* Close */}
      <div className="flex justify-end px-6 pt-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          style={{ color: 'var(--t-muted)', fontSize: 13 }}
        >
          Close
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-6 pt-4">
        <p className="text-[10px] uppercase tracking-widest font-medium mb-3" style={{ color: 'var(--t-accent)' }}>
          Right now
        </p>
        <p className="font-display text-[26px] italic mb-8 text-center" style={{ color: 'var(--t-text)' }}>
          Just breathe.
        </p>

        {/* Breath ring */}
        <div className="mb-8">
          <BreathRing size={230} />
        </div>

        {/* Why you're here card */}
        <div className="w-full max-w-sm rounded-xl p-4 mb-6 border"
          style={{ backgroundColor: 'var(--t-card)', borderColor: 'var(--t-border)' }}>
          <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--t-accent)' }}>
            Why you're here
          </p>
          {whyText ? (
            <p className="font-display text-[15px] italic leading-relaxed" style={{ color: 'var(--t-text-warm)' }}>
              {whyText}
            </p>
          ) : (
            <p className="font-display text-[15px] italic leading-relaxed" style={{ color: 'var(--t-muted)' }}>
              You'll be able to anchor to your own words when you add them in Profile.
            </p>
          )}
        </div>
      </div>

      {/* Bottom CTAs */}
      <div className="px-6 pb-10" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)' }}>
        {hasContact ? (
          <button
            onClick={textContact}
            className="w-full py-3.5 rounded-xl text-sm font-medium mb-3"
            style={{ backgroundColor: 'var(--t-accent)', color: 'var(--t-bg)', borderRadius: 12 }}
          >
            Text {profile.anchor_contact_name}
          </button>
        ) : (
          <button
            onClick={() => navigate('/Profile')}
            className="w-full text-center text-sm mb-3"
            style={{ color: 'var(--t-muted)' }}
          >
            Set someone to text →
          </button>
        )}
        <button
          className="w-full py-3 rounded-xl text-xs font-medium border"
          style={{ borderColor: 'var(--t-border)', color: 'var(--t-muted)' }}
          onClick={() => navigate(-1)}
        >
          Move — go outside for 5
        </button>
      </div>
    </div>
  );
}