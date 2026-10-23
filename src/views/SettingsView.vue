<template>
  <div class="stagger-in space-y-4 px-4 pb-6 pt-4">
    <SectionTitle title="Cài Đặt" />

    <!-- 偏好 -->
    <div class="card-ink divide-y divide-ink/6 px-4">
      <div class="py-3">
        <label class="flex items-center justify-between">
          <span class="text-[13px] text-ink-soft">Nhạc nền</span>
          <input v-model="settings.musicOn" type="checkbox" class="h-4 w-4 accent-cinnabar" />
        </label>
        <div v-if="settings.musicOn" class="mt-2 flex items-center gap-2">
          <span class="text-[10px] text-ink-faint">Nhỏ</span>
          <input v-model.number="settings.musicVol" type="range" min="0" max="100" aria-label="Âm lượng nhạc nền" class="grow min-w-0 accent-cinnabar" />
          <span class="w-7 text-right text-[10px] tabular text-ink-faint">{{ settings.musicVol }}</span>
        </div>
      </div>
      <div class="py-3">
        <label class="flex items-center justify-between">
          <span class="text-[13px] text-ink-soft">Hiệu ứng âm thanh</span>
          <input v-model="settings.sfxOn" type="checkbox" class="h-4 w-4 accent-cinnabar" />
        </label>
        <div v-if="settings.sfxOn" class="mt-2 flex items-center gap-2">
          <span class="text-[10px] text-ink-faint">Nhỏ</span>
          <input v-model.number="settings.sfxVol" type="range" min="0" max="100" aria-label="Âm lượng hiệu ứng âm thanh" class="grow min-w-0 accent-cinnabar" />
          <span class="w-7 text-right text-[10px] tabular text-ink-faint">{{ settings.sfxVol }}</span>
        </div>
      </div>
      <label class="flex items-center justify-between py-3">
        <span class="text-[13px] text-ink-soft">Giảm hiệu ứng động</span>
        <input v-model="settings.reduceMotion" type="checkbox" class="h-4 w-4 accent-cinnabar" />
      </label>
      <div class="py-3">
        <label class="flex items-center justify-between">
          <span class="text-[13px] text-ink-soft">Gặp sự không phiền</span>
          <input v-model="settings.dndEvents" type="checkbox" class="h-4 w-4 accent-cinnabar" />
        </label>
        <p class="mt-1 text-[10px] leading-relaxed text-ink-faint">
          Lịch luyện gặp gỡ tế ngộ/cơ duyên/kỳ duyên sẽ không bật cửa sổ, tự động kết thúc theo lựa chọn tốt mặc định —— Phần thưởng vẫn nhận đủ, chỉ là không ngắt quãng thao tác.
        </p>
      </div>
      <div class="flex items-center justify-between py-3">
        <span class="text-[13px] text-ink-soft">Chế độ giao diện</span>
        <div role="group" aria-label="Chế độ giao diện" class="flex gap-1">
          <button
            v-for="o in THEME_OPTIONS"
            :key="o.id"
            :aria-pressed="settings.theme === o.id"
            class="chip-ink !py-1.5"
            :class="settings.theme === o.id ? 'border-cinnabar text-cinnabar' : 'border-ink/25 text-ink-faint'"
            @click="settings.theme = o.id"
          >
            {{ o.label }}
          </button>
        </div>
      </div>
      <div class="flex items-center justify-between py-3">
        <span class="text-[13px] text-ink-soft">Tốc độ chiến báo</span>
        <div role="group" aria-label="Tốc độ chiến báo" class="flex gap-1">
          <button
            v-for="s in [1, 2, 4] as const"
            :key="s"
            :aria-pressed="settings.battleSpeed === s"
            class="chip-ink !py-1.5"
            :class="settings.battleSpeed === s ? 'border-cinnabar text-cinnabar' : 'border-ink/25 text-ink-faint'"
            @click="settings.battleSpeed = s"
          >
            ×{{ s }}
          </button>
        </div>
      </div>
    </div>

    <!-- 存档 -->
    <SectionTitle title="Lưu Trữ" />
    <div class="card-ink space-y-2 px-4 py-3">
      <p class="text-[11px] text-ink-faint tabular">Phiên bản lưu trữ v{{ SAVE_VERSION }} · Thời gian tu hành {{ formatDuration(game.totalPlaySec) }}</p>
      <!--
        备份这件事没人提醒就不会做,而它恰恰是丢档前唯一的保险 —— 故常驻一行;
        备份旧了、这一档又确实攒了东西时,才把那句「建议导出一份」说出来(见 core/saveBackup.ts)。
      -->
      <p class="text-[11px] tabular" :class="backupPrompt ? 'text-amber-ink' : 'text-ink-faint'">
        Lần gần nhất xuất sao lưu: {{ lastExportText }}
        <span v-if="backupPrompt" class="leading-relaxed">
          · Nên xuất một bản sao lưu —— Android xóa dữ liệu ứng dụng, iOS không mở sau 7 ngày đều sẽ làm mất tiến trình
        </span>
      </p>
      <!-- 写盘失败时这里必须说话:玩家可能正玩得兴起,却不知道进度没进档 -->
      <p v-if="saveFailed" class="rounded-md border border-cinnabar/40 bg-cinnabar/8 px-2 py-1.5 text-[11px] leading-relaxed text-cinnabar">
        Lần lưu trước không thể ghi vào đĩa —— Dung lượng máy có thể đã đầy. Xin vui lòng「Xuất Lưu Trữ」giữ một bản, rồi dọn dẹp bộ nhớ máy hoặc đổi thiết bị nhập vào.
      </p>
      <!--
        坏掉的分片只说一次(启动时一条 2.4 秒的提示)是不够的:
        玩家多半是先发现「我的灵石怎么没了」,再回来找原因。
        故这里常驻一条:哪一片坏了、原档还在哪儿、以及最该做的那件事(导入备份)。
      -->
      <p
        v-if="corruptedNotice.length"
        class="rounded-md border border-cinnabar/40 bg-cinnabar/8 px-2 py-1.5 text-[11px] leading-relaxed text-cinnabar"
      >
        Khi khởi động phát hiện có dữ liệu không đọc được đầy đủ, đã cố gắng hết sức sửa chữa, chỉ tổn thất phần chưa kịp đồng bộ: {{
          corruptedNotice.map(id => STORE_NAMES[id] ?? id).join(', ')
        }}. Bản lưu gốc chưa bị xóa, vẫn còn trên máy —— Nếu có bản sao lưu đã xuất, có thể nhập lại ở bên dưới để khôi phục.
        <button class="mt-1 block text-ink-faint underline" @click="ui.corruptedNotice = []">Đã hiểu</button>
      </p>
      <div class="grid grid-cols-2 gap-2">
        <button class="btn-ghost !text-[12px]" @click="onExport">Xuất Lưu Trữ</button>
        <button class="btn-ghost !text-[12px]" @click="triggerImport">Nhập Lưu Trữ</button>
        <input ref="fileInput" type="file" accept="application/json,.save" class="hidden" @change="onFilePicked" />
      </div>
      <button class="btn-ghost w-full !border-cinnabar/40 !text-[12px] !text-cinnabar" @click="openReset">
        Tán tận tu vi, trùng nhập luân hồi (Xóa sạch lưu trữ)
      </button>
    </div>

    <!--
      诊断:异常留档。

      从前全局异常只 toast 一句「出现异常,已记录」—— 手机上根本没有控制台,
      那句「已记录」无处可查。这里把它坐实:最近 20 条、可复制、也随「导出存档」一起走。
    -->
    <SectionTitle title="Chẩn Đoán" />
    <div class="card-ink space-y-2 px-4 py-3">
      <p class="text-[11px] leading-relaxed text-ink-faint">
        <template v-if="diag.errors.length">Ghi chép sự cố gần đây: {{ diag.errors.length }} mục (tối đa {{ DIAG_MAX }} mục)</template>
        <template v-else>Chưa từng xảy ra sự cố. Nếu có bất trắc, hệ thống sẽ tự động ghi lại tại đây, có thể gửi cho chúng tôi cùng với tệp「Xuất Lưu Trữ」.</template>
      </p>
      <p v-if="latestError" class="rounded-md bg-ink/4 px-2 py-1.5 text-[10px] leading-relaxed text-ink-soft">
        <span class="tabular text-ink-faint">{{ formatClock(latestError.at) }}</span>
        <span v-if="latestError.count > 1" class="ml-1 text-ink-faint">×{{ latestError.count }}</span>
        <span class="ml-1 break-all">{{ latestError.message }}</span>
        <span v-if="latestError.route" class="ml-1 text-ink-faint">{{ latestError.route }}</span>
      </p>
      <div v-if="diag.errors.length" class="grid grid-cols-2 gap-2">
        <button class="btn-ghost !text-[12px]" @click="copyDiag">Sao chép nhật ký sự cố</button>
        <button class="btn-ghost !text-[12px]" @click="diag.clear()">Xóa nhật ký</button>
      </div>
    </div>

    <!-- iOS 专属:装到主屏幕才躲得过系统清存储(非 iOS 不显示,见组件注释) -->
    <InstallToHomeNotice permanent />

    <!-- 关于 -->
    <SectionTitle title="Thông Tin" />
    <div class="card-ink divide-y divide-ink/6 px-4">
      <button class="flex w-full items-center justify-between py-3 active:opacity-60" @click="aboutOpen = true">
        <span class="text-[13px] text-ink-soft">Về chúng tôi</span>
        <span class="text-[11px] text-ink-faint">Xem →</span>
      </button>
      <button class="flex w-full items-center justify-between py-3 active:opacity-60" @click="openRelease">
        <span class="flex items-center gap-2 text-[13px] text-ink-soft">
          Phiên bản & Cập nhật
          <span
            v-if="settings.hasUnseenRelease"
            class="rounded bg-cinnabar px-1 py-px text-[10px] leading-none text-paper"
            aria-label="Có phiên bản mới"
          >Mới</span>
        </span>
        <span class="text-[11px] text-ink-faint">Xem →</span>
      </button>
      <button class="flex w-full items-center justify-between py-3 active:opacity-60" @click="privacyOpen = true">
        <span class="text-[13px] text-ink-soft">Chính sách quyền riêng tư</span>
        <span class="text-[11px] text-ink-faint">Xem →</span>
      </button>
      <button class="flex w-full items-center justify-between py-3 active:opacity-60" @click="progressionOpen = true">
        <span class="text-[13px] text-ink-soft">Hệ thống số liệu</span>
        <span class="text-[11px] text-ink-faint">Xem →</span>
      </button>
    </div>

    <!-- 关于我们 -->
    <AboutDialog :open="aboutOpen" @close="aboutOpen = false" />

    <!-- 版本与更新 -->
    <ReleaseNotesDialog :open="releaseOpen" @close="releaseOpen = false" />

    <!-- 隐私政策 -->
    <PrivacyDialog :open="privacyOpen" @close="privacyOpen = false" />

    <!-- 数值体系(可解释性:各数值轴的复利倍率 / 净耗时 / 积余 / 命名出处) -->
    <ProgressionDialog :open="progressionOpen" @close="progressionOpen = false" />

    <!-- 重置确认(弹窗期间引擎暂停) -->
    <BaseModal :open="resetConfirm" title="Thiết Lập Lại Trò Chơi" @close="closeReset">
      <p class="text-[13px] leading-relaxed text-ink-soft">
        Hành động này sẽ
        <span class="text-cinnabar">xóa sạch hoàn toàn</span>
        mọi dấu vết tu hành trên máy, bao gồm cả thu hoạch chuyển thế, và không thể khôi phục.
      </p>
      <template #footer>
        <div class="flex gap-2">
          <button class="btn-ghost flex-1" @click="closeReset">Nghĩ lại đã</button>
          <button class="btn-seal flex-1 !bg-cinnabar-deep" @click="confirmReset">Đạo tâm đã quyết</button>
        </div>
      </template>
    </BaseModal>

    <!-- 导入确认(弹窗期间引擎暂停;与重置同级破坏,给一次反悔机会) -->
    <BaseModal :open="importConfirm" title="Nhập Lưu Trữ" @close="closeImport">
      <p class="text-[13px] leading-relaxed text-ink-soft">
        Nhập「{{ importName || 'Bản sao lưu đã chọn' }}」sẽ
        <span class="text-cinnabar">ghi đè toàn bộ</span>
        bản lưu hiện tại trên máy, và không thể hoàn tác. Bản lưu cũ nếu không sao lưu sẽ biến mất vĩnh viễn —— Khuyến nghị nên xuất bản lưu trước.
      </p>
      <template #footer>
        <div class="flex gap-2">
          <button class="btn-ghost flex-1" @click="closeImport">Nghĩ lại đã</button>
          <button class="btn-seal flex-1 !bg-cinnabar-deep" @click="confirmImport">Ghi đè nhập vào</button>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onUnmounted } from 'vue'
  import { useSettingsStore } from '@/stores/settings'
  import { useGameStore } from '@/stores/game'
  import { useUiStore } from '@/stores/ui'
  import { engine } from '@/core/engine'
  import { importSaveText, resetGame, reloadGame, sealStorageWrites } from '@/core/save'
  import { exportSaveToDevice } from '@/core/savePlatform'
  import { formatLastExport, shouldPromptBackup } from '@/core/saveBackup'
  import { formatDuration } from '@/utils/format'
  import { SAVE_VERSION, STORE_NAMES, saveWriteFailure, subscribeSaveWriteFailure } from '@/utils/storage'
  import SectionTitle from '@/components/common/SectionTitle.vue'
  import BaseModal from '@/components/common/BaseModal.vue'
  import PrivacyDialog from '@/components/common/PrivacyDialog.vue'
  import AboutDialog from '@/components/common/AboutDialog.vue'
  import ReleaseNotesDialog from '@/components/common/ReleaseNotesDialog.vue'
  import ProgressionDialog from '@/components/common/ProgressionDialog.vue'
  import InstallToHomeNotice from '@/components/common/InstallToHomeNotice.vue'
  import { DIAG_MAX, useDiagStore } from '@/stores/diag'

  const settings = useSettingsStore()
  const game = useGameStore()
  const ui = useUiStore()
  const diag = useDiagStore()

  /** 写盘失败状态:进页面先读一次,之后随订阅翻转 */
  const saveFailed = ref(saveWriteFailure() !== null)
  /** 被隔离的分片(启动时 preflightScan 记下的那份) */
  const corruptedNotice = computed<string[]>(() => ui.corruptedNotice)

  /** 最近一条异常(诊断块里只展示这一条,其余随复制/导出带走) */
  const latestError = computed(() => diag.errors[diag.errors.length - 1] ?? null)

  /** 复制用的全文:一条一行,带时间与路由,便于直接贴进聊天窗 */
  const diagText = computed(() =>
    diag.errors
      .map(e => `${formatClock(e.at)} · ${e.info || 'Sự cố'} · ${e.message}${e.count > 1 ? ` ×${e.count}` : ''}${e.route ? ` @${e.route}` : ''}`)
      .join('\n')
  )

  /** 月-日 时:分 —— 诊断只需要定位到"哪一次",不需要秒 */
  function formatClock(at: number): string {
    const d = new Date(at)
    const pad = (n: number): string => String(n).padStart(2, '0')
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  async function copyDiag(): Promise<void> {
    try {
      await navigator.clipboard.writeText(diagText.value)
      ui.toast('Đã sao chép nhật ký sự cố', 'success')
    } catch {
      // 剪贴板在非安全上下文(file:// 等)不可用 —— 说清退路,别让人以为记录丢了
      ui.toast('Sao chép thất bại —— Nhật ký sự cố nằm trong tệp「Xuất Lưu Trữ」, có thể gửi toàn bộ cho chúng tôi', 'warn')
    }
  }
  const unsubscribeSaveFailure = subscribeSaveWriteFailure(failure => {
    saveFailed.value = failure !== null
  })

  /**
   * 备份那一行用的「现在」。进页面取一次即可 —— 这一页不是秒表,而每渲染一次就算一次
   * Date.now() 反而会让 computed 不稳定。跨天挂着不动属于可接受的误差(重进页面即刷新)。
   */
  const now = ref(Date.now())
  const lastExportText = computed(() => formatLastExport(settings.lastExportAt, now.value))
  /** 该不该说出「建议导出一份」(备份旧了 + 这一档攒够了天数,见 core/saveBackup.ts) */
  const backupPrompt = computed(() => shouldPromptBackup(settings.lastExportAt, game.createdAt, now.value))

  const THEME_OPTIONS = [
    { id: 'auto', label: 'Theo hệ thống' },
    { id: 'light', label: 'Ban ngày' },
    { id: 'dark', label: 'Ban đêm' }
  ] as const

  const resetConfirm = ref(false)
  /** 导入二步确认:选完文件只读进内存,等玩家点头才真正覆盖(与「散尽修为」同级破坏) */
  const importConfirm = ref(false)
  const importText = ref<string | null>(null)
  const importName = ref('')
  const privacyOpen = ref(false)
  const aboutOpen = ref(false)
  const releaseOpen = ref(false)
  const progressionOpen = ref(false)
  const fileInput = ref<HTMLInputElement | null>(null)

  /** 打开发布说明即视为已阅:把「已看到的最新版」记下,新标记随之熄灭 */
  function openRelease(): void {
    settings.markReleaseSeen()
    releaseOpen.value = true
  }

  /** 导出存档:Web/Electron 走浏览器下载,原生端写 Documents(见 savePlatform) */
  function onExport(): void {
    // 两个平台各自会 toast 结果;这里再兜一层,免得异常冒成未捕获的 Promise。
    // 只有真的落盘了才记账(返回 null 即成功)—— 没导出成功却把时间戳往前推,
    // 等于用一行「今天」把玩家骗过去,那比不提醒更糟。
    void exportSaveToDevice()
      .then(err => {
        if (!err) settings.lastExportAt = Date.now()
      })
      .catch(() => ui.toast('Không thể hoàn tất xuất tệp, vui lòng thử lại sau', 'warn'))
  }

  // ---- 重置流程:弹窗期间暂停心跳,取消则恢复 ----
  function openReset(): void {
    resetConfirm.value = true
    engine.pause()
  }

  function closeReset(): void {
    resetConfirm.value = false
    engine.resume()
  }

  function confirmReset(): void {
    resetGame()
  }

  // 弹窗开着就离开页面时兜底恢复
  onUnmounted(() => {
    unsubscribeSaveFailure()
    if (resetConfirm.value || importConfirm.value) engine.resume()
  })

  function triggerImport(): void {
    fileInput.value?.click()
  }

  function onFilePicked(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      if (!text.trim()) {
        ui.toast('Tệp này trống rỗng, vui lòng chọn tệp khác', 'warn')
        return
      }
      // 先只读进内存,不落地:等玩家在确认弹窗点头,才真正覆盖当前存档。
      // 导入与「散尽修为」同级破坏 —— 一选文件就写盘,旧档连反悔的机会都没有。
      importText.value = text
      importName.value = file.name
      importConfirm.value = true
      engine.pause()
    }
    // 读文件本身也可能失败(权限/磁盘)—— 静默就等于「点了没反应」
    reader.onerror = () => ui.toast('Không thể đọc tệp này, vui lòng chọn tệp khác', 'warn')
    reader.readAsText(file)
    // 清空 input,允许重复选择同一文件
    if (fileInput.value) fileInput.value.value = ''
  }

  function closeImport(): void {
    importConfirm.value = false
    importText.value = null
    importName.value = ''
    engine.resume()
  }

  function confirmImport(): void {
    const text = importText.value
    importConfirm.value = false
    importText.value = null
    if (text === null) return
    // 先暂停引擎,防止 Pinia persist 插件在导入后覆盖数据
    engine.pause()
    const err = importSaveText(text)
    if (err) {
      ui.toast(err, 'warn')
      engine.resume() // 导入失败时恢复引擎
      return
    }
    ui.toast('Nhập bản lưu thành công, sắp sửa nhập định trở lại', 'success')
    // 导入已写盘,立即封存:阻止 persist 插件把旧内存回写覆盖
    sealStorageWrites()
    setTimeout(reloadGame, 800)
  }
</script>
