<template>
  <div class="stagger-in space-y-4 px-4 pb-6 pt-4">
    <template v-if="view">
      <!-- 地界卷首:题签 + 朱印 —— 这一世的名字是世界的门面,卷轴开卷先是一枚印 -->
      <div class="card-ink paper-grain relative overflow-hidden px-4 pb-3.5 pt-3">
        <p class="font-kai text-[10px] tracking-[0.35em] text-ink-faint">B Ả N   T H Ế   C H I   G I Ớ I</p>
        <div class="mt-1 flex items-end gap-3">
          <div class="min-w-0 grow">
            <h1 class="font-kai text-[19px] tracking-[0.12em] text-ink">{{ displayWorldBrief(view.title) }}</h1>
            <p class="mt-1 text-[11px] leading-relaxed text-ink-faint">{{ displayWorldSummary(view.summary) }}</p>
          </div>
          <!-- 卷首题印:朱泥打底,留「世」字为记 —— 此世由你亲历,故以印为凭(印面样式见 style.css .world-seal) -->
          <span
            class="world-seal mb-1 grid h-11 w-11 shrink-0 -rotate-2 place-items-center rounded-sm font-kai text-[19px]"
          >Thế</span>
        </div>
        <p class="mt-1.5 text-[11px] leading-relaxed text-cinnabar">Quy tắc kiếp này: {{ displayMutatorText(view.ruleText) }}</p>
      </div>

      <!-- 路线全貌:高低即层级,横距即路程,点大即事多 —— 纸面先晕一层天清气韵,再落墨线 -->
      <div class="card-ink paper-grain px-3 py-2">
        <svg :viewBox="`0 0 ${VIEW_W} ${VIEW_H}`" class="h-16 w-full" role="img" aria-label="Lộ trình kiếp này">
          <defs>
            <linearGradient id="world-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="var(--color-azure)" stop-opacity="0.12" />
              <stop offset="0.62" stop-color="var(--color-azure)" stop-opacity="0" />
              <stop offset="1" stop-color="var(--color-ink)" stop-opacity="0.08" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" :width="VIEW_W" :height="VIEW_H" rx="7" fill="url(#world-sky)" />
          <!-- 路段三态:终点已通的路画玉实线,眼下可往的画青实线,仍未至的画淡虚线 ——
               走过的路在纸上被一段段点染成色 -->
          <polyline
            v-for="(seg, i) in segments"
            :key="i"
            :points="seg.points"
            fill="none"
            stroke="currentColor"
            stroke-width="1.2"
            :class="seg.cls"
            :style="seg.dash ? { strokeDasharray: seg.dash } : undefined"
          />
          <circle
            v-for="p in view.places"
            :key="p.nodeId"
            :cx="p.x"
            :cy="p.y"
            :r="p.r"
            :class="cleared(p.nodeId) ? 'text-jade' : unlocked(p) ? 'text-azure' : 'text-ink-faint'"
            fill="currentColor"
            :fill-opacity="cleared(p.nodeId) ? 1 : unlocked(p) ? 0.85 : 0.35"
          />
          <!-- 眼下将赴的那一处:外圈一道潺潺墨环,替玩家在图上指路(路尽则隐) -->
          <circle
            v-if="focusNode"
            :cx="focusNode.x"
            :cy="focusNode.y"
            :r="focusNode.r + 2.5"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            class="node-focus text-cinnabar"
          />
        </svg>
        <p class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-ink-faint">
          <span class="inline-flex items-center gap-1">
            <span class="h-1.5 w-1.5 rounded-full bg-ink-faint/40" /> Chưa tới
          </span>
          <span class="inline-flex items-center gap-1">
            <span class="h-1.5 w-1.5 rounded-full bg-azure/80" /> Có thể đi
          </span>
          <span class="inline-flex items-center gap-1">
            <span class="h-1.5 w-1.5 rounded-full bg-jade" /> Đã thông
          </span>
          <span class="ml-auto">Nơi cao cảnh sâu · Nơi xa đường dài · Điểm lớn sự nhiều</span>
        </p>
      </div>

      <SectionTitle title="Địa Giới Kiếp Này" :hint="travelHint" />
      <div class="space-y-2">
        <div
          v-for="p in view.places"
          :key="p.nodeId"
          class="card-ink flex items-center gap-3 px-3 py-2.5"
          :class="{
            'opacity-60': !unlocked(p),
            // .card-ink 的边框是手写(非 layer)声明,工具类在 @layer 里永远压不过它 ——
            // 加 ! 破层,这正是 CharacterView/AdventureView 盖卡片边框的同一套做法
            '!border-cinnabar/35': focusNode?.nodeId === p.nodeId
          }"
        >
          <span
            class="grid h-9 w-9 shrink-0 place-items-center rounded-md"
            :class="unlocked(p) ? 'bg-azure/10 text-azure' : 'bg-ink/6 text-ink-faint'"
          >
            <GameIcon :name="unlocked(p) ? (regionDef(p.regionId)?.icon ?? 'mountain') : 'lock'" :size="16" />
          </span>
          <div class="min-w-0 grow">
            <p class="flex items-baseline gap-1.5">
              <span class="truncate font-kai text-[14px] text-ink">{{ p.name }}</span>
              <span class="shrink-0 text-[11px] text-azure">{{ displayTerrain(p.terrain) }}</span>
              <span v-if="cleared(p.nodeId)" class="shrink-0 rounded-sm border border-jade/50 px-1 py-px font-kai text-[9px] leading-none text-jade">Đã thông</span>
              <span v-else-if="focusNode?.nodeId === p.nodeId" class="shrink-0 text-[10px] text-cinnabar">Nơi đây</span>
            </p>
            <p class="mt-0.5 flex items-center gap-2 text-[10px] text-ink-faint">
              <span class="truncate">Trấn thủ {{ p.bossName }}</span>
              <span class="flex shrink-0 gap-0.5">
                <span v-for="n in p.eventLevel" :key="n" class="h-1 w-1 rounded-full bg-gold-ink/60" />
              </span>
            </p>
            <!-- 锁住的地界要给一句"为什么现在去不了",而不是只画把锁 -->
            <p v-if="!unlocked(p)" class="mt-0.5 text-[10px] leading-relaxed text-cinnabar">
              {{ blockReason(p.regionId) ?? 'Cảnh này chưa mở, cần đi hết lộ trình kiếp này trước' }}
            </p>
          </div>
          <!-- 已通的段落照样能再去 —— 「已通」是记号,不是封路 -->
          <button v-if="unlocked(p)" class="btn-seal shrink-0 !px-3 !py-1.5 !text-[12px]" @click="depart(p.regionId)">Xuất Phát</button>
        </div>
      </div>

      <!--
        换界规则必须写明:目前唯一的换界时机是兵解转世,玩家没有主动手段。
        规则存在却不告诉玩家,和没有规则一样糟
      -->
      <div class="card-ink paper-grain px-4 py-3">
        <p class="font-kai text-[13px] tracking-widest text-ink-soft">Giới Này Từ Đâu Đến</p>
        <p class="mt-1.5 text-[11px] leading-relaxed text-ink-faint">
          Khi ngươi mở mắt, trời đất đã định hình như thế. Địa giới đã trải, chặng đường xa gần, vật trấn thủ đều theo kiếp này mà định,
          <!-- 标点跟着前一句走:单独成行会在窄屏上被折成孤零零一个句号 -->
          <span class="text-ink-soft"> trong kiếp này sẽ không thay đổi nữa.</span>
        </p>
        <p class="mt-1 text-[11px] leading-relaxed text-ink-faint">
          Chỉ khi
          <span class="text-violet-ink">Binh Giải Chuyển Thế</span>
          , mới mở ra một mảnh trời đất khác — Địa giới khác, con đường khác, quy tắc khác với kiếp này.
        </p>
        <p class="mt-1 text-[11px] leading-relaxed text-ink-faint">
          Ngoài ra các giới khác vẫn còn, có thể trở về mục
          <span class="text-azure">Lịch Luyện</span>
          chọn nơi khác, không nhất thiết chỉ đi con đường này.
        </p>
      </div>
    </template>
    <p v-else class="text-[12px] text-ink-faint">Khí tượng kiếp này vẫn chưa ngưng tụ.</p>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import SectionTitle from '@/components/common/SectionTitle.vue'
  import GameIcon from '@/components/common/GameIcon.vue'
  import { useAdventureStore } from '@/stores/adventure'
  import { enemyDef } from '@/data/enemies'
  import { regionDef } from '@/data/regions'
  import { VIEW_H, VIEW_W, canEnterRegion, ensureMortalWorld, entryBlockReason, isNodeCleared, worldView } from '@/core/mortalWorldService'
  import { displayWorldBrief, displayWorldSummary, displayMutatorText, displayTerrain } from '@/ui/displayZhVi'

  const adventure = useAdventureStore()
  const router = useRouter()

  /** 本世之界;首次进入本页时凝成 */
  const view = computed(() => {
    const w = adventure.mortalWorld ?? ensureMortalWorld()
    if (!w) return null
    return worldView(w, id => enemyDef(id)?.name ?? id)
  })

  /** 眼下这处 —— 路线里第一个「可往却尚未通关」的节点,地图上的「下一步」 */
  const focusNode = computed(() => view.value?.places.find(p => unlocked(p) && !cleared(p.nodeId)) ?? null)

  /** 标题旁那一句:「已通 X/Y 段」—— 与下方路段卡读同一份 view.places + cleared,不另报口径 */
  const travelHint = computed(() => {
    const ps = view.value?.places ?? []
    if (ps.length === 0) return 'Đường kiếp này, theo từng chặng mà đi'
    const done = ps.filter(p => cleared(p.nodeId)).length
    return `Đã thông ${done}/${ps.length} chặng · Từng chặng mà đi`
  })

  /** 路段三态:终点已通是「走过的路」、可往未通是「正要走的路」,皆画实墨;
      仍未至的路虚画淡线 —— 走过的路在纸上被一段段点染成色 */
  const segments = computed(() => {
    const ps = view.value?.places ?? []
    const segs: { points: string; cls: string; dash: string }[] = []
    for (let i = 0; i + 1 < ps.length; i++) {
      const a = ps[i]!
      const b = ps[i + 1]!
      const bCleared = cleared(b.nodeId)
      const bUnlocked = unlocked(b)
      segs.push({
        points: `${a.x},${a.y} ${b.x},${b.y}`,
        cls: bCleared ? 'stroke-jade/60' : bUnlocked ? 'stroke-azure/55' : 'stroke-ink/15',
        dash: bCleared || bUnlocked ? '' : '4 3'
      })
    }
    return segs
  })

  /**
   * 地图上「可往」= 地界准入唯一出口(canEnterRegion):本世路线只**追加**可达性,
   * 不收回旧解锁链已给的权限。此前照 canEnterNode(纯路线段序)判 —— 旧链已解锁的
   * 地域在历练页能出发、本页却标成锁死还写一句「须先走完来时路」,两页互相打脸
   */
  function unlocked(node: { nodeId: string; regionId: string }): boolean {
    return canEnterRegion(node.regionId)
  }

  function cleared(nodeId: string): boolean {
    return isNodeCleared(nodeId)
  }

  function blockReason(regionId: string): string | null {
    return entryBlockReason(regionId)
  }

  /**
   * 出发 —— 带着地界回历练页选出行方式。
   *
   * 模式弹窗连着适配预览与流派推荐,只应有一处实现;
   * 在这里重做一遍等于把同一段逻辑养成两份
   */
  function depart(regionId: string): void {
    router.push({ path: '/adventure', query: { go: regionId } })
  }
</script>
