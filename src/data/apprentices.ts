/**
 * 收徒 —— 后台游历的 idle 层(Phase 42:新增可玩性第二条)
 *
 * 坊市让灵石有了销处;收徒则让「人」也成了资源:你收的弟子会离线跑腿,
 * 采药、采矿、历练、寻宝、修习,按墙钟走工,归来带回资材。玩家不动手,
 * 东西也在长 —— 与挂机修炼互补、不抢轮次。
 *
 * 静态原型与任务调参在这里;派发/结算/产出在 core/apprenticeService。
 */
import type { QualityId } from '@/types'

/** 弟子跑腿的任务门类 */
export type ApprenticeSpec = 'herb' | 'ore' | 'adventure' | 'seek' | 'study'

export interface ApprenticeTaskDef {
  spec: ApprenticeSpec
  /** 门类名 */
  name: string
  icon: string
  /** 一趟耗时(秒,真实时间;离线照算) */
  seconds: number
  desc: string
}

export const APPRENTICE_TASKS: ApprenticeTaskDef[] = [
  { spec: 'herb', name: 'Hái Linh Dược', icon: 'leaf', seconds: 1800, desc: 'Lên núi hái linh thảo, mang về dược viên động phủ' },
  { spec: 'ore', name: 'Khai Khoáng Mạch', icon: 'mountain', seconds: 1800, desc: 'Đào một mỏ khoáng nhỏ, mang huyền thiết về' },
  { spec: 'adventure', name: 'Lịch Luyện', icon: 'swords', seconds: 2700, desc: 'Xuống núi lịch luyện, kiếm linh thạch, mài giũa kiến thức' },
  { spec: 'seek', name: 'Tìm Cơ Duyên', icon: 'gem', seconds: 3600, desc: 'Bốn phương tìm kiếm, mong cầu cơ duyên đan dược' },
  { spec: 'study', name: 'Tham Ngộ', icon: 'book', seconds: 5400, desc: 'Tĩnh tọa tham ngộ, bồi đắp điểm ngộ đạo cho đạo cơ' }
]

export function taskDef(spec: ApprenticeSpec): ApprenticeTaskDef {
  return APPRENTICE_TASKS.find(t => t.spec === spec)!
}

export interface ApprenticeArchetype {
  id: string
  name: string
  quality: QualityId
  /** 天赋门类 —— 该门产出 ×TALENT_BONUS */
  talent: ApprenticeSpec
  desc: string
}

function a(id: string, name: string, quality: QualityId, talent: ApprenticeSpec, desc: string): ApprenticeArchetype {
  return { id, name, quality, talent, desc }
}

export const APPRENTICES: ApprenticeArchetype[] = [
  a('ap_luanniao', 'Thái Dược Đồng Tử', 'mortal', 'herb', 'Xuất thân sơn dã, hiểu rõ các loài linh thảo trong núi'),
  a('ap_kuangtou', 'Khai Khoáng Tráng Hán', 'mortal', 'ore', 'Thân thể cường tráng, một cuốc một chuẩn xác'),
  a('ap_youxia', 'Du Hiệp Thiếu Niên', 'fine', 'adventure', 'Cầm kiếm xuống núi, chuyên tâm lịch luyện'),
  a('ap_lingtong', 'Tầm Bảo Linh Đồng', 'fine', 'seek', 'Trời sinh khứu giác tìm bảo vật'),
  a('ap_daotong', 'Ngộ Đạo Đạo Đồng', 'excellent', 'study', 'Tâm tĩnh như nước, giỏi suy ngẫm huyền lý'),
  a('ap_xiantong', 'Tiên Môn Tuệ Đồng', 'spirit', 'study', 'Căn cốt thanh kỳ, một học thông trăm')
]

const BY_ID = new Map(APPRENTICES.map(x => [x.id, x]))
export function apprenticeDef(id: string): ApprenticeArchetype | undefined {
  return BY_ID.get(id)
}

/** 开局白送的入门弟子 */
export const STARTER_APPRENTICE = 'ap_lingtong'

/** 弟子等级上限 */
export const APPRENTICE_MAX_LEVEL = 20
/** 天赋门类产出加成 */
export const APPRENTICE_TALENT_BONUS = 1.25
/** 收一名道童的灵石价(以 tier 折算)。展示与实扣同读这一份 —— 只改一处,不会报价≠实扣 */
export const RECRUIT_COST_TIER_AMOUNT = 30

/** 弟子槽位随境界增长:1 起,每 4 境 +1,顶到 5 */
export function apprenticeSlots(major: number): number {
  return Math.min(5, 1 + Math.floor(Math.max(0, major) / 4))
}

/** 各尽其长 · 目标水位(存栏使 score=1 的参考;导演口径 040/030/030/030/010) */
export type DispatchNeedResource = 'herb' | 'ore' | 'wudao' | 'dust' | 'seek'
export const DISPATCH_NEED_TARGET: Record<DispatchNeedResource, number> = {
  herb: 40,
  ore: 30,
  wudao: 30,
  dust: 30,
  // seek 以「丹药总存量」为稀缺代理;水位最低 → 谷有余时才去寻宝补丹(点缀,非主力)
  seek: 10
}
/** 历练的固定兜底分:低于任一资源的短缺分 —— 皆有余时才去历练挣灵石 */
export const DISPATCH_ADVENTURE_FIXED_SCORE = 0.25

/** 羁绊位阶(道童称谓)—— 纯命名/flavor,不给产出/时长加成;按累计完工趟数阈值 */
export interface BondTitle {
  min: number
  name: string
}
export const BOND_TITLES: BondTitle[] = [
  { min: 0, name: 'Đạo Đồng' },
  { min: 10, name: 'Đạo Bộc' },
  { min: 30, name: 'Đạo Đồ' },
  { min: 60, name: 'Ký Danh Đệ Tử' },
  { min: 100, name: 'Chân Truyền' }
]
/** 由累计完工趟数取位阶称谓 */
export function bondTitle(bond: number): string {
  let name = BOND_TITLES[0]!.name
  for (const t of BOND_TITLES) {
    if (bond >= t.min) name = t.name
  }
  return name
}
