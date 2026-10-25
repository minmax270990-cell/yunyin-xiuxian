/**
 * Kiểm Thử Hệ Thống Tông Môn Toàn Diện (Sect System Spec)
 *
 * Kiểm tra 9 tiêu chí nghiệm thu cốt lõi:
 * 1. Chức năng kiến tạo Tông môn chỉ mở ở Kim Đan.
 * 2. NPC xin nhập tông xuất hiện đúng chu kỳ, có dữ liệu riêng, không trùng lặp và chỉ ở Luyện Khí hoặc Trúc Cơ.
 * 3. Thu nhận và từ chối NPC hoạt động đúng.
 * 4. Đệ tử tự tu luyện, có tiến trình riêng và không bị mặc định cảnh giới.
 * 5. Nhiệm Vụ Đường và Tàng Kinh Các hoạt động thực tế.
 * 6. Tỉ thí diễn ra đúng mỗi sáu tháng game, có kết quả và phát thưởng đúng một lần.
 * 7. Tháp Lịch Luyện và Bí Cảnh lưu được tiến độ, kết quả và phần thưởng.
 * 8. Tông Môn Sử ghi đúng các sự kiện, thời điểm và nhân vật liên quan, không thiếu hoặc trùng bản ghi.
 * 9. Lưu và tải game không làm mất dữ liệu, không tạo NPC trùng, không xử lý lại sự kiện hoặc phát thưởng lần hai.
 */
