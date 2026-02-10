import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { getMunicipios } from '../services/api';
import { Lideranca, Municipio } from '../types';
import Loader from '../components/Loader';
import ImageUpload from '../components/ImageUpload';

interface LiderancasPageProps {
    navigateTo: (page: string, params?: { [key: string]: any }) => void;
}

// Mock Data Rico para Lideranças com Novos Campos
const MOCK_LIDERANCAS: Lideranca[] = [
    {
        id: '1',
        nome: 'Ricardo Nunes',
        municipio: 'Belo Horizonte',
        regiao: 'Região Metropolitana',
        partido: 'PL',
        cargo: 'Vereador',
        contato: '(31) 99999-8888',
        email: 'ricardo.nunes@camarabhal.mg.gov.br',
        status: 'Ativo',
        origem: 'Alê Portela',
        avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        endereco: {
            logradouro: 'Av. dos Andradas',
            numero: '3100',
            bairro: 'Santa Efigênia',
            cidade: 'Belo Horizonte',
            uf: 'MG',
            cep: '30260-070'
        }
    },
    {
        id: '2',
        nome: 'Fernanda Lima',
        municipio: 'Contagem',
        regiao: 'Região Metropolitana',
        partido: 'Novo',
        cargo: 'Liderança Comunitária',
        contato: '(31) 98888-7777',
        email: 'fernanda.lima@comunidade.org',
        status: 'Ativo',
        origem: 'Lincoln Portela',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        endereco: {
            logradouro: 'Rua das Indústrias',
            numero: '500',
            bairro: 'Cidade Industrial',
            cidade: 'Contagem',
            uf: 'MG',
            cep: '32000-000'
        }
    },
    {
        id: '3',
        nome: 'Roberto Alves',
        municipio: 'Betim',
        regiao: 'Região Metropolitana',
        partido: 'MDB',
        cargo: 'Prefeito',
        contato: '(31) 97777-6666',
        email: 'prefeito@betim.mg.gov.br',
        status: 'Inativo',
        origem: 'Alê Portela',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        endereco: {
            logradouro: 'Praça Tiradentes',
            numero: '10',
            bairro: 'Centro',
            cidade: 'Betim',
            uf: 'MG',
            cep: '32600-000'
        }
    },
    {
        id: '4',
        nome: 'Juliana Costa',
        municipio: 'Juiz de Fora',
        regiao: 'Zona da Mata',
        partido: 'PT',
        cargo: 'Vereador',
        contato: '(32) 99988-7766',
        email: 'juliana.costa@camarajf.mg.gov.br',
        status: 'Ativo',
        origem: 'Lincoln Portela',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        endereco: {
            logradouro: 'Rua Halfeld',
            numero: '955',
            bairro: 'Centro',
            cidade: 'Juiz de Fora',
            uf: 'MG',
            cep: '36010-003'
        }
    },
    {
        id: '5',
        nome: 'Marcos Rocha',
        municipio: 'Uberlândia',
        regiao: 'Triângulo Mineiro',
        partido: 'PP',
        cargo: 'Liderança Comunitária',
        contato: '(34) 98877-6655',
        email: 'marcos.rocha@uberlandia.com',
        status: 'Ativo',
        origem: 'Alê Portela',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        endereco: {
            logradouro: 'Av. Rondon Pacheco',
            numero: '2000',
            bairro: 'Tibery',
            cidade: 'Uberlândia',
            uf: 'MG',
            cep: '38405-142'
        }
    }
];

