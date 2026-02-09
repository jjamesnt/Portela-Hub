
import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';

interface ConfiguracoesPageProps {
    navigateTo: (page: string, params?: { [key:string]: any }) => void;
}

const ConfiguracoesPage: React.FC<ConfiguracoesPageProps> = ({ navigateTo }) => {
    const [activeTab, setActiveTab] = useState('Aparência');
    const { theme, toggleTheme } = useAppContext();

    const renderTabContent = () => {
        switch(activeTab) {
            case 'Meu Perfil':
                return (
                    <div>
                        <h3 className="text-lg font-bold text-navy-dark dark:text-white">Informações do Perfil</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Gerencie suas informações pessoais.</p>
                        <form className="space-y-4">
                            <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400">Nome Completo</label><input type="text" value="Alê Portela" disabled className="w-full mt-1 bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-lg"/></div>
                            <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400">Email</label><input type="email" value="ale.portela@gabinete.gov.br" disabled className="w-full mt-1 bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-lg"/></div>
                        </form>
                    </div>
                );
            case 'Aparência':
                return (
                    <div>
                        <h3 className="text-lg font-bold text-navy-dark dark:text-white">Aparência</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Personalize a aparência do Portela Hub.</p>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
                            <span className="font-semibold text-sm text-navy-dark dark:text-slate-200">Modo Escuro</span>
                            <button onClick={toggleTheme} className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${theme === 'dark' ? 'bg-turquoise' : 'bg-slate-300'}`}>
                                <span className={`size-4 bg-white rounded-full shadow transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></span>
                            </button>
                        </div>
                    </div>
                );
            case 'Notificações':
                 return (
                    <div>
                        <h3 className="text-lg font-bold text-navy-dark dark:text-white">Notificações</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Escolha como você recebe as atualizações.</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700"><label htmlFor="n1" className="font-semibold text-sm text-navy-dark dark:text-slate-200">Novas demandas na sua região</label><input type="checkbox" id="n1" className="rounded text-turquoise focus:ring-turquoise/50" defaultChecked/></div>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700"><label htmlFor="n2" className="font-semibold text-sm text-navy-dark dark:text-slate-200">Atualizações de lideranças</label><input type="checkbox" id="n2" className="rounded text-turquoise focus:ring-turquoise/50" defaultChecked/></div>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700"><label htmlFor="n3" className="font-semibold text-sm text-navy-dark dark:text-slate-200">Resumo semanal por e-mail</label><input type="checkbox" id="n3" className="rounded text-turquoise focus:ring-turquoise/50"/></div>
                        </div>
                    </div>
                );
            default: return null;
        }
    }

    const tabs = ['Meu Perfil', 'Aparência', 'Notificações'];

    return (
        <div className="p-8">
             <h2 className="text-3xl font-black tracking-tight text-navy-dark dark:text-white mb-8">Configurações</h2>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                    <div className="space-y-1">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors ${activeTab === tab ? 'bg-turquoise/10 text-turquoise' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'}`}>{tab}</button>
                    ))}
                    </div>
                </div>
                <div className="md:col-span-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    {renderTabContent()}
                </div>
             </div>
        </div>
    );
};

export default ConfiguracoesPage;
