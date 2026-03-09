import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

const slideVariants = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState(null);
  const [sobrietyDate, setSobrietyDate] = useState("");
  const [firstName, setFirstName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkExisting();
    // Ensure dark theme for onboarding
    document.documentElement.classList.remove('theme-light');
    document.documentElement.classList.add('theme-dark');
  }, []);

  const checkExisting = async () => {
    const profiles = await base44.entities.UserProfile.list();
    if (profiles.length > 0 && profiles[0].onboarding_complete) {
      navigate(createPageUrl("Home"));
    }
  };

  const choosePath = (chosen) => {
    setMode(chosen);
    setStep(chosen === "streak" ? 2 : 3);
  };

  const handleComplete = async () => {
    setSaving(true);
    const data = {
      first_name: firstName,
      mode: mode || "exploring",
      onboarding_complete: true,
      daily_savings_rate: 15,
      notification_time: "08:00",
    };
    if (mode === "streak" && sobrietyDate) {
      data.sobriety_date = sobrietyDate;
    }
    const profiles = await base44.entities.UserProfile.list();
    if (profiles.length > 0) {
      await base44.entities.UserProfile.update(profiles[0].id, data);
    } else {
      await base44.entities.UserProfile.create(data);
    }
    navigate(createPageUrl("Home"));
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <AnimatePresence mode="wait">

        {/* Step 0: Splash */}
        {step === 0 && (
          <motion.div
            key="welcome"
            variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col items-center justify-center px-8"
          >
            <h1 className="font-display text-5xl md:text-6xl font-medium mb-4" style={{ color: 'var(--text)' }}>
              Current
            </h1>
            <p className="text-sm tracking-wide" style={{ color: 'var(--subtext)' }}>
              Present tense.
            </p>
            <button
              onClick={() => setStep(1)}
              className="mt-16 px-10 py-3.5 rounded-xl text-sm font-medium transition-all"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            >
              Begin
            </button>
          </motion.div>
        )}

        {/* Step 1: Path choice */}
        {step === 1 && (
          <motion.div
            key="path"
            variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col items-center justify-center px-6"
          >
            <h2 className="font-display text-3xl font-medium mb-2 text-center" style={{ color: 'var(--text)' }}>
              Where are you right now?
            </h2>
            <p className="text-sm mb-10 text-center" style={{ color: 'var(--subtext)' }}>
              No wrong answers. Just yours.
            </p>

            <div className="w-full max-w-xs space-y-3">
              <button
                onClick={() => choosePath("streak")}
                className="w-full rounded-2xl p-5 text-left border transition-all active:scale-[0.98]"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative flex-shrink-0" style={{ width: 32, height: 32 }}>
                    <svg width={32} height={32} className="transform -rotate-90">
                      <circle cx={16} cy={16} r={12} stroke="var(--card-border)" strokeWidth={2.5} fill="none" />
                      <circle cx={16} cy={16} r={12} stroke="var(--accent)" strokeWidth={2.5} fill="none"
                        strokeLinecap="round" strokeDasharray={75.4} strokeDashoffset={18} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
                    </div>
                  </div>
                  <p className="text-base font-medium" style={{ color: 'var(--text)' }}>I have a date.</p>
                </div>
                <p className="text-xs leading-relaxed pl-11" style={{ color: 'var(--subtext)' }}>
                  I know when I started. I want to track it.
                </p>
              </button>

              <button
                onClick={() => choosePath("exploring")}
                className="w-full rounded-2xl p-5 text-left border transition-all active:scale-[0.98]"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <svg width={28} height={28} viewBox="0 0 28 28">
                      <circle cx={14} cy={14} r={11} stroke="var(--subtext)" strokeWidth={1.5} fill="none" strokeDasharray="4 3" />
                      <circle cx={14} cy={14} r={2.5} fill="var(--subtext)" />
                    </svg>
                  </div>
                  <p className="text-base font-medium" style={{ color: 'var(--text)' }}>I'm exploring.</p>
                </div>
                <p className="text-xs leading-relaxed pl-11" style={{ color: 'var(--subtext)' }}>
                  I'm curious about sobriety. No pressure.
                </p>
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Date picker */}
        {step === 2 && (
          <motion.div
            key="date"
            variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col items-center justify-center px-8"
          >
            <h2 className="font-display text-3xl font-medium mb-3 text-center" style={{ color: 'var(--text)' }}>
              When did you start?
            </h2>
            <p className="text-sm mb-10 text-center" style={{ color: 'var(--subtext)' }}>
              This is your day one. We'll remember it.
            </p>

            <input
              type="date"
              value={sobrietyDate}
              onChange={e => setSobrietyDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full max-w-xs text-center text-lg font-display bg-transparent border-b-2 pb-3 focus:outline-none appearance-none"
              style={{ borderColor: 'var(--card-border)', color: 'var(--text)', colorScheme: 'inherit' }}
            />

            <button
              onClick={() => sobrietyDate && setStep(3)}
              disabled={!sobrietyDate}
              className="mt-12 px-10 py-3.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            >
              Continue
            </button>

            <button onClick={() => setStep(1)} className="mt-4 text-xs" style={{ color: 'var(--subtext)' }}>
              ← Back
            </button>
          </motion.div>
        )}

        {/* Step 3: Name */}
        {step === 3 && (
          <motion.div
            key="name"
            variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col items-center justify-center px-8"
          >
            <h2 className="font-display text-3xl font-medium mb-3 text-center" style={{ color: 'var(--text)' }}>
              What's your name?
            </h2>
            <p className="text-sm mb-10 text-center" style={{ color: 'var(--subtext)' }}>
              Not for anyone else. Just so we know what to call you.
            </p>

            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="First name"
              maxLength={20}
              className="w-full max-w-xs text-center text-2xl font-display bg-transparent border-b-2 pb-3 focus:outline-none"
              style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
            />

            <button
              onClick={handleComplete}
              disabled={!firstName.trim() || saving}
              className="mt-12 px-10 py-3.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            >
              {saving ? "..." : "Let's go"}
            </button>

            <button onClick={() => setStep(mode === "streak" ? 2 : 1)} className="mt-4 text-xs" style={{ color: 'var(--subtext)' }}>
              ← Back
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pb-12">
        {Array.from({ length: mode === "streak" ? 4 : 3 }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= step ? 'var(--accent)' : 'var(--card-border)' }}
          />
        ))}
      </div>
    </div>
  );
}