/**
 * Dữ Liệu Tông Môn & Hệ Thống Đệ Tử (Sect & Disciple System Data)
 *
 * Khai báo tĩnh, thuần dữ liệu, không tác dụng phụ (zero side-effect):
 * - Điều kiện kiến tạo Tông môn (Kim Đan Kỳ major >= 2)
 * - Tông chỉ môn phái (Doctrines)
 * - Bản mẫu Nhiệm vụ Tông môn (Nhiệm Vụ Đường)
 * - Cấu hình Tháp Lịch Luyện
 * - Bí cảnh Tông môn
 * - Các kiểu dữ liệu cốt lõi của Tông môn
 */
import type { ElementId, EquipmentInstance } from '@/types'
import type { DaoLean, Temperament } from './daolu'
import type { NpcTierRank } from './npc'
import { qualityDef } from './qualities'
import { pillDef, pillRank } from './pills'

/** Cảnh giới tối thiểu để khai sơn lập phái: Kim Đan Kỳ (major = 2) */
export const SECT_MIN_MAJOR = 2

/** Định nghĩa điều kiện thăng cấp Tông môn */
export interface SectLevelDef {
  level: number
  name: string
  minMajor: number
  costStone: number
  desc: string
}

export const SECT_LEVEL_DEFS: Record<number, SectLevelDef> = {
  1: {
    level: 1,
    name: 'Sơ Khai Sơn Môn (Cấp 1)',
    minMajor: 2, // Kim Đan
    costStone: 0,
    desc: 'Tông môn mới lập, môn quy sơ định, uy danh truyền khắp một phương.'
  },
  2: {
    level: 2,
    name: 'Danh Chấn Nhất Phương (Cấp 2)',
    minMajor: 3, // Nguyên Anh
    costStone: 50000,
    desc: 'Tông môn hưng thịnh, đệ tử tụ hội, bắt đầu mở rộng thế lực.'
  },
  3: {
    level: 3,
    name: 'Thiên Cổ Đại Tông (Cấp 3)',
    minMajor: 6, // Hợp Thể
    costStone: 200000,
    desc: 'Tông môn hùng cứ nhất châu, danh liệt cự phách tu chân giới.'
  },
  4: {
    level: 4,
    name: 'Bất Hủ Thánh Địa (Cấp 4)',
    minMajor: 8, // Độ Kiếp
    costStone: 1000000,
    desc: 'Khí vận hưng thịnh ngút trời, vượt qua thiên kiếp, uy vọng thiên hạ quy tâm.'
  },
  5: {
    level: 5,
    name: 'Vạn Cổ Tiên Môn (Cấp 5)',
    minMajor: 9, // Chân Tiên
    costStone: 5000000,
    desc: 'Đạo thống vạn cổ trường tồn, siêu thoát nhân gian giới, phi thăng tiên giới.'
  }
}

/** Cấp bậc nhân sự trong Tông Môn */
export type SectMemberRank =
  | 'outer'        // Ngoại môn đệ tử
  | 'inner'        // Nội môn đệ tử
  | 'true'         // Chân truyền đệ tử
  | 'elder'        // Trưởng lão
  | 'guardian'     // Hộ Pháp
  | 'vice_master'  // Phó tông chủ
  | 'master'       // Tông chủ
  | 'ancestor'     // Lão tổ

export const SECT_RANK_NAMES: Record<SectMemberRank, string> = {
  outer: 'Ngoại Môn Đệ Tử',
  inner: 'Nội Môn Đệ Tử',
  true: 'Chân Truyền Đệ Tử',
  elder: 'Trưởng Lão',
  guardian: 'Hộ Pháp',
  vice_master: 'Phó Tông Chủ',
  master: 'Tông Chủ',
  ancestor: 'Lão Tổ'
}

export interface SectRankCaps {
  outer: number
  inner: number
  elder: number
  guardian: number
  vice_master: number
  master: number
  ancestor: number
}

/** Giới hạn số lượng nhân sự theo cấp bậc Tông Môn */
export const SECT_LEVEL_CAPS: Record<number, SectRankCaps> = {
  1: { outer: 10, inner: 5, elder: 2, guardian: 1, vice_master: 1, master: 1, ancestor: 1 },
  2: { outer: 30, inner: 10, elder: 3, guardian: 2, vice_master: 1, master: 1, ancestor: 2 },
  3: { outer: 40, inner: 20, elder: 4, guardian: 4, vice_master: 1, master: 1, ancestor: 3 },
  4: { outer: 50, inner: 30, elder: 5, guardian: 5, vice_master: 1, master: 1, ancestor: 4 },
  5: { outer: 60, inner: 40, elder: 6, guardian: 6, vice_master: 2, master: 1, ancestor: 5 }
}

/** Số lượng đệ tử chân truyền tối đa mà mỗi Trưởng lão có thể quản lý */
export const MAX_TRUE_DISCIPLES_PER_ELDER = 2

/** Tính giới hạn Chân truyền đệ tử dựa theo số Trưởng lão thực tế */
export function getTrueDisciplesCap(elderCount: number): number {
  return Math.max(0, elderCount) * MAX_TRUE_DISCIPLES_PER_ELDER
}

/** Tông chỉ tu hành của Tông môn */
export interface SectDoctrineDef {
  id: string
  name: string
  desc: string
  favoredElement: ElementId
  bonusDesc: string
}

