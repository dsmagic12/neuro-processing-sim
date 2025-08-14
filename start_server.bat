@echo off
echo Claude Neural Visual Processing Simulator
echo Starting local web server...
echo.

REM Use the specific Anaconda Python environment
set PYTHON_PATH=C:\Users\dscha\anaconda3\envs\python-310\python.exe

REM Check if Python is available at the specified path
"%PYTHON_PATH%" --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python not found at %PYTHON_PATH%
    echo Please check your Anaconda installation
    pause
    exit /b 1
)

echo Starting Python HTTP server with Anaconda environment...
echo Python path: %PYTHON_PATH%
"%PYTHON_PATH%" start_server.py

pause