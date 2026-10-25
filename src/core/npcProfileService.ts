/**
 * Dịch Vụ Hồ Sơ Thuộc Tính NPC Toàn Cầu (Unified NPC Profile Service)
 *
 * Chuẩn hóa và tổng hợp dữ liệu chi tiết cho mọi đối tượng NPC trong thế giới:
 * - Đệ tử Tông môn người chơi
 * - Thành viên Tông môn thế giới / đối thủ
 * - NPC giang hồ / Tán tu / Đạo hữu bát phương
 * - Đạo lữ (tình duyên & chỉ số gắn kết)
 *
 * Tính toán thuần túy (pure calculation), không can thiệp store trực tiếp.
 */
import type { ElementId, GNum } from '@/types'
import { baseCombatStats } from './formulas'
import { aptitudeDef, APTITUDE_GRADE_META } from '@/data/aptitudes'
import { gongfaDef } from '@/data/gongfa'
import { REALMS } from '@/data/realms'
import { ELEMENTS } from '@/data/linggen'
import {
  displayGongfaName,
  displayRealmName,
  displayDaoluTemper,
  displayDaoluLean
} from '@/ui/displayZhVi'
import {
  TEMPER_NAMES,
  LEAN_NAMES,
  type DaoLean,
  type Temperament,
  type BondStage
} from '@/data/daolu'
import {
  SECT_RANK_NAMES,
  ELDER_SPECIALTY_DEFS,
  type DiscipleData,
  type SectMemberRank,
  type ElderSpecialty
} from '@/data/sect'
import { comprehensionRankText } from '@/data/npcGeneration'
import { toNum } from '@/utils/gnum'
import { buildNpcEquipmentOverview, type NpcEquipmentOverview } from './npcEquipmentService'
import { useApprenticeStore } from '@/stores/apprentice'

export interface StatBreakdown {
  base: number
  bonus: number
  total: number
}

export interface SkillProfile {
  name: string
  mult: number
  rate: number
  desc?: string
}

export interface GongfaProfile {
  id: string
  name: string
  quality: string
  type: string
  element?: ElementId
  desc: string
  minRealm: number
  minRealmName: string
  origin?: 'comprehended' | 'learned' | 'inherited'
  originLabel?: string
}

export interface AptitudeProfile {
  id: string
  name: string
  grade: number
  gradeName: string
  desc: string
  borderClass: string
  colorClass: string
}

export interface DaoluBondProfile {
  isDaolu: boolean
  stage: BondStage
  stageName: string
  fate: number
  trust: number
  accord: number
  intent: number
  intentWish?: string
  intentLine?: string
  shared: number
  fallen?: boolean
  departed?: boolean
}

export interface UnifiedNpcProfile {
  id: string
  name: string
  gender: 'male' | 'female'
  avatarIcon: string
  sectName: string
  sectRole: string
  rank?: SectMemberRank
  rankName?: string
  major: number
  sub: number
  realmName: string
  expPct: number
  status: 'idle' | 'quest' | 'cultivating' | 'injured' | 'bottleneck' | 'demonic' | 'deceased'
  statusText: string

  // Thuộc tính & chiến lực thực tế
  combatPower: number
  atk: StatBreakdown
  def: StatBreakdown
  hp: StatBreakdown
  speed: StatBreakdown
  critRate: StatBreakdown

  // Khảo sát trang bị cá nhân
  equipOverview?: NpcEquipmentOverview

  // Chức danh chuyên môn & Sư đồ
  elderSpecialty?: ElderSpecialty
  elderSpecialtyTitle?: string
  mentorElderId?: string
  mentorElderName?: string
  mentoredCount?: number

  // Công pháp & Kỹ năng
  activeGongfa?: GongfaProfile
  learnedGongfas: GongfaProfile[]
  skills: SkillProfile[]

  // Tư chất & Linh căn
  element: ElementId
  elementName: string
  elementColor: string
  aptitudes: AptitudeProfile[]
  comprehension: number
  comprehensionRank: { label: string; colorClass: string }
  temper: Temperament
  temperName: string
  lean: DaoLean
  leanName: string
  brief: string
  pursuit: string
  taboo: string

  // Quan hệ & Đạo lữ
  relationType: 'stranger' | 'friend' | 'daolu' | 'mentor' | 'apprentice' | 'sibling' | 'disciple' | 'elder'
  relationLabel: string
  favor: number
  daoluBond?: DaoluBondProfile
}

