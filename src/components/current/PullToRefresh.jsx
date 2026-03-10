import React, { useState, useRef } from "react";

const THRESHOLD = 70;

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(delta * 0.5, THRESHOLD + 20));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= THRESHOLD) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
    setPullDistance(0);
    startY.current = null;
  };

  const progress = Math.min(pullDistance / THRESHOLD, 1);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ position: "relative" }}
    >
      {(pullDistance > 0 || refreshing) && (
        <div
          className="flex items-center justify-center transition-all"
          style={{
            height: refreshing ? 44 : pullDistance,
            overflow: "hidden",
          }}
        >
          <div
            className="rounded-full border-2"
            style={{
              width: 20,
              height: 20,
              borderColor: '#6F8FA4',
              borderTopColor: 'transparent',
              animation: refreshing ? 'spin 0.7s linear infinite' : 'none',
              transform: `rotate(${progress * 270}deg)`,
              transition: refreshing ? 'none' : 'transform 0.1s',
            }}
          />
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {children}
    </div>
  );
}