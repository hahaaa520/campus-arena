/**
 * 校园赛程编排器 (Campus Arena)
 * 赛程编排算法与冲突检测 —— 本应用的核心逻辑层
 *
 * 全部为纯函数：输入队伍、规则与场地，输出赛程与冲突清单。
 * 不引用任何 ArkUI 装饰器，便于阅读与单独验证。
 */

import {
  Conflict,
  ConflictLevel,
  Match,
  MatchFormat,
  Team,
  TournamentConfig,
  TournamentState,
  Venue,
  addDays,
  formatClock,
  makeId
} from './Types';

/* ------------------------------------------------------------------ *
 * 基础工具
 * ------------------------------------------------------------------ */

/** 轮次内的一对对手 */
export interface Pair {
  home: string;
  away: string;
}

/** 大于等于 n 的最小 2 的幂 */
export function nextPowerOfTwo(n: number): number {
  let size: number = 1;
  while (size < n) {
    size = size * 2;
  }
  return size;
}

/** 小组序号 → 字母标记：0 → A，1 → B … */
export function groupLetter(index: number): string {
  const letters: string = 'ABCDEFGH';
  if (index < 0 || index >= letters.length) {
    return `${index + 1}`;
  }
  return letters.charAt(index);
}

/** 队伍名；空 id 返回占位文案 */
export function teamName(teams: Team[], id: string): string {
  if (id === '') {
    return '待定';
  }
  for (let i = 0; i < teams.length; i++) {
    if (teams[i].id === id) {
      return teams[i].name;
    }
  }
  return '未知队伍';
}

/** 在一组比赛里按 id 查找 */
export function findMatch(matches: Match[], id: string): Match | undefined {
  for (let i = 0; i < matches.length; i++) {
    if (matches[i].id === id) {
      return matches[i];
    }
  }
  return undefined;
}

/* ------------------------------------------------------------------ *
 * 一、对阵生成
 * ------------------------------------------------------------------ */

/**
 * 圆桌轮转法（circle method）生成单循环对阵。
 * 队伍数为奇数时自动补一个空位表示轮空。
 */
export function roundRobinRounds(teamIds: string[], doubleRound: boolean): Pair[][] {
  const rounds: Pair[][] = [];
  if (teamIds.length < 2) {
    return rounds;
  }

  const pool: string[] = teamIds.slice();
  const hadBye: boolean = pool.length % 2 === 1;
  if (hadBye) {
    pool.push('');
  }

  const n: number = pool.length;
  const half: number = n / 2;
  const totalRounds: number = n - 1;
  let arr: string[] = pool.slice();

  for (let r = 0; r < totalRounds; r++) {
    const pairs: Pair[] = [];
    for (let i = 0; i < half; i++) {
      const a: string = arr[i];
      const b: string = arr[n - 1 - i];
      if (a === '' || b === '') {
        continue;
      }
      // 交替主客，尽量均衡
      if (r % 2 === 0) {
        pairs.push({ home: a, away: b });
      } else {
        pairs.push({ home: b, away: a });
      }
    }
    rounds.push(pairs);

    // 轮转：首位固定，其余顺时针移动一格
    const next: string[] = [arr[0]];
    next.push(arr[n - 1]);
    for (let i = 1; i < n - 1; i++) {
      next.push(arr[i]);
    }
    arr = next;
  }

  if (doubleRound) {
    const second: Pair[][] = [];
    for (let r = 0; r < rounds.length; r++) {
      const pairs: Pair[] = [];
      for (let i = 0; i < rounds[r].length; i++) {
        const p: Pair = rounds[r][i];
        pairs.push({ home: p.away, away: p.home });
      }
      second.push(pairs);
    }
    return rounds.concat(second);
  }

  return rounds;
}

/**
 * 标准淘汰赛种子排位顺序。
 * size=8 → [1,8,4,5,2,7,3,6]
 */
export function seedOrder(size: number): number[] {
  let order: number[] = [1, 2];
  let level: number = 2;
  while (level < size) {
    const sum: number = order.length * 2 + 1;
    const next: number[] = [];
    for (let i = 0; i < order.length; i++) {
      next.push(order[i]);
      next.push(sum - order[i]);
    }
    order = next;
    level = level * 2;
  }
  return order;
}

