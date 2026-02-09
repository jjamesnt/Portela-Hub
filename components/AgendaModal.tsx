
import React, { useState } from 'react';
import { createEvento } from '../services/api';

interface AgendaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AgendaModal: React.FC<AgendaModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        titulo: '',
        data: '',
        hora: '',
        tipo: 'Reunião',
        origem: 'Alê Portela',
        local: '',
        descricao: ''
    });

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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <h3 className="font-black text-xl text-navy-custom dark:text-white">Novo Evento</h3>
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
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white"
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
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white"
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
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Agenda de Origem *</label>
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tipo</label>
                            <select
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white"
                            >
                                <option value="Reunião">Reunião</option>
                                <option value="Visita Técnica">Visita Técnica</option>
                                <option value="Evento Público">Evento Público</option>
                                <option value="Sessão Plenária">Sessão Plenária</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Local</label>
                            <input
                                type="text"
                                name="local"
                                value={formData.local}
                                onChange={handleInputChange}
                                placeholder="Ex: Gabinete"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white"
                            />
                        </div>
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
                            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-black hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                        >
                            CANCELAR
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-4 py-3 bg-turquoise text-white rounded-xl text-sm font-black hover:brightness-110 shadow-lg shadow-turquoise/20 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                        >
                            {isSaving ? (
                                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined text-[20px]">save</span>
                            )}
                            SALVAR
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AgendaModal;
