<template>
  <BaseModal ref="modalRef" :open="inst !== undefined" :title="displayEquipName(template?.name ?? '')" top @close="close">
    <!-- 词条转移(议题 #22):同一扇弹窗内切换正文与页脚,不再叠一层 -->
    <AffixTransferPanel v-if="transferOpen && inst" :flow="transfer" @view="viewTarget" />
    <div v-else-if="inst && template && resolved">
      <div class="flex items-center gap-2">
        <QualityTag :quality="inst.quality" />
        <!-- 界域 + 阶位:同一句「23 阶」在人间界与仙界完全不是一回事,故写清是哪一界 -->
        <span class="text-[11px] text-ink-faint">
          {{ displayEquipSlot(EQUIP_SLOT_NAMES[template.slot]) }} · {{ displayWorldName(worldNameOfTier(inst.tier)) }} · Bậc {{ inst.tier }}
        </span>
        <span v-if="inst.level > 0" class="text-[11px] text-gold-ink tabular">+{{ inst.level }}</span>
        <button
          class="-m-1.5 flex min-h-[28px] min-w-[28px] items-center justify-center p-1.5 text-ink-faint active:scale-90"
          :aria-label="inst.locked ? 'Mở khóa' : 'Khóa'"
          @click="toggleLock"
        >
          <GameIcon :name="inst.locked ? 'lock' : 'unlock'" :size="15" />
        </button>
      </div>
      <p class="mt-2 text-[12px] leading-relaxed text-ink-faint">{{ displayEquipDesc(template.desc) }}</p>
      <!-- 装备标记(玩家反馈:同名装备想按不同流派区分) -->
      <div class="mt-2 flex items-center gap-2">
        <input
          v-model="noteDraft"
          :maxlength="4"
          placeholder="Thêm dấu phân biệt lưu phái (≤4 chữ)"
          class="min-w-0 grow rounded-md border border-ink/15 bg-paper-deep/60 px-2 py-1 text-[12px] text-ink outline-none placeholder:text-ink-faint focus:border-azure"
          @change="applyNote"
        />
        <button v-if="noteDraft" class="-my-1 flex min-h-[28px] items-center px-1 py-1 text-[11px] text-ink-faint active:opacity-60" @click="clearNote">Xóa</button>
      </div>
      <!--
        共鸣是机制而非数值,但装备卡片此前一个字都不提:玩家在「要不要换掉这件」时,
        看不到它身上拴着一条会断的机制(见 core/equipSet)。
      -->
      <p v-if="setInfo" class="mt-1.5 text-[11px] leading-relaxed">
        <span class="font-kai" :class="setInfo.active ? 'text-jade' : 'text-violet-ink'">
          Cộng hưởng「{{ displayEquipSetName(setInfo.def.name) }}」{{ setInfo.count }}/{{ setInfo.def.required }}
        </span>
        <span class="ml-1 text-ink-faint">{{ displayEquipSetDesc(setInfo.def.effectDesc) }}</span>
      </p>
      <div class="ink-divider my-3" />
      <p v-if="compareTarget" class="mb-1.5 text-[10px] text-ink-faint tabular">So với đang đeo:「{{ displayEquipName(compareTarget.name) }}」(Xanh tăng Đỏ giảm)</p>
      <!--
        攻防血一格格比,不如先给一个合笔口径 —— 正是「一键换装」照它抽最强的那把尺
        (equippablePower:基础平铺 + 词条战力,与 toast「按真实战力挑」同一口径)。
        它不是面板「战力」,是这套装备的取舍值;分得清,玩家才不会被两个 战力 弄混。
      -->
      <p v-if="powerCompare" class="mb-1.5 flex items-baseline justify-between text-[11px] tabular">
        <span class="text-ink-faint">{{ powerCompareLabel() }}</span>
        <span class="text-ink">
          <span class="text-ink-faint">{{ formatNum(powerCompare.theirs) }}</span>
          <span class="mx-1 text-ink-faint">→</span>
          <span :class="powerCompare.up ? 'text-jade' : 'text-cinnabar'">{{ formatNum(powerCompare.mine) }}</span>
          <span class="ml-1 text-[10px]" :class="powerCompare.up ? 'text-jade' : 'text-cinnabar'">
            ({{ powerCompare.up ? '+' : '' }}{{ Math.round(powerCompare.pct) }}%)
          </span>
        </span>
      </p>
      <div class="space-y-1.5">
        <p v-for="row in flatRows" :key="row.label" class="flex justify-between text-[13px]">
          <span class="text-ink-soft">{{ row.label }}</span>
          <span class="tabular text-ink">
            {{ row.value }}
            <span v-if="row.diff" class="ml-1 text-[11px]" :class="row.up ? 'text-jade' : 'text-cinnabar'">({{ row.diff }})</span>
          </span>
        </p>
        <p v-for="row in fixedModRows" :key="row.label" class="flex justify-between text-[13px]">
          <span class="text-ink-soft">{{ displayStatLabel(row.label) }}</span>
          <span class="tabular text-azure">{{ displayStatValue(row.value) }}</span>
        </p>
      </div>
      <template v-if="resolved.affixLines.length">
        <div class="ink-divider my-3" />
        <!--
          条数上限按品质档 rank + 1 现算(见下方 affixCap,与 qualityDef 同源,
          不手抄「凡品几条 · 神品几条」—— 那一版会和 data/qualities 漂移)。
          这是玩家最该看见的一件事:一件装备的"上限"就在它的品质里,而重铸可以
          重掷条数 —— 只有把它摊在明面上,「要不要为这件洗下去」才算得清。
        -->
        <p class="mb-1.5 flex items-baseline justify-between font-kai text-[12px] tracking-[0.3em] text-ink-faint">
          <span>TỪ ĐIỀU</span>
          <span class="text-[10px] tracking-normal tabular">
            {{ inst.affixes.length }} / {{ affixCap }} dòng
            <span class="ml-1 text-ink-faint">(Giới hạn {{ qualityName }})</span>
          </span>
        </p>
        <!--
          词条一条一行:名目与稀有度在左、效果在右、**数值单独加粗**(见 resolveEquipStats
          的 before/value/after)。一件神品能挂九条,所以这一列要能扫:
          左边一列名目对齐、右边一列数字对齐,行与行之间不夹长度不一的句子。

          分成九行之后,原来「一条一个色块」的排法会把整张卡片压塌 ——
          色块摞起来,装备本身的层次反而看不见。改成整体一块底 + 行间细分隔线,
          稀有度交给左侧那道色边(与名目同色):一眼看得出哪条是撞上的大运,
          又不至于九块颜色抢戏。
        -->
        <ul class="overflow-hidden rounded-md bg-violet-ink/6">
          <li
            v-for="(line, i) in resolved.affixLines"
            :key="line.id"
            class="flex items-center gap-2 py-1.5 pl-2 pr-1.5"
            :class="i > 0 ? 'border-t border-violet-ink/10' : ''"
            :style="{ borderLeft: `2px solid ${AFFIX_RARITY_META[line.rarity].color}` }"
          >
            <span class="shrink-0 font-kai text-[12px]" :style="{ color: AFFIX_RARITY_META[line.rarity].color }">
              「{{ displayAffixName(line.name) }}」
            </span>
            <span class="shrink-0 text-[9px] opacity-80" :style="{ color: AFFIX_RARITY_META[line.rarity].color }">
              {{ displayAffixRarity(AFFIX_RARITY_META[line.rarity].name) }}
            </span>
            <span class="ml-auto min-w-0 text-right text-[11px] leading-snug text-ink-soft">
              {{ displayAffixDescParts(line).before }}<span class="tabular font-medium text-ink">{{ line.value }}</span>{{ displayAffixDescParts(line).after }}
              <!-- 浮动:这条掷到了它自己的几成 —— 封存/重铸的数,藏起来就是瞎赌 -->
              <span class="text-[9px] text-ink-faint" :title="affixRollHint">{{ displayAffixRoll(affixRollText(line.roll)) }}</span>
            </span>
            <button
              v-if="canSealAffix(line.id)"
              class="shrink-0 min-h-[28px] rounded-md px-1.5 py-1 text-[10px] text-azure active:scale-90 active:opacity-60"
              :aria-label="`Phong tồn từ điều ${line.name}`"
              @click="doSealAffix(line.id)"
            >
              Phong tồn
            </button>
            <button
              v-else-if="isAffixSealed(line.id)"
              class="shrink-0 min-h-[28px] rounded-md px-1.5 py-1 text-[10px] text-jade active:scale-90 active:opacity-60"
              :aria-label="`Giải phong từ điều ${line.name}`"
              @click="doUnsealAffix(line.id)"
            >
              <GameIcon name="unlock" :size="12" />
            </button>
          </li>
        </ul>
        <p class="mt-1 text-[10px] leading-relaxed text-ink-faint">
          Sắp xếp theo độ trân quý, viền màu bên trái là phẩm cấp;「dao động」là đạt mấy phần giữa giới hạn trên dưới
        </p>
      </template>
      <template v-if="buildPreview">
        <div class="ink-divider my-3" />
        <p class="flex items-center justify-between text-[12px]">
          <span class="text-ink-faint">Lưu phái sau khi trang bị</span>
          <span class="tabular">
            <template v-if="buildPreview.before">
              <span class="text-ink-soft">{{ buildPreview.before.displayName }} {{ Math.round(buildPreview.before.affinity * 100) }}%</span>
            </template>
            <template v-else><span class="text-ink-faint">Chưa thành lộ</span></template>
            <span class="mx-1 text-ink-faint">→</span>
            <template v-if="buildPreview.after">
              <span
                class="font-kai"
                :class="buildPreview.after.affinity >= (buildPreview.before?.affinity ?? 0) ? 'text-jade' : 'text-cinnabar'"
              >
                {{ buildPreview.after.displayName }} {{ Math.round(buildPreview.after.affinity * 100) }}%
              </span>
            </template>
            <template v-else><span class="text-cinnabar">Lưu phái tan biến</span></template>
          </span>
        </p>
      </template>
      <template v-if="upCost">
        <div class="ink-divider my-3" />
        <p class="flex items-center justify-between text-[12px] text-ink-faint">
          <span>Cường hóa +{{ inst.level + 1 }} / Giới hạn {{ equipLevelCap() }}</span>
          <span class="tabular">Khí Linh Trần × {{ upCost.dust }} · Linh Thạch {{ formatGN(upCost.stone) }}</span>
        </p>
        <p class="mt-1 text-[11px] tabular text-azure">{{ equipNextLevelText(inst.level) }}</p>
        <!--
          连升:逐级成本一次算清(预览与执行共用 upgradeBatchPlan),省掉逐级一按。
          花的是累计总账,按一下不该就此了结 —— 二步确认与分解/散去同款。
          flex-wrap + 文本保底宽:窄屏(320 的弹窗内宽约 280px)说明与双钮放不下同排时,
          说明独占整行、钮换行 —— 否则 flex-1 文本被 shrink-0 钮压成 0 宽竖排。
        -->
        <div v-if="batchPlan.levels > 0" class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-md border border-ink/10 bg-paper-deep/50 px-2.5 py-2">
          <template v-if="batchConfirm !== inst.uid">
            <div class="min-w-[5rem] flex-1">
              <p class="text-[10px] text-ink-faint">
                Liên thăng đến <span class="font-kai text-[12px] text-cinnabar">+{{ inst.level + batchPlan.levels }}</span> cấp
              </p>
              <p class="mt-0.5 text-[9px] text-ink-faint tabular">Tổng: Khí Linh Trần × {{ batchPlan.dust }} · Linh Thạch {{ formatGN(batchPlan.stone) }}</p>
            </div>
            <button class="btn-ghost shrink-0 !px-3 !py-2 !text-[11px]" @click="batchConfirm = inst.uid">Liên Thăng</button>
          </template>
          <template v-else>
            <p class="min-w-[5rem] flex-1 text-[10px] leading-relaxed text-cinnabar">
              Một bước liên thăng {{ batchPlan.levels }} cấp, tiêu hao tổng số tài nguyên trên —— Vẫn muốn?
            </p>
            <button class="btn-ghost shrink-0 !px-2.5 !py-2 !text-[11px]" @click="batchConfirm = null">Suy nghĩ lại</button>
            <button class="btn-seal shrink-0 !px-2.5 !py-2 !text-[11px]" @click="runBatchUpgrade">Liên Thăng</button>
          </template>
        </div>
      </template>
      <p v-if="salvage" class="mt-1 flex items-center justify-between text-[11px] text-ink-faint">
        <span>Thu hồi phân giải{{ inst.level > 0 ? `(${salvageRefundPhrase()})` : '' }}</span>
        <span class="tabular">
          Khí Linh Trần × {{ salvage.dust }}
          <template v-if="!isZero(salvage.stone)"> · Linh Thạch {{ formatGN(salvage.stone) }}</template>
        </span>
      </p>
      <!-- 修士实验室:反事实换装推演(真仙可用) -->
      <template v-if="canWhatIf">
        <div class="ink-divider my-3" />
        <button v-if="!whatIf" class="btn-ghost w-full !py-2 !text-[12px]" @click="runWhatIf">Thiên Cơ Suy Diễn · Nếu đổi trang bị này, cục diện 4 ngày sẽ ra sao?</button>
        <template v-else>
          <p class="mb-1.5 font-kai text-[12px] tracking-[0.3em] text-ink-faint">Thiên Cơ Suy Diễn</p>
          <p class="text-[11px] text-ink-soft tabular">
            Cấu trúc: {{ whatIf.buildBefore?.displayName ?? 'Chưa thành lộ' }}
            <span class="text-ink-faint">→</span>
            {{ whatIf.buildAfter?.displayName ?? 'Lưu phái tan biến' }}
          </p>
          <div class="mt-1 space-y-0.5">
            <p v-for="w in whatIf.worlds" :key="w.name" class="flex justify-between text-[11px]">
              <span class="text-ink-faint">{{ w.name }}</span>
              <span class="tabular">
                <span class="text-ink-faint">{{ w.beforeText }}</span>
                <span class="mx-1 text-ink-faint">→</span>
                <span :class="w.trend === 'up' ? 'text-jade' : w.trend === 'down' ? 'text-cinnabar' : 'text-ink-soft'">
                  {{ w.afterText }}
                </span>
              </span>
            </p>
          </div>
          <p v-if="whatIf.modChanges.length" class="mt-1 text-[10px] text-azure tabular">
            Biến động chính: {{ whatIf.modChanges.map(c => `${c.label} ${c.delta > 0 ? '+' : ''}${Math.round(c.delta * 100)}%`).join(' · ') }}
          </p>
          <p class="mt-0.5 text-[10px] text-ink-faint">Suy diễn chỉ thuật cục diện, không quyết định thay ngươi.</p>
        </template>
      </template>

      <!--
        自动重铸:洗到指定词条即停(玩家反馈,可多选、可给最低值)。
        注意它**不属于**上方的天机推演(修士实验室) —— 那是真仙+未装备才有的
        v-if="canWhatIf" 段;重铸是凡人也在用的功能,若嵌在里面,普通玩家点开
        开关只会变字、词条格子与「开洗」永远不渲染(实测即玩家反馈的「没生效」)。
      -->
      <div v-if="autoOpen && reforgeCostVal" class="mt-3 rounded-md border border-ink/15 bg-paper-deep/50 px-3 py-2">
        <p class="mb-1 text-[11px] text-ink-soft">Nhấn từ điều xem hiệu quả và khoảng dao động, đặt làm mục tiêu trong khung bật lên (trúng bất kỳ dòng nào sẽ dừng · Đã chọn {{ autoTargets.length }}/{{ AUTO_REFORGE_MAX_TARGETS }})</p>
        <!-- 四档品质成组:传世在前、空组不占位 —— 一眼分出「撞大运的目标」与「随手可得」;
             组色用词条自身的品质色(与装备卡片同源),选中的下一颗整颗亮成「你的目标章」 -->
        <div class="max-h-40 space-y-1.5 overflow-y-auto pr-0.5">
          <div v-for="group in rarityGroups" :key="group.rarity">
            <p class="flex items-center gap-1.5 text-[9px] tracking-widest" :style="{ color: AFFIX_RARITY_META[group.rarity].color }">
              <span class="h-px w-3 shrink-0" :style="{ background: AFFIX_RARITY_META[group.rarity].color }"></span>
              {{ AFFIX_RARITY_META[group.rarity].name }} · {{ group.items.length }} dòng
            </p>
            <div class="mt-1 grid grid-cols-3 gap-1">
              <!-- 点词条名即弹框看它的效果与区间;设为目标改在弹框里做(玩家反馈:不要词条表,点哪条看哪条) -->
              <button
                v-for="af in group.items"
                :key="af.id"
                class="min-h-[28px] rounded px-1 py-1 text-[10px] leading-tight"
                :class="isAutoTarget(af.id) ? 'border' : 'bg-ink/4'"
                :style="isAutoTarget(af.id)
                  ? { borderColor: AFFIX_RARITY_META[af.rarity].color, color: AFFIX_RARITY_META[af.rarity].color }
                  : { color: 'var(--color-ink-faint)' }"
                :title="`Xem hiệu quả và khoảng dao động của「${af.name}」`"
                @click="openCodex(af.id)"
              >
                <span v-if="isAutoTarget(af.id)" class="mr-0.5">Chọn </span>{{ af.name }}
              </button>
            </div>
          </div>
        </div>
        <div v-if="autoTargets.length" class="mt-1.5 space-y-0.5">
          <!-- 已选目标回声品质色:它从哪一档领出来,这里就还它本来的颜色 -->
          <p v-for="t in autoTargets" :key="t.affixId" class="flex items-center gap-2 text-[10px]">
            <!-- 点已选词条名:钉开那张词条图,回来看清效果与区间再决定要不要留着这条目标 -->
            <button
              type="button"
              class="flex min-h-[28px] w-10 shrink-0 items-center truncate text-left font-kai"
              :style="{ color: targetColor(t.affixId) }"
              :title="`Xem từ điều: ${affixDef(t.affixId)?.name ?? t.affixId}`"
              @click="openCodex(t.affixId)"
            >
              {{ affixDef(t.affixId)?.name ?? t.affixId }}
            </button>
            <input v-model.number="t.minRoll" type="range" min="0" max="1" step="0.05" class="grow accent-cinnabar" />
            <span class="w-12 shrink-0 text-right tabular text-ink-faint">≥{{ Math.round((t.minRoll ?? 0) * 100) }}%</span>
          </p>
        </div>
        <div class="mt-1.5 flex items-center gap-2">
          <span class="text-[10px] text-ink-faint tabular">Tối đa tẩy</span>
          <input
            v-model.number="autoBudget"
            type="number"
            min="1"
            max="500"
            class="w-16 rounded border border-ink/15 bg-paper/70 px-1 py-0.5 text-[11px] tabular"
          />
          <span class="text-[10px] text-ink-faint tabular">lần · Mỗi lần {{ formatGN(reforgeCostVal.stone) }} trần × {{ reforgeCostVal.dust }}</span>
          <template v-if="!autoArm">
            <button
              class="btn-seal ml-auto !px-3 !py-1.5 !text-[11px]"
              :disabled="!autoTargets.length"
              :title="autoTargets.length ? undefined : 'Hãy nhấn chọn một từ điều muốn tẩy đến'"
              @click="autoArm = true"
            >
              Bắt Đầu Tẩy
            </button>
          </template>
          <template v-else>
            <button
              class="btn-seal ml-auto !px-3 !py-1.5 !text-[11px]"
              @click="runAutoReforge"
            >
              Tẩy? Tối đa Linh thạch {{ autoMaxCost ? formatGN(autoMaxCost.stone) : '0' }} · Trần × {{ autoMaxCost?.dust ?? 0 }}
            </button>
            <button class="btn-ghost !px-2.5 !py-1.5 !text-[11px] text-ink-faint" @click="autoArm = false">Suy nghĩ lại</button>
          </template>
        </div>
      </div>
    </div>
    <template #footer>
      <AffixTransferFooter v-if="transferOpen && inst" :flow="transfer" @back="transferOpen = false" />
      <div v-else class="flex flex-col gap-2">
        <!-- 重铸与封存 (Phase 30.1) -->
        <!--
          空皮先交代去向:一件凡品掷出零条、或全封存的装备,重铸与封存整块会一起消失 ——
          玩家找不到「自动重铸」,只会觉得它没生效。这里把「为什么没有」说破。
          正常玩法封不完整(每件至少留一个可重掷位),词条全封的那一格是给
          旧档/异常数据兜底,别把「一颗词条也无」错安到它有词条的头上。
        -->
        <template v-if="reforgeCostVal || sealCostVal">
          <div class="flex gap-2 text-[11px]">
            <!-- 重铸是装备培养高频动作:!py-1 盒高仅 27px,低于 28px 可点阈值(弹窗内控件,巡页判据按「恰好打开的弹窗」才量得到它)。
                 !py-2 抬到 35px;封存格是静态展示,但同排按钮提高后也跟着对齐,视觉仍是一整行 -->
            <template v-if="reforgeArm !== inst?.uid">
              <button v-if="reforgeCostVal" class="btn-ghost flex-1 !py-2" @click="reforgeArm = inst?.uid ?? null">
                Trọng đúc từ điều
                <span class="ml-1 tabular text-[10px] text-ink-faint">
                  {{ formatGN(reforgeCostVal.stone) }} · Trần × {{ reforgeCostVal.dust }}
                </span>
              </button>
              <div v-if="sealCostVal" class="flex flex-1 items-center justify-center rounded-md border border-azure/20 bg-azure/5 px-2 py-2 text-azure">
                Phong tồn một từ {{ formatGN(sealCostVal) }}
              </div>
            </template>
            <template v-else>
              <button
                class="btn-seal flex-1 !py-2"
                title="Số lượng dòng và trị số cùng trọng đúc, dòng phong tồn không đổi"
                @click="doReforge"
              >
                Đúc lại? {{ formatGN(reforgeCostVal?.stone ?? 0) }} · Trần × {{ reforgeCostVal?.dust ?? 0 }}
              </button>
              <button class="btn-ghost flex-1 !py-2 text-ink-faint" @click="reforgeArm = null">Suy nghĩ lại</button>
            </template>
          </div>
          <!--
            重铸到底做什么,得在按下之前说清:条数与数值一并重掷(封存的不动),
            不限次数、成本只随「阶数」与「封存数」走 —— 与旧版"越洗越贵、上限十次"不同。
          -->
          <p v-if="reforgeCostVal" class="text-center text-[10px] leading-relaxed text-ink-faint">
            Đúc lại các từ điều chưa phong tồn: Số dòng (≤{{ affixCap }} dòng) và trị số cùng đúc lại, dòng phong tồn không đổi · Không giới hạn số lần, chi phí theo bậc và số dòng phong tồn
          </p>
          <p v-if="inst" class="text-center text-[10px] text-ink-faint tabular">
            Đã trọng đúc {{ inst.reforgeCount ?? 0 }} lần · Đã phong tồn {{ (inst.sealedAffixIds ?? []).length }}/{{ sealCapacity(inst) }}
          </p>
          <!-- 自动重铸与词条转移并成一行:页脚不加高(320×568 下正文本就只剩一小截) -->
          <div class="flex gap-2">
            <button v-if="reforgeCostVal" class="btn-ghost flex-1 !py-2 !text-[11px]" @click="autoOpen = !autoOpen">
              {{ autoOpen ? 'Thu lại tự động trọng đúc' : 'Tự động trọng đúc' }}
            </button>
            <button v-if="canTransferOut" class="btn-ghost flex-1 !py-2 !text-[11px]" @click="openTransfer">
              {{ displayTransferLabel(TRANSFER_LABELS.entry) }}
            </button>
          </div>
        </template>
        <template v-else-if="inst">
          <p class="text-center text-[10px] leading-relaxed text-ink-faint">
            {{ inst.affixes.length === 0 ? 'Vật này không có từ điều nào, không thể trọng đúc, cũng không thể phong tồn. Muốn luyện vật này, trước phải khắc văn.' : 'Từ điều đã phong tồn hết, không thể trọng đúc' }}
          </p>
          <!-- 全封存的旧档件也能把词条转出去 -->
          <button v-if="canTransferOut" class="btn-ghost w-full !py-2 !text-[11px]" @click="openTransfer">{{ displayTransferLabel(TRANSFER_LABELS.entry) }}</button>
        </template>
        <div class="flex gap-2">
          <button class="btn-seal flex-1" @click="toggleEquip">{{ isEquipped ? 'Gỡ Xuống' : 'Trang Bị' }}</button>
          <button v-if="upCost" class="btn-ghost flex-1" @click="doUpgrade">Cường Hóa</button>
          <!-- 分解二步确认:一件淬养过的装备(强化/封存/重铸)误触垃圾桶不该直接没 -->
          <template v-if="decomposeArm !== inst?.uid">
            <button
              class="btn-ghost"
              :disabled="isEquipped || inst?.locked"
              :aria-label="decomposeReason"
              :title="decomposeReason"
              @click="decomposeArm = inst?.uid ?? null"
            >
              <GameIcon name="trash" :size="15" />
            </button>
          </template>
          <template v-else>
            <button class="btn-seal !px-2.5 !py-2 !text-[11px]" @click="doDecompose">Phân giải?</button>
            <button class="btn-ghost !px-2.5 !py-2 !text-[11px] text-ink-faint" @click="decomposeArm = null">Thôi</button>
          </template>
        </div>
      </div>
    </template>
  </BaseModal>

  <!-- 词条信息:点哪条弹哪条 —— 名/效果/数值区间/部位/门槛;设目标也在这扇框(顶层弹框盖在详情之上) -->
  <AffixInfoSheet
    :open="codexOpen"
    :affix-id="codexAffixId ?? ''"
    :targetable="true"
    :selected="codexSelected"
    :can-select="codexCanSelect"
    @toggle-target="onCodexToggleTarget"
    @close="codexOpen = false"
  />
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { nextTick, ref, watch } from 'vue'
  import { useUiStore } from '@/stores/ui'
  import { useInventoryStore } from '@/stores/inventory'
  import { equipmentTemplate, EQUIP_SLOT_NAMES } from '@/data/equipment'
  import { equipSetDef, setCounts } from '@/core/equipSet'
  import { worldNameOfTier } from '@/core/formulas'
  import {
    displayEquipName,
    displayEquipSlot,
    displayEquipSetName,
    displayEquipSetDesc,
    displayWorldName,
    displayEquipDesc,
    displayStatLabel,
    displayStatValue,
    displayAffixName,
    displayAffixRarity,
    displayAffixRoll,
    displayAffixDescParts,
    displayTransferLabel
  } from '@/ui/displayZhVi'
  import { resolveEquipStats } from '@/core/equipGen'
  import { equippablePower } from '@/core/equipBest'
  import {
    decomposeEquipment,
    equipLevelCap,
    equipUpgradeCost,
    upgradeEquipment,
    upgradeBatchPlan,
    upgradeEquipmentBatch,
    type UpgradeBatchPlan
  } from '@/core/forge'
  import { salvageOf, salvageRefundPhrase } from '@/core/salvage'
  import { detectBuild } from '@/core/buildDetect'
  import { endgameUnlocked } from '@/core/endgameService'
  import { whatIfEquip, type WhatIfReport } from '@/core/lab'
  import { autoReforge, reforgeEquipment, reforgeCost, sealAffix, sealCapacity, sealCost, unsealAffix, AUTO_REFORGE_MAX_TARGETS, type ReforgeTarget } from '@/core/reforge'
  import { AFFIXES, affixDef, affixFitBlock, affixesByRarity } from '@/data/affixes'
  import { qualityDef } from '@/data/qualities'
  import { usePlayerStore } from '@/stores/player'
  import { formatGN, formatNum } from '@/utils/format'
  import { gnZero, isZero, mulN, sub } from '@/utils/gnum'
  import { playSfx } from '@/core/audio'
  import type { AnyStatKey, GNum } from '@/types'
  import { AFFIX_RARITY_META, STAT_NAMES, statValueText } from '@/ui/statNames'
  import { affixRollHint, affixRollText, equipNextLevelText, powerCompareLabel } from '@/ui/equipText'
  import { TRANSFER_LABELS } from '@/ui/affixTransferText'
  import { useAffixTransfer } from '@/composables/useAffixTransfer'
  import BaseModal from '@/components/common/BaseModal.vue'
  import QualityTag from '@/components/common/QualityTag.vue'
  import AffixInfoSheet from './AffixInfoSheet.vue'
  import GameIcon from '@/components/common/GameIcon.vue'
  import AffixTransferPanel from './AffixTransferPanel.vue'
  import AffixTransferFooter from './AffixTransferFooter.vue'

  const ui = useUiStore()
  const inventory = useInventoryStore()
  const player = usePlayerStore()

  const inst = computed(() => (ui.equipDetailUid ? inventory.findItem(ui.equipDetailUid) : undefined))

  /** 装备标记(玩家反馈:同名装备想按不同流派区分)。草稿随当前件走,空串 = 清除 */
  const noteDraft = ref('')
  watch(
    () => inst.value?.note,
    (n, old) => {
      // 只在来源变化时同步草稿;自己写回(applyNote)引发的同一值回灌不迭代
      if (n === noteDraft.value || n === old) return
      noteDraft.value = n ?? ''
    },
    { immediate: true }
  )

  function applyNote(): void {
    if (!inst.value) return
    const note = noteDraft.value.trim()
    inventory.replaceItem({ ...inst.value, note: note.length > 0 ? note.slice(0, 4) : undefined })
  }

  function clearNote(): void {
    noteDraft.value = ''
    applyNote()
  }
  const template = computed(() => (inst.value ? equipmentTemplate(inst.value.templateId) : undefined))
  const resolved = computed(() => (inst.value ? resolveEquipStats(inst.value) : null))
  const isEquipped = computed(() => (inst.value && template.value ? inventory.equipped[template.value.slot] === inst.value.uid : false))
  /** 分解禁用缘由:禁用不该是猜谜(约定「禁用即给原因」)。佩戴/上锁各明示一条。 */
  const decomposeReason = computed(() => {
    if (isEquipped.value && inst.value) return 'Hãy gỡ món này trước khi phân giải'
    if (inst.value?.locked) return 'Đã khóa: hãy mở khóa trong túi đồ trước khi phân giải'
    return 'Phân giải trang bị này'
  })
  const upCost = computed(() => (inst.value ? equipUpgradeCost(inst.value.uid) : null))
  /** 连升计划:受余额与上限约束,预览与执行同一份(升不动时 levels=0,隐藏整块) */
  const batchPlan = computed<UpgradeBatchPlan>(() =>
    inst.value ? upgradeBatchPlan(inst.value.uid) : { levels: 0, dust: 0, stone: gnZero(), atCap: false }
  )
  /** 连升二步确认态;换件自动复位(见 closeAuto 的 watch) */
  const batchConfirm = ref<string | null>(null)
  /** 分解返还:底材 + 强化投入的八成(练过的件拆了不至于血本无归,先把账摆出来) */
  const salvage = computed(() => (inst.value ? salvageOf(inst.value) : null))

  /**
   * 这件装备所属的共鸣与其当前件数(只数已佩戴的 —— 共鸣看的是挂载,不是行囊)。
   * 未佩戴时也照实显示「1/2」,让玩家在按下装备之前就看得见差几件。
   */
  const setInfo = computed(() => {
    const setId = template.value?.set
    if (!setId) return null
    const def = equipSetDef(setId)
    if (!def) return null
    const count = setCounts(inventory.equippedItems).get(setId) ?? 0
    return { def, count, active: count >= def.required }
  })

  // ---- 重铸与封存 (Phase 30.1) ----
  const reforgeCostVal = computed(() => (inst.value ? reforgeCost(inst.value) : null))
  const sealCostVal = computed(() => (inst.value ? sealCost(inst.value) : null))
  /** 这一件按品质能有多少条词条:上限来自品质表,不在界面里另写一份 */
  const affixCap = computed(() => (inst.value ? qualityDef(inst.value.quality).affixes[1] : 0))
  const qualityName = computed(() => (inst.value ? qualityDef(inst.value.quality).name : ''))

  function isAffixSealed(affixId: string): boolean {
    return (inst.value?.sealedAffixIds ?? []).includes(affixId)
  }

  function canSealAffix(affixId: string): boolean {
    return inst.value !== undefined && sealCostVal.value !== null && !isAffixSealed(affixId)
  }

  /** 词条信息弹框:点哪条就钉哪条(词条表已按反馈移除,这是看词条信息的唯一入口) */
  const codexOpen = ref(false)
  const codexAffixId = ref<string | null>(null)
  function openCodex(affixId: string): void {
    codexAffixId.value = affixId
    codexOpen.value = true
  }

  /** 弹框里这条当前是不是自动重铸目标;目标未满三才有「再设」(满的位子只留给取消) */
  const codexSelected = computed(() => codexAffixId.value !== null && isAutoTarget(codexAffixId.value))
  const codexCanSelect = computed(() => autoTargets.value.length < AUTO_REFORGE_MAX_TARGETS)
  function onCodexToggleTarget(id: string): void {
    toggleAutoTarget(id)
  }

  function doSealAffix(affixId: string): void {
    if (inst.value) sealAffix(inst.value.uid, affixId)
  }

  function doUnsealAffix(affixId: string): void {
    if (inst.value) unsealAffix(inst.value.uid, affixId)
  }

  function doReforge(): void {
    if (inst.value) reforgeEquipment(inst.value.uid)
  }

  // ---- 自动重铸(玩家反馈:一键重铸多次,洗到指定词条就停) ----
  const autoOpen = ref(false)
  const autoBudget = ref(50)
  /** 停止条件:任一命中即停;minRoll 给「数值范围」那一嘴 */
  const autoTargets = ref<ReforgeTarget[]>([])

  /**
   * 可选的停止词条:当前装备**真能洗到**的那些 —— 与重铸抽取池同规则
   * (槽位匹配 + 品质门槛不高于当前),而不是全 113 条里按权重取前 24。
   * 否则连「想洗的词条在 24 名开外」都选不进去,自动重铸就等于承诺了
   * 一份它兑现不了的面板。
   */
  const affixOptions = computed(() => {
    if (!inst.value) return []
    const tpl = equipmentTemplate(inst.value.templateId)
    const q = inst.value && qualityDef(inst.value.quality)
    if (!tpl || !q) return []
    return [...AFFIXES].filter(a => affixFitBlock(a, tpl.slot, q.rank) === null).sort((a, b) => b.weight - a.weight)
  })

  function isAutoTarget(id: string): boolean {
    return autoTargets.value.some(t => t.affixId === id)
  }

  /** 候选按四档品质成组(传世→常见,空组不占位);组内延续 affixOptions 的权重序 */
  const rarityGroups = computed(() => affixesByRarity(affixOptions.value))

  /** 已选目标的名字颜色:它从哪一档领出,就用哪一档的品质色 */
  function targetColor(id: string): string {
    return AFFIX_RARITY_META[affixDef(id)?.rarity ?? 'common'].color
  }

  function toggleAutoTarget(id: string): void {
    if (isAutoTarget(id)) autoTargets.value = autoTargets.value.filter(t => t.affixId !== id)
    // 默认先求「高值」(≥50%);拉到底 0% 即回到「出现就行」
    else if (autoTargets.value.length < AUTO_REFORGE_MAX_TARGETS) autoTargets.value = [...autoTargets.value, { affixId: id, minRoll: 0.5 }]
  }

  function closeAuto(): void {
    autoOpen.value = false
    autoTargets.value = []
  }

  function runAutoReforge(): void {
    if (!inst.value) return
    autoArm.value = false
    const targets = autoTargets.value
    const budget = Math.min(500, Math.max(1, Math.floor(autoBudget.value || 0)))
    const out = autoReforge(inst.value.uid, targets, budget)
    const cost = `Hao phí ${formatGN(out.stone)} · Trần × ${out.dust}`
    // 「没洗到目标」不等于「没洗动」:每次重铸词条都尽数重掷,结账要报清现在这一身落在哪
    const wanted = autoTargets.value.map(t => affixDef(t.affixId)?.name ?? t.affixId).join('、')
    const now = out.affixIds.map(id => affixDef(id)?.name ?? id).join('、') || 'trống'
    if (out.stop === 'target' && out.hit) {
      playSfx('success') // 结账一声:洗到了
      ui.toast(
        `Đã tẩy ra「${affixDef(out.hit.id)?.name ?? out.hit.id}」trị số ${Math.round(out.hit.roll * 100)}% —— Đã tẩy ${out.rolls} lần, ${cost}`,
        'success'
      )
    } else if (out.stop === 'budget') {
      playSfx('warn')
      ui.toast(`Đã dùng hết số lần dự trù: tẩy liên tục ${out.rolls} lần, chưa thể gặp「${wanted}」. Hiện tại là: ${now}, ${cost}`, 'warn')
    } else if (out.stop === 'broke') {
      playSfx('warn')
      if (out.rolls === 0) {
        ui.toast(`Linh thạch hoặc Khí Linh Trần chưa đủ để mở lò luyện này, ${cost}`, 'warn')
      } else {
        ui.toast(`Linh thạch/Khí Linh Trần đã cạn, đã tẩy ${out.rolls} lần rồi dừng; hiện tại là ${now}, ${cost}`, 'warn')
      }
    } else {
      // frozen 是「没得洗」不是「没洗成」,不响;这一档兼两种收法:无位可洗(全封存/无词条),或装备已不在行囊
      const gone = inst.value !== undefined && !inventory.findItem(inst.value.uid)
      ui.toast(gone ? 'Vật này không còn trong túi đồ, không thể trọng đúc' : 'Vật này không còn từ điều chưa phong tồn, không thể trọng đúc', 'info')
    }
    // 结账即收板:结果已写在 toast 与装备词条上,想再调条件重开一次即可
    closeAuto()
  }

  // ---- 修士实验室:反事实换装推演 ----
  const whatIf = ref<WhatIfReport | null>(null)
  const canWhatIf = computed(() => endgameUnlocked() && !isEquipped.value && inst.value !== undefined)

  function runWhatIf(): void {
    if (inst.value) whatIf.value = whatIfEquip(inst.value.uid)
  }

  watch(inst, () => {
    whatIf.value = null
  })

  // ---- 词条转移(议题 #22):本件作源件,挑一条转到另一件上 ----
  const transferOpen = ref(false)
  const transfer = useAffixTransfer(() => (transferOpen.value ? (inst.value?.uid ?? null) : null))
  const canTransferOut = computed(() => (inst.value?.affixes.length ?? 0) > 0)

  function openTransfer(): void {
    closeAuto()
    transferOpen.value = true
  }

  /** 转移面板里点「前往」:退出转移,详情切到那一件 */
  function viewTarget(uid: string): void {
    transferOpen.value = false
    ui.equipDetailUid = uid
  }

  // 换了一件(或关掉)就从头来:转移模式、自动重铸的勾选、分解与连升的二步确认都不该串到下一件上
  watch(
    () => inst.value?.uid,
    () => {
      transferOpen.value = false
      closeAuto()
      decomposeArm.value = null
      batchConfirm.value = null
    }
  )

  // 详情与转移互切、换看另一件:正文整块换了,滚动盒却没重挂 —— 回到顶上,免得开头几行在视口外。
  // 用「多源数组」而不是「返回新数组的 getter」:后者在重铸(只换词条、uid 不变)时也会因
  // 数组引用变化重放回调,把玩家原本停在词条一览的位置顶回顶部 —— 重铸不该动上下位置。
  const modalRef = ref<InstanceType<typeof BaseModal> | null>(null)
  watch(
    [() => transferOpen.value, () => inst.value?.uid],
    () => void nextTick(() => modalRef.value?.scrollToTop())
  )

  /** 换装流派预览:契合度 当前 → 装备后 */
  const buildPreview = computed(() => {
    if (!inst.value || !template.value || isEquipped.value) return null
    const slot = template.value.slot
    const mods = { ...player.finalStats.mods }
    const applyDelta = (source: Record<string, number | undefined>, sign: 1 | -1): void => {
      for (const k in source) {
        const key = k as keyof typeof mods
        mods[key] = (mods[key] ?? 0) + sign * (source[k] ?? 0)
      }
    }
    const currentUid = inventory.equipped[slot]
    if (currentUid) {
      const currentItem = inventory.findItem(currentUid)
      if (currentItem) applyDelta(resolveEquipStats(currentItem).mods, -1)
    }
    applyDelta(resolveEquipStats(inst.value).mods, 1)
    const before = detectBuild(player.finalStats.mods)
    const after = detectBuild(mods)
    if (!before && !after) return null
    return { before, after }
  })

  const flatRows = computed(() => {
    const r = resolved.value
    if (!r) return []
    // 与当前佩戴同部位件对比(自身已佩则不对比)
    const cur = compareTarget.value
    const curFlats = cur ? resolveEquipStats(cur.item).flats : null
    const rows: { label: string; value: string; diff: string; up: boolean }[] = []
    const push = (label: string, mine: GNum, theirs: GNum | null): void => {
      if (isZero(mine) && (theirs === null || isZero(theirs))) return
      let diff = ''
      let up = true
      if (theirs !== null) {
        const d = sub(mine, theirs)
        up = d.m >= 0
        if (!isZero(d)) diff = `${up ? '+' : '-'}${formatGN({ m: Math.abs(d.m), e: d.e })}`
      }
      rows.push({ label, value: `+${formatGN(mine)}`, diff, up })
    }
    push('Công', r.flats.attack, curFlats?.attack ?? null)
    push('Thủ', r.flats.defense, curFlats?.defense ?? null)
    push('Khí Huyết', r.flats.maxHp, curFlats?.maxHp ?? null)
    return rows
  })

  /** 对比对象:同部位当前佩戴件 */
  const compareTarget = computed(() => {
    if (!inst.value || !template.value || isEquipped.value) return null
    const curUid = inventory.equipped[template.value.slot]
    if (!curUid || curUid === inst.value.uid) return null
    const item = inventory.findItem(curUid)
    if (!item) return null
    return { item, name: equipmentTemplate(item.templateId)?.name ?? 'Đang đeo' }
  })

  /**
   * 战斗价值对比 —— 与「一键换装」同一把尺(equippablePower):
   * 基础平铺 + 词条战力,「按真实战力挑」说的就是它。是取舍值,不是面板战力。
   */
  const powerCompare = computed(() => {
    const cur = compareTarget.value
    if (!cur || !inst.value) return null
    const mine = equippablePower(inst.value)
    const theirs = equippablePower(cur.item)
    const pct = theirs > 0 ? ((mine - theirs) / theirs) * 100 : 0
    return { mine, theirs, up: mine >= theirs, pct }
  })

  const fixedModRows = computed(() => {
    const t = template.value
    if (!t?.fixedMods) return []
    return Object.entries(t.fixedMods).map(([k, v]) => ({
      label: STAT_NAMES[k as AnyStatKey] ?? k,
      value: statValueText(k, v as number)
    }))
  })

  function close(): void {
    ui.equipDetailUid = null
  }

  function toggleEquip(): void {
    if (!inst.value || !template.value) return
    if (isEquipped.value) {
      inventory.unequip(template.value.slot)
    } else {
      inventory.equip(inst.value.uid, template.value.slot)
    }
  }

  function doUpgrade(): void {
    if (inst.value) upgradeEquipment(inst.value.uid)
  }

  function runBatchUpgrade(): void {
    if (!inst.value) return
    batchConfirm.value = null
    upgradeEquipmentBatch(inst.value.uid)
  }

  const decomposeArm = ref<string | null>(null)
  // 重铸一次就重掷所有未封存词条(条数+数值),成本不低、可能盖掉好roll —— 与分解同款二步确认
  const reforgeArm = ref<string | null>(null)
  // 自动重铸一键烧到 autoBudget(默认 50,可 500)次 —— 比连炼/炼满还大的批量,同款二步确认 + 先亮至多总花销
  const autoArm = ref(false)
  const autoMaxCost = computed(() => {
    const r = reforgeCostVal.value
    if (!r) return null
    const n = Math.max(0, autoBudget.value || 0)
    return { stone: mulN(r.stone, n), dust: r.dust * n }
  })
  // 改目标/预算后动作不再是同一笔,确认态一并复位
  watch([autoTargets, autoBudget], () => {
    autoArm.value = false
  })

  function doDecompose(): void {
    if (!inst.value) return
    if (decomposeEquipment(inst.value.uid)) {
      decomposeArm.value = null
      close()
    }
  }

  function toggleLock(): void {
    if (!inst.value) return
    inventory.replaceItem({ ...inst.value, locked: !inst.value.locked })
  }
</script>
