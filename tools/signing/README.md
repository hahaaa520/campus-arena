# CampusArena 命令行发布签名（tools/signing）

本目录让 HarmonyOS 应用可以在**纯命令行**下完成 release 签名，只使用 DevEco Studio
自带的工具链（hvigor + hap-sign-tool.jar + JBR），不额外安装任何软件。

## 1. 一条命令搞定

```cmd
D:\CampusArena\tools\signing\sign-release.cmd --gen-chain
```

`--gen-chain` 表示"先用一次性自签链跑通全流程"。没有真实证书时这样验证最方便。
已有正式证书（AGC 申请）时，只需填好 `credentials.json`，然后：

```cmd
D:\CampusArena\tools\signing\sign-release.cmd
```

产出物：`D:\CampusArena\dist\CampusArena-release-signed.app`

### 参数

| 参数 | 作用 |
| --- | --- |
| `--gen-chain` | 先执行 `generate-local-test-chain.cmd`，重新生成一次性测试链 |
| `--keep-config` | 构建后**保留** `build-profile.json5` 里的 `signingConfigs`（默认会还原成 `[]`） |

## 2. 目录内容

| 文件 | 作用 |
| --- | --- |
| `sign-release.cmd` | 编排器：准备配置 → 构建 → 发布到 `dist\` → 验签 → 还原配置 |
| `generate-local-test-chain.cmd` | 生成一次性自签链（密钥对、CSR、证书链、加密 material） |
| `prepare-signing.mjs` | 以**文本方式**改写 `build-profile.json5` 的 `signingConfigs`，保留注释与格式，幂等 |
| `sign-secret.mjs` | hvigor 口令加密格式的实现（见第 5 节） |
| `make-material.mjs` | 生成 hvigor 解密口令所需的 `material\` 目录 |
| `render-profile.mjs` | 用 DevEco 的发布模板渲染出 Provision Profile JSON |
| `sign-self-test.mjs` | 用 **hvigor 自己的解密代码**验证将要写入的口令能被接受 |
| `credentials.example.json` | 凭据模板（复制为 `credentials.json` 后填写） |
| `local-test/` | 一次性测试链的产物（**含私钥，勿提交**） |

## 3. 完整命令序列（可复现）

以下就是 `generate-local-test-chain.cmd` 实际执行的内容
（`<LIB>` = `C:\Program Files\Huawei\DevEco Studio\sdk\default\openharmony\toolchains\lib`）：

```cmd
rem 1) 导出内置 CA 证书（必须是 DER，hap-sign-tool 不认 PEM）
keytool -exportcert -alias "openharmony application root ca" ^
  -keystore "<LIB>\OpenHarmony.p12" -storetype PKCS12 -storepass 123456 ^
  -file local-test\oh-root-ca.cer
keytool -exportcert -alias "cacert" ^
  -keystore "<LIB>\OpenHarmony.p12" -storetype PKCS12 -storepass 123456 ^
  -file local-test\oh-app-sign-ca.cer

rem 2) 应用签名密钥对 + CSR
java -jar "<LIB>\hap-sign-tool.jar" generate-keypair ^
  -keyAlias campusarena-app-key-v1 -keyPwd CampusArena_2024 ^
  -keyAlg ECC -keySize NIST-P-256 ^
  -keystoreFile local-test\campusarena-test.p12 -keystorePwd CampusArena_2024

java -jar "<LIB>\hap-sign-tool.jar" generate-csr ^
  -keyAlias campusarena-app-key-v1 -keyPwd CampusArena_2024 ^
  -subject "C=CN,O=CampusArena,OU=CampusArena Dev,CN=CampusArena Release" ^
  -signAlg SHA256withECDSA ^
  -keystoreFile local-test\campusarena-test.p12 -keystorePwd CampusArena_2024 ^
  -outFile local-test\campusarena-app-key-v1.csr

rem 3) 用内置子 CA 签发应用签名证书
java -jar "<LIB>\hap-sign-tool.jar" generate-app-cert ^
  -keyAlias campusarena-app-key-v1 -keyPwd CampusArena_2024 ^
  -issuer "C=CN,O=OpenHarmony,OU=OpenHarmony Team,CN=OpenHarmony Application CA" ^
  -issuerKeyAlias "openharmony application ca" -issuerKeyPwd 123456 ^
  -subject "C=CN,O=CampusArena,OU=CampusArena Dev,CN=CampusArena Release" ^
  -validity 3650 -signAlg SHA256withECDSA ^
  -rootCaCertFile local-test\oh-root-ca.cer ^
  -subCaCertFile local-test\oh-app-sign-ca.cer ^
  -keystoreFile local-test\campusarena-test.p12 -keystorePwd CampusArena_2024 ^
  -issuerKeystoreFile "<LIB>\OpenHarmony.p12" -issuerKeystorePwd 123456 ^
  -outForm certChain -outFile local-test\campusarena-app-release.cer

