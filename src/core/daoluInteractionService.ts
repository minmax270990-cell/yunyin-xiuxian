/**
 * Dịch vụ Tương tác Chiều sâu Đạo Lữ (Daolu Interaction Service)
 *
 * Mở rộng trải nghiệm đồng hành cùng Đạo Lữ:
 * - Trò chuyện & Tâm tình (talk / chat)
 * - Tặng quà (gift: đan dược, linh thảo, khoáng thạch)
 * - Giúp đỡ hộ pháp & truyền linh khí (assist)
 * - Song tu cảm ngộ đại đạo (dual cultivate - không tăng StatMods vĩnh viễn)
 * - Tỉ thí luận kiếm (spar - dùng resolveCombat)
 * - Kỳ ngộ độc lập của Đạo Lữ (daolu adventures)
 * - An táng & Buông bỏ tiền duyên để kết duyên người mới (release & re-bond)
 */
import {
  currentBond,
  currentDaolu,
  advanceBond,
  releaseFallen,
  type DaoluAdventureEntry
} from './daoluService'
import type { CombatantSnap, CombatResult } from '@/types'
import { usePlayerStore } from '@/stores/player'
import { useInventoryStore } from '@/stores/inventory'
import { useResourcesStore } from '@/stores/resources'
import { useGameStore } from '@/stores/game'
import { useUiStore } from '@/stores/ui'
import { useNpcStore } from '@/stores/npc'
import { gameDay, expRequirement, powerScale } from './formulas'
import { gn, mulN } from '@/utils/gnum'
import { rng } from '@/utils/random'
import { buildPlayerSnap } from './playerSnap'
import { resolveCombat } from './combat'
import { COMBAT_ATK_BASE, COMBAT_DEF_BASE, COMBAT_HP_BASE } from '@/data/constants'
import { displayDaoluName } from '@/ui/displayZhVi'
import {
  getDaoluCultivationInfo,
  provideStoneToDaolu,
  providePillToDaolu,
  provideHerbToDaolu
} from './daoluCultivationService'

/** Kết quả tương tác trò chuyện */
export interface DaoluTalkResult {
  success: boolean
  message: string
  line?: string
  fateDelta?: number
  trustDelta?: number
  accordDelta?: number
}

/** Kết quả tặng quà */
export interface DaoluGiftResult {
  success: boolean
  message: string
  reaction?: 'fond' | 'pleased' | 'neutral'
  fateDelta?: number
  trustDelta?: number
  accordDelta?: number
  equippedImmediately?: boolean
}

/** Kết quả song tu */
export interface DaoluDualResult {
  success: boolean
  message: string
  expGained?: string
  qiGained?: number
  accordDelta?: number
}

/** Kết quả tỉ thí */
export interface DaoluSparResult {
  success: boolean
  message: string
  win?: boolean
  rounds?: number
  combatResult?: CombatResult
}

function getToday(): number {
  return gameDay(useGameStore().totalPlaySec)
}

// ================= 1. TRÒ CHUYỆN / TÂM TÌNH =================

