import React, { createContext, useContext, useState, useEffect } from "react";
import { setStatusBarDark, setStatusBarLight } from "@/lib/statusbar";

const DARK_VARS = {
  '--t-bg': '#0a0e14',
  '--t-card': '#11161f',
  '--t-card-alt': '#161f2b',
  '--t-primary-card': '#161f2b',
  '--t-border': '#1f2a39',
  '--t-text': '#e6ecf5',
  '--t-text-warm': '#f0f2ee',
  '--t-muted': '#7a8899',
  '--t-label': '#7a8899',
  '--t-accent': '#5b8fc7',
  '--t-accent-bg': 'rgba(91,143,199,0.12)',
  '--t-danger-muted': '#4a3030',
  '--t-danger': '#7a2020',
  '--t-danger-border': '#3a2020',
};

const LIGHT_VARS = {
  '--t-bg': '#f5f4ef',
  '--t-card': '#ffffff',
  '--t-card-alt': '#EEF3F6',
  '--t-primary-card': '#EEF3F6',
  '--t-border': '#d5d0c8',
  '--t-text': '#1a1a1a',
  '--t-text-warm': '#1a1a1a',
  '--t-muted': '#7a7870',
  '--t-label': '#6E8FA3',
  '--t-accent': '#6E8FA3',
  '--t-accent-bg': 'rgba(110,143,163,0.12)',
  '--t-danger-muted': '#8b3535',
  '--t-danger': '#7a2020',
  '--t-danger-border': '#e8c0c0',
};

const ThemeContext = createContext({ isDark: true, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('current-theme');
      if (saved === 'light') return false;
      // Default to dark unless user explicitly chose light
      return true;
    } catch { return true; }
  });



  const toggleTheme = () => {
    setIsDark(v => {
      const next = !v;
      try { localStorage.setItem('current-theme', next ? 'dark' : 'light'); } catch {}
      return next;
    });
  };

  useEffect(() => {
    if (isDark) setStatusBarDark();
    else setStatusBarLight();
  }, [isDark]);

  const vars = isDark ? DARK_VARS : LIGHT_VARS;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div style={{ ...vars, minHeight: '100dvh' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}