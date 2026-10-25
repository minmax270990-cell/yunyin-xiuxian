/**
 * Dịch vụ Tu Luyện & Bồi Dưỡng Đạo Lữ (Daolu Cultivation & Nurturing Service)
 *
 * Quản lý:
 * - Tiến trình tự tu luyện theo tháng của Đạo Lữ (daoluMajor, daoluSub, daoluExpPct, daoluStatus)
 * - Định hướng tu hành (focus: 'speed' | 'breakthrough' | 'combat')
 * - Truyền tài nguyên: Linh thạch, đan dược, linh thảo (trừ tài nguyên thực tế)
 * - Hộ pháp đột phá & Khai thông bình cảnh
 * - Lựa chọn & Truyền thụ công pháp thích hợp từ GONGFA
 */
import { currentBond, currentDaolu, advanceBond } from './daoluService'
import { daoluDef } from '@/data/daolu'
import { GONGFA, gongfaDef } from '@/data/gongfa'
import type { GongfaDef } from '@/types'
import { usePlayerStore } from '@/stores/player'
import { useInventoryStore } from '@/stores/inventory'
import { useResourcesStore } from '@/stores/resources'
import { useUiStore } from '@/stores/ui'
import { REALMS } from '@/data/realms'
import { displayGongfaName, displayDaoluName, displayRealmName } from '@/ui/displayZhVi'
import { gn } from '@/utils/gnum'
import { rng } from '@/utils/random'
import { checkGongfaEligibility } from './gongfaEligibility'
import { GAME_MONTH_REAL_SECONDS } from '@/data/constants'

export interface DaoluCultivationInfo {
  hasBond: boolean
  partnerId?: string
  partnerName?: string
  element?: string
  major: number
  sub: number
  realmName: string
  expPct: number
  gongfaId?: string
  gongfa?: GongfaDef
  focus: 'speed' | 'breakthrough' | 'combat'
  status: 'cultivating' | 'bottleneck' | 'injured'
  statusLabel: string
  isAtPeak: boolean
  canBreakthrough: boolean
}

/**
 * Lấy thông tin tu luyện hiện tại của Đạo Lữ
 */
export function getDaoluCultivationInfo(): DaoluCultivationInfo {
  const bond = currentBond()
  const def = currentDaolu()

  if (!bond || !def || bond.fallen || bond.departed) {
    return {
      hasBond: false,
      major: 0,
      sub: 0,
      realmName: 'Chưa có',
      expPct: 0,
      focus: 'speed',
      status: 'cultivating',
      statusLabel: 'Chưa kết duyên',
      isAtPeak: false,
      canBreakthrough: false
    }
  }

  const major = bond.daoluMajor ?? def.startMajor
  const sub = bond.daoluSub ?? 0
  const expPct = bond.daoluExpPct ?? 0
  const focus = bond.daoluFocus ?? 'speed'
  const status = bond.daoluStatus ?? 'cultivating'
  const gongfaId = bond.daoluGongfaId
  const gongfa = gongfaId ? gongfaDef(gongfaId) : undefined

  const rawRealm = REALMS[major]?.name ?? 'Luyện Khí'
  const realmName = `${displayRealmName(rawRealm)} · Tầng ${sub + 1}`
  const isAtPeak = sub >= 8 || expPct >= 100
  const canBreakthrough = expPct >= 100 || status === 'bottleneck'

  let statusLabel = 'Tu Luyện Thuận Lợi'
  if (status === 'bottleneck') statusLabel = 'Gặp Phải Bình Cảnh'
  else if (status === 'injured') statusLabel = 'Khí Huyết Thụ Thương'

  return {
    hasBond: true,
    partnerId: def.id,
    partnerName: def.name,
    element: def.element,
    major,
    sub,
    realmName,
    expPct,
    gongfaId,
    gongfa,
    focus,
    status,
    statusLabel,
    isAtPeak,
    canBreakthrough
  }
}

