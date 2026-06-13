import { apiClient } from '../../../../services/apiClient';
import { ContatoUnificado } from '../schemas/contatosSchema';

export const fetchContatosUnificados = async (): Promise<ContatoUnificado[]> => {
    try {
        // Buscamos todas as entidades simultaneamente.
        // Adicionamos cadastrado_por_nome. Caso a coluna não exista ainda, o backend pode retornar erro,
        // então lidamos com isso de forma segura se possível, mas assumimos que a DDL foi executada.
        
        const [liderancasRes, assessoresRes, apoiadoresRes] = await Promise.all([
            apiClient.post<any>('/api/admin/sql', {
                sql: `SELECT id, nome, cargo, partido, municipio_nome as municipio, regiao, telefone as contato, email, avatar_url as "avatarUrl", origem, cadastrado_por_nome FROM hub.liderancas`
            }).catch(() => ({ rows: [] })),
            
            apiClient.post<any>('/api/admin/sql', {
                sql: `SELECT id, nome, cargo, regiao_atuacao as "regiaoAtuacao", telefone, email, avatar_url as "avatarUrl", origem, cadastrado_por_nome FROM hub.assessores`
            }).catch(() => ({ rows: [] })),
            
            apiClient.post<any>('/api/admin/sql', {
                sql: `SELECT a.id, a.nome, a.cargo, a.telefone, a.email, a.foto_url as "fotoUrl", m.nome as municipio_nome, a.cadastrado_por_nome 
                      FROM hub.apoiadores a 
                      LEFT JOIN hub.municipios m ON a.municipio_id = m.id`
            }).catch(() => ({ rows: [] }))
        ]);

        const unified: ContatoUnificado[] = [
            ...(liderancasRes?.rows || []).map((l: any) => ({
                id: `lid_${l.id}`,
                originalId: l.id,
                nome: l.nome,
                tipo: 'Liderança' as const,
                cargoOuPartido: `${l.cargo || ''} ${l.partido ? `(${l.partido})` : ''}`.trim(),
                municipioOuRegiao: `${l.municipio || ''} ${l.regiao ? `- ${l.regiao}` : ''}`.trim(),
                telefone: l.contato || '',
                email: l.email || '',
                avatarUrl: l.avatarUrl,
                origem: l.origem || 'Geral',
                cadastradoPorNome: l.cadastrado_por_nome
            })),
            ...(assessoresRes?.rows || []).map((a: any) => ({
                id: `ass_${a.id}`,
                originalId: a.id,
                nome: a.nome,
                tipo: 'Assessor' as const,
                cargoOuPartido: a.cargo || '',
                municipioOuRegiao: a.regiaoAtuacao || '',
                telefone: a.telefone || '',
                email: a.email || '',
                avatarUrl: a.avatarUrl,
                origem: a.origem || 'Geral',
                cadastradoPorNome: a.cadastrado_por_nome
            })),
            ...(apoiadoresRes?.rows || []).map((ap: any) => ({
                id: `apo_${ap.id}`,
                originalId: ap.id,
                nome: ap.nome,
                tipo: 'Apoiador' as const,
                cargoOuPartido: ap.cargo || 'Apoiador',
                municipioOuRegiao: ap.municipio_nome || 'Não informado',
                telefone: ap.telefone || '',
                email: ap.email || '',
                avatarUrl: ap.fotoUrl,
                origem: 'Geral',
                cadastradoPorNome: ap.cadastrado_por_nome
            }))
        ];

        unified.sort((a, b) => a.nome.localeCompare(b.nome));
        return unified;
    } catch (error) {
        console.error("Erro ao carregar contatos unificados", error);
        return [];
    }
};

export const fetchContatoById = async (tipo: string, originalId: string): Promise<any | null> => {
    let sql = '';
    let table = '';
    switch (tipo) {
        case 'Liderança':
            table = 'hub.liderancas';
            sql = `SELECT * FROM ${table} WHERE id = '${originalId}' LIMIT 1`;
            break;
        case 'Assessor':
            table = 'hub.assessores';
            sql = `SELECT * FROM ${table} WHERE id = '${originalId}' LIMIT 1`;
            break;
        case 'Apoiador':
            table = 'hub.apoiadores';
            sql = `SELECT a.*, m.nome as municipio_nome FROM ${table} a LEFT JOIN hub.municipios m ON a.municipio_id = m.id WHERE a.id = '${originalId}' LIMIT 1`;
            break;
        default:
            return null;
    }

    try {
        const res = await apiClient.post<any>('/api/admin/sql', { sql });
        return res.rows?.[0] || null;
    } catch (err) {
        console.error("Erro ao buscar detalhes do contato", err);
        return null;
    }
};

export const updateContatoAvatar = async (tipo: string, originalId: string, avatarUrl: string): Promise<boolean> => {
    let sql = '';
    let table = '';
    const field = tipo === 'Apoiador' ? 'foto_url' : 'avatar_url';

    switch (tipo) {
        case 'Liderança':
            table = 'hub.liderancas';
            break;
        case 'Assessor':
            table = 'hub.assessores';
            break;
        case 'Apoiador':
            table = 'hub.apoiadores';
            break;
        default:
            return false;
    }

    sql = `UPDATE ${table} SET ${field} = '${avatarUrl}' WHERE id = '${originalId}'`;

    try {
        await apiClient.post<any>('/api/admin/sql', { sql });
        return true;
    } catch (err) {
        console.error("Erro ao atualizar avatar do contato", err);
        return false;
    }
};