rem 4) 渲染 Profile（替换 bundle-name / developer-id / 有效期 / 证书）
node render-profile.mjs ^
  --template "<LIB>\UnsgnedReleasedProfileTemplate.json" ^
  --out local-test\campusarena-profile-release.json ^
  --cert local-test\campusarena-app-release.cer ^
  --bundle com.campusarena.scheduler --developer CampusArena

rem 5) 签发 Profile -> p7b
java -jar "<LIB>\hap-sign-tool.jar" sign-profile ^
  -mode localSign -keyAlias "openharmony application profile release" ^
  -keyPwd 123456 -profileCertFile "<LIB>\OpenHarmonyProfileRelease.pem" ^
  -inFile local-test\campusarena-profile-release.json -signAlg SHA256withECDSA ^
  -keystoreFile "<LIB>\OpenHarmony.p12" -keystorePwd 123456 ^
  -outFile local-test\campusarena-profile-release.p7b

rem 6) 生成 hvigor 口令加密所需的 material
node make-material.mjs --store local-test\campusarena-test.p12 --force

rem 7) 自检
java -jar "<LIB>\hap-sign-tool.jar" verify-profile ^
  -inFile local-test\campusarena-profile-release.p7b ^
  -outFile local-test\profile-verify.json
node sign-self-test.mjs --store local-test\campusarena-test.p12

rem 8) 正式构建（注意：assembleApp 不能加 --mode module）
tools\build.cmd assembleApp --no-daemon
```

### 内置 CA 的口令与别名

`OpenHarmony.p12` 的库口令是 **`123456`**（`keytool -list` 枚举得到），内含：

| 别名 | 用途 |
| --- | --- |
| `openharmony application root ca` | 根 CA（自签） |
| `openharmony application ca` | 二级 CA，**签发应用证书就用它** |
| `cacert` | 同二级 CA 的 trustedCertEntry（导出 DER 用这个别名最省事） |
| `openharmony application profile release` | 签发 Profile 的密钥 |
| `openharmony application profile debug` | 调试版 Profile 密钥 |
| `openharmony application release` | 内置的通用发布应用证书 |
| `openharmony software signature` | 软件签名 |

## 4. UnsgnedReleasedProfileTemplate.json 的结构

```json5
{
  "version-name": "2.0.0",
  "version-code": 2,
  "app-distribution-type": "os_integration",   // 应用分发类型
  "uuid": "5027b99e-...",                       // 模板固定
  "validity": { "not-before": 1594865258, "not-after": 1689473258 },  // ★ 模板里是 2020~2023，已过期，必须改
  "type": "release",                            // release / debug
  "bundle-info": {
    "developer-id": "OpenHarmony",              // ★ 改成自己的开发者 ID
    "distribution-certificate": "-----BEGIN CERTIFICATE-----\n...", // ★ 改成自己的叶子证书（PEM，单行 \n 转义）
    "bundle-name": "com.OpenHarmony.app.test",  // ★ 必须与 app.json5 的 bundleName 一致
    "apl": "normal",
    "app-feature": "hos_normal_app"
  },
  "acls": { "allowed-acls": [""] },
  "permissions": { "restricted-permissions": [] },
  "issuer": "pki_internal"
}
```

`render-profile.mjs` 会替换上表中带 ★ 的四项，并补一个
`bundle-info.app-identifier`（取 bundle name）。**有效期**这一项如果不改，
签名过程不会报错，但设备侧会因 Profile 过期而拒绝安装，很容易踩坑。

## 5. 关键结论：明文口令**不被接受**

**hvigor 会拒绝明文口令。** 相关代码在
`<DevEco>\tools\hvigor\hvigor-ohos-plugin\src\utils\decipher-util.js`：

```js
static decryptPwd(dir, e) {          // e = build-profile.json5 里的口令字段
  if (e.length < 32)  -> "Invalid data."          // 少于 32 字符直接失败
  if (e.length % 2)   -> "Invalid password length."
  key = getKey(dir)                  // 从 <storeFile 所在目录>\material 推导
  return decrypt(key, Buffer.from(e, "hex"))
}
```

所以 `storePassword` / `keyPassword` 必须是**十六进制密文**，密钥来自 keystore
同级的 `material\` 目录：

```
material/fd/<0..2>/<单文件>   3 × 16 字节，按 readdir 顺序异或
material/ac/<单文件>          PBKDF2 盐
material/ce/<单文件>          AES-128-GCM(rootKey, materialKey)