/**
 * Thiết lập định hướng tu luyện cho Đạo Lữ
 */
export function setDaoluFocus(focus: 'speed' | 'breakthrough' | 'combat'): { success: boolean; message: string } {
  const bond = currentBond()
  const def = currentDaolu()
  const player = usePlayerStore()
  const ui = useUiStore()

  if (!bond || !def || bond.fallen || bond.departed) {
    return { success: false, message: 'Hiện chưa có đạo lữ đồng hành.' }
  }

  player.setBond({
    ...bond,
    daoluFocus: focus
  })

  const labelMap: Record<string, string> = {
    speed: 'Tốc độ tu vi (Tăng nhanh tiến cảnh hàng tháng)',
    breakthrough: 'Phá vỡ bình cảnh (Gia tăng tỷ lệ đột phá và tự giải phóng bình cảnh)',
    combat: 'Cường hóa hộ trì (Gia tăng thực lực khi cùng lịch luyện và giảm nguy cơ tử kiếp)'
  }

  ui.toast(`Đã định hướng tu hành cho ${def.name}: ${labelMap[focus]}`, 'info')
  return {
    success: true,
    message: `Đã trao đổi cùng ${def.name}, thống nhất định hướng tu hành: ${labelMap[focus]}.`
  }
}

/**
 * Lọc danh sách công pháp khả dụng mà Đạo Lữ có thể tu luyện
 */
export function getEligibleGongfaForDaolu(): GongfaDef[] {
  const bond = currentBond()
  const def = currentDaolu()
  if (!bond || !def || bond.fallen || bond.departed) return []

  const curMajor = bond.daoluMajor ?? def.startMajor
  const snap = {
    major: curMajor,
    element: def.element,
    comprehension: 50 + curMajor * 2
  }
  return GONGFA.filter(g => {
    if (g.type !== 'main') return false
    return checkGongfaEligibility(g, snap, 0).canLearn
  })
}

/**
 * Truyền dạy hoặc thay đổi công pháp tu luyện cho Đạo Lữ
 */
export function teachGongfaToDaolu(gongfaId: string): { success: boolean; message: string } {
  const bond = currentBond()
  const def = currentDaolu()
  const player = usePlayerStore()
  const ui = useUiStore()

  if (!bond || !def || bond.fallen || bond.departed) {
    return { success: false, message: 'Hiện chưa có đạo lữ đồng hành.' }
  }

  const g = gongfaDef(gongfaId)
  if (!g) {
    return { success: false, message: 'Công pháp này không tồn tại trong điển tịch.' }
  }

  const curMajor = bond.daoluMajor ?? def.startMajor
  const snap = {
    major: curMajor,
    element: def.element,
    comprehension: 50 + curMajor * 2
  }
  const elig = checkGongfaEligibility(g, snap, 0)
  if (!elig.canLearn) {
    return { success: false, message: elig.reason }
  }

  player.setBond({
    ...bond,
    daoluGongfaId: gongfaId
  })

  advanceBond({ trust: 8, accord: 6, fate: 3 })
  const gName = displayGongfaName(g.name)
  ui.toast(`Truyền thụ công pháp「${gName}」cho ${def.name}`, 'rare')

  return {
    success: true,
    message: `Ngươi dốc lòng truyền thụ áo nghĩa của「${gName}」cho ${def.name}. Đạo lữ tâm đắc ghi nhớ, đạo tâm càng thêm gắn kết.`
  }
}

/**
 * Ban tặng linh thạch giúp Đạo Lữ tích lũy tu vi
 */
