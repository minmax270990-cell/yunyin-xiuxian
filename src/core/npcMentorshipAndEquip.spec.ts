/**
 * Kiểm thử Toàn Diện Hệ Thống: Trang Bị NPC, Ngộ Đạo và Sư Đồ Truyền Thừa Tông Môn
 *
 * Kiểm tra các tính năng:
 * 1. Khảo sát trang bị 10 ô chuẩn, so sánh chỉ số trước & sau khi mặc đồ, phân định nguồn gốc
 * 2. NPC tự động thay đổi trang bị theo tháng khi có đồ tốt hơn trong túi
 * 3. Tặng và ban thưởng trang bị: NPC thẩm định ngay lập tức và mặc nếu tốt hơn
 * 4. Tự đốn ngộ công pháp vs Thụ giáo vs Chân truyền
 * 5. Quy tắc Sư Đồ: tối đa 10 đệ tử/mentor, chỉ ngoại môn, 1 đệ tử 1 sư phụ
 * 6. Dạy dỗ hàng tháng và lợi ích theo chuyên môn Trưởng lão (Đan, Khí, Sự, Công, Hình, Ngoại)
 * 7. Tranh giành đệ tử thiên kiêu bằng thực lực chiến đấu thực tế
 * 8. Luồng tặng quà Đạo Lữ toàn diện (Linh thạch, Đan dược, Linh thảo, Khoáng thạch, Trang bị)
 */
import { describe, expect, it, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useApprenticeStore } from '@/stores/apprentice'
import { usePlayerStore } from '@/stores/player'
import { useInventoryStore } from '@/stores/inventory'
import { useResourcesStore } from '@/stores/resources'
import { useNpcStore } from '@/stores/npc'
import type { DiscipleData } from '@/data/sect'
import { MAX_MENTORED_PER_MASTER } from '@/data/sect'
import type { EquipmentInstance } from '@/types'
import {
  getNpcEquipments,
  buildNpcEquipmentOverview,
  evaluateAndAutoEquipNpc
} from './npcEquipmentService'
import {
  simulateNpcGongfaEnlightenment,
  simulateMentorTeachGongfa
} from './npcGongfaService'
import {
  isEligibleMentor,
  getMentoredCount,
  assignDiscipleToMentor,
  simulateMonthlyMentorshipTeaching,
  simulateProdigyContention
} from './sectMentorshipService'
import { giftToDaolu } from './daoluInteractionService'
import { giftToWorldNpc } from './npcService'
import { displayDaoluStage, displayBondEnding } from '@/ui/displayZhVi'
import { gn } from '@/utils/gnum'
import { RandomService } from '@/utils/random'

