#!/bin/bash

# Cores do terminal para dar destaque aos avisos
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sem cor

echo -e "${CYAN}Iniciando a preparacao do Portela-Hub no macOS...${NC}"

# 1. Checar se o Node.js esta instalado no Mac
if command -v node &> /dev/null; then
    echo -e "${GREEN}[OK] Node.js detectado ($(node -v)).${NC}"
else
    echo -e "${RED}[ALERTA] Node.js nao encontrado! Baixe e instale em: https://nodejs.org/${NC}"
    exit 1
fi

# 2. Instalar as dependencias (node_modules)
echo -e "\n${CYAN}Instalando as bibliotecas necessarias... (Isso pode levar alguns minutos em conexoes lentas)${NC}"
npm install

# 3. Preparar o arquivo .env.local se ele não existir
if [ ! -f ".env.local" ]; then
    echo -e "\n${CYAN}Criando arquivo .env.local a partir do .env.example...${NC}"
    cp .env.example .env.local
    
    echo -e "${YELLOW}--------------------------------------------------------${NC}"
    echo -e "${YELLOW}ATENÇÃO: Um novo arquivo .env.local foi criado.${NC}"
    echo -e "${YELLOW}Abra-o no VS Code (ou editor de texto de sua preferencia) e insira suas credenciais do Supabase.${NC}"
    echo -e "${YELLOW}--------------------------------------------------------${NC}"
else
    echo -e "\n${GREEN}[OK] Arquivo .env.local ja existe e nao foi sobrescrito.${NC}"
fi

echo -e "\n${GREEN}[SUCESSO] O projeto esta pronto! Para iniciar, rode:${NC}"
echo "npm run dev"
