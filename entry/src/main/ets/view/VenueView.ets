/**
 * 校园赛程编排器 (Campus Arena) —— 场地视图
 *
 * 以「场地 × 时段」网格对照查看某一天的安排，便于发现空档与撞场。
 */

import { AppModel } from '../model/AppModel';
import { Match, Venue, formatClock } from '../model/Types';
import { matchTitle } from '../model/Scheduler';
import { FontSize, Palette, Radius, Space, ToneKind } from '../common/Theme';
import { AppButton, BtnKind, CardSection, EmptyHint, Pill } from '../common/Widgets';

@Component
export struct VenueView {
  @ObjectLink model: AppModel;
  @State day: number = 0;

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
    const base: Date = new Date(
      Number.parseInt(parts[0], 10),
      Number.parseInt(parts[1], 10) - 1,
      Number.parseInt(parts[2], 10)
    );
    base.setDate(base.getDate() + d);
    const mm: string = base.getMonth() + 1 < 10 ? `0${base.getMonth() + 1}` : `${base.getMonth() + 1}`;
    const dd: string = base.getDate() < 10 ? `0${base.getDate()}` : `${base.getDate()}`;
    const names: string[] = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${mm}-${dd} ${names[base.getDay()]}`;
  }

  @Builder
  dayPicker() {
    Row({ space: Space.sm }) {
      Text('比赛日').fontSize(FontSize.small).fontColor(Palette.textTertiary)
      ForEach(this.usedDays(), (d: number) => {
        Column({ space: 2 }) {
          Text(`第 ${d + 1} 天`)
            .fontSize(FontSize.small)
            .fontColor(this.day === d ? Palette.textOnBrand : Palette.textSecondary)
          Text(this.dateOfDay(d))
            .fontSize(FontSize.caption)
            .fontColor(this.day === d ? Palette.textOnBrand : Palette.textTertiary)
        }
        .padding({ left: Space.md, right: Space.md, top: 6, bottom: 6 })
        .backgroundColor(this.day === d ? Palette.brand : Palette.inputBg)
        .borderRadius(Radius.md)
        .focusable(true)
        .hoverEffect(HoverEffect.Highlight)
        .onClick(() => {
          this.day = d;
        })
      }, (d: number) => `${d}`)
      Blank()
      Pill({
        text: `每日 ${formatClock(this.model.config.dailyStart)} – ${formatClock(this.model.config.dailyEnd)}`,
        tone: ToneKind.Neutral
      })
    }
    .width('100%')
    .alignItems(VerticalAlign.Center)
  }

  @Builder
  venueRow(v: Venue, slots: number[]) {
    Row() {
      Column({ space: Space.xs }) {
        Text(v.name)
          .fontSize(FontSize.body)
          .fontWeight(FontWeight.Medium)
          .fontColor(Palette.textPrimary)
          .maxLines(2)
        Text(`${this.countOnDay(v.id)} 场`)
          .fontSize(FontSize.caption)
          .fontColor(Palette.textTertiary)
      }
      .width(160)
      .alignItems(HorizontalAlign.Start)

      Scroll() {
        Row({ space: Space.sm }) {
          ForEach(slots, (t: number) => {
            this.slotCell(v, t)
          }, (t: number) => `${v.id}_${t}`)
        }
        .padding({ right: Space.sm })
      }
      .scrollable(ScrollDirection.Horizontal)
      .scrollBar(BarState.Auto)
      .layoutWeight(1)
      .align(Alignment.Start)
    }
    .width('100%')
    .alignItems(VerticalAlign.Top)
    .padding({ top: Space.sm, bottom: Space.sm })
    .border({ width: { bottom: 1 }, color: { bottom: Palette.divider } })
  }

  @Builder
  slotCell(v: Venue, t: number) {
    Column({ space: 4 }) {
      Text(`${formatClock(t)}–${formatClock(t + this.model.config.matchMinutes)}`)
        .fontSize(FontSize.caption)
        .fontColor(Palette.textTertiary)

      if (this.matchAt(v.id, t) !== undefined) {
        Text(matchTitle(this.matchAt(v.id, t) as Match, this.model.teams))
          .fontSize(FontSize.small)
          .fontColor(Palette.textPrimary)
          .maxLines(2)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .textAlign(TextAlign.Start)
        if ((this.matchAt(v.id, t) as Match).played) {
          Text(`${(this.matchAt(v.id, t) as Match).homeScore} : ${(this.matchAt(v.id, t) as Match).awayScore}`)
            .fontSize(FontSize.small)
            .fontWeight(FontWeight.Bold)
            .fontColor(Palette.ok)
        } else {
          Text((this.matchAt(v.id, t) as Match).roundLabel)
            .fontSize(FontSize.caption)
            .fontColor(Palette.brand)
        }
      } else {
        Text('空闲')
          .fontSize(FontSize.small)
          .fontColor(Palette.textTertiary)
      }
    }
    .width(168)
    .height(96)
    .padding(Space.sm)
    .alignItems(HorizontalAlign.Start)
    .backgroundColor(this.matchAt(v.id, t) !== undefined
      ? ((this.matchAt(v.id, t) as Match).played ? Palette.okSoft : Palette.brandSoft)
      : Palette.inputBg)
    .borderRadius(Radius.md)
    .border({
      width: 1,
      color: this.matchAt(v.id, t) !== undefined ? Palette.divider : Color.Transparent
    })
  }

  build() {
    Column({ space: Space.lg }) {
      CardSection({ title: '场地视图', subtitle: '按场地与时段对照，快速发现空档与重复占用' }) {
        this.dayPicker()
      }

      if (this.model.matches.length === 0 || this.model.config.venues.length === 0) {
        CardSection({ title: '暂无数据', subtitle: '' }) {
          EmptyHint({
            symbol: '▦',
            title: this.model.config.venues.length === 0 ? '还没有场地' : '还没有赛程',
            hint: this.model.config.venues.length === 0
              ? '请先到「赛事配置」添加比赛场地。'
              : '请先到「赛程编排」生成赛程。'
          })
        }
      } else {
        CardSection({
          title: `第 ${this.day + 1} 比赛日（${this.dateOfDay(this.day)}）`,
          subtitle: `共 ${this.slotsOfDay().length} 个时段 × ${this.model.config.venues.length} 块场地`
        }) {
          Column() {
            ForEach(this.model.config.venues, (v: Venue) => {
              this.venueRow(v, this.slotsOfDay())
            }, (v: Venue) => v.id)
          }
          .width('100%')
        }

        CardSection({ title: '图例', subtitle: '' }) {
          Row({ space: Space.lg }) {
            Row({ space: Space.sm }) {
              Row().width(16).height(16).backgroundColor(Palette.brandSoft).borderRadius(4)
              Text('待比赛').fontSize(FontSize.small).fontColor(Palette.textSecondary)
            }
            Row({ space: Space.sm }) {
              Row().width(16).height(16).backgroundColor(Palette.okSoft).borderRadius(4)
              Text('已完赛').fontSize(FontSize.small).fontColor(Palette.textSecondary)
            }
            Row({ space: Space.sm }) {
              Row().width(16).height(16).backgroundColor(Palette.inputBg).borderRadius(4)
              Text('空闲').fontSize(FontSize.small).fontColor(Palette.textSecondary)
            }
          }
          .width('100%')
        }
      }
    }
    .width('100%')
  }
}