/** 根据该轮剩余队伍数给出中文轮次名 */
export function eliminationRoundLabel(remaining: number, roundIndex: number): string {
  if (remaining === 2) {
    return '决赛';
  }
  if (remaining === 4) {
    return '半决赛';
  }
  if (remaining === 8) {
    return '1/4 决赛';
  }
  if (remaining === 16) {
    return '1/8 决赛';
  }
  return `第 ${roundIndex} 轮`;
}

function makeMatch(): Match {
  return {
    id: makeId('match'),
    roundIndex: 0,
    roundLabel: '',
    homeTeamId: '',
    awayTeamId: '',
    groupIndex: -1,
    venueId: '',
    dayIndex: -1,
    startMinutes: -1,
    homeScore: 0,
    awayScore: 0,
    played: false,
    pinned: false,
    homePlaceholder: '',
    awayPlaceholder: '',
    nextMatchId: '',
    nextSlot: -1
  };
}

/** 单败淘汰：按种子排位生成完整对阵树（含轮空） */
export function buildElimination(teamIds: string[]): Match[] {
  const matches: Match[] = [];
  if (teamIds.length < 2) {
    return matches;
  }

  const bracketSize: number = nextPowerOfTwo(teamIds.length);
  const slots: number[] = seedOrder(bracketSize);
  const totalRounds: number = Math.round(Math.log2(bracketSize));

  // 每轮的比赛容器，便于回填 nextMatchId
  const roundsMatches: Match[][] = [];

  for (let r = 1; r <= totalRounds; r++) {
    const remaining: number = bracketSize / Math.pow(2, r - 1);
    const count: number = remaining / 2;
    const label: string = eliminationRoundLabel(remaining, r);
    const list: Match[] = [];
    for (let i = 0; i < count; i++) {
      const m: Match = makeMatch();
      m.roundIndex = r;
      m.roundLabel = label;
      list.push(m);
    }
    roundsMatches.push(list);
  }

  // 首轮：把种子席位灌入
  const first: Match[] = roundsMatches[0];
  for (let i = 0; i < first.length; i++) {
    const homeSeed: number = slots[i * 2];
    const awaySeed: number = slots[i * 2 + 1];
    if (homeSeed <= teamIds.length) {
      first[i].homeTeamId = teamIds[homeSeed - 1];
    } else {
      first[i].homePlaceholder = `种子 ${homeSeed}`;
    }
    if (awaySeed <= teamIds.length) {
      first[i].awayTeamId = teamIds[awaySeed - 1];
    } else {
      first[i].awayPlaceholder = `种子 ${awaySeed}`;
    }
  }

  // 轮空处理：首轮中一方为空的比赛直接判另一方晋级
  for (let i = 0; i < first.length; i++) {
    const m: Match = first[i];
    const homeEmpty: boolean = m.homeTeamId === '';
    const awayEmpty: boolean = m.awayTeamId === '';
    if (homeEmpty !== awayEmpty) {
      m.played = true;
      m.homeScore = homeEmpty ? 0 : 1;
      m.awayScore = awayEmpty ? 0 : 1;
    }
  }

  // 串联后续轮次
  for (let r = 0; r < roundsMatches.length - 1; r++) {
    const cur: Match[] = roundsMatches[r];
    const nxt: Match[] = roundsMatches[r + 1];
    for (let i = 0; i < cur.length; i++) {
      const target: Match = nxt[Math.floor(i / 2)];
      cur[i].nextMatchId = target.id;
      cur[i].nextSlot = i % 2;
    }
  }

  for (let r = 0; r < roundsMatches.length; r++) {
    const list: Match[] = roundsMatches[r];
    for (let i = 0; i < list.length; i++) {
      matches.push(list[i]);
    }
  }

  return matches;
}

