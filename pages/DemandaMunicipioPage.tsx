import React, { useState, useEffect } from 'react';
import { getDemandasByMunicipio, updateDemanda, createDemanda, getAssessores } from '../services/api';
import { Demanda } from '../types';
import Loader from '../components/Loader';

interface DemandaMunicipioProps {
    municipioId: string;
    municipioNome: string;
    demandaId?: string;
    navigateTo: (page: string, params?: any) => void;
}

const statusOptions = ['Em Análise', 'Em Execução', 'Concluída'];
const prioridadeOptions = ['Alta', 'Média', 'Baixa'];
const tipoOptions = ['Infraestrutura', 'Saúde', 'Educação', 'Segurança', 'Social', 'Administrativo', 'Outro'];
const areaOptions = ['Gabinete', 'Infraestrutura', 'Saúde', 'Educação', 'Segurança', 'Assistência Social', 'Meio Ambiente', 'Comunicação', 'Jurídico', 'Outro'];

const statusColors: Record<string, string> = {
    'Em Análise': 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400',
    'Em Execução': 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
    'Concluída': 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400',
};

const prioridadeColors: Record<string, string> = {
    'Alta': 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400',
    'Média': 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400',
    'Baixa': 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-700/50 dark:text-slate-400',
};

// Tipo abbreviations for the ID code
const tipoAbrev: Record<string, string> = {
    'Infraestrutura': 'INF', 'Saúde': 'SAU', 'Educação': 'EDU',
    'Segurança': 'SEG', 'Social': 'SOC', 'Administrativo': 'ADM', 'Outro': 'OUT',
};

// Generate short acronym ID: #NNN/AA-CID-ASS-TIP
const generateDemandaCode = (d: any, index: number, municipioNome: string) => {
    const num = String(index + 1).padStart(3, '0');
    const year = d.created_at ? new Date(d.created_at).getFullYear().toString().slice(-2) : '26';
    const fullYear = d.created_at ? new Date(d.created_at).getFullYear().toString() : '2026';
    const cidadeIniciais = municipioNome.split(/\s+/).map(w => w[0]?.toUpperCase() || '').join('').slice(0, 3);
    const assessor = (d.atribuido_a || d.recebido_por || '').trim();
    const assessorIniciais = assessor ? assessor.split(/\s+/).map((w: string) => w[0]?.toUpperCase() || '').join('').slice(0, 2) : '';
    const tipoCode = tipoAbrev[d.tipo] || (d.tipo || 'OUT').slice(0, 3).toUpperCase();
    const parts = [num + '/' + year, cidadeIniciais, tipoCode];
    if (assessorIniciais) parts.splice(2, 0, assessorIniciais);
    const code = '#' + parts.join('-');

    // Breakdown for tooltip
    const breakdown = [
        { key: num, label: `Demanda nº ${index + 1}` },
        { key: year, label: `Ano ${fullYear}` },
        { key: cidadeIniciais, label: municipioNome },
    ];
    if (assessorIniciais) breakdown.push({ key: assessorIniciais, label: assessor });
    breakdown.push({ key: tipoCode, label: d.tipo || 'Outro' });

    return { code, breakdown };
};

