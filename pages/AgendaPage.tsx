import React, { useState, useEffect, useMemo, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { getAgendaEventos, getSolicitacoesAgenda, getGoogleEvents } from '../services/api';
import { EventoAgenda, SolicitacaoAgenda } from '../types';
import Loader from '../components/Loader';
import AgendaModal from '../components/AgendaModal';
import AgendaSolicitacaoModal from '../components/AgendaSolicitacaoModal';

interface AgendaPageProps {
    navigateTo: (page: string, params?: { [key: string]: any }) => void;
}

const AgendaPage: React.FC<AgendaPageProps> = ({ navigateTo }) => {
    const [eventos, setEventos] = useState<EventoAgenda[]>([]);
    const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAgenda[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const calendarRef = useRef<FullCalendar>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [eventosData, solicitacoesData, googleEventsData] = await Promise.all([
                getAgendaEventos(),
                getSolicitacoesAgenda(),
                getGoogleEvents()
            ]);
            setEventos([...eventosData, ...googleEventsData]);
            setSolicitacoes(solicitacoesData);
            setError(null);
        } catch (err) {
            setError("Falha ao carregar dados da agenda.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const tipoStyle = (tipo: string | undefined): string => {
        switch (tipo) {
            case 'Reunião': return '#3b82f6'; // blue-500
            case 'Visita Técnica': return '#f59e0b'; // amber-500
            case 'Evento Público': return '#10b981'; // emerald-500
            case 'Sessão Plenária': return '#a855f7'; // purple-500
            case 'Google Calendar': return '#f43f5e'; // rose-500
            default: return '#64748b'; // slate-500
        }
    };

    const calendarEvents = useMemo(() => {
        const officialEvents = eventos.map(e => {
            // Heurística de privacidade redundante para segurança absoluta
            const hasPrivateKeyword = (e.titulo + ' ' + (e.descricao || '')).toLowerCase().includes('privado') ||
                (e.titulo + ' ' + (e.descricao || '')).toLowerCase().includes('particular');
            const isPrivate = e.privacidade === 'Particular' || hasPrivateKeyword;

            // Validação de horário para FullCalendar
            const isTimeFormat = /^([01]\d|2[0-3]):([0-5]\d)$/.test(e.hora || '');
            const startTime = isTimeFormat ? `${e.data}T${e.hora}` : e.data;

            return {
                id: e.id,
                title: isPrivate ? "🔒 Reservado" : e.titulo,
                start: startTime,
                allDay: !isTimeFormat,
                backgroundColor: isPrivate ? '#64748b' : (e.origem === 'Google Calendar' ? tipoStyle('Google Calendar') : tipoStyle(e.tipo)),
                borderColor: 'transparent',
                className: isPrivate ? 'fc-event-private italic opacity-75' : '',
                extendedProps: {
                    ...e,
                    descricao: isPrivate ? undefined : e.descricao,
                    local: isPrivate ? undefined : e.local,
                    source: 'official'
                }
            };
        });

        const approvedSol = solicitacoes
            .filter(s => s.status === 'Aprovado')
            .map(s => ({
                id: s.id,
                title: `[REQ] ${s.titulo}`,
                start: s.hora_inicio ? `${s.data}T${s.hora_inicio}` : s.data,
                end: s.hora_fim ? `${s.data}T${s.hora_fim}` : undefined,
                backgroundColor: '#0ea5e9', // sky-500
                borderColor: 'transparent',
                extendedProps: {
                    ...s,
                    source: 'solicitation'
                }
            }));

        return [...officialEvents, ...approvedSol];
    }, [eventos, solicitacoes]);

    const handleDateClick = (arg: any) => {
        setSelectedDate(arg.dateStr);
        setIsEventModalOpen(true);
    };

    const handleEventClick = (arg: any) => {
        setSelectedEvent(arg.event);
        setIsDetailsModalOpen(true);
    };

    return (
        <div className="p-4 md:p-8 pb-24 md:pb-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 md:mb-8 text-left">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-navy-dark dark:text-white">Agenda Hub</h2>
                    <p className="text-xs md:text-base text-slate-500 dark:text-slate-400">Sincronização completa com Google e Mandatos.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setIsRequestModalOpen(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-lg text-turquoise">add_task</span>
                        Solicitar
                    </button>
                    <button
                        onClick={() => {
                            setSelectedDate(new Date().toISOString().split('T')[0]);
                            setIsEventModalOpen(true);
                        }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-5 py-2.5 bg-turquoise text-white rounded-xl text-xs md:text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-turquoise/20"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        Novo
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 md:p-6 mb-8 overflow-hidden fc-theme-hub">
                {isLoading ? (
                    <div className="h-[600px] flex items-center justify-center">
                        <Loader />
                    </div>
                ) : error ? (
                    <div className="h-[600px] flex flex-col items-center justify-center text-red-500 space-y-4">
                        <span className="material-symbols-outlined text-5xl font-light">error</span>
                        <p className="font-bold">{error}</p>
                        <button onClick={fetchData} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold">Tentar novamente</button>
                    </div>
                ) : (
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,listWeek'
                        }}
                        locale={ptBrLocale}
                        events={calendarEvents}
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        height="auto"
                        stickyHeaderDates={true}
                        dayMaxEvents={true}
                        nowIndicator={true}
                        eventTimeFormat={{
                            hour: '2-digit',
                            minute: '2-digit',
                            meridiem: false
                        }}
                        buttonText={{
                            today: 'Hoje',
                            month: 'Mês',
                            week: 'Semana',
                            day: 'Dia',
                            list: 'Lista'
                        }}
                    />
                )}
            </div>

            {/* Modal de Detalhes Customizado */}
            {isDetailsModalOpen && selectedEvent && (
                <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                        <div className={`h-24 p-6 flex items-end relative ${selectedEvent.extendedProps.privacidade === 'Particular' ? 'bg-gradient-to-r from-slate-400 to-slate-600' : 'bg-gradient-to-r from-turquoise to-emerald-400'}`}>
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest">
                                {selectedEvent.extendedProps.privacidade === 'Particular' ? 'Privado' : (selectedEvent.extendedProps.tipo || 'Compromisso')}
                            </span>
                        </div>
                        <div className="p-6 md:p-8 space-y-6">
                            <div>
                                <h3 className="text-xl font-black text-navy-dark dark:text-white leading-tight">
                                    {selectedEvent.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-2 text-slate-500 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                    <span className="text-xs font-bold">
                                        {selectedEvent.start.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        {selectedEvent.allDay ? ' (Dia todo)' : ` às ${selectedEvent.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                                    </span>
                                </div>
                            </div>

                            {selectedEvent.extendedProps.privacidade === 'Particular' ? (
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-400">lock</span>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 italic font-medium">
                                        Compromisso particular. Os detalhes estão ocultos para sua privacidade.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {selectedEvent.extendedProps.descricao && (
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                {selectedEvent.extendedProps.descricao}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-4">
                                        {selectedEvent.extendedProps.local && (
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                <div className="size-8 rounded-full bg-turquoise/10 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-turquoise text-lg">location_on</span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Local</p>
                                                    <p className="text-xs font-bold text-navy-dark dark:text-white truncate">{selectedEvent.extendedProps.local}</p>
                                                </div>
                                                <button
                                                    onClick={() => navigateTo('Municipios')}
                                                    className="px-3 py-1.5 bg-turquoise text-white rounded-lg text-xs font-extrabold hover:brightness-110 transition-all shadow-lg shadow-turquoise/20"
                                                >
                                                    Ver no Mapa
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Origem:</span>
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                        {selectedEvent.extendedProps.origem || 'Interno'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsDetailsModalOpen(false)}
                                    className="text-xs font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Histórico de Solicitações - RESTAURADO */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-navy-dark dark:text-white">history</span>
                        <h3 className="font-black text-sm text-navy-dark dark:text-white uppercase tracking-wider">Histórico de Solicitações</h3>
                    </div>
                </div>
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
                        <thead>
                            <tr className="bg-slate-50/30 dark:bg-slate-900/10">
                                <th className="px-4 md:px-6 py-3 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Solicitante</th>
                                <th className="px-4 md:px-6 py-3 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Compromisso</th>
                                <th className="px-4 md:px-6 py-3 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Data/Hora</th>
                                <th className="px-4 md:px-6 py-3 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Status</th>
                                <th className="px-4 md:px-6 py-3 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Origem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {solicitacoes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm italic">Nenhuma solicitação encontrada.</td>
                                </tr>
                            ) : (
                                solicitacoes.map(s => (
                                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                                        <td className="px-4 md:px-6 py-2.5 md:py-4">
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <div className="size-6 md:size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-slate-400 text-[10px] md:text-sm">person</span>
                                                </div>
                                                <span className="text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[80px] md:max-w-none">{s.solicitante}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-2.5 md:py-4">
                                            <p className="text-[10px] md:text-sm font-bold text-navy-dark dark:text-white truncate max-w-[120px] md:max-w-none">{s.titulo}</p>
                                            <p className="text-[8px] md:text-[10px] text-slate-400 truncate max-w-[120px] md:max-w-[200px]">{s.descricao || s.local}</p>
                                        </td>
                                        <td className="px-4 md:px-6 py-2.5 md:py-4 text-center">
                                            <p className="text-[9px] md:text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">{new Date(s.data).toLocaleDateString('pt-BR')}</p>
                                            <p className="text-[8px] md:text-[10px] text-slate-400 whitespace-nowrap">{s.hora_inicio} - {s.hora_fim}</p>
                                        </td>
                                        <td className="px-4 md:px-6 py-2.5 md:py-4">
                                            <div className="flex flex-col items-center">
                                                <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[7px] md:text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${s.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                    s.status === 'Recusado' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                                                    }`}>
                                                    {s.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-2.5 md:py-4">
                                            <div className="flex justify-center flex-wrap gap-1">
                                                {s.origem.split(', ').map(o => (
                                                    <span key={o} className={`px-1.5 py-0.5 rounded text-[7px] md:text-[10px] font-bold whitespace-nowrap ${o === 'Alê Portela' ? 'bg-turquoise/10 text-turquoise' : 'bg-blue-600/10 text-blue-600'}`}>
                                                        {o.split(' ')[0]}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AgendaModal
                isOpen={isEventModalOpen}
                initialDate={selectedDate || undefined}
                onClose={() => {
                    setIsEventModalOpen(false);
                    setSelectedDate(null);
                }}
                onSuccess={fetchData}
            />

            <AgendaSolicitacaoModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                onSuccess={fetchData}
                navigateTo={navigateTo}
            />
        </div>
    );
};

export default AgendaPage;
