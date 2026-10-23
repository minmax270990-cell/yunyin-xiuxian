/**
 * 灵根亲和(Phase 32.2 灵根职能重构)
 *
 * 灵根不再只是一个修炼倍率。它负责的是"这一世你拿到什么样的天然牌面"——
 * 三条接线,全部是倾向,没有一条是直接数值加成:
 *
 *   ① 功法习得偏向:同源功法更容易被你参悟到(不独占,别人照样学得到)
 *   ② 机缘出现偏向:同源机缘更容易撞见(接 Phase 31 因果链的入口)
 *   ③ 天劫解法空间:某条被劫型关掉的路,对你半开着(不是成功率)
 *
 * 设计红线(违反即回退到旧病):
 *   - 不做"灵根 → 修炼速度更高"。那是和道果拼加法池,道果每世无上限累积,必输。
 *     (linggenRole.spec.ts 实测:第20世道果占修速 74.2%,灵根占 1.2%)
 *   - 不做"灵根 → 天劫成功率 +X%"。那会让刚拆掉的"渡劫单指标优化"原地复活。
 *   - 灵根提供倾向,不提供职业:金灵根不逼你走护盾,只是你走护盾时它才有意义。
 */
import type { ElementId } from '@/types'
import type { TribulationKind } from './tribulations'

/**
 * 天劫解法修正:改变"哪些词条在这道劫里管用",而非改变成功率。
 *
 * 每一项都是对劫型限制的部分解除(向常态回拉),不是凭空的增益——
 * 没有对应构筑时,这些系数一分钱都换不来。
 */
export interface TribulationRelief {
  /** 护盾折扣回拉比例(0=无效果, 1=完全无视该劫的碾盾) */
  shieldRestore: number
  /** 治疗压制回拉比例 */
  healRestore: number
  /** 前重波形的起手削减比例 */
  frontLoadEase: number
  /** 爆发削劫的星级加成(裂魂劫查表下标) */
  burstTierBonus: number
  /** 减伤折算天劫抗性的额外比例 */
  reductionToResist: number
}

export const NO_RELIEF: TribulationRelief = {
  shieldRestore: 0,
  healRestore: 0,
  frontLoadEase: 0,
  burstTierBonus: 0,
  reductionToResist: 0
}

export interface ElementAffinity {
  /** 同源功法的参悟权重倍率(倾向,非独占) */
  gongfaWeight: number
  /** 同源机缘的出现权重倍率 */
  fortuneWeight: number
  /** 该元素在哪种劫型下解锁解法通道;chaos 为 null 表示通吃 */
  kind: TribulationKind | null
  /** 解锁的解法通道 */
  relief: Partial<TribulationRelief>
  /** 道途倾向一句话(UI 展示;描述"牌面",不承诺数值) */
  tendency: string
}

/** 各元素的天然牌面 */
export const ELEMENT_AFFINITY: Record<ElementId, ElementAffinity> = {
  metal: {
    gongfaWeight: 2.2,
    fortuneWeight: 2.5,
    kind: 'ironbody',
    relief: { shieldRestore: 0.5 },
    tendency: 'Sắc bén lộ rõ, kiếm khí thân cận; dưới áp lực Thiết Khu, hộ thể linh quang vẫn kiên cố'
  },
  wood: {
    gongfaWeight: 2.2,
    fortuneWeight: 2.5,
    kind: 'counterflow',
    relief: { healRestore: 0.5 },
    tendency: 'Sinh cơ miên trường, thảo mộc đan phương thân cận; trong linh khí nghịch loạn, sinh mệnh khó dứt'
  },
  water: {
    gongfaWeight: 2.2,
    fortuneWeight: 2.5,
    kind: 'heavyrush',
    relief: { frontLoadEase: 0.35 },
    tendency: 'Nhu mà không gãy, thủy hành chi pháp thân cận; áp lực ập đến, biết lấy nhu hóa giải lực'
  },
  fire: {
    gongfaWeight: 2.2,
    fortuneWeight: 2.5,
    kind: 'soulrend',
    relief: { burstTierBonus: 1 },
    tendency: 'Khí tính cương liệt, viêm pháp thân cận; dưới Liệt Hồn Kiếp, công thế càng thêm suy giảm kiếp uy'
  },
  earth: {
    gongfaWeight: 2.2,
    fortuneWeight: 2.5,
    kind: 'thunder',
    relief: { reductionToResist: 0.35 },
    tendency: 'Hậu trọng tải vật, thổ hành chi pháp thân cận; lôi minh gia thân, đại địa chia sẻ vài phần thiên phạt'
  },
  wind: {
    gongfaWeight: 2.6,
    fortuneWeight: 2.8,
    kind: 'heavyrush',
    relief: { frontLoadEase: 0.4 },
    tendency: 'Thân pháp phiêu hốt, phong hành chi pháp thân cận; khi áp lực khởi đầu, né được đòn sắc bén nhất'
  },
  thunder: {
    gongfaWeight: 2.6,
    fortuneWeight: 2.8,
    kind: 'thunder',
    relief: { reductionToResist: 0.45 },
    tendency: 'Đồng nguyên dẫn lôi, lôi pháp thân cận; dưới thiên lôi cuộn trào, thấu hiểu lôi tính hơn người'
  },
  ice: {
    gongfaWeight: 2.6,
    fortuneWeight: 2.8,
    kind: 'counterflow',
    relief: { healRestore: 0.4 },
    tendency: 'Băng phong linh đài, băng pháp thân cận; khi linh khí nghịch loạn, tâm thần càng thêm an định'
  },
  light: {
    gongfaWeight: 2.6,
    fortuneWeight: 2.8,
    kind: 'soulrend',
    relief: { burstTierBonus: 1 },
    tendency: 'Thần hồn quang diệu, quang pháp thân cận; Liệt Hồn chi kiếp khó lay chuyển thần đài'
  },
  dark: {
    gongfaWeight: 2.6,
    fortuneWeight: 2.8,
    kind: 'ironbody',
    relief: { shieldRestore: 0.45 },
    tendency: 'U vi khó lường, ám pháp thân cận; trước áp lực dày đặc, tự có tầng che chở vô hình'
  },
  chaos: {
    gongfaWeight: 3.0,
    fortuneWeight: 3.2,
    kind: null,
    relief: { shieldRestore: 0.3, healRestore: 0.3, frontLoadEase: 0.22, burstTierBonus: 1, reductionToResist: 0.22 },
    tendency: 'Vạn pháp quy nhất, chư đạo đều thân; dưới ngũ kiếp đều có một đường sinh cơ, song không môn nào đạt tới cực đỉnh'
  }
}
