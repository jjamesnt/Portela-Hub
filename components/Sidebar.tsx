
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
    const { selectedMandato, isSidebarOpen, toggleSidebar } = useAppContext();

    const isActive = (itemLabel: string) => {
        if (itemLabel === 'Municípios' && activePage === 'MunicipioDetalhes') {
            return true;
        }
        return activePage === itemLabel;
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden glass"
                    onClick={toggleSidebar}
                />
            )}

            <aside
                className={`
                    fixed md:relative 
                    inset-y-0 left-0 z-[1050] 
                    w-64 bg-navy-dark text-white flex flex-col shrink-0 
                    transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0 shadow-2xl md:shadow-none' : '-translate-x-full md:translate-x-0'}
                `}
            >
                <div className="p-6 flex items-center gap-3 border-b border-white/5 bg-navy-darker">
                    {/* Mobile Close Button */}
                    <button
                        onClick={toggleSidebar}
                        className="absolute right-4 top-4 md:hidden text-slate-400 hover:text-white"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>

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
                            <div className="size-10 rounded-lg bg-[#8db641] flex items-center justify-center shadow-lg shadow-[#8db641]/20">
                                <span className="material-symbols-outlined text-white font-bold">account_balance</span>
                            </div>
                            <div>
                                <h1 className="text-sm font-extrabold tracking-tight leading-none text-white">Dep. Federal</h1>
                                <h2 className="text-lg font-black text-[#8db641] tracking-tighter">Lincoln Portela</h2>
                            </div>
                        </div>
                    ) : selectedMandato === 'Marilda Portela' ? (
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <span className="material-symbols-outlined text-white font-bold">person</span>
                            </div>
                            <div>
                                <h1 className="text-sm font-extrabold tracking-tight leading-none text-white">Vereadora</h1>
                                <h2 className="text-lg font-black text-orange-500 tracking-tighter">Marilda Portela</h2>
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
                            onClick={() => {
                                setActivePage(item.label);
                                if (window.innerWidth < 768) toggleSidebar();
                            }}
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

                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-white text-sm">support_agent</span>
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-xs font-bold text-white truncate">Suporte Técnico</span>
                                <span className="text-[10px] text-slate-400 truncate">James Rizo - (31) 98421-1900</span>
                            </div>
                        </div>

                        <a
                            href="https://wa.me/5531984211900?text=Preciso%20de%20suporte%20no%20Portela%20hub."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 p-2 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] transition-colors group"
                        >
                            <span className="text-lg">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.698c1.005.572 1.903.87 3.05.87 3.183 0 5.768-2.586 5.768-5.766.001-3.182-2.585-5.769-5.767-5.769c.001 0-.001 0-.001 0zm0 13.891c-1.372 0-2.618-.328-3.794-.954l-4.223 1.109 1.129-4.103c-.705-1.226-1.077-2.636-1.077-4.177 0-4.478 3.644-8.122 8.122-8.122 4.479 0 8.123 3.644 8.123 8.122s-3.645 8.125-8.122 8.127l-.158-.002z" />
                                    <path d="M15.424 12.864c-.182-.091-1.078-.532-1.244-.593-.166-.06-.288-.091-.409.091-.122.182-.471.593-.578.714-.106.121-.212.136-.394.045-.182-.09-0.77-.284-1.467-0.905-.544-.485-.911-1.084-1.017-1.266-.106-.182-.011-.28.08-.37.081-.081.182-.213.273-.319.091-.106.121-.182.182-.303.06-.121.03-.227-.015-.318-.046-.091-.409-.985-.561-1.349-.148-.354-.298-.306-.409-.312l-.348-.009c-.121 0-.318.046-.485.227-.167.182-.636.621-.636 1.516s.651 1.758.742 1.88c.091.121 1.281 1.956 3.104 2.743 1.823.787 1.823.525 2.157.495.333-.03 1.078-.44 1.229-.864.152-.424.152-.788.106-.864-.045-.076-.167-.121-.348-.212z" />
                                </svg>
                            </span>
                            <span className="text-xs font-bold">WhatsApp</span>
                        </a>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
