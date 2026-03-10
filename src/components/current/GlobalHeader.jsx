import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft } from "lucide-react";
import { useTheme } from "./ThemeContext";

const ROOT_PATHS = [
  createPageUrl("Home"),
  createPageUrl("NearMe"),
  createPageUrl("Profile"),
  "/",
];

export default function GlobalHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const isRoot = ROOT_PATHS.includes(location.pathname);
  const bgColor = isDark ? "rgba(15,18,25,0.85)" : "rgba(245,244,239,0.85)";

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 flex flex-col justify-end"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        height: "calc(env(safe-area-inset-top, 0px) + 56px)",
        backgroundColor: bgColor,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--t-border)",
      }}
    >
      <div className="w-full max-w-lg mx-auto px-5 flex items-center h-14">
        {isRoot ? (
          <p
            className="font-display text-base font-medium w-full text-center tracking-wide"
            style={{ color: "var(--t-accent)" }}
          >
            current
          </p>
        ) : (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-0.5 -ml-1"
            style={{ color: "var(--t-accent)" }}
          >
            <ChevronLeft size={22} strokeWidth={2} />
            <span className="text-sm font-medium">Back</span>
          </button>
        )}
      </div>
    </div>
  );
}