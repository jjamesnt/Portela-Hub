const https = require('https');

const url = "https://dadosabertos.tse.jus.br/api/3/action/package_show?id=eleitorado-2022";

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.success) {
                const active = json.result.resources.filter(r => r.datastore_active);
                if (active.length > 0) {
                    console.log("DataStore Active Resources:");
                    active.forEach(r => {
                        console.log(`- [${r.format}] ${r.name}: ${r.id}`);
                    });
                } else {
                    console.log("No DataStore active resources found.");
                    console.log("All resources:", json.result.resources.map(r => r.name));
                }
            } else {
                console.error("API failed:", json);
            }
        } catch (e) {
            console.error("Parse error:", e);
        }
    });
}).on('error', e => console.error("Request error:", e));
