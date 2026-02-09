
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

interface SidebarProps {
    activePage: string;
    setActivePage: (page: string) => void;
}

const navItems = [
    { label: 'Dashboard', icon: 'dashboard' },
    { label: 'Municípios', icon: 'location_city' },
    { label: 'Lideranças', icon: 'groups' },
    { label: 'Assessores', icon: 'badge' },
    { label: 'Agenda', icon: 'calendar_today' },
    { label: 'Recursos', icon: 'payments' },
    { label: 'Demandas', icon: 'assignment' },
    { label: 'Configurações', icon: 'settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
    const { selectedMandato } = useAppContext();

    const isActive = (itemLabel: string) => {
        if (itemLabel === 'Municípios' && activePage === 'MunicipioDetalhes') {
            return true;
        }
        return activePage === itemLabel;
    };

    return (
        <aside className="w-64 bg-navy-dark text-white flex flex-col shrink-0">
            <div className="p-6 flex items-center gap-3 border-b border-white/5 bg-navy-darker">
                {selectedMandato === 'Alê Portela' ? (
                    <div className="h-12 w-full flex items-center justify-center p-1 bg-white/5 rounded-lg overflow-hidden group transition-all hover:bg-white/10">
                        <img
                            src="/assets/logos/ale_logo_v1.png"
                            alt="Alê Portela"
                            className="max-h-full max-w-full object-contain"
                        />
                    </div>
                ) : selectedMandato === 'Lincoln Portela' ? (
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-turquoise flex items-center justify-center shadow-lg shadow-turquoise/20">
                            <span className="material-symbols-outlined text-white font-bold">account_balance</span>
                        </div>
                        <div>
                            <h1 className="text-sm font-extrabold tracking-tight leading-none text-white">Dep. Federal</h1>
                            <h2 className="text-lg font-black text-turquoise tracking-tighter">Lincoln Portela</h2>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-turquoise flex items-center justify-center shadow-lg shadow-turquoise/20">
                            <span className="material-symbols-outlined text-white font-bold">hub</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-extrabold tracking-tight leading-none text-white">Portela <span className="text-turquoise">Hub</span></h1>
                            <p className="text-[10px] text-turquoise/70 uppercase tracking-widest font-bold mt-0.5">Gestão Inteligente</p>
                        </div>
                    </div>
                )}
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {navItems.map(item => (
                    <button
                        key={item.label}
                        onClick={() => setActivePage(item.label)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left ${isActive(item.label)
                            ? 'sidebar-active text-white'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-white/10 bg-[#001a38]">
                <div className="flex items-center gap-2 mb-4 px-1">
                    <span className="material-symbols-outlined text-turquoise text-xl">bolt</span>
                    <h3 className="text-sm font-bold text-white">Ações Rápidas</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10 group">
                        <span className="material-symbols-outlined text-turquoise mb-1 text-xl group-hover:scale-110 transition-transform">person_add</span>
                        <span className="text-[9px] font-bold text-turquoise uppercase tracking-wider text-center leading-tight">Nova Liderança</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10 group">
                        <span className="material-symbols-outlined text-turquoise mb-1 text-xl group-hover:scale-110 transition-transform">upload_file</span>
                        <span className="text-[9px] font-bold text-turquoise uppercase tracking-wider text-center leading-tight">Importar CSV</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10 group">
                        <span className="material-symbols-outlined text-turquoise mb-1 text-xl group-hover:scale-110 transition-transform">mail</span>
                        <span className="text-[9px] font-bold text-turquoise uppercase tracking-wider text-center leading-tight">Enviar Ofício</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10 group">
                        <span className="material-symbols-outlined text-turquoise mb-1 text-xl group-hover:scale-110 transition-transform">print</span>
                        <span className="text-[9px] font-bold text-turquoise uppercase tracking-wider text-center leading-tight">Gerar PDF</span>
                    </button>
                </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-center text-slate-400">
                v2.0.1 (Deploy Fix)
            </div>
        </aside>
    );
}

export default Sidebar;
