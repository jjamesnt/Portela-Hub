import React, { useEffect, useState } from 'react';
import { getIBGEData } from '../services/ibge';
import { FormattedIBGEData } from '../types';

interface InfoGeraisCardProps {
    idh: number;
    pibPerCapita: number;
    codigoIBGE: string;
}

const InfoGeraisCard: React.FC<InfoGeraisCardProps> = ({ idh, pibPerCapita, codigoIBGE }) => {
    const [ibge, setIbge] = useState<FormattedIBGEData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIBGE = async () => {
            setLoading(true);
            const res = await getIBGEData(codigoIBGE);
            setIbge(res);
            setLoading(false);
        };
        if (codigoIBGE) fetchIBGE();
    }, [codigoIBGE]);

    const InfoRow = ({ label, value, icon, color }: { label: string; value: string; icon: string; color?: string }) => (
        <div className="flex justify-between items-center p-2.5 md:p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 group">
            <div className="flex items-center gap-2">
                <div className={`size-7 md:size-8 rounded-lg ${color?.replace('text-', 'bg-').split(' ')[0]}/10 flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-sm md:text-base ${color || 'text-slate-400'}`}>{icon}</span>
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-[10px] md:text-[11px] font-black uppercase tracking-tight">{label}</span>
            </div>
            <span className="text-navy-dark dark:text-white font-black text-xs md:text-sm">{value}</span>
        </div>
    );

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 md:px-5 py-3 md:py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/10">
                <h3 className="text-navy-dark dark:text-white text-sm md:text-lg font-black uppercase tracking-widest">Geral</h3>
                <span className="material-symbols-outlined text-slate-300 text-lg md:text-xl">explore</span>
            </div>
            <div className="p-3 md:p-5 space-y-2">
                <InfoRow label="IDH Município" value={`${idh.toFixed(3)} (${idh >= 0.8 ? 'Muito Alto' : idh >= 0.7 ? 'Alto' : 'Médio'})`} icon="trending_up" color="text-emerald-500" />
                <InfoRow label="PIB per Capita" value={`R$ ${pibPerCapita.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon="payments" color="text-blue-500" />

                {loading ? (
                    <div className="space-y-2 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-11 bg-slate-100 dark:bg-slate-700 rounded-lg"></div>
                        ))}
                    </div>
                ) : ibge && (
                    <>
                        <InfoRow label="População" value={`${parseInt(ibge.populacao).toLocaleString('pt-BR')} hab`} icon="groups" color="text-indigo-500" />
                        <InfoRow label="Área Territorial" value={`${parseFloat(ibge.area).toLocaleString('pt-BR')} km²`} icon="map" color="text-amber-500" />
                        <InfoRow label="Densidade" value={`${parseFloat(ibge.densidade).toLocaleString('pt-BR')} hab/km²`} icon="grid_view" color="text-purple-500" />
                    </>
                )}
            </div>
        </div>
    );
};

export default InfoGeraisCard;
