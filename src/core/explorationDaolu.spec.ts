import { describe, expect, it, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePlayerStore } from '@/stores/player'
import { useAdventureStore } from '@/stores/adventure'
import { meet } from './daoluService'
import { evaluateDaoluCompanion, startExploration, stopExploration, healDaoluWithPlayerBlood } from './exploration'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('Đạo Lữ Đồng Hành Lịch Luyện (Daolu Companion Exploration)', () => {
  it('Đánh giá tương quan thực lực và mức độ nguy hiểm trước khi xuất phát', () => {
    const player = usePlayerStore()
    player.initCharacter('Hàn Lập', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'male')
    meet('dl_qingli') // Thẩm Thanh Ly (startMajor: 1 - Luyện Khí)

    // Đánh giá khu vực khởi đầu 'qingyun' (Thanh Vân Sơn Lộc, tier 1)
    const evalQingyun = evaluateDaoluCompanion('qingyun')
    expect(evalQingyun).toBeDefined()
    expect(evalQingyun?.partnerName).toBe('沈青璃')
    expect(['safe', 'perilous', 'deadly']).toContain(evalQingyun?.dangerLevel)
    expect(evalQingyun?.dangerTitle).toBeDefined()
    expect(evalQingyun?.dangerDesc).toBeDefined()

    // Khu vực cao giai 'guzhanchang' (Cổ Chiến Trường Di Tích - tier 6) -> Vượt xa cảnh giới Thẩm Thanh Ly
    const evalDanger = evaluateDaoluCompanion('guzhanchang')
    expect(evalDanger).toBeDefined()
    expect(evalDanger?.dangerLevel).toBe('deadly')
    expect(evalDanger?.dangerTitle).toContain('Cực kỳ nguy hiểm')
    expect(evalDanger?.dangerDesc).toContain('VẪN LẠC TỬ VONG')
  })

  it('Khởi hành lịch luyện cùng Đạo lữ đồng hành và lưu vào session', () => {
    const player = usePlayerStore()
    const adventure = useAdventureStore()
    player.initCharacter('Hàn Lập', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'male')
    meet('dl_qingli')

    // Bắt đầu lịch luyện có Đạo lữ đồng hành
    const ok = startExploration('qingyun', 'normal', true)
    expect(ok).toBe(true)
    expect(adventure.session).toBeDefined()
    expect(adventure.session?.accompanyPartnerId).toBe('dl_qingli')
    expect(adventure.session?.partnerHpPct).toBe(1.0)
    expect(adventure.session?.playerHpPct).toBe(1.0)

    // Kết thúc lịch luyện
    stopExploration('complete')
    expect(adventure.session).toBeNull()
  })

  it('Hồi phục khí huyết Đạo lữ bằng khí huyết bản thân theo tỷ lệ máu đã mất', () => {
    const player = usePlayerStore()
    const adventure = useAdventureStore()
    player.initCharacter('Hàn Lập', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'male')
    meet('dl_qingli')

    startExploration('qingyun', 'normal', true)
    expect(adventure.session).toBeDefined()

    // Khi đạo lữ đầy máu -> không cần truyền huyết
    const resFull = healDaoluWithPlayerBlood()
    expect(resFull.ok).toBe(false)

    // Giả lập Đạo lữ bị thương nặng trong lịch luyện (máu còn 20%, mất 80%)
    adventure.setSession({
      ...adventure.session!,
      partnerHpPct: 0.2,
      playerHpPct: 1.0
    })

    const initialFate = player.bond?.fate ?? 0
    // Thi triển bí thuật độ huyết
    const resHeal = healDaoluWithPlayerBlood()
    expect(resHeal.ok).toBe(true)
    // Tỷ lệ tiêu hao: mất 80% * 0.6 = 48% (0.48)
    expect(resHeal.playerHpLoss).toBeCloseTo(0.48, 2)
    expect(resHeal.newPlayerHp).toBeCloseTo(0.52, 2)
    // Đạo lữ hồi phục về 100%
    expect(adventure.session?.partnerHpPct).toBe(1.0)
    expect(adventure.session?.playerHpPct).toBeCloseTo(0.52, 2)
    // Tăng điểm gắn kết
    expect((player.bond?.fate ?? 0) > initialFate).toBe(true)

    stopExploration('manual')
  })

  it('Không thể mời Đạo lữ khi chưa kết duyên hoặc Đạo lữ đã vẫn lạc', () => {
    const player = usePlayerStore()
    const adventure = useAdventureStore()
    player.initCharacter('Hàn Lập', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'male')

    // Chưa có Đạo lữ -> Đánh giá null
    expect(evaluateDaoluCompanion('qingyun')).toBeNull()

    // Bắt đầu lịch luyện
    startExploration('qingyun', 'normal', true)
    expect(adventure.session?.accompanyPartnerId).toBeUndefined()
    stopExploration('manual')

    // Đã có Đạo lữ nhưng đã vẫn lạc
    meet('dl_qingli')
    player.setBond({
      ...player.bond!,
      fallen: true
    })
    expect(evaluateDaoluCompanion('qingyun')).toBeNull()
    startExploration('qingyun', 'normal', true)
    expect(adventure.session?.accompanyPartnerId).toBeUndefined()
    stopExploration('manual')
  })
})
