/**
 * Dịch vụ Quản lý Quần thể NPC Thế giới (World NPC Service)
 *
 * Quản lý danh sách, tìm kiếm, tương tác, quan hệ và ứng viên Đạo lữ
 * cho toàn thể tu sĩ trong cửu giới.
 */
import {
  WORLD_NPCS,
  type WorldNpcDef,
  type SectId,
  worldNpcDef,
  npcsBySect,
  sectDef,
  type SectDef,
  daoluCandidatesByGender
} from '@/data/npc'
import { registerDaoluLookup } from '@/data/daolu'
import { usePlayerStore } from '@/stores/player'
import { useUiStore } from '@/stores/ui'
import { useNpcStore } from '@/stores/npc'
import { useInventoryStore } from '@/stores/inventory'
import { useResourcesStore } from '@/stores/resources'
import { rng } from '@/utils/random'
import { buildPlayerSnap } from './playerSnap'
import { resolveCombat } from './combat'
import { powerScale } from './formulas'
import { mulN } from '@/utils/gnum'
import { COMBAT_ATK_BASE, COMBAT_DEF_BASE, COMBAT_HP_BASE } from '@/data/constants'
import type { CombatantSnap } from '@/types'

export interface NpcInteractionResult {
  success: boolean
  message: string
  favorDelta?: number
  dialogue?: string
}

/** Lấy toàn bộ danh sách NPC thế giới (kết hợp cả NPC tĩnh và NPC sinh theo giai đoạn) */
export function getAllWorldNpcs(): readonly WorldNpcDef[] {
  try {
    const store = useNpcStore()
    if (store && store.allActiveNpcs && store.allActiveNpcs.length > 0) {
      return store.allActiveNpcs
    }
  } catch {
    // Nếu chưa khởi tạo Pinia trong môi trường test độc lập
  }
  return WORLD_NPCS
}

/** Tìm NPC theo ID */
export function getNpc(id: string): WorldNpcDef | undefined {
  try {
    const store = useNpcStore()
    const found = store?.findNpc?.(id)
    if (found) return found
  } catch {
    // Pinia not active
  }
  return worldNpcDef(id)
}

registerDaoluLookup((id: string) => {
  const npc = getNpc(id)
  if (!npc) return undefined
  return {
    id: npc.id,
    name: npc.name,
    brief: npc.brief,
    temper: npc.temper,
    lean: npc.lean,
    element: npc.element,
    startMajor: npc.major,
    pursuit: npc.pursuit,
    taboo: npc.taboo,
    terrains: [],
    gender: npc.gender
  }
})

/** Lấy danh sách NPC theo môn phái */
export function getNpcsOfSect(sectId: SectId): WorldNpcDef[] {
  const dynamic = getAllWorldNpcs().filter(n => n.sectId === sectId) as WorldNpcDef[]
  return dynamic.length > 0 ? dynamic : npcsBySect(sectId)
}

/** Lấy thông tin môn phái */
export function getSect(sectId: SectId): SectDef | undefined {
  return sectDef(sectId)
}

/**
 * Lọc danh sách ứng viên Đạo lữ phù hợp với người chơi.
 *
 * Quy tắc:
 * - Phải là ứng viên cho phép kết duyên (isDaoluCandidate = true)
 * - Khác giới tính với nhân vật chính (Nam chỉ ghép với Nữ, Nữ chỉ ghép với Nam)
 */
export function getAvailableDaoluCandidates(): WorldNpcDef[] {
  let expectedGender: 'male' | 'female' = 'female'
  try {
    const player = usePlayerStore()
    expectedGender = player.gender === 'female' ? 'male' : 'female'
  } catch {
    // Pinia not active
  }
  const all = getAllWorldNpcs()
  if (all.length > WORLD_NPCS.length) {
    return all.filter(n => n.isDaoluCandidate && n.gender === expectedGender) as WorldNpcDef[]
  }
  return daoluCandidatesByGender(expectedGender)
}