rootKey     = PBKDF2-SHA256( utf8(XOR(fd0,fd1,fd2,component)),
                             salt = ac/<文件>, 10000 轮, 16 字节 )
component   = 31 f3 09 73 d6 af 5b b8 d3 be b1 58 65 83 c0 77
materialKey = AES-128-GCM-decrypt(rootKey, ce/<文件>)
口令        = AES-128-GCM-decrypt(materialKey, build-profile.json5 里的 hex)
```

GCM 载荷布局：`[4 字节大端 IV 长度][IV][密文][16 字节 tag]`

**两个必须注意的坑：**

1. **IV 必须是 32 字节。** hvigor 的 `decrypt()` 把密文切片算成
   `e.length - 4 - ivLen`，却又用 `e.slice(4, 4 + ivLen)` 取 IV，多算了一次。
   只有 `ivLen == 32` 时两个式子才自洽。DevEco Studio 自己写出来的 material
   （`%APPDATA%\Huawei\DevEcoStudio5.0\options\data2\material`）里 `ce`
   声明的也是 32。用别的长度（比如常见的 12）hvigor 会直接抛
   `Unsupported state or unable to authenticate data`。
2. **异或结果要按 UTF-8 编码参与 PBKDF2。** hvigor 写的是 `i.toString()`，
   默认是 utf-8；异或结果里只要有一个字节 ≥ 0x80，用 `latin1/binary`
   算出来的 rootKey 就完全不同。`sign-secret.mjs` 里对此有注释。

`sign-secret.mjs` 完整实现了上述格式，`sign-self-test.mjs` 会 import
hvigor 自己的 `decipher-util.js` 并调用 `DecipherUtil.decryptPwd()` 做验证——
即"用 hvigor 的代码证明 hvigor 会接受我们写进去的值"。

若只想复现 hvigor 的报错，把 `credentials.json` 的 `passwordMode` 改成
`plaintext` 即可，构建会失败并给出上面的报错。

## 6. 最终 signingConfigs 形态

```json5
"signingConfigs": [
  {
    "name": "default",
    "type": "HarmonyOS",
    "material": {
      "certpath": "<绝对路径>.cer",
      "storePassword": "<hex 密文，>=32 字符>",
      "keyAlias": "<别名>",
      "keyPassword": "<hex 密文，>=32 字符>",
      "profile": "<绝对路径>.p7b",
      "signAlg": "SHA256withECDSA",
      "storeFile": "<绝对路径>.p12"
    }
  }
]
```

`prepare-signing.mjs` 只替换 `"signingConfigs": [ ... ]` 这一段文本，
其余注释、空行、缩进原样保留，重复执行不会重复改动（幂等）。
第一次写入前会把原始文件备份到 `.build-profile.json5.bak`。

## 7. 验证签名

```cmd
java -jar "C:\Program Files\Huawei\DevEco Studio\sdk\default\openharmony\toolchains\lib\hap-sign-tool.jar" ^
  verify-app -inFile D:\CampusArena\dist\CampusArena-release-signed.app ^
  -outCertChain out.cer -outProfile out.p7b
```

成功时输出（节选）：

```
INFO  - Find Hap Signing Block success, version: 3, block count: 2
INFO  - Subject: CN=CampusArena Release, OU=CampusArena Dev, O=CampusArena, C=CN
INFO  - Issuer: CN=OpenHarmony Application CA, OU=OpenHarmony Team, O=OpenHarmony, C=CN
INFO  - Digest verify result: true, DigestAlgorithm: SHA-256
INFO  - verify: Verify success
INFO  - verify-app success
```

**`verify-app` 可以验证 `.app`**，不必退回验证里面的 HAP。
（`.app` 里的 HAP 另行验证时会多一行 `verify codesign success`，
因为 HAP 带代码签名块而 `.app` 外层不带。）

## 8. 安全须知

- `credentials.json`、`local-test/`、`.build-profile.json5.bak` 都含口令或私钥，
  **已在 .gitignore 中排除，切勿提交**。
- `local-test/` 是一次性测试链，只能用于本机验证，不要用于任何真实发布。
- 本目录所有脚本对 DevEco Studio 安装目录**只读**，不做任何修改。