export function provideStoneToDaolu(amount: number): { success: boolean; message: string; expGained?: number } {
  const bond = currentBond()
  const def = currentDaolu()
  const player = usePlayerStore()
  const resources = useResourcesStore()
  const ui = useUiStore()

  if (!bond || !def || bond.fallen || bond.departed) {
    return { success: false, message: 'Hiện chưa có đạo lữ đồng hành.' }
  }

  if (amount < 100) {
    return { success: false, message: 'Linh thạch chu cấp tối thiểu là 100 viên.' }
  }

  if (!resources.spendStone(gn(amount))) {
    return { success: false, message: 'Linh thạch trong túi không đủ.' }
  }

  // Tính lượng exp tăng thêm dựa trên lượng linh thạch chu cấp
  const expGain = Math.min(50, Math.max(5, Math.floor(Math.sqrt(amount) * 0.9)))
  const curExp = bond.daoluExpPct ?? 0

  const dName = displayDaoluName(def.name)
  if (bond.daoluStatus === 'bottleneck') {
    advanceBond({ trust: 5, accord: 2, fate: 2 })
    ui.toast(`Chu cấp ${amount} linh thạch cho ${dName}`, 'info')
    return {
      success: true,
      message: `${dName} đang vướng phải bình cảnh tu hành, linh thạch chu cấp được thu nạp vào khí hải để củng cố đạo cơ, chờ thời cơ khai thông!`,
      expGained: 0
    }
  }

  const newExp = Math.min(100, curExp + expGain)
  const isBottleneck = (bond.daoluSub ?? 0) >= 8 && newExp >= 100
  player.setBond({
    ...bond,
    daoluExpPct: newExp,
    daoluStatus: isBottleneck ? 'bottleneck' : (bond.daoluStatus ?? 'cultivating')
  })

  advanceBond({ trust: 5, accord: 3, fate: 2 })
  ui.toast(`Chu cấp ${amount} linh thạch cho ${dName} (+${expGain}% tu vi)`, 'rare')

  return {
    success: true,
    message: `Ngươi chu cấp ${amount} linh thạch giúp ${dName} bố trí tụ linh trận. Tu vi của ${dName} tăng thêm ${expGain}%!`,
    expGained: expGain
  }
}

/**
 * Ban tặng đan dược giúp Đạo Lữ tăng tu vi hoặc giải trừ dị trạng
 */
export function providePillToDaolu(pillId: string): { success: boolean; message: string } {
  const bond = currentBond()
  const def = currentDaolu()
  const player = usePlayerStore()
  const inventory = useInventoryStore()
  const ui = useUiStore()

  if (!bond || !def || bond.fallen || bond.departed) {
    return { success: false, message: 'Hiện chưa có đạo lữ đồng hành.' }
  }

  const count = inventory.pills[pillId] ?? 0
  if (count <= 0) {
    return { success: false, message: 'Trong hành trang không còn đan dược này.' }
  }

  if (!inventory.spendPill(pillId, 1)) {
    return { success: false, message: 'Tiêu hao đan dược thất bại.' }
  }

  const dName = displayDaoluName(def.name)

  // 1. Nếu đang bị thương -> chữa lành
  if (bond.daoluStatus === 'injured') {
    player.setBond({
      ...bond,
      daoluStatus: 'cultivating'
    })
    advanceBond({ trust: 8, accord: 6, fate: 3 })
    ui.toast(`Ban tặng đan dược giúp ${dName} bình phục thương thế!`, 'rare')
    return {
      success: true,
      message: `Dược lực tinh thuần lưu chuyển khắp kinh mạch, thương tích của ${dName} đã hoàn toàn bình phục!`
    }
  }

  // 2. Nếu đang vướng bình cảnh -> phá giải bình cảnh
  if (bond.daoluStatus === 'bottleneck') {
    player.setBond({
      ...bond,
      daoluStatus: 'cultivating'
    })
    advanceBond({ trust: 10, accord: 6, fate: 4 })
    ui.toast(`Đan dược khai thông bình cảnh cho ${dName}!`, 'rare')
    return {
      success: true,
      message: `Dược lực phá cảnh mãnh liệt đả thông huyền khiếu, bình cảnh của ${dName} đã được hóa giải!`
    }
  }

  // 3. Tăng tu vi theo phẩm đan
  const expGain = 30
  const curExp = bond.daoluExpPct ?? 0
  const newExp = Math.min(100, curExp + expGain)
  const isBottleneck = (bond.daoluSub ?? 0) >= 8 && newExp >= 100
  player.setBond({
    ...bond,
    daoluExpPct: newExp,
    daoluStatus: isBottleneck ? 'bottleneck' : (bond.daoluStatus ?? 'cultivating')
  })

  advanceBond({ trust: 6, accord: 4, fate: 2 })
  ui.toast(`Ban tặng đan dược cho ${dName} (+${expGain}% tu vi)`, 'rare')

  return {
    success: true,
    message: `${dName} nuốt vào đan dược, luyện hóa dược lực tinh thuần, tu vi tăng tiến rõ rệt (+${expGain}%)!`
  }
}