export function talkWithDaolu(): DaoluTalkResult {
  const bond = currentBond()
  const def = currentDaolu()
  const player = usePlayerStore()
  const ui = useUiStore()

  if (!bond || !def) {
    const msg = 'Ngươi hiện chưa có đạo lữ đồng hành.'
    ui.toast(msg, 'warn')
    return { success: false, message: msg }
  }
  const dName = displayDaoluName(def.name)

  if (bond.fallen) {
    const msg = `${dName} đã tạ thế, chỉ còn lại nấm mồ cô quạnh và hồi ức khôn nguôi.`
    ui.toast(msg, 'warn')
    return { success: false, message: msg }
  }
  if (bond.departed) {
    const msg = `${dName} đã dứt áo ra đi, tiền duyên đã đoạn.`
    ui.toast(msg, 'warn')
    return { success: false, message: msg }
  }

  const today = getToday()
  try {
    const npcStore = useNpcStore()
    const check = npcStore.canInteract(bond.daoluId, 'chat', 'daolu')
    if (!check.allowed) {
      const msg = `Tháng này ngươi và ${dName} đã đàm đạo nhiều rồi, hãy tĩnh tâm chờ tháng mới.`
      ui.toast(msg, 'warn')
      return {
        success: false,
        message: msg
      }
    }
  } catch {
    // Pinia not active
  }

  // Lời thoại theo tính cách và đạo đồ
  const linesByTemper: Record<string, string[]> = {
    cautious: [
      `"Gần đây linh khí thiên địa biến động bất an, khi bế quan xuất hành nên thận trọng thì hơn."`,
      `"Tu tiên là chuyện ngàn năm, nóng vội dễ sinh tâm ma. Có ngươi bên cạnh đàm đạo, tâm ta an định hơn nhiều."`,
      `"Mỗi bước đi đều như trên băng mỏng, nhưng nhìn thấy bóng lưng ngươi, ta lại thấy an lòng."`
    ],
    bold: [
      `"Trường kiếm trong tay, phong vân nơi đáy mắt! Đi, ta cùng ngươi đi xem đỉnh núi cao nhất phương trời này!"`,
      `"Sợ hãi chẳng giúp ta trường sinh, chỉ có đạo tâm kiên định mới phá tan mọi kiếp nạn!"`,
      `"Có ngươi cùng chung chí hướng, thiên hạ này còn nơi nào chúng ta không dám đến?"`
    ],
    frugal: [
      `"Một viên đan, một ngọn cỏ đều là tạo hóa ban tặng, tích lũy từng chút một mới nên đại đạo."`,
      `"Nhìn dòng đời tranh đoạt phồn hoa, ta chỉ muốn cùng ngươi an ổn ngắm mây trôi nước chảy."`,
      `"Sống đủ lâu mới thấy được điểm cuối của vạn sự vạn vật. Ngươi... nhớ phải sống lâu hơn ta đấy."`
    ],
    curious: [
      `"Nghe nói phía chân trời xa xôi có cổ di tích mới xuất thế, ngươi có muốn cùng ta đi thám thính không?"`,
      `"Vũ trụ bao la, có biết bao nhiêu điều huyền bí chưa được giải đáp. Cùng ngươi tìm tòi thật chẳng bao giờ chán."`,
      `"Mỗi ngày ở bên ngươi, ta lại phát hiện ra một điều thú vị mới."`
    ]
  }

  const list = linesByTemper[def.temper] ?? linesByTemper.cautious!
  const pickedLine = list[rng.int(0, list.length - 1)]!

  // Cập nhật trạng thái
  const chatCount = bond.chatCountToday ?? 0
  player.setBond({
    ...bond,
    lastChatDay: today,
    chatCountToday: chatCount + 1
  })

  // Tăng nhẹ thiện cảm
  advanceBond({ fate: 2, trust: 2, accord: 1 })
  try {
    useNpcStore().recordInteraction(bond.daoluId, 'chat')
  } catch {
    // Pinia not active
  }
  ui.toast(`${dName} khẽ mở lời tâm sự`, 'info')

  return {
    success: true,
    message: `Ngươi và ${dName} ngồi bên nhau đàm đạo nhân sinh tu hành.`,
    line: pickedLine,
    fateDelta: 2,
    trustDelta: 2,
    accordDelta: 1
  }
}

// ================= 2. TẶNG QUÀ & CHU CẤP =================

import { giftEquipmentToNpc } from './npcEquipmentService'
import { equipmentTemplate } from '@/data/equipment'
import { displayEquipName } from '@/ui/displayZhVi'

export type DaoluGiftType = 'pill' | 'herb' | 'ore' | 'stone' | 'equipment'

