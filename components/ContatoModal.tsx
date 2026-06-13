import React, { useState, useEffect } from 'react';
import { upsertLideranca, upsertAssessor, upsertApoiador, getMunicipiosSimples } from '../services/api';
import { MunicipioDetalhado } from '../types';
import ImageUpload from './ImageUpload';

interface ContatoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ContatoModal: React.FC<ContatoModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [tipo, setTipo] = useState<'Liderança' | 'Assessor' | 'Apoiador'>('Liderança');
    const [formData, setFormData] = useState<any>({
        nome: '',
        cargo: '',
        telefone: '',
        email: '',
        enderecoStr: '',
        origem: 'Geral',
        // Lideranca
        municipio_nome: '',
        regiao: '',
        partido: '',
        // Assessor
        regiaoAtuacao: '',
        // Apoiador
        municipioId: '',
        fotoUrl: ''
    });
    
    const [isSaving, setIsSaving] = useState(false);
    const [municipios, setMunicipios] = useState<MunicipioDetalhado[]>([]);

    useEffect(() => {
        if (isOpen) {
            getMunicipiosSimples().then(setMunicipios);
            setFormData({
                nome: '',
                cargo: '',
                telefone: '',
                email: '',
                enderecoStr: '',
                origem: 'Geral',
                municipio_nome: '',
                regiao: '',
                partido: '',
                regiaoAtuacao: '',
                municipioId: '',
                fotoUrl: ''
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!formData.nome) return;
        setIsSaving(true);
        try {
            if (tipo === 'Liderança') {
                await upsertLideranca({
                    nome: formData.nome,
                    cargo: formData.cargo,
                    contato: formData.telefone,
                    email: formData.email,
                    origem: formData.origem,
                    municipio: formData.municipio_nome || formData.municipioId, // fallback
                    regiao: formData.regiao,
                    partido: formData.partido,
                    status: 'Ativo',
                    avatarUrl: formData.fotoUrl
                });
            } else if (tipo === 'Assessor') {
                await upsertAssessor({
                    nome: formData.nome,
                    cargo: formData.cargo,
                    telefone: formData.telefone,
                    email: formData.email,
                    origem: formData.origem,
                    regiaoAtuacao: formData.regiaoAtuacao,
                    avatarUrl: formData.fotoUrl
                });
            } else if (tipo === 'Apoiador') {
                await upsertApoiador({
                    nome: formData.nome,
                    cargo: formData.cargo,
                    telefone: formData.telefone,
                    email: formData.email,
                    endereco: formData.enderecoStr,
                    municipioId: formData.municipioId,
                    fotoUrl: formData.fotoUrl
                });
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Erro ao salvar contato", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-navy-dark/70 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-8 pb-4 shrink-0 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-black text-navy-dark dark:text-white">
                                Novo Contato
                            </h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                                Preencha as informações do contato
                            </p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 pt-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                    
                    {/* Tipo de Contato */}
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Contato</label>
                        <div className="flex gap-2 mt-1">
                            {['Liderança', 'Assessor', 'Apoiador'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTipo(t as any)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${tipo === t ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
                            <input 
                                type="text"
                                value={formData.nome || ''}
                                onChange={e => setFormData((prev: any) => ({ ...prev, nome: e.target.value }))}
                                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-sm font-bold"
                                placeholder="Nome do contato"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone / WhatsApp</label>
                            <input 
                                type="text"
                                value={formData.telefone || ''}
                                onChange={e => setFormData((prev: any) => ({ ...prev, telefone: e.target.value }))}
                                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-sm font-bold"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail</label>
                            <input 
                                type="email"
                                value={formData.email || ''}
                                onChange={e => setFormData((prev: any) => ({ ...prev, email: e.target.value }))}
                                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-sm font-bold"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo / Função</label>
                            <input 
                                type="text"
                                value={formData.cargo || ''}
                                onChange={e => setFormData((prev: any) => ({ ...prev, cargo: e.target.value }))}
                                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-sm font-bold"
                                placeholder="Ex: Vereador, Assessor..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço Completo</label>
                            <input 
                                type="text"
                                value={formData.enderecoStr || ''}
                                onChange={e => setFormData((prev: any) => ({ ...prev, enderecoStr: e.target.value }))}
                                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-sm font-bold"
                                placeholder="Rua, Número, Bairro..."
                            />
                        </div>
                        {tipo !== 'Apoiador' && (
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origem (Mandato)</label>
                                <select 
                                    value={formData.origem || 'Geral'}
                                    onChange={e => setFormData((prev: any) => ({ ...prev, origem: e.target.value }))}
                                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-sm font-bold"
                                >
                                    <option value="Geral">Geral / Não Informado</option>
                                    <option value="Alê Portela">Alê Portela</option>
                                    <option value="Lincoln Portela">Lincoln Portela</option>
                                    <option value="Marilda Portela">Marilda Portela</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Especificidades por Tipo */}
                    <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-2">
                        {tipo === 'Liderança' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Município (Nome)</label>
                                    <input 
                                        type="text"
                                        value={formData.municipio_nome || ''}
                                        onChange={e => setFormData((prev: any) => ({ ...prev, municipio_nome: e.target.value }))}
                                        className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-sm font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Região</label>
                                    <input 
                                        type="text"
                                        value={formData.regiao || ''}
                                        onChange={e => setFormData((prev: any) => ({ ...prev, regiao: e.target.value }))}
                                        className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-sm font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Partido</label>
                                    <input 
                                        type="text"
                                        value={formData.partido || ''}
                                        onChange={e => setFormData((prev: any) => ({ ...prev, partido: e.target.value }))}
                                        className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-sm font-bold"
                                    />
                                </div>
                            </div>
                        )}

                        {tipo === 'Assessor' && (
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Região de Atuação</label>
                                <input 
                                    type="text"
                                    value={formData.regiaoAtuacao || ''}
                                    onChange={e => setFormData((prev: any) => ({ ...prev, regiaoAtuacao: e.target.value }))}
                                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-sm font-bold"
                                    placeholder="Ex: Zona da Mata, Triângulo..."
                                />
                            </div>
                        )}

                        {tipo === 'Apoiador' && (
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vincular a Município Existente</label>
                                <select 
                                    value={formData.municipioId || ''}
                                    onChange={e => setFormData((prev: any) => ({ ...prev, municipioId: e.target.value }))}
                                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-sm font-bold"
                                >
                                    <option value="">Selecione um município...</option>
                                    {municipios.sort((a,b)=>a.nome.localeCompare(b.nome)).map(m => (
                                        <option key={m.id} value={m.id}>{m.nome} - {m.regiao}</option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-amber-600 mt-1">* Apoiadores exigem vínculo com um município da base de dados.</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-2 mt-4">
                        <ImageUpload 
                            currentImage={formData.fotoUrl}
                            onImageSelected={(img) => setFormData((prev: any) => ({ ...prev, fotoUrl: img }))}
                        />
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Foto do Contato</p>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-8 pt-4 shrink-0 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-white dark:bg-slate-800">
                    <button onClick={onClose} className="px-6 py-2.5 text-xs font-black uppercase text-slate-400">Cancelar</button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || !formData.nome || (tipo === 'Apoiador' && !formData.municipioId)}
                        className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase shadow-xl disabled:opacity-50"
                    >
                        {isSaving ? 'Salvando...' : 'Salvar Contato'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContatoModal;
