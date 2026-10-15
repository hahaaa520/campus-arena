"""Artifact sanity checks for the built HarmonyOS packages.

Verifies what AppGallery validates on upload, against the real build output
rather than the source.

Two different artifacts, with deliberately different rules:

  entry-default-unsigned.hap   built by `assembleHap`
      The LOCAL TEST artifact. HarmonyOS sets debug=true here, which
      AppGallery REJECTS ("API >= 11 时不可含调试信息"). Only structural
      checks are enforced; debug=true is reported as informational.

  CampusArena-default-unsigned.app   built by `assembleApp`
      The SUBMISSION artifact. Its inner HAP is built in release mode, so
      debug must not be true. All checks are enforced strictly here.
"""
import io
import json
import os
import sys
import zipfile

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HAP = os.path.join(ROOT, "entry", "build", "default", "outputs", "default",
                   "entry-default-unsigned.hap")
APP = os.path.join(ROOT, "build", "outputs", "default", "CampusArena-default-unsigned.app")

EXPECTED_BUNDLE = "com.campusarena.scheduler"

GREEN, RED, YELLOW, DIM, RESET = "\033[32m", "\033[31m", "\033[33m", "\033[2m", "\033[0m"
if os.name == "nt" and not os.environ.get("WT_SESSION"):
    GREEN = RED = YELLOW = DIM = RESET = ""

failures = []


def check(label, ok, detail=""):
    mark = f"{GREEN}✓{RESET}" if ok else f"{RED}✗{RESET}"
    print(f"  {mark} {label}" + (f"  {DIM}{detail}{RESET}" if detail else ""))
    if not ok:
        failures.append(label)


def info(label, detail=""):
    print(f"  {YELLOW}i{RESET} {label}" + (f"  {DIM}{detail}{RESET}" if detail else ""))


def inspect_hap(data, strict):
    """Validate a HAP's module.json. When strict, debug=true is a failure."""
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        names = z.namelist()
        check("包含 module.json", "module.json" in names)
        check("包含 resources.index", "resources.index" in names)
        check("包含编译后的 ArkTS 字节码", any(n.endswith("modules.abc") for n in names),
              next((n for n in names if n.endswith("modules.abc")), ""))

        m = json.loads(z.read("module.json").decode("utf-8"))
        app = m.get("app", {})
        mod = m.get("module", {})

        check("bundleName 与 AGC 待注册包名一致",
              app.get("bundleName") == EXPECTED_BUNDLE, app.get("bundleName", "(missing)"))
        check("deviceTypes 含 2in1（鸿蒙电脑）",
              "2in1" in (mod.get("deviceTypes") or []), str(mod.get("deviceTypes")))
        check("installationFree = false（官方要求非免安装）",
              mod.get("installationFree") is False, str(mod.get("installationFree")))

        perms = mod.get("requestPermissions") or []
        check("未申请任何权限（单机应用免备案的依据）", len(perms) == 0,
              "无" if not perms else ", ".join(p.get("name", "?") for p in perms))

        abilities = mod.get("abilities") or []
        check("存在入口 Ability 且 exported",
              any(a.get("exported") for a in abilities),
              ", ".join(a.get("name", "?") for a in abilities))
        check("app.label 非空（官方要求）", bool(app.get("label")), str(app.get("label")))

        is_debug = app.get("debug") is True
        if strict:
            check("debug 不为 true（AppGallery 拒绝含调试信息的包）", not is_debug,
                  f"debug={app.get('debug')}")
        else:
            if is_debug:
                info("debug=true", "本地测试包，正常；上传用的是 .app 里的 release HAP")
            else:
                info("debug=false")
        return mod


# --------------------------------------------------------------------------
# 1. local test HAP
# --------------------------------------------------------------------------
print(f"{DIM}── 本地测试包 assembleHap ──{RESET}")
print(f"  {DIM}{HAP}{RESET}")
if not os.path.isfile(HAP):
    check("HAP 文件存在", False, "先运行 tools\\build.cmd assembleHap")
else:
    check("HAP 文件存在", True, f"{os.path.getsize(HAP):,} bytes")
    with open(HAP, "rb") as fh:
        inspect_hap(fh.read(), strict=False)

# --------------------------------------------------------------------------
# 2. submission .app
# --------------------------------------------------------------------------
print()
print(f"{DIM}── 上架包 assembleApp（AGC 实际接收的就是它）──{RESET}")
print(f"  {DIM}{APP}{RESET}")
if not os.path.isfile(APP):
    check(".app 产物存在", False, "运行 tools\\build.cmd assembleApp")
else:
    check(".app 产物存在", True, f"{os.path.getsize(APP):,} bytes")
    with zipfile.ZipFile(APP) as z:
        names = z.namelist()
        inner = [n for n in names if n.endswith(".hap")]
        check(".app 内含 .hap", len(inner) > 0, ", ".join(inner))
        check(".app 内含 pack.info", "pack.info" in names)

        if "pack.info" in names:
            pi = json.loads(z.read("pack.info").decode("utf-8"))
            summary = pi.get("summary", {})
            a = summary.get("app", {})
            check("pack.info 的 bundleName 一致",
                  a.get("bundleName") == EXPECTED_BUNDLE, a.get("bundleName", ""))
            check("pack.info 的 bundleType = app",
                  a.get("bundleType") == "app", a.get("bundleType", ""))

        if inner:
            print(f"  {DIM}  内层 release HAP：{inner[0]}{RESET}")
            inspect_hap(z.read(inner[0]), strict=True)

# --------------------------------------------------------------------------
print()
if failures:
    print(f"  {RED}{len(failures)} 项检查未通过：{RESET}")
    for f in failures:
        print(f"    · {f}")
    sys.exit(1)

print(f"  {GREEN}全部产物检查通过。{RESET}")
print(f"  {DIM}上传 AGC 用的是 .app（release 构建）；"
      f"tools\\build.cmd assembleHap 产出的是 debug 包，只用于本地测试。{RESET}")
print(f"  {DIM}正式上架还需用发布证书 + 发布 Profile 重新签名，见《03-上架操作手册.md》。{RESET}")
sys.exit(0)