export const SECT_DOCTRINES: readonly SectDoctrineDef[] = [
  {
    id: 'sword',
    name: 'Kiếm Xuất Phong Lôi',
    desc: 'Lấy ngự kiếm sát phạt làm căn cơ, tâm như gương sáng, một kiếm trảm phá vạn kiếp yêu ma.',
    favoredElement: 'metal',
    bonusDesc: 'Đệ tử tăng thêm uy lực công kích và tốc độ khiêu chiến'
  },
  {
    id: 'alchemy',
    name: 'Đan Tâm Tế Thế',
    desc: 'Học thông dược lý, luyện đan cứu người, cứu độ thương sinh, tích lũy công đức vô lượng.',
    favoredElement: 'wood',
    bonusDesc: 'Tăng sản lượng linh thảo và đan dược khi đệ tử làm nhiệm vụ'
  },
  {
    id: 'natural',
    name: 'Thanh Tĩnh Vô Vi',
    desc: 'Đạo pháp tự nhiên, tâm không vướng bận hồng trần, thuận theo ý trời tìm cầu đại đạo trường sinh.',
    favoredElement: 'water',
    bonusDesc: 'Đệ tử tăng tốc độ tích lũy tu vi và giảm tỷ lệ tẩu hỏa nhập ma'
  },
  {
    id: 'forge',
    name: 'Liệt Diễm Rèn Đúc',
    desc: 'Nung nấu kim thạch trong thần hỏa, tôi rèn pháp bảo thần binh chấn động cửu thiên bát hoang.',
    favoredElement: 'fire',
    bonusDesc: 'Đệ tử thu thập thêm huyền thiết, khoáng thạch quý hiếm'
  },
  {
    id: 'unity',
    name: 'Vạn Pháp Quy Nhất',
    desc: 'Dung hợp tinh hoa chư phái, dày công tích lũy, đạo cơ vững vàng như bàn thạch càn khôn.',
    favoredElement: 'earth',
    bonusDesc: 'Tăng toàn diện phòng ngự và tỷ lệ vượt ải Tháp Lịch Luyện'
  }
]

export function sectDoctrineDef(id: string): SectDoctrineDef | undefined {
  return SECT_DOCTRINES.find(d => d.id === id)
}

/** Cấu trúc dữ liệu một đệ tử chính thức */
export interface DiscipleData {
  id: string
  name: string
  gender: 'male' | 'female'
  element: ElementId
  major: number       // 0: Luyện Khí, 1: Trúc Cơ, 2: Kim Đan...
  sub: number         // 0..8 (Tầng 1..9)
  expPct: number      // 0..100% tu vi của tiểu cảnh giới
  comprehension: number // 30..100
  aptitudes: string[]
  temper: Temperament
  lean: DaoLean
  tierRank: NpcTierRank
  joinedMonth: number
  status: 'idle' | 'quest' | 'cultivating' | 'injured' | 'bottleneck' | 'demonic' | 'deceased'
  assignedQuestId?: string
  learnedGongfa: string[]
  activeGongfa?: string
  towerFloor: number  // Tầng tháp đã vượt
  totalContributions: number
  contributionPoints?: number // Điểm cống hiến khả dụng để đổi đồ kho tông môn
  equippedItems?: EquipmentInstance[] // Trang bị đệ tử đổi từ kho tông môn đang mặc
  rank: SectMemberRank
  battlesWon?: number
  promotedMonth?: number
  mentorElderId?: string
  /** Danh sách đệ tử trực thuộc dưới trướng (dành cho Trưởng lão, Hộ pháp, Phó tông chủ, tối đa 10 người) */
  mentoredDiscipleIds?: string[]
  /** Chức danh chuyên môn của Trưởng lão (Đan Các, Luyện Khí Các, Chấp Sự, Truyền Công, Hình Phạt, Ngoại Vụ) */
  elderSpecialty?: ElderSpecialty
  /** Túi đồ / kho trang bị cá nhân của đệ tử (các món đang sở hữu nhưng chưa mặc) */
  inventoryItems?: EquipmentInstance[]
  /** Đan dược cá nhân trong túi đồ của đệ tử */
  bagPills?: Record<string, number>
  /** Linh thạch cá nhân đệ tử tích lũy được */
  bagStones?: number
  /** Nguyên liệu / Thảo dược / Khoáng thạch đệ tử thu thập được */
  bagMaterials?: { ore?: number; herb?: number }
  /** Danh sách các công pháp tự đốn ngộ ra */
  comprehendedGongfa?: string[]
  /** Nguồn gốc từng công pháp đã học */
  gongfaOrigins?: Record<string, 'comprehended' | 'learned' | 'inherited'>
  deathCause?: string
  deathMonth?: number
}

/** Chức danh chuyên môn của Trưởng lão */
export type ElderSpecialty = 'dan' | 'craft' | 'affairs' | 'arts' | 'discipline' | 'external'

export interface ElderSpecialtyDef {
  id: ElderSpecialty
  name: string
  title: string
  desc: string
  bonusDesc: string
  icon: string
}

