<template>
  <div class="space-y-3">
    <!-- Thông tin phiên -->
    <div class="card-ink px-4 py-3">
      <div class="flex items-center justify-between">
        <p class="font-kai text-[15px] tracking-widest text-ink">
          {{ displayRegionName(region?.name ?? '') }}
          <span class="text-[11px] text-ink-faint">· {{ displayExploreMode(modeName) }}</span>
          <span v-if="partnerName" class="ml-1.5 rounded bg-azure/10 px-1.5 py-0.5 text-[10px] text-azure">
            Đồng hành: {{ displayDaoluName(partnerName) }}
          </span>
        </p>
        <span class="tabular text-[12px] text-ink-soft">
          Còn <span class="countdown-slot">{{ formatCountdown(timeLeft) }}</span>
          <span v-if="session && timeLeft > 0" class="ml-1 text-[10px] text-ink-faint">Khoảng {{ formatClock(session.endsAt) }} về</span>
        </span>
      </div>
      <p class="mt-1 text-[11px] text-ink-faint tabular">
        Thắng {{ session?.wins ?? 0 }} trận · Cơ duyên {{ session?.events ?? 0 }} lần · Nhặt được {{ session?.itemGain ?? 0 }} món
        <span v-if="streak" class="ml-1 text-gold-ink">
          · Chuỗi thắng {{ streak }}
          <template v-if="nextStreak">
            · Cách chuỗi thắng {{ nextStreak }} còn thiếu {{ nextStreak - streak }} trận
            <template v-if="nextReward">(Thưởng: {{ nextReward }})</template>
          </template>
        </span>
        <span v-if="huntIn > 0.4" class="text-ink-faint">
          · Trận tiếp theo {{ formatCountdown(huntIn) }}
          <span v-if="session" class="text-[10px]">(Khoảng {{ formatClock(session.nextBattleAt) }})</span>
        </span>
      </p>
      <p v-if="gains" class="mt-0.5 text-[10px] text-ink-faint tabular">
        Thu hoạch lần này · Linh thạch <span class="text-gold-ink">+{{ gains.stone }}</span> · Tu vi
        <span class="text-jade">+{{ gains.exp }}</span><template v-if="gains.itemText"> · Nhặt được <span class="text-azure">{{ gains.itemText }}</span> món</template>
      </p>
      <p v-if="bossHint" class="mt-0.5 text-[10px]" :class="bossSoon ? 'text-cinnabar' : 'text-gold-ink'">
        {{ bossHint }}
      </p>
    </div>

    <!-- Bảng chiến đấu -->
    <div class="card-ink relative overflow-hidden px-4 py-4">
      <!-- Phía địch -->
      <div class="relative" :class="[shakeCls.e, defeated === 'e' ? 'foe-defeated' : '']">
        <div class="flex items-start gap-2">
          <span
            class="grid h-10 w-10 shrink-0 place-items-center rounded-full border"
            :class="battle?.isBoss ? 'border-cinnabar/70 text-cinnabar bg-cinnabar/5' : 'border-ink/25 text-ink-soft bg-ink/4'"
          >
            <GameIcon :name="battle?.enemyIcon ?? 'paw'" :size="18" />
          </span>
          <div class="min-w-0 grow">
            <p class="flex flex-wrap items-center gap-x-2 gap-y-1 font-kai text-[14px] text-ink">
              <template v-if="battle">
                <span data-foe-name class="whitespace-nowrap">{{ displayEnemyName(battle.enemyName) }}</span>
              </template>
              <template v-else>
                <span class="whitespace-nowrap">Đang tìm địch</span>
                <span class="ink-dots text-ink-faint">
                  <span />
                  <span />
                  <span />
                </span>
              </template>
              <span
                v-if="foeAdaptation"
                class="ml-auto shrink-0 text-[10px] font-normal text-gold-ink tabular"
                :title="foeAdaptation.reasons.join(';')"
              >
                {{ starsText(foeAdaptation.stars) }}
              </span>
            </p>
            <p
              v-if="battle && (battle.isBoss || isNemesisFoe || shownTraits.length)"
              class="mt-1 flex flex-wrap items-center gap-1.5"
            >
              <span v-if="battle.isBoss" class="chip-ink border-cinnabar/60 text-[9px] text-cinnabar">Thủ Lĩnh</span>
              <span v-if="isNemesisFoe" class="chip-ink border-cinnabar/80 bg-cinnabar/10 text-[9px] text-cinnabar">Kẻ Thù Truyền Kiếp</span>
              <span v-for="t in shownTraits" :key="t" class="chip-ink border-violet-ink/50 text-[9px] text-violet-ink">
                {{ TRAIT_NAMES[t] }}
              </span>
            </p>
            <ProgressBar :value="ehp" color="var(--color-cinnabar)" :height="6" class="mt-1" />
            <p v-if="battle?.enemyPower" class="mt-1 text-[10px] text-ink-faint tabular">
              Địch lực {{ formatGN(battle.enemyPower) }} · Ta
              {{ formatGN(battle.playerPower ?? player.finalStats.power) }}
            </p>
          </div>
        </div>
        <span
          v-for="f in floats.filter(x => x.side === 'e')"
          :key="f.id"
          class="pointer-events-none absolute right-2 top-0 tabular font-kai"
          :class="f.crit ? 'animate-float-crit text-[17px] text-cinnabar' : 'animate-float-dmg text-[13px] text-ink-soft'"
        >
          {{ f.text }}
        </span>
      </div>

      <!-- Chiến báo -->
      <div class="relative mt-3">
        <button
          class="absolute right-1 -top-0.5 z-10 -m-2 rounded p-2 text-[10px] text-ink-faint active:text-ink active:opacity-60"
          @click="skipPlayback"
        >
          Bỏ qua phát lại »
        </button>
        <div ref="logBox" class="h-48 space-y-1 overflow-y-auto rounded-md bg-ink/4 px-3 py-2">
          <p
            v-for="(entry, i) in displayed"
            :key="i"
            data-battle-log
            class="text-[12px] leading-relaxed"
            :class="KIND_COLOR[entry.t]"
          >
            {{ displayCombatLog(entry.text) }}
            <span v-if="entry.dmg" class="tabular" :class="entry.t === 'crit' ? 'text-cinnabar' : ''">{{ entry.dmg }}</span>
          </p>
          <p v-if="displayed.length === 0" class="pt-16 text-center text-[12px] text-ink-faint">Gió núi lướt qua, bốn bề tĩnh lặng……</p>
        </div>
      </div>

      <!-- Phía ta -->
      <div class="relative mt-3 space-y-2.5" :class="[shakeCls.p, defeated === 'p' ? 'foe-defeated' : '']">
        <!-- Nhân vật chính -->
        <div class="flex items-center gap-2">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-azure/50 bg-azure/5 text-azure">
            <GameIcon name="user" :size="18" />
          </span>
          <div class="grow min-w-0">
            <div class="flex items-center justify-between">
              <p class="font-kai text-[14px] text-ink truncate">{{ player.name }}</p>
              <span class="text-[10px] tabular text-ink-soft">{{ Math.round(php * 100) }}% Khí huyết</span>
            </div>
            <ProgressBar :value="php" color="var(--color-jade)" :height="6" class="mt-1" />
          </div>
        </div>

        <!-- Đạo lữ đồng hành -->
        <div v-if="partnerName" class="flex items-center gap-2 rounded-md border border-ink/10 bg-ink/4 px-2.5 py-1.5">
          <span
            class="grid h-9 w-9 shrink-0 place-items-center rounded-full border"
            :class="dhp <= 0.3 ? 'border-cinnabar text-cinnabar bg-cinnabar/10 animate-pulse' : 'border-azure/40 text-azure bg-azure/5'"
          >
            <GameIcon name="heart" :size="16" />
          </span>
          <div class="grow min-w-0">
            <div class="flex items-center justify-between gap-1">
              <div class="flex items-center gap-1.5 min-w-0">
                <p class="font-kai text-[13px] text-ink truncate">{{ displayDaoluName(partnerName) }}</p>
                <span class="chip-ink border-azure/40 text-[9px] text-azure shrink-0">Đạo Lữ Đồng Hành</span>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <span
                  class="text-[10px] tabular"
                  :class="dhp <= 0.3 ? 'text-cinnabar font-semibold' : 'text-ink-soft'"
                >
                  {{ Math.round(dhp * 100) }}% Khí huyết
                </span>
                <button
                  v-if="dhp < 0.98"
                  class="chip-ink min-h-[22px] !text-[9px] px-1.5"
                  :class="dhp <= 0.3 ? 'border-cinnabar text-cinnabar bg-cinnabar/10 font-semibold' : 'text-azure'"
                  @click="openHealModal"
                >
                  Truyền Khí Huyết
                </button>
              </div>
            </div>
            <ProgressBar
              :value="dhp"
              :color="dhp <= 0.3 ? 'var(--color-cinnabar)' : 'var(--color-jade)'"
              :height="6"
              class="mt-1"
            />
          </div>
        </div>

        <span
          v-for="f in floats.filter(x => x.side === 'p')"
          :key="f.id"
          class="pointer-events-none absolute right-2 top-0 tabular font-kai"
          :class="f.crit ? 'animate-float-crit text-[17px] text-cinnabar' : 'animate-float-dmg text-[13px] text-cinnabar'"
        >
          {{ f.text }}
        </span>
        <span
          v-for="f in floats.filter(x => x.side === 'd')"
          :key="f.id"
          class="pointer-events-none absolute right-2 bottom-0 tabular font-kai"
          :class="f.crit ? 'animate-float-crit text-[17px] text-cinnabar' : 'animate-float-dmg text-[13px] text-jade'"
        >
          {{ f.text }}
        </span>
      </div>
      <!-- Thống kê sau trận + lối vào phân tích -->
      <p v-if="battleSummary" class="mt-2 flex items-center justify-center gap-2 text-center text-[10px] text-ink-faint tabular">
        {{ battleSummary }}
        <button
          v-if="lore"
          class="-my-2 inline-flex min-h-[28px] items-center px-1 text-violet-ink active:opacity-60"
          @click="showLore = !showLore"
        >
          {{ showLore ? 'Thu lại' : 'Hiểu biết về vật này »' }}
        </button>
        <button
          v-if="analysis"
          class="-my-2 inline-flex min-h-[28px] items-center px-1 text-azure active:opacity-60"
          @click="showAnalysis = !showAnalysis"
        >
          {{ showAnalysis ? 'Thu lại' : 'Phân tích chiến đấu »' }}
        </button>
      </p>
      <p v-if="battleLoot.length" class="mt-1 text-center text-[10px] leading-relaxed text-ink-faint">
        <span class="text-gold-ink">Thu được trong trận: </span>
        {{ battleLoot.join(' · ') }}
      </p>
      <!-- Hiểu biết về vật này -->
      <div v-if="showLore && lore" class="mt-2 rounded-md bg-ink/4 px-3 py-2.5">
        <p class="flex items-center gap-2">
          <span class="font-kai text-[12px] tracking-wider text-ink">{{ displayEnemyName(battle?.enemyName ?? '') }}</span>
          <span class="chip-ink border-violet-ink/50 text-[9px] text-violet-ink">{{ displayLoreStageName(lore.stageName) }}</span>
          <span v-if="lore.boosted" class="text-[10px] text-gold-ink">Túc Tuệ Chiếu Kiến</span>
        </p>
        <p v-if="lore.elementName || lore.frame.length" class="mt-1 text-[11px] text-ink-soft">
          <span v-if="lore.elementName" class="mr-1.5 text-azure">Hệ {{ displayLoreElement(lore.elementName) }}</span>
          {{ lore.frame.map(f => displayLoreFrame(f)).join(' · ') }}
        </p>
        <p v-for="s in lore.skills" :key="s.name" class="mt-1 text-[11px] leading-relaxed text-ink-soft">
          ·
          <span class="text-ink">{{ displayEnemySkillName(s.name) }}</span>
          —— {{ displayLoreSkillNote(s.note) }}
        </p>
        <p v-for="ph in lore.phases" :key="ph.at" class="mt-1 text-[11px] leading-relaxed text-cinnabar">
          · Khi {{ displayLorePhaseAt(ph.at) }} thì {{ displayLorePhaseLabel(ph.label) }}
        </p>
        <p v-if="lore.archetype" class="mt-1.5 text-[11px] leading-relaxed text-gold-ink">
          <span v-if="lore.archetypeLabel" class="mr-1 rounded bg-gold-ink/10 px-1 py-0.5 text-[10px]">
            {{ displayLoreArchetypeLabel(lore.archetypeLabel) }}
          </span>
          {{ displayLoreArchetype(lore.archetype) }}
        </p>
        <p v-if="lore.progress && lore.progress.remain > 0" class="mt-1.5 text-[10px] leading-relaxed text-ink-faint tabular">
          Đã đối mặt {{ lore.progress.seen }} lần, gom thêm
          <span class="text-violet-ink">{{ lore.progress.remain }}</span> lần
          <template v-if="lore.progress.nextName">có thể thăm dò「{{ displayLoreStageName(lore.progress.nextName) }}」</template>
          <template v-else>có thể hiểu sâu hơn về thủ đoạn của nó</template>
          <span class="text-ink-faint">
            (Thắng tính 1 · Thua tính 3<template v-if="lore.progress.isBoss"> · Thủ lĩnh tính gấp đôi</template>)
          </span>
        </p>
      </div>
      <!-- Phân tích chiến đấu -->
      <div v-if="showAnalysis && analysis" class="mt-2 rounded-md bg-ink/4 px-3 py-2.5">
        <p class="flex items-baseline gap-1.5">
          <span
            class="h-3 w-1 shrink-0 self-center rounded-sm"
            :class="battle?.result.win ? 'bg-jade' : 'bg-cinnabar'"
            aria-hidden="true"
          ></span>
          <span class="font-kai text-[12px] tracking-wider" :class="battle?.result.win ? 'text-jade' : 'text-cinnabar'">
            {{ displayBattleAnalysisText(analysis.headline) }}
          </span>
          <span class="chip-ink border-ink/15 text-[9px]" :class="battle?.result.win ? 'text-jade' : 'text-cinnabar'">
            {{ battle?.result.win ? 'Nguyên nhân thắng' : 'Nguyên nhân bại' }}
          </span>
        </p>
        <ul v-if="analysis.findings.length" class="mt-1.5 space-y-1">
          <li v-for="(f, i) in analysis.findings" :key="i" class="flex gap-1.5 text-[11px] leading-relaxed text-ink-soft">
            <span class="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-ink/30" aria-hidden="true"></span>
            <span>{{ displayBattleAnalysisText(f.text) }}</span>
          </li>
        </ul>
        <div v-if="analysis.directions.length" class="mt-2 rounded-md border border-violet-ink/15 bg-violet-ink/5 px-2.5 py-2">
          <p class="text-[10px] tracking-wide text-ink-faint">
            Hướng có thể mượn lực <span class="text-ink-faint">(không phải giải pháp duy nhất)</span>:
          </p>
          <ul class="mt-1 flex flex-col gap-1">
            <li v-for="d in analysis.directions" :key="d.styleName" class="flex flex-col">
              <span class="text-[11px] text-violet-ink">{{ displayBattleAnalysisText(d.styleName) }}</span>
              <span class="text-[10px] leading-relaxed text-ink-faint">{{ displayBattleAnalysisText(d.reason) }}</span>
            </li>
          </ul>
        </div>
        <div v-if="analysis.dataRows.length" class="mt-2 border-t border-ink/10 pt-1.5">
          <div v-if="analysisSections.setup.length">
            <p class="text-[10px] tracking-wide text-ink-faint">Hằng số cục diện</p>
            <div class="mt-0.5 space-y-0.5">
              <p v-for="row in analysisSections.setup" :key="row.label" class="flex items-baseline gap-3 text-[10px] tabular">
                <span class="min-w-[4.5rem] shrink-0 whitespace-nowrap text-ink-faint">{{ formatRowLabel(row.label) }}</span>
                <span class="min-w-0 flex-1 text-right text-ink-soft">{{ formatRowValue(row) }}</span>
              </p>
            </div>
          </div>
          <div v-if="analysisSections.account.length" class="mt-1.5">
            <p class="text-[10px] tracking-wide text-ink-faint">Sổ sách thời chiến</p>
            <div class="mt-0.5 space-y-0.5">
              <p v-for="row in analysisSections.account" :key="row.label" class="flex items-baseline gap-3 text-[10px] tabular">
                <span class="min-w-[4.5rem] shrink-0 whitespace-nowrap text-ink-faint">{{ formatRowLabel(row.label) }}</span>
                <span class="min-w-0 flex-1 text-right text-ink-soft">{{ formatRowValue(row) }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button class="btn-ghost w-full" @click="stopExploration('manual')">Thu Quân Về Phủ</button>

    <!-- Hộp thoại: Độ Huyết Trị Thương cho Đạo Lữ -->
    <BaseModal :open="healModalOpen" title="Độ Huyết Trị Thương" @close="healModalOpen = false">
      <div class="space-y-3">
        <div class="rounded-md bg-cinnabar/10 p-3 text-cinnabar border border-cinnabar/20">
          <p class="font-kai text-[13px] font-semibold flex items-center gap-1.5">
            <GameIcon name="heart" :size="16" />
            Khí Huyết Đạo Lữ Hao Tổn Nghiêm Trọng!
          </p>
          <p class="mt-1 text-[11px] leading-relaxed">
            Đạo lữ <strong>{{ displayDaoluName(partnerName ?? '') }}</strong> trong lúc cùng ngươi xuất chinh lịch luyện đã bị thương tích, khí huyết hiện chỉ còn
            <strong class="text-[12px] underline">{{ Math.round(dhp * 100) }}%</strong>!
          </p>
        </div>

        <div class="rounded-md bg-ink/4 p-3 text-[11px] space-y-2 text-ink-soft border border-ink/10">
          <p class="text-ink font-semibold">Quy tắc truyền huyết chữa thương:</p>
          <p class="leading-relaxed text-ink-faint">
            Ngươi có thể vận chuyển chân nguyên khí huyết của bản thân độ vào kinh mạch của đạo lữ để chữa lành thương tổn, giúp nàng lập tức hồi phục 100% khí huyết.
          </p>
          <div class="ink-divider my-1.5" />
          <div class="flex justify-between items-center text-[11px] tabular">
            <span class="text-ink-faint">Máu đạo lữ đã mất:</span>
            <span class="text-cinnabar font-semibold">{{ Math.round((1 - dhp) * 100) }}%</span>
          </div>
          <div class="flex justify-between items-center text-[11px] tabular">
            <span class="text-ink-faint">Khí huyết bản thân tiêu hao (tỷ lệ 60%):</span>
            <span class="text-cinnabar font-semibold">-{{ Math.round((1 - dhp) * 60) }}%</span>
          </div>
          <div class="flex justify-between items-center text-[11px] tabular">
            <span class="text-ink-faint">Khí huyết bản thân sau khi truyền:</span>
            <span class="text-jade font-semibold">{{ Math.round(Math.max(10, php * 100 - (1 - dhp) * 60)) }}%</span>
          </div>
        </div>

        <div class="space-y-2 pt-1">
          <button class="btn-seal w-full !py-2.5 !text-[13px]" @click="confirmHeal">
            Đồng Ý (Truyền Khí Huyết Cứu Đạo Lữ)
          </button>
          <button class="btn-ghost w-full !py-2 text-[12px]" @click="healModalOpen = false">
            Tạm Thời Chưa Dùng
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch, onUnmounted } from 'vue'
  import { useAdventureStore } from '@/stores/adventure'
  import { usePlayerStore } from '@/stores/player'
  import { useSettingsStore } from '@/stores/settings'
  import { stopExploration, winsUntilRegionBoss, regionBossCleared, healDaoluWithPlayerBlood } from '@/core/exploration'
  import { COMBAT_PLAYBACK_BASE_MS, COMBAT_PLAYBACK_MIN_MS, EXPLORE_MODES } from '@/data/constants'
  import { WIN_STREAK_REWARDS } from '@/data/earlyGame'
  import { formatClock, formatCountdown, formatGN } from '@/utils/format'
  import { useNow } from '@/composables/useNow'
  import { detectBuild } from '@/core/buildDetect'
  import { detectionAdaptation, enemyTraits, starsText, TRAIT_NAMES, type RegionEcology } from '@/core/buildAdvisor'
  import { analyzeBattle } from '@/core/battleAnalysis'
  import { isNemesis } from '@/core/worldMemory'
  import { playSfx } from '@/core/audio'
  import { enemyDef } from '@/data/enemies'
  import { daoluDef } from '@/data/daolu'
  import { enemyLoreView } from '@/ui/enemyLore'
  import {
    displayLoreStageName,
    displayLoreElement,
    displayLoreFrame,
    displayLoreSkillNote,
    displayEnemySkillName,
    displayLorePhaseAt,
    displayLorePhaseLabel,
    displayLoreArchetype,
    displayLoreArchetypeLabel,
    displayRegionName,
    displayExploreMode,
    displayEnemyName,
    displayCombatLog,
    displayDaoluName,
    displayBattleAnalysisText
  } from '@/ui/displayZhVi'
  import type { CombatLogEntry } from '@/types'
  import ProgressBar from '@/components/common/ProgressBar.vue'
  import GameIcon from '@/components/common/GameIcon.vue'
  import BaseModal from '@/components/common/BaseModal.vue'

  const adventure = useAdventureStore()
  const player = usePlayerStore()
  const settings = useSettingsStore()
  const now = useNow()

  const displayed = ref<CombatLogEntry[]>([])
  const php = ref(1)
  const ehp = ref(1)
  const dhp = ref(1)
  const healModalOpen = ref(false)
  const hasPromptedLowHp = ref(false)
  const floats = ref<{ id: number; text: string; side: 'p' | 'e' | 'd'; crit: boolean }[]>([])
  const shakeCls = ref<{ p: string; e: string }>({ p: '', e: '' })
  const defeated = ref<'p' | 'e' | null>(null)
  const logBox = ref<HTMLElement | null>(null)

  let playTimer: number | undefined
  let floatSeq = 1

  const session = computed(() => adventure.session)
  const region = computed(() => adventure.currentRegion)
  const battle = computed(() => adventure.lastBattle)
  const timeLeft = computed(() => (session.value ? Math.max(0, (session.value.endsAt - now.value) / 1000) : 0))
  const huntIn = computed(() => (session.value ? Math.max(0, (session.value.nextBattleAt - now.value) / 1000) : 0))
  const modeName = computed(() => (session.value ? EXPLORE_MODES[session.value.mode].name : ''))
  const partnerName = computed(() => {
    const id = session.value?.accompanyPartnerId
    if (!id) return null
    return daoluDef(id)?.name ?? null
  })

  /** 本次历练已得(灵石/修为/拾获件数)—— 取自会话里如实累计的入账数,不是期望值 */
  const gains = computed(() => {
    const s = session.value
    if (!s) return null
    return { stone: formatGN(s.stoneGain), exp: formatGN(s.expGain), itemText: s.itemGain > 0 ? String(s.itemGain) : null }
  })

  /**
   * 连胜、下一档的缺口,与那一档的赏格:与奖励 toast 读同一本账
   * (player.winStreak + WIN_STREAK_REWARDS),只差一个 milestone 时跳过一次
   * (比如连胜 9 时「距 10」还在),满了 10 无话可说。赏格取自表里那一行,
   * 只排格式不手写数 —— 到账的 toast 另走 streakRewardText,同一本账。
   */
  const streak = computed(() => player.winStreak)
  const nextRewardRow = computed(() => WIN_STREAK_REWARDS.find(r => r.streak > streak.value) ?? null)
  const nextStreak = computed(() => nextRewardRow.value?.streak ?? null)
  /** 赏格预览:数字取自 WIN_STREAK_REWARDS 那一行,只排格式,不手写数 */
  const nextReward = computed(() => {
    const r = nextRewardRow.value
    if (!r) return null
    const parts: string[] = []
    if (r.stone > 0) parts.push(`${formatGN(r.stone)} thạch`)
    if (r.wudao > 0) parts.push(`${r.wudao} điểm ngộ đạo`)
    return parts.length ? parts.join(' · ') : null
  })

  /** 距区域之主还差几胜(已靖的地界不再提示) */
  const bossIn = computed(() => {
    const s = session.value
    const r = region.value
    if (!s || !r) return null
    return winsUntilRegionBoss(s.wins, regionBossCleared(r.id))
  })
  const bossSoon = computed(() => bossIn.value !== null && bossIn.value <= 0)
  const bossHint = computed(() => {
    const n = bossIn.value
    if (n === null) return null
    return n > 0 ? `Cách thủ lĩnh nơi này còn ${n} trận thắng` : 'Thủ lĩnh nơi này sắp xuất hiện —— Trận kế tiếp là thủ lĩnh'
  })

  /** 本战拾获明细(旧存档/旧战报没有这一栏 → 空数组) */
  const battleLoot = computed(() => battle.value?.loot ?? [])

  /** 当前敌人的机制特性标签 */
  const foeTraits = computed(() => {
    const id = battle.value?.enemyId
    if (!id) return []
    const def = enemyDef(id)
    return def ? enemyTraits(def) : []
  })

  /** 此物所知(Phase 32.5)—— 战前情报由认知层决定,不是白送的 */
  const lore = computed(() => {
    const id = battle.value?.enemyId
    return id ? enemyLoreView(id) : null
  })

  /**
   * 认得它,才谈得上"知道它会怎么打"。
   * 交过一场手即达「眼熟」,所以这道门只挡第一次照面 —— 那一次本就该是未知的。
   */
  const foeKnown = computed(() => (lore.value?.stage ?? 0) >= 1)

  const shownTraits = computed(() => (foeKnown.value ? foeTraits.value : []))

  /** 宿敌标记:此敌曾败我 ≥3 次且尚未雪耻 */
  const isNemesisFoe = computed(() => {
    const id = battle.value?.enemyId
    return id ? isNemesis(player.nemeses, id) : false
  })

  /** 当前构筑对此敌的适配(战力之外的胜负参考) */
  const foeAdaptation = computed(() => {
    const b = battle.value
    if (!b || !foeKnown.value) return null
    const build = detectBuild(player.finalStats.mods)
    if (!build) return null
    const eco: RegionEcology = { burst: 0, multi: 0, pierce: 0, dodge: 0 }
    for (const t of foeTraits.value) eco[t] = 2
    return detectionAdaptation(build, eco, b.isBoss)
  })

  /** 战斗后统计行 */
  const battleSummary = computed(() => {
    const b = battle.value
    if (!b) return null
    const r = b.result
    // 结语只多四个字,却是每个玩家每场都会读到的一行:抢先 / 被抢先
    const first = r.firstMove ? (r.firstMove.playerFirst ? ' · Ra tay trước' : ' · Bị ra tay trước') : ''
    return `Trận này ${r.rounds} hiệp · Khí huyết sau trận ${Math.round(r.playerHpPct * 100)}% · ${r.win ? 'Thắng' : 'Bại'}${first}`
  })

  // ---- 战斗分析(第三层信息) ----
  const showAnalysis = ref(false)
  const showLore = ref(false)

  const analysis = computed(() => {
    const b = battle.value
    if (!b) return null
    const build = detectBuild(player.finalStats.mods)
    return analyzeBattle(b.result, build?.style.id ?? null)
  })

  /**
   * 数据行按语义分两节:
   * - 战局定数(先手 / 敌之加成)—— 开打前就定下的数,全是长句,该整行让位;
   * - 战时账目(其余)—— 逐项读账,短条更密。
   * 两个标签是 battleAnalysis 里钉死的字符串,这里只作分组,不碰模型。
   */
  const analysisSections = computed(() => {
    const a = analysis.value
    if (!a) return { setup: [], account: [] }
    const SETUP_LABELS = new Set(['先手', '敌之加成'])
    return {
      setup: a.dataRows.filter(r => SETUP_LABELS.has(r.label)),
      account: a.dataRows.filter(r => !SETUP_LABELS.has(r.label))
    }
  })

  function formatRowLabel(label: string): string {
    const map: Record<string, string> = {
      '先手': 'Tiên thủ',
      '敌之加成': 'Gia thành của địch',
      '总输出': 'Tổng gây sát thương',
      '总造成伤害': 'Tổng gây sát thương',
      '总承伤': 'Tổng chịu sát thương',
      '真伤承伤占比': 'Tỷ lệ sát thương chuẩn',
      '单次最大承伤': 'Chịu đòn lớn nhất',
      '治疗量': 'Lượng trị liệu',
      '护盾吸收': 'Hộ thuẫn hấp thu',
      '命中 / 落空': 'Trúng / Trượt',
      '暴击 / 连击 / 反击': 'Bạo / Liên / Phản',
      '神通 / 法宝触发': 'Thần thông / Pháp bảo'
    }
    return map[label] ?? label
  }

  function formatRowValue(row: { label: string; value: string }): string {
    let val = displayBattleAnalysisText(row.value)
    if (row.label === '先手') {
      return val
        .replace(/你抢先/g, 'Bạn ra tay trước')
        .replace(/敌先动/g, 'Địch ra tay trước')
        .replace(/你/g, 'Bạn')
        .replace(/敌/g, 'Địch')
    }
    return val
  }

  // 战败时自动展开分析;并按胜负配一声战果音
  watch(
    () => battle.value?.at,
    () => {
      if (!battle.value) return
      playSfx(battle.value.result.win ? 'win' : 'lose')
      if (!battle.value.result.win) showAnalysis.value = true
    }
  )

  const KIND_COLOR: Record<CombatLogEntry['t'], string> = {
    atk: 'text-ink-soft',
    skill: 'text-azure',
    crit: 'text-cinnabar',
    shield: 'text-gold-ink',
    heal: 'text-jade',
    dodge: 'text-ink-faint',
    proc: 'text-violet-ink',
    info: 'text-ink-faint',
    win: 'text-jade font-kai',
    lose: 'text-cinnabar font-kai'
  }

  function stopPlayback(): void {
    if (playTimer !== undefined) {
      window.clearInterval(playTimer)
      playTimer = undefined
    }
  }

  function checkLowHpPrompt(): void {
    if (partnerName.value && dhp.value <= 0.30 && !hasPromptedLowHp.value) {
      healModalOpen.value = true
      hasPromptedLowHp.value = true
    }
  }

  function openHealModal(): void {
    healModalOpen.value = true
  }

  function confirmHeal(): void {
    const res = healDaoluWithPlayerBlood()
    if (res.ok) {
      dhp.value = 1.0
      if (res.newPlayerHp !== undefined) {
        php.value = res.newPlayerHp
      }
      if (res.playerHpLoss) {
        const id = floatSeq
        floatSeq += 1
        floats.value = [
          ...floats.value.slice(-5),
          { id, text: `-${Math.round(res.playerHpLoss * 100)}% Huyết`, side: 'p', crit: true }
        ]
        setTimeout(() => {
          floats.value = floats.value.filter(f => f.id !== id)
        }, 900)
      }
      const id2 = floatSeq
      floatSeq += 1
      floats.value = [
        ...floats.value.slice(-5),
        { id2, text: '+100% Khí Huyết', side: 'd', crit: false }
      ]
      setTimeout(() => {
        floats.value = floats.value.filter(f => f.id !== id2)
      }, 900)
      healModalOpen.value = false
    }
  }

  function playBattle(instant = false): void {
    const b = battle.value
    if (!b) return
    stopPlayback()
    defeated.value = null
    const entries = b.result.log
    const startDhp = b.partnerStartHpPct ?? session.value?.partnerHpPct ?? 1
    const targetDhp = b.partnerHpPct ?? session.value?.partnerHpPct ?? 1

    // 减动效:同 GauntletPanel —— 直接给结果不逐条播,开关对两处战斗回放一视同仁
    if (instant || settings.reduceMotion) {
      displayed.value = entries.slice(-100)
      const last = entries[entries.length - 1]
      php.value = last?.php ?? 1
      ehp.value = last?.ehp ?? 1
      dhp.value = targetDhp
      defeated.value = b.result.win ? 'e' : 'p'
      checkLowHpPrompt()
      return
    }
    displayed.value = []
    php.value = 1
    ehp.value = 1
    dhp.value = startDhp
    let idx = 0
    const interval = Math.max(COMBAT_PLAYBACK_MIN_MS, COMBAT_PLAYBACK_BASE_MS / settings.battleSpeed)
    playTimer = window.setInterval(() => {
      const entry = entries[idx]
      if (!entry) {
        stopPlayback()
        defeated.value = b.result.win ? 'e' : 'p'
        dhp.value = targetDhp
        checkLowHpPrompt()
        return
      }
      displayed.value = [...displayed.value.slice(-99), entry]
      php.value = entry.php
      ehp.value = entry.ehp
      if (entries.length > 0) {
        dhp.value = Math.max(0, Math.round((startDhp - (startDhp - targetDhp) * ((idx + 1) / entries.length)) * 100) / 100)
      }
      if (entry.dmg) {
        const id = floatSeq
        floatSeq += 1
        floats.value = [
          ...floats.value.slice(-5),
          { id, text: `-${entry.dmg}`, side: entry.side === 'p' ? 'e' : 'p', crit: entry.t === 'crit' }
        ]
        setTimeout(() => {
          floats.value = floats.value.filter(f => f.id !== id)
        }, 900)
        triggerShake(entry.side === 'p' ? 'e' : 'p', entry.t === 'crit')
      }
      requestAnimationFrame(() => {
        logBox.value?.scrollTo({ top: logBox.value.scrollHeight })
      })
      idx += 1
    }, interval)
  }

  /** 受击方短促震颤(暴击更重);先清类、下一帧再挂,保证连击时动画也能重放 */
  function triggerShake(side: 'p' | 'e', hard: boolean): void {
    shakeCls.value = { ...shakeCls.value, [side]: '' }
    requestAnimationFrame(() => {
      shakeCls.value = { ...shakeCls.value, [side]: hard ? 'hit-shake-hard' : 'hit-shake' }
    })
  }

  /** 跳过播放,直接呈现战果 */
  function skipPlayback(): void {
    playBattle(true)
  }

  watch(
    () => battle.value?.at,
    (at, oldAt) => {
      if (at !== undefined && at !== oldAt) playBattle(false)
    }
  )

  watch(
    () => session.value?.partnerHpPct,
    val => {
      if (val !== undefined && playTimer === undefined) {
        dhp.value = val
      }
      if (val !== undefined && val > 0.5) {
        hasPromptedLowHp.value = false
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    if (battle.value) playBattle(true)
  })

  onUnmounted(stopPlayback)
</script>
