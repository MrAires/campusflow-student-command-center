@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Node.js not found. Install Node.js 20 or later from https://nodejs.org
 pause
 exit /b 1
)
echo CAMPUSFLOW - One click setup
node tools\setup.mjs
if not exist "node_modules\vite\bin\vite.js" (
 echo Installing project dependencies...
 call npm install
 if errorlevel 1 (
   echo npm installation failed. Check your internet connection.
   pause
   exit /b 1
 )
)
echo.
echo Make sure MongoDB Server is running on localhost:27017.
echo Opening CampusFlow at http://127.0.0.1:5173
echo Keep this window open. Press Ctrl+C to stop.
start "CampusFlow Browser" cmd /c "timeout /t 7 /nobreak >nul & start http://127.0.0.1:5173"
call npm run dev
pause
