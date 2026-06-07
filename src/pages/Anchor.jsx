import React from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

export default function Anchor() {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{ backgroundColor: "var(--t-bg)" }}
    >
      <button
        onClick={() => navigate(-1)}
        className="absolute top-0 right-0 p-5"
        style={{ paddingTop: "calc(env(safe-area-inset-top,0px) + 16px)", color: "var(--t-muted)" }}
      >
        <X size={22} />
      </button>
      <p className="font-display text-2xl" style={{ color: "var(--t-text)" }}>Anchor</p>
      <p className="text-sm mt-2" style={{ color: "var(--t-muted)" }}>Breathing tool — coming soon</p>
    </div>
  );
}