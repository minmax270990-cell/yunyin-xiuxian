/**
 * 功法服务 —— 参悟 / 习得 / 升级
 */
import { rng } from '@/utils/random'
import { GONGFA, gongfaDef } from '@/data/gongfa'
import { qualityDef } from '@/data/qualities'
import { COMPREHEND_PAGE_COST } from '@/data/constants'
import { INSIGHT_DISCOUNT_CAP } from '@/data/veins'
import { gongfaUpCost } from './formulas'
import { gongfaAffinity, rootElements } from './linggenAffinity'
import { checkGongfaEligibility, calcMaxComprehendLevel, getPlayerSnapshot } from './gongfaEligibility'
import { collect, track } from './progress'
import { usePlayerStore } from '@/stores/player'
import { useResourcesStore } from '@/stores/resources'
import { useCultivationStore } from '@/stores/cultivation'
import { useDongfuStore } from '@/stores/dongfu'
import { useUiStore } from '@/stores/ui'
import {
  gongfaAllLearnedToast,
  gongfaComprehendToast,
  gongfaPageShortToast,
  gongfaUpDoneToast,
  gongfaUpShortToast
} from '@/ui/gongfaText'

/** 随机习得一部功法(事件/掉落),返回功法名;无可学返回 null */
export function learnRandomGongfa(specificId?: string, onlyEligible = false): string | null {
  const player = usePlayerStore()
  const cultivation = useCultivationStore()
  if (specificId) {
    const def = gongfaDef(specificId)
    if (def && cultivation.learn(specificId)) {
      collect('gongfa', specificId)
      track('gongfaLearned')
      return def.name
    }
    return null
  }
  const snapshot = getPlayerSnapshot()
  const pool = GONGFA.filter(g => {
    if (cultivation.learned[g.id]) return false
    if (onlyEligible) {
      return checkGongfaEligibility(g, snapshot, 0).canLearn
    }
    return g.minRealm <= player.major + 1
  })
  if (pool.length === 0) return null

  // 同源功法更容易参悟到(倾向,非独占)
  const elements = rootElements(player.linggen?.roots)
  const picked = rng.weighted(pool, g => {
    const baseAff = (100 / (1 + qualityDef(g.quality).rank * 1.5)) * gongfaAffinity(g.element, elements)
    const eligAff = checkGongfaEligibility(g, snapshot, 0).affinityScore
    return baseAff * eligAff
  })
  cultivation.learn(picked.id)
  collect('gongfa', picked.id)
  track('gongfaLearned')
  return picked.name
}

/** 藏经阁参悟:消耗残页随机习得 */
export function comprehendGongfa(): boolean {
  const resources = useResourcesStore()
  const ui = useUiStore()
  if (!resources.hasSmall('page', COMPREHEND_PAGE_COST)) {
    ui.toast(gongfaPageShortToast(), 'warn')
    return false
  }
  const cultivation = useCultivationStore()
  const snapshot = getPlayerSnapshot()

  // Chỉ lọc những công pháp tương thích và có thể học theo điều kiện của nhân vật
  const pool = GONGFA.filter(g => !cultivation.learned[g.id] && checkGongfaEligibility(g, snapshot, 0).canLearn)
  if (pool.length === 0) {
    ui.toast(gongfaAllLearnedToast(), 'info')
    return false
  }
  resources.spendSmall('page', COMPREHEND_PAGE_COST)
  const name = learnRandomGongfa(undefined, true)
  if (name) {
    ui.toast(gongfaComprehendToast(name), 'rare')
    return true
  }
  return false
}

/** 功法升级消耗 */
export function gongfaUpgradeCost(id: string): { wudao: number; page: number } | null {
  const cultivation = useCultivationStore()
  const def = gongfaDef(id)
  const lv = cultivation.learned[id]
  if (!def || !lv || lv >= def.maxLevel) return null

  // Rào cản giới hạn lĩnh ngộ từ linh căn (File 2)
  const snapshot = getPlayerSnapshot()
  const maxLimit = calcMaxComprehendLevel(def, snapshot)
  if (lv >= maxLimit) return null

  const q = qualityDef(def.quality)
  // 寒冥灵脉:参悟悟道点折扣(Phase 30.3)
  const discount = Math.min(INSIGHT_DISCOUNT_CAP, useDongfuStore().insightDiscount)

  // Ngộ tính cao hỗ trợ giảm thêm tiêu hao ngộ đạo điểm
  const elig = checkGongfaEligibility(def, snapshot, lv)
  const compDiscount = Math.min(0.3, Math.max(0, (elig.speedMultiplier - 1) * 0.15))
  const totalDiscount = Math.min(0.7, discount + compDiscount)

  return {
    wudao: Math.max(1, Math.ceil(gongfaUpCost(q.rank, lv) * (1 - totalDiscount))),
    page: Math.ceil(lv * (1 + q.rank * 0.5))
  }
}

export function upgradeGongfa(id: string): boolean {
  const resources = useResourcesStore()
  const cultivation = useCultivationStore()
  const ui = useUiStore()
  const def = gongfaDef(id)
  const lv = cultivation.learned[id]
  if (!def || !lv) return false

  const snapshot = getPlayerSnapshot()
  const maxLimit = calcMaxComprehendLevel(def, snapshot)
  if (lv >= maxLimit) {
    ui.toast(`Đã đạt giới hạn lĩnh ngộ của linh căn (Tầng ${maxLimit}/${def.maxLevel})`, 'warn')
    return false
  }

  const cost = gongfaUpgradeCost(id)
  if (!cost) return false
  if (!resources.hasSmall('wudao', cost.wudao) || !resources.hasSmall('page', cost.page)) {
    ui.toast(gongfaUpShortToast(), 'warn')
    return false
  }
  resources.spendSmall('wudao', cost.wudao)
  resources.spendSmall('page', cost.page)
  cultivation.upgrade(id)
  ui.toast(gongfaUpDoneToast(def.name, cultivation.learned[id] ?? 0), 'success')
  return true
}
