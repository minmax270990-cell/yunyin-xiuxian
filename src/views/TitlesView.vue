<template>
  <div class="stagger-in space-y-4 px-4 pb-6 pt-4">
    <!-- 页签 -->
    <InkTabs v-model="tab" :tabs="TABS" />

    <!-- 名号:成就式列表,全量陈列 -->
    <template v-if="tab === 'title'">
      <SectionTitle title="Danh Hiệu" :hint="`${ownedCount}/${TITLES.length} · Đeo một danh hiệu`" />
      <div class="card-ink divide-y divide-ink/6 px-4">
        <div v-for="row in titleRows" :key="row.def.id" class="flex items-center gap-3 py-2.5">
          <span
            class="grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-kai"
            :class="
              row.worn ? 'border-cinnabar text-cinnabar' : row.owned ? 'border-gold-ink text-gold-ink' : 'border-ink/15 text-ink-faint'
            "
          >
            {{ row.worn ? 'Đeo' : row.owned ? 'Có' : 'Chưa' }}
          </span>
          <div class="min-w-0 grow">
            <p class="font-kai text-[13px]" :class="row.owned ? 'text-ink' : 'text-ink-faint'">{{ displayTitleName(row.def.name) }}</p>
            <p class="truncate text-[10px] text-ink-faint">{{ displayTitleDesc(row.def.desc) }}</p>
            <p v-if="!row.owned && row.source" class="truncate text-[10px] text-ink-faint">Nguồn gốc: {{ translateDirection(row.source) }}</p>
            <p v-if="row.owned && row.modText" class="truncate text-[10px] text-azure tabular" :title="displayModsText(row.modText)">{{ displayModsText(row.modText) }}</p>
          </div>
          <button v-if="row.owned" class="btn-ghost shrink-0 !px-2.5 !py-2 !text-[11px]" @click="toggleTitle(row.def.id)">
            {{ row.worn ? 'Tháo' : 'Đeo' }}
          </button>
        </div>
      </div>
    </template>

    <!-- 灵兽:同样的列表式 -->
    <template v-else>
      <SectionTitle title="Linh Thú" :hint="`${petRows.length}/${PETS.length} · Đồng hành một con`" />
      <div v-if="petRows.length" class="space-y-2">
        <div
          v-for="row in petRows"
          :key="row.def.id"
          class="card-ink flex items-center gap-2.5 px-4 py-2.5"
        >
          <!-- 灵兽印章:从一行小图标长成一块色底印章;相伴时转玉色光晕 -->
          <span
            class="grid h-10 w-10 shrink-0 place-items-center rounded-md transition-colors"
            :class="row.active ? 'bg-jade/10 text-jade' : 'bg-ink/5 text-ink-soft'"
          ><GameIcon :name="beastIcon(row.def.family)" :size="20" /></span>
          <div class="min-w-0 grow">
            <p class="flex flex-wrap items-center gap-1.5">
              <span class="truncate font-kai text-[13px]" :style="{ color: qualityDef(row.def.quality).color }">{{ row.def.name }}</span>
              <span class="shrink-0 rounded bg-ink/6 px-1.5 py-0.5 text-[10px]" :style="{ color: qualityDef(row.def.quality).color }">{{ qualityName(row.def.quality) }}</span>
              <span v-if="row.active" class="shrink-0 rounded bg-jade/15 px-1.5 py-0.5 text-[10px] text-jade">Đồng hành</span>
            </p>
            <p class="truncate text-[10px] text-ink-faint">{{ row.def.desc }}</p>
            <p v-if="row.modText" class="text-[10px] text-azure tabular">{{ displayModsText(row.modText) }}</p>
            <!-- 性格是灵兽的"人味":它在历练里怎么表现,得让玩家看得见,而不是只看数值 -->
            <p class="text-[10px] text-violet-ink">
              {{ row.personalityName }} · <span class="text-ink-faint">{{ row.personalityDesc }}</span>
            </p>
            <!-- 定性的话之外还要给数:换不换这只伙伴,靠「更容易」三个字算不出来 -->
            <p v-if="row.traitText" class="text-[10px] text-azure tabular">{{ translateTraitText(row.traitText) }}</p>
          </div>
          <button class="btn-ghost shrink-0 !px-2.5 !py-2 !text-[11px]" @click="togglePet(row.def.id)">
            {{ row.active ? 'Tạm Biệt' : 'Gọi Đến' }}
          </button>
        </div>
      </div>
      <p v-else class="card-ink px-4 py-6 text-center">
        <span class="empty-seal" aria-hidden="true">Thú</span>
        <span class="mt-2.5 block font-kai text-[12px] tracking-[0.2em] text-ink-soft">Chưa có linh thú đồng hành</span>
        <span class="mt-1 block text-[10px] leading-relaxed text-ink-faint">Linh thú phần lớn kết duyên qua kỳ ngộ lịch luyện</span>
      </p>
      <!-- 集齐路上的念想:还差几只、去哪找,一句带过 -->
      <p v-if="petRows.length > 0 && petRows.length < PETS.length" class="mt-2.5 text-center text-[10px] text-ink-faint">
        Còn {{ PETS.length - petRows.length }} linh thú phân tán trong kỳ ngộ lịch luyện —— Kết duyên liền về sách này
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { usePlayerStore } from '@/stores/player'
  import { useUiStore } from '@/stores/ui'
  import { useQuestsStore } from '@/stores/quests'
  import { TITLES } from '@/data/titles'
  import { ACHIEVEMENTS } from '@/data/achievements'
  import { achievementDirection } from '@/ui/achievementHint'
  import { petDef, PETS } from '@/data/pets'
  import { beastIcon } from '@/data/beastFamilies'
  import { PERSONALITY_NAMES, personalityDesc } from '@/core/petPersonality'
  import { petTraitText } from '@/ui/itemText'
  import { qualityDef } from '@/data/qualities'
  import { modsText } from '@/ui/statNames'
  import { displayTitleName, displayTitleDesc, displayModsText } from '@/ui/displayZhVi'
  import type { PetDef, QualityId } from '@/types'
  import SectionTitle from '@/components/common/SectionTitle.vue'
  import InkTabs from '@/components/common/InkTabs.vue'
  import GameIcon from '@/components/common/GameIcon.vue'

  const player = usePlayerStore()
  const quests = useQuestsStore()
  const ui = useUiStore()

  type Tab = 'title' | 'pet'
  const tab = ref<Tab>('title')
  const TABS: { id: Tab; label: string }[] = [
    { id: 'title', label: 'Danh Hiệu' },
    { id: 'pet', label: 'Linh Thú' }
  ]

  const QUALITY_NAMES_VN: Record<string, string> = {
    mortal: 'Phàm phẩm',
    fine: 'Lương phẩm',
    excellent: 'Tinh phẩm',
    spirit: 'Linh phẩm',
    profound: 'Huyền phẩm',
    earth: 'Địa phẩm',
    heaven: 'Thiên phẩm',
    immortal: 'Tiên phẩm',
    divine: 'Thần phẩm'
  }

  function qualityName(id: QualityId): string {
    return QUALITY_NAMES_VN[id] ?? qualityDef(id).name
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

  const PERSONALITY_NAMES_VN: Record<PetDef['personality'], string> = {
    greedy: 'Tham Bảo',
    steady: 'Trầm Ổn',
    fierce: 'Hiếu Chiến',
    cautious: 'Cẩn Trọng'
  }

  const PERSONALITY_DESC_VN: Record<PetDef['personality'], string> = {
    greedy: 'Tham đồ bảo vật, gặp hiểm nguy hơi cao, trang bị phẩm chất tốt hơn.',
    steady: 'Hành lộ thong dong, hành trình lâu hơn như chậm bước ngắm núi, gặp hiểm nguy hơi thấp, bại trận đôi khi có bảo hộ.',
    fierce: 'Tranh phong chẳng nhượng, gặp hiểm nguy cao hơn, trang bị phẩm chất tốt hơn.',
    cautious: 'Từng bước biết dừng, hành trình hơi ngắn chẳng dám lưu lâu, gặp hiểm nguy hơi thấp, trang bị phẩm chất hơi giảm, bại trận thêm phần bảo hộ.'
  }

  function translateTraitText(text: string): string {
    return text
      .replace(/历练时长/g, 'Thời gian lịch luyện')
      .replace(/遇险/g, 'Gặp hiểm nguy')
      .replace(/掉落气运/g, 'Khí vận rơi đồ')
      .replace(/战败率/g, 'Tỷ lệ chiến bại')
  }

  // ---- 名号 ----
  const ownedCount = computed(() => quests.titlesOwned.length)

  /** 名号由成就解锁:为未获得的称号补一句「从哪来」,方向自动随条件走,不剧透成就名 */
  const TITLE_SOURCE: Record<string, string> = {}
  for (const a of ACHIEVEMENTS) {
    if (a.reward?.titleId) TITLE_SOURCE[a.reward.titleId] = achievementDirection(a.cond)
  }

  /** 全量陈列:佩戴中 > 已拥有 > 未获得 */
  const titleRows = computed(() => {
    const ownedSet = new Set(quests.titlesOwned)
    return TITLES.map(def => ({
      def,
      owned: ownedSet.has(def.id),
      worn: player.titleId === def.id,
      modText: modsText(def.mods ?? {}),
      source: ownedSet.has(def.id) ? '' : TITLE_SOURCE[def.id] ?? ''
    })).sort((a, b) => Number(b.worn) - Number(a.worn) || Number(b.owned) - Number(a.owned))
  })

  function toggleTitle(id: string): void {
    const def = TITLES.find(t => t.id === id)
    const wearing = player.titleId === id
    player.setTitle(wearing ? null : id)
    // 佩戴/卸下都得有回响:顶栏只换了个名,名号还得当场说一句(与唤来灵兽对称)
    if (def) ui.toast(wearing ? `Tháo xuống「${displayTitleName(def.name)}」—— Danh hiệu giấu mũi nhọn` : `Đeo lên「${displayTitleName(def.name)}」`, 'info')
  }

  // ---- 灵兽 ----
  const petRows = computed(() =>
    quests.collections.pet
      .map(id => petDef(id))
      .filter(def => def !== undefined)
      .map(def => ({
        def: def!,
        active: player.petId === def!.id,
        // 出战加成按「真到账」那份渲染(× 灵兽园等级 × 安抚增益),与角色面板来源明细一致,不能给 base
        modText: modsText(player.petModsFor(def!)),
        personalityName: PERSONALITY_NAMES_VN[def!.personality] ?? PERSONALITY_NAMES[def!.personality],
        personalityDesc: PERSONALITY_DESC_VN[def!.personality] ?? personalityDesc(def!.personality),
        traitText: petTraitText(def!)
      }))
      .sort((a, b) => Number(b.active) - Number(a.active))
  )

  function togglePet(id: string): void {
    const def = petDef(id)
    const active = player.petId === id
    player.setPet(active ? null : id)
    // 唤来要听得见回响:顶栏只换了个名,性格那句跟脚(它管历练怎么表现)得当场说一句
    if (def) {
      if (active) ui.toast(`「${def.name}」đã tạm biệt —— Nó đang đợi ngươi ở Linh Thú Viên`, 'info')
      else ui.toast(`Gọi đến「${def.name}」—— ${PERSONALITY_DESC_VN[def.personality] ?? personalityDesc(def.personality)}`, 'info')
    }
  }
</script>
