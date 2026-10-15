/**
 * 校园赛程编排器 (Campus Arena) —— 赛事总览
 */

import { AppModel } from '../model/AppModel';
import {
  Conflict,
  ConflictLevel,
  MatchFormat,
  addDays,
  formatLabel,
  sportLabel,
  weekdayLabel
} from '../model/Types';
import {
  Standing,
  TournamentSummary,
  computeStandings,
  detectConflicts,
  matchTitle,
  summarize,
  teamName,
  venueNameOf
} from '../model/Scheduler';
import { FontSize, Palette, Radius, Space, ToneKind } from '../common/Theme';
import { AppButton, BtnKind, CardSection, EmptyHint, Pill, StatTile } from '../common/Widgets';

/** 总览页一次渲染所需的全部派生数据 */
interface OverviewData {
  conflicts: Conflict[];
  summary: TournamentSummary;
  errorCount: number;
  upcoming: string[];
  standings: Standing[];
}

@Component
export struct OverviewView {
  @ObjectLink model: AppModel;
  goSchedule: () => void = () => {
  };
  goSetup: () => void = () => {
  };

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

  @Builder
  hero() {
    Column() {
      Text(this.model.config.name === '' ? '未命名赛事' : this.model.config.name)
        .fontSize(FontSize.headline)
        .fontWeight(FontWeight.Bold)
        .fontColor(Palette.textPrimary)

      Row({ space: Space.sm }) {
        Pill({ text: sportLabel(this.model.config.sport), tone: ToneKind.Brand })
        Pill({ text: formatLabel(this.model.config.format), tone: ToneKind.Neutral })
        Pill({ text: `${this.model.teams.length} 支队伍`, tone: ToneKind.Neutral })
        Pill({ text: `${this.model.config.days} 天赛期`, tone: ToneKind.Neutral })
      }
      .margin({ top: Space.md })

      Text(this.dateRangeText())
        .fontSize(FontSize.small)
        .fontColor(Palette.textSecondary)
        .margin({ top: Space.md })

      Row() {
        Text(`每日 ${this.clockText(this.model.config.dailyStart)} – ${this.clockText(this.model.config.dailyEnd)}`)
          .fontSize(FontSize.small)
          .fontColor(Palette.textSecondary)
        Text('·').fontSize(FontSize.small).fontColor(Palette.textTertiary)
          .margin({ left: Space.sm, right: Space.sm })
        Text(`单场 ${this.model.config.matchMinutes} 分钟`)
          .fontSize(FontSize.small)
          .fontColor(Palette.textSecondary)
        Text('·').fontSize(FontSize.small).fontColor(Palette.textTertiary)
          .margin({ left: Space.sm, right: Space.sm })
        Text(`${this.model.config.venues.length} 块场地`)
          .fontSize(FontSize.small)
          .fontColor(Palette.textSecondary)
      }
      .margin({ top: 2 })
    }
    .alignItems(HorizontalAlign.Start)
    .width('100%')
  }

  @Builder
  stats(summary: TournamentSummary, errors: number) {
    Row({ space: Space.md }) {
      StatTile({
        label: '参赛队伍',
        value: `${this.model.teams.length}`,
        unit: '支',
        hint: '在「参赛队伍」中维护',
        tone: ToneKind.Neutral
      })
      StatTile({
        label: '总场次',
        value: `${summary.matchTotal}`,
        unit: '场',
        hint: summary.matchTotal === 0 ? '尚未生成赛程' : '已生成对阵',
        tone: ToneKind.Neutral
      })
      StatTile({
        label: '已排期',
        value: `${summary.matchScheduled}`,
        unit: '场',
        hint: summary.matchTotal === 0
          ? '—'
          : `完成度 ${Math.round(summary.matchScheduled * 100 / summary.matchTotal)}%`,
        tone: summary.matchTotal > 0 && summary.matchScheduled === summary.matchTotal
          ? ToneKind.Ok : ToneKind.Warn
      })
      StatTile({
        label: '已完赛',
        value: `${summary.matchPlayed}`,
        unit: '场',
        hint: `使用 ${summary.daysUsed} 个比赛日`,
        tone: ToneKind.Brand
      })
      StatTile({
        label: '冲突',
        value: `${errors}`,
        unit: '项',
        hint: summary.warningCount > 0 ? `另有 ${summary.warningCount} 条提醒` : '无待处理提醒',
        tone: errors > 0 ? ToneKind.Danger : (summary.warningCount > 0 ? ToneKind.Warn : ToneKind.Ok)
      })
    }
    .width('100%')
    .alignItems(VerticalAlign.Top)
    .height(136)
  }

