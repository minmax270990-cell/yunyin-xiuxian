<template>
  <BaseModal
    :open="open"
    :title="`Tặng Lễ Vật · ${targetName}`"
    top
    @close="$emit('close')"
  >
    <div class="space-y-3.5 text-[12px]">
      <!-- HEADER THÔNG TIN ĐỐI TƯỢNG VÀ HẠN MỨC -->
      <div class="card-ink p-3 space-y-1.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-kai font-bold text-ink text-[14px]">{{ targetName }}</span>
            <span
              class="rounded px-1.5 py-0.2 text-[9px] font-kai border"
              :class="targetType === 'daolu'
                ? 'border-cinnabar/40 bg-cinnabar/10 text-cinnabar'
                : targetType === 'disciple'
                  ? 'border-gold-ink/40 bg-gold-ink/10 text-gold-ink'
                  : 'border-azure/40 bg-azure/10 text-azure'"
            >
              {{ targetType === 'daolu' ? 'Đạo Lữ' : targetType === 'disciple' ? 'Môn Hạ Đệ Tử' : 'Tu Sĩ Thế Giới' }}
            </span>
          </div>

          <!-- Lần tặng còn lại -->
          <span class="text-[10px] text-ink-faint tabular">
            {{ remainingGiftText }}
          </span>
        </div>
        <p class="text-[10px] text-ink-faint">
          Tặng linh thạch, đan dược, tài nguyên hoặc trang bị pháp bảo giúp bồi dưỡng tu vi, gia tăng tình cảm và thực lực chiến đấu.
        </p>
      </div>

      <!-- BẢNG THÔNG BÁO PHẢN HỒI NỘI BỘ -->
      <div
        v-if="feedback"
        class="rounded p-2 text-[11px] leading-relaxed border transition-all animate-ink-pop"
        :class="feedback.type === 'success'
          ? 'bg-jade/10 text-jade border-jade/30'
          : 'bg-cinnabar/10 text-cinnabar border-cinnabar/30'"
      >
        {{ feedback.message }}
      </div>

      <!-- THANH ĐIỀU HƯỚNG LOẠI QUÀ TẶNG -->
      <div class="flex border-b border-ink/15 text-[11px]">
        <button
          v-for="t in TABS"
          :key="t.id"
          class="flex-1 py-1.5 font-kai text-center transition-colors border-b-2"
          :class="activeTab === t.id
            ? 'border-cinnabar text-cinnabar font-semibold'
            : 'border-transparent text-ink-faint hover:text-ink'"
          @click="activeTab = t.id"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- ================================================================= -->
      <!-- TAB 1: LINH THẠCH (STONE) -->
      <!-- ================================================================= -->
      <div v-if="activeTab === 'stone'" class="space-y-3">
        <div class="flex items-center justify-between text-[11px]">
          <span class="text-ink-soft">Linh thạch trong túi:</span>
          <span class="font-kai font-bold text-gold-ink tabular">{{ formatGN(resources.spiritStone) }}</span>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="amt in [300, 800, 1500, 3000, 5000, 10000]"
            :key="amt"
            class="btn-seal text-[11px] py-1.5 px-2 flex items-center justify-between"
            :disabled="isSubmitting || toNum(resources.spiritStone) < amt || isGiftExhausted"
            :class="(toNum(resources.spiritStone) < amt || isGiftExhausted) ? 'opacity-40 cursor-not-allowed' : ''"
            @click="handleGiftStone(amt)"
          >
            <span>{{ amt.toLocaleString() }}</span>
            <span class="text-[9px] text-ink-faint">Linh Thạch</span>
          </button>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- TAB 2: ĐAN DƯỢC (PILL) -->
      <!-- ================================================================= -->
      <div v-else-if="activeTab === 'pill'" class="space-y-2.5">
        <div v-if="availablePills.length === 0" class="card-ink p-4 text-center text-ink-faint italic text-[11px]">
          Hành trang hiện không có đan dược khả dụng.
        </div>
        <div v-else class="space-y-1.5 max-h-[42vh] overflow-y-auto pr-1">
          <div
            v-for="p in availablePills"
            :key="p.id"
            class="card-ink p-2 flex items-center justify-between gap-2"
          >
            <div class="min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="font-kai font-semibold text-ink text-[12px] truncate">{{ p.name }}</span>
                <QualityTag v-if="p.quality" :quality="p.quality" />
                <span class="text-ink-faint text-[10px] tabular">(x{{ p.count }})</span>
              </div>
              <p v-if="p.desc" class="text-[10px] text-ink-faint truncate max-w-[200px]">{{ p.desc }}</p>
            </div>
            <button
              class="btn-seal text-[10px] py-1 px-2.5 shrink-0"
              :disabled="isSubmitting || isGiftExhausted"
              :class="isGiftExhausted ? 'opacity-40 cursor-not-allowed' : ''"
              @click="handleGiftPill(p.id)"
            >
              {{ targetType === 'disciple' ? 'Ban Thưởng' : 'Tặng' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- TAB 3: LINH THẢO (HERB) -->
      <!-- ================================================================= -->
      <div v-else-if="activeTab === 'herb'" class="space-y-2">
        <div
          v-for="g in [1, 2, 3, 4, 5]"
          :key="g"
          class="card-ink p-2 flex items-center justify-between"
        >
          <div>
            <span class="font-kai font-semibold text-ink text-[12px]">Linh Thảo Phẩm {{ g }}</span>
            <span class="text-ink-faint text-[10px] ml-2 tabular">Còn: {{ resources.herbOf(g as any) }}</span>
          </div>
          <button
            class="btn-seal text-[10px] py-1 px-2.5"
            :disabled="isSubmitting || resources.herbOf(g as any) <= 0 || isGiftExhausted"
            :class="(resources.herbOf(g as any) <= 0 || isGiftExhausted) ? 'opacity-40 cursor-not-allowed' : ''"
            @click="handleGiftHerb(g)"
          >
            Tặng 1 Cọng
          </button>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- TAB 4: HUYỀN THIẾT (ORE) -->
      <!-- ================================================================= -->
      <div v-else-if="activeTab === 'ore'" class="space-y-3">
        <div class="flex items-center justify-between text-[11px]">
          <span class="text-ink-soft">Huyền thiết khoáng thạch:</span>
          <span class="font-kai font-bold text-azure tabular">{{ resources.ore }} quặng</span>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="amt in [1, 5, 10]"
            :key="amt"
            class="btn-seal text-[11px] py-1.5 px-2"
            :disabled="isSubmitting || resources.ore < amt || isGiftExhausted"
            :class="(resources.ore < amt || isGiftExhausted) ? 'opacity-40 cursor-not-allowed' : ''"
            @click="handleGiftOre(amt)"
          >
            Tặng {{ amt }} quặng
          </button>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- TAB 5: TRANG BỊ & PHÁP BẢO (EQUIPMENT) -->
      <!-- ================================================================= -->
      <div v-else-if="activeTab === 'equipment'" class="space-y-2.5">
        <p class="text-[10px] text-ink-faint">
          Khi nhận trang bị, NPC sẽ thẩm định ngay lập tức. Nếu món mới tốt hơn trang bị hiện tại, NPC sẽ chủ động mặc lên thân!
        </p>

        <div v-if="availableEquipments.length === 0" class="card-ink p-4 text-center text-ink-faint italic text-[11px]">
          Hành trang hiện không có trang bị dự trữ để tặng.
        </div>
        <div v-else class="space-y-2 max-h-[42vh] overflow-y-auto pr-1">
          <div
            v-for="eq in availableEquipments"
            :key="eq.uid"
            class="card-ink p-2.5 space-y-1.5"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="min-w-0 flex items-center gap-1.5 flex-wrap">
                <span class="font-kai font-bold text-[12px] text-ink">{{ eq.name }}</span>
                <QualityTag :quality="eq.quality" />
                <span class="rounded px-1.5 py-0.2 text-[9px] bg-paper-deep text-ink-soft border border-ink/10">
                  {{ eq.slotName }}
                </span>
                <span class="text-[10px] text-ink-faint tabular">Bậc {{ eq.tier }} · Lv.{{ eq.level }}</span>
              </div>

              <button
                class="btn-seal text-[10px] py-1 px-3 shrink-0"
                :disabled="isSubmitting || isGiftExhausted"
                :class="isGiftExhausted ? 'opacity-40 cursor-not-allowed' : ''"
                @click="handleGiftEquipment(eq.uid)"
              >
                {{ targetType === 'disciple' ? 'Ban Thưởng' : 'Tặng' }}
              </button>
            </div>

            <!-- Chỉ số & Điểm thực lực -->
            <div class="flex items-center justify-between text-[10px] text-ink-faint border-t border-ink/10 pt-1">
              <span>Đánh giá thực lực: <strong class="text-cinnabar tabular">{{ eq.score }}</strong></span>
              <span v-if="eq.affixCount > 0" class="text-azure tabular">{{ eq.affixCount }} từ điều</span>
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER ĐÓNG -->
      <div class="flex justify-end pt-2 border-t border-ink/10">
        <button class="btn-ghost !px-5 !py-1.5 !text-[12px]" @click="$emit('close')">
          Đóng
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import BaseModal from '@/components/common/BaseModal.vue'
  import QualityTag from '@/components/common/QualityTag.vue'
  import type { ElementId, QualityId } from '@/types'
  import { useInventoryStore } from '@/stores/inventory'
  import { useResourcesStore } from '@/stores/resources'
  import { useNpcStore } from '@/stores/npc'
  import { useApprenticeStore } from '@/stores/apprentice'
  import { giftToDaolu } from '@/core/daoluInteractionService'
  import { giftToWorldNpc } from '@/core/npcService'
  import { equipmentTemplate } from '@/data/equipment'
  import { pillDef } from '@/data/pills'
  import { displayPillName, displayEquipName } from '@/ui/displayZhVi'
  import { formatGN } from '@/utils/format'
  import { toNum } from '@/utils/gnum'
  import { calcEquipCombatScore, VI_SLOT_NAMES } from '@/core/npcEquipmentService'

  const props = defineProps<{
    open: boolean
    targetId: string
    targetName: string
    targetType: 'daolu' | 'disciple' | 'npc'
    targetGender?: 'male' | 'female'
    targetMajor?: number
    targetSub?: number
    targetElement?: ElementId
  }>()

  const emit = defineEmits<{
    (e: 'close'): void
    (e: 'gifted', result: { success: boolean; message: string }): void
  }>()

  const inventory = useInventoryStore()
  const resources = useResourcesStore()
  const npcStore = useNpcStore()
  const sectStore = useApprenticeStore()

  const activeTab = ref<'stone' | 'pill' | 'herb' | 'ore' | 'equipment'>('stone')
  const isSubmitting = ref(false)
  const feedback = ref<{ type: 'success' | 'warn'; message: string } | null>(null)

  const TABS = [
    { id: 'stone', label: 'Linh Thạch' },
    { id: 'pill', label: 'Đan Dược' },
    { id: 'herb', label: 'Linh Thảo' },
    { id: 'ore', label: 'Huyền Thiết' },
    { id: 'equipment', label: 'Trang Bị' }
  ] as const

  const remainingGiftText = computed(() => {
    if (props.targetType === 'daolu') {
      const count = npcStore.getInteractionCount(props.targetId, 'gift')
      return `Còn ${Math.max(0, 3 - count)}/3 lần tặng tháng này`
    }
    if (props.targetType === 'npc') {
      const count = npcStore.getInteractionCount(props.targetId, 'gift')
      return `Còn ${Math.max(0, 1 - count)}/1 lần tặng tháng này`
    }
    return 'Ban thưởng đệ tử môn phái'
  })

  const isGiftExhausted = computed(() => {
    if (props.targetType === 'daolu') {
      return npcStore.getInteractionCount(props.targetId, 'gift') >= 3
    }
    if (props.targetType === 'npc') {
      return npcStore.getInteractionCount(props.targetId, 'gift') >= 1
    }
    return false
  })

  // Đan dược có trong túi đồ
  const availablePills = computed(() => {
    const list: Array<{ id: string; name: string; count: number; desc?: string; quality?: QualityId }> = []
    for (const [id, count] of Object.entries(inventory.pills)) {
      if (count && count > 0) {
        const def = pillDef(id)
        list.push({
          id,
          name: def ? displayPillName(def.name) : id,
          count,
          desc: def?.desc,
          quality: def?.quality
        })
      }
    }
    return list
  })

  // Trang bị unequipped có trong túi đồ
  const availableEquipments = computed(() => {
    return inventory.bagItems.map(item => {
      const tpl = equipmentTemplate(item.templateId)
      const slotName = tpl ? (VI_SLOT_NAMES[tpl.slot] || tpl.slot) : 'Pháp Bảo'
      const score = calcEquipCombatScore(item, props.targetElement)
      return {
        uid: item.uid,
        name: tpl ? displayEquipName(tpl.name) : item.templateId,
        quality: item.quality,
        slotName,
        tier: item.tier || 1,
        level: item.level || 0,
        affixCount: item.affixes?.length || 0,
        score
      }
    })
  })

  function setFeedback(type: 'success' | 'warn', message: string): void {
    feedback.value = { type, message }
    emit('gifted', { success: type === 'success', message })
  }

  // Gửi Linh thạch
  async function handleGiftStone(amount: number): Promise<void> {
    if (isSubmitting.value) return
    isSubmitting.value = true
    try {
      if (props.targetType === 'daolu') {
        const res = giftToDaolu('stone', amount)
        setFeedback(res.success ? 'success' : 'warn', res.message)
      } else if (props.targetType === 'disciple') {
        const ok = sectStore.rewardDiscipleStones(props.targetId, amount)
        if (ok) {
          setFeedback('success', `Đã ban thưởng ${amount.toLocaleString()} Linh thạch cho ${props.targetName}!`)
        } else {
          setFeedback('warn', 'Không đủ Linh thạch hoặc đệ tử không hợp lệ.')
        }
      } else if (props.targetType === 'npc') {
        const res = giftToWorldNpc(props.targetId, 'stone', amount)
        setFeedback(res.success ? 'success' : 'warn', res.message)
      }
    } finally {
      isSubmitting.value = false
    }
  }

  // Gửi Đan dược
  async function handleGiftPill(pillId: string): Promise<void> {
    if (isSubmitting.value) return
    isSubmitting.value = true
    try {
      if (props.targetType === 'daolu') {
        const res = giftToDaolu('pill', pillId)
        setFeedback(res.success ? 'success' : 'warn', res.message)
      } else if (props.targetType === 'disciple') {
        const res = sectStore.rewardDiscipleItem(props.targetId, 'pill', pillId)
        setFeedback(res.success ? 'success' : 'warn', res.message)
      } else if (props.targetType === 'npc') {
        const res = giftToWorldNpc(props.targetId, 'pill', pillId)
        setFeedback(res.success ? 'success' : 'warn', res.message)
      }
    } finally {
      isSubmitting.value = false
    }
  }

  // Gửi Linh thảo
  async function handleGiftHerb(grade: number): Promise<void> {
    if (isSubmitting.value) return
    isSubmitting.value = true
    try {
      if (props.targetType === 'daolu') {
        const res = giftToDaolu('herb', grade)
        setFeedback(res.success ? 'success' : 'warn', res.message)
      } else if (props.targetType === 'disciple') {
        const res = sectStore.rewardDiscipleItem(props.targetId, 'herb', grade)
        setFeedback(res.success ? 'success' : 'warn', res.message)
      } else if (props.targetType === 'npc') {
        const res = giftToWorldNpc(props.targetId, 'herb', grade)
        setFeedback(res.success ? 'success' : 'warn', res.message)
      }
    } finally {
      isSubmitting.value = false
    }
  }

  // Gửi Huyền thiết
  async function handleGiftOre(amount: number): Promise<void> {
    if (isSubmitting.value) return
    isSubmitting.value = true
    try {
      if (props.targetType === 'daolu') {
        const res = giftToDaolu('ore')
        setFeedback(res.success ? 'success' : 'warn', res.message)
      } else if (props.targetType === 'disciple') {
        const res = sectStore.rewardDiscipleItem(props.targetId, 'ore', amount)
        setFeedback(res.success ? 'success' : 'warn', res.message)
      } else if (props.targetType === 'npc') {
        const res = giftToWorldNpc(props.targetId, 'ore')
        setFeedback(res.success ? 'success' : 'warn', res.message)
      }
    } finally {
      isSubmitting.value = false
    }
  }

  // Gửi Trang bị & Pháp bảo
  async function handleGiftEquipment(uid: string): Promise<void> {
    if (isSubmitting.value) return
    isSubmitting.value = true
    try {
      if (props.targetType === 'daolu') {
        const res = giftToDaolu('equipment', uid)
        setFeedback(res.success ? 'success' : 'warn', res.message)
      } else if (props.targetType === 'disciple') {
        const res = sectStore.rewardDiscipleItem(props.targetId, 'equipment', uid)
        setFeedback(res.success ? 'success' : 'warn', res.message)
      } else if (props.targetType === 'npc') {
        const res = giftToWorldNpc(props.targetId, 'equipment', uid)
        setFeedback(res.success ? 'success' : 'warn', res.message)
      }
    } finally {
      isSubmitting.value = false
    }
  }
</script>
