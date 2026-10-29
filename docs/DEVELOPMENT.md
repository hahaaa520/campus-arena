# Campus Arena 开发与构建

本文档保留核心算法、构建环境、测试、打包签名和当前限制的详细说明。产品功能与界面预览见根目录 [README](../README.md)。

## 1. 开发环境

| 组件 | 当前项目使用的版本 |
| --- | --- |
| DevEco Studio | 5.0.13.240 |
| HarmonyOS SDK | API 17（5.0.5.165） |
| hvigor | 5.17.6（DevEco Studio 内置） |
| Node | 18.20.1（DevEco Studio 内置） |
| Java | DevEco Studio 内置 JBR |

项目面向 HarmonyOS NEXT，使用 ArkTS／ArkUI 和 Stage 模型。

## 2. 构建项目

将项目放在纯 ASCII 路径下，在仓库根目录执行：

```cmd
REM 编译并产出 HAP
tools\build.cmd assembleHap --no-daemon

REM 打包 AppGallery 上传所需的 .app
tools\build.cmd assembleApp --no-daemon
```

如果 DevEco Studio 未安装在 `C:\Program Files\Huawei\DevEco Studio`，请先修改 `tools/build.cmd` 中的 `DEVECO_ROOT`。

### 为什么不要直接使用 hvigorw.bat

官方 `hvigorw.bat` 会尝试从网络获取 `@ohos/hvigor`。本项目的 `tools/build.cmd` 改为复用 DevEco Studio 内置构建工具，通过目录联接挂载到 `.hvigor_deps/`，并设置 `NODE_PATH`，因此无需单独执行 `ohpm install`。

构建脚本会自动设置：

| 变量 | 用途 |
| --- | --- |
| `DEVECO_SDK_HOME` | 指向 DevEco Studio SDK |
| `NODE_HOME` | 指向内置 Node |
| `JAVA_HOME` | 指向内置 JBR |
| `NODE_PATH` | 解析项目挂载的 hvigor 依赖 |
| `NODE_OPTIONS` | 加载非 ASCII 路径校验补丁 |

### 中文路径限制

hvigor 会校验工程路径，底层资源编译器也可能在中文路径下出现编码错误。即使 `tools/hvigor-nonascii-path-patch.js` 能绕过部分校验，也不代表整个工具链支持中文路径。

**请始终将克隆目录及其父目录放在纯 ASCII 路径下。** 该补丁只修改当前进程中的校验行为，不会改写 DevEco Studio 安装文件。

## 3. 测试与完整验证

### 核心算法测试

```cmd
tools\logic-test\run-tests.cmd
```

测试脚本会：

1. 将真实的 `Types.ets` 和 `Scheduler.ets` 复制为 TypeScript 源文件。
2. 使用 DevEco Studio 内置 TypeScript 编译器做类型擦除。
3. 在 Node 中执行 `tools/logic-test/tests.mjs`。

当前测试文件包含 **50 项检查**，覆盖对阵生成、种子排位、轮空、小组赛、排期约束、冲突检测、晋级传播、积分榜和 CSV 导出。

### 一次性完整检查

```cmd
tools\verify-all.cmd
```

完整检查包括：

1. ArkTS 编译和 HAP 打包。
2. `.app` 打包。
3. 核心算法测试。
4. 产物元数据、权限、`debug` 标记和文件规格检查。

注意：当前 `verify-all.cmd` 通过脚本内的 `PY` 变量定位 Python。如果本机 Python 路径不同，请先调整该变量，再运行完整检查。

## 4. 核心算法

核心实现位于 `entry/src/main/ets/model/Scheduler.ets`，均为不依赖 ArkUI 的纯函数。

### 对阵生成

| 赛制 | 实现方式 |
| --- | --- |
| 单循环 | 圆桌轮转法；奇数队自动补轮空位，并尽量均衡主客场 |
| 双循环 | 在单循环基础上追加主客互换的镜像轮次 |
| 单败淘汰 | 标准种子排位；非 2 的幂队伍数自动处理高位种子轮空 |
| 小组赛＋淘汰赛 | 蛇形分组、组内单循环，各组出线队伍交叉进入淘汰赛 |

淘汰赛通过 `nextMatchId` 和 `nextSlot` 形成完整对阵树，比分录入后由 `propagateWinners` 传递胜者。

### 自动排期

候选时段由“比赛日 × 场地 × 每日可用时刻”组成。排期器按轮次处理比赛，选择第一个同时满足以下条件的时段：

1. 场地在该时刻空闲。
2. 双方队伍在该时刻没有其他比赛。
3. 双方队伍与当天已有比赛之间满足最小休息间隔。

没有可用时段时，比赛会保留并标记为“未排期”（`dayIndex = -1`），不会静默丢弃。手动锁定的比赛先登记占用，重新排期时保持不变。

### 冲突检测

| 级别 | 检查项 |
| --- | --- |
| 必须修复 | 场地重复占用、同队同时段出场、无法排入、超出设定赛期 |
| 建议调整 | 同队休息不足、时段越界、有队伍一场未排 |

### 积分与导出

- 胜 3 分、平 1 分、负 0 分。
- 同分依次比较净胜分和总得分。
- CSV 带 UTF-8 BOM，便于 Excel 正确识别中文。

## 5. 打包与发布签名

### HAP 与 APP 的区别

| 命令 | 产物 | 用途 |
| --- | --- | --- |
| `assembleHap` | `entry/build/.../entry-default-unsigned.hap` | 本地调试或设备安装 |
| `assembleApp` | `build/outputs/default/CampusArena-default-unsigned.app` | 签名后上传 AGC |

API ≥ 11 的发布包不能包含调试信息。`tools/verify-artifacts.py` 会检查 `.app` 内的发布 HAP，确保其 `debug` 标记符合发布要求。

### 发布签名

发布签名需要使用你自己的 AGC 发布证书和 Profile。不要将私钥、证书密码或真实凭据提交到公开仓库。

完整签名工具与步骤见 [tools/signing/README.md](../tools/signing/README.md)，配置模板为 `tools/signing/credentials.example.json`。

## 6. 当前限制

1. 构建应在纯 ASCII 路径下进行。
2. 界面渲染与交互尚未完成真机／模拟器验收；编译、打包和算法测试不能替代设备验证。
3. 当前固定浅色主题，尚未提供完整深色主题。
4. `AboutView.ets` 中的 `DEVELOPER_CONTACT` 仍是占位联系方式，发布前必须替换。
5. 暂不支持批量 CSV 导入。
6. 淘汰赛暂未提供季军赛。
