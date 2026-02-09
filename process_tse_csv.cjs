/**
 * Processador de CSV do TSE - Gera JSON de votos por município
 * Uso: node process_tse_csv.cjs
 */

const fs = require('fs');
const readline = require('readline');
const path = require('path');

const CSV_PATH = path.join(__dirname, 'data', 'votacao_candidato_munzona_2022_MG.csv');
const OUTPUT_DIR = path.join(__dirname, 'public', 'data', 'votos');

// Cria pasta de saída
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Mapa: cod_municipio -> { candidatos }
const municipioData = {};

async function processCSV() {
    console.log('📖 Iniciando leitura do CSV...');
    console.log(`   Arquivo: ${CSV_PATH}`);

    const fileStream = fs.createReadStream(CSV_PATH, { encoding: 'latin1' });
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let lineCount = 0;
    let headerCols = [];

    for await (const line of rl) {
        lineCount++;

        // Parse header (primeira linha com "DT_GERACAO")
        if (line.includes('DT_GERACAO') && headerCols.length === 0) {
            headerCols = line.split(';').map(c => c.replace(/"/g, ''));
            console.log(`✅ Header encontrado: ${headerCols.length} colunas`);
            continue;
        }

        if (headerCols.length === 0) continue; // Skip até achar header

        const cols = line.split(';').map(c => c.replace(/"/g, ''));

        // Índices importantes
        const idxCodMunicipio = headerCols.indexOf('CD_MUNICIPIO');
        const idxNmMunicipio = headerCols.indexOf('NM_MUNICIPIO');
        const idxCargo = headerCols.indexOf('CD_CARGO');
        const idxNrCandidato = headerCols.indexOf('NR_CANDIDATO');
        const idxNmUrna = headerCols.indexOf('NM_URNA_CANDIDATO');
        const idxSiglaPartido = headerCols.indexOf('SG_PARTIDO');
        const idxVotos = headerCols.indexOf('QT_VOTOS_NOMINAIS');

        if (idxCodMunicipio < 0 || idxVotos < 0) continue;

        const codMunicipio = cols[idxCodMunicipio];
        const nmMunicipio = cols[idxNmMunicipio];
        const cargo = cols[idxCargo]; // 6=DepFed, 7=DepEst
        const nrCandidato = cols[idxNrCandidato];
        const nmUrna = cols[idxNmUrna];
        const siglaPartido = cols[idxSiglaPartido];
        const votos = parseInt(cols[idxVotos]) || 0;

        // Filtra apenas Deputados (6 e 7)
        if (!['6', '7'].includes(cargo)) continue;

        // Inicializa município
        if (!municipioData[codMunicipio]) {
            municipioData[codMunicipio] = {
                nome: nmMunicipio,
                candidatos: {}
            };
        }

        // Chave única: cargo + número
        const key = `${cargo}_${nrCandidato}`;
        if (!municipioData[codMunicipio].candidatos[key]) {
            municipioData[codMunicipio].candidatos[key] = {
                cargo: cargo === '6' ? 'Deputado Federal' : 'Deputado Estadual',
                cargoId: cargo,
                numero: nrCandidato,
                nome: nmUrna,
                partido: siglaPartido,
                votos: 0
            };
        }
        municipioData[codMunicipio].candidatos[key].votos += votos;

        // Log de progresso
        if (lineCount % 500000 === 0) {
            console.log(`   Processadas ${lineCount.toLocaleString()} linhas...`);
        }
    }

    console.log(`\n✅ Leitura completa: ${lineCount.toLocaleString()} linhas`);
    console.log(`   Municípios encontrados: ${Object.keys(municipioData).length}`);

    // Gera arquivos JSON por município
    console.log('\n📁 Gerando arquivos JSON...');
    let filesCreated = 0;

    for (const [codMunicipio, data] of Object.entries(municipioData)) {
        const candidatos = Object.values(data.candidatos);

        // Ordena por votos (desc) dentro de cada cargo
        candidatos.sort((a, b) => b.votos - a.votos);

        const output = {
            codigo: codMunicipio,
            nome: data.nome,
            candidatos: candidatos
        };

        const filePath = path.join(OUTPUT_DIR, `${codMunicipio}.json`);
        fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
        filesCreated++;
    }

    console.log(`✅ ${filesCreated} arquivos JSON criados em: ${OUTPUT_DIR}`);
    console.log('\n🎉 Processamento concluído!');
}

processCSV().catch(console.error);
