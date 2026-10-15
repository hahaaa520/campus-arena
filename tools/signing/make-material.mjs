#!/usr/bin/env node
// ============================================================================
//  make-material.mjs
//
//  Generates hvigor's signing "material" directory next to a keystore:
//
//      <keystoreDir>/material/fd/<0..2>/<file>   3 x 16 bytes, XORed
//      <keystoreDir>/material/ac/<file>          PBKDF2 salt
//      <keystoreDir>/material/ce/<file>          AES-128-GCM(rootKey, materialKey)
//
//  Without it hvigor cannot read storePassword/keyPassword at all: they are
//  AES-128-GCM ciphertext, never plaintext (see sign-secret.mjs for the full
//  format description and the 32-byte-IV requirement).
//
//  Usage:
//    node make-material.mjs --store <path-to.p12> [--material <dir>] [--force]
//
//  Existing material is kept unless --force is given, because replacing it
//  invalidates every password already written into build-profile.json5.
// ============================================================================
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createMaterial, materialDirFor, assertMaterialDir, deriveMaterialKey } from './sign-secret.mjs';

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const force = process.argv.includes('--force');

const storeFile = arg('store');
if (!storeFile) {
  console.error('usage: node make-material.mjs --store <keystore.p12> [--material <dir>] [--force]');
  process.exit(2);
}
const materialDir = path.resolve(arg('material') || materialDirFor(storeFile));

if (existsSync(materialDir) && !force) {
  assertMaterialDir(materialDir);
  console.log(`[make-material] keeping existing material: ${materialDir}`);
  console.log(`[make-material] material key: ${deriveMaterialKey(materialDir).toString('hex')}`);
  process.exit(0);
}

const materialKey = createMaterial(materialDir);
console.log(`[make-material] wrote material: ${materialDir}`);
console.log(`[make-material] material key : ${materialKey.toString('hex')}  (do not commit)`);
