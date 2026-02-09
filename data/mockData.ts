
import { MunicipioDetalhado } from '../types';

export const mockMunicipios: MunicipioDetalhado[] = [
  {
    id: 'bh',
    nome: 'Belo Horizonte',
    regiao: 'Metropolitana',
    populacao: 2521564,
    idh: 0.810,
    pibPerCapita: 38643.51,
    influencia: 85,
    liderancasAtivas: 412,
    statusAtividade: 'Consolidado',
    eleitorado: {
      total: 1943184,
      votos: {
        2022: { 'Deputada Estadual': 154218, 'Deputada Federal': 140112, 'Governador': 160345 },
        2020: { 'Deputada Estadual': 142333, 'Deputada Federal': 130543, 'Governador': 145898 },
        2018: { 'Deputada Estadual': 142643, 'Deputada Federal': 129876, 'Governador': 150123 },
      },
      genero: { feminino: 0.54, masculino: 0.46 },
    },
    demandas: [
      { id: '#BH-102', descricao: 'Reforma Escola Municipal Sagrada Família', subdescricao: 'Secretaria de Obras • 2024.01.22', status: 'Em Análise', prioridade: 'Alta' },
      { id: '#BH-098', descricao: 'Iluminação LED - Venda Nova', subdescricao: 'Ofício Gabinete 044/2024', status: 'Em Execução', prioridade: 'Média' },
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
    influencia: 65,
    liderancasAtivas: 256,
    statusAtividade: 'Expansão',
    eleitorado: {
      total: 501234,
      votos: {
        2022: { 'Deputada Estadual': 12450, 'Deputada Federal': 11345, 'Governador': 13980 },
        2020: { 'Deputada Estadual': 11050, 'Deputada Federal': 10200, 'Governador': 12500 },
        2018: { 'Deputada Estadual': 10500, 'Deputada Federal': 9800, 'Governador': 11000 },
      },
      genero: { feminino: 0.52, masculino: 0.48 },
    },
    demandas: [
      { id: '#UDI-034', descricao: 'Verba para Hospital Municipal', subdescricao: 'Secretaria de Saúde • 2024.02.15', status: 'Em Análise', prioridade: 'Alta' },
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
    influencia: 45,
    liderancasAtivas: 188,
    statusAtividade: 'Manutenção',
    eleitorado: {
      total: 410987,
      votos: {
        2022: { 'Deputada Estadual': 8970, 'Deputada Federal': 8123, 'Governador': 9543 },
        2020: { 'Deputada Estadual': 7500, 'Deputada Federal': 7100, 'Governador': 8200 },
        2018: { 'Deputada Estadual': 7100, 'Deputada Federal': 6800, 'Governador': 7900 },
      },
      genero: { feminino: 0.55, masculino: 0.45 },
    },
    demandas: [
      { id: '#JF-051', descricao: 'Calçamento de ruas no Bairro Industrial', subdescricao: 'Ofício Gabinete 102/2024', status: 'Em Execução', prioridade: 'Média' },
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
    influencia: 55,
    liderancasAtivas: 210,
    statusAtividade: 'Expansão',
    eleitorado: {
        total: 289123,
        votos: {
            2022: { 'Deputada Estadual': 9500, 'Deputada Federal': 8800, 'Governador': 10100 },
            2020: { 'Deputada Estadual': 8200, 'Deputada Federal': 7500, 'Governador': 9000 },
            2018: { 'Deputada Estadual': 7800, 'Deputada Federal': 7100, 'Governador': 8500 },
        },
        genero: { feminino: 0.53, masculino: 0.47 },
    },
    demandas: [
        { id: '#MOC-022', descricao: 'Ampliação de saneamento básico', subdescricao: 'Secretaria de Infraestrutura • 2023.11.20', status: 'Concluída', prioridade: 'Baixa' },
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
    influencia: 75,
    liderancasAtivas: 350,
    statusAtividade: 'Consolidado',
    eleitorado: {
        total: 450123,
        votos: {
            2022: { 'Deputada Estadual': 18500, 'Deputada Federal': 17200, 'Governador': 20300 },
            2020: { 'Deputada Estadual': 16900, 'Deputada Federal': 15800, 'Governador': 18500 },
            2018: { 'Deputada Estadual': 15500, 'Deputada Federal': 14500, 'Governador': 17000 },
        },
        genero: { feminino: 0.53, masculino: 0.47 },
    },
    demandas: [
        { id: '#CON-088', descricao: 'Construção de nova UPA', subdescricao: 'Secretaria de Saúde • 2024.03.10', status: 'Em Análise', prioridade: 'Alta' },
    ],
    liderancas: [
        { nome: 'Marília Campos', partido: 'PT', cargo: 'Prefeito', avatarInitials: 'MC' },
    ],
  }
];
