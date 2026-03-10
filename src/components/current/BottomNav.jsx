import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sun, MapPin, User } from "lucide-react";

const tabs = [
  { name: "Today", icon: Sun, page: "Home" },
  { name: "Spots", icon: MapPin, page: "NearMe" },
  { name: "You", icon: User, page: "Profile" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{ 
        backgroundColor: '#0f1219', 
        borderColor: '#232a35',
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
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors"
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2 : 1.5}
                style={{ color: isActive ? '#6F8FA4' : '#6a7280' }}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? '#6F8FA4' : '#6a7280' }}
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