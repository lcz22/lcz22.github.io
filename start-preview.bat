@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
  start "人生支线 · 本地预览" cmd /k "py -3 -m http.server 4173 --bind 127.0.0.1"
  timeout /t 1 >nul
  start "" "http://127.0.0.1:4173/"
  exit /b
)

where python >nul 2>nul
if %errorlevel%==0 (
  start "人生支线 · 本地预览" cmd /k "python -m http.server 4173 --bind 127.0.0.1"
  timeout /t 1 >nul
  start "" "http://127.0.0.1:4173/"
  exit /b
)

where node >nul 2>nul
if %errorlevel%==0 (
  start "人生支线 · 本地预览" cmd /k "node preview-server.mjs"
  timeout /t 1 >nul
  start "" "http://127.0.0.1:4173/"
  exit /b
)

echo 没有找到 Python 或 Node.js。
echo 请在项目目录运行任意静态服务器，例如：
echo   py -3 -m http.server 4173 --bind 127.0.0.1
pause
