@echo off
rem ============================================================================
rem  Campus Arena - release signing orchestrator
rem  (ASCII-only on purpose: cmd.exe parses .cmd in the OEM codepage, and label
rem   lookup requires CRLF line endings.)
rem
rem  Usage:
rem    tools\signing\sign-release.cmd                 use tools\signing\credentials.json
rem    tools\signing\sign-release.cmd --gen-chain     regenerate the throwaway
rem                                                   local-test chain first,
rem                                                   then sign with it
rem    tools\signing\sign-release.cmd --keep-config   leave signingConfigs in
rem                                                   build-profile.json5 set
rem                                                   (default: restore it)
rem
rem  Steps:
rem    1. optionally regenerate tools\signing\local-test\
rem    2. prepare-signing.mjs -> rewrite signingConfigs in build-profile.json5
rem    3. build.cmd assembleApp --no-daemon  (SignHap + SignApp run for real)
rem    4. copy the signed .app into dist\ with a dated name
rem    5. hap-sign-tool verify-app against the .app that was produced
rem    6. prepare-signing.mjs with no credentials -> signingConfigs back to []
rem
rem  Requires tools\signing\credentials.json (see credentials.example.json).
rem ============================================================================
setlocal EnableExtensions

for %%i in ("%~dp0..\..") do set "PROJECT_ROOT=%%~fi"
set "SIGN_DIR=%~dp0"
set "DEVECO_ROOT=C:\Program Files\Huawei\DevEco Studio"
set "NODE=%DEVECO_ROOT%\tools\node\node.exe"
set "JAVA=%DEVECO_ROOT%\jbr\bin\java.exe"
set "TOOL=%DEVECO_ROOT%\sdk\default\openharmony\toolchains\lib\hap-sign-tool.jar"
set "BUILD=%PROJECT_ROOT%\tools\build.cmd"
set "CRED=%SIGN_DIR%credentials.json"
set "DIST=%PROJECT_ROOT%\dist"
set "OUTDIR=%PROJECT_ROOT%\build\outputs\default"
set "SIGNED_APP=%OUTDIR%\CampusArena-default-signed.app"

set "DO_GEN=0"
set "KEEP_CONFIG=0"
set "RC=0"
:parse
if "%~1"=="" goto :parsed
if /i "%~1"=="--gen-chain"   set "DO_GEN=1"
if /i "%~1"=="--keep-config" set "KEEP_CONFIG=1"
shift
goto :parse
:parsed

if not exist "%JAVA%" (
  echo [sign-release] ERROR: DevEco Studio not found at "%DEVECO_ROOT%"
  exit /b 1
)

if "%DO_GEN%"=="1" (
  echo [sign-release] step 1: regenerating the throwaway local test chain
  call "%SIGN_DIR%generate-local-test-chain.cmd" || goto :fail
) else (
  echo [sign-release] step 1: skipped ^(pass --gen-chain to regenerate the test chain^)
)

if not exist "%CRED%" (
  echo [sign-release] ERROR: no credentials file at "%CRED%"
  echo [sign-release]        copy credentials.example.json to credentials.json and fill it in.
  goto :fail
)

echo.
echo [sign-release] step 2: rewriting signingConfigs in build-profile.json5
"%NODE%" "%SIGN_DIR%prepare-signing.mjs" || goto :fail

echo.
echo [sign-release] step 3: assembleApp with release signing
rem remove the previous artifact so a stale signed .app can never be mistaken
rem for a fresh one
if exist "%SIGNED_APP%" del /q "%SIGNED_APP%"
cmd /c ""%BUILD%" assembleApp --no-daemon"
set "RC=%ERRORLEVEL%"
if not "%RC%"=="0" (
  echo [sign-release] ERROR: build failed with exit code %RC%
  goto :restore
)

if not exist "%SIGNED_APP%" (
  echo [sign-release] ERROR: no signed .app was produced at
  echo [sign-release]        %SIGNED_APP%
  echo [sign-release]        Check the build log for "Will skip sign".
  set "RC=1"
  goto :restore
)

echo.
echo [sign-release] step 4: publishing to dist\
if not exist "%DIST%" mkdir "%DIST%"
rem Stable name on purpose: one artefact path that docs and CI can rely on.
rem (A date-stamped name needs locale-dependent %DATE% parsing or spawning a
rem  helper inside for /f, neither of which is worth the fragility.)
set "PUBLISHED=%DIST%\CampusArena-release-signed.app"
copy /y "%SIGNED_APP%" "%PUBLISHED%" >nul
if errorlevel 1 (
  echo [sign-release] ERROR: could not copy to %PUBLISHED%
  set "RC=1"
  goto :restore
)
echo [sign-release] wrote %PUBLISHED%

echo.
echo [sign-release] step 5: verifying the signature with hap-sign-tool
"%JAVA%" -jar "%TOOL%" verify-app -inFile "%SIGNED_APP%" ^
  -outCertChain "%SIGN_DIR%local-test\verify-app-certchain.cer" ^
  -outProfile "%SIGN_DIR%local-test\verify-app-profile.p7b"
if errorlevel 1 (
  echo [sign-release] ERROR: verify-app failed - the .app is NOT validly signed
  set "RC=1"
  goto :restore
)
echo [sign-release] verify-app: Verify success

:restore
echo.
if "%KEEP_CONFIG%"=="1" (
  echo [sign-release] step 6: leaving signingConfigs in place ^(--keep-config^)
) else (
  echo [sign-release] step 6: restoring build-profile.json5 ^(signingConfigs = []^)
  "%NODE%" "%SIGN_DIR%prepare-signing.mjs" --no-credentials
)
echo.
if not "%RC%"=="0" (
  echo [sign-release] FAILED
  exit /b %RC%
)
echo [sign-release] DONE
exit /b 0

:fail
echo [sign-release] FAILED
exit /b 1