export const ELDER_SPECIALTY_DEFS: Record<ElderSpecialty, ElderSpecialtyDef> = {
  dan: {
    id: 'dan',
    name: 'Đan Các',
    title: 'Trưởng Lão Đan Các',
    desc: 'Phụ trách đan phòng, dược điền, nghiên cứu đan phương và luyện chế linh đan.',
    bonusDesc: 'Đệ tử dưới trướng tăng mạnh hiệu quả đan dược, giảm 50% thời gian nghẽn bình cảnh.',
    icon: 'flame'
  },
  craft: {
    id: 'craft',
    name: 'Luyện Khí Các',
    title: 'Trưởng Lão Luyện Khí Các',
    desc: 'Phụ trách lò rèn, luyện khí và chế tác trang bị, pháp bảo tông môn.',
    bonusDesc: 'Đệ tử dưới trướng được gia tăng 20% chỉ số trang bị, có cơ hội nhận bảo khí từ sư phụ.',
    icon: 'hammer'
  },
  affairs: {
    id: 'affairs',
    name: 'Chấp Sự',
    title: 'Trưởng Lão Chấp Sự',
    desc: 'Điều phối sự vụ, quản lý phân công đệ tử và giám sát nhiệm vụ trong tông.',
    bonusDesc: 'Đệ tử dưới trướng tăng 50% điểm cống hiến nhiệm vụ hàng tháng, thi hành sự vụ nhanh chóng.',
    icon: 'scroll'
  },
  arts: {
    id: 'arts',
    name: 'Truyền Công',
    title: 'Trưởng Lão Truyền Công',
    desc: 'Chuyên trách truyền thụ tuyệt kỹ, chỉ đạo tu luyện và phá giải nút thắt công pháp.',
    bonusDesc: 'Đệ tử dưới trướng tăng 25% tốc độ tu vi, có cơ hội được truyền thụ công pháp của sư phụ.',
    icon: 'book-open'
  },
  discipline: {
    id: 'discipline',
    name: 'Hình Phạt',
    title: 'Trưởng Lão Hình Phạt',
    desc: 'Chấp chưởng thanh quy giới luật, trảm trừ ma tâm và duy trì trật tự môn phái.',
    bonusDesc: 'Đệ tử dưới trướng giảm 85% nguy cơ tâm ma phản phệ khi đột phá, tăng thủ ngự và kháng tính.',
    icon: 'shield'
  },
  external: {
    id: 'external',
    name: 'Ngoại Vụ',
    title: 'Trưởng Lão Ngoại Vụ',
    desc: 'Phụ trách bang giao, thám thính bí cảnh, giao thương và phát dương uy danh.',
    bonusDesc: 'Đệ tử dưới trướng tăng 15% thân pháp, nâng cao thực lực chiến đấu và lịch duyệt tháp.',
    icon: 'compass'
  }
}

/** Giới hạn tối đa đệ tử dưới trướng mỗi người hướng dẫn (Trưởng lão, Hộ pháp, Phó tông chủ) */
export const MAX_MENTORED_PER_MASTER = 10

/** Cấu trúc Kho Tông Môn (Sect Vault) */
export interface SectVault {
  stone: number
  herbs: Record<number, number> // 1..5 phẩm cấp linh thảo -> số lượng
  ores: number // Huyền thiết
  dust: number // Khí trần
  wudao: number // Ngộ đạo tàn thiên
  pills: Record<string, number> // pillId -> số lượng
  equipments: EquipmentInstance[] // Danh sách trang bị trong kho
}

export function createEmptySectVault(): SectVault {
  return {
    stone: 0,
    herbs: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    ores: 0,
    dust: 0,
    wudao: 0,
    pills: {},
    equipments: []
  }
}

/** Tính toán số điểm cống hiến cần để đổi 1 trang bị từ kho tông môn */
export function getEquipmentVaultCost(item: EquipmentInstance): number {
  const q = qualityDef(item.quality)
  const rank = q?.rank ?? 0
  return Math.max(15, Math.floor((rank + 1) * 20 + item.tier * 6 + (item.level || 0) * 2))
}

/** Tính toán số điểm cống hiến cần để đổi 1 viên đan dược từ kho tông môn */
export function getPillVaultCost(pillId: string): number {
  const def = pillDef(pillId)
  if (!def) return 20
  const rank = pillRank(def)
  return Math.max(15, Math.floor((rank + 1) * 25 + def.minRealm * 10))
}

/** Ứng viên xin nhập tông */
export interface ApplicantData {
  id: string
  name: string
  gender: 'male' | 'female'
  element: ElementId
  major: number       // Chỉ 0 (Luyện Khí) hoặc 1 (Trúc Cơ)
  sub: number         // 0..8
  comprehension: number
  aptitudes: string[]
  temper: Temperament
  lean: DaoLean
  tierRank: NpcTierRank
  appliedMonth: number
  brief: string
  pursuit: string
}

/** Bản mẫu nhiệm vụ Nhiệm Vụ Đường */
export type SectQuestType = 'herb' | 'ore' | 'subdue' | 'patrol' | 'explore' | 'alchemy'

export interface SectQuestTemplate {
  id: string
  name: string
  desc: string
  type: SectQuestType
  icon: string
  minMajor: number
  durationMonths: number
  difficulty: number // 1..5
  rewards: {
    stoneBase: number // Linh thạch cơ bản
    herbGrade?: number // Phẩm cấp dược liệu
    herbCount?: number
    oreCount?: number
    dustCount?: number
    wudaoCount?: number
    contribution: number
  }
}

