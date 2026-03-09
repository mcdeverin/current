import React from "react";

export default function PlaceCard({ place, distance, isOpen }) {
  return (
    <div className="py-4 border-b" style={{ borderColor: '#232a35' }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden"
          style={{ backgroundColor: '#1A2530' }}>
          {place.profile_image ? (
            <img src={place.profile_image} alt={place.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl">
              {place.emoji || "📍"}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base font-medium leading-tight" style={{ color: '#e8eaf0' }}>
            {place.name}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: '#6a7280' }}>
            {place.type}{distance != null ? ` · ${distance.toFixed(1)} mi · ${place.neighborhood}` : ` · ${place.neighborhood}`}
          </p>
          {place.description && (
            <p className="text-xs mt-1.5 leading-relaxed italic" style={{ color: '#6a7280' }}>
              {place.description}
            </p>
          )}
          {place.tag && (
            <span
              className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-2"
              style={{ backgroundColor: 'rgba(111,143,164,0.15)', color: '#6F8FA4' }}
            >
              {place.tag}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}