/**
 * Hệ thống Địa Giới & Khu Vực Tu Tiên (Cultivation Domains & Areas)
 *
 * Cấu trúc phân cấp 4 tầng:
 *   Thế Giới (World: mortal / immortal / god / chaos)
 *     ↓
 *   Địa Giới (Domain: 13 Đại Cương Vực)
 *     ↓
 *   Khu Vực (Area / Region: 44 Địa danh tương thích 1:1 với REGIONS)
 *     ↓
 *   Quần thể NPC, Sự kiện & Kỳ ngộ theo địa phương
 */
import type { WorldId } from '@/types'
import type { SectId } from './npc'
import { REGIONS } from './regions'
import { REGION_NAME_MAP } from '@/ui/displayMappings'

/** Cấu trúc một Địa Giới tu tiên */
export interface DomainDef {
  id: string
  name: string
  worldId: WorldId
  desc: string
  startMajor: number
  endMajor: number
  regionIds: readonly string[]
}

/** Cấu trúc chi tiết một Khu Vực tu tiên */
export interface CultivationAreaDef {
  id: string
  name: string
  originalName: string
  domainId: string
  worldId: WorldId
  tier: number
  minRealm: number
  maxRealm: number
  danger: number
  desc: string
  features: string
  dominantSectId?: SectId
  goldNpcChance: number
  silverNpcChance: number
  specialAdvTags: readonly string[]
}