/** 小组赛 + 淘汰赛：先分组单循环，再按名次交叉淘汰 */
export function buildGroupKnockout(
  teamIds: string[],
  groupCount: number,
  advancePerGroup: number
): Match[] {
  const matches: Match[] = [];
  if (teamIds.length < 2) {
    return matches;
  }

  let groups: number = Math.max(1, Math.min(groupCount, Math.floor(teamIds.length / 2)));
  const buckets: string[][] = [];
  for (let g = 0; g < groups; g++) {
    buckets.push([]);
  }

  // 蛇形分配，让种子队分散到不同小组
  for (let i = 0; i < teamIds.length; i++) {
    const cycle: number = Math.floor(i / groups);
    let slot: number = i % groups;
    if (cycle % 2 === 1) {
      slot = groups - 1 - slot;
    }
    buckets[slot].push(teamIds[i]);
  }

  // 小组单循环
  for (let g = 0; g < buckets.length; g++) {
    const rounds: Pair[][] = roundRobinRounds(buckets[g], false);
    for (let r = 0; r < rounds.length; r++) {
      const pairs: Pair[] = rounds[r];
      for (let i = 0; i < pairs.length; i++) {
        const m: Match = makeMatch();
        m.roundIndex = r + 1;
        m.roundLabel = `${groupLetter(g)} 组 第 ${r + 1} 轮`;
        m.groupIndex = g;
        m.homeTeamId = pairs[i].home;
        m.awayTeamId = pairs[i].away;
        matches.push(m);
      }
    }
  }

  // 淘汰赛席位：每组前 N 名交叉配对
  const qualified: number = groups * Math.max(1, advancePerGroup);
  if (qualified >= 2) {
    const bracketSize: number = nextPowerOfTwo(qualified);
    const totalRounds: number = Math.round(Math.log2(bracketSize));
    const ko: Match[][] = [];
    for (let r = 1; r <= totalRounds; r++) {
      const remaining: number = bracketSize / Math.pow(2, r - 1);
      const count: number = remaining / 2;
      const list: Match[] = [];
      for (let i = 0; i < count; i++) {
        const m: Match = makeMatch();
        m.roundIndex = 100 + r; // 淘汰赛轮次编号靠后，排序时自然排在小组赛之后
        m.roundLabel = eliminationRoundLabel(remaining, r);
        list.push(m);
      }
      ko.push(list);
    }

    // 首轮席位标注：A组第1 vs B组第2 …
    const firstKo: Match[] = ko[0];
    for (let i = 0; i < firstKo.length; i++) {
      firstKo[i].homePlaceholder = crossGroupLabel(i * 2, groups, advancePerGroup);
      firstKo[i].awayPlaceholder = crossGroupLabel(i * 2 + 1, groups, advancePerGroup);
    }

    for (let r = 0; r < ko.length - 1; r++) {
      const cur: Match[] = ko[r];
      const nxt: Match[] = ko[r + 1];
      for (let i = 0; i < cur.length; i++) {
        const target: Match = nxt[Math.floor(i / 2)];
        cur[i].nextMatchId = target.id;
        cur[i].nextSlot = i % 2;
      }
    }

    for (let r = 0; r < ko.length; r++) {
      const list: Match[] = ko[r];
      for (let i = 0; i < list.length; i++) {
        matches.push(list[i]);
      }
    }
  }

  return matches;
}

/** 交叉淘汰席位文案：index 0 → A组第1，index 1 → B组第2 … */
function crossGroupLabel(index: number, groups: number, advancePerGroup: number): string {
  const g: number = index % groups;
  const rank: number = Math.floor(index / groups) + 1;
  if (rank > advancePerGroup) {
    return '待定';
  }
  return `${groupLetter(g)} 组第 ${rank}`;
}

/** 按当前配置与队伍生成全部对阵 */
export function generateMatches(config: TournamentConfig, teams: Team[]): Match[] {
  const ids: string[] = [];
  for (let i = 0; i < teams.length; i++) {
    ids.push(teams[i].id);
  }

  if (ids.length < 2) {
    return [];
  }

  if (config.format === MatchFormat.SingleElimination) {
    return buildElimination(ids);
  }

  if (config.format === MatchFormat.GroupKnockout) {
    return buildGroupKnockout(ids, config.groupCount, config.advancePerGroup);
  }

  const doubleRound: boolean = config.format === MatchFormat.DoubleRoundRobin;
  const rounds: Pair[][] = roundRobinRounds(ids, doubleRound);
  const matches: Match[] = [];
  for (let r = 0; r < rounds.length; r++) {
    const pairs: Pair[] = rounds[r];
    for (let i = 0; i < pairs.length; i++) {
      const m: Match = makeMatch();
      m.roundIndex = r + 1;
      m.roundLabel = `第 ${r + 1} 轮`;
      m.homeTeamId = pairs[i].home;
      m.awayTeamId = pairs[i].away;
      matches.push(m);
    }
  }
  return matches;
}

