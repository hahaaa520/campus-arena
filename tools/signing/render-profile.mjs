#!/usr/bin/env node
// ============================================================================
//  render-profile.mjs
//
//  Turns DevEco Studio's UnsgnedReleasedProfileTemplate.json into a concrete
//  provision profile for this app:
//    * bundle-info.bundle-name        <- --bundle
//    * bundle-info.developer-id       <- --developer
//    * bundle-info.distribution-certificate <- the leaf of --cert (PEM)
//    * validity.not-before/not-after  <- now-1d .. now+10y (template values
//      expired in 2023, which makes hap-sign-tool silently produce a profile
//      the device would reject)
//    * adds bundle-info.app-identifier (HarmonyOS apps carry one; for the
//      local test chain it is simply the bundle name)
//
//  Usage:
//    node render-profile.mjs --template <tpl.json> --out <out.json>
//         --cert <app-cert-chain.cer> [--bundle <name>] [--developer <id>]
// ============================================================================
import { readFileSync, writeFileSync } from 'node:fs';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    if (!key.startsWith('--')) throw new Error(`unexpected argument: ${key}`);
    out[key.slice(2)] = argv[i + 1];
  }
  return out;
}

/** Split a PEM bundle into individual certificates. */
function pemCerts(text) {
  const re = /-----BEGIN CERTIFICATE-----([\s\S]*?)-----END CERTIFICATE-----/g;
  const found = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    found.push(m[0]);
  }
  if (found.length === 0) throw new Error('no certificate found in input');
  return found;
}

/**
 * Re-encode a PEM certificate the way the profile template does it:
 * a single JSON string with literal "\n" escapes and a trailing newline.
 */
function toProfilePem(pem) {
  const b64 = pem
    .replace(/-----[^-]+-----/g, '')
    .replace(/\s+/g, '');
  const body = (b64.match(/.{1,64}/g) || []).join('\n');
  return `-----BEGIN CERTIFICATE-----\n${body}\n-----END CERTIFICATE-----\n`;
}

const args = parseArgs(process.argv.slice(2));
for (const required of ['template', 'out', 'cert']) {
  if (!args[required]) throw new Error(`--${required} is required`);
}

const template = JSON.parse(readFileSync(args.template, 'utf8'));
const chain = pemCerts(readFileSync(args.cert, 'utf8'));
const leaf = chain[0]; // leaf first, then sub CA, then root

const nowSec = Math.floor(Date.now() / 1000);
const bundleName = args.bundle || template['bundle-info']['bundle-name'];

template['app-distribution-type'] = args.distribution || 'os_integration';
template.validity = {
  'not-before': nowSec - 86400,
  'not-after': nowSec + 10 * 365 * 86400,
};
template['bundle-info']['bundle-name'] = bundleName;
template['bundle-info']['developer-id'] = args.developer || 'CampusArena';
template['bundle-info']['app-identifier'] = args['app-identifier'] || bundleName;
template['bundle-info']['distribution-certificate'] = toProfilePem(leaf);

writeFileSync(args.out, JSON.stringify(template, null, 4) + '\n', 'utf8');
console.log(`[render-profile] wrote ${args.out}`);
console.log(`[render-profile] bundle-name=${bundleName} validity=${template.validity['not-before']}..${template.validity['not-after']}`);
console.log(`[render-profile] leaf certificate: ${pemCerts(readFileSync(args.cert, 'utf8')).length} cert(s) in chain, leaf first`);
