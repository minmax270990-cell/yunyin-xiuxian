/**
 * Dịch Vụ Tông Môn & Xử Lý Logic Đệ Tử (Sect & Disciple Core Service)
 *
 * Thuần tính toán (pure calculation), không can thiệp store trực tiếp:
 * - Sinh ứng viên nhập tông từ hệ thống NPC sẵn có
 * - Đệ tử tự tu luyện theo tháng, đột phá, lĩnh ngộ công pháp
 * - Tính toán CombatantSnap cho đệ tử & Tỉ thí tông môn thực tế
 * - Khiêu chiến Tháp Lịch Luyện & Khám phá Bí Cảnh Tông Môn
 * - Tiến trình giải quyết nhiệm vụ Nhiệm Vụ Đường
 */
import type { CombatantSnap, CombatResult, CombatSkill, EquipmentInstance, EquipSlot, StatMods } from '@/types'
import { generateNpc } from '@/data/npcGeneration'
import { baseCombatStats } from './formulas'
import { resolveCombat } from './combat'
import { checkGongfaEligibility } from './gongfaEligibility'
import { gongfaDef } from '@/data/gongfa'
import { aptitudeDef } from '@/data/aptitudes'
import { REALMS } from '@/data/realms'
import { displayEquipName, displayGongfaName, displayPillName, displayRealmName } from '@/ui/displayZhVi'
import {
  gameMonthToCalendar,
  sectQuestTemplate,
  getTrueDisciplesCap,
  SECT_LEVEL_CAPS,
  SECT_RANK_NAMES,
  INITIAL_WORLD_SECTS,
  VASSAL_TRIBUTE_CONFIG,
  getEquipmentVaultCost,
  getPillVaultCost,
  type ActiveSectQuest,
  type ApplicantData,
  type CompletedQuestRecord,
  type DiscipleData,
  type SectHistoryEntry,
  type SectMemberRank,
  type SectQuestTemplate,
  type SectSecretRealmDef,
  type SectVault,
  type SectWarRecord,
  type TournamentRankResult,
  type TournamentDivisionResult,
  type TournamentRecord,
  type TributeRecord,
  type VassalSectData,
  type WorldSectData,
  type PendingWarDeclaration
} from '@/data/sect'
import { rng, type RandomService } from '@/utils/random'
import { add, mulN } from '@/utils/gnum'
import { apprenticeDef, bondTitle } from '@/data/apprentices'
import type { OwnedApprentice } from '@/core/apprenticeService'
import { equipmentTemplate } from '@/data/equipment'
import { pillDef } from '@/data/pills'
import { resolveEquipStats } from './equipGen'

