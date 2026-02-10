import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Assessor } from '../types';
import Loader from '../components/Loader';
import ImageUpload from '../components/ImageUpload';
import { MOCK_ASSESSORES } from '../constants/mocks';

interface AssessoresPageProps {
    navigateTo: (page: string, params?: { [key: string]: any }) => void;
}

const AssessoresPage: React.FC<AssessoresPageProps> = ({ navigateTo }) => {
    const [assessores, setAssessores] = useState<Assessor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAssessor, setEditingAssessor] = useState<Partial<Assessor>>({});

    // Filtros
    const [busca, setBusca] = useState('');
    const [filtroRegiao, setFiltroRegiao] = useState('Todos');
    const [filtroCargo, setFiltroCargo] = useState('Todos');

    useEffect(() => {
        // Simular carregamento da API com dados centralizados
        setTimeout(() => {
            setAssessores(MOCK_ASSESSORES);
            setIsLoading(false);
        }, 600);
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

    const handleSaveAssessor = () => {
        if (editingAssessor.id) {
            // Edit existing
            setAssessores(prev => prev.map(a => a.id === editingAssessor.id ? { ...a, ...editingAssessor } as Assessor : a));
        } else {
            // Create new
            const newId = Math.random().toString(36).substr(2, 9);
            const newAssessor = {
                ...editingAssessor,
                id: newId,
                cargo: editingAssessor.cargo || 'Assessor Regional',
                origem: editingAssessor.origem || 'Alê Portela',
                avatarUrl: editingAssessor.avatarUrl || 'https://via.placeholder.com/150',
                municipiosCobertos: 0,
                liderancasGerenciadas: 0,
                endereco: editingAssessor.endereco || {
                    logradouro: '',
                    numero: '',
                    bairro: '',
                    cidade: '',
                    uf: '',
                    cep: ''
                }
            } as Assessor;
            setAssessores(prev => [...prev, newAssessor]);
        }
        setIsModalOpen(false);
        setEditingAssessor({});
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-navy-dark dark:text-white">Equipe de Assessores</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Conheça o time que impulsiona nossa gestão.</p>
                </div>
                <button
                    onClick={() => { setEditingAssessor({}); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-turquoise text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-turquoise/20 active:scale-95"
                >
                    <span className="material-symbols-outlined text-xl">add</span>
                    Adicionar Assessor
                </button>
            </div>

            {/* Barra de Filtros (Estilo Lideranças) */}
            <div className={`grid grid-cols-1 md:grid-cols-12 gap-3 mb-8 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all ${filtersActive ? 'ring-2 ring-indigo-50 dark:ring-indigo-900/20' : ''}`}>
                <div className="md:col-span-4 relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors material-symbols-outlined">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                    {busca && (
                        <button
                            onClick={() => setBusca('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    )}
                </div>

                <div className="md:col-span-3">
                    <FilterSelect
                        value={filtroRegiao}
                        onChange={setFiltroRegiao}
                        options={regioes}
                        placeholder="Todas Regiões"
                    />
                </div>

                <div className="md:col-span-3">
                    <FilterSelect
                        value={filtroCargo}
                        onChange={setFiltroCargo}
                        options={cargos}
                        placeholder="Todos Cargos"
                    />
                </div>

                {filtersActive && (
                    <div className="md:col-span-2 flex justify-end">
                        <button
                            onClick={clearFilters}
                            className="w-full h-full px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-2 border border-rose-100 animate-in fade-in zoom-in duration-300"
                        >
                            <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                            Limpar
                        </button>
                    </div>
                )}
            </div>

            {isLoading ? <Loader /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {assessoresFiltrados.map(assessor => (
                        <div key={assessor.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center p-6 flex flex-col items-center hover:shadow-md transition-shadow relative group">
                            <button
                                onClick={() => { setEditingAssessor(assessor); setIsModalOpen(true); }}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-turquoise hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <span className="material-symbols-outlined">edit</span>
                            </button>

                            <div className="-mt-12 mb-4">
                                <ImageUpload
                                    currentImage={assessor.avatarUrl}
                                    onImageSelected={(base64) => handleImageUpdate(assessor.id, base64)}
                                />
                            </div>

                            <h3 className="text-lg font-bold text-navy-dark dark:text-white line-clamp-1">{assessor.nome}</h3>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mt-2 ${assessor.origem === 'Lincoln Portela' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'}`}>
                                {assessor.origem}
                            </div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">{assessor.cargo}</p>
                            <p className="text-xs text-slate-400 mt-1">{assessor.regiaoAtuacao}</p>

                            <div className="w-full my-6 h-px bg-slate-100 dark:bg-slate-700"></div>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                    <p className="text-xl font-black text-navy-dark dark:text-white">{assessor.municipiosCobertos}</p>
                                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">Municípios</p>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                    <p className="text-xl font-black text-navy-dark dark:text-white">{assessor.liderancasGerenciadas}</p>
                                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">Lideranças</p>
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
                                            value={editingAssessor.cargo || 'Assessor Regional'}
                                            onChange={e => setEditingAssessor({ ...editingAssessor, cargo: e.target.value as any })}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        >
                                            <option>Coordenador Político</option>
                                            <option>Assessor Regional</option>
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
                                        onChange={e => setEditingAssessor({ ...editingAssessor, telefone: e.target.value })}
                                        className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
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
                                            onChange={e => updateEndereco('cep', e.target.value)}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
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
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                            <button onClick={handleSaveAssessor} className="px-6 py-2.5 text-sm font-bold bg-turquoise text-white rounded-xl hover:brightness-110 shadow-lg shadow-turquoise/20 transition-all active:scale-95">Salvar Assessor</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssessoresPage;
