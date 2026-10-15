if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface VenueView_Params {
    model?: AppModel;
    day?: number;
}
import type { AppModel } from '../model/AppModel';
import { formatClock } from "@normalized:N&&&entry/src/main/ets/model/Types&";
import type { Match, Venue } from "@normalized:N&&&entry/src/main/ets/model/Types&";
import { matchTitle } from "@normalized:N&&&entry/src/main/ets/model/Scheduler&";
import { FontSize, Palette, Radius, Space, ToneKind } from "@normalized:N&&&entry/src/main/ets/common/Theme&";
import { CardSection, EmptyHint, Pill } from "@normalized:N&&&entry/src/main/ets/common/Widgets&";
export class VenueView extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__model = new SynchedPropertyNesedObjectPU(params.model, this, "model");
        this.__day = new ObservedPropertySimplePU(0, this, "day");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: VenueView_Params) {
        this.__model.set(params.model);
        if (params.day !== undefined) {
            this.day = params.day;
        }
    }
    updateStateVars(params: VenueView_Params) {
        this.__model.set(params.model);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__model.purgeDependencyOnElmtId(rmElmtId);
        this.__day.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__model.aboutToBeDeleted();
        this.__day.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __model: SynchedPropertyNesedObjectPU<AppModel>;
    get model() {
        return this.__model.get();
    }
    private __day: ObservedPropertySimplePU<number>;
    get day() {
        return this.__day.get();
    }
    set day(newValue: number) {
        this.__day.set(newValue);
    }
    private step(): number {
        return Math.max(10, this.model.config.matchMinutes + this.model.config.breakMinutes);
    }
    private slotsOfDay(): number[] {
        const out: number[] = [];
        const step: number = this.step();
        for (let t = this.model.config.dailyStart; t + this.model.config.matchMinutes <= this.model.config.dailyEnd; t += step) {
            out.push(t);
        }
        return out;
    }
    private matchAt(venueId: string, start: number): Match | undefined {
        for (let i = 0; i < this.model.matches.length; i++) {
            const m: Match = this.model.matches[i];
            if (m.dayIndex === this.day && m.venueId === venueId && m.startMinutes === start) {
                return m;
            }
        }
        return undefined;
    }
    private countOnDay(venueId: string): number {
        let n: number = 0;
        for (let i = 0; i < this.model.matches.length; i++) {
            const m: Match = this.model.matches[i];
            if (m.dayIndex === this.day && m.venueId === venueId) {
                n += 1;
            }
        }
        return n;
    }
    private usedDays(): number[] {
        const days: number[] = [];
        for (let d = 0; d < Math.max(1, this.model.config.days); d++) {
            let used: boolean = false;
            for (let i = 0; i < this.model.matches.length; i++) {
                if (this.model.matches[i].dayIndex === d) {
                    used = true;
                    break;
                }
            }
            if (used) {
                days.push(d);
            }
        }
        if (days.length === 0) {
            days.push(0);
        }
        return days;
    }
    private dateOfDay(d: number): string {
        const parts: string[] = this.model.config.startDate.split('-');
        if (parts.length !== 3) {
            return '';
        }
        const base: Date = new Date(Number.parseInt(parts[0], 10), Number.parseInt(parts[1], 10) - 1, Number.parseInt(parts[2], 10));
        base.setDate(base.getDate() + d);
        const mm: string = base.getMonth() + 1 < 10 ? `0${base.getMonth() + 1}` : `${base.getMonth() + 1}`;
        const dd: string = base.getDate() < 10 ? `0${base.getDate()}` : `${base.getDate()}`;
        const names: string[] = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return `${mm}-${dd} ${names[base.getDay()]}`;
    }
    dayPicker(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: Space.sm });
            Row.debugLine("entry/src/main/ets/view/VenueView.ets(91:5)", "entry");
            Row.width('100%');
            Row.alignItems(VerticalAlign.Center);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('比赛日');
            Text.debugLine("entry/src/main/ets/view/VenueView.ets(92:7)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const d = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create({ space: 2 });
                    Column.debugLine("entry/src/main/ets/view/VenueView.ets(94:9)", "entry");
                    Column.padding({ left: Space.md, right: Space.md, top: 6, bottom: 6 });
                    Column.backgroundColor(this.day === d ? Palette.brand : Palette.inputBg);
                    Column.borderRadius(Radius.md);
                    Column.focusable(true);
                    Column.hoverEffect(HoverEffect.Highlight);
                    Column.onClick(() => {
                        this.day = d;
                    });
                }, Column);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(`第 ${d + 1} 天`);
                    Text.debugLine("entry/src/main/ets/view/VenueView.ets(95:11)", "entry");
                    Text.fontSize(FontSize.small);
                    Text.fontColor(this.day === d ? Palette.textOnBrand : Palette.textSecondary);
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(this.dateOfDay(d));
                    Text.debugLine("entry/src/main/ets/view/VenueView.ets(98:11)", "entry");
                    Text.fontSize(FontSize.caption);
                    Text.fontColor(this.day === d ? Palette.textOnBrand : Palette.textTertiary);
                }, Text);
                Text.pop();
                Column.pop();
            };
            this.forEachUpdateFunction(elmtId, this.usedDays(), forEachItemGenFunction, (d: number) => `${d}`, false, false);
        }, ForEach);
        ForEach.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/view/VenueView.ets(111:7)", "entry");
        }, Blank);
        Blank.pop();
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new Pill(this, {
                        text: `每日 ${formatClock(this.model.config.dailyStart)} – ${formatClock(this.model.config.dailyEnd)}`,
                        tone: ToneKind.Neutral
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/VenueView.ets", line: 112, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            text: `每日 ${formatClock(this.model.config.dailyStart)} – ${formatClock(this.model.config.dailyEnd)}`,
                            tone: ToneKind.Neutral
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        text: `每日 ${formatClock(this.model.config.dailyStart)} – ${formatClock(this.model.config.dailyEnd)}`,
                        tone: ToneKind.Neutral
                    });
                }
            }, { name: "Pill" });
        }
        Row.pop();
    }
    venueRow(v: Venue, slots: number[], parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/view/VenueView.ets(123:5)", "entry");
            Row.width('100%');
            Row.alignItems(VerticalAlign.Top);
            Row.padding({ top: Space.sm, bottom: Space.sm });
            Row.border({ width: { bottom: 1 }, color: { bottom: Palette.divider } });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: Space.xs });
            Column.debugLine("entry/src/main/ets/view/VenueView.ets(124:7)", "entry");
            Column.width(160);
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(v.name);
            Text.debugLine("entry/src/main/ets/view/VenueView.ets(125:9)", "entry");
            Text.fontSize(FontSize.body);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(Palette.textPrimary);
            Text.maxLines(2);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${this.countOnDay(v.id)} 场`);
            Text.debugLine("entry/src/main/ets/view/VenueView.ets(130:9)", "entry");
            Text.fontSize(FontSize.caption);
            Text.fontColor(Palette.textTertiary);
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/view/VenueView.ets(137:7)", "entry");
            Scroll.scrollable(ScrollDirection.Horizontal);
            Scroll.scrollBar(BarState.Auto);
            Scroll.layoutWeight(1);
            Scroll.align(Alignment.Start);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: Space.sm });
            Row.debugLine("entry/src/main/ets/view/VenueView.ets(138:9)", "entry");
            Row.padding({ right: Space.sm });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const t = _item;
                this.slotCell.bind(this)(v, t);
            };
            this.forEachUpdateFunction(elmtId, slots, forEachItemGenFunction, (t: number) => `${v.id}_${t}`, false, false);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        Scroll.pop();
        Row.pop();
    }
    slotCell(v: Venue, t: number, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 4 });
            Column.debugLine("entry/src/main/ets/view/VenueView.ets(158:5)", "entry");
            Column.width(168);
            Column.height(96);
            Column.padding(Space.sm);
            Column.alignItems(HorizontalAlign.Start);
            Column.backgroundColor(this.matchAt(v.id, t) !== undefined
                ? ((this.matchAt(v.id, t) as Match).played ? Palette.okSoft : Palette.brandSoft)
                : Palette.inputBg);
            Column.borderRadius(Radius.md);
            Column.border({
                width: 1,
                color: this.matchAt(v.id, t) !== undefined ? Palette.divider : Color.Transparent
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${formatClock(t)}–${formatClock(t + this.model.config.matchMinutes)}`);
            Text.debugLine("entry/src/main/ets/view/VenueView.ets(159:7)", "entry");
            Text.fontSize(FontSize.caption);
            Text.fontColor(Palette.textTertiary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.matchAt(v.id, t) !== undefined) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(matchTitle(this.matchAt(v.id, t) as Match, this.model.teams));
                        Text.debugLine("entry/src/main/ets/view/VenueView.ets(164:9)", "entry");
                        Text.fontSize(FontSize.small);
                        Text.fontColor(Palette.textPrimary);
                        Text.maxLines(2);
                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                        Text.textAlign(TextAlign.Start);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if ((this.matchAt(v.id, t) as Match).played) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(`${(this.matchAt(v.id, t) as Match).homeScore} : ${(this.matchAt(v.id, t) as Match).awayScore}`);
                                    Text.debugLine("entry/src/main/ets/view/VenueView.ets(171:11)", "entry");
                                    Text.fontSize(FontSize.small);
                                    Text.fontWeight(FontWeight.Bold);
                                    Text.fontColor(Palette.ok);
                                }, Text);
                                Text.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create((this.matchAt(v.id, t) as Match).roundLabel);
                                    Text.debugLine("entry/src/main/ets/view/VenueView.ets(176:11)", "entry");
                                    Text.fontSize(FontSize.caption);
                                    Text.fontColor(Palette.brand);
                                }, Text);
                                Text.pop();
                            });
                        }
                    }, If);
                    If.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('空闲');
                        Text.debugLine("entry/src/main/ets/view/VenueView.ets(181:9)", "entry");
                        Text.fontSize(FontSize.small);
                        Text.fontColor(Palette.textTertiary);
                    }, Text);
                    Text.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: Space.lg });
            Column.debugLine("entry/src/main/ets/view/VenueView.ets(201:5)", "entry");
            Column.width('100%');
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new CardSection(this, {
                        title: '场地视图', subtitle: '按场地与时段对照，快速发现空档与重复占用',
                        content: () => {
                            this.dayPicker.bind(this)();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/VenueView.ets", line: 202, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            title: '场地视图',
                            subtitle: '按场地与时段对照，快速发现空档与重复占用',
                            content: () => {
                                this.dayPicker.bind(this)();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        title: '场地视图', subtitle: '按场地与时段对照，快速发现空档与重复占用'
                    });
                }
            }, { name: "CardSection" });
        }
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.model.matches.length === 0 || this.model.config.venues.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new CardSection(this, {
                                    title: '暂无数据', subtitle: '',
                                    content: () => {
                                        {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                if (isInitialRender) {
                                                    let componentCall = new EmptyHint(this, {
                                                        symbol: '▦',
                                                        title: this.model.config.venues.length === 0 ? '还没有场地' : '还没有赛程',
                                                        hint: this.model.config.venues.length === 0
                                                            ? '请先到「赛事配置」添加比赛场地。'
                                                            : '请先到「赛程编排」生成赛程。'
                                                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/VenueView.ets", line: 208, col: 11 });
                                                    ViewPU.create(componentCall);
                                                    let paramsLambda = () => {
                                                        return {
                                                            symbol: '▦',
                                                            title: this.model.config.venues.length === 0 ? '还没有场地' : '还没有赛程',
                                                            hint: this.model.config.venues.length === 0
                                                                ? '请先到「赛事配置」添加比赛场地。'
                                                                : '请先到「赛程编排」生成赛程。'
                                                        };
                                                    };
                                                    componentCall.paramsGenerator_ = paramsLambda;
                                                }
                                                else {
                                                    this.updateStateVarsOfChildByElmtId(elmtId, {
                                                        symbol: '▦',
                                                        title: this.model.config.venues.length === 0 ? '还没有场地' : '还没有赛程',
                                                        hint: this.model.config.venues.length === 0
                                                            ? '请先到「赛事配置」添加比赛场地。'
                                                            : '请先到「赛程编排」生成赛程。'
                                                    });
                                                }
                                            }, { name: "EmptyHint" });
                                        }
                                    }
                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/VenueView.ets", line: 207, col: 9 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        title: '暂无数据',
                                        subtitle: '',
                                        content: () => {
                                            {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    if (isInitialRender) {
                                                        let componentCall = new EmptyHint(this, {
                                                            symbol: '▦',
                                                            title: this.model.config.venues.length === 0 ? '还没有场地' : '还没有赛程',
                                                            hint: this.model.config.venues.length === 0
                                                                ? '请先到「赛事配置」添加比赛场地。'
                                                                : '请先到「赛程编排」生成赛程。'
                                                        }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/VenueView.ets", line: 208, col: 11 });
                                                        ViewPU.create(componentCall);
                                                        let paramsLambda = () => {
                                                            return {
                                                                symbol: '▦',
                                                                title: this.model.config.venues.length === 0 ? '还没有场地' : '还没有赛程',
                                                                hint: this.model.config.venues.length === 0
                                                                    ? '请先到「赛事配置」添加比赛场地。'
                                                                    : '请先到「赛程编排」生成赛程。'
                                                            };
                                                        };
                                                        componentCall.paramsGenerator_ = paramsLambda;
                                                    }
                                                    else {
                                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                                            symbol: '▦',
                                                            title: this.model.config.venues.length === 0 ? '还没有场地' : '还没有赛程',
                                                            hint: this.model.config.venues.length === 0
                                                                ? '请先到「赛事配置」添加比赛场地。'
                                                                : '请先到「赛程编排」生成赛程。'
                                                        });
                                                    }
                                                }, { name: "EmptyHint" });
                                            }
                                        }
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    title: '暂无数据', subtitle: ''
                                });
                            }
                        }, { name: "CardSection" });
                    }
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new CardSection(this, {
                                    title: `第 ${this.day + 1} 比赛日（${this.dateOfDay(this.day)}）`,
                                    subtitle: `共 ${this.slotsOfDay().length} 个时段 × ${this.model.config.venues.length} 块场地`,
                                    content: () => {
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Column.create();
                                            Column.debugLine("entry/src/main/ets/view/VenueView.ets(221:11)", "entry");
                                            Column.width('100%');
                                        }, Column);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            ForEach.create();
                                            const forEachItemGenFunction = _item => {
                                                const v = _item;
                                                this.venueRow.bind(this)(v, this.slotsOfDay());
                                            };
                                            this.forEachUpdateFunction(elmtId, this.model.config.venues, forEachItemGenFunction, (v: Venue) => v.id, false, false);
                                        }, ForEach);
                                        ForEach.pop();
                                        Column.pop();
                                    }
                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/VenueView.ets", line: 217, col: 9 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        title: `第 ${this.day + 1} 比赛日（${this.dateOfDay(this.day)}）`,
                                        subtitle: `共 ${this.slotsOfDay().length} 个时段 × ${this.model.config.venues.length} 块场地`,
                                        content: () => {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Column.create();
                                                Column.debugLine("entry/src/main/ets/view/VenueView.ets(221:11)", "entry");
                                                Column.width('100%');
                                            }, Column);
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                ForEach.create();
                                                const forEachItemGenFunction = _item => {
                                                    const v = _item;
                                                    this.venueRow.bind(this)(v, this.slotsOfDay());
                                                };
                                                this.forEachUpdateFunction(elmtId, this.model.config.venues, forEachItemGenFunction, (v: Venue) => v.id, false, false);
                                            }, ForEach);
                                            ForEach.pop();
                                            Column.pop();
                                        }
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    title: `第 ${this.day + 1} 比赛日（${this.dateOfDay(this.day)}）`,
                                    subtitle: `共 ${this.slotsOfDay().length} 个时段 × ${this.model.config.venues.length} 块场地`
                                });
                            }
                        }, { name: "CardSection" });
                    }
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new CardSection(this, {
                                    title: '图例', subtitle: '',
                                    content: () => {
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Row.create({ space: Space.lg });
                                            Row.debugLine("entry/src/main/ets/view/VenueView.ets(230:11)", "entry");
                                            Row.width('100%');
                                        }, Row);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Row.create({ space: Space.sm });
                                            Row.debugLine("entry/src/main/ets/view/VenueView.ets(231:13)", "entry");
                                        }, Row);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Row.create();
                                            Row.debugLine("entry/src/main/ets/view/VenueView.ets(232:15)", "entry");
                                            Row.width(16);
                                            Row.height(16);
                                            Row.backgroundColor(Palette.brandSoft);
                                            Row.borderRadius(4);
                                        }, Row);
                                        Row.pop();
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create('待比赛');
                                            Text.debugLine("entry/src/main/ets/view/VenueView.ets(233:15)", "entry");
                                            Text.fontSize(FontSize.small);
                                            Text.fontColor(Palette.textSecondary);
                                        }, Text);
                                        Text.pop();
                                        Row.pop();
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Row.create({ space: Space.sm });
                                            Row.debugLine("entry/src/main/ets/view/VenueView.ets(235:13)", "entry");
                                        }, Row);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Row.create();
                                            Row.debugLine("entry/src/main/ets/view/VenueView.ets(236:15)", "entry");
                                            Row.width(16);
                                            Row.height(16);
                                            Row.backgroundColor(Palette.okSoft);
                                            Row.borderRadius(4);
                                        }, Row);
                                        Row.pop();
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create('已完赛');
                                            Text.debugLine("entry/src/main/ets/view/VenueView.ets(237:15)", "entry");
                                            Text.fontSize(FontSize.small);
                                            Text.fontColor(Palette.textSecondary);
                                        }, Text);
                                        Text.pop();
                                        Row.pop();
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Row.create({ space: Space.sm });
                                            Row.debugLine("entry/src/main/ets/view/VenueView.ets(239:13)", "entry");
                                        }, Row);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Row.create();
                                            Row.debugLine("entry/src/main/ets/view/VenueView.ets(240:15)", "entry");
                                            Row.width(16);
                                            Row.height(16);
                                            Row.backgroundColor(Palette.inputBg);
                                            Row.borderRadius(4);
                                        }, Row);
                                        Row.pop();
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create('空闲');
                                            Text.debugLine("entry/src/main/ets/view/VenueView.ets(241:15)", "entry");
                                            Text.fontSize(FontSize.small);
                                            Text.fontColor(Palette.textSecondary);
                                        }, Text);
                                        Text.pop();
                                        Row.pop();
                                        Row.pop();
                                    }
                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/VenueView.ets", line: 229, col: 9 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        title: '图例',
                                        subtitle: '',
                                        content: () => {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Row.create({ space: Space.lg });
                                                Row.debugLine("entry/src/main/ets/view/VenueView.ets(230:11)", "entry");
                                                Row.width('100%');
                                            }, Row);
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Row.create({ space: Space.sm });
                                                Row.debugLine("entry/src/main/ets/view/VenueView.ets(231:13)", "entry");
                                            }, Row);
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Row.create();
                                                Row.debugLine("entry/src/main/ets/view/VenueView.ets(232:15)", "entry");
                                                Row.width(16);
                                                Row.height(16);
                                                Row.backgroundColor(Palette.brandSoft);
                                                Row.borderRadius(4);
                                            }, Row);
                                            Row.pop();
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Text.create('待比赛');
                                                Text.debugLine("entry/src/main/ets/view/VenueView.ets(233:15)", "entry");
                                                Text.fontSize(FontSize.small);
                                                Text.fontColor(Palette.textSecondary);
                                            }, Text);
                                            Text.pop();
                                            Row.pop();
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Row.create({ space: Space.sm });
                                                Row.debugLine("entry/src/main/ets/view/VenueView.ets(235:13)", "entry");
                                            }, Row);
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Row.create();
                                                Row.debugLine("entry/src/main/ets/view/VenueView.ets(236:15)", "entry");
                                                Row.width(16);
                                                Row.height(16);
                                                Row.backgroundColor(Palette.okSoft);
                                                Row.borderRadius(4);
                                            }, Row);
                                            Row.pop();
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Text.create('已完赛');
                                                Text.debugLine("entry/src/main/ets/view/VenueView.ets(237:15)", "entry");
                                                Text.fontSize(FontSize.small);
                                                Text.fontColor(Palette.textSecondary);
                                            }, Text);
                                            Text.pop();
                                            Row.pop();
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Row.create({ space: Space.sm });
                                                Row.debugLine("entry/src/main/ets/view/VenueView.ets(239:13)", "entry");
                                            }, Row);
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Row.create();
                                                Row.debugLine("entry/src/main/ets/view/VenueView.ets(240:15)", "entry");
                                                Row.width(16);
                                                Row.height(16);
                                                Row.backgroundColor(Palette.inputBg);
                                                Row.borderRadius(4);
                                            }, Row);
                                            Row.pop();
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Text.create('空闲');
                                                Text.debugLine("entry/src/main/ets/view/VenueView.ets(241:15)", "entry");
                                                Text.fontSize(FontSize.small);
                                                Text.fontColor(Palette.textSecondary);
                                            }, Text);
                                            Text.pop();
                                            Row.pop();
                                            Row.pop();
                                        }
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    title: '图例', subtitle: ''
                                });
                            }
                        }, { name: "CardSection" });
                    }
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
