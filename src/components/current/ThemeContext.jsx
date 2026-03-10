import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({ isDark: true, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('current-theme') !== 'light'; } catch { return true; }
  });

  const toggleTheme = () => setIsDark(v => {
    const next = !v;
    try { localStorage.setItem('current-theme', next ? 'dark' : 'light'); } catch {}
    return next;
  });

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className={isDark ? '' : 'theme-light'} style={{ minHeight: '100vh' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}