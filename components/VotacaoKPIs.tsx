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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
            {/* Recursos Ativos */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-5 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <span className="material-symbols-outlined text-4xl md:text-5xl text-emerald-600">payments</span>
                </div>
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">Recursos Ativos</p>
                <h3 className="text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalRecursos)}
                </h3>
                <span className="text-[9px] md:text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-md mt-1 md:mt-2 inline-block">
                    +12% vs 2023
                </span>
            </div>

            {/* Grid for Voting Cards on Mobile */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-4 md:contents">
                {/* Votos Lincoln — Card com destaque forte */}
                <div className="rounded-xl p-4 md:p-5 shadow-lg shadow-[#8db641]/10 relative overflow-hidden border border-[#8db641]/40 bg-gradient-to-br from-[#8db641]/15 via-white to-white dark:from-[#8db641]/25 dark:via-slate-800 dark:to-slate-800 transition-all hover:shadow-xl hover:shadow-[#8db641]/20 hover:scale-[1.01]">
                    <div className="absolute -bottom-3 -right-3 opacity-[0.07]">
                        <span className="material-symbols-outlined text-[60px] md:text-[100px] text-[#8db641]">how_to_vote</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                        <div className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded bg-[#8db641] shadow-sm shadow-[#8db641]/40">
                            <span className="material-symbols-outlined text-white text-[12px] md:text-sm">how_to_vote</span>
                        </div>
                        <p className="text-[8px] md:text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider leading-tight">Dep. Federal<br className="md:hidden" /> Lincoln</p>
                    </div>
                    <h3 className="text-xl md:text-3xl font-black text-[#8db641] mt-0.5 md:mt-1 tracking-tight">
                        {votos ? votos.l.toLocaleString('pt-BR') : '—'}
                        <span className="text-[10px] md:text-sm font-bold text-slate-400 ml-1 uppercase">votos</span>
                    </h3>
                    {votos && (
                        <div className="mt-2 md:mt-3 space-y-1 md:space-y-1.5">
                            <div className="h-1.5 md:h-2 w-full bg-[#8db641]/10 rounded-full overflow-hidden">
                                <div className="h-full bg-[#8db641] rounded-full transition-all duration-1000" style={{ width: `${(votos.l / maxVotos) * 100}%` }}></div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[8px] md:text-[10px] font-bold text-[#8db641] bg-[#8db641]/10 px-1.5 py-0.5 rounded-md">{lincolnPct}%</span>
                                <span className="text-[8px] md:text-[9px] font-semibold text-slate-400 uppercase hidden md:inline">Eleições 2022</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Votos Alê — Card com destaque forte */}
                <div className="rounded-xl p-4 md:p-5 shadow-lg shadow-primary/10 relative overflow-hidden border border-primary/40 bg-gradient-to-br from-primary/15 via-white to-white dark:from-primary/25 dark:via-slate-800 dark:to-slate-800 transition-all hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.01]">
                    <div className="absolute -bottom-3 -right-3 opacity-[0.07]">
                        <span className="material-symbols-outlined text-[60px] md:text-[100px] text-primary">how_to_vote</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2 text-left">
                        <div className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded bg-primary shadow-sm shadow-primary/40 text-left">
                            <span className="material-symbols-outlined text-white text-[12px] md:text-sm text-left">how_to_vote</span>
                        </div>
                        <p className="text-[8px] md:text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider leading-tight text-left">Dep. Estadual<br className="md:hidden" /> Alê</p>
                    </div>
                    <h3 className="text-xl md:text-3xl font-black text-primary mt-0.5 md:mt-1 tracking-tight">
                        {votos ? votos.a.toLocaleString('pt-BR') : '—'}
                        <span className="text-[10px] md:text-sm font-bold text-slate-400 ml-1 uppercase">votos</span>
                    </h3>
                    {votos && (
                        <div className="mt-2 md:mt-3 space-y-1 md:space-y-1.5">
                            <div className="h-1.5 md:h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all duration-1000 delay-200" style={{ width: `${(votos.a / maxVotos) * 100}%` }}></div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[8px] md:text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">{100 - lincolnPct}%</span>
                                <span className="text-[8px] md:text-[9px] font-semibold text-slate-400 uppercase hidden md:inline">Eleições 2022</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VotacaoKPIs;
