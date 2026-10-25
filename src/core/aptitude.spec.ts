import { describe, expect, it, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { APTITUDES, rollAptitudes, aptitudeDef, APTITUDE_GRADE_META } from '@/data/aptitudes'
import { TALENTS } from '@/data/talents'
import { usePlayerStore } from '@/stores/player'
import { rng } from '@/utils/random'
import { modOf } from './statsCalc'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('Hệ thống Tư chất nhân vật mở rộng (120 tư chất / 6 cấp bậc)', () => {
  it('Kho tư chất có đúng 120 tư chất, chia đều 6 cấp bậc phẩm chất (mỗi cấp đúng 20 tư chất)', () => {
    expect(APTITUDES.length).toBe(120)

    const grade1 = APTITUDES.filter(a => a.grade === 1)
    const grade2 = APTITUDES.filter(a => a.grade === 2)
    const grade3 = APTITUDES.filter(a => a.grade === 3)
    const grade4 = APTITUDES.filter(a => a.grade === 4)
    const grade5 = APTITUDES.filter(a => a.grade === 5)
    const grade6 = APTITUDES.filter(a => a.grade === 6)

    expect(grade1.length, 'Cấp 1 (Phàm phẩm) phải có đúng 20 tư chất').toBe(20)
    expect(grade2.length, 'Cấp 2 (Trung phẩm) phải có đúng 20 tư chất').toBe(20)
    expect(grade3.length, 'Cấp 3 (Thượng phẩm) phải có đúng 20 tư chất').toBe(20)
    expect(grade4.length, 'Cấp 4 (Địa phẩm) phải có đúng 20 tư chất').toBe(20)
    expect(grade5.length, 'Cấp 5 (Thiên phẩm) phải có đúng 20 tư chất').toBe(20)
    expect(grade6.length, 'Cấp 6 (Tuyệt phẩm) phải có đúng 20 tư chất').toBe(20)
  })

  it('Tất cả 120 ID và 120 tên tư chất là duy nhất, không có bất kỳ sự trùng lặp nào', () => {
    const ids = APTITUDES.map(a => a.id)
    const names = APTITUDES.map(a => a.name)

    expect(new Set(ids).size, 'Tất cả ID tư chất phải là duy nhất').toBe(120)
    expect(new Set(names).size, 'Tất cả tên tư chất phải là duy nhất').toBe(120)
  })

  it('Bao phủ đầy đủ 6 nhóm danh mục tư chất', () => {
    const categories = new Set(APTITUDES.map(a => a.category))
    expect(categories.has('comprehension'), 'Thiếu nhóm Ngộ tính').toBe(true)
    expect(categories.has('cultivation'), 'Thiếu nhóm Tu luyện').toBe(true)
    expect(categories.has('fortune'), 'Thiếu nhóm Khí vận').toBe(true)
    expect(categories.has('charm'), 'Thiếu nhóm Mị lực').toBe(true)
    expect(categories.has('physique'), 'Thiếu nhóm Thể chất').toBe(true)
    expect(categories.has('craft'), 'Thiếu nhóm Bách nghệ').toBe(true)
  })

  it('Đặc trưng Cấp 1 (Phàm phẩm): 100% tư chất bắt buộc có CẢ hiệu ứng cộng VÀ hiệu ứng trừ', () => {
    const grade1 = APTITUDES.filter(a => a.grade === 1)
    for (const apt of grade1) {
      const values = Object.values(apt.mods).filter((v): v is number => typeof v === 'number')
      const hasPositive = values.some(v => v > 0)
      const hasNegative = values.some(v => v < 0)

      expect(hasPositive, `Tư chất Phàm phẩm ${apt.name} (${apt.id}) thiếu hiệu ứng cộng`).toBe(true)
      expect(hasNegative, `Tư chất Phàm phẩm ${apt.name} (${apt.id}) thiếu hiệu ứng trừ (đánh đổi)`).toBe(true)
    }
  })

  it('Bảng meta hiển thị đầy đủ thông tin cho cả 6 cấp bậc', () => {
    for (let g = 1; g <= 6; g++) {
      const meta = APTITUDE_GRADE_META[g as 1 | 2 | 3 | 4 | 5 | 6]
      expect(meta).toBeDefined()
      expect(meta.name).toBeTruthy()
      expect(meta.color).toBeTruthy()
      expect(meta.borderClass).toBeTruthy()
      expect(meta.textClass).toBeTruthy()
    }
  })

  it('Tương thích ngược: Tra cứu qua ID cũ (alias) vẫn trả về tư chất hợp lệ', () => {
    const oldTongTue = aptitudeDef('apt_tongtue')
    expect(oldTongTue).toBeDefined()
    expect(oldTongTue?.name).toBe('Thông Tuệ')

    const oldKhangKien = aptitudeDef('apt_khangkien')
    expect(oldKhangKien).toBeDefined()
    expect(oldKhangKien?.name).toBe('Thân Thể Khang Kiện')

    const oldThatKhieu = aptitudeDef('apt_thatkhieu')
    expect(oldThatKhieu).toBeDefined()
  })

  it('Hàm rollAptitudes gieo đủ số lượng tư chất không trùng lặp và sắp xếp theo phẩm cấp giảm dần', () => {
    for (let i = 0; i < 50; i++) {
      const rolled = rollAptitudes(rng, 3)
      expect(rolled.length).toBe(3)

      const ids = new Set(rolled.map(r => r.id))
      expect(ids.size).toBe(3)

      // Kiểm tra sắp xếp giảm dần theo grade
      expect(rolled[0]!.grade).toBeGreaterThanOrEqual(rolled[1]!.grade)
      expect(rolled[1]!.grade).toBeGreaterThanOrEqual(rolled[2]!.grade)
    }
  })

  it('Hiệu ứng tư chất được tích hợp chính xác vào finalStats của nhân vật', () => {
    const player = usePlayerStore()
    // Khởi tạo nhân vật với 2 tư chất: Căn cốt cường kiện (+15% maxHpPct, +8% defensePct) và Tu luyện tinh tiến (+15% cultivationSpeed)
    player.initCharacter(
      'Đạo Hữu Test',
      { roots: [], gradeName: 'Phàm Phẩm', growthMult: 1 },
      'male',
      ['apt_u_41', 'apt_u_42']
    )

    expect(player.aptitudes).toEqual(['apt_u_41', 'apt_u_42'])

    // Kiểm tra các mod đã được nạp vào finalStats
    const mods = player.finalStats.mods
    expect(modOf(mods, 'cultivationSpeed')).toBeGreaterThanOrEqual(0.15)
    expect(modOf(mods, 'maxHpPct')).toBeGreaterThanOrEqual(0.15)
    expect(modOf(mods, 'defensePct')).toBeGreaterThanOrEqual(0.08)

    // Kiểm tra bảng nguồn gốc breakdown có ghi nhận nguồn từ Tư chất
    const breakdownNames = player.finalStats.breakdown.map(b => b.name)
    expect(breakdownNames.some(n => n.includes('Tư chất·Tu Luyện Tinh Tiến'))).toBe(true)
    expect(breakdownNames.some(n => n.includes('Tư chất·Căn Cốt Cường Kiện'))).toBe(true)
  })

  it('Tương thích save cũ: Tự động chuẩn hóa aptitudes nếu save cũ bị undefined hoặc lỗi', () => {
    const player = usePlayerStore()
    ;(player as unknown as { aptitudes: unknown }).aptitudes = undefined

    player.sanitize()
    expect(Array.isArray(player.aptitudes)).toBe(true)
    expect(player.aptitudes.length).toBe(0)

    // Nếu chứa ID rác không tồn tại
    ;(player as unknown as { aptitudes: unknown }).aptitudes = ['apt_p_01', 'id_khong_ton_tai', 123]
    player.sanitize()
    expect(player.aptitudes).toEqual(['apt_p_01'])
  })

  it('Tất cả tư chất và thiên phú đều có trọng số xuất hiện ngang nhau (weight = 10)', () => {
    // 120 tư chất khởi đầu đều có weight = 10
    for (const apt of APTITUDES) {
      expect(apt.weight, `Tư chất ${apt.name} (${apt.id}) phải có trọng số 10`).toBe(10)
    }

    // 33 thiên phú chuyển thế đều có weight = 10
    for (const talent of TALENTS) {
      expect(talent.weight, `Thiên phú ${talent.name} (${talent.id}) phải có trọng số 10`).toBe(10)
    }
  })
})
