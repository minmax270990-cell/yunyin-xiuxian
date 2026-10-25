/**
 * Dịch Vụ Quản Lý Túi Đồ & Hành Trang Cá Nhân NPC (NPC Bag Service)
 *
 * Quản lý kho đồ và túi trữ vật của mọi NPC:
 * 1. Đệ tử Tông môn (`DiscipleData`)
 * 2. Đạo lữ (`BondState`)
 * 3. Quần thể NPC thế giới (`npcStore.npcEquipments`)
 *
 * Tính năng chính:
 * - Đệ tử tự đi lịch luyện ở các bản đồ có cấp độ tương ứng để tự kiếm linh thạch, đồ cấp thấp để mặc.
 * - NPC tự động phục dụng đan dược, dùng linh thạch trong túi để tu luyện gia tăng thực lực.
 * - Người chơi tương tác xin đồ (dựa theo độ hảo cảm) hoặc trộm đồ (nếu bị bắt quả tang sẽ bị giảm độ hảo cảm).
 */
import type { EquipmentInstance, QualityId } from '@/types'
import { equipmentTemplate } from '@/data/equipment'
import { qualityDef } from '@/data/qualities'
import { pillDef } from '@/data/pills'
import { REGIONS } from '@/data/regions'
import { herbGradeOfMajor } from '@/data/herbGrades'
import { generateEquipment, resolveEquipStats } from './equipGen'
import { calcEquipCombatScore, type NpcEquipItemDetail, VI_SLOT_NAMES, ORIGIN_LABELS } from './npcEquipmentService'
import { nextSectUid } from './sectService'
import { gameMonthToCalendar, type SectHistoryEntry } from '@/data/sect'
import { rng, type RandomService } from '@/utils/random'
import { gn, toNum } from '@/utils/gnum'
import { useApprenticeStore } from '@/stores/apprentice'
import { usePlayerStore } from '@/stores/player'
import { useNpcStore } from '@/stores/npc'
import { useInventoryStore } from '@/stores/inventory'
import { useResourcesStore } from '@/stores/resources'
import { displayEquipName, displayPillName } from '@/ui/displayZhVi'
import type { DiscipleData } from '@/data/sect'

export interface NpcBagData {
  equipped: EquipmentInstance[]
  inventory: EquipmentInstance[]
  pills: Record<string, number>
  stones: number
  materials: { ore: number; herb: number }
}

export interface NpcBagItem {
  id: string
  name: string
  type: 'equipment' | 'pill' | 'material' | 'stone'
  count: number
  tier?: number
  quality?: QualityId
  qualityName?: string
  icon?: string
  desc?: string
  valueScore: number
  // Các khóa liên kết dùng cho thao tác chuyển giao vật phẩm
  equipmentUid?: string
  pillId?: string
  materialType?: 'ore' | 'herb'
}

export interface NpcBagOverview {
  stones: number
  equipments: NpcEquipItemDetail[]
  pills: { id: string; name: string; count: number; desc?: string; grade?: number }[]
  materials: { type: 'ore' | 'herb'; name: string; count: number }[]
  items: NpcBagItem[]
}

/**
 * Lấy dữ liệu túi đồ đầy đủ của bất kỳ đối tượng NPC nào trong game
 */
