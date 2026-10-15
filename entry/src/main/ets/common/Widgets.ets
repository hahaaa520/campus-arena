/**
 * 校园赛程编排器 (Campus Arena)
 * 共用展示组件
 *
 * 全部为无状态展示组件：仅通过属性接收数据，通过回调上报交互。
 * 面向 PC 做了键鼠适配：hover 反馈、可聚焦、明确的 tab 走焦顺序。
 */

import { FontSize, Palette, Radius, Space, ToneKind } from './Theme';

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

/* ------------------------------------------------------------------ *
 * 卡片容器
 * ------------------------------------------------------------------ */

@Component
export struct CardSection {
  @Prop title: string = '';
  @Prop subtitle: string = '';
  @Prop fill: boolean = true;
  @BuilderParam content: () => void = this.emptyBody;

  @Builder
  emptyBody() {
  }

  build() {
    Column() {
      if (this.title !== '') {
        Row() {
          Column() {
            Text(this.title)
              .fontSize(FontSize.subhead)
              .fontWeight(FontWeight.Medium)
              .fontColor(Palette.textPrimary)
            if (this.subtitle !== '') {
              Text(this.subtitle)
                .fontSize(FontSize.small)
                .fontColor(Palette.textTertiary)
                .margin({ top: 2 })
            }
          }
          .alignItems(HorizontalAlign.Start)
          .layoutWeight(1)
        }
        .width('100%')
        .alignItems(VerticalAlign.Center)
        .margin({ bottom: Space.md })
      }

      this.content()
    }
    .alignItems(HorizontalAlign.Start)
    .width('100%')
    .padding(Space.lg)
    .backgroundColor(this.fill ? Palette.cardBg : Color.Transparent)
    .borderRadius(Radius.lg)
    .border(this.fill ? { width: 1, color: Palette.divider } : { width: 0 })
  }
}

/* ------------------------------------------------------------------ *
 * 指标卡片
 * ------------------------------------------------------------------ */

@Component
export struct StatTile {
  @Prop label: string = '';
  @Prop value: string = '';
  @Prop unit: string = '';
  @Prop hint: string = '';
  @Prop tone: ToneKind = ToneKind.Neutral;

  build() {
    Column() {
      Text(this.label)
        .fontSize(FontSize.small)
        .fontColor(Palette.textTertiary)
        .maxLines(1)
        .textOverflow({ overflow: TextOverflow.Ellipsis })

      Row() {
        Text(this.value)
          .fontSize(FontSize.display)
          .fontWeight(FontWeight.Bold)
          .fontColor(toneColor(this.tone))
        if (this.unit !== '') {
          Text(this.unit)
            .fontSize(FontSize.small)
            .fontColor(Palette.textSecondary)
            .margin({ left: Space.xs, bottom: 4 })
        }
      }
      .alignItems(VerticalAlign.Bottom)
      .margin({ top: Space.xs })

      if (this.hint !== '') {
        Text(this.hint)
          .fontSize(FontSize.caption)
          .fontColor(Palette.textTertiary)
          .maxLines(2)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .margin({ top: 2 })
      }
    }
    .alignItems(HorizontalAlign.Start)
    .padding(Space.lg)
    .backgroundColor(Palette.cardBg)
    .borderRadius(Radius.lg)
    .border({ width: 1, color: Palette.divider })
    .layoutWeight(1)
    .height('100%')
  }
}

/* ------------------------------------------------------------------ *
 * 标签
 * ------------------------------------------------------------------ */

@Component
export struct Pill {
  @Prop text: string = '';
  @Prop tone: ToneKind = ToneKind.Neutral;
  @Prop compact: boolean = false;

  build() {
    Text(this.text)
      .fontSize(this.compact ? FontSize.caption : FontSize.small)
      .fontColor(toneColor(this.tone))
      .backgroundColor(toneSoftColor(this.tone))
      .padding({
        left: this.compact ? 6 : 10,
        right: this.compact ? 6 : 10,
        top: this.compact ? 2 : 4,
        bottom: this.compact ? 2 : 4
      })
      .borderRadius(Radius.pill)
      .maxLines(1)
      .textOverflow({ overflow: TextOverflow.Ellipsis })
  }
}

/* ------------------------------------------------------------------ *
 * 按钮
 * ------------------------------------------------------------------ */

export enum BtnKind {
  Primary = 'primary',
  Secondary = 'secondary',
  Ghost = 'ghost',
  Danger = 'danger'
}

