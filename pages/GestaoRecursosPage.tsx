import React, { useState, useEffect, useMemo } from 'react';
import { getAllRecursos } from '../services/api';
import { Recurso } from '../types';
import Loader from '../components/Loader';
import MandatoBadge from '../components/MandatoBadge';

interface ExtendedRecurso extends Recurso {
    municipio_nome: string;
    regiao: string;
}

const StatusBadge: React.FC<{ status: Recurso['status'] }> = ({ status }) => {
    const styles = {
        'Aprovado': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        'Em Execução': 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        'Concluído': 'bg-slate-50 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400',
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider whitespace-nowrap ${styles[status] || styles['Aprovado']}`}>
            {status.toUpperCase()}
        </span>
    );
};

const TipoBadge: React.FC<{ tipo: string }> = ({ tipo }) => {
    const styles: { [key: string]: string } = {
        'Emenda': 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
        'Veículo': 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        'Equipamento': 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
        'Obra': 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400',
    };

    // Suporte a múltiplas destinações separadas por vírgula
    const tipos = tipo.split(',').map(t => t.trim());

    return (
        <div className="flex flex-wrap gap-1">
            {tipos.map((t, idx) => (
                <span key={idx} className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold tracking-tight uppercase ${styles[t] || 'bg-slate-50 text-slate-600'}`}>
                    {t}
                </span>
            ))}
        </div>
    );
};

