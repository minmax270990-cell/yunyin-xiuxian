/**
 * Dịch Vụ Quản Lý & Tự Động Thay Đổi Trang Bị NPC (NPC Equipment Service)
 *
 * Quản lý trang bị cho mọi đối tượng NPC trong thế giới:
 * - Đệ tử Tông môn (`DiscipleData`)
 * - Đạo lữ (`BondState`)
 * - Quần thể NPC thế giới (`WorldNpcDef` / `npcStore`)
 *
 * Tính năng chính:
 * 1. Khảo sát trang bị trên 10 ô trang bị chuẩn mực của game.
 * 2. Tính toán chỉ số thực tế trước và sau khi trang bị.
 * 3. NPC tự động đánh giá và thay trang bị mỗi tháng từ túi đồ cá nhân khi có đồ tốt hơn.
 * 4. Người chơi tặng / ban thưởng trang bị: NPC đánh giá ngay lập tức và chủ động mặc nếu phù hợp.
 */
import type { ElementId, EquipmentInstance, EquipSlot, QualityId } from '@/types'
import { EQUIP_SLOTS, equipmentTemplate } from '@/data/equipment'
import { qualityDef } from '@/data/qualities'
import { resolveEquipStats } from './equipGen'
import { baseCombatStats } from './formulas'
import { toNum } from '@/utils/gnum'
import { useApprenticeStore } from '@/stores/apprentice'
import { usePlayerStore } from '@/stores/player'
import { useNpcStore } from '@/stores/npc'
import { displayEquipName } from '@/ui/displayZhVi'
import { maxTierForMajor } from '@/data/regions'
import { daoluDef } from '@/data/daolu'
import { worldNpcDef } from '@/data/npc'

export const VI_SLOT_NAMES: Record<EquipSlot, string> = {
  weapon: 'Vũ Khí',
  head: 'Mũ Giáp',
  body: 'Y Bào',
  wrist: 'Hộ Uyển',
  belt: 'Yêu Đái',
  boots: 'Hài Lý',
  necklace: 'Hạng Liên',
  ring: 'Giới Chỉ',
  artifact: 'Pháp Bảo',
  talisman: 'Linh Phù'
}

export const ORIGIN_LABELS: Record<string, string> = {
  found: 'Tự tìm được',
  crafted: 'Tự chế tạo',
  gifted: 'Được tặng',
  rewarded: 'Được ban thưởng',
  vault: 'Kho tông môn'
}

export interface NpcEquipItemDetail {
  slot: EquipSlot
  slotName: string
  item: EquipmentInstance | null
  templateName?: string
  quality?: QualityId
  qualityName?: string
  tier?: number
  level?: number
  icon?: string
  desc?: string
  flats?: { attack: number; defense: number; maxHp: number }
  mods?: Record<string, number>
  affixTexts?: string[]
  originText?: string
  combatScore: number
}

export interface NpcEquipmentOverview {
  equippedSlots: NpcEquipItemDetail[]
  inventoryItems: NpcEquipItemDetail[]
  statsWithoutEquip: {
    atk: number
    def: number
    hp: number
    speed: number
    critRate: number
  }
  statsWithEquip: {
    atk: number
    def: number
    hp: number
    speed: number
    critRate: number
  }
  totalEquipPowerBonus: number
}

/**
 * Tính điểm thực lực chiến đấu của một món trang bị đối với NPC
 */
export function calcEquipCombatScore(item: EquipmentInstance, element?: ElementId): number {
  const tpl = equipmentTemplate(item.templateId)
  if (!tpl) return 0

  const resolved = resolveEquipStats(item)
  const atk = toNum(resolved.flats.attack)
  const def = toNum(resolved.flats.defense)
  const hp = toNum(resolved.flats.maxHp)

  const q = qualityDef(item.quality)
  const qMult = q ? q.mult : 1.0

  let score = (atk * 1.5 + def * 1.2 + hp * 0.1) * qMult * (1 + (item.level || 0) * 0.15)
  score += (item.tier || 1) * 60

  // Thưởng thêm theo số lượng từ điều và tương thích ngũ hành
  if (item.affixes && item.affixes.length > 0) {
    score += item.affixes.length * 35
  }

  // Tương thích ngũ hành nếu có từ điều nguyên tố
  if (element && item.affixes) {
    const hasSynergy = item.affixes.some(a => a.id.toLowerCase().includes(element))
    if (hasSynergy) score += 50
  }

  return Math.round(score)
}