export function giftToDaolu(type: DaoluGiftType, itemIdOrGrade?: string | number): DaoluGiftResult {
  const bond = currentBond()
  const def = currentDaolu()
  const player = usePlayerStore()
  const inventory = useInventoryStore()
  const resources = useResourcesStore()
  const ui = useUiStore()
  const npcStore = useNpcStore()
  let eqRes: ReturnType<typeof giftEquipmentToNpc> | undefined

  if (!bond || !def) {
    const msg = 'Ngươi hiện chưa có đạo lữ đồng hành.'
    ui.toast(msg, 'warn')
    return { success: false, message: msg }
  }
  const dName = displayDaoluName(def.name)

  if (bond.fallen || bond.departed) {
    const msg = 'Không thể tặng quà vào lúc này.'
    ui.toast(msg, 'warn')
    return { success: false, message: msg }
  }

  const today = getToday()
  try {
    const npcStore = useNpcStore()
    const check = npcStore.canInteract(bond.daoluId, 'gift', 'daolu')
    if (!check.allowed) {
      const msg = `Tháng này ngươi đã tặng quà cho ${dName} nhiều lần rồi, quà cáp dồn dập trái lại gây phân tâm tu hành.`
      ui.toast(msg, 'warn')
      return {
        success: false,
        message: msg
      }
    }
  } catch {
    // Pinia not active
  }

  let itemName = ''
  let fond = false

  if (type === 'stone') {
    const amount = typeof itemIdOrGrade === 'number' ? itemIdOrGrade : 800
    const stoneRes = provideStoneToDaolu(amount)
    if (!stoneRes.success) {
      ui.toast(stoneRes.message, 'warn')
      return { success: false, message: stoneRes.message }
    }
    itemName = `${amount} linh thạch`
    fond = true
  } else if (type === 'pill') {
    const pillId = typeof itemIdOrGrade === 'string' ? itemIdOrGrade : Object.keys(inventory.pills)[0]
    if (!pillId || (inventory.pills[pillId] ?? 0) <= 0) {
      const msg = 'Trong túi đan không có đan dược này.'
      ui.toast(msg, 'warn')
      return { success: false, message: msg }
    }
    providePillToDaolu(pillId)
    itemName = 'Linh đan'
    fond = def.lean === 'alchemy' || def.lean === 'longevity'
  } else if (type === 'herb') {
    const grade = typeof itemIdOrGrade === 'number' ? (itemIdOrGrade as 1 | 2 | 3 | 4 | 5) : 1
    if (resources.herbOf(grade) <= 0) {
      const msg = 'Linh thảo phẩm cấp này đã hết trong giới chỉ.'
      ui.toast(msg, 'warn')
      return { success: false, message: msg }
    }
    provideHerbToDaolu(grade)
    itemName = `Linh thảo phẩm ${grade}`
    fond = def.lean === 'alchemy' || def.element === 'wood'
  } else if (type === 'ore') {
    if (resources.ore <= 0) {
      const msg = 'Ngươi không còn linh khoáng quặng sắt.'
      ui.toast(msg, 'warn')
      return { success: false, message: msg }
    }
    resources.addSmall('ore', -1)
    itemName = 'Huyền thiết khoáng thạch'
    fond = def.lean === 'artifice' || def.lean === 'sword' || def.element === 'metal'
  } else if (type === 'equipment') {
    const equipUid = typeof itemIdOrGrade === 'string' ? itemIdOrGrade : ''
    const item = inventory.findItem(equipUid)
    if (!item) {
      const msg = 'Không tìm thấy trang bị này trong túi đồ.'
      ui.toast(msg, 'warn')
      return { success: false, message: msg }
    }
    const tpl = equipmentTemplate(item.templateId)
    const eqName = tpl ? displayEquipName(tpl.name) : item.templateId

    const cult = npcStore.getNpcCultivation(bond.daoluId)
    const currentMajor = bond.daoluMajor ?? cult?.major ?? def.startMajor ?? 1
    const currentSub = bond.daoluSub ?? cult?.sub ?? 0
    eqRes = giftEquipmentToNpc(bond.daoluId, dName, item, 'gifted', {
      major: currentMajor,
      sub: currentSub,
      element: def.element
    })

    inventory.removeEquipment(item.uid)
    itemName = `Pháp bảo【${eqName}】`
    fond = true
  }

  // Cập nhật trạng thái
  const latestBond = player.bond ?? bond
  const giftCount = latestBond.giftCountToday ?? 0
  player.setBond({
    ...latestBond,
    lastGiftDay: today,
    giftCountToday: giftCount + 1
  })

  let fateDelta = 3
  let trustDelta = 4
  let accordDelta = 1
  let message = `${dName} nhận lấy ${itemName}, ánh mắt chứa chan ý cảm kích.`
  let reaction: DaoluGiftResult['reaction'] = 'pleased'

  if (type === 'stone') {
    const amount = typeof itemIdOrGrade === 'number' ? itemIdOrGrade : 800
    fateDelta = 4
    trustDelta = 6
    accordDelta = 2
    reaction = 'fond'
    message = `Ngươi chu cấp ${amount} linh thạch giúp ${dName} tu luyện. ${dName} mười phần cảm kích: "Đa tạ đạo hữu đã luôn chu cấp tài nguyên trợ lực cho ta!"`
  } else if (type === 'equipment') {
    fateDelta = 6
    trustDelta = 8
    accordDelta = 4
    reaction = 'fond'
    message = eqRes?.message || `${dName} mười phần kinh hỉ khi nhận được ${itemName}: "Pháp bảo hộ thân tinh diệu nhường này, đa tạ đạo hữu đã dốc lòng tương tặng!"`
  } else if (fond) {
    fateDelta = 5
    trustDelta = 7
    accordDelta = 3
    reaction = 'fond'
    message = `${dName} mười phần trân quý món quà này: "Vật này đúng lúc ta đang rất cần, đa tạ đạo hữu đã luôn để tâm!"`
  }

  advanceBond({ fate: fateDelta, trust: trustDelta, accord: accordDelta })
  try {
    useNpcStore().recordInteraction(bond.daoluId, 'gift')
  } catch {
    // Pinia not active
  }
  ui.toast(`Tặng ${itemName} cho ${dName}`, 'rare')

  return {
    success: true,
    message,
    reaction,
    fateDelta,
    trustDelta,
    accordDelta,
    equippedImmediately: eqRes?.equippedImmediately
  }
}