export const SECT_QUEST_TEMPLATES: readonly SectQuestTemplate[] = [
  {
    id: 'sq_patrol_gate',
    name: 'Tuần Tra Sơn Môn',
    desc: 'Đi tuần tra chân núi tông môn, đề phòng dã thú quấy nhiễu và đệ tử tán tu tự tiện xông vào.',
    type: 'patrol',
    icon: 'shield',
    minMajor: 0,
    durationMonths: 1,
    difficulty: 1,
    rewards: { stoneBase: 500, contribution: 10 }
  },
  {
    id: 'sq_gather_herb',
    name: 'Hái Dược Dược Sơn',
    desc: 'Lên linh dược viên sau núi thu hái linh thảo thành thục đem nộp cho Tông môn đan phòng.',
    type: 'herb',
    icon: 'leaf',
    minMajor: 0,
    durationMonths: 1,
    difficulty: 1,
    rewards: { stoneBase: 600, herbGrade: 1, herbCount: 8, contribution: 15 }
  },
  {
    id: 'sq_mine_ore',
    name: 'Khai Khoáng Hậu Sơn',
    desc: 'Khai thác huyền thiết và linh quáng tại quáng mạch chân núi phục vụ luyện khí đường.',
    type: 'ore',
    icon: 'mountain',
    minMajor: 0,
    durationMonths: 1,
    difficulty: 1,
    rewards: { stoneBase: 800, oreCount: 6, dustCount: 3, contribution: 15 }
  },
  {
    id: 'sq_subdue_beast',
    name: 'Thanh Trừng Yêu Thú',
    desc: 'Sơn cốc lân cận xuất hiện yêu thú làm loạn, tiến đến trảm sát để giữ bình yên cho nhân gian.',
    type: 'subdue',
    icon: 'swords',
    minMajor: 1,
    durationMonths: 1,
    difficulty: 2,
    rewards: { stoneBase: 2500, dustCount: 8, contribution: 25 }
  },
  {
    id: 'sq_ancient_ruin',
    name: 'Khám Phá Cổ Tích',
    desc: 'Thám thính một di chỉ tiền nhân mới xuất thế ở ngoài trăm dặm, tìm kiếm cổ thư và cơ duyên.',
    type: 'explore',
    icon: 'scroll',
    minMajor: 1,
    durationMonths: 2,
    difficulty: 3,
    rewards: { stoneBase: 5000, wudaoCount: 6, contribution: 40 }
  },
  {
    id: 'sq_high_alchemy',
    name: 'Luyện Chế Tông Đan',
    desc: 'Hỗ trợ khai lò luyện chế một mẻ đan dược phụ trợ tông môn bồi dưỡng đệ tử thế hệ mới.',
    type: 'alchemy',
    icon: 'flame',
    minMajor: 1,
    durationMonths: 1,
    difficulty: 2,
    rewards: { stoneBase: 3500, wudaoCount: 4, contribution: 30 }
  },
  {
    id: 'sq_demon_hunt',
    name: 'Trừ Ma Vệ Đạo',
    desc: 'Tiễu trừ tà tu tác quái tại các thôn trấn phụ thuộc tông môn, bảo vệ uy danh chính đạo.',
    type: 'subdue',
    icon: 'zap',
    minMajor: 2,
    durationMonths: 2,
    difficulty: 4,
    rewards: { stoneBase: 15000, wudaoCount: 12, contribution: 60 }
  }
]

export function sectQuestTemplate(id: string): SectQuestTemplate | undefined {
  return SECT_QUEST_TEMPLATES.find(q => q.id === id)
}

/** Nhiệm vụ đang trong tiến trình */
export interface ActiveSectQuest {
  uid: string
  templateId: string
  assignedDiscipleId: string
  startMonth: number
  finishMonth: number
  status: 'in_progress' | 'completed' | 'failed'
}

/** Kết quả nhiệm vụ hoàn thành */
export interface CompletedQuestRecord {
  uid: string
  templateId: string
  discipleId: string
  finishMonth: number
  success: boolean
  spoilsSummary: string
}

/** Bản ghi một kỳ Tỉ Thí Tông Môn */
export interface TournamentRankResult {
  rank: number
  discipleId: string
  discipleName: string
  major: number
  sub: number
  rewardSummary: string
  division?: 'true' | 'inner' | 'outer'
  divisionName?: string
}

/** Phân bảng thi đấu: Ngoại môn vs Ngoại môn, Nội môn vs Nội môn, Chân truyền vs Chân truyền */
export interface TournamentDivisionResult {
  division: 'true' | 'inner' | 'outer'
  divisionName: string
  participantsCount: number
  winnerName?: string
  rankings: TournamentRankResult[]
}

export interface TournamentRecord {
  id: string
  tournamentIndex: number
  gameMonth: number
  year: number
  month: number
  participantsCount: number
  winnerName: string
  divisions?: TournamentDivisionResult[]
  rankings: TournamentRankResult[]
}

/** Bản ghi lịch sử Tông Môn Sử */
export type SectEventCategory =
  | 'personnel'      // Nhân sự: Nhập tông, từ chối, rời tông...
  | 'cultivation'    // Tu luyện: Đột phá, lĩnh ngộ...
  | 'quest'          // Nhiệm vụ: Giao phó, hoàn thành, thất bại...
  | 'tournament'     // Tỉ thí: Kết quả thi đấu, quán quân...
  | 'tower'          // Tháp lịch luyện: Vượt tầng...
  | 'realm'          // Bí cảnh: Cơ duyên, thu hoạch, biến cố...
  | 'management'     // Quản lý: Kiến tạo, nạp công pháp, thăng cấp tông môn, nhường ngôi...
  | 'promotion'      // Xét duyệt thăng cấp chức vụ
  | 'war'            // Tông môn khiêu chiến & chiến tranh
  | 'vassal'         // Thu phục tông môn phụ thuộc
  | 'tribute'        // Cống nộp tài nguyên
  | 'special'        // Kỳ ngộ, biến cố đặc biệt...

export interface SectHistoryEntry {
  id: string
  gameMonth: number
  year: number
  month: number
  category: SectEventCategory
  discipleId?: string
  discipleName?: string
  summary: string
}

/** Dữ liệu Tông Môn Thế Giới (World Sect) */
export interface WorldSectData {
  id: string
  name: string
  level: number          // 1..5
  leaderName: string
  leaderMajor: number    // Cảnh giới của Tông chủ đối thủ
  memberCount: number    // Số lượng nhân sự
  combatPower: number    // Tổng lực chiến thực tế
  doctrine: string       // Tông chỉ
  element: ElementId
  desc: string
  status: 'active' | 'destroyed' | 'vassal'
  resources: {
    stone: number
    ore: number
    herb: number
    pills: number
  }
  members?: DiscipleData[] // Toàn bộ nhân sự thực tế của môn phái
  majorGongfas?: string[] // Các môn công pháp, tuyệt kỹ chủ tu
}

/** Thông tin Tông môn đối thủ chủ động khiêu chiến */
export interface PendingWarDeclaration {
  sectId: string
  sectName: string
  sectLevel: number
  combatPower: number
  declaredMonth: number
}

