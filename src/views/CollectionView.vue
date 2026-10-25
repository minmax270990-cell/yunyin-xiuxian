<template>
  <div class="stagger-in space-y-4 px-4 pb-6 pt-4">
    <!-- 页签 -->
    <InkTabs v-model="tab" :tabs="TABS" />

    <!-- 成就 -->
    <template v-if="tab === 'achievement'">
      <SectionTitle title="Thành Tựu" :hint="`${quests.achieved.length}/${ACHIEVEMENTS.length}`" />
      <div class="card-ink px-4">
        <template v-for="grp in achievementGroups" :key="grp.key">
          <p class="pb-1 pt-2 text-[10px] font-kai tracking-widest text-ink-faint">{{ GROUP_LABEL_VN[grp.label] ?? grp.label }}</p>
          <div class="divide-y divide-ink/6">
            <div v-for="row in grp.items" :key="row.id" class="flex items-center gap-3 py-2.5">
              <span
                class="grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-kai"
                :class="row.done ? 'border-gold-ink text-gold-ink' : 'border-ink/15 text-ink-faint'"
              >
                {{ row.done ? 'Thành' : 'Chưa' }}
              </span>
              <div class="min-w-0">
                <p class="font-kai text-[12px]" :class="row.done ? 'text-ink' : 'text-ink-faint'">{{ row.name }}</p>
                <p class="text-[10px] text-ink-faint">{{ row.desc }}</p>
                <p v-if="row.done && row.achievedAt" class="mt-0.5 text-[10px] text-ink-faint">
                  Đạt thành lúc {{ collectedTimeText(row.achievedAt) }}
                </p>
                <p v-if="!row.done && row.progress" class="mt-0.5 text-[10px] tabular text-azure">
                  Tiến độ: {{ row.progress.current }} / {{ row.progress.target }}
                </p>
                <p v-if="row.reward" class="mt-0.5 text-[10px] tabular text-azure">{{ displayRewardPreview(row.reward) }}</p>
              </div>
            </div>
          </div>
        </template>
      </div>
      <p class="text-center text-[10px] text-ink-faint">Ngày công thành, danh mục tự hiện</p>
    </template>

    <!-- 收藏图鉴 -->
    <template v-else-if="tab === 'collection'">
      <section v-for="cat in collectionCats" :key="cat.key">
        <SectionTitle :title="translateCatName(cat.name)" :hint="translateHint(cat.hint)" />
        <!-- 未收录的条目只是一片「???」—— 得告诉玩家去哪儿找,否则这一册只能干瞪眼 -->
        <p class="mt-1 text-[10px] text-ink-faint">{{ translateSource(cat.source) }}</p>
        <div class="card-ink mt-2 flex flex-wrap gap-1.5 px-3.5 py-3">
          <template v-for="entry in cat.entries" :key="entry.id">
            <button
              v-if="entry.stage >= 1"
              class="chip-ink !py-1.5 flex items-center gap-1 active:scale-90"
              :style="{ color: entry.color }"
              @click="openDetail(cat, entry)"
            >
              <GameIcon v-if="entry.icon" :name="entry.icon" :size="11" />
              {{ displayEntryName(cat.key, entry.name) }}
              <span v-if="entry.badge" class="text-[9px] opacity-70">{{ translateBadge(entry.badge) }}</span>
            </button>
            <!--
              未收录的条目降噪:已收是彩签,未收若也用同样粗的实线边框「???」,
              收藏一多就成了整片灰点、压过真内容。改用更细的虚线框 + 更小的
              圆点占位,一眼分清「已收的」与「还没的」,又不至于喧宾夺主。
            -->
            <span
              v-else
              class="inline-flex items-center rounded-full border border-dashed border-ink/15 px-2 py-0.5 text-[10px] leading-snug text-ink-faint"
              :title="`Chưa thu thập · ${translateSource(cat.source)}`"
            >???</span>
          </template>
        </div>
      </section>
      <p class="text-center text-[10px] text-ink-faint">Nhấn vào mục đã thu thập để xem chi tiết —— Linh tài và ngộ đạo phân tầng nông sâu, càng dùng càng tỏ</p>
    </template>

    <!-- 图鉴详情 -->
    <BaseModal :open="detail !== null" :title="detail ? displayDetailTitle(detail) : ''" @close="detail = null">
      <div v-if="detail">
        <p class="flex flex-wrap items-center gap-2">
          <span class="chip-ink border-current" :style="{ color: detail.entry.color ?? 'var(--color-ink-soft)' }">
            {{ translateCatName(detail.catName) }}
          </span>
          <span v-if="detail.entry.stageName" class="chip-ink border-ink/20 text-ink-faint">{{ translateStageName(detail.entry.stageName) }}</span>
          <span v-if="detail.entry.meta" class="text-[11px] text-ink-faint">{{ translateMeta(detail.entry.meta) }}</span>
        </p>
        <p class="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-ink-soft">
          {{ displayDetailDesc(detail) || 'Vật này huyền diệu, khó tả thành lời.' }}
        </p>
        <p v-if="detail.entry.hint" class="mt-2 text-[11px] text-ink-faint">{{ translateEntryHint(detail.entry.hint) }}</p>
        <div class="ink-divider my-3" />
        <p class="flex justify-between text-[11px]">
          <span class="text-ink-faint">{{ translateFootLabel(detail.entry.foot.label) }}</span>
          <span class="tabular text-ink-soft">{{ translateFootValue(detail.entry.foot.label, detail.entry.foot.value) }}</span>
        </p>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useQuestsStore } from '@/stores/quests'
  import type { CollectionCategory } from '@/stores/quests'
  import { usePlayerStore } from '@/stores/player'
  import { ACHIEVEMENTS } from '@/data/achievements'
  import { GONGFA } from '@/data/gongfa'
  import { PETS } from '@/data/pets'
  import { beastIcon } from '@/data/beastFamilies'
  import { EVENTS } from '@/data/events'
  import { chainOfEvent } from '@/data/chains'
  import { TALENTS, TALENT_GRADE_COLORS } from '@/data/talents'
  import { qualityDef } from '@/data/qualities'
  import {
    CODEX_SOURCES,
    artifactCodex,
    branchCodex,
    collectedTimeText,
    equipCodex,
    materialCodex,
    pillCodex,
    type CodexCat,
    type CodexEntry,
    codexOwnedCount
  } from '@/ui/codex'
  import { gongfaFuncText, gongfaMetaText } from '@/ui/itemText'
  import { modsText } from '@/ui/statNames'
  import { achievementDirection, achievementGroup, ACHIEVEMENT_GROUP_LABEL, ACHIEVEMENT_GROUP_ORDER } from '@/ui/achievementHint'
  import { rewardPreview } from '@/core/progress'
  import {
    displayRewardPreview,
    displayGongfaName,
    displayGongfaDesc,
    displayGongfaFuncText,
    displayGongfaBranchName,
    displayGongfaBranchDesc,
    displayRealmName,
    displayModsText,
    displayEventTitle,
    displayEventText
  } from '@/ui/displayZhVi'
  import SectionTitle from '@/components/common/SectionTitle.vue'
  import InkTabs from '@/components/common/InkTabs.vue'
  import BaseModal from '@/components/common/BaseModal.vue'
  import GameIcon from '@/components/common/GameIcon.vue'

  const quests = useQuestsStore()
  const player = usePlayerStore()

  type Tab = 'achievement' | 'collection'
  const tab = ref<Tab>('achievement')
  const TABS: { id: Tab; label: string }[] = [
    { id: 'achievement', label: 'Thành Tựu' },
    { id: 'collection', label: 'Thu Thập' }
  ]

  const GROUP_LABEL_VN: Record<string, string> = {
    '境界': 'Cảnh Giới',
    '突破与渡劫': 'Đột Phá & Độ Kiếp',
    '历练与征战': 'Lịch Luyện & Chinh Chiến',
    '装备': 'Trang Bị',
    '丹药': 'Đan Dược',
    '功法': 'Công Pháp',
    '洞府': 'Động Phủ',
    '转世': 'Chuyển Thế',
    '历程': 'Hành Trình'
  }

  const DIRECTION_VN: Record<string, string> = {
    '历练征战': 'Chinh chiến lịch luyện',
    '地界首领': 'Thủ lĩnh địa giới',
    '历练': 'Lịch luyện',
    '历练际遇': 'Kỳ ngộ lịch luyện',
    '装备': 'Trang bị',
    '丹药': 'Đan dược',
    '炼丹': 'Luyện đan',
    '功法参悟': 'Tham ngộ công pháp',
    '突破与渡劫': 'Đột phá & Độ kiếp',
    '轮回转世': 'Luân hồi chuyển thế',
    '器魂': 'Khí hồn',
    '离府归来': 'Rời phủ trở về',
    '洞府经营': 'Kinh doanh động phủ',
    '境界精进': 'Tinh tiến cảnh giới',
    '掉落与鉴宝': 'Rơi đồ & Giám bảo',
    '历程节点': 'Cột mốc hành trình'
  }

  function translateDirection(source: string): string {
    return DIRECTION_VN[source] ?? source
  }

  const CAT_NAME_VN: Record<string, string> = {
    '装备图鉴': 'Đồ Giám Trang Bị',
    '功法阁': 'Công Pháp Các',
    '悟道录': 'Ngộ Đạo Lục',
    '丹方录': 'Đan Phương Lục',
    '灵材谱': 'Linh Tài Phổ',
    '法宝谱': 'Pháp Bảo Phổ',
    '灵兽册': 'Linh Thú Sách',
    '见闻志': 'Kiến Văn Chí',
    '天赋鉴': 'Thiên Phú Giám'
  }

  function translateCatName(name: string): string {
    return CAT_NAME_VN[name] ?? name
  }

  function translateHint(hint: string): string {
    return hint
      .replace(/已入目/g, 'Đã thấy')
      .replace(/见过天品/g, 'Từng gặp Thiên phẩm')
      .replace(/已录/g, 'Đã ghi')
      .replace(/祭炼圆满/g, 'Tế luyện viên mãn')
      .replace(/得方/g, 'Nắm phương')
      .replace(/通晓/g, 'Thông hiểu')
      .replace(/已辨/g, 'Đã nhận biết')
      .replace(/知性/g, 'Hiểu tính')
      .replace(/通用/g, 'Thông dụng')
      .replace(/已见/g, 'Đã thấy')
      .replace(/择其道/g, 'Chọn đạo')
  }

  const CODEX_SOURCE_VN: Record<string, string> = {
    '来源:历练掉落 —— 强敌与首领更易出': 'Nguồn gốc: Rơi khi lịch luyện —— Cường địch và thủ lĩnh dễ rơi hơn',
    '来源:藏经阁参悟 —— 用功法残页逐部撞见': 'Nguồn gốc: Tham ngộ Tàng Kinh Các —— Dùng tàn trang công pháp từng bộ hội ngộ',
    '来源:三处 —— 历练掉落、丹房照方炼出,际遇里也有人赠': 'Nguồn gốc: Ba nguồn —— Rơi khi lịch luyện, đan phòng theo đơn luyện ra, kỳ ngộ cũng có người tặng',
    '来源:历练掉落 —— 高阶地界才出得上品': 'Nguồn gốc: Rơi khi lịch luyện —— Địa giới cao giai mới rơi thượng phẩm',
    '来源:历练际遇 —— 结缘而非猎取': 'Nguồn gốc: Kỳ ngộ lịch luyện —— Kết duyên chứ không phải săn bắt',
    '来源:历练际遇与奇缘 —— 走到哪,遇见什么': 'Nguồn gốc: Kỳ ngộ lịch luyện & Kỳ duyên —— Đi tới đâu, gặp gỡ tới đó',
    '来源:凡骨启蒙 —— 人人带来几分': 'Nguồn gốc: Phàm cốt khai tâm —— Người người mang đến vài phần'
  }

  function translateSource(s: string): string {
    if (CODEX_SOURCE_VN[s]) return CODEX_SOURCE_VN[s]
    return s
      .replace(/^来源:/, 'Nguồn gốc: ')
      .replace(/历练掉落/g, 'Rơi khi lịch luyện')
      .replace(/历练际遇/g, 'Kỳ ngộ lịch luyện')
      .replace(/藏经阁参悟/g, 'Tham ngộ Tàng Kinh Các')
      .replace(/丹房照方炼出/g, 'Đan phòng luyện theo phương')
  }

  function translateMeta(meta: string): string {
    if (meta === '奇缘') return 'Kỳ Duyên'
    if (meta === '历练际遇') return 'Kỳ Ngộ Lịch Luyện'
    if (meta === '先天之姿') return 'Tư Chất Tiên Thiên'
    let res = meta
    res = res.replace(/主修/g, 'Chủ Tu')
    res = res.replace(/辅修/g, 'Phụ Tu')
    res = res.replace(/秘术/g, 'Bí Thuật')
    res = res.replace(/凡品/g, 'Phàm phẩm')
    res = res.replace(/良品/g, 'Lương phẩm')
    res = res.replace(/精品/g, 'Tinh phẩm')
    res = res.replace(/灵品/g, 'Linh phẩm')
    res = res.replace(/玄品/g, 'Huyền phẩm')
    res = res.replace(/地品/g, 'Địa phẩm')
    res = res.replace(/天品/g, 'Thiên phẩm')
    res = res.replace(/仙品/g, 'Tiên phẩm')
    res = res.replace(/神品/g, 'Thần phẩm')
    res = res.replace(/道品/g, 'Đạo phẩm')
    res = res.replace(/金属/g, 'Hệ Kim')
    res = res.replace(/木属/g, 'Hệ Mộc')
    res = res.replace(/水属/g, 'Hệ Thủy')
    res = res.replace(/火属/g, 'Hệ Hỏa')
    res = res.replace(/土属/g, 'Hệ Thổ')
    res = res.replace(/雷属/g, 'Hệ Lôi')
    res = res.replace(/风属/g, 'Hệ Phong')
    res = res.replace(/冰属/g, 'Hệ Băng')
    res = res.replace(/光属/g, 'Hệ Quang')
    res = res.replace(/暗属/g, 'Hệ Ám')
    res = res.replace(/混沌属/g, 'Hệ Hỗn Độn')
    res = res.replace(/(.*)期可参/, (_m, r) => `${displayRealmName(r)} kỳ có thể tham`)
    return res
  }

  function translateStageName(s: string): string {
    return s
      .replace(/未识/g, 'Chưa rõ')
      .replace(/已辨识/g, 'Đã nhận biết')
      .replace(/已知性/g, 'Đã hiểu tính')
      .replace(/已通用/g, 'Đã thông dụng')
      .replace(/未见/g, 'Chưa thấy')
      .replace(/已见/g, 'Đã thấy')
      .replace(/已择/g, 'Đã chọn')
      .replace(/祭炼圆满/g, 'Tế luyện viên mãn')
      .replace(/通晓/g, 'Thông hiểu')
  }

  function translateFootLabel(label: string): string {
    if (label === '收录时间') return 'Thời gian thu thập'
    if (label === '照面回数') return 'Số lần chạm mặt'
    if (label === '所属功法') return 'Công pháp trực thuộc'
    return label
  }

  function translateFootValue(label: string, value: string): string {
    if (label === '所属功法') return displayGongfaName(value)
    if (value === '早年收录,未记时日') return 'Thu thập thuở trước, chưa ghi ngày giờ'
    return value
  }

  function translateBadge(b: string): string {
    if (b === '择') return 'Đã chọn'
    if (b === '可择') return 'Có thể chọn'
    return b
  }

  function displayEntryName(catKey: string, name: string): string {
    if (catKey === 'branch') return displayGongfaBranchName(name)
    if (catKey === 'gongfa') return displayGongfaName(name)
    return name
  }

  function displayDetailTitle(d: { catKey?: string; entry: CodexEntry }): string {
    if (d.catKey === 'branch') return displayGongfaBranchName(d.entry.name)
    if (d.catKey === 'gongfa') return displayGongfaName(d.entry.name)
    return d.entry.name
  }

  function displayDetailDesc(d: { catKey?: string; entry: CodexEntry }): string {
    if (!d.entry.desc) return ''
    if (d.catKey === 'branch') {
      const parts = d.entry.desc.split('\n')
      const firstLine = displayGongfaBranchDesc(parts[0] ?? '')
      const rest = parts.slice(1).join('\n')
      return rest ? `${firstLine}\n${rest}` : firstLine
    }
    return d.entry.desc
  }

  function translateEntryHint(hint: string): string {
    return hint
      .replace(/还需照面/g, 'Còn cần chạm mặt')
      .replace(/次/g, ' lần')
      .replace(/开炉炼入任一方中/g, 'Khai lò luyện vào phương bất kỳ')
      .replace(/即可洞悉通用门道/g, 'liền có thể thấu triệt diệu dụng')
  }

  /**
   * 成就一律先以「???」示人,达成之后才现名目。
   *
   * 既然未达成的全都遮住,原先的 hidden 标记(未达成时整行不列出)就没了着落 ——
   * 它与寻常未达成者长得一模一样,却害得计数的分母对不上列出的行数。
   * 故此处不再筛除,位子一个不少(计数一律读 ACHIEVEMENTS.length,不手工写死)。
   */
  const achievementRows = computed(() =>
    ACHIEVEMENTS.map(a => {
      const done = quests.hasAchieved(a.id)
      return {
        id: a.id,
        done,
        group: achievementGroup(a.cond),
        achievedAt: quests.achievedAt[a.id],
        name: done ? a.name : '???',
        // 名字成时自现,但方向要给:六十多个「???」不给方向,这一页就是白纸
        desc: done ? a.desc : `Chưa đạt · Phương hướng: ${translateDirection(achievementDirection(a.cond))}`,
        // 计数类成就在方向之外补进度数字:「已 46/50」比一句「历练征战」更让人知道还差几步
        // current 封顶在 target:周期补扫前计数暂超阈值时,别显示「已 60/50」这种越界数,
        // 也免得它在未达成段里压过所有其它条目
        progress:
          a.cond.type === 'counter'
            ? { current: Math.min(quests.counter(a.cond.key), a.cond.value), target: a.cond.value }
            : null,
        // 未达成不报赏,免得把称号提前说破;已达成的数额与 grantReward 同一套折算
        reward: done && a.reward ? rewardPreview(a.reward) : ''
      }
    }).sort((a, b) => {
      if (a.done !== b.done) return Number(b.done) - Number(a.done)
      // 未达成段内:计数类按离阈值最近优先(「下一步就能成的那条」浮到未达成区头部);非计数沉底保持原序
      const pa = a.progress ? a.progress.current / a.progress.target : -1
      const pb = b.progress ? b.progress.current / b.progress.target : -1
      return pb - pa
    })
  )

  /** 按主题归段:62 条平铺难回看,分成几段各带小标题;段内保留 achievementRows 的顺序 */
  const achievementGroups = computed(() =>
    ACHIEVEMENT_GROUP_ORDER.map(g => ({
      key: g,
      label: ACHIEVEMENT_GROUP_LABEL[g],
      items: achievementRows.value.filter(r => r.group === g)
    })).filter(grp => grp.items.length > 0)
  )

  /**
   * 原有七类只有"收没收录"两态,在此补齐 CodexEntry 的深度字段:
   * stage 1 即已收录,不设更深的层。深浅之别是灵材谱与悟道录才有的事。
   */
  function makeCat(
    key: CollectionCategory,
    name: string,
    ownedIds: string[],
    defs: { id: string; name: string; desc?: string; meta?: string; color?: string }[]
  ): CodexCat {
    const owned = new Set(ownedIds)
    // 标题计数要与彩签一致:ownedIds 可能含重复/已被移出图鉴的旧 id,
    // 照 `ownedIds.length` 会多报 —— 数「实际落进 defs 的那几枚」才和渲染对得上
    // (与角色页「图鉴 N/M」同一口径,见 ui/codex.codexOwnedCount)
    const ownedCount = codexOwnedCount(ownedIds, defs)
    const entries: CodexEntry[] = defs
      .map(d => ({
        id: d.id,
        name: d.name,
        desc: d.desc ?? '',
        meta: d.meta ?? '',
        color: d.color,
        stage: owned.has(d.id) ? 1 : 0,
        stageName: '',
        badge: '',
        hint: '',
        foot: { label: '收录时间', value: collectedTimeText(quests.collectedAt[`${key}:${d.id}`]) }
      }))
      .sort((a, b) => b.stage - a.stage)
    return { key, name, hint: `${ownedCount}/${defs.length}`, source: CODEX_SOURCES[key], entries }
  }

  /**
   * 九类图鉴的排布。
   *
   * 悟道录紧随功法阁、灵材谱紧随丹方录 —— 各自与所属的那条线挨在一处,
   * 翻到功法就看得见它的岔路,翻到丹药就看得见炼它的料。
   */
  const collectionCats = computed<CodexCat[]>(() => {
    const c = quests.collections
    return [
      // 装备/法宝/丹药三类走带深浅的派生视图(见 ui/codex:收录深度一节),
      // 其余四类仍是「收没收录」两态,故共用 makeCat
      equipCodex(),
      makeCat(
        'gongfa',
        '功法阁',
        c.gongfa,
        GONGFA.map(g => ({
          id: g.id,
          name: displayGongfaName(g.name),
          desc: [displayGongfaDesc(g.desc), displayGongfaFuncText(gongfaFuncText(g))].filter(Boolean).join('\n'),
          meta: gongfaMetaText(g),
          color: qualityDef(g.quality).color
        }))
      ),
      branchCodex(),
      pillCodex(),
      materialCodex(),
      artifactCodex(),
      makeCat(
        'pet',
        '灵兽册',
        c.pet,
        PETS.map(p => ({
          id: p.id,
          name: p.name,
          desc: [p.desc, displayModsText(modsText(player.petModsFor(p)))].filter(Boolean).join('\n'),
          meta: qualityDef(p.quality).name,
          icon: beastIcon(p.family),
          color: qualityDef(p.quality).color
        }))
      ),
      makeCat(
        'event',
        '见闻志',
        c.event,
        // 奇缘的阶段事件与普通际遇同表,但在见闻志里得各归各的名 ——
        // 一律写成「历练际遇」,玩家会以为那条缘也能在随便哪个地界撞见
        EVENTS.map(e => ({
          id: e.id,
          name: displayEventTitle(e.title),
          desc: displayEventText(e.text),
          meta: chainOfEvent(e.id) ? '奇缘' : '历练际遇'
        }))
      ),
      makeCat(
        'talent',
        '天赋鉴',
        c.talent,
        TALENTS.map(t => ({
          id: t.id,
          name: t.name,
          desc: [t.desc, displayModsText(modsText(t.mods))].filter(Boolean).join('\n'),
          meta: '先天之姿',
          color: TALENT_GRADE_COLORS[t.grade]
        }))
      )
    ]
  })

  // ---- 详情弹窗 ----
  // 脚注各类口径不同(旧七类记收录时日、灵材记照面回数、悟道记所属功法),
  // 故由条目自带 foot,此处不再拼装
  const detail = ref<{ catName: string; catKey?: string; entry: CodexEntry } | null>(null)

  function openDetail(cat: CodexCat, entry: CodexEntry): void {
    detail.value = { catName: cat.name, catKey: cat.key, entry }
  }
</script>
