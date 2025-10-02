@echo off
echo Starting simple web server for CVCWVUAA website...
echo.
echo Your website will be available at: http://localhost:8080
echo Admin dashboard: http://localhost:8080/admin/index.html
echo Mailchimp test: http://localhost:8080/mailchimp-debug.html
echo.
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"

:: Try different methods to start a web server
where python >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo Using Python web server...
    python -m http.server 8080
    goto :end
)

where php >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo Using PHP web server...
    php -S localhost:8080
    goto :end
)

where node >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo Using Node.js web server...
    npx http-server -p 8080
    goto :end
)

echo.
echo ERROR: No web server available!
echo Please install Python, PHP, or Node.js to run a local web server.
echo.
echo Alternative: Use Visual Studio Code with Live Server extension
echo.
pause

:end