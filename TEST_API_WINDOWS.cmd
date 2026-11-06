@echo off
cd /d "%~dp0"
echo Start RUN_WINDOWS.cmd first and keep the API server open.
echo Testing http://127.0.0.1:3001/api...
node tools\smoke-api.mjs
pause
