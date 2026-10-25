import { describe, expect, it, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useNpcStore } from '@/stores/npc'
import { usePlayerStore } from '@/stores/player'
import { GAME_MONTH_REAL_SECONDS } from '@/data/constants'
import {
  interactWithWorldNpc,
  sparWithWorldNpc,
  giftToWorldNpc,
  inviteNpcToDaolu,
  inviteNpcToMentor,
  inviteNpcToApprentice,
  inviteNpcToSibling
} from './npcService'
import { meet } from './daoluService'
import { talkWithDaolu, sparWithDaolu, giftToDaolu } from './daoluInteractionService'
import { useInventoryStore } from '@/stores/inventory'
import { useResourcesStore } from '@/stores/resources'
import { comprehensionRankText } from '@/data/npcGeneration'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('Chu kỳ 1 tháng & Reset tương tác NPC định kỳ (World Month & NPC Monthly Reset)', () => {
  it('Chu kỳ thời gian 30 phút thực = 1 tháng trong game', () => {
    const npcStore = useNpcStore()
    expect(npcStore.gameMonth).toBe(1)
    expect(npcStore.monthElapsedSec).toBe(0)
    expect(npcStore.monthRemainingSec).toBe(GAME_MONTH_REAL_SECONDS)

    // Tích lũy 15 phút (900 giây) -> Chưa qua tháng
    const passed1 = npcStore.advanceMonthTime(900)
    expect(passed1).toBe(0)
    expect(npcStore.gameMonth).toBe(1)
    expect(npcStore.monthElapsedSec).toBe(900)
    expect(npcStore.monthRemainingSec).toBe(900)

    // Tích lũy thêm 15 phút nữa (900 giây) -> Tròn 30 phút -> Tiến 1 tháng
    const passed2 = npcStore.advanceMonthTime(900)
    expect(passed2).toBe(1)
    expect(npcStore.gameMonth).toBe(2)
    expect(npcStore.monthElapsedSec).toBe(0)
    expect(npcStore.monthRemainingSec).toBe(GAME_MONTH_REAL_SECONDS)

    // Trôi qua nhiều tháng cùng lúc (ví dụ offline 2.5 giờ = 9000 giây = 5 tháng)
    const passedOffline = npcStore.advanceMonthTime(9000)
    expect(passedOffline).toBe(5)
    expect(npcStore.gameMonth).toBe(7)
    expect(npcStore.monthElapsedSec).toBe(0)
  })

  it('Theo dõi tương tác và giới hạn 1 lần/tháng đối với NPC thường', () => {
    const npcStore = useNpcStore()
    const npcId = 'npc_truc_linh'

    expect(npcStore.getInteractionCount(npcId, 'greet')).toBe(0)
    expect(npcStore.canInteract(npcId, 'greet').allowed).toBe(true)

    // 1. Chào hỏi lần 1 -> Thành công
    const greetRes1 = interactWithWorldNpc(npcId, 'greet')
    expect(greetRes1.success).toBe(true)
    expect(npcStore.getInteractionCount(npcId, 'greet')).toBe(1)

    // Chào hỏi lần 2 trong cùng tháng -> Bị chặn
    const greetRes2 = interactWithWorldNpc(npcId, 'greet')
    expect(greetRes2.success).toBe(false)
    expect(greetRes2.message).toContain('Trong tháng này đã thực hiện tương tác này rồi')

    // 2. Đàm đạo lần 1 -> Thành công
    const chatRes1 = interactWithWorldNpc(npcId, 'chat')
    expect(chatRes1.success).toBe(true)
    expect(npcStore.getInteractionCount(npcId, 'chat')).toBe(1)

    // Đàm đạo lần 2 trong cùng tháng -> Bị chặn
    const chatRes2 = interactWithWorldNpc(npcId, 'chat')
    expect(chatRes2.success).toBe(false)

    // 3. Luận đạo lần 1 -> Thành công
    const discRes1 = interactWithWorldNpc(npcId, 'discuss')
    expect(discRes1.success).toBe(true)
    expect(npcStore.getInteractionCount(npcId, 'discuss')).toBe(1)

    // Luận đạo lần 2 trong cùng tháng -> Bị chặn
    const discRes2 = interactWithWorldNpc(npcId, 'discuss')
    expect(discRes2.success).toBe(false)
  })

  it('Tỉ thí và tặng quà cho NPC thường giới hạn 1 lần/tháng', () => {
    const npcStore = useNpcStore()
    const npcId = 'npc_truc_linh'
    const player = usePlayerStore()
    player.initCharacter('Hàn Lập', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'male')

    const inventory = useInventoryStore()
    inventory.addPill('pill_peiyuan', 5)

    // Tỉ thí lần 1
    const sparRes1 = sparWithWorldNpc(npcId)
    expect(sparRes1.success).toBe(true)
    expect(npcStore.getInteractionCount(npcId, 'spar')).toBe(1)

    // Tỉ thí lần 2 trong cùng tháng -> Bị chặn
    const sparRes2 = sparWithWorldNpc(npcId)
    expect(sparRes2.success).toBe(false)

    // Tặng quà lần 1
    const giftRes1 = giftToWorldNpc(npcId, 'pill', 'pill_peiyuan')
    expect(giftRes1.success).toBe(true)
    expect(npcStore.getInteractionCount(npcId, 'gift')).toBe(1)

    // Tặng quà lần 2 trong cùng tháng -> Bị chặn
    const giftRes2 = giftToWorldNpc(npcId, 'pill', 'pill_peiyuan')
    expect(giftRes2.success).toBe(false)
  })

  it('Bước sang tháng mới: Tự động làm mới lượt tương tác, bảo lưu hảo cảm và ân oán', () => {
    const npcStore = useNpcStore()
    const npcId = 'npc_truc_linh'

    // Thực hiện tương tác trong tháng 1
    interactWithWorldNpc(npcId, 'greet')
    interactWithWorldNpc(npcId, 'chat')
    expect(npcStore.getFavor(npcId)).toBeGreaterThan(0)
    const initialFavor = npcStore.getFavor(npcId)

    expect(npcStore.canInteract(npcId, 'greet').allowed).toBe(false)

    // Trôi qua 1 tháng (1800 giây)
    npcStore.advanceMonthTime(1800)
    expect(npcStore.gameMonth).toBe(2)

    // Lượt tương tác được làm mới về 0
    expect(npcStore.getInteractionCount(npcId, 'greet')).toBe(0)
    expect(npcStore.getInteractionCount(npcId, 'chat')).toBe(0)

    // Hảo cảm tích lũy KHÔNG bị mất
    expect(npcStore.getFavor(npcId)).toBe(initialFavor)

    // Tháng mới có thể tiếp tục tương tác
    expect(npcStore.canInteract(npcId, 'greet').allowed).toBe(true)
    const newMonthGreet = interactWithWorldNpc(npcId, 'greet')
    expect(newMonthGreet.success).toBe(true)
  })

  it('Tương tác Đạo Lữ: Tuân thủ giới hạn tháng và làm mới khi sang tháng mới', () => {
    const player = usePlayerStore()
    const npcStore = useNpcStore()
    player.initCharacter('Tiêu Viêm', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'male')
    meet('dl_qingli')

    const daoluId = 'dl_qingli'
    const resources = useResourcesStore()
    resources.addSmall('ore', 10)

    // 1. Đàm đạo đủ 3 lần
    expect(talkWithDaolu().success).toBe(true)
    expect(talkWithDaolu().success).toBe(true)
    expect(talkWithDaolu().success).toBe(true)
    expect(talkWithDaolu().success).toBe(false) // Hết lượt

    // 2. Tặng quà đủ 3 lần
    expect(giftToDaolu('ore').success).toBe(true)
    expect(giftToDaolu('ore').success).toBe(true)
    expect(giftToDaolu('ore').success).toBe(true)
    expect(giftToDaolu('ore').success).toBe(false) // Hết lượt

    // 3. Tỉ thí
    expect(sparWithDaolu().success).toBe(true)
    expect(sparWithDaolu().success).toBe(false)

    // Trôi qua 1 tháng (1800s)
    npcStore.advanceMonthTime(1800)

    // Sau khi sang tháng mới, các lượt tương tác của Đạo lữ được làm mới
    expect(npcStore.getInteractionCount(daoluId, 'chat')).toBe(0)
    expect(npcStore.getInteractionCount(daoluId, 'gift')).toBe(0)
    expect(npcStore.getInteractionCount(daoluId, 'spar')).toBe(0)

    // Sau khi sang tháng mới, có thể tiếp tục thực hiện tương tác Đạo lữ
    expect(talkWithDaolu().success).toBe(true)
    expect(giftToDaolu('ore').success).toBe(true)
    expect(sparWithDaolu().success).toBe(true)

    // Quan hệ Đạo lữ, duyên phận vẫn giữ nguyên vẹn
    expect(player.bond).toBeDefined()
    expect(player.bond?.daoluId).toBe('dl_qingli')
  })

  it('Đánh giá ngộ tính NPC: Điểm >= 95 đổi từ Tiệt thế sang Tuyệt thế', () => {
    expect(comprehensionRankText(95).label).toBe('Tuyệt thế')
    expect(comprehensionRankText(100).label).toBe('Tuyệt thế')
    expect(comprehensionRankText(90).label).toBe('Kinh diễm')
    expect(comprehensionRankText(80).label).toBe('Trác việt')
  })

  it('Các tương tác mời quan hệ: Đạo Lữ, Sư Phụ, Đồ Đệ, Huynh Đệ', () => {
    const player = usePlayerStore()
    const npcStore = useNpcStore()
    player.initCharacter('Hàn Lập', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'male')
    player.major = 2 // Trúc Cơ

    // 1. Mời Sư Phụ: Cần NPC major >= player major và hảo cảm >= 40
    const mentorCandidate = 'npc_tu_tinh_ha' // NPC Nguyên Anh (major = 3 >= 2)
    npcStore.addFavor(mentorCandidate, 50)
    const mentorRes = inviteNpcToMentor(mentorCandidate)
    expect(mentorRes.success).toBe(true)
    expect(npcStore.getNpcRelation(mentorCandidate)).toBe('mentor')
    expect(npcStore.getNpcRole(mentorCandidate)).toBe('mentor')

    // 2. Thu Đồ Đệ: Cần player major > NPC major và hảo cảm >= 30
    const apprenticeCandidate = 'npc_tieu_vu' // NPC Luyện Khí (major = 0 < 2)
    npcStore.addFavor(apprenticeCandidate, 40)
    const apprenticeRes = inviteNpcToApprentice(apprenticeCandidate)
    expect(apprenticeRes.success).toBe(true)
    expect(npcStore.getNpcRelation(apprenticeCandidate)).toBe('apprentice')
    expect(npcStore.getNpcRole(apprenticeCandidate)).toBe('apprentice')

    // 3. Kết Huynh Đệ: Cần hảo cảm >= 40
    const siblingCandidate = 'npc_lam_phong'
    npcStore.addFavor(siblingCandidate, 45)
    const siblingRes = inviteNpcToSibling(siblingCandidate)
    expect(siblingRes.success).toBe(true)
    expect(npcStore.getNpcRelation(siblingCandidate)).toBe('sibling')
    expect(npcStore.getNpcRole(siblingCandidate)).toBe('sibling')

    // 4. Mời Đạo Lữ: Cần đối phương là ứng viên, khác giới và hảo cảm >= 60
    const daoluCandidate = 'npc_truc_linh' // Nữ, isDaoluCandidate = true
    npcStore.addFavor(daoluCandidate, 70)
    const daoluRes = inviteNpcToDaolu(daoluCandidate)
    expect(daoluRes.success).toBe(true)
    expect(npcStore.getNpcRelation(daoluCandidate)).toBe('daolu')
    expect(player.bond?.daoluId).toBe(daoluCandidate)
  })

  it('NPC ở các vùng đất tự động đổi vị trí theo mỗi tháng', () => {
    const npcStore = useNpcStore()
    npcStore.syncStage(1)

    // Khởi tạo vị trí ban đầu
    const npc = npcStore.allActiveNpcs[0]!
    const initRegion = npcStore.getNpcRegion(npc.id)
    expect(initRegion).toBeDefined()

    // Trôi qua 1 tháng (1800s) -> Kích hoạt shuffleNpcMonthlyLocations
    npcStore.advanceMonthTime(1800)
    const newRegion = npcStore.getNpcRegion(npc.id)
    expect(newRegion).toBeDefined()
  })

  it('Khôi phục an toàn chống hỏng dữ liệu (sanitize) và Luân hồi chuyển thế (resetForRebirth)', () => {
    const npcStore = useNpcStore()
    npcStore.recordInteraction('npc_truc_linh', 'greet')

    // Sanitize
    npcStore.sanitize()
    expect(npcStore.gameMonth).toBeGreaterThanOrEqual(1)
    expect(npcStore.getInteractionCount('npc_truc_linh', 'greet')).toBe(1)

    // Reset khi luân hồi chuyển thế
    npcStore.resetForRebirth()
    expect(npcStore.gameMonth).toBe(1)
    expect(npcStore.monthElapsedSec).toBe(0)
    expect(npcStore.getInteractionCount('npc_truc_linh', 'greet')).toBe(0)
    expect(Object.keys(npcStore.npcMonthlyRecords).length).toBe(0)
  })
})
