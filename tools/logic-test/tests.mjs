/**
 * 校园赛程编排器 (Campus Arena) —— 核心算法验证
 *
 * 直接对 entry/src/main/ets/model 下的真实源码做类型擦除后运行，
 * 验证对阵生成、排期约束、冲突检测与导出逻辑。
 *
 * 运行：见 tools/logic-test/run-tests.cmd
 */

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
// Compiled by run-tests.cmd into <project>/.logic-test/out
const S = require('../../.logic-test/out/Scheduler.js');
const T = require('../../.logic-test/out/Types.js');

let passed = 0;
let failed = 0;
const failures = [];

function check(name, condition, detail) {
  if (condition) {
    passed += 1;
    console.log(`  \u2713 ${name}`);
  } else {
    failed += 1;
    failures.push(name + (detail ? ` :: ${detail}` : ''));
    console.log(`  \u2717 ${name}${detail ? '  -> ' + detail : ''}`);
  }
}

function section(title) {
  console.log(`\n${title}`);
}

/** 生成 n 个队伍 id */
function ids(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(`t${i + 1}`);
  }
  return out;
}

function teams(n) {
  return ids(n).map((id, i) => ({ id, name: `队伍${i + 1}`, college: `学院${i + 1}`, seed: i + 1 }));
}

function pairKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/* ================================================================== *
 * 1. 单循环对阵（圆桌轮转法）
 * ================================================================== */

section('1. 单循环对阵生成');

{
  const rounds = S.roundRobinRounds(ids(6), false);
  const pairs = rounds.flat();
  check('6 支队 → 5 轮', rounds.length === 5, `实际 ${rounds.length}`);
  check('6 支队 → 15 场', pairs.length === 15, `实际 ${pairs.length}`);

  const keys = new Set(pairs.map((p) => pairKey(p.home, p.away)));
  check('6 支队 → 无重复对阵', keys.size === 15, `唯一对阵 ${keys.size}`);

  const counts = new Map();
  for (const p of pairs) {
    counts.set(p.home, (counts.get(p.home) ?? 0) + 1);
    counts.set(p.away, (counts.get(p.away) ?? 0) + 1);
  }
  check('6 支队 → 每队出场 5 次', [...counts.values()].every((c) => c === 5),
    JSON.stringify([...counts.values()]));

  let eachRoundOk = true;
  for (const r of rounds) {
    const seen = new Set();
    for (const p of r) {
      if (seen.has(p.home) || seen.has(p.away)) {
        eachRoundOk = false;
      }
      seen.add(p.home);
      seen.add(p.away);
    }
  }
  check('6 支队 → 同一轮内无球队重复', eachRoundOk);
}

{
  const rounds = S.roundRobinRounds(ids(5), false);
  const pairs = rounds.flat();
  check('5 支队（奇数）→ 5 轮', rounds.length === 5, `实际 ${rounds.length}`);
  check('5 支队 → 10 场', pairs.length === 10, `实际 ${pairs.length}`);
  const keys = new Set(pairs.map((p) => pairKey(p.home, p.away)));
  check('5 支队 → 无重复对阵', keys.size === 10, `唯一对阵 ${keys.size}`);
}

{
  const rounds = S.roundRobinRounds(ids(6), true);
  const pairs = rounds.flat();
  check('6 支队双循环 → 30 场', pairs.length === 30, `实际 ${pairs.length}`);
}

{
  const rounds = S.roundRobinRounds(ids(2), false);
  check('2 支队 → 1 场', rounds.flat().length === 1);
}

{
  const rounds = S.roundRobinRounds(ids(1), false);
  check('1 支队 → 0 场（不崩溃）', rounds.flat().length === 0);
}

/* ================================================================== *
 * 2. 淘汰赛
 * ================================================================== */

section('2. 单败淘汰对阵');

check('种子排位 size=4 → [1,4,2,3]', JSON.stringify(S.seedOrder(4)) === '[1,4,2,3]',
  JSON.stringify(S.seedOrder(4)));
check('种子排位 size=8 → [1,8,4,5,2,7,3,6]',
  JSON.stringify(S.seedOrder(8)) === '[1,8,4,5,2,7,3,6]', JSON.stringify(S.seedOrder(8)));
check('nextPowerOfTwo(6) === 8', S.nextPowerOfTwo(6) === 8);
check('nextPowerOfTwo(8) === 8', S.nextPowerOfTwo(8) === 8);

{
  const m = S.buildElimination(ids(8));
  check('8 支队淘汰赛 → 7 场', m.length === 7, `实际 ${m.length}`);
  const finals = m.filter((x) => x.roundLabel === '决赛');
  check('8 支队淘汰赛 → 有 1 场决赛', finals.length === 1);
  const semis = m.filter((x) => x.roundLabel === '半决赛');
  check('8 支队淘汰赛 → 有 2 场半决赛', semis.length === 2);
}

