// ============================================================================
//  sign-secret.mjs
//
//  Encryption side of hvigor's signing-secret format.
//
//  hvigor's Sign task (hvigor-ohos-plugin/src/utils/decipher-util.js) does NOT
//  accept plaintext keystore passwords. DecipherUtil.decryptPwd() rejects any
//  value shorter than 32 chars or with an odd length, then AES-128-GCM
//  decrypts it. The key comes from a `material` directory that must sit NEXT
//  TO the keystore file:
//
//      storeFile                 = <keystoreDir>/xxx.p12
//      material directory hvigor reads = <keystoreDir>/material
//
//  Directory layout hvigor's DecipherUtil.getKey() requires:
//
//      material/fd/<0>/<one file>   16 bytes \
//      material/fd/<1>/<one file>   16 bytes  | XORed together, in readdir
//      material/fd/<2>/<one file>   16 bytes /  order, then XORed with
//                                               DecipherUtil.component
//      material/ac/<one file>       salt for PBKDF2-SHA256
//      material/ce/<one file>       AES-128-GCM(rootKey, materialKey)
//
//  Key schedule (verbatim behaviour of DecipherUtil):
//
//      rootKey     = PBKDF2-SHA256( utf8(XOR(fd0,fd1,fd2,component)),
//                                   salt=ac/<file>, 10000 iterations, 16 bytes )
//      materialKey = AES-128-GCM-decrypt(rootKey, ce/<file>)
//      password    = AES-128-GCM-decrypt(materialKey, hex in build-profile.json5)
//
//  GCM payload layout: [ uint32 BE header ][ IV ][ ciphertext ][ 16-byte tag ]
//
//  *** The header value is NOT a free choice. ***
//  DecipherUtil.decrypt() computes the IV length as
//      i = payload.length - 4 - header
//  and uses that same i for BOTH the IV slice and the ciphertext offset.
//  With a plaintext of P bytes this forces
//      header = P + 16        and        IV length = P + 16
//  (see gcmEncrypt below for the derivation).
//
//  Note: hvigor does not verify the header against the real IV length - it
//  overrides it. So a wrong header does not fail loudly; it silently slices
//  the wrong bytes and the GCM tag check then fails with
//      "Unsupported state or unable to authenticate data".
//  That is exactly the failure mode this file used to have: the IV length was
//  hardcoded to 32, which is only correct for a 16-byte password.
//
//  sign-self-test.mjs proves the value against hvigor's own decryptor.
// ============================================================================
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/** DecipherUtil.component, verbatim. */
export const XOR_COMPONENT = Buffer.from([
  0x31, 0xf3, 0x09, 0x73, 0xd6, 0xaf, 0x5b, 0xb8,
  0xd3, 0xbe, 0xb1, 0x58, 0x65, 0x83, 0xc0, 0x77,
]);
export const PBKDF2_ITERATIONS = 10000;
export const PBKDF2_KEYLEN = 16;
/** DecipherUtil.dirs */
export const MATERIAL_DIRS = ['fd', 'ac', 'ce'];
/**
 * IV length for a password of `plaintextBytes` bytes.
 *
 * Do NOT reintroduce a fixed constant here. hvigor derives the IV slice from
 * the payload length, so the header and the IV length must both equal
 * `plaintextBytes + 16`; any other value makes hvigor slice the wrong bytes and
 * fail the GCM tag check. See the derivation in gcmEncrypt().
 */
export function gcmIvLenFor(plaintextBytes) {
  return plaintextBytes + 16;
}

function onlyFileIn(dir) {
  const entries = readdirSync(dir).filter((n) => n !== '.DS_Store');
  if (entries.length !== 1) {
    throw new Error(`${dir} must contain exactly one file, found ${entries.length}`);
  }
  return readFileSync(path.join(dir, entries[0]));
}

function xorBuffers(a, b) {
  if (a.length !== b.length) throw new Error('xor length mismatch');
  const out = Buffer.alloc(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] ^ b[i];
  return out;
}

export function materialDirFor(storeFile) {
  return path.join(path.dirname(path.resolve(storeFile)), 'material');
}

export function assertMaterialDir(materialDir) {
  for (const dir of MATERIAL_DIRS) {
    if (!existsSync(path.join(materialDir, dir))) {
      throw new Error(`signing material is incomplete: ${path.join(materialDir, dir)} is missing`);
    }
  }
}

/** components = the single file inside each material/fd/<n> subdirectory */
export function readComponents(materialDir) {
  const fdDir = path.join(materialDir, 'fd');
  const names = readdirSync(fdDir).filter((n) => n !== '.DS_Store').sort();
  if (names.length !== 3) throw new Error('material/fd must contain exactly 3 entries');
  return names.map((name) => onlyFileIn(path.join(fdDir, name)));
}

