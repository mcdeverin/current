import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sun, MapPin, User } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { hapticLight } from "@/lib/haptics";

const tabs = [
  { name: "Today", icon: Sun, page: "Home" },
  { name: "Spots", icon: MapPin, page: "Spots" },
  { name: "Mine", icon: User, page: "Profile" },
];

export default function BottomNav() {
  const location = useLocation();
  const { isDark } = useTheme();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{ 
        backgroundColor: isDark ? 'rgba(15,18,25,0.88)' : 'rgba(245,244,239,0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: 'var(--t-border)',
        paddingBottom: 'env(safe-area-inset-bottom, 12px)'
      }}>
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
        {tabs.map(({ name, icon: Icon, page }) => {
          const url = createPageUrl(page);
          const isActive = location.pathname === url || 
            (page === "Home" && location.pathname === "/");
          return (
            <Link
              key={name}
              to={url}
              onClick={() => { hapticLight(); if (isActive) window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors select-none"
              style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2 : 1.5}
                style={{ color: isActive ? 'var(--t-accent)' : 'var(--t-muted)', pointerEvents: 'none' }}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? 'var(--t-accent)' : 'var(--t-muted)' }}
              >
                {name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}