// ================= 3. GIÚP ĐỠ HỘ PHÁP =================

export function assistDaolu(type: 'spirit_stone' | 'qi_infusion'): { success: boolean; message: string } {
  const bond = currentBond()
  const def = currentDaolu()
  const player = usePlayerStore()
  const resources = useResourcesStore()
  const ui = useUiStore()

  if (!bond || !def || bond.fallen || bond.departed) {
    const msg = 'Hiện không thể tương trợ đạo lữ.'
    ui.toast(msg, 'warn')
    return { success: false, message: msg }
  }
  const dName = displayDaoluName(def.name)

  if (type === 'spirit_stone') {
    const cost = gn(800)
    if (!resources.spendStone(cost)) {
      const msg = 'Linh thạch trong túi không đủ (cần 800 linh thạch).'
      ui.toast(msg, 'warn')
      return { success: false, message: msg }
    }
    advanceBond({ trust: 8, accord: 4, shared: true })
    ui.toast(`Chu cấp linh thạch trợ giúp ${dName} tu luyện`, 'info')
    return {
      success: true,
      message: `Ngươi xuất 800 linh thạch hỗ trợ ${dName} bố trí tụ linh trận. ${dName} cảm kích khôn nguôi, lòng tin gia tăng rõ rệt.`
    }
  }

  // qi_infusion: truyền độ chân khí
  const playerQi = resources.qi
  if (playerQi < 100) {
    const msg = 'Linh khí bản thân quá mỏng manh, không thể truyền khí hộ pháp.'
    ui.toast(msg, 'warn')
    return { success: false, message: msg }
  }

  const spendQi = Math.floor(playerQi * 0.4)
  resources.setQi(playerQi - spendQi, player.qiCapValue)
  advanceBond({ trust: 10, accord: 6, fate: 4, shared: true })
  ui.toast(`Độ linh khí trợ giúp ${dName} thông suốt kinh mạch`, 'rare')

  return {
    success: true,
    message: `Hai người chưởng tâm tương áp, ngươi vận chuyển chân khí giúp ${dName} thanh lọc kinh mạch bế tắc. Đạo tâm hai người cộng minh sâu sắc.`
  }
}

