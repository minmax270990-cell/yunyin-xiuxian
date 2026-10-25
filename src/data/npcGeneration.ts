/**
 * Trình Tạo Quần Thể NPC Theo Giai Đoạn & Thiên Kiêu (Stage-based NPC Generation)
 *
 * Cung cấp cơ chế sinh danh tính, tư chất, ngộ tính, linh căn và môn phái
 * cho tu sĩ khắp cửu giới theo từng giai đoạn cảnh giới và thời kỳ thế giới.
 */
import type { ElementId } from '@/types'
import type { DaoLean, Temperament } from './daolu'
import { SECTS, type WorldNpcDef, type NpcTierRank } from './npc'
import { APTITUDES } from './aptitudes'
import { rng, type RandomService } from '@/utils/random'
import {
  generateRandomFullName,
  generateUniqueNpcName
} from './npcNames'

const ELEMENTS: ElementId[] = ['metal', 'wood', 'water', 'fire', 'earth', 'wind', 'thunder', 'ice']
const TEMPERAMENTS: Temperament[] = ['cautious', 'bold', 'frugal', 'curious']
const DAO_LEANS: DaoLean[] = ['slaughter', 'longevity', 'sword', 'alchemy', 'artifice', 'truth']
const GIFT_TYPES = ['pill', 'herb', 'ore', 'sword', 'tea', 'talisman', 'manual']

const ROLES_BY_MAJOR: Record<number, string[]> = {
  0: ['Ký danh đệ tử', 'Ngoại môn đệ tử', 'Dược đồng', 'Tán tu hành tẩu'],
  1: ['Ngoại môn tinh anh', 'Chấp sự đệ tử', 'Đan sư tập sự', 'Tu sĩ tầm đạo'],
  2: ['Nội môn đệ tử', 'Chân truyền đệ tử', 'Kiếm đao sư', 'Tán tu danh tiếng'],
  3: ['Nội môn đại đệ tử', 'Chấp sự đường chủ', 'Đan sư ngũ phẩm', 'Du hiệp phương xa'],
  4: ['Chân truyền đệ nhất', 'Phó đường chủ', 'Đại sư luyện khí', 'Ẩn sĩ kỳ nhân'],
  5: ['Trưởng lão nội môn', 'Chưởng viện tiên sư', 'Tông môn hộ pháp', 'Đại tông sư'],
  6: ['Thủ tọa trưởng lão', 'Thái thượng trưởng lão', 'Thế lực minh chủ', 'Vạn cổ cự phách'],
  7: ['Thái thượng hộ pháp', 'Lão tổ bế quan', 'Động thiên chi chủ', 'Chí tôn phương bắc'],
  8: ['Thần vực tôn giả', 'Đại thiên hộ pháp', 'Hư không du hiệp', 'Thái sơ chân nhân'],
  9: ['Tiên nhân giáng thế', 'Thần vực chấp pháp', 'Tiên môn tổ sư', 'Chân tiên hạ phàm']
}

const PURSUITS = [
  'Sớm ngày ngự kiếm phi thăng vào nội môn',
  'Đạt tới cảnh giới kiếm tâm thông minh, một kiếm phá vạn pháp',
  'Luyện thành một lò cửu chuyển kim đan danh chấn thiên hạ',
  'Thấu triệt âm dương sinh khắc, mở ra đại đạo trường sinh',
  'Thu thập đủ vạn quyển bí tịch trong thiên hạ để đúc thành đạo điển',
  'Bảo vệ trật tự môn phái, dẹp yên yêu ma các phương',
  'Ngao du cửu thiên thập địa, không màng danh lợi trần thế',
  'Tìm kiếm tung tích sư phụ mất tích nơi hiểm địa vạn kiếp'
]

