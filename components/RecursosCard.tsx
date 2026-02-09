
import React, { useState, useEffect } from 'react';
import { Recurso } from '../types';
import { createRecurso, getRecursosByMunicipio } from '../services/api';

interface RecursosCardProps {
    municipioId: string;
}

const RecursosCard: React.FC<RecursosCardProps> = ({ municipioId }) => {
    const [recursos, setRecursos] = useState<Recurso[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        tipo: 'Emenda',
        descricao: '',
        valor: '',
        origem: '',
        status: 'Aprovado',
        responsavel: ''
    });

    const fetchRecursos = async () => {
        setIsLoading(true);
        try {
            const data = await getRecursosByMunicipio(municipioId);
            setRecursos(data);
        } catch (error) {
            console.error('Erro ao buscar recursos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecursos();
    }, [municipioId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await createRecurso({
                municipio_id: municipioId,
                tipo: formData.tipo,
                descricao: formData.descricao,
                valor: parseFloat(formData.valor),
                origem: formData.origem,
                status: formData.status,
                responsavel: formData.responsavel,
                data_aprovacao: new Date().toISOString()
            });
            setShowModal(false);
            setFormData({
                tipo: 'Emenda',
                descricao: '',
                valor: '',
                origem: '',
                status: 'Aprovado',
                responsavel: ''
            });
            fetchRecursos(); // Recarrega a lista
        } catch (error) {
            console.error('Erro ao criar recurso:', error);
            alert('Erro ao criar recurso.');
        } finally {
            setIsSaving(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');

    const totalRecursos = recursos.reduce((acc, r) => acc + r.valor, 0);

    const recursosFiltrados = recursos.filter(r => {
        const matchTipo = filtroTipo ? r.tipo === filtroTipo : true;
        const matchStatus = filtroStatus ? r.status === filtroStatus : true;
        return matchTipo && matchStatus;
    });

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-col gap-4 bg-white dark:bg-slate-800">
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="font-bold text-navy-dark dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-turquoise">payments</span>
                            Recursos e Emendas
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">Total Recebido: <span className="font-bold text-emerald-600">{formatCurrency(totalRecursos)}</span></p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="text-xs font-bold text-white bg-turquoise px-3 py-1.5 rounded-lg hover:bg-turquoise/90 transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Novo
                    </button>
                </div>

                {/* Filtros */}
                <div className="flex gap-2">
                    <select
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        className="text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none focus:border-turquoise"
                    >
                        <option value="">Todos os Tipos</option>
                        <option value="Emenda">Emenda</option>
                        <option value="Veículo">Veículo</option>
                        <option value="Equipamento">Equipamento</option>
                        <option value="Obra">Obra</option>
                    </select>
                    <select
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                        className="text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none focus:border-turquoise"
                    >
                        <option value="">Todos os Status</option>
                        <option value="Aprovado">Aprovado</option>
                        <option value="Em Execução">Em Execução</option>
                        <option value="Concluído">Concluído</option>
                    </select>
                </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[400px] overflow-y-auto">
                {isLoading ? (
                    <div className="p-6 text-center text-slate-500 text-sm">Carregando recursos...</div>
                ) : recursosFiltrados.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">Nenhum recurso encontrado.</div>
                ) : (
                    recursosFiltrados.map(recurso => (
                        <div key={recurso.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                                        ${recurso.tipo === 'Emenda' ? 'bg-purple-100 text-purple-700' :
                                            recurso.tipo === 'Veículo' ? 'bg-blue-100 text-blue-700' :
                                                recurso.tipo === 'Obra' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-700'}`}>
                                        {recurso.tipo}
                                    </span>
                                    <span className="text-sm font-bold text-navy-dark dark:text-white">{recurso.descricao}</span>
                                </div>
                                <span className="font-bold text-emerald-600 text-sm">{formatCurrency(recurso.valor)}</span>
                            </div>
                            <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                                <span>Origem: {recurso.origem}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium
                                    ${recurso.status === 'Concluído' ? 'bg-emerald-50 text-emerald-600' :
                                        recurso.status === 'Em Execução' ? 'bg-blue-50 text-blue-600' :
                                            'bg-amber-50 text-amber-600'}`}>
                                    {recurso.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de Cadastro */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                            <h3 className="font-bold text-lg text-navy-dark dark:text-white">Adicionar Recurso</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Recurso</label>
                                <select
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-turquoise"
                                >
                                    <option value="Emenda">Emenda Parlamentar</option>
                                    <option value="Veículo">Veículo</option>
                                    <option value="Equipamento">Equipamento</option>
                                    <option value="Obra">Obra</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
                                <input
                                    type="text"
                                    name="descricao"
                                    value={formData.descricao}
                                    onChange={handleInputChange}
                                    placeholder="Ex: Reforma da Escola X"
                                    required
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-turquoise"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor (R$)</label>
                                    <input
                                        type="number"
                                        name="valor"
                                        value={formData.valor}
                                        onChange={handleInputChange}
                                        placeholder="0,00"
                                        required
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-turquoise"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-turquoise"
                                    >
                                        <option value="Aprovado">Aprovado</option>
                                        <option value="Em Execução">Em Execução</option>
                                        <option value="Concluído">Concluído</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Origem do Recurso</label>
                                <input
                                    type="text"
                                    name="origem"
                                    value={formData.origem}
                                    onChange={handleInputChange}
                                    placeholder="Ex: Emenda Dep. Fulano"
                                    required
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-turquoise"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Responsável</label>
                                <input
                                    type="text"
                                    name="responsavel"
                                    value={formData.responsavel}
                                    onChange={handleInputChange}
                                    placeholder="Nome do responsável"
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-turquoise"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 px-4 py-2 bg-turquoise text-white rounded-lg text-sm font-bold hover:bg-turquoise/90 transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                                >
                                    {isSaving && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                    Salvar Recurso
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecursosCard;
