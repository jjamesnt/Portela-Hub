
import { MunicipioDetalhado } from '../types';

export const mockMunicipios: MunicipioDetalhado[] = [
  {
    id: 'bh',
    nome: 'Belo Horizonte',
    regiao: 'Metropolitana',
    populacao: 2521564,
    idh: 0.810,
    pibPerCapita: 38643.51,
    codigoIBGE: '3106200',
    influencia: 85,
    liderancasAtivas: 412,
    statusAtividade: 'Consolidado',
    demandas: [
      { id: '#BH-102', descricao: 'Reforma Escola Municipal Sagrada Família', subdescricao: 'Secretaria de Obras • 2024.01.22', status: 'Em Análise', prioridade: 'Alta', origem: 'Lincoln Portela' },
      { id: '#BH-098', descricao: 'Iluminação LED - Venda Nova', subdescricao: 'Ofício Gabinete 044/2024', status: 'Em Execução', prioridade: 'Média', origem: 'Lincoln Portela' },
    ],
    liderancas: [
      { nome: 'Fuad Noman', partido: 'PSD', cargo: 'Prefeito', avatarInitials: 'FN' },
      { nome: 'Gabriel Azevedo', partido: 'MDB', cargo: 'Vereador', avatarInitials: 'GA' },
    ],
  },
  {
    id: 'uberlandia',
    nome: 'Uberlândia',
    regiao: 'Triângulo Mineiro',
    populacao: 706597,
    idh: 0.789,
    pibPerCapita: 45321.80,
    codigoIBGE: '3170206',
    influencia: 65,
    liderancasAtivas: 256,
    statusAtividade: 'Expansão',
    demandas: [
      { id: '#UDI-034', descricao: 'Verba para Hospital Municipal', subdescricao: 'Secretaria de Saúde • 2024.02.15', status: 'Em Análise', prioridade: 'Alta', origem: 'Alê Portela' },
    ],
    liderancas: [
      { nome: 'Odelmo Leão', partido: 'PP', cargo: 'Prefeito', avatarInitials: 'OL' },
    ],
  },
  {
    id: 'juiz-de-fora',
    nome: 'Juiz de Fora',
    regiao: 'Zona da Mata',
    populacao: 577532,
    idh: 0.778,
    pibPerCapita: 31254.90,
    codigoIBGE: '3136702',
    influencia: 45,
    liderancasAtivas: 188,
    statusAtividade: 'Manutenção',
    demandas: [
      { id: '#JF-051', descricao: 'Calçamento de ruas no Bairro Industrial', subdescricao: 'Ofício Gabinete 102/2024', status: 'Em Execução', prioridade: 'Média', origem: 'Lincoln Portela' },
    ],
    liderancas: [
      { nome: 'Margarida Salomão', partido: 'PT', cargo: 'Prefeito', avatarInitials: 'MS' },
    ],
  },
  {
    id: 'montes-claros',
    nome: 'Montes Claros',
    regiao: 'Norte de Minas',
    populacao: 417478,
    idh: 0.770,
    pibPerCapita: 25432.10,
    codigoIBGE: '3143302',
    influencia: 55,
    liderancasAtivas: 210,
    statusAtividade: 'Expansão',
    demandas: [
      { id: '#MOC-022', descricao: 'Ampliação de saneamento básico', subdescricao: 'Secretaria de Infraestrutura • 2023.11.20', status: 'Concluída', prioridade: 'Baixa', origem: 'Alê Portela' },
    ],
    liderancas: [
      { nome: 'Humberto Souto', partido: 'CIDADANIA', cargo: 'Prefeito', avatarInitials: 'HS' },
    ],
  },
  {
    id: 'contagem',
    nome: 'Contagem',
    regiao: 'Metropolitana',
    populacao: 673849,
    idh: 0.756,
    pibPerCapita: 48954.20,
    codigoIBGE: '3118601',
    influencia: 75,
    liderancasAtivas: 350,
    statusAtividade: 'Consolidado',
    demandas: [
      { id: '#CON-088', descricao: 'Construção de nova UPA', subdescricao: 'Secretaria de Saúde • 2024.03.10', status: 'Em Análise', prioridade: 'Alta', origem: 'Alê Portela' },
    ],
    liderancas: [
      { nome: 'Marília Campos', partido: 'PT', cargo: 'Prefeito', avatarInitials: 'MC' },
    ],
  }
];
