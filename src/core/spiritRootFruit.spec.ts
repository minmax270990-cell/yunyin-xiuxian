import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePlayerStore } from '@/stores/player'
import { useResourcesStore } from '@/stores/resources'
import { SPIRIT_ROOT_FRUITS, SPIRIT_ROOT_FRUIT_TIERS } from '@/data/spiritRootFruit'
import { recomputeLinggen } from '@/core/linggenGen'

describe('Linh Căn Quả & Bồi Dưỡng Linh Căn', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Có đầy đủ 3 cấp độ: Phàm Phẩm (+1), Trung Phẩm (+5), Thượng Phẩm (+10)', () => {
    expect(SPIRIT_ROOT_FRUIT_TIERS).toEqual(['mortal', 'earth', 'heaven'])
    expect(SPIRIT_ROOT_FRUITS.mortal.bonus).toBe(1)
    expect(SPIRIT_ROOT_FRUITS.earth.bonus).toBe(5)
    expect(SPIRIT_ROOT_FRUITS.heaven.bonus).toBe(10)
  })

  it('Phục dụng Linh Căn Quả tăng tư chất và tính lại growthMult/gradeName', () => {
    const player = usePlayerStore()
    const resources = useResourcesStore()

    // Khởi tạo nhân vật có linh căn Hỏa 60 điểm
    player.initCharacter('Thử Nghiệm', {
      roots: [{ element: 'fire', aptitude: 60 }],
      gradeName: 'Dị Linh Căn',
      growthMult: 1.6
    })

    // Cấp quả cho người chơi
    resources.addFruit('mortal', 5)
    expect(resources.fruitCount('mortal')).toBe(5)

    // Phục dụng 2 quả Phàm phẩm (+2)
    const res1 = player.consumeSpiritRootFruit('mortal', 2)
    expect(res1.ok).toBe(true)
    expect(player.linggen?.roots[0]?.aptitude).toBe(62)
    expect(resources.fruitCount('mortal')).toBe(3)

    // Cấp quả Trung phẩm (+5) và dùng 2 quả (+10)
    resources.addFruit('earth', 2)
    const res2 = player.consumeSpiritRootFruit('earth', 2)
    expect(res2.ok).toBe(true)
    expect(player.linggen?.roots[0]?.aptitude).toBe(72)

    // Cấp quả Thượng phẩm (+10) và dùng 1 quả (+10)
    resources.addFruit('heaven', 1)
    const res3 = player.consumeSpiritRootFruit('heaven', 1)
    expect(res3.ok).toBe(true)
    expect(player.linggen?.roots[0]?.aptitude).toBe(82)

    // Khi vượt ngưỡng 80 điểm ở đơn linh căn, thăng hoa lên Thiên Linh Căn
    expect(player.linggen?.gradeName).toBe('Thiên Linh Căn')
    expect(player.linggen?.growthMult).toBeGreaterThan(1.6)
  })

  it('Tư chất linh căn bị chặn trần ở 100 điểm viên mãn', () => {
    const player = usePlayerStore()
    const resources = useResourcesStore()

    player.initCharacter('Thử Nghiệm', {
      roots: [{ element: 'water', aptitude: 95 }],
      gradeName: 'Thiên Linh Căn',
      growthMult: 2.5
    })

    resources.addFruit('heaven', 2) // +20 điểm nhưng chỉ thiếu 5 điểm là đạt 100
    const res = player.consumeSpiritRootFruit('heaven', 1)
    expect(res.ok).toBe(true)
    expect(player.linggen?.roots[0]?.aptitude).toBe(100)

    // Khi đã đạt 100 điểm, không thể tăng thêm
    const resOver = player.consumeSpiritRootFruit('heaven', 1)
    expect(resOver.ok).toBe(false)
    expect(player.linggen?.roots[0]?.aptitude).toBe(100)
    // Không bị trừ quả khi đã đạt trần
    expect(resources.fruitCount('heaven')).toBe(1)
  })

  it('Hỗ trợ tăng nhiều linh căn cùng lúc hoặc chỉ định một rễ linh căn', () => {
    const player = usePlayerStore()
    const resources = useResourcesStore()

    player.initCharacter('Thử Nghiệm Song Căn', {
      roots: [
        { element: 'metal', aptitude: 50 },
        { element: 'wood', aptitude: 50 }
      ],
      gradeName: 'Chân Linh Căn',
      growthMult: 1.5
    })

    resources.addFruit('earth', 5)

    // Chỉ định tăng Mộc linh căn
    player.consumeSpiritRootFruit('earth', 1, 'wood')
    expect(player.linggen?.roots.find(r => r.element === 'wood')?.aptitude).toBe(55)
    expect(player.linggen?.roots.find(r => r.element === 'metal')?.aptitude).toBe(50)

    // Tăng toàn bộ linh căn (không truyền targetElement)
    player.consumeSpiritRootFruit('earth', 1)
    expect(player.linggen?.roots.find(r => r.element === 'wood')?.aptitude).toBe(60)
    expect(player.linggen?.roots.find(r => r.element === 'metal')?.aptitude).toBe(55)
  })

  it('Tính năng maxAllSpiritRoots đưa tất cả rễ về 100 điểm', () => {
    const player = usePlayerStore()
    player.initCharacter('Thử Nghiệm Ngũ Hành', {
      roots: [
        { element: 'metal', aptitude: 30 },
        { element: 'wood', aptitude: 40 },
        { element: 'water', aptitude: 50 },
        { element: 'fire', aptitude: 60 },
        { element: 'earth', aptitude: 70 }
      ],
      gradeName: 'Tạp Linh Căn',
      growthMult: 0.8
    })

    const res = player.maxAllSpiritRoots()
    expect(res.ok).toBe(true)
    expect(player.linggen?.roots.every(r => r.aptitude === 100)).toBe(true)
    expect(player.linggen?.growthMult).toBe(round2((100 / 60) * 0.9))
  })

  it('recomputeLinggen xử lý đúng Hỗn Độn Linh Căn', () => {
    const profile = recomputeLinggen([{ element: 'chaos', aptitude: 100 }])
    expect(profile.gradeName).toBe('Hỗn Độn Linh Căn')
    expect(profile.growthMult).toBe(4) // 1.6 * (100 / 60) * 1.5 = 4.0
  })

  it('resources.sanitize bảo toàn và làm sạch spiritRootFruit khi dữ liệu bị hỏng', () => {
    const resources = useResourcesStore()
    // @ts-expect-error ép kiểu thử nghiệm dữ liệu xấu
    resources.spiritRootFruit = { mortal: -5, earth: NaN, heaven: 'invalid' }
    resources.sanitize()
    expect(resources.fruitCount('mortal')).toBe(0)
    expect(resources.fruitCount('earth')).toBe(0)
    expect(resources.fruitCount('heaven')).toBe(0)

    resources.addFruit('mortal', 10)
    resources.sanitize()
    expect(resources.fruitCount('mortal')).toBe(10)
  })
})

function round2(v: number): number {
  return Math.round(v * 100) / 100
}