// ================= 4. SONG TU CẢM NGỘ =================

export function dualCultivateWithDaolu(): DaoluDualResult {
  const bond = currentBond()
  const def = currentDaolu()
  const player = usePlayerStore()
  const resources = useResourcesStore()
  const ui = useUiStore()

  if (!bond || !def) {
    const msg = 'Ngươi chưa có đạo lữ để cùng song tu.'
    ui.toast(msg, 'warn')
    return { success: false, message: msg }
  }
  const dName = displayDaoluName(def.name)

  if (bond.fallen || bond.departed) {
    const msg = 'Đạo lữ không còn ở bên, không thể song tu.'
    ui.toast(msg, 'warn')
    return { success: false, message: msg }
  }

  // Yêu cầu quan hệ từ 'together' (Đồng hành) trở lên
  const minStages = ['together', 'confidant', 'pledged', 'daolv']
  if (!minStages.includes(bond.stage)) {
    const msg = `Mối quan hệ hiện tại (mới ở mức「${bond.stage}」) chưa đủ gắn kết để cùng nhau song tu thần thức.`
    ui.toast(msg, 'warn')
    return {
      success: false,
      message: msg
    }
  }

  const today = getToday()
  try {
    const npcStore = useNpcStore()
    const check = npcStore.canInteract(bond.daoluId, 'dual', 'daolu')
    if (!check.allowed) {
      const msg = `Trong tháng này đã cùng ${dName} song tu rồi, cần thời gian tiêu hóa linh vận chờ tháng mới.`
      ui.toast(msg, 'warn')
      return {
        success: false,
        message: msg
      }
    }
  } catch {
    // Pinia not active
  }

  // Tính lượng tu vi nhận được (không sinh StatMods, chỉ tăng exp tức thời)
  const req = expRequirement(player.major, player.sub)
  const gain = mulN(req, 0.08) // Nhận 8% tiến độ của cảnh giới hiện tại
  player.gainExp(gain)

  // Hồi phục linh khí đầy đủ
  resources.setQi(player.qiCapValue, player.qiCapValue)

  // Cập nhật ngày song tu và bồi dưỡng tu vi đạo lữ (tăng 20% exp, 50% cơ hội giải trừ bình cảnh)
  const curExp = bond.daoluExpPct ?? 0
  const curStatus = bond.daoluStatus ?? 'cultivating'
  let newStatus = curStatus
  if (curStatus === 'bottleneck' && rng.chance(0.5)) {
    newStatus = 'cultivating'
  }
  const newExp = Math.min(100, curExp + 20)

  player.setBond({
    ...bond,
    lastDualDay: today,
    daoluExpPct: newExp,
    daoluStatus: newStatus
  })

  // Tăng accord và fate
  advanceBond({ accord: 4, fate: 3, shared: true })
  try {
    useNpcStore().recordInteraction(bond.daoluId, 'dual')
  } catch {
    // Pinia not active
  }
  ui.toast(`Cùng ${dName} song tu cảm ngộ đại đạo`, 'rare')

  return {
    success: true,
    message: `Hai người xếp bằng đối diện, âm dương tương tế, linh thức giao hòa. Đại chu thiên vận hành viên mãn, tu vi cùng linh khí tăng mạnh!`,
    accordDelta: 4
  }
}

// ================= 5. TỈ THÍ LUẬN KIẾM =================