/* ------------------------------------------------------------------ *
 * 二、排期
 * ------------------------------------------------------------------ */

/** 一个可用的比赛时段 */
interface Slot {
  dayIndex: number;
  venueId: string;
  start: number;
}

/** 生成所有候选时段（按时间先后排序） */
function buildSlots(config: TournamentConfig): Slot[] {
  const slots: Slot[] = [];
  const step: number = Math.max(10, config.matchMinutes + config.breakMinutes);
  const venues: Venue[] = config.venues;
  for (let d = 0; d < Math.max(1, config.days); d++) {
    for (let t = config.dailyStart; t + config.matchMinutes <= config.dailyEnd; t += step) {
      for (let v = 0; v < venues.length; v++) {
        slots.push({ dayIndex: d, venueId: venues[v].id, start: t });
      }
    }
  }
  // 按时间排序，同一时刻优先分配不同场地
  slots.sort((a: Slot, b: Slot): number => {
    if (a.dayIndex !== b.dayIndex) {
      return a.dayIndex - b.dayIndex;
    }
    if (a.start !== b.start) {
      return a.start - b.start;
    }
    return 0;
  });
  return slots;
}

function slotKey(dayIndex: number, venueId: string, start: number): string {
  return `${dayIndex}|${venueId}|${start}`;
}

/**
 * 贪心排期：按轮次顺序为每场比赛寻找最早的可行时段。
 *
 * 约束：
 *   1. 同一场地同一时刻只能有一场比赛；
 *   2. 同一支队伍同一时刻只能有一场比赛；
 *   3. 同一支队伍两场比赛之间至少间隔 config.restMinutes 分钟；
 *   4. 比赛必须落在每日可用时间窗内。
 *
 * 已被手动调整（pinned）的场次会保留原时段，并占用相应资源。
 */
export function scheduleMatches(matches: Match[], config: TournamentConfig): Match[] {
  const result: Match[] = [];
  for (let i = 0; i < matches.length; i++) {
    const copy: Match = cloneMatch(matches[i]);
    result.push(copy);
  }

  if (config.venues.length === 0) {
    for (let i = 0; i < result.length; i++) {
      result[i].venueId = '';
      result[i].dayIndex = -1;
      result[i].startMinutes = -1;
    }
    return result;
  }

  const slots: Slot[] = buildSlots(config);
  const venueTaken: Set<string> = new Set<string>();
  // 队伍 → 该比赛日已排定的 [开始, 结束] 区间列表
  const teamBusy: Map<string, number[]> = new Map<string, number[]>();

  const mark = (m: Match): void => {
    if (m.dayIndex < 0 || m.venueId === '' || m.startMinutes < 0) {
      return;
    }
    venueTaken.add(slotKey(m.dayIndex, m.venueId, m.startMinutes));
    const end: number = m.startMinutes + config.matchMinutes;
    addBusy(teamBusy, m.dayIndex, m.homeTeamId, m.startMinutes, end);
    addBusy(teamBusy, m.dayIndex, m.awayTeamId, m.startMinutes, end);
  };

  // 先登记所有被钉住的场次
  for (let i = 0; i < result.length; i++) {
    if (result[i].pinned) {
      mark(result[i]);
    }
  }

  // 按轮次顺序排期（淘汰赛轮次编号靠后，自然排在最后）
  const order: number[] = [];
  for (let i = 0; i < result.length; i++) {
    if (!result[i].pinned) {
      order.push(i);
    }
  }
  order.sort((a: number, b: number): number => {
    if (result[a].roundIndex !== result[b].roundIndex) {
      return result[a].roundIndex - result[b].roundIndex;
    }
    return 0;
  });

  for (let k = 0; k < order.length; k++) {
    const m: Match = result[order[k]];
    let assigned: boolean = false;

    for (let s = 0; s < slots.length; s++) {
      const slot: Slot = slots[s];
      if (venueTaken.has(slotKey(slot.dayIndex, slot.venueId, slot.start))) {
        continue;
      }
      const start: number = slot.start;
      const end: number = start + config.matchMinutes;
      if (!isTeamFree(teamBusy, slot.dayIndex, m.homeTeamId, start, end, config.restMinutes)) {
        continue;
      }
      if (!isTeamFree(teamBusy, slot.dayIndex, m.awayTeamId, start, end, config.restMinutes)) {
        continue;
      }

      m.dayIndex = slot.dayIndex;
      m.venueId = slot.venueId;
      m.startMinutes = start;
      mark(m);
      assigned = true;
      break;
    }

    if (!assigned) {
      m.dayIndex = -1;
      m.venueId = '';
      m.startMinutes = -1;
    }
  }

  return result;
}

