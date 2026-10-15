import type AbilityConstant from "@ohos:app.ability.AbilityConstant";
import ConfigurationConstant from "@ohos:app.ability.ConfigurationConstant";
import UIAbility from "@ohos:app.ability.UIAbility";
import type Want from "@ohos:app.ability.Want";
import hilog from "@ohos:hilog";
import type window from "@ohos:window";
import type { BusinessError as BusinessError } from "@ohos:base";
const DOMAIN: number = 0x0000;
const TAG: string = 'CampusArena';
export default class EntryAbility extends UIAbility {
    onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
        this.context.getApplicationContext().setColorMode(ConfigurationConstant.ColorMode.COLOR_MODE_LIGHT);
        hilog.info(DOMAIN, TAG, '%{public}s', 'Ability onCreate');
    }
    onDestroy(): void {
        hilog.info(DOMAIN, TAG, '%{public}s', 'Ability onDestroy');
    }
    onWindowStageCreate(windowStage: window.WindowStage): void {
        hilog.info(DOMAIN, TAG, '%{public}s', 'Ability onWindowStageCreate');
        // 面向鸿蒙电脑：给一个适合大屏的初始窗口尺寸（vp）。
        // 部分设备类型不支持编程式 resize；失败时保持系统默认尺寸，不影响启动。
        try {
            const mainWindow: window.Window = windowStage.getMainWindowSync();
            mainWindow.resize(1440, 900).catch((e: BusinessError) => {
                hilog.warn(DOMAIN, TAG, 'resize skipped: %{public}s', JSON.stringify(e));
            });
        }
        catch (err) {
            hilog.warn(DOMAIN, TAG, 'getMainWindowSync failed: %{public}s', JSON.stringify(err));
        }
        windowStage.loadContent('pages/Index', (err: BusinessError) => {
            if (err.code) {
                hilog.error(DOMAIN, TAG, 'Failed to load the content. Cause: %{public}s', JSON.stringify(err));
                return;
            }
            hilog.info(DOMAIN, TAG, '%{public}s', 'Succeeded in loading the content.');
        });
    }
    onWindowStageDestroy(): void {
        hilog.info(DOMAIN, TAG, '%{public}s', 'Ability onWindowStageDestroy');
    }
    onForeground(): void {
        hilog.info(DOMAIN, TAG, '%{public}s', 'Ability onForeground');
    }
    onBackground(): void {
        hilog.info(DOMAIN, TAG, '%{public}s', 'Ability onBackground');
    }
}
