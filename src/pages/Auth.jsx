import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Mail, Lock, Loader } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import { useTheme } from "@/components/current/ThemeContext";

const inputClass = (hasError) =>
  `w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none transition placeholder-[#6a7280]` +
  (hasError
    ? " border-red-500 bg-transparent"
    : " border-[var(--t-border)] bg-transparent focus:border-[var(--t-accent)]");

export default function Auth() {
  const { isDark } = useTheme();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleGoogleAuth = () => {
    if (window.self !== window.top) { toast.error("Auth only works from the published app"); return; }
    base44.auth.redirectToLogin({ provider: "google" });
  };

  const handleAppleAuth = () => {
    if (window.self !== window.top) { toast.error("Auth only works from the published app"); return; }
    base44.auth.redirectToLogin({ provider: "apple" });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validateEmail(email)) { setErrors({ email: "Invalid email" }); return; }
    if (!password) { setErrors({ password: "Password required" }); return; }
    setLoading(true);
    try {
      const res = await base44.functions.invoke("customAuthLogin", { email, password });
      if (res.data?.success) { toast.success("Logged in!"); window.location.href = createPageUrl("Home"); }
      else setErrors({ general: res.data?.error || "Login failed" });
    } catch (err) { setErrors({ general: err.message }); }
    finally { setLoading(false); }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validateEmail(email)) { setErrors({ email: "Invalid email" }); return; }
    if (password.length < 8) { setErrors({ password: "Min. 8 characters" }); return; }
    if (password !== confirmPassword) { setErrors({ confirmPassword: "Passwords don't match" }); return; }
    setLoading(true);
    try {
      const res = await base44.functions.invoke("customAuthSignup", { email, password });
      if (res.data?.success) { toast.success("Account created!"); window.location.href = createPageUrl("Home"); }
      else setErrors({ general: res.data?.error || "Signup failed" });
    } catch (err) { setErrors({ general: err.message }); }
    finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validateEmail(email)) { setErrors({ email: "Invalid email" }); return; }
    setLoading(true);
    try {
      const res = await base44.functions.invoke("customAuthReset", { email });
      if (res.data?.success) { toast.success("Reset link sent to your email"); setMode("login"); setEmail(""); }
      else setErrors({ general: res.data?.error || "Failed to send reset link" });
    } catch (err) { setErrors({ general: err.message }); }
    finally { setLoading(false); }
  };

  const resetBack = (toMode = "login") => {
    setMode(toMode);
    setEmail(""); setPassword(""); setConfirmPassword(""); setErrors({});
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start p-4 overflow-y-auto pt-8"
      style={{ backgroundColor: "var(--t-bg)", color: "var(--t-text)" }}
    >
      <AnimatePresence mode="wait">

        {/* ── LOGIN ── */}
        {mode === "login" && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full max-w-md py-12 pb-24">

            {/* Logo */}
            <div className="text-center mb-12 -mt-8">
              <img
                src="https://media.base44.com/images/public/69a74d93ee777abd7bf98d48/9284328ab_Untitleddesign3.png"
                alt="current"
                className="w-32 h-32 mx-auto object-contain mb-4"
              />
              <h1 className="font-display text-5xl font-light tracking-wide mb-2" style={{ color: isDark ? "var(--t-text)" : "var(--t-accent)" }}>
                current
              </h1>
              <p className="text-sm mb-1" style={{ color: isDark ? "var(--t-muted)" : "var(--t-accent)" }}>
                present tense.
              </p>
              <p className="text-xs" style={{ color: "var(--t-muted)" }}>
                A space to explore alcohol free living.
              </p>
            </div>

            {errors.general && <ErrorBox msg={errors.general} />}

            {/* Social */}
            <SocialButton onClick={handleGoogleAuth} icon="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69921fc2c9c3fbbd85313910/27f0b4e4e_icons8-google-30.png" label="Continue with Google" />
            <SocialButton onClick={handleAppleAuth} icon="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69921fc2c9c3fbbd85313910/59db42961_icons8-apple-inc-30.png" label="Continue with Apple" />

            <Divider />

            <form onSubmit={handleLogin} className="space-y-4">
              <Field label="Email" icon={<Mail className="absolute left-3 top-3.5 w-5 h-5" style={{ color: "var(--t-muted)" }} />} error={errors.email}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className={inputClass(errors.email)}
                  style={{ color: "var(--t-text)", fontSize: "16px" }} />
              </Field>
              <Field label="Password" icon={<Lock className="absolute left-3 top-3.5 w-5 h-5" style={{ color: "var(--t-muted)" }} />} error={errors.password}>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" className={inputClass(errors.password)}
                  style={{ color: "var(--t-text)", fontSize: "16px" }} />
              </Field>
              <SubmitButton loading={loading} label="Sign in" />
            </form>

            <div className="mt-6 flex items-center justify-between text-sm mb-8">
              <button onClick={() => setMode("reset")} className="font-medium" style={{ color: "var(--t-muted)" }}>
                Forgot password?
              </button>
              <button onClick={() => setMode("signup")} className="font-medium" style={{ color: "var(--t-muted)" }}>
                Need an account? <span className="underline" style={{ color: "var(--t-accent)" }}>Sign up</span>
              </button>
            </div>

            <LegalFooter />
          </motion.div>
        )}

        {/* ── SIGN UP ── */}
        {mode === "signup" && (
          <motion.div key="signup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full max-w-md py-8">
            <BackButton onClick={() => resetBack("login")} />
            <h1 className="font-display text-4xl font-light text-center mb-12" style={{ color: "var(--t-text)" }}>
              Create your account
            </h1>
            {errors.general && <ErrorBox msg={errors.general} />}
            <form onSubmit={handleSignup} className="space-y-6">
              <Field label="Email" icon={<Mail className="absolute left-3 top-3.5 w-5 h-5" style={{ color: "var(--t-muted)" }} />} error={errors.email}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className={inputClass(errors.email)}
                  style={{ color: "var(--t-text)", fontSize: "16px" }} />
              </Field>
              <Field label="Password" icon={<Lock className="absolute left-3 top-3.5 w-5 h-5" style={{ color: "var(--t-muted)" }} />} error={errors.password}>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters" className={inputClass(errors.password)}
                  style={{ color: "var(--t-text)", fontSize: "16px" }} />
              </Field>
              <Field label="Confirm Password" icon={<Lock className="absolute left-3 top-3.5 w-5 h-5" style={{ color: "var(--t-muted)" }} />} error={errors.confirmPassword}>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password" className={inputClass(errors.confirmPassword)}
                  style={{ color: "var(--t-text)", fontSize: "16px" }} />
              </Field>
              <SubmitButton loading={loading} label="Create account" />
              <LegalFooter />
            </form>
          </motion.div>
        )}

        {/* ── RESET ── */}
        {mode === "reset" && (
          <motion.div key="reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full max-w-md py-8">
            <BackButton onClick={() => resetBack("login")} />
            <h1 className="font-display text-4xl font-light text-center mb-4" style={{ color: "var(--t-text)" }}>
              Reset your password
            </h1>
            <p className="text-sm text-center mb-12" style={{ color: "var(--t-muted)" }}>
              Enter your email and we'll send you a reset link.
            </p>
            {errors.general && <ErrorBox msg={errors.general} />}
            <form onSubmit={handleReset} className="space-y-6">
              <Field label="Email" icon={<Mail className="absolute left-3 top-3.5 w-5 h-5" style={{ color: "var(--t-muted)" }} />} error={errors.email}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className={inputClass(errors.email)}
                  style={{ color: "var(--t-text)", fontSize: "16px" }} />
              </Field>
              <SubmitButton loading={loading} label="Send reset link" />
            </form>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// ── helpers ──

function SocialButton({ onClick, icon, label }) {
  return (
    <button onClick={onClick}
      className="w-full mb-3 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-3 transition"
      style={{ border: "1px solid var(--t-border)", backgroundColor: "var(--t-card)", color: "var(--t-text)" }}>
      <img src={icon} alt="" className="w-5 h-5" />
      {label}
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1 h-px" style={{ backgroundColor: "var(--t-border)" }} />
      <span className="text-xs font-medium" style={{ color: "var(--t-muted)" }}>OR</span>
      <div className="flex-1 h-px" style={{ backgroundColor: "var(--t-border)" }} />
    </div>
  );
}

function Field({ label, icon, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: "var(--t-muted)" }}>
        {label}
      </label>
      <div className="relative">{icon}{children}</div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function SubmitButton({ loading, label }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full py-3.5 rounded-xl text-sm font-medium disabled:opacity-40 transition flex items-center justify-center gap-2"
      style={{ backgroundColor: "var(--t-accent)", color: "var(--t-bg)" }}>
      {loading && <Loader className="w-4 h-4 animate-spin" />}
      {label}
    </button>
  );
}

function BackButton({ onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 mb-8 text-sm font-medium" style={{ color: "var(--t-accent)" }}>
      <ChevronLeft className="w-5 h-5" />
      Back to sign in
    </button>
  );
}

function ErrorBox({ msg }) {
  return (
    <div className="mb-6 p-3 rounded-xl text-sm" style={{ backgroundColor: "var(--t-danger-muted)", color: "#f87171", border: "1px solid var(--t-danger-border)" }}>
      {msg}
    </div>
  );
}

function LegalFooter() {
  return (
    <p className="text-center text-xs mt-6" style={{ color: "var(--t-muted)" }}>
      By continuing you agree to our{" "}
      <a href={createPageUrl("TermsOfService")} className="underline" style={{ color: "var(--t-text)" }}>Terms of Service</a>
      {" "}and{" "}
      <a href={createPageUrl("PrivacyPolicy")} className="underline" style={{ color: "var(--t-text)" }}>Privacy Policy</a>
    </p>
  );
}