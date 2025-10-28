@echo off
REM Generate app icons from logo
echo.
echo ========================================
echo   App Icon Generator for RegistrarConnect
echo ========================================
echo.

echo Step 1: Checking Flutter installation...
flutter --version
if %errorlevel% neq 0 (
    echo ERROR: Flutter is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Step 2: Getting Flutter packages...
flutter pub get

echo.
echo Step 3: Generating app icons from logo...
echo Using logo from: assets/images/logo.png
echo.

dart run flutter_launcher_icons

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SUCCESS! App icons generated!
    echo ========================================
    echo.
    echo Icons have been created for:
    echo   - Android (all densities)
    echo   - iOS (all sizes)
    echo   - Web (favicon and icons)
    echo.
    echo Next steps:
    echo   1. Run: flutter clean
    echo   2. Run: flutter run
    echo   3. Check your app icon on the device!
    echo.
) else (
    echo.
    echo ERROR: Icon generation failed
    echo.
    echo Troubleshooting:
    echo   1. Make sure assets/images/logo.png exists
    echo   2. Check that the logo is a valid PNG file
    echo   3. Try running: flutter pub get
    echo.
)

pause

