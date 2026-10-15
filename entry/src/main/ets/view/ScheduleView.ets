/**
 * 校园赛程编排器 (Campus Arena) —— 赛程编排
 *
 * 一键生成对阵与排期、查看冲突、录入比分、导出 CSV。
 */

import { common } from '@kit.AbilityKit';
import { AppModel } from '../model/AppModel';
import {
  Conflict,
  ConflictLevel,
  Match,
  Venue,
  formatClock,
  parseClock
} from '../model/Types';
import {
  compareSchedule,
  detectConflicts,
  generateMatches,
  matchTitle,
  propagateWinners,
  scheduleMatches,
  teamName,
  toCsv,
  venueNameOf
} from '../model/Scheduler';
import { exportTextFile } from '../common/Exporter';
import { FontSize, Palette, Radius, Space, ToneKind } from '../common/Theme';
import { AppButton, BtnKind, CardSection, EmptyHint, Pill } from '../common/Widgets';

const FILTER_ALL: string = 'all';
const FILTER_TODO: string = 'todo';
const FILTER_DONE: string = 'done';
const FILTER_UNSCHEDULED: string = 'unscheduled';

@Component
export struct ScheduleView {
  @ObjectLink model: AppModel;
  onChanged: () => void = () => {
  };
  notify: (msg: string) => void = () => {
  };

