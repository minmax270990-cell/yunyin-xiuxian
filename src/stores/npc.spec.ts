/**
 * Kiểm thử Store Quản lý Quần thể NPC Thế giới & Đề nghị Chủ động
 *
 * Kiểm tra:
 * - Sinh NPC theo từng giai đoạn (cân bằng nam/nữ, tính bất biến khi gọi lại)
 * - Tỷ lệ và phẩm chất Thiên Kiêu (Kim/Ngân/Thường)
 * - Mô phỏng kỳ ngộ và cơ chế đề nghị chủ động từ NPC (chống spam đề nghị)
 * - Xử lý chấp nhận/từ chối/để sau đối với đề nghị (tài nguyên chính xác)
 * - Độ bền vững (resilience / sanitize) và luân hồi chuyển thế (resetForRebirth)
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useNpcStore } from './npc'
import { usePlayerStore } from './player'
import { useResourcesStore } from './resources'
import { WORLD_NPCS } from '@/data/npc'
import { aptitudeDef } from '@/data/aptitudes'
import { gn, toNum } from '@/utils/gnum'

describe('Quần Thể NPC Thế Giới · Sinh Theo Giai Đoạn & Phẩm Cấp Thiên Kiêu', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Khởi tạo ban đầu: danh sách chủ động chứa đầy đủ 36 NPC tĩnh', () => {
    const store = useNpcStore()
    expect(store.allActiveNpcs.length).toBe(WORLD_NPCS.length)
    expect(store.unlockedStages).toEqual([])
  })

  it('Sinh NPC theo giai đoạn: syncStage sinh 12 NPC mỗi giai đoạn, cân bằng 6 Nam - 6 Nữ', () => {
    const store = useNpcStore()
    store.syncStage(1) // Mở giai đoạn 0 và 1 (tổng 2 giai đoạn = 24 NPC động)

    expect(store.unlockedStages).toEqual([0, 1])
    expect(store.stageNpcs[0]).toHaveLength(12)
    expect(store.stageNpcs[1]).toHaveLength(12)

    // Kiểm tra cân bằng giới tính trong mỗi giai đoạn
    const stage0Males = store.stageNpcs[0]!.filter(n => n.gender === 'male')
    const stage0Females = store.stageNpcs[0]!.filter(n => n.gender === 'female')
    expect(stage0Males).toHaveLength(6)
    expect(stage0Females).toHaveLength(6)

    const stage1Males = store.stageNpcs[1]!.filter(n => n.gender === 'male')
    const stage1Females = store.stageNpcs[1]!.filter(n => n.gender === 'female')
    expect(stage1Males).toHaveLength(6)
    expect(stage1Females).toHaveLength(6)

    // Tổng số NPC đang hoạt động = 36 tĩnh + 24 động = 60 NPC
    expect(store.allActiveNpcs.length).toBe(WORLD_NPCS.length + 24)
  })

  it('Tính bất biến (Idempotency): gọi syncStage nhiều lần cùng một cảnh giới không sinh trùng lặp', () => {
    const store = useNpcStore()
    store.syncStage(2)
    const countFirst = store.allActiveNpcs.length

    store.syncStage(2)
    store.syncStage(1)
    expect(store.allActiveNpcs.length).toBe(countFirst)
    expect(store.unlockedStages).toEqual([0, 1, 2])
  })

  it('Kiểm tra phẩm cấp Thiên Kiêu: Kim (ngộ tính 90-100, tư chất cao), Ngân (75-89), Thường (35-74)', () => {
    const store = useNpcStore()
    store.syncStage(5) // Mở nhiều giai đoạn để kiểm tra các phẩm cấp

    const all = store.allActiveNpcs
    const goldNpcs = all.filter(n => n.tierRank === 'gold')
    const silverNpcs = all.filter(n => n.tierRank === 'silver')
    const normalNpcs = all.filter(n => n.tierRank === 'normal')

    expect(goldNpcs.length).toBeGreaterThan(0)
    expect(silverNpcs.length).toBeGreaterThan(0)
    expect(normalNpcs.length).toBeGreaterThan(0)

    // Thiên kiêu vàng
    for (const g of goldNpcs) {
      expect(g.comprehension).toBeGreaterThanOrEqual(90)
      expect(g.comprehension).toBeLessThanOrEqual(100)
      // Ít nhất 1 tư chất cấp 5 (Tuyệt phẩm) hoặc cấp 6 (Thiên phẩm)
      const maxGrade = Math.max(...(g.aptitudes ?? []).map(id => aptitudeDef(id)?.grade ?? 1))
      expect(maxGrade).toBeGreaterThanOrEqual(5)
    }

    // Thiên kiêu bạc
    for (const s of silverNpcs) {
      expect(s.comprehension).toBeGreaterThanOrEqual(75)
      expect(s.comprehension).toBeLessThanOrEqual(89)
      const maxGrade = Math.max(...(s.aptitudes ?? []).map(id => aptitudeDef(id)?.grade ?? 1))
      expect(maxGrade).toBeGreaterThanOrEqual(3)
    }

    // Tu sĩ thường
    for (const norm of normalNpcs) {
      expect(norm.comprehension).toBeLessThanOrEqual(74)
    }
  })
})

describe('Quần Thể NPC Thế Giới · Mô Phỏng Thế Giới & Đề Nghị Chủ Động', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Mô phỏng kỳ ngộ: NPC độc lập ghi nhận lịch sử kỳ ngộ', () => {
    const store = useNpcStore()
    store.syncStage(2)

    store.simulateWorld(1, 2, 'male', false)
    expect(store.lastSimDay).toBe(1)

    // Đã có ít nhất một số NPC có kỳ ngộ
    const advCount = Object.values(store.npcAdventures).reduce((sum, list) => sum + list.length, 0)
    expect(advCount).toBeGreaterThan(0)

    // Kỳ ngộ không vượt quá 5 mục gần nhất cho mỗi NPC
    for (const advList of Object.values(store.npcAdventures)) {
      expect(advList.length).toBeLessThanOrEqual(5)
    }
  })

  it('Cơ chế chống spam đề nghị: tối đa 3 đề nghị pending', () => {
    const store = useNpcStore()
    store.syncStage(3)

    // Chạy mô phỏng qua nhiều ngày
    for (let day = 1; day <= 20; day++) {
      store.simulateWorld(day, 2, 'male', false)
    }

    expect(store.pendingProposalsCount).toBeLessThanOrEqual(3)
  })

  it('Xử lý Đề nghị: Chấp nhận đề nghị cộng trừ tài nguyên chính xác', () => {
    const store = useNpcStore()
    const player = usePlayerStore()
    const resources = useResourcesStore()

    player.initCharacter('Đạo Hữu', { roots: [] } as never)
    resources.spiritStone = gn(1000)

    // Giả lập 1 đề nghị tặng linh thạch và tăng tu vi
    const testProp = {
      id: 'prop_test_1',
      npcId: 'npc_linh_huyen',
      type: 'spar' as const,
      title: 'Tỉ Thí',
      message: 'Mời tỉ thí giao lưu',
      createdAtDay: 1,
      status: 'pending' as const,
      reward: {
        type: 'stone' as const,
        amount: 200,
        label: 'Linh Thạch +200'
      }
    }

    store.proposals = [testProp]
    expect(store.pendingProposalsCount).toBe(1)

    const res = store.acceptProposal('prop_test_1')
    expect(res.success).toBe(true)
    expect(store.pendingProposalsCount).toBe(0)
    expect(store.proposals[0]!.status).toBe('accepted')
    // Linh thạch được cộng 200 (1000 -> 1200)
    expect(toNum(resources.spiritStone)).toBe(1200)
  })

  it('Xử lý Đề nghị: Từ chối và Để sau chuyển đúng trạng thái', () => {
    const store = useNpcStore()
    store.proposals = [
      {
        id: 'prop_rej',
        npcId: 'npc_1',
        type: 'discuss',
        title: 'Đàm đạo',
        message: '...',
        createdAtDay: 1,
        status: 'pending'
      },
      {
        id: 'prop_def',
        npcId: 'npc_2',
        type: 'spar',
        title: 'Tỉ thí',
        message: '...',
        createdAtDay: 1,
        status: 'pending'
      }
    ]

    store.rejectProposal('prop_rej')
    expect(store.proposals.find(p => p.id === 'prop_rej')?.status).toBe('rejected')

    store.deferProposal('prop_def')
    expect(store.proposals.find(p => p.id === 'prop_def')?.status).toBe('deferred')
  })
})

describe('Quần Thể NPC Thế Giới · Sanitize & Luân Hồi Chuyển Thế', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('sanitize() khôi phục an toàn khi dữ liệu lưu bị hỏng hoặc null', () => {
    const store = useNpcStore()

    // Cố ý làm hỏng state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = store as any
    s.stageNpcs = null
    s.unlockedStages = 'corrupted'
    s.npcAdventures = null
    s.npcFavor = undefined
    s.proposals = [{ bad: true }]
    s.lastSimDay = NaN
    s.lastProposalDay = null
    s.playerRegionId = null
    s.npcLocations = null
    s.discoveredRegions = 'corrupted'

    store.sanitize()

    expect(store.stageNpcs).toEqual({})
    expect(store.unlockedStages).toEqual([])
    expect(store.npcAdventures).toEqual({})
    expect(store.npcFavor).toEqual({})
    expect(store.proposals).toEqual([])
    expect(store.lastSimDay).toBe(0)
    expect(store.lastProposalDay).toBe(0)
    expect(store.playerRegionId).toBe('qingyun')
    expect(store.npcLocations).toEqual({})
    expect(store.discoveredRegions).toEqual(['qingyun'])
  })

  it('resetForRebirth() xóa sạch hảo cảm và đề nghị tiền kiếp, giữ nguyên ký ức NPC và kỳ ngộ thế giới', () => {
    const store = useNpcStore()
    store.syncStage(1)
    store.addFavor('npc_1', 10)
    store.proposals = [
      {
        id: 'prop_old',
        npcId: 'npc_1',
        type: 'spar',
        title: '...',
        message: '...',
        createdAtDay: 5,
        status: 'pending'
      }
    ]
    store.lastSimDay = 10
    store.lastProposalDay = 10
    store.playerRegionId = 'heifeng'
    store.discoveredRegions = ['qingyun', 'heifeng']

    // Khi luân hồi chuyển thế
    store.resetForRebirth()

    // Hảo cảm và đề nghị tiền kiếp bị xóa sạch
    expect(store.npcFavor).toEqual({})
    expect(store.proposals).toEqual([])
    expect(store.lastSimDay).toBe(0)
    expect(store.lastProposalDay).toBe(0)
    expect(store.playerRegionId).toBe('qingyun')
    expect(store.discoveredRegions).toEqual(['qingyun'])

    // Thế giới tu sĩ và các stage đã mở vẫn còn nguyên
    expect(store.unlockedStages).toEqual([0, 1])
    expect(store.allActiveNpcs.length).toBeGreaterThan(WORLD_NPCS.length)
  })
})

describe('Hệ Thống Địa Giới & Khu Vực Tu Tiên · Phân Bố NPC & Di Chuyển', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Khởi tạo ban đầu: người chơi ở Thanh Vân Sơn Lộc, danh sách khám phá gồm qingyun', () => {
    const store = useNpcStore()
    expect(store.playerRegionId).toBe('qingyun')
    expect(store.discoveredRegions).toContain('qingyun')
  })

  it('Kiểm tra canEnterRegion: chặn khi cảnh giới thấp hơn minRealm, cho phép khi đủ điều kiện', () => {
    const store = useNpcStore()

    // qingyun yêu cầu minRealm = 0 -> Phàm nhân (major 0) vào được
    const enterQingyun = store.canEnterRegion('qingyun', 0)
    expect(enterQingyun.allowed).toBe(true)

    // kunlun yêu cầu minRealm cao (Hóa Thần / Luyện Hư trở lên)
    // Giả sử playerMajor = 0 (Luyện Khí)
    const enterKunlun = store.canEnterRegion('kunlun', 0)
    expect(enterKunlun.allowed).toBe(false)
    expect(enterKunlun.reason).toContain('Cảnh giới chưa đủ')

    // Khi cảnh giới đạt 20 (Đại Thừa / Tiên Nhân) -> vào được
    const enterKunlunHigh = store.canEnterRegion('kunlun', 20)
    expect(enterKunlunHigh.allowed).toBe(true)

    // Khu vực không tồn tại
    const invalid = store.canEnterRegion('non_existent_region', 20)
    expect(invalid.allowed).toBe(false)
    expect(invalid.reason).toContain('Khu vực không tồn tại')
  })

  it('Di chuyển moveToRegion: từ chối nếu không đủ điều kiện, cập nhật playerRegionId và discoveredRegions khi thành công', () => {
    const store = useNpcStore()

    // Thử di chuyển tới khu vực cấp cao khi cảnh giới 0
    const failMove = store.moveToRegion('kunlun', 0)
    expect(failMove.success).toBe(false)
    expect(store.playerRegionId).toBe('qingyun')

    // Di chuyển tới heifeng (cần Trúc Cơ major >= 1) với major = 1
    const succMove = store.moveToRegion('heifeng', 1)
    expect(succMove.success).toBe(true)
    expect(store.playerRegionId).toBe('heifeng')
    expect(store.discoveredRegions).toContain('heifeng')
    expect(succMove.message).toContain('Đã tiến vào')
  })

  it('Phân bố NPC theo cảnh giới & khu vực (getNpcRegion & setNpcRegion)', () => {
    const store = useNpcStore()

    // NPC sơ khởi Luyện Khí / Trúc Cơ
    const lianqiNpc = WORLD_NPCS.find(n => n.major === 0)
    if (lianqiNpc) {
      const reg = store.getNpcRegion(lianqiNpc.id)
      expect(typeof reg).toBe('string')
      expect(reg.length).toBeGreaterThan(0)
    }

    // NPC cấp cao Kim Đan / Nguyên Anh trở lên
    const highNpc = WORLD_NPCS.find(n => n.major >= 3)
    if (highNpc) {
      const reg = store.getNpcRegion(highNpc.id)
      expect(typeof reg).toBe('string')
    }

    // Thủ công điều động/chuyển NPC tới khu vực mới
    const targetNpc = WORLD_NPCS[0]!
    store.setNpcRegion(targetNpc.id, 'youminghai')
    expect(store.getNpcRegion(targetNpc.id)).toBe('youminghai')

    // Lọc danh sách NPC theo khu vực
    const youmingNpcs = store.getNpcsInRegion('youminghai')
    expect(youmingNpcs.some(n => n.id === targetNpc.id)).toBe(true)
    for (const n of youmingNpcs) {
      expect(store.getNpcRegion(n.id)).toBe('youminghai')
    }
  })
})
