if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface ScheduleView_Params {
    model?: AppModel;
    onChanged?: () => void;
    notify?: (msg: string) => void;
    filter?: string;
    selectedId?: string;
    scoreHome?: string;
    scoreAway?: string;
    editVenueId?: string;
    editDay?: number;
    editTime?: string;
    pendingRegen?: boolean;
    pendingClear?: boolean;
    exporting?: boolean;
}
import type common from "@ohos:app.ability.common";
import type { AppModel } from '../model/AppModel';
import { ConflictLevel, formatClock, parseClock } from "@normalized:N&&&entry/src/main/ets/model/Types&";
import type { Conflict, Match, Venue } from "@normalized:N&&&entry/src/main/ets/model/Types&";
import { compareSchedule, detectConflicts, generateMatches, matchTitle, propagateWinners, scheduleMatches, teamName, toCsv, venueNameOf } from "@normalized:N&&&entry/src/main/ets/model/Scheduler&";
import { exportTextFile } from "@normalized:N&&&entry/src/main/ets/common/Exporter&";
import { FontSize, Palette, Radius, Space, ToneKind } from "@normalized:N&&&entry/src/main/ets/common/Theme&";
import { AppButton, BtnKind, CardSection, EmptyHint, Pill } from "@normalized:N&&&entry/src/main/ets/common/Widgets&";
const FILTER_ALL: string = 'all';
const FILTER_TODO: string = 'todo';
const FILTER_DONE: string = 'done';
const FILTER_UNSCHEDULED: string = 'unscheduled';
export class ScheduleView extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__model = new SynchedPropertyNesedObjectPU(params.model, this, "model");
        this.onChanged = () => {
        };
        this.notify = () => {
        };
        this.__filter = new ObservedPropertySimplePU(FILTER_ALL, this, "filter");
        this.__selectedId = new ObservedPropertySimplePU('', this, "selectedId");
        this.__scoreHome = new ObservedPropertySimplePU('', this, "scoreHome");
        this.__scoreAway = new ObservedPropertySimplePU('', this, "scoreAway");
        this.__editVenueId = new ObservedPropertySimplePU('', this, "editVenueId");
        this.__editDay = new ObservedPropertySimplePU(0, this, "editDay");
        this.__editTime = new ObservedPropertySimplePU('', this, "editTime");
        this.__pendingRegen = new ObservedPropertySimplePU(false, this, "pendingRegen");
        this.__pendingClear = new ObservedPropertySimplePU(false, this, "pendingClear");
        this.__exporting = new ObservedPropertySimplePU(false, this, "exporting");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ScheduleView_Params) {
        this.__model.set(params.model);
        if (params.onChanged !== undefined) {
            this.onChanged = params.onChanged;
        }
        if (params.notify !== undefined) {
            this.notify = params.notify;
        }
        if (params.filter !== undefined) {
            this.filter = params.filter;
        }
        if (params.selectedId !== undefined) {
            this.selectedId = params.selectedId;
        }
        if (params.scoreHome !== undefined) {
            this.scoreHome = params.scoreHome;
        }
        if (params.scoreAway !== undefined) {
            this.scoreAway = params.scoreAway;
        }
        if (params.editVenueId !== undefined) {
            this.editVenueId = params.editVenueId;
        }
        if (params.editDay !== undefined) {
            this.editDay = params.editDay;
        }
        if (params.editTime !== undefined) {
            this.editTime = params.editTime;
        }
        if (params.pendingRegen !== undefined) {
            this.pendingRegen = params.pendingRegen;
        }
        if (params.pendingClear !== undefined) {
            this.pendingClear = params.pendingClear;
        }
        if (params.exporting !== undefined) {
            this.exporting = params.exporting;
        }
    }
    updateStateVars(params: ScheduleView_Params) {
        this.__model.set(params.model);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__model.purgeDependencyOnElmtId(rmElmtId);
        this.__filter.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedId.purgeDependencyOnElmtId(rmElmtId);
        this.__scoreHome.purgeDependencyOnElmtId(rmElmtId);
        this.__scoreAway.purgeDependencyOnElmtId(rmElmtId);
        this.__editVenueId.purgeDependencyOnElmtId(rmElmtId);
        this.__editDay.purgeDependencyOnElmtId(rmElmtId);
        this.__editTime.purgeDependencyOnElmtId(rmElmtId);
        this.__pendingRegen.purgeDependencyOnElmtId(rmElmtId);
        this.__pendingClear.purgeDependencyOnElmtId(rmElmtId);
        this.__exporting.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__model.aboutToBeDeleted();
        this.__filter.aboutToBeDeleted();
        this.__selectedId.aboutToBeDeleted();
        this.__scoreHome.aboutToBeDeleted();
        this.__scoreAway.aboutToBeDeleted();
        this.__editVenueId.aboutToBeDeleted();
        this.__editDay.aboutToBeDeleted();
        this.__editTime.aboutToBeDeleted();
        this.__pendingRegen.aboutToBeDeleted();
        this.__pendingClear.aboutToBeDeleted();
        this.__exporting.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __model: SynchedPropertyNesedObjectPU<AppModel>;
    get model() {
        return this.__model.get();
    }
    private onChanged: () => void;
    private notify: (msg: string) => void;
    private __filter: ObservedPropertySimplePU<string>;
    get filter() {
        return this.__filter.get();
    }
    set filter(newValue: string) {
        this.__filter.set(newValue);
    }
    private __selectedId: ObservedPropertySimplePU<string>;
    get selectedId() {
        return this.__selectedId.get();
    }
    set selectedId(newValue: string) {
        this.__selectedId.set(newValue);
    }
    private __scoreHome: ObservedPropertySimplePU<string>;
    get scoreHome() {
        return this.__scoreHome.get();
    }
    set scoreHome(newValue: string) {
        this.__scoreHome.set(newValue);
    }
    private __scoreAway: ObservedPropertySimplePU<string>;
    get scoreAway() {
        return this.__scoreAway.get();
    }
    set scoreAway(newValue: string) {
        this.__scoreAway.set(newValue);
    }
    private __editVenueId: ObservedPropertySimplePU<string>;
    get editVenueId() {
        return this.__editVenueId.get();
    }
    set editVenueId(newValue: string) {
        this.__editVenueId.set(newValue);
    }
    private __editDay: ObservedPropertySimplePU<number>;
    get editDay() {
        return this.__editDay.get();
    }
    set editDay(newValue: number) {
        this.__editDay.set(newValue);
    }
    private __editTime: ObservedPropertySimplePU<string>;
    get editTime() {
        return this.__editTime.get();
    }
    set editTime(newValue: string) {
        this.__editTime.set(newValue);
    }
    private __pendingRegen: ObservedPropertySimplePU<boolean>;
    get pendingRegen() {
        return this.__pendingRegen.get();
    }
    set pendingRegen(newValue: boolean) {
        this.__pendingRegen.set(newValue);
    }
    private __pendingClear: ObservedPropertySimplePU<boolean>;
    get pendingClear() {
        return this.__pendingClear.get();
    }
    set pendingClear(newValue: boolean) {
        this.__pendingClear.set(newValue);
    }
    private __exporting: ObservedPropertySimplePU<boolean>;
    get exporting() {
        return this.__exporting.get();
    }
    set exporting(newValue: boolean) {
        this.__exporting.set(newValue);
    }
    /* ---------------- 操作 ---------------- */
    private generate(): void {
        if (this.model.teams.length < 2) {
            this.notify('至少需要 2 支队伍才能生成赛程。');
            return;
        }
        if (this.model.config.venues.length === 0) {
            this.notify('请先在「赛事配置」中添加至少 1 块场地。');
            return;
        }
        const raw: Match[] = generateMatches(this.model.config, this.model.teams);
        const scheduled: Match[] = scheduleMatches(raw, this.model.config);
        this.model.replaceMatches(scheduled);
        this.selectedId = '';
        this.pendingRegen = false;
        this.pendingClear = false;
        this.onChanged();
        const unscheduled: number = scheduled.filter((m: Match) => m.dayIndex < 0).length;
        if (unscheduled > 0) {
            this.notify(`已生成 ${scheduled.length} 场比赛，其中 ${unscheduled} 场无法排入，请查看冲突提示。`);
        }
        else {
            this.notify(`已生成并排期 ${scheduled.length} 场比赛。`);
        }
    }
    private reschedule(): void {
        if (this.model.matches.length === 0) {
            this.notify('还没有赛程，请先生成。');
            return;
        }
        const scheduled: Match[] = scheduleMatches(this.model.matches, this.model.config);
        this.model.replaceMatches(propagateWinners(scheduled));
        this.onChanged();
        this.notify('已按当前规则重新排期，比分记录保持不变。');
    }
    private clearAll(): void {
        this.model.replaceMatches([]);
        this.selectedId = '';
        this.pendingClear = false;
        this.onChanged();
        this.notify('已清空赛程。');
    }
    private selectRow(m: Match): void {
        this.selectedId = m.id;
        this.scoreHome = m.played ? `${m.homeScore}` : '';
        this.scoreAway = m.played ? `${m.awayScore}` : '';
        this.editVenueId = m.venueId;
        this.editDay = m.dayIndex < 0 ? 0 : m.dayIndex;
        this.editTime = m.startMinutes >= 0 ? formatClock(m.startMinutes) : '';
    }
    private saveScore(): void {
        if (this.selectedId === '') {
            return;
        }
        const h: number = Number.parseInt(this.scoreHome, 10);
        const a: number = Number.parseInt(this.scoreAway, 10);
        if (Number.isNaN(h) || Number.isNaN(a) || h < 0 || a < 0) {
            this.notify('比分需为不小于 0 的整数。');
            return;
        }
        this.model.patchMatch(this.selectedId, { homeScore: h, awayScore: a, played: true });
        this.model.replaceMatches(propagateWinners(this.model.matches));
        this.onChanged();
        this.notify('已记录比分，胜者已自动晋级到下一轮。');
    }
    private saveManualSlot(): void {
        if (this.selectedId === '') {
            return;
        }
        const minutes: number = parseClock(this.editTime, -1);
        if (minutes < 0) {
            this.notify('时间格式应为 HH:mm，例如 15:30。');
            return;
        }
        this.model.patchMatch(this.selectedId, {
            venueId: this.editVenueId,
            dayIndex: this.editDay,
            startMinutes: minutes,
            pinned: true
        });
        this.onChanged();
        this.notify('已手动调整并锁定该场次，重新排期时会保留。');
    }
    private async doExport(): Promise<void> {
        if (this.model.matches.length === 0) {
            this.notify('还没有赛程可以导出。');
            return;
        }
        this.exporting = true;
        const context: common.UIAbilityContext = this.getUIContext().getHostContext() as common.UIAbilityContext;
        const safeName: string = this.model.config.name.replace(/[\\/:*?"<>|]/g, '_');
        const csv: string = toCsv(this.model.snapshot());
        const result = await exportTextFile(context, `${safeName}_赛程表.csv`, csv);
        this.exporting = false;
        this.notify(result.message);
    }
    /* ---------------- 派生数据 ---------------- */
    private visibleMatches(): Match[] {
        const list: Match[] = this.model.matches.slice();
        list.sort((a: Match, b: Match) => compareSchedule(a, b));
        const out: Match[] = [];
        for (let i = 0; i < list.length; i++) {
            const m: Match = list[i];
            if (this.filter === FILTER_TODO && (m.played || m.dayIndex < 0)) {
                continue;
            }
            if (this.filter === FILTER_DONE && !m.played) {
                continue;
            }
            if (this.filter === FILTER_UNSCHEDULED && m.dayIndex >= 0) {
                continue;
            }
            out.push(m);
        }
        return out;
    }
    private conflicts(): Conflict[] {
        return detectConflicts(this.model.matches, this.model.config, this.model.teams);
    }
    /* ---------------- 子视图 ---------------- */
    toolbar(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: Space.md });
            Column.debugLine("entry/src/main/ets/view/ScheduleView.ets(192:5)", "entry");
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: Space.sm });
            Row.debugLine("entry/src/main/ets/view/ScheduleView.ets(193:7)", "entry");
            Row.width('100%');
        }, Row);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new AppButton(this, {
                        label: this.model.matches.length === 0 ? '生成赛程' : '重新生成赛程',
                        kind: BtnKind.Primary,
                        symbol: '▤',
                        tabIndexValue: 1,
                        onTap: () => {
                            if (this.model.matches.length === 0) {
                                this.generate();
                            }
                            else {
                                this.pendingRegen = true;
                                this.pendingClear = false;
                            }
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 194, col: 9 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: this.model.matches.length === 0 ? '生成赛程' : '重新生成赛程',
                            kind: BtnKind.Primary,
                            symbol: '▤',
                            tabIndexValue: 1,
                            onTap: () => {
                                if (this.model.matches.length === 0) {
                                    this.generate();
                                }
                                else {
                                    this.pendingRegen = true;
                                    this.pendingClear = false;
                                }
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: this.model.matches.length === 0 ? '生成赛程' : '重新生成赛程',
                        kind: BtnKind.Primary,
                        symbol: '▤',
                        tabIndexValue: 1
                    });
                }
            }, { name: "AppButton" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new AppButton(this, {
                        label: '重新排期',
                        kind: BtnKind.Secondary,
                        symbol: '↻',
                        tabIndexValue: 2,
                        disabled: this.model.matches.length === 0,
                        onTap: () => this.reschedule()
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 208, col: 9 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '重新排期',
                            kind: BtnKind.Secondary,
                            symbol: '↻',
                            tabIndexValue: 2,
                            disabled: this.model.matches.length === 0,
                            onTap: () => this.reschedule()
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '重新排期',
                        kind: BtnKind.Secondary,
                        symbol: '↻',
                        tabIndexValue: 2,
                        disabled: this.model.matches.length === 0
                    });
                }
            }, { name: "AppButton" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new AppButton(this, {
                        label: this.exporting ? '导出中…' : '导出 CSV',
                        kind: BtnKind.Secondary,
                        symbol: '⇩',
                        tabIndexValue: 3,
                        disabled: this.exporting || this.model.matches.length === 0,
                        onTap: () => {
                            this.doExport();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 216, col: 9 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: this.exporting ? '导出中…' : '导出 CSV',
                            kind: BtnKind.Secondary,
                            symbol: '⇩',
                            tabIndexValue: 3,
                            disabled: this.exporting || this.model.matches.length === 0,
                            onTap: () => {
                                this.doExport();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: this.exporting ? '导出中…' : '导出 CSV',
                        kind: BtnKind.Secondary,
                        symbol: '⇩',
                        tabIndexValue: 3,
                        disabled: this.exporting || this.model.matches.length === 0
                    });
                }
            }, { name: "AppButton" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new AppButton(this, {
                        label: '清空赛程',
                        kind: BtnKind.Danger,
                        tabIndexValue: 4,
                        disabled: this.model.matches.length === 0,
                        onTap: () => {
                            this.pendingClear = true;
                            this.pendingRegen = false;
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 226, col: 9 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '清空赛程',
                            kind: BtnKind.Danger,
                            tabIndexValue: 4,
                            disabled: this.model.matches.length === 0,
                            onTap: () => {
                                this.pendingClear = true;
                                this.pendingRegen = false;
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '清空赛程',
                        kind: BtnKind.Danger,
                        tabIndexValue: 4,
                        disabled: this.model.matches.length === 0
                    });
                }
            }, { name: "AppButton" });
        }
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.pendingRegen) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create({ space: Space.md });
                        Row.debugLine("entry/src/main/ets/view/ScheduleView.ets(240:9)", "entry");
                        Row.width('100%');
                        Row.padding(Space.md);
                        Row.backgroundColor(Palette.warnSoft);
                        Row.borderRadius(Radius.md);
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('重新生成会清除已录入的比分与手动调整，确认继续？');
                        Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(241:11)", "entry");
                        Text.fontSize(FontSize.small);
                        Text.fontColor(Palette.warn);
                        Text.layoutWeight(1);
                    }, Text);
                    Text.pop();
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new AppButton(this, { label: '确认重新生成', kind: BtnKind.Danger, onTap: () => this.generate() }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 245, col: 11 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        label: '确认重新生成',
                                        kind: BtnKind.Danger,
                                        onTap: () => this.generate()
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    label: '确认重新生成', kind: BtnKind.Danger
                                });
                            }
                        }, { name: "AppButton" });
                    }
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new AppButton(this, { label: '取消', kind: BtnKind.Ghost, onTap: () => {
                                        this.pendingRegen = false;
                                    } }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 246, col: 11 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        label: '取消',
                                        kind: BtnKind.Ghost,
                                        onTap: () => {
                                            this.pendingRegen = false;
                                        }
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    label: '取消', kind: BtnKind.Ghost
                                });
                            }
                        }, { name: "AppButton" });
                    }
                    Row.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.pendingClear) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create({ space: Space.md });
                        Row.debugLine("entry/src/main/ets/view/ScheduleView.ets(257:9)", "entry");
                        Row.width('100%');
                        Row.padding(Space.md);
                        Row.backgroundColor(Palette.dangerSoft);
                        Row.borderRadius(Radius.md);
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('清空后所有对阵与比分都会丢失（队伍与配置保留），确认继续？');
                        Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(258:11)", "entry");
                        Text.fontSize(FontSize.small);
                        Text.fontColor(Palette.danger);
                        Text.layoutWeight(1);
                    }, Text);
                    Text.pop();
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new AppButton(this, { label: '确认清空', kind: BtnKind.Danger, onTap: () => this.clearAll() }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 262, col: 11 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        label: '确认清空',
                                        kind: BtnKind.Danger,
                                        onTap: () => this.clearAll()
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    label: '确认清空', kind: BtnKind.Danger
                                });
                            }
                        }, { name: "AppButton" });
                    }
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new AppButton(this, { label: '取消', kind: BtnKind.Ghost, onTap: () => {
                                        this.pendingClear = false;
                                    } }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 263, col: 11 });
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
                                    label: '取消', kind: BtnKind.Ghost
                                });
                            }
                        }, { name: "AppButton" });
                    }
                    Row.pop();
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
    filterBar(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: Space.sm });
            Row.debugLine("entry/src/main/ets/view/ScheduleView.ets(278:5)", "entry");
            Row.width('100%');
            Row.alignItems(VerticalAlign.Center);
        }, Row);
        this.filterChip.bind(this)('全部', FILTER_ALL);
        this.filterChip.bind(this)(`未开始（${this.countOf(FILTER_TODO)}）`, FILTER_TODO);
        this.filterChip.bind(this)(`已完赛（${this.countOf(FILTER_DONE)}）`, FILTER_DONE);
        this.filterChip.bind(this)(`未排期（${this.countOf(FILTER_UNSCHEDULED)}）`, FILTER_UNSCHEDULED);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/view/ScheduleView.ets(283:7)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`共 ${this.model.matches.length} 场`);
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(284:7)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
        }, Text);
        Text.pop();
        Row.pop();
    }
    filterChip(label: string, key: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(label);
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(294:5)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(this.filter === key ? Palette.textOnBrand : Palette.textSecondary);
            Text.backgroundColor(this.filter === key ? Palette.brand : Palette.inputBg);
            Text.padding({ left: Space.md, right: Space.md, top: 6, bottom: 6 });
            Text.borderRadius(Radius.pill);
            Text.focusable(true);
            Text.hoverEffect(HoverEffect.Highlight);
            Text.onClick(() => {
                this.filter = key;
            });
        }, Text);
        Text.pop();
    }
    private countOf(key: string): number {
        let n: number = 0;
        for (let i = 0; i < this.model.matches.length; i++) {
            const m: Match = this.model.matches[i];
            if (key === FILTER_TODO && !m.played && m.dayIndex >= 0) {
                n += 1;
            }
            else if (key === FILTER_DONE && m.played) {
                n += 1;
            }
            else if (key === FILTER_UNSCHEDULED && m.dayIndex < 0) {
                n += 1;
            }
        }
        return n;
    }
    conflictPanel(list: Conflict[], parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/ScheduleView.ets(324:5)", "entry");
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (list.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create({ space: Space.sm });
                        Row.debugLine("entry/src/main/ets/view/ScheduleView.ets(326:9)", "entry");
                        Row.width('100%');
                        Row.alignItems(VerticalAlign.Center);
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('✓');
                        Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(327:11)", "entry");
                        Text.fontSize(FontSize.body);
                        Text.fontColor(Palette.ok);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('未检测到冲突，赛程可以直接执行。');
                        Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(328:11)", "entry");
                        Text.fontSize(FontSize.small);
                        Text.fontColor(Palette.textSecondary);
                    }, Text);
                    Text.pop();
                    Row.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = (_item, index: number) => {
                            const item = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create({ space: Space.sm });
                                Row.debugLine("entry/src/main/ets/view/ScheduleView.ets(336:11)", "entry");
                                Row.width('100%');
                                Row.alignItems(VerticalAlign.Top);
                                Row.padding({ top: Space.sm, bottom: Space.sm });
                                Row.border(index < list.length - 1
                                    ? { width: { bottom: 1 }, color: { bottom: Palette.divider } }
                                    : { width: 0 });
                            }, Row);
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new Pill(this, {
                                            text: item.level === ConflictLevel.Error ? '必须修复' : '建议调整',
                                            tone: item.level === ConflictLevel.Error ? ToneKind.Danger : ToneKind.Warn,
                                            compact: true
                                        }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 337, col: 13 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                text: item.level === ConflictLevel.Error ? '必须修复' : '建议调整',
                                                tone: item.level === ConflictLevel.Error ? ToneKind.Danger : ToneKind.Warn,
                                                compact: true
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            text: item.level === ConflictLevel.Error ? '必须修复' : '建议调整',
                                            tone: item.level === ConflictLevel.Error ? ToneKind.Danger : ToneKind.Warn,
                                            compact: true
                                        });
                                    }
                                }, { name: "Pill" });
                            }
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(item.message);
                                Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(342:13)", "entry");
                                Text.fontSize(FontSize.small);
                                Text.fontColor(Palette.textSecondary);
                                Text.layoutWeight(1);
                            }, Text);
                            Text.pop();
                            Row.pop();
                        };
                        this.forEachUpdateFunction(elmtId, list, forEachItemGenFunction, (item: Conflict, index: number) => `${index}_${item.message}`, true, true);
                    }, ForEach);
                    ForEach.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    tableHeader(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/view/ScheduleView.ets(361:5)", "entry");
            Row.width('100%');
            Row.padding({ top: Space.sm, bottom: Space.sm });
            Row.border({ width: { bottom: 1 }, color: { bottom: Palette.divider } });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('比赛日');
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(362:7)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.width(84);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('时间');
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(363:7)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.width(110);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('场地');
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(364:7)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.layoutWeight(2);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('轮次');
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(365:7)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.width(120);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('对阵');
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(366:7)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.layoutWeight(4);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('比分');
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(367:7)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.width(88);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('状态');
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(368:7)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.width(88);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('操作');
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(369:7)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.width(96);
        }, Text);
        Text.pop();
        Row.pop();
    }
    tableRow(m: Match, index: number, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/view/ScheduleView.ets(378:5)", "entry");
            Row.width('100%');
            Row.constraintSize({ minHeight: 52 });
            Row.alignItems(VerticalAlign.Center);
            Row.padding({ top: Space.sm, bottom: Space.sm });
            Row.backgroundColor(this.selectedId === m.id ? Palette.brandSofter
                : (index % 2 === 0 ? Color.Transparent : Palette.hoverBg));
            Row.border({ width: { bottom: 1 }, color: { bottom: Palette.divider } });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(m.dayIndex >= 0 ? `第 ${m.dayIndex + 1} 天` : '未排期');
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(379:7)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(m.dayIndex >= 0 ? Palette.textSecondary : Palette.danger);
            Text.width(84);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(m.startMinutes >= 0
                ? `${formatClock(m.startMinutes)}–${formatClock(m.startMinutes + this.model.config.matchMinutes)}`
                : '—');
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(384:7)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textSecondary);
            Text.width(110);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(venueNameOf(this.model.config.venues, m.venueId) === ''
                ? '—' : venueNameOf(this.model.config.venues, m.venueId));
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(391:7)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textSecondary);
            Text.layoutWeight(2);
            Text.maxLines(1);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 4 });
            Row.debugLine("entry/src/main/ets/view/ScheduleView.ets(399:7)", "entry");
            Row.width(120);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (m.groupIndex >= 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new Pill(this, { text: `${this.groupName(m.groupIndex)}组`, tone: ToneKind.Neutral, compact: true }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 401, col: 11 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        text: `${this.groupName(m.groupIndex)}组`,
                                        tone: ToneKind.Neutral,
                                        compact: true
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    text: `${this.groupName(m.groupIndex)}组`, tone: ToneKind.Neutral, compact: true
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
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(m.roundLabel);
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(403:9)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textSecondary);
            Text.maxLines(1);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(matchTitle(m, this.model.teams));
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(410:7)", "entry");
            Text.fontSize(FontSize.body);
            Text.fontColor(Palette.textPrimary);
            Text.layoutWeight(4);
            Text.maxLines(1);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(m.played ? `${m.homeScore} : ${m.awayScore}` : '—');
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(417:7)", "entry");
            Text.fontSize(FontSize.body);
            Text.fontWeight(m.played ? FontWeight.Bold : FontWeight.Normal);
            Text.fontColor(m.played ? Palette.textPrimary : Palette.textTertiary);
            Text.width(88);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/view/ScheduleView.ets(423:7)", "entry");
            Row.width(88);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (m.played) {
                this.ifElseBranchUpdateFunction(0, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new Pill(this, { text: '已完赛', tone: ToneKind.Ok, compact: true }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 425, col: 11 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        text: '已完赛',
                                        tone: ToneKind.Ok,
                                        compact: true
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    text: '已完赛', tone: ToneKind.Ok, compact: true
                                });
                            }
                        }, { name: "Pill" });
                    }
                });
            }
            else if (m.dayIndex < 0) {
                this.ifElseBranchUpdateFunction(1, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new Pill(this, { text: '未排期', tone: ToneKind.Danger, compact: true }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 427, col: 11 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        text: '未排期',
                                        tone: ToneKind.Danger,
                                        compact: true
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    text: '未排期', tone: ToneKind.Danger, compact: true
                                });
                            }
                        }, { name: "Pill" });
                    }
                });
            }
            else {
                this.ifElseBranchUpdateFunction(2, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new Pill(this, { text: '待比赛', tone: ToneKind.Brand, compact: true }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 429, col: 11 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        text: '待比赛',
                                        tone: ToneKind.Brand,
                                        compact: true
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    text: '待比赛', tone: ToneKind.Brand, compact: true
                                });
                            }
                        }, { name: "Pill" });
                    }
                });
            }
        }, If);
        If.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/view/ScheduleView.ets(434:7)", "entry");
            Row.width(96);
            Row.justifyContent(FlexAlign.End);
        }, Row);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new AppButton(this, {
                        label: this.selectedId === m.id ? '收起' : '录入',
                        kind: this.selectedId === m.id ? BtnKind.Primary : BtnKind.Secondary,
                        onTap: () => {
                            if (this.selectedId === m.id) {
                                this.selectedId = '';
                            }
                            else {
                                this.selectRow(m);
                            }
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 435, col: 9 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: this.selectedId === m.id ? '收起' : '录入',
                            kind: this.selectedId === m.id ? BtnKind.Primary : BtnKind.Secondary,
                            onTap: () => {
                                if (this.selectedId === m.id) {
                                    this.selectedId = '';
                                }
                                else {
                                    this.selectRow(m);
                                }
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: this.selectedId === m.id ? '收起' : '录入',
                        kind: this.selectedId === m.id ? BtnKind.Primary : BtnKind.Secondary
                    });
                }
            }, { name: "AppButton" });
        }
        Row.pop();
        Row.pop();
    }
    private groupName(index: number): string {
        const letters: string = 'ABCDEFGH';
        return index >= 0 && index < letters.length ? letters.charAt(index) : `${index + 1}`;
    }
    editorCard(m: Match, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: Space.md });
            Column.debugLine("entry/src/main/ets/view/ScheduleView.ets(466:5)", "entry");
            Column.width('100%');
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: Space.sm });
            Row.debugLine("entry/src/main/ets/view/ScheduleView.ets(467:7)", "entry");
            Row.width('100%');
            Row.alignItems(VerticalAlign.Center);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('正在编辑：');
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(468:9)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(matchTitle(m, this.model.teams));
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(469:9)", "entry");
            Text.fontSize(FontSize.body);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(Palette.textPrimary);
        }, Text);
        Text.pop();
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new Pill(this, { text: m.roundLabel, tone: ToneKind.Neutral, compact: true }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 473, col: 9 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            text: m.roundLabel,
                            tone: ToneKind.Neutral,
                            compact: true
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        text: m.roundLabel, tone: ToneKind.Neutral, compact: true
                    });
                }
            }, { name: "Pill" });
        }
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (m.pinned) {
                this.ifElseBranchUpdateFunction(0, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new Pill(this, { text: '已手动锁定', tone: ToneKind.Warn, compact: true }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 475, col: 11 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        text: '已手动锁定',
                                        tone: ToneKind.Warn,
                                        compact: true
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    text: '已手动锁定', tone: ToneKind.Warn, compact: true
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
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: Space.lg });
            Row.debugLine("entry/src/main/ets/view/ScheduleView.ets(481:7)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: Space.sm });
            Column.debugLine("entry/src/main/ets/view/ScheduleView.ets(482:9)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('录入比分');
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(483:11)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textSecondary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: Space.sm });
            Row.debugLine("entry/src/main/ets/view/ScheduleView.ets(484:11)", "entry");
            Row.alignItems(VerticalAlign.Center);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(teamName(this.model.teams, m.homeTeamId));
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(485:13)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textSecondary);
            Text.width(120);
            Text.maxLines(1);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.scoreHome, placeholder: '0' });
            TextInput.debugLine("entry/src/main/ets/view/ScheduleView.ets(488:13)", "entry");
            TextInput.width(72);
            TextInput.height(36);
            TextInput.type(InputType.Number);
            TextInput.backgroundColor(Palette.inputBg);
            TextInput.borderRadius(Radius.sm);
            TextInput.onChange((v: string) => {
                this.scoreHome = v;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(':');
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(494:13)", "entry");
            Text.fontSize(FontSize.body);
            Text.fontColor(Palette.textTertiary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.scoreAway, placeholder: '0' });
            TextInput.debugLine("entry/src/main/ets/view/ScheduleView.ets(495:13)", "entry");
            TextInput.width(72);
            TextInput.height(36);
            TextInput.type(InputType.Number);
            TextInput.backgroundColor(Palette.inputBg);
            TextInput.borderRadius(Radius.sm);
            TextInput.onChange((v: string) => {
                this.scoreAway = v;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(teamName(this.model.teams, m.awayTeamId));
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(501:13)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textSecondary);
            Text.width(120);
            Text.maxLines(1);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        Text.pop();
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new AppButton(this, { label: '保存比分', kind: BtnKind.Primary, onTap: () => this.saveScore() }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 504, col: 13 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '保存比分',
                            kind: BtnKind.Primary,
                            onTap: () => this.saveScore()
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '保存比分', kind: BtnKind.Primary
                    });
                }
            }, { name: "AppButton" });
        }
        Row.pop();
        Column.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.debugLine("entry/src/main/ets/view/ScheduleView.ets(513:7)", "entry");
            Divider.color(Palette.divider);
        }, Divider);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: Space.sm });
            Column.debugLine("entry/src/main/ets/view/ScheduleView.ets(515:7)", "entry");
            Column.width('100%');
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('手动调整时间与场地（调整后会锁定，重新排期时保留）');
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(516:9)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textSecondary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: Space.sm });
            Row.debugLine("entry/src/main/ets/view/ScheduleView.ets(518:9)", "entry");
            Row.alignItems(VerticalAlign.Center);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('比赛日');
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(519:11)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: `${this.editDay + 1}` });
            TextInput.debugLine("entry/src/main/ets/view/ScheduleView.ets(520:11)", "entry");
            TextInput.width(64);
            TextInput.height(36);
            TextInput.type(InputType.Number);
            TextInput.backgroundColor(Palette.inputBg);
            TextInput.borderRadius(Radius.sm);
            TextInput.onChange((v: string) => {
                const n: number = Number.parseInt(v, 10);
                this.editDay = Number.isNaN(n) ? 1 : Math.max(1, Math.min(this.model.config.days, n)) - 1;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('开始时间');
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(527:11)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.editTime, placeholder: '15:30' });
            TextInput.debugLine("entry/src/main/ets/view/ScheduleView.ets(528:11)", "entry");
            TextInput.width(96);
            TextInput.height(36);
            TextInput.backgroundColor(Palette.inputBg);
            TextInput.borderRadius(Radius.sm);
            TextInput.onChange((v: string) => {
                this.editTime = v;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('场地');
            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(534:11)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Select.create(this.venueOptions());
            Select.debugLine("entry/src/main/ets/view/ScheduleView.ets(535:11)", "entry");
            Select.selected(this.venueIndexOf(this.editVenueId));
            Select.value(this.venueDisplayName(this.editVenueId));
            Select.font({ size: FontSize.small });
            Select.height(36);
            Select.onSelect((index: number) => {
                const venues: Venue[] = this.model.config.venues;
                if (index >= 0 && index < venues.length) {
                    this.editVenueId = venues[index].id;
                }
            });
        }, Select);
        Select.pop();
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new AppButton(this, { label: '应用调整', kind: BtnKind.Secondary, onTap: () => this.saveManualSlot() }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 546, col: 11 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '应用调整',
                            kind: BtnKind.Secondary,
                            onTap: () => this.saveManualSlot()
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '应用调整', kind: BtnKind.Secondary
                    });
                }
            }, { name: "AppButton" });
        }
        Row.pop();
        Column.pop();
        Column.pop();
    }
    private venueOptions(): SelectOption[] {
        const out: SelectOption[] = [];
        for (let i = 0; i < this.model.config.venues.length; i++) {
            out.push({ value: this.model.config.venues[i].name });
        }
        return out;
    }
    private venueIndexOf(id: string): number {
        for (let i = 0; i < this.model.config.venues.length; i++) {
            if (this.model.config.venues[i].id === id) {
                return i;
            }
        }
        return 0;
    }
    private venueDisplayName(id: string): string {
        const name: string = venueNameOf(this.model.config.venues, id);
        return name === '' ? '请选择场地' : name;
    }
    private selectedMatch(): Match | undefined {
        for (let i = 0; i < this.model.matches.length; i++) {
            if (this.model.matches[i].id === this.selectedId) {
                return this.model.matches[i];
            }
        }
        return undefined;
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: Space.lg });
            Column.debugLine("entry/src/main/ets/view/ScheduleView.ets(589:5)", "entry");
            Column.width('100%');
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new CardSection(this, {
                        title: '赛程编排', subtitle: '按轮次顺序贪心排期，自动避开场地与队伍时间冲突',
                        content: () => {
                            this.toolbar.bind(this)();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 590, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            title: '赛程编排',
                            subtitle: '按轮次顺序贪心排期，自动避开场地与队伍时间冲突',
                            content: () => {
                                this.toolbar.bind(this)();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        title: '赛程编排', subtitle: '按轮次顺序贪心排期，自动避开场地与队伍时间冲突'
                    });
                }
            }, { name: "CardSection" });
        }
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.model.matches.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new CardSection(this, {
                                    title: `冲突检查（${this.conflicts().length} 条）`,
                                    subtitle: '每次生成或调整后自动重新检查',
                                    content: () => {
                                        this.conflictPanel.bind(this)(this.conflicts());
                                    }
                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 595, col: 9 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        title: `冲突检查（${this.conflicts().length} 条）`,
                                        subtitle: '每次生成或调整后自动重新检查',
                                        content: () => {
                                            this.conflictPanel.bind(this)(this.conflicts());
                                        }
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    title: `冲突检查（${this.conflicts().length} 条）`,
                                    subtitle: '每次生成或调整后自动重新检查'
                                });
                            }
                        }, { name: "CardSection" });
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
                    let componentCall = new CardSection(this, {
                        title: '赛程表', subtitle: '点击「录入」可记录比分或手动调整时间场地',
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create({ space: Space.md });
                                Column.debugLine("entry/src/main/ets/view/ScheduleView.ets(604:9)", "entry");
                                Column.width('100%');
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                If.create();
                                if (this.model.matches.length === 0) {
                                    this.ifElseBranchUpdateFunction(0, () => {
                                        {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                if (isInitialRender) {
                                                    let componentCall = new EmptyHint(this, {
                                                        symbol: '▤',
                                                        title: '还没有赛程',
                                                        hint: this.model.teams.length < 2
                                                            ? '请先在「参赛队伍」中添加至少 2 支队伍。'
                                                            : '点击上方「生成赛程」按钮，系统会按当前规则生成对阵并排期。'
                                                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 606, col: 13 });
                                                    ViewPU.create(componentCall);
                                                    let paramsLambda = () => {
                                                        return {
                                                            symbol: '▤',
                                                            title: '还没有赛程',
                                                            hint: this.model.teams.length < 2
                                                                ? '请先在「参赛队伍」中添加至少 2 支队伍。'
                                                                : '点击上方「生成赛程」按钮，系统会按当前规则生成对阵并排期。'
                                                        };
                                                    };
                                                    componentCall.paramsGenerator_ = paramsLambda;
                                                }
                                                else {
                                                    this.updateStateVarsOfChildByElmtId(elmtId, {
                                                        symbol: '▤',
                                                        title: '还没有赛程',
                                                        hint: this.model.teams.length < 2
                                                            ? '请先在「参赛队伍」中添加至少 2 支队伍。'
                                                            : '点击上方「生成赛程」按钮，系统会按当前规则生成对阵并排期。'
                                                    });
                                                }
                                            }, { name: "EmptyHint" });
                                        }
                                    });
                                }
                                else {
                                    this.ifElseBranchUpdateFunction(1, () => {
                                        this.filterBar.bind(this)();
                                        this.tableHeader.bind(this)();
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            ForEach.create();
                                            const forEachItemGenFunction = (_item, index: number) => {
                                                const m = _item;
                                                this.tableRow.bind(this)(m, index);
                                            };
                                            this.forEachUpdateFunction(elmtId, this.visibleMatches(), forEachItemGenFunction, (m: Match) => m.id, true, false);
                                        }, ForEach);
                                        ForEach.pop();
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            If.create();
                                            if (this.visibleMatches().length === 0) {
                                                this.ifElseBranchUpdateFunction(0, () => {
                                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                        Text.create('当前筛选条件下没有比赛。');
                                                        Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(620:15)", "entry");
                                                        Text.fontSize(FontSize.small);
                                                        Text.fontColor(Palette.textTertiary);
                                                        Text.padding(Space.lg);
                                                    }, Text);
                                                    Text.pop();
                                                });
                                            }
                                            else {
                                                this.ifElseBranchUpdateFunction(1, () => {
                                                });
                                            }
                                        }, If);
                                        If.pop();
                                    });
                                }
                            }, If);
                            If.pop();
                            Column.pop();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 603, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            title: '赛程表',
                            subtitle: '点击「录入」可记录比分或手动调整时间场地',
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create({ space: Space.md });
                                    Column.debugLine("entry/src/main/ets/view/ScheduleView.ets(604:9)", "entry");
                                    Column.width('100%');
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    If.create();
                                    if (this.model.matches.length === 0) {
                                        this.ifElseBranchUpdateFunction(0, () => {
                                            {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    if (isInitialRender) {
                                                        let componentCall = new EmptyHint(this, {
                                                            symbol: '▤',
                                                            title: '还没有赛程',
                                                            hint: this.model.teams.length < 2
                                                                ? '请先在「参赛队伍」中添加至少 2 支队伍。'
                                                                : '点击上方「生成赛程」按钮，系统会按当前规则生成对阵并排期。'
                                                        }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 606, col: 13 });
                                                        ViewPU.create(componentCall);
                                                        let paramsLambda = () => {
                                                            return {
                                                                symbol: '▤',
                                                                title: '还没有赛程',
                                                                hint: this.model.teams.length < 2
                                                                    ? '请先在「参赛队伍」中添加至少 2 支队伍。'
                                                                    : '点击上方「生成赛程」按钮，系统会按当前规则生成对阵并排期。'
                                                            };
                                                        };
                                                        componentCall.paramsGenerator_ = paramsLambda;
                                                    }
                                                    else {
                                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                                            symbol: '▤',
                                                            title: '还没有赛程',
                                                            hint: this.model.teams.length < 2
                                                                ? '请先在「参赛队伍」中添加至少 2 支队伍。'
                                                                : '点击上方「生成赛程」按钮，系统会按当前规则生成对阵并排期。'
                                                        });
                                                    }
                                                }, { name: "EmptyHint" });
                                            }
                                        });
                                    }
                                    else {
                                        this.ifElseBranchUpdateFunction(1, () => {
                                            this.filterBar.bind(this)();
                                            this.tableHeader.bind(this)();
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                ForEach.create();
                                                const forEachItemGenFunction = (_item, index: number) => {
                                                    const m = _item;
                                                    this.tableRow.bind(this)(m, index);
                                                };
                                                this.forEachUpdateFunction(elmtId, this.visibleMatches(), forEachItemGenFunction, (m: Match) => m.id, true, false);
                                            }, ForEach);
                                            ForEach.pop();
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                If.create();
                                                if (this.visibleMatches().length === 0) {
                                                    this.ifElseBranchUpdateFunction(0, () => {
                                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                            Text.create('当前筛选条件下没有比赛。');
                                                            Text.debugLine("entry/src/main/ets/view/ScheduleView.ets(620:15)", "entry");
                                                            Text.fontSize(FontSize.small);
                                                            Text.fontColor(Palette.textTertiary);
                                                            Text.padding(Space.lg);
                                                        }, Text);
                                                        Text.pop();
                                                    });
                                                }
                                                else {
                                                    this.ifElseBranchUpdateFunction(1, () => {
                                                    });
                                                }
                                            }, If);
                                            If.pop();
                                        });
                                    }
                                }, If);
                                If.pop();
                                Column.pop();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        title: '赛程表', subtitle: '点击「录入」可记录比分或手动调整时间场地'
                    });
                }
            }, { name: "CardSection" });
        }
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.selectedId !== '' && this.selectedMatch() !== undefined) {
                this.ifElseBranchUpdateFunction(0, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new CardSection(this, {
                                    title: '场次详情', subtitle: '',
                                    content: () => {
                                        this.editorCard.bind(this)(this.selectedMatch() as Match);
                                    }
                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/ScheduleView.ets", line: 631, col: 9 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        title: '场次详情',
                                        subtitle: '',
                                        content: () => {
                                            this.editorCard.bind(this)(this.selectedMatch() as Match);
                                        }
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    title: '场次详情', subtitle: ''
                                });
                            }
                        }, { name: "CardSection" });
                    }
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
    rerender() {
        this.updateDirtyElements();
    }
}
