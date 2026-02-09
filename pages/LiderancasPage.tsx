
import React, { useState, useMemo, useEffect } from 'react';
import { getLiderancas, getMunicipios } from '../services/api';
import { Lideranca, Municipio } from '../types';
import Loader from '../components/Loader';

interface LiderancasPageProps {
    navigateTo: (page: string, params?: { [key: string]: any }) => void;
}

const LiderancasPage: React.FC<LiderancasPageProps> = ({ navigateTo }) => {
    const [liderancas, setLiderancas] = useState<Lideranca[]>([]);
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [busca, setBusca] = useState('');
    const [filtroMunicipio, setFiltroMunicipio] = useState('Todos');
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [liderancasData, municipiosData] = await Promise.all([
                    getLiderancas(),
                    getMunicipios()
                ]);
                setLiderancas(liderancasData);
                setMunicipios(municipiosData);
                setError(null);
            } catch (err) {
                setError("Falha ao carregar os dados.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const liderancasFiltradas = useMemo(() => {
        return liderancas.filter(l => {
            const correspondeBusca = l.nome.toLowerCase().includes(busca.toLowerCase());
            const correspondeMunicipio = filtroMunicipio === 'Todos' || l.municipio === filtroMunicipio;
            return correspondeBusca && correspondeMunicipio;
        });
    }, [busca, filtroMunicipio, liderancas]);

    const statusStyle = (status: Lideranca['status']) => {
        switch (status) {
            case 'Ativo': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'Inativo': return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
        }
    };

    const partidos = [...new Set(liderancas.map(l => l.partido))];

    return (
        <div className="p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-navy-dark dark:text-white">Gestão de Lideranças</h2>
                    <p className="text-slate-500 dark:text-slate-400">Gerencie e conecte-se com sua base de contatos.</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-turquoise text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-turquoise/20">
                    <span className="material-symbols-outlined text-lg">person_add</span>
                    Adicionar Liderança
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-4 flex flex-wrap items-center gap-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="relative flex-grow min-w-[200px]"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span><input onChange={(e) => setBusca(e.target.value)} value={busca} className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-turquoise/50 focus:border-turquoise" placeholder="Buscar por nome..." type="text" /></div>
                    <select onChange={(e) => setFiltroMunicipio(e.target.value)} value={filtroMunicipio} className="flex-grow min-w-[150px] bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-turquoise/50 focus:border-turquoise"><option value="Todos">Todos os Municípios</option>{municipios.map(m => <option key={m.id} value={m.nome}>{m.nome}</option>)}</select>
                    <select className="flex-grow min-w-[150px] bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-turquoise/50 focus:border-turquoise"><option>Todos os Partidos</option>{partidos.map(p => <option key={p} value={p}>{p}</option>)}</select>
                    <select className="flex-grow min-w-[150px] bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-turquoise/50 focus:border-turquoise"><option>Todos os Cargos</option><option>Prefeito</option><option>Vereador</option><option>Liderança Comunitária</option></select>
                </div>
                <div className="overflow-x-auto">
                    {isLoading ? <Loader /> : error ? <div className="p-8 text-center text-red-500">{error}</div> : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><tr className="border-b border-slate-100 dark:border-slate-700"><th className="px-6 py-4">Nome</th><th className="px-6 py-4">Município / Região</th><th className="px-6 py-4">Partido / Cargo</th><th className="px-6 py-4">Contato</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-right">Ações</th></tr></thead>
                            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
                                {liderancasFiltradas.map(l => (
                                    <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="size-9 rounded-full bg-navy-dark dark:bg-slate-700 text-white flex items-center justify-center font-bold text-xs">{l.nome.split(' ').map(n=>n[0]).join('')}</div><div><div className="font-bold text-navy-dark dark:text-white">{l.nome}</div></div></div></td>
                                        <td className="px-6 py-4"><div className="font-medium text-slate-700 dark:text-slate-300">{l.municipio}</div><div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{l.regiao}</div></td>
                                        <td className="px-6 py-4"><div className="font-medium text-slate-700 dark:text-slate-300">{l.partido}</div><div className="text-[11px] text-slate-500">{l.cargo}</div></td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{l.contato}</td>
                                        <td className="px-6 py-4 text-center"><span className={`px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-wider ${statusStyle(l.status)}`}>{l.status}</span></td>
                                        <td className="px-6 py-4 text-right"><button className="p-2 text-slate-400 hover:text-turquoise transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button><button className="p-2 text-slate-400 hover:text-turquoise transition-colors"><span className="material-symbols-outlined text-lg">visibility</span></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiderancasPage;