/**
 * Tương tác cơ bản với NPC trong thế giới (Chào hỏi, Đàm đạo, Luận đạo).
 * Quản lý giới hạn theo chu kỳ 1 tháng trong game (30 phút thực).
 */
export function interactWithWorldNpc(
  npcId: string,
  action: 'greet' | 'chat' | 'discuss'
): NpcInteractionResult {
  const npc = getNpc(npcId)
  if (!npc) {
    return { success: false, message: 'Không tìm thấy tu sĩ này.' }
  }

  try {
    const store = useNpcStore()
    const check = store.canInteract(npcId, action)
    if (!check.allowed) {
      return {
        success: false,
        message: check.reason ?? 'Trong tháng này đã thực hiện tương tác này rồi.'
      }
    }
  } catch {
    // Pinia not active
  }

  let favorDelta = 1
  let msg = ''

  if (action === 'greet') {
    const greetings = [
      `【${npc.name}】mỉm cười chắp tay: "Đạo hữu hữu lễ, hạnh ngộ hạnh ngộ."`,
      `【${npc.name}】gật đầu chào: "Gặp được đạo hữu giữa chốn hồng trần mênh mông quả là hữu duyên."`,
      `【${npc.name}】dừng bước: "Đạo hữu cũng tới đây tầm đạo sao? Tiện đường cùng đàm đạo vài câu chăng?"`
    ]
    msg = greetings[rng.int(0, greetings.length - 1)]!
    favorDelta = 1
    try {
      useUiStore().toast(`Chào hỏi ${npc.name}`, 'info')
    } catch {
      // Pinia not active
    }
  } else if (action === 'chat') {
    const chats = [
      `Ngươi cùng【${npc.name}】ngồi bên đình đá, trao đổi chuyện tu hành cùng phong cảnh các phương.`,
      `【${npc.name}】thở dài thổ lộ: "Đại đạo gian nan, ${npc.pursuit}, chẳng biết kiếp này có thành hay chăng."`,
      `【${npc.name}】chia sẻ về môn quy【${npc.sectRole}】tại môn phái, lời lẽ chân thành tha thiết.`
    ]
    msg = chats[rng.int(0, chats.length - 1)]!
    favorDelta = 2
    try {
      useUiStore().toast(`Đàm đạo cùng ${npc.name}`, 'info')
    } catch {
      // Pinia not active
    }
  } else {
    // discuss: Luận pháp
    const discussLines = [
      `Hai người cùng nhau diễn giải linh thức cùng thiên địa đạo tắc, đều cảm thấy thu hoạch không nhỏ.`,
      `【${npc.name}】kinh ngạc trước kiến giải của ngươi: "Đạo hữu đối với thiên đạo lại có cái nhìn thấu triệt đến thế!"`,
      `Một hồi luận pháp kết thúc, tâm cảnh hai người càng thêm khoáng đạt, đạo ý dạt dào.`
    ]
    msg = discussLines[rng.int(0, discussLines.length - 1)]!
    favorDelta = 3
    try {
      useUiStore().toast(`Luận đạo cùng ${npc.name}`, 'rare')
    } catch {
      // Pinia not active
    }
  }

  try {
    const store = useNpcStore()
    store.addFavor(npcId, favorDelta)
    store.recordInteraction(npcId, action)
  } catch {
    // Pinia not active
  }

  return { success: true, message: msg, favorDelta }
}

/**
 * Tỉ thí luận kiếm với NPC trong thế giới (1 lần/tháng).
 */
