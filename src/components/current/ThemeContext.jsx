import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({ isDark: true, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('current-theme') !== 'light';
  });

  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('theme-light');
    } else {
      document.body.classList.add('theme-light');
    }
    localStorage.setItem('current-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(v => !v) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}