  @Builder
  conflictList(list: Conflict[]) {
    if (list.length === 0) {
      Row() {
        Text('✓').fontSize(FontSize.subhead).fontColor(Palette.ok)
        Text(this.model.matches.length === 0 ? '尚未生成赛程，暂无冲突。' : '未检测到冲突，赛程可以直接执行。')
          .fontSize(FontSize.body)
          .fontColor(Palette.textSecondary)
          .margin({ left: Space.sm })
      }
      .width('100%')
      .alignItems(VerticalAlign.Center)
      .padding({ top: Space.sm, bottom: Space.sm })
    } else {
      Column() {
        ForEach(list.slice(0, 6), (item: Conflict, index: number) => {
          Row() {
            Text(item.level === ConflictLevel.Error ? '!' : '△')
              .fontSize(FontSize.body)
              .fontColor(item.level === ConflictLevel.Error ? Palette.danger : Palette.warn)
              .width(20)
            Text(item.message)
              .fontSize(FontSize.small)
              .fontColor(Palette.textSecondary)
              .layoutWeight(1)
          }
          .width('100%')
          .alignItems(VerticalAlign.Top)
          .padding({ top: Space.sm, bottom: Space.sm })
          .border(index < Math.min(list.length, 6) - 1
            ? { width: { bottom: 1 }, color: { bottom: Palette.divider } }
            : { width: 0 })
        }, (item: Conflict, index: number) => `${index}_${item.message}`)

        if (list.length > 6) {
          Text(`还有 ${list.length - 6} 条未显示，请到「赛程编排」查看全部。`)
            .fontSize(FontSize.caption)
            .fontColor(Palette.textTertiary)
            .margin({ top: Space.sm })
        }
      }
      .width('100%')
    }
  }

  @Builder
  standingsCard(standings: Standing[]) {
    Column() {
      Row() {
        Text('排名').fontSize(FontSize.small).fontColor(Palette.textTertiary).width(48)
        Text('队伍').fontSize(FontSize.small).fontColor(Palette.textTertiary).layoutWeight(1)
        Text('赛').fontSize(FontSize.small).fontColor(Palette.textTertiary).width(40).textAlign(TextAlign.Center)
        Text('胜').fontSize(FontSize.small).fontColor(Palette.textTertiary).width(40).textAlign(TextAlign.Center)
        Text('平').fontSize(FontSize.small).fontColor(Palette.textTertiary).width(40).textAlign(TextAlign.Center)
        Text('负').fontSize(FontSize.small).fontColor(Palette.textTertiary).width(40).textAlign(TextAlign.Center)
        Text('净胜').fontSize(FontSize.small).fontColor(Palette.textTertiary).width(56).textAlign(TextAlign.Center)
        Text('积分').fontSize(FontSize.small).fontColor(Palette.textTertiary).width(56).textAlign(TextAlign.Center)
      }
      .width('100%')
      .padding({ bottom: Space.sm })

      ForEach(standings, (row: Standing, index: number) => {
        Row() {
          Text(`${index + 1}`)
            .fontSize(FontSize.small)
            .fontColor(index < 3 ? Palette.brand : Palette.textSecondary)
            .fontWeight(index < 3 ? FontWeight.Bold : FontWeight.Normal)
            .width(48)
          Text(teamName(this.model.teams, row.teamId))
            .fontSize(FontSize.body)
            .fontColor(Palette.textPrimary)
            .layoutWeight(1)
            .maxLines(1)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
          Text(`${row.played}`).fontSize(FontSize.body).fontColor(Palette.textSecondary)
            .width(40).textAlign(TextAlign.Center)
          Text(`${row.won}`).fontSize(FontSize.body).fontColor(Palette.ok)
            .width(40).textAlign(TextAlign.Center)
          Text(`${row.drawn}`).fontSize(FontSize.body).fontColor(Palette.textSecondary)
            .width(40).textAlign(TextAlign.Center)
          Text(`${row.lost}`).fontSize(FontSize.body).fontColor(Palette.textSecondary)
            .width(40).textAlign(TextAlign.Center)
          Text(`${row.scoreFor - row.scoreAgainst}`)
            .fontSize(FontSize.body).fontColor(Palette.textSecondary)
            .width(56).textAlign(TextAlign.Center)
          Text(`${row.points}`)
            .fontSize(FontSize.body).fontWeight(FontWeight.Bold).fontColor(Palette.textPrimary)
            .width(56).textAlign(TextAlign.Center)
        }
        .width('100%')
        .height(40)
        .alignItems(VerticalAlign.Center)
        .backgroundColor(index % 2 === 0 ? Palette.brandSofter : Color.Transparent)
        .borderRadius(Radius.sm)
      }, (row: Standing) => row.teamId)
    }
    .width('100%')
  }