/** 13 Địa Giới trải dài qua 4 Thế Giới */
export const DOMAINS: readonly DomainDef[] = [
  // ---- Nhân Gian Giới (mortal) ----
  {
    id: 'dom_thanh_van',
    name: 'Thanh Vân Sơn Cảnh',
    worldId: 'mortal',
    desc: 'Dãy núi Thanh Vân quanh năm mây phủ, địa linh nhân kiệt, nơi khởi đầu của muôn vàn tiên duyên.',
    startMajor: 0,
    endMajor: 0,
    regionIds: ['qingyun', 'luoxia']
  },
  {
    id: 'dom_hac_phong',
    name: 'Hắc Phong Cương Vực',
    worldId: 'mortal',
    desc: 'Rừng rậm nguyên sinh râm ran yêu khí, hàn đàm u tịch, vạn yêu quy tụ.',
    startMajor: 1,
    endMajor: 1,
    regionIds: ['heifeng', 'hantan', 'wanyao']
  },
  {
    id: 'dom_co_chien',
    name: 'Cổ Chiến Hoang Vực',
    worldId: 'mortal',
    desc: 'Di tích chiến trường thượng cổ vương vấn sát khí, dung nham rực cháy ngày đêm.',
    startMajor: 2,
    endMajor: 2,
    regionIds: ['guzhanchang', 'chiyan']
  },
  {
    id: 'dom_u_minh',
    name: 'U Minh Thâm Vực',
    worldId: 'mortal',
    desc: 'Vùng biển đen tối tăm vô tận nối liền kiếm mộ vạn năm và đầm lầy chướng khí.',
    startMajor: 3,
    endMajor: 3,
    regionIds: ['youminghai', 'miwu', 'jianzhong']
  },
  {
    id: 'dom_con_lon',
    name: 'Côn Lôn Cực Cảnh',
    worldId: 'mortal',
    desc: 'Thánh sơn tuyết phủ vạn trượng cùng lôi trạch cuồn cuộn thiên kiếp sấm sét.',
    startMajor: 4,
    endMajor: 4,
    regionIds: ['leize', 'kunlun']
  },
  {
    id: 'dom_hoang_co',
    name: 'Hoang Cổ Di Cảnh',
    worldId: 'mortal',
    desc: 'Phế tích hoàng đình yêu tộc và cổ thành ngập trong cát vàng chôn vùi bí mật ngàn xưa.',
    startMajor: 5,
    endMajor: 5,
    regionIds: ['yaoting', 'chensha']
  },
  {
    id: 'dom_cuu_u',
    name: 'Cửu U Huyễn Cảnh',
    worldId: 'mortal',
    desc: 'Huyễn hải thực ảo khôn lường đan xen với ma uyên sâu thẳm.',
    startMajor: 6,
    endMajor: 6,
    regionIds: ['shenlou', 'moyuan']
  },
  {
    id: 'dom_tinh_van',
    name: 'Tinh Vẫn Thiên Cương',
    worldId: 'mortal',
    desc: 'Nơi sao trời rơi rụng, phá vỡ thiên mạc chạm tới hư không bên ngoài.',
    startMajor: 7,
    endMajor: 7,
    regionIds: ['xingyun', 'tianwaitian']
  },
  {
    id: 'dom_hong_mong_mortal',
    name: 'Hồng Mông Tiên Phủ',
    worldId: 'mortal',
    desc: 'Động phủ tiên nhân hóa đạo và vết rách sơ khai trước lúc phi thăng.',
    startMajor: 8,
    endMajor: 8,
    regionIds: ['xianfu', 'hongmeng']
  },

  // ---- Tiên Giới (immortal) ----
  {
    id: 'dom_van_hai_tien',
    name: 'Vân Hải Ngọc Kinh',
    worldId: 'immortal',
    desc: 'Tiên môn nguy nga sừng sững trên biển mây, tiên tinh rực rỡ, đạo vận thâm sâu.',
    startMajor: 9,
    endMajor: 10,
    regionIds: ['yunhai', 'zhexian', 'yujing', 'xingyuntai']
  },
  {
    id: 'dom_dieu_tri_tien',
    name: 'Dao Trì La Thiên',
    worldId: 'immortal',
    desc: 'Cung uyển Dao Trì tiên thụ kết quả, lôi trì Thái Ất và tinh hải mênh mang.',
    startMajor: 11,
    endMajor: 13,
    regionIds: ['yaochi', 'jinyuan', 'leichi', 'daochang', 'daluotian', 'xinghai']
  },

  // ---- Thần Giới (god) ----
  {
    id: 'dom_than_gioi',
    name: 'Thần Thánh Cương Vực',
    worldId: 'god',
    desc: 'Thần vực trang nghiêm nơi pháp tắc ngưng đọng, vạn thần tề tựu tại thiên cung.',
    startMajor: 14,
    endMajor: 17,
    regionIds: [
      'shenbian',
      'shenjihuang',
      'shenbingguan',
      'yunshenzhanchang',
      'shenwangdian',
      'wanshendian',
      'shendigong',
      'diquetianjie'
    ]
  },

  // ---- Hỗn Độn Hải (chaos) ----
  {
    id: 'dom_hon_don',
    name: 'Hỗn Độn Đạo Nguyên',
    worldId: 'chaos',
    desc: 'Vạn đạo quy nguyên, thời không chưa phân định, nơi khởi nguồn và tận cùng của đại đạo.',
    startMajor: 18,
    endMajor: 20,
    regionIds: ['hundunbin', 'youtan', 'shenmoyuan', 'guji', 'hongmengbenyuan', 'wudaoya']
  }
]

/** Đặc điểm phong thủy và môn phái của từng khu vực */
const AREA_METADATA: Record<
  string,
  {
    features: string
    dominantSectId?: SectId
    goldNpcChance: number
    silverNpcChance: number
    specialAdvTags: string[]
  }
