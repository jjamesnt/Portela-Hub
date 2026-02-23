
import { EventoAgenda } from '../types';

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;

const formatData = (day: number) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export const mockAgenda: EventoAgenda[] = [
    { id: 'E001', titulo: 'Reunião com Prefeito de BH', data: formatData(3), hora: '09:00', tipo: 'Reunião', local: 'Belo Horizonte / MG', origem: 'Alê Portela' },
    { id: 'E002', titulo: 'Visita Técnica Hospitalar', data: formatData(5), hora: '11:30', tipo: 'Visita Técnica', local: 'Contagem / MG', origem: 'Alê Portela' },
    { id: 'E003', titulo: 'Encontro de Lideranças', data: formatData(5), hora: '14:00', tipo: 'Evento Público', local: 'Betim / MG', origem: 'Alê Portela' },
    { id: 'E004', titulo: 'Sessão Plenária', data: formatData(8), hora: '16:30', tipo: 'Sessão Plenária', local: 'ALMG', origem: 'Alê Portela' },
    { id: 'E005', titulo: 'Alinhamento com Assessores', data: formatData(12), hora: '10:00', tipo: 'Reunião', local: 'Gabinete', origem: 'Alê Portela' },
    { id: 'E006', titulo: 'Inauguração de Creche', data: formatData(17), hora: '15:00', tipo: 'Evento Público', local: 'Uberlândia / MG', origem: 'Alê Portela' },
    { id: 'E007', titulo: 'Debate sobre Saneamento', data: formatData(22), hora: '19:00', tipo: 'Evento Público', local: 'Juiz de Fora / MG', origem: 'Alê Portela' },
    { id: 'E008', titulo: 'Reunião com Sec. de Obras', data: formatData(25), hora: '11:00', tipo: 'Reunião', local: 'Gabinete', origem: 'Alê Portela' },
];