const TABOOS = [
  'Cực kỳ ghét kẻ bội tín bội nghĩa, nói lời không giữ lấy lời',
  'Không kết giao với tu sĩ tu luyện ma công tà đạo tàn sát sinh linh',
  'Tránh xa những kẻ ham lợi trước mắt làm tổn hại tông môn',
  'Không nhẫn nhịn kẻ ỷ thế hiếp người, khinh nhờn đạo hữu yếu thế',
  'Ghét kẻ lãng phí linh đan diệu dược và thiên tài địa bảo',
  'Kỵ kẻ nói xấu sau lưng đồng môn, chia rẽ chính đạo',
  'Không giao dịch với kẻ dối trên lừa dưới, lòng dạ khó lường'
]

/** Lọc danh sách tư chất theo phẩm cấp */
function aptitudesByGrade(grade: number): string[] {
  return APTITUDES.filter(a => a.grade === grade).map(a => a.id)
}

const GRADE_1_2_APTS = [...aptitudesByGrade(1), ...aptitudesByGrade(2)]
const GRADE_3_4_APTS = [...aptitudesByGrade(3), ...aptitudesByGrade(4)]
const GRADE_5_6_APTS = [...aptitudesByGrade(5), ...aptitudesByGrade(6)]

/**
 * Sinh danh hiệu đánh giá ngộ tính của NPC
 */
export function comprehensionRankText(score: number): { label: string; colorClass: string } {
  if (score >= 95) return { label: 'Tuyệt thế', colorClass: 'text-gold-ink' }
  if (score >= 90) return { label: 'Kinh diễm', colorClass: 'text-gold-ink' }
  if (score >= 80) return { label: 'Trác việt', colorClass: 'text-azure' }
  if (score >= 70) return { label: 'Xuất chúng', colorClass: 'text-azure' }
  if (score >= 50) return { label: 'Tương đối', colorClass: 'text-ink-soft' }
  return { label: 'Bình thường', colorClass: 'text-ink-faint' }
}

/**
 * Sinh một NPC ngẫu nhiên hoàn chỉnh cho giai đoạn `stage`
 */
export function generateNpc(
  stage: number,
  gender?: 'male' | 'female',
  forcedTier?: NpcTierRank,
  idSuffix?: string,
  customRng: RandomService = rng,
  existingNames?: Set<string>
): WorldNpcDef {
  const chosenGender = gender ?? (customRng.chance(0.5) ? 'male' : 'female')
  const name = existingNames
    ? generateUniqueNpcName(chosenGender, existingNames, customRng)
    : generateRandomFullName(chosenGender, customRng)

  // Xác định phẩm cấp Thiên kiêu
  // Tỷ lệ: Gold 4%, Silver 16%, Normal 80%
  let tierRank: NpcTierRank = forcedTier ?? 'normal'
  if (!forcedTier) {
    const roll = customRng.float(0, 100)
    if (roll < 4) {
      tierRank = 'gold'
    } else if (roll < 20) {
      tierRank = 'silver'
    } else {
      tierRank = 'normal'
    }
  }

  // Ngộ tính & Tư chất theo phẩm cấp
  let comprehension = 50
  const chosenAptitudes: string[] = []

  if (tierRank === 'gold') {
    comprehension = customRng.int(90, 100)
    // 2 tư chất Thiên phẩm / Tuyệt phẩm
    if (GRADE_5_6_APTS.length > 0) {
      chosenAptitudes.push(customRng.pick(GRADE_5_6_APTS))
      const second = customRng.pick(GRADE_5_6_APTS)
      if (second !== chosenAptitudes[0]) chosenAptitudes.push(second)
    }
  } else if (tierRank === 'silver') {
    comprehension = customRng.int(75, 89)
    // 1-2 tư chất Thượng phẩm / Địa phẩm
    if (GRADE_3_4_APTS.length > 0) {
      chosenAptitudes.push(customRng.pick(GRADE_3_4_APTS))
      if (customRng.chance(0.6)) {
        const second = customRng.pick(GRADE_3_4_APTS)
        if (second !== chosenAptitudes[0]) chosenAptitudes.push(second)
      }
    }
  } else {
    comprehension = customRng.int(35, 74)
    // 1 tư chất Phàm phẩm hoặc Trung phẩm
    if (GRADE_1_2_APTS.length > 0) {
      chosenAptitudes.push(customRng.pick(GRADE_1_2_APTS))
    }
  }

  const sect = customRng.pick(SECTS)
  const roles = ROLES_BY_MAJOR[stage] ?? ROLES_BY_MAJOR[0]!
  const sectRole = customRng.pick(roles)
  const major = Math.min(9, Math.max(0, stage))
  const sub = customRng.int(0, 8)
  const element = customRng.chance(0.6) ? sect.favoredElement : customRng.pick(ELEMENTS)
  const temper = customRng.pick(TEMPERAMENTS)
  const lean = customRng.pick(DAO_LEANS)

  const pursuit = customRng.pick(PURSUITS)
  const taboo = customRng.pick(TABOOS)

  // Quà ưa thích (2-3 món)
  const giftCount = customRng.int(2, 3)
  const preferredGifts: string[] = []
  for (let i = 0; i < giftCount; i++) {
    const g = customRng.pick(GIFT_TYPES)
    if (!preferredGifts.includes(g)) preferredGifts.push(g)
  }

  const id = `npc_gen_s${stage}_${chosenGender}_${idSuffix ?? customRng.int(1000, 9999)}`

  let tierPrefix = ''
  if (tierRank === 'gold') tierPrefix = ' [Thiên Kiêu Hoàng Kim xuất thế]'
  else if (tierRank === 'silver') tierPrefix = ' [Thiên Kiêu Bạch Ngân]'

  const brief = `${chosenGender === 'male' ? 'Nam tu sĩ' : 'Nữ tu sĩ'} thuộc ${sect.name}, khí chất thanh nhã, đạo vận lưu chuyển.${tierPrefix}`

  return {
    id,
    name,
    gender: chosenGender,
    sectId: sect.id,
    sectRole,
    major,
    sub,
    temper,
    lean,
    element,
    brief,
    pursuit,
    taboo,
    isDaoluCandidate: true,
    preferredGifts,
    tierRank,
    comprehension,
    aptitudes: chosenAptitudes,
    stage
  }
}

