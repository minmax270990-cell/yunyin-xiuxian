<template>
  <BaseModal :open="def !== undefined" :title="def ? displayGongfaName(def.name) : ''" @close="close">
    <div v-if="def">
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
        <QualityTag :quality="def.quality" />
        <span class="chip-ink border-ink/30 text-ink-soft">{{ GONGFA_TYPE_NAMES[def.type] }}</span>
        <span v-if="def.secretCategory" class="chip-ink border-azure/40 text-azure">
          {{ SECRET_CATEGORY_NAMES[def.secretCategory] ?? def.secretCategory }}
        </span>
        <span v-if="def.element" class="chip-ink" :style="{ color: ELEMENTS[def.element].color }">
          {{ ELEMENTS[def.element].name }} Thuộc Tính
        </span>
        <span v-else class="chip-ink text-ink-faint">Vô Thuộc Tính</span>
        <!-- Phase 32.2:同源功法参悟时更易撞见(倾向,非独占;无此灵根照样学得到) -->
        <span v-if="sameRoot" class="chip-ink border-gold-ink/40 text-gold-ink" title="Cùng linh căn tương hợp, Tàng Kinh Các tham ngộ dễ gặp hơn">Đồng Nguyên</span>
        <span v-if="learned" class="ml-auto tabular text-[12px]" :class="elig?.isAtComprehendLimit && !elig?.isAtMaxLevel ? 'text-cinnabar font-bold' : 'text-gold-ink'">
          Tầng {{ level }}/{{ def.maxLevel }} (Hạn: {{ elig?.maxComprehendLevel ?? def.maxLevel }})
        </span>
        <span v-else class="ml-auto tabular text-[12px] text-ink-faint">
          Tiềm năng: Tầng {{ elig?.maxComprehendLevel ?? def.maxLevel }}/{{ def.maxLevel }}
        </span>
      </div>
      <p class="mt-2 text-[12px] leading-relaxed text-ink-faint">{{ displayGongfaDesc(def.desc) }}</p>

      <!-- Thông tin tốc độ lĩnh ngộ & tương hợp linh căn -->
      <div v-if="elig" class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded bg-ink/5 px-2.5 py-1 text-[11px]">
        <span class="text-ink-soft">
          {{ def.element ? `Linh căn ${ELEMENTS[def.element]?.name ?? ''}: ${elig.elementAptitude}/100 điểm` : `Ngộ tính: ${eligSnapshot.comprehension ?? 50} điểm` }}
        </span>
        <span class="text-azure">Tốc độ tu: ×{{ elig.speedMultiplier }}</span>
        <span class="text-gold-ink">Độ tương hợp: {{ elig.affinityScore }}</span>
      </div>

      <!-- Cảnh báo giới hạn lĩnh ngộ khi đã học -->
      <div v-if="learned && elig?.isAtComprehendLimit && !elig?.isAtMaxLevel" class="mt-2 rounded bg-cinnabar/10 px-2.5 py-1.5 text-[11px] text-cinnabar leading-relaxed">
        <strong>【Hạn Định Linh Căn】 (Tầng {{ elig.maxComprehendLevel }}/{{ def.maxLevel }}):</strong>
        Linh căn hiện tại ({{ elig.elementAptitude }} điểm) không đủ để cảm ngộ tầng cao hơn. Hãy bồi dưỡng phẩm cấp linh căn hoặc dùng đan dược tẩy tủy để phá vỡ gông cùm!
      </div>

      <!-- Cảnh báo khi chưa học -->
      <template v-if="!learned && elig">
        <div v-if="elig.status === 'realm_locked'" class="mt-2 rounded bg-cinnabar/10 px-2.5 py-1.5 text-[11px] text-cinnabar">
          {{ elig.reason }}
        </div>
        <div v-else-if="elig.status === 'incompatible'" class="mt-2 rounded bg-cinnabar/10 px-2.5 py-1.5 text-[11px] text-cinnabar">
          {{ elig.reason }}
        </div>
        <div v-else-if="elig.status === 'comprehension_locked'" class="mt-2 rounded bg-cinnabar/10 px-2.5 py-1.5 text-[11px] text-cinnabar">
          {{ elig.reason }}
        </div>
        <div v-else-if="elig.status === 'conditional'" class="mt-2 rounded bg-gold-ink/10 px-2.5 py-1.5 text-[11px] text-gold-ink">
          {{ elig.reason }}
        </div>
      </template>

      <div class="ink-divider my-3" />
      <template v-if="learned">
        <div class="space-y-1.5">
          <p v-for="row in modRows" :key="row.label" class="flex justify-between text-[13px]">
            <span class="text-ink-soft">{{ displayStatLabel(row.label) }}</span>
            <span class="tabular text-azure">{{ displayStatValue(row.value) }}</span>
          </p>
          <p v-if="def.skill" class="text-[13px] leading-relaxed text-cinnabar" :data-source="gongfaSkillLine ? '' : undefined">
            {{ displayGongfaSkillLine(def.skill) }}
          </p>
        </div>
        <!-- 每进一层的增量:进修要花悟道点与残页,值不值当得看得见 -->
        <p class="mt-2 text-[11px] text-ink-faint">
          Mỗi khi tiến một tầng: <span class="tabular text-azure">{{ displayModsText(modsText(def.perLevelMods)) }}</span>
        </p>
        <p v-if="upCost" class="mt-3 text-right text-[11px] text-ink-faint tabular">
          Tiến tu cần Điểm Ngộ Đạo × {{ upCost.wudao }} · Tàn trang × {{ upCost.page }}
        </p>
        <!-- Phase 31 A3:满级悟道,择一分支。文案须自解释——给什么、要不要慎重,按下之前就得看见 -->
        <div v-if="fullLevel && branches.length" class="mt-3">
          <p class="mb-1 font-kai text-[12px] tracking-[0.2em] text-ink-faint">CÔNG HÀNH VIÊN MÃN · NGỘ ĐẠO</p>
          <p class="mb-2 text-[11px] leading-relaxed text-ink-faint">
            Công pháp này đã tu tới đỉnh tầng, có thể chọn một đạo đi tới cùng, vĩnh viễn cộng thêm từ ngữ bên dưới (chuyển thế không mất).
            <span class="text-cinnabar">Đạo phân nhánh, một khi đã chọn trọn đời không đổi.</span>
          </p>
          <div v-if="branchPicked" class="rounded-md bg-paper-deep/70 px-3 py-2">
            <p>
              <span class="font-kai text-[13px] text-gold-ink">{{ displayGongfaBranchName(branchPicked.name) }}</span>
              <span class="ml-2 text-[11px] text-ink-faint">{{ displayGongfaBranchDesc(branchPicked.desc) }}</span>
            </p>
            <p class="tabular mt-0.5 text-[11px] text-azure">{{ displayModsText(modsText(branchPicked.mods)) }}</p>
          </div>
          <div v-else class="space-y-1.5">
            <button
              v-for="b in branches"
              :key="b.id"
              class="flex w-full items-center justify-between gap-2 rounded-md border border-ink/20 px-3 py-2 text-left active:scale-98"
              @click="branchConfirm = b.id"
            >
              <span class="min-w-0">
                <span class="font-kai text-[13px] text-ink">{{ displayGongfaBranchName(b.name) }}</span>
                <span class="ml-2 text-[11px] text-ink-faint">{{ displayGongfaBranchDesc(b.desc) }}</span>
                <span class="tabular mt-0.5 block text-[11px] text-azure">{{ displayModsText(modsText(b.mods)) }}</span>
              </span>
              <span class="shrink-0 text-[10px] text-azure">Chọn đạo này →</span>
            </button>
            <!-- 永久抉择二步确认:选了就改不了,按一下不该就此了结 -->
            <div v-if="branchConfirm" class="rounded-md bg-cinnabar/5 px-3 py-2">
              <p class="text-[10px] leading-relaxed text-cinnabar">
                Đạo phân nhánh, một khi đã chọn <strong>trọn đời không đổi</strong> (chuyển thế vẫn theo ngươi). Xác nhận chọn 【{{ displayGongfaBranchName(gongfaBranchDef(branchConfirm)?.name ?? '') }}】?
              </p>
              <p v-if="gongfaBranchDef(branchConfirm)" class="mt-1 text-[11px] tabular text-azure">
                {{ displayModsText(modsText(gongfaBranchDef(branchConfirm)!.mods)) }}
              </p>
              <!-- 择道确认是玩家唯一一次定流派走向:!py-1 盒高不足 28px,抬到 !py-2(35px) -->
              <div class="mt-1.5 flex justify-end gap-2">
                <button class="btn-ghost !px-3 !py-2 !text-[11px]" @click="branchConfirm = null">Nghĩ lại</button>
                <button class="btn-seal !px-3 !py-2 !text-[11px]" @click="confirmBranch()">Xác nhận chọn đạo</button>
              </div>
            </div>
          </div>
        </div>
        <!-- 满级却无分支:也要交代一句,免得玩家满世界找入口 -->
        <p v-else-if="fullLevel" class="mt-3 text-[11px] text-ink-faint">Công pháp này đã tu tới đỉnh tầng, trước sau như một, không có nhánh rẽ để chọn.</p>
      </template>
      <!--
        未习得也要给得出「学它做什么」:参悟是花残页的抉择,池子里若只写着风味,
        玩家只能凭名字挑 —— 而名字看不出它是攻是守。故这里给满级账。
      -->
      <template v-else>
        <p class="text-[12px] text-ink-faint">Chưa học công pháp này.</p>
        <p class="mt-2 text-[11px] text-ink-soft">Tu tới viên mãn ({{ def.maxLevel }} tầng) có thể nhận:</p>
        <div class="mt-1 space-y-1">
          <p v-for="row in previewRows" :key="row.label" class="flex justify-between text-[13px]">
            <span class="text-ink-faint">{{ displayStatLabel(row.label) }}</span>
            <span class="tabular text-azure">{{ displayStatValue(row.value) }}</span>
          </p>
          <p v-if="def.skill" class="text-[13px] leading-relaxed text-cinnabar" :data-source="gongfaSkillLine ? '' : undefined">
            {{ displayGongfaSkillLine(def.skill) }}
          </p>
        </div>
      </template>
    </div>
    <template v-if="learned" #footer>
      <div class="flex gap-2">
        <button v-if="def?.type === 'main'" class="btn-seal flex-1" :disabled="isMain" @click="setMain">
          {{ isMain ? 'Đang Chủ Tu' : 'Đặt Làm Chủ Tu' }}
        </button>
        <button
          v-else
          class="btn-seal flex-1 text-[12px]"
          :disabled="subFull"
          :title="subFull ? `Ô phụ tu đã đầy (${cultivation.subGongfa.length}/${dongfu.subGongfaSlots})` : undefined"
          @click="toggleSub"
        >
          {{ subFull ? `Ô phụ tu đầy ${cultivation.subGongfa.length}/${dongfu.subGongfaSlots}` : subActionText }}
        </button>
        <button
          v-if="elig?.isAtComprehendLimit && !elig?.isAtMaxLevel"
          class="btn-ghost flex-1 opacity-60 text-cinnabar"
          disabled
          :title="`Đã đạt giới hạn lĩnh ngộ của linh căn (${elig.maxComprehendLevel}/${def?.maxLevel ?? 9}). Cần bồi dưỡng linh căn để nâng tầng.`"
        >
          Chạm Giới Hạn (Tầng {{ elig.maxComprehendLevel }})
        </button>
        <button
          v-else-if="upCost"
          class="btn-ghost flex-1"
          :disabled="!canAffordUp"
          :title="!canAffordUp ? 'Điểm Ngộ Đạo hoặc tàn trang chưa đủ' : undefined"
          @click="def && upgradeGongfa(def.id)"
        >
          {{ canAffordUp ? 'Tiến Tu' : 'Tiến Tu (Thiếu liệu)' }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useUiStore } from '@/stores/ui'
  import { useCultivationStore } from '@/stores/cultivation'
  import { useDongfuStore } from '@/stores/dongfu'
  import { usePlayerStore } from '@/stores/player'
  import { useResourcesStore } from '@/stores/resources'
  import { gongfaDef, gongfaMaxLevel, GONGFA_TYPE_NAMES } from '@/data/gongfa'
  import { ELEMENTS } from '@/data/linggen'
  import { branchesFor, gongfaBranchDef } from '@/data/gongfaBranches'
  import { gongfaUpgradeCost, upgradeGongfa } from '@/core/gongfaService'
  import { gongfaAffinity, rootElements } from '@/core/linggenAffinity'
  import { checkGongfaEligibility, getPlayerSnapshot } from '@/core/gongfaEligibility'
  import { mergeMods } from '@/core/statsCalc'
  import { gongfaModsAt } from '@/stores/cultivation'
  import { STAT_NAMES, modsText, statValueText } from '@/ui/statNames'
  import { gongfaSkillLine } from '@/ui/itemText'
  import { gongfaSubFullToast } from '@/ui/gongfaText'
  import {
    displayGongfaName,
    displayGongfaDesc,
    displayGongfaBranchName,
    displayGongfaBranchDesc,
    displayGongfaSkillLine,
    displayStatLabel,
    displayStatValue,
    displayModsText
  } from '@/ui/displayZhVi'
  import type { AnyStatKey, StatMods, SecretCategory } from '@/types'
  import BaseModal from '@/components/common/BaseModal.vue'
  import QualityTag from '@/components/common/QualityTag.vue'

  const SECRET_CATEGORY_NAMES: Record<SecretCategory, string> = {
    attack: 'Bí Thuật · Công Kích',
    defense: 'Bí Thuật · Phòng Ngự',
    speed: 'Bí Thuật · Thân Pháp',
    support: 'Bí Thuật · Hỗ Trợ',
    perception: 'Bí Thuật · Thần Thức',
    special: 'Bí Thuật · Đặc Thù'
  }

  const ui = useUiStore()
  const cultivation = useCultivationStore()
  const dongfu = useDongfuStore()
  const player = usePlayerStore()
  const resources = useResourcesStore()

  const def = computed(() => (ui.gongfaDetailId ? gongfaDef(ui.gongfaDetailId) : undefined))
  const level = computed(() => (def.value ? (cultivation.learned[def.value.id] ?? 0) : 0))
  const learned = computed(() => level.value > 0)
  const eligSnapshot = computed(() => getPlayerSnapshot())
  const elig = computed(() => (def.value ? checkGongfaEligibility(def.value, eligSnapshot.value, level.value) : null))
  const upCost = computed(() => (def.value ? gongfaUpgradeCost(def.value.id) : null))
  // 进修要悟道点+残页两样,一样不够就该置灰说清(upgradeGongfa 缺料只能吐 warn)
  const canAffordUp = computed(() => {
    const c = upCost.value
    if (!c) return false
    return resources.hasSmall('wudao', c.wudao) && resources.hasSmall('page', c.page)
  })

  /** 与灵根同源?判据直接取自参悟权重函数,标签与实际权重不可能分叉 */
  const sameRoot = computed(() => gongfaAffinity(def.value?.element, rootElements(player.linggen?.roots)) > 1)

  const modRows = computed(() => {
    if (!def.value || !learned.value) return []
    const sources: StatMods[] = [gongfaModsAt(def.value.id, level.value)]
    // 已悟道分支并入同一账本(与人物总览完全一致),否则顶部列表与面板口径分叉
    if (branchPicked.value) sources.push(branchPicked.value.mods)
    const mods = mergeMods(sources)
    return Object.entries(mods).map(([k, v]) => ({
      label: STAT_NAMES[k as AnyStatKey] ?? k,
      value: statValueText(k, v as number)
    }))
  })

  /** 未习得时的满级预览 —— 与习得后同一套算法(满级 = maxLevel 层) */
  const previewRows = computed(() => {
    const d = def.value
    if (!d) return []
    const mods = gongfaModsAt(d.id, d.maxLevel)
    return Object.entries(mods).map(([k, v]) => ({
      label: STAT_NAMES[k as AnyStatKey] ?? k,
      value: statValueText(k, v as number)
    }))
  })

  const isMain = computed(() => def.value && cultivation.mainGongfa === def.value.id)
  const isSub = computed(() => def.value && cultivation.subGongfa.includes(def.value.id))
  // 辅修/秘术共一个槽位预算;满了且这本不是现有辅修时「设为…」点了只吃一发 warn toast —— 置灰 + 报 N/M
  const subFull = computed(() => !isSub.value && cultivation.subGongfa.length >= dongfu.subGongfaSlots)
  // 秘术不该被叫「辅修」:两者都放进同一槽位,但门类是两块不同的印 —— 按钮如实点名
  const subActionText = computed(() => {
    const label = def.value?.type === 'secret' ? 'Bí Thuật' : 'Phụ Tu'
    return isSub.value ? `Gỡ Bỏ ${label}` : `Cài Đặt ${label}`
  })

  // Phase 31 A3:满级悟道分支
  const fullLevel = computed(() => (def.value ? level.value >= gongfaMaxLevel(def.value) : false))
  const branches = computed(() => (def.value ? branchesFor(def.value.id) : []))
  const branchPicked = computed(() => {
    if (!def.value) return undefined
    const id = cultivation.gongfaBranch[def.value.id]
    return id ? gongfaBranchDef(id) : undefined
  })

  /** 悟道分岔确认态(按分支 id):永久抉择先确认。换功法/关弹窗即复位 */
  const branchConfirm = ref<string | null>(null)
  watch(def, () => {
    branchConfirm.value = null
  })

  function choose(branchId: string): void {
    if (!def.value) return
    if (cultivation.chooseBranch(def.value.id, branchId)) {
      ui.toast(`Đã ngộ đạo「${displayGongfaBranchName(gongfaBranchDef(branchId)?.name ?? '')}」`, 'rare')
    }
  }

  function confirmBranch(): void {
    if (!branchConfirm.value) return
    const id = branchConfirm.value
    branchConfirm.value = null
    choose(id)
  }

  function close(): void {
    ui.gongfaDetailId = null
  }

  function setMain(): void {
    if (def.value) cultivation.equipMain(def.value.id)
  }

  function toggleSub(): void {
    if (!def.value) return
    const ok = cultivation.toggleSub(def.value.id, dongfu.subGongfaSlots)
    if (!ok) ui.toast(gongfaSubFullToast(dongfu.subGongfaSlots), 'warn')
  }
</script>
