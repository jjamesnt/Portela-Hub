
import React from 'react';

interface KpiCardProps {
    title: string;
    value: string;
    icon: string;
    trend: string;
    trendDirection: 'up' | 'down' | 'neutral';
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, trend, trendDirection }) => {
    const trendColor = {
        up: 'text-emerald-500',
        down: 'text-red-500',
        neutral: 'text-slate-400'
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-start mb-2 md:mb-4">
                <div className="p-1.5 md:p-2 bg-turquoise/10 rounded-lg">
                    <span className="material-symbols-outlined text-turquoise text-lg md:text-xl">{icon}</span>
                </div>
                <span className={`${trendColor[trendDirection]} text-[10px] md:text-xs font-bold flex items-center`}>
                    {trendDirection === 'up' && <span className="material-symbols-outlined text-xs md:text-sm">trending_up</span>}
                    {trendDirection === 'down' && <span className="material-symbols-outlined text-xs md:text-sm">trending_down</span>}
                    {trend}
                </span>
            </div>
            <p className="text-[10px] md:text-sm text-slate-500 font-medium truncate">{title}</p>
            <h3 className="text-lg md:text-2xl font-bold mt-0.5 md:mt-1 text-navy-dark dark:text-white truncate">{value}</h3>
        </div>
    );
};

export default KpiCard;
