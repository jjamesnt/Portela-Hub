
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

const Header: React.FC = () => {
    const { theme, toggleTheme, filters, setFilters } = useAppContext();

    return (
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-6 flex-1 max-w-4xl">
                <div className="relative w-full max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <span className="material-symbols-outlined text-lg">search</span>
                    </span>
                    <input className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 transition-all" placeholder="Buscar no Portela Hub..." type="text" />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <span className="material-symbols-outlined">{theme === 'dark' ? 'dark_mode' : 'light_mode'}</span>
                </button>
            </div>
        </header>
    );
};
export default Header;