export function sparWithWorldNpc(npcId: string): NpcInteractionResult {
  const npc = getNpc(npcId)
  if (!npc) {
    return { success: false, message: 'Không tìm thấy tu sĩ này.' }
  }

  try {
    const store = useNpcStore()
    const check = store.canInteract(npcId, 'spar')
    if (!check.allowed) {
      return {
        success: false,
        message: check.reason ?? 'Trong tháng này đã tỉ thí với tu sĩ này rồi, hãy đợi tháng sau.'
      }
    }
  } catch {
    // Pinia not active
  }

  const playerSnap = buildPlayerSnap()
  const scale = powerScale(npc.major)
  const npcSnap: CombatantSnap = {
    name: npc.name,
    icon: 'user',
    isPlayer: false,
    attack: mulN(scale, COMBAT_ATK_BASE),
    defense: mulN(scale, COMBAT_DEF_BASE),
    maxHp: mulN(scale, COMBAT_HP_BASE),
    speed: 1.0,
    mods: {
      critRate: npc.tierRank === 'gold' ? 0.15 : 0.05,
      damageBonus: npc.tierRank === 'gold' ? 0.2 : 0.05,
      damageReduction: 0.05
    },
    skills: []
  }

  const result = resolveCombat(playerSnap, npcSnap, rng, undefined, true)
  const favorDelta = result.win ? 3 : 2
  const outcomeText = result.win
    ? `Trải qua ${result.rounds} hiệp so tài, ngươi chiếm thế thượng phong. 【${npc.name}】thu kiếm bội phục: "Đạo hữu kiếm pháp cao thâm, ta tâm phục khẩu phục!"`
    : `Trải qua ${result.rounds} hiệp kịch chiến, 【${npc.name}】nhỉnh hơn nửa chiêu. Đối phương mỉm cười chắp tay: "Đạo hữu thần thông bất phàm, phen này luận kiếm thật sảng khoái!"`

  try {
    const store = useNpcStore()
    store.addFavor(npcId, favorDelta)
    store.recordInteraction(npcId, 'spar')
    useUiStore().toast(`Tỉ thí cùng ${npc.name}`, result.win ? 'rare' : 'info')
  } catch {
    // Pinia not active
  }

  return { success: true, message: outcomeText, favorDelta }
}

/**
 * Tặng quà cho NPC trong thế giới (1 lần/tháng).
 */
import { giftEquipmentToNpc } from './npcEquipmentService'
import { equipmentTemplate } from '@/data/equipment'
import { displayEquipName } from '@/ui/displayZhVi'
import { toNum, gn } from '@/utils/gnum'

export function giftToWorldNpc(
  npcId: string,
  giftType: 'pill' | 'herb' | 'ore' | 'stone' | 'equipment',
  itemIdOrGrade?: string | number
): NpcInteractionResult {
  const npc = getNpc(npcId)
  if (!npc) {
    return { success: false, message: 'Không tìm thấy tu sĩ này.' }
  }

  try {
    const store = useNpcStore()
    const check = store.canInteract(npcId, 'gift')
    if (!check.allowed) {
      return {
        success: false,
        message: check.reason ?? 'Trong tháng này đã tặng lễ vật cho tu sĩ này rồi, chớ nên quá dồn dập.'
      }
    }
  } catch {
    // Pinia not active
  }

  let itemName = ''
  let favorDelta = 3

  try {
    const inventory = useInventoryStore()
    const resources = useResourcesStore()

    if (giftType === 'stone') {
      const amount = typeof itemIdOrGrade === 'number' ? itemIdOrGrade : 500
      if (toNum(resources.spiritStone) < amount) {
        return { success: false, message: 'Linh thạch trong túi không đủ.' }
      }
      resources.spendStone(gn(amount))
      itemName = `${amount} linh thạch`
      favorDelta = 6
    } else if (giftType === 'equipment') {
      const equipUid = typeof itemIdOrGrade === 'string' ? itemIdOrGrade : ''
      const item = inventory.findItem(equipUid)
      if (!item) {
        return { success: false, message: 'Không tìm thấy trang bị này trong túi đồ.' }
      }
      const tpl = equipmentTemplate(item.templateId)
      const eqName = tpl ? displayEquipName(tpl.name) : item.templateId

      giftEquipmentToNpc(npcId, npc.name, item, 'gifted', {
        major: npc.major,
        sub: npc.sub,
        element: npc.element
      })

      inventory.removeEquipment(item.uid)
      itemName = `Pháp bảo【${eqName}】`
      favorDelta = 9
    } else if (giftType === 'pill') {
      const pillId = typeof itemIdOrGrade === 'string' ? itemIdOrGrade : Object.keys(inventory.pills)[0]
      if (!pillId || (inventory.pills[pillId] ?? 0) <= 0) {
        return { success: false, message: 'Trong túi đan không có đan dược này.' }
      }
      inventory.spendPill(pillId, 1)
      itemName = 'Linh đan'
      favorDelta = 5
    } else if (giftType === 'herb') {
      const grade = typeof itemIdOrGrade === 'number' ? (itemIdOrGrade as 1 | 2 | 3 | 4 | 5) : 1
      if (resources.herbOf(grade) <= 0) {
        return { success: false, message: 'Linh thảo phẩm cấp này đã hết trong giới chỉ.' }
      }
      resources.addHerb(grade, -1)
      itemName = `Linh thảo phẩm ${grade}`
      favorDelta = 4
    } else if (giftType === 'ore') {
      if (resources.ore <= 0) {
        return { success: false, message: 'Ngươi không còn linh khoáng quặng sắt.' }
      }
      resources.addSmall('ore', -1)
      itemName = 'Huyền thiết khoáng thạch'
      favorDelta = 4
    }
  } catch {
    itemName = 'Lễ vật'
  }

  const msg = `【${npc.name}】nhận lấy ${itemName}, ánh mắt chứa chan ý cảm kích: "Đạo hữu đối đãi chí tình chí nghĩa, phần ân tình này ta xin khắc ghi!"`

  try {
    const store = useNpcStore()
    store.addFavor(npcId, favorDelta)
    store.recordInteraction(npcId, 'gift')
    useUiStore().toast(`Tặng ${itemName} cho ${npc.name}`, 'rare')
  } catch {
    // Pinia not active
  }

  return { success: true, message: msg, favorDelta }
}

