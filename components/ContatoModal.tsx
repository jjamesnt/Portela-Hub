import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { upsertLideranca, upsertAssessor, upsertApoiador, getMunicipiosSimples } from '../services/api';
import { MunicipioDetalhado } from '../types';
import ImageUpload from './ImageUpload';

interface ContatoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ContatoModal: React.FC<ContatoModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const context = useContext(AppContext);
    const role = context?.profile?.role || '';
    const canCreateAll = role === 'Master' || role === 'Coordenador';

    const [tipo, setTipo] = useState<'Liderança' | 'Assessor' | 'Apoiador'>('Liderança');
    const [formData, setFormData] = useState<any>({
        nome: '',
        cargo: '',
        telefone: '',
        email: '',
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        uf: '',
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
    
    // UX enhancements
    const [cepSuccess, setCepSuccess] = useState(false);
    const numeroRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            getMunicipiosSimples().then(setMunicipios);
            setFormData({
                nome: '',
                cargo: '',
                telefone: '',
                email: '',
                cep: '',
                logradouro: '',
                numero: '',
                complemento: '',
                bairro: '',
                uf: '',
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

    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 5) val = val.substring(0, 5) + '-' + val.substring(5, 8);
        setFormData((prev: any) => ({ ...prev, cep: val }));

        if (val.length === 9) {
            try {
                const res = await fetch(`https://viacep.com.br/ws/${val.replace('-', '')}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setFormData((prev: any) => ({ 
                        ...prev, 
                        logradouro: data.logradouro || '',
                        bairro: data.bairro || '',
                        uf: data.uf || '',
                        municipio_nome: data.localidade
                    }));

                    if (data.ibge) {
                        const ibgeRes = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${data.ibge}`);
                        const ibgeData = await ibgeRes.json();
                        if (ibgeData && ibgeData.microrregiao && ibgeData.microrregiao.mesorregiao) {
                            const mesorregiao = ibgeData.microrregiao.mesorregiao.nome;
                            const matchedMunicipio = municipios.find(m => m.nome.toLowerCase() === data.localidade.toLowerCase());
                            setFormData((prev: any) => ({ 
                                ...prev, 
                                regiao: mesorregiao,
                                regiaoAtuacao: mesorregiao,
                                municipioId: matchedMunicipio ? matchedMunicipio.id : prev.municipioId
                            }));
                        }
                    }

                    setCepSuccess(true);
                    setTimeout(() => setCepSuccess(false), 1000);
                    setTimeout(() => numeroRef.current?.focus(), 100);
                }
            } catch (err) {
                console.error("Erro ao buscar CEP", err);
            }
        }
    };

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
                    endereco: `${formData.logradouro}, Nº ${formData.numero}${formData.complemento ? ' - ' + formData.complemento : ''}, ${formData.bairro} - ${formData.uf}`,
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
                            {['Liderança', ...(canCreateAll ? ['Assessor', 'Apoiador'] : [])].map((t) => (
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <div className="flex items-center gap-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CEP</label>
                                <span className="text-[9px] text-turquoise font-bold flex items-center bg-turquoise/10 px-1.5 py-0.5 rounded ml-1">
                                    <span className="material-symbols-outlined text-[10px] mr-0.5">auto_awesome</span> Automático
                                </span>
                            </div>
                            <input 
                                type="text"
                                value={formData.cep || ''}
                                onChange={handleCepChange}
                                maxLength={9}
                                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-turquoise/20 focus:border-turquoise outline-none transition-all"
                                placeholder="00000-000"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rua / Logradouro</label>
                            <input 
                                type="text"
                                value={formData.logradouro || ''}
                                readOnly
                                className={`w-full mt-1 p-2.5 rounded-xl text-sm font-bold border transition-all cursor-not-allowed ${cepSuccess ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-100/70 border-slate-200/50 text-slate-500 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400'}`}
                                placeholder="Preenchido pelo CEP"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Número</label>
                            <input 
                                ref={numeroRef}
                                type="text"
                                value={formData.numero || ''}
                                onChange={e => setFormData((prev: any) => ({ ...prev, numero: e.target.value }))}
                                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-turquoise/20 focus:border-turquoise outline-none transition-all"
                                placeholder="Ex: 123"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Complemento</label>
                            <input 
                                type="text"
                                value={formData.complemento || ''}
                                onChange={e => setFormData((prev: any) => ({ ...prev, complemento: e.target.value }))}
                                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-turquoise/20 focus:border-turquoise outline-none transition-all"
                                placeholder="Apto 12"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bairro</label>
                            <input 
                                type="text"
                                value={formData.bairro || ''}
                                readOnly
                                className={`w-full mt-1 p-2.5 rounded-xl text-sm font-bold border transition-all cursor-not-allowed ${cepSuccess ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-100/70 border-slate-200/50 text-slate-500 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400'}`}
                                placeholder="Preenchido pelo CEP"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        readOnly
                                        className={`w-full mt-1 p-2.5 rounded-xl text-sm font-bold border transition-all cursor-not-allowed ${cepSuccess ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-100/70 border-slate-200/50 text-slate-500 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400'}`}
                                        placeholder="Preenchido pelo CEP"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Região</label>
                                    <input 
                                        type="text"
                                        value={formData.regiao || ''}
                                        readOnly
                                        className={`w-full mt-1 p-2.5 rounded-xl text-sm font-bold border transition-all cursor-not-allowed ${cepSuccess ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-100/70 border-slate-200/50 text-slate-500 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400'}`}
                                        placeholder="Preenchida pelo CEP"
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
                                    readOnly
                                    className={`w-full mt-1 p-2.5 rounded-xl text-sm font-bold border transition-all cursor-not-allowed ${cepSuccess ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-100/70 border-slate-200/50 text-slate-500 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400'}`}
                                    placeholder="Preenchida pelo CEP"
                                />
                            </div>
                        )}

                        {tipo === 'Apoiador' && (
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vincular a Município Existente</label>
                                <select 
                                    value={formData.municipioId || ''}
                                    onChange={e => setFormData((prev: any) => ({ ...prev, municipioId: e.target.value }))}
                                    className={`w-full mt-1 p-2.5 rounded-xl text-sm font-bold border transition-all ${cepSuccess ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 dark:bg-slate-900 border-slate-200'}`}
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