/**
 * Lấy dữ liệu trang bị của bất kỳ đối tượng NPC nào trong game
 */
export function getNpcEquipments(npcId: string): { equipped: EquipmentInstance[]; inventory: EquipmentInstance[] } {
  try {
    // 1. Kiểm tra nếu là đệ tử Tông môn
    const sect = useApprenticeStore()
    const disciple = sect.disciples.find(d => d.id === npcId)
    if (disciple) {
      return {
        equipped: disciple.equippedItems ? [...disciple.equippedItems] : [],
        inventory: disciple.inventoryItems ? [...disciple.inventoryItems] : []
      }
    }

    // 2. Kiểm tra nếu là Đạo lữ
    const player = usePlayerStore()
    if (player.bond && player.bond.daoluId === npcId) {
      return {
        equipped: player.bond.daoluEquippedItems ? [...player.bond.daoluEquippedItems] : [],
        inventory: player.bond.daoluInventoryItems ? [...player.bond.daoluInventoryItems] : []
      }
    }

    // 3. Quần thể NPC thế giới
    const npcStore = useNpcStore()
    const data = npcStore.getNpcEquipmentData(npcId)
    return {
      equipped: [...data.equipped],
      inventory: [...data.inventory]
    }
  } catch {
    return { equipped: [], inventory: [] }
  }
}

/**
 * Ghi lưu dữ liệu trang bị cho NPC tương ứng
 */
export function setNpcEquipments(
  npcId: string,
  data: { equipped: EquipmentInstance[]; inventory: EquipmentInstance[] }
): void {
  try {
    // 1. Đệ tử Tông môn
    const sect = useApprenticeStore()
    const discipleIdx = sect.disciples.findIndex(d => d.id === npcId)
    if (discipleIdx >= 0) {
      sect.disciples[discipleIdx]!.equippedItems = [...data.equipped]
      sect.disciples[discipleIdx]!.inventoryItems = [...data.inventory]
      return
    }

    // 2. Đạo lữ
    const player = usePlayerStore()
    if (player.bond && player.bond.daoluId === npcId) {
      player.setBond({
        ...player.bond,
        daoluEquippedItems: [...data.equipped],
        daoluInventoryItems: [...data.inventory]
      })
      return
    }

    // 3. Quần thể NPC thế giới
    const npcStore = useNpcStore()
    npcStore.setNpcEquipmentData(npcId, data)
  } catch {
    // Pinia not active
  }
}

/**
 * Xây dựng chi tiết một món trang bị để hiển thị
 */
export function buildEquipItemDetail(item: EquipmentInstance | null, slot: EquipSlot, element?: ElementId): NpcEquipItemDetail {
  const slotName = VI_SLOT_NAMES[slot] || slot
  if (!item) {
    return {
      slot,
      slotName,
      item: null,
      combatScore: 0
    }
  }

  const tpl = equipmentTemplate(item.templateId)
  const q = qualityDef(item.quality)
  const resolved = resolveEquipStats(item)

  const affixTexts = resolved.affixLines.map(line => `${line.name}: +${line.value}`)
  const originText = ORIGIN_LABELS[item.origin || 'found'] || 'Tự tìm được'

  return {
    slot,
    slotName,
    item,
    templateName: tpl ? displayEquipName(tpl.name) : item.templateId,
    quality: item.quality,
    qualityName: q?.name || item.quality,
    tier: item.tier,
    level: item.level,
    icon: tpl?.icon,
    desc: tpl?.desc,
    flats: {
      attack: toNum(resolved.flats.attack),
      defense: toNum(resolved.flats.defense),
      maxHp: toNum(resolved.flats.maxHp)
    },
    mods: resolved.mods as Record<string, number>,
    affixTexts,
    originText,
    combatScore: calcEquipCombatScore(item, element)
  }
}

