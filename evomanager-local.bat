@echo off
echo === Evolution Manager - Instalacao Local ===
echo.

REM Verificar se Node.js esta instalado
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Erro: Node.js nao esta instalado!
    echo Por favor, instale o Node.js de https://nodejs.org/
    exit /b 1
)

REM Coletar informacoes
set /p PORT="Digite a porta para o servidor local (ex: 8080): "
set /p API_URL="Digite a URL da Evolution API (ex: https://api.seudominio.com): "

REM Parar processos node existentes
taskkill /F /IM node.exe > nul 2>&1

REM Limpar instalacao anterior
if exist "dist" rd /s /q "dist"
if exist "node_modules" rd /s /q "node_modules"

REM Instalar dependencias
echo.
echo Instalando dependencias...
call npm install

REM Instalar serve globalmente
echo.
echo Instalando servidor local...
call npm install -g serve

REM Configurar API URL
echo.
echo Configurando URL da API...
powershell -Command "(Get-Content src/lib/api.ts) -replace 'https://sua-evolution-api.com', '%API_URL%' | Set-Content src/lib/api.ts"

REM Build
echo.
echo Fazendo build da aplicacao...
call npm run build

echo.
echo === Instalacao Local Concluida! ===
echo.
echo Para acessar o Evolution Manager:
echo http://localhost:%PORT%
echo API configurada em: %API_URL%
echo.
echo Iniciando servidor...
echo Para parar o servidor, pressione Ctrl+C
echo.

REM Iniciar servidor
serve -s dist -l %PORT%
