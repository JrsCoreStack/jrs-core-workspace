@echo off
setlocal
rem ============================================================
rem  JRS ERP – Iniciar ambiente de desenvolvimento
rem  Execute com duplo clique ou pelo terminal na raiz.
rem ============================================================

cd /d "%~dp0" 2>nul || (
  echo Nao foi possivel ir para a pasta do script.
  pause & exit /b 1
)

where npm >nul 2>&1 || (
  echo npm nao encontrado no PATH. Instale o Node.js.
  pause & exit /b 1
)

rem Verifica se o .env do backend existe
if not exist "%~dp0Jrs-api-erp\.env" (
  echo AVISO: Arquivo .env nao encontrado em Jrs-api-erp\
  echo Crie o arquivo antes de iniciar o backend.
  pause & exit /b 1
)

echo.
echo  JRS ERP – Abrindo servidores...
echo  Backend  ^> http://localhost:8081
echo  Frontend ^> http://localhost:3000
echo  Swagger  ^> http://localhost:8081/api
echo.

rem Backend NestJS (npm run dev = nest start --watch)
start "JRS API  – Backend  :8081" /D "%~dp0Jrs-api-erp"  cmd /k "npm run dev"

rem Aguarda 2 segundos para o backend iniciar primeiro
timeout /t 2 /nobreak >nul

rem Frontend Next.js
start "JRS Web  – Frontend :3000" /D "%~dp0Jrs-web-erp" cmd /k "npm run dev"

echo  Duas janelas foram abertas.
echo  Feche-as para parar os servidores.
echo.
pause
