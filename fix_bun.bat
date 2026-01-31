@echo off
taskkill /F /IM bun.exe /T >nul 2>&1
rd /s /q node_modules 2>nul
del /f /q bun.lockb 2>nul
rd /s /q %LOCALAPPDATA%\bun-cache 2>nul
netsh winsock reset
echo "清理完成，请立即重启电脑以解除内核死锁！"
pause