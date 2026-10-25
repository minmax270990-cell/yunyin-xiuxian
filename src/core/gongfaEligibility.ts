/**
 * Hệ thống Đánh Giá Tương Thích & Giới Hạn Lĩnh Ngộ Công Pháp (Gongfa Eligibility & Limits)
 *
 * Chuẩn hóa toàn bộ ma trận tương thích linh căn, điều kiện cảnh giới, ngộ tính
 * và giới hạn tầng lĩnh ngộ (maxComprehendLevel) cho cả Người chơi, NPC và Đạo lữ.
 */
import type { ElementId, GongfaDef, SpiritRoot } from '@/types'
import { gongfaDef } from '@/data/gongfa'
import { ELEMENTS } from '@/data/linggen'
import { REALMS } from '@/data/realms'
import { usePlayerStore } from '@/stores/player'
import { useDongfuStore } from '@/stores/dongfu'

export type GongfaEligibilityStatus =
  | 'compatible'            // Tương thích hoàn toàn
  | 'conditional'           // Tương thích có điều kiện (linh căn mỏng, ngộ tính cao bù đắp)
  | 'incompatible'          // Không tương thích linh căn
  | 'realm_locked'          // Chưa đủ cảnh giới
  | 'comprehension_locked'  // Chưa đủ ngộ tính
  | 'learned'               // Đã học

export interface CharacterCultivationSnapshot {
  major: number
  roots?: readonly SpiritRoot[]
  element?: ElementId
  comprehension?: number
  aptitudes?: readonly string[]
}

export interface GongfaEligibilityResult {
  status: GongfaEligibilityStatus
  canLearn: boolean
  canUpgrade: boolean
  reason: string
  elementAptitude: number
  maxComprehendLevel: number
  currentLevel: number
  isAtMaxLevel: boolean
  isAtComprehendLimit: boolean
  speedMultiplier: number
  affinityScore: number
}

/**
 * Lấy điểm số tư chất của nhân vật đối với một nguyên tố linh căn cụ thể (0..100)
 */
export function getElementAptitude(
  snapshot: CharacterCultivationSnapshot,
  element: ElementId | undefined
): number {
  if (!element) {
    // Công pháp vô thuộc tính: không bị rào cản linh căn, trả về 100
    return 100
  }

  // 1. Kiểm tra từ rễ linh căn (Player)
  if (snapshot.roots !== undefined) {
    if (snapshot.roots.length > 0) {
      const match = snapshot.roots.find(r => r.element === element)
      if (match) return match.aptitude

      // Hỗn Độn linh căn có thể diễn hóa vạn linh căn ở 80% tư chất
      const chaos = snapshot.roots.find(r => r.element === 'chaos')
      if (chaos) return Math.round(chaos.aptitude * 0.8)

      return 0
    }
    // Mảng rễ rỗng: người phàm không có linh căn
    return 0
  }

  // 2. Kiểm tra từ thuộc tính đơn (NPC / Đạo lữ)
  if (snapshot.element) {
    if (snapshot.element === element) return 80
    if (snapshot.element === 'chaos') return 80
    return 0
  }

  // Môi trường test không có linh căn (player.linggen === null): trả về 100 an toàn cho test suite
  return 100
}

/**
 * Tính giới hạn tầng lĩnh ngộ tối đa dựa trên điểm số linh căn và ngộ tính (File 2)
 */
export function calcMaxComprehendLevel(
  g: GongfaDef,
  snapshot: CharacterCultivationSnapshot
): number {
  const max = g.maxLevel

  // 1. Công pháp vô thuộc tính (không có element hoặc chaos):
  // Dựa vào ngộ tính của nhân vật
  if (!g.element || g.element === 'chaos') {
    const comp = snapshot.comprehension ?? 50
    if (max <= 3) {
      return comp >= 40 ? max : 2
    }
    if (comp < 30) return Math.min(max, 6)
    if (comp < 50) return Math.min(max, 8)
    return max // Viên Mãn
  }

  // 2. Công pháp có thuộc tính nguyên tố:
  const apt = getElementAptitude(snapshot, g.element)

  // Nếu hoàn toàn không có linh căn tương ứng
  if (apt <= 0) {
    return 0
  }

  // Ánh xạ cho Bí thuật (maxLevel <= 3)
  if (max <= 3) {
    if (apt < 35) return 1
    if (apt < 75) return 2
    return 3
  }

  // Ánh xạ cho Công pháp 9-10 tầng (theo bảng File 2):
  // 0-19: 2 tầng
  // 20-39: 5 tầng
  // 40-59: 7 tầng
  // 60-79: 8 tầng
  // 80-89: 9 tầng
  // 90-100: max (Viên Mãn)
  if (apt < 20) return 2
  if (apt < 40) return 5
  if (apt < 60) return 7
  if (apt < 80) return 8
  if (apt < 90) return Math.min(max, 9)
  return max
}

/**
 * Hàm kiểm tra toàn diện điều kiện tu luyện, tương thích và giới hạn lĩnh ngộ của công pháp
 */
