import React from "react";

export default function PlaceCard({ place }) {
  return (
    <div className="py-4 border-b" style={{ borderColor: '#232a35' }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
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
          {place.description && (
            <p className="text-xs mt-1.5 leading-relaxed italic" style={{ color: '#6a7280' }}>
              {place.description}
            </p>
          )}
          {place.tag && (
            <span
              className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-2"
              style={{ backgroundColor: 'rgba(138,171,142,0.15)', color: '#8aab8e' }}
            >
              {place.tag}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}