/**
 * Tạo tổng quan trang bị toàn diện cho NPC (Hiển thị 10 ô trang bị, túi đồ và so sánh chỉ số)
 */
export function buildNpcEquipmentOverview(
  npcId: string,
  major: number,
  sub: number = 0,
  element?: ElementId
): NpcEquipmentOverview {
  const { equipped, inventory } = getNpcEquipments(npcId)

  // 1. Khởi tạo chỉ số cơ bản khi chưa có trang bị
  const baseStatsG = baseCombatStats(major, sub)
  const baseAtk = toNum(baseStatsG.attack)
  const baseDef = toNum(baseStatsG.defense)
  const baseHp = toNum(baseStatsG.maxHp)
  const baseSpeed = Math.round(100 + major * 15 + sub * 2)
  const baseCrit = 5

  const statsWithoutEquip = {
    atk: baseAtk,
    def: baseDef,
    hp: baseHp,
    speed: baseSpeed,
    critRate: baseCrit
  }

  // 2. Bản đồ trang bị trên 10 ô
  const equippedMap = new Map<EquipSlot, EquipmentInstance>()
  for (const eq of equipped) {
    const tpl = equipmentTemplate(eq.templateId)
    if (tpl) equippedMap.set(tpl.slot, eq)
  }

  let totalBonusAtk = 0
  let totalBonusDef = 0
  let totalBonusHp = 0
  let totalBonusSpeed = 0
  let totalBonusCrit = 0

  const equippedSlots: NpcEquipItemDetail[] = EQUIP_SLOTS.map(slot => {
    const item = equippedMap.get(slot) || null
    const detail = buildEquipItemDetail(item, slot, element)

    if (item && detail.flats) {
      totalBonusAtk += detail.flats.attack
      totalBonusDef += detail.flats.defense
      totalBonusHp += detail.flats.maxHp

      if (detail.mods) {
        if (detail.mods['critRate']) totalBonusCrit += detail.mods['critRate']
        if (detail.mods['speed']) totalBonusSpeed += detail.mods['speed']
      }
    }

    return detail
  })

  const statsWithEquip = {
    atk: baseAtk + totalBonusAtk,
    def: baseDef + totalBonusDef,
    hp: baseHp + totalBonusHp,
    speed: baseSpeed + totalBonusSpeed,
    critRate: baseCrit + totalBonusCrit
  }

  // Tính lực chiến gia tăng thuần túy từ trang bị
  const totalEquipPowerBonus = Math.round(totalBonusAtk * 1.5 + totalBonusDef * 1.2 + totalBonusHp * 0.1 + totalBonusSpeed * 0.5)

  // 3. Danh sách các món sở hữu trong túi nhưng chưa mặc
  const inventoryItems: NpcEquipItemDetail[] = inventory.map(item => {
    const tpl = equipmentTemplate(item.templateId)
    const slot = tpl ? tpl.slot : 'weapon'
    return buildEquipItemDetail(item, slot, element)
  })

  return {
    equippedSlots,
    inventoryItems,
    statsWithoutEquip,
    statsWithEquip,
    totalEquipPowerBonus
  }
}

/**
 * Tự động tra cứu cảnh giới và hệ thực tế của bất kỳ NPC nào (Đệ tử, Đạo lữ, NPC thế giới)
 */
export function resolveNpcTrueStats(
  npcId: string,
  passedStats?: { major: number; sub?: number; element?: ElementId }
): { major: number; sub: number; element?: ElementId } {
  try {
    // 1. Kiểm tra nếu là đệ tử Tông môn
    const sect = useApprenticeStore()
    const disciple = sect.disciples.find(d => d.id === npcId)
    if (disciple) {
      return {
        major: disciple.major,
        sub: disciple.sub,
        element: disciple.element ?? passedStats?.element
      }
    }

    // 2. Kiểm tra nếu là Đạo lữ
    const player = usePlayerStore()
    if (player.bond && player.bond.daoluId === npcId) {
      const npcStore = useNpcStore()
      const cult = npcStore.getNpcCultivation(npcId)
      const def = daoluDef(npcId)
      return {
        major: player.bond.daoluMajor ?? cult?.major ?? def?.startMajor ?? passedStats?.major ?? 1,
        sub: player.bond.daoluSub ?? cult?.sub ?? passedStats?.sub ?? 0,
        element: def?.element ?? passedStats?.element
      }
    }

    // 3. Quần thể NPC thế giới
    const npcStore = useNpcStore()
    const cult = npcStore.getNpcCultivation(npcId)
    const worldNpc = npcStore.findNpc?.(npcId) ?? worldNpcDef(npcId)
    return {
      major: cult?.major ?? worldNpc?.major ?? passedStats?.major ?? 1,
      sub: cult?.sub ?? worldNpc?.sub ?? passedStats?.sub ?? 0,
      element: (worldNpc?.element as ElementId) ?? passedStats?.element
    }
  } catch {
    return {
      major: passedStats?.major ?? 1,
      sub: passedStats?.sub ?? 0,
      element: passedStats?.element
    }
  }
}

