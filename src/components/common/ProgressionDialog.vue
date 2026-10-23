<template>
  <BaseModal :open="open" title="Hệ Thống Số Liệu" @close="$emit('close')">
    <div class="space-y-3 text-[12px] leading-relaxed">
      <p class="text-ink-faint">
        Mỗi khi lên một tầng cảnh giới, cần bao nhiêu đều có quy luật riêng; những gì ghi ở đây, đều theo thực tế tu hành mà ra, không thêm lời hư ảo.
      </p>

      <!-- 各数值轴的复利倍率 -->
      <div class="card-ink px-3 py-2">
        <p class="text-[10px] text-ink-faint">Bội số lũy kế mỗi cảnh (Nhân gian giới / Ngoại giới)</p>
        <div class="mt-1.5 space-y-1.5">
          <div v-for="a in PROGRESSION_AXES" :key="a.id" class="flex items-start gap-2">
            <span class="w-[104px] shrink-0 text-ink-soft">{{ a.name }}</span>
            <span class="w-[92px] shrink-0 tabular text-ink">
              ×{{ a.mortal.toFixed(1) }} / ×{{ a.outer.toFixed(1) }}
            </span>
            <span class="min-w-0 grow text-[10px] text-ink-faint">{{ a.note }}</span>
          </div>
        </div>
      </div>

      <!-- 净耗时:玩家真正感受到的难度 -->
      <div class="card-ink px-3 py-2">
        <p class="text-[10px] text-ink-faint">Thời gian tiêu hao thuần (Cảm giác độ khó = Nhu cầu tu vi ÷ Tốc độ tu luyện)</p>
        <p class="mt-1 text-ink-soft tabular">
          Nhân gian giới ×{{ MORTAL_TIME_PER_MAJOR.toFixed(2) }} / cảnh · Ngoại giới ×{{ OUTER_TIME_PER_MAJOR.toFixed(2) }} / cảnh
        </p>
        <p class="mt-1 text-[10px] text-ink-faint">
          Số liệu chồng chất theo hàm mũ, nhưng thời gian tiêu hao bị nén ở ×{{ OUTER_TIME_PER_MAJOR.toFixed(2) }} —— Cho nên mỗi cảnh đều rõ ràng "nặng" hơn,
          toàn bộ bậc thang vẫn nằm trong phạm vi có thể đạt tới. Trên Độ Kiếp là Ngoại giới (từ cảnh thứ {{ PROGRESSION_NOTES.worldBreakMajor + 1 }} trở đi).
        </p>
      </div>

      <!-- 积余:卡境不浪费 -->
      <!-- 花费同样复利:不是线性涨价 -->
      <div class="card-ink px-3 py-2">
        <p class="text-[10px] text-ink-faint">Chi phí cũng theo bội số từng bậc tăng dần (càng về sau càng nặng, không phải tăng giá cố định)</p>
        <div class="mt-1.5 space-y-1">
          <div v-for="c in COST_CURVES" :key="c.id" class="flex items-start gap-2">
            <span class="w-[92px] shrink-0 text-ink-soft">{{ c.name }}</span>
            <span class="w-[74px] shrink-0 tabular text-ink">×{{ c.growth.toFixed(2) }}/{{ c.unit.slice(-1) }}</span>
            <span class="min-w-0 grow text-[10px] text-ink-faint">{{ c.note }}</span>
          </div>
        </div>
      </div>

      <div class="card-ink px-3 py-2">
        <p class="text-[10px] text-ink-faint">Tích lũy dôi dư (kẹt cảnh vẫn tiếp tục tăng trưởng)</p>
        <ul class="mt-1 space-y-1">
          <li v-for="line in PROGRESSION_NOTES.banking" :key="line" class="text-ink-soft">· {{ line }}</li>
        </ul>
      </div>

      <!-- 命名出处 -->
      <div class="card-ink px-3 py-2">
        <p class="text-[10px] text-ink-faint">Xuất xứ tên cảnh giới</p>
        <ul class="mt-1 space-y-1">
          <li v-for="line in PROGRESSION_NOTES.basis" :key="line" class="text-ink-soft">· {{ line }}</li>
        </ul>
        <p class="mt-1.5 text-[10px] text-ink-faint">
          Mỗi cảnh trong trang tu hành đều ghi rõ lấy từ đâu, tiếp nối nhân duyên gì.
        </p>
      </div>

      <!-- 术数四门:时机各占一层 -->
      <div class="card-ink px-3 py-2">
        <p class="text-[10px] text-ink-faint">Thuật số tứ môn (Thời cơ mỗi môn chiếm một tầng, không phải bốn phần cộng dồn phát ra)</p>
        <div class="mt-1.5 space-y-1.5">
          <div v-for="s in SORCERY_LAYERS" :key="s.id" class="flex items-start gap-2">
            <span class="w-[84px] shrink-0 text-ink-soft">{{ s.name }}</span>
            <span class="min-w-0 grow">
              <span class="block text-[10px] text-ink-faint">{{ s.cadence }} · Cái giá: {{ s.cost }}</span>
              <span class="block text-[10px] leading-relaxed text-ink-faint">{{ s.note }}</span>
            </span>
          </div>
        </div>
        <p class="mt-1.5 text-[10px] leading-relaxed text-ink-soft">{{ SORCERY_SUMMARY }}</p>
        <p class="mt-1 text-[10px] text-ink-faint">
          Cái giá tứ môn như dưới đây, con số đều đối ứng 1:1 với thực tế tu hành; những gì liệt kê ở đây là con số thực sự.
        </p>
      </div>

      <!-- 寿元:界域内复利,跨界一次大跃 -->
      <div class="card-ink px-3 py-2">
        <p class="text-[10px] text-ink-faint">Thọ nguyên (Lũy kế trong giới vực, vượt giới đại dược tiến)</p>
        <div class="mt-1.5 space-y-1">
          <div v-for="l in LIFESPAN_CURVES" :key="l.world" class="flex items-center gap-2">
            <span class="w-[64px] shrink-0 text-ink-soft">{{ l.world }}</span>
            <span class="tabular text-ink">Khởi điểm {{ formatGN(l.base) }} năm · Mỗi cảnh ×{{ l.growth.toFixed(1) }}</span>
          </div>
        </div>
        <p class="mt-1.5 text-[10px] text-ink-faint">
          Chỉ riêng「Độ Kiếp → Chân Tiên」là cú nhảy vọt thoát khỏi phàm trần (khoảng ×{{ ascensionLeap() }}); sau đó phá giới nhập thần, quy phản hỗn độn cũng đều nhảy một bậc.
        </p>
      </div>

      <!-- 突破与天劫:难度落在哪里,说清楚 -->
      <div class="card-ink px-3 py-2">
        <p class="text-[10px] text-ink-faint">Đột phá và Thiên kiếp</p>
        <ul class="mt-1 space-y-1">
          <li v-for="line in PROGRESSION_NOTES.breakthrough" :key="line" class="text-ink-soft">· {{ line }}</li>
        </ul>
      </div>
    </div>
    <template #footer>
      <button class="btn-seal w-full" @click="$emit('close')">Đã Hiểu</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
  import BaseModal from './BaseModal.vue'
  import {
    COST_CURVES,
    LIFESPAN_CURVES,
    MORTAL_TIME_PER_MAJOR,
    OUTER_TIME_PER_MAJOR,
    PROGRESSION_AXES,
    PROGRESSION_NOTES,
    SORCERY_LAYERS,
    SORCERY_SUMMARY
  } from '@/data/progressionDoc'
  import { formatGN } from '@/utils/format'
  import { ascensionLeap } from '@/data/realms'

  defineProps<{ open: boolean }>()
  defineEmits<{ close: [] }>()
</script>
