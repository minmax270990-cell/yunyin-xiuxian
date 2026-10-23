<template>
  <!-- 死亡提示 -->
  <BaseModal :open="ui.deathDialog && !view" :closable="false" aria-label="Thọ nguyên sắp cạn">
    <div class="text-center">
      <p class="mt-2 font-kai text-2xl tracking-[0.4em] text-ink">Thọ Nguyên Sắp Cạn</p>
      <p class="mt-3 text-[13px] leading-relaxed text-ink-soft">
        {{ player.name }} ngồi khô trên bồ đoàn, đèn cạn dầu tắt.
        <br />
        Kiếp này đi tới năm thứ {{ Math.floor(player.age) }}, dừng bước tại {{ displayRealmName(player.realmName) }}.
        <br />
        May mắn thần hồn bất diệt, vẫn có thể vào luân hồi, lại mở tiên đồ.
      </p>
    </div>
    <template #footer>
      <button class="btn-seal w-full" @click="beginRebirth">Binh Giải Chuyển Thế</button>
    </template>
  </BaseModal>

  <!-- 第一程:回顾上一世 -->
  <BaseModal :open="view !== null && step === 'review'" :closable="false" title="Kiếp Này Đã Xong">
    <div v-if="view">
      <p class="text-[12px] leading-relaxed text-ink-soft">
        Kiếp thứ
        <span class="font-kai text-ink tabular">{{ view.review.index }}</span>
        , ngươi đi tới {{ displayRealmName(view.review.realmLabel) }}, thọ chung ở năm thứ
        <span class="tabular">{{ view.review.age }}</span>.
      </p>

      <!-- 这一世立的题 -->
      <div v-if="reviewTheme" class="mt-3 rounded-lg border border-ink/15 px-3 py-2">
        <p class="flex items-center justify-between">
          <span class="font-kai text-[13px] text-ink">「{{ reviewTheme.vow }}」</span>
          <span class="text-[11px]" :class="RESULT_COLORS[view.review.themeResult ?? 'unfinished']">
            {{ RESULT_NAMES[view.review.themeResult ?? 'unfinished'] }}
          </span>
        </p>
        <p class="mt-1 text-[11px] text-ink-faint">
          {{ reviewTheme.goal }}
          <span v-if="view.review.themeResult === 'unfinished'" class="tabular">
            ({{ Math.floor(view.review.themeCur) }} / {{ view.review.themeNeed }})
          </span>
        </p>
        <p v-if="view.review.themeResult === 'done'" class="mt-1 text-[11px] leading-relaxed text-gold-ink">
          {{ reviewTheme.legacy }}
        </p>
        <p v-else-if="view.review.themeResult === 'broken'" class="mt-1 text-[11px] text-ink-faint">
          Ngươi đã {{ TABOO_NAMES[reviewTheme.taboo ?? 'pill'] }}. Lời thề kiếp này, chưa thể đi đến cùng.
        </p>
      </div>
      <p v-else class="mt-3 text-[11px] text-ink-faint">Kiếp này chưa từng lập lời thề định hướng nào cho mình.</p>

      <!-- 宿慧与阶段 -->
      <div class="mt-3 rounded-lg border border-ink/15 px-3 py-2">
        <p class="flex items-center justify-between text-[12px]">
          <span class="text-ink-soft">Những gì trải qua kiếp này, hóa thành Túc Tuệ</span>
          <span class="font-kai text-cinnabar tabular">+{{ view.review.insightGained }}</span>
        </p>
        <p class="mt-1.5 flex items-center justify-between text-[12px]">
          <span class="text-ink-soft">Túc Tuệ tổng cộng</span>
          <span class="tabular text-ink">{{ view.insightAfter }}</span>
        </p>
        <p class="mt-2 flex items-center gap-2">
          <span class="font-kai text-[14px]" :class="view.stageAdvanced ? 'text-cinnabar' : 'text-ink'">{{ view.stageName }}</span>
          <span v-if="view.stageAdvanced" class="rounded bg-cinnabar/10 px-1.5 py-0.5 text-[10px] text-cinnabar">Cảnh địa đã chuyển</span>
        </p>
        <p class="mt-1 text-[11px] leading-relaxed text-ink-faint">{{ view.stageDesc }}</p>
        <p v-if="view.toNextStage !== null" class="mt-1 text-[11px] text-ink-faint tabular">
          Tích thêm {{ view.toNextStage }} Túc Tuệ, có thể bước vào cảnh địa kế tiếp.
        </p>
      </div>

      <p class="mt-3 text-[11px] leading-relaxed text-ink-faint">
        Đan phương, dược tính, khí văn, lộ số của địch thủ —— những hiểu biết này không theo thể xác mà mục nát.
        Kiếp sau mở mắt, ngươi liền nhận biết
        <span class="text-ink tabular">{{ view.knownMaterials }}</span>
        vị linh tài.
      </p>

      <!-- 交割清单:带走什么、放下什么 —— 与 core/samsaraAudit 的继承表同源,不另写一份 -->
      <div class="mt-3 rounded-lg border border-ink/15 px-3 py-2">
        <p class="text-[10px] text-ink-faint">Kiếp này bàn giao —— Giữ lại là「Ta là ai」, buông xuống là「Ta sở hữu bao nhiêu」 · Nhấn một mục xem lấy bỏ</p>
        <div v-for="g in heritageGroups()" :key="g.mode" class="mt-1.5">
          <p class="text-[11px]" :class="g.mode === 'reset' ? 'text-ink-faint' : 'text-ink-soft'">
            {{ HERITAGE_GROUP_TITLES[g.mode] ?? g.title }}
            <span class="ml-1 text-[10px] text-ink-faint">{{ g.rows.length }} mục</span>
          </p>
          <div class="mt-0.5 flex flex-wrap gap-1">
            <button
              v-for="r in g.rows"
              :key="r.id"
              type="button"
              class="chip-ink !text-[10px]"
              :class="[
                g.mode === 'full' ? 'border-jade/50 text-jade' : g.mode === 'partial' ? 'border-gold-ink/50 text-gold-ink' : 'border-ink/20 text-ink-faint',
                detailId === r.id ? 'ring-1 ring-current' : ''
              ]"
              :aria-pressed="detailId === r.id"
              :title="r.detail"
              @click="detailId = detailId === r.id ? null : r.id"
            >
              {{ r.name }}
            </button>
          </div>
        </div>
        <p v-if="detailRow" class="mt-2 text-[10px] leading-relaxed text-ink-soft tabular">{{ detailRow.name }} · {{ detailRow.detail }}</p>
      </div>
    </div>
    <template #footer>
      <button class="btn-seal w-full" @click="step = 'next'">Vãng Sinh</button>
    </template>
  </BaseModal>

  <!-- 第二程:择姿立题 -->
  <BaseModal :open="view !== null && step === 'next'" :closable="false" title="Luân Hồi">
    <div v-if="view">
      <p class="text-[12px] leading-relaxed text-ink-soft">
        Lần luân hồi này ngưng tụ được Đạo Quả
        <span class="text-cinnabar tabular">{{ view.daoFruitGained }}</span>
        quả, tu hành kiếp sau tiến thêm một bước.
      </p>
      <p class="mt-3 font-kai text-[13px] tracking-widest text-ink">Chọn một tiên thiên thiên tư</p>
      <p v-if="view.talentChoices.length === 0" class="mt-2 text-[11px] leading-relaxed text-ink-faint">
        Tiên thiên thiên tư đã hoàn toàn thuộc về ngươi, lần này không còn gì để chọn —— trực tiếp bước vào luân hồi là được.
      </p>
      <div class="mt-2 space-y-2">
        <button
          v-for="id in view.talentChoices"
          :key="id"
          class="w-full rounded-lg border px-3 py-2 text-left transition-all active:scale-98"
          :class="chosen === id ? 'border-cinnabar bg-cinnabar/5' : 'border-ink/20'"
          @click="chosen = id"
        >
          <p class="flex items-center gap-2">
            <span class="font-kai text-[14px]" :style="{ color: TALENT_GRADE_COLORS[talentDef(id)?.grade ?? 1] }">
              {{ talentDef(id)?.name }}
            </span>
            <span class="text-[10px] text-ink-faint">{{ TALENT_GRADE_NAMES[talentDef(id)?.grade ?? 1] }}</span>
          </p>
          <p class="mt-0.5 text-[11px] text-ink-faint">{{ talentDef(id)?.desc }}</p>
          <p v-if="talentDef(id) && modsText(talentDef(id)!.mods)" class="mt-0.5 text-[11px] tabular text-azure">
            {{ modsText(talentDef(id)!.mods) }}
          </p>
        </button>
      </div>
      <div v-if="view.extraTalents.length" class="mt-3 text-[11px] text-ink-faint">
        <p>Lại có thiên tư tự mở:</p>
        <p v-for="id in view.extraTalents" :key="id" class="mt-1">
          <span class="font-kai text-gold-ink">{{ talentDef(id)?.name }}</span>
          <span v-if="talentDef(id) && modsText(talentDef(id)!.mods)" class="ml-1 tabular text-azure">
            {{ modsText(talentDef(id)!.mods) }}
          </span>
        </p>
      </div>

      <!-- 这一世的命题 -->
      <template v-if="view.themeChoices.length">
        <p class="mt-4 font-kai text-[13px] tracking-widest text-ink">
          Kiếp này muốn làm gì
          <span v-if="view.themeFree" class="ml-1 text-[10px] font-normal text-gold-ink">(Bách thế lão tu, mặc ngươi tự chọn)</span>
        </p>
        <p class="mt-1 text-[11px] text-ink-faint">Lập thề không tăng thuộc tính. Đi đến cuối đường, đạt được là một phần nhận thức theo thần hồn bất diệt.</p>
        <div class="mt-2 space-y-2">
          <button
            v-for="t in themeDefs"
            :key="t.id"
            class="w-full rounded-lg border px-3 py-2 text-left transition-all active:scale-98"
            :class="theme === t.id ? 'border-cinnabar bg-cinnabar/5' : 'border-ink/20'"
            @click="theme = theme === t.id ? null : t.id"
          >
            <p class="flex items-center justify-between">
              <span class="font-kai text-[14px] text-ink">{{ t.name }}</span>
              <span class="text-[10px] text-ink-faint tabular">Hoàn thành +{{ t.insight }} Túc Tuệ</span>
            </p>
            <p class="mt-0.5 text-[11px] leading-relaxed text-ink-soft">{{ t.vow }}</p>
            <p class="mt-0.5 text-[11px] text-ink-faint">
              {{ t.goal }}
              <span v-if="t.taboo" class="ml-1 text-amber-ink">Kỵ: {{ TABOO_NAMES[t.taboo] }}</span>
            </p>
          </button>
        </div>
        <p class="mt-2 text-[11px] text-ink-faint">Không chọn cũng được —— Một kiếp không lập thề, chẳng qua là bớt đi một phần thu hoạch.</p>
      </template>
    </div>
    <template #footer>
      <button class="btn-seal w-full" :disabled="!canConfirm" @click="confirm">Bước Vào Luân Hồi</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useUiStore } from '@/stores/ui'
  import { usePlayerStore } from '@/stores/player'
  import { prepareReincarnation, confirmReincarnation } from '@/core/reincarnation'
  import { talentDef, TALENT_GRADE_COLORS, TALENT_GRADE_NAMES } from '@/data/talents'
  import { modsText } from '@/ui/statNames'
  import { lifeThemeDef, TABOO_NAMES } from '@/data/lifeThemes'
  import { heritageGroups } from '@/core/samsaraAudit'
  import { engine } from '@/core/engine'
  import { displayRealmName } from '@/ui/displayZhVi'
  import BaseModal from '@/components/common/BaseModal.vue'

  const ui = useUiStore()
  const player = usePlayerStore()
  const router = useRouter()

  const RESULT_NAMES: Record<'done' | 'unfinished' | 'broken', string> = {
    done: 'Thực Hiện Trọn Vẹn',
    unfinished: 'Chưa Xong',
    broken: 'Đã Phạm'
  }
  const RESULT_COLORS: Record<'done' | 'unfinished' | 'broken', string> = {
    done: 'text-cinnabar',
    unfinished: 'text-ink-faint',
    broken: 'text-amber-ink'
  }

  const HERITAGE_GROUP_TITLES: Record<string, string> = {
    full: 'Theo thần hồn mang đi',
    partial: 'Chiết tổn mang đi',
    reset: 'Theo thể xác buông xuống'
  }

  const chosen = ref<string | null>(null)
  const theme = ref<string | null>(null)
  const step = ref<'review' | 'next'>('review')
  // 交割清单「点一枚看取舍」:detail 只 hover 可见,移动端读不到这全屏唯一的关键信息
  const detailId = ref<string | null>(null)
  const detailRow = computed(() => {
    if (!detailId.value) return null
    for (const g of heritageGroups()) {
      const r = g.rows.find(r => r.id === detailId.value)
      if (r) return r
    }
    return null
  })

  const view = computed(() => ui.reincarnation)
  const reviewTheme = computed(() => (view.value?.review.themeId ? lifeThemeDef(view.value.review.themeId) : undefined))
  const themeDefs = computed(() => (view.value?.themeChoices ?? []).flatMap(id => lifeThemeDef(id) ?? []))

  /**
   * 天赋池会被抽空(可选天赋有限,多周目后 talentChoices 可能为空)。
   * 那种情况下没有可选项,却仍要能踏入轮回——否则玩家被永久卡死在此弹窗。
   * 只有「确有天赋可选却尚未择定」时才拦
   */
  const canConfirm = computed(() => (view.value?.talentChoices.length ?? 0) === 0 || chosen.value !== null)

  // 每次新开轮回界面都从"回顾"这一程重新走起
  watch(view, v => {
    if (v) step.value = 'review'
  })

  function beginRebirth(): void {
    prepareReincarnation()
  }

  function confirm(): void {
    confirmReincarnation(chosen.value, theme.value)
    chosen.value = null
    theme.value = null
    engine.resetDeathFlag()
    void router.push('/')
  }
</script>