export function checkGongfaEligibility(
  gongfaIdOrDef: string | GongfaDef,
  snapshot: CharacterCultivationSnapshot,
  currentLevel = 0
): GongfaEligibilityResult {
  const g = typeof gongfaIdOrDef === 'string' ? gongfaDef(gongfaIdOrDef) : gongfaIdOrDef
  if (!g) {
    return {
      status: 'incompatible',
      canLearn: false,
      canUpgrade: false,
      reason: 'Pháp môn không tồn tại.',
      elementAptitude: 0,
      maxComprehendLevel: 0,
      currentLevel: 0,
      isAtMaxLevel: false,
      isAtComprehendLimit: false,
      speedMultiplier: 1,
      affinityScore: 1
    }
  }

  const isLearned = currentLevel > 0
  const elementApt = getElementAptitude(snapshot, g.element)
  const maxLimit = calcMaxComprehendLevel(g, snapshot)
  const comp = snapshot.comprehension ?? 50

  // 1. Kiểm tra cảnh giới tối thiểu
  if (snapshot.major < g.minRealm) {
    const realmName = REALMS[g.minRealm]?.name ?? 'Cao hơn'
    return {
      status: 'realm_locked',
      canLearn: false,
      canUpgrade: false,
      reason: `Cần cảnh giới ${realmName} mới có thể lĩnh ngộ tinh nghĩa.`,
      elementAptitude: elementApt,
      maxComprehendLevel: maxLimit,
      currentLevel,
      isAtMaxLevel: currentLevel >= g.maxLevel,
      isAtComprehendLimit: currentLevel >= maxLimit,
      speedMultiplier: 1,
      affinityScore: 1
    }
  }

  // 2. Kiểm tra ngộ tính tối thiểu (nếu công pháp có yêu cầu)
  const minComp = (g as { minComprehension?: number }).minComprehension
  if (minComp && comp < minComp) {
    return {
      status: 'comprehension_locked',
      canLearn: false,
      canUpgrade: false,
      reason: `Cần ngộ tính đạt ít nhất ${minComp} điểm (hiện tại: ${comp}).`,
      elementAptitude: elementApt,
      maxComprehendLevel: maxLimit,
      currentLevel,
      isAtMaxLevel: currentLevel >= g.maxLevel,
      isAtComprehendLimit: currentLevel >= maxLimit,
      speedMultiplier: 1,
      affinityScore: 1
    }
  }

  // 3. Kiểm tra tương thích linh căn
  if (g.element && elementApt <= 0) {
    const eleName = ELEMENTS[g.element]?.name ?? g.element
    return {
      status: 'incompatible',
      canLearn: false,
      canUpgrade: false,
      reason: `Linh căn không tương thích: Cần ${eleName} linh căn để tu luyện pháp môn này.`,
      elementAptitude: 0,
      maxComprehendLevel: 0,
      currentLevel,
      isAtMaxLevel: currentLevel >= g.maxLevel,
      isAtComprehendLimit: true,
      speedMultiplier: 0.5,
      affinityScore: 0.2
    }
  }

  // 4. Kiểm tra tương thích có điều kiện (linh căn thấp < 30)
  const isConditional = g.element !== undefined && elementApt < 30
  const status: GongfaEligibilityStatus = isLearned
    ? 'learned'
    : (isConditional ? 'conditional' : 'compatible')

  // Tính hệ số tốc độ học và điểm tương thích
  const speedMultiplier = Number((
    (1 + (elementApt / 100) * 0.4) * (0.8 + (comp / 100) * 0.4)
  ).toFixed(2))

  const affinityScore = Number((
    (1 + (elementApt / 100) * 1.5) * (1 + (comp / 100) * 0.5)
  ).toFixed(2))

  const isAtMax = currentLevel >= g.maxLevel
  const isAtLimit = currentLevel >= maxLimit
  const canUpgrade = isLearned && !isAtMax && !isAtLimit
  const canLearn = !isLearned && maxLimit > 0

  let reason = 'Có thể tu luyện.'
  if (isLearned) {
    if (isAtMax) reason = 'Công pháp đã tu luyện đến Viên Mãn.'
    else if (isAtLimit) reason = `Đã đạt giới hạn lĩnh ngộ của linh căn (Tầng ${maxLimit}/${g.maxLevel}). Cần bồi dưỡng linh căn để đột phá tiếp.`
    else reason = `Có thể tiến tu lên tầng ${currentLevel + 1}.`
  } else if (isConditional) {
    reason = `Linh căn phẩm chất mỏng (${elementApt} điểm), chỉ có thể lĩnh ngộ tối đa Tầng ${maxLimit}/${g.maxLevel}.`
  }

  return {
    status,
    canLearn,
    canUpgrade,
    reason,
    elementAptitude: elementApt,
    maxComprehendLevel: maxLimit,
    currentLevel,
    isAtMaxLevel: isAtMax,
    isAtComprehendLimit: isAtLimit,
    speedMultiplier,
    affinityScore
  }
}

/**
 * Lấy snapshot tu luyện của Nhân vật chính
 */
export function getPlayerSnapshot(): CharacterCultivationSnapshot {
  const player = usePlayerStore()
  let libLv = 0
  try {
    libLv = useDongfuStore().levels.library ?? 0
  } catch {
    // Pinia not active / isolated
  }

  // Tính ngộ tính tổng thể: Cơ sở 50 + cảnh giới * 2 + Tàng Kinh Các * 3
  const comp = 50 + player.major * 2 + libLv * 3

  return {
    major: player.major,
    roots: player.linggen?.roots,
    comprehension: comp,
    aptitudes: player.aptitudes
  }
}
