import React, { useEffect, useState } from 'react';
import { fetchContatoById, updateContatoAvatar } from '../services/contatosApi';
import Loader from '../../../../components/Loader';
import ImageUpload from '../../../../components/ImageUpload';

interface ContatoPerfilDetalhadoProps {
    contatoId?: string;
    tipo?: string;
    navigateTo: (page: string, params?: any) => void;
}

export const ContatoPerfilDetalhado: React.FC<ContatoPerfilDetalhadoProps> = ({ contatoId, tipo, navigateTo }) => {
    const [contato, setContato] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatingFoto, setUpdatingFoto] = useState(false);

    const [tipoAtual, setTipoAtual] = useState<string>(tipo || '');
    const [originalId, setOriginalId] = useState<string>('');

    useEffect(() => {
        const load = async () => {
            if (!contatoId) return;
            
            let inferredTipo = tipo || '';
            let originalId = contatoId;
            
            if (!inferredTipo) {
                if (contatoId.startsWith('lid_')) {
                    inferredTipo = 'Liderança';
                    originalId = contatoId.substring(4);
                } else if (contatoId.startsWith('ass_')) {
                    inferredTipo = 'Assessor';
                    originalId = contatoId.substring(4);
                } else if (contatoId.startsWith('apo_')) {
                    inferredTipo = 'Apoiador';
                    originalId = contatoId.substring(4);
                }
            } else {
                // Se já vier o tipo, apenas removemos o prefixo se existir
                if (contatoId.includes('_')) {
                    originalId = contatoId.split('_')[1];
                }
            }
            
            setTipoAtual(inferredTipo);
            setOriginalId(originalId);
            
            const data = await fetchContatoById(inferredTipo, originalId);
            setContato(data);
            setLoading(false);
        };
        load();
    }, [contatoId]);

    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center h-full">
                <Loader />
            </div>
        );
    }

    if (!contato) {
        return (
            <div className="p-8 text-center text-slate-500 font-bold">
                Contato não encontrado.
            </div>
        );
    }

    const handleUpdateFoto = async (base64: string) => {
        setUpdatingFoto(true);
        const success = await updateContatoAvatar(tipoAtual, originalId, base64);
        if (success) {
            setContato((prev: any) => ({
                ...prev,
                avatar_url: tipoAtual !== 'Apoiador' ? base64 : prev.avatar_url,
                foto_url: tipoAtual === 'Apoiador' ? base64 : prev.foto_url
            }));
        }
        setUpdatingFoto(false);
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-24">
            {/* Header / Basic Info */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4 mb-4">
                    <button 
                        onClick={() => navigateTo('Contatos')}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-2 -ml-2"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-2xl font-black text-navy-dark dark:text-white tracking-tight">Perfil do Contato</h1>
                </div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="relative group">
                        <ImageUpload 
                            currentImage={contato.avatar_url || contato.foto_url}
                            onImageSelected={handleUpdateFoto}
                        />
                        {updatingFoto && (
                            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center z-10">
                                <span className="material-symbols-outlined text-white animate-spin">refresh</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-1 text-center md:text-left mt-2 md:mt-0">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-navy-dark dark:text-white">{contato.nome}</h2>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-slate-100 text-slate-600 border-slate-200">
                                {tipoAtual}
                            </span>
                        </div>
                        <p className="text-slate-500 font-medium">
                            {contato.cargo || 'Sem cargo'} {contato.partido ? `(${contato.partido})` : ''}
                        </p>
                        <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                            {contato.telefone && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-[16px] text-turquoise">call</span>
                                    {contato.telefone}
                                </div>
                            )}
                            {contato.email && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-[16px] text-turquoise">mail</span>
                                    {contato.email}
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <span className="material-symbols-outlined text-[16px] text-turquoise">location_on</span>
                                {contato.municipio_nome || contato.regiao_atuacao || 'Localidade não informada'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Infos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-navy-dark dark:text-white mb-4">Informações Gerais</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between border-b border-slate-50 dark:border-slate-700/50 pb-2">
                            <span className="text-sm text-slate-500">Cadastrado Por</span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{contato.cadastrado_por_nome || 'Desconhecido'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 dark:border-slate-700/50 pb-2">
                            <span className="text-sm text-slate-500">Origem</span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{contato.origem || 'Geral'}</span>
                        </div>
                        {contato.regiao && (
                            <div className="flex justify-between border-b border-slate-50 dark:border-slate-700/50 pb-2">
                                <span className="text-sm text-slate-500">Região</span>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{contato.regiao}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 opacity-50 relative">
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 rounded-2xl z-10 backdrop-blur-[2px]">
                        <span className="text-sm font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-full shadow-sm">Em Breve: Linha do Tempo</span>
                    </div>
                    <h3 className="text-lg font-bold text-navy-dark dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-turquoise">history</span>
                        Últimas Interações
                    </h3>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="w-2 bg-slate-200 rounded-full"></div>
                            <div>
                                <p className="text-sm text-slate-400">Nenhum registro ainda...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
