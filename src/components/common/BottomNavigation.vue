<template>
  <nav
    class="relative z-20 shrink-0 border-t border-ink/15 bg-paper-deep/95 backdrop-blur"
    :style="`padding-bottom: max(env(safe-area-inset-bottom), ${navInset}px)`"
  >
    <div class="ink-divider absolute -top-px inset-x-0" />
    <div class="grid grid-cols-5">
      <RouterLink
        v-for="tab in TABS"
        :key="tab.name"
        :to="tab.to"
        class="relative flex flex-col items-center gap-0.5 py-2 transition-colors short:gap-0 short:py-1"
        :class="route.name === tab.name ? 'text-cinnabar' : 'text-ink-faint active:text-ink-soft'"
      >
        <span class="transition-transform duration-200" :class="route.name === tab.name ? '-translate-y-0.5 scale-110' : ''">
          <GameIcon :name="tab.icon" :size="20" />
        </span>
        <span class="font-kai text-[10px] sm:text-[11px] tracking-wide whitespace-nowrap short:text-[9px]">{{ tab.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
  import { useRoute } from 'vue-router'
  import { useNativeInsets } from '@/composables/useNativeInsets'
  import GameIcon from './GameIcon.vue'

  const route = useRoute()
  // 安卓三键导航的按钮高度(手势导航与非安卓平台为 0),与 env() 取大者垫在底下
  const { bottom: navInset } = useNativeInsets()

  const TABS = [
    { name: 'home', label: 'Động Phủ', icon: 'mountain', to: '/' },
    { name: 'cultivation', label: 'Tu Luyện', icon: 'flame', to: '/cultivation' },
    { name: 'adventure', label: 'Lịch Luyện', icon: 'swords', to: '/adventure' },
    { name: 'inventory', label: 'Túi Đồ', icon: 'backpack', to: '/inventory' },
    { name: 'character', label: 'Nhân Vật', icon: 'circle-user', to: '/character' }
  ] as const
</script>
