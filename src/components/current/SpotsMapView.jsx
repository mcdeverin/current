import React, { useState } from "react";
import PhotoSlot from "./PhotoSlot";

// NYC bounding box approximation
const NYC_CENTER = { lat: 40.728, lon: -73.985 };
const NYC_SPAN = { lat: 0.18, lon: 0.28 };

function latLonToXY(lat, lon, containerW, containerH, center, span) {
  const x = ((lon - (center.lon - span.lon / 2)) / span.lon) * containerW;
  const y = ((1 - (lat - (center.lat - span.lat / 2)) / span.lat)) * containerH;
  return { x, y };
}

const TYPE_COLORS = {
  Spots: '#6E8FA3',
  Mocktails: '#8aa9bd',
  Events: '#a8c5d8',
  Cafés: '#5b7d92',
  Wellness: '#7a9eb4',
};

export default function SpotsMapView({ places, cityFilter }) {
  const [focused, setFocused] = useState(null);
  const W = 360, H = 320;
  const center = cityFilter === "LA"
    ? { lat: 34.05, lon: -118.24 }
    : NYC_CENTER;
  const span = cityFilter === "LA"
    ? { lat: 0.20, lon: 0.30 }
    : NYC_SPAN;

  const withCoords = places.filter(p => p.latitude && p.longitude);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: W, margin: '0 auto' }}>
      {/* Map background */}
      <div
        style={{
          width: '100%',
          height: H,
          borderRadius: 12,
          backgroundColor: 'var(--t-card)',
          border: '1px solid var(--t-border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid lines */}
        {[...Array(6)].map((_, i) => (
          <div key={`h${i}`} style={{
            position: 'absolute',
            left: 0, right: 0,
            top: `${(i / 5) * 100}%`,
            height: 1,
            backgroundColor: 'var(--t-border)',
            opacity: 0.4,
          }} />
        ))}
        {[...Array(8)].map((_, i) => (
          <div key={`v${i}`} style={{
            position: 'absolute',
            top: 0, bottom: 0,
            left: `${(i / 7) * 100}%`,
            width: 1,
            backgroundColor: 'var(--t-border)',
            opacity: 0.4,
          }} />
        ))}

        <p className="text-[10px] uppercase tracking-widest font-medium absolute top-3 left-3" style={{ color: 'var(--t-muted)' }}>
          {cityFilter === "LA" ? "Los Angeles" : "New York"}
        </p>

        {/* Pins */}
        {withCoords.map(place => {
          const { x, y } = latLonToXY(place.latitude, place.longitude, W, H, center, span);
          const color = TYPE_COLORS[place.type] || 'var(--t-accent)';
          return (
            <button
              key={place.id}
              onClick={() => setFocused(focused?.id === place.id ? null : place)}
              style={{
                position: 'absolute',
                left: `${(x / W) * 100}%`,
                top: `${(y / H) * 100}%`,
                transform: 'translate(-50%, -100%)',
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: color,
                border: '2px solid var(--t-card)',
                boxShadow: focused?.id === place.id ? `0 0 10px 3px ${color}55` : 'none',
                cursor: 'pointer',
              }}
            />
          );
        })}

        {/* Fallback if no coords */}
        {withCoords.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-center px-8" style={{ color: 'var(--t-muted)' }}>
              Add coordinates to places to show them on the map.
            </p>
          </div>
        )}
      </div>

      {/* Focused place card */}
      {focused && (
        <div className="mt-3 rounded-xl p-4 flex items-start gap-3 border"
          style={{ backgroundColor: 'var(--t-card)', borderColor: 'var(--t-border)' }}>
          <PhotoSlot place={focused} width={56} height={56} radius={8} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: 'var(--t-text)' }}>{focused.name}</p>
            <p className="text-xs" style={{ color: 'var(--t-muted)' }}>{focused.type} · {focused.neighborhood}</p>
            {focused.tag && (
              <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1"
                style={{ backgroundColor: 'var(--t-accent-bg)', color: 'var(--t-accent)' }}>
                {focused.tag}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 px-1">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1">
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color }} />
            <span className="text-[10px]" style={{ color: 'var(--t-muted)' }}>{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}