@Component
export struct AppButton {
  @Prop label: string = '';
  @Prop kind: BtnKind = BtnKind.Secondary;
  @Prop symbol: string = '';
  @Prop disabled: boolean = false;
  @Prop tabIndexValue: number = 0;
  onTap: () => void = () => {
  };

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

  build() {
    Row() {
      if (this.symbol !== '') {
        Text(this.symbol)
          .fontSize(FontSize.body)
          .fontColor(this.fg())
          .margin({ right: 6 })
      }
      Text(this.label)
        .fontSize(FontSize.body)
        .fontColor(this.fg())
        .fontWeight(this.kind === BtnKind.Primary ? FontWeight.Medium : FontWeight.Normal)
    }
    .alignItems(VerticalAlign.Center)
    .justifyContent(FlexAlign.Center)
    .height(36)
    .padding({ left: Space.lg, right: Space.lg })
    .backgroundColor(this.bg())
    .borderRadius(Radius.md)
    .border({
      width: this.kind === BtnKind.Primary || this.kind === BtnKind.Ghost ? 0 : 1,
      color: this.kind === BtnKind.Danger ? Palette.danger : Palette.divider
    })
    .opacity(this.disabled ? 0.6 : 1)
    .focusable(!this.disabled)
    .tabIndex(this.tabIndexValue)
    .hoverEffect(this.disabled ? HoverEffect.None : HoverEffect.Highlight)
    .onClick(() => {
      if (!this.disabled) {
        this.onTap();
      }
    })
  }
}

/* ------------------------------------------------------------------ *
 * 表单行
 * ------------------------------------------------------------------ */

@Component
export struct FieldRow {
  @Prop label: string = '';
  @Prop hint: string = '';
  @Prop labelWidth: number = 132;
  @BuilderParam content: () => void = this.emptyBody;

  @Builder
  emptyBody() {
  }

  build() {
    Row() {
      Column() {
        Text(this.label)
          .fontSize(FontSize.body)
          .fontColor(Palette.textPrimary)
        if (this.hint !== '') {
          Text(this.hint)
            .fontSize(FontSize.caption)
            .fontColor(Palette.textTertiary)
            .margin({ top: 2 })
            .maxLines(2)
        }
      }
      .alignItems(HorizontalAlign.Start)
      .width(this.labelWidth)

      Column() {
        this.content()
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
    }
    .width('100%')
    .alignItems(VerticalAlign.Top)
    .padding({ top: Space.sm, bottom: Space.sm })
  }
}

/* ------------------------------------------------------------------ *
 * 空状态
 * ------------------------------------------------------------------ */

@Component
export struct EmptyHint {
  @Prop symbol: string = '◌';
  @Prop title: string = '';
  @Prop hint: string = '';

  build() {
    Column() {
      Text(this.symbol)
        .fontSize(40)
        .fontColor(Palette.textTertiary)
      Text(this.title)
        .fontSize(FontSize.body)
        .fontColor(Palette.textSecondary)
        .margin({ top: Space.sm })
      if (this.hint !== '') {
        Text(this.hint)
          .fontSize(FontSize.small)
          .fontColor(Palette.textTertiary)
          .margin({ top: Space.xs })
          .textAlign(TextAlign.Center)
      }
    }
    .width('100%')
    .padding({ top: 40, bottom: 40 })
    .justifyContent(FlexAlign.Center)
    .alignItems(HorizontalAlign.Center)
  }
}

/* ------------------------------------------------------------------ *
 * 键值行
 * ------------------------------------------------------------------ */

@Component
export struct KeyValueRow {
  @Prop label: string = '';
  @Prop value: string = '';
  @Prop tone: ToneKind = ToneKind.Neutral;
  @Prop divided: boolean = false;

  build() {
    Column() {
      if (this.divided) {
        Divider().color(Palette.divider).strokeWidth(1)
      }
      Row() {
        Text(this.label)
          .fontSize(FontSize.body)
          .fontColor(Palette.textSecondary)
          .layoutWeight(1)
        Text(this.value)
          .fontSize(FontSize.body)
          .fontColor(toneColor(this.tone))
          .fontWeight(FontWeight.Medium)
          .textAlign(TextAlign.End)
      }
      .width('100%')
      .padding({ top: Space.sm, bottom: Space.sm })
      .alignItems(VerticalAlign.Center)
    }
    .width('100%')
  }
}