export const INITIAL_WORLD_SECTS: readonly WorldSectData[] = [
  // ================= CẤP 1 (KIM ĐAN KỲ) =================
  {
    id: 'ws_van_doc',
    name: 'Vạn Độc Môn',
    level: 1,
    leaderName: 'Độc Cô Tiêu',
    leaderMajor: 2, // Kim Đan
    memberCount: 15,
    combatPower: 8500,
    doctrine: 'Độc Đạo Hóa Cốt',
    element: 'wood',
    desc: 'Ẩn mình trong u cốc ngập tràn chướng khí, giỏi dùng độc cổ và ám khí đoạt mệnh.',
    status: 'active',
    resources: { stone: 20000, ore: 50, herb: 120, pills: 20 },
    majorGongfas: ['m_qingyun', 's_shield_wood']
  },
  {
    id: 'ws_thiet_kiem',
    name: 'Thiết Kiếm Môn',
    level: 1,
    leaderName: 'Nhạc Bất Phàm',
    leaderMajor: 2, // Kim Đan
    memberCount: 18,
    combatPower: 9200,
    doctrine: 'Thiết Kiếm Trảm Yêu',
    element: 'metal',
    desc: 'Lấy kiếm thuật chính tông cương mãnh làm trọng, đệ tử thiện chiến dũng mãnh.',
    status: 'active',
    resources: { stone: 25000, ore: 100, herb: 40, pills: 15 },
    majorGongfas: ['m_taixuan', 's_shield_metal']
  },
  {
    id: 'ws_thanh_moc',
    name: 'Thanh Mộc Tông',
    level: 1,
    leaderName: 'Mộc Thần Tử',
    leaderMajor: 2, // Kim Đan
    memberCount: 16,
    combatPower: 8800,
    doctrine: 'Thanh Mộc Trường Sinh',
    element: 'wood',
    desc: 'Tu luyện trường sinh mộc pháp, hộ sơn linh thụ che chở vạn mẫu linh điền.',
    status: 'active',
    resources: { stone: 22000, ore: 40, herb: 150, pills: 25 },
    majorGongfas: ['m_qingyun', 's_shield_wood']
  },
  {
    id: 'ws_xich_diem',
    name: 'Xích Diễm Phái',
    level: 1,
    leaderName: 'Liệt Diễm Thượng Nhân',
    leaderMajor: 2, // Kim Đan
    memberCount: 17,
    combatPower: 9000,
    doctrine: 'Xích Diễm Đốt Trời',
    element: 'fire',
    desc: 'Tọa lạc bên hỏa diệm sơn mạch, môn nhân tính tình cương liệt nóng nảy.',
    status: 'active',
    resources: { stone: 24000, ore: 90, herb: 60, pills: 18 },
    majorGongfas: ['m_taixuan', 's_shield_fire']
  },
  {
    id: 'ws_qingyun',
    name: 'Thanh Vân Tông',
    level: 1,
    leaderName: 'Phong Lăng Chân Nhân',
    leaderMajor: 2, // Kim Đan
    memberCount: 18,
    combatPower: 9100,
    doctrine: 'Kiếm Xuất Phong Lôi',
    element: 'wind',
    desc: 'Đệ nhất huyền môn chính đạo của Vân Châu, lấy ngự kiếm phi thăng làm gốc.',
    status: 'active',
    resources: { stone: 23000, ore: 80, herb: 80, pills: 22 },
    majorGongfas: ['m_qingyun', 's_shield_wood']
  },
  {
    id: 'ws_danxia',
    name: 'Đan Hà Cốc',
    level: 1,
    leaderName: 'Dược Vương Lão Nhân',
    leaderMajor: 2, // Kim Đan
    memberCount: 15,
    combatPower: 8600,
    doctrine: 'Đan Đạo Tế Thế',
    element: 'wood',
    desc: 'Nơi tập hợp các đan sư và y tu thiên hạ, chuyên nghiên cứu linh dược thảo mộc.',
    status: 'active',
    resources: { stone: 26000, ore: 40, herb: 180, pills: 35 },
    majorGongfas: ['m_qingyun', 's_shield_wood']
  },

  // ================= CẤP 2 (NGUYÊN ANH KỲ) =================
  {
    id: 'ws_cuu_loi',
    name: 'Cửu Lôi Các',
    level: 2,
    leaderName: 'Lôi Chấn Tử',
    leaderMajor: 3, // Nguyên Anh
    memberCount: 35,
    combatPower: 38000,
    doctrine: 'Cửu Thiên Thần Lôi, chính khí trừ tà',
    element: 'fire',
    desc: 'Ngự trên đỉnh Phong Lôi Lĩnh, tu luyện Lôi Cương chính khí, bá đạo vô song.',
    status: 'active',
    resources: { stone: 80000, ore: 200, herb: 150, pills: 45 },
    majorGongfas: ['m_taixuan', 's_shield_fire']
  },
  {
    id: 'ws_than_dao',
    name: 'Thần Đao Môn',
    level: 2,
    leaderName: 'Đao Hoàng Lãnh Tuyệt',
    leaderMajor: 3, // Nguyên Anh
    memberCount: 32,
    combatPower: 36500,
    doctrine: 'Bá Đao Tuyệt Sát, vô kiên bất tồi',
    element: 'metal',
    desc: 'Đao cương sắc bén trảm phá hư không, một đao đoạn thủy, uy chấn giang hồ.',
    status: 'active',
    resources: { stone: 85000, ore: 250, herb: 120, pills: 40 },
    majorGongfas: ['m_taixuan', 's_shield_metal']
  },
  {
    id: 'ws_bang_phach',
    name: 'Băng Phách Cốc',
    level: 2,
    leaderName: 'Hàn Sương Tiên Tử',
    leaderMajor: 3, // Nguyên Anh
    memberCount: 30,
    combatPower: 37200,
    doctrine: 'Hàn Băng Thấu Xương, minh tâm băng phách',
    element: 'water',
    desc: 'Cốc sâu phủ đầy băng tuyết vạn năm, đệ tử toàn tâm tu luyện hàn băng tuyệt kỹ.',
    status: 'active',
    resources: { stone: 90000, ore: 180, herb: 200, pills: 50 },
    majorGongfas: ['m_qingyun', 's_shield_water']
  },
  {
    id: 'ws_jianshan',
    name: 'Vạn Kiếm Sơn',
    level: 2,
    leaderName: 'Kiếm Thập Tam',
    leaderMajor: 3, // Nguyên Anh
    memberCount: 34,
    combatPower: 38500,
    doctrine: 'Vạn vật giai vi kiếm, một kiếm định càn khôn',
    element: 'metal',
    desc: 'Kiếm các sừng sững giữa trời, kiếm tu sát phạt quyết đoán chấn nhiếp bát phương.',
    status: 'active',
    resources: { stone: 88000, ore: 260, herb: 110, pills: 42 },
    majorGongfas: ['m_taixuan', 's_shield_metal']
  },
  {
    id: 'ws_tianhuo',
    name: 'Thiên Hỏa Môn',
    level: 2,
    leaderName: 'Hỏa Linh Thần Quân',
    leaderMajor: 3, // Nguyên Anh
    memberCount: 33,
    combatPower: 37800,
    doctrine: 'Lửa thiêu cặn bã, rèn đúc thần binh',
    element: 'fire',
    desc: 'Tụ tập các đại sư luyện khí hàng đầu, lô đỉnh hỏa diễm vạn năm không tắt.',
    status: 'active',
    resources: { stone: 92000, ore: 280, herb: 130, pills: 48 },
    majorGongfas: ['m_taixuan', 's_shield_fire']
  },

  // ================= CẤP 3 (HỢP THỂ KỲ) =================
  {
    id: 'ws_huyet_sat',
    name: 'Huyết Sát Tông',
    level: 3,
    leaderName: 'Huyết Ma Lão Tổ',
    leaderMajor: 6, // Hợp Thể
    memberCount: 55,
    combatPower: 165000,
    doctrine: 'Huyết Hải Vô Biên, sát phạt đoạn tuyệt',
    element: 'water',
    desc: 'Ma đạo cự phách chấn nhiếp một phương, chuyên tu luyện huyết sát công pháp hung bạo.',
    status: 'active',
    resources: { stone: 300000, ore: 600, herb: 500, pills: 120 },
    majorGongfas: ['m_qingyun', 's_shield_water']
  },
  {
    id: 'ws_tianji',
    name: 'Thiên Cơ Các',
    level: 3,
    leaderName: 'Thiên Cơ Tử',
    leaderMajor: 6, // Hợp Thể
    memberCount: 54,
    combatPower: 166000,
    doctrine: 'Biết trước thiên số, tìm đạo trong hư vô',
    element: 'water',
    desc: 'Thông tường thiên cơ địa lý, trận pháp và suy diễn số mệnh kỳ tài xuất chúng.',
    status: 'active',
    resources: { stone: 420000, ore: 620, herb: 680, pills: 160 },
    majorGongfas: ['m_taixuan', 's_shield_water']
  },
  {
    id: 'ws_xuanming',
    name: 'Huyền Minh Giáo',
    level: 3,
    leaderName: 'Huyền Minh Thượng Sư',
    leaderMajor: 6, // Hợp Thể
    memberCount: 53,
    combatPower: 169000,
    doctrine: 'Hàn cốt ngưng sương, minh tâm kiến tính',
    element: 'water',
    desc: 'Tọa trấn nơi hàn đàm sâu thẳm, âm hàn đạo pháp thấu triệt cốt tủy.',
    status: 'active',
    resources: { stone: 390000, ore: 700, herb: 520, pills: 140 },
    majorGongfas: ['m_qingyun', 's_shield_water']
  },

  // ================= CẤP 4 (ĐỘ KIẾP KỲ) =================
  {
    id: 'ws_wuji',
    name: 'Vô Cực Tông',
    level: 4,
    leaderName: 'Vô Cực Thánh Hoàng',
    leaderMajor: 8, // Độ Kiếp
    memberCount: 78,
    combatPower: 595000,
    doctrine: 'Thanh tĩnh vô vi, vạn pháp quy nhất',
    element: 'earth',
    desc: 'Cổ tông truyền thừa từ thái cổ, chủ trương đạo pháp tự nhiên, cầu trường sinh cửu thị.',
    status: 'active',
    resources: { stone: 1400000, ore: 1800, herb: 1900, pills: 400 },
    majorGongfas: ['m_taixuan', 's_shield_earth']
  },
  {
    id: 'ws_thien_am',
    name: 'Thiên Âm Tự',
    level: 4,
    leaderName: 'Phổ Trí Đại Sư',
    leaderMajor: 8, // Độ Kiếp
    memberCount: 80,
    combatPower: 580000,
    doctrine: 'Phật Môn Kim Cang, phổ độ hữu duyên',
    element: 'earth',
    desc: 'Cổ sát ngàn năm, phật quang chiếu rọi, đệ tử kim thân bất toái, từ bi phổ độ.',
    status: 'active',
    resources: { stone: 1200000, ore: 1500, herb: 2000, pills: 350 },
    majorGongfas: ['m_taixuan', 's_shield_earth']
  },
  {
    id: 'ws_tu_tieu',
    name: 'Tử Tiêu Cung',
    level: 4,
    leaderName: 'Tử Tiêu Chân Nhân',
    leaderMajor: 8, // Độ Kiếp
    memberCount: 82,
    combatPower: 610000,
    doctrine: 'Tử Khí Đông Lai, thần tiêu ngự lôi',
    element: 'fire',
    desc: 'Cung điện lơ lửng trên chín tầng trời mây tía, tử lôi oanh thiên sát phạt bá đạo.',
    status: 'active',
    resources: { stone: 1500000, ore: 2000, herb: 1800, pills: 420 },
    majorGongfas: ['m_taixuan', 's_shield_fire']
  },
  {
    id: 'ws_thien_yeu',
    name: 'Thiên Yêu Khuyết',
    level: 4,
    leaderName: 'Yêu Hoàng Vạn Tượng',
    leaderMajor: 8, // Độ Kiếp
    memberCount: 85,
    combatPower: 620000,
    doctrine: 'Thượng Cổ Yêu Thần, tôn sùng cường giả',
    element: 'chaos',
    desc: 'Lãnh địa yêu tộc hùng mạnh nhất nhân gian, nhục thân bất tử, sức mạnh khai sơn đoạn hải.',
    status: 'active',
    resources: { stone: 1300000, ore: 2200, herb: 2400, pills: 300 },
    majorGongfas: ['m_taixuan', 's_shield_metal']
  },
  {
    id: 'ws_daochi',
    name: 'Dao Trì Tiên Cung',
    level: 4,
    leaderName: 'Dao Trì Thánh Mẫu',
    leaderMajor: 8, // Độ Kiếp
    memberCount: 80,
    combatPower: 615000,
    doctrine: 'Dao Trì Tiên Vận, ngọc cốt băng cơ',
    element: 'water',
    desc: 'Cung điện ngọc bích chốn tiên sơn mây phủ, thánh khiết trang nghiêm không vướng bụi trần.',
    status: 'active',
    resources: { stone: 1450000, ore: 1700, herb: 2200, pills: 450 },
    majorGongfas: ['m_qingyun', 's_shield_water']
  },
  {
    id: 'ws_yujing',
    name: 'Ngọc Kinh Tiên Tông',
    level: 4,
    leaderName: 'Ngọc Kinh Đạo Tổ',
    leaderMajor: 8, // Độ Kiếp
    memberCount: 84,
    combatPower: 625000,
    doctrine: 'Ngọc Kinh Hạo Khí, quang diệu chư thiên',
    element: 'metal',
    desc: 'Ngọc Kinh thành cổ uy nghiêm tráng lệ, ngưng tụ hạo nhiên chính khí bảo hộ thương sinh.',
    status: 'active',
    resources: { stone: 1550000, ore: 2100, herb: 1950, pills: 430 },
    majorGongfas: ['m_taixuan', 's_shield_metal']
  },

  // ================= CẤP 5 (CHÂN TIÊN KỲ) =================
  {
    id: 'ws_thai_hu',
    name: 'Thái Hư Tiên Cung',
    level: 5,
    leaderName: 'Thái Hư Đạo Quân',
    leaderMajor: 9, // Chân Tiên
    memberCount: 120,
    combatPower: 2200000,
    doctrine: 'Thái Hư Hóa Cực, diễn hóa đại đạo',
    element: 'chaos',
    desc: 'Thánh địa đệ nhất nhân gian giới, có tiên nhân tọa trấn, danh vang cửu thiên thập địa.',
    status: 'active',
    resources: { stone: 5000000, ore: 5000, herb: 6000, pills: 1000 },
    majorGongfas: ['m_taixuan', 's_shield_metal']
  },
  {
    id: 'ws_van_than',
    name: 'Vạn Thần Điện',
    level: 5,
    leaderName: 'Vạn Thần Chi Chủ',
    leaderMajor: 9, // Chân Tiên
    memberCount: 125,
    combatPower: 2350000,
    doctrine: 'Vạn Thần Quy Tông, thần uy cái thế',
    element: 'earth',
    desc: 'Thánh điện tối cao của Thần Giới, vạn thần tề tựu, pháp tắc ngưng tụ trấn áp bát hoang.',
    status: 'active',
    resources: { stone: 6500000, ore: 5800, herb: 6600, pills: 1350 },
    majorGongfas: ['m_taixuan', 's_shield_metal']
  },
  {
    id: 'ws_hon_don',
    name: 'Hỗn Độn Tiên Tông',
    level: 5,
    leaderName: 'Hỗn Độn Lão Tổ',
    leaderMajor: 9, // Chân Tiên
    memberCount: 115,
    combatPower: 2250000,
    doctrine: 'Hỗn Độn Vô Cực, vạn đạo quy nguyên',
    element: 'chaos',
    desc: 'Đạo thống khai thiên tịch địa lưu truyền, diễn hóa vạn vật, siêu thoát luân hồi.',
    status: 'active',
    resources: { stone: 5500000, ore: 5500, herb: 5800, pills: 1100 },
    majorGongfas: ['m_taixuan', 's_shield_earth']
  },
  {
    id: 'ws_luan_hoi',
    name: 'Luân Hồi Điện',
    level: 5,
    leaderName: 'Luân Hồi Minh Chủ',
    leaderMajor: 9, // Chân Tiên
    memberCount: 118,
    combatPower: 2300000,
    doctrine: 'Chưởng Khống Luân Hồi, sinh tử nhất niệm',
    element: 'chaos',
    desc: 'Thần bí điện phủ nắm giữ luân hồi chi lực, hiểu thấu sinh tử huyền cơ vạn kiếp.',
    status: 'active',
    resources: { stone: 6000000, ore: 5200, herb: 6200, pills: 1200 },
    majorGongfas: ['m_taixuan', 's_shield_water']
  },
  {
    id: 'ws_van_co',
    name: 'Vạn Cổ Tiên Đình',
    level: 5,
    leaderName: 'Tiên Hoàng Vạn Thế',
    leaderMajor: 9, // Chân Tiên
    memberCount: 130,
    combatPower: 2400000,
    doctrine: 'Thống Ngự Chư Thiên, vạn cổ bất hủ',
    element: 'chaos',
    desc: 'Thế lực chí cao vô thượng, thiên binh vạn mã, quần hùng quy phục, tiên uy vạn trượng.',
    status: 'active',
    resources: { stone: 7000000, ore: 6000, herb: 7000, pills: 1500 },
    majorGongfas: ['m_taixuan', 's_shield_metal']
  }
]

