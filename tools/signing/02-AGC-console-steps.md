# 02 · 你只剩两件事（其余我全包）

> 入口：**<https://developer.huawei.com/consumer/cn/hdc-console>**
> 你的 appId：**`6917619131345485660`** ✅ 已记录

---

## ✅ 已完成

- [x] 注册 + 实名认证
- [x] **创建应用**（拿到 appId）

---

## 📌 你要做的第 1 件：生成密钥（1 分钟）

双击运行：

```
D:\CampusArena\tools\signing\01-generate-keystore.cmd
```

它只问你一件事：**想一个口令，输两遍**。

> ⚠️ **口令记在手机备忘录里。** 丢了要重新申请证书，而且已上架的包永远无法再更新。
> 随便想一个记得住的就行，比如 `Sanda2026!schedule`。

跑完得到两个文件：

```
D:\CampusArena\signing-keys\campusarena.p12   ← 私钥，别删别外传
D:\CampusArena\signing-keys\campusarena.csr   ← 申请证书用
```

---

## 📌 你要做的第 2 件：建 API 凭证（2 分钟）

```
开发者管理 → ID、证书和Profile → 凭证 → 开发者级凭证
  → 「服务账号凭证」栏 → 点「创建」
```

| 字段 | 填什么 |
|---|---|
| 凭证名称 | `campusarena-upload` |
| **角色** | **App管理员** |
| 描述 | 随便 |

⚠️ **必须点「生成公私钥」** —— 不点的话下载的文件里没有私钥，用不了。

创建后会下载一个 `******private.json`。**把它放到这个目录**：

```
D:\开源作业\AGC上架材料\agc-upload\
```

然后跟我说一声「好了」。

> **角色为什么必须是 App管理员**：它覆盖 上传 + 发布 + 证书 全部所需权限。
> ⚠️ 别选「运营」—— 那个**不能提交发布，也不能管理证书**。

---

## 🤖 然后我做这些（你不用管）

| 步骤 | 我怎么做 |
|---|---|
| 申请发布证书 | `node upload.mjs cert-apply` —— 上传你的 `.csr`，下载 `.cer` |
| 申请发布 Profile | `node upload.mjs provision-apply` —— 下载 `.p7b` |
| 用你的证书重新签名打包 | `sign-release.cmd` → 产出**真正能上架**的 `.app` |
| 独立验签 | `hap-sign-tool verify-app` 必须输出 `verify-app success` |
| 上传软件包 | `node upload.mjs upload-package` |
| 上传图标 + 6 张截图 | `node upload.mjs upload-assets` |
| 写入文案（名称/简介/描述） | `node upload.mjs metadata` |
| 提交审核 | `node upload.mjs submit` |

一条命令跑完后半段：

```cmd
cd /d "D:\开源作业\AGC上架材料\agc-upload"
node upload.mjs signing-setup    REM 申请证书 + Profile + 重新签名
node upload.mjs full             REM 上传包 + 素材 + 文案 + 提交审核
```

---

## ⚠️ 提交审核前还有 3 件网页操作（只有网页入口）

这三件我做不到，到时我会提醒你。等上传完再弄也不迟。

### 1. 内容分级

```
应用上架 → 版本信息 → 待发布版本 → 内容分级 → 设置 → 填写调查问卷 → 验证 → 选分级 → 提交
```

我们的应用无敏感内容 → 结果应为 **3+**。
⚠️ **必须先选好「发布国家或地区」**才能进问卷。

### 2. 隐私政策

```
分发 → 更多服务 → 协议服务 → 新建协议 → 隐私政策
```

用华为「**隐私声明托管**」，免费，适用条件正好覆盖我们（中国大陆 + PC/2in1）。
要填的正文我已经写好：`AGC上架材料\02-隐私政策.html`，整段复制粘贴即可。

### 3. 备案信息

选「**您的 APP 为单机 APP**」。

我们零联网、零权限（包内 `requestPermissions` 实测为空），符合官方豁免：
「无需备案类型：单机应用、境外应用」。**这一条能省掉数周时间和额外成本。**

---

## 🔁 如果 API 路线走不通（备用方案）

`cert-apply` / `provision-apply` 用的是官方 Provisioning API。万一接口那边不顺，
退回到网页点两下就行，合计约 4 分钟：

**B. 申请发布证书**
```
开发者管理 → ID、证书和Profile → 证书 → 新增证书
  证书名称   : campusarena-release
  证书类型   : 发布证书          ← 别选成调试证书，否则后面报 204144763
  证书请求文件: D:\CampusArena\signing-keys\campusarena.csr
提交 → 下载 → 另存为 D:\CampusArena\signing-keys\campusarena.cer
```

**C. 申请发布 Profile**
```
开发者管理 → ID、证书和Profile → Profile → 添加
  应用名称 : 选你建的应用
  类型     : 发布
  选择证书 : 选刚申请的发布证书
提交 → 下载 → 另存为 D:\CampusArena\signing-keys\campusarena.p7b
```

存好告诉我，我接着签名 + 上传。
