import React, { createContext, useContext, useState } from "react";

const DARK = {
  bg: '#0E1113',
  bgSecondary: '#14181C',
  bgTertiary: '#1C2126',
  card: '#E9ECEA',
  cardSecondary: '#1C2126',
  text: '#F1F3F2',
  textOnCard: '#0E1113',
  textSecondary: '#A7B0B3',
  muted: '#6F787C',
  mutedOnCard: '#596167',
  border: '#262C31',
  borderSecondary: '#2E343A',
  success: '#7FA58A',
  successBg: 'rgba(127,165,138,0.15)',
  accentBg: '#1A2B1E',
  iconBg: '#0E1113',
  iconRing: '#6F8FA4',
};

const LIGHT = {
  bg: '#F3F3F1',
  bgSecondary: '#FFFFFF',
  bgTertiary: '#ECEFED',
  card: '#FFFFFF',
  cardSecondary: '#ECEFED',
  text: '#0E1113',
  textOnCard: '#0E1113',
  textSecondary: '#596167',
  muted: '#8C9397',
  mutedOnCard: '#8C9397',
  border: '#E0E4E2',
  borderSecondary: '#D3D8D6',
  success: '#7FA58A',
  successBg: 'rgba(127,165,138,0.12)',
  accentBg: '#E8F0E9',
  iconBg: '#F3F3F1',
  iconRing: '#0E1113',
};

const ThemeContext = createContext({ t: DARK, isDark: true, toggle: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('current_theme');
      return saved !== null ? saved === 'dark' : true;
    } catch { return true; }
  });

  const toggle = () => {
    setIsDark(prev => {
      const next = !prev;
      try { localStorage.setItem('current_theme', next ? 'dark' : 'light'); } catch {}
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ t: isDark ? DARK : LIGHT, isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}