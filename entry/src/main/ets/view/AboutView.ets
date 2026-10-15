/**
 * 校园赛程编排器 (Campus Arena) —— 关于与帮助
 *
 * 同时承载应用内隐私说明：本应用完全离线运行，不收集任何个人信息。
 */

import { AppModel } from '../model/AppModel';
import { FontSize, Palette, Radius, Space, ToneKind } from '../common/Theme';
import { AppButton, BtnKind, CardSection, KeyValueRow, Pill } from '../common/Widgets';

const APP_VERSION: string = '1.0.0';
const APP_BUILD: string = '1';
const BUNDLE_NAME: string = 'com.campusarena.scheduler';

/** 开发者联系方式：上架前必须替换为真实可用的联系方式 */
const DEVELOPER_CONTACT: string = 'campusarena.support@example.com';

@Component
export struct AboutView {
  @ObjectLink model: AppModel;
  onClearData: () => void = () => {
  };

  @Builder
  featureLine(symbol: string, title: string, detail: string) {
    Row({ space: Space.md }) {
      Text(symbol)
        .fontSize(FontSize.subhead)
        .fontColor(Palette.brand)
        .width(28)
      Column({ space: 2 }) {
        Text(title)
          .fontSize(FontSize.body)
          .fontWeight(FontWeight.Medium)
          .fontColor(Palette.textPrimary)
        Text(detail)
          .fontSize(FontSize.small)
          .fontColor(Palette.textSecondary)
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
    }
    .width('100%')
    .alignItems(VerticalAlign.Top)
    .padding({ top: Space.sm, bottom: Space.sm })
  }

  @Builder
  privacyParagraph(text: string) {
    Text(text)
      .fontSize(FontSize.small)
      .fontColor(Palette.textSecondary)
      .lineHeight(21)
      .width('100%')
      .margin({ bottom: Space.sm })
  }

  build() {
    Column({ space: Space.lg }) {
      CardSection({ title: '关于本应用', subtitle: '' }) {
        Column({ space: Space.md }) {
          Row({ space: Space.md }) {
            Image($r('app.media.icon'))
              .width(56)
              .height(56)
              .borderRadius(Radius.md)
            Column({ space: 4 }) {
              Text('校园赛程编排器')
                .fontSize(FontSize.title)
                .fontWeight(FontWeight.Bold)
                .fontColor(Palette.textPrimary)
              Text('把校园赛事的报名、赛制与场地约束，变成一张可直接执行的赛程表。')
                .fontSize(FontSize.small)
                .fontColor(Palette.textSecondary)
            }
            .alignItems(HorizontalAlign.Start)
            .layoutWeight(1)
          }
          .width('100%')
          .alignItems(VerticalAlign.Center)

          Row({ space: Space.sm }) {
            Pill({ text: `版本 ${APP_VERSION}`, tone: ToneKind.Brand })
            Pill({ text: '完全离线', tone: ToneKind.Ok })
            Pill({ text: '不收集个人信息', tone: ToneKind.Ok })
          }
        }
        .width('100%')
        .alignItems(HorizontalAlign.Start)
      }

      CardSection({ title: '主要功能', subtitle: '围绕「配置 → 生成 → 检查 → 执行」四步' }) {
        Column() {
          this.featureLine('①', '赛事配置', '设置项目、赛制、单场时长、每日时段与比赛天数，支持单循环、双循环、单败淘汰与小组赛 + 淘汰赛。')
          this.featureLine('②', '队伍与场地管理', '维护参赛队伍、所属院系与种子序号；添加多块并行使用的比赛场地。')
          this.featureLine('③', '一键生成与自动排期', '按轮次顺序贪心排期，自动避开场地重复占用，并保证同队两场比赛之间留足休息时间。')
          this.featureLine('④', '冲突检查', '自动检查场地撞场、同队同时段出场、休息不足、超出赛期与时段越界，分为「必须修复」和「建议调整」两级。')
          this.featureLine('⑤', '比分与积分榜', '录入比分后自动计算积分榜，淘汰赛中胜者自动晋级到下一轮。')
          this.featureLine('⑥', '场地视图与导出', '以场地 × 时段网格对照检查安排，并可导出 CSV 赛程表用于打印或张贴。')
        }
        .width('100%')
      }

      CardSection({ title: '使用帮助', subtitle: '三步得到一张可执行赛程' }) {
        Column({ space: Space.sm }) {
          this.privacyParagraph('第一步：到「参赛队伍」添加全部参赛队伍，至少 2 支；到「赛事配置」确认赛制、比赛天数与场地。')
          this.privacyParagraph('第二步：到「赛程编排」点击「生成赛程」。系统会生成对阵并自动排期，随后给出冲突清单。')
          this.privacyParagraph('第三步：如提示「必须修复」级冲突，回到「赛事配置」增加比赛天数、延长每日时段或增开场地后重新排期；也可以在赛程表中手动调整单场时间并锁定。')
          this.privacyParagraph('提示：所有数据保存在本机。卸载应用或点击下方「清除本机数据」会一并删除。')
        }
        .width('100%')
        .alignItems(HorizontalAlign.Start)
      }

      CardSection({ title: '隐私说明', subtitle: '本应用不收集、不上传任何个人信息' }) {
        Column() {
          this.privacyParagraph('一、信息收集：本应用不需要注册或登录，不收集设备标识、位置、通讯录、相册、麦克风等任何个人信息，也不会读取与赛事编排无关的文件。');
          this.privacyParagraph('二、信息存储：您输入的队伍名称、院系、赛事规则、场地与比分等数据，仅保存在本机应用沙箱内（HarmonyOS Preferences）。这些数据不会离开您的设备。');
          this.privacyParagraph('三、网络与权限：本应用不申请网络权限，也不申请任何敏感权限，全部功能离线可用。');
          this.privacyParagraph('四、第三方服务：本应用未集成任何第三方 SDK、广告或统计分析组件。');
          this.privacyParagraph('五、数据导出：仅当您主动点击「导出 CSV」并选择保存位置时，才会把赛程写入您指定的本地文件；导出过程不经过网络。');
          this.privacyParagraph('六、您的权利：您可以随时在应用内修改或删除任何数据，也可以点击下方「清除本机数据」一次性删除全部本地数据。');
          this.privacyParagraph('七、未成年人保护：本应用为校园赛事编排工具，不面向未成年人单独收集任何信息。');
          this.privacyParagraph('八、联系方式：如对本隐私说明有任何疑问，请联系 ' + DEVELOPER_CONTACT + '。');
          this.privacyParagraph('九、本说明自应用发布之日起生效。');
        }
        .width('100%')
        .alignItems(HorizontalAlign.Start)
      }

      CardSection({ title: '应用信息', subtitle: '' }) {
        Column() {
          KeyValueRow({ label: '应用名称', value: '校园赛程编排器' })
          KeyValueRow({ label: '版本号', value: `${APP_VERSION}（Build ${APP_BUILD}）`, divided: true })
          KeyValueRow({ label: '应用包名', value: BUNDLE_NAME, divided: true })
          KeyValueRow({ label: '开发者联系方式', value: DEVELOPER_CONTACT, divided: true })
          KeyValueRow({ label: '支持设备', value: '鸿蒙电脑 / 平板 / 手机', divided: true })
          KeyValueRow({ label: '数据存储位置', value: '仅本机', divided: true, tone: ToneKind.Ok })
          KeyValueRow({ label: '网络访问', value: '无', divided: true, tone: ToneKind.Ok })
        }
        .width('100%')
      }

      CardSection({ title: '数据管理', subtitle: '清除后无法恢复，请谨慎操作' }) {
        Row({ space: Space.md }) {
          AppButton({
            label: '清除本机数据',
            kind: BtnKind.Danger,
            onTap: () => this.onClearData()
          })
          Text(`当前共 ${this.model.teams.length} 支队伍、${this.model.matches.length} 场比赛。`)
            .fontSize(FontSize.small)
            .fontColor(Palette.textSecondary)
        }
        .width('100%')
        .alignItems(VerticalAlign.Center)
      }
    }
    .width('100%')
  }
}
