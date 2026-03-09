import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: '#0f1219' }}>
      {/* Header */}
      <div className="px-6 pt-14 pb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} style={{ color: '#6a7280' }}>
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-medium" style={{ color: '#e8eaf0' }}>Privacy Policy</h1>
      </div>

      <div className="px-6 max-w-lg mx-auto space-y-8" style={{ color: '#6a7280' }}>
        <p className="text-xs" style={{ color: '#6a7280' }}>Last updated: March 2026</p>

        <Section title="Overview">
          Current is a sober-friendly lifestyle app. We take your privacy seriously. This policy explains what data we collect, how we use it, and your rights.
        </Section>

        <Section title="Data We Collect">
          When you create an account, we collect your email address and the information you provide during onboarding — including your first name, sobriety date (if you choose to share it), daily savings rate, and your private "why I started" note.
          {"\n\n"}
          If you use location-based features, your device's location is used only in-session to sort nearby places. We do not store your location.
        </Section>

        <Section title="How We Use Your Data">
          Your data is used solely to power your personal experience in the app — your streak, stats, and settings. We do not sell your data, share it with advertisers, or use it for marketing.
        </Section>

        <Section title="Your Why I Started">
          The note you write under "Why I started" is private and stored securely. It is never shared, never displayed publicly, and never used for any purpose other than being available to you inside the app.
        </Section>

        <Section title="Data Storage">
          Your data is stored securely using Base44's platform infrastructure. We use industry-standard encryption in transit and at rest.
        </Section>

        <Section title="Account Deletion">
          You can delete your account at any time from your Profile page. Deleting your account permanently removes your profile data from our systems.
        </Section>

        <Section title="Third Parties">
          We do not share personal data with third parties except as required to operate the app (e.g. authentication infrastructure). We do not use third-party advertising networks.
        </Section>

        <Section title="Children">
          Current is not intended for users under the age of 17. We do not knowingly collect data from children.
        </Section>

        <Section title="Contact">
          Questions about this policy? Reach us at privacy@current.app
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-sm font-medium mb-2" style={{ color: '#e8eaf0' }}>{title}</h2>
      <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#6a7280' }}>{children}</p>
    </div>
  );
}