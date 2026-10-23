<template>
  <div class="stagger-in flex min-h-full flex-col items-center justify-center px-8 py-10">
    <!-- Game Icon -->
    <div class="grid h-24 w-24 place-items-center rounded-2xl bg-cinnabar shadow-lg shadow-cinnabar/30">
      <span class="font-kai text-[36px] font-bold leading-none text-paper tracking-wider">ĐẠO</span>
    </div>

    <!-- Tên trò chơi -->
    <h1 class="mt-6 font-kai text-[36px] leading-tight tracking-[0.2em] text-ink text-center">Vân Ẩn Tu Tiên Lục</h1>
    <p class="mt-2 text-[12px] tracking-[0.3em] text-ink-faint text-center">Nhất Niệm Tu Hành · Mây Sâu Khó Biết Chốn</p>

    <!-- Nút bắt đầu -->
    <button class="btn-seal mt-10 w-full max-w-72 !py-3.5 text-[16px] tracking-[0.2em]" @click="onStart">BẮT ĐẦU TRÒ CHƠI</button>

    <!-- Liên kết chân trang: Quyền riêng tư / Nhập bản lưu / Về chúng tôi -->
    <div class="mt-6 flex items-center gap-3 text-[11px] text-ink-faint">
      <button class="inline-flex min-h-[28px] items-center active:text-ink-soft whitespace-nowrap" @click="privacyOpen = true">Quyền Riêng Tư</button>
      <span class="text-ink-faint">·</span>
      <button class="inline-flex min-h-[28px] items-center active:text-ink-soft whitespace-nowrap" @click="importOpen = true">Nhập Bản Lưu</button>
      <span class="text-ink-faint">·</span>
      <button class="inline-flex min-h-[28px] items-center active:text-ink-soft whitespace-nowrap" @click="aboutOpen = true">Về Chúng Tôi</button>
    </div>
    <input ref="fileInput" type="file" accept="application/json,.save" class="hidden" @change="onFilePicked" />

    <!-- Nhập bản lưu: Hộp thoại xác nhận -->
    <BaseModal :open="importOpen" title="Nhập Bản Lưu" @close="importOpen = false">
      <p class="text-[12px] leading-relaxed text-ink-faint">Tệp bản lưu đã xuất từ mục Cài Đặt có thể khôi phục tại đây.</p>
      <template #footer>
        <div class="flex gap-2">
          <button class="btn-ghost flex-1" @click="importOpen = false">Để Sau</button>
          <button class="btn-seal flex-1" @click="triggerImport">Chọn Tệp Bản Lưu</button>
        </div>
      </template>
    </BaseModal>

    <!-- Về chúng tôi -->
    <AboutDialog :open="aboutOpen" @close="aboutOpen = false" />

    <!-- Toàn văn chính sách quyền riêng tư -->
    <PrivacyDialog :open="privacyOpen" @close="privacyOpen = false" />

    <!-- Xác nhận điều khoản trước khi vào -->
    <BaseModal :open="agreeOpen" title="Xác Nhận Trước Khi Vào" :closable="false">
      <p class="text-[12px] leading-relaxed text-ink-faint">
        Dữ liệu trò chơi chỉ lưu trữ cục bộ trong trình duyệt của bạn, hoàn toàn không tải lên máy chủ. Thống kê lưu lượng không chứa bất kỳ dữ liệu game nào (xem chi tiết tại Chính Sách Quyền Riêng Tư). Vui lòng đọc và đồng ý trước khi bắt đầu hành trình.
      </p>
      <label class="mt-3 flex items-center gap-2">
        <input v-model="agreed" type="checkbox" class="h-4 w-4 accent-cinnabar" />
        <span class="text-[12px] text-ink-soft">
          Tôi đã đọc và đồng ý với
          <button class="inline-block py-1.5 text-azure" @click.prevent="privacyOpen = true">《Chính Sách Quyền Riêng Tư》</button>
        </span>
      </label>
      <template #footer>
        <div class="flex gap-2">
          <button class="btn-ghost flex-1" @click="agreeOpen = false">Để Sau</button>
          <button class="btn-seal flex-1" :disabled="!agreed" @click="confirmStart">Đồng Ý & Bắt Đầu</button>
        </div>
      </template>
    </BaseModal>

    <!-- Hiệu ứng cổng truyền tống -->
    <WarpPortal ref="warpRef" />
  </div>
</template>

<script setup lang="ts">
  import { onUnmounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useSettingsStore } from '@/stores/settings'
  import { useUiStore } from '@/stores/ui'
  import { importSaveText, reloadGame, sealStorageWrites } from '@/core/save'
  import { engine } from '@/core/engine'
  import BaseModal from '@/components/common/BaseModal.vue'
  import PrivacyDialog from '@/components/common/PrivacyDialog.vue'
  import AboutDialog from '@/components/common/AboutDialog.vue'
  import WarpPortal from '@/components/common/WarpPortal.vue'

  const router = useRouter()
  const settings = useSettingsStore()
  const ui = useUiStore()

  const privacyOpen = ref(false)
  const agreeOpen = ref(false)
  const agreed = ref(false)
  const importOpen = ref(false)
  const aboutOpen = ref(false)
  const fileInput = ref<HTMLInputElement | null>(null)
  const warpRef = ref<InstanceType<typeof WarpPortal> | null>(null)
  let enterTimer: ReturnType<typeof setTimeout> | undefined

  function onStart(): void {
    if (settings.privacyAccepted) {
      void router.push('/create')
      return
    }
    agreeOpen.value = true
  }

  function confirmStart(): void {
    settings.privacyAccepted = true
    agreeOpen.value = false
    // Cổng truyền tống: phát khoảng 2.5s rồi vào trang tạo nhân vật
    warpRef.value?.show({ title: 'Mây Sâu Khó Biết Chốn', subtitle: 'Nhất niệm tu hành · Tiên lộ từ đây khởi' })
    enterTimer = setTimeout(() => {
      void router.push('/create')
    }, 2500)
  }

  // ---- Nhập bản lưu (quy trình như trang Cài Đặt: dừng engine, nhập xong nạp lại) ----
  function triggerImport(): void {
    fileInput.value?.click()
  }

  function onFilePicked(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      engine.pause()
      const err = importSaveText(text)
      if (err) {
        ui.toast(err, 'warn')
        engine.resume() // Nhập thất bại khôi phục engine
        return
      }
      ui.toast('Nhập bản lưu thành công, chuẩn bị tái nhập tiên đồ', 'success')
      // Đã ghi đĩa, niêm phong ngay: tránh persist ghi đè bộ nhớ cũ (started=false)
      sealStorageWrites()
      setTimeout(reloadGame, 800)
    }
    reader.readAsText(file)
    if (fileInput.value) fileInput.value.value = ''
  }

  onUnmounted(() => {
    if (enterTimer !== undefined) clearTimeout(enterTimer)
  })
</script>