export function sparWithDaolu(): DaoluSparResult {
  const bond = currentBond()
  const def = currentDaolu()
  const player = usePlayerStore()
  const ui = useUiStore()

  if (!bond || !def) {
    const msg = 'Ngươi chưa có đạo lữ để tỉ thí.'
    ui.toast(msg, 'warn')
    return { success: false, message: msg }
  }
  const dName = displayDaoluName(def.name)

  if (bond.fallen || bond.departed) {
    const msg = 'Không thể tỉ thí lúc này.'
    ui.toast(msg, 'warn')
    return { success: false, message: msg }
  }

  const today = getToday()
  try {
    const npcStore = useNpcStore()
    const check = npcStore.canInteract(bond.daoluId, 'spar', 'daolu')
    if (!check.allowed) {
      const msg = `Trong tháng này đã luận kiếm cùng ${dName} rồi, hãy để kiếm ý lắng đọng chờ tháng mới.`
      ui.toast(msg, 'warn')
      return {
        success: false,
        message: msg
      }
    }
  } catch {
    // Pinia not active
  }

  // Tạo snapshot người chơi
  const playerSnap = buildPlayerSnap()

  // Tạo snapshot Đạo Lữ dựa trên cảnh giới
  const daoluMajor = bond.daoluMajor ?? def.startMajor
  const scale = powerScale(daoluMajor)

  const daoluSnap: CombatantSnap = {
    name: def.name,
    icon: 'user',
    isPlayer: false,
    attack: mulN(scale, COMBAT_ATK_BASE),
    defense: mulN(scale, COMBAT_DEF_BASE),
    maxHp: mulN(scale, COMBAT_HP_BASE),
    speed: 1.05,
    mods: {
      critRate: def.lean === 'sword' ? 0.2 : 0.05,
      critDamage: def.lean === 'sword' ? 0.5 : 0.2,
      damageBonus: def.lean === 'slaughter' ? 0.25 : 0.05,
      damageReduction: def.lean === 'longevity' ? 0.2 : 0.05,
      lifesteal: def.lean === 'alchemy' ? 0.15 : 0,
      dodgeRate: def.lean === 'truth' ? 0.15 : 0.05
    },
    skills: []
  }

  // Chạy trận giao hữu (không trừ HP thật ngoài đời)
  const result = resolveCombat(playerSnap, daoluSnap, rng, undefined, true)

  // Cập nhật trạng thái
  player.setBond({
    ...bond,
    lastSparDay: today
  })

  let message = ''
  if (result.win) {
    advanceBond({ trust: 4, accord: 3 })
    message = `Trải qua ${result.rounds} hiệp giao phong, ngươi hiểm thắng nửa chiêu. ${dName} thu kiếm tán thán: "Đạo pháp của ngươi tinh tiến thần tốc, quả thực làm ta mở rộng tầm mắt!"`
  } else {
    advanceBond({ trust: 3, accord: 4 })
    message = `Trải qua ${result.rounds} hiệp giao thủ, ${dName} chiếm thế thượng phong. ${dName} mỉm cười chỉ điểm: "Chiêu thức của ngươi rất sắc bén, song nếu chú ý thêm hơi thở khi biến chiêu thì sẽ hoàn mỹ hơn."`
  }

  try {
    useNpcStore().recordInteraction(bond.daoluId, 'spar')
  } catch {
    // Pinia not active
  }

  ui.toast(`Cùng ${dName} luận kiếm tỉ thí xong xuôi`, 'info')

  return {
    success: true,
    message,
    win: result.win,
    rounds: result.rounds,
    combatResult: result
  }
}

// ================= 6. KỲ NGỘ ĐỘC LẬP CỦA ĐẠO LỮ =================

