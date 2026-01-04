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

function getInitialTheme(revealType?: RevealType): ThemeType {
  if (typeof window === 'undefined') return 'default';
  
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeType | null;
  
  if (savedTheme) {
    return savedTheme;
  }
  
  if (revealType && themeMapping[revealType]) {
    return themeMapping[revealType];
  }
  
  return 'default';
}

function getInitialDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  const savedDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY);
  return savedDarkMode === 'true';
}

export function ThemeProvider({ children, revealType }: { children: ReactNode; revealType?: RevealType }) {
  const [theme, setThemeState] = useState<ThemeType>(() => getInitialTheme(revealType));
  const [isDarkMode, setIsDarkMode] = useState(() => getInitialDarkMode());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : theme);
    localStorage.setItem(DARK_MODE_STORAGE_KEY, isDarkMode.toString());
  }, [isDarkMode, theme]);

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
