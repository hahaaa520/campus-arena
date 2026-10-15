# 校园赛程编排器 · Campus Arena

> 鸿蒙电脑（2in1）校园赛事赛程编排工具 —— 对应《鸿蒙 PC 校园应用选题》**079 校园赛事赛程编排器**
> 配置参赛队伍与比赛规则，生成赛程；用大屏对照场地和时间冲突。

HarmonyOS NEXT · ArkTS / ArkUI · Stage 模型 · API 17（HarmonyOS 5.0.5）
**完全离线**：不申请网络权限，不收集任何个人信息。

**🌐 在线预览（含六张界面截图）：<https://hahaaa520.github.io/campus-arena/>**

---

## 目录

- [一、这是什么](#一这是什么)
- [二、快速开始](#二快速开始)
- [三、目录结构](#三目录结构)
- [四、核心算法](#四核心算法)
- [五、面向鸿蒙电脑的设计](#五面向鸿蒙电脑的设计)
- [六、构建环境说明（重要）](#六构建环境说明重要)
- [七、打包与签名](#七打包与签名)
- [八、上架](#八上架)
- [九、已知限制](#九已知限制)

---

## 一、这是什么

一款把"手工排表"变成"自动生成可执行赛程"的校园赛事编排工具。解决三个具体问题：

1. **算对阵麻烦** —— 支持单循环 / 双循环 / 单败淘汰 / 小组赛+淘汰赛四种赛制，自动生成完整对阵（含轮空与交叉淘汰席位）。
2. **排时间容易撞** —— 贪心排期自动满足三条硬约束：同一场地同一时刻只有一场、同一队伍同一时刻只有一场、同队两场比赛间隔不小于设定值。
3. **改一处要重排全表** —— 冲突检查把问题分成"必须修复"和"建议调整"两级，逐条给出中文说明；个别场次可手动调整并"锁定"，重新排期时保持不变。

### 功能一览

| 页面 | 作用 |
|---|---|
| **赛事总览** | 规模指标、冲突摘要、积分榜、下一批比赛、快捷入口 |
| **赛事配置** | 项目、赛制、单场时长、场间间隔、同队最小休息、赛期、每日时段、场地管理 |
| **参赛队伍** | 队伍增删改、所属院系、种子序号 |
| **赛程编排** | 一键生成/重新排期、冲突清单、赛程表、比分录入、手动调整与锁定、导出 CSV |
| **场地视图** | 场地 × 时段网格，一眼看出空档与撞场 |
| **关于与帮助** | 使用帮助、**应用内隐私说明**、应用信息、清除本机数据 |

---

## 二、快速开始

```cmd
REM 1) 编译（产出 HAP）
D:\CampusArena\tools\build.cmd assembleHap --no-daemon

REM 2) 打包（产出 .app）
D:\CampusArena\tools\build.cmd assembleApp --no-daemon

REM 3) 跑核心算法测试（48 项）
D:\CampusArena\tools\logic-test\run-tests.cmd
```

> ⚠️ **必须通过 `tools\build.cmd` 构建，不要直接用 `hvigorw.bat`。** 原因见[第六节](#六构建环境说明重要)。

在 DevEco Studio 里打开本项目，用**预览器**或**模拟器**即可看到界面（`entry/src/main/ets/pages/Index.ets` 是入口页）。

---

## 三、目录结构

```
CampusArena/
├── AppScope/
│   ├── app.json5                     应用级配置（bundleName / 版本 / 图标）
│   └── resources/base/media/         分层图标（background + foreground）
├── entry/src/main/
│   ├── module.json5                  模块配置（deviceTypes: 2in1 / tablet / phone）
│   ├── ets/
│   │   ├── entryability/EntryAbility.ets    应用入口，固定浅色主题
│   │   ├── model/
│   │   │   ├── Types.ets             数据模型、枚举、时间与日期工具
│   │   │   ├── Scheduler.ets         ★ 核心算法：对阵生成 / 排期 / 冲突检测 / 积分 / 导出
│   │   │   ├── AppModel.ets          @Observed 应用模型（所有写操作整体替换数组）
│   │   │   └── Store.ets             本地持久化（Preferences）
│   │   ├── common/
│   │   │   ├── Theme.ets             设计令牌：颜色 / 间距 / 圆角 / 字号 / 断点
│   │   │   ├── Widgets.ets           无状态展示组件（卡片 / 指标 / 标签 / 按钮 / 表单行）
│   │   │   └── Exporter.ets          CSV 导出（文件选择器 + 沙箱兜底）
│   │   ├── pages/Index.ets           主框架：侧边导航 + 顶栏 + 内容区
│   │   └── view/                     6 个页面视图
│   └── resources/                    字符串 / 颜色 / 图标（base + zh_CN + en_US）
└── tools/
    ├── build.cmd                     ★ 构建入口（见第六节）
    ├── hvigor-nonascii-path-patch.js 非 ASCII 工程路径补丁
    ├── make_icons.py                 生成应用图标
    ├── logic-test/                   核心算法测试（真实源码，非重写）
    └── signing/                      发布签名
```

---

## 四、核心算法

全部位于 `entry/src/main/ets/model/Scheduler.ets`，均为**纯函数**，不依赖 ArkUI，因此可以对真实源码做类型擦除后直接在 Node 中测试。

### 1. 对阵生成

| 赛制 | 算法 |
|---|---|
| 单循环 | **圆桌轮转法（circle method）**：奇数队自动补轮空位；每轮首位固定、其余顺时针移动一格；主客交替以尽量均衡 |
| 双循环 | 单循环基础上追加主客互换的镜像轮次 |
| 单败淘汰 | **标准种子排位**：`seedOrder(8) = [1,8,4,5,2,7,3,6]`；队伍数非 2 的幂时高位种子首轮轮空并自动判定晋级；每场记录 `nextMatchId` / `nextSlot` 形成完整对阵树 |
| 小组赛+淘汰赛 | 蛇形（snake）分配保证种子队分散到不同小组；组内单循环；各组前 N 名按 `A组第1 vs B组第2` 交叉进入淘汰赛 |

### 2. 贪心排期

```
候选时段 = 每个比赛日 × 每个场地 × 从每日开始时刻起、按 (单场时长 + 场间间隔) 步进的时刻
按轮次顺序处理每场比赛 → 取第一个满足全部约束的时段：
    ① 该场地该时刻空闲
    ② 双方队伍该时刻空闲
    ③ 双方队伍当天已有赛程与本次安排间隔 ≥ 最小休息时间
若无可用时段 → 如实标记为"未排期"（dayIndex = -1），而不是丢弃
```

已被手动调整（`pinned`）的场次会先登记占用，重新排期时保持不变。

### 3. 冲突检测

| 级别 | 检查项 |
|---|---|
| **必须修复** | 场地重复占用、同队同时段出场、有场次无法排入、超出设定赛期 |
| **建议调整** | 同队休息时间不足、时段越界（超出每日可用窗）、有队伍一场未排 |

### 4. 其他

- **积分榜**：胜 3 分、平 1 分、负 0 分；同分依次比净胜分、总得分。
- **晋级传播**：录入比分后，胜者自动填入下一轮对应席位（`propagateWinners`）。
- **CSV 导出**：带 UTF-8 BOM，Excel 直接打开不乱码。

---

## 五、面向鸿蒙电脑的设计

对应官方[设备兼容](https://developer.huawei.com/consumer/cn/doc/doccenter-architecture/device-compatible)规则：

- **大屏多栏布局**：宽窗口用固定侧边导航（224vp）+ 内容区，内容最大宽度限制 1560vp 避免行太长。
- **窗口自适应**：`breakpointOf()` 按宽度分三档（<600 / <900 / ≥900 vp）；窄窗口自动把侧边导航换成顶部标签，指标卡自动换行。
- **鼠标**：所有可交互元素调用 `.hoverEffect(HoverEffect.Highlight)`，行悬停有背景反馈。
- **键盘**：导航项与按钮设置 `.focusable(true)` 与 `.tabIndex()` 明确走焦顺序；输入框支持回车提交（如添加队伍）。**未注册任何自定义快捷键**，避免与系统快捷键冲突。
- **多实例 / 跨屏**：无全局单例，无绝对坐标依赖。

---

## 六、构建环境说明（重要）

### 6.1 为什么不能直接用 `hvigorw.bat`

本项目的 hvigor 构建有两个环境障碍，`tools\build.cmd` 都已解决：

**障碍一：hvigor 会从网络拉取依赖。**
官方 `hvigorw.bat` 会尝试下载 `@ohos/hvigor`。`build.cmd` 改为直接使用 DevEco Studio 内置的那一份（`tools\hvigor\`），通过目录联接（junction）挂到 `.hvigor_deps\`，并用 `NODE_PATH` 让插件能解析到 `@ohos/hvigor`。**无需联网、无需 ohpm install。**

**障碍二：hvigor 拒绝含中文的工程路径。**
hvigor 有两处硬性校验：

| 位置 | 校验内容 | 报错 |
|---|---|---|
| `ProjectInspection#projectPathInspection` | `process.cwd()` 必须匹配 `/(([A-z]):)(\\[a-zA-Z0-9-_.()\s@]+)*(\\?)$/` | `Invalid project path` |
| `AbstractPreBuild#checkPathChinese` | 模块路径不得含 `[\u4e00-\u9fff]` | `The Node directory and node name cannot contain Chinese characters` |

即使绕过这两处，**底层原生资源编译器仍会把中文路径按 UTF-8 输出、按 GBK 解析**，报
`Error: invalid output 'D:\寮€婧愪綔涓歕...'`。

**因此本工程的实际位置是 `D:\CampusArena`（纯 ASCII）。**
`D:\开源作业\CampusArena` 是一个指向它的**目录联接**，只是为了在作业文件夹里也能看到。

> ⚠️ **请始终在 `D:\CampusArena` 下构建。** 通过 `D:\开源作业\CampusArena` 打开会因为中文路径而失败——这不是工程的问题，是工具链的限制。

`tools\hvigor-nonascii-path-patch.js` 通过 `NODE_OPTIONS=--require` 中和了上面两处校验，所以即使工程被复制到中文路径下，校验也能过（但原生资源编译器仍会失败）。该补丁只替换这两个方法，不修改 DevEco Studio 安装目录里的任何文件。

### 6.2 依赖的环境变量（`build.cmd` 已自动设置）

| 变量 | 值 |
|---|---|
| `DEVECO_SDK_HOME` | `C:\Program Files\Huawei\DevEco Studio\sdk` |
| `NODE_HOME` | `C:\Program Files\Huawei\DevEco Studio\tools\node` |
| `JAVA_HOME` | `C:\Program Files\Huawei\DevEco Studio\jbr` |
| `NODE_PATH` | `<project>\.hvigor_deps\node_modules` |
| `NODE_OPTIONS` | `--require <project>\tools\hvigor-nonascii-path-patch.js` |

**不需要**系统安装 Node、Java 或 ohpm —— 全部复用 DevEco Studio 自带的版本。

### 6.3 环境版本

| 组件 | 版本 |
|---|---|
| DevEco Studio | 5.0.13.240 |
| HarmonyOS SDK | API 17（5.0.5.165） |
| hvigor | 5.17.6（DevEco 内置） |
| 内置 Node | 18.20.1 |
| 内置 JBR | DevEco 自带 |

> 上架手册推荐 DevEco Studio 6.1.0+（HarmonyOS 26.0.0 起支持 AGC 云管理证书自动重签名）。
> 本工程在 5.0.13 + API 17 上构建正常，**上架走传统"发布证书 + 发布 Profile"手动签名路径**，这条路在 26.0.0 以下同样是官方支持的。

---

## 七、打包与签名

### 7.1 两种产物，别搞混（重要）

| 命令 | 产物 | 上传 AGC 用哪个 |
|---|---|---|
| `assembleHap` | `entry/build/.../entry-default-unsigned.hap` | ❌ **不要用这个** |
| `assembleApp` | `build/outputs/default/CampusArena-default-unsigned.app` | ✅ **用这个**（再签名后） |

**官方要求：API ≥ 11 的包不可含调试信息（`debug` ≠ `true`）。**
本工程实测：单独跑 `assembleHap` 时产出过 `debug=true` 的包 —— **AGC 会直接拒收**；
而 `assembleApp` 产出的 `.app` 内层 HAP 为 `debug=false`。

（注意 `debug` 取值与构建模式/缓存有关，并非固定：
`tools\verify-artifacts.py` **会对 `.app` 里的内层 HAP 严格执行 `debug` 校验**，
这才是真正上传的那个文件。）

所以：

- **本地调试 / 装到设备上玩** → 用 `assembleHap` 的 HAP
- **提交上架** → 用 `assembleApp` 的 `.app`

`tools\verify-artifacts.py` 会分别检查这两者，并对 `.app` 里的 release HAP 严格执行 `debug` 校验。

### 7.2 一次性跑完全部检查

```cmd
tools\verify-all.cmd
```

依次执行：编译 + 打 HAP → 打 .app → 50 项算法测试 → 产物规格检查。

### 7.3 发布签名

1. 把从 AGC 拿到的三件套放进 `signing-keys\`：`.p12` / `.cer` / `.p7b`
2. 复制 `tools\signing\credentials.example.json` 为 `credentials.json` 并填写
3. 运行：

```cmd
tools\signing\sign-release.cmd
→ dist\ 下的已签名 .app
```

详细步骤见 `D:\开源作业\AGC上架材料\03-上架操作手册.md` 第 3–4 节。

---

## 八、上架

完整材料在 **`D:\开源作业\AGC上架材料\`**：

| 文件 | 内容 |
|---|---|
| `01-应用文案.md` | 名称 / 一句话简介 / 应用介绍 / 新版本特性 / 分类 / 权限 / 审核备注（都已按字数上限校对） |
| `02-隐私政策.html` | 可直接托管的静态隐私政策页 |
| `03-上架操作手册.md` | 从注册账号到发布上架的完整步骤 |
| `04-审核风险自查清单.md` | 提交前逐项自查 + 官方口径冲突说明 |
| `agc-upload/upload.mjs` | AGC OpenAPI 自动上传脚本（`node upload.mjs full`） |
| `assets/` | 图标（1024 / 216）与截图目录 |

---

## 九、已知限制

1. **构建必须在 ASCII 路径下进行**（见第六节）。这是 hvigor 与原生资源编译器的限制，不是本工程引入的。
2. **未在真机 / 模拟器上运行过**：本机没有可用的 HarmonyOS 模拟器镜像，且设备安装需要 AGC 调试证书。
   - 编译（`CompileArkTS` 无错误无警告）、打包（`.hap` / `.app`）、核心算法（48 项测试）均已验证；
   - **界面渲染与交互需要在 DevEco 预览器或真机上确认**。
3. **固定浅色主题**：`EntryAbility` 中调用 `setColorMode(COLOR_MODE_LIGHT)`，用于规避官方「深色模式异常」这条 UX 驳回原因。如需深色模式需补一套颜色令牌。
4. **`AboutView.ets` 中的 `DEVELOPER_CONTACT` 是占位邮箱**，上架前必须替换为你的真实联系方式。
5. **未做数据导入**：目前只能手工录入或修改；批量导入 CSV 未实现。
6. **淘汰赛的季军赛未实现**。

---

## 附：与选题文档的对应

> 选题 079　校园赛事赛程编排器　（本地）

- 「配置参赛队伍与比赛规则，生成赛程」→ ✅ 赛事配置 + 参赛队伍 + 四种赛制自动生成对阵
- 「用大屏对照场地和时间冲突」→ ✅ 场地视图（场地 × 时段网格）+ 两级冲突检查

选题文档强调的 PC 价值点（大屏、多窗口、键鼠操作、长文本编辑、批量文件整理）在本工程中的落地：
大屏多栏布局 ✅｜窗口自适应 ✅｜键鼠走焦与悬停 ✅｜长表格与批量队伍维护 ✅｜CSV 批量导出 ✅
