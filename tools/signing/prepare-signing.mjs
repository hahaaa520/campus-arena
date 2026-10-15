#!/usr/bin/env node
// ============================================================================
//  prepare-signing.mjs
//
//  Rewrites the `app.signingConfigs` array inside the project-level
//  build-profile.json5 **as text**, so every comment, blank line and
//  indentation detail elsewhere in the file survives untouched.
//
//  Usage
//    node prepare-signing.mjs [--project <dir>] [--credentials <file>]
//                             [--material <dir>] [--backup <file>]
//                             [--restore] [--dry-run]
//
//  Modes
//    (default)      read credentials.json -> write the signingConfigs block.
//                   Missing credentials.json == "no credentials" == restore
//                   the pristine `"signingConfigs": []` (this is the switch
//                   sign-release.cmd uses to put the project back the way it
//                   found it, and it keeps the shipped project buildable
//                   without any secrets present).
//    --restore      put back the backup taken by the first write.
//    --dry-run      print what would change, write nothing.
//
//  ---------------------------------------------------------------------------
//  WHY THE PASSWORDS ARE NOT PLAINTEXT
//  ---------------------------------------------------------------------------
//  hvigor's Sign task runs storePassword/keyPassword through
//  hvigor-ohos-plugin/src/utils/decipher-util.js -> DecipherUtil.decryptPwd().
//  That function rejects anything shorter than 32 chars and then AES-128-GCM
//  decrypts the value (hex) with a key derived from a `material` directory
//  sitting next to the keystore:
//
//      key   = PBKDF2-SHA256( XOR(fd/0, fd/1, fd/2, <component>) , salt=ac/* ,
//                             10000 iters, 16 bytes )
//      where <component> is 49 f3 09 73 d6 af 5b b8 d3 be b1 58 65 83 c0 77
//      inner = AES-128-GCM-decrypt(key, ce/*)          -> the "material key"
//      pwd   = AES-128-GCM-decrypt(inner, <hex value in build-profile.json5>)
//
//  GCM payload layout used here: [4-byte big-endian IV length][IV][ciphertext][16-byte tag]
//  (exactly what DecipherUtil.decrypt() parses).
//
//  So `encryptSecret()` below is the inverse of hvigor's own decryption, and
//  the `material/` directory next to the throwaway keystore is what makes the
//  ciphertext decryptable. Both were round-trip validated against hvigor's
//  own decipher-util.js -- see tools/signing/README.md.
// ============================================================================
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { encryptSecret, decryptSecret, materialDirFor, createMaterial, assertMaterialDir } from './sign-secret.mjs';

// ---- hvigor's signing-secret format lives in sign-secret.mjs ----------------

function parseArgs(argv) {
  const out = { _flags: new Set() };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) throw new Error(`unexpected argument: ${arg}`);
    const name = arg.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      out._flags.add(name);
    } else {
      out[name] = next;
      i++;
    }
  }
  return out;
}


// ---- text-level surgery on build-profile.json5 ------------------------------
const SIGNING_KEY = '"signingConfigs"';

function escapeJson(s) {
  return JSON.stringify(s);
}

function renderSigningBlock(entries, baseIndent) {
  if (entries.length === 0) return '[]';
  const indent = baseIndent;
  const inner = indent + '  ';
  const objects = entries.map((entry) => {
    const lines = [];
    lines.push(`${inner}{`);
    lines.push(`${inner}  "name": ${escapeJson(entry.name)},`);
    lines.push(`${inner}  "type": ${escapeJson(entry.type)},`);
    lines.push(`${inner}  "material": {`);
    const materialKeys = [
      'certpath',
      'storePassword',
      'keyAlias',
      'keyPassword',
      'profile',
      'signAlg',
      'storeFile',
    ];
    materialKeys.forEach((key, index) => {
      const comma = index === materialKeys.length - 1 ? '' : ',';
      lines.push(
        `${inner}    ${escapeJson(key)}: ${escapeJson(String(entry.material[key] ?? ''))}${comma}`
      );
    });
    lines.push(`${inner}  }`);
    lines.push(`${inner}}`);
    return lines.join('\n');
  });
  // the closing bracket must line up with `"signingConfigs"`, i.e. baseIndent
  return `[\n${objects.join(',\n')}\n${baseIndent}]`;
}

/**
 * Replace the value of the single `"signingConfigs": [...]` property with
 * `rendered`, matching brackets while ignoring brackets inside strings.
 * Returns { text, changed }.
 */
/**
 * Pull the password values out of whatever signingConfigs currently holds, so
 * an unchanged password can keep its existing ciphertext (see the idempotence
 * note in the encrypted branch of main()).
 */
