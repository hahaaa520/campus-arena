/**
 * 校园赛程编排器 (Campus Arena) —— 赛事配置
 *
 * 规则、时段与场地。所有修改即时反映到模型中，离开输入框时落盘。
 */

import { AppModel } from '../model/AppModel';
import {
  MatchFormat,
  SportKind,
  Venue,
  addDays,
  allFormats,
  allSports,
  formatHint,
  formatLabel,
  formatClock,
  parseClock,
  sportLabel,
  todayIso,
  weekdayLabel
} from '../model/Types';
import { FontSize, Palette, Radius, Space, ToneKind } from '../common/Theme';
import { AppButton, BtnKind, CardSection, FieldRow, Pill } from '../common/Widgets';

@Component
export struct SetupView {
  @ObjectLink model: AppModel;
  onChanged: () => void = () => {
  };
  notify: (msg: string) => void = () => {
  };

  @State draftVenue: string = '';
  @State editingVenueId: string = '';
  @State editingVenueName: string = '';
  @State dateDraft: string = '';
  @State startDraft: string = '';
  @State endDraft: string = '';

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

  @Builder
  numberStepper(label: string, unit: string, value: number, onMinus: () => void, onPlus: () => void) {
    Row({ space: Space.sm }) {
      AppButton({ label: '－', kind: BtnKind.Secondary, onTap: () => onMinus() })
      Text(`${value} ${unit}`)
        .fontSize(FontSize.body)
        .fontColor(Palette.textPrimary)
        .width(96)
        .textAlign(TextAlign.Center)
      AppButton({ label: '＋', kind: BtnKind.Secondary, onTap: () => onPlus() })
    }
    .alignItems(VerticalAlign.Center)
  }

  @Builder
  basicCard() {
    Column() {
      FieldRow({ label: '赛事名称', hint: '会显示在总览页与导出文件中' }) {
        TextInput({ text: this.model.config.name, placeholder: '例如：2026 年「学院杯」篮球赛' })
          .width('100%')
          .height(40)
          .fontSize(FontSize.body)
          .backgroundColor(Palette.inputBg)
          .borderRadius(Radius.md)
          .onChange((value: string) => {
            this.model.patchConfig({ name: value });
          })
          .onBlur(() => this.onChanged())
          .onSubmit(() => this.onChanged())
      }

      FieldRow({ label: '比赛项目', hint: '仅影响文案展示，不改变赛制算法' }) {
        Row({ space: Space.sm }) {
          ForEach(allSports(), (s: SportKind) => {
            Text(sportLabel(s))
              .fontSize(FontSize.small)
              .fontColor(this.model.config.sport === s ? Palette.textOnBrand : Palette.textSecondary)
              .backgroundColor(this.model.config.sport === s ? Palette.brand : Palette.inputBg)
              .padding({ left: Space.md, right: Space.md, top: 6, bottom: 6 })
              .borderRadius(Radius.pill)
              .focusable(true)
              .hoverEffect(HoverEffect.Highlight)
              .onClick(() => {
                this.model.patchConfig({ sport: s });
                this.onChanged();
              })
          }, (s: SportKind) => s)
        }
      }

      FieldRow({ label: '竞赛赛制', hint: formatHint(this.model.config.format) }) {
        Row({ space: Space.sm }) {
          ForEach(allFormats(), (f: MatchFormat) => {
            Text(formatLabel(f))
              .fontSize(FontSize.small)
              .fontColor(this.model.config.format === f ? Palette.textOnBrand : Palette.textSecondary)
              .backgroundColor(this.model.config.format === f ? Palette.brand : Palette.inputBg)
              .padding({ left: Space.md, right: Space.md, top: 6, bottom: 6 })
              .borderRadius(Radius.pill)
              .focusable(true)
              .hoverEffect(HoverEffect.Highlight)
              .onClick(() => {
                this.model.patchConfig({ format: f });
                this.onChanged();
              })
          }, (f: MatchFormat) => f)
        }
      }

      if (this.model.config.format === MatchFormat.GroupKnockout) {
        FieldRow({ label: '分组数', hint: `按 ${this.model.teams.length} 支队伍计算，最多 ${Math.max(1, Math.floor(this.model.teams.length / 2))} 组` }) {
          this.numberStepper('分组数', '组', this.model.config.groupCount,
            () => this.bumpGroups(-1), () => this.bumpGroups(1))
        }
        FieldRow({ label: '每组出线', hint: '各组前若干名进入交叉淘汰赛' }) {
          this.numberStepper('每组出线', '支', this.model.config.advancePerGroup,
            () => this.bumpAdvance(-1), () => this.bumpAdvance(1))
        }
      }
    }
    .width('100%')
  }

