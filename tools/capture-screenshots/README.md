# 无头截图工具（DevEco 预览器）

用 DevEco Studio 自带的 **Previewer.exe** 把真实页面渲染成截图：**无 GUI、无窗口、无模拟器、无 IDE**。

> 产出的是**真实运行截图**——渲染的是应用真正编译出来的 ArkTS 字节码
> （`entry/.preview/.../modules.abc`），不是设计稿或合成图。
> AppGallery 要求截图体现应用实际内容，所以这个区别很重要。

---

## 一、为什么需要它

AGC 对 PC/2in1 截图的要求是硬的：**3–10 张、1920×1080、16:9、PNG/JPG、≤5MB、内容互不相同**。

而本机没有可用的鸿蒙模拟器镜像，真机安装又需要 AGC 调试证书（得先有开发者账号）。
这个工具绕开了这两者：直接用 DevEco 预览器的渲染引擎出图。

---

## 二、用法

### 第 1 步：构建预览产物

```cmd
cd /d D:\CampusArena
tools\build.cmd --mode module -p module=entry@default -p product=default ^
  -p buildRoot=.preview -p previewer.replace.page=pages/Index ^
  -p previewer.replace.srcPath=entry/src/main/ets PreviewBuild --no-daemon
```

产物：

```
entry\.preview\default\intermediates\loader_out\default\ets\modules.abc
entry\.preview\default\intermediates\loader\default\loader.json
entry\.preview\default\intermediates\res\default\resources.index
```

> ⚠️ **两个坑**：
> 1. 该任务打印 `BUILD SUCCESSFUL` 后会**停在 watch 模式不退出**，看到 `modules.abc` 生成即可 `Ctrl+C`。
> 2. watch 增量阶段会报一个 `RollupError: Unexpected token`，**无害**，产物已经生成。

**修改应用源码后必须重新执行这一步**，否则截的还是旧代码的画面。

### 第 2 步：截图

```cmd
tools\capture-screenshots\run.cmd
```

它会：渲染 6 个页面 → 存 JPEG 到 `out\` → 复制到 `AGC上架材料\assets\screenshots\`。

---

## 三、工作原理

这部分是逆向 DevEco Studio 5.0.13.240 的启动链路得到的，记录下来免得以后重新踩。

### 3.1 命名管道

Previewer.exe 是命名管道的**客户端**，需要外部先监听：

| 管道 | 用途 |
|---|---|
| `\\.\pipe\<prefix>_commandPipe` | JSON + `\0` 结尾，**双向** |
| `\\.\pipe\<prefix>_imagePipe` | 旧版帧流；**API 17 已不用**（实测 0 字节） |

### 3.2 图像怎么拿到

API 17 改为：离屏渲染进 VirtualScreen → `VirtualScreenImpl::RgbToJpg` 编码成 JPEG
→ 通过**它自己的 WebSocket 服务**（`127.0.0.1` 随机端口）推送二进制帧。

- 端口公告字段是**空字符串**，所以要用 `netstat -ano -p TCP` 按 PID 反查监听端口。
- 帧格式：**40 字节头 + 载荷**

| 偏移 | 内容 |
|---|---|
| `[0..3]` | magic `0x12345678` |
| `[12..15]` | 宽度（BE u32） |
| `[16..19]` | 高度（BE u32） |
| `[20..21]` | 类型：`2`=JPEG，`0`=原始 RGBA，`1`=原始 RGBA 子矩形 |
| `[40..]` | `FF D8 … FF D9`（JPEG） |

- **没有原生窗口**（`MainWindowHandle = 0`），所以 `PrintWindow` / `BitBlt` 既不可用也无必要，
  也不依赖交互式桌面会话。
- Previewer.exe **没有** `--screenshot` 之类的旗标（二进制里 `screenshot`/`snapshot` 字符串为零）。

### 3.3 UI 自动化

通过命令管道注入鼠标事件（`\0` 结尾的 JSON），坐标是**渲染像素**：

```json
{"version":"1.0.1","command":"MousePress","type":"action","args":{"x":107,"y":300,"duration":0}}
{"version":"1.0.1","command":"MouseRelease","type":"action","args":{"x":107,"y":300,"duration":0}}
```

### 3.4 实际生效的命令行参数

`Previewer.exe --help` 不存在（会报 `[FATAL] Start args is invalid.`）。实测生效的参数：

```
-refresh region -projectID <id> -ts <prefix>_tracePipe -j <loader_out\default\ets>
-s <prefix> -cpm false -device 2in1 -shape rect -sd 160
-or 1920 1080 -cr 960 540 -ljPath <loader.json> -n entry -url pages/Index
-arp <res\default> -av ACE_2_0 -pm Stage -pages main_pages
-l zh_CN -cm light -o landscape -f <2in1SettingConfig.json>
```

> 网上流传的 `--screenShape` / `--oriented` / `--jsonPath` / `--colorMode` / `--deviceType`
> 等**都不是真实参数名**。真实的是 `-shape` / `-o` / `-ljPath` / `-cm` / `-device` 这一套短名。
> 华为**未发布**预览器 CLI 的官方文档，以上来自逆向 `plugins\openharmony\lib\ohos-preview-plugin-5.0.13.240.jar`
> 与 `plugins\openharmony\openharmony-preview-server\index.js`。
> 参考开源仓库：[openharmony/ide_previewer](https://github.com/openharmony/ide_previewer)。

---

## 四、调整截图内容

编辑 [`shots.json`](shots.json)：

```jsonc
{
  "width": 1920, "height": 1080, "dpi": 160, "device": "2in1",
  "shots": [
    { "name": "01-赛事总览" },                                   // 直接截
    { "name": "02-赛事配置", "click": [107, 168] },               // 先点一下再截
    { "name": "04-赛程编排", "clicks": [[107,300],[427,196]] }    // 连点两下再截
  ]
}
```

| 字段 | 含义 |
|---|---|
| `click: [x, y]` | 截图前点一次 |
| `clicks: [[x,y], …]` | 截图前依次点多次 |
| `betweenMs` | 多点之间的间隔（默认 1200ms） |
| `settleMs` | 点击后等待界面稳定的时间（默认 2500ms） |

**左侧导航的坐标**（1920×1080 下）：`x ≈ 107`，`y` 从 `102` 起每行 **+66**。

| 页面 | 坐标 |
|---|---|
| 赛事总览 | (107, 102) |
| 赛事配置 | (107, 168) |
| 参赛队伍 | (107, 234) |
| 赛程编排 | (107, 300) |
| 场地视图 | (107, 366) |
| 关于与帮助 | (107, 432) |

「生成赛程」按钮在赛程编排页：**(427, 196)**。
`shots.json` 里第 4 张就是「先点导航，再点生成赛程」，这样截图里才有真实赛程数据。

---

## 五、排错

| 现象 | 原因 / 对策 |
|---|---|
| `MISSING preview loader_out` | 没做第 1 步，或改了源码没重建 |
| `FATAL: engine websocket never appeared` | Previewer.exe 路径不对，或 `-j` 指向的目录不存在 |
| `FATAL: no frame received` | 通常还是上一条；检查 `out\previewer.log` |
| 截图里页面不对 | `shots.json` 里的点击坐标偏了；对照上面表格调整 |
| 截图是旧代码的画面 | `modules.abc` 比源码旧 → 重跑第 1 步 |
