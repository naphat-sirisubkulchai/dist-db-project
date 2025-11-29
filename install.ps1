# Windows Installation Script for Blog Platform
# Run this in PowerShell as Administrator

Write-Host "Blog Platform Installation Script" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "WARNING: Not running as Administrator. Some installations may fail." -ForegroundColor Yellow
    Write-Host "Right-click PowerShell and select 'Run as Administrator' for best results." -ForegroundColor Yellow
    Write-Host ""
}

# Check for Chocolatey
Write-Host "Checking for Chocolatey..." -ForegroundColor Cyan
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Chocolatey not found. Installing Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    Write-Host "Chocolatey installed!" -ForegroundColor Green
} else {
    Write-Host "Chocolatey already installed!" -ForegroundColor Green
}

# Install MongoDB
Write-Host ""
Write-Host "Installing MongoDB..." -ForegroundColor Cyan
if (!(Get-Command mongod -ErrorAction SilentlyContinue)) {
    choco install mongodb -y
    Write-Host "MongoDB installed!" -ForegroundColor Green

    # Create MongoDB data directory
    $mongoDataPath = "C:\data\db"
    if (!(Test-Path $mongoDataPath)) {
        New-Item -ItemType Directory -Force -Path $mongoDataPath
        Write-Host "Created MongoDB data directory at $mongoDataPath" -ForegroundColor Green
    }

    # Start MongoDB service
    Write-Host "Starting MongoDB service..." -ForegroundColor Cyan
    Start-Service MongoDB -ErrorAction SilentlyContinue
    Write-Host "MongoDB service started!" -ForegroundColor Green
} else {
    Write-Host "MongoDB already installed!" -ForegroundColor Green
    # Make sure service is running
    Start-Service MongoDB -ErrorAction SilentlyContinue
}

# Install Bun (if needed)
Write-Host ""
Write-Host "Checking for Bun..." -ForegroundColor Cyan
if (!(Get-Command bun -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Bun..." -ForegroundColor Yellow
    powershell -c "irm bun.sh/install.ps1 | iex"
} else {
    Write-Host "Bun already installed!" -ForegroundColor Green
}

# Install Node dependencies
Write-Host ""
Write-Host "Installing Node dependencies..." -ForegroundColor Cyan
bun install

Write-Host ""
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Update .env file if needed"
Write-Host "  2. Run: bun run dev"
Write-Host ""
Write-Host "MongoDB Management Commands:" -ForegroundColor Yellow
Write-Host "  Start MongoDB:  net start MongoDB"
Write-Host "  Stop MongoDB:   net stop MongoDB"
Write-Host "  Check status:   Get-Service MongoDB"
Write-Host ""
