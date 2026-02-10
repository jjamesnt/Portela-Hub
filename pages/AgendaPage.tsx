
import React, { useState, useEffect, useMemo } from 'react';
import { getAgendaEventos, getSolicitacoesAgenda } from '../services/api';
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
            const [eventosData, solicitacoesData] = await Promise.all([
                getAgendaEventos(),
                getSolicitacoesAgenda()
            ]);
            setEventos(eventosData);
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

    const tipoStyle = (tipo: EventoAgenda['tipo']) => {
        switch (tipo) {
            case 'Reunião': return 'bg-blue-500';
            case 'Visita Técnica': return 'bg-amber-500';
            case 'Evento Público': return 'bg-emerald-500';
            case 'Sessão Plenária': return 'bg-purple-500';
        }
    }

    return (
        <div className="p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-navy-dark dark:text-white">Agenda</h2>
                    <p className="text-slate-500 dark:text-slate-400">Organize seus compromissos e eventos.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsRequestModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-lg text-turquoise">add_task</span>
                        Solicitar Agenda
                    </button>
                    <button
                        onClick={() => setIsEventModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-turquoise text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-turquoise/20"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        Novo Evento
                    </button>
                </div>
            </div>

            {/* Lista de Solicitações Pendentes */}
            {solicitacoes.length > 0 && (
                <div className="mb-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">pending_actions</span>
                            <h3 className="font-black text-sm text-navy-dark dark:text-white uppercase tracking-wider">Solicitações de Agenda</h3>
                        </div>
                        <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-full">
                            {solicitacoes.filter(s => s.status === 'Pendente').length} Pendentes
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/30 dark:bg-slate-900/10">
                                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Solicitante</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Compromisso</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Data/Hora</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Origem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {solicitacoes.slice(0, 5).map(s => (
                                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-slate-400 text-sm">person</span>
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{s.solicitante}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-navy-dark dark:text-white">{s.titulo}</p>
                                            <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{s.descricao || s.local}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{new Date(s.data).toLocaleDateString('pt-BR')}</p>
                                            <p className="text-[10px] text-slate-400">{s.hora_inicio} - {s.hora_fim}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                    s.status === 'Recusado' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                                                    }`}>
                                                    {s.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.origem === 'Alê Portela' ? 'bg-turquoise/10 text-turquoise' : 'bg-blue-100 text-blue-600'}`}>
                                                    {s.origem}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                {isLoading ? <Loader /> : error ? <div className="text-center text-red-500">{error}</div> : (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-navy-dark dark:text-white capitalize">{monthName} {year}</h3>
                            <div className="flex gap-2">
                                <button onClick={() => changeMonth(-1)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"><span className="material-symbols-outlined">chevron_left</span></button>
                                <button onClick={() => changeMonth(1)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"><span className="material-symbols-outlined">chevron_right</span></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-700 border border-slate-100 dark:border-slate-700">
                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                                <div key={day} className="text-center py-2 bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{day}</div>
                            ))}
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="bg-slate-50/50 dark:bg-slate-800/50 min-h-[120px]"></div>)}
                            {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
                                const day = dayIndex + 1;
                                return (
                                    <div key={day} className="p-2 bg-white dark:bg-slate-800 min-h-[120px] flex flex-col">
                                        <span className={`font-bold text-xs ${isToday(day) ? 'bg-turquoise text-white rounded-full size-6 flex items-center justify-center' : 'text-slate-600 dark:text-slate-300'}`}>{day}</span>
                                        <div className="mt-1 space-y-1">
                                            {eventsByDay[day]?.map(event => (
                                                <div key={event.id} className={`p-1 rounded text-white text-[10px] font-bold flex items-center gap-1 ${tipoStyle(event.tipo)}`}>
                                                    <div className="size-1.5 rounded-full bg-white/50"></div>
                                                    <span className="truncate">{event.titulo}</span>
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