/**
 * Sinh một lô NPC hoàn chỉnh cho giai đoạn `stage`.
 * Mặc định mỗi giai đoạn sinh 6 nam và 6 nữ (tổng cộng 12 NPC),
 * đảm bảo luôn có ít nhất 1 Thiên Kiêu Bạc hoặc Vàng mỗi giai đoạn.
 */
export function generateStageNpcBatch(
  stage: number,
  countPerGender = 6,
  customRng: RandomService = rng
): WorldNpcDef[] {
  const result: WorldNpcDef[] = []
  const batchNames = new Set<string>()

  // Đảm bảo có ít nhất 1 Thiên kiêu trong lô
  const goldGender = customRng.chance(0.5) ? 'male' : 'female'
  const hasGold = stage >= 1 && customRng.chance(0.35) // 35% có thiên kiêu vàng ở mỗi stage
  const silverGender = goldGender === 'male' ? 'female' : 'male'

  // Sinh NPC Nam
  for (let i = 0; i < countPerGender; i++) {
    let forcedTier: NpcTierRank = 'normal'
    if (hasGold && goldGender === 'male' && i === 0) {
      forcedTier = 'gold'
    } else if (silverGender === 'male' && i === (hasGold ? 1 : 0)) {
      forcedTier = 'silver'
    }
    result.push(generateNpc(stage, 'male', forcedTier, `m${i}`, customRng, batchNames))
  }

  // Sinh NPC Nữ
  for (let i = 0; i < countPerGender; i++) {
    let forcedTier: NpcTierRank = 'normal'
    if (hasGold && goldGender === 'female' && i === 0) {
      forcedTier = 'gold'
    } else if (silverGender === 'female' && i === (hasGold ? 1 : 0)) {
      forcedTier = 'silver'
    }
    result.push(generateNpc(stage, 'female', forcedTier, `f${i}`, customRng, batchNames))
  }

  return result
}
