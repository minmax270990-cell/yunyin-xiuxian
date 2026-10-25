<template>
  <BaseModal :open="open" title="Bồi Dưỡng Linh Căn · Linh Quả" @close="emit('close')">
    <div class="space-y-3.5 text-[12px]">
      <!-- Tổng quan Linh Căn -->
      <div class="rounded-lg border border-ink/15 bg-paper-deep/60 p-3">
        <div class="flex items-center justify-between border-b border-ink/10 pb-2">
          <div>
            <span class="font-kai text-[14px] text-cinnabar">
              {{ player.linggen?.gradeName ?? 'Chưa thức tỉnh' }}
            </span>
            <span class="ml-2 text-[10px] text-ink-faint">
              (Hệ số tu luyện: <strong class="text-gold-ink">×{{ player.linggen?.growthMult.toFixed(2) }}</strong>)
            </span>
          </div>
          <span class="text-[10px] text-ink-faint">Cực hạn: 100 điểm</span>
        </div>

        <!-- Danh sách các rễ linh căn & tư chất hiện tại -->
        <div class="mt-2.5 space-y-2">
          <div
            v-for="root in player.linggen?.roots ?? []"
            :key="root.element"
            class="flex items-center gap-2 rounded bg-paper px-2 py-1.5 border border-ink/5"
          >
            <span
              class="grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-kai"
              :style="{ borderColor: ELEMENTS[root.element].color, color: ELEMENTS[root.element].color }"
            >
              {{ ELEMENTS[root.element].char }}
            </span>
            <div class="grow min-w-0">
              <div class="flex justify-between text-[11px] leading-tight">
                <span class="font-medium" :style="{ color: ELEMENTS[root.element].color }">
                  {{ ELEMENTS[root.element].name }} Linh Căn
                </span>
                <span class="tabular font-bold" :class="root.aptitude >= 100 ? 'text-gold-ink' : 'text-ink-soft'">
                  {{ root.aptitude }} / 100
                </span>
              </div>
              <div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :style="{
                    width: `${Math.min(100, root.aptitude)}%`,
                    backgroundColor: ELEMENTS[root.element].color
                  }"
                />
              </div>
            </div>
            <span
              v-if="root.aptitude >= 100"
              class="text-[9px] font-kai text-gold-ink px-1 rounded bg-gold-ink/10 shrink-0"
            >
              Viên Mãn
            </span>
          </div>
        </div>
      </div>

      <!-- Kho Linh Căn Quả -->
      <div class="space-y-2">
        <p class="font-kai text-[13px] text-ink flex items-center justify-between">
          <span>Linh Căn Quả Trong Túi</span>
          <span class="text-[10px] font-normal text-ink-faint">Nguồn: Rơi từ Bí Cảnh</span>
        </p>

        <div
          v-for="tier in SPIRIT_ROOT_FRUIT_TIERS"
          :key="tier"
          class="rounded-lg border border-ink/10 bg-paper-deep/40 p-2.5 space-y-2"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2">
              <div
                class="grid h-7 w-7 place-items-center rounded-md border"
                :style="{ borderColor: SPIRIT_ROOT_FRUITS[tier].color, color: SPIRIT_ROOT_FRUITS[tier].color }"
              >
                <GameIcon name="sparkles" :size="16" />
              </div>
              <div>
                <p class="font-kai text-[12px] text-ink font-medium">
                  {{ SPIRIT_ROOT_FRUITS[tier].name }}
                </p>
                <p class="text-[10px] text-cinnabar">
                  +{{ SPIRIT_ROOT_FRUITS[tier].bonus }} Tư chất mỗi quả
                </p>
              </div>
            </div>
            <div class="text-right">
              <span class="text-[11px] tabular font-medium text-ink">
                ×{{ formatNum(resources.fruitCount(tier)) }}
              </span>
            </div>
          </div>

          <p class="text-[10px] leading-relaxed text-ink-faint">
            {{ SPIRIT_ROOT_FRUITS[tier].desc }}
          </p>

          <!-- Nút hành động dùng quả -->
          <div class="flex items-center justify-end gap-1.5 pt-1 border-t border-ink/5">
            <button
              class="btn-seal !py-1 !px-2.5 text-[10px]"
              :disabled="resources.fruitCount(tier) < 1 || allRootsMaxed"
              @click="useFruit(tier, 1)"
            >
              Phục Dụng 1
            </button>
            <button
              v-if="resources.fruitCount(tier) >= 5"
              class="btn-ghost !py-1 !px-2 text-[10px]"
              :disabled="allRootsMaxed"
              @click="useFruit(tier, Math.min(10, resources.fruitCount(tier)))"
            >
              Dùng {{ Math.min(10, resources.fruitCount(tier)) }}
            </button>
            <button
              v-if="resources.fruitCount(tier) > 1"
              class="btn-ghost !py-1 !px-2 text-[10px]"
              :disabled="allRootsMaxed"
              @click="useFruit(tier, resources.fruitCount(tier))"
            >
              Dùng Hết
            </button>
          </div>
        </div>
      </div>

      <!-- Chỉ dẫn nguồn gốc -->
      <div class="rounded bg-ink/5 p-2 text-[10px] leading-relaxed text-ink-faint">
        <span class="text-ink font-medium">Gợi ý thám hiểm:</span>
        Linh Căn Quả là dị bảo thiên địa hiếm hoi có khả năng nghịch thiên cải mệnh, chỉ có thể rơi ra khi vượt qua các tầng hiểm trở trong <strong>Bí Cảnh</strong> với xác suất thấp.
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import BaseModal from '@/components/common/BaseModal.vue'
  import GameIcon from '@/components/common/GameIcon.vue'
  import { usePlayerStore } from '@/stores/player'
  import { useResourcesStore } from '@/stores/resources'
  import { useUiStore } from '@/stores/ui'
  import { ELEMENTS } from '@/data/linggen'
  import { SPIRIT_ROOT_FRUITS, SPIRIT_ROOT_FRUIT_TIERS, type SpiritRootFruitTier } from '@/data/spiritRootFruit'
  import { formatNum } from '@/utils/format'
  import { playSfx } from '@/core/audio'

  defineProps<{
    open: boolean
  }>()

  const emit = defineEmits<{
    (e: 'close'): void
  }>()

  const player = usePlayerStore()
  const resources = useResourcesStore()
  const ui = useUiStore()

  const allRootsMaxed = computed(() => {
    const roots = player.linggen?.roots ?? []
    return roots.length > 0 && roots.every(r => r.aptitude >= 100)
  })

  function useFruit(tier: SpiritRootFruitTier, count: number): void {
    const res = player.consumeSpiritRootFruit(tier, count)
    if (res.ok) {
      playSfx('success')
      ui.toast(res.message, 'success')
    } else {
      playSfx('warn')
      ui.toast(res.message, 'warn')
    }
  }
</script>
