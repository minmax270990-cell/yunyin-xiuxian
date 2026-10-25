<template>
  <div class="stagger-in flex min-h-full flex-col px-6 py-8">
    <!-- Tiêu đề -->
    <div class="mt-6 text-center">
      <h1 class="font-kai text-[36px] leading-tight tracking-[0.2em] text-ink">Thiên Đạo</h1>
      <p class="mt-2 text-[12px] tracking-[0.3em] text-ink-faint">Nhất Niệm Tu Hành · Vạn Pháp Quy Tông</p>
    </div>

    <!-- Đạo hiệu & Giới tính -->
    <div class="card-ink mt-8 px-4 py-3">
      <p class="mb-2 font-kai text-[13px] tracking-[0.2em] text-ink-faint">ĐẠO HIỆU & GIỚI TÍNH</p>
      <div class="flex items-center gap-2">
        <input
          v-model="name"
          maxlength="16"
          class="w-full rounded-md border border-ink/20 bg-paper-deep/60 px-3 py-2 font-kai text-[15px] tracking-wide text-ink outline-none focus:border-cinnabar/50"
          placeholder="Đặt một đạo hiệu"
        />
        <button class="btn-ghost shrink-0 !px-3" aria-label="Ngẫu nhiên chọn một đạo hiệu" @click="randomName">
          <GameIcon name="refresh" :size="15" />
        </button>
      </div>

      <div class="mt-3.5 flex items-center justify-between border-t border-ink/10 pt-3">
        <span class="font-kai text-[13px] tracking-wider text-ink-faint">GIỚI TÍNH</span>
        <div class="flex gap-2">
          <button
            type="button"
            class="flex items-center gap-1 rounded-md px-4 py-1.5 font-kai text-[13px] transition-all"
            :class="gender === 'male' ? 'border border-azure/60 bg-azure/10 text-azure font-semibold shadow-sm' : 'border border-ink/20 text-ink-faint hover:text-ink'"
            @click="selectGender('male')"
          >
            Nam tu
          </button>
          <button
            type="button"
            class="flex items-center gap-1 rounded-md px-4 py-1.5 font-kai text-[13px] transition-all"
            :class="gender === 'female' ? 'border border-cinnabar/60 bg-cinnabar/10 text-cinnabar font-semibold shadow-sm' : 'border border-ink/20 text-ink-faint hover:text-ink'"
            @click="selectGender('female')"
          >
            Nữ tu
          </button>
        </div>
      </div>
    </div>

    <!-- Linh căn -->
    <div class="card-ink mt-4 px-4 py-3">
      <div class="flex items-center justify-between">
        <p class="font-kai text-[13px] tracking-[0.2em] text-ink-faint">LINH CĂN</p>
        <span class="font-kai text-[15px] tracking-wide text-cinnabar">{{ profile.gradeName }}</span>
      </div>
      <div :key="rollSeq" class="stagger-in mt-4 flex justify-center gap-3">
        <div v-for="root in profile.roots" :key="root.element" class="flex flex-col items-center gap-1.5">
          <span
            class="grid h-12 w-12 place-items-center rounded-full border-2 font-kai text-sm font-semibold animate-breathe"
            :style="{ borderColor: ELEMENTS[root.element].color, color: ELEMENTS[root.element].color }"
          >
            {{ ELEMENTS[root.element].char }}
          </span>
          <span class="tabular text-[11px] text-ink-soft">Tư chất {{ root.aptitude }}</span>
        </div>
      </div>
      <p class="mt-4 text-center text-[12px] text-ink-faint">
        Bội suất tu hành
        <span :key="rollSeq" class="tabular text-[14px] text-ink animate-ink-pop">×{{ profile.growthMult.toFixed(2) }}</span>
      </p>
      <!-- Xu hướng thiên phú linh căn -->
      <div v-if="tendencies.length" :key="`tend-${rollSeq}`" class="stagger-in mt-3 space-y-1.5 border-t border-ink/10 pt-3">
        <p v-for="t in tendencies" :key="t.element" class="flex gap-2 text-[11px] leading-relaxed text-ink-soft">
          <span class="shrink-0 font-kai font-semibold" :style="{ color: ELEMENTS[t.element].color }">{{ ELEMENTS[t.element].char }}</span>
          <span>{{ t.text }}</span>
        </p>
      </div>
    </div>

    <!-- Tư chất & Thiên phú ban đầu -->
    <div class="card-ink mt-4 px-4 py-3">
      <div class="flex items-center justify-between">
        <p class="font-kai text-[13px] tracking-[0.2em] text-ink-faint">TƯ CHẤT & THIÊN PHÚ BAN ĐẦU</p>
        <span class="text-[11px] text-ink-faint">Khí vận bẩm sinh (3 dòng)</span>
      </div>
      <div :key="`apt-${rollSeq}`" class="stagger-in mt-3 space-y-2">
        <div
          v-for="apt in currentAptitudes"
          :key="apt.id"
          class="rounded-md border p-2.5 transition-all bg-paper-deep/40"
          :class="APTITUDE_GRADE_META[apt.grade].borderClass"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="font-kai text-[14px] font-semibold tracking-wide text-ink">{{ apt.name }}</span>
              <span
                class="rounded px-1.5 py-0.5 text-[10px] font-kai font-medium"
                :class="APTITUDE_GRADE_META[apt.grade].textClass"
                :style="{ backgroundColor: 'color-mix(in srgb, currentColor 10%, transparent)' }"
              >
                {{ APTITUDE_GRADE_META[apt.grade].name }}
              </span>
            </div>
            <span class="text-[10px] text-ink-faint">{{ APTITUDE_CATEGORY_NAMES[apt.category] }}</span>
          </div>
          <p class="mt-1 text-[11px] leading-relaxed text-ink-faint">{{ apt.desc }}</p>
          <div class="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
            <span
              v-for="(val, statKey) in apt.mods"
              :key="statKey"
              class="tabular"
              :class="Number(val) < 0 ? 'text-cinnabar' : 'text-azure'"
            >
              {{ formatStatEffect(String(statKey), Number(val)) }}
            </span>
            <span v-if="apt.id === FIRST_LOVE_APTITUDE_ID" class="text-cinnabar font-semibold">
              [Đặc biệt] Khởi đầu có ngay một Đạo Lữ kết duyên đồng hành
            </span>
            <span v-else-if="apt.charmBonus" class="text-cinnabar tabular">
              +{{ Math.round(apt.charmBonus * 100) }}% Duyên tao ngộ đạo lữ
            </span>
          </div>
        </div>
      </div>
      <button
        class="btn-ghost mt-4 w-full"
        :disabled="starting || (rerollsLeft !== null && rerollsLeft <= 0)"
        @click="reroll"
      >
        {{ rerollLabel }}
      </button>
      <p v-if="unlimitedReroll" class="mt-2 text-center text-[11px] text-ink-faint">
        Chưa ưng ý có thể tiếp tục đổi, đổi đến khi xuất hiện linh căn & tư chất bạn mong muốn
      </p>
    </div>

    <div class="grow" />
    <button class="btn-seal mt-8 w-full !py-3 text-[16px]" :disabled="starting" @click="begin">
      {{ starting ? 'ĐANG GIÁM ĐỊNH LINH CĂN……' : 'BƯỚC VÀO TIÊN LỘ' }}
    </button>

    <!-- Hoạt ảnh trắc định linh căn -->
    <SpiritRootReveal ref="revealRef" />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import type { CharacterGender } from '@/types'
  import { rng } from '@/utils/random'
  import { rollLinggen } from '@/core/linggenGen'
  import { rootElements, tendencyLines } from '@/core/linggenAffinity'
  import { randomDaoName } from '@/data/names'
  import { ELEMENTS } from '@/data/linggen'
  import {
    APTITUDE_CATEGORY_NAMES,
    APTITUDE_GRADE_META,
    FIRST_LOVE_APTITUDE_ID,
    aptitudeDef,
    rollAptitudes
  } from '@/data/aptitudes'
  import { initFirstLoveDaolu } from '@/core/daoluService'
  import { displayDaoluName } from '@/ui/displayZhVi'
  import { generateEquipment } from '@/core/equipGen'
  import { acquireEquipment } from '@/core/loot'
  import { trackRealm } from '@/core/progress'
  import { seedLoreIfNeeded } from '@/core/loreService'
  import { equipmentTemplate } from '@/data/equipment'
  import { useGameStore } from '@/stores/game'
  import { usePlayerStore } from '@/stores/player'
  import { useCultivationStore } from '@/stores/cultivation'
  import { useInventoryStore } from '@/stores/inventory'
  import { useUiStore } from '@/stores/ui'
  import GameIcon from '@/components/common/GameIcon.vue'
  import SpiritRootReveal from '@/components/common/SpiritRootReveal.vue'

  const router = useRouter()
  const game = useGameStore()
  const player = usePlayerStore()
  const cultivation = useCultivationStore()
  const inventory = useInventoryStore()
  const ui = useUiStore()

  const name = ref(game.createName || randomDaoName(rng))
  // 刷新既不丢灵根草稿、也不丢手打的道号 —— 同一屏幕的两半不该一个留一个丢。
  // 首次进来若还没草稿,把这次的随机道号也落一份,免得顺手一改就没了
  if (!game.createName) game.setCreateName(name.value)
  watch(name, n => game.setCreateName(n))

  const gender = ref<CharacterGender>(game.createGender || 'male')
  watch(gender, g => game.setCreateGender(g))
  function selectGender(g: CharacterGender): void {
    gender.value = g
  }

  // 建号草稿放在 game store 里持久化:刷新页面既不该白拿一次重掷,也不该洗掉已花掉的次数
  if (!game.createProfile) game.setCreateProfile(rollLinggen(rng))
  const profile = computed(() => game.createProfile!)

  if (!game.createAptitudes || game.createAptitudes.length === 0) {
    const initialApts = rollAptitudes(rng, 3)
    game.setCreateAptitudes(initialApts.map(x => x.id))
  }
  const currentAptitudes = computed(() => {
    return (game.createAptitudes || [])
      .map(id => aptitudeDef(id))
      .filter((x): x is NonNullable<typeof x> => !!x)
  })

  const VI_STAT_MAP: Record<string, string> = {
    cultivationSpeed: 'Tốc độ tu luyện',
    breakthroughRate: 'Tỷ lệ phá cảnh',
    qiRegen: 'Hồi linh khí',
    qiCapPct: 'Giới hạn linh khí',
    expGain: 'Tu vi chiến đấu',
    luck: 'Khí vận',
    eventLuck: 'Cơ duyên may mắn',
    dropRate: 'Rơi trang bị',
    doubleDropRate: 'Tỷ lệ x2 rơi đồ',
    maxHpPct: 'Khí huyết',
    defensePct: 'Phòng ngự',
    attackPct: 'Tấn công',
    damageBonus: 'Tăng uy lực',
    damageReduction: 'Miễn giảm sát thương',
    critRate: 'Tỷ lệ bạo kích',
    critDamage: 'Sát thương bạo kích',
    speed: 'Thân pháp',
    armorPen: 'Phá giáp',
    dodgeRate: 'Né tránh',
    accuracy: 'Chính xác',
    tribulationResist: 'Kháng lôi kiếp',
    regenPerRound: 'Hồi phục/hiệp',
    alchemyYield: 'Đan dược kép',
    forgeDiscount: 'Chiết khấu luyện khí',
    spiritStoneGain: 'Thu hoạch linh thạch',
    lifespanPct: 'Thọ nguyên',
    breakRefund: 'Hoàn trả tu vi',
    comboRate: 'Liên kích',
    comboDamage: 'Uy lực liên kích',
    counterRate: 'Phản kích',
    counterDamage: 'Uy lực phản kích',
    lifesteal: 'Hút máu',
    shieldOnStart: 'Hộ thuẫn vào trận',
    fullHpDamage: 'Tăng thương phong mang',
    lowHpDamage: 'Tăng thương bối thủy',
    lowHpReduction: 'Giảm thương hấp hối',
    shieldPower: 'Tăng thương cương thuẫn',
    overhealShield: 'Hóa thuẫn khi hồi tràn',
    firstStrike: 'Tiên kích hiệp 1',
    stunRate: 'Chấn nhiếp gây choáng',
    executeDamage: 'Sát thương xử quyết'
  }

  function formatStatEffect(key: string, val: number): string {
    const label = VI_STAT_MAP[key] || key
    const sign = val >= 0 ? '+' : ''
    if (key === 'speed') {
      return `${label} ${sign}${Math.round(val)}`
    }
    return `${label} ${sign}${Math.round(val * 100)}%`
  }

  const rerollsLeft = computed(() => game.createRerolls)
  /** 不限次建号:按钮不显示余量,也不会有「刷不动了」的一天 */
  const unlimitedReroll = computed(() => rerollsLeft.value === null)
  const rerollLabel = computed(() =>
    rerollsLeft.value === null ? 'Nghịch Thiên Cải Mệnh' : `Nghịch Thiên Cải Mệnh (còn ${rerollsLeft.value} lần)`
  )
  /** 重掷序号:额度不再是动画的开关,重放掷牌动画要另有一个只增不减的计数器 */
  const rollSeq = ref(0)
  const revealRef = ref<InstanceType<typeof SpiritRootReveal> | null>(null)
  /** 鉴定动画进行中(约 2.6s):防连点导致重复建号、重复发新手馈赠 */
  const starting = ref(false)

  /** 这一世的天然牌面(倾向文案,不含任何数值) */
  const tendencies = computed(() => tendencyLines(rootElements(profile.value.roots)))

  function reroll(): void {
    // 鉴定动画进行中禁止重掷:begin 已按当时的 profile 建号,
    // 此刻重掷改不了已成真身的灵根,只会让展出的牌和角色对不上
    if (starting.value) return
    if (!game.spendCreateReroll()) return
    game.setCreateProfile(rollLinggen(rng))
    const newApts = rollAptitudes(rng, 3)
    game.setCreateAptitudes(newApts.map(x => x.id))
    rollSeq.value += 1
  }

  function randomName(): void {
    name.value = randomDaoName(rng)
  }

  function begin(): void {
    if (starting.value) return
    starting.value = true
    const finalName = name.value.trim().slice(0, 16) || 'Vô Danh Tán Tu'
    player.initCharacter(
      finalName,
      profile.value,
      gender.value,
      currentAptitudes.value.map(x => x.id)
    )
    // Kiểm tra thiên phú đặc biệt: Nhất Kiến Chung Tình
    const hasFirstLove = currentAptitudes.value.some(
      a => a.id === FIRST_LOVE_APTITUDE_ID || a.name === 'Nhất Kiến Chung Tình'
    )
    if (hasFirstLove) {
      const partner = initFirstLoveDaolu(gender.value)
      if (partner) {
        ui.toast(
          `【Nhất Kiến Chung Tình】Ngươi cùng【${displayDaoluName(partner.name)}】vừa gặp đã kết duyên, cùng nhau bước vào tiên lộ!`,
          'rare'
        )
      }
    }
    // 开局馈赠:入门功法 + 一柄竹剑 + 三枚聚气散
    cultivation.learn('m_taixuan')
    cultivation.equipMain('m_taixuan')
    const starter = generateEquipment(1, rng, { slot: 'weapon' })
    acquireEquipment(starter, { quiet: true, forceKeep: true }) // forceKeep:开局馈赠不受自动回收规则影响
    const tpl = equipmentTemplate(starter.templateId)
    if (tpl) inventory.equip(starter.uid, tpl.slot)
    inventory.addPill('p_jvqisan', 3)
    // 开局所知:三张入门丹方与方中药材(见 core/loreService.ts)
    seedLoreIfNeeded()
    game.markStarted()
    trackRealm()
    ui.toast('Mây sâu khó biết chốn, tiên lộ từ đây khởi', 'rare')
    // 灵根鉴定动画:随机闪现所有灵根品阶,最后定格真实灵根(gradeName)
    revealRef.value?.show(profile.value.gradeName, () => {
      void router.push('/')
    })
  }
</script>
