import { describe, expect, it, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePlayerStore } from '@/stores/player'
import { useAdventureStore } from '@/stores/adventure'
import { initFirstLoveDaolu, currentDaolu } from './daoluService'
import { FIRST_LOVE_APTITUDE_ID, aptitudeDef, APTITUDES } from '@/data/aptitudes'
import { daoluDef } from '@/data/daolu'
import { startExploration, stopExploration } from './exploration'
import { getNpc } from './npcService'
import { gn } from '@/utils/gnum'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('Hệ thống Đạo Lữ: Tự chọn & Thiên phú Nhất Kiến Chung Tình', () => {
  it('Tư chất Nhất Kiến Chung Tình tồn tại trong kho 120 tư chất (Thiên phẩm, Mị lực)', () => {
    const apt = aptitudeDef(FIRST_LOVE_APTITUDE_ID)
    expect(apt).toBeDefined()
    expect(apt?.name).toBe('Nhất Kiến Chung Tình')
    expect(apt?.category).toBe('charm')
    expect(apt?.grade).toBe(5) // Thiên phẩm

    // Bảo toàn đúng 120 tư chất
    expect(APTITUDES.length).toBe(120)
  })

  it('Khi không có thiên phú Nhất Kiến Chung Tình và chưa có đạo lữ, lịch luyện KHÔNG tự động xuất hiện đạo lữ', () => {
    const player = usePlayerStore()
    const adventure = useAdventureStore()
    // Khởi tạo nhân vật bình thường
    player.initCharacter('Hàn Lập', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'male')
    expect(player.bond).toBeNull()

    // Bắt đầu lịch luyện
    const started = startExploration('qingyun', 'normal', false)
    expect(started).toBe(true)

    // Giả lập tích lũy trận thắng trong phiên lịch luyện
    if (adventure.session) {
      adventure.setSession({
        ...adventure.session,
        wins: 10,
        expGain: gn(500)
      })
    }

    // Kết thúc phiên lịch luyện
    stopExploration('complete')

    // Đạo lữ vẫn phải là null, không bị hệ thống tự động gán ngẫu nhiên
    expect(player.bond).toBeNull()
    expect(currentDaolu()).toBeNull()
  })

  it('initFirstLoveDaolu kết duyên đạo lữ khác giới tính ngay từ ban đầu cho nhân vật Nam', () => {
    const player = usePlayerStore()
    player.initCharacter('Hàn Lập', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'male', [FIRST_LOVE_APTITUDE_ID])
    expect(player.bond).toBeNull()

    // Kích hoạt đạo lữ khởi đầu theo thiên phú Nhất Kiến Chung Tình
    const partner = initFirstLoveDaolu('male')
    expect(partner).toBeDefined()
    expect(partner?.gender).toBe('female')

    // Trạng thái đạo lữ được thiết lập đồng hành (together)
    expect(player.bond).toBeDefined()
    expect(player.bond?.stage).toBe('together')
    expect(player.bond?.daoluId).toBe(partner?.id)
    expect(player.bond?.daoluMajor).toBeGreaterThanOrEqual(1)
    expect(player.bond?.daoluStatus).toBe('cultivating')

    // Tra cứu đạo lữ hiện tại
    const current = currentDaolu()
    expect(current).toBeDefined()
    expect(current?.id).toBe(partner?.id)
    expect(current?.gender).toBe('female')
  })

  it('initFirstLoveDaolu kết duyên đạo lữ khác giới tính ngay từ ban đầu cho nhân vật Nữ', () => {
    const player = usePlayerStore()
    player.initCharacter('Nam Cung Uyển', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'female', [FIRST_LOVE_APTITUDE_ID])
    expect(player.bond).toBeNull()

    const partner = initFirstLoveDaolu('female')
    expect(partner).toBeDefined()
    expect(partner?.gender).toBe('male')

    expect(player.bond?.stage).toBe('together')
    expect(player.bond?.daoluId).toBe(partner?.id)
  })

  it('initFirstLoveDaolu không ghi đè nếu nhân vật đã có đạo lữ hợp lệ', () => {
    const player = usePlayerStore()
    player.initCharacter('Hàn Lập', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'male')

    const first = initFirstLoveDaolu('male', 'dl_qingli')
    expect(first?.id).toBe('dl_qingli')
    expect(player.bond?.daoluId).toBe('dl_qingli')

    // Thử kích hoạt lại
    const second = initFirstLoveDaolu('male', 'dl_muyan')
    expect(second).toBeNull()
    // Vẫn giữ Thẩm Thanh Ly
    expect(player.bond?.daoluId).toBe('dl_qingli')
  })

  it('daoluDef có thể tra cứu thông tin cả Đạo Lữ gốc và NPC kết duyên', () => {
    // Đạo lữ gốc
    const qingli = daoluDef('dl_qingli')
    expect(qingli).toBeDefined()
    expect(qingli?.name).toBe('沈青璃')

    // NPC từ quần thể thế giới
    const npcSample = getNpc('npc_han_feiyu')
    if (npcSample) {
      const npcDaolu = daoluDef('npc_han_feiyu')
      expect(npcDaolu).toBeDefined()
      expect(npcDaolu?.name).toBe(npcSample.name)
      expect(npcDaolu?.gender).toBe(npcSample.gender)
    }
  })
})