function currentSigningMaterial(text) {
  let open;
  try {
    open = findSigningConfigsOpen(text);
  } catch {
    return null;
  }
  const close = matchBracket(text, open);
  const block = text.slice(open, close + 1);
  const pick = (key) => {
    const m = new RegExp(`"${key}"\\s*:\\s*"([^"]*)"`).exec(block);
    return m ? m[1] : null;
  };
  const storePassword = pick('storePassword');
  const keyPassword = pick('keyPassword');
  if (!storePassword) return null;
  return { storePassword, keyPassword };
}

function findSigningConfigsOpen(text) {
  const match = /^([ \t]*)("signingConfigs")([ \t]*):([ \t]*)(\[)/m.exec(text);
  if (!match) throw new Error(`could not find a ${SIGNING_KEY}: [ ... ] property in build-profile.json5`);
  return match.index + match[0].length - 1; // index of the '['
}

function replaceSigningConfigs(text, rendered) {
  const open = findSigningConfigsOpen(text);
  const close = matchBracket(text, open);
  const current = text.slice(open, close + 1);
  if (current === rendered) return { text, changed: false };
  return { text: text.slice(0, open) + rendered + text.slice(close + 1), changed: true };
}

/**
 * Index of the `]` matching the `[` at `open`. Only square brackets affect the
 * depth: array elements are object literals whose `{}` must be ignored, and
 * brackets inside strings or comments are skipped entirely.
 */
function matchBracket(text, open) {
  let depth = 0;
  let inString = false;
  let quote = '';
  for (let i = open; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (ch === '\\') {
        i++;
      } else if (ch === quote) {
        inString = false;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = true;
      quote = ch;
      continue;
    }
    if (ch === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && text[i + 1] === '*') {
      i = text.indexOf('*/', i + 2);
      if (i < 0) throw new Error('unterminated block comment');
      i++;
      continue;
    }
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) return i;
    }
  }
  throw new Error('unbalanced brackets while scanning signingConfigs');
}

// ---- main ------------------------------------------------------------------
const args = parseArgs(process.argv.slice(2));
// default to the project this script lives in (tools/signing -> project root),
// so it does not matter which directory the caller runs from
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(args.project || path.resolve(scriptDir, '..', '..'));
const profilePath = path.join(project, 'build-profile.json5');
const credentialsPath = path.resolve(args.credentials || path.join(project, 'tools', 'signing', 'credentials.json'));
const backupPath = path.resolve(args.backup || path.join(project, 'tools', 'signing', '.build-profile.json5.bak'));
const materialDirOverride = args.material ? path.resolve(args.material) : null;
const dryRun = args._flags.has('dry-run');
const restore = args._flags.has('restore');
// --no-credentials forces the clean, credential-free state even when a
// credentials.json happens to exist.
const noCredentials = args._flags.has('no-credentials');

if (!existsSync(profilePath)) throw new Error(`no such file: ${profilePath}`);
const original = readFileSync(profilePath, 'utf8');

const hasCredentials = !restore && !noCredentials && existsSync(credentialsPath);
let entries = [];

if (!hasCredentials) {
  console.log(
    `[prepare-signing] signing disabled (${noCredentials ? '--no-credentials' : `no credentials at ${credentialsPath}`}) -> clean state`
  );
}

