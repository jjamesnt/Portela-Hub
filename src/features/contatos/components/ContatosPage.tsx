import React, { useContext, useState } from 'react';
import { AppContext } from '../../../../context/AppContext';
import { useContatos } from '../hooks/useContatos';
import Loader from '../../../../components/Loader';
import ContatoModal from '../../../../components/ContatoModal';

export const ContatosPage: React.FC<{ navigateTo: (page: string, params?: any) => void }> = ({ navigateTo }) => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { profile } = context;

    const role = (profile?.role || 'user').toLowerCase();
    const isMasterOrAdmin = role === 'master' || role === 'admin' || role === 'coordenador';
    const isRestricted = !isMasterOrAdmin;

    const {
        contatos,
        loading,
        searchTerm,
        setSearchTerm,
        filterType,
        setFilterType,
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedContatos,
        stats,
        reload
    } = useContatos();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [columns, setColumns] = useState([
        { id: 'tipo', label: 'Tipo' },
        { id: 'cargo', label: 'Cargo / Partido' },
        { id: 'localidade', label: 'Localidade' },
        { id: 'cadastradoPor', label: 'Cadastrado Por' }
    ]);
    const [draggedColIdx, setDraggedColIdx] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedColIdx(index);
        e.dataTransfer.effectAllowed = 'move';
        // Optional: reduce opacity of dragged element
        setTimeout(() => {
            if (e.target instanceof HTMLElement) {
                e.target.style.opacity = '0.5';
            }
        }, 0);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
        
        if (draggedColIdx === null || draggedColIdx === index) return;
        
        setColumns(prevCols => {
            const newCols = [...prevCols];
            const draggedItem = newCols[draggedColIdx];
            newCols.splice(draggedColIdx, 1);
            newCols.splice(index, 0, draggedItem);
            setDraggedColIdx(index);
            return newCols;
        });
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedColIdx(null);
        if (e.target instanceof HTMLElement) {
            e.target.style.opacity = '1';
        }
    };

    const getTypeColor = (tipo: string) => {
        switch(tipo) {
            case 'Liderança': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Assessor': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Apoiador': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader /></div>;
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-24">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-black text-navy-dark dark:text-white tracking-tight">CRM de Contatos</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Gestão unificada de lideranças, assessores e base política.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-turquoise text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-turquoise/30 hover:bg-turquoise-dark transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Novo Contato
                </button>
            </div>

            <ContatoModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    reload();
                }}
            />

            {/* Filters Area */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input 
                        type="text" 
                        placeholder="Buscar por nome, cidade, telefone ou cargo..."
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-turquoise/20 focus:border-turquoise outline-none transition-all dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    {['Todos', 'Liderança', 'Assessor', 'Apoiador'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterType === type ? 'bg-white dark:bg-slate-700 text-navy-dark dark:text-white shadow-sm' : 'text-slate-500 hover:text-navy-dark dark:hover:text-white'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dashboard de Cadastros (Apenas Master/Admin/Coordenador) */}
            {isMasterOrAdmin && Object.keys(stats).length > 0 && (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-turquoise text-[18px]">bar_chart</span>
                        Desempenho de Cadastros
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(stats)
                            .sort((a, b) => b[1] - a[1]) // Ordem decrescente
                            .map(([nome, count]) => (
                            <div key={nome} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-600">
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{nome}</span>
                                <span className="bg-turquoise text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Data Grid */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                                <th className="py-4 px-6 font-bold w-[30%]">Nome / Contato</th>
                                {columns.map((col, index) => (
                                    <th 
                                        key={col.id} 
                                        className="py-4 px-6 font-bold cursor-move hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        title="Arraste para reordenar"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[14px] text-slate-300">drag_indicator</span>
                                            {col.label}
                                        </div>
                                    </th>
                                ))}
                                <th className="py-4 px-6 font-bold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {paginatedContatos.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                                        Nenhum contato encontrado para os filtros atuais.
                                    </td>
                                </tr>
                            ) : (
                                paginatedContatos.map(contato => (
                                    <tr key={contato.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="py-3 px-6">
                                            <div className="flex items-center gap-3">
                                                {contato.avatarUrl ? (
                                                    <img src={contato.avatarUrl} alt={contato.nome} className="size-10 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm" />
                                                ) : (
                                                    <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 flex items-center justify-center font-bold text-sm border-2 border-white dark:border-slate-800">
                                                        {contato.nome.substring(0,2).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-navy-dark dark:text-white text-sm">{contato.nome}</div>
                                                    <div className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[12px]">phone_iphone</span>
                                                        {isRestricted ? (contato.telefone ? '(••) •••••-••••' : 'Sem telefone') : (contato.telefone || 'Sem telefone')}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        {columns.map(col => {
                                            switch (col.id) {
                                                case 'tipo':
                                                    return (
                                                        <td key={col.id} className="py-3 px-6">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getTypeColor(contato.tipo)}`}>
                                                                {contato.tipo}
                                                            </span>
                                                        </td>
                                                    );
                                                case 'cargo':
                                                    return (
                                                        <td key={col.id} className="py-3 px-6 text-sm text-slate-600 dark:text-slate-300 font-medium">
                                                            {contato.cargoOuPartido || '-'}
                                                        </td>
                                                    );
                                                case 'localidade':
                                                    return (
                                                        <td key={col.id} className="py-3 px-6">
                                                            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                                {contato.municipioOuRegiao}
                                                            </div>
                                                        </td>
                                                    );
                                                case 'cadastradoPor':
                                                    return (
                                                        <td key={col.id} className="py-3 px-6">
                                                            {contato.cadastradoPorNome ? (
                                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 rounded-lg text-xs font-bold border border-sky-100 dark:border-sky-800">
                                                                    <span className="material-symbols-outlined text-[14px]">account_tree</span>
                                                                    {contato.cadastradoPorNome}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-slate-400 italic">Desconhecido</span>
                                                            )}
                                                        </td>
                                                    );
                                                default:
                                                    return null;
                                            }
                                        })}
                                        <td className="py-3 px-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => navigateTo('ContatoPerfil', { id: contato.id, type: contato.tipo })}
                                                    className="p-1.5 text-slate-400 hover:text-turquoise transition-colors"
                                                    title="Ver Perfil Completo"
                                                >
                                                    <span className="material-symbols-outlined text-lg">visibility</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                        <span className="text-xs font-medium text-slate-500">
                            Página {currentPage} de {totalPages} ({contatos.length} contatos)
                        </span>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
