
const fs = require('fs');
const path = require('path');

async function generateSummary() {
    const votosDir = path.join(__dirname, 'public', 'data', 'votos');
    const mappingUrl = 'https://raw.githubusercontent.com/betafcc/Municipios-Brasileiros-TSE/master/municipios_brasileiros_tse.json';

    console.log('Fetching IBGE-TSE mapping...');
    const response = await fetch(mappingUrl);
    const mapping = await response.json();

    const tseToIbge = {};
    mapping.forEach(m => {
        tseToIbge[m.codigo_tse] = String(m.codigo_ibge);
    });

    const summary = {};
    const files = fs.readdirSync(votosDir).filter(f => f.endsWith('.json') && f !== 'resumo.json');

    console.log(`Processing ${files.length} files...`);

    let totalLincoln = 0;
    let totalAle = 0;

    files.forEach(file => {
        const tseCode = file.replace('.json', '');
        const ibgeCode = tseToIbge[tseCode];

        if (!ibgeCode) return;

        const content = JSON.parse(fs.readFileSync(path.join(votosDir, file), 'utf8'));

        const lincoln = content.f?.find(c => c.nr === '2233')?.v || 0;
        const ale = content.e?.find(c => c.nr === '22333')?.v || 0;

        summary[ibgeCode] = { l: lincoln, a: ale };
        totalLincoln += lincoln;
        totalAle += ale;
    });

    fs.writeFileSync(
        path.join(__dirname, 'public', 'data', 'votos_resumo.json'),
        JSON.stringify(summary)
    );

    console.log('Summary generated: public/data/votos_resumo.json');
    console.log(`Verified totals: Lincoln=${totalLincoln}, Ale=${totalAle}`);
}

generateSummary().catch(console.error);