export function triggerDaoluAdventure(): DaoluAdventureEntry | null {
  const bond = currentBond()
  const def = currentDaolu()
  const player = usePlayerStore()

  if (!bond || !def || bond.fallen || bond.departed) return null

  const dName = displayDaoluName(def.name)
  const today = getToday()
  const kinds: DaoluAdventureEntry['kind'][] = ['breakthrough', 'treasure', 'peril', 'daily']
  const kind = kinds[rng.int(0, kinds.length - 1)]!

  let title = ''
  let desc = ''

  if (kind === 'breakthrough') {
    const curMajor = bond.daoluMajor ?? def.startMajor
    const nextMajor = Math.min(9, curMajor + 1)
    title = 'Đột Phá Bình Cảnh'
    desc = `${dName} sau nhiều ngày bế quan lĩnh ngộ, đã thuận lợi đột phá bình cảnh tu vi!`
    player.setBond({
      ...bond,
      daoluMajor: nextMajor
    })
  } else if (kind === 'treasure') {
    title = 'Kỳ Duyên Tầm Bảo'
    desc = `${dName} trong chuyến du sơn tầm dược tình cờ phát hiện một chỗ cổ tu động phủ, thu hoạch được ngàn năm linh nhũ.`
  } else if (kind === 'peril') {
    title = 'Chém Yêu Trừ Ma'
    desc = `${dName} gặp phải một đầu hung thú tác quái gây nguy hiểm cho phàm nhân, liền rút kiếm trảm trừ bình an trở về.`
  } else {
    title = 'Thưởng Ngoạn Nhân Gian'
    desc = `${dName} ghé thăm một trấn nhỏ dưới chân núi, mua về một hộp trà thơm và mấy nhánh mai rừng.`
  }

  const entry: DaoluAdventureEntry = {
    id: `adv_${Date.now()}_${rng.int(100, 999)}`,
    title,
    desc,
    atDay: today,
    kind
  }

  const prev = bond.adventures ?? []
  const adventures = [entry, ...prev].slice(0, 10) // Giữ tối đa 10 kỳ ngộ gần nhất

  player.setBond({
    ...bond,
    adventures
  })

  return entry
}

// ================= 7. AN TÁNG & BUÔNG BỎ ĐỂ KẾT DUYÊN MỚI =================

export function releaseFallenDaolu(): { success: boolean; message: string } {
  const bond = currentBond()
  if (!bond || !bond.fallen) {
    return { success: false, message: 'Đạo lữ vẫn còn sống, không thể tiến hành an táng buông bỏ.' }
  }

  const record = releaseFallen()
  if (!record) {
    return { success: false, message: 'Giải trừ quan hệ thất bại.' }
  }

  return {
    success: true,
    message: `Ngươi đã an táng ${displayDaoluName(record.name)}, ghi khắc đoạn nhân duyên này vào hồi ức tiền kiếp. Từ nay về sau, ngươi có thể mở lòng kết duyên cùng tu sĩ khác trong thiên hạ.`
  }
}

// ================= 8. CHỦ ĐỘNG TÂM SỰ & TƯƠNG TÁC =================

export interface DaoluProactiveDialogue {
  line: string
  mood: string
  suggestedAction?: {
    type: 'breakthrough' | 'chat' | 'dual' | 'spar' | 'gift' | 'adventure'
    label: string
  }
}

/**
 * Lấy lời mở đầu và tâm sự chủ động của Đạo Lữ khi người chơi mở giao diện hoặc ghé thăm
 */
