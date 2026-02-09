
import React from 'react';
import { LiderancaLocal } from '../types';

interface LiderancasLocaisCardProps {
    liderancas: LiderancaLocal[];
}

const LiderancasLocaisCard: React.FC<LiderancasLocaisCardProps> = ({ liderancas }) => {
    
    const cargoStyle = (cargo: LiderancaLocal['cargo']) => {
        switch (cargo) {
            case 'Prefeito': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Vereador': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
        }
    }
    
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-navy-custom dark:text-white text-lg font-bold">Lideranças Locais</h3>
                <button className="bg-primary/10 text-primary text-[10px] font-extrabold px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-all uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">person_add</span>
                    Adicionar
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b border-slate-100 dark:border-slate-700">
                        <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase text-left">Nome / Partido</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase text-center">Cargo / Função</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {liderancas.map(lider => (
                            <tr key={lider.nome} className="hover:bg-slate-50/30 dark:hover:bg-slate-700/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-navy-custom dark:bg-slate-600 text-white flex items-center justify-center font-bold text-xs">{lider.avatarInitials}</div>
                                        <div>
                                            <p className="text-sm font-bold text-navy-custom dark:text-white">{lider.nome}</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{lider.partido}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-wider ${cargoStyle(lider.cargo)}`}>{lider.cargo}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-[18px]">visibility</span></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 text-center border-t border-slate-100 dark:border-slate-700">
                <button className="text-slate-400 text-[10px] font-bold hover:text-primary transition-colors uppercase tracking-widest">Visualizar todas as lideranças</button>
            </div>
        </div>
    );
};

export default LiderancasLocaisCard;
