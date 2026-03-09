import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: '#0f1219' }}>
      {/* Header */}
      <div className="px-6 pt-14 pb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} style={{ color: '#6a7280' }}>
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-medium" style={{ color: '#e8eaf0' }}>Terms of Service</h1>
      </div>

      <div className="px-6 max-w-lg mx-auto space-y-8">
        <p className="text-xs" style={{ color: '#6a7280' }}>Last updated: March 2026</p>

        <Section title="Acceptance">
          By using Current, you agree to these Terms of Service. If you do not agree, please do not use the app.
        </Section>

        <Section title="What Current Is">
          Current is a personal wellness and lifestyle app designed to support people exploring or maintaining sobriety. It is not a medical service, addiction treatment program, or substitute for professional help.
        </Section>

        <Section title="Eligibility">
          You must be at least 17 years old to use Current. By creating an account, you confirm you meet this requirement.
        </Section>

        <Section title="Your Account">
          You are responsible for maintaining the confidentiality of your account. You agree to provide accurate information during onboarding and to keep it up to date.
        </Section>

        <Section title="Guest Access">
          Certain features — including browsing NYC Spots — are available without creating an account. Account-specific features such as streak tracking require sign-in.
        </Section>

        <Section title="Your Content">
          Any content you submit (such as your "why I started" note or place suggestions) remains yours. You grant us a limited license to store and display it within the app for the purpose of providing the service.
        </Section>

        <Section title="Place Suggestions">
          When you suggest a place, you confirm that the information is accurate to the best of your knowledge. We review all suggestions before publishing. We reserve the right to decline any submission.
        </Section>

        <Section title="Acceptable Use">
          You agree not to misuse the app, submit false information, attempt to access other users' data, or use the service for any unlawful purpose.
        </Section>

        <Section title="Disclaimers">
          Current is provided "as is." We make no guarantees about uptime, accuracy of place data, or fitness for any particular purpose. Use of the app is at your own risk.
        </Section>

        <Section title="Changes">
          We may update these terms from time to time. Continued use of the app after changes constitutes acceptance of the updated terms.
        </Section>

        <Section title="Termination">
          We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from the Profile page.
        </Section>

        <Section title="Contact">
          Questions? Reach us at hello@current.app
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-sm font-medium mb-2" style={{ color: '#e8eaf0' }}>{title}</h2>
      <p className="text-sm leading-relaxed" style={{ color: '#6a7280' }}>{children}</p>
    </div>
  );
}