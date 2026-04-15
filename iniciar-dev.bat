@echo off
setlocal
rem Inicia backend (NestJS) e frontend (Next.js) em janelas separadas do Prompt de Comando.
rem Execute a partir da raiz do workspace (duplo clique ou: iniciar-dev.bat).

cd /d "%~dp0" 2>nul || (
  echo Nao foi possivel ir para a pasta do script.
  pause
  exit /b 1
)

where npm >nul 2>&1 || (
  echo npm nao encontrado no PATH. Instale o Node.js ou use um terminal onde o npm esteja disponivel.
  pause
  exit /b 1
)

echo Abrindo: JRS API ^(NestJS^) e JRS Web ^(Next.js^)...
echo.

start "JRS API - Backend" /D "%~dp0Jrs-api-erp" cmd /k npm run dev
start "JRS Web - Frontend" /D "%~dp0Jrs-web-erp" cmd /k npm run dev

echo Duas janelas foram abertas. Feche-as para parar os servidores.
echo.
pause