> = {
  qingyun: {
    features: 'Linh khí ôn hòa thuần chính, thích hợp ngưng khí dưỡng tâm',
    dominantSectId: 'qingyun',
    goldNpcChance: 0.03,
    silverNpcChance: 0.15,
    specialAdvTags: ['sword', 'general']
  },
  luoxia: {
    features: 'Hoàng hôn rực rỡ, linh thảo sinh trưởng tốt tươi nơi sườn thung lũng',
    dominantSectId: 'danxia',
    goldNpcChance: 0.03,
    silverNpcChance: 0.18,
    specialAdvTags: ['herb', 'alchemy']
  },
  heifeng: {
    features: 'Hắc phong thấu xương, mài giũa thể phách và ý chí kiên định',
    dominantSectId: 'thietkiem',
    goldNpcChance: 0.04,
    silverNpcChance: 0.2,
    specialAdvTags: ['peril', 'battle']
  },
  hantan: {
    features: 'Hàn khí thấu tủy, đầm sâu tĩnh lặng chứa đựng thủy linh u uất',
    dominantSectId: 'xuanming',
    goldNpcChance: 0.05,
    silverNpcChance: 0.22,
    specialAdvTags: ['water', 'treasure']
  },
  wanyao: {
    features: 'Yêu khí dày đặc, cây cổ thụ che trời, nhiều linh thú kỳ dị cư ngụ',
    dominantSectId: 'thanhmoc',
    goldNpcChance: 0.05,
    silverNpcChance: 0.22,
    specialAdvTags: ['battle', 'treasure']
  },
  guzhanchang: {
    features: 'Binh khí cổ tàn tích vương vãi, chiến ý ngàn năm chưa tiêu tán',
    dominantSectId: 'jianshan',
    goldNpcChance: 0.06,
    silverNpcChance: 0.25,
    specialAdvTags: ['sword', 'treasure']
  },
  chiyan: {
    features: 'Địa hỏa bốc cao ngút trời, hỏa linh tinh khiết rèn đúc pháp bảo',
    dominantSectId: 'tianhuo',
    goldNpcChance: 0.06,
    silverNpcChance: 0.25,
    specialAdvTags: ['fire', 'treasure']
  },
  youminghai: {
    features: 'Biển sâu đen ngòm, sóng cuộn âm phong, thích hợp tôi luyện thần hồn',
    dominantSectId: 'xuanming',
    goldNpcChance: 0.07,
    silverNpcChance: 0.25,
    specialAdvTags: ['dark', 'peril']
  },
  miwu: {
    features: 'Sương độc mịt mờ ngàn dặm, che khuất tầm mắt lẫn thần thức',
    dominantSectId: 'vandoc',
    goldNpcChance: 0.07,
    silverNpcChance: 0.25,
    specialAdvTags: ['peril', 'treasure']
  },
  jianzhong: {
    features: 'Vạn thanh danh kiếm cắm trên vách đá, kiếm khí tung hoành sắc bén',
    dominantSectId: 'jianshan',
    goldNpcChance: 0.08,
    silverNpcChance: 0.28,
    specialAdvTags: ['sword', 'breakthrough']
  },
  leize: {
    features: 'Lôi đình vạn năm không dứt, sấm chớp rền vang khắp đầm lầy',
    dominantSectId: 'cuuloi',
    goldNpcChance: 0.08,
    silverNpcChance: 0.28,
    specialAdvTags: ['thunder', 'breakthrough']
  },
  kunlun: {
    features: 'Tuyết sơn vạn trượng quanh năm băng giá, đạo vận huyền môn thanh tao',
    dominantSectId: 'wuji',
    goldNpcChance: 0.09,
    silverNpcChance: 0.3,
    specialAdvTags: ['longevity', 'breakthrough']
  },
  yaoting: {
    features: 'Hoàng cung yêu tộc thời thái cổ, yêu văn cổ đại lấp lánh trên vách đá',
    dominantSectId: 'thienyeu',
    goldNpcChance: 0.09,
    silverNpcChance: 0.3,
    specialAdvTags: ['treasure', 'peril']
  },
  chensha: {
    features: 'Tường thành cổ xưa chìm dưới bão cát, cất giấu truyền thừa thượng cổ',
    dominantSectId: 'thandao',
    goldNpcChance: 0.1,
    silverNpcChance: 0.3,
    specialAdvTags: ['treasure', 'ruin']
  },
  shenlou: {
    features: 'Hư ảo mộng mị trập trùng, tâm ma và cơ duyên cùng đồng thời xuất hiện',
    dominantSectId: 'tianji',
    goldNpcChance: 0.1,
    silverNpcChance: 0.3,
    specialAdvTags: ['social', 'peril']
  },
  moyuan: {
    features: 'Ma khí sôi trào tựa dòng thác, thách thức sự kiên định của đạo tâm',
    dominantSectId: 'huyetsat',
    goldNpcChance: 0.11,
    silverNpcChance: 0.32,
    specialAdvTags: ['battle', 'peril']
  },
  xingyun: {
    features: 'Mảnh vỡ tinh tú rải rác, thiên thạch tinh túy ánh lên sắc lam bạc',
    dominantSectId: 'tianji',
    goldNpcChance: 0.12,
    silverNpcChance: 0.32,
    specialAdvTags: ['treasure', 'sky']
  },
  tianwaitian: {
    features: 'Vượt ngoài tầng mây phàm trần, lướt đi trong hư không tịch tĩnh',
    dominantSectId: 'wuji',
    goldNpcChance: 0.12,
    silverNpcChance: 0.32,
    specialAdvTags: ['sky', 'breakthrough']
  },
  xianfu: {
    features: 'Động phủ tiên nhân di lưu, tiên quang lưu chuyển, linh dược nghìn năm',
    dominantSectId: 'qingyun',
    goldNpcChance: 0.14,
    silverNpcChance: 0.35,
    specialAdvTags: ['treasure', 'breakthrough']
  },
  hongmeng: {
    features: 'Vết rách quy luật thiên địa, giao điểm chuyển tiếp giữa phàm và tiên',
    dominantSectId: 'wuji',
    goldNpcChance: 0.15,
    silverNpcChance: 0.35,
    specialAdvTags: ['breakthrough', 'sky']
  },
  // ---- Tiên Giới ----
  yunhai: {
    features: 'Cổng trời tiên môn uy nghiêm, tiên vân quấn quýt, đạo tắc rõ ràng',
    dominantSectId: 'yujing',
    goldNpcChance: 0.15,
    silverNpcChance: 0.35,
    specialAdvTags: ['immortal', 'sky']
  },
  zhexian: {
    features: 'Bến đò cổ kính nơi các tiên nhân hội ngộ đàm đạo thế sự',
    dominantSectId: 'sanxiu',
    goldNpcChance: 0.15,
    silverNpcChance: 0.35,
    specialAdvTags: ['immortal', 'social']
  },
  yujing: {
    features: 'Thành trì ngọc kinh nghìn trùng lấp lánh hoàng kim, uy nghiêm tráng lệ',
    dominantSectId: 'yujing',
    goldNpcChance: 0.16,
    silverNpcChance: 0.35,
    specialAdvTags: ['immortal', 'treasure']
  },
  xingyuntai: {
    features: 'Đài cao chất bằng tinh tú thượng giới, tử khí đông lai ngập tràn',
    dominantSectId: 'tutieu',
    goldNpcChance: 0.16,
    silverNpcChance: 0.35,
    specialAdvTags: ['immortal', 'sky']
  },
  yaochi: {
    features: 'Hồ nước dao trì trong vắt, đào tiên trĩu cành, tiên linh thú rong chơi',
    dominantSectId: 'daochi',
    goldNpcChance: 0.18,
    silverNpcChance: 0.38,
    specialAdvTags: ['immortal', 'herb']
  },
  jinyuan: {
    features: 'Vực sâu ngưng tụ bất hủ kim khí, mài giũa thần binh vô địch',
    dominantSectId: 'daochi',
    goldNpcChance: 0.18,
    silverNpcChance: 0.38,
    specialAdvTags: ['immortal', 'treasure']
  },
  leichi: {
    features: 'Ao sấm sét Thái Ất ngưng kết thành lôi thủy, gột rửa nhục thân tiên thể',
    dominantSectId: 'cuuloi',
    goldNpcChance: 0.19,
    silverNpcChance: 0.38,
    specialAdvTags: ['immortal', 'thunder']
  },
  daochang: {
    features: 'Đạo trường huyền cơ cơ quan vận hành bất tận, ẩn chứa đạo tắc vi diệu',
    dominantSectId: 'thaihu',
    goldNpcChance: 0.19,
    silverNpcChance: 0.38,
    specialAdvTags: ['immortal', 'breakthrough']
  },
  daluotian: {
    features: 'Cõi trời tối cao của tiên giới, ngắm nhìn vạn tinh đẩu dưới chân',
    dominantSectId: 'tutieu',
    goldNpcChance: 0.2,
    silverNpcChance: 0.4,
    specialAdvTags: ['immortal', 'sky']
  },
  xinghai: {
    features: 'Biển sao la thiên vô bờ bến, mỗi vì sao là tàn tích của một đại năng',
    dominantSectId: 'tutieu',
    goldNpcChance: 0.2,
    silverNpcChance: 0.4,
    specialAdvTags: ['immortal', 'treasure']
  },
  // ---- Thần Giới ----
  shenbian: {
    features: 'Rìa ngoài thần vực quy tắc hỗn độn, thú dữ thượng cổ lang thang',
    dominantSectId: 'sanxiu',
    goldNpcChance: 0.2,
    silverNpcChance: 0.4,
    specialAdvTags: ['god', 'peril']
  },
  shenjihuang: {
    features: 'Dấu tích thần tích hoang sơ, nét bút của chư thần khắc vào thiên địa',
    dominantSectId: 'sanxiu',
    goldNpcChance: 0.2,
    silverNpcChance: 0.4,
    specialAdvTags: ['god', 'treasure']
  },
  shenbingguan: {
    features: 'Cửa ải thần binh thẳng tắp, thần tướng cầm kích canh giữ uy phong',
    dominantSectId: 'jianshan',
    goldNpcChance: 0.22,
    silverNpcChance: 0.4,
    specialAdvTags: ['god', 'battle']
  },
  yunshenzhanchang: {
    features: 'Nơi chư thần thượng cổ vẫn lạc, chiến ý sôi trào qua hàng kỷ nguyên',
    dominantSectId: 'sanxiu',
    goldNpcChance: 0.22,
    silverNpcChance: 0.4,
    specialAdvTags: ['god', 'peril']
  },
  shenwangdian: {
    features: 'Thánh điện chói lòa thần quang, tiếng tụng niệm pháp tắc vang vọng',
    dominantSectId: 'vanthan',
    goldNpcChance: 0.25,
    silverNpcChance: 0.42,
    specialAdvTags: ['god', 'breakthrough']
  },
  wanshendian: {
    features: 'Vạn pho tượng thần sừng sững, hương hỏa ngàn năm chưa từng dứt',
    dominantSectId: 'vanthan',
    goldNpcChance: 0.25,
    silverNpcChance: 0.42,
    specialAdvTags: ['god', 'treasure']
  },
  shendigong: {
    features: 'Cung điện tối cao của thần giới, pháp tắc hóa hình thành linh thú túc trực',
    dominantSectId: 'vanthan',
    goldNpcChance: 0.28,
    silverNpcChance: 0.45,
    specialAdvTags: ['god', 'sky']
  },
  diquetianjie: {
    features: 'Chín ngàn bậc thang thần uy ngập tràn trước ngai vàng chí tôn',
    dominantSectId: 'vanthan',
    goldNpcChance: 0.28,
    silverNpcChance: 0.45,
    specialAdvTags: ['god', 'breakthrough']
  },
  // ---- Hỗn Độn Hải ----
  hundunbin: {
    features: 'Bờ biển hỗn độn mờ mịt chưa phân định, chân linh bơi lội trong sương',
    dominantSectId: 'hondon',
    goldNpcChance: 0.3,
    silverNpcChance: 0.45,
    specialAdvTags: ['chaos', 'sky']
  },
  youtan: {
    features: 'Bãi cạn chân linh sâu thẳm, nơi bảo hộ những điểm linh quang nguyên sơ',
    dominantSectId: 'luanhoi',
    goldNpcChance: 0.3,
    silverNpcChance: 0.45,
    specialAdvTags: ['chaos', 'treasure']
  },
  shenmoyuan: {
    features: 'Uyên sâu thần ma hợp nhất, dư uy khai thiên tích địa còn vang vọng',
    dominantSectId: 'hondon',
    goldNpcChance: 0.32,
    silverNpcChance: 0.48,
    specialAdvTags: ['chaos', 'peril']
  },
  guji: {
    features: 'Đàn tế cổ xưa hơn cả trời đất, chứng tích của trận huyết chiến mở cõi',
    dominantSectId: 'luanhoi',
    goldNpcChance: 0.32,
    silverNpcChance: 0.48,
    specialAdvTags: ['chaos', 'treasure']
  },
  hongmengbenyuan: {
    features: 'Nguồn cội của vạn đạo, tĩnh lặng lơ lửng, một niệm mở ra tam thiên thế giới',
    dominantSectId: 'vanco',
    goldNpcChance: 0.35,
    silverNpcChance: 0.5,
    specialAdvTags: ['chaos', 'breakthrough']
  },
  wudaoya: {
    features: 'Vách đá nơi Hỗn Độn Đạo Tổ ngồi ngộ đạo ba vạn năm, chữ khắc còn sáng rực',
    dominantSectId: 'vanco',
    goldNpcChance: 0.35,
    silverNpcChance: 0.5,
    specialAdvTags: ['chaos', 'breakthrough']
  }
}