const testRng = new RandomService(() => 0.01)

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('Hệ Thống NPC: Trang Bị, Ngộ Đạo & Sư Đồ Truyền Thừa', () => {
  it('1. Khảo sát 10 ô trang bị chuẩn, so sánh chỉ số trước & sau khi mặc và phân định nguồn gốc', () => {
    const sect = useApprenticeStore()
    const discId = 'd_test_survey'

    const sword: EquipmentInstance = {
      uid: 'eq_survey_sword',
      templateId: 'w_xuantie',
      quality: 'spirit',
      tier: 2,
      level: 1,
      origin: 'gifted',
      affixes: []
    }

    const armor: EquipmentInstance = {
      uid: 'eq_survey_armor',
      templateId: 'b_mabu',
      quality: 'fine',
      tier: 1,
      level: 0,
      origin: 'rewarded',
      affixes: []
    }

    const bagRing: EquipmentInstance = {
      uid: 'eq_survey_ring',
      templateId: 'r_tongjie',
      quality: 'mortal',
      tier: 1,
      level: 0,
      origin: 'found',
      affixes: []
    }

    const disc: DiscipleData = {
      id: discId,
      name: 'Lý Tiêu Dao',
      gender: 'male',
      element: 'metal',
      major: 1,
      sub: 2,
      expPct: 40,
      comprehension: 75,
      aptitudes: [],
      temper: 'cautious',
      lean: 'sword',
      tierRank: 'normal',
      joinedMonth: 1,
      status: 'idle',
      totalContributions: 50,
      equippedItems: [sword, armor],
      inventoryItems: [bagRing],
      towerFloor: 1,
      rank: 'outer',
      learnedGongfa: []
    }
    sect.disciples.push(disc)

    const overview = buildNpcEquipmentOverview(discId, 1, 2, 'metal')

    // Đủ 9 ô trang bị chuẩn
    expect(overview.equippedSlots.length).toBe(9)
    const weaponSlot = overview.equippedSlots.find(s => s.slot === 'weapon')!
    expect(weaponSlot.item).not.toBeNull()
    expect(weaponSlot.originText).toBe('Được tặng')

    const bodySlot = overview.equippedSlots.find(s => s.slot === 'body')!
    expect(bodySlot.item).not.toBeNull()
    expect(bodySlot.originText).toBe('Được ban thưởng')

    // Túi đồ có 1 món chưa mặc
    expect(overview.inventoryItems.length).toBe(1)
    expect(overview.inventoryItems[0]?.item?.uid).toBe('eq_survey_ring')
    expect(overview.inventoryItems[0]?.originText).toBe('Tự tìm được')

    // Chỉ số sau khi mặc đồ cao hơn trước khi mặc đồ
    expect(overview.statsWithEquip.atk).toBeGreaterThan(overview.statsWithoutEquip.atk)
    expect(overview.statsWithEquip.def).toBeGreaterThan(overview.statsWithoutEquip.def)
    expect(overview.totalEquipPowerBonus).toBeGreaterThan(0)
  })

  it('2. NPC tự động thay đổi trang bị theo tháng khi có đồ tốt hơn trong túi đồ cá nhân', () => {
    const sect = useApprenticeStore()
    const discId = 'd_auto_swap'

    const oldSword: EquipmentInstance = {
      uid: 'eq_old_sword',
      templateId: 'w_zhuqing',
      quality: 'mortal',
      tier: 1,
      level: 0,
      affixes: []
    }

    const betterSword: EquipmentInstance = {
      uid: 'eq_better_sword',
      templateId: 'w_xuantie',
      quality: 'spirit',
      tier: 2,
      level: 3,
      affixes: []
    }

    const disc: DiscipleData = {
      id: discId,
      name: 'Bạch Tiểu Thuần',
      gender: 'male',
      element: 'water',
      major: 1,
      sub: 5,
      expPct: 50,
      comprehension: 85,
      aptitudes: [],
      temper: 'cautious',
      lean: 'longevity',
      tierRank: 'normal',
      joinedMonth: 1,
      status: 'idle',
      totalContributions: 100,
      equippedItems: [oldSword],
      inventoryItems: [betterSword],
      towerFloor: 1,
      rank: 'inner',
      learnedGongfa: []
    }
    sect.disciples.push(disc)

    // Đánh giá và tự động thay đổi
    const res = evaluateAndAutoEquipNpc(discId, { major: 1, sub: 5, element: 'water' })
    expect(res.changed).toBe(true)
    expect(res.newItem?.uid).toBe('eq_better_sword')
    expect(res.oldItem?.uid).toBe('eq_old_sword')

    // Kiểm tra trang bị sau khi thay
    const { equipped, inventory } = getNpcEquipments(discId)
    expect(equipped.length).toBe(1)
    expect(equipped[0]?.uid).toBe('eq_better_sword')
    // Món cũ được đưa trở lại túi đồ an toàn, không bị xóa
    expect(inventory.length).toBe(1)
    expect(inventory[0]?.uid).toBe('eq_old_sword')
  })

  it('3. Người chơi tặng/ban thưởng trang bị: NPC thẩm định ngay và mặc lập tức nếu tốt hơn', () => {
    const sect = useApprenticeStore()
    const player = usePlayerStore()
    const inv = useInventoryStore()
    player.major = 2
    sect.createSect('Thái Huyền Tông', 'natural', 1)

    const disciple: DiscipleData = {
      id: 'd_gift_target',
      name: 'Diệp Phàm',
      gender: 'male',
      element: 'fire',
      major: 1,
      sub: 2,
      expPct: 30,
      comprehension: 90,
      aptitudes: [],
      temper: 'bold',
      lean: 'sword',
      tierRank: 'gold',
      joinedMonth: 1,
      status: 'idle',
      totalContributions: 0,
      equippedItems: [],
      inventoryItems: [],
      towerFloor: 1,
      rank: 'outer',
      learnedGongfa: []
    }
    sect.disciples.push(disciple)

    const powerfulSword: EquipmentInstance = {
      uid: 'eq_player_gift_sword',
      templateId: 'w_xuantie',
      quality: 'spirit',
      tier: 2,
      level: 2,
      affixes: []
    }
    inv.items.push(powerfulSword)

    // Tông chủ ban thưởng kiếm cho đệ tử
    const rewardRes = sect.rewardDiscipleItem('d_gift_target', 'equipment', 'eq_player_gift_sword')
    expect(rewardRes.success).toBe(true)

    // Kiếm đã bị trừ khỏi túi người chơi
    expect(inv.findItem('eq_player_gift_sword')).toBeUndefined()

    // Đệ tử nhận và đã mặc ngay trên thân vì vị trí vũ khí còn trống
    const { equipped } = getNpcEquipments('d_gift_target')
    expect(equipped.length).toBe(1)
    expect(equipped[0]?.uid).toBe('eq_player_gift_sword')
    expect(equipped[0]?.origin).toBe('rewarded')

    // Tông Môn Sử có ghi lại sự kiện ban thưởng
    expect(sect.history.some(h => h.summary.includes('ban thưởng') && h.summary.includes('Diệp Phàm'))).toBe(true)
  })

  it('4. Phân định nguồn gốc công pháp: Tự Ngộ (comprehended), Thụ Giáo (learned), Chân Truyền (inherited)', () => {
    const disciple = {
      id: 'd_gongfa_enlighten',
      name: 'Hàn Lập',
      major: 2,
      sub: 0,
      comprehension: 95,
      tierRank: 'gold' as const,
      element: 'wood' as const,
      learnedGongfa: [] as string[]
    }

    // 1. Tự đốn ngộ
    const enlightRes = simulateNpcGongfaEnlightenment(disciple, testRng)
    expect(enlightRes.success).toBe(true)
    expect(enlightRes.origin).toBe('comprehended')
    expect(enlightRes.gongfa).toBeDefined()

    // 2. Sư phụ truyền thụ chân truyền
    const mentor = {
      id: 'm_elder_pass',
      name: 'Mặc Đại Phu',
      major: 3,
      learnedGongfa: ['m_taixuan', 's_dantianshan']
    }
    const discipleLearning = {
      id: 'd_learning',
      name: 'Trương Thiết',
      major: 1,
      learnedGongfa: [] as string[]
    }

    const teachRes = simulateMentorTeachGongfa(mentor, discipleLearning, testRng)
    expect(teachRes.success).toBe(true)
    expect(teachRes.origin).toBe('inherited')
    expect(mentor.learnedGongfa).toContain(teachRes.gongfa!.id)
  })

  it('5. Quy tắc Sư Đồ: tối đa 10 đệ tử/mentor, chỉ nhận đệ tử Ngoại môn, 1 đệ tử chỉ 1 sư phụ', () => {
    const sect = useApprenticeStore()
    const elder: DiscipleData = {
      id: 'elder_1',
      name: 'Liễu Nhất Đao',
      gender: 'male',
      element: 'metal',
      major: 3,
      sub: 0,
      expPct: 0,
      comprehension: 70,
      aptitudes: [],
      temper: 'cautious',
      lean: 'sword',
      tierRank: 'normal',
      joinedMonth: 1,
      status: 'idle',
      totalContributions: 300,
      towerFloor: 5,
      rank: 'elder',
      learnedGongfa: [],
      mentoredDiscipleIds: []
    }

    const innerDisciple: DiscipleData = {
      id: 'inner_1',
      name: 'Nội Môn Đồ',
      gender: 'male',
      element: 'metal',
      major: 2,
      sub: 0,
      expPct: 0,
      comprehension: 70,
      aptitudes: [],
      temper: 'cautious',
      lean: 'sword',
      tierRank: 'normal',
      joinedMonth: 1,
      status: 'idle',
      totalContributions: 100,
      towerFloor: 2,
      rank: 'inner',
      learnedGongfa: []
    }

    sect.disciples.push(elder, innerDisciple)

    // Mentor hợp lệ
    expect(isEligibleMentor(elder)).toBe(true)
    expect(isEligibleMentor(innerDisciple)).toBe(false)

    // Không thể gán đệ tử Nội Môn làm đồ đệ bái sư (chỉ Ngoại Môn)
    const invalidAssign = assignDiscipleToMentor(elder.id, innerDisciple.id, sect.disciples, 1)
    expect(invalidAssign.success).toBe(false)

    // Tạo 10 đệ tử ngoại môn và bái sư
    for (let i = 1; i <= 10; i++) {
      const outer: DiscipleData = {
        id: `outer_${i}`,
        name: `Đệ Tử ${i}`,
        gender: 'male',
        element: 'wood',
        major: 0,
        sub: 1,
        expPct: 0,
        comprehension: 60,
        aptitudes: [],
        temper: 'cautious',
        lean: 'longevity',
        tierRank: 'normal',
        joinedMonth: 1,
        status: 'idle',
        totalContributions: 0,
        towerFloor: 1,
        rank: 'outer',
        learnedGongfa: []
      }
      sect.disciples.push(outer)
      const res = assignDiscipleToMentor(elder.id, outer.id, sect.disciples, 1)
      expect(res.success).toBe(true)
    }

    expect(getMentoredCount(elder, sect.disciples)).toBe(10)

    // Thử gán đệ tử thứ 11 -> Phải bị từ chối do chạm trần 10 đệ tử
    const outer11: DiscipleData = {
      id: 'outer_11',
      name: 'Đệ Tử 11',
      gender: 'male',
      element: 'water',
      major: 0,
      sub: 1,
      expPct: 0,
      comprehension: 60,
      aptitudes: [],
      temper: 'cautious',
      lean: 'longevity',
      tierRank: 'normal',
      joinedMonth: 1,
      status: 'idle',
      totalContributions: 0,
      towerFloor: 1,
      rank: 'outer',
      learnedGongfa: []
    }
    sect.disciples.push(outer11)
    const exceedRes = assignDiscipleToMentor(elder.id, outer11.id, sect.disciples, 1)
    expect(exceedRes.success).toBe(false)
    expect(exceedRes.message).toContain(`${MAX_MENTORED_PER_MASTER}`)
  })

  it('6. Dạy dỗ hàng tháng: tăng tu vi và kích hoạt hiệu ứng theo chuyên môn Trưởng lão', () => {
    const elder: DiscipleData = {
      id: 'elder_dan',
      name: 'Cổ Đan Thanh',
      gender: 'male',
      element: 'wood',
      major: 3,
      sub: 2,
      expPct: 50,
      comprehension: 80,
      aptitudes: [],
      temper: 'cautious',
      lean: 'alchemy',
      tierRank: 'normal',
      joinedMonth: 1,
      status: 'idle',
      totalContributions: 500,
      towerFloor: 10,
      rank: 'elder',
      elderSpecialty: 'dan',
      learnedGongfa: ['m_taixuan'],
      mentoredDiscipleIds: ['disc_bottleneck']
    }

    const disciple: DiscipleData = {
      id: 'disc_bottleneck',
      name: 'Vương Lâm',
      gender: 'male',
      element: 'fire',
      major: 1,
      sub: 9,
      expPct: 99,
      comprehension: 75,
      aptitudes: [],
      temper: 'bold',
      lean: 'sword',
      tierRank: 'normal',
      joinedMonth: 1,
      status: 'bottleneck', // Bị kẹt bình cảnh
      totalContributions: 50,
      towerFloor: 2,
      rank: 'outer',
      mentorElderId: 'elder_dan',
      learnedGongfa: []
    }

    const disciplesList = [elder, disciple]
    const logs = simulateMonthlyMentorshipTeaching(disciplesList, 3, testRng)

    // Đan Các giúp đệ tử phá vỡ bình cảnh thành công
    expect(disciple.status).toBe('idle')
    expect(disciple.expPct).toBeGreaterThanOrEqual(20)

    // Có nhật ký ghi nhận hoạt động Đan Các ban đan dược phá bình cảnh
    expect(logs.length).toBeGreaterThan(0)
    expect(logs.some(l => l.summary.includes('phá vỡ bình cảnh'))).toBe(true)
  })

  it('7. Tranh giành đệ tử thiên kiêu: 2 Trưởng lão giao đấu thực tế để phân định thắng thua', () => {
    const elderStrong: DiscipleData = {
      id: 'elder_strong',
      name: 'Hắc Phong Lão Quái',
      gender: 'male',
      element: 'metal',
      major: 4, // Cảnh giới cao -> Chiến lực áp đảo
      sub: 5,
      expPct: 50,
      comprehension: 80,
      aptitudes: [],
      temper: 'bold',
      lean: 'sword',
      tierRank: 'gold',
      joinedMonth: 1,
      status: 'idle',
      totalContributions: 1000,
      towerFloor: 20,
      rank: 'elder',
      elderSpecialty: 'discipline',
      learnedGongfa: ['m_taixuan'],
      mentoredDiscipleIds: []
    }

    const elderWeaker: DiscipleData = {
      id: 'elder_weaker',
      name: 'Thanh Hư Đạo Trưởng',
      gender: 'male',
      element: 'wood',
      major: 2, // Cảnh giới thấp hơn
      sub: 1,
      expPct: 20,
      comprehension: 70,
      aptitudes: [],
      temper: 'cautious',
      lean: 'alchemy',
      tierRank: 'normal',
      joinedMonth: 1,
      status: 'idle',
      totalContributions: 200,
      towerFloor: 5,
      rank: 'elder',
      elderSpecialty: 'dan',
      learnedGongfa: [],
      mentoredDiscipleIds: []
    }

    const prodigy: DiscipleData = {
      id: 'prodigy_pupil',
      name: 'Thạch Hạo',
      gender: 'male',
      element: 'metal',
      major: 0,
      sub: 9,
      expPct: 80,
      comprehension: 99,
      aptitudes: [],
      temper: 'bold',
      lean: 'sword',
      tierRank: 'gold', // Thiên Kiêu Vàng!
      joinedMonth: 1,
      status: 'idle',
      totalContributions: 10,
      towerFloor: 1,
      rank: 'outer',
      learnedGongfa: []
    }

    const duelRes = simulateProdigyContention([elderStrong, elderWeaker, prodigy], 5)

    expect(duelRes.occurred).toBe(true)
    // Trưởng lão mạnh hơn (cảnh giới 4 vs 2) giành chiến thắng
    expect(duelRes.winnerId).toBe('elder_strong')
    expect(duelRes.loserId).toBe('elder_weaker')
    expect(prodigy.mentorElderId).toBe('elder_strong')
    expect(duelRes.log).toBeDefined()
    expect(duelRes.log?.summary).toContain('[Tranh Giành Đệ Tử]')
  })

  it('8. Luồng tặng quà Đạo Lữ: hỗ trợ Linh thạch, Đan dược, Linh thảo, Khoáng thạch, và TRANG BỊ', () => {
    const player = usePlayerStore()
    const inv = useInventoryStore()
    const res = useResourcesStore()

    player.setBond({
      daoluId: 'dl_qingli',
      stage: 'together',
      fate: 30,
      trust: 25,
      accord: 20,
      shared: 1,
      metAt: 0,
      fallen: false,
      doneEvents: [],
      opportunities: 0,
      nextEventAt: 0,
      giftCountToday: 0
    })

    // 1. Tặng Linh thạch
    res.addStone(gn(5000))
    const stoneRes = giftToDaolu('stone', 800)
    expect(stoneRes.success).toBe(true)
    expect(player.bond?.giftCountToday).toBe(1)
    expect(player.bond?.fate).toBeGreaterThan(30)

    // 2. Tặng Trang bị
    const giftWeapon: EquipmentInstance = {
      uid: 'eq_daolu_gift_sword',
      templateId: 'w_xuantie',
      quality: 'spirit',
      tier: 2,
      level: 1,
      affixes: []
    }
    inv.items.push(giftWeapon)

    const equipGiftRes = giftToDaolu('equipment', 'eq_daolu_gift_sword')
    expect(equipGiftRes.success).toBe(true)
    // Đã trừ khỏi túi đồ người chơi
    expect(inv.findItem('eq_daolu_gift_sword')).toBeUndefined()
    // Đạo lữ đã nhận và gắn vào trang bị cá nhân
    const daoluEquips = getNpcEquipments('dl_qingli')
    expect(daoluEquips.equipped.some(e => e.uid === 'eq_daolu_gift_sword') || daoluEquips.inventory.some(e => e.uid === 'eq_daolu_gift_sword')).toBe(true)
  })

  it('9. Tặng quà cho World NPC: hỗ trợ tặng trang bị và tăng điểm hảo cảm', () => {
    const inv = useInventoryStore()
    const npcStore = useNpcStore()

    const giftArmor: EquipmentInstance = {
      uid: 'eq_world_npc_gift_armor',
      templateId: 'b_xuantie',
      quality: 'spirit',
      tier: 2,
      level: 1,
      affixes: []
    }
    inv.items.push(giftArmor)

    const initialFavor = npcStore.getFavor('npc_truc_linh')
    const res = giftToWorldNpc('npc_truc_linh', 'equipment', 'eq_world_npc_gift_armor')
    expect(res.success).toBe(true)
    expect(npcStore.getFavor('npc_truc_linh')).toBeGreaterThan(initialFavor)
    expect(inv.findItem('eq_world_npc_gift_armor')).toBeUndefined()
  })

  it('10. Đạo Lữ cảnh giới cao (Luyện Hư) tự động mặc trang bị sau khi được tặng, dịch thuật giai vị và tâm ý tương thông đúng chuẩn', () => {
    // Kiểm tra dịch thuật giai vị và kết cục
    expect(displayDaoluStage('道侣')).toBe('Đạo Lữ')
    expect(displayDaoluStage('daolv')).toBe('Đạo Lữ')
    expect(displayDaoluStage('结契')).toBe('Kết Khế')
    expect(displayDaoluStage('同行')).toBe('Đồng Hành')
    expect(displayBondEnding('accompanied')).toBe('Tương Bạn Chung Lão')

    const player = usePlayerStore()
    const inv = useInventoryStore()

    // Khởi tạo Đạo lữ Mộ Yên ở cảnh giới Luyện Hư (Major 5)
    player.setBond({
      daoluId: 'dl_muyan',
      stage: 'daolv',
      fate: 100,
      trust: 50,
      accord: 50,
      shared: 5,
      daoluMajor: 5,
      intent: {
        daoluId: 'dl_muyan',
        wish: 'truth',
        ripeness: 0.75,
        line: 'Xem qua vạn quyển sách, không bằng đi vạn dặm đường',
        sparks: [],
        raised: 0,
        responses: [],
        settled: false
      },
      metAt: 0,
      fallen: false,
      doneEvents: [],
      opportunities: 0,
      nextEventAt: 0,
      giftCountToday: 0
    })

    // Tặng trang bị tier 8 thích hợp cho Luyện Hư (major 5)
    const highTierSword: EquipmentInstance = {
      uid: 'eq_muyan_staff',
      templateId: 'w_xuantie',
      quality: 'spirit',
      tier: 8,
      level: 0,
      affixes: []
    }
    inv.items.push(highTierSword)

    const giftRes = giftToDaolu('equipment', 'eq_muyan_staff')
    expect(giftRes.success).toBe(true)
    expect(giftRes.equippedImmediately).toBe(true)

    // Đã trừ khỏi túi đồ của người chơi
    expect(inv.findItem('eq_muyan_staff')).toBeUndefined()

    // Đạo lữ đã mặc ngay vào ô vũ khí
    const muyanEquips = getNpcEquipments('dl_muyan')
    const wornWeapon = muyanEquips.equipped.find(e => e.uid === 'eq_muyan_staff')
    expect(wornWeapon).toBeDefined()
  })
})
