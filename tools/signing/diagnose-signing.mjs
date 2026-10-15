#!/usr/bin/env node
// ============================================================================
//  diagnose-signing.mjs
//
//  Pinpoints WHY hvigor's Sign task fails with
//      "Unsupported state or unable to authenticate data"
//
//  That message means hvigor could not AES-GCM-decrypt the password it read
//  from build-profile.json5 — i.e. the ciphertext and the `material/` directory
//  next to the keystore do not belong together.
//
//  This script:
//    1. reads credentials.json and checks the three files exist
//    2. round-trips the password through sign-secret.mjs
//    3. asks HVIGOR'S OWN DecipherUtil to decrypt the exact ciphertext that
//       prepare-signing.mjs writes, using the material next to the keystore
//       -> this is the same call the Sign task makes
//
//  The password is NEVER printed; only whether it round-trips.
//
//  Usage:  node diagnose-signing.mjs [--creds <credentials.json>] [--project <dir>]
// ============================================================================
import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { encryptSecret, decryptSecret, materialDirFor, assertMaterialDir } from './sign-secret.mjs';

const DEVECO_ROOT = 'C:\\Program Files\\Huawei\\DevEco Studio';
const DECIPHER_UTIL = path.join(DEVECO_ROOT, 'tools', 'hvigor', 'hvigor-ohos-plugin',
  'src', 'utils', 'decipher-util.js');

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '..', '..');

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d;
};
const credsPath = path.resolve(arg('creds', path.join(here, 'credentials.json')));
const projRoot = path.resolve(arg('project', projectRoot));

const ok = (m) => console.log(`  \u2713 ${m}`);
const bad = (m) => { console.log(`  \u2717 ${m}`); process.exitCode = 1; };
const dim = (m) => console.log(`    ${m}`);

console.log(`凭据文件: ${credsPath}`);
if (!fs.existsSync(credsPath)) {
  bad('找不到 credentials.json');
  process.exit(1);
}
const c = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

console.log('\n1) 文件检查');
const storeFile = path.resolve(c.storeFile ?? '');
const certPath = path.resolve(c.certpath ?? '');
const profilePath = path.resolve(c.profile ?? '');
for (const [label, f] of [['密钥库 storeFile', storeFile], ['证书 certpath', certPath], ['Profile profile', profilePath]]) {
  if (fs.existsSync(f)) ok(`${label}: ${f}  (${fs.statSync(f).size} bytes)`);
  else bad(`${label} 不存在: ${f}`);
}

const materialDir = materialDirFor(storeFile);
console.log('\n2) material 目录（hvigor 解密的密钥来源）');
dim(`期望位置: ${materialDir}`);
if (fs.existsSync(materialDir)) {
  try {
    assertMaterialDir(materialDir);
    const fd = fs.readdirSync(path.join(materialDir, 'fd'));
    ok(`material 结构完整（fd 下有 ${fd.length} 个子目录）`);
  } catch (e) {
    bad(`material 结构不完整: ${e.message}`);
  }
} else {
  bad('material 目录不存在 —— prepare-signing.mjs 需要在密钥库旁边生成它');
}

console.log('\n3) 口令往返（本工具自己的加密/解密）');
const pw = c.storePassword;
const keyPw = c.keyPassword ?? pw;
dim(`storePassword 长度 ${String(pw ?? '').length}，keyPassword 长度 ${String(keyPw ?? '').length}`);
let cipher = null;
try {
  cipher = encryptSecret(materialDir, pw);
  const back = decryptSecret(materialDir, cipher);
  if (back === pw) ok(`往返成功，密文长度 ${cipher.length} 字符`);
  else bad('往返结果与原文不符');
  if (cipher.length < 32 || cipher.length % 2 !== 0) bad('密文长度不满足 hvigor 要求（>=32 且偶数）');
} catch (e) {
  bad(`加密失败: ${e.message}`);
}

console.log('\n4) 关键检查：hvigor 自己的解密器能否解开');
process.env.NODE_PATH = [process.env.NODE_PATH, path.join(projRoot, '.hvigor_deps', 'node_modules')]
  .filter(Boolean).join(path.delimiter);
Module._initPaths();

let hvigorOk = false;
try {
  const { DecipherUtil } = await import(pathToFileURL(DECIPHER_UTIL).href);
  const got = DecipherUtil.decryptPwd(path.dirname(storeFile), cipher);
  if (got === pw) { ok('hvigor 解出的口令与明文一致 —— 签名不会因口令解密而失败'); hvigorOk = true; }
  else bad(`hvigor 解出的内容不一致（长度 ${String(got).length}）`);
} catch (e) {
  bad(`hvigor 解密抛错: ${e.message}`);
  dim('这就是 "Unsupported state or unable to authenticate data" 的来源。');
  dim('含义：密文与 material 目录不配套。');
}

console.log('\n5) 交叉验证：另一套 material 是否反而能解开');
const altCandidates = [
  path.join(here, 'local-test', 'material'),
  path.join(projRoot, 'signing-keys', 'material')
];
for (const alt of altCandidates) {
  if (path.resolve(alt) === path.resolve(materialDir)) continue;
  if (!fs.existsSync(alt)) { dim(`(跳过，不存在) ${alt}`); continue; }
  try {
    const got = decryptSecret(alt, cipher);
    if (got === pw) {
      bad(`!! 密文其实是用另一套 material 加的密：${alt}`);
      dim('说明 prepare-signing.mjs 复用了上次的密文，需要强制重新加密。');
    } else {
      dim(`不匹配（正常）: ${alt}`);
    }
  } catch {
    dim(`不匹配（正常）: ${alt}`);
  }
}

console.log('');
if (hvigorOk) {
  console.log('结论: 口令链路正常。若 hvigor 仍报解密错误，请清理 D:\\CampusArena\\entry\\build 后重试。');
} else {
  console.log('结论: 口令链路有问题，见上面的 ✗。');
}
