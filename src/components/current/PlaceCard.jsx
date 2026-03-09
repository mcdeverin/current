import React from "react";
import { useTheme } from "./ThemeContext";

export default function PlaceCard({ place }) {
  const { t } = useTheme();
  return (
    <div className="py-4 border-b" style={{ borderColor: t.border }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden"
          style={{ backgroundColor: t.bgTertiary }}>
          {place.profile_image ? (
            <img src={place.profile_image} alt={place.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl">
              {place.emoji || "📍"}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base font-medium leading-tight" style={{ color: t.text }}>
            {place.name}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: t.muted }}>
            {place.type} · {place.neighborhood}
          </p>
          {place.description && (
            <p className="text-xs mt-1.5 leading-relaxed italic" style={{ color: t.muted }}>
              {place.description}
            </p>
          )}
          {place.tag && (
            <span
              className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-2"
              style={{ backgroundColor: t.successBg, color: t.success }}
            >
              {place.tag}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}