
import React, { useState, useEffect } from 'react';
import { Apoiador, Municipio } from '../types';
import { upsertApoiador } from '../services/api';
import ImageUpload from './ImageUpload';

interface ApoiadorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    municipio?: Municipio | null;
    allMunicipios?: Municipio[];
    editingApoiador?: Apoiador | null;
}

const ApoiadorModal: React.FC<ApoiadorModalProps> = ({ isOpen, onClose, onSuccess, municipio, allMunicipios, editingApoiador }) => {
    const [formData, setFormData] = useState<Partial<Apoiador>>({
        nome: '',
        cargo: '',
        telefone: '',
        endereco: '',
        email: '',
        fotoUrl: '',
        municipioId: municipio?.id || ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (editingApoiador) {
            setFormData(editingApoiador);
        } else {
            setFormData({
                nome: '',
                cargo: '',
                telefone: '',
                endereco: '',
                email: '',
                fotoUrl: '',
                municipioId: municipio?.id || ''
            });
        }
    }, [editingApoiador, municipio?.id, isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!formData.nome || !formData.municipioId) return;
        setIsSaving(true);
        try {
            await upsertApoiador(formData);
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Erro ao salvar apoiador", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-6 my-8">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
                    <div>
                        <h3 className="text-xl font-black text-navy-dark dark:text-white">
                            {editingApoiador ? 'Editar Apoiador' : 'Novo Apoiador'}
                        </h3>
                        {municipio ? (
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{municipio.nome}</p>
                        ) : (
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Selecione o Município</p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {!municipio && allMunicipios && (
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecione o Município para o Apoiador</label>
                        <select
                            value={formData.municipioId}
                            onChange={e => setFormData(prev => ({ ...prev, municipioId: e.target.value }))}
                            className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-navy-dark dark:text-white"
                        >
                            <option value="">Selecione um município...</option>
                            {allMunicipios.sort((a,b) => a.nome.localeCompare(b.nome)).map(m => (
                                <option key={m.id} value={m.id}>{m.nome}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center gap-4">
                        <ImageUpload 
                            currentImage={formData.fotoUrl}
                            onImageSelected={(img) => setFormData(prev => ({ ...prev, fotoUrl: img }))}
                        />
                        <p className="text-[10px] text-slate-400 font-bold uppercase text-center">Foto do Apoiador</p>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
                            <input 
                                type="text"
                                value={formData.nome}
                                onChange={e => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="Nome do apoiador"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo / Função</label>
                            <input 
                                type="text"
                                value={formData.cargo}
                                onChange={e => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="Ex: Liderança, Vereador..."
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone / WhatsApp</label>
                        <input 
                            type="text"
                            value={formData.telefone}
                            onChange={e => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                            className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="(31) 99999-9999"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail</label>
                        <input 
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="exemplo@email.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço</label>
                    <textarea 
                        value={formData.endereco}
                        onChange={e => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                        className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-20 resize-none"
                        placeholder="Endereço completo"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        disabled={isSaving}
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || !formData.nome || !formData.municipioId}
                        className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? 'Salvando...' : 'Salvar Apoiador'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApoiadorModal;
