@echo off
rem ===========================================================================
rem  Campus Arena - capture AppGallery screenshots with the DevEco Previewer
rem
rem  ASCII-only on purpose: cmd.exe parses .cmd in the OEM codepage (936 here)
rem  and CJK comments corrupt parsing. Chinese docs live in README.md.
rem
rem  Renders the REAL app with the DevEco Previewer engine (no GUI, no window,
rem  no emulator) at 1920x1080 on a 2in1 device profile, drives the left nav
rem  with injected mouse events, and writes one JPEG per page.
rem
rem  PREREQUISITE - build the preview artifacts once (and whenever the app
rem  source changes). This command prints BUILD SUCCESSFUL and then STAYS IN
rem  WATCH MODE; press Ctrl+C once modules.abc exists:
rem
rem    tools\build.cmd --mode module -p module=entry@default -p product=default
rem      -p buildRoot=.preview -p previewer.replace.page=pages/Index
rem      -p previewer.replace.srcPath=entry/src/main/ets PreviewBuild --no-daemon
rem
rem  Usage:
rem    tools\capture-screenshots\run.cmd
rem ===========================================================================
setlocal EnableExtensions

for %%i in ("%~dp0..\..") do set "PROJECT_ROOT=%%~fi"
set "NODE=%ProgramFiles%\Huawei\DevEco Studio\tools\node\node.exe"
set "HERE=%~dp0"

if not exist "%NODE%" (
  echo [shots] ERROR: bundled node not found at "%NODE%"
  exit /b 1
)

set "ABC=%PROJECT_ROOT%\entry\.preview\default\intermediates\loader_out\default\ets\modules.abc"
if not exist "%ABC%" (
  echo [shots] ERROR: preview artifacts missing:
  echo         %ABC%
  echo.
  echo [shots] Run the PreviewBuild command in the header of run.cmd first.
  exit /b 1
)

echo.
echo === Capturing screenshots (1920x1080, 2in1) ===
"%NODE%" "%HERE%shoot.js" "%HERE%shots.json"
if errorlevel 1 (
  echo [shots] capture FAILED
  exit /b 1
)

echo.
echo === Installing into the AppGallery submission pack ===
"%NODE%" "%HERE%install-shots.mjs"
if errorlevel 1 exit /b 1

echo.
echo Done.
exit /b 0