/**
 * NPC tự đánh giá và thay đổi trang bị từ túi đồ cá nhân:
 * So sánh từng món trong túi đồ với trang bị cùng vị trí đang mặc;
 * Nếu món mới tốt hơn và phù hợp thực tế, thay thế và đưa trang bị cũ vào túi đồ.
 */
export function evaluateAndAutoEquipNpc(
  npcId: string,
  stats?: { major: number; sub?: number; element?: ElementId }
): {
  changed: boolean
  message?: string
  oldItem?: EquipmentInstance
  newItem?: EquipmentInstance
} {
  const trueStats = resolveNpcTrueStats(npcId, stats)
  const { equipped, inventory } = getNpcEquipments(npcId)
  if (inventory.length === 0) {
    return { changed: false }
  }

  const maxAllowedTier = Math.max(4, maxTierForMajor(trueStats.major) + 2)
  const equippedSlots = new Map<EquipSlot, { item: EquipmentInstance; idx: number }>()
  equipped.forEach((eq, idx) => {
    const tpl = equipmentTemplate(eq.templateId)
    if (tpl) equippedSlots.set(tpl.slot, { item: eq, idx })
  })

  let bestInventoryIdx = -1
  let bestSlot: EquipSlot | null = null
  let maxScoreDiff = 0
  let itemToEquip: EquipmentInstance | null = null
  let replacedItem: EquipmentInstance | null = null

  for (let i = 0; i < inventory.length; i++) {
    const invItem = inventory[i]!
    const tpl = equipmentTemplate(invItem.templateId)
    if (!tpl) continue

    // Chỉ trang bị nếu phẩm cấp/tier không vượt quá xa cảnh giới hiện tại
    if (invItem.tier > maxAllowedTier) continue

    const newScore = calcEquipCombatScore(invItem, trueStats.element)
    const currentEquipInfo = equippedSlots.get(tpl.slot)

    if (!currentEquipInfo) {
      // Vị trí còn trống: Mặc ngay lập tức!
      if (newScore > maxScoreDiff || bestInventoryIdx === -1) {
        maxScoreDiff = newScore
        bestInventoryIdx = i
        bestSlot = tpl.slot
        itemToEquip = invItem
        replacedItem = null
      }
    } else {
      // Đã có trang bị: Món mới có điểm chiến lực cao hơn trang bị hiện tại
      const curScore = calcEquipCombatScore(currentEquipInfo.item, trueStats.element)
      const diff = newScore - curScore
      if (diff > 0 && diff > maxScoreDiff) {
        maxScoreDiff = diff
        bestInventoryIdx = i
        bestSlot = tpl.slot
        itemToEquip = invItem
        replacedItem = currentEquipInfo.item
      }
    }
  }

  if (bestInventoryIdx >= 0 && itemToEquip && bestSlot) {
    // Thực hiện tráo đổi trang bị:
    // 1. Rút món mới khỏi túi đồ
    const newInv = [...inventory]
    newInv.splice(bestInventoryIdx, 1)

    // 2. Cập nhật danh sách trang bị trên thân
    const newEquipped = [...equipped]
    const curEquipInfo = equippedSlots.get(bestSlot)
    if (curEquipInfo) {
      newEquipped.splice(curEquipInfo.idx, 1)
      // Món cũ được đưa trở lại túi đồ an toàn, không bị xóa
      newInv.push(curEquipInfo.item)
    }
    newEquipped.push(itemToEquip)

    setNpcEquipments(npcId, { equipped: newEquipped, inventory: newInv })

    const tplNew = equipmentTemplate(itemToEquip.templateId)
    const newName = tplNew ? displayEquipName(tplNew.name) : itemToEquip.templateId
    const slotName = VI_SLOT_NAMES[bestSlot] || bestSlot
    const msg = replacedItem
      ? `Đã thay thế【${slotName}】bằng【${newName}】, chiến lực tăng ${maxScoreDiff} điểm!`
      : `Đã trang bị【${newName}】vào vị trí【${slotName}】, chiến lực tăng ${maxScoreDiff} điểm!`

    return {
      changed: true,
      message: msg,
      oldItem: replacedItem ?? undefined,
      newItem: itemToEquip
    }
  }

  return { changed: false }
}

