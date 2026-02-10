import React, { useState, useEffect, useRef } from 'react';
import { createSolicitacaoAgenda, getLiderancas, getAssessores } from '../services/api';
import { SolicitacaoAgenda, Lideranca, Assessor } from '../types';

interface AgendaSolicitacaoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    navigateTo: (page: string, params?: { [key: string]: any }) => void;
}

const AgendaSolicitacaoModal: React.FC<AgendaSolicitacaoModalProps> = ({ isOpen, onClose, onSuccess, navigateTo }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [liderancas, setLiderancas] = useState<Lideranca[]>([]);
    const [assessores, setAssessores] = useState<Assessor[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredLiderancas, setFilteredLiderancas] = useState<Lideranca[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        solicitante: '',
        assessor_responsavel: '',
        estimativa_publico: '',
        titulo: '',
        data: '',
        hora_inicio: '',
        hora_fim: '',
        local: '',
        descricao: '',
        origem: 'Alê Portela' as 'Alê Portela' | 'Lincoln Portela'
    });

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setIsLoadingData(true);
                try {
                    const [leaders, staff] = await Promise.all([
                        getLiderancas(),
                        getAssessores()
                    ]);
                    setLiderancas(leaders);
                    setAssessores(staff);
                } catch (err) {
                    console.error('Erro ao carregar dados do formulário:', err);
                } finally {
                    setIsLoadingData(false);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    // Lógica de busca inteligente
    useEffect(() => {
        if (searchTerm.length < 2) {
            setFilteredLiderancas([]);
            return;
        }

        const normalize = (text: string) =>
            text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

        const search = normalize(searchTerm);
        const matches = liderancas.filter(l =>
            normalize(l.nome).includes(search) ||
            normalize(l.municipio).includes(search)
        );
        setFilteredLiderancas(matches.slice(0, 5));
    }, [searchTerm, liderancas]);

    // Fechar sugestões ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectLideranca = (l: Lideranca) => {
        setFormData(prev => ({ ...prev, solicitante: l.nome }));
        setSearchTerm(l.nome);
        setShowSuggestions(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            await createSolicitacaoAgenda({
                solicitante: formData.solicitante,
                titulo: formData.titulo,
                data: formData.data,
                hora_inicio: formData.hora_inicio,
                hora_fim: formData.hora_fim,
                local: formData.local,
                descricao: formData.descricao,
                origem: formData.origem,
                assessor_responsavel: formData.assessor_responsavel,
                estimativa_publico: formData.estimativa_publico ? parseInt(formData.estimativa_publico) : undefined,
            } as any);
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                solicitante: '',
                assessor_responsavel: '',
                estimativa_publico: '',
                titulo: '',
                data: '',
                hora_inicio: '',
                hora_fim: '',
                local: '',
                descricao: '',
                origem: 'Alê Portela'
            });
            setSearchTerm('');
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar solicitação');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg my-8 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-turquoise/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-turquoise">calendar_add_on</span>
                        </div>
                        <h3 className="font-black text-xl text-navy-dark dark:text-white">Solicitar Agenda</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Assessor Responsável - SEMPRE O PRIMEIRO */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">person_check</span>
                                Assessor Responsável *
                            </label>
                            <select
                                name="assessor_responsavel"
                                value={formData.assessor_responsavel}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-turquoise/20 focus:border-turquoise transition-all dark:text-white"
                            >
                                <option value="">Selecione o assessor...</option>
                                {assessores.map(a => (
                                    <option key={a.id} value={a.nome}>{a.nome}</option>
                                ))}
                            </select>
                        </div>

                        {/* Estimativa de Público */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">groups</span>
                                Estimativa de Público
                            </label>
                            <input
                                type="number"
                                name="estimativa_publico"
                                value={formData.estimativa_publico}
                                onChange={handleInputChange}
                                placeholder="Quantidade de pessoas"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-turquoise/20 focus:border-turquoise transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Solicitante com Busca Inteligente */}
                    <div ref={searchRef} className="relative">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">search</span>
                            Nome do Solicitante (Liderança) *
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setFormData(prev => ({ ...prev, solicitante: e.target.value }));
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="Busque por nome ou cidade..."
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-turquoise/20 focus:border-turquoise transition-all dark:text-white"
                        />

                        {showSuggestions && (searchTerm.length >= 2 || filteredLiderancas.length > 0) && (
                            <div className="absolute z-[110] left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                                {filteredLiderancas.map(l => (
                                    <button
                                        key={l.id}
                                        type="button"
                                        onClick={() => handleSelectLideranca(l)}
                                        className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 flex flex-col border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors"
                                    >
                                        <span className="text-sm font-bold text-navy-dark dark:text-white">{l.nome}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">{l.municipio} • {l.cargo} • {l.partido}</span>
                                    </button>
                                ))}

                                {filteredLiderancas.length === 0 && searchTerm.length >= 2 && (
                                    <div className="p-4 text-center">
                                        <p className="text-xs text-slate-500 mb-3 font-medium">Liderança não encontrada</p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClose();
                                                navigateTo('Lideranças');
                                            }}
                                            className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-black hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all border border-indigo-100 dark:border-indigo-800/30 flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">person_add</span>
                                            CADASTRAR NOVA LIDERANÇA
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Título do Compromisso *</label>
                        <input
                            type="text"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleInputChange}
                            placeholder="Ex: Reunião de Alinhamento Político"
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-turquoise/20 focus:border-turquoise transition-all dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Data *</label>
                            <input
                                type="date"
                                name="data"
                                value={formData.data}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-turquoise/20 focus:border-turquoise transition-all dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Início *</label>
                            <input
                                type="time"
                                name="hora_inicio"
                                value={formData.hora_inicio}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-turquoise/20 focus:border-turquoise transition-all dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fim *</label>
                            <input
                                type="time"
                                name="hora_fim"
                                value={formData.hora_fim}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-turquoise/20 focus:border-turquoise transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-black">Para quem é a agenda? *</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${formData.origem === 'Alê Portela' ? 'bg-turquoise/10 border-turquoise shadow-sm' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <div className={`size-4 rounded-full border flex items-center justify-center ${formData.origem === 'Alê Portela' ? 'border-turquoise bg-turquoise' : 'border-slate-300'}`}>
                                    {formData.origem === 'Alê Portela' && <div className="size-1.5 bg-white rounded-full"></div>}
                                </div>
                                <input
                                    type="radio"
                                    name="origem"
                                    value="Alê Portela"
                                    checked={formData.origem === 'Alê Portela'}
                                    onChange={handleInputChange}
                                    className="hidden"
                                />
                                <span className={`text-sm font-bold ${formData.origem === 'Alê Portela' ? 'text-turquoise' : 'text-slate-500'}`}>Alê Portela</span>
                            </label>

                            <label className={`flex-1 flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${formData.origem === 'Lincoln Portela' ? 'bg-blue-600/10 border-blue-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <div className={`size-4 rounded-full border flex items-center justify-center ${formData.origem === 'Lincoln Portela' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                                    {formData.origem === 'Lincoln Portela' && <div className="size-1.5 bg-white rounded-full"></div>}
                                </div>
                                <input
                                    type="radio"
                                    name="origem"
                                    value="Lincoln Portela"
                                    checked={formData.origem === 'Lincoln Portela'}
                                    onChange={handleInputChange}
                                    className="hidden"
                                />
                                <span className={`text-sm font-bold ${formData.origem === 'Lincoln Portela' ? 'text-blue-600' : 'text-slate-500'}`}>Lincoln Portela</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Local</label>
                        <input
                            type="text"
                            name="local"
                            value={formData.local}
                            onChange={handleInputChange}
                            placeholder="Ex: Assembleia Legislativa ou Online"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-turquoise/20 focus:border-turquoise transition-all dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Descrição / Informações Adicionais</label>
                        <textarea
                            name="descricao"
                            value={formData.descricao}
                            onChange={handleInputChange}
                            placeholder="Forneça detalhes que ajudem o gestor a entender o objetivo do compromisso..."
                            rows={3}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-turquoise/20 focus:border-turquoise transition-all dark:text-white resize-none"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            {error}
                        </div>
                    )}

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-black hover:bg-slate-200 dark:hover:bg-slate-600 transition-all uppercase tracking-wider"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-4 py-3 bg-turquoise text-white rounded-xl text-sm font-black hover:brightness-110 shadow-lg shadow-turquoise/20 transition-all disabled:opacity-70 flex justify-center items-center gap-2 uppercase tracking-wider"
                        >
                            {isSaving ? (
                                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined text-[20px]">send</span>
                            )}
                            Enviar Solicitação
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AgendaSolicitacaoModal;