  @Builder
  timingCard() {
    Column() {
      FieldRow({ label: '单场时长', hint: '含热身与暂停的总占用时间' }) {
        this.numberStepper('单场时长', '分钟', this.model.config.matchMinutes,
          () => this.bumpMinutes(-10), () => this.bumpMinutes(10))
      }
      FieldRow({ label: '场间间隔', hint: '同一场地两场比赛之间的整理时间' }) {
        this.numberStepper('场间间隔', '分钟', this.model.config.breakMinutes,
          () => this.bumpBreak(-5), () => this.bumpBreak(5))
      }
      FieldRow({ label: '同队最小休息', hint: '低于此间隔会被标记为「休息不足」提醒' }) {
        this.numberStepper('同队最小休息', '分钟', this.model.config.restMinutes,
          () => this.bumpRest(-15), () => this.bumpRest(15))
      }
      FieldRow({ label: '比赛天数', hint: '赛期跨度，超出会被标记为冲突' }) {
        this.numberStepper('比赛天数', '天', this.model.config.days,
          () => this.bumpDays(-1), () => this.bumpDays(1))
      }
    }
    .width('100%')
  }

  @Builder
  calendarCard() {
    Column() {
      FieldRow({ label: '首个比赛日', hint: '格式 YYYY-MM-DD，修改后按回车或移开焦点生效' }) {
        Row({ space: Space.sm }) {
          TextInput({ text: this.dateDraft, placeholder: '2026-10-20' })
            .width(180)
            .height(40)
            .fontSize(FontSize.body)
            .backgroundColor(Palette.inputBg)
            .borderRadius(Radius.md)
            .onChange((value: string) => {
              this.dateDraft = value;
            })
            .onBlur(() => this.commitDate())
            .onSubmit(() => this.commitDate())
          AppButton({ label: '今天', kind: BtnKind.Secondary, onTap: () => {
            this.dateDraft = todayIso();
            this.commitDate();
          } })
          AppButton({ label: '前一天', kind: BtnKind.Ghost, onTap: () => this.shiftStartDate(-1) })
          AppButton({ label: '后一天', kind: BtnKind.Ghost, onTap: () => this.shiftStartDate(1) })
        }
      }

      FieldRow({
        label: '赛期预览',
        hint: `${this.model.config.days} 天`
      }) {
        Row({ space: Space.sm }) {
          Pill({
            text: `${this.model.config.startDate} ${weekdayLabel(this.model.config.startDate)}`,
            tone: ToneKind.Brand
          })
          Text('→').fontSize(FontSize.small).fontColor(Palette.textTertiary)
          Pill({
            text: `${addDays(this.model.config.startDate, Math.max(0, this.model.config.days - 1))} `
              + `${weekdayLabel(addDays(this.model.config.startDate, Math.max(0, this.model.config.days - 1)))}`,
            tone: ToneKind.Brand
          })
        }
      }

      FieldRow({ label: '每日时段', hint: '每天可安排比赛的时间范围，修改后移开焦点生效' }) {
        Row({ space: Space.sm }) {
          TextInput({ text: this.startDraft, placeholder: '14:00' })
            .width(120)
            .height(40)
            .fontSize(FontSize.body)
            .backgroundColor(Palette.inputBg)
            .borderRadius(Radius.md)
            .onChange((value: string) => {
              this.startDraft = value;
            })
            .onBlur(() => this.commitWindow())
            .onSubmit(() => this.commitWindow())
          Text('至').fontSize(FontSize.body).fontColor(Palette.textSecondary)
          TextInput({ text: this.endDraft, placeholder: '21:00' })
            .width(120)
            .height(40)
            .fontSize(FontSize.body)
            .backgroundColor(Palette.inputBg)
            .borderRadius(Radius.md)
            .onChange((value: string) => {
              this.endDraft = value;
            })
            .onBlur(() => this.commitWindow())
            .onSubmit(() => this.commitWindow())
          Text(`共 ${Math.floor((this.model.config.dailyEnd - this.model.config.dailyStart)
            / Math.max(10, this.model.config.matchMinutes + this.model.config.breakMinutes)) * this.model.config.venues.length} 个可用场次 / 天`)
            .fontSize(FontSize.caption)
            .fontColor(Palette.textTertiary)
        }
      }
    }
    .width('100%')
  }