/**
 * Tặng hoặc ban thưởng trang bị cho NPC:
 * Đưa trang bị vào túi đồ NPC với xuất xứ rõ ràng, sau đó lập tức kích hoạt đánh giá để NPC mặc ngay nếu tốt hơn.
 */
export function giftEquipmentToNpc(
  npcId: string,
  npcName: string,
  equipment: EquipmentInstance,
  origin: 'gifted' | 'rewarded' = 'gifted',
  stats?: { major: number; sub?: number; element?: ElementId }
): {
  success: boolean
  equippedImmediately: boolean
  message: string
  replacedItem?: EquipmentInstance
} {
  const itemClone: EquipmentInstance = {
    ...equipment,
    origin
  }

  const { equipped, inventory } = getNpcEquipments(npcId)
  const trueStats = resolveNpcTrueStats(npcId, stats)
  const maxAllowedTier = Math.max(4, maxTierForMajor(trueStats.major) + 2)

  const tpl = equipmentTemplate(itemClone.templateId)
  const itemName = tpl ? displayEquipName(tpl.name) : itemClone.templateId

  let equippedImmediately = false
  let replacedItem: EquipmentInstance | undefined

  if (tpl && itemClone.tier <= maxAllowedTier) {
    const curEquipSlot = equipped.find(e => {
      const t = equipmentTemplate(e.templateId)
      return t?.slot === tpl.slot
    })

    const newScore = calcEquipCombatScore(itemClone, trueStats.element)
    const curScore = curEquipSlot ? calcEquipCombatScore(curEquipSlot, trueStats.element) : -1

    // Nếu ô còn trống HOẶC trang bị mới có điểm chiến lực cao hơn trang bị hiện tại
    if (!curEquipSlot || newScore > curScore) {
      const newEquipped = equipped.filter(e => e.uid !== curEquipSlot?.uid)
      newEquipped.push(itemClone)

      const newInventory = [...inventory]
      if (curEquipSlot) {
        newInventory.push(curEquipSlot)
        replacedItem = curEquipSlot
      }

      setNpcEquipments(npcId, { equipped: newEquipped, inventory: newInventory })
      equippedImmediately = true
    }
  }

  if (!equippedImmediately) {
    // Nếu chưa thể mặc trực tiếp, đưa vào hành trang túi đồ
    const newInventory = [...inventory, itemClone]
    setNpcEquipments(npcId, { equipped, inventory: newInventory })

    // Kích hoạt đánh giá tổng thể hành trang
    const autoRes = evaluateAndAutoEquipNpc(npcId, trueStats)
    if (autoRes.changed && autoRes.newItem?.uid === itemClone.uid) {
      equippedImmediately = true
      replacedItem = autoRes.oldItem
    }
  }

  if (equippedImmediately) {
    return {
      success: true,
      equippedImmediately: true,
      message: `【${npcName}】vô cùng kinh hỉ nhận lấy【${itemName}】và lập tức trang bị lên thân, chiến lực tăng cao!`,
      replacedItem
    }
  }

  return {
    success: true,
    equippedImmediately: false,
    message: `【${npcName}】cung kính nhận lấy【${itemName}】, cẩn thận cất giữ vào túi càn khôn chờ thời cơ thích hợp sử dụng.`
  }
}
