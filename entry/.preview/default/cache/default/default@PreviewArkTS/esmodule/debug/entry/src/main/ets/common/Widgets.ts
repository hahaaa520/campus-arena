if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface KeyValueRow_Params {
    label?: string;
    value?: string;
    tone?: ToneKind;
    divided?: boolean;
}
interface EmptyHint_Params {
    symbol?: string;
    title?: string;
    hint?: string;
}
interface FieldRow_Params {
    label?: string;
    hint?: string;
    labelWidth?: number;
    content?: () => void;
}
interface AppButton_Params {
    label?: string;
    kind?: BtnKind;
    symbol?: string;
    disabled?: boolean;
    tabIndexValue?: number;
    onTap?: () => void;
}
interface Pill_Params {
    text?: string;
    tone?: ToneKind;
    compact?: boolean;
}
interface StatTile_Params {
    label?: string;
    value?: string;
    unit?: string;
    hint?: string;
    tone?: ToneKind;
}
interface CardSection_Params {
    title?: string;
    subtitle?: string;
    fill?: boolean;
    content?: () => void;
}
import { FontSize, Palette, Radius, Space, ToneKind } from "@normalized:N&&&entry/src/main/ets/common/Theme&";
export function toneColor(tone: ToneKind): string {
    switch (tone) {
        case ToneKind.Brand:
            return Palette.brand;
        case ToneKind.Ok:
            return Palette.ok;
        case ToneKind.Warn:
            return Palette.warn;
        case ToneKind.Danger:
            return Palette.danger;
        default:
            return Palette.textSecondary;
    }
}
export function toneSoftColor(tone: ToneKind): string {
    switch (tone) {
        case ToneKind.Brand:
            return Palette.brandSoft;
        case ToneKind.Ok:
            return Palette.okSoft;
        case ToneKind.Warn:
            return Palette.warnSoft;
        case ToneKind.Danger:
            return Palette.dangerSoft;
        default:
            return Palette.neutralSoft;
    }
}
export class CardSection extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__title = new SynchedPropertySimpleOneWayPU(params.title, this, "title");
        this.__subtitle = new SynchedPropertySimpleOneWayPU(params.subtitle, this, "subtitle");
        this.__fill = new SynchedPropertySimpleOneWayPU(params.fill, this, "fill");
        this.content = this.emptyBody;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: CardSection_Params) {
        if (params.title === undefined) {
            this.__title.set('');
        }
        if (params.subtitle === undefined) {
            this.__subtitle.set('');
        }
        if (params.fill === undefined) {
            this.__fill.set(true);
        }
        if (params.content !== undefined) {
            this.content = params.content;
        }
    }
    updateStateVars(params: CardSection_Params) {
        this.__title.reset(params.title);
        this.__subtitle.reset(params.subtitle);
        this.__fill.reset(params.fill);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__title.purgeDependencyOnElmtId(rmElmtId);
        this.__subtitle.purgeDependencyOnElmtId(rmElmtId);
        this.__fill.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__title.aboutToBeDeleted();
        this.__subtitle.aboutToBeDeleted();
        this.__fill.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __title: SynchedPropertySimpleOneWayPU<string>;
    get title() {
        return this.__title.get();
    }
    set title(newValue: string) {
        this.__title.set(newValue);
    }
    private __subtitle: SynchedPropertySimpleOneWayPU<string>;
    get subtitle() {
        return this.__subtitle.get();
    }
    set subtitle(newValue: string) {
        this.__subtitle.set(newValue);
    }
    private __fill: SynchedPropertySimpleOneWayPU<boolean>;
    get fill() {
        return this.__fill.get();
    }
    set fill(newValue: boolean) {
        this.__fill.set(newValue);
    }
    private __content;
    emptyBody(parent = null) {
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/common/Widgets.ets(57:5)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
            Column.padding(Space.lg);
            Column.backgroundColor(this.fill ? Palette.cardBg : Color.Transparent);
            Column.borderRadius(Radius.lg);
            Column.border(this.fill ? { width: 1, color: Palette.divider } : { width: 0 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.title !== '') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.debugLine("entry/src/main/ets/common/Widgets.ets(59:9)", "entry");
                        Row.width('100%');
                        Row.alignItems(VerticalAlign.Center);
                        Row.margin({ bottom: Space.md });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/common/Widgets.ets(60:11)", "entry");
                        Column.alignItems(HorizontalAlign.Start);
                        Column.layoutWeight(1);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.title);
                        Text.debugLine("entry/src/main/ets/common/Widgets.ets(61:13)", "entry");
                        Text.fontSize(FontSize.subhead);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor(Palette.textPrimary);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.subtitle !== '') {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(this.subtitle);
                                    Text.debugLine("entry/src/main/ets/common/Widgets.ets(66:15)", "entry");
                                    Text.fontSize(FontSize.small);
                                    Text.fontColor(Palette.textTertiary);
                                    Text.margin({ top: 2 });
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
                    Row.pop();
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
    }
    rerender() {
        this.updateDirtyElements();
    }
}
export class StatTile extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__label = new SynchedPropertySimpleOneWayPU(params.label, this, "label");
        this.__value = new SynchedPropertySimpleOneWayPU(params.value, this, "value");
        this.__unit = new SynchedPropertySimpleOneWayPU(params.unit, this, "unit");
        this.__hint = new SynchedPropertySimpleOneWayPU(params.hint, this, "hint");
        this.__tone = new SynchedPropertySimpleOneWayPU(params.tone, this, "tone");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: StatTile_Params) {
        if (params.label === undefined) {
            this.__label.set('');
        }
        if (params.value === undefined) {
            this.__value.set('');
        }
        if (params.unit === undefined) {
            this.__unit.set('');
        }
        if (params.hint === undefined) {
            this.__hint.set('');
        }
        if (params.tone === undefined) {
            this.__tone.set(ToneKind.Neutral);
        }
    }
    updateStateVars(params: StatTile_Params) {
        this.__label.reset(params.label);
        this.__value.reset(params.value);
        this.__unit.reset(params.unit);
        this.__hint.reset(params.hint);
        this.__tone.reset(params.tone);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__label.purgeDependencyOnElmtId(rmElmtId);
        this.__value.purgeDependencyOnElmtId(rmElmtId);
        this.__unit.purgeDependencyOnElmtId(rmElmtId);
        this.__hint.purgeDependencyOnElmtId(rmElmtId);
        this.__tone.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__label.aboutToBeDeleted();
        this.__value.aboutToBeDeleted();
        this.__unit.aboutToBeDeleted();
        this.__hint.aboutToBeDeleted();
        this.__tone.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __label: SynchedPropertySimpleOneWayPU<string>;
    get label() {
        return this.__label.get();
    }
    set label(newValue: string) {
        this.__label.set(newValue);
    }
    private __value: SynchedPropertySimpleOneWayPU<string>;
    get value() {
        return this.__value.get();
    }
    set value(newValue: string) {
        this.__value.set(newValue);
    }
    private __unit: SynchedPropertySimpleOneWayPU<string>;
    get unit() {
        return this.__unit.get();
    }
    set unit(newValue: string) {
        this.__unit.set(newValue);
    }
    private __hint: SynchedPropertySimpleOneWayPU<string>;
    get hint() {
        return this.__hint.get();
    }
    set hint(newValue: string) {
        this.__hint.set(newValue);
    }
    private __tone: SynchedPropertySimpleOneWayPU<ToneKind>;
    get tone() {
        return this.__tone.get();
    }
    set tone(newValue: ToneKind) {
        this.__tone.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/common/Widgets.ets(104:5)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.padding(Space.lg);
            Column.backgroundColor(Palette.cardBg);
            Column.borderRadius(Radius.lg);
            Column.border({ width: 1, color: Palette.divider });
            Column.layoutWeight(1);
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.label);
            Text.debugLine("entry/src/main/ets/common/Widgets.ets(105:7)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.maxLines(1);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/common/Widgets.ets(111:7)", "entry");
            Row.alignItems(VerticalAlign.Bottom);
            Row.margin({ top: Space.xs });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.value);
            Text.debugLine("entry/src/main/ets/common/Widgets.ets(112:9)", "entry");
            Text.fontSize(FontSize.display);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(toneColor(this.tone));
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.unit !== '') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.unit);
                        Text.debugLine("entry/src/main/ets/common/Widgets.ets(117:11)", "entry");
                        Text.fontSize(FontSize.small);
                        Text.fontColor(Palette.textSecondary);
                        Text.margin({ left: Space.xs, bottom: 4 });
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
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.hint !== '') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.hint);
                        Text.debugLine("entry/src/main/ets/common/Widgets.ets(127:9)", "entry");
                        Text.fontSize(FontSize.caption);
                        Text.fontColor(Palette.textTertiary);
                        Text.maxLines(2);
                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                        Text.margin({ top: 2 });
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
    }
    rerender() {
        this.updateDirtyElements();
    }
}
export class Pill extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__text = new SynchedPropertySimpleOneWayPU(params.text, this, "text");
        this.__tone = new SynchedPropertySimpleOneWayPU(params.tone, this, "tone");
        this.__compact = new SynchedPropertySimpleOneWayPU(params.compact, this, "compact");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: Pill_Params) {
        if (params.text === undefined) {
            this.__text.set('');
        }
        if (params.tone === undefined) {
            this.__tone.set(ToneKind.Neutral);
        }
        if (params.compact === undefined) {
            this.__compact.set(false);
        }
    }
    updateStateVars(params: Pill_Params) {
        this.__text.reset(params.text);
        this.__tone.reset(params.tone);
        this.__compact.reset(params.compact);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__text.purgeDependencyOnElmtId(rmElmtId);
        this.__tone.purgeDependencyOnElmtId(rmElmtId);
        this.__compact.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__text.aboutToBeDeleted();
        this.__tone.aboutToBeDeleted();
        this.__compact.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __text: SynchedPropertySimpleOneWayPU<string>;
    get text() {
        return this.__text.get();
    }
    set text(newValue: string) {
        this.__text.set(newValue);
    }
    private __tone: SynchedPropertySimpleOneWayPU<ToneKind>;
    get tone() {
        return this.__tone.get();
    }
    set tone(newValue: ToneKind) {
        this.__tone.set(newValue);
    }
    private __compact: SynchedPropertySimpleOneWayPU<boolean>;
    get compact() {
        return this.__compact.get();
    }
    set compact(newValue: boolean) {
        this.__compact.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.text);
            Text.debugLine("entry/src/main/ets/common/Widgets.ets(156:5)", "entry");
            Text.fontSize(this.compact ? FontSize.caption : FontSize.small);
            Text.fontColor(toneColor(this.tone));
            Text.backgroundColor(toneSoftColor(this.tone));
            Text.padding({
                left: this.compact ? 6 : 10,
                right: this.compact ? 6 : 10,
                top: this.compact ? 2 : 4,
                bottom: this.compact ? 2 : 4
            });
            Text.borderRadius(Radius.pill);
            Text.maxLines(1);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        Text.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
/* ------------------------------------------------------------------ *
 * 按钮
 * ------------------------------------------------------------------ */
export enum BtnKind {
    Primary = "primary",
    Secondary = "secondary",
    Ghost = "ghost",
    Danger = "danger"
}
export class AppButton extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__label = new SynchedPropertySimpleOneWayPU(params.label, this, "label");
        this.__kind = new SynchedPropertySimpleOneWayPU(params.kind, this, "kind");
        this.__symbol = new SynchedPropertySimpleOneWayPU(params.symbol, this, "symbol");
        this.__disabled = new SynchedPropertySimpleOneWayPU(params.disabled, this, "disabled");
        this.__tabIndexValue = new SynchedPropertySimpleOneWayPU(params.tabIndexValue, this, "tabIndexValue");
        this.onTap = () => {
        };
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: AppButton_Params) {
        if (params.label === undefined) {
            this.__label.set('');
        }
        if (params.kind === undefined) {
            this.__kind.set(BtnKind.Secondary);
        }
        if (params.symbol === undefined) {
            this.__symbol.set('');
        }
        if (params.disabled === undefined) {
            this.__disabled.set(false);
        }
        if (params.tabIndexValue === undefined) {
            this.__tabIndexValue.set(0);
        }
        if (params.onTap !== undefined) {
            this.onTap = params.onTap;
        }
    }
    updateStateVars(params: AppButton_Params) {
        this.__label.reset(params.label);
        this.__kind.reset(params.kind);
        this.__symbol.reset(params.symbol);
        this.__disabled.reset(params.disabled);
        this.__tabIndexValue.reset(params.tabIndexValue);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__label.purgeDependencyOnElmtId(rmElmtId);
        this.__kind.purgeDependencyOnElmtId(rmElmtId);
        this.__symbol.purgeDependencyOnElmtId(rmElmtId);
        this.__disabled.purgeDependencyOnElmtId(rmElmtId);
        this.__tabIndexValue.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__label.aboutToBeDeleted();
        this.__kind.aboutToBeDeleted();
        this.__symbol.aboutToBeDeleted();
        this.__disabled.aboutToBeDeleted();
        this.__tabIndexValue.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __label: SynchedPropertySimpleOneWayPU<string>;
    get label() {
        return this.__label.get();
    }
    set label(newValue: string) {
        this.__label.set(newValue);
    }
    private __kind: SynchedPropertySimpleOneWayPU<BtnKind>;
    get kind() {
        return this.__kind.get();
    }
    set kind(newValue: BtnKind) {
        this.__kind.set(newValue);
    }
    private __symbol: SynchedPropertySimpleOneWayPU<string>;
    get symbol() {
        return this.__symbol.get();
    }
    set symbol(newValue: string) {
        this.__symbol.set(newValue);
    }
    private __disabled: SynchedPropertySimpleOneWayPU<boolean>;
    get disabled() {
        return this.__disabled.get();
    }
    set disabled(newValue: boolean) {
        this.__disabled.set(newValue);
    }
    private __tabIndexValue: SynchedPropertySimpleOneWayPU<number>;
    get tabIndexValue() {
        return this.__tabIndexValue.get();
    }
    set tabIndexValue(newValue: number) {
        this.__tabIndexValue.set(newValue);
    }
    private onTap: () => void;
    private bg(): string {
        if (this.disabled) {
            return Palette.neutralSoft;
        }
        switch (this.kind) {
            case BtnKind.Primary:
                return Palette.brand;
            case BtnKind.Danger:
                return Palette.dangerSoft;
            case BtnKind.Ghost:
                return Color.Transparent.toString();
            default:
                return Palette.cardBg;
        }
    }
    private fg(): string {
        if (this.disabled) {
            return Palette.textTertiary;
        }
        switch (this.kind) {
            case BtnKind.Primary:
                return Palette.textOnBrand;
            case BtnKind.Danger:
                return Palette.danger;
            default:
                return Palette.textPrimary;
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/common/Widgets.ets(224:5)", "entry");
            Row.alignItems(VerticalAlign.Center);
            Row.justifyContent(FlexAlign.Center);
            Row.height(36);
            Row.padding({ left: Space.lg, right: Space.lg });
            Row.backgroundColor(this.bg());
            Row.borderRadius(Radius.md);
            Row.border({
                width: this.kind === BtnKind.Primary || this.kind === BtnKind.Ghost ? 0 : 1,
                color: this.kind === BtnKind.Danger ? Palette.danger : Palette.divider
            });
            Row.opacity(this.disabled ? 0.6 : 1);
            Row.focusable(!this.disabled);
            Row.tabIndex(this.tabIndexValue);
            Row.hoverEffect(this.disabled ? HoverEffect.None : HoverEffect.Highlight);
            Row.onClick(() => {
                if (!this.disabled) {
                    this.onTap();
                }
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.symbol !== '') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.symbol);
                        Text.debugLine("entry/src/main/ets/common/Widgets.ets(226:9)", "entry");
                        Text.fontSize(FontSize.body);
                        Text.fontColor(this.fg());
                        Text.margin({ right: 6 });
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
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.label);
            Text.debugLine("entry/src/main/ets/common/Widgets.ets(231:7)", "entry");
            Text.fontSize(FontSize.body);
            Text.fontColor(this.fg());
            Text.fontWeight(this.kind === BtnKind.Primary ? FontWeight.Medium : FontWeight.Normal);
        }, Text);
        Text.pop();
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
export class FieldRow extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__label = new SynchedPropertySimpleOneWayPU(params.label, this, "label");
        this.__hint = new SynchedPropertySimpleOneWayPU(params.hint, this, "hint");
        this.__labelWidth = new SynchedPropertySimpleOneWayPU(params.labelWidth, this, "labelWidth");
        this.content = this.emptyBody;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: FieldRow_Params) {
        if (params.label === undefined) {
            this.__label.set('');
        }
        if (params.hint === undefined) {
            this.__hint.set('');
        }
        if (params.labelWidth === undefined) {
            this.__labelWidth.set(132);
        }
        if (params.content !== undefined) {
            this.content = params.content;
        }
    }
    updateStateVars(params: FieldRow_Params) {
        this.__label.reset(params.label);
        this.__hint.reset(params.hint);
        this.__labelWidth.reset(params.labelWidth);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__label.purgeDependencyOnElmtId(rmElmtId);
        this.__hint.purgeDependencyOnElmtId(rmElmtId);
        this.__labelWidth.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__label.aboutToBeDeleted();
        this.__hint.aboutToBeDeleted();
        this.__labelWidth.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __label: SynchedPropertySimpleOneWayPU<string>;
    get label() {
        return this.__label.get();
    }
    set label(newValue: string) {
        this.__label.set(newValue);
    }
    private __hint: SynchedPropertySimpleOneWayPU<string>;
    get hint() {
        return this.__hint.get();
    }
    set hint(newValue: string) {
        this.__hint.set(newValue);
    }
    private __labelWidth: SynchedPropertySimpleOneWayPU<number>;
    get labelWidth() {
        return this.__labelWidth.get();
    }
    set labelWidth(newValue: number) {
        this.__labelWidth.set(newValue);
    }
    private __content;
    emptyBody(parent = null) {
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/common/Widgets.ets(274:5)", "entry");
            Row.width('100%');
            Row.alignItems(VerticalAlign.Top);
            Row.padding({ top: Space.sm, bottom: Space.sm });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/common/Widgets.ets(275:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width(this.labelWidth);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.label);
            Text.debugLine("entry/src/main/ets/common/Widgets.ets(276:9)", "entry");
            Text.fontSize(FontSize.body);
            Text.fontColor(Palette.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.hint !== '') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.hint);
                        Text.debugLine("entry/src/main/ets/common/Widgets.ets(280:11)", "entry");
                        Text.fontSize(FontSize.caption);
                        Text.fontColor(Palette.textTertiary);
                        Text.margin({ top: 2 });
                        Text.maxLines(2);
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
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/common/Widgets.ets(290:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.content.bind(this)();
        Column.pop();
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
export class EmptyHint extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__symbol = new SynchedPropertySimpleOneWayPU(params.symbol, this, "symbol");
        this.__title = new SynchedPropertySimpleOneWayPU(params.title, this, "title");
        this.__hint = new SynchedPropertySimpleOneWayPU(params.hint, this, "hint");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: EmptyHint_Params) {
        if (params.symbol === undefined) {
            this.__symbol.set('◌');
        }
        if (params.title === undefined) {
            this.__title.set('');
        }
        if (params.hint === undefined) {
            this.__hint.set('');
        }
    }
    updateStateVars(params: EmptyHint_Params) {
        this.__symbol.reset(params.symbol);
        this.__title.reset(params.title);
        this.__hint.reset(params.hint);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__symbol.purgeDependencyOnElmtId(rmElmtId);
        this.__title.purgeDependencyOnElmtId(rmElmtId);
        this.__hint.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__symbol.aboutToBeDeleted();
        this.__title.aboutToBeDeleted();
        this.__hint.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __symbol: SynchedPropertySimpleOneWayPU<string>;
    get symbol() {
        return this.__symbol.get();
    }
    set symbol(newValue: string) {
        this.__symbol.set(newValue);
    }
    private __title: SynchedPropertySimpleOneWayPU<string>;
    get title() {
        return this.__title.get();
    }
    set title(newValue: string) {
        this.__title.set(newValue);
    }
    private __hint: SynchedPropertySimpleOneWayPU<string>;
    get hint() {
        return this.__hint.get();
    }
    set hint(newValue: string) {
        this.__hint.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/common/Widgets.ets(313:5)", "entry");
            Column.width('100%');
            Column.padding({ top: 40, bottom: 40 });
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.symbol);
            Text.debugLine("entry/src/main/ets/common/Widgets.ets(314:7)", "entry");
            Text.fontSize(40);
            Text.fontColor(Palette.textTertiary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.title);
            Text.debugLine("entry/src/main/ets/common/Widgets.ets(317:7)", "entry");
            Text.fontSize(FontSize.body);
            Text.fontColor(Palette.textSecondary);
            Text.margin({ top: Space.sm });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.hint !== '') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.hint);
                        Text.debugLine("entry/src/main/ets/common/Widgets.ets(322:9)", "entry");
                        Text.fontSize(FontSize.small);
                        Text.fontColor(Palette.textTertiary);
                        Text.margin({ top: Space.xs });
                        Text.textAlign(TextAlign.Center);
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
    }
    rerender() {
        this.updateDirtyElements();
    }
}
export class KeyValueRow extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__label = new SynchedPropertySimpleOneWayPU(params.label, this, "label");
        this.__value = new SynchedPropertySimpleOneWayPU(params.value, this, "value");
        this.__tone = new SynchedPropertySimpleOneWayPU(params.tone, this, "tone");
        this.__divided = new SynchedPropertySimpleOneWayPU(params.divided, this, "divided");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: KeyValueRow_Params) {
        if (params.label === undefined) {
            this.__label.set('');
        }
        if (params.value === undefined) {
            this.__value.set('');
        }
        if (params.tone === undefined) {
            this.__tone.set(ToneKind.Neutral);
        }
        if (params.divided === undefined) {
            this.__divided.set(false);
        }
    }
    updateStateVars(params: KeyValueRow_Params) {
        this.__label.reset(params.label);
        this.__value.reset(params.value);
        this.__tone.reset(params.tone);
        this.__divided.reset(params.divided);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__label.purgeDependencyOnElmtId(rmElmtId);
        this.__value.purgeDependencyOnElmtId(rmElmtId);
        this.__tone.purgeDependencyOnElmtId(rmElmtId);
        this.__divided.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__label.aboutToBeDeleted();
        this.__value.aboutToBeDeleted();
        this.__tone.aboutToBeDeleted();
        this.__divided.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __label: SynchedPropertySimpleOneWayPU<string>;
    get label() {
        return this.__label.get();
    }
    set label(newValue: string) {
        this.__label.set(newValue);
    }
    private __value: SynchedPropertySimpleOneWayPU<string>;
    get value() {
        return this.__value.get();
    }
    set value(newValue: string) {
        this.__value.set(newValue);
    }
    private __tone: SynchedPropertySimpleOneWayPU<ToneKind>;
    get tone() {
        return this.__tone.get();
    }
    set tone(newValue: ToneKind) {
        this.__tone.set(newValue);
    }
    private __divided: SynchedPropertySimpleOneWayPU<boolean>;
    get divided() {
        return this.__divided.get();
    }
    set divided(newValue: boolean) {
        this.__divided.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/common/Widgets.ets(348:5)", "entry");
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.divided) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Divider.create();
                        Divider.debugLine("entry/src/main/ets/common/Widgets.ets(350:9)", "entry");
                        Divider.color(Palette.divider);
                        Divider.strokeWidth(1);
                    }, Divider);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/common/Widgets.ets(352:7)", "entry");
            Row.width('100%');
            Row.padding({ top: Space.sm, bottom: Space.sm });
            Row.alignItems(VerticalAlign.Center);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.label);
            Text.debugLine("entry/src/main/ets/common/Widgets.ets(353:9)", "entry");
            Text.fontSize(FontSize.body);
            Text.fontColor(Palette.textSecondary);
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.value);
            Text.debugLine("entry/src/main/ets/common/Widgets.ets(357:9)", "entry");
            Text.fontSize(FontSize.body);
            Text.fontColor(toneColor(this.tone));
            Text.fontWeight(FontWeight.Medium);
            Text.textAlign(TextAlign.End);
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