/**
 * Mời NPC kết thành Đạo Lữ đồng hành.
 * Yêu cầu:
 * - Đối phương là ứng viên Đạo Lữ (isDaoluCandidate = true)
 * - Khác giới tính với nhân vật chính
 * - Người chơi chưa có Đạo Lữ đang đồng hành
 * - Hảo cảm >= 60
 */
export function inviteNpcToDaolu(npcId: string): NpcInteractionResult {
  const npc = getNpc(npcId)
  if (!npc) {
    return { success: false, message: 'Không tìm thấy tu sĩ này.' }
  }

  const player = usePlayerStore()
  const npcStore = useNpcStore()
  const ui = useUiStore()

  if (player.bond && !player.bond.fallen && !player.bond.departed) {
    const msg = 'Ngươi đã có đạo lữ đồng hành, đạo tâm duy nhất, không thể kết thêm đạo lữ.'
    ui.toast(msg, 'warn')
    return { success: false, message: msg }
  }

  if (!npc.isDaoluCandidate) {
    const msg = `【${npc.name}】lắc đầu: "Ta một lòng cầu trường sinh, không màng chuyện kết duyên đạo lữ."`
    ui.toast(msg, 'warn')
    return { success: false, message: msg }
  }

  if (npc.gender === player.gender) {
    const msg = 'Hai người cùng giới tính, chí đồng đạo hợp nhưng không hợp duyên phận đạo lữ.'
    ui.toast(msg, 'warn')
    return { success: false, message: msg }
  }

  const curRel = npcStore.getNpcRelation(npcId)
  if (curRel === 'mentor') {
    return { success: false, message: `【${npc.name}】là sư phụ của ngươi, tôn sư trọng đạo, không thể kết duyên đạo lữ!` }
  }
  if (curRel === 'apprentice') {
    return { success: false, message: `【${npc.name}】là đồ đệ của ngươi, luân thường đạo lý không cho phép!` }
  }

  const favor = npcStore.getFavor(npcId)
  if (favor < 60) {
    const msg = `【${npc.name}】mỉm cười e ấp: "Tình cảm giữa hai ta chưa đủ sâu sắc (cần 60 điểm hảo cảm, hiện có ${favor}). Hãy cùng nhau đồng hành thêm một thời gian nữa."`
    ui.toast(msg, 'warn')
    return { success: false, message: msg }
  }

  player.setBond({
    daoluId: npc.id,
    stage: 'together',
    fate: Math.min(100, favor),
    trust: 60,
    accord: 50,
    shared: 0,
    metAt: Date.now(),
    fallen: false,
    departed: false,
    doneEvents: [],
    opportunities: 1,
    nextEventAt: Date.now() + 1000 * 3600 * 2,
    pendingEventId: null,
    lastKind: null,
    daoluMajor: npc.major,
    daoluSub: npc.sub,
    daoluExpPct: 0,
    daoluStatus: 'cultivating'
  })

  npcStore.setNpcRelation(npcId, 'daolu')
  npcStore.addFavor(npcId, 15)

  const msg = `【${npc.name}】má ửng hồng, khẽ gật đầu: "Được cùng đạo hữu kết duyên đồng hành, sinh tử không rời, là phúc phận kiếp này của ta!"`
  ui.toast(`Cùng ${npc.name} kết thành Đạo Lữ đồng hành!`, 'rare')

  return { success: true, message: msg, favorDelta: 15 }
}

