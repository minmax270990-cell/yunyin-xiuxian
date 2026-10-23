<template>
  <div>
    <SectionTitle title="Phòng Thí Nghiệm Lưu Phái" hint="Nuôi thả ngẫu nhiên, đọc đại thế thế giới" />
    <div class="card-ink px-4 py-3">
      <p class="text-[11px] leading-relaxed text-ink-faint">
        Trong không gian từ điều có thể đạt được, ngẫu nhiên nuôi thả một nhóm cấu trúc, từng lượt đấu với 7 loại hình nguyên mẫu —— Xem thế giới này có vạn kim du hay không,
        chiến lực cao có thật sự đánh thắng được hay không. Truy vấn khá nặng, bấm một cái rồi chờ chạy xong.
      </p>

      <!-- Truy vấn thất bại -->
      <p v-if="error" class="mt-2 text-[10px] text-cinnabar">{{ error }}</p>

      <!-- Chưa chạy hoặc sau khi thất bại -->
      <button v-if="!running && !report" class="btn-seal mt-2 w-full !py-2 !text-[12px]" @click="run">
        Chạy Truy Vấn Một Lượt
      </button>

      <!-- Đang chạy -->
      <div v-else-if="running" class="mt-2">
        <p class="flex items-center justify-between font-kai text-[10px] text-ink-faint">
          <span>Đang truy vấn</span>
          <span class="tabular">{{ progress }} / {{ total }}</span>
        </p>
        <div class="track-ink mt-1 h-1.25 w-full overflow-hidden rounded-full">
          <div class="bar-fill h-full bg-azure" :style="{ width: `${total ? (progress / total) * 100 : 0}%` }" />
        </div>
      </div>

      <!-- Kết quả -->
      <div v-else-if="report" class="mt-2">
        <p class="flex items-baseline justify-between gap-2 text-[11px]">
          <span class="text-ink-faint">Vạn kim du</span>
          <span class="tabular" :class="report.universals.length ? 'text-jade' : 'text-ink-faint'">
            {{ report.universals.length }} Bộ<template v-if="report.universals.length"> · Thông suốt bốn tường</template>
          </span>
        </p>
        <p v-if="report.universals.length" class="mt-0.5 text-[10px] text-ink-faint">{{ topUniversalNames }}</p>
        <p class="mt-1 flex items-baseline justify-between gap-2 text-[11px]">
          <span class="text-ink-faint">Cạm bẫy</span>
          <span class="tabular text-ink-soft">{{ report.traps.length }} Bộ · Toàn cảnh đều thua</span>
        </p>
        <div class="ink-divider my-1.5" />
        <p class="flex items-baseline justify-between gap-2 text-[11px]">
          <span class="text-ink-faint">Tương quan Chiến Lực × Tỷ Lệ Thắng</span>
          <span class="tabular text-ink-soft">{{ Math.round(report.powerCorrelation * 100) }}%</span>
        </p>
        <p class="mt-0.5 text-[10px] leading-relaxed text-ink-faint">{{ correlationLine }}</p>
        <button class="btn-ghost mt-2 w-full !py-2 !text-[11px]" @click="run">Truy Vấn Lại</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onUnmounted, ref } from 'vue'
  import { searchBuildsAsync } from '@/core/buildSearch'
  import type { SearchReport } from '@/core/buildSearch'
  import SectionTitle from '@/components/common/SectionTitle.vue'

  const running = ref(false)
  const progress = ref(0)
  const total = ref(0)
  const report = ref<SearchReport | null>(null)
  const error = ref('')

  let isUnmounted = false
  onUnmounted(() => {
    isUnmounted = true
  })

  async function run(): Promise<void> {
    if (running.value) return
    running.value = true
    error.value = ''
    report.value = null
    progress.value = 0
    total.value = 0
    try {
      const result = await searchBuildsAsync({
        n: 600,
        fightsPerArch: 16,
        seed: 20261004,
        yieldEvery: 24,
        onProgress: (d, t) => {
          if (isUnmounted) return
          progress.value = d
          total.value = t
        }
      })
      if (isUnmounted) return
      report.value = result
    } catch {
      if (isUnmounted) return
      error.value = 'Truy vấn gặp trục trặc, xin thử lại sau'
    } finally {
      if (!isUnmounted) running.value = false
    }
  }

  const topUniversalNames = computed(() => {
    const tops = (report.value?.universals ?? [])
      .slice(0, 2)
      .map(r => r.identity)
      .filter(n => n && n !== '杂学')
    return tops.length ? `Lần này xuất hiện: ${tops.join(', ')}` : 'Vạn kim du lần này đa phần là phối hợp tạp học'
  })

  const correlationLine = computed(() => {
    const r = report.value?.powerCorrelation ?? 0
    if (r > 0.6) return 'Chiến lực cao tỷ lệ thắng ổn định hơn, nhưng cũng chỉ là đại thế, tương khắc vẫn phân cao thấp'
    if (r > 0.2) return 'Chiến lực có tương quan với tỷ lệ thắng, nhưng không phải chuẩn mực duy nhất'
    return 'Chiến lực hầu như không phân biệt được lưu phái —— Mạnh yếu ở tương khắc, không ở bảng chỉ số'
  })
</script>
