#!/usr/bin/env node
// ============================================================================
//  sign-self-test.mjs
//
//  Proves, without touching the project, that the values sign-release.cmd is
//  about to write into build-profile.json5 will actually be accepted:
//
//   1. sign-secret.mjs round-trips: encryptSecret() then decryptSecret()
//      returns the original plaintext.
//   2. the ciphertext is accepted by HVIGOR'S OWN decryptor. This is the one
//      that matters: it imports
//        <DevEco>/tools/hvigor/hvigor-ohos-plugin/src/utils/decipher-util.js
//      and calls DecipherUtil.decryptPwd(<keystore dir>, <our hex>) - the
//      exact call the Sign task makes.
//
//  Usage:  node sign-self-test.mjs [--store <p12>] [--material <dir>] [--password <pw>]
// ============================================================================
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import { encryptSecret, decryptSecret, materialDirFor, assertMaterialDir } from './sign-secret.mjs';

const DEVECO_ROOT = 'C:\\Program Files\\Huawei\\DevEco Studio';
const DECIPHER_UTIL = path.join(
  DEVECO_ROOT,
  'tools',
  'hvigor',
  'hvigor-ohos-plugin',
  'src',
  'utils',
  'decipher-util.js'
);

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..', '..');
const storeFile = path.resolve(
  arg('store', path.join(scriptDir, 'local-test', 'campusarena-test.p12'))
);
const materialDir = path.resolve(arg('material', materialDirFor(storeFile)));
const plaintext = arg('password', 'CampusArena_2024');

// hvigor's decipher-util.js requires @ohos/hvigor, which is not installed next
// to it. build.cmd solves this with NODE_PATH; do the same here so this check
// runs stand-alone.
process.env.NODE_PATH = [process.env.NODE_PATH, path.join(projectRoot, '.hvigor_deps', 'node_modules')]
  .filter(Boolean)
  .join(path.delimiter);
Module._initPaths();

console.log(`[self-test] keystore  : ${storeFile}`);
console.log(`[self-test] material  : ${materialDir}`);
if (!existsSync(materialDir)) {
  console.error('[self-test] FAIL: material dir missing - run generate-local-test-chain.cmd');
  process.exit(1);
}
assertMaterialDir(materialDir);

// ---- 1. our own round trip -------------------------------------------------
const hex = encryptSecret(materialDir, plaintext);
const back = decryptSecret(materialDir, hex);
console.log(`[self-test] ciphertext: ${hex}`);
console.log(`[self-test] length    : ${hex.length} chars (hvigor needs >= 32 and even)`);
if (back !== plaintext) {
  console.error(`[self-test] FAIL: round trip returned ${JSON.stringify(back)}`);
  process.exit(1);
}
if (hex.length < 32 || hex.length % 2 !== 0) {
  console.error('[self-test] FAIL: hvigor would reject this value on length grounds');
  process.exit(1);
}

// ---- 2. hvigor's own decryptor --------------------------------------------
const { DecipherUtil } = await import(pathToFileURL(DECIPHER_UTIL).href);
// DecipherUtil.getKey() appends 'material' to the directory it is handed, so
// pass the keystore's directory - exactly what the Sign task does.
const hvigorPlain = DecipherUtil.decryptPwd(path.dirname(storeFile), hex);
console.log(`[self-test] hvigor DecipherUtil.decryptPwd(dir, ciphertext) -> ${JSON.stringify(hvigorPlain)}`);
if (hvigorPlain !== plaintext) {
  console.error('[self-test] FAIL: hvigor decrypted something else');
  process.exit(1);
}
console.log('[self-test] PASS: hvigor accepts the password value this toolchain writes');