  @Builder
  upcoming(list: string[]) {
    Column() {
      if (list.length === 0) {
        EmptyHint({
          symbol: '▤',
          title: this.model.matches.length === 0 ? '还没有赛程' : '全部比赛已完成',
          hint: this.model.matches.length === 0
            ? '先在「赛事配置」确认规则与场地，再到「赛程编排」一键生成。'
            : '可以在「赛程编排」中查看完整结果或导出。'
        })
      } else {
        ForEach(list, (line: string, index: number) => {
          Row() {
            Text(line)
              .fontSize(FontSize.body)
              .fontColor(Palette.textPrimary)
              .layoutWeight(1)
              .maxLines(1)
              .textOverflow({ overflow: TextOverflow.Ellipsis })
          }
          .width('100%')
          .padding({ top: Space.sm, bottom: Space.sm })
          .border(index < list.length - 1
            ? { width: { bottom: 1 }, color: { bottom: Palette.divider } }
            : { width: 0 })
        }, (line: string, index: number) => `${index}_${line}`)
      }
    }
    .width('100%')
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

  @Builder
  content(d: OverviewData) {
    Column({ space: Space.lg }) {
      this.hero()

      this.stats(d.summary, d.errorCount)

      Row({ space: Space.lg }) {
        Column() {
          CardSection({ title: '冲突与提醒', subtitle: '生成赛程后会自动检查场地、队伍与休息时间' }) {
            this.conflictList(d.conflicts)
          }
        }
        .layoutWeight(3)

        Column() {
          CardSection({ title: '快捷操作', subtitle: '常用流程入口' }) {
            Column({ space: Space.sm }) {
              AppButton({
                label: '生成 / 重新编排赛程',
                kind: BtnKind.Primary,
                symbol: '▤',
                tabIndexValue: 1,
                onTap: () => this.goSchedule()
              })
              AppButton({
                label: '调整赛事规则与场地',
                kind: BtnKind.Secondary,
                symbol: '⚙',
                tabIndexValue: 2,
                onTap: () => this.goSetup()
              })
            }
            .width('100%')
            .alignItems(HorizontalAlign.Start)
          }
        }
        .layoutWeight(2)
      }
      .width('100%')
      .alignItems(VerticalAlign.Top)

      Row({ space: Space.lg }) {
        Column() {
          CardSection({ title: '下一批比赛', subtitle: '按比赛日与开始时间排序' }) {
            this.upcoming(d.upcoming)
          }
        }
        .layoutWeight(1)

        if (this.hasStandings()) {
          Column() {
            CardSection({ title: '积分榜', subtitle: '胜 3 分 · 平 1 分 · 负 0 分' }) {
              this.standingsCard(d.standings)
            }
          }
          .layoutWeight(1)
        }
      }
      .width('100%')
      .alignItems(VerticalAlign.Top)
    }
    .width('100%')
    .alignItems(HorizontalAlign.Start)
  }

  build() {
    Column() {
      this.content(this.overview())
    }
    .width('100%')
    .alignItems(HorizontalAlign.Start)
  }
}
