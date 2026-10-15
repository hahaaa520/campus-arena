@echo off
rem ===========================================================================
rem  Campus Arena - full verification
rem
rem  ASCII-only on purpose: cmd.exe parses .cmd files in the OEM codepage
rem  (936 here), so CJK comments break parsing.
rem
rem  Runs every check that can be done without a Huawei developer account:
rem    1. ArkTS compile + HAP package
rem    2. .app package (the format AppGallery accepts)
rem    3. core algorithm test suite against the real shipped sources
rem    4. artifact sanity checks (metadata, permissions, debug flag, sizes)
rem
rem  Exit-code note: hvigor reports failure with exit code -1, and
rem  `IF ERRORLEVEL 1` is FALSE for -1 (it tests >= 1). So every step captures
rem  the code into a variable and compares it as a STRING against "0".
rem  A verification script that reports success on a failed build is worse
rem  than no script at all.
rem
rem  Usage:  tools\verify-all.cmd
rem ===========================================================================
setlocal EnableExtensions
cd /d "%~dp0.."
set "PROJECT_ROOT=%CD%"
set "PY=%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"

set "HAP=%PROJECT_ROOT%\entry\build\default\outputs\default\entry-default-unsigned.hap"
set "APP=%PROJECT_ROOT%\build\outputs\default\CampusArena-default-unsigned.app"
set "FAILED=0"

echo.
echo ============================================================
echo  1/4  Compiling ArkTS and packaging HAP
echo ============================================================
del /q "%HAP%" >nul 2>&1
call "%PROJECT_ROOT%\tools\build.cmd" assembleHap --no-daemon
set "RC=%ERRORLEVEL%"
if not "%RC%"=="0" (
  echo [FAIL] HAP build  ^(exit %RC%^)
  set "FAILED=1"
) else (
  if exist "%HAP%" (
    echo [ OK ] HAP build
  ) else (
    echo [FAIL] HAP build reported success but produced no HAP
    set "FAILED=1"
  )
)

echo.
echo ============================================================
echo  2/4  Packaging .app  (AppGallery submission format^)
echo ============================================================
del /q "%APP%" >nul 2>&1
call "%PROJECT_ROOT%\tools\build.cmd" assembleApp --no-daemon
set "RC=%ERRORLEVEL%"
if not "%RC%"=="0" (
  echo [FAIL] APP build  ^(exit %RC%^)
  set "FAILED=1"
) else (
  if exist "%APP%" (
    echo [ OK ] APP build
  ) else (
    echo [FAIL] APP build reported success but produced no .app
    set "FAILED=1"
  )
)

echo.
echo ============================================================
echo  3/4  Core algorithm test suite
echo ============================================================
call "%PROJECT_ROOT%\tools\logic-test\run-tests.cmd"
set "RC=%ERRORLEVEL%"
if not "%RC%"=="0" (
  echo [FAIL] algorithm tests  ^(exit %RC%^)
  set "FAILED=1"
) else (
  echo [ OK ] algorithm tests
)

echo.
echo ============================================================
echo  4/4  Artifact sanity checks
echo ============================================================
if exist "%PY%" (
  "%PY%" "%PROJECT_ROOT%\tools\verify-artifacts.py"
  set "RC=%ERRORLEVEL%"
  if not "%RC%"=="0" (
    echo [FAIL] artifact checks  ^(exit %RC%^)
    set "FAILED=1"
  ) else (
    echo [ OK ] artifact checks
  )
) else (
  echo [FAIL] bundled python not found at "%PY%"
  set "FAILED=1"
)

echo.
echo ============================================================
if "%FAILED%"=="0" (
  echo  ALL CHECKS PASSED
) else (
  echo  SOME CHECKS FAILED - see [FAIL] lines above
)
echo ============================================================
exit /b %FAILED%
