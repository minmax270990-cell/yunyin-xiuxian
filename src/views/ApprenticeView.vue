<template>
  <div class="stagger-in space-y-4 px-4 pb-6 pt-4">
    <!-- 门面:槽位 + 灵石 + 招道童入口 -->
    <div class="card-ink flex items-center justify-between px-4 py-3">
      <div>
        <p class="font-kai text-[14px] tracking-widest text-ink">Đạo Đồng</p>
        <p class="text-[10px] text-ink-faint">Đạo đồng làm việc · Tự động phát triển</p>
      </div>
      <div class="flex items-center gap-3">
        <p class="flex items-center gap-1 tabular text-[13px] text-gold-ink">
          <GameIcon name="gem" :size="14" />{{ formatGN(resources.spiritStone) }}
        </p>
        <button class="btn-seal shrink-0 !px-2.5 !py-2 !text-[11px]" :disabled="slotsFull || !canAffordRecruit" :title="!canAffordRecruit ? 'Linh thạch không đủ' : undefined" @click="doRecruit">
          Thu Đạo Đồng<span v-if="!slotsFull" class="ml-1 text-[10px]">
            {{ canAffordRecruit ? `(${recruitCostLine})` : `(Linh thạch không đủ: cần ${formatGN(recruitCost)}, còn ${formatGN(resources.spiritStone)})` }}
          </span>
        </button>
      </div>
    </div>

    <!-- 道童列表 -->
    <section>
      <SectionTitle title="Đạo Đồng Dưới Trướng" :hint="`${appr.apprentices.length}/${slots}`" />
      <div class="mt-1 flex items-center justify-between gap-2 px-1">
        <span class="text-[10px] text-ink-faint">Một nút phái việc theo nhu cầu · Chỉ động đạo đồng rảnh rỗi</span>
        <button class="btn-seal shrink-0 !px-2.5 !py-2 !text-[11px]" :disabled="!hasIdle" @click="doDispatchAll">
          <GameIcon name="users" :size="12" />Tận Dụng Sở Trường
        </button>
      </div>
      <div class="mt-2 space-y-2">
        <div v-for="a in apprenticesList" :key="a.uid" class="card-ink p-3">
          <!-- 顶部:名号 / 境界层 / 状态 -->
          <div class="flex items-center gap-2">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-jade/15 font-kai text-[15px] text-jade">
              {{ a.def.name[0] }}
            </span>
            <div class="min-w-0 grow">
              <p class="flex items-center gap-2 truncate font-kai text-[14px] text-ink">
                {{ a.def.name }}
                <span class="rounded bg-gold-ink/10 px-1.5 text-[10px] text-gold-ink">Tầng {{ a.level }}</span>
                <span class="rounded bg-jade/10 px-1.5 text-[10px] text-jade">{{ a.bondTitle }}</span>
              </p>
              <p class="truncate text-[10px] text-ink-faint">{{ a.def.desc }}</p>
            </div>
          </div>

          <!-- 状态行:忙 / 闲 -->
          <div v-if="a.busy" class="mt-2 flex items-center justify-between rounded bg-ink/4 px-2.5 py-2">
            <span class="flex items-center gap-1.5 text-[12px] text-ink-soft">
              <GameIcon :name="a.taskIcon" :size="14" />{{ a.taskName }}
            </span>
            <span class="tabular text-[11px] text-azure">Còn khoảng {{ formatCountdown(a.remainingSec) }}</span>
          </div>
          <div v-else class="mt-2 flex flex-wrap items-center gap-1.5">
            <button
              v-for="t in TASKS"
              :key="t.spec"
              class="btn-ghost shrink-0 !px-2.5 !py-2 !text-[11px]"
              :title="t.desc"
              @click="dispatcher(a.uid, t.spec)"
            >
              <GameIcon :name="t.icon" :size="12" />{{ t.name }}<span class="ml-0.5 text-[9px] text-ink-faint">{{ Math.round(t.seconds / 60) }}phút</span>
            </button>
            <span v-if="!a.busy" class="text-[10px] text-ink-faint"> · {{ a.talentNote }}</span>
          </div>
        </div>
        <p v-if="apprenticesList.length === 0" class="px-2 py-4 text-center text-[11px] text-ink-faint">
          Chưa có đạo đồng nào —— Hãy thu nhận một đạo đồng nhập môn để môn đình thêm sinh khí.
        </p>
      </div>
      <p class="mt-2 text-[10px] leading-relaxed text-ink-faint">
        Đạo đồng làm việc theo thời gian thực, ngoại tuyến cũng tính theo thời hạn này; khi trở về sẽ mang theo tài nguyên. Làm việc đúng thiên phú sản lượng càng dồi dào hơn.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { formatCountdown, formatGN } from '@/utils/format'
  import { stoneByTier } from '@/core/formulas'
  import { maxTierForMajor } from '@/data/regions'
  import { pillDef } from '@/data/pills'
  import { usePlayerStore } from '@/stores/player'
  import { useResourcesStore } from '@/stores/resources'
  import { useApprenticeStore } from '@/stores/apprentice'
  import { useUiStore } from '@/stores/ui'
  import {
    APPRENTICE_TASKS,
    RECRUIT_COST_TIER_AMOUNT,
    apprenticeDef,
    apprenticeSlots,
    bondTitle,
    type ApprenticeSpec
  } from '@/data/apprentices'
  import type { TaskSpoils } from '@/core/apprenticeService'
  import { HERB_GRADE_NAMES, herbGradeOfMajor } from '@/data/herbGrades'
  import SectionTitle from '@/components/common/SectionTitle.vue'
  import GameIcon from '@/components/common/GameIcon.vue'

  const TASKS = APPRENTICE_TASKS

  const player = usePlayerStore()
  const resources = useResourcesStore()
  const appr = useApprenticeStore()
  const ui = useUiStore()

  const now = ref(Date.now())
  let timer: ReturnType<typeof setInterval> | undefined

  const slots = computed(() => apprenticeSlots(player.major))
  const slotsFull = computed(() => appr.apprentices.length >= slots.value)
  const hasIdle = computed(() => appr.apprentices.some(a => a.task === null))
  const recruitCost = computed(() => stoneByTier(maxTierForMajor(player.major), RECRUIT_COST_TIER_AMOUNT))
  const canAffordRecruit = computed(() => resources.hasStone(recruitCost.value))
  const recruitCostLine = computed(() => `${formatGN(recruitCost.value)} Linh thạch`)

  const apprenticesList = computed(() =>
    appr.apprentices.map(a => {
      const def = apprenticeDef(a.archId)!
      const busy = a.task !== null
      const task = busy ? APPRENTICE_TASKS.find(t => t.spec === a.task!.spec)! : null
      return {
        uid: a.uid,
        level: a.level,
        bondTitle: bondTitle(a.bond),
        def,
        busy,
        taskName: task?.name ?? '',
        taskIcon: task?.icon ?? '',
        remainingSec: busy ? Math.max(0, (a.task!.finishAt - now.value) / 1000) : 0,
        talentNote: `Thiên phú: ${APPRENTICE_TASKS.find(t => t.spec === def.talent)?.name ?? ''}`
      }
    })
  )

  function dispatcher(uid: string, spec: ApprenticeSpec): void {
    if (appr.dispatch(uid, spec, Date.now())) {
      ui.toast('Đã phái đạo đồng xuất phát', 'info')
    }
  }

  function doDispatchAll(): void {
    // 按钮在无闲置道童时禁用,dispatchAll 恒派 ≥1 名 —— 无兜底死分支
    const n = appr.dispatchAll(now.value)
    if (n > 0) ui.toast(`Đã phái ${n} đạo đồng theo nhu cầu`, 'info')
  }

  function doRecruit(): void {
    const result = appr.recruit(player.major)
    if (result === 'ok') ui.toast('Thu nhận một đạo đồng mới nhập môn', 'success')
    else if (result === 'poor') ui.toast('Linh thạch không đủ', 'warn')
    else ui.toast('Môn hạ đã đầy', 'info')
  }

  function spoilsText(s: TaskSpoils): string {
    const parts: string[] = []
    if (s.herb) parts.push(`${HERB_GRADE_NAMES[herbGradeOfMajor(player.major)]}×${s.herb}`)
    if (s.ore) parts.push(`Huyền thiết×${s.ore}`)
    if (s.dust) parts.push(`Khí trần×${s.dust}`)
    if (s.wudao) parts.push(`Ngộ đạo×${s.wudao}`)
    if (s.stone) parts.push(`Linh thạch ${formatGN(s.stone)}`)
    if (s.pillId) parts.push(`${pillDef(s.pillId)?.name ?? 'Đan dược'}×${s.pillCount ?? 1}`)
    return parts.join(' · ')
  }

  /** 收割所有已完工道童;回来的就报一声带回什么 */
  function reap(): void {
    const reaped = appr.collectFinished(now.value, player.major)
    if (reaped.length === 0) return
    // ui.toast 会按「同文 + 同级」去重刷新同一条:两名道童带回一模一样的「悟道×2」时,
    // 逐条 toast 会被第二条顶掉 —— 明明回了两位却只报一位。批量就合成一条汇总
    if (reaped.length === 1) {
      ui.toast(`Đạo đồng trở về, mang theo ${spoilsText(reaped[0]!)}`, 'success')
      return
    }
    ui.toast(`${reaped.length} đạo đồng trở về: ${reaped.map(s => spoilsText(s)).join(';')}`, 'success')
  }

  onMounted(() => {
    appr.sync()
    reap()
    timer = setInterval(() => {
      now.value = Date.now()
      reap()
    }, 1000)
  })
  onUnmounted(() => {
    if (timer !== undefined) clearInterval(timer)
  })
</script>