function addBusy(busy: Map<string, number[]>, dayIndex: number, teamId: string, start: number, end: number): void {
  if (teamId === '') {
    return;
  }
  const key: string = `${dayIndex}|${teamId}`;
  const list: number[] | undefined = busy.get(key);
  if (list === undefined) {
    busy.set(key, [start, end]);
  } else {
    list.push(start);
    list.push(end);
  }
}

function isTeamFree(
  busy: Map<string, number[]>,
  dayIndex: number,
  teamId: string,
  start: number,
  end: number,
  restMinutes: number
): boolean {
  if (teamId === '') {
    return true;
  }
  const list: number[] | undefined = busy.get(`${dayIndex}|${teamId}`);
  if (list === undefined) {
    return true;
  }
  for (let i = 0; i + 1 < list.length; i += 2) {
    const bStart: number = list[i];
    const bEnd: number = list[i + 1];
    // 与已有场次重叠，或休息不足
    if (start < bEnd + restMinutes && bStart < end + restMinutes) {
      return false;
    }
  }
  return true;
}

export function cloneMatch(m: Match): Match {
  return {
    id: m.id,
    roundIndex: m.roundIndex,
    roundLabel: m.roundLabel,
    homeTeamId: m.homeTeamId,
    awayTeamId: m.awayTeamId,
    groupIndex: m.groupIndex,
    venueId: m.venueId,
    dayIndex: m.dayIndex,
    startMinutes: m.startMinutes,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    played: m.played,
    pinned: m.pinned,
    homePlaceholder: m.homePlaceholder,
    awayPlaceholder: m.awayPlaceholder,
    nextMatchId: m.nextMatchId,
    nextSlot: m.nextSlot
  };
}

