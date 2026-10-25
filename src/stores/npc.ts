/**
 * Store Quản Lý Quần Thể Tu Sĩ & Thiên Kiêu (World NPC Store)
 *
 * Quản lý danh sách NPC sinh theo từng giai đoạn cảnh giới,
 * kỳ ngộ độc lập, mức độ hảo cảm và các đề nghị chủ động từ NPC.
 *
 * Đạt chuẩn quy ước persistence & resilience (phải có sanitize() hoàn chỉnh).
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { persistConfig } from '@/utils/storage'
import { WORLD_NPCS, type WorldNpcDef, worldNpcDef } from '@/data/npc'
import { generateStageNpcBatch } from '@/data/npcGeneration'
import { generateNpcAdventure, type NpcAdventureEntry } from '@/data/npcAdventures'
import { generateNpcProposal, type NpcProposal } from '@/data/npcProposals'
import { asArray, asFiniteNumber, asRecord, asStringArray } from '@/utils/saveShape'
import { usePlayerStore } from '@/stores/player'
import { useResourcesStore } from '@/stores/resources'
import { useInventoryStore } from '@/stores/inventory'
import { rng } from '@/utils/random'
import { gn } from '@/utils/gnum'
import { cultivationAreaDef, defaultRegionForNpc, CULTIVATION_AREAS } from '@/data/domains'
import { REALMS } from '@/data/realms'
import { GAME_MONTH_REAL_SECONDS, NPC_MONTHLY_LIMITS, type NpcMonthlyInteractionType, type NpcRoleType } from '@/data/constants'
import type { EquipmentInstance } from '@/types'
import { useUiStore } from '@/stores/ui'
import { simulateDaoluMonthlyCultivation } from '@/core/daoluCultivationService'
import { useApprenticeStore } from '@/stores/apprentice'

export type NpcRelationType = 'daolu' | 'mentor' | 'apprentice' | 'sibling' | 'none'

export interface ProposalActionResponse {
  success: boolean
  message: string
  rewardText?: string
}

export interface NpcCultivationState {
  major: number
  sub: number
  expPct: number
  status: 'cultivating' | 'bottleneck' | 'injured'
  gongfaId?: string
  lastCultivatedMonth?: number
}

export const useNpcStore = defineStore(
  'npc',
  () => {
    /** Danh sách NPC theo từng giai đoạn cảnh giới (stage 0..9) */
    const stageNpcs = ref<Record<number, WorldNpcDef[]>>({})

    /** Danh sách các giai đoạn đã được sinh NPC */
    const unlockedStages = ref<number[]>([])

    /** Lịch sử kỳ ngộ của từng NPC (lưu tối đa 5 kỳ ngộ gần nhất) */
    const npcAdventures = ref<Record<string, NpcAdventureEntry[]>>({})

    /** Mức độ hảo cảm giữa người chơi và từng NPC */
    const npcFavor = ref<Record<string, number>>({})

    /** Danh sách các đề nghị chủ động từ NPC */
    const proposals = ref<NpcProposal[]>([])

    /** Ngày game mô phỏng gần nhất */
    const lastSimDay = ref(0)

    /** Ngày game sinh đề nghị gần nhất */
    const lastProposalDay = ref(0)

    /** Vị trí khu vực hiện tại của nhân vật chính (mặc định khởi đầu tại Thanh Vân Sơn Lộc) */
    const playerRegionId = ref<string>('qingyun')

    /** Vị trí khu vực của từng NPC trong thế giới (ánh xạ npcId -> regionId) */
    const npcLocations = ref<Record<string, string>>({})

    /** Danh sách các khu vực người chơi đã khám phá / đặt chân tới */
    const discoveredRegions = ref<string[]>(['qingyun'])

    /**
     * Chu kỳ thời gian thế giới (30 phút thực = 1 tháng trong game).
     * Số tháng game đã trải qua kể từ khi nhập đạo (bắt đầu từ tháng 1).
     */
    const gameMonth = ref(1)

    /** Số giây thực đã trôi qua trong tháng game hiện tại (0..1799) */
    const monthElapsedSec = ref(0)

    /**
     * Theo dõi các tương tác định kỳ với từng NPC trong tháng hiện tại:
     * npcMonthlyRecords[npcId][interactionType] = số lần đã dùng trong tháng này.
     * Khi sang tháng mới, toàn bộ bản ghi này sẽ được làm mới về rỗng {}.
     */
    const npcMonthlyRecords = ref<Record<string, Record<string, number>>>({})

    /**
     * Trạng thái tu luyện và tiến độ cảnh giới độc lập của từng NPC:
     * npcCultivation[npcId] = { major, sub, expPct, status, gongfaId, lastCultivatedMonth }
     */
    const npcCultivation = ref<Record<string, NpcCultivationState>>({})

    /**
     * Mối quan hệ đặc biệt giữa nhân vật chính và NPC:
     * npcRelations[npcId] = 'daolu' | 'mentor' | 'apprentice' | 'sibling'
     */
    const npcRelations = ref<Record<string, NpcRelationType>>({})

    /**
     * Túi đồ và trang bị cá nhân của từng NPC trong thế giới:
     * npcEquipments[npcId] = { equipped: EquipmentInstance[], inventory: EquipmentInstance[] }
     */
    const npcEquipments = ref<Record<string, {
      equipped: EquipmentInstance[]
      inventory: EquipmentInstance[]
      pills?: Record<string, number>
      stones?: number
      materials?: { ore?: number; herb?: number }
    }>>({})

    /** Số giây còn lại cho đến khi bước sang tháng game tiếp theo */
    const monthRemainingSec = computed(() => Math.max(0, GAME_MONTH_REAL_SECONDS - monthElapsedSec.value))

    /**
     * Lấy toàn bộ NPC đang hoạt động trong thế giới:
     * Kết hợp 36 NPC tĩnh ban đầu cùng tất cả NPC động đã mở khóa theo giai đoạn.
     */
    const allActiveNpcs = computed<WorldNpcDef[]>(() => {
      const dynamicList: WorldNpcDef[] = []
      for (const stage of unlockedStages.value) {
        const list = stageNpcs.value[stage]
        if (Array.isArray(list)) {
          dynamicList.push(...list)
        }
      }
      return [...WORLD_NPCS, ...dynamicList]
    })

    /** Danh sách đề nghị đang chờ phản hồi */
    const pendingProposals = computed<NpcProposal[]>(() => {
      return proposals.value.filter(p => p.status === 'pending' || p.status === 'deferred')
    })

    /** Số lượng đề nghị đang chờ phản hồi */
    const pendingProposalsCount = computed(() => pendingProposals.value.length)

    /**
     * Mở khóa và sinh NPC cho các giai đoạn <= playerMajor nếu chưa sinh
     */
    function syncStage(playerMajor: number): void {
      const targetStage = Math.min(9, Math.max(0, playerMajor))
      for (let s = 0; s <= targetStage; s++) {
        if (!unlockedStages.value.includes(s) || !stageNpcs.value[s]?.length) {
          const newBatch = generateStageNpcBatch(s, 6)
          stageNpcs.value = {
            ...stageNpcs.value,
            [s]: newBatch
          }
          if (!unlockedStages.value.includes(s)) {
            unlockedStages.value = [...unlockedStages.value, s]
          }
        }
      }
    }

    /**
     * Tìm thông tin NPC theo ID (tìm trong cả NPC tĩnh lẫn NPC động)
     */
    function findNpc(id: string): WorldNpcDef | undefined {
      const staticDef = worldNpcDef(id)
      if (staticDef) return staticDef
      return allActiveNpcs.value.find(n => n.id === id)
    }

    /**
     * Lấy mức độ hảo cảm với một NPC
     */
    function getFavor(npcId: string): number {
      return npcFavor.value[npcId] ?? 0
    }

    /**
     * Tăng/giảm hảo cảm với một NPC
     */
    function addFavor(npcId: string, delta: number): void {
      const cur = npcFavor.value[npcId] ?? 0
      npcFavor.value = {
        ...npcFavor.value,
        [npcId]: Math.max(0, cur + delta)
      }
    }

    /**
     * Lấy lịch sử kỳ ngộ của một NPC
     */
    function getAdventures(npcId: string): NpcAdventureEntry[] {
      return npcAdventures.value[npcId] ?? []
    }

    /**
     * Lấy vị trí khu vực hiện tại của một NPC.
     * Nếu chưa có trong `npcLocations`, tính toán khu vực mặc định theo cảnh giới và môn phái.
     */
    function getNpcRegion(npcId: string): string {
      const existing = npcLocations.value[npcId]
      if (existing) return existing

      const npc = findNpc(npcId)
      if (!npc) return 'qingyun'

      const defReg = defaultRegionForNpc(npc)
      npcLocations.value = {
        ...npcLocations.value,
        [npcId]: defReg
      }
      return defReg
    }

    /**
     * Thiết lập khu vực cho một NPC (ví dụ NPC di chuyển hoặc phiêu bạt)
     */
    function setNpcRegion(npcId: string, regionId: string): void {
      npcLocations.value = {
        ...npcLocations.value,
        [npcId]: regionId
      }
    }

    /**
     * Lấy danh sách toàn bộ NPC đang có mặt tại một khu vực
     */
    function getNpcsInRegion(regionId: string): WorldNpcDef[] {
      return allActiveNpcs.value.filter(n => getNpcRegion(n.id) === regionId)
    }

    /**
     * Kiểm tra điều kiện nhân vật chính có thể tiến vào một khu vực hay không
     */
    function canEnterRegion(
      regionId: string,
      playerMajor: number,
      unlockedList?: string[]
    ): { allowed: boolean; reason?: string } {
      const area = cultivationAreaDef(regionId)
      if (!area) return { allowed: false, reason: 'Khu vực không tồn tại trong cửu giới.' }

      // Kiểm tra cảnh giới tối thiểu
      if (playerMajor < area.minRealm) {
        const realmName = REALMS[area.minRealm]?.name ?? `Cảnh giới ${area.minRealm}`
        return {
          allowed: false,
          reason: `Cảnh giới chưa đủ: Nơi đây thiên địa áp lực cực lớn, cần tối thiểu cảnh giới ${realmName} mới có thể đặt chân vào.`
        }
      }

      // Kiểm tra trạng thái mở khóa
      const isUnlocked =
        discoveredRegions.value.includes(regionId) ||
        (unlockedList && unlockedList.includes(regionId)) ||
        playerMajor >= area.minRealm

      if (!isUnlocked) {
        return {
          allowed: false,
          reason: 'Khu vực này phong ấn chưa giải, tạm thời chưa tìm được lối vào.'
        }
      }

      return { allowed: true }
    }

    /**
     * Nhân vật chủ động di chuyển / chuyển tới một khu vực
     */
    function moveToRegion(
      regionId: string,
      playerMajor: number,
      unlockedList?: string[]
    ): { success: boolean; message: string } {
      const check = canEnterRegion(regionId, playerMajor, unlockedList)
      if (!check.allowed) {
        return { success: false, message: check.reason ?? 'Không thể tiến vào khu vực này.' }
      }

      playerRegionId.value = regionId
      if (!discoveredRegions.value.includes(regionId)) {
        discoveredRegions.value = [...discoveredRegions.value, regionId]
      }

      const area = cultivationAreaDef(regionId)
      return {
        success: true,
        message: `Đã tiến vào 【${area?.name ?? regionId}】. ${area?.features ?? ''}`
      }
    }

    /**
     * Mô phỏng kỳ ngộ và sinh đề nghị chủ động từ NPC khi thời gian thế giới trôi qua
     */
    function simulateWorld(
      currentDay: number,
      playerMajor: number,
      playerGender: 'male' | 'female',
      hasDaolu: boolean
    ): void {
      syncStage(playerMajor)
      if (currentDay <= lastSimDay.value) return

      const npcs = allActiveNpcs.value
      if (npcs.length === 0) return

      // 1. Mô phỏng kỳ ngộ cho 3-5 NPC ngẫu nhiên
      const simCount = Math.min(5, Math.max(2, Math.floor(npcs.length * 0.08)))
      const shuffled = [...npcs].sort(() => rng.next() - 0.5)
      const pickedNpcs = shuffled.slice(0, simCount)

      const nextAdvMap = { ...npcAdventures.value }
      for (const npc of pickedNpcs) {
        const adv = generateNpcAdventure(npc, currentDay)
        const currentList = nextAdvMap[npc.id] ?? []
        nextAdvMap[npc.id] = [adv, ...currentList].slice(0, 5)

        // Đối với Thiên Kiêu (Gold / Silver), có tỷ lệ tăng tu vi tiểu cảnh giới
        if (npc.tierRank === 'gold' && rng.chance(0.2)) {
          if (npc.sub < 8) npc.sub++
        } else if (npc.tierRank === 'silver' && rng.chance(0.1)) {
          if (npc.sub < 8) npc.sub++
        }
      }
      npcAdventures.value = nextAdvMap

      // 2. Kiểm tra sinh đề nghị chủ động từ NPC (nếu chưa vượt quá 3 đề nghị pending)
      if (pendingProposalsCount.value < 3 && currentDay > lastProposalDay.value) {
        // Ưu tiên chọn NPC có hảo cảm hoặc Thiên kiêu
        const candidate = rng.pick(npcs)
        if (candidate) {
          const prop = generateNpcProposal(candidate, playerMajor, playerGender, currentDay, hasDaolu)
          if (prop) {
            proposals.value = [prop, ...proposals.value]
            lastProposalDay.value = currentDay
          }
        }
      }

      lastSimDay.value = currentDay
    }

    /**
     * Chấp nhận đề nghị từ NPC
     */
    function acceptProposal(proposalId: string): ProposalActionResponse {
      const prop = proposals.value.find(p => p.id === proposalId)
      if (!prop || (prop.status !== 'pending' && prop.status !== 'deferred')) {
        return { success: false, message: 'Đề nghị này không còn hiệu lực.' }
      }

      const player = usePlayerStore()
      const resources = useResourcesStore()
      const inventory = useInventoryStore()

      // Kiểm tra chi phí nếu có
      if (prop.cost) {
        if (prop.cost.type === 'stone') {
          if (!resources.hasStone(gn(prop.cost.amount))) {
            return { success: false, message: `Linh thạch không đủ: cần ${prop.cost.amount} linh thạch.` }
          }
          resources.spendStone(gn(prop.cost.amount))
        } else if (prop.cost.type === 'herb' || prop.cost.type === 'ore') {
          if (!resources.hasSmall(prop.cost.type, prop.cost.amount)) {
            return { success: false, message: `Nguyên liệu không đủ: cần ${prop.cost.amount} ${prop.cost.type === 'herb' ? 'linh thảo' : 'huyền thiết'}.` }
          }
          resources.spendSmall(prop.cost.type, prop.cost.amount)
        } else if (prop.cost.type === 'pill' && prop.cost.id) {
          if ((inventory.pills[prop.cost.id] ?? 0) < prop.cost.amount) {
            return { success: false, message: 'Đan dược trong túi không đủ.' }
          }
          inventory.spendPill(prop.cost.id, prop.cost.amount)
        }
      }

      // Nhận phần thưởng nếu có
      let rewardText = ''
      if (prop.reward) {
        if (prop.reward.type === 'exp' && prop.reward.amount) {
          player.gainExp(gn(prop.reward.amount))
          rewardText = `Tu vi +${prop.reward.amount}`
        } else if (prop.reward.type === 'stone' && prop.reward.amount) {
          resources.addStone(gn(prop.reward.amount))
          rewardText = `Linh Thạch +${prop.reward.amount}`
        } else if (prop.reward.type === 'wudao' && prop.reward.amount) {
          resources.addSmall('wudao', prop.reward.amount)
          rewardText = `Điểm Ngộ Đạo +${prop.reward.amount}`
        } else if (prop.reward.type === 'herb' && prop.reward.amount) {
          resources.addSmall('herb', prop.reward.amount)
          rewardText = `Linh Thảo +${prop.reward.amount}`
        } else if (prop.reward.type === 'ore' && prop.reward.amount) {
          resources.addSmall('ore', prop.reward.amount)
          rewardText = `Huyền Thiết +${prop.reward.amount}`
        }
      }

      // Tăng hảo cảm với NPC
      addFavor(prop.npcId, 5)

      prop.status = 'accepted'
      const npc = findNpc(prop.npcId)
      const name = npc?.name ?? 'Đối phương'

      return {
        success: true,
        message: `Đã chấp thuận đề nghị của 【${name}】. ${rewardText ? `(Nhận được: ${rewardText})` : ''}`.trim(),
        rewardText
      }
    }

    /**
     * Từ chối đề nghị từ NPC
     */
    function rejectProposal(proposalId: string): ProposalActionResponse {
      const prop = proposals.value.find(p => p.id === proposalId)
      if (!prop) {
        return { success: false, message: 'Đề nghị không tồn tại.' }
      }
      prop.status = 'rejected'
      const npc = findNpc(prop.npcId)
      return {
        success: true,
        message: `Đã khéo léo từ chối lời mời của 【${npc?.name ?? 'tu sĩ'}】.`
      }
    }

    /**
     * Để sau đề nghị từ NPC
     */
    function deferProposal(proposalId: string): void {
      const prop = proposals.value.find(p => p.id === proposalId)
      if (prop && prop.status === 'pending') {
        prop.status = 'deferred'
      }
    }

    /**
     * Tích lũy thời gian thực tế để tính chuyển tháng (30 phút thực = 1 tháng trong game).
     * @param deltaSec Số giây trôi qua trong tick hoặc offline
     * @returns Số tháng đã trôi qua (0 nếu chưa chuyển tháng)
     */
    function advanceMonthTime(deltaSec: number): number {
      if (!Number.isFinite(deltaSec) || deltaSec <= 0) return 0
      const totalSec = monthElapsedSec.value + deltaSec
      const monthsPassed = Math.floor(totalSec / GAME_MONTH_REAL_SECONDS)
      monthElapsedSec.value = totalSec % GAME_MONTH_REAL_SECONDS

      if (monthsPassed > 0) {
        gameMonth.value += monthsPassed
        resetMonthlyInteractions()
        shuffleNpcMonthlyLocations()
        simulateNpcWorldCultivation(gameMonth.value, monthsPassed)
        try {
          simulateDaoluMonthlyCultivation(gameMonth.value, monthsPassed)
        } catch {
          // Môi trường test
        }
        try {
          useApprenticeStore().simulateMonthlySect(gameMonth.value, monthsPassed)
        } catch {
          // Môi trường test
        }
        try {
          useUiStore().toast(`Thiên địa luân chuyển, đã bước sang tháng thứ ${gameMonth.value} tu hành. Vạn vật đổi mới!`, 'info')
        } catch {
          // Môi trường test
        }
      }
      return monthsPassed
    }

    /**
     * Lấy trạng thái tu luyện hiện tại của một NPC (tự khởi tạo nếu chưa có)
     */
    function getNpcCultivation(npcId: string): NpcCultivationState {
      const existing = npcCultivation.value[npcId]
      if (existing) return existing

      const npc = findNpc(npcId) ?? worldNpcDef(npcId)
      const initState: NpcCultivationState = {
        major: npc ? npc.major : 0,
        sub: npc ? npc.sub : 0,
        expPct: 0,
        status: 'cultivating',
        lastCultivatedMonth: gameMonth.value
      }
      npcCultivation.value = {
        ...npcCultivation.value,
        [npcId]: initState
      }
      return initState
    }

    /**
     * Cập nhật trạng thái tu luyện của một NPC
     */
    function setNpcCultivation(npcId: string, state: NpcCultivationState): void {
      npcCultivation.value = {
        ...npcCultivation.value,
        [npcId]: state
      }
    }

    /**
     * Mô phỏng quá trình tự tu luyện, đột phá và kỳ ngộ theo tháng của Quần thể NPC
     */
    function simulateNpcWorldCultivation(currentMonth: number, monthsPassed: number): void {
      if (monthsPassed <= 0) return
      const npcs = allActiveNpcs.value
      const updatedCult = { ...npcCultivation.value }
      const updatedAdv = { ...npcAdventures.value }

      for (const n of npcs) {
        const found = updatedCult[n.id] ?? getNpcCultivation(n.id)
        const cur: NpcCultivationState = {
          major: found.major,
          sub: found.sub,
          expPct: found.expPct,
          status: found.status,
          gongfaId: found.gongfaId,
          lastCultivatedMonth: found.lastCultivatedMonth
        }

        // Tránh chạy lặp nếu đã xử lý trong cùng tháng
        if (cur.lastCultivatedMonth && cur.lastCultivatedMonth >= currentMonth) {
          continue
        }
        cur.lastCultivatedMonth = currentMonth

        const advList: NpcAdventureEntry[] = [...(updatedAdv[n.id] ?? [])]

        // 1. Trạng thái Thụ Thương (injured)
        if (cur.status === 'injured') {
          let recovered = false
          for (let m = 0; m < monthsPassed; m++) {
            if (rng.chance(0.5)) {
              recovered = true
              break
            }
          }
          if (recovered) {
            cur.status = 'cultivating'
            advList.unshift({
              id: `adv_rec_${Date.now()}_${rng.int(0, 9999)}`,
              day: currentMonth * 30,
              text: 'Dưỡng thương khỏi hẳn, kinh mạch thông suốt trở lại, tiếp tục con đường tu hành.',
              type: 'social'
            })
          }
          updatedCult[n.id] = cur
          updatedAdv[n.id] = advList.slice(0, 5)
          continue
        }

        // 2. Trạng thái Bình Cảnh (bottleneck)
        if (cur.status === 'bottleneck') {
          let brokenThrough = false
          const compRate = ((n.comprehension ?? 50) / 100) * 0.15
          const tierBonus = n.tierRank === 'gold' ? 0.2 : (n.tierRank === 'silver' ? 0.1 : 0)
          const breakthroughChance = Math.min(0.75, 0.25 + compRate + tierBonus)

          for (let m = 0; m < monthsPassed; m++) {
            if (rng.chance(breakthroughChance)) {
              brokenThrough = true
              break
            }
          }

          if (brokenThrough) {
            cur.major = Math.min(20, cur.major + 1)
            cur.sub = 0
            cur.expPct = 0
            cur.status = 'cultivating'
            const nextRealm = REALMS[cur.major]?.name ?? 'Cảnh giới mới'
            advList.unshift({
              id: `adv_bt_${Date.now()}_${rng.int(0, 9999)}`,
              day: currentMonth * 30,
              text: `Phá vỡ bình cảnh thành công, lôi kiếp gột rửa, ngưng tụ đạo quả bước vào「${nextRealm}」!`,
              type: 'breakthrough'
            })
          } else {
            if (rng.chance(0.2)) {
              cur.status = 'injured'
              advList.unshift({
                id: `adv_inj_${Date.now()}_${rng.int(0, 9999)}`,
                day: currentMonth * 30,
                text: 'Cưỡng cầu phá cảnh gặp phản phệ, linh khí nghịch chuyển làm tổn thương kinh mạch.',
                type: 'peril'
              })
            }
          }
          updatedCult[n.id] = cur
          updatedAdv[n.id] = advList.slice(0, 5)
          continue
        }

        // 3. Trạng thái Tu Luyện Thuận Lợi (cultivating)
        const baseMonthly = 20 / (1 + cur.major * 0.12)
        const regId = getNpcRegion(n.id)
        const area = cultivationAreaDef(regId)
        const density = area ? (1.0 + (area.tier ?? 0) * 0.05) : 1.0
        const tierMult = n.tierRank === 'gold' ? 1.4 : (n.tierRank === 'silver' ? 1.2 : 1.0)
        const compMult = 0.8 + ((n.comprehension ?? 50) / 100) * 0.4

        let monthGain = baseMonthly * density * tierMult * compMult

        // Kỳ ngộ ngẫu nhiên (25% cơ hội phát sinh mỗi tháng)
        if (rng.chance(0.25)) {
          const roll = rng.next()
          if (roll < 0.35) {
            monthGain += 25
            advList.unshift({
              id: `adv_f_${Date.now()}_${rng.int(0, 9999)}`,
              day: currentMonth * 30,
              text: 'May mắn tìm được tàn tích động phủ thượng cổ, phục dụng ngàn năm linh đan, tu vi tăng tiến vượt bậc!',
              type: 'treasure'
            })
          } else if (roll < 0.55) {
            cur.status = 'injured'
            advList.unshift({
              id: `adv_p_${Date.now()}_${rng.int(0, 9999)}`,
              day: currentMonth * 30,
              text: 'Tranh đoạt linh thảo nơi hiểm cảnh bị quần yêu vây công, chịu thương tích phải thoái lui.',
              type: 'peril'
            })
          } else if (roll < 0.75) {
            monthGain += 15
            advList.unshift({
              id: `adv_b_${Date.now()}_${rng.int(0, 9999)}`,
              day: currentMonth * 30,
              text: 'Đứng trước thác nước ngắm nhìn thiên địa vận hành, chợt ngộ ra ý cảnh huyền diệu.',
              type: 'breakthrough'
            })
          }
        }

        const prevExp = Number.isFinite(cur.expPct) ? cur.expPct : 0
        cur.expPct = prevExp + Math.round(monthGain * monthsPassed)

        // Tiến cảnh tiểu tầng
        while (cur.expPct >= 100) {
          if (cur.sub < 8) {
            cur.sub += 1
            cur.expPct -= 100
            advList.unshift({
              id: `adv_sub_${Date.now()}_${rng.int(0, 9999)}`,
              day: currentMonth * 30,
              text: `Khí tức dâng trào, thuận lợi đột phá bước lên tầng thứ ${cur.sub + 1}.`,
              type: 'breakthrough'
            })
          } else {
            cur.expPct = 100
            cur.status = 'bottleneck'
            advList.unshift({
              id: `adv_peak_${Date.now()}_${rng.int(0, 9999)}`,
              day: currentMonth * 30,
              text: `Tu vi đã đạt tới viên mãn đỉnh phong của ${REALMS[cur.major]?.name ?? 'cảnh giới'}, bắt đầu vướng phải bình cảnh đại quan.`,
              type: 'breakthrough'
            })
            break
          }
        }

        updatedCult[n.id] = cur
        updatedAdv[n.id] = advList.slice(0, 5)
      }

      npcCultivation.value = updatedCult
      npcAdventures.value = updatedAdv
    }

    /**
     * Lấy mối quan hệ đặc biệt với NPC ('daolu' | 'mentor' | 'apprentice' | 'sibling' | 'none')
     */
    function getNpcRelation(npcId: string): NpcRelationType {
      try {
        const player = usePlayerStore()
        if (player.bond?.daoluId === npcId && !player.bond.fallen && !player.bond.departed) {
          return 'daolu'
        }
      } catch {
        // Test / offline
      }
      return npcRelations.value[npcId] ?? 'none'
    }

    /**
     * Thiết lập mối quan hệ đặc biệt với NPC
     */
    function setNpcRelation(npcId: string, rel: NpcRelationType): void {
      if (rel === 'none') {
        const next = { ...npcRelations.value }
        delete next[npcId]
        npcRelations.value = next
      } else {
        npcRelations.value = {
          ...npcRelations.value,
          [npcId]: rel
        }
      }
    }

    /**
     * Lấy vai trò tương tác hàng tháng của NPC dựa trên quan hệ
     */
    function getNpcRole(npcId: string): NpcRoleType {
      const rel = getNpcRelation(npcId)
      if (rel === 'daolu') return 'daolu'
      if (rel === 'mentor') return 'mentor'
      if (rel === 'apprentice') return 'apprentice'
      if (rel === 'sibling') return 'sibling'
      return 'regular'
    }

    /**
     * Mỗi tháng NPC phiêu bạt di chuyển giữa các vùng đất tương thích với cảnh giới
     */
    function shuffleNpcMonthlyLocations(): void {
      const npcs = allActiveNpcs.value
      if (!npcs.length) return
      const nextLocs = { ...npcLocations.value }

      for (const n of npcs) {
        const cult = npcCultivation.value[n.id]
        const major = cult ? cult.major : n.major
        const candidates = CULTIVATION_AREAS.filter(
          a => Math.abs(a.minRealm - major) <= 1
        )
        if (candidates.length > 0) {
          const picked = rng.pick(candidates)
          if (picked) {
            nextLocs[n.id] = picked.id
          }
        } else {
          nextLocs[n.id] = defaultRegionForNpc(n)
        }
      }
      npcLocations.value = nextLocs
    }

    /**
     * Lấy số lần đã tương tác với NPC theo loại trong tháng hiện tại
     */
    function getInteractionCount(npcId: string, type: NpcMonthlyInteractionType): number {
      return npcMonthlyRecords.value[npcId]?.[type] ?? 0
    }

    /**
     * Kiểm tra xem nhân vật có thể thực hiện tương tác này với NPC trong tháng hiện tại hay không
     */
    function canInteract(
      npcId: string,
      type: NpcMonthlyInteractionType,
      role?: NpcRoleType
    ): { allowed: boolean; reason?: string; current: number; max: number } {
      const actualRole = role ?? getNpcRole(npcId)
      const limits = NPC_MONTHLY_LIMITS[actualRole] ?? NPC_MONTHLY_LIMITS.regular
      const max = limits[type] ?? 1
      const current = getInteractionCount(npcId, type)
      if (current >= max) {
        return {
          allowed: false,
          reason: 'Trong tháng này đã thực hiện tương tác này rồi. Hãy đợi sang tháng mới khi linh khí trời đất đổi mới.',
          current,
          max
        }
      }
      return { allowed: true, current, max }
    }

    /**
     * Ghi nhận 1 lần tương tác thành công với NPC trong tháng hiện tại
     */
    function recordInteraction(npcId: string, type: NpcMonthlyInteractionType): void {
      const existing = npcMonthlyRecords.value[npcId] ?? {}
      const curCount = existing[type] ?? 0
      npcMonthlyRecords.value = {
        ...npcMonthlyRecords.value,
        [npcId]: {
          ...existing,
          [type]: curCount + 1
        }
      }
    }

    /**
     * Đặt lại toàn bộ tương tác tháng của tất cả NPC (khi sang tháng mới)
     */
    function resetMonthlyInteractions(): void {
      npcMonthlyRecords.value = {}
      try {
        const player = usePlayerStore()
        if (player.bond) {
          player.setBond({
            ...player.bond,
            lastChatDay: 0,
            chatCountToday: 0,
            lastGiftDay: 0,
            giftCountToday: 0,
            lastDualDay: 0,
            lastSparDay: 0
          })
        }
      } catch {
        // Pinia not ready
      }
    }

    /**
     * Khôi phục an toàn chống hỏng dữ liệu (Sanitize Guard)
     * Đáp ứng 100% tiêu chí storeResilience.spec.ts
     */
    function sanitize(): void {
      lastSimDay.value = Math.max(0, asFiniteNumber(lastSimDay.value, 0))
      lastProposalDay.value = Math.max(0, asFiniteNumber(lastProposalDay.value, 0))

      // Khôi phục gameMonth và monthElapsedSec
      gameMonth.value = Math.max(1, Math.floor(asFiniteNumber(gameMonth.value, 1)))
      monthElapsedSec.value = Math.max(0, Math.min(GAME_MONTH_REAL_SECONDS - 1, asFiniteNumber(monthElapsedSec.value, 0)))

      // Khôi phục npcMonthlyRecords
      const cleanMonthly: Record<string, Record<string, number>> = {}
      const rawMonthly = asRecord(npcMonthlyRecords.value)
      for (const [npcId, v] of Object.entries(rawMonthly)) {
        if (typeof npcId === 'string' && v && typeof v === 'object') {
          const rec: Record<string, number> = {}
          for (const [act, c] of Object.entries(asRecord(v))) {
            const num = asFiniteNumber(c, 0)
            if (num > 0) rec[act] = num
          }
          cleanMonthly[npcId] = rec
        }
      }
      npcMonthlyRecords.value = cleanMonthly

      // Khôi phục unlockedStages
      unlockedStages.value = asArray<number>(unlockedStages.value)
        .filter(n => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 9)

      // Khôi phục stageNpcs
      const cleanStageNpcs: Record<number, WorldNpcDef[]> = {}
      const rawStages = asRecord(stageNpcs.value)
      for (const [k, v] of Object.entries(rawStages)) {
        const num = Number(k)
        if (Number.isFinite(num) && num >= 0 && num <= 9 && Array.isArray(v)) {
          cleanStageNpcs[num] = v.filter(n => n && typeof n === 'object' && 'id' in n && 'name' in n)
        }
      }
      stageNpcs.value = cleanStageNpcs

      // Khôi phục npcAdventures
      const cleanAdv: Record<string, NpcAdventureEntry[]> = {}
      const rawAdv = asRecord(npcAdventures.value)
      for (const [k, v] of Object.entries(rawAdv)) {
        if (typeof k === 'string' && Array.isArray(v)) {
          cleanAdv[k] = v.filter(item => item && typeof item === 'object' && 'id' in item && 'text' in item)
        }
      }
      npcAdventures.value = cleanAdv

      // Khôi phục npcFavor
      const cleanFavor: Record<string, number> = {}
      const rawFavor = asRecord(npcFavor.value)
      for (const [k, v] of Object.entries(rawFavor)) {
        if (typeof k === 'string' && typeof v === 'number' && Number.isFinite(v)) {
          cleanFavor[k] = Math.max(0, v)
        }
      }
      npcFavor.value = cleanFavor

      // Khôi phục proposals
      const cleanProps: NpcProposal[] = []
      for (const p of asArray<NpcProposal>(proposals.value)) {
        if (p && typeof p === 'object' && 'id' in p && 'npcId' in p && 'type' in p) {
          cleanProps.push({
            id: String(p.id),
            npcId: String(p.npcId),
            type: p.type,
            title: String(p.title ?? ''),
            message: String(p.message ?? ''),
            createdAtDay: Math.max(0, asFiniteNumber(p.createdAtDay, 0)),
            status: ['pending', 'accepted', 'rejected', 'deferred'].includes(p.status) ? p.status : 'pending',
            reward: p.reward,
            cost: p.cost
          })
        }
      }
      proposals.value = cleanProps

      // Khôi phục playerRegionId
      playerRegionId.value = typeof playerRegionId.value === 'string' && playerRegionId.value ? playerRegionId.value : 'qingyun'

      // Khôi phục npcLocations
      const cleanLocs: Record<string, string> = {}
      const rawLocs = asRecord(npcLocations.value)
      for (const [k, v] of Object.entries(rawLocs)) {
        if (typeof k === 'string' && typeof v === 'string') {
          cleanLocs[k] = v
        }
      }
      npcLocations.value = cleanLocs

      // Khôi phục discoveredRegions
      const cleanDisc = asStringArray(discoveredRegions.value)
      discoveredRegions.value = cleanDisc.includes('qingyun') ? cleanDisc : ['qingyun', ...cleanDisc]

      // Khôi phục npcCultivation
      const cleanCult: Record<string, NpcCultivationState> = {}
      const rawCult = asRecord(npcCultivation.value)
      for (const [k, v] of Object.entries(rawCult)) {
        if (typeof k === 'string' && v && typeof v === 'object') {
          const rec = v as Record<string, unknown>
          cleanCult[k] = {
            major: Math.max(0, Math.min(20, asFiniteNumber(rec.major, 0))),
            sub: Math.max(0, Math.min(9, asFiniteNumber(rec.sub, 0))),
            expPct: Math.max(0, Math.min(100, asFiniteNumber(rec.expPct, 0))),
            status: ['cultivating', 'bottleneck', 'injured'].includes(String(rec.status))
              ? (rec.status as 'cultivating' | 'bottleneck' | 'injured')
              : 'cultivating',
            gongfaId: typeof rec.gongfaId === 'string' ? rec.gongfaId : undefined,
            lastCultivatedMonth: asFiniteNumber(rec.lastCultivatedMonth, 0)
          }
        }
      }
      npcCultivation.value = cleanCult

      // Khôi phục npcRelations
      const cleanRel: Record<string, NpcRelationType> = {}
      const rawRel = asRecord(npcRelations.value)
      const validRelTypes: NpcRelationType[] = ['daolu', 'mentor', 'apprentice', 'sibling', 'none']
      for (const [k, v] of Object.entries(rawRel)) {
        if (typeof k === 'string' && typeof v === 'string' && validRelTypes.includes(v as NpcRelationType)) {
          cleanRel[k] = v as NpcRelationType
        }
      }
      npcRelations.value = cleanRel

      // Khôi phục npcEquipments
      const cleanEquips: Record<string, {
        equipped: EquipmentInstance[]
        inventory: EquipmentInstance[]
        pills?: Record<string, number>
        stones?: number
        materials?: { ore?: number; herb?: number }
      }> = {}
      const rawEquips = asRecord(npcEquipments.value)
      for (const [k, v] of Object.entries(rawEquips)) {
        if (typeof k === 'string' && v && typeof v === 'object') {
          const rec = v as Record<string, unknown>
          const rawPills = asRecord(rec.pills)
          const cleanPills: Record<string, number> = {}
          for (const [pId, pCount] of Object.entries(rawPills)) {
            const count = asFiniteNumber(pCount, 0)
            if (count > 0) cleanPills[pId] = count
          }
          const rawMats = asRecord(rec.materials)
          cleanEquips[k] = {
            equipped: asArray<unknown>(rec.equipped).filter(
              (e): e is EquipmentInstance => !!e && typeof e === 'object' && 'uid' in e && typeof (e as Record<string, unknown>).uid === 'string'
            ),
            inventory: asArray<unknown>(rec.inventory).filter(
              (e): e is EquipmentInstance => !!e && typeof e === 'object' && 'uid' in e && typeof (e as Record<string, unknown>).uid === 'string'
            ),
            pills: cleanPills,
            stones: asFiniteNumber(rec.stones, 0),
            materials: {
              ore: asFiniteNumber(rawMats.ore, 0),
              herb: asFiniteNumber(rawMats.herb, 0)
            }
          }
        }
      }
      npcEquipments.value = cleanEquips
    }

    /** Lấy dữ liệu trang bị của NPC */
    function getNpcEquipmentData(npcId: string): {
      equipped: EquipmentInstance[]
      inventory: EquipmentInstance[]
      pills?: Record<string, number>
      stones?: number
      materials?: { ore?: number; herb?: number }
    } {
      const existing = npcEquipments.value[npcId]
      if (existing) return existing
      const initData = { equipped: [], inventory: [] }
      npcEquipments.value = {
        ...npcEquipments.value,
        [npcId]: initData
      }
      return initData
    }

    /** Cập nhật dữ liệu trang bị của NPC */
    function setNpcEquipmentData(npcId: string, data: {
      equipped: EquipmentInstance[]
      inventory: EquipmentInstance[]
      pills?: Record<string, number>
      stones?: number
      materials?: { ore?: number; herb?: number }
    }): void {
      npcEquipments.value = {
        ...npcEquipments.value,
        [npcId]: data
      }
    }

    /** Xóa bỏ các quan hệ và đề nghị kiếp trước khi luân hồi chuyển thế */
    function resetForRebirth(): void {
      npcFavor.value = {}
      proposals.value = []
      lastSimDay.value = 0
      lastProposalDay.value = 0
      playerRegionId.value = 'qingyun'
      discoveredRegions.value = ['qingyun']
      gameMonth.value = 1
      monthElapsedSec.value = 0
      npcMonthlyRecords.value = {}
      npcCultivation.value = {}
      npcRelations.value = {}
      npcEquipments.value = {}
    }

    return {
      stageNpcs,
      unlockedStages,
      npcAdventures,
      npcFavor,
      proposals,
      lastSimDay,
      lastProposalDay,
      playerRegionId,
      npcLocations,
      discoveredRegions,
      gameMonth,
      monthElapsedSec,
      npcMonthlyRecords,
      npcCultivation,
      npcRelations,
      npcEquipments,
      monthRemainingSec,
      allActiveNpcs,
      pendingProposals,
      pendingProposalsCount,
      syncStage,
      findNpc,
      getFavor,
      addFavor,
      getAdventures,
      getNpcRegion,
      setNpcRegion,
      getNpcsInRegion,
      canEnterRegion,
      moveToRegion,
      simulateWorld,
      acceptProposal,
      rejectProposal,
      deferProposal,
      advanceMonthTime,
      getInteractionCount,
      canInteract,
      recordInteraction,
      resetMonthlyInteractions,
      getNpcCultivation,
      setNpcCultivation,
      simulateNpcWorldCultivation,
      shuffleNpcMonthlyLocations,
      getNpcRelation,
      setNpcRelation,
      getNpcEquipmentData,
      setNpcEquipmentData,
      getNpcRole,
      sanitize,
      resetForRebirth
    }
  },
  { persist: persistConfig('npc') }
)