const LiderancasPage: React.FC<LiderancasPageProps> = ({ navigateTo }) => {
    const [liderancas, setLiderancas] = useState<Lideranca[]>([]);
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filtros
    const [busca, setBusca] = useState('');
    const [filtroRegiao, setFiltroRegiao] = useState('Todos');
    const [filtroMunicipio, setFiltroMunicipio] = useState('Todos');
    const [filtroPartido, setFiltroPartido] = useState('Todos');
    const [filtroCargo, setFiltroCargo] = useState('Todos');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLideranca, setEditingLideranca] = useState<Partial<Lideranca>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const municipiosData = await getMunicipios().catch(() => []);
                setMunicipios(municipiosData);

                setTimeout(() => {
                    setLiderancas(MOCK_LIDERANCAS);
                    setIsLoading(false);
                }, 600);
            } catch (err) {
                console.error("Erro ao carregar dados", err);
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const { selectedMandato } = useAppContext();

    // Extrair Regiões Únicas
    const regioes = useMemo(() => {
        return Array.from(new Set(liderancas.map(l => l.regiao))).sort();
    }, [liderancas]);

    const liderancasFiltradas = useMemo(() => {
        return liderancas.filter(l => {
            const correspondeBusca = l.nome.toLowerCase().includes(busca.toLowerCase()) ||
                l.municipio.toLowerCase().includes(busca.toLowerCase());
            const correspondeRegiao = filtroRegiao === 'Todos' || l.regiao === filtroRegiao;
            const correspondeMunicipio = filtroMunicipio === 'Todos' || l.municipio === filtroMunicipio;
            const correspondeMandato = selectedMandato === 'Todos' || l.origem === selectedMandato;
            const correspondePartido = filtroPartido === 'Todos' || l.partido === filtroPartido;
            const correspondeCargo = filtroCargo === 'Todos' || l.cargo === filtroCargo;

            return correspondeBusca && correspondeRegiao && correspondeMunicipio && correspondeMandato && correspondePartido && correspondeCargo;
        });
    }, [busca, filtroRegiao, filtroMunicipio, filtroPartido, filtroCargo, liderancas, selectedMandato]);

    const statusStyle = (status: Lideranca['status']) => {
        switch (status) {
            case 'Ativo': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'Inativo': return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const handleImageUpdate = (id: string, newImage: string) => {
        setLiderancas(prev => prev.map(l => l.id === id ? { ...l, avatarUrl: newImage } : l));
    };

    const handleSaveLideranca = () => {
        if (editingLideranca.id) {
            setLiderancas(prev => prev.map(l => l.id === editingLideranca.id ? { ...l, ...editingLideranca } as Lideranca : l));
        } else {
            const newId = Math.random().toString(36).substr(2, 9);
            const newLideranca = {
                ...editingLideranca,
                id: newId,
                status: 'Ativo',
                avatarUrl: editingLideranca.avatarUrl || 'https://via.placeholder.com/150',
                endereco: editingLideranca.endereco || {
                    logradouro: '',
                    numero: '',
                    bairro: '',
                    cidade: '',
                    uf: '',
                    cep: ''
                }
            } as Lideranca;
            setLiderancas(prev => [...prev, newLideranca]);
        }
        setIsModalOpen(false);
        setEditingLideranca({});
    };

    const updateEndereco = (field: string, value: string) => {
        setEditingLideranca(prev => ({
            ...prev,
            endereco: {
                ...prev.endereco || { logradouro: '', numero: '', bairro: '', cidade: '', uf: '', cep: '' },
                [field]: value
            }
        }));
    };

    const filtersActive = busca !== '' || filtroRegiao !== 'Todos' || filtroMunicipio !== 'Todos' || filtroPartido !== 'Todos' || filtroCargo !== 'Todos';

    const clearFilters = () => {
        setBusca('');
        setFiltroRegiao('Todos');
        setFiltroMunicipio('Todos');
        setFiltroPartido('Todos');
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-navy-dark dark:text-white">Gestão de Lideranças</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Acompanhe e gerencie sua base de apoio.</p>
                </div>
                <button
                    onClick={() => { setEditingLideranca({}); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-turquoise text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-turquoise/20 active:scale-95"
                >
                    <span className="material-symbols-outlined text-xl">add</span>
                    Nova Liderança
                </button>
            </div>

            {/* Barra de Filtros Redesenhada (Alto Contraste) */}
            <div className={`grid grid-cols-1 md:grid-cols-12 gap-3 mb-8 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all ${filtersActive ? 'ring-2 ring-indigo-50 dark:ring-indigo-900/20' : ''}`}>
                <div className="md:col-span-3 relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors material-symbols-outlined">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por nome ou município..."
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                    {/* Limpar Busca on Hover */}
                    {busca && (
                        <button
                            onClick={() => setBusca('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    )}
                </div>

                <div className="md:col-span-2">
                    <FilterSelect
                        value={filtroRegiao}
                        onChange={setFiltroRegiao}
                        options={regioes}
                        placeholder="Todas Regiões"
                    />
                </div>

                <div className="md:col-span-2">
                    <FilterSelect
                        value={filtroMunicipio}
                        onChange={setFiltroMunicipio}
                        options={municipios.map(m => m.nome)}
                        placeholder="Todos Municípios"
                    />
                </div>

                <div className="md:col-span-2">
                    <FilterSelect
                        value={filtroPartido}
                        onChange={setFiltroPartido}
                        options={Array.from(new Set(liderancas.map(l => l.partido)))}
                        placeholder="Todos Partidos"
                    />
                </div>

                <div className="md:col-span-3 md:flex-initial">
                    <FilterSelect
                        value={filtroCargo}
                        onChange={setFiltroCargo}
                        options={['Prefeito', 'Vice-Prefeito', 'Vereador', 'Liderança Comunitária', 'Ex-Prefeito']}
                        placeholder="Todos Cargos"
                    />
                </div>

                {filtersActive && (
                    <div className="md:col-span-12 flex justify-end mt-2 animate-in fade-in slide-in-from-top-1">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1 border border-rose-100"
                        >
                            <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                            Limpar Tudo
                        </button>
                    </div>
                )}
            </div>

            {isLoading ? <Loader /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {liderancasFiltradas.map(lideranca => (
                        <div key={lideranca.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-all group relative">
                            <button
                                onClick={() => { setEditingLideranca(lideranca); setIsModalOpen(true); }}
                                className="absolute top-4 right-4 text-slate-300 hover:text-turquoise transition-colors"
                            >
                                <span className="material-symbols-outlined">edit</span>
                            </button>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0 bg-slate-100 dark:bg-slate-700">
                                    <img
                                        src={lideranca.avatarUrl || 'https://via.placeholder.com/150'}
                                        alt={lideranca.nome}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base font-bold text-navy-dark dark:text-white truncate">{lideranca.nome}</h3>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider ${lideranca.origem === 'Lincoln Portela' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                            {lideranca.origem.split(' ')[0]}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider ${statusStyle(lideranca.status)}`}>
                                            {lideranca.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 truncate">{lideranca.cargo} • {lideranca.partido}</p>
                                </div>
                            </div>

                            <div className="space-y-2 border-t border-slate-100 dark:border-slate-700 pt-4">
                                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                                    <span className="truncate">{lideranca.municipio}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-[16px] text-slate-400">map</span>
                                    <span className="truncate">{lideranca.regiao}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-[16px] text-slate-400">call</span>
                                    <span className="truncate">{lideranca.contato}</span>
                                </div>
                                {lideranca.email && (
                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-[16px] text-slate-400">mail</span>
                                        <span className="truncate">{lideranca.email}</span>
                                    </div>
                                )}
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
                            <h3 className="text-xl font-bold text-navy-dark dark:text-white">{editingLideranca.id ? 'Editar Liderança' : 'Nova Liderança'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Coluna 1: Dados Principais */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-turquoise uppercase tracking-wider mb-2">Dados da Liderança</h4>

                                <div className="flex justify-center mb-4">
                                    <ImageUpload
                                        currentImage={editingLideranca.avatarUrl}
                                        onImageSelected={(base64) => setEditingLideranca({ ...editingLideranca, avatarUrl: base64 })}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={editingLideranca.nome || ''}
                                        onChange={e => setEditingLideranca({ ...editingLideranca, nome: e.target.value })}
                                        className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Município</label>
                                        <input
                                            type="text"
                                            value={editingLideranca.municipio || ''}
                                            onChange={e => setEditingLideranca({ ...editingLideranca, municipio: e.target.value })}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Região</label>
                                        <input
                                            type="text"
                                            value={editingLideranca.regiao || ''}
                                            onChange={e => setEditingLideranca({ ...editingLideranca, regiao: e.target.value })}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Cargo</label>
                                        <select
                                            value={editingLideranca.cargo || 'Vereador'}
                                            onChange={e => setEditingLideranca({ ...editingLideranca, cargo: e.target.value as any })}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        >
                                            <option>Vereador</option>
                                            <option>Prefeito</option>
                                            <option>Vice-Prefeito</option>
                                            <option>Liderança Comunitária</option>
                                            <option>Ex-Prefeito</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Partido</label>
                                        <input
                                            type="text"
                                            value={editingLideranca.partido || ''}
                                            onChange={e => setEditingLideranca({ ...editingLideranca, partido: e.target.value })}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Coluna 2: Contato e Endereço */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-turquoise uppercase tracking-wider mb-2">Contato e Endereço</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Telefone</label>
                                        <input
                                            type="text"
                                            value={editingLideranca.contato || ''}
                                            onChange={e => setEditingLideranca({ ...editingLideranca, contato: e.target.value })}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                                        <input
                                            type="email"
                                            value={editingLideranca.email || ''}
                                            onChange={e => setEditingLideranca({ ...editingLideranca, email: e.target.value })}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Logradouro</label>
                                        <input
                                            type="text"
                                            value={editingLideranca.endereco?.logradouro || ''}
                                            onChange={e => updateEndereco('logradouro', e.target.value)}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Número</label>
                                        <input
                                            type="text"
                                            value={editingLideranca.endereco?.numero || ''}
                                            onChange={e => updateEndereco('numero', e.target.value)}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Bairro</label>
                                        <input
                                            type="text"
                                            value={editingLideranca.endereco?.bairro || ''}
                                            onChange={e => updateEndereco('bairro', e.target.value)}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">CEP</label>
                                        <input
                                            type="text"
                                            value={editingLideranca.endereco?.cep || ''}
                                            onChange={e => updateEndereco('cep', e.target.value)}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Cidade</label>
                                        <input
                                            type="text"
                                            value={editingLideranca.endereco?.cidade || ''}
                                            onChange={e => updateEndereco('cidade', e.target.value)}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">UF</label>
                                        <input
                                            type="text"
                                            value={editingLideranca.endereco?.uf || ''}
                                            onChange={e => updateEndereco('uf', e.target.value)}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Mandato</label>
                                        <select
                                            value={editingLideranca.origem || 'Alê Portela'}
                                            onChange={e => setEditingLideranca({ ...editingLideranca, origem: e.target.value as any })}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        >
                                            <option>Alê Portela</option>
                                            <option>Lincoln Portela</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                                        <select
                                            value={editingLideranca.status || 'Ativo'}
                                            onChange={e => setEditingLideranca({ ...editingLideranca, status: e.target.value as any })}
                                            className="w-full mt-1 p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-turquoise/20 outline-none"
                                        >
                                            <option>Ativo</option>
                                            <option>Inativo</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 dark:border-slate-700 pt-6">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                            <button onClick={handleSaveLideranca} className="px-6 py-2.5 text-sm font-bold bg-turquoise text-white rounded-xl hover:brightness-110 shadow-lg shadow-turquoise/20 transition-all active:scale-95">Salvar Alterações</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiderancasPage;
