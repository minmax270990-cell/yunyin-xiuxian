<template>
  <BaseModal :open="open" title="Thiên Đạo Phủ · Quyền Admin" wide @close="emit('close')">
    <!-- Màn hình xác thực mật khẩu -->
    <div v-if="!isAuthenticated" class="space-y-4 py-2">
      <div class="rounded-lg border border-cinnabar/30 bg-cinnabar/5 p-3.5 text-center">
        <p class="font-kai text-[15px] text-cinnabar">Xác Thực Quản Trị Viên</p>
        <p class="mt-1 text-[11px] leading-relaxed text-ink-faint">
          Khu vực quản trị chỉ dành cho người chấp chưởng thiên đạo. Vui lòng nhập mật khẩu quản trị để mở quyền can thiệp thiên quy.
        </p>
      </div>

      <div class="space-y-2">
        <label class="block text-[11px] font-medium text-ink-soft">Mật khẩu Quản Trị (Admin)</label>
        <div class="flex gap-2">
          <input
            v-model="passwordInput"
            type="password"
            placeholder="Nhập mật khẩu..."
            class="grow rounded-md border border-ink/20 bg-paper-deep/70 px-3 py-2 text-[13px] text-ink placeholder-ink-faint/60 focus:border-cinnabar focus:outline-none"
            @keyup.enter="handleLogin"
          />
          <button class="btn-seal !px-4 shrink-0" @click="handleLogin">
            Mở Quyền
          </button>
        </div>
        <p v-if="authError" class="text-[11px] text-cinnabar">{{ authError }}</p>
      </div>
    </div>

    <!-- Bảng điều khiển Admin khi đã xác thực -->
    <div v-else class="space-y-4 py-1 text-[11px]">
      <!-- Thanh trạng thái và nút khóa -->
      <div class="flex items-center justify-between rounded-md border border-jade/40 bg-jade/5 px-3 py-2">
        <span class="flex items-center gap-1.5 text-jade">
          <span class="h-2 w-2 rounded-full bg-jade animate-pulse" />
          <span class="font-kai text-[12px]">Quyền Admin Đang Kích Hoạt</span>
        </span>
        <button class="btn-ghost !py-1 !px-2.5 !text-[10px] text-ink-faint" @click="lockAdmin">
          Khóa Lại
        </button>
      </div>

      <!-- Phân mục Tabs -->
      <div class="flex flex-wrap gap-1 border-b border-ink/10 pb-2">
        <button
          v-for="t in TABS"
          :key="t.id"
          class="rounded px-2.5 py-1 text-[11px] transition-all"
          :class="currentTab === t.id ? 'bg-ink text-paper' : 'bg-paper-deep/80 text-ink-faint hover:text-ink'"
          @click="currentTab = t.id"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- TAB 1: Linh Thạch & Linh Khí & Tu Vi -->
      <div v-if="currentTab === 'basic'" class="space-y-3">
        <!-- Linh Thạch -->
        <div class="card-ink p-3 space-y-2">
          <div class="flex justify-between items-center">
            <span class="font-kai text-[13px] text-ink">Linh Thạch</span>
            <span class="tabular text-[11px] text-cinnabar">Hiện có: {{ formatGN(resources.spiritStone) }}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addStoneNum(100000)">+10 Vạn</button>
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addStoneNum(1000000)">+100 Vạn</button>
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addStoneNum(10000000)">+1000 Vạn</button>
            <button class="btn-seal !py-1.5 text-[11px]" @click="addStoneNum(100000000)">+1 Ức</button>
          </div>
        </div>

        <!-- Linh Khí -->
        <div class="card-ink p-3 space-y-2">
          <div class="flex justify-between items-center">
            <span class="font-kai text-[13px] text-ink">Linh Khí</span>
            <span class="tabular text-[11px] text-azure">Hiện có: {{ Math.floor(resources.qi) }} / {{ Math.floor(player.qiCapValue) }}</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addQiAmount(10000)">+10.000 Linh Khí</button>
            <button class="btn-seal !py-1.5 text-[11px]" @click="fillQi">Hồi Đầy Linh Khí (Tích Lũy)</button>
          </div>
        </div>

        <!-- Tu Vi (Exp) -->
        <div class="card-ink p-3 space-y-2">
          <div class="flex justify-between items-center">
            <span class="font-kai text-[13px] text-ink">Tu Vi Cảnh Giới</span>
            <span class="tabular text-[11px] text-gold-ink">Hiện có: {{ formatGN(player.exp) }} / {{ formatGN(player.expReq) }}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addExpNum(100000)">+10 Vạn</button>
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addExpNum(1000000)">+100 Vạn</button>
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addExpNum(10000000)">+1000 Vạn</button>
            <button class="btn-seal !py-1.5 text-[11px]" @click="fillExp">Đầy Tu Vi Cảnh Giới</button>
          </div>
        </div>

        <!-- Tiện Ích Đột Phá -->
        <div class="card-ink p-3 space-y-2">
          <span class="font-kai text-[13px] text-ink">Hỗ Trợ Tiến Giai</span>
          <p class="text-[10px] text-ink-faint">Lập tức chuẩn bị đầy đủ tu vi và linh khí cần thiết cho đột phá cảnh giới</p>
          <button class="btn-seal w-full !py-2 text-[11px]" @click="readyBreakthrough">
            Chuẩn Bị Sẵn Sàng Đột Phá (Đầy Tu Vi & Linh Khí)
          </button>
        </div>
      </div>

      <!-- TAB 2: Vật Liệu & Tài Nguyên Nhỏ -->
      <div v-if="currentTab === 'materials'" class="space-y-3">
        <!-- Tàn Trang Công Pháp -->
        <div class="card-ink p-3 space-y-1.5">
          <div class="flex justify-between items-center">
            <span class="font-kai text-[13px] text-ink">Tàn Trang Công Pháp</span>
            <span class="tabular text-[11px] text-ink-faint">Hiện có: {{ resources.page }}</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addSmallRes('page', 20)">+20 Trang</button>
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addSmallRes('page', 100)">+100 Trang</button>
            <button class="btn-seal !py-1.5 text-[11px]" @click="addSmallRes('page', 500)">+500 Trang</button>
          </div>
        </div>

        <!-- Huyền Thiết -->
        <div class="card-ink p-3 space-y-1.5">
          <div class="flex justify-between items-center">
            <span class="font-kai text-[13px] text-ink">Huyền Thiết</span>
            <span class="tabular text-[11px] text-ink-faint">Hiện có: {{ resources.ore }}</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addSmallRes('ore', 50)">+50</button>
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addSmallRes('ore', 200)">+200</button>
            <button class="btn-seal !py-1.5 text-[11px]" @click="addSmallRes('ore', 1000)">+1000</button>
          </div>
        </div>

        <!-- Khí Linh Trần -->
        <div class="card-ink p-3 space-y-1.5">
          <div class="flex justify-between items-center">
            <span class="font-kai text-[13px] text-ink">Khí Linh Trần</span>
            <span class="tabular text-[11px] text-ink-faint">Hiện có: {{ resources.dust }}</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addSmallRes('dust', 50)">+50</button>
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addSmallRes('dust', 200)">+200</button>
            <button class="btn-seal !py-1.5 text-[11px]" @click="addSmallRes('dust', 1000)">+1000</button>
          </div>
        </div>

        <!-- Điểm Ngộ Đạo -->
        <div class="card-ink p-3 space-y-1.5">
          <div class="flex justify-between items-center">
            <span class="font-kai text-[13px] text-ink">Điểm Ngộ Đạo</span>
            <span class="tabular text-[11px] text-ink-faint">Hiện có: {{ resources.wudao }}</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addSmallRes('wudao', 20)">+20 Điểm</button>
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addSmallRes('wudao', 100)">+100 Điểm</button>
            <button class="btn-seal !py-1.5 text-[11px]" @click="addSmallRes('wudao', 500)">+500 Điểm</button>
          </div>
        </div>

        <!-- Đạo Quả & Túc Tuệ -->
        <div class="card-ink p-3 space-y-1.5">
          <div class="flex justify-between items-center">
            <span class="font-kai text-[13px] text-ink">Đạo Quả & Túc Tuệ (Luân Hồi)</span>
            <span class="tabular text-[11px] text-violet-ink">Đạo quả: {{ player.reincarnation.daoFruit }} · Túc tuệ: {{ player.reincarnation.insight }}</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addDaoFruit(10)">+10 Đạo Quả</button>
            <button class="btn-seal !py-1.5 text-[11px]" @click="addDaoFruit(50)">+50 Đạo Quả</button>
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addInsight(20)">+20 Túc Tuệ</button>
            <button class="btn-seal !py-1.5 text-[11px]" @click="addInsight(100)">+100 Túc Tuệ</button>
          </div>
        </div>
      </div>

      <!-- TAB 3: Linh Thảo -->
      <div v-if="currentTab === 'herbs'" class="space-y-3">
        <div class="card-ink p-3">
          <p class="font-kai text-[13px] text-ink">Linh Thảo Các Phẩm Cấp</p>
          <p class="mt-0.5 text-[10px] text-ink-faint">Kho tổng: {{ resources.herb }} cây</p>
          <div class="mt-3 space-y-2">
            <div
              v-for="g in HERB_GRADES"
              :key="g"
              class="flex items-center justify-between rounded bg-paper-deep/50 px-2.5 py-1.5"
            >
              <span class="font-kai text-ink-soft">{{ HERB_GRADE_NAMES[g] }} (Cấp {{ g }})</span>
              <div class="flex items-center gap-2">
                <span class="tabular text-ink-faint">Hiện có: {{ resources.herbOf(g) }}</span>
                <button class="btn-ghost !py-1 !px-2 text-[10px]" @click="resources.addHerb(g, 50)">+50</button>
                <button class="btn-seal !py-1 !px-2 text-[10px]" @click="resources.addHerb(g, 200)">+200</button>
              </div>
            </div>
          </div>
          <div class="mt-3 pt-2 border-t border-ink/10">
            <button class="btn-seal w-full !py-2 text-[12px]" @click="addAllHerbs(100)">
              Nhận Tất Cả Linh Thảo (+100 Mỗi Phẩm Cấp)
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 4: Đan Dược & Linh Dược -->
      <div v-if="currentTab === 'pills'" class="space-y-3">
        <!-- Đan Dược -->
        <div class="card-ink p-3 space-y-2">
          <p class="font-kai text-[13px] text-ink">Gói Đan Dược</p>
          <p class="text-[10px] text-ink-faint">Bao gồm toàn bộ 72 loại đan dược trong thiên hạ</p>
          <div class="grid grid-cols-2 gap-2">
            <button class="btn-ghost !py-2 text-[11px]" @click="addAllPills(5)">
              Nhận Tất Cả (+5 mỗi loại)
            </button>
            <button class="btn-seal !py-2 text-[11px]" @click="addAllPills(20)">
              Nhận Tất Cả (+20 mỗi loại)
            </button>
          </div>
        </div>

        <!-- Tri Thức & Đan Phương -->
        <div class="card-ink p-3 space-y-2">
          <p class="font-kai text-[13px] text-ink">Tri Thức Luyện Đan & Linh Dược</p>
          <p class="text-[10px] text-ink-faint">Mở khóa toàn bộ đan phương và nhận thức linh dược</p>
          <div class="space-y-2">
            <button class="btn-ghost w-full !py-2 text-[11px]" @click="unlockAllRecipes">
              Khai Mở Toàn Bộ Đan Phương Luyện Đan (100% Thuần Thục)
            </button>
            <button class="btn-seal w-full !py-2 text-[11px]" @click="unlockAllMaterials">
              Thông Hiểu Toàn Bộ Dược Tính Linh Dược (Tối Đa 3 Tầng)
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 5: Tùy Chỉnh Tự Do -->
      <div v-if="currentTab === 'custom'" class="card-ink p-3 space-y-3">
        <p class="font-kai text-[13px] text-ink">Nhập Tùy Chỉnh Số Lượng</p>
        <div class="space-y-2">
          <div>
            <label class="block text-[10px] text-ink-faint mb-1">Loại tài nguyên</label>
            <select
              v-model="customType"
              class="w-full rounded border border-ink/20 bg-paper-deep/70 px-2.5 py-1.5 text-[12px] text-ink focus:border-cinnabar focus:outline-none"
            >
              <option value="stone">Linh Thạch</option>
              <option value="exp">Tu Vi</option>
              <option value="qi">Linh Khí</option>
              <option value="page">Tàn Trang Công Pháp</option>
              <option value="ore">Huyền Thiết</option>
              <option value="dust">Khí Linh Trần</option>
              <option value="wudao">Điểm Ngộ Đạo</option>
              <option value="daoFruit">Đạo Quả</option>
              <option value="insight">Túc Tuệ</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] text-ink-faint mb-1">Số lượng</label>
            <input
              v-model.number="customAmount"
              type="number"
              min="1"
              placeholder="Nhập số lượng..."
              class="w-full rounded border border-ink/20 bg-paper-deep/70 px-2.5 py-1.5 text-[12px] text-ink focus:border-cinnabar focus:outline-none"
            />
          </div>
          <button class="btn-seal w-full !py-2 text-[12px]" @click="applyCustom">
            Xác Nhận Kích Hoạt Nhận
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <button class="btn-seal w-full" @click="emit('close')">Đóng</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import BaseModal from '@/components/common/BaseModal.vue'
  import { useResourcesStore } from '@/stores/resources'
  import { usePlayerStore } from '@/stores/player'
  import { useInventoryStore } from '@/stores/inventory'
  import { useLoreStore } from '@/stores/lore'
  import { useUiStore } from '@/stores/ui'
  import { gn } from '@/utils/gnum'
  import { formatGN } from '@/utils/format'
  import { HERB_GRADES, type HerbGrade } from '@/data/herbGrades'
  import { PILLS } from '@/data/pills'
  import { MATERIALS } from '@/data/materials'
  import { QI_BANK_MULT } from '@/data/constants'

  defineProps<{
    open: boolean
  }>()

  const emit = defineEmits<{
    (e: 'close'): void
  }>()

  const resources = useResourcesStore()
  const player = usePlayerStore()
  const inventory = useInventoryStore()
  const lore = useLoreStore()
  const ui = useUiStore()

  const isAuthenticated = ref(false)
  const passwordInput = ref('')
  const authError = ref('')

  const TABS = [
    { id: 'basic', label: 'Cơ Bản' },
    { id: 'materials', label: 'Vật Liệu' },
    { id: 'herbs', label: 'Linh Thảo' },
    { id: 'pills', label: 'Đan Dược' },
    { id: 'custom', label: 'Tùy Chỉnh' }
  ] as const

  type TabId = typeof TABS[number]['id']
  const currentTab = ref<TabId>('basic')

  const HERB_GRADE_NAMES: Record<HerbGrade, string> = {
    1: 'Phàm Phẩm Linh Thảo',
    2: 'Linh Phẩm Linh Thảo',
    3: 'Huyền Phẩm Linh Thảo',
    4: 'Địa Phẩm Linh Thảo',
    5: 'Thiên Phẩm Linh Thảo'
  }

  function handleLogin(): void {
    if (passwordInput.value.trim() === '1') {
      isAuthenticated.value = true
      authError.value = ''
      passwordInput.value = ''
      ui.toast('Đã mở quyền Quản Trị Viên thành công!', 'success')
    } else {
      authError.value = 'Mật khẩu quản trị không đúng. Vui lòng thử lại!'
      ui.toast('Mật khẩu quản trị sai!', 'warn')
    }
  }

  function lockAdmin(): void {
    isAuthenticated.value = false
    ui.toast('Đã khóa lại quyền Quản Trị Viên.', 'info')
  }

  // --- Handlers ---
  function addStoneNum(amount: number): void {
    resources.addStone(gn(amount))
    ui.toast(`Đã nhận +${formatGN(gn(amount))} Linh Thạch!`, 'success')
  }

  function addExpNum(amount: number): void {
    player.gainExp(gn(amount))
    ui.toast(`Đã nhận +${formatGN(gn(amount))} Tu Vi!`, 'success')
  }

  function fillExp(): void {
    player.exp = { ...player.expReq }
    ui.toast('Tu vi cảnh giới hiện tại đã viên mãn!', 'success')
  }

  function addQiAmount(amount: number): void {
    resources.setQi(resources.qi + amount, player.qiCapValue)
    ui.toast(`Đã hồi phục +${amount} Linh Khí!`, 'success')
  }

  function fillQi(): void {
    resources.setQi(player.qiCapValue * QI_BANK_MULT, player.qiCapValue)
    ui.toast('Linh khí đã hồi phục tràn đầy!', 'success')
  }

  function readyBreakthrough(): void {
    player.exp = { ...player.expReq }
    resources.setQi(player.qiCapValue, player.qiCapValue)
    ui.toast('Đã tích lũy đủ tu vi và linh khí cho đột phá!', 'success')
  }

  function addSmallRes(id: 'page' | 'ore' | 'dust' | 'wudao', n: number): void {
    resources.addSmall(id, n)
    const names = {
      page: 'Tàn Trang Công Pháp',
      ore: 'Huyền Thiết',
      dust: 'Khí Linh Trần',
      wudao: 'Điểm Ngộ Đạo'
    }
    ui.toast(`Đã nhận +${n} ${names[id]}!`, 'success')
  }

  function addDaoFruit(n: number): void {
    player.addDaoFruit(n)
    ui.toast(`Đã nhận +${n} Đạo Quả!`, 'success')
  }

  function addInsight(n: number): void {
    player.addInsight(n)
    ui.toast(`Đã nhận +${n} Túc Tuệ!`, 'success')
  }

  function addAllHerbs(count: number): void {
    for (const g of HERB_GRADES) {
      resources.addHerb(g, count)
    }
    ui.toast(`Đã thêm +${count} cây cho mỗi phẩm cấp linh thảo!`, 'success')
  }

  function addAllPills(count: number): void {
    for (const p of PILLS) {
      inventory.addPill(p.id, count)
    }
    ui.toast(`Đã thêm +${count} viên cho toàn bộ đan dược!`, 'success')
  }

  function unlockAllRecipes(): void {
    for (const p of PILLS) {
      lore.addRecipeMastery(p.id, 1)
    }
    ui.toast('Đã khai mở toàn bộ đan phương vào đan phòng!', 'success')
  }

  function unlockAllMaterials(): void {
    for (const m of MATERIALS) {
      lore.advanceLore(m.id, 3)
      lore.markSeen(m.id, 100)
    }
    ui.toast('Đã thông hiểu toàn bộ dược tính linh dược!', 'success')
  }

  // Custom
  const customType = ref('stone')
  const customAmount = ref(1000)

  function applyCustom(): void {
    const amt = Math.max(1, customAmount.value || 0)
    switch (customType.value) {
      case 'stone':
        resources.addStone(gn(amt))
        break
      case 'exp':
        player.gainExp(gn(amt))
        break
      case 'qi':
        resources.setQi(resources.qi + amt, player.qiCapValue)
        break
      case 'page':
      case 'ore':
      case 'dust':
      case 'wudao':
        resources.addSmall(customType.value, amt)
        break
      case 'daoFruit':
        player.addDaoFruit(amt)
        break
      case 'insight':
        player.addInsight(amt)
        break
    }
    ui.toast(`Đã nhận thành công ${amt}!`, 'success')
  }
</script>