export function getNpcBag(npcId: string): NpcBagData {
  try {
    // 1. Kiểm tra nếu là đệ tử Tông môn
    const sect = useApprenticeStore()
    const disciple = sect.disciples.find(d => d.id === npcId)
    if (disciple) {
      return {
        equipped: disciple.equippedItems ? [...disciple.equippedItems] : [],
        inventory: disciple.inventoryItems ? [...disciple.inventoryItems] : [],
        pills: disciple.bagPills ? { ...disciple.bagPills } : {},
        stones: disciple.bagStones ?? 0,
        materials: {
          ore: disciple.bagMaterials?.ore ?? 0,
          herb: disciple.bagMaterials?.herb ?? 0
        }
      }
    }

    // 2. Kiểm tra nếu là Đạo lữ
    const player = usePlayerStore()
    if (player.bond && player.bond.daoluId === npcId) {
      return {
        equipped: player.bond.daoluEquippedItems ? [...player.bond.daoluEquippedItems] : [],
        inventory: player.bond.daoluInventoryItems ? [...player.bond.daoluInventoryItems] : [],
        pills: (player.bond as unknown as Record<string, unknown>).daoluPills
          ? { ...((player.bond as unknown as Record<string, unknown>).daoluPills as Record<string, number>) }
          : {},
        stones: typeof (player.bond as unknown as Record<string, unknown>).daoluStones === 'number'
          ? (player.bond as unknown as Record<string, unknown>).daoluStones as number
          : 0,
        materials: { ore: 0, herb: 0 }
      }
    }

    // 3. Quần thể NPC thế giới
    const npcStore = useNpcStore()
    const data = npcStore.getNpcEquipmentData(npcId)
    return {
      equipped: [...data.equipped],
      inventory: [...data.inventory],
      pills: data.pills ? { ...data.pills } : {},
      stones: data.stones ?? 0,
      materials: {
        ore: data.materials?.ore ?? 0,
        herb: data.materials?.herb ?? 0
      }
    }
  } catch {
    return {
      equipped: [],
      inventory: [],
      pills: {},
      stones: 0,
      materials: { ore: 0, herb: 0 }
    }
  }
}

/**
 * Cập nhật dữ liệu túi đồ của NPC
 */
export function setNpcBag(npcId: string, bag: NpcBagData): void {
  try {
    // 1. Kiểm tra nếu là đệ tử Tông môn
    const sect = useApprenticeStore()
    const disciple = sect.disciples.find(d => d.id === npcId)
    if (disciple) {
      disciple.equippedItems = [...bag.equipped]
      disciple.inventoryItems = [...bag.inventory]
      disciple.bagPills = { ...bag.pills }
      disciple.bagStones = bag.stones
      disciple.bagMaterials = { ...bag.materials }
      return
    }

    // 2. Kiểm tra nếu là Đạo lữ
    const player = usePlayerStore()
    if (player.bond && player.bond.daoluId === npcId) {
      player.bond.daoluEquippedItems = [...bag.equipped]
      player.bond.daoluInventoryItems = [...bag.inventory];
      (player.bond as unknown as Record<string, unknown>).daoluPills = { ...bag.pills };
      (player.bond as unknown as Record<string, unknown>).daoluStones = bag.stones
      return
    }

    // 3. Quần thể NPC thế giới
    const npcStore = useNpcStore()
    npcStore.setNpcEquipmentData(npcId, {
      equipped: [...bag.equipped],
      inventory: [...bag.inventory],
      pills: { ...bag.pills },
      stones: bag.stones,
      materials: { ...bag.materials }
    })
  } catch {
    // Dự phòng ngoại lệ lưu trữ
  }
}

/**
 * Xây dựng báo cáo chi tiết về túi đồ của NPC để hiển thị giao diện
 */
