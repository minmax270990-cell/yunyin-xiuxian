<template>
  <BaseModal :open="open" title="Tàng Kinh Các · Điển Tịch Thập Di" :wide="true" @close="$emit('close')">
    <div class="space-y-3">
      <!-- Mô tả tàng kinh các & thống kê -->
      <div class="rounded-lg bg-ink/5 p-3 text-[12px] leading-relaxed text-ink-soft">
        <p class="font-kai text-[13px] text-ink">
          Vạn quyển điển tịch trong thiên địa đều quy về Tàng Kinh Các. Tu sĩ muốn lĩnh ngộ cần xét căn cơ cảnh giới, thuộc tính linh căn cùng ngộ tính thiên phú.
        </p>
        <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-faint">
          <span>Tổng số: <strong class="text-ink">{{ GONGFA.length }}</strong> bộ</span>
          <span>Đã học: <strong class="text-gold-ink">{{ learnedCount }}</strong> bộ</span>
          <span>Có thể tham ngộ: <strong class="text-jade">{{ canLearnCount }}</strong> bộ</span>
          <span>Chưa đủ cảnh giới: <strong class="text-cinnabar">{{ realmLockedCount }}</strong> bộ</span>
          <span>Khác linh căn: <strong class="text-ink-faint">{{ incompatibleCount }}</strong> bộ</span>
        </div>
      </div>

      <!-- Thanh chọn nhóm phân loại -->
      <div class="flex flex-wrap gap-1 border-b border-ink/10 pb-2 text-[12px]">
        <button
          v-for="tab in filterTabs"
          :key="tab.id"
          class="rounded px-2.5 py-1 transition-colors"
          :class="activeTab === tab.id ? 'bg-seal-scarlet text-paper font-bold' : 'text-ink-soft hover:bg-ink/5'"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
          <span class="text-[10px] opacity-75">({{ tab.count }})</span>
        </button>
      </div>

      <!-- Tìm kiếm & Lọc nguyên tố -->
      <div class="flex flex-wrap items-center gap-2 text-[12px]">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="Tìm pháp môn..."
          class="rounded border border-ink/20 bg-paper px-2 py-1 text-ink placeholder:text-ink-faint flex-1 min-w-[120px]"
        />
        <select
          v-model="selectedElement"
          class="rounded border border-ink/20 bg-paper px-2 py-1 text-ink"
        >
          <option value="">Tất cả hệ</option>
          <option value="none">Vô thuộc tính</option>
          <option v-for="(ele, k) in ELEMENTS" :key="k" :value="k">{{ ele.name }} Hệ</option>
        </select>
      </div>

      <!-- Danh sách pháp môn -->
      <div class="max-h-[55vh] space-y-1.5 overflow-y-auto pr-1">
        <div
          v-for="item in filteredList"
          :key="item.def.id"
          class="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-ink/15 bg-paper px-3 py-2 transition-all hover:border-ink/40 active:scale-98"
          @click="openDetail(item.def.id)"
        >
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-1.5">
              <QualityTag :quality="item.def.quality" />
              <span class="font-kai text-[13px] font-medium text-ink">
                {{ displayGongfaName(item.def.name) }}
              </span>
              <span class="chip-ink text-[10px] border-ink/30 text-ink-soft">
                {{ GONGFA_TYPE_NAMES[item.def.type] }}
              </span>
              <span
                v-if="item.def.element"
                class="chip-ink text-[10px]"
                :style="{ color: ELEMENTS[item.def.element]?.color }"
              >
                {{ ELEMENTS[item.def.element]?.name }}
              </span>
              <span v-else class="chip-ink text-[10px] text-ink-faint">Vô hệ</span>
              <span
                v-if="item.def.secretCategory"
                class="chip-ink text-[10px] border-azure/40 text-azure"
              >
                {{ SECRET_CATEGORY_NAMES[item.def.secretCategory] ?? item.def.secretCategory }}
              </span>
            </div>
            <p class="mt-1 line-clamp-1 text-[11px] text-ink-faint">
              {{ displayGongfaDesc(item.def.desc) }}
            </p>
          </div>

          <!-- Trạng thái & Tiềm năng -->
          <div class="shrink-0 text-right text-[11px]">
            <div v-if="item.level > 0" class="text-gold-ink font-bold">
              Đã học (Tầng {{ item.level }}/{{ item.def.maxLevel }})
            </div>
            <div v-else-if="item.elig.status === 'compatible'" class="text-jade font-medium">
              Có thể học
            </div>
            <div v-else-if="item.elig.status === 'conditional'" class="text-gold-ink">
              Tương thích mỏng
            </div>
            <div v-else-if="item.elig.status === 'realm_locked'" class="text-cinnabar">
              Cảnh giới {{ displayRealmName(REALMS[item.def.minRealm]?.name ?? '') }}
            </div>
            <div v-else-if="item.elig.status === 'incompatible'" class="text-ink-faint">
              Linh căn không hợp
            </div>
            <div v-else-if="item.elig.status === 'comprehension_locked'" class="text-amber-600">
              Cần ngộ tính {{ item.def.minComprehension }}
            </div>

            <div class="text-[10px] text-ink-faint">
              Tiềm năng: Tầng {{ item.elig.maxComprehendLevel }}/{{ item.def.maxLevel }}
            </div>
          </div>
        </div>

        <div v-if="filteredList.length === 0" class="py-8 text-center text-[12px] text-ink-faint">
          Không tìm thấy pháp môn nào trong mục này.
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import BaseModal from '@/components/common/BaseModal.vue'
  import QualityTag from '@/components/common/QualityTag.vue'
  import { GONGFA, GONGFA_TYPE_NAMES } from '@/data/gongfa'
  import { ELEMENTS } from '@/data/linggen'
  import { REALMS } from '@/data/realms'
  import { useCultivationStore } from '@/stores/cultivation'
  import { useUiStore } from '@/stores/ui'
  import { checkGongfaEligibility, getPlayerSnapshot } from '@/core/gongfaEligibility'
  import { displayGongfaName, displayGongfaDesc, displayRealmName } from '@/ui/displayZhVi'
  import type { SecretCategory } from '@/types'

  defineProps<{
    open: boolean
  }>()

  defineEmits<{
    (e: 'close'): void
  }>()

  const SECRET_CATEGORY_NAMES: Record<SecretCategory, string> = {
    attack: 'Công Kích',
    defense: 'Phòng Ngự',
    speed: 'Thân Pháp',
    support: 'Hỗ Trợ',
    perception: 'Thần Thức',
    special: 'Đặc Thù'
  }

  const cultivation = useCultivationStore()
  const ui = useUiStore()

  const activeTab = ref<'all' | 'canLearn' | 'learned' | 'realm_locked' | 'incompatible' | 'comprehension_locked'>('all')
  const searchKeyword = ref('')
  const selectedElement = ref('')

  const allItemsWithEligibility = computed(() => {
    const snap = getPlayerSnapshot()
    return GONGFA.map(g => {
      const curLv = cultivation.learned[g.id] ?? 0
      const elig = checkGongfaEligibility(g, snap, curLv)
      return {
        def: g,
        level: curLv,
        elig
      }
    })
  })

  const learnedCount = computed(() => allItemsWithEligibility.value.filter(i => i.level > 0).length)
  const canLearnCount = computed(() => allItemsWithEligibility.value.filter(i => i.level === 0 && i.elig.canLearn).length)
  const realmLockedCount = computed(() => allItemsWithEligibility.value.filter(i => i.level === 0 && i.elig.status === 'realm_locked').length)
  const incompatibleCount = computed(() => allItemsWithEligibility.value.filter(i => i.level === 0 && i.elig.status === 'incompatible').length)
  const compLockedCount = computed(() => allItemsWithEligibility.value.filter(i => i.level === 0 && i.elig.status === 'comprehension_locked').length)

  const filterTabs = computed(() => [
    { id: 'all' as const, label: 'Tất Cả', count: GONGFA.length },
    { id: 'canLearn' as const, label: 'Có Thể Học', count: canLearnCount.value },
    { id: 'learned' as const, label: 'Đã Học', count: learnedCount.value },
    { id: 'realm_locked' as const, label: 'Chưa Đủ Cảnh Giới', count: realmLockedCount.value },
    { id: 'incompatible' as const, label: 'Khác Linh Căn', count: incompatibleCount.value },
    { id: 'comprehension_locked' as const, label: 'Chưa Đủ Ngộ Tính', count: compLockedCount.value }
  ])

  const filteredList = computed(() => {
    return allItemsWithEligibility.value.filter(item => {
      // 1. Lọc theo tab
      if (activeTab.value === 'canLearn' && (item.level > 0 || !item.elig.canLearn)) return false
      if (activeTab.value === 'learned' && item.level === 0) return false
      if (activeTab.value === 'realm_locked' && (item.level > 0 || item.elig.status !== 'realm_locked')) return false
      if (activeTab.value === 'incompatible' && (item.level > 0 || item.elig.status !== 'incompatible')) return false
      if (activeTab.value === 'comprehension_locked' && (item.level > 0 || item.elig.status !== 'comprehension_locked')) return false

      // 2. Lọc theo hệ linh căn
      if (selectedElement.value === 'none' && item.def.element) return false
      if (selectedElement.value && selectedElement.value !== 'none' && item.def.element !== selectedElement.value) return false

      // 3. Lọc theo từ khóa
      if (searchKeyword.value.trim()) {
        const kw = searchKeyword.value.trim().toLowerCase()
        const matchName = item.def.name.toLowerCase().includes(kw) || displayGongfaName(item.def.name).toLowerCase().includes(kw)
        const matchDesc = item.def.desc.toLowerCase().includes(kw) || displayGongfaDesc(item.def.desc).toLowerCase().includes(kw)
        if (!matchName && !matchDesc) return false
      }

      return true
    })
  })

  function openDetail(id: string): void {
    ui.gongfaDetailId = id
  }
</script>
