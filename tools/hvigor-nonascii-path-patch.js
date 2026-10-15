'use strict';
/**
 * hvigor CLI preload patch for non-ASCII (CJK) project paths.
 *
 * The hvigor that ships with DevEco Studio refuses to build when the project
 * path contains CJK characters. Two separate guards do this:
 *
 *   1. ProjectInspection#projectPathInspection  (project-inspection.js)
 *        process.cwd() tested against
 *        /(([A-z]):)(\\[a-zA-Z0-9-_.()\s@]+)*(\\?)$/
 *        -> "Invalid project path. Please move the project to a valid path"
 *
 *   2. AbstractPreBuild#checkPathChinese        (abstract-pre-build.js)
 *        every module node path tested against /[\u4e00-\u9fff]/
 *        -> "The Node directory and node name cannot contain Chinese characters."
 *
 * This workspace lives under D:\<CJK>\ , so both guards fire and no CLI build
 * can complete. This preload replaces ONLY those two methods with permissive
 * versions. It is loaded via NODE_OPTIONS=--require <this file>, lives entirely
 * inside the project, and modifies nothing in the DevEco Studio installation.
 *
 * To disable: unset NODE_OPTIONS.  To restore stock behaviour: delete this file.
 */
const Module = require('module');

/** Methods replaced with permissive stubs, by name. */
const STUBS = {
  // Guard 1: project path must match an ASCII-only pattern.
  projectPathInspection: function projectPathInspection() {
    return this;
  },
  // Guard 2: module node paths must not contain CJK characters.
  checkPathChinese: function checkPathChinese() {
    return undefined;
  }
};

const STUB_NAMES = Object.keys(STUBS);
const MARKER = '__nonAsciiPathPatch__';

function patchModuleExports(exported) {
  if (exported === null || exported === undefined) {
    return;
  }
  const type = typeof exported;
  if (type !== 'object' && type !== 'function') {
    return;
  }

  let keys;
  try {
    keys = Object.keys(exported);
  } catch (err) {
    return;
  }

  for (const key of keys) {
    let candidate;
    try {
      candidate = exported[key];
    } catch (err) {
      continue;
    }
    const proto = candidate && candidate.prototype;
    if (!proto || (typeof proto !== 'object' && typeof proto !== 'function')) {
      continue;
    }
    for (const name of STUB_NAMES) {
      if (proto[MARKER + name] === true) {
        continue;
      }
      if (typeof proto[name] !== 'function') {
        continue;
      }
      try {
        proto[name] = STUBS[name];
        Object.defineProperty(proto, MARKER + name, { value: true });
      } catch (err) {
        // Non-writable prototype slot: nothing we can do, skip it.
      }
    }
  }
}

const originalLoad = Module._load;

Module._load = function patchedLoad(request, parent, isMain) {
  const exported = originalLoad.apply(this, arguments);
  try {
    const resolved = Module._resolveFilename(request, parent, isMain);
    // Only ever touch hvigor's own modules.
    if (typeof resolved === 'string' && resolved.indexOf('hvigor') !== -1) {
      patchModuleExports(exported);
    }
  } catch (err) {
    // Never let the patch itself break a build.
  }
  return exported;
};
