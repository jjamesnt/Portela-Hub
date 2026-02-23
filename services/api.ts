import { supabase } from './supabaseClient';
import { MunicipioDetalhado, Lideranca, Assessor, EventoAgenda, Demanda, LiderancaLocal, Recurso, SolicitacaoAgenda } from '../types';
import { mockLiderancas } from '../data/mockLiderancas';
import { mockAssessores } from '../data/mockAssessores';

// Helper to map snake_case to CamelCase for Municipality
const mapMunicipio = (m: any) => ({
    id: m.id,
    nome: m.nome,
    codigoIBGE: m.codigo_ibge,
    regiao: m.regiao,
    populacao: m.populacao,
    idh: m.idh,
    pibPerCapita: m.pib_per_capita,
    influencia: m.influencia,
    liderancasAtivas: m.liderancas_ativas,
    statusAtividade: m.status_atividade,
});

// --- Municípios ---
export const getMunicipios = async (): Promise<MunicipioDetalhado[]> => {
    // Busca municípios com seus relacionamentos para contagem
    // Nota: Pegamos apenas o valor dos recursos para somar e o count de demandas
    const { data, error } = await supabase
        .from('municipios')
        .select(`
            *,
            recursos (valor),
            demandas (count)
        `);

    if (error) {
        console.error('Erro ao buscar municípios:', error);
        return [];
    }

    return data.map(m => ({
        ...mapMunicipio(m),
        totalRecursos: m.recursos?.reduce((acc: number, r: any) => acc + (parseFloat(r.valor) || 0), 0) || 0,
        totalDemandas: m.demandas?.[0]?.count || 0
    })) as any[];
};

export const createMunicipio = async (municipio: {
    nome: string;
    regiao: string;
    populacao?: number;
    idh?: number;
    pib_per_capita?: number;
    influencia?: number;
    status_atividade?: string;
    assessor_id?: string;
}) => {
    const { data, error } = await supabase
        .from('municipios')
        .insert([municipio])
        .select()
        .single();

    if (error) {
        console.error('Erro ao criar município:', error);
        throw error;
    }
    return mapMunicipio(data);
};


export const getMunicipioById = async (id: string): Promise<MunicipioDetalhado | undefined> => {
    // Busca os dados básicos do município
    const { data: municipio, error: mError } = await supabase
        .from('municipios')
        .select('*')
        .eq('id', id)
        .single();

    if (mError) {
        console.error(`Erro ao buscar município ${id}:`, mError);
        return undefined;
    }

    // Busca dados relacionados em paralelo
    const [demandasRes, liderancasRes, recursosRes] = await Promise.all([
        supabase.from('demandas').select('*').eq('municipio_id', id),
        supabase.from('liderancas_locais').select('*').eq('municipio_id', id),
        supabase.from('recursos').select('valor').eq('municipio_id', id)
    ]);


    return {
        ...mapMunicipio(municipio),
        demandas: (demandasRes.data || []) as Demanda[],
        liderancas: (liderancasRes.data || []).map(l => ({
            nome: l.nome,
            partido: l.partido,
            cargo: l.cargo,
            avatarInitials: l.avatar_initials
        })) as LiderancaLocal[],
        totalRecursos: recursosRes.data?.reduce((acc, r) => acc + (parseFloat(r.valor) || 0), 0) || 0
    } as MunicipioDetalhado;
};

// --- Lideranças ---
export const getLiderancas = async (): Promise<Lideranca[]> => {
    // Retornando dados mockados conforme solicitado pelo usuário para visualizar a cobertura
    const { data: dbData, error } = await supabase
        .from('liderancas')
        .select('*');

    if (error) {
        console.error('Erro ao buscar lideranças do banco:', error);
    }

    // Mesclar dados do banco com mock para garantir cobertura total
    const dbLiderancas = (dbData || []).map(l => ({
        ...l,
        municipio: l.municipio_nome
    })) as Lideranca[];

    return [...mockLiderancas, ...dbLiderancas];
};

// --- Assessores ---
export const getAssessores = async (): Promise<Assessor[]> => {
    const { data: dbData, error } = await supabase
        .from('assessores')
        .select('*');

    if (error) {
        console.error('Erro ao buscar assessores do banco:', error);
    }

    const dbAssessores = (dbData || []).map(a => ({
        ...a,
        cargo: 'Assessor Regional' as const,
        regiaoAtuacao: a.regiao_atuacao,
        municipiosCobertos: a.municipios_cobertos || 0,
        liderancasGerenciadas: a.liderancas_gerenciadas || 0,
        latitude: a.latitude,
        longitude: a.longitude,
        origem: a.origem
    })) as Assessor[];

    return [...mockAssessores, ...dbAssessores];
};

// --- Agenda ---
export const getAgendaEventos = async (): Promise<EventoAgenda[]> => {
    const { data, error } = await supabase
        .from('agenda')
        .select('*');

    if (error) {
        console.error('Erro ao buscar eventos da agenda:', error);
        return [];
    }
    return data as EventoAgenda[];
};

export const createEvento = async (evento: Omit<EventoAgenda, 'id'>) => {
    const { data, error } = await supabase
        .from('agenda')
        .insert([evento])
        .select()
        .single();

    if (error) {
        console.error('Erro ao criar evento:', error);
        throw error;
    }
    return data as EventoAgenda;
};

export const getSolicitacoesAgenda = async (): Promise<SolicitacaoAgenda[]> => {
    const { data, error } = await supabase
        .from('solicitacoes_agenda')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar solicitações de agenda:', error);
        return [];
    }
    return data as SolicitacaoAgenda[];
};

