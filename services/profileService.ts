import { apiClient } from './apiClient';
import { Profile } from '../types';

export const profileService = {
  /**
   * Busca todos os perfis cadastrados no sistema.
   */
  async getProfiles(): Promise<Profile[]> {
    return apiClient.get<Profile[]>('/api/profiles');
  },

  /**
   * Busca o perfil de um usuário específico pelo ID.
   */
  async getProfile(userId: string): Promise<Profile | null> {
    return apiClient.get<Profile>(`/api/profiles/${userId}`);
  },

  /**
   * Busca o perfil do usuário logado através do token.
   */
  async getMe(): Promise<Profile | null> {
    return apiClient.get<Profile>('/api/auth/me');
  },

  /**
   * Atualiza as informações de um perfil.
   */
  async updateProfile(userId: string, updates: Partial<Profile>) {
    return apiClient.put<Profile>(`/api/profiles/${userId}`, updates);
  },

  /**
   * Altera o status (ativo/bloqueado) de um usuário.
   */
  async updateStatus(userId: string, status: 'active' | 'blocked' | 'pending') {
    return apiClient.put<any>(`/api/profiles/${userId}/status`, { status });
  },

  /**
   * Altera o cargo/nível de acesso de um usuário.
   */
  async updateRole(userId: string, role: string) {
    return apiClient.put<any>(`/api/profiles/${userId}/role`, { role });
  },

  async createUser(userData: {
    email: string;
    password?: string;
    full_name: string;
    phone: string;
    role: string;
    status: string;
  }) {
    return apiClient.post<any>('/api/profiles', userData);
  }
};
