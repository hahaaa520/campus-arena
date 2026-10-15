/**
 * 校园赛程编排器 (Campus Arena)
 * 应用主框架：左侧导航 + 顶部标题栏 + 内容区
 *
 * 面向鸿蒙电脑（2in1）优先设计：宽窗口使用固定侧边导航，
 * 窄窗口自动切换为顶部标签，内容区限制最大行宽以保证可读性。
 */

import { common } from '@kit.AbilityKit';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { AppModel, modelFromState } from '../model/AppModel';
import { TournamentStore } from '../model/Store';
import {
  Breakpoint,
  CONTENT_MAX_WIDTH,
  FontSize,
  NavItem,
  NavKey,
  Palette,
  Radius,
  Space,
  ToneKind,
  breakpointOf,
  navItems,
  sideNavWidth
} from '../common/Theme';
import { AppButton, BtnKind, Pill } from '../common/Widgets';
import { OverviewView } from '../view/OverviewView';
import { SetupView } from '../view/SetupView';
import { TeamsView } from '../view/TeamsView';
import { ScheduleView } from '../view/ScheduleView';
import { VenueView } from '../view/VenueView';
import { AboutView } from '../view/AboutView';

const DOMAIN: number = 0x0000;
const TAG: string = 'CampusArena.Index';

@Entry
@Component
struct Index {
  @State model: AppModel = new AppModel();
  @State nav: NavKey = NavKey.Overview;
  @State widthVp: number = 1280;
  @State saveHint: string = '本机数据';
  @State pendingClear: boolean = false;

  private store: TournamentStore = new TournamentStore();
  private storeReady: boolean = false;

  aboutToAppear(): void {
    try {
      const context: common.UIAbilityContext =
        this.getUIContext().getHostContext() as common.UIAbilityContext;
      this.storeReady = this.store.open(context);
      this.model = modelFromState(this.store.load());
      this.saveHint = this.storeReady ? '本机数据' : '仅当前会话';
    } catch (err) {
      hilog.error(DOMAIN, TAG, 'init failed: %{public}s', JSON.stringify(err));
    }
  }

  aboutToDisappear(): void {
    this.persist();
  }

  onPageHide(): void {
    this.persist();
  }

  private persist(): void {
    if (!this.storeReady) {
      return;
    }
    const result = this.store.save(this.model.snapshot());
    this.saveHint = result.ok ? '已保存' : '保存失败';
  }

  private notify(message: string): void {
    try {
      this.getUIContext().getPromptAction().showToast({ message: message, duration: 2400 });
    } catch (err) {
      hilog.warn(DOMAIN, TAG, 'toast failed: %{public}s', JSON.stringify(err));
    }
  }

  private bp(): Breakpoint {
    return breakpointOf(this.widthVp);
  }

  private currentLabel(): string {
    const items: NavItem[] = navItems();
    for (let i = 0; i < items.length; i++) {
      if (items[i].key === this.nav) {
        return items[i].label;
      }
    }
    return '';
  }

  private currentHint(): string {
    const items: NavItem[] = navItems();
    for (let i = 0; i < items.length; i++) {
      if (items[i].key === this.nav) {
        return items[i].hint;
      }
    }
    return '';
  }

  /* ------------------------------------------------------------------ *
   * 导航
   * ------------------------------------------------------------------ */

  @Builder
  brandMark(compact: boolean) {
    Row({ space: Space.sm }) {
      Image($r('app.media.icon'))
        .width(32)
        .height(32)
        .borderRadius(Radius.sm)
      if (!compact) {
        Column({ space: 0 }) {
          Text('校园赛程编排器')
            .fontSize(FontSize.body)
            .fontWeight(FontWeight.Bold)
            .fontColor(Palette.textPrimary)
          Text('Campus Arena')
            .fontSize(FontSize.caption)
            .fontColor(Palette.textTertiary)
        }
        .alignItems(HorizontalAlign.Start)
      }
    }
    .alignItems(VerticalAlign.Center)
  }