/**
 * Ban tặng linh thảo theo phẩm cấp cho Đạo Lữ
 */
export function provideHerbToDaolu(grade: 1 | 2 | 3 | 4 | 5): { success: boolean; message: string } {
  const bond = currentBond()
  const def = currentDaolu()
  const player = usePlayerStore()
  const resources = useResourcesStore()
  const ui = useUiStore()

  if (!bond || !def || bond.fallen || bond.departed) {
    return { success: false, message: 'Hiện chưa có đạo lữ đồng hành.' }
  }

  if (resources.herbOf(grade) <= 0) {
    return { success: false, message: `Linh thảo phẩm ${grade} trong giới chỉ đã hết.` }
  }

  resources.addHerb(grade, -1)
  const baseGain = grade * 8
  const curExp = bond.daoluExpPct ?? 0
  const dName = displayDaoluName(def.name)

  if (bond.daoluStatus === 'bottleneck') {
    advanceBond({ trust: 4, accord: 2, fate: 1 })
    ui.toast(`Tặng linh thảo phẩm ${grade} cho ${dName}`, 'info')
    return {
      success: true,
      message: `${dName} nhận lấy linh thảo ngâm ủ linh trà dưỡng thần. Tuy nhiên bình cảnh vẫn cần cơ duyên để phá vỡ.`
    }
  }

  const newExp = Math.min(100, curExp + baseGain)
  const isBottleneck = (bond.daoluSub ?? 0) >= 8 && newExp >= 100
  player.setBond({
    ...bond,
    daoluExpPct: newExp,
    daoluStatus: isBottleneck ? 'bottleneck' : (bond.daoluStatus ?? 'cultivating')
  })

  advanceBond({ trust: 4, accord: 3, fate: 2 })
  ui.toast(`Tặng linh thảo phẩm ${grade} cho ${dName} (+${baseGain}% tu vi)`, 'rare')

  return {
    success: true,
    message: `${dName} đón nhận linh thảo phẩm ${grade}, luyện hóa thiên địa tinh hoa, tu vi tăng thêm ${baseGain}%!`
  }
}

/**
 * Hộ pháp giúp Đạo Lữ đột phá (tiểu cảnh giới hoặc đại cảnh giới)
 */
