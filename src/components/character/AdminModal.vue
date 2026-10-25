<template>
  <BaseModal :open="open" title="Thiên Đạo Phủ · Quyền Admin" wide @close="emit('close')">
    <!-- Màn hình xác thực mật khẩu -->
    <div v-if="!isAuthenticated" class="space-y-4 py-2">
      <div class="rounded-lg border border-cinnabar/30 bg-cinnabar/5 p-3.5 text-center">
        <p class="font-kai text-[15px] text-cinnabar">Xác Thực Quản Trị Viên</p>
        <p class="mt-1 text-[11px] leading-relaxed text-ink-faint">
          Khu vực quản trị chỉ dành cho người chấp chưởng thiên đạo. Nhập mật khẩu quản trị 1 lần duy nhất để vĩnh viễn mở quyền can thiệp thiên quy trên trình duyệt này.
        </p>
      </div>

      <div class="space-y-2">
        <label class="block text-[11px] font-medium text-ink-soft">Mật khẩu Quản Trị (Admin)</label>
        <div class="flex gap-2">
          <input
            v-model="passwordInput"
            type="password"
            placeholder="Nhập mật khẩu (mặc định: 1)..."
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
          <span class="font-kai text-[12px]">Quyền Admin Đang Kích Hoạt (Ghi Nhớ Phiên)</span>
        </span>
        <button class="btn-ghost !py-1 !px-2.5 !text-[10px] text-ink-faint" @click="lockAdmin">
          Khóa Lại (Đăng Xuất)
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

      <!-- TAB 1: Cơ Bản (Linh Thạch, Linh Khí, Tu Vi) -->
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

        <!-- Tiện Ích Đột Phá Nhanh -->
        <div class="card-ink p-3 space-y-2">
          <span class="font-kai text-[13px] text-ink">Đột Phá Trực Tiếp & Tiến Giai</span>
          <p class="text-[10px] text-ink-faint">Đột phá tức thì bỏ qua điều kiện kiếp nạn hoặc hồi đầy tu vi/linh khí</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button class="btn-seal !py-2 text-[11px]" @click="directBreakthrough">
              Đột Phá Ngay (+1 Tầng)
            </button>
            <button class="btn-seal !py-2 text-[11px]" @click="advanceMajorRealm">
              Thăng +1 Đại Cảnh Giới
            </button>
            <button class="btn-ghost !py-2 text-[11px]" @click="readyBreakthrough">
              Hồi Đầy Tu Vi & Linh Khí
            </button>
          </div>
        </div>

        <!-- Tàng Kinh Các & Ô Phụ Tu -->
        <div class="card-ink p-3 space-y-2">
          <div class="flex justify-between items-center">
            <span class="font-kai text-[13px] text-ink">Tàng Kinh Các & Ô Phụ Tu</span>
            <span class="tabular text-[11px] text-jade">Hiện có: {{ dongfu.subGongfaSlots }}/8 ô (Cấp {{ dongfu.levels.library ?? 0 }})</span>
          </div>
          <p class="text-[10px] text-ink-faint">Lập tức nâng cấp Tàng Kinh Các lên cấp 21 để mở rộng trọn vẹn 8 ô Phụ Tu & Bí Thuật</p>
          <button class="btn-seal w-full !py-2 text-[11px]" @click="unlock8SubSlots">
            Mở Rộng Trọn Vẹn 8 Ô Phụ Tu (Nâng Cấp Tàng Kinh Các Cấp 21)
          </button>
        </div>
      </div>

      <!-- TAB 2: Đột Phá & Cảnh Giới (Trực Tiếp Đột Phá) -->
      <div v-if="currentTab === 'realm'" class="space-y-3">
        <!-- Thông Tin Cảnh Giới -->
        <div class="card-ink p-3 space-y-2">
          <div class="flex justify-between items-center border-b border-ink/10 pb-2">
            <div>
              <p class="font-kai text-[14px] text-cinnabar">{{ displayRealmName(player.realmName) }}</p>
              <p class="text-[10px] text-ink-faint">
                Đại cảnh giới: {{ player.major + 1 }} / {{ MAX_MAJOR + 1 }} · Tiểu cảnh giới: {{ player.sub + 1 }} / 10
              </p>
            </div>
            <div class="text-right text-[10px] text-ink-soft tabular">
              <div>Tu vi: {{ formatGN(player.exp) }} / {{ formatGN(player.expReq) }}</div>
              <div>Linh khí: {{ Math.floor(resources.qi) }} / {{ Math.floor(player.qiCapValue) }}</div>
            </div>
          </div>

          <!-- Nút Đột Phá Nhanh -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button class="btn-seal !py-2 text-[11px]" @click="directBreakthrough">
              Đột Phá Trực Tiếp (1 Tầng)
            </button>
            <button class="btn-seal !py-2 text-[11px]" @click="advanceMajorRealm">
              Thăng 1 Đại Cảnh Giới
            </button>
            <button class="btn-ghost !py-2 text-[11px]" @click="demoteSubRealm">
              Lùi 1 Tiểu Cảnh Giới
            </button>
          </div>
        </div>

        <!-- Tùy Chọn Nhảy Cảnh Giới Trực Tiếp -->
        <div class="card-ink p-3 space-y-3">
          <p class="font-kai text-[13px] text-ink">Chuyển Thẳng Đến Cảnh Giới Chỉ Định</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label class="block text-[10px] text-ink-faint mb-1">Đại cảnh giới</label>
              <select
                v-model.number="selectedMajor"
                class="w-full rounded border border-ink/20 bg-paper-deep/70 px-2.5 py-1.5 text-[12px] text-ink focus:border-cinnabar focus:outline-none"
              >
                <option v-for="(r, idx) in REALMS" :key="idx" :value="idx">
                  {{ displayRealmName(r.name) }} (Bậc {{ idx + 1 }})
                </option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] text-ink-faint mb-1">Tiểu cảnh giới</label>
              <select
                v-model.number="selectedSub"
                class="w-full rounded border border-ink/20 bg-paper-deep/70 px-2.5 py-1.5 text-[12px] text-ink focus:border-cinnabar focus:outline-none"
              >
                <option v-for="(name, sIdx) in SUB_NAMES" :key="sIdx" :value="sIdx">
                  {{ name }} (Cấp {{ sIdx + 1 }})
                </option>
              </select>
            </div>
          </div>
          <button class="btn-seal w-full !py-2 text-[12px]" @click="jumpToSelectedRealm">
            Chuyển Đến Cảnh Giới Đã Chọn
          </button>
        </div>

        <!-- Cực Hạn Tu Tiên -->
        <div class="card-ink p-3 space-y-2">
          <p class="font-kai text-[13px] text-cinnabar">Cực Hạn Thiên Đạo</p>
          <p class="text-[10px] text-ink-faint">Trực tiếp bước lên đỉnh cao tu đạo, thành tựu Hỗn Độn Đạo Tổ viên mãn đại thừa</p>
          <button class="btn-seal w-full !py-2.5 text-[12px] tracking-wide" @click="maxOutCultivation">
            Thành Tựu Hỗn Độn Đạo Tổ Viên Mãn (Max Cảnh Giới)
          </button>
        </div>
      </div>

      <!-- TAB 3: Trang Bị (Lấy Full Trang Bị) -->
      <div v-if="currentTab === 'equip'" class="space-y-3">
        <!-- Tổng Quan Trang Bị Đang Mặc -->
        <div class="card-ink p-3 space-y-2">
          <div class="flex justify-between items-center border-b border-ink/10 pb-2">
            <div>
              <p class="font-kai text-[13px] text-ink">Trang Bị Hiện Tại (9 Ô)</p>
              <p class="text-[10px] text-ink-faint">
                Bậc rơi cảnh giới: Bậc {{ currentDropTier }} · Đã mặc: {{ inventory.equippedItems.length }}/9 món
              </p>
            </div>
            <div class="text-right text-[10px] text-ink-soft">
              Túi đồ: {{ inventory.bagItems.length }} / {{ BAG_CAPACITY }}
            </div>
          </div>

          <!-- 9 Ô Trang Bị Hiện Tại -->
          <div class="grid grid-cols-3 gap-1.5">
            <div
              v-for="slot in DROP_SLOTS"
              :key="slot"
              class="rounded border border-ink/10 bg-paper-deep/40 p-2 text-[10px]"
            >
              <div class="font-kai text-ink-soft">{{ displayEquipSlot(slot) }}</div>
              <div v-if="getEquippedItemForSlot(slot)" class="mt-0.5 truncate font-medium text-cinnabar">
                {{ getEquippedItemForSlot(slot)!.name }}
                <span class="text-[9px] tabular text-ink-faint">
                  (B.{{ getEquippedItemForSlot(slot)!.tier }} +{{ getEquippedItemForSlot(slot)!.level }})
                </span>
              </div>
              <div v-else class="mt-0.5 text-ink-faint italic">
                (Chưa mặc)
              </div>
            </div>
          </div>
        </div>

        <!-- Tùy Chọn Khi Nhận Trang Bị -->
        <div class="card-ink p-3 space-y-2">
          <p class="font-kai text-[13px] text-ink">Tùy Chọn Nhận Trang Bị</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="autoEquipSet" type="checkbox" class="rounded text-cinnabar focus:ring-0" />
              <span>Tự động mặc vào người (9 ô)</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="equipEnhanceMax" type="checkbox" class="rounded text-cinnabar focus:ring-0" />
              <span>Cường hóa tối đa (+12 Cấp)</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="equipReforgeMax" type="checkbox" class="rounded text-cinnabar focus:ring-0" />
              <span>Trọng đúc max cấp (Roll 100%)</span>
            </label>
          </div>
        </div>

        <!-- Thao Tác 1 Chạm: Full Trang Bị Thần Phẩm -->
        <div class="card-ink p-3 space-y-2">
          <p class="font-kai text-[13px] text-ink">Nhận Nhanh Trọn Bộ Trang Bị Thần Phẩm</p>
          <p class="text-[10px] text-ink-faint">
            Sinh trọn bộ 9 món phẩm cấp Thần Phẩm (Divine) cực phẩm, đầy đủ từ điều tối cao
          </p>
          <div class="space-y-2">
            <button
              class="btn-seal w-full !py-2 text-[11px]"
              @click="giveFullEquipmentSet(currentDropTier, 'divine')"
            >
              Nhận Trọn Bộ Thần Phẩm (Bậc Hiện Tại {{ currentDropTier }})
            </button>
            <button
              class="btn-seal w-full !py-2 text-[11px]"
              @click="giveFullEquipmentSet(32, 'divine')"
            >
              Nhận Trọn Bộ Thần Phẩm Tối Thượng (Bậc 32 Hỗn Độn)
            </button>
          </div>
        </div>

        <!-- Tùy Chọn Bậc & Phẩm Cấp Cụ Thể -->
        <div class="card-ink p-3 space-y-3">
          <p class="font-kai text-[13px] text-ink">Tùy Chọn Bậc & Phẩm Cấp</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label class="block text-[10px] text-ink-faint mb-1">Bậc trang bị (Tier 1 - 32)</label>
              <select
                v-model.number="selectedEquipTier"
                class="w-full rounded border border-ink/20 bg-paper-deep/70 px-2.5 py-1.5 text-[12px] text-ink focus:border-cinnabar focus:outline-none"
              >
                <option v-for="t in 32" :key="t" :value="t">
                  Bậc {{ t }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] text-ink-faint mb-1">Phẩm cấp</label>
              <select
                v-model="selectedQuality"
                class="w-full rounded border border-ink/20 bg-paper-deep/70 px-2.5 py-1.5 text-[12px] text-ink focus:border-cinnabar focus:outline-none"
              >
                <option v-for="q in QUALITIES" :key="q.id" :value="q.id">
                  {{ displayQualityName(q.name) }} (Cấp {{ q.rank + 1 }})
                </option>
              </select>
            </div>
          </div>
          <button
            class="btn-seal w-full !py-2 text-[11px]"
            @click="giveFullEquipmentSet(selectedEquipTier, selectedQuality)"
          >
            Nhận 9 Món Theo Lựa Chọn Trên
          </button>
        </div>

        <!-- Tiện Ích Pháp Bảo & Túi Đồ -->
        <div class="card-ink p-3 space-y-2">
          <p class="font-kai text-[13px] text-ink">Tiện Ích Pháp Bảo, Trọng Đúc & Túi Đồ</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button class="btn-seal !py-2 text-[11px]" @click="unlockAllArtifacts">
              Mở Khóa Toàn Bộ Pháp Bảo (Max Cấp 9)
            </button>
            <button class="btn-ghost !py-2 text-[11px]" @click="maxEnhanceEquipped">
              Cường Hóa Max Đồ Đang Mặc (+12)
            </button>
            <button class="btn-seal !py-2 text-[11px]" @click="maxReforgeEquipped">
              Trọng Đúc Max Cấp Đồ Đang Mặc (100% Cực Phẩm)
            </button>
            <button class="btn-ghost !py-2 text-[11px]" @click="maxReforgeBag">
              Trọng Đúc Max Cấp Cả Túi Đồ
            </button>
            <button class="btn-ghost !py-2 text-[11px] col-span-1 sm:col-span-2" @click="clearBagItems">
              Dọn Sạch Túi Đồ (Xóa Đồ Rác)
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 4: Vật Liệu & Tài Nguyên Nhỏ (Mở rộng đến 1 Ức) -->
      <div v-if="currentTab === 'materials'" class="space-y-3">
        <!-- Tàn Trang Công Pháp -->
        <div class="card-ink p-3 space-y-1.5">
          <div class="flex justify-between items-center">
            <span class="font-kai text-[13px] text-ink">Tàn Trang Công Pháp</span>
            <span class="tabular text-[11px] text-cinnabar">Hiện có: {{ formatNum(resources.page) }}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addSmallRes('page', 100000)">+10 Vạn</button>
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addSmallRes('page', 1000000)">+100 Vạn</button>
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addSmallRes('page', 10000000)">+1000 Vạn</button>
            <button class="btn-seal !py-1.5 text-[11px]" @click="addSmallRes('page', 100000000)">+1 Ức Trang</button>
          </div>
        </div>

        <!-- Huyền Thiết -->
        <div class="card-ink p-3 space-y-1.5">
          <div class="flex justify-between items-center">
            <span class="font-kai text-[13px] text-ink">Huyền Thiết</span>
            <span class="tabular text-[11px] text-cinnabar">Hiện có: {{ formatNum(resources.ore) }}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addSmallRes('ore', 100000)">+10 Vạn</button>
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addSmallRes('ore', 1000000)">+100 Vạn</button>
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addSmallRes('ore', 10000000)">+1000 Vạn</button>
            <button class="btn-seal !py-1.5 text-[11px]" @click="addSmallRes('ore', 100000000)">+1 Ức Khối</button>
          </div>
        </div>

        <!-- Khí Linh Trần -->
        <div class="card-ink p-3 space-y-1.5">
          <div class="flex justify-between items-center">
            <span class="font-kai text-[13px] text-ink">Khí Linh Trần</span>
            <span class="tabular text-[11px] text-cinnabar">Hiện có: {{ formatNum(resources.dust) }}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addSmallRes('dust', 100000)">+10 Vạn</button>
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addSmallRes('dust', 1000000)">+100 Vạn</button>
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addSmallRes('dust', 10000000)">+1000 Vạn</button>
            <button class="btn-seal !py-1.5 text-[11px]" @click="addSmallRes('dust', 100000000)">+1 Ức Trần</button>
          </div>
        </div>

        <!-- Điểm Ngộ Đạo -->
        <div class="card-ink p-3 space-y-1.5">
          <div class="flex justify-between items-center">
            <span class="font-kai text-[13px] text-ink">Điểm Ngộ Đạo</span>
            <span class="tabular text-[11px] text-cinnabar">Hiện có: {{ formatNum(resources.wudao) }}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addSmallRes('wudao', 100000)">+10 Vạn</button>
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addSmallRes('wudao', 1000000)">+100 Vạn</button>
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addSmallRes('wudao', 10000000)">+1000 Vạn</button>
            <button class="btn-seal !py-1.5 text-[11px]" @click="addSmallRes('wudao', 100000000)">+1 Ức Điểm</button>
          </div>
        </div>

        <!-- Đạo Quả & Túc Tuệ -->
        <div class="card-ink p-3 space-y-1.5">
          <div class="flex justify-between items-center">
            <span class="font-kai text-[13px] text-ink">Đạo Quả & Túc Tuệ (Luân Hồi)</span>
            <span class="tabular text-[11px] text-violet-ink">Đạo quả: {{ formatNum(player.reincarnation.daoFruit) }} · Túc tuệ: {{ formatNum(player.reincarnation.insight) }}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addDaoFruit(100000)">+10 Vạn Đạo Quả</button>
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addDaoFruit(1000000)">+100 Vạn Đạo Quả</button>
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addDaoFruit(10000000)">+1000 Vạn Đạo Quả</button>
            <button class="btn-seal !py-1.5 text-[11px]" @click="addDaoFruit(100000000)">+1 Ức Đạo Quả</button>

            <button class="btn-ghost !py-1.5 text-[11px]" @click="addInsight(100000)">+10 Vạn Túc Tuệ</button>
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addInsight(1000000)">+100 Vạn Túc Tuệ</button>
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addInsight(10000000)">+1000 Vạn Túc Tuệ</button>
            <button class="btn-seal !py-1.5 text-[11px]" @click="addInsight(100000000)">+1 Ức Túc Tuệ</button>
          </div>
        </div>

        <!-- Trọn Gói 1 Ức Toàn Bộ Nguyên Liệu -->
        <div class="card-ink p-3 space-y-2">
          <p class="font-kai text-[13px] text-cinnabar">Nhận Trọn Gói Siêu Cấp · 1 Ức Nguyên Liệu</p>
          <p class="text-[10px] text-ink-faint">Lập tức cộng thêm +1 Ức (100 Triệu) cho toàn bộ 6 loại tài nguyên: Tàn Trang, Huyền Thiết, Khí Linh Trần, Điểm Ngộ Đạo, Đạo Quả, Túc Tuệ</p>
          <button class="btn-seal w-full !py-2.5 text-[12px] tracking-wide" @click="addAllMaterials1Uc">
            Nhận Trọn Gói Tất Cả Nguyên Liệu (+1 Ức Mỗi Loại)
          </button>
        </div>
      </div>

      <!-- TAB 5: Linh Thảo -->
      <div v-if="currentTab === 'herbs'" class="space-y-3">
        <div class="card-ink p-3">
          <p class="font-kai text-[13px] text-ink">Linh Thảo Các Phẩm Cấp</p>
          <p class="mt-0.5 text-[10px] text-ink-faint">Kho tổng: {{ formatNum(resources.herb) }} cây</p>
          <div class="mt-3 space-y-2">
            <div
              v-for="g in HERB_GRADES"
              :key="g"
              class="flex items-center justify-between rounded bg-paper-deep/50 px-2.5 py-1.5"
            >
              <span class="font-kai text-ink-soft">{{ HERB_GRADE_NAMES[g] }} (Cấp {{ g }})</span>
              <div class="flex items-center gap-1.5">
                <span class="tabular text-ink-faint text-[10px]">Hiện có: {{ formatNum(resources.herbOf(g)) }}</span>
                <button class="btn-ghost !py-1 !px-2 text-[10px]" @click="resources.addHerb(g, 100000)">+10 Vạn</button>
                <button class="btn-seal !py-1 !px-2 text-[10px]" @click="resources.addHerb(g, 100000000)">+1 Ức</button>
              </div>
            </div>
          </div>
          <div class="mt-3 pt-2 border-t border-ink/10 space-y-2">
            <button class="btn-ghost w-full !py-2 text-[11px]" @click="addAllHerbs(100000)">
              Nhận Tất Cả Linh Thảo (+10 Vạn Mỗi Phẩm Cấp)
            </button>
            <button class="btn-seal w-full !py-2 text-[12px]" @click="addAllHerbs(100000000)">
              Nhận Tất Cả Linh Thảo (+1 Ức Mỗi Phẩm Cấp)
            </button>
          </div>
        </div>

        <!-- Linh Căn Quả (Tăng Tư Chất Linh Căn) -->
        <div class="card-ink p-3 space-y-2.5">
          <div class="flex items-center justify-between border-b border-ink/10 pb-1.5">
            <div>
              <p class="font-kai text-[13px] text-ink">Linh Căn Quả (Bí Cảnh Chi Bảo)</p>
              <p class="text-[10px] text-ink-faint">
                Vật phẩm tăng vĩnh viễn tư chất linh căn, chỉ rơi ở bí cảnh với tỉ lệ thấp
              </p>
            </div>
            <div class="text-right">
              <span class="font-kai text-[12px] text-cinnabar">
                {{ player.linggen?.gradeName ?? 'Chưa thức tỉnh' }}
              </span>
              <span class="ml-1 text-[10px] text-ink-faint tabular">
                ×{{ player.linggen?.growthMult.toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Chi tiết từng loại quả -->
          <div class="space-y-2">
            <div
              v-for="tier in SPIRIT_ROOT_FRUIT_TIERS"
              :key="tier"
              class="flex flex-wrap items-center justify-between rounded bg-paper-deep/50 px-2.5 py-1.5 gap-2"
            >
              <div>
                <span class="font-kai text-ink-soft">{{ SPIRIT_ROOT_FRUITS[tier].name }}</span>
                <span class="ml-1 text-[10px] text-cinnabar font-bold">(+{{ SPIRIT_ROOT_FRUITS[tier].bonus }} Điểm)</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="tabular text-ink-faint text-[10px]">Hiện có: {{ formatNum(resources.fruitCount(tier)) }}</span>
                <button class="btn-ghost !py-1 !px-2 text-[10px]" @click="resources.addFruit(tier, 10)">+10</button>
                <button class="btn-ghost !py-1 !px-2 text-[10px]" @click="resources.addFruit(tier, 1000)">+1000</button>
                <button class="btn-seal !py-1 !px-2 text-[10px]" @click="resources.addFruit(tier, 100000000)">+1 Ức</button>
                <button
                  class="btn-seal !py-1 !px-2.5 text-[10px] !bg-jade"
                  :disabled="resources.fruitCount(tier) <= 0"
                  @click="handleEatFruit(tier)"
                >
                  Dùng
                </button>
              </div>
            </div>
          </div>

          <!-- Các nút thao tác trọn gói -->
          <div class="pt-2 border-t border-ink/10 space-y-2">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button class="btn-ghost w-full !py-2 text-[11px]" @click="addAllFruits(100)">
                Nhận Tất Cả Linh Căn Quả (+100 Quả)
              </button>
              <button class="btn-seal w-full !py-2 text-[11px]" @click="addAllFruits(100000000)">
                Nhận Tất Cả Linh Căn Quả (+1 Ức)
              </button>
            </div>
            <button class="btn-seal w-full !py-2 text-[12px] !bg-cinnabar" @click="handleMaxRoots">
              Trực Tiếp Nâng Max 100 Điểm Tất Cả Linh Căn (Viên Mãn Cực Hạn)
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 6: Đan Dược & Linh Dược -->
      <div v-if="currentTab === 'pills'" class="space-y-3">
        <!-- Đan Dược -->
        <div class="card-ink p-3 space-y-2">
          <p class="font-kai text-[13px] text-ink">Gói Đan Dược</p>
          <p class="text-[10px] text-ink-faint">Bao gồm toàn bộ 72 loại đan dược trong thiên hạ</p>
          <div class="grid grid-cols-3 gap-2">
            <button class="btn-ghost !py-2 text-[11px]" @click="addAllPills(100)">
              Tất Cả (+100)
            </button>
            <button class="btn-ghost !py-2 text-[11px]" @click="addAllPills(10000)">
              Tất Cả (+1 Vạn)
            </button>
            <button class="btn-seal !py-2 text-[11px]" @click="addAllPills(100000000)">
              Tất Cả (+1 Ức)
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

      <!-- TAB 7: Tùy Chỉnh Tự Do -->
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

        <div class="border-t border-ink/10 pt-3 space-y-2">
          <p class="font-kai text-[13px] text-ink">Luân Chuyển Thời Gian Thế Giới & Tu Sĩ</p>
          <p class="text-[10px] text-ink-faint">
            Hiện tại: Tháng thứ {{ npcStore.gameMonth }}. Chuyển sang tháng mới để kiểm tra tự động làm mới lượt tương tác Đạo Lữ & NPC, cũng như NPC đổi vị trí vùng đất.
          </p>
          <button class="btn-seal w-full !py-2 text-[12px]" @click="advanceNextMonth">
            Tiến Tới Tháng Kế Tiếp (+1 Tháng / Reset Tương Tác)
          </button>
        </div>

        <div class="border-t border-ink/10 pt-3 space-y-2">
          <p class="font-kai text-[13px] text-ink">Thiên Phú & Đạo Lữ</p>
          <p class="text-[10px] text-ink-faint">
            Kích hoạt thiên phú Nhất Kiến Chung Tình (Nhận ngay Đạo Lữ đồng hành nếu chưa có).
          </p>
          <button class="btn-seal w-full !py-2 text-[12px]" @click="grantFirstLoveAndDaolu">
            Kích Hoạt Thiên Phú: Nhất Kiến Chung Tình (Nhận Đạo Lữ)
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
  import { ref, computed, watch } from 'vue'
  import BaseModal from '@/components/common/BaseModal.vue'
  import { useResourcesStore } from '@/stores/resources'
  import { usePlayerStore } from '@/stores/player'
  import { useInventoryStore } from '@/stores/inventory'
  import { useLoreStore } from '@/stores/lore'
  import { useCultivationStore } from '@/stores/cultivation'
  import { useDongfuStore } from '@/stores/dongfu'
  import { useUiStore } from '@/stores/ui'
  import { gn, gnZero } from '@/utils/gnum'
  import { formatGN, formatNum } from '@/utils/format'
  import { rng } from '@/utils/random'
  import { REALMS, MAX_MAJOR, SUB_NAMES } from '@/data/realms'
  import { maxTierForMajor } from '@/data/regions'
  import { QUALITIES, qualityDef } from '@/data/qualities'
  import { equipmentTemplate } from '@/data/equipment'
  import { generateEquipment } from '@/core/equipGen'
  import { track, trackRealm, checkStateAchievements } from '@/core/progress'
  import { playSfx } from '@/core/audio'
  import { displayRealmName, displayEquipSlot, displayQualityName, displayDaoluName } from '@/ui/displayZhVi'
  import { HERB_GRADES, type HerbGrade } from '@/data/herbGrades'
  import { AFFIXES, AFFIX_RARITY_RANK, affixFitBlock } from '@/data/affixes'
  import { SPIRIT_ROOT_FRUITS, SPIRIT_ROOT_FRUIT_TIERS, type SpiritRootFruitTier } from '@/data/spiritRootFruit'
  import { PILLS } from '@/data/pills'
  import { ARTIFACTS } from '@/data/artifacts'
  import { MATERIALS } from '@/data/materials'
  import { QI_BANK_MULT, BAG_CAPACITY, GAME_MONTH_REAL_SECONDS } from '@/data/constants'
  import { FIRST_LOVE_APTITUDE_ID } from '@/data/aptitudes'
  import { initFirstLoveDaolu } from '@/core/daoluService'
  import { useNpcStore } from '@/stores/npc'
  import type { EquipSlot, QualityId, EquipmentInstance } from '@/types'

  const props = defineProps<{
    open: boolean
  }>()

  const emit = defineEmits<{
    (e: 'close'): void
  }>()

  const resources = useResourcesStore()
  const player = usePlayerStore()
  const inventory = useInventoryStore()
  const lore = useLoreStore()
  const cultivation = useCultivationStore()
  const dongfu = useDongfuStore()
  const npcStore = useNpcStore()
  const ui = useUiStore()

  // --- Xác thực Admin (Chỉ cần nhập 1 lần) ---
  const ADMIN_AUTH_KEY = 'yunyin.admin_auth'

  function checkStoredAuth(): boolean {
    try {
      return typeof window !== 'undefined' && localStorage.getItem(ADMIN_AUTH_KEY) === 'true'
    } catch {
      return false
    }
  }

  const isAuthenticated = ref(checkStoredAuth())
  const passwordInput = ref('')
  const authError = ref('')

  watch(
    () => props.open,
    isOpen => {
      if (isOpen && checkStoredAuth()) {
        isAuthenticated.value = true
      }
    }
  )

  function handleLogin(): void {
    if (passwordInput.value.trim() === '1') {
      isAuthenticated.value = true
      try {
        localStorage.setItem(ADMIN_AUTH_KEY, 'true')
      } catch {
        // ignore storage errors
      }
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
    try {
      localStorage.removeItem(ADMIN_AUTH_KEY)
    } catch {
      // ignore
    }
    ui.toast('Đã khóa lại quyền Quản Trị Viên.', 'info')
  }

  // --- Tabs ---
  const TABS = [
    { id: 'basic', label: 'Cơ Bản' },
    { id: 'realm', label: 'Đột Phá' },
    { id: 'equip', label: 'Trang Bị' },
    { id: 'materials', label: 'Vật Liệu' },
    { id: 'herbs', label: 'Linh Thảo' },
    { id: 'pills', label: 'Đan Dược' },
    { id: 'custom', label: 'Tùy Chỉnh' }
  ] as const

  type TabId = typeof TABS[number]['id']
  const currentTab = ref<TabId>('basic')

  // --- Tab 1: Cơ Bản Handlers ---
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

  function unlock8SubSlots(): void {
    dongfu.setLevel('mansion', Math.max(dongfu.levels.mansion ?? 0, 4))
    dongfu.setLevel('library', 21)
    ui.toast('Đã nâng cấp Tàng Kinh Các lên cấp 21, mở rộng trọn vẹn 8 ô Phụ Tu & Bí Thuật!', 'success')
  }

  // --- Tab 2: Đột Phá & Cảnh Giới Handlers ---
  const selectedMajor = ref(player.major)
  const selectedSub = ref(player.sub)

  watch(
    () => player.major,
    m => {
      selectedMajor.value = m
    }
  )
  watch(
    () => player.sub,
    s => {
      selectedSub.value = s
    }
  )

  function directBreakthrough(): void {
    if (player.atMaxRealm) {
      ui.toast('Đã đạt cảnh giới tối cao Hỗn Độn Đạo Tổ Viên Mãn!', 'info')
      return
    }
    player.advanceRealm()
    cultivation.resetTribFails()
    cultivation.clearNegativeBuffs()
    track('breakthroughs')
    trackRealm()
    checkStateAchievements()
    playSfx('breakthrough')
    ui.toast(`Đột phá thành công! Đã đạt ${displayRealmName(player.realmName)}`, 'success')
  }

  function advanceMajorRealm(): void {
    if (player.major >= MAX_MAJOR) {
      ui.toast('Đã đạt đại cảnh giới tối cao!', 'info')
      return
    }
    player.major += 1
    player.sub = 0
    player.exp = gnZero()
    cultivation.resetTribFails()
    cultivation.clearNegativeBuffs()
    track('breakthroughs')
    trackRealm()
    checkStateAchievements()
    playSfx('breakthrough')
    ui.toast(`Thăng đại cảnh giới thành công! Hiện tại: ${displayRealmName(player.realmName)}`, 'success')
  }

  function demoteSubRealm(): void {
    if (player.sub > 0) {
      player.sub -= 1
      player.exp = gnZero()
      ui.toast(`Đã hạ xuống: ${displayRealmName(player.realmName)}`, 'info')
    } else if (player.major > 0) {
      player.major -= 1
      player.sub = 9
      player.exp = gnZero()
      ui.toast(`Đã hạ xuống: ${displayRealmName(player.realmName)}`, 'info')
    } else {
      ui.toast('Đang ở cảnh giới ban đầu, không thể hạ thêm!', 'warn')
    }
  }

  function jumpToSelectedRealm(): void {
    player.major = selectedMajor.value
    player.sub = selectedSub.value
    player.exp = gnZero()
    cultivation.resetTribFails()
    cultivation.clearNegativeBuffs()
    track('breakthroughs')
    trackRealm()
    checkStateAchievements()
    playSfx('breakthrough')
    ui.toast(`Đã chuyển cảnh giới thành công: ${displayRealmName(player.realmName)}!`, 'success')
  }

  function maxOutCultivation(): void {
    player.major = MAX_MAJOR
    player.sub = 9
    player.exp = { ...player.expReq }
    resources.setQi(player.qiCapValue, player.qiCapValue)
    cultivation.resetTribFails()
    cultivation.clearNegativeBuffs()
    track('breakthroughs')
    trackRealm()
    checkStateAchievements()
    playSfx('breakthrough')
    ui.toast('Đã bước lên đỉnh thiên đạo: Hỗn Độn Đạo Tổ Viên Mãn!', 'success')
  }

  // --- Tab 3: Trang Bị (Full Trang Bị) Handlers ---
  const DROP_SLOTS: EquipSlot[] = [
    'weapon',
    'head',
    'body',
    'wrist',
    'belt',
    'boots',
    'necklace',
    'ring',
    'talisman'
  ]

  const currentDropTier = computed(() => maxTierForMajor(player.major))
  const selectedEquipTier = ref(maxTierForMajor(player.major))
  const selectedQuality = ref<QualityId>('divine')
  const autoEquipSet = ref(true)
  const equipEnhanceMax = ref(true)
  const equipReforgeMax = ref(true)

  watch(
    () => player.major,
    m => {
      selectedEquipTier.value = maxTierForMajor(m)
    }
  )

  function getEquippedItemForSlot(slot: EquipSlot) {
    const uid = inventory.equipped[slot]
    if (!uid) return null
    const item = inventory.items.find(it => it.uid === uid)
    if (!item) return null
    const t = equipmentTemplate(item.templateId)
    return {
      item,
      name: t?.name ?? 'Trang bị',
      quality: item.quality,
      tier: item.tier,
      level: item.level
    }
  }

  function maxReforgeItem(inst: EquipmentInstance): EquipmentInstance {
    const template = equipmentTemplate(inst.templateId)
    if (!template) return inst
    const quality = qualityDef(inst.quality)
    const maxCount = quality.affixes[1]

    // Tìm các từ điều phù hợp với vị trí trang bị và phẩm cấp
    const pool = AFFIXES.filter(a => affixFitBlock(a, template.slot, quality.rank) === null)
    // Ưu tiên độ hiếm cao nhất: legendary > epic > rare > uncommon > common
    const sortedPool = [...pool].sort((a, b) => {
      const rankA = AFFIX_RARITY_RANK[a.rarity] ?? 0
      const rankB = AFFIX_RARITY_RANK[b.rarity] ?? 0
      return rankB - rankA
    })

    const picked = sortedPool.slice(0, maxCount)
    const maxAffixes = picked.map(a => ({
      id: a.id,
      roll: 1 // Tối đa 100% chỉ số hoàn mỹ
    }))

    return {
      ...inst,
      affixes: maxAffixes,
      level: Math.max(inst.level, 12),
      reforgeCount: (inst.reforgeCount ?? 0) + 1
    }
  }

  function generateSingleEquip(
    slot: EquipSlot,
    tier: number,
    qualityId: QualityId,
    maxLevel: number
  ): EquipmentInstance {
    const q = qualityDef(qualityId)
    let inst = generateEquipment(tier, rng, { slot, minQualityRank: q.rank })
    // Đối với Thần phẩm, cố gắng roll đến khi đủ dòng từ điều tối đa
    if (qualityId === 'divine') {
      let tries = 0
      while (inst.affixes.length < 6 && tries < 20) {
        const next = generateEquipment(tier, rng, { slot, minQualityRank: q.rank })
        if (next.affixes.length > inst.affixes.length) {
          inst = next
        }
        tries++
      }
    }
    inst.quality = qualityId
    if (maxLevel > 0) {
      inst.level = maxLevel
    }
    if (equipReforgeMax.value) {
      inst = maxReforgeItem(inst)
    }
    return inst
  }

  function giveFullEquipmentSet(tier: number, qualityId: QualityId = 'divine'): void {
    const level = equipEnhanceMax.value ? 12 : 0
    const created: EquipmentInstance[] = []
    for (const slot of DROP_SLOTS) {
      const item = generateSingleEquip(slot, tier, qualityId, level)
      created.push(item)
    }

    // Thêm các món trang bị mới vào danh sách
    inventory.items = [...inventory.items, ...created]

    if (autoEquipSet.value) {
      for (const item of created) {
        const template = equipmentTemplate(item.templateId)
        const slot = template?.slot
        if (slot) {
          inventory.equip(item.uid, slot)
        }
      }
      ui.toast(
        `Đã nhận và trang bị trọn bộ 9 món ${displayQualityName(qualityId)} (Bậc ${tier})!`,
        'success'
      )
    } else {
      ui.toast(
        `Đã thêm trọn bộ 9 món ${displayQualityName(qualityId)} (Bậc ${tier}) vào túi đồ!`,
        'success'
      )
    }
  }

  function maxEnhanceEquipped(): void {
    let count = 0
    for (const item of inventory.equippedItems) {
      item.level = 12
      count++
    }
    if (count > 0) {
      ui.toast(`Đã cường hóa tối đa (+12) cho toàn bộ ${count} món trang bị đang mặc!`, 'success')
    } else {
      ui.toast('Chưa mặc trang bị nào để cường hóa!', 'warn')
    }
  }

  function maxReforgeEquipped(): void {
    const equipped = inventory.equippedItems
    if (equipped.length === 0) {
      ui.toast('Chưa mặc trang bị nào để trọng đúc!', 'warn')
      return
    }
    for (const item of equipped) {
      const reforged = maxReforgeItem(item)
      inventory.replaceItem(reforged)
    }
    ui.toast(`Đã trọng đúc max cấp (100% cực phẩm) cho toàn bộ ${equipped.length} món đang mặc!`, 'success')
  }

  function maxReforgeBag(): void {
    const bag = inventory.bagItems
    if (bag.length === 0) {
      ui.toast('Túi đồ không có trang bị nào để trọng đúc!', 'warn')
      return
    }
    for (const item of bag) {
      const reforged = maxReforgeItem(item)
      inventory.replaceItem(reforged)
    }
    ui.toast(`Đã trọng đúc max cấp cho toàn bộ ${bag.length} món trong túi đồ!`, 'success')
  }

  function clearBagItems(): void {
    const count = inventory.bagItems.length
    inventory.items = [...inventory.equippedItems]
    ui.toast(`Đã dọn dẹp sạch ${count} trang bị chưa mặc trong túi đồ!`, 'info')
  }

  function unlockAllArtifacts(): void {
    for (const art of ARTIFACTS) {
      const existing = inventory.artifacts.find(a => a.defId === art.id)
      if (!existing) {
        inventory.artifacts.push({ defId: art.id, level: 9 })
      } else {
        existing.level = 9
      }
    }
    const availableIds = ARTIFACTS.slice(0, 2).map(a => a.id)
    inventory.equippedArtifacts = availableIds
    ui.toast('Đã khai mở toàn bộ Pháp Bảo Thần Khí (+Max Cấp 9)!', 'success')
  }

  // --- Tab 4: Vật Liệu Handlers ---
  function addSmallRes(id: 'page' | 'ore' | 'dust' | 'wudao', n: number): void {
    resources.addSmall(id, n)
    const names = {
      page: 'Tàn Trang Công Pháp',
      ore: 'Huyền Thiết',
      dust: 'Khí Linh Trần',
      wudao: 'Điểm Ngộ Đạo'
    }
    ui.toast(`Đã nhận +${formatNum(n)} ${names[id]}!`, 'success')
  }

  function addDaoFruit(n: number): void {
    player.addDaoFruit(n)
    ui.toast(`Đã nhận +${formatNum(n)} Đạo Quả!`, 'success')
  }

  function addInsight(n: number): void {
    player.addInsight(n)
    ui.toast(`Đã nhận +${formatNum(n)} Túc Tuệ!`, 'success')
  }

  function addAllMaterials1Uc(): void {
    const amount = 100000000
    resources.addSmall('page', amount)
    resources.addSmall('ore', amount)
    resources.addSmall('dust', amount)
    resources.addSmall('wudao', amount)
    player.addDaoFruit(amount)
    player.addInsight(amount)
    ui.toast('Đã nhận trọn gói +1 Ức (100 Triệu) cho toàn bộ nguyên liệu tu đạo!', 'success')
  }

  // --- Tab 5: Linh Thảo Handlers ---
  const HERB_GRADE_NAMES: Record<HerbGrade, string> = {
    1: 'Phàm Phẩm Linh Thảo',
    2: 'Linh Phẩm Linh Thảo',
    3: 'Huyền Phẩm Linh Thảo',
    4: 'Địa Phẩm Linh Thảo',
    5: 'Thiên Phẩm Linh Thảo'
  }

  function addAllHerbs(count: number): void {
    for (const g of HERB_GRADES) {
      resources.addHerb(g, count)
    }
    ui.toast(`Đã thêm +${formatNum(count)} cây cho mỗi phẩm cấp linh thảo!`, 'success')
  }

  // --- Linh Căn Quả Handlers ---
  function addAllFruits(amount: number): void {
    for (const tier of SPIRIT_ROOT_FRUIT_TIERS) {
      resources.addFruit(tier, amount)
    }
    ui.toast(`Đã thêm +${formatNum(amount)} quả cho toàn bộ 3 loại Linh Căn Quả!`, 'success')
  }

  function handleEatFruit(tier: SpiritRootFruitTier): void {
    const res = player.consumeSpiritRootFruit(tier, 1)
    if (res.ok) {
      ui.toast(res.message, 'success')
    } else {
      ui.toast(res.message, 'warn')
    }
  }

  function handleMaxRoots(): void {
    const res = player.maxAllSpiritRoots()
    if (res.ok) {
      ui.toast(res.message, 'success')
    } else {
      ui.toast(res.message, 'warn')
    }
  }

  // --- Tab 6: Đan Dược Handlers ---
  function addAllPills(count: number): void {
    for (const p of PILLS) {
      inventory.addPill(p.id, count)
    }
    ui.toast(`Đã thêm +${formatNum(count)} viên cho toàn bộ đan dược!`, 'success')
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

  // --- Tab 7: Custom Handlers ---
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

  function advanceNextMonth(): void {
    npcStore.advanceMonthTime(GAME_MONTH_REAL_SECONDS)
    ui.toast(`Đã chuyển sang tháng thứ ${npcStore.gameMonth}! Toàn bộ tương tác Đạo Lữ & NPC đã được làm mới, NPC đã đổi vị trí du ngoạn.`, 'success')
  }

  function grantFirstLoveAndDaolu(): void {
    if (!player.aptitudes.includes(FIRST_LOVE_APTITUDE_ID)) {
      player.aptitudes.push(FIRST_LOVE_APTITUDE_ID)
    }
    if (!player.bond || player.bond.fallen || player.bond.departed) {
      const partner = initFirstLoveDaolu(player.gender)
      if (partner) {
        ui.toast(`Đã kích hoạt Nhất Kiến Chung Tình & kết duyên cùng 【${displayDaoluName(partner.name)}】!`, 'rare')
        return
      }
    }
    ui.toast('Đã có thiên phú Nhất Kiến Chung Tình và Đạo Lữ đồng hành!', 'rare')
  }
</script>