  @Builder
  navButton(item: NavItem, compact: boolean, index: number) {
    Row({ space: Space.md }) {
      Text(item.symbol)
        .fontSize(FontSize.subhead)
        .fontColor(this.nav === item.key ? Palette.brand : Palette.textSecondary)
        .width(24)
        .textAlign(TextAlign.Center)
      if (!compact) {
        Column({ space: 2 }) {
          Text(item.label)
            .fontSize(FontSize.body)
            .fontColor(this.nav === item.key ? Palette.brand : Palette.textPrimary)
            .fontWeight(this.nav === item.key ? FontWeight.Medium : FontWeight.Normal)
          Text(item.hint)
            .fontSize(FontSize.caption)
            .fontColor(Palette.textTertiary)
            .maxLines(1)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)
      }
    }
    .width('100%')
    .height(compact ? 48 : 58)
    .padding({ left: compact ? 0 : Space.md, right: Space.md })
    .justifyContent(compact ? FlexAlign.Center : FlexAlign.Start)
    .alignItems(VerticalAlign.Center)
    .backgroundColor(this.nav === item.key ? Palette.sideActive : Color.Transparent)
    .borderRadius(Radius.md)
    .focusable(true)
    .tabIndex(index + 1)
    .hoverEffect(HoverEffect.Highlight)
    .onClick(() => {
      this.nav = item.key;
      this.pendingClear = false;
    })
  }

  @Builder
  sideNav(compact: boolean) {
    Column() {
      Column() {
        this.brandMark(compact)
      }
      .width('100%')
      .height(72)
      .padding({ left: compact ? 0 : Space.lg, right: Space.lg })
      .justifyContent(compact ? FlexAlign.Center : FlexAlign.Start)
      .alignItems(compact ? HorizontalAlign.Center : HorizontalAlign.Start)

      Column({ space: Space.xs }) {
        ForEach(navItems(), (item: NavItem, index: number) => {
          this.navButton(item, compact, index)
        }, (item: NavItem) => item.key)
      }
      .width('100%')
      .padding({ left: Space.sm, right: Space.sm })
      .layoutWeight(1)
      .alignItems(HorizontalAlign.Start)

      if (!compact) {
        Column({ space: Space.xs }) {
          Text('数据全部保存在本机')
            .fontSize(FontSize.caption)
            .fontColor(Palette.textTertiary)
          Text('无需联网 · 不收集个人信息')
            .fontSize(FontSize.caption)
            .fontColor(Palette.textTertiary)
        }
        .width('100%')
        .padding(Space.lg)
        .alignItems(HorizontalAlign.Start)
      }
    }
    .width(sideNavWidth(this.bp()))
    .height('100%')
    .backgroundColor(Palette.sideBg)
    .border({ width: { right: 1 }, color: { right: Palette.divider } })
  }

  @Builder
  topTabs() {
    Scroll() {
      Row({ space: Space.sm }) {
        ForEach(navItems(), (item: NavItem, index: number) => {
          Row({ space: Space.xs }) {
            Text(item.symbol).fontSize(FontSize.body)
              .fontColor(this.nav === item.key ? Palette.textOnBrand : Palette.textSecondary)
            Text(item.label).fontSize(FontSize.small)
              .fontColor(this.nav === item.key ? Palette.textOnBrand : Palette.textSecondary)
          }
          .padding({ left: Space.md, right: Space.md, top: 8, bottom: 8 })
          .backgroundColor(this.nav === item.key ? Palette.brand : Palette.inputBg)
          .borderRadius(Radius.pill)
          .focusable(true)
          .tabIndex(index + 1)
          .hoverEffect(HoverEffect.Highlight)
          .onClick(() => {
            this.nav = item.key;
            this.pendingClear = false;
          })
        }, (item: NavItem) => item.key)
      }
      .padding({ left: Space.lg, right: Space.lg, top: Space.sm, bottom: Space.sm })
    }
    .scrollable(ScrollDirection.Horizontal)
    .scrollBar(BarState.Off)
    .width('100%')
    .backgroundColor(Palette.sideBg)
    .border({ width: { bottom: 1 }, color: { bottom: Palette.divider } })
  }

  /* ------------------------------------------------------------------ *
   * 顶栏
   * ------------------------------------------------------------------ */

