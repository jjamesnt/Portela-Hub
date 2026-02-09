/**
 * Otimizador de JSON - Reduz tamanho mantendo apenas top candidatos
 * Uso: node optimize_votos_json.cjs
 */

const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, 'public', 'data', 'votos');
const OUTPUT_DIR = path.join(__dirname, 'public', 'data', 'votos_otimizado');

// Configuração
const TOP_CANDIDATOS_POR_CARGO = 500; // Todos os candidatos eleitos (77 dep est + 53 dep fed = 130 eleitos)

// Cria pasta de saída
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.json'));
console.log(`📁 Processando ${files.length} arquivos...`);

let totalOriginal = 0;
let totalOtimizado = 0;

for (const file of files) {
    const filePath = path.join(INPUT_DIR, file);
    const original = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(original);

    totalOriginal += original.length;

    // Separar por cargo e pegar top N de cada
    const depFed = data.candidatos
        .filter(c => c.cargoId === '6')
        .slice(0, TOP_CANDIDATOS_POR_CARGO)
        .map(c => ({ n: c.nome, p: c.partido, v: c.votos, nr: c.numero })); // Campos reduzidos

    const depEst = data.candidatos
        .filter(c => c.cargoId === '7')
        .slice(0, TOP_CANDIDATOS_POR_CARGO)
        .map(c => ({ n: c.nome, p: c.partido, v: c.votos, nr: c.numero }));

    const otimizado = {
        c: data.codigo,
        m: data.nome,
        f: depFed, // Deputados Federais
        e: depEst  // Deputados Estaduais
    };

    // Salvar minificado (sem espaços)
    const outputPath = path.join(OUTPUT_DIR, file);
    const outputStr = JSON.stringify(otimizado);
    fs.writeFileSync(outputPath, outputStr);

    totalOtimizado += outputStr.length;
}

const reducao = ((1 - totalOtimizado / totalOriginal) * 100).toFixed(1);
console.log(`\n✅ Otimização concluída!`);
console.log(`   Original: ${(totalOriginal / 1024 / 1024).toFixed(1)} MB`);
console.log(`   Otimizado: ${(totalOtimizado / 1024 / 1024).toFixed(1)} MB`);
console.log(`   Redução: ${reducao}%`);
console.log(`\n📁 Arquivos salvos em: ${OUTPUT_DIR}`);
