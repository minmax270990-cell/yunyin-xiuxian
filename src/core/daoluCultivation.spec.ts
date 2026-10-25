import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlayerStore } from '@/stores/player'
import { useResourcesStore } from '@/stores/resources'
import { useInventoryStore } from '@/stores/inventory'
import { DAOLU } from '@/data/daolu'
import {
  getDaoluCultivationInfo,
  setDaoluFocus,
  getEligibleGongfaForDaolu,
  teachGongfaToDaolu,
  provideStoneToDaolu,
  providePillToDaolu,
  provideHerbToDaolu,
  assistDaoluBreakthrough,
  resolveDaoluBottleneck,
  healDaoluInjury,
  simulateDaoluMonthlyCultivation,
  tickDaoluCultivation
} from './daoluCultivationService'
import { dualCultivateWithDaolu } from './daoluInteractionService'
import { gn } from '@/utils/gnum'

describe('Bồi Dưỡng Tu Luyện Đạo Lữ (Daolu Cultivation & Nurturing)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const player = usePlayerStore()
    const def = DAOLU[0]! // Lạc Thanh Tuyết (wind/sword)

    // Khởi tạo đạo lữ ở cảnh giới Luyện Khí Tầng 1
    player.setBond({
      daoluId: def.id,
      stage: 'pledged',
      fate: 50,
      trust: 50,
      accord: 50,
      shared: 5,
      metAt: 1,
      fallen: false,
      doneEvents: [],
      opportunities: 10,
      nextEventAt: 20,
      daoluMajor: 0,
      daoluSub: 0,
      daoluExpPct: 0,
      daoluStatus: 'cultivating',
      daoluFocus: 'speed',
      lastCultivatedMonth: 1
    })
  })

  it('Lấy thông tin tu luyện hiện tại của Đạo Lữ chính xác', () => {
    const info = getDaoluCultivationInfo()
    expect(info.hasBond).toBe(true)
    expect(info.partnerId).toBe(DAOLU[0]!.id)
    expect(info.major).toBe(0)
    expect(info.sub).toBe(0)
    expect(info.expPct).toBe(0)
    expect(info.status).toBe('cultivating')
    expect(info.focus).toBe('speed')
  })

  it('Người chơi có thể chuyển đổi định hướng tu hành cho Đạo Lữ', () => {
    const res = setDaoluFocus('combat')
    expect(res.success).toBe(true)

    const info = getDaoluCultivationInfo()
    expect(info.focus).toBe('combat')
  })

  it('Lọc và truyền thụ công pháp phù hợp với linh căn và cảnh giới của Đạo Lữ', () => {
    const eligible = getEligibleGongfaForDaolu()
    expect(eligible.length).toBeGreaterThan(0)

    // Chọn 1 công pháp hợp lệ (Thái Huyền Dẫn Khí Quyết - không kén ngũ hành)
    const targetGongfa = eligible.find(g => g.id === 'm_taixuan')!
    expect(targetGongfa).toBeDefined()

    const teachRes = teachGongfaToDaolu(targetGongfa.id)
    expect(teachRes.success).toBe(true)

    const info = getDaoluCultivationInfo()
    expect(info.gongfaId).toBe('m_taixuan')
  })

  it('Chu cấp linh thạch tăng tu vi thực tế cho Đạo Lữ và trừ linh thạch người chơi', () => {
    const resources = useResourcesStore()
    resources.addStone(gn(2000))

    const res = provideStoneToDaolu(1000)
    expect(res.success).toBe(true)

    const info = getDaoluCultivationInfo()
    expect(info.expPct).toBeGreaterThan(0)
  })

  it('Ban tặng đan dược trừ từ hành trang và tăng tu vi hoặc chữa lành thương thế', () => {
    const inventory = useInventoryStore()
    inventory.addPill('p_jvqidan', 2)

    // Tặng đan khi đang tu luyện
    const res = providePillToDaolu('p_jvqidan')
    expect(res.success).toBe(true)
    expect(inventory.pills['p_jvqidan']).toBe(1)

    const info = getDaoluCultivationInfo()
    expect(info.expPct).toBe(30)

    // Thử nghiệm chữa lành khi bị thương
    const player = usePlayerStore()
    player.setBond({
      ...player.bond!,
      daoluStatus: 'injured'
    })

    const healRes = providePillToDaolu('p_jvqidan')
    expect(healRes.success).toBe(true)
    expect(inventory.pills['p_jvqidan']).toBeUndefined() // Hết đan
    expect(getDaoluCultivationInfo().status).toBe('cultivating')
  })

  it('Ban tặng linh thảo trừ nguyên liệu thực tế và tăng tu vi cho Đạo Lữ', () => {
    const resources = useResourcesStore()
    resources.addHerb(2, 5)

    const res = provideHerbToDaolu(2)
    expect(res.success).toBe(true)
    expect(resources.herbOf(2)).toBe(4)

    const info = getDaoluCultivationInfo()
    expect(info.expPct).toBe(16) // 2 * 8 = 16%
  })

  it('Hộ pháp giúp Đạo Lữ đột phá tiểu cảnh giới khi đạt 100% tu vi', () => {
    const player = usePlayerStore()
    const resources = useResourcesStore()
    resources.setQi(500, 1000)

    player.setBond({
      ...player.bond!,
      daoluSub: 2,
      daoluExpPct: 100
    })

    const res = assistDaoluBreakthrough()
    expect(res.success).toBe(true)

    const info = getDaoluCultivationInfo()
    expect(info.sub).toBe(3)
    expect(info.expPct).toBe(0)
    expect(resources.qi).toBe(300) // Trừ 200 qi
  })

  it('Giúp Đạo Lữ khai thông bình cảnh bằng chỉ điểm hoặc đan dược', () => {
    const player = usePlayerStore()
    const resources = useResourcesStore()
    resources.setQi(300, 1000)

    player.setBond({
      ...player.bond!,
      daoluStatus: 'bottleneck'
    })

    // Chỉ điểm đàm đạo
    const res = resolveDaoluBottleneck('guidance')
    expect(resources.qi).toBe(150) // Trừ 150 qi
    expect(res).toBeDefined()
  })

  it('Trị liệu thương thế bằng chân khí hoặc đan dược', () => {
    const player = usePlayerStore()
    const resources = useResourcesStore()
    resources.setQi(300, 1000)

    player.setBond({
      ...player.bond!,
      daoluStatus: 'injured'
    })

    const res = healDaoluInjury('qi')
    expect(res.success).toBe(true)
    expect(getDaoluCultivationInfo().status).toBe('cultivating')
    expect(resources.qi).toBe(150)
  })

  it('simulateDaoluMonthlyCultivation tự động tích lũy tu vi cho Đạo Lữ theo tháng', () => {
    simulateDaoluMonthlyCultivation(2, 1)

    const info = getDaoluCultivationInfo()
    expect(info.expPct).toBeGreaterThan(0)
  })

  it('Song tu cùng Đạo Lữ tăng 20% tu vi và có cơ hội giải phóng bình cảnh', () => {
    const player = usePlayerStore()
    player.setBond({
      ...player.bond!,
      daoluExpPct: 10,
      daoluStatus: 'bottleneck'
    })

    const res = dualCultivateWithDaolu()
    expect(res.success).toBe(true)

    const info = getDaoluCultivationInfo()
    expect(info.expPct).toBe(30) // 10 + 20 = 30
  })

  it('tickDaoluCultivation tự động tăng tiến độ tu vi theo giây giống như nhân vật chính', () => {
    const player = usePlayerStore()
    player.setBond({
      ...player.bond!,
      daoluExpPct: 10,
      daoluStatus: 'cultivating'
    })

    // Tick 60 giây
    tickDaoluCultivation(60)

    const info = getDaoluCultivationInfo()
    expect(info.expPct).toBeGreaterThan(10)
  })

  it('tickDaoluCultivation tự động đột phá tiểu tầng khi exp vượt 100% (sub < 8)', () => {
    const player = usePlayerStore()
    player.setBond({
      ...player.bond!,
      daoluSub: 1,
      daoluExpPct: 99.9,
      daoluStatus: 'cultivating'
    })

    tickDaoluCultivation(30)

    const info = getDaoluCultivationInfo()
    expect(info.sub).toBe(2)
    expect(info.expPct).toBeLessThan(100)
  })

  it('tickDaoluCultivation chuyển sang trạng thái bình cảnh khi exp đạt 100% ở đỉnh phong (sub = 8)', () => {
    const player = usePlayerStore()
    player.setBond({
      ...player.bond!,
      daoluSub: 8,
      daoluExpPct: 99.9,
      daoluStatus: 'cultivating'
    })

    tickDaoluCultivation(30)

    const info = getDaoluCultivationInfo()
    expect(info.sub).toBe(8)
    expect(info.expPct).toBe(100)
    expect(info.status).toBe('bottleneck')
    expect(info.canBreakthrough).toBe(true)
  })

  it('realmName trong getDaoluCultivationInfo luôn được dịch sang tiếng Việt', () => {
    const player = usePlayerStore()
    player.setBond({
      ...player.bond!,
      daoluMajor: 3, // Nguyên Anh (元婴)
      daoluSub: 8
    })

    const info = getDaoluCultivationInfo()
    expect(info.realmName).toContain('Nguyên Anh')
    expect(info.realmName).not.toContain('元婴')
  })
})
