
import React, { useState, useEffect } from 'react';
import { Apoiador, Municipio } from '../types';
import { upsertApoiador, updateMunicipio, createMunicipio } from '../services/api';
import ImageUpload from './ImageUpload';
import votosData from '../public/data/votos_resumo.json';

interface ApoiadorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    municipio?: Municipio | null;
    allMunicipios?: Municipio[];
    allApoiadores?: Apoiador[];
    editingApoiador?: Apoiador | null;
}

const ApoiadorModal: React.FC<ApoiadorModalProps> = ({ isOpen, onClose, onSuccess, municipio, allMunicipios, allApoiadores, editingApoiador }) => {
    const [formData, setFormData] = useState<any>({
        nome: '',
        cargo: '',
        telefone: '',
        endereco: '',
        email: '',
        fotoUrl: '',
        municipioId: municipio?.id || '',
        statusPrefeito: municipio?.statusPrefeito,
        lincolnFechado: municipio?.lincolnFechado,
        idene: municipio?.idene,
        statusAtendimento: municipio?.statusAtendimento,
        principalDemanda: municipio?.principalDemanda,
        sugestaoSedese: municipio?.sugestaoSedese
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isCreatingMunicipio, setIsCreatingMunicipio] = useState(false);
    const [newMunicipioData, setNewMunicipioData] = useState({ nome: '', regiao: '' });

    const selectedMunicipioApoiadores = formData.municipioId && allApoiadores 
        ? allApoiadores.filter(a => a.id !== editingApoiador?.id && a.municipioId === formData.municipioId)
        : [];

    useEffect(() => {
        setIsCreatingMunicipio(false);
        setNewMunicipioData({ nome: '', regiao: '' });

        if (editingApoiador) {
            const m = allMunicipios?.find(city => city.id === editingApoiador.municipioId);
            setFormData({
                ...editingApoiador,
                statusPrefeito: m?.statusPrefeito || '',
                lincolnFechado: m?.lincolnFechado || false,
                idene: m?.idene || false,
                statusAtendimento: m?.statusAtendimento || '',
                principalDemanda: m?.principalDemanda || '',
                sugestaoSedese: m?.sugestaoSedese || ''
            });
        } else {
            setFormData({
                nome: '',
                cargo: '',
                telefone: '',
                endereco: '',
                email: '',
                fotoUrl: '',
                municipioId: municipio?.id || '',
                statusPrefeito: municipio?.statusPrefeito || '',
                lincolnFechado: municipio?.lincolnFechado || false,
                idene: municipio?.idene || false,
                statusAtendimento: municipio?.statusAtendimento || '',
                principalDemanda: municipio?.principalDemanda || '',
                sugestaoSedese: municipio?.sugestaoSedese || ''
            });
        }
    }, [editingApoiador, municipio, isOpen, allMunicipios]);

    if (!isOpen) return null;

    const handleSave = async () => {
        const anyFormData = formData as any;
        const validMunicipio = isCreatingMunicipio 
            ? (newMunicipioData.nome && newMunicipioData.regiao)
            : formData.municipioId;

        if (!formData.nome || !validMunicipio) return;
        setIsSaving(true);

        try {
            let targetMunicipioId = formData.municipioId;

            // 1. Criar novo município se aplicável
            if (isCreatingMunicipio) {
                const createdM = await createMunicipio({
                    nome: newMunicipioData.nome,
                    regiao: newMunicipioData.regiao,
                    status_atividade: 'Manutenção'
                });
                targetMunicipioId = createdM.id;
            }

            // 2. Salvar Apoiador
            const payload = { ...formData, municipioId: targetMunicipioId };
            await upsertApoiador(payload);

            // 3. Espelhamento
            const mUpdates: any = {};
            if (anyFormData.statusPrefeito !== undefined) mUpdates.status_prefeito = anyFormData.statusPrefeito;
            if (anyFormData.votacaoAle !== undefined) mUpdates.votacao_ale = anyFormData.votacaoAle;
            if (anyFormData.votacaoLincoln !== undefined) mUpdates.votacao_lincoln = anyFormData.votacaoLincoln;
            if (anyFormData.principalDemanda !== undefined) mUpdates.principal_demanda = anyFormData.principalDemanda;
            if (anyFormData.sugestaoSedese !== undefined) mUpdates.sugestao_sedese = anyFormData.sugestaoSedese;
            if (anyFormData.lincolnFechado !== undefined) mUpdates.lincoln_fechado = anyFormData.lincolnFechado;
            if (anyFormData.idene !== undefined) mUpdates.idene = anyFormData.idene;
            if (anyFormData.statusAtendimento !== undefined) mUpdates.status_atendimento = anyFormData.statusAtendimento;

            if (Object.keys(mUpdates).length > 0 && targetMunicipioId) {
                await updateMunicipio(targetMunicipioId, mUpdates);
            }

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
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {isCreatingMunicipio ? 'Cadastrando Novas Informações de Município' : 'Selecione o Município para o Apoiador'}
                        </label>
                        
                        {!isCreatingMunicipio ? (
                            <div className="space-y-2">
                                <select
                                    value={formData.municipioId}
                                    onChange={e => {
                                        if (e.target.value === 'CREATE_NEW') {
                                            setIsCreatingMunicipio(true);
                                        } else {
                                            setFormData(prev => ({ ...prev, municipioId: e.target.value }));
                                        }
                                    }}
                                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-navy-dark dark:text-white"
                                >
                                    <option value="">Selecione um município...</option>
                                    {allMunicipios.sort((a,b) => a.nome.localeCompare(b.nome)).map(m => (
                                        <option key={m.id} value={m.id}>{m.nome}</option>
                                    ))}
                                    <option value="CREATE_NEW" className="text-indigo-600 font-bold">+ Cadastrar Novo Município...</option>
                                </select>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                                <div>
                                    <input 
                                        type="text" 
                                        placeholder="Nome da Cidade"
                                        value={newMunicipioData.nome}
                                        onChange={e => setNewMunicipioData(prev => ({ ...prev, nome: e.target.value }))}
                                        className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select 
                                        value={newMunicipioData.regiao}
                                        onChange={e => setNewMunicipioData(prev => ({ ...prev, regiao: e.target.value }))}
                                        className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                                    >
                                        <option value="">Região?</option>
                                        {['Central Mineira', 'Zona da Mata', 'Norte de Minas', 'Sul de Minas', 'Triângulo Mineiro', 'Alto Paranaíba', 'Oeste de Minas'].map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                    <button 
                                        onClick={() => setIsCreatingMunicipio(false)}
                                        className="px-2 text-slate-400 hover:text-rose-500"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Mostrar Apoiadores Existentes se houverem no Município Selecionado */}
                {formData.municipioId && !editingApoiador && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-3 rounded-xl flex flex-col gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 font-black">
                            <span className="material-symbols-outlined text-[18px]">warning</span>
                            ⚠️ Apoiadores cadastrados nesta cidade:
                        </div>
                        <ul className="list-disc list-inside text-amber-700 dark:text-amber-300 font-medium space-y-0.5">
                            {selectedMunicipioApoiadores.length > 0 ? (
                                selectedMunicipioApoiadores.map(a => (
                                    <li key={a.id} className="text-[11px] flex items-center justify-between gap-2 border-b border-amber-200 dark:border-amber-900/10 pb-1">
                                        <span><span className="font-bold">{a.nome}</span> ({a.cargo})</span>
                                        <button 
                                            onClick={() => setFormData(p => ({ ...p, id: a.id, nome: a.nome, cargo: a.cargo, telefone: a.telefone, endereco: a.endereco, email: a.email }))} 
                                            className="px-2 py-0.5 bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded text-[9px] font-bold hover:bg-amber-200 transition-colors"
                                        >
                                            Editar Este
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <li className="text-[10px] text-slate-500 italic">Nenhum outro apoiador encontrado.</li>
                            )}
                        </ul>
                        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-1">Deseja criar um NOVO apoiador para esta cidade com as suas próprias demandas?</p>
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
                                value={formData.nome || ''}
                                onChange={e => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="Nome do apoiador"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo / Função</label>
                            <input 
                                type="text"
                                value={formData.cargo || ''}
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
                            value={formData.telefone || ''}
                            onChange={e => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                            className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                            placeholder="(31) 99999-9999"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail</label>
                        <input 
                            type="email"
                            value={formData.email || ''}
                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                            placeholder="exemplo@email.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço</label>
                    <textarea 
                        value={formData.endereco || ''}
                        onChange={e => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                        className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-20 resize-none"
                        placeholder="Endereço completo"
                    />
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-2">
                    <p className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">Dados Políticos (Planilha)</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Prefeito</label>
                            <select 
                                value={(formData as any).statusPrefeito || ''}
                                onChange={e => setFormData(prev => ({ ...prev, statusPrefeito: e.target.value } as any))}
                                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                            >
                                <option value="">Não informado</option>
                                <option value="Prefeitura Parceira">Prefeitura Parceira</option>
                                <option value="Prefeitura Fechada">Prefeitura Fechada</option>
                                <option value="Não">Não</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lincoln Portela Fechado?</label>
                            <select 
                                value={(formData as any).lincolnFechado ? 'Sim' : 'Não'}
                                onChange={e => setFormData(prev => ({ ...prev, lincolnFechado: e.target.value === 'Sim' } as any))}
                                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                            >
                                <option value="Não">Não</option>
                                <option value="Sim">Sim</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IDENE</label>
                            <select 
                                value={(formData as any).idene ? 'Sim' : 'Não'}
                                onChange={e => setFormData(prev => ({ ...prev, idene: e.target.value === 'Sim' } as any))}
                                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                            >
                                <option value="Não">Não</option>
                                <option value="Sim">Sim</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status de Atendimento</label>
                            <select 
                                value={(formData as any).statusAtendimento || ''}
                                onChange={e => setFormData(prev => ({ ...prev, statusAtendimento: e.target.value } as any))}
                                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                            >
                                <option value="">Pendente</option>
                                <option value="Contemplado">Contemplado</option>
                                <option value="Não contemplado">Não contemplado</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 grid grid-cols-2 gap-2">
                            {(() => {
                                const selectedM = allMunicipios?.find(m => m.id === formData.municipioId);
                                const isReadonly = !isCreatingMunicipio && selectedM;

                                // Código IBGE (tentar ambos padrões de case)
                                const ibgeCode = (selectedM as any)?.codigoIBGE || (selectedM as any)?.codigo_ibge;
                                const fileVotes = ibgeCode ? (votosData as any)[ibgeCode] : null;

                                const aleVotes = fileVotes ? fileVotes.a : (isReadonly ? (selectedM as any).votacaoAle : (formData as any).votacaoAle);
                                const lincolnVotes = fileVotes ? fileVotes.l : (isReadonly ? (selectedM as any).votacaoLincoln : (formData as any).votacaoLincoln);
                                const isFromFile = !!fileVotes;

                                return (
                                    <>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Votos Alê</label>
                                            {isReadonly || isFromFile ? (
                                                <div className="w-full mt-1 p-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[16px] text-indigo-500">barcode_reader</span>
                                                    {aleVotes || 0}
                                                </div>
                                            ) : (
                                                <input 
                                                    type="number"
                                                    value={(formData as any).votacaoAle || ''}
                                                    onChange={e => setFormData(prev => ({ ...prev, votacaoAle: parseInt(e.target.value) } as any))}
                                                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                    placeholder="0"
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lincoln</label>
                                            {isReadonly || isFromFile ? (
                                                <div className="w-full mt-1 p-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[16px] text-indigo-500">barcode_reader</span>
                                                    {lincolnVotes || 0}
                                                </div>
                                            ) : (
                                                <input 
                                                    type="number"
                                                    value={(formData as any).votacaoLincoln || ''}
                                                    onChange={e => setFormData(prev => ({ ...prev, votacaoLincoln: parseInt(e.target.value) } as any))}
                                                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                                                    placeholder="0"
                                                />
                                            )}
                                        </div>
                                        {isFromFile && (
                                            <div className="col-span-2 mt-1 flex items-center gap-1 text-[9px] text-indigo-600 dark:text-indigo-400 font-bold">
                                                <span className="material-symbols-outlined text-[12px]">sync</span>
                                                Votos carregados automaticamente do arquivo consolidado (IBGE: {ibgeCode})
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Principal Demanda / Atendimento</label>
                        <textarea 
                            value={(formData as any).principalDemanda || ''}
                            onChange={e => setFormData(prev => ({ ...prev, principalDemanda: e.target.value } as any))}
                            className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-16 resize-none font-medium"
                            placeholder="Descreva a demanda dita..."
                        />
                    </div>

                    <div className="mt-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sugestão SEDESE</label>
                        <input 
                            type="text"
                            value={(formData as any).sugestaoSedese || ''}
                            onChange={e => setFormData(prev => ({ ...prev, sugestaoSedese: e.target.value } as any))}
                            className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            placeholder="Ex: MINAS FORMA"
                        />
                    </div>
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
