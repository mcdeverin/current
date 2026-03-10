import React, { createContext, useContext, useState } from "react";

const DARK_VARS = {
  '--t-bg': '#0f1219',
  '--t-card': '#161b24',
  '--t-card-alt': '#1a2430',
  '--t-border': '#232a35',
  '--t-text': '#e8eaf0',
  '--t-text-warm': '#f0f2ee',
  '--t-muted': '#6a7280',
  '--t-accent': '#6F8FA4',
  '--t-accent-bg': 'rgba(111,143,164,0.15)',
  '--t-danger-muted': '#4a3030',
  '--t-danger': '#7a2020',
  '--t-danger-border': '#3a2020',
};

const LIGHT_VARS = {
  '--t-bg': '#f5f4ef',
  '--t-card': '#ffffff',
  '--t-card-alt': '#ede9e2',
  '--t-border': '#d5d0c8',
  '--t-text': '#1a1a1a',
  '--t-text-warm': '#1a1a1a',
  '--t-muted': '#7a7870',
  '--t-accent': '#4d7a96',
  '--t-accent-bg': 'rgba(77,122,150,0.12)',
  '--t-danger-muted': '#8b3535',
  '--t-danger': '#7a2020',
  '--t-danger-border': '#e8c0c0',
};

const ThemeContext = createContext({ isDark: true, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('current-theme') !== 'light'; } catch { return true; }
  });

  const toggleTheme = () => {
    setIsDark(v => {
      const next = !v;
      try { localStorage.setItem('current-theme', next ? 'dark' : 'light'); } catch {}
      return next;
    });
  };

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