import { describe, expect, it, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { meet, fall } from './daoluService'
import {
  talkWithDaolu,
  giftToDaolu,
  assistDaolu,
  dualCultivateWithDaolu,
  sparWithDaolu,
  triggerDaoluAdventure,
  releaseFallenDaolu,
  getDaoluProactiveDialogue
} from './daoluInteractionService'
import { displayDaoluName } from '@/ui/displayZhVi'
import { usePlayerStore } from '@/stores/player'
import { useInventoryStore } from '@/stores/inventory'
import { useResourcesStore } from '@/stores/resources'
import { gn } from '@/utils/gnum'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('Hệ thống Tương tác Chiều sâu Đạo Lữ (Daolu Interaction Service)', () => {
  it('Trò chuyện & Tâm sự: Gia tăng duyên phận, lòng tin và bị giới hạn 3 lần/ngày', () => {
    const player = usePlayerStore()
    player.initCharacter('Tiêu Viêm', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'male')
    meet('dl_qingli') // Thẩm Thanh Ly (female)

    const initialFate = player.bond!.fate
    const initialTrust = player.bond!.trust

    // Lần 1
    const res1 = talkWithDaolu()
    expect(res1.success).toBe(true)
    expect(res1.line).toBeDefined()
    expect(player.bond!.fate).toBe(initialFate + 2)
    expect(player.bond!.trust).toBe(initialTrust + 2)

    // Lần 2 & 3
    expect(talkWithDaolu().success).toBe(true)
    expect(talkWithDaolu().success).toBe(true)

    // Lần 4: Chạm giới hạn trong ngày
    const res4 = talkWithDaolu()
    expect(res4.success).toBe(false)
    expect(res4.message).toContain('đã đàm đạo nhiều rồi')
  })

  it('Tặng quà: Tiêu hao tài nguyên, nhận biết sở thích và phản hồi thích hợp', () => {
    const player = usePlayerStore()
    player.initCharacter('Tiêu Viêm', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'male')
    meet('dl_qingli') // Thẩm Thanh Ly theo lean: 'alchemy' (yêu thích đan dược, linh thảo)

    const inventory = useInventoryStore()
    const resources = useResourcesStore()

    // Cung cấp tài nguyên
    inventory.addPill('pill_peiyuan', 5)
    resources.addHerb(1, 10)
    resources.addSmall('ore', 10)

    // 1. Tặng đan dược (món yêu thích)
    const giftPillRes = giftToDaolu('pill', 'pill_peiyuan')
    expect(giftPillRes.success).toBe(true)
    expect(giftPillRes.reaction).toBe('fond') // Phản hồi trân quý
    expect(inventory.pills.pill_peiyuan).toBe(4) // Trừ 1 viên

    // 2. Tặng khoáng thạch (món bình thường với đan tu)
    const giftOreRes = giftToDaolu('ore')
    expect(giftOreRes.success).toBe(true)
    expect(giftOreRes.reaction).toBe('pleased')
    expect(resources.ore).toBe(9) // Trừ 1 quặng

    // 3. Tặng linh thảo
    const giftHerbRes = giftToDaolu('herb', 1)
    expect(giftHerbRes.success).toBe(true)
    expect(resources.herbOf(1)).toBe(9)

    // 4. Lần thứ 4: Giới hạn ngày
    const gift4 = giftToDaolu('ore')
    expect(gift4.success).toBe(false)
    expect(gift4.message).toContain('nhiều lần rồi')
  })

  it('Giúp đỡ hộ pháp: Tiêu hao linh thạch hoặc truyền độ linh khí', () => {
    const player = usePlayerStore()
    player.initCharacter('Tiêu Viêm', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'male')
    meet('dl_qingli')

    const resources = useResourcesStore()
    resources.addStone(gn(2000))

    const trustBefore = player.bond!.trust
    const assistStone = assistDaolu('spirit_stone')
    expect(assistStone.success).toBe(true)
    expect(player.bond!.trust).toBe(trustBefore + 8)

    // Truyền linh khí
    resources.setQi(500, 1000)
    const assistQi = assistDaolu('qi_infusion')
    expect(assistQi.success).toBe(true)
    expect(resources.qi).toBeLessThan(500)
  })

  it('Song tu cảm ngộ: Tăng exp, hồi phục linh khí, không sinh StatMods vĩnh viễn, cooldown 1 lần/ngày', () => {
    const player = usePlayerStore()
    player.initCharacter('Tiêu Viêm', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'male')
    meet('dl_qingli')

    // Chưa đạt giai đoạn 'together' -> từ chối
    const failStage = dualCultivateWithDaolu()
    expect(failStage.success).toBe(false)
    expect(failStage.message).toContain('chưa đủ gắn kết')

    // Nâng lên giai đoạn 'together' với đủ chỉ số môn hạm (fate >= 35, trust >= 20, shared >= 1)
    player.setBond({
      ...player.bond!,
      stage: 'together',
      fate: 40,
      trust: 30,
      accord: 40,
      shared: 1
    })

    const expBefore = { ...player.exp }
    // Đặt trước linh khí đầy để kích hoạt trạng thái linh khí dồi dào sẵn có của game
    const resources = useResourcesStore()
    resources.setQi(player.qiCapValue, player.qiCapValue)
    const modsBefore = JSON.stringify(player.finalStats.mods)

    // Song tu lần 1
    const dualRes = dualCultivateWithDaolu()
    expect(dualRes.success).toBe(true)

    // Tu vi phải tăng
    expect(player.exp.m > expBefore.m || player.exp.e > expBefore.e).toBe(true)

    // BẤT BIẾN KIẾN TRÚC: StatMods tuyệt đối không đổi
    const modsAfter = JSON.stringify(player.finalStats.mods)
    expect(modsAfter).toBe(modsBefore)

    // Song tu lần 2 trong cùng ngày -> Cooldown
    const dualRes2 = dualCultivateWithDaolu()
    expect(dualRes2.success).toBe(false)
    expect(dualRes2.message).toContain('cần thời gian tiêu hóa')
  })

  it('Tỉ thí luận kiếm: Mô phỏng giao đấu qua resolveCombat, không gây tử vong, cooldown 1 lần/ngày', () => {
    const player = usePlayerStore()
    player.initCharacter('Tiêu Viêm', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'male')
    meet('dl_qingli')

    const trustBefore = player.bond!.trust
    const sparRes = sparWithDaolu()
    expect(sparRes.success).toBe(true)
    expect(sparRes.rounds).toBeGreaterThan(0)
    expect(sparRes.combatResult).toBeDefined()
    expect(player.bond!.trust).toBeGreaterThan(trustBefore)

    // Lần 2 trong ngày -> Cooldown
    const sparRes2 = sparWithDaolu()
    expect(sparRes2.success).toBe(false)
    expect(sparRes2.message).toContain('hãy để kiếm ý lắng đọng')
  })

  it('Kỳ ngộ độc lập của Đạo Lữ: Tự động ghi nhận hành trình độc lập', () => {
    const player = usePlayerStore()
    player.initCharacter('Tiêu Viêm', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'male')
    meet('dl_qingli')

    const adv = triggerDaoluAdventure()
    expect(adv).toBeDefined()
    expect(adv?.title).toBeDefined()
    expect(player.bond!.adventures?.length).toBe(1)
  })

  it('Sinh tử & Kết duyên Đạo lữ mới: Khi đạo lữ mất, có thể buông bỏ an táng và kết duyên người mới khác giới', () => {
    const player = usePlayerStore()
    player.initCharacter('Hàn Lập', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'male')

    // 1. Kết duyên cùng Thẩm Thanh Ly
    expect(meet('dl_qingli')).toBe(true)
    expect(player.bond?.daoluId).toBe('dl_qingli')

    // 2. Không thể kết duyên thêm người khác khi đang có đạo lữ
    expect(meet('dl_muyan')).toBe(false)

    // 3. Đạo lữ gặp nạn tạ thế
    fall()
    expect(player.bond?.fallen).toBe(true)

    // Khi đã mất nhưng chưa an táng, vẫn chưa thể kết duyên người mới
    expect(meet('dl_muyan')).toBe(false)

    // 4. Tiến hành an táng & buông bỏ tiền duyên
    const releaseRes = releaseFallenDaolu()
    expect(releaseRes.success).toBe(true)

    // Bond slot được giải phóng hoàn toàn về null
    expect(player.bond).toBeNull()

    // Người đã khuất được lưu vào lịch thế đồng hành (reincarnation.bonds)
    expect(player.reincarnation.bonds.length).toBe(1)
    expect(player.reincarnation.bonds[0]?.daoluId).toBe('dl_qingli')
    expect(player.reincarnation.bonds[0]?.ending).toBe('perished')

    // 5. Bây giờ người chơi hoàn toàn tự do kết duyên cùng Đạo lữ mới còn sống khác giới!
    expect(meet('dl_muyan')).toBe(true) // Mộ Yên (female)
    expect(player.bond?.daoluId).toBe('dl_muyan')
    expect(player.bond?.fallen).toBe(false)
  })

  it('Chu cấp linh thạch qua giftToDaolu: Tiêu hao linh thạch, tăng tu vi và độ gắn bó', () => {
    const player = usePlayerStore()
    player.initCharacter('Tiêu Viêm', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'male')
    meet('dl_qingli')

    const resources = useResourcesStore()
    resources.addStone(gn(2000))
    player.setBond({
      ...player.bond!,
      daoluExpPct: 10
    })

    const giftRes = giftToDaolu('stone', 800)
    expect(giftRes.success).toBe(true)
    expect(giftRes.message).toContain('800 linh thạch')
    expect(player.bond!.daoluExpPct).toBeGreaterThan(10)
  })

  it('getDaoluProactiveDialogue: Đạo lữ chủ động trò chuyện và đưa ra đề xuất tương ứng', () => {
    const player = usePlayerStore()
    player.initCharacter('Tiêu Viêm', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'male')
    meet('dl_muyan')

    // 1. Bình thường: Lời tâm tình theo tính cách hiếu kỳ của Mộ Yên
    const normalDlg = getDaoluProactiveDialogue()
    expect(normalDlg).not.toBeNull()
    expect(normalDlg!.line).toContain('Mộ Yên')
    expect(normalDlg!.suggestedAction?.type).toBe('chat')

    // 2. Khi đạt 100% tu vi: Chủ động nhờ hộ pháp phá quan
    player.setBond({
      ...player.bond!,
      daoluExpPct: 100,
      daoluStatus: 'bottleneck'
    })
    const breakDlg = getDaoluProactiveDialogue()
    expect(breakDlg!.suggestedAction?.type).toBe('breakthrough')
    expect(breakDlg!.line).toContain('hộ pháp')
  })

  it('displayDaoluName: Thay thế tên tiếng Trung trong câu văn hoàn chỉnh', () => {
    const sentence = '[Thưởng Ngoạn Nhân Gian] 慕烟 ghé thăm Chợ Cũ, mua được một ít ngọc giản tàn chương.'
    const translated = displayDaoluName(sentence)
    expect(translated).toContain('Mộ Yên')
    expect(translated).not.toContain('慕烟')
  })
})