let idCounter = 0
export function nextSectUid(prefix = 'sect'): string {
  idCounter += 1
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}`
}

/**
 * Sinh một ứng viên NPC xin gia nhập Tông môn
 *
 * Ràng buộc:
 * - Cảnh giới chỉ ở Luyện Khí (major = 0) hoặc Trúc Cơ (major = 1)
 * - Có danh tính, tư chất, linh căn, ngộ tính sinh từ hệ thống NPC
 * - ID duy nhất, không trùng lặp các NPC/ứng viên đã tồn tại
 */
export function generateSectApplicant(
  gameMonth: number,
  existingIds: Set<string>,
  customRng: RandomService = rng,
  existingNames?: Set<string>
): ApplicantData {
  // 65% Luyện Khí (stage 0), 35% Trúc Cơ (stage 1)
  const stage = customRng.chance(0.65) ? 0 : 1
  let attempts = 0
  const appUid = nextSectUid('app')
  let npc = generateNpc(stage, undefined, undefined, appUid, customRng, existingNames)

  while ((existingIds.has(npc.id) || (existingNames && existingNames.has(npc.name))) && attempts < 50) {
    attempts += 1
    npc = generateNpc(stage, undefined, undefined, `${appUid}_${attempts}`, customRng, existingNames)
  }

  if (existingNames) {
    existingNames.add(npc.name)
  }

  return {
    id: npc.id,
    name: npc.name,
    gender: npc.gender,
    element: npc.element,
    major: Math.min(1, Math.max(0, npc.major)), // Đảm bảo chỉ 0 hoặc 1
    sub: Math.min(8, Math.max(0, npc.sub)),
    comprehension: npc.comprehension ?? customRng.int(45, 80),
    aptitudes: [...(npc.aptitudes ?? [])],
    temper: npc.temper,
    lean: npc.lean,
    tierRank: npc.tierRank ?? 'normal',
    appliedMonth: gameMonth,
    brief: npc.brief,
    pursuit: npc.pursuit
  }
}

/**
 * Sinh danh sách ứng viên NPC xin gia nhập Tông môn mỗi tháng (mặc định 5 người)
 *
 * Ràng buộc:
 * - Cảnh giới chỉ ở Luyện Khí (major = 0) hoặc Trúc Cơ (major = 1)
 * - Có danh tính, tư chất, linh căn, ngộ tính sinh từ hệ thống NPC
 * - ID duy nhất, không trùng lặp ID và Tên của các NPC/ứng viên đã tồn tại
 */
export function generateMonthlyApplicants(
  count = 5,
  gameMonth: number,
  existingIds: Set<string>,
  customRng: RandomService = rng,
  existingNames?: Set<string>
): ApplicantData[] {
  const applicants: ApplicantData[] = []
  const namesSet = existingNames ?? new Set<string>()
  for (let i = 0; i < count; i++) {
    const app = generateSectApplicant(gameMonth, existingIds, customRng, namesSet)
    applicants.push(app)
    existingIds.add(app.id)
    namesSet.add(app.name)
  }
  return applicants
}

/**
 * Chuyển đổi dữ liệu Đạo đồng cũ (OwnedApprentice) sang Đệ tử Tông môn (DiscipleData)
 * Đảm bảo 100% không làm mất dữ liệu của người chơi từ các bản save trước
 */
export function convertLegacyApprenticeToDisciple(
  appr: OwnedApprentice,
  joinedMonth = 1
): DiscipleData {
  const def = apprenticeDef(appr.archId)
  const title = bondTitle(appr.bond)
  const name = `${def?.name ?? 'Đạo Đồng Môn Hạ'} (${title})`
  // Cảnh giới theo level: 1-9 là Luyện Khí (major 0, sub 0..8), 10-20 là Trúc Cơ (major 1, sub 0..8)
  const major = appr.level <= 9 ? 0 : 1
  const sub = Math.min(8, Math.max(0, (appr.level - 1) % 9))

  return {
    id: appr.uid,
    name,
    gender: 'male',
    element: 'metal',
    major,
    sub,
    expPct: 0,
    comprehension: 60,
    aptitudes: ['apt_p_01'],
    temper: 'cautious',
    lean: 'longevity',
    tierRank: 'normal',
    joinedMonth,
    status: 'idle',
    learnedGongfa: [],
    towerFloor: 0,
    totalContributions: (appr.bond || 0) * 10,
    rank: 'outer'
  }
}

/**
 * Xây dựng CombatantSnap cho đệ tử tông môn để phục vụ Tỉ thí và Vượt tháp
 */
export function createDiscipleCombatSnap(disciple: DiscipleData): CombatantSnap {
  const base = baseCombatStats(disciple.major, disciple.sub)
  const mods: StatMods = {}

  // 1. Nạp thuộc tính từ tư chất
  for (const aptId of disciple.aptitudes) {
    const apt = aptitudeDef(aptId)
    if (apt?.mods) {
      for (const [k, v] of Object.entries(apt.mods)) {
        if (typeof v === 'number') {
          const cur = (mods as Record<string, number>)[k] ?? 0
          ;(mods as Record<string, number>)[k] = cur + v
        }
      }
    }
  }

  // 2. Nạp thuộc tính từ công pháp chủ tu
  if (disciple.activeGongfa) {
    const gf = gongfaDef(disciple.activeGongfa)
    if (gf?.baseMods) {
      for (const [k, v] of Object.entries(gf.baseMods)) {
        if (typeof v === 'number') {
          const cur = (mods as Record<string, number>)[k] ?? 0
          ;(mods as Record<string, number>)[k] = cur + v
        }
      }
    }
  }

  let baseAtk = base.attack
  let baseDef = base.defense
  let baseHp = base.maxHp

  // 3. Nạp thuộc tính và chỉ số từ trang bị đệ tử đang mặc (lấy từ kho tông môn)
  if (disciple.equippedItems && disciple.equippedItems.length > 0) {
    for (const item of disciple.equippedItems) {
      const res = resolveEquipStats(item)
      baseAtk = add(baseAtk, res.flats.attack)
      baseDef = add(baseDef, res.flats.defense)
      baseHp = add(baseHp, res.flats.maxHp)
      for (const [k, v] of Object.entries(res.mods)) {
        if (typeof v === 'number') {
          const cur = (mods as Record<string, number>)[k] ?? 0
          ;(mods as Record<string, number>)[k] = cur + v
        }
      }
    }
  }

  // Áp dụng modifier lên ba chỉ số cơ bản
  const atkBonus = (mods.attackPct ?? 0)
  const defBonus = (mods.defensePct ?? 0)
  const hpBonus = (mods.maxHpPct ?? 0)

  const finalAtk = mulN(baseAtk, 1 + atkBonus)
  const finalDef = mulN(baseDef, 1 + defBonus)
  const finalHp = mulN(baseHp, 1 + hpBonus)
  const speed = 25 + disciple.major * 8 + disciple.sub * 2 + (mods.speed ?? 0)

  // Kỹ năng chiến đấu cơ bản
  const skills: CombatSkill[] = [
    {
      name: 'Phổ Thông Công Kích',
      mult: 1,
      rate: 1
    }
  ]

  // Nếu có công pháp chủ tu, thêm kỹ năng công pháp
  if (disciple.activeGongfa) {
    const gf = gongfaDef(disciple.activeGongfa)
    if (gf) {
      skills.push({
        name: displayGongfaName(gf.name),
        mult: 1.35 + (gf.minRealm || 0) * 0.15,
        rate: 0.45
      })
    }
  }

  return {
    name: disciple.name,
    icon: 'user',
    isPlayer: true,
    attack: finalAtk,
    defense: finalDef,
    maxHp: finalHp,
    speed,
    mods,
    skills
  }
}

/**
 * Đệ tử dùng điểm cống hiến đổi đan dược và trang bị từ Kho Tông Môn để tự bồi dưỡng và lớn mạnh
 */
export function simulateDiscipleVaultExchange(
  disciple: DiscipleData,
  vault: SectVault,
  gameMonth: number,
  customRng: RandomService = rng
): SectHistoryEntry[] {
  const events: SectHistoryEntry[] = []
  const { year, month } = gameMonthToCalendar(gameMonth)
  const currentPts = disciple.contributionPoints ?? disciple.totalContributions ?? 0

  disciple.equippedItems = disciple.equippedItems ?? []
  const equippedSlots = new Map<EquipSlot, EquipmentInstance>()
  for (const eq of disciple.equippedItems) {
    const t = equipmentTemplate(eq.templateId)
    if (t) equippedSlots.set(t.slot, eq)
  }

  // 1. ƯU TIÊN 1: RÚT TRANG BỊ
  // Tìm xem trong kho có món trang bị nào phù hợp và là nâng cấp thực sự cho đệ tử
  let bestEquipUpgrade: EquipmentInstance | null = null
  let bestEquipCost = 0
  let bestEquipIdx = -1

  if (vault.equipments.length > 0) {
    for (let i = 0; i < vault.equipments.length; i++) {
      const item = vault.equipments[i]!
      const tpl = equipmentTemplate(item.templateId)
      if (!tpl) continue

      const cost = getEquipmentVaultCost(item)
      const curEquip = equippedSlots.get(tpl.slot)
      let isUpgrade = false
      if (!curEquip) {
        isUpgrade = true
      } else {
        const curCost = getEquipmentVaultCost(curEquip)
        if (cost > curCost) {
          isUpgrade = true
        }
      }

      if (isUpgrade && cost > bestEquipCost) {
        bestEquipUpgrade = item
        bestEquipCost = cost
        bestEquipIdx = i
      }
    }
  }

  // Nếu có trang bị mục tiêu để nâng cấp:
  if (bestEquipUpgrade && bestEquipCost > 0) {
    if (currentPts >= bestEquipCost) {
      // Đủ điểm: Rút và trang bị ngay!
      const chosenItem = vault.equipments.splice(bestEquipIdx, 1)[0]!
      const tpl = equipmentTemplate(chosenItem.templateId)
      disciple.contributionPoints = currentPts - bestEquipCost

      if (tpl) {
        const oldEquipIdx = disciple.equippedItems.findIndex(e => {
          const t = equipmentTemplate(e.templateId)
          return t?.slot === tpl.slot
        })
        if (oldEquipIdx >= 0) {
          const old = disciple.equippedItems.splice(oldEquipIdx, 1)[0]!
          vault.equipments.push(old)
        }
        disciple.equippedItems.push(chosenItem)

        events.push({
          id: nextSectUid('hist'),
          gameMonth,
          year,
          month,
          category: 'personnel',
          discipleId: disciple.id,
          discipleName: disciple.name,
          summary: `Tháng ${month}, năm thứ ${year} — [Đổi Trang Bị] Đệ tử ${disciple.name} dùng ${bestEquipCost} cống hiến đổi được【${displayEquipName(tpl.name)}】từ Kho Tông Môn trang bị lên thân, chiến lực tăng cao!`
        })
      }
      return events
    } else {
      // "hoặc đệ tử sẽ để dành điểm để rút trang bị"
      // Chưa đủ điểm nhưng đang nhắm món này: Để dành điểm cống hiến, không tiêu xài vào thứ khác!
      return events
    }
  }

  // 2. ƯU TIÊN 2: RÚT ĐAN DƯỢC
  // Nếu không có trang bị cần đổi, kiểm tra đan dược trong kho
  const pillIds = Object.keys(vault.pills).filter(id => (vault.pills[id] ?? 0) > 0)
  if (pillIds.length > 0) {
    if (disciple.status === 'bottleneck') {
      // Bị bình cảnh: ưu tiên đổi đan phá ải
      for (const pId of pillIds) {
        const cost = getPillVaultCost(pId)
        if (currentPts >= cost) {
          disciple.contributionPoints = currentPts - cost
          vault.pills[pId] = (vault.pills[pId] ?? 1) - 1
          if (vault.pills[pId]! <= 0) delete vault.pills[pId]
          disciple.status = 'idle'
          disciple.expPct = 25
          const pDef = pillDef(pId)
          const pName = pDef?.name ? displayPillName(pDef.name) : pId
          events.push({
            id: nextSectUid('hist'),
            gameMonth,
            year,
            month,
            category: 'cultivation',
            discipleId: disciple.id,
            discipleName: disciple.name,
            summary: `Tháng ${month}, năm thứ ${year} — [Đổi Đan Phá Ải] Đệ tử ${disciple.name} dùng ${cost} cống hiến đổi【${pName}】từ Kho Tông Môn, nhờ dược lực phá vỡ bình cảnh tu hành!`
          })
          return events
        }
      }
    } else if (customRng.chance(0.6)) {
      // Đổi đan dược tu luyện tăng exp
      for (const pId of pillIds) {
        const cost = getPillVaultCost(pId)
        if (currentPts >= cost) {
          disciple.contributionPoints = currentPts - cost
          vault.pills[pId] = (vault.pills[pId] ?? 1) - 1
          if (vault.pills[pId]! <= 0) delete vault.pills[pId]
          const gain = customRng.int(15, 30)
          disciple.expPct = Math.min(100, disciple.expPct + gain)
          const pDef = pillDef(pId)
          const pName = pDef?.name ? displayPillName(pDef.name) : pId
          events.push({
            id: nextSectUid('hist'),
            gameMonth,
            year,
            month,
            category: 'cultivation',
            discipleId: disciple.id,
            discipleName: disciple.name,
            summary: `Tháng ${month}, năm thứ ${year} — [Đổi Đan Tu Luyện] Đệ tử ${disciple.name} dùng ${cost} cống hiến đổi【${pName}】từ Kho Tông Môn, bế quan phục dụng tăng thêm ${gain}% tu vi!`
          })
          return events
        }
      }
    }
  }

  // 3. ƯU TIÊN 3: RÚT NGUYÊN LIỆU / LINH THẠCH KHÁC (nếu đã đủ đồ và đan dược)
  // "nếu đã đủ đồ thì mới rút cái khác"
  if (currentPts >= 15) {
    // 3.1. Rút linh thảo nếu có
    const herbGrades = Object.keys(vault.herbs).map(Number).filter(g => (vault.herbs[g] ?? 0) > 0)
    if (herbGrades.length > 0) {
      const g = herbGrades[0]!
      vault.herbs[g] = (vault.herbs[g] ?? 1) - 1
      disciple.contributionPoints = currentPts - 15
      disciple.bagMaterials = disciple.bagMaterials ?? { ore: 0, herb: 0 }
      disciple.bagMaterials.herb = (disciple.bagMaterials.herb ?? 0) + 2
      events.push({
        id: nextSectUid('hist'),
        gameMonth,
        year,
        month,
        category: 'cultivation',
        discipleId: disciple.id,
        discipleName: disciple.name,
        summary: `Tháng ${month}, năm thứ ${year} — [Đổi Linh Thảo] Đệ tử ${disciple.name} dùng 15 cống hiến đổi linh thảo từ Kho Tông Môn để tự nghiên cứu phụ trợ tu luyện!`
      })
      return events
    }

    // 3.2. Rút huyền thiết khoáng nếu có
    if (vault.ores > 0) {
      vault.ores -= 1
      disciple.contributionPoints = currentPts - 20
      disciple.bagMaterials = disciple.bagMaterials ?? { ore: 0, herb: 0 }
      disciple.bagMaterials.ore = (disciple.bagMaterials.ore ?? 0) + 1
      events.push({
        id: nextSectUid('hist'),
        gameMonth,
        year,
        month,
        category: 'cultivation',
        discipleId: disciple.id,
        discipleName: disciple.name,
        summary: `Tháng ${month}, năm thứ ${year} — [Đổi Khoáng Thạch] Đệ tử ${disciple.name} dùng 20 cống hiến đổi Huyền Thiết từ Kho Tông Môn để rèn luyện khí cụ cá nhân!`
      })
      return events
    }

    // 3.3. Rút một ít linh thạch tiêu dùng cá nhân nếu kho còn dồi dào
    if (vault.stone >= 500 && currentPts >= 25) {
      vault.stone -= 200
      disciple.contributionPoints = currentPts - 25
      disciple.bagStones = (disciple.bagStones ?? 0) + 200
      events.push({
        id: nextSectUid('hist'),
        gameMonth,
        year,
        month,
        category: 'cultivation',
        discipleId: disciple.id,
        discipleName: disciple.name,
        summary: `Tháng ${month}, năm thứ ${year} — [Rút Linh Thạch] Đệ tử ${disciple.name} dùng 25 cống hiến đổi 200 Linh thạch từ Kho Tông Môn làm lộ phí tu hành!`
      })
      return events
    }
  }

  return events
}

/**
 * Mô phỏng quá trình tự tu luyện theo tháng của đệ tử
 */
export function simulateDiscipleMonthlyCultivation(
  disciple: DiscipleData,
  libraryGongfas: string[],
  gameMonth: number,
  monthsPassed: number,
  customRng: RandomService = rng,
  vault?: SectVault
): { updatedDisciple: DiscipleData; historyEvents: SectHistoryEntry[] } {
  const d = { ...disciple }
  const events: SectHistoryEntry[] = []
  const { year, month } = gameMonthToCalendar(gameMonth)

  // 0. Đệ tử đã tử vong không tham gia tu luyện
  if (d.status === 'deceased') {
    return { updatedDisciple: d, historyEvents: [] }
  }

  // 0.1. Đệ tử bị Nhập Ma do tâm ma chiếm cứ
  if (d.status === 'demonic') {
    // 25% xác suất ma khí công tâm, bị tâm ma cắn nuốt toàn bộ sinh cơ mà chết
    if (customRng.chance(0.25 * monthsPassed)) {
      d.status = 'deceased'
      d.deathCause = 'Ma khí công tâm, bị Tâm Ma cắn nuốt'
      d.deathMonth = gameMonth
      events.push({
        id: nextSectUid('hist'),
        gameMonth,
        year,
        month,
        category: 'cultivation',
        discipleId: d.id,
        discipleName: d.name,
        summary: `Tháng ${month}, năm thứ ${year} — [Đạo Tiêu Thân Vẫn] Đệ tử ${d.name} bị Nhập Ma lâu ngày không cứu chữa, ma khí công tâm, đã bị tâm ma cắn nuốt toàn bộ sinh cơ mà chết!`
      })
    } else if (customRng.chance(0.2 * monthsPassed)) {
      // 20% tự trấn áp ma niệm, hồi phục thần trí
      d.status = 'idle'
      events.push({
        id: nextSectUid('hist'),
        gameMonth,
        year,
        month,
        category: 'cultivation',
        discipleId: d.id,
        discipleName: d.name,
        summary: `Tháng ${month}, năm thứ ${year} — Đệ tử ${d.name} nhờ ý chí kiên định đã tự trấn áp được ma niệm, khôi phục thần trí bình thường.`
      })
    }
    return { updatedDisciple: d, historyEvents: events }
  }

  // Đệ tử bị thương cần dưỡng thương
  if (d.status === 'injured') {
    if (customRng.chance(0.6 * monthsPassed)) {
      d.status = 'idle'
      events.push({
        id: nextSectUid('hist'),
        gameMonth,
        year,
        month,
        category: 'cultivation',
        discipleId: d.id,
        discipleName: d.name,
        summary: `Tháng ${month}, năm thứ ${year} — Đệ tử ${d.name} đã dưỡng thương khỏi hẳn, tiếp tục chuyên tâm tu hành.`
      })
    }
    return { updatedDisciple: d, historyEvents: events }
  }

  // 1. Tự động tìm hiểu và lĩnh ngộ công pháp từ Tàng Kinh Các nếu chưa có hoặc có công pháp tốt hơn
  if (libraryGongfas.length > 0 && d.status !== 'quest') {
    const unlearned = libraryGongfas.filter(gId => !d.learnedGongfa.includes(gId))
    for (const gId of unlearned) {
      const gf = gongfaDef(gId)
      if (!gf) continue
      const elig = checkGongfaEligibility(
        gf,
        {
          major: d.major,
          element: d.element,
          comprehension: d.comprehension,
          aptitudes: d.aptitudes
        }
      )

      if (elig.canLearn && (elig.status === 'compatible' || elig.status === 'conditional')) {
        // Tỷ lệ lĩnh ngộ dựa trên ngộ tính
        const learnChance = Math.min(0.85, (d.comprehension / 100) * 0.75 + 0.1)
        if (customRng.chance(learnChance)) {
          d.learnedGongfa = [...d.learnedGongfa, gId]
          if (!d.activeGongfa || (gf.minRealm || 0) >= (gongfaDef(d.activeGongfa)?.minRealm || 0)) {
            d.activeGongfa = gId
          }
          events.push({
            id: nextSectUid('hist'),
            gameMonth,
            year,
            month,
            category: 'cultivation',
            discipleId: d.id,
            discipleName: d.name,
            summary: `Tháng ${month}, năm thứ ${year} — Đệ tử ${d.name} đã lĩnh ngộ thành công Công pháp【${displayGongfaName(gf.name)}】tại Tàng Kinh Các.`
          })
          break
        }
      }
    }
  }

  // 1.5. Đệ tử tự thi hành sự vụ thường nhật, tích lũy điểm cống hiến môn phái
  const monthlyDutyPts = customRng.int(10, 25) * monthsPassed
  d.totalContributions = (d.totalContributions ?? 0) + monthlyDutyPts
  d.contributionPoints = (d.contributionPoints ?? 0) + monthlyDutyPts

  // 1.6. Nếu có Kho Tông Môn, đệ tử tự dùng điểm cống hiến đổi đan dược / trang bị để bồi dưỡng bản thân
  if (vault) {
    const vaultEvents = simulateDiscipleVaultExchange(d, vault, gameMonth, customRng)
    events.push(...vaultEvents)
  }

  // 2. Tự tích lũy tu vi
  // Mỗi tháng tăng khoảng 15%..35% tu vi tùy ngộ tính và công pháp
  const baseGainPerMonth = 20
  const compFactor = 0.6 + (d.comprehension / 100) * 0.8 // Ngộ tính 50 -> 1.0, 100 -> 1.4
  let gongfaBonus = 1.0
  if (d.activeGongfa) {
    const gf = gongfaDef(d.activeGongfa)
    if (gf) gongfaBonus = 1.1 + (gf.minRealm || 0) * 0.05
  }

  const expGain = baseGainPerMonth * compFactor * gongfaBonus * monthsPassed
  d.expPct += expGain

  // 3. Đột phá cảnh giới khi đạt 100% tu vi
  if (d.expPct >= 100) {
    if (d.sub < 8) {
      // Đột phá tiểu cảnh giới (sub 0..7 -> sub + 1)
      const btChance = Math.min(0.95, 0.65 + (d.comprehension / 100) * 0.3)
      if (customRng.chance(btChance)) {
        d.sub += 1
        d.expPct = 0
        const realmRaw = REALMS[d.major]?.name ?? 'Luyện Khí'
        events.push({
          id: nextSectUid('hist'),
          gameMonth,
          year,
          month,
          category: 'cultivation',
          discipleId: d.id,
          discipleName: d.name,
          summary: `Tháng ${month}, năm thứ ${year} — Đệ tử ${d.name} đột phá thành công lên【${displayRealmName(realmRaw)} · Tầng ${d.sub + 1}】!`
        })
      } else {
        // Đột phá tiểu cảnh giới thất bại nhẹ, lùi exp về 70%
        d.expPct = 70
      }
    } else {
      // Đột phá đại cảnh giới (Luyện Khí -> Trúc Cơ, Trúc Cơ -> Kim Đan...)
      const nextMajor = d.major + 1
      const newRealmRaw = REALMS[nextMajor]?.name ?? 'Trúc Cơ'

      // Xác suất 35% gặp kỳ ngộ Tâm Ma Phản Phệ khi đột phá đại cảnh giới
      const triggersHeartDemon = customRng.chance(0.35)

      if (triggersHeartDemon) {
        // Đánh giá thực lực của đệ tử vs Tâm Ma
        const discipleCombat = createDiscipleCombatSnap(d)
        const dAtk = discipleCombat.attack.m * Math.pow(10, discipleCombat.attack.e)
        const dDef = discipleCombat.defense.m * Math.pow(10, discipleCombat.defense.e)
        const dHp = discipleCombat.maxHp.m * Math.pow(10, discipleCombat.maxHp.e)
        const disciplePower = (dAtk * 1.5 + dDef * 1.2 + dHp * 0.1) * (1 + (d.comprehension - 50) / 100)

        // Sức mạnh của Tâm Ma phản chiếu cảnh giới và tâm cảnh
        const demonPower = disciplePower * (0.85 + customRng.float(0, 0.35))
        const canDefeatDemon = disciplePower >= demonPower

        if (canDefeatDemon) {
          // Đủ thực lực đánh lại tâm ma: Trảm ma thành đạo, đột phá thành công!
          d.major = nextMajor
          d.sub = 0
          d.expPct = 0
          d.status = 'idle'
          d.comprehension = Math.min(100, d.comprehension + customRng.int(3, 8))
          events.push({
            id: nextSectUid('hist'),
            gameMonth,
            year,
            month,
            category: 'cultivation',
            discipleId: d.id,
            discipleName: d.name,
            summary: `Tháng ${month}, năm thứ ${year} — [Kỳ Ngộ Trảm Ma] Đệ tử ${d.name} khi xung kích đại cảnh giới【${displayRealmName(newRealmRaw)}】gặp phải Tâm Ma phản phệ hung hiểm! Nhờ thực lực hùng hậu và ý chí kiên định, đệ tử đã dũng mãnh đánh bại tâm ma, đốn ngộ đột phá thành công!`
          })
        } else {
          // Không đủ thực lực đánh lại tâm ma: 60% bị tâm ma giết chết, 40% bị nhập ma
          const isKilledByDemon = customRng.chance(0.6)
          if (isKilledByDemon) {
            d.status = 'deceased'
            d.deathCause = 'Bị Tâm Ma phản phệ giết chết khi đột phá đại cảnh giới'
            d.deathMonth = gameMonth
            events.push({
              id: nextSectUid('hist'),
              gameMonth,
              year,
              month,
              category: 'cultivation',
              discipleId: d.id,
              discipleName: d.name,
              summary: `Tháng ${month}, năm thứ ${year} — [Tâm Ma Sát Thân] Đệ tử ${d.name} khi xung kích đại cảnh giới【${displayRealmName(newRealmRaw)}】gặp phải Tâm Ma phản phệ. Vì thực lực không đủ chống cự, đệ tử đã bị tâm ma cắn nuốt thần hồn, đạo tiêu thân vẫn!`
            })
          } else {
            d.status = 'demonic'
            d.expPct = 50
            events.push({
              id: nextSectUid('hist'),
              gameMonth,
              year,
              month,
              category: 'cultivation',
              discipleId: d.id,
              discipleName: d.name,
              summary: `Tháng ${month}, năm thứ ${year} — [Tẩu Hỏa Nhập Ma] Đệ tử ${d.name} khi xung kích đại cảnh giới【${displayRealmName(newRealmRaw)}】bị Tâm Ma phản phệ đảo nghịch tâm trí, rơi vào trạng thái Nhập Ma điên cuồng, ma khí bức người!`
            })
          }
        }
      } else {
        // Đột phá đại cảnh giới thông thường (khi không gặp tâm ma phản phệ)
        const majorBtChance = Math.min(0.75, 0.35 + (d.comprehension / 100) * 0.35)
        if (customRng.chance(majorBtChance)) {
          d.major = nextMajor
          d.sub = 0
          d.expPct = 0
          d.status = 'idle'
          events.push({
            id: nextSectUid('hist'),
            gameMonth,
            year,
            month,
            category: 'cultivation',
            discipleId: d.id,
            discipleName: d.name,
            summary: `Tháng ${month}, năm thứ ${year} — [Kỳ Tích] Đệ tử ${d.name} đột phá đại quan thành công, bước vào đại cảnh giới【${displayRealmName(newRealmRaw)}】!`
          })
        } else {
          d.status = 'bottleneck'
          d.expPct = 90
          events.push({
            id: nextSectUid('hist'),
            gameMonth,
            year,
            month,
            category: 'cultivation',
            discipleId: d.id,
            discipleName: d.name,
            summary: `Tháng ${month}, năm thứ ${year} — Đệ tử ${d.name} gặp phải bình cảnh đại cảnh giới, cần tĩnh tâm bế quan lắng đọng tu vi.`
          })
        }
      }
    }
  }

  // 4. Kỳ ngộ ngẫu nhiên nhỏ (5% xác suất mỗi tháng)
  if (customRng.chance(0.05 * monthsPassed) && d.status !== 'quest') {
    const luckRoll = customRng.int(1, 3)
    if (luckRoll === 1) {
      d.expPct = Math.min(100, d.expPct + 25)
      events.push({
        id: nextSectUid('hist'),
        gameMonth,
        year,
        month,
        category: 'special',
        discipleId: d.id,
        discipleName: d.name,
        summary: `Tháng ${month}, năm thứ ${year} — Đệ tử ${d.name} trong lúc tĩnh tọa bỗng nhiên đốn ngộ, tu vi tăng tiến một đoạn dài.`
      })
    } else if (luckRoll === 2) {
      d.totalContributions += 20
      events.push({
        id: nextSectUid('hist'),
        gameMonth,
        year,
        month,
        category: 'special',
        discipleId: d.id,
        discipleName: d.name,
        summary: `Tháng ${month}, năm thứ ${year} — Đệ tử ${d.name} tình cờ nhặt được linh thảo dâng nộp Tông môn, nhận 20 cống hiến.`
      })
    }
  }

  return { updatedDisciple: d, historyEvents: events }
}

/**
 * Mô phỏng phân bảng thi đấu cho một cấp bậc đệ tử cụ thể:
 * Ngoại môn vs Ngoại môn, Nội môn vs Nội môn, Chân truyền vs Chân truyền
 */
function simulateDivisionRankings(
  divisionKey: 'true' | 'inner' | 'outer',
  divisionName: string,
  divisionDisciples: DiscipleData[],
  customRng: RandomService
): TournamentDivisionResult {
  if (divisionDisciples.length === 0) {
    return {
      division: divisionKey,
      divisionName,
      participantsCount: 0,
      rankings: []
    }
  }

  if (divisionDisciples.length === 1) {
    const sole = divisionDisciples[0]!
    let rewardSummary = ''
    if (divisionKey === 'true') {
      rewardSummary = 'Quán Quân Chân Truyền: 25,000 Linh thạch + 80 Cống hiến + 25% Tu vi'
    } else if (divisionKey === 'inner') {
      rewardSummary = 'Quán Quân Nội Môn: 15,000 Linh thạch + 50 Cống hiến + 20% Tu vi'
    } else {
      rewardSummary = 'Quán Quân Ngoại Môn: 8,000 Linh thạch + 30 Cống hiến + 15% Tu vi'
    }

    return {
      division: divisionKey,
      divisionName,
      participantsCount: 1,
      winnerName: sole.name,
      rankings: [
        {
          rank: 1,
          discipleId: sole.id,
          discipleName: sole.name,
          major: sole.major,
          sub: sole.sub,
          rewardSummary,
          division: divisionKey,
          divisionName
        }
      ]
    }
  }

  // Tỉ thí vòng tròn thực tế giữa các đệ tử trong cùng bảng
  const scoreMap = new Map<string, number>()
  for (const d of divisionDisciples) scoreMap.set(d.id, 0)

  for (let i = 0; i < divisionDisciples.length; i++) {
    for (let j = i + 1; j < divisionDisciples.length; j++) {
      const d1 = divisionDisciples[i]!
      const d2 = divisionDisciples[j]!

      const snap1 = createDiscipleCombatSnap(d1)
      const snap2 = createDiscipleCombatSnap(d2)

      const result = resolveCombat(snap1, snap2, customRng)
      if (result.win) {
        scoreMap.set(d1.id, (scoreMap.get(d1.id) ?? 0) + 3)
      } else {
        scoreMap.set(d2.id, (scoreMap.get(d2.id) ?? 0) + 3)
      }
    }
  }

  // Sắp xếp theo điểm thắng -> cảnh giới -> ngộ tính
  const sorted = [...divisionDisciples].sort((a, b) => {
    const scoreDiff = (scoreMap.get(b.id) ?? 0) - (scoreMap.get(a.id) ?? 0)
    if (scoreDiff !== 0) return scoreDiff
    const majorDiff = b.major - a.major
    if (majorDiff !== 0) return majorDiff
    const subDiff = b.sub - a.sub
    if (subDiff !== 0) return subDiff
    return b.comprehension - a.comprehension
  })

  const rankings: TournamentRankResult[] = sorted.map((d, idx) => {
    const rank = idx + 1
    let rewardSummary = ''
    if (divisionKey === 'true') {
      if (rank === 1) rewardSummary = 'Quán Quân Chân Truyền: 25,000 Linh thạch + 80 Cống hiến + 25% Tu vi'
      else if (rank === 2) rewardSummary = 'Á Quân Chân Truyền: 15,000 Linh thạch + 50 Cống hiến + 15% Tu vi'
      else if (rank === 3) rewardSummary = 'Quý Quân Chân Truyền: 8,000 Linh thạch + 30 Cống hiến + 10% Tu vi'
      else rewardSummary = `${Math.max(1000, 4000 - rank * 500)} Linh thạch + 15 Cống hiến`
    } else if (divisionKey === 'inner') {
      if (rank === 1) rewardSummary = 'Quán Quân Nội Môn: 15,000 Linh thạch + 50 Cống hiến + 20% Tu vi'
      else if (rank === 2) rewardSummary = 'Á Quân Nội Môn: 8,000 Linh thạch + 30 Cống hiến + 12% Tu vi'
      else if (rank === 3) rewardSummary = 'Quý Quân Nội Môn: 5,000 Linh thạch + 20 Cống hiến + 8% Tu vi'
      else rewardSummary = `${Math.max(500, 2500 - rank * 300)} Linh thạch + 10 Cống hiến`
    } else {
      if (rank === 1) rewardSummary = 'Quán Quân Ngoại Môn: 8,000 Linh thạch + 30 Cống hiến + 15% Tu vi'
      else if (rank === 2) rewardSummary = 'Á Quân Ngoại Môn: 4,000 Linh thạch + 20 Cống hiến + 10% Tu vi'
      else if (rank === 3) rewardSummary = 'Quý Quân Ngoại Môn: 2,000 Linh thạch + 10 Cống hiến + 5% Tu vi'
      else rewardSummary = `${Math.max(300, 1500 - rank * 200)} Linh thạch + 5 Cống hiến`
    }

    return {
      rank,
      discipleId: d.id,
      discipleName: d.name,
      major: d.major,
      sub: d.sub,
      rewardSummary,
      division: divisionKey,
      divisionName
    }
  })

  return {
    division: divisionKey,
    divisionName,
    participantsCount: divisionDisciples.length,
    winnerName: sorted[0]?.name,
    rankings
  }
}

/**
 * Tổ chức kỳ Tỉ Thí Tông Môn (mỗi 6 tháng một lần)
 * Phân chia theo phân bảng rõ rệt: Ngoại môn vs Ngoại môn, Nội môn vs Nội môn, Chân truyền vs Chân truyền
 * Dựa trên chiến đấu thực tế (`resolveCombat`) giữa các đệ tử trong cùng phân bảng
 */
export function runSectTournament(
  disciples: DiscipleData[],
  gameMonth: number,
  customRng: RandomService = rng
): { tournament: TournamentRecord; historyEntry: SectHistoryEntry } {
  const { year, month } = gameMonthToCalendar(gameMonth)
  const tournamentIndex = Math.floor(gameMonth / 6)
  const eligibleDisciples = disciples.filter(
    d => d.status !== 'deceased' && d.status !== 'demonic' && (d.rank === 'outer' || d.rank === 'inner' || d.rank === 'true' || !d.rank)
  )

  if (eligibleDisciples.length === 0) {
    const emptyRecord: TournamentRecord = {
      id: nextSectUid('tourn'),
      tournamentIndex,
      gameMonth,
      year,
      month,
      participantsCount: 0,
      winnerName: 'Không có đệ tử',
      divisions: [],
      rankings: []
    }
    return {
      tournament: emptyRecord,
      historyEntry: {
        id: nextSectUid('hist'),
        gameMonth,
        year,
        month,
        category: 'tournament',
        summary: `Tháng ${month}, năm thứ ${year} — Kỳ Tỉ Thí Tông Môn thứ ${tournamentIndex} không thể tổ chức do môn hạ chưa có đệ tử đủ điều kiện.`
      }
    }
  }

  // Phân chia theo 3 bảng thi đấu riêng biệt
  const trueDisciples = eligibleDisciples.filter(d => d.rank === 'true')
  const innerDisciples = eligibleDisciples.filter(d => d.rank === 'inner')
  const outerDisciples = eligibleDisciples.filter(d => (d.rank || 'outer') === 'outer')

  const trueDiv = simulateDivisionRankings('true', 'Bảng Chân Truyền', trueDisciples, customRng)
  const innerDiv = simulateDivisionRankings('inner', 'Bảng Nội Môn', innerDisciples, customRng)
  const outerDiv = simulateDivisionRankings('outer', 'Bảng Ngoại Môn', outerDisciples, customRng)

  const activeDivisions = [trueDiv, innerDiv, outerDiv].filter(div => div.participantsCount > 0)
  const allRankings = [
    ...trueDiv.rankings,
    ...innerDiv.rankings,
    ...outerDiv.rankings
  ]

  // Xác định danh hiệu Quán Quân đại hội (ưu tiên Chân truyền -> Nội môn -> Ngoại môn)
  const prominentWinner = trueDiv.winnerName || innerDiv.winnerName || outerDiv.winnerName || 'Không có đệ tử'

  const record: TournamentRecord = {
    id: nextSectUid('tourn'),
    tournamentIndex,
    gameMonth,
    year,
    month,
    participantsCount: eligibleDisciples.length,
    winnerName: prominentWinner,
    divisions: activeDivisions,
    rankings: allRankings
  }

  const divisionSummaries = activeDivisions
    .filter(d => d.winnerName)
    .map(d => `${d.divisionName}: ${d.winnerName}`)

  const summary = divisionSummaries.length > 1
    ? `Tháng ${month}, năm thứ ${year} — Kỳ Tỉ Thí Tông Môn thứ ${tournamentIndex} viên mãn khép lại! Quán quân các phân bảng: ${divisionSummaries.join(' | ')}.`
    : `Tháng ${month}, năm thứ ${year} — Kỳ Tỉ Thí Tông Môn thứ ${tournamentIndex} viên mãn khép lại! Đệ tử ${prominentWinner} xuất sắc đoạt ngôi Quán Quân.`

  return {
    tournament: record,
    historyEntry: {
      id: nextSectUid('hist'),
      gameMonth,
      year,
      month,
      category: 'tournament',
      discipleId: allRankings[0]?.discipleId,
      discipleName: prominentWinner,
      summary
    }
  }
}

/**
 * Khiêu chiến Tháp Lịch Luyện Tông Môn
 */
export function challengeSectTower(
  disciple: DiscipleData,
  targetFloor: number,
  customRng: RandomService = rng
): {
  success: boolean
  combatResult: CombatResult
  spoils: { stone: number; contribution: number; expPct: number }
} {
  const pSnap = createDiscipleCombatSnap(disciple)

  // Độ khó thủ quan theo tầng:
  // Cứ 5 tầng tăng 1 tiểu cảnh giới, cứ 25 tầng tăng 1 đại cảnh giới
  const guardianMajor = Math.floor((targetFloor - 1) / 25)
  const guardianSub = Math.floor(((targetFloor - 1) % 25) / 3)
  const baseGuardian = baseCombatStats(guardianMajor, guardianSub)

  // Tăng cường thuộc tính thủ quan theo tiến độ tầng
  const scale = 1 + (targetFloor * 0.04)
  const eSnap: CombatantSnap = {
    name: `Thủ Quan Thạch Khôi · Tầng ${targetFloor}`,
    icon: 'shield',
    isPlayer: false,
    attack: mulN(baseGuardian.attack, scale),
    defense: mulN(baseGuardian.defense, scale),
    maxHp: mulN(baseGuardian.maxHp, scale * 1.2),
    speed: 20 + targetFloor,
    mods: {},
    skills: [
      {
        name: 'Trấn Áp Chi Lực',
        mult: 1.25,
        rate: 0.35
      }
    ]
  }

  const result = resolveCombat(pSnap, eSnap, customRng)
  if (result.win) {
    const spoils = {
      stone: targetFloor * 500,
      contribution: 10 + targetFloor * 2,
      expPct: 15
    }
    return { success: true, combatResult: result, spoils }
  }

  return {
    success: false,
    combatResult: result,
    spoils: { stone: 0, contribution: 0, expPct: 0 }
  }
}

export interface MonthlyTowerChallengeResult {
  updatedDisciples: DiscipleData[]
  historyEntries: SectHistoryEntry[]
  totalStone: number
  climbedDisciplesCount: number
  totalFloorsClimbed: number
  summary: string
}

/**
 * Tự động cho các đệ tử tông môn khiêu chiến Tháp Lịch Luyện theo tháng
 * Mỗi đệ tử còn sống sẽ thử khiêu chiến tầng tiếp theo. Nếu thắng áp đảo, có thể thử tiếp (tối đa maxFloorsPerMonth tầng/tháng).
 */
export function simulateMonthlyTowerChallenge(
  disciples: readonly DiscipleData[],
  currentMonth: number,
  customRng: RandomService = rng,
  maxFloorsPerMonth: number = 2
): MonthlyTowerChallengeResult {
  const updatedDisciples: DiscipleData[] = []
  const historyEntries: SectHistoryEntry[] = []
  let totalStone = 0
  let climbedDisciplesCount = 0
  let totalFloorsClimbed = 0

  const { year, month } = gameMonthToCalendar(currentMonth)

  for (const orig of disciples) {
    if (orig.status === 'deceased') {
      updatedDisciples.push({ ...orig })
      continue
    }

    const disc: DiscipleData = { ...orig }
    const startFloor = disc.towerFloor || 0
    let floorsAdvanced = 0
    let stoneGained = 0
    let contribGained = 0
    let expGained = 0

    // Đệ tử thử sức leo tháp
    for (let step = 0; step < maxFloorsPerMonth; step++) {
      const nextFloor = disc.towerFloor + 1
      const res = challengeSectTower(disc, nextFloor, customRng)
      if (res.success) {
        disc.towerFloor = nextFloor
        floorsAdvanced++
        stoneGained += res.spoils.stone
        contribGained += res.spoils.contribution
        expGained += res.spoils.expPct

        // Nếu trận đấu thắng nhưng chật vật (HP còn < 40%), đệ tử dừng lại tĩnh dưỡng
        if (res.combatResult.playerHpPct < 0.4) {
          break
        }
      } else {
        // Thất bại thì dừng bước
        break
      }
    }

    if (floorsAdvanced > 0) {
      disc.totalContributions = (disc.totalContributions || 0) + contribGained
      disc.contributionPoints = (disc.contributionPoints ?? 0) + contribGained
      disc.expPct = Math.min(100, disc.expPct + expGained)
      totalStone += stoneGained
      climbedDisciplesCount++
      totalFloorsClimbed += floorsAdvanced

      historyEntries.push({
        id: nextSectUid('hist_tower'),
        gameMonth: currentMonth,
        year,
        month,
        category: 'tower',
        discipleId: disc.id,
        discipleName: disc.name,
        summary: `Tháng ${month}, năm thứ ${year} — Đệ tử ${disc.name} khiêu chiến đắc thắng vượt qua ${floorsAdvanced > 1 ? `từ Tầng ${startFloor + 1} đến Tầng ${disc.towerFloor}` : `Tầng ${disc.towerFloor}`} Tháp Lịch Luyện (+${stoneGained} Linh thạch, +${contribGained} Cống hiến)!`
      })
    }

    updatedDisciples.push(disc)
  }

  const summary = climbedDisciplesCount > 0
    ? `Có ${climbedDisciplesCount} đệ tử khiêu chiến thành công vượt ải Tháp Lịch Luyện (tổng cộng ${totalFloorsClimbed} tầng), mang về ${totalStone} Linh thạch cho tông môn!`
    : `Các đệ tử đã dốc sức khiêu chiến Tháp Lịch Luyện nhưng chưa thể phá vỡ tầng tháp tiếp theo.`

  return {
    updatedDisciples,
    historyEntries,
    totalStone,
    climbedDisciplesCount,
    totalFloorsClimbed,
    summary
  }
}

/**
 * Khám phá Bí Cảnh Tông Môn
 */
export function exploreSectSecretRealm(
  disciple: DiscipleData,
  realm: SectSecretRealmDef,
  customRng: RandomService = rng
): {
  success: boolean
  encounterText: string
  spoils: {
    stone: number
    herbGrade: number
    herbCount: number
    wudaoCount: number
    contribution: number
    expPct: number
  }
} {
  // Đánh giá thực lực dựa trên cảnh giới và nguyên tố tương hợp
  const majorDiff = disciple.major - realm.minMajor
  const elementMatch = disciple.element === realm.favoredElement
  const winRate = Math.max(0.2, Math.min(0.95, 0.5 + majorDiff * 0.25 + (elementMatch ? 0.15 : 0)))

  if (customRng.chance(winRate)) {
    const spoils = {
      stone: realm.costStone * 1.5,
      herbGrade: Math.min(5, realm.difficulty),
      herbCount: customRng.int(4, 10),
      wudaoCount: realm.difficulty * 3,
      contribution: realm.difficulty * 25,
      expPct: 25
    }
    return {
      success: true,
      encounterText: `Đệ tử ${disciple.name} dũng cảm thám hiểm ${realm.name}, vượt qua các tầng cấm chế yêu thú, thu hoạch đại thắng mang về nhiều trân bảo!`,
      spoils
    }
  }

  // Thất bại thám hiểm bí cảnh
  const isDangerous = realm.difficulty >= 3
  const isKilled = isDangerous && customRng.chance(0.1)
  if (isKilled) {
    disciple.status = 'deceased'
    disciple.deathCause = `Ngã xuống nơi bí cảnh hung hiểm ${realm.name}`
    return {
      success: false,
      encounterText: `[Đạo Tiêu Thân Vẫn] Đệ tử ${disciple.name} khi thám hiểm bí cảnh hung hiểm ${realm.name} gặp phải cấm chế thái cổ sụp đổ, không kịp thoát thân, đã bất hạnh ngã xuống!`,
      spoils: {
        stone: 0,
        herbGrade: 1,
        herbCount: 0,
        wudaoCount: 0,
        contribution: 0,
        expPct: 0
      }
    }
  }

  return {
    success: false,
    encounterText: `Đệ tử ${disciple.name} khi thám hiểm ${realm.name} gặp phải cấm chế hung hiểm, khó khăn thoát thân nhưng thu hoạch không nhiều.`,
    spoils: {
      stone: 500,
      herbGrade: 1,
      herbCount: 2,
      wudaoCount: 1,
      contribution: 5,
      expPct: 5
    }
  }
}

/**
 * Đẩy nhanh tiến trình Nhiệm Vụ Đường khi thời gian tháng trôi qua
 */
export function processSectQuestsProgress(
  activeQuests: ActiveSectQuest[],
  disciplesMap: Map<string, DiscipleData>,
  gameMonth: number,
  customRng: RandomService = rng
): {
  completed: CompletedQuestRecord[]
  remaining: ActiveSectQuest[]
  historyEntries: SectHistoryEntry[]
} {
  const completed: CompletedQuestRecord[] = []
  const remaining: ActiveSectQuest[] = []
  const historyEntries: SectHistoryEntry[] = []
  const { year, month } = gameMonthToCalendar(gameMonth)

  for (const q of activeQuests) {
    if (gameMonth >= q.finishMonth) {
      const disciple = disciplesMap.get(q.assignedDiscipleId)
      const tpl = sectQuestTemplate(q.templateId)

      if (!tpl || !disciple) {
        // Hỏng dữ liệu: loại bỏ khỏi tiến trình
        continue
      }

      // Tỷ lệ hoàn thành nhiệm vụ dựa trên cảnh giới và độ khó
      const majorAdvantage = disciple.major - tpl.minMajor
      const successChance =
        majorAdvantage >= 1 && tpl.difficulty <= 2
          ? 1.0
          : Math.max(0.3, Math.min(0.98, 0.8 + majorAdvantage * 0.15 - tpl.difficulty * 0.05))
      const isSuccess = customRng.chance(successChance)

      if (isSuccess) {
        const parts: string[] = []
        if (tpl.rewards.stoneBase) parts.push(`${tpl.rewards.stoneBase} Linh thạch`)
        if (tpl.rewards.herbCount) parts.push(`${tpl.rewards.herbCount} Linh thảo`)
        if (tpl.rewards.oreCount) parts.push(`${tpl.rewards.oreCount} Huyền thiết`)
        if (tpl.rewards.wudaoCount) parts.push(`${tpl.rewards.wudaoCount} Ngộ đạo`)
        parts.push(`${tpl.rewards.contribution} Cống hiến`)

        const spoilsSummary = parts.join(', ')
        completed.push({
          uid: q.uid,
          templateId: q.templateId,
          discipleId: disciple.id,
          finishMonth: gameMonth,
          success: true,
          spoilsSummary
        })

        historyEntries.push({
          id: nextSectUid('hist'),
          gameMonth,
          year,
          month,
          category: 'quest',
          discipleId: disciple.id,
          discipleName: disciple.name,
          summary: `Tháng ${month}, năm thứ ${year} — Đệ tử ${disciple.name} hoàn thành xuất sắc nhiệm vụ【${tpl.name}】, mang về ${spoilsSummary}.`
        })
      } else {
        // Thất bại: kiểm tra nguy cơ thương tích hoặc tử vong khi lịch luyện
        const isDangerous = tpl.difficulty >= 3 || tpl.minMajor >= 2
        let isKilled = false
        if (isDangerous && customRng.chance(0.12)) {
          isKilled = true
          disciple.status = 'deceased'
          disciple.deathCause = `Tử trận khi chấp hành nhiệm vụ ${tpl.name}`
          disciple.deathMonth = gameMonth
        } else if (customRng.chance(0.35)) {
          disciple.status = 'injured'
        }

        completed.push({
          uid: q.uid,
          templateId: q.templateId,
          discipleId: disciple.id,
          finishMonth: gameMonth,
          success: false,
          spoilsSummary: isKilled ? 'Tử trận khi lịch luyện' : 'Thất bại, không thu hoạch'
        })

        historyEntries.push({
          id: nextSectUid('hist'),
          gameMonth,
          year,
          month,
          category: 'quest',
          discipleId: disciple.id,
          discipleName: disciple.name,
          summary: isKilled
            ? `Tháng ${month}, năm thứ ${year} — [Đạo Tiêu Thân Vẫn] Đệ tử ${disciple.name} khi chấp hành nhiệm vụ hung hiểm【${tpl.name}】không may gặp phải yêu ma cường đại vây hãm, dũng cảm chiến đấu đến giọt máu cuối cùng nhưng bất hạnh tử trận!`
            : `Tháng ${month}, năm thứ ${year} — Đệ tử ${disciple.name} chấp hành nhiệm vụ【${tpl.name}】thất bại, không có thu hoạch.`
        })
      }
    } else {
      remaining.push(q)
    }
  }

  return { completed, remaining, historyEntries }
}

export interface AutoDispatchResult {
  dispatchedCount: number
  assignments: Array<{
    discipleId: string
    discipleName: string
    templateId: string
    questName: string
    potentialScore: number
  }>
}

/**
 * Đánh giá điểm tiềm năng và mức độ phù hợp của đệ tử đối với một nhiệm vụ tông môn
 * Điểm càng cao thì đệ tử càng có tiềm năng xuất sắc và khả năng hoàn thành nhiệm vụ càng lớn
 */
export function evaluateDiscipleQuestPotential(disciple: DiscipleData, tpl: SectQuestTemplate): number {
  if (disciple.status !== 'idle') return -1
  if (disciple.major < tpl.minMajor) return -1

  let score = 0

  // 1. Phẩm cấp thiên kiêu (Thiên phú tiềm năng)
  if (disciple.tierRank === 'gold') score += 80
  else if (disciple.tierRank === 'silver') score += 40

  // 2. Ngộ tính (30..100)
  score += Math.round(disciple.comprehension * 0.6)

  // 3. Ưu thế cảnh giới so với yêu cầu tối thiểu
  const majorAdv = disciple.major - tpl.minMajor
  score += majorAdv * 45 + disciple.sub * 4

  // 4. Chiến tích và thực lực chứng minh qua tháp
  score += (disciple.towerFloor || 0) * 2
  score += Math.min(20, (disciple.battlesWon || 0) * 2)

  // 5. Tương thích ngũ hành & sở trường với loại nhiệm vụ
  if (tpl.type === 'herb' && disciple.element === 'wood') score += 30
  if (tpl.type === 'alchemy' && (disciple.element === 'fire' || disciple.element === 'wood')) score += 30
  if (tpl.type === 'ore' && (disciple.element === 'metal' || disciple.element === 'earth')) score += 30
  if (tpl.type === 'subdue' && (disciple.element === 'metal' || disciple.element === 'fire')) score += 25
  if (tpl.type === 'explore' && (disciple.element === 'water' || disciple.comprehension >= 70)) score += 25
  if (tpl.type === 'patrol' && (disciple.element === 'earth' || disciple.element === 'metal')) score += 20

  // 6. Tương thích công pháp chủ tu
  if (disciple.activeGongfa) score += 15

  // 7. Phân công chức vụ theo độ khó nhiệm vụ
  if (tpl.difficulty >= 3) {
    if (disciple.rank === 'elder' || disciple.rank === 'guardian' || disciple.rank === 'vice_master') score += 40
    else if (disciple.rank === 'true') score += 25
    else if (disciple.rank === 'inner') score += 10
  } else if (tpl.difficulty === 1) {
    if (disciple.rank === 'outer') score += 25
    else if (disciple.rank === 'inner') score += 15
  }

  return score
}

/**
 * Tự động tìm kiếm và phân công các đệ tử có tiềm năng cao nhất vào các nhiệm vụ đang có
 */
export function autoDispatchDisciplesToQuests(
  disciples: DiscipleData[],
  templates: readonly SectQuestTemplate[],
  activeQuests: ActiveSectQuest[],
  currentMonth: number
): {
  newActiveQuests: ActiveSectQuest[]
  updatedDisciples: DiscipleData[]
  historyEntries: SectHistoryEntry[]
  result: AutoDispatchResult
} {
  const disciplesMap = new Map(disciples.map(d => [d.id, { ...d }]))
  const newQuests: ActiveSectQuest[] = []
  const assignments: AutoDispatchResult['assignments'] = []
  const historyEntries: SectHistoryEntry[] = []
  const { year, month } = gameMonthToCalendar(currentMonth)

  // Danh sách các template hiện đang có người làm
  const busyTemplateIds = new Set(activeQuests.map(q => q.templateId))

  // Sắp xếp các nhiệm vụ tông môn theo độ ưu tiên: Độ khó cao và phần thưởng lớn xếp trước
  const sortedTemplates = [...templates].sort((a, b) => b.difficulty - a.difficulty)

  // Danh sách ID đệ tử đã được giao việc trong đợt này
  const newlyAssignedDiscipleIds = new Set<string>()

  for (const tpl of sortedTemplates) {
    // Nếu nhiệm vụ này đã có người làm thì bỏ qua (mỗi vị trí 1 người phụ trách)
    if (busyTemplateIds.has(tpl.id)) continue

    // Tìm đệ tử nhàn rỗi có tiềm năng cao nhất cho nhiệm vụ này
    let bestDisciple: DiscipleData | null = null
    let bestScore = -1

    for (const d of disciplesMap.values()) {
      if (d.status !== 'idle' || newlyAssignedDiscipleIds.has(d.id)) continue
      const score = evaluateDiscipleQuestPotential(d, tpl)
      if (score > bestScore) {
        bestScore = score
        bestDisciple = d
      }
    }

    if (bestDisciple && bestScore >= 0) {
      newlyAssignedDiscipleIds.add(bestDisciple.id)
      busyTemplateIds.add(tpl.id)

      const finishMonth = currentMonth + tpl.durationMonths
      const newQuestUid = nextSectUid('quest')
      const questItem: ActiveSectQuest = {
        uid: newQuestUid,
        templateId: tpl.id,
        assignedDiscipleId: bestDisciple.id,
        startMonth: currentMonth,
        finishMonth,
        status: 'in_progress'
      }
      newQuests.push(questItem)

      bestDisciple.status = 'quest'
      bestDisciple.assignedQuestId = newQuestUid

      assignments.push({
        discipleId: bestDisciple.id,
        discipleName: bestDisciple.name,
        templateId: tpl.id,
        questName: tpl.name,
        potentialScore: bestScore
      })

      historyEntries.push({
        id: nextSectUid('hist'),
        gameMonth: currentMonth,
        year,
        month,
        category: 'quest',
        discipleId: bestDisciple.id,
        discipleName: bestDisciple.name,
        summary: `Tháng ${month}, năm thứ ${year} — [Tự Động Phái Việc] Đệ tử tiềm năng ${bestDisciple.name} được phái thi hành nhiệm vụ【${tpl.name}】(Thời hạn ${tpl.durationMonths} tháng).`
      })
    }
  }

  return {
    newActiveQuests: newQuests,
    updatedDisciples: Array.from(disciplesMap.values()),
    historyEntries,
    result: {
      dispatchedCount: assignments.length,
      assignments
    }
  }
}

/**
 * Tính tổng lực chiến của Tông môn
 * Lão tổ chỉ tham chiến khi summonAncestor = true
 */
export function calculateSectCombatPower(
  disciples: DiscipleData[],
  summonAncestor = false,
  playerSnapshot?: { major: number; sub: number }
): number {
  let total = 0

  for (const d of disciples) {
    if (d.status === 'deceased' || d.status === 'demonic') {
      continue
    }
    if (d.rank === 'ancestor' && !summonAncestor) {
      continue // Lão tổ không xuất chiến thì không tính vào lực chiến thông thường
    }
    const snap = createDiscipleCombatSnap(d)
    const baseAtk = snap.attack.m * Math.pow(10, snap.attack.e)
    const baseDef = snap.defense.m * Math.pow(10, snap.defense.e)
    const baseHp = snap.maxHp.m * Math.pow(10, snap.maxHp.e)
    const rankMult =
      d.rank === 'ancestor' ? 2.5 :
      d.rank === 'master' ? 2.0 :
      d.rank === 'vice_master' ? 1.85 :
      d.rank === 'guardian' ? 1.7 :
      d.rank === 'elder' ? 1.5 :
      d.rank === 'true' ? 1.3 :
      d.rank === 'inner' ? 1.15 : 1.0

    const memberPower = Math.floor((baseAtk * 1.5 + baseDef * 1.2 + baseHp * 0.1) * rankMult)
    total += Math.max(50, memberPower)
  }

  // Nếu người chơi là Lão tổ hoặc Tông chủ tham chiến:
  if (playerSnapshot) {
    const pBase = baseCombatStats(playerSnapshot.major, playerSnapshot.sub)
    const pAtk = pBase.attack.m * Math.pow(10, pBase.attack.e)
    const pDef = pBase.defense.m * Math.pow(10, pBase.defense.e)
    const pHp = pBase.maxHp.m * Math.pow(10, pBase.maxHp.e)
    const pPower = Math.floor((pAtk * 1.5 + pDef * 1.2 + pHp * 0.1) * 2.0)
    total += Math.max(200, pPower)
  }

  // Triệu tập Lão tổ trợ chiến gia tăng 50% tổng lực chiến toàn môn
  if (summonAncestor) {
    total = Math.floor(total * 1.5)
  }

  return Math.max(100, Math.floor(total))
}

export interface PromotionEvent {
  discipleId: string
  discipleName: string
  fromRank: SectMemberRank
  toRank: SectMemberRank
  reason: string
}

/**
 * Xét duyệt thăng cấp định kỳ 6 tháng một lần cho đệ tử & chức vụ tông môn
 */
export function evaluateBiannualPromotions(
  disciples: DiscipleData[],
  sectLevel: number,
  currentMonth: number,
  tournament?: TournamentRecord
): {
  updatedDisciples: DiscipleData[]
  promotions: PromotionEvent[]
  historyEntries: SectHistoryEntry[]
} {
  const caps = SECT_LEVEL_CAPS[sectLevel] ?? SECT_LEVEL_CAPS[1]!
  const list = disciples.map(d => ({ ...d }))
  const promotions: PromotionEvent[] = []
  const historyEntries: SectHistoryEntry[] = []
  const { year, month } = gameMonthToCalendar(currentMonth)

  const countRank = (r: SectMemberRank) => list.filter(d => d.rank === r && d.status !== 'deceased').length

  // 0. Xét tấn thăng Lão Tổ (nếu còn slot Lão tổ)
  const ancestorSlots = caps.ancestor - countRank('ancestor')
  if (ancestorSlots > 0) {
    const candidates = list
      .filter(d => d.status !== 'deceased' && d.status !== 'demonic' && (d.rank === 'vice_master' || d.rank === 'elder') && d.major >= 4)
      .sort((a, b) => (b.major * 10 + b.sub) - (a.major * 10 + a.sub) || b.totalContributions - a.totalContributions)

    for (let i = 0; i < Math.min(ancestorSlots, candidates.length); i++) {
      const c = candidates[i]!
      const target = list.find(d => d.id === c.id)!
      const fromRank = target.rank
      target.rank = 'ancestor'
      target.promotedMonth = currentMonth
      const reason = `Cảnh giới đại thành (${REALMS[target.major]?.name ?? 'Hóa Thần'}), thăng hoa thành Lão Tổ trấn phái.`
      promotions.push({ discipleId: target.id, discipleName: target.name, fromRank, toRank: 'ancestor', reason })
      historyEntries.push({
        id: nextSectUid('hist_prom'),
        gameMonth: currentMonth,
        year,
        month,
        category: 'promotion',
        discipleId: target.id,
        discipleName: target.name,
        summary: `Tháng ${month}, năm thứ ${year} — Bổ nhiệm ${SECT_RANK_NAMES[fromRank]} ${target.name} tấn thăng【Lão Tổ Trấn Phái】. Lý do: ${reason}`
      })
    }
  }

  // 1. Xét bổ nhiệm Phó Tông Chủ (nếu còn slot)
  const viceMasterSlots = caps.vice_master - countRank('vice_master')
  if (viceMasterSlots > 0) {
    const candidates = list
      .filter(d => d.status !== 'deceased' && d.status !== 'demonic' && (d.rank === 'elder' || d.rank === 'guardian') && d.major >= 2)
      .sort((a, b) => (b.major * 10 + b.sub) - (a.major * 10 + a.sub) || b.totalContributions - a.totalContributions)

    for (let i = 0; i < Math.min(viceMasterSlots, candidates.length); i++) {
      const c = candidates[i]!
      const target = list.find(d => d.id === c.id)!
      const fromRank = target.rank
      target.rank = 'vice_master'
      target.promotedMonth = currentMonth
      const reason = `Cảnh giới ${REALMS[target.major]?.name ?? 'Kim Đan'}, cống hiến ${target.totalContributions} điểm, đức cao vọng trọng.`
      promotions.push({ discipleId: target.id, discipleName: target.name, fromRank, toRank: 'vice_master', reason })
      historyEntries.push({
        id: nextSectUid('hist_prom'),
        gameMonth: currentMonth,
        year,
        month,
        category: 'promotion',
        discipleId: target.id,
        discipleName: target.name,
        summary: `Tháng ${month}, năm thứ ${year} — Bổ nhiệm ${SECT_RANK_NAMES[fromRank]} ${target.name} tấn thăng【Phó Tông Chủ】. Lý do: ${reason}`
      })
    }
  }

  // 2. Xét bổ nhiệm Hộ Pháp (nếu còn slot)
  const guardianSlots = caps.guardian - countRank('guardian')
  if (guardianSlots > 0) {
    const candidates = list
      .filter(d => d.status !== 'deceased' && d.status !== 'demonic' && (d.rank === 'elder' || d.rank === 'true') && (d.major >= 2 || (d.major >= 1 && d.sub >= 5)))
      .sort((a, b) => (b.battlesWon ?? 0) - (a.battlesWon ?? 0) || (b.major * 10 + b.sub) - (a.major * 10 + a.sub))

    for (let i = 0; i < Math.min(guardianSlots, candidates.length); i++) {
      const c = candidates[i]!
      const target = list.find(d => d.id === c.id)!
      const fromRank = target.rank
      target.rank = 'guardian'
      target.promotedMonth = currentMonth
      const reason = `Chiến lực trác tuyệt, trảm yêu trừ ma nhiều chiến công hiển hách.`
      promotions.push({ discipleId: target.id, discipleName: target.name, fromRank, toRank: 'guardian', reason })
      historyEntries.push({
        id: nextSectUid('hist_prom'),
        gameMonth: currentMonth,
        year,
        month,
        category: 'promotion',
        discipleId: target.id,
        discipleName: target.name,
        summary: `Tháng ${month}, năm thứ ${year} — Bổ nhiệm ${SECT_RANK_NAMES[fromRank]} ${target.name} giữ chức【Hộ Pháp Tông Môn】. Lý do: ${reason}`
      })
    }
  }

  // 3. Xét bổ nhiệm Trưởng Lão (nếu còn slot)
  const elderSlots = caps.elder - countRank('elder')
  if (elderSlots > 0) {
    const candidates = list
      .filter(d => d.status !== 'deceased' && d.status !== 'demonic' && d.rank === 'true' && (d.major >= 2 || (d.major >= 1 && d.sub >= 7)) && d.totalContributions >= 50)
      .sort((a, b) => (b.major * 10 + b.sub) - (a.major * 10 + a.sub) || b.comprehension - a.comprehension)

    for (let i = 0; i < Math.min(elderSlots, candidates.length); i++) {
      const c = candidates[i]!
      const target = list.find(d => d.id === c.id)!
      const fromRank = target.rank
      target.rank = 'elder'
      target.promotedMonth = currentMonth
      const reason = `Cảnh giới đại thành, đạo pháp thâm sâu, đủ tư cách khai sơn thu đồ.`
      promotions.push({ discipleId: target.id, discipleName: target.name, fromRank, toRank: 'elder', reason })
      historyEntries.push({
        id: nextSectUid('hist_prom'),
        gameMonth: currentMonth,
        year,
        month,
        category: 'promotion',
        discipleId: target.id,
        discipleName: target.name,
        summary: `Tháng ${month}, năm thứ ${year} — Chân truyền đệ tử ${target.name} tấn thăng【Trưởng Lão】. Lý do: ${reason}`
      })
    }
  }

  // 4. Xét đệ tử Chân Truyền (giới hạn = số Trưởng lão * MAX_TRUE_DISCIPLES_PER_ELDER)
  const currentElderCount = countRank('elder')
  const trueDisciplesCap = getTrueDisciplesCap(currentElderCount)
  const trueSlots = trueDisciplesCap - countRank('true')
  if (trueSlots > 0) {
    const innerDivision = tournament?.divisions?.find(d => d.division === 'inner')
    const innerWinnerIds = new Set(
      innerDivision
        ? innerDivision.rankings.slice(0, 3).map(r => r.discipleId)
        : (tournament?.rankings.slice(0, 3).map(r => r.discipleId) ?? [])
    )
    const candidates = list
      .filter(d => d.status !== 'deceased' && d.status !== 'demonic' && d.rank === 'inner' && (d.major >= 1 || innerWinnerIds.has(d.id)))
      .sort((a, b) => {
        const aWin = innerWinnerIds.has(a.id) ? 1 : 0
        const bWin = innerWinnerIds.has(b.id) ? 1 : 0
        return bWin - aWin || (b.major * 10 + b.sub) - (a.major * 10 + a.sub) || b.comprehension - a.comprehension
      })

    for (let i = 0; i < Math.min(trueSlots, candidates.length); i++) {
      const c = candidates[i]!
      const target = list.find(d => d.id === c.id)!
      const fromRank = target.rank
      target.rank = 'true'
      target.promotedMonth = currentMonth
      const reason = innerWinnerIds.has(target.id)
        ? `Đoạt thứ hạng cao tại Bảng Nội Môn kỳ Tỉ Thí Tông Môn, ngộ tính ${target.comprehension} điểm xuất sắc.`
        : `Tu vi đột phá Trúc Cơ Kỳ, tâm tính vững vàng, tư chất ưu tú.`
      promotions.push({ discipleId: target.id, discipleName: target.name, fromRank, toRank: 'true', reason })
      historyEntries.push({
        id: nextSectUid('hist_prom'),
        gameMonth: currentMonth,
        year,
        month,
        category: 'promotion',
        discipleId: target.id,
        discipleName: target.name,
        summary: `Tháng ${month}, năm thứ ${year} — Nội môn đệ tử ${target.name} được chọn làm【Chân Truyền Đệ Tử】. Lý do: ${reason}`
      })
    }
  }

  // 5. Xét Ngoại Môn lên Nội Môn (giới hạn = caps.inner)
  const innerSlots = caps.inner - countRank('inner')
  if (innerSlots > 0) {
    const outerDivision = tournament?.divisions?.find(d => d.division === 'outer')
    const outerWinnerIds = new Set(outerDivision?.rankings.slice(0, 3).map(r => r.discipleId) ?? [])
    const candidates = list
      .filter(d => d.status !== 'deceased' && d.status !== 'demonic' && d.rank === 'outer' && (outerWinnerIds.has(d.id) || ((d.major >= 1 || d.sub >= 4) && d.totalContributions >= 15)))
      .sort((a, b) => {
        const aWin = outerWinnerIds.has(a.id) ? 1 : 0
        const bWin = outerWinnerIds.has(b.id) ? 1 : 0
        return bWin - aWin || (b.major * 10 + b.sub) - (a.major * 10 + a.sub) || b.totalContributions - a.totalContributions
      })

    for (let i = 0; i < Math.min(innerSlots, candidates.length); i++) {
      const c = candidates[i]!
      const target = list.find(d => d.id === c.id)!
      const fromRank = target.rank
      target.rank = 'inner'
      target.promotedMonth = currentMonth
      const reason = outerWinnerIds.has(target.id)
        ? `Đoạt thứ hạng cao tại Bảng Ngoại Môn kỳ Tỉ Thí Tông Môn, bộc lộ tiềm năng xuất chúng.`
        : `Vượt qua sát hạch, cống hiến đạt ${target.totalContributions} điểm, cảnh giới ${REALMS[target.major]?.name} tầng ${target.sub + 1}.`
      promotions.push({ discipleId: target.id, discipleName: target.name, fromRank, toRank: 'inner', reason })
      historyEntries.push({
        id: nextSectUid('hist_prom'),
        gameMonth: currentMonth,
        year,
        month,
        category: 'promotion',
        discipleId: target.id,
        discipleName: target.name,
        summary: `Tháng ${month}, năm thứ ${year} — Ngoại môn đệ tử ${target.name} vượt qua sát hạch nhập tuyển【Nội Môn Đệ Tử】. Lý do: ${reason}`
      })
    }
  }

  if (promotions.length === 0) {
    historyEntries.push({
      id: nextSectUid('hist_prom'),
      gameMonth: currentMonth,
      year,
      month,
      category: 'promotion',
      summary: `Tháng ${month}, năm thứ ${year} — Kỳ xét duyệt bán niên: Toàn thể môn hạ tiếp tục cần kiệm tu luyện, chưa có nhân sự mới đủ điều kiện thăng cấp chức vụ.`
    })
  }

  return { updatedDisciples: list, promotions, historyEntries }
}

/**
 * Tông chủ nhường ngôi và trở thành Lão tổ
 */
export function abdicateMasterToAncestor(
  disciples: DiscipleData[],
  sectLevel: number,
  currentMonth: number,
  designatedSuccessorId?: string
): {
  success: boolean
  message: string
  updatedDisciples: DiscipleData[]
  newMasterId?: string
  formerMasterName?: string
  newMasterName?: string
  historyEntry?: SectHistoryEntry
} {
  const caps = SECT_LEVEL_CAPS[sectLevel] ?? SECT_LEVEL_CAPS[1]!
  const list = disciples.map(d => ({ ...d }))
  const ancestorCount = list.filter(d => d.rank === 'ancestor').length

  if (ancestorCount >= caps.ancestor) {
    return {
      success: false,
      message: `Tông môn đã đạt số lượng Lão Tổ tối đa (${caps.ancestor}/${caps.ancestor}) của Cấp ${sectLevel}!`,
      updatedDisciples: disciples
    }
  }

  let successor: DiscipleData | undefined
  if (designatedSuccessorId) {
    successor = list.find(d => d.id === designatedSuccessorId && d.rank !== 'ancestor' && d.rank !== 'master')
  }

  if (!successor) {
    // Tự động tìm ứng viên ưu tiên: Phó Tông Chủ > Hộ Pháp > Trưởng Lão > Chân Truyền (cảnh giới >= Trúc Cơ)
    successor = list
      .filter(d => d.rank !== 'ancestor' && d.rank !== 'master' && d.major >= 1)
      .sort((a, b) => {
        const rankPriority = (r: SectMemberRank) =>
          r === 'vice_master' ? 4 : r === 'guardian' ? 3 : r === 'elder' ? 2 : 1
        return (
          rankPriority(b.rank) - rankPriority(a.rank) ||
          (b.major * 10 + b.sub) - (a.major * 10 + a.sub) ||
          b.totalContributions - a.totalContributions
        )
      })[0]
  }

  if (!successor) {
    return {
      success: false,
      message: 'Không tìm thấy người kế nhiệm thích hợp (Cần ít nhất cảnh giới Trúc Cơ trở lên)! Tạm hoãn nhường ngôi.',
      updatedDisciples: disciples
    }
  }

  // Tìm Tông chủ cũ nếu có trong danh sách đệ tử
  const oldMaster = list.find(d => d.rank === 'master')
  const formerMasterName = oldMaster ? oldMaster.name : 'Tông Chủ Khai Sơn'

  if (oldMaster) {
    oldMaster.rank = 'ancestor'
    oldMaster.status = 'idle'
  }

  const targetSuccessor = list.find(d => d.id === successor.id)!
  targetSuccessor.rank = 'master'
  targetSuccessor.status = 'idle'

  const { year, month } = gameMonthToCalendar(currentMonth)
  const historyEntry: SectHistoryEntry = {
    id: nextSectUid('hist_abd'),
    gameMonth: currentMonth,
    year,
    month,
    category: 'management',
    summary: `Tháng ${month}, năm thứ ${year} — ${formerMasterName} chính thức nhường ngôi thoái vị thành【Lão Tổ】, truyền lại Tông Chủ đại ấn cho ${targetSuccessor.name}!`
  }

  return {
    success: true,
    message: `Nhường ngôi thành công! ${targetSuccessor.name} đã tiếp quản vị trí Tông Chủ, ${formerMasterName} trở thành Lão Tổ tông môn.`,
    updatedDisciples: list,
    newMasterId: targetSuccessor.id,
    formerMasterName,
    newMasterName: targetSuccessor.name,
    historyEntry
  }
}

/**
 * Mô phỏng Chiến Tranh / Khiêu Chiến Tông Môn hàng năm
 */
export function simulateSectWar(
  playerSectName: string,
  targetSect: WorldSectData,
  playerDisciples: DiscipleData[],
  summonAncestor: boolean,
  currentMonth: number,
  isPlayerAttacker = true,
  playerSnapshot?: { major: number; sub: number },
  customRng: RandomService = rng
): {
  won: boolean
  playerCombatPower: number
  enemyCombatPower: number
  spoils: { stone: number; ore: number; herb: number; pills: number }
  warRecord: SectWarRecord
  historyEntry: SectHistoryEntry
} {
  const pPower = calculateSectCombatPower(playerDisciples, summonAncestor, playerSnapshot)
  const ePower = targetSect.combatPower

  // Variance nhỏ: ±10%
  const pRoll = pPower * (0.95 + customRng.float(0, 0.1))
  const eRoll = ePower * (0.95 + customRng.float(0, 0.1))

  const won = pRoll >= eRoll

  const spoils = won
    ? {
        stone: Math.floor(targetSect.resources.stone * 0.4),
        ore: Math.floor(targetSect.resources.ore * 0.4),
        herb: Math.floor(targetSect.resources.herb * 0.4),
        pills: Math.floor(targetSect.resources.pills * 0.4)
      }
    : { stone: 0, ore: 0, herb: 0, pills: 0 }

  const spoilsSummary = won
    ? `Thu được ${spoils.stone} Linh thạch, ${spoils.ore} Huyền thiết, ${spoils.herb} Linh thảo, ${spoils.pills} Đan dược.`
    : 'Thất trận, đành lui về bảo hộ hộ sơn trận.'

  const { year, month } = gameMonthToCalendar(currentMonth)
  const warRecord: SectWarRecord = {
    id: nextSectUid('war'),
    gameMonth: currentMonth,
    year,
    month,
    opponentId: targetSect.id,
    opponentName: targetSect.name,
    isPlayerAttacker,
    ancestorParticipated: summonAncestor,
    playerCombatPower: pPower,
    opponentCombatPower: ePower,
    won,
    spoilsSummary
  }

  const actionText = isPlayerAttacker ? 'khởi binh khiêu chiến' : 'bị tuyên chiến bởi'
  const resultText = won
    ? `đại phá quân địch giành toàn thắng! ${summonAncestor ? '(Lão Tổ hiển uy chấn áp)' : ''}`
    : `không địch lại đại quân đối phương, đành lui về bảo hộ hộ sơn trận.`

  const historyEntry: SectHistoryEntry = {
    id: nextSectUid('hist_war'),
    gameMonth: currentMonth,
    year,
    month,
    category: 'war',
    summary: `Tháng ${month}, năm thứ ${year} — ${playerSectName} ${actionText} ${targetSect.name} (Lực chiến: ${pPower} vs ${ePower}), ${resultText}`
  }

  return {
    won,
    playerCombatPower: pPower,
    enemyCombatPower: ePower,
    spoils,
    warRecord,
    historyEntry
  }
}

/**
 * Xử lý cống nộp tài nguyên hàng tháng từ các Tông Môn Phụ Thuộc
 */
export function processMonthlyVassalTributes(
  vassals: VassalSectData[],
  worldSects: WorldSectData[],
  currentMonth: number
): {
  updatedVassals: VassalSectData[]
  updatedWorldSects: WorldSectData[]
  totalSpoils: { stone: number; ore: number; herb: number; pills: number }
  tributeRecords: TributeRecord[]
  historyEntries: SectHistoryEntry[]
} {
  const updatedVassals = vassals.map(v => ({ ...v }))
  const updatedWorldSects = worldSects.map(ws => ({
    ...ws,
    resources: { ...ws.resources }
  }))
  const totalSpoils = { stone: 0, ore: 0, herb: 0, pills: 0 }
  const tributeRecords: TributeRecord[] = []
  const historyEntries: SectHistoryEntry[] = []
  const { year, month } = gameMonthToCalendar(currentMonth)

  for (const vassal of updatedVassals) {
    if (vassal.status !== 'active') continue
    if (vassal.lastTributeMonth >= currentMonth) continue // Idempotent: Đã cống nộp tháng này rồi

    const cfg = VASSAL_TRIBUTE_CONFIG[vassal.level] ?? VASSAL_TRIBUTE_CONFIG[1]!
    const targetWs = updatedWorldSects.find(ws => ws.id === vassal.id)

    let stonePaid = cfg.stone
    let orePaid = cfg.ore
    let herbPaid = cfg.herb
    let pillsPaid = cfg.pills
    let isDeficit = false

    if (targetWs) {
      stonePaid = Math.min(targetWs.resources.stone, cfg.stone)
      orePaid = Math.min(targetWs.resources.ore, cfg.ore)
      herbPaid = Math.min(targetWs.resources.herb, cfg.herb)
      pillsPaid = Math.min(targetWs.resources.pills, cfg.pills)

      if (
        stonePaid < cfg.stone ||
        orePaid < cfg.ore ||
        herbPaid < cfg.herb ||
        pillsPaid < cfg.pills
      ) {
        isDeficit = true
      }

      targetWs.resources.stone -= stonePaid
      targetWs.resources.ore -= orePaid
      targetWs.resources.herb -= herbPaid
      targetWs.resources.pills -= pillsPaid
    }

    vassal.lastTributeMonth = currentMonth
    if (isDeficit) {
      vassal.totalDeficitCount += 1
    } else {
      vassal.totalTributesPaid += 1
    }

    totalSpoils.stone += stonePaid
    totalSpoils.ore += orePaid
    totalSpoils.herb += herbPaid
    totalSpoils.pills += pillsPaid

    const note = isDeficit
      ? `Kho tài nguyên thiếu hụt! Chỉ giao nộp được ${stonePaid} Linh thạch, ${orePaid} Huyền thiết, ${herbPaid} Linh thảo, ${pillsPaid} Đan dược.`
      : `Giao nộp đủ cống nộp: ${stonePaid} Linh thạch, ${orePaid} Huyền thiết, ${herbPaid} Linh thảo, ${pillsPaid} Đan dược.`

    const record: TributeRecord = {
      id: nextSectUid('trib'),
      gameMonth: currentMonth,
      year,
      month,
      vassalId: vassal.id,
      vassalName: vassal.name,
      stone: stonePaid,
      ore: orePaid,
      herb: herbPaid,
      pills: pillsPaid,
      success: true,
      isDeficit,
      note
    }
    tributeRecords.push(record)

    historyEntries.push({
      id: nextSectUid('hist_trib'),
      gameMonth: currentMonth,
      year,
      month,
      category: 'tribute',
      summary: `Tháng ${month}, năm thứ ${year} — Tông môn phụ thuộc【${vassal.name}】thực hiện nghĩa vụ cống nộp. ${note}`
    })
  }

  return {
    updatedVassals,
    updatedWorldSects,
    totalSpoils,
    tributeRecords,
    historyEntries
  }
}

/**
 * Sinh danh sách nhân sự thực tế (members: DiscipleData[]) cho một Tông Môn Thế Giới
 */
export function generateWorldSectMembers(
  worldSect: WorldSectData,
  customRng: RandomService = rng
): DiscipleData[] {
  const members: DiscipleData[] = []
  const memberNames = new Set<string>()
  const caps = SECT_LEVEL_CAPS[worldSect.level] ?? SECT_LEVEL_CAPS[1]!
  const leaderMajor = worldSect.leaderMajor
  const majorGfs = worldSect.majorGongfas && worldSect.majorGongfas.length > 0
    ? [...worldSect.majorGongfas]
    : ['m_taixuan']

  // 1. Tông Chủ (Master)
  const masterNpc = generateNpc(leaderMajor, 'male', 'gold', `_ws_${worldSect.id}_master`, customRng, memberNames)
  memberNames.add(worldSect.leaderName)
  members.push({
    id: `${worldSect.id}_master`,
    name: worldSect.leaderName,
    gender: 'male',
    element: worldSect.element,
    major: leaderMajor,
    sub: 8,
    expPct: 80,
    comprehension: masterNpc.comprehension ?? 85,
    aptitudes: masterNpc.aptitudes?.length ? [...masterNpc.aptitudes] : ['apt_p_10'],
    temper: masterNpc.temper,
    lean: masterNpc.lean,
    tierRank: 'gold',
    joinedMonth: 1,
    status: 'idle',
    learnedGongfa: [...majorGfs],
    activeGongfa: majorGfs[0],
    towerFloor: leaderMajor * 10 + 8,
    totalContributions: 500,
    rank: 'master',
    battlesWon: 20
  })

  // 2. Lão Tổ (Ancestor) - nếu có slot ancestor
  if (caps.ancestor > 0) {
    const ancMajor = Math.min(10, leaderMajor + (worldSect.level >= 3 ? 1 : 0))
    const ancNpc = generateNpc(ancMajor, customRng.chance(0.5) ? 'male' : 'female', 'gold', `_ws_${worldSect.id}_anc`, customRng, memberNames)
    members.push({
      id: `${worldSect.id}_anc_1`,
      name: `${ancNpc.name} Lão Tổ`,
      gender: ancNpc.gender,
      element: ancNpc.element,
      major: ancMajor,
      sub: 6,
      expPct: 50,
      comprehension: 90,
      aptitudes: ancNpc.aptitudes?.length ? [...ancNpc.aptitudes] : ['apt_p_10'],
      temper: ancNpc.temper,
      lean: ancNpc.lean,
      tierRank: 'gold',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [...majorGfs],
      activeGongfa: majorGfs[0],
      towerFloor: ancMajor * 10 + 6,
      totalContributions: 1000,
      rank: 'ancestor',
      battlesWon: 50
    })
  }

  // 3. Phó Tông Chủ (Vice Master)
  if (caps.vice_master > 0) {
    const vmMajor = Math.max(0, leaderMajor)
    const vmNpc = generateNpc(vmMajor, customRng.chance(0.5) ? 'male' : 'female', 'silver', `_ws_${worldSect.id}_vm`, customRng, memberNames)
    members.push({
      id: `${worldSect.id}_vm_1`,
      name: vmNpc.name,
      gender: vmNpc.gender,
      element: vmNpc.element,
      major: vmMajor,
      sub: 4,
      expPct: 40,
      comprehension: vmNpc.comprehension ?? 75,
      aptitudes: [...(vmNpc.aptitudes ?? [])],
      temper: vmNpc.temper,
      lean: vmNpc.lean,
      tierRank: 'silver',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [...majorGfs],
      activeGongfa: majorGfs[0],
      towerFloor: vmMajor * 10 + 4,
      totalContributions: 350,
      rank: 'vice_master',
      battlesWon: 15
    })
  }

  // 4. Hộ Pháp (Guardian)
  for (let i = 0; i < Math.min(caps.guardian, 2); i++) {
    const gMajor = Math.max(0, leaderMajor - (worldSect.level === 1 ? 0 : 1))
    const gNpc = generateNpc(gMajor, customRng.chance(0.5) ? 'male' : 'female', 'silver', `_ws_${worldSect.id}_g_${i}`, customRng, memberNames)
    members.push({
      id: `${worldSect.id}_g_${i + 1}`,
      name: gNpc.name,
      gender: gNpc.gender,
      element: gNpc.element,
      major: gMajor,
      sub: 5,
      expPct: 30,
      comprehension: gNpc.comprehension ?? 70,
      aptitudes: [...(gNpc.aptitudes ?? [])],
      temper: gNpc.temper,
      lean: gNpc.lean,
      tierRank: 'silver',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [...majorGfs],
      activeGongfa: majorGfs[0],
      towerFloor: gMajor * 10 + 5,
      totalContributions: 250,
      rank: 'guardian',
      battlesWon: 12
    })
  }

  // 5. Trưởng Lão (Elder)
  for (let i = 0; i < Math.min(caps.elder, 3); i++) {
    const eMajor = Math.max(0, leaderMajor - (worldSect.level === 1 ? 1 : 1))
    const eNpc = generateNpc(eMajor, customRng.chance(0.5) ? 'male' : 'female', 'silver', `_ws_${worldSect.id}_e_${i}`, customRng, memberNames)
    members.push({
      id: `${worldSect.id}_e_${i + 1}`,
      name: eNpc.name,
      gender: eNpc.gender,
      element: eNpc.element,
      major: eMajor,
      sub: 3 + i,
      expPct: 25,
      comprehension: eNpc.comprehension ?? 68,
      aptitudes: [...(eNpc.aptitudes ?? [])],
      temper: eNpc.temper,
      lean: eNpc.lean,
      tierRank: 'silver',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [...majorGfs],
      activeGongfa: majorGfs[0],
      towerFloor: eMajor * 10 + 3 + i,
      totalContributions: 200,
      rank: 'elder',
      battlesWon: 8
    })
  }

  // 6. Chân Truyền (True Disciples)
  const trueCount = Math.min(6, getTrueDisciplesCap(caps.elder))
  for (let i = 0; i < trueCount; i++) {
    const tMajor = Math.max(0, leaderMajor - (worldSect.level === 1 ? 1 : 2))
    const tNpc = generateNpc(tMajor, customRng.chance(0.5) ? 'male' : 'female', 'normal', `_ws_${worldSect.id}_t_${i}`, customRng, memberNames)
    members.push({
      id: `${worldSect.id}_t_${i + 1}`,
      name: tNpc.name,
      gender: tNpc.gender,
      element: tNpc.element,
      major: tMajor,
      sub: 2 + (i % 5),
      expPct: 20,
      comprehension: tNpc.comprehension ?? 65,
      aptitudes: [...(tNpc.aptitudes ?? [])],
      temper: tNpc.temper,
      lean: tNpc.lean,
      tierRank: 'normal',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [...majorGfs],
      activeGongfa: majorGfs[0],
      towerFloor: tMajor * 10 + 2,
      totalContributions: 120,
      rank: 'true',
      battlesWon: 5
    })
  }

  // 7. Nội Môn (Inner Disciples)
  const innerCount = Math.min(caps.inner, 5)
  for (let i = 0; i < innerCount; i++) {
    const iMajor = Math.max(0, leaderMajor - (worldSect.level <= 2 ? 1 : 2))
    const iNpc = generateNpc(iMajor, customRng.chance(0.5) ? 'male' : 'female', 'normal', `_ws_${worldSect.id}_in_${i}`, customRng, memberNames)
    members.push({
      id: `${worldSect.id}_in_${i + 1}`,
      name: iNpc.name,
      gender: iNpc.gender,
      element: iNpc.element,
      major: iMajor,
      sub: 1 + (i % 4),
      expPct: 15,
      comprehension: iNpc.comprehension ?? 60,
      aptitudes: [...(iNpc.aptitudes ?? [])],
      temper: iNpc.temper,
      lean: iNpc.lean,
      tierRank: 'normal',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [...majorGfs],
      activeGongfa: majorGfs[0],
      towerFloor: iMajor * 10 + 1,
      totalContributions: 60,
      rank: 'inner',
      battlesWon: 2
    })
  }

  // 8. Ngoại Môn (Outer Disciples)
  const outerCount = Math.min(caps.outer, 8)
  for (let i = 0; i < outerCount; i++) {
    const oMajor = Math.max(0, leaderMajor - (worldSect.level <= 2 ? 2 : 3))
    const oNpc = generateNpc(oMajor, customRng.chance(0.5) ? 'male' : 'female', 'normal', `_ws_${worldSect.id}_out_${i}`, customRng)
    members.push({
      id: `${worldSect.id}_out_${i + 1}`,
      name: oNpc.name,
      gender: oNpc.gender,
      element: oNpc.element,
      major: oMajor,
      sub: i % 4,
      expPct: 10,
      comprehension: oNpc.comprehension ?? 55,
      aptitudes: [...(oNpc.aptitudes ?? [])],
      temper: oNpc.temper,
      lean: oNpc.lean,
      tierRank: 'normal',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [majorGfs[0]!],
      activeGongfa: majorGfs[0],
      towerFloor: oMajor * 10,
      totalContributions: 20,
      rank: 'outer',
      battlesWon: 0
    })
  }

  return members
}

/**
 * Cân bằng chiến lực Tông môn Thế giới theo tiến trình người chơi:
 * - Cùng cấp với người chơi: Chiến lực xấp xỉ 95% đến 100% chiến lực Tông môn người chơi
 * - Cấp thấp hơn: Giữ nguyên mốc benchmark khi người chơi kết thúc cấp độ đó
 * - Tự động bổ sung nhân sự nếu chưa có
 */
export function calibrateWorldSectCombatPower(
  worldSects: WorldSectData[],
  playerSectLevel: number,
  playerCombatPower: number,
  benchmarks: Record<number, number>,
  customRng: RandomService = rng
): WorldSectData[] {
  return worldSects.map(ws => {
    // Nếu đã bị diệt hoặc là phụ thuộc, giữ nguyên
    if (ws.status !== 'active') return ws

    const members = ws.members && ws.members.length > 0
      ? ws.members
      : generateWorldSectMembers(ws, customRng)

    const initialConfig = INITIAL_WORLD_SECTS.find(init => init.id === ws.id)
    const defaultPower = initialConfig?.combatPower ?? ws.combatPower

    let targetPower = ws.combatPower > 0 ? ws.combatPower : defaultPower
    if (ws.level === playerSectLevel) {
      const ratio = 0.95 + customRng.float(0, 0.05)
      targetPower = Math.floor(playerCombatPower * ratio)
    } else if (ws.level < playerSectLevel) {
      const benchmark = benchmarks[ws.level]
      if (benchmark && benchmark > 0) {
        const ratio = 0.95 + customRng.float(0, 0.05)
        targetPower = Math.floor(benchmark * ratio)
      }
    } else {
      // ws.level > playerSectLevel: duy trì chiến lực mặc định hùng mạnh của các đại thế lực cấp cao
      targetPower = Math.max(targetPower, defaultPower)
    }

    return {
      ...ws,
      combatPower: targetPower,
      members,
      memberCount: members.length
    }
  })
}

/**
 * Kiểm tra xem có Tông môn Thế giới nào chủ động tuyên chiến tháng này không:
 * - Chỉ Tông môn NGANG CẤP (level === playerSectLevel) và active mới được khiêu chiến
 * - Tông môn cấp thấp hơn TUYỆT ĐỐI không được khiêu chiến
 * - Không tuyên chiến nếu Tông môn người chơi đang là chư hầu (có overlord) hoặc đang có hịch tuyên chiến chờ giải quyết
 */
export function checkMonthlyWorldSectInvasion(
  worldSects: WorldSectData[],
  playerSectLevel: number,
  currentMonth: number,
  lastInvasionMonth: number,
  hasOverlord: boolean,
  hasPendingWar: boolean,
  customRng: RandomService = rng
): PendingWarDeclaration | null {
  if (hasOverlord || hasPendingWar || currentMonth < lastInvasionMonth + 3) {
    return null
  }

  const eligibleSects = worldSects.filter(
    ws => ws.status === 'active' && ws.level === playerSectLevel
  )
  if (eligibleSects.length === 0) {
    return null
  }

  // Tỉ lệ 25% mỗi tháng
  if (!customRng.chance(0.25)) {
    return null
  }

  const enemy = customRng.pick(eligibleSects)
  return {
    sectId: enemy.id,
    sectName: enemy.name,
    sectLevel: enemy.level,
    combatPower: enemy.combatPower,
    declaredMonth: currentMonth
  }
}

