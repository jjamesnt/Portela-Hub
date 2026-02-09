import React, { useEffect, useState } from 'react';

interface VotacaoKPIsProps {
    municipioId: string;
    codigoIBGE: string;
    totalRecursos: number;
}

const VotacaoKPIs: React.FC<VotacaoKPIsProps> = ({ municipioId, codigoIBGE, totalRecursos }) => {
    const [votos, setVotos] = useState<{ l: number; a: number } | null>(null);

    useEffect(() => {
        fetch('/data/votos_resumo.json')
            .then(r => r.json())
            .then(data => {
                if (data[codigoIBGE]) setVotos(data[codigoIBGE]);
            })
            .catch(() => { });
    }, [codigoIBGE]);

    const total = votos ? votos.l + votos.a : 0;
    const lincolnPct = votos && total > 0 ? Math.round((votos.l / total) * 100) : 50;
    const maxVotos = votos ? Math.max(votos.l, votos.a) : 1;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Recursos Ativos */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <span className="material-symbols-outlined text-5xl text-emerald-600">payments</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Recursos Ativos</p>
                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalRecursos)}
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md mt-2 inline-block">
                    +12% vs 2023
                </span>
            </div>

            {/* Votos Lincoln — Card com destaque forte */}
            <div className="rounded-xl p-5 shadow-lg shadow-[#8db641]/10 relative overflow-hidden border-2 border-[#8db641]/40 bg-gradient-to-br from-[#8db641]/15 via-white to-white dark:from-[#8db641]/25 dark:via-slate-800 dark:to-slate-800 transition-all hover:shadow-xl hover:shadow-[#8db641]/20 hover:scale-[1.01]">
                <div className="absolute -bottom-3 -right-3 opacity-[0.07]">
                    <span className="material-symbols-outlined text-[100px] text-[#8db641]">how_to_vote</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[#8db641] shadow-sm shadow-[#8db641]/40">
                        <span className="material-symbols-outlined text-white text-sm">how_to_vote</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">Dep. Federal • Lincoln Portela</p>
                </div>
                <h3 className="text-3xl font-black text-[#8db641] mt-1 tracking-tight">
                    {votos ? votos.l.toLocaleString('pt-BR') : '—'}
                    <span className="text-sm font-bold text-slate-400 ml-1">votos</span>
                </h3>
                {votos && (
                    <div className="mt-3 space-y-1.5">
                        <div className="h-2 w-full bg-[#8db641]/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#8db641] rounded-full transition-all duration-1000" style={{ width: `${(votos.l / maxVotos) * 100}%` }}></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#8db641] bg-[#8db641]/10 px-2 py-0.5 rounded-md">{lincolnPct}% do total</span>
                            <span className="text-[9px] font-semibold text-slate-400 uppercase">Eleições 2022</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Votos Alê — Card com destaque forte */}
            <div className="rounded-xl p-5 shadow-lg shadow-primary/10 relative overflow-hidden border-2 border-primary/40 bg-gradient-to-br from-primary/15 via-white to-white dark:from-primary/25 dark:via-slate-800 dark:to-slate-800 transition-all hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.01]">
                <div className="absolute -bottom-3 -right-3 opacity-[0.07]">
                    <span className="material-symbols-outlined text-[100px] text-primary">how_to_vote</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary shadow-sm shadow-primary/40">
                        <span className="material-symbols-outlined text-white text-sm">how_to_vote</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">Dep. Estadual • Alê Portela</p>
                </div>
                <h3 className="text-3xl font-black text-primary mt-1 tracking-tight">
                    {votos ? votos.a.toLocaleString('pt-BR') : '—'}
                    <span className="text-sm font-bold text-slate-400 ml-1">votos</span>
                </h3>
                {votos && (
                    <div className="mt-3 space-y-1.5">
                        <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-1000 delay-200" style={{ width: `${(votos.a / maxVotos) * 100}%` }}></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{100 - lincolnPct}% do total</span>
                            <span className="text-[9px] font-semibold text-slate-400 uppercase">Eleições 2022</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VotacaoKPIs;