  @State filter: string = FILTER_ALL;
  @State selectedId: string = '';
  @State scoreHome: string = '';
  @State scoreAway: string = '';
  @State editVenueId: string = '';
  @State editDay: number = 0;
  @State editTime: string = '';
  @State pendingRegen: boolean = false;
  @State pendingClear: boolean = false;
  @State exporting: boolean = false;

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
    } else {
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
    const context: common.UIAbilityContext =
      this.getUIContext().getHostContext() as common.UIAbilityContext;
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

  @Builder
  toolbar() {
    Column({ space: Space.md }) {
      Row({ space: Space.sm }) {
        AppButton({
          label: this.model.matches.length === 0 ? '生成赛程' : '重新生成赛程',
          kind: BtnKind.Primary,
          symbol: '▤',
          tabIndexValue: 1,
          onTap: () => {
            if (this.model.matches.length === 0) {
              this.generate();
            } else {
              this.pendingRegen = true;
              this.pendingClear = false;
            }
          }
        })
        AppButton({
          label: '重新排期',
          kind: BtnKind.Secondary,
          symbol: '↻',
          tabIndexValue: 2,
          disabled: this.model.matches.length === 0,
          onTap: () => this.reschedule()
        })
        AppButton({
          label: this.exporting ? '导出中…' : '导出 CSV',
          kind: BtnKind.Secondary,
          symbol: '⇩',
          tabIndexValue: 3,
          disabled: this.exporting || this.model.matches.length === 0,
          onTap: () => {
            this.doExport();
          }
        })
        AppButton({
          label: '清空赛程',
          kind: BtnKind.Danger,
          tabIndexValue: 4,
          disabled: this.model.matches.length === 0,
          onTap: () => {
            this.pendingClear = true;
            this.pendingRegen = false;
          }
        })
      }
      .width('100%')

      if (this.pendingRegen) {
        Row({ space: Space.md }) {
          Text('重新生成会清除已录入的比分与手动调整，确认继续？')
            .fontSize(FontSize.small)
            .fontColor(Palette.warn)
            .layoutWeight(1)
          AppButton({ label: '确认重新生成', kind: BtnKind.Danger, onTap: () => this.generate() })
          AppButton({ label: '取消', kind: BtnKind.Ghost, onTap: () => {
            this.pendingRegen = false;
          } })
        }
        .width('100%')
        .padding(Space.md)
        .backgroundColor(Palette.warnSoft)
        .borderRadius(Radius.md)
      }

      if (this.pendingClear) {
        Row({ space: Space.md }) {
          Text('清空后所有对阵与比分都会丢失（队伍与配置保留），确认继续？')
            .fontSize(FontSize.small)
            .fontColor(Palette.danger)
            .layoutWeight(1)
          AppButton({ label: '确认清空', kind: BtnKind.Danger, onTap: () => this.clearAll() })
          AppButton({ label: '取消', kind: BtnKind.Ghost, onTap: () => {
            this.pendingClear = false;
          } })
        }
        .width('100%')
        .padding(Space.md)
        .backgroundColor(Palette.dangerSoft)
        .borderRadius(Radius.md)
      }
    }
    .width('100%')
  }

  @Builder
  filterBar() {
    Row({ space: Space.sm }) {
      this.filterChip('全部', FILTER_ALL)
      this.filterChip(`未开始（${this.countOf(FILTER_TODO)}）`, FILTER_TODO)
      this.filterChip(`已完赛（${this.countOf(FILTER_DONE)}）`, FILTER_DONE)
      this.filterChip(`未排期（${this.countOf(FILTER_UNSCHEDULED)}）`, FILTER_UNSCHEDULED)
      Blank()
      Text(`共 ${this.model.matches.length} 场`)
        .fontSize(FontSize.small)
        .fontColor(Palette.textTertiary)
    }
    .width('100%')
    .alignItems(VerticalAlign.Center)
  }

  @Builder
  filterChip(label: string, key: string) {
    Text(label)
      .fontSize(FontSize.small)
      .fontColor(this.filter === key ? Palette.textOnBrand : Palette.textSecondary)
      .backgroundColor(this.filter === key ? Palette.brand : Palette.inputBg)
      .padding({ left: Space.md, right: Space.md, top: 6, bottom: 6 })
      .borderRadius(Radius.pill)
      .focusable(true)
      .hoverEffect(HoverEffect.Highlight)
      .onClick(() => {
        this.filter = key;
      })
  }

  private countOf(key: string): number {
    let n: number = 0;
    for (let i = 0; i < this.model.matches.length; i++) {
      const m: Match = this.model.matches[i];
      if (key === FILTER_TODO && !m.played && m.dayIndex >= 0) {
        n += 1;
      } else if (key === FILTER_DONE && m.played) {
        n += 1;
      } else if (key === FILTER_UNSCHEDULED && m.dayIndex < 0) {
        n += 1;
      }
    }
    return n;
  }

  @Builder
  conflictPanel(list: Conflict[]) {
    Column() {
      if (list.length === 0) {
        Row({ space: Space.sm }) {
          Text('✓').fontSize(FontSize.body).fontColor(Palette.ok)
          Text('未检测到冲突，赛程可以直接执行。')
            .fontSize(FontSize.small)
            .fontColor(Palette.textSecondary)
        }
        .width('100%')
        .alignItems(VerticalAlign.Center)
      } else {
        ForEach(list, (item: Conflict, index: number) => {
          Row({ space: Space.sm }) {
            Pill({
              text: item.level === ConflictLevel.Error ? '必须修复' : '建议调整',
              tone: item.level === ConflictLevel.Error ? ToneKind.Danger : ToneKind.Warn,
              compact: true
            })
            Text(item.message)
              .fontSize(FontSize.small)
              .fontColor(Palette.textSecondary)
              .layoutWeight(1)
          }
          .width('100%')
          .alignItems(VerticalAlign.Top)
          .padding({ top: Space.sm, bottom: Space.sm })
          .border(index < list.length - 1
            ? { width: { bottom: 1 }, color: { bottom: Palette.divider } }
            : { width: 0 })
        }, (item: Conflict, index: number) => `${index}_${item.message}`)
      }
    }
    .width('100%')
  }

  @Builder
  tableHeader() {
    Row() {
      Text('比赛日').fontSize(FontSize.small).fontColor(Palette.textTertiary).width(84)
      Text('时间').fontSize(FontSize.small).fontColor(Palette.textTertiary).width(110)
      Text('场地').fontSize(FontSize.small).fontColor(Palette.textTertiary).layoutWeight(2)
      Text('轮次').fontSize(FontSize.small).fontColor(Palette.textTertiary).width(120)
      Text('对阵').fontSize(FontSize.small).fontColor(Palette.textTertiary).layoutWeight(4)
      Text('比分').fontSize(FontSize.small).fontColor(Palette.textTertiary).width(88)
      Text('状态').fontSize(FontSize.small).fontColor(Palette.textTertiary).width(88)
      Text('操作').fontSize(FontSize.small).fontColor(Palette.textTertiary).width(96)
    }
    .width('100%')
    .padding({ top: Space.sm, bottom: Space.sm })
    .border({ width: { bottom: 1 }, color: { bottom: Palette.divider } })
  }

  @Builder
  tableRow(m: Match, index: number) {
    Row() {
      Text(m.dayIndex >= 0 ? `第 ${m.dayIndex + 1} 天` : '未排期')
        .fontSize(FontSize.small)
        .fontColor(m.dayIndex >= 0 ? Palette.textSecondary : Palette.danger)
        .width(84)

      Text(m.startMinutes >= 0
        ? `${formatClock(m.startMinutes)}–${formatClock(m.startMinutes + this.model.config.matchMinutes)}`
        : '—')
        .fontSize(FontSize.small)
        .fontColor(Palette.textSecondary)
        .width(110)

      Text(venueNameOf(this.model.config.venues, m.venueId) === ''
        ? '—' : venueNameOf(this.model.config.venues, m.venueId))
        .fontSize(FontSize.small)
        .fontColor(Palette.textSecondary)
        .layoutWeight(2)
        .maxLines(1)
        .textOverflow({ overflow: TextOverflow.Ellipsis })

      Row({ space: 4 }) {
        if (m.groupIndex >= 0) {
          Pill({ text: `${this.groupName(m.groupIndex)}组`, tone: ToneKind.Neutral, compact: true })
        }
        Text(m.roundLabel)
          .fontSize(FontSize.small)
          .fontColor(Palette.textSecondary)
          .maxLines(1)
      }
      .width(120)

      Text(matchTitle(m, this.model.teams))
        .fontSize(FontSize.body)
        .fontColor(Palette.textPrimary)
        .layoutWeight(4)
        .maxLines(1)
        .textOverflow({ overflow: TextOverflow.Ellipsis })

      Text(m.played ? `${m.homeScore} : ${m.awayScore}` : '—')
        .fontSize(FontSize.body)
        .fontWeight(m.played ? FontWeight.Bold : FontWeight.Normal)
        .fontColor(m.played ? Palette.textPrimary : Palette.textTertiary)
        .width(88)

      Row() {
        if (m.played) {
          Pill({ text: '已完赛', tone: ToneKind.Ok, compact: true })
        } else if (m.dayIndex < 0) {
          Pill({ text: '未排期', tone: ToneKind.Danger, compact: true })
        } else {
          Pill({ text: '待比赛', tone: ToneKind.Brand, compact: true })
        }
      }
      .width(88)

      Row() {
        AppButton({
          label: this.selectedId === m.id ? '收起' : '录入',
          kind: this.selectedId === m.id ? BtnKind.Primary : BtnKind.Secondary,
          onTap: () => {
            if (this.selectedId === m.id) {
              this.selectedId = '';
            } else {
              this.selectRow(m);
            }
          }
        })
      }
      .width(96)
      .justifyContent(FlexAlign.End)
    }
    .width('100%')
    .constraintSize({ minHeight: 52 })
    .alignItems(VerticalAlign.Center)
    .padding({ top: Space.sm, bottom: Space.sm })
    .backgroundColor(this.selectedId === m.id ? Palette.brandSofter
      : (index % 2 === 0 ? Color.Transparent : Palette.hoverBg))
    .border({ width: { bottom: 1 }, color: { bottom: Palette.divider } })
  }

  private groupName(index: number): string {
    const letters: string = 'ABCDEFGH';
    return index >= 0 && index < letters.length ? letters.charAt(index) : `${index + 1}`;
  }

  @Builder
  editorCard(m: Match) {
    Column({ space: Space.md }) {
      Row({ space: Space.sm }) {
        Text('正在编辑：').fontSize(FontSize.small).fontColor(Palette.textTertiary)
        Text(matchTitle(m, this.model.teams))
          .fontSize(FontSize.body)
          .fontWeight(FontWeight.Medium)
          .fontColor(Palette.textPrimary)
        Pill({ text: m.roundLabel, tone: ToneKind.Neutral, compact: true })
        if (m.pinned) {
          Pill({ text: '已手动锁定', tone: ToneKind.Warn, compact: true })
        }
      }
      .width('100%')
      .alignItems(VerticalAlign.Center)

      Row({ space: Space.lg }) {
        Column({ space: Space.sm }) {
          Text('录入比分').fontSize(FontSize.small).fontColor(Palette.textSecondary)
          Row({ space: Space.sm }) {
            Text(teamName(this.model.teams, m.homeTeamId))
              .fontSize(FontSize.small).fontColor(Palette.textSecondary)
              .width(120).maxLines(1).textOverflow({ overflow: TextOverflow.Ellipsis })
            TextInput({ text: this.scoreHome, placeholder: '0' })
              .width(72).height(36).type(InputType.Number)
              .backgroundColor(Palette.inputBg).borderRadius(Radius.sm)
              .onChange((v: string) => {
                this.scoreHome = v;
              })
            Text(':').fontSize(FontSize.body).fontColor(Palette.textTertiary)
            TextInput({ text: this.scoreAway, placeholder: '0' })
              .width(72).height(36).type(InputType.Number)
              .backgroundColor(Palette.inputBg).borderRadius(Radius.sm)
              .onChange((v: string) => {
                this.scoreAway = v;
              })
            Text(teamName(this.model.teams, m.awayTeamId))
              .fontSize(FontSize.small).fontColor(Palette.textSecondary)
              .width(120).maxLines(1).textOverflow({ overflow: TextOverflow.Ellipsis })
            AppButton({ label: '保存比分', kind: BtnKind.Primary, onTap: () => this.saveScore() })
          }
          .alignItems(VerticalAlign.Center)
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)
      }
      .width('100%')

      Divider().color(Palette.divider)

      Column({ space: Space.sm }) {
        Text('手动调整时间与场地（调整后会锁定，重新排期时保留）')
          .fontSize(FontSize.small).fontColor(Palette.textSecondary)
        Row({ space: Space.sm }) {
          Text('比赛日').fontSize(FontSize.small).fontColor(Palette.textTertiary)
          TextInput({ text: `${this.editDay + 1}` })
            .width(64).height(36).type(InputType.Number)
            .backgroundColor(Palette.inputBg).borderRadius(Radius.sm)
            .onChange((v: string) => {
              const n: number = Number.parseInt(v, 10);
              this.editDay = Number.isNaN(n) ? 1 : Math.max(1, Math.min(this.model.config.days, n)) - 1;
            })
          Text('开始时间').fontSize(FontSize.small).fontColor(Palette.textTertiary)
          TextInput({ text: this.editTime, placeholder: '15:30' })
            .width(96).height(36)
            .backgroundColor(Palette.inputBg).borderRadius(Radius.sm)
            .onChange((v: string) => {
              this.editTime = v;
            })
          Text('场地').fontSize(FontSize.small).fontColor(Palette.textTertiary)
          Select(this.venueOptions())
            .selected(this.venueIndexOf(this.editVenueId))
            .value(this.venueDisplayName(this.editVenueId))
            .font({ size: FontSize.small })
            .height(36)
            .onSelect((index: number) => {
              const venues: Venue[] = this.model.config.venues;
              if (index >= 0 && index < venues.length) {
                this.editVenueId = venues[index].id;
              }
            })
          AppButton({ label: '应用调整', kind: BtnKind.Secondary, onTap: () => this.saveManualSlot() })
        }
        .alignItems(VerticalAlign.Center)
      }
      .width('100%')
      .alignItems(HorizontalAlign.Start)
    }
    .width('100%')
    .alignItems(HorizontalAlign.Start)
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

  build() {
    Column({ space: Space.lg }) {
      CardSection({ title: '赛程编排', subtitle: '按轮次顺序贪心排期，自动避开场地与队伍时间冲突' }) {
        this.toolbar()
      }

      if (this.model.matches.length > 0) {
        CardSection({
          title: `冲突检查（${this.conflicts().length} 条）`,
          subtitle: '每次生成或调整后自动重新检查'
        }) {
          this.conflictPanel(this.conflicts())
        }
      }

      CardSection({ title: '赛程表', subtitle: '点击「录入」可记录比分或手动调整时间场地' }) {
        Column({ space: Space.md }) {
          if (this.model.matches.length === 0) {
            EmptyHint({
              symbol: '▤',
              title: '还没有赛程',
              hint: this.model.teams.length < 2
                ? '请先在「参赛队伍」中添加至少 2 支队伍。'
                : '点击上方「生成赛程」按钮，系统会按当前规则生成对阵并排期。'
            })
          } else {
            this.filterBar()
            this.tableHeader()
            ForEach(this.visibleMatches(), (m: Match, index: number) => {
              this.tableRow(m, index)
            }, (m: Match) => m.id)
            if (this.visibleMatches().length === 0) {
              Text('当前筛选条件下没有比赛。')
                .fontSize(FontSize.small)
                .fontColor(Palette.textTertiary)
                .padding(Space.lg)
            }
          }
        }
        .width('100%')
      }

      if (this.selectedId !== '' && this.selectedMatch() !== undefined) {
        CardSection({ title: '场次详情', subtitle: '' }) {
          this.editorCard(this.selectedMatch() as Match)
        }
      }
    }
    .width('100%')
  }
}
