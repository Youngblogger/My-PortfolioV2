@echo off
title CODEMAFIA - Dev Server

echo Starting Backend (Laravel)...
start "CODEMAFIA Backend" cmd /c "cd /d "%~dp0backend" && php artisan serve"

timeout /t 3 /nobreak >nul

echo Starting Frontend (Next.js)...
start "CODEMAFIA Frontend" cmd /c "cd /d "%~dp0" && npm run dev"

echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Close the windows to stop the servers.
