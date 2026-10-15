/**
 * 校园赛程编排器 (Campus Arena)
 * 本地持久化：应用全部数据保存在设备本地，不进行任何网络传输。
 *
 * 使用 HarmonyOS Preferences（轻量键值存储）保存一份 JSON 快照。
 */

import { preferences } from '@kit.ArkData';
import { common } from '@kit.AbilityKit';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { BusinessError } from '@kit.BasicServicesKit';
import { TournamentState, createEmptyState } from './Types';

const DOMAIN: number = 0x0000;
const TAG: string = 'CampusArena.Store';

const STORE_NAME: string = 'campus_arena_store';
const KEY_STATE: string = 'tournament_state_v1';

/** 保存结果 */
export interface SaveResult {
  ok: boolean;
  message: string;
}

export class TournamentStore {
  private store: preferences.Preferences | null = null;

  /** 打开（或创建）本地存储；失败时返回 false，界面仍可纯内存运行 */
  open(context: common.UIAbilityContext): boolean {
    try {
      const options: preferences.Options = { name: STORE_NAME };
      this.store = preferences.getPreferencesSync(context, options);
      return true;
    } catch (err) {
      const e: BusinessError = err as BusinessError;
      hilog.error(DOMAIN, TAG, 'open failed: %{public}s', JSON.stringify(e));
      this.store = null;
      return false;
    }
  }

  /** 读取上次保存的赛事数据；没有数据时返回一份带示例队伍的初始状态 */
  load(): TournamentState {
    if (this.store === null) {
      return createEmptyState();
    }
    try {
      const raw: preferences.ValueType = this.store.getSync(KEY_STATE, '');
      if (typeof raw !== 'string' || raw === '') {
        return createEmptyState();
      }
      const parsed: TournamentState = JSON.parse(raw) as TournamentState;
      if (parsed === null || parsed === undefined) {
        return createEmptyState();
      }
      if (parsed.config === undefined || parsed.teams === undefined || parsed.matches === undefined) {
        return createEmptyState();
      }
      if (parsed.config.venues === undefined) {
        parsed.config.venues = [];
      }
      return parsed;
    } catch (err) {
      const e: BusinessError = err as BusinessError;
      hilog.error(DOMAIN, TAG, 'load failed: %{public}s', JSON.stringify(e));
      return createEmptyState();
    }
  }

  /** 保存赛事数据 */
  save(state: TournamentState): SaveResult {
    if (this.store === null) {
      return { ok: false, message: '本地存储不可用，本次修改仅保留在当前会话中。' };
    }
    try {
      const text: string = JSON.stringify(state);
      this.store.putSync(KEY_STATE, text);
      this.store.flush();
      return { ok: true, message: '已保存到本机' };
    } catch (err) {
      const e: BusinessError = err as BusinessError;
      hilog.error(DOMAIN, TAG, 'save failed: %{public}s', JSON.stringify(e));
      return { ok: false, message: `保存失败：${e.message}` };
    }
  }

  /** 清空全部本地数据 */
  clear(): SaveResult {
    if (this.store === null) {
      return { ok: false, message: '本地存储不可用。' };
    }
    try {
      this.store.deleteSync(KEY_STATE);
      this.store.flush();
      return { ok: true, message: '已清除本机数据' };
    } catch (err) {
      const e: BusinessError = err as BusinessError;
      hilog.error(DOMAIN, TAG, 'clear failed: %{public}s', JSON.stringify(e));
      return { ok: false, message: `清除失败：${e.message}` };
    }
  }
}
