<template>
  <div class="stagger-in space-y-4 px-4 pb-6 pt-4">
    <!-- 未至真仙 -->
    <div v-if="!unlocked" class="card-ink px-6 py-16 text-center">
      <p class="font-kai text-[22px] tracking-[0.4em] text-ink">KHÍ HỒN</p>
      <p class="mt-4 text-[12px] leading-relaxed text-ink-faint">
        Phàm khí chưa trải thiên đạo, lấy đâu ra hình ý.
        <br />
        Tu đến
        <span class="text-cinnabar">Chân Tiên Cảnh</span>
        , mới thấu tỏ lý này.
      </p>
    </div>

    <template v-else>
      <!-- 抬头 -->
      <div class="card-ink flex items-center justify-between gap-2 px-4 py-3">
        <!-- 同洞府:标签写着「天界」,冷启动时也得真的去天界,而不是退出游戏 -->
        <button class="-my-1.5 py-1.5 text-left text-[12px] text-ink-faint" @click="goBack(router, { name: 'celestial' })">← Thiên Giới</button>
        <p class="font-kai text-[15px] tracking-[0.3em] text-ink">KHÍ HỒN</p>
        <div class="text-right">
          <span class="block text-[10px] leading-tight text-ink-faint">Đạo Nguyên</span>
          <span class="block tabular font-kai text-[15px] leading-tight text-cinnabar">{{ formatNum(endgame.daoSource) }}</span>
        </div>
      </div>

      <!-- 何谓器魂 -->
      <section>
        <SectionTitle title="Thế Nào Là Khí Hồn" hint="Hình tiêu ý tồn, thêm một đường đi" />
        <div class="card-ink mt-2 px-4 py-3">
          <p class="text-[11px] leading-relaxed text-ink-faint">
            Pháp khí phàm nhân đến Thiên Giới, phong mang sẽ bị thiên đạo mài giũa vài phần, nhưng không hề san phẳng —— Nó vẫn nhớ pháp khí này theo lối đi nào, phần ký ức đó chính là
            <span class="text-gold-ink">Khí Hồn</span>
            . Khí hồn **xếp chồng** trên người ngươi: Công thủ máu các thuộc tính cơ bản vẫn tính như thường, khí hồn là cho thêm một đường biến chuyển bên trên.
          </p>
          <p class="mt-1.5 text-[11px] leading-relaxed text-ink-faint">
            Lấy phàm khí vào lò, hình tiêu mà ý tồn, thu được một sợi khí hồn. Thần hồn chỉ dung nạp {{ SOUL_SLOTS }} sợi —— Lấy bỏ chính là cấu trúc.
            <span class="text-ink-faint">Đối với việc xếp chồng, thiên đạo tự có ứng đối: Cấu trúc càng dày, lý giải đạo của thủ quan giả càng sâu; cảnh giới chưa bằng giới này còn bị cảnh giới áp chế.</span>
          </p>
        </div>
      </section>

      <!-- 已凝形意 -->
      <section>
        <SectionTitle title="Hình Ý Đã Ngưng" :hint="`${endgame.activeSouls.length} / ${SOUL_SLOTS} sợi`" />
        <div class="mt-2 grid grid-cols-3 gap-2">
          <div
            v-for="i in SOUL_SLOTS"
            :key="i"
            class="card-ink flex min-h-[86px] flex-col items-center justify-center px-2 py-2 text-center"
            :class="endgame.activeSouls[i - 1] ? '' : 'opacity-50'"
          >
            <template v-if="endgame.activeSouls[i - 1]">
              <span class="font-kai text-[20px] leading-none" :style="{ color: soulColor(endgame.activeSouls[i - 1]!) }">
                {{ translateSoulSeal(soulSeal(endgame.activeSouls[i - 1]!)) }}
              </span>
              <span class="mt-1 text-[10px] leading-tight text-ink-soft">{{ soulLabel(endgame.activeSouls[i - 1]!) }}</span>
              <!-- 纯文字按钮只有字体那 15px 高;补成内联块给拇指一个 30px 的靶面 -->
              <button
                class="mt-1 inline-block px-2 py-2 text-[10px] text-ink-faint underline"
                @click="removeSoul(endgame.activeSouls[i - 1]!.uid)"
              >
                Tháo
              </button>
            </template>
            <span v-else class="text-[10px] text-ink-faint">Trống</span>
          </div>
        </div>
        <p v-if="activeModText" class="mt-2 px-1 text-[10px] leading-relaxed text-gold-ink">Tổng cộng: {{ activeModText }}</p>
      </section>

      <!-- 两处入口 -->
      <section class="space-y-2">
        <button
          class="card-ink flex w-full items-center justify-between gap-3 px-4 py-3 text-left active:scale-98"
          @click="idleOpen = true"
        >
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-violet-ink/85 font-kai text-[19px] text-paper">Ý</span>
          <span class="min-w-0 flex-1">
            <span class="block font-kai text-[14px] tracking-widest text-ink">Hình Ý Nhàn Rỗi</span>
            <span class="block truncate text-[10px] leading-relaxed text-ink-faint">
              {{ idleSouls.length > 0 ? `${idleSouls.length} sợi chờ dùng · Trang bị hoặc giải tán` : 'Tạm không có khí hồn nhàn rỗi' }}
            </span>
          </span>
          <span class="shrink-0 text-[12px] text-ink-faint">›</span>
        </button>

        <button
          class="card-ink flex w-full items-center justify-between gap-3 px-4 py-3 text-left active:scale-98"
          @click="forgeOpen = true"
        >
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-cinnabar/85 font-kai text-[19px] text-paper">Luyện</span>
          <span class="min-w-0 flex-1">
            <span class="block font-kai text-[14px] tracking-widest text-ink">Đài Ngưng Luyện</span>
            <span class="block truncate text-[10px] leading-relaxed text-ink-faint">
              {{ refinable.length > 0 ? `${refinable.length} kiện có thể ngưng · Đạo Nguyên ${SOUL_REFINE_COST}/món` : 'Trong hành nang không có pháp khí có thể ngưng' }}
            </span>
          </span>
          <span class="shrink-0 text-[12px] text-ink-faint">›</span>
        </button>
      </section>
    </template>

    <!-- 散置形意 -->
    <BaseModal :open="idleOpen" title="Hình Ý Nhàn Rỗi" @close="idleOpen = false">
      <!-- 散去一无所得:原器早毁,道源也不返 —— 这句得在动手之前看见,不能等散了才发现 -->
      <p class="mb-2 text-[10px] leading-relaxed text-ink-faint">{{ translateDissolveNote(dissolveNote()) }}</p>
      <div v-if="idleSouls.length > 0" class="card-ink max-h-64 divide-y divide-ink/6 overflow-y-auto px-4">
        <div v-for="soul in idleSouls" :key="soul.uid" class="flex items-center justify-between gap-2 py-2.5">
          <div class="min-w-0">
            <p class="truncate text-[12px]" :style="{ color: soulColor(soul) }">{{ soulLabel(soul) }}</p>
            <p class="text-[10px] text-ink-faint">Ngưng từ「{{ soul.fromName }}」 · {{ soulModText(soul) }}</p>
          </div>
          <!-- 灵魂列表靠持有才渲染,巡页夹具无灵魂时这些钮根本不存在 —— 以前的 28px 尺子碰不到它。
               !py-1 盒高约 21px;统一 !py-2 抬到 35px,与同行其它确认态按钮同高 -->
          <div class="flex shrink-0 gap-1">
            <button class="btn-ghost !px-2.5 !py-2 !text-[11px]" @click="wearSoul(soul.uid)">Trang bị</button>
            <template v-if="pendingDissolveUid !== soul.uid">
              <button class="btn-ghost !px-2 !py-2 !text-[11px] !text-ink-faint" @click="pendingDissolveUid = soul.uid">Giải tán</button>
            </template>
            <template v-else>
              <button class="btn-seal !px-2 !py-2 !text-[11px]" @click="doDissolve(soul.uid)">Chắc chắn</button>
              <button class="btn-ghost !px-2 !py-2 !text-[11px]" @click="pendingDissolveUid = null">Hủy</button>
            </template>
          </div>
        </div>
      </div>
      <p v-else class="px-4 py-6 text-center text-[11px] leading-relaxed text-ink-faint">
        Không có hình ý nhàn rỗi.
        <br />
        <span class="text-[10px]">Khí hồn ngưng ra nếu đã trang bị hết thì nơi này sẽ trống</span>
      </p>
      <template #footer>
        <button class="btn-seal w-full" @click="idleOpen = false">Thu Lại</button>
      </template>
    </BaseModal>

    <!-- 凝炼台 -->
    <BaseModal :open="forgeOpen" title="Đài Ngưng Luyện" @close="forgeOpen = false">
      <!-- 代价与余额同屏给出 —— 弹窗盖住页面标题栏(道源在那上),不点开不知道还够不够 -->
      <p class="mb-2 text-[11px] leading-relaxed text-ink-faint">{{ translateRefineCostLine(refineCostLine(SOUL_REFINE_COST, formatNum(endgame.daoSource))) }}</p>
      <div v-if="refinable.length > 0" class="card-ink max-h-64 divide-y divide-ink/6 overflow-y-auto px-4">
        <div v-for="row in refinable" :key="row.inst.uid" class="flex items-center justify-between gap-2 py-2.5">
          <div class="min-w-0">
            <p class="truncate text-[12px] text-ink-soft">{{ row.name }}</p>
            <p class="truncate text-[10px] text-ink-faint">
              Sẽ ngưng ra
              <span :style="{ color: soulGradeDef(row.gradeRank).color }">{{ translateGradeName(soulGradeDef(row.gradeRank).name) }} · {{ row.typeName }}</span>
            </p>
          </div>
          <!-- 入炉二步确认:毁的是原器,不按一个「入 炉」就直接交代了 -->
          <button
            v-if="pendingRefineUid !== row.inst.uid"
            class="btn-ghost !px-3 !py-2 !text-[11px]"
            @click="pendingRefineUid = row.inst.uid"
          >
            Vào Lò
          </button>
          <div v-else class="flex shrink-0 items-center gap-1.5">
            <button class="btn-seal !px-2.5 !py-2 !text-[11px]" @click="doRefine(row.inst.uid)">Ngưng Luyện</button>
            <button class="btn-ghost !px-2.5 !py-2 !text-[11px]" @click="pendingRefineUid = null">Hủy</button>
          </div>
        </div>
      </div>
      <p v-else class="px-4 py-6 text-center text-[11px] leading-relaxed text-ink-faint">
        Trong hành nang không có pháp khí có thể ngưng.
        <br />
        <span class="text-[10px]">Pháp khí đã mặc, đã khóa, hoặc không có từ điều nào đều không vào lò được</span>
      </p>
      <template #footer>
        <button class="btn-seal w-full" @click="forgeOpen = false">Thu Lò</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { goBack } from '@/router/goBack'
  import { formatNum } from '@/utils/format'
  import { modsText } from '@/ui/statNames'
  import { dissolveNote, refineCostLine } from '@/ui/soulText'
  import { equipmentTemplate } from '@/data/equipment'
  import { SOUL_SLOTS, soulGradeDef, soulMods, soulName, soulTypeDef, type SoulInstance } from '@/data/souls'
  import { canRefine, dissolveSoul, previewSoul, refineEquipment, removeSoul, SOUL_REFINE_COST, wearSoul } from '@/core/soulService'
  import { endgameUnlocked } from '@/core/endgameService'
  import { useEndgameStore } from '@/stores/endgame'
  import { useInventoryStore } from '@/stores/inventory'
  import SectionTitle from '@/components/common/SectionTitle.vue'
  import BaseModal from '@/components/common/BaseModal.vue'

  const router = useRouter()
  const endgame = useEndgameStore()
  const inventory = useInventoryStore()

  const unlocked = computed(() => endgameUnlocked())
  const idleOpen = ref(false)
  const forgeOpen = ref(false)
  /** 等待二次确认的行(uid);非 null 表示该行已展开确认态 */
  const pendingRefineUid = ref<string | null>(null)
  /** 散去形意同样二步确认:器魂是花道源与一件法器凝出来的,一脚碎掉连个反悔都没有 */
  const pendingDissolveUid = ref<string | null>(null)

  const SOUL_GRADE_NAMES_VN: Record<string, string> = {
    '微茫': 'Vi Mang',
    '微光': 'Vi Quang',
    '流萤': 'Lưu Huỳnh',
    '辉映': 'Huy Ánh',
    '灼目': 'Chước Mục',
    '通玄': 'Thông Huyền'
  }

  const SOUL_TYPE_NAMES_VN: Record<string, string> = {
    '锋魂': 'Phong Hồn',
    '盾魂': 'Thuẫn Hồn',
    '棘魂': 'Cức Hồn',
    '连魂': 'Liên Hồn',
    '泽魂': 'Trạch Hồn',
    '背魂': 'Bối Hồn',
    '器魂': 'Khí Hồn'
  }

  const SOUL_SEALS_VN: Record<string, string> = {
    '锋': 'Phong',
    '盾': 'Thuẫn',
    '棘': 'Cức',
    '连': 'Liên',
    '泽': 'Trạch',
    '背': 'Bối'
  }

  function translateGradeName(name: string): string {
    return SOUL_GRADE_NAMES_VN[name] ?? name
  }

  function translateSoulName(raw: string): string {
    const parts = raw.split('·')
    if (parts.length === 2) {
      const grade = SOUL_GRADE_NAMES_VN[parts[0]!] ?? parts[0]!
      const type = SOUL_TYPE_NAMES_VN[parts[1]!] ?? parts[1]!
      return `${grade} · ${type}`
    }
    return raw
  }

  function translateSoulSeal(seal: string): string {
    return SOUL_SEALS_VN[seal] ?? seal
  }

  function translateDissolveNote(_note: string): string {
    return 'Giải tán không thể vãn hồi: Hình ý trả về thiên địa, đạo nguyên không trả lại'
  }

  function translateRefineCostLine(_line: string): string {
    return `Vào lò liền hủy khí vật ban đầu, tiêu hao Đạo Nguyên ${SOUL_REFINE_COST}, Đạo Nguyên hiện có ${formatNum(endgame.daoSource)}`
  }

  /** 二步确认后真正入炉;成败都收起确认态(失败如道源不足也让玩家重挑) */
  function doRefine(uid: string): void {
    refineEquipment(uid)
    pendingRefineUid.value = null
  }

  /** 二步确认后真正散去形意;散去不可逆,成功后收拢确认态 */
  function doDissolve(uid: string): void {
    dissolveSoul(uid)
    pendingDissolveUid.value = null
  }

  /** 未装配的器魂 */
  const idleSouls = computed(() => endgame.soulList.filter(s => !endgame.activeSouls.some(a => a.uid === s.uid)))

  /** 可入炉的法器:未锁定、未穿戴、且确有形意可存 */
  const refinable = computed(() => {
    const wearing = new Set(Object.values(inventory.equipped).filter((v): v is string => typeof v === 'string'))
    return inventory.items
      .filter(it => !it.locked && !wearing.has(it.uid) && canRefine(it))
      .map(inst => {
        const preview = previewSoul(inst)
        return {
          inst,
          name: equipmentTemplate(inst.templateId)?.name ?? 'Pháp khí vô danh',
          typeName: SOUL_TYPE_NAMES_VN[preview.type?.name ?? ''] ?? preview.type?.name ?? 'Khí Hồn',
          gradeRank: preview.gradeRank
        }
      })
  })

  function soulLabel(soul: SoulInstance): string {
    return translateSoulName(soulName(soul))
  }
  function soulSeal(soul: SoulInstance): string {
    const raw = soulTypeDef(soul.type)?.seal
    return (raw ? SOUL_SEALS_VN[raw] ?? raw : 'Hồn')
  }
  function soulColor(soul: SoulInstance): string {
    return soulGradeDef(soul.grade).color
  }
  function soulModText(soul: SoulInstance): string {
    return modsText(soulMods(soul))
  }
  /** 已装配器魂的合计词条 */
  const activeModText = computed(() => modsText(endgame.soulMods))
</script>