export function assistDaoluBreakthrough(): { success: boolean; message: string } {
  const bond = currentBond()
  const def = currentDaolu()
  const player = usePlayerStore()
  const resources = useResourcesStore()
  const ui = useUiStore()

  if (!bond || !def || bond.fallen || bond.departed) {
    return { success: false, message: 'Hiện chưa có đạo lữ đồng hành.' }
  }

  const curMajor = bond.daoluMajor ?? def.startMajor
  const curSub = bond.daoluSub ?? 0
  const curExp = bond.daoluExpPct ?? 0
  const curStatus = bond.daoluStatus ?? 'cultivating'
  const dName = displayDaoluName(def.name)

  const isSubBreak = curExp >= 100 && curSub < 8
  const isMajorBreak = (curStatus === 'bottleneck') || (curSub >= 8 && curExp >= 100)

  if (!isSubBreak && !isMajorBreak) {
    return { success: false, message: `${dName} tu vi chưa đạt tới ngưỡng viên mãn để tiến hành đột phá.` }
  }

  // Tiêu hao 200 linh khí của nhân vật chính để bố trí hộ pháp trận
  if (resources.qi < 200) {
    return { success: false, message: 'Linh khí của ngươi không đủ (cần 200 luồng linh khí để hộ pháp).' }
  }

  resources.setQi(resources.qi - 200, player.qiCapValue)

  if (isSubBreak) {
    // Đột phá tiểu tầng (xác suất thành công 95% khi có hộ pháp)
    const newSub = curSub + 1
    player.setBond({
      ...bond,
      daoluSub: newSub,
      daoluExpPct: 0,
      daoluStatus: 'cultivating'
    })
    advanceBond({ trust: 10, accord: 8, fate: 5, shared: true })
    ui.toast(`Hộ pháp thành công! ${dName} bước lên tầng thứ ${newSub + 1}`, 'rare')
    return {
      success: true,
      message: `Ngươi dốc lòng hộ pháp, dẫn động linh khí trợ giúp ${dName} xung phá ải môn, thuận lợi bước lên tầng thứ ${newSub + 1}!`
    }
  }

  // Đột phá đại cảnh giới
  const breakthroughRate = 0.75 + (bond.daoluFocus === 'breakthrough' ? 0.15 : 0)
  if (rng.chance(breakthroughRate)) {
    const newMajor = Math.min(20, curMajor + 1)
    player.setBond({
      ...bond,
      daoluMajor: newMajor,
      daoluSub: 0,
      daoluExpPct: 0,
      daoluStatus: 'cultivating'
    })
    advanceBond({ trust: 18, accord: 14, fate: 10, shared: true })
    const nextRealm = displayRealmName(REALMS[newMajor]?.name ?? 'Cảnh giới mới')
    ui.toast(`【Đại Đạo Cộng Minh】${dName} đã đột phá thành công bước vào「${nextRealm}」!`, 'rare')
    return {
      success: true,
      message: `Lôi vân tiêu tán, linh quang rực rỡ! Dưới sự tương trợ của ngươi, ${dName} đã ngưng tụ đạo quả, đại phá quan ải bước vào「${nextRealm}」!`
    }
  } else {
    // Thất bại khi đột phá đại cảnh giới: giữ nguyên tu vi, có thể thụ thương
    const gotInjured = rng.chance(0.3)
    player.setBond({
      ...bond,
      daoluStatus: gotInjured ? 'injured' : 'bottleneck'
    })
    ui.toast(`Đột phá đại quan chưa thành, ${gotInjured ? `${dName} khí huyết chấn động thụ thương nhẹ` : 'đạo lữ bình an vô sự'}`, 'warn')
    return {
      success: false,
      message: `Thiên kiếp hung mãnh, ${dName} đột phá chưa thành. May có ngươi toàn lực bảo vệ nên tính mạng an toàn${gotInjured ? ', song kinh mạch chịu chút thương tích' : ''}.`
    }
  }
}

/**
 * Giúp Đạo Lữ khai thông bình cảnh (đàm đạo chỉ điểm hoặc ban tặng đan dược)
 */
