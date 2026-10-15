@echo off
rem ============================================================================
rem  Campus Arena - hvigor build launcher  (ASCII-only on purpose: cmd.exe
rem  parses .cmd files in the OEM codepage, so CJK comments would break it.)
rem
rem  hvigorw.bat cannot be used as-is in this workspace for two reasons:
rem    1. it fetches @ohos/hvigor from a registry instead of using the copy
rem       bundled with DevEco Studio;
rem    2. its project-path validator rejects the CJK workspace path,
rem       aborting with "Invalid project path".
rem  This launcher resolves hvigor from the DevEco Studio installation and
rem  preloads tools\hvigor-nonascii-path-patch.js (NODE_OPTIONS=--require) to
rem  neutralise that one validation. Nothing outside this project is modified.
rem
rem  Usage:
rem    tools\build.cmd assembleHap --no-daemon
rem    tools\build.cmd assembleApp --mode module -p product=default -p buildMode=release
rem    tools\build.cmd clean
rem ============================================================================
setlocal EnableExtensions

for %%i in ("%~dp0..") do set "PROJECT_ROOT=%%~fi"
set "DEVECO_ROOT=C:\Program Files\Huawei\DevEco Studio"
set "HVIGOR_BIN=%DEVECO_ROOT%\tools\hvigor\hvigor\bin\hvigor.js"
set "DEPS=%PROJECT_ROOT%\.hvigor_deps\node_modules"

if not exist "%HVIGOR_BIN%" (
  echo [build.cmd] ERROR: bundled hvigor not found at "%HVIGOR_BIN%"
  echo [build.cmd] Install DevEco Studio or update DEVECO_ROOT in this script.
  exit /b 1
)

if not exist "%DEPS%\@ohos\hvigor" (
  if not exist "%DEPS%\@ohos" mkdir "%DEPS%\@ohos"
  mklink /J "%DEPS%\@ohos\hvigor" "%DEVECO_ROOT%\tools\hvigor\hvigor" >nul
  mklink /J "%DEPS%\@ohos\hvigor-ohos-plugin" "%DEVECO_ROOT%\tools\hvigor\hvigor-ohos-plugin" >nul
)

rem PackageHap / HapSignTool are Java programs. DevEco ships a JBR, so we reuse
rem it and no system-wide Java installation is required.
set "JAVA_HOME=%DEVECO_ROOT%\jbr"
set "DEVECO_SDK_HOME=%DEVECO_ROOT%\sdk"
set "NODE_HOME=%DEVECO_ROOT%\tools\node"
set "NODE_PATH=%DEPS%"
set "NODE_OPTIONS=--require %PROJECT_ROOT%\tools\hvigor-nonascii-path-patch.js"
set "PATH=%JAVA_HOME%\bin;%NODE_HOME%;%PATH%"

pushd "%PROJECT_ROOT%"
node "%HVIGOR_BIN%" %*
set "RC=%ERRORLEVEL%"
popd
exit /b %RC%
