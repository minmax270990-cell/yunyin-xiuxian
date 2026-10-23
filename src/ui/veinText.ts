/**
 * 灵脉效果行 —— 数字只从 perPoint / INSIGHT_DISCOUNT_PER_POINT 现算。
 *
 * 手写「p * 0.4」会在改每点加成那天变成谎话;「炼丹双成率」「炼器耗材」
 * 又和当前加成栏的词条名不是一套,同一张卡上左右对不上。
 */
import { formatPercent } from '@/utils/format'
import { INSIGHT_DISCOUNT_CAP, INSIGHT_DISCOUNT_PER_POINT, INSIGHT_EFFECT_NAME, type VeinDef } from '@/data/veins'
import { modsText } from './statNames'

export function veinEffectText(def: VeinDef, points: number): string {
  const scaled: Record<string, number> = {}
  for (const [k, raw] of Object.entries(def.perPoint)) {
    if (typeof raw !== 'number' || raw === 0) continue
    scaled[k] = raw * points
  }
  const parts: string[] = []
  const mods = modsText(scaled)
  if (mods) parts.push(mods)
  if (def.id === 'insight') {
    parts.push(`${INSIGHT_EFFECT_NAME} −${formatPercent(Math.min(INSIGHT_DISCOUNT_CAP, points * INSIGHT_DISCOUNT_PER_POINT))}`)
  }
  return parts.join(' · ')
}

/** 洞府灵脉投点与改立。容量、主副上限、灵石仍报清。 */
export function veinFullToast(): string {
  return 'Dung lượng linh mạch đã cạn, duy có lấy bỏ'
}

export function veinPeakToast(isMain: boolean): string {
  return isMain ? 'Mạch chủ đã đạt viên mãn' : 'Mạch phụ có giới hạn riêng, muốn tiến thêm phải lập làm mạch chủ'
}

export function veinShortToast(): string {
  return 'Linh thạch chưa đủ, khó rót vào mạch này'
}

export function veinSwitchShortToast(): string {
  return 'Linh thạch chưa đủ, chuyển mạch chẳng phải chuyện nhỏ'
}

export function veinSwitchDoneToast(name: string): string {
  return `Mạch chủ cải lập「${name}」`
}

/** 连投的总结账:一点一点报太吵,连投只报一次总况(stoneText 由调用方 formatGN 好) */
export function veinBatchDoneToast(name: string, points: number, stoneText: string): string {
  return `「${name}」liên tục rót ${points} điểm, tổng tiêu hao ${stoneText} linh thạch`
}