/**
 * Hàm khởi tạo bản sao độc lập (deep clone) của Tông Môn Thế Giới,
 * tránh rò rỉ đột biến dữ liệu giữa các phiên chơi hoặc giữa các test case.
 */
export function createInitialWorldSects(): WorldSectData[] {
  return INITIAL_WORLD_SECTS.map(ws => ({
    ...ws,
    resources: { ...ws.resources },
    majorGongfas: ws.majorGongfas ? [...ws.majorGongfas] : ['m_taixuan'],
    members: ws.members ? ws.members.map(m => ({ ...m, aptitudes: [...m.aptitudes], learnedGongfa: [...m.learnedGongfa] })) : undefined
  }))
}

/** Dữ liệu Tông Môn Phụ Thuộc (Vassal Sect) */
export interface VassalSectData {
  id: string
  name: string
  level: number
  vassalSinceMonth: number
  leaderName: string
  status: 'active' | 'destroyed'
  lastTributeMonth: number
  totalTributesPaid: number
  totalDeficitCount: number
}

export interface VassalTributeRate {
  stone: number
  ore: number
  herb: number
  pills: number
}

/** Định mức cống nộp tài nguyên hằng tháng theo cấp bậc Tông Môn Phụ Thuộc */
export const VASSAL_TRIBUTE_CONFIG: Record<number, VassalTributeRate> = {
  1: { stone: 2000, ore: 5, herb: 10, pills: 2 },
  2: { stone: 6000, ore: 15, herb: 25, pills: 5 },
  3: { stone: 20000, ore: 40, herb: 60, pills: 12 },
  4: { stone: 60000, ore: 100, herb: 150, pills: 30 },
  5: { stone: 180000, ore: 250, herb: 400, pills: 80 }
}

