import React from "react";

function nameToHue(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash) % 360;
}

export default function PhotoSlot({ place, width = 80, height = 80, radius = 8 }) {
  const hue = nameToHue(place.name);
  const photoUrl = place.photo_url || place.profile_image;

  if (photoUrl) {
    return (
      <div style={{ width, height, borderRadius: radius, overflow: 'hidden', flexShrink: 0 }}>
        <img src={photoUrl} alt={place.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }

  return (
    <div style={{
      width,
      height,
      borderRadius: radius,
      flexShrink: 0,
      background: `linear-gradient(135deg, hsl(${hue},18%,22%), hsl(${hue},22%,32%))`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <span style={{
        position: 'absolute',
        top: 5,
        left: 5,
        fontSize: 8,
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.35)',
        letterSpacing: '0.05em',
      }}>PHOTO</span>
    </div>
  );
}