{
  const m = S.buildElimination(ids(6));
  check('6 支队淘汰赛 → 7 场（含轮空）', m.length === 7, `实际 ${m.length}`);
  const byes = m.filter((x) => (x.homeTeamId === '') !== (x.awayTeamId === ''));
  check('6 支队淘汰赛 → 2 场轮空被自动判定', byes.length === 2, `实际 ${byes.length}`);
  const firstRound = m.filter((x) => x.roundIndex === 1);
  check('6 支队淘汰赛 → 首轮 4 场', firstRound.length === 4, `实际 ${firstRound.length}`);
  let linked = true;
  for (const x of m) {
    if (x.roundIndex < 3 && x.nextMatchId === '') {
      linked = false;
    }
  }
  check('淘汰赛 → 非末轮均有下一场链接', linked);
}

{
  const m = S.buildElimination(ids(2));
  check('2 支队淘汰赛 → 1 场', m.length === 1, `实际 ${m.length}`);
}

/* ================================================================== *
 * 3. 小组赛 + 淘汰赛
 * ================================================================== */

section('3. 小组赛 + 淘汰赛');

{
  const m = S.buildGroupKnockout(ids(8), 2, 2);
  const groupMatches = m.filter((x) => x.groupIndex >= 0);
  const koMatches = m.filter((x) => x.groupIndex < 0);
  check('8 队 2 组 → 每组 6 场，共 12 场小组赛', groupMatches.length === 12,
    `实际 ${groupMatches.length}`);
  check('8 队 2 组 2 出线 → 4 队淘汰赛，共 3 场', koMatches.length === 3,
    `实际 ${koMatches.length}`);
  const groups = new Set(groupMatches.map((x) => x.groupIndex));
  check('8 队 2 组 → 恰好 2 个小组', groups.size === 2, `实际 ${groups.size}`);
  const placeholders = koMatches.filter((x) => x.homePlaceholder !== '' || x.awayPlaceholder !== '');
  check('淘汰赛首轮带交叉席位占位文案', placeholders.length >= 2, `实际 ${placeholders.length}`);
}

/* ================================================================== *
 * 4. 排期约束
 * ================================================================== */

section('4. 排期约束');

function baseConfig(overrides = {}) {
  return Object.assign({
    name: '测试赛事',
    sport: 'basketball',
    format: 'roundRobin',
    matchMinutes: 60,
    breakMinutes: 15,
    restMinutes: 90,
    startDate: '2026-10-20',
    days: 10,
    dailyStart: 8 * 60,
    dailyEnd: 22 * 60,
    groupCount: 2,
    advancePerGroup: 2,
    venues: [{ id: 'v1', name: '场地1' }, { id: 'v2', name: '场地2' }]
  }, overrides);
}

function checkScheduleInvariants(matches, config) {
  const problems = [];
  const byDay = new Map();
  for (const m of matches) {
    if (m.dayIndex < 0) {
      problems.push('存在未排期场次');
      continue;
    }
    if (!byDay.has(m.dayIndex)) {
      byDay.set(m.dayIndex, []);
    }
    byDay.get(m.dayIndex).push(m);
    if (m.startMinutes < config.dailyStart || m.startMinutes + config.matchMinutes > config.dailyEnd) {
      problems.push(`场次超出每日时段: ${m.startMinutes}`);
    }
  }
  for (const [, list] of byDay) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        const aEnd = a.startMinutes + config.matchMinutes;
        const bEnd = b.startMinutes + config.matchMinutes;
        const overlap = a.startMinutes < bEnd && b.startMinutes < aEnd;
        if (a.venueId === b.venueId && overlap) {
          problems.push('场地重复占用');
        }
        const sameTeam = [a.homeTeamId, a.awayTeamId].some(
          (t) => t !== '' && (t === b.homeTeamId || t === b.awayTeamId));
        if (sameTeam && overlap) {
          problems.push('同队同时段出场');
        }
      }
    }
  }
  return problems;
}