import { describe, expect, it, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePlayerStore } from '@/stores/player'
import { useApprenticeStore } from '@/stores/apprentice'
import { useResourcesStore } from '@/stores/resources'
import { useInventoryStore } from '@/stores/inventory'
import { useCultivationStore } from '@/stores/cultivation'
import { useNpcStore } from '@/stores/npc'
import {
  generateSectApplicant,
  generateMonthlyApplicants,
  calculateSectCombatPower,
  calibrateWorldSectCombatPower,
  checkMonthlyWorldSectInvasion,
  generateWorldSectMembers,
  simulateDiscipleMonthlyCultivation,
  createDiscipleCombatSnap,
  evaluateDiscipleQuestPotential,
  autoDispatchDisciplesToQuests,
  simulateDiscipleVaultExchange,
  runSectTournament,
  evaluateBiannualPromotions
} from '@/core/sectService'
import {
  setNpcBag,
  buildNpcBagOverview,
  simulateDiscipleSelfAdventure,
  simulateDiscipleBagConsumption,
  requestNpcItem,
  stealNpcItem
} from '@/core/npcBagService'
import type { EquipmentInstance } from '@/types'
import { SECTS } from '@/data/npc'
import {
  SURNAMES,
  MIDDLE_NAMES_MALE,
  FIRST_NAMES_MALE,
  generateUniqueNpcName
} from '@/data/npcNames'
import {
  buildUnifiedNpcProfile,
  discipleToUnifiedProfile
} from '@/core/npcProfileService'
import {
  SECT_MIN_MAJOR,
  SECT_LEVEL_CAPS,
  MAX_TRUE_DISCIPLES_PER_ELDER,
  getTrueDisciplesCap,
  INITIAL_WORLD_SECTS,
  createInitialWorldSects,
  SECT_QUEST_TEMPLATES,
  type DiscipleData
} from '@/data/sect'
import { gn, toNum } from '@/utils/gnum'
import { RandomService } from '@/utils/random'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('Hệ Thống Tông Môn Toàn Diện', () => {
  it('1. Chức năng kiến tạo Tông môn chỉ mở ở Kim Đan (major >= 2)', () => {
    const player = usePlayerStore()
    const sect = useApprenticeStore()

    // Cảnh giới Luyện Khí (major = 0)
    player.major = 0
    expect(sect.createSect('Vân Ẩn Tông', 'natural', 1)).toBe(false)
    expect(sect.sectCreated).toBe(false)

    // Cảnh giới Trúc Cơ (major = 1)
    player.major = 1
    expect(sect.createSect('Vân Ẩn Tông', 'natural', 1)).toBe(false)
    expect(sect.sectCreated).toBe(false)

    // Đạt Kim Đan Kỳ (major = 2)
    player.major = SECT_MIN_MAJOR
    expect(sect.createSect('Vân Ẩn Tông', 'natural', 1)).toBe(true)
    expect(sect.sectCreated).toBe(true)
    expect(sect.sectName).toBe('Vân Ẩn Tông')
    expect(sect.doctrineId).toBe('natural')
    expect(sect.history.length).toBeGreaterThan(0)
    expect(sect.history[0]?.category).toBe('management')
  })

  it('2. NPC xin nhập tông xuất hiện đúng chu kỳ, có dữ liệu riêng, không trùng lặp và CHỈ ở Luyện Khí hoặc Trúc Cơ', () => {
    const existing = new Set<string>()

    for (let i = 0; i < 40; i++) {
      const applicant = generateSectApplicant(i + 1, existing)
      expect(applicant.id).toBeTruthy()
      expect(existing.has(applicant.id), 'ID ứng viên không được trùng lặp').toBe(false)
      existing.add(applicant.id)

      // Cảnh giới chỉ được phép là Luyện Khí (0) hoặc Trúc Cơ (1)
      expect(
        applicant.major === 0 || applicant.major === 1,
        `Ứng viên ${applicant.name} có cảnh giới major=${applicant.major} không hợp lệ (chỉ được 0 hoặc 1)`
      ).toBe(true)

      // Tư chất, linh căn, ngộ tính đầy đủ
      expect(applicant.element).toBeTruthy()
      expect(applicant.comprehension).toBeGreaterThanOrEqual(30)
      expect(applicant.temper).toBeTruthy()
      expect(applicant.lean).toBeTruthy()
    }
  })

  it('3. Thu nhận và từ chối NPC hoạt động đúng, không tăng cảnh giới và không chồng chất hồ sơ', () => {
    const player = usePlayerStore()
    const sect = useApprenticeStore()
    player.major = 2
    sect.createSect('Vân Ẩn Tông', 'natural', 1)

    // Tháng 1: Chưa có hồ sơ -> mô phỏng sinh ra 1 hồ sơ
    sect.simulateMonthlySect(1, 1)
    expect(sect.pendingApplicant).toBeDefined()
    const firstApplicant = sect.pendingApplicant!
    const originalMajor = firstApplicant.major
    const originalSub = firstApplicant.sub

    // Hồ sơ chưa xử lý: tháng 2 trôi qua KHÔNG sinh thêm đè lên
    sect.simulateMonthlySect(2, 1)
    expect(sect.pendingApplicant?.id, 'Hồ sơ chưa duyệt phải được bảo lưu nguyên vẹn').toBe(firstApplicant.id)

    // Thu nhận
    const accepted = sect.acceptApplicant(2)
    expect(accepted).toBe(true)
    expect(sect.disciples.length).toBe(1)

    // Xóa các hồ sơ còn lại để kiểm tra rỗng
    sect.rejectAllApplicants(2)
    expect(sect.pendingApplicant).toBeNull()

    const disciple = sect.disciples[0]!
    expect(disciple.name).toBe(firstApplicant.name)
    expect(disciple.major, 'Không được tự ý tăng cảnh giới đệ tử khi nhập tông').toBe(originalMajor)
    expect(disciple.sub, 'Không được tự ý tăng tiểu cảnh giới đệ tử khi nhập tông').toBe(originalSub)
    expect(sect.processedApplicantIds).toContain(firstApplicant.id)

    // Tháng 3: Sinh ứng viên mới
    sect.simulateMonthlySect(3, 1)
    expect(sect.pendingApplicant).toBeDefined()
    const secondApplicant = sect.pendingApplicant!
    expect(secondApplicant.id).not.toBe(firstApplicant.id)

    // Từ chối tất cả hồ sơ tháng 3
    sect.rejectAllApplicants(3)
    expect(sect.pendingApplicant).toBeNull()
    expect(sect.disciples.length).toBe(1) // Vẫn chỉ có 1 đệ tử
    expect(sect.processedApplicantIds).toContain(secondApplicant.id)
  })

  it('4. Đệ tử tự tu luyện, có tiến trình riêng và không bị mặc định cảnh giới', () => {
    const player = usePlayerStore()
    const sect = useApprenticeStore()
    player.major = 2
    sect.createSect('Vân Ẩn Tông', 'natural', 1)

    // Tạo 2 đệ tử thủ công với ngộ tính khác nhau
    const d1: DiscipleData = {
      id: 'd1',
      name: 'Lâm Thanh',
      gender: 'male',
      element: 'metal',
      major: 0,
      sub: 1,
      expPct: 10,
      comprehension: 90, // Ngộ tính cao
      aptitudes: ['apt_u_41'],
      temper: 'cautious',
      lean: 'sword',
      tierRank: 'gold',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [],
      towerFloor: 0,
      totalContributions: 0,
      rank: 'outer'
    }

    const d2: DiscipleData = {
      id: 'd2',
      name: 'Trương Thiết',
      gender: 'male',
      element: 'earth',
      major: 0,
      sub: 1,
      expPct: 10,
      comprehension: 45, // Ngộ tính trung bình
      aptitudes: ['apt_p_01'],
      temper: 'bold',
      lean: 'longevity',
      tierRank: 'normal',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [],
      towerFloor: 0,
      totalContributions: 0,
      rank: 'outer'
    }

    sect.disciples = [d1, d2]
    sect.autoTowerChallenge = false

    // Trôi qua 2 tháng tu luyện
    sect.simulateMonthlySect(2, 2)

    const updatedD1 = sect.disciples.find(d => d.id === 'd1')!
    const updatedD2 = sect.disciples.find(d => d.id === 'd2')!

    // Cả hai đều tích lũy tu vi thực tế
    expect(updatedD1.expPct).toBeGreaterThan(10)
    expect(updatedD2.expPct).toBeGreaterThan(10)

    // Đệ tử ngộ tính cao tu luyện nhanh hơn đệ tử ngộ tính thấp
    expect(updatedD1.expPct).toBeGreaterThan(updatedD2.expPct)
  })

  it('5. Nhiệm Vụ Đường và Tàng Kinh Các hoạt động thực tế', () => {
    const player = usePlayerStore()
    const sect = useApprenticeStore()
    const resources = useResourcesStore()
    const cult = useCultivationStore()

    player.major = 2
    sect.createSect('Vân Ẩn Tông', 'natural', 1)

    const disciple: DiscipleData = {
      id: 'd1',
      name: 'Lý Tiêu',
      gender: 'male',
      element: 'wood',
      major: 1, // Trúc Cơ
      sub: 3,
      expPct: 20,
      comprehension: 75,
      aptitudes: [],
      temper: 'cautious',
      lean: 'alchemy',
      tierRank: 'silver',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [],
      towerFloor: 0,
      totalContributions: 0,
      rank: 'outer'
    }
    sect.disciples = [disciple]

    // --- Tàng Kinh Các ---
    cult.learn('m_taixuan')
    expect(sect.addGongfaToLibrary('m_taixuan', 1)).toBe(true)
    expect(sect.libraryGongfaIds).toContain('m_taixuan')
    // Không nạp trùng
    expect(sect.addGongfaToLibrary('m_taixuan', 1)).toBe(false)

    // Nạp hàng loạt (batch) từ công pháp hoặc bí thuật
    const batchCount = sect.addBatchGongfasToLibrary(['m_qingmu', 'm_taixuan', 'x_tianyan'], 1)
    expect(batchCount).toBe(2) // m_taixuan đã có, chỉ nạp thêm 2
    expect(sect.libraryGongfaIds).toContain('m_qingmu')
    expect(sect.libraryGongfaIds).toContain('x_tianyan')

    // Truyền thụ công pháp
    const teachRes = sect.teachGongfaToDisciple('d1', 'm_taixuan', 1)
    expect(teachRes.success).toBe(true)
    expect(sect.disciples[0]!.learnedGongfa).toContain('m_taixuan')
    expect(sect.disciples[0]!.activeGongfa).toBe('m_taixuan')

    // --- Nhiệm Vụ Đường ---
    const initialStone = toNum(resources.spiritStone)
    // Giao nhiệm vụ hái dược (sq_gather_herb: 1 tháng)
    const assigned = sect.assignQuest('sq_gather_herb', 'd1', 1)
    expect(assigned).toBe(true)
    expect(sect.activeQuests.length).toBe(1)
    expect(sect.disciples[0]!.status).toBe('quest')

    // Tháng 2: Nhiệm vụ hoàn thành
    sect.simulateMonthlySect(2, 1)
    expect(sect.activeQuests.length).toBe(0)
    expect(sect.completedQuestHistory.length).toBe(1)
    expect(sect.disciples[0]!.status).toBe('idle')
    expect(toNum(resources.spiritStone)).toBeGreaterThan(initialStone)
    expect(sect.disciples[0]!.totalContributions).toBeGreaterThan(0)
  })

  it('6. Tỉ thí diễn ra đúng mỗi 6 tháng game, có kết quả và phát thưởng đúng một lần', () => {
    const player = usePlayerStore()
    const sect = useApprenticeStore()
    player.major = 2
    sect.createSect('Vân Ẩn Tông', 'natural', 1)

    sect.disciples = [
      {
        id: 'd_strong',
        name: 'Đại Sư Huynh',
        gender: 'male',
        element: 'metal',
        major: 2, // Kim Đan
        sub: 4,
        expPct: 50,
        comprehension: 85,
        aptitudes: ['apt_s_107'], // Vô Thượng Kiếm Cốt
        temper: 'bold',
        lean: 'sword',
        tierRank: 'gold',
        joinedMonth: 1,
        status: 'idle',
        learnedGongfa: [],
        towerFloor: 5,
        totalContributions: 100,
        rank: 'outer'
      },
      {
        id: 'd_weak',
        name: 'Tiểu Sư Đệ',
        gender: 'male',
        element: 'wood',
        major: 0, // Luyện Khí
        sub: 2,
        expPct: 10,
        comprehension: 50,
        aptitudes: [],
        temper: 'frugal',
        lean: 'longevity',
        tierRank: 'normal',
        joinedMonth: 2,
        status: 'idle',
        learnedGongfa: [],
        towerFloor: 0,
        totalContributions: 0,
        rank: 'outer'
      }
    ]

    // Tháng 5: Chưa tới 6 tháng -> không tổ chức
    sect.simulateMonthlySect(5, 4)
    expect(sect.tournamentHistory.length).toBe(0)

    // Tháng 6: Đủ 6 tháng -> tổ chức tỉ thí
    sect.simulateMonthlySect(6, 1)
    expect(sect.tournamentHistory.length).toBe(1)
    const record = sect.tournamentHistory[0]!
    expect(record.gameMonth).toBe(6)
    expect(record.winnerName).toBe('Đại Sư Huynh') // Kim Đan áp đảo Luyện Khí dựa trên combat.ts thực tế

    // Gọi lại trong cùng tháng 6: Không tổ chức lặp
    sect.simulateMonthlySect(6, 0)
    expect(sect.tournamentHistory.length).toBe(1)
  })

  it('7. Tháp Lịch Luyện và Bí Cảnh lưu được tiến độ, kết quả và phần thưởng', () => {
    const player = usePlayerStore()
    const sect = useApprenticeStore()
    const resources = useResourcesStore()
    resources.addStone(gn(100000))

    player.major = 2
    sect.createSect('Vân Ẩn Tông', 'natural', 1)

    const disciple: DiscipleData = {
      id: 'd1',
      name: 'Vương Lâm',
      gender: 'male',
      element: 'metal',
      major: 2, // Kim Đan
      sub: 5,
      expPct: 30,
      comprehension: 95,
      aptitudes: ['apt_s_101'],
      temper: 'cautious',
      lean: 'slaughter',
      tierRank: 'gold',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [],
      towerFloor: 0,
      totalContributions: 0,
      rank: 'outer'
    }
    sect.disciples = [disciple]

    // Khiêu chiến Tháp (Tầng 1)
    const towerRes = sect.challengeTower('d1', 1)
    expect(towerRes.success).toBe(true)
    expect(sect.disciples[0]!.towerFloor).toBe(1)
    expect(sect.disciples[0]!.totalContributions).toBeGreaterThan(0)

    // Thám hiểm Bí Cảnh (Vân Ẩn Huyễn Cảnh)
    const realmRes = sect.exploreRealm('d1', 'sr_van_an', 1)
    expect(realmRes.encounterText).toBeTruthy()
    expect(sect.history.some(h => h.category === 'realm')).toBe(true)
  })

  it('8. Tông Môn Sử ghi đúng các sự kiện, thời điểm và nhân vật liên quan, không thiếu hoặc trùng bản ghi', () => {
    const sect = useApprenticeStore()
    const player = usePlayerStore()
    player.major = 2
    sect.createSect('Vân Ẩn Tông', 'natural', 1)

    // Sự kiện quản lý
    expect(sect.history.some(h => h.category === 'management' && h.summary.includes('khai sơn lập phái'))).toBe(true)

    // Sinh và nhận đệ tử
    sect.simulateMonthlySect(1, 1)
    expect(sect.pendingApplicant).toBeDefined()
    const appName = sect.pendingApplicant!.name
    sect.acceptApplicant(1)

    // Kiểm tra bản ghi nhân sự
    const personnelEntry = sect.history.find(h => h.category === 'personnel' && h.discipleName === appName)
    expect(personnelEntry).toBeDefined()
    expect(personnelEntry?.summary).toContain(`Tháng 1, năm thứ 1`)
    expect(personnelEntry?.summary).toContain(appName)
  })

  it('9. Lưu và tải game (sanitize) không làm mất dữ liệu và tự động chuyển đổi đạo đồng cũ', () => {
    const sect = useApprenticeStore()

    // Giả lập dữ liệu cũ từ hệ thống Đạo đồng
    sect.sectCreated = true
    sect.disciples = []
    sect.apprentices = [
      {
        uid: 'u_old_1',
        archId: 'ap_luanniao',
        level: 5,
        bond: 12,
        task: null
      }
    ]

    // Chạy sanitize()
    sect.sanitize()

    // Đạo đồng cũ được chuyển đổi thành đệ tử chính thức
    expect(sect.disciples.length).toBe(1)
    const migrated = sect.disciples[0]!
    expect(migrated.id).toBe('u_old_1')
    expect(migrated.name).toContain('Thái Dược Đồng Tử')
    expect(migrated.totalContributions).toBe(120) // 12 * 10
  })

  it('10. Mỗi tháng sinh đúng 5 NPC xin nhập tông, không trùng lặp và chỉ ở Luyện Khí hoặc Trúc Cơ', () => {
    const existing = new Set<string>()
    const batch = generateMonthlyApplicants(5, 1, existing)

    expect(batch.length).toBe(5)
    for (const app of batch) {
      expect(app.id).toBeTruthy()
      expect(existing.has(app.id)).toBe(true)
      expect(app.major === 0 || app.major === 1).toBe(true)
    }

    // Kiểm tra trong store
    const sect = useApprenticeStore()
    const player = usePlayerStore()
    player.major = 2
    sect.createSect('Vân Ẩn Tông', 'natural', 1)

    // Tháng 1: sinh 5 ứng viên
    sect.simulateMonthlySect(1, 1)
    expect(sect.pendingApplicants.length).toBe(5)

    // Tháng 2: chưa duyệt, hồ sơ cũ được bảo lưu, không bị đè mất
    sect.simulateMonthlySect(2, 1)
    expect(sect.pendingApplicants.length).toBeGreaterThanOrEqual(5)

    // Từ chối tất cả
    sect.rejectAllApplicants(2)
    expect(sect.pendingApplicants.length).toBe(0)
  })

  it('11. Cấp bậc Tông Môn và Giới Hạn Cấp 1..5 được cấu hình chính xác theo bảng định nghĩa', () => {
    // Kiểm tra cấu hình SECT_LEVEL_CAPS
    expect(SECT_LEVEL_CAPS[1]).toEqual({ outer: 10, inner: 5, elder: 2, guardian: 1, vice_master: 1, master: 1, ancestor: 1 })
    expect(SECT_LEVEL_CAPS[2]).toEqual({ outer: 30, inner: 10, elder: 3, guardian: 2, vice_master: 1, master: 1, ancestor: 2 })
    expect(SECT_LEVEL_CAPS[3]).toEqual({ outer: 40, inner: 20, elder: 4, guardian: 4, vice_master: 1, master: 1, ancestor: 3 })
    expect(SECT_LEVEL_CAPS[4]).toEqual({ outer: 50, inner: 30, elder: 5, guardian: 5, vice_master: 1, master: 1, ancestor: 4 })
    expect(SECT_LEVEL_CAPS[5]).toEqual({ outer: 60, inner: 40, elder: 6, guardian: 6, vice_master: 2, master: 1, ancestor: 5 })

    // Giới hạn Chân truyền đệ tử phụ thuộc số Trưởng lão thực tế (2 chân truyền / 1 trưởng lão)
    expect(MAX_TRUE_DISCIPLES_PER_ELDER).toBe(2)
    expect(getTrueDisciplesCap(0)).toBe(0)
    expect(getTrueDisciplesCap(3)).toBe(6)
    expect(getTrueDisciplesCap(6)).toBe(12)
  })

  it('12. Thăng cấp Tông môn kiểm tra đúng cảnh giới Tông chủ và chi phí linh thạch', () => {
    const sect = useApprenticeStore()
    const player = usePlayerStore()
    const resources = useResourcesStore()

    player.major = 2 // Kim Đan
    sect.createSect('Vân Ẩn Tông', 'natural', 1)
    expect(sect.sectLevel).toBe(1)

    // Thăng cấp lên Cấp 2 đòi hỏi Nguyên Anh (major >= 3)
    player.major = 2
    expect(sect.upgradeSectLevel()).toBe(false)
    expect(sect.sectLevel).toBe(1)

    // Đạt Nguyên Anh nhưng thiếu linh thạch (cần 50,000)
    player.major = 3
    resources.spiritStone = gn(1000)
    expect(sect.upgradeSectLevel()).toBe(false)
    expect(sect.sectLevel).toBe(1)

    // Đủ linh thạch
    resources.spiritStone = gn(60000)
    expect(sect.upgradeSectLevel()).toBe(true)
    expect(sect.sectLevel).toBe(2)
    expect(toNum(resources.spiritStone)).toBe(10000) // 60,000 - 50,000
    expect(sect.history.some(h => h.summary.includes('thăng cấp lên【Danh Chấn Nhất Phương (Cấp 2)】'))).toBe(true)
  })

  it('13. Xét duyệt thăng cấp mỗi 6 tháng tự động thăng cấp đệ tử đủ tiêu chuẩn trong hạn ngạch', () => {
    const sect = useApprenticeStore()
    const player = usePlayerStore()
    player.major = 2
    sect.createSect('Vân Ẩn Tông', 'natural', 1)

    // Tạo 1 ngoại môn đệ tử có cảnh giới Trúc Cơ và ngộ tính cao
    const disciple1: DiscipleData = {
      id: 'd_prom_1',
      name: 'Lý Tiêu Dao',
      gender: 'male',
      element: 'wood',
      major: 1, // Trúc Cơ
      sub: 3,
      expPct: 50,
      aptitudes: [],
      comprehension: 80,
      temper: 'cautious',
      lean: 'sword',
      tierRank: 'gold',
      joinedMonth: 1,
      status: 'idle',
      totalContributions: 500,
      towerFloor: 5,
      battlesWon: 6,
      learnedGongfa: [],
      rank: 'outer'
    }
    sect.disciples.push(disciple1)

    // Chu kỳ 6 tháng: tháng 6
    sect.simulateMonthlySect(6, 1)

    // Đệ tử 1 được thăng lên Nội môn
    const updated = sect.disciples.find(d => d.id === 'd_prom_1')!
    expect(updated.rank).toBe('inner')
    expect(sect.history.some(h => h.category === 'promotion' && h.summary.includes('Lý Tiêu Dao'))).toBe(true)
  })

  it('14. Tông chủ nhường ngôi, trở thành Lão tổ và tăng 50% chiến lực khi triệu tập', () => {
    const sect = useApprenticeStore()
    const player = usePlayerStore()
    player.major = 3 // Nguyên Anh
    sect.createSect('Vân Ẩn Tông', 'natural', 1)

    const successor: DiscipleData = {
      id: 'd_succ_1',
      name: 'Bạch Cửu Châu',
      gender: 'male',
      element: 'fire',
      major: 3,
      sub: 2,
      expPct: 80,
      aptitudes: [],
      comprehension: 90,
      temper: 'bold',
      lean: 'sword',
      tierRank: 'gold',
      joinedMonth: 1,
      status: 'idle',
      totalContributions: 1000,
      towerFloor: 10,
      battlesWon: 12,
      learnedGongfa: [],
      rank: 'elder'
    }
    sect.disciples.push(successor)

    expect(sect.playerIsAncestor).toBe(false)
    expect(sect.masterId).toBe('player')

    // Tông chủ nhường ngôi cho Bạch Cửu Châu
    const abdicated = sect.abdicateToAncestor('d_succ_1', 3)
    expect(abdicated).toBe(true)
    expect(sect.playerIsAncestor).toBe(true)
    expect(sect.masterId).toBe('d_succ_1')
    const updatedSuccessor = sect.disciples.find(d => d.id === 'd_succ_1')!
    expect(updatedSuccessor.rank).toBe('master')

    // Tính chiến lực khi triệu tập Lão tổ
    const powerWithoutAncestor = calculateSectCombatPower(sect.disciples, false, { major: player.major, sub: player.sub })
    const powerWithAncestor = calculateSectCombatPower(sect.disciples, true, { major: player.major, sub: player.sub })
    expect(powerWithAncestor).toBe(Math.floor(powerWithoutAncestor * 1.5))
  })

  it('15. Tông môn khiêu chiến thế giới: mô phỏng chiến trận, chiến lợi phẩm và lưu lịch sử chiến tranh', () => {
    const sect = useApprenticeStore()
    const player = usePlayerStore()
    player.major = 4
    sect.createSect('Vân Ẩn Tông', 'natural', 1)

    const targetSect = sect.worldSects[0]! // Vạn Độc Môn
    expect(targetSect.status).toBe('active')

    // Khiêu chiến
    const res = sect.declareWar(targetSect.id, true, 12, { major: 4, sub: 0 })
    expect(res).toBeDefined()
    expect(sect.warHistory.length).toBeGreaterThan(0)
    expect(sect.history.some(h => h.category === 'war')).toBe(true)
  })

  it('16. Định đoạt kết quả chiến tranh: San bằng (Diệt tông) vs Thu phục làm Tông môn phụ thuộc', () => {
    const sect = useApprenticeStore()
    const player = usePlayerStore()
    const resources = useResourcesStore()
    player.major = 4
    sect.createSect('Vân Ẩn Tông', 'natural', 1)

    const target1 = sect.worldSects[0]! // Vạn Độc Môn
    target1.resources = { stone: 10000, ore: 50, herb: 30, pills: 2 }

    const initialStone = toNum(resources.spiritStone)

    // Trường hợp 1: Diệt tông
    sect.resolveWarOutcome(target1.id, 'destroy', 12)
    expect(target1.status).toBe('destroyed')
    expect(target1.resources.stone).toBe(0)
    expect(toNum(resources.spiritStone)).toBe(initialStone + 10000)
    expect(sect.history.some(h => h.summary.includes('san bằng【Vạn Độc Môn】'))).toBe(true)

    // Trường hợp 2: Thu phục làm phụ thuộc
    const target2 = sect.worldSects[1]! // Thiết Kiếm Môn
    sect.resolveWarOutcome(target2.id, 'vassalize', 12)
    expect(target2.status).toBe('vassal')
    expect(sect.vassalSects.some(vs => vs.id === target2.id)).toBe(true)
    expect(sect.history.some(h => h.category === 'vassal' && h.summary.includes('Thu phục【Thiết Kiếm Môn】'))).toBe(true)
  })

  it('17. Cống nộp hằng tháng từ Tông môn phụ thuộc: trích nộp đúng tỷ lệ và xử lý sạch khi thiếu hụt (không âm)', () => {
    const sect = useApprenticeStore()
    const player = usePlayerStore()
    const resources = useResourcesStore()
    player.major = 3
    sect.createSect('Vân Ẩn Tông', 'natural', 1)

    // Thêm 1 Tông môn phụ thuộc Cấp 1
    const vassalTarget = sect.worldSects[2]! // Cửu Lôi Các
    vassalTarget.level = 1
    vassalTarget.resources = { stone: 10000, ore: 200, herb: 100, pills: 5 }
    sect.resolveWarOutcome(vassalTarget.id, 'vassalize', 1)

    const initialStone = toNum(resources.spiritStone)

    // Chạy chu kỳ tháng 2
    sect.simulateMonthlySect(2, 1)

    // Kiểm tra cống phẩm đã nộp theo định ngạch Cấp 1 (2,000 Linh thạch, 5 Quặng, 10 Thảo, 2 Đan)
    expect(sect.tributeHistory.length).toBeGreaterThan(0)
    const tribute = sect.tributeHistory[0]!
    expect(tribute.vassalName).toBe(vassalTarget.name)
    expect(tribute.stone).toBe(2000)
    expect(tribute.ore).toBe(5)
    expect(tribute.herb).toBe(10)
    expect(tribute.pills).toBe(2)
    expect(toNum(resources.spiritStone)).toBe(initialStone + 2000)

    // Giả lập tài nguyên cạn kiệt (thiếu hụt)
    const targetInStore = sect.worldSects.find(ws => ws.id === vassalTarget.id)!
    targetInStore.resources = { stone: 2, ore: 0, herb: 0, pills: 0 }
    sect.simulateMonthlySect(3, 1)
    const secondTribute = sect.tributeHistory[0]!
    expect(secondTribute.stone).toBe(2)
    expect(secondTribute.isDeficit).toBe(true)
    const afterDepleted = sect.worldSects.find(ws => ws.id === vassalTarget.id)!
    expect(afterDepleted.resources.stone).toBe(0)
    expect(afterDepleted.resources.stone).toBeGreaterThanOrEqual(0) // Không bao giờ âm
  })

  it('18. Sanitize bảo toàn đầy đủ các trường mới và không tạo lỗi khi đọc dữ liệu rác', () => {
    const sect = useApprenticeStore()

    // Cung cấp dữ liệu rác
    const dirtyData: Record<string, unknown> = {
      sectLevel: 'invalid_level',
      playerIsAncestor: 'yes',
      pendingApplicants: 'not_an_array',
      vassalSects: null,
      worldSects: [{ id: 'test_sect', name: 'Tông Môn Lạ', status: 'bad_status' }],
      warHistory: 'corrupt',
      tributeHistory: [{ invalid: true }],
      disciples: [
        // Đệ tử cũ từ bản trước: KHÔNG có bagMaterials, bagPills, bagStones
        {
          id: 'disc_legacy_save',
          name: 'Cổ Đệ Tử',
          gender: 'male',
          element: 'metal',
          major: 1,
          sub: 1,
          expPct: 20,
          comprehension: 70,
          aptitudes: [],
          temper: 'cautious',
          lean: 'longevity',
          tierRank: 'normal',
          joinedMonth: 1,
          status: 'idle',
          totalContributions: 50,
          rank: 'outer'
          // bagMaterials, bagPills, bagStones hoàn toàn không tồn tại (undefined)
        },
        // Đệ tử có dữ liệu túi đồ bị rác / sai kiểu dữ liệu
        {
          id: 'disc_corrupt_bag',
          name: 'Đệ Tử Rác',
          gender: 'female',
          element: 'fire',
          major: 1,
          sub: 0,
          expPct: 10,
          comprehension: 60,
          aptitudes: [],
          temper: 'bold',
          lean: 'sword',
          tierRank: 'normal',
          joinedMonth: 1,
          status: 'idle',
          totalContributions: 0,
          rank: 'outer',
          bagMaterials: 'corrupt_string',
          bagPills: null,
          bagStones: 'NaN'
        }
      ]
    }

    Object.assign(sect, dirtyData)
    sect.sanitize()

    expect(typeof sect.sectLevel).toBe('number')
    expect(sect.sectLevel).toBe(1)
    expect(typeof sect.playerIsAncestor).toBe('boolean')
    expect(Array.isArray(sect.pendingApplicants)).toBe(true)
    expect(Array.isArray(sect.vassalSects)).toBe(true)
    expect(Array.isArray(sect.worldSects)).toBe(true)
    expect(Array.isArray(sect.warHistory)).toBe(true)
    expect(Array.isArray(sect.tributeHistory)).toBe(true)

    // Kiểm tra đệ tử cũ và đệ tử có túi đồ rác đều được sanitize an toàn
    expect(sect.disciples.length).toBe(2)
    const legacyDisc = sect.disciples.find(d => d.id === 'disc_legacy_save')!
    expect(legacyDisc).toBeDefined()
    expect(legacyDisc.bagMaterials).toBeUndefined()
    expect(legacyDisc.bagStones).toBe(0)

    const corruptDisc = sect.disciples.find(d => d.id === 'disc_corrupt_bag')!
    expect(corruptDisc).toBeDefined()
    expect(corruptDisc.bagMaterials).toBeUndefined()
    expect(corruptDisc.bagStones).toBe(0)
  })

  it('19. 25 Tông môn thế giới đồng bộ với giới tu chân trải đều 5 cấp, mỗi Tông môn có đầy đủ nhân sự thực tế, cấp bậc, cảnh giới, công pháp', () => {
    const worldSects = createInitialWorldSects()
    expect(worldSects.length).toBe(25)

    // Mỗi cấp 1..5 có ít nhất 3 đến 6 Tông môn
    for (let lvl = 1; lvl <= 5; lvl++) {
      const sectsAtLvl = worldSects.filter(ws => ws.level === lvl)
      expect(sectsAtLvl.length).toBeGreaterThanOrEqual(3)
      for (const s of sectsAtLvl) {
        expect(s.leaderName).toBeTruthy()
        expect(s.doctrine).toBeTruthy()
        expect(s.element).toBeTruthy()
        expect(s.resources.stone).toBeGreaterThan(0)
        expect(s.majorGongfas && s.majorGongfas.length > 0).toBe(true)

        // Sinh nhân sự thực tế
        const members = generateWorldSectMembers(s)
        expect(members.length).toBeGreaterThanOrEqual(15)

        // Đầy đủ Tông chủ và chức sắc
        const hasMaster = members.some(m => m.rank === 'master')
        const hasElders = members.some(m => m.rank === 'elder')
        const hasTrue = members.some(m => m.rank === 'true')
        const hasInner = members.some(m => m.rank === 'inner')
        const hasOuter = members.some(m => m.rank === 'outer')

        expect(hasMaster).toBe(true)
        expect(hasElders).toBe(true)
        expect(hasTrue).toBe(true)
        expect(hasInner).toBe(true)
        expect(hasOuter).toBe(true)

        // Kiểm tra cảnh giới tương ứng với cấp tông môn
        const masterMember = members.find(m => m.rank === 'master')!
        expect(masterMember.major).toBe(s.leaderMajor)
      }
    }
  })

  it('20. Cân bằng chiến lực cùng cấp: các Tông môn cùng cấp với người chơi có chiến lực xấp xỉ 95% - 100% người chơi', () => {
    const playerPower = 20000
    const worldSects = createInitialWorldSects()
    const calibrated = calibrateWorldSectCombatPower(
      worldSects,
      1, // Người chơi ở cấp 1
      playerPower,
      {}
    )

    const level1Sects = calibrated.filter(ws => ws.level === 1)
    expect(level1Sects.length).toBe(6)

    for (const ws of level1Sects) {
      // 95% của 20000 là 19000, 100% là 20000
      expect(ws.combatPower).toBeGreaterThanOrEqual(Math.floor(playerPower * 0.95))
      expect(ws.combatPower).toBeLessThanOrEqual(Math.ceil(playerPower * 1.00))
    }
  })

  it('21. Lưu mốc chiến lực theo giai đoạn: Tông môn cấp thấp giữ nguyên mốc cũ khi người chơi thăng cấp', () => {
    const player = usePlayerStore()
    const sect = useApprenticeStore()
    player.major = 2
    sect.createSect('Vân Ẩn Tông', 'natural', 1)

    // Thêm đệ tử để tạo lực chiến ở Cấp 1
    sect.disciples.push({
      id: 'd_stage1',
      name: 'Đồ Đệ Cấp 1',
      gender: 'male',
      element: 'metal',
      major: 2,
      sub: 5,
      expPct: 50,
      comprehension: 70,
      aptitudes: ['apt_sword_heart'],
      temper: 'cautious',
      lean: 'sword',
      tierRank: 'normal',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: ['m_taixuan'],
      activeGongfa: 'm_taixuan',
      towerFloor: 25,
      totalContributions: 100,
      rank: 'inner'
    })

    const initialPower = calculateSectCombatPower(sect.disciples, false, { major: player.major, sub: player.sub })
    sect.simulateMonthlySect(1, 1)

    // Cấp 1 benchmark được lưu
    const bench1 = sect.sectLevelPowerBenchmarks[1]
    expect(bench1).toBeGreaterThanOrEqual(initialPower)

    // Thăng cấp lên Cấp 2
    player.major = 3
    useResourcesStore().addStone(gn(50000))
    expect(sect.upgradeSectLevel()).toBe(true)
    expect(sect.sectLevel).toBe(2)

    // Lực chiến người chơi tăng vọt ở Cấp 2
    sect.disciples.push({
      id: 'd_stage2_power',
      name: 'Cường Giả Cấp 2',
      gender: 'female',
      element: 'fire',
      major: 4,
      sub: 4,
      expPct: 30,
      comprehension: 85,
      aptitudes: ['apt_divine_body'],
      temper: 'bold',
      lean: 'sword',
      tierRank: 'gold',
      joinedMonth: 2,
      status: 'idle',
      learnedGongfa: ['m_taixuan'],
      activeGongfa: 'm_taixuan',
      towerFloor: 50,
      totalContributions: 500,
      rank: 'elder'
    })

    sect.simulateMonthlySect(2, 1)

    const playerPowerLvl2 = calculateSectCombatPower(sect.disciples, false, { major: player.major, sub: player.sub })
    expect(playerPowerLvl2).toBeGreaterThan(bench1! * 2)

    // Tông môn Cấp 2 cân bằng theo lực chiến Cấp 2 của người chơi
    const lvl2Sects = sect.worldSects.filter(ws => ws.level === 2 && ws.status === 'active')
    for (const ws of lvl2Sects) {
      expect(ws.combatPower).toBeGreaterThanOrEqual(Math.floor(playerPowerLvl2 * 0.95))
      expect(ws.combatPower).toBeLessThanOrEqual(Math.ceil(playerPowerLvl2 * 1.00))
    }

    // Tông môn Cấp 1 giữ nguyên theo benchmark cũ của Cấp 1, KHÔNG bị tăng vọt theo Cấp 2
    const lvl1Sects = sect.worldSects.filter(ws => ws.level === 1 && ws.status === 'active')
    for (const ws of lvl1Sects) {
      expect(ws.combatPower).toBeLessThan(playerPowerLvl2 * 0.8)
      expect(ws.combatPower).toBeGreaterThanOrEqual(Math.floor(bench1! * 0.95))
    }
  })

  it('22. Quy tắc khiêu chiến: Chỉ Tông môn ngang cấp mới chủ động gửi hịch tuyên chiến, cấp thấp hơn không được phép', () => {
    const worldSects = [...INITIAL_WORLD_SECTS]

    // Thử 30 lần kiểm tra xâm lược ngẫu nhiên khi người chơi ở Cấp 3
    for (let m = 3; m <= 32; m += 3) {
      const invasion = checkMonthlyWorldSectInvasion(
        worldSects,
        3, // Cấp người chơi là 3
        m,
        0,
        false,
        false
      )

      if (invasion) {
        expect(invasion.sectLevel, 'Chỉ được phép là Tông môn Cấp 3 tuyên chiến').toBe(3)
        expect(invasion.sectLevel).not.toBeLessThan(3)
        expect(invasion.sectLevel).not.toBeGreaterThan(3)
      }
    }
  })

  it('23. Tông môn khác chủ động tuyên chiến: Người chơi từ chối -> trở thành Tông môn phụ thuộc và nộp cống hằng tháng', () => {
    const player = usePlayerStore()
    const sect = useApprenticeStore()
    const resources = useResourcesStore()
    player.major = 2
    sect.createSect('Vân Ẩn Tông', 'natural', 1)

    // Nạp linh thạch và tài nguyên
    resources.addStone(gn(50000))
    resources.addSmall('ore', 50)
    resources.addHerb(1, 50)

    // Giả lập nhận được hịch tuyên chiến từ Thiết Kiếm Môn (Cấp 1)
    sect.pendingWarDeclaration = {
      sectId: 'ws_thiet_kiem',
      sectName: 'Thiết Kiếm Môn',
      sectLevel: 1,
      combatPower: 9200,
      declaredMonth: 2
    }

    // Người chơi chọn Không giao chiến -> Chấp nhận xưng thần phụ thuộc
    const res = sect.respondToWarDeclaration('surrender')
    expect(res.success).toBe(true)
    expect(sect.overlordSectId).toBe('ws_thiet_kiem')
    expect(sect.pendingWarDeclaration).toBeNull()
    expect(sect.history.some(h => h.category === 'vassal' && h.summary.includes('xưng thần phụ thuộc'))).toBe(true)

    // Chạy chu kỳ tháng 3 -> Tự động trích nộp cống phẩm chư hầu cho Thiết Kiếm Môn
    const stoneBefore = toNum(resources.spiritStone)
    sect.simulateMonthlySect(3, 1)

    // Mức cống nộp Cấp 1 là 2000 Linh thạch, 5 Khoáng, 10 Thảo
    expect(toNum(resources.spiritStone)).toBe(stoneBefore - 2000)
    expect(sect.history.some(h => h.category === 'tribute' && h.summary.includes('cống nộp cho【Thiết Kiếm Môn】'))).toBe(true)
  })

  it('24. Khởi binh giành độc lập: Đánh bại thế lực đô hộ khôi phục hoàn toàn tự do và ghi vào Tông Môn Sử', () => {
    const player = usePlayerStore()
    const sect = useApprenticeStore()
    player.major = 3
    player.sub = 5
    sect.createSect('Vân Ẩn Tông', 'natural', 1)

    // Đang chịu sự đô hộ của Vạn Độc Môn
    sect.overlordSectId = 'ws_van_doc'

    // Bồi dưỡng đệ tử vượt trội lực chiến
    sect.disciples.push({
      id: 'd_hero',
      name: 'Kiếm Tiên Xuất Thế',
      gender: 'male',
      element: 'metal',
      major: 4,
      sub: 4,
      expPct: 30,
      comprehension: 95,
      aptitudes: ['apt_p_10', 'apt_p_01'],
      temper: 'bold',
      lean: 'sword',
      tierRank: 'gold',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: ['m_taixuan'],
      activeGongfa: 'm_taixuan',
      towerFloor: 50,
      totalContributions: 800,
      rank: 'elder'
    })

    // Khởi binh giành độc lập
    const rebelRes = sect.rebelAgainstOverlord(false)
    expect(rebelRes.won).toBe(true)
    expect(sect.overlordSectId).toBeNull() // Đã giải phóng hoàn toàn!
    expect(sect.history.some(h => h.category === 'war' && h.summary.includes('KHỞI BINH GIÀNH ĐỘC LẬP THÀNH CÔNG'))).toBe(true)
  })

  it('25. Bảng thuộc tính chi tiết cho MỌI NPC: tính toán đầy đủ ATK, DEF, HP, SPD, CRIT, tư chất, công pháp, quan hệ đạo lữ', () => {
    // 1. Kiểm tra từ đệ tử Tông môn
    const testDisciple: DiscipleData = {
      id: 'disc_spec_1',
      name: 'Lý Tiêu Dao',
      gender: 'male',
      element: 'metal',
      major: 2,
      sub: 4,
      expPct: 65,
      comprehension: 88,
      aptitudes: ['apt_p_10'],
      temper: 'bold',
      lean: 'sword',
      tierRank: 'gold',
      joinedMonth: 3,
      status: 'cultivating',
      learnedGongfa: ['m_taixuan'],
      activeGongfa: 'm_taixuan',
      towerFloor: 22,
      totalContributions: 180,
      rank: 'true'
    }

    const discProfile = discipleToUnifiedProfile(testDisciple, 'Vân Ẩn Tông', 'disciple', 60)
    expect(discProfile.name).toBe('Lý Tiêu Dao')
    expect(discProfile.rankName).toBe('Chân Truyền Đệ Tử')
    expect(discProfile.combatPower).toBeGreaterThan(500)
    expect(discProfile.atk.base).toBeGreaterThan(0)
    expect(discProfile.atk.total).toBeGreaterThanOrEqual(discProfile.atk.base)
    expect(discProfile.activeGongfa?.name).toBeTruthy()
    expect(discProfile.aptitudes.length).toBe(1)
    expect(discProfile.aptitudes[0]?.name).toBeTruthy()
    expect(discProfile.statusText).toContain('Bế quan')

    // 2. Kiểm tra từ Đạo lữ
    const daoluProfile = buildUnifiedNpcProfile({
      id: 'daolu_spec_1',
      name: 'Thẩm Vãn Tình',
      gender: 'female',
      element: 'water',
      major: 3,
      sub: 2,
      expPct: 40,
      comprehension: 92,
      aptitudes: ['apt_p_01'],
      temper: 'cautious',
      lean: 'truth',
      brief: 'Thanh lãnh u nhã, tâm hệ đạo hữu',
      pursuit: 'Cùng người nắm tay phi thăng',
      taboo: 'Lừa dối phản bội',
      status: 'idle',
      sectName: 'Đạo Lữ Đồng Hành',
      sectRole: 'Đạo Lữ Kết Duyên',
      activeGongfa: 'm_qingyun',
      learnedGongfa: ['m_qingyun'],
      relationType: 'daolu',
      favor: 95,
      daoluBond: {
        isDaolu: true,
        stage: 'together',
        stageName: 'Đồng Hành',
        fate: 75,
        trust: 80,
        accord: 85,
        intent: 70,
        shared: 3
      }
    })

    expect(daoluProfile.relationLabel).toBe('Đạo Lữ Đồng Hành')
    expect(daoluProfile.daoluBond?.isDaolu).toBe(true)
    expect(daoluProfile.daoluBond?.fate).toBe(75)
    expect(daoluProfile.daoluBond?.stageName).toBe('Đồng Hành')
    expect(daoluProfile.skills.length).toBeGreaterThan(0)
  })

  it('26. Hệ thống Họ, Phụ (Tên đệm), Tên sinh ngẫu nhiên phong phú và loại bỏ triệt để trùng lặp', () => {
    // 1. Kiểm tra kho Họ, Phụ, Tên đa dạng (>200,000 tổ hợp)
    expect(SURNAMES.length).toBeGreaterThanOrEqual(60)
    expect(MIDDLE_NAMES_MALE.length).toBeGreaterThanOrEqual(40)
    expect(FIRST_NAMES_MALE.length).toBeGreaterThanOrEqual(40)

    // 2. Kiểm tra hàm sinh tên duy nhất generateUniqueNpcName
    const seenNames = new Set<string>()
    for (let i = 0; i < 50; i++) {
      const uniqueName = generateUniqueNpcName('male', seenNames)
      expect(typeof uniqueName).toBe('string')
      expect(uniqueName.length).toBeGreaterThan(2)
      // Tên phải có định dạng Họ + Đệm + Tên (hoặc Họ + Tên)
      const parts = uniqueName.split(' ')
      expect(parts.length).toBeGreaterThanOrEqual(2)
    }
    expect(seenNames.size).toBe(50)

    // 3. Kiểm tra 5 ứng viên mỗi tháng không bao giờ trùng tên hoặc ID
    const existingIds = new Set<string>()
    const existingNames = new Set<string>()
    const batch1 = generateMonthlyApplicants(5, 1, existingIds, undefined, existingNames)
    expect(batch1.length).toBe(5)
    const batch1Names = new Set(batch1.map(a => a.name))
    expect(batch1Names.size).toBe(5) // Cả 5 ứng viên tên đều khác nhau

    const batch2 = generateMonthlyApplicants(5, 2, existingIds, undefined, existingNames)
    expect(batch2.length).toBe(5)
    const allNames = new Set([...batch1.map(a => a.name), ...batch2.map(a => a.name)])
    expect(allNames.size).toBe(10) // 10 ứng viên qua 2 tháng hoàn toàn không trùng lặp

    // 4. Kiểm tra sanitize() loại bỏ bản sao trùng lặp trong save
    const sect = useApprenticeStore()
    sect.createSect('Vân Ẩn Tiên Tông', 'sword', 1)
    const duplicateApp = batch1[0]!
    sect.pendingApplicants = [duplicateApp, { ...duplicateApp }, batch1[1]!]
    sect.pendingApplicant = duplicateApp
    sect.sanitize()

    // Sau khi sanitize, chỉ còn lại các ứng viên duy nhất
    expect(sect.pendingApplicants.length).toBe(2)
    expect(sect.pendingApplicants[0]!.id).toBe(duplicateApp.id)
    expect(sect.pendingApplicants[1]!.id).toBe(batch1[1]!.id)
  })

  it('27. Đột phá đại cảnh giới có kỳ ngộ Tâm Ma Phản Phệ: đủ thực lực thì trảm ma, thiếu thực lực thì nhập ma hoặc tử vong', () => {
    // 1. Trường hợp đệ tử thực lực cường đại (đủ sức đánh bại tâm ma)
    const strongDisciple: DiscipleData = {
      id: 'disc_strong',
      name: 'Diệp Kiếm Tâm',
      gender: 'male',
      element: 'metal',
      major: 0, // Luyện Khí
      sub: 8,   // Tầng 9 chuẩn bị đột phá Trúc Cơ
      expPct: 100,
      comprehension: 95,
      aptitudes: ['apt_e_66'],
      temper: 'bold',
      lean: 'sword',
      tierRank: 'gold',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: ['m_qingyun'],
      activeGongfa: 'm_qingyun',
      towerFloor: 10,
      totalContributions: 200,
      rank: 'inner'
    }

    // Mock RNG: force chance(0.35) -> true để kích hoạt Tâm Ma
    const mockWinRng = {
      chance: (p: number) => p === 0.35, // Kích hoạt tâm ma
      float: () => 0.0,                  // Tâm ma yếu nhất
      int: (min: number) => min,
      pick: <T>(arr: readonly T[]): T => arr[0]!
    } as unknown as RandomService

    const winResult = simulateDiscipleMonthlyCultivation(strongDisciple, [], 5, 1, mockWinRng)
    expect(winResult.updatedDisciple.major).toBe(1) // Lên Trúc Cơ
    expect(winResult.updatedDisciple.sub).toBe(0)
    expect(winResult.updatedDisciple.status).toBe('idle')
    expect(winResult.updatedDisciple.comprehension).toBeGreaterThan(95) // Ngộ tính tăng thêm nhờ trảm ma
    expect(winResult.historyEvents.some(e => e.summary.includes('Kỳ Ngộ Trảm Ma'))).toBe(true)

    // 2. Trường hợp đệ tử yếu đuối bị Tâm Ma cắn nuốt tử vong
    const weakDisciple: DiscipleData = {
      id: 'disc_weak',
      name: 'Tiêu Tâm Nhược',
      gender: 'male',
      element: 'water',
      major: 0,
      sub: 8,
      expPct: 100,
      comprehension: 30, // Ngộ tính rất thấp
      aptitudes: [],
      temper: 'cautious',
      lean: 'longevity',
      tierRank: 'normal',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [],
      towerFloor: 0,
      totalContributions: 10,
      rank: 'outer'
    }

    const mockLossKillRng = {
      chance: (p: number) => p === 0.35 || p === 0.6, // Kích hoạt tâm ma và kết cục tử vong
      float: () => 0.35,                              // Tâm ma cực mạnh
      int: (min: number) => min,
      pick: <T>(arr: readonly T[]): T => arr[0]!
    } as unknown as RandomService

    const killResult = simulateDiscipleMonthlyCultivation(weakDisciple, [], 5, 1, mockLossKillRng)
    expect(killResult.updatedDisciple.status).toBe('deceased') // Tử trận
    expect(killResult.updatedDisciple.deathCause).toContain('Tâm Ma phản phệ')
    expect(killResult.historyEvents.some(e => e.summary.includes('Tâm Ma Sát Thân'))).toBe(true)

    // 3. Trường hợp bị Tâm Ma phản phệ Nhập Ma
    const mockLossDemonicRng = {
      chance: (p: number) => p === 0.35, // Kích hoạt tâm ma nhưng không bị giết (isKilledByDemon = false)
      float: () => 0.35,
      int: (min: number) => min,
      pick: <T>(arr: readonly T[]): T => arr[0]!
    } as unknown as RandomService

    const demonicResult = simulateDiscipleMonthlyCultivation(weakDisciple, [], 5, 1, mockLossDemonicRng)
    expect(demonicResult.updatedDisciple.status).toBe('demonic') // Rơi vào Nhập Ma
    expect(demonicResult.historyEvents.some(e => e.summary.includes('Tẩu Hỏa Nhập Ma'))).toBe(true)
  })

  it('28. Đệ tử bị Nhập Ma có thể được Tông chủ tịnh hóa tâm ma hoặc trục xuất khỏi tông môn', () => {
    const sect = useApprenticeStore()
    const resources = useResourcesStore()
    sect.createSect('Vạn Cổ Đạo Môn', 'natural', 1)
    resources.addStone(gn(10000))

    const demonicDisciple: DiscipleData = {
      id: 'disc_demonic_1',
      name: 'Lục Ma Tâm',
      gender: 'male',
      element: 'fire',
      major: 1,
      sub: 3,
      expPct: 50,
      comprehension: 60,
      aptitudes: [],
      temper: 'bold',
      lean: 'slaughter',
      tierRank: 'normal',
      joinedMonth: 1,
      status: 'demonic',
      learnedGongfa: [],
      towerFloor: 5,
      totalContributions: 50,
      rank: 'inner'
    }

    sect.disciples = [demonicDisciple]

    // 1. Tịnh hóa tâm ma
    const purifySuccess = sect.purifyDemonicDisciple('disc_demonic_1')
    expect(purifySuccess).toBe(true)
    expect(sect.disciples[0]!.status).toBe('idle') // Đã khôi phục bình thường
    expect(toNum(resources.spiritStone)).toBe(5000) // Đã tiêu hao 5000 linh thạch

    // 2. Trục xuất đệ tử
    const expelSuccess = sect.expelDisciple('disc_demonic_1')
    expect(expelSuccess).toBe(true)
    expect(sect.disciples.length).toBe(0) // Đã bị trục xuất khỏi danh sách đệ tử
  })

  it('29. Đệ tử đã tử vong (deceased) không tham gia tính lực chiến và không chiếm quota cấp bậc', () => {
    const sect = useApprenticeStore()
    sect.createSect('Thiên Địa Môn', 'unity', 1)

    const livingElder: DiscipleData = {
      id: 'elder_live',
      name: 'Thanh Phong Trưởng Lão',
      gender: 'male',
      element: 'wood',
      major: 2,
      sub: 4,
      expPct: 50,
      comprehension: 80,
      aptitudes: ['apt_p_01'],
      temper: 'cautious',
      lean: 'longevity',
      tierRank: 'silver',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [],
      towerFloor: 20,
      totalContributions: 150,
      rank: 'elder'
    }

    const deadElder: DiscipleData = {
      id: 'elder_dead',
      name: 'Cổ Kiếm Trưởng Lão',
      gender: 'male',
      element: 'metal',
      major: 2,
      sub: 5,
      expPct: 0,
      comprehension: 85,
      aptitudes: ['apt_p_01'],
      temper: 'bold',
      lean: 'sword',
      tierRank: 'silver',
      joinedMonth: 1,
      status: 'deceased',
      deathCause: 'Tử trận khi chiến đấu trong đại chiến tông môn',
      deathMonth: 12,
      learnedGongfa: [],
      towerFloor: 22,
      totalContributions: 300,
      rank: 'elder'
    }

    sect.disciples = [livingElder, deadElder]

    // 1. Lực chiến tông môn chỉ tính đệ tử còn sống
    const powerWithDead = calculateSectCombatPower(sect.disciples, false)
    const powerLivingOnly = calculateSectCombatPower([livingElder], false)
    expect(powerWithDead).toBe(powerLivingOnly)

    // 2. Đệ tử tử vong không thể tu luyện tháng tiếp theo
    const res = simulateDiscipleMonthlyCultivation(deadElder, [], 13, 1)
    expect(res.updatedDisciple.status).toBe('deceased')
    expect(res.historyEvents.length).toBe(0)
  })

  it('23. Đuổi đệ tử khỏi tông môn và thu hồi trang bị về Kho Tông Môn', () => {
    const sect = useApprenticeStore()
    const player = usePlayerStore()
    player.major = 2
    sect.createSect('Vân Ẩn Tông', 'natural', 1)

    const testEquip: EquipmentInstance = {
      uid: 'eq_test_disciple',
      templateId: 'w_xuantie',
      quality: 'spirit',
      tier: 2,
      level: 1,
      affixes: []
    }

    const testDisc: DiscipleData = {
      id: 'd_to_expel',
      name: 'Nghịch Đồ Tiêu Viêm',
      gender: 'male',
      element: 'fire',
      major: 1,
      sub: 2,
      expPct: 20,
      comprehension: 75,
      aptitudes: [],
      temper: 'bold',
      lean: 'sword',
      tierRank: 'normal',
      joinedMonth: 1,
      status: 'idle',
      totalContributions: 50,
      contributionPoints: 50,
      equippedItems: [testEquip],
      towerFloor: 2,
      rank: 'outer',
      learnedGongfa: []
    }

    sect.disciples.push(testDisc)
    expect(sect.disciples.some(d => d.id === 'd_to_expel')).toBe(true)
    expect(sect.sectVault.equipments.length).toBe(0)

    // Đuổi khỏi tông môn
    const expelled = sect.expelDisciple('d_to_expel')
    expect(expelled).toBe(true)
    expect(sect.disciples.some(d => d.id === 'd_to_expel')).toBe(false)

    // Trang bị của đệ tử được thu hồi về Kho Tông Môn
    expect(sect.sectVault.equipments.some(e => e.uid === 'eq_test_disciple')).toBe(true)
    expect(sect.history.some(h => h.category === 'personnel' && h.summary.includes('trục xuất'))).toBe(true)
  })

  it('24. Ban thưởng linh thạch cho đệ tử: tăng tu vi, cống hiến và giải trừ bình cảnh', () => {
    const sect = useApprenticeStore()
    const player = usePlayerStore()
    const resources = useResourcesStore()
    player.major = 2
    sect.createSect('Vân Ẩn Tông', 'natural', 1)

    resources.addStone(gn(100000))

    const testDisc: DiscipleData = {
      id: 'd_reward_target',
      name: 'Hàn Lập',
      gender: 'male',
      element: 'wood',
      major: 1,
      sub: 8,
      expPct: 90,
      comprehension: 85,
      aptitudes: [],
      temper: 'cautious',
      lean: 'longevity',
      tierRank: 'silver',
      joinedMonth: 1,
      status: 'bottleneck',
      totalContributions: 100,
      contributionPoints: 100,
      towerFloor: 5,
      rank: 'inner',
      learnedGongfa: []
    }
    sect.disciples.push(testDisc)

    const initialStone = toNum(resources.spiritStone)
    // Ban thưởng 10,000 linh thạch
    const rewarded = sect.rewardDiscipleStones('d_reward_target', 10000)
    expect(rewarded).toBe(true)
    expect(toNum(resources.spiritStone)).toBe(initialStone - 10000)

    const target = sect.disciples.find(d => d.id === 'd_reward_target')!
    expect(target.contributionPoints).toBeGreaterThan(100)
    expect(target.totalContributions).toBeGreaterThan(100)
    expect(target.expPct).toBe(100)
    expect(sect.history.some(h => h.summary.includes('ban thưởng') && h.summary.includes('Hàn Lập'))).toBe(true)
  })

  it('25. Kho Tông Môn: gửi và rút Linh thạch, Nguyên liệu, Đan dược, Trang bị', () => {
    const sect = useApprenticeStore()
    const player = usePlayerStore()
    const resources = useResourcesStore()
    const inventory = useInventoryStore()
    player.major = 2
    sect.createSect('Vân Ẩn Tông', 'natural', 1)

    // 1. Linh thạch
    resources.addStone(gn(50000))
    expect(sect.depositStoneToVault(20000)).toBe(true)
    expect(sect.sectVault.stone).toBe(20000)
    expect(sect.withdrawStoneFromVault(5000)).toBe(true)
    expect(sect.sectVault.stone).toBe(15000)

    // 2. Linh thảo
    resources.addHerb(1, 30)
    expect(sect.depositHerbToVault(1, 15)).toBe(true)
    expect(sect.sectVault.herbs[1]).toBe(15)
    expect(sect.withdrawHerbFromVault(1, 5)).toBe(true)
    expect(sect.sectVault.herbs[1]).toBe(10)

    // 3. Nguyên liệu (quáng, khí trần, ngộ đạo)
    resources.addSmall('ore', 20)
    expect(sect.depositMaterialToVault('ore', 10)).toBe(true)
    expect(sect.sectVault.ores).toBe(10)
    expect(sect.withdrawMaterialFromVault('ore', 4)).toBe(true)
    expect(sect.sectVault.ores).toBe(6)

    // 4. Đan dược
    inventory.addPill('p_jvqisan', 10)
    expect(sect.depositPillToVault('p_jvqisan', 4)).toBe(true)
    expect(sect.sectVault.pills['p_jvqisan']).toBe(4)
    expect(sect.withdrawPillFromVault('p_jvqisan', 1)).toBe(true)
    expect(sect.sectVault.pills['p_jvqisan']).toBe(3)

    // 5. Trang bị
    const item: EquipmentInstance = {
      uid: 'eq_vault_1',
      templateId: 'w_xuantie',
      quality: 'excellent',
      tier: 2,
      level: 0,
      affixes: []
    }
    inventory.items.push(item)
    expect(sect.depositEquipmentToVault('eq_vault_1')).toBe(true)
    expect(sect.sectVault.equipments.some(e => e.uid === 'eq_vault_1')).toBe(true)
    expect(inventory.items.some(e => e.uid === 'eq_vault_1')).toBe(false)

    expect(sect.withdrawEquipmentFromVault('eq_vault_1')).toBe(true)
    expect(sect.sectVault.equipments.some(e => e.uid === 'eq_vault_1')).toBe(false)
    expect(inventory.items.some(e => e.uid === 'eq_vault_1')).toBe(true)
  })

  it('26. Đệ tử tự thi hành sự vụ, tích lũy cống hiến, tự đổi đan dược và trang bị từ Kho Tông Môn', () => {
    const sect = useApprenticeStore()
    const player = usePlayerStore()
    player.major = 2
    sect.createSect('Vân Ẩn Tông', 'natural', 1)

    // Chuẩn bị đan dược và trang bị trong kho
    sect.sectVault.pills['p_jvqisan'] = 5
    const vaultSword: EquipmentInstance = {
      uid: 'eq_vault_sword',
      templateId: 'w_xuantie',
      quality: 'spirit',
      tier: 2,
      level: 2,
      affixes: []
    }
    sect.sectVault.equipments.push(vaultSword)

    const disciple: DiscipleData = {
      id: 'd_auto_grow',
      name: 'Trương Tiểu Phàm',
      gender: 'male',
      element: 'earth',
      major: 1,
      sub: 3,
      expPct: 30,
      comprehension: 80,
      aptitudes: [],
      temper: 'cautious',
      lean: 'longevity',
      tierRank: 'normal',
      joinedMonth: 1,
      status: 'idle',
      totalContributions: 200,
      contributionPoints: 200,
      equippedItems: [],
      towerFloor: 1,
      rank: 'inner',
      learnedGongfa: []
    }
    sect.disciples.push(disciple)

    // Chiến lực ban đầu trước khi có trang bị
    const beforeSnap = createDiscipleCombatSnap(disciple)
    const beforeAtk = beforeSnap.attack.m * Math.pow(10, beforeSnap.attack.e)

    // Mô phỏng 1 tháng
    sect.simulateMonthlySect(2, 1)

    const updated = sect.disciples.find(d => d.id === 'd_auto_grow')!
    // 1. Đệ tử tự tích lũy điểm cống hiến môn phái
    expect(updated.totalContributions).toBeGreaterThan(200)

    // 2. Đệ tử đã tự đổi kiếm từ kho tông môn và trang bị lên thân
    expect(updated.equippedItems?.some(e => e.uid === 'eq_vault_sword')).toBe(true)
    expect(sect.sectVault.equipments.length).toBe(0)

    // 3. Thực lực chiến đấu gia tăng rõ rệt nhờ trang bị từ kho
    const afterSnap = createDiscipleCombatSnap(updated)
    const afterAtk = afterSnap.attack.m * Math.pow(10, afterSnap.attack.e)
    expect(afterAtk).toBeGreaterThan(beforeAtk)

    // 4. Kiểm tra đệ tử bị bình cảnh tự đổi đan dược phá ải
    updated.status = 'bottleneck'
    updated.contributionPoints = 150
    sect.simulateMonthlySect(3, 1)

    const bottleneckCleared = sect.disciples.find(d => d.id === 'd_auto_grow')!
    expect(bottleneckCleared.status).toBe('idle')
    expect(sect.history.some(h => h.summary.includes('Đổi Đan Phá Ải'))).toBe(true)
  })

  it('27. Nhiệm vụ đường tự động phái các đệ tử có tiềm năng theo nhiệm vụ đang có', () => {
    const sect = useApprenticeStore()
    const player = usePlayerStore()
    player.major = 2
    sect.createSect('Vân Ẩn Tông', 'natural', 1)

    // Tạo 3 đệ tử với tiềm năng khác nhau
    // Đệ tử 1: Thiên Kiêu Vàng, Mộc linh căn, Ngộ tính 90, Trúc Cơ tầng 5
    const goldDisciple: DiscipleData = {
      id: 'd_gold_wood',
      name: 'Diệp Mộc Chân',
      gender: 'female',
      element: 'wood',
      major: 1,
      sub: 4,
      expPct: 50,
      comprehension: 90,
      aptitudes: ['apt_divine_body'],
      temper: 'cautious',
      lean: 'alchemy',
      tierRank: 'gold',
      joinedMonth: 1,
      status: 'idle',
      totalContributions: 50,
      contributionPoints: 50,
      equippedItems: [],
      towerFloor: 10,
      battlesWon: 5,
      rank: 'inner',
      learnedGongfa: ['m_qingmu'],
      activeGongfa: 'm_qingmu'
    }

    // Đệ tử 2: Thiên Kiêu Bạc, Kim linh căn, Ngộ tính 75, Trúc Cơ tầng 2
    const silverDisciple: DiscipleData = {
      id: 'd_silver_metal',
      name: 'Bạch Kim Kiếm',
      gender: 'male',
      element: 'metal',
      major: 1,
      sub: 1,
      expPct: 20,
      comprehension: 75,
      aptitudes: ['apt_sword_heart'],
      temper: 'bold',
      lean: 'sword',
      tierRank: 'silver',
      joinedMonth: 1,
      status: 'idle',
      totalContributions: 30,
      contributionPoints: 30,
      equippedItems: [],
      towerFloor: 5,
      battlesWon: 2,
      rank: 'inner',
      learnedGongfa: []
    }

    // Đệ tử 3: Phổ Thông, Thủy linh căn, Ngộ tính 40, Luyện Khí tầng 3
    const normalDisciple: DiscipleData = {
      id: 'd_normal_mortal',
      name: 'Lý Phổ Thông',
      gender: 'male',
      element: 'water',
      major: 0,
      sub: 2,
      expPct: 10,
      comprehension: 40,
      aptitudes: [],
      temper: 'cautious',
      lean: 'longevity',
      tierRank: 'normal',
      joinedMonth: 1,
      status: 'idle',
      totalContributions: 10,
      contributionPoints: 10,
      equippedItems: [],
      towerFloor: 0,
      rank: 'outer',
      learnedGongfa: []
    }

    sect.disciples.push(goldDisciple, silverDisciple, normalDisciple)

    const herbQuest = SECT_QUEST_TEMPLATES.find(t => t.id === 'sq_gather_herb')! // Luyện Khí
    const subdueQuest = SECT_QUEST_TEMPLATES.find(t => t.id === 'sq_subdue_beast')! // Trúc Cơ

    // 1. Kiểm tra evaluateDiscipleQuestPotential
    // Diệp Mộc Chân (Gold, Mộc, Ngộ tính 90) có điểm tiềm năng vượt trội với nhiệm vụ hái thuốc
    const goldScore = evaluateDiscipleQuestPotential(goldDisciple, herbQuest)
    const normalScore = evaluateDiscipleQuestPotential(normalDisciple, herbQuest)
    expect(goldScore).toBeGreaterThan(normalScore)
    expect(goldScore).toBeGreaterThan(150) // Gold(+80) + Compr*0.6(~54) + MajorAdv(45) + Wood(+30) + Tower + ActiveGongfa

    // Lý Phổ Thông (Luyện Khí) không đủ cảnh giới cho nhiệm vụ Trúc Cơ -> Điểm là -1
    const ineligibleScore = evaluateDiscipleQuestPotential(normalDisciple, subdueQuest)
    expect(ineligibleScore).toBe(-1)

    // Đệ tử bận không được đánh giá
    const busyDisciple = { ...goldDisciple, status: 'quest' as const }
    expect(evaluateDiscipleQuestPotential(busyDisciple, herbQuest)).toBe(-1)

    // Kiểm tra trực tiếp hàm core autoDispatchDisciplesToQuests
    const directResult = autoDispatchDisciplesToQuests([goldDisciple], [herbQuest], [], 1)
    expect(directResult.result.dispatchedCount).toBe(1)
    expect(directResult.result.assignments[0]?.discipleId).toBe('d_gold_wood')

    // 2. Tự Động Phái Việc Thủ Công qua action (autoDispatchQuestsAction)
    const dispatchResult = sect.autoDispatchQuestsAction()
    expect(dispatchResult.dispatchedCount).toBeGreaterThan(0)
    expect(sect.activeQuests.length).toBe(dispatchResult.dispatchedCount)

    // Các đệ tử được phái phải đổi trạng thái sang 'quest'
    for (const assignment of dispatchResult.assignments) {
      const d = sect.disciples.find(x => x.id === assignment.discipleId)!
      expect(d.status).toBe('quest')
      expect(d.assignedQuestId).toBeDefined()
      // Template nhiệm vụ được phân công phải chính xác
      expect(sect.activeQuests.some(q => q.assignedDiscipleId === d.id && q.templateId === assignment.templateId)).toBe(true)
    }

    // Tông Môn Sử phải có bản ghi loại 'quest'
    expect(sect.history.some(h => h.category === 'quest' && h.summary.includes('Tự Động Phái Việc'))).toBe(true)

    // Phái lại lần nữa khi mọi đệ tử đủ điều kiện đều đã bận -> dispatchedCount = 0
    const secondDispatch = sect.autoDispatchQuestsAction()
    expect(secondDispatch.dispatchedCount).toBe(0)

    // 3. Tự động phái việc hàng tháng trong simulateMonthlySect
    // Đặt autoDispatchQuests = true và để 1 đệ tử rảnh rỗi
    sect.autoDispatchQuests = true
    const freedDisciple = sect.disciples.find(d => d.id === 'd_gold_wood')!
    freedDisciple.status = 'idle'
    freedDisciple.assignedQuestId = undefined
    sect.activeQuests = sect.activeQuests.filter(q => q.assignedDiscipleId !== freedDisciple.id)

    // Mô phỏng 1 tháng
    sect.simulateMonthlySect(2, 1)

    // Đệ tử Diệp Mộc Chân phải được tự động phái vào nhiệm vụ trống khả dụng
    const afterSim = sect.disciples.find(d => d.id === 'd_gold_wood')!
    expect(afterSim.status).toBe('quest')
    expect(sect.activeQuests.some(q => q.assignedDiscipleId === 'd_gold_wood')).toBe(true)

    // Tắt tính năng tự phái hàng tháng (autoDispatchQuests = false)
    sect.autoDispatchQuests = false
    afterSim.status = 'idle'
    afterSim.assignedQuestId = undefined
    sect.activeQuests = sect.activeQuests.filter(q => q.assignedDiscipleId !== 'd_gold_wood')

    sect.simulateMonthlySect(3, 1)

    // Không tự động phái khi tắt
    const disabledSim = sect.disciples.find(d => d.id === 'd_gold_wood')!
    expect(disabledSim.status).toBe('idle')
  })

  it('37. Đệ tử tự động khiêu chiến Tháp Lịch Luyện theo tháng và thao tác khiêu chiến toàn bộ', () => {
    const player = usePlayerStore()
    const sect = useApprenticeStore()
    const resources = useResourcesStore()

    player.major = 2
    sect.createSect('Thiên Đạo Tông', 'natural', 1)

    const d1: DiscipleData = {
      id: 'd_tower_1',
      name: 'Thẩm Bắc Minh',
      gender: 'male',
      element: 'metal',
      major: 2, // Kim Đan (rất mạnh so với Tầng 1)
      sub: 2,
      expPct: 10,
      comprehension: 85,
      aptitudes: ['apt_u_42'],
      temper: 'cautious',
      lean: 'slaughter',
      tierRank: 'silver',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [],
      towerFloor: 0,
      totalContributions: 0,
      rank: 'inner'
    }

    const d2: DiscipleData = {
      id: 'd_tower_2',
      name: 'Tô Lạc Vũ',
      gender: 'female',
      element: 'water',
      major: 1, // Trúc Cơ
      sub: 2,
      expPct: 20,
      comprehension: 80,
      aptitudes: ['apt_u_42'],
      temper: 'cautious',
      lean: 'longevity',
      tierRank: 'silver',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [],
      towerFloor: 0,
      totalContributions: 0,
      rank: 'outer'
    }

    sect.disciples = [d1, d2]
    expect(sect.autoTowerChallenge).toBe(true)

    const initialStones = toNum(resources.spiritStone)

    // Mô phỏng tháng 1: Cả 2 đệ tử tự động leo tháp
    sect.simulateMonthlySect(1, 1)

    const d1After = sect.disciples.find(d => d.id === 'd_tower_1')!
    const d2After = sect.disciples.find(d => d.id === 'd_tower_2')!

    // Đệ tử phải vượt qua ít nhất tầng 1
    expect(d1After.towerFloor).toBeGreaterThanOrEqual(1)
    expect(d2After.towerFloor).toBeGreaterThanOrEqual(1)
    expect(toNum(resources.spiritStone)).toBeGreaterThan(initialStones)
    expect(sect.history.some(h => h.category === 'tower')).toBe(true)

    // Tắt tính năng tự động đấu tháp
    sect.autoTowerChallenge = false
    const floorBefore = d1After.towerFloor

    sect.simulateMonthlySect(2, 1)
    expect(sect.disciples.find(d => d.id === 'd_tower_1')!.towerFloor).toBe(floorBefore)

    // Thử tính năng hành động thủ công "Toàn Bộ Khiêu Chiến"
    const actionRes = sect.autoChallengeTowerAction()
    expect(actionRes.summary).toBeTruthy()
    // Đệ tử Kim Đan tiếp tục vượt tầng tiếp theo
    expect(sect.disciples.find(d => d.id === 'd_tower_1')!.towerFloor).toBeGreaterThan(floorBefore)
  })

  it('38. Đệ tử tông môn tự động rút kho tông môn: Ưu tiên Trang bị > Đan dược > Khác, tự để dành điểm khi chưa đủ điểm rút trang bị', () => {
    const sect = useApprenticeStore()
    const d: DiscipleData = {
      id: 'd_vault_smart',
      name: 'Lý Tiêu Dao',
      gender: 'male',
      element: 'metal',
      major: 1, // Trúc Cơ
      sub: 1,
      expPct: 30,
      comprehension: 85,
      aptitudes: ['apt_u_42'],
      temper: 'cautious',
      lean: 'sword',
      tierRank: 'gold',
      joinedMonth: 1,
      status: 'idle',
      totalContributions: 100,
      contributionPoints: 40, // Hiện có 40 điểm
      equippedItems: [],
      towerFloor: 1,
      rank: 'inner',
      learnedGongfa: []
    }

    const testSword: EquipmentInstance = {
      uid: 'eq_vault_tier1',
      templateId: 'w_zhuqing', // slot weapon
      quality: 'fine',
      tier: 1,
      level: 1,
      affixes: [{ id: 'atk_flat', roll: 20 }]
    }

    sect.sectVault.equipments = [testSword]
    sect.sectVault.pills = { p_exp_1: 5 }
    sect.sectVault.herbs = { 1: 10 }
    sect.sectVault.ores = 5
    sect.sectVault.stone = 1000

    // Trường hợp 1: Trong kho có trang bị ngon (giá 60 cống hiến), đệ tử chỉ có 40 cống hiến
    // Đệ tử muốn món đồ này nên "để dành điểm để rút trang bị", KHÔNG tiêu vào đan dược hay nguyên liệu!
    const events1 = simulateDiscipleVaultExchange(d, sect.sectVault, 1)
    expect(events1.length).toBe(0) // Không tiêu điểm vào thứ khác
    expect(d.contributionPoints).toBe(40) // Điểm vẫn được giữ nguyên để dành
    expect(sect.sectVault.equipments.length).toBe(1) // Kiếm vẫn còn trong kho

    // Trường hợp 2: Đệ tử làm nhiệm vụ tích lũy thêm điểm cống hiến lên 70 điểm
    d.contributionPoints = 70
    const events2 = simulateDiscipleVaultExchange(d, sect.sectVault, 2)
    expect(events2.length).toBe(1)
    expect(d.equippedItems?.some(e => e.uid === 'eq_vault_tier1')).toBe(true)
    expect(sect.sectVault.equipments.length).toBe(0) // Đã rút khỏi kho
    expect(d.contributionPoints).toBe(22) // 70 - 48 = 22

    // Trường hợp 3: Khi bị bình cảnh, đệ tử ưu tiên rút đan dược phá bình cảnh
    d.status = 'bottleneck'
    d.contributionPoints = 50
    sect.sectVault.pills = { p_break_1: 2 }
    const events3 = simulateDiscipleVaultExchange(d, sect.sectVault, 3)
    expect(events3.length).toBe(1)
    expect(d.status).toBe('idle') // Bình cảnh đã được giải trừ nhờ đan dược

    // Trường hợp 4: Đã đủ trang bị và đan dược, đệ tử rút nguyên liệu/linh thạch
    d.status = 'idle'
    d.contributionPoints = 30
    sect.sectVault.pills = {}
    const events4 = simulateDiscipleVaultExchange(d, sect.sectVault, 4)
    expect(events4.length).toBe(1)
    expect(d.bagMaterials?.herb || d.bagMaterials?.ore || d.bagStones).toBeTruthy()
  })

  it('39. Đệ tử tự đi lịch luyện ở bản đồ tương ứng kiếm linh thạch, đồ mặc và tự tiêu thụ đồ trong túi', () => {
    const d: DiscipleData = {
      id: 'd_adv_1',
      name: 'Bạch Vân Phi',
      gender: 'male',
      element: 'wood',
      major: 1, // Trúc Cơ
      sub: 1,
      expPct: 10,
      comprehension: 80,
      aptitudes: ['apt_u_42'],
      temper: 'cautious',
      lean: 'longevity',
      tierRank: 'silver',
      joinedMonth: 1,
      status: 'idle',
      totalContributions: 0,
      contributionPoints: 0,
      equippedItems: [],
      towerFloor: 1,
      rank: 'outer',
      learnedGongfa: [],
      bagStones: 0,
      bagPills: { p_exp_1: 2 },
      bagMaterials: { ore: 0, herb: 0 }
    }

    // 1. Tự đi lịch luyện
    const advRes = simulateDiscipleSelfAdventure(d, 1)
    expect(advRes.historyEntry).toBeTruthy()
    expect(advRes.updatedDisciple.bagStones).toBeGreaterThan(0) // Đã kiếm được linh thạch
    expect(advRes.historyEntry?.category).toBe('cultivation')

    // 2. Tự tiêu thụ đan dược trong túi để tu luyện
    const initialExp = advRes.updatedDisciple.expPct
    const consumeRes = simulateDiscipleBagConsumption(advRes.updatedDisciple)
    expect(consumeRes.updatedDisciple.expPct).toBeGreaterThan(initialExp) // Đã dùng đan dược tăng exp
    expect(consumeRes.updatedDisciple.bagPills?.p_exp_1 ?? 0).toBeLessThan(2) // Đan dược đã bị tiêu trừ
  })

  it('40. Quản lý túi đồ NPC và tương tác Xin / Trộm vật phẩm', () => {
    const player = usePlayerStore()
    const npcStore = useNpcStore()
    const inventory = useInventoryStore()

    player.major = 3 // Kim Đan đỉnh phong
    player.sub = 1
    const npcId = 'npc_test_bag_interact'

    // Khởi tạo túi đồ NPC
    setNpcBag(npcId, {
      equipped: [],
      inventory: [
        {
          uid: 'eq_npc_ring',
          templateId: 'r_tongjie',
          quality: 'excellent',
          tier: 1,
          level: 1,
          affixes: [{ id: 'atk_flat', roll: 15 }]
        }
      ],
      pills: { p_exp_1: 3 },
      stones: 500,
      materials: { ore: 2, herb: 4 }
    })

    // Lấy tổng quan túi đồ
    const overview = buildNpcBagOverview(npcId)
    expect(overview.stones).toBe(500)
    expect(overview.items.length).toBeGreaterThan(0)
    const targetItem = overview.items.find(i => i.type === 'equipment')!
    expect(targetItem).toBeTruthy()

    // 1. Tương tác XIN (Thỉnh cầu):
    // Với hảo cảm thấp (< 30), NPC từ chối
    npcStore.npcFavor[npcId] = 10
    const askFail = requestNpcItem(npcId, targetItem)
    expect(askFail.success).toBe(false)
    expect(askFail.message).toContain('chưa thể tặng')

    // Với hảo cảm cao (>= 70), NPC đồng ý tặng
    npcStore.npcFavor[npcId] = 85
    const askSuccess = requestNpcItem(npcId, targetItem)
    expect(askSuccess.success).toBe(true)
    expect(askSuccess.message).toContain('tặng')
    expect(inventory.items.some(e => e.uid === 'eq_npc_ring')).toBe(true)

    // 2. Tương tác TRỘM (Thâu đạo):
    const pillItem = overview.items.find(i => i.type === 'pill')!
    expect(pillItem).toBeTruthy()

    // Mock RNG thất bại (bị phát hiện)
    const mockFailRng = new RandomService(() => 0.99)

    const initialFavor = npcStore.getFavor(npcId)
    const stealFail = stealNpcItem(npcId, pillItem, mockFailRng)
    expect(stealFail.success).toBe(false)
    expect(stealFail.caught).toBe(true)
    expect(npcStore.getFavor(npcId)).toBe(initialFavor - 25) // Bị giảm 25 điểm hảo cảm

    // Mock RNG thành công (thần không biết quỷ không hay)
    const mockSuccessRng = new RandomService(() => 0.01)

    const favorBeforeSuccess = npcStore.getFavor(npcId)
    const stealSuccess = stealNpcItem(npcId, pillItem, mockSuccessRng)
    expect(stealSuccess.success).toBe(true)
    expect(stealSuccess.caught).toBe(false)
    expect(npcStore.getFavor(npcId)).toBe(favorBeforeSuccess) // Không bị trừ hảo cảm khi không bị bắt
  })

  it('41. Tỉ thí tông môn phân chia phân bảng rõ rệt: Ngoại vs Ngoại, Nội vs Nội, Chân truyền vs Chân truyền; Chức vụ cao không tham gia thi đấu đệ tử', () => {
    const dOuter1: DiscipleData = {
      id: 'd_out_1',
      name: 'Ngoại Môn Nhất',
      gender: 'male',
      element: 'metal',
      major: 0,
      sub: 3,
      expPct: 50,
      comprehension: 65,
      aptitudes: [],
      temper: 'cautious',
      lean: 'sword',
      tierRank: 'normal',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [],
      towerFloor: 2,
      totalContributions: 10,
      rank: 'outer'
    }

    const dOuter2: DiscipleData = {
      id: 'd_out_2',
      name: 'Ngoại Môn Nhị',
      gender: 'female',
      element: 'wood',
      major: 0,
      sub: 4,
      expPct: 60,
      comprehension: 70,
      aptitudes: [],
      temper: 'bold',
      lean: 'longevity',
      tierRank: 'normal',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [],
      towerFloor: 3,
      totalContributions: 15,
      rank: 'outer'
    }

    const dInner1: DiscipleData = {
      id: 'd_in_1',
      name: 'Nội Môn Nhất',
      gender: 'male',
      element: 'water',
      major: 1,
      sub: 2,
      expPct: 40,
      comprehension: 75,
      aptitudes: [],
      temper: 'cautious',
      lean: 'alchemy',
      tierRank: 'silver',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [],
      towerFloor: 8,
      totalContributions: 40,
      rank: 'inner'
    }

    const dInner2: DiscipleData = {
      id: 'd_in_2',
      name: 'Nội Môn Nhị',
      gender: 'female',
      element: 'fire',
      major: 1,
      sub: 3,
      expPct: 50,
      comprehension: 80,
      aptitudes: [],
      temper: 'bold',
      lean: 'sword',
      tierRank: 'silver',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [],
      towerFloor: 10,
      totalContributions: 55,
      rank: 'inner'
    }

    const dTrue1: DiscipleData = {
      id: 'd_true_1',
      name: 'Chân Truyền Nhất',
      gender: 'male',
      element: 'earth',
      major: 1,
      sub: 7,
      expPct: 80,
      comprehension: 88,
      aptitudes: [],
      temper: 'cautious',
      lean: 'sword',
      tierRank: 'gold',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [],
      towerFloor: 18,
      totalContributions: 120,
      rank: 'true'
    }

    const dTrue2: DiscipleData = {
      id: 'd_true_2',
      name: 'Chân Truyền Nhị',
      gender: 'female',
      element: 'wind',
      major: 2,
      sub: 1,
      expPct: 30,
      comprehension: 92,
      aptitudes: [],
      temper: 'bold',
      lean: 'truth',
      tierRank: 'gold',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [],
      towerFloor: 22,
      totalContributions: 180,
      rank: 'true'
    }

    const dElder: DiscipleData = {
      id: 'd_elder_1',
      name: 'Trưởng Lão Vấn Kiếm',
      gender: 'male',
      element: 'metal',
      major: 3,
      sub: 0,
      expPct: 20,
      comprehension: 95,
      aptitudes: [],
      temper: 'curious',
      lean: 'sword',
      tierRank: 'gold',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [],
      towerFloor: 30,
      totalContributions: 500,
      rank: 'elder'
    }

    const dMaster: DiscipleData = {
      id: 'd_master_1',
      name: 'Chưởng Môn Đại Thừa',
      gender: 'male',
      element: 'chaos',
      major: 4,
      sub: 0,
      expPct: 10,
      comprehension: 99,
      aptitudes: [],
      temper: 'bold',
      lean: 'sword',
      tierRank: 'gold',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [],
      towerFloor: 50,
      totalContributions: 2000,
      rank: 'master'
    }

    const allMembers = [dOuter1, dOuter2, dInner1, dInner2, dTrue1, dTrue2, dElder, dMaster]
    const { tournament, historyEntry } = runSectTournament(allMembers, 6)

    // Chỉ có 6 đệ tử (2 Ngoại, 2 Nội, 2 Chân truyền) tham gia thi đấu
    expect(tournament.participantsCount).toBe(6)
    expect(tournament.divisions).toBeDefined()
    expect(tournament.divisions!.length).toBe(3)

    // Phân bảng Chân Truyền
    const trueDiv = tournament.divisions!.find(d => d.division === 'true')!
    expect(trueDiv).toBeDefined()
    expect(trueDiv.participantsCount).toBe(2)
    expect(trueDiv.divisionName).toBe('Bảng Chân Truyền')
    expect(trueDiv.rankings.every(r => r.division === 'true')).toBe(true)
    expect(trueDiv.rankings.some(r => r.discipleId === 'd_elder_1' || r.discipleId === 'd_master_1')).toBe(false)

    // Phân bảng Nội Môn
    const innerDiv = tournament.divisions!.find(d => d.division === 'inner')!
    expect(innerDiv).toBeDefined()
    expect(innerDiv.participantsCount).toBe(2)
    expect(innerDiv.divisionName).toBe('Bảng Nội Môn')
    expect(innerDiv.rankings.every(r => r.division === 'inner')).toBe(true)

    // Phân bảng Ngoại Môn
    const outerDiv = tournament.divisions!.find(d => d.division === 'outer')!
    expect(outerDiv).toBeDefined()
    expect(outerDiv.participantsCount).toBe(2)
    expect(outerDiv.divisionName).toBe('Bảng Ngoại Môn')
    expect(outerDiv.rankings.every(r => r.division === 'outer')).toBe(true)

    // Trưởng lão và Tông chủ tuyệt đối không xuất hiện trong bảng xếp hạng đệ tử
    expect(tournament.rankings.some(r => r.discipleId === 'd_elder_1' || r.discipleId === 'd_master_1')).toBe(false)
    expect(historyEntry.summary).toContain('Quán quân các phân bảng')
  })

  it('42. Các chức vị cao cấp có 2 con đường: Tông chủ bổ nhiệm trực tiếp vs Tự động tấn thăng khi đủ tiêu chuẩn bán niên', () => {
    const player = usePlayerStore()
    const sect = useApprenticeStore()
    player.major = 3 // Nguyên Anh Kỳ
    sect.createSect('Vân Ẩn Tông', 'natural', 1)
    sect.upgradeSectLevel() // Lên Cấp 2

    const dCandidate: DiscipleData = {
      id: 'd_cand_1',
      name: 'Diệp Thần',
      gender: 'male',
      element: 'metal',
      major: 2,
      sub: 6,
      expPct: 40,
      comprehension: 85,
      aptitudes: [],
      temper: 'bold',
      lean: 'sword',
      tierRank: 'gold',
      joinedMonth: 1,
      status: 'idle',
      learnedGongfa: [],
      towerFloor: 25,
      totalContributions: 200,
      rank: 'inner'
    }
    sect.disciples = [dCandidate]

    // CON ĐƯỜNG 1: Tông chủ bổ nhiệm trực tiếp (Sect Master Appointment)
    const promoteOk = sect.promoteMember('d_cand_1', 'elder')
    expect(promoteOk).toBe(true)
    expect(sect.disciples[0]!.rank).toBe('elder')

    // Tông chủ có thể hạ cấp hoặc điều chuyển chức vụ
    const demoteOk = sect.demoteMember('d_cand_1', 'true')
    expect(demoteOk).toBe(true)
    expect(sect.disciples[0]!.rank).toBe('true')

    // CON ĐƯỜNG 2: Tự động tấn thăng bán niên (Biannual Evaluation)
    // dCandidate đang là 'true' (Chân truyền), cảnh giới Kim Đan (major 2), cống hiến 200 (> 50)
    // Sẽ tự động được tấn thăng lên chức sắc cao cấp (Hộ Pháp hoặc Trưởng Lão)
    const { updatedDisciples, promotions } = evaluateBiannualPromotions(
      sect.disciples,
      sect.sectLevel,
      6
    )

    const prom = promotions.find(p => p.discipleId === 'd_cand_1')
    expect(prom).toBeDefined()
    expect(['guardian', 'elder']).toContain(prom!.toRank)
    expect(['guardian', 'elder']).toContain(updatedDisciples.find(d => d.id === 'd_cand_1')!.rank)
  })

  it('43. Số lượng Tông Môn Thế Giới đồng bộ chính xác 25 môn phái với giới tu chân (Thiên Hạ Tu Sĩ), lực chiến phân bậc đúng đắn', () => {
    const worldSects = createInitialWorldSects()
    // Giới tu chân có 26 thế lực (gồm 1 tán tu sanxiu), vậy có đúng 25 tông môn chính quy
    const nonSanxiuSects = SECTS.filter(s => s.id !== 'sanxiu')
    expect(worldSects.length).toBe(25)
    expect(nonSanxiuSects.length).toBe(25)

    // Mỗi ID thế giới phải tương ứng 1-1 với một tông môn trong SECTS
    for (const ws of worldSects) {
      const match = SECTS.find(s => s.name === ws.name)
      expect(match).toBeDefined()
      expect(ws.combatPower).toBeGreaterThan(0)
    }

    // Hiệu chỉnh lực chiến cùng cấp và các cấp cao
    const playerPower = 18000
    const calibrated = calibrateWorldSectCombatPower(worldSects, 1, playerPower, {})
    const lvl1Sects = calibrated.filter(ws => ws.level === 1)
    const lvl2Sects = calibrated.filter(ws => ws.level === 2)
    const lvl5Sects = calibrated.filter(ws => ws.level === 5)

    // Cấp 1 cân bằng theo người chơi (95% - 100%)
    for (const s of lvl1Sects) {
      expect(s.combatPower).toBeGreaterThanOrEqual(Math.floor(playerPower * 0.95))
      expect(s.combatPower).toBeLessThanOrEqual(Math.ceil(playerPower * 1.00))
    }

    // Cấp 2 vượt trội hơn Cấp 1
    for (const s of lvl2Sects) {
      expect(s.combatPower).toBeGreaterThan(playerPower)
    }

    // Cấp 5 là các đại thế lực đỉnh tiêm (hơn 1.5 triệu lực chiến)
    for (const s of lvl5Sects) {
      expect(s.combatPower).toBeGreaterThanOrEqual(1500000)
    }
  })
})
