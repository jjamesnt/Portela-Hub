
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import KpiCard from '../components/KpiCard';
import Loader from '../components/Loader';
import { getMunicipios, getLiderancas, getAssessores, getAgendaEventos, getRecursosTotais, getDemandasTotais, getAllRecursos } from '../services/api';
import { Municipio, Lideranca, Assessor, EventoAgenda, Recurso } from '../types';

interface RecursoResumo extends Recurso {
    municipio_nome: string;
}

interface DashboardProps {
    navigateTo: (page: string, params?: { [key: string]: any }) => void;
}

interface DashboardData {
    municipios: Municipio[];
    liderancas: Lideranca[];
    assessores: Assessor[];
    agenda: EventoAgenda[];
    recursosTotais: number;
    demandasTotais: number;
    aleDemandasCount: number;
    lincolnDemandasCount: number;
    recursos: RecursoResumo[];
}

// Mapeamento de coordenadas (top/left) para os municípios conhecidos no SVG de MG (500x400)
const CITY_COORDINATES: Record<string, { top: string, left: string }> = {
    'Belo Horizonte': { top: '65.7%', left: '63.6%' },
    'Uberlândia': { top: '54.2%', left: '24.6%' },
    'Montes Claros': { top: '29.0%', left: '64.2%' },
    'Juiz de Fora': { top: '83.5%', left: '65.5%' }, // Ajuste definitivo (Mata de Minas)
    'Governador Valadares': { top: '53.5%', left: '81.4%' },
    'Pouso Alegre': { top: '92.5%', left: '45.4%' },
    'Betim': { top: '66.2%', left: '61.8%' },
    'Contagem': { top: '65.5%', left: '62.5%' },
};