export function buildNpcBagOverview(npcId: string, major = 0): NpcBagOverview {
  const bag = getNpcBag(npcId)

  // Nếu túi đồ hoàn toàn trống rỗng, khởi tạo một lượng vật phẩm cơ bản theo cảnh giới
  if (bag.stones === 0 && Object.keys(bag.pills).length === 0 && bag.materials.ore === 0 && bag.materials.herb === 0 && bag.inventory.length === 0) {
    bag.stones = (major + 1) * 200 + 150
    if (major === 0) {
      bag.pills['p_jvqisan'] = 2
    } else if (major === 1) {
      bag.pills['p_huiling'] = 2
      bag.pills['p_jvqisan'] = 1
    } else {
      bag.pills['p_wudaotea'] = 1
      bag.pills['p_huiling'] = 2
    }
    bag.materials = { ore: 2, herb: 5 }
    setNpcBag(npcId, bag)
  }

  // 1. Phân giải trang bị trong túi (chưa mặc)
  const equipments: NpcEquipItemDetail[] = bag.inventory.map(item => {
    const tpl = equipmentTemplate(item.templateId)
    const slot = tpl ? tpl.slot : 'weapon'
    const q = qualityDef(item.quality)
    const resolved = resolveEquipStats(item)
    const originText = ORIGIN_LABELS[item.origin ?? 'found'] ?? 'Lịch luyện'

    const flats = {
      attack: toNum(resolved.flats.attack),
      defense: toNum(resolved.flats.defense),
      maxHp: toNum(resolved.flats.maxHp)
    }

    const combatScore = calcEquipCombatScore(item)

    return {
      slot,
      slotName: VI_SLOT_NAMES[slot] ?? slot,
      item,
      templateName: tpl?.name ? displayEquipName(tpl.name) : item.templateId,
      quality: item.quality,
      qualityName: q ? q.name : 'Phổ thông',
      tier: item.tier ?? 1,
      level: item.level ?? 0,
      icon: tpl?.icon ?? 'shield',
      desc: tpl?.desc,
      flats,
      mods: resolved.mods,
      originText,
      combatScore
    }
  })

  // 2. Phân giải đan dược
  const pills: { id: string; name: string; count: number; desc?: string; grade?: number }[] = []
  for (const [pId, count] of Object.entries(bag.pills)) {
    if (count <= 0) continue
    const def = pillDef(pId)
    pills.push({
      id: pId,
      name: def?.name ? displayPillName(def.name) : pId,
      count,
      desc: def?.desc,
      grade: def ? herbGradeOfMajor(def.minRealm) : 1
    })
  }

  // 3. Phân giải nguyên liệu
  const materials: { type: 'ore' | 'herb'; name: string; count: number }[] = []
  if (bag.materials.herb > 0) {
    materials.push({ type: 'herb', name: 'Linh Thảo', count: bag.materials.herb })
  }
  if (bag.materials.ore > 0) {
    materials.push({ type: 'ore', name: 'Huyền Thiết Khoáng', count: bag.materials.ore })
  }

  // 4. Danh sách thống nhất các vật phẩm người chơi có thể xin/trộm
  const items: NpcBagItem[] = []

  // Thêm linh thạch vào danh sách có thể tương tác
  if (bag.stones > 0) {
    items.push({
      id: `stone_${npcId}`,
      name: `${bag.stones.toLocaleString()} Linh Thạch`,
      type: 'stone',
      count: bag.stones,
      icon: 'coins',
      desc: 'Linh thạch tu hành cá nhân của tu sĩ tích lũy được',
      valueScore: Math.min(200, Math.floor(bag.stones / 20))
    })
  }

  // Thêm đan dược
  for (const p of pills) {
    items.push({
      id: `pill_${p.id}`,
      name: p.name,
      type: 'pill',
      count: p.count,
      pillId: p.id,
      icon: 'circle-dot',
      desc: p.desc ?? 'Đan dược trân quý bồi dưỡng tu vi',
      valueScore: (p.grade ?? 1) * 35
    })
  }

  // Thêm trang bị
  for (const eq of equipments) {
    if (!eq.item) continue
    items.push({
      id: `equip_${eq.item.uid}`,
      name: eq.templateName ?? 'Trang Bị',
      type: 'equipment',
      count: 1,
      equipmentUid: eq.item.uid,
      tier: eq.tier,
      quality: eq.quality,
      qualityName: eq.qualityName,
      icon: eq.icon,
      desc: eq.desc,
      valueScore: eq.combatScore
    })
  }

  // Thêm nguyên liệu
  for (const m of materials) {
    items.push({
      id: `mat_${m.type}`,
      name: `${m.name} x${m.count}`,
      type: 'material',
      materialType: m.type,
      count: m.count,
      icon: m.type === 'ore' ? 'gem' : 'leaf',
      desc: 'Nguyên liệu luyện đan, luyện khí thu thập được từ hoang dã',
      valueScore: m.count * 15
    })
  }

  return {
    stones: bag.stones,
    equipments,
    pills,
    materials,
    items
  }
}

/**
 * Chuyển giao vật phẩm từ túi NPC sang hành trang / ngân quỹ của người chơi
 */
