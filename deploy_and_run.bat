@echo off
setlocal
chcp 65001 >nul
title AI HUB site - deploy + run latest
cd /d "%~dp0"

echo ======================================== > deploy-log.txt
echo   Committing and pushing changes >> deploy-log.txt
echo ======================================== >> deploy-log.txt
git add -A >> deploy-log.txt 2>&1
git commit -m "Self-heal active sessions for pre-existing tokens, fix Gmail dark-mode email inversion" >> deploy-log.txt 2>&1
echo commit exit code: %errorlevel% >> deploy-log.txt
git push >> deploy-log.txt 2>&1
echo push exit code: %errorlevel% >> deploy-log.txt

echo. >> deploy-log.txt
echo ======================================== >> deploy-log.txt
echo   Installing dependencies if needed >> deploy-log.txt
echo ======================================== >> deploy-log.txt
if not exist "node_modules" (
  call npm install >> deploy-log.txt 2>&1
  echo npm install exit code: %errorlevel% >> deploy-log.txt
)

echo. >> deploy-log.txt
echo Launching dev server in a separate window on http://localhost:3002 >> deploy-log.txt
echo READY >> deploy-log.txt

start "AI HUB site - dev server" cmd /k "title AI HUB site - dev server (localhost:3002) && npm run dev -- --port 3002"

echo Done - see deploy-log.txt for the git push result. >> deploy-log.txt