  @Builder
  venueCard() {
    Column({ space: Space.md }) {
      Row({ space: Space.sm }) {
        TextInput({ text: this.draftVenue, placeholder: '场地名称，例如「东区体育馆 1 号场」' })
          .layoutWeight(1)
          .height(40)
          .fontSize(FontSize.body)
          .backgroundColor(Palette.inputBg)
          .borderRadius(Radius.md)
          .onChange((value: string) => {
            this.draftVenue = value;
          })
          .onSubmit(() => this.addVenue())
        AppButton({ label: '添加场地', kind: BtnKind.Primary, symbol: '＋', onTap: () => this.addVenue() })
      }
      .width('100%')

      if (this.model.config.venues.length === 0) {
        Text('尚无场地，至少添加 1 块场地才能生成赛程。')
          .fontSize(FontSize.small)
          .fontColor(Palette.danger)
      } else {
        Column() {
          ForEach(this.model.config.venues, (v: Venue, index: number) => {
            Row() {
              Text(`${index + 1}`)
                .fontSize(FontSize.body)
                .fontColor(Palette.textTertiary)
                .width(40)
              if (this.editingVenueId === v.id) {
                TextInput({ text: this.editingVenueName })
                  .layoutWeight(1)
                  .height(36)
                  .fontSize(FontSize.body)
                  .backgroundColor(Palette.inputBg)
                  .borderRadius(Radius.sm)
                  .onChange((value: string) => {
                    this.editingVenueName = value;
                  })
                  .onSubmit(() => this.commitVenueRename())
              } else {
                Text(v.name)
                  .fontSize(FontSize.body)
                  .fontColor(Palette.textPrimary)
                  .layoutWeight(1)
              }
              Row({ space: Space.sm }) {
                if (this.editingVenueId === v.id) {
                  AppButton({ label: '保存', kind: BtnKind.Primary, onTap: () => this.commitVenueRename() })
                  AppButton({ label: '取消', kind: BtnKind.Ghost, onTap: () => {
                    this.editingVenueId = '';
                  } })
                } else {
                  AppButton({ label: '重命名', kind: BtnKind.Secondary, onTap: () => {
                    this.editingVenueId = v.id;
                    this.editingVenueName = v.name;
                  } })
                  AppButton({ label: '删除', kind: BtnKind.Danger, onTap: () => {
                    this.model.removeVenue(v.id);
                    this.onChanged();
                  } })
                }
              }
            }
            .width('100%')
            .height(48)
            .alignItems(VerticalAlign.Center)
            .border({ width: { bottom: 1 }, color: { bottom: Palette.divider } })
          }, (v: Venue) => v.id)
        }
        .width('100%')
      }
    }
    .width('100%')
  }

  build() {
    Column({ space: Space.lg }) {
      CardSection({ title: '基本信息', subtitle: '赛事名称、项目与赛制' }) {
        this.basicCard()
      }

      CardSection({ title: '时长与赛期', subtitle: '决定每天能安排多少场比赛' }) {
        this.timingCard()
      }

      CardSection({ title: '日期与每日时段', subtitle: '排期算法只会使用这段时间窗' }) {
        this.calendarCard()
      }

      CardSection({
        title: `比赛场地（${this.model.config.venues.length} 块）`,
        subtitle: '所有场地在相同时段内并行使用'
      }) {
        this.venueCard()
      }
    }
    .width('100%')
  }
}
