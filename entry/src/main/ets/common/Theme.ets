/**
 * 校园赛程编排器 (Campus Arena)
 * 设计令牌：颜色、间距、圆角、字号与断点
 *
 * 界面全部引用此处的常量，保证 PC 大屏与窄窗口下的视觉一致。
 */

/** 语义色调，供标签、指标卡与按钮统一取色 */
export enum ToneKind {
  Neutral = 'neutral',
  Brand = 'brand',
  Ok = 'ok',
  Warn = 'warn',
  Danger = 'danger'
}

/** 品牌与语义色 */
export class Palette {
  static readonly brand: string = '#1F6FEB';
  static readonly brandDeep: string = '#0B4FB0';
  static readonly brandSoft: string = '#E8F0FE';
  static readonly brandSofter: string = '#F4F8FF';

  static readonly pageBg: string = '#F2F4F8';
  static readonly cardBg: string = '#FFFFFF';
  static readonly sideBg: string = '#FFFFFF';
  static readonly sideActive: string = '#E8F0FE';
  static readonly headerBg: string = '#FFFFFF';

  static readonly textPrimary: string = '#1A1D24';
  static readonly textSecondary: string = '#5B6472';
  static readonly textTertiary: string = '#8B95A5';
  static readonly textOnBrand: string = '#FFFFFF';

  static readonly divider: string = '#E3E7EE';
  static readonly hoverBg: string = '#F6F8FC';
  static readonly inputBg: string = '#F7F9FC';

  static readonly ok: string = '#1F9254';
  static readonly okSoft: string = '#E7F5EC';
  static readonly warn: string = '#C77700';
  static readonly warnSoft: string = '#FDF3E3';
  static readonly danger: string = '#D93B3B';
  static readonly dangerSoft: string = '#FDECEC';
  static readonly neutralSoft: string = '#EEF1F6';
}

/** 间距刻度 */
export class Space {
  static readonly xs: number = 4;
  static readonly sm: number = 8;
  static readonly md: number = 12;
  static readonly lg: number = 16;
  static readonly xl: number = 24;
  static readonly xxl: number = 32;
}

/** 圆角刻度 */
export class Radius {
  static readonly sm: number = 6;
  static readonly md: number = 10;
  static readonly lg: number = 14;
  static readonly pill: number = 999;
}

/** 字号刻度 */
export class FontSize {
  static readonly caption: number = 11;
  static readonly small: number = 12;
  static readonly body: number = 14;
  static readonly subhead: number = 16;
  static readonly title: number = 18;
  static readonly headline: number = 22;
  static readonly display: number = 28;
}

/** 响应式断点 */
export enum Breakpoint {
  /** 窄窗口（手机竖屏） */
  Sm = 'sm',
  /** 中等窗口（平板 / 分屏） */
  Md = 'md',
  /** 宽窗口（PC 全屏） */
  Lg = 'lg'
}

export function breakpointOf(widthVp: number): Breakpoint {
  if (widthVp < 600) {
    return Breakpoint.Sm;
  }
  if (widthVp < 900) {
    return Breakpoint.Md;
  }
  return Breakpoint.Lg;
}

/** 侧边导航宽度：窄窗口下收窄为图标条 */
export function sideNavWidth(bp: Breakpoint): number {
  if (bp === Breakpoint.Sm) {
    return 0;
  }
  if (bp === Breakpoint.Md) {
    return 76;
  }
  return 224;
}

/** 内容区最大宽度，避免超宽屏上行长过长 */
export const CONTENT_MAX_WIDTH: number = 1560;

/** 左侧导航项标识 */
export enum NavKey {
  Overview = 'overview',
  Setup = 'setup',
  Teams = 'teams',
  Schedule = 'schedule',
  Venues = 'venues',
  About = 'about'
}

export interface NavItem {
  key: NavKey;
  label: string;
  symbol: string;
  hint: string;
}

export function navItems(): NavItem[] {
  return [
    { key: NavKey.Overview, label: '赛事总览', symbol: '◱', hint: '规模、进度与冲突摘要' },
    { key: NavKey.Setup, label: '赛事配置', symbol: '⚙', hint: '项目、赛制、时段与场地' },
    { key: NavKey.Teams, label: '参赛队伍', symbol: '☷', hint: '队伍名单与种子设置' },
    { key: NavKey.Schedule, label: '赛程编排', symbol: '▤', hint: '生成赛程、录入比分' },
    { key: NavKey.Venues, label: '场地视图', symbol: '▦', hint: '按场地与时段对照' },
    { key: NavKey.About, label: '关于与帮助', symbol: 'ⓘ', hint: '版本、数据与隐私说明' }
  ];
}
