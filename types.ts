
import React from 'react';

// General Types
export interface AppFilters {
    regiao: string;
    assessor: string;
    municipio: string;
}

export type Theme = 'light' | 'dark';

export interface AppContextType {
    filters: AppFilters;
    setFilters: React.Dispatch<React.SetStateAction<AppFilters>>;
    theme: Theme;
    toggleTheme: () => void;
    selectedMandato: string;
    setSelectedMandato: (mandato: string) => void;
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

export interface Municipio {
    id: string;
    nome: string;
    codigoIBGE: string;
    regiao: string;
    influencia: number;
    populacao?: number;
    liderancasAtivas: number;
    statusAtividade: 'Consolidado' | 'Expansão' | 'Manutenção' | 'Atenção';
    totalRecursos?: number;
    totalDemandas?: number;
    latitude?: number;
    longitude?: number;
}


// Municipality Details Types
export interface Demanda {
    id: string;
    descricao: string;
    subdescricao: string;
    status: 'Em Análise' | 'Em Execução' | 'Concluída';
    prioridade: 'Alta' | 'Média' | 'Baixa';
    origem: 'Alê Portela' | 'Lincoln Portela' | 'Marilda Portela';
}

export interface LiderancaLocal {
    nome: string;
    partido: string;
    cargo: 'Prefeito' | 'Vereador' | 'Vice-Prefeito' | 'Liderança Comunitária';
    avatarInitials: string;
    origem?: 'Alê Portela' | 'Lincoln Portela' | 'Marilda Portela';
}


export interface MunicipioDetalhado extends Municipio {
    populacao: number;
    idh: number;
    pibPerCapita: number;
    demandas: Demanda[];
    liderancas: LiderancaLocal[];
}

// New Types for Expansion
export interface Lideranca {
    id: string;
    nome: string;
    municipio: string;
    regiao: string;
    partido: string;
    cargo: LiderancaLocal['cargo'];
    contato: string;
    email?: string;
    status: 'Ativo' | 'Inativo';
    origem: 'Alê Portela' | 'Lincoln Portela' | 'Marilda Portela';
    avatarUrl?: string;
    endereco?: {
        logradouro: string;
        numero: string;
        bairro: string;
        cidade: string;
        uf: string;
        cep: string;
    };
    latitude?: number;
    longitude?: number;
}

export interface Assessor {
    id: string;
    nome: string;
    avatarUrl: string;
    cargo: 'Coordenador Político' | 'Assessor Regional' | 'Chefe de Gabinete';
    regiaoAtuacao: string;
    municipiosCobertos: number;
    liderancasGerenciadas: number;
    origem: 'Alê Portela' | 'Lincoln Portela' | 'Marilda Portela';
    telefone?: string;
    email?: string;
    endereco?: {
        logradouro: string;
        numero: string;
        bairro: string;
        cidade: string;
        uf: string;
        cep: string;
    };
    latitude?: number;
    longitude?: number;
}

export interface EventoAgenda {
    id: string;
    titulo: string;
    data: string; // YYYY-MM-DD
    hora: string; // HH:mm
    tipo: 'Reunião' | 'Visita Técnica' | 'Evento Público' | 'Sessão Plenária';
    origem: 'Alê Portela' | 'Lincoln Portela' | 'Marilda Portela' | 'Google Calendar';

    local: string;
    descricao?: string;
}

export interface Recurso {
    id: string;
    municipioId: string;
    tipo: string; // Permitir múltiplos tipos separados por vírgula
    descricao: string;
    valor: number;
    origem: 'Alê Portela' | 'Lincoln Portela' | 'Marilda Portela';
    status: 'Aprovado' | 'Em Execução' | 'Concluído';
    dataAprovacao: string;
    responsavel: string;
    observacoes?: string;
}

export interface IBGEIndicator {
    id: number;
    posicao: string;
    valor: string;
}

export interface FormattedIBGEData {
    populacao: string;
    pibPerCapita: string;
    area: string;
    densidade: string;
    pibTotal?: string;
}

export interface SolicitacaoAgenda {
    id: string;
    solicitante: string;
    titulo: string;
    descricao?: string;
    data: string; // YYYY-MM-DD
    hora_inicio: string; // HH:mm
    hora_fim: string; // HH:mm
    local: string;
    estimativa_publico?: number;
    assessor_responsavel?: string;
    tipo_evento?: 'Evento formal (dispositivo de honra)' | 'Encontro' | 'Reunião';
    tipo_local?: 'Igreja' | 'Casa/Apto' | 'Evento de rua';
    tempo_participacao?: string;
    horario_chegada?: string;
    data_aprovacao?: string; // YYYY-MM-DD
    status: 'Pendente' | 'Aprovado' | 'Recusado';
    origem: string;
    municipio_id?: string;
    created_at?: string;
}
