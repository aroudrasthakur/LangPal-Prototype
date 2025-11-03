import React, { createContext, useContext, useState, ReactNode } from 'react';

type ThemeColors = {
  background: string;
  card: string;
  text: string;
  primary: string;
  secondary: string;
  muted: string;
};

type ThemeContextValue = {
  isDark: boolean;
  toggleTheme: () => void;
  theme: { colors: ThemeColors };
};

const lightColors: ThemeColors = {
  background: '#F7FFF7',
  card: '#FFFFFF',
  text: '#0f1720',
  primary: '#2F855A',
  secondary: '#DFF7E1',
  muted: '#6B7280',
};

const darkColors: ThemeColors = {
  background: '#071019',
  card: '#0f1720',
  text: '#E6EEF3',
  primary: '#9AE6B4',
  secondary: '#072024',
  muted: '#94A3B8',
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark((v) => !v);

  const theme = { colors: isDark ? darkColors : lightColors };

  return <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}