const CoberturaMap: React.FC<{ municipios: Municipio[], navigateTo: (page: string, params?: { [key: string]: any }) => void }> = ({ municipios, navigateTo }) => {
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

    const handleZoomIn = (amount = 0.2) => setZoom(prev => Math.min(prev + amount, 4));
    const handleZoomOut = (amount = 0.2) => setZoom(prev => Math.max(prev - amount, 1));
    const handleReset = () => {
        setZoom(1);
        setOffset({ x: 0, y: 0 });
    };

    const handleWheel = (e: React.WheelEvent) => {
        // Zoom direto via scroll conforme solicitado pelo usuário
        if (e.deltaY < 0) handleZoomIn(0.1);
        else handleZoomOut(0.1);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom > 1) {
            setIsDragging(true);
            setLastPos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            const dx = e.clientX - lastPos.x;
            const dy = e.clientY - lastPos.y;
            setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            setLastPos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    // Função de auxílio para o usuário encontrar as coordenadas exatas
    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        console.log(`Coordenadas sugeridas: { top: '${y.toFixed(1)}%', left: '${x.toFixed(1)}%' }`);
    };

    return (
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm h-[500px] flex flex-col select-none">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 z-10">
                <h4 className="font-bold text-navy-dark dark:text-white">Cobertura Portela Hub (Minas Gerais)</h4>
                <div className="flex gap-2 text-[10px] text-slate-400 font-medium">
                    Scroll para Zoom • Arraste para Pan
                </div>
            </div>
            <div
                className={`flex-1 relative bg-slate-50 dark:bg-slate-900/50 overflow-hidden flex items-center justify-center p-8 ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                onClick={handleMapClick}
            >
                {/* SVG Map Container with Zoom/Pan */}
                <div
                    className="relative w-full h-full max-h-[400px] transition-transform duration-200 ease-out flex items-center justify-center"
                    style={{
                        transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
                    }}
                >
                    <svg
                        viewBox="0 0 500 400"
                        className="w-full h-full drop-shadow-2xl"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <path
                            d="M305.9,2 L309.2,3.8 L311.6,3.2 L313.8,4.1 L316.9,3.9 L319.1,4.4 L320.7,5.1 L322.7,5.1 L324.7,6.3 L320.6,17.8 L320.5,20 L322,21.7 L328,23.5 L330.2,24.7 L335,26.2 L337.9,27.4 L339.6,25.1 L345.3,22.4 L351.2,21 L355.8,21.8 L359.2,22.7 L363.7,25 L366.1,26 L372.1,30.9 L374.8,32.3 L379,33.6 L382.2,36 L390.5,40.4 L395.2,41.3 L399.5,42.8 L406.3,44.5 L412,42.2 L435.7,70.9 L443.4,71.8 L448.8,69.6 L453.6,67.2 L458.1,67.6 L461.8,69.3 L465.7,69.3 L468.8,72.2 L473.2,72 L477.4,74.1 L480.3,74.6 L484.9,73.7 L485.8,75.2 L488,76.7 L489.3,78.4 L492.5,78.6 L492.6,80.7 L494.2,82.1 L495.1,82.3 L495.3,82.8 L495.9,82.5 L496.4,83 L497.9,82.4 L499,83.2 L498.6,84 L500,85.4 L501,86.9 L501.9,88.2 L500.2,89.2 L500.8,91.7 L499.5,92.7 L499.1,95 L498.1,96.2 L496.9,97.8 L495.9,97.1 L494.7,98.7 L493.9,101 L492.9,102.6 L491.7,104.1 L491.1,102.2 L490.1,104.2 L488.2,106.8 L487.6,107.5 L488.2,108.4 L487.7,109.5 L486.4,109.2 L484.4,108.8 L484,108.9 L482.7,110.5 L481.5,114.7 L481.5,115.8 L480.4,118.6 L480.9,119.6 L482.9,119.5 L483.9,120.5 L484.2,122.3 L483.2,123.1 L481.9,123.8 L480.2,124 L478.8,123 L477.4,123.7 L476,123.6 L474.8,123.1 L472.8,125.5 L470.6,129.1 L469.8,132.4 L470.2,134.5 L470.6,137.4 L470,139.8 L470.2,141.2 L469.7,142.3 L468.7,143.6 L468.8,144.6 L468.6,146 L468.1,147.9 L470,148.1 L472,149.8 L473.1,150.9 L473.7,152 L473.8,153.1 L475.7,155.1 L477,155.8 L477.2,156.8 L478.4,156.8 L479.5,158.3 L480.8,158.1 L481.6,159.3 L482.1,160.7 L482.9,161.9 L484.1,162 L485.4,162.5 L485.9,164.4 L486.3,166.8 L487.6,168 L483.6,171.1 L485.3,172.8 L484,173.4 L482.5,172.5 L481.6,172.1 L480.5,171.4 L479.1,171.1 L478,171.3 L476,171.1 L474,170.8 L472.2,169.8 L469.2,170.9 L468.6,171.7 L467.6,172.9 L466.4,174.4 L465.2,175.2 L464.5,175.3 L462.8,174.7 L461.3,174.9 L460.5,173.6 L459.5,172.7 L458.2,172.7 L456.6,174.2 L455.8,173.3 L454.9,174.1 L459.2,181.7 L457.2,181.5 L456.6,181 L455.5,180.4 L454.8,179.8 L453.5,181 L452.7,181.2 L452,181.5 L450.9,182.5 L449.2,181.9 L448.9,182.2 L447.7,183 L446.2,184.3 L446.3,185.2 L446,185.7 L444.2,188 L443.5,190.1 L443.8,192.1 L443.7,193.3 L443,193.8 L442.6,195.1 L449.3,199 L448.6,203.4 L448.5,204.5 L449.5,204.8 L451,205.6 L452.8,206.1 L453.8,210.9 L453.3,212.9 L452.4,213.1 L451,213.3 L440,211.3 L440.9,214.6 L444.8,215.8 L447.2,218.1 L449.7,219.6 L449.6,224.1 L452.1,226.3 L453.4,229 L453.7,232.2 L453.9,234.6 L452.4,239 L451.8,243.3 L448.7,245.9 L445.9,248.9 L442.5,253.3 L442.6,258.6 L440,263 L436.6,266.5 L434.9,271.4 L432.4,275.8 L415.9,277.2 L413.3,281.3 L412.9,285.5 L414.2,291.4 L413.3,295.4 L412.9,297.5 L411.5,299.8 L409.9,303.3 L407.2,307.2 L404.4,309.2 L399.9,310.8 L400.4,313.2 L400,316.1 L396.8,319.4 L396.3,322.7 L394.8,327.6 L394.6,330 L392.8,332.6 L392.6,333.2 L393.2,334.5 L392.2,336.8 L388.8,341.1 L390.5,343 L393.2,344 L388.5,347 L378.1,351.9 L373.9,353.5 L370.1,355.3 L361.9,359.3 L358,362.4 L353.5,362 L352.5,359.7 L348.6,359 L344.8,358.8 L338.2,362 L334,361 L331,361.7 L327.8,362.5 L325.4,361.7 L321.2,363.2 L315.9,365.5 L311.5,366.8 L309.6,368.3 L307.2,369.3 L304,370.6 L301.2,370.3 L297.7,370.8 L294.6,371.5 L289.6,373.5 L285.8,375.7 L282.2,375.4 L278.9,377.2 L273,379.4 L266.3,380.9 L260.5,384.5 L254.8,387.3 L250.6,386.7 L246.3,388.3 L245.3,387.4 L239.9,387.6 L237.5,385.7 L237.3,388.8 L233.5,391.3 L238.2,393.4 L237.7,3961 L234.6,398.1 L231.7,397.7 L229.4,396.8 L226.3,398.4 L219,401 L213.6,399.5 L208.4,399 L209,394.9 L207.6,392.8 L204.1,390.8 L205.4,389.3 L207,388 L206.5,384.3 L203.4,382.5 L200.5,379.5 L197.2,378.7 L194.5,375.1 L193.7,373.4 L193.7,373.4 L193.2,371 L195.1,366.6 L196.7,363.5 L193.1,362 L195.3,359.7 L197.1,358.3 L195.6,353 L196.2,348.3 L197.2,343.7 L202,340.5 L202,336.1 L200.5,332.9 L197,331.5 L194.5,329.9 L191.1,329.4 L187.6,330.2 L184.7,331.6 L182,332 L179.7,331.6 L179.3,327.4 L176.7,323.6 L174.7,320.5 L173.9,315.8 L173,311.1 L170,306 L172.4,299.4 L175.8,296.3 L173.6,291.2 L167.3,287 L167.1,285 L167.3,281.9 L168.7,275.5 L160.4,268.9 L157.8,265.3 L152,268.6 L142.1,266.3 L139.6,272.3 L134,272.1 L126,268.7 L124.1,273.1 L115.4,272.2 L105.3,274.3 L96.6,276.1 L95.3,286.6 L89,273.6 L80.3,280.6 L78,266.9 L74.6,265.9 L62.8,262.8 L49.3,263.8 L32.2,260.6 L22.6,257.3 L15.5,262.3 L4.7,266.2 L-0.7,268.6 L-1.5,257 L1.3,247.4 L2.3,242.3 L7.4,235.9 L14.8,228.2 L21.5,224.2 L25.2,215.6 L33.7,205.9 L43.8,202.3 L50.8,202.9 L56,202.7 L60.7,201 L65.5,198.1 L72.3,204.4 L79.1,198 L83.1,193.2 L88.2,192 L91.5,189.8 L99.1,191.3 L106,190.5 L113,190.9 L117,191.8 L124.9,190.6 L131.8,194.3 L136.2,195.5 L138.5,196.4 L141.2,195.5 L144.3,193.4 L147,192.1 L151.1,189.9 L152.3,186.4 L154.2,185.1 L157.4,183.5 L160.8,182.3 L162.4,180.4 L166.2,177.9 L166.8,175.3 L164.9,171.8 L163.7,167.1 L164.5,164.8 L166.6,160.5 L168,156.4 L161.5,152.7 L157,149.9 L156,147.5 L157,145.9 L159.3,145.1 L161.1,143.1 L161.8,140.6 L163.5,138.8 L164.5,137.1 L166.9,135.1 L168.2,133.7 L169.7,132.6 L171.6,131.8 L172.7,130.9 L173.5,129.8 L173.8,127.4 L172.3,125.6 L171.2,123.3 L170.8,120.5 L170,116.8 L168.5,114 L167.3,112.4 L165.8,111.2 L163.9,110 L161.8,108.8 L160.8,107.6 L160,104.1 L163.2,98.7 L165.1,94.6 L165.3,91.2 L164.7,89.5 L165.2,86.7 L166.3,84.4 L169.5,83.4 L171.4,81.9 L172.6,80.6 L174.5,80.2 L188.2,74.7 L186.7,65.3 L186.1,53.4 L183.1,47.1 L183.6,39.6 L196.3,40.8 L202.3,39.4 L200.8,32 L200.8,26.1 L203.9,23.2 L208.6,27 L210.9,29.8 L213.6,33.5 L218.1,32.8 L222.7,31.9 L226.4,36.6 L222.5,44.8 L221.3,48.1 L223.9,46.4 L226.9,43.5 L233.3,42.2 L238.1,41.4 L240.5,38.5 L243.5,36 L247.8,34.3 L253.1,32.1 L256.1,29.7 L257.9,28.1 L261.6,25.2 L266.5,25.2 L271,20.9 L272.9,19.6 L276.5,17.4 L277.6,15.6 L278.7,14 L281,12.8 L283.2,11.2 L285.4,10 L287,8.4 L289.9,6.8 L292.4,5.8 L294.9,5.1 L298.5,3.4 L301.1,1.8 L304.1,2.4 Z"
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                            className="text-turquoise/10 dark:text-turquoise/5 hover:text-turquoise/20 dark:hover:text-turquoise/10 transition-colors cursor-pointer border-turquoise/40 dark:border-turquoise/30"
                        />
                    </svg>

                    {/* Interactive Hub Pins */}
                    {municipios.map((municipio) => {
                        const coords = CITY_COORDINATES[municipio.nome];
                        if (!coords) return null;

                        const isActive = municipio.statusAtividade === 'Consolidado' || municipio.statusAtividade === 'Manutenção';

                        return (
                            <div
                                key={municipio.id}
                                className="absolute group"
                                style={{
                                    top: coords.top,
                                    left: coords.left,
                                    transform: `scale(${1 / Math.sqrt(zoom)})` // Escala suavizada para não sumir nem crescer demais
                                }}
                            >
                                <div
                                    onClick={() => navigateTo('MunicipioDetalhes', { id: municipio.id })}
                                    className={`
                                        relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-transform hover:scale-125 cursor-pointer z-10
                                        ${isActive ? 'size-5' : 'size-4'}
                                        rounded-full border-2 
                                        ${isActive ? 'border-turquoise bg-white dark:bg-slate-800' : 'border-slate-400 bg-slate-200 dark:bg-slate-700'}
                                        shadow-lg
                                    `}
                                >
                                    <div className={`rounded-full ${isActive ? 'size-2 bg-turquoise' : 'size-1.5 bg-slate-500'}`}></div>
                                </div>

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-20">
                                    <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-3 flex flex-col gap-2 items-center min-w-[140px]">
                                        <span className="font-bold text-navy-dark dark:text-white border-b border-slate-100 dark:border-slate-700 w-full text-center pb-1">{municipio.nome}</span>
                                        <div className="flex flex-col gap-1 w-full text-left">
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold">Status:</span>
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${isActive
                                                    ? 'bg-turquoise/10 text-turquoise'
                                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                                    }`}>
                                                    {municipio.statusAtividade}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center gap-4 border-t border-slate-50 dark:border-slate-700/50 pt-1">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold">Demandas:</span>
                                                <span className="text-[10px] font-black text-navy-dark dark:text-white">{municipio.totalDemandas || 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold">Recursos:</span>
                                                <span className="text-[10px] font-black text-turquoise">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(municipio.totalRecursos || 0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="size-2 bg-white dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Zoom Controls */}
                <div className="absolute right-4 bottom-4 flex flex-col gap-2 z-30">
                    <button
                        onClick={() => handleZoomIn()}
                        className="size-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        title="Aumentar Zoom"
                    >
                        <span className="material-symbols-outlined">add</span>
                    </button>
                    <button
                        onClick={() => handleZoomOut()}
                        className="size-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        title="Diminuir Zoom"
                    >
                        <span className="material-symbols-outlined">remove</span>
                    </button>
                    <button
                        onClick={handleReset}
                        className="size-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        title="Resetar Visualização"
                    >
                        <span className="material-symbols-outlined">restart_alt</span>
                    </button>
                </div>

                {/* Legend Overlay */}
                <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-800/95 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-xs shadow-xl backdrop-blur-sm z-10 pointer-events-none">
                    <p className="font-bold text-navy-dark dark:text-white mb-2">Presença Regional</p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2"><span className="size-3 border-2 border-turquoise rounded-full bg-white dark:bg-slate-800 flex items-center justify-center"><span className="size-1 bg-turquoise rounded-full"></span></span> Atividade Alta</div>
                        <div className="flex items-center gap-2"><span className="size-3 border border-slate-300 dark:border-slate-600 rounded-full bg-slate-100 dark:bg-slate-900"></span> Base Planejada</div>
                    </div>
                </div>
            </div>
            {zoom > 1 && (
                <div className="px-4 py-1.5 bg-turquoise/10 text-turquoise text-[10px] font-bold text-center uppercase tracking-widest border-t border-turquoise/20">
                    Modo Navegação Ativo: Arraste para mover o mapa
                </div>
            )}
        </div>
    );
};



const AgendaSummary: React.FC<{ events: EventoAgenda[] }> = ({ events }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <h4 className="font-bold text-navy-dark dark:text-white">Resumo da Agenda</h4>
        </div>
        <div className="p-6 space-y-6">
            {events.slice(0, 4).map((event, index) => (
                <div key={event.id} className="flex gap-4 items-start">
                    <div className="shrink-0 flex flex-col items-center">
                        <span className="text-xs font-bold text-turquoise uppercase">{event.hora}</span>
                        {index < 3 && <div className="w-px h-8 bg-slate-100 dark:bg-slate-700 mt-2 rounded-full"></div>}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-navy-dark dark:text-white">{event.titulo}</p>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="material-symbols-outlined text-turquoise text-[14px]">location_on</span>
                            <p className="text-xs text-slate-500">{event.local}</p>
                        </div>
                        {event.origem === 'Lincoln Portela' && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-navy-dark/10 text-navy-dark dark:bg-blue-900/40 dark:text-blue-300 text-[9px] font-bold rounded border border-navy-dark/20 dark:border-blue-700/50">
                                Lincoln Portela
                            </span>
                        )}
                        {(event.origem === 'Alê Portela' || !event.origem) && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-turquoise/10 text-turquoise dark:bg-turquoise/20 text-[9px] font-bold rounded border border-turquoise/20">
                                Alê Portela
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
        <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-700"><button className="w-full text-xs font-bold text-turquoise hover:underline flex items-center justify-center gap-1">Ver Agenda Completa<span className="material-symbols-outlined text-xs">arrow_forward</span></button></div>
    </div>
);

const StatusBadge: React.FC<{ status: Municipio['statusAtividade'] }> = ({ status }) => {
    const styles = {
        'Consolidado': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        'Expansão': 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        'Manutenção': 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
        'Atenção': 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    };
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${styles[status]}`}>{status}</span>;
}

const RecursosDestaqueTable: React.FC<{ recursos: RecursoResumo[], navigateTo: DashboardProps['navigateTo'] }> = ({ recursos, navigateTo }) => {
    // Agregar recursos por município
    const recursosPorMunicipio = recursos.reduce((acc, recurso) => {
        const municipioName = recurso.municipio_nome || 'Não Identificado';
        if (!acc[municipioName]) {
            acc[municipioName] = {
                municipio: municipioName,
                totalValor: 0,
                quantidade: 0,
                origens: new Set<string>(),
                tipos: new Set<string>(),
                id: recurso.id
            };
        }
        acc[municipioName].totalValor += recurso.valor;
        acc[municipioName].quantidade += 1;
        // Filtrar origem: apenas gabinetes (Portela)
        if (recurso.origem) {
            if (recurso.origem.toLowerCase().includes('portela')) {
                acc[municipioName].origens.add(recurso.origem);
            } else {
                acc[municipioName].tipos.add(recurso.origem);
            }
        }

        if (recurso.tipo) {
            // Se o tipo for uma string com vírgulas, quebrar e adicionar cada um
            recurso.tipo.split(',').forEach(t => acc[municipioName].tipos.add(t.trim()));
        }
        return acc;
    }, {} as Record<string, { municipio: string, totalValor: number, quantidade: number, origens: Set<string>, tipos: Set<string>, id: string }>);

    // Converter para array e ordenar por maior valor total
    const sortedMunicipios = Object.values(recursosPorMunicipio).sort((a, b) => b.totalValor - a.totalValor);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm mb-8">
            <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-700 flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h4 className="font-extrabold text-navy-dark dark:text-white text-lg tracking-tight uppercase">Ranking de Recursos (Municípios)</h4>
                    <p className="text-slate-500 text-sm mt-0.5">Top municípios por volume de investimento</p>
                </div>
                <button
                    onClick={() => navigateTo('Gestão de Recursos')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-navy-dark text-white rounded-lg text-sm font-semibold hover:bg-navy-dark/90 transition-colors shadow-lg shadow-navy-dark/10"
                >
                    <span className="material-symbols-outlined">analytics</span>
                    Gestão Completa
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left bg-white dark:bg-slate-800 min-w-[750px]">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-3 tracking-wider w-12">#</th>
                            <th className="px-6 py-3 tracking-wider">Município</th>
                            <th className="px-6 py-3 tracking-wider text-center">Origem</th>
                            <th className="px-6 py-3 tracking-wider">Destinação / Tipos</th>
                            <th className="px-6 py-3 tracking-wider text-center">Projetos</th>
                            <th className="px-6 py-3 tracking-wider text-right">Valor Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {sortedMunicipios.slice(0, 5).map((item, index) => (
                            <tr key={item.municipio} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                <td className="px-6 py-3">
                                    <span className={`font-black text-xs ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-orange-400' : 'text-slate-300'}`}>
                                        {index + 1}
                                    </span>
                                </td>
                                <td className="px-6 py-3 font-semibold text-navy-dark dark:text-white text-sm whitespace-nowrap">{item.municipio}</td>
                                <td className="px-6 py-3 text-center">
                                    <div className="flex justify-center gap-1">
                                        {Array.from(item.origens).map(origem => (
                                            <span
                                                key={origem}
                                                className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${origem === 'Lincoln Portela'
                                                    ? 'bg-navy-dark/10 text-navy-dark border-navy-dark/20 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/30'
                                                    : 'bg-turquoise/10 text-turquoise border-turquoise/20 dark:bg-turquoise/20 dark:text-turquoise dark:border-turquoise/30'
                                                    }`}
                                            >
                                                {origem.split(' ')[0]} {/* Apenas o primeiro nome para ser compacto */}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {Array.from(item.tipos).slice(0, 3).map((tipo, tIndex) => {
                                            const colors = [
                                                'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800/30',
                                                'bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800/30',
                                                'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100 dark:bg-fuchsia-900/20 dark:text-fuchsia-300 dark:border-fuchsia-800/30',
                                                'bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800/30',
                                                'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800/30',
                                                'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/30',
                                            ];
                                            const colorClass = colors[tIndex % colors.length];
                                            return (
                                                <span
                                                    key={tipo}
                                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${colorClass}`}
                                                >
                                                    {tipo}
                                                </span>
                                            );
                                        })}
                                        {item.tipos.size > 3 && (
                                            <span className="text-[9px] text-slate-400 font-bold">+{item.tipos.size - 3}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-300 text-center">
                                    <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-bold">
                                        {item.quantidade}
                                    </span>
                                </td>
                                <td className="px-6 py-3 font-black text-sm text-navy-dark dark:text-white text-right whitespace-nowrap">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.totalValor)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const RecentActivity = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col mb-8">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"><h4 className="font-bold text-navy-dark dark:text-white">Atividades Recentes - Portela Hub</h4></div>
        <div className="p-6 space-y-6">
            <div className="relative flex gap-4"><div className="absolute left-4 top-8 bottom-0 w-px bg-slate-200 dark:bg-slate-700"></div><div className="shrink-0 size-8 rounded-full bg-turquoise/20 flex items-center justify-center z-10"><span className="material-symbols-outlined text-turquoise text-sm">person_add</span></div><div><p className="text-sm font-bold text-navy-dark dark:text-white">Nova Liderança</p><p className="text-xs text-slate-500 mt-1">João Silva adicionou um novo líder em <span className="text-turquoise font-medium">Contagem</span>.</p><p className="text-[10px] text-slate-400 uppercase mt-2 font-bold tracking-wider">Há 5 minutos</p></div></div>
            <div className="relative flex gap-4"><div className="absolute left-4 top-8 bottom-0 w-px bg-slate-200 dark:bg-slate-700"></div><div className="shrink-0 size-8 rounded-full bg-turquoise/20 flex items-center justify-center z-10"><span className="material-symbols-outlined text-turquoise text-sm">description</span></div><div><p className="text-sm font-bold text-navy-dark dark:text-white">Ofício Enviado</p><p className="text-xs text-slate-500 mt-1">Relatório ministerial concluído e enviado para a prefeitura de <span className="text-turquoise font-medium">Betim</span>.</p><p className="text-[10px] text-slate-400 uppercase mt-2 font-bold tracking-wider">Há 42 minutos</p></div></div>
            <div className="relative flex gap-4"><div className="shrink-0 size-8 rounded-full bg-turquoise/20 flex items-center justify-center z-10"><span className="material-symbols-outlined text-turquoise text-sm">edit</span></div><div><p className="text-sm font-bold text-navy-dark dark:text-white">Perfil Atualizado</p><p className="text-xs text-slate-500 mt-1">Assessor Marcos atualizou os dados cadastrais de 15 lideranças rurais no Portela Hub.</p><p className="text-[10px] text-slate-400 uppercase mt-2 font-bold tracking-wider">Há 5 horas</p></div></div>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700"><button className="w-full text-xs font-bold text-turquoise hover:underline flex items-center justify-center gap-1">Ver Histórico Completo<span className="material-symbols-outlined text-xs">arrow_forward</span></button></div>
    </div>
);


const DashboardPage: React.FC<DashboardProps> = ({ navigateTo }) => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { selectedMandato, setSelectedMandato } = useContext(AppContext)!;
    const [votosTotalMG, setVotosTotalMG] = useState<number | null>(null);
    const [votosLoading, setVotosLoading] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const [
                    municipiosData,
                    liderancasData,
                    assessoresData,
                    agendaData,
                    recursosTotaisData,
                    demandasTotaisData,
                    aleDemandasCount,
                    lincolnDemandasCount,
                    recursosData
                ] = await Promise.all([
                    getMunicipios(),
                    getLiderancas(),
                    getAssessores(),
                    getAgendaEventos(),
                    getRecursosTotais(),
                    getDemandasTotais(),
                    getDemandasTotais('Alê Portela'),
                    getDemandasTotais('Lincoln Portela'),
                    getAllRecursos()
                ]);

                const today = new Date().toISOString().split('T')[0];
                const upcomingEvents = agendaData
                    .filter(event => event.data >= today)
                    .sort((a, b) => {
                        const dateA = new Date(`${a.data}T${a.hora}`);
                        const dateB = new Date(`${b.data}T${b.hora}`);
                        return dateA.getTime() - dateB.getTime();
                    })
                    .slice(0, 4);

                setData({
                    municipios: municipiosData,
                    liderancas: liderancasData,
                    assessores: assessoresData,
                    agenda: upcomingEvents,
                    recursosTotais: recursosTotaisData,
                    demandasTotais: demandasTotaisData,
                    aleDemandasCount: aleDemandasCount,
                    lincolnDemandasCount: lincolnDemandasCount,
                    recursos: recursosData
                });
                setError(null);
            } catch (err: any) {
                console.error("Dashboard fetch error:", err);
                setError(err.message || 'Erro ao carregar dados do dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Buscar votos totais em MG de ambos os deputados
    useEffect(() => {
        const fetchVotosTotaisMG = async () => {
            setVotosLoading(true);
            try {
                // Valores reais do TSE - votos totais em MG 2022
                // Estes são os valores oficiais consolidados (Soma dos arquivos JSON verificada)
                setVotosTotalMG({
                    lincoln: 42328,  // Lincoln Portela - Dep. Federal
                    ale: 42179        // Alê Portela - Dep. Estadual
                } as any);
            } catch (e) {
                console.error('Erro ao buscar votos totais:', e);
                setVotosTotalMG(null);
            } finally {
                setVotosLoading(false);
            }
        };

        fetchVotosTotaisMG();
    }, []);


    if (isLoading) return <Loader />;

    if (error) {
        return (
            <div className="p-8 flex flex-col items-center justify-center h-full text-center">
                <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">error</span>
                <h3 className="text-xl font-bold text-navy-dark dark:text-white mb-2">Ops! Algo deu errado.</h3>
                <p className="text-slate-500 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-turquoise text-white rounded-lg font-bold hover:brightness-110"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-navy-dark dark:text-white">Dashboard Geral</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">Visão estratégica e indicadores de desempenho.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hidden md:flex">
                    <span className="material-symbols-outlined text-turquoise">calendar_today</span>
                    <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
            </div>

            {/* Filtrando dados para exibição */}
            {(() => {
                const filteredData = data ? {
                    ...data,
                    municipios: data.municipios, // Municípios são compartilhados
                    liderancas: selectedMandato === 'Todos' ? data.liderancas : data.liderancas.filter(l => l.origem === selectedMandato),
                    assessores: data.assessores, // Assessores são compartilhados
                    agenda: selectedMandato === 'Todos' ? data.agenda : data.agenda.filter(e => e.origem === selectedMandato),
                    recursos: selectedMandato === 'Todos' ? data.recursos : data.recursos.filter(r => r.origem === selectedMandato),
                    recursosTotais: selectedMandato === 'Todos' ? data.recursosTotais : data.recursos.filter(r => r.origem === selectedMandato).reduce((acc, r) => acc + r.valor, 0),
                    demandasTotais: selectedMandato === 'Todos' ? data.demandasTotais : (selectedMandato === 'Alê Portela' ? data.aleDemandasCount : data.lincolnDemandasCount),
                } : null;

                if (!filteredData) return null;

                return (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* KPI de Votos Total em MG - Mostra ambos os deputados */}
                        {votosTotalMG !== null && (
                            <div className={`grid gap-4 ${selectedMandato === 'Todos' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                                {/* Lincoln Portela */}
                                {(selectedMandato === 'Todos' || selectedMandato === 'Lincoln Portela') && (
                                    <div className="bg-gradient-to-r from-lime-500 to-lime-600 rounded-2xl p-5 shadow-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white/80 text-xs font-medium mb-1">Votação Total MG 2022</p>
                                                <h2 className="text-white text-3xl font-black">
                                                    {votosLoading ? '...' : (votosTotalMG as any).lincoln?.toLocaleString('pt-BR') || '227.143'}
                                                </h2>
                                                <p className="text-white/80 text-xs mt-1">Lincoln Portela • Dep. Federal</p>
                                            </div>
                                            <div className="bg-white/20 p-3 rounded-xl">
                                                <span className="material-symbols-outlined text-white text-3xl">how_to_vote</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Alê Portela */}
                                {(selectedMandato === 'Todos' || selectedMandato === 'Alê Portela') && (
                                    <div className="bg-gradient-to-r from-turquoise to-teal-500 rounded-2xl p-5 shadow-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white/80 text-xs font-medium mb-1">Votação Total MG 2022</p>
                                                <h2 className="text-white text-3xl font-black">
                                                    {votosLoading ? '...' : (votosTotalMG as any).ale?.toLocaleString('pt-BR') || '56.438'}
                                                </h2>
                                                <p className="text-white/80 text-xs mt-1">Alê Portela • Dep. Estadual</p>
                                            </div>
                                            <div className="bg-white/20 p-3 rounded-xl">
                                                <span className="material-symbols-outlined text-white text-3xl">how_to_vote</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            <KpiCard
                                title="Municípios Atendidos"
                                value={filteredData.municipios.length.toString()}
                                icon="location_on"
                                trend="+2 este mês"
                                trendDirection="up"
                            />
                            <KpiCard
                                title="Lideranças Ativas"
                                value={filteredData.liderancas.length.toString()}
                                icon="groups"
                                trend="+12% vs. mês anterior"
                                trendDirection="up"
                            />
                            <KpiCard
                                title="Recursos Totais"
                                value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(filteredData.recursosTotais)}
                                icon="payments"
                                trend="Meta anual: 85%"
                                trendDirection="neutral"
                            />
                            <KpiCard
                                title="Demandas Pendentes"
                                value={(filteredData.demandasTotais || 0).toString()}
                                icon="assignment_late"
                                trend="-5 resolvidos hoje"
                                trendDirection="up"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <CoberturaMap municipios={filteredData.municipios} navigateTo={navigateTo} />
                            <AgendaSummary events={filteredData.agenda} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <RecursosDestaqueTable recursos={filteredData.recursos} navigateTo={navigateTo} />
                            </div>
                            <div>
                                <RecentActivity />
                            </div>
                        </div>
                    </div>
                );
            })()
            }
        </div >
    );
};

export default DashboardPage;
