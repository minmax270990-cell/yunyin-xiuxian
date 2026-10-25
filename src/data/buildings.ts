/** 洞府建筑 —— 7 座,长线成长 */
import type { BuildingDef, BuildingId, StatMods } from '@/types'
import { FIELD_HERB_PER_HOUR, FIELD_ORE_PER_HOUR, FORGE_LEVEL_PER_CAP, LIBRARY_WUDAO_PER_HOUR, OFFLINE_CAP_HOURS } from './constants'
import { fieldGradeCap } from './herbGrades'

/** 聚灵阵每级抬高的灵气上限(乘在境界容量上,不进 StatMods)。文案与 dongfu.qiCapMult 都读它。 */
export const ARRAY_QI_CAP_PER_LEVEL = 0.08
/** 灵兽园每级放大灵兽词条。文案与 dongfu.beastMult 都读它。 */
export const BEAST_EFFECT_PER_LEVEL = 0.1

const HERB_GRADE_VN: Record<number, string> = {
  1: 'Phàm phẩm',
  2: 'Linh phẩm',
  3: 'Tiên phẩm',
  4: 'Thần phẩm',
  5: 'Đạo phẩm'
}

export const BUILDINGS: BuildingDef[] = [
  {
    id: 'mansion',
    name: 'Động Phủ',
    desc: 'Nơi ở tức đạo tràng. Đẳng cấp động phủ quyết định giới hạn lợi ích offline, và ảnh hưởng tới giới hạn cấp bậc của các kiến trúc khác',
    icon: 'home',
    maxLevel: 4,
    unlockRealm: 0,
    costBase: 200,
    costOre: 20,
    effectText: lv => `Giới hạn lợi ích offline ${OFFLINE_CAP_HOURS[Math.min(lv, OFFLINE_CAP_HOURS.length - 1)]} giờ; Động phủ mỗi thăng 1 cấp giới hạn cấp bậc kiến trúc khác +5, các kiến trúc còn có giới hạn phẩm loại riêng`,
    mods: (lv): StatMods => ({ cultivationSpeed: lv * 0.04 })
  },
  {
    id: 'array',
    name: 'Tụ Linh Trận',
    desc: 'Hội tụ linh khí trời đất, tẩm bổ động phủ',
    icon: 'wind',
    maxLevel: 20,
    unlockRealm: 0,
    costBase: 60,
    costOre: 6,
    effectText: lv => `Giới hạn linh khí +${Math.round(lv * ARRAY_QI_CAP_PER_LEVEL * 100)}%`,
    mods: (lv): StatMods => ({ qiRegen: lv * 0.1, cultivationSpeed: lv * 0.03 })
  },
  {
    id: 'alchemy',
    name: 'Luyện Đan Lô',
    desc: 'Khai lò luyện đan, lấy dược trợ đạo',
    icon: 'flame',
    maxLevel: 10,
    unlockRealm: 0,
    costBase: 100,
    costOre: 10,
    // Phase 32.3: recipes are not gated by furnace level. The stove only
    // adds alchemyYield (second-pill chance); success still comes from lore.
    effectText: () => 'Chỉ tăng xác suất thành đan đôi, thành hay bại trông vào hiểu biết của ngươi',
    mods: (lv): StatMods => ({ alchemyYield: lv * 0.05 })
  },
  {
    id: 'forge',
    name: 'Luyện Khí Đài',
    desc: 'Rèn đúc cường hóa, điểm đá thành vàng',
    icon: 'hammer',
    maxLevel: 10,
    unlockRealm: 1,
    costBase: 150,
    costOre: 15,
    effectText: lv => `Giới hạn cường hóa +${Math.floor(lv / FORGE_LEVEL_PER_CAP)}`,
    mods: (lv): StatMods => ({ forgeDiscount: lv * 0.04 })
  },
  {
    id: 'field',
    name: 'Linh Điền',
    desc: 'Xuân gieo một hạt giống, thu gặt vạn linh cơ',
    icon: 'sprout',
    maxLevel: 15,
    unlockRealm: 0,
    costBase: 80,
    costOre: 8,
    effectText: lv =>
      `Mỗi giờ sản xuất linh thảo ${(lv * FIELD_HERB_PER_HOUR).toFixed(0)} cây (phẩm cấp cảnh giới hiện tại hoặc cao hơn 1 bậc, điền mãn có thể trồng ${HERB_GRADE_VN[fieldGradeCap(lv)]}), huyền thiết ${(lv * FIELD_ORE_PER_HOUR).toFixed(1)} khối`
  },
  {
    id: 'library',
    name: 'Tàng Kinh Các',
    desc: 'Chứa hết đạo tàng trong thiên hạ, tham ngộ chân ý bên trong',
    icon: 'book',
    maxLevel: 21,
    unlockRealm: 1,
    costBase: 120,
    costOre: 12,
    // 钻研丹方是藏经阁的第三桩职能(见 core/loreService.ts studyTick),不写出来玩家无从得知
    effectText: lv =>
      `Mỗi giờ sản xuất Điểm Ngộ Đạo ${(lv * LIBRARY_WUDAO_PER_HOUR).toFixed(1)}, ô phụ tu ${1 + Math.floor(lv / 3)} ô; ngày đêm lật giở, đọc thuần thục đan phương trong tay, tìm ra phương thuốc mới`,
    mods: (lv): StatMods => ({ expGain: lv * 0.03 })
  },
  {
    id: 'beast',
    name: 'Linh Thú Viên',
    desc: 'Thuần dưỡng linh thú, bầu bạn cùng đạo',
    icon: 'paw',
    maxLevel: 8,
    unlockRealm: 2,
    costBase: 300,
    costOre: 30,
    effectText: lv => `Có thể thuần dưỡng linh thú, hiệu quả thuộc tính linh thú +${Math.round(lv * BEAST_EFFECT_PER_LEVEL * 100)}%`
  }
]

const BY_ID = new Map(BUILDINGS.map(x => [x.id, x]))

export function buildingDef(id: BuildingId): BuildingDef | undefined {
  return BY_ID.get(id)
}
