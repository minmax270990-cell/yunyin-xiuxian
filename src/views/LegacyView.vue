<template>
  <div class="stagger-in space-y-4 px-4 pb-6 pt-4">
    <!-- 卷首扉页:修仙录不是清单,是「这一部只写你自己」的一册 —— 开卷先落一枚「我」印 -->
    <div class="card-ink paper-grain relative overflow-hidden px-4 pb-4 pt-5 text-center">
      <span class="seal-solid" aria-hidden="true">Bản</span>
      <h1 class="mt-2.5 font-kai text-[20px] tracking-[0.3em] text-ink">TU TIÊN LỤC</h1>
      <p class="mt-1 text-[10px] tracking-[0.25em] text-ink-faint">Bộ sách này, chỉ viết riêng ngươi</p>
    </div>

    <!-- 修行画像 -->
    <div v-if="profile" class="card-ink px-4 py-3">
      <p class="mb-1.5 font-kai text-[12px] tracking-[0.3em] text-ink-faint">Tu Hành Họa Tượng</p>
      <p class="font-kai text-[13px] leading-relaxed text-ink">「{{ profile.verdict }}」</p>
      <div class="mt-2 space-y-1">
        <p v-for="d in profile.daoShares" :key="d.name" class="flex items-center gap-2 text-[11px]">
          <span class="w-14 shrink-0 text-ink-faint">{{ translateDaoName(d.name) }}</span>
          <span class="track-ink h-1.25 grow">
            <span class="bar-fill block h-full" :style="{ width: `${d.pct}%`, background: 'var(--color-cinnabar)' }" />
          </span>
          <span class="w-8 shrink-0 text-right tabular text-ink-soft">{{ d.pct }}%</span>
        </p>
      </div>
      <div class="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <p class="flex justify-between">
          <span class="text-ink-faint">Thiên hướng mạo hiểm</span>
          <span class="text-ink-soft">{{ translateRisk(profile.riskText) }}</span>
        </p>
        <p class="flex justify-between">
          <span class="text-ink-faint">Thiên hướng kiến tạo</span>
          <span class="text-ink-soft">{{ translateBuildTendency(profile.buildTendency) }}</span>
        </p>
        <p class="flex justify-between">
          <span class="text-ink-faint">Lưu phái sở trường</span>
          <span class="text-ink-soft">{{ profile.favoriteBuild }}</span>
        </p>
        <p v-if="profile.favoritePacts.length" class="flex justify-between">
          <span class="text-ink-faint">Khế ước thường lập</span>
          <span class="text-ink-soft">{{ profile.favoritePacts.join(' / ') }}</span>
        </p>
        <p v-if="profile.bestWorld" class="flex justify-between">
          <span class="text-ink-faint">Sở trường nhất</span>
          <span class="text-jade">{{ profile.bestWorld }}</span>
        </p>
        <p v-if="profile.weakWorld" class="flex justify-between">
          <span class="text-ink-faint">Yếu nhất</span>
          <span class="text-cinnabar">{{ profile.weakWorld }}</span>
        </p>
      </div>
      <p class="mt-1.5 text-[9px] text-ink-faint">Họa tượng hoàn toàn đến từ thống kê đạo vết thực tế, không thể sửa đổi nhân tạo.</p>
    </div>
    <p v-else class="card-ink px-4 py-6 text-center">
      <span class="empty-seal" aria-hidden="true">Tượng</span>
      <span class="mt-2.5 block font-kai text-[12px] tracking-[0.2em] text-ink-soft">Đạo vết chưa đủ {{ displayCnNum(cnNumber(PROFILE_MIN_MARKS)) }} vết</span>
      <span class="mt-1 block text-[10px] leading-relaxed text-ink-faint">Họa tượng chưa thành hình —— Đi xa hơn chút, mới thấy rõ chính mình</span>
    </p>

    <!-- 轮回录(Phase 32.5):第 N 世与第 1 世的实质区别 -->
    <SectionTitle title="Luân Hồi Lục" :hint="`Túc tuệ ${insight}`" />
    <div class="card-ink px-4 py-3">
      <p class="flex items-center gap-2">
        <span class="font-kai text-[14px] tracking-widest text-ink">{{ stage.name }}</span>
        <span class="text-[10px] text-ink-faint tabular">Kiếp thứ {{ player.reincarnation.count + 1 }}</span>
        <span v-if="toNextStage !== null" class="ml-auto shrink-0 text-[10px] text-ink-faint tabular">
          Tích lũy thêm {{ toNextStage }} túc tuệ để vào cảnh giới kế tiếp
        </span>
        <span v-else class="ml-auto shrink-0 text-[10px] text-gold-ink">Đạo này đã đến đỉnh phong</span>
      </p>
      <p class="mt-1 text-[11px] leading-relaxed text-ink-faint">{{ stage.desc }}</p>

      <!-- 随神魂不灭的那一份 -->
      <div class="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-ink/10 pt-2 text-[11px]">
        <p class="flex justify-between">
          <span class="text-ink-faint">Nhận biết linh tài</span>
          <span class="tabular text-ink-soft">{{ lore.knownMaterialCount }} loại</span>
        </p>
        <p class="flex justify-between">
          <span class="text-ink-faint">Thông hiểu đan phương</span>
          <span class="tabular text-ink-soft">{{ lore.masteredRecipeCount }} phương</span>
        </p>
        <p class="flex justify-between">
          <span class="text-ink-faint">Thấu triệt địch thủ</span>
          <span class="tabular text-ink-soft">{{ lore.masteredEnemyCount }} loài</span>
        </p>
        <p class="flex justify-between">
          <span class="text-ink-faint">Mở mắt nhận biết</span>
          <span class="tabular text-ink-soft">Dưới cấp {{ stage.knownMaterialRank }}</span>
        </p>
      </div>

      <!-- 这一世的命题 -->
      <div v-if="vowTheme" class="mt-2 rounded-lg border border-ink/15 px-3 py-2">
        <p class="flex items-center justify-between">
          <span class="font-kai text-[13px] text-ink">「{{ vowTheme.vow }}」</span>
          <span class="text-[11px]" :class="vowBroken ? 'text-amber-ink' : vowDone ? 'text-cinnabar' : 'text-ink-faint'">
            {{ vowBroken ? 'Đã Phá' : vowDone ? 'Đã Thành' : 'Đang Làm' }}
          </span>
        </p>
        <p class="mt-1 text-[11px] text-ink-faint">
          {{ vowTheme.goal }}
          <span v-if="vowProg" class="tabular">({{ Math.floor(vowProg.cur) }} / {{ vowProg.need }})</span>
        </p>
      </div>
      <p v-else class="mt-2 text-[11px] text-ink-faint">Kiếp này chưa từng lập mệnh đề cho bản thân. Lúc binh giải chuyển thế, có thể chọn một đề mục mà hành.</p>
    </div>

    <!-- 历世履历 -->
    <div class="card-ink divide-y divide-ink/6 px-4">
      <template v-if="lifeRows.length">
        <p v-for="l in lifeRows" :key="l.index" class="flex items-center gap-2 py-2 text-[12px]">
          <span class="w-11 shrink-0 font-kai text-ink-faint tabular">Kiếp {{ l.index }}</span>
          <span class="text-ink-soft">{{ displayRealmName(l.realmLabel) }}</span>
          <span class="text-[10px] text-ink-faint tabular">Thọ {{ l.age }} năm</span>
          <span v-if="l.themeName" class="text-[10px]" :class="l.resultColor">{{ l.themeName }} · {{ l.resultText }}</span>
          <span v-if="l.trialName" class="text-[10px] text-cinnabar">· Lập khế {{ l.trialName }}</span>
          <span class="ml-auto shrink-0 tabular text-[10px] text-gold-ink">Túc tuệ +{{ l.insight }}</span>
        </p>
      </template>
      <p v-else class="py-5 text-center">
        <span class="empty-seal" aria-hidden="true">Sơ</span>
        <span class="mt-2.5 block font-kai text-[12px] tracking-[0.2em] text-ink-soft">Đây là kiếp đầu tiên</span>
        <span class="mt-1 block text-[10px] leading-relaxed text-ink-faint">Ngươi chưa từng chết lần nào, nên cũng chưa có gì để hồi tưởng</span>
      </p>
    </div>

    <!-- 修行节点 -->
    <SectionTitle title="Tiết Điểm Tu Hành" :hint="`${endgame.milestones.length}/${MILESTONE_DEFS.length}`" />
    <div class="card-ink px-4 py-2">
      <div v-if="milestoneRows.length" class="relative ml-2 border-l border-ink/15 pl-4">
        <div v-for="row in milestoneRows" :key="row.id" class="relative py-1.5">
          <span class="absolute -left-5.25 top-2.5 h-2 w-2 rounded-full bg-gold-ink" />
          <p class="font-kai text-[13px] text-ink">Kiếp thứ {{ row.life }} · {{ row.name }}</p>
          <p class="text-[10px] text-ink-faint">{{ row.desc }}</p>
        </div>
      </div>
      <p v-else class="py-5 text-center">
        <span class="empty-seal" aria-hidden="true">Trắng</span>
        <span class="mt-2.5 block font-kai text-[12px] tracking-[0.2em] text-ink-soft">Sách này còn để trắng</span>
        <span class="mt-1 block text-[10px] leading-relaxed text-ink-faint">Hành trình Thiên Giới, tự sẽ lưu danh</span>
      </p>
    </div>

    <!-- 征战录(Phase 30.9 S2):宿敌与雪耻 -->
    <SectionTitle title="Chinh Chiến Lục" :hint="`Kẻ thù truyền kiếp ${nemesisRows.length} vị`" />
    <div class="card-ink divide-y divide-ink/6 px-4">
      <template v-if="nemesisRows.length">
        <p v-for="n in nemesisRows" :key="n.enemyId" class="flex items-center gap-2 py-2 text-[12px]">
          <span class="font-kai text-[13px]" :class="n.avengedAt ? 'text-ink' : 'text-cinnabar'">{{ n.enemyName }}</span>
          <span class="text-[10px] text-ink-faint">{{ n.regionName }} · Thắng ta {{ n.lossCount }} lần</span>
          <span class="ml-auto shrink-0 text-[10px]" :class="n.avengedAt ? 'text-jade' : 'text-cinnabar'">
            {{ n.avengedAt ? 'Đã rửa hận' : 'Còn là túc địch' }}
          </span>
        </p>
      </template>
      <p v-else class="py-5 text-center">
        <span class="empty-seal" aria-hidden="true">Địch</span>
        <span class="mt-2.5 block font-kai text-[12px] tracking-[0.2em] text-ink-soft">Chưa có túc địch</span>
        <span class="mt-1 block text-[10px] leading-relaxed text-ink-faint">Mục này chờ máu và đạo của ngươi lấp đầy</span>
      </p>
    </div>

    <!-- 行迹录(Phase 30.9 S3):事件余波 -->
    <!-- 奇缘录(Phase 34.2):未了之缘,一世一世接下去 -->
    <SectionTitle title="Kỳ Duyên Lục" :hint="`Duyên chưa dứt ${unfinishedChains} mối`" />
    <div class="card-ink divide-y divide-ink/6 px-4">
      <template v-if="chainRows.length">
        <p v-for="c in chainRows" :key="c.id" class="flex items-center gap-2 py-2 text-[12px]">
          <span class="shrink-0 font-kai text-[13px]" :class="c.finished ? 'text-ink' : 'text-cinnabar'">{{ c.name }}</span>
          <span class="min-w-0 truncate text-[10px] text-ink-faint">{{ c.hint }}</span>
          <span class="ml-auto shrink-0 tabular text-[10px]" :class="c.finished ? 'text-jade' : 'text-ink-faint'">
            {{ c.finished ? 'Đã dứt' : `Chặng ${c.stage + 1}/${c.total}` }}
          </span>
        </p>
      </template>
      <p v-else class="py-5 text-center">
        <span class="empty-seal" aria-hidden="true">Duyên</span>
        <span class="mt-2.5 block font-kai text-[12px] tracking-[0.2em] text-ink-soft">Chưa có duyên chưa dứt</span>
        <span class="mt-1 block text-[10px] leading-relaxed text-ink-faint">Duyên khởi trên đường, không nằm trong danh bạ</span>
      </p>
    </div>

    <SectionTitle title="Hành Tích Lục" :hint="`Kỳ ngộ vọng lại ${lossRows.length} sự`" />
    <div class="card-ink divide-y divide-ink/6 px-4">
      <template v-if="lossRows.length">
        <p v-for="l in lossRows" :key="l.eventId + l.at" class="flex items-center gap-2 py-2 text-[12px]">
          <span class="text-[10px] text-ink-faint">{{ formatDate(l.at) }}</span>
          <span class="text-ink-soft">{{ l.eventName }}</span>
          <span class="ml-auto shrink-0 text-[10px] text-ink-faint">{{ l.note }}</span>
        </p>
      </template>
      <p v-else class="py-5 text-center">
        <span class="empty-seal" aria-hidden="true">Tích</span>
        <span class="mt-2.5 block font-kai text-[12px] tracking-[0.2em] text-ink-soft">Hành tích chưa ghi</span>
        <span class="mt-1 block text-[10px] leading-relaxed text-ink-faint">Đi qua, tự sẽ có người nhớ đường ngươi tới</span>
      </p>
    </div>

    <!-- 我的纪录 -->
    <SectionTitle title="Kỷ Lục Của Ta" hint="Chỉ so với chính mình trong quá khứ" />
    <div class="card-ink divide-y divide-ink/6 px-4">
      <template v-if="recordRows.length">
        <p v-for="r in recordRows" :key="r.id" class="flex items-center gap-2 py-2 text-[12px]">
          <span class="text-ink-faint">{{ r.name }}</span>
          <span class="ml-auto tabular font-kai text-[13px] text-gold-ink">{{ r.valueText }}</span>
          <span class="shrink-0 text-[10px] text-ink-faint">Kiếp thứ {{ r.life }} · {{ r.note }}</span>
        </p>
      </template>
      <p v-else class="py-5 text-center">
        <span class="empty-seal" aria-hidden="true">Sáng</span>
        <span class="mt-2.5 block font-kai text-[12px] tracking-[0.2em] text-ink-soft">Kỷ lục chờ tạo lập</span>
        <span class="mt-1 block text-[10px] leading-relaxed text-ink-faint">Lúc phá giới, tự thấy phân hiểu</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useEndgameStore } from '@/stores/endgame'
  import { usePlayerStore } from '@/stores/player'
  import { useAdventureStore } from '@/stores/adventure'
  import { useLoreStore } from '@/stores/lore'
  import { cnNumber } from '@/utils/format'
  import { displayCnNum } from '@/ui/displayZhVi'
  import { cultivatorProfile, MILESTONE_DEFS, milestoneDef, PROFILE_MIN_MARKS, RECORD_DEFS } from '@/core/identity'
  import { currentStage, totalInsight, vowProgress, vowResult } from '@/core/samsaraService'
  import { nextStageAfter } from '@/data/samsara'
  import { lifeThemeDef } from '@/data/lifeThemes'
  import { lifeTrialDef } from '@/data/lifeTrials'
  import { regionDef } from '@/data/regions'
  import { eventDef } from '@/data/events'
  import { isNemesis } from '@/core/worldMemory'
  import { chainProgressRows } from '@/core/eventEngine'
  import { formatDate } from '@/utils/time'
  import { displayRealmName } from '@/ui/displayZhVi'
  import SectionTitle from '@/components/common/SectionTitle.vue'

  const endgame = useEndgameStore()
  const player = usePlayerStore()
  const adventure = useAdventureStore()
  const lore = useLoreStore()

  function translateDaoName(name: string): string {
    const map: Record<string, string> = {
      '剑修': 'Kiếm Tu',
      '法修': 'Pháp Tu',
      '体修': 'Thể Tu',
      '气修': 'Khí Tu',
      '器修': 'Khí Tu (Pháp bảo)',
      '丹修': 'Đan Tu',
      '阵修': 'Trận Tu'
    }
    return map[name] ?? name
  }

  function translateRisk(r: string): string {
    if (r === '高') return 'Cao'
    if (r === '中') return 'Vừa'
    if (r === '低') return 'Thấp'
    return r
  }

  function translateBuildTendency(b: string): string {
    if (b === '道路常杂糅') return 'Đạo lộ thường dung hòa'
    if (b === '中度专精') return 'Chuyên tinh mức độ vừa'
    if (b === '一门深入') return 'Chuyên sâu một môn'
    return b
  }

  // ---- 轮回录 ----
  const insight = computed(() => totalInsight())
  const stage = computed(() => currentStage())
  const toNextStage = computed(() => {
    const next = nextStageAfter(insight.value)
    return next ? next.insight - insight.value : null
  })
  const vowTheme = computed(() => {
    const vow = player.reincarnation.vow
    return vow ? (lifeThemeDef(vow.themeId) ?? null) : null
  })
  const vowProg = computed(() => vowProgress())
  const vowBroken = computed(() => vowResult() === 'broken')
  const vowDone = computed(() => vowResult() === 'done')

  const RESULT_TEXTS: Record<'done' | 'unfinished' | 'broken', string> = {
    done: 'Thực hiện đến cùng',
    unfinished: 'Chưa xong',
    broken: 'Đã phá'
  }
  const RESULT_COLORS: Record<'done' | 'unfinished' | 'broken', string> = {
    done: 'text-cinnabar',
    unfinished: 'text-ink-faint',
    broken: 'text-amber-ink'
  }

  /** 历世履历:最近的一世排在最前 */
  const lifeRows = computed(() =>
    [...player.reincarnation.lives]
      .sort((a, b) => b.index - a.index)
      .map(l => {
        const result = l.themeResult ?? 'unfinished'
        return {
          ...l,
          themeName: l.themeId ? (lifeThemeDef(l.themeId)?.name ?? null) : null,
          resultText: RESULT_TEXTS[result],
          resultColor: RESULT_COLORS[result],
          // 逆旅契是这一世唯一的回报 —— 让「记在履历上」真的能被看见
          trialName: l.trialId ? (lifeTrialDef(l.trialId)?.name ?? null) : null
        }
      })
  )

  /** 征战录:当前未雪耻/已雪耻的宿敌 */
  const nemesisRows = computed(() =>
    player.nemeses
      .filter(n => n.lossCount >= 3)
      .map(n => ({
        ...n,
        regionName: regionDef(n.regionId)?.name ?? n.regionId,
        avengedAt: n.avengedAt,
        active: isNemesis(player.nemeses, n.enemyId)
      }))
      .sort((a, b) => (a.avengedAt ?? 0) - (b.avengedAt ?? 0))
  )

  /** 征战录:事件余波(世界记忆的最近完成) */
  const lossRows = computed(() =>
    Object.values(adventure.eventMemories)
      .filter(m => m.times >= 2)
      .map(m => ({
        eventId: m.eventId,
        at: m.lastAt,
        eventName: eventDef(m.eventId)?.title ?? m.eventId,
        note: `Sau ${m.times} lần kỳ ngộ, nơi đây đã mang phong mạo khác`
      }))
      .sort((a, b) => b.at - a.at)
      .slice(0, 8)
  )

  const profile = computed(() => cultivatorProfile(endgame.marks))

  /** 奇缘录:只有起了头的缘才露面(往后的路不说破) */
  const chainRows = computed(() => chainProgressRows())
  const unfinishedChains = computed(() => chainRows.value.filter(c => !c.finished).length)

  const MILESTONE_NAMES_VN: Record<string, string> = {
    '飞升仙界': 'Phi Thăng Tiên Giới',
    '破界入神': 'Phá Giới Nhập Thần',
    '归返混沌': 'Quy Phản Hỗn Độn',
    '初立道途': 'Sơ Lập Đạo Đồ',
    '初破一界': 'Sơ Phá Nhất Giới',
    '逆命破界': 'Nghịch Mệnh Phá Giới',
    '无伤全程': 'Toàn Trình Vô Thương',
    '七杀功成': 'Thất Sát Công Thành',
    '虚界行者': 'Hư Giới Hành Giả',
    '自立天道': 'Tự Lập Thiên Đạo',
    '应时而战': 'Ứng Thời Nghênh Chiến',
    '胜于旧我': 'Vượt Qua Bản Ngã',
    '初入轮回': 'Sơ Nhập Luân Hồi'
  }

  const MILESTONE_DESCS_VN: Record<string, string> = {
    '首次踏破人间界,飞升入仙': 'Lần đầu phá vỡ Nhân Gian Giới, phi thăng vào Tiên Giới',
    '首次自仙界踏入神界': 'Lần đầu từ Tiên Giới bước chân vào Thần Giới',
    '首次踏入混沌海,重归大道本源': 'Lần đầu bước vào Hỗn Độn Hải, quy về bản nguyên đại đạo',
    '于天穹之下立誓,择一道而行': 'Dưới vòm trời lập thề, chọn một đạo mà đi',
    '首次踏破特殊规则世界': 'Lần đầu vượt qua thế giới quy tắc đặc thù',
    '主流派核心尽封,仍以余技破界': 'Cốt lõi lưu phái chính bị phong tỏa, vẫn dùng dư kỹ phá giới',
    '携无伤契走完全程,每战气血不失八成': 'Mang theo Vô Thương Khế đi hết toàn trình, mỗi trận khí huyết không giảm quá hai phần',
    '首次通过七杀试炼': 'Lần đầu vượt qua Thất Sát Thí Luyện',
    '首次踏破天道织成的虚界': 'Lần đầu phá vỡ Hư Giới do thiên đạo dệt nên',
    '亲手写下挑战书,并将其完成': 'Tự tay viết nên khiêu chiến thư và hoàn thành trọn vẹn',
    '首次完成今日天道': 'Lần đầu hoàn thành Thiên Đạo Hôm Nay',
    '重写自己的历史道痕,快过当年': 'Viết lại đạo vết lịch sử của chính mình, nhanh hơn năm xưa',
    '首次兵解转世,道果随神魂不灭': 'Lần đầu binh giải chuyển thế, đạo quả theo thần hồn bất diệt'
  }

  const milestoneRows = computed(() =>
    [...endgame.milestones]
      .sort((a, b) => a.at - b.at)
      .map(m => {
        const def = milestoneDef(m.id)
        const rawName = def?.name ?? m.id
        const rawDesc = def?.desc ?? ''
        return {
          id: m.id,
          life: m.life,
          name: MILESTONE_NAMES_VN[rawName] ?? rawName,
          desc: MILESTONE_DESCS_VN[rawDesc] ?? rawDesc
        }
      })
  )

  const RECORD_NAMES_VN: Record<string, string> = {
    '最快破界': 'Phá Giới Nhanh Nhất',
    '最高风险破界': 'Phá Giới Hiểm Nguy Nhất',
    '单程最厚之赏': 'Thưởng Đơn Trình Dày Nhất',
    '挑战书最高赏格': 'Thưởng Thư Khiêu Chiến Cao Nhất'
  }

  const RECORD_UNITS_VN: Record<string, string> = {
    '回合': 'hiệp',
    '道源': 'Đạo Nguyên'
  }

  const recordRows = computed(() =>
    RECORD_DEFS.map(def => {
      const r = endgame.records[def.id]
      if (!r) return null
      const unit = RECORD_UNITS_VN[def.unit] ?? def.unit
      return {
        id: def.id,
        name: RECORD_NAMES_VN[def.name] ?? def.name,
        valueText: def.unit === '×' ? `×${r.value}` : `${r.value} ${unit}`,
        life: r.life,
        note: r.note
      }
    }).filter((x): x is NonNullable<typeof x> => x !== null)
  )
</script>
