/*
 * shoot.js - headless DevEco Previewer screenshot tool  (Campus Arena)
 * ===========================================================================
 * Renders the REAL ArkTS page with the DevEco Studio Previewer engine and
 * writes real screenshots: no GUI, no window, no IDE, no emulator.
 *
 *   node shoot.js shots.json
 *
 * These are genuine renders of the shipped application bytecode
 * (entry/.preview/.../modules.abc), not mockups. AppGallery requires
 * screenshots that reflect the actual app, so that distinction matters.
 *
 * ---------------------------------------------------------------------------
 * How it works (reverse-engineered from DevEco Studio 5.0.13.240)
 * ---------------------------------------------------------------------------
 * Previewer.exe is a *client* of two named pipes:
 *     \\.\pipe\<prefix>_commandPipe   JSON + NUL terminated, both directions
 *     \\.\pipe\<prefix>_imagePipe     legacy frame stream (unused on API 17)
 *
 * On API 17 it renders offscreen into a VirtualScreen, JPEG-encodes the frame
 * (VirtualScreenImpl::RgbToJpg) and serves it from its OWN WebSocket server
 * bound to 127.0.0.1 on an ephemeral port. It announces that port over the
 * command pipe, but with an empty value when run standalone - so the port is
 * discovered from the OS via `netstat -ano` filtered by PID.
 *
 * Each WebSocket binary message is a 40-byte header plus payload:
 *     [0..3]   magic 0x12345678
 *     [12..15] width  (BE u32)
 *     [16..19] height (BE u32)
 *     [20..21] type   (2 = JPEG; 0 = raw RGBA; 1 = raw RGBA sub-rect)
 *     [40..]   0xFF 0xD8 ... 0xFF 0xD9  (JPEG)
 *
 * There is NO native window (MainWindowHandle = 0), so PrintWindow/BitBlt are
 * neither usable nor needed, and no interactive desktop session is required.
 * Previewer.exe has no --screenshot flag.
 *
 * UI automation is done by injecting mouse events over the command pipe:
 *     {"version":"1.0.1","command":"MousePress","type":"action",
 *      "args":{"x":<px>,"y":<px>,"duration":0}}\0
 * Coordinates are in rendered device pixels (0..width, 0..height).
 */
'use strict';

const net = require('net');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn, execSync } = require('child_process');

const DEVECO = 'C:\\Program Files\\Huawei\\DevEco Studio';
const PREVIEWER = path.join(DEVECO, 'sdk\\default\\openharmony\\previewer\\common\\bin\\Previewer.exe');
const DEVICE_CFG_DIR = path.join(
  DEVECO, 'plugins\\openharmony\\openharmony-preview-server\\deviceConfigJson');

const cfgPath = process.argv[2];
if (!cfgPath) { console.error('usage: node shoot.js <config.json>'); process.exit(2); }
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));

const PROJECT = cfg.project || 'D:\\CampusArena';
const MODULE = cfg.module || 'entry';
const PAGE = cfg.page || 'pages/Index';
const DEVICE = cfg.device || '2in1';
const W = cfg.width || 1920;
const H = cfg.height || 1080;
const DPI = cfg.dpi || 160;
const OUT = path.resolve(path.dirname(cfgPath), cfg.outDir || 'out');
const SETTLE = cfg.settleMs || 2500;

const PREV_ROOT = path.join(PROJECT, MODULE, '.preview', 'default');
const LOADER_OUT = path.join(PREV_ROOT, 'intermediates', 'loader_out', 'default', 'ets');
const LOADER_JSON = path.join(PREV_ROOT, 'intermediates', 'loader', 'default', 'loader.json');
const RES_DIR = path.join(PREV_ROOT, 'intermediates', 'res', 'default');

const ts = () => new Date().toISOString().slice(11, 23);
const log = (...a) => console.log(ts(), ...a);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function mustExist(p, what) {
  if (fs.existsSync(p)) return;
  console.error(`MISSING ${what}: ${p}\n\nBuild the preview artifacts first:\n` +
    `  cmd /c "cd /d ${PROJECT} && tools\\build.cmd --mode module -p module=${MODULE}@default ` +
    `-p product=default -p buildRoot=.preview -p previewer.replace.page=${PAGE} ` +
    `-p previewer.replace.srcPath=${MODULE}/src/main/ets PreviewBuild --no-daemon"\n` +
    `(PreviewBuild stays in watch mode after success - kill it once modules.abc appears.)\n`);
  process.exit(2);
}
mustExist(LOADER_OUT, 'preview loader_out (modules.abc)');
mustExist(LOADER_JSON, 'loader.json');
mustExist(RES_DIR, 'preview resources');

