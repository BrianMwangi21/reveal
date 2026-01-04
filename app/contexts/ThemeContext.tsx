'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type RevealType = 'gender' | 'baby' | 'birthday' | 'anniversary' | 'custom';

type ThemeType = 'default' | 'gender' | 'baby' | 'birthday' | 'elegant';

interface ThemeContextType {
  theme: ThemeType;
  isDarkMode: boolean;
  setTheme: (theme: ThemeType) => void;
  toggleDarkMode: () => void;
  setThemeFromRevealType: (revealType: RevealType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'reveal-theme';
const DARK_MODE_STORAGE_KEY = 'reveal-dark-mode';

const themeMapping: Record<RevealType, ThemeType> = {
  gender: 'gender',
  baby: 'baby',
  birthday: 'birthday',
  anniversary: 'elegant',
  custom: 'default',
};

export function ThemeProvider({ children, revealType }: { children: ReactNode; revealType?: RevealType }) {
  const [theme, setThemeState] = useState<ThemeType>('default');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeType | null;
    const savedDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY);

    if (savedTheme) {
      setThemeState(savedTheme);
    } else if (revealType && themeMapping[revealType]) {
      setThemeState(themeMapping[revealType]);
    }

    if (savedDarkMode) {
      setIsDarkMode(savedDarkMode === 'true');
    }
  }, [revealType]);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme, mounted]);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : theme);
      localStorage.setItem(DARK_MODE_STORAGE_KEY, isDarkMode.toString());
    }
  }, [isDarkMode, theme, mounted]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const setThemeFromRevealType = (revealType: RevealType) => {
    const mappedTheme = themeMapping[revealType] || 'default';
    setThemeState(mappedTheme);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, setTheme, toggleDarkMode, setThemeFromRevealType }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
