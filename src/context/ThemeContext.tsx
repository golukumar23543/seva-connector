import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'royal-sapphire' | 'pearl-light' | 'sunset-amber' | 'emerald-slate';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleLightDark: () => void;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sevaconnect_color_theme') as ThemeMode;
      if (saved && ['royal-sapphire', 'pearl-light', 'sunset-amber', 'emerald-slate'].includes(saved)) {
        return saved;
      }
    }
    return 'royal-sapphire';
  });

  const isLight = theme === 'pearl-light';

  const applyThemeToDOM = (newTheme: ThemeMode) => {
    const root = document.documentElement;
    root.classList.remove('theme-royal-sapphire', 'theme-pearl-light', 'theme-sunset-amber', 'theme-emerald-slate', 'daylight-mode');
    root.classList.add(`theme-${newTheme}`);
    if (newTheme === 'pearl-light') {
      root.classList.add('daylight-mode');
    }
  };

  useEffect(() => {
    applyThemeToDOM(theme);
    localStorage.setItem('sevaconnect_color_theme', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleLightDark = () => {
    setThemeState((prev) => (prev === 'pearl-light' ? 'royal-sapphire' : 'pearl-light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleLightDark, isLight }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
