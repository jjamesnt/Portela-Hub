import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Assessor } from '../types';
import Loader from '../components/Loader';
import ImageUpload from '../components/ImageUpload';
import { getAssessores, upsertAssessor, deleteAssessor } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import ErrorModal from '../components/ErrorModal';

interface AssessoresPageProps {
    navigateTo: (page: string, params?: { [key: string]: any }) => void;
}

const AssessoresPage: React.FC<AssessoresPageProps> = ({ navigateTo }) => {
    const [assessores, setAssessores] = useState<Assessor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAssessor, setEditingAssessor] = useState<Partial<Assessor>>({});
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Assessor | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errorDetails, setErrorDetails] = useState<{ title: string; message: string; tech?: string } | null>(null);

    // Filtros
    const [busca, setBusca] = useState('');
    const [filtroRegiao, setFiltroRegiao] = useState('Todos');
    const [filtroCargo, setFiltroCargo] = useState('Todos');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const data = await getAssessores();
                setAssessores(data);
                setIsLoading(false);
            } catch (err) {
                console.error("Erro ao carregar assessores", err);
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const { selectedMandato } = useAppContext();

    // Extrair Regiões e Cargos Únicos
    const regioes = useMemo(() => Array.from(new Set(assessores.map(a => a.regiaoAtuacao))).sort(), [assessores]);
    const cargos = useMemo(() => Array.from(new Set(assessores.map(a => a.cargo))).sort(), [assessores]);

    const assessoresFiltrados = useMemo(() => {
        return assessores.filter(a => {
            const correspondeBusca = a.nome.toLowerCase().includes(busca.toLowerCase());
            const correspondeRegiao = filtroRegiao === 'Todos' || a.regiaoAtuacao === filtroRegiao;
            const correspondeCargo = filtroCargo === 'Todos' || a.cargo === filtroCargo;
            const correspondeMandato = selectedMandato === 'Todos' || a.origem === selectedMandato;

            return correspondeBusca && correspondeRegiao && correspondeCargo && correspondeMandato;
        });
    }, [assessores, busca, filtroRegiao, filtroCargo, selectedMandato]);

    const handleImageUpdate = (id: string, newImage: string) => {
        setAssessores(prev => prev.map(a => a.id === id ? { ...a, avatarUrl: newImage } : a));
    };

    const handleSaveAssessor = async () => {
        // Validação de Telefone
        const fone = (editingAssessor.telefone || '').replace(/\D/g, '');
        if (fone.length !== 11) {
            setErrorDetails({
                title: "Telefone Inválido",
                message: "O telefone deve seguir o padrão (99) 99999-9999 com 11 dígitos (incluindo DDD).",
                tech: `Pattern mismatch: Expected 11 digits, got ${fone.length}`
            });
            return;
        }

        setIsSaving(true);
        try {
            const assessorToSave = {
                ...editingAssessor,
                cargo: editingAssessor.cargo || 'Assessor Regional',
                origem: editingAssessor.origem || 'Alê Portela',
                avatarUrl: editingAssessor.avatarUrl || 'https://via.placeholder.com/150',
                municipiosCobertos: editingAssessor.municipiosCobertos || 0,
                liderancasGerenciadas: editingAssessor.liderancasGerenciadas || 0,
                endereco: editingAssessor.endereco || {
                    logradouro: '',
                    numero: '',
                    bairro: '',
                    cidade: '',
                    uf: '',
                    cep: ''
                }
            } as Partial<Assessor>;

            const savedAssessor = await upsertAssessor(assessorToSave);
            
            if (editingAssessor.id) {
                setAssessores(prev => prev.map(a => a.id === editingAssessor.id ? savedAssessor : a));
            } else {
                setAssessores(prev => [...prev, savedAssessor]);
            }
            
            setIsModalOpen(false);
            setEditingAssessor({});
        } catch (error) {
            console.error("Erro ao salvar assessor:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (assessor: Assessor) => {
        setItemToDelete(assessor);
        setIsConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await deleteAssessor(itemToDelete.id);
            setAssessores(prev => prev.filter(a => a.id !== itemToDelete.id));
            setIsConfirmDeleteOpen(false);
            setItemToDelete(null);
        } catch (error) {
            console.error("Erro ao deletar assessor:", error);
            // Em um cenário real, poderíamos disparar um toast de erro aqui
            setIsConfirmDeleteOpen(false);
        }
    };

    const updateEndereco = (field: string, value: string) => {
        setEditingAssessor(prev => ({
            ...prev,
            endereco: {
                ...prev.endereco || { logradouro: '', numero: '', bairro: '', cidade: '', uf: '', cep: '' },
                [field]: value
            }
        }));
    };

    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);
        if (value.length > 5) value = `${value.slice(0, 5)}-${value.slice(5)}`;

        updateEndereco('cep', value);

        if (value.replace(/\D/g, '').length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${value.replace(/\D/g, '')}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setEditingAssessor(prev => {
                        const currentEndereco = prev.endereco || { numero: '', logradouro: '', bairro: '', cidade: '', uf: '', cep: value };
                        return {
                            ...prev,
                            endereco: {
                                ...currentEndereco,
                                logradouro: data.logradouro || currentEndereco.logradouro,
                                bairro: data.bairro || currentEndereco.bairro,
                                cidade: data.localidade || currentEndereco.cidade,
                                uf: data.uf || currentEndereco.uf,
                                cep: value
                            }
                        };
                    });
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            }
        }
    };

    const filtersActive = busca !== '' || filtroRegiao !== 'Todos' || filtroCargo !== 'Todos';

    const clearFilters = () => {
        setBusca('');
        setFiltroRegiao('Todos');
        setFiltroCargo('Todos');
    };

    // Componente Reutilizável para Select com Botão de Limpar (Logic on Hover)
    const FilterSelect = ({ value, onChange, options, placeholder }: { value: string, onChange: (val: string) => void, options: string[], placeholder: string }) => (
        <div className="relative group">
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                className={`w-full pl-3 pr-8 py-2.5 border rounded-xl text-sm outline-none font-medium transition-all cursor-pointer appearance-none bg-none ${value !== 'Todos' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}
            >
                <option value="Todos" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{placeholder}</option>
                {options.map(opt => <option key={opt} value={opt} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{opt}</option>)}
            </select>

            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                {/* Seta (Sempre visível se for 'Todos', ou se não estiver com hover no 'Active') */}
                <span className={`material-symbols-outlined text-[20px] transition-all duration-200 ${value !== 'Todos' ? 'text-white opacity-100 group-hover:opacity-0 group-hover:scale-75' : 'text-slate-400'}`}>expand_more</span>
            </div>

            {/* Botão Limpar (Só aparece se val != Todos E Hover) */}
            {value !== 'Todos' && (
                <button
                    onClick={(e) => { e.stopPropagation(); onChange('Todos'); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
            )}
        </div>
    );

    return (
        <div className="p-4 md:p-8 animate-in fade-in duration-500 pb-24 md:pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 md:mb-8">
                <div>
                    <h2 className="text-xl md:text-3xl font-black tracking-tight text-navy-dark dark:text-white">Equipe de Assessores</h2>
                    <p className="text-[10px] md:text-sm text-slate-500 dark:text-slate-400 mt-0.5 md:mt-1">Conheça o time que impulsiona nossa gestão.</p>
                </div>
                <button
                    onClick={() => { setEditingAssessor({}); setIsModalOpen(true); }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-turquoise text-white rounded-xl text-xs md:text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-turquoise/20 active:scale-95"
                >
                    <span className="material-symbols-outlined text-lg md:text-xl">add</span>
                    Novo Assessor
                </button>
            </div>

            {/* Barra de Filtros Redesenhada (Alto Contraste) */}
            <div className={`flex flex-col gap-2 md:gap-3 mb-6 md:mb-8 bg-white dark:bg-slate-800 p-3 md:p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all ${filtersActive ? 'ring-2 ring-indigo-50 dark:ring-indigo-900/20' : ''}`}>
                <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                    <div className="flex-1 relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors material-symbols-outlined text-[18px] md:text-base">search</span>
                        <input
                            type="text"
                            placeholder="Buscar assessor..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 md:py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        />
                        {busca && (
                            <button
                                onClick={() => setBusca('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[16px] md:text-[18px]">close</span>
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 flex-[1.5]">
                        <FilterSelect
                            value={filtroRegiao}
                            onChange={setFiltroRegiao}
                            options={regioes}
                            placeholder="Regiões"
                        />
                        <FilterSelect
                            value={filtroCargo}
                            onChange={setFiltroCargo}
                            options={cargos}
                            placeholder="Cargos"
                        />
                        {filtersActive && (
                            <button
                                onClick={clearFilters}
                                className="md:hidden flex items-center justify-center p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100"
                            >
                                <span className="material-symbols-outlined text-[20px]">filter_alt_off</span>
                            </button>
                        )}
                    </div>
                </div>

                {filtersActive && (
                    <div className="hidden md:flex justify-end mt-1 animate-in fade-in slide-in-from-top-1">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[11px] font-bold hover:bg-rose-100 transition-colors flex items-center gap-1 border border-rose-100"
                        >
                            <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                            Limpar Tudo
                        </button>
                    </div>
                )}
            </div>

            {isLoading ? <Loader /> : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                    {assessoresFiltrados.map(assessor => (
                        <div key={assessor.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 md:p-5 hover:shadow-md transition-all group relative overflow-hidden">
                            <button
                                onClick={() => { setEditingAssessor(assessor); setIsModalOpen(true); }}
                                className="absolute top-2 right-10 md:top-4 md:right-12 text-slate-300 hover:text-turquoise transition-colors z-10"
                            >
                                <span className="material-symbols-outlined text-sm md:text-xl">edit</span>
                            </button>

                            <button
                                onClick={() => handleDeleteClick(assessor)}
                                className="absolute top-2 right-3 md:top-4 md:right-4 text-slate-300 hover:text-rose-500 transition-colors z-10"
                            >
                                <span className="material-symbols-outlined text-sm md:text-xl">delete</span>
                            </button>

                            <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 mb-3 md:mb-4 text-center md:text-left">
                                <div className="w-10 h-10 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm md:shadow-md shrink-0 bg-slate-100 dark:bg-slate-700">
                                    <img
                                        src={assessor.avatarUrl || 'https://via.placeholder.com/150'}
                                        alt={assessor.nome}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0 w-full">
                                    <h3 className="text-xs md:text-base font-bold text-navy-dark dark:text-white truncate">{assessor.nome}</h3>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-1 mt-0.5 md:mt-1">
                                        <span className={`px-1 md:px-2 py-0.5 rounded text-[7px] md:text-[10px] uppercase font-black tracking-wider ${assessor.origem === 'Lincoln Portela' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                            {assessor.origem.split(' ')[0]}
                                        </span>
                                    </div>
                                    <p className="text-[9px] md:text-xs text-slate-400 mt-0.5 md:mt-1 truncate opacity-80">{assessor.cargo}</p>
                                </div>
                            </div>

                            <div className="space-y-1 md:space-y-2 border-t border-slate-100 dark:border-slate-700 pt-3 md:pt-4">
                                <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-xs text-slate-600 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-[13px] md:text-[16px] text-slate-400">location_on</span>
                                    <span className="truncate">{assessor.regiaoAtuacao}</span>
                                </div>
                                <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-xs text-slate-600 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-[13px] md:text-[16px] text-slate-400">call</span>
                                    <span className="truncate">{assessor.telefone}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Edição Completa */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-6 my-8">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
                            <h3 className="text-xl font-bold text-navy-dark dark:text-white">{editingAssessor.id ? 'Editar Ficha do Assessor' : 'Novo Cadastro de Assessor'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Coluna 1: Dados Pessoais e Profissionais */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-turquoise uppercase tracking-wider mb-2">Dados Profissionais</h4>

                                <div className="flex justify-center mb-6">
                                    <ImageUpload
                                        currentImage={editingAssessor.avatarUrl}
                                        onImageSelected={(base64) => setEditingAssessor(prev => ({ ...prev, avatarUrl: base64 }))}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={editingAssessor.nome || ''}
                                        onChange={e => setEditingAssessor({ ...editingAssessor, nome: e.target.value })}
                                        className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Cargo</label>
                                        <select
                                            value={editingAssessor.cargo || 'Assessor'}
                                            onChange={e => setEditingAssessor({ ...editingAssessor, cargo: e.target.value as any })}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        >
                                            <option>Assessor</option>
                                            <option>Assessor Regional</option>
                                            <option>Coordenador Político</option>
                                            <option>Chefe de Gabinete</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Região</label>
                                        <input
                                            type="text"
                                            value={editingAssessor.regiaoAtuacao || ''}
                                            onChange={e => setEditingAssessor({ ...editingAssessor, regiaoAtuacao: e.target.value })}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Mandato</label>
                                        <select
                                            value={editingAssessor.origem || 'Alê Portela'}
                                            onChange={e => setEditingAssessor({ ...editingAssessor, origem: e.target.value as any })}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        >
                                            <option>Alê Portela</option>
                                            <option>Lincoln Portela</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                                        <input
                                            type="email"
                                            value={editingAssessor.email || ''}
                                            onChange={e => setEditingAssessor({ ...editingAssessor, email: e.target.value })}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Telefone</label>
                                    <input
                                        type="tel"
                                        value={editingAssessor.telefone || ''}
                                        onChange={e => {
                                            let v = e.target.value.replace(/\D/g, '');
                                            if (v.length > 11) v = v.slice(0, 11);
                                            if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
                                            if (v.length > 9) v = `${v.slice(0, 10)}-${v.slice(10)}`;
                                            setEditingAssessor({ ...editingAssessor, telefone: v });
                                        }}
                                        className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        placeholder="(99) 99999-9999"
                                    />
                                </div>
                            </div>

                            {/* Coluna 2: Endereço */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-turquoise uppercase tracking-wider mb-2">Endereço Residencial</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">CEP</label>
                                        <input
                                            type="text"
                                            value={editingAssessor.endereco?.cep || ''}
                                            onChange={handleCepChange}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                            placeholder="00000-000"
                                            maxLength={9}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Logradouro</label>
                                        <input
                                            type="text"
                                            value={editingAssessor.endereco?.logradouro || ''}
                                            onChange={e => updateEndereco('logradouro', e.target.value)}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Número</label>
                                        <input
                                            type="text"
                                            value={editingAssessor.endereco?.numero || ''}
                                            onChange={e => updateEndereco('numero', e.target.value)}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Bairro</label>
                                        <input
                                            type="text"
                                            value={editingAssessor.endereco?.bairro || ''}
                                            onChange={e => updateEndereco('bairro', e.target.value)}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Cidade</label>
                                        <input
                                            type="text"
                                            value={editingAssessor.endereco?.cidade || ''}
                                            onChange={e => updateEndereco('cidade', e.target.value)}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">UF</label>
                                        <input
                                            type="text"
                                            value={editingAssessor.endereco?.uf || ''}
                                            onChange={e => updateEndereco('uf', e.target.value)}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 dark:border-slate-700 pt-6">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors" disabled={isSaving}>Cancelar</button>
                            <button 
                                onClick={handleSaveAssessor} 
                                disabled={isSaving}
                                className="px-6 py-2.5 text-sm font-bold bg-turquoise text-white rounded-xl hover:brightness-110 shadow-lg shadow-turquoise/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        Salvando...
                                    </>
                                ) : 'Salvar Assessor'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={isConfirmDeleteOpen}
                onClose={() => setIsConfirmDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Excluir Assessor"
                message={`Tem certeza que deseja remover ${itemToDelete?.nome} da equipe? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
            />

            <ErrorModal 
                isOpen={!!errorDetails}
                onClose={() => setErrorDetails(null)}
                title={errorDetails?.title || ''}
                message={errorDetails?.message || ''}
                technicalDetails={errorDetails?.tech}
            />
        </div>
    );
};

export default AssessoresPage;
