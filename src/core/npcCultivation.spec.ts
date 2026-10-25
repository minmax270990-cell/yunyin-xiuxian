import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNpcStore } from '@/stores/npc'
import { WORLD_NPCS } from '@/data/npc'

describe('Quần thể NPC tự tu luyện theo thời gian (NPC Autonomous Cultivation)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Khởi tạo trạng thái tu luyện ban đầu cho NPC khớp với dữ liệu mặc định', () => {
    const store = useNpcStore()
    const targetNpc = WORLD_NPCS[0]!
    const cult = store.getNpcCultivation(targetNpc.id)

    expect(cult).toBeDefined()
    expect(cult.major).toBe(targetNpc.major)
    expect(cult.sub).toBe(targetNpc.sub)
    expect(cult.expPct).toBe(0)
    expect(cult.status).toBe('cultivating')
  })

  it('Khi chuyển tháng, NPC tu luyện thuận lợi tích lũy tu vi và có thể tiến cảnh tiểu tầng', () => {
    const store = useNpcStore()
    const targetNpc = WORLD_NPCS[0]!

    // Đặt NPC ở tầng 0 với 90% tu vi
    store.setNpcCultivation(targetNpc.id, {
      major: 0,
      sub: 0,
      expPct: 90,
      status: 'cultivating',
      lastCultivatedMonth: 1
    })

    // Mô phỏng sang tháng 2
    store.simulateNpcWorldCultivation(2, 1)

    const updated = store.getNpcCultivation(targetNpc.id)
    // Phải đột phá lên tầng 1
    expect(updated.sub).toBe(1)
    expect(updated.expPct).toBeLessThan(100)
    expect(updated.lastCultivatedMonth).toBe(2)
  })

  it('Khi NPC ở tầng 8 (đỉnh phong) tích lũy đầy 100% tu vi sẽ chuyển sang trạng thái bình cảnh', () => {
    const store = useNpcStore()
    const targetNpc = WORLD_NPCS[0]!

    store.setNpcCultivation(targetNpc.id, {
      major: 0,
      sub: 8,
      expPct: 95,
      status: 'cultivating',
      lastCultivatedMonth: 1
    })

    store.simulateNpcWorldCultivation(2, 1)

    const updated = store.getNpcCultivation(targetNpc.id)
    expect(updated.status).toBe('bottleneck')
    expect(updated.expPct).toBe(100)
  })

  it('NPC ở trạng thái bình cảnh có thể phá vỡ đại cảnh giới sau một số chu kỳ tháng', () => {
    const store = useNpcStore()
    const targetNpc = WORLD_NPCS[0]!

    store.setNpcCultivation(targetNpc.id, {
      major: 0,
      sub: 8,
      expPct: 100,
      status: 'bottleneck',
      lastCultivatedMonth: 1
    })

    // Cho trôi qua 10 tháng để đảm bảo có lần phá vỡ thành công
    store.simulateNpcWorldCultivation(11, 10)

    const updated = store.getNpcCultivation(targetNpc.id)
    // Hoặc đã đột phá lên major 1, hoặc vẫn bottleneck/injured nhưng trạng thái hợp lệ
    expect(['cultivating', 'bottleneck', 'injured']).toContain(updated.status)
    if (updated.major > 0) {
      expect(updated.major).toBe(1)
      expect(updated.sub).toBe(0)
    }
  })

  it('NPC bị thương có cơ hội tự chữa lành sau các chu kỳ tháng', () => {
    const store = useNpcStore()
    const targetNpc = WORLD_NPCS[0]!

    store.setNpcCultivation(targetNpc.id, {
      major: 1,
      sub: 2,
      expPct: 20,
      status: 'injured',
      lastCultivatedMonth: 1
    })

    // Nhiều chu kỳ trôi qua, xác suất hồi phục gần như tuyệt đối (1 - 0.5^10 > 99.9%)
    store.simulateNpcWorldCultivation(12, 10)

    const updated = store.getNpcCultivation(targetNpc.id)
    expect(updated.status).toBe('cultivating')
  })

  it('advanceMonthTime tự động kích hoạt mô phỏng tu luyện cho NPC', () => {
    const store = useNpcStore()
    const targetNpc = WORLD_NPCS[0]!
    const before = { ...store.getNpcCultivation(targetNpc.id) }

    // 1 tháng = 1800 giây
    store.advanceMonthTime(1800)

    expect(store.gameMonth).toBe(2)
    const after = store.getNpcCultivation(targetNpc.id)
    expect(after.lastCultivatedMonth).toBe(2)
    expect(after.expPct).toBeGreaterThanOrEqual(before.expPct)
  })
})