export function resolveDaoluBottleneck(
  method: 'guidance' | 'pill',
  pillId?: string
): { success: boolean; message: string } {
  const bond = currentBond()
  const def = currentDaolu()
  const player = usePlayerStore()
  const resources = useResourcesStore()
  const inventory = useInventoryStore()
  const ui = useUiStore()

  if (!bond || !def || bond.fallen || bond.departed) {
    return { success: false, message: 'Hiện chưa có đạo lữ đồng hành.' }
  }

  const dName = displayDaoluName(def.name)

  if (bond.daoluStatus !== 'bottleneck') {
    return { success: false, message: `${dName} hiện không bị vướng bình cảnh.` }
  }

  if (method === 'guidance') {
    if (resources.qi < 150) {
      return { success: false, message: 'Linh khí của ngươi không đủ 150 luồng để cùng đàm đạo quán thông huyền cơ.' }
    }
    resources.setQi(resources.qi - 150, player.qiCapValue)

    const successChance = 0.7
    if (rng.chance(successChance)) {
      player.setBond({
        ...bond,
        daoluStatus: 'cultivating'
      })
      advanceBond({ trust: 10, accord: 8, fate: 5 })
      ui.toast(`Chỉ điểm huyền cơ, bình cảnh của ${dName} đã tiêu tan!`, 'rare')
      return {
        success: true,
        message: `Hai người đàm đạo suốt đêm, ngươi đem tâm đắc tu đạo giải bày tỉ mỉ. ${dName} bừng tỉnh đại ngộ, bình cảnh bấy lâu lập tức tiêu tán!`
      }
    } else {
      return {
        success: false,
        message: `Hai người trao đổi tâm đắc hồi lâu, đạo ý tuy có thấu tỏ nhưng thời cơ phá bình cảnh vẫn cần thêm chút tích lũy.`
      }
    }
  }

  // Phương thức dùng đan dược phá bình cảnh
  if (!pillId) {
    return { success: false, message: 'Vui lòng chọn đan dược phá cảnh thích hợp.' }
  }

  const count = inventory.pills[pillId] ?? 0
  if (count <= 0) {
    return { success: false, message: 'Trong hành trang không còn loại đan dược này.' }
  }

  if (!inventory.spendPill(pillId, 1)) {
    return { success: false, message: 'Tiêu hao đan dược thất bại.' }
  }

  player.setBond({
    ...bond,
    daoluStatus: 'cultivating'
  })
  advanceBond({ trust: 12, accord: 8, fate: 5 })
  ui.toast(`Dược lực phá tan bình cảnh cho ${dName}!`, 'rare')

  return {
    success: true,
    message: `${dName} phục dụng đan dược, dược lực hung dũng mở toang huyền môn, triệt để phá tan bình cảnh!`
  }
}

/**
 * Trị liệu thương thế cho Đạo Lữ
 */
export function healDaoluInjury(
  method: 'qi' | 'pill',
  pillId?: string
): { success: boolean; message: string } {
  const bond = currentBond()
  const def = currentDaolu()
  const player = usePlayerStore()
  const resources = useResourcesStore()
  const inventory = useInventoryStore()
  const ui = useUiStore()

  if (!bond || !def || bond.fallen || bond.departed) {
    return { success: false, message: 'Hiện chưa có đạo lữ đồng hành.' }
  }

  const dName = displayDaoluName(def.name)

  if (bond.daoluStatus !== 'injured') {
    return { success: false, message: `${dName} khí huyết bình hòa, không hề có thương tích.` }
  }

  if (method === 'qi') {
    if (resources.qi < 150) {
      return { success: false, message: 'Linh khí của ngươi không đủ 150 luồng để vận công trị thương.' }
    }
    resources.setQi(resources.qi - 150, player.qiCapValue)
    player.setBond({
      ...bond,
      daoluStatus: 'cultivating'
    })
    advanceBond({ trust: 8, accord: 6, fate: 4 })
    ui.toast(`Vận công trị thương thành công cho ${dName}`, 'rare')
    return {
      success: true,
      message: `Ngươi độ chân khí ấm áp ôn dưỡng kinh mạch, thương thế của ${dName} đã bình phục hoàn toàn!`
    }
  }

  if (!pillId) {
    return { success: false, message: 'Vui lòng chọn đan dược trị thương.' }
  }
  const count = inventory.pills[pillId] ?? 0
  if (count <= 0) {
    return { success: false, message: 'Trong hành trang không còn đan dược này.' }
  }
  if (!inventory.spendPill(pillId, 1)) {
    return { success: false, message: 'Tiêu hao đan dược thất bại.' }
  }

  player.setBond({
    ...bond,
    daoluStatus: 'cultivating'
  })
  advanceBond({ trust: 8, accord: 6, fate: 4 })
  ui.toast(`Dược lực chữa lành thương thế cho ${dName}`, 'rare')
  return {
    success: true,
    message: `Linh đan hóa giải huyết ứ, thương thế của ${dName} đã khỏi hẳn!`
  }
}

