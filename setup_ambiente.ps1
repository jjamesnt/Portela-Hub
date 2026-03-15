# Script de Instalação Rápida - Portela-Hub (Windows)

Write-Host "Iniciando a preparacao do Portela-Hub..." -ForegroundColor Cyan

# 1. Checar se o Node.js esta instalado
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "[OK] Node.js detectado." -ForegroundColor Green
} else {
    Write-Host "[ALERTA] Node.js não encontrado! Baixe e instale em: https://nodejs.org/" -ForegroundColor Yellow
    exit
}

# 2. Instalar as dependencias (node_modules)
Write-Host "`nInstalando as bibliotecas necessarias... (Isso pode levar alguns minutos)" -ForegroundColor Cyan
npm install

# 3. Preparar o arquivo .env.local se ele não existir
if (-Not (Test-Path ".env.local")) {
    Write-Host "`nCriando arquivo .env.local a partir do .env.example..." -ForegroundColor Cyan
    Copy-Item ".env.example" -Destination ".env.local"
    
    Write-Host "--------------------------------------------------------" -ForegroundColor Yellow
    Write-Host "ATENÇÃO: Um novo arquivo .env.local foi criado." -ForegroundColor Yellow
    Write-Host "Abra-o no VS Code e insira suas credenciais do Supabase." -ForegroundColor Yellow
    Write-Host "--------------------------------------------------------" -ForegroundColor Yellow
} else {
    Write-Host "`n[OK] Arquivo .env.local ja existe." -ForegroundColor Green
}

Write-Host "`n[SUCESSO] Projeto pronto para rodar! Use 'npm run dev' para iniciar." -ForegroundColor Green
