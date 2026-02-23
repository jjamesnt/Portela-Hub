
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import KpiCard from '../components/KpiCard';
import Loader from '../components/Loader';
import { getMunicipios, getLiderancas, getAssessores, getAgendaEventos, getRecursosTotais, getDemandasTotais, getAllRecursos, getGoogleEvents } from '../services/api';
import { Municipio, Lideranca, Assessor, EventoAgenda, Recurso } from '../types';
import VotacaoEstadualKPIs from '../components/VotacaoEstadualKPIs';
import { mockLiderancas as mockLider } from '../data/mockLiderancas';
import { mockAssessores as mockAsse } from '../data/mockAssessores';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, LayersControl, LayerGroup, useMap, GeoJSON, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MG_GEOJSON, MG_MASK_COORDINATES } from '../constants/mgGeojson';

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

const CoberturaMap: React.FC<{
    municipios: Municipio[],
    liderancas: Lideranca[],
    assessores: Assessor[],
    recursos: Recurso[],
    selectedMandato: string
}> = ({ municipios, liderancas, assessores, recursos, selectedMandato }) => {
    // MG Coordinates center
    const center: [number, number] = [-18.5122, -44.5550];

    const stats = {
        totalRecursos: recursos.reduce((acc, r) => acc + r.valor, 0),
        municipiosAtendidos: new Set(recursos.map(r => r.municipioId)).size,
        projetosAtivos: recursos.filter(r => r.status !== 'Concluído').length
    };

    console.log('Map Data counts:', {
        municipios: municipios.length,
        liderancas: liderancas.length,
        assessores: assessores.length,
        withCoords: {
            liderancas: liderancas.filter(l => l.latitude != null && l.longitude != null).length,
            assessores: assessores.filter(a => a.latitude != null && a.longitude != null).length
        }
    });

    const ResizeMap = () => {
        const map = useMap();
        useEffect(() => {
            setTimeout(() => {
                map.invalidateSize();
            }, 500);
        }, [map]);
        return null;
    };

    return (
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm h-[600px] flex flex-col relative group/map">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 z-[1000]">
                <div>
                    <h4 className="font-bold text-navy-dark dark:text-white">Inteligência Territorial Portela Hub</h4>
                    <p className="text-xs text-slate-500">Mapa dinâmico de influência e alocação</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-1 flex gap-1">
                    <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> Lideranças
                    </span>
                    <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span> Assessores
                    </span>
                </div>
            </div>

            <div className="flex-1 z-0 relative">
                <MapContainer
                    center={center}
                    zoom={6}
                    style={{ height: '100%', width: '100%', backgroundColor: '#f8fafc' }}
                    scrollWheelZoom={true}
                    className="map-pt-br-minimalist"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Map Mask: Dims everything outside Minas Gerais */}
                    <Polygon
                        positions={MG_MASK_COORDINATES}
                        pathOptions={{
                            fillColor: '#f1f5f9',
                            fillOpacity: 0.8,
                            weight: 0,
                            stroke: false
                        }}
                    />

                    <GeoJSON
                        data={MG_GEOJSON as any}
                        style={{
                            color: "#0d9488",
                            weight: 3,
                            fillColor: "transparent",
                            dashArray: '10, 10'
                        }}
                    />
                    <ResizeMap />

                    <LayersControl position="topright">
                        <LayersControl.Overlay checked name="Lideranças">
                            <LayerGroup>
                                {liderancas.filter(l => l.latitude != null && l.longitude != null).map(lider => (
                                    <Marker
                                        key={`lider-${lider.id}`}
                                        position={[lider.latitude!, lider.longitude!]}
                                        zIndexOffset={100}
                                        icon={L.divIcon({
                                            className: 'lider-icon-marker',
                                            html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(59, 130, 246, 0.8), 0 0 5px rgba(0,0,0,0.3); z-index: 1000;"></div>`,
                                            iconSize: [12, 12],
                                            iconAnchor: [6, 6]
                                        })}
                                    >
                                        <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                                            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded shadow-lg border border-slate-200 dark:border-slate-700">
                                                <p className="font-bold text-[10px] text-navy-dark dark:text-white m-0">{lider.nome}</p>
                                                <p className="text-[9px] text-slate-500 m-0">{lider.cargo} • {lider.municipio}</p>
                                            </div>
                                        </Tooltip>
                                        <Popup>
                                            <div className="p-2">
                                                <h5 className="font-bold border-b pb-1 mb-1">{lider.nome}</h5>
                                                <p className="text-xs m-0"><strong>Cargo:</strong> {lider.cargo}</p>
                                                <p className="text-xs m-0"><strong>Cidade:</strong> {lider.municipio}</p>
                                                <p className="text-xs m-0"><strong>Mandato:</strong> {lider.origem}</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </LayerGroup>
                        </LayersControl.Overlay>

                        <LayersControl.Overlay checked name="Assessores">
                            <LayerGroup>
                                {assessores.filter(a => a.latitude != null && a.longitude != null).map(assessor => (
                                    <Marker
                                        key={`assessor-${assessor.id}`}
                                        position={[assessor.latitude!, assessor.longitude!]}
                                        zIndexOffset={200}
                                        icon={L.divIcon({
                                            className: 'assessor-icon-marker',
                                            html: `<div style="background-color: #f97316; width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(249, 115, 22, 0.8), 0 0 5px rgba(0,0,0,0.3); z-index: 1000;"></div>`,
                                            iconSize: [12, 12],
                                            iconAnchor: [6, 6]
                                        })}
                                    >
                                        <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                                            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded shadow-lg border border-orange-200 dark:border-orange-900/30">
                                                <p className="font-bold text-[10px] text-orange-600 dark:text-orange-400 m-0">{assessor.nome}</p>
                                                <p className="text-[9px] text-slate-500 m-0">Assessor • {assessor.regiaoAtuacao}</p>
                                            </div>
                                        </Tooltip>
                                        <Popup>
                                            <div className="p-2">
                                                <h5 className="font-bold text-orange-600 border-b pb-1 mb-1">{assessor.nome}</h5>
                                                <p className="text-xs m-0"><strong>Região:</strong> {assessor.regiaoAtuacao}</p>
                                                <p className="text-xs m-0"><strong>Municípios:</strong> {assessor.municipiosCobertos}</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </LayerGroup>
                        </LayersControl.Overlay>

                        <LayersControl.Overlay checked name="Recursos (Municípios)">
                            <LayerGroup>
                                {municipios.filter(m => m.latitude && m.longitude).map(mun => (
                                    <Marker
                                        key={mun.id}
                                        position={[mun.latitude!, mun.longitude!]}
                                        icon={L.divIcon({
                                            className: 'municipio-icon',
                                            html: `<div style="background-color: rgba(20, 184, 166, 0.3); width: ${Math.min(24, (mun.totalRecursos || 0) / 10000 + 10)}px; height: ${Math.min(24, (mun.totalRecursos || 0) / 10000 + 10)}px; border-radius: 50%; border: 1.5px solid #14b8a6; box-shadow: inset 0 0 5px rgba(20, 184, 166, 0.2);"></div>`,
                                            iconSize: [24, 24],
                                            iconAnchor: [12, 12]
                                        })}
                                    >
                                        <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                                            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded shadow-lg border border-teal-200 dark:border-teal-900/30">
                                                <p className="font-bold text-[10px] text-teal-600 dark:text-teal-400 m-0">{mun.nome}</p>
                                                <p className="text-[9px] text-slate-500 m-0">R$ {(mun.totalRecursos || 0).toLocaleString('pt-BR', { notation: 'compact' })} em recursos</p>
                                            </div>
                                        </Tooltip>
                                        <Popup>
                                            <div className="p-2">
                                                <h5 className="font-bold text-teal-600 border-b pb-1 mb-1">{mun.nome}</h5>
                                                <p className="text-xs m-0"><strong>Recursos:</strong> R$ {(mun.totalRecursos || 0).toLocaleString('pt-BR')}</p>
                                                <p className="text-xs m-0"><strong>Demandas:</strong> {mun.totalDemandas || 0}</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </LayerGroup>
                        </LayersControl.Overlay>
                    </LayersControl>
                </MapContainer>

                {/* Recursos Cobertura Cards - Floating Overlay */}
                <div className="absolute bottom-6 left-6 z-[1000] flex flex-col gap-2 pointer-events-none">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-3 rounded-xl border border-white/20 dark:border-slate-700/50 shadow-2xl pointer-events-auto transition-transform hover:scale-105">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total em Recursos</p>
                        <p className="text-xl font-black text-turquoise tabular-nums">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(stats.totalRecursos)}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-3 rounded-xl border border-white/20 dark:border-slate-700/50 shadow-xl pointer-events-auto flex-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Cidades</p>
                            <p className="text-lg font-black text-navy-dark dark:text-white">{stats.municipiosAtendidos}</p>
                        </div>
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-3 rounded-xl border border-white/20 dark:border-slate-700/50 shadow-xl pointer-events-auto flex-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Projetos</p>
                            <p className="text-lg font-black text-navy-dark dark:text-white">{stats.projetosAtivos}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};



const AgendaSummary: React.FC<{ events: EventoAgenda[] }> = ({ events }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <h4 className="font-bold text-navy-dark dark:text-white text-sm md:text-base">Resumo da Agenda</h4>
        </div>
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {events.slice(0, 4).map((event, index) => (
                <div key={event.id} className="flex gap-3 md:gap-4 items-start">
                    <div className="shrink-0 flex flex-col items-center">
                        <span className="text-[10px] md:text-xs font-bold text-turquoise uppercase">{event.hora}</span>
                        {index < 3 && <div className="w-px h-6 md:h-8 bg-slate-100 dark:bg-slate-700 mt-2 rounded-full"></div>}
                    </div>
                    <div>
                        <p className="text-xs md:text-sm font-bold text-navy-dark dark:text-white">{event.titulo}</p>
                        <div className="flex items-center gap-1 mt-0.5 md:mt-1">
                            <span className="material-symbols-outlined text-turquoise text-[12px] md:text-[14px]">location_on</span>
                            <p className="text-[10px] md:text-xs text-slate-500 truncate max-w-[150px] md:max-w-none">{event.local}</p>
                        </div>
                        {event.origem === 'Lincoln Portela' && (
                            <span className="inline-block mt-1 px-1 py-0.5 bg-navy-dark/10 text-navy-dark dark:bg-blue-900/40 dark:text-blue-300 text-[8px] md:text-[9px] font-bold rounded border border-navy-dark/20 dark:border-blue-700/50">
                                Lincoln
                            </span>
                        )}
                        {(event.origem === 'Alê Portela' || !event.origem) && (
                            <span className="inline-block mt-1 px-1 py-0.5 bg-turquoise/10 text-turquoise dark:bg-turquoise/20 text-[8px] md:text-[9px] font-bold rounded border border-turquoise/20">
                                Alê
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
        <div className="p-3 md:p-4 mt-auto border-t border-slate-200 dark:border-slate-700">
            <button className="w-full text-[10px] md:text-xs font-bold text-turquoise hover:underline flex items-center justify-center gap-1">
                Ver Agenda Completa
                <span className="material-symbols-outlined text-sm md:text-xs">arrow_forward</span>
            </button>
        </div>
    </div>
);

const StatusBadge: React.FC<{ status: Municipio['statusAtividade'] }> = ({ status }) => {
    const styles = {
        'Consolidado': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        'Expansão': 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        'Manutenção': 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
        'Atenção': 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    };
    return <span className={`inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold tracking-wider ${styles[status]}`}>{status}</span>;
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
                id: recurso.municipioId
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
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm mb-6 md:mb-8">
            <div className="px-4 md:px-8 py-4 md:py-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4">
                <div>
                    <h4 className="font-extrabold text-navy-dark dark:text-white text-sm md:text-lg tracking-tight uppercase">Ranking de Recursos</h4>
                    <p className="text-slate-500 text-[10px] md:text-sm mt-0.5">Top municípios por volume de investimento</p>
                </div>
                <button
                    onClick={() => navigateTo('Recursos')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-navy-dark text-white rounded-lg text-xs font-semibold hover:bg-navy-dark/90 transition-colors shadow-lg shadow-navy-dark/10 w-full md:w-auto"
                >
                    <span className="material-symbols-outlined text-base">analytics</span>
                    Ver Tudo
                </button>
            </div>
            <div className="overflow-x-auto w-full scrollbar-hide">
                <table className="w-full text-left bg-white dark:bg-slate-800 min-w-[600px] md:min-w-0">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
                        <tr>
                            <th className="px-4 md:px-6 py-3 w-8 md:w-12">#</th>
                            <th className="px-4 md:px-6 py-3">Município</th>
                            <th className="px-4 md:px-6 py-3 text-center">Origem</th>
                            <th className="px-4 md:px-6 py-3 text-center">Projetos</th>
                            <th className="px-4 md:px-6 py-3 text-right">Valor Total</th>
                            <th className="px-4 md:px-6 py-3 text-center w-10 md:w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {sortedMunicipios.slice(0, 5).map((item, index) => (
                            <tr key={item.municipio} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                <td className="px-4 md:px-6 py-2 md:py-3">
                                    <span className={`font-black text-[10px] md:text-xs ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-orange-400' : 'text-slate-300'}`}>
                                        {index + 1}
                                    </span>
                                </td>
                                <td className="px-4 md:px-6 py-2 md:py-3">
                                    <span
                                        className="font-semibold text-navy-dark dark:text-white text-xs md:text-sm whitespace-nowrap cursor-pointer hover:text-turquoise transition-colors"
                                        onClick={() => navigateTo('MunicipioDetalhes', { id: item.id })}
                                    >
                                        {item.municipio}
                                    </span>
                                </td>
                                <td className="px-4 md:px-6 py-2 md:py-3 text-center">
                                    <div className="flex justify-center gap-1">
                                        {Array.from(item.origens).map(origem => (
                                            <span
                                                key={origem}
                                                className={`px-1 py-0.5 rounded text-[7px] md:text-[8px] font-black uppercase border ${origem === 'Lincoln Portela'
                                                    ? 'bg-navy-dark/10 text-navy-dark border-navy-dark/20 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/30'
                                                    : 'bg-turquoise/10 text-turquoise border-turquoise/20 dark:bg-turquoise/20 dark:text-turquoise dark:border-turquoise/30'
                                                    }`}
                                            >
                                                {origem.split(' ')[0]}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 md:px-6 py-2 md:py-3 text-center">
                                    <span className="inline-block px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] md:text-xs font-bold">
                                        {item.quantidade}
                                    </span>
                                </td>
                                <td className="px-4 md:px-6 py-2 md:py-3 font-black text-xs md:text-sm text-navy-dark dark:text-white text-right whitespace-nowrap">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(item.totalValor)}
                                </td>
                                <td className="px-4 md:px-6 py-2 md:py-3 text-center">
                                    <button
                                        onClick={() => navigateTo('MunicipioDetalhes', { id: item.id })}
                                        className="size-6 md:size-7 rounded-lg bg-turquoise/10 hover:bg-turquoise/20 flex items-center justify-center transition-all group/btn"
                                    >
                                        <span className="material-symbols-outlined text-turquoise text-[14px] md:text-sm group-hover/btn:scale-110 transition-transform">open_in_new</span>
                                    </button>
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
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col mb-6 md:mb-8">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <h4 className="font-bold text-navy-dark dark:text-white text-sm md:text-base">Atividades Recentes</h4>
        </div>
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="relative flex gap-3 md:gap-4">
                <div className="absolute left-3 md:left-4 top-8 bottom-0 w-px bg-slate-200 dark:bg-slate-700"></div>
                <div className="shrink-0 size-6 md:size-8 rounded-full bg-turquoise/20 flex items-center justify-center z-10">
                    <span className="material-symbols-outlined text-turquoise text-xs md:text-sm">person_add</span>
                </div>
                <div className="min-w-0">
                    <p className="text-xs md:text-sm font-bold text-navy-dark dark:text-white truncate">Nova Liderança</p>
                    <p className="text-[10px] md:text-xs text-slate-500 mt-0.5">João Silva adicionou um novo líder em <span className="text-turquoise font-medium">Contagem</span>.</p>
                    <p className="text-[8px] md:text-[9px] text-slate-400 uppercase mt-1.5 font-bold tracking-wider">Há 5 min</p>
                </div>
            </div>
            <div className="relative flex gap-3 md:gap-4">
                <div className="absolute left-3 md:left-4 top-8 bottom-0 w-px bg-slate-200 dark:bg-slate-700"></div>
                <div className="shrink-0 size-6 md:size-8 rounded-full bg-turquoise/20 flex items-center justify-center z-10">
                    <span className="material-symbols-outlined text-turquoise text-xs md:text-sm">description</span>
                </div>
                <div className="min-w-0">
                    <p className="text-xs md:text-sm font-bold text-navy-dark dark:text-white truncate">Ofício Enviado</p>
                    <p className="text-[10px] md:text-xs text-slate-500 mt-0.5">Relatório ministerial concluído em <span className="text-turquoise font-medium">Betim</span>.</p>
                    <p className="text-[8px] md:text-[9px] text-slate-400 uppercase mt-1.5 font-bold tracking-wider">Há 42 min</p>
                </div>
            </div>
            <div className="relative flex gap-3 md:gap-4">
                <div className="shrink-0 size-6 md:size-8 rounded-full bg-turquoise/20 flex items-center justify-center z-10">
                    <span className="material-symbols-outlined text-turquoise text-xs md:text-sm">edit</span>
                </div>
                <div className="min-w-0">
                    <p className="text-xs md:text-sm font-bold text-navy-dark dark:text-white truncate">Perfil Atualizado</p>
                    <p className="text-[10px] md:text-xs text-slate-500 mt-0.5">Assessor Marcos atualizou os dados de 15 líderes.</p>
                    <p className="text-[8px] md:text-[9px] text-slate-400 uppercase mt-1.5 font-bold tracking-wider">Há 5 horas</p>
                </div>
            </div>
        </div>
        <div className="p-3 md:p-4 border-t border-slate-200 dark:border-slate-700">
            <button className="w-full text-[10px] md:text-xs font-bold text-turquoise hover:underline flex items-center justify-center gap-1">
                Ver Histórico
                <span className="material-symbols-outlined text-sm md:text-xs">arrow_forward</span>
            </button>
        </div>
    </div>
);


const DashboardPage: React.FC<DashboardProps> = ({ navigateTo }) => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { selectedMandato, setSelectedMandato } = useContext(AppContext)!;

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
                    recursosData,
                    googleEventsData
                ] = await Promise.all([
                    getMunicipios(),
                    getLiderancas(),
                    getAssessores(),
                    getAgendaEventos(),
                    getRecursosTotais(),
                    getDemandasTotais(),
                    getDemandasTotais('Alê Portela'),
                    getDemandasTotais('Lincoln Portela'),
                    getAllRecursos(),
                    getGoogleEvents()
                ]);

                const combinedLiderancas = liderancasData.map(l => {
                    if (l.latitude == null) {
                        const mock = mockLider.find(ml => ml.id === l.id || ml.nome === l.nome);
                        if (mock) return { ...l, latitude: mock.latitude, longitude: mock.longitude };
                    }
                    return l;
                });

                const combinedAssessores = assessoresData.map(a => {
                    if (a.latitude == null) {
                        const mock = mockAsse.find(ma => ma.id === a.id || ma.nome === a.nome);
                        if (mock) return { ...a, latitude: mock.latitude, longitude: mock.longitude };
                    }
                    return a;
                });

                const today = new Date().toISOString().split('T')[0];
                const combinedAgenda = [...agendaData, ...googleEventsData];
                const upcomingEvents = combinedAgenda
                    .filter(event => event.data >= today)
                    .sort((a, b) => {
                        const dateA = new Date(`${a.data}T${a.hora}`);
                        const dateB = new Date(`${b.data}T${b.hora}`);
                        return dateA.getTime() - dateB.getTime();
                    })
                    .slice(0, 4);

                setData({
                    municipios: municipiosData,
                    liderancas: combinedLiderancas,
                    assessores: combinedAssessores,
                    agenda: upcomingEvents,
                    recursosTotais: recursosTotaisData,
                    demandasTotais: demandasTotaisData,
                    aleDemandasCount: aleDemandasCount,
                    lincolnDemandasCount: lincolnDemandasCount,
                    recursos: recursosData.map(r => ({
                        ...r,
                        municipio_nome: municipiosData.find(m => m.id === r.municipioId)?.nome || 'Desconhecido'
                    }))
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
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 pb-24 md:pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
                <div className="min-w-0">
                    <h2 className="text-xl md:text-3xl font-black tracking-tight text-navy-dark dark:text-white truncate">Dashboard Geral</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-base">Visão estratégica e indicadores.</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] md:text-sm text-slate-500 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm w-fit">
                    <span className="material-symbols-outlined text-turquoise text-base md:text-lg">calendar_today</span>
                    <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                </div>
            </div>

            {/* Filtrando dados para exibição */}
            {(() => {
                const filteredData = data ? {
                    ...data,
                    municipios: data.municipios, // Municípios são compartilhados
                    liderancas: selectedMandato === 'Todos' ? data.liderancas : data.liderancas.filter(l => (l.origem as any)?.includes(selectedMandato) || (selectedMandato === 'Alê Portela' && l.origem === ('Alê' as any))),
                    assessores: data.assessores, // Assessores são compartilhados
                    agenda: selectedMandato === 'Todos' ? data.agenda : data.agenda.filter(e => e.origem === 'Google Calendar' || (e.origem as any)?.includes(selectedMandato) || (selectedMandato === 'Alê Portela' && e.origem === ('Alê' as any))),
                    recursos: selectedMandato === 'Todos' ? data.recursos : data.recursos.filter(r => (r.origem as any)?.includes(selectedMandato) || (selectedMandato === 'Alê Portela' && r.origem === ('Alê' as any))),
                    recursosTotais: selectedMandato === 'Todos' ? data.recursosTotais : data.recursos.filter(r => (r.origem as any)?.includes(selectedMandato) || (selectedMandato === 'Alê Portela' && r.origem === ('Alê' as any))).reduce((acc, r) => acc + r.valor, 0),
                    demandasTotais: selectedMandato === 'Todos' ? data.demandasTotais : (selectedMandato === 'Alê Portela' ? data.aleDemandasCount : (selectedMandato === 'Lincoln Portela' ? data.lincolnDemandasCount : 0)),
                } : null;

                if (!filteredData) return null;

                return (
                    <div className="space-y-8 animate-in fade-in duration-300">

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                            <KpiCard
                                title="Municípios"
                                value={filteredData.municipios.length.toString()}
                                icon="location_on"
                                trend="+2 este mês"
                                trendDirection="up"
                            />
                            <KpiCard
                                title="Lideranças"
                                value={filteredData.liderancas.length.toString()}
                                icon="groups"
                                trend="+12%"
                                trendDirection="up"
                            />
                            <KpiCard
                                title="Recursos"
                                value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(filteredData.recursosTotais)}
                                icon="payments"
                                trend="85%"
                                trendDirection="neutral"
                            />
                            <KpiCard
                                title="Demandas"
                                value={(filteredData.demandasTotais || 0).toString()}
                                icon="assignment_late"
                                trend="-5 hoje"
                                trendDirection="up"
                            />
                        </div>

                        <VotacaoEstadualKPIs selectedMandato={selectedMandato} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <CoberturaMap
                                municipios={filteredData.municipios}
                                liderancas={filteredData.liderancas}
                                assessores={filteredData.assessores}
                                recursos={filteredData.recursos}
                                selectedMandato={selectedMandato}
                            />
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
