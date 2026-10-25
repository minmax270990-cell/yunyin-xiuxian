/**
 * Kỳ ngộ & Đời sống độc lập của Quần thể NPC (NPC Autonomous Adventures)
 */
import type { WorldNpcDef } from './npc'
import { rng, type RandomService } from '@/utils/random'

export interface NpcAdventureEntry {
  id: string
  day: number
  text: string
  type: 'breakthrough' | 'treasure' | 'battle' | 'peril' | 'social'
}

const TEMPLATES: Record<NpcAdventureEntry['type'], string[]> = {
  breakthrough: [
    'Bế quan tĩnh tọa ba tháng, đả thông kỳ kinh bát mạch, tu vi có chỗ tinh tiến.',
    'Dưới trăng cảm ngộ kiếm ý, tâm cảnh bừng sáng, phá vỡ bình cảnh tu hành.',
    'Uống một chén ngộ đạo trà, linh khí toàn thân cuồn cuộn dâng trào, tiểu cảnh giới tăng tiến.'
  ],
  treasure: [
    'Thám hiểm cổ quật thâm sơn, may mắn đào được một gốc nghìn năm linh dược.',
    'Tình cờ nhặt được một mảnh tàn thiết thượng cổ, bên trong ẩn chứa kim chi đạo vận.',
    'Du phương mua được một bình đan dược phẩm tướng thượng thừa từ hắc thị.'
  ],
  battle: [
    'Tỉ thí cùng đồng môn trong tông môn đại hội, thi triển tuyệt kỹ đoạt giải khôi nguyên.',
    'Trảm sát một đầu yêu lang quấy nhiễu thôn làng, thu được yêu đan cùng danh vọng.',
    'Tham gia luận kiếm trên đỉnh Hàn Băng Phong, một kiếm bạt tụy chấn động quần hùng.'
  ],
  peril: [
    'Lạc vào trận pháp tàn phá chốn cổ chiến trường, chật vật phá trận chịu chút thương tích.',
    'Tranh đoạt linh thảo nơi vực sâu bị bầy yêu cầm vây hãm, may mắn thoát hiểm trong đường tơ kẽ tóc.',
    'Luyện đan bất cẩn nổ lò, tóc tai cháy xém, đành ngậm ngùi thu dọn tàn cuộc.'
  ],
  social: [
    'Gặp gỡ đạo hữu phương xa tại trà quán ven đường, chuyện trò thâu đêm tương hợp.',
    'Được chưởng môn khen ngợi vì phẩm hạnh đoan chính, ban thưởng một phần linh thạch.',
    'Ngao du thiên hạ, làm thơ ngâm vịnh bên bờ hồ dưới ánh trăng rằm thanh khiết.'
  ]
}

/**
 * Sinh 1 kỳ ngộ mới cho NPC tại ngày `day`
 */
export function generateNpcAdventure(
  npc: WorldNpcDef,
  day: number,
  customRng: RandomService = rng
): NpcAdventureEntry {
  const types: NpcAdventureEntry['type'][] = ['breakthrough', 'treasure', 'battle', 'peril', 'social']
  const chosenType = customRng.pick(types)
  const templates = TEMPLATES[chosenType]
  const baseText = customRng.pick(templates)

  return {
    id: `adv_${npc.id}_${day}_${customRng.int(100, 999)}`,
    day,
    text: baseText,
    type: chosenType
  }
}
