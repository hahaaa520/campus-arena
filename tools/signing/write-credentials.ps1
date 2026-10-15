# ============================================================================
#  write-credentials.ps1
#
#  Asks for the keystore password WITHOUT echoing it, then writes
#  tools/signing/credentials.json in the shape prepare-signing.mjs expects.
#
#  Called by 03-sign.cmd via:
#     powershell -NoProfile -ExecutionPolicy Bypass -File write-credentials.ps1
#
#  Saved as UTF-8 WITH BOM on purpose: Windows PowerShell 5.1 only decodes
#  .ps1 files as UTF-8 when a BOM is present; without one it assumes the
#  ANSI codepage and the Chinese prompts come out garbled.
#
#  The password is never passed on a command line and never written to the
#  console. It lands only in credentials.json, which .gitignore excludes.
# ============================================================================
param(
    [string]$KeyDir  = 'D:\CampusArena\signing-keys',
    [string]$OutFile = 'D:\CampusArena\tools\signing\credentials.json'
)

$ErrorActionPreference = 'Stop'

$p12  = Join-Path $KeyDir 'campusarena.p12'
$cer  = Join-Path $KeyDir 'campusarena.cer'
$p7b  = Join-Path $KeyDir 'campusarena.p7b'

foreach ($f in @($p12, $cer, $p7b)) {
    if (-not (Test-Path -LiteralPath $f)) {
        Write-Host "[错误] 找不到文件：$f" -ForegroundColor Red
        exit 2
    }
}

Write-Host ''
$secure = Read-Host -Prompt '请输入密钥库口令（输入时不显示任何字符）' -AsSecureString

$plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
             [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
if ([string]::IsNullOrEmpty($plain)) {
    Write-Host '[错误] 口令为空，已取消。' -ForegroundColor Red
    exit 1
}

$obj = [ordered]@{
    name         = 'default'
    type         = 'HarmonyOS'
    storeFile    = $p12
    storePassword = $plain
    keyAlias     = 'campusarena-release'
    keyPassword  = $plain
    certpath     = $cer
    profile      = $p7b
    signAlg      = 'SHA256withECDSA'
    passwordMode = 'encrypted'
}

$json = $obj | ConvertTo-Json
[IO.File]::WriteAllText($OutFile, $json, [Text.UTF8Encoding]::new($false))

Write-Host '[完成] credentials.json 已写入（该文件已被 .gitignore 排除）' -ForegroundColor Green
exit 0
