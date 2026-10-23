<template>
  <div class="stagger-in space-y-4 px-4 pb-6 pt-4">
    <!-- Thông tin cơ bản: Danh xưng, cảnh giới, tuổi thọ, thế số thường trực ở thanh trên cùng, tại đây không lặp lại -->
    <div class="card-ink px-4 py-4">
      <div class="flex items-center justify-between">
        <button class="-my-1 py-1.5 text-left active:opacity-60" @click="powerOpen = !powerOpen">
          <span class="text-[10px] tracking-[0.3em] text-ink-faint">CHIẾN LỰC</span>
          <span class="ml-1 text-[9px] text-ink-faint">{{ powerOpen ? '▾' : '▸' }}Phân giải</span>
        </button>
        <span class="font-kai text-[18px] text-cinnabar tabular">{{ formatGN(stats.power) }}</span>
      </div>
      <!--
        Công thức chiến lực: Trọng số lấy từ POWER_WEIGHTS, đồng bộ cùng powerScore
      -->
      <p class="mt-0.5 text-right text-[10px] text-ink-faint tabular">{{ displayPowerExplain }}</p>
      <!--
        Từng dòng công / phòng / huyết được quy đổi theo trọng số, hợp lại đúng bằng tổng chiến lực
      -->
      <div v-if="powerOpen" class="mt-2 rounded-md bg-paper-deep/60 px-2.5 py-2 text-[10px]">
        <p v-for="row in powerRows" :key="row.name" class="flex items-center justify-between">
          <span class="text-ink-faint">{{ row.name === '攻击' ? 'Tấn Công' : row.name === '防御' ? 'Phòng Ngự' : row.name === '气血' ? 'Khí Huyết' : row.name }}</span>
          <span class="tabular">
            {{ formatGN(row.raw) }} ×{{ row.weight }} = <span class="text-azure">{{ formatGN(row.value) }}</span>
          </span>
        </p>
        <p class="mt-1 flex items-center justify-between border-t border-ink/8 pt-1">
          <span class="text-ink-faint">Tổng cộng</span>
          <span class="tabular font-kai text-[12px] text-cinnabar">{{ formatGN(stats.power) }}</span>
        </p>
        <p class="mt-1 text-[10px] leading-relaxed text-ink-faint">Chiến lực được hợp thành từ các hạng mục này, hệ số trọng số của mỗi hạng mục đều được hiển thị rõ ràng.</p>
      </div>
      <div class="ink-divider my-3" />
      <!-- Linh căn -->
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span class="shrink-0 font-kai text-[12px] tracking-widest text-ink-faint">Linh Căn</span>
        <span class="shrink-0 whitespace-nowrap font-kai text-[13px] text-cinnabar">{{ player.linggen?.gradeName }}</span>
        <div class="flex shrink-0 gap-1.5">
          <span
            v-for="root in player.linggen?.roots ?? []"
            :key="root.element"
            class="flex flex-col items-center"
            :title="`Tư chất ${root.aptitude}`"
          >
            <span
              class="grid h-6 w-6 place-items-center rounded-full border text-[11px] font-kai"
              :style="{ borderColor: ELEMENTS[root.element].color, color: ELEMENTS[root.element].color }"
            >
              {{ ELEMENTS[root.element].char }}
            </span>
            <!-- Tư chất hiển thị ngay dưới vòng tròn -->
            <span class="mt-0.5 text-[9px] leading-none tabular" :style="{ color: ELEMENTS[root.element].color }">
              {{ root.aptitude }}
            </span>
          </span>
        </div>
        <span class="ml-auto shrink-0 whitespace-nowrap text-[11px] text-ink-faint tabular">
          ×{{ player.linggen?.growthMult.toFixed(2) }}
        </span>
      </div>
      <!-- Khuynh hướng tự nhiên (Phase 32.2) -->
      <div v-if="tendencies.length" class="mt-2 space-y-1">
        <p v-for="t in tendencies" :key="t.element" class="flex gap-1.5 text-[11px] leading-relaxed text-ink-faint">
          <span class="shrink-0 font-kai" :style="{ color: ELEMENTS[t.element].color }">{{ ELEMENTS[t.element].char }}</span>
          <span>{{ t.text }}</span>
        </p>
      </div>
    </div>

    <!-- Thuộc tính đạo thể -->
    <section>
      <SectionTitle title="Đạo Thể" />
      <div class="card-ink mt-2 px-4 py-3">
        <div class="grid grid-cols-3 gap-2 text-center">
          <div>
            <p class="text-[10px] text-ink-faint">Tấn Công</p>
            <p class="tabular font-kai text-[15px] text-ink">{{ formatGN(stats.attack) }}</p>
          </div>
          <div>
            <p class="text-[10px] text-ink-faint">Phòng Ngự</p>
            <p class="tabular font-kai text-[15px] text-ink">{{ formatGN(stats.defense) }}</p>
          </div>
          <div>
            <p class="text-[10px] text-ink-faint">Khí Huyết</p>
            <p class="tabular font-kai text-[15px] text-ink">{{ formatGN(stats.maxHp) }}</p>
          </div>
        </div>
        <div v-if="modRows.length" class="ink-divider my-2.5" />
        <div class="grid grid-cols-2 gap-x-4 gap-y-1">
          <!-- Mỗi dòng có thể nhấn để xem nguồn gốc -->
          <button
            v-for="row in modRows"
            :key="row.label"
            class="-my-1 flex justify-between py-1.5 text-left text-[11px] active:opacity-60"
            @click="toggleBreakdown(row.key)"
          >
            <span class="text-ink-faint">
              {{ row.label }}
              <span v-if="row.capped" class="ml-0.5 text-[9px] text-cinnabar">Mềm</span>
            </span>
            <span class="tabular" :class="row.value > 0 ? 'text-azure' : 'text-cinnabar'">
              {{ signedPercent(row.value) }}
            </span>
          </button>
        </div>
        <p v-if="modRows.length" class="mt-1 text-[9px] text-ink-faint">Nhấn vào một hàng để xem nguồn gốc</p>
        <p
          v-for="note in panelCaveats"
          :key="note.key"
          class="mt-0.5 text-[9px] leading-relaxed text-ink-faint"
        >
          {{ note.label }}: {{ STAT_CAVEAT_VN[note.key] ?? note.caveat }}
        </p>
        <div v-if="breakdownRows.length" class="mt-1.5 rounded-md bg-paper-deep/60 px-2.5 py-2">
          <p class="text-[10px] text-ink-soft">{{ (breakdownKey ? (STAT_VN_NAMES[breakdownKey] ?? STAT_NAMES[breakdownKey]) : '') }} · Chi tiết nguồn gốc</p>
          <p v-for="c in breakdownRows" :key="c.name" class="mt-0.5 flex justify-between text-[10px]">
            <span class="text-ink-faint">
              {{ translateSource(c.name) }}
              <span v-if="c.onTop" class="ml-1 text-[9px] text-cinnabar">Nhân riêng</span>
            </span>
            <span class="tabular" :class="c.value > 0 ? 'text-azure' : 'text-cinnabar'">
              {{ signedPercent(c.value) }}
            </span>
          </p>
          <p class="mt-1 text-[10px] leading-relaxed text-ink-faint">
            Tổng số là tổng cộng các mục; mục đánh dấu「Nhân riêng」không tính gộp vào phần trăm mà nhân riêng vào công/phòng/huyết.
          </p>
        </div>
        <p v-if="softCappedNotes.length" class="mt-1.5 text-[10px] leading-relaxed text-cinnabar">
          Mục đánh dấu「Mềm」đã đạt ngưỡng suy giảm: {{ softCappedNotes.join('、') }}. Càng xếp thêm, hiệu quả càng thấp, âu cũng là đại đạo hữu nhai.
        </p>
      </div>
    </section>

    <!-- Các lối vào: Đạo Đồ / Duyên Pháp / Ký Lục -->
    <section>
      <SectionTitle title="Đạo Đồ" hint="Lưu phái" />
      <div class="mt-2 space-y-4">
        <RouterLink to="/build" class="card-ink flex items-center gap-3 px-4 py-3 active:scale-98">
          <GameIcon name="swords" :size="16" class="shrink-0 text-cinnabar" />
          <span class="min-w-0 grow">
            <span class="block font-kai text-[14px] tracking-[0.25em] text-ink">Lưu Phái</span>
            <span class="block truncate text-[10px] text-ink-faint tabular">
              <template v-if="build">
                {{ displayBuildName(build.displayName) }} · Khế hợp {{ Math.round(build.affinity * 100) }}% · Bản ghi {{ loadouts.list.length }} bộ
              </template>
              <template v-else>Đạo đồ chưa thành đường, gom từ điều cùng công pháp thành một phái sẽ rõ</template>
            </span>
          </span>
          <span class="text-[11px] text-cinnabar">Tham ngộ →</span>
        </RouterLink>

        <!-- Tu hành họa tượng (Phase 31.2) -->
        <button class="card-ink flex w-full items-center gap-3 px-4 py-3 text-left active:scale-98" @click="identityOpen = true">
          <GameIcon name="circle-user" :size="16" class="shrink-0 text-ink-soft" />
          <span class="min-w-0 grow">
            <span class="block font-kai text-[14px] tracking-[0.25em] text-ink">Tu Hành Họa Tượng</span>
            <span class="line-clamp-2 text-[10px] leading-relaxed text-ink-faint">「{{ identity?.epithet ?? 'Vân Ẩn Tán Nhân' }}」 · {{ identity?.narrative ? displayIdentityNarrative(identity.narrative) : 'Dấu chân còn nông' }}</span>
          </span>
          <span class="shrink-0 text-[11px] text-ink-soft">Mở xem →</span>
        </button>

        <RouterLink to="/titles" class="card-ink flex items-center gap-3 px-4 py-3 active:scale-98">
          <GameIcon :name="currentPetIcon ?? 'crown'" :size="16" class="shrink-0 text-jade" />
          <span class="min-w-0 grow">
            <span class="block font-kai text-[14px] tracking-[0.25em] text-ink">Danh Hiệu & Linh Thú</span>
            <span class="block truncate text-[10px] text-ink-faint">
              {{ currentTitleName ?? 'Chưa đeo danh hiệu' }} · {{ currentPetName ? displayPetName(currentPetName) : 'Chưa mang linh thú' }}
            </span>
          </span>
          <span class="text-[11px] text-jade">Chỉnh lý →</span>
        </RouterLink>
      </div>
    </section>

    <!-- Duyên pháp: Những người gặp gỡ kiếp này -->
    <section>
      <SectionTitle title="Duyên Pháp" hint="Sư thừa đạo lữ" />
      <div class="mt-2 space-y-4">
        <!-- Sư thừa (Phase 31 S1) -->
        <button class="card-ink flex w-full items-center gap-3 px-4 py-3 text-left active:scale-98" @click="mentorDialog = true">
          <GameIcon name="scroll" :size="16" class="shrink-0 text-azure" />
          <span class="min-w-0 grow">
            <span class="block font-kai text-[14px] tracking-[0.25em] text-ink">Sư Thừa</span>
            <span class="block truncate text-[10px] text-ink-faint">
              {{ mentorVer ? `${mentorVer.mentor?.name ?? ''} · ${mentorVer.mentor?.title ?? ''} | ${mentorVer.line}` : 'Chưa bái sư, có thể tìm một vị sư tôn' }}
            </span>
          </span>
          <span class="shrink-0 text-[11px] text-azure">{{ mentorVer ? 'Thỉnh giáo →' : 'Bái sư →' }}</span>
        </button>

        <!-- Đạo lữ (Phase 33.8) -->
        <button class="card-ink flex w-full items-center gap-3 px-4 py-3 text-left active:scale-98" @click="bondDialog = true">
          <GameIcon name="user" :size="16" class="shrink-0 text-azure" />
          <span class="min-w-0 grow">
            <span class="block font-kai text-[14px] tracking-[0.25em] text-ink">Đạo Lữ</span>
            <span class="block truncate text-[10px] text-ink-faint">
              <span v-if="hasBondWord" class="chip-ink mr-1 align-middle border-cinnabar/50 text-[9px] text-cinnabar">Có lời muốn nói</span>
              {{
                bondDef && bond
                  ? `${displayDaoluName(bondDef.name)} · ${displayDaoluStage(STAGE_NAMES[bond.stage])}${bond.fallen ? '(Đã mất)' : ''} | ${displayDaoluBrief(bondDef.brief)}`
                  : pastBonds.length
                    ? `Kiếp này chưa gặp gỡ, các kiếp trước từng có ${pastBonds.length} đoạn đồng hành`
                    : 'Kiếp này chưa gặp ai'
              }}
            </span>
          </span>
          <span class="shrink-0 text-[11px] text-azure">{{ bondDef ? 'Tương tri →' : 'Lý lịch →' }}</span>
        </button>
      </div>
    </section>

    <!-- Ký lục: Đã đi qua những đâu, con đường này từ đâu đến -->
    <section>
      <SectionTitle title="Ký Lục" hint="Tàng trân" />
      <div class="mt-2 space-y-4">
        <RouterLink to="/collection" class="card-ink flex items-center gap-3 px-4 py-3 active:scale-98">
          <GameIcon name="gem" :size="16" class="shrink-0 text-gold-ink" />
          <span class="min-w-0 grow">
            <span class="block font-kai text-[14px] tracking-[0.25em] text-ink">Tàng Trân & Thành Tựu</span>
            <span class="block text-[10px] text-ink-faint tabular">
              Thành tựu {{ quests.achieved.length }}/{{ ACHIEVEMENTS.length }} · Đồ giám {{ collectHave }}/{{ collectTotal }}
            </span>
          </span>
          <span class="text-[11px] text-gold-ink">Lật xem →</span>
        </RouterLink>

        <RouterLink to="/legacy" class="card-ink flex items-center gap-3 px-4 py-3 active:scale-98">
          <GameIcon name="book" :size="16" class="shrink-0 text-ink-soft" />
          <span class="min-w-0 grow">
            <span class="block font-kai text-[14px] tracking-[0.25em] text-ink">Tu Tiên Lục</span>
            <span class="block truncate text-[10px] text-ink-faint tabular">Họa tượng · Cột mốc · Kỷ lục của ta —— Cuốn này chỉ viết về chính ngươi</span>
          </span>
          <span class="text-[11px] text-ink-soft">Mở xem →</span>
        </RouterLink>

        <!-- Giới Vực Chí -->
        <RouterLink to="/codex" class="card-ink flex items-center gap-3 px-4 py-3 active:scale-98">
          <GameIcon name="mountain" :size="16" class="shrink-0 text-ink-soft" />
          <span class="min-w-0 grow">
            <span class="block font-kai text-[14px] tracking-[0.25em] text-ink">Giới Vực Chí</span>
            <span class="block truncate text-[10px] text-ink-faint tabular">{{ displayCnNum(cnNumber(WORLDS.length)) }} Giới {{ displayCnNum(cnNumber(REALMS.length)) }} Cảnh · Nguồn gốc và điển tịch của từng cảnh giới</span>
          </span>
          <span class="text-[11px] text-ink-soft">Tra cứu →</span>
        </RouterLink>

        <button class="card-ink flex w-full items-center gap-3 px-4 py-3 text-left active:scale-98" @click="rebirthOpen = true">
          <GameIcon name="refresh" :size="16" class="shrink-0 text-violet-ink" />
          <span class="min-w-0 grow">
            <span class="block font-kai text-[14px] tracking-[0.25em] text-ink">Luân Hồi</span>
            <span class="block text-[10px] text-ink-faint tabular">
              <span class="chip-ink mr-1 border-violet-ink/50 text-[9px] text-violet-ink">Tích lũy vĩnh viễn</span>
              Đạo quả {{ player.reincarnation.daoFruit }} · Thiên phú {{ ownedTalents.length }} mục · Truyền thừa {{ ownedHeritage.length }} đạo
            </span>
          </span>
          <span class="text-[11px] text-violet-ink">Quán tưởng →</span>
        </button>

        <!-- Quyền Admin (Thiên Đạo Phủ) -->
        <button class="card-ink flex w-full items-center gap-3 px-4 py-3 text-left active:scale-98" @click="adminOpen = true">
          <GameIcon name="sparkles" :size="16" class="shrink-0 text-cinnabar" />
          <span class="min-w-0 grow">
            <span class="block font-kai text-[14px] tracking-[0.25em] text-ink">Quyền Admin · Thiên Đạo Phủ</span>
            <span class="block truncate text-[10px] text-ink-faint tabular">
               Nhận linh thạch, tu vi, đan dược, huyền thiết, tàn trang...
            </span>
          </span>
          <span class="text-[11px] text-cinnabar">Quản lý →</span>
        </button>
      </div>
    </section>

    <!-- Modal Tu Hành Họa Tượng (Phase 31.2) -->
    <BaseModal :open="identityOpen" :title="`Tu Hành Họa Tượng · 「${identity?.epithet ?? 'Vân Ẩn Tán Nhân'}」`" @close="identityOpen = false">
      <div v-if="identity" class="space-y-2.5">
        <p class="text-[12px] leading-relaxed text-ink-soft">{{ identity.narrative ? displayIdentityNarrative(identity.narrative) : '' }}</p>
        <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
          <p class="flex justify-between"><span class="text-ink-faint">Sư thừa</span><span class="text-ink-soft">{{ identity.roots.mentor?.name ?? 'Chưa định' }}</span></p>
          <p class="flex justify-between"><span class="text-ink-faint">Đạo đồ</span><span class="text-ink-soft">{{ identity.roots.daoPath ?? 'Chưa lập' }}</span></p>
          <p class="flex justify-between"><span class="text-ink-faint">Lưu phái</span><span class="text-ink-soft">{{ identity.roots.build ?? 'Chưa thành' }}</span></p>
          <p class="flex justify-between"><span class="text-ink-faint">Ngộ đạo</span><span class="text-ink-soft">{{ identity.roots.branches.join('、') || 'Chưa định' }}</span></p>
        </div>
        <p v-if="identity.roots.fortunes.length" class="text-[11px] text-ink-faint">
          Ấn ký cơ duyên: {{ identity.roots.fortunes.map(f => f.title).join(' · ') }}
        </p>
        <p class="text-[10px] leading-relaxed text-ink-faint">Họa tượng dựa trên các lựa chọn thực tế đúc kết —— Ngươi tu thành dáng vẻ nào, nó liền miêu tả dáng vẻ đó.</p>
      </div>
      <template #footer>
        <button class="btn-seal w-full" @click="identityOpen = false">Thu Cuộn</button>
      </template>
    </BaseModal>

    <!-- Modal Luân Hồi -->
    <BaseModal :open="rebirthOpen" title="Luân Hồi" @close="rebirthOpen = false">
      <p class="flex justify-between text-[12px]">
        <span class="text-ink-soft">
          Đạo Quả
          <span class="ml-1 text-[10px] text-violet-ink">【Tích lũy vĩnh viễn】</span>
          <span class="block text-[10px] text-ink-faint">
            Mỗi quả tối đa: Tu hành +{{ formatPercent(DAO_FRUIT_CULT_BONUS) }}, Đạo thể +{{
              formatPercent(DAO_FRUIT_COMBAT_BONUS)
            }}; suy giảm biên độ (xem dưới), chuyển thế giữ lại
          </span>
        </span>
        <span class="tabular font-kai text-[15px] text-cinnabar">{{ player.reincarnation.daoFruit }}</span>
      </p>
      <!-- S3 Thu hoạch Đạo quả: Hiệu quả thực và giới hạn mềm -->
      <p class="mt-1 text-[11px] text-ink-faint tabular">
        Thu hoạch thực tế
        <span class="text-gold-ink">{{ fruitCountLabel(fruitInfo.effective) }}</span>
        (suy giảm biên độ) ·
        {{
          fruitInfo.total > 0
            ? `Hiện tại tu hành +${formatPercent(fruitInfo.effective * DAO_FRUIT_CULT_BONUS * stats.cultSpeedFactor)} · Đạo thể +${formatPercent(fruitInfo.effective * DAO_FRUIT_COMBAT_BONUS)}`
            : ''
        }}
      </p>
      <!-- Nghịch Lữ Khế: Tiêu hao Đạo quả -->
      <p class="mt-2 flex items-center justify-between text-[12px]">
        <span class="text-ink-soft">
          Nghịch Lữ Khế
          <span class="ml-1 text-[10px] text-violet-ink">【Kiếp này · Tiêu hao Đạo quả】</span>
          <span class="block text-[10px] text-ink-faint">
            {{ signedTrial ? `Kiếp này đã lập「${signedTrial.name}」· ${signedTrial.ruleText}` : 'Dùng Đạo quả đổi lấy một kiếp nghịch cảnh, thu hoạch chỉ là một nét trong lý lịch' }}
          </span>
        </span>
        <button
          v-if="!signedTrial"
          class="shrink-0 self-center -my-1.5 px-2 py-1.5 text-[12px] text-gold-ink underline underline-offset-2 active:text-cinnabar"
          @click="trialOpen = true"
        >
          Lập Khế
        </button>
        <span v-else class="shrink-0 font-kai text-[15px] text-cinnabar">{{ signedTrial.seal }}</span>
      </p>

      <div class="mt-2">
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="t in ownedTalents"
            :key="t!.id"
            class="chip-ink !py-1.5 border-current bg-transparent text-left"
            :style="{ color: TALENT_GRADE_COLORS[t!.grade] }"
            :title="t!.desc"
            :aria-expanded="talentTap === t!.id"
            @click="talentTap = talentTap === t!.id ? null : t!.id"
          >
            {{ t!.name }}
          </button>
          <span v-if="!ownedTalents.length" class="text-[11px] text-ink-faint">Chuyển thế xong có thể thức tỉnh tư chất tiên thiên</span>
        </div>
        <p v-if="talentTap && tappedTalent" class="mt-1.5 text-[10px] leading-relaxed text-ink-faint">
          <span :style="{ color: TALENT_GRADE_COLORS[tappedTalent.grade] }">{{ tappedTalent.name }}</span>: {{ tappedTalent.desc }}
          <span v-if="modsText(tappedTalent.mods)" class="mt-0.5 block text-azure tabular">{{ modsText(tappedTalent.mods) }}</span>
        </p>
      </div>
      <div class="mt-3">
        <p class="text-[11px] text-ink-soft">
          Túc Mệnh Truyền Thừa
          <span class="ml-1 text-[10px] text-violet-ink">【Tích lũy vĩnh viễn · Đi theo thần hồn bất diệt】</span>
          <span class="block text-[10px] text-ink-faint">
            Một đạo cảnh giới đi đến tận cùng mới để lại một truyền thừa duy nhất (vị trí năng lực). Tu vi dưới Kim Đan mãi mãi không thể đúc thành.
          </span>
        </p>
        <ul v-if="ownedHeritage.length" class="mt-1.5 space-y-1.5">
          <li v-for="h in ownedHeritage" :key="h!.id" class="rounded-md border border-jade/40 bg-jade/5 px-2.5 py-1.5">
            <p class="flex items-baseline justify-between text-[11px] font-kai text-jade">
              <span>{{ h!.name }}</span>
              <span class="text-[9px] tracking-[0.2em] text-jade">{{ h!.axis === 'choice' ? '· Lựa chọn' : h!.axis === 'fault-tolerant' ? '· Dung sai' : '· Vinh dự' }}</span>
            </p>
            <p class="text-[10px] leading-relaxed text-ink-soft">{{ h!.desc }}</p>
          </li>
        </ul>
        <p v-else class="mt-1.5 text-[11px] text-ink-faint">Chưa đúc thành truyền thừa —— Tu hành thâm sâu từ Kim Đan trở lên mới có thể lưu lại một đạo</p>
      </div>
      <!--
        Đi - Ở khi chuyển thế
      -->
      <button
        class="mt-3 flex w-full items-center justify-between px-2 py-2 text-left text-[11px] text-ink-soft active:opacity-60"
        :aria-expanded="heritageOpen"
        @click="heritageOpen = !heritageOpen"
      >
        <span>Danh mục giữ lại khi chuyển thế (Giữ {{ keepCount }} · Mất {{ resetCount }})</span>
        <span class="text-[10px] text-azure">{{ heritageOpen ? '▾ Thu lại' : '▸ Mở rộng' }}</span>
      </button>
      <div v-if="heritageOpen" class="mt-1.5 rounded-md bg-paper-deep/60 px-3 py-2">
        <p class="text-[10px] text-ink-soft">Theo hồn lưu lại · Đồng bộ cùng bảng kết toán</p>
        <div class="mt-1 space-y-1">
          <p v-for="row in heritageKeepRows" :key="row.id" class="flex items-baseline justify-between gap-2 text-[10px]">
            <span class="text-ink-soft">{{ HERITAGE_VN_NAMES[row.id] ?? row.name }}</span>
            <span class="shrink-0" :class="row.cls">{{ heritageModeVn(row.modeLabel) }}</span>
          </p>
          <div class="my-1 border-t border-ink/6" />
          <p v-for="row in heritageResetRows" :key="row.id" class="flex items-baseline justify-between gap-2 text-[10px]">
            <span class="text-ink-faint">{{ HERITAGE_VN_NAMES[row.id] ?? row.name }}</span>
            <span class="shrink-0" :class="row.cls">{{ heritageModeVn(row.modeLabel) }}</span>
          </p>
        </div>
      </div>
      <p class="mt-3 text-[11px] leading-relaxed text-ink-faint">{{ translateRebirthHint(rebirthHint) }}</p>
      <template #footer>
        <button class="btn-ghost w-full !text-[12px]" @click="rebirth">Binh Giải Chuyển Thế <!-- 兵解转世 --></button>
      </template>
    </BaseModal>

    <!-- Modal Nghịch Lữ Khế -->
    <BaseModal :open="trialOpen" title="Nghịch Lữ Khế" @close="trialOpen = false">
      <p class="text-[11px] leading-relaxed text-ink-faint">
        Đạo quả vốn là tích lũy qua các đời, xưa nay chỉ dồn trên thân thể. Lập một phần khế ước, đem nó đặt cược vào nghịch cảnh của kiếp này ——
        Khế ước không cho ngươi thêm nửa phần sức lực, chỉ khiến đường đi hẹp lại. Đi hết chặng đường, nó sẽ lưu lại trong lý lịch của ngươi.
      </p>
      <div class="mt-3 space-y-2">
        <button
          v-for="t in LIFE_TRIALS"
          :key="t.id"
          :class="['card-ink w-full px-3 py-2 text-left', canSignLifeTrial(t.id) ? '' : 'opacity-40']"
          @click="requestTrial(t.id)"
        >
          <span class="flex items-baseline justify-between">
            <span class="font-kai text-[14px] text-ink">{{ t.seal }} · {{ t.name }}</span>
            <span class="tabular text-[12px]" :class="player.reincarnation.daoFruit >= t.cost ? 'text-cinnabar' : 'text-ink-faint'">
              {{ t.cost }} Đạo Quả
            </span>
          </span>
          <span class="mt-0.5 block text-[11px] leading-relaxed text-ink-soft">{{ t.desc }}</span>
          <span class="mt-0.5 block text-[10px] text-ink-faint">{{ t.ruleText }}</span>
        </button>
      </div>
      <p class="mt-3 text-[11px] leading-relaxed text-ink-faint">Một đời chỉ có thể lập một khế ước, lập xong không thể giải. Khi chuyển thế khế ước tiêu tán cùng thể xác, lý lịch trường tồn.</p>
    </BaseModal>

    <!-- Nghịch Lữ Khế · Xác nhận -->
    <BaseModal :open="pendingTrial !== null" title="Xác Nhận Lập Khế" @close="pendingTrial = null">
      <template v-if="pendingTrial">
        <p class="text-[11px] leading-relaxed text-ink-faint">
          Lập nên「{{ pendingTrial.seal }} · {{ pendingTrial.name }}」, cược vào {{ pendingTrial.cost }} Đạo Quả. Kiếp này không còn đường quay lại, đền đáp chỉ ở lý lịch.
        </p>
        <p class="mt-2 text-[12px] leading-relaxed text-ink-soft">{{ pendingTrial.desc }}</p>
        <p class="mt-1 text-[10px] text-ink-faint">{{ pendingTrial.ruleText }}</p>
        <div class="mt-3 flex gap-2">
          <button class="btn-seal grow" @click="confirmSignTrial">Xác Nhận Lập Khế</button>
          <button class="btn-ink grow" @click="pendingTrial = null">Suy Nghĩ Lại</button>
        </div>
      </template>
    </BaseModal>

    <!-- Modal Đạo Lữ -->
    <BaseModal :open="bondDialog" :title="bondDef ? `Đạo Lữ · ${displayDaoluName(bondDef.name)}` : 'Đạo Lữ'" @close="bondDialog = false">
      <template v-if="bondDef && bond">
        <p class="font-kai text-[14px] text-ink">{{ displayDaoluName(bondDef.name) }}</p>
        <p class="mt-0.5 text-[11px] leading-relaxed text-ink-faint">{{ displayDaoluBrief(bondDef.brief) }}</p>
        <p class="mt-2 text-[11px] text-ink-soft">
          {{ displayDaoluTemper(TEMPER_NAMES[bondDef.temper]) }} · Đạo {{ displayDaoluLean(LEAN_NAMES[bondDef.lean]) }}
          <span class="ml-1 text-azure">{{ displayDaoluStage(STAGE_NAMES[bond.stage]) }}</span>
          <span v-if="bond.fallen" class="ml-1 text-cinnabar">Đã mất</span>
        </p>

        <!-- Ba chiều quan hệ -->
        <div class="mt-3 space-y-1.5">
          <p v-for="m in bondMeters" :key="m.label" class="flex items-center gap-2 text-[11px]">
            <span class="w-10 shrink-0 text-ink-faint">{{ m.label }}</span>
            <span class="h-1 grow rounded-full bg-ink/10">
              <span class="block h-1 rounded-full bg-azure/70" :style="{ width: `${m.v}%` }" />
            </span>
            <span class="w-8 shrink-0 text-right tabular text-ink-soft">{{ m.v }}</span>
          </p>
        </div>
        <p class="mt-2 text-[11px] text-ink-faint">Cùng trải qua {{ bond.shared }} lần</p>
        <p v-if="responseLine" class="mt-1 text-[11px] text-ink-faint">Nàng từng mở lời, các lần đáp lại của ngươi: {{ responseLine.split(' · ').map(r => displayBondResponse(r)).join(' · ') }}</p>

        <p class="mt-3 text-[11px] leading-relaxed text-ink-soft">Điều nàng cầu: {{ displayDaoluPursuit(bondDef.pursuit) }}</p>
        <p class="mt-0.5 text-[11px] leading-relaxed text-ink-faint">Ranh giới nàng không vượt: {{ displayDaoluTaboo(bondDef.taboo) }}</p>

        <p v-if="gateHint" class="mt-3 text-[11px] text-gold-ink">
          Cách「{{ displayDaoluStage(STAGE_NAMES[gateHint.stage]) }}」còn thiếu: {{ gateHint.lacking.map(l => displayGateHint(l)).join('、') }}
        </p>

        <!-- Chuyện nàng tự đề xuất (Phase 34.1) -->
        <template v-if="herIntent">
          <div class="mt-4 border-t border-ink/10 pt-3">
            <p class="text-[12px] leading-relaxed text-gold-ink">{{ herIntent.line }}</p>
            <p class="mt-1 text-[10px] text-ink-faint">Điều nàng cầu: {{ displayDaoluPursuit(herIntent.wish) }}</p>
            <!-- Khởi nguồn từ đâu -->
            <p v-if="herIntentSparks" class="text-[10px] text-ink-faint">Bắt nguồn từ: {{ herIntentSparks }}</p>
            <div class="mt-2.5 flex gap-2">
              <button
                v-for="r in INTENT_CHOICES"
                :key="r.id"
                class="card-ink grow px-2 py-2 text-center text-[12px] text-ink-soft active:scale-98"
                @click="answerIntent(r.id)"
              >
                {{ r.label }}
              </button>
            </div>
          </div>
        </template>

        <!-- Sự kiện chung -->
        <template v-if="pendingEvent && !bond.fallen && !bond.departed">
          <div class="mt-4 border-t border-ink/10 pt-3">
            <p class="font-kai text-[13px] tracking-widest text-ink">{{ displayBondEventTitle(pendingEvent.title) }}</p>
            <p class="text-[10px] text-ink-faint">Duyên do từ đâu: {{ pendingEventTriggers.split('、').map(t => displayBondTrigger(t)).join('、') }}</p>
            <p class="mt-1 text-[11px] leading-relaxed text-ink-soft">{{ displayBondEventText(pendingEvent.text) }}</p>
            <p class="mt-1.5 text-[11px] text-azure">{{ displayBondEventWish(pendingEvent.herWish) }}</p>
            <p class="text-[10px] text-ink-faint">{{ displayBondEventLimit(pendingEvent.herLimit) }}</p>
            <p v-if="herLine" class="mt-1.5 text-[11px] text-gold-ink">{{ herLine }}</p>
            <div class="mt-2.5 space-y-1.5">
              <button
                v-for="ch in pendingEvent.choices"
                :key="ch.id"
                class="card-ink w-full px-3 py-2 text-left text-[12px] text-ink-soft active:scale-98"
                :class="{ '!border-cinnabar/50 text-cinnabar': ch.peril, '!border-gold-ink/40': ch.risky && !ch.peril }"
                @click="pickChoice(ch.id)"
              >
                {{ displayBondChoiceLabel(ch.label) }}
                <span v-if="ch.peril" class="ml-1 text-[10px] text-cinnabar">〔Hiểm họa chung mệnh〕</span>
              </button>
            </div>
          </div>
        </template>
        <p v-else-if="lastEventText" class="mt-4 border-t border-ink/10 pt-3 text-[11px] leading-relaxed text-ink-soft">
          {{ lastEventText }}
        </p>
      </template>
      <p v-else class="text-[12px] leading-relaxed text-ink-faint">
        Kiếp này chưa gặp ai. Người là gặp được trên đường, không phải chọn ra —— Đi nhiều vùng đất hơn, tự khắc có ngày tương phùng.
      </p>

      <template v-if="pastBonds.length">
        <p class="mt-4 font-kai text-[13px] tracking-widest text-ink-soft">Lịch Thế Đồng Hành</p>
        <div class="mt-2 max-h-40 space-y-1.5 overflow-y-auto">
          <p v-for="(r, i) in pastBonds" :key="i" class="flex justify-between text-[11px]">
            <span class="text-ink-soft">{{ r.name }}</span>
            <span class="text-ink-faint">{{ STAGE_NAMES[r.stage] }} · {{ ENDING_NAMES[r.ending] }}</span>
          </p>
        </div>
      </template>
    </BaseModal>

    <!-- Modal Sư Thừa -->
    <BaseModal :open="mentorDialog" :title="mentorVer ? `Sư Thừa · ${mentorVer.mentor?.name ?? ''}` : 'Bái Sư'" @close="mentorDialog = false">
      <div v-if="mentorVer" class="space-y-3">
        <p class="font-kai text-[14px] text-ink">{{ mentorVer.mentor?.master }}</p>
        <p class="text-[12px] leading-relaxed text-ink-soft">
          「{{ mentorVer.line }}」
        </p>
        <p class="text-[11px] text-ink-faint tabular">
          Độ khế hợp
          <span :class="mentorVer.affinity > 0.2 ? 'text-jade' : mentorVer.affinity < -0.2 ? 'text-cinnabar' : 'text-ink-faint'">
            {{ mentorVer.affinity.toFixed(2) }} / 1.0
          </span>
        </p>
        <p class="text-[11px] leading-relaxed text-ink-faint">
          Từ điều sư thừa: {{ mentorVer.mentor ? modsText(mentorVer.mentor.mods) : '—' }}
        </p>
      </div>
      <div v-else class="space-y-2.5">
        <p class="text-[12px] leading-relaxed text-ink-faint">Sư thừa là một phần tâm pháp được danh sư tương tặng khi ngươi gặp gỡ nơi phàm giới. Bái nhập môn hạ, nhận được một dòng tăng ích tương hợp; lời nói cử chỉ khế hợp sư đạo, sư tôn tự có lời khen —— Dù ngẫu nhiên không hợp cũng không đến mức chịu phạt.</p>
        <button
          v-for="m in mentorChoicesList"
          :key="m!.id"
          class="w-full rounded-lg border px-3 py-2.5 text-left transition-all active:scale-98"
          :class="hintMentor === m!.id ? 'border-cinnabar/60 bg-cinnabar/5' : 'border-ink/20'"
          @click="player.adoptMentor(m!.id)"
        >
          <p class="flex items-baseline gap-2">
            <span class="font-kai text-[14px] text-ink">{{ m!.name }}</span>
            <span class="text-[11px] text-azure">{{ m!.title }}</span>
            <span v-if="hintMentor === m!.id" class="chip-ink ml-1 border-cinnabar/50 text-[9px] text-cinnabar">Cơ duyên dẫn lối</span>
            <span class="ml-auto text-[10px] text-ink-faint">{{ m!.master }}</span>
          </p>
          <p class="mt-0.5 text-[11px] text-ink-faint">{{ m!.desc }}</p>
          <p class="mt-0.5 text-[11px] text-azure tabular">{{ modsText(m!.mods) }}</p>
          <p class="mt-0.5 text-[10px] tabular" :class="mentorAffinityChip(m!.id)">
            Khế hợp hiện tại {{ mentorAffinityText(m!.id) }}
          </p>
        </button>
      </div>
      <template #footer>
        <button class="btn-seal w-full" @click="mentorDialog = false">Đã Rõ</button>
      </template>
    </BaseModal>

    <!-- Modal Quản Trị Viên (Admin) -->
    <AdminModal :open="adminOpen" @close="adminOpen = false" />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { usePlayerStore } from '@/stores/player'
  import { ENDING_NAMES, LEAN_NAMES, STAGE_NAMES, TEMPER_NAMES, daoluDef } from '@/data/daolu'
  import { chooseBondEvent, herStance, nextGateHint, pendingBondEvent, pendingIntent, respondIntent } from '@/core/daoluService'
  import { LIFE_TRIALS, type LifeTrialDef } from '@/data/lifeTrials'
  import { activeLifeTrial, canSignLifeTrial, signLifeTrial } from '@/core/lifeTrialService'
  import { useQuestsStore } from '@/stores/quests'
  import { useUiStore } from '@/stores/ui'
  import { ELEMENTS } from '@/data/linggen'
  import { titleDef } from '@/data/titles'
  import { petDef, PETS } from '@/data/pets'
  import { beastIcon } from '@/data/beastFamilies'
  import { talentDef, TALENT_GRADE_COLORS, TALENTS } from '@/data/talents'
  import { heritageDef } from '@/data/heritage'
  import { ACHIEVEMENTS } from '@/data/achievements'
  import { EQUIPMENT_TEMPLATES } from '@/data/equipment'
  import { GONGFA } from '@/data/gongfa'
  import { PILLS } from '@/data/pills'
  import { ARTIFACTS } from '@/data/artifacts'
  import { REALMS, WORLDS } from '@/data/realms'
  import { EVENTS } from '@/data/events'
  import { prepareReincarnation, MANUAL_REBIRTH_MIN_MAJOR } from '@/core/reincarnation'
  import { detectBuild } from '@/core/buildDetect'
  import { useLoadoutsStore } from '@/stores/loadouts'
  import { isSoftCapped, modOf } from '@/core/statsCalc'
  import { DAO_FRUIT_COMBAT_BONUS, DAO_FRUIT_CULT_BONUS, SOFT_CAPS, CULT_SPEED_SOFT_CAP_DIMINISH } from '@/data/constants'
  import { RESPONSE_NAMES, SPARK_NAMES } from '@/data/bondIntent'
  import { TRIGGER_NAMES } from '@/data/bondEvents'
  import { fruitCountLabel, fruitMarginalInfo } from '@/core/resourceGuidance'
  import { branchCodex, materialCodex, codexOwnedCount } from '@/ui/codex'
  import { mentorVerdict, mentorChoices } from '@/core/mentorService'
  import type { MentorId } from '@/data/mentors'
  import { mentorHint } from '@/core/fortuneChain'
  import { buildIdentity } from '@/core/identityService'
  import { rootElements, tendencyLines } from '@/core/linggenAffinity'
  import { cnNumber, formatGN, formatPercent } from '@/utils/format'
  import {
    displayCnNum,
    displayBuildName,
    displayPetName,
    displayDaoluName,
    displayDaoluBrief,
    displayDaoluPursuit,
    displayDaoluTaboo,
    displayDaoluTemper,
    displayDaoluLean,
    displayDaoluStage,
    displayGateHint,
    displayBondEventTitle,
    displayBondEventText,
    displayBondEventWish,
    displayBondEventLimit,
    displayBondChoiceLabel,
    displayBondTrigger,
    displayBondResponse,
    displayIdentityNarrative
  } from '@/ui/displayZhVi'
  import type { AnyStatKey } from '@/types'
  import { STAT_KEYS, STAT_NAMES, modsText, powerBreakdownRows, powerExplainText, signedPercent, statCaveat } from '@/ui/statNames'
  import { heritageViewRows, rebirthDecisionHint } from '@/ui/rebirthText'
  import SectionTitle from '@/components/common/SectionTitle.vue'
  import BaseModal from '@/components/common/BaseModal.vue'
  import GameIcon from '@/components/common/GameIcon.vue'
  import AdminModal from '@/components/character/AdminModal.vue'

  const adminOpen = ref(false)

  const STAT_VN_NAMES: Record<string, string> = {
    attackPct: 'Tấn Công',
    defensePct: 'Phòng Ngự',
    maxHpPct: 'Khí Huyết Tối Đa',
    critRate: 'Tỉ Lệ Bạo Kích',
    critDamage: 'Sát Thương Bạo Kích',
    speed: 'Phán Định Tiên Thủ',
    damageBonus: 'Tăng Uy Lực',
    damageReduction: 'Miễn Giảm Sát Thương',
    cultivationSpeed: 'Tốc Độ Tu Luyện',
    qiRegen: 'Hồi Phục Linh Khí',
    breakthroughRate: 'Tỉ Lệ Tiến Giai',
    luck: 'Khí Vận',
    armorPen: 'Phá Giáp',
    lifesteal: 'Hút Máu',
    counterRate: 'Phản Kích',
    shieldOnStart: 'Hộ Thuẫn Vào Trận',
    executeDamage: 'Sát Thương Xử Quyết',
    regenPerRound: 'Hồi Phục Mỗi Hiệp',
    dodgeRate: 'Né Tránh',
    accuracy: 'Chính Xác',
    lowHpReduction: 'Giảm Thương Hấp Hối',
    breakRefund: 'Hoàn Trả Tu Vi Thất Bại',
    doubleDropRate: 'Chiến Lợi Phẩm X2',
    eventLuck: 'Cơ Duyên Lịch Luyện',
    tribulationResist: 'Ngự Kiếp',
    comboRate: 'Liên Kích',
    stunRate: 'Chấn Nhiếp',
    lowHpDamage: 'Tăng Thương Bối Thủy',
    fullHpDamage: 'Tăng Thương Phong Mang',
    shieldPower: 'Tăng Thương Cương Thuẫn',
    comboDamage: 'Uy Lực Truy Kích',
    counterDamage: 'Uy Lực Phản Kích',
    overhealShield: 'Hóa Thuẫn Khi Trị Liệu Tràn',
    spiritStoneGain: 'Chiến Lợi Linh Thạch',
    explorationSpeed: 'Lịch Luyện Gặp Địch',
    expGain: 'Chiến Đấu Tu Vi',
    doublePillRate: 'Song Mai Thành Đan',
    forgeDiscount: 'Cường Hóa Giảm Tiêu Hao',
    dropRate: 'Tỉ Lệ Rớt Trang Bị'
  }

  const STAT_CAVEAT_VN: Record<string, string> = {
    breakthroughRate: 'Chỉ vào tiểu tiến giai; đại quan thiên kiếp không tính',
    luck: 'Chủ khí vật thành sắc; tiểu tiến giai mượn thêm số này nửa phần',
    doublePillRate: 'Cơ hội nhận thêm 1 viên; cộng thủ nghệ tối đa không quá 80%',
    explorationSpeed: 'Cùng hành trình yêu tung dày đặc hơn; lộ trình không giảm',
    spiritStoneGain: 'Chỉ cộng thạch khi thắng lịch luyện; động phủ sản sinh không tính',
    forgeDiscount: 'Chỉ giảm tiêu hao cường hóa trang bị; tế luyện pháp bảo không tính',
    dropRate: 'Chỉ tăng trang bị xuất thế; linh thạch thảo quặng không tính',
    eventLuck: 'Chỉ tăng kỳ ngộ trên đường lịch luyện; tuần du động phủ không tính',
    doubleDropRate: 'Tại chỗ linh thạch, tu vi, vật liệu và trang bị cùng nhân đôi',
    expGain: 'Chỉ cộng tu vi khi thắng lịch luyện; tĩnh tu không tính',
    tribulationResist: 'Chỉ giảm sát thương thiên kiếp; xúc xắc tiến giai nhỏ không đổi',
    qiCapPct: 'Giới hạn linh khí tăng lên, kho chứa tích lũy tăng theo',
    beastPct: 'Khuếch đại từ điều linh thú; cấp Linh Thú Viên không tính',
    speed: 'Cần không yếu hơn đối thủ mới được đi trước',
    firstStrike: 'Chỉ tính hiệp đầu khai cuộc; không đổi ai ra tay trước',
    dodgeRate: 'Cần cao hơn chính xác của đối thủ mới né được',
    accuracy: 'Chỉ triệt tiêu né tránh đối thủ; không né thì vô hiệu',
    critRate: `Cộng dồn trên cơ bản bạo kích ${formatPercent(0.05)}`,
    critDamage: `Cộng dồn trên cơ bản sát thương bạo kích ${formatPercent(1.5)}`,
    executeDamage: `Chỉ gây sát thương địch dưới ${formatPercent(0.3)} khí huyết`,
    lowHpDamage: `Bản thân khí huyết phải dưới ${formatPercent(0.3)}`,
    lowHpReduction: `Bản thân khí huyết phải dưới ${formatPercent(0.3)}`,
    fullHpDamage: `Bản thân khí huyết phải trên ${formatPercent(0.8)}`,
    shieldOnStart: `Vào trận ngưng thuẫn; tổng lượng không quá ${formatPercent(0.5)} khí huyết`,
    shieldPower: 'Cần hộ thuẫn còn tồn tại',
    armorPen: 'Gọt giảm phòng thủ trước rồi mới tính miễn giảm; không phải sát thương chuẩn',
    comboRate: 'Đòn đánh phát động riêng, không phải bạo kích liên kích',
    comboDamage: 'Chỉ tăng sát thương truy kích, không tăng bản kích',
    counterRate: 'Sau khi nhận đòn mới có thể trả lời',
    counterDamage: 'Chỉ tăng phản kích, không tăng bản kích',
    stunRate: 'Chấn nhiếp một hiệp; Tịnh Niệm có thể hóa giải',
    lifesteal: 'Hồi huyết theo sát thương tạo thành',
    regenPerRound: 'Hồi máu đầu hiệp; đã đầy thì không hồi',
    overhealShield: 'Chỉ chuyển hóa phần trị liệu tràn'
  }

  const SOURCE_VN_NAMES: Record<string, string> = {
    境界: 'Cảnh Giới',
    装备: 'Trang Bị',
    功法: 'Công Pháp',
    丹药: 'Đan Dược',
    法宝: 'Pháp Bảo',
    词条: 'Từ Điều',
    词缀: 'Từ Tố',
    灵兽: 'Linh Thú',
    道果: 'Đạo Quả',
    师承: 'Sư Thừa',
    称号: 'Danh Hiệu',
    天赋: 'Thiên Phú',
    洞府: 'Động Phủ',
    灵脉: 'Linh Mạch'
  }
  function translateSource(name: string): string {
    return SOURCE_VN_NAMES[name] ?? name
  }

  const HERITAGE_VN_NAMES: Record<string, string> = {
    realm: 'Cảnh giới & Tu vi',
    equipment: 'Trang bị',
    pills: 'Đan dược',
    artifacts: 'Pháp bảo',
    materials: 'Vật liệu & Linh thạch',
    regions: 'Tiến độ khu vực',
    buildings: 'Kiến trúc động phủ',
    gongfa: 'Công pháp',
    daoFruit: 'Đạo quả',
    talents: 'Tiên thiên chi tư',
    heritage: 'Túc mệnh truyền thừa',
    insight: 'Túc tuệ',
    title: 'Danh hiệu',
    pet: 'Linh thú',
    mentor: 'Sư thừa',
    veins: 'Đầu tư linh mạch',
    lore: 'Nhận thức (Đan phương/Dược tính/Khí văn/Địch thủ)',
    quests: 'Thành tựu & Đồ giám',
    endgame: 'Đạo nguyên & Đạo ngân',
    suppress: 'Trấn áp khu vực & Túc địch'
  }
  function heritageModeVn(modeLabel: string): string {
    if (modeLabel === '随魂保留') return 'Theo hồn giữ lại'
    if (modeLabel === '部分保留') return 'Giữ lại một phần'
    if (modeLabel === '归零重来') return 'Về 0 làm lại'
    return modeLabel
  }

  function translateRebirthHint(hint: string): string {
    return hint
      .replace(/带走/g, 'Mang theo ')
      .replace(/与/g, ' và ')
      .replace(/功法记得门类,层数回到一层;顶阶宿慧可留一门满层/g, 'Công pháp ghi nhớ môn phái, tầng số trở về tầng 1; túc tuệ đỉnh giai giữ lại một môn mãn tầng')
      .replace(/法宝随皮囊散去/g, 'Pháp bảo tiêu tán cùng thể xác')
      .replace(/境方可自行兵解/g, ' cảnh mới có thể tự hành binh giải')
  }

  const player = usePlayerStore()

  /** S3 Chuỗi đạo quả: Hiệu quả thực tế và giới hạn mềm */
  const fruitInfo = computed(() => fruitMarginalInfo())
  const quests = useQuestsStore()
  const ui = useUiStore()
  const loadouts = useLoadoutsStore()

  const stats = computed(() => player.finalStats)

  /** Trạng thái mở rộng và danh sách dòng của phân giải chiến lực */
  const powerOpen = ref(false)
  const powerRows = computed(() => powerBreakdownRows(stats.value))
  /** Công thức chiến lực tính một lần ở setup */
  const powerExplain = powerExplainText()
  const displayPowerExplain = computed(() =>
    powerExplain.replace('攻', 'Công').replace('防', 'Phòng').replace('血', 'Huyết')
  )

  const modRows = computed(() =>
    STAT_KEYS.map(k => ({
      key: k,
      label: STAT_VN_NAMES[k] ?? STAT_NAMES[k],
      value: modOf(stats.value.mods, k),
      capped: isSoftCapped(stats.value.mods, k) || (k === 'cultivationSpeed' && stats.value.cultSpeedSoftCapped)
    })).filter(x => x.value !== 0)
  )

  /** Khuynh hướng tự nhiên của linh căn */
  const tendencies = computed(() => tendencyLines(rootElements(player.linggen?.roots)))

  /** Chú thích các từ điều hiện có */
  const panelCaveats = computed(() =>
    modRows.value.flatMap(row => {
      const caveat = statCaveat(row.key)
      return caveat ? [{ key: row.key, label: row.label, caveat }] : []
    })
  )

  /** Chi tiết nguồn gốc */
  const breakdownKey = ref<AnyStatKey | null>(null)
  const breakdownRows = computed(() => {
    const key = breakdownKey.value
    if (!key) return []
    return stats.value.breakdown
      .map(r => ({ name: r.name, value: r.mods[key] ?? 0, onTop: r.onTop === true }))
      .filter(c => c.value !== 0)
  })

  function toggleBreakdown(key: AnyStatKey): void {
    breakdownKey.value = breakdownKey.value === key ? null : key
  }

  /**
   * Giới hạn mềm: Vượt quá cap sẽ chiết giảm theo tỷ lệ của SOFT_CAPS
   */
  const softCappedNotes = computed(() =>
    modRows.value
      .filter(r => r.capped)
      .map(r =>
        `${r.label} (vượt mức tính theo ${Math.round((r.key === 'cultivationSpeed' ? CULT_SPEED_SOFT_CAP_DIMINISH : SOFT_CAPS[r.key]?.diminish ?? 1) * 100)}%)`
      )
  )

  const build = computed(() => detectBuild(stats.value.mods))

  const currentTitleName = computed(() => (player.titleId ? titleDef(player.titleId)?.name : undefined))
  const currentPetName = computed(() => (player.petId ? petDef(player.petId)?.name : undefined))
  const currentPetIcon = computed(() => (player.petId ? beastIcon(petDef(player.petId)!.family) : undefined))
  const ownedTalents = computed(() => player.reincarnation.talents.map(id => talentDef(id)).filter(t => t !== undefined))
  const ownedHeritage = computed(() => player.reincarnation.heritage.map(id => heritageDef(id)).filter(d => d !== undefined))

  const collectHave = computed(
    () =>
      codexOwnedCount(quests.collections.equip, EQUIPMENT_TEMPLATES) +
      codexOwnedCount(quests.collections.gongfa, GONGFA) +
      codexOwnedCount(quests.collections.pill, PILLS) +
      codexOwnedCount(quests.collections.artifact, ARTIFACTS) +
      codexOwnedCount(quests.collections.pet, PETS) +
      codexOwnedCount(quests.collections.event, EVENTS) +
      codexOwnedCount(quests.collections.talent, TALENTS) +
      branchCodex().entries.filter(e => e.stage > 0).length +
      materialCodex().entries.filter(e => e.stage > 0).length
  )
  const collectTotal =
    EQUIPMENT_TEMPLATES.length +
    GONGFA.length +
    PILLS.length +
    ARTIFACTS.length +
    PETS.length +
    EVENTS.length +
    TALENTS.length +
    branchCodex().entries.length +
    materialCodex().entries.length

  // ---- Luân Hồi ----
  const rebirthOpen = ref(false)
  const heritageOpen = ref(false)
  const heritageRowsView = computed(() => heritageViewRows())
  const heritageKeepRows = computed(() => heritageRowsView.value.filter(r => r.mode !== 'reset'))
  const heritageResetRows = computed(() => heritageRowsView.value.filter(r => r.mode === 'reset'))
  const keepCount = computed(() => heritageKeepRows.value.length)
  const resetCount = computed(() => heritageResetRows.value.length)
  const rebirthHint = rebirthDecisionHint()
  const talentTap = ref<string | null>(null)
  const tappedTalent = computed(() => (talentTap.value ? talentDef(talentTap.value) : undefined))
  watch(rebirthOpen, open => {
    if (!open) talentTap.value = null
  })
  const bondDialog = ref(false)
  const bond = computed(() => player.bond)
  const bondDef = computed(() => (bond.value ? (daoluDef(bond.value.daoluId) ?? null) : null))
  const bondMeters = computed(() =>
    bond.value
      ? [
          { label: 'Duyên phận', v: bond.value.fate },
          { label: 'Tín nhiệm', v: bond.value.trust },
          { label: 'Khế hợp', v: bond.value.accord }
        ]
      : []
  )
  const gateHint = computed(() => nextGateHint())
  const pastBonds = computed(() => player.reincarnation.bonds)
  const pendingEvent = computed(() => pendingBondEvent())
  const pendingEventTriggers = computed(() =>
    (pendingEvent.value?.triggers ?? []).map(t => TRIGGER_NAMES[t]).filter(Boolean).join('、')
  )
  const lastEventText = ref('')
  const herLine = computed(() => (pendingEvent.value ? herStance(pendingEvent.value) : null))
  watch(bondDialog, open => {
    if (open) lastEventText.value = ''
  })
  function pickChoice(choiceId: string): void {
    if (!pendingEvent.value) return
    const r = chooseBondEvent(pendingEvent.value.id, choiceId)
    lastEventText.value = r?.text ?? ''
  }

  const herIntent = computed(() => pendingIntent())
  const hasBondWord = computed(() => !!pendingEvent.value || !!herIntent.value)
  const herIntentSparks = computed(() => {
    const sparks = herIntent.value?.sparks ?? []
    return [...new Set(sparks)].map(s => SPARK_NAMES[s]).join('、')
  })
  const responseLine = computed(() => {
    const rs = bond.value?.intent?.responses ?? []
    return rs.length ? rs.map(r => RESPONSE_NAMES[r]).join(' · ') : ''
  })
  const INTENT_CHOICES = [
    { id: 'accept' as const, label: 'Cùng nàng đi' },
    { id: 'refuse' as const, label: 'Khéo léo từ chối' },
    { id: 'ignore' as const, label: 'Im lặng' }
  ]
  function answerIntent(r: 'accept' | 'refuse' | 'ignore'): void {
    const a = respondIntent(r)
    lastEventText.value = a?.text ?? ''
  }
  const trialOpen = ref(false)
  const signedTrial = computed(() => activeLifeTrial())
  const pendingTrial = ref<LifeTrialDef | null>(null)
  function requestTrial(id: string): void {
    const def = LIFE_TRIALS.find(t => t.id === id)
    if (!def) return
    if (player.reincarnation.trial) {
      ui.toast('Kiếp này đã có khế ước trên thân', 'warn')
      return
    }
    if (player.reincarnation.daoFruit < def.cost) {
      ui.toast('Đạo quả không đủ', 'warn')
      return
    }
    pendingTrial.value = def
  }
  function confirmSignTrial(): void {
    if (!pendingTrial.value) return
    const id = pendingTrial.value.id
    pendingTrial.value = null
    if (signLifeTrial(id)) trialOpen.value = false
  }
  const canRebirth = computed(() => player.major >= MANUAL_REBIRTH_MIN_MAJOR)

  // Phase 31 S1 Sư thừa
  const mentorDialog = ref(false)
  const mentorVer = computed(() => mentorVerdict(player.mentor))
  const mentorChoicesList = mentorChoices()
  const mentorAffinityMap = computed(() => {
    const map = new Map<MentorId, number>()
    for (const m of mentorChoicesList) map.set(m.id, mentorVerdict(m.id)?.affinity ?? 0)
    return map
  })
  function mentorAffinity(mentorId: MentorId): number {
    return mentorAffinityMap.value.get(mentorId) ?? 0
  }
  function mentorAffinityText(mentorId: MentorId): string {
    const a = mentorAffinity(mentorId)
    return `${a > 0 ? '+' : ''}${a.toFixed(2)} / 1.0`
  }
  function mentorAffinityChip(mentorId: MentorId): string {
    const a = mentorAffinity(mentorId)
    if (a > 0.2) return 'text-jade'
    if (a < -0.2) return 'text-cinnabar'
    return 'text-ink-faint'
  }
  const hintMentor = computed(() => mentorHint())
  const identityOpen = ref(false)
  const identity = computed(() => buildIdentity())

  function rebirth(): void {
    if (!canRebirth.value) {
      ui.toast(`Ít nhất cảnh giới ${REALMS[MANUAL_REBIRTH_MIN_MAJOR]?.name ?? ''} mới có thể tự hành binh giải`, 'warn')
      return
    }
    rebirthOpen.value = false
    prepareReincarnation()
  }
</script>
