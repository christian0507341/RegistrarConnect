@echo off
echo Starting RegistrarConnect Development Environment...
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    echo Virtual environment created!
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install/update dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Start Django server
echo Starting Django development server...
cd backend
python manage.py runserver 0.0.0.0:8000

pause
