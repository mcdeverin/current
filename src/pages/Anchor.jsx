import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Phone } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { hapticLight, hapticMedium } from "@/lib/haptics";
import { logPresence } from "@/lib/presence";
import BreathBlob from "@/components/current/BreathBlob";

export default function Anchor() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [logged, setLogged] = useState(null); // 'almost' | 'drank' | null

  useEffect(() => {
    hapticMedium();
    logPresence("anchor");
    (async () => {
      try {
        const profiles = await base44.entities.UserProfile.list();
        if (profiles.length > 0) setProfile(profiles[0]);
      } catch {}
    })();
  }, []);

  const reason = profile?.why_i_started?.trim();
  const contactName = profile?.emergency_contact_name?.trim();
  const contactPhone = profile?.emergency_contact_phone?.trim();
  const thirdActivity = profile?.anchor_activity?.trim();

  const handleText = () => {
    if (!contactPhone) return;
    hapticMedium();
    window.location.href = `sms:${contactPhone}`;
  };

  const handleLog = async (kind) => {
    hapticLight();
    setLogged(kind);
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) return;
      const user = await base44.auth.me();
      // DrinkLogs schema: count (0..3) + was_almost.
      // 'almost' → count 0 + was_almost true; 'drank' → count 1 + was_almost false.
      // Neither resets clear_days.
      await base44.entities.DrinkLogs.create({
        user_id: user.id,
        logged_at: new Date().toISOString(),
        count: kind === "almost" ? 0 : 1,
        was_almost: kind === "almost",
      });
    } catch (err) {
      console.error("DrinkLogs.create failed:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{
        backgroundColor: "#0b0e14",
        backgroundImage: "radial-gradient(circle at 50% 38%, rgba(110,143,163,0.22), transparent 60%)",
      }}
    >
      {/* Close */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-0 right-0 p-5"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)", color: "var(--t-muted)" }}
        aria-label="Close"
      >
        <X size={22} />
      </button>

      {/* Title */}
      <div className="text-center px-6" style={{ marginTop: "calc(env(safe-area-inset-top, 0px) + 72px)" }}>
        <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: "var(--t-accent)" }}>
          Right now
        </p>
        <p
          className="font-display italic"
          style={{ fontSize: 26, color: "var(--t-text)", letterSpacing: "-0.01em" }}
        >
          Just breathe.
        </p>
      </div>

      {/* Breath */}
      <div className="flex-1 flex items-center justify-center px-6">
        <BreathBlob />
      </div>

      {/* Why you're here */}
      {reason && (
        <div className="mx-6 mb-4">
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid var(--t-border)",
            }}
          >
            <p
              className="text-[10px] uppercase tracking-widest font-medium mb-1.5"
              style={{ color: "var(--t-accent)" }}
            >
              Why you're here
            </p>
            <p
              className="font-display italic"
              style={{ fontSize: 15, color: "var(--t-text-warm)", lineHeight: 1.45 }}
            >
              “{reason}”
            </p>
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="px-6 pb-6" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}>
        {/* Text contact */}
        {contactPhone ? (
          <button
            onClick={handleText}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium mb-2"
            style={{ backgroundColor: "var(--t-accent)", color: "var(--t-bg)" }}
          >
            <Phone size={15} strokeWidth={2} />
            Text {contactName || "your person"}
          </button>
        ) : (
          <button
            onClick={() => navigate("/Settings")}
            className="w-full py-3.5 rounded-xl text-sm font-medium mb-2"
            style={{ border: "1px solid var(--t-border)", color: "var(--t-muted)", backgroundColor: "transparent" }}
          >
            Add someone to text →
          </button>
        )}

        {/* Move */}
        <button
          className="w-full py-3 rounded-xl text-xs font-medium mb-2"
          style={{ border: "1px solid var(--t-border)", color: "var(--t-muted)", backgroundColor: "transparent" }}
          onClick={hapticLight}
        >
          Move — go outside for 5
        </button>

        {/* Optional third — user-defined */}
        {thirdActivity && (
          <button
            className="w-full py-3 rounded-xl text-xs font-medium mb-2"
            style={{ border: "1px solid var(--t-border)", color: "var(--t-muted)", backgroundColor: "transparent" }}
            onClick={hapticLight}
          >
            {thirdActivity}
          </button>
        )}

        {/* Log row — neither resets clear_days */}
        {logged ? (
          <p
            className="font-display italic text-center mt-3"
            style={{ fontSize: 13, color: "var(--t-text)" }}
          >
            {logged === "almost" ? "Noted. You held it." : "Noted. Still here."}
          </p>
        ) : (
          <>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleLog("almost")}
                className="flex-1 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-medium"
                style={{ border: "1px solid var(--t-border)", color: "var(--t-text)", backgroundColor: "transparent" }}
              >
                Almost · log it
              </button>
              <button
                onClick={() => handleLog("drank")}
                className="flex-1 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-medium"
                style={{ border: "1px solid var(--t-border)", color: "var(--t-text)", backgroundColor: "transparent" }}
              >
                I drank · log it
              </button>
            </div>
            <p
              className="text-[11px] text-center mt-3"
              style={{ color: "var(--t-muted)" }}
            >
              Both are just information. We don't punish either.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