function transferItemFromNpcToPlayer(npcId: string, item: NpcBagItem): void {
  const bag = getNpcBag(npcId)
  const inv = useInventoryStore()
  const res = useResourcesStore()

  if (item.type === 'equipment' && item.equipmentUid) {
    const eqIdx = bag.inventory.findIndex(e => e.uid === item.equipmentUid)
    if (eqIdx >= 0) {
      const removed = bag.inventory.splice(eqIdx, 1)[0]!
      inv.addEquipment(removed)
    }
  } else if (item.type === 'pill' && item.pillId) {
    const current = bag.pills[item.pillId] ?? 0
    const takeCount = Math.min(current, 1)
    if (takeCount > 0) {
      bag.pills[item.pillId] = current - takeCount
      if (bag.pills[item.pillId]! <= 0) delete bag.pills[item.pillId]
      inv.addPill(item.pillId, takeCount)
    }
  } else if (item.type === 'stone') {
    const takeStones = Math.min(bag.stones, Math.max(100, Math.floor(bag.stones / 2)))
    bag.stones -= takeStones
    res.addStone(gn(takeStones))
  } else if (item.type === 'material' && item.materialType) {
    if (item.materialType === 'ore') {
      const takeOre = Math.min(bag.materials.ore, 2)
      bag.materials.ore -= takeOre
      res.addSmall('ore', takeOre)
    } else if (item.materialType === 'herb') {
      const takeHerb = Math.min(bag.materials.herb, 3)
      bag.materials.herb -= takeHerb
      res.addHerb(1, takeHerb)
    }
  }

  setNpcBag(npcId, bag)
}

/**
 * Hành động: Người chơi xin (thỉnh cầu) vật phẩm từ NPC
 * Tùy vào độ hảo cảm và quan hệ mà NPC đồng ý cho hoặc từ chối
 */
export function requestNpcItem(
  npcId: string,
  item: NpcBagItem
): { success: boolean; message: string; favorDelta?: number } {
  const npcStore = useNpcStore()
  const currentFavor = npcStore.getFavor(npcId)

  const sect = useApprenticeStore()
  const disciple = sect.disciples.find(d => d.id === npcId)
  const player = usePlayerStore()
  const isDaolu = player.bond && player.bond.daoluId === npcId

  // Ngưỡng hảo cảm cần thiết theo giá trị của vật phẩm
  let minFavorRequired = 25
  if (item.valueScore > 100) minFavorRequired = 50
  if (item.valueScore > 300) minFavorRequired = 75

  // Đệ tử tôn kính Tông chủ
  if (disciple) {
    minFavorRequired = Math.max(15, minFavorRequired - 30)
  }
  // Đạo lữ tâm đầu ý hợp
  if (isDaolu) {
    minFavorRequired = Math.max(10, minFavorRequired - 45)
  }

  if (currentFavor >= minFavorRequired || (disciple && currentFavor >= 15) || isDaolu) {
    transferItemFromNpcToPlayer(npcId, item)

    let msg = `Đạo hữu đã mở lời, chút lễ mọn【${item.name}】này xin tặng đạo hữu!`
    if (disciple) {
      msg = `Tông chủ đã mở lời, đệ tử sao dám từ chối? Xin kính cẩn dâng lên【${item.name}】!`
    } else if (isDaolu) {
      msg = `Chàng thích vật này sao? Cứ lấy đi, đồ của ta cũng chính là của chàng!`
    }
    return { success: true, message: msg }
  } else {
    let msg = `Vật này đối với ta vô cùng trọng yếu, tạm thời chưa thể tặng đạo hữu, mong lượng thứ!`
    if (disciple) {
      msg = `Bẩm Tông chủ, đệ tử vừa trải qua gian nan mới có được vật này để tu luyện, xin người từ bi cho phép đệ tử giữ lại!`
    }
    return { success: false, message: msg }
  }
}

/**
 * Hành động: Người chơi lén lút trộm (thâu đạo) vật phẩm từ túi đồ NPC
 * Nếu bị phát hiện sẽ bị giảm mạnh độ hảo cảm!
 */
