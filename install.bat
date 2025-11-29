@echo off
REM Windows Installation Script for Blog Platform
REM Run this as Administrator

echo ========================================
echo Blog Platform Installation Script
echo ========================================
echo.

REM Check for Administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo WARNING: Not running as Administrator!
    echo Right-click this file and select "Run as Administrator"
    pause
    exit /b 1
)

REM Check for Chocolatey
where choco >nul 2>&1
if %errorLevel% neq 0 (
    echo Installing Chocolatey...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    echo Chocolatey installed!
) else (
    echo Chocolatey already installed!
)

echo.
echo Installing MongoDB...
where mongod >nul 2>&1
if %errorLevel% neq 0 (
    choco install mongodb -y

    REM Create MongoDB data directory
    if not exist "C:\data\db" mkdir "C:\data\db"

    echo MongoDB installed!
    echo Starting MongoDB service...
    net start MongoDB
) else (
    echo MongoDB already installed!
    net start MongoDB 2>nul
)

echo.
echo Installing Bun...
where bun >nul 2>&1
if %errorLevel% neq 0 (
    powershell -c "irm bun.sh/install.ps1 | iex"
) else (
    echo Bun already installed!
)

echo.
echo Installing Node dependencies...
call bun install

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Update .env file if needed
echo   2. Run: bun run dev
echo.
echo MongoDB Management:
echo   Start: net start MongoDB
echo   Stop:  net stop MongoDB
echo.
pause
