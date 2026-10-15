@echo off
rem ===========================================================================
rem  Campus Arena - generate your release keystore (+ CSR)
rem
rem  NOTE ON ENCODING: saved as GBK (cp936) with CRLF line endings so cmd.exe,
rem  which parses .cmd in the OEM codepage, both displays and parses it
rem  correctly. Editing it with a UTF-8/LF editor WILL break it.
rem
rem  Idempotent: it inspects what already exists and only does what is missing.
rem    both files present      -> nothing to do
rem    .p12 only               -> generate just the CSR (one password prompt)
rem    nothing                 -> generate keystore, then CSR
rem ===========================================================================
setlocal EnableExtensions
chcp 936 >nul 2>&1
cd /d "%~dp0..\.."
set "PROJECT_ROOT=%CD%"
set "KEYTOOL=C:\Program Files\Huawei\DevEco Studio\jbr\bin\keytool.exe"
set "KEYDIR=%PROJECT_ROOT%\signing-keys"
set "ALIAS=campusarena-release"
set "DNAME=C=CN, O=CampusArena, OU=CampusArena Dev, CN=CampusArena Release"

if not exist "%KEYTOOL%" (
  echo [错误] 找不到 keytool：
  echo        %KEYTOOL%
  echo        请确认已安装 DevEco Studio。
  echo.
  pause
  exit /b 1
)

set "HAVE_P12=0"
set "HAVE_CSR=0"
if exist "%KEYDIR%\campusarena.p12" set "HAVE_P12=1"
if exist "%KEYDIR%\campusarena.csr" set "HAVE_CSR=1"

if "%HAVE_P12%%HAVE_CSR%"=="11" goto :all_done
if "%HAVE_P12%"=="1" goto :only_csr

rem ------------------------------------------------------------------ full run
if not exist "%KEYDIR%" mkdir "%KEYDIR%"

cls
echo ============================================================
echo   生成发布密钥库
echo ============================================================
echo.
echo 马上要做两件事：
echo.
echo   1^) 生成密钥库 campusarena.p12
echo      会请你输入一个口令，需要输两遍
echo.
echo   2^) 用这个密钥生成证书请求文件 campusarena.csr
echo      会再请你输入一遍同样的口令
echo.
echo ------------------------------------------------------------
echo  关于口令：
echo    - 自己随便想一个，记得住就行，例如 Sanda2026!schedule
echo    - 输入时屏幕上不会显示任何字符，这是正常的
echo    - 请立刻把它记到手机备忘录或其他安全的地方
echo.
echo  ！！口令丢了无法找回！！
echo  只能重新申请证书，而且已经上架的包永远无法再更新。
echo ------------------------------------------------------------
echo.
echo 准备好了就按任意键开始。
echo ^(想先把口令想好、记下来，就先别按。^)
echo.
pause >nul

"%KEYTOOL%" -genkeypair ^
  -alias "%ALIAS%" ^
  -keyalg EC -groupname secp256r1 ^
  -keystore "%KEYDIR%\campusarena.p12" ^
  -storetype PKCS12 ^
  -validity 3650 ^
  -dname "%DNAME%"

rem keytool 的退出码在非交互输入下不可靠，所以按文件是否真的存在来判断
if not exist "%KEYDIR%\campusarena.p12" (
  echo.
  echo [失败] 密钥库没有生成成功。
  echo        没有产生任何可用文件，可以直接关掉窗口重新运行本脚本。
  echo.
  pause
  exit /b 1
)

cls
echo ============================================================
echo   密钥库已生成 ^(第 1 步完成^)
echo ============================================================
echo.
echo 现在生成证书请求文件。
echo 请再输入一遍 同样的口令。
echo.
goto :make_csr

rem --------------------------------------------------- keystore already exists
:only_csr
cls
echo ============================================================
echo   补生成证书请求文件
echo ============================================================
echo.
echo 检测到密钥库已经存在：
echo   %KEYDIR%\campusarena.p12
echo.
echo 但证书请求文件还没有，现在只补生成它。
echo 请再输入一遍 你的密钥库口令。
echo.
echo ^(如果提示口令错误，说明这次输的和上次设的不一样，重跑本脚本即可。^)
echo.

:make_csr
"%KEYTOOL%" -certreq ^
  -alias "%ALIAS%" ^
  -keystore "%KEYDIR%\campusarena.p12" ^
  -file "%KEYDIR%\campusarena.csr"

if not exist "%KEYDIR%\campusarena.csr" (
  echo.
  echo [失败] 证书请求文件没有生成。
  echo.
  echo 最常见的原因：口令输错了。
  echo 密钥库本身是好的，不用重新生成，直接重跑本脚本再试一次就行。
  echo.
  echo 如果反复失败，把下面这一行发给 AI 助手：
  echo   "%KEYTOOL%" -certreq -alias %ALIAS% -keystore "%KEYDIR%\campusarena.p12" -file "%KEYDIR%\campusarena.csr"
  echo.
  pause
  exit /b 1
)

rem -------------------------------------------------------------------- success
:all_done
cls
echo ============================================================
echo   完成
echo ============================================================
echo.
echo 两个文件都已就绪：
echo.
echo   %KEYDIR%\campusarena.p12
echo       ^^-- 私钥，务必备份，不要外传
echo.
echo   %KEYDIR%\campusarena.csr
echo       ^^-- 证书请求文件，申请证书用
echo.
echo ------------------------------------------------------------
echo  别忘了：口令记到手机备忘录里！
echo ------------------------------------------------------------
echo.
echo 下一步：
echo   回 AI 助手那边说一声「好了」，
echo   它会帮你申请证书、申请 Profile、重新签名并上传。
echo.
pause
exit /b 0
