import React, { createContext, useState, ReactNode, useEffect, useRef } from 'react';
import { AppContextType, AppFilters, Theme, Profile } from '../types';
import { supabase } from '../services/supabaseClient';

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const isMounted = useRef(true);

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
    isMounted.current = true;
    console.log("[AppContext] Monitorando autenticação...");

    const fetchProfileData = async (userId: string, retryCount = 0) => {
      const maxRetries = 3;
      console.log(`[AppContext] Buscando perfil para ${userId} (Tentativa ${retryCount + 1})...`);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!isMounted.current) return;

        if (data) {
          console.log("[AppContext] Perfil encontrado:", data.email, "Status:", data.status);
          setProfile(data);
          setProfileError(null);
          setIsLoadingAuth(false);
          return true;
        } else {
          console.warn("[AppContext] Perfil não encontrado ou erro:", error?.message);
          setProfileError(error?.message || 'Perfil não encontrado na tabela.');
          if (retryCount < maxRetries) {
            console.log(`[AppContext] Agendando nova tentativa em 2s...`);
            setTimeout(() => fetchProfileData(userId, retryCount + 1), 2000);
            return false;
          }
        }
      } catch (err) {
        console.error("[AppContext] Erro crítico na busca de perfil:", err);
      }

      if (isMounted.current) {
        setIsLoadingAuth(false);
      }
      return false;
    };

    // O Supabase onAuthStateChange dispara o evento INITIAL_SESSION logo no início
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      console.log(`[AppContext] Evento Auth: ${event}`, currentUser?.email || "Nenhum usuário");

      if (!isMounted.current) return;

      setUser(currentUser);

      if (currentUser) {
        // Se houver usuário, buscamos o perfil. fetchProfileData cuidará de setar isLoadingAuth para false.
        fetchProfileData(currentUser.id);
      } else {
        // Se não houver usuário, não há perfil.
        setProfile(null);
        setIsLoadingAuth(false);
      }
    });

    // Safety Timeout aumentado para 30s para dar tempo às retentativas
    const safetyTimeout = setTimeout(() => {
      if (isMounted.current && isLoadingAuth) {
        console.warn("[AppContext] Safety Timeout acionado. Forçando fim do carregamento.");
        setIsLoadingAuth(false);
      }
    }, 30000);

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

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

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const signOut = async () => {
    console.log("[AppContext] Fazendo logout...");
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AppContext.Provider value={{
      filters,
      setFilters,
      theme,
      toggleTheme,
      selectedMandato,
      setSelectedMandato,
      isSidebarOpen,
      toggleSidebar,
      user,
      profile,
      profileError,
      isLoading: isLoadingAuth,
      signOut
    }}>
      {children}
    </AppContext.Provider>
  );
};
