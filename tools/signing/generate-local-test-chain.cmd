@echo off
rem ============================================================================
rem  Campus Arena - throwaway self-signed signing chain generator
rem  (ASCII-only on purpose: cmd.exe parses .cmd files in the OEM codepage,
rem   and label lookup additionally requires CRLF line endings.)
rem
rem  Produces, under tools\signing\local-test\ :
rem    campusarena-test.p12              app signing key store (throwaway)
rem    campusarena-app-key-v1.csr        certificate signing request (only
rem                                      needed when a real CA issues the cert)
rem    campusarena-app-release.cer       app signing certificate chain
rem    campusarena-profile-release.json  rendered provision profile
rem    campusarena-profile-release.p7b   SIGNED provision profile
rem    material\                         hvigor password-decryption material
rem    profile-verify.json               verify-profile output
rem
rem  The chain is: OpenHarmony Application Root CA
rem                 -> OpenHarmony Application CA
rem                   -> CN=CampusArena Release (our throwaway leaf key)
rem  The root/sub CA private keys live in DevEco Studio's bundled
rem  OpenHarmony.p12 (alias "openharmony application ca", password 123456).
rem  NOTHING inside the DevEco Studio installation is ever written to.
rem
rem  Usage:  tools\signing\generate-local-test-chain.cmd
rem ============================================================================
setlocal EnableExtensions

set "DEVECO_ROOT=C:\Program Files\Huawei\DevEco Studio"
if not exist "%DEVECO_ROOT%\jbr\bin\java.exe" (
  echo [gen-chain] ERROR: DevEco Studio not found at "%DEVECO_ROOT%"
  exit /b 1
)
if not exist "%DEVECO_ROOT%\tools\node\node.exe" (
  echo [gen-chain] ERROR: bundled node not found
  exit /b 1
)

set "JAVA=%DEVECO_ROOT%\jbr\bin\java.exe"
set "KEYTOOL=%DEVECO_ROOT%\jbr\bin\keytool.exe"
set "NODE=%DEVECO_ROOT%\tools\node\node.exe"
set "LIB=%DEVECO_ROOT%\sdk\default\openharmony\toolchains\lib"
set "TOOL=%LIB%\hap-sign-tool.jar"
set "BASE_P12=%LIB%\OpenHarmony.p12"
set "BASE_CA_ALIAS=openharmony application ca"
set "TMPL=%LIB%\UnsgnedReleasedProfileTemplate.json"

set "OUT=%~dp0local-test"
if not exist "%OUT%" mkdir "%OUT%"

rem ---- throwaway secrets (test chain only, never for a real release) --------
set "STORE_PWD=CampusArena_2024"
set "KEY_ALIAS=campusarena-app-key-v1"
set "KEY_PWD=CampusArena_2024"
set "BASE_PWD=123456"

set "BUNDLE_NAME=com.campusarena.scheduler"
set "DEVELOPER_ID=CampusArena"
set "ISSUER_CA=C=CN,O=OpenHarmony,OU=OpenHarmony Team,CN=OpenHarmony Application CA"
set "LEAF_SUBJECT=C=CN,O=CampusArena,OU=CampusArena Dev,CN=CampusArena Release"

echo [gen-chain] output dir: %OUT%

rem ---------------------------------------------------------------------------
rem 1. export the bundled CA certificates.
rem    DER, not PEM: hap-sign-tool rejects PEM with NOT_SUPPORT_ERROR.
rem ---------------------------------------------------------------------------
call :run "%KEYTOOL%" -exportcert -alias "openharmony application root ca" ^
  -keystore "%BASE_P12%" -storetype PKCS12 -storepass %BASE_PWD% ^
  -file "%OUT%\oh-root-ca.cer" || goto :fail
call :run "%KEYTOOL%" -exportcert -alias "cacert" ^
  -keystore "%BASE_P12%" -storetype PKCS12 -storepass %BASE_PWD% ^
  -file "%OUT%\oh-app-sign-ca.cer" || goto :fail

rem ---------------------------------------------------------------------------
rem 2. app signing key pair + CSR.
rem    The CSR is not needed for the local chain (hap-sign-tool issues the
rem    certificate straight from the keystore) but is produced so the same
rem    keystore can be handed to a real CA later.
rem ---------------------------------------------------------------------------
if exist "%OUT%\campusarena-test.p12" del /q "%OUT%\campusarena-test.p12"
call :run "%JAVA%" -jar "%TOOL%" generate-keypair ^
  -keyAlias "%KEY_ALIAS%" -keyPwd "%KEY_PWD%" -keyAlg ECC -keySize NIST-P-256 ^
  -keystoreFile "%OUT%\campusarena-test.p12" -keystorePwd "%STORE_PWD%" || goto :fail

