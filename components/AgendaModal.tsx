import React, { useState, useEffect } from 'react';
import { createEvento } from '../services/api';

interface AgendaModalProps {
    isOpen: boolean;
    initialDate?: string;
    onClose: () => void;
    onSuccess: () => void;
}

const AgendaModal: React.FC<AgendaModalProps> = ({ isOpen, initialDate, onClose, onSuccess }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        titulo: '',
        data: '',
        hora: '',
        tipo: 'Reunião',
        origem: 'Alê Portela',
        privacidade: 'Público',
        local: '',
        descricao: ''
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({
                ...prev,
                data: initialDate || new Date().toISOString().split('T')[0]
            }));
        }
    }, [isOpen, initialDate]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            await createEvento({
                titulo: formData.titulo,
                data: formData.data,
                hora: formData.hora,
                tipo: formData.tipo as any,
                origem: formData.origem as any,
                privacidade: formData.privacidade as any,
                local: formData.local,
                descricao: formData.descricao
            });
            onSuccess();
            onClose();
            setFormData({
                titulo: '',
                data: '',
                hora: '',
                tipo: 'Reunião',
                origem: 'Alê Portela',
                privacidade: 'Público',
                local: '',
                descricao: ''
            });
        } catch (err: any) {
            setError(err.message || 'Erro ao criar evento');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10002] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200 border border-white/20">
                <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <div>
                        <h3 className="font-black text-xl text-navy-dark dark:text-white">Novo Evento</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Adicionar à agenda oficial</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Título do Evento *</label>
                        <input
                            type="text"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleInputChange}
                            placeholder="Ex: Reunião com Prefeito"
                            required
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-turquoise/20 focus:border-turquoise transition-all dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Data *</label>
                            <input
                                type="date"
                                name="data"
                                value={formData.data}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-turquoise/20 focus:border-turquoise transition-all dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Hora *</label>
                            <input
                                type="time"
                                name="hora"
                                value={formData.hora}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-turquoise/20 focus:border-turquoise transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Privacidade</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, privacidade: 'Público' }))}
                                    className={`flex-1 py-2.5 px-2 rounded-2xl border text-[9px] font-black transition-all flex flex-col items-center gap-1 ${formData.privacidade === 'Público' ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'}`}
                                >
                                    <span className="material-symbols-outlined text-base">public</span>
                                    PÚBLICO
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, privacidade: 'Particular' }))}
                                    className={`flex-1 py-2.5 px-2 rounded-2xl border text-[9px] font-black transition-all flex flex-col items-center gap-1 ${formData.privacidade === 'Particular' ? 'bg-amber-50 border-amber-500 text-amber-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'}`}
                                >
                                    <span className="material-symbols-outlined text-base">lock</span>
                                    PARTICULAR
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tipo</label>
                            <select
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleInputChange}
                                className="w-full px-3 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-turquoise/20 focus:border-turquoise transition-all dark:text-white"
                            >
                                <option value="Reunião">Reunião</option>
                                <option value="Visita Técnica">Visita Técnica</option>
                                <option value="Evento Público">Evento Público</option>
                                <option value="Sessão Plenária">Sessão Plenária</option>
                                <option value="Festa/Comemoração">Festa/Comemoração</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Agenda de Origem *</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 flex items-center gap-3 p-3 border rounded-2xl cursor-pointer transition-all ${formData.origem === 'Alê Portela' ? 'bg-turquoise/10 border-turquoise shadow-sm' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
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
                                <span className={`text-sm font-black ${formData.origem === 'Alê Portela' ? 'text-turquoise' : 'text-slate-500'}`}>Alê</span>
                            </label>

                            <label className={`flex-1 flex items-center gap-3 p-3 border rounded-2xl cursor-pointer transition-all ${formData.origem === 'Lincoln Portela' ? 'bg-blue-600/10 border-blue-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
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
                                <span className={`text-sm font-black ${formData.origem === 'Lincoln Portela' ? 'text-blue-600' : 'text-slate-500'}`}>Lincoln</span>
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
                            placeholder="Câmara, Gabinete..."
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-turquoise/20 focus:border-turquoise transition-all dark:text-white"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            {error}
                        </div>
                    )}

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-black hover:bg-slate-200 dark:hover:bg-slate-600 transition-all uppercase tracking-widest"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-4 py-4 bg-navy-dark dark:bg-turquoise text-white rounded-2xl text-xs font-black hover:brightness-110 shadow-lg transition-all disabled:opacity-70 flex justify-center items-center gap-2 uppercase tracking-widest"
                        >
                            {isSaving ? (
                                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined text-[20px]">check</span>
                            )}
                            Salvar Evento
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AgendaModal;
