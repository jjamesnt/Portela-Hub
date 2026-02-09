import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { ano, codigoTse, codigoEleicao, cargo } = req.query;

    if (!ano || !codigoTse || !codigoEleicao || !cargo) {
        res.status(400).json({ error: 'Missing required params: ano, codigoTse, codigoEleicao, cargo' });
        return;
    }

    // Para 2022 (eleições gerais), o código da unidade é 'MG' (estado)
    // Para 2024 (eleições municipais), o código é o código TSE do município
    const unidade = ano === '2022' ? 'MG' : codigoTse;

    const url = `https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/listar/${ano}/${unidade}/${codigoEleicao}/${cargo}/candidatos`;

    console.log(`[Proxy DivulgaCand] Forwarding request to: ${url}`);

    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'pt-BR,pt;q=0.9',
        }
    };

    const proxyReq = https.get(url, options, (apiRes) => {
        let data = '';

        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        apiRes.on('end', () => {
            console.log(`[Proxy DivulgaCand] Response Code: ${apiRes.statusCode}`);

            if (apiRes.statusCode !== 200) {
                console.error(`[Proxy DivulgaCand] Error: ${apiRes.statusCode}`);
                res.status(apiRes.statusCode || 500).send(data);
                return;
            }

            try {
                const json = JSON.parse(data);
                res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
                res.status(200).json(json);
            } catch (e) {
                console.error("[Proxy DivulgaCand] JSON Parse Error:", e);
                res.status(500).json({ error: 'Failed to parse JSON from TSE', raw: data.substring(0, 500) });
            }
        });
    });

    proxyReq.on('error', (e) => {
        console.error("[Proxy DivulgaCand] Request Error:", e);
        res.status(500).json({ error: e.message });
    });
}