const DemandaMunicipioPage: React.FC<DemandaMunicipioProps> = ({ municipioId, municipioNome, demandaId, navigateTo }) => {
    const [demandas, setDemandas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDemanda, setSelectedDemanda] = useState<any | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [observacao, setObservacao] = useState('');
    const [showNova, setShowNova] = useState(false);
    const [novaForm, setNovaForm] = useState({
        titulo: '', descricao: '', tipo: 'Infraestrutura', status: 'Em Análise',
        prioridade: 'Média', origem: 'Alê Portela', prazo: ''
    });
    const [assessores, setAssessores] = useState<{ id: string; nome: string }[]>([]);

    const fetchDemandas = async () => {
        try {
            setIsLoading(true);
            const data = await getDemandasByMunicipio(municipioId);
            // Map snake_case fields
            const mapped = data.map((d: any) => ({
                id: d.id,
                titulo: d.titulo || d.descricao,
                descricao: d.descricao,
                tipo: d.tipo,
                status: d.status || 'Em Análise',
                prioridade: d.prioridade || 'Média',
                origem: d.origem,
                prazo: d.prazo,
                observacoes: d.observacoes || '',
                solicitante: d.solicitante || '',
                recebido_por: d.recebido_por || '',
                atribuido_a: d.atribuido_a || '',
                redirecionado_para: d.redirecionado_para || '',
                area_responsavel: d.area_responsavel || '',
                created_at: d.created_at,
            }));
            setDemandas(mapped);
            // Pre-select specific demand if demandaId is provided, otherwise first one
            const target = demandaId ? mapped.find((d: any) => d.id === demandaId) : mapped[0];
            if (target && !selectedDemanda) {
                selectDemanda(target);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchDemandas(); }, [municipioId]);

    useEffect(() => {
        const loadAssessores = async () => {
            try {
                const data = await getAssessores();
                setAssessores(data.map((a: any) => ({ id: a.id, nome: a.nome })));
            } catch (err) { console.error(err); }
        };
        loadAssessores();
    }, []);

    const selectDemanda = (d: any) => {
        setSelectedDemanda(d);
        setEditForm({ ...d });
        setObservacao(d.observacoes || '');
    };

    const handleSave = async () => {
        if (!selectedDemanda) return;
        setSaving(true);
        try {
            await updateDemanda(selectedDemanda.id, {
                titulo: editForm.titulo,
                descricao: editForm.descricao,
                tipo: editForm.tipo,
                status: editForm.status,
                prioridade: editForm.prioridade,
                origem: editForm.origem,
                prazo: editForm.prazo || undefined,
                observacoes: observacao,
                solicitante: editForm.solicitante,
                recebido_por: editForm.recebido_por,
                atribuido_a: editForm.atribuido_a,
                redirecionado_para: editForm.redirecionado_para,
                area_responsavel: editForm.area_responsavel,
            } as any);
            const freshData = await getDemandasByMunicipio(municipioId);
            const mapped = freshData.map((d: any) => ({
                id: d.id,
                titulo: d.titulo || d.descricao,
                descricao: d.descricao,
                tipo: d.tipo,
                status: d.status || 'Em Análise',
                prioridade: d.prioridade || 'Média',
                origem: d.origem,
                prazo: d.prazo,
                observacoes: d.observacoes || '',
                solicitante: d.solicitante || '',
                recebido_por: d.recebido_por || '',
                atribuido_a: d.atribuido_a || '',
                redirecionado_para: d.redirecionado_para || '',
                area_responsavel: d.area_responsavel || '',
                created_at: d.created_at,
            }));
            setDemandas(mapped);
            const updated = mapped.find((d: any) => d.id === selectedDemanda.id);
            if (updated) selectDemanda(updated);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!novaForm.titulo) return;
        setSaving(true);
        try {
            await createDemanda({
                municipio_id: municipioId,
                titulo: novaForm.titulo,
                descricao: novaForm.descricao,
                tipo: novaForm.tipo,
                status: novaForm.status,
                prioridade: novaForm.prioridade,
                origem: novaForm.origem,
                prazo: novaForm.prazo || undefined,
            });
            setShowNova(false);
            setNovaForm({ titulo: '', descricao: '', tipo: 'Infraestrutura', status: 'Em Análise', prioridade: 'Média', origem: 'Alê Portela', prazo: '' });
            await fetchDemandas();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const stats = {
        total: demandas.length,
        emAnalise: demandas.filter(d => d.status === 'Em Análise').length,
        emExecucao: demandas.filter(d => d.status === 'Em Execução').length,
        concluidas: demandas.filter(d => d.status === 'Concluída').length,
    };

    if (isLoading) return <Loader />;

    return (
        <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
            {/* Header com voltar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigateTo('Demandas')}
                        className="size-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined text-slate-500">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-navy-dark dark:text-white tracking-tight">{municipioNome}</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Gestão de Demandas do Município</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowNova(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-turquoise text-white rounded-xl font-bold hover:bg-turquoise/90 transition-all shadow-lg shadow-turquoise/20"
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    Nova Demanda
                </button>
            </div>

            {/* KPIs resumo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total', value: stats.total, color: 'text-navy-dark dark:text-white', bg: 'bg-turquoise/5' },
                    { label: 'Em Análise', value: stats.emAnalise, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10' },
                    { label: 'Em Execução', value: stats.emExecucao, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10' },
                    { label: 'Concluídas', value: stats.concluidas, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
                ].map(kpi => (
                    <div key={kpi.label} className={`${kpi.bg} p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50`}>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
                        <h3 className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</h3>
                    </div>
                ))}
            </div>

            {/* Layout master-detail */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lista de demandas (lateral esquerda) */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
                            <h4 className="font-bold text-navy-dark dark:text-white text-sm">Demandas ({demandas.length})</h4>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[600px] overflow-y-auto">
                            {demandas.length === 0 ? (
                                <div className="p-8 text-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-200">inbox</span>
                                    <p className="text-slate-400 mt-2 text-sm">Nenhuma demanda registrada.</p>
                                </div>
                            ) : (
                                demandas.map(d => (
                                    <button
                                        key={d.id}
                                        onClick={() => selectDemanda(d)}
                                        className={`w-full text-left px-5 py-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-700/30 ${selectedDemanda?.id === d.id ? 'bg-turquoise/5 border-l-4 border-l-turquoise' : 'border-l-4 border-l-transparent'}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-bold truncate ${selectedDemanda?.id === d.id ? 'text-turquoise' : 'text-navy-dark dark:text-white'}`}>{d.titulo}</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5 truncate">{d.tipo || 'Sem tipo'}</p>
                                            </div>
                                            <span className={`shrink-0 px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${statusColors[d.status] || ''}`}>
                                                {d.status === 'Em Análise' ? 'ANÁLISE' : d.status === 'Em Execução' ? 'EXEC.' : 'CONC.'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${prioridadeColors[d.prioridade] || ''}`}>{d.prioridade}</span>
                                            <span className="text-[10px] text-slate-400">•</span>
                                            <span className="text-[10px] text-slate-400">{d.origem?.split(' ')[0] || '-'}</span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Painel de detalhes (direita) */}
                <div className="lg:col-span-2">
                    {selectedDemanda ? (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            {/* Header do detalhe */}
                            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-turquoise/5 to-transparent flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        {(() => {
                                            const { code, breakdown } = generateDemandaCode({ ...editForm, created_at: selectedDemanda.created_at }, demandas.findIndex(d => d.id === selectedDemanda.id), municipioNome);
                                            return (
                                                <div className="relative group/id cursor-help">
                                                    <span className="px-3 py-1 bg-navy-dark text-white rounded-lg text-xs font-mono font-black tracking-wider">
                                                        {code}
                                                    </span>
                                                    <div className="absolute left-0 top-full mt-2 w-80 bg-navy-dark text-white text-[11px] rounded-xl p-4 shadow-2xl opacity-0 invisible group-hover/id:opacity-100 group-hover/id:visible transition-all duration-200 z-50 pointer-events-none">
                                                        <p className="font-bold text-turquoise mb-2.5 text-xs">Composição do ID: <span className="font-mono text-white">{code}</span></p>
                                                        <div className="space-y-1.5">
                                                            {breakdown.map((b, i) => (
                                                                <div key={i} className="flex items-center gap-2">
                                                                    <span className="text-amber-300 font-mono font-black min-w-[40px]">{b.key}</span>
                                                                    <span className="text-slate-500">→</span>
                                                                    <span className="text-slate-300">{b.label}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="absolute -top-1.5 left-6 w-3 h-3 bg-navy-dark rotate-45"></div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                        <h3 className="text-lg font-extrabold text-navy-dark dark:text-white">Detalhes da Demanda</h3>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Criada em {selectedDemanda.created_at ? new Date(selectedDemanda.created_at).toLocaleDateString('pt-BR') : '-'}</p>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-turquoise text-white rounded-xl font-bold text-sm hover:bg-turquoise/90 transition-all shadow-lg shadow-turquoise/20 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-base">{saving ? 'hourglass_empty' : 'save'}</span>
                                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>

                            {/* Timeline de progresso */}
                            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-700">
                                {/* Status progress */}
                                <div className="flex items-center gap-0 mb-4">
                                    {statusOptions.map((s, i) => {
                                        const currentIndex = statusOptions.indexOf(editForm.status || 'Em Análise');
                                        const isCompleted = i <= currentIndex;
                                        const isCurrent = i === currentIndex;
                                        return (
                                            <React.Fragment key={s}>
                                                <div className="flex flex-col items-center gap-1 relative z-10">
                                                    <div className={`size-7 rounded-full flex items-center justify-center border-2 transition-all ${isCurrent ? 'bg-turquoise border-turquoise text-white scale-110 shadow-lg shadow-turquoise/30' : isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'}`}>
                                                        <span className="material-symbols-outlined text-sm">
                                                            {isCompleted && !isCurrent ? 'check' : i === 0 ? 'search' : i === 1 ? 'engineering' : 'task_alt'}
                                                        </span>
                                                    </div>
                                                    <span className={`text-[9px] font-bold uppercase tracking-wider ${isCurrent ? 'text-turquoise' : isCompleted ? 'text-emerald-500' : 'text-slate-400'}`}>{s}</span>
                                                </div>
                                                {i < statusOptions.length - 1 && (
                                                    <div className={`flex-1 h-0.5 -mt-4 ${i < currentIndex ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>

                                {/* Flow: origin → people → time */}
                                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                                    {/* Origem */}
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <span className="material-symbols-outlined text-xs text-slate-400">flag</span>
                                        <span className="text-slate-500">Origem:</span>
                                        <span className="font-bold text-navy-dark dark:text-white">{editForm.origem || '-'}</span>
                                    </div>

                                    {/* People flow */}
                                    {editForm.solicitante && (
                                        <>
                                            <span className="material-symbols-outlined text-slate-300 text-sm">arrow_forward</span>
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <span className="material-symbols-outlined text-xs text-amber-500">person</span>
                                                <span className="font-medium text-slate-600 dark:text-slate-300">{editForm.solicitante}</span>
                                            </div>
                                        </>
                                    )}
                                    {editForm.recebido_por && (
                                        <>
                                            <span className="material-symbols-outlined text-slate-300 text-sm">arrow_forward</span>
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <span className="material-symbols-outlined text-xs text-blue-500">how_to_reg</span>
                                                <span className="font-medium text-slate-600 dark:text-slate-300">{editForm.recebido_por}</span>
                                            </div>
                                        </>
                                    )}
                                    {editForm.atribuido_a && (
                                        <>
                                            <span className="material-symbols-outlined text-slate-300 text-sm">arrow_forward</span>
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700/30">
                                                <span className="material-symbols-outlined text-xs text-indigo-500">assignment_ind</span>
                                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{editForm.atribuido_a}</span>
                                            </div>
                                        </>
                                    )}
                                    {editForm.redirecionado_para && (
                                        <>
                                            <span className="material-symbols-outlined text-orange-400 text-sm">redo</span>
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700/30">
                                                <span className="material-symbols-outlined text-xs text-orange-500">swap_horiz</span>
                                                <span className="font-bold text-orange-600 dark:text-orange-400">{editForm.redirecionado_para}</span>
                                            </div>
                                        </>
                                    )}

                                    {/* Tempo */}
                                    <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <span className="material-symbols-outlined text-xs text-slate-400">schedule</span>
                                        <span className="text-slate-500">Tempo:</span>
                                        <span className="font-bold text-navy-dark dark:text-white">
                                            {(() => {
                                                if (!selectedDemanda.created_at) return '-';
                                                const diff = Date.now() - new Date(selectedDemanda.created_at).getTime();
                                                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                                if (days === 0) return 'Hoje';
                                                if (days === 1) return '1 dia';
                                                if (days < 30) return `${days} dias`;
                                                const months = Math.floor(days / 30);
                                                return months === 1 ? '1 mês' : `${months} meses`;
                                            })()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Campos editáveis */}
                            <div className="p-6 space-y-5">
                                {/* Título */}
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Título da Demanda</label>
                                    <input
                                        value={editForm.titulo || ''}
                                        onChange={e => setEditForm({ ...editForm, titulo: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-turquoise/30 transition-all"
                                    />
                                </div>

                                {/* Descrição */}
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Descrição Detalhada</label>
                                    <textarea
                                        value={editForm.descricao || ''}
                                        onChange={e => setEditForm({ ...editForm, descricao: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-turquoise/30 resize-none h-24 transition-all"
                                    />
                                </div>

                                {/* Grid de campos */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Tipo</label>
                                        <select value={editForm.tipo || ''} onChange={e => setEditForm({ ...editForm, tipo: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-turquoise/30">
                                            {tipoOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Status</label>
                                        <select value={editForm.status || ''} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-turquoise/30">
                                            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Prioridade</label>
                                        <select value={editForm.prioridade || ''} onChange={e => setEditForm({ ...editForm, prioridade: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-turquoise/30">
                                            {prioridadeOptions.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Origem</label>
                                        <select value={editForm.origem || ''} onChange={e => setEditForm({ ...editForm, origem: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-turquoise/30">
                                            <option value="Alê Portela">Alê Portela</option>
                                            <option value="Lincoln Portela">Lincoln Portela</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Prazo</label>
                                        <input
                                            type="date"
                                            value={editForm.prazo || ''}
                                            onChange={e => setEditForm({ ...editForm, prazo: e.target.value })}
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-turquoise/30"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Mandato</label>
                                        <select value={editForm.origem || ''} onChange={e => setEditForm({ ...editForm, origem: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-turquoise/30 font-bold">
                                            <option value="Alê Portela">🟢 Alê Portela</option>
                                            <option value="Lincoln Portela">🔵 Lincoln Portela</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Solicitante e Recebido por */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Solicitante</label>
                                        <input
                                            value={editForm.solicitante || ''}
                                            onChange={e => setEditForm({ ...editForm, solicitante: e.target.value })}
                                            placeholder="Nome de quem solicitou a demanda..."
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-turquoise/30 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Recebido por</label>
                                        <input
                                            value={editForm.recebido_por || ''}
                                            onChange={e => setEditForm({ ...editForm, recebido_por: e.target.value })}
                                            placeholder="Nome do assessor que recebeu..."
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-turquoise/30 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Atribuição e Redirecionamento */}
                                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200/50 dark:border-indigo-700/30 rounded-xl p-4 space-y-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="material-symbols-outlined text-indigo-500 text-base">assignment_ind</span>
                                        <h4 className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest">Atribuição e Encaminhamento</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Atribuído a</label>
                                            <select
                                                value={editForm.atribuido_a || ''}
                                                onChange={e => setEditForm({ ...editForm, atribuido_a: e.target.value })}
                                                className="w-full px-3 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-300/30"
                                            >
                                                <option value="">Selecione o assessor...</option>
                                                {assessores.map(a => <option key={a.id} value={a.nome}>{a.nome}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Área Responsável</label>
                                            <select
                                                value={editForm.area_responsavel || ''}
                                                onChange={e => setEditForm({ ...editForm, area_responsavel: e.target.value })}
                                                className="w-full px-3 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-300/30"
                                            >
                                                <option value="">Selecione a área...</option>
                                                {areaOptions.map(a => <option key={a} value={a}>{a}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Redirecionado para</label>
                                            <select
                                                value={editForm.redirecionado_para || ''}
                                                onChange={e => setEditForm({ ...editForm, redirecionado_para: e.target.value })}
                                                className="w-full px-3 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-300/30"
                                            >
                                                <option value="">Nenhum redirecionamento</option>
                                                {assessores.map(a => <option key={a.id} value={a.nome}>{a.nome}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Divisor */}
                                <hr className="border-slate-100 dark:border-slate-700" />

                                {/* Observações */}
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-xs">sticky_note_2</span>
                                        Observações e Anotações
                                    </label>
                                    <textarea
                                        value={observacao}
                                        onChange={e => setObservacao(e.target.value)}
                                        placeholder="Adicione observações, atualizações, reuniões realizadas, contatos feitos..."
                                        className="w-full px-4 py-3 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-700/30 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-300/30 resize-none h-32 transition-all placeholder:text-amber-300 dark:placeholder:text-amber-700"
                                    />
                                </div>

                                {/* Divisor */}
                                <hr className="border-slate-100 dark:border-slate-700" />

                                {/* Upload de arquivos */}
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-xs">attach_file</span>
                                        Anexos e Documentos
                                    </label>
                                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-turquoise/50 hover:bg-turquoise/5 transition-all cursor-pointer group">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-turquoise transition-colors">cloud_upload</span>
                                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2 group-hover:text-turquoise transition-colors">Clique ou arraste arquivos aqui</p>
                                        <p className="text-[11px] text-slate-400 mt-1">PDF, DOC, XLSX, imagens — até 10MB por arquivo</p>
                                        <input type="file" multiple className="hidden" />
                                    </div>
                                    {/* Placeholder de arquivos existentes */}
                                    <div className="mt-3 space-y-2">
                                        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">
                                            <span className="material-symbols-outlined text-red-500 text-lg">picture_as_pdf</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-600 dark:text-slate-300 truncate text-xs">Sem anexos nesta demanda</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Botão salvar inferior */}
                                <div className="flex items-center justify-between pt-2">
                                    <p className="text-[10px] text-slate-400">Última atualização: {selectedDemanda.created_at ? new Date(selectedDemanda.created_at).toLocaleString('pt-BR') : '-'}</p>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-turquoise text-white rounded-xl font-bold text-sm hover:bg-turquoise/90 transition-all shadow-lg shadow-turquoise/20 disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-base">save</span>
                                        {saving ? 'Salvando...' : 'Salvar Tudo'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center h-[400px]">
                            <div className="text-center">
                                <span className="material-symbols-outlined text-6xl text-slate-200">touch_app</span>
                                <p className="text-slate-400 mt-4 font-medium">Selecione uma demanda na lista para ver os detalhes.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Nova Demanda */}
            {showNova && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowNova(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-extrabold text-navy-dark dark:text-white">Nova Demanda</h3>
                                <p className="text-sm text-slate-400">Para: <span className="font-bold text-turquoise">{municipioNome}</span></p>
                            </div>
                            <button onClick={() => setShowNova(false)} className="size-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-slate-500">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Título *</label>
                                <input required value={novaForm.titulo} onChange={e => setNovaForm({ ...novaForm, titulo: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-turquoise/30" placeholder="Ex: Reforma da UBS Central" />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Descrição</label>
                                <textarea value={novaForm.descricao} onChange={e => setNovaForm({ ...novaForm, descricao: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-turquoise/30 resize-none h-20" placeholder="Detalhes..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Tipo</label>
                                    <select value={novaForm.tipo} onChange={e => setNovaForm({ ...novaForm, tipo: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-turquoise/30">
                                        {tipoOptions.map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Prioridade</label>
                                    <select value={novaForm.prioridade} onChange={e => setNovaForm({ ...novaForm, prioridade: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-turquoise/30">
                                        {prioridadeOptions.map(p => <option key={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Origem</label>
                                    <select value={novaForm.origem} onChange={e => setNovaForm({ ...novaForm, origem: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-turquoise/30">
                                        <option>Alê Portela</option>
                                        <option>Lincoln Portela</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Prazo</label>
                                    <input type="date" value={novaForm.prazo} onChange={e => setNovaForm({ ...novaForm, prazo: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-turquoise/30" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowNova(false)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">Cancelar</button>
                                <button type="submit" disabled={saving || !novaForm.titulo} className="px-6 py-2.5 bg-turquoise text-white rounded-xl text-sm font-bold hover:bg-turquoise/90 transition-all shadow-lg shadow-turquoise/20 disabled:opacity-50">
                                    {saving ? 'Criando...' : 'Criar Demanda'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DemandaMunicipioPage;
