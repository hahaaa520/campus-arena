/**
 * 校园赛程编排器 (Campus Arena)
 * 赛程导出：写入用户选择的本地文件，全程离线，不经过网络。
 */

import { fileIo } from '@kit.CoreFileKit';
import { picker } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { BusinessError } from '@kit.BasicServicesKit';

const DOMAIN: number = 0x0000;
const TAG: string = 'CampusArena.Export';

export interface ExportResult {
  ok: boolean;
  message: string;
}

/**
 * 让用户选择保存位置并写入文本文件。
 * 返回结果供界面提示使用。
 */
export async function exportTextFile(
  context: common.UIAbilityContext,
  suggestedName: string,
  content: string
): Promise<ExportResult> {
  try {
    const saveOptions: picker.DocumentSaveOptions = new picker.DocumentSaveOptions();
    saveOptions.newFileNames = [suggestedName];
    const documentPicker: picker.DocumentViewPicker = new picker.DocumentViewPicker(context);
    const uris: string[] = await documentPicker.save(saveOptions);

    if (uris === undefined || uris.length === 0) {
      return { ok: false, message: '已取消保存。' };
    }

    const target: string = uris[0];
    const file = fileIo.openSync(target, fileIo.OpenMode.READ_WRITE | fileIo.OpenMode.TRUNC);
    try {
      fileIo.writeSync(file.fd, content);
    } finally {
      fileIo.closeSync(file);
    }
    return { ok: true, message: '已导出到所选位置。' };
  } catch (err) {
    const e: BusinessError = err as BusinessError;
    hilog.error(DOMAIN, TAG, 'export failed: %{public}s', JSON.stringify(e));
    return { ok: false, message: `导出失败：${e.message}` };
  }
}

/** 把内容写入应用沙箱，作为文件选择器不可用时的兜底 */
export function exportToSandbox(
  context: common.UIAbilityContext,
  fileName: string,
  content: string
): ExportResult {
  try {
    const path: string = `${context.filesDir}/${fileName}`;
    const file = fileIo.openSync(path, fileIo.OpenMode.READ_WRITE | fileIo.OpenMode.CREATE | fileIo.OpenMode.TRUNC);
    try {
      fileIo.writeSync(file.fd, content);
    } finally {
      fileIo.closeSync(file);
    }
    return { ok: true, message: `已保存到应用目录：${path}` };
  } catch (err) {
    const e: BusinessError = err as BusinessError;
    hilog.error(DOMAIN, TAG, 'sandbox export failed: %{public}s', JSON.stringify(e));
    return { ok: false, message: `保存失败：${e.message}` };
  }
}
