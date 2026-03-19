
import React, { useState, useMemo, useEffect } from 'react';
import { getMunicipios, getAssessores } from '../services/api';
import { Municipio, Assessor, Apoiador } from '../types';
import Loader from '../components/Loader';
import ApoiadorModal from '../components/ApoiadorModal';

interface ApoiadoresPageProps {
    navigateTo: (page: string, params?: { [key: string]: any }) => void;
}

const ApoiadoresPage: React.FC<ApoiadoresPageProps> = ({ navigateTo }) => {
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [assessores, setAssessores] = useState<Assessor[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [apoiadoresTotal, setApoiadoresTotal] = useState<Apoiador[]>([]);

    // Filtros
    const [busca, setBusca] = useState('');
    const [filtroRegiao, setFiltroRegiao] = useState('Todos');
    const [filtroAssessor, setFiltroAssessor] = useState('Todos');
    const [filtroStatusPrefeito, setFiltroStatusPrefeito] = useState('Todos');
    
    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [munData, assData, apoData] = await Promise.all([
                    getMunicipios(),
                    getAssessores(),
                    import('../services/api').then(m => m.getApoiadores())
                ]);
                setMunicipios(munData);
                setAssessores(assData);
                setApoiadoresTotal(apoData);
            } catch (err) {
                console.error("Erro ao carregar dados de apoiadores", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filtro para Apoiadores (Iterar por apoiador, agregando dados do município)
    const apoiadoresFiltrados = useMemo(() => {
        // Usa apenas os dados do servidor (para evitar duplicidade do mock anterior)
        const totalBase = apoiadoresTotal.map(a => {
            const m = municipios.find(city => city.id === a.municipioId);
            const assessor = m ? assessores.find(ass => ass.id === m.assessorId) : undefined;
            return { ...a, municipio: m, assessor };
        });

        return totalBase.filter(a => {
            const m = a.municipio;
            if (!m) return false;

            const correspondeBusca = a.nome.toLowerCase().includes(busca.toLowerCase()) || m.nome.toLowerCase().includes(busca.toLowerCase());
            const correspondeRegiao = filtroRegiao === 'Todos' || m.regiao === filtroRegiao;
            const correspondeAssessor = filtroAssessor === 'Todos' || a.assessor?.nome === filtroAssessor;
            const correspondeStatus = filtroStatusPrefeito === 'Todos' || m.statusPrefeito === filtroStatusPrefeito;

            return correspondeBusca && correspondeRegiao && correspondeAssessor && correspondeStatus;
        });
    }, [apoiadoresTotal, municipios, assessores, busca, filtroRegiao, filtroAssessor, filtroStatusPrefeito]);

    const summaryStats = useMemo(() => {
        // Contar municípios distintos de apoiadores visíveis
        const municipiosIds = new Set(apoiadoresFiltrados.map(a => a.municipioId));
        const parceiras = Array.from(municipiosIds).filter(id => {
            const m = municipios.find(city => city.id === id);
            return m?.statusPrefeito === 'Prefeitura Parceira' || m?.statusPrefeito === 'Prefeitura Fechada';
        }).length;

        return {
            totalMunicipios: municipiosIds.size,
            cidadesParceiras: parceiras,
            totalApoiadores: apoiadoresFiltrados.length
        };
    }, [apoiadoresFiltrados, municipios]);

    const getStatusPrefeitoColor = (status?: string) => {
        switch (status) {
            case 'Prefeitura Fechada': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
            case 'Prefeitura Parceira': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'Não': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
            default: return 'bg-slate-50 text-slate-400 dark:bg-slate-800/50';
        }
    };

    const clearFilters = () => {
        setBusca('');
        setFiltroRegiao('Todos');
        setFiltroAssessor('Todos');
        setFiltroStatusPrefeito('Todos');
    };

    const FilterSelect = ({ value, onChange, options, placeholder }: { value: string, onChange: (val: string) => void, options: string[], placeholder: string }) => (
        <div className="relative group flex-1">
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className={`w-full pl-3 pr-9 py-2 md:py-2.5 border rounded-xl text-xs md:text-sm outline-none font-medium transition-all cursor-pointer ${value !== 'Todos' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}
            >
                <option value="Todos">{placeholder}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                <span className={`material-symbols-outlined text-[20px] transition-all ${value !== 'Todos' ? 'text-white' : 'text-slate-400'}`}>keyboard_arrow_down</span>
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 animate-in fade-in duration-500 pb-24 md:pb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 md:mb-8">
                <div>
                    <h2 className="text-xl md:text-3xl font-black tracking-tight text-navy-dark dark:text-white">Apoiadores</h2>
                    <p className="text-[10px] md:text-sm text-slate-500 dark:text-slate-400 mt-0.5 md:mt-1">Acompanhe as lideranças e sua situação em cada cidade.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:brightness-110 active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined">volunteer_activism</span>
                    Novo Apoiador
                </button>
            </div>

            {/* Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3 mb-4 md:mb-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-3 md:p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase">Municípios</p>
                    <p className="text-base md:text-xl font-black text-navy-custom dark:text-white">{summaryStats.totalMunicipios}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-3 md:p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase">Cidades Parceiras</p>
                    <p className="text-base md:text-xl font-black text-emerald-600">{summaryStats.cidadesParceiras}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-3 md:p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase">Apoiadores</p>
                    <p className="text-base md:text-xl font-black text-rose-500">{summaryStats.totalApoiadores}</p>
                </div>
            </div>

            {/* Barra de Filtros */}
            <div className="flex flex-col gap-3 mb-6 md:mb-8 bg-white dark:bg-slate-800 p-3 md:p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                    <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[18px]">search</span>
                        <input
                            type="text"
                            placeholder="Buscar apoiador ou município..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 md:py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 flex-[2]">
                        <FilterSelect
                            value={filtroRegiao}
                            onChange={setFiltroRegiao}
                            options={Array.from(new Set(municipios.map(m => m.regiao))).sort()}
                            placeholder="Regiões"
                        />
                        <FilterSelect
                            value={filtroAssessor}
                            onChange={setFiltroAssessor}
                            options={Array.from(new Set(assessores.map(a => a.nome))).sort()}
                            placeholder="Assessores"
                        />
                        <FilterSelect
                            value={filtroStatusPrefeito}
                            onChange={setFiltroStatusPrefeito}
                            options={['Prefeitura Parceira', 'Prefeitura Fechada', 'Não']}
                            placeholder="Status Prefeito"
                        />
                    </div>
                    {(busca || filtroRegiao !== 'Todos' || filtroAssessor !== 'Todos' || filtroStatusPrefeito !== 'Todos') && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 border border-rose-200 text-rose-500 rounded-xl hover:bg-rose-50 transition-all text-xs font-bold"
                        >
                            Limpar
                        </button>
                    )}
                </div>
            </div>

            {isLoading ? <Loader /> : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Apoiador</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cidade</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Prefeito</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Votação 2022</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessor/Responsável</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Atendimento / Demanda</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {apoiadoresFiltrados.map(a => {
                                    const m = a.municipio!;
                                    return (
                                        <tr 
                                            key={a.id} 
                                            onClick={() => navigateTo('MunicipioDetalhes', { id: m.id })}
                                            className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                                        {a.nome}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                                        {a.cargo}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-navy-dark dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {m.nome}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                                                        {m.regiao}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusPrefeitoColor(m.statusPrefeito)}`}>
                                                        {m.statusPrefeito || 'Não informado'}
                                                    </span>
                                                    {m.lincolnFechado && (
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500 text-white flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[12px]">beenhere</span>
                                                            Lincoln Portela
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase">Alê</span>
                                                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded">
                                                            {m.votacaoAle?.toLocaleString() || '—'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase">Lincoln</span>
                                                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">
                                                            {m.votacaoLincoln?.toLocaleString() || '—'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-[14px] text-slate-400">person</span>
                                                    </div>
                                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                        {a.assessor?.nome || '—'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 max-w-[200px]">
                                                    {m.statusAtendimento && (
                                                        <span className={`w-fit px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                                            m.statusAtendimento === 'Contemplado' 
                                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                        }`}>
                                                            {m.statusAtendimento}
                                                        </span>
                                                    )}
                                                    {m.principalDemanda && (
                                                        <p className="text-[10px] text-slate-600 dark:text-slate-300 font-bold truncate">
                                                            {m.principalDemanda}
                                                        </p>
                                                    )}
                                                    {m.sugestaoSedese && (
                                                        <span className="text-[9px] text-indigo-500 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 w-fit">
                                                            SEDESE: {m.sugestaoSedese}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {/* Modal de Novo Apoiador */}
            <ApoiadorModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    // Recarregar dados se necessário ou apenas fechar
                    setIsModalOpen(false);
                }}
                allMunicipios={municipios}
                allApoiadores={apoiadoresTotal}
            />
        </div>
    );
};

export default ApoiadoresPage;
