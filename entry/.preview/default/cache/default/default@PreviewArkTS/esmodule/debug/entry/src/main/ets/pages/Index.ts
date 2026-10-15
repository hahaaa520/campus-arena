if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface Index_Params {
    model?: AppModel;
    nav?: NavKey;
    widthVp?: number;
    saveHint?: string;
    pendingClear?: boolean;
    store?: TournamentStore;
    storeReady?: boolean;
}
import type common from "@ohos:app.ability.common";
import hilog from "@ohos:hilog";
import { AppModel, modelFromState } from "@normalized:N&&&entry/src/main/ets/model/AppModel&";
import { TournamentStore } from "@normalized:N&&&entry/src/main/ets/model/Store&";
import { Breakpoint, CONTENT_MAX_WIDTH, FontSize, NavKey, Palette, Radius, Space, ToneKind, breakpointOf, navItems, sideNavWidth } from "@normalized:N&&&entry/src/main/ets/common/Theme&";
import type { NavItem } from "@normalized:N&&&entry/src/main/ets/common/Theme&";
import { AppButton, BtnKind, Pill } from "@normalized:N&&&entry/src/main/ets/common/Widgets&";
import { OverviewView } from "@normalized:N&&&entry/src/main/ets/view/OverviewView&";
import { SetupView } from "@normalized:N&&&entry/src/main/ets/view/SetupView&";
import { TeamsView } from "@normalized:N&&&entry/src/main/ets/view/TeamsView&";
import { ScheduleView } from "@normalized:N&&&entry/src/main/ets/view/ScheduleView&";
import { VenueView } from "@normalized:N&&&entry/src/main/ets/view/VenueView&";
import { AboutView } from "@normalized:N&&&entry/src/main/ets/view/AboutView&";
const DOMAIN: number = 0x0000;
const TAG: string = 'CampusArena.Index';
class Index extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__model = new ObservedPropertyObjectPU(new AppModel(), this, "model");
        this.__nav = new ObservedPropertySimplePU(NavKey.Overview, this, "nav");
        this.__widthVp = new ObservedPropertySimplePU(1280, this, "widthVp");
        this.__saveHint = new ObservedPropertySimplePU('本机数据', this, "saveHint");
        this.__pendingClear = new ObservedPropertySimplePU(false, this, "pendingClear");
        this.store = new TournamentStore();
        this.storeReady = false;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: Index_Params) {
        if (params.model !== undefined) {
            this.model = params.model;
        }
        if (params.nav !== undefined) {
            this.nav = params.nav;
        }
        if (params.widthVp !== undefined) {
            this.widthVp = params.widthVp;
        }
        if (params.saveHint !== undefined) {
            this.saveHint = params.saveHint;
        }
        if (params.pendingClear !== undefined) {
            this.pendingClear = params.pendingClear;
        }
        if (params.store !== undefined) {
            this.store = params.store;
        }
        if (params.storeReady !== undefined) {
            this.storeReady = params.storeReady;
        }
    }
    updateStateVars(params: Index_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__model.purgeDependencyOnElmtId(rmElmtId);
        this.__nav.purgeDependencyOnElmtId(rmElmtId);
        this.__widthVp.purgeDependencyOnElmtId(rmElmtId);
        this.__saveHint.purgeDependencyOnElmtId(rmElmtId);
        this.__pendingClear.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__model.aboutToBeDeleted();
        this.__nav.aboutToBeDeleted();
        this.__widthVp.aboutToBeDeleted();
        this.__saveHint.aboutToBeDeleted();
        this.__pendingClear.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __model: ObservedPropertyObjectPU<AppModel>;
    get model() {
        return this.__model.get();
    }
    set model(newValue: AppModel) {
        this.__model.set(newValue);
    }
    private __nav: ObservedPropertySimplePU<NavKey>;
    get nav() {
        return this.__nav.get();
    }
    set nav(newValue: NavKey) {
        this.__nav.set(newValue);
    }
    private __widthVp: ObservedPropertySimplePU<number>;
    get widthVp() {
        return this.__widthVp.get();
    }
    set widthVp(newValue: number) {
        this.__widthVp.set(newValue);
    }
    private __saveHint: ObservedPropertySimplePU<string>;
    get saveHint() {
        return this.__saveHint.get();
    }
    set saveHint(newValue: string) {
        this.__saveHint.set(newValue);
    }
    private __pendingClear: ObservedPropertySimplePU<boolean>;
    get pendingClear() {
        return this.__pendingClear.get();
    }
    set pendingClear(newValue: boolean) {
        this.__pendingClear.set(newValue);
    }
    private store: TournamentStore;
    private storeReady: boolean;
    aboutToAppear(): void {
        try {
            const context: common.UIAbilityContext = this.getUIContext().getHostContext() as common.UIAbilityContext;
            this.storeReady = this.store.open(context);
            this.model = modelFromState(this.store.load());
            this.saveHint = this.storeReady ? '本机数据' : '仅当前会话';
        }
        catch (err) {
            hilog.error(DOMAIN, TAG, 'init failed: %{public}s', JSON.stringify(err));
        }
    }
    aboutToDisappear(): void {
        this.persist();
    }
    onPageHide(): void {
        this.persist();
    }
    private persist(): void {
        if (!this.storeReady) {
            return;
        }
        const result = this.store.save(this.model.snapshot());
        this.saveHint = result.ok ? '已保存' : '保存失败';
    }
    private notify(message: string): void {
        try {
            this.getUIContext().getPromptAction().showToast({ message: message, duration: 2400 });
        }
        catch (err) {
            hilog.warn(DOMAIN, TAG, 'toast failed: %{public}s', JSON.stringify(err));
        }
    }
    private bp(): Breakpoint {
        return breakpointOf(this.widthVp);
    }
    private currentLabel(): string {
        const items: NavItem[] = navItems();
        for (let i = 0; i < items.length; i++) {
            if (items[i].key === this.nav) {
                return items[i].label;
            }
        }
        return '';
    }
    private currentHint(): string {
        const items: NavItem[] = navItems();
        for (let i = 0; i < items.length; i++) {
            if (items[i].key === this.nav) {
                return items[i].hint;
            }
        }
        return '';
    }
    /* ------------------------------------------------------------------ *
     * 导航
     * ------------------------------------------------------------------ */
    brandMark(compact: boolean, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: Space.sm });
            Row.debugLine("entry/src/main/ets/pages/Index.ets(116:5)", "entry");
            Row.alignItems(VerticalAlign.Center);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777237, "type": 20000, params: [], "bundleName": "com.campusarena.scheduler", "moduleName": "entry" });
            Image.debugLine("entry/src/main/ets/pages/Index.ets(117:7)", "entry");
            Image.width(32);
            Image.height(32);
            Image.borderRadius(Radius.sm);
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (!compact) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 0 });
                        Column.debugLine("entry/src/main/ets/pages/Index.ets(122:9)", "entry");
                        Column.alignItems(HorizontalAlign.Start);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('校园赛程编排器');
                        Text.debugLine("entry/src/main/ets/pages/Index.ets(123:11)", "entry");
                        Text.fontSize(FontSize.body);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor(Palette.textPrimary);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('Campus Arena');
                        Text.debugLine("entry/src/main/ets/pages/Index.ets(127:11)", "entry");
                        Text.fontSize(FontSize.caption);
                        Text.fontColor(Palette.textTertiary);
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Row.pop();
    }
    navButton(item: NavItem, compact: boolean, index: number, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: Space.md });
            Row.debugLine("entry/src/main/ets/pages/Index.ets(139:5)", "entry");
            Row.width('100%');
            Row.height(compact ? 48 : 58);
            Row.padding({ left: compact ? 0 : Space.md, right: Space.md });
            Row.justifyContent(compact ? FlexAlign.Center : FlexAlign.Start);
            Row.alignItems(VerticalAlign.Center);
            Row.backgroundColor(this.nav === item.key ? Palette.sideActive : Color.Transparent);
            Row.borderRadius(Radius.md);
            Row.focusable(true);
            Row.tabIndex(index + 1);
            Row.hoverEffect(HoverEffect.Highlight);
            Row.onClick(() => {
                this.nav = item.key;
                this.pendingClear = false;
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(item.symbol);
            Text.debugLine("entry/src/main/ets/pages/Index.ets(140:7)", "entry");
            Text.fontSize(FontSize.subhead);
            Text.fontColor(this.nav === item.key ? Palette.brand : Palette.textSecondary);
            Text.width(24);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (!compact) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 2 });
                        Column.debugLine("entry/src/main/ets/pages/Index.ets(146:9)", "entry");
                        Column.alignItems(HorizontalAlign.Start);
                        Column.layoutWeight(1);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(item.label);
                        Text.debugLine("entry/src/main/ets/pages/Index.ets(147:11)", "entry");
                        Text.fontSize(FontSize.body);
                        Text.fontColor(this.nav === item.key ? Palette.brand : Palette.textPrimary);
                        Text.fontWeight(this.nav === item.key ? FontWeight.Medium : FontWeight.Normal);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(item.hint);
                        Text.debugLine("entry/src/main/ets/pages/Index.ets(151:11)", "entry");
                        Text.fontSize(FontSize.caption);
                        Text.fontColor(Palette.textTertiary);
                        Text.maxLines(1);
                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Row.pop();
    }
    sideNav(compact: boolean, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/Index.ets(179:5)", "entry");
            Column.width(sideNavWidth(this.bp()));
            Column.height('100%');
            Column.backgroundColor(Palette.sideBg);
            Column.border({ width: { right: 1 }, color: { right: Palette.divider } });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/Index.ets(180:7)", "entry");
            Column.width('100%');
            Column.height(72);
            Column.padding({ left: compact ? 0 : Space.lg, right: Space.lg });
            Column.justifyContent(compact ? FlexAlign.Center : FlexAlign.Start);
            Column.alignItems(compact ? HorizontalAlign.Center : HorizontalAlign.Start);
        }, Column);
        this.brandMark.bind(this)(compact);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: Space.xs });
            Column.debugLine("entry/src/main/ets/pages/Index.ets(189:7)", "entry");
            Column.width('100%');
            Column.padding({ left: Space.sm, right: Space.sm });
            Column.layoutWeight(1);
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = (_item, index: number) => {
                const item = _item;
                this.navButton.bind(this)(item, compact, index);
            };
            this.forEachUpdateFunction(elmtId, navItems(), forEachItemGenFunction, (item: NavItem) => item.key, true, false);
        }, ForEach);
        ForEach.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (!compact) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: Space.xs });
                        Column.debugLine("entry/src/main/ets/pages/Index.ets(200:9)", "entry");
                        Column.width('100%');
                        Column.padding(Space.lg);
                        Column.alignItems(HorizontalAlign.Start);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('数据全部保存在本机');
                        Text.debugLine("entry/src/main/ets/pages/Index.ets(201:11)", "entry");
                        Text.fontSize(FontSize.caption);
                        Text.fontColor(Palette.textTertiary);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('无需联网 · 不收集个人信息');
                        Text.debugLine("entry/src/main/ets/pages/Index.ets(204:11)", "entry");
                        Text.fontSize(FontSize.caption);
                        Text.fontColor(Palette.textTertiary);
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    topTabs(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/Index.ets(221:5)", "entry");
            Scroll.scrollable(ScrollDirection.Horizontal);
            Scroll.scrollBar(BarState.Off);
            Scroll.width('100%');
            Scroll.backgroundColor(Palette.sideBg);
            Scroll.border({ width: { bottom: 1 }, color: { bottom: Palette.divider } });
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: Space.sm });
            Row.debugLine("entry/src/main/ets/pages/Index.ets(222:7)", "entry");
            Row.padding({ left: Space.lg, right: Space.lg, top: Space.sm, bottom: Space.sm });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = (_item, index: number) => {
                const item = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Row.create({ space: Space.xs });
                    Row.debugLine("entry/src/main/ets/pages/Index.ets(224:11)", "entry");
                    Row.padding({ left: Space.md, right: Space.md, top: 8, bottom: 8 });
                    Row.backgroundColor(this.nav === item.key ? Palette.brand : Palette.inputBg);
                    Row.borderRadius(Radius.pill);
                    Row.focusable(true);
                    Row.tabIndex(index + 1);
                    Row.hoverEffect(HoverEffect.Highlight);
                    Row.onClick(() => {
                        this.nav = item.key;
                        this.pendingClear = false;
                    });
                }, Row);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(item.symbol);
                    Text.debugLine("entry/src/main/ets/pages/Index.ets(225:13)", "entry");
                    Text.fontSize(FontSize.body);
                    Text.fontColor(this.nav === item.key ? Palette.textOnBrand : Palette.textSecondary);
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(item.label);
                    Text.debugLine("entry/src/main/ets/pages/Index.ets(227:13)", "entry");
                    Text.fontSize(FontSize.small);
                    Text.fontColor(this.nav === item.key ? Palette.textOnBrand : Palette.textSecondary);
                }, Text);
                Text.pop();
                Row.pop();
            };
            this.forEachUpdateFunction(elmtId, navItems(), forEachItemGenFunction, (item: NavItem) => item.key, true, false);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        Scroll.pop();
    }
    /* ------------------------------------------------------------------ *
     * 顶栏
     * ------------------------------------------------------------------ */
    header(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: Space.md });
            Row.debugLine("entry/src/main/ets/pages/Index.ets(257:5)", "entry");
            Row.width('100%');
            Row.height(72);
            Row.padding({ left: Space.xl, right: Space.xl });
            Row.alignItems(VerticalAlign.Center);
            Row.backgroundColor(Palette.headerBg);
            Row.border({ width: { bottom: 1 }, color: { bottom: Palette.divider } });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.bp() === Breakpoint.Sm) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.brandMark.bind(this)(true);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 2 });
            Column.debugLine("entry/src/main/ets/pages/Index.ets(261:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.currentLabel());
            Text.debugLine("entry/src/main/ets/pages/Index.ets(262:9)", "entry");
            Text.fontSize(FontSize.title);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Palette.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.currentHint());
            Text.debugLine("entry/src/main/ets/pages/Index.ets(266:9)", "entry");
            Text.fontSize(FontSize.caption);
            Text.fontColor(Palette.textTertiary);
            Text.maxLines(1);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.bp() !== Breakpoint.Sm) {
                this.ifElseBranchUpdateFunction(0, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new Pill(this, { text: this.model.config.name, tone: ToneKind.Neutral }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 276, col: 9 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        text: this.model.config.name,
                                        tone: ToneKind.Neutral
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    text: this.model.config.name, tone: ToneKind.Neutral
                                });
                            }
                        }, { name: "Pill" });
                    }
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new Pill(this, { text: this.saveHint, tone: ToneKind.Ok }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 278, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            text: this.saveHint,
                            tone: ToneKind.Ok
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        text: this.saveHint, tone: ToneKind.Ok
                    });
                }
            }, { name: "Pill" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new AppButton(this, {
                        label: '保存',
                        kind: BtnKind.Secondary,
                        symbol: '✓',
                        tabIndexValue: 0,
                        onTap: () => {
                            this.persist();
                            this.notify('已保存到本机。');
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 280, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '保存',
                            kind: BtnKind.Secondary,
                            symbol: '✓',
                            tabIndexValue: 0,
                            onTap: () => {
                                this.persist();
                                this.notify('已保存到本机。');
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '保存',
                        kind: BtnKind.Secondary,
                        symbol: '✓',
                        tabIndexValue: 0
                    });
                }
            }, { name: "AppButton" });
        }
        Row.pop();
    }
    /* ------------------------------------------------------------------ *
     * 内容
     * ------------------------------------------------------------------ */
    content(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.nav === NavKey.Overview) {
                this.ifElseBranchUpdateFunction(0, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new OverviewView(this, {
                                    model: this.model,
                                    goSchedule: () => {
                                        this.nav = NavKey.Schedule;
                                    },
                                    goSetup: () => {
                                        this.nav = NavKey.Setup;
                                    }
                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 306, col: 7 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        model: this.model,
                                        goSchedule: () => {
                                            this.nav = NavKey.Schedule;
                                        },
                                        goSetup: () => {
                                            this.nav = NavKey.Setup;
                                        }
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    model: this.model
                                });
                            }
                        }, { name: "OverviewView" });
                    }
                });
            }
            else if (this.nav === NavKey.Setup) {
                this.ifElseBranchUpdateFunction(1, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new SetupView(this, {
                                    model: this.model,
                                    onChanged: () => this.persist(),
                                    notify: (msg: string) => this.notify(msg)
                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 316, col: 7 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        model: this.model,
                                        onChanged: () => this.persist(),
                                        notify: (msg: string) => this.notify(msg)
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    model: this.model
                                });
                            }
                        }, { name: "SetupView" });
                    }
                });
            }
            else if (this.nav === NavKey.Teams) {
                this.ifElseBranchUpdateFunction(2, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new TeamsView(this, {
                                    model: this.model,
                                    onChanged: () => this.persist(),
                                    notify: (msg: string) => this.notify(msg)
                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 322, col: 7 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        model: this.model,
                                        onChanged: () => this.persist(),
                                        notify: (msg: string) => this.notify(msg)
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    model: this.model
                                });
                            }
                        }, { name: "TeamsView" });
                    }
                });
            }
            else if (this.nav === NavKey.Schedule) {
                this.ifElseBranchUpdateFunction(3, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new ScheduleView(this, {
                                    model: this.model,
                                    onChanged: () => this.persist(),
                                    notify: (msg: string) => this.notify(msg)
                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 328, col: 7 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        model: this.model,
                                        onChanged: () => this.persist(),
                                        notify: (msg: string) => this.notify(msg)
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    model: this.model
                                });
                            }
                        }, { name: "ScheduleView" });
                    }
                });
            }
            else if (this.nav === NavKey.Venues) {
                this.ifElseBranchUpdateFunction(4, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new VenueView(this, { model: this.model }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 334, col: 7 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        model: this.model
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    model: this.model
                                });
                            }
                        }, { name: "VenueView" });
                    }
                });
            }
            else {
                this.ifElseBranchUpdateFunction(5, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new AboutView(this, {
                                    model: this.model,
                                    onClearData: () => {
                                        this.pendingClear = true;
                                    }
                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 336, col: 7 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        model: this.model,
                                        onClearData: () => {
                                            this.pendingClear = true;
                                        }
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    model: this.model
                                });
                            }
                        }, { name: "AboutView" });
                    }
                });
            }
        }, If);
        If.pop();
    }
    clearConfirm(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: Space.md });
            Row.debugLine("entry/src/main/ets/pages/Index.ets(347:5)", "entry");
            Row.width('100%');
            Row.padding(Space.lg);
            Row.backgroundColor(Palette.dangerSoft);
            Row.borderRadius(Radius.md);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('清除后本机保存的全部队伍、配置与比分都会删除，且无法恢复。确认继续？');
            Text.debugLine("entry/src/main/ets/pages/Index.ets(348:7)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.danger);
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new AppButton(this, {
                        label: '确认清除',
                        kind: BtnKind.Danger,
                        onTap: () => {
                            this.store.clear();
                            this.model.resetToSample();
                            this.persist();
                            this.pendingClear = false;
                            this.notify('已清除本机数据，并恢复为示例队伍。');
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 352, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '确认清除',
                            kind: BtnKind.Danger,
                            onTap: () => {
                                this.store.clear();
                                this.model.resetToSample();
                                this.persist();
                                this.pendingClear = false;
                                this.notify('已清除本机数据，并恢复为示例队伍。');
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '确认清除',
                        kind: BtnKind.Danger
                    });
                }
            }, { name: "AppButton" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new AppButton(this, {
                        label: '取消',
                        kind: BtnKind.Ghost,
                        onTap: () => {
                            this.pendingClear = false;
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 363, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '取消',
                            kind: BtnKind.Ghost,
                            onTap: () => {
                                this.pendingClear = false;
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '取消',
                        kind: BtnKind.Ghost
                    });
                }
            }, { name: "AppButton" });
        }
        Row.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/Index.ets(378:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor(Palette.pageBg);
            Column.onAreaChange((_oldArea: Area, newArea: Area) => {
                const w: number = newArea.width as number;
                if (w > 0 && Math.abs(w - this.widthVp) > 1) {
                    this.widthVp = w;
                }
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/Index.ets(379:7)", "entry");
            Row.width('100%');
            Row.height('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.bp() !== Breakpoint.Sm) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.sideNav.bind(this)(this.bp() === Breakpoint.Md);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/Index.ets(384:9)", "entry");
            Column.layoutWeight(1);
            Column.height('100%');
            Column.backgroundColor(Palette.pageBg);
        }, Column);
        this.header.bind(this)();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.bp() === Breakpoint.Sm) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.topTabs.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/Index.ets(391:11)", "entry");
            Scroll.layoutWeight(1);
            Scroll.scrollBar(BarState.Auto);
            Scroll.align(Alignment.Top);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/Index.ets(392:13)", "entry");
            Row.width('100%');
            Row.justifyContent(FlexAlign.Center);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: Space.lg });
            Column.debugLine("entry/src/main/ets/pages/Index.ets(393:15)", "entry");
            Column.layoutWeight(1);
            Column.constraintSize({ maxWidth: CONTENT_MAX_WIDTH });
            Column.alignItems(HorizontalAlign.Start);
            Column.padding({
                left: this.bp() === Breakpoint.Sm ? Space.md : Space.xl,
                right: this.bp() === Breakpoint.Sm ? Space.md : Space.xl,
                top: Space.xl,
                bottom: 56
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.pendingClear) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.clearConfirm.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.content.bind(this)();
        Column.pop();
        Row.pop();
        Scroll.pop();
        Column.pop();
        Row.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "Index";
    }
}
registerNamedRoute(() => new Index(undefined, {}), "", { bundleName: "com.campusarena.scheduler", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
