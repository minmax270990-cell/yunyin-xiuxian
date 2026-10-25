/**
 * Hệ Thống Quản Lý Tông Môn & Đệ Tử (Sect & Disciple Pinia Store)
 *
 * Chuyển đổi và nâng cấp toàn diện từ hệ thống Đạo đồng cũ thành Hệ thống Tông môn:
 * - Kiến tạo Tông môn (yêu cầu đạt Kim Đan Kỳ major >= 2)
 * - Tiếp nhận đơn xin nhập tông của NPC mỗi tháng (không trùng lặp, chỉ Luyện Khí/Trúc Cơ)
 * - Đệ tử tự động tu luyện, đột phá, lĩnh ngộ công pháp theo chu kỳ tháng
 * - Nhiệm Vụ Đường: Phái việc thực tế, theo dõi tiến độ, thu nhận tài nguyên
 * - Tàng Kinh Các: Quản lý công pháp tông môn, truyền thụ theo tương thích linh căn
 * - Tỉ Thí Tông Môn: 6 tháng một lần, đấu thực tế bằng CombatEngine, vinh danh Quán quân
 * - Tháp Lịch Luyện & Bí Cảnh Tông Môn: Lưu tiến độ vượt tháp và thám hiểm riêng
 * - Tông Môn Sử: Biên niên sử ghi chép đầy đủ các sự kiện nhân sự, tu luyện, tỉ thí
 *
 * Đạt chuẩn tuyệt đối về persistence & resilience (phải có sanitize() hoàn chỉnh).
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { persistConfig } from '@/utils/storage'
import { rng } from '@/utils/random'
import { useResourcesStore } from '@/stores/resources'
import { useInventoryStore } from '@/stores/inventory'
import { usePlayerStore } from '@/stores/player'
import { useUiStore } from '@/stores/ui'
import { stoneByTier } from '@/core/formulas'
import { herbGradeOfMajor, type HerbGrade } from '@/data/herbGrades'
import { maxTierForMajor } from '@/data/regions'
import type { ElementId, EquipmentInstance } from '@/types'
import type { DaoLean, Temperament } from '@/data/daolu'
import type { NpcTierRank } from '@/data/npc'
import {
  APPRENTICE_MAX_LEVEL,
  APPRENTICES,
  BOND_TITLES,
  RECRUIT_COST_TIER_AMOUNT,
  STARTER_APPRENTICE,
  apprenticeDef,
  apprenticeSlots,
  type ApprenticeSpec
} from '@/data/apprentices'
import {
  apprenticeSpoils,
  apprenticeTaskSeconds,
  dispatchAllToNeed,
  taskDone,
  type OwnedApprentice,
  type TaskSpoils
} from '@/core/apprenticeService'
import {
  SECT_MIN_MAJOR,
  SECT_LEVEL_DEFS,
  SECT_LEVEL_CAPS,
  SECT_RANK_NAMES,
  getTrueDisciplesCap,
  createInitialWorldSects,
  sectQuestTemplate,
  sectSecretRealmDef,
  gameMonthToCalendar,
  type ActiveSectQuest,
  type ApplicantData,
  type CompletedQuestRecord,
  type DiscipleData,
  type SectEventCategory,
  type SectHistoryEntry,
  type TournamentRankResult,
  type TournamentRecord,
  type SectMemberRank,
  type WorldSectData,
  type VassalSectData,
  type TributeRecord,
  type SectWarRecord,
  type PendingWarDeclaration,
  VASSAL_TRIBUTE_CONFIG,
  createEmptySectVault,
  type SectVault,
  type ElderSpecialty,
  SECT_QUEST_TEMPLATES
} from '@/data/sect'
import {
  challengeSectTower,
  convertLegacyApprenticeToDisciple,
  exploreSectSecretRealm,
  generateMonthlyApplicants,
  evaluateBiannualPromotions,
  abdicateMasterToAncestor,
  simulateSectWar,
  processMonthlyVassalTributes,
  nextSectUid,
  processSectQuestsProgress,
  runSectTournament,
  simulateDiscipleMonthlyCultivation,
  calculateSectCombatPower,
  calibrateWorldSectCombatPower,
  checkMonthlyWorldSectInvasion,
  generateWorldSectMembers,
  autoDispatchDisciplesToQuests,
  type AutoDispatchResult,
  simulateMonthlyTowerChallenge
} from '@/core/sectService'
import { checkGongfaEligibility } from '@/core/gongfaEligibility'
import { gongfaDef } from '@/data/gongfa'
import { displayGongfaName } from '@/ui/displayZhVi'
import { asArray, asFiniteNumber, asRecord, asStringArray } from '@/utils/saveShape'
import { gn, toNum } from '@/utils/gnum'
import { formatNum } from '@/utils/format'
import { REALMS } from '@/data/realms'
import { useNpcStore } from '@/stores/npc'
import {
  assignDiscipleToMentor,
  removeDiscipleFromMentor,
  assignElderSpecialty,
  simulateMonthlyMentorshipTeaching,
  simulateProdigyContention
} from '@/core/sectMentorshipService'
import { evaluateAndAutoEquipNpc, giftEquipmentToNpc } from '@/core/npcEquipmentService'
import { simulateNpcGongfaEnlightenment } from '@/core/npcGongfaService'
import { simulateDiscipleSelfAdventure, simulateDiscipleBagConsumption } from '@/core/npcBagService'
import { equipmentTemplate } from '@/data/equipment'
import { pillDef } from '@/data/pills'
import { displayEquipName, displayPillName } from '@/ui/displayZhVi'

let seq = 0
function nextUid(): string {
  seq += 1
  return `apt_${Date.now().toString(36)}_${seq.toString(36)}`
}

function isSpec(v: unknown): v is ApprenticeSpec {
  return v === 'herb' || v === 'ore' || v === 'adventure' || v === 'seek' || v === 'study'
}

function clampLevel(v: unknown): number {
  const n = Math.floor(Number(v) || 1)
  return Math.min(APPRENTICE_MAX_LEVEL, Math.max(1, n))
}

function clampBond(v: unknown): number {
  const n = Math.floor(Number(v) || 0)
  return Math.max(0, n)
}

const REBIRTH_KARMA_CAP = BOND_TITLES[BOND_TITLES.length - 1]!.min
function clampKarma(v: unknown): number {
  const n = Math.floor(Number(v) || 0)
  return Math.min(REBIRTH_KARMA_CAP, Math.max(0, n))
}

function applySpoils(spoils: TaskSpoils, major: number): void {
  const resources = useResourcesStore()
  const inventory = useInventoryStore()
  if (spoils.herb) resources.addHerb(herbGradeOfMajor(major), spoils.herb)
  if (spoils.ore) resources.addSmall('ore', spoils.ore)
  if (spoils.dust) resources.addSmall('dust', spoils.dust)
  if (spoils.wudao) resources.addSmall('wudao', spoils.wudao)
  if (spoils.stone) resources.addStone(spoils.stone)
  if (spoils.pillId && spoils.pillCount) inventory.addPill(spoils.pillId, spoils.pillCount)
}

export const useApprenticeStore = defineStore(
  'apprentice',
  () => {
    // =========================================================================
    // TRẠNG THÁI TÔNG MÔN MỞ RỘNG (SECT STATE)
    // =========================================================================
    /** Đã khai sơn lập phái kiến tạo Tông môn hay chưa */
    const sectCreated = ref(false)

    /** Tên của Tông môn */
    const sectName = ref('Vân Ẩn Tông')

    /** Tông chỉ của Tông môn */
    const doctrineId = ref('natural')

    /** Tháng game chính thức kiến tạo Tông môn */
    const foundedMonth = ref(0)

    /** Cấp độ Tông môn (1..5: Kim Đan, Nguyên Anh, Hợp Thể, Độ Kiếp, Chân Tiên) */
    const sectLevel = ref(1)

    /** Danh sách đệ tử chính thức dưới trướng Tông môn */
    const disciples = ref<DiscipleData[]>([])

    /** Đơn xin gia nhập tông môn đang chờ Tông chủ xét duyệt */
    const pendingApplicant = ref<ApplicantData | null>(null)

    /** Danh sách 5 ứng viên xin gia nhập tông môn mỗi tháng */
    const pendingApplicants = ref<ApplicantData[]>([])

    /** Danh sách ID các ứng viên đã từng xử lý (thu nhận hoặc từ chối), tránh lặp lại */
    const processedApplicantIds = ref<string[]>([])

    /** Tàng Kinh Các: Danh sách ID công pháp Tông môn đang lưu trữ */
    const libraryGongfaIds = ref<string[]>([])

    /** Nhiệm Vụ Đường: Danh sách nhiệm vụ đang được đệ tử thi hành */
    const activeQuests = ref<ActiveSectQuest[]>([])

    /** Lịch sử nhiệm vụ đã hoàn thành gần đây (tránh trùng thưởng) */
    const completedQuestHistory = ref<CompletedQuestRecord[]>([])

    /** Tháng game tổ chức Tỉ thí tông môn gần nhất (mỗi 6 tháng 1 lần) */
    const lastTournamentMonth = ref(0)

    /** Lịch sử các kỳ Tỉ Thí Tông Môn */
    const tournamentHistory = ref<TournamentRecord[]>([])

    /** Tông Môn Sử: Biên niên sử toàn bộ hoạt động Tông môn */
    const history = ref<SectHistoryEntry[]>([])

    /** Tháng game mô phỏng tông môn gần nhất */
    const lastProcessedMonth = ref(0)

    /** Danh sách Tông môn phụ thuộc (Vassal Sects) */
    const vassalSects = ref<VassalSectData[]>([])

    /** Danh sách Tông môn trong thế giới tu tiên */
    const worldSects = ref<WorldSectData[]>(createInitialWorldSects())

    /** Năm diễn ra chiến tranh tông môn gần nhất */
    const lastWarYear = ref(0)

    /** Tháng xét duyệt thăng cấp chức vụ gần nhất */
    const lastPromotionMonth = ref(0)

    /** Lịch sử cống nộp tài nguyên từ các tông môn phụ thuộc */
    const tributeHistory = ref<TributeRecord[]>([])

    /** Lịch sử chiến tranh tông môn */
    const warHistory = ref<SectWarRecord[]>([])

    /** ID của Tông Chủ ('player' nếu người chơi trực tiếp làm Tông Chủ, hoặc ID đệ tử nếu đã nhường ngôi) */
    const masterId = ref<string>('player')

    /** Người chơi đã thoái vị trở thành Lão Tổ tông môn hay chưa */
    const playerIsAncestor = ref(false)

    /** Mốc chiến lực lịch sử của từng cấp Tông môn người chơi đạt được */
    const sectLevelPowerBenchmarks = ref<Record<number, number>>({})

    /** Hịch tuyên chiến từ Tông môn khác đang chờ người chơi quyết định */
    const pendingWarDeclaration = ref<PendingWarDeclaration | null>(null)

    /** ID của Tông môn đang thống trị (nếu người chơi đầu hàng trở thành phụ thuộc) */
    const overlordSectId = ref<string | null>(null)

    /** Tháng gần nhất diễn ra xâm lược từ Tông môn khác */
    const lastInvasionMonth = ref(0)

    /** Kho Tông Môn: Lưu trữ linh thạch, nguyên liệu, đan dược, trang bị */
    const sectVault = ref<SectVault>(createEmptySectVault())

    /** Thiết lập tự động phái việc đệ tử tiềm năng mỗi tháng */
    const autoDispatchQuests = ref(false)

    /** Thiết lập đệ tử tự động khiêu chiến Tháp Lịch Luyện mỗi tháng */
    const autoTowerChallenge = ref(true)

    // =========================================================================
    // DỮ LIỆU TƯƠNG THÍCH ĐẠO ĐỒNG CŨ (LEGACY APPRENTICES)
    // =========================================================================
    const apprentices = ref<OwnedApprentice[]>([])
    const rebirthKarma = ref(0)

    /**
     * Khôi phục & Chuẩn hóa dữ liệu lưu trữ (Sanitize)
     */
    function sanitize(): void {
      rebirthKarma.value = clampKarma(rebirthKarma.value)
      sectCreated.value = Boolean(sectCreated.value)
      sectName.value = typeof sectName.value === 'string' && sectName.value ? sectName.value : 'Vân Ẩn Tông'
      doctrineId.value = typeof doctrineId.value === 'string' && doctrineId.value ? doctrineId.value : 'natural'
      foundedMonth.value = asFiniteNumber(foundedMonth.value, 0)
      lastTournamentMonth.value = asFiniteNumber(lastTournamentMonth.value, 0)
      lastProcessedMonth.value = asFiniteNumber(lastProcessedMonth.value, 0)

      sectLevel.value = Math.min(5, Math.max(1, asFiniteNumber(sectLevel.value, 1)))
      lastWarYear.value = asFiniteNumber(lastWarYear.value, 0)
      lastPromotionMonth.value = asFiniteNumber(lastPromotionMonth.value, 0)
      masterId.value = typeof masterId.value === 'string' && masterId.value ? masterId.value : 'player'
      playerIsAncestor.value = Boolean(playerIsAncestor.value)
      overlordSectId.value = typeof overlordSectId.value === 'string' && overlordSectId.value ? overlordSectId.value : null
      lastInvasionMonth.value = asFiniteNumber(lastInvasionMonth.value, 0)
      autoDispatchQuests.value = autoDispatchQuests.value === true
      autoTowerChallenge.value = autoTowerChallenge.value !== false

      const rawB = asRecord(sectLevelPowerBenchmarks.value)
      const cleanB: Record<number, number> = {}
      for (const [k, v] of Object.entries(rawB)) {
        const numK = Number(k)
        if (Number.isFinite(numK) && numK >= 1 && numK <= 5) {
          cleanB[numK] = asFiniteNumber(v, 0)
        }
      }
      sectLevelPowerBenchmarks.value = cleanB

      if (pendingWarDeclaration.value && typeof pendingWarDeclaration.value === 'object') {
        const pw = pendingWarDeclaration.value as Record<string, unknown>
        if (typeof pw.sectId === 'string' && typeof pw.sectName === 'string') {
          pendingWarDeclaration.value = {
            sectId: pw.sectId,
            sectName: pw.sectName,
            sectLevel: asFiniteNumber(pw.sectLevel, 1),
            combatPower: asFiniteNumber(pw.combatPower, 1000),
            declaredMonth: asFiniteNumber(pw.declaredMonth, 1)
          }
        } else {
          pendingWarDeclaration.value = null
        }
      } else {
        pendingWarDeclaration.value = null
      }

      processedApplicantIds.value = asStringArray(processedApplicantIds.value)
      libraryGongfaIds.value = asStringArray(libraryGongfaIds.value)

      // Chuẩn hóa Kho Tông Môn
      const rawVault = (sectVault.value && typeof sectVault.value === 'object' ? sectVault.value : {}) as Record<string, unknown>
      const rawHerbs = asRecord(rawVault.herbs)
      const cleanHerbs: Record<number, number> = {}
      for (let g = 1; g <= 5; g++) {
        cleanHerbs[g] = Math.max(0, asFiniteNumber(rawHerbs[g], 0))
      }
      const rawPills = asRecord(rawVault.pills)
      const cleanPills: Record<string, number> = {}
      for (const [k, v] of Object.entries(rawPills)) {
        const count = asFiniteNumber(v, 0)
        if (count > 0) cleanPills[k] = count
      }
      const rawEquips = asArray<unknown>(rawVault.equipments)
      const cleanEquips: EquipmentInstance[] = []
      for (const eq of rawEquips) {
        if (eq && typeof eq === 'object' && 'uid' in eq && typeof (eq as Record<string, unknown>).uid === 'string') {
          cleanEquips.push(eq as EquipmentInstance)
        }
      }
      sectVault.value = {
        stone: Math.max(0, asFiniteNumber(rawVault.stone, 0)),
        herbs: cleanHerbs,
        ores: Math.max(0, asFiniteNumber(rawVault.ores, 0)),
        dust: Math.max(0, asFiniteNumber(rawVault.dust, 0)),
        wudao: Math.max(0, asFiniteNumber(rawVault.wudao, 0)),
        pills: cleanPills,
        equipments: cleanEquips
      }

      // Chuẩn hóa đệ tử
      const rawDisciples = asArray<unknown>(disciples.value)
      const cleanDisciples: DiscipleData[] = []
      for (const d of rawDisciples) {
        if (!d || typeof d !== 'object' || !('id' in d) || !('name' in d)) continue
        const item = d as Record<string, unknown>
        cleanDisciples.push({
          id: String(item.id || nextSectUid('disc')),
          name: String(item.name || 'Vô Danh Đệ Tử'),
          gender: item.gender === 'female' ? 'female' : 'male',
          element: (item.element as ElementId) || 'metal',
          major: asFiniteNumber(item.major, 0),
          sub: Math.min(8, Math.max(0, asFiniteNumber(item.sub, 0))),
          expPct: Math.min(100, Math.max(0, asFiniteNumber(item.expPct, 0))),
          comprehension: Math.min(100, Math.max(30, asFiniteNumber(item.comprehension, 60))),
          aptitudes: asStringArray(item.aptitudes),
          temper: (item.temper as Temperament) || 'cautious',
          lean: (item.lean as DaoLean) || 'longevity',
          tierRank: (item.tierRank as NpcTierRank) || 'normal',
          joinedMonth: asFiniteNumber(item.joinedMonth, 1),
          status: (item.status as DiscipleData['status']) || 'idle',
          assignedQuestId: typeof item.assignedQuestId === 'string' ? item.assignedQuestId : undefined,
          learnedGongfa: asStringArray(item.learnedGongfa),
          activeGongfa: typeof item.activeGongfa === 'string' ? item.activeGongfa : undefined,
          towerFloor: asFiniteNumber(item.towerFloor, 0),
          totalContributions: asFiniteNumber(item.totalContributions, 0),
          contributionPoints: asFiniteNumber(item.contributionPoints, asFiniteNumber(item.totalContributions, 0)),
          equippedItems: asArray<unknown>(item.equippedItems).filter(
            (e): e is EquipmentInstance => !!e && typeof e === 'object' && 'uid' in e && typeof (e as Record<string, unknown>).uid === 'string'
          ),
          inventoryItems: asArray<unknown>(item.inventoryItems).filter(
            (e): e is EquipmentInstance => !!e && typeof e === 'object' && 'uid' in e && typeof (e as Record<string, unknown>).uid === 'string'
          ),
          bagPills: asRecord(item.bagPills) as Record<string, number>,
          bagStones: asFiniteNumber(item.bagStones, 0),
          bagMaterials: item.bagMaterials && typeof item.bagMaterials === 'object' && !Array.isArray(item.bagMaterials) ? {
            ore: asFiniteNumber((item.bagMaterials as Record<string, unknown>).ore, 0),
            herb: asFiniteNumber((item.bagMaterials as Record<string, unknown>).herb, 0)
          } : undefined,
          elderSpecialty: typeof item.elderSpecialty === 'string' && ['dan', 'craft', 'affairs', 'arts', 'discipline', 'external'].includes(item.elderSpecialty)
            ? (item.elderSpecialty as ElderSpecialty)
            : undefined,
          mentoredDiscipleIds: asStringArray(item.mentoredDiscipleIds),
          comprehendedGongfa: asStringArray(item.comprehendedGongfa),
          gongfaOrigins: asRecord(item.gongfaOrigins) as Record<string, 'comprehended' | 'learned' | 'inherited'>,
          rank: (item.rank as SectMemberRank) || 'outer',
          battlesWon: asFiniteNumber(item.battlesWon, 0),
          promotedMonth: typeof item.promotedMonth === 'number' ? asFiniteNumber(item.promotedMonth, 0) : undefined,
          mentorElderId: typeof item.mentorElderId === 'string' ? item.mentorElderId : undefined,
          deathCause: typeof item.deathCause === 'string' ? item.deathCause : undefined,
          deathMonth: typeof item.deathMonth === 'number' ? asFiniteNumber(item.deathMonth, 0) : undefined
        })
      }
      disciples.value = cleanDisciples

      // Chuẩn hóa ứng viên (loại bỏ hoàn toàn trùng lặp id và name)
      const rawApps = asArray<unknown>(pendingApplicants.value)
      if (pendingApplicant.value && typeof pendingApplicant.value === 'object') {
        const pId = String((pendingApplicant.value as Record<string, unknown>).id || '')
        const alreadyInRaw = rawApps.some(a => a && typeof a === 'object' && String((a as Record<string, unknown>).id) === pId)
        if (!alreadyInRaw) {
          rawApps.unshift(pendingApplicant.value)
        }
      }
      const seenAppIds = new Set<string>()
      const seenAppNames = new Set<string>()
      const cleanApps: ApplicantData[] = []
      for (const a of rawApps) {
        if (!a || typeof a !== 'object' || !('id' in a) || !('name' in a)) continue
        const item = a as Record<string, unknown>
        const id = String(item.id)
        const name = String(item.name)
        if (seenAppIds.has(id) || seenAppNames.has(name)) {
          continue
        }
        seenAppIds.add(id)
        seenAppNames.add(name)
        cleanApps.push({
          id,
          name,
          gender: item.gender === 'female' ? 'female' : 'male',
          element: (item.element as ElementId) || 'metal',
          major: Math.min(1, Math.max(0, asFiniteNumber(item.major, 0))),
          sub: Math.min(8, Math.max(0, asFiniteNumber(item.sub, 0))),
          comprehension: asFiniteNumber(item.comprehension, 60),
          aptitudes: asStringArray(item.aptitudes),
          temper: (item.temper as Temperament) || 'cautious',
          lean: (item.lean as DaoLean) || 'longevity',
          tierRank: (item.tierRank as NpcTierRank) || 'normal',
          appliedMonth: asFiniteNumber(item.appliedMonth, 1),
          brief: String(item.brief || ''),
          pursuit: String(item.pursuit || '')
        })
      }
      pendingApplicants.value = cleanApps
      pendingApplicant.value = cleanApps[0] ?? null

      // Chuẩn hóa Tông Môn Phụ Thuộc
      const rawVassals = asArray<unknown>(vassalSects.value)
      vassalSects.value = rawVassals
        .filter((v): v is Record<string, unknown> => !!v && typeof v === 'object' && 'id' in v && typeof (v as Record<string, unknown>).id === 'string')
        .map(v => ({
          id: String(v.id),
          name: String(v.name || 'Phụ Thuộc Tông'),
          level: Math.min(5, Math.max(1, asFiniteNumber(v.level, 1))),
          vassalSinceMonth: asFiniteNumber(v.vassalSinceMonth, 1),
          leaderName: String(v.leaderName || 'Tông Chủ'),
          status: v.status === 'destroyed' ? 'destroyed' : 'active',
          lastTributeMonth: asFiniteNumber(v.lastTributeMonth, 0),
          totalTributesPaid: asFiniteNumber(v.totalTributesPaid, 0),
          totalDeficitCount: asFiniteNumber(v.totalDeficitCount, 0)
        }))

      // Chuẩn hóa Tông Môn Thế Giới (Bảo đảm luôn đồng bộ đầy đủ các tông môn đang có trên thế giới)
      const initialSects = createInitialWorldSects()
      const rawWorldSects = asArray<unknown>(worldSects.value)
      const existingMap = new Map<string, WorldSectData>()

      if (rawWorldSects.length > 0) {
        for (const item of rawWorldSects) {
          if (item && typeof item === 'object' && 'id' in item && typeof (item as Record<string, unknown>).id === 'string') {
            const ws = item as Record<string, unknown>
            const res = (ws.resources && typeof ws.resources === 'object' ? ws.resources : {}) as Record<string, unknown>
            const majorGongfas = asStringArray(ws.majorGongfas)
            const rawMembers = asArray<DiscipleData>(ws.members)
            const sectItem: WorldSectData = {
              id: String(ws.id),
              name: String(ws.name || 'Thế Giới Tông'),
              level: Math.min(5, Math.max(1, asFiniteNumber(ws.level, 1))),
              leaderName: String(ws.leaderName || 'Tông Chủ'),
              leaderMajor: asFiniteNumber(ws.leaderMajor, 2),
              memberCount: asFiniteNumber(ws.memberCount, 10),
              combatPower: asFiniteNumber(ws.combatPower, 5000),
              doctrine: String(ws.doctrine || 'Chính Đạo'),
              element: (ws.element as ElementId) || 'metal',
              desc: String(ws.desc || ''),
              status: (ws.status as WorldSectData['status']) || 'active',
              resources: {
                stone: asFiniteNumber(res.stone, 10000),
                ore: asFiniteNumber(res.ore, 20),
                herb: asFiniteNumber(res.herb, 30),
                pills: asFiniteNumber(res.pills, 5)
              },
              majorGongfas: majorGongfas.length > 0 ? majorGongfas : ['m_taixuan']
            }
            if (rawMembers.length === 0) {
              sectItem.members = generateWorldSectMembers(sectItem)
              sectItem.memberCount = sectItem.members.length
            } else {
              sectItem.members = rawMembers
              sectItem.memberCount = rawMembers.length
            }
            existingMap.set(sectItem.id, sectItem)
          }
        }
      }

      // Luôn đồng bộ đủ toàn bộ 25 tông môn thế giới, bảo tồn tiến trình chiến tranh của các tông môn đã tương tác
      worldSects.value = initialSects.map(initSect => {
        const existing = existingMap.get(initSect.id)
        if (existing) {
          const members = existing.members && existing.members.length > 0
            ? existing.members
            : generateWorldSectMembers(existing)
          return {
            ...initSect,
            ...existing,
            combatPower: existing.combatPower > 0 ? existing.combatPower : initSect.combatPower,
            members,
            memberCount: members.length
          }
        }
        const members = generateWorldSectMembers(initSect)
        return {
          ...initSect,
          combatPower: initSect.combatPower,
          members,
          memberCount: members.length
        }
      })

      // Chuẩn hóa lịch sử cống nộp
      const rawTrib = asArray<unknown>(tributeHistory.value)
      tributeHistory.value = rawTrib
        .filter((t): t is Record<string, unknown> => !!t && typeof t === 'object')
        .map(t => ({
          id: String(t.id || nextSectUid('trib')),
          gameMonth: asFiniteNumber(t.gameMonth, 1),
          year: asFiniteNumber(t.year, 1),
          month: asFiniteNumber(t.month, 1),
          vassalId: String(t.vassalId || ''),
          vassalName: String(t.vassalName || ''),
          stone: asFiniteNumber(t.stone, 0),
          ore: asFiniteNumber(t.ore, 0),
          herb: asFiniteNumber(t.herb, 0),
          pills: asFiniteNumber(t.pills, 0),
          success: Boolean(t.success),
          isDeficit: Boolean(t.isDeficit),
          note: String(t.note || '')
        }))

      // Chuẩn hóa lịch sử chiến tranh
      const rawWar = asArray<unknown>(warHistory.value)
      warHistory.value = rawWar
        .filter((w): w is Record<string, unknown> => !!w && typeof w === 'object')
        .map(w => ({
          id: String(w.id || nextSectUid('war')),
          gameMonth: asFiniteNumber(w.gameMonth, 1),
          year: asFiniteNumber(w.year, 1),
          month: asFiniteNumber(w.month, 1),
          opponentId: String(w.opponentId || ''),
          opponentName: String(w.opponentName || ''),
          isPlayerAttacker: Boolean(w.isPlayerAttacker),
          ancestorParticipated: Boolean(w.ancestorParticipated),
          playerCombatPower: asFiniteNumber(w.playerCombatPower, 0),
          opponentCombatPower: asFiniteNumber(w.opponentCombatPower, 0),
          won: Boolean(w.won),
          outcome: (w.outcome as SectWarRecord['outcome']),
          spoilsSummary: String(w.spoilsSummary || '')
        }))

      // Chuẩn hóa nhiệm vụ đang thực hiện
      const rawQuests = asArray<unknown>(activeQuests.value)
      const cleanQuests: ActiveSectQuest[] = []
      for (const q of rawQuests) {
        if (!q || typeof q !== 'object') continue
        const item = q as Record<string, unknown>
        if (typeof item.uid === 'string' && typeof item.templateId === 'string' && typeof item.assignedDiscipleId === 'string') {
          cleanQuests.push({
            uid: item.uid,
            templateId: item.templateId,
            assignedDiscipleId: item.assignedDiscipleId,
            startMonth: asFiniteNumber(item.startMonth, 1),
            finishMonth: asFiniteNumber(item.finishMonth, 2),
            status: (item.status as ActiveSectQuest['status']) || 'in_progress'
          })
        }
      }
      activeQuests.value = cleanQuests

      // Chuẩn hóa lịch sử nhiệm vụ
      const rawCompleted = asArray<unknown>(completedQuestHistory.value)
      completedQuestHistory.value = rawCompleted
        .filter((c): c is Record<string, unknown> => !!c && typeof c === 'object')
        .map(c => ({
          uid: String(c.uid || ''),
          templateId: String(c.templateId || ''),
          discipleId: String(c.discipleId || ''),
          finishMonth: asFiniteNumber(c.finishMonth, 0),
          success: Boolean(c.success),
          spoilsSummary: String(c.spoilsSummary || '')
        }))

      // Chuẩn hóa lịch sử tỉ thí
      const rawTourn = asArray<unknown>(tournamentHistory.value)
      tournamentHistory.value = rawTourn
        .filter((t): t is Record<string, unknown> => !!t && typeof t === 'object')
        .map(t => ({
          id: String(t.id || ''),
          tournamentIndex: asFiniteNumber(t.tournamentIndex, 1),
          gameMonth: asFiniteNumber(t.gameMonth, 1),
          year: asFiniteNumber(t.year, 1),
          month: asFiniteNumber(t.month, 1),
          participantsCount: asFiniteNumber(t.participantsCount, 0),
          winnerName: String(t.winnerName || ''),
          rankings: asArray<TournamentRankResult>(t.rankings)
        }))

      // Chuẩn hóa Tông Môn Sử
      const rawHistory = asArray<unknown>(history.value)
      history.value = rawHistory
        .filter((h): h is Record<string, unknown> => !!h && typeof h === 'object')
        .map(h => ({
          id: String(h.id || nextSectUid('hist')),
          gameMonth: asFiniteNumber(h.gameMonth, 1),
          year: asFiniteNumber(h.year, 1),
          month: asFiniteNumber(h.month, 1),
          category: (h.category as SectEventCategory) || 'personnel',
          discipleId: typeof h.discipleId === 'string' ? h.discipleId : undefined,
          discipleName: typeof h.discipleName === 'string' ? h.discipleName : undefined,
          summary: String(h.summary || '')
        }))

      // Chuẩn hóa đạo đồng cũ
      const cleanAppr: OwnedApprentice[] = []
      for (const raw of asArray<unknown>(apprentices.value)) {
        if (!raw || typeof raw !== 'object' || !('archId' in raw)) continue
        const archId = raw.archId
        if (typeof archId !== 'string' || !apprenticeDef(archId)) continue
        const uid = 'uid' in raw && typeof raw.uid === 'string' && raw.uid ? raw.uid : nextUid()
        const level = clampLevel('level' in raw ? raw.level : 1)
        const bond = clampBond('bond' in raw ? raw.bond : 0)
        let task: OwnedApprentice['task'] = null
        if ('task' in raw && raw.task && typeof raw.task === 'object') {
          const t = raw.task as { spec?: unknown; startAt?: unknown; finishAt?: unknown }
          if (isSpec(t.spec) && Number.isFinite(t.startAt) && Number.isFinite(t.finishAt)) {
            const startAt = Math.max(0, Math.floor(t.startAt as number))
            const finishAt = Math.max(0, Math.floor(t.finishAt as number))
            if (finishAt >= startAt) task = { spec: t.spec, startAt, finishAt }
          }
        }
        cleanAppr.push({ uid, archId, level, bond, task })
      }
      apprentices.value = cleanAppr

      // Tương thích chuyển đổi đạo đồng cũ sang đệ tử tông môn nếu Tông môn đã lập
      if (sectCreated.value && disciples.value.length === 0 && apprentices.value.length > 0) {
        for (const oldAppr of apprentices.value) {
          disciples.value.push(convertLegacyApprenticeToDisciple(oldAppr, foundedMonth.value || 1))
        }
      }
    }

    /**
     * Kiến tạo Tông môn (yêu cầu đạt Kim Đan Kỳ: major >= 2)
     */
    function createSect(name: string, doctrine: string, currentMonth: number): boolean {
      const player = usePlayerStore()
      if (player.major < SECT_MIN_MAJOR) {
        useUiStore().toast('Cảnh giới chưa đủ! Phải đạt Kim Đan Kỳ mới có thể khai sơn lập phái.', 'warn')
        return false
      }
      if (sectCreated.value) return false

      const trimmedName = name.trim().slice(0, 16) || 'Vân Ẩn Tông'
      sectName.value = trimmedName
      doctrineId.value = doctrine || 'natural'
      foundedMonth.value = currentMonth
      sectCreated.value = true
      lastProcessedMonth.value = 0
      sectLevel.value = 1
      masterId.value = 'player'
      playerIsAncestor.value = false
      lastWarYear.value = 0
      lastPromotionMonth.value = 0
      vassalSects.value = []
      worldSects.value = createInitialWorldSects()
      tributeHistory.value = []
      warHistory.value = []
      sectVault.value = createEmptySectVault()
      autoDispatchQuests.value = false
      autoTowerChallenge.value = true

      // Chuyển đổi các đạo đồng cũ đang có sang hàng ngũ đệ tử chính thức (Ngoại môn)
      if (apprentices.value.length > 0) {
        for (const oldAppr of apprentices.value) {
          disciples.value.push(convertLegacyApprenticeToDisciple(oldAppr, currentMonth))
        }
      }

      pendingApplicants.value = []
      pendingApplicant.value = null

      const { year, month } = gameMonthToCalendar(currentMonth)
      addHistoryEntry({
        gameMonth: currentMonth,
        year,
        month,
        category: 'management',
        summary: `Tháng ${month}, năm thứ ${year} — Tông chủ ${player.name} chính thức khai sơn lập phái, sáng lập môn phái【${trimmedName}】(Cấp 1)!`
      })

      useUiStore().toast(`Chúc mừng Đạo hữu đã khai tông lập phái, sáng lập 【${trimmedName}】!`, 'rare')
      return true
    }

    /**
     * Thăng cấp Tông môn (Cấp 1 -> 5: Kim Đan, Nguyên Anh, Hợp Thể, Độ Kiếp, Chân Tiên)
     */
    function upgradeSectLevel(): boolean {
      if (sectLevel.value >= 5) {
        useUiStore().toast('Tông môn đã đạt cấp độ tối đa (Cấp 5 - Vạn Cổ Tiên Môn)!', 'info')
        return false
      }

      const nextLevel = sectLevel.value + 1
      const req = SECT_LEVEL_DEFS[nextLevel]
      if (!req) return false

      const playerMajor = usePlayerStore().major
      if (playerMajor < req.minMajor) {
        useUiStore().toast(
          `Cảnh giới Tông chủ chưa đủ điều kiện! Thăng cấp lên Cấp ${nextLevel} yêu cầu cảnh giới tối thiểu ${REALMS[req.minMajor]?.name ?? ''}.`,
          'warn'
        )
        return false
      }

      const resources = useResourcesStore()
      if (req.costStone > 0 && !resources.hasStone(gn(req.costStone))) {
        useUiStore().toast(
          `Linh thạch tông môn không đủ! Cần ${req.costStone.toLocaleString()} Linh thạch để thăng cấp.`,
          'warn'
        )
        return false
      }

      if (req.costStone > 0) {
        resources.spendStone(gn(req.costStone))
      }

      // Lưu lại mốc chiến lực kết thúc của cấp Tông môn hiện tại trước khi thăng cấp
      const curPower = calculateSectCombatPower(
        disciples.value,
        playerIsAncestor.value,
        { major: playerMajor, sub: usePlayerStore().sub }
      )
      sectLevelPowerBenchmarks.value[sectLevel.value] = Math.max(
        sectLevelPowerBenchmarks.value[sectLevel.value] || 0,
        curPower
      )

      sectLevel.value = nextLevel

      // Hiệu chỉnh chiến lực Tông môn thế giới theo cấp độ mới
      worldSects.value = calibrateWorldSectCombatPower(
        worldSects.value,
        sectLevel.value,
        curPower,
        sectLevelPowerBenchmarks.value
      )

      const m = useNpcStore().gameMonth
      const { year, month } = gameMonthToCalendar(m)
      addHistoryEntry({
        gameMonth: m,
        year,
        month,
        category: 'management',
        summary: `Tháng ${month}, năm thứ ${year} — Tông môn chính thức thăng cấp lên【${req.name}】! Uy danh chấn động bát hoang.`
      })

      useUiStore().toast(`Chúc mừng! Tông môn đã thăng cấp thành công lên 【${req.name}】!`, 'rare')
      return true
    }

    /**
     * Thêm một bản ghi vào Tông Môn Sử
     */
    function addHistoryEntry(entry: Omit<SectHistoryEntry, 'id'>): void {
      const newEntry: SectHistoryEntry = {
        id: nextSectUid('hist'),
        ...entry
      }
      history.value.unshift(newEntry)
      if (history.value.length > 200) {
        history.value = history.value.slice(0, 200)
      }
    }

    /**
     * Thu nhận ứng viên nộp đơn nhập tông làm đệ tử Ngoại môn
     */
    function acceptApplicant(arg1?: string | number, arg2?: number): boolean {
      const caps = SECT_LEVEL_CAPS[sectLevel.value] ?? SECT_LEVEL_CAPS[1]!
      const currentOuterCount = disciples.value.filter(d => d.rank === 'outer').length
      if (currentOuterCount >= caps.outer) {
        useUiStore().toast(
          `Hàng ngũ Ngoại Môn đã đạt giới hạn tối đa (${caps.outer}/${caps.outer}) của Cấp ${sectLevel.value}!`,
          'warn'
        )
        return false
      }

      let app: ApplicantData | undefined
      let m = useNpcStore().gameMonth
      if (typeof arg1 === 'string') {
        const idx = pendingApplicants.value.findIndex(a => a.id === arg1)
        if (idx >= 0) {
          app = pendingApplicants.value.splice(idx, 1)[0]
        }
        if (typeof arg2 === 'number') m = arg2
      } else {
        if (typeof arg1 === 'number') m = arg1
        app = pendingApplicants.value.shift() ?? pendingApplicant.value ?? undefined
      }

      if (!app) return false
      pendingApplicant.value = pendingApplicants.value[0] ?? null
      processedApplicantIds.value.push(app.id)

      const newDisciple: DiscipleData = {
        id: app.id,
        name: app.name,
        gender: app.gender,
        element: app.element,
        major: app.major,
        sub: app.sub,
        expPct: 0,
        comprehension: app.comprehension,
        aptitudes: [...app.aptitudes],
        temper: app.temper,
        lean: app.lean,
        tierRank: app.tierRank,
        joinedMonth: m,
        status: 'idle',
        learnedGongfa: [],
        towerFloor: 0,
        totalContributions: 0,
        rank: 'outer'
      }

      disciples.value.push(newDisciple)

      const { year, month } = gameMonthToCalendar(m)
      addHistoryEntry({
        gameMonth: m,
        year,
        month,
        category: 'personnel',
        discipleId: newDisciple.id,
        discipleName: newDisciple.name,
        summary: `Tháng ${month}, năm thứ ${year} — Tông môn thu nhận đệ tử mới ${newDisciple.name} làm【Ngoại Môn Đệ Tử】.`
      })

      useUiStore().toast(`Đã thu nhận đệ tử 【${newDisciple.name}】 nhập môn!`, 'success')
      return true
    }

    /**
     * Từ chối ứng viên nộp đơn xin nhập tông
     */
    function rejectApplicant(arg1?: string | number, arg2?: number): boolean {
      let app: ApplicantData | undefined
      let m = useNpcStore().gameMonth
      if (typeof arg1 === 'string') {
        const idx = pendingApplicants.value.findIndex(a => a.id === arg1)
        if (idx >= 0) {
          app = pendingApplicants.value.splice(idx, 1)[0]
        }
        if (typeof arg2 === 'number') m = arg2
      } else {
        if (typeof arg1 === 'number') m = arg1
        app = pendingApplicants.value.shift() ?? pendingApplicant.value ?? undefined
      }

      if (!app) return false
      pendingApplicant.value = pendingApplicants.value[0] ?? null
      processedApplicantIds.value.push(app.id)

      const { year, month } = gameMonthToCalendar(m)
      addHistoryEntry({
        gameMonth: m,
        year,
        month,
        category: 'personnel',
        summary: `Tháng ${month}, năm thứ ${year} — Tông môn cự tuyệt đơn xin nhập tông của tu sĩ ${app.name}.`
      })

      useUiStore().toast(`Đã từ chối đơn xin nhập tông của ${app.name}.`, 'info')
      return true
    }

    /**
     * Thu nhận toàn bộ ứng viên đang chờ trong phạm vi số slot Ngoại môn còn trống
     */
    function acceptAllApplicants(currentMonth?: number): number {
      let accepted = 0
      const m = currentMonth ?? useNpcStore().gameMonth
      while (pendingApplicants.value.length > 0) {
        const id = pendingApplicants.value[0]!.id
        const ok = acceptApplicant(id, m)
        if (!ok) break
        accepted++
      }
      return accepted
    }

    /**
     * Từ chối toàn bộ ứng viên đang chờ
     */
    function rejectAllApplicants(currentMonth?: number): number {
      let rejected = 0
      const m = currentMonth ?? useNpcStore().gameMonth
      while (pendingApplicants.value.length > 0) {
        const id = pendingApplicants.value[0]!.id
        rejectApplicant(id, m)
        rejected++
      }
      return rejected
    }

    /**
     * Bổ nhiệm / Thăng cấp chức vụ thủ công cho thành viên
     */
    function promoteMember(discipleId: string, targetRank: SectMemberRank, currentMonth?: number): boolean {
      const m = currentMonth ?? useNpcStore().gameMonth
      const d = disciples.value.find(disc => disc.id === discipleId)
      if (!d || d.rank === targetRank) return false

      const caps = SECT_LEVEL_CAPS[sectLevel.value] ?? SECT_LEVEL_CAPS[1]!
      const currentCount = disciples.value.filter(disc => disc.rank === targetRank).length

      if (targetRank === 'true') {
        const elderCount = disciples.value.filter(disc => disc.rank === 'elder').length
        const trueCap = getTrueDisciplesCap(elderCount)
        if (currentCount >= trueCap) {
          useUiStore().toast(`Số lượng Chân truyền đã đạt giới hạn (${trueCap}/${trueCap}) của số Trưởng lão hiện tại! Cần thăng cấp thêm Trưởng lão.`, 'warn')
          return false
        }
      } else if (targetRank in caps) {
        const maxCap = (caps as unknown as Record<string, number>)[targetRank] ?? 999
        if (currentCount >= maxCap) {
          useUiStore().toast(`Chức vụ ${SECT_RANK_NAMES[targetRank]} đã đạt giới hạn tối đa (${maxCap}/${maxCap})!`, 'warn')
          return false
        }
      }

      const oldRank = d.rank
      d.rank = targetRank
      d.promotedMonth = m

      const { year, month } = gameMonthToCalendar(m)
      addHistoryEntry({
        gameMonth: m,
        year,
        month,
        category: 'promotion',
        discipleId: d.id,
        discipleName: d.name,
        summary: `Tháng ${month}, năm thứ ${year} — Bổ nhiệm ${SECT_RANK_NAMES[oldRank]} ${d.name} thăng chức thành【${SECT_RANK_NAMES[targetRank]}】.`
      })

      useUiStore().toast(`Đã bổ nhiệm ${d.name} làm 【${SECT_RANK_NAMES[targetRank]}】!`, 'success')
      return true
    }

    /**
     * Điều chỉnh / Giáng chức vụ thành viên
     */
    function demoteMember(discipleId: string, targetRank: SectMemberRank, currentMonth?: number): boolean {
      const m = currentMonth ?? useNpcStore().gameMonth
      const d = disciples.value.find(disc => disc.id === discipleId)
      if (!d) return false
      const oldRank = d.rank
      d.rank = targetRank

      const { year, month } = gameMonthToCalendar(m)
      addHistoryEntry({
        gameMonth: m,
        year,
        month,
        category: 'promotion',
        discipleId: d.id,
        discipleName: d.name,
        summary: `Tháng ${month}, năm thứ ${year} — Điều chỉnh chức vụ của ${SECT_RANK_NAMES[oldRank]} ${d.name} thành【${SECT_RANK_NAMES[targetRank]}】.`
      })

      useUiStore().toast(`Đã điều chỉnh chức vụ của ${d.name} thành 【${SECT_RANK_NAMES[targetRank]}】!`, 'info')
      return true
    }

    /**
     * Tông chủ nhường ngôi và trở thành Lão tổ
     */
    function abdicateToAncestor(successorId?: string, currentMonth?: number): boolean {
      const m = currentMonth ?? useNpcStore().gameMonth
      const res = abdicateMasterToAncestor(disciples.value, sectLevel.value, m, successorId)
      if (!res.success) {
        useUiStore().toast(res.message, 'warn')
        return false
      }

      disciples.value = res.updatedDisciples
      masterId.value = res.newMasterId ?? 'player'
      playerIsAncestor.value = true

      if (res.historyEntry) {
        addHistoryEntry(res.historyEntry)
      }

      useUiStore().toast(res.message, 'rare')
      return true
    }

    /**
     * Khởi binh khiêu chiến một Tông Môn khác
     */
    function declareWar(
      targetSectId: string,
      summonAncestor = false,
      currentMonth?: number,
      playerSnapshot?: { major: number; sub: number }
    ): { won: boolean; spoilsSummary: string } {
      const m = currentMonth ?? useNpcStore().gameMonth
      const target = worldSects.value.find(ws => ws.id === targetSectId)
      if (!target) {
        useUiStore().toast('Không tìm thấy tông môn đối thủ!', 'warn')
        return { won: false, spoilsSummary: '' }
      }

      if (target.status !== 'active') {
        useUiStore().toast('Tông môn này đã bị diệt vong hoặc đã là tông môn phụ thuộc!', 'info')
        return { won: false, spoilsSummary: '' }
      }

      const playerStore = usePlayerStore()
      const pSnap = playerSnapshot ?? { major: playerStore.major, sub: playerStore.sub }
      const warRes = simulateSectWar(
        sectName.value,
        target,
        disciples.value,
        summonAncestor,
        m,
        true,
        pSnap
      )

      warHistory.value.unshift(warRes.warRecord)
      addHistoryEntry(warRes.historyEntry)

      if (warRes.won) {
        const resources = useResourcesStore()
        resources.addStone(gn(warRes.spoils.stone))
        resources.addSmall('ore', warRes.spoils.ore)
        resources.addSmall('herb', warRes.spoils.herb)
        const inv = useInventoryStore()
        inv.pills['p_jvqisan'] = (inv.pills['p_jvqisan'] ?? 0) + warRes.spoils.pills

        useUiStore().toast(`Đại thắng! ${warRes.warRecord.spoilsSummary}`, 'rare')
      } else {
        // Thất trận khi khiêu chiến: có nguy cơ đệ tử tử trận
        const mortalDisciples = disciples.value.filter(d => d.status !== 'deceased')
        if (mortalDisciples.length > 0 && Math.random() < 0.35) {
          const victim = mortalDisciples[Math.floor(Math.random() * mortalDisciples.length)]!
          victim.status = 'deceased'
          victim.deathCause = `Tử trận khi chiến đấu trong đại chiến với ${target.name}`
          victim.deathMonth = m
          const { year, month } = gameMonthToCalendar(m)
          addHistoryEntry({
            gameMonth: m,
            year,
            month,
            category: 'war',
            discipleId: victim.id,
            discipleName: victim.name,
            summary: `Tháng ${month}, năm thứ ${year} — [Đạo Tiêu Thân Vẫn] Đệ tử ${victim.name} đã anh dũng hy sinh khi huyết chiến với đại quân【${target.name}】!`
          })
        }
        useUiStore().toast('Tông môn giao chiến bất lợi, toàn quân rút về hộ sơn trận!', 'warn')
      }

      return { won: warRes.won, spoilsSummary: warRes.warRecord.spoilsSummary }
    }

    /**
     * Định đoạt kết quả chiến tranh: Diệt Tông vs Thu phục thành Tông Môn Phụ Thuộc
     */
    function resolveWarOutcome(targetSectId: string, choice: 'destroy' | 'vassalize', currentMonth?: number): boolean {
      const m = currentMonth ?? useNpcStore().gameMonth
      const target = worldSects.value.find(ws => ws.id === targetSectId)
      if (!target) return false

      const { year, month } = gameMonthToCalendar(m)

      if (choice === 'destroy') {
        target.status = 'destroyed'
        const resources = useResourcesStore()
        resources.addStone(gn(target.resources.stone))
        resources.addSmall('ore', target.resources.ore)
        resources.addSmall('herb', target.resources.herb)
        target.resources = { stone: 0, ore: 0, herb: 0, pills: 0 }

        addHistoryEntry({
          gameMonth: m,
          year,
          month,
          category: 'war',
          summary: `Tháng ${month}, năm thứ ${year} — Tông chủ hạ lệnh san bằng【${target.name}】, diệt môn đoạt bảo, danh chấn thiên hạ!`
        })
        useUiStore().toast(`Đã diệt vong hoàn toàn 【${target.name}】!`, 'rare')
      } else {
        target.status = 'vassal'
        const newVassal: VassalSectData = {
          id: target.id,
          name: target.name,
          level: target.level,
          vassalSinceMonth: m,
          leaderName: target.leaderName,
          status: 'active',
          lastTributeMonth: m,
          totalTributesPaid: 0,
          totalDeficitCount: 0
        }
        vassalSects.value.push(newVassal)

        addHistoryEntry({
          gameMonth: m,
          year,
          month,
          category: 'vassal',
          summary: `Tháng ${month}, năm thứ ${year} — Thu phục【${target.name}】làm Tông Môn Phụ Thuộc! Hằng tháng bắt buộc cống nộp tài nguyên.`
        })
        useUiStore().toast(`Đã thu phục 【${target.name}】 làm Tông Môn Phụ Thuộc!`, 'success')
      }

      return true
    }

    /**
     * Giao nhiệm vụ Nhiệm Vụ Đường cho một đệ tử
     */
    function assignQuest(templateId: string, discipleId: string, currentMonth: number): boolean {
      const tpl = sectQuestTemplate(templateId)
      const disciple = disciples.value.find(d => d.id === discipleId)

      if (!tpl || !disciple || disciple.status !== 'idle') {
        useUiStore().toast('Đệ tử đang bận hoặc không tìm thấy nhiệm vụ!', 'warn')
        return false
      }

      if (disciple.major < tpl.minMajor) {
        useUiStore().toast(`Đệ tử chưa đủ cảnh giới thi hành nhiệm vụ này (Yêu cầu cảnh giới cấp ${tpl.minMajor})!`, 'warn')
        return false
      }

      const finishMonth = currentMonth + tpl.durationMonths
      const newQuest: ActiveSectQuest = {
        uid: nextSectUid('quest'),
        templateId,
        assignedDiscipleId: discipleId,
        startMonth: currentMonth,
        finishMonth,
        status: 'in_progress'
      }

      activeQuests.value.push(newQuest)
      disciple.status = 'quest'
      disciple.assignedQuestId = newQuest.uid

      const { year, month } = gameMonthToCalendar(currentMonth)
      addHistoryEntry({
        gameMonth: currentMonth,
        year,
        month,
        category: 'quest',
        discipleId: disciple.id,
        discipleName: disciple.name,
        summary: `Tháng ${month}, năm thứ ${year} — Tông chủ giao phó nhiệm vụ【${tpl.name}】cho đệ tử ${disciple.name}.`
      })

      useUiStore().toast(`Đã phái đệ tử ${disciple.name} thi hành nhiệm vụ 【${tpl.name}】!`, 'info')
      return true
    }

    /**
     * Tự động phái việc nhanh cho các đệ tử có tiềm năng nhất vào nhiệm vụ khả dụng
     */
    function autoDispatchQuestsAction(): AutoDispatchResult {
      const currentMonth = useNpcStore().gameMonth
      const { newActiveQuests, updatedDisciples, historyEntries, result } = autoDispatchDisciplesToQuests(
        disciples.value,
        SECT_QUEST_TEMPLATES,
        activeQuests.value,
        currentMonth
      )

      if (result.dispatchedCount > 0) {
        disciples.value = updatedDisciples
        activeQuests.value.push(...newActiveQuests)
        for (const h of historyEntries) {
          addHistoryEntry(h)
        }
        useUiStore().toast(`Đã tự động phái ${result.dispatchedCount} đệ tử có tiềm năng thi hành nhiệm vụ!`, 'rare')
      } else {
        useUiStore().toast('Không có đệ tử nhàn rỗi hoặc các nhiệm vụ đều đã có đệ tử đảm nhận!', 'info')
      }

      return result
    }

    /**
     * Nạp công pháp vào Tàng Kinh Các Tông Môn
     */
    function addGongfaToLibrary(gongfaId: string, currentMonth: number, silent: boolean = false): boolean {
      const gf = gongfaDef(gongfaId)
      if (!gf) return false
      if (libraryGongfaIds.value.includes(gongfaId)) {
        if (!silent) useUiStore().toast('Tàng Kinh Các đã có công pháp này!', 'info')
        return false
      }

      libraryGongfaIds.value.push(gongfaId)
      const { year, month } = gameMonthToCalendar(currentMonth)
      addHistoryEntry({
        gameMonth: currentMonth,
        year,
        month,
        category: 'management',
        summary: `Tháng ${month}, năm thứ ${year} — Tàng Kinh Các Tông môn thu nạp thêm tuyệt kỹ【${displayGongfaName(gf.name)}】.`
      })

      if (!silent) useUiStore().toast(`Đã lưu giữ 【${displayGongfaName(gf.name)}】 vào Tàng Kinh Các!`, 'success')
      return true
    }

    /**
     * Nạp hàng loạt công pháp vào Tàng Kinh Các
     */
    function addBatchGongfasToLibrary(gongfaIds: string[], currentMonth: number): number {
      let count = 0
      for (const id of gongfaIds) {
        if (addGongfaToLibrary(id, currentMonth, true)) {
          count++
        }
      }
      if (count > 0) {
        useUiStore().toast(`Đã lưu giữ ${count} bộ công pháp vào Tàng Kinh Các!`, 'success')
      }
      return count
    }

    /**
     * Truyền thụ công pháp từ Tàng Kinh Các cho một đệ tử
     */
    function teachGongfaToDisciple(
      discipleId: string,
      gongfaId: string,
      currentMonth: number
    ): { success: boolean; message: string } {
      const disciple = disciples.value.find(d => d.id === discipleId)
      const gf = gongfaDef(gongfaId)

      if (!disciple || !gf) {
        return { success: false, message: 'Không tìm thấy đệ tử hoặc công pháp!' }
      }

      if (disciple.learnedGongfa.includes(gongfaId)) {
        return { success: false, message: 'Đệ tử đã học công pháp này rồi!' }
      }

      const elig = checkGongfaEligibility(
        gf,
        {
          major: disciple.major,
          element: disciple.element,
          comprehension: disciple.comprehension,
          aptitudes: disciple.aptitudes
        }
      )

      if (!elig.canLearn) {
        return { success: false, message: `Không thể học: ${elig.reason}` }
      }

      disciple.learnedGongfa.push(gongfaId)
      disciple.activeGongfa = gongfaId

      const { year, month } = gameMonthToCalendar(currentMonth)
      addHistoryEntry({
        gameMonth: currentMonth,
        year,
        month,
        category: 'cultivation',
        discipleId: disciple.id,
        discipleName: disciple.name,
        summary: `Tháng ${month}, năm thứ ${year} — Tông chủ tự mình truyền thụ công pháp【${displayGongfaName(gf.name)}】cho đệ tử ${disciple.name}.`
      })

      useUiStore().toast(`Truyền thụ thành công 【${displayGongfaName(gf.name)}】 cho ${disciple.name}!`, 'success')
      return { success: true, message: 'Truyền thụ thành công!' }
    }

    /**
     * Cho đệ tử khiêu chiến Tháp Lịch Luyện
     */
    function challengeTower(
      discipleId: string,
      currentMonth: number
    ): { success: boolean; floor: number; summary: string } {
      const disciple = disciples.value.find(d => d.id === discipleId)
      if (!disciple) return { success: false, floor: 0, summary: 'Không tìm thấy đệ tử!' }

      const nextFloor = disciple.towerFloor + 1
      const res = challengeSectTower(disciple, nextFloor)
      const { year, month } = gameMonthToCalendar(currentMonth)

      if (res.success) {
        disciple.towerFloor = nextFloor
        disciple.totalContributions += res.spoils.contribution
        disciple.expPct = Math.min(100, disciple.expPct + res.spoils.expPct)
        useResourcesStore().addStone(gn(res.spoils.stone))

        const summary = `Vượt qua tầng ${nextFloor}! Thưởng ${res.spoils.stone} Linh thạch, +${res.spoils.contribution} Cống hiến.`
        addHistoryEntry({
          gameMonth: currentMonth,
          year,
          month,
          category: 'tower',
          discipleId: disciple.id,
          discipleName: disciple.name,
          summary: `Tháng ${month}, năm thứ ${year} — Đệ tử ${disciple.name} khiêu chiến thành công vượt qua Tầng ${nextFloor} Tháp Lịch Luyện!`
        })

        useUiStore().toast(`Đệ tử ${disciple.name} vượt qua Tầng ${nextFloor} Tháp Lịch Luyện!`, 'rare')
        return { success: true, floor: nextFloor, summary }
      }

      const summary = `Khiêu chiến tầng ${nextFloor} thất bại trước Thủ quan thạch khôi.`
      useUiStore().toast(`Đệ tử ${disciple.name} khiêu chiến tầng ${nextFloor} thất bại, cần rèn luyện thêm!`, 'info')
      return { success: false, floor: nextFloor, summary }
    }

    /**
     * Tự động cho toàn bộ đệ tử khiêu chiến Tháp Lịch Luyện (thao tác thủ công nhanh)
     */
    function autoChallengeTowerAction(): {
      climbedDisciplesCount: number
      totalFloorsClimbed: number
      totalStone: number
      summary: string
    } {
      const currentMonth = useNpcStore().gameMonth || 1
      const res = simulateMonthlyTowerChallenge(disciples.value, currentMonth)

      if (res.climbedDisciplesCount > 0) {
        disciples.value = res.updatedDisciples
        if (res.totalStone > 0) {
          useResourcesStore().addStone(gn(res.totalStone))
        }
        for (const h of res.historyEntries) {
          addHistoryEntry(h)
        }
        useUiStore().toast(res.summary, 'rare')
      } else {
        useUiStore().toast(res.summary, 'info')
      }

      return {
        climbedDisciplesCount: res.climbedDisciplesCount,
        totalFloorsClimbed: res.totalFloorsClimbed,
        totalStone: res.totalStone,
        summary: res.summary
      }
    }

    /**
     * Cho đệ tử thám hiểm Bí Cảnh Tông Môn
     */
    function exploreRealm(
      discipleId: string,
      realmId: string,
      currentMonth: number
    ): { success: boolean; encounterText: string } {
      const disciple = disciples.value.find(d => d.id === discipleId)
      const realm = sectSecretRealmDef(realmId)

      if (!disciple || !realm) {
        return { success: false, encounterText: 'Không tìm thấy đệ tử hoặc bí cảnh!' }
      }

      if (disciple.major < realm.minMajor) {
        return { success: false, encounterText: `Cảnh giới đệ tử chưa đủ yêu cầu (Cần tối thiểu cảnh giới cấp ${realm.minMajor})!` }
      }

      const resources = useResourcesStore()
      if (!resources.hasStone(gn(realm.costStone))) {
        return { success: false, encounterText: `Linh thạch tông môn không đủ mở bí cảnh (Cần ${realm.costStone} Linh thạch)!` }
      }
      resources.spendStone(gn(realm.costStone))

      const res = exploreSectSecretRealm(disciple, realm)
      const { year, month } = gameMonthToCalendar(currentMonth)

      if (res.spoils.stone > 0) resources.addStone(gn(res.spoils.stone))
      if (res.spoils.herbCount > 0) resources.addHerb(res.spoils.herbGrade as HerbGrade, res.spoils.herbCount)
      if (res.spoils.wudaoCount > 0) resources.addSmall('wudao', res.spoils.wudaoCount)
      disciple.totalContributions += res.spoils.contribution
      disciple.expPct = Math.min(100, disciple.expPct + res.spoils.expPct)

      addHistoryEntry({
        gameMonth: currentMonth,
        year,
        month,
        category: 'realm',
        discipleId: disciple.id,
        discipleName: disciple.name,
        summary: `Tháng ${month}, năm thứ ${year} — Đệ tử ${disciple.name} tiến vào【${realm.name}】thám hiểm: ${res.encounterText}`
      })

      useUiStore().toast(`Thám hiểm hoàn tất: ${res.encounterText}`, res.success ? 'success' : 'info')
      return { success: res.success, encounterText: res.encounterText }
    }

    /**
     * Mô phỏng phát triển định kỳ của Tông môn khi thời gian game chuyển tháng
     */
    function simulateMonthlySect(currentMonth: number, monthsPassed: number): void {
      if (!sectCreated.value || monthsPassed <= 0) return

      // Tránh cập nhật lặp trong cùng một tháng
      if (lastProcessedMonth.value >= currentMonth) return
      lastProcessedMonth.value = currentMonth

      // 1. Sinh đúng 5 ứng viên mới mỗi tháng (không trùng lặp ID và Name)
      const existingIds = new Set<string>([
        ...disciples.value.map(d => d.id),
        ...processedApplicantIds.value,
        ...pendingApplicants.value.map(a => a.id)
      ])
      const existingNames = new Set<string>([
        ...disciples.value.map(d => d.name),
        ...pendingApplicants.value.map(a => a.name)
      ])
      const newApps = generateMonthlyApplicants(5 * monthsPassed, currentMonth, existingIds, undefined, existingNames)
      pendingApplicants.value.push(...newApps)
      pendingApplicant.value = pendingApplicants.value[0] ?? null

      const { year: calYear, month: calMonth } = gameMonthToCalendar(currentMonth)
      addHistoryEntry({
        gameMonth: currentMonth,
        year: calYear,
        month: calMonth,
        category: 'personnel',
        summary: `Tháng ${calMonth}, năm thứ ${calYear} — Có ${newApps.length} tu sĩ trẻ tìm đến sơn môn nộp đơn xin nhập tông.`
      })

      // 2. Đệ tử tự tu luyện, đột phá và lĩnh ngộ
      for (let i = 0; i < disciples.value.length; i++) {
        const disc = disciples.value[i]!
        const { updatedDisciple, historyEvents } = simulateDiscipleMonthlyCultivation(
          disc,
          libraryGongfaIds.value,
          currentMonth,
          monthsPassed,
          undefined,
          sectVault.value
        )
        disciples.value[i] = updatedDisciple
        for (const ev of historyEvents) {
          addHistoryEntry(ev)
        }
      }

      // 2.05. Đệ tử tự đi lịch luyện ở các bản đồ có cấp độ tương ứng để kiếm linh thạch, trang bị và tiêu thụ đan dược
      for (let i = 0; i < disciples.value.length; i++) {
        const disc = disciples.value[i]!
        if (disc.status !== 'deceased' && disc.status !== 'demonic') {
          const { updatedDisciple, historyEntry } = simulateDiscipleSelfAdventure(disc, currentMonth)
          const { updatedDisciple: consumedDisc } = simulateDiscipleBagConsumption(updatedDisciple)
          disciples.value[i] = consumedDisc
          if (historyEntry) {
            addHistoryEntry(historyEntry)
          }
        }
      }

      // 2.1. Đệ tử tự đánh giá và thay trang bị tốt hơn từ túi đồ cá nhân
      for (const disc of disciples.value) {
        if (disc.status !== 'deceased') {
          evaluateAndAutoEquipNpc(disc.id, { major: disc.major, sub: disc.sub, element: disc.element })
        }
      }

      // 2.2. Đệ tử tự đốn ngộ công pháp khi tu luyện
      for (const disc of disciples.value) {
        if (disc.status !== 'deceased') {
          const enlRes = simulateNpcGongfaEnlightenment(disc)
          if (enlRes.success && enlRes.gongfa) {
            const gid = enlRes.gongfa.id
            if (!disc.learnedGongfa.includes(gid)) {
              disc.learnedGongfa.push(gid)
            }
            if (!disc.gongfaOrigins) disc.gongfaOrigins = {}
            disc.gongfaOrigins[gid] = 'comprehended'
            if (enlRes.message) {
              const { year, month } = gameMonthToCalendar(currentMonth)
              addHistoryEntry({
                gameMonth: currentMonth,
                year,
                month,
                category: 'cultivation',
                discipleId: disc.id,
                discipleName: disc.name,
                summary: enlRes.message
              })
            }
          }
        }
      }

      // 2.3. Hoạt động Sư Đồ: Dạy dỗ, bồi dưỡng và truyền thụ công pháp
      const mentorLogs = simulateMonthlyMentorshipTeaching(disciples.value, currentMonth)
      for (const mLog of mentorLogs) {
        addHistoryEntry(mLog)
      }

      // 2.3. Sự kiện Tranh Giành Đệ Tử Thiên Kiêu giữa các Trưởng Lão
      const contentionRes = simulateProdigyContention(disciples.value, currentMonth)
      if (contentionRes.occurred && contentionRes.log) {
        addHistoryEntry(contentionRes.log)
      }

      // 3. Tiến trình Nhiệm Vụ Đường
      if (activeQuests.value.length > 0) {
        const disciplesMap = new Map(disciples.value.map(d => [d.id, d]))
        const { completed, remaining, historyEntries } = processSectQuestsProgress(
          activeQuests.value,
          disciplesMap,
          currentMonth
        )

        activeQuests.value = remaining
        for (const c of completed) {
          completedQuestHistory.value.push(c)
          const disc = disciples.value.find(d => d.id === c.discipleId)
          if (disc) {
            disc.status = 'idle'
            disc.assignedQuestId = undefined
          }

          // Trả thưởng vào tài nguyên tông môn
          const tpl = sectQuestTemplate(c.templateId)
          if (tpl && c.success) {
            const resources = useResourcesStore()
            if (tpl.rewards.stoneBase) resources.addStone(gn(tpl.rewards.stoneBase))
            if (tpl.rewards.herbCount && tpl.rewards.herbGrade) {
              resources.addHerb(tpl.rewards.herbGrade as HerbGrade, tpl.rewards.herbCount)
            }
            if (tpl.rewards.oreCount) resources.addSmall('ore', tpl.rewards.oreCount)
            if (tpl.rewards.dustCount) resources.addSmall('dust', tpl.rewards.dustCount)
            if (tpl.rewards.wudaoCount) resources.addSmall('wudao', tpl.rewards.wudaoCount)
            if (disc) {
              disc.totalContributions += tpl.rewards.contribution
              disc.contributionPoints = (disc.contributionPoints ?? 0) + tpl.rewards.contribution
            }
          }
        }

        for (const h of historyEntries) {
          addHistoryEntry(h)
        }
      }

      // 3.1. Tự động phái việc định kỳ hàng tháng cho các đệ tử tiềm năng nếu được bật
      if (autoDispatchQuests.value) {
        const { newActiveQuests, updatedDisciples, historyEntries } = autoDispatchDisciplesToQuests(
          disciples.value,
          SECT_QUEST_TEMPLATES,
          activeQuests.value,
          currentMonth
        )
        if (newActiveQuests.length > 0) {
          disciples.value = updatedDisciples
          activeQuests.value.push(...newActiveQuests)
          for (const h of historyEntries) {
            addHistoryEntry(h)
          }
        }
      }

      // 3.2. Đệ tử tự động khiêu chiến Tháp Lịch Luyện theo tháng nếu được bật
      if (autoTowerChallenge.value) {
        const maxFloors = Math.min(6, 2 * Math.max(1, monthsPassed))
        const towerRes = simulateMonthlyTowerChallenge(
          disciples.value,
          currentMonth,
          undefined,
          maxFloors
        )
        if (towerRes.climbedDisciplesCount > 0) {
          disciples.value = towerRes.updatedDisciples
          if (towerRes.totalStone > 0) {
            useResourcesStore().addStone(gn(towerRes.totalStone))
          }
          for (const h of towerRes.historyEntries) {
            addHistoryEntry(h)
          }
        }
      }

      // 4. Tổ chức Tỉ Thí Tông Môn cứ mỗi 6 tháng
      if (currentMonth % 6 === 0 && lastTournamentMonth.value !== currentMonth) {
        lastTournamentMonth.value = currentMonth
        const { tournament, historyEntry } = runSectTournament(disciples.value, currentMonth)
        tournamentHistory.value.unshift(tournament)
        addHistoryEntry(historyEntry)

        // Phát thưởng cho đệ tử đạt thứ hạng theo từng phân bảng
        for (const rank of tournament.rankings) {
          const disc = disciples.value.find(d => d.id === rank.discipleId)
          if (!disc) continue

          let stoneAward = 0
          let contribAward = 0
          let expAward = 0
          let winBonus = 0

          if (rank.division === 'true') {
            if (rank.rank === 1) {
              stoneAward = 25000
              contribAward = 80
              expAward = 25
              winBonus = 3
            } else if (rank.rank === 2) {
              stoneAward = 15000
              contribAward = 50
              expAward = 15
              winBonus = 2
            } else if (rank.rank === 3) {
              stoneAward = 8000
              contribAward = 30
              expAward = 10
              winBonus = 1
            } else {
              stoneAward = Math.max(1000, 4000 - rank.rank * 500)
              contribAward = 15
            }
          } else if (rank.division === 'inner') {
            if (rank.rank === 1) {
              stoneAward = 15000
              contribAward = 50
              expAward = 20
              winBonus = 3
            } else if (rank.rank === 2) {
              stoneAward = 8000
              contribAward = 30
              expAward = 12
              winBonus = 2
            } else if (rank.rank === 3) {
              stoneAward = 5000
              contribAward = 20
              expAward = 8
              winBonus = 1
            } else {
              stoneAward = Math.max(500, 2500 - rank.rank * 300)
              contribAward = 10
            }
          } else {
            // Ngoại môn hoặc mặc định
            if (rank.rank === 1) {
              stoneAward = 8000
              contribAward = 30
              expAward = 15
              winBonus = 3
            } else if (rank.rank === 2) {
              stoneAward = 4000
              contribAward = 20
              expAward = 10
              winBonus = 2
            } else if (rank.rank === 3) {
              stoneAward = 2000
              contribAward = 10
              expAward = 5
              winBonus = 1
            } else {
              stoneAward = Math.max(300, 1500 - rank.rank * 200)
              contribAward = 5
            }
          }

          if (stoneAward > 0) useResourcesStore().addStone(gn(stoneAward))
          if (contribAward > 0) {
            disc.totalContributions = (disc.totalContributions ?? 0) + contribAward
            disc.contributionPoints = (disc.contributionPoints ?? 0) + contribAward
          }
          if (expAward > 0) disc.expPct = Math.min(100, disc.expPct + expAward)
          if (winBonus > 0) disc.battlesWon = (disc.battlesWon ?? 0) + winBonus
        }
      }

      // 5. Cống nộp tài nguyên từ các Tông Môn Phụ Thuộc
      if (vassalSects.value.length > 0) {
        const tribRes = processMonthlyVassalTributes(vassalSects.value, worldSects.value, currentMonth)
        vassalSects.value = tribRes.updatedVassals
        worldSects.value = tribRes.updatedWorldSects
        tributeHistory.value.unshift(...tribRes.tributeRecords)

        const resStore = useResourcesStore()
        if (tribRes.totalSpoils.stone > 0) resStore.addStone(gn(tribRes.totalSpoils.stone))
        if (tribRes.totalSpoils.ore > 0) resStore.addSmall('ore', tribRes.totalSpoils.ore)
        if (tribRes.totalSpoils.herb > 0) resStore.addSmall('herb', tribRes.totalSpoils.herb)
        if (tribRes.totalSpoils.pills > 0) {
          const inv = useInventoryStore()
          inv.pills['p_jvqisan'] = (inv.pills['p_jvqisan'] ?? 0) + tribRes.totalSpoils.pills
        }

        for (const h of tribRes.historyEntries) {
          addHistoryEntry(h)
        }
      }

      // 6. Xét duyệt thăng cấp đệ tử & chức vụ bán niên (mỗi 6 tháng)
      if (currentMonth % 6 === 0 && lastPromotionMonth.value < currentMonth) {
        const latestTournament = tournamentHistory.value[0]
        const promRes = evaluateBiannualPromotions(disciples.value, sectLevel.value, currentMonth, latestTournament)
        disciples.value = promRes.updatedDisciples
        lastPromotionMonth.value = currentMonth

        for (const h of promRes.historyEntries) {
          addHistoryEntry(h)
        }

        if (promRes.promotions.length > 0) {
          useUiStore().toast(`Kỳ xét duyệt bán niên hoàn tất: ${promRes.promotions.length} nhân sự được thăng cấp!`, 'rare')
        }
      }

      // 7. Cập nhật mốc chiến lực & Hiệu chỉnh Tông Môn Thế Giới theo tiến trình người chơi
      const playerCurrentPower = calculateSectCombatPower(
        disciples.value,
        playerIsAncestor.value,
        { major: usePlayerStore().major, sub: usePlayerStore().sub }
      )
      sectLevelPowerBenchmarks.value[sectLevel.value] = Math.max(
        sectLevelPowerBenchmarks.value[sectLevel.value] || 0,
        playerCurrentPower
      )
      worldSects.value = calibrateWorldSectCombatPower(
        worldSects.value,
        sectLevel.value,
        playerCurrentPower,
        sectLevelPowerBenchmarks.value
      )

      // 8. Nếu Tông môn người chơi đang là chư hầu phụ thuộc (overlordSectId), tự động nộp cống phẩm
      if (overlordSectId.value) {
        const overlord = worldSects.value.find(ws => ws.id === overlordSectId.value)
        const cfg = VASSAL_TRIBUTE_CONFIG[sectLevel.value] ?? VASSAL_TRIBUTE_CONFIG[1]!
        const resStore = useResourcesStore()
        const currentStone = toNum(resStore.spiritStone)
        const stonePaid = Math.min(currentStone, cfg.stone)
        const orePaid = Math.min(resStore.ore, cfg.ore)
        const pMajor = usePlayerStore().major
        const herbPaid = Math.min(resStore.herbOf(herbGradeOfMajor(pMajor)), cfg.herb)

        if (stonePaid > 0) resStore.spendStone(gn(stonePaid))
        if (orePaid > 0) resStore.addSmall('ore', -orePaid)
        if (herbPaid > 0) resStore.addHerb(herbGradeOfMajor(pMajor), -herbPaid)

        addHistoryEntry({
          gameMonth: currentMonth,
          year: calYear,
          month: calMonth,
          category: 'tribute',
          summary: `Tháng ${calMonth}, năm thứ ${calYear} — Thực hiện nghĩa vụ phụ thuộc, cống nộp cho【${overlord?.name ?? 'Tông Chủ Đô Hộ'}】: ${stonePaid} Linh thạch, ${orePaid} Huyền thiết, ${herbPaid} Linh thảo.`
        })
      }

      // 9. Kiểm tra Tông Môn Thế Giới chủ động tuyên chiến (chỉ cùng cấp và active)
      const invasion = checkMonthlyWorldSectInvasion(
        worldSects.value,
        sectLevel.value,
        currentMonth,
        lastInvasionMonth.value,
        Boolean(overlordSectId.value),
        Boolean(pendingWarDeclaration.value)
      )
      if (invasion) {
        pendingWarDeclaration.value = invasion
        lastInvasionMonth.value = currentMonth
        addHistoryEntry({
          gameMonth: currentMonth,
          year: calYear,
          month: calMonth,
          category: 'war',
          summary: `Tháng ${calMonth}, năm thứ ${calYear} — BÁO ĐỘNG! Tông môn【${invasion.sectName}】(Cấp ${invasion.sectLevel}) gửi hịch tuyên chiến, áp sát sơn môn yêu cầu quy phục hoặc huyết chiến!`
        })
        useUiStore().toast(`Cảnh báo: ${invasion.sectName} đã khởi binh tuyên chiến với Tông môn!`, 'warn')
      }
    }

    /**
     * Phản hồi hịch tuyên chiến từ Tông môn khác:
     * - 'accept': Đồng ý giao chiến
     * - 'surrender': Không đồng ý giao chiến -> Trở thành Tông môn phụ thuộc
     */
    function respondToWarDeclaration(
      choice: 'accept' | 'surrender',
      summonAncestor = false
    ): { success: boolean; won?: boolean; targetSectId?: string; message: string } {
      if (!pendingWarDeclaration.value) {
        return { success: false, message: 'Hiện không có hịch tuyên chiến nào đang chờ xử lý!' }
      }

      const m = useNpcStore().gameMonth
      const { year, month } = gameMonthToCalendar(m)
      const targetId = pendingWarDeclaration.value.sectId
      const target = worldSects.value.find(ws => ws.id === targetId)

      if (choice === 'surrender') {
        overlordSectId.value = targetId
        const enemyName = pendingWarDeclaration.value.sectName
        pendingWarDeclaration.value = null

        addHistoryEntry({
          gameMonth: m,
          year,
          month,
          category: 'vassal',
          summary: `Tháng ${month}, năm thứ ${year} — Tông chủ quyết định bảo toàn thực lực, chấp thuận xưng thần phụ thuộc dưới trướng【${enemyName}】. Hằng tháng nộp cống phẩm!`
        })
        useUiStore().toast(`Tông môn đã chấp nhận xưng thần phụ thuộc dưới trướng ${enemyName}.`, 'warn')
        return { success: true, won: false, message: `Đã quy phục ${enemyName} thành Tông Môn Phụ Thuộc.` }
      }

      // choice === 'accept'
      if (!target) {
        pendingWarDeclaration.value = null
        return { success: false, message: 'Không tìm thấy thông tin Tông môn đối thủ!' }
      }

      const pSnap = { major: usePlayerStore().major, sub: usePlayerStore().sub }
      const warRes = simulateSectWar(
        sectName.value,
        target,
        disciples.value,
        summonAncestor,
        m,
        false,
        pSnap
      )

      warHistory.value.unshift(warRes.warRecord)
      addHistoryEntry(warRes.historyEntry)
      pendingWarDeclaration.value = null

      if (warRes.won) {
        const resources = useResourcesStore()
        resources.addStone(gn(warRes.spoils.stone))
        resources.addSmall('ore', warRes.spoils.ore)
        resources.addSmall('herb', warRes.spoils.herb)
        const inv = useInventoryStore()
        inv.pills['p_jvqisan'] = (inv.pills['p_jvqisan'] ?? 0) + warRes.spoils.pills

        useUiStore().toast(`Đại phá quân xâm lăng! Thu được ${warRes.warRecord.spoilsSummary}`, 'rare')
        return { success: true, won: true, targetSectId: target.id, message: 'Đại thắng quân địch xâm lược!' }
      } else {
        const resources = useResourcesStore()
        const stoneLoss = Math.floor(toNum(resources.spiritStone) * 0.15)
        if (stoneLoss > 0) resources.spendStone(gn(stoneLoss))

        // Nguy cơ đệ tử tử trận khi phòng thủ thất bại trước cuộc xâm lược
        const mortalDisciples = disciples.value.filter(d => d.status !== 'deceased')
        if (mortalDisciples.length > 0 && Math.random() < 0.4) {
          const victim = mortalDisciples[Math.floor(Math.random() * mortalDisciples.length)]!
          victim.status = 'deceased'
          victim.deathCause = `Tử trận khi bảo vệ sơn môn trước ${target.name}`
          victim.deathMonth = m
          const { year, month } = gameMonthToCalendar(m)
          addHistoryEntry({
            gameMonth: m,
            year,
            month,
            category: 'war',
            discipleId: victim.id,
            discipleName: victim.name,
            summary: `Tháng ${month}, năm thứ ${year} — [Đạo Tiêu Thân Vẫn] Đệ tử ${victim.name} đã anh dũng hy sinh khi chiến đấu bảo vệ sơn môn chống lại đại quân xâm lược【${target.name}】!`
          })
        }

        useUiStore().toast(`Phòng thủ thất bại trước ${target.name}! Bồi thường ${stoneLoss.toLocaleString()} Linh thạch.`, 'warn')
        return { success: true, won: false, targetSectId: target.id, message: 'Phòng thủ thất bại!' }
      }
    }

    /**
     * Khởi binh giành độc lập khi đang là Tông Môn Phụ Thuộc
     */
    function rebelAgainstOverlord(
      summonAncestor = false
    ): { success: boolean; won?: boolean; message: string } {
      if (!overlordSectId.value) {
        return { success: false, message: 'Tông môn hiện không bị thế lực nào đô hộ!' }
      }

      const m = useNpcStore().gameMonth
      const { year, month } = gameMonthToCalendar(m)
      const overlord = worldSects.value.find(ws => ws.id === overlordSectId.value)

      if (!overlord) {
        overlordSectId.value = null
        return { success: true, won: true, message: 'Thế lực đô hộ đã tiêu vong, Tông môn khôi phục tự do!' }
      }

      const pSnap = { major: usePlayerStore().major, sub: usePlayerStore().sub }
      const warRes = simulateSectWar(
        sectName.value,
        overlord,
        disciples.value,
        summonAncestor,
        m,
        true,
        pSnap
      )

      warHistory.value.unshift(warRes.warRecord)
      addHistoryEntry(warRes.historyEntry)

      if (warRes.won) {
        overlordSectId.value = null
        addHistoryEntry({
          gameMonth: m,
          year,
          month,
          category: 'war',
          summary: `Tháng ${month}, năm thứ ${year} — KHỞI BINH GIÀNH ĐỘC LẬP THÀNH CÔNG! Đánh bại quân trấn áp của【${overlord.name}】, đập tan xiềng xích, khôi phục hoàn toàn tự do cho Tông môn!`
        })
        useUiStore().toast(`Khởi nghĩa toàn thắng! Môn phái đã giành lại độc lập tự chủ!`, 'rare')
        return { success: true, won: true, message: 'Khởi binh toàn thắng, khôi phục độc lập tự do!' }
      } else {
        addHistoryEntry({
          gameMonth: m,
          year,
          month,
          category: 'war',
          summary: `Tháng ${month}, năm thứ ${year} — Khởi binh giành độc lập bất thành trước【${overlord.name}】, môn hạ tổn thất nghiêm trọng, tiếp tục chịu cảnh chư hầu.`
        })
        useUiStore().toast(`Khởi binh bất thành trước ${overlord.name}!`, 'warn')
        return { success: true, won: false, message: 'Khởi binh thất bại, đành tiếp tục quy phục.' }
      }
    }

    /**
     * Tịnh hóa tâm ma cho đệ tử bị Nhập Ma
     * Tiêu hao 5000 linh thạch để vận công dẫn độ ma khí
     */
    function purifyDemonicDisciple(discipleId: string): boolean {
      const disc = disciples.value.find(d => d.id === discipleId)
      if (!disc || disc.status !== 'demonic') {
        useUiStore().toast('Đệ tử không ở trạng thái nhập ma!', 'info')
        return false
      }
      const resources = useResourcesStore()
      const cost = 5000
      if (toNum(resources.spiritStone) < cost) {
        useUiStore().toast(`Không đủ Linh thạch để tịnh hóa (Cần ${cost} Linh thạch)!`, 'warn')
        return false
      }
      resources.addStone(gn(-cost))
      disc.status = 'idle'
      const { year, month } = gameMonthToCalendar(useNpcStore().gameMonth)
      addHistoryEntry({
        gameMonth: useNpcStore().gameMonth,
        year,
        month,
        category: 'cultivation',
        discipleId: disc.id,
        discipleName: disc.name,
        summary: `Tháng ${month}, năm thứ ${year} — Tông chủ đích thân vận chuyển chân khí quán đỉnh, tiêu hao ${cost} Linh thạch giúp đệ tử ${disc.name} tịnh hóa tâm ma, bảo toàn tính mệnh!`
      })
      useUiStore().toast(`Đã tịnh hóa thành công tâm ma cho ${disc.name}!`, 'rare')
      return true
    }

    /**
     * Trục xuất đệ tử khỏi tông môn (Đuổi khỏi tông môn)
     */
    function expelDisciple(discipleId: string): boolean {
      const idx = disciples.value.findIndex(d => d.id === discipleId)
      if (idx === -1) return false
      const disc = disciples.value.splice(idx, 1)[0]!

      // Thu hồi trang bị của đệ tử về Kho Tông Môn (nếu có)
      if (disc.equippedItems && disc.equippedItems.length > 0) {
        sectVault.value.equipments.push(...disc.equippedItems)
        disc.equippedItems = []
      }

      const { year, month } = gameMonthToCalendar(useNpcStore().gameMonth)
      addHistoryEntry({
        gameMonth: useNpcStore().gameMonth,
        year,
        month,
        category: 'personnel',
        discipleId: disc.id,
        discipleName: disc.name,
        summary: `Tháng ${month}, năm thứ ${year} — Tông chủ hạ lệnh trục xuất đệ tử ${disc.name} ra khỏi sơn môn, thu hồi bảo vật quy tông, từ nay ân đoạn nghĩa tuyệt.`
      })
      useUiStore().toast(`Đã trục xuất ${disc.name} khỏi tông môn!`, 'info')
      return true
    }

    /**
     * Ban thưởng linh thạch cho đệ tử: tăng tu vi, cống hiến và cơ hội phá vỡ bình cảnh
     */
    function rewardDiscipleStones(discipleId: string, amount: number): boolean {
      if (amount <= 0) return false
      const disc = disciples.value.find(d => d.id === discipleId)
      if (!disc || disc.status === 'deceased') {
        useUiStore().toast('Đệ tử không hợp lệ hoặc đã tạ thế!', 'warn')
        return false
      }

      const resources = useResourcesStore()
      if (toNum(resources.spiritStone) < amount) {
        useUiStore().toast(`Không đủ Linh thạch (Cần ${formatNum(amount)} Linh thạch)!`, 'warn')
        return false
      }

      resources.spendStone(gn(amount))

      const addedPoints = Math.max(10, Math.floor(amount / 100))
      disc.totalContributions += addedPoints
      disc.contributionPoints = (disc.contributionPoints ?? 0) + addedPoints

      const expBonus = Math.min(50, Math.max(5, Math.floor(amount / 200)))
      disc.expPct = Math.min(100, disc.expPct + expBonus)

      let clearedBottleneck = false
      if (disc.status === 'bottleneck' && amount >= 5000 && Math.random() < 0.5) {
        disc.status = 'idle'
        clearedBottleneck = true
      }

      const { year, month } = gameMonthToCalendar(useNpcStore().gameMonth)
      addHistoryEntry({
        gameMonth: useNpcStore().gameMonth,
        year,
        month,
        category: 'personnel',
        discipleId: disc.id,
        discipleName: disc.name,
        summary: `Tháng ${month}, năm thứ ${year} — Tông chủ ban thưởng ${formatNum(amount)} Linh thạch cho đệ tử ${disc.name}, giúp tăng ${expBonus}% tu vi và ${addedPoints} điểm cống hiến${clearedBottleneck ? ' (Phá vỡ bình cảnh thành công!)' : ''}.`
      })

      useUiStore().toast(`Đã ban thưởng ${formatNum(amount)} Linh thạch cho ${disc.name}! (+${expBonus}% Tu vi)`, 'info')
      return true
    }

    /**
     * Ban thưởng vật phẩm (Đan dược / Linh thảo / Huyền thiết / Trang bị) cho đệ tử
     */
    function rewardDiscipleItem(
      discipleId: string,
      itemType: 'pill' | 'herb' | 'ore' | 'equipment',
      itemIdOrGrade: string | number
    ): { success: boolean; message: string } {
      const disc = disciples.value.find(d => d.id === discipleId)
      if (!disc || disc.status === 'deceased') {
        const msg = 'Đệ tử không hợp lệ hoặc đã tạ thế!'
        useUiStore().toast(msg, 'warn')
        return { success: false, message: msg }
      }

      const inventory = useInventoryStore()
      const resources = useResourcesStore()
      const { year, month } = gameMonthToCalendar(useNpcStore().gameMonth)

      let itemName = ''
      let bonusExp = 10
      let bonusContrib = 20

      if (itemType === 'equipment') {
        const uid = typeof itemIdOrGrade === 'string' ? itemIdOrGrade : ''
        const item = inventory.findItem(uid)
        if (!item) {
          const msg = 'Không tìm thấy trang bị này trong túi đồ!'
          useUiStore().toast(msg, 'warn')
          return { success: false, message: msg }
        }
        const tpl = equipmentTemplate(item.templateId)
        itemName = tpl ? displayEquipName(tpl.name) : item.templateId

        const eqRes = giftEquipmentToNpc(disc.id, disc.name, item, 'rewarded', {
          major: disc.major,
          sub: disc.sub,
          element: disc.element
        })

        inventory.removeEquipment(item.uid)
        bonusExp = 15
        bonusContrib = 35

        disc.expPct = Math.min(100, disc.expPct + bonusExp)
        disc.totalContributions += bonusContrib
        disc.contributionPoints = (disc.contributionPoints ?? 0) + bonusContrib

        addHistoryEntry({
          gameMonth: useNpcStore().gameMonth,
          year,
          month,
          category: 'personnel',
          discipleId: disc.id,
          discipleName: disc.name,
          summary: `Tháng ${month}, năm thứ ${year} — Tông chủ ban thưởng pháp bảo trang bị【${itemName}】cho đệ tử ${disc.name}. ${eqRes.message}`
        })

        useUiStore().toast(`Ban thưởng ${itemName} cho ${disc.name}! (+${bonusExp}% Tu vi)`, 'rare')
        return { success: true, message: eqRes.message }
      } else if (itemType === 'pill') {
        const pillId = typeof itemIdOrGrade === 'string' ? itemIdOrGrade : ''
        if (!pillId || (inventory.pills[pillId] ?? 0) <= 0) {
          const msg = 'Trong túi đan không có đan dược này!'
          useUiStore().toast(msg, 'warn')
          return { success: false, message: msg }
        }
        inventory.spendPill(pillId, 1)
        const pDef = pillDef(pillId)
        itemName = pDef ? displayPillName(pDef.name) : 'Linh đan'
        bonusExp = 25
        bonusContrib = 25

        if (disc.status === 'injured') {
          disc.status = 'idle'
        }
      } else if (itemType === 'herb') {
        const grade = (typeof itemIdOrGrade === 'number' ? itemIdOrGrade : 1) as HerbGrade
        if (resources.herbOf(grade) <= 0) {
          const msg = 'Linh thảo phẩm cấp này đã hết!'
          useUiStore().toast(msg, 'warn')
          return { success: false, message: msg }
        }
        resources.addHerb(grade, -1)
        itemName = `Linh thảo phẩm ${grade}`
        bonusExp = 12
        bonusContrib = 15
      } else if (itemType === 'ore') {
        if (resources.ore <= 0) {
          const msg = 'Huyền thiết khoáng thạch trong kho không đủ!'
          useUiStore().toast(msg, 'warn')
          return { success: false, message: msg }
        }
        resources.addSmall('ore', -1)
        itemName = 'Huyền thiết khoáng thạch'
        bonusExp = 8
        bonusContrib = 15
      }

      disc.expPct = Math.min(100, disc.expPct + bonusExp)
      disc.totalContributions += bonusContrib
      disc.contributionPoints = (disc.contributionPoints ?? 0) + bonusContrib

      const summary = `Tháng ${month}, năm thứ ${year} — Tông chủ ban thưởng ${itemName} cho đệ tử ${disc.name}, giúp tăng ${bonusExp}% tu vi và ${bonusContrib} cống hiến môn phái.`
      addHistoryEntry({
        gameMonth: useNpcStore().gameMonth,
        year,
        month,
        category: 'personnel',
        discipleId: disc.id,
        discipleName: disc.name,
        summary
      })

      useUiStore().toast(`Ban thưởng ${itemName} cho ${disc.name}!`, 'info')
      return { success: true, message: summary }
    }

    function assignDiscipleToMentorAction(discipleId: string, mentorId: string): boolean {
      const disc = disciples.value.find(d => d.id === discipleId)
      const mentor = disciples.value.find(d => d.id === mentorId)
      if (!disc || !mentor) {
        useUiStore().toast('Không tìm thấy thông tin sư phụ hoặc đệ tử!', 'warn')
        return false
      }
      const res = assignDiscipleToMentor(mentor.id, disc.id, disciples.value, useNpcStore().gameMonth)
      if (res.success) {
        useUiStore().toast(res.message, 'info')
        const { year, month } = gameMonthToCalendar(useNpcStore().gameMonth)
        addHistoryEntry({
          gameMonth: useNpcStore().gameMonth,
          year,
          month,
          category: 'personnel',
          discipleId: disc.id,
          discipleName: disc.name,
          summary: `Tháng ${month}, năm thứ ${year} — ${res.message}`
        })
        return true
      }
      useUiStore().toast(res.message, 'warn')
      return false
    }

    function removeDiscipleFromMentorAction(discipleId: string): boolean {
      const disc = disciples.value.find(d => d.id === discipleId)
      if (!disc) return false
      const res = removeDiscipleFromMentor(disc.id, disciples.value)
      if (res.success) {
        useUiStore().toast(res.message, 'info')
        return true
      }
      useUiStore().toast(res.message, 'warn')
      return false
    }

    function assignElderSpecialtyAction(elderId: string, specialty: ElderSpecialty): boolean {
      const elder = disciples.value.find(d => d.id === elderId)
      if (!elder) return false
      const res = assignElderSpecialty(elder.id, specialty, disciples.value)
      if (res.success) {
        useUiStore().toast(res.message, 'info')
        return true
      }
      useUiStore().toast(res.message, 'warn')
      return false
    }

    // =========================================================================
    // QUẢN LÝ KHO TÔNG MÔN (SECT VAULT DEPOSIT / WITHDRAW)
    // =========================================================================

    function depositStoneToVault(amount: number): boolean {
      if (amount <= 0) return false
      const resources = useResourcesStore()
      if (toNum(resources.spiritStone) < amount) {
        useUiStore().toast(`Không đủ Linh thạch để gửi vào kho!`, 'warn')
        return false
      }
      resources.spendStone(gn(amount))
      sectVault.value.stone += amount
      useUiStore().toast(`Đã gửi ${formatNum(amount)} Linh thạch vào Kho Tông Môn!`, 'info')
      return true
    }

    function withdrawStoneFromVault(amount: number): boolean {
      if (amount <= 0) return false
      if (sectVault.value.stone < amount) {
        useUiStore().toast(`Kho Tông Môn không đủ Linh thạch!`, 'warn')
        return false
      }
      sectVault.value.stone -= amount
      useResourcesStore().addStone(gn(amount))
      useUiStore().toast(`Đã rút ${formatNum(amount)} Linh thạch từ Kho Tông Môn!`, 'info')
      return true
    }

    function depositHerbToVault(grade: HerbGrade, count: number): boolean {
      if (count <= 0) return false
      const resources = useResourcesStore()
      if (resources.herbOf(grade) < count) {
        useUiStore().toast(`Không đủ Linh thảo phẩm cấp ${grade}!`, 'warn')
        return false
      }
      resources.addHerb(grade, -count)
      sectVault.value.herbs[grade] = (sectVault.value.herbs[grade] ?? 0) + count
      useUiStore().toast(`Đã gửi ${count} Linh thảo cấp ${grade} vào kho!`, 'info')
      return true
    }

    function withdrawHerbFromVault(grade: HerbGrade, count: number): boolean {
      if (count <= 0) return false
      const cur = sectVault.value.herbs[grade] ?? 0
      if (cur < count) {
        useUiStore().toast(`Kho không đủ linh thảo cấp ${grade}!`, 'warn')
        return false
      }
      sectVault.value.herbs[grade] = cur - count
      useResourcesStore().addHerb(grade, count)
      useUiStore().toast(`Đã rút ${count} Linh thảo cấp ${grade} từ kho!`, 'info')
      return true
    }

    function depositMaterialToVault(type: 'ore' | 'dust' | 'wudao', count: number): boolean {
      if (count <= 0) return false
      const resources = useResourcesStore()
      if (resources[type] < count) {
        useUiStore().toast(`Không đủ nguyên liệu trong kho tài nguyên!`, 'warn')
        return false
      }
      resources.addSmall(type, -count)
      const key = type === 'ore' ? 'ores' : type
      sectVault.value[key] += count
      useUiStore().toast(`Đã gửi ${count} nguyên liệu vào Kho Tông Môn!`, 'info')
      return true
    }

    function withdrawMaterialFromVault(type: 'ore' | 'dust' | 'wudao', count: number): boolean {
      if (count <= 0) return false
      const key = type === 'ore' ? 'ores' : type
      if (sectVault.value[key] < count) {
        useUiStore().toast(`Kho Tông Môn không đủ nguyên liệu!`, 'warn')
        return false
      }
      sectVault.value[key] -= count
      useResourcesStore().addSmall(type, count)
      useUiStore().toast(`Đã rút ${count} nguyên liệu từ Kho Tông Môn!`, 'info')
      return true
    }

    function depositPillToVault(pillId: string, count: number): boolean {
      if (count <= 0) return false
      const inv = useInventoryStore()
      const have = inv.pills[pillId] ?? 0
      if (have < count) {
        useUiStore().toast(`Không đủ đan dược trong túi đồ!`, 'warn')
        return false
      }
      inv.spendPill(pillId, count)
      sectVault.value.pills[pillId] = (sectVault.value.pills[pillId] ?? 0) + count
      useUiStore().toast(`Đã gửi ${count} đan dược vào Kho Tông Môn!`, 'info')
      return true
    }

    function withdrawPillFromVault(pillId: string, count: number): boolean {
      if (count <= 0) return false
      const cur = sectVault.value.pills[pillId] ?? 0
      if (cur < count) {
        useUiStore().toast(`Kho Tông Môn không đủ đan dược!`, 'warn')
        return false
      }
      if (cur - count <= 0) {
        delete sectVault.value.pills[pillId]
      } else {
        sectVault.value.pills[pillId] = cur - count
      }
      useInventoryStore().addPill(pillId, count)
      useUiStore().toast(`Đã rút ${count} đan dược từ Kho Tông Môn!`, 'info')
      return true
    }

    function depositEquipmentToVault(itemUid: string): boolean {
      const inv = useInventoryStore()
      const item = inv.findItem(itemUid)
      if (!item) {
        useUiStore().toast(`Không tìm thấy trang bị trong túi đồ!`, 'warn')
        return false
      }
      if (inv.equippedUids.has(itemUid)) {
        useUiStore().toast(`Không thể gửi trang bị đang mặc vào kho! Hãy tháo ra trước.`, 'warn')
        return false
      }
      inv.removeEquipment(itemUid)
      sectVault.value.equipments.push(item)
      useUiStore().toast(`Đã gửi trang bị vào Kho Tông Môn!`, 'info')
      return true
    }

    function withdrawEquipmentFromVault(itemUid: string): boolean {
      const idx = sectVault.value.equipments.findIndex(e => e.uid === itemUid)
      if (idx === -1) {
        useUiStore().toast(`Không tìm thấy trang bị trong kho!`, 'warn')
        return false
      }
      const inv = useInventoryStore()
      if (inv.bagFull) {
        useUiStore().toast(`Túi đồ nhân vật đã đầy, không thể rút thêm trang bị!`, 'warn')
        return false
      }
      const item = sectVault.value.equipments.splice(idx, 1)[0]!
      inv.addEquipment(item)
      useUiStore().toast(`Đã rút trang bị từ Kho Tông Môn về túi đồ!`, 'info')
      return true
    }

    // =========================================================================
    // HỖ TRỢ ĐỒNG BỘ ĐẠO ĐỒNG & CHUYỂN KIẾP (REBIRTH RESET)
    // =========================================================================
    function sync(): void {
      if (apprentices.value.length === 0 && !sectCreated.value) {
        apprentices.value = [{ uid: nextUid(), archId: STARTER_APPRENTICE, level: 1, bond: rebirthKarma.value, task: null }]
        rebirthKarma.value = 0
      }
    }

    function collectFinished(now: number, major: number): TaskSpoils[] {
      const reaped: TaskSpoils[] = []
      for (const appr of apprentices.value) {
        if (!taskDone(appr, now)) continue
        const spec = appr.task!.spec
        const spoils = apprenticeSpoils(appr.archId, spec, major, appr.level)
        applySpoils(spoils, major)
        appr.level = Math.min(APPRENTICE_MAX_LEVEL, appr.level + 1)
        appr.bond += 1
        appr.task = null
        reaped.push(spoils)
      }
      return reaped
    }

    function dispatch(uid: string, spec: ApprenticeSpec, now: number): boolean {
      const appr = apprentices.value.find(x => x.uid === uid)
      if (!appr || appr.task) return false
      appr.task = { spec, startAt: now, finishAt: now + apprenticeTaskSeconds(spec) * 1000 }
      return true
    }

    function recruit(major: number): 'full' | 'poor' | 'ok' {
      if (apprentices.value.length >= apprenticeSlots(major)) return 'full'
      const owned = new Set(apprentices.value.map(a => a.archId))
      const pool = APPRENTICES.filter(x => x.id !== STARTER_APPRENTICE && !owned.has(x.id))
      if (pool.length === 0) return 'full'
      const cost = stoneByTier(maxTierForMajor(major), RECRUIT_COST_TIER_AMOUNT)
      if (!useResourcesStore().spendStone(cost)) return 'poor'
      apprentices.value.push({ uid: nextUid(), archId: rng.pick(pool).id, level: 1, bond: 0, task: null })
      return 'ok'
    }

    function dispatchAll(now: number): number {
      const idle = apprentices.value
        .filter(a => !a.task)
        .map(a => ({ uid: a.uid, talent: apprenticeDef(a.archId)!.talent }))
      if (idle.length === 0) return 0
      const resources = useResourcesStore()
      const major = usePlayerStore().major
      const targets = dispatchAllToNeed(idle, {
        herb: resources.herbOf(herbGradeOfMajor(major)),
        ore: resources.ore,
        wudao: resources.wudao,
        dust: resources.dust,
        seek: Object.values(useInventoryStore().pills).reduce((a, b) => a + b, 0)
      })
      for (const t of targets) {
        const appr = apprentices.value.find(x => x.uid === t.uid)
        if (appr && !appr.task) {
          appr.task = { spec: t.spec, startAt: now, finishAt: now + apprenticeTaskSeconds(t.spec) * 1000 }
        }
      }
      return targets.length
    }

    function resetForRebirth(): void {
      let max = 0
      for (const appr of apprentices.value) max = Math.max(max, appr.bond)
      rebirthKarma.value = max >= REBIRTH_KARMA_CAP ? REBIRTH_KARMA_CAP : 0
      apprentices.value = []

      // Reset tông môn cho kiếp mới (kiếp mới cần tu luyện lên Kim Đan để khai sơn lập phái lại)
      sectCreated.value = false
      sectName.value = 'Vân Ẩn Tông'
      doctrineId.value = 'natural'
      foundedMonth.value = 0
      sectLevel.value = 1
      disciples.value = []
      pendingApplicant.value = null
      pendingApplicants.value = []
      processedApplicantIds.value = []
      libraryGongfaIds.value = []
      activeQuests.value = []
      completedQuestHistory.value = []
      lastTournamentMonth.value = 0
      tournamentHistory.value = []
      history.value = []
      lastProcessedMonth.value = 0
      vassalSects.value = []
      worldSects.value = createInitialWorldSects()
      lastWarYear.value = 0
      lastPromotionMonth.value = 0
      tributeHistory.value = []
      warHistory.value = []
      masterId.value = 'player'
      playerIsAncestor.value = false
      sectLevelPowerBenchmarks.value = {}
      pendingWarDeclaration.value = null
      overlordSectId.value = null
      lastInvasionMonth.value = 0
      sectVault.value = createEmptySectVault()
      autoDispatchQuests.value = false
      autoTowerChallenge.value = true
    }

    return {
      // Tông môn
      sectCreated,
      sectName,
      doctrineId,
      foundedMonth,
      sectLevel,
      disciples,
      pendingApplicant,
      pendingApplicants,
      processedApplicantIds,
      libraryGongfaIds,
      activeQuests,
      completedQuestHistory,
      lastTournamentMonth,
      tournamentHistory,
      history,
      lastProcessedMonth,
      vassalSects,
      worldSects,
      lastWarYear,
      lastPromotionMonth,
      tributeHistory,
      warHistory,
      masterId,
      playerIsAncestor,
      sectLevelPowerBenchmarks,
      pendingWarDeclaration,
      overlordSectId,
      lastInvasionMonth,
      sectVault,
      autoDispatchQuests,
      autoTowerChallenge,
      createSect,
      upgradeSectLevel,
      addHistoryEntry,
      acceptApplicant,
      rejectApplicant,
      acceptAllApplicants,
      rejectAllApplicants,
      promoteMember,
      demoteMember,
      abdicateToAncestor,
      declareWar,
      resolveWarOutcome,
      respondToWarDeclaration,
      rebelAgainstOverlord,
      purifyDemonicDisciple,
      expelDisciple,
      rewardDiscipleStones,
      rewardDiscipleItem,
      assignDiscipleToMentorAction,
      removeDiscipleFromMentorAction,
      assignElderSpecialtyAction,
      depositStoneToVault,
      withdrawStoneFromVault,
      depositHerbToVault,
      withdrawHerbFromVault,
      depositMaterialToVault,
      withdrawMaterialFromVault,
      depositPillToVault,
      withdrawPillFromVault,
      depositEquipmentToVault,
      withdrawEquipmentFromVault,
      assignQuest,
      autoDispatchQuestsAction,
      addGongfaToLibrary,
      addBatchGongfasToLibrary,
      teachGongfaToDisciple,
      challengeTower,
      autoChallengeTowerAction,
      exploreRealm,
      simulateMonthlySect,
      // Đạo đồng cũ tương thích
      apprentices,
      rebirthKarma,
      sanitize,
      sync,
      collectFinished,
      dispatch,
      dispatchAll,
      resetForRebirth,
      recruit
    }
  },
  { persist: persistConfig('apprentice') }
)

export const useSectStore = useApprenticeStore