/**
 * Bái NPC làm Sư Phụ.
 * Yêu cầu:
 * - Cảnh giới NPC >= Cảnh giới nhân vật chính
 * - Chưa có sư phụ trong quan hệ NPC
 * - Hảo cảm >= 40
 */
export function inviteNpcToMentor(npcId: string): NpcInteractionResult {
  const npc = getNpc(npcId)
  if (!npc) {
    return { success: false, message: 'Không tìm thấy tu sĩ này.' }
  }

  const player = usePlayerStore()
  const npcStore = useNpcStore()
  const ui = useUiStore()

  const curRel = npcStore.getNpcRelation(npcId)
  if (curRel === 'mentor') {
    return { success: false, message: `【${npc.name}】vốn đã là sư phụ của ngươi rồi.` }
  }
  if (curRel === 'daolu') {
    return { success: false, message: `【${npc.name}】đã là đạo lữ của ngươi, không thể bái sư!` }
  }
  if (curRel === 'apprentice') {
    return { success: false, message: `【${npc.name}】là đồ đệ của ngươi, sao có thể đảo lộn bái làm sư phụ!` }
  }

  // Kiểm tra đã có Sư Phụ khác chưa
  const hasOtherMentor = Object.entries(npcStore.npcRelations).some(([id, r]) => r === 'mentor' && id !== npcId)
  if (hasOtherMentor) {
    const msg = 'Ngươi đã bái một vị sư phụ rồi, tôn sư trọng đạo, không thể bái thêm vị sư phụ khác.'
    ui.toast(msg, 'warn')
    return { success: false, message: msg }
  }

  if (npc.major < player.major) {
    const msg = `【${npc.name}】chắp tay cười khổ: "Tu vi của ta còn chưa bằng ngươi, làm sao dám nhận ngươi làm đệ tử!"`
    ui.toast(msg, 'warn')
    return { success: false, message: msg }
  }

  const favor = npcStore.getFavor(npcId)
  if (favor < 40) {
    const msg = `【${npc.name}】trầm ngâm: "Duyên phận thầy trò cần được bồi đắp thêm (cần 40 điểm hảo cảm, hiện có ${favor}). Hãy đàm đạo thêm."`
    ui.toast(msg, 'warn')
    return { success: false, message: msg }
  }

  npcStore.setNpcRelation(npcId, 'mentor')
  npcStore.addFavor(npcId, 10)

  const msg = `【${npc.name}】hài lòng đỡ ngươi dậy: "Được lắm! Từ nay ngươi là đệ tử chân truyền của ta, ta ắt sẽ dốc lòng truyền thụ đạo pháp!"`
  ui.toast(`Đã bái ${npc.name} làm Sư Phụ!`, 'rare')

  return { success: true, message: msg, favorDelta: 10 }
}

/**
 * Thu nhận NPC làm Đồ Đệ.
 * Yêu cầu:
 * - Cảnh giới nhân vật chính > Cảnh giới NPC
 * - Hảo cảm >= 30
 */
