<template>
  <div class="stagger-in px-4 pb-6 pt-4">
    <!-- 页签 -->
    <InkTabs v-model="tab" :tabs="tabs" />

    <!-- 装备:部位槽,点击唤起部位列表 -->
    <template v-if="tab === 'equip'">
      <!-- 装备共鸣:机制是活的,玩家却看不见 —— 同组两件即共鸣,（2/2）亮起 -->
      <div v-if="setRows.length" class="card-ink mt-3 px-4 py-2.5">
        <p class="text-[10px] text-ink-faint">Cộng Hưởng Trang Bị (2 món cùng bộ kích hoạt, cơ chế không cộng dồn số liệu)</p>
        <p v-for="s in setRows" :key="s.def.id" class="mt-1 flex items-center gap-2 text-[11px]">
          <span class="font-kai shrink-0" :class="s.active ? 'text-jade' : 'text-ink-soft'">{{ displayEquipSetName(s.def.name) }}</span>
          <span class="tabular shrink-0" :class="s.active ? 'text-jade' : 'text-ink-faint'">{{ s.count }}/{{ s.def.required }}</span>
          <span class="min-w-0 grow text-[10px] leading-relaxed text-ink-faint">{{ displayEquipSetDesc(s.def.effectDesc) }}</span>
          <button class="-my-2 shrink-0 px-1 py-2 text-[10px] text-azure active:opacity-60" @click="onEquipSet(s.def.id)">
            Mặc bộ → ({{ s.preview > 0 ? `Đổi ${s.preview}` : 'Đã đủ' }})
          </button>
        </p>
      </div>
      <div class="mt-3 flex items-center justify-between px-1">
        <span class="text-[11px] text-ink-faint tabular">Tàng phẩm {{ inventory.bagItems.length }} · Khí Linh Trần {{ resources.dust }}</span>
        <span class="flex gap-3">
          <button class="-my-1.5 py-1.5 text-[11px] text-azure active:opacity-60" @click="smartOpen = true">
            Thu gom{{ settings.smartKeep.enabled ? ' · Bật' : '' }}
          </button>
          <button class="-my-1.5 py-1.5 text-[11px] text-cinnabar active:opacity-60" @click="decomposeOpen = true">Phân giải</button>
        </span>
      </div>
      <div class="mt-2 grid grid-cols-3 gap-2">
        <button
          v-for="row in slotRows"
          :key="row.slot"
          class="card-ink relative flex flex-col items-center gap-1 px-2 py-2.5 active:scale-98"
          :aria-label="`${row.name}${row.upgradeable ? ', trong túi có món mạnh hơn' : ''}`"
          @click="pickerSlot = row.slot"
        >
          <!-- 行囊里有更强的:槽卡上一枚小章 -->
          <span
            v-if="row.upgradeable"
            role="img"
            :aria-label="`Ô ${row.name}, trong túi có món mạnh hơn`"
            class="absolute right-1 top-1 rounded-sm bg-gold-ink/20 px-1 font-kai text-[8px] leading-[12px] text-gold-ink"
          >Có thể đổi</span>
          <span class="text-[9px] text-ink-faint">
            {{ displayEquipSlot(row.name) }}
            <template v-if="row.stock">· {{ row.stock }}</template>
          </span>
          <template v-if="row.item && row.template">
            <GameIcon :name="row.template.icon" :size="16" :style="{ color: qualityDef(row.item.quality).color }" />
            <span class="w-full truncate text-center font-kai text-[10px]" :style="{ color: qualityDef(row.item.quality).color }">
              {{ displayEquipName(row.template.name) }}
              <template v-if="row.item.level > 0">+{{ row.item.level }}</template>
              <template v-if="row.item.note">·{{ row.item.note }}</template>
            </span>
          </template>
          <template v-else>
            <span class="grid h-4 w-4 place-items-center text-ink-faint">·</span>
            <span class="text-[10px] text-ink-faint">Trống</span>
          </template>
        </button>
      </div>
      <p v-if="hasUpgradeableSlot" class="text-center text-[9px] text-ink-faint">
        Góc điểm kim = Trong túi có món mạnh hơn dự bị, chạm vào ô để thay ngay
      </p>
      <p class="mt-2 text-center text-[10px] text-ink-faint">Chạm vào vị trí để xem lựa chọn, khi túi đầy rơi phẩm mới tự chuyển thành Khí Linh Trần</p>
      <button class="btn-ghost mt-2 w-full !py-1.5 !text-[11px]" @click="onEquipAllBest">
        Nhanh · Tự trang bị món mạnh nhất từng vị trí {{ bestSwapPreview }}
      </button>
      <button
        v-if="equippedCount > 0"
        class="btn-ghost mt-2 w-full !py-1.5 !text-[11px] !text-ink-faint"
        @click="onUnequipAll"
      >Tháo sạch · Tháo toàn bộ trang bị ({{ equippedCount }})</button>

      <!-- 全部藏品(含佩戴中):部位槽之下的完整清单 -->
      <div v-if="allItems.length" class="mt-4">
        <SectionTitle title="Toàn Bộ Tàng Phẩm" :hint="`${allItems.length} món · Túi đồ ${inventory.bagItems.length}/${BAG_CAPACITY}`" />
        <div class="mt-2 grid grid-cols-5 gap-1.5">
          <EquipmentCard v-for="row in allItems" :key="row.item.uid" :item="row.item" :equipped="row.equipped" @open="openDetail" />
        </div>
      </div>
      <p v-else class="mt-8 text-center text-[12px] text-ink-faint">Túi đồ trống không, hãy đi lịch luyện tìm kiếm cơ duyên</p>
    </template>

    <!-- 丹药 -->
    <template v-else-if="tab === 'pill'">
      <!-- 开炉炼丹:入口置顶,点开弹窗 -->
      <button
        class="card-ink mt-3 flex w-full items-center justify-between gap-3 px-4 py-3 text-left active:scale-98"
        @click="craftOpen = true"
      >
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-cinnabar/85 font-kai text-[19px] seal-face">Lò</span>
        <span class="min-w-0 flex-1">
          <span class="block font-kai text-[14px] tracking-widest text-ink">Khai Lò Luyện Đan</span>
          <span class="block truncate text-[10px] leading-relaxed text-ink-faint">
            {{ recipes.length > 0 ? `Đan phương đã biết ${recipes.length} loại · ${displayQualityName(HERB_GRADE_SHORT[herbGrade])} Linh Thảo × ${formatNum(resources.herbOf(herbGrade))}` : 'Chưa rõ đan phương nào' }}<!-- 灵草 -->
          </span>
        </span>
        <span class="shrink-0 text-[12px] text-ink-faint">›</span>
      </button>

      <!-- 丹匣:格子只给图标与名号,详情看弹窗 -->
      <div v-if="pillRows.length" class="mt-3 grid grid-cols-4 gap-1.5">
        <button
          v-for="row in pillRows"
          :key="row.def!.id"
          class="relative aspect-square rounded-md border transition-transform active:scale-98"
          :style="{ borderColor: tint(pillQualityColor(row.def!), 0.33), background: tint(pillQualityColor(row.def!), 0.06) }"
          @click="pillDetail = row.def!.id"
        >
          <span class="flex h-full w-full flex-col items-center justify-center gap-0.5 px-1">
            <GameIcon :name="row.def!.icon" :size="20" :style="{ color: pillQualityColor(row.def!) }" />
            <span class="w-full truncate text-center text-[9px] leading-tight" :style="{ color: pillQualityColor(row.def!) }">
              {{ displayPillName(row.def!.name) }}
            </span>
          </span>
          <span class="absolute bottom-0.5 right-1 text-[9px] leading-none text-ink-soft tabular">×{{ row.count }}</span>
        </button>
      </div>
      <p v-else class="mt-10 text-center text-[12px] text-ink-faint">
        Hộp đan trống không
        <br />
        <span class="text-[11px]">Đan dược phần lớn rơi từ lịch luyện, kỳ ngộ trên đường và khai lò luyện đan</span>
      </p>
    </template>

    <!-- 材料 -->
    <template v-else-if="tab === 'material'">
      <div class="mt-3 grid grid-cols-4 gap-1.5">
        <button
          v-for="m in materialGrid"
          :key="m.key"
          class="relative aspect-square rounded-md border border-ink/15 bg-ink/[0.03] transition-transform active:scale-98"
          @click="materialDetail = m.key"
        >
          <span class="flex h-full w-full flex-col items-center justify-center gap-0.5 px-1">
            <GameIcon :name="m.icon" :size="20" :class="m.color" />
            <span class="w-full truncate text-center text-[9px] leading-tight text-ink-soft">{{ m.name }}</span>
          </span>
          <span class="absolute bottom-0.5 right-1 text-[9px] leading-none text-ink-soft tabular">{{ m.display }}</span>
        </button>
      </div>
    </template>

    <!-- 法宝 -->
    <template v-else>
      <!-- 随身法宝槽:装着谁、空着哪一格,一眼即知 -->
      <div class="mt-3 flex items-center gap-2 px-1">
        <span class="shrink-0 text-[11px] text-ink-soft">Tùy thân</span>
        <template v-for="(row, k) in artifactSlotRows" :key="k">
          <div class="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-dashed border-ink/20 bg-paper-deep/50">
            <GameIcon v-if="row" :name="row.def.icon" :size="20" :style="{ color: qualityDef(row.def.quality).color }" />
            <span v-else class="font-kai text-[11px] text-ink-faint">Trống</span>
          </div>
        </template>
        <span v-if="artifactSlots < ARTIFACT_MAX_SLOTS" class="text-[10px] text-ink-faint">
          · Cảnh giới {{ artifactUnlockRealm }} mở ô thứ {{ cnNumber(ARTIFACT_MAX_SLOTS) }}
        </span>
      </div>
      <!-- 祭炼到底给什么 -->
      <p class="mt-1 px-1 text-[10px] text-ink-faint">
        Luyện tế một tầng, bị động và thần thông tăng thêm {{ formatPercent(ARTIFACT_LEVEL_BONUS) }}, tối đa {{ cnNumber(ARTIFACT_MAX_LEVEL) }} tầng — Chạm mốc cực hạn sẽ không tăng thêm
      </p>
      <div v-if="artifactRows.length" class="mt-2 space-y-2.5">
        <div v-for="row in artifactRows" :key="row.def.id" class="card-ink px-4 py-3">
          <div class="flex items-center gap-2">
            <GameIcon :name="row.def.icon" :size="18" :style="{ color: qualityDef(row.def.quality).color }" />
            <span class="font-kai text-[14px]" :style="{ color: qualityDef(row.def.quality).color }">{{ displayArtifactName(row.def.name) }}</span>
            <QualityTag :quality="row.def.quality" />
            <span class="ml-auto tabular text-[11px] text-gold-ink">{{ displayArtifactLevelLabel(artifactLevelLabel(row.owned.level)) }}</span>
          </div>
          <!-- 祭炼进度 -->
          <div class="mt-1.5 flex items-center gap-1.5">
            <span class="shrink-0 text-[10px] text-ink-faint">Luyện tế</span>
            <span
              v-for="n in ARTIFACT_MAX_LEVEL"
              :key="n"
              class="h-1.5 grow rounded-full transition-colors"
              :class="n <= row.owned.level ? (row.owned.level >= ARTIFACT_MAX_LEVEL ? 'bg-gold-ink' : 'bg-cinnabar/80') : 'bg-ink/6 border border-ink/15'"
            />
          </div>
          <p class="mt-1.5 text-[11px] leading-relaxed text-ink-faint">{{ displayArtifactDesc(row.def.desc) }}</p>
          <p class="mt-1 flex items-baseline gap-1.5 text-[11px]">
            <span class="shrink-0 rounded bg-azure/10 px-1.5 py-0.5 text-[10px] leading-relaxed text-azure">Bị động</span>
            <span class="text-azure">{{ passiveLines(row.def.id, row.owned.level).map(displayArtifactPassive).join(' · ') }}</span>
          </p>
          <p class="mt-1 flex items-baseline gap-1.5 text-[11px]">
            <span class="shrink-0 rounded bg-violet-ink/10 px-1.5 py-0.5 text-[10px] leading-relaxed text-violet-ink">Thần thông</span>
            <span class="text-violet-ink">「{{ displayArtifactActiveName(row.def.active.name) }}」: {{ displayArtifactActiveDesc(artifactActiveText(row.def, row.owned.level)) }}</span>
          </p>
          <p v-if="nextGainText(row.def.id, row.owned.level)" class="mt-1 text-[10px] leading-relaxed text-ink-faint tabular">
            Tầng kế: {{ displayArtifactActiveDesc(nextGainText(row.def.id, row.owned.level)) }}
          </p>
          <div class="mt-2.5 flex gap-2">
            <button
              class="btn-seal flex-1 !py-1.5 !text-[12px]"
              :class="{ '!bg-ink-faint': row.equipped }"
              @click="toggleArtifact(row.def.id)"
            >
              {{ row.equipped ? 'Thu hồi pháp bảo' : 'Luyện tế tùy thân' }}
            </button>
            <button
              v-if="row.upCost"
              class="btn-ghost flex-1 !py-1.5 !text-[12px] tabular"
              :disabled="!row.canUp"
              :title="!row.canUp ? 'Ngộ đạo hoặc linh thạch không đủ' : undefined"
              @click="upgradeArtifact(row.def.id)"
            >
              Luyện hóa (Ngộ đạo {{ row.upCost.wudao }} · Linh thạch {{ formatGN(row.upCost.stone) }}){{ row.canUp ? '' : ' · Chưa đủ' }}
            </button>
          </div>
          <div v-if="row.artPlan.levels >= 2" class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-md border border-ink/10 bg-paper-deep/50 px-2.5 py-2">
            <template v-if="batchArtConfirm !== row.def.id">
              <p class="min-w-[5rem] flex-1 text-[10px] leading-snug text-ink-soft">
                Luyện liên tiếp tới <span class="font-kai text-[11px] text-cinnabar">Tầng thứ {{ row.owned.level + row.artPlan.levels }}</span>
                <span class="mt-0.5 block text-[9px] text-ink-faint tabular">Tổng hao: Ngộ đạo × {{ row.artPlan.wudao }} · Linh thạch {{ formatGN(row.artPlan.stone) }}</span>
              </p>
              <button class="btn-ghost shrink-0 !px-3 !py-2 !text-[11px]" @click="batchArtConfirm = row.def.id">Luyện Nhanh</button>
            </template>
            <template v-else>
              <p class="min-w-[5rem] flex-1 text-[10px] leading-snug text-ink-soft">
                Một bước luyện liên tiếp {{ row.artPlan.levels }} tầng, tiêu tốn khoản trên — Vẫn tiếp tục?
              </p>
              <button class="btn-ghost shrink-0 !px-2.5 !py-2 !text-[11px]" @click="batchArtConfirm = null">Nghĩ lại</button>
              <button class="btn-seal shrink-0 !px-2.5 !py-2 !text-[11px]" @click="runArtifactBatch(row.def.id)">Luyện Nhanh</button>
            </template>
          </div>
        </div>
      </div>
      <p v-else class="mt-16 text-center text-[12px] text-ink-faint">
        Chưa có pháp bảo tùy thân
        <br />
        <span class="text-[11px]">Pháp bảo phần lớn xuất xứ từ kỳ ngộ và tay cường địch</span>
      </p>
      <p v-if="player.petId" class="mt-4 text-center text-[11px] text-ink-faint">Linh thú bầu bạn, có thể đến trang "Nhân Vật" để xem</p>
    </template>

    <!-- 丹药详情 -->
    <BaseModal :open="currentPill !== null" :title="displayPillName(currentPill?.def?.name ?? '')" @close="pillDetail = null">
      <template v-if="currentPill?.def">
        <div class="flex items-center gap-3">
          <span
            class="grid h-12 w-12 shrink-0 place-items-center rounded-md"
            :style="{ color: pillQualityColor(currentPill.def), background: tint(pillQualityColor(currentPill.def), 0.08) }"
          >
            <GameIcon :name="currentPill.def.icon" :size="24" />
          </span>
          <div class="min-w-0">
            <p class="text-[11px]" :style="{ color: pillQualityColor(currentPill.def) }">
              {{ displayQualityName(pillQualityName(currentPill.def)) }}
            </p>
            <p class="text-[11px] text-ink-faint tabular">Sở hữu ×{{ currentPill.count }}</p>
          </div>
        </div>
        <p class="mt-3 text-[12px] leading-relaxed text-ink-soft">{{ displayPillDesc(currentPill.def.desc) }}</p>
        <p class="mt-2 whitespace-pre-line text-[12px] leading-relaxed text-azure">{{ displayPillFuncText(pillFuncText(currentPill.def)) }}</p>
        <p v-if="pillMasteryText(currentPill.def.id)" class="mt-1 text-[11px] text-ink-faint">
          {{ pillMasteryText(currentPill.def.id) }}
        </p>
      </template>
      <template #footer>
        <div class="grid grid-cols-2 gap-2">
          <button class="btn-seal" @click="onUsePill()">Dùng</button>
          <button
            v-if="(currentPill?.count ?? 0) >= 2 && currentPill?.def?.kind !== 'buff'"
            class="btn-ghost"
            @click="onUsePillBatch()"
          >
            Dùng liên tiếp ×{{ Math.min(5, currentPill?.count ?? 0) }}
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- 材料详情 -->
    <BaseModal :open="currentMaterial !== null" :title="currentMaterial?.name ?? ''" @close="materialDetail = null">
      <template v-if="currentMaterial">
        <div class="flex items-center gap-3">
          <span class="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-ink/5">
            <GameIcon :name="currentMaterial.icon" :size="24" :class="currentMaterial.color" />
          </span>
          <div class="min-w-0">
            <p class="font-kai text-[15px] text-ink tabular">{{ currentMaterial.full }}</p>
            <p class="text-[10px] text-ink-faint">Hiện có</p>
          </div>
        </div>
        <p class="mt-3 text-[12px] leading-relaxed text-ink-soft">{{ currentMaterial.desc }}</p>
        <button
          v-if="currentMaterial.key === 'Linh Căn Quả'"
          class="btn-seal w-full mt-3 !bg-jade"
          @click="materialDetail = null; fruitModalOpen = true"
        >
          Bồi Dưỡng Linh Căn Ngay
        </button>
      </template>
      <template #footer>
        <button class="btn-seal w-full" @click="materialDetail = null">Đóng</button>
      </template>
    </BaseModal>

    <!-- Modal Bồi Dưỡng Linh Căn -->
    <SpiritRootFruitModal :open="fruitModalOpen" @close="fruitModalOpen = false" />

    <!-- 开炉炼丹 -->
    <BaseModal :open="craftOpen" title="Khai Lò Luyện Đan" wide @close="craftOpen = false">
      <p class="mb-2 text-[11px] text-ink-faint tabular">Linh Thảo {{ herbStash }} · Linh Thạch {{ formatGN(resources.spiritStone) }}<!-- 灵草 --></p>
      <p v-if="studyLine" class="mb-2 text-[10px] leading-relaxed text-ink-faint tabular">{{ studyLine }}</p>
      <div v-if="recipes.length" class="space-y-2">
        <div v-for="r in recipes" :key="r.def.id" class="card-ink px-3.5 py-2.5">
          <div class="flex items-start gap-2.5">
            <GameIcon :name="r.def.icon" :size="18" class="mt-px shrink-0" :style="{ color: pillQualityColor(r.def) }" />
            <div class="min-w-0 grow">
              <p class="flex flex-wrap items-baseline gap-x-2">
                <span class="whitespace-nowrap font-kai text-[13px] text-ink">{{ displayPillName(r.def.name) }}</span>
                <span class="whitespace-nowrap text-[10px] text-ink-faint">Bậc {{ r.able.rank }}</span>
                <span v-if="r.able.overReach > 0" class="whitespace-nowrap text-[10px] text-cinnabar">Vượt bậc {{ r.able.overReach }}</span>
                <span v-if="r.plan.rounds > 0" class="whitespace-nowrap text-[10px] text-jade">Hiện có thể luyện {{ r.plan.rounds }} lò</span>
              </p>
              <p class="text-[11px] text-ink-faint tabular">{{ displayQualityName(HERB_GRADE_SHORT[r.cost.grade]) }} Linh Thảo × {{ r.cost.herb }} · Linh Thạch {{ formatGN(r.cost.stone) }}<!-- 灵草 --></p>
              <p class="text-[10px] leading-relaxed text-azure">{{ displayPillFuncText(pillFuncText(r.def)) }}</p>
              <p v-for="w in r.able.weakness" :key="w" class="mt-0.5 text-[10px] text-ink-faint">· {{ displayCraftWeakness(w) }}</p>
            </div>
          </div>
          <div class="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
            <p class="whitespace-nowrap text-[10px] text-ink-faint">
              Nắm chắc
              <span class="tabular text-[13px]" :class="rateClass(craftGuarantee > 0 ? 1 : r.able.successRate)">{{ formatPercent(craftGuarantee > 0 ? 1 : r.able.successRate) }}</span>
              <span v-if="craftGuarantee > 0" class="ml-1 tabular text-gold-ink" title="Dục Hỏa Đan Tâm: Mấy lò đầu bản thế ắt thành, mở 1 lò hao 1 lần định mức">· Bản thế tất thành ×{{ craftGuarantee }}</span>
              <span v-if="r.able.bonusChanceWithYield > 0" class="ml-1 tabular text-jade">· Song Đan {{ formatPercent(r.able.bonusChanceWithYield) }}</span>
            </p>
            <div class="ml-auto flex shrink-0 gap-1.5">
              <template v-if="r.plan.rounds > 0">
                <template v-if="pillFullId !== r.def.id">
                  <button class="btn-ghost !px-3 !py-2 !text-[11px]" @click="craftPillBatch(r.def.id, 5)">Luyện ×5</button>
                  <button
                    v-if="r.plan.rounds > 5"
                    class="btn-ghost !px-2.5 !py-2 !text-[11px]"
                    @click="pillFullId = r.def.id"
                  >
                    Luyện Hết ×{{ r.plan.rounds }}
                  </button>
                  <button class="btn-seal !px-3 !py-2 !text-[12px]" @click="craftPill(r.def.id)">Luyện</button>
                </template>
                <template v-else>
                  <button class="btn-ghost !px-2.5 !py-2 !text-[11px]" @click="pillFullId = null">Nghĩ lại</button>
                  <button class="btn-seal !px-2.5 !py-2 !text-[11px]" @click="runCraftFull(r.def.id, r.plan.rounds)">
                    Khai Lò ×{{ r.plan.rounds }}
                  </button>
                </template>
              </template>
              <span v-else class="whitespace-nowrap text-[10px] text-cinnabar">{{ r.plan.blocked }}</span>
            </div>
          </div>
          <p
            v-if="pillFullId === r.def.id"
            class="mt-1.5 text-[9px] leading-relaxed text-cinnabar"
          >
            Khai {{ r.plan.rounds }} lò, tiêu hao khoảng {{ displayQualityName(HERB_GRADE_SHORT[r.cost.grade]) }} Linh Thảo × {{ r.plan.herb }} · Linh Thạch {{ formatGN(r.plan.stone) }}<!-- 灵草 -->;
            Nổ lò dựa vào kỹ nghệ giữ lại tàn liệu, có thể luyện thêm vài lò — Vẫn tiếp tục?
          </p>
        </div>
      </div>
      <p v-else class="px-1 py-6 text-center text-[11px] leading-relaxed text-ink-faint">
        Ngươi chưa biết bất kỳ đan phương nào.
        <br />
        <span class="text-[10px]">Hái nhiều, xem nhiều, hỏi nhiều, phương thuốc ắt sẽ tìm đến</span>
      </p>
      <div v-if="skillRows.length" class="mt-3 rounded-md bg-paper-deep/60 px-3 py-2">
        <p class="text-[10px] text-ink-faint">Kỹ Nghệ (theo Đạo, làm nhiều tất tinh thông)</p>
        <div class="mt-1 space-y-1">
          <p v-for="s in skillRows" :key="s.id" class="flex flex-wrap items-baseline gap-x-2 text-[11px]">
            <span class="w-14 shrink-0 text-ink-faint">{{ s.daoName }}</span>
            <span class="w-12 shrink-0 font-kai text-ink-soft">{{ s.name }}</span>
            <span class="w-12 shrink-0" :class="s.rawStage === '生疏' ? 'text-ink-faint' : 'text-jade'">{{ s.stage }}</span>
            <span class="min-w-[9em] flex-1 text-[10px] leading-relaxed text-ink-faint">{{ s.desc }}</span>
          </p>
        </div>
      </div>
      <template #footer>
        <button class="btn-seal w-full" @click="craftOpen = false">Thu Lò</button>
      </template>
    </BaseModal>

    <!-- 部位候选列表 -->
    <BaseModal :open="pickerSlot !== null" :title="pickerSlot ? displayEquipSlot(EQUIP_SLOT_NAMES[pickerSlot]) : ''" @close="pickerSlot = null">
      <div v-if="pickerRows.length" class="space-y-1.5">
        <div
          v-for="row in pickerRows"
          :key="row.item.uid"
          class="flex items-center gap-2.5 rounded-md px-2.5 py-2"
          :class="row.equipped ? 'bg-jade/10' : 'bg-paper-deep/70'"
        >
          <GameIcon :name="row.template.icon" :size="16" :style="{ color: qualityDef(row.item.quality).color }" />
          <button class="min-w-0 grow text-left active:opacity-60" @click="openDetail(row.item.uid)">
            <span class="block truncate font-kai text-[13px]" :style="{ color: qualityDef(row.item.quality).color }">
              {{ displayEquipName(row.template.name) }}
              <template v-if="row.item.level > 0">+{{ row.item.level }}</template>
            </span>
            <span class="block text-[10px] text-ink-faint">
              {{ qualityDef(row.item.quality).name }} · Bậc {{ row.item.tier }} · Dòng
              {{ row.item.affixes.length }}/{{ qualityDef(row.item.quality).affixes[1] }}
            </span>
          </button>
          <button v-if="row.equipped" class="btn-ghost shrink-0 !px-2.5 !py-2 !text-[11px]" @click="unequipSlot()">Tháo</button>
          <button v-else class="btn-seal shrink-0 !px-2.5 !py-2 !text-[11px]" @click="equipItem(row.item.uid)">Mặc</button>
        </div>
      </div>
      <p v-else class="py-6 text-center">
        <span class="empty-seal" aria-hidden="true">Trống</span>
        <span class="mt-2.5 block font-kai text-[12px] tracking-[0.2em] text-ink-soft">Vị trí này chưa có tàng phẩm</span>
        <span class="mt-1 block text-[10px] leading-relaxed text-ink-faint">Hãy đi lịch luyện tìm kiếm cơ duyên</span>
      </p>
      <p class="mt-2 text-center text-[10px] text-ink-faint">Chạm vào tên để xem chi tiết và so sánh</p>
    </BaseModal>

    <!-- 一键分解:勾选品质(记忆勾选) -->
    <BaseModal :open="decomposeOpen" title="Phân Giải Nhanh (Thủ Công)" @close="decomposeOpen = false">
      <p class="text-[11px] leading-relaxed text-ink-faint">
        Tích chọn phẩm giai muốn phân giải, chỉ tác động tới đồ
        <span class="text-ink-soft">hiện có trong túi</span>;
        trang bị đang mặc hoặc đã khóa sẽ không bị ảnh hưởng. Lựa chọn này được lưu lại cho lần sau, nhưng chỉ có hiệu lực khi
        <span class="text-ink-soft">nhấn "Phân Giải" bên dưới</span>
        — trang bị rơi trong lúc lịch luyện không thuộc phạm vi này, việc giữ hay bỏ do quy tắc "Thu Gom Thông Minh" quyết định.
      </p>
      <div class="mt-2 space-y-1">
        <label
          v-for="row in decomposeRows"
          :key="row.rank"
          class="flex items-center gap-2.5 rounded-md px-2.5 py-1.5"
          :class="settings.decomposeRanks.includes(row.rank) ? 'bg-paper-deep/80' : ''"
        >
          <input
            type="checkbox"
            class="h-4 w-4 accent-cinnabar"
            :checked="settings.decomposeRanks.includes(row.rank)"
            @change="toggleRank(row.rank)"
          />
          <span class="font-kai text-[13px]" :style="{ color: row.color }">{{ displayQualityName(row.name) }}</span>
          <span class="ml-auto tabular text-[11px] text-ink-faint">
            Hiện có {{ row.count }} món
            <template v-if="row.count > 0">· {{ row.text }}</template>
          </span>
        </label>
      </div>
      <p v-if="decomposeTotal > 0" class="mt-2 text-right text-[11px] text-cinnabar tabular">
        Tổng cộng {{ decomposeTotal }} món, vào lò có thể thu được {{ batchYieldText(decomposePlanned) }}
      </p>
      <template #footer>
        <button class="btn-seal w-full" :disabled="decomposeTotal === 0" @click="confirmDecompose">
          Phân Giải{{ decomposeTotal > 0 ? ` (${decomposeTotal} món)` : '' }}
        </button>
      </template>
    </BaseModal>

    <!-- 智能收纳:独立的自动取舍策略 -->
    <BaseModal :open="smartOpen" title="Thu Gom Thông Minh (Tự Động)" @close="smartOpen = false">
      <p class="text-[11px] leading-relaxed text-ink-faint">
        Sau khi bật, vật phẩm mới rơi ra trước khi vào túi sẽ qua một ải kiểm tra: Món đáng giữ thì giữ lại, món vô duyên hóa thành tro bụi; khi túi đồ đầy và có vật cũ vô duyên, bảo vật mới đến sẽ thế chỗ món yếu nhất trong túi, nếu không có món nào thế chỗ thì cũng hóa bụi.
      </p>
      <!-- 状态一眼 -->
      <div
        class="mt-2.5 rounded-md px-3 py-2 text-[10px] leading-relaxed"
        :class="settings.smartKeep.enabled ? 'bg-jade/8 text-jade' : 'bg-ink/4 text-ink-faint'"
      >
        {{ smartStatusLine }}
      </div>

      <!-- 规则 · 门槛 -->
      <p class="mb-1 mt-3 font-kai text-[11px] tracking-wider text-ink-soft">Quy Tắc · Ngưỡng Giữ</p>
      <div class="rounded-md border border-ink/8 bg-paper-deep/40 px-2.5 py-1">
        <label class="flex items-center justify-between py-1.5">
          <span class="text-[13px] text-ink-soft">Kích hoạt thu gom thông minh</span>
          <input v-model="settings.smartKeep.enabled" type="checkbox" class="h-4 w-4 accent-cinnabar" />
        </label>
        <div class="border-t border-ink/6 py-1.5">
          <p class="mb-1.5 text-[12px] text-ink-soft">Đường phẩm giai · Trân tàng từ「{{ KEEP_QUALITY_CHOICES.find(q => q.rank === settings.smartKeep.minQuality)?.name ?? 'Linh Phẩm' }}」trở lên</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="q in KEEP_QUALITY_CHOICES"
              :key="q.rank"
              class="chip-ink !py-2 text-[10px]"
              :class="settings.smartKeep.minQuality === q.rank ? 'border-cinnabar text-cinnabar' : 'border-ink/25 text-ink-faint'"
              @click="settings.smartKeep.minQuality = q.rank"
            >
              {{ q.name }}
            </button>
          </div>
        </div>
        <div class="border-t border-ink/6 py-1.5">
          <p class="mb-1.5 text-[12px] text-ink-soft">
            Đường cấp bậc ·
            {{ settings.smartKeep.keepMinTier > 0 ? `Từ bậc ${settings.smartKeep.keepMinTier} trở lên, đạt cả 2 đường mới giữ` : 'Không đặt (chỉ xét phẩm giai và nhận diện bảo vật)' }}
          </p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="t in KEEP_TIER_CHOICES"
              :key="t"
              class="chip-ink !py-2 text-[10px]"
              :class="settings.smartKeep.keepMinTier === t ? 'border-cinnabar text-cinnabar' : 'border-ink/25 text-ink-faint'"
              @click="settings.smartKeep.keepMinTier = t"
            >
              {{ t === 0 ? 'Không đặt' : `Bậc ${t}` }}
            </button>
          </div>
        </div>
      </div>

      <!-- 识宝 · 品质之外的值得 -->
      <p class="mb-1 mt-3 font-kai text-[11px] tracking-wider text-ink-soft">Nhận Diện Bảo Vật · Đáng Giá Ngoài Phẩm Giai</p>
      <div class="rounded-md border border-ink/8 bg-paper-deep/40 px-2.5 py-1">
        <label class="flex items-center justify-between py-1.5">
          <span class="text-[12px] text-ink-soft">Dòng thuộc tính cốt lõi của lưu phái chủ đạo</span>
          <input v-model="settings.smartKeep.keepCoreAffix" type="checkbox" class="h-4 w-4 accent-cinnabar" />
        </label>
        <label class="flex items-center justify-between py-1.5">
          <span class="text-[12px] text-ink-soft">Mảnh kỹ năng phối hợp (Dòng thuộc tính hệ phụ)</span>
          <input v-model="settings.smartKeep.keepComboPiece" type="checkbox" class="h-4 w-4 accent-cinnabar" />
        </label>
        <label class="flex items-center justify-between py-1.5">
          <span class="text-[12px] text-ink-soft">Món trang bị cộng hưởng theo bộ (Ưu tiên cơ chế)</span>
          <input v-model="settings.smartKeep.keepSetPiece" type="checkbox" class="h-4 w-4 accent-cinnabar" />
        </label>
        <label class="flex items-center justify-between py-1.5">
          <span class="text-[12px] text-ink-soft">Món có dòng thuộc tính gần đạt cực phẩm</span>
          <input v-model="settings.smartKeep.keepPerfectRolls" type="checkbox" class="h-4 w-4 accent-cinnabar" />
        </label>
      </div>
      <p class="mt-1.5 text-[10px] leading-relaxed text-ink-faint">
        Trang bị đã cường hóa, đúc lại, chuyển dòng hoặc niêm phong sẽ không bị tác động.
      </p>

      <!-- 划界 · 与「一键分解」互不读钩 -->
      <p class="mb-1 mt-3 font-kai text-[11px] tracking-wider text-ink-soft">Tách bạch với "Phân Giải Nhanh"</p>
      <p class="text-[10px] leading-relaxed text-ink-faint">
        "Phân Giải Nhanh" chỉ xử lý đồ hiện có trong túi và cần ngươi tự tay làm; ở đây chỉ quyết định giữ hay bỏ sau khi rơi đồ —
        hai việc này hoàn toàn độc lập, chỉnh bên này không ảnh hưởng bên kia.
      </p>
      <template #footer>
        <template v-if="!cleanConfirm">
          <button
            class="btn-ghost w-full !text-[12px]"
            :class="cleanCount ? '' : 'opacity-45'"
            :disabled="cleanCount === 0"
            @click="cleanConfirm = true"
          >
            Theo quy tắc này dọn túi{{ cleanCount ? ` (Vật vô duyên hóa bụi · ${cleanCount} món)` : ' (Đã không còn vật nào có thể dọn)' }}
          </button>
        </template>
        <template v-else>
          <p class="mb-1 text-center text-[11px] text-cinnabar tabular">
            Sắp hóa bụi {{ cleanCount }} món, vào lò có thể nhận {{ batchYieldText(cleanYield) }} — Hành động này không thể hoàn tác
          </p>
          <div class="mb-2 max-h-36 overflow-y-auto rounded-md border border-ink/8 bg-paper-deep/40 px-2.5 py-1.5">
            <p
              v-for="t in cleanPreview.slice(0, SWEEP_PREVIEW_LIMIT)"
              :key="t.item.uid"
              class="flex items-baseline justify-between gap-2 py-1 text-[10px]"
            >
              <span class="min-w-0 truncate font-kai" :style="{ color: qualityDef(t.item.quality).color }">
                {{ equipmentTemplate(t.item.templateId)?.name ?? 'Cũ vật' }}
              </span>
              <span class="shrink-0 text-ink-faint tabular">Bậc {{ t.item.tier }} · {{ t.reason }}</span>
            </p>
            <p v-if="cleanPreview.length > SWEEP_PREVIEW_LIMIT" class="mt-0.5 border-t border-ink/6 pt-0.5 text-[9px] text-ink-faint">
              … Còn {{ cleanPreview.length - SWEEP_PREVIEW_LIMIT }} món khác lược bớt
            </p>
            <p v-if="!cleanPreview.length" class="py-0.5 text-[10px] text-jade">Theo tiêu chuẩn này, trong túi không còn món nào có thể dọn</p>
          </div>
          <p v-if="bagFull && cleanPreview.length" class="mb-2 text-[9px] leading-relaxed text-ink-faint">
            Túi đồ đã đầy — Nếu không có gì bất ngờ, bảo vật mới kế tiếp sẽ thế chỗ món đứng đầu bảng「{{ firstSweepName }}」.
          </p>
          <div class="flex gap-2">
            <button class="btn-ghost flex-1 !text-[12px]" @click="cleanConfirm = false">Nghĩ lại</button>
            <button class="btn-seal flex-1 !text-[12px]" @click="smartClean()">Dọn Dẹp Hóa Bụi</button>
          </div>
        </template>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import SpiritRootFruitModal from '@/components/character/SpiritRootFruitModal.vue'
  import { useInventoryStore } from '@/stores/inventory'
  import { useResourcesStore } from '@/stores/resources'
  import { usePlayerStore } from '@/stores/player'
  import { useUiStore } from '@/stores/ui'
  import { useSettingsStore } from '@/stores/settings'
  import { qualityDef, QUALITIES } from '@/data/qualities'
  import { pillDef, pillQualityColor, pillQualityName, pillRank } from '@/data/pills'
  import { HERB_GRADE_SHORT, herbGradeOfMajor, type HerbGrade } from '@/data/herbGrades'
  import { herbStashText } from '@/ui/herbText'
  import { pillFuncText } from '@/ui/itemText'
  import {
    artifactActiveText,
    artifactDef,
    artifactLevelLabel,
    artifactNextLevelGain,
    artifactValue,
    ARTIFACT_LEVEL_BONUS,
    ARTIFACT_MAX_LEVEL,
    ARTIFACT_MAX_SLOTS,
    ARTIFACT_SLOT_UNLOCK_MAJOR,
    artifactSlotsFor
  } from '@/data/artifacts'
  import { REALMS } from '@/data/realms'
  import { EQUIP_SLOT_NAMES, EQUIP_SLOTS, MAX_EQUIP_TIER, equipmentTemplate } from '@/data/equipment'
  import { BAG_CAPACITY } from '@/data/constants'
  import { usePill, usePillBatch, availableRecipes, craftBatchPlan, craftPill, craftPillBatch, pillCraftCost } from '@/core/pillService'
  import { craftability, type Craftability } from '@/core/craftability'
  import { craftGuaranteeRemaining } from '@/core/heritageEffects'
  import {
    batchYieldText,
    type DecomposeBatch,
    decomposeBatch,
    decomposeByRanks,
    decomposePreview,
    artifactUpCost,
    artifactBatchPlan,
    upgradeArtifact,
    upgradeArtifactBatch
  } from '@/core/forge'
  import { sweepTargets } from '@/core/smartKeep'
  import { salvageOf } from '@/core/salvage'
  import { add, gnZero } from '@/utils/gnum'
  import { equipSetDef, setCounts, type EquipSetDef } from '@/core/equipSet'
  import { bestEquipFor, equipAllBest, equipSetCombo, equipSetPreview, unequipAllEquipped } from '@/core/equipBest'
  import { useLoreStore } from '@/stores/lore'
  import { studyEta } from '@/core/loreService'
  import { DAO_NAMES, SKILLS, skillStageName } from '@/data/crafting'
  import { cnNumber, formatDuration, formatGN, formatNum, formatPercent } from '@/utils/format'
  import { tint } from '@/utils/colorToken'
  import { STAT_NAMES, statCaveat, statModPhrase } from '@/ui/statNames'
  import {
    artifactSlotReplacedToast,
    decomposeEmptyToast,
    smartCleanToast
  } from '@/ui/inventoryText'
  import type { EquipSlot, GNum, PillDef } from '@/types'
  import SectionTitle from '@/components/common/SectionTitle.vue'
  import InkTabs from '@/components/common/InkTabs.vue'
  import GameIcon from '@/components/common/GameIcon.vue'
  import QualityTag from '@/components/common/QualityTag.vue'
  import BaseModal from '@/components/common/BaseModal.vue'
  import EquipmentCard from '@/components/equipment/EquipmentCard.vue'
  import {
    displayEquipName,
    displayEquipSlot,
    displayEquipSetName,
    displayEquipSetDesc,
    displayPillName,
    displayPillDesc,
    displayPillFuncText,
    displayCraftWeakness,
    displayQualityName,
    displayArtifactName,
    displayArtifactDesc,
    displayArtifactActiveName,
    displayArtifactActiveDesc,
    displayArtifactLevelLabel,
    displayArtifactPassive
  } from '@/ui/displayZhVi'

  const inventory = useInventoryStore()
  const resources = useResourcesStore()
  const player = usePlayerStore()
  // 浴火丹心(宿命传承):本世前几炉必成 —— 把握栏须如实反映(craftPill 真开炉强成 100%)
  const craftGuarantee = computed(() =>
    craftGuaranteeRemaining(player.reincarnation.heritage, player.reincarnation.heritageUses)
  )
  const ui = useUiStore()
  const settings = useSettingsStore()
  const lore = useLoreStore()

  type Tab = 'equip' | 'pill' | 'material' | 'artifact'
  const tab = ref<Tab>('equip')

  // 修行志的「去办」会用 ?tab=pill 这类深链进来;只在合法签里挑,乱掷的忽略
  const route = useRoute()
  const TAB_IDS: Tab[] = ['equip', 'pill', 'material', 'artifact']
  const deepTab = route.query.tab as Tab | undefined
  if (deepTab && (TAB_IDS as string[]).includes(deepTab)) tab.value = deepTab

  const TABS: { id: Tab; label: string }[] = [
    { id: 'equip', label: 'Trang Bị' },
    { id: 'pill', label: 'Đan Dược' },
    { id: 'material', label: 'Vật Liệu' },
    { id: 'artifact', label: 'Pháp Bảo' }
  ]

  // ---- 装备:部位槽 + 部位候选列表 ----
  const SLOTS = EQUIP_SLOTS
  const pickerSlot = ref<EquipSlot | null>(null)

  /** 装备共鸣:已装备件里的同组计数(未满也列出来,让玩家知道差几件) */
  const setRows = computed(() => {
    const counts = setCounts(inventory.equippedItems)
    return [...counts.entries()]
      .map(([id, count]) => {
        const def = equipSetDef(id)
        if (!def) return null
        // 干跑:这套现在会换几件(与穿齐同一份取舍),按钮先报数
        return { def, count, active: count >= def.required, preview: equipSetPreview(id) }
      })
      .filter((row): row is { def: EquipSetDef; count: number; active: boolean; preview: number } => row !== null)
      .sort((a, b) => Number(b.active) - Number(a.active) || b.count - a.count)
  })

  /** 已佩戴的槽位数 —— 「空一身」按钮的计数(身上没件时不出现,免得摆个 0 的按钮) */
  const equippedCount = computed(() => SLOTS.filter(slot => inventory.equipped[slot]).length)
  /** 至少一个槽位有更强候补时,槽卡下方的图例才值得出现 */
  const hasUpgradeableSlot = computed(() => slotRows.value.some(r => r.upgradeable))

  const slotRows = computed(() =>
    SLOTS.map(slot => {
      const uid = inventory.equipped[slot]
      const item = uid ? inventory.findItem(uid) : undefined
      // 「行囊里还有更强的」—— 与一键换装同一把 bestEquipFor,槽卡不该比它看得少
      const best = bestEquipFor(slot)
      return {
        slot,
        name: EQUIP_SLOT_NAMES[slot],
        item,
        template: item ? equipmentTemplate(item.templateId) : undefined,
        stock: inventory.bagItems.filter(it => equipmentTemplate(it.templateId)?.slot === slot).length,
        upgradeable: !!best && best.uid !== uid
      }
    })
  )

  /** 全部藏品(含佩戴中),佩戴中的置顶,其余按品质/层级降序 */
  const allItems = computed(() =>
    inventory.items
      .map(item => ({ item, equipped: inventory.equippedUids.has(item.uid) }))
      .sort((a, b) => {
        if (a.equipped !== b.equipped) return Number(b.equipped) - Number(a.equipped)
        const dq = qualityDef(b.item.quality).rank - qualityDef(a.item.quality).rank
        return dq !== 0 ? dq : b.item.tier - a.item.tier
      })
  )

  /** 当前部位的候选:佩戴中的置顶,其余按品质/层级降序 */
  const pickerRows = computed(() => {
    const slot = pickerSlot.value
    if (!slot) return []
    const equippedUid = inventory.equipped[slot]
    return inventory.items
      .map(item => ({ item, template: equipmentTemplate(item.templateId)! }))
      .filter(row => row.template?.slot === slot)
      .map(row => ({ ...row, equipped: row.item.uid === equippedUid }))
      .sort((a, b) => {
        if (a.equipped !== b.equipped) return Number(b.equipped) - Number(a.equipped)
        const dq = qualityDef(b.item.quality).rank - qualityDef(a.item.quality).rank
        return dq !== 0 ? dq : b.item.tier - a.item.tier
      })
  })

  function equipItem(uid: string): void {
    if (pickerSlot.value) inventory.equip(uid, pickerSlot.value)
  }

  function unequipSlot(): void {
    if (pickerSlot.value) inventory.unequip(pickerSlot.value)
  }

  function openDetail(uid: string): void {
    ui.equipDetailUid = uid
  }

  const pillRows = computed(() =>
    Object.entries(inventory.pills)
      .map(([id, count]) => ({ def: pillDef(id), count }))
      .filter(x => x.def !== undefined && x.count > 0)
      .sort((a, b) => pillRank(b.def!) - pillRank(a.def!))
  )

  const recipes = computed(() =>
    availableRecipes()
      .map(id => ({
        def: pillDef(id),
        cost: pillCraftCost(id),
        able: craftability(id),
        plan: craftBatchPlan(id)
      }))
      .filter(
        (x): x is { def: PillDef; cost: { herb: number; stone: GNum; grade: HerbGrade }; able: Craftability; plan: ReturnType<typeof craftBatchPlan> } =>
          x.def !== undefined && x.cost !== null && x.able !== null
      )
      // 现在能开炉的置顶,其余再按阶位 —— 进弹窗一眼看见此刻哪味立刻可炼
      .sort((a, b) => {
        const ca = a.plan.rounds > 0 ? 1 : 0
        const cb = b.plan.rounds > 0 ? 1 : 0
        return cb - ca || a.able.rank - b.able.rank
      })
  )
  // 闲置在「装备」页时,有一味现在能开炉就该在「丹药」签上亮圆点(与结算同源,不必进页)
  const tabs = computed<readonly { id: Tab; label: string; dot?: boolean }[]>(() =>
    TABS.map(t => (t.id === 'pill' ? { ...t, dot: recipes.value.some(r => r.plan.rounds > 0) } : t))
  )
  /** 「炼满」二步确认态:谁不按常量的炉数,一眼先交代总账 */
  const pillFullId = ref<string | null>(null)
  function runCraftFull(id: string, rounds: number): void {
    pillFullId.value = null
    craftPillBatch(id, rounds)
  }

  const DAO_NAME_VI: Record<string, string> = {
    '识材道': 'Thức Tài Đạo',
    '炼丹道': 'Luyện Đan Đạo',
    '灵火道': 'Linh Hỏa Đạo',
    '炼器道': 'Luyện Khí Đạo'
  }

  const SKILL_NAME_VI: Record<string, string> = {
    '识材': 'Thức Tài',
    '辨药': 'Biện Dược',
    '配伍': 'Phối Ngũ',
    '凝丹': 'Ngưng Đan',
    '淬药': 'Thối Dược',
    '养丹': 'Dưỡng Đan',
    '控火': 'Khống Hỏa',
    '锻打': 'Đoán Đả',
    '铭纹': 'Minh Văn'
  }

  const SKILL_STAGE_VI: Record<string, string> = {
    '大成': 'Đại Thành',
    '通玄': 'Thông Huyền',
    '精通': 'Tinh Thông',
    '娴熟': 'Thuần Thục',
    '小成': 'Tiểu Thành',
    '入门': 'Nhập Môn',
    '初识': 'Sơ Tri',
    '生疏': 'Xa Lạ'
  }

  const SKILL_DESC_VI: Record<string, string> = {
    '认出眼前是什么灵材': 'Nhận biết linh tài trước mắt là gì',
    '通晓药性寒热与毒理': 'Hiểu rõ tính hàn nhiệt và độc lý của dược thảo',
    '定君臣佐使,调和相冲药性': 'Định quân thần tá sứ, điều hòa dược tính xung khắc',
    '聚散乱药力为丹形': 'Tụ tán loạn dược lực thành hình đan dược',
    '逼出杂质,提纯药力': 'Bức xuất tạp chất, đề thuần dược lực',
    '温养护持,压住残毒': 'Ôn dưỡng hộ trì, trấn áp tàn độc',
    '引火、控温、护炉': 'Dẫn hỏa, khống nhiệt, hộ lô',
    '千锤定形,逼出材质本性': 'Ngàn búa định hình, bức xuất bản tính tài chất',
    '刻纹引灵,使器通灵': 'Khắc văn dẫn linh, khiến khí cụ thông linh'
  }

  /** 技艺一览:名(DAO_NAMES 的道名 + 技艺名)、境地(skillStageName)、这项技艺管什么 */
  const skillRows = computed(() =>
    SKILLS.map(s => {
      const lv = lore.skillLevel(s.id)
      const stage = skillStageName(lv)
      return {
        id: s.id,
        daoName: DAO_NAME_VI[DAO_NAMES[s.dao]] ?? DAO_NAMES[s.dao],
        name: SKILL_NAME_VI[s.name] ?? s.name,
        rawStage: stage,
        stage: SKILL_STAGE_VI[stage] ?? stage,
        desc: SKILL_DESC_VI[s.desc] ?? s.desc
      }
    })
  )

  /**
   * 把握度配色:七成以上放心开炉,三成以下是在赌。
   * 色名只能用主题里有的 token —— 此前写的 jade-ink / crimson-ink 不存在,
   * 产物里不生成这两条类,高低两档一直没上色(palette.spec 现有判据守着)。
   */
  function rateClass(rate: number): string {
    if (rate >= 0.7) return 'text-jade'
    if (rate >= 0.3) return 'text-gold-ink'
    return 'text-cinnabar'
  }

  /** 当前所在大境界的灵草品阶 —— 炼丹/采药都看它,存量的「主数字」也该读它 */
  const herbGrade = computed(() => herbGradeOfMajor(player.major))

  /** 逐品灵草存量(仅列持有>0,大数走 formatNum) —— 总量展示的真相在细节里,不在一个总和 */
  const herbStash = computed(() => herbStashText(g => resources.herbOf(g), formatNum))

  /** 材料行:灵草的量是「当前品」的可炼数,`full` 留给详情弹窗逐品陈列(其它料本就单标量) */
  const materialRows = computed(() => [
    { icon: 'leaf', name: `${HERB_GRADE_SHORT[herbGrade.value]} Linh Thảo`, desc: 'Căn bản luyện đan (số ô là phẩm cấp hiện tại, xem chi tiết từng phẩm) <!-- 灵草 -->', value: resources.herbOf(herbGrade.value), full: `Từng phẩm: ${herbStash.value}` },
    { icon: 'mountain', name: 'Huyền Thiết', desc: 'Vật liệu kiến thiết và luyện khí', value: resources.ore, full: String(resources.ore) },
    { icon: 'scroll', name: 'Tàn Trang Công Pháp', desc: 'Gom góp tàn trang có thể tham ngộ công pháp', value: resources.page, full: String(resources.page) },
    { icon: 'sparkles', name: 'Khí Linh Trần', desc: 'Bụi linh tính dùng để cường hóa trang bị', value: resources.dust, full: String(resources.dust) },
    { icon: 'book', name: 'Điểm Ngộ Đạo', desc: 'Cần thiết cho tiến tu công pháp và luyện hóa pháp bảo', value: resources.wudao, full: String(resources.wudao) },
    {
      icon: 'sparkles',
      name: 'Linh Căn Quả',
      desc: 'Thiên địa linh quả bồi dưỡng tư chất linh căn. Phàm phẩm +1, Trung phẩm +5, Thượng phẩm +10. Chỉ rơi ở bí cảnh với tỉ lệ thấp.',
      value: resources.fruitCount('mortal') + resources.fruitCount('earth') + resources.fruitCount('heaven'),
      full: `Phàm phẩm: ${formatNum(resources.fruitCount('mortal'))} · Trung phẩm: ${formatNum(resources.fruitCount('earth'))} · Thượng phẩm: ${formatNum(resources.fruitCount('heaven'))}`
    }
  ])

  /** 材料格子:含灵石一并展示,数量走 formatNum 免得格子被长数字撑破 */
  const materialGrid = computed(() => [
    ...materialRows.value.map(m => ({
      key: m.name,
      icon: m.icon,
      name: m.name,
      desc: m.desc,
      color: 'text-ink-soft',
      display: formatNum(m.value),
      full: m.full
    })),
    {
      key: 'Linh Thạch',
      icon: 'gem',
      name: 'Linh Thạch',
      desc: 'Tiền tệ lưu thông trong giới tu hành',
      color: 'text-gold-ink',
      display: formatGN(resources.spiritStone),
      full: formatGN(resources.spiritStone)
    }
  ])

  const materialDetail = ref<string | null>(null)
  const currentMaterial = computed(() => materialGrid.value.find(m => m.key === materialDetail.value) ?? null)

  const pillDetail = ref<string | null>(null)
  const currentPill = computed(() => (pillDetail.value ? (pillRows.value.find(r => r.def?.id === pillDetail.value) ?? null) : null))

  const craftOpen = ref(false)
  const fruitModalOpen = ref(false)

  /** 服用后若已吃完最后一枚,顺手关掉详情——否则弹窗会停在一个不存在的丹药上 */
  function onUsePill(): void {
    const id = pillDetail.value
    if (!id) return
    usePill(id)
    if (!pillRows.value.some(r => r.def?.id === id)) pillDetail.value = null
  }

  /** 批量服丹(连服 ×5):存量够几枚连吃几枚,吃完顺手关详情 */
  function onUsePillBatch(): void {
    const id = pillDetail.value
    if (!id) return
    usePillBatch(id, 5)
    if (!pillRows.value.some(r => r.def?.id === id)) pillDetail.value = null
  }

  const artifactSlots = computed(() => artifactSlotsFor(player.major))
  /** 已祭炼随身的法宝行(槽位按此顺序填充) */
  const equippedRows = computed(() => artifactRows.value.filter(r => r.equipped))
  /** 逐槽映射:第 k 格对应的随身法宝;不足 slots 的补 undefined,画空位 */
  const artifactSlotRows = computed(() =>
    Array.from({ length: artifactSlots.value }, (_, k) => equippedRows.value[k])
  )
  /** 开第二法宝位的那一境的名字 —— 门槛挪动时文案跟着走,不手写「元婴」 */
  const artifactUnlockRealm = computed(() => REALMS[ARTIFACT_SLOT_UNLOCK_MAJOR]?.name ?? '')

  const artifactRows = computed(() =>
    inventory.artifacts
      .map(a => {
        const upCost = artifactUpCost(a.defId)
        return {
          owned: a,
          def: artifactDef(a.defId)!,
          upCost,
          canUp: upCost ? resources.hasSmall('wudao', upCost.wudao) && resources.hasStone(upCost.stone) : false,
          artPlan: artifactBatchPlan(a.defId),
          equipped: inventory.equippedArtifacts.includes(a.defId)
        }
      })
      // 与行囊同一套排法:品质降序 → 祭炼高的在前(此前按入手先后排,越捡越乱)
      .sort(
        (a, b) =>
          qualityDef(b.def.quality).rank - qualityDef(a.def.quality).rank ||
          b.owned.level - a.owned.level ||
          a.def.name.localeCompare(b.def.name)
      )
  )

  function toggleArtifact(defId: string): void {
    const result = inventory.toggleArtifact(defId, artifactSlots.value)
    if (result === 'replaced') ui.toast(artifactSlotReplacedToast(), 'info')
  }

  /** 祭炼连炼的二步确认态;换件/换重自动重算,行与确认自会随之进退 */
  const batchArtConfirm = ref<string | null>(null)
  function runArtifactBatch(defId: string): void {
    batchArtConfirm.value = null
    upgradeArtifactBatch(defId) // 总账那一声与 toast 由服务自己报
  }

  function batchDecompose(): void {
    // 总账那一条由服务自己报(逐件弹提示只会互相顶掉)
    if (decomposeByRanks(settings.decomposeRanks) === 0) ui.toast(decomposeEmptyToast(), 'info')
  }

  /** 一键换装:每槽换上当前最强,报一句换了多少 */
  function onEquipAllBest(): void {
    const changed = equipAllBest()
    ui.toast(changed > 0 ? `Đã tự động thay ${changed} món trang bị mạnh nhất (chọn theo thực lực chiến đấu)` : 'Đã là bộ trang bị mạnh nhất', changed > 0 ? 'success' : 'info')
  }
  /** 点前的预告:还有几个部位会真的换(与 onEquipAllBest 同一把 bestEquipFor 判据) */
  const bestSwapPreview = computed(() => {
    const n = EQUIP_SLOTS.filter(slot => {
      const best = bestEquipFor(slot)
      return !!best && inventory.equipped[slot] !== best.uid
    }).length
    return n > 0 ? ` (Sẽ đổi ${n} món)` : ' (Đã là mạnh nhất)'
  })

  /** 空一身:卸下全部已佩戴,件回到行囊 —— 以便清理/换血(只脱不毁) */
  function onUnequipAll(): void {
    const removed = unequipAllEquipped()
    ui.toast(removed > 0 ? `Đã tháo ${removed} món, toàn bộ trở về túi đồ` : 'Trên người không có trang bị', removed > 0 ? 'success' : 'info')
  }

  /** 一键穿齐套装:换上该套已持有的件,已穿更强的则不换 */
  function onEquipSet(setId: string): void {
    const changed = equipSetCombo(setId)
    ui.toast(changed > 0 ? `Mặc đủ bộ: Đã đổi ${changed} món (món mạnh hơn giữ nguyên)` : 'Bộ này đã mặc đủ, hoặc không có món thích hợp hơn', changed > 0 ? 'success' : 'info')
  }

  // ---- 一键分解弹窗 ----
  const decomposeOpen = ref(false)

  /** 各品质档的现存件数与分解返还(与服务同一套算法:弹窗上写多少就是真给多少) */
  const decomposeRows = computed(() =>
    QUALITIES.map(q => {
      const got = decomposePreview([q.rank])
      return { rank: q.rank, name: q.name, color: q.color, count: got.count, text: batchYieldText(got) }
    })
  )

  const decomposeTotal = computed(() =>
    decomposeRows.value.filter(r => settings.decomposeRanks.includes(r.rank)).reduce((sum, r) => sum + r.count, 0)
  )

  /** 已勾选那几档的总账 */
  const decomposePlanned = computed(() => decomposePreview(settings.decomposeRanks))

  function toggleRank(rank: number): void {
    const adding = !settings.decomposeRanks.includes(rank)
    settings.decomposeRanks = adding
      ? [...settings.decomposeRanks, rank].sort((a, b) => a - b)
      : settings.decomposeRanks.filter(r => r !== rank)
  }

  function confirmDecompose(): void {
    batchDecompose()
    decomposeOpen.value = false
  }

  // ---- 智能收纳 ----
  const smartOpen = ref(false)
  /** 品质自留线:九档全列,自由从任意一档起珍(从前只有灵/玄/地三档可选) */
  const KEEP_QUALITY_CHOICES = QUALITIES.map(q => ({ rank: q.rank, name: q.name }))
  /**
   * 阶级自留线常用档位:0 = 不设;阶是「高阶产出」的近义,越高的窗口只在高阶材料里
   * (见 qualities 的品质窗口),故给一组拉开距离的常用档,而不是 1~N 每档一个;
   * 顶格与 MAX_EQUIP_TIER 同源,游戏阶上限涨了这里自动跟上
   */
  const KEEP_TIER_CHOICES = [0, 8, 12, 16, 20, 24, 28, MAX_EQUIP_TIER]

  /** 清理预告:清单条数上限,超出收拢一行「其余 N 件从略」,别让名单淹没弹窗 */
  const SWEEP_PREVIEW_LIMIT = 6

  /** 依当前所设尺度将化的件(预览与下手用同一份名单,所见即所得) */
  const cleanPreview = computed(() => sweepTargets(inventory.bagItems))
  /** 待清理件数(确认提示用),由名单现算,不再另写一套筛选 */
  const cleanCount = computed(() => cleanPreview.value.length)
  /** 清理入炉收益:只见不化(与「一键分解」的 preview 同口径,纯算) */
  const cleanYield = computed<DecomposeBatch>(() => {
    const total: DecomposeBatch = { count: 0, dust: 0, stone: gnZero() }
    for (const t of cleanPreview.value) {
      const gain = salvageOf(t.item)
      total.count += 1
      total.dust += gain.dust
      total.stone = add(total.stone, gain.stone)
    }
    return total
  })
  /** 行囊是否已满:满时新宝会先顶走榜首那件无缘旧物 */
  const bagFull = computed(() => inventory.bagItems.length >= BAG_CAPACITY)
  /** 榜首件的名字(行囊满时,下一件新物的顶位对象) */
  const firstSweepName = computed(() => {
    const first = cleanPreview.value[0]
    return first ? (equipmentTemplate(first.item.templateId)?.name ?? 'Cũ vật') : ''
  })

  /**
   * 当前策略一句话:门槛 + 识宝命中 + 余者化尘。把六个开关拼成一句人话,
   * 玩家不必心读这页才知道「自动」到底会怎么做。
   */
  const smartStatusLine = computed(() => {
    const sk = settings.smartKeep
    if (!sk.enabled) return 'Chưa kích hoạt — Rơi phẩm vào túi như thường, tạm thời không áp dụng quy tắc này'
    const keepName = KEEP_QUALITY_CHOICES.find(q => q.rank === sk.minQuality)?.name ?? 'Linh Phẩm'
    const tierLine = sk.keepMinTier > 0 ? `; và từ bậc ${sk.keepMinTier} trở lên, đạt cả 2 đường mới giữ` : ''
    const tags = [
      sk.keepCoreAffix && 'Cốt lõi',
      sk.keepComboPiece && 'Phối hợp',
      sk.keepSetPiece && 'Theo bộ',
      sk.keepPerfectRolls && 'Cực phẩm'
    ].filter(Boolean)
    const grace = tags.length ? `; Trang bị mang thuộc tính ${tags.join(' hoặc ')} đều được giữ lại` : ''
    return `${keepName} trở lên toàn bộ trân tàng${tierLine}${grace}; Còn lại vô duyên, rơi xuống liền hóa Khí Linh Trần`
  })

  /** 清理确认态:按一次按钮先落在「再想想/清理化尘」上 */
  const cleanConfirm = ref(false)

  function smartClean(): void {
    cleanConfirm.value = false
    const snapshot = sweepTargets(inventory.bagItems) // 与确认页同源,兜底再取一次
    const got = decomposeBatch(snapshot.map(t => t.item))
    ui.toast(smartCleanToast(got.count, batchYieldText(got)), 'info')
    smartOpen.value = false
  }

  function passiveLines(defId: string, level: number): string[] {
    const def = artifactDef(defId)
    if (!def) return []
    // 与属性汇总(store/inventory)同源:卡片上写多少,身上加的就是多少
    return Object.entries(artifactValue(def, level).passive).map(([k, v]) => statModPhrase(k, v as number))
  }

  /** 神通主体那个数说的是什么(用药名之外的话:威力 / 护盾 / 破解…) */
  const ACTIVE_NOUNS: Record<string, string> = {
    damage: 'uy lực',
    drain: 'uy lực',
    heal: 'hồi phục',
    shield: 'hộ thuẫn',
    weaken: 'suy yếu',
    sunder: 'phá giáp',
    purge: 'giải khống'
  }

  /**
   * 祭炼下一重的账:被动逐项 + 神通主体 + 吸命回补,到顶的标「已至上限」。
   * 已达满重(artifactNextLevelGain 返回 null)时不显示这一行。
   */
  function nextGainText(defId: string, level: number): string {
    const def = artifactDef(defId)
    const gain = def ? artifactNextLevelGain(def, level) : null
    if (!gain) return ''
    const parts = gain.passive.map(p => {
      const caveat = statCaveat(p.key)
      const rawSpan = `${STAT_NAMES[p.key] ?? p.key} ${formatPercent(p.from)} → ${formatPercent(p.to)}${caveat ? ` (${caveat})` : ''}`
      return displayArtifactPassive(rawSpan)
    })
    if (gain.active) {
      const noun = ACTIVE_NOUNS[def!.active.effect.type] ?? 'hiệu quả'
      const alreadyCapped = gain.active.capped && Math.abs(gain.active.to - gain.active.from) < 1e-9
      parts.push(
        alreadyCapped
          ? `Thần thông ${noun} đã đạt giới hạn (${formatPercent(gain.active.to)}), luyện tế chỉ tăng bị động`
          : `Thần thông ${noun} ${formatPercent(gain.active.from)} → ${formatPercent(gain.active.to)}${gain.active.capped ? ' (Đã đạt giới hạn)' : ''}`
      )
    } else {
      parts.push('Thần thông không đổi theo luyện tế')
    }
    if (gain.heal) {
      parts.push(`Hồi phục ${formatPercent(gain.heal.from)} → ${formatPercent(gain.heal.to)}${gain.heal.capped ? ' (Đã đạt giới hạn)' : ''}`)
    }
    return parts.join(' · ')
  }

  /**
   * 丹方读到几分熟 —— 与图鉴的「已得方/通晓」同一份状态(lore.recipeLore)。
   * 无方之丹没有这一行:它本就炼不出来(见 ui/itemText.pillSourceText)。
   */
  function pillMasteryText(id: string): string {
    const def = pillDef(id)
    if (!def?.recipe) return ''
    const m = lore.recipeMastery(id)
    if (m <= 0) return 'Phương này chưa tới tay — hãy tới Tàng Kinh Các tra sách hoặc thỉnh giáo sư trưởng'
    if (m >= 1) return 'Phương này đã thông suốt: Hỏa hầu tiết điểm thuộc nằm lòng'
    return `Phương này đã có, thuần thục ${Math.round(m * 100)}% — Luyện nhiều, nghiên cứu nhiều lần có thể tăng độ thuần thục`
  }

  /**
   * 藏经阁翻检的当刻概况(开炉页顶部一行)。
   * 读数在 core/loreService.studyEta —— 与 studyTick 同一优先序,界面不另算。
   */
  const studyLine = computed(() => {
    const eta = studyEta()
    if (!eta) return ''
    // 读通了又在手的两态;「够得着的都到手」与「正读某张」是两回事,措辞分开
    if (!eta.readingId && !eta.nextIsNew) return 'Tàng Kinh Các đang tra cứu: Các đan phương trong tầm với đều đã có được'
    if (eta.readingId) {
      const name = pillDef(eta.readingId)?.name ?? 'một đan phương'
      return `Tàng Kinh Các đang nghiên cứu「${name}」, khoảng ${formatDuration(eta.nextInSec)} nữa sẽ lĩnh hội`
    }
    return `Tàng Kinh Các đang tra cứu, khoảng ${formatDuration(eta.nextInSec)} nữa sẽ tìm ra đan phương mới`
  })
</script>
