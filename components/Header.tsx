
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

const Header: React.FC = () => {
    const { theme, toggleTheme, selectedMandato, setSelectedMandato, toggleSidebar } = useAppContext();

    return (
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-8 shrink-0 gap-4">

            {/* Mobile Menu Button */}
            <button
                onClick={toggleSidebar}
                className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg"
            >
                <span className="material-symbols-outlined">menu</span>
            </button>

            <div className="hidden md:flex items-center gap-6 flex-1 max-w-4xl">
                <div className="relative w-full max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <span className="material-symbols-outlined text-lg">search</span>
                    </span>
                    <input className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 transition-all" placeholder="Buscar no Portela Hub..." type="text" />
                </div>
            </div>

            <div className="flex-1 md:flex-none overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 whitespace-nowrap min-w-fit shadow-inner">
                    <button
                        onClick={() => setSelectedMandato('Todos')}
                        className={`px-3 md:px-4 py-2 rounded-xl text-[9px] md:text-xs font-black uppercase tracking-wider transition-all ${selectedMandato === 'Todos'
                            ? 'bg-navy-dark text-white shadow-lg shadow-navy-dark/20'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setSelectedMandato('Lincoln Portela')}
                        className={`px-3 md:px-4 py-2 rounded-xl text-[9px] md:text-xs font-black uppercase tracking-wider transition-all ${selectedMandato === 'Lincoln Portela'
                            ? 'bg-[#8db641] text-white shadow-lg shadow-[#8db641]/20'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                    >
                        Lincoln
                    </button>
                    <button
                        onClick={() => setSelectedMandato('Alê Portela')}
                        className={`px-3 md:px-4 py-2 rounded-xl text-[9px] md:text-xs font-black uppercase tracking-wider transition-all ${selectedMandato === 'Alê Portela'
                            ? 'bg-turquoise text-white shadow-lg shadow-turquoise/20'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                    >
                        Alê
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 shrink-0">
                <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-full">
                    <span className="material-symbols-outlined">search</span>
                </button>
                <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <span className="material-symbols-outlined">{theme === 'dark' ? 'dark_mode' : 'light_mode'}</span>
                </button>
            </div>
        </header>
    );
};
export default Header;
