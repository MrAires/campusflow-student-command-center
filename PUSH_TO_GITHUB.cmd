@echo off
setlocal
cd /d "%~dp0"
where git >nul 2>nul
if errorlevel 1 (
 echo Git not found. Install from https://git-scm.com/downloads/win
 pause
 exit /b 1
)
echo.
echo CAMPUSFLOW - GitHub publish helper
 echo First create an EMPTY PUBLIC GitHub repository at https://github.com/new
 echo Suggested name: campusflow-student-command-center
 echo Do NOT tick README or .gitignore on GitHub.
echo.
set /p GIT_USER=Your GitHub username [MrAires]:
if "%GIT_USER%"=="" set "GIT_USER=MrAires"
set /p GIT_EMAIL=Your Git commit email [rksheeraj@gmail.com]:
if "%GIT_EMAIL%"=="" set "GIT_EMAIL=rksheeraj@gmail.com"
if not exist ".git" git init -b main
git config user.name "%GIT_USER%"
git config user.email "%GIT_EMAIL%"
git add .
git diff --cached --quiet
if errorlevel 1 (
 git commit -m "Build CampusFlow full stack student dashboard"
 if errorlevel 1 goto :error
)
git branch -M main
set /p REPO_URL=Paste EMPTY GitHub repository HTTPS URL:
if "%REPO_URL%"=="" goto :error
git remote get-url origin >nul 2>nul
if errorlevel 1 (git remote add origin "%REPO_URL%") else (git remote set-url origin "%REPO_URL%")
git push -u origin main
if errorlevel 1 goto :error
echo.
echo SUCCESS. Open the repository in your browser and verify your files.
pause
exit /b 0
:error
echo.
echo Could not publish. Check the GitHub URL, authentication, and error message above.
pause
exit /b 1
