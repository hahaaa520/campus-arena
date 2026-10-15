/**
 * 校园赛程编排器 (Campus Arena) —— 参赛队伍管理
 */

import { AppModel } from '../model/AppModel';
import { Team } from '../model/Types';
import { FontSize, Palette, Radius, Space, ToneKind } from '../common/Theme';
import { AppButton, BtnKind, CardSection, EmptyHint, FieldRow, Pill } from '../common/Widgets';

@Component
export struct TeamsView {
  @ObjectLink model: AppModel;
  onChanged: () => void = () => {
  };
  notify: (msg: string) => void = () => {
  };

  @State draftName: string = '';
  @State draftCollege: string = '';
  @State editingId: string = '';
  @State editName: string = '';
  @State editCollege: string = '';
  @State editSeed: string = '';

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

  @Builder
  addCard() {
    Column({ space: Space.md }) {
      Row({ space: Space.md }) {
        TextInput({ text: this.draftName, placeholder: '队伍名称，例如「计算机学院」' })
          .layoutWeight(2)
          .height(40)
          .fontSize(FontSize.body)
          .backgroundColor(Palette.inputBg)
          .borderRadius(Radius.md)
          .onChange((value: string) => {
            this.draftName = value;
          })
          .onSubmit(() => this.addTeam())

        TextInput({ text: this.draftCollege, placeholder: '所属院系 / 单位（可选）' })
          .layoutWeight(3)
          .height(40)
          .fontSize(FontSize.body)
          .backgroundColor(Palette.inputBg)
          .borderRadius(Radius.md)
          .onChange((value: string) => {
            this.draftCollege = value;
          })
          .onSubmit(() => this.addTeam())

        AppButton({
          label: '添加队伍',
          kind: BtnKind.Primary,
          symbol: '＋',
          tabIndexValue: 3,
          onTap: () => this.addTeam()
        })
      }
      .width('100%')

      Row({ space: Space.sm }) {
        Text('提示：队伍总数需为 2 支以上；种子序号用于淘汰赛排位，留空表示非种子队。')
          .fontSize(FontSize.caption)
          .fontColor(Palette.textTertiary)
      }
      .width('100%')
    }
    .width('100%')
  }

  @Builder
  headerRow() {
    Row() {
      Text('#').fontSize(FontSize.small).fontColor(Palette.textTertiary).width(48)
      Text('队伍名称').fontSize(FontSize.small).fontColor(Palette.textTertiary).layoutWeight(3)
      Text('所属院系').fontSize(FontSize.small).fontColor(Palette.textTertiary).layoutWeight(3)
      Text('种子').fontSize(FontSize.small).fontColor(Palette.textTertiary).width(96)
      Text('操作').fontSize(FontSize.small).fontColor(Palette.textTertiary).width(160)
    }
    .width('100%')
    .padding({ top: Space.sm, bottom: Space.sm })
    .border({ width: { bottom: 1 }, color: { bottom: Palette.divider } })
  }

  @Builder
  dataRow(t: Team, index: number) {
    Row() {
      Text(`${index + 1}`)
        .fontSize(FontSize.body)
        .fontColor(Palette.textTertiary)
        .width(48)

      if (this.editingId === t.id) {
        TextInput({ text: this.editName })
          .layoutWeight(3)
          .height(36)
          .fontSize(FontSize.body)
          .backgroundColor(Palette.inputBg)
          .borderRadius(Radius.sm)
          .margin({ right: Space.sm })
          .onChange((value: string) => {
            this.editName = value;
          })
        TextInput({ text: this.editCollege, placeholder: '院系' })
          .layoutWeight(3)
          .height(36)
          .fontSize(FontSize.body)
          .backgroundColor(Palette.inputBg)
          .borderRadius(Radius.sm)
          .margin({ right: Space.sm })
          .onChange((value: string) => {
            this.editCollege = value;
          })
        TextInput({ text: this.editSeed, placeholder: '种子' })
          .width(96)
          .height(36)
          .type(InputType.Number)
          .fontSize(FontSize.body)
          .backgroundColor(Palette.inputBg)
          .borderRadius(Radius.sm)
          .onChange((value: string) => {
            this.editSeed = value;
          })
        Row({ space: Space.sm }) {
          AppButton({ label: '保存', kind: BtnKind.Primary, onTap: () => this.commitEdit() })
          AppButton({
            label: '取消',
            kind: BtnKind.Ghost,
            onTap: () => {
              this.editingId = '';
            }
          })
        }
        .width(160)
        .justifyContent(FlexAlign.End)
      } else {
        Text(t.name)
          .fontSize(FontSize.body)
          .fontColor(Palette.textPrimary)
          .fontWeight(FontWeight.Medium)
          .layoutWeight(3)
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
        Text(t.college === '' ? '—' : t.college)
          .fontSize(FontSize.body)
          .fontColor(Palette.textSecondary)
          .layoutWeight(3)
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
        Row() {
          Pill({
            text: this.seedLabel(t.seed),
            tone: t.seed > 0 ? ToneKind.Brand : ToneKind.Neutral,
            compact: true
          })
        }
        .width(96)
        Row({ space: Space.sm }) {
          AppButton({ label: '编辑', kind: BtnKind.Secondary, onTap: () => this.beginEdit(t) })
          AppButton({ label: '删除', kind: BtnKind.Danger, onTap: () => this.removeTeam(t) })
        }
        .width(160)
        .justifyContent(FlexAlign.End)
      }
    }
    .width('100%')
    .constraintSize({ minHeight: 52 })
    .alignItems(VerticalAlign.Center)
    .padding({ top: Space.sm, bottom: Space.sm })
    .border({ width: { bottom: 1 }, color: { bottom: Palette.divider } })
  }

  build() {
    Column({ space: Space.lg }) {
      CardSection({ title: '添加队伍', subtitle: '支持键盘操作：输入后按回车即可快速添加' }) {
        this.addCard()
      }

      CardSection({
        title: `队伍名单（${this.model.teams.length} 支）`,
        subtitle: '删除队伍时会同时移除该队已生成的比赛'
      }) {
        Column() {
          if (this.model.teams.length === 0) {
            EmptyHint({
              symbol: '☷',
              title: '还没有队伍',
              hint: '至少添加 2 支队伍后，才能到「赛程编排」生成对阵。'
            })
          } else {
            this.headerRow()
            ForEach(this.model.teams, (t: Team, index: number) => {
              this.dataRow(t, index)
            }, (t: Team) => t.id)
          }
        }
        .width('100%')
      }

      CardSection({ title: '下一步', subtitle: '' }) {
        Row({ space: Space.sm }) {
          Pill({ text: `当前 ${this.model.teams.length} 支队伍`, tone: ToneKind.Neutral })
          Text(this.model.teams.length < 2
            ? '队伍不足 2 支，无法生成赛程。'
            : '队伍已就绪，可到「赛程编排」生成对阵与排期。')
            .fontSize(FontSize.small)
            .fontColor(Palette.textSecondary)
        }
        .width('100%')
      }
    }
    .width('100%')
  }
}
