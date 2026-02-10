
import React, { useState, useMemo, useEffect, useContext, useCallback } from 'react';
import { getMunicipios, createMunicipio, getAssessores } from '../services/api';
import { Municipio, Assessor } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import { AppContext } from '../context/AppContext';

interface MunicipiosPageProps {
    navigateTo: (page: string, params: { id: string }) => void;
}


// Cores por Mesorregião de MG
const REGION_COLORS: Record<string, { bg: string, text: string }> = {
    'Região Metropolitana': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
    'Zona da Mata': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    'Triângulo Mineiro': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
    'Norte de Minas': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
    'Sul de Minas': { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-400' },
    'Alto Paranaíba': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
    'Central Mineira': { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400' },
    'Vale do Rio Doce': { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-400' },
    'Oeste de Minas': { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-400' },
    'Campo das Vertentes': { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400' },
    'Jequitinhonha': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
    'Vale do Mucuri': { bg: 'bg-lime-100 dark:bg-lime-900/30', text: 'text-lime-700 dark:text-lime-400' },
    'Noroeste de Minas': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
};

const getRegionColor = (regiao: string) => {
    return REGION_COLORS[regiao] || { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-300' };
};

const StatusBadge: React.FC<{ status: Municipio['statusAtividade'] }> = ({ status }) => {
    const styles = {
        'Consolidado': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'Expansão': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'Manutenção': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        'Atenção': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return <span className={`px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-wider ${styles[status]}`}>{status}</span>;
}

// Skeleton Loading Component
const TableSkeleton = () => (
    <tbody>
        {[...Array(6)].map((_, i) => (
            <tr key={i} className="animate-pulse">
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div></td>
                <td className="px-6 py-4"><div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-28"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-8 mx-auto"></div></td>
                <td className="px-6 py-4"><div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-20 mx-auto"></div></td>
            </tr>
        ))}
    </tbody>
);

// Highlight text component
const HighlightText: React.FC<{ text: string, highlight: string }> = ({ text, highlight }) => {
    if (!highlight.trim()) return <>{text}</>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase() ?
                    <mark key={i} className="bg-yellow-200 dark:bg-yellow-600/50 px-0.5 rounded">{part}</mark> : part
            )}
        </>
    );
};

// Sort direction type
type SortDirection = 'asc' | 'desc' | null;
type SortField = 'nome' | 'regiao' | 'totalRecursos' | 'totalDemandas' | 'statusAtividade' | 'populacao';

const MunicipiosPage: React.FC<MunicipiosPageProps> = ({ navigateTo }) => {
    const { selectedMandato } = useAppContext();

    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [assessores, setAssessores] = useState<Assessor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterRegion, setFilterRegion] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string[]>([]);
    const [filterInvestment, setFilterInvestment] = useState<string>('');

    // Sorting
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    // Votes data

    // Form state
    const [formData, setFormData] = useState({
        nome: '',
        regiao: '',
        populacao: '',
        idh: '',
        pib_per_capita: '',
        influencia: '50',
        status_atividade: 'Manutenção',
        assessor_id: ''
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [municipiosData, assessoresData] = await Promise.all([
                    getMunicipios(),
                    getAssessores()
                ]);
                setMunicipios(municipiosData);
                setAssessores(assessoresData);
                setError(null);


            } catch (err) {
                setError('Falha ao carregar os dados.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Get unique regions for filter
    const uniqueRegions = useMemo(() => {
        const regions = [...new Set(municipios.map(m => m.regiao))].filter(Boolean).sort();
        return regions;
    }, [municipios]);

    // Handle sort
    const handleSort = useCallback((field: SortField) => {
        if (sortField === field) {
            if (sortDirection === 'asc') setSortDirection('desc');
            else if (sortDirection === 'desc') { setSortField(null); setSortDirection(null); }
            else setSortDirection('asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    }, [sortField, sortDirection]);

    // Filter and sort municipalities
    const municipiosFiltrados = useMemo(() => {
        let filtered = municipios.filter(m => {
            // Search filter
            if (debouncedSearch && !m.nome.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
            // Region filter
            if (filterRegion && m.regiao !== filterRegion) return false;
            // Status filter
            if (filterStatus.length > 0 && !filterStatus.includes(m.statusAtividade)) return false;
            // Investment filter
            if (filterInvestment) {
                const total = m.totalRecursos || 0;
                if (filterInvestment === 'low' && total >= 500000) return false;
                if (filterInvestment === 'mid' && (total < 500000 || total >= 1000000)) return false;
                if (filterInvestment === 'high' && total < 1000000) return false;
            }
            return true;
        });

        // Sort
        if (sortField && sortDirection) {
            filtered = [...filtered].sort((a, b) => {
                let aVal: any, bVal: any;
                switch (sortField) {
                    case 'nome': aVal = a.nome; bVal = b.nome; break;
                    case 'regiao': aVal = a.regiao; bVal = b.regiao; break;
                    case 'totalRecursos': aVal = a.totalRecursos || 0; bVal = b.totalRecursos || 0; break;
                    case 'totalDemandas': aVal = a.totalDemandas || 0; bVal = b.totalDemandas || 0; break;
                    case 'statusAtividade': aVal = a.statusAtividade; bVal = b.statusAtividade; break;
                    case 'populacao': aVal = a.populacao || 0; bVal = b.populacao || 0; break;
                    default: return 0;
                }
                if (typeof aVal === 'string') {
                    return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                }
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            });
        }

        return filtered;
    }, [debouncedSearch, filterRegion, filterStatus, filterInvestment, municipios, sortField, sortDirection]);

    // Summary stats
    const summaryStats = useMemo(() => ({
        total: municipiosFiltrados.length,
        totalInvestimento: municipiosFiltrados.reduce((acc, m) => acc + (m.totalRecursos || 0), 0),
        totalDemandas: municipiosFiltrados.reduce((acc, m) => acc + (m.totalDemandas || 0), 0),
    }), [municipiosFiltrados]);

    // Format population
    const formatPopulation = (pop: number | undefined) => {
        if (!pop) return '';
        if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
        if (pop >= 1000) return `${(pop / 1000).toFixed(0)}k`;
        return pop.toString();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const municipioData = {
                nome: formData.nome,
                regiao: formData.regiao,
                populacao: formData.populacao ? parseInt(formData.populacao) : undefined,
                idh: formData.idh ? parseFloat(formData.idh) : undefined,
                pib_per_capita: formData.pib_per_capita ? parseFloat(formData.pib_per_capita) : undefined,
                influencia: parseInt(formData.influencia),
                status_atividade: formData.status_atividade,
                assessor_id: formData.assessor_id || undefined
            };

            const novoMunicipio = await createMunicipio(municipioData);
            // Recarregar municípios para garantir dados frescos e tipos corretos
            const municipiosData = await getMunicipios();
            setMunicipios(municipiosData);
            setSuccessMessage('Município cadastrado com sucesso!');
            setShowModal(false);
            setFormData({
                nome: '',
                regiao: '',
                populacao: '',
                idh: '',
                pib_per_capita: '',
                influencia: '50',
                status_atividade: 'Manutenção',
                assessor_id: ''
            });

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Erro ao cadastrar município');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleStatusFilter = (status: string) => {
        setFilterStatus(prev =>
            prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterRegion('');
        setFilterStatus([]);
        setFilterInvestment('');
    };

    const hasActiveFilters = searchTerm || filterRegion || filterStatus.length > 0 || filterInvestment;

    const regioes = ['Região Metropolitana', 'Zona da Mata', 'Triângulo Mineiro', 'Norte de Minas', 'Sul de Minas', 'Alto Paranaíba', 'Central Mineira', 'Vale do Rio Doce', 'Oeste de Minas', 'Campo das Vertentes', 'Jequitinhonha', 'Vale do Mucuri', 'Noroeste de Minas'];
    const statusOptions = ['Consolidado', 'Expansão', 'Manutenção', 'Atenção'];

    // Sort icon component
    const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
        if (sortField !== field) return <span className="material-symbols-outlined text-[14px] opacity-30">unfold_more</span>;
        return (
            <span className="material-symbols-outlined text-[14px] text-turquoise">
                {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
            </span>
        );
    };

    return (
        <div className="p-4 md:p-8">
            {/* Success Message */}
            {successMessage && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in">
                    <span className="material-symbols-outlined">check_circle</span>
                    {successMessage}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-navy-dark dark:text-white tracking-tight">Municípios</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Gestão de bases e análise de influência regional.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-turquoise text-navy-dark font-bold rounded-xl hover:bg-turquoise/90 transition-all shadow-lg shadow-turquoise/20"
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    Novo Município
                </button>
            </div>

            {/* Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                    <p className="text-xl font-black text-navy-custom dark:text-white">{summaryStats.total}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Investimento</p>
                    <p className="text-xl font-black text-emerald-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(summaryStats.totalInvestimento)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Demandas</p>
                    <p className="text-xl font-black text-navy-custom dark:text-white">{summaryStats.totalDemandas}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                {/* Filters Section */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <span className="material-symbols-outlined text-lg">search</span>
                            </span>
                            <input
                                type="text"
                                placeholder="Buscar município..."
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-turquoise/30 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Region Filter */}
                        <select
                            value={filterRegion}
                            onChange={(e) => setFilterRegion(e.target.value)}
                            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-turquoise/30 outline-none"
                        >
                            <option value="">Todas Regiões</option>
                            {uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>

                        {/* Status Filter */}
                        <div className="flex gap-1">
                            {statusOptions.map(status => (
                                <button
                                    key={status}
                                    onClick={() => toggleStatusFilter(status)}
                                    className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase transition-all ${filterStatus.includes(status)
                                        ? 'bg-turquoise text-white'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        {/* Investment Filter */}
                        <select
                            value={filterInvestment}
                            onChange={(e) => setFilterInvestment(e.target.value)}
                            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-turquoise/30 outline-none"
                        >
                            <option value="">Investimento</option>
                            <option value="low">{"< R$500k"}</option>
                            <option value="mid">R$500k - R$1M</option>
                            <option value="high">{"> R$1M"}</option>
                        </select>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                                Limpar
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left min-w-[700px] md:min-w-0">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 cursor-pointer hover:text-turquoise transition-colors" onClick={() => handleSort('nome')}>
                                    <div className="flex items-center gap-1">Município <SortIcon field="nome" /></div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:text-turquoise transition-colors" onClick={() => handleSort('regiao')}>
                                    <div className="flex items-center gap-1">Região <SortIcon field="regiao" /></div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:text-turquoise transition-colors text-center" onClick={() => handleSort('totalRecursos')}>
                                    <div className="flex items-center justify-center gap-1">Investimento <SortIcon field="totalRecursos" /></div>
                                </th>
                                <th className="px-4 py-4 cursor-pointer hover:text-turquoise transition-colors text-center" onClick={() => handleSort('totalDemandas')}>
                                    <div className="flex items-center justify-center gap-1">Demandas <SortIcon field="totalDemandas" /></div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:text-turquoise transition-colors text-center" onClick={() => handleSort('statusAtividade')}>
                                    <div className="flex items-center justify-center gap-1">Status <SortIcon field="statusAtividade" /></div>
                                </th>
                            </tr>
                        </thead>
                        {isLoading ? <TableSkeleton /> : error ? (
                            <tbody>
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-red-500">{error}</td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {municipiosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                            <span className="material-symbols-outlined text-5xl mb-2 opacity-30">location_city</span>
                                            <p className="font-medium">Nenhum município encontrado</p>
                                            <p className="text-sm">{hasActiveFilters ? 'Tente ajustar os filtros' : 'Clique em "Novo Município" para começar'}</p>
                                        </td>
                                    </tr>
                                ) : (
                                    municipiosFiltrados.map(municipio => {
                                        const regionColor = getRegionColor(municipio.regiao);

                                        return (
                                            <tr
                                                key={municipio.id}
                                                onClick={() => navigateTo('MunicipioDetalhes', { id: municipio.id })}
                                                className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-navy-custom dark:text-white">
                                                            <HighlightText text={municipio.nome} highlight={debouncedSearch} />
                                                        </span>
                                                        {municipio.populacao && (
                                                            <span className="text-[10px] text-slate-400">{formatPopulation(municipio.populacao)} hab</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${regionColor.bg} ${regionColor.text}`}>
                                                        {municipio.regiao}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-emerald-600 whitespace-nowrap">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(municipio.totalRecursos || 0)}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs font-bold text-slate-600 dark:text-slate-300">
                                                        {municipio.totalDemandas || 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <StatusBadge status={municipio.statusAtividade} />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        )}
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
                            <h3 className="text-2xl font-black text-navy-custom dark:text-white">Novo Município</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Nome */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nome do Município *</label>
                                <input
                                    type="text"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-turquoise/50 dark:bg-slate-700 dark:text-white"
                                    placeholder="Ex: São Paulo"
                                />
                            </div>

                            {/* Região */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Região *</label>
                                <select
                                    name="regiao"
                                    value={formData.regiao}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-turquoise/50 dark:bg-slate-700 dark:text-white"
                                >
                                    <option value="">Selecione uma região</option>
                                    {regioes.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>

                            {/* Row: População e IDH */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">População</label>
                                    <input
                                        type="number"
                                        name="populacao"
                                        value={formData.populacao}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-turquoise/50 dark:bg-slate-700 dark:text-white"
                                        placeholder="Ex: 12000000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">IDH</label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        max="1"
                                        name="idh"
                                        value={formData.idh}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-turquoise/50 dark:bg-slate-700 dark:text-white"
                                        placeholder="Ex: 0.805"
                                    />
                                </div>
                            </div>

                            {/* PIB per capita */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">PIB per Capita (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="pib_per_capita"
                                    value={formData.pib_per_capita}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-turquoise/50 dark:bg-slate-700 dark:text-white"
                                    placeholder="Ex: 52796.00"
                                />
                            </div>

                            {/* Assessor */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Assessor Responsável</label>
                                <select
                                    name="assessor_id"
                                    value={formData.assessor_id}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-turquoise/50 dark:bg-slate-700 dark:text-white"
                                >
                                    <option value="">Nenhum assessor atribuído</option>
                                    {assessores.map(a => <option key={a.id} value={a.id}>{a.nome} - {a.regiaoAtuacao}</option>)}
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Status de Atividade *</label>
                                <select
                                    name="status_atividade"
                                    value={formData.status_atividade}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-turquoise/50 dark:bg-slate-700 dark:text-white"
                                >
                                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            {/* Influência */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Influência: {formData.influencia}%
                                </label>
                                <input
                                    type="range"
                                    name="influencia"
                                    min="0"
                                    max="100"
                                    value={formData.influencia}
                                    onChange={handleInputChange}
                                    className="w-full"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 px-6 py-3 bg-turquoise hover:bg-turquoise-light text-white rounded-lg font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="inline-block animate-spin size-4 border-2 border-white/30 border-t-white rounded-full"></span>
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[20px]">save</span>
                                            Cadastrar Município
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MunicipiosPage;