export const createSolicitacaoAgenda = async (solicitacao: Omit<SolicitacaoAgenda, 'id' | 'created_at' | 'status'>) => {
    const { data, error } = await supabase
        .from('solicitacoes_agenda')
        .insert([solicitacao])
        .select()
        .single();

    if (error) {
        console.error('Erro ao criar solicitação de agenda:', error);
        throw error;
    }
    return data as SolicitacaoAgenda;
};

// --- Recursos ---
export const getRecursosTotais = async (): Promise<number> => {
    const { data, error } = await supabase
        .from('recursos')
        .select('valor');

    if (error) {
        console.error('Erro ao buscar recursos totais:', error);
        return 0;
    }
    return data.reduce((acc, r) => acc + (parseFloat(r.valor) || 0), 0);
};

export const getAllRecursos = async (): Promise<Recurso[]> => {
    const { data, error } = await supabase
        .from('recursos')
        .select('*, municipios(nome, regiao)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar todos os recursos:', error);
        return [];
    }
    return data.map((r: any) => ({
        id: r.id,
        municipioId: r.municipio_id,
        tipo: r.tipo,
        descricao: r.descricao,
        valor: parseFloat(r.valor) || 0,
        origem: r.origem,
        status: r.status,
        dataAprovacao: r.data_aprovacao,
        responsavel: r.responsavel,
        observacoes: r.observacoes,
        municipio_nome: r.municipios?.nome || 'Desconhecido',
        regiao: r.municipios?.regiao || '-',
    })) as Recurso[];
};

export const getRecursosByMunicipio = async (municipioId: string): Promise<Recurso[]> => {
    const { data, error } = await supabase
        .from('recursos')
        .select('*')
        .eq('municipio_id', municipioId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar recursos do município:', error);
        return [];
    }
    return data.map(r => ({
        id: r.id,
        municipioId: r.municipio_id,
        tipo: r.tipo,
        descricao: r.descricao,
        valor: parseFloat(r.valor) || 0,
        origem: r.origem,
        status: r.status,
        dataAprovacao: r.data_aprovacao,
        responsavel: r.responsavel,
        observacoes: r.observacoes
    })) as Recurso[];
};

export const createRecurso = async (recurso: {
    municipio_id: string;
    tipo: string;
    descricao: string;
    valor: number;
    origem: string;
    status?: string;
    data_aprovacao?: string;
    responsavel?: string;
    observacoes?: string;
}) => {
    const { data, error } = await supabase
        .from('recursos')
        .insert([recurso])
        .select()
        .single();

    if (error) {
        console.error('Erro ao criar recurso:', error);
        throw error;
    }
    return data;
};

export const getDemandasTotais = async (origem?: string): Promise<number> => {
    let query = supabase
        .from('demandas')
        .select('*', { count: 'exact', head: true });

    if (origem) {
        query = query.eq('origem', origem);
    }

    const { count, error } = await query;

    if (error) {
        console.error('Erro ao contar demandas:', error);
        return 0;
    }
    return count || 0;
};
export const getDemandasByMunicipio = async (municipioId: string): Promise<Demanda[]> => {
    const { data, error } = await supabase
        .from('demandas')
        .select('*')
        .eq('municipio_id', municipioId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar demandas do município:', error);
        return [];
    }
    return data as Demanda[];
};

export const createDemanda = async (demanda: {
    municipio_id: string;
    titulo: string;
    descricao: string;
    tipo: string;
    status?: string;
    prioridade?: string;
    origem?: string;
    prazo?: string;
    solicitante?: string;
    recebido_por?: string;
    atribuido_a?: string;
    redirecionado_para?: string;
    area_responsavel?: string;
}) => {
    const { data, error } = await supabase
        .from('demandas')
        .insert([demanda])
        .select()
        .single();

    if (error) {
        console.error('Erro ao criar demanda:', error);
        throw error;
    }
    return data as Demanda;
};

export const getAllDemandas = async (): Promise<any[]> => {
    const { data, error } = await supabase
        .from('demandas')
        .select('*, municipios(nome, regiao)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar todas as demandas:', error);
        return [];
    }
    return data.map((d: any) => ({
        id: d.id,
        municipioId: d.municipio_id,
        titulo: d.titulo || d.descricao,
        descricao: d.descricao,
        tipo: d.tipo,
        status: d.status || 'Em Análise',
        prioridade: d.prioridade || 'Média',
        origem: d.origem,
        prazo: d.prazo,
        solicitante: d.solicitante || '',
        recebido_por: d.recebido_por || '',
        created_at: d.created_at,
        municipio_nome: d.municipios?.nome || 'Desconhecido',
        regiao: d.municipios?.regiao || '-',
    }));
};

export const updateDemanda = async (id: string, updates: {
    titulo?: string;
    descricao?: string;
    tipo?: string;
    status?: string;
    prioridade?: string;
    origem?: string;
    prazo?: string;
    municipio_id?: string;
    observacoes?: string;
    solicitante?: string;
    recebido_por?: string;
    atribuido_a?: string;
    redirecionado_para?: string;
    area_responsavel?: string;
    historico_redirecionamentos?: any[];
}) => {
    const { data, error } = await supabase
        .from('demandas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Erro ao atualizar demanda:', error);
        throw error;
    }
    return data;
};

// --- Integração Google Agenda (Edge Function) ---
export const getGoogleEvents = async (): Promise<EventoAgenda[]> => {
    try {
        const { data, error } = await supabase.functions.invoke('get-calendar');

        if (error) {
            console.error('Erro ao invocar Edge Function get-calendar:', error);
            throw error;
        }

        return data as EventoAgenda[];
    } catch (err) {
        console.error('Erro na chamada da agenda Google:', err);
        return [];
    }
};
