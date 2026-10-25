<template>
  <div class="stagger-in space-y-4 px-4 pb-8 pt-4">
    <!-- ===================================================================== -->
    <!-- TRƯỜNG HỢP 1: CHƯA ĐẠT CẢNH GIỚI KIM ĐAN (major < 2) -->
    <!-- ===================================================================== -->
    <div v-if="player.major < 2" class="card-ink p-6 text-center space-y-4">
      <div class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ink/5 border border-ink/20 text-ink">
        <GameIcon name="castle" :size="32" />
      </div>
      <div>
        <h2 class="font-kai text-[18px] font-bold tracking-widest text-ink">SƠN MÔN CHƯA MỞ</h2>
        <p class="mt-1 text-[12px] text-ink-faint">
          Khai sơn lập phái, kiến tạo Tông môn yêu cầu cảnh giới tối thiểu <span class="font-semibold text-cinnabar">Kim Đan Kỳ</span>.
        </p>
      </div>

      <div class="rounded-lg border border-ink/10 bg-paper-deep/50 p-4 max-w-sm mx-auto text-left space-y-2">
        <div class="flex justify-between text-[12px]">
          <span class="text-ink-faint">Cảnh giới hiện tại:</span>
          <span class="font-kai font-semibold text-ink">{{ displayRealmName(player.realmName) }}</span>
        </div>
        <div class="flex justify-between text-[12px]">
          <span class="text-ink-faint">Cảnh giới yêu cầu:</span>
          <span class="font-kai font-semibold text-gold-ink">Kim Đan Sơ Kỳ</span>
        </div>
        <div class="flex justify-between text-[12px]">
          <span class="text-ink-faint">Đặc quyền Tông chủ:</span>
          <span class="text-azure text-[11px]">Thu nhận đệ tử, Tàng Kinh Các, Chiến tranh & Cống nộp</span>
        </div>
      </div>

      <p class="text-[11px] leading-relaxed text-ink-soft max-w-md mx-auto">
        Đạo hữu hãy chuyên tâm khổ tu, tích lũy chân nguyên đột phá bình cảnh. Khi kết thành Kim Đan, danh chấn bát hoang, liền có thể chiêu mộ hiền tài, kiến tạo môn phái riêng mình!
      </p>
    </div>

    <!-- ===================================================================== -->
    <!-- TRƯỜNG HỢP 2: ĐỦ KIM ĐAN NHƯNG CHƯA KHAI SƠN LẬP PHÁI -->
    <!-- ===================================================================== -->
    <div v-else-if="!sect.sectCreated" class="card-ink p-5 space-y-5">
      <div class="flex items-center gap-3 border-b border-ink/10 pb-4">
        <div class="grid h-12 w-12 place-items-center rounded-lg bg-gold-ink/15 text-gold-ink">
          <GameIcon name="castle" :size="24" />
        </div>
        <div>
          <h2 class="font-kai text-[16px] font-bold tracking-widest text-ink">KHAI SƠN LẬP PHÁI</h2>
          <p class="text-[11px] text-ink-faint">Ngươi đã kết thành Kim Đan, đủ tư cách lập tông xưng tổ</p>
        </div>
      </div>

      <!-- Đặt tên Tông Môn -->
      <div class="space-y-1.5">
        <label class="block font-kai text-[13px] font-semibold text-ink">TÊN TÔNG MÔN</label>
        <input
          v-model="createSectForm.name"
          type="text"
          maxlength="16"
          placeholder="Nhập tên Tông môn (Ví dụ: Vân Ẩn Tông)"
          class="w-full rounded border border-ink/20 bg-paper px-3 py-2 text-[14px] text-ink focus:border-cinnabar focus:outline-none"
        />
      </div>

      <!-- Chọn Tông chỉ môn phái -->
      <div class="space-y-2">
        <label class="block font-kai text-[13px] font-semibold text-ink">TÔNG CHỈ TU HÀNH</label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div
            v-for="d in SECT_DOCTRINES"
            :key="d.id"
            class="cursor-pointer rounded-lg border p-3 transition-all"
            :class="createSectForm.doctrineId === d.id ? 'border-cinnabar bg-cinnabar/5' : 'border-ink/15 bg-paper hover:border-ink/30'"
            @click="createSectForm.doctrineId = d.id"
          >
            <div class="flex items-center justify-between">
              <span class="font-kai text-[14px] font-bold text-ink">{{ d.name }}</span>
              <span class="text-[10px] rounded px-1.5 py-0.5 bg-ink/5 text-ink-faint">{{ ELEMENTS[d.favoredElement]?.name }}</span>
            </div>
            <p class="mt-1 text-[11px] leading-relaxed text-ink-soft">{{ d.desc }}</p>
            <p class="mt-1.5 text-[10px] font-semibold text-cinnabar">★ {{ d.bonusDesc }}</p>
          </div>
        </div>
      </div>

      <button class="btn-seal w-full !py-3 text-[15px]" @click="handleCreateSect">
        CHÍNH THỨC SÁNG LẬP TÔNG MÔN
      </button>
    </div>

    <!-- ===================================================================== -->
    <!-- TRƯỜNG HỢP 3: TÔNG MÔN ĐÃ KIẾN TẠO HOÀN CHỈNH -->
    <!-- ===================================================================== -->
    <template v-else>
      <!-- HEADER TÔNG MÔN & CẤP ĐỘ -->
      <div class="card-ink p-4 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-jade/15 text-jade">
              <GameIcon name="castle" :size="22" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="font-kai text-[17px] font-bold tracking-widest text-ink">{{ sect.sectName }}</h1>
                <span class="rounded bg-gold-ink/10 px-1.5 py-0.5 text-[10px] font-kai font-semibold text-gold-ink">
                  {{ currentDoctrine?.name }}
                </span>
                <span class="rounded bg-cinnabar/10 px-2 py-0.5 text-[10px] font-kai font-bold text-cinnabar">
                  {{ currentSectLevelDef?.name || `Cấp ${sect.sectLevel}` }}
                </span>
              </div>
              <p class="text-[11px] text-ink-faint">
                Tông chủ: <span class="text-ink font-semibold">{{ currentMasterDisplayName }}</span> · {{ sect.disciples.length }} Đệ tử
                <span v-if="sect.vassalSects.length > 0" class="text-jade font-semibold ml-1">
                  · {{ sect.vassalSects.length }} Phụ thuộc
                </span>
              </p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-[10px] text-ink-faint">Niên lịch Tông môn</span>
            <p class="font-kai text-[12px] font-semibold text-cinnabar">{{ calendarText }}</p>
          </div>
        </div>

        <!-- Hàng chức năng thăng cấp Tông môn & Nhường ngôi Lão tổ -->
        <div class="flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 pt-2 text-[12px]">
          <div class="flex items-center gap-2">
            <span v-if="sect.playerIsAncestor" class="rounded border border-amber-ink/40 bg-amber-ink/10 px-2 py-0.5 font-kai font-bold text-amber-ink text-[11px]">
              ★ Thân Phận: Lão Tổ Trấn Tông
            </span>
            <span v-else class="rounded border border-ink/20 bg-ink/5 px-2 py-0.5 font-kai text-ink-soft text-[11px]">
              Thân Phận: Tông Chủ Đương Nhiệm
            </span>

            <button
              v-if="!sect.playerIsAncestor && sect.disciples.length > 0"
              class="btn-ghost !px-2.5 !py-1 !text-[11px] text-amber-ink hover:!bg-amber-ink/10"
              @click="openAbdicateModal"
            >
              Nhường Ngôi Lão Tổ
            </button>
          </div>

          <div>
            <button
              v-if="sect.sectLevel < 5"
              class="btn-seal !px-3 !py-1 !text-[11px]"
              :title="nextLevelUpgradeHint"
              @click="handleUpgradeSectLevel"
            >
              Thăng Cấp Tông Môn (Cấp {{ sect.sectLevel + 1 }})
            </button>
            <span v-else class="text-[11px] font-kai text-gold-ink font-semibold">
              ★ Đạt Cực Hạn (Cấp 5 - Vạn Cổ Tiên Môn)
            </span>
          </div>
        </div>

        <!-- Thông báo Đơn xin nhập tông mới (nếu có) -->
        <div
          v-if="sect.pendingApplicants.length > 0"
          class="flex items-center justify-between rounded-md border border-cinnabar/40 bg-cinnabar/10 px-3 py-2 cursor-pointer transition-colors hover:bg-cinnabar/15"
          @click="activeTab = 'applicant'"
        >
          <div class="flex items-center gap-2 text-[12px] text-cinnabar">
            <GameIcon name="scroll" :size="15" />
            <span>Có <strong>{{ sect.pendingApplicants.length }}</strong> tu sĩ đang nộp đơn xin gia nhập sơn môn!</span>
          </div>
          <span class="text-[11px] font-semibold text-cinnabar underline shrink-0">Xét duyệt ngay ({{ sect.pendingApplicants.length }}) →</span>
        </div>
      </div>

      <!-- THANH ĐIỀU HƯỚNG TAB -->
      <div class="flex flex-wrap gap-1 border-b border-ink/15 pb-1">
        <button
          v-for="tab in TABS"
          :key="tab.id"
          class="rounded-md px-3 py-1.5 font-kai text-[13px] transition-all relative"
          :class="activeTab === tab.id ? 'bg-ink text-paper font-semibold' : 'text-ink-soft hover:bg-ink/5 hover:text-ink'"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
          <span
            v-if="tab.id === 'applicant' && sect.pendingApplicants.length > 0"
            class="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-cinnabar animate-ping"
          />
        </button>
      </div>

      <!-- =================================================================== -->
      <!-- TAB 1: DANH SÁCH ĐỆ TỬ & CẤP BẬC (DISCIPLES) -->
      <!-- =================================================================== -->
      <div v-if="activeTab === 'disciples'" class="space-y-3">
        <!-- Bảng thống kê hạn ngạch cấp bậc -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div class="card-ink p-2 border-amber-ink/20">
            <span class="text-ink-faint block text-[10px]">Lão Tổ</span>
            <span class="font-bold text-amber-ink">
              {{ rankCounts.ancestor + (sect.playerIsAncestor ? 1 : 0) }} / {{ currentCaps.ancestor }}
            </span>
          </div>
          <div class="card-ink p-2 border-cinnabar/20">
            <span class="text-ink-faint block text-[10px]">Tông Chủ / Phó</span>
            <span class="font-bold text-cinnabar">
              {{ rankCounts.master + (!sect.playerIsAncestor ? 1 : 0) }} / 1
            </span>
            <span class="text-ink-faint text-[10px] ml-1">· Phó: {{ rankCounts.vice_master }} / {{ currentCaps.vice_master }}</span>
          </div>
          <div class="card-ink p-2 border-indigo-ink/20">
            <span class="text-ink-faint block text-[10px]">Hộ Pháp / Trưởng Lão</span>
            <span class="font-bold text-indigo-ink">
              {{ rankCounts.guardian }} / {{ currentCaps.guardian }}
            </span>
            <span class="text-ink-faint text-[10px] ml-1">· Tr.Lão: {{ rankCounts.elder }} / {{ currentCaps.elder }}</span>
          </div>
          <div class="card-ink p-2 border-jade/20">
            <span class="text-ink-faint block text-[10px]">Chân Truyền / Nội / Ngoại</span>
            <span class="font-bold text-jade">
              {{ rankCounts.true }} / {{ trueDisciplesCap }}
            </span>
            <span class="text-ink-faint text-[10px] ml-1">· Nội: {{ rankCounts.inner }}/{{ currentCaps.inner }} · Ngoại: {{ rankCounts.outer }}/{{ currentCaps.outer }}</span>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2 px-1">
          <SectionTitle title="Môn Hạ Nhân Sự" :hint="`${sect.disciples.length} Đệ tử & Chức sắc`" />

          <!-- Bộ lọc cấp bậc -->
          <div class="flex flex-wrap gap-1 text-[11px]">
            <button
              v-for="r in RANK_FILTER_OPTIONS"
              :key="r.id"
              class="rounded px-2 py-0.5 transition-colors"
              :class="discipleRankFilter === r.id ? 'bg-ink text-paper font-semibold' : 'bg-paper-deep text-ink-faint hover:text-ink'"
              @click="discipleRankFilter = r.id"
            >
              {{ r.label }}
            </button>
          </div>
        </div>

        <div v-if="filteredDisciples.length === 0" class="card-ink p-8 text-center space-y-2">
          <p class="font-kai text-[14px] text-ink-soft">Không có thành viên nào trong cấp bậc này.</p>
          <p class="text-[11px] text-ink-faint">Đạo hữu có thể thu nhận thêm tại mục [Xét Duyệt] hoặc điều chỉnh bộ lọc.</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="d in filteredDisciples"
            :key="d.id"
            class="card-ink p-4 space-y-2.5"
          >
            <!-- Hàng đầu: Tên, Phẩm cấp, Cảnh giới, Cấp bậc Tông môn -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span
                  class="grid h-8 w-8 place-items-center rounded-md font-kai text-[14px] font-bold"
                  :style="{ backgroundColor: 'color-mix(in srgb, ' + ELEMENTS[d.element].color + ' 15%, transparent)', color: ELEMENTS[d.element].color }"
                >
                  {{ ELEMENTS[d.element].char }}
                </span>
                <div>
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="font-kai text-[15px] font-bold text-ink">{{ d.name }}</span>
                    <span class="text-[11px] text-ink-faint">({{ d.gender === 'male' ? 'Nam' : 'Nữ' }})</span>
                    <!-- Cấp bậc Tông môn -->
                    <span
                      class="rounded border px-1.5 py-0.2 text-[10px] font-kai font-semibold"
                      :class="rankBadgeClass(d.rank)"
                    >
                      {{ SECT_RANK_NAMES[d.rank || 'outer'] }}
                    </span>
                    <!-- Thiên kiêu -->
                    <span
                      class="rounded px-1.5 py-0.2 text-[10px] font-kai font-semibold"
                      :class="d.tierRank === 'gold' ? 'bg-gold-ink/15 text-gold-ink' : d.tierRank === 'silver' ? 'bg-azure/15 text-azure' : 'bg-ink/10 text-ink-soft'"
                    >
                      {{ d.tierRank === 'gold' ? 'Thiên Kiêu Vàng' : d.tierRank === 'silver' ? 'Thiên Kiêu Bạc' : 'Phổ Thông' }}
                    </span>
                  </div>
                  <p class="text-[11px] text-ink-faint">
                    Linh căn: <span :style="{ color: ELEMENTS[d.element].color }">{{ ELEMENTS[d.element].name }}</span> · Ngộ tính:
                    <span class="font-semibold" :class="comprehensionRank(d.comprehension).colorClass">
                      {{ d.comprehension }} ({{ comprehensionRank(d.comprehension).label }})
                    </span>
                    · Cống hiến: <span class="font-bold text-azure">{{ d.contributionPoints ?? d.totalContributions ?? 0 }} điểm</span>
                  </p>
                </div>
              </div>

              <!-- Trạng thái -->
              <span
                class="rounded-full px-2 py-0.5 text-[10px] font-medium"
                :class="statusMeta(d.status).class"
              >
                {{ statusMeta(d.status).label }}
              </span>
            </div>

            <!-- Cảnh giới & Thanh tu vi -->
            <div class="space-y-1">
              <div class="flex justify-between text-[11px]">
                <span class="font-kai font-semibold text-ink">{{ realmText(d.major, d.sub) }}</span>
                <span class="tabular text-azure">{{ Math.round(d.expPct) }}% Tu vi</span>
              </div>
              <div class="h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                <div class="h-full bg-azure transition-all duration-300" :style="{ width: `${Math.min(100, d.expPct)}%` }" />
              </div>
            </div>

            <!-- Công pháp & Tháp Lịch Luyện -->
            <div class="grid grid-cols-2 gap-2 text-[11px] bg-paper-deep/40 rounded p-2 border border-ink/10">
              <div>
                <span class="text-ink-faint">Chủ tu công pháp:</span>
                <p class="font-kai font-semibold text-ink truncate">
                  {{ d.activeGongfa ? displayGongfaName(gongfaDef(d.activeGongfa)?.name || '') : 'Chưa lĩnh ngộ' }}
                </p>
              </div>
              <div>
                <span class="text-ink-faint">Tháp Lịch Luyện:</span>
                <p class="font-kai font-semibold text-gold-ink">Đã vượt Tầng {{ d.towerFloor }}</p>
              </div>
            </div>

            <!-- Trang bị đệ tử đổi từ kho tông môn -->
            <div v-if="d.equippedItems && d.equippedItems.length > 0" class="flex flex-wrap gap-1.5 items-center text-[11px] bg-paper-deep/30 rounded p-2 border border-ink/10">
              <span class="text-ink-faint text-[10px]">Trang bị kho ({{ d.equippedItems.length }}):</span>
              <span
                v-for="eq in d.equippedItems"
                :key="eq.uid"
                class="rounded px-1.5 py-0.5 text-[10px] font-kai border border-ink/15 bg-paper flex items-center gap-1"
              >
                <GameIcon name="shield" :size="10" class="text-azure" />
                <span>{{ displayEquipName(equipmentTemplate(eq.templateId)?.name ?? 'Trang bị') }}</span>
                <span v-if="eq.level" class="text-azure">+{{ eq.level }}</span>
              </span>
            </div>

            <!-- Cảnh báo & thao tác đặc biệt khi Nhập Ma -->
            <div v-if="d.status === 'demonic'" class="p-2.5 rounded bg-scarlet/10 border border-scarlet/30 flex items-center justify-between gap-2 flex-wrap text-[11px]">
              <span class="text-scarlet font-semibold">[Cảnh Báo] Đệ tử bị Tâm Ma phản phệ chiếm cứ, ma khí công tâm!</span>
              <div class="flex items-center gap-1.5">
                <button class="btn-seal !px-2.5 !py-1 !text-[11px] !bg-scarlet !text-cream" @click="handlePurifyDemonic(d.id)">
                  Tịnh Hóa (5k Linh thạch)
                </button>
                <button class="btn-ghost !px-2 !py-1 !text-[11px] text-ink-faint hover:text-cinnabar" @click="openExpelConfirmModal(d)">
                  Trục Xuất
                </button>
              </div>
            </div>

            <!-- Thông báo khi Đã Ngã Xuống (Deceased) -->
            <div v-else-if="d.status === 'deceased'" class="p-2 rounded bg-ink/5 border border-ink/10 flex items-center justify-between gap-2 flex-wrap text-[11px]">
              <span class="text-ink-faint italic">[Đã tạ thế] {{ d.deathCause ?? 'Đã tử trận, đạo tiêu thân vẫn.' }}</span>
              <button class="btn-ghost !px-2 !py-1 !text-[11px] text-ink-faint hover:text-cinnabar" @click="openExpelConfirmModal(d)">
                Thu Dọn / Xóa
              </button>
            </div>

            <!-- Nút tương tác nhanh thông thường -->
            <div v-else class="flex flex-wrap gap-2 pt-1 border-t border-ink/10">
              <button
                class="btn-ghost !px-2.5 !py-1 !text-[11px]"
                @click="openDiscipleProfile(d)"
              >
                <GameIcon name="user" :size="12" />Hồ Sơ
              </button>
              <button
                class="btn-seal !px-2.5 !py-1 !text-[11px] !bg-amber-ink/90 text-cream"
                @click="openRewardModal(d)"
              >
                <GameIcon name="sparkles" :size="12" />Ban Thưởng
              </button>
              <button
                class="btn-seal !px-2.5 !py-1 !text-[11px]"
                @click="openPromoteModal(d)"
              >
                Bổ Nhiệm Cấp Bậc
              </button>
              <button
                class="btn-ghost !px-2.5 !py-1 !text-[11px]"
                :disabled="sect.libraryGongfaIds.length === 0"
                @click="openTeachModal(d)"
              >
                <GameIcon name="book" :size="12" />Truyền Thụ
              </button>
              <button
                class="btn-ghost !px-2.5 !py-1 !text-[11px]"
                @click="handleDiscipleChallengeTower(d)"
              >
                <GameIcon name="shield" :size="12" />Đấu Tháp (T{{ d.towerFloor + 1 }})
              </button>
              <button
                class="btn-ghost !px-2.5 !py-1 !text-[11px]"
                @click="openRealmModal(d)"
              >
                <GameIcon name="mountain" :size="12" />Bí Cảnh
              </button>
              <button
                class="btn-ghost !px-2.5 !py-1 !text-[11px] text-cinnabar hover:!bg-cinnabar/10"
                @click="openExpelConfirmModal(d)"
              >
                <GameIcon name="skull" :size="12" />Trục Xuất
              </button>
            </div>
          </div>
        </div>
      </div>



      <!-- =================================================================== -->
      <!-- TAB 2: KHO TÔNG MÔN (SECT VAULT) -->
      <!-- =================================================================== -->
      <div v-else-if="activeTab === 'vault'" class="space-y-4">
        <SectionTitle title="Kho Tông Môn" hint="Lưu trữ tài nguyên, đan dược & bảo vật cho đệ tử sử dụng" />

        <!-- TÀI NGUYÊN LINH THẠCH & KHOÁNG THẠCH TRONG KHO -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
          <!-- Linh thạch -->
          <div class="card-ink p-3 space-y-1.5 border-amber-ink/30">
            <div class="flex items-center justify-between">
              <span class="text-ink-faint text-[11px]">Linh Thạch Trong Kho</span>
              <GameIcon name="gem" :size="14" class="text-amber-ink" />
            </div>
            <p class="font-kai text-[16px] font-bold text-amber-ink">
              {{ formatNum(sect.sectVault.stone) }}
            </p>
            <div class="flex gap-1 pt-1">
              <button class="btn-seal !px-2 !py-0.5 !text-[10px]" @click="openStoneModal('deposit')">Gửi Vào</button>
              <button
                class="btn-ghost !px-2 !py-0.5 !text-[10px]"
                :disabled="sect.sectVault.stone <= 0"
                @click="openStoneModal('withdraw')"
              >
                Rút Ra
              </button>
            </div>
          </div>

          <!-- Huyền thiết -->
          <div class="card-ink p-3 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-ink-faint text-[11px]">Huyền Thiết</span>
              <GameIcon name="hammer" :size="14" class="text-ink-soft" />
            </div>
            <p class="font-kai text-[16px] font-bold text-ink">
              {{ sect.sectVault.ores }}
            </p>
            <div class="flex gap-1 pt-1">
              <button class="btn-seal !px-2 !py-0.5 !text-[10px]" @click="openMaterialModal('ore', 'deposit')">Gửi</button>
              <button
                class="btn-ghost !px-2 !py-0.5 !text-[10px]"
                :disabled="sect.sectVault.ores <= 0"
                @click="openMaterialModal('ore', 'withdraw')"
              >
                Rút
              </button>
            </div>
          </div>

          <!-- Khí trần -->
          <div class="card-ink p-3 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-ink-faint text-[11px]">Khí Trần</span>
              <GameIcon name="sparkles" :size="14" class="text-azure" />
            </div>
            <p class="font-kai text-[16px] font-bold text-azure">
              {{ sect.sectVault.dust }}
            </p>
            <div class="flex gap-1 pt-1">
              <button class="btn-seal !px-2 !py-0.5 !text-[10px]" @click="openMaterialModal('dust', 'deposit')">Gửi</button>
              <button
                class="btn-ghost !px-2 !py-0.5 !text-[10px]"
                :disabled="sect.sectVault.dust <= 0"
                @click="openMaterialModal('dust', 'withdraw')"
              >
                Rút
              </button>
            </div>
          </div>

          <!-- Ngộ đạo tàn thiên -->
          <div class="card-ink p-3 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-ink-faint text-[11px]">Ngộ Đạo Tàn Thiên</span>
              <GameIcon name="scroll" :size="14" class="text-gold-ink" />
            </div>
            <p class="font-kai text-[16px] font-bold text-gold-ink">
              {{ sect.sectVault.wudao }}
            </p>
            <div class="flex gap-1 pt-1">
              <button class="btn-seal !px-2 !py-0.5 !text-[10px]" @click="openMaterialModal('wudao', 'deposit')">Gửi</button>
              <button
                class="btn-ghost !px-2 !py-0.5 !text-[10px]"
                :disabled="sect.sectVault.wudao <= 0"
                @click="openMaterialModal('wudao', 'withdraw')"
              >
                Rút
              </button>
            </div>
          </div>
        </div>

        <!-- LINH THẢO (CẤP 1..5) -->
        <div class="card-ink p-3 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-kai font-bold text-[13px] text-ink flex items-center gap-1.5">
              <GameIcon name="leaf" :size="14" class="text-jade" />
              Linh Thảo Sơn Dược (Cấp 1 - 5)
            </span>
            <button class="btn-ghost !px-2.5 !py-0.5 !text-[11px]" @click="openHerbModal">
              Quản Lý Dược Thảo
            </button>
          </div>
          <div class="grid grid-cols-5 gap-1.5 text-center text-[11px]">
            <div v-for="g in 5" :key="g" class="bg-paper-deep/50 rounded p-1.5 border border-ink/10">
              <span class="text-ink-faint text-[10px] block">Cấp {{ g }}</span>
              <span class="font-bold text-ink">{{ sect.sectVault.herbs[g] ?? 0 }}</span>
            </div>
          </div>
        </div>

        <!-- ĐAN DƯỢC TRONG KHO TÔNG MÔN -->
        <div class="card-ink p-4 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 class="font-kai text-[14px] font-bold text-ink flex items-center gap-1.5">
                <GameIcon name="flask" :size="15" class="text-cinnabar" />
                Đan Dược Trong Kho
              </h4>
              <p class="text-[11px] text-ink-faint">
                Đệ tử tự tích lũy cống hiến để đổi đan phá vỡ bình cảnh hoặc gia tốc tu vi
              </p>
            </div>
            <button class="btn-seal !px-3 !py-1.5 !text-[12px]" @click="openDepositPillModal">
              + Gửi Đan Dược Vào Kho
            </button>
          </div>

          <div v-if="vaultPillList.length === 0" class="text-center py-6 text-ink-faint text-[12px] bg-paper-deep/30 rounded border border-dashed border-ink/15">
            Kho Tông Môn hiện chưa có đan dược nào. Hãy gửi đan dược từ túi đồ vào đây để đệ tử tự tu luyện!
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div
              v-for="p in vaultPillList"
              :key="p.id"
              class="flex items-center justify-between rounded border border-ink/10 bg-paper-deep/40 p-2.5 text-[12px]"
            >
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="font-kai font-bold text-ink">{{ p.name }}</span>
                  <QualityTag v-if="p.quality" :quality="p.quality" />
                </div>
                <p class="text-[11px] text-ink-faint">
                  Số lượng: <strong class="text-ink">{{ p.count }}</strong> viên · Cần: <strong class="text-azure">{{ p.cost }}</strong> cống hiến
                </p>
              </div>
              <button
                class="btn-ghost !px-2 !py-1 !text-[11px] text-ink-soft hover:text-ink shrink-0"
                @click="handleWithdrawPill(p.id)"
              >
                Rút Về Túi
              </button>
            </div>
          </div>
        </div>

        <!-- TRANG BỊ TRONG KHO TÔNG MÔN -->
        <div class="card-ink p-4 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 class="font-kai text-[14px] font-bold text-ink flex items-center gap-1.5">
                <GameIcon name="sword" :size="15" class="text-azure" />
                Trang Bị Trong Kho ({{ sect.sectVault.equipments.length }})
              </h4>
              <p class="text-[11px] text-ink-faint">
                Đệ tử tự đổi binh khí & phòng cụ để gia tăng thực lực chiến đấu
              </p>
            </div>
            <button class="btn-seal !px-3 !py-1.5 !text-[12px]" @click="openDepositEquipModal">
              + Gửi Trang Bị Vào Kho
            </button>
          </div>

          <div v-if="sect.sectVault.equipments.length === 0" class="text-center py-6 text-ink-faint text-[12px] bg-paper-deep/30 rounded border border-dashed border-ink/15">
            Kho Tông Môn hiện chưa có trang bị nào. Hãy gửi trang bị từ túi đồ vào để trang bị cho đệ tử!
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div
              v-for="eq in sect.sectVault.equipments"
              :key="eq.uid"
              class="rounded border border-ink/10 bg-paper-deep/40 p-2.5 text-[12px] space-y-1.5"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span class="font-kai font-bold text-ink">{{ displayEquipName(equipmentTemplate(eq.templateId)?.name ?? 'Trang bị') }}</span>
                  <QualityTag :quality="eq.quality" />
                  <span v-if="eq.level" class="text-azure font-semibold">+{{ eq.level }}</span>
                </div>
                <button
                  class="btn-ghost !px-2 !py-0.5 !text-[10px] text-ink-soft hover:text-ink"
                  @click="handleWithdrawEquipment(eq.uid)"
                >
                  Rút Về Túi
                </button>
              </div>
              <div class="flex justify-between text-[11px] text-ink-faint">
                <span>Giai tầng {{ eq.tier }} · Vị trí: {{ displayEquipSlot(equipmentTemplate(eq.templateId)?.slot ?? '') }}</span>
                <span class="text-azure font-semibold">Cần {{ getEquipmentVaultCost(eq) }} cống hiến</span>
              </div>
            </div>
          </div>
        </div>

        <!-- LƯU Ý QUY CHẾ KHO TÔNG MÔN -->
        <div class="card-ink p-3 space-y-1.5 text-[11px] border-azure/20 bg-azure/5">
          <span class="font-kai font-bold text-[12px] text-azure flex items-center gap-1.5">
            <GameIcon name="scroll" :size="13" />
            CƠ CHẾ TỰ ĐỘNG HÓA CỦA ĐỆ TỬ
          </span>
          <p class="text-ink-soft leading-relaxed">
            Mỗi tháng, đệ tử tông môn sẽ tự động làm nhiệm vụ tuần tra sơn môn và sự vụ môn phái để kiếm điểm cống hiến tông môn. Khi tích lũy đủ điểm, đệ tử sẽ tự động đến Kho Tông Môn để đổi đan dược phá giải bình cảnh tu vi hoặc đổi trang bị phù hợp với cảnh giới để gia tăng thực lực chiến đấu.
          </p>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- TAB 3: XÉT DUYỆT NHẬP TÔNG (APPLICANTS) -->
      <!-- =================================================================== -->
      <div v-else-if="activeTab === 'applicant'" class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <SectionTitle title="Xét Duyệt Nhập Tông" :hint="`Mỗi tháng có 5 tu sĩ tìm đến (${sect.pendingApplicants.length} đang chờ)`" />

          <div class="flex items-center gap-2 text-[12px]">
            <span class="text-ink-faint">Chỗ trống Ngoại môn:</span>
            <span class="font-bold text-azure">{{ Math.max(0, currentCaps.outer - rankCounts.outer) }} / {{ currentCaps.outer }}</span>
          </div>
        </div>

        <!-- Hàng nút thao tác hàng loạt -->
        <div v-if="sect.pendingApplicants.length > 0" class="flex gap-2">
          <button class="btn-seal !px-3 !py-1.5 !text-[12px]" @click="handleAcceptAllApplicants">
            Thu Nhận Tất Cả ({{ sect.pendingApplicants.length }})
          </button>
          <button class="btn-ghost !px-3 !py-1.5 !text-[12px] text-cinnabar hover:!bg-cinnabar/10" @click="handleRejectAllApplicants">
            Từ Chối Tất Cả
          </button>
        </div>

        <div v-if="sect.pendingApplicants.length === 0" class="card-ink p-8 text-center space-y-2">
          <div class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-ink/5 text-ink-faint">
            <GameIcon name="scroll" :size="24" />
          </div>
          <p class="font-kai text-[14px] text-ink-soft">Hiện tại không có hồ sơ nào đang chờ duyệt.</p>
          <p class="text-[11px] text-ink-faint">
            Tu sĩ khắp thiên hạ tìm đến nộp đơn vào đầu mỗi tháng (5 ứng viên mỗi đợt). Hồ sơ chưa xử lý sẽ được lưu lại.
          </p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="applicant in sect.pendingApplicants"
            :key="applicant.id"
            class="card-ink p-4 space-y-3 border-cinnabar/30"
          >
            <!-- Chi tiết ứng viên -->
            <div class="flex items-center justify-between border-b border-ink/10 pb-2.5">
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-kai text-[16px] font-bold text-ink">{{ applicant.name }}</h3>
                  <span class="text-[11px] text-ink-faint">({{ applicant.gender === 'male' ? 'Nam' : 'Nữ' }})</span>
                  <span
                    class="rounded px-1.5 py-0.5 text-[10px] font-kai font-semibold"
                    :class="applicant.tierRank === 'gold' ? 'bg-gold-ink/15 text-gold-ink' : applicant.tierRank === 'silver' ? 'bg-azure/15 text-azure' : 'bg-ink/10 text-ink-soft'"
                  >
                    {{ applicant.tierRank === 'gold' ? 'Thiên Kiêu Vàng' : applicant.tierRank === 'silver' ? 'Thiên Kiêu Bạc' : 'Phổ Thông' }}
                  </span>
                </div>
                <p class="text-[10px] text-ink-faint mt-0.5">
                  Nộp đơn vào: {{ formatSectDate(applicant.appliedMonth) }}
                </p>
              </div>
              <div class="text-right">
                <span class="rounded bg-cinnabar/10 px-2 py-0.5 font-kai text-[12px] font-bold text-cinnabar">
                  {{ realmText(applicant.major, applicant.sub) }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 text-[11px]">
              <div class="bg-paper-deep/40 rounded p-2 border border-ink/10">
                <span class="text-ink-faint block text-[10px]">Linh Căn:</span>
                <span class="font-kai font-semibold" :style="{ color: ELEMENTS[applicant.element].color }">
                  {{ ELEMENTS[applicant.element].name }} Linh Căn
                </span>
              </div>
              <div class="bg-paper-deep/40 rounded p-2 border border-ink/10">
                <span class="text-ink-faint block text-[10px]">Ngộ Tính:</span>
                <span class="font-semibold" :class="comprehensionRank(applicant.comprehension).colorClass">
                  {{ applicant.comprehension }} ({{ comprehensionRank(applicant.comprehension).label }})
                </span>
              </div>
            </div>

            <div class="space-y-1 bg-paper-deep/30 rounded p-2.5 text-[11px]">
              <p><strong class="text-ink-soft">Thỉnh cầu:</strong> <span class="italic text-ink-faint">"{{ applicant.brief }}"</span></p>
              <p><strong class="text-ink-soft">Đạo niệm:</strong> <span class="text-ink">{{ applicant.pursuit }}</span></p>
            </div>

            <!-- Tư chất bẩm sinh -->
            <div v-if="applicant.aptitudes.length > 0" class="space-y-1">
              <span class="text-[10px] font-kai font-semibold text-ink-soft">Tư chất:</span>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="aptId in applicant.aptitudes"
                  :key="aptId"
                  class="rounded border px-1.5 py-0.2 text-[10px] font-kai"
                  :class="APTITUDE_GRADE_META[aptitudeDef(aptId)?.grade || 1].borderClass"
                  :style="{ color: APTITUDE_GRADE_META[aptitudeDef(aptId)?.grade || 1].color }"
                >
                  {{ aptitudeDef(aptId)?.name || aptId }}
                </span>
              </div>
            </div>

            <!-- 2 Nút quyết định & Xem hồ sơ -->
            <div class="flex gap-2 pt-1 border-t border-ink/10">
              <button
                class="btn-ghost shrink-0 !px-3 !py-1.5 text-[12px]"
                @click="openApplicantProfile(applicant)"
              >
                <GameIcon name="user" :size="12" />Hồ Sơ
              </button>
              <button
                class="btn-seal grow !py-1.5 text-[12px]"
                :disabled="rankCounts.outer >= currentCaps.outer"
                @click="handleAcceptApplicant(applicant.id)"
              >
                {{ rankCounts.outer >= currentCaps.outer ? 'Ngoại Môn Đã Đầy' : 'Thu Nhận' }}
              </button>
              <button
                class="btn-ghost shrink-0 !px-4 !py-1.5 text-[12px] text-cinnabar hover:!bg-cinnabar/10"
                @click="handleRejectApplicant(applicant.id)"
              >
                Từ Chối
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- TAB: SƯ ĐỒ & TRUYỀN THỪA (MENTORSHIP) -->
      <!-- =================================================================== -->
      <div v-else-if="activeTab === 'mentorship'" class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <SectionTitle
            title="Viện Sư Đồ & Truyền Thừa"
            hint="Trưởng lão, Hộ pháp & Phó tông chủ kèm cặp đệ tử Ngoại môn (Tối đa 10 đệ tử/người)"
          />
        </div>

        <!-- THỐNG KÊ TỔNG QUAN SƯ ĐỒ -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[12px]">
          <div class="card-ink p-3 space-y-1">
            <span class="text-ink-faint text-[10px] block font-kai">NGƯỜI HƯỚNG DẪN</span>
            <div class="flex items-center justify-between">
              <span class="font-bold text-gold-ink font-kai text-[15px]">{{ mentorsList.length }} Vị</span>
              <span class="text-[10px] text-ink-faint">Trưởng lão / Hộ pháp / Phó tông chủ</span>
            </div>
          </div>

          <div class="card-ink p-3 space-y-1">
            <span class="text-ink-faint text-[10px] block font-kai">ĐỆ TỬ ĐÃ CÓ SƯ PHỤ</span>
            <div class="flex items-center justify-between">
              <span class="font-bold text-jade font-kai text-[15px]">
                {{ outerDisciples.length - unmentoredOuterDisciples.length }} / {{ outerDisciples.length }}
              </span>
              <span class="text-[10px] text-ink-faint">Đệ tử Ngoại môn</span>
            </div>
          </div>

          <div class="card-ink p-3 space-y-1">
            <span class="text-ink-faint text-[10px] block font-kai">CHƯA BÁI SƯ</span>
            <div class="flex items-center justify-between">
              <span class="font-bold text-cinnabar font-kai text-[15px]">{{ unmentoredOuterDisciples.length }} Vị</span>
              <span class="text-[10px] text-ink-faint">Cần phân bổ người kèm cặp</span>
            </div>
          </div>
        </div>

        <!-- DANH SÁCH NGƯỜI HƯỚNG DẪN & ĐỆ TỬ DƯỚI TRƯỚNG -->
        <div class="space-y-3">
          <div v-if="mentorsList.length === 0" class="card-ink p-6 text-center text-ink-faint italic text-[12px]">
            Tông môn hiện chưa có Trưởng lão, Hộ pháp hoặc Phó tông chủ nào để đảm nhận vai trò hướng dẫn đệ tử.
          </div>

          <div
            v-for="mentor in mentorsList"
            :key="mentor.id"
            class="card-ink p-3.5 space-y-3 border"
            :class="mentor.rank === 'elder' ? 'border-gold-ink/20' : 'border-azure/20'"
          >
            <!-- Header của Mentor -->
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-2.5">
              <div class="flex items-center gap-2">
                <span class="font-kai font-bold text-ink text-[14px]">{{ mentor.name }}</span>
                <span
                  class="rounded px-1.5 py-0.2 text-[9px] font-kai font-semibold border"
                  :class="mentor.rank === 'elder'
                    ? 'border-gold-ink/40 bg-gold-ink/10 text-gold-ink'
                    : 'border-azure/40 bg-azure/10 text-azure'"
                >
                  {{ SECT_RANK_NAMES[mentor.rank] }}
                </span>

                <!-- Chức danh Trưởng lão chuyên môn -->
                <div v-if="mentor.rank === 'elder'" class="flex items-center gap-1">
                  <select
                    :value="mentor.elderSpecialty || 'affairs'"
                    class="rounded border border-ink/15 bg-paper-deep/60 px-1.5 py-0.5 text-[10px] font-kai text-ink cursor-pointer focus:outline-none"
                    @change="handleChangeElderSpecialty(mentor.id, ($event.target as HTMLSelectElement).value as ElderSpecialty)"
                  >
                    <option
                      v-for="(def, key) in ELDER_SPECIALTY_DEFS"
                      :key="key"
                      :value="key"
                    >
                      {{ def.title }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Hạn ngạch kèm cặp (X/10) & Nút gán đệ tử -->
              <div class="flex items-center gap-2.5">
                <div class="text-right text-[11px]">
                  <span class="text-ink-faint">Đệ tử: </span>
                  <span
                    class="font-bold tabular font-kai"
                    :class="getDisciplesOfMentor(mentor.id).length >= MAX_MENTORED_PER_MASTER ? 'text-cinnabar' : 'text-jade'"
                  >
                    {{ getDisciplesOfMentor(mentor.id).length }} / {{ MAX_MENTORED_PER_MASTER }}
                  </span>
                </div>

                <button
                  v-if="getDisciplesOfMentor(mentor.id).length < MAX_MENTORED_PER_MASTER && unmentoredOuterDisciples.length > 0"
                  class="btn-seal !py-1 !px-2.5 !text-[10px]"
                  @click="openMentorAssignModal(mentor.id)"
                >
                  + Thu Nhận Đệ Tử
                </button>
              </div>
            </div>

            <!-- Mô tả hiệu quả chuyên môn của Trưởng lão -->
            <p v-if="mentor.elderSpecialty" class="text-[10px] text-ink-faint leading-relaxed italic">
              {{ ELDER_SPECIALTY_DEFS[mentor.elderSpecialty].desc }}
            </p>

            <!-- Danh sách đệ tử theo học -->
            <div class="space-y-1.5">
              <span class="text-[10px] font-kai text-ink-faint block">
                Đệ tử dưới trướng ({{ getDisciplesOfMentor(mentor.id).length }}):
              </span>

              <div
                v-if="getDisciplesOfMentor(mentor.id).length === 0"
                class="rounded bg-paper-deep/20 p-2.5 text-center text-[10px] text-ink-faint italic border border-dashed border-ink/10"
              >
                Chưa có đệ tử Ngoại môn nào được phân bổ dưới trướng vị sư phụ này.
              </div>

              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div
                  v-for="disc in getDisciplesOfMentor(mentor.id)"
                  :key="disc.id"
                  class="card-ink p-2 flex items-center justify-between gap-1.5"
                >
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="font-kai font-semibold text-ink text-[11px] truncate">{{ disc.name }}</span>
                      <span class="text-[9px] text-ink-faint">{{ displayRealmName(REALMS[disc.major]?.name ?? '') }}</span>
                      <span
                        v-if="disc.tierRank === 'gold'"
                        class="text-[9px] text-amber-ink font-bold font-kai"
                      >
                        [Thiên Kiêu Vàng]
                      </span>
                      <span
                        v-else-if="disc.tierRank === 'silver'"
                        class="text-[9px] text-azure font-bold font-kai"
                      >
                        [Thiên Kiêu Bạc]
                      </span>
                    </div>
                    <div class="text-[9px] text-ink-faint mt-0.5">
                      Tu vi: {{ disc.expPct }}% · Cống hiến: {{ disc.totalContributions }}
                    </div>
                  </div>

                  <div class="flex items-center gap-1 shrink-0">
                    <button
                      class="btn-ghost !px-1.5 !py-0.5 !text-[9px]"
                      @click="openDiscipleProfile(disc)"
                    >
                      Hồ Sơ
                    </button>
                    <button
                      class="p-1 text-cinnabar hover:bg-cinnabar/10 rounded text-[9px]"
                      title="Hủy gán đệ tử khỏi sư phụ"
                      @click="handleRemoveMentored(disc.id)"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- NHẬT KÝ DẠY DỖ & TRANH GIÀNH ĐỆ TỬ -->
        <div class="card-ink p-3.5 space-y-2.5">
          <div class="flex items-center justify-between border-b border-ink/10 pb-1.5">
            <span class="font-kai font-bold text-ink text-[12px]">Biên Niên Dạy Dỗ & Tranh Giành Đệ Tử</span>
            <span class="text-[10px] text-ink-faint">Ghi nhận các cuộc tỉ thí tranh đồ và truyền thụ</span>
          </div>

          <div v-if="mentorshipLogs.length === 0" class="text-ink-faint text-[11px] italic py-2 text-center">
            Chưa có ghi chép tranh giành đệ tử hay truyền thừa nào phát sinh.
          </div>
          <div v-else class="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            <div
              v-for="entry in mentorshipLogs"
              :key="entry.id"
              class="rounded bg-paper-deep/30 p-2 text-[10px] leading-relaxed border border-ink/5"
            >
              <span class="text-ink-soft">{{ entry.summary }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- TAB 3: NHIỆM VỤ ĐƯỜNG (QUESTS) -->
      <!-- =================================================================== -->
      <div v-else-if="activeTab === 'quests'" class="space-y-4">
        <SectionTitle title="Nhiệm Vụ Đường" hint="Tự động phân công đệ tử có tiềm năng thi hành nhiệm vụ" />

        <!-- Thanh điều khiển phái việc thông minh -->
        <div class="card-ink p-3 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="chip-ink text-[11px] text-ink-soft">
              Đệ tử rảnh rỗi: <strong class="text-ink">{{ idleDisciples.length }}</strong>/{{ sect.disciples.length }}
            </span>
            <span class="chip-ink text-[11px] text-ink-soft">
              Đang chấp hành: <strong class="text-ink">{{ sect.activeQuests.length }}</strong>/{{ SECT_QUEST_TEMPLATES.length }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-1.5 text-[12px] text-ink-soft cursor-pointer select-none">
              <input
                v-model="sect.autoDispatchQuests"
                type="checkbox"
                class="rounded border-ink/30 text-cinnabar focus:ring-cinnabar"
              />
              <span>Tự phái hàng tháng</span>
            </label>
            <button
              class="btn-seal !py-1.5 !px-3 text-[12px] flex items-center gap-1.5"
              :disabled="idleDisciples.length === 0 || sect.activeQuests.length >= SECT_QUEST_TEMPLATES.length"
              @click="sect.autoDispatchQuestsAction()"
            >
              <GameIcon name="sparkles" :size="14" />
              <span>Tự Động Phái Việc</span>
            </button>
          </div>
        </div>

        <!-- Nhiệm vụ đang thi hành -->
        <div v-if="sect.activeQuests.length > 0" class="space-y-2">
          <p class="text-[12px] font-kai font-semibold text-ink-soft">Nhiệm Vụ Đang Thực Hiện ({{ sect.activeQuests.length }})</p>
          <div
            v-for="q in sect.activeQuests"
            :key="q.uid"
            class="card-ink p-3 flex items-center justify-between"
          >
            <div>
              <p class="font-kai text-[14px] font-bold text-ink">{{ sectQuestTemplate(q.templateId)?.name }}</p>
              <p class="text-[11px] text-ink-faint">
                Đệ tử: <span class="text-ink font-semibold">{{ getDiscipleName(q.assignedDiscipleId) }}</span> · Dự kiến xong vào: {{ formatSectDate(q.finishMonth) }}
              </p>
            </div>
            <span class="rounded bg-azure/10 px-2 py-0.5 text-[11px] text-azure font-medium">Đang chấp hành</span>
          </div>
        </div>

        <!-- Danh sách nhiệm vụ sẵn sàng tiếp nhận -->
        <div class="space-y-2.5">
          <p class="text-[12px] font-kai font-semibold text-ink-soft">Danh Sách Nhiệm Vụ Tông Môn</p>
          <div
            v-for="tpl in SECT_QUEST_TEMPLATES"
            :key="tpl.id"
            class="card-ink p-3.5 space-y-2"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <GameIcon :name="tpl.icon" :size="16" class="text-jade" />
                <span class="font-kai text-[14px] font-bold text-ink">{{ tpl.name }}</span>
                <span class="rounded bg-ink/5 px-1.5 py-0.2 text-[10px] text-ink-faint">
                  Yêu cầu: {{ displayRealmName(REALMS[tpl.minMajor]?.name || 'Luyện Khí') }}
                </span>
                <span class="rounded bg-gold-ink/10 text-gold-ink px-1.5 py-0.2 text-[10px] font-medium">
                  Độ khó: {{ '★'.repeat(tpl.difficulty) }}
                </span>
              </div>
              <span class="text-[11px] text-ink-faint">Thời gian: {{ tpl.durationMonths }} tháng</span>
            </div>
            <p class="text-[11px] text-ink-soft leading-relaxed">{{ tpl.desc }}</p>

            <!-- Trạng thái hoặc đề cử tiềm năng -->
            <div v-if="getActiveQuestForTemplate(tpl.id)" class="text-[11px] text-azure bg-azure/5 px-2.5 py-1 rounded">
              Đang thi hành bởi: <span class="font-semibold text-ink">{{ getDiscipleName(getActiveQuestForTemplate(tpl.id)!.assignedDiscipleId) }}</span> (Dự kiến xong: {{ formatSectDate(getActiveQuestForTemplate(tpl.id)!.finishMonth) }})
            </div>
            <div v-else-if="getTopCandidateForQuest(tpl)" class="text-[11px] text-ink-faint bg-ink/5 px-2.5 py-1 rounded flex items-center justify-between">
              <span>Đề cử tiềm năng: <strong class="text-ink">{{ getTopCandidateForQuest(tpl)?.name }}</strong> ({{ realmText(getTopCandidateForQuest(tpl)!.major, getTopCandidateForQuest(tpl)!.sub) }})</span>
              <span class="text-gold-ink font-mono text-[10px]">Điểm phù hợp: {{ evaluateDiscipleQuestPotential(getTopCandidateForQuest(tpl)!, tpl) }}</span>
            </div>

            <div class="flex items-center justify-between pt-1 border-t border-ink/10">
              <span class="text-[11px] text-gold-ink">
                Phần thưởng: {{ formatQuestRewards(tpl) }}
              </span>
              <button
                v-if="getActiveQuestForTemplate(tpl.id)"
                class="btn-ghost !px-3 !py-1 !text-[11px] text-ink-faint cursor-not-allowed"
                disabled
              >
                Đang Thi Hành
              </button>
              <button
                v-else
                class="btn-seal !px-3 !py-1 !text-[11px]"
                :disabled="idleDisciples.length === 0"
                @click="openAssignModal(tpl)"
              >
                Giao Phái
              </button>
            </div>
          </div>
        </div>
      </div>



      <!-- =================================================================== -->
      <!-- TAB 4: TÀNG KINH CÁC (LIBRARY) -->
      <!-- =================================================================== -->
      <div v-else-if="activeTab === 'library'" class="space-y-4">
        <div class="flex items-center justify-between">
          <SectionTitle title="Tàng Kinh Các Tông Môn" :hint="`${sect.libraryGongfaIds.length} Công pháp lưu giữ`" />
          <button class="btn-seal !px-2.5 !py-1 !text-[11px]" @click="showAddGongfaModal = true">
            + Nạp Công Pháp
          </button>
        </div>

        <div v-if="sect.libraryGongfaIds.length === 0" class="card-ink p-8 text-center space-y-2">
          <p class="font-kai text-[14px] text-ink-soft">Tàng Kinh Các hiện chưa lưu trữ công pháp nào.</p>
          <p class="text-[11px] text-ink-faint">Tông chủ có thể nạp các công pháp, bí thuật mình đã lĩnh ngộ hoặc từ kho tàng tiên giới vào Tàng Kinh Các để truyền dạy cho đệ tử.</p>
        </div>

        <div v-else class="space-y-2.5">
          <div
            v-for="gId in sect.libraryGongfaIds"
            :key="gId"
            class="card-ink p-3.5 space-y-2"
          >
            <div class="flex items-center justify-between">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-kai text-[15px] font-bold text-ink">
                  {{ displayGongfaName(gongfaDef(gId)?.name || '') }}
                </span>
                <QualityTag v-if="gongfaDef(gId)?.quality" :quality="gongfaDef(gId)!.quality" />
                <span class="chip-ink border-ink/30 text-ink-soft text-[10px]">
                  {{ GONGFA_TYPE_NAMES[gongfaDef(gId)?.type || 'main'] }}
                </span>
                <span
                  v-if="gongfaDef(gId)?.element"
                  class="chip-ink text-[10px]"
                  :style="{ color: ELEMENTS[gongfaDef(gId)!.element!].color }"
                >
                  {{ ELEMENTS[gongfaDef(gId)!.element!].name }}
                </span>
                <span class="chip-ink border-ink/20 text-ink-faint text-[10px]">
                  {{ displayRealmName(REALMS[gongfaDef(gId)?.minRealm || 0]?.name || 'Luyện Khí') }}
                </span>
              </div>
              <button class="btn-ghost !px-2.5 !py-1 !text-[11px]" @click="openTeachModalForGongfa(gId)">
                Truyền Thụ
              </button>
            </div>
            <p class="text-[11px] text-ink-faint leading-relaxed">{{ displayGongfaDesc(gongfaDef(gId)?.desc || '') }}</p>
          </div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- TAB 5: THÁP LỊCH LUYỆN & BÍ CẢNH (TRIALS) -->
      <!-- =================================================================== -->
      <div v-else-if="activeTab === 'trials'" class="space-y-5">
        <!-- Phần 1: Tháp Lịch Luyện -->
        <div class="space-y-2.5">
          <SectionTitle title="Tháp Lịch Luyện" hint="Đệ tử khiêu chiến từng tầng thử thách" />

          <!-- Thanh điều khiển Tháp Lịch Luyện -->
          <div class="card-ink p-3 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="chip-ink text-[11px] text-ink-soft">
                Đệ tử: <strong class="text-ink">{{ livingDisciplesCount }}</strong>
              </span>
              <span class="chip-ink text-[11px] text-ink-soft">
                Tầng cao nhất: <strong class="text-gold-ink">Tầng {{ maxTowerFloor }}</strong>
              </span>
            </div>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1.5 text-[12px] text-ink-soft cursor-pointer select-none">
                <input
                  v-model="sect.autoTowerChallenge"
                  type="checkbox"
                  class="rounded border-ink/30 text-cinnabar focus:ring-cinnabar"
                />
                <span>Tự đấu tháp hàng tháng</span>
              </label>
              <button
                class="btn-seal !py-1.5 !px-3 text-[12px] flex items-center gap-1.5"
                :disabled="livingDisciplesCount === 0"
                @click="sect.autoChallengeTowerAction()"
              >
                <GameIcon name="swords" :size="14" />
                <span>Toàn Bộ Khiêu Chiến</span>
              </button>
            </div>
          </div>

          <div class="card-ink p-4 space-y-3">
            <p class="text-[11px] text-ink-soft leading-relaxed">
              Tháp Lịch Luyện là nơi tôi luyện ý chí và chiến lực đệ tử. Mỗi tầng có Thủ Quan Thạch Khôi trấn giữ, vượt ải nhận thưởng linh thạch, cống hiến và tăng tu vi.
            </p>
            <div class="space-y-2">
              <div
                v-for="d in livingDisciples"
                :key="d.id"
                class="flex items-center justify-between rounded border border-ink/10 p-2.5 text-[12px]"
              >
                <div>
                  <span class="font-kai font-bold text-ink">{{ d.name }}</span>
                  <span class="text-ink-faint text-[11px] ml-1">({{ realmText(d.major, d.sub) }})</span>
                  <p class="text-[11px] text-gold-ink">Đã vượt: Tầng {{ d.towerFloor }}</p>
                </div>
                <button
                  class="btn-seal !px-3 !py-1.5 !text-[11px]"
                  @click="handleDiscipleChallengeTower(d)"
                >
                  Khiêu Chiến Tầng {{ d.towerFloor + 1 }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Phần 2: Bí Cảnh Tông Môn -->
        <div class="space-y-2.5">
          <SectionTitle title="Bí Cảnh Tông Môn" hint="Thám hiểm thu thập cơ duyên vạn kiếp" />
          <div class="space-y-2.5">
            <div
              v-for="realm in SECT_SECRET_REALMS"
              :key="realm.id"
              class="card-ink p-4 space-y-2"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-kai text-[15px] font-bold text-ink">{{ realm.name }}</h4>
                  <p class="text-[11px] text-ink-faint">
                    Yêu cầu: {{ displayRealmName(REALMS[realm.minMajor]?.name || 'Luyện Khí') }} · Chi phí: {{ realm.costStone }} Linh thạch
                  </p>
                </div>
                <span class="rounded bg-jade/10 px-2 py-0.5 text-[11px] font-kai font-semibold text-jade">
                  Độ khó cấp {{ realm.difficulty }}
                </span>
              </div>
              <p class="text-[11px] text-ink-soft leading-relaxed">{{ realm.brief }}</p>
              <div class="flex justify-end pt-1">
                <button
                  class="btn-seal !px-3 !py-1 !text-[11px]"
                  :disabled="sect.disciples.length === 0"
                  @click="openRealmModalWithDef(realm)"
                >
                  Cử Đệ Tử Thám Hiểm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>



      <!-- =================================================================== -->
      <!-- TAB 6: CHIẾN TRANH & PHỤ THUỘC (WAR & VASSALS) -->
      <!-- =================================================================== -->
      <div v-else-if="activeTab === 'war'" class="space-y-5">
        <!-- HỊCH TUYÊN CHIẾN ĐANG CHỜ XỬ LÝ (NẾU CÓ) -->
        <div
          v-if="sect.pendingWarDeclaration"
          class="card-ink p-4 space-y-3 border-cinnabar bg-cinnabar/10 animate-pulse"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="grid h-8 w-8 place-items-center rounded-full bg-cinnabar text-paper font-bold text-[14px]">!</span>
              <div>
                <h4 class="font-kai text-[15px] font-bold text-cinnabar">
                  HỊCH TUYÊN CHIẾN: {{ sect.pendingWarDeclaration.sectName }} (Cấp {{ sect.pendingWarDeclaration.sectLevel }})
                </h4>
                <p class="text-[11px] text-ink-soft">
                  Quân địch áp sát sơn môn! Lực chiến đối phương: <strong class="text-cinnabar">{{ sect.pendingWarDeclaration.combatPower.toLocaleString() }}</strong>
                </p>
              </div>
            </div>
            <span class="rounded bg-cinnabar text-paper px-2 py-0.5 text-[10px] font-kai font-bold">
              Khẩn Cấp
            </span>
          </div>

          <div class="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-cinnabar/20">
            <button
              class="btn-seal !bg-cinnabar !px-4 !py-1.5 !text-[12px]"
              @click="handleRespondWar('accept')"
            >
              Đồng Ý Giao Chiến (Huyết Chiến)
            </button>
            <button
              class="btn-ghost !px-4 !py-1.5 !text-[12px] text-ink-soft hover:text-cinnabar"
              @click="handleRespondWar('surrender')"
            >
              Không Giao Chiến (Chấp Nhận Phụ Thuộc)
            </button>
          </div>
        </div>

        <!-- THẾ LỰC ĐÔ HỘ (NẾU ĐANG LÀ CHƯ HẦU) -->
        <div
          v-if="sect.overlordSectId"
          class="card-ink p-4 space-y-3 border-amber-ink/50 bg-amber-ink/10"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                <span class="rounded bg-amber-ink text-paper px-1.5 py-0.2 text-[9px] font-kai font-bold">CHƯ HẦU</span>
                <h4 class="font-kai text-[15px] font-bold text-ink">
                  Đang Quy Phục: {{ overlordSect?.name ?? 'Tông Môn Đô Hộ' }}
                </h4>
              </div>
              <p class="text-[11px] text-ink-soft mt-1">
                Tông môn hằng tháng phải nộp cống phẩm tài nguyên. Ngươi có thể chỉnh đốn binh mã, khởi binh lật đổ ách thống trị!
              </p>
            </div>
            <button
              class="btn-seal !bg-amber-ink !px-3.5 !py-1.5 !text-[12px]"
              @click="handleRebelIndependence"
            >
              Khởi Binh Giành Độc Lập
            </button>
          </div>
        </div>

        <!-- Tổng quan chiến lực & Triệu tập Lão tổ -->
        <div class="card-ink p-4 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-2.5">
            <div>
              <h3 class="font-kai text-[16px] font-bold text-ink">CHIẾN LỰC TÔNG MÔN</h3>
              <p class="text-[11px] text-ink-faint">Tổng hợp chiến lực toàn bộ đệ tử, chức sắc và hộ tông cường giả</p>
            </div>
            <div class="text-right">
              <span class="font-kai text-[18px] font-bold text-cinnabar">{{ calculatedPlayerSectPower.toLocaleString() }}</span>
              <span class="text-[11px] text-ink-faint ml-1">Chiến lực</span>
            </div>
          </div>

          <!-- Lựa chọn thỉnh cầu Lão tổ xuất sơn -->
          <div class="flex items-center justify-between rounded bg-paper-deep/40 p-2.5 text-[12px] border border-ink/10">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="summonAncestorForWar"
                type="checkbox"
                class="rounded border-ink/30 text-cinnabar focus:ring-0"
              />
              <span class="font-kai font-semibold text-ink">Thỉnh Cầu Lão Tổ Xuất Sơn Trợ Chiến</span>
            </label>
            <span class="text-[11px] text-amber-ink font-semibold">
              {{ hasAvailableAncestor ? '+50% Tổng Chiến Lực' : '(Chưa có Lão Tổ trấn tông)' }}
            </span>
          </div>
        </div>

        <!-- Danh sách Tông môn Thế giới -->
        <div class="space-y-2.5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <SectionTitle title="Tông Môn Thế Giới" :hint="`25 Thế lực tu chân hùng cứ thiên hạ (${filteredWorldSects.length} môn phái)`" />

            <!-- Bộ lọc cấp Tông Môn -->
            <div class="flex flex-wrap gap-1 text-[11px]">
              <button
                v-for="lvl in WORLD_SECT_LEVEL_OPTIONS"
                :key="lvl.id"
                class="rounded px-2 py-0.5 transition-colors"
                :class="worldSectLevelFilter === lvl.id ? 'bg-ink text-paper font-semibold' : 'bg-paper-deep text-ink-faint hover:text-ink'"
                @click="worldSectLevelFilter = lvl.id"
              >
                {{ lvl.label }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="ws in filteredWorldSects"
              :key="ws.id"
              class="card-ink p-3.5 space-y-2.5"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-kai text-[15px] font-bold text-ink">{{ ws.name }}</h4>
                  <p class="text-[11px] text-ink-faint">
                    Tông chủ: {{ ws.leaderName }} · Cấp {{ ws.level }}
                  </p>
                </div>
                <span
                  class="rounded px-2 py-0.5 text-[10px] font-kai font-semibold"
                  :class="ws.status === 'active' ? 'bg-cinnabar/10 text-cinnabar' : ws.status === 'vassal' ? 'bg-jade/10 text-jade' : 'bg-ink/10 text-ink-faint'"
                >
                  {{ ws.status === 'active' ? 'Đang Hoạt Động' : ws.status === 'vassal' ? 'Đã Thu Phục' : 'Đã Diệt Vong' }}
                </span>
              </div>

              <!-- Chiến lực & Tài nguyên còn lại -->
              <div class="grid grid-cols-2 gap-2 text-[11px] bg-paper-deep/30 rounded p-2">
                <div>
                  <span class="text-ink-faint block text-[10px]">Chiến lực:</span>
                  <span class="font-bold text-cinnabar">{{ ws.combatPower.toLocaleString() }}</span>
                </div>
                <div>
                  <span class="text-ink-faint block text-[10px]">Tài nguyên:</span>
                  <span class="text-ink-soft">{{ ws.resources.stone.toLocaleString() }} Linh thạch</span>
                </div>
              </div>

              <!-- Nút hành động -->
              <div class="flex items-center justify-end gap-2 pt-1">
                <button
                  class="btn-ghost !px-2.5 !py-1 !text-[11px]"
                  @click="openInspectSect(ws)"
                >
                  <GameIcon name="compass" :size="12" />Quan Sát
                </button>
                <button
                  v-if="ws.status === 'active'"
                  class="btn-seal !px-3 !py-1 !text-[11px]"
                  @click="handleDeclareWar(ws.id)"
                >
                  Khiêu Chiến
                </button>
                <span v-else-if="ws.status === 'vassal'" class="text-[11px] text-jade font-semibold">
                  ✓ Phụ Thuộc
                </span>
                <span v-else class="text-[11px] text-ink-faint italic">
                  Đã san bằng sơn môn
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Danh sách Tông môn Phụ thuộc & Cống nộp hằng tháng -->
        <div class="space-y-2.5">
          <SectionTitle title="Tông Môn Phụ Thuộc" :hint="`${sect.vassalSects.length} Thế lực xưng thần quy phục`" />

          <div v-if="sect.vassalSects.length === 0" class="card-ink p-6 text-center text-ink-faint text-[12px]">
            Hiện chưa có tông môn nào xưng thần phụ thuộc. Hãy khiêu chiến và thu phục các thế lực khác trong thiên hạ!
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="vs in sect.vassalSects"
              :key="vs.id"
              class="card-ink p-3.5 space-y-2"
            >
              <div class="flex items-center justify-between border-b border-ink/10 pb-2">
                <div>
                  <h4 class="font-kai text-[15px] font-bold text-ink">{{ vs.name }}</h4>
                  <p class="text-[10px] text-ink-faint">
                    Quy phục từ: {{ formatSectDate(vs.vassalSinceMonth) }} · Chưởng môn: {{ vs.leaderName }}
                  </p>
                </div>
                <span class="rounded bg-jade/10 px-2 py-0.5 text-[11px] font-kai font-semibold text-jade">
                  Đã cống nộp: {{ vs.totalTributesPaid }} lần
                </span>
              </div>

              <!-- Quy định cống nộp hằng tháng -->
              <div class="space-y-1 text-[11px]">
                <p class="font-kai font-semibold text-ink-soft">Mức cống nộp định kỳ mỗi tháng (Cấp {{ vs.level }}):</p>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-ink">
                  <div class="bg-paper-deep/40 rounded p-1.5 text-center">
                    <span class="text-ink-faint text-[10px] block">Linh thạch</span>
                    <span class="font-semibold text-gold-ink">{{ (VASSAL_TRIBUTE_CONFIG[vs.level]?.stone || 2000).toLocaleString() }} / tháng</span>
                  </div>
                  <div class="bg-paper-deep/40 rounded p-1.5 text-center">
                    <span class="text-ink-faint text-[10px] block">Khoáng thạch</span>
                    <span class="font-semibold text-azure">{{ VASSAL_TRIBUTE_CONFIG[vs.level]?.ore || 5 }} / tháng</span>
                  </div>
                  <div class="bg-paper-deep/40 rounded p-1.5 text-center">
                    <span class="text-ink-faint text-[10px] block">Linh thảo</span>
                    <span class="font-semibold text-jade">{{ VASSAL_TRIBUTE_CONFIG[vs.level]?.herb || 10 }} / tháng</span>
                  </div>
                  <div class="bg-paper-deep/40 rounded p-1.5 text-center">
                    <span class="text-ink-faint text-[10px] block">Đan dược</span>
                    <span class="font-semibold text-cinnabar">{{ VASSAL_TRIBUTE_CONFIG[vs.level]?.pills || 0 }} viên / tháng</span>
                  </div>
                </div>
              </div>

              <div v-if="vs.totalDeficitCount > 0" class="text-[10px] text-amber-ink italic">
                * Tông môn này đã từng thiếu hụt tài nguyên {{ vs.totalDeficitCount }} lần (được tự động trích nộp phần còn lại, không âm).
              </div>
            </div>
          </div>
        </div>

        <!-- Lịch sử cống nộp gần nhất -->
        <div v-if="sect.tributeHistory.length > 0" class="space-y-2">
          <SectionTitle title="Nhật Ký Cống Nộp Gần Nhất" hint="Lịch sử thu nạp tài nguyên phụ thuộc" />
          <div class="space-y-1.5 max-h-48 overflow-y-auto">
            <div
              v-for="trib in sect.tributeHistory.slice(0, 8)"
              :key="trib.id"
              class="card-ink p-2 text-[11px] flex items-center justify-between"
            >
              <div>
                <span class="font-kai font-bold text-ink">{{ trib.vassalName }}</span>
                <span class="text-ink-faint ml-2">{{ formatSectDate(trib.gameMonth) }}</span>
                <p class="text-ink-soft">{{ trib.summary }}</p>
              </div>
              <span class="text-[10px] text-jade font-semibold shrink-0 ml-2">Đã Nhập Kho</span>
            </div>
          </div>
        </div>
      </div>



      <!-- =================================================================== -->
      <!-- TAB 7: TỈ THÍ TÔNG MÔN & THĂNG CẤP (TOURNAMENT) -->
      <!-- =================================================================== -->
      <div v-else-if="activeTab === 'tournament'" class="space-y-4">
        <SectionTitle title="Tỉ Thí Tông Môn & Thăng Cấp" hint="Tổ chức định kỳ mỗi 6 tháng game" />

        <div class="card-ink p-4 space-y-2 text-[12px]">
          <p class="font-kai text-[14px] font-bold text-ink">QUY CHẾ TỈ THÍ VÀ XÉT THĂNG CẤP</p>
          <p class="text-ink-soft leading-relaxed">
            Cứ mỗi <strong>6 tháng game</strong>, Tông môn sẽ mở đại hội tỉ thí nội bộ. Tỉ thí được <strong>phân thành 3 phân bảng độc lập</strong>: <strong>Bảng Chân Truyền</strong> (Chân truyền vs Chân truyền), <strong>Bảng Nội Môn</strong> (Nội môn vs Nội môn) và <strong>Bảng Ngoại Môn</strong> (Ngoại môn vs Ngoại môn). Người thắng cuộc mỗi bảng được ban thưởng linh thạch, điểm cống hiến và tăng tiến tu vi.
          </p>
          <p class="text-ink-soft leading-relaxed">
            Các chức vụ khác (Trưởng Lão, Hộ Pháp, Phó Tông Chủ, Lão Tổ) là bậc tiền bối/chức sắc không tham gia tỉ thí đệ tử, mà có 2 con đường: <strong>1 là được Tông Chủ trực tiếp chỉ định bổ nhiệm</strong>, <strong>2 là khi tu vi và cống hiến đạt mức độ nhất định</strong> sẽ được môn phái tự động tấn thăng vào kỳ xét duyệt bán niên.
          </p>
          <div class="flex justify-between text-[11px] pt-1 border-t border-ink/10 text-ink-faint">
            <span>Kỳ trước tổ chức vào: Tháng {{ sect.lastTournamentMonth || 0 }}</span>
            <span class="text-cinnabar font-semibold">Kỳ tiếp theo: Tháng {{ nextTournamentMonth }}</span>
          </div>
        </div>

        <!-- Lịch sử tỉ thí -->
        <div v-if="sect.tournamentHistory.length === 0" class="card-ink p-6 text-center text-ink-faint text-[12px]">
          Chưa tổ chức kỳ tỉ thí nào. Hãy tiếp tục tu hành tới chu kỳ 6 tháng tiếp theo.
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="tourn in sect.tournamentHistory"
            :key="tourn.id"
            class="card-ink p-4 space-y-2.5"
          >
            <div class="flex items-center justify-between border-b border-ink/10 pb-2">
              <div>
                <h4 class="font-kai text-[15px] font-bold text-ink">Đại Hội Tỉ Thí Kỳ Thứ {{ tourn.tournamentIndex }}</h4>
                <p class="text-[10px] text-ink-faint">Tháng {{ tourn.month }}, năm thứ {{ tourn.year }} · {{ tourn.participantsCount }} đệ tử tham gia</p>
              </div>
              <span class="rounded bg-gold-ink/15 px-2 py-0.5 text-[11px] font-kai font-bold text-gold-ink">
                Quán Quân: {{ tourn.winnerName }}
              </span>
            </div>

            <!-- Hiển thị theo Phân Bảng: Chân truyền vs Chân truyền, Nội môn vs Nội môn, Ngoại môn vs Ngoại môn -->
            <div v-if="tourn.divisions && tourn.divisions.length > 0" class="space-y-3 pt-1">
              <div
                v-for="div in tourn.divisions"
                :key="div.division"
                class="rounded bg-paper-deep/30 p-2.5 border border-ink/10 space-y-2"
              >
                <div class="flex items-center justify-between border-b border-ink/10 pb-1.5">
                  <div class="flex items-center gap-1.5">
                    <span
                      class="rounded px-1.5 py-0.5 text-[10px] font-kai font-bold"
                      :class="div.division === 'true' ? 'bg-gold-ink/15 text-gold-ink border border-gold-ink/30' : div.division === 'inner' ? 'bg-azure/15 text-azure border border-azure/30' : 'bg-ink/10 text-ink-soft border border-ink/20'"
                    >
                      {{ div.divisionName }}
                    </span>
                    <span class="text-[10px] text-ink-faint">({{ div.participantsCount }} đệ tử tranh tài)</span>
                  </div>
                  <span v-if="div.winnerName" class="text-[11px] font-kai font-bold text-cinnabar">
                    Quán Quân: {{ div.winnerName }}
                  </span>
                </div>

                <div class="space-y-1.5 text-[11px]">
                  <div
                    v-for="r in div.rankings"
                    :key="r.discipleId"
                    class="flex items-center justify-between rounded bg-paper/60 px-2.5 py-1.5 border border-ink/5"
                  >
                    <div class="flex items-center gap-2">
                      <span
                        class="grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold"
                        :class="r.rank === 1 ? 'bg-gold-ink text-paper' : r.rank === 2 ? 'bg-azure text-paper' : r.rank === 3 ? 'bg-jade text-paper' : 'bg-ink/10 text-ink-faint'"
                      >
                        {{ r.rank }}
                      </span>
                      <span class="font-kai font-semibold text-ink">{{ r.discipleName }}</span>
                      <span class="text-ink-faint">({{ realmText(r.major, r.sub) }})</span>
                    </div>
                    <span class="text-azure text-[10px]">{{ r.rewardSummary }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Fallback cho kỷ lục cũ nếu không có divisions -->
            <div v-else class="space-y-1.5 text-[11px]">
              <div
                v-for="r in tourn.rankings"
                :key="r.discipleId"
                class="flex items-center justify-between rounded bg-paper-deep/40 px-2.5 py-1.5"
              >
                <div class="flex items-center gap-2">
                  <span
                    class="grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold"
                    :class="r.rank === 1 ? 'bg-gold-ink text-paper' : r.rank === 2 ? 'bg-azure text-paper' : r.rank === 3 ? 'bg-jade text-paper' : 'bg-ink/10 text-ink-faint'"
                  >
                    {{ r.rank }}
                  </span>
                  <span class="font-kai font-semibold text-ink">{{ r.discipleName }}</span>
                  <span class="text-ink-faint">({{ realmText(r.major, r.sub) }})</span>
                </div>
                <span class="text-azure text-[10px]">{{ r.rewardSummary }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>



      <!-- =================================================================== -->
      <!-- TAB 8: TÔNG MÔN SỬ (HISTORY) -->
      <!-- =================================================================== -->
      <div v-else-if="activeTab === 'history'" class="space-y-4">
        <div class="flex items-center justify-between">
          <SectionTitle title="Tông Môn Sử" hint="Biên niên sử phát triển của môn phái" />
        </div>

        <!-- Bộ lọc thể loại -->
        <div class="flex flex-wrap gap-1.5 text-[11px]">
          <button
            v-for="cat in HISTORY_FILTERS"
            :key="cat.id"
            class="rounded px-2.5 py-1 transition-all"
            :class="historyFilter === cat.id ? 'bg-ink text-paper font-semibold' : 'bg-paper-deep text-ink-faint hover:text-ink'"
            @click="historyFilter = cat.id"
          >
            {{ cat.label }}
          </button>
        </div>

        <div v-if="filteredHistory.length === 0" class="card-ink p-8 text-center text-ink-faint text-[12px]">
          Chưa có sự kiện nào được ghi nhận trong danh mục này.
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="h in filteredHistory"
            :key="h.id"
            class="card-ink p-3 text-[12px] space-y-1"
          >
            <div class="flex items-center justify-between text-[10px] text-ink-faint">
              <span class="rounded px-1.5 py-0.2 bg-ink/5">{{ categoryLabel(h.category) }}</span>
              <span class="tabular">Tháng {{ h.month }}, Năm {{ h.year }}</span>
            </div>
            <p class="text-ink leading-relaxed font-kai text-[13px]">{{ h.summary }}</p>
          </div>
        </div>
      </div>
    </template>

    <!-- ===================================================================== -->
    <!-- MODAL BỔ NHIỆM / THĂNG CẤP CHỨC VỤ ĐỆ TỬ -->
    <!-- ===================================================================== -->
    <BaseModal :open="promoteModal.show" :title="`Bổ Nhiệm Cấp Bậc: ${promoteModal.disciple?.name || ''}`" @close="promoteModal.show = false">
      <div v-if="promoteModal.disciple" class="space-y-4 text-[12px]">
        <div class="bg-paper-deep/40 rounded p-2.5 space-y-1 border border-ink/10">
          <p><span class="text-ink-faint">Đệ tử:</span> <strong class="text-ink">{{ promoteModal.disciple.name }}</strong> ({{ realmText(promoteModal.disciple.major, promoteModal.disciple.sub) }})</p>
          <p><span class="text-ink-faint">Cấp bậc hiện tại:</span> <strong class="text-cinnabar">{{ SECT_RANK_NAMES[promoteModal.disciple.rank || 'outer'] }}</strong></p>
          <p><span class="text-ink-faint">Ngộ tính:</span> {{ promoteModal.disciple.comprehension }} · <span class="text-ink-faint">Chiến tích tỉ thí:</span> {{ promoteModal.disciple.battlesWon || 0 }} thắng</p>
        </div>

        <div class="rounded bg-paper-deep/30 p-2.5 text-[11px] text-ink-soft border border-ink/10 space-y-1">
          <p>1. <strong>Tông Chủ Chỉ Định:</strong> Tông chủ có quyền đặc cách bổ nhiệm thành viên vào bất kỳ chức vị nào (nếu chỉ tiêu cấp Tông môn còn chỗ trống).</p>
          <p>2. <strong>Tự Động Tấn Thăng:</strong> Thành viên đạt cảnh giới, cống hiến hoặc đoạt thứ hạng cao trong kỳ Tỉ Thí Tông Môn sẽ được môn phái tự động tấn thăng vào kỳ xét duyệt bán niên.</p>
        </div>

        <div class="space-y-2">
          <p class="font-kai font-semibold text-ink-soft">Chọn cấp bậc bổ nhiệm mới:</p>
          <div class="space-y-1.5">
            <div
              v-for="rankOpt in AVAILABLE_RANKS_FOR_APPOINTMENT"
              :key="rankOpt.rank"
              class="flex items-center justify-between rounded border p-2.5 transition-all cursor-pointer"
              :class="promoteModal.targetRank === rankOpt.rank ? 'border-cinnabar bg-cinnabar/5' : 'border-ink/15 hover:border-ink/30'"
              @click="promoteModal.targetRank = rankOpt.rank"
            >
              <div>
                <span class="font-kai font-bold text-ink">{{ rankOpt.name }}</span>
                <span class="text-ink-faint text-[10px] ml-2">({{ rankOpt.capDesc }})</span>
              </div>
              <span v-if="promoteModal.targetRank === rankOpt.rank" class="text-cinnabar font-bold">✓</span>
              <span v-else-if="rankOpt.isFull" class="text-ink-faint text-[10px]">(Đã đầy)</span>
            </div>
          </div>
        </div>

        <div class="flex gap-2 justify-end pt-2">
          <button class="btn-ghost !px-4 !py-2 !text-[12px]" @click="promoteModal.show = false">Hủy</button>
          <button
            class="btn-seal !px-4 !py-2 !text-[12px]"
            :disabled="!promoteModal.targetRank || promoteModal.targetRank === promoteModal.disciple.rank"
            @click="confirmPromote"
          >
            Xác Nhận Bổ Nhiệm
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- ===================================================================== -->
    <!-- MODAL NHƯỜNG NGÔI LÃO TỔ -->
    <!-- ===================================================================== -->
    <BaseModal :open="abdicateModal.show" title="Nhường Ngôi Tông Chủ & Thăng Hoa Lão Tổ" @close="abdicateModal.show = false">
      <div class="space-y-4 text-[12px]">
        <p class="text-ink-soft leading-relaxed">
          Tông chủ sẽ thăng hoa trở thành <strong>Lão Tổ</strong> trấn phái của Tông môn. Lão tổ siêu thoát khỏi các sự vụ quản lý thường nhật, nhưng sẽ xuất sơn trấn áp cường địch khi xảy ra chiến tranh tông môn (+50% chiến lực toàn môn).
        </p>

        <div class="space-y-1.5">
          <label class="block font-kai font-semibold text-ink">CHỌN NGƯỜI KẾ THỪA CHỨC TÔNG CHỦ:</label>
          <select
            v-model="abdicateModal.successorId"
            class="w-full rounded border border-ink/20 bg-paper px-3 py-2 text-ink text-[12px]"
          >
            <option v-for="d in eligibleSuccessors" :key="d.id" :value="d.id">
              {{ d.name }} [{{ SECT_RANK_NAMES[d.rank || 'outer'] }}] ({{ realmText(d.major, d.sub) }}, Ngộ tính {{ d.comprehension }})
            </option>
          </select>
        </div>

        <div class="flex gap-2 justify-end pt-2">
          <button class="btn-ghost !px-4 !py-2 !text-[12px]" @click="abdicateModal.show = false">Hủy Bỏ</button>
          <button
            class="btn-seal !px-4 !py-2 !text-[12px]"
            :disabled="!abdicateModal.successorId"
            @click="confirmAbdicate"
          >
            Xác Nhận Nhường Ngôi
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- ===================================================================== -->
    <!-- MODAL ĐỊNH ĐOẠT KẾT QUẢ CHIẾN TRANH: DIỆT TÔNG VS THU PHỤC -->
    <!-- ===================================================================== -->
    <BaseModal :open="warOutcomeModal.show" :title="`Đại Thắng: ${warOutcomeModal.targetName}`" @close="warOutcomeModal.show = false">
      <div class="space-y-4 text-[12px]">
        <p class="text-ink-soft leading-relaxed">
          Đại quân tông môn đã công phá đại trận hộ sơn của <strong>{{ warOutcomeModal.targetName }}</strong>! Đối phương đã thảm bại và quỳ gối trước uy danh bản tông. Hãy hạ lệnh định đoạt số phận của thế lực này:
        </p>

        <div class="space-y-2.5">
          <!-- Lựa chọn 1: Diệt môn -->
          <div
            class="cursor-pointer rounded-lg border p-3 transition-all"
            :class="warOutcomeModal.choice === 'destroy' ? 'border-cinnabar bg-cinnabar/5' : 'border-ink/15 hover:border-ink/30'"
            @click="warOutcomeModal.choice = 'destroy'"
          >
            <div class="flex items-center justify-between">
              <span class="font-kai text-[14px] font-bold text-cinnabar">San Bằng Sơn Môn (Diệt Tông)</span>
              <span v-if="warOutcomeModal.choice === 'destroy'" class="text-cinnabar font-bold">✓</span>
            </div>
            <p class="mt-1 text-[11px] text-ink-soft">
              Tịch thu toàn bộ tài nguyên còn lại trong bảo khố của đối phương. Tông môn này sẽ biến mất vĩnh viễn khỏi thiên hạ.
            </p>
          </div>

          <!-- Lựa chọn 2: Thu phục phụ thuộc -->
          <div
            class="cursor-pointer rounded-lg border p-3 transition-all"
            :class="warOutcomeModal.choice === 'vassalize' ? 'border-jade bg-jade/5' : 'border-ink/15 hover:border-ink/30'"
            @click="warOutcomeModal.choice = 'vassalize'"
          >
            <div class="flex items-center justify-between">
              <span class="font-kai text-[14px] font-bold text-jade">Thu Phục Làm Tông Môn Phụ Thuộc</span>
              <span v-if="warOutcomeModal.choice === 'vassalize'" class="text-jade font-bold">✓</span>
            </div>
            <p class="mt-1 text-[11px] text-ink-soft">
              Bảo tồn đạo thống và nhân sự độc lập của đối phương, nhưng buộc phải xưng thần và định kỳ cống nộp linh thạch, quặng, thảo dược, đan dược hằng tháng cho bản tông.
            </p>
          </div>
        </div>

        <div class="flex gap-2 justify-end pt-2">
          <button class="btn-seal !px-4 !py-2 !text-[12px]" @click="confirmWarOutcome">
            Thực Thi Mệnh Lệnh
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- ===================================================================== -->
    <!-- MODAL GIAO NHIỆM VỤ CHO ĐỆ TỬ -->
    <!-- ===================================================================== -->
    <BaseModal :open="assignModal.show" :title="`Giao Phái: ${assignModal.template?.name || 'Nhiệm Vụ'}`" @close="assignModal.show = false">
      <div class="space-y-4">
        <div class="flex items-center justify-between text-[12px] text-ink-soft">
          <span>Chọn một đệ tử nhàn rỗi (Được sắp xếp theo tiềm năng phù hợp):</span>
          <span v-if="assignModal.template" class="chip-ink text-[10px]">
            Yêu cầu: {{ displayRealmName(REALMS[assignModal.template.minMajor]?.name || 'Luyện Khí') }}
          </span>
        </div>

        <div v-if="assignCandidates.length === 0" class="card-ink p-6 text-center text-[12px] text-ink-faint">
          Hiện không có đệ tử nào đang rảnh rỗi trong tông môn!
        </div>

        <div v-else class="max-h-72 overflow-y-auto space-y-2 pr-1">
          <div
            v-for="item in assignCandidates"
            :key="item.disciple.id"
            class="rounded border p-2.5 transition-all flex items-center justify-between"
            :class="[
              assignModal.selectedDiscipleId === item.disciple.id ? 'border-cinnabar bg-cinnabar/5' : 'border-ink/15 hover:border-ink/30',
              item.eligible ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed bg-ink/5'
            ]"
            @click="item.eligible && (assignModal.selectedDiscipleId = item.disciple.id)"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-kai font-bold text-ink text-[13px]">{{ item.disciple.name }}</span>
                <span
                  class="rounded px-1.5 py-0.2 text-[10px] font-kai font-semibold"
                  :class="item.disciple.tierRank === 'gold' ? 'bg-gold-ink/15 text-gold-ink' : item.disciple.tierRank === 'silver' ? 'bg-azure/15 text-azure' : 'bg-ink/10 text-ink-soft'"
                >
                  {{ item.disciple.tierRank === 'gold' ? 'Thiên Kiêu Vàng' : item.disciple.tierRank === 'silver' ? 'Thiên Kiêu Bạc' : 'Phổ Thông' }}
                </span>
                <span class="chip-ink border-ink/20 text-ink-faint text-[9px]">
                  {{ SECT_RANK_NAMES[item.disciple.rank] }}
                </span>
                <span
                  v-if="item.isElementMatch"
                  class="chip-ink border-jade/30 text-jade bg-jade/10 text-[9px]"
                >
                  Tương Hợp {{ ELEMENTS[item.disciple.element]?.name }}
                </span>
              </div>
              <p class="text-[11px] text-ink-faint">
                {{ realmText(item.disciple.major, item.disciple.sub) }} · Ngộ tính:
                <span class="font-semibold" :class="comprehensionRank(item.disciple.comprehension).colorClass">
                  {{ item.disciple.comprehension }}
                </span>
                <span v-if="item.disciple.towerFloor"> · Tháp tầng {{ item.disciple.towerFloor }}</span>
              </p>
            </div>

            <div class="flex items-center gap-3 shrink-0">
              <div class="text-right">
                <span class="text-[10px] text-ink-faint block">Độ phù hợp</span>
                <span
                  class="font-mono text-[13px] font-bold"
                  :class="item.score >= 100 ? 'text-cinnabar' : item.score >= 50 ? 'text-gold-ink' : 'text-ink'"
                >
                  {{ item.eligible ? item.score : 'Chưa Đạt' }}
                </span>
              </div>
              <span v-if="assignModal.selectedDiscipleId === item.disciple.id" class="text-cinnabar font-bold text-base">✓</span>
              <span v-else class="w-4"></span>
            </div>
          </div>
        </div>

        <div class="flex gap-2 justify-end pt-2 border-t border-ink/10">
          <button class="btn-ghost !px-4 !py-2 !text-[12px]" @click="assignModal.show = false">Hủy Bỏ</button>
          <button class="btn-seal !px-4 !py-2 !text-[12px]" :disabled="!assignModal.selectedDiscipleId" @click="confirmAssignQuest">
            Xác Nhận Phái Đi
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- ===================================================================== -->
    <!-- MODAL NẠP CÔNG PHÁP VÀO TÀNG KINH CÁC -->
    <!-- ===================================================================== -->
    <BaseModal :open="showAddGongfaModal" title="Nạp Công Pháp Vào Tàng Kinh Các" @close="showAddGongfaModal = false">
      <div class="space-y-4">
        <!-- Chuyển đổi nguồn công pháp -->
        <div class="flex border-b border-ink/10 pb-2 gap-2 text-[13px]">
          <button
            class="px-3 py-1.5 rounded transition-colors font-kai"
            :class="gongfaModalTab === 'learned' ? 'bg-ink/10 font-bold text-ink' : 'text-ink-soft hover:text-ink'"
            @click="gongfaModalTab = 'learned'"
          >
            Tông Chủ Đã Lĩnh Ngộ ({{ learnedGongfasToDeposit.length }})
          </button>
          <button
            class="px-3 py-1.5 rounded transition-colors font-kai"
            :class="gongfaModalTab === 'all' ? 'bg-ink/10 font-bold text-ink' : 'text-ink-soft hover:text-ink'"
            @click="gongfaModalTab = 'all'"
          >
            Kho Tàng Tiên Giới ({{ allAvailableCount }})
          </button>
        </div>

        <!-- TAB 1: TÔNG CHỦ ĐÃ LĨNH NGỘ -->
        <div v-if="gongfaModalTab === 'learned'" class="space-y-3">
          <div class="flex items-center justify-between text-[12px] bg-ink/5 p-2.5 rounded">
            <span class="text-ink-soft">
              Tông chủ đã lĩnh ngộ {{ Object.keys(cultivation.learned).length }} môn công pháp & bí thuật.
            </span>
            <button
              v-if="learnedGongfasToDeposit.length > 0"
              class="btn-seal !px-3 !py-1 !text-[11px]"
              @click="depositAllLearned"
            >
              Nạp Toàn Bộ ({{ learnedGongfasToDeposit.length }})
            </button>
          </div>

          <div v-if="learnedGongfasToDeposit.length === 0" class="text-center py-6 text-ink-faint text-[12px] card-ink space-y-1">
            <template v-if="Object.keys(cultivation.learned).length === 0">
              <p class="font-kai text-[13px] text-ink-soft">Tông chủ hiện tại chưa lĩnh ngộ công pháp hay bí thuật nào trong bản thân.</p>
              <p class="text-[11px]">Ngươi có thể chuyển sang tab <strong>"Kho Tàng Tiên Giới"</strong> để trực tiếp nạp công pháp vào Tàng Kinh Các!</p>
            </template>
            <template v-else>
              <p class="font-kai text-[13px] text-ink-soft">Tất cả công pháp Tông chủ đã lĩnh ngộ đều đã được lưu giữ trong Tàng Kinh Các.</p>
              <p class="text-[11px]">Ngươi có thể sang tab <strong>"Kho Tàng Tiên Giới"</strong> để thu nạp thêm các môn phái tuyệt kỹ khác.</p>
            </template>
          </div>

          <div v-else class="max-h-72 overflow-y-auto space-y-2 pr-1">
            <div
              v-for="gf in learnedGongfasToDeposit"
              :key="gf.id"
              class="card-ink p-2.5 space-y-1.5"
            >
              <div class="flex items-center justify-between">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span class="font-kai font-bold text-ink text-[13px]">{{ displayGongfaName(gf.name) }}</span>
                  <QualityTag :quality="gf.quality" />
                  <span class="chip-ink border-ink/30 text-ink-soft text-[10px]">{{ GONGFA_TYPE_NAMES[gf.type] }}</span>
                  <span
                    v-if="gf.element"
                    class="chip-ink text-[10px]"
                    :style="{ color: ELEMENTS[gf.element].color }"
                  >
                    {{ ELEMENTS[gf.element].name }}
                  </span>
                  <span class="chip-ink border-ink/20 text-ink-faint text-[10px]">
                    Yêu cầu: {{ displayRealmName(REALMS[gf.minRealm]?.name || 'Luyện Khí') }}
                  </span>
                </div>
                <button class="btn-seal !px-2.5 !py-1 !text-[11px]" @click="depositGongfa(gf.id)">
                  Nạp Vào
                </button>
              </div>
              <div class="flex items-center justify-between text-[11px]">
                <span class="text-ink-faint line-clamp-1">{{ displayGongfaDesc(gf.desc) }}</span>
                <span class="text-gold-ink font-mono shrink-0 ml-2">
                  Tông chủ: Tầng {{ cultivation.learned[gf.id] || 1 }}/{{ gf.maxLevel }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: TOÀN BỘ KHO TÀNG TIÊN GIỚI -->
        <div v-else class="space-y-3">
          <div class="flex flex-wrap gap-2">
            <input
              v-model="gongfaSearch"
              type="text"
              placeholder="Tìm kiếm tên công pháp / bí thuật..."
              class="flex-1 min-w-[140px] rounded border border-ink/20 bg-paper px-2.5 py-1 text-[12px] text-ink placeholder:text-ink-faint"
            />
            <select
              v-model="gongfaFilterType"
              class="rounded border border-ink/20 bg-paper px-2 py-1 text-[12px] text-ink"
            >
              <option value="all">Tất cả loại</option>
              <option value="main">Chủ Tu</option>
              <option value="sub">Phụ Tu</option>
              <option value="secret">Bí Thuật</option>
            </select>
            <select
              v-model="gongfaFilterElement"
              class="rounded border border-ink/20 bg-paper px-2 py-1 text-[12px] text-ink"
            >
              <option value="all">Tất cả ngũ hành</option>
              <option value="metal">Kim</option>
              <option value="wood">Mộc</option>
              <option value="water">Thủy</option>
              <option value="fire">Hỏa</option>
              <option value="earth">Thổ</option>
              <option value="none">Vô tính</option>
            </select>
          </div>

          <div v-if="allGongfasFiltered.length === 0" class="text-center py-6 text-ink-faint text-[12px]">
            Không tìm thấy công pháp phù hợp với bộ lọc.
          </div>
          <div v-else class="max-h-72 overflow-y-auto space-y-2 pr-1">
            <div
              v-for="gf in allGongfasFiltered"
              :key="gf.id"
              class="card-ink p-2.5 space-y-1.5"
            >
              <div class="flex items-center justify-between">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span class="font-kai font-bold text-ink text-[13px]">{{ displayGongfaName(gf.name) }}</span>
                  <QualityTag :quality="gf.quality" />
                  <span class="chip-ink border-ink/30 text-ink-soft text-[10px]">{{ GONGFA_TYPE_NAMES[gf.type] }}</span>
                  <span
                    v-if="gf.element"
                    class="chip-ink text-[10px]"
                    :style="{ color: ELEMENTS[gf.element].color }"
                  >
                    {{ ELEMENTS[gf.element].name }}
                  </span>
                  <span class="chip-ink border-ink/20 text-ink-faint text-[10px]">
                    Yêu cầu: {{ displayRealmName(REALMS[gf.minRealm]?.name || 'Luyện Khí') }}
                  </span>
                </div>
                <div>
                  <span
                    v-if="sect.libraryGongfaIds.includes(gf.id)"
                    class="rounded bg-ink/10 px-2 py-0.5 text-[10px] text-ink-faint"
                  >
                    Đã Có Trong Các
                  </span>
                  <button
                    v-else
                    class="btn-seal !px-2.5 !py-1 !text-[11px]"
                    @click="depositGongfa(gf.id)"
                  >
                    Nạp Vào
                  </button>
                </div>
              </div>
              <p class="text-[11px] text-ink-faint leading-relaxed line-clamp-1">{{ gf.desc }}</p>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button class="btn-ghost !px-4 !py-2 !text-[12px]" @click="showAddGongfaModal = false">Đóng</button>
        </div>
      </div>
    </BaseModal>

    <!-- ===================================================================== -->
    <!-- MODAL TRUYỀN THỤ CÔNG PHÁP CHO ĐỆ TỬ -->
    <!-- ===================================================================== -->
    <BaseModal :open="teachModal.show" title="Truyền Thụ Công Pháp" @close="teachModal.show = false">
      <div class="space-y-4">
        <div v-if="sect.disciples.length > 1" class="flex items-center gap-2 text-[12px]">
          <span class="text-ink-soft shrink-0">Chọn đệ tử tiếp nhận:</span>
          <select
            v-model="teachModal.selectedDiscipleId"
            class="w-full rounded border border-ink/20 bg-paper px-2.5 py-1 text-ink text-[12px]"
          >
            <option v-for="d in sect.disciples" :key="d.id" :value="d.id">
              {{ d.name }} ({{ displayRealmName(REALMS[d.major]?.name ?? '') }}, Linh căn {{ ELEMENTS[d.element].name }}, Ngộ tính {{ d.comprehension }})
            </option>
          </select>
        </div>
        <p v-else-if="currentTeachDisciple" class="text-[12px] text-ink-soft">
          Đệ tử: <strong>{{ currentTeachDisciple.name }}</strong> ({{ displayRealmName(REALMS[currentTeachDisciple.major]?.name ?? '') }}, Linh căn: {{ ELEMENTS[currentTeachDisciple.element].name }}, Ngộ tính: {{ currentTeachDisciple.comprehension }})
        </p>

        <div v-if="sect.libraryGongfaIds.length === 0" class="text-center py-6 text-ink-faint text-[12px]">
          Tàng Kinh Các hiện chưa lưu trữ công pháp nào. Hãy nạp công pháp vào trước!
        </div>
        <div v-else class="max-h-72 overflow-y-auto space-y-2 pr-1">
          <div
            v-for="gId in sect.libraryGongfaIds"
            :key="gId"
            class="card-ink p-2.5 space-y-1.5"
            :class="{ 'border-gold-ink/40 bg-gold-ink/5': teachModal.preselectedGongfaId === gId }"
          >
            <div class="flex items-center justify-between">
              <div class="flex flex-wrap items-center gap-1.5">
                <span class="font-kai font-bold text-ink text-[13px]">{{ displayGongfaName(gongfaDef(gId)?.name || '') }}</span>
                <QualityTag v-if="gongfaDef(gId)?.quality" :quality="gongfaDef(gId)!.quality" />
                <span class="chip-ink border-ink/30 text-ink-soft text-[10px]">
                  {{ GONGFA_TYPE_NAMES[gongfaDef(gId)?.type || 'main'] }}
                </span>
                <span
                  v-if="gongfaDef(gId)?.element"
                  class="chip-ink text-[10px]"
                  :style="{ color: ELEMENTS[gongfaDef(gId)!.element!].color }"
                >
                  {{ ELEMENTS[gongfaDef(gId)!.element!].name }}
                </span>
                <span class="chip-ink border-ink/20 text-ink-faint text-[10px]">
                  Yêu cầu: {{ displayRealmName(REALMS[gongfaDef(gId)?.minRealm || 0]?.name || 'Luyện Khí') }}
                </span>
              </div>

              <div>
                <span
                  v-if="currentTeachDisciple?.learnedGongfa.includes(gId)"
                  class="rounded bg-ink/10 px-2 py-0.5 text-[10px] text-ink-faint"
                >
                  Đã Học
                </span>
                <button
                  v-else
                  class="btn-seal !px-2.5 !py-1 !text-[11px]"
                  :disabled="!getGongfaTeachEligibility(gId, currentTeachDisciple).canLearn"
                  :title="getGongfaTeachEligibility(gId, currentTeachDisciple).reason"
                  @click="confirmTeach(gId)"
                >
                  Truyền Thụ
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between text-[11px]">
              <span class="text-ink-faint leading-relaxed line-clamp-1">{{ displayGongfaDesc(gongfaDef(gId)?.desc || '') }}</span>
              <span
                v-if="!currentTeachDisciple?.learnedGongfa.includes(gId) && !getGongfaTeachEligibility(gId, currentTeachDisciple).canLearn"
                class="text-cinnabar text-[10px] shrink-0 ml-2"
              >
                {{ getGongfaTeachEligibility(gId, currentTeachDisciple).reason }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button class="btn-ghost !px-4 !py-2 !text-[12px]" @click="teachModal.show = false">Đóng</button>
        </div>
      </div>
    </BaseModal>

    <!-- ===================================================================== -->
    <!-- MODAL QUAN SÁT TÔNG MÔN ĐỐI THỦ -->
    <!-- ===================================================================== -->
    <InspectSectModal
      :open="inspectModal.open"
      :sect="inspectModal.sect"
      @close="inspectModal.open = false"
      @inspect-member="handleInspectWorldSectMember"
    />

    <!-- ===================================================================== -->
    <!-- MODAL BẢNG THUỘC TÍNH TOÀN CẢNH NPC -->
    <!-- ===================================================================== -->
    <NpcProfileModal
      :open="profileModal.open"
      :profile="profileModal.profile"
      @close="profileModal.open = false"
      @updated="refreshDiscipleProfileModal"
    />

    <!-- ===================================================================== -->
    <!-- MODAL BAN THƯỞNG LINH THẠCH CHO ĐỆ TỬ -->
    <!-- ===================================================================== -->
    <BaseModal :open="rewardModal.show" title="Ban Thưởng Linh Thạch" @close="rewardModal.show = false">
      <div v-if="rewardModal.disciple" class="space-y-4 text-[12px]">
        <div class="flex items-center gap-2 border-b border-ink/10 pb-2">
          <span class="font-kai text-[15px] font-bold text-ink">{{ rewardModal.disciple.name }}</span>
          <span class="text-ink-faint">({{ realmText(rewardModal.disciple.major, rewardModal.disciple.sub) }})</span>
          <span class="text-azure ml-auto">Đang có: {{ formatNum(playerStoneNum) }} Linh thạch</span>
        </div>

        <p class="text-ink-soft leading-relaxed">
          Tông chủ ban thưởng linh thạch cho đệ tử bế quan tu luyện. Đệ tử sẽ hấp thu linh khí tăng tiến tu vi (+5% ~ 50%), tích lũy cống hiến môn phái và có cơ hội phá vỡ bình cảnh tu hành!
        </p>

        <div class="space-y-1.5">
          <label class="block font-kai font-semibold text-ink">SỐ LƯỢNG LINH THẠCH BAN THƯỞNG:</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="amt in [1000, 5000, 10000, 50000]"
              :key="amt"
              class="rounded border px-2.5 py-1 text-[11px] transition-all"
              :class="rewardModal.amount === amt ? 'border-amber-ink bg-amber-ink/15 text-amber-ink font-bold' : 'border-ink/15 text-ink-soft hover:border-ink/30'"
              @click="rewardModal.amount = amt"
            >
              {{ formatNum(amt) }}
            </button>
          </div>
          <input
            v-model.number="rewardModal.amount"
            type="number"
            min="100"
            step="500"
            class="w-full rounded border border-ink/20 bg-paper px-3 py-1.5 text-[12px] text-ink focus:border-cinnabar focus:outline-none"
          />
        </div>

        <div class="flex gap-2 justify-end pt-2">
          <button class="btn-ghost !px-4 !py-2 !text-[12px]" @click="rewardModal.show = false">Hủy</button>
          <button
            class="btn-seal !px-4 !py-2 !text-[12px] !bg-amber-ink/90 text-cream"
            :disabled="rewardModal.amount <= 0 || rewardModal.amount > playerStoneNum"
            @click="confirmRewardDisciple"
          >
            Xác Nhận Ban Thưởng
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- ===================================================================== -->
    <!-- MODAL TRỤC XUẤT ĐỆ TỬ KHỎI TÔNG MÔN -->
    <!-- ===================================================================== -->
    <BaseModal :open="expelModal.show" title="Trục Xuất Đệ Tử" @close="expelModal.show = false">
      <div v-if="expelModal.disciple" class="space-y-4 text-[12px]">
        <div class="p-3 rounded bg-scarlet/10 border border-scarlet/30 space-y-2">
          <p class="font-kai font-bold text-cinnabar text-[13px]">
            CẢNH BÁO TRỤC XUẤT KHỎI SƠN MÔN
          </p>
          <p class="text-ink-soft leading-relaxed">
            Ngươi có chắc chắn muốn hạ lệnh trục xuất đệ tử <strong class="text-ink">{{ expelModal.disciple.name }}</strong> [{{ SECT_RANK_NAMES[expelModal.disciple.rank || 'outer'] }}] ra khỏi tông môn không?
          </p>
          <p class="text-ink-faint text-[11px]">
            Mọi chức vị, cống hiến môn phái sẽ bị hủy bỏ. Toàn bộ trang bị của đệ tử sẽ được thu hồi về Kho Tông Môn.
          </p>
        </div>

        <div class="flex gap-2 justify-end pt-2">
          <button class="btn-ghost !px-4 !py-2 !text-[12px]" @click="expelModal.show = false">Suy Nghĩ Lại</button>
          <button
            class="btn-seal !px-4 !py-2 !text-[12px] !bg-cinnabar text-cream"
            @click="confirmExpelDisciple"
          >
            Xác Nhận Trục Xuất
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- ===================================================================== -->
    <!-- MODAL GỬI / RÚT LINH THẠCH KHO TÔNG MÔN -->
    <!-- ===================================================================== -->
    <BaseModal :open="stoneModal.show" :title="stoneModal.mode === 'deposit' ? 'Gửi Linh Thạch Vào Kho' : 'Rút Linh Thạch Từ Kho'" @close="stoneModal.show = false">
      <div class="space-y-4 text-[12px]">
        <div class="flex justify-between border-b border-ink/10 pb-2">
          <span class="text-ink-faint">Túi đồ: <strong class="text-ink">{{ formatNum(playerStoneNum) }}</strong></span>
          <span class="text-ink-faint">Kho Tông Môn: <strong class="text-amber-ink">{{ formatNum(sect.sectVault.stone) }}</strong></span>
        </div>

        <div class="space-y-1.5">
          <label class="block font-kai font-semibold text-ink">SỐ LƯỢNG LINH THẠCH:</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="amt in [10000, 50000, 200000, 1000000]"
              :key="amt"
              class="rounded border px-2.5 py-1 text-[11px] transition-all"
              :class="stoneModal.amount === amt ? 'border-amber-ink bg-amber-ink/15 text-amber-ink font-bold' : 'border-ink/15 text-ink-soft hover:border-ink/30'"
              @click="stoneModal.amount = amt"
            >
              {{ formatNum(amt) }}
            </button>
          </div>
          <input
            v-model.number="stoneModal.amount"
            type="number"
            min="1000"
            step="5000"
            class="w-full rounded border border-ink/20 bg-paper px-3 py-1.5 text-[12px] text-ink focus:border-cinnabar focus:outline-none"
          />
        </div>

        <div class="flex gap-2 justify-end pt-2">
          <button class="btn-ghost !px-4 !py-2 !text-[12px]" @click="stoneModal.show = false">Hủy</button>
          <button
            class="btn-seal !px-4 !py-2 !text-[12px]"
            @click="confirmStoneModal"
          >
            {{ stoneModal.mode === 'deposit' ? 'Xác Nhận Gửi' : 'Xác Nhận Rút' }}
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- ===================================================================== -->
    <!-- MODAL GỬI / RÚT NGUYÊN LIỆU KHO TÔNG MÔN -->
    <!-- ===================================================================== -->
    <BaseModal :open="materialModal.show" :title="materialModal.mode === 'deposit' ? 'Gửi Nguyên Liệu Vào Kho' : 'Rút Nguyên Liệu Từ Kho'" @close="materialModal.show = false">
      <div class="space-y-4 text-[12px]">
        <div class="flex justify-between border-b border-ink/10 pb-2">
          <span class="text-ink-faint">Loại: <strong class="text-ink">{{ materialModalName }}</strong></span>
          <span class="text-ink-faint">Trong kho: <strong class="text-azure">{{ materialModalVaultCount }}</strong></span>
        </div>

        <div class="space-y-1.5">
          <label class="block font-kai font-semibold text-ink">SỐ LƯỢNG NGUYÊN LIỆU:</label>
          <div class="flex gap-2">
            <button
              v-for="amt in [5, 10, 20, 50]"
              :key="amt"
              class="rounded border px-2.5 py-1 text-[11px] transition-all"
              :class="materialModal.count === amt ? 'border-azure bg-azure/15 text-azure font-bold' : 'border-ink/15 text-ink-soft hover:border-ink/30'"
              @click="materialModal.count = amt"
            >
              {{ amt }}
            </button>
          </div>
          <input
            v-model.number="materialModal.count"
            type="number"
            min="1"
            class="w-full rounded border border-ink/20 bg-paper px-3 py-1.5 text-[12px] text-ink focus:border-cinnabar focus:outline-none"
          />
        </div>

        <div class="flex gap-2 justify-end pt-2">
          <button class="btn-ghost !px-4 !py-2 !text-[12px]" @click="materialModal.show = false">Hủy</button>
          <button
            class="btn-seal !px-4 !py-2 !text-[12px]"
            @click="confirmMaterialModal"
          >
            {{ materialModal.mode === 'deposit' ? 'Xác Nhận Gửi' : 'Xác Nhận Rút' }}
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- ===================================================================== -->
    <!-- MODAL QUẢN LÝ DƯỢC THẢO (CẤP 1..5) -->
    <!-- ===================================================================== -->
    <BaseModal :open="herbModal.show" title="Quản Lý Linh Thảo Kho Tông Môn" @close="herbModal.show = false">
      <div class="space-y-4 text-[12px]">
        <div class="space-y-2">
          <p class="font-kai font-semibold text-ink-soft">Chọn phẩm cấp linh thảo:</p>
          <div class="grid grid-cols-5 gap-1.5">
            <button
              v-for="g in 5"
              :key="g"
              class="rounded border p-2 text-center transition-all"
              :class="herbModal.grade === g ? 'border-jade bg-jade/15 text-jade font-bold' : 'border-ink/15 hover:border-ink/30'"
              @click="herbModal.grade = g as HerbGrade"
            >
              <span class="block text-[10px] text-ink-faint">Cấp</span>
              <span class="text-[14px] font-bold">{{ g }}</span>
              <span class="block text-[9px] text-ink-soft mt-0.5">Kho: {{ sect.sectVault.herbs[g] ?? 0 }}</span>
            </button>
          </div>
        </div>

        <div class="flex justify-between text-[11px] bg-paper-deep/40 rounded p-2 border border-ink/10">
          <span>Túi có: <strong class="text-ink">{{ resources.herbOf(herbModal.grade) }}</strong></span>
          <span>Kho có: <strong class="text-jade">{{ sect.sectVault.herbs[herbModal.grade] ?? 0 }}</strong></span>
        </div>

        <div class="space-y-1.5">
          <label class="block font-kai font-semibold text-ink">SỐ LƯỢNG:</label>
          <div class="flex gap-2">
            <button
              v-for="amt in [5, 10, 20, 50]"
              :key="amt"
              class="rounded border px-2.5 py-1 text-[11px] transition-all"
              :class="herbModal.count === amt ? 'border-jade bg-jade/15 text-jade font-bold' : 'border-ink/15 text-ink-soft hover:border-ink/30'"
              @click="herbModal.count = amt"
            >
              {{ amt }}
            </button>
          </div>
          <input
            v-model.number="herbModal.count"
            type="number"
            min="1"
            class="w-full rounded border border-ink/20 bg-paper px-3 py-1.5 text-[12px] text-ink focus:border-cinnabar focus:outline-none"
          />
        </div>

        <div class="flex gap-2 justify-end pt-2">
          <button class="btn-ghost !px-4 !py-2 !text-[12px]" @click="herbModal.show = false">Đóng</button>
          <button class="btn-ghost !px-4 !py-2 !text-[12px] text-cinnabar" @click="confirmWithdrawHerb">Rút Ra Túi</button>
          <button class="btn-seal !px-4 !py-2 !text-[12px]" @click="confirmDepositHerb">Gửi Vào Kho</button>
        </div>
      </div>
    </BaseModal>

    <!-- ===================================================================== -->
    <!-- MODAL GỬI ĐAN DƯỢC VÀO KHO TÔNG MÔN -->
    <!-- ===================================================================== -->
    <BaseModal :open="depositPillModal.show" title="Gửi Đan Dược Vào Kho" @close="depositPillModal.show = false">
      <div class="space-y-4 text-[12px]">
        <div v-if="playerBagPills.length === 0" class="text-center py-6 text-ink-faint">
          Túi đồ hiện không có đan dược nào để gửi vào kho.
        </div>
        <div v-else class="space-y-2">
          <p class="font-kai font-semibold text-ink-soft">Chọn đan dược trong túi đồ:</p>
          <div class="max-h-60 overflow-y-auto space-y-1.5 pr-1">
            <div
              v-for="p in playerBagPills"
              :key="p.id"
              class="flex items-center justify-between rounded border p-2 cursor-pointer transition-all"
              :class="depositPillModal.selectedPillId === p.id ? 'border-cinnabar bg-cinnabar/5' : 'border-ink/15 hover:border-ink/30'"
              @click="depositPillModal.selectedPillId = p.id"
            >
              <div class="flex items-center gap-1.5">
                <span class="font-kai font-bold text-ink">{{ p.name }}</span>
                <QualityTag v-if="p.quality" :quality="p.quality" />
                <span class="text-[10px] text-ink-faint ml-2">(Có {{ p.count }} viên)</span>
              </div>
              <span v-if="depositPillModal.selectedPillId === p.id" class="text-cinnabar font-bold">✓</span>
            </div>
          </div>

          <div v-if="depositPillModal.selectedPillId" class="space-y-1.5 pt-2 border-t border-ink/10">
            <label class="block font-kai font-semibold text-ink">Số lượng gửi:</label>
            <input
              v-model.number="depositPillModal.count"
              type="number"
              min="1"
              :max="inventory.pills[depositPillModal.selectedPillId] ?? 1"
              class="w-full rounded border border-ink/20 bg-paper px-3 py-1.5 text-[12px] text-ink"
            />
          </div>
        </div>

        <div class="flex gap-2 justify-end pt-2">
          <button class="btn-ghost !px-4 !py-2 !text-[12px]" @click="depositPillModal.show = false">Hủy</button>
          <button
            class="btn-seal !px-4 !py-2 !text-[12px]"
            :disabled="!depositPillModal.selectedPillId || depositPillModal.count <= 0"
            @click="confirmDepositPill"
          >
            Xác Nhận Gửi Vào Kho
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- ===================================================================== -->
    <!-- MODAL GỬI TRANG BỊ VÀO KHO TÔNG MÔN -->
    <!-- ===================================================================== -->
    <BaseModal :open="depositEquipModal.show" title="Gửi Trang Bị Vào Kho" @close="depositEquipModal.show = false">
      <div class="space-y-4 text-[12px]">
        <div v-if="playerBagEquipments.length === 0" class="text-center py-6 text-ink-faint">
          Túi đồ hiện không có trang bị nhàn rỗi nào để gửi vào kho.
        </div>
        <div v-else class="space-y-2">
          <p class="font-kai font-semibold text-ink-soft">Chọn trang bị trong túi đồ:</p>
          <div class="max-h-64 overflow-y-auto space-y-1.5 pr-1">
            <div
              v-for="item in playerBagEquipments"
              :key="item.uid"
              class="flex items-center justify-between rounded border p-2 cursor-pointer transition-all"
              :class="depositEquipModal.selectedUid === item.uid ? 'border-cinnabar bg-cinnabar/5' : 'border-ink/15 hover:border-ink/30'"
              @click="depositEquipModal.selectedUid = item.uid"
            >
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="font-kai font-bold text-ink">{{ displayEquipName(equipmentTemplate(item.templateId)?.name ?? 'Trang bị') }}</span>
                  <QualityTag :quality="item.quality" />
                  <span v-if="item.level" class="text-azure text-[10px] font-semibold">+{{ item.level }}</span>
                </div>
                <p class="text-[10px] text-ink-faint">Giai tầng {{ item.tier }} · {{ displayEquipSlot(equipmentTemplate(item.templateId)?.slot ?? '') }}</p>
              </div>
              <span v-if="depositEquipModal.selectedUid === item.uid" class="text-cinnabar font-bold">✓</span>
            </div>
          </div>
        </div>

        <div class="flex gap-2 justify-end pt-2">
          <button class="btn-ghost !px-4 !py-2 !text-[12px]" @click="depositEquipModal.show = false">Hủy</button>
          <button
            class="btn-seal !px-4 !py-2 !text-[12px]"
            :disabled="!depositEquipModal.selectedUid"
            @click="confirmDepositEquipment"
          >
            Xác Nhận Gửi Vào Kho
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- ===================================================================== -->
    <!-- MODAL PHÂN BỔ ĐỆ TỬ VÀO SƯ PHỤ -->
    <!-- ===================================================================== -->
    <BaseModal
      :open="mentorAssignModal.show"
      title="Thu Nhận Đệ Tử Dưới Trướng"
      top
      @close="mentorAssignModal.show = false"
    >
      <div class="space-y-3.5 text-[12px]">
        <p class="text-ink-soft text-[11px] leading-relaxed">
          Chọn một đệ tử Ngoại môn chưa có người hướng dẫn để bái vào dưới trướng sư phụ:
        </p>

        <div class="space-y-1.5">
          <label class="text-[11px] font-kai text-ink-faint block">Đệ Tử Ngoại Môn Khả Dụng:</label>
          <div v-if="unmentoredOuterDisciples.length === 0" class="card-ink p-3 text-center text-ink-faint italic text-[11px]">
            Tất cả đệ tử Ngoại môn hiện đã có sư phụ hướng dẫn.
          </div>
          <select
            v-else
            v-model="mentorAssignModal.selectedDiscipleId"
            class="w-full rounded border border-ink/20 bg-paper p-2 text-[12px] font-kai text-ink focus:outline-none"
          >
            <option
              v-for="disc in unmentoredOuterDisciples"
              :key="disc.id"
              :value="disc.id"
            >
              {{ disc.name }} ({{ displayRealmName(REALMS[disc.major]?.name ?? '') }} · Ngộ tính {{ disc.comprehension }}{{ disc.tierRank === 'gold' ? ' · Thiên Kiêu Vàng' : disc.tierRank === 'silver' ? ' · Thiên Kiêu Bạc' : '' }})
            </option>
          </select>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-ink/10">
          <button class="btn-ghost !px-3 !py-1 text-[11px]" @click="mentorAssignModal.show = false">
            Hủy
          </button>
          <button
            class="btn-seal !px-4 !py-1 text-[11px]"
            :disabled="!mentorAssignModal.selectedDiscipleId || unmentoredOuterDisciples.length === 0"
            @click="confirmAssignDisciple"
          >
            Xác Nhận Bái Sư
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue'
  import { usePlayerStore } from '@/stores/player'
  import { useSectStore } from '@/stores/apprentice'
  import { useCultivationStore } from '@/stores/cultivation'
  import { useResourcesStore } from '@/stores/resources'
  import { useInventoryStore } from '@/stores/inventory'
  import { useNpcStore } from '@/stores/npc'
  import { useUiStore } from '@/stores/ui'
  import BaseModal from '@/components/common/BaseModal.vue'
  import InspectSectModal from '@/components/sect/InspectSectModal.vue'
  import NpcProfileModal from '@/components/npc/NpcProfileModal.vue'
  import {
    discipleToUnifiedProfile,
    buildUnifiedNpcProfile,
    type UnifiedNpcProfile
  } from '@/core/npcProfileService'
  import {
    SECT_DOCTRINES,
    SECT_QUEST_TEMPLATES,
    SECT_SECRET_REALMS,
    SECT_LEVEL_DEFS,
    SECT_LEVEL_CAPS,
    SECT_RANK_NAMES,
    getTrueDisciplesCap,
    VASSAL_TRIBUTE_CONFIG,
    formatSectDate,
    sectDoctrineDef,
    sectQuestTemplate,
    getEquipmentVaultCost,
    getPillVaultCost,
    type DiscipleData,
    type ApplicantData,
    type SectHistoryEntry,
    type SectQuestTemplate,
    type SectSecretRealmDef,
    type SectMemberRank,
    type WorldSectData,
    ELDER_SPECIALTY_DEFS,
    type ElderSpecialty,
    MAX_MENTORED_PER_MASTER
  } from '@/data/sect'
  import { isEligibleMentor } from '@/core/sectMentorshipService'
  import { ELEMENTS } from '@/data/linggen'
  import { REALMS } from '@/data/realms'
  import { aptitudeDef, APTITUDE_GRADE_META } from '@/data/aptitudes'
  import { gongfaDef, GONGFA, GONGFA_TYPE_NAMES } from '@/data/gongfa'
  import { checkGongfaEligibility } from '@/core/gongfaEligibility'
  import { calculateSectCombatPower, evaluateDiscipleQuestPotential } from '@/core/sectService'
  import QualityTag from '@/components/common/QualityTag.vue'
  import {
    displayGongfaName,
    displayRealmName,
    displayGongfaDesc,
    displayEquipName,
    displayEquipSlot,
    displayPillName
  } from '@/ui/displayZhVi'
  import { comprehensionRankText } from '@/data/npcGeneration'
  import GameIcon from '@/components/common/GameIcon.vue'
  import SectionTitle from '@/components/common/SectionTitle.vue'
  import { equipmentTemplate } from '@/data/equipment'
  import { pillDef } from '@/data/pills'
  import { formatNum } from '@/utils/format'
  import { toNum } from '@/utils/gnum'
  import type { HerbGrade } from '@/data/herbGrades'

  const player = usePlayerStore()
  const sect = useSectStore()
  const cultivation = useCultivationStore()
  const resources = useResourcesStore()
  const inventory = useInventoryStore()
  const npcStore = useNpcStore()
  const ui = useUiStore()

  const playerStoneNum = computed(() => toNum(resources.spiritStone))

  const currentMonth = computed(() => npcStore.gameMonth)
  const calendarText = computed(() => formatSectDate(currentMonth.value))
  const currentDoctrine = computed(() => sectDoctrineDef(sect.doctrineId))

  const activeTab = ref<'disciples' | 'vault' | 'applicant' | 'mentorship' | 'quests' | 'library' | 'trials' | 'war' | 'tournament' | 'history'>('disciples')

  const TABS = [
    { id: 'disciples', label: 'Đệ Tử Viện' },
    { id: 'vault', label: 'Kho Tông Môn' },
    { id: 'applicant', label: 'Xét Duyệt' },
    { id: 'mentorship', label: 'Viện Sư Đồ' },
    { id: 'quests', label: 'Nhiệm Vụ Đường' },
    { id: 'library', label: 'Tàng Kinh Các' },
    { id: 'trials', label: 'Tháp & Bí Cảnh' },
    { id: 'war', label: 'Chiến Tranh & Phụ Thuộc' },
    { id: 'tournament', label: 'Tỉ Thí' },
    { id: 'history', label: 'Tông Môn Sử' }
  ] as const

  // ---- Quản lý Sư Đồ & Truyền Thừa ----
  const mentorsList = computed(() => {
    return sect.disciples.filter(d => isEligibleMentor(d) && d.status !== 'deceased')
  })

  const outerDisciples = computed(() => {
    return sect.disciples.filter(d => d.rank === 'outer' && d.status !== 'deceased')
  })

  const unmentoredOuterDisciples = computed(() => {
    return outerDisciples.value.filter(d => !d.mentorElderId)
  })

  function getDisciplesOfMentor(mentorId: string): DiscipleData[] {
    return sect.disciples.filter(d => d.mentorElderId === mentorId && d.status !== 'deceased')
  }

  const mentorAssignModal = reactive({
    show: false,
    mentorId: '',
    selectedDiscipleId: ''
  })

  function openMentorAssignModal(mentorId: string): void {
    mentorAssignModal.mentorId = mentorId
    mentorAssignModal.selectedDiscipleId = unmentoredOuterDisciples.value[0]?.id || ''
    mentorAssignModal.show = true
  }

  function confirmAssignDisciple(): void {
    if (!mentorAssignModal.mentorId || !mentorAssignModal.selectedDiscipleId) return
    const ok = sect.assignDiscipleToMentorAction(mentorAssignModal.selectedDiscipleId, mentorAssignModal.mentorId)
    if (ok) {
      mentorAssignModal.show = false
    }
  }

  function handleRemoveMentored(discipleId: string): void {
    sect.removeDiscipleFromMentorAction(discipleId)
  }

  function handleChangeElderSpecialty(elderId: string, spec: ElderSpecialty): void {
    sect.assignElderSpecialtyAction(elderId, spec)
  }

  const mentorshipLogs = computed(() => {
    return sect.history.filter(h =>
      h.summary.includes('[Tranh Giành Đệ Tử]') ||
      h.summary.includes('Sư phụ') ||
      h.summary.includes('truyền thụ') ||
      h.summary.includes('Chân truyền') ||
      h.summary.includes('thu nhận')
    ).slice(0, 30)
  })

  // Cấp Tông Môn hiện tại
  const currentSectLevelDef = computed(() => SECT_LEVEL_DEFS[sect.sectLevel])
  const currentCaps = computed(() => SECT_LEVEL_CAPS[sect.sectLevel] ?? SECT_LEVEL_CAPS[1]!)
  const elderCount = computed(() => sect.disciples.filter(d => d.rank === 'elder').length)
  const trueDisciplesCap = computed(() => getTrueDisciplesCap(elderCount.value))

  const currentMasterDisplayName = computed(() => {
    if (sect.playerIsAncestor) {
      const npcMaster = sect.disciples.find(d => d.rank === 'master' || d.id === sect.masterId)
      return npcMaster ? `${npcMaster.name} (Tông chủ)` : `${player.name} (Lão tổ)`
    }
    return `${player.name} (${displayRealmName(player.realmName)})`
  })

  const nextLevelUpgradeHint = computed(() => {
    if (sect.sectLevel >= 5) return 'Đã đạt cấp tối đa'
    const next = SECT_LEVEL_DEFS[sect.sectLevel + 1]
    if (!next) return ''
    return `Yêu cầu cảnh giới tối thiểu ${displayRealmName(REALMS[next.minMajor]?.name ?? '')}, chi phí ${next.costStone.toLocaleString()} Linh thạch`
  })

  function handleUpgradeSectLevel(): void {
    sect.upgradeSectLevel()
  }

  // Thống kê số lượng theo cấp bậc
  const rankCounts = computed(() => {
    const counts: Record<SectMemberRank, number> = {
      outer: 0,
      inner: 0,
      true: 0,
      elder: 0,
      guardian: 0,
      vice_master: 0,
      master: 0,
      ancestor: 0
    }
    for (const d of sect.disciples) {
      const r = d.rank || 'outer'
      counts[r] = (counts[r] ?? 0) + 1
    }
    return counts
  })

  // Bộ lọc cấp bậc cho Tab Đệ Tử
  const discipleRankFilter = ref<string>('all')
  const RANK_FILTER_OPTIONS = [
    { id: 'all', label: 'Tất Cả' },
    { id: 'ancestor', label: 'Lão Tổ' },
    { id: 'master', label: 'Tông Chủ' },
    { id: 'vice_master', label: 'Phó Tông Chủ' },
    { id: 'guardian', label: 'Hộ Pháp' },
    { id: 'elder', label: 'Trưởng Lão' },
    { id: 'true', label: 'Chân Truyền' },
    { id: 'inner', label: 'Nội Môn' },
    { id: 'outer', label: 'Ngoại Môn' }
  ]

  const filteredDisciples = computed(() => {
    if (discipleRankFilter.value === 'all') return sect.disciples
    return sect.disciples.filter(d => (d.rank || 'outer') === discipleRankFilter.value)
  })

  function rankBadgeClass(rank?: SectMemberRank): string {
    switch (rank) {
      case 'ancestor': return 'border-amber-ink/40 bg-amber-ink/10 text-amber-ink'
      case 'master': return 'border-cinnabar/40 bg-cinnabar/10 text-cinnabar'
      case 'vice_master': return 'border-violet-ink/30 bg-violet-ink/10 text-violet-ink'
      case 'guardian': return 'border-indigo-ink/30 bg-indigo-ink/10 text-indigo-ink'
      case 'elder': return 'border-gold-ink/30 bg-gold-ink/10 text-gold-ink'
      case 'true': return 'border-jade/30 bg-jade/10 text-jade'
      case 'inner': return 'border-azure/30 bg-azure/10 text-azure'
      case 'outer':
      default:
        return 'border-ink/20 bg-ink/5 text-ink-soft'
    }
  }

  // Form khai sơn lập phái
  const createSectForm = reactive({
    name: 'Vân Ẩn Tông',
    doctrineId: 'natural'
  })

  function handleCreateSect(): void {
    sect.createSect(createSectForm.name, createSectForm.doctrineId, currentMonth.value)
  }

  function handleAcceptApplicant(applicantId?: string): void {
    sect.acceptApplicant(applicantId, currentMonth.value)
  }

  function handleRejectApplicant(applicantId?: string): void {
    sect.rejectApplicant(applicantId, currentMonth.value)
  }

  function handleAcceptAllApplicants(): void {
    sect.acceptAllApplicants(currentMonth.value)
  }

  function handleRejectAllApplicants(): void {
    sect.rejectAllApplicants(currentMonth.value)
  }

  function realmText(major: number, sub: number): string {
    const raw = REALMS[major]?.name ?? 'Luyện Khí'
    return `${displayRealmName(raw)} · Tầng ${sub + 1}`
  }

  function comprehensionRank(score: number) {
    return comprehensionRankText(score)
  }

  function statusMeta(status: DiscipleData['status']) {
    switch (status) {
      case 'idle':
        return { label: 'Rảnh Rỗi', class: 'bg-jade/10 text-jade' }
      case 'quest':
        return { label: 'Chấp Hành Nhiệm Vụ', class: 'bg-azure/10 text-azure' }
      case 'injured':
        return { label: 'Đang Dưỡng Thương', class: 'bg-cinnabar/10 text-cinnabar' }
      case 'bottleneck':
        return { label: 'Gặp Bình Cảnh', class: 'bg-amber-ink/10 text-amber-ink' }
      case 'demonic':
        return { label: 'Tẩu Hỏa Nhập Ma', class: 'bg-scarlet/20 text-scarlet font-bold' }
      case 'deceased':
        return { label: 'Đã Ngã Xuống', class: 'bg-ink/20 text-ink-faint line-through' }
      default:
        return { label: 'Tu Luyện', class: 'bg-ink/10 text-ink' }
    }
  }

  function handlePurifyDemonic(discipleId: string) {
    sect.purifyDemonicDisciple(discipleId)
  }

  const idleDisciples = computed(() => sect.disciples.filter(d => d.status === 'idle'))
  const livingDisciples = computed(() => sect.disciples.filter(d => d.status !== 'deceased'))
  const livingDisciplesCount = computed(() => livingDisciples.value.length)
  const maxTowerFloor = computed(() => {
    let maxF = 0
    for (const d of sect.disciples) {
      if (d.status !== 'deceased' && (d.towerFloor || 0) > maxF) {
        maxF = d.towerFloor
      }
    }
    return maxF
  })

  function getActiveQuestForTemplate(templateId: string) {
    return sect.activeQuests.find(q => q.templateId === templateId)
  }

  function getTopCandidateForQuest(tpl: SectQuestTemplate): DiscipleData | null {
    const eligible = idleDisciples.value.filter(d => d.major >= tpl.minMajor)
    if (eligible.length === 0) return null
    return eligible.reduce((best, curr) => {
      const scoreCurr = evaluateDiscipleQuestPotential(curr, tpl)
      const scoreBest = evaluateDiscipleQuestPotential(best, tpl)
      return scoreCurr > scoreBest ? curr : best
    }, eligible[0]!)
  }

  function getDiscipleName(id: string): string {
    return sect.disciples.find(d => d.id === id)?.name ?? 'Đệ tử'
  }

  function formatQuestRewards(tpl: SectQuestTemplate): string {
    const parts: string[] = []
    if (tpl.rewards.stoneBase) parts.push(`${tpl.rewards.stoneBase} Linh thạch`)
    if (tpl.rewards.herbCount) parts.push(`${tpl.rewards.herbCount} Linh thảo`)
    if (tpl.rewards.oreCount) parts.push(`${tpl.rewards.oreCount} Huyền thiết`)
    parts.push(`${tpl.rewards.contribution} Cống hiến`)
    return parts.join(' · ')
  }

  // =========================================================================
  // MODAL BỔ NHIỆM CẤP BẬC
  // =========================================================================
  const promoteModal = reactive({
    show: false,
    disciple: null as DiscipleData | null,
    targetRank: 'inner' as SectMemberRank
  })

  function openPromoteModal(d: DiscipleData): void {
    promoteModal.disciple = d
    promoteModal.targetRank = d.rank || 'outer'
    promoteModal.show = true
  }

  const AVAILABLE_RANKS_FOR_APPOINTMENT = computed(() => {
    const caps = currentCaps.value
    const counts = rankCounts.value
    return [
      { rank: 'outer' as SectMemberRank, name: 'Ngoại Môn Đệ Tử', capDesc: `${counts.outer}/${caps.outer}`, isFull: counts.outer >= caps.outer },
      { rank: 'inner' as SectMemberRank, name: 'Nội Môn Đệ Tử', capDesc: `${counts.inner}/${caps.inner}`, isFull: counts.inner >= caps.inner },
      { rank: 'true' as SectMemberRank, name: 'Chân Truyền Đệ Tử', capDesc: `${counts.true}/${trueDisciplesCap.value}`, isFull: counts.true >= trueDisciplesCap.value },
      { rank: 'elder' as SectMemberRank, name: 'Trưởng Lão', capDesc: `${counts.elder}/${caps.elder}`, isFull: counts.elder >= caps.elder },
      { rank: 'guardian' as SectMemberRank, name: 'Hộ Pháp', capDesc: `${counts.guardian}/${caps.guardian}`, isFull: counts.guardian >= caps.guardian },
      { rank: 'vice_master' as SectMemberRank, name: 'Phó Tông Chủ', capDesc: `${counts.vice_master}/${caps.vice_master}`, isFull: counts.vice_master >= caps.vice_master },
      { rank: 'ancestor' as SectMemberRank, name: 'Lão Tổ', capDesc: `${counts.ancestor + (sect.playerIsAncestor ? 1 : 0)}/${caps.ancestor}`, isFull: counts.ancestor >= caps.ancestor }
    ]
  })

  function confirmPromote(): void {
    if (!promoteModal.disciple || !promoteModal.targetRank) return
    const current = promoteModal.disciple.rank || 'outer'
    if (promoteModal.targetRank === current) {
      promoteModal.show = false
      return
    }
    sect.promoteMember(promoteModal.disciple.id, promoteModal.targetRank, currentMonth.value)
    promoteModal.show = false
  }

  // =========================================================================
  // MODAL NHƯỜNG NGÔI LÃO TỔ
  // =========================================================================
  const abdicateModal = reactive({
    show: false,
    successorId: ''
  })

  const eligibleSuccessors = computed(() => {
    // Ưu tiên Phó Tông chủ, Trưởng lão, Hộ pháp, rồi đến Chân truyền
    return [...sect.disciples].sort((a, b) => {
      const rankOrder: Record<SectMemberRank, number> = {
        vice_master: 7,
        guardian: 6,
        elder: 5,
        true: 4,
        inner: 3,
        outer: 2,
        master: 1,
        ancestor: 0
      }
      const diff = (rankOrder[b.rank || 'outer'] ?? 0) - (rankOrder[a.rank || 'outer'] ?? 0)
      if (diff !== 0) return diff
      return b.major - a.major || b.comprehension - a.comprehension
    })
  })

  function openAbdicateModal(): void {
    if (sect.disciples.length === 0) {
      ui.toast('Tông môn chưa có đệ tử để truyền ngôi!', 'warn')
      return
    }
    abdicateModal.successorId = eligibleSuccessors.value[0]?.id || ''
    abdicateModal.show = true
  }

  function confirmAbdicate(): void {
    if (!abdicateModal.successorId) return
    sect.abdicateToAncestor(abdicateModal.successorId, currentMonth.value)
    abdicateModal.show = false
  }

  // =========================================================================
  // CHIẾN TRANH & CỐNG NỘP
  // =========================================================================
  const summonAncestorForWar = ref(true)
  const hasAvailableAncestor = computed(() => sect.playerIsAncestor || sect.disciples.some(d => d.rank === 'ancestor'))

  // Modal Quan sát Tông môn đối thủ
  const inspectModal = reactive({
    open: false,
    sect: null as WorldSectData | null
  })

  function openInspectSect(ws: WorldSectData): void {
    inspectModal.sect = ws
    inspectModal.open = true
  }

  function handleInspectWorldSectMember(member: DiscipleData): void {
    if (!inspectModal.sect) return
    const prof = discipleToUnifiedProfile(member, inspectModal.sect.name, 'stranger', 0)
    openProfileModal(prof)
  }

  // Modal Bảng thuộc tính NPC toàn cảnh
  const profileModal = reactive({
    open: false,
    profile: null as UnifiedNpcProfile | null
  })

  function openProfileModal(prof: UnifiedNpcProfile): void {
    profileModal.profile = prof
    profileModal.open = true
  }

  function openDiscipleProfile(d: DiscipleData): void {
    const prof = discipleToUnifiedProfile(d, sect.sectName, 'disciple', 50)
    openProfileModal(prof)
  }

  function refreshDiscipleProfileModal(): void {
    if (!profileModal.profile) return
    const d = sect.disciples.find(disc => disc.id === profileModal.profile?.id)
    if (d) openDiscipleProfile(d)
  }

  function openApplicantProfile(a: ApplicantData): void {
    const prof = buildUnifiedNpcProfile({
      id: a.id,
      name: a.name,
      gender: a.gender,
      element: a.element,
      major: a.major,
      sub: a.sub,
      comprehension: a.comprehension,
      aptitudes: a.aptitudes,
      temper: a.temper,
      lean: a.lean,
      brief: a.brief,
      pursuit: a.pursuit,
      sectName: 'Tán Tu Nhập Môn',
      sectRole: 'Ứng Viên Ngoại Môn',
      relationType: 'stranger',
      favor: 10
    })
    openProfileModal(prof)
  }

  // Tông môn đô hộ (nếu người chơi là chư hầu)
  const overlordSect = computed(() => {
    if (!sect.overlordSectId) return undefined
    return sect.worldSects.find(ws => ws.id === sect.overlordSectId)
  })

  function handleRespondWar(choice: 'accept' | 'surrender'): void {
    const targetId = sect.pendingWarDeclaration?.sectId
    const target = sect.worldSects.find(ws => ws.id === targetId)
    const res = sect.respondToWarDeclaration(choice, summonAncestorForWar.value)
    if (res.won && target) {
      warOutcomeModal.targetId = target.id
      warOutcomeModal.targetName = target.name
      warOutcomeModal.choice = 'vassalize'
      warOutcomeModal.show = true
    }
  }

  function handleRebelIndependence(): void {
    sect.rebelAgainstOverlord(summonAncestorForWar.value)
  }

  // Bộ lọc cấp bậc cho Tông Môn Thế Giới
  const worldSectLevelFilter = ref<string>('all')
  const WORLD_SECT_LEVEL_OPTIONS = [
    { id: 'all', label: 'Tất Cả' },
    { id: '1', label: 'Cấp 1' },
    { id: '2', label: 'Cấp 2' },
    { id: '3', label: 'Cấp 3' },
    { id: '4', label: 'Cấp 4' },
    { id: '5', label: 'Cấp 5' }
  ]

  const filteredWorldSects = computed(() => {
    if (worldSectLevelFilter.value === 'all') return sect.worldSects
    const lvl = Number(worldSectLevelFilter.value)
    return sect.worldSects.filter(ws => ws.level === lvl)
  })

  const calculatedPlayerSectPower = computed(() => {
    return calculateSectCombatPower(
      sect.disciples,
      summonAncestorForWar.value && hasAvailableAncestor.value,
      { major: player.major, sub: player.sub }
    )
  })

  const warOutcomeModal = reactive({
    show: false,
    targetId: '',
    targetName: '',
    choice: 'vassalize' as 'destroy' | 'vassalize'
  })

  function handleDeclareWar(targetSectId: string): void {
    const target = sect.worldSects.find(ws => ws.id === targetSectId)
    if (!target) return

    const res = sect.declareWar(targetSectId, summonAncestorForWar.value, currentMonth.value, {
      major: player.major,
      sub: player.sub
    })

    if (res.won) {
      warOutcomeModal.targetId = targetSectId
      warOutcomeModal.targetName = target.name
      warOutcomeModal.choice = 'vassalize'
      warOutcomeModal.show = true
    }
  }

  function confirmWarOutcome(): void {
    if (!warOutcomeModal.targetId) return
    sect.resolveWarOutcome(warOutcomeModal.targetId, warOutcomeModal.choice, currentMonth.value)
    warOutcomeModal.show = false
  }

  // =========================================================================
  // MODAL GIAO VIỆC
  // =========================================================================
  const assignModal = reactive({
    show: false,
    template: null as SectQuestTemplate | null,
    selectedDiscipleId: ''
  })

  const assignCandidates = computed(() => {
    if (!assignModal.template) return []
    const tpl = assignModal.template
    return idleDisciples.value
      .map(d => {
        const eligible = d.major >= tpl.minMajor
        const score = evaluateDiscipleQuestPotential(d, tpl)
        const isElementMatch =
          (tpl.type === 'herb' && d.element === 'wood') ||
          (tpl.type === 'alchemy' && (d.element === 'fire' || d.element === 'wood')) ||
          (tpl.type === 'ore' && (d.element === 'metal' || d.element === 'earth')) ||
          (tpl.type === 'subdue' && (d.element === 'metal' || d.element === 'fire')) ||
          (tpl.type === 'explore' && d.element === 'water') ||
          (tpl.type === 'patrol' && (d.element === 'earth' || d.element === 'metal'))

        return {
          disciple: d,
          score,
          eligible,
          isElementMatch
        }
      })
      .sort((a, b) => {
        if (a.eligible !== b.eligible) return a.eligible ? -1 : 1
        return b.score - a.score
      })
  })

  function openAssignModal(tpl: SectQuestTemplate): void {
    assignModal.template = tpl
    const eligible = idleDisciples.value
      .filter(d => d.major >= tpl.minMajor)
      .sort((a, b) => evaluateDiscipleQuestPotential(b, tpl) - evaluateDiscipleQuestPotential(a, tpl))
    assignModal.selectedDiscipleId = eligible[0]?.id ?? ''
    assignModal.show = true
  }

  function confirmAssignQuest(): void {
    if (!assignModal.template || !assignModal.selectedDiscipleId) return
    sect.assignQuest(assignModal.template.id, assignModal.selectedDiscipleId, currentMonth.value)
    assignModal.show = false
  }

  // =========================================================================
  // MODAL NẠP CÔNG PHÁP
  // =========================================================================
  const showAddGongfaModal = ref(false)
  const gongfaModalTab = ref<'learned' | 'all'>('learned')
  const gongfaSearch = ref('')
  const gongfaFilterType = ref<'all' | 'main' | 'sub' | 'secret'>('all')
  const gongfaFilterElement = ref<string>('all')

  const learnedGongfasToDeposit = computed(() => {
    const learnedIds = Object.keys(cultivation.learned)
    return learnedIds
      .filter(id => !sect.libraryGongfaIds.includes(id))
      .map(id => gongfaDef(id))
      .filter((gf): gf is NonNullable<typeof gf> => !!gf)
  })

  const allGongfasFiltered = computed(() => {
    const q = gongfaSearch.value.trim().toLowerCase()
    return GONGFA.filter(gf => {
      if (gongfaFilterType.value !== 'all' && gf.type !== gongfaFilterType.value) return false
      if (gongfaFilterElement.value !== 'all') {
        if (gongfaFilterElement.value === 'none') {
          if (gf.element) return false
        } else if (gf.element !== gongfaFilterElement.value) {
          return false
        }
      }
      if (q) {
        const viName = displayGongfaName(gf.name).toLowerCase()
        const origName = gf.name.toLowerCase()
        if (!viName.includes(q) && !origName.includes(q) && !gf.desc.toLowerCase().includes(q)) {
          return false
        }
      }
      return true
    })
  })

  const allAvailableCount = computed(() => {
    return GONGFA.filter(gf => !sect.libraryGongfaIds.includes(gf.id)).length
  })

  function depositGongfa(gongfaId: string): void {
    sect.addGongfaToLibrary(gongfaId, currentMonth.value)
  }

  function depositAllLearned(): void {
    const ids = learnedGongfasToDeposit.value.map(gf => gf.id)
    if (ids.length === 0) return
    sect.addBatchGongfasToLibrary(ids, currentMonth.value)
  }

  // =========================================================================
  // MODAL TRUYỀN THỤ CÔNG PHÁP
  // =========================================================================
  const teachModal = reactive({
    show: false,
    selectedDiscipleId: '',
    preselectedGongfaId: null as string | null
  })

  const currentTeachDisciple = computed<DiscipleData | undefined>(() => {
    return sect.disciples.find(d => d.id === teachModal.selectedDiscipleId) ?? sect.disciples[0]
  })

  function openTeachModal(d: DiscipleData): void {
    teachModal.selectedDiscipleId = d.id
    teachModal.preselectedGongfaId = null
    teachModal.show = true
  }

  function openTeachModalForGongfa(gId: string): void {
    if (sect.disciples.length === 0) {
      ui.toast('Môn hạ chưa có đệ tử để truyền thụ!', 'info')
      return
    }
    if (!teachModal.selectedDiscipleId || !sect.disciples.some(d => d.id === teachModal.selectedDiscipleId)) {
      teachModal.selectedDiscipleId = sect.disciples[0]!.id
    }
    teachModal.preselectedGongfaId = gId
    teachModal.show = true
  }

  function getGongfaTeachEligibility(gfId: string, d: DiscipleData | undefined) {
    if (!d) return { canLearn: false, reason: 'Chưa chọn đệ tử' }
    const gf = gongfaDef(gfId)
    if (!gf) return { canLearn: false, reason: 'Không tìm thấy công pháp' }
    if (d.learnedGongfa.includes(gfId)) return { canLearn: false, reason: 'Đã học' }
    return checkGongfaEligibility(gf, {
      major: d.major,
      element: d.element,
      comprehension: d.comprehension,
      aptitudes: d.aptitudes
    })
  }

  function confirmTeach(gongfaId: string): void {
    if (!currentTeachDisciple.value) return
    sect.teachGongfaToDisciple(currentTeachDisciple.value.id, gongfaId, currentMonth.value)
  }

  // =========================================================================
  // THÁP & BÍ CẢNH
  // =========================================================================
  function handleDiscipleChallengeTower(d: DiscipleData): void {
    sect.challengeTower(d.id, currentMonth.value)
  }

  function openRealmModal(d: DiscipleData): void {
    const realm = SECT_SECRET_REALMS[0]!
    sect.exploreRealm(d.id, realm.id, currentMonth.value)
  }

  function openRealmModalWithDef(realm: SectSecretRealmDef): void {
    const d = sect.disciples.find(disc => disc.major >= realm.minMajor) || sect.disciples[0]
    if (!d) {
      ui.toast('Chưa có đệ tử nào trong tông môn!', 'warn')
      return
    }
    sect.exploreRealm(d.id, realm.id, currentMonth.value)
  }

  // Tỉ thí tính toán kỳ tiếp theo
  const nextTournamentMonth = computed(() => {
    return Math.ceil((currentMonth.value + 1) / 6) * 6
  })

  // Tông Môn Sử bộ lọc
  const historyFilter = ref<string>('all')
  const HISTORY_FILTERS = [
    { id: 'all', label: 'Tất Cả' },
    { id: 'personnel', label: 'Nhân Sự' },
    { id: 'promotion', label: 'Thăng Cấp' },
    { id: 'cultivation', label: 'Tu Luyện' },
    { id: 'quest', label: 'Nhiệm Vụ' },
    { id: 'war', label: 'Chiến Tranh' },
    { id: 'vassal', label: 'Phụ Thuộc' },
    { id: 'tribute', label: 'Cống Nộp' },
    { id: 'tournament', label: 'Tỉ Thí' },
    { id: 'tower', label: 'Tháp Lịch Luyện' },
    { id: 'realm', label: 'Bí Cảnh' },
    { id: 'management', label: 'Quản Lý' }
  ]

  const filteredHistory = computed(() => {
    if (historyFilter.value === 'all') return sect.history
    return sect.history.filter(h => h.category === historyFilter.value)
  })

  function categoryLabel(cat: SectHistoryEntry['category']): string {
    const match = HISTORY_FILTERS.find(f => f.id === cat)
    return match?.label ?? 'Khác'
  }

  // =========================================================================
  // BAN THƯỞNG LINH THẠCH & TRỤC XUẤT ĐỆ TỬ
  // =========================================================================
  const rewardModal = reactive({
    show: false,
    disciple: null as DiscipleData | null,
    amount: 1000
  })

  function openRewardModal(d: DiscipleData): void {
    rewardModal.disciple = d
    rewardModal.amount = 1000
    rewardModal.show = true
  }

  function confirmRewardDisciple(): void {
    if (!rewardModal.disciple || rewardModal.amount <= 0) return
    sect.rewardDiscipleStones(rewardModal.disciple.id, rewardModal.amount)
    rewardModal.show = false
  }

  const expelModal = reactive({
    show: false,
    disciple: null as DiscipleData | null
  })

  function openExpelConfirmModal(d: DiscipleData): void {
    expelModal.disciple = d
    expelModal.show = true
  }

  function confirmExpelDisciple(): void {
    if (!expelModal.disciple) return
    sect.expelDisciple(expelModal.disciple.id)
    expelModal.show = false
  }

  // =========================================================================
  // QUẢN LÝ KHO TÔNG MÔN (SECT VAULT COMPUTED & HANDLERS)
  // =========================================================================
  const vaultPillList = computed(() => {
    return Object.keys(sect.sectVault.pills).map(id => {
      const def = pillDef(id)
      return {
        id,
        name: def?.name ? displayPillName(def.name) : id,
        quality: def?.quality,
        count: sect.sectVault.pills[id] ?? 0,
        cost: getPillVaultCost(id)
      }
    }).filter(p => p.count > 0)
  })

  const playerBagEquipments = computed(() => {
    return inventory.bagItems
  })

  const playerBagPills = computed(() => {
    return Object.keys(inventory.pills).map(id => {
      const def = pillDef(id)
      return {
        id,
        name: def?.name ? displayPillName(def.name) : id,
        quality: def?.quality,
        count: inventory.pills[id] ?? 0
      }
    }).filter(p => p.count > 0)
  })

  const stoneModal = reactive({
    show: false,
    mode: 'deposit' as 'deposit' | 'withdraw',
    amount: 10000
  })

  function openStoneModal(mode: 'deposit' | 'withdraw'): void {
    stoneModal.mode = mode
    stoneModal.amount = mode === 'deposit' ? Math.min(playerStoneNum.value, 50000) : Math.min(sect.sectVault.stone, 50000)
    stoneModal.show = true
  }

  function confirmStoneModal(): void {
    if (stoneModal.amount <= 0) return
    if (stoneModal.mode === 'deposit') {
      sect.depositStoneToVault(stoneModal.amount)
    } else {
      sect.withdrawStoneFromVault(stoneModal.amount)
    }
    stoneModal.show = false
  }

  const materialModal = reactive({
    show: false,
    type: 'ore' as 'ore' | 'dust' | 'wudao',
    mode: 'deposit' as 'deposit' | 'withdraw',
    count: 10
  })

  const materialModalName = computed(() => {
    if (materialModal.type === 'ore') return 'Huyền Thiết'
    if (materialModal.type === 'dust') return 'Khí Trần'
    return 'Ngộ Đạo Tàn Thiên'
  })

  const materialModalVaultCount = computed(() => {
    if (materialModal.type === 'ore') return sect.sectVault.ores
    if (materialModal.type === 'dust') return sect.sectVault.dust
    return sect.sectVault.wudao
  })

  function openMaterialModal(type: 'ore' | 'dust' | 'wudao', mode: 'deposit' | 'withdraw'): void {
    materialModal.type = type
    materialModal.mode = mode
    materialModal.count = 10
    materialModal.show = true
  }

  function confirmMaterialModal(): void {
    if (materialModal.count <= 0) return
    if (materialModal.mode === 'deposit') {
      sect.depositMaterialToVault(materialModal.type, materialModal.count)
    } else {
      sect.withdrawMaterialFromVault(materialModal.type, materialModal.count)
    }
    materialModal.show = false
  }

  const herbModal = reactive({
    show: false,
    grade: 1 as HerbGrade,
    count: 10
  })

  function openHerbModal(): void {
    herbModal.grade = 1
    herbModal.count = 10
    herbModal.show = true
  }

  function confirmDepositHerb(): void {
    if (herbModal.count <= 0) return
    sect.depositHerbToVault(herbModal.grade, herbModal.count)
  }

  function confirmWithdrawHerb(): void {
    if (herbModal.count <= 0) return
    sect.withdrawHerbFromVault(herbModal.grade, herbModal.count)
  }

  const depositPillModal = reactive({
    show: false,
    selectedPillId: '',
    count: 1
  })

  function openDepositPillModal(): void {
    depositPillModal.selectedPillId = playerBagPills.value[0]?.id ?? ''
    depositPillModal.count = 1
    depositPillModal.show = true
  }

  function confirmDepositPill(): void {
    if (!depositPillModal.selectedPillId || depositPillModal.count <= 0) return
    sect.depositPillToVault(depositPillModal.selectedPillId, depositPillModal.count)
    depositPillModal.show = false
  }

  function handleWithdrawPill(pillId: string): void {
    sect.withdrawPillFromVault(pillId, 1)
  }

  const depositEquipModal = reactive({
    show: false,
    selectedUid: ''
  })

  function openDepositEquipModal(): void {
    depositEquipModal.selectedUid = playerBagEquipments.value[0]?.uid ?? ''
    depositEquipModal.show = true
  }

  function confirmDepositEquipment(): void {
    if (!depositEquipModal.selectedUid) return
    sect.depositEquipmentToVault(depositEquipModal.selectedUid)
    depositEquipModal.show = false
  }

  function handleWithdrawEquipment(uid: string): void {
    sect.withdrawEquipmentFromVault(uid)
  }
</script>
