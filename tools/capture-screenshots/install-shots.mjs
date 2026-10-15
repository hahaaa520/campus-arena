#!/usr/bin/env node
/**
 * Copy freshly captured screenshots into the AppGallery submission pack.
 *
 * Reads tools/capture-screenshots/out/*.jpg and copies them to
 * <AGC材料目录>/assets/screenshots/, replacing any previous copies.
 *
 * Usage:
 *   node install-shots.mjs [targetDir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, 'out');
const DEFAULT_TARGET = 'D:\\开源作业\\AGC上架材料\\assets\\screenshots';

const target = process.argv[2] || DEFAULT_TARGET;

if (!fs.existsSync(SRC)) {
  console.error(`没有找到截图目录：${SRC}`);
  console.error('请先运行 run.cmd（或 node shoot.js shots.json）。');
  process.exit(1);
}

const files = fs.readdirSync(SRC)
  .filter((n) => /\.(jpg|jpeg|png)$/i.test(n) && !/SettingConfig/i.test(n))
  .sort();

if (files.length === 0) {
  console.error(`${SRC} 下没有截图。`);
  process.exit(1);
}

fs.mkdirSync(target, { recursive: true });

let copied = 0;
let totalBytes = 0;
for (const name of files) {
  const from = path.join(SRC, name);
  const to = path.join(target, name);
  fs.copyFileSync(from, to);
  const size = fs.statSync(to).size;
  totalBytes += size;
  copied += 1;
  console.log(`  ✓ ${name}  ${(size / 1024).toFixed(0)} KB`);
}

console.log(`\n已复制 ${copied} 张截图到：${target}`);
console.log(`合计 ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
console.log('\n下一步：用 check_screenshots.py 校验规格：');
console.log('  python "D:\\开源作业\\AGC上架材料\\tools\\check_screenshots.py"');
