
import React, { useState, useEffect, useMemo } from 'react';
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
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

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

    const changeMonth = (amount: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    };

    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });
    const year = currentDate.getFullYear();

    const eventsByDay = useMemo(() => {
        const eventsMap: { [key: number]: EventoAgenda[] } = {};
        eventos.forEach(event => {
            const eventDate = new Date(event.data + 'T00:00:00-03:00'); // Adjust timezone
            if (eventDate.getFullYear() === year && eventDate.getMonth() === currentDate.getMonth()) {
                const day = eventDate.getDate();
                if (!eventsMap[day]) eventsMap[day] = [];
                eventsMap[day].push(event);
            }
        });
        return eventsMap;
    }, [eventos, year, currentDate]);

    const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();

    const today = new Date();
    const isToday = (day: number) =>
        day === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        year === today.getFullYear();

    const tipoStyle = (tipo: EventoAgenda['tipo'] | 'Google') => {
        if (tipo === 'Google') return 'bg-rose-500';
        switch (tipo) {
            case 'Reunião': return 'bg-blue-500';
            case 'Visita Técnica': return 'bg-amber-500';
            case 'Evento Público': return 'bg-emerald-500';
            case 'Sessão Plenária': return 'bg-purple-500';
            default: return 'bg-slate-500';
        }
    }

    return (
        <div className="p-4 md:p-8 pb-24 md:pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 md:mb-8 text-left">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-navy-dark dark:text-white">Agenda</h2>
                    <p className="text-xs md:text-base text-slate-500 dark:text-slate-400">Organize seus compromissos e eventos.</p>
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
                        onClick={() => setIsEventModalOpen(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-5 py-2.5 bg-turquoise text-white rounded-xl text-xs md:text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-turquoise/20"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        Novo
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 md:p-6 mb-8">
                {isLoading ? <Loader /> : error ? <div className="text-center text-red-500">{error}</div> : (
                    <>
                        <div className="flex justify-between items-center mb-4 md:mb-6">
                            <h3 className="text-base md:text-lg font-bold text-navy-dark dark:text-white capitalize">{monthName} {year}</h3>
                            <div className="flex gap-1 md:gap-2">
                                <button onClick={() => changeMonth(-1)} className="p-1.5 md:p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"><span className="material-symbols-outlined text-xl">chevron_left</span></button>
                                <button onClick={() => changeMonth(1)} className="p-1.5 md:p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"><span className="material-symbols-outlined text-xl">chevron_right</span></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-700 border border-slate-100 dark:border-slate-700 rounded-lg overflow-hidden">
                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
                                <div key={idx} className="text-center py-1.5 md:py-2 bg-slate-50 dark:bg-slate-900/50 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</div>
                            ))}
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="bg-slate-50/30 dark:bg-slate-800/30 min-h-[50px] md:min-h-[120px]"></div>)}
                            {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
                                const day = dayIndex + 1;
                                const dayEvents = eventsByDay[day] || [];

                                // Merge official events and approved solicitations
                                const approvedSol = solicitacoes.filter(s => {
                                    if (s.status !== 'Aprovado') return false;
                                    const d = new Date(s.data + 'T00:00:00-03:00');
                                    return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === year;
                                });

                                return (
                                    <div key={day} className="p-0.5 md:p-2 bg-white dark:bg-slate-800 min-h-[50px] md:min-h-[120px] flex flex-col border-b border-r border-slate-50 dark:border-slate-700/50">
                                        <div className="flex justify-between items-start mb-0.5 md:mb-1">
                                            <span className={`font-black text-[9px] md:text-xs ${isToday(day) ? 'bg-turquoise text-white rounded-full size-4 md:size-6 flex items-center justify-center' : 'text-slate-500 dark:text-slate-400'}`}>{day}</span>
                                        </div>
                                        <div className="flex-1 space-y-0.5 pointer-events-none">
                                            {dayEvents.map(event => (
                                                <div key={event.id} className={`px-1 py-0.5 rounded-[3px] text-white text-[6px] md:text-[10px] font-bold truncate leading-tight flex items-center gap-1 ${event.origem === 'Google Calendar' ? tipoStyle('Google') : tipoStyle(event.tipo)}`}>
                                                    {event.origem === 'Google Calendar' && <span className="material-symbols-outlined text-[8px] md:text-[12px]">calendar_month</span>}
                                                    <span className="truncate">{event.titulo}</span>
                                                </div>
                                            ))}
                                            {approvedSol.map(s => (
                                                <div key={s.id} className="px-1 py-0.5 rounded-[3px] bg-sky-500 text-white text-[6px] md:text-[10px] font-bold truncate leading-tight">
                                                    {s.titulo}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Histórico de Solicitações - MOVIMENTADO PARA O FINAL */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
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
                onClose={() => setIsEventModalOpen(false)}
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
