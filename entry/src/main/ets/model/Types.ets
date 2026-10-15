/**
 * 校园赛程编排器 (Campus Arena)
 * 数据模型、枚举与通用工具
 *
 * 本文件为纯数据层：不引用任何 ArkUI 装饰器，便于单独阅读与测试。
 */

/* ------------------------------------------------------------------ *
 * 枚举
 * ------------------------------------------------------------------ */

/** 比赛项目 */
export enum SportKind {
  Basketball = 'basketball',
  Football = 'football',
  Volleyball = 'volleyball',
  Badminton = 'badminton',
  TableTennis = 'tableTennis'
}

/** 竞赛赛制 */
export enum MatchFormat {
  /** 单循环：每两队交手一次 */
  RoundRobin = 'roundRobin',
  /** 双循环：每两队主客各一次 */
  DoubleRoundRobin = 'doubleRoundRobin',
  /** 单败淘汰 */
  SingleElimination = 'singleElimination',
  /** 小组赛 + 交叉淘汰 */
  GroupKnockout = 'groupKnockout'
}

/** 冲突严重程度 */
export enum ConflictLevel {
  /** 硬冲突：必须修复，赛程不可执行 */
  Error = 'error',
  /** 软冲突：建议调整 */
  Warning = 'warning'
}

/* ------------------------------------------------------------------ *
 * 实体
 * ------------------------------------------------------------------ */

/** 参赛队伍 */
export interface Team {
  id: string;
  /** 队伍名称，如「计算机学院」 */
  name: string;
  /** 所属院系 / 单位 */
  college: string;
  /** 种子序号，0 表示非种子队 */
  seed: number;
}

/** 比赛场地 */
export interface Venue {
  id: string;
  name: string;
}

/** 赛事配置 */
export interface TournamentConfig {
  /** 赛事名称 */
  name: string;
  sport: SportKind;
  format: MatchFormat;
  /** 单场比赛时长（分钟） */
  matchMinutes: number;
  /** 同一场地两场比赛之间的整理间隔（分钟） */
  breakMinutes: number;
  /** 同一支队伍两场比赛之间的最小休息时间（分钟） */
  restMinutes: number;
  /** 首个比赛日，格式 YYYY-MM-DD */
  startDate: string;
  /** 比赛天数 */
  days: number;
  /** 每天可用的开始时刻，自 00:00 起的分钟数 */
  dailyStart: number;
  /** 每天可用的结束时刻，自 00:00 起的分钟数 */
  dailyEnd: number;
  /** 小组赛分组数 */
  groupCount: number;
  /** 每组出线队伍数 */
  advancePerGroup: number;
  /** 可用场地 */
  venues: Venue[];
}

/** 一场比赛 */
export interface Match {
  id: string;
  /** 轮次序号，从 1 开始 */
  roundIndex: number;
  /** 轮次名称，如「第 1 轮」「半决赛」 */
  roundLabel: string;
  /** 主队 id；空字符串表示轮空或待定 */
  homeTeamId: string;
  /** 客队 id；空字符串表示轮空或待定 */
  awayTeamId: string;
  /** 小组序号，-1 表示不分组 */
  groupIndex: number;
  /** 场地 id；空字符串表示尚未排期 */
  venueId: string;
  /** 第几个比赛日，从 0 开始；-1 表示尚未排期 */
  dayIndex: number;
  /** 开始时刻（自 00:00 起的分钟数）；-1 表示尚未排期 */
  startMinutes: number;
  homeScore: number;
  awayScore: number;
  /** 比分是否已录入 */
  played: boolean;
  /** 是否被手动调整过（手动调整的场次在「重新排期」时保留） */
  pinned: boolean;
  /** 待定席位的占位说明，如「A组第1」，空串表示席位已确定 */
  homePlaceholder: string;
  awayPlaceholder: string;
  /** 淘汰赛中胜者进入的比赛 id；空串表示无后续 */
  nextMatchId: string;
  /** 胜者在下一场中的席位：0=主队席，1=客队席，-1=无后续 */
  nextSlot: number;
}

/** 一条冲突记录 */
export interface Conflict {
  level: ConflictLevel;
  /** 涉及的比赛 id */
  matchIds: string[];
  /** 面向用户的说明 */
  message: string;
}

/** 赛事完整状态（持久化单元） */
export interface TournamentState {
  config: TournamentConfig;
  teams: Team[];
  matches: Match[];
}

/* ------------------------------------------------------------------ *
 * 标签与格式化
 * ------------------------------------------------------------------ */

export function sportLabel(kind: SportKind): string {
  switch (kind) {
    case SportKind.Basketball:
      return '篮球';
    case SportKind.Football:
      return '足球';
    case SportKind.Volleyball:
      return '排球';
    case SportKind.Badminton:
      return '羽毛球';
    case SportKind.TableTennis:
      return '乒乓球';
    default:
      return '其他';
  }
}

export function allSports(): SportKind[] {
  return [
    SportKind.Basketball,
    SportKind.Football,
    SportKind.Volleyball,
    SportKind.Badminton,
    SportKind.TableTennis
  ];
}

