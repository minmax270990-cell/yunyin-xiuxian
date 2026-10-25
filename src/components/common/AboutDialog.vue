<template>
  <BaseModal :open="open" title="Về Chúng Tôi" @close="$emit('close')">
    <div class="space-y-3 text-[12px] leading-relaxed">
      <p class="text-ink-faint">《Thiên Đạo》—— Nhất niệm tu hành, vạn pháp quy tông.</p>
      <div class="card-ink px-3 py-2">
        <p class="text-[10px] text-ink-faint">Phiên bản hiện tại</p>
        <p class="font-kai text-[14px] text-ink tabular">v{{ version }}</p>
      </div>
      <div class="card-ink px-3 py-2">
        <p class="text-[10px] text-ink-faint">Kho mã nguồn mở</p>
        <!-- Vùng bấm liên kết inline tối thiểu 30px -->
        <a
          href="https://github.com/setube/yunyin-xiuxian"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-block py-1.5 text-azure underline break-all"
        >
          github.com/setube/yunyin-xiuxian
        </a>
      </div>
      <div class="card-ink px-3 py-2">
        <p class="text-[10px] text-ink-faint">Nhóm giao lưu QQ</p>
        <p class="text-ink tabular">920930589</p>
      </div>
    </div>
    <template #footer>
      <button class="btn-seal w-full" @click="$emit('close')">Đã Hiểu</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
  import BaseModal from './BaseModal.vue'
  import pkg from '../../../package.json'

  defineProps<{
    open: boolean
  }>()

  defineEmits<{
    close: []
  }>()

  const version = pkg.version
</script>
