if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface TeamsView_Params {
    model?: AppModel;
    onChanged?: () => void;
    notify?: (msg: string) => void;
    draftName?: string;
    draftCollege?: string;
    editingId?: string;
    editName?: string;
    editCollege?: string;
    editSeed?: string;
}
import type { AppModel } from '../model/AppModel';
import type { Team } from '../model/Types';
import { FontSize, Palette, Radius, Space, ToneKind } from "@normalized:N&&&entry/src/main/ets/common/Theme&";
import { AppButton, BtnKind, CardSection, EmptyHint, Pill } from "@normalized:N&&&entry/src/main/ets/common/Widgets&";
export class TeamsView extends ViewPU {
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
        this.__draftName = new ObservedPropertySimplePU('', this, "draftName");
        this.__draftCollege = new ObservedPropertySimplePU('', this, "draftCollege");
        this.__editingId = new ObservedPropertySimplePU('', this, "editingId");
        this.__editName = new ObservedPropertySimplePU('', this, "editName");
        this.__editCollege = new ObservedPropertySimplePU('', this, "editCollege");
        this.__editSeed = new ObservedPropertySimplePU('', this, "editSeed");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: TeamsView_Params) {
        this.__model.set(params.model);
        if (params.onChanged !== undefined) {
            this.onChanged = params.onChanged;
        }
        if (params.notify !== undefined) {
            this.notify = params.notify;
        }
        if (params.draftName !== undefined) {
            this.draftName = params.draftName;
        }
        if (params.draftCollege !== undefined) {
            this.draftCollege = params.draftCollege;
        }
        if (params.editingId !== undefined) {
            this.editingId = params.editingId;
        }
        if (params.editName !== undefined) {
            this.editName = params.editName;
        }
        if (params.editCollege !== undefined) {
            this.editCollege = params.editCollege;
        }
        if (params.editSeed !== undefined) {
            this.editSeed = params.editSeed;
        }
    }
    updateStateVars(params: TeamsView_Params) {
        this.__model.set(params.model);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__model.purgeDependencyOnElmtId(rmElmtId);
        this.__draftName.purgeDependencyOnElmtId(rmElmtId);
        this.__draftCollege.purgeDependencyOnElmtId(rmElmtId);
        this.__editingId.purgeDependencyOnElmtId(rmElmtId);
        this.__editName.purgeDependencyOnElmtId(rmElmtId);
        this.__editCollege.purgeDependencyOnElmtId(rmElmtId);
        this.__editSeed.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__model.aboutToBeDeleted();
        this.__draftName.aboutToBeDeleted();
        this.__draftCollege.aboutToBeDeleted();
        this.__editingId.aboutToBeDeleted();
        this.__editName.aboutToBeDeleted();
        this.__editCollege.aboutToBeDeleted();
        this.__editSeed.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __model: SynchedPropertyNesedObjectPU<AppModel>;
    get model() {
        return this.__model.get();
    }
    private onChanged: () => void;
    private notify: (msg: string) => void;
    private __draftName: ObservedPropertySimplePU<string>;
    get draftName() {
        return this.__draftName.get();
    }
    set draftName(newValue: string) {
        this.__draftName.set(newValue);
    }
    private __draftCollege: ObservedPropertySimplePU<string>;
    get draftCollege() {
        return this.__draftCollege.get();
    }
    set draftCollege(newValue: string) {
        this.__draftCollege.set(newValue);
    }
    private __editingId: ObservedPropertySimplePU<string>;
    get editingId() {
        return this.__editingId.get();
    }
    set editingId(newValue: string) {
        this.__editingId.set(newValue);
    }
    private __editName: ObservedPropertySimplePU<string>;
    get editName() {
        return this.__editName.get();
    }
    set editName(newValue: string) {
        this.__editName.set(newValue);
    }
    private __editCollege: ObservedPropertySimplePU<string>;
    get editCollege() {
        return this.__editCollege.get();
    }
    set editCollege(newValue: string) {
        this.__editCollege.set(newValue);
    }
    private __editSeed: ObservedPropertySimplePU<string>;
    get editSeed() {
        return this.__editSeed.get();
    }
    set editSeed(newValue: string) {
        this.__editSeed.set(newValue);
    }
    private addTeam(): void {
        const name: string = this.draftName.trim();
        if (name === '') {
            this.notify('请先填写队伍名称。');
            return;
        }
        for (let i = 0; i < this.model.teams.length; i++) {
            if (this.model.teams[i].name === name) {
                this.notify(`「${name}」已存在，请勿重复添加。`);
                return;
            }
        }
        this.model.addTeam(name, this.draftCollege.trim());
        this.draftName = '';
        this.draftCollege = '';
        this.onChanged();
        this.notify(`已添加「${name}」。`);
    }
    private beginEdit(t: Team): void {
        this.editingId = t.id;
        this.editName = t.name;
        this.editCollege = t.college;
        this.editSeed = t.seed > 0 ? `${t.seed}` : '';
    }
    private commitEdit(): void {
        const name: string = this.editName.trim();
        if (name === '') {
            this.notify('队伍名称不能为空。');
            return;
        }
        const seedRaw: number = Number.parseInt(this.editSeed, 10);
        const seed: number = Number.isNaN(seedRaw) || seedRaw < 0 ? 0 : seedRaw;
        this.model.updateTeam(this.editingId, name, this.editCollege.trim(), seed);
        this.editingId = '';
        this.onChanged();
        this.notify('已保存修改。');
    }
    private removeTeam(t: Team): void {
        this.model.removeTeam(t.id);
        if (this.editingId === t.id) {
            this.editingId = '';
        }
        this.onChanged();
        this.notify(`已删除「${t.name}」，相关比赛也已一并移除。`);
    }
    private seedLabel(seed: number): string {
        return seed > 0 ? `种子 ${seed}` : '非种子';
    }
    addCard(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: Space.md });
            Column.debugLine("entry/src/main/ets/view/TeamsView.ets(80:5)", "entry");
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: Space.md });
            Row.debugLine("entry/src/main/ets/view/TeamsView.ets(81:7)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.draftName, placeholder: '队伍名称，例如「计算机学院」' });
            TextInput.debugLine("entry/src/main/ets/view/TeamsView.ets(82:9)", "entry");
            TextInput.layoutWeight(2);
            TextInput.height(40);
            TextInput.fontSize(FontSize.body);
            TextInput.backgroundColor(Palette.inputBg);
            TextInput.borderRadius(Radius.md);
            TextInput.onChange((value: string) => {
                this.draftName = value;
            });
            TextInput.onSubmit(() => this.addTeam());
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.draftCollege, placeholder: '所属院系 / 单位（可选）' });
            TextInput.debugLine("entry/src/main/ets/view/TeamsView.ets(93:9)", "entry");
            TextInput.layoutWeight(3);
            TextInput.height(40);
            TextInput.fontSize(FontSize.body);
            TextInput.backgroundColor(Palette.inputBg);
            TextInput.borderRadius(Radius.md);
            TextInput.onChange((value: string) => {
                this.draftCollege = value;
            });
            TextInput.onSubmit(() => this.addTeam());
        }, TextInput);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new AppButton(this, {
                        label: '添加队伍',
                        kind: BtnKind.Primary,
                        symbol: '＋',
                        tabIndexValue: 3,
                        onTap: () => this.addTeam()
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/TeamsView.ets", line: 104, col: 9 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            label: '添加队伍',
                            kind: BtnKind.Primary,
                            symbol: '＋',
                            tabIndexValue: 3,
                            onTap: () => this.addTeam()
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        label: '添加队伍',
                        kind: BtnKind.Primary,
                        symbol: '＋',
                        tabIndexValue: 3
                    });
                }
            }, { name: "AppButton" });
        }
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: Space.sm });
            Row.debugLine("entry/src/main/ets/view/TeamsView.ets(114:7)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('提示：队伍总数需为 2 支以上；种子序号用于淘汰赛排位，留空表示非种子队。');
            Text.debugLine("entry/src/main/ets/view/TeamsView.ets(115:9)", "entry");
            Text.fontSize(FontSize.caption);
            Text.fontColor(Palette.textTertiary);
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
    }
    headerRow(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/view/TeamsView.ets(126:5)", "entry");
            Row.width('100%');
            Row.padding({ top: Space.sm, bottom: Space.sm });
            Row.border({ width: { bottom: 1 }, color: { bottom: Palette.divider } });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('#');
            Text.debugLine("entry/src/main/ets/view/TeamsView.ets(127:7)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.width(48);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('队伍名称');
            Text.debugLine("entry/src/main/ets/view/TeamsView.ets(128:7)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.layoutWeight(3);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('所属院系');
            Text.debugLine("entry/src/main/ets/view/TeamsView.ets(129:7)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.layoutWeight(3);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('种子');
            Text.debugLine("entry/src/main/ets/view/TeamsView.ets(130:7)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.width(96);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('操作');
            Text.debugLine("entry/src/main/ets/view/TeamsView.ets(131:7)", "entry");
            Text.fontSize(FontSize.small);
            Text.fontColor(Palette.textTertiary);
            Text.width(160);
        }, Text);
        Text.pop();
        Row.pop();
    }
    dataRow(t: Team, index: number, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/view/TeamsView.ets(140:5)", "entry");
            Row.width('100%');
            Row.constraintSize({ minHeight: 52 });
            Row.alignItems(VerticalAlign.Center);
            Row.padding({ top: Space.sm, bottom: Space.sm });
            Row.border({ width: { bottom: 1 }, color: { bottom: Palette.divider } });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${index + 1}`);
            Text.debugLine("entry/src/main/ets/view/TeamsView.ets(141:7)", "entry");
            Text.fontSize(FontSize.body);
            Text.fontColor(Palette.textTertiary);
            Text.width(48);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.editingId === t.id) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextInput.create({ text: this.editName });
                        TextInput.debugLine("entry/src/main/ets/view/TeamsView.ets(147:9)", "entry");
                        TextInput.layoutWeight(3);
                        TextInput.height(36);
                        TextInput.fontSize(FontSize.body);
                        TextInput.backgroundColor(Palette.inputBg);
                        TextInput.borderRadius(Radius.sm);
                        TextInput.margin({ right: Space.sm });
                        TextInput.onChange((value: string) => {
                            this.editName = value;
                        });
                    }, TextInput);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextInput.create({ text: this.editCollege, placeholder: '院系' });
                        TextInput.debugLine("entry/src/main/ets/view/TeamsView.ets(157:9)", "entry");
                        TextInput.layoutWeight(3);
                        TextInput.height(36);
                        TextInput.fontSize(FontSize.body);
                        TextInput.backgroundColor(Palette.inputBg);
                        TextInput.borderRadius(Radius.sm);
                        TextInput.margin({ right: Space.sm });
                        TextInput.onChange((value: string) => {
                            this.editCollege = value;
                        });
                    }, TextInput);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextInput.create({ text: this.editSeed, placeholder: '种子' });
                        TextInput.debugLine("entry/src/main/ets/view/TeamsView.ets(167:9)", "entry");
                        TextInput.width(96);
                        TextInput.height(36);
                        TextInput.type(InputType.Number);
                        TextInput.fontSize(FontSize.body);
                        TextInput.backgroundColor(Palette.inputBg);
                        TextInput.borderRadius(Radius.sm);
                        TextInput.onChange((value: string) => {
                            this.editSeed = value;
                        });
                    }, TextInput);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create({ space: Space.sm });
                        Row.debugLine("entry/src/main/ets/view/TeamsView.ets(177:9)", "entry");
                        Row.width(160);
                        Row.justifyContent(FlexAlign.End);
                    }, Row);
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new AppButton(this, { label: '保存', kind: BtnKind.Primary, onTap: () => this.commitEdit() }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/TeamsView.ets", line: 178, col: 11 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        label: '保存',
                                        kind: BtnKind.Primary,
                                        onTap: () => this.commitEdit()
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
                                let componentCall = new AppButton(this, {
                                    label: '取消',
                                    kind: BtnKind.Ghost,
                                    onTap: () => {
                                        this.editingId = '';
                                    }
                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/TeamsView.ets", line: 179, col: 11 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        label: '取消',
                                        kind: BtnKind.Ghost,
                                        onTap: () => {
                                            this.editingId = '';
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
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(t.name);
                        Text.debugLine("entry/src/main/ets/view/TeamsView.ets(190:9)", "entry");
                        Text.fontSize(FontSize.body);
                        Text.fontColor(Palette.textPrimary);
                        Text.fontWeight(FontWeight.Medium);
                        Text.layoutWeight(3);
                        Text.maxLines(1);
                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(t.college === '' ? '—' : t.college);
                        Text.debugLine("entry/src/main/ets/view/TeamsView.ets(197:9)", "entry");
                        Text.fontSize(FontSize.body);
                        Text.fontColor(Palette.textSecondary);
                        Text.layoutWeight(3);
                        Text.maxLines(1);
                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/TeamsView.ets(203:9)", "entry");
                        Row.width(96);
                    }, Row);
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new Pill(this, {
                                    text: this.seedLabel(t.seed),
                                    tone: t.seed > 0 ? ToneKind.Brand : ToneKind.Neutral,
                                    compact: true
                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/TeamsView.ets", line: 204, col: 11 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        text: this.seedLabel(t.seed),
                                        tone: t.seed > 0 ? ToneKind.Brand : ToneKind.Neutral,
                                        compact: true
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    text: this.seedLabel(t.seed),
                                    tone: t.seed > 0 ? ToneKind.Brand : ToneKind.Neutral,
                                    compact: true
                                });
                            }
                        }, { name: "Pill" });
                    }
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create({ space: Space.sm });
                        Row.debugLine("entry/src/main/ets/view/TeamsView.ets(211:9)", "entry");
                        Row.width(160);
                        Row.justifyContent(FlexAlign.End);
                    }, Row);
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new AppButton(this, { label: '编辑', kind: BtnKind.Secondary, onTap: () => this.beginEdit(t) }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/TeamsView.ets", line: 212, col: 11 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        label: '编辑',
                                        kind: BtnKind.Secondary,
                                        onTap: () => this.beginEdit(t)
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    label: '编辑', kind: BtnKind.Secondary
                                });
                            }
                        }, { name: "AppButton" });
                    }
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new AppButton(this, { label: '删除', kind: BtnKind.Danger, onTap: () => this.removeTeam(t) }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/TeamsView.ets", line: 213, col: 11 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        label: '删除',
                                        kind: BtnKind.Danger,
                                        onTap: () => this.removeTeam(t)
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
                    Row.pop();
                });
            }
        }, If);
        If.pop();
        Row.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: Space.lg });
            Column.debugLine("entry/src/main/ets/view/TeamsView.ets(227:5)", "entry");
            Column.width('100%');
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new CardSection(this, {
                        title: '添加队伍', subtitle: '支持键盘操作：输入后按回车即可快速添加',
                        content: () => {
                            this.addCard.bind(this)();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/TeamsView.ets", line: 228, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            title: '添加队伍',
                            subtitle: '支持键盘操作：输入后按回车即可快速添加',
                            content: () => {
                                this.addCard.bind(this)();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        title: '添加队伍', subtitle: '支持键盘操作：输入后按回车即可快速添加'
                    });
                }
            }, { name: "CardSection" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new CardSection(this, {
                        title: `队伍名单（${this.model.teams.length} 支）`,
                        subtitle: '删除队伍时会同时移除该队已生成的比赛',
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.debugLine("entry/src/main/ets/view/TeamsView.ets(236:9)", "entry");
                                Column.width('100%');
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                If.create();
                                if (this.model.teams.length === 0) {
                                    this.ifElseBranchUpdateFunction(0, () => {
                                        {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                if (isInitialRender) {
                                                    let componentCall = new EmptyHint(this, {
                                                        symbol: '☷',
                                                        title: '还没有队伍',
                                                        hint: '至少添加 2 支队伍后，才能到「赛程编排」生成对阵。'
                                                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/TeamsView.ets", line: 238, col: 13 });
                                                    ViewPU.create(componentCall);
                                                    let paramsLambda = () => {
                                                        return {
                                                            symbol: '☷',
                                                            title: '还没有队伍',
                                                            hint: '至少添加 2 支队伍后，才能到「赛程编排」生成对阵。'
                                                        };
                                                    };
                                                    componentCall.paramsGenerator_ = paramsLambda;
                                                }
                                                else {
                                                    this.updateStateVarsOfChildByElmtId(elmtId, {
                                                        symbol: '☷',
                                                        title: '还没有队伍',
                                                        hint: '至少添加 2 支队伍后，才能到「赛程编排」生成对阵。'
                                                    });
                                                }
                                            }, { name: "EmptyHint" });
                                        }
                                    });
                                }
                                else {
                                    this.ifElseBranchUpdateFunction(1, () => {
                                        this.headerRow.bind(this)();
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            ForEach.create();
                                            const forEachItemGenFunction = (_item, index: number) => {
                                                const t = _item;
                                                this.dataRow.bind(this)(t, index);
                                            };
                                            this.forEachUpdateFunction(elmtId, this.model.teams, forEachItemGenFunction, (t: Team) => t.id, true, false);
                                        }, ForEach);
                                        ForEach.pop();
                                    });
                                }
                            }, If);
                            If.pop();
                            Column.pop();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/TeamsView.ets", line: 232, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            title: `队伍名单（${this.model.teams.length} 支）`,
                            subtitle: '删除队伍时会同时移除该队已生成的比赛',
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create();
                                    Column.debugLine("entry/src/main/ets/view/TeamsView.ets(236:9)", "entry");
                                    Column.width('100%');
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    If.create();
                                    if (this.model.teams.length === 0) {
                                        this.ifElseBranchUpdateFunction(0, () => {
                                            {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    if (isInitialRender) {
                                                        let componentCall = new EmptyHint(this, {
                                                            symbol: '☷',
                                                            title: '还没有队伍',
                                                            hint: '至少添加 2 支队伍后，才能到「赛程编排」生成对阵。'
                                                        }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/TeamsView.ets", line: 238, col: 13 });
                                                        ViewPU.create(componentCall);
                                                        let paramsLambda = () => {
                                                            return {
                                                                symbol: '☷',
                                                                title: '还没有队伍',
                                                                hint: '至少添加 2 支队伍后，才能到「赛程编排」生成对阵。'
                                                            };
                                                        };
                                                        componentCall.paramsGenerator_ = paramsLambda;
                                                    }
                                                    else {
                                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                                            symbol: '☷',
                                                            title: '还没有队伍',
                                                            hint: '至少添加 2 支队伍后，才能到「赛程编排」生成对阵。'
                                                        });
                                                    }
                                                }, { name: "EmptyHint" });
                                            }
                                        });
                                    }
                                    else {
                                        this.ifElseBranchUpdateFunction(1, () => {
                                            this.headerRow.bind(this)();
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                ForEach.create();
                                                const forEachItemGenFunction = (_item, index: number) => {
                                                    const t = _item;
                                                    this.dataRow.bind(this)(t, index);
                                                };
                                                this.forEachUpdateFunction(elmtId, this.model.teams, forEachItemGenFunction, (t: Team) => t.id, true, false);
                                            }, ForEach);
                                            ForEach.pop();
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
                        title: `队伍名单（${this.model.teams.length} 支）`,
                        subtitle: '删除队伍时会同时移除该队已生成的比赛'
                    });
                }
            }, { name: "CardSection" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new CardSection(this, {
                        title: '下一步', subtitle: '',
                        content: () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create({ space: Space.sm });
                                Row.debugLine("entry/src/main/ets/view/TeamsView.ets(254:9)", "entry");
                                Row.width('100%');
                            }, Row);
                            {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    if (isInitialRender) {
                                        let componentCall = new Pill(this, { text: `当前 ${this.model.teams.length} 支队伍`, tone: ToneKind.Neutral }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/TeamsView.ets", line: 255, col: 11 });
                                        ViewPU.create(componentCall);
                                        let paramsLambda = () => {
                                            return {
                                                text: `当前 ${this.model.teams.length} 支队伍`,
                                                tone: ToneKind.Neutral
                                            };
                                        };
                                        componentCall.paramsGenerator_ = paramsLambda;
                                    }
                                    else {
                                        this.updateStateVarsOfChildByElmtId(elmtId, {
                                            text: `当前 ${this.model.teams.length} 支队伍`, tone: ToneKind.Neutral
                                        });
                                    }
                                }, { name: "Pill" });
                            }
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(this.model.teams.length < 2
                                    ? '队伍不足 2 支，无法生成赛程。'
                                    : '队伍已就绪，可到「赛程编排」生成对阵与排期。');
                                Text.debugLine("entry/src/main/ets/view/TeamsView.ets(256:11)", "entry");
                                Text.fontSize(FontSize.small);
                                Text.fontColor(Palette.textSecondary);
                            }, Text);
                            Text.pop();
                            Row.pop();
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/TeamsView.ets", line: 253, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            title: '下一步',
                            subtitle: '',
                            content: () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create({ space: Space.sm });
                                    Row.debugLine("entry/src/main/ets/view/TeamsView.ets(254:9)", "entry");
                                    Row.width('100%');
                                }, Row);
                                {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        if (isInitialRender) {
                                            let componentCall = new Pill(this, { text: `当前 ${this.model.teams.length} 支队伍`, tone: ToneKind.Neutral }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/view/TeamsView.ets", line: 255, col: 11 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    text: `当前 ${this.model.teams.length} 支队伍`,
                                                    tone: ToneKind.Neutral
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                text: `当前 ${this.model.teams.length} 支队伍`, tone: ToneKind.Neutral
                                            });
                                        }
                                    }, { name: "Pill" });
                                }
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(this.model.teams.length < 2
                                        ? '队伍不足 2 支，无法生成赛程。'
                                        : '队伍已就绪，可到「赛程编排」生成对阵与排期。');
                                    Text.debugLine("entry/src/main/ets/view/TeamsView.ets(256:11)", "entry");
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
                        title: '下一步', subtitle: ''
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
