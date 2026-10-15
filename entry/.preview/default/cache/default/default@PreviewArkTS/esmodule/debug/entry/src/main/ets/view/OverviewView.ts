if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface OverviewView_Params {
    model?: AppModel;
    goSchedule?: () => void;
    goSetup?: () => void;
}
import type { AppModel } from '../model/AppModel';
import { ConflictLevel, MatchFormat, addDays, formatLabel, sportLabel, weekdayLabel } from "@normalized:N&&&entry/src/main/ets/model/Types&";
import type { Conflict } from "@normalized:N&&&entry/src/main/ets/model/Types&";
import { computeStandings, detectConflicts, matchTitle, summarize, teamName, venueNameOf } from "@normalized:N&&&entry/src/main/ets/model/Scheduler&";
import type { Standing, TournamentSummary } from "@normalized:N&&&entry/src/main/ets/model/Scheduler&";
import { FontSize, Palette, Radius, Space, ToneKind } from "@normalized:N&&&entry/src/main/ets/common/Theme&";
import { AppButton, BtnKind, CardSection, EmptyHint, Pill, StatTile } from "@normalized:N&&&entry/src/main/ets/common/Widgets&";
/** 总览页一次渲染所需的全部派生数据 */
interface OverviewData {
    conflicts: Conflict[];
    summary: TournamentSummary;
    errorCount: number;
    upcoming: string[];
    standings: Standing[];
}
export class OverviewView extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__model = new SynchedPropertyNesedObjectPU(params.model, this, "model");
        this.goSchedule = () => {
        };
        this.goSetup = () => {
        };
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: OverviewView_Params) {
        this.__model.set(params.model);
        if (params.goSchedule !== undefined) {
            this.goSchedule = params.goSchedule;
        }
        if (params.goSetup !== undefined) {
            this.goSetup = params.goSetup;
        }
    }
    updateStateVars(params: OverviewView_Params) {
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
    private goSchedule: () => void;
    private goSetup: () => void;
    private clockText(minutes: number): string {
        const h: number = Math.floor(minutes / 60);
        const m: number = minutes % 60;
        const hh: string = h < 10 ? `0${h}` : `${h}`;
        const mm: string = m < 10 ? `0${m}` : `${m}`;
        return `${hh}:${mm}`;
    }
    private dateRangeText(): string {
        const start: string = this.model.config.startDate;
        const end: string = addDays(start, Math.max(0, this.model.config.days - 1));
        return `${start}（${weekdayLabel(start)}）至 ${end}（${weekdayLabel(end)}）`;
    }
    private hasStandings(): boolean {
        const fmt: MatchFormat = this.model.config.format;
        return fmt === MatchFormat.RoundRobin
            || fmt === MatchFormat.DoubleRoundRobin
            || fmt === MatchFormat.GroupKnockout;
    }
    private nextMatches(): string[] {
        const out: string[] = [];
        for (let i = 0; i < this.model.matches.length && out.length < 5; i++) {
            const m = this.model.matches[i];
            if (m.played || m.dayIndex < 0 || m.startMinutes < 0) {
                continue;
            }
            const day: string = `第 ${m.dayIndex + 1} 天 ${this.clockText(m.startMinutes)}`;
            const venue: string = venueNameOf(this.model.config.venues, m.venueId);
            out.push(`${day} · ${venue} · ${matchTitle(m, this.model.teams)}`);
        }
        return out;
    }
    /* ------------------------------------------------------------------ */
    hero(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/OverviewView.ets(84:5)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.model.config.name === '' ? '未命名赛事' : this.model.config.name);
            Text.debugLine("entry/src/main/ets/view/OverviewView.ets(85:7)", "entry");
            Text.fontSize(FontSize.headline);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Palette.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: Space.sm });
            Row.debugLine("entry/src/main/ets/view/OverviewView.ets(90:7)", "entry");
            Row.margin({ top: Space.md });
        }, Row);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new Pill(this, { text: sportLabel(this.model.config.sport), tone: ToneKind.Brand }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/OverviewView.ets", line: 91, col: 9 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            text: sportLabel(this.model.config.sport),
                            tone: ToneKind.Brand
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        text: sportLabel(this.model.config.sport), tone: ToneKind.Brand
                    });
                }
            }, { name: "Pill" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new Pill(this, { text: formatLabel(this.model.config.format), tone: ToneKind.Neutral }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/OverviewView.ets", line: 92, col: 9 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            text: formatLabel(this.model.config.format),
                            tone: ToneKind.Neutral
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        text: formatLabel(this.model.config.format), tone: ToneKind.Neutral
                    });
                }
            }, { name: "Pill" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new Pill(this, { text: `${this.model.teams.length} 支队伍`, tone: ToneKind.Neutral }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/OverviewView.ets", line: 93, col: 9 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            text: `${this.model.teams.length} 支队伍`,
                            tone: ToneKind.Neutral
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        text: `${this.model.teams.length} 支队伍`, tone: ToneKind.Neutral
                    });
                }
            }, { name: "Pill" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new Pill(this, { text: `${this.model.config.days} 天赛期`, tone: ToneKind.Neutral }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/OverviewView.ets", line: 94, col: 9 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            text: `${this.model.config.days} 天赛期`,
                            tone: ToneKind.Neutral
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        text: `${this.model.config.days} 天赛期`, tone: ToneKind.Neutral
                    });
                }
            }, { name: "Pill" });
        }
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.dateRangeText());
            Text.debugLine("entry/src/main/ets/view/OverviewView.ets(98:7)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textSecondary);
            Text.margin({ top: Space.md });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/view/OverviewView.ets(103:7)", "entry");
            Row.margin({ top: 2 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`每日 ${this.clockText(this.model.config.dailyStart)} – ${this.clockText(this.model.config.dailyEnd)}`);
            Text.debugLine("entry/src/main/ets/view/OverviewView.ets(104:9)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textSecondary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('·');
            Text.debugLine("entry/src/main/ets/view/OverviewView.ets(107:9)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.margin({ left: Space.sm, right: Space.sm });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`单场 ${this.model.config.matchMinutes} 分钟`);
            Text.debugLine("entry/src/main/ets/view/OverviewView.ets(109:9)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textSecondary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('·');
            Text.debugLine("entry/src/main/ets/view/OverviewView.ets(112:9)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.margin({ left: Space.sm, right: Space.sm });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${this.model.config.venues.length} 块场地`);
            Text.debugLine("entry/src/main/ets/view/OverviewView.ets(114:9)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textSecondary);
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
    }
    stats(summary: TournamentSummary, errors: number, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: Space.md });
            Row.debugLine("entry/src/main/ets/view/OverviewView.ets(126:5)", "entry");
            Row.width('100%');
            Row.alignItems(VerticalAlign.Top);
            Row.height(136);
        }, Row);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new StatTile(this, {
                        label: '参赛队伍',
                        value: `${this.model.teams.length}`,
                        unit: '支',
                        hint: '在「参赛队伍」中维护',
                        tone: ToneKind.Neutral
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/OverviewView.ets", line: 127, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '参赛队伍',
                            value: `${this.model.teams.length}`,
                            unit: '支',
                            hint: '在「参赛队伍」中维护',
                            tone: ToneKind.Neutral
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '参赛队伍',
                        value: `${this.model.teams.length}`,
                        unit: '支',
                        hint: '在「参赛队伍」中维护',
                        tone: ToneKind.Neutral
                    });
                }
            }, { name: "StatTile" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new StatTile(this, {
                        label: '总场次',
                        value: `${summary.matchTotal}`,
                        unit: '场',
                        hint: summary.matchTotal === 0 ? '尚未生成赛程' : '已生成对阵',
                        tone: ToneKind.Neutral
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/OverviewView.ets", line: 134, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '总场次',
                            value: `${summary.matchTotal}`,
                            unit: '场',
                            hint: summary.matchTotal === 0 ? '尚未生成赛程' : '已生成对阵',
                            tone: ToneKind.Neutral
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '总场次',
                        value: `${summary.matchTotal}`,
                        unit: '场',
                        hint: summary.matchTotal === 0 ? '尚未生成赛程' : '已生成对阵',
                        tone: ToneKind.Neutral
                    });
                }
            }, { name: "StatTile" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new StatTile(this, {
                        label: '已排期',
                        value: `${summary.matchScheduled}`,
                        unit: '场',
                        hint: summary.matchTotal === 0
                            ? '—'
                            : `完成度 ${Math.round(summary.matchScheduled * 100 / summary.matchTotal)}%`,
                        tone: summary.matchTotal > 0 && summary.matchScheduled === summary.matchTotal
                            ? ToneKind.Ok : ToneKind.Warn
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/OverviewView.ets", line: 141, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '已排期',
                            value: `${summary.matchScheduled}`,
                            unit: '场',
                            hint: summary.matchTotal === 0
                                ? '—'
                                : `完成度 ${Math.round(summary.matchScheduled * 100 / summary.matchTotal)}%`,
                            tone: summary.matchTotal > 0 && summary.matchScheduled === summary.matchTotal
                                ? ToneKind.Ok : ToneKind.Warn
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '已排期',
                        value: `${summary.matchScheduled}`,
                        unit: '场',
                        hint: summary.matchTotal === 0
                            ? '—'
                            : `完成度 ${Math.round(summary.matchScheduled * 100 / summary.matchTotal)}%`,
                        tone: summary.matchTotal > 0 && summary.matchScheduled === summary.matchTotal
                            ? ToneKind.Ok : ToneKind.Warn
                    });
                }
            }, { name: "StatTile" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new StatTile(this, {
                        label: '已完赛',
                        value: `${summary.matchPlayed}`,
                        unit: '场',
                        hint: `使用 ${summary.daysUsed} 个比赛日`,
                        tone: ToneKind.Brand
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/OverviewView.ets", line: 151, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '已完赛',
                            value: `${summary.matchPlayed}`,
                            unit: '场',
                            hint: `使用 ${summary.daysUsed} 个比赛日`,
                            tone: ToneKind.Brand
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '已完赛',
                        value: `${summary.matchPlayed}`,
                        unit: '场',
                        hint: `使用 ${summary.daysUsed} 个比赛日`,
                        tone: ToneKind.Brand
                    });
                }
            }, { name: "StatTile" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new StatTile(this, {
                        label: '冲突',
                        value: `${errors}`,
                        unit: '项',
                        hint: summary.warningCount > 0 ? `另有 ${summary.warningCount} 条提醒` : '无待处理提醒',
                        tone: errors > 0 ? ToneKind.Danger : (summary.warningCount > 0 ? ToneKind.Warn : ToneKind.Ok)
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/OverviewView.ets", line: 158, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '冲突',
                            value: `${errors}`,
                            unit: '项',
                            hint: summary.warningCount > 0 ? `另有 ${summary.warningCount} 条提醒` : '无待处理提醒',
                            tone: errors > 0 ? ToneKind.Danger : (summary.warningCount > 0 ? ToneKind.Warn : ToneKind.Ok)
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '冲突',
                        value: `${errors}`,
                        unit: '项',
                        hint: summary.warningCount > 0 ? `另有 ${summary.warningCount} 条提醒` : '无待处理提醒',
                        tone: errors > 0 ? ToneKind.Danger : (summary.warningCount > 0 ? ToneKind.Warn : ToneKind.Ok)
                    });
                }
            }, { name: "StatTile" });
        }
        Row.pop();
    }
    conflictList(list: Conflict[], parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (list.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/OverviewView.ets(174:7)", "entry");
                        Row.width('100%');
                        Row.alignItems(VerticalAlign.Center);
                        Row.padding({ top: Space.sm, bottom: Space.sm });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('✓');
                        Text.debugLine("entry/src/main/ets/view/OverviewView.ets(175:9)", "entry");
                        Text.fontSize(FontSize.subhead);
                        Text.fontColor(Palette.ok);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.model.matches.length === 0 ? '尚未生成赛程，暂无冲突。' : '未检测到冲突，赛程可以直接执行。');
                        Text.debugLine("entry/src/main/ets/view/OverviewView.ets(176:9)", "entry");
                        Text.fontSize(FontSize.body);
                        Text.fontColor(Palette.textSecondary);
                        Text.margin({ left: Space.sm });
                    }, Text);
                    Text.pop();
                    Row.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/OverviewView.ets(185:7)", "entry");
                        Column.width('100%');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = (_item, index: number) => {
                            const item = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create();
                                Row.debugLine("entry/src/main/ets/view/OverviewView.ets(187:11)", "entry");
                                Row.width('100%');
                                Row.alignItems(VerticalAlign.Top);
                                Row.padding({ top: Space.sm, bottom: Space.sm });
                                Row.border(index < Math.min(list.length, 6) - 1
                                    ? { width: { bottom: 1 }, color: { bottom: Palette.divider } }
                                    : { width: 0 });
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(item.level === ConflictLevel.Error ? '!' : '△');
                                Text.debugLine("entry/src/main/ets/view/OverviewView.ets(188:13)", "entry");
                                Text.fontSize(FontSize.body);
                                Text.fontColor(item.level === ConflictLevel.Error ? Palette.danger : Palette.warn);
                                Text.width(20);
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(item.message);
                                Text.debugLine("entry/src/main/ets/view/OverviewView.ets(192:13)", "entry");
                                Text.fontSize(FontSize.small);
                                Text.fontColor(Palette.textSecondary);
                                Text.layoutWeight(1);
                            }, Text);
                            Text.pop();
                            Row.pop();
                        };
                        this.forEachUpdateFunction(elmtId, list.slice(0, 6), forEachItemGenFunction, (item: Conflict, index: number) => `${index}_${item.message}`, true, true);
                    }, ForEach);
                    ForEach.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (list.length > 6) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(`还有 ${list.length - 6} 条未显示，请到「赛程编排」查看全部。`);
                                    Text.debugLine("entry/src/main/ets/view/OverviewView.ets(206:11)", "entry");
                                    Text.fontSize(FontSize.caption);
                                    Text.fontColor(Palette.textTertiary);
                                    Text.margin({ top: Space.sm });
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
                    Column.pop();
                });
            }
        }, If);
        If.pop();
    }
    standingsCard(standings: Standing[], parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/OverviewView.ets(218:5)", "entry");
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/view/OverviewView.ets(219:7)", "entry");
            Row.width('100%');
            Row.padding({ bottom: Space.sm });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('排名');
            Text.debugLine("entry/src/main/ets/view/OverviewView.ets(220:9)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.width(48);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('队伍');
            Text.debugLine("entry/src/main/ets/view/OverviewView.ets(221:9)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('赛');
            Text.debugLine("entry/src/main/ets/view/OverviewView.ets(222:9)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.width(40);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('胜');
            Text.debugLine("entry/src/main/ets/view/OverviewView.ets(223:9)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.width(40);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('平');
            Text.debugLine("entry/src/main/ets/view/OverviewView.ets(224:9)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.width(40);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('负');
            Text.debugLine("entry/src/main/ets/view/OverviewView.ets(225:9)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.width(40);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('净胜');
            Text.debugLine("entry/src/main/ets/view/OverviewView.ets(226:9)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.width(56);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('积分');
            Text.debugLine("entry/src/main/ets/view/OverviewView.ets(227:9)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.width(56);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = (_item, index: number) => {
                const row = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Row.create();
                    Row.debugLine("entry/src/main/ets/view/OverviewView.ets(233:9)", "entry");
                    Row.width('100%');
                    Row.height(40);
                    Row.alignItems(VerticalAlign.Center);
                    Row.backgroundColor(index % 2 === 0 ? Palette.brandSofter : Color.Transparent);
                    Row.borderRadius(Radius.sm);
                }, Row);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(`${index + 1}`);
                    Text.debugLine("entry/src/main/ets/view/OverviewView.ets(234:11)", "entry");
                    Text.fontSize(FontSize.small);
                    Text.fontColor(index < 3 ? Palette.brand : Palette.textSecondary);
                    Text.fontWeight(index < 3 ? FontWeight.Bold : FontWeight.Normal);
                    Text.width(48);
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(teamName(this.model.teams, row.teamId));
                    Text.debugLine("entry/src/main/ets/view/OverviewView.ets(239:11)", "entry");
                    Text.fontSize(FontSize.body);
                    Text.fontColor(Palette.textPrimary);
                    Text.layoutWeight(1);
                    Text.maxLines(1);
                    Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(`${row.played}`);
                    Text.debugLine("entry/src/main/ets/view/OverviewView.ets(245:11)", "entry");
                    Text.fontSize(FontSize.body);
                    Text.fontColor(Palette.textSecondary);
                    Text.width(40);
                    Text.textAlign(TextAlign.Center);
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(`${row.won}`);
                    Text.debugLine("entry/src/main/ets/view/OverviewView.ets(247:11)", "entry");
                    Text.fontSize(FontSize.body);
                    Text.fontColor(Palette.ok);
                    Text.width(40);
                    Text.textAlign(TextAlign.Center);
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(`${row.drawn}`);
                    Text.debugLine("entry/src/main/ets/view/OverviewView.ets(249:11)", "entry");
                    Text.fontSize(FontSize.body);
                    Text.fontColor(Palette.textSecondary);
                    Text.width(40);
                    Text.textAlign(TextAlign.Center);
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(`${row.lost}`);
                    Text.debugLine("entry/src/main/ets/view/OverviewView.ets(251:11)", "entry");
                    Text.fontSize(FontSize.body);
                    Text.fontColor(Palette.textSecondary);
                    Text.width(40);
                    Text.textAlign(TextAlign.Center);
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(`${row.scoreFor - row.scoreAgainst}`);
                    Text.debugLine("entry/src/main/ets/view/OverviewView.ets(253:11)", "entry");
                    Text.fontSize(FontSize.body);
                    Text.fontColor(Palette.textSecondary);
                    Text.width(56);
                    Text.textAlign(TextAlign.Center);
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(`${row.points}`);
                    Text.debugLine("entry/src/main/ets/view/OverviewView.ets(256:11)", "entry");
                    Text.fontSize(FontSize.body);
                    Text.fontWeight(FontWeight.Bold);
                    Text.fontColor(Palette.textPrimary);
                    Text.width(56);
                    Text.textAlign(TextAlign.Center);
                }, Text);
                Text.pop();
                Row.pop();
            };
            this.forEachUpdateFunction(elmtId, standings, forEachItemGenFunction, (row: Standing) => row.teamId, true, false);
        }, ForEach);
        ForEach.pop();
        Column.pop();
    }
    upcoming(list: string[], parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/OverviewView.ets(272:5)", "entry");
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (list.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new EmptyHint(this, {
                                    symbol: '▤',
                                    title: this.model.matches.length === 0 ? '还没有赛程' : '全部比赛已完成',
                                    hint: this.model.matches.length === 0
                                        ? '先在「赛事配置」确认规则与场地，再到「赛程编排」一键生成。'
                                        : '可以在「赛程编排」中查看完整结果或导出。'
                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/OverviewView.ets", line: 274, col: 9 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        symbol: '▤',
                                        title: this.model.matches.length === 0 ? '还没有赛程' : '全部比赛已完成',
                                        hint: this.model.matches.length === 0
                                            ? '先在「赛事配置」确认规则与场地，再到「赛程编排」一键生成。'
                                            : '可以在「赛程编排」中查看完整结果或导出。'
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    symbol: '▤',
                                    title: this.model.matches.length === 0 ? '还没有赛程' : '全部比赛已完成',
                                    hint: this.model.matches.length === 0
                                        ? '先在「赛事配置」确认规则与场地，再到「赛程编排」一键生成。'
                                        : '可以在「赛程编排」中查看完整结果或导出。'
                                });
                            }
                        }, { name: "EmptyHint" });
                    }
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = (_item, index: number) => {
                            const line = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create();
                                Row.debugLine("entry/src/main/ets/view/OverviewView.ets(283:11)", "entry");
                                Row.width('100%');
                                Row.padding({ top: Space.sm, bottom: Space.sm });
                                Row.border(index < list.length - 1
                                    ? { width: { bottom: 1 }, color: { bottom: Palette.divider } }
                                    : { width: 0 });
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(line);
                                Text.debugLine("entry/src/main/ets/view/OverviewView.ets(284:13)", "entry");
                                Text.fontSize(FontSize.body);
                                Text.fontColor(Palette.textPrimary);
                                Text.layoutWeight(1);
                                Text.maxLines(1);
                                Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                            }, Text);
                            Text.pop();
                            Row.pop();
                        };
                        this.forEachUpdateFunction(elmtId, list, forEachItemGenFunction, (line: string, index: number) => `${index}_${line}`, true, true);
                    }, ForEach);
                    ForEach.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    /**
     * 每次渲染只计算一次派生数据。
     * detectConflicts 对比赛数是 O(n²)，而 build() 会在每次状态变化时重跑，
     * 因此把结果打包成一个对象，通过单个对象参数传给 @Builder（ArkUI 的按引用传递）。
     */
    private overview(): OverviewData {
        const conflicts: Conflict[] = detectConflicts(this.model.matches, this.model.config, this.model.teams);
        return {
            conflicts: conflicts,
            summary: summarize(this.model.matches, conflicts, this.model.config),
            errorCount: conflicts.filter((c: Conflict) => c.level === ConflictLevel.Error).length,
            upcoming: this.nextMatches(),
            standings: this.hasStandings() ? computeStandings(this.model.matches, this.model.teams) : []
        };
    }
    content(d: OverviewData, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: Space.lg });
            Column.debugLine("entry/src/main/ets/view/OverviewView.ets(320:5)", "entry");
            Column.width('100%');
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.hero.bind(this)();
        this.stats.bind(this)(d.summary, d.errorCount);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: Space.lg });
            Row.debugLine("entry/src/main/ets/view/OverviewView.ets(325:7)", "entry");
            Row.width('100%');
            Row.alignItems(VerticalAlign.Top);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/OverviewView.ets(326:9)", "entry");
            Column.layoutWeight(3);
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new CardSection(this, {
                        title: '冲突与提醒', subtitle: '生成赛程后会自动检查场地、队伍与休息时间',
                        content: () => {
                            this.conflictList.bind(this)(d.conflicts);
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/OverviewView.ets", line: 327, col: 11 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            title: '冲突与提醒',
                            subtitle: '生成赛程后会自动检查场地、队伍与休息时间',
                            content: () => {
                                this.conflictList.bind(this)(d.conflicts);
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        title: '冲突与提醒', subtitle: '生成赛程后会自动检查场地、队伍与休息时间'
                    });
                }
            }, { name: "CardSection" });
        }
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/OverviewView.ets(333:9)", "entry");
            Column.layoutWeight(2);
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new CardSection(this, {
                        title: '快捷操作', subtitle: '常用流程入口',
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create({ space: Space.sm });
                                Column.debugLine("entry/src/main/ets/view/OverviewView.ets(335:13)", "entry");
                                Column.width('100%');
                                Column.alignItems(HorizontalAlign.Start);
                            }, Column);
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new AppButton(this, {
                                            label: '生成 / 重新编排赛程',
                                            kind: BtnKind.Primary,
                                            symbol: '▤',
                                            tabIndexValue: 1,
                                            onTap: () => this.goSchedule()
                                        }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/OverviewView.ets", line: 336, col: 15 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                label: '生成 / 重新编排赛程',
                                                kind: BtnKind.Primary,
                                                symbol: '▤',
                                                tabIndexValue: 1,
                                                onTap: () => this.goSchedule()
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            label: '生成 / 重新编排赛程',
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
                                            label: '调整赛事规则与场地',
                                            kind: BtnKind.Secondary,
                                            symbol: '⚙',
                                            tabIndexValue: 2,
                                            onTap: () => this.goSetup()
                                        }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/OverviewView.ets", line: 343, col: 15 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                label: '调整赛事规则与场地',
                                                kind: BtnKind.Secondary,
                                                symbol: '⚙',
                                                tabIndexValue: 2,
                                                onTap: () => this.goSetup()
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            label: '调整赛事规则与场地',
                                            kind: BtnKind.Secondary,
                                            symbol: '⚙',
                                            tabIndexValue: 2
                                        });
                                    }
                                }, { name: "AppButton" });
                            }
                            Column.pop();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/OverviewView.ets", line: 334, col: 11 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            title: '快捷操作',
                            subtitle: '常用流程入口',
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create({ space: Space.sm });
                                    Column.debugLine("entry/src/main/ets/view/OverviewView.ets(335:13)", "entry");
                                    Column.width('100%');
                                    Column.alignItems(HorizontalAlign.Start);
                                }, Column);
                                {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        if (isInitialRender) {
                                            let componentCall = new AppButton(this, {
                                                label: '生成 / 重新编排赛程',
                                                kind: BtnKind.Primary,
                                                symbol: '▤',
                                                tabIndexValue: 1,
                                                onTap: () => this.goSchedule()
                                            }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/OverviewView.ets", line: 336, col: 15 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    label: '生成 / 重新编排赛程',
                                                    kind: BtnKind.Primary,
                                                    symbol: '▤',
                                                    tabIndexValue: 1,
                                                    onTap: () => this.goSchedule()
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                label: '生成 / 重新编排赛程',
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
                                                label: '调整赛事规则与场地',
                                                kind: BtnKind.Secondary,
                                                symbol: '⚙',
                                                tabIndexValue: 2,
                                                onTap: () => this.goSetup()
                                            }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/OverviewView.ets", line: 343, col: 15 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    label: '调整赛事规则与场地',
                                                    kind: BtnKind.Secondary,
                                                    symbol: '⚙',
                                                    tabIndexValue: 2,
                                                    onTap: () => this.goSetup()
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                label: '调整赛事规则与场地',
                                                kind: BtnKind.Secondary,
                                                symbol: '⚙',
                                                tabIndexValue: 2
                                            });
                                        }
                                    }, { name: "AppButton" });
                                }
                                Column.pop();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        title: '快捷操作', subtitle: '常用流程入口'
                    });
                }
            }, { name: "CardSection" });
        }
        Column.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: Space.lg });
            Row.debugLine("entry/src/main/ets/view/OverviewView.ets(360:7)", "entry");
            Row.width('100%');
            Row.alignItems(VerticalAlign.Top);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/OverviewView.ets(361:9)", "entry");
            Column.layoutWeight(1);
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new CardSection(this, {
                        title: '下一批比赛', subtitle: '按比赛日与开始时间排序',
                        content: () => {
                            this.upcoming.bind(this)(d.upcoming);
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/OverviewView.ets", line: 362, col: 11 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            title: '下一批比赛',
                            subtitle: '按比赛日与开始时间排序',
                            content: () => {
                                this.upcoming.bind(this)(d.upcoming);
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        title: '下一批比赛', subtitle: '按比赛日与开始时间排序'
                    });
                }
            }, { name: "CardSection" });
        }
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.hasStandings()) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/OverviewView.ets(369:11)", "entry");
                        Column.layoutWeight(1);
                    }, Column);
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new CardSection(this, {
                                    title: '积分榜', subtitle: '胜 3 分 · 平 1 分 · 负 0 分',
                                    content: () => {
                                        this.standingsCard.bind(this)(d.standings);
                                    }
                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/OverviewView.ets", line: 370, col: 13 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        title: '积分榜',
                                        subtitle: '胜 3 分 · 平 1 分 · 负 0 分',
                                        content: () => {
                                            this.standingsCard.bind(this)(d.standings);
                                        }
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    title: '积分榜', subtitle: '胜 3 分 · 平 1 分 · 负 0 分'
                                });
                            }
                        }, { name: "CardSection" });
                    }
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
        Column.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/OverviewView.ets(385:5)", "entry");
            Column.width('100%');
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.content.bind(this)(this.overview());
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