fs.mkdirSync(OUT, { recursive: true });

/* --------------------------------------------------------------- device cfg */
function deviceConfigFile() {
  const src = path.join(DEVICE_CFG_DIR, `${DEVICE}SettingConfig.json`);
  const dst = path.join(OUT, `${DEVICE}SettingConfig.json`);
  if (fs.existsSync(src)) {
    const j = JSON.parse(fs.readFileSync(src, 'utf8'));
    try {
      j.frontend['1.0.0'].Resolution.args.Resolution = `${W}*${H}`;
      j.frontend['1.0.0'].DeviceType.args.DeviceType = DEVICE;
    } catch (e) { /* keep whatever the template had */ }
    fs.writeFileSync(dst, JSON.stringify(j, null, 2));
  } else {
    fs.writeFileSync(dst, JSON.stringify({
      setting: { '1.0.1': { Language: { args: { Language: 'zh-CN' } } } },
      frontend: {
        '1.0.0': {
          Resolution: { args: { Resolution: `${W}*${H}` } },
          DeviceType: { args: { DeviceType: DEVICE } }
        }
      }
    }, null, 2));
  }
  return dst;
}

/* ------------------------------------------------------------------ arg list */
const PREFIX = 'shot' + Date.now() + '_1';
const CMD_PIPE = '\\\\.\\pipe\\' + PREFIX + '_commandPipe';
const IMG_PIPE = '\\\\.\\pipe\\' + PREFIX + '_imagePipe';

function buildArgs() {
  return [
    '-refresh', 'region',
    '-projectID', 'CampusArenaShots',
    '-ts', PREFIX + '_tracePipe',
    '-j', LOADER_OUT,
    '-s', PREFIX,
    '-cpm', 'false',
    '-device', DEVICE,
    '-shape', 'rect',
    '-sd', String(DPI),
    '-or', String(W), String(H),
    '-cr', String(Math.round(W / 2)), String(Math.round(H / 2)),
    '-ljPath', LOADER_JSON,
    '-n', MODULE,
    '-url', PAGE,
    '-arp', RES_DIR,
    '-av', 'ACE_2_0',
    '-pm', 'Stage',
    '-pages', 'main_pages',
    '-l', cfg.language || 'zh_CN',
    '-cm', cfg.colorMode || 'light',
    '-o', W >= H ? 'landscape' : 'portrait',
    '-f', deviceConfigFile()
  ];
}

/* ------------------------------------------------------------------ runtime */
let cmdSocket = null;
let lastFrame = null;
let frameCount = 0;
let child = null;
let inFlight = null;

function writeCmd(obj) {
  if (!cmdSocket) return false;
  try { cmdSocket.write(JSON.stringify(obj) + '\0'); return true; } catch (e) { return false; }
}

function click(x, y) {
  const base = { version: '1.0.1', type: 'action', args: { x, y, duration: 0 } };
  writeCmd({ ...base, command: 'MousePress' });
  setTimeout(() => writeCmd({ ...base, command: 'MouseRelease' }), 70);
  log(`  click(${x}, ${y})`);
}

function nextFrame(timeoutMs) {
  return new Promise((resolve) => {
    const t = setTimeout(() => { inFlight = null; resolve(null); }, timeoutMs);
    inFlight = (f) => { clearTimeout(t); inFlight = null; resolve(f); };
  });
}

function startCommandServer() {
  net.createServer((sock) => {
    log('[cmdpipe] engine connected');
    cmdSocket = sock;
    const send = (o) => { try { sock.write(JSON.stringify(o) + '\0'); } catch (e) { } };
    send({ version: '1.0.1', command: 'Language', type: 'get' });
    send({ version: '1.0.1', command: 'SupportedLanguages', type: 'get' });
    let acc = '';
    sock.on('data', (d) => { acc += d.toString('utf8'); });
    sock.on('error', () => { });
    sock.on('close', () => { if (cmdSocket === sock) cmdSocket = null; });
  }).listen(CMD_PIPE, () => log('[cmdpipe] listening'));
}

function startImageServer() {
  net.createServer((sock) => {
    sock.on('data', () => { /* legacy path unused on API 17 */ });
    sock.on('error', () => { });
  }).listen(IMG_PIPE, () => log('[imgpipe] listening'));
}

function handlePayload(payload, w, h) {
  frameCount++;
  lastFrame = { buf: payload, w, h };
  if (inFlight) inFlight(lastFrame);
}

