import { supabase } from './supabaseClient';

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
    const { data, error } = await supabase
      .from('role_permissions')
      .select('role, allowed_items, display_name');

    if (error) throw error;
    return data || [];
  },

  /**
   * Atualiza os itens permitidos para um cargo específico.
   */
  async updateAllowedItems(role: string, allowedItems: string[]) {
    const { error } = await supabase
      .from('role_permissions')
      .update({ allowed_items: allowedItems })
      .eq('role', role);

    if (error) throw error;
    return true;
  },

  /**
   * Cria um novo cargo no sistema.
   */
  async createRole(name: string) {
    const roleId = name.toLowerCase().trim().replace(/\s+/g, '_') + '_' + Date.now().toString().slice(-4);
    
    const { error } = await supabase
      .from('role_permissions')
      .insert({ 
        role: roleId, 
        allowed_items: ['Dashboard'],
        display_name: name 
      });

    if (error) throw error;
    return roleId;
  },

  /**
   * Renomeia o nome de exibição de um cargo.
   */
  async renameRole(roleId: string, newDisplayName: string) {
    const { error } = await supabase
      .from('role_permissions')
      .update({ display_name: newDisplayName })
      .eq('role', roleId);

    if (error) throw error;
    return true;
  },

  /**
   * Exclui um cargo, movendo os usuários vinculados para o cargo padrão 'user'.
   */
  async deleteRole(roleId: string) {
    if (roleId === 'master' || roleId === 'user') {
      throw new Error('Os cargos principais não podem ser excluídos.');
    }

    // 1. Mover usuários para 'user'
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'user' })
      .eq('role', roleId);

    if (profileError) throw profileError;

    // 2. Excluir o cargo
    const { error } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role', roleId);

    if (error) throw error;
    return true;
  }
};
