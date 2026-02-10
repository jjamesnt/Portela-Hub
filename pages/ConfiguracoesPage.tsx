
import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';

interface ConfiguracoesPageProps {
    navigateTo: (page: string, params?: { [key: string]: any }) => void;
}

const ConfiguracoesPage: React.FC<ConfiguracoesPageProps> = ({ navigateTo }) => {
    const [activeTab, setActiveTab] = useState('Aparência');
    const { theme, toggleTheme } = useAppContext();

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Meu Perfil':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h3 className="text-lg md:text-xl font-black text-navy-dark dark:text-white">Informações do Perfil</h3>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-6 md:mb-8">Gerencie suas informações pessoais.</p>
                        <form className="space-y-4 md:space-y-6 max-w-xl">
                            <div>
                                <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
                                <input type="text" value="Alê Portela" disabled className="w-full mt-1.5 p-2.5 md:p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Email</label>
                                <input type="email" value="ale.portela@gabinete.gov.br" disabled className="w-full mt-1.5 p-2.5 md:p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed" />
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
                <div className="md:col-span-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 md:p-8">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default ConfiguracoesPage;