const GestaoRecursosPage: React.FC<{ navigateTo: (page: string, params?: any) => void }> = ({ navigateTo }) => {
    const [recursos, setRecursos] = useState<ExtendedRecurso[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroMunicipio, setFiltroMunicipio] = useState('Todos');
    const [filtroRegiao, setFiltroRegiao] = useState('Todas');
    const [filtroAssessor, setFiltroAssessor] = useState('Todos');
    const [filtroTipo, setFiltroTipo] = useState('Todos');
    const [filtroStatus, setFiltroStatus] = useState('Todos');
    const [filtroDeputado, setFiltroDeputado] = useState('Todos');

    useEffect(() => {
        const fetchRecursos = async () => {
            try {
                const data = await getAllRecursos();
                // Ordenação inicial por maior valor
                const sortedData = (data as ExtendedRecurso[]).sort((a, b) => b.valor - a.valor);
                setRecursos(sortedData);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecursos();
    }, []);

    const municipiosList = useMemo(() => ['Todos', ...new Set(recursos.map(r => r.municipio_nome))].sort(), [recursos]);
    const regioesList = useMemo(() => ['Todas', ...new Set(recursos.map(r => r.regiao))].sort(), [recursos]);
    const assessoresList = useMemo(() => ['Todos', ...new Set(recursos.map(r => r.responsavel))].filter(Boolean).sort(), [recursos]);
    const tipos = ['Todos', 'Emenda', 'Veículo', 'Equipamento', 'Obra'];
    const statuses = ['Todos', 'Aprovado', 'Em Execução', 'Concluído'];

    const recursosFiltrados = useMemo(() => {
        return recursos.filter(r => {
            const matchesText = r.descricao.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                r.municipio_nome.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                r.origem.toLowerCase().includes(filtroTexto.toLowerCase());
            const matchesMunicipio = filtroMunicipio === 'Todos' || r.municipio_nome === filtroMunicipio;
            const matchesRegiao = filtroRegiao === 'Todas' || r.regiao === filtroRegiao;
            const matchesAssessor = filtroAssessor === 'Todos' || r.responsavel === filtroAssessor;
            const matchesTipo = filtroTipo === 'Todos' || r.tipo.includes(filtroTipo);
            const matchesStatus = filtroStatus === 'Todos' || r.status === filtroStatus;
            const matchesDeputado = filtroDeputado === 'Todos' || r.origem === filtroDeputado;
            return matchesText && matchesMunicipio && matchesRegiao && matchesAssessor && matchesTipo && matchesStatus && matchesDeputado;
        });
    }, [recursos, filtroTexto, filtroMunicipio, filtroRegiao, filtroAssessor, filtroTipo, filtroStatus, filtroDeputado]);

    const totalValor = useMemo(() => recursosFiltrados.reduce((acc, r) => acc + r.valor, 0), [recursosFiltrados]);
    const topMunicipio = useMemo(() => {
        if (recursosFiltrados.length === 0) return '-';
        const counts: { [key: string]: number } = {};
        recursosFiltrados.forEach(r => {
            counts[r.municipio_nome] = (counts[r.municipio_nome] || 0) + r.valor;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    }, [recursosFiltrados]);

    if (isLoading) return <Loader />;

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-navy-dark dark:text-white tracking-tight">Gestão de Recursos</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">Análise estratégica e controle de investimentos territoriais.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            const activeFilters: { [key: string]: string } = {};
                            if (filtroMunicipio !== 'Todos') activeFilters['Município'] = filtroMunicipio;
                            if (filtroRegiao !== 'Todas') activeFilters['Região'] = filtroRegiao;
                            if (filtroAssessor !== 'Todos') activeFilters['Assessor'] = filtroAssessor;
                            if (filtroTipo !== 'Todos') activeFilters['Tipo'] = filtroTipo;
                            if (filtroStatus !== 'Todos') activeFilters['Status'] = filtroStatus;
                            if (filtroDeputado !== 'Todos') activeFilters['Deputado'] = filtroDeputado;
                            if (filtroTexto) activeFilters['Busca'] = filtroTexto;

                            const reportPayload = {
                                data: recursosFiltrados,
                                filters: activeFilters,
                                issuer: 'Alê Portela'
                            };

                            sessionStorage.setItem('relatorio_recursos', JSON.stringify(reportPayload));
                            window.open(window.location.href + '?report=recursos', '_blank');
                        }}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-indigo-500">description</span>
                        Emitir Relatório
                    </button>
                    <button className="flex items-center justify-center gap-2 px-6 py-3 bg-turquoise text-white rounded-xl font-bold hover:bg-turquoise/90 transition-all shadow-lg shadow-turquoise/20">
                        <span className="material-symbols-outlined">add_circle</span>
                        Novo Recurso
                    </button>
                </div>
            </div>

            {/* Visão Estratégica - Mini Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group flex flex-col justify-between min-h-[140px]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                            {(filtroTexto || filtroMunicipio !== 'Todos' || filtroRegiao !== 'Todas' || filtroAssessor !== 'Todos' || filtroTipo !== 'Todos' || filtroStatus !== 'Todos' || filtroDeputado !== 'Todos')
                                ? 'VALOR TOTAL FILTRADO'
                                : 'RECURSOS ALOCADOS'}
                        </p>
                        <h2 className="text-3xl font-black text-navy-dark dark:text-white leading-tight">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValor)}
                        </h2>
                    </div>

                    {(filtroTexto || filtroMunicipio !== 'Todos' || filtroRegiao !== 'Todas' || filtroAssessor !== 'Todos' || filtroTipo !== 'Todos' || filtroStatus !== 'Todos' || filtroDeputado !== 'Todos') && (
                        <button
                            onClick={() => {
                                setFiltroTexto('');
                                setFiltroMunicipio('Todos');
                                setFiltroRegiao('Todas');
                                setFiltroAssessor('Todos');
                                setFiltroTipo('Todos');
                                setFiltroStatus('Todos');
                                setFiltroDeputado('Todos');
                            }}
                            className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-rose-500 text-white hover:bg-rose-600 rounded-xl transition-all font-bold text-[10px] shadow-lg shadow-rose-500/20 active:scale-95"
                        >
                            <span className="material-symbols-outlined text-sm">filter_alt_off</span>
                            LIMPAR FILTROS ATIVOS
                        </button>
                    )}
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        {(filtroTexto || filtroMunicipio !== 'Todos' || filtroRegiao !== 'Todas' || filtroAssessor !== 'Todos' || filtroTipo !== 'Todos' || filtroStatus !== 'Todos' || filtroDeputado !== 'Todos')
                            ? 'MUNICÍPIO COM MAIOR VALOR FILTRADO'
                            : 'MUNICÍPIO COM MAIOR VALOR'}
                    </p>
                    <h2 className="text-2xl font-black text-navy-dark dark:text-white truncate">{topMunicipio}</h2>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">TOTAL DE RECURSOS</p>
                    <h2 className="text-2xl font-black text-navy-dark dark:text-white">{recursosFiltrados.length}</h2>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden text-sm">
                {/* Filtragem Otimizada */}
                <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col gap-4 bg-slate-50/50 dark:bg-slate-900/20">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full group">
                            <span className={`absolute inset-y-0 left-0 flex items-center pl-3 transition-colors ${filtroTexto ? 'text-indigo-500 font-bold' : 'text-slate-400'}`}>
                                <span className="material-symbols-outlined text-lg">search</span>
                            </span>
                            <input
                                type="text"
                                placeholder="Buscar por descrição, origem ou município..."
                                className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl text-sm outline-none transition-all ${filtroTexto ? 'bg-indigo-50/50 border-indigo-500 text-indigo-900 ring-4 ring-indigo-500/10' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-turquoise'}`}
                                value={filtroTexto}
                                onChange={(e) => setFiltroTexto(e.target.value)}
                            />
                            {filtroTexto && (
                                <button
                                    onClick={() => setFiltroTexto('')}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-rose-500 transition-colors"
                                    title="Limpar busca"
                                >
                                    <span className="material-symbols-outlined text-base">close</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <div className="flex-1 min-w-[120px] relative group">
                            <select
                                value={filtroDeputado}
                                onChange={(e) => setFiltroDeputado(e.target.value)}
                                className={`w-full border-2 rounded-lg text-[13px] pl-3 pr-8 py-2 outline-none transition-all font-bold appearance-none ${filtroDeputado !== 'Todos' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                            >
                                <option value="Todos" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Todos Deputados</option>
                                <option value="Alê Portela" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Alê Portela</option>
                                <option value="Lincoln Portela" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Lincoln Portela</option>
                            </select>
                            <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-base pointer-events-none transition-colors ${filtroDeputado !== 'Todos' ? 'text-white' : 'text-slate-400'}`}>expand_more</span>
                            {filtroDeputado !== 'Todos' && (
                                <button
                                    onClick={() => setFiltroDeputado('Todos')}
                                    className="absolute -top-1.5 -right-1.5 size-5 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    title="Remover filtro"
                                >
                                    <span className="material-symbols-outlined text-[10px] font-black">close</span>
                                </button>
                            )}
                        </div>

                        <div className="flex-1 min-w-[120px] relative group">
                            <select
                                value={filtroMunicipio}
                                onChange={e => setFiltroMunicipio(e.target.value)}
                                className={`w-full border-2 rounded-lg text-[13px] pl-3 pr-8 py-2 outline-none transition-all appearance-none ${filtroMunicipio !== 'Todos' ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                            >
                                {municipiosList.map(m => <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{m === 'Todos' ? 'Todos Municípios' : m}</option>)}
                            </select>
                            <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-base pointer-events-none transition-colors ${filtroMunicipio !== 'Todos' ? 'text-white' : 'text-slate-400'}`}>expand_more</span>
                            {filtroMunicipio !== 'Todos' && (
                                <button
                                    onClick={() => setFiltroMunicipio('Todos')}
                                    className="absolute -top-1.5 -right-1.5 size-5 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    title="Remover filtro"
                                >
                                    <span className="material-symbols-outlined text-[10px] font-black">close</span>
                                </button>
                            )}
                        </div>

                        <div className="flex-1 min-w-[120px] relative group">
                            <select
                                value={filtroRegiao}
                                onChange={e => setFiltroRegiao(e.target.value)}
                                className={`w-full border-2 rounded-lg text-[13px] pl-3 pr-8 py-2 outline-none transition-all appearance-none ${filtroRegiao !== 'Todas' ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                            >
                                {regioesList.map(r => <option key={r} value={r} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{r === 'Todas' ? 'Todas Regiões' : r}</option>)}
                            </select>
                            <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-base pointer-events-none transition-colors ${filtroRegiao !== 'Todas' ? 'text-white' : 'text-slate-400'}`}>expand_more</span>
                            {filtroRegiao !== 'Todas' && (
                                <button
                                    onClick={() => setFiltroRegiao('Todas')}
                                    className="absolute -top-1.5 -right-1.5 size-5 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    title="Remover filtro"
                                >
                                    <span className="material-symbols-outlined text-[10px] font-black">close</span>
                                </button>
                            )}
                        </div>

                        <div className="flex-1 min-w-[120px] relative group">
                            <select
                                value={filtroAssessor}
                                onChange={e => setFiltroAssessor(e.target.value)}
                                className={`w-full border-2 rounded-lg text-[13px] pl-3 pr-8 py-2 outline-none transition-all appearance-none ${filtroAssessor !== 'Todos' ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                            >
                                {assessoresList.map(a => <option key={a} value={a} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{a === 'Todos' ? 'Todos Assessores' : a}</option>)}
                            </select>
                            <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-base pointer-events-none transition-colors ${filtroAssessor !== 'Todos' ? 'text-white' : 'text-slate-400'}`}>expand_more</span>
                            {filtroAssessor !== 'Todos' && (
                                <button
                                    onClick={() => setFiltroAssessor('Todos')}
                                    className="absolute -top-1.5 -right-1.5 size-5 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    title="Remover filtro"
                                >
                                    <span className="material-symbols-outlined text-[10px] font-black">close</span>
                                </button>
                            )}
                        </div>

                        <div className="flex-1 min-w-[120px] relative group">
                            <select
                                value={filtroTipo}
                                onChange={e => setFiltroTipo(e.target.value)}
                                className={`w-full border-2 rounded-lg text-[13px] pl-3 pr-8 py-2 outline-none transition-all appearance-none ${filtroTipo !== 'Todos' ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                            >
                                {tipos.map(t => <option key={t} value={t} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{t === 'Todos' ? 'Destinações' : t}</option>)}
                            </select>
                            <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-base pointer-events-none transition-colors ${filtroTipo !== 'Todos' ? 'text-white' : 'text-slate-400'}`}>expand_more</span>
                            {filtroTipo !== 'Todos' && (
                                <button
                                    onClick={() => setFiltroTipo('Todos')}
                                    className="absolute -top-1.5 -right-1.5 size-5 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    title="Remover filtro"
                                >
                                    <span className="material-symbols-outlined text-[10px] font-black">close</span>
                                </button>
                            )}
                        </div>

                        <div className="flex-1 min-w-[120px] relative group">
                            <select
                                value={filtroStatus}
                                onChange={e => setFiltroStatus(e.target.value)}
                                className={`w-full border-2 rounded-lg text-[13px] pl-3 pr-8 py-2 outline-none transition-all appearance-none ${filtroStatus !== 'Todos' ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                            >
                                {statuses.map(s => <option key={s} value={s} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{s === 'Todos' ? 'Status' : s}</option>)}
                            </select>
                            <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-base pointer-events-none transition-colors ${filtroStatus !== 'Todos' ? 'text-white' : 'text-slate-400'}`}>expand_more</span>
                            {filtroStatus !== 'Todos' && (
                                <button
                                    onClick={() => setFiltroStatus('Todos')}
                                    className="absolute -top-1.5 -right-1.5 size-5 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    title="Remover filtro"
                                >
                                    <span className="material-symbols-outlined text-[10px] font-black">close</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 w-16"># RANK</th>
                                <th className="px-6 py-4">MUNICÍPIO</th>
                                <th className="px-6 py-4">RECURSO</th>
                                <th className="px-6 py-4">ASSESSOR</th>
                                <th className="px-6 py-4">DESTINAÇÃO</th>
                                <th className="px-6 py-4">ORIGEM</th>
                                <th className="px-6 py-4">DATA</th>
                                <th className="px-6 py-4 text-right">VALOR</th>
                                <th className="px-6 py-4 text-center">STATUS</th>
                                <th className="px-6 py-4 text-center w-14"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                            {recursosFiltrados.map((r, index) => (
                                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className={`size-7 rounded-lg flex items-center justify-center font-black text-xs ${index === 0 ? 'bg-amber-100 text-amber-600' : index === 1 ? 'bg-slate-100 text-slate-500' : index === 2 ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div
                                            className="cursor-pointer group/mun"
                                            onClick={() => navigateTo('MunicipioDetalhes', { id: r.municipioId })}
                                        >
                                            <p className="font-bold text-navy-dark dark:text-white group-hover/mun:text-turquoise transition-colors">{r.municipio_nome}</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-medium">{r.regiao}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200 group-hover:text-turquoise transition-colors">{r.descricao}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{r.responsavel || 'Não definido'}</td>
                                    <td className="px-6 py-4"><TipoBadge tipo={r.tipo} /></td>
                                    <td className="px-6 py-4">
                                        <MandatoBadge origem={r.origem} />
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                        {r.dataAprovacao ? new Date(r.dataAprovacao).toLocaleDateString('pt-BR') : '-'}
                                    </td>
                                    <td className="px-6 py-4 font-black text-navy-dark dark:text-white whitespace-nowrap text-right">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.valor)}
                                    </td>
                                    <td className="px-6 py-4 text-center"><StatusBadge status={r.status} /></td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => navigateTo('MunicipioDetalhes', { id: r.municipioId })}
                                            className="size-8 rounded-lg bg-turquoise/10 hover:bg-turquoise/20 flex items-center justify-center transition-all group/btn"
                                            title={`Ver detalhes de ${r.municipio_nome}`}
                                        >
                                            <span className="material-symbols-outlined text-turquoise text-base group-hover/btn:scale-110 transition-transform">open_in_new</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {recursosFiltrados.length === 0 && (
                        <div className="p-20 text-center">
                            <span className="material-symbols-outlined text-6xl text-slate-200">folder_open</span>
                            <p className="text-slate-400 mt-4 font-medium">Nenhum recurso encontrado com os filtros aplicados.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GestaoRecursosPage;