/** PBKDF2(password=utf8(XOR(components, component)), salt=ac/<file>) */
export function deriveRootKey(materialDir) {
  const parts = readComponents(materialDir);
  for (const part of parts) {
    if (part.length !== 16) throw new Error(`material/fd component must be 16 bytes, got ${part.length}`);
  }
  let acc = xorBuffers(parts[0], parts[1]);
  acc = xorBuffers(acc, parts[2]);
  acc = xorBuffers(acc, XOR_COMPONENT);
  const salt = onlyFileIn(path.join(materialDir, 'ac'));
  // NOTE: hvigor passes i.toString() with the default (utf-8) encoding, and
  // XOR results can contain bytes >= 0x80. Using 'latin1'/'binary' here
  // produces a different key. This must stay utf-8.
  return crypto.pbkdf2Sync(acc.toString('utf-8'), salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, 'sha256');
}

/** the 16-byte key that encrypts the passwords themselves */
export function deriveMaterialKey(materialDir) {
  assertMaterialDir(materialDir);
  return gcmDecrypt(deriveRootKey(materialDir), onlyFileIn(path.join(materialDir, 'ce')));
}

export function gcmDecrypt(key, payload) {
  const ivLen = payload.readUInt32BE(0);
  if (ivLen <= 0 || payload.length < 4 + ivLen + 16) throw new Error('malformed GCM payload');
  const iv = payload.subarray(4, 4 + ivLen);
  const tag = payload.subarray(payload.length - 16);
  const body = payload.subarray(4 + ivLen, payload.length - 16);
  const decipher = crypto.createDecipheriv('aes-128-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(body), decipher.final()]);
}

export function gcmEncrypt(key, plaintext, ivLen) {
  const body8 = Buffer.isBuffer(plaintext) ? plaintext : Buffer.from(plaintext, 'utf8');
  // ---------------------------------------------------------------- IMPORTANT
  // hvigor's DecipherUtil.decrypt() derives the IV length as
  //     i = payload.length - 4 - <header value>
  // and then slices BOTH the IV (e.slice(4, 4+i)) and the ciphertext
  // (e.subarray(4+i, len-16)) using that same i.
  //
  // For our layout [4-byte header][IV of L bytes][ct of P bytes][16-byte tag]:
  //     payload.length = 4 + L + P + 16
  //     i              = L + P + 16 - header
  // and we need i === L so that the IV slice lines up, which forces
  //
  //     header = P + 16        (P = plaintext byte length)
  //
  // and, for a fixed IV length, L = header, i.e. L = P + 16.
  //
  // The previous version hardcoded L = header = 32. That only works when the
  // password happens to be exactly 16 bytes long - which the original test
  // password ("CampusArena_2024") was. Any other password length makes hvigor
  // slice the wrong bytes and abort with
  //     "Unsupported state or unable to authenticate data".
  // -------------------------------------------------------------------------
  const len = ivLen ?? (body8.length + 16);
  const iv = crypto.randomBytes(len);
  const cipher = crypto.createCipheriv('aes-128-gcm', key, iv);
  const body = Buffer.concat([cipher.update(body8), cipher.final()]);
  const header = Buffer.alloc(4);
  header.writeUInt32BE(iv.length, 0);
  return Buffer.concat([header, iv, body, cipher.getAuthTag()]);
}

/** plaintext -> the 32+ char lowercase-hex string hvigor expects. */
export function encryptSecret(materialDir, plaintext) {
  return gcmEncrypt(deriveMaterialKey(materialDir), Buffer.from(plaintext, 'utf8')).toString('hex');
}

/** inverse; used to self-check before writing build-profile.json5. */
export function decryptSecret(materialDir, hex) {
  if (hex.length < 32 || hex.length % 2 !== 0) throw new Error('ciphertext length invalid for hvigor');
  return gcmDecrypt(deriveMaterialKey(materialDir), Buffer.from(hex, 'hex')).toString('utf8');
}

/**
 * Create a fresh material directory. The components are ours to choose: the
 * format is not a vendor-issued secret container, it is simply how the
 * toolchain wraps the passphrase that protects the keystore password.
 * Returns the material key so the caller can encrypt passwords immediately.
 */
export function createMaterial(materialDir) {
  mkdirSync(path.join(materialDir, 'ac'), { recursive: true });
  mkdirSync(path.join(materialDir, 'ce'), { recursive: true });
  const parts = [crypto.randomBytes(16), crypto.randomBytes(16), crypto.randomBytes(16)];
  parts.forEach((part, index) => {
    const slot = path.join(materialDir, 'fd', String(index));
    mkdirSync(slot, { recursive: true });
    writeFileSync(path.join(slot, crypto.randomBytes(16).toString('hex')), part);
  });
  writeFileSync(path.join(materialDir, 'ac', crypto.randomBytes(16).toString('hex')), crypto.randomBytes(16));
  const rootKey = deriveRootKey(materialDir);
  const materialKey = crypto.randomBytes(16);
  writeFileSync(path.join(materialDir, 'ce', crypto.randomBytes(16).toString('hex')), gcmEncrypt(rootKey, materialKey));
  // verify we can read back what we just wrote
  const check = deriveMaterialKey(materialDir);
  if (!check.equals(materialKey)) throw new Error('internal error: generated material does not round-trip');
  return materialKey;
}