export function cloneMatches(list: Match[]): Match[] {
  const out: Match[] = [];
  for (let i = 0; i < list.length; i++) {
    out.push(cloneMatch(list[i]));
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * 三、冲突检测
 * ------------------------------------------------------------------ */

/**
 * 全面检查赛程的可行性与合理性。
 * Error 级问题会导致赛程无法执行；Warning 级问题建议调整。
 */
export function detectConflicts(
  matches: Match[],
  config: TournamentConfig,
  teams: Team[]
): Conflict[] {
  const conflicts: Conflict[] = [];
  const venueName: Map<string, string> = new Map<string, string>();
  for (let i = 0; i < config.venues.length; i++) {
    venueName.set(config.venues[i].id, config.venues[i].name);
  }

  const scheduled: Match[] = [];
  let unscheduled: number = 0;
  for (let i = 0; i < matches.length; i++) {
    const m: Match = matches[i];
    if (m.dayIndex < 0 || m.venueId === '' || m.startMinutes < 0) {
      unscheduled += 1;
    } else {
      scheduled.push(m);
    }
  }

  if (unscheduled > 0) {
    conflicts.push({
      level: ConflictLevel.Error,
      matchIds: [],
      message: `有 ${unscheduled} 场比赛无法排入现有场地与时段，请增加比赛日、延长每日时段或增开场地。`
    });
  }

  // 逐对比较：同一比赛日内检查场地占用与队伍重叠
  const byDay: Map<number, Match[]> = new Map<number, Match[]>();
  for (let i = 0; i < scheduled.length; i++) {
    const m: Match = scheduled[i];
    const list: Match[] | undefined = byDay.get(m.dayIndex);
    if (list === undefined) {
      byDay.set(m.dayIndex, [m]);
    } else {
      list.push(m);
    }
  }

  const dayKeys: number[] = Array.from(byDay.keys());
  for (let di = 0; di < dayKeys.length; di++) {
    const day: number = dayKeys[di];
    const list: Match[] | undefined = byDay.get(day);
    if (list === undefined) {
      continue;
    }
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a: Match = list[i];
        const b: Match = list[j];
        const aEnd: number = a.startMinutes + config.matchMinutes;
        const bEnd: number = b.startMinutes + config.matchMinutes;

        // ① 场地重复占用
        if (a.venueId === b.venueId && a.startMinutes < bEnd && b.startMinutes < aEnd) {
          const vn: string = venueName.get(a.venueId) ?? '未知场地';
          conflicts.push({
            level: ConflictLevel.Error,
            matchIds: [a.id, b.id],
            message: `场地冲突：第 ${day + 1} 比赛日 ${formatClock(Math.max(a.startMinutes, b.startMinutes))}，`
              + `${vn} 同时安排了「${matchTitle(a, teams)}」与「${matchTitle(b, teams)}」。`
          });
        }

        // ② 同一队伍同时段出场
        if (shareTeam(a, b) && a.startMinutes < bEnd && b.startMinutes < aEnd) {
          conflicts.push({
            level: ConflictLevel.Error,
            matchIds: [a.id, b.id],
            message: `队伍冲突：第 ${day + 1} 比赛日 ${formatClock(Math.max(a.startMinutes, b.startMinutes))}，`
              + `${sharedTeamNames(a, b, teams)} 同时被安排了两场比赛。`
          });
        } else if (shareTeam(a, b)) {
          // ③ 休息时间不足
          const gap: number = a.startMinutes < b.startMinutes ? b.startMinutes - aEnd : a.startMinutes - bEnd;
          if (gap < config.restMinutes) {
            conflicts.push({
              level: ConflictLevel.Warning,
              matchIds: [a.id, b.id],
              message: `休息不足：第 ${day + 1} 比赛日 ${sharedTeamNames(a, b, teams)} 两场比赛仅间隔 `
                + `${gap} 分钟，少于设定的 ${config.restMinutes} 分钟。`
            });
          }
        }
      }
    }
  }

  // ④ 超出每日时间窗
  for (let i = 0; i < scheduled.length; i++) {
    const m: Match = scheduled[i];
    const end: number = m.startMinutes + config.matchMinutes;
    if (m.startMinutes < config.dailyStart || end > config.dailyEnd) {
      conflicts.push({
        level: ConflictLevel.Warning,
        matchIds: [m.id],
        message: `时段越界：第 ${m.dayIndex + 1} 比赛日「${matchTitle(m, teams)}」安排在 `
          + `${formatClock(m.startMinutes)}–${formatClock(end)}，超出每日可用时段 `
          + `${formatClock(config.dailyStart)}–${formatClock(config.dailyEnd)}。`
      });
    }
    if (m.dayIndex >= config.days) {
      conflicts.push({
        level: ConflictLevel.Error,
        matchIds: [m.id],
        message: `「${matchTitle(m, teams)}」被排到第 ${m.dayIndex + 1} 比赛日，已超出设定的 ${config.days} 天赛期。`
      });
    }
  }

  // ⑤ 队伍参赛场次为 0（可能有队伍被遗漏）
  // 只有已经生成过赛程时才检查：否则首次进入应用会对每支队伍都报一条
  // 「没有任何比赛」，看起来像应用出错。
  if (matches.length > 0) {
    const appearCount: Map<string, number> = new Map<string, number>();
    for (let i = 0; i < matches.length; i++) {
      bump(appearCount, matches[i].homeTeamId);
      bump(appearCount, matches[i].awayTeamId);
    }
    for (let i = 0; i < teams.length; i++) {
      const c: number | undefined = appearCount.get(teams[i].id);
      if (c === undefined || c === 0) {
        conflicts.push({
          level: ConflictLevel.Warning,
          matchIds: [],
          message: `「${teams[i].name}」没有任何比赛，请在队伍管理中确认，或重新生成赛程。`
        });
      }
    }
  }

  return conflicts;
}

function bump(counter: Map<string, number>, id: string): void {
  if (id === '') {
    return;
  }
  const cur: number | undefined = counter.get(id);
  counter.set(id, (cur === undefined ? 0 : cur) + 1);
}

function shareTeam(a: Match, b: Match): boolean {
  const aIds: string[] = [a.homeTeamId, a.awayTeamId];
  const bIds: string[] = [b.homeTeamId, b.awayTeamId];
  for (let i = 0; i < aIds.length; i++) {
    if (aIds[i] === '') {
      continue;
    }
    for (let j = 0; j < bIds.length; j++) {
      if (aIds[i] === bIds[j]) {
        return true;
      }
    }
  }
  return false;
}