export function inviteNpcToApprentice(npcId: string): NpcInteractionResult {
  const npc = getNpc(npcId)
  if (!npc) {
    return { success: false, message: 'Không tìm thấy tu sĩ này.' }
  }

  const player = usePlayerStore()
  const npcStore = useNpcStore()
  const ui = useUiStore()

  const curRel = npcStore.getNpcRelation(npcId)
  if (curRel === 'apprentice') {
    return { success: false, message: `【${npc.name}】vốn đã là đồ đệ của ngươi rồi.` }
  }
  if (curRel === 'mentor') {
    return { success: false, message: `【${npc.name}】là sư phụ của ngươi, đại nghịch bất đạo nếu thu làm đồ đệ!` }
  }
  if (curRel === 'daolu') {
    return { success: false, message: `【${npc.name}】đã là đạo lữ của ngươi, không thể thu làm đồ đệ!` }
  }

  if (player.major <= npc.major) {
    const msg = `【${npc.name}】lắc đầu: "Cảnh giới của ngươi chưa vượt hơn ta, sao có thể chỉ điểm ta tu hành!"`
    ui.toast(msg, 'warn')
    return { success: false, message: msg }
  }

  const favor = npcStore.getFavor(npcId)
  if (favor < 30) {
    const msg = `【${npc.name}】chần chừ: "Ngươi và ta quen biết chưa lâu (cần 30 điểm hảo cảm, hiện có ${favor}), ta chưa thể yên tâm bái ngươi làm thầy."`
    ui.toast(msg, 'warn')
    return { success: false, message: msg }
  }

  npcStore.setNpcRelation(npcId, 'apprentice')
  npcStore.addFavor(npcId, 10)

  const msg = `【${npc.name}】cung kính quỳ lạy: "Đồ nhi bái kiến sư phụ! Nguyện theo sư phụ chuyên tâm tu học đại đạo, không phụ kỳ vọng!"`
  ui.toast(`Đã thu nhận ${npc.name} làm Đồ Đệ!`, 'rare')

  return { success: true, message: msg, favorDelta: 10 }
}

/**
 * Kết bái Huynh Đệ cùng NPC.
 * Yêu cầu:
 * - Chưa có quan hệ đối lập (Đạo Lữ / Sư Đồ)
 * - Hảo cảm >= 40
 */
export function inviteNpcToSibling(npcId: string): NpcInteractionResult {
  const npc = getNpc(npcId)
  if (!npc) {
    return { success: false, message: 'Không tìm thấy tu sĩ này.' }
  }

  const npcStore = useNpcStore()
  const ui = useUiStore()

  const curRel = npcStore.getNpcRelation(npcId)
  if (curRel === 'sibling') {
    return { success: false, message: `Hai người đã kết bái huynh đệ rồi.` }
  }
  if (curRel === 'daolu') {
    return { success: false, message: `【${npc.name}】đã là đạo lữ của ngươi, tình cảm phu thê sâu đậm, không cần kết huynh đệ.` }
  }
  if (curRel === 'mentor' || curRel === 'apprentice') {
    return { success: false, message: `Quan hệ thầy trò tôn nghiêm, không thể kết bái huynh đệ.` }
  }

  const favor = npcStore.getFavor(npcId)
  if (favor < 40) {
    const msg = `【${npc.name}】cười nói: "Tri âm tri kỷ khó tìm, hai ta cần hiểu nhau nhiều hơn (cần 40 điểm hảo cảm, hiện có ${favor})."`
    ui.toast(msg, 'warn')
    return { success: false, message: msg }
  }

  npcStore.setNpcRelation(npcId, 'sibling')
  npcStore.addFavor(npcId, 10)

  const msg = `【${npc.name}】rót đầy chén rượu, hào sảng cười lớn: "Tốt! Từ nay về sau ngươi và ta là sinh tử chi giao, đồng cam cộng khổ, hoạn nạn có nhau!"`
  ui.toast(`Đã kết bái Huynh Đệ cùng ${npc.name}!`, 'rare')

  return { success: true, message: msg, favorDelta: 10 }
}
