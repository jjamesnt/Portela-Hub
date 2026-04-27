import { supabase } from './supabaseClient';
import { MunicipioDetalhado, Lideranca, Assessor, EventoAgenda, Demanda, LiderancaLocal, Recurso, SolicitacaoAgenda, NotificationLog, Apoiador } from '../types';
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
    // Novos campos políticos
    statusPrefeito: m.status_prefeito,
    idene: m.idene,
    lincolnFechado: m.lincoln_fechado,
    statusAtendimento: m.status_atendimento,
    tipoAtendimento: m.tipo_atendimento,
    principalDemanda: m.principal_demanda,
    sugestaoSedese: m.sugestao_sedese,
    observacao: m.observacao,
    assessorId: m.assessor_id,
    votacaoAle: m.votacao_ale,
    votacaoLincoln: m.votacao_lincoln,
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
            demandas (count),
            apoiadores (count)
        `);

    if (error) {
        console.error('Erro ao buscar municípios:', error);
        return [];
    }

    return data.map(m => ({
        ...mapMunicipio(m),
        totalRecursos: m.recursos?.reduce((acc: number, r: any) => acc + (parseFloat(r.valor) || 0), 0) || 0,
        totalDemandas: m.demandas?.[0]?.count || 0,
        totalApoiadores: m.apoiadores?.[0]?.count || 0
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

export const updateMunicipio = async (id: string, updates: any): Promise<any> => {
    const { data, error } = await supabase
        .from('municipios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Erro ao atualizar município:', error);
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
    const { data: dbData, error } = await supabase
        .from('liderancas')
        .select('*');

    if (error) {
        console.error('Erro ao buscar lideranças do banco:', error);
        return [];
    }

    return (dbData || []).map(l => ({
        id: l.id,
        nome: l.nome,
        municipio: l.municipio_nome,
        regiao: l.regiao,
        partido: l.partido,
        cargo: l.cargo,
        contato: l.telefone,
        email: l.email,
        status: l.status,
        origem: l.origem,
        avatarUrl: l.avatar_url,
        endereco: l.endereco,
        latitude: l.latitude,
        longitude: l.longitude
    })) as Lideranca[];
};

export const upsertLideranca = async (lideranca: Partial<Lideranca>) => {
    // Se o ID não existir ou for uma string temporária (não-UUID), removemos para o Supabase gerar um novo
    const isNew = !lideranca.id || lideranca.id.length < 20;

    const dbData: any = {
        nome: lideranca.nome,
        municipio_nome: lideranca.municipio,
        regiao: lideranca.regiao,
        partido: lideranca.partido,
        cargo: lideranca.cargo,
        telefone: lideranca.contato,
        email: lideranca.email,
        status: lideranca.status,
        origem: lideranca.origem,
        avatar_url: lideranca.avatarUrl,
        endereco: lideranca.endereco,
        latitude: lideranca.latitude,
        longitude: lideranca.longitude
    };

    if (!isNew) {
        dbData.id = lideranca.id;
    }

    const { data, error } = await supabase
        .from('liderancas')
        .upsert([dbData], { onConflict: 'id' })
        .select()
        .single();

    if (error) {
        console.error('Erro ao salvar liderança:', error);
        throw error;
    }
    
    // Mapear de volta para o formato do Frontend
    return {
        ...lideranca,
        id: data.id,
        avatarUrl: data.avatar_url,
        municipio: data.municipio_nome
    } as Lideranca;
};

// --- Assessores ---
export const getAssessores = async (): Promise<Assessor[]> => {
    const { data: dbData, error } = await supabase
        .from('assessores')
        .select('*');

    if (error) {
        console.error('Erro ao buscar assessores do banco:', error);
        return [];
    }

    return (dbData || []).map(a => ({
        id: a.id,
        nome: a.nome,
        avatarUrl: a.avatar_url,
        cargo: a.cargo as any,
        regiaoAtuacao: a.regiao_atuacao,
        municipiosCobertos: a.municipios_cobertos || 0,
        liderancasGerenciadas: a.liderancas_gerenciadas || 0,
        latitude: a.latitude,
        longitude: a.longitude,
        origem: a.origem,
        telefone: a.telefone,
        email: a.email,
        endereco: a.endereco
    })) as Assessor[];
};

export const upsertAssessor = async (assessor: Partial<Assessor>) => {
    const isNew = !assessor.id || assessor.id.length < 20;

    const dbData: any = {
        nome: assessor.nome,
        avatar_url: assessor.avatarUrl,
        cargo: assessor.cargo,
        regiao_atuacao: assessor.regiaoAtuacao,
        municipios_cobertos: assessor.municipiosCobertos,
        liderancas_gerenciadas: assessor.liderancasGerenciadas,
        latitude: assessor.latitude,
        longitude: assessor.longitude,
        origem: assessor.origem,
        telefone: assessor.telefone,
        email: assessor.email,
        endereco: assessor.endereco
    };

    if (!isNew) {
        dbData.id = assessor.id;
    }

    const { data, error } = await supabase
        .from('assessores')
        .upsert([dbData], { onConflict: 'id' })
        .select()
        .single();

    if (error) {
        console.error('Erro ao salvar assessor:', error);
        throw error;
    }

    return {
        ...assessor,
        id: data.id,
        avatarUrl: data.avatar_url,
        regiaoAtuacao: data.regiao_atuacao
    } as Assessor;
};

export const deleteLideranca = async (id: string) => {
    // Nota: Como o sistema usa uma mistura de Mocks e DB, 
    // a exclusão real só ocorrerá se o ID existir no Supabase.
    const { error } = await supabase
        .from('liderancas')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erro ao deletar liderança:', error);
        throw error;
    }
};

export const deleteAssessor = async (id: string) => {
    const { error } = await supabase
        .from('assessores')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erro ao deletar assessor:', error);
        throw error;
    }
};

export const deleteDemanda = async (id: string) => {
    const { error } = await supabase
        .from('demandas')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erro ao deletar demanda:', error);
        throw error;
    }
};

export const deleteRecurso = async (id: string) => {
    const { error } = await supabase
        .from('recursos')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erro ao deletar recurso:', error);
        throw error;
    }
};

// --- Helper para Privacidade ---
const applyPrivacy = (event: any): EventoAgenda => {
    const rawTitle = event.titulo || event.summary || event.title || 'Sem título';
    const rawDesc = event.descricao || event.description || '';
    const rawLocal = event.local || event.location || 'Não informado';

    // Heurística de privacidade reforçada (case-insensitive)
    const textRes = (rawTitle + ' ' + rawDesc).toLowerCase();
    const isPrivate = event.privacidade === 'Particular' ||
        event.visibility === 'private' ||
        event.visibility === 'confidential' ||
        textRes.includes('privado') ||
        textRes.includes('particular');

    // Remove campos brutos que podem causar bypass na UI
    const { summary, description, location, visibility, title, ...cleanEvent } = event;

    if (isPrivate) {
        return {
            ...cleanEvent,
            titulo: '🔒 Reservado',
            local: 'Local Reservado',
            descricao: undefined,
            privacidade: 'Particular'
        } as EventoAgenda;
    }

    return {
        ...cleanEvent,
        titulo: rawTitle,
        local: rawLocal,
        descricao: rawDesc,
        privacidade: 'Público'
    } as EventoAgenda;
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

    // Normalização e aplicação de privacidade
    return (data || []).map(e => {
        const mapped = {
            ...e,
            data: e.data ? e.data.split('T')[0] : ''
        };
        return applyPrivacy(mapped);
    });
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
    return {
        ...data,
        data: data.data ? data.data.split('T')[0] : ''
    } as EventoAgenda;
};

export const updateEvento = async (id: string, evento: Partial<EventoAgenda>) => {
    const { data, error } = await supabase
        .from('agenda')
        .update(evento)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Erro ao atualizar evento:', error);
        throw error;
    }
    return {
        ...data,
        data: data.data ? data.data.split('T')[0] : ''
    } as EventoAgenda;
};

export const deleteEvento = async (id: string) => {
    const { error } = await supabase
        .from('agenda')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erro ao deletar evento:', error);
        throw error;
    }
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

export const updateSolicitacaoStatus = async (id: string, status: 'Aprovado' | 'Recusado') => {
    const { data, error } = await supabase
        .from('solicitacoes_agenda')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Erro ao atualizar status da solicitação:', error);
        throw error;
    }
    return data as SolicitacaoAgenda;
};

export const approveSolicitacao = async (solicitacaoId: string, eventData: Omit<EventoAgenda, 'id'>) => {
    // 1. Cria o evento oficial na agenda
    const newEvent = await createEvento(eventData);

    // 2. Atualiza o status da solicitação para 'Aprovado'
    const { error: updateError } = await supabase
        .from('solicitacoes_agenda')
        .update({ status: 'Aprovado' })
        .eq('id', solicitacaoId);

    if (updateError) {
        console.error('Erro ao atualizar status após aprovação:', updateError);
        throw updateError;
    }

    return newEvent;
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
        console.log("[API] Iniciando busca da Google Agenda...");

        // Timeout de 8 segundos para evitar travamento do Dashboard
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout na busca da Google Agenda')), 8000)
        );

        const fetchPromise = supabase.functions.invoke('get-calendar');

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        if (error) {
            console.error('Erro ao invocar Edge Function get-calendar:', error);
            return []; // Retorna lista vazia em vez de travar o app
        }

        const rawItems = Array.isArray(data) ? data : (data as any)?.items || [];

        return rawItems.map((e: any) => {
            // Parsing robusto e sensível ao fuso horário local
            let dataIso = '';
            let hora = '';

            // Prioriza o objeto estruturado 'start' vindo da nova versão da Edge Function (v6+)
            const startNode = e.start;

            if (startNode?.dateTime) {
                // Evento com horário (ISO String UTC)
                const dateObj = new Date(startNode.dateTime);
                if (!isNaN(dateObj.getTime())) {
                    // Convertemos para os componentes locais do navegador do usuário (Brasília -03:00)
                    dataIso = dateObj.getFullYear() + '-' +
                        String(dateObj.getMonth() + 1).padStart(2, '0') + '-' +
                        String(dateObj.getDate()).padStart(2, '0');

                    hora = String(dateObj.getHours()).padStart(2, '0') + ':' +
                        String(dateObj.getMinutes()).padStart(2, '0');
                }
            } else if (startNode?.date) {
                // Evento de dia inteiro
                dataIso = startNode.date;
                hora = 'Dia Inteiro';
            } else {
                // Fallback para campos legados ou outros formatos
                const fallbackStart = e.data || '';
                dataIso = typeof fallbackStart === 'string' ? fallbackStart.split('T')[0] : '';
                hora = e.hora || 'Dia Inteiro';
            }

            const baseEvent = {
                ...e,
                id: e.id || Math.random().toString(36).substr(2, 9),
                data: dataIso,
                hora: hora,
                origem: 'Google Calendar'
            };

            return applyPrivacy(baseEvent);
        });
    } catch (err) {
        console.error('Erro na chamada da agenda Google:', err);
        return [];
    }
};
// --- Notificações Twilio ---
export const broadcastEvent = async (params: {
    eventId: string;
    recipients: Array<{ id: string; phone: string; type: string }>;
    channel: 'whatsapp' | 'sms';
    message: string;
}) => {
    const { data, error } = await supabase.functions.invoke('twilio-broadcast', {
        body: params
    });

    if (error) {
        console.error('Erro ao disparar notificações:', error);
        throw error;
    }

    return data;
};

export const getNotificationLogs = async (eventId?: string): Promise<NotificationLog[]> => {
    let query = supabase
        .from('notification_logs')
        .select('*, agenda(titulo, data, hora, local)')
        .order('created_at', { ascending: false });

    if (eventId) {
        query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as any) || [];
};

// --- Apoiadores ---
export const getApoiadores = async (): Promise<Apoiador[]> => {
    const { data, error } = await supabase
        .from('apoiadores')
        .select('*, municipios(*)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar apoiadores:', error);
        return [];
    }
    return (data || []).map(a => ({
        id: a.id,
        municipioId: a.municipio_id,
        municipioNome: a.municipios?.nome,
        municipio: a.municipios ? mapMunicipio(a.municipios) : undefined,
        nome: a.nome,
        cargo: a.cargo,
        telefone: a.telefone,
        endereco: a.endereco,
        email: a.email,
        fotoUrl: a.foto_url,
        createdAt: a.created_at
    })) as any[];
};

export const getApoiadoresByMunicipio = async (municipioId: string): Promise<Apoiador[]> => {
    const { data, error } = await supabase
        .from('apoiadores')
        .select('*, municipios(*)')
        .eq('municipio_id', municipioId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar apoiadores do município:', error);
        return [];
    }
    return (data || []).map(a => ({
        id: a.id,
        municipioId: a.municipio_id,
        municipio: a.municipios ? mapMunicipio(a.municipios) : undefined,
        nome: a.nome,
        cargo: a.cargo,
        telefone: a.telefone,
        endereco: a.endereco,
        email: a.email,
        fotoUrl: a.foto_url,
        createdAt: a.created_at
    })) as Apoiador[];
};

export const getApoiadorById = async (id: string): Promise<Apoiador | undefined> => {
    const { data, error } = await supabase
        .from('apoiadores')
        .select(`
            *,
            municipios:municipio_id (
                *,
                assessor:assessor_id (
                    id,
                    nome
                )
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Erro ao buscar apoiador ${id}:`, error);
        return undefined;
    }

    const municipioMapped = data.municipios ? mapMunicipio(data.municipios) : undefined;
    const assessor = data.municipios?.assessor;

    return {
        id: data.id,
        municipioId: data.municipio_id,
        municipioNome: data.municipios?.nome,
        municipio: municipioMapped,
        assessor: assessor,
        nome: data.nome,
        cargo: data.cargo,
        telefone: data.telefone,
        endereco: data.endereco,
        email: data.email,
        fotoUrl: data.foto_url,
        createdAt: data.created_at
    } as any;
};

export const upsertApoiador = async (apoiador: Partial<Apoiador>) => {
    const isNew = !apoiador.id || apoiador.id.length < 20;

    const dbData: any = {
        municipio_id: apoiador.municipioId,
        nome: apoiador.nome,
        cargo: apoiador.cargo,
        telefone: apoiador.telefone,
        endereco: apoiador.endereco,
        email: apoiador.email,
        foto_url: apoiador.fotoUrl,
    };

    if (!isNew) {
        dbData.id = apoiador.id;
    }

    const { data, error } = await supabase
        .from('apoiadores')
        .upsert([dbData], { onConflict: 'id' })
        .select()
        .single();

    if (error) {
        console.error('Erro ao salvar apoiador:', error);
        throw error;
    }

    return {
        ...apoiador,
        id: data.id,
        municipioId: data.municipio_id,
        fotoUrl: data.foto_url,
        createdAt: data.created_at
    } as Apoiador;
};

export const deleteApoiador = async (id: string) => {
    const { error } = await supabase
        .from('apoiadores')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erro ao deletar apoiador:', error);
        throw error;
    }
};

// --- Sincronização ---

const deepNormalize = (s: string) => {
    return (s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/\./g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

export const syncSpreadsheetData = async (csvUrl: string): Promise<{ success: number, errors: number }> => {
    console.log('[Sync] Iniciando sincronização via CSV:', csvUrl);
    
    try {
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error('Não foi possível carregar a planilha. Verifique se o link está correto e publicado como CSV.');
        
        const csvText = await response.text();
        const rows = parseCSV(csvText);
        
        // 1. Mapear assessores para IDs
        const assessores = await getAssessores();
        const assessorMap: Record<string, string> = {};
        assessores.forEach(a => assessorMap[a.nome.toLowerCase().trim()] = a.id);

        // 2. Mapear Municípios existentes
        const { data: allMunicipios, error: munError } = await supabase
            .from('municipios')
            .select('id, nome');
        
        if (munError) throw new Error('Erro ao buscar lista de municípios: ' + munError.message);
        
        const municipioMap: Record<string, { id: string, nome: string }> = {};
        allMunicipios.forEach(m => {
            municipioMap[deepNormalize(m.nome)] = { id: m.id, nome: m.nome };
        });

        // 3. Mapear Apoiadores existentes para evitar duplicidade
        const { data: allApoiadores, error: apoError } = await supabase
            .from('apoiadores')
            .select('id, nome, municipio_id');
        
        if (apoError) throw new Error('Erro ao buscar lista de apoiadores: ' + apoError.message);

        const existingApoiadorMap: Record<string, string> = {};
        allApoiadores.forEach(a => {
            const key = `${a.municipio_id}_${a.nome.toLowerCase().trim()}`;
            existingApoiadorMap[key] = a.id;
        });

        const normalize = deepNormalize;

        // --- NOVO: Coletar e Criar Assessores faltantes ---
        const spreadsheetAssessorNames = new Set<string>();
        rows.forEach(row => {
            const val = row[Object.keys(row).find(k => normalize(k) === 'assessor resp') || ''];
            if (val && typeof val === 'string' && val.trim().length > 1) {
                let name = val.trim();
                if (normalize(name) === 'deputada') name = 'Alê Portela';
                spreadsheetAssessorNames.add(name);
            }
        });

        for (const name of spreadsheetAssessorNames) {
            const normName = normalize(name);
            // Verifica se existe no assessorMap (DB)
            const exists = Object.keys(assessorMap).some(k => k === normName || k.includes(normName) || normName.includes(k));
            
            if (!exists) {
                console.log(`[Sync] Criando assessor faltante: ${name}`);
                const { data: newAssessor, error: assInsError } = await supabase
                    .from('assessores')
                    .insert([{ 
                        nome: name, 
                        cargo: 'Assessor Regional', 
                        origem: 'Alê Portela',
                        avatar_url: 'https://via.placeholder.com/150'
                    }])
                    .select()
                    .single();
                
                if (!assInsError && newAssessor) {
                    assessorMap[normalize(name)] = newAssessor.id;
                }
            }
        }

        let errorCount = 0;
        const municipioUpdates = new Map<string, any>();
        const apoiadorUpdates = new Map<string, any>();

        const parseNum = (s: any) => {
            if (typeof s !== 'string') return parseInt(s) || 0;
            const clean = s.replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.]/g, '');
            return parseInt(clean) || 0;
        };

        const isSim = (val: any) => {
            const s = String(val || '').toLowerCase();
            return s === 'sim' || s === 's' || s === 'true' || s === 'x';
        };

        // 4. Processar cada linha
        for (const row of rows) {
            const getCol = (name: string) => {
                const normName = normalize(name);
                const key = Object.keys(row).find(k => normalize(k) === normName);
                return key ? row[key] : null;
            };

            const cidade = getCol("Cidade");
            const nomeBruto = getCol("Nome apoiador");
            if (!cidade || !nomeBruto) continue;

            const mun = municipioMap[deepNormalize(cidade)];
            if (!mun) {
                errorCount++;
                continue;
            }

            // A) Vincular Assessor
            let assessorNome = getCol("Assessor Resp");
            if (assessorNome && normalize(assessorNome) === 'deputada') assessorNome = 'Alê Portela';
            
            let assessorId = null;
            if (assessorNome) {
                const normSearch = normalize(assessorNome);
                // Busca exata ou parcial no mapa atualizado
                const matchKey = Object.keys(assessorMap).find(k => k === normSearch || k.includes(normSearch) || normSearch.includes(k));
                assessorId = matchKey ? assessorMap[matchKey] : null;
            }

            municipioUpdates.set(mun.id, {
                id: mun.id,
                nome: mun.nome,
                status_prefeito: getCol("Status do Prefeito"),
                votacao_ale: parseNum(getCol("Votação Alê")),
                votacao_lincoln: parseNum(getCol("Votação Lincoln")),
                idene: isSim(getCol("IDENE?")),
                lincoln_fechado: isSim(getCol("Lincoln Portela")) || isSim(getCol("Lincoln Portela fechado?")),
                status_atendimento: getCol("Status de atendimento"),
                tipo_atendimento: getCol("Tipo de atendimento"),
                principal_demanda: getCol("Principal Demanda"),
                sugestao_sedese: getCol("Sugestão de Programa SEDESE"),
                observacao: getCol("OBSERVAÇÃO"),
                assessor_id: assessorId
            });

            // B) Preparar dados do Apoiador
            let nomeSemCargo = nomeBruto;
            let cargoDetectado = '';
            const cargosPrefixos = ["Vereador ", "Vereadora ", "Vice-Prefeito ", "Vice-Prefeita ", "Prefeito ", "Prefeita ", "Liderança ", "Candidato ", "Candidata "];
            
            for (const prefix of cargosPrefixos) {
                if (nomeBruto.toLowerCase().startsWith(prefix.toLowerCase())) {
                    cargoDetectado = prefix.trim();
                    nomeSemCargo = nomeBruto.substring(prefix.length).trim();
                    break;
                }
            }

            const apoiadorKey = `${mun.id}_${nomeSemCargo.toLowerCase().trim()}`;
            const existingId = existingApoiadorMap[apoiadorKey];

            apoiadorUpdates.set(apoiadorKey, {
                ...(existingId ? { id: existingId } : {}),
                municipio_id: mun.id,
                nome: nomeSemCargo,
                cargo: cargoDetectado || getCol("Cargo") || '',
            });
        }

        // 5. Execuções em Bloco
        const municipioList = Array.from(municipioUpdates.values());
        const apoiadorList = Array.from(apoiadorUpdates.values());

        console.log(`[Sync] Sincronizando ${municipioList.length} municípios e ${apoiadorList.length} apoiadores...`);
        const promessas = [];
        if (municipioList.length > 0) promessas.push(supabase.from('municipios').upsert(municipioList));
        if (apoiadorList.length > 0) promessas.push(supabase.from('apoiadores').upsert(apoiadorList));

        const resultados = await Promise.all(promessas);
        const erroSync = resultados.find(r => r.error);
        if (erroSync) throw new Error('Erro ao salvar no banco: ' + erroSync.error.message);

        return { success: apoiadorList.length, errors: errorCount };
    } catch (err) {
        console.error('[Sync] Erro crítico:', err);
        throw err;
    }
};

// Helper simples para parsear CSV (considerando vírgulas e aspas)
function parseCSV(text: string) {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const results = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Regex simplificado para colunas separadas por vírgula, lidando com aspas
        const values = [];
        let start = 0;
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
            if (line[j] === '"') inQuotes = !inQuotes;
            if (line[j] === ',' && !inQuotes) {
                values.push(line.substring(start, j).trim().replace(/^"|"$/g, ''));
                start = j + 1;
            }
        }
        values.push(line.substring(start).trim().replace(/^"|"$/g, ''));
        
        const row: any = {};
        headers.forEach((h, idx) => {
            row[h] = values[idx] || '';
        });
        results.push(row);
    }
    return results;
}
