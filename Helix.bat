@echo off
title HELIX STARTUP
color 0A

echo =========================================
echo STARTING HELIX
echo =========================================

:: =========================================
:: START OLLAMA
:: =========================================

echo.
echo [1/3] Starting Ollama...

start "Ollama" cmd /k "ollama serve"

timeout /t 5 >nul

:: =========================================
:: START BACKEND
:: =========================================

echo.
echo [2/3] Starting Backend...

cd /d E:\Helix

start "Helix Backend" cmd /k "uvicorn api.server:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 5 >nul

:: =========================================
:: START ELECTRON APP
:: =========================================

echo.
echo [3/3] Starting Electron App...

cd /d E:\Helix\ui\helix-dashboard

start "Helix Electron" cmd /k "npm run dev"

echo.
echo =========================================
echo HELIX STARTED
echo =========================================

exit