export function stealNpcItem(
  npcId: string,
  item: NpcBagItem,
  customRng: RandomService = rng
): { success: boolean; caught: boolean; message: string; favorDelta: number } {
  const npcStore = useNpcStore()
  const player = usePlayerStore()
  const sect = useApprenticeStore()
  const disciple = sect.disciples.find(d => d.id === npcId)
  const isDaolu = player.bond && player.bond.daoluId === npcId
  const worldNpc = npcStore.allActiveNpcs.find(n => n.id === npcId)

  const npcMajor = disciple?.major ?? worldNpc?.major ?? 1
  const npcComp = disciple?.comprehension ?? worldNpc?.comprehension ?? 60

  // Tỷ lệ trộm thành công dựa trên chênh lệch cảnh giới và thân pháp / ngộ tính
  let chance = 0.50 + (player.major - npcMajor) * 0.12 - (npcComp - 60) * 0.003
  if (item.valueScore > 100) chance -= 0.10
  if (item.valueScore > 300) chance -= 0.15
  chance = Math.max(0.15, Math.min(0.85, chance))

  const roll = customRng.next()
  if (roll <= chance) {
    // Trộm thành công! Thần không biết quỷ không hay
    transferItemFromNpcToPlayer(npcId, item)
    return {
      success: true,
      caught: false,
      message: `Thâu đạo thành công! Thần không biết quỷ không hay lấy trộm được 【${item.name}】!`,
      favorDelta: 0
    }
  } else {
    // Bị phát hiện! Trừng phạt giảm độ hảo cảm
    const favorPenalty = -25
    npcStore.addFavor(npcId, favorPenalty)

    let msg = `Bị phát hiện! 【${item.name}】vừa chạm tay đã bị bắt quả tang! Hảo cảm giảm ${Math.abs(favorPenalty)} điểm!`
    if (disciple) {
      msg = `Bị phát hiện! Đệ tử kinh hãi bắt quả tang Tông chủ trộm đồ: "Tông chủ... sao người lại làm chuyện hạ tiện này với đệ tử?!" (Hảo cảm giảm 25 điểm)`
    } else if (isDaolu) {
      msg = `Bị phát hiện! Đạo lữ bắt quả tang, đôi mắt ngấn lệ: "Chàng muốn cứ nói với thiếp, cớ sao phải lén lút trộm cắp?!" (Hảo cảm giảm 25 điểm)`
    } else if (worldNpc) {
      msg = `Bị phát hiện! ${worldNpc.name} nổi giận lôi đình: "Cả gan đạo tặc! Dám thò tay trộm đồ của bản tọa?!" (Hảo cảm giảm 25 điểm)`
    }

    return {
      success: false,
      caught: true,
      message: msg,
      favorDelta: favorPenalty
    }
  }
}

/**
 * Đệ tử tự đi lịch luyện ở các bản đồ có cấp độ tương ứng để tự kiếm linh thạch, đồ cấp thấp để mặc
 */
