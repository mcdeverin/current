import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [sobrietyDate, setSobrietyDate] = useState("");
  const [firstName, setFirstName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkExisting();
  }, []);

  const checkExisting = async () => {
    const profiles = await base44.entities.UserProfile.list();
    if (profiles.length > 0 && profiles[0].onboarding_complete) {
      navigate(createPageUrl("Home"));
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    const profiles = await base44.entities.UserProfile.list();
    if (profiles.length > 0) {
      await base44.entities.UserProfile.update(profiles[0].id, {
        first_name: firstName,
        sobriety_date: sobrietyDate,
        onboarding_complete: true,
      });
    } else {
      await base44.entities.UserProfile.create({
        first_name: firstName,
        sobriety_date: sobrietyDate,
        onboarding_complete: true,
        daily_savings_rate: 15,
        notification_time: "08:00",
      });
    }
    navigate(createPageUrl("Home"));
  };

  const slideVariants = {
    enter: { opacity: 0, x: 60 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -60 },
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0e0e0f' }}>
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="welcome"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col items-center justify-center px-8"
          >
            <h1 className="font-display text-5xl md:text-6xl font-medium text-white mb-4">
              Current
            </h1>
            <p className="text-sm tracking-wide" style={{ color: '#8a8478' }}>
              Present tense.
            </p>
            <button
              onClick={() => setStep(1)}
              className="mt-16 px-10 py-3.5 rounded-xl text-sm font-medium transition-all"
              style={{ backgroundColor: '#c8a97e', color: '#0e0e0f' }}
            >
              Begin
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="date"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col items-center justify-center px-8"
          >
            <h2 className="font-display text-3xl font-medium text-white mb-3 text-center">
              When did you start?
            </h2>
            <p className="text-sm mb-10 text-center" style={{ color: '#8a8478' }}>
              This is your day one. We'll remember it.
            </p>

            <input
              type="date"
              value={sobrietyDate}
              onChange={e => setSobrietyDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full max-w-xs text-center text-lg font-display bg-transparent text-white border-b-2 pb-3 focus:outline-none appearance-none"
              style={{ borderColor: '#2a2826' }}
            />

            <button
              onClick={() => sobrietyDate && setStep(2)}
              disabled={!sobrietyDate}
              className="mt-12 px-10 py-3.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
              style={{ backgroundColor: '#c8a97e', color: '#0e0e0f' }}
            >
              Continue
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="name"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col items-center justify-center px-8"
          >
            <h2 className="font-display text-3xl font-medium text-white mb-3 text-center">
              What's your name?
            </h2>
            <p className="text-sm mb-10 text-center" style={{ color: '#8a8478' }}>
              Not for anyone else. Just so we know what to call you.
            </p>

            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="First name"
              maxLength={20}
              className="w-full max-w-xs text-center text-2xl font-display bg-transparent text-white border-b-2 pb-3 focus:outline-none placeholder-gray-700"
              style={{ borderColor: '#2a2826' }}
            />

            <button
              onClick={handleComplete}
              disabled={!firstName.trim() || saving}
              className="mt-12 px-10 py-3.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
              style={{ backgroundColor: '#c8a97e', color: '#0e0e0f' }}
            >
              {saving ? "..." : "Let's go"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pb-12">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= step ? '#c8a97e' : '#2a2826' }}
          />
        ))}
      </div>
    </div>
  );
}