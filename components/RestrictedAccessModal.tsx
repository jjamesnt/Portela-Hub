import React from 'react';

interface RestrictedAccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RestrictedAccessModal: React.FC<RestrictedAccessModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
                <div className="p-6 md:p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-3xl text-rose-500">lock</span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Acesso Restrito</h2>
                    
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                        Para visualizar os dados completos ou realizar alterações, por favor contate o administrador do sistema.
                    </p>
                    
                    <button
                        onClick={onClose}
                        className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold py-3 px-4 rounded-xl transition-colors"
                    >
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RestrictedAccessModal;
