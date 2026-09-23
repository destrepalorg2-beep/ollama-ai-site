@echo off
title Ollama AI - Site
cd /d "%~dp0"

echo Working dir: %cd%
echo.

if not exist "node_modules" (
    echo Installing dependencies, first run takes a few minutes...
    call npm install
    echo.
)

echo Starting dev server on http://localhost:3002
echo.
call npm run dev -- --port 3002

pause
