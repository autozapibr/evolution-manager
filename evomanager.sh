#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Evolution Manager - Script de Instalação ===${NC}\n"

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Por favor, execute este script como root (usando sudo)${NC}"
    exit 1
fi

# Função para validar URL
validate_url() {
    if [[ $1 =~ ^https?://[A-Za-z0-9.-]+\.[A-Za-z]{2,6}/?.*$ ]]; then
        return 0
    else
        return 1
    fi
}

# Coletar informações
echo -e "${GREEN}Digite o domínio para o Evolution Manager (ex: evomanager.seudominio.com):${NC}"
read DOMAIN

echo -e "${GREEN}Digite a URL da sua Evolution API (ex: https://api.seudominio.com):${NC}"
read API_URL
while ! validate_url "$API_URL"; do
    echo -e "${RED}URL inválida. Por favor, digite uma URL válida começando com http:// ou https://${NC}"
    read API_URL
done

# Instalar dependências necessárias
echo -e "\n${BLUE}Instalando dependências...${NC}"
apt update
apt install -y nginx certbot python3-certbot-nginx curl

# Configurar diretório
echo -e "\n${BLUE}Configurando diretórios...${NC}"
mkdir -p /var/www/$DOMAIN/dist
chown -R www-data:www-data /var/www/$DOMAIN

# Configurar Nginx
echo -e "\n${BLUE}Configurando Nginx...${NC}"
cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    server_name $DOMAIN;

    root /var/www/$DOMAIN/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html =404;
        add_header Cache-Control "no-cache";
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss text/javascript;
}
EOF

# Ativar o site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# Testar e recarregar Nginx
nginx -t && systemctl reload nginx

# Configurar SSL com Certbot
echo -e "\n${BLUE}Configurando SSL com Let's Encrypt...${NC}"
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email webmaster@$DOMAIN

# Clonar e construir a aplicação
echo -e "\n${BLUE}Clonando e construindo a aplicação...${NC}"
TEMP_DIR=$(mktemp -d)
cd $TEMP_DIR

# Instalar Node.js 18
echo -e "\n${BLUE}Instalando Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Clonar o repositório
git clone https://github.com/seu-usuario/evolution-manager.git
cd evolution-manager

# Instalar dependências e construir
npm install
# Configurar API URL
sed -i "s|https://sua-evolution-api.com|$API_URL|g" src/lib/api.ts

# Build
npm run build

# Copiar arquivos para o diretório web
cp -r dist/* /var/www/$DOMAIN/dist/
chown -R www-data:www-data /var/www/$DOMAIN/dist

# Limpar arquivos temporários
cd /
rm -rf $TEMP_DIR

echo -e "\n${GREEN}===== Instalação Concluída! =====${NC}"
echo -e "Evolution Manager está instalado em: ${BLUE}https://$DOMAIN${NC}"
echo -e "API configurada em: ${BLUE}$API_URL${NC}"
echo -e "\nSe precisar fazer alterações posteriores:"
echo -e "- Arquivos do site: ${BLUE}/var/www/$DOMAIN/dist${NC}"
echo -e "- Configuração nginx: ${BLUE}/etc/nginx/sites-available/$DOMAIN${NC}"
echo -e "\n${GREEN}Lembre-se de apontar seu DNS para este servidor antes de acessar!${NC}"
