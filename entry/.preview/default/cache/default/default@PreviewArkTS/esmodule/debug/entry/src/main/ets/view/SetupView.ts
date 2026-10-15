if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface SetupView_Params {
    model?: AppModel;
    onChanged?: () => void;
    notify?: (msg: string) => void;
    draftVenue?: string;
    editingVenueId?: string;
    editingVenueName?: string;
    dateDraft?: string;
    startDraft?: string;
    endDraft?: string;
}
import type { AppModel } from '../model/AppModel';
import { MatchFormat, addDays, allFormats, allSports, formatHint, formatLabel, formatClock, parseClock, sportLabel, todayIso, weekdayLabel } from "@normalized:N&&&entry/src/main/ets/model/Types&";
import type { SportKind, Venue } from "@normalized:N&&&entry/src/main/ets/model/Types&";
import { FontSize, Palette, Radius, Space, ToneKind } from "@normalized:N&&&entry/src/main/ets/common/Theme&";
import { AppButton, BtnKind, CardSection, FieldRow, Pill } from "@normalized:N&&&entry/src/main/ets/common/Widgets&";
export class SetupView extends ViewPU {
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
        this.__draftVenue = new ObservedPropertySimplePU('', this, "draftVenue");
        this.__editingVenueId = new ObservedPropertySimplePU('', this, "editingVenueId");
        this.__editingVenueName = new ObservedPropertySimplePU('', this, "editingVenueName");
        this.__dateDraft = new ObservedPropertySimplePU('', this, "dateDraft");
        this.__startDraft = new ObservedPropertySimplePU('', this, "startDraft");
        this.__endDraft = new ObservedPropertySimplePU('', this, "endDraft");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: SetupView_Params) {
        this.__model.set(params.model);
        if (params.onChanged !== undefined) {
            this.onChanged = params.onChanged;
        }
        if (params.notify !== undefined) {
            this.notify = params.notify;
        }
        if (params.draftVenue !== undefined) {
            this.draftVenue = params.draftVenue;
        }
        if (params.editingVenueId !== undefined) {
            this.editingVenueId = params.editingVenueId;
        }
        if (params.editingVenueName !== undefined) {
            this.editingVenueName = params.editingVenueName;
        }
        if (params.dateDraft !== undefined) {
            this.dateDraft = params.dateDraft;
        }
        if (params.startDraft !== undefined) {
            this.startDraft = params.startDraft;
        }
        if (params.endDraft !== undefined) {
            this.endDraft = params.endDraft;
        }
    }
    updateStateVars(params: SetupView_Params) {
        this.__model.set(params.model);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__model.purgeDependencyOnElmtId(rmElmtId);
        this.__draftVenue.purgeDependencyOnElmtId(rmElmtId);
        this.__editingVenueId.purgeDependencyOnElmtId(rmElmtId);
        this.__editingVenueName.purgeDependencyOnElmtId(rmElmtId);
        this.__dateDraft.purgeDependencyOnElmtId(rmElmtId);
        this.__startDraft.purgeDependencyOnElmtId(rmElmtId);
        this.__endDraft.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__model.aboutToBeDeleted();
        this.__draftVenue.aboutToBeDeleted();
        this.__editingVenueId.aboutToBeDeleted();
        this.__editingVenueName.aboutToBeDeleted();
        this.__dateDraft.aboutToBeDeleted();
        this.__startDraft.aboutToBeDeleted();
        this.__endDraft.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __model: SynchedPropertyNesedObjectPU<AppModel>;
    get model() {
        return this.__model.get();
    }
    private onChanged: () => void;
    private notify: (msg: string) => void;
    private __draftVenue: ObservedPropertySimplePU<string>;
    get draftVenue() {
        return this.__draftVenue.get();
    }
    set draftVenue(newValue: string) {
        this.__draftVenue.set(newValue);
    }
    private __editingVenueId: ObservedPropertySimplePU<string>;
    get editingVenueId() {
        return this.__editingVenueId.get();
    }
    set editingVenueId(newValue: string) {
        this.__editingVenueId.set(newValue);
    }
    private __editingVenueName: ObservedPropertySimplePU<string>;
    get editingVenueName() {
        return this.__editingVenueName.get();
    }
    set editingVenueName(newValue: string) {
        this.__editingVenueName.set(newValue);
    }
    private __dateDraft: ObservedPropertySimplePU<string>;
    get dateDraft() {
        return this.__dateDraft.get();
    }
    set dateDraft(newValue: string) {
        this.__dateDraft.set(newValue);
    }
    private __startDraft: ObservedPropertySimplePU<string>;
    get startDraft() {
        return this.__startDraft.get();
    }
    set startDraft(newValue: string) {
        this.__startDraft.set(newValue);
    }
    private __endDraft: ObservedPropertySimplePU<string>;
    get endDraft() {
        return this.__endDraft.get();
    }
    set endDraft(newValue: string) {
        this.__endDraft.set(newValue);
    }
    aboutToAppear(): void {
        this.syncDrafts();
    }
    private syncDrafts(): void {
        this.dateDraft = this.model.config.startDate;
        this.startDraft = formatClock(this.model.config.dailyStart);
        this.endDraft = formatClock(this.model.config.dailyEnd);
    }
    /* ---------------- 数值调整 ---------------- */
    private bumpMinutes(delta: number): void {
        const next: number = Math.max(10, Math.min(300, this.model.config.matchMinutes + delta));
        this.model.patchConfig({ matchMinutes: next });
        this.onChanged();
    }
    private bumpBreak(delta: number): void {
        const next: number = Math.max(0, Math.min(120, this.model.config.breakMinutes + delta));
        this.model.patchConfig({ breakMinutes: next });
        this.onChanged();
    }
    private bumpRest(delta: number): void {
        const next: number = Math.max(0, Math.min(720, this.model.config.restMinutes + delta));
        this.model.patchConfig({ restMinutes: next });
        this.onChanged();
    }
    private bumpDays(delta: number): void {
        const next: number = Math.max(1, Math.min(60, this.model.config.days + delta));
        this.model.patchConfig({ days: next });
        this.onChanged();
    }
    private bumpGroups(delta: number): void {
        const maxGroups: number = Math.max(1, Math.floor(this.model.teams.length / 2));
        const next: number = Math.max(1, Math.min(maxGroups, this.model.config.groupCount + delta));
        this.model.patchConfig({ groupCount: next });
        this.onChanged();
    }
    private bumpAdvance(delta: number): void {
        const next: number = Math.max(1, Math.min(4, this.model.config.advancePerGroup + delta));
        this.model.patchConfig({ advancePerGroup: next });
        this.onChanged();
    }
    private shiftStartDate(delta: number): void {
        const base: string = this.model.config.startDate === '' ? todayIso() : this.model.config.startDate;
        this.dateDraft = addDays(base, delta);
        this.commitDate();
    }
    private commitDate(): void {
        const text: string = this.dateDraft.trim();
        const parts: string[] = text.split('-');
        if (parts.length !== 3) {
            this.notify('日期格式应为 YYYY-MM-DD，例如 2026-10-20。');
            this.syncDrafts();
            return;
        }
        const y: number = Number.parseInt(parts[0], 10);
        const m: number = Number.parseInt(parts[1], 10);
        const d: number = Number.parseInt(parts[2], 10);
        if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d) || m < 1 || m > 12 || d < 1 || d > 31) {
            this.notify('日期无效，请检查年、月、日。');
            this.syncDrafts();
            return;
        }
        this.model.patchConfig({ startDate: `${parts[0]}-${parts[1].length === 1 ? '0' + parts[1] : parts[1]}-${parts[2].length === 1 ? '0' + parts[2] : parts[2]}` });
        this.onChanged();
    }
    private commitWindow(): void {
        const start: number = parseClock(this.startDraft, this.model.config.dailyStart);
        const end: number = parseClock(this.endDraft, this.model.config.dailyEnd);
        if (end <= start) {
            this.notify('每日结束时间必须晚于开始时间。');
            this.syncDrafts();
            return;
        }
        this.model.patchConfig({ dailyStart: start, dailyEnd: end });
        this.startDraft = formatClock(start);
        this.endDraft = formatClock(end);
        this.onChanged();
    }
    /* ---------------- 场地 ---------------- */
    private addVenue(): void {
        const name: string = this.draftVenue.trim();
        if (name === '') {
            this.notify('请填写场地名称。');
            return;
        }
        this.model.addVenue(name);
        this.draftVenue = '';
        this.onChanged();
        this.notify(`已添加场地「${name}」。`);
    }
    private commitVenueRename(): void {
        const name: string = this.editingVenueName.trim();
        if (name === '') {
            this.notify('场地名称不能为空。');
            return;
        }
        this.model.renameVenue(this.editingVenueId, name);
        this.editingVenueId = '';
        this.onChanged();
    }
    /* ---------------- 分块 ---------------- */
    numberStepper(label: string, unit: string, value: number, onMinus: () => void, onPlus: () => void, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: Space.sm });
            Row.debugLine("entry/src/main/ets/view/SetupView.ets(159:5)", "entry");
            Row.alignItems(VerticalAlign.Center);
        }, Row);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new AppButton(this, { label: '－', kind: BtnKind.Secondary, onTap: () => onMinus() }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 160, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '－',
                            kind: BtnKind.Secondary,
                            onTap: () => onMinus()
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '－', kind: BtnKind.Secondary
                    });
                }
            }, { name: "AppButton" });
        }
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${value} ${unit}`);
            Text.debugLine("entry/src/main/ets/view/SetupView.ets(161:7)", "entry");
            Text.fontSize(FontSize.body);
            Text.fontColor(Palette.textPrimary);
            Text.width(96);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new AppButton(this, { label: '＋', kind: BtnKind.Secondary, onTap: () => onPlus() }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 166, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '＋',
                            kind: BtnKind.Secondary,
                            onTap: () => onPlus()
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '＋', kind: BtnKind.Secondary
                    });
                }
            }, { name: "AppButton" });
        }
        Row.pop();
    }
    basicCard(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/SetupView.ets(173:5)", "entry");
            Column.width('100%');
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new FieldRow(this, {
                        label: '赛事名称', hint: '会显示在总览页与导出文件中',
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                TextInput.create({ text: this.model.config.name, placeholder: '例如：2026 年「学院杯」篮球赛' });
                                TextInput.debugLine("entry/src/main/ets/view/SetupView.ets(175:9)", "entry");
                                TextInput.width('100%');
                                TextInput.height(40);
                                TextInput.fontSize(FontSize.body);
                                TextInput.backgroundColor(Palette.inputBg);
                                TextInput.borderRadius(Radius.md);
                                TextInput.onChange((value: string) => {
                                    this.model.patchConfig({ name: value });
                                });
                                TextInput.onBlur(() => this.onChanged());
                                TextInput.onSubmit(() => this.onChanged());
                            }, TextInput);
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 174, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '赛事名称',
                            hint: '会显示在总览页与导出文件中',
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    TextInput.create({ text: this.model.config.name, placeholder: '例如：2026 年「学院杯」篮球赛' });
                                    TextInput.debugLine("entry/src/main/ets/view/SetupView.ets(175:9)", "entry");
                                    TextInput.width('100%');
                                    TextInput.height(40);
                                    TextInput.fontSize(FontSize.body);
                                    TextInput.backgroundColor(Palette.inputBg);
                                    TextInput.borderRadius(Radius.md);
                                    TextInput.onChange((value: string) => {
                                        this.model.patchConfig({ name: value });
                                    });
                                    TextInput.onBlur(() => this.onChanged());
                                    TextInput.onSubmit(() => this.onChanged());
                                }, TextInput);
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '赛事名称', hint: '会显示在总览页与导出文件中'
                    });
                }
            }, { name: "FieldRow" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new FieldRow(this, {
                        label: '比赛项目', hint: '仅影响文案展示，不改变赛制算法',
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create({ space: Space.sm });
                                Row.debugLine("entry/src/main/ets/view/SetupView.ets(189:9)", "entry");
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                ForEach.create();
                                const forEachItemGenFunction = _item => {
                                    const s = _item;
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(sportLabel(s));
                                        Text.debugLine("entry/src/main/ets/view/SetupView.ets(191:13)", "entry");
                                        Text.fontSize(FontSize.small);
                                        Text.fontColor(this.model.config.sport === s ? Palette.textOnBrand : Palette.textSecondary);
                                        Text.backgroundColor(this.model.config.sport === s ? Palette.brand : Palette.inputBg);
                                        Text.padding({ left: Space.md, right: Space.md, top: 6, bottom: 6 });
                                        Text.borderRadius(Radius.pill);
                                        Text.focusable(true);
                                        Text.hoverEffect(HoverEffect.Highlight);
                                        Text.onClick(() => {
                                            this.model.patchConfig({ sport: s });
                                            this.onChanged();
                                        });
                                    }, Text);
                                    Text.pop();
                                };
                                this.forEachUpdateFunction(elmtId, allSports(), forEachItemGenFunction, (s: SportKind) => s, false, false);
                            }, ForEach);
                            ForEach.pop();
                            Row.pop();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 188, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '比赛项目',
                            hint: '仅影响文案展示，不改变赛制算法',
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create({ space: Space.sm });
                                    Row.debugLine("entry/src/main/ets/view/SetupView.ets(189:9)", "entry");
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    ForEach.create();
                                    const forEachItemGenFunction = _item => {
                                        const s = _item;
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create(sportLabel(s));
                                            Text.debugLine("entry/src/main/ets/view/SetupView.ets(191:13)", "entry");
                                            Text.fontSize(FontSize.small);
                                            Text.fontColor(this.model.config.sport === s ? Palette.textOnBrand : Palette.textSecondary);
                                            Text.backgroundColor(this.model.config.sport === s ? Palette.brand : Palette.inputBg);
                                            Text.padding({ left: Space.md, right: Space.md, top: 6, bottom: 6 });
                                            Text.borderRadius(Radius.pill);
                                            Text.focusable(true);
                                            Text.hoverEffect(HoverEffect.Highlight);
                                            Text.onClick(() => {
                                                this.model.patchConfig({ sport: s });
                                                this.onChanged();
                                            });
                                        }, Text);
                                        Text.pop();
                                    };
                                    this.forEachUpdateFunction(elmtId, allSports(), forEachItemGenFunction, (s: SportKind) => s, false, false);
                                }, ForEach);
                                ForEach.pop();
                                Row.pop();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '比赛项目', hint: '仅影响文案展示，不改变赛制算法'
                    });
                }
            }, { name: "FieldRow" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new FieldRow(this, {
                        label: '竞赛赛制', hint: formatHint(this.model.config.format),
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create({ space: Space.sm });
                                Row.debugLine("entry/src/main/ets/view/SetupView.ets(208:9)", "entry");
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                ForEach.create();
                                const forEachItemGenFunction = _item => {
                                    const f = _item;
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(formatLabel(f));
                                        Text.debugLine("entry/src/main/ets/view/SetupView.ets(210:13)", "entry");
                                        Text.fontSize(FontSize.small);
                                        Text.fontColor(this.model.config.format === f ? Palette.textOnBrand : Palette.textSecondary);
                                        Text.backgroundColor(this.model.config.format === f ? Palette.brand : Palette.inputBg);
                                        Text.padding({ left: Space.md, right: Space.md, top: 6, bottom: 6 });
                                        Text.borderRadius(Radius.pill);
                                        Text.focusable(true);
                                        Text.hoverEffect(HoverEffect.Highlight);
                                        Text.onClick(() => {
                                            this.model.patchConfig({ format: f });
                                            this.onChanged();
                                        });
                                    }, Text);
                                    Text.pop();
                                };
                                this.forEachUpdateFunction(elmtId, allFormats(), forEachItemGenFunction, (f: MatchFormat) => f, false, false);
                            }, ForEach);
                            ForEach.pop();
                            Row.pop();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 207, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '竞赛赛制',
                            hint: formatHint(this.model.config.format),
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create({ space: Space.sm });
                                    Row.debugLine("entry/src/main/ets/view/SetupView.ets(208:9)", "entry");
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    ForEach.create();
                                    const forEachItemGenFunction = _item => {
                                        const f = _item;
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create(formatLabel(f));
                                            Text.debugLine("entry/src/main/ets/view/SetupView.ets(210:13)", "entry");
                                            Text.fontSize(FontSize.small);
                                            Text.fontColor(this.model.config.format === f ? Palette.textOnBrand : Palette.textSecondary);
                                            Text.backgroundColor(this.model.config.format === f ? Palette.brand : Palette.inputBg);
                                            Text.padding({ left: Space.md, right: Space.md, top: 6, bottom: 6 });
                                            Text.borderRadius(Radius.pill);
                                            Text.focusable(true);
                                            Text.hoverEffect(HoverEffect.Highlight);
                                            Text.onClick(() => {
                                                this.model.patchConfig({ format: f });
                                                this.onChanged();
                                            });
                                        }, Text);
                                        Text.pop();
                                    };
                                    this.forEachUpdateFunction(elmtId, allFormats(), forEachItemGenFunction, (f: MatchFormat) => f, false, false);
                                }, ForEach);
                                ForEach.pop();
                                Row.pop();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '竞赛赛制', hint: formatHint(this.model.config.format)
                    });
                }
            }, { name: "FieldRow" });
        }
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.model.config.format === MatchFormat.GroupKnockout) {
                this.ifElseBranchUpdateFunction(0, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new FieldRow(this, {
                                    label: '分组数', hint: `按 ${this.model.teams.length} 支队伍计算，最多 ${Math.max(1, Math.floor(this.model.teams.length / 2))} 组`,
                                    content: () => {
                                        this.numberStepper.bind(this)('分组数', '组', this.model.config.groupCount, () => this.bumpGroups(-1), () => this.bumpGroups(1));
                                    }
                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 227, col: 9 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        label: '分组数',
                                        hint: `按 ${this.model.teams.length} 支队伍计算，最多 ${Math.max(1, Math.floor(this.model.teams.length / 2))} 组`,
                                        content: () => {
                                            this.numberStepper.bind(this)('分组数', '组', this.model.config.groupCount, () => this.bumpGroups(-1), () => this.bumpGroups(1));
                                        }
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    label: '分组数', hint: `按 ${this.model.teams.length} 支队伍计算，最多 ${Math.max(1, Math.floor(this.model.teams.length / 2))} 组`
                                });
                            }
                        }, { name: "FieldRow" });
                    }
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new FieldRow(this, {
                                    label: '每组出线', hint: '各组前若干名进入交叉淘汰赛',
                                    content: () => {
                                        this.numberStepper.bind(this)('每组出线', '支', this.model.config.advancePerGroup, () => this.bumpAdvance(-1), () => this.bumpAdvance(1));
                                    }
                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 231, col: 9 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        label: '每组出线',
                                        hint: '各组前若干名进入交叉淘汰赛',
                                        content: () => {
                                            this.numberStepper.bind(this)('每组出线', '支', this.model.config.advancePerGroup, () => this.bumpAdvance(-1), () => this.bumpAdvance(1));
                                        }
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    label: '每组出线', hint: '各组前若干名进入交叉淘汰赛'
                                });
                            }
                        }, { name: "FieldRow" });
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
    timingCard(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/SetupView.ets(242:5)", "entry");
            Column.width('100%');
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new FieldRow(this, {
                        label: '单场时长', hint: '含热身与暂停的总占用时间',
                        content: () => {
                            this.numberStepper.bind(this)('单场时长', '分钟', this.model.config.matchMinutes, () => this.bumpMinutes(-10), () => this.bumpMinutes(10));
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 243, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '单场时长',
                            hint: '含热身与暂停的总占用时间',
                            content: () => {
                                this.numberStepper.bind(this)('单场时长', '分钟', this.model.config.matchMinutes, () => this.bumpMinutes(-10), () => this.bumpMinutes(10));
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '单场时长', hint: '含热身与暂停的总占用时间'
                    });
                }
            }, { name: "FieldRow" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new FieldRow(this, {
                        label: '场间间隔', hint: '同一场地两场比赛之间的整理时间',
                        content: () => {
                            this.numberStepper.bind(this)('场间间隔', '分钟', this.model.config.breakMinutes, () => this.bumpBreak(-5), () => this.bumpBreak(5));
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 247, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '场间间隔',
                            hint: '同一场地两场比赛之间的整理时间',
                            content: () => {
                                this.numberStepper.bind(this)('场间间隔', '分钟', this.model.config.breakMinutes, () => this.bumpBreak(-5), () => this.bumpBreak(5));
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '场间间隔', hint: '同一场地两场比赛之间的整理时间'
                    });
                }
            }, { name: "FieldRow" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new FieldRow(this, {
                        label: '同队最小休息', hint: '低于此间隔会被标记为「休息不足」提醒',
                        content: () => {
                            this.numberStepper.bind(this)('同队最小休息', '分钟', this.model.config.restMinutes, () => this.bumpRest(-15), () => this.bumpRest(15));
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 251, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '同队最小休息',
                            hint: '低于此间隔会被标记为「休息不足」提醒',
                            content: () => {
                                this.numberStepper.bind(this)('同队最小休息', '分钟', this.model.config.restMinutes, () => this.bumpRest(-15), () => this.bumpRest(15));
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '同队最小休息', hint: '低于此间隔会被标记为「休息不足」提醒'
                    });
                }
            }, { name: "FieldRow" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new FieldRow(this, {
                        label: '比赛天数', hint: '赛期跨度，超出会被标记为冲突',
                        content: () => {
                            this.numberStepper.bind(this)('比赛天数', '天', this.model.config.days, () => this.bumpDays(-1), () => this.bumpDays(1));
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 255, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '比赛天数',
                            hint: '赛期跨度，超出会被标记为冲突',
                            content: () => {
                                this.numberStepper.bind(this)('比赛天数', '天', this.model.config.days, () => this.bumpDays(-1), () => this.bumpDays(1));
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '比赛天数', hint: '赛期跨度，超出会被标记为冲突'
                    });
                }
            }, { name: "FieldRow" });
        }
        Column.pop();
    }
    calendarCard(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/SetupView.ets(265:5)", "entry");
            Column.width('100%');
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new FieldRow(this, {
                        label: '首个比赛日', hint: '格式 YYYY-MM-DD，修改后按回车或移开焦点生效',
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create({ space: Space.sm });
                                Row.debugLine("entry/src/main/ets/view/SetupView.ets(267:9)", "entry");
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                TextInput.create({ text: this.dateDraft, placeholder: '2026-10-20' });
                                TextInput.debugLine("entry/src/main/ets/view/SetupView.ets(268:11)", "entry");
                                TextInput.width(180);
                                TextInput.height(40);
                                TextInput.fontSize(FontSize.body);
                                TextInput.backgroundColor(Palette.inputBg);
                                TextInput.borderRadius(Radius.md);
                                TextInput.onChange((value: string) => {
                                    this.dateDraft = value;
                                });
                                TextInput.onBlur(() => this.commitDate());
                                TextInput.onSubmit(() => this.commitDate());
                            }, TextInput);
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new AppButton(this, { label: '今天', kind: BtnKind.Secondary, onTap: () => {
                                                this.dateDraft = todayIso();
                                                this.commitDate();
                                            } }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 279, col: 11 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                label: '今天',
                                                kind: BtnKind.Secondary,
                                                onTap: () => {
                                                    this.dateDraft = todayIso();
                                                    this.commitDate();
                                                }
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            label: '今天', kind: BtnKind.Secondary
                                        });
                                    }
                                }, { name: "AppButton" });
                            }
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new AppButton(this, { label: '前一天', kind: BtnKind.Ghost, onTap: () => this.shiftStartDate(-1) }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 283, col: 11 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                label: '前一天',
                                                kind: BtnKind.Ghost,
                                                onTap: () => this.shiftStartDate(-1)
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            label: '前一天', kind: BtnKind.Ghost
                                        });
                                    }
                                }, { name: "AppButton" });
                            }
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new AppButton(this, { label: '后一天', kind: BtnKind.Ghost, onTap: () => this.shiftStartDate(1) }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 284, col: 11 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                label: '后一天',
                                                kind: BtnKind.Ghost,
                                                onTap: () => this.shiftStartDate(1)
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            label: '后一天', kind: BtnKind.Ghost
                                        });
                                    }
                                }, { name: "AppButton" });
                            }
                            Row.pop();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 266, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '首个比赛日',
                            hint: '格式 YYYY-MM-DD，修改后按回车或移开焦点生效',
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create({ space: Space.sm });
                                    Row.debugLine("entry/src/main/ets/view/SetupView.ets(267:9)", "entry");
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    TextInput.create({ text: this.dateDraft, placeholder: '2026-10-20' });
                                    TextInput.debugLine("entry/src/main/ets/view/SetupView.ets(268:11)", "entry");
                                    TextInput.width(180);
                                    TextInput.height(40);
                                    TextInput.fontSize(FontSize.body);
                                    TextInput.backgroundColor(Palette.inputBg);
                                    TextInput.borderRadius(Radius.md);
                                    TextInput.onChange((value: string) => {
                                        this.dateDraft = value;
                                    });
                                    TextInput.onBlur(() => this.commitDate());
                                    TextInput.onSubmit(() => this.commitDate());
                                }, TextInput);
                                {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        if (isInitialRender) {
                                            let componentCall = new AppButton(this, { label: '今天', kind: BtnKind.Secondary, onTap: () => {
                                                    this.dateDraft = todayIso();
                                                    this.commitDate();
                                                } }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 279, col: 11 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    label: '今天',
                                                    kind: BtnKind.Secondary,
                                                    onTap: () => {
                                                        this.dateDraft = todayIso();
                                                        this.commitDate();
                                                    }
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                label: '今天', kind: BtnKind.Secondary
                                            });
                                        }
                                    }, { name: "AppButton" });
                                }
                                {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        if (isInitialRender) {
                                            let componentCall = new AppButton(this, { label: '前一天', kind: BtnKind.Ghost, onTap: () => this.shiftStartDate(-1) }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 283, col: 11 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    label: '前一天',
                                                    kind: BtnKind.Ghost,
                                                    onTap: () => this.shiftStartDate(-1)
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                label: '前一天', kind: BtnKind.Ghost
                                            });
                                        }
                                    }, { name: "AppButton" });
                                }
                                {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        if (isInitialRender) {
                                            let componentCall = new AppButton(this, { label: '后一天', kind: BtnKind.Ghost, onTap: () => this.shiftStartDate(1) }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 284, col: 11 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    label: '后一天',
                                                    kind: BtnKind.Ghost,
                                                    onTap: () => this.shiftStartDate(1)
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                label: '后一天', kind: BtnKind.Ghost
                                            });
                                        }
                                    }, { name: "AppButton" });
                                }
                                Row.pop();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '首个比赛日', hint: '格式 YYYY-MM-DD，修改后按回车或移开焦点生效'
                    });
                }
            }, { name: "FieldRow" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new FieldRow(this, {
                        label: '赛期预览',
                        hint: `${this.model.config.days} 天`,
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create({ space: Space.sm });
                                Row.debugLine("entry/src/main/ets/view/SetupView.ets(292:9)", "entry");
                            }, Row);
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new Pill(this, {
                                            text: `${this.model.config.startDate} ${weekdayLabel(this.model.config.startDate)}`,
                                            tone: ToneKind.Brand
                                        }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 293, col: 11 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                text: `${this.model.config.startDate} ${weekdayLabel(this.model.config.startDate)}`,
                                                tone: ToneKind.Brand
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            text: `${this.model.config.startDate} ${weekdayLabel(this.model.config.startDate)}`,
                                            tone: ToneKind.Brand
                                        });
                                    }
                                }, { name: "Pill" });
                            }
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create('→');
                                Text.debugLine("entry/src/main/ets/view/SetupView.ets(297:11)", "entry");
                                Text.fontSize(FontSize.small);
                                Text.fontColor(Palette.textTertiary);
                            }, Text);
                            Text.pop();
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new Pill(this, {
                                            text: `${addDays(this.model.config.startDate, Math.max(0, this.model.config.days - 1))} `
                                                + `${weekdayLabel(addDays(this.model.config.startDate, Math.max(0, this.model.config.days - 1)))}`,
                                            tone: ToneKind.Brand
                                        }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 298, col: 11 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                text: `${addDays(this.model.config.startDate, Math.max(0, this.model.config.days - 1))} `
                                                    + `${weekdayLabel(addDays(this.model.config.startDate, Math.max(0, this.model.config.days - 1)))}`,
                                                tone: ToneKind.Brand
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            text: `${addDays(this.model.config.startDate, Math.max(0, this.model.config.days - 1))} `
                                                + `${weekdayLabel(addDays(this.model.config.startDate, Math.max(0, this.model.config.days - 1)))}`,
                                            tone: ToneKind.Brand
                                        });
                                    }
                                }, { name: "Pill" });
                            }
                            Row.pop();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 288, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '赛期预览',
                            hint: `${this.model.config.days} 天`,
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create({ space: Space.sm });
                                    Row.debugLine("entry/src/main/ets/view/SetupView.ets(292:9)", "entry");
                                }, Row);
                                {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        if (isInitialRender) {
                                            let componentCall = new Pill(this, {
                                                text: `${this.model.config.startDate} ${weekdayLabel(this.model.config.startDate)}`,
                                                tone: ToneKind.Brand
                                            }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 293, col: 11 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    text: `${this.model.config.startDate} ${weekdayLabel(this.model.config.startDate)}`,
                                                    tone: ToneKind.Brand
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                text: `${this.model.config.startDate} ${weekdayLabel(this.model.config.startDate)}`,
                                                tone: ToneKind.Brand
                                            });
                                        }
                                    }, { name: "Pill" });
                                }
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('→');
                                    Text.debugLine("entry/src/main/ets/view/SetupView.ets(297:11)", "entry");
                                    Text.fontSize(FontSize.small);
                                    Text.fontColor(Palette.textTertiary);
                                }, Text);
                                Text.pop();
                                {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        if (isInitialRender) {
                                            let componentCall = new Pill(this, {
                                                text: `${addDays(this.model.config.startDate, Math.max(0, this.model.config.days - 1))} `
                                                    + `${weekdayLabel(addDays(this.model.config.startDate, Math.max(0, this.model.config.days - 1)))}`,
                                                tone: ToneKind.Brand
                                            }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 298, col: 11 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    text: `${addDays(this.model.config.startDate, Math.max(0, this.model.config.days - 1))} `
                                                        + `${weekdayLabel(addDays(this.model.config.startDate, Math.max(0, this.model.config.days - 1)))}`,
                                                    tone: ToneKind.Brand
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                text: `${addDays(this.model.config.startDate, Math.max(0, this.model.config.days - 1))} `
                                                    + `${weekdayLabel(addDays(this.model.config.startDate, Math.max(0, this.model.config.days - 1)))}`,
                                                tone: ToneKind.Brand
                                            });
                                        }
                                    }, { name: "Pill" });
                                }
                                Row.pop();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '赛期预览',
                        hint: `${this.model.config.days} 天`
                    });
                }
            }, { name: "FieldRow" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new FieldRow(this, {
                        label: '每日时段', hint: '每天可安排比赛的时间范围，修改后移开焦点生效',
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create({ space: Space.sm });
                                Row.debugLine("entry/src/main/ets/view/SetupView.ets(307:9)", "entry");
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                TextInput.create({ text: this.startDraft, placeholder: '14:00' });
                                TextInput.debugLine("entry/src/main/ets/view/SetupView.ets(308:11)", "entry");
                                TextInput.width(120);
                                TextInput.height(40);
                                TextInput.fontSize(FontSize.body);
                                TextInput.backgroundColor(Palette.inputBg);
                                TextInput.borderRadius(Radius.md);
                                TextInput.onChange((value: string) => {
                                    this.startDraft = value;
                                });
                                TextInput.onBlur(() => this.commitWindow());
                                TextInput.onSubmit(() => this.commitWindow());
                            }, TextInput);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create('至');
                                Text.debugLine("entry/src/main/ets/view/SetupView.ets(319:11)", "entry");
                                Text.fontSize(FontSize.body);
                                Text.fontColor(Palette.textSecondary);
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                TextInput.create({ text: this.endDraft, placeholder: '21:00' });
                                TextInput.debugLine("entry/src/main/ets/view/SetupView.ets(320:11)", "entry");
                                TextInput.width(120);
                                TextInput.height(40);
                                TextInput.fontSize(FontSize.body);
                                TextInput.backgroundColor(Palette.inputBg);
                                TextInput.borderRadius(Radius.md);
                                TextInput.onChange((value: string) => {
                                    this.endDraft = value;
                                });
                                TextInput.onBlur(() => this.commitWindow());
                                TextInput.onSubmit(() => this.commitWindow());
                            }, TextInput);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(`共 ${Math.floor((this.model.config.dailyEnd - this.model.config.dailyStart)
                                    / Math.max(10, this.model.config.matchMinutes + this.model.config.breakMinutes)) * this.model.config.venues.length} 个可用场次 / 天`);
                                Text.debugLine("entry/src/main/ets/view/SetupView.ets(331:11)", "entry");
                                Text.fontSize(FontSize.caption);
                                Text.fontColor(Palette.textTertiary);
                            }, Text);
                            Text.pop();
                            Row.pop();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 306, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '每日时段',
                            hint: '每天可安排比赛的时间范围，修改后移开焦点生效',
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create({ space: Space.sm });
                                    Row.debugLine("entry/src/main/ets/view/SetupView.ets(307:9)", "entry");
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    TextInput.create({ text: this.startDraft, placeholder: '14:00' });
                                    TextInput.debugLine("entry/src/main/ets/view/SetupView.ets(308:11)", "entry");
                                    TextInput.width(120);
                                    TextInput.height(40);
                                    TextInput.fontSize(FontSize.body);
                                    TextInput.backgroundColor(Palette.inputBg);
                                    TextInput.borderRadius(Radius.md);
                                    TextInput.onChange((value: string) => {
                                        this.startDraft = value;
                                    });
                                    TextInput.onBlur(() => this.commitWindow());
                                    TextInput.onSubmit(() => this.commitWindow());
                                }, TextInput);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('至');
                                    Text.debugLine("entry/src/main/ets/view/SetupView.ets(319:11)", "entry");
                                    Text.fontSize(FontSize.body);
                                    Text.fontColor(Palette.textSecondary);
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    TextInput.create({ text: this.endDraft, placeholder: '21:00' });
                                    TextInput.debugLine("entry/src/main/ets/view/SetupView.ets(320:11)", "entry");
                                    TextInput.width(120);
                                    TextInput.height(40);
                                    TextInput.fontSize(FontSize.body);
                                    TextInput.backgroundColor(Palette.inputBg);
                                    TextInput.borderRadius(Radius.md);
                                    TextInput.onChange((value: string) => {
                                        this.endDraft = value;
                                    });
                                    TextInput.onBlur(() => this.commitWindow());
                                    TextInput.onSubmit(() => this.commitWindow());
                                }, TextInput);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(`共 ${Math.floor((this.model.config.dailyEnd - this.model.config.dailyStart)
                                        / Math.max(10, this.model.config.matchMinutes + this.model.config.breakMinutes)) * this.model.config.venues.length} 个可用场次 / 天`);
                                    Text.debugLine("entry/src/main/ets/view/SetupView.ets(331:11)", "entry");
                                    Text.fontSize(FontSize.caption);
                                    Text.fontColor(Palette.textTertiary);
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
                        label: '每日时段', hint: '每天可安排比赛的时间范围，修改后移开焦点生效'
                    });
                }
            }, { name: "FieldRow" });
        }
        Column.pop();
    }
    venueCard(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: Space.md });
            Column.debugLine("entry/src/main/ets/view/SetupView.ets(343:5)", "entry");
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: Space.sm });
            Row.debugLine("entry/src/main/ets/view/SetupView.ets(344:7)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.draftVenue, placeholder: '场地名称，例如「东区体育馆 1 号场」' });
            TextInput.debugLine("entry/src/main/ets/view/SetupView.ets(345:9)", "entry");
            TextInput.layoutWeight(1);
            TextInput.height(40);
            TextInput.fontSize(FontSize.body);
            TextInput.backgroundColor(Palette.inputBg);
            TextInput.borderRadius(Radius.md);
            TextInput.onChange((value: string) => {
                this.draftVenue = value;
            });
            TextInput.onSubmit(() => this.addVenue());
        }, TextInput);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new AppButton(this, { label: '添加场地', kind: BtnKind.Primary, symbol: '＋', onTap: () => this.addVenue() }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 355, col: 9 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '添加场地',
                            kind: BtnKind.Primary,
                            symbol: '＋',
                            onTap: () => this.addVenue()
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '添加场地', kind: BtnKind.Primary, symbol: '＋'
                    });
                }
            }, { name: "AppButton" });
        }
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.model.config.venues.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('尚无场地，至少添加 1 块场地才能生成赛程。');
                        Text.debugLine("entry/src/main/ets/view/SetupView.ets(360:9)", "entry");
                        Text.fontSize(FontSize.small);
                        Text.fontColor(Palette.danger);
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SetupView.ets(364:9)", "entry");
                        Column.width('100%');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = (_item, index: number) => {
                            const v = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create();
                                Row.debugLine("entry/src/main/ets/view/SetupView.ets(366:13)", "entry");
                                Row.width('100%');
                                Row.height(48);
                                Row.alignItems(VerticalAlign.Center);
                                Row.border({ width: { bottom: 1 }, color: { bottom: Palette.divider } });
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(`${index + 1}`);
                                Text.debugLine("entry/src/main/ets/view/SetupView.ets(367:15)", "entry");
                                Text.fontSize(FontSize.body);
                                Text.fontColor(Palette.textTertiary);
                                Text.width(40);
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                If.create();
                                if (this.editingVenueId === v.id) {
                                    this.ifElseBranchUpdateFunction(0, () => {
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            TextInput.create({ text: this.editingVenueName });
                                            TextInput.debugLine("entry/src/main/ets/view/SetupView.ets(372:17)", "entry");
                                            TextInput.layoutWeight(1);
                                            TextInput.height(36);
                                            TextInput.fontSize(FontSize.body);
                                            TextInput.backgroundColor(Palette.inputBg);
                                            TextInput.borderRadius(Radius.sm);
                                            TextInput.onChange((value: string) => {
                                                this.editingVenueName = value;
                                            });
                                            TextInput.onSubmit(() => this.commitVenueRename());
                                        }, TextInput);
                                    });
                                }
                                else {
                                    this.ifElseBranchUpdateFunction(1, () => {
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create(v.name);
                                            Text.debugLine("entry/src/main/ets/view/SetupView.ets(383:17)", "entry");
                                            Text.fontSize(FontSize.body);
                                            Text.fontColor(Palette.textPrimary);
                                            Text.layoutWeight(1);
                                        }, Text);
                                        Text.pop();
                                    });
                                }
                            }, If);
                            If.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create({ space: Space.sm });
                                Row.debugLine("entry/src/main/ets/view/SetupView.ets(388:15)", "entry");
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                If.create();
                                if (this.editingVenueId === v.id) {
                                    this.ifElseBranchUpdateFunction(0, () => {
                                        {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                if (isInitialRender) {
                                                    let componentCall = new AppButton(this, { label: '保存', kind: BtnKind.Primary, onTap: () => this.commitVenueRename() }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 390, col: 19 });
                                                    ViewPU.create(componentCall);
                                                    let paramsLambda = () => {
                                                        return {
                                                            label: '保存',
                                                            kind: BtnKind.Primary,
                                                            onTap: () => this.commitVenueRename()
                                                        };
                                                    };
                                                    componentCall.paramsGenerator_ = paramsLambda;
                                                }
                                                else {
                                                    this.updateStateVarsOfChildByElmtId(elmtId, {
                                                        label: '保存', kind: BtnKind.Primary
                                                    });
                                                }
                                            }, { name: "AppButton" });
                                        }
                                        {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                if (isInitialRender) {
                                                    let componentCall = new AppButton(this, { label: '取消', kind: BtnKind.Ghost, onTap: () => {
                                                            this.editingVenueId = '';
                                                        } }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 391, col: 19 });
                                                    ViewPU.create(componentCall);
                                                    let paramsLambda = () => {
                                                        return {
                                                            label: '取消',
                                                            kind: BtnKind.Ghost,
                                                            onTap: () => {
                                                                this.editingVenueId = '';
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
                                    });
                                }
                                else {
                                    this.ifElseBranchUpdateFunction(1, () => {
                                        {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                if (isInitialRender) {
                                                    let componentCall = new AppButton(this, { label: '重命名', kind: BtnKind.Secondary, onTap: () => {
                                                            this.editingVenueId = v.id;
                                                            this.editingVenueName = v.name;
                                                        } }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 395, col: 19 });
                                                    ViewPU.create(componentCall);
                                                    let paramsLambda = () => {
                                                        return {
                                                            label: '重命名',
                                                            kind: BtnKind.Secondary,
                                                            onTap: () => {
                                                                this.editingVenueId = v.id;
                                                                this.editingVenueName = v.name;
                                                            }
                                                        };
                                                    };
                                                    componentCall.paramsGenerator_ = paramsLambda;
                                                }
                                                else {
                                                    this.updateStateVarsOfChildByElmtId(elmtId, {
                                                        label: '重命名', kind: BtnKind.Secondary
                                                    });
                                                }
                                            }, { name: "AppButton" });
                                        }
                                        {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                if (isInitialRender) {
                                                    let componentCall = new AppButton(this, { label: '删除', kind: BtnKind.Danger, onTap: () => {
                                                            this.model.removeVenue(v.id);
                                                            this.onChanged();
                                                        } }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 399, col: 19 });
                                                    ViewPU.create(componentCall);
                                                    let paramsLambda = () => {
                                                        return {
                                                            label: '删除',
                                                            kind: BtnKind.Danger,
                                                            onTap: () => {
                                                                this.model.removeVenue(v.id);
                                                                this.onChanged();
                                                            }
                                                        };
                                                    };
                                                    componentCall.paramsGenerator_ = paramsLambda;
                                                }
                                                else {
                                                    this.updateStateVarsOfChildByElmtId(elmtId, {
                                                        label: '删除', kind: BtnKind.Danger
                                                    });
                                                }
                                            }, { name: "AppButton" });
                                        }
                                    });
                                }
                            }, If);
                            If.pop();
                            Row.pop();
                            Row.pop();
                        };
                        this.forEachUpdateFunction(elmtId, this.model.config.venues, forEachItemGenFunction, (v: Venue) => v.id, true, false);
                    }, ForEach);
                    ForEach.pop();
                    Column.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: Space.lg });
            Column.debugLine("entry/src/main/ets/view/SetupView.ets(419:5)", "entry");
            Column.width('100%');
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new CardSection(this, {
                        title: '基本信息', subtitle: '赛事名称、项目与赛制',
                        content: () => {
                            this.basicCard.bind(this)();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 420, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            title: '基本信息',
                            subtitle: '赛事名称、项目与赛制',
                            content: () => {
                                this.basicCard.bind(this)();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        title: '基本信息', subtitle: '赛事名称、项目与赛制'
                    });
                }
            }, { name: "CardSection" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new CardSection(this, {
                        title: '时长与赛期', subtitle: '决定每天能安排多少场比赛',
                        content: () => {
                            this.timingCard.bind(this)();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 424, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            title: '时长与赛期',
                            subtitle: '决定每天能安排多少场比赛',
                            content: () => {
                                this.timingCard.bind(this)();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        title: '时长与赛期', subtitle: '决定每天能安排多少场比赛'
                    });
                }
            }, { name: "CardSection" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new CardSection(this, {
                        title: '日期与每日时段', subtitle: '排期算法只会使用这段时间窗',
                        content: () => {
                            this.calendarCard.bind(this)();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 428, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            title: '日期与每日时段',
                            subtitle: '排期算法只会使用这段时间窗',
                            content: () => {
                                this.calendarCard.bind(this)();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        title: '日期与每日时段', subtitle: '排期算法只会使用这段时间窗'
                    });
                }
            }, { name: "CardSection" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new CardSection(this, {
                        title: `比赛场地（${this.model.config.venues.length} 块）`,
                        subtitle: '所有场地在相同时段内并行使用',
                        content: () => {
                            this.venueCard.bind(this)();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/SetupView.ets", line: 432, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            title: `比赛场地（${this.model.config.venues.length} 块）`,
                            subtitle: '所有场地在相同时段内并行使用',
                            content: () => {
                                this.venueCard.bind(this)();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        title: `比赛场地（${this.model.config.venues.length} 块）`,
                        subtitle: '所有场地在相同时段内并行使用'
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
