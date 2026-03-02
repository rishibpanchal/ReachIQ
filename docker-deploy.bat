@echo off
REM LOC8 Docker Deployment Helper Script for Windows
REM Usage: docker-deploy.bat [dev|prod] [command]

setlocal enabledelayedexpansion

REM Configuration
set ENV_MODE=%1
set COMMAND=%2

if "%ENV_MODE%"=="" set ENV_MODE=dev
if "%COMMAND%"=="" set COMMAND=help

set COMPOSE_FILE=docker-compose.yml
set ENV_FILE=.env.docker

if "%ENV_MODE%"=="prod" (
    set COMPOSE_FILE=docker-compose.prod.yml
    set ENV_FILE=.env.prod
)

REM Functions (using labels and goto)

:check_dependencies
echo ========================================
echo Checking Dependencies...
echo ========================================

docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed
    exit /b 1
)
echo OK: Docker is installed

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker Compose is not installed
    exit /b 1
)
echo OK: Docker Compose is installed
goto :eof

:setup_env
if exist "%ENV_FILE%" (
    echo Environment file already exists: %ENV_FILE%
) else (
    if "%ENV_MODE%"=="prod" (
        if exist ".env.prod.example" (
            copy ".env.prod.example" "%ENV_FILE%"
            echo Created %ENV_FILE% from template - please update with production values!
        ) else (
            echo ERROR: Environment template not found
            exit /b 1
        )
    )
)
goto :eof

:build
echo ========================================
echo Building Docker Images...
echo ========================================
docker-compose -f %COMPOSE_FILE% build --no-cache
if errorlevel 1 exit /b 1
echo Build completed successfully
goto :eof

:build_dev
echo ========================================
echo Building Docker Images (Development)...
echo ========================================
docker-compose -f %COMPOSE_FILE% build
if errorlevel 1 exit /b 1
echo Build completed successfully
goto :eof

:up
echo ========================================
echo Starting Services (%ENV_MODE%)...
echo ========================================
docker-compose -f %COMPOSE_FILE% up -d
if errorlevel 1 exit /b 1
echo Services started successfully
goto :status_print

:down
echo ========================================
echo Stopping Services...
echo ========================================
docker-compose -f %COMPOSE_FILE% down
goto :eof

:restart
echo ========================================
echo Restarting Services...
echo ========================================
docker-compose -f %COMPOSE_FILE% restart
goto :eof

:logs
if "%3"=="" (
    docker-compose -f %COMPOSE_FILE% logs -f
) else (
    docker-compose -f %COMPOSE_FILE% logs -f %3
)
goto :eof

:status_print
echo.
echo Service Status:
docker-compose -f %COMPOSE_FILE% ps
goto :eof

:status
goto :status_print

:health
echo ========================================
echo Testing Service Health...
echo ========================================
echo Testing Backend...
curl -s http://localhost:8000/docs >nul
if errorlevel 1 (
    echo ERROR: Backend is not responding
) else (
    echo OK: Backend is healthy
)

echo Testing Frontend...
curl -s http://localhost:3000 >nul
if errorlevel 1 (
    echo ERROR: Frontend is not responding
) else (
    echo OK: Frontend is running
)
goto :eof

:shell
set SERVICE=%3
if "%SERVICE%"=="" set SERVICE=backend
echo Opening shell in %SERVICE%...
docker-compose -f %COMPOSE_FILE% exec %SERVICE% cmd /c
goto :eof

:clean
echo ========================================
echo Cleaning Up...
echo ========================================
docker-compose -f %COMPOSE_FILE% down -v
if errorlevel 1 exit /b 1
echo Cleanup completed
goto :eof

:help
echo.
echo Usage: docker-deploy.bat [dev^|prod] [command]
echo.
echo Commands:
echo   check         - Check if dependencies are installed
echo   setup         - Setup environment files
echo   build         - Build images with no cache
echo   build-dev     - Build images with cache
echo   up            - Start services
echo   down          - Stop services
echo   restart       - Restart services
echo   logs          - Show logs (logs [service])
echo   shell         - Open shell in service (shell [service])
echo   status        - Show service status
echo   health        - Test service health
echo   clean         - Remove all containers and volumes
echo   help          - Show this help message
echo.
echo Examples:
echo   docker-deploy.bat dev up
echo   docker-deploy.bat prod build
echo   docker-deploy.bat dev logs backend
echo   docker-deploy.bat prod shell frontend
echo.
goto :eof

REM Main execution
call :check_dependencies

if "%COMMAND%"=="check" (
    goto :eof
)

call :setup_env

if "%COMMAND%"=="setup" (
    goto :eof
)

if "%COMMAND%"=="build" (
    call :build
) else if "%COMMAND%"=="build-dev" (
    call :build_dev
) else if "%COMMAND%"=="up" (
    call :up
) else if "%COMMAND%"=="down" (
    call :down
) else if "%COMMAND%"=="restart" (
    call :restart
) else if "%COMMAND%"=="logs" (
    call :logs %*
) else if "%COMMAND%"=="shell" (
    call :shell %*
) else if "%COMMAND%"=="status" (
    call :status
) else if "%COMMAND%"=="health" (
    call :health
) else if "%COMMAND%"=="clean" (
    call :clean
) else (
    call :help
)

endlocal
