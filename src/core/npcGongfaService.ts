/**
 * Dịch Vụ Đốn Ngộ & Truyền Thụ Công Pháp NPC (NPC Gongfa Enlightenment & Mentorship Learning)
 *
 * Phân định rõ 3 nguồn gốc công pháp của NPC:
 * 1. Tự Đốn Ngộ (Comprehended): Tự ngộ ra từ quá trình tu luyện, tâm đắc thiên địa, ngộ tính cao hoặc đột phá đại cảnh giới.
 * 2. Thụ Giáo (Learned): Học được từ Tàng Kinh Các tông môn.
 * 3. Chân Truyền (Inherited): Được Sư phụ / Trưởng lão trực tiếp truyền thụ.
 */
import { GONGFA } from '@/data/gongfa'
import type { ElementId, GongfaDef } from '@/types'
import { rng, type RandomService } from '@/utils/random'
import { displayGongfaName } from '@/ui/displayZhVi'

export type GongfaOriginType = 'comprehended' | 'learned' | 'inherited'

export interface GongfaEnlightenmentResult {
  success: boolean
  gongfa?: GongfaDef
  origin?: GongfaOriginType
  message?: string
}

/**
 * NPC tự đốn ngộ công pháp / bí thuật mới từ quá trình tu hành
 */
export function simulateNpcGongfaEnlightenment(
  npc: {
    id: string
    name: string
    major: number
    sub?: number
    comprehension: number
    element?: ElementId
    tierRank?: string
    learnedGongfa: string[]
    gongfaOrigins?: Record<string, GongfaOriginType>
  },
  customRng: RandomService = rng
): GongfaEnlightenmentResult {
  // 1. Điều kiện đốn ngộ: Cần ngộ tính tối thiểu 60 hoặc là thiên kiêu
  if (npc.comprehension < 60 && npc.tierRank !== 'gold' && npc.tierRank !== 'silver') {
    return { success: false }
  }

  // Tỉ lệ đốn ngộ hàng tháng: Ngộ tính 70 -> ~3%, 90 -> ~6%, 100 -> ~8%
  let chance = (npc.comprehension / 100) * 0.07
  if (npc.tierRank === 'gold') chance += 0.05
  else if (npc.tierRank === 'silver') chance += 0.025

  if (!customRng.chance(chance)) {
    return { success: false }
  }

  // 2. Tìm danh sách công pháp khả dụng chưa học phù hợp với cảnh giới và ngũ hành
  const learnedSet = new Set(npc.learnedGongfa)
  const candidates = GONGFA.filter(gf => {
    if (learnedSet.has(gf.id)) return false
    // Cảnh giới yêu cầu không được vượt quá cảnh giới hiện tại
    if (gf.minRealm > npc.major) return false
    // Tương thích ngũ hành: không có nguyên tố (trung tính) hoặc trùng linh căn bản mệnh
    if (gf.element && npc.element && gf.element !== npc.element) return false
    return true
  })

  if (candidates.length === 0) {
    return { success: false }
  }

  // Ưu tiên các công pháp có cảnh giới gần với cảnh giới hiện tại của NPC
  const sorted = [...candidates].sort((a, b) => b.minRealm - a.minRealm)
  const chosen = customRng.pick(sorted.slice(0, 3)) || sorted[0]!

  const gName = displayGongfaName(chosen.name)
  const msg = `【${npc.name}】trong lúc bế quan tu luyện, tâm đắc đạo vận thiên địa, bỗng nhiên đốn ngộ ra Công pháp【${gName}】!`

  return {
    success: true,
    gongfa: chosen,
    origin: 'comprehended',
    message: msg
  }
}

/**
 * Trưởng lão / Sư phụ truyền thụ công pháp cho đệ tử dưới trướng
 */
export function simulateMentorTeachGongfa(
  mentor: {
    id: string
    name: string
    learnedGongfa: string[]
  },
  disciple: {
    id: string
    name: string
    major: number
    element?: ElementId
    learnedGongfa: string[]
    gongfaOrigins?: Record<string, GongfaOriginType>
  },
  customRng: RandomService = rng
): GongfaEnlightenmentResult {
  // Sư phụ cần có công pháp đã học
  if (!mentor.learnedGongfa || mentor.learnedGongfa.length === 0) {
    return { success: false }
  }

  const discipleLearned = new Set(disciple.learnedGongfa)
  // Lọc ra các công pháp sư phụ biết mà đệ tử chưa học và đệ tử đủ cảnh giới tiếp thu
  const teachable = mentor.learnedGongfa
    .map(gId => GONGFA.find(g => g.id === gId))
    .filter((gf): gf is GongfaDef => {
      if (!gf) return false
      if (discipleLearned.has(gf.id)) return false
      if (gf.minRealm > disciple.major) return false
      if (gf.element && disciple.element && gf.element !== disciple.element) return false
      return true
    })

  if (teachable.length === 0) {
    return { success: false }
  }

  // Tỉ lệ truyền công: 25% mỗi tháng
  if (!customRng.chance(0.25)) {
    return { success: false }
  }

  const chosen = customRng.pick(teachable)
  const gName = displayGongfaName(chosen.name)
  const msg = `Sư phụ【${mentor.name}】tận tâm truyền thụ bí kíp【${gName}】cho đệ tử【${disciple.name}】!`

  return {
    success: true,
    gongfa: chosen,
    origin: 'inherited',
    message: msg
  }
}