/** Lịch sử cống nộp tài nguyên */
export interface TributeRecord {
  id: string
  gameMonth: number
  year: number
  month: number
  vassalId: string
  vassalName: string
  stone: number
  ore: number
  herb: number
  pills: number
  success: boolean
  isDeficit: boolean
  note: string
}

/** Bản ghi Chiến Tranh / Khiêu Chiến Tông Môn */
export interface SectWarRecord {
  id: string
  gameMonth: number
  year: number
  month: number
  opponentId: string
  opponentName: string
  isPlayerAttacker: boolean
  ancestorParticipated: boolean
  playerCombatPower: number
  opponentCombatPower: number
  won: boolean
  outcome?: 'destroy' | 'vassalize'
  spoilsSummary: string
}

/** Định nghĩa Bí Cảnh Tông Môn */
export interface SectSecretRealmDef {
  id: string
  name: string
  brief: string
  minMajor: number
  favoredElement: ElementId
  difficulty: number
  costStone: number
  desc: string
}

export const SECT_SECRET_REALMS: readonly SectSecretRealmDef[] = [
  {
    id: 'sr_van_an',
    name: 'Vân Ẩn Huyễn Cảnh',
    brief: 'Huyễn cảnh hư thực đan xen ẩn sâu trong sơn mạch, thích hợp cho đệ tử sơ nhập rèn luyện tâm tính.',
    minMajor: 0,
    favoredElement: 'wind',
    difficulty: 1,
    costStone: 2000,
    desc: 'Nơi đệ tử Luyện Khí có thể mài giũa chiến ý và thu thập sương sớm linh khí.'
  },
  {
    id: 'sr_thien_hoa',
    name: 'Thiên Hỏa Cổ Động',
    brief: 'Hang động dung nham ngầm dưới lòng đất, dồi dào địa hỏa chi tinh và yêu thú hỏa hệ.',
    minMajor: 1,
    favoredElement: 'fire',
    difficulty: 2,
    costStone: 10000,
    desc: 'Lửa thiêu tôi luyện ý chí, chứa đựng nhiều khoáng thạch dung hỏa quý hiếm.'
  },
  {
    id: 'sr_thai_so',
    name: 'Thái Sơ Tiên Quật',
    brief: 'Cổ động từ thời thái sơ lưu lại trận pháp cấm chế, giấu kín truyền thừa của cổ tu sĩ.',
    minMajor: 2,
    favoredElement: 'chaos',
    difficulty: 3,
    costStone: 50000,
    desc: 'Chỉ đệ tử Kim Đan Kỳ mới đủ thực lực khám phá trọn vẹn, cơ duyên ngộ đạo vô cùng to lớn.'
  }
]

export function sectSecretRealmDef(id: string): SectSecretRealmDef | undefined {
  return SECT_SECRET_REALMS.find(r => r.id === id)
}

/**
 * Đổi số tháng game tích lũy sang dạng Năm X, Tháng Y
 */
export function gameMonthToCalendar(gameMonth: number): { year: number; month: number } {
  const m = Math.max(1, Math.floor(gameMonth))
  const year = Math.floor((m - 1) / 12) + 1
  const month = ((m - 1) % 12) + 1
  return { year, month }
}

/**
 * Định dạng chuỗi ngày tháng theo phong cách tu chân
 */
export function formatSectDate(gameMonth: number): string {
  const { year, month } = gameMonthToCalendar(gameMonth)
  return `Tháng ${month}, năm thứ ${year}`
}
