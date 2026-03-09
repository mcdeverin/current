import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: '#0f1219' }}>
      <div className="px-6 pt-14 pb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} style={{ color: '#6a7280' }}>
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-medium" style={{ color: '#e8eaf0' }}>Terms of Service</h1>
      </div>

      <div className="px-6 max-w-lg mx-auto space-y-6 pb-8">
        <p className="text-xs" style={{ color: '#6a7280' }}>Last updated: March 2026</p>

        <p className="text-sm leading-relaxed" style={{ color: '#6a7280' }}>
          By using the Current mobile application, you agree to these Terms of Service.
        </p>

        <Section title="Use of the App">
          <p>Current provides a directory of alcohol-free venues, sober-friendly locations, and community suggestions.</p>
          <p className="mt-2">The information provided in the app is for informational purposes only.</p>
          <p className="mt-2">Venue details such as hours, offerings, and availability may change.</p>
          <p className="mt-2">Users should verify details directly with venues when needed.</p>
        </Section>

        <Section title="User Accounts">
          <p>Creating an account allows users to:</p>
          <BulletList items={["Track a sobriety streak", "Save personal preferences", "Personalize the app experience"]} />
          <p className="mt-2">Users are responsible for maintaining the accuracy of their information.</p>
        </Section>

        <Section title="Suggested Locations">
          <p>Users may submit venue suggestions.</p>
          <p className="mt-2">Current reserves the right to review, modify, or decline submissions.</p>
        </Section>

        <Section title="Appropriate Use">
          <p>Users agree not to:</p>
          <BulletList items={["Misuse the platform", "Submit false or harmful information", "Attempt to interfere with app functionality"]} />
        </Section>

        <Section title="Availability">
          <p>We may update or modify the app at any time.</p>
          <p className="mt-2">We do not guarantee uninterrupted availability.</p>
        </Section>

        <Section title="Limitation of Liability">
          <p>Current is provided "as is" without warranties of any kind.</p>
          <p className="mt-2">We are not responsible for venue experiences, availability, or third-party services.</p>
        </Section>

        <Section title="Termination">
          <p>We may suspend or terminate accounts that violate these terms.</p>
        </Section>

        <Section title="Changes to Terms">
          <p>These terms may be updated periodically.</p>
          <p className="mt-2">Continued use of the app after updates constitutes acceptance of the revised terms.</p>
        </Section>

        <Section title="Contact">
          <p>Questions about these terms may be sent to:</p>
          <a href="mailto:hello@currentapp.studio" className="text-sm mt-2 inline-block" style={{ color: '#6F8FA4' }}>
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