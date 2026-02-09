import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { query } = req;
    const queryString = new URLSearchParams(query as any).toString();
    const url = `https://cepesp.io/api/consulta/votos?${queryString}`;

    console.log(`[Proxy] Forwarding request to: ${url}`);

    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1'
        }
    };

    const proxyReq = https.get(url, options, (apiRes) => {
        let data = '';

        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        apiRes.on('end', () => {
            console.log(`[Proxy] Response Code: ${apiRes.statusCode}`);

            if (apiRes.statusCode !== 200) {
                console.error(`[Proxy] Error from CEPESP: ${apiRes.statusCode}`);
                console.error(`[Proxy] Response Headers:`, apiRes.headers);
                // Tentar devolver o erro para debug, mas sem quebrar o JSON do cliente se possível
                res.status(apiRes.statusCode || 500).send(data);
                return;
            }

            try {
                const json = JSON.parse(data);
                res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
                res.status(200).json(json);
            } catch (e) {
                console.error("[Proxy] JSON Parse Error:", e);
                console.error("[Proxy] Raw Data:", data.substring(0, 200));
                res.status(500).json({ error: 'Failed to parse JSON from CEPESP', raw: data });
            }
        });
    });

    proxyReq.on('error', (e) => {
        console.error("[Proxy] Request Error:", e);
        res.status(500).json({ error: e.message });
    });
}