/** Tìm DomainDef chứa một khu vực */
function findDomainForRegion(regionId: string): DomainDef {
  const found = DOMAINS.find(d => d.regionIds.includes(regionId))
  return found ?? DOMAINS[0]!
}

/** Danh sách hoàn chỉnh 44 Khu Vực Tu Tiên */
export const CULTIVATION_AREAS: readonly CultivationAreaDef[] = REGIONS.map(r => {
  const domain = findDomainForRegion(r.id)
  const meta = AREA_METADATA[r.id] ?? {
    features: 'Linh khí tự nhiên lưu chuyển, phong cảnh hữu tình',
    goldNpcChance: 0.05,
    silverNpcChance: 0.2,
    specialAdvTags: ['general']
  }
  const viName = REGION_NAME_MAP[r.name] ?? r.name

  return {
    id: r.id,
    name: viName,
    originalName: r.name,
    domainId: domain.id,
    worldId: domain.worldId,
    tier: r.tier,
    minRealm: r.minRealm,
    maxRealm: Math.min(20, r.minRealm + 1),
    danger: r.danger,
    desc: r.desc,
    features: meta.features,
    dominantSectId: meta.dominantSectId,
    goldNpcChance: meta.goldNpcChance,
    silverNpcChance: meta.silverNpcChance,
    specialAdvTags: meta.specialAdvTags
  }
})

