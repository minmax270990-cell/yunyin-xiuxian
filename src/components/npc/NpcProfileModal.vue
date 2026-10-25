<template>
  <BaseModal
    :open="open"
    :title="profile ? `Hồ Sơ Tu Sĩ · ${profile.name}` : 'Bảng Thuộc Tính Tu Sĩ'"
    @close="$emit('close')"
  >
    <div v-if="profile" class="space-y-4">
      <!-- HEADER: THÔNG TIN CƠ BẢN -->
      <div class="card-ink p-3.5 space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5 flex-wrap">
            <div
              class="grid h-10 w-10 shrink-0 place-items-center rounded-full border"
              :class="profile.gender === 'female' ? 'border-cinnabar/40 bg-cinnabar/10 text-cinnabar' : 'border-azure/40 bg-azure/10 text-azure'"
            >
              <GameIcon :name="profile.avatarIcon" :size="20" />
            </div>
            <div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-kai text-[16px] font-bold text-ink">{{ profile.name }}</span>
                <span
                  class="rounded px-1.5 py-0.2 text-[9px] font-kai border"
                  :class="profile.gender === 'female' ? 'border-cinnabar/40 bg-cinnabar/10 text-cinnabar' : 'border-azure/40 bg-azure/10 text-azure'"
                >
                  {{ profile.gender === 'female' ? 'Nữ Tu' : 'Nam Tu' }}
                </span>
                <span
                  v-if="profile.rankName"
                  class="rounded px-1.5 py-0.2 text-[9px] font-kai font-semibold border border-gold-ink/40 bg-gold-ink/10 text-gold-ink"
                >
                  {{ profile.rankName }}
                </span>
                <span
                  v-if="profile.relationType === 'daolu'"
                  class="rounded px-1.5 py-0.2 text-[9px] font-kai font-semibold border border-cinnabar/60 bg-cinnabar/15 text-cinnabar"
                >
                  Đạo Lữ
                </span>
              </div>
              <p class="text-[11px] text-ink-faint">
                {{ profile.sectName }} · {{ profile.sectRole }}
              </p>
            </div>
          </div>

          <div class="text-right flex flex-col items-end gap-1">
            <span class="text-[10px] tracking-widest text-ink-faint block">CHIẾN LỰC</span>
            <span class="font-kai text-[17px] font-bold text-cinnabar tabular">
              {{ displayCombatPower.toLocaleString() }}
            </span>
            <button
              class="btn-seal !py-0.5 !px-2 !text-[10px] mt-0.5"
              @click="showGiftModal = true"
            >
              {{ targetType === 'disciple' ? 'Ban Thưởng' : 'Tặng Quà' }}
            </button>
          </div>
        </div>

        <!-- Cảnh giới & Tiến độ tu vi -->
        <div class="space-y-1 pt-1 border-t border-ink/10 text-[11px]">
          <div class="flex justify-between items-center">
            <span class="text-ink-soft font-kai font-semibold">{{ profile.realmName }}</span>
            <span class="text-ink-faint tabular">{{ profile.expPct }}% Tu vi</span>
          </div>
          <div class="h-1.5 w-full rounded-full bg-ink/10 overflow-hidden">
            <div
              class="h-full rounded-full bg-azure transition-all duration-300"
              :style="{ width: `${profile.expPct}%` }"
            />
          </div>
        </div>
      </div>


      <!-- THANH ĐIỀU HƯỚNG TAB -->
      <div class="flex border-b border-ink/15 text-[12px]">
        <button
          v-for="t in TABS"
          :key="t.id"
          class="flex-1 py-1.5 font-kai text-center transition-colors border-b-2"
          :class="activeTab === t.id ? 'border-cinnabar text-cinnabar font-semibold' : 'border-transparent text-ink-faint hover:text-ink'"
          @click="activeTab = t.id"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- =================================================================== -->
      <!-- TAB 1: TỔNG QUAN (OVERVIEW) -->
      <!-- =================================================================== -->
      <div v-if="activeTab === 'overview'" class="space-y-3 text-[12px]">
        <!-- Thông tin Sư Đồ & Chức vụ chuyên môn môn phái -->
        <div v-if="profile.mentorElderName || profile.elderSpecialtyTitle" class="card-ink p-3 space-y-1.5 border border-ink/15">
          <div v-if="profile.mentorElderName" class="flex items-center justify-between text-[11px]">
            <span class="text-ink-faint font-kai">Sư Phụ Chỉ Điểm:</span>
            <span class="font-bold text-ink font-kai">
              【{{ profile.mentorElderName }}】
              <span v-if="profile.elderSpecialtyTitle" class="text-azure ml-1">({{ profile.elderSpecialtyTitle }})</span>
            </span>
          </div>
          <div v-if="!profile.mentorElderName && profile.elderSpecialtyTitle" class="flex items-center justify-between text-[11px]">
            <span class="text-ink-faint font-kai">Chức Vụ Trưởng Lão:</span>
            <span class="font-bold text-gold-ink font-kai">{{ profile.elderSpecialtyTitle }}</span>
          </div>
          <div v-if="profile.mentoredCount !== undefined && profile.mentoredCount > 0" class="flex items-center justify-between text-[11px] border-t border-ink/10 pt-1">
            <span class="text-ink-faint font-kai">Đệ Tử Dưới Trướng:</span>
            <span class="font-semibold text-ink font-kai tabular">{{ profile.mentoredCount }} / 10</span>
          </div>
        </div>

        <!-- Trạng thái hiện tại -->
        <div class="card-ink p-3 space-y-1.5">
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-ink-faint font-kai">Trạng Thái Tu Hành:</span>
            <span class="font-semibold text-azure font-kai">{{ profile.statusText }}</span>
          </div>
          <p class="text-ink-soft leading-relaxed text-[11px]">{{ profile.brief }}</p>
        </div>

        <!-- Tâm tính, đạo tâm, sở cầu -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div class="card-ink p-2.5 space-y-1">
            <span class="text-ink-faint text-[10px] block font-kai">TÂM TÍNH KHÍ CHẤT</span>
            <span class="font-bold text-ink font-kai">{{ profile.temperName }}</span>
            <p class="text-[10px] text-ink-faint">Tính cách ảnh hưởng đến đối nhân xử thế và ứng biến nguy nan.</p>
          </div>
          <div class="card-ink p-2.5 space-y-1">
            <span class="text-ink-faint text-[10px] block font-kai">KHUYNH HƯỚNG ĐẠO TÂM</span>
            <span class="font-bold text-gold-ink font-kai">Đạo {{ profile.leanName }}</span>
            <p class="text-[10px] text-ink-faint">Căn cơ đạo thống tu hành trọn đời truy cầu.</p>
          </div>
        </div>

        <div class="card-ink p-3 space-y-1.5">
          <div class="flex items-center gap-1.5">
            <span class="text-ink-faint text-[11px]">Sở Cầu Trường Sinh:</span>
            <span class="text-ink font-semibold text-[11px]">{{ profile.pursuit }}</span>
          </div>
          <div class="flex items-center gap-1.5 border-t border-ink/10 pt-1.5">
            <span class="text-ink-faint text-[11px]">Ranh Giới Bất Xâm:</span>
            <span class="text-cinnabar text-[11px]">{{ profile.taboo }}</span>
          </div>
        </div>
      </div>


      <!-- =================================================================== -->
      <!-- TAB 2: THUỘC TÍNH & CHIẾN LỰC (STATS & COMBAT) -->
      <!-- =================================================================== -->
      <div v-else-if="activeTab === 'combat'" class="space-y-3 text-[12px]">
        <!-- Bảng phân giải chiến lực -->
        <div class="card-ink p-3 space-y-2">
          <div class="flex justify-between items-center border-b border-ink/10 pb-1.5">
            <span class="font-kai font-semibold text-ink">Tổng Lực Chiến Thực Tế</span>
            <span class="font-kai text-[16px] font-bold text-cinnabar tabular">
              {{ displayCombatPower.toLocaleString() }}
            </span>
          </div>
          <p class="text-[10px] text-ink-faint leading-relaxed">
            Quy đổi theo trọng số thực tế: Tấn Công ×1.5 + Phòng Ngự ×1.2 + Khí Huyết ×0.1 + Thân Pháp ×0.5 (kèm hệ số trang bị và chức vị).
          </p>
        </div>

        <!-- Chi tiết ngũ đại thuộc tính -->
        <div class="space-y-2">
          <div class="card-ink p-2.5 flex items-center justify-between">
            <div>
              <span class="font-kai font-bold text-ink block text-[13px]">Tấn Công (ATK)</span>
              <span class="text-[10px] text-ink-faint">
                Cơ bản: {{ profile.atk.base.toLocaleString() }}
                <span v-if="profile.atk.bonus > 0" class="text-azure ml-1">
                  (+{{ profile.atk.bonus.toLocaleString() }})
                </span>
              </span>
            </div>
            <span class="font-kai text-[15px] font-bold text-cinnabar tabular">
              {{ profile.atk.total.toLocaleString() }}
            </span>
          </div>

          <div class="card-ink p-2.5 flex items-center justify-between">
            <div>
              <span class="font-kai font-bold text-ink block text-[13px]">Phòng Ngự (DEF)</span>
              <span class="text-[10px] text-ink-faint">
                Cơ bản: {{ profile.def.base.toLocaleString() }}
                <span v-if="profile.def.bonus > 0" class="text-azure ml-1">
                  (+{{ profile.def.bonus.toLocaleString() }})
                </span>
              </span>
            </div>
            <span class="font-kai text-[15px] font-bold text-azure tabular">
              {{ profile.def.total.toLocaleString() }}
            </span>
          </div>

          <div class="card-ink p-2.5 flex items-center justify-between">
            <div>
              <span class="font-kai font-bold text-ink block text-[13px]">Khí Huyết (HP)</span>
              <span class="text-[10px] text-ink-faint">
                Cơ bản: {{ profile.hp.base.toLocaleString() }}
                <span v-if="profile.hp.bonus > 0" class="text-azure ml-1">
                  (+{{ profile.hp.bonus.toLocaleString() }})
                </span>
              </span>
            </div>
            <span class="font-kai text-[15px] font-bold text-jade tabular">
              {{ profile.hp.total.toLocaleString() }}
            </span>
          </div>

          <div class="card-ink p-2.5 flex items-center justify-between">
            <div>
              <span class="font-kai font-bold text-ink block text-[13px]">Thân Pháp (SPD)</span>
              <span class="text-[10px] text-ink-faint">
                Cơ bản: {{ profile.speed.base }}
                <span v-if="profile.speed.bonus > 0" class="text-azure ml-1">
                  (+{{ profile.speed.bonus }})
                </span>
              </span>
            </div>
            <span class="font-kai text-[15px] font-bold text-gold-ink tabular">
              {{ profile.speed.total }}
            </span>
          </div>

          <div class="card-ink p-2.5 flex items-center justify-between">
            <div>
              <span class="font-kai font-bold text-ink block text-[13px]">Bạo Kích (CRIT)</span>
              <span class="text-[10px] text-ink-faint">
                Cơ bản: {{ profile.critRate.base }}%
                <span v-if="profile.critRate.bonus > 0" class="text-azure ml-1">
                  (+{{ profile.critRate.bonus }}%)
                </span>
              </span>
            </div>
            <span class="font-kai text-[15px] font-bold text-amber-ink tabular">
              {{ profile.critRate.total }}%
            </span>
          </div>
        </div>
      </div>


      <!-- =================================================================== -->
      <!-- TAB 3: TRANG BỊ CÁ NHÂN & SO SÁNH CHỈ SỐ (EQUIPMENT) -->
      <!-- =================================================================== -->
      <div v-else-if="activeTab === 'equip'" class="space-y-3 text-[12px]">
        <!-- So sánh chỉ số Trước & Sau khi trang bị -->
        <div v-if="equipOverview" class="card-ink p-3 space-y-2">
          <div class="flex items-center justify-between border-b border-ink/10 pb-1.5">
            <span class="font-kai font-semibold text-ink">Gia Tăng Thực Lực Từ Trang Bị</span>
            <span class="text-[11px] text-cinnabar font-bold font-kai">
              Lực Chiến +{{ equipOverview.totalEquipPowerBonus.toLocaleString() }}
            </span>
          </div>
          <div class="grid grid-cols-5 gap-1 text-center text-[10px]">
            <div class="card-ink p-1.5">
              <span class="text-ink-faint block">Công</span>
              <span class="font-bold text-cinnabar tabular">{{ equipOverview.statsWithEquip.atk }}</span>
              <span v-if="equipOverview.statsWithEquip.atk > equipOverview.statsWithoutEquip.atk" class="text-[9px] text-azure block">
                (+{{ equipOverview.statsWithEquip.atk - equipOverview.statsWithoutEquip.atk }})
              </span>
            </div>
            <div class="card-ink p-1.5">
              <span class="text-ink-faint block">Thủ</span>
              <span class="font-bold text-azure tabular">{{ equipOverview.statsWithEquip.def }}</span>
              <span v-if="equipOverview.statsWithEquip.def > equipOverview.statsWithoutEquip.def" class="text-[9px] text-azure block">
                (+{{ equipOverview.statsWithEquip.def - equipOverview.statsWithoutEquip.def }})
              </span>
            </div>
            <div class="card-ink p-1.5">
              <span class="text-ink-faint block">Khí Huyết</span>
              <span class="font-bold text-jade tabular">{{ equipOverview.statsWithEquip.hp }}</span>
              <span v-if="equipOverview.statsWithEquip.hp > equipOverview.statsWithoutEquip.hp" class="text-[9px] text-azure block">
                (+{{ equipOverview.statsWithEquip.hp - equipOverview.statsWithoutEquip.hp }})
              </span>
            </div>
            <div class="card-ink p-1.5">
              <span class="text-ink-faint block">Thân Pháp</span>
              <span class="font-bold text-gold-ink tabular">{{ equipOverview.statsWithEquip.speed }}</span>
              <span v-if="equipOverview.statsWithEquip.speed > equipOverview.statsWithoutEquip.speed" class="text-[9px] text-azure block">
                (+{{ equipOverview.statsWithEquip.speed - equipOverview.statsWithoutEquip.speed }})
              </span>
            </div>
            <div class="card-ink p-1.5">
              <span class="text-ink-faint block">Bạo Kích</span>
              <span class="font-bold text-amber-ink tabular">{{ equipOverview.statsWithEquip.critRate }}%</span>
              <span v-if="equipOverview.statsWithEquip.critRate > equipOverview.statsWithoutEquip.critRate" class="text-[9px] text-azure block">
                (+{{ equipOverview.statsWithEquip.critRate - equipOverview.statsWithoutEquip.critRate }}%)
              </span>
            </div>
          </div>
        </div>

        <!-- 10 Ô Trang Bị Chuẩn -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-[11px]">
            <span class="font-kai font-semibold text-ink">10 Ô Trang Bị Trên Thân:</span>
            <button
              class="btn-seal !py-0.5 !px-2 !text-[10px]"
              @click="showGiftModal = true"
            >
              {{ targetType === 'disciple' ? 'Ban Thưởng Đồ' : 'Tặng Quà Trang Bị' }}
            </button>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="slot in (equipOverview?.equippedSlots || [])"
              :key="slot.slot"
              class="card-ink p-2 space-y-1 border"
              :class="slot.item ? 'border-ink/20 bg-paper-deep/20' : 'border-dashed border-ink/15 opacity-60'"
            >
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-kai text-ink-faint">{{ slot.slotName }}</span>
                <QualityTag v-if="slot.quality" :quality="slot.quality" />
              </div>

              <div class="flex items-center justify-between">
                <span class="font-kai text-[11px] font-bold truncate max-w-[110px]" :class="slot.item ? 'text-ink' : 'text-ink-faint italic'">
                  {{ slot.item ? slot.templateName : 'Chưa mặc' }}
                </span>
                <span v-if="slot.combatScore > 0" class="text-[10px] text-cinnabar tabular font-bold">
                  {{ slot.combatScore }} đ
                </span>
              </div>

              <div v-if="slot.item" class="flex items-center justify-between text-[9px] text-ink-faint border-t border-ink/10 pt-0.5">
                <span>Bậc {{ slot.tier }} · Lv.{{ slot.level }}</span>
                <span v-if="slot.originText" class="text-azure truncate">{{ slot.originText }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Hành Trang Chưa Mặc Của NPC -->
        <div class="card-ink p-3 space-y-2">
          <span class="font-kai font-semibold text-ink block text-[11px]">Hành Trang Dự Trữ Của Tu Sĩ:</span>
          <div
            v-if="!equipOverview?.inventoryItems || equipOverview.inventoryItems.length === 0"
            class="text-[11px] text-ink-faint italic"
          >
            Hành trang hiện chưa có thêm trang bị dự trữ.
          </div>
          <div v-else class="space-y-1.5 max-h-[22vh] overflow-y-auto pr-1">
            <div
              v-for="inv in equipOverview.inventoryItems"
              :key="inv.item?.uid || inv.slot"
              class="rounded bg-paper-deep/30 p-1.5 border border-ink/10 flex items-center justify-between"
            >
              <div>
                <span class="font-kai font-semibold text-ink text-[11px]">{{ inv.templateName }}</span>
                <span class="text-[9px] text-ink-faint ml-1.5">({{ inv.slotName }} · Bậc {{ inv.tier }})</span>
              </div>
              <div class="text-right">
                <span class="text-[10px] text-cinnabar tabular font-semibold">{{ inv.combatScore }} đ</span>
                <span v-if="inv.originText" class="text-[9px] text-azure block">{{ inv.originText }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- TAB: TÚI ĐỒ & HÀNH TRANG CÁ NHÂN (BAG) -->
      <!-- =================================================================== -->
      <div v-else-if="activeTab === 'bag'" class="space-y-3 text-[12px]">
        <!-- Thẻ thông tin tài sản & Hảo cảm -->
        <div class="card-ink p-3 space-y-2">
          <div class="flex items-center justify-between border-b border-ink/10 pb-1.5 flex-wrap gap-2">
            <span class="font-kai font-semibold text-ink">Hành Trang & Trữ Vật Cá Nhân</span>
            <div class="flex items-center gap-2">
              <span class="rounded bg-amber-ink/10 px-2 py-0.5 text-[11px] font-kai font-semibold text-gold-ink">
                {{ (bagOverview?.stones ?? 0).toLocaleString() }} Linh thạch
              </span>
              <span class="rounded bg-cinnabar/10 px-2 py-0.5 text-[11px] font-kai font-semibold text-cinnabar">
                Hảo Cảm: {{ currentFavor }} / 100
              </span>
            </div>
          </div>
          <p class="text-[10px] text-ink-faint leading-relaxed">
            Mỗi tháng tu sĩ sẽ tự động sử dụng đan dược để bồi dưỡng bản thân hoặc đi lịch luyện thu thập bảo vật.
            Người chơi có thể <strong>Xin</strong> (thành công nếu hảo cảm đủ cao) hoặc bí mật <strong>Trộm</strong> (nếu bị bắt quả tang sẽ bị giảm mạnh độ hảo cảm).
          </p>
        </div>

        <!-- Danh sách vật phẩm trong túi -->
        <div v-if="bagOverview && bagOverview.items.length > 0" class="space-y-2">
          <div
            v-for="item in bagOverview.items"
            :key="item.id"
            class="rounded bg-paper-deep/40 p-2.5 border border-ink/10 flex items-center justify-between gap-2.5"
          >
            <div class="flex items-center gap-2.5 min-w-0 grow">
              <div class="grid h-8 w-8 shrink-0 place-items-center rounded bg-ink/5 border border-ink/10 text-azure">
                <GameIcon :name="item.icon || 'box'" :size="16" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-kai font-bold text-ink text-[12px] truncate">{{ item.name }}</span>
                  <span
                    v-if="item.qualityName"
                    class="rounded px-1.5 py-0.1 text-[9px] font-kai font-semibold border border-gold-ink/30 bg-gold-ink/10 text-gold-ink"
                  >
                    {{ item.qualityName }}
                  </span>
                  <span v-if="item.tier" class="text-[9px] text-ink-faint">
                    (Bậc {{ item.tier }})
                  </span>
                </div>
                <p class="text-[10px] text-ink-faint truncate">{{ item.desc }}</p>
              </div>
            </div>

            <div class="flex items-center gap-1.5 shrink-0">
              <button
                class="btn-ghost !px-2.5 !py-1 !text-[11px] hover:text-azure"
                title="Thỉnh cầu NPC tặng vật phẩm này"
                @click="handleRequest(item)"
              >
                Xin
              </button>
              <button
                class="btn-seal !px-2.5 !py-1 !text-[11px] !bg-scarlet !text-cream shadow-sm"
                title="Lén lút thâu đoạt (nguy cơ bị phát hiện)"
                @click="handleSteal(item)"
              >
                Trộm
              </button>
            </div>
          </div>
        </div>

        <div v-else class="card-ink p-4 text-center text-ink-faint text-[11px]">
          Túi trữ vật hiện đang trống rỗng. Tu sĩ sẽ sớm thu thập bảo vật trong kỳ lịch luyện tới.
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- TAB 4: CÔNG PHÁP, KỸ NĂNG & TƯ CHẤT -->
      <!-- =================================================================== -->
      <div v-else-if="activeTab === 'gongfa'" class="space-y-3 text-[12px]">
        <!-- Linh Căn & Ngộ Tính -->
        <div class="grid grid-cols-2 gap-2.5">
          <div class="card-ink p-2.5 space-y-1">
            <span class="text-ink-faint text-[10px] block font-kai">LINH CĂN BẢN MỆNH</span>
            <div class="flex items-center gap-1.5">
              <span class="font-kai font-bold text-[14px]" :style="{ color: profile.elementColor }">
                {{ profile.elementName }} Hệ Linh Căn
              </span>
            </div>
          </div>
          <div class="card-ink p-2.5 space-y-1">
            <span class="text-ink-faint text-[10px] block font-kai">NGỘ TÍNH CĂN CƠ</span>
            <div class="flex items-center justify-between">
              <span class="font-bold text-ink text-[14px]">{{ profile.comprehension }}</span>
              <span class="font-kai text-[11px]" :class="profile.comprehensionRank.colorClass">
                {{ profile.comprehensionRank.label }}
              </span>
            </div>
          </div>
        </div>

        <!-- Tiên Thiên Tư Chất -->
        <div class="card-ink p-3 space-y-2">
          <span class="font-kai font-semibold text-ink block text-[12px]">Tiên Thiên Tư Chất:</span>
          <div v-if="profile.aptitudes.length === 0" class="text-ink-faint text-[11px] italic">
            Chưa phát hiện tư chất tiên thiên đặc dị.
          </div>
          <div v-else class="flex flex-wrap gap-1.5">
            <div
              v-for="apt in profile.aptitudes"
              :key="apt.id"
              class="rounded border px-2 py-1 text-[11px] font-kai bg-paper-deep/30"
              :class="apt.borderClass"
              :title="apt.desc"
            >
              <span :class="apt.colorClass">{{ apt.name }}</span>
              <span class="text-[9px] text-ink-faint ml-1">({{ apt.gradeName }})</span>
            </div>
          </div>
        </div>

        <!-- Công Pháp Chủ Tu -->
        <div class="card-ink p-3 space-y-2">
          <span class="font-kai font-semibold text-ink block text-[12px]">Công Pháp Chủ Tu:</span>
          <div v-if="profile.activeGongfa" class="space-y-1 bg-paper-deep/30 rounded p-2 border border-ink/10">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <span class="font-kai font-bold text-gold-ink text-[13px]">{{ profile.activeGongfa.name }}</span>
                <span
                  class="rounded px-1.5 py-0.2 text-[9px] font-kai font-semibold border"
                  :class="profile.activeGongfa.origin === 'comprehended'
                    ? 'border-azure/40 bg-azure/10 text-azure'
                    : profile.activeGongfa.origin === 'inherited'
                      ? 'border-cinnabar/40 bg-cinnabar/10 text-cinnabar'
                      : 'border-gold-ink/40 bg-gold-ink/10 text-gold-ink'"
                >
                  【{{ profile.activeGongfa.originLabel }}】
                </span>
              </div>
              <span class="text-[10px] text-ink-faint">Yêu cầu: {{ profile.activeGongfa.minRealmName }}</span>
            </div>
            <p class="text-[11px] text-ink-soft leading-relaxed">{{ profile.activeGongfa.desc }}</p>
          </div>
          <div v-else class="text-ink-faint text-[11px] italic">
            Chưa vận hành công pháp chủ tu nào.
          </div>
        </div>

        <!-- Danh Sách Công Pháp Đã Học & Nguồn Gốc -->
        <div class="card-ink p-3 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-kai font-semibold text-ink block text-[12px]">
              Tất Cả Công Pháp Đã Học ({{ profile.learnedGongfas.length }}):
            </span>
            <span class="text-[10px] text-ink-faint">Tự Ngộ · Thụ Giáo · Chân Truyền</span>
          </div>

          <div v-if="profile.learnedGongfas.length === 0" class="text-ink-faint text-[11px] italic">
            Chưa học công pháp nào.
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="gf in profile.learnedGongfas"
              :key="gf.id"
              class="rounded border border-ink/10 bg-paper-deep/20 p-2 space-y-1"
            >
              <div class="flex items-center justify-between text-[11px]">
                <div class="flex items-center gap-1.5">
                  <span class="font-kai font-bold text-ink">{{ gf.name }}</span>
                  <span
                    class="rounded px-1.5 py-0.2 text-[9px] font-kai font-semibold border"
                    :class="gf.origin === 'comprehended'
                      ? 'border-azure/40 bg-azure/10 text-azure'
                      : gf.origin === 'inherited'
                        ? 'border-cinnabar/40 bg-cinnabar/10 text-cinnabar'
                        : 'border-gold-ink/40 bg-gold-ink/10 text-gold-ink'"
                  >
                    【{{ gf.originLabel }}】
                  </span>
                </div>
                <span class="text-[10px] text-ink-faint">{{ gf.minRealmName }}</span>
              </div>
              <p v-if="gf.desc" class="text-[10px] text-ink-faint">{{ gf.desc }}</p>
            </div>
          </div>
        </div>

        <!-- Kỹ Năng Chiến Đấu -->
        <div class="card-ink p-3 space-y-2">
          <span class="font-kai font-semibold text-ink block text-[12px]">Kỹ Năng & Bí Quyết Xuất Chiêu:</span>
          <div class="space-y-2">
            <div
              v-for="sk in profile.skills"
              :key="sk.name"
              class="rounded border border-ink/10 bg-paper-deep/20 p-2 space-y-1"
            >
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-kai font-bold text-ink">{{ sk.name }}</span>
                <span class="text-cinnabar font-semibold">
                  Hệ số sát thương: ×{{ sk.mult.toFixed(2) }} · Kích hoạt: {{ Math.round(sk.rate * 100) }}%
                </span>
              </div>
              <p v-if="sk.desc" class="text-[10px] text-ink-faint">{{ sk.desc }}</p>
            </div>
          </div>
        </div>
      </div>


      <!-- =================================================================== -->
      <!-- TAB 5: QUAN HỆ & ĐẠO LỮ (RELATIONS & DAOLU) -->
      <!-- =================================================================== -->
      <div v-else-if="activeTab === 'relation'" class="space-y-3 text-[12px]">
        <!-- Mối quan hệ với người chơi -->
        <div class="card-ink p-3 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-kai text-ink-soft">Mối Quan Hệ Với Đạo Hữu:</span>
            <span class="font-kai font-bold text-cinnabar text-[13px]">{{ profile.relationLabel }}</span>
          </div>
          <div class="flex items-center justify-between border-t border-ink/10 pt-1.5 text-[11px]">
            <span class="text-ink-faint">Điểm Hảo Cảm:</span>
            <span class="font-semibold text-gold-ink tabular">{{ profile.favor }}</span>
          </div>
        </div>

        <!-- Khu vực riêng cho Đạo Lữ -->
        <div v-if="profile.daoluBond" class="card-ink p-3.5 space-y-3 border-cinnabar/30 bg-cinnabar/5">
          <div class="flex items-center justify-between border-b border-cinnabar/20 pb-2">
            <div>
              <span class="font-kai font-bold text-cinnabar text-[14px]">ĐẠO LỮ KẾT DUYÊN</span>
              <p class="text-[10px] text-ink-faint">Giai vị tình cảm: {{ profile.daoluBond.stageName }}</p>
            </div>
            <span class="text-[11px] text-ink-soft font-kai font-semibold">
              Cùng trải qua: {{ profile.daoluBond.shared }} biến cố
            </span>
          </div>

          <!-- 4 Chỉ số tình duyên -->
          <div class="space-y-2 text-[11px]">
            <div>
              <div class="flex justify-between text-[10px] text-ink-faint mb-0.5">
                <span>Duyên Phận (Fate)</span>
                <span class="tabular font-semibold text-ink">{{ profile.daoluBond.fate }} / 100</span>
              </div>
              <div class="h-1.5 w-full rounded-full bg-ink/10 overflow-hidden">
                <div class="h-full rounded-full bg-cinnabar" :style="{ width: `${profile.daoluBond.fate}%` }" />
              </div>
            </div>

            <div>
              <div class="flex justify-between text-[10px] text-ink-faint mb-0.5">
                <span>Độ Tin Cậy (Trust)</span>
                <span class="tabular font-semibold text-ink">{{ profile.daoluBond.trust }} / 100</span>
              </div>
              <div class="h-1.5 w-full rounded-full bg-ink/10 overflow-hidden">
                <div class="h-full rounded-full bg-azure" :style="{ width: `${profile.daoluBond.trust}%` }" />
              </div>
            </div>

            <div>
              <div class="flex justify-between text-[10px] text-ink-faint mb-0.5">
                <span>Đồng Tâm (Accord)</span>
                <span class="tabular font-semibold text-ink">{{ profile.daoluBond.accord }} / 100</span>
              </div>
              <div class="h-1.5 w-full rounded-full bg-ink/10 overflow-hidden">
                <div class="h-full rounded-full bg-gold-ink" :style="{ width: `${profile.daoluBond.accord}%` }" />
              </div>
            </div>

            <div>
              <div class="flex justify-between text-[10px] text-ink-faint mb-0.5">
                <span>Tâm Ý Tương Thông (Intent)</span>
                <span class="tabular font-semibold text-ink">{{ displayIntent }} / 100</span>
              </div>
              <div class="h-1.5 w-full rounded-full bg-ink/10 overflow-hidden">
                <div class="h-full rounded-full bg-jade" :style="{ width: `${displayIntent}%` }" />
              </div>
              <p v-if="profile.daoluBond.intentWish" class="mt-1 text-[10px] text-ink-faint italic truncate">
                Tâm nguyện: {{ profile.daoluBond.intentWish }}
              </p>
            </div>
          </div>
        </div>
      </div>


      <!-- FOOTER: NÚT ĐÓNG -->
      <div class="flex justify-end pt-2">
        <button class="btn-ghost !px-5 !py-1.5 !text-[12px]" @click="$emit('close')">
          Đóng
        </button>
      </div>

      <!-- MODAL TẶNG QUÀ / BAN THƯỞNG -->
      <GiftToNpcModal
        :open="showGiftModal"
        :target-id="profile.id"
        :target-name="profile.name"
        :target-type="targetType"
        :target-gender="profile.gender"
        :target-major="profile.major"
        :target-sub="profile.sub"
        :target-element="profile.element"
        @close="showGiftModal = false"
        @gifted="onGiftSuccess"
      />
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import BaseModal from '@/components/common/BaseModal.vue'
  import GameIcon from '@/components/common/GameIcon.vue'
  import QualityTag from '@/components/common/QualityTag.vue'
  import GiftToNpcModal from '@/components/character/GiftToNpcModal.vue'
  import type { UnifiedNpcProfile } from '@/core/npcProfileService'
  import {
    buildNpcEquipmentOverview,
    type NpcEquipmentOverview
  } from '@/core/npcEquipmentService'
  import {
    buildNpcBagOverview,
    requestNpcItem,
    stealNpcItem,
    type NpcBagOverview,
    type NpcBagItem
  } from '@/core/npcBagService'
  import { useUiStore } from '@/stores/ui'
  import { useNpcStore } from '@/stores/npc'

  const props = defineProps<{
    open: boolean
    profile: UnifiedNpcProfile | null
  }>()

  const emit = defineEmits<{
    (e: 'close'): void
    (e: 'updated'): void
  }>()

  const activeTab = ref<'overview' | 'combat' | 'equip' | 'bag' | 'gongfa' | 'relation'>('overview')
  const showGiftModal = ref(false)
  const bagOverview = ref<NpcBagOverview | null>(null)
  const dynamicEquipOverview = ref<NpcEquipmentOverview | null>(null)

  const equipOverview = computed(() => dynamicEquipOverview.value ?? props.profile?.equipOverview)

  function refreshBag(): void {
    if (props.profile) {
      bagOverview.value = buildNpcBagOverview(props.profile.id, props.profile.major)
    }
  }

  function refreshEquip(): void {
    if (props.profile) {
      dynamicEquipOverview.value = buildNpcEquipmentOverview(
        props.profile.id,
        props.profile.major,
        props.profile.sub,
        props.profile.element
      )
    }
  }

  function onGiftSuccess(res?: { success: boolean; message: string }): void {
    if (res?.success !== false) {
      refreshBag()
      refreshEquip()
      emit('updated')
    }
  }

  watch(
    () => [props.open, props.profile?.id, activeTab.value],
    () => {
      if (props.open && props.profile) {
        refreshBag()
        refreshEquip()
      }
    },
    { immediate: true }
  )

  const displayIntent = computed(() => {
    if (!props.profile?.daoluBond) return 0
    const it = props.profile.daoluBond.intent
    if (typeof it === 'number' && Number.isFinite(it)) {
      return Math.max(0, Math.min(100, Math.round(it)))
    }
    if (it && typeof it === 'object' && 'ripeness' in (it as Record<string, unknown>)) {
      const r = (it as { ripeness?: number }).ripeness
      return typeof r === 'number' && Number.isFinite(r) ? Math.max(0, Math.min(100, Math.round(r * 100))) : 0
    }
    return 0
  })

  const displayCombatPower = computed(() => {
    if (!props.profile) return 0
    const currentBonus = equipOverview.value?.totalEquipPowerBonus ?? 0
    const originalBonus = props.profile.equipOverview?.totalEquipPowerBonus ?? 0
    return Math.max(0, props.profile.combatPower - originalBonus + currentBonus)
  })

  const currentFavor = computed(() => (props.profile ? useNpcStore().getFavor(props.profile.id) : 0))

  function handleRequest(item: NpcBagItem): void {
    if (!props.profile) return
    const res = requestNpcItem(props.profile.id, item)
    if (res.success) {
      useUiStore().toast(res.message, 'success')
      refreshBag()
      refreshEquip()
      emit('updated')
    } else {
      useUiStore().toast(res.message, 'info')
    }
  }

  function handleSteal(item: NpcBagItem): void {
    if (!props.profile) return
    const res = stealNpcItem(props.profile.id, item)
    if (res.success) {
      useUiStore().toast(res.message, 'rare')
      refreshBag()
      refreshEquip()
      emit('updated')
    } else {
      useUiStore().toast(res.message, 'warn')
    }
  }

  const TABS = [
    { id: 'overview', label: 'Tổng Quan' },
    { id: 'combat', label: 'Chiến Lực' },
    { id: 'equip', label: 'Trang Bị' },
    { id: 'bag', label: 'Túi Đồ' },
    { id: 'gongfa', label: 'Công Pháp' },
    { id: 'relation', label: 'Quan Hệ' }
  ] as const

  const targetType = computed<'daolu' | 'disciple' | 'npc'>(() => {
    if (props.profile?.relationType === 'daolu') return 'daolu'
    if (props.profile?.rank) return 'disciple'
    return 'npc'
  })
</script>
