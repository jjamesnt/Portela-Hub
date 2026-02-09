
import React, { useState, useEffect, useMemo } from 'react';
import { getAgendaEventos } from '../services/api';
import { EventoAgenda } from '../types';
import Loader from '../components/Loader';

interface AgendaPageProps {
    navigateTo: (page: string, params?: { [key: string]: any }) => void;
}

const AgendaPage: React.FC<AgendaPageProps> = ({ navigateTo }) => {
    const [eventos, setEventos] = useState<EventoAgenda[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchEventos = async () => {
            try {
                setIsLoading(true);
                const data = await getAgendaEventos();
                setEventos(data);
                setError(null);
            } catch (err) {
                setError("Falha ao carregar os eventos da agenda.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchEventos();
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
        switch(tipo) {
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
                <button className="flex items-center gap-2 px-5 py-2.5 bg-turquoise text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-turquoise/20">
                    <span className="material-symbols-outlined text-lg">add</span>
                    Novo Evento
                </button>
            </div>
            
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
        </div>
    );
};

export default AgendaPage;