/**
 * Mô phỏng tiến trình tu luyện theo tháng của Đạo Lữ
 * Được gọi tập trung từ useNpcStore().advanceMonthTime() khi chuyển tháng.
 */
export function simulateDaoluMonthlyCultivation(currentMonth: number, monthsPassed: number): void {
  if (monthsPassed <= 0) return
  const player = usePlayerStore()
  const bond = player.bond
  if (!bond || bond.fallen || bond.departed) return

  const def = daoluDef(bond.daoluId)
  if (!def) return

  if (bond.lastCultivatedMonth && bond.lastCultivatedMonth >= currentMonth) {
    return
  }

  const dName = displayDaoluName(def.name)
  let major = bond.daoluMajor ?? def.startMajor
  let sub = bond.daoluSub ?? 0
  let expPct = bond.daoluExpPct ?? 0
  let status = bond.daoluStatus ?? 'cultivating'
  const focus = bond.daoluFocus ?? 'speed'

  // 1. Trạng thái Thụ Thương (injured)
  if (status === 'injured') {
    let healed = false
    for (let m = 0; m < monthsPassed; m++) {
      if (rng.chance(0.5)) {
        healed = true
        break
      }
    }
    if (healed) {
      status = 'cultivating'
      try {
        useUiStore().toast(`【Đạo Lữ Khỏe Lại】${dName} tĩnh dưỡng thương thế đã khỏi hẳn, tiếp tục tu hành!`, 'info')
      } catch {
        // Test env
      }
    }
    player.setBond({
      ...bond,
      daoluStatus: status,
      lastCultivatedMonth: currentMonth
    })
    return
  }

  // 2. Trạng thái Bình Cảnh (bottleneck)
  if (status === 'bottleneck') {
    const selfBreakChance = focus === 'breakthrough' ? 0.35 : 0.2
    let selfBroken = false
    for (let m = 0; m < monthsPassed; m++) {
      if (rng.chance(selfBreakChance)) {
        selfBroken = true
        break
      }
    }

    if (selfBroken) {
      major = Math.min(20, major + 1)
      sub = 0
      expPct = 0
      status = 'cultivating'
      try {
        const nextRealm = displayRealmName(REALMS[major]?.name ?? 'Cảnh giới mới')
        useUiStore().toast(`【Đạo Lữ Phá Cảnh】${dName} tự mình giác ngộ huyền cơ, thuận lợi phá vỡ bình cảnh bước vào「${nextRealm}」!`, 'rare')
      } catch {
        // Test env
      }
    }

    player.setBond({
      ...bond,
      daoluMajor: major,
      daoluSub: sub,
      daoluExpPct: expPct,
      daoluStatus: status,
      lastCultivatedMonth: currentMonth
    })
    return
  }

  // 3. Trạng thái Tu Luyện Thuận Lợi (cultivating)
  const baseMonthlyExp = 22 / (1 + major * 0.1)
  const g = bond.daoluGongfaId ? gongfaDef(bond.daoluGongfaId) : undefined
  const gSpeed = g?.baseMods.cultivationSpeed ?? 0.1
  const gongfaMult = 1 + gSpeed * 2
  const focusMult = focus === 'speed' ? 1.3 : 1.0
  const eleMult = g?.element && g.element === def.element ? 1.15 : 1.0

  const monthlyGain = Math.round(baseMonthlyExp * gongfaMult * focusMult * eleMult)
  expPct += monthlyGain * monthsPassed

  while (expPct >= 100) {
    if (sub < 8) {
      sub += 1
      expPct -= 100
      try {
        const realmName = displayRealmName(REALMS[major]?.name ?? 'Luyện Khí')
        useUiStore().toast(`【Đạo Lữ Tiến Cảnh】${dName} thuận lợi đột phá bước lên ${realmName} · Tầng ${sub + 1}!`, 'info')
      } catch {
        // Test env
      }
    } else {
      // Đạt đỉnh phong tiểu cảnh giới 9 -> chuyển sang trạng thái bình cảnh đại cảnh giới
      expPct = 100
      status = 'bottleneck'
      try {
        useUiStore().toast(`【Đạo Lữ Bình Cảnh】${dName} tu vi đã đạt đỉnh phong, bắt đầu vướng phải bình cảnh đại quan!`, 'warn')
      } catch {
        // Test env
      }
      break
    }
  }

  player.setBond({
    ...bond,
    daoluMajor: major,
    daoluSub: sub,
    daoluExpPct: expPct,
    daoluStatus: status,
    lastCultivatedMonth: currentMonth
  })
}

