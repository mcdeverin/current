import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({ isDark: true, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('current-theme') !== 'light'; } catch { return true; }
  });

  useEffect(() => {
    const el = document.documentElement;
    if (isDark) {
      el.classList.remove('theme-light');
    } else {
      el.classList.add('theme-light');
    }
    try { localStorage.setItem('current-theme', isDark ? 'dark' : 'light'); } catch {}
  }, [isDark]);

  const toggleTheme = () => setIsDark(v => !v);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}