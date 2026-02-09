
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { AppContextType, AppFilters, Theme } from '../types';

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [filters, setFilters] = useState<AppFilters>({
    regiao: 'Todas as Regiões',
    assessor: 'Todos',
    municipio: 'Todos',
  });
  
  const [theme, setTheme] = useState<Theme>(() => {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedTheme = window.localStorage.getItem('theme') as Theme;
        return storedTheme || 'light';
      }
      return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <AppContext.Provider value={{ filters, setFilters, theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
};
