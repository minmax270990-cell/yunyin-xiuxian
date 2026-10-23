<template>
  <div class="stagger-in space-y-4 px-4 pb-6 pt-4">
    <div class="flex items-center gap-2">
      <RouterLink to="/character" class="-my-1.5 py-1.5 text-[12px] text-ink-faint active:text-ink-soft">← Nhân vật</RouterLink>
      <span class="text-[11px] text-ink-faint">·</span>
      <span class="text-[12px] text-ink-soft">Giới Vực Chí</span>
    </div>

    <SectionTitle title="界域志" hint="Tên gọi các cảnh giới từ đâu mà có, lần theo lai lịch mà đọc" />
    <InkTabs v-model="codexTab" :tabs="CODEX_TABS" />

    <template v-if="codexTab === 'realm'">
    <!-- 界域与境界:逐境写明出处与承接 -->
    <section v-for="row in worldRows" :key="row.world.id" class="card-ink px-4 py-3">
      <div class="flex items-baseline gap-2">
        <span class="font-kai text-[15px] tracking-[0.25em] text-ink">{{ displayWorldName(row.world.name) }}</span>
        <span class="text-[10px] text-ink-faint">Cảnh thứ {{ row.world.start + 1 }}–{{ row.world.end + 1 }}</span>
      </div>
      <p class="mt-0.5 text-[11px] leading-relaxed text-ink-faint">{{ row.world.desc }}</p>
      <div class="mt-2 space-y-2">
        <div
          v-for="cell in row.realms"
          :key="cell.def.id"
          class="rounded-md px-2.5 py-2"
          :class="cell.index === player.major ? 'bg-cinnabar/8' : 'bg-paper-deep/50'"
        >
          <p class="flex items-center gap-2">
            <span
              class="font-kai text-[14px] tracking-wider"
              :class="cell.index === player.major ? 'text-cinnabar' : cell.index < player.major ? 'text-ink-soft' : 'text-ink-faint'"
            >
              {{ displayRealmName(cell.def.name) }}
            </span>
            <span class="chip-ink !text-[9px]">{{ displayRealmBasis(cell.def.basis) }}</span>
            <span v-if="cell.index === player.major" class="text-[9px] text-cinnabar">Hiện đang ở đây</span>
          </p>
          <p class="mt-0.5 text-[11px] leading-relaxed text-ink-soft">{{ displayRealmDesc(cell.def.desc) }}</p>
          <p class="mt-1 text-[11px] leading-relaxed text-ink-faint">{{ displayRealmLore(cell.def.lore) }}</p>
          <!-- 此境所据何典:把「境界 → 原典」这条来路直接摆在该境底下 -->
          <p v-if="classicsOf(cell.def.id).length" class="mt-1 text-[10px] text-ink-faint">
            Căn cứ: {{ classicsOf(cell.def.id).map(c => `《${c.title}》`).join(' ') }}
          </p>
        </div>
      </div>
    </section>
    </template>

    <template v-if="codexTab === 'classics'">
    <!-- 典籍:境界名背后的原典 -->
    <SectionTitle title="典籍" hint="Sách cổ truyền thống của Đạo giáo, Phật giáo, Đạo gia và Đan đạo" />
    <section class="space-y-2">
      <article v-for="c in CLASSICS" :key="c.id" class="card-ink px-4 py-3">
        <p class="flex flex-wrap items-center gap-2">
          <span class="font-kai text-[14px] text-ink">《{{ c.title }}》</span>
          <span class="chip-ink !text-[9px]">{{ c.school }}</span>
          <span class="text-[10px] text-ink-faint">{{ c.source }}</span>
        </p>
        <p class="mt-1 text-[11px] leading-relaxed text-ink-soft">{{ c.gist }}</p>
        <p v-if="c.realms.length" class="mt-1 text-[10px] text-ink-faint">
          Liên quan: {{ c.realms.map(id => realmName(id)).join(', ') }}
        </p>
      </article>
    </section>
    </template>

    <template v-if="codexTab === 'yi'">
    <!-- 周易:读过之后可以真的问一卦 -->
    <SectionTitle title="周易" :hint="`${cnNumber(TRIGRAMS.length)} quẻ làm thể, ${cnNumber(HEXAGRAMS.length)} quẻ làm dụng`" />
    <section class="card-ink px-4 py-3">
      <p class="text-[11px] leading-relaxed text-ink-faint">
        「Dịch」không phải đồ trang trí nơi thư phòng: bát quái mỗi quẻ chủ về thế sự một phương, trùng quẻ do trên dưới xếp chồng ——
        Quẻ hạ là thân, quẻ thượng là cảnh, thế nên uy lực một quẻ là hai luồng nội ngoại tương tế. Quẻ lắc được tại thân, hết giờ tự tán.
      </p>

      <!-- 在身之卦 -->
      <div v-if="currentReading" class="mt-3 rounded-md bg-paper-deep/50 px-3 py-2.5">
        <p class="flex flex-wrap items-center gap-2">
          <span class="font-kai text-[16px] tracking-widest text-cinnabar">Quẻ {{ currentReading.hexagram.name }}</span>
          <span class="text-[10px] text-ink-faint tabular">
            Thượng {{ currentReading.upper.name }}{{ currentReading.upper.symbol }} · Hạ {{ currentReading.lower.name
            }}{{ currentReading.lower.symbol }}
          </span>
          <span v-if="currentReading.changed" class="chip-ink !text-[9px]">Biến {{ currentReading.changed.name }}</span>
          <span class="ml-auto text-[10px] tabular text-ink-faint">{{ remainText }}</span>
        </p>
        <div class="mt-1.5 space-y-0.5 font-kai text-[12px] tracking-[0.2em] text-ink-soft">
          <p v-for="(bar, i) in drawnLines" :key="i">{{ bar }}</p>
        </div>
        <p class="mt-1.5 text-[11px] leading-relaxed text-ink-soft">{{ currentReading.hexagram.gist }}</p>
        <p v-for="(line, i) in counsel" :key="`c${i}`" class="mt-0.5 text-[11px] leading-relaxed text-ink-faint">{{ line }}</p>
        <p class="mt-1.5 text-[11px] text-azure">Sức mạnh trên thân: {{ powerText }}</p>
      </div>

      <div class="mt-2.5 flex items-center gap-2">
        <button
          class="btn-ghost !py-1.5 !text-[12px]"
          :disabled="!!player.activeDivination"
          @click="ask"
        >
          {{ player.activeDivination ? 'Quẻ đang trên thân, đợi tự tiêu tán' : `Vấn Quẻ (Điểm Ngộ Đạo ${DIVINATION_COST})` }}
        </button>
        <span class="text-[10px] leading-relaxed text-ink-faint">
          Bói để giải nghi, không nghi sao bói —— Một việc không bói hai lần, quẻ lực theo hào động mà thịnh, cũng theo thời gian mà cạn.
        </span>
      </div>
    </section>

    <!-- 八卦 -->
    <section class="card-ink divide-y divide-ink/6 px-4">
      <div v-for="t in TRIGRAMS" :key="t.id" class="flex items-start gap-2 py-2.5">
        <span class="w-[52px] shrink-0 font-kai text-[15px] text-ink">{{ t.symbol }} {{ t.name }}</span>
        <span class="w-[56px] shrink-0 text-[10px] text-ink-faint">Tượng {{ t.image }} · {{ t.nature }}</span>
        <span class="min-w-0 grow text-[11px] leading-relaxed text-ink-soft">{{ t.gist }}</span>
        <span class="shrink-0 text-[10px] text-jade">Hợp {{ t.good }}</span>
        <span class="shrink-0 text-[10px] text-cinnabar">Kỵ {{ t.bad }}</span>
      </div>
    </section>

    <!-- 六十四卦:全表可查,但不必时时铺开 -->
    <section class="card-ink px-4 py-3">
      <button class="flex w-full items-center justify-between text-left" @click="showAllHex = !showAllHex">
        <span class="font-kai text-[13px] tracking-wider text-ink">{{ cnNumber(HEXAGRAMS.length) }} Quẻ</span>
        <span class="text-[10px] text-azure">{{ showAllHex ? 'Thu gọn' : `Mở xem toàn bộ ${HEXAGRAMS.length} quẻ →` }}</span>
      </button>
      <div v-if="showAllHex" class="mt-2 max-h-72 divide-y divide-ink/6 overflow-y-auto">
        <div v-for="x in HEXAGRAMS" :key="x.order" class="flex items-baseline gap-2 py-2">
          <span class="w-6 shrink-0 tabular text-[10px] text-ink-faint">{{ x.order }}</span>
          <span class="w-14 shrink-0 font-kai text-[13px] text-ink">{{ x.name }}</span>
          <span class="w-16 shrink-0 text-[10px] text-ink-faint tabular">
            {{ trigramDef(x.upper)?.symbol }}{{ trigramDef(x.lower)?.symbol }}
          </span>
          <span class="min-w-0 text-[11px] leading-relaxed text-ink-soft">{{ x.gist }}</span>
        </div>
      </div>
    </section>

    </template>

    <template v-if="codexTab === 'ziwei'">
    <!-- 紫微:一世之格,与周易的「一时之机」分工 -->
    <SectionTitle title="紫微" :hint="`${cnNumber(PALACES.length)} cung định cách cục một đời, phân công với vấn quẻ`" />
    <section class="card-ink px-4 py-3">
      <p class="text-[11px] leading-relaxed text-ink-faint">
        Tử Vi Đẩu Số vốn nên theo giờ sinh định cục ngũ hành rồi mới an các sao, trong trò chơi không có giờ sinh ——
        Thế nên môn này chỉ lấy điều chủ quản của {{ cnNumber(PALACES.length) }} cung cùng tính chất của {{ cnNumber(STARS.length) }} chủ tinh, dựa vào linh căn và luân hồi mà an sao: ấy là lấy tượng nghĩa, không phải bài bàn.
        Quẻ là thời cơ nhất thời (có thể vấn, có hạn định), mệnh là cách cục một đời (thường trú, chuyển thế tính lại, lực mỏng làm màu nền).
      </p>
      <p class="mt-2 font-kai text-[13px] leading-relaxed text-ink">{{ fateLordLineText }}</p>
      <p class="mt-1 text-[11px] text-azure">Sức mạnh mệnh cách: {{ fateModsText }}</p>
      <div class="mt-2.5 divide-y divide-ink/6">
        <div v-for="row in fateRows" :key="row.palace.id" class="flex items-baseline gap-2 py-1.5">
          <span class="w-14 shrink-0 font-kai text-[12px] text-ink-soft">{{ row.palace.name }}</span>
          <span class="w-24 shrink-0 text-[11px] text-cinnabar">{{ row.starNames }}</span>
          <span class="min-w-0 text-[11px] leading-relaxed text-ink-faint">{{ row.palace.domain }} · {{ row.palace.use }}</span>
        </div>
      </div>
      <div class="mt-2 border-t border-ink/10 pt-2">
        <p class="text-[10px] text-ink-faint">{{ cnNumber(STARS.length) }} chủ tinh · Không có linh thạch cũng có thể xem, chọn một điểm hóa để chuyển hướng lưu phái</p>
        <div v-for="s in STARS" :key="s.id" class="mt-1 flex items-start gap-2 text-[11px] leading-relaxed text-ink-soft">
          <span class="min-w-0 flex-1">
            <span class="font-kai text-ink">{{ s.name }}</span>
            <span class="text-ink-faint"> · {{ s.nature }} · {{ s.gist }}</span>
          </span>
          <button
            class="shrink-0 cursor-pointer text-[10px]"
            :class="player.fateFocus === s.id ? 'font-kai text-gold-ink' : 'text-azure'"
            @click="focusStar(s.id)"
          >{{ player.fateFocus === s.id ? 'Đã hiển hóa' : `Điểm hóa ${focusCostText}` }}</button>
        </div>
        <p class="mt-2 text-[10px] leading-relaxed text-ink-faint">
          Điểm hóa một vị chủ tinh, sức mạnh của nó sẽ hiển hóa gấp đôi (mười ba ngôi sao còn lại vẫn giữ làm màu nền, mười bốn ngôi sao không sót ngôi nào) —— Tiêu hao là linh thạch ({{ focusCostText }}),
          đổi lại là kiếp này sẽ thiên về đường nào: sắt tốt dùng trên lưỡi dao.
        </p>
      </div>
    </section>
    </template>

    <template v-if="codexTab === 'xiang'">
    <!-- 星象:二十八宿值日,利一方界域 -->
    <SectionTitle title="星象" :hint="`${cnNumber(MANSIONS.length)} tú trực nhật, phân dã để đọc, tứ tượng làm dụng`" />
    <section class="card-ink px-4 py-3">
      <p class="font-kai text-[13px] leading-relaxed text-ink">{{ mansionLine }}</p>
      <p class="mt-1 text-[11px] leading-relaxed text-ink-faint">
        Phân dã dựa theo 《Tấn Thư · Thiên Văn Chí》(các nhà có chút dị biệt) chỉ dùng đọc xem lai lịch —— Địa giới trong trò chơi không phải Cửu Châu.
        Có tác dụng thực tế là quy ước trò chơi dưới đây: {{ cnNumber(IMAGES.length) }} tượng phối {{ cnNumber(WORLDS.length) }} giới ({{ imageWorldMap }}),
        tú trực nhật thuộc tượng nào, giới vực tương ứng hôm nay lịch luyện tế ngộ dễ gặp hơn (nhân vào tế ngộ lịch luyện +{{ mansionLuckPercent() }}%), nơi khác không tăng.
      </p>
      <p class="mt-1.5 text-[11px] text-azure">
        Hôm nay lợi <span class="text-gold-ink">{{ displayWorldName(favoredWorldName) }}</span> —— Khác với thiên thời: thiên thời là khí toàn cảnh, tinh tượng chỉ lợi một phương.
      </p>
      <button class="-my-1 mt-2 w-full py-2 text-left text-[10px] text-azure" @click="showAllMansions = !showAllMansions">
        {{ showAllMansions ? `Thu gọn ${cnNumber(MANSIONS.length)} tú` : `Mở xem toàn bộ ${MANSIONS.length} tú →` }}
      </button>
      <div v-if="showAllMansions" class="mt-2 divide-y divide-ink/6">
        <template v-for="img in IMAGES" :key="img.id">
          <p class="pt-2 text-[10px] text-ink-faint">Phương {{ displayDirection(img.direction) }} {{ displayImageName(img.name) }} · Phối {{ displayWorldName(worldName(img.world)) }}</p>
          <div v-for="m in mansionsOf(img.id)" :key="m.name" class="flex items-baseline gap-2 py-1.5">
            <span class="w-12 shrink-0 font-kai text-[13px] text-ink">{{ m.name }}</span>
            <span class="w-20 shrink-0 text-[10px] text-ink-faint">{{ m.fullName }}</span>
            <span class="w-12 shrink-0 text-[10px] text-ink-faint">{{ m.domain }}</span>
            <span class="min-w-0 text-[11px] leading-relaxed text-ink-soft">{{ m.good }}</span>
          </div>
        </template>
      </div>
    </section>
    </template>

    <template v-if="codexTab === 'qimen'">
    <!-- 奇门:九宫八门,择门而入 -->
    <SectionTitle title="奇门" :hint="`Cửu cung ${cnNumber(GATES.length)} môn, chọn môn mà vào`" />
    <section class="card-ink px-4 py-3">
      <p class="text-[11px] leading-relaxed text-ink-faint">
        {{ cnNumber(GATES.length) }} môn bài bố theo Lạc Thư cửu cung: {{ luoshuGatesText }}.
        Trước khi viễn chinh khởi hành có thể chọn một môn nhập giới —— Không phải lập khế ước với thiên đạo (đó là đổi Đạo Nguyên),
        chọn môn đổi là lối đánh chuyến này: tục hàng, công cướp, thủ chuyết hay tốc quyết.
      </p>
      <div class="mt-2.5 divide-y divide-ink/6">
        <div v-for="g in GATES" :key="g.id" class="flex items-start gap-2 py-2">
          <span class="w-12 shrink-0 font-kai text-[13px]" :class="g.kind === '凶' ? 'text-cinnabar' : g.kind === '吉' ? 'text-jade' : 'text-ink-soft'">
            {{ g.fullName }}
          </span>
          <span class="w-20 shrink-0 text-[10px] text-ink-faint tabular">{{ g.gua }}{{ g.direction }} · Cung {{ g.palace }} · {{ g.kind === '凶' ? 'Hung' : g.kind === '吉' ? 'Cát' : g.kind }}</span>
          <span class="min-w-0 text-[11px] leading-relaxed text-ink-soft">{{ g.gist }}</span>
        </div>
      </div>
      <p class="mt-2 text-[10px] leading-relaxed text-ink-faint">
        Tám môn không phải quy tắc mới, chỉ là đổi lối đánh —— Không chọn môn thì mọi sự đều như trước.
      </p>
    </section>
    </template>

    <template v-if="codexTab === 'todo' && PLANNED_SCHOOLS.length">
      <SectionTitle title="待续" hint="Các môn loại đã có ý tưởng, chưa thành sách" />
      <section class="card-ink divide-y divide-ink/6 px-4">
      <div v-for="p in PLANNED_SCHOOLS" :key="p.name" class="flex items-start gap-2 py-2.5">
        <span class="w-[104px] shrink-0 font-kai text-[12px] text-ink-soft">{{ p.name }}</span>
        <span class="text-[11px] leading-relaxed text-ink-faint">{{ p.note }}</span>
      </div>
      <p class="py-2.5 text-[10px] leading-relaxed text-ink-faint">
        Các môn loại đã có ý tưởng, chưa thành sách —— Đợi khi hoàn thiện sẽ tự mang điển tịch và lối chơi vào sách này.
      </p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { usePlayerStore } from '@/stores/player'
  import { useGameStore } from '@/stores/game'
  import { useUiStore } from '@/stores/ui'
  import { REALMS, WORLDS, realmDef } from '@/data/realms'
  import { CLASSICS, PLANNED_SCHOOLS, classicsForRealm } from '@/data/classics'
  import { HEXAGRAMS, TRIGRAMS, trigramDef } from '@/data/yijing'
  import { DIVINATION_COST, drawLines, readingCounsel, readingFromState } from '@/core/divination'
  import { askDivination } from '@/core/divinationService'
  import { PALACES, STARS } from '@/data/ziwei'
  import { fateLordLine } from '@/core/fate'
  import { IMAGES, MANSIONS, type ImageId } from '@/data/xiangxiu'
  import { GATES } from '@/data/qimen'
  import { cnNumber, formatGN } from '@/utils/format'
  import { gn } from '@/utils/gnum'
  import { STAR_FOCUS_COST_BASE } from '@/data/constants'
  import { mansionLuckPercent, effectiveFavoredWorld, todayMansionLine } from '@/core/astronomy'
  import { worldDef } from '@/data/realms'
  import type { WorldId } from '@/types'
  import { modsText } from '@/ui/statNames'
  import {
    displayWorldName,
    displayRealmName,
    displayRealmDesc,
    displayRealmBasis,
    displayRealmLore,
    displayDirection,
    displayImageName
  } from '@/ui/displayZhVi'
  import SectionTitle from '@/components/common/SectionTitle.vue'
  import InkTabs from '@/components/common/InkTabs.vue'

  const player = usePlayerStore()
  const game = useGameStore()
  const ui = useUiStore()

  /** 分册:六门各占一册 —— 页越长越该分,免得一路拉到底找不着北 */
  type CodexTab = 'realm' | 'classics' | 'yi' | 'ziwei' | 'xiang' | 'qimen' | 'todo'
  const CODEX_TABS: { id: CodexTab; label: string }[] = [
    { id: 'realm', label: 'Giới Vực' },
    { id: 'classics', label: 'Điển Tịch' },
    { id: 'yi', label: 'Chu Dịch' },
    { id: 'ziwei', label: 'Tử Vi' },
    { id: 'xiang', label: 'Tinh Tượng' },
    { id: 'qimen', label: 'Kỳ Môn' }
  ]
  const codexTab = ref<CodexTab>('realm')

  const showAllHex = ref(false)

  /** 在身之卦:读一次心跳,过期的卦才会自己消失(与 player 的判定同一个办法) */
  const currentReading = computed(() => {
    void game.totalPlaySec
    const state = player.activeDivination
    return state ? readingFromState(state) : null
  })
  const drawnLines = computed(() => (currentReading.value ? drawLines(currentReading.value) : []))
  const counsel = computed(() => (currentReading.value ? readingCounsel(currentReading.value) : []))
  const powerText = computed(() => (currentReading.value ? modsText(player.divinationMods) : ''))
  const remainText = computed(() => {
    void game.totalPlaySec
    const state = player.activeDivination
    if (!state) return ''
    const ms = Math.max(0, state.expiresAt - Date.now())
    const m = Math.floor(ms / 60_000)
    const sec = Math.floor((ms % 60_000) / 1000)
    return m > 0 ? `Còn lại ${m} phút ${sec} giây` : `Còn lại ${sec} giây`
  })

  function ask(): void {
    const out = askDivination()
    if (!out.ok) {
      ui.toast(out.reason ?? 'Chưa thành quẻ', 'warn')
      return
    }
    const r = out.reading!
    ui.toast(`Được quẻ 「${r.hexagram.name}」${r.changed ? `, biến ${r.changed.name}` : ''}`, 'info')
  }

  // 命格:一世不变的一张盘(转世重算),故不必计时,直接读 player 的派生值
  const fateLordLineText = computed(() => fateLordLine(player.fateChart))
  const fateModsText = computed(() => modsText(player.fateMods))

  /** 点化主星的灵石单价(一处出,文案与扣费同源) */
  const focusCostText = formatGN(gn(STAR_FOCUS_COST_BASE))
  function focusStar(id: string): void {
    const name = STARS.find(s => s.id === id)?.name ?? id
    // 已显化同星:不是灵石不足,另提示
    if (player.fateFocus === id) {
      ui.toast(`「${name}」đã hiển hóa, không cần chọn lại`, 'info')
      return
    }
    const ok = player.focusFateStar(id)
    ui.toast(ok ? `Điểm hóa 「${name}」hiển hóa, uy lực tăng gấp đôi` : 'Linh thạch không đủ, điểm hóa thất bại', ok ? 'info' : 'warn')
  }
  const fateRows = computed(() =>
    player.fateChart.palaces.map(p => ({
      palace: p.palace,
      starNames: p.stars.map(s => `${s.name}(${s.nature})`).join(', ')
    }))
  )

  // 星象:值日之宿与所利界域(由游戏日派生,随心跳刷新)
  const showAllMansions = ref(false)
  const mansionLine = computed(() => todayMansionLine())
  const favoredWorldName = computed(() => worldDef(effectiveFavoredWorld()).name)
  function worldName(id: WorldId): string {
    return worldDef(id).name
  }
  function mansionsOf(image: ImageId) {
    return MANSIONS.filter(m => m.image === image)
  }

  /**
   * 洛书九宫的排布句 —— **从 GATES 表推出来,不手写**。
   *
   * 这句话本质是一张地图(哪一门坐哪一宫、朝哪一方),手写一份就等于把
   * 八门的方向抄了第二遍:改门的位置或加一门,句子会开始说假话。
   * 中五无门是九宫的固有事实(不是一张门),故由循环补出。
   */
  const luoshuGatesText = computed(() =>
    Array.from({ length: 9 }, (_, i) => {
      const palace = i + 1
      const gate = GATES.find(g => g.palace === palace)
      return gate ? `${gate.gua}${cnNumber(palace)}${gate.direction}${gate.fullName}` : `Trung ${cnNumber(palace)} không môn`
    }).join(', ')
  )

  /** 四象各配哪一界 —— 游戏约定写在 IMAGES 表里,这句只是把它读出来 */
  const imageWorldMap = computed(() => IMAGES.map(i => `${displayDirection(i.direction)} phối ${displayWorldName(worldName(i.world))}`).join(', '))

  const worldRows = computed(() =>
    WORLDS.map(w => ({
      world: w,
      realms: REALMS.map((def, index) => ({ def, index })).filter(c => c.index >= w.start && c.index <= w.end)
    }))
  )

  function realmName(id: string): string {
    const idx = REALMS.findIndex(r => r.id === id)
    return idx >= 0 ? displayRealmName(realmDef(idx).name) : id
  }

  /** 此境所据的原典(来自典籍表,不在视图里手写) */
  function classicsOf(realmId: string) {
    return classicsForRealm(realmId)
  }
</script>
