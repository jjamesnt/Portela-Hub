
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Eleitorado } from '../types';
import { AppContext } from '../context/AppContext';

interface EleitoradoCardProps {
    eleitoradoData: Eleitorado; // Mantendo para compatibilidade ou uso de fallback
    codigoIBGE: string;
}

const EleitoradoCard: React.FC<EleitoradoCardProps> = ({ eleitoradoData, codigoIBGE }) => {
    const { selectedMandato } = useContext(AppContext) || { selectedMandato: 'Todos' };

    // Filtros de Eleição
    const [selectedYear, setSelectedYear] = useState<string>('2022');
    const [selectedCargo, setSelectedCargo] = useState<string>('7'); // Default: Deputado Estadual
    const [selectedCandidate, setSelectedCandidate] = useState<string>('Todos'); // 'Todos' = Votos Válidos

    // Dados Dinâmicos
    const [currentTseCode, setCurrentTseCode] = useState<string>('');
    const [eleitoradoCount, setEleitoradoCount] = useState<number>(0);
    const [eleitoradoGenero, setEleitoradoGenero] = useState<{ masc: number, fem: number }>({ masc: 0, fem: 0 });
    const [votoData, setVotoData] = useState<{ label: string, votos: string, percent: string }>({ label: '', votos: '', percent: '' });
    const [candidateList, setCandidateList] = useState<Array<{ id: string, label: string, numero: string, votos: number }>>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Mapeamento de Cargos API CEPESP: 1=Pres, 3=Gov, 5=Sen, 6=DepFed, 7=DepEst, 11=Pref, 13=Ver
    const getCargosPorAno = (ano: string) => {
        if (['2022', '2018'].includes(ano)) {
            return [
                { id: '1', label: 'Presidente' },
                { id: '3', label: 'Governador' },
                { id: '5', label: 'Senador' },
                { id: '6', label: 'Deputado Federal' },
                { id: '7', label: 'Deputado Estadual' }
            ];
        } else {
            return [
                { id: '11', label: 'Prefeito' },
                { id: '13', label: 'Vereador' }
            ];
        }
    };

    // Converter IBGE para TSE
    useEffect(() => {
        if (!codigoIBGE) return;

        const getTseCodeFromIbge = async (ibge: string) => {
            // Fallbacks rápidos para evitar delay/erro de rede em apresentações
            const COMMON_CODES: Record<string, string> = {
                '3106200': '41238', // BH
                '3118601': '43710', // Contagem
                '3170206': '54038', // Uberlândia
                '3136702': '47333', // Juiz de Fora
            };
            if (COMMON_CODES[ibge]) {
                setCurrentTseCode(COMMON_CODES[ibge]);
                return;
            }

            try {
                // Tenta usar cache local se possível, ou fetch
                const response = await fetch('https://raw.githubusercontent.com/betafcc/Municipios-Brasileiros-TSE/master/municipios_brasileiros_tse.json');
                if (response.ok) {
                    const data = await response.json();
                    const entry = data.find((m: any) => String(m.codigo_ibge) === ibge);
                    if (entry) {
                        setCurrentTseCode(String(entry.codigo_tse));
                    } else {
                        setCurrentTseCode('N/A');
                    }
                }
            } catch (error) {
                console.error("Erro na conversão IBGE -> TSE:", error);
                setCurrentTseCode('Erro');
            }
        };
        getTseCodeFromIbge(codigoIBGE);
    }, [codigoIBGE]);

    // 1. Busca Lista de Candidatos (Sempre que mudar contexto TSE/Ano/Cargo)
    useEffect(() => {
        if (!currentTseCode || currentTseCode === 'Sincronizando...' || currentTseCode === 'Erro' || currentTseCode === 'N/A') return;

        const fetchCandidates = async () => {
            setLoading(true);
            setVotoData({ label: 'Buscando candidatos...', votos: '...', percent: '' });

            // Para 2022: usar dados locais do CSV processado (formato otimizado)
            if (selectedYear === '2022') {
                try {
                    const url = `/data/votos/${currentTseCode}.json`;
                    const res = await fetch(url);

                    if (res.ok) {
                        const data = await res.json();

                        // Novo formato compacto: f=DepFed, e=DepEst
                        // Campos: n=nome, p=partido, v=votos, nr=numero
                        const candidatosRaw = selectedCargo === '6' ? data.f : data.e;

                        // Mapear para formato interno
                        const mappedOpts = candidatosRaw.map((c: any, idx: number) => ({
                            id: `local_${idx}_${c.nr}`,
                            label: `${c.n} (${c.nr})`,
                            numero: String(c.nr),
                            votos: c.v || 0,
                            partido: c.p || 'N/A',
                            foto: '' // Sem foto para dados locais
                        }));

                        // Já vem ordenado por votos do script
                        setCandidateList(mappedOpts);
                        const totalVotos = mappedOpts.reduce((acc: number, c: any) => acc + c.votos, 0);
                        setVotoData({ label: `Top ${mappedOpts.length} candidatos • ${totalVotos.toLocaleString('pt-BR')} votos`, votos: '-', percent: '' });

                    } else {
                        throw new Error('Arquivo não encontrado');
                    }
                } catch (e) {
                    console.error("Erro ao buscar dados locais:", e);
                    setCandidateList([]);
                    setVotoData({ label: 'Dados não disponíveis', votos: '-', percent: '' });
                } finally {
                    setLoading(false);
                }
                return;
            }

            // Para 2024 e outros anos: usar DivulgaCand API
            const codigoEleicao = ['2024', '2020'].includes(selectedYear)
                ? '20452'
                : '2040602022';

            try {
                const url = `/api/proxy_divulgacand?ano=${selectedYear}&codigoTse=${currentTseCode}&codigoEleicao=${codigoEleicao}&cargo=${selectedCargo}`;
                const res = await fetch(url);

                if (res.ok) {
                    const data = await res.json();

                    if (data.candidatos && data.candidatos.length > 0) {
                        const mappedOpts = data.candidatos.map((c: any) => ({
                            id: String(c.id),
                            label: `${c.nomeUrna} (${c.numero})`,
                            numero: String(c.numero),
                            votos: 0, // DivulgaCand não retorna votos
                            partido: c.partido?.sigla || 'N/A',
                            foto: `https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/buscar/foto/${selectedYear}/${currentTseCode}/${c.id}`
                        }));

                        const sorted = mappedOpts.sort((a: any, b: any) => a.label.localeCompare(b.label));
                        setCandidateList(sorted);
                        setVotoData({ label: `${sorted.length} candidatos encontrados`, votos: '-', percent: '' });
                    } else {
                        setCandidateList([]);
                        setVotoData({ label: 'Nenhum candidato neste cargo/ano', votos: '-', percent: '' });
                    }
                } else {
                    throw new Error('API Error');
                }
            } catch (e) {
                console.error("Erro ao buscar lista de candidatos:", e);
                setCandidateList([]);
                setVotoData({ label: 'Erro ao buscar candidatos', votos: '-', percent: '' });
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
        setSelectedCandidate('Todos');
        setSearchTerm('');
    }, [currentTseCode, selectedYear, selectedCargo]);


    // 2. Atualiza Dados de Votação (Sempre que mudar seleção ou lista)
    useEffect(() => {
        if (selectedCandidate === 'Todos') {
            // Se filtro estiver ativo, mostrar soma do filtro? Não, 'Todos' deve ser TOTAL do município.
            // O usuário filtra para ENCONTRAR um candidato, não para somar o filtro.
            const total = candidateList.reduce((acc, curr) => acc + curr.votos, 0);
            setVotoData({
                label: 'Votos Válidos (Nominais)',
                votos: total > 0 ? new Intl.NumberFormat('pt-BR').format(total) : '...',
                percent: ''
            });
        } else {
            const cand = candidateList.find(c => c.id === selectedCandidate);
            if (cand) {
                setVotoData({
                    label: `Votos em ${cand.label.split('(')[0]}`,
                    votos: new Intl.NumberFormat('pt-BR').format(cand.votos),
                    percent: ''
                });
            } else {
                setVotoData({ label: 'Candidato não encontrado', votos: '-', percent: '' });
            }
        }
    }, [selectedCandidate, candidateList]);

    // 3. Atualiza Cargo Default ao mudar Ano
    useEffect(() => {
        const cargos = getCargosPorAno(selectedYear);
        if (!cargos.find(c => c.id === selectedCargo)) {
            setSelectedCargo(cargos[0].id);
        }
    }, [selectedYear]);

    // 4. Lógica para definir defaults baseado no Mandato ao carregar
    useEffect(() => {
        const timer = setTimeout(() => {
            if (selectedMandato === 'Lincoln Portela') {
                setSelectedYear('2022');
                setSelectedCargo('6'); // Federal
            } else if (selectedMandato === 'Alê Portela') {
                setSelectedYear('2022');
                setSelectedCargo('7'); // Estadual
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [selectedMandato]);

    // 5. Tenta selecionar o candidato do mandato automaticamente
    useEffect(() => {
        if (candidateList.length > 0) {
            if (selectedMandato === 'Lincoln Portela' && selectedCargo === '6') {
                const lincoln = candidateList.find(c => c.numero === '2233');
                if (lincoln) setSelectedCandidate(lincoln.id);
            }
            if (selectedMandato === 'Alê Portela' && selectedCargo === '7') {
                const ale = candidateList.find(c => c.numero === '22333');
                if (ale) setSelectedCandidate(ale.id);
            }
        }
    }, [candidateList, selectedMandato, selectedCargo]);

    // 6. Dados Gerais do Eleitorado (Fonte: TSE Dados Abertos - Mock/Simulação)
    useEffect(() => {
        const fetchEleitoradoTSE = async () => {
            // Simulação de delay de rede
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 800));

            // Dados Mockados para validação de layout (Fonte: TSE 2024)
            const MOCK_DB: Record<string, { total: number, masc: number, fem: number }> = {
                '41238': { total: 1992456, masc: 905432, fem: 1087024 }, // Belo Horizonte (Aprox)
                '43710': { total: 450321, masc: 210150, fem: 240171 },   // Contagem
                '41513': { total: 298450, masc: 140200, fem: 158250 },   // Betim
                '54038': { total: 530123, masc: 250100, fem: 280023 },   // Uberlândia
                '47333': { total: 410234, masc: 190123, fem: 220111 },   // Juiz de Fora
            };

            if (currentTseCode && MOCK_DB[currentTseCode]) {
                const data = MOCK_DB[currentTseCode];
                setEleitoradoCount(data.total);
                setEleitoradoGenero({ masc: data.masc, fem: data.fem });
            } else {
                // Fallback genérico proporcional se não tiver dado exato (Estimativa baseada em população se disponível, ou dados antigos)
                // Usando eleitoradoData (props) como base se existir, ou placeholder
                if (eleitoradoData && eleitoradoData.total) {
                    setEleitoradoCount(eleitoradoData.total);
                    setEleitoradoGenero({ masc: eleitoradoData.genero?.masculino || 0, fem: eleitoradoData.genero?.feminino || 0 });
                } else {
                    setEleitoradoCount(10000); // Placeholder
                    setEleitoradoGenero({ masc: 4800, fem: 5200 });
                }
            }
            setLoading(false);
        };

        if (currentTseCode && currentTseCode !== 'Sincronizando...' && currentTseCode !== 'N/A') {
            fetchEleitoradoTSE();
        }
    }, [currentTseCode, eleitoradoData]);


    const percMasc = eleitoradoCount ? ((eleitoradoGenero.masc / eleitoradoCount) * 100).toFixed(1) : '0';
    const percFem = eleitoradoCount ? ((eleitoradoGenero.fem / eleitoradoCount) * 100).toFixed(1) : '0';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6 relative overflow-hidden transition-all duration-300 hover:shadow-md">

            {/* Badge do Mandato Selecionado */}
            {selectedMandato !== 'Todos' && (
                <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded-bl-xl shadow-sm z-10 ${selectedMandato === 'Lincoln Portela' ? 'bg-lime-600' : 'bg-turquoise'}`}>
                    Dados: {selectedMandato}
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-navy-custom dark:text-white text-lg font-bold">Dados do Eleitorado</h3>
                <span className="material-symbols-outlined text-turquoise">how_to_vote</span>
            </div>

            {/* KPIs Principais Distribuidos */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Eleitorado</span>
                    <span className="text-xl font-black text-navy-custom dark:text-white">
                        {eleitoradoCount ? new Intl.NumberFormat('pt-BR').format(eleitoradoCount) : '...'}
                    </span>
                    <span className="text-[8px] text-slate-400 opacity-70">Município Total</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Votos Válidos</span>
                    <span className="text-xl font-black text-turquoise">
                        {loading ? '...' : new Intl.NumberFormat('pt-BR').format(candidateList.reduce((acc, curr) => acc + curr.votos, 0))}
                    </span>
                    {eleitoradoCount > 0 && (
                        <span className="text-[8px] text-slate-400 font-bold">
                            {((candidateList.reduce((acc, curr) => acc + curr.votos, 0) / eleitoradoCount) * 100).toFixed(1)}% Comp.
                        </span>
                    )}
                </div>
            </div>

            {/* Filtros Interativos */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 p-2 outline-none transition-all focus:ring-2 focus:ring-turquoise/20"
                >
                    <option value="2024">2024</option>
                    <option value="2022">2022</option>
                    <option value="2020">2020</option>
                    <option value="2018">2018</option>
                </select>
                <select
                    value={selectedCargo}
                    onChange={(e) => setSelectedCargo(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 p-2 outline-none transition-all focus:ring-2 focus:ring-turquoise/20"
                >
                    {getCargosPorAno(selectedYear).map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                </select>
            </div>

            {/* Search & Select Candidate */}
            <div className="flex flex-col gap-1 mb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder={`Buscar ${getCargosPorAno(selectedYear).find(c => c.id === selectedCargo)?.label || 'Candidato'}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const matches = candidateList.filter(c =>
                                    c.label.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()
                                        .includes(searchTerm.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase())
                                );
                                if (matches.length > 0) {
                                    setSelectedCandidate(matches[0].id);
                                    setSearchTerm('');
                                }
                            }
                        }}
                        className="w-full text-[10px] p-2 pr-8 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-turquoise transition-all"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 z-10"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    )}
                    {searchTerm && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                            {loading ? (
                                <div className="p-3 text-[10px] text-slate-400 text-center flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                                    Buscando...
                                </div>
                            ) : candidateList.filter(c =>
                                c.label.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()
                                    .includes(searchTerm.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase())
                            ).length > 0 ? (
                                candidateList
                                    .filter(c =>
                                        c.label.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()
                                            .includes(searchTerm.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase())
                                        && c.id !== '1000' && c.id !== '2000' // Hide placeholder 'Outros' from search results
                                    )
                                    .map((c: any) => (
                                        <div
                                            key={c.id}
                                            onClick={() => {
                                                setSelectedCandidate(c.id);
                                                setSearchTerm('');
                                            }}
                                            className="px-3 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700/50 last:border-0 flex items-center gap-3 group"
                                        >
                                            {/* Foto do Candidato */}
                                            <img
                                                src={c.foto}
                                                alt={c.label}
                                                className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x40/94a3b8/ffffff?text=?'; }}
                                            />
                                            <div className="flex flex-col flex-1">
                                                <span className="font-bold group-hover:text-turquoise transition-colors">{c.label.split('(')[0]}</span>
                                                <span className="text-[10px] text-slate-400">Nº {c.numero} • {c.partido || 'N/A'}</span>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="p-3 text-[10px] text-red-400 text-center">
                                    Nenhum candidato encontrado.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Select/Overview (Always visible) */}
                <div className="mb-4">
                    <select
                        value={selectedCandidate}
                        onChange={(e) => setSelectedCandidate(e.target.value)}
                        className="bg-white dark:bg-slate-800 border-2 border-turquoise/30 rounded-lg text-xs font-bold text-navy-custom dark:text-white p-2 w-full focus:border-turquoise focus:ring-1 focus:ring-turquoise outline-none transition-all"
                    >
                        <option value="Todos">Votos Válidos (Total)</option>
                        {/* Only show selected candidate if not 'Todos' to allow switching back easily */}
                        {selectedCandidate !== 'Todos' && candidateList.find(c => c.id === selectedCandidate && c.id !== '1000' && c.id !== '2000') && (
                            <option value={selectedCandidate}>{candidateList.find(c => c.id === selectedCandidate)?.label}</option>
                        )}
                    </select>
                </div>
            </div>

            {/* Resultado Votação */}
            <div className="bg-turquoise/5 dark:bg-turquoise/10 rounded-xl p-4 border border-turquoise/20 flex flex-col items-center justify-center mb-6 min-h-[100px]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-turquoise mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Votos Obtidos
                </span>
                {selectedCandidate === 'Todos' ? (
                    <>
                        <span className="text-lg font-bold text-slate-400 dark:text-slate-500 transition-all uppercase tracking-tighter">
                            Selecione candidato
                        </span>
                        <span className="text-[9px] text-slate-400 mt-1 opacity-80 text-center">
                            Escolha um nome acima para ver os votos neste município
                        </span>
                    </>
                ) : (
                    <>
                        <span className="text-3xl font-black text-navy-custom dark:text-white transition-all">
                            {candidateList.length === 0 && !loading ? 'Sem dados' : (votoData.votos || '...')}
                        </span>
                        {votoData.label && <span className="text-[9px] text-slate-400 mt-1 opacity-80 text-center max-w-[200px] leading-tight">{votoData.label}</span>}
                        {selectedCandidate !== 'Todos' && (
                            <span className="text-[9px] text-turquoise mt-1 font-bold">
                                {votoData.votos !== '0' && votoData.votos !== '-' && eleitoradoCount ? `${((parseInt(votoData.votos.replace(/\./g, '')) / eleitoradoCount) * 100).toFixed(2)}% do total` : ''}
                            </span>
                        )}
                    </>
                )}
            </div>


            {/* Gênero Bar Chart */}
            {
                (eleitoradoCount > 0) && (
                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gênero</span>
                        </div>

                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex shadow-inner">
                            <div className="bg-turquoise h-full" style={{ width: `${percFem}%` }}></div>
                            <div className="bg-navy-custom h-full" style={{ width: `${percMasc}%` }}></div>
                        </div>

                        <div className="flex justify-between mt-1.5 text-[9px] font-bold">
                            <span className="text-turquoise flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-turquoise"></span>
                                Feminino: {percFem}%
                            </span>
                            <span className="text-navy-custom dark:text-slate-300 flex items-center gap-1">
                                Masculino: {percMasc}%
                                <span className="w-1.5 h-1.5 rounded-full bg-navy-custom"></span>
                            </span>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default EleitoradoCard;
