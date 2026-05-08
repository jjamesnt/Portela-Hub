import { apiClient } from './apiClient';

export interface RolePermissionData {
  role: string;
  allowed_items: string[];
  display_name: string;
}

export const roleService = {
  /**
   * Busca todas as permissões e nomes de cargos.
   */
  async getRolePermissions(): Promise<RolePermissionData[]> {
    return apiClient.get<RolePermissionData[]>('/api/roles');
  },

  /**
   * Atualiza os itens permitidos para um cargo específico.
   */
  async updateAllowedItems(role: string, allowedItems: string[]) {
    return apiClient.put<any>(`/api/roles/${role}/permissions`, { allowed_items: allowedItems });
  },

  /**
   * Cria um novo cargo no sistema.
   */
  async createRole(name: string) {
    const roleId = name.toLowerCase().trim().replace(/\s+/g, '_') + '_' + Date.now().toString().slice(-4);
    await apiClient.post<any>('/api/roles', { 
      role: roleId, 
      allowed_items: ['Dashboard'],
      display_name: name 
    });
    return roleId;
  },

  /**
   * Renomeia o nome de exibição de um cargo.
   */
  async renameRole(roleId: string, newDisplayName: string) {
    return apiClient.put<any>(`/api/roles/${roleId}`, { display_name: newDisplayName });
  },

  /**
   * Exclui um cargo, movendo os usuários vinculados para o cargo padrão 'user'.
   */
  async deleteRole(roleId: string) {
    if (roleId === 'master' || roleId === 'user') {
      throw new Error('Os cargos principais não podem ser excluídos.');
    }
    return apiClient.delete<any>(`/api/roles/${roleId}`);
  }
};
