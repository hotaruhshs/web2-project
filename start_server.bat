@echo off
echo Starting PHP Development Server...
echo.
echo Open your browser and go to: http://127.0.0.1:8000
echo.
echo Direct access to pages:
echo - Homepage: http://127.0.0.1:8000/index.html
echo - Products: http://127.0.0.1:8000/products.html
echo - Login: http://127.0.0.1:8000/login.html
echo - Register: http://127.0.0.1:8000/register.html
echo.
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0"
C:\Users\carme\Downloads\php-8.4.10-Win32-vs17-x64\php.exe -S 127.0.0.1:8000
pause
