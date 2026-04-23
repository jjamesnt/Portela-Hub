import React, { createContext, useState, ReactNode, useEffect, useRef } from 'react';
import { AppContextType, AppFilters, Theme, Profile } from '../types';
import { supabase } from '../services/supabaseClient';
import { profileService } from '../services/profileService';
import { roleService } from '../services/roleService';

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({
    master: ['Dashboard', 'Municípios', 'Lideranças', 'Apoiadores', 'Assessores', 'Agenda', 'Recursos', 'Demandas', 'Configurações'],
    admin: ['Dashboard', 'Municípios', 'Lideranças', 'Apoiadores', 'Assessores', 'Agenda', 'Recursos', 'Demandas', 'Configurações'],
    user: ['Dashboard', 'Municípios', 'Lideranças', 'Apoiadores', 'Assessores', 'Agenda', 'Recursos', 'Demandas']
  });
  const [roleDisplayNames, setRoleDisplayNames] = useState<Record<string, string>>({
    master: 'Master',
    admin: 'Coordenador',
    user: 'Usuário'
  });
  const [impersonatedProfile, setImpersonatedProfile] = useState<Profile | null>(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = window.sessionStorage.getItem('impersonated_profile');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const isMounted = useRef(true);

  const loadPermissions = async () => {
    try {
      const data = await roleService.getRolePermissions();

      const perms: Record<string, string[]> = {};
      const displays: Record<string, string> = {};
      data?.forEach((item: any) => {
        perms[item.role] = item.allowed_items || [];
        displays[item.role] = item.display_name || item.role;
      });

      setRolePermissions(perms);
      setRoleDisplayNames(displays);
    } catch (err) {
      console.error('Erro ao carregar permissões:', err);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

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
        const data = await profileService.getProfile(userId);

        if (!isMounted.current) return;

        if (data) {
          console.log("[AppContext] Perfil encontrado:", data.email, "Status:", data.status);
          setProfile(data);
          setProfileError(null);
          setIsLoadingAuth(false);
          return true;
        } else {
          console.warn("[AppContext] Perfil não encontrado na tabela.");
          setProfileError('Perfil não encontrado na tabela.');
          if (retryCount < maxRetries) {
            console.log(`[AppContext] Agendando nova tentativa em 2s...`);
            setTimeout(() => fetchProfileData(userId, retryCount + 1), 2000);
            return false;
          }
        }
      } catch (err: any) {
        console.error("[AppContext] Erro crítico na busca de perfil:", err);
        setProfileError(err.message || 'Erro ao buscar perfil.');
      }

      if (isMounted.current) {
        setIsLoadingAuth(false);
      }
      return false;
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      console.log(`[AppContext] Evento Auth: ${event}`, currentUser?.email || "Nenhum usuário");

      if (!isMounted.current) return;

      setUser(currentUser);

      if (currentUser) {
        fetchProfileData(currentUser.id);
      } else {
        setProfile(null);
        setIsLoadingAuth(false);
      }
    });

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

  const impersonateUser = (targetProfile: Profile) => {
    console.log(`[AppContext] Personificando usuário: ${targetProfile.email}`);
    setImpersonatedProfile(targetProfile);
    sessionStorage.setItem('impersonated_profile', JSON.stringify(targetProfile));
  };

  const stopImpersonating = () => {
    console.log("[AppContext] Parando personificação");
    setImpersonatedProfile(null);
    sessionStorage.removeItem('impersonated_profile');
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
      profile: impersonatedProfile || profile,
      setProfile,
      impersonatedProfile,
      profileError,
      isLoading: isLoadingAuth,
      signOut,
      impersonateUser,
      stopImpersonating,
      rolePermissions,
      setRolePermissions,
      roleDisplayNames,
      setRoleDisplayNames,
      updateRolePermission: async () => {},
      bulkUpdateRolePermissions: async () => {},
      createRole: async () => {},
      deleteRole: async () => {},
      renameRole: async () => {}
    }}>
      {children}
    </AppContext.Provider>
  );
};
