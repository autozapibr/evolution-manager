#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Evolution Manager - Script de Instalação Local ===${NC}\n"

# Função para validar URL
validate_url() {
    if [[ $1 =~ ^https?://[A-Za-z0-9.-]+\.[A-Za-z]{2,6}/?.*$ ]]; then
        return 0
    else
        return 1
    fi
}

# Coletar informações
echo -e "${GREEN}Digite a porta para o servidor local (ex: 8080):${NC}"
read PORT

echo -e "${GREEN}Digite a URL da sua Evolution API (ex: https://api.seudominio.com):${NC}"
read API_URL
while ! validate_url "$API_URL"; do
    echo -e "${RED}URL inválida. Por favor, digite uma URL válida começando com http:// ou https://${NC}"
    read API_URL
done

# Criar diretório de trabalho
WORK_DIR="$HOME/evolution-manager-local"
echo -e "\n${BLUE}Criando diretório de trabalho em $WORK_DIR...${NC}"
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

# Clonar o repositório
echo -e "\n${BLUE}Clonando o repositório...${NC}"
git clone https://github.com/seu-usuario/evolution-manager.git .

# Instalar dependências
echo -e "\n${BLUE}Instalando dependências...${NC}"
npm install

# Configurar API URL
echo -e "\n${BLUE}Configurando URL da API...${NC}"
sed -i "s|https://sua-evolution-api.com|$API_URL|g" src/lib/api.ts

# Build
echo -e "\n${BLUE}Fazendo build da aplicação...${NC}"
npm run build

# Configurar servidor local
echo -e "\n${BLUE}Configurando servidor local...${NC}"
npm install -g serve

echo -e "\n${GREEN}===== Instalação Local Concluída! =====${NC}"
echo -e "Para iniciar o Evolution Manager:"
echo -e "${BLUE}cd $WORK_DIR${NC}"
echo -e "${BLUE}serve -s dist -l $PORT${NC}"
echo -e "\nAcesse em: ${BLUE}http://localhost:$PORT${NC}"
echo -e "API configurada em: ${BLUE}$API_URL${NC}"
echo -e "\n${GREEN}Para parar o servidor, pressione Ctrl+C${NC}"

# Iniciar o servidor
echo -e "\n${BLUE}Iniciando servidor...${NC}"
serve -s dist -l $PORT
