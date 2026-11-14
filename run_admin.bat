@echo off
title React Admin Panel
cd /d "%~dp0"

echo ====================================================
echo Starting React Admin Panel on http://localhost:3000
echo Connected to Backend: http://localhost:8000
echo ====================================================

rem If node is not in current PATH, check fnm
where node >nul 2>nul
if %errorlevel% neq 0 (
    if exist "%APPDATA%\fnm\node-versions\v26.13.0\installation" (
        set "PATH=%APPDATA%\fnm\node-versions\v26.13.0\installation;%PATH%"
    )
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js is not found!
    echo Please install Node.js LTS from https://nodejs.org/
    echo.
    pause
    exit /b
)

rem Ensure react-scripts.cmd exists in node_modules\.bin
if not exist "node_modules\.bin\react-scripts.cmd" (
    if exist "node_modules\react-scripts\bin\react-scripts.js" (
        echo Creating react-scripts.cmd wrapper...
        (
            echo @ECHO off
            echo node "%%~dp0\..\react-scripts\bin\react-scripts.js" %%*
        ) > "node_modules\.bin\react-scripts.cmd"
    )
)

echo Starting development server...
echo Access in browser: http://localhost:3000/admin
echo.
set CI=false
npm start
pause
