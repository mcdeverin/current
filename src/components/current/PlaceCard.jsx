import React from "react";

const tagColors = {
  "Alcohol-Free": { bg: "rgba(138,171,142,0.15)", text: "#8aab8e" },
  "Event": { bg: "rgba(106,114,128,0.12)", text: "#6a7280" },
  "NA Cocktails": { bg: "rgba(138,171,142,0.15)", text: "#8aab8e" },
  "Sober Friendly": { bg: "rgba(106,114,128,0.12)", text: "#6a7280" },
};

export default function PlaceCard({ place }) {
  const colors = tagColors[place.tag] || tagColors["Sober Friendly"];

  return (
    <div className="flex items-start gap-4 py-4 border-b" style={{ borderColor: '#232a35' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ backgroundColor: '#1e3024' }}>
        {place.emoji || "📍"}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-base font-medium leading-tight" style={{ color: '#e8eaf0' }}>
          {place.name}
        </h3>
        <p className="text-xs mt-0.5" style={{ color: '#6a7280' }}>
          {place.type} · {place.neighborhood}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span 
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {place.tag}
          </span>
        </div>
      </div>
    </div>
  );
}