function checkRestRespected(matches, config) {
  const byTeamDay = new Map();
  for (const m of matches) {
    if (m.dayIndex < 0) {
      continue;
    }
    for (const t of [m.homeTeamId, m.awayTeamId]) {
      if (t === '') {
        continue;
      }
      const key = `${m.dayIndex}|${t}`;
      if (!byTeamDay.has(key)) {
        byTeamDay.set(key, []);
      }
      byTeamDay.get(key).push([m.startMinutes, m.startMinutes + config.matchMinutes]);
    }
  }
  const violations = [];
  for (const [key, spans] of byTeamDay) {
    spans.sort((x, y) => x[0] - y[0]);
    for (let i = 0; i + 1 < spans.length; i++) {
      const gap = spans[i + 1][0] - spans[i][1];
      if (gap < config.restMinutes) {
        violations.push(`${key} 间隔 ${gap} < ${config.restMinutes}`);
      }
    }
  }
  return violations;
}

{
  const config = baseConfig();
  const raw = S.generateMatches(config, teams(6));
  check('单循环 6 队 → 15 场', raw.length === 15, `实际 ${raw.length}`);
  const scheduled = S.scheduleMatches(raw, config);
  check('充裕条件下全部排期成功', scheduled.every((m) => m.dayIndex >= 0));
  const problems = checkScheduleInvariants(scheduled, config);
  check('排期结果满足场地与队伍不冲突', problems.length === 0, problems.join('; '));
  const rest = checkRestRespected(scheduled, config);
  check('排期结果满足最小休息时间', rest.length === 0, rest.join('; '));
  const conflicts = S.detectConflicts(scheduled, config, teams(6));
  check('自动排期结果无「必须修复」冲突',
    conflicts.filter((c) => c.level === 'error').length === 0,
    JSON.stringify(conflicts.filter((c) => c.level === 'error').map((c) => c.message)));
}

{
  // 容量不足：1 块场地、1 天、每天仅 2 小时 → 15 场必然排不下
  const config = baseConfig({
    days: 1,
    dailyStart: 9 * 60,
    dailyEnd: 11 * 60,
    venues: [{ id: 'v1', name: '唯一场地' }]
  });
  const raw = S.generateMatches(config, teams(6));
  const scheduled = S.scheduleMatches(raw, config);
  const unscheduled = scheduled.filter((m) => m.dayIndex < 0);
  check('容量不足时如实标记未排期', unscheduled.length > 0, `未排期 ${unscheduled.length}`);
  const conflicts = S.detectConflicts(scheduled, config, teams(6));
  check('容量不足会产生「必须修复」冲突',
    conflicts.some((c) => c.level === 'error' && c.message.includes('无法排入')));
}

{
  // 故意注入冲突：把两场比赛强行放到同一场地同一时刻
  const config = baseConfig();
  const raw = S.generateMatches(config, teams(4));
  const scheduled = S.scheduleMatches(raw, config);
  const a = scheduled[0];
  const b = scheduled[1];
  b.venueId = a.venueId;
  b.dayIndex = a.dayIndex;
  b.startMinutes = a.startMinutes;
  const conflicts = S.detectConflicts(scheduled, config, teams(4));
  check('能检出场地重复占用',
    conflicts.some((c) => c.level === 'error' && c.message.includes('场地冲突')));
}

{
  // 排期器本身必须遵守较大的最小休息时间
  const config = baseConfig({ restMinutes: 180 });
  const scheduled = S.scheduleMatches(S.generateMatches(config, teams(4)), config);
  const rest = checkRestRespected(scheduled, config);
  check('排期器遵守 180 分钟最小休息', rest.length === 0, rest.join('; '));
  const conflicts = S.detectConflicts(scheduled, config, teams(4));
  check('排期器结果不触发休息不足提醒',
    !conflicts.some((c) => c.message.includes('休息不足')));
}

{
  // 手工构造休息不足（10:10–11:10 紧接 09:00–10:00，仅隔 10 分钟）
  const config = baseConfig({ restMinutes: 180 });
  const t = teams(4);
  const mk = (id, home, away, venue, start) => ({
    id, roundIndex: 1, roundLabel: '第 1 轮', homeTeamId: home, awayTeamId: away,
    groupIndex: -1, venueId: venue, dayIndex: 0, startMinutes: start,
    homeScore: 0, awayScore: 0, played: false, pinned: false,
    homePlaceholder: '', awayPlaceholder: '', nextMatchId: '', nextSlot: -1
  });
  const matches = [
    mk('a', 't1', 't2', 'v1', 9 * 60),
    mk('b', 't1', 't3', 'v2', 10 * 60 + 10)
  ];
  const conflicts = S.detectConflicts(matches, config, t);
  const restWarn = conflicts.filter((c) => c.message.includes('休息不足'));
  check('能检出休息时间不足', restWarn.length > 0, `实际 ${restWarn.length}`);
  check('休息不足被判为「建议调整」而非硬冲突',
    restWarn.every((c) => c.level === 'warning'));
}

