@echo off
title Overlays MLBB
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   No se encontro Node.js.
  echo   Instalalo desde https://nodejs.org ^(version LTS^) y vuelve a abrir este archivo.
  echo.
  pause
  exit /b
)
:loop
node server.js
echo.
echo   El programa se detuvo. Vuelve a arrancar solo en 3 segundos...
echo   (si no queres que arranque de nuevo, cerra esta ventana)
timeout /t 3 >nul
goto loop
