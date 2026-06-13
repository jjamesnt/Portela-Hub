import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { z } from 'zod';
import { Apoiador, Lideranca, MunicipioDetalhado } from '../types';
// Note: We'll implement the bulk API calls in services/api.ts
import { bulkInsertApoiadores, bulkInsertLiderancas, bulkInsertMunicipios, bulkInsertAssessores } from '../services/api';

interface ImportCsvModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type EntityType = 'Apoiadores' | 'Lideranças' | 'Assessores' | 'Municípios';

interface ValidationError {
    row: number;
    column: string;
    reason: string;
}

// Schemas Zod Estritos
const apoiadorSchema = z.object({
    Nome: z.string().min(1, 'Nome é obrigatório').transform(s => s.trim()),
    Email: z.string().email('E-mail inválido').optional().or(z.literal('')),
    Telefone: z.string().transform(s => s.replace(/[\(\)\-\s]/g, '')).optional().or(z.literal('')),
    Cidade: z.string().min(1, 'Cidade é obrigatória').transform(s => s.trim()),
    ID_Lideranca: z.string().transform(s => (s.trim() === '' ? undefined : Number(s))).optional()
});

const liderancaSchema = z.object({
    Nome: z.string().min(1, 'Nome é obrigatório').transform(s => s.trim()),
    Regiao_Bairro: z.string().min(1, 'Região/Bairro é obrigatório').transform(s => s.trim()),
    Telefone: z.string().min(1, 'Telefone é obrigatório').transform(s => s.replace(/[\(\)\-\s]/g, '')),
    Status: z.string().transform(s => {
        const val = s.trim().toLowerCase();
        if (val === 'ativo' || val === 'sim' || val === 'true') return true;
        if (val === 'inativo' || val === 'não' || val === 'nao' || val === 'false') return false;
        return true; // Padrão
    })
});

const assessorSchema = z.object({
    Nome: z.string().min(1, 'Nome é obrigatório').transform(s => s.trim()),
    Cargo: z.string().min(1, 'Cargo é obrigatório').transform(s => s.trim()),
    Regiao_Atuacao: z.string().min(1, 'Região de atuação é obrigatória').transform(s => s.trim()),
    Telefone: z.string().transform(s => s.replace(/[\(\)\-\s]/g, '')).optional().or(z.literal('')),
    Email: z.string().email('E-mail inválido').optional().or(z.literal('')),
});

const municipioSchema = z.object({
    Nome_Cidade: z.string().min(1, 'Nome da Cidade é obrigatório').transform(s => s.trim()),
    Microregiao: z.string().optional().or(z.literal('')),
    Populacao: z.string().transform(s => {
        const cleanStr = s.replace(/\./g, '').trim();
        return cleanStr ? parseInt(cleanStr, 10) : undefined;
    }).refine(n => n === undefined || (!isNaN(n) && n >= 0), 'População deve ser um número inteiro válido').optional()
});

