const https = require('https');

const url = "https://cepesp.io/api/consulta/votos?ano=2022&cargo=7&agregacao=candidato&estado=MG&cod_municipio_tse=41238";

console.log("Fetching: " + url);

const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://cepesp.io/'
    }
};

https.get(url, options, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Body length:', data.length);
        console.log('First 200 chars:', data.substring(0, 200));
    });
}).on('error', (e) => {
    console.error("Error:", e);
});
