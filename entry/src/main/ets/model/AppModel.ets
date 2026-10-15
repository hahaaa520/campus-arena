/**
 * 校园赛程编排器 (Campus Arena)
 * 可观察应用模型
 *
 * 使用 @Observed 让所有视图共享同一份数据：子组件通过 @ObjectLink 引用本对象，
 * 任何对 config / teams / matches 的重新赋值都会驱动界面刷新。
 * 修改数组时始终整体替换（而非原地 push），以保证变更可被观察。
 */

import {
  Match,
  MatchFormat,
  SportKind,
  Team,
  TournamentConfig,
  TournamentState,
  Venue,
  createDefaultConfig,
  createDefaultTeams,
  makeId
} from './Types';

@Observed
export class AppModel {
  config: TournamentConfig = createDefaultConfig();
  teams: Team[] = createDefaultTeams();
  matches: Match[] = [];

  constructor() {
  }

  /** 从持久化快照恢复 */
  loadFrom(state: TournamentState): void {
    this.config = state.config;
    this.teams = state.teams;
    this.matches = state.matches;
  }

  /** 导出为可持久化的快照 */
  snapshot(): TournamentState {
    return {
      config: this.config,
      teams: this.teams,
      matches: this.matches
    };
  }

  /* ---------------- 队伍 ---------------- */

  addTeam(name: string, college: string): void {
    const next: Team[] = this.teams.slice();
    next.push({ id: makeId('team'), name: name, college: college, seed: 0 });
    this.teams = next;
  }

  updateTeam(id: string, name: string, college: string, seed: number): void {
    const next: Team[] = [];
    for (let i = 0; i < this.teams.length; i++) {
      const t: Team = this.teams[i];
      if (t.id === id) {
        next.push({ id: t.id, name: name, college: college, seed: seed });
      } else {
        next.push(t);
      }
    }
    this.teams = next;
  }

  removeTeam(id: string): void {
    const next: Team[] = [];
    for (let i = 0; i < this.teams.length; i++) {
      if (this.teams[i].id !== id) {
        next.push(this.teams[i]);
      }
    }
    this.teams = next;
    // 同时移除涉及该队的比赛，避免留下悬空引用
    const kept: Match[] = [];
    for (let i = 0; i < this.matches.length; i++) {
      const m: Match = this.matches[i];
      if (m.homeTeamId !== id && m.awayTeamId !== id) {
        kept.push(m);
      }
    }
    this.matches = kept;
  }

  /* ---------------- 场地 ---------------- */

  addVenue(name: string): void {
    const next: Venue[] = this.config.venues.slice();
    next.push({ id: makeId('venue'), name: name });
    this.setVenues(next);
  }

  renameVenue(id: string, name: string): void {
    const next: Venue[] = [];
    for (let i = 0; i < this.config.venues.length; i++) {
      const v: Venue = this.config.venues[i];
      next.push(v.id === id ? { id: v.id, name: name } : v);
    }
    this.setVenues(next);
  }

  removeVenue(id: string): void {
    const next: Venue[] = [];
    for (let i = 0; i < this.config.venues.length; i++) {
      if (this.config.venues[i].id !== id) {
        next.push(this.config.venues[i]);
      }
    }
    this.setVenues(next);
  }

  private setVenues(venues: Venue[]): void {
    this.config = {
      name: this.config.name,
      sport: this.config.sport,
      format: this.config.format,
      matchMinutes: this.config.matchMinutes,
      breakMinutes: this.config.breakMinutes,
      restMinutes: this.config.restMinutes,
      startDate: this.config.startDate,
      days: this.config.days,
      dailyStart: this.config.dailyStart,
      dailyEnd: this.config.dailyEnd,
      groupCount: this.config.groupCount,
      advancePerGroup: this.config.advancePerGroup,
      venues: venues
    };
  }

  /* ---------------- 配置 ---------------- */

  replaceConfig(config: TournamentConfig): void {
    this.config = config;
  }

  /** 局部更新赛事配置；未提供的字段保持原值 */
  patchConfig(patch: ConfigPatch): void {
    const c: TournamentConfig = this.config;
    this.config = {
      name: patch.name !== undefined ? patch.name : c.name,
      sport: patch.sport !== undefined ? patch.sport : c.sport,
      format: patch.format !== undefined ? patch.format : c.format,
      matchMinutes: patch.matchMinutes !== undefined ? patch.matchMinutes : c.matchMinutes,
      breakMinutes: patch.breakMinutes !== undefined ? patch.breakMinutes : c.breakMinutes,
      restMinutes: patch.restMinutes !== undefined ? patch.restMinutes : c.restMinutes,
      startDate: patch.startDate !== undefined ? patch.startDate : c.startDate,
      days: patch.days !== undefined ? patch.days : c.days,
      dailyStart: patch.dailyStart !== undefined ? patch.dailyStart : c.dailyStart,
      dailyEnd: patch.dailyEnd !== undefined ? patch.dailyEnd : c.dailyEnd,
      groupCount: patch.groupCount !== undefined ? patch.groupCount : c.groupCount,
      advancePerGroup: patch.advancePerGroup !== undefined ? patch.advancePerGroup : c.advancePerGroup,
      venues: patch.venues !== undefined ? patch.venues : c.venues
    };
  }

  /* ---------------- 比赛 ---------------- */

  replaceMatches(matches: Match[]): void {
    this.matches = matches;
  }

  /** 局部更新一场比赛 */
  patchMatch(id: string, patch: MatchPatch): void {
    const next: Match[] = [];
    for (let i = 0; i < this.matches.length; i++) {
      const m: Match = this.matches[i];
      if (m.id !== id) {
        next.push(m);
        continue;
      }
      next.push({
        id: m.id,
        roundIndex: m.roundIndex,
        roundLabel: m.roundLabel,
        homeTeamId: patch.homeTeamId !== undefined ? patch.homeTeamId : m.homeTeamId,
        awayTeamId: patch.awayTeamId !== undefined ? patch.awayTeamId : m.awayTeamId,
        groupIndex: m.groupIndex,
        venueId: patch.venueId !== undefined ? patch.venueId : m.venueId,
        dayIndex: patch.dayIndex !== undefined ? patch.dayIndex : m.dayIndex,
        startMinutes: patch.startMinutes !== undefined ? patch.startMinutes : m.startMinutes,
        homeScore: patch.homeScore !== undefined ? patch.homeScore : m.homeScore,
        awayScore: patch.awayScore !== undefined ? patch.awayScore : m.awayScore,
        played: patch.played !== undefined ? patch.played : m.played,
        pinned: patch.pinned !== undefined ? patch.pinned : m.pinned,
        homePlaceholder: patch.homePlaceholder !== undefined ? patch.homePlaceholder : m.homePlaceholder,
        awayPlaceholder: patch.awayPlaceholder !== undefined ? patch.awayPlaceholder : m.awayPlaceholder,
        nextMatchId: m.nextMatchId,
        nextSlot: m.nextSlot
      });
    }
    this.matches = next;
  }

  /** 重置为出厂示例数据 */
  resetToSample(): void {
    this.config = createDefaultConfig();
    this.teams = createDefaultTeams();
    this.matches = [];
  }
}

/** patchMatch 的可选字段集合 */
export interface MatchPatch {
  homeTeamId?: string;
  awayTeamId?: string;
  venueId?: string;
  dayIndex?: number;
  startMinutes?: number;
  homeScore?: number;
  awayScore?: number;
  played?: boolean;
  pinned?: boolean;
  homePlaceholder?: string;
  awayPlaceholder?: string;
}

/** patchConfig 的可选字段集合 */
export interface ConfigPatch {
  name?: string;
  sport?: SportKind;
  format?: MatchFormat;
  matchMinutes?: number;
  breakMinutes?: number;
  restMinutes?: number;
  startDate?: string;
  days?: number;
  dailyStart?: number;
  dailyEnd?: number;
  groupCount?: number;
  advancePerGroup?: number;
  venues?: Venue[];
}

/** 从持久化快照构造模型 */
export function modelFromState(state: TournamentState): AppModel {
  const model: AppModel = new AppModel();
  model.loadFrom(state);
  return model;
}
