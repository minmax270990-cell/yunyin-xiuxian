import { describe, expect, it, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { DAOLU } from '@/data/daolu'
import { candidatesFor, destinedCandidate, meet, type BondRecord } from './daoluService'
import { usePlayerStore } from '@/stores/player'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('Giới tính nhân vật & Quy tắc Đạo lữ', () => {
  it('Phân loại chính xác giới tính của 10 đạo lữ hiện có (4 Nữ, 6 Nam)', () => {
    expect(DAOLU.length).toBe(10)

    const females = DAOLU.filter(d => d.gender === 'female')
    const males = DAOLU.filter(d => d.gender === 'male')

    expect(females.length).toBe(4)
    expect(males.length).toBe(6)

    // Kiểm tra danh tính các đạo lữ Nữ
    const femaleIds = females.map(d => d.id)
    expect(femaleIds).toContain('dl_qingli') // Thẩm Thanh Ly
    expect(femaleIds).toContain('dl_muyan') // Mộ Yên
    expect(femaleIds).toContain('dl_yunshu') // Vân Thư
    expect(femaleIds).toContain('dl_baiwei') // Bạch Vi

    // Kiểm tra danh tính các đạo lữ Nam
    const maleIds = males.map(d => d.id)
    expect(maleIds).toContain('dl_zhaoyan') // Triệu Nghiễn
    expect(maleIds).toContain('dl_hanzheng') // Hàn Tranh
    expect(maleIds).toContain('dl_ligu') // Lệ Cô
    expect(maleIds).toContain('dl_zhongli') // Chung Ly Việt
    expect(maleIds).toContain('dl_xuewu') // Tuyết Vô Ngân
    expect(maleIds).toContain('dl_cangming') // Thương Minh
  })

  it('Nhân vật Nam chỉ có thể kết duyên với đạo lữ Nữ', () => {
    const player = usePlayerStore()
    player.initCharacter('Tiêu Viêm', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'male')
    expect(player.gender).toBe('male')

    // Thử kết duyên với đạo lữ Nam -> Bị từ chối
    expect(meet('dl_zhaoyan')).toBe(false)
    expect(meet('dl_hanzheng')).toBe(false)
    expect(player.bond).toBeNull()

    // Kết duyên với đạo lữ Nữ -> Thành công
    expect(meet('dl_qingli')).toBe(true)
    expect(player.bond?.daoluId).toBe('dl_qingli')
  })

  it('Nhân vật Nữ chỉ có thể kết duyên với đạo lữ Nam', () => {
    const player = usePlayerStore()
    player.initCharacter('Hàn Lập Muội', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'female')
    expect(player.gender).toBe('female')

    // Thử kết duyên với đạo lữ Nữ -> Bị từ chối
    expect(meet('dl_qingli')).toBe(false)
    expect(meet('dl_muyan')).toBe(false)
    expect(player.bond).toBeNull()

    // Kết duyên với đạo lữ Nam -> Thành công
    expect(meet('dl_zhaoyan')).toBe(true)
    expect(player.bond?.daoluId).toBe('dl_zhaoyan')
  })

  it('candidatesFor lọc chính xác theo giới tính yêu cầu', () => {
    const allTerrains = ['林泽', '山岳', '废墟', '幽冥', '天象', '火域']

    // Ứng viên Nữ
    const femaleCandidates = candidatesFor(allTerrains, 'female')
    expect(femaleCandidates.length).toBeGreaterThan(0)
    expect(femaleCandidates.every(d => d.gender === 'female')).toBe(true)

    // Ứng viên Nam
    const maleCandidates = candidatesFor(allTerrains, 'male')
    expect(maleCandidates.length).toBeGreaterThan(0)
    expect(maleCandidates.every(d => d.gender === 'male')).toBe(true)
  })

  it('destinedCandidate tôn trọng ràng buộc giới tính', () => {
    const history: BondRecord[] = [
      { daoluId: 'dl_qingli', name: '沈青璃', stage: 'pledged', ending: 'accompanied', shared: 10 },
      { daoluId: 'dl_zhaoyan', name: '赵砚', stage: 'pledged', ending: 'accompanied', shared: 10 }
    ]

    // Nếu tìm ứng viên Nam trong tiền duyên
    const malePick = destinedCandidate(history, ['废墟', '山岳'], 'male')
    if (malePick) {
      expect(malePick.gender).toBe('male')
    }

    // Nếu tìm ứng viên Nữ trong tiền duyên
    const femalePick = destinedCandidate(history, ['林泽', '山岳'], 'female')
    if (femalePick) {
      expect(femalePick.gender).toBe('female')
    }
  })

  it('Tương thích save cũ: Tự động suy luận giới tính hợp lý nếu save cũ thiếu trường gender', () => {
    const player = usePlayerStore()
    // Giả lập save cũ chưa có gender
    ;(player as unknown as { gender: unknown }).gender = undefined

    // Nếu đang kết duyên với đạo lữ Nam -> nhân vật chính được suy luận là Nữ
    player.setBond({
      daoluId: 'dl_zhaoyan', // Triệu Nghiễn (Nam)
      stage: 'known',
      fate: 20,
      trust: 10,
      accord: 30,
      shared: 1,
      metAt: Date.now(),
      fallen: false,
      doneEvents: [],
      opportunities: 0,
      nextEventAt: 6
    })

    player.sanitize()
    expect(player.gender).toBe('female')
    // Quan hệ cũ không bị phá hủy
    expect(player.bond?.daoluId).toBe('dl_zhaoyan')
  })

  it('Tương thích save cũ: Mặc định là Nam nếu chưa từng có đạo lữ', () => {
    const player = usePlayerStore()
    ;(player as unknown as { gender: unknown }).gender = undefined
    ;(player as unknown as { bond: unknown }).bond = null

    player.sanitize()
    expect(player.gender).toBe('male')
  })
})
