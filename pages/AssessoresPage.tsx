
import React, { useState, useEffect } from 'react';
import { getAssessores } from '../services/api';
import { Assessor } from '../types';
import Loader from '../components/Loader';

interface AssessoresPageProps {
    navigateTo: (page: string, params?: { [key: string]: any }) => void;
}

const AssessoresPage: React.FC<AssessoresPageProps> = ({ navigateTo }) => {
    const [assessores, setAssessores] = useState<Assessor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAssessores = async () => {
            try {
                setIsLoading(true);
                const data = await getAssessores();
                setAssessores(data);
                setError(null);
            } catch (err) {
                setError("Falha ao carregar os dados dos assessores.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAssessores();
    }, []);

    return (
        <div className="p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-navy-dark dark:text-white">Equipe de Assessores</h2>
                    <p className="text-slate-500 dark:text-slate-400">Conheça o time que impulsiona a gestão.</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-turquoise text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-turquoise/20">
                    <span className="material-symbols-outlined text-lg">add</span>
                    Adicionar Assessor
                </button>
            </div>
            
            {isLoading ? <Loader /> : error ? <div className="p-8 text-center text-red-500">{error}</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {assessores.map(assessor => (
                        <div key={assessor.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center p-6 flex flex-col items-center">
                            <img src={assessor.avatarUrl} alt={assessor.nome} className="size-24 rounded-full border-4 border-white dark:border-slate-700 shadow-md -mt-16" />
                            <h3 className="mt-4 text-lg font-bold text-navy-dark dark:text-white">{assessor.nome}</h3>
                            <p className="text-xs font-bold text-turquoise uppercase tracking-wider">{assessor.cargo}</p>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">{assessor.regiaoAtuacao}</p>

                            <div className="w-full my-6 h-px bg-slate-100 dark:bg-slate-700"></div>

                            <div className="flex justify-around w-full text-center">
                                <div>
                                    <p className="text-xl font-black text-navy-dark dark:text-white">{assessor.municipiosCobertos}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Municípios</p>
                                </div>
                                <div>
                                    <p className="text-xl font-black text-navy-dark dark:text-white">{assessor.liderancasGerenciadas}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Lideranças</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AssessoresPage;