{
  // 时段越界
  const config = baseConfig({ dailyEnd: 12 * 60 });
  const raw = S.generateMatches(config, teams(4));
  const scheduled = S.scheduleMatches(raw, config);
  scheduled[0].startMinutes = 23 * 60;
  const conflicts = S.detectConflicts(scheduled, config, teams(4));
  check('能检出时段越界', conflicts.some((c) => c.message.includes('时段越界')));
}

{
  // 首次进入应用（还没有生成赛程）时不应刷屏报"队伍没有比赛"
  const config = baseConfig();
  const t = teams(6);
  const conflicts = S.detectConflicts([], config, t);
  check('未生成赛程时不产生任何冲突提示', conflicts.length === 0,
    conflicts.map((c) => c.message).join(' | '));
}

{
  // 生成过赛程后，若有队伍没被排进去，应当提示
  const config = baseConfig();
  const t = teams(4);
  const matches = S.scheduleMatches(S.generateMatches(config, t), config);
  const orphan = matches.filter((m) => m.homeTeamId !== 't4' && m.awayTeamId !== 't4');
  const conflicts = S.detectConflicts(orphan, config, t);
  check('有队伍被遗漏时给出提醒',
    conflicts.some((c) => c.message.includes('没有任何比赛')));
}

/* ================================================================== *
 * 5. 淘汰赛晋级
 * ================================================================== */

section('5. 淘汰赛晋级传播');

{
  const m = S.buildElimination(ids(4));
  const semi1 = m.find((x) => x.roundIndex === 1);
  const semi2 = m.filter((x) => x.roundIndex === 1)[1];
  const final = m.find((x) => x.roundIndex === 2);
  semi1.played = true;
  semi1.homeScore = 80;
  semi1.awayScore = 70;
  semi2.played = true;
  semi2.homeScore = 60;
  semi2.awayScore = 65;
  const after = S.propagateWinners(m);
  const f = after.find((x) => x.id === final.id);
  check('胜者 1 进入决赛主队席', f.homeTeamId === semi1.homeTeamId,
    `${f.homeTeamId} vs ${semi1.homeTeamId}`);
  check('胜者 2 进入决赛客队席', f.awayTeamId === semi2.awayTeamId,
    `${f.awayTeamId} vs ${semi2.awayTeamId}`);
}

/* ================================================================== *
 * 6. 积分榜与导出
 * ================================================================== */

section('6. 积分榜与 CSV 导出');

{
  const t = teams(3);
  const matches = [
    { id: 'm1', roundIndex: 1, roundLabel: '第 1 轮', homeTeamId: 't1', awayTeamId: 't2', groupIndex: -1,
      venueId: 'v1', dayIndex: 0, startMinutes: 540, homeScore: 90, awayScore: 80, played: true,
      pinned: false, homePlaceholder: '', awayPlaceholder: '', nextMatchId: '', nextSlot: -1 },
    { id: 'm2', roundIndex: 1, roundLabel: '第 1 轮', homeTeamId: 't2', awayTeamId: 't3', groupIndex: -1,
      venueId: 'v1', dayIndex: 0, startMinutes: 660, homeScore: 70, awayScore: 70, played: true,
      pinned: false, homePlaceholder: '', awayPlaceholder: '', nextMatchId: '', nextSlot: -1 }
  ];
  const table = S.computeStandings(matches, t);
  const t1 = table.find((r) => r.teamId === 't1');
  const t2 = table.find((r) => r.teamId === 't2');
  check('胜一场得 3 分', t1.points === 3, `实际 ${t1.points}`);
  check('平一场得 1 分', t2.points === 1, `实际 ${t2.points}`);
  check('积分榜按积分降序', table[0].teamId === 't1', table.map((r) => r.teamId).join(','));
}

{
  const config = baseConfig();
  const t = teams(4);
  const matches = S.scheduleMatches(S.generateMatches(config, t), config);
  const csv = S.toCsv({ config, teams: t, matches });
  const lines = csv.split('\r\n').filter((l) => l.trim() !== '');
  check('CSV 含表头', lines[0].includes('比赛日') && lines[0].includes('主队'));
  check('CSV 行数 = 1 表头 + 6 场', lines.length === 7, `实际 ${lines.length}`);
  check('CSV 使用 UTF-8 BOM 便于 Excel 识别', csv.charCodeAt(0) === 0xfeff);
}

/* ================================================================== *
 * 汇总
 * ================================================================== */

console.log(`\n${'='.repeat(52)}`);
console.log(`通过 ${passed} 项，失败 ${failed} 项`);
if (failed > 0) {
  console.log('\n失败明细：');
  for (const f of failures) {
    console.log(`  - ${f}`);
  }
  process.exit(1);
}
console.log('全部核心算法验证通过。');
