const https = require('https');

// Test fetch for Belo Horizonte (TSE: 41238)
// Deputado Estadual (7) em 2022
const url = "https://cepesp.io/api/consulta/votos?ano=2022&cargo=7&agregacao=candidato&estado=MG&cod_municipio_tse=41238";

console.log("Fetching: " + url);

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log(`Total Candidates Found: ${json.length}`);
            if (json.length > 0) {
                console.log("Top 5 candidates by votes:");
                const sorted = json.sort((a, b) => b.qt_votos_nominais - a.qt_votos_nominais).slice(0, 5);
                sorted.forEach(c => {
                    console.log(`${c.qt_votos_nominais} - ${c.nome_candidato} (${c.numero_candidato})`);
                });
            }
        } catch (e) {
            console.error(e);
        }
    });
}).on('error', (e) => console.error(e));