/**
 * Nhịp tim tu luyện tự động theo thời gian thực của Đạo Lữ (Heartbeat Cultivation).
 * Được gọi từ engine.ts mỗi tick (1000ms), giúp Đạo Lữ liên tục tăng trưởng tu vi giống nhân vật chính.
 */
export function tickDaoluCultivation(dt: number): void {
  if (dt <= 0) return
  const player = usePlayerStore()
  const bond = player.bond
  if (!bond || bond.fallen || bond.departed) return

  const def = daoluDef(bond.daoluId)
  if (!def) return

  const status = bond.daoluStatus ?? 'cultivating'
  if (status !== 'cultivating') return

  const major = bond.daoluMajor ?? def.startMajor
  let sub = bond.daoluSub ?? 0
  let expPct = bond.daoluExpPct ?? 0
  const focus = bond.daoluFocus ?? 'speed'

  // Tốc độ tu vi theo tháng: khoảng 22% / (1 + major * 0.1) trong 1800 giây
  const baseMonthlyExp = 22 / (1 + major * 0.1)
  const g = bond.daoluGongfaId ? gongfaDef(bond.daoluGongfaId) : undefined
  const gSpeed = g?.baseMods.cultivationSpeed ?? 0.1
  const gongfaMult = 1 + gSpeed * 2
  const focusMult = focus === 'speed' ? 1.35 : (focus === 'breakthrough' ? 0.9 : 0.85)
  const eleMult = g?.element && g.element === def.element ? 1.15 : 1.0
  const bondMult = 1 + (bond.trust + bond.accord) / 300

  const expGainPerSec = (baseMonthlyExp * gongfaMult * focusMult * eleMult * bondMult) / GAME_MONTH_REAL_SECONDS
  expPct += expGainPerSec * dt

  let newStatus: 'cultivating' | 'bottleneck' | 'injured' = status
  if (expPct >= 100) {
    if (sub < 8) {
      sub += 1
      expPct = Math.max(0, expPct - 100)
      try {
        const realmName = displayRealmName(REALMS[major]?.name ?? 'Luyện Khí')
        useUiStore().toast(`【Đạo Lữ Tiến Cảnh】${displayDaoluName(def.name)} đã lĩnh ngộ đột phá lên ${realmName} · Tầng ${sub + 1}!`, 'rare')
      } catch {
        // Test env
      }
    } else {
      expPct = 100
      newStatus = 'bottleneck'
      try {
        useUiStore().toast(`【Đạo Lữ Viên Mãn】${displayDaoluName(def.name)} tu vi đạt viên mãn, sẵn sàng cùng ngươi hộ pháp đột phá!`, 'rare')
      } catch {
        // Test env
      }
    }
  }

  player.setBond({
    ...bond,
    daoluSub: sub,
    daoluExpPct: Math.round(expPct * 100) / 100,
    daoluStatus: newStatus
  })
}