const AREAS_BY_ID = new Map(CULTIVATION_AREAS.map(a => [a.id, a]))
const DOMAINS_BY_ID = new Map(DOMAINS.map(d => [d.id, d]))

/** Lấy thông tin Khu Vực theo ID */
export function cultivationAreaDef(id: string): CultivationAreaDef | undefined {
  return AREAS_BY_ID.get(id)
}

/** Lấy thông tin Địa Giới theo ID */
export function domainDef(id: string): DomainDef | undefined {
  return DOMAINS_BY_ID.get(id)
}

/** Lấy danh sách Địa Giới thuộc một Thế Giới */
export function domainsByWorld(worldId: WorldId): DomainDef[] {
  return DOMAINS.filter(d => d.worldId === worldId)
}

/** Lấy danh sách Khu Vực thuộc một Địa Giới */
export function areasOfDomain(domainId: string): CultivationAreaDef[] {
  return CULTIVATION_AREAS.filter(a => a.domainId === domainId)
}

/**
 * Tính toán khu vực cư ngụ / hoạt động mặc định cho một NPC.
 * Dựa trên cảnh giới (`major`) và môn phái (`sectId`).
 */
export function defaultRegionForNpc(npc: { major: number; sectId: string }): string {
  // Lọc các khu vực có minRealm khớp với major của NPC
  const matchingAreas = CULTIVATION_AREAS.filter(a => a.minRealm === npc.major)
  if (matchingAreas.length === 0) {
    // Nếu không khớp chính xác, tìm khu vực gần nhất
    const nearest = [...CULTIVATION_AREAS].sort((a, b) => Math.abs(a.minRealm - npc.major) - Math.abs(b.minRealm - npc.major))[0]
    return nearest?.id ?? 'qingyun'
  }

  // Nếu có môn phái tương ứng tại khu vực đó, ưu tiên xếp vào
  const sectMatch = matchingAreas.find(a => a.dominantSectId === npc.sectId)
  if (sectMatch) return sectMatch.id

  // Ngược lại chọn khu vực đầu tiên phù hợp với cảnh giới
  return matchingAreas[0]!.id
}
