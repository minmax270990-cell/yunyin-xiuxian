import { describe, expect, it, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { SECTS, npcsBySect, worldNpcDef } from '@/data/npc'
import {
  getAllWorldNpcs,
  getAvailableDaoluCandidates,
  getNpc,
  getNpcsOfSect,
  interactWithWorldNpc
} from './npcService'
import { usePlayerStore } from '@/stores/player'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('Hệ thống Quần thể NPC Thế Giới (World NPCs)', () => {
  it('Quần thể NPC có số lượng phong phú và cân bằng giới tính', () => {
    const npcs = getAllWorldNpcs()
    expect(npcs.length).toBeGreaterThanOrEqual(30)

    const males = npcs.filter(n => n.gender === 'male')
    const females = npcs.filter(n => n.gender === 'female')

    // Tỷ lệ giới tính nam/nữ cân bằng (khoảng 50/50)
    expect(males.length).toBeGreaterThanOrEqual(15)
    expect(females.length).toBeGreaterThanOrEqual(15)
    expect(Math.abs(males.length - females.length)).toBeLessThanOrEqual(4)
  })

  it('NPC phân bổ đầy đủ trên các cảnh giới từ Luyện Khí (0) đến Chân Tiên (9)', () => {
    const npcs = getAllWorldNpcs()
    for (let major = 0; major <= 9; major++) {
      const atMajor = npcs.filter(n => n.major === major)
      expect(atMajor.length).toBeGreaterThan(0)
    }
  })

  it('Các môn phái có tôn chỉ rõ ràng và chứa các đệ tử, trưởng lão', () => {
    expect(SECTS.length).toBeGreaterThanOrEqual(6)
    for (const sect of SECTS) {
      const members = npcsBySect(sect.id)
      expect(members.length).toBeGreaterThan(0)
      expect(getNpcsOfSect(sect.id).length).toBe(members.length)
    }
  })

  it('Tra cứu NPC theo ID trả về thông tin đầy đủ, danh tính ổn định', () => {
    const npc = getNpc('npc_truc_linh')
    expect(npc).toBeDefined()
    expect(npc?.name).toBe('Trúc Linh Nhi')
    expect(npc?.gender).toBe('female')
    expect(npc?.sectId).toBe('danxia')
    expect(worldNpcDef('npc_truc_linh')).toBe(npc)
  })

  it('Đề xuất ứng viên Đạo Lữ theo đúng quy tắc giới tính khác giới', () => {
    const player = usePlayerStore()

    // Người chơi là Nam: Chỉ đề xuất NPC Nữ
    player.initCharacter('Hàn Lập', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'male')
    const femaleCandidates = getAvailableDaoluCandidates()
    expect(femaleCandidates.length).toBeGreaterThan(0)
    expect(femaleCandidates.every(n => n.gender === 'female')).toBe(true)

    // Người chơi là Nữ: Chỉ đề xuất NPC Nam
    player.initCharacter('Nam Cung Uyển', { roots: [], gradeName: 'Phàm', growthMult: 1 }, 'female')
    const maleCandidates = getAvailableDaoluCandidates()
    expect(maleCandidates.length).toBeGreaterThan(0)
    expect(maleCandidates.every(n => n.gender === 'male')).toBe(true)
  })

  it('Tương tác với NPC (Chào hỏi, Đàm đạo, Luận đạo) hoạt động chính xác', () => {
    const greetRes = interactWithWorldNpc('npc_truc_linh', 'greet')
    expect(greetRes.success).toBe(true)
    expect(greetRes.favorDelta).toBe(1)

    const chatRes = interactWithWorldNpc('npc_truc_linh', 'chat')
    expect(chatRes.success).toBe(true)
    expect(chatRes.favorDelta).toBe(2)

    const discussRes = interactWithWorldNpc('npc_truc_linh', 'discuss')
    expect(discussRes.success).toBe(true)
    expect(discussRes.favorDelta).toBe(3)
  })
})
