if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface AboutView_Params {
    model?: AppModel;
    onClearData?: () => void;
}
import type { AppModel } from '../model/AppModel';
import { FontSize, Palette, Radius, Space, ToneKind } from "@normalized:N&&&entry/src/main/ets/common/Theme&";
import { AppButton, BtnKind, CardSection, KeyValueRow, Pill } from "@normalized:N&&&entry/src/main/ets/common/Widgets&";
const APP_VERSION: string = '1.0.0';
const APP_BUILD: string = '1';
const BUNDLE_NAME: string = 'com.campusarena.scheduler';
/** 开发者联系方式：上架前必须替换为真实可用的联系方式 */
const DEVELOPER_CONTACT: string = 'campusarena.support@example.com';
export class AboutView extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__model = new SynchedPropertyNesedObjectPU(params.model, this, "model");
        this.onClearData = () => {
        };
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: AboutView_Params) {
        this.__model.set(params.model);
        if (params.onClearData !== undefined) {
            this.onClearData = params.onClearData;
        }
    }
    updateStateVars(params: AboutView_Params) {
        this.__model.set(params.model);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__model.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__model.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __model: SynchedPropertyNesedObjectPU<AppModel>;
    get model() {
        return this.__model.get();
    }
    private onClearData: () => void;
    featureLine(symbol: string, title: string, detail: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: Space.md });
            Row.debugLine("entry/src/main/ets/view/AboutView.ets(26:5)", "entry");
            Row.width('100%');
            Row.alignItems(VerticalAlign.Top);
            Row.padding({ top: Space.sm, bottom: Space.sm });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(symbol);
            Text.debugLine("entry/src/main/ets/view/AboutView.ets(27:7)", "entry");
            Text.fontSize(FontSize.subhead);
            Text.fontColor(Palette.brand);
            Text.width(28);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 2 });
            Column.debugLine("entry/src/main/ets/view/AboutView.ets(31:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(title);
            Text.debugLine("entry/src/main/ets/view/AboutView.ets(32:9)", "entry");
            Text.fontSize(FontSize.body);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(Palette.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(detail);
            Text.debugLine("entry/src/main/ets/view/AboutView.ets(36:9)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textSecondary);
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
    }
    privacyParagraph(text: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(text);
            Text.debugLine("entry/src/main/ets/view/AboutView.ets(50:5)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textSecondary);
            Text.lineHeight(21);
            Text.width('100%');
            Text.margin({ bottom: Space.sm });
        }, Text);
        Text.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: Space.lg });
            Column.debugLine("entry/src/main/ets/view/AboutView.ets(59:5)", "entry");
            Column.width('100%');
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new CardSection(this, {
                        title: '关于本应用', subtitle: '',
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create({ space: Space.md });
                                Column.debugLine("entry/src/main/ets/view/AboutView.ets(61:9)", "entry");
                                Column.width('100%');
                                Column.alignItems(HorizontalAlign.Start);
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create({ space: Space.md });
                                Row.debugLine("entry/src/main/ets/view/AboutView.ets(62:11)", "entry");
                                Row.width('100%');
                                Row.alignItems(VerticalAlign.Center);
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Image.create({ "id": 16777237, "type": 20000, params: [], "bundleName": "com.campusarena.scheduler", "moduleName": "entry" });
                                Image.debugLine("entry/src/main/ets/view/AboutView.ets(63:13)", "entry");
                                Image.width(56);
                                Image.height(56);
                                Image.borderRadius(Radius.md);
                            }, Image);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create({ space: 4 });
                                Column.debugLine("entry/src/main/ets/view/AboutView.ets(67:13)", "entry");
                                Column.alignItems(HorizontalAlign.Start);
                                Column.layoutWeight(1);
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create('校园赛程编排器');
                                Text.debugLine("entry/src/main/ets/view/AboutView.ets(68:15)", "entry");
                                Text.fontSize(FontSize.title);
                                Text.fontWeight(FontWeight.Bold);
                                Text.fontColor(Palette.textPrimary);
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create('把校园赛事的报名、赛制与场地约束，变成一张可直接执行的赛程表。');
                                Text.debugLine("entry/src/main/ets/view/AboutView.ets(72:15)", "entry");
                                Text.fontSize(FontSize.small);
                                Text.fontColor(Palette.textSecondary);
                            }, Text);
                            Text.pop();
                            Column.pop();
                            Row.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create({ space: Space.sm });
                                Row.debugLine("entry/src/main/ets/view/AboutView.ets(82:11)", "entry");
                            }, Row);
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new Pill(this, { text: `版本 ${APP_VERSION}`, tone: ToneKind.Brand }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 83, col: 13 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                text: `版本 ${APP_VERSION}`,
                                                tone: ToneKind.Brand
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            text: `版本 ${APP_VERSION}`, tone: ToneKind.Brand
                                        });
                                    }
                                }, { name: "Pill" });
                            }
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new Pill(this, { text: '完全离线', tone: ToneKind.Ok }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 84, col: 13 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                text: '完全离线',
                                                tone: ToneKind.Ok
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            text: '完全离线', tone: ToneKind.Ok
                                        });
                                    }
                                }, { name: "Pill" });
                            }
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new Pill(this, { text: '不收集个人信息', tone: ToneKind.Ok }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 85, col: 13 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                text: '不收集个人信息',
                                                tone: ToneKind.Ok
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            text: '不收集个人信息', tone: ToneKind.Ok
                                        });
                                    }
                                }, { name: "Pill" });
                            }
                            Row.pop();
                            Column.pop();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 60, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            title: '关于本应用',
                            subtitle: '',
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create({ space: Space.md });
                                    Column.debugLine("entry/src/main/ets/view/AboutView.ets(61:9)", "entry");
                                    Column.width('100%');
                                    Column.alignItems(HorizontalAlign.Start);
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create({ space: Space.md });
                                    Row.debugLine("entry/src/main/ets/view/AboutView.ets(62:11)", "entry");
                                    Row.width('100%');
                                    Row.alignItems(VerticalAlign.Center);
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Image.create({ "id": 16777237, "type": 20000, params: [], "bundleName": "com.campusarena.scheduler", "moduleName": "entry" });
                                    Image.debugLine("entry/src/main/ets/view/AboutView.ets(63:13)", "entry");
                                    Image.width(56);
                                    Image.height(56);
                                    Image.borderRadius(Radius.md);
                                }, Image);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create({ space: 4 });
                                    Column.debugLine("entry/src/main/ets/view/AboutView.ets(67:13)", "entry");
                                    Column.alignItems(HorizontalAlign.Start);
                                    Column.layoutWeight(1);
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('校园赛程编排器');
                                    Text.debugLine("entry/src/main/ets/view/AboutView.ets(68:15)", "entry");
                                    Text.fontSize(FontSize.title);
                                    Text.fontWeight(FontWeight.Bold);
                                    Text.fontColor(Palette.textPrimary);
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('把校园赛事的报名、赛制与场地约束，变成一张可直接执行的赛程表。');
                                    Text.debugLine("entry/src/main/ets/view/AboutView.ets(72:15)", "entry");
                                    Text.fontSize(FontSize.small);
                                    Text.fontColor(Palette.textSecondary);
                                }, Text);
                                Text.pop();
                                Column.pop();
                                Row.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create({ space: Space.sm });
                                    Row.debugLine("entry/src/main/ets/view/AboutView.ets(82:11)", "entry");
                                }, Row);
                                {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        if (isInitialRender) {
                                            let componentCall = new Pill(this, { text: `版本 ${APP_VERSION}`, tone: ToneKind.Brand }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 83, col: 13 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    text: `版本 ${APP_VERSION}`,
                                                    tone: ToneKind.Brand
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                text: `版本 ${APP_VERSION}`, tone: ToneKind.Brand
                                            });
                                        }
                                    }, { name: "Pill" });
                                }
                                {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        if (isInitialRender) {
                                            let componentCall = new Pill(this, { text: '完全离线', tone: ToneKind.Ok }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 84, col: 13 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    text: '完全离线',
                                                    tone: ToneKind.Ok
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                text: '完全离线', tone: ToneKind.Ok
                                            });
                                        }
                                    }, { name: "Pill" });
                                }
                                {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        if (isInitialRender) {
                                            let componentCall = new Pill(this, { text: '不收集个人信息', tone: ToneKind.Ok }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 85, col: 13 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    text: '不收集个人信息',
                                                    tone: ToneKind.Ok
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                text: '不收集个人信息', tone: ToneKind.Ok
                                            });
                                        }
                                    }, { name: "Pill" });
                                }
                                Row.pop();
                                Column.pop();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        title: '关于本应用', subtitle: ''
                    });
                }
            }, { name: "CardSection" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new CardSection(this, {
                        title: '主要功能', subtitle: '围绕「配置 → 生成 → 检查 → 执行」四步',
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.debugLine("entry/src/main/ets/view/AboutView.ets(93:9)", "entry");
                                Column.width('100%');
                            }, Column);
                            this.featureLine.bind(this)('①', '赛事配置', '设置项目、赛制、单场时长、每日时段与比赛天数，支持单循环、双循环、单败淘汰与小组赛 + 淘汰赛。');
                            this.featureLine.bind(this)('②', '队伍与场地管理', '维护参赛队伍、所属院系与种子序号；添加多块并行使用的比赛场地。');
                            this.featureLine.bind(this)('③', '一键生成与自动排期', '按轮次顺序贪心排期，自动避开场地重复占用，并保证同队两场比赛之间留足休息时间。');
                            this.featureLine.bind(this)('④', '冲突检查', '自动检查场地撞场、同队同时段出场、休息不足、超出赛期与时段越界，分为「必须修复」和「建议调整」两级。');
                            this.featureLine.bind(this)('⑤', '比分与积分榜', '录入比分后自动计算积分榜，淘汰赛中胜者自动晋级到下一轮。');
                            this.featureLine.bind(this)('⑥', '场地视图与导出', '以场地 × 时段网格对照检查安排，并可导出 CSV 赛程表用于打印或张贴。');
                            Column.pop();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 92, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            title: '主要功能',
                            subtitle: '围绕「配置 → 生成 → 检查 → 执行」四步',
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create();
                                    Column.debugLine("entry/src/main/ets/view/AboutView.ets(93:9)", "entry");
                                    Column.width('100%');
                                }, Column);
                                this.featureLine.bind(this)('①', '赛事配置', '设置项目、赛制、单场时长、每日时段与比赛天数，支持单循环、双循环、单败淘汰与小组赛 + 淘汰赛。');
                                this.featureLine.bind(this)('②', '队伍与场地管理', '维护参赛队伍、所属院系与种子序号；添加多块并行使用的比赛场地。');
                                this.featureLine.bind(this)('③', '一键生成与自动排期', '按轮次顺序贪心排期，自动避开场地重复占用，并保证同队两场比赛之间留足休息时间。');
                                this.featureLine.bind(this)('④', '冲突检查', '自动检查场地撞场、同队同时段出场、休息不足、超出赛期与时段越界，分为「必须修复」和「建议调整」两级。');
                                this.featureLine.bind(this)('⑤', '比分与积分榜', '录入比分后自动计算积分榜，淘汰赛中胜者自动晋级到下一轮。');
                                this.featureLine.bind(this)('⑥', '场地视图与导出', '以场地 × 时段网格对照检查安排，并可导出 CSV 赛程表用于打印或张贴。');
                                Column.pop();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        title: '主要功能', subtitle: '围绕「配置 → 生成 → 检查 → 执行」四步'
                    });
                }
            }, { name: "CardSection" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new CardSection(this, {
                        title: '使用帮助', subtitle: '三步得到一张可执行赛程',
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create({ space: Space.sm });
                                Column.debugLine("entry/src/main/ets/view/AboutView.ets(105:9)", "entry");
                                Column.width('100%');
                                Column.alignItems(HorizontalAlign.Start);
                            }, Column);
                            this.privacyParagraph.bind(this)('第一步：到「参赛队伍」添加全部参赛队伍，至少 2 支；到「赛事配置」确认赛制、比赛天数与场地。');
                            this.privacyParagraph.bind(this)('第二步：到「赛程编排」点击「生成赛程」。系统会生成对阵并自动排期，随后给出冲突清单。');
                            this.privacyParagraph.bind(this)('第三步：如提示「必须修复」级冲突，回到「赛事配置」增加比赛天数、延长每日时段或增开场地后重新排期；也可以在赛程表中手动调整单场时间并锁定。');
                            this.privacyParagraph.bind(this)('提示：所有数据保存在本机。卸载应用或点击下方「清除本机数据」会一并删除。');
                            Column.pop();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 104, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            title: '使用帮助',
                            subtitle: '三步得到一张可执行赛程',
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create({ space: Space.sm });
                                    Column.debugLine("entry/src/main/ets/view/AboutView.ets(105:9)", "entry");
                                    Column.width('100%');
                                    Column.alignItems(HorizontalAlign.Start);
                                }, Column);
                                this.privacyParagraph.bind(this)('第一步：到「参赛队伍」添加全部参赛队伍，至少 2 支；到「赛事配置」确认赛制、比赛天数与场地。');
                                this.privacyParagraph.bind(this)('第二步：到「赛程编排」点击「生成赛程」。系统会生成对阵并自动排期，随后给出冲突清单。');
                                this.privacyParagraph.bind(this)('第三步：如提示「必须修复」级冲突，回到「赛事配置」增加比赛天数、延长每日时段或增开场地后重新排期；也可以在赛程表中手动调整单场时间并锁定。');
                                this.privacyParagraph.bind(this)('提示：所有数据保存在本机。卸载应用或点击下方「清除本机数据」会一并删除。');
                                Column.pop();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        title: '使用帮助', subtitle: '三步得到一张可执行赛程'
                    });
                }
            }, { name: "CardSection" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new CardSection(this, {
                        title: '隐私说明', subtitle: '本应用不收集、不上传任何个人信息',
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.debugLine("entry/src/main/ets/view/AboutView.ets(116:9)", "entry");
                                Column.width('100%');
                                Column.alignItems(HorizontalAlign.Start);
                            }, Column);
                            this.privacyParagraph.bind(this)('一、信息收集：本应用不需要注册或登录，不收集设备标识、位置、通讯录、相册、麦克风等任何个人信息，也不会读取与赛事编排无关的文件。');
                            this.privacyParagraph.bind(this)('二、信息存储：您输入的队伍名称、院系、赛事规则、场地与比分等数据，仅保存在本机应用沙箱内（HarmonyOS Preferences）。这些数据不会离开您的设备。');
                            this.privacyParagraph.bind(this)('三、网络与权限：本应用不申请网络权限，也不申请任何敏感权限，全部功能离线可用。');
                            this.privacyParagraph.bind(this)('四、第三方服务：本应用未集成任何第三方 SDK、广告或统计分析组件。');
                            this.privacyParagraph.bind(this)('五、数据导出：仅当您主动点击「导出 CSV」并选择保存位置时，才会把赛程写入您指定的本地文件；导出过程不经过网络。');
                            this.privacyParagraph.bind(this)('六、您的权利：您可以随时在应用内修改或删除任何数据，也可以点击下方「清除本机数据」一次性删除全部本地数据。');
                            this.privacyParagraph.bind(this)('七、未成年人保护：本应用为校园赛事编排工具，不面向未成年人单独收集任何信息。');
                            this.privacyParagraph.bind(this)('八、联系方式：如对本隐私说明有任何疑问，请联系 ' + DEVELOPER_CONTACT + '。');
                            this.privacyParagraph.bind(this)('九、本说明自应用发布之日起生效。');
                            Column.pop();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 115, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            title: '隐私说明',
                            subtitle: '本应用不收集、不上传任何个人信息',
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create();
                                    Column.debugLine("entry/src/main/ets/view/AboutView.ets(116:9)", "entry");
                                    Column.width('100%');
                                    Column.alignItems(HorizontalAlign.Start);
                                }, Column);
                                this.privacyParagraph.bind(this)('一、信息收集：本应用不需要注册或登录，不收集设备标识、位置、通讯录、相册、麦克风等任何个人信息，也不会读取与赛事编排无关的文件。');
                                this.privacyParagraph.bind(this)('二、信息存储：您输入的队伍名称、院系、赛事规则、场地与比分等数据，仅保存在本机应用沙箱内（HarmonyOS Preferences）。这些数据不会离开您的设备。');
                                this.privacyParagraph.bind(this)('三、网络与权限：本应用不申请网络权限，也不申请任何敏感权限，全部功能离线可用。');
                                this.privacyParagraph.bind(this)('四、第三方服务：本应用未集成任何第三方 SDK、广告或统计分析组件。');
                                this.privacyParagraph.bind(this)('五、数据导出：仅当您主动点击「导出 CSV」并选择保存位置时，才会把赛程写入您指定的本地文件；导出过程不经过网络。');
                                this.privacyParagraph.bind(this)('六、您的权利：您可以随时在应用内修改或删除任何数据，也可以点击下方「清除本机数据」一次性删除全部本地数据。');
                                this.privacyParagraph.bind(this)('七、未成年人保护：本应用为校园赛事编排工具，不面向未成年人单独收集任何信息。');
                                this.privacyParagraph.bind(this)('八、联系方式：如对本隐私说明有任何疑问，请联系 ' + DEVELOPER_CONTACT + '。');
                                this.privacyParagraph.bind(this)('九、本说明自应用发布之日起生效。');
                                Column.pop();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        title: '隐私说明', subtitle: '本应用不收集、不上传任何个人信息'
                    });
                }
            }, { name: "CardSection" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new CardSection(this, {
                        title: '应用信息', subtitle: '',
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.debugLine("entry/src/main/ets/view/AboutView.ets(132:9)", "entry");
                                Column.width('100%');
                            }, Column);
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new KeyValueRow(this, { label: '应用名称', value: '校园赛程编排器' }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 133, col: 11 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                label: '应用名称',
                                                value: '校园赛程编排器'
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            label: '应用名称', value: '校园赛程编排器'
                                        });
                                    }
                                }, { name: "KeyValueRow" });
                            }
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new KeyValueRow(this, { label: '版本号', value: `${APP_VERSION}（Build ${APP_BUILD}）`, divided: true }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 134, col: 11 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                label: '版本号',
                                                value: `${APP_VERSION}（Build ${APP_BUILD}）`,
                                                divided: true
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            label: '版本号', value: `${APP_VERSION}（Build ${APP_BUILD}）`, divided: true
                                        });
                                    }
                                }, { name: "KeyValueRow" });
                            }
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new KeyValueRow(this, { label: '应用包名', value: BUNDLE_NAME, divided: true }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 135, col: 11 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                label: '应用包名',
                                                value: BUNDLE_NAME,
                                                divided: true
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            label: '应用包名', value: BUNDLE_NAME, divided: true
                                        });
                                    }
                                }, { name: "KeyValueRow" });
                            }
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new KeyValueRow(this, { label: '开发者联系方式', value: DEVELOPER_CONTACT, divided: true }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 136, col: 11 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                label: '开发者联系方式',
                                                value: DEVELOPER_CONTACT,
                                                divided: true
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            label: '开发者联系方式', value: DEVELOPER_CONTACT, divided: true
                                        });
                                    }
                                }, { name: "KeyValueRow" });
                            }
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new KeyValueRow(this, { label: '支持设备', value: '鸿蒙电脑 / 平板 / 手机', divided: true }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 137, col: 11 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                label: '支持设备',
                                                value: '鸿蒙电脑 / 平板 / 手机',
                                                divided: true
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            label: '支持设备', value: '鸿蒙电脑 / 平板 / 手机', divided: true
                                        });
                                    }
                                }, { name: "KeyValueRow" });
                            }
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new KeyValueRow(this, { label: '数据存储位置', value: '仅本机', divided: true, tone: ToneKind.Ok }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 138, col: 11 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                label: '数据存储位置',
                                                value: '仅本机',
                                                divided: true,
                                                tone: ToneKind.Ok
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            label: '数据存储位置', value: '仅本机', divided: true, tone: ToneKind.Ok
                                        });
                                    }
                                }, { name: "KeyValueRow" });
                            }
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new KeyValueRow(this, { label: '网络访问', value: '无', divided: true, tone: ToneKind.Ok }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 139, col: 11 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                label: '网络访问',
                                                value: '无',
                                                divided: true,
                                                tone: ToneKind.Ok
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            label: '网络访问', value: '无', divided: true, tone: ToneKind.Ok
                                        });
                                    }
                                }, { name: "KeyValueRow" });
                            }
                            Column.pop();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 131, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            title: '应用信息',
                            subtitle: '',
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create();
                                    Column.debugLine("entry/src/main/ets/view/AboutView.ets(132:9)", "entry");
                                    Column.width('100%');
                                }, Column);
                                {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        if (isInitialRender) {
                                            let componentCall = new KeyValueRow(this, { label: '应用名称', value: '校园赛程编排器' }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 133, col: 11 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    label: '应用名称',
                                                    value: '校园赛程编排器'
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                label: '应用名称', value: '校园赛程编排器'
                                            });
                                        }
                                    }, { name: "KeyValueRow" });
                                }
                                {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        if (isInitialRender) {
                                            let componentCall = new KeyValueRow(this, { label: '版本号', value: `${APP_VERSION}（Build ${APP_BUILD}）`, divided: true }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 134, col: 11 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    label: '版本号',
                                                    value: `${APP_VERSION}（Build ${APP_BUILD}）`,
                                                    divided: true
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                label: '版本号', value: `${APP_VERSION}（Build ${APP_BUILD}）`, divided: true
                                            });
                                        }
                                    }, { name: "KeyValueRow" });
                                }
                                {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        if (isInitialRender) {
                                            let componentCall = new KeyValueRow(this, { label: '应用包名', value: BUNDLE_NAME, divided: true }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 135, col: 11 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    label: '应用包名',
                                                    value: BUNDLE_NAME,
                                                    divided: true
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                label: '应用包名', value: BUNDLE_NAME, divided: true
                                            });
                                        }
                                    }, { name: "KeyValueRow" });
                                }
                                {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        if (isInitialRender) {
                                            let componentCall = new KeyValueRow(this, { label: '开发者联系方式', value: DEVELOPER_CONTACT, divided: true }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 136, col: 11 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    label: '开发者联系方式',
                                                    value: DEVELOPER_CONTACT,
                                                    divided: true
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                label: '开发者联系方式', value: DEVELOPER_CONTACT, divided: true
                                            });
                                        }
                                    }, { name: "KeyValueRow" });
                                }
                                {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        if (isInitialRender) {
                                            let componentCall = new KeyValueRow(this, { label: '支持设备', value: '鸿蒙电脑 / 平板 / 手机', divided: true }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 137, col: 11 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    label: '支持设备',
                                                    value: '鸿蒙电脑 / 平板 / 手机',
                                                    divided: true
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                label: '支持设备', value: '鸿蒙电脑 / 平板 / 手机', divided: true
                                            });
                                        }
                                    }, { name: "KeyValueRow" });
                                }
                                {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        if (isInitialRender) {
                                            let componentCall = new KeyValueRow(this, { label: '数据存储位置', value: '仅本机', divided: true, tone: ToneKind.Ok }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 138, col: 11 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    label: '数据存储位置',
                                                    value: '仅本机',
                                                    divided: true,
                                                    tone: ToneKind.Ok
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                label: '数据存储位置', value: '仅本机', divided: true, tone: ToneKind.Ok
                                            });
                                        }
                                    }, { name: "KeyValueRow" });
                                }
                                {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        if (isInitialRender) {
                                            let componentCall = new KeyValueRow(this, { label: '网络访问', value: '无', divided: true, tone: ToneKind.Ok }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 139, col: 11 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    label: '网络访问',
                                                    value: '无',
                                                    divided: true,
                                                    tone: ToneKind.Ok
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                label: '网络访问', value: '无', divided: true, tone: ToneKind.Ok
                                            });
                                        }
                                    }, { name: "KeyValueRow" });
                                }
                                Column.pop();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        title: '应用信息', subtitle: ''
                    });
                }
            }, { name: "CardSection" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new CardSection(this, {
                        title: '数据管理', subtitle: '清除后无法恢复，请谨慎操作',
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create({ space: Space.md });
                                Row.debugLine("entry/src/main/ets/view/AboutView.ets(145:9)", "entry");
                                Row.width('100%');
                                Row.alignItems(VerticalAlign.Center);
                            }, Row);
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new AppButton(this, {
                                            label: '清除本机数据',
                                            kind: BtnKind.Danger,
                                            onTap: () => this.onClearData()
                                        }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 146, col: 11 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                label: '清除本机数据',
                                                kind: BtnKind.Danger,
                                                onTap: () => this.onClearData()
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            label: '清除本机数据',
                                            kind: BtnKind.Danger
                                        });
                                    }
                                }, { name: "AppButton" });
                            }
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(`当前共 ${this.model.teams.length} 支队伍、${this.model.matches.length} 场比赛。`);
                                Text.debugLine("entry/src/main/ets/view/AboutView.ets(151:11)", "entry");
                                Text.fontSize(FontSize.small);
                                Text.fontColor(Palette.textSecondary);
                            }, Text);
                            Text.pop();
                            Row.pop();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 144, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            title: '数据管理',
                            subtitle: '清除后无法恢复，请谨慎操作',
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create({ space: Space.md });
                                    Row.debugLine("entry/src/main/ets/view/AboutView.ets(145:9)", "entry");
                                    Row.width('100%');
                                    Row.alignItems(VerticalAlign.Center);
                                }, Row);
                                {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        if (isInitialRender) {
                                            let componentCall = new AppButton(this, {
                                                label: '清除本机数据',
                                                kind: BtnKind.Danger,
                                                onTap: () => this.onClearData()
                                            }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/AboutView.ets", line: 146, col: 11 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    label: '清除本机数据',
                                                    kind: BtnKind.Danger,
                                                    onTap: () => this.onClearData()
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                label: '清除本机数据',
                                                kind: BtnKind.Danger
                                            });
                                        }
                                    }, { name: "AppButton" });
                                }
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(`当前共 ${this.model.teams.length} 支队伍、${this.model.matches.length} 场比赛。`);
                                    Text.debugLine("entry/src/main/ets/view/AboutView.ets(151:11)", "entry");
                                    Text.fontSize(FontSize.small);
                                    Text.fontColor(Palette.textSecondary);
                                }, Text);
                                Text.pop();
                                Row.pop();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        title: '数据管理', subtitle: '清除后无法恢复，请谨慎操作'
                    });
                }
            }, { name: "CardSection" });
        }
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
