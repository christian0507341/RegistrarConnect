# RegistrarConnect Development Environment Startup Script
Write-Host "Starting RegistrarConnect Development Environment..." -ForegroundColor Green
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "Virtual environment created!" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

# Install/update dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Start Django server
Write-Host "Starting Django development server..." -ForegroundColor Yellow
Set-Location backend
python manage.py runserver 0.0.0.0:8000
