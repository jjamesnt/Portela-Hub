import { supabase } from './supabaseClient';
import { Profile } from '../types';

export const profileService = {
  /**
   * Busca todos os perfis cadastrados no sistema.
   */
  async getProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Busca o perfil de um usuário específico pelo ID.
   */
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Atualiza as informações de um perfil.
   */
  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Altera o status (ativo/bloqueado) de um usuário.
   */
  async updateStatus(userId: string, status: 'active' | 'blocked' | 'pending') {
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId);

    if (error) throw error;
    return true;
  },

  /**
   * Altera o cargo/nível de acesso de um usuário.
   */
  async updateRole(userId: string, role: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) throw error;
    return true;
  },

  async createUser(userData: {
    email: string;
    password?: string;
    full_name: string;
    phone: string;
    role: string;
    status: string;
  }) {
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: userData
    });

    if (error) throw new Error(error.message || 'Falha ao conectar com o serviço de criação');
    if (data?.error) throw new Error(data.error);
    return data;
  }
};
