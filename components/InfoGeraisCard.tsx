
import React from 'react';

interface InfoGeraisCardProps {
    idh: number;
    pibPerCapita: number;
}

const InfoGeraisCard: React.FC<InfoGeraisCardProps> = ({ idh, pibPerCapita }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-navy-custom dark:text-white text-lg font-bold">Informações Gerais</h3>
            <span className="material-symbols-outlined text-slate-400">explore</span>
        </div>
        <div className="p-5 space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">IDH Município</span>
                <span className="text-navy-custom dark:text-white font-extrabold">{idh.toFixed(3)} (Muito Alto)</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">PIB per Capita</span>
                <span className="text-navy-custom dark:text-white font-extrabold text-sm">R$ {pibPerCapita.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="mt-4 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <img alt="Mapa de BH" className="w-full h-32 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_8UKx2QdVlBiB33hs2iIHvxOrvZ3Ys1Yku8lWCK2BaQaRKyfT4EL3VJlCdGaqn3HFbmvRg1_UYeCv1MoiWs-tVr6aTnqLDksPXbeb48F_RFYxC14VhzRi0r6kjbw1swuXn6ThZFQW8R-9bQrW4M9LsppwWpnQPgnmZrP4LSZXolt7GZQ4DnOmju-rYwYtqphy7gPze9LYQ7vfhYIOxsdeZv1MQWIAlSzTUlJtQ3mjhAWJv8Uec4WrqRwhTNcFnMdV-aA6BVhkjogc" />
            </div>
        </div>
    </div>
);

export default InfoGeraisCard;
