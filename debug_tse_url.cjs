const https = require('https');

const codes = ['544', '545', '546', '547'];
const munic = '41238'; // BH
const cargo = '0007'; // Dep Est

codes.forEach(code => {
    const url = `https://resultados.tse.jus.br/oficial/ele2022/${code}/dados-simplificados/mg/mg${munic}/c${cargo}/e000${code}/mg${munic}-c${cargo}-e000${code}-r.json`;
    console.log(`Testing: ${url}`);

    https.get(url, (res) => {
        console.log(`[${code}] Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
            console.log(`FOUND VALID URL: ${url}`);
        }
    }).on('error', e => console.log(`[${code}] Error: ${e.message}`));
});
