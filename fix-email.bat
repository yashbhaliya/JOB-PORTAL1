@echo off
REM Email Fix Script for Job Portal (Windows)

echo ========================================
echo    Job Portal - Email Fix Script
echo ========================================
echo.

if "%1"=="" (
    echo ERROR: Gmail App Password not provided
    echo.
    echo INSTRUCTIONS:
    echo.
    echo 1. Generate Gmail App Password:
    echo    - Open: https://myaccount.google.com/apppasswords
    echo    - Login: bhaliyayash595@gmail.com
    echo    - App: Mail ^| Device: Other -^> 'JobPortal2024'
    echo    - Click Generate
    echo    - Copy 16-digit code ^(remove spaces^)
    echo.
    echo 2. Run this script with your new password:
    echo    fix-email.bat YOUR_16_DIGIT_PASSWORD
    echo.
    echo Example:
    echo    fix-email.bat abcdefghijklmnop
    echo.
    pause
    exit /b 1
)

set NEW_PASSWORD=%1

echo New password received: ***%NEW_PASSWORD:~-4%
echo.

echo Updating backend\.env file...
cd backend

REM Create temp file with updated password
powershell -Command "(Get-Content .env) -replace 'MAIL_PASS=.*', 'MAIL_PASS=%NEW_PASSWORD%' | Set-Content .env.tmp"
move /y .env.tmp .env >nul

echo Local .env updated
echo.

echo Testing email configuration...
node test-email.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo    SUCCESS! Email is working!
    echo ========================================
    echo.
    echo NEXT STEPS:
    echo.
    echo 1. Update Render.com:
    echo    - Go to: https://dashboard.render.com
    echo    - Click: job-portal1-rcvc
    echo    - Click: Environment tab
    echo    - Edit MAIL_PASS
    echo    - Paste: %NEW_PASSWORD%
    echo    - Click: Save Changes
    echo.
    echo 2. Wait 2-3 minutes for Render to redeploy
    echo.
    echo 3. Test your live site:
    echo    - https://job-portal1-rcvc.onrender.com
    echo.
    echo Your authentication system is now fully working!
    echo.
) else (
    echo.
    echo Email test failed. Please check:
    echo    1. Password is correct ^(16 digits, no spaces^)
    echo    2. 2-Step Verification is enabled on Gmail
    echo    3. App Password was just generated
    echo.
)

pause