export interface NpcProfileInput {
  id: string
  name: string
  gender: 'male' | 'female'
  element?: ElementId
  major: number
  sub?: number
  expPct?: number
  comprehension?: number
  aptitudes?: string[]
  temper?: Temperament
  lean?: DaoLean
  brief?: string
  pursuit?: string
  taboo?: string
  status?: 'idle' | 'quest' | 'cultivating' | 'injured' | 'bottleneck' | 'demonic' | 'deceased'
  rank?: SectMemberRank
  sectName?: string
  sectRole?: string
  activeGongfa?: string
  learnedGongfa?: string[]
  gongfaOrigins?: Record<string, 'comprehended' | 'learned' | 'inherited'>
  elderSpecialty?: ElderSpecialty
  mentorElderId?: string
  mentoredCount?: number
  relationType?: 'stranger' | 'friend' | 'daolu' | 'mentor' | 'apprentice' | 'sibling' | 'disciple' | 'elder'
  favor?: number
  daoluBond?: DaoluBondProfile
}

function safeGNumToNumber(g: GNum): number {
  if (g.e > 308) return 1e308
  return toNum(g)
}

/**
 * Xây dựng UnifiedNpcProfile từ dữ liệu đầu vào chuẩn hóa
 */
export function buildUnifiedNpcProfile(input: NpcProfileInput): UnifiedNpcProfile {
  const major = Math.max(0, input.major)
  const sub = Math.min(8, Math.max(0, input.sub ?? 0))
  const expPct = Math.min(100, Math.max(0, input.expPct ?? 0))
  const comprehension = Math.max(1, Math.min(100, input.comprehension ?? 60))
  const element = input.element ?? 'metal'
  const temper = input.temper ?? 'cautious'
  const lean = input.lean ?? 'longevity'
  const aptIds = input.aptitudes ?? []
  const status = input.status ?? 'idle'

  // 1. Tính toán base stats từ cảnh giới
  const baseStats = baseCombatStats(major, sub)
  const baseAtkNum = safeGNumToNumber(baseStats.attack)
  const baseDefNum = safeGNumToNumber(baseStats.defense)
  const baseHpNum = safeGNumToNumber(baseStats.maxHp)
  const baseSpd = 25 + major * 8 + sub * 2

  // 2. Thu thập modifiers từ tư chất và công pháp
  let atkPct = 0
  let defPct = 0
  let hpPct = 0
  let spdBonus = 0
  let critBonus = 0.05 // 5% cơ bản

  const aptitudeProfiles: AptitudeProfile[] = []
  for (const aptId of aptIds) {
    const def = aptitudeDef(aptId)
    if (!def) continue
    const meta = APTITUDE_GRADE_META[def.grade]
    aptitudeProfiles.push({
      id: def.id,
      name: def.name,
      grade: def.grade,
      gradeName: meta.name,
      desc: def.desc,
      borderClass: meta.borderClass,
      colorClass: meta.textClass
    })

    if (def.mods) {
      if (typeof def.mods.attackPct === 'number') atkPct += def.mods.attackPct
      if (typeof def.mods.defensePct === 'number') defPct += def.mods.defensePct
      if (typeof def.mods.maxHpPct === 'number') hpPct += def.mods.maxHpPct
      if (typeof def.mods.speed === 'number') spdBonus += def.mods.speed
      if (typeof def.mods.critRate === 'number') critBonus += def.mods.critRate
    }
  }

  // Công pháp chủ tu & đã học
  const learnedProfiles: GongfaProfile[] = []
  let activeGfProfile: GongfaProfile | undefined
  const learnedIds = input.learnedGongfa ?? (input.activeGongfa ? [input.activeGongfa] : [])

  for (const gId of learnedIds) {
    const gf = gongfaDef(gId)
    if (!gf) continue
    const origin = input.gongfaOrigins?.[gId] || 'learned'
    const originLabel = origin === 'comprehended' ? 'Tự Ngộ' : origin === 'inherited' ? 'Chân Truyền' : 'Thụ Giáo'
    const prof: GongfaProfile = {
      id: gf.id,
      name: displayGongfaName(gf.name),
      quality: gf.quality,
      type: gf.type,
      element: gf.element,
      desc: gf.desc,
      minRealm: gf.minRealm,
      minRealmName: REALMS[gf.minRealm]?.name ?? 'Luyện Khí',
      origin,
      originLabel
    }
    learnedProfiles.push(prof)
    if (gId === input.activeGongfa) {
      activeGfProfile = prof
    }
  }

  if (!activeGfProfile && learnedProfiles.length > 0) {
    activeGfProfile = learnedProfiles[0]
  }

  if (activeGfProfile) {
    const gf = gongfaDef(activeGfProfile.id)
    if (gf?.baseMods) {
      if (typeof gf.baseMods.attackPct === 'number') atkPct += gf.baseMods.attackPct
      if (typeof gf.baseMods.defensePct === 'number') defPct += gf.baseMods.defensePct
      if (typeof gf.baseMods.maxHpPct === 'number') hpPct += gf.baseMods.maxHpPct
      if (typeof gf.baseMods.speed === 'number') spdBonus += gf.baseMods.speed
      if (typeof gf.baseMods.critRate === 'number') critBonus += gf.baseMods.critRate
    }
  }

  // 3. Khảo sát và tính toán trang bị cá nhân
  const equipOverview = buildNpcEquipmentOverview(input.id, major, sub, element)

  // 4. Tính toán giá trị breakdown (kết hợp công pháp, tư chất và trang bị)
  const equipAtkBonus = equipOverview.statsWithEquip.atk - equipOverview.statsWithoutEquip.atk
  const totalAtk = Math.floor(baseAtkNum * (1 + atkPct)) + equipAtkBonus
  const bonusAtk = totalAtk - Math.floor(baseAtkNum)

  const equipDefBonus = equipOverview.statsWithEquip.def - equipOverview.statsWithoutEquip.def
  const totalDef = Math.floor(baseDefNum * (1 + defPct)) + equipDefBonus
  const bonusDef = totalDef - Math.floor(baseDefNum)

  const equipHpBonus = equipOverview.statsWithEquip.hp - equipOverview.statsWithoutEquip.hp
  const totalHp = Math.floor(baseHpNum * (1 + hpPct)) + equipHpBonus
  const bonusHp = totalHp - Math.floor(baseHpNum)

  const equipSpdBonus = equipOverview.statsWithEquip.speed - equipOverview.statsWithoutEquip.speed
  const totalSpd = Math.max(10, Math.floor(baseSpd + spdBonus)) + equipSpdBonus
  const bonusSpd = totalSpd - baseSpd

  const equipCritBonus = (equipOverview.statsWithEquip.critRate - equipOverview.statsWithoutEquip.critRate) / 100
  const totalCrit = Math.min(1.0, Math.max(0.05, critBonus + equipCritBonus))

  // 5. Kỹ năng chiến đấu
  const skills: SkillProfile[] = [
    {
      name: 'Phổ Thông Công Kích',
      mult: 1.0,
      rate: 1.0,
      desc: 'Chiêu thức công kích cơ bản dựa trên quyền cước binh khí.'
    }
  ]

  if (activeGfProfile) {
    const gf = gongfaDef(activeGfProfile.id)
    if (gf) {
      skills.push({
        name: activeGfProfile.name,
        mult: 1.35 + (gf.minRealm || 0) * 0.15,
        rate: 0.45,
        desc: `Tuyệt kỹ vận hành từ ${activeGfProfile.name}, bộc phát uy lực kinh người.`
      })
    }
  }

  // 6. Điểm chiến lực cá nhân
  const rankMult =
    input.rank === 'ancestor' ? 2.5 :
    input.rank === 'master' ? 2.0 :
    input.rank === 'vice_master' ? 1.85 :
    input.rank === 'guardian' ? 1.7 :
    input.rank === 'elder' ? 1.5 :
    input.rank === 'true' ? 1.3 :
    input.rank === 'inner' ? 1.15 : 1.0

  const individualCombatPower = Math.max(
    50,
    Math.floor((totalAtk * 1.5 + totalDef * 1.2 + totalHp * 0.1 + totalSpd * 0.5) * rankMult)
  )

  // 7. Chức danh chuyên môn & Sư đồ
  let mentorElderName: string | undefined
  if (input.mentorElderId) {
    try {
      const sect = useApprenticeStore()
      mentorElderName = sect.disciples.find(d => d.id === input.mentorElderId)?.name
    } catch {
      // Pinia not active
    }
  }
  const elderSpecialtyTitle = input.elderSpecialty ? ELDER_SPECIALTY_DEFS[input.elderSpecialty]?.title : undefined

  // 8. Trạng thái & văn bản
  const statusTexts: Record<UnifiedNpcProfile['status'], string> = {
    idle: 'Thanh nhàn (Chưa có phân công)',
    quest: 'Đang chấp hành nhiệm vụ tông môn',
    cultivating: 'Bế quan khổ tu tích lũy chân nguyên',
    bottleneck: 'Gặp bình cảnh cảnh giới cần ngộ đạo',
    injured: 'Thụ thương kinh mạch cần tịnh dưỡng',
    demonic: 'Nhập ma (Ma khí công tâm điên loạn)',
    deceased: 'Đã ngã xuống (Đạo tiêu thân vẫn)'
  }

  // 9. Quan hệ
  const relLabels: Record<UnifiedNpcProfile['relationType'], string> = {
    daolu: 'Đạo Lữ Đồng Hành',
    mentor: 'Tôn Sư (Sư Phụ)',
    apprentice: 'Môn Đồ (Đồ Đệ)',
    sibling: 'Đạo Huynh / Đạo Đệ',
    disciple: 'Môn Hạ Đệ Tử',
    elder: 'Trưởng Lão Tông Môn',
    friend: 'Chí Giao Hảo Hữu',
    stranger: 'Tán Tu Bát Phương'
  }

  const realmDef = REALMS[major]
  const realmName = `${displayRealmName(realmDef?.name ?? 'Luyện Khí')} · Tầng ${sub + 1}`

  const elemMeta = ELEMENTS[element] ?? ELEMENTS.metal

  return {
    id: input.id,
    name: input.name,
    gender: input.gender,
    avatarIcon: input.gender === 'female' ? 'user-check' : 'user',
    sectName: input.sectName || 'Tán Tu',
    sectRole: input.sectRole || (input.rank ? SECT_RANK_NAMES[input.rank] : 'Tu sĩ'),
    rank: input.rank,
    rankName: input.rank ? SECT_RANK_NAMES[input.rank] : undefined,
    major,
    sub,
    realmName,
    expPct,
    status,
    statusText: statusTexts[status] ?? 'Nhàn rỗi',
    combatPower: individualCombatPower,
    atk: { base: Math.floor(baseAtkNum), bonus: bonusAtk, total: totalAtk },
    def: { base: Math.floor(baseDefNum), bonus: bonusDef, total: totalDef },
    hp: { base: Math.floor(baseHpNum), bonus: bonusHp, total: totalHp },
    speed: { base: baseSpd, bonus: bonusSpd, total: totalSpd },
    critRate: { base: 5, bonus: Math.round((totalCrit - 0.05) * 100), total: Math.round(totalCrit * 100) },
    equipOverview,
    elderSpecialty: input.elderSpecialty,
    elderSpecialtyTitle,
    mentorElderId: input.mentorElderId,
    mentorElderName,
    mentoredCount: input.mentoredCount,
    activeGongfa: activeGfProfile,
    learnedGongfas: learnedProfiles,
    skills,
    element,
    elementName: elemMeta.name,
    elementColor: elemMeta.color,
    aptitudes: aptitudeProfiles,
    comprehension,
    comprehensionRank: comprehensionRankText(comprehension),
    temper,
    temperName: displayDaoluTemper(TEMPER_NAMES[temper] ?? temper),
    lean,
    leanName: displayDaoluLean(LEAN_NAMES[lean] ?? lean),
    brief: input.brief || 'Tu sĩ độc hành truy cầu đại đạo trường sinh.',
    pursuit: input.pursuit || 'Đột phá bình cảnh, cầu chứng trường sinh.',
    taboo: input.taboo || 'Bội nghĩa phản đạo, tổn hại môn quy.',
    relationType: input.relationType || (input.rank ? 'disciple' : 'stranger'),
    relationLabel: relLabels[input.relationType || (input.rank ? 'disciple' : 'stranger')] ?? 'Đạo hữu',
    favor: input.favor ?? 0,
    daoluBond: input.daoluBond
  }
}

