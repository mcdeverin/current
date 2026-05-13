import React from "react";
import ReflectionPrompt from "../components/current/ReflectionPrompt";

export default function Reflection() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--t-bg)', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>
      <ReflectionPrompt />
    </div>
  );
}