if (hasCredentials) {
  const credentials = JSON.parse(readFileSync(credentialsPath, 'utf8'));
  for (const field of ['storeFile', 'keyAlias', 'certpath', 'profile', 'signAlg']) {
    if (!credentials[field]) throw new Error(`credentials.json is missing "${field}"`);
  }
  const storeFile = path.resolve(credentials.storeFile);
  const certPath = path.resolve(credentials.certpath);
  const profileFile = path.resolve(credentials.profile);
  for (const [label, file] of [['storeFile', storeFile], ['certpath', certPath], ['profile', profileFile]]) {
    if (!existsSync(file)) throw new Error(`credentials.json ${label} does not exist: ${file}`);
  }

  const materialDir = path.resolve(
    materialDirOverride || credentials.material || materialDirFor(storeFile)
  );
  const mode = credentials.passwordMode || 'encrypted';
  let storePassword;
  let keyPassword;

  if (mode === 'plaintext') {
    storePassword = credentials.storePassword;
    keyPassword = credentials.keyPassword ?? credentials.storePassword;
    if (!storePassword || !keyPassword) throw new Error('credentials.json is missing storePassword/keyPassword');
  } else {
    if (!credentials.storePassword || !credentials.keyPassword) {
      throw new Error(`credentials.json is missing storePassword/keyPassword (passwordMode=${mode})`);
    }
    if (!existsSync(materialDir)) {
      // hvigor can only read encrypted passwords, so without material there is
      // no way to hand it a usable credential - create one instead of failing.
      console.log(`[prepare-signing] no material at ${materialDir} -> generating one`);
      createMaterial(materialDir);
    }
    assertMaterialDir(materialDir);
    // In passwordMode "encrypted" the values are normally plaintext to be
    // encrypted here. A pre-encrypted value can be supplied instead; it is
    // recognised by shape (hvigor rejects anything under 32 chars, so real
    // plaintext passwords never collide with 32+ hex digits).
    const looksEncrypted = (v) => /^[0-9a-fA-F]{32,}$/.test(v) && v.length % 2 === 0;
    const preEncrypted = looksEncrypted(credentials.storePassword) || looksEncrypted(credentials.keyPassword);

    if (preEncrypted) {
      storePassword = credentials.storePassword;
      keyPassword = credentials.keyPassword;
      try {
        if (decryptSecret(materialDir, storePassword) !== credentials.storePassword) throw new Error('mismatch');
        if (decryptSecret(materialDir, keyPassword) !== credentials.keyPassword) throw new Error('mismatch');
      } catch (e) {
        throw new Error(
          `credentials.json storePassword/keyPassword look like hvigor ciphertext but do not decrypt with the material at\n` +
            `  ${materialDir}\n` +
            `  Either point "material" at the material those values were produced with, or put the real plaintext\n` +
            `  passwords in credentials.json and let this script encrypt them.\n` +
            `  (${e.message})`
        );
      }
    } else {
      storePassword = encryptSecret(materialDir, credentials.storePassword);
      keyPassword = encryptSecret(materialDir, credentials.keyPassword);
      // self-check: prove the ciphertext we are about to write decrypts back.
      if (decryptSecret(materialDir, storePassword) !== credentials.storePassword) {
        throw new Error('internal error: storePassword round-trip failed');
      }
      if (decryptSecret(materialDir, keyPassword) !== credentials.keyPassword) {
        throw new Error('internal error: keyPassword round-trip failed');
      }
      // Reuse the ciphertext already in build-profile.json5 when it decrypts to
      // the same plaintext. GCM uses a fresh random IV every call, so without
      // this a re-run would rewrite the file with equivalent-but-different
      // ciphertext (and the script would never look idempotent).
      const existing = currentSigningMaterial(original);
      if (existing) {
        for (const [field, plain] of [
          ['storePassword', credentials.storePassword],
          ['keyPassword', credentials.keyPassword],
        ]) {
          const old = existing[field];
          if (!old) continue;
          try {
            if (decryptSecret(materialDir, old) === plain) {
              if (field === 'storePassword') storePassword = old;
              else keyPassword = old;
            }
          } catch {
            /* different material or not our ciphertext - just re-encrypt */
          }
        }
      }
    }
    console.log(
      `[prepare-signing] passwords encrypted with material key from ${materialDir} (hvigor decrypts these)`
    );
  }

  entries = [
    {
      name: credentials.name || 'default',
      type: credentials.type || 'HarmonyOS',
      material: {
        certpath: certPath,
        storePassword,
        keyAlias: credentials.keyAlias,
        keyPassword,
        profile: profileFile,
        signAlg: credentials.signAlg,
        storeFile,
      },
    },
  ];
}

if (restore && existsSync(backupPath)) {
  const backup = readFileSync(backupPath, 'utf8');
  if (!dryRun) writeFileSync(profilePath, backup, 'utf8');
  console.log(`[prepare-signing] restored build-profile.json5 from ${backupPath}`);
  process.exit(0);
}

const { text, changed } = replaceSigningConfigs(original, renderSigningBlock(entries, '      '));

if (!changed) {
  console.log('[prepare-signing] no change needed (already up to date)');
  process.exit(0);
}
if (dryRun) {
  console.log('[prepare-signing] --dry-run, would write:');
  console.log(text);
  process.exit(0);
}
if (hasCredentials) {
  const alreadyClean = /^[ \t]*"signingConfigs"[ \t]*:[ \t]*\[[ \t]*\][ \t]*,?[ \t]*$/m.test(original);
  if (!alreadyClean) {
    console.warn(
      '[prepare-signing] WARNING: signingConfigs was not empty, so the pristine state could not be backed up.'
    );
  }
  if (!existsSync(backupPath) && alreadyClean) {
    mkdirSync(path.dirname(backupPath), { recursive: true });
    writeFileSync(backupPath, original, 'utf8');
    console.log(`[prepare-signing] backed up pristine build-profile.json5 -> ${backupPath}`);
  }
}
writeFileSync(profilePath, text, 'utf8');
console.log(
  `[prepare-signing] ${profilePath}: signingConfigs <- ${entries.length === 0 ? '[] (clean, signing disabled)' : entries[0].name}`
);
