@echo off
rem ===========================================================================
rem  Campus Arena - step 3: sign the .app with YOUR release certificate
rem
rem  NOTE ON ENCODING: saved as GBK (cp936) with CRLF line endings so cmd.exe
rem  displays and parses it correctly. Do not re-save as UTF-8/LF.
rem
rem  Run this only AFTER:
rem    - signing-keys\campusarena.p12   exists  (01-generate-keystore.cmd)
rem    - signing-keys\campusarena.cer   exists  (release certificate from AGC)
rem    - signing-keys\campusarena.p7b   exists  (release Profile from AGC)
rem
rem  It asks for your keystore password without echoing it, writes
rem  credentials.json, then runs sign-release.cmd.
rem ===========================================================================
setlocal EnableExtensions
chcp 936 >nul 2>&1
cd /d "%~dp0..\.."
set "PROJECT_ROOT=%CD%"
set "SIGN_DIR=%PROJECT_ROOT%\tools\signing"
set "KEYDIR=%PROJECT_ROOT%\signing-keys"
set "PS=powershell"
set "NODE=C:\Program Files\Huawei\DevEco Studio\tools\node\node.exe"

echo.
echo ============================================================
echo   用你的发布证书签名打包
echo ============================================================
echo.

rem ---- 前置检查 -------------------------------------------------------------
set "MISSING=0"
if not exist "%KEYDIR%\campusarena.p12" (
  echo [缺少] 密钥库：%KEYDIR%\campusarena.p12
  echo        请先运行 01-generate-keystore.cmd
  set "MISSING=1"
)
if not exist "%KEYDIR%\campusarena.cer" (
  echo [缺少] 发布证书：%KEYDIR%\campusarena.cer
  echo        需要先在 AGC 申请发布证书并下载
  set "MISSING=1"
)
if not exist "%KEYDIR%\campusarena.p7b" (
  echo [缺少] 发布 Profile：%KEYDIR%\campusarena.p7b
  echo        需要先在 AGC 申请发布 Profile 并下载
  set "MISSING=1"
)
if "%MISSING%"=="1" (
  echo.
  echo 三个文件齐了再回来跑本脚本。或者把这一屏发给 AI 助手。
  echo.
  pause
  exit /b 1
)

echo 已找到三个文件：密钥库 / 发布证书 / 发布 Profile。
echo.
echo 接下来会让你输入 密钥库口令。
echo   - 输入时屏幕上不显示任何字符，这是正常的
echo   - 这个口令不会显示在屏幕上，也不会经过命令行
echo   - 它只会写进 credentials.json（该文件已被 .gitignore 排除）
echo.
pause

rem ---- 安全读口令并写 credentials.json --------------------------------------
"%PS%" -NoProfile -ExecutionPolicy Bypass -File "%SIGN_DIR%\write-credentials.ps1" -KeyDir "%KEYDIR%" -OutFile "%SIGN_DIR%\credentials.json"
if not exist "%SIGN_DIR%\credentials.json" (
  echo.
  echo [失败] credentials.json 没有生成，签名中止。
  echo.
  pause
  exit /b 1
)

rem ---- 签名打包 -------------------------------------------------------------
echo.
echo ============================================================
echo   开始签名打包
echo ============================================================
echo.
call "%SIGN_DIR%\sign-release.cmd"
set "RC=%ERRORLEVEL%"
if not "%RC%"=="0" (
  echo.
  echo [失败] 签名打包没有成功，退出码 %RC%。
  echo        把上面最后 20 行发给 AI 助手。
  echo.
  pause
  exit /b %RC%
)

echo.
echo ============================================================
echo   完成
echo ============================================================
echo.
if exist "%PROJECT_ROOT%\dist" (
  echo 已签名产物：
  dir /b "%PROJECT_ROOT%\dist\*.app"
  echo.
  echo 路径：%PROJECT_ROOT%\dist\
) else (
  echo [注意] 没有找到 dist 目录，请检查上面的输出。
)
echo.
echo ------------------------------------------------------------
echo  安全提示：credentials.json 里存着明文口令。
echo  上架完成后可以删掉它，需要重新签名时再跑一次本脚本即可。
echo ------------------------------------------------------------
echo.
echo 下一步：回 AI 助手那边说一声，它会帮你上传并提交审核。
echo.
pause
exit /b 0
