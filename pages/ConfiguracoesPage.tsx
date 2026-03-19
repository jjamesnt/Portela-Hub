
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { supabase } from '../services/supabaseClient';
import { Profile } from '../types';
import Loader from '../components/Loader';
import { NovoUsuarioModal } from '../components/NovoUsuarioModal';

interface ConfiguracoesPageProps {
    navigateTo: (page: string, params?: { [key: string]: any }) => void;
}

const ConfiguracoesPage: React.FC<ConfiguracoesPageProps> = ({ navigateTo }) => {
    const { theme, toggleTheme, profile, signOut } = useAppContext();
    const [activeTab, setActiveTab] = useState('Aparência');
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loadingProfiles, setLoadingProfiles] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [isNovoUsuarioModalOpen, setIsNovoUsuarioModalOpen] = useState(false);

    const isAdmin = profile?.role === 'master' || profile?.role === 'admin';
    const isMaster = profile?.role === 'master';

    useEffect(() => {
        if (activeTab === 'Gestão de Acessos' && isMaster) {
            loadProfiles();
        }
    }, [activeTab, isMaster]);

    const loadProfiles = async () => {
        setLoadingProfiles(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProfiles(data || []);
        } catch (err) {
            console.error('Erro ao carregar perfis:', err);
        } finally {
            setLoadingProfiles(false);
        }
    };

    const handleUpdateStatus = async (userId: string, newStatus: 'active' | 'blocked') => {
        setActionLoading(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ status: newStatus })
                .eq('id', userId);

            if (error) throw error;
            setProfiles(prev => prev.map(p => p.id === userId ? { ...p, status: newStatus } : p));
        } catch (err) {
            console.error('Erro ao atualizar status:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateRole = async (userId: string, newRole: 'admin' | 'user') => {
        if (!isMaster) return;
        setActionLoading(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;
            setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: newRole } : p));
        } catch (err) {
            console.error('Erro ao atualizar cargo:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Meu Perfil':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-start mb-6 md:mb-8">
                            <div>
                                <h3 className="text-lg md:text-xl font-black text-navy-dark dark:text-white">Informações do Perfil</h3>
                                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Gerencie suas informações pessoais.</p>
                            </div>
                            <button
                                onClick={signOut}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-black hover:bg-rose-100 transition-all uppercase tracking-widest"
                            >
                                <span className="material-symbols-outlined text-sm">logout</span>
                                Sair
                            </button>
                        </div>
                        <form className="space-y-4 md:space-y-6 max-w-xl">
                            <div>
                                <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
                                <input type="text" value={profile?.full_name || ''} disabled className="w-full mt-1.5 p-2.5 md:p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Email</label>
                                <input type="email" value={profile?.email || ''} disabled className="w-full mt-1.5 p-2.5 md:p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Cargo / Nível</label>
                                <div className="mt-1.5 inline-flex px-3 py-1 bg-turquoise/10 text-turquoise rounded-lg text-xs font-black uppercase tracking-wider">
                                    {profile?.role}
                                </div>
                            </div>
                        </form>
                    </div>
                );
            case 'Aparência':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h3 className="text-lg md:text-xl font-black text-navy-dark dark:text-white">Aparência</h3>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-6 md:mb-8">Personalize a aparência do Portela Hub.</p>
                        <div className="flex items-center justify-between p-4 md:p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            <div>
                                <span className="font-bold text-sm md:text-base text-navy-dark dark:text-slate-200">Modo Escuro</span>
                                <p className="text-[10px] md:text-xs text-slate-400">Alternar entre temas claro e escuro</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`w-12 h-6 md:w-14 md:h-7 rounded-full flex items-center p-1 transition-all duration-300 ${theme === 'dark' ? 'bg-turquoise shadow-inner' : 'bg-slate-300 shadow-inner'}`}
                            >
                                <div className={`size-4 md:size-5 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${theme === 'dark' ? 'translate-x-6 md:translate-x-7' : 'translate-x-0'}`}>
                                    <span className="material-symbols-outlined text-[10px] md:text-xs text-slate-400">
                                        {theme === 'dark' ? 'dark_mode' : 'light_mode'}
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>
                );
            case 'Gestão de Acessos':
                if (!isMaster) return null;
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg md:text-xl font-black text-navy-dark dark:text-white">Gestão de Usuários</h3>
                                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Controle quem pode acessar o portal e seus níveis de permissão.</p>
                            </div>
                            <button
                                onClick={() => setIsNovoUsuarioModalOpen(true)}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black transition-all shadow-md hover:shadow-lg shrink-0"
                            >
                                <span className="material-symbols-outlined text-sm">person_add</span>
                                Novo Usuário
                            </button>
                        </div>

                        {loadingProfiles ? (
                            <div className="py-12 flex justify-center"><Loader /></div>
                        ) : (
                            <div className="overflow-x-auto -mx-5 md:mx-0">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-700">
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status / Nível</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {profiles.map(p => (
                                            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-navy-dark dark:text-white">{p.full_name}</span>
                                                        <span className="text-[11px] text-slate-400 font-medium">{p.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className={`inline-flex self-start px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${p.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                            p.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-rose-100 text-rose-700'
                                                            }`}>
                                                            {p.status}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-turquoise uppercase tracking-widest">{p.role}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {p.id === profile?.id ? (
                                                            <span className="text-[10px] font-bold text-slate-300">Você</span>
                                                        ) : (
                                                            <>
                                                                {p.status === 'pending' && (
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(p.id, 'active')}
                                                                        className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all shadow-sm"
                                                                        title="Aprovar Acesso"
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">person_add</span>
                                                                    </button>
                                                                )}
                                                                {p.status === 'active' && (
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(p.id, 'blocked')}
                                                                        className="p-1.5 bg-slate-100 text-slate-400 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-all"
                                                                        title="Bloquear Acesso"
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">block</span>
                                                                    </button>
                                                                )}
                                                                {p.status === 'blocked' && (
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(p.id, 'active')}
                                                                        className="p-1.5 bg-slate-100 text-slate-400 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all font-black"
                                                                        title="Desbloquear"
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                                                    </button>
                                                                )}
                                                                {isMaster && p.role === 'user' && (
                                                                    <button
                                                                        onClick={() => handleUpdateRole(p.id, 'admin')}
                                                                        className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all shadow-sm font-black"
                                                                        title="Promover a Coordenador (Admin)"
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">military_tech</span>
                                                                    </button>
                                                                )}
                                                                {isMaster && p.role === 'admin' && (
                                                                    <div className="flex gap-1">
                                                                        <button
                                                                            onClick={() => handleUpdateRole(p.id, 'master')}
                                                                            className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-all shadow-sm font-black"
                                                                            title="Promover a Master Administrador"
                                                                        >
                                                                            <span className="material-symbols-outlined text-sm">workspace_premium</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleUpdateRole(p.id, 'user')}
                                                                            className="p-1.5 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200 transition-all shadow-sm font-black"
                                                                            title="Remover Admin (Voltar a Usuário)"
                                                                        >
                                                                            <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                                {isMaster && p.role === 'master' && (
                                                                    <button
                                                                        onClick={() => handleUpdateRole(p.id, 'admin')}
                                                                        className="p-1.5 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200 transition-all shadow-sm font-black"
                                                                        title="Rebaixar a Coordenador (Admin)"
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <NovoUsuarioModal
                            isOpen={isNovoUsuarioModalOpen}
                            onClose={() => setIsNovoUsuarioModalOpen(false)}
                            onSuccess={loadProfiles}
                        />
                    </div>
                );
            case 'Notificações':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h3 className="text-lg md:text-xl font-black text-navy-dark dark:text-white">Notificações</h3>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-6 md:mb-8">Escolha como você recebe as atualizações.</p>
                        <div className="space-y-3 md:space-y-4">
                            {[
                                { id: 'n1', label: 'Novas demandas na sua região', sub: 'Receba alertas sobre novas solicitações locais' },
                                { id: 'n2', label: 'Atualizações de lideranças', sub: 'Notificar quando houver mudanças no status' },
                                { id: 'n3', label: 'Resumo semanal por e-mail', sub: 'Um relatório consolidado toda segunda-feira' }
                            ].map((item, idx) => (
                                <div key={item.id} className="flex items-center justify-between p-4 md:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                    <div className="flex-1 pr-4">
                                        <label htmlFor={item.id} className="font-bold text-sm md:text-base text-navy-dark dark:text-slate-200 cursor-pointer">{item.label}</label>
                                        <p className="text-[10px] md:text-xs text-slate-400">{item.sub}</p>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id={item.id} className="sr-only peer" defaultChecked={idx < 2} />
                                        <div className="w-10 h-5 md:w-11 md:h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:md:h-5 after:md:w-5 after:transition-all peer-checked:bg-turquoise"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default: return null;
        }
    }

    const tabs = ['Meu Perfil', 'Aparência', 'Notificações'];
    if (isMaster) tabs.splice(2, 0, 'Gestão de Acessos');

    return (
        <div className="p-4 md:p-8 pb-24 md:pb-8">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-navy-dark dark:text-white mb-6 md:mb-8">Configurações</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
                <div className="md:col-span-1">
                    <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`whitespace-nowrap md:w-full text-left px-4 py-2 md:py-2.5 rounded-xl font-bold text-[11px] md:text-sm transition-all ${activeTab === tab ? 'bg-turquoise text-white shadow-lg shadow-turquoise/20' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="md:col-span-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 md:p-8 min-h-[400px]">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default ConfiguracoesPage;
