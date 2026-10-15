@echo off
rem ===========================================================================
rem  Campus Arena - core algorithm verification
rem
rem  Type-erases the real entry/src/main/ets/model sources with the TypeScript
rem  compiler bundled in DevEco Studio, then runs tools\logic-test\tests.mjs
rem  against the compiled JavaScript. This exercises the shipped code, not a
rem  re-implementation.
rem ===========================================================================
setlocal EnableExtensions

for %%i in ("%~dp0..\..") do set "PROJECT_ROOT=%%~fi"
set "TSC=%ProgramFiles%\Huawei\DevEco Studio\sdk\default\openharmony\ets\build-tools\ets-loader\node_modules\typescript\bin\tsc"
set "NODE=%ProgramFiles%\Huawei\DevEco Studio\tools\node\node.exe"
set "SRC=%PROJECT_ROOT%\entry\src\main\ets\model"
set "WORK=%PROJECT_ROOT%\.logic-test"

if not exist "%TSC%" (
  echo [logic-test] ERROR: bundled tsc not found at "%TSC%"
  exit /b 1
)
if not exist "%NODE%" (
  echo [logic-test] ERROR: bundled node not found at "%NODE%"
  exit /b 1
)

if exist "%WORK%" rmdir /s /q "%WORK%"
mkdir "%WORK%\src" 2>nul
mkdir "%WORK%\out" 2>nul

rem .ets -> .ts (the model layer is plain TypeScript, no ArkUI decorators)
copy /y "%SRC%\Types.ets"     "%WORK%\src\Types.ts"     >nul
copy /y "%SRC%\Scheduler.ets" "%WORK%\src\Scheduler.ts" >nul

pushd "%WORK%"
"%NODE%" "%TSC%" --module commonjs --target es2020 --moduleResolution node ^
  --strict false --skipLibCheck --outDir "%WORK%\out" ^
  "%WORK%\src\Types.ts" "%WORK%\src\Scheduler.ts"
if errorlevel 1 (
  echo [logic-test] TypeScript compilation of the model layer FAILED.
  popd
  exit /b 1
)
popd

pushd "%~dp0"
"%NODE%" "%~dp0tests.mjs"
set "RC=%ERRORLEVEL%"
popd
exit /b %RC%
