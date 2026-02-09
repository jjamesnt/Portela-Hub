import { supabase } from './supabaseClient';
import { MunicipioDetalhado, Lideranca, Assessor, EventoAgenda, Demanda, LiderancaLocal, Recurso } from '../types';

// Helper to map snake_case to CamelCase for Municipality
const mapMunicipio = (m: any) => ({
    id: m.id,
    nome: m.nome,
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
    const { data, error } = await supabase
        .from('municipios')
        .select(`
            *,
            recursos (valor),
            demandas (id)
        `);

    if (error) {
        console.error('Erro ao buscar municípios:', error);
        return [];
    }

    return data.map(m => ({
        ...mapMunicipio(m),
        totalRecursos: m.recursos?.reduce((acc: number, r: any) => acc + (parseFloat(r.valor) || 0), 0) || 0,
        totalDemandas: m.demandas?.length || 0
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
    const { data, error } = await supabase
        .from('liderancas')
        .select('*');

    if (error) {
        console.error('Erro ao buscar lideranças:', error);
        return [];
    }
    return data.map(l => ({
        ...l,
        municipio: l.municipio_nome
    })) as Lideranca[];
};

// --- Assessores ---
export const getAssessores = async (): Promise<Assessor[]> => {
    const { data, error } = await supabase
        .from('assessores')
        .select('*');

    if (error) {
        console.error('Erro ao buscar assessores:', error);
        return [];
    }
    return data.map(a => ({
        id: a.id,
        nome: a.nome,
        avatarUrl: '', // Assessores não têm avatar no banco atual
        cargo: 'Assessor Regional' as const,
        regiaoAtuacao: a.regiao_atuacao,
        municipiosCobertos: a.municipios_cobertos || 0,
        liderancasGerenciadas: a.liderancas_gerenciadas || 0
    })) as Assessor[];
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
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar todos os recursos:', error);
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
