import React, { useEffect, useState } from 'react';

interface VotacaoEstadualKPIsProps {
    selectedMandato: string;
}

const VotacaoEstadualKPIs: React.FC<VotacaoEstadualKPIsProps> = ({ selectedMandato }) => {
    const [totais, setTotais] = useState<{ lincoln: number; ale: number } | null>(null);

    useEffect(() => {
        fetch('/data/votos_resumo.json')
            .then(r => r.json())
            .then((data: Record<string, { l: number; a: number }>) => {
                let lincoln = 0;
                let ale = 0;
                Object.values(data).forEach(v => {
                    lincoln += v.l;
                    ale += v.a;
                });
                setTotais({ lincoln, ale });
            })
            .catch(() => { });
    }, []);

    const total = totais ? totais.lincoln + totais.ale : 0;
    const lincolnPct = totais && total > 0 ? Math.round((totais.lincoln / total) * 100) : 50;
    const maxVotos = totais ? Math.max(totais.lincoln, totais.ale) : 1;

    const lincolnCard = (
        <div key="lincoln" className={`rounded-xl p-5 shadow-lg shadow-[#8db641]/10 relative overflow-hidden border-2 border-[#8db641]/40 bg-gradient-to-br from-[#8db641]/15 via-white to-white dark:from-[#8db641]/25 dark:via-slate-800 dark:to-slate-800 transition-all hover:shadow-xl hover:shadow-[#8db641]/20 hover:scale-[1.01] ${selectedMandato === 'Lincoln Portela' ? 'ring-2 ring-[#8db641]/60 ring-offset-2' : ''}`}>
            <div className="absolute -bottom-3 -right-3 opacity-[0.07]">
                <span className="material-symbols-outlined text-[100px] text-[#8db641]">how_to_vote</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#8db641] shadow-sm shadow-[#8db641]/40">
                    <span className="material-symbols-outlined text-white text-base">how_to_vote</span>
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider leading-none">Dep. Federal • Lincoln Portela</p>
                    <p className="text-[9px] font-semibold text-slate-400 uppercase">Total Estado de Minas Gerais</p>
                </div>
            </div>
            <h3 className="text-3xl font-black text-[#8db641] mt-1 tracking-tight">
                {totais ? totais.lincoln.toLocaleString('pt-BR') : '—'}
                <span className="text-sm font-bold text-slate-400 ml-1">votos</span>
            </h3>
            {totais && (
                <div className="mt-3 space-y-1.5">
                    <div className="h-2 w-full bg-[#8db641]/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#8db641] rounded-full transition-all duration-1000" style={{ width: `${(totais.lincoln / maxVotos) * 100}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#8db641] bg-[#8db641]/10 px-2 py-0.5 rounded-md">{lincolnPct}% do total familiar</span>
                        <span className="text-[9px] font-semibold text-slate-400 uppercase">Eleições 2022</span>
                    </div>
                </div>
            )}
        </div>
    );

    const aleCard = (
        <div key="ale" className={`rounded-xl p-5 shadow-lg shadow-primary/10 relative overflow-hidden border-2 border-primary/40 bg-gradient-to-br from-primary/15 via-white to-white dark:from-primary/25 dark:via-slate-800 dark:to-slate-800 transition-all hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.01] ${selectedMandato === 'Alê Portela' ? 'ring-2 ring-primary/60 ring-offset-2' : ''}`}>
            <div className="absolute -bottom-3 -right-3 opacity-[0.07]">
                <span className="material-symbols-outlined text-[100px] text-primary">how_to_vote</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary shadow-sm shadow-primary/40">
                    <span className="material-symbols-outlined text-white text-base">how_to_vote</span>
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider leading-none">Dep. Estadual • Alê Portela</p>
                    <p className="text-[9px] font-semibold text-slate-400 uppercase">Total Estado de Minas Gerais</p>
                </div>
            </div>
            <h3 className="text-3xl font-black text-primary mt-1 tracking-tight">
                {totais ? totais.ale.toLocaleString('pt-BR') : '—'}
                <span className="text-sm font-bold text-slate-400 ml-1">votos</span>
            </h3>
            {totais && (
                <div className="mt-3 space-y-1.5">
                    <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-1000 delay-200" style={{ width: `${(totais.ale / maxVotos) * 100}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{100 - lincolnPct}% do total familiar</span>
                        <span className="text-[9px] font-semibold text-slate-400 uppercase">Eleições 2022</span>
                    </div>
                </div>
            )}
        </div>
    );

    // Ordem muda conforme a seleção
    const cards = selectedMandato === 'Alê Portela'
        ? [aleCard, lincolnCard]
        : [lincolnCard, aleCard];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards}
        </div>
    );
};

export default VotacaoEstadualKPIs;