function wsConnect(port) {
  const key = crypto.randomBytes(16).toString('base64');
  const s = net.connect(port, '127.0.0.1', () => {
    s.write(`GET / HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nUpgrade: websocket\r\n` +
      `Connection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`);
  });
  let buf = Buffer.alloc(0), hs = false;
  s.on('data', (d) => {
    buf = Buffer.concat([buf, d]);
    if (!hs) {
      const i = buf.indexOf('\r\n\r\n');
      if (i === -1) return;
      const head = buf.slice(0, i).toString();
      buf = buf.slice(i + 4);
      if (!/ 101 /.test(head)) { log('[ws] rejected:', head.split('\r\n')[0]); s.destroy(); return; }
      hs = true; log('[ws] connected on port', port);
    }
    for (;;) {
      if (buf.length < 2) break;
      const op = buf[0] & 0x0f;
      let len = buf[1] & 0x7f, off = 2;
      if (len === 126) { if (buf.length < 4) break; len = buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (buf.length < 10) break; len = Number(buf.readBigUInt64BE(2)); off = 10; }
      if (buf.length < off + len) break;
      const p = buf.slice(off, off + len);
      buf = buf.slice(off + len);
      if (op !== 2 && op !== 1) continue;
      if (p.length > 40 && p.slice(0, 4).toString('hex') === '12345678') {
        handlePayload(p.slice(40), p.readUInt32BE(12), p.readUInt32BE(16));
      } else {
        handlePayload(p, W, H);
      }
    }
  });
  s.on('error', (e) => log('[ws] error', e.message));
  return s;
}

function listeningPorts(pid) {
  try {
    const out = execSync('netstat -ano -p TCP', { encoding: 'utf8' });
    const ports = new Set();
    for (const line of out.split(/\r?\n/)) {
      const m = line.trim().match(/^TCP\s+\S+:(\d+)\s+\S+\s+LISTENING\s+(\d+)$/);
      if (m && Number(m[2]) === pid) ports.add(Number(m[1]));
    }
    return [...ports];
  } catch (e) { return []; }
}

function saveFrame(name) {
  if (!lastFrame) { log(`!! no frame for ${name}`); return null; }
  const file = path.join(OUT, `${name}.jpg`);
  fs.writeFileSync(file, lastFrame.buf);
  log(`saved ${path.basename(file)}  (${lastFrame.w}x${lastFrame.h}, ${lastFrame.buf.length} bytes)`);
  return file;
}

/* --------------------------------------------------------------------- main */
(async () => {
  log('config:', JSON.stringify({ PROJECT, DEVICE, W, H, DPI, PAGE, OUT }));
  startCommandServer();
  startImageServer();

  child = spawn(PREVIEWER, buildArgs(), { cwd: path.dirname(PREVIEWER), windowsHide: true });
  log('previewer pid', child.pid);
  const pvLog = fs.createWriteStream(path.join(OUT, 'previewer.log'));
  child.stdout.on('data', (d) => pvLog.write(d));
  child.stderr.on('data', (d) => pvLog.write(d));
  child.on('exit', (c, s) => log('previewer exited', c, s));

  let ws = null;
  for (let i = 0; i < 40 && !ws; i++) {
    await wait(1000);
    for (const p of listeningPorts(child.pid)) { ws = wsConnect(p); break; }
    if (!ws && i % 5 === 4) log('  ...waiting for engine websocket');
  }
  if (!ws) { log('FATAL: engine websocket never appeared'); child.kill(); process.exit(3); }

  log('waiting for first frame...');
  const first = await nextFrame(45000);
  if (!first) { log('FATAL: no frame received'); child.kill(); process.exit(4); }
  log(`first frame: ${first.w}x${first.h}, ${first.buf.length} bytes`);

  let saved = 0;
  for (const shot of cfg.shots || []) {
    // UI automation: mouse clicks in rendered device pixels.
    // Supports both `clicks: [[x,y], ...]` and the single `click: [x,y]`.
    const clicks = shot.clicks || (shot.click ? [shot.click] : []);
    if (clicks.length > 0) {
      await wait(shot.beforeMs || 800);
      for (const [x, y] of clicks) {
        click(x, y);
        await wait(shot.betweenMs || 1200);
      }
    }
    await wait(shot.settleMs || SETTLE);
    if (saveFrame(shot.name)) saved++;
  }

  writeCmd({ version: '1.0.0', command: 'exit', type: 'action' });
  await wait(700);
  try { child.kill(); } catch (e) { }
  await wait(500);
  log(`done. frames received: ${frameCount}, saved: ${saved}`);
  process.exit(saved > 0 ? 0 : 5);
})().catch((e) => { console.error(e); try { child.kill(); } catch (_) { } process.exit(1); });
