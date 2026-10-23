<template>
  <div class="flex items-baseline gap-2 px-1">
    <span class="brush-bar h-3 w-0.75 rounded bg-cinnabar/80" />
    <h2 class="font-kai text-[15px] tracking-[0.25em] text-ink">{{ displayTitle }}</h2>
    <span v-if="hint" class="text-[11px] text-ink-faint">{{ hint }}</span>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps<{ title: string; hint?: string }>()

  const SECTION_TITLE_VI: Record<string, string> = {
    '界域志': 'Giới Vực Chí',
    '典籍': 'Điển Tịch',
    '周易': 'Chu Dịch',
    '紫微': 'Tử Vi',
    '星象': 'Tinh Tượng',
    '奇门': 'Kỳ Môn',
    '待续': 'Chờ Đón'
  }

  const displayTitle = computed(() => SECTION_TITLE_VI[props.title] ?? props.title)
</script>