export function getDaoluProactiveDialogue(): DaoluProactiveDialogue | null {
  const bond = currentBond()
  const def = currentDaolu()
  if (!bond || !def || bond.fallen || bond.departed) return null

  const dName = displayDaoluName(def.name)
  const cultInfo = getDaoluCultivationInfo()

  // 1. Nếu tu vi đã đầy 100% hoặc đang gặp bình cảnh -> Chủ động nhờ hộ pháp phá quan
  if (cultInfo.canBreakthrough || cultInfo.status === 'bottleneck') {
    return {
      mood: 'Hân hoan chờ đợi phá quan',
      line: `${dName} nhẹ nhàng bước tới gần ngươi: "Đạo vận trong khí hải ta đang cuộn trào, huyền quan sắp phá vỡ... Ngươi có thể vì ta mà hộ pháp đột phá lúc này chăng?"`,
      suggestedAction: {
        type: 'breakthrough',
        label: 'Hộ Pháp Đột Phá'
      }
    }
  }

  // 2. Nếu đang bị thương -> Lời an ủi dịu dàng
  if (cultInfo.status === 'injured') {
    return {
      mood: 'Tĩnh dưỡng thương thế',
      line: `${dName} mỉm cười trấn an: "Khí huyết có chút chấn động, nhưng nhìn thấy bóng hình ngươi bình an tới đây, tâm ta đã an định hơn phân nửa rồi. Đừng quá lo lắng cho ta."`,
      suggestedAction: {
        type: 'chat',
        label: 'Vận Khí Trị Thương'
      }
    }
  }

  // 3. Nếu chưa song tu trong tháng này và quan hệ đủ gắn bó -> Chủ động mời gọi song tu
  let canDual = false
  try {
    canDual = useNpcStore().canInteract(bond.daoluId, 'dual', 'daolu').allowed
  } catch {
    canDual = true
  }
  const minStages = ['together', 'confidant', 'pledged', 'daolv']
  if (canDual && minStages.includes(bond.stage)) {
    return {
      mood: 'Tâm ý tương thông',
      line: `${dName} đôi mắt lấp lánh ánh cười: "Linh khí đất trời tháng này thanh khiết khác thường. Chi bằng chúng ta cùng xếp bằng đối diện, vận chuyển đại chu thiên song tu một phen?"`,
      suggestedAction: {
        type: 'dual',
        label: 'Cùng Nhau Song Tu'
      }
    }
  }

  // 4. Nếu chưa luận kiếm trong tháng này và tính cách thích chiến đấu / kiếm đạo
  let canSpar = false
  try {
    canSpar = useNpcStore().canInteract(bond.daoluId, 'spar', 'daolu').allowed
  } catch {
    canSpar = true
  }
  if (canSpar && (def.temper === 'bold' || def.lean === 'sword' || def.lean === 'slaughter')) {
    return {
      mood: 'Hào khí dâng trào',
      line: `${dName} khẽ vỗ vào đốc kiếm: "Kiếm ý lắng đọng bấy lâu, hôm nay nhìn thần sắc ngươi rất tốt. Chúng ta cùng ra sườn núi luận kiếm vài chiêu chứ?"`,
      suggestedAction: {
        type: 'spar',
        label: 'Cùng Nhau Luận Kiếm'
      }
    }
  }

  // 5. Tâm tình trò chuyện theo tính cách (Luôn sẵn sàng khi người chơi ghé thăm)
  const dialogueByTemper: Record<string, { mood: string; line: string }> = {
    curious: {
      mood: 'Hiếu kỳ ghi chép thảo mộc',
      line: `${dName} vui vẻ ngẩng đầu lên: "Ngươi tới rồi! Ta vừa ghi chép được thêm một loài linh dược hiếm thấy trên vách núi, muốn cùng ngươi chia sẻ!"`
    },
    cautious: {
      mood: 'Dịu dàng quan tâm',
      line: `${dName} rót một chén linh trà ấm: "Gió lạnh ngoài kia buốt lắm... Ta đã chuẩn bị sẵn linh trà ôn dưỡng nguyên khí, mau ngồi xuống nghỉ ngơi cùng ta."`
    },
    bold: {
      mood: 'Nhiệt huyết hào sảng',
      line: `${dName} đứng đón gió đầu núi: "Trường kiếm nơi tay, thiên hạ rộng lớn biết bao! Có ngươi đồng hành, con đường tu tiên này chưa từng cô tịch."`
    },
    frugal: {
      mood: 'Thanh nhàn tĩnh tọa',
      line: `${dName} mở mắt nhìn ngươi: "Ngươi đến thăm ta sao? Ngồi xuống đây ngắm mây trôi một chút đi. Đại đạo ngàn năm, nóng vội chẳng bằng tĩnh tâm tự tại."`
    }
  }

  const selected = dialogueByTemper[def.temper] ?? dialogueByTemper.curious!
  return {
    mood: selected.mood,
    line: selected.line,
    suggestedAction: {
      type: 'chat',
      label: 'Cùng Nhau Đàm Đạo'
    }
  }
}
