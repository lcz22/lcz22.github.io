@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
  echo 正在创建 Python 虚拟环境...
  py -3 -m venv .venv 2>nul
  if errorlevel 1 python -m venv .venv
)

if not exist ".venv\Scripts\python.exe" (
  echo 没有找到 Python，请先安装 Python 3.11 或更高版本。
  pause
  exit /b 1
)

call ".venv\Scripts\activate.bat"
python -m pip install -q -r requirements.txt
if errorlevel 1 (
  echo 依赖安装失败，请检查网络或 pip 配置。
  pause
  exit /b 1
)

echo.
echo 杭电支线 API: http://127.0.0.1:8000
echo Swagger 文档: http://127.0.0.1:8000/docs
echo.
echo 首次使用请在另一个终端执行：
echo   python -m app.seed
echo   python -m app.create_admin admin admin@example.com "你的管理员密码"
echo.
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
