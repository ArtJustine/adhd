// context/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useAppData } from './AppDataContext';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  colors: {
    background: string;
    card: string;
    text: string;
    subText: string;
    border: string;
    primary: string;
    primaryLight: string;
    accent: string;
    success: string;
    danger: string;
    warning: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

// Monochromatic color palette
const lightColors = {
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#212529',
  subText: '#6C757D',
  border: '#DEE2E6',
  primary: '#212529',
  primaryLight: '#495057',
  accent: '#343A40',
  success: '#198754',
  danger: '#DC3545',
  warning: '#FFC107',
};

const darkColors = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#E9ECEF',
  subText: '#ADB5BD',
  border: '#343A40',
  primary: '#E9ECEF',
  primaryLight: '#CED4DA',
  accent: '#ADB5BD',
  success: '#20C997',
  danger: '#F06595',
  warning: '#FFC107',
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { settings, updateSettings } = useAppData();
  const deviceTheme = useColorScheme() as Theme;
  const [theme, setTheme] = useState<Theme>(settings.darkMode ? 'dark' : 'light');
  
  // Update theme when settings change
  useEffect(() => {
    setTheme(settings.darkMode ? 'dark' : 'light');
  }, [settings.darkMode]);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    updateSettings({ darkMode: newTheme === 'dark' });
  };
  
  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;
  
  const value = {
    theme,
    toggleTheme,
    isDark,
    colors,
  };
  
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};