function sharedTeamNames(a: Match, b: Match, teams: Team[]): string {
  const names: string[] = [];
  const aIds: string[] = [a.homeTeamId, a.awayTeamId];
  const bIds: string[] = [b.homeTeamId, b.awayTeamId];
  for (let i = 0; i < aIds.length; i++) {
    if (aIds[i] === '') {
      continue;
    }
    for (let j = 0; j < bIds.length; j++) {
      if (aIds[i] === bIds[j]) {
        const n: string = teamName(teams, aIds[i]);
        if (!names.includes(n)) {
          names.push(n);
        }
      }
    }
  }
  return names.join('、');
}

/** 比赛的简短标题 */
export function matchTitle(m: Match, teams: Team[]): string {
  const home: string = m.homeTeamId === '' ? (m.homePlaceholder === '' ? '待定' : m.homePlaceholder)
    : teamName(teams, m.homeTeamId);
  const away: string = m.awayTeamId === '' ? (m.awayPlaceholder === '' ? '待定' : m.awayPlaceholder)
    : teamName(teams, m.awayTeamId);
  return `${home} vs ${away}`;
}

/* ------------------------------------------------------------------ *
 * 四、成绩与积分
 * ------------------------------------------------------------------ */

export interface Standing {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  scoreFor: number;
  scoreAgainst: number;
  points: number;
}

/** 计算循环赛积分榜（胜 3 分、平 1 分、负 0 分） */
export function computeStandings(matches: Match[], teams: Team[]): Standing[] {
  const table: Map<string, Standing> = new Map<string, Standing>();
  for (let i = 0; i < teams.length; i++) {
    table.set(teams[i].id, {
      teamId: teams[i].id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      scoreFor: 0,
      scoreAgainst: 0,
      points: 0
    });
  }

  for (let i = 0; i < matches.length; i++) {
    const m: Match = matches[i];
    if (!m.played || m.homeTeamId === '' || m.awayTeamId === '') {
      continue;
    }
    const home: Standing | undefined = table.get(m.homeTeamId);
    const away: Standing | undefined = table.get(m.awayTeamId);
    if (home === undefined || away === undefined) {
      continue;
    }
    home.played += 1;
    away.played += 1;
    home.scoreFor += m.homeScore;
    home.scoreAgainst += m.awayScore;
    away.scoreFor += m.awayScore;
    away.scoreAgainst += m.homeScore;

    if (m.homeScore > m.awayScore) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (m.homeScore < m.awayScore) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  const list: Standing[] = Array.from(table.values());
  list.sort((a: Standing, b: Standing): number => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    const aDiff: number = a.scoreFor - a.scoreAgainst;
    const bDiff: number = b.scoreFor - b.scoreAgainst;
    if (bDiff !== aDiff) {
      return bDiff - aDiff;
    }
    return b.scoreFor - a.scoreFor;
  });
  return list;
}

/* ------------------------------------------------------------------ *
 * 五、淘汰赛晋级传播
 * ------------------------------------------------------------------ */

/**
 * 把已结束比赛的胜者填入下一轮对应席位。
 * 返回新的比赛数组（不修改入参）。
 */
export function propagateWinners(matches: Match[]): Match[] {
  const result: Match[] = cloneMatches(matches);
  for (let i = 0; i < result.length; i++) {
    const m: Match = result[i];
    if (!m.played || m.nextMatchId === '' || m.nextSlot < 0) {
      continue;
    }
    if (m.homeTeamId === '' || m.awayTeamId === '') {
      continue;
    }
    const winner: string = m.homeScore >= m.awayScore ? m.homeTeamId : m.awayTeamId;
    for (let j = 0; j < result.length; j++) {
      if (result[j].id !== m.nextMatchId) {
        continue;
      }
      if (m.nextSlot === 0) {
        result[j].homeTeamId = winner;
        result[j].homePlaceholder = '';
      } else {
        result[j].awayTeamId = winner;
        result[j].awayPlaceholder = '';
      }
      break;
    }
  }
  return result;
}

/* ------------------------------------------------------------------ *
 * 六、导出
 * ------------------------------------------------------------------ */