call :run "%JAVA%" -jar "%TOOL%" generate-csr ^
  -keyAlias "%KEY_ALIAS%" -keyPwd "%KEY_PWD%" ^
  -subject "%LEAF_SUBJECT%" -signAlg SHA256withECDSA ^
  -keystoreFile "%OUT%\campusarena-test.p12" -keystorePwd "%STORE_PWD%" ^
  -outFile "%OUT%\campusarena-app-key-v1.csr" || goto :fail

rem ---------------------------------------------------------------------------
rem 3. issue the app signing certificate from the bundled sub CA.
rem ---------------------------------------------------------------------------
call :run "%JAVA%" -jar "%TOOL%" generate-app-cert ^
  -keyAlias "%KEY_ALIAS%" -keyPwd "%KEY_PWD%" ^
  -issuer "%ISSUER_CA%" -issuerKeyAlias "%BASE_CA_ALIAS%" -issuerKeyPwd "%BASE_PWD%" ^
  -subject "%LEAF_SUBJECT%" -validity 3650 -signAlg SHA256withECDSA ^
  -rootCaCertFile "%OUT%\oh-root-ca.cer" -subCaCertFile "%OUT%\oh-app-sign-ca.cer" ^
  -keystoreFile "%OUT%\campusarena-test.p12" -keystorePwd "%STORE_PWD%" ^
  -issuerKeystoreFile "%BASE_P12%" -issuerKeystorePwd "%BASE_PWD%" ^
  -outForm certChain -outFile "%OUT%\campusarena-app-release.cer" || goto :fail

rem ---------------------------------------------------------------------------
rem 4. render the provision profile from DevEco's release template: bundle
rem    name, developer id, a validity window that has not expired (the
rem    template's own values expired in 2023) and our own leaf certificate.
rem ---------------------------------------------------------------------------
call :run "%NODE%" "%~dp0render-profile.mjs" ^
  --template "%TMPL%" --out "%OUT%\campusarena-profile-release.json" ^
  --cert "%OUT%\campusarena-app-release.cer" ^
  --bundle "%BUNDLE_NAME%" --developer "%DEVELOPER_ID%" || goto :fail

rem ---------------------------------------------------------------------------
rem 5. sign the profile with the bundled profile signing key -> p7b
rem ---------------------------------------------------------------------------
call :run "%JAVA%" -jar "%TOOL%" sign-profile ^
  -mode localSign -keyAlias "openharmony application profile release" ^
  -keyPwd %BASE_PWD% -profileCertFile "%LIB%\OpenHarmonyProfileRelease.pem" ^
  -inFile "%OUT%\campusarena-profile-release.json" -signAlg SHA256withECDSA ^
  -keystoreFile "%BASE_P12%" -keystorePwd %BASE_PWD% ^
  -outFile "%OUT%\campusarena-profile-release.p7b" || goto :fail

rem ---------------------------------------------------------------------------
rem 6. hvigor's password material. hvigor refuses plaintext passwords: it
rem    AES-128-GCM decrypts the value found in build-profile.json5 with a key
rem    derived from <keystore dir>\material. Generate that material here.
rem ---------------------------------------------------------------------------
call :run "%NODE%" "%~dp0make-material.mjs" --store "%OUT%\campusarena-test.p12" --force || goto :fail

rem ---------------------------------------------------------------------------
rem 7. self-checks: verify the signed profile, and prove hvigor's OWN
rem    decryptor accepts the ciphertext this toolchain will write into
rem    build-profile.json5.
rem ---------------------------------------------------------------------------
call :run "%JAVA%" -jar "%TOOL%" verify-profile ^
  -inFile "%OUT%\campusarena-profile-release.p7b" ^
  -outFile "%OUT%\profile-verify.json" || goto :fail

call :run "%NODE%" "%~dp0sign-self-test.mjs" --store "%OUT%\campusarena-test.p12" || goto :fail

echo.
echo [gen-chain] OK - test chain written to %OUT%
echo [gen-chain] app store : %OUT%\campusarena-test.p12  (pwd %STORE_PWD%)
echo [gen-chain] app cert  : %OUT%\campusarena-app-release.cer
echo [gen-chain] profile   : %OUT%\campusarena-profile-release.p7b
exit /b 0

:fail
echo [gen-chain] FAILED at the step above.
exit /b 1

:run
echo.
echo [gen-chain] ^> %*
%*
if errorlevel 1 (
  echo [gen-chain] command failed with errorlevel %ERRORLEVEL%
  exit /b 1
)
exit /b 0
