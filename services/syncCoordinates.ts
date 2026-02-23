import { supabase } from './supabaseClient';
import { geocodeMunicipio, geocodeAddress } from './geocodingService';

/**
 * Automation logic to sync coordinates from Nominatim to Supabase
 */

export const syncAllCoordinates = async () => {
    console.log('Starting coordinates sync...');

    // 1. Sync Municípios
    const { data: municipios } = await supabase
        .from('municipios')
        .select('id, nome')
        .is('latitude', null);

    if (municipios) {
        for (const m of municipios) {
            console.log(`Geocoding municipio: ${m.nome}`);
            const coords = await geocodeMunicipio(m.nome);
            if (coords) {
                await supabase.from('municipios').update({
                    latitude: coords.lat,
                    longitude: coords.lon
                }).eq('id', m.id);
            }
            await new Promise(r => setTimeout(r, 1100)); // Respect Nominatim rate limit
        }
    }

    // 2. Sync Lideranças
    const { data: liderancas } = await supabase
        .from('liderancas')
        .select('id, endereco')
        .is('latitude', null);

    if (liderancas) {
        for (const l of liderancas) {
            if (l.endereco && l.endereco.logradouro) {
                console.log(`Geocoding lideranca ID: ${l.id}`);
                const coords = await geocodeAddress(l.endereco);
                if (coords) {
                    await supabase.from('liderancas').update({
                        latitude: coords.lat,
                        longitude: coords.lon
                    }).eq('id', l.id);
                }
                await new Promise(r => setTimeout(r, 1100));
            }
        }
    }

    // 3. Sync Assessores
    const { data: assessores } = await supabase
        .from('assessores')
        .select('id, endereco')
        .is('latitude', null);

    if (assessores) {
        for (const a of assessores) {
            if (a.endereco && a.endereco.logradouro) {
                console.log(`Geocoding assessor ID: ${a.id}`);
                const coords = await geocodeAddress(a.endereco);
                if (coords) {
                    await supabase.from('assessores').update({
                        latitude: coords.lat,
                        longitude: coords.lon
                    }).eq('id', a.id);
                }
                await new Promise(r => setTimeout(r, 1100));
            }
        }
    }

    console.log('Coordinates sync completed.');
};
