@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\Test-Unreal.ps1" %*
set "WNT_TEST_EXIT=%ERRORLEVEL%"
if not "%WNT_TEST_EXIT%"=="0" pause
exit /b %WNT_TEST_EXIT%
