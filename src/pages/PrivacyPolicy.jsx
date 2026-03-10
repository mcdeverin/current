import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: '#0f1219' }}>
      <div className="px-6 pt-14 pb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} style={{ color: '#6a7280' }}>
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-medium" style={{ color: '#e8eaf0' }}>Privacy Policy</h1>
      </div>

      <div className="px-6 max-w-lg mx-auto space-y-6 pb-8">
        <p className="text-xs" style={{ color: '#6a7280' }}>Last updated: March 2026</p>

        <p className="text-sm leading-relaxed" style={{ color: '#6a7280' }}>
          Current ("we", "our", or "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use the Current mobile application.
        </p>
        <p className="text-sm leading-relaxed" style={{ color: '#6a7280' }}>
          Current is designed to help people discover alcohol-free places and explore sober or sober-curious living.
        </p>

        <Section title="Information We Collect">
          <SubSection title="Account Information">
            <p>If you create an account, we may collect:</p>
            <BulletList items={["First name", "Sobriety start date (optional)", `Personal notes such as "why I started" (optional)`]} />
            <p className="mt-2">This information is used only to personalize your experience within the app.</p>
          </SubSection>

          <SubSection title="Location Information">
            <p>If you enable location services, Current may access your device location in order to:</p>
            <BulletList items={["Show nearby alcohol-free venues", "Sort places by distance from you"]} />
            <p className="mt-2">Location access is optional. If you do not allow location access, the app will show locations based on city or neighborhood instead.</p>
            <p className="mt-2">Current does not store precise location history.</p>
          </SubSection>

          <SubSection title="Suggested Places">
            <p>Users may suggest venues to be added to the app. Suggested entries may include:</p>
            <BulletList items={["Venue name", "Neighborhood", "Category (bar, café, event, etc.)"]} />
            <p className="mt-2">These suggestions are reviewed before being added.</p>
          </SubSection>

          <SubSection title="Usage Data">
            <p>We may collect basic analytics information such as:</p>
            <BulletList items={["App performance data", "Feature usage", "Error logs"]} />
            <p className="mt-2">This helps improve the app experience.</p>
            <p className="mt-2">We do not sell personal data.</p>
          </SubSection>
        </Section>

        <Section title="How We Use Information">
          <p>Information collected is used to:</p>
          <BulletList items={["Provide and improve the app", "Personalize user experience", "Display nearby venues", "Maintain account functionality"]} />
        </Section>

        <Section title="Data Storage">
          <p>User data is stored securely through our service providers and app infrastructure.</p>
          <p className="mt-2">We take reasonable steps to protect personal information.</p>
        </Section>

        <Section title="Account Deletion">
          <p>Users may delete their account at any time from the app's settings page.</p>
          <p className="mt-2">When an account is deleted:</p>
          <BulletList items={["Profile information is removed", "Streak and saved information are deleted"]} />
        </Section>

        <Section title="Children">
          <p>Current is not directed toward children under 13.</p>
        </Section>

        <Section title="Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. Updates will be reflected on this page.</p>
        </Section>

        <Section title="Contact">
          <p>For questions about this policy you can contact:</p>
          <a
            href="mailto:hello@currentapp.studio"
            className="text-sm mt-2 inline-block"
            style={{ color: '#6F8FA4' }}
          >
            hello@currentapp.studio
          </a>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-sm font-semibold mb-3" style={{ color: '#e8eaf0' }}>{title}</h2>
      <div className="text-sm leading-relaxed space-y-2" style={{ color: '#6a7280' }}>{children}</div>
    </div>
  );
}

function SubSection({ title, children }) {
  return (
    <div className="mt-4">
      <h3 className="text-xs font-medium mb-2" style={{ color: '#a0b8c8' }}>{title}</h3>
      <div className="text-sm leading-relaxed space-y-1" style={{ color: '#6a7280' }}>{children}</div>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="mt-1 space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#6a7280' }}>
          <span style={{ color: '#6F8FA4' }}>•</span>
          {item}
        </li>
      ))}
    </ul>
  );
}