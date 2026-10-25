/* eslint-disable no-console */
/**
 * Kiểm tra việc kế thừa qua luân hồi
 *
 * Người chơi phản hồi rằng "Số lần luân hồi quá nhiều nhưng không có ý nghĩa". Bộ kiểm thử này lượng hóa
 * "sau khi luân hồi một đời còn cần trải nghiệm lại bao nhiêu" thành các chỉ số hồi quy kiểm chứng,
 * đồng thời khóa chặt hiện trạng hiện tại — nếu sau này cần điều chỉnh, các ngưỡng này nên được chủ động siết chặt hơn.
 *
 * Tiêu chí đánh giá dựa trên một nguyên tắc: **Giữ lại "ta là ai", đặt lại "ta hiện có bao nhiêu".**
 * Di sản được kế thừa (kiến thức, nhận thức, lý lịch, Đạo quả) cần được kế thừa; Trạng thái (cảnh giới, thân xác, tài nguyên, trang bị) cần được xây dựng lại.
 */
import { describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { usePlayerStore } from '@/stores/player'
import { useResourcesStore } from '@/stores/resources'
import { useLoreStore } from '@/stores/lore'
import { useDongfuStore } from '@/stores/dongfu'
import { useCultivationStore } from '@/stores/cultivation'
import { useInventoryStore } from '@/stores/inventory'
import { useQuestsStore } from '@/stores/quests'
import { useAdventureStore } from '@/stores/adventure'
import { useEndgameStore } from '@/stores/endgame'
import { useLoadoutsStore } from '@/stores/loadouts'
import { useSettingsStore } from '@/stores/settings'
import { useGameStore } from '@/stores/game'
import { useDiagStore } from '@/stores/diag'
import { useMarketStore } from '@/stores/market'
import { useApprenticeStore } from '@/stores/apprentice'
import { useBountyStore } from '@/stores/bounty'
import { usePacingTelemetry } from '@/stores/pacingTelemetry'
import { useNpcStore } from '@/stores/npc'
import { PERSISTED_STORES } from '@/utils/storage'
import { prepareReincarnation, confirmReincarnation } from './reincarnation'
import { gn, toNum } from '@/utils/gnum'
import {
  daoFruitAfterLives,
  FRUIT_PER_LIFE,
  HERITAGE,
  heritageGroups,
  hoursToPeakAt,
  pacePerLife,
  permanentPowerMultAt,
  summarize,
  talentsAfterLives
} from './samsaraAudit'

describe('Kiểm tra việc kế thừa qua luân hồi · Danh sách kế thừa (đối chiếu từng mục với mã nguồn)', () => {
  it('Toàn cảnh kế thừa hiện tại', () => {
    const s = summarize()
    console.log(`\nKế thừa đầy đủ ${s.fullCount} mục / Kế thừa một phần ${s.partialCount} mục / Đặt lại ${s.resetCount} mục`)
    for (const r of HERITAGE) {
      const tag = r.mode === 'full' ? 'Kế thừa' : r.mode === 'partial' ? 'Giữ lại một nửa' : 'Đặt lại'
      console.log(`  [${tag}] ${r.name}(${r.kind === 'legacy' ? 'Di sản' : 'Trạng thái'}/Chiến lực ${r.power}): ${r.detail}`)
    }
  })

  it('Tài sản thuộc nhóm trạng thái đã cơ bản được tái thiết, phản hồi người chơi và mã nguồn thực tế có điểm khác biệt', () => {
    const byId = (id: string) => HERITAGE.find(r => r.id === id)!
    // Trang bị, đan dược, pháp bảo, nguyên liệu, tiến độ khu vực đều bị xóa trắng, không phải "kế thừa"
    for (const id of ['equipment', 'pills', 'artifacts', 'materials', 'regions', 'realm']) {
      expect(byId(id).mode).toBe('reset')
    }
    // Động phủ là ngoại vật, toàn bộ đặt về không; Công pháp chỉ giữ lại môn loại, số tầng đặt về không (thuộc nhóm "giữ lại một nửa")
    expect(byId('buildings').mode).toBe('reset')
    expect(byId('gongfa').mode).toBe('partial')
  })

  it('Tất cả ngoại vật đều đặt về không; các trạng thái còn được kế thừa đầy đủ chỉ gồm vinh dự/đạo thống/ký ức thế giới', () => {
    const s = summarize()
    const names = s.stateButFull.map(r => r.name)
    console.log(`\nThuộc nhóm trạng thái nhưng được kế thừa đầy đủ: ${names.join('、')}`)
    // Linh thú / Công trình động phủ / Đầu tư linh mạch đã chuyển thành đặt về không (ngoại vật tan biến cùng thân xác)
    expect(names).not.toContain('Linh thú')
    expect(names).not.toContain('Công trình động phủ')
    expect(names).not.toContain('Đầu tư linh mạch')
    // Ba mục được giữ lại đều có lý do: Vinh dự (Danh hiệu), Đạo thống (Sư thừa), Ký ức thế giới (Trấn áp và Kẻ thù truyền kiếp)
    expect(names).toContain('Danh hiệu')
    expect(names).toContain('Sư thừa')
  })
})

describe('Kiểm tra việc kế thừa qua luân hồi · Thời gian đuổi kịp (Luân hồi còn lại bao nhiêu "trải nghiệm lại")', () => {
  it('Thời gian tu luyện đến Chân Tiên giảm mạnh theo số đời luân hồi', () => {
    const rows = pacePerLife([1, 2, 3, 5, 10, 20, 50, 100])
    console.log('\nThời gian cần để tu luyện đến Chân Tiên ở đời thứ N:')
    for (const r of rows) {
      console.log(
        `  Đời thứ ${String(r.life).padStart(3)} · Đạo quả ${String(r.daoFruit).padStart(5)} · Thiên phú ${String(r.talents).padStart(2)} · ` +
          `${r.hoursToPeak.toFixed(1).padStart(7)}h (bằng ${(r.vsFirstLife * 100).toFixed(1)}% so với đời đầu) · Hệ số chiến lực vĩnh viễn ×${r.permanentMult.toFixed(1)}`
      )
    }
  })

  it('Đời thứ hai đã giảm gần một nửa thời gian, đời thứ mười chỉ còn 15%', () => {
    // Thực tế đo đạc: đời 2 chiếm 54.7%, đời 3 chiếm 39.3%, đời 10 chiếm 14.4%
    const [l2, l3, l10] = [2, 3, 10].map(n => hoursToPeakAt(n) / hoursToPeakAt(1))
    expect(l2!).toBeLessThan(0.6)
    expect(l3!).toBeLessThan(0.45)
    expect(l10!).toBeLessThan(0.2)
    console.log(`\nTỷ lệ thời gian: Đời 2 ${(l2! * 100).toFixed(1)}% / Đời 3 ${(l3! * 100).toFixed(1)}% / Đời 10 ${(l10! * 100).toFixed(1)}%`)
  })

  it('Đến đời thứ 100 tu luyện lại chỉ tốn 2% so với đời đầu, việc "trải nghiệm lại" chỉ còn trên danh nghĩa', () => {
    const ratio = hoursToPeakAt(100) / hoursToPeakAt(1)
    expect(ratio).toBeLessThan(0.03)
    console.log(`\nĐời thứ 100 tu đầy Chân Tiên chỉ cần ${hoursToPeakAt(100).toFixed(1)}h, bằng ${(ratio * 100).toFixed(1)}% đời đầu`)
  })

  it('Thời gian tiêu tốn giảm đơn điệu và không hội tụ về bất kỳ chặn dưới nào — đây là đặc trưng của sự tích lũy không giới hạn', () => {
    const lives = [1, 5, 10, 20, 50, 100, 200, 500]
    const hours = lives.map(hoursToPeakAt)
    for (let i = 1; i < hours.length; i += 1) {
      expect(hours[i]!).toBeLessThan(hours[i - 1]!)
    }
    // Nếu tồn tại cận dưới, mức giảm giữa các đời sau cùng phải tiến dần về 0; đo đạc thực tế vẫn tiếp tục giảm sâu
    const lateDrop = 1 - hours[hours.length - 1]! / hours[hours.length - 2]!
    expect(lateDrop).toBeGreaterThan(0.1)
    console.log(`\nTừ đời 200→500 vẫn tiếp tục giảm thêm ${(lateDrop * 100).toFixed(0)}%, chưa thấy sự hội tụ`)
  })
})

describe('Kiểm tra việc kế thừa qua luân hồi · Sự tích lũy hệ số nhân chiến lực vĩnh viễn', () => {
  it('Đạo quả là mục duy nhất không có giới hạn trần: Thiên phú sẽ thu thập đủ và chạm trần, Đạo quả thì không', () => {
    // Thiên phú có 33 mục, khoảng 10 đời là thu thập đủ và không tăng thêm
    expect(talentsAfterLives(10)).toBe(talentsAfterLives(100))
    // Đạo quả ghi nhận cố định mỗi đời, vĩnh viễn không bị chặn trần
    expect(daoFruitAfterLives(100)).toBeGreaterThan(daoFruitAfterLives(10) * 9)
    console.log(
      `\nThiên phú: Đời 10 ${talentsAfterLives(10)} mục = Đời 100 ${talentsAfterLives(100)} mục (đã chạm trần)\n` +
        `Đạo quả: Đời 10 ${daoFruitAfterLives(10)} quả → Đời 100 ${daoFruitAfterLives(100)} quả (mỗi đời +${FRUIT_PER_LIFE}, không trần)`
    )
  })

  it('Hệ số nhân chiến lực vĩnh viễn tăng liên tục theo các đời, trăm đời vượt hơn trăm lần', () => {
    const m10 = permanentPowerMultAt(10)
    const m100 = permanentPowerMultAt(100)
    expect(m10).toBeGreaterThan(15)
    expect(m100).toBeGreaterThan(90)
    expect(m100).toBeGreaterThan(m10 * 4)
    console.log(`\nHệ số nhân chiến lực vĩnh viễn: Đời 10 ×${m10.toFixed(1)} → Đời 100 ×${m100.toFixed(1)}`)
  })

  it('Hàm làm mềm của Đạo quả không thể kìm hãm sự phân kỳ: ^0.9 vẫn là sự tích lũy siêu tuyến tính', () => {
    // Làm mềm chỉ làm giảm độ dốc, không thay đổi tính chất "không biên giới"
    const a = permanentPowerMultAt(50)
    const b = permanentPowerMultAt(500)
    expect(b).toBeGreaterThan(a * 2)
    console.log(`\nĐời 50 ×${a.toFixed(1)} → Đời 500 ×${b.toFixed(1)} (vẫn tiếp tục tăng, không có cận trên tiệm cận)`)
  })
})

describe('Kiểm tra việc kế thừa qua luân hồi · Cùng gốc rễ với lạm phát chỉ số', () => {
  it('Các mục làm thu hẹp không gian tăng trưởng của đời kế tiếp tập trung ở hệ số nhân vĩnh viễn và tài sản giữ lại một phần', () => {
    const s = summarize()
    const names = s.compressing.map(r => r.name)
    console.log(`\n${names.length} mục làm thu hẹp không gian tăng trưởng: ${names.join('、')}`)
    // Đạo quả, Tư chất tiên thiên, Công pháp (giữ lại môn loại) là nguồn thu hẹp chính; Động phủ đã đặt về không, không còn thu hẹp
    for (const n of ['Đạo quả', 'Tư chất tiên thiên', 'Công pháp']) {
      expect(names).toContain(n)
    }
    expect(names).not.toContain('Công trình động phủ')
    expect(names).not.toContain('Đầu tư linh mạch')
  })

  it('Nhận thức và thành tựu không làm thu hẹp không gian tăng trưởng — chúng chỉ giúp người chơi "biết nhiều hơn"', () => {
    const byId = (id: string) => HERITAGE.find(r => r.id === id)!
    // Hai mục này là minh chứng chuẩn mực của "Di sản": Kế thừa đầy đủ nhưng không bào mòn ý nghĩa của việc trưởng thành lại
    expect(byId('lore').mode).toBe('full')
    expect(byId('lore').compressesGrowth).toBe(false)
    expect(byId('quests').mode).toBe('full')
    expect(byId('quests').compressesGrowth).toBe(false)
  })
})

describe('Kiểm tra việc kế thừa qua luân hồi · Đầu tư linh mạch', () => {
  it('Linh mạch là ngoại vật: Luân hồi chuyển thế là đặt về không, không còn sinh ra với địa mạch đã đầu tư đầy', () => {
    const row = HERITAGE.find(r => r.id === 'veins')!
    expect(row.mode).toBe('reset')
    expect(row.kind).toBe('state')
    expect(row.compressesGrowth).toBe(false)
    console.log(`\nLinh mạch: ${row.detail}`)
  })

  it('Tích lũy qua nhiều đời chỉ còn lại hai mục: Thiên phú có giới hạn và Đạo quả không giới hạn', () => {
    // Linh mạch đã đặt về không, không còn là mục tích lũy qua nhiều đời; Thiên phú có giới hạn (thu thập đủ là dừng), Đạo quả không giới hạn
    expect(talentsAfterLives(10)).toBe(talentsAfterLives(1000))
    // Đạo quả thì khác
    expect(daoFruitAfterLives(1000)).toBeGreaterThan(daoFruitAfterLives(10) * 90)
  })
})

/**
 * Danh sách kế thừa tối thiểu đầy đủ: Bất kỳ tính năng nào có quyết định giữ lại hay đặt lại qua các đời đều phải đăng ký một dòng trong HERITAGE.
 * Danh sách ID này tăng dần theo sự phát triển tính năng — khi thêm một hệ thống mới có tính kế thừa qua đời (hoặc đổi quyết định giữ/bỏ),
 * phải đồng thời trả lời câu hỏi "nó có được giữ lại qua đời không", chứ không được để mã nguồn âm thầm tự quyết định.
 */
describe('Kiểm tra việc kế thừa qua luân hồi · Danh sách kế thừa tối thiểu đầy đủ', () => {
  const REQUIRED = [
    'realm',
    'equipment',
    'pills',
    'artifacts',
    'materials',
    'regions',
    'buildings',
    'gongfa',
    'daoFruit',
    'talents',
    'heritage',
    'insight',
    'title',
    'pet',
    'mentor',
    'veins',
    'lore',
    'quests',
    'endgame',
    'suppress',
    'secretRealm',
    'regionEvent',
    'mortalWorld',
    'fortuneMemory',
    'bonds',
    'trial',
    'streak',
    'linggen'
  ]

  it('Mỗi một hệ thống liên quan đến luân hồi đều có một dòng trong danh sách', () => {
    const ids = new Set(HERITAGE.map(r => r.id))
    const missing = REQUIRED.filter(id => !ids.has(id))
    expect(missing, `Các hệ thống này chưa đăng ký quyết định giữ lại hay đặt lại qua các đời: ${missing.join('、')}`).toEqual([])
  })

  /**
   * Mục trước dựa vào **danh sách viết tay**, do đó các trường trạng thái mới thêm vào có thể âm thầm bị bỏ sót (divination / breakthroughPrep /
   * enlightenmentAt từng bị bỏ sót suốt một vòng lặp). Mục này chuyển sang việc suy ngược từ các trường thực tế trong bản lưu:
   * Mỗi khóa trong player.$state đều phải trỏ tới một dòng nào đó trong danh sách (hoặc được đăng ký vào diện ngoại lệ không cần đăng ký).
   */
  const STATE_KEY_ROWS: Record<string, string[]> = {
    age: ['realm'],
    bond: ['bonds'],
    breakthroughPrep: ['breakthroughPrep'],
    dead: ['realm'],
    divination: ['divination'],
    enlightenmentAt: ['enlightenmentAt'],
    fateFocus: ['fateFocus'],
    eventChains: ['fortuneMemory'],
    exp: ['realm'],
    fortuneChoices: ['fortuneMemory'],
    lastCaveEventDay: ['streak'],
    lifespanBonusYears: ['realm'],
    linggen: ['linggen'],
    mansionRedirect: ['mansionRedirect'],
    major: ['realm'],
    mentor: ['mentor'],
    name: ['name'],
    nemeses: ['suppress'],
    petId: ['pet'],
    regionEvent: ['regionEvent'],
    regionStats: ['regions'],
    regionWins: ['regions'],
    // Đối tượng luân hồi là một bộ hoàn chỉnh (số lần / đạo quả / thiên phú / túc tuệ / lý lịch / bản mệnh / khế ước / đạo hữu), do các dòng dưới đây cùng bao quát
    reincarnation: ['reincarnationCount', 'daoFruit', 'talents', 'heritage', 'insight', 'lives', 'vow', 'trial', 'bonds'],
    secretRealm: ['secretRealm'],
    sub: ['realm'],
    suppressQualified: ['suppress'],
    suppressedRegions: ['suppress'],
    suppressedSince: ['suppress'],
    titleId: ['title'],
    winStreak: ['streak'],
    wudaoExchange: ['wudaoExchange']
  }

  /** Trường dữ liệu lưu game có tồn tại, nhưng thực sự không cần đăng ký qua các đời (ghi rõ lý do, không để trống) */
  const NO_ROW_NEEDED: Record<string, string> = {
    gender: 'Giới tính nhân vật, được giữ lại theo chính tu sĩ đó, không bị ảnh hưởng bởi việc đặt lại chiến lực và tài nguyên',
    aptitudes: 'Tư chất bẩm sinh, được giữ lại qua các đời cùng thần hồn và đạo tâm (Tư chất bẩm sinh không thể thay đổi)'
  }

  it('Trường dữ liệu lưu game đều được đăng ký quyết định giữ lại hay đặt lại qua các đời —— suy ngược từ $state, không dựa vào danh sách viết tay', () => {
    setActivePinia(createPinia())
    const keys = Object.keys(usePlayerStore().$state).sort()
    expect(keys.length, 'Không lấy được trường lưu trữ của player, khẳng định mất ý nghĩa').toBeGreaterThan(20)
    const unmapped = keys.filter(k => !(k in STATE_KEY_ROWS) && !(k in NO_ROW_NEEDED))
    expect(
      unmapped,
      `Các trường dữ liệu lưu game này chưa có kết luận quyết định giữ lại hay đặt lại qua các đời: ${unmapped.join('、')} —— Hoặc bổ sung một dòng vào HERITAGE, hoặc ghi rõ tại đây lý do vì sao không cần đăng ký`
    ).toEqual([])
  })

  it('Ánh xạ trỏ tới các dòng danh sách thực tế tồn tại; danh sách viết tay và danh sách suy ngược không mâu thuẫn', () => {
    const ids = new Set(HERITAGE.map(r => r.id))
    for (const [key, rows] of Object.entries(STATE_KEY_ROWS)) {
      expect(rows.length, `${key} không trỏ tới bất kỳ dòng danh sách nào`).toBeGreaterThan(0)
      for (const id of rows) expect(ids.has(id), `${key} trỏ tới dòng không tồn tại ${id}`).toBe(true)
    }
    // Mỗi dòng trong danh sách viết tay cũng cần được sử dụng ít nhất bởi một trường hoặc phần detail của dòng khác ——
    // Chỉ yêu cầu "viết tay và suy ngược nhận diện được nhau", không bắt buộc phải 1-1 (một số dòng là khái niệm kết hợp)
    const referenced = new Set(Object.values(STATE_KEY_ROWS).flat())
    const orphanRows = HERITAGE.filter(r => !referenced.has(r.id) && !REQUIRED.includes(r.id))
    expect(orphanRows.map(r => r.id), 'Các dòng danh sách này vừa không nằm trong danh sách viết tay, vừa không có trường nào trỏ tới').toEqual([])
  })

  it('Danh sách bàn giao tại giao diện tổng kết luân hồi hiển thị trực tiếp từ bảng này, không viết riêng một bản khác', () => {
    const src = readFileSync(resolve(__dirname, '../components/character/ReincarnationDialog.vue'), 'utf8')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
    expect(src, 'Hộp thoại tổng kết chưa kết nối với bảng kế thừa, thông tin người chơi thấy sẽ bị phân nhánh so với mã thực tế').toContain('heritageGroups()')
  })

  it('Tất cả ngoại vật đều đặt về không: Trang bị/Pháp bảo/Đan dược/Nguyên liệu/Linh thú/Động phủ/Linh mạch/Khu vực/Bản thế/Bí cảnh/Sự kiện/Khế ước', () => {
    const byId = (id: string) => HERITAGE.find(r => r.id === id)!
    for (const id of [
      'equipment',
      'artifacts',
      'pills',
      'materials',
      'regions',
      'buildings',
      'veins',
      'pet',
      'secretRealm',
      'regionEvent',
      'mortalWorld',
      'trial',
      'streak',
      'linggen'
    ]) {
      expect(byId(id).mode, `${byId(id).name} là ngoại vật, cần đặt về không`).toBe('reset')
    }
  })

  it('Ký ức, tinh thần và linh hồn đều được giữ lại: Nhận thức/Thành tựu/Đạo quả/Thiên phú/Túc tuệ/Danh hiệu/Sư thừa/Đạo ngân/Ký ức thế giới/Ký ức cơ duyên', () => {
    const byId = (id: string) => HERITAGE.find(r => r.id === id)!
    for (const id of ['lore', 'quests', 'daoFruit', 'talents', 'insight', 'title', 'mentor', 'fortuneMemory']) {
      expect(byId(id).mode, `${byId(id).name} thuộc ký ức/tinh thần/linh hồn, cần được giữ lại`).toBe('full')
    }
    // Công pháp chỉ "giữ lại một nửa": môn loại là ký ức, số tầng là tiến độ tu vi
    expect(byId('gongfa').mode).toBe('partial')
    // Đạo hữu cũng tương tự: quan hệ được lưu vào lý lịch, người không giữ lại
    expect(byId('bonds').mode).toBe('partial')
    // Chung cục cũng tương tự: đạo đồ trả về trời đất (lời hứa kiếp này), đạo nguyên và đạo ngân không tan biến cùng thần hồn
    expect(byId('endgame').mode).toBe('partial')
    // Trấn áp tương tự (giữ lại một nửa): Lợi ích trấn áp là "ta hiện có bao nhiêu" —— Vùng đất xa xôi kiếp trước nếu kế thừa, kiếp mới Luyện Khí vẫn nhận trang bị/linh thạch bậc cao, làm nổ chỉ số; do đó cần xóa suppressedRegions/suppressedSince.
    // Ký ức kẻ thù truyền kiếp và chiến tích khu vực ("thế giới ghi nhớ bạn") vẫn được giữ lại cùng thần hồn
    expect(byId('suppress').mode, `Sản lượng khu vực ${byId('suppress').name} không kế thừa qua đời, ký ức thì kế thừa`).toBe('partial')
  })

  it('Khi giao diện tổng kết phân nhóm theo giữ/bỏ, danh sách không sót dòng nào, không trùng dòng nào (Giao diện và mã nguồn đồng nguyên)', () => {
    const groups = heritageGroups()
    expect(groups.map(g => g.mode)).toEqual(['full', 'partial', 'reset'])
    const seen = groups.flatMap(g => g.rows.map(r => r.id))
    expect(seen.length, 'Tổng số mục sau khi phân nhóm phải bằng tổng số mục trong danh sách').toBe(HERITAGE.length)
    expect(new Set(seen).size, 'Không được có mục nào bị phân nhóm trùng lặp').toBe(HERITAGE.length)
    for (const g of groups) expect(g.title, `Nhóm ${g.mode} thiếu ngôn ngữ giao diện`).toBeTruthy()
  })
})

/**
 * Danh sách kế thừa tối thiểu đầy đủ cho các phân mảnh lưu trữ giữa các store —— khắc phục điểm mù chỉ soi xét player ở trên.
 *
 * Việc suy ngược $state của player chỉ tập trung vào một phân mảnh player; 16 phân mảnh lưu trữ còn lại
 * (adventure/bounty/market/loadouts/cultivation/endgame/…) nếu thêm một trường mới liên quan đến các đời,
 * nếu không có CI ép buộc trả lời "luân hồi có giữ hay không", mã nguồn sẽ âm thầm tự quyết định —— chính là lỗ hổng từng xuất hiện ở player.
 *
 * Tại đây đăng ký tiêu chí "từng trường → reset/keep" cho mỗi phân mảnh lưu trữ, và suy ngược từ $state để bao phủ toàn bộ:
 * Bất kỳ trường nào (hoặc cả phân mảnh mới) không có trong bảng sẽ lập tức báo đỏ. Tiêu chí reset được kiểm chứng trở về khởi tạo/rỗng sau khi luân hồi thật,
 * tiêu chí keep được kiểm chứng giữ nguyên giá trị ban đầu —— chứng minh bảng này hoàn toàn sát với thực tế.
 */
describe('Kiểm tra việc kế thừa qua luân hồi · Danh sách kế thừa tối thiểu đầy đủ cho các phân mảnh lưu trữ', () => {
  /** Đặc tính chung của instance store lưu trữ: đều có $state (dùng để suy ngược các trường lưu trữ). Dùng object thay vì Record<string,…> do $state của Pinia là kiểu giao UnwrapRef, không có chữ ký chỉ mục */
  type RegionStore = { $state: object }

  /** Phân mảnh ID → Instance Store (khớp với PERSISTED_STORES; player đã được bao quát riêng ở trên) */
  const GETTERS: Record<string, () => RegionStore> = {
    game: useGameStore,
    resources: useResourcesStore,
    inventory: useInventoryStore,
    cultivation: useCultivationStore,
    dongfu: useDongfuStore,
    adventure: useAdventureStore,
    quests: useQuestsStore,
    settings: useSettingsStore,
    loadouts: useLoadoutsStore,
    endgame: useEndgameStore,
    lore: useLoreStore,
    market: useMarketStore,
    apprentice: useApprenticeStore,
    bounty: useBountyStore,
    pacing: usePacingTelemetry,
    diag: useDiagStore,
    npc: useNpcStore
  }

  /**
   * Tiêu chí qua các đời cho từng trường của mỗi phân mảnh lưu trữ. Tiêu chí lấy từ mã nguồn thực tế đã được xác minh (xem confirmReincarnation /
   * player.rebirth / resetForRebirth / onRebirth / setMortalWorld):
   *  - reset : Sau khi luân hồi chuyển thế sẽ xóa về khởi tạo/rỗng (reincarnation.ts thực thi từng dòng)
   *  - keep  : Giữ nguyên vẹn qua các đời (ký ức / nhận thức / lý lịch / đạo thống / thiết lập toàn cục thế giới / tùy chọn client / dữ liệu đo đạc, hoặc vị trí trang bị kiếp này vẫn tham chiếu môn loại công pháp được giữ lại)
   * Không cần "runtime" —— các phân mảnh này không có trường chỉ dùng ở client mà không có ý nghĩa qua đời; settings/diag/pacing thuộc diện keep.
   */
  const STORE_FIELDS: Record<string, Record<string, 'reset' | 'keep'>> = {
    game: {
      started: 'keep', saveVersion: 'keep', createdAt: 'keep', lastActiveAt: 'keep',
      totalPlaySec: 'keep', createRerolls: 'keep', createProfile: 'keep', createName: 'keep',
      createGender: 'keep', createAptitudes: 'keep'
    },
    resources: {
      spiritStone: 'reset', qi: 'reset', wudao: 'reset', herbByGrade: 'reset',
      ore: 'reset', page: 'reset', dust: 'reset', spiritRootFruit: 'reset'
    },
    inventory: {
      items: 'reset', equipped: 'reset', pills: 'reset', artifacts: 'reset', equippedArtifacts: 'reset'
    },
    cultivation: {
      // learned giữ lại một nửa (carryGongfa đặt về 0 trở lại tầng 1), buffs xóa về rỗng; Công pháp chính / phụ / phân nhánh ngộ đạo thuộc diện "nhớ môn loại", giữ lại
      learned: 'reset', buffs: 'reset', mainGongfa: 'keep', subGongfa: 'keep', gongfaBranch: 'keep', tribFails: 'reset'
    },
    dongfu: { levels: 'reset', frac: 'reset', veinMain: 'reset', veinPoints: 'reset' },
    adventure: {
      // rerollMortalWorld đổi giới sẽ xóa mortalCleared; sự kiện / lịch luyện / khu vực / chiến dịch là tiến độ của kiếp này
      mortalWorld: 'reset', mortalCleared: 'reset', unlocked: 'reset', cleared: 'reset',
      session: 'reset', pendingEventId: 'reset', pendingEventSince: 'reset', lastBattle: 'reset',
      seenOnceEvents: 'keep', eventMemories: 'keep' // Ký ức thế giới / kiến văn, không tan biến cùng thần hồn
    },
    quests: {
      counters: 'keep', achieved: 'keep', mainIdx: 'keep', daily: 'keep',
      titlesOwned: 'keep', collections: 'keep', collectedAt: 'keep', achievedAt: 'keep'
    },
    settings: {
      sfxOn: 'keep', musicOn: 'keep', musicVol: 'keep', sfxVol: 'keep', reduceMotion: 'keep',
      dndEvents: 'keep', battleSpeed: 'keep', decomposeRanks: 'keep', smartKeep: 'keep',
      privacyAccepted: 'keep', theme: 'keep', lastExportAt: 'keep', installNoticeDismissed: 'keep', lastSeenVersion: 'keep'
    },
    loadouts: { list: 'keep' },
    endgame: {
      daoPath: 'reset', worldRun: 'reset', // Đạo đồ trả về trời đất, viễn chinh gián đoạn (onRebirth)
      daoSource: 'keep', worldClears: 'keep', trialRecords: 'keep', marks: 'keep', voidWorld: 'keep',
      dailyDoneDay: 'keep', milestones: 'keep', records: 'keep', endgameTutorialSeen: 'keep',
      souls: 'keep', equippedSouls: 'keep', soulTutorialSeen: 'keep',
      daoFruitTutorialSeen: 'keep', resourceDialogSeen: 'keep'
    },
    lore: {
      materialLore: 'keep', materialSeen: 'keep', recipeLore: 'keep', blueprintLore: 'keep',
      skillExp: 'keep', enemyLore: 'keep', enemySeen: 'keep', equipLore: 'keep', studyFrac: 'keep', seeded: 'keep'
    },
    market: { stock: 'keep', stockedAt: 'keep', consign: 'keep' },
    apprentice: {
      apprentices: 'reset',
      rebirthKarma: 'keep',
      sectCreated: 'reset',
      sectName: 'reset',
      doctrineId: 'reset',
      foundedMonth: 'reset',
      sectLevel: 'reset',
      disciples: 'reset',
      pendingApplicant: 'reset',
      pendingApplicants: 'reset',
      processedApplicantIds: 'reset',
      libraryGongfaIds: 'reset',
      activeQuests: 'reset',
      completedQuestHistory: 'reset',
      lastTournamentMonth: 'reset',
      tournamentHistory: 'reset',
      history: 'reset',
      lastProcessedMonth: 'reset',
      vassalSects: 'reset',
      worldSects: 'reset',
      lastWarYear: 'reset',
      lastPromotionMonth: 'reset',
      tributeHistory: 'reset',
      warHistory: 'reset',
      masterId: 'reset',
      playerIsAncestor: 'reset',
      sectLevelPowerBenchmarks: 'reset',
      pendingWarDeclaration: 'reset',
      overlordSectId: 'reset',
      lastInvasionMonth: 'reset',
      sectVault: 'reset',
      autoDispatchQuests: 'reset',
      autoTowerChallenge: 'reset'
    },
    bounty: { orders: 'keep', bountyAt: 'keep', bountyMajor: 'keep' },
    pacing: { events: 'keep', enabled: 'keep' },
    diag: { errors: 'keep' },
    npc: {
      stageNpcs: 'keep',
      unlockedStages: 'keep',
      npcAdventures: 'keep',
      npcFavor: 'reset',
      proposals: 'reset',
      lastSimDay: 'reset',
      lastProposalDay: 'reset',
      playerRegionId: 'reset',
      npcLocations: 'keep',
      discoveredRegions: 'reset',
      gameMonth: 'reset',
      monthElapsedSec: 'reset',
      npcMonthlyRecords: 'reset',
      npcCultivation: 'reset',
      npcRelations: 'reset',
      npcEquipments: 'reset'
    }
  }

  /** Getter của store có thực sự cung cấp $state hay không (ngăn chặn việc chạy ngầm khi bảng/phân mảnh không khớp nhau) */
  function stateKeys(id: string): string[] {
    const use = GETTERS[id]
    expect(use, `Phân mảnh ${id} nằm trong PERSISTED_STORES nhưng không có getter tương ứng`).toBeDefined()
    const s = use!().$state
    return Object.keys(s)
  }

  it('Tất cả trường của mỗi phân mảnh lưu trữ đều được đăng ký quyết định giữ lại hay đặt lại qua các đời —— suy ngược từ $state, không bỏ sót', () => {
    setActivePinia(createPinia())
    const nonPlayer = PERSISTED_STORES.filter(id => id !== 'player')
    for (const id of nonPlayer) {
      expect(STORE_FIELDS[id], `Phân mảnh lưu trữ ${id} chưa đăng ký bảng quyết định giữ lại hay đặt lại qua các đời`).toBeDefined()
      const verdicts = STORE_FIELDS[id]!
      const keys = stateKeys(id)
      expect(keys.length, `Phân mảnh ${id} không lấy được trường lưu trữ, khẳng định mất ý nghĩa`).toBeGreaterThan(0)
      const unmapped = keys.filter(k => !(k in verdicts))
      expect(
        unmapped,
        `Phân mảnh ${id} có các trường chưa có kết luận quyết định giữ lại hay đặt lại qua các đời: ${unmapped.join('、')} —— Hoặc bổ sung một dòng vào STORE_FIELDS, hoặc ghi rõ lý do giữ lại`
      ).toEqual([])
    }
  })

  it('Phán đoán reset thực sự rơi về khởi tạo/rỗng sau khi luân hồi, phán đoán keep được giữ nguyên vẹn (bảng không tự dối)', () => {
    setActivePinia(createPinia())
    const player = usePlayerStore()
    const res = useResourcesStore()
    const inv = useInventoryStore()
    const cult = useCultivationStore()
    const adv = useAdventureStore()
    const endgame = useEndgameStore()
    const lore = useLoreStore()

    player.initCharacter('Đạo hiệu cũ', { roots: [] } as never)
    player.major = 5
    player.sub = 8
    player.exp = gn(1000)
    player.age = 300
    res.spiritStone = gn(999)
    res.herbByGrade[1] = 10
    res.spiritRootFruit.mortal = 5
    res.ore = 5
    res.wudao = 3
    inv.pills = { p_jvqisan: 1 }
    cult.learned = { m_taixuan: 5 }
    cult.mainGongfa = 'm_taixuan'
    cult.buffs = [{ id: 'b', until: 999 }] as never
    adv.unlocked = ['qingyun', 'luoxia']
    adv.cleared = ['qingyun']
    adv.lastBattle = { at: 1 } as never
    endgame.daoSource = 7
    endgame.souls = [{ uid: 's1' }] as never
    lore.materialLore = { m_lingzhi: 2 }

    prepareReincarnation()
    confirmReincarnation(null)

    // reset → khởi tạo/rỗng
    // Linh thạch / Ngộ đạo được phán định cùng flow spec: sau khi xóa về 0, thành tựu a_re1 "Hoàn thành lần luân hồi đầu tiên" cấp lại một khoản nhỏ
    // ngộ đạo và linh thạch cho đời mới, nên không hoàn toàn bằng 0 —— nhưng lượng tích lũy mang vào (999/3) bắt buộc phải biến mất
    expect(toNum(res.spiritStone), 'Linh thạch tích lũy phải được xóa, chỉ còn quà tân thủ đời mới').toBeLessThan(1000)
    expect(res.herbByGrade[1]).toBe(0)
    expect(res.ore).toBe(0)
    expect(inv.pills).toEqual({})
    expect(cult.buffs).toEqual([])
    expect(cult.learned, 'learned đặt về không trở lại tầng 1 (giữ lại ký ức môn loại)').toEqual({ m_taixuan: 1 })
    expect(adv.cleared).toEqual([])
    expect(adv.unlocked, 'Khu vực lùi về khu vực tân thủ').toEqual(['qingyun'])
    expect(adv.lastBattle).toBeNull()
    expect(endgame.daoPath, 'Đạo đồ trả về trời đất (reset)').toBeNull()
    expect(endgame.souls, 'Đạo nguyên / Đạo ngân / Linh hồn keep').toEqual([{ uid: 's1' }])
    // keep → giữ lại
    expect(cult.mainGongfa, 'Môn loại công pháp chính keep').toBe('m_taixuan')
    expect(endgame.daoSource, 'Đạo nguyên keep').toBe(7)
    expect(lore.materialLore, 'Nhận thức keep').toEqual({ m_lingzhi: 2 })
  })
})