export function formatLabel(format: MatchFormat): string {
  switch (format) {
    case MatchFormat.RoundRobin:
      return '单循环';
    case MatchFormat.DoubleRoundRobin:
      return '双循环';
    case MatchFormat.SingleElimination:
      return '单败淘汰';
    case MatchFormat.GroupKnockout:
      return '小组赛 + 淘汰赛';
    default:
      return '未知赛制';
  }
}

export function formatHint(format: MatchFormat): string {
  switch (format) {
    case MatchFormat.RoundRobin:
      return '每两支队伍交手一次，按积分排名。适合 4–12 支队伍。';
    case MatchFormat.DoubleRoundRobin:
      return '每两支队伍主客各交手一次，场次约为单循环的两倍。';
    case MatchFormat.SingleElimination:
      return '输一场即淘汰。队伍数不是 2 的幂时，高种子队首轮轮空。';
    case MatchFormat.GroupKnockout:
      return '先分组单循环，各组前若干名交叉进入淘汰赛。';
    default:
      return '';
  }
}

export function allFormats(): MatchFormat[] {
  return [
    MatchFormat.RoundRobin,
    MatchFormat.DoubleRoundRobin,
    MatchFormat.SingleElimination,
    MatchFormat.GroupKnockout
  ];
}

/** 把「自 00:00 起的分钟数」格式化为 HH:mm */
export function formatClock(minutes: number): string {
  if (minutes < 0) {
    return '--:--';
  }
  const h: number = Math.floor(minutes / 60);
  const m: number = minutes % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

/** 把「08:30」解析为自 00:00 起的分钟数；无法解析时返回 fallback */
export function parseClock(text: string, fallback: number): number {
  const trimmed: string = text.trim();
  const parts: string[] = trimmed.split(':');
  if (parts.length !== 2) {
    return fallback;
  }
  const h: number = Number.parseInt(parts[0], 10);
  const m: number = Number.parseInt(parts[1], 10);
  if (Number.isNaN(h) || Number.isNaN(m)) {
    return fallback;
  }
  if (h < 0 || h > 23 || m < 0 || m > 59) {
    return fallback;
  }
  return h * 60 + m;
}

export function pad2(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

/** 在 YYYY-MM-DD 上增加天数 */
export function addDays(isoDate: string, offset: number): string {
  const parts: string[] = isoDate.split('-');
  if (parts.length !== 3) {
    return isoDate;
  }
  const y: number = Number.parseInt(parts[0], 10);
  const mo: number = Number.parseInt(parts[1], 10);
  const d: number = Number.parseInt(parts[2], 10);
  if (Number.isNaN(y) || Number.isNaN(mo) || Number.isNaN(d)) {
    return isoDate;
  }
  const base: Date = new Date(y, mo - 1, d);
  base.setDate(base.getDate() + offset);
  return `${base.getFullYear()}-${pad2(base.getMonth() + 1)}-${pad2(base.getDate())}`;
}

/** 星期几（中文，单字） */
export function weekdayLabel(isoDate: string): string {
  const parts: string[] = isoDate.split('-');
  if (parts.length !== 3) {
    return '';
  }
  const d: Date = new Date(
    Number.parseInt(parts[0], 10),
    Number.parseInt(parts[1], 10) - 1,
    Number.parseInt(parts[2], 10)
  );
  const names: string[] = ['日', '一', '二', '三', '四', '五', '六'];
  const idx: number = d.getDay();
  if (idx < 0 || idx > 6) {
    return '';
  }
  return `周${names[idx]}`;
}

/** 今天的日期，YYYY-MM-DD */
export function todayIso(): string {
  const now: Date = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

/** 生成本地唯一 id */
let idCounter: number = 0;
export function makeId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}`;
}

/* ------------------------------------------------------------------ *
 * 默认配置
 * ------------------------------------------------------------------ */

export function createDefaultVenues(): Venue[] {
  return [
    { id: makeId('venue'), name: '东区体育馆 1 号场' },
    { id: makeId('venue'), name: '东区体育馆 2 号场' }
  ];
}

export function createDefaultConfig(): TournamentConfig {
  return {
    name: '2026 年「学院杯」校园篮球争霸赛',
    sport: SportKind.Basketball,
    format: MatchFormat.RoundRobin,
    matchMinutes: 60,
    breakMinutes: 15,
    restMinutes: 90,
    startDate: todayIso(),
    days: 5,
    dailyStart: 14 * 60,
    dailyEnd: 21 * 60,
    groupCount: 2,
    advancePerGroup: 2,
    venues: createDefaultVenues()
  };
}

export function createDefaultTeams(): Team[] {
  const names: string[] = [
    '计算机学院',
    '商学院',
    '外语学院',
    '工程学院',
    '艺术学院',
    '管理学院'
  ];
  const colleges: string[] = [
    '信息科学与技术学院',
    '商学院',
    '外国语学院',
    '工程学院',
    '艺术设计学院',
    '管理学院'
  ];
  const teams: Team[] = [];
  for (let i = 0; i < names.length; i++) {
    teams.push({
      id: makeId('team'),
      name: names[i],
      college: colleges[i],
      seed: i + 1
    });
  }
  return teams;
}

export function createEmptyState(): TournamentState {
  return {
    config: createDefaultConfig(),
    teams: createDefaultTeams(),
    matches: []
  };
}