/**
 * Adapter chuyển đổi DiscipleData sang UnifiedNpcProfile
 */
export function discipleToUnifiedProfile(
  disciple: DiscipleData,
  sectName: string,
  relationType: UnifiedNpcProfile['relationType'] = 'disciple',
  favor: number = 50
): UnifiedNpcProfile {
  return buildUnifiedNpcProfile({
    id: disciple.id,
    name: disciple.name,
    gender: disciple.gender,
    element: disciple.element,
    major: disciple.major,
    sub: disciple.sub,
    expPct: disciple.expPct,
    comprehension: disciple.comprehension,
    aptitudes: disciple.aptitudes,
    temper: disciple.temper,
    lean: disciple.lean,
    status: disciple.status,
    rank: disciple.rank,
    sectName,
    sectRole: SECT_RANK_NAMES[disciple.rank] ?? 'Đệ Tử',
    activeGongfa: disciple.activeGongfa,
    learnedGongfa: disciple.learnedGongfa,
    gongfaOrigins: disciple.gongfaOrigins,
    elderSpecialty: disciple.elderSpecialty,
    mentorElderId: disciple.mentorElderId,
    mentoredCount: disciple.mentoredDiscipleIds?.length ?? 0,
    relationType,
    favor
  })
}

/**
 * Chuyển đổi an toàn đối tượng ý đồ đạo lữ (BondIntent) thành % số nguyên (0..100)
 */
export function extractIntentPercent(intent: unknown): number {
  if (typeof intent === 'number' && Number.isFinite(intent)) {
    return Math.max(0, Math.min(100, Math.round(intent)))
  }
  if (intent && typeof intent === 'object' && 'ripeness' in (intent as Record<string, unknown>)) {
    const r = (intent as { ripeness?: number }).ripeness
    return typeof r === 'number' && Number.isFinite(r) ? Math.max(0, Math.min(100, Math.round(r * 100))) : 0
  }
  return 0
}
