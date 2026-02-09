
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
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [selectedMandato, setSelectedMandatoState] = useState<string>(() => {
    return localStorage.getItem('portela_hub_selected_mandato') || 'Todos';
  });

  useEffect(() => {
    if (selectedMandato === 'Lincoln Portela') {
      document.body.classList.add('mandato-lincoln');
    } else {
      document.body.classList.remove('mandato-lincoln');
    }
  }, [selectedMandato]);

  const setSelectedMandato = (mandato: string) => {
    setSelectedMandatoState(mandato);
    localStorage.setItem('portela_hub_selected_mandato', mandato);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <AppContext.Provider value={{
      filters,
      setFilters,
      theme,
      toggleTheme,
      selectedMandato,
      setSelectedMandato
    }}>
      {children}
    </AppContext.Provider>
  );
};