export function simulateDiscipleSelfAdventure(
  disciple: DiscipleData,
  gameMonth: number,
  customRng: RandomService = rng
): { updatedDisciple: DiscipleData; historyEntry?: SectHistoryEntry } {
  const d = { ...disciple }
  if (d.status === 'deceased' || d.status === 'demonic') {
    return { updatedDisciple: d }
  }

  // 1. Tìm khu vực lịch luyện phù hợp cảnh giới
  const suitableRegions = REGIONS.filter(r => r.minRealm <= d.major)
  const region = suitableRegions.length > 0
    ? suitableRegions[customRng.int(0, suitableRegions.length - 1)]!
    : REGIONS[0]!

  // 2. Thu hoạch linh thạch từ lịch luyện
  const stonesFound = customRng.int(60, 200) * (d.major + 1)
  d.bagStones = (d.bagStones ?? 0) + stonesFound

  // 3. Cơ hội nhặt được trang bị cấp thấp / phù hợp
  let foundEquipSummary = ''
  if (customRng.chance(0.45)) {
    const tier = Math.max(1, Math.min(32, d.major * 2 + 1))
    const item = generateEquipment(tier, customRng)
    item.origin = 'found'

    d.equippedItems = d.equippedItems ? [...d.equippedItems] : []
    d.inventoryItems = d.inventoryItems ? [...d.inventoryItems] : []

    const tpl = equipmentTemplate(item.templateId)
    if (tpl) {
      // Kiểm tra ô trang bị tương ứng
      const currentEquipIdx = d.equippedItems.findIndex(e => {
        const t = equipmentTemplate(e.templateId)
        return t?.slot === tpl.slot
      })

      if (currentEquipIdx === -1) {
        // Chưa có trang bị ô này: Mặc ngay lập tức!
        d.equippedItems.push(item)
        foundEquipSummary = `, nhặt được【${displayEquipName(tpl.name)}】và lập tức trang bị lên thân`
      } else {
        const curEquip = d.equippedItems[currentEquipIdx]!
        const curScore = calcEquipCombatScore(curEquip, d.element)
        const newScore = calcEquipCombatScore(item, d.element)
        if (newScore > curScore) {
          // Trang bị mới tốt hơn: Thay đồ, chuyển đồ cũ vào túi hành trang
          d.equippedItems.splice(currentEquipIdx, 1)
          d.equippedItems.push(item)
          d.inventoryItems.push(curEquip)
          foundEquipSummary = `, nhặt được bảo vật【${displayEquipName(tpl.name)}】tốt hơn trang bị cũ và đã thay thế`
        } else {
          // Giữ trong túi hành trang
          d.inventoryItems.push(item)
          foundEquipSummary = `, nhặt được trang bị【${displayEquipName(tpl.name)}】cất vào túi trữ vật`
        }
      }
    }
  }

  // 4. Cơ hội thu thập linh thảo / khoáng thạch
  if (customRng.chance(0.35)) {
    d.bagMaterials = d.bagMaterials ?? { ore: 0, herb: 0 }
    d.bagMaterials.herb = (d.bagMaterials.herb ?? 0) + customRng.int(2, 6)
    d.bagMaterials.ore = (d.bagMaterials.ore ?? 0) + customRng.int(1, 3)
  }

  const { year, month } = gameMonthToCalendar(gameMonth)
  const historyEntry: SectHistoryEntry = {
    id: nextSectUid('hist_adv'),
    gameMonth,
    year,
    month,
    category: 'cultivation',
    discipleId: d.id,
    discipleName: d.name,
    summary: `Tháng ${month}, năm thứ ${year} — Đệ tử ${d.name} hạ sơn lịch luyện tại【${region.name}】, trảm yêu đoạt bảo thu hoạch được ${stonesFound} Linh thạch${foundEquipSummary}!`
  }

  return { updatedDisciple: d, historyEntry }
}

/**
 * Đệ tử tự động phục dụng đan dược / tài nguyên trong túi để gia tăng thực lực
 */
export function simulateDiscipleBagConsumption(
  disciple: DiscipleData,
  customRng: RandomService = rng
): { updatedDisciple: DiscipleData; consumedPillName?: string; expGained: number } {
  const d = { ...disciple }
  let expGained = 0
  let consumedPillName: string | undefined

  // 1. Phục dụng đan dược nếu có trong túi
  if (d.bagPills) {
    const pillIds = Object.keys(d.bagPills).filter(id => (d.bagPills![id] ?? 0) > 0)
    if (pillIds.length > 0) {
      const chosenPill = pillIds[0]!
      d.bagPills = { ...d.bagPills }
      d.bagPills[chosenPill] = (d.bagPills[chosenPill] ?? 1) - 1
      if (d.bagPills[chosenPill]! <= 0) delete d.bagPills[chosenPill]

      const pDef = pillDef(chosenPill)
      consumedPillName = pDef?.name ? displayPillName(pDef.name) : chosenPill
      expGained = customRng.int(15, 30)
      d.expPct = Math.min(100, d.expPct + expGained)
      if (d.status === 'bottleneck') {
        d.status = 'idle'
      }
    }
  }

  // 2. Tiêu thụ một phần linh thạch cá nhân để xúc tiến tu hành
  if ((d.bagStones ?? 0) >= 100 && d.expPct < 100) {
    const spend = Math.min(d.bagStones!, 150)
    d.bagStones = d.bagStones! - spend
    d.expPct = Math.min(100, d.expPct + 5)
  }

  return { updatedDisciple: d, consumedPillName, expGained }
}