/** 生成 CSV 文本（UTF-8，带 BOM 以便 Excel 正确识别中文） */
export function toCsv(state: TournamentState): string {
  const lines: string[] = [];
  lines.push('比赛日,日期,星期,开始,结束,场地,轮次,组别,主队,客队,比分,状态');
  const matches: Match[] = state.matches;
  const teams: Team[] = state.teams;
  const sorted: Match[] = matches.slice();
  sorted.sort((a: Match, b: Match): number => compareSchedule(a, b));
  for (let i = 0; i < sorted.length; i++) {
    const m: Match = sorted[i];
    const date: string = m.dayIndex >= 0 ? addDays(state.config.startDate, m.dayIndex) : '';
    const day: string = m.dayIndex >= 0 ? `第 ${m.dayIndex + 1} 天` : '未排期';
    const start: string = m.startMinutes >= 0 ? formatClock(m.startMinutes) : '';
    const end: string = m.startMinutes >= 0 ? formatClock(m.startMinutes + state.config.matchMinutes) : '';
    const venue: string = venueNameOf(state.config.venues, m.venueId);
    const group: string = m.groupIndex >= 0 ? `${groupLetter(m.groupIndex)} 组` : '';
    const home: string = m.homeTeamId === '' ? m.homePlaceholder : teamName(teams, m.homeTeamId);
    const away: string = m.awayTeamId === '' ? m.awayPlaceholder : teamName(teams, m.awayTeamId);
    const score: string = m.played ? `${m.homeScore}:${m.awayScore}` : '';
    const status: string = m.played ? '已完赛' : '未开始';
    lines.push([
      day, date, date === '' ? '' : weekdayOf(date), start, end, venue, m.roundLabel, group,
      csvCell(home), csvCell(away), score, status
    ].join(','));
  }
  return '\ufeff' + lines.join('\r\n') + '\r\n';
}

function csvCell(text: string): string {
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function weekdayOf(iso: string): string {
  const parts: string[] = iso.split('-');
  if (parts.length !== 3) {
    return '';
  }
  const d: Date = new Date(
    Number.parseInt(parts[0], 10),
    Number.parseInt(parts[1], 10) - 1,
    Number.parseInt(parts[2], 10)
  );
  const names: string[] = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const idx: number = d.getDay();
  return idx >= 0 && idx <= 6 ? names[idx] : '';
}

export function venueNameOf(venues: Venue[], id: string): string {
  for (let i = 0; i < venues.length; i++) {
    if (venues[i].id === id) {
      return venues[i].name;
    }
  }
  return '';
}

/** 赛程排序：先按比赛日与开始时刻，未排期的排在最后 */
export function compareSchedule(a: Match, b: Match): number {
  const aUn: boolean = a.dayIndex < 0 || a.startMinutes < 0;
  const bUn: boolean = b.dayIndex < 0 || b.startMinutes < 0;
  if (aUn !== bUn) {
    return aUn ? 1 : -1;
  }
  if (aUn && bUn) {
    if (a.roundIndex !== b.roundIndex) {
      return a.roundIndex - b.roundIndex;
    }
    return 0;
  }
  if (a.dayIndex !== b.dayIndex) {
    return a.dayIndex - b.dayIndex;
  }
  if (a.startMinutes !== b.startMinutes) {
    return a.startMinutes - b.startMinutes;
  }
  return 0;
}

/** 赛事规模摘要，用于总览页 */
export interface TournamentSummary {
  matchTotal: number;
  matchScheduled: number;
  matchPlayed: number;
  errorCount: number;
  warningCount: number;
  daysUsed: number;
}

export function summarize(
  matches: Match[],
  conflicts: Conflict[],
  config: TournamentConfig
): TournamentSummary {
  let scheduled: number = 0;
  let played: number = 0;
  const days: Set<number> = new Set<number>();
  for (let i = 0; i < matches.length; i++) {
    const m: Match = matches[i];
    if (m.dayIndex >= 0 && m.startMinutes >= 0 && m.venueId !== '') {
      scheduled += 1;
      days.add(m.dayIndex);
    }
    if (m.played) {
      played += 1;
    }
  }
  let errors: number = 0;
  let warnings: number = 0;
  for (let i = 0; i < conflicts.length; i++) {
    if (conflicts[i].level === ConflictLevel.Error) {
      errors += 1;
    } else {
      warnings += 1;
    }
  }
  return {
    matchTotal: matches.length,
    matchScheduled: scheduled,
    matchPlayed: played,
    errorCount: errors,
    warningCount: warnings,
    daysUsed: days.size
  };
}
