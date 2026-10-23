<template>
  <div class="stagger-in space-y-4 px-4 pb-6 pt-4">
    <!-- Đang lịch luyện -->
    <template v-if="adventure.sessionActive">
      <CombatPanel />
    </template>

    <!-- Chọn khu vực -->
    <template v-else>
      <!-- Bản Thế Chi Giới: Lối vào liên kết -->
      <RouterLink to="/world" class="card-ink flex items-center gap-3 border-azure/30 px-4 py-3 active:scale-98">
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-azure/15 text-azure">
          <GameIcon name="cloud" :size="18" />
        </span>
        <span class="min-w-0 grow">
          <span class="block font-kai text-[14px] tracking-[0.2em] text-ink">Bản Thế Chi Giới</span>
          <span class="block truncate text-[10px] leading-relaxed text-ink-faint">{{ worldBrief }}</span>
        </span>
        <span class="shrink-0 text-[11px] text-azure">Quan Sát →</span>
      </RouterLink>

      <SecretRealmCard />

      <SectionTitle title="Lịch Luyện" hint="Đi vạn dặm đường, rèn một tấm lòng" />
      <p class="text-[10px] leading-relaxed text-violet-ink">
        Tinh tượng hôm nay: {{ displayMansionLine(mansionLine) }} —— Lợi
        <span class="text-gold-ink">{{ displayWorldName(favoredWorldName) }}</span
        >, lịch luyện tại nơi này cơ duyên <span class="tabular" title="Bí cảnh và các hoạt động khác không nhận tăng thêm này">+{{ mansionLuckPct }}%</span> (nơi khác không tăng).
      </p>
      <p class="mt-1 flex items-center gap-2 text-[10px]">
        <button class="chip-ink min-h-[28px] text-azure" aria-label="Định hướng tinh tượng" @click="mansionRedirectOpen = !mansionRedirectOpen">
          Định Hướng Tinh Tượng{{ redirectActiveText }} ▾
        </button>
      </p>
      <div v-if="mansionRedirectOpen" class="mt-1.5 rounded border border-ink/10 bg-ink/4 p-2">
        <p class="text-[9px] leading-relaxed text-ink-faint">
          Định hướng giới vực có lợi hôm nay đến nơi đã chọn (mỗi lần tốn {{ redirectCostText }} linh thạch; hôm nay giới hạn {{ mansionRedirectMax }} lần,
          khi đạt tối đa sẽ không thể đổi hướng tiếp, giới đã định hướng vẫn giữ hiệu lực).
        </p>
        <div class="mt-1.5 flex flex-wrap gap-2">
          <button
            v-for="w in WORLDS"
            :key="w.id"
            class="chip-ink min-h-[28px]"
            :class="redirectReason(w.id)
              ? 'cursor-not-allowed border-ink/15 bg-ink/5 text-ink-faint'
              : w.id === effectiveWorldId ? 'text-gold-ink' : 'text-azure'"
            :disabled="redirectReason(w.id) !== null"
            :title="redirectReason(w.id) ?? `Hôm nay định hướng đến「${displayWorldName(w.name)}」`"
            :aria-label="redirectReason(w.id) ? `${displayWorldName(w.name)} · ${redirectReason(w.id)}` : `Hôm nay định hướng đến「${displayWorldName(w.name)}」`"
            @click="redirectTo(w.id)"
          >{{ displayWorldName(w.name) }}{{ w.id === effectiveWorldId ? ' ·' : '' }}</button>
        </div>
      </div>
      <p v-if="player.suppressedRegions.length > 0" class="text-[10px] text-gold-ink">
        Đang trấn áp thu lợi {{ player.suppressedRegions.length }} nơi —— Không xung đột với lịch luyện, có thể thu thập đồng thời; mỗi lần chỉ có thể lịch luyện một nơi.
      </p>
      <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
        <span class="text-ink-faint">3 bậc trên đường:</span>
        <span v-for="t in EVENT_TIERS" :key="t.id" class="chip-ink text-[10px]" :style="{ color: t.color }">
          {{ displayEventTierName(t.name) }} · {{ displayTierOddsText(tierOddsText(t.id, chainPending, exploreEventChance(adventure.session?.regionId ?? '', player.finalStats.mods))) }}
        </span>
      </p>
      <p class="text-[10px] leading-relaxed text-ink-faint">
        Ngưỡng trấn áp: {{ SUPPRESS_THRESHOLDS.minFights }} trận · Bình quân
        {{ SUPPRESS_THRESHOLDS.maxAvgRounds }} hiệp · Chịu thương tổn ≤{{ Math.round(SUPPRESS_THRESHOLDS.maxAvgDamageTaken * 100) }}%;
        Tư cách vĩnh viễn, trấn thủ đủ {{ REVIVE_AFTER_HOURS }} giờ yêu khí tụ lại.
      </p>
      <div class="space-y-2.5">
        <template v-for="group in groupedRows" :key="group.world.id">
          <div class="flex items-center gap-2 pt-1">
            <span class="font-kai text-[11px] tracking-[0.3em] text-ink-soft">{{ displayWorldName(group.world.name) }}</span>
            <span class="h-px grow bg-ink/10" />
            <span class="text-[10px] text-ink-faint">{{ group.rows.length }} nơi</span>
          </div>
        <div
          v-for="row in group.rows"
          :key="row.def.id"
          data-region-card
          class="card-ink px-4 py-3"
          :class="{ 'opacity-70': !row.canEnter, '!border-gold-ink/30 bg-gold-ink/5': row.suppressed }"
        >
          <div class="flex items-start gap-3">
            <span
              class="grid h-10 w-10 shrink-0 place-items-center rounded-md"
              :class="row.suppressed ? 'bg-gold-ink/15 text-gold-ink' : row.canEnter ? 'bg-indigo-ink/10 text-indigo-ink' : 'bg-ink/6 text-ink-faint'"
            >
              <GameIcon :name="row.suppressed ? 'shield-check' : row.canEnter ? row.def.icon : 'lock'" :size="18" />
            </span>
            <div data-region-head class="min-w-0 grow">
              <p class="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span data-region-name class="font-kai text-[15px] tracking-wider text-ink">{{ displayRegionName(row.def.name) }}</span>
                <span v-if="row.suppressed && !row.revived" class="chip-ink border-gold-ink/60 text-[9px] text-gold-ink">Đã trấn áp</span>
                <span v-else-if="row.revived" class="chip-ink border-cinnabar/60 text-[9px] text-cinnabar">Yêu khí tụ lại</span>
                <span v-else-if="row.cleared" class="chip-ink border-jade/60 text-[9px] text-jade">Đã dẹp yên</span>
                <!-- 世界记忆: 区域兴衰状态 -->
                <span
                  v-if="row.recall.prosperity !== 'chaos'"
                  class="chip-ink text-[9px]"
                  :class="row.recall.prosperity === 'flourish' ? 'border-azure/60 text-azure' : 'border-jade/60 text-jade'"
                >
                  {{ displayProsperityName(prosperityName(row.recall.prosperity)) }}
                </span>
              </p>
              <p class="mt-0.5 text-[11px] text-ink-faint">
                Cảnh giới {{ displayRealmName(REALMS[row.def.minRealm]?.name) }} thích hợp ·
                <span :class="row.def.danger >= 4 ? 'text-cinnabar' : ''">{{ displayDangerName(DANGER_NAMES[row.def.danger]) }}</span>
                <span v-if="row.tooHard" class="ml-1 text-cinnabar">· Cảnh giới còn thấp, e có nguy hiểm tính mạng</span>
                <span class="ml-1 whitespace-nowrap text-ink-soft">· {{ displayProduceTierText(produceTierText(row.def.tier)) }}</span>
              </p>
              <p v-if="row.foeOrigin.parts.length" data-region-foe-origin class="mt-0.5 text-[10px] leading-relaxed text-ink-faint">
                Kẻ địch nơi này: {{ displayFoeOriginPartsText(foeOriginPartsText(row.foeOrigin)) }}
              </p>
            </div>
            <button
              v-if="row.canEnter && !row.suppressed"
              data-region-action
              class="btn-seal shrink-0 !px-4 !py-2 !text-[13px]"
              @click="chooseMode(row.def)"
            >
              Xuất phát
            </button>
          </div>

          <!--
            Trấn áp thu lợi
          -->
          <div
            v-if="row.suppressed"
            data-region-action
            data-suppress-info
            class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-gold-ink/10 px-2.5 py-1.5"
          >
            <span class="text-[11px] text-gold-ink tabular">Tự động sản xuất · {{ rateText(row.def, row.recall) }}</span>
            <span class="whitespace-nowrap text-[10px] text-ink-faint tabular">{{ displayProduceTierText(produceTierText(row.def.tier)) }}</span>
            <span class="text-[10px] text-ink-faint tabular">Đã trấn thủ {{ heldText(row.def.id) }}</span>
            <span class="text-[10px] tabular" :class="row.reviveInHours <= 12 ? 'text-cinnabar' : 'text-ink-faint'">
              Yêu khí tụ lại sau {{ reviveText(row.reviveInHours) }}
            </span>
            <button
              class="ml-auto inline-flex min-h-[28px] items-center px-1 text-[10px] text-ink-faint underline underline-offset-2 active:scale-90 active:text-ink"
              @click.stop="unsuppress(row.def.id)"
            >
              Dừng thu lợi, chuyển sang lịch luyện
            </button>
          </div>

          <!--
            Đã đạt tư cách trấn áp
          -->
          <div
            v-else-if="row.canEnter && row.qualified"
            data-region-action
            class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-ink/4 px-2.5 py-1.5"
          >
            <span class="text-[10px] text-ink-faint">Đã đạt tư cách trấn áp</span>
            <span class="text-[10px] text-gold-ink tabular">{{ rateText(row.def, row.recall) }}</span>
            <button
              class="ml-auto chip-ink min-h-[28px] !text-[10px] active:scale-90"
              @click.stop="suppress(row.def.id)"
            >
              Chuyển thành thu lợi trấn áp
            </button>
          </div>
          <p class="mt-2 text-[11px] leading-relaxed text-ink-faint">
            <template v-if="row.canEnter">{{ displayRegionDesc(row.def.desc) }}</template>
            <template v-else-if="!row.blockReason">Cần đánh bại thủ lĩnh {{ prevRegionName(row.def) }} trước mới có thể đặt chân đến đây.</template>
          </p>
          <!--
            Tiến độ tư cách trấn áp
          -->
          <p
            v-if="row.canEnter && !row.suppressed && !row.qualified"
            class="mt-1 text-[10px] leading-relaxed tabular"
          >
            <span class="text-ink-soft">Tư cách trấn áp</span>
            <span class="ml-1" :class="row.progress.fightsOk ? 'text-jade' : 'text-ink-soft'">
              {{ row.progress.fights }}/{{ row.progress.needFights }} trận
            </span>
            <template v-if="row.progress.hasStats">
              <span class="ml-1.5" :class="row.progress.roundsOk ? 'text-ink-faint' : 'text-cinnabar'">
                Bình quân {{ row.progress.avgRounds.toFixed(1) }} hiệp (cần ≤{{ row.progress.maxAvgRounds }})
              </span>
              <span class="ml-1.5" :class="row.progress.damageOk ? 'text-ink-faint' : 'text-cinnabar'">
                Chịu thương tổn {{ Math.round(row.progress.avgDamagePct * 100) }}% (cần ≤{{ Math.round(row.progress.maxAvgDamagePct * 100) }}%)
              </span>
            </template>
            <span v-else class="ml-1.5 text-ink-faint">Chưa có chiến tích</span>
          </p>
          <p v-if="row.blockReason" class="mt-1 text-[11px] text-cinnabar">{{ row.blockReason }}</p>
          <div v-if="row.canEnter && (row.chips.length || row.adaptation)" class="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              v-for="chip in row.chips"
              :key="chip.trait"
              class="chip-ink !text-[10px]"
              :class="chip.level >= 3 ? 'border-cinnabar/50 text-cinnabar' : 'border-ink/25 text-ink-faint'"
            >
              {{ chip.name }}·{{ ECO_LEVEL_NAMES[chip.level] }}
            </span>
            <button
              v-if="row.adaptation"
              class="ml-auto inline-flex min-h-[28px] items-center text-[10px] text-ink-soft tabular active:scale-90"
              :title="row.adaptation.reasons.join(';')"
              :aria-expanded="adaptExpand === row.def.id"
              @click="adaptExpand = adaptExpand === row.def.id ? null : row.def.id"
            >
              Phù hợp
              <span class="text-gold-ink">{{ starsText(row.adaptation.stars) }}</span>
            </button>
          </div>
          <div v-if="adaptExpand === row.def.id && row.adaptation" class="mt-1">
            <p v-for="(r, i) in row.adaptation.reasons" :key="i" class="text-[10px] leading-relaxed text-ink-faint">· {{ r }}</p>
          </div>
        </div>
        </template>
      </div>
    </template>

    <!-- Chọn chế độ + xem trước trận đấu -->
    <BaseModal :open="modeTarget !== null" :title="displayRegionName(modeTarget?.name ?? '')" @close="modeTarget = null">
      <!-- Xem trước sự phù hợp -->
      <div v-if="preview" class="mb-3 rounded-md bg-ink/4 px-3 py-2.5">
        <template v-if="preview.mine && currentBuild">
          <p class="flex items-center justify-between text-[12px]">
            <span class="text-ink-soft">
              Xây dựng hiện tại:
              <span class="font-kai text-ink">{{ currentBuild.displayName }}</span>
            </span>
            <span class="tabular text-gold-ink">{{ starsText(preview.mine.stars) }}</span>
          </p>
          <p v-for="(r, i) in preview.mine.reasons" :key="i" class="mt-0.5 text-[10px] text-ink-faint">{{ r }}</p>
        </template>
        <p v-else class="text-[11px] text-ink-faint">Chưa định hình lưu phái, nơi này đối đãi bình đẳng với mọi lối tu.</p>
        <div class="ink-divider my-2" />
        <p class="text-[10px] text-ink-faint">Độ tương hợp giữa nơi này và lối tu của ngươi (chưa hẳn đồng nghĩa với tỷ lệ thắng):</p>
        <p class="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
          <span v-for="rec in preview.recs" :key="rec.style.id" class="text-[11px] text-ink-soft tabular">
            {{ rec.style.name }}
            <span class="text-gold-ink">{{ starsText(rec.adaptation.stars) }}</span>
          </span>
        </p>
        <p class="mt-1.5 text-[10px] text-ink-faint tabular">
          Chiến lực {{ formatGN(player.finalStats.power) }} · Phẩm cấp trang bị, từ điều và ứng biến vẫn quyết định thành bại
        </p>
      </div>
      <p v-if="petTripLine" class="mb-2 text-[10px] leading-relaxed text-violet-ink tabular">{{ petTripLine }}</p>
      <p class="mb-2 text-[10px] leading-relaxed text-ink-faint tabular">
        3 bậc trên đường: Kỳ duyên {{ tierOddsText('qiyuan', chainPending, departEventChance) }} · Cơ duyên {{ tierOddsText('jiyuan', chainPending, departEventChance) }} · Tế ngộ {{ tierOddsText('jingyu', chainPending, departEventChance) }}
      </p>
      <p class="text-[12px] text-ink-faint">Chuyến đi này định tính toán thế nào?</p>
      <p class="mt-1 text-[10px] leading-relaxed text-ink-faint">Hành trình tính xem chặng này đi bao lâu; "Lịch luyện gặp địch" chỉ khiến yêu thú xuất hiện dày đặc hơn, không thể rút ngắn quãng đường.</p>
      <div class="mt-3 space-y-2">
        <button
          v-for="m in MODE_LIST"
          :key="m.id"
          class="flex w-full items-center justify-between rounded-lg border border-ink/20 px-4 py-3 text-left active:scale-98 active:bg-ink/5"
          @click="begin(m.id)"
        >
          <span>
            <span class="font-kai text-[14px] tracking-widest text-ink">{{ displayExploreMode(EXPLORE_MODES[m.id].name) }}</span>
            <span class="ml-2 text-[11px]" :class="m.id === 'risky' || m.id === 'prolonged' ? 'text-cinnabar' : 'text-ink-faint'">{{ m.risk }}</span>
          </span>
          <span class="text-right text-[11px] text-ink-faint tabular">
            {{ departText(m.id) }}
            <span class="block text-[10px] text-gold-ink">{{ departReward(m.id) }}</span>
          </span>
        </button>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import type { ExploreMode, RegionDef, RegionRecall } from '@/types'
  import { useAdventureStore } from '@/stores/adventure'
  import { usePlayerStore } from '@/stores/player'
  import { useUiStore } from '@/stores/ui'
  import { useResourcesStore } from '@/stores/resources'
  import { REGIONS, regionDef, DANGER_NAMES } from '@/data/regions'
  import { worldOf, WORLDS, type WorldDef } from '@/data/realms'
  import SectionTitle from '@/components/common/SectionTitle.vue'
  import SecretRealmCard from '@/components/adventure/SecretRealmCard.vue'
  import { effectiveFavoredWorld, todayMansionLine, mansionLuckPercent, currentGameDay } from '@/core/astronomy'
  import { worldDef } from '@/data/realms'
  import { canEnterRegion, entryBlockReason, worldView } from '@/core/mortalWorldService'
  import { isRetreating } from '@/core/earlyGameService'
  import { REALMS } from '@/data/realms'
  import { EXPLORE_MODES, MANSION_REDIRECT_COST, MANSION_REDIRECT_MAX } from '@/data/constants'
  import {
    exploreBattleGapSec,
    exploreDurationSec,
    exploreEventChance,
    exploreRewardMult,
    explorationFoeDanger,
    regionFoeOrigin,
    regionBossCleared,
    startExploration
  } from '@/core/exploration'
  import { currentRegionEvent } from '@/core/regionEvent'
  import { expectedWinReward } from '@/core/loot'
  import { modOf } from '@/core/statsCalc'
  import { departButtonText, petTraitTripLine } from '@/ui/adventureText'
  import { produceTierText } from '@/ui/produceText'
  import { petDef } from '@/data/pets'
  import { personalityEffects } from '@/core/petPersonality'
  import { EVENT_TIERS, tierOddsText } from '@/core/eventTier'
  import { pendingChainStages } from '@/core/eventEngine'
  import { foeOriginPartsText } from '@/core/battleAnalysis'
  import { SUPPRESS_THRESHOLDS, suppressRateFor, suppressionProgress } from '@/core/suppress'
  import { REVIVE_AFTER_HOURS, hoursUntilRevive, regionRecallFor, prosperityName, isReviving, prosperityYieldMult } from '@/core/worldMemory'
  import { mulN, gn } from '@/utils/gnum'
  import type { WorldId } from '@/types'
  import { detectBuild } from '@/core/buildDetect'
  import { detectionAdaptation, ecologyChips, ECO_LEVEL_NAMES, recommendForRegion, regionEcology, starsText } from '@/core/buildAdvisor'
  import { formatGN } from '@/utils/format'
  import GameIcon from '@/components/common/GameIcon.vue'
  import BaseModal from '@/components/common/BaseModal.vue'
  import CombatPanel from '@/components/adventure/CombatPanel.vue'
  import {
    displayRegionName,
    displayExploreMode,
    displayWorldName,
    displayRealmName,
    displayMansionLine,
    displayEventTierName,
    displayTierOddsText,
    displayDangerName,
    displayProsperityName,
    displayProduceTierText,
    displayFoeOriginPartsText,
    displaySuppressResourceName,
    displayRegionDesc
  } from '@/ui/displayZhVi'

  const adventure = useAdventureStore()
  const route = useRoute()
  const router = useRouter()
  const player = usePlayerStore()
  const ui = useUiStore()
  const resources = useResourcesStore()

  const modeTarget = ref<RegionDef | null>(null)

  /**
   * 有没有缘在续 —— 三档的稀度**此刻**是多少,取决于这个。
   *
   * 引擎的掷法是先掷奇缘(闸门 0.3,且必须真有该走的下一程)、再掷机缘、
   * 剩下才是际遇;故「际遇约每 6 程」只在无缘在续时成立(有缘在续时约每 9 程,
   * 那三成去了奇缘)。档位胶囊按当前状态显示,而不是报一组永远同时成立的数。
   */
  const chainPending = computed(() => pendingChainStages(player.major).length > 0)
  // 出发前的当境三档实算率:与途中的「途中三档」同一条乘链(星象/福缘/区域事件 eventMult),
  // 但按选中地域算 —— 决策点就该看见它,不必等上路才见
  const departEventChance = computed(() => exploreEventChance(modeTarget.value?.id ?? '', player.finalStats.mods))

  /** 顶部链接的一句话:说清这一世是什么世界 */
  const worldBrief = computed(() => {
    const w = adventure.mortalWorld
    if (!w) return 'Khí tượng kiếp này chưa rõ, vào xem sẽ biết'
    const view = worldView(w, id => id)
    return view.title
  })

  /** 今日星象:值日之宿所利界域,由此知今日该往哪一片地界走 */
  const mansionLine = computed(() => todayMansionLine())
  /** 今日所利界域(有效口径):有生效定向走定向,否则随值日之宿 */
  const effectiveWorldId = computed(() => effectiveFavoredWorld())
  const favoredWorldName = computed(() => worldDef(effectiveWorldId.value).name)
  /** 值日之宿所利的百分数:一处来源(astronomy),历练页与界域志界域志共此一枚 */
  const mansionLuckPct = computed(() => mansionLuckPercent())

  /** 星象值日定向的展示与动作(Phase A-2) */
  const mansionRedirectOpen = ref(false)
  const redirectCostText = formatGN(gn(MANSION_REDIRECT_COST))
  const mansionRedirectMax = MANSION_REDIRECT_MAX
  /** 按钮上标注当前定向状态:今日已定向到某界则点名 */
  const redirectActiveText = computed(() => {
    const mr = player.mansionRedirect
    return mr && mr.worldId === effectiveWorldId.value ? ` · ${displayWorldName(worldDef(mr.worldId).name)}` : ''
  })
  function redirectTo(id: WorldId): void {
    const ok = player.redirectFavoredWorld(id)
    const name = displayWorldName(worldDef(id).name)
    ui.toast(ok ? `Hôm nay định hướng đến「${name}」` : 'Hôm nay đã hết lượt / Đã định hướng giới này / Thiếu linh thạch', ok ? 'info' : 'warn')
  }
  /** 该界此刻能否定向:不能则给出一句原因。判据与 redirectFavoredWorld 同一套(见 player.ts),
   *  但改在点击前置灰标出 —— 灵石不足/次数已尽/已定向此界不该缩成一个点了没反应的死按钮。 */
  function redirectReason(w: WorldId): string | null {
    const day = currentGameDay()
    const cur = player.mansionRedirect
    if (cur && cur.gameDay === day) {
      if (cur.worldId === w) return 'Đã định hướng giới này'
      if (cur.count >= mansionRedirectMax) return 'Hôm nay đã hết lượt'
    }
    if (!resources.hasStone(gn(MANSION_REDIRECT_COST))) return 'Thiếu linh thạch'
    return null
  }
  /** 区域适配原因点按展开(移动端无 hover) */
  const adaptExpand = ref<string | null>(null)

  /**
   * 从本世之界页带回来的地界 —— 直接打开出行方式弹窗。
   *
   * 模式选择连着适配预览与流派推荐,只此一处实现;
   * 世界页只负责把「去哪」交回来
   */
  onMounted(() => {
    const go = route.query.go
    if (typeof go !== 'string') return
    const r = regionDef(go)
    if (r) modeTarget.value = r
    router.replace({ path: '/adventure' })
  })

  const MODE_LIST: { id: ExploreMode; risk: string }[] = [
    { id: 'normal', risk: 'An ổn' },
    { id: 'deep', risk: 'Nguy hiểm nhỏ' },
    { id: 'risky', risk: 'Đại hung' },
    { id: 'prolonged', risk: 'Cực kỳ nguy hiểm' }
  ]

  const currentBuild = computed(() => detectBuild(player.finalStats.mods))

  const regionRows = computed(() =>
    REGIONS.map(r => {
      const eco = regionEcology(r)
      const suppressed = player.suppressedRegions.includes(r.id)
      const recall = regionRecallFor(r.id)
      const revived = suppressed && isReviving(player.suppressedSince[r.id], Date.now())
      return {
        def: r,
        // 旧链:这处地界是否**已被发现** —— 决定列表可见性、锁图标与简介
        unlocked: adventure.unlocked.includes(r.id),
        // 统一准入谓词:此刻**能否进去** —— 决定出发按钮。
        // 两者必须分开:visibleRows 按「已发现」截断列表,
        // 若拿准入当可见性,路线上未轮到的地界会把后面能进的一并藏掉
        canEnter: canEnterRegion(r.id),
        blockReason: entryBlockReason(r.id),
        cleared: regionBossCleared(r.id),
        suppressed,
        revived,
        /** 是否取得过镇压资格(取得即永久,此后可自由在历练/收益之间切换) */
        qualified: player.suppressQualified.includes(r.id),
        recall,
        /** 镇压资格进度(三条判据的当前值/阈值) */
        progress: suppressionProgress(player.regionStats[r.id]),
        /** 距妖气复聚还剩几小时(未镇压为 0) */
        reviveInHours: suppressed ? hoursUntilRevive(player.suppressedSince[r.id]) : 0,
        tooHard: r.minRealm > player.major,
        /** 此地之敌的加成来源(层级补偿 × 地界凶险;出行方式那一档另算) */
        foeOrigin: regionFoeOrigin(r),
        // 第一层信息:只保留最强的两个生态标签
        chips: ecologyChips(eco).slice(0, 2),
        adaptation: currentBuild.value ? detectionAdaptation(currentBuild.value, eco) : null
      }
    })
  )

  /** 出发预览:当前构筑适配 + 推荐方向 */
  const preview = computed(() => {
    if (!modeTarget.value) return null
    const eco = regionEcology(modeTarget.value)
    const mine = currentBuild.value ? detectionAdaptation(currentBuild.value, eco) : null
    const recs = recommendForRegion(modeTarget.value).slice(0, 2)
    return { mine, recs }
  })

  /** 灵兽之性折进这一行的账(遇险/行程/掉宝/护持,与结算同表) —— 有伴才有一行 */
  const petTripLine = computed(() => {
    if (!player.petId) return ''
    const def = petDef(player.petId)
    if (!def) return ''
    return petTraitTripLine(def.name, personalityEffects(player.petId))
  })

  /**
   * 只展示到「第一个既未发现、也进不去」为止再多一个,保持神秘感。
   *
   * 截断条件必须带上 canEnter:本世路线的首段可能排在地界表靠后的位置,
   * 若只按旧链截断,它会被挡在可见范围外 —— 实测新号因此整页 0 个出发按钮
   */
  const visibleRows = computed(() => {
    const rows = regionRows.value
    const firstLocked = rows.findIndex(r => !r.unlocked && !r.canEnter)
    return firstLocked < 0 ? rows : rows.slice(0, firstLocked + 1)
  })

  /**
   * 按界域分组展示:人间界/仙界/神界/混沌海的历练地界各自成段,便于在高界导航。
   *
   * 展示序 = 倒序(玩家反馈:「历练列表应该倒序排列,每次都要往下活动很久」)。
   * 进阶路线上每次新解锁的地界排在最上 —— 高界玩家常年只在列表底部那两格的苦,
   * 就是「新地界追着玩家跑」而不是要玩家去捞它。判定截断(visibleRows)仍在
   * **数据序**(由低到高)上算:谜一样的「下一个地界」谁也不提前剧透,
   * 只是摆出来的时候反着排罢了。
   */
  const groupedRows = computed(() => {
    const groups: { world: WorldDef; rows: typeof regionRows.value }[] = []
    for (const row of [...visibleRows.value].reverse()) {
      const world = worldOf(row.def.minRealm)
      const hit = groups.find(g => g.world.id === world.id)
      if (hit) hit.rows.push(row)
      else groups.push({ world, rows: [row] })
    }
    return groups
  })

  function departText(mode: ExploreMode): string {
    const region = modeTarget.value
    if (!region) return ''
    const eventId = currentRegionEvent(region.id)?.eventId ?? null
    const danger = explorationFoeDanger({
      tier: region.tier,
      mode,
      regionDanger: region.danger,
      petId: player.petId,
      eventId
    }).total
    return departButtonText({
      durationSec: exploreDurationSec(mode, player.petId),
      rewardMult: exploreRewardMult(mode, eventId),
      dangerMult: danger,
      battleGapSec: exploreBattleGapSec(modOf(player.finalStats.mods, 'explorationSpeed'))
    })
  }

  /** 一胜的期望所得(与 afterWin 同公式的均值):给「收益 ×Y」补一把尺子 */
  function departReward(mode: ExploreMode): string {
    const region = modeTarget.value
    if (!region) return ''
    const eventId = currentRegionEvent(region.id)?.eventId ?? null
    const r = expectedWinReward(region, exploreRewardMult(mode, eventId))
    return `Một trận thắng khoảng ${formatGN(r.stone)} thạch · ${formatGN(r.exp)} tu vi`
  }

  function chooseMode(region: RegionDef): void {
    /*
     * 闭关期间不许外出历练 —— 这条早该在这里说。
     *
     * 此前只由 startExploration 兜底:玩家点了「出发」,模式窗照开,三选一之后才被告知
     * 「你正在闭关静修」——话是对的,但让人先白走一步。同一句拒绝,越早说越好。
     */
    if (isRetreating()) {
      ui.toast('Ngươi đang bế quan tĩnh tu, tâm không tạp niệm, tạm thời chớ ra ngoài lịch luyện', 'warn')
      return
    }
    modeTarget.value = region
  }

  function begin(mode: ExploreMode): void {
    if (!modeTarget.value) return
    if (startExploration(modeTarget.value.id, mode)) {
      modeTarget.value = null
    }
  }

  function prevRegionName(r: RegionDef): string {
    const raw = r.requireCleared ? (regionDef(r.requireCleared)?.name ?? '') : ''
    return displayRegionName(raw)
  }

  /** 停取收益,恢复主动历练(资格保留,随时可一键切回) */
  function unsuppress(regionId: string): void {
    player.unsuppressRegion(regionId)
    const r = regionDef(regionId)
    ui.toast(`${r?.name ?? 'Nơi này'} đã dừng thu lợi trấn áp, trở lại thành nơi lịch luyện`, 'info')
  }

  /** 已取得镇压资格者:一键切回收益态 —— 镇压过就是镇压过,不必再打满二十场 */
  function suppress(regionId: string): void {
    player.suppressRegion(regionId)
    const r = regionDef(regionId)
    ui.toast(`Ngươi tiếp quản lại ${r?.name ?? 'nơi này'} — Trấn áp như cũ, tự thu lợi ích`, 'success')
  }

  /**
   * 镇压区域每小时产出(灵石 + 该地界物产)。
   *
   * 速率取自 suppress.ts 的唯一实现(从前这里手抄 150 并注释「= stoneMultiplier」,
   * 常量一改界面就开始撒谎),并乘上当前兴衰系数 —— 显示的数与真正入账的数同源。
   */
  function rateText(r: RegionDef, recall: RegionRecall): string {
    const rate = suppressRateFor(r.id)
    if (!rate) return '—'
    const mult = prosperityYieldMult(recall.prosperity)
    const stone = `${formatGN(mulN(rate.stonePerHour, mult))} linh thạch/giờ`
    if (!rate.resource) return stone
    const perHour = Math.max(1, Math.round(rate.resource.perHour * mult))
    return `${stone} · ${displaySuppressResourceName(rate.resource.name)} ${perHour}/giờ`
  }

  /** 复聚倒计时文案:一天以上说日,一天以内说时 */
  function reviveText(hours: number): string {
    if (hours >= 24) return `${Math.floor(hours / 24)} ngày`
    return `${Math.max(0, Math.floor(hours))} giờ`
  }

  /** 已守时长(自镇压起算)—— 守得越久,兴衰越盛 */
  function heldText(regionId: string): string {
    const since = player.suppressedSince[regionId]
    if (since === undefined) return '—'
    const hours = Math.max(0, Math.floor((Date.now() - since) / 3_600_000))
    return hours < 24 ? `${hours} giờ` : `${Math.floor(hours / 24)} ngày`
  }
</script>