  @Builder
  header() {
    Row({ space: Space.md }) {
      if (this.bp() === Breakpoint.Sm) {
        this.brandMark(true)
      }
      Column({ space: 2 }) {
        Text(this.currentLabel())
          .fontSize(FontSize.title)
          .fontWeight(FontWeight.Bold)
          .fontColor(Palette.textPrimary)
        Text(this.currentHint())
          .fontSize(FontSize.caption)
          .fontColor(Palette.textTertiary)
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)

      if (this.bp() !== Breakpoint.Sm) {
        Pill({ text: this.model.config.name, tone: ToneKind.Neutral })
      }
      Pill({ text: this.saveHint, tone: ToneKind.Ok })

      AppButton({
        label: '保存',
        kind: BtnKind.Secondary,
        symbol: '✓',
        tabIndexValue: 0,
        onTap: () => {
          this.persist();
          this.notify('已保存到本机。');
        }
      })
    }
    .width('100%')
    .height(72)
    .padding({ left: Space.xl, right: Space.xl })
    .alignItems(VerticalAlign.Center)
    .backgroundColor(Palette.headerBg)
    .border({ width: { bottom: 1 }, color: { bottom: Palette.divider } })
  }

  /* ------------------------------------------------------------------ *
   * 内容
   * ------------------------------------------------------------------ */

  @Builder
  content() {
    if (this.nav === NavKey.Overview) {
      OverviewView({
        model: this.model,
        goSchedule: () => {
          this.nav = NavKey.Schedule;
        },
        goSetup: () => {
          this.nav = NavKey.Setup;
        }
      })
    } else if (this.nav === NavKey.Setup) {
      SetupView({
        model: this.model,
        onChanged: () => this.persist(),
        notify: (msg: string) => this.notify(msg)
      })
    } else if (this.nav === NavKey.Teams) {
      TeamsView({
        model: this.model,
        onChanged: () => this.persist(),
        notify: (msg: string) => this.notify(msg)
      })
    } else if (this.nav === NavKey.Schedule) {
      ScheduleView({
        model: this.model,
        onChanged: () => this.persist(),
        notify: (msg: string) => this.notify(msg)
      })
    } else if (this.nav === NavKey.Venues) {
      VenueView({ model: this.model })
    } else {
      AboutView({
        model: this.model,
        onClearData: () => {
          this.pendingClear = true;
        }
      })
    }
  }

  @Builder
  clearConfirm() {
    Row({ space: Space.md }) {
      Text('清除后本机保存的全部队伍、配置与比分都会删除，且无法恢复。确认继续？')
        .fontSize(FontSize.small)
        .fontColor(Palette.danger)
        .layoutWeight(1)
      AppButton({
        label: '确认清除',
        kind: BtnKind.Danger,
        onTap: () => {
          this.store.clear();
          this.model.resetToSample();
          this.persist();
          this.pendingClear = false;
          this.notify('已清除本机数据，并恢复为示例队伍。');
        }
      })
      AppButton({
        label: '取消',
        kind: BtnKind.Ghost,
        onTap: () => {
          this.pendingClear = false;
        }
      })
    }
    .width('100%')
    .padding(Space.lg)
    .backgroundColor(Palette.dangerSoft)
    .borderRadius(Radius.md)
  }

  build() {
    Column() {
      Row() {
        if (this.bp() !== Breakpoint.Sm) {
          this.sideNav(this.bp() === Breakpoint.Md)
        }

        Column() {
          this.header()

          if (this.bp() === Breakpoint.Sm) {
            this.topTabs()
          }

          Scroll() {
            Row() {
              Column({ space: Space.lg }) {
                if (this.pendingClear) {
                  this.clearConfirm()
                }
                this.content()
              }
              .layoutWeight(1)
              .constraintSize({ maxWidth: CONTENT_MAX_WIDTH })
              .alignItems(HorizontalAlign.Start)
              .padding({
                left: this.bp() === Breakpoint.Sm ? Space.md : Space.xl,
                right: this.bp() === Breakpoint.Sm ? Space.md : Space.xl,
                top: Space.xl,
                bottom: 56
              })
            }
            .width('100%')
            .justifyContent(FlexAlign.Center)
          }
          .layoutWeight(1)
          .scrollBar(BarState.Auto)
          .align(Alignment.Top)
        }
        .layoutWeight(1)
        .height('100%')
        .backgroundColor(Palette.pageBg)
      }
      .width('100%')
      .height('100%')
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Palette.pageBg)
    .onAreaChange((_oldArea: Area, newArea: Area) => {
      const w: number = newArea.width as number;
      if (w > 0 && Math.abs(w - this.widthVp) > 1) {
        this.widthVp = w;
      }
    })
  }
}