const ImportCsvModal: React.FC<ImportCsvModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedEntity, setSelectedEntity] = useState<EntityType>('Apoiadores');
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const resetModal = () => {
        setStep(1);
        setSelectedEntity('Apoiadores');
        setValidationErrors([]);
        setParsedData([]);
        setIsUploading(false);
        setSuccessMessage('');
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    const handleDownloadTemplate = () => {
        let headers: string[] = [];
        let filename = '';

        if (selectedEntity === 'Apoiadores') {
            headers = ['Nome', 'Email', 'Telefone', 'Cidade', 'ID_Lideranca'];
            filename = 'template_apoiadores.csv';
        } else if (selectedEntity === 'Lideranças') {
            headers = ['Nome', 'Regiao_Bairro', 'Telefone', 'Status'];
            filename = 'template_liderancas.csv';
        } else if (selectedEntity === 'Assessores') {
            headers = ['Nome', 'Cargo', 'Regiao_Atuacao', 'Telefone', 'Email'];
            filename = 'template_assessores.csv';
        } else if (selectedEntity === 'Municípios') {
            headers = ['Nome_Cidade', 'Microregiao', 'Populacao'];
            filename = 'template_municipios.csv';
        }

        const csvContent = headers.join(',') + '\n';
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getInstructions = () => {
        const generalRule = "Regras Gerais: A planilha deve ser salva no formato CSV delimitado por vírgulas e usando codificação UTF-8. Evite remover ou alterar os cabeçalhos das colunas presentes no gabarito.";
        
        if (selectedEntity === 'Apoiadores') {
            return `${generalRule} Para Apoiadores: O nome é obrigatório. Se houver vínculo com Liderança, preencha a coluna "ID_Lideranca" com o ID numérico correspondente. Telefones podem ser colocados com DDD (mesmo com parênteses, serão higienizados).`;
        } else if (selectedEntity === 'Lideranças') {
            return `${generalRule} Para Lideranças: "Nome", "Regiao_Bairro" e "Telefone" são obrigatórios. O "Status" pode ser preenchido como 'Ativo', 'Inativo', 'Sim' ou 'Não'.`;
        } else if (selectedEntity === 'Assessores') {
            return `${generalRule} Para Assessores: Preencha obrigatoriamente "Nome", "Cargo" e "Regiao_Atuacao". "Telefone" e "Email" são opcionais, mas se informar e-mail, deve ser um e-mail válido.`;
        } else {
            return `${generalRule} Para Municípios: A "Populacao" aceita apenas números inteiros sem pontuação ou texto.`;
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setValidationErrors([]);
        setParsedData([]);
        setSuccessMessage('');

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                validateData(results.data);
            },
            error: (error) => {
                setValidationErrors([{ row: 0, column: 'Arquivo', reason: error.message }]);
            }
        });
    };

    const validateData = (data: any[]) => {
        const errors: ValidationError[] = [];
        const validatedRows: any[] = [];

        data.forEach((row, index) => {
            let result;
            if (selectedEntity === 'Apoiadores') {
                result = apoiadorSchema.safeParse(row);
            } else if (selectedEntity === 'Lideranças') {
                result = liderancaSchema.safeParse(row);
            } else if (selectedEntity === 'Assessores') {
                result = assessorSchema.safeParse(row);
            } else {
                result = municipioSchema.safeParse(row);
            }

            if (!result.success) {
                result.error.errors.forEach(err => {
                    errors.push({
                        row: index + 2, // +2 for header and 1-indexing
                        column: err.path.join('.'),
                        reason: err.message
                    });
                });
            } else {
                validatedRows.push(result.data);
            }
        });

        if (errors.length > 0) {
            setValidationErrors(errors);
            setParsedData([]);
        } else {
            setValidationErrors([]);
            setParsedData(validatedRows);
        }
    };

    const handleConfirmImport = async () => {
        if (parsedData.length === 0) return;
        setIsUploading(true);

        try {
            if (selectedEntity === 'Apoiadores') {
                await bulkInsertApoiadores(parsedData);
            } else if (selectedEntity === 'Lideranças') {
                await bulkInsertLiderancas(parsedData);
            } else if (selectedEntity === 'Assessores') {
                await bulkInsertAssessores(parsedData);
            } else if (selectedEntity === 'Municípios') {
                await bulkInsertMunicipios(parsedData);
            }

            setSuccessMessage(`✓ ${parsedData.length} linhas importadas com sucesso!`);
            setTimeout(() => {
                handleClose();
            }, 3000);
        } catch (error: any) {
            console.error("Import error:", error);
            setValidationErrors([{ row: 0, column: 'API', reason: 'Erro ao inserir no banco: ' + error.message }]);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-8">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl max-h-full flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-turquoise">upload_file</span>
                            Importação em Lote (CSV)
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Importação segura com validação estrita</p>
                    </div>
                    <button onClick={handleClose} className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    
                    {/* Stepper */}
                    <div className="flex gap-4 mb-8">
                        {[1, 2, 3].map(num => (
                            <div key={num} className={`flex-1 h-2 rounded-full ${step >= num ? 'bg-turquoise' : 'bg-slate-100 dark:bg-slate-700'} transition-all duration-300`}></div>
                        ))}
                    </div>

                    {successMessage ? (
                        <div className="flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-5xl">check_circle</span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Importação Concluída</h3>
                            <p className="text-slate-500">{successMessage}</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            
                            {/* Passo 1: Seleção */}
                            <div className={`transition-all duration-300 ${step !== 1 ? 'opacity-50' : ''}`}>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Passo 1: Destino da Importação</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {(['Apoiadores', 'Lideranças', 'Assessores', 'Municípios'] as EntityType[]).map((entity) => (
                                        <button
                                            key={entity}
                                            disabled={step > 1}
                                            onClick={() => {
                                                setSelectedEntity(entity);
                                                setValidationErrors([]);
                                                setParsedData([]);
                                            }}
                                            className={`p-4 rounded-xl border-2 flex items-center justify-center font-bold transition-all duration-300 ${
                                                selectedEntity === entity 
                                                ? 'border-turquoise bg-turquoise/10 text-turquoise dark:bg-turquoise/20 shadow-sm' 
                                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 hover:border-turquoise/50 disabled:opacity-50 disabled:cursor-not-allowed'
                                            }`}
                                        >
                                            {entity === 'Municípios' ? 'Municípios / Cidades' : entity}
                                        </button>
                                    ))}
                                </div>
                                {step === 1 && (
                                    <button 
                                        className="mt-4 px-6 py-3 bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
                                        onClick={() => setStep(2)}
                                    >
                                        Continuar
                                    </button>
                                )}
                            </div>

                            {/* Passo 2: Instruções */}
                            {step >= 2 && (
                                <div className={`transition-all duration-300 ${step !== 2 ? 'opacity-50' : ''} animate-in fade-in slide-in-from-bottom-4`}>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Passo 2: Instruções e Gabarito</h3>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-5 mb-4">
                                        <div className="flex gap-3 text-blue-800 dark:text-blue-300">
                                            <span className="material-symbols-outlined mt-0.5">info</span>
                                            <p className="text-sm font-medium leading-relaxed">{getInstructions()}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleDownloadTemplate}
                                        className="flex items-center gap-2 px-5 py-3 border-2 border-turquoise text-turquoise font-bold rounded-xl hover:bg-turquoise hover:text-white transition-colors"
                                        disabled={step > 2}
                                    >
                                        <span className="material-symbols-outlined">download</span>
                                        Baixar Planilha Gabarito
                                    </button>
                                    {step === 2 && (
                                        <button 
                                            className="ml-4 mt-4 px-6 py-3 bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
                                            onClick={() => setStep(3)}
                                        >
                                            Estou com o arquivo pronto
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Passo 3: Upload e Validação */}
                            {step === 3 && (
                                <div className="animate-in fade-in slide-in-from-bottom-4">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Passo 3: Enviar Arquivo</h3>
                                    
                                    <div 
                                        className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input 
                                            type="file" 
                                            accept=".csv" 
                                            className="hidden" 
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                        />
                                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-3xl text-turquoise">csv</span>
                                        </div>
                                        <p className="text-slate-800 dark:text-white font-bold mb-1">Clique ou arraste o arquivo CSV</p>
                                        <p className="text-sm text-slate-500">Apenas arquivos .csv são suportados</p>
                                    </div>

                                    {/* Lista de Erros */}
                                    {validationErrors.length > 0 && (
                                        <div className="mt-6 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/30 rounded-xl overflow-hidden">
                                            <div className="bg-rose-100/50 dark:bg-rose-900/30 px-4 py-3 flex items-center gap-2 border-b border-rose-200 dark:border-rose-800/30">
                                                <span className="material-symbols-outlined text-rose-500">error</span>
                                                <h4 className="font-bold text-rose-700 dark:text-rose-400">Falha na Validação Estrita ({validationErrors.length} erros)</h4>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-rose-50/50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 sticky top-0">
                                                        <tr>
                                                            <th className="px-4 py-2 font-semibold">Linha</th>
                                                            <th className="px-4 py-2 font-semibold">Coluna</th>
                                                            <th className="px-4 py-2 font-semibold">Motivo</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-rose-100 dark:divide-rose-800/30">
                                                        {validationErrors.map((err, i) => (
                                                            <tr key={i} className="text-rose-600 dark:text-rose-300">
                                                                <td className="px-4 py-2">{err.row}</td>
                                                                <td className="px-4 py-2 font-mono text-xs">{err.column || '-'}</td>
                                                                <td className="px-4 py-2">{err.reason}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="px-4 py-3 bg-white dark:bg-slate-800 text-sm text-slate-500 dark:text-slate-400 border-t border-rose-200 dark:border-rose-800/30">
                                                Corrija os erros na planilha e faça o upload novamente.
                                            </div>
                                        </div>
                                    )}

                                    {/* Sucesso na Validação */}
                                    {parsedData.length > 0 && validationErrors.length === 0 && (
                                        <div className="mt-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined">fact_check</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-emerald-800 dark:text-emerald-400">Pronto para Importar</h4>
                                                    <p className="text-sm text-emerald-600 dark:text-emerald-300">{parsedData.length} linhas validadas sem erros.</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={handleConfirmImport}
                                                disabled={isUploading}
                                                className="w-full md:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <span className="material-symbols-outlined animate-spin">sync</span>
                                                        Importando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined">database</span>
                                                        Confirmar Importação
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportCsvModal;
