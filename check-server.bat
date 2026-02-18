@echo off
echo Checking if server is running on port 5000...
echo.

curl -s http://localhost:5000/api/jobs >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Server is running!
    echo.
    echo Testing signup endpoint...
    curl -X POST http://localhost:5000/api/auth/signup -H "Content-Type: application/json" -d "{\"name\":\"Test\",\"email\":\"test@test.com\",\"password\":\"test123\"}"
) else (
    echo ✗ Server is NOT running!
    echo.
    echo Please start the server first:
    echo   npm start
)
echo.
pause
