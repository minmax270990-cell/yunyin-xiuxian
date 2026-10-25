<template>
  <div class="stagger-in space-y-4 px-4 pb-6 pt-4">
    <SectionTitle title="Lưu Phái" hint="Con đường tự nhiên thành hình từ cấu trúc" />
    <div class="card-ink px-4 py-3">
      <template v-if="build">
        <div class="flex items-center gap-3">
          <span class="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-cinnabar/90 font-kai text-[22px] seal-face shadow">
            {{ build.style.seal }}
          </span>
          <div class="min-w-0 grow">
            <p class="flex items-baseline gap-2">
              <span class="font-kai text-[16px] tracking-widest text-ink">{{ build.displayName }}</span>
              <span class="text-[11px] text-cinnabar">{{ build.stageName }}</span>
              <span class="ml-auto tabular text-[12px] text-ink-soft">Khế hợp {{ Math.floor(build.affinity * 100) }}%</span>
            </p>
            <div class="track-ink mt-1.5 h-1.25 w-full">
              <div class="bar-fill" :style="{ width: `${build.affinity * 100}%`, background: 'var(--color-cinnabar)' }" />
            </div>
            <p v-if="build.secondary" class="mt-1 text-[10px] text-ink-faint tabular">
              Hệ thống phụ: {{ build.secondary.style.name }} {{ Math.floor(build.secondary.affinity * 100) }}% —— Tu hành không nghề nghiệp, con đường có thể không thuần
            </p>
          </div>
        </div>
        <p class="mt-2 text-[11px] leading-relaxed text-ink-faint">{{ build.style.desc }}</p>
        <div class="mt-2 space-y-1">
          <p v-for="cv in build.coreValues" :key="cv.key" class="flex justify-between text-[12px]">
            <span class="text-ink-soft">
              {{ STAT_VN_NAMES[cv.key] ?? STAT_NAMES[cv.key] }}
              <span v-if="isSoftCapped(player.finalStats.mods, cv.key)" class="ml-0.5 text-[9px] text-cinnabar">Mềm</span>
            </span>
            <span class="tabular text-violet-ink">{{ signedPercent(cv.value) }}</span>
          </p>
          <p
            v-for="note in coreCaveats"
            :key="note.key"
            class="text-[9px] leading-relaxed text-ink-faint"
          >
            {{ note.label }}: {{ STAT_CAVEAT_VN[note.key] ?? note.caveat }}
          </p>
        </div>
        <p v-if="buildSourceNames.length" class="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-ink-faint">
          <span>Thành đường từ:</span>
          <span v-for="name in buildSourceNames" :key="name" class="text-azure">{{ displayBuildSourceName(name) }}</span>
        </p>
        <!-- Đánh giá các chiều (Phase 30.2) -->
        <div class="mt-2.5 rounded-md bg-paper-deep/60 px-3 py-2">
          <p class="text-[10px] text-ink-faint">{{ displayCnNum(cnNumber(powerRating.labels.length)) }} Chiều Đánh Giá —— Đọc hình thái, không đọc xếp hạng</p>
          <div class="mt-1 grid grid-cols-1 gap-0.5">
            <button
              v-for="l in powerRating.labels"
              :key="l.key"
              class="-my-1 py-1.5 text-left active:opacity-60"
              @click="toggleDim(l.key)"
            >
              <span class="flex items-center justify-between text-[11px]">
                <span class="text-ink-soft">{{ DIM_VN_NAMES[l.name] ?? l.name }}</span>
                <span class="tabular tracking-widest text-gold-ink">{{ ratingStars(l.stars) }}</span>
              </span>
              <span v-if="dimKey === l.key" class="mt-1 block rounded-md bg-paper/70 px-2 py-1.5">
                <span class="block text-[10px] text-ink-soft">
                  {{ DIM_VN_NAMES[l.name] ?? l.name }} ghi điểm {{ l.score.toFixed(2) }} · 1 đến 5 sao, điểm cao sao nhiều
                </span>
                <span v-for="t in l.terms" :key="t.label" class="mt-0.5 flex justify-between text-[10px]">
                  <span class="text-ink-faint">{{ t.label }}</span>
                  <span class="tabular text-azure">+{{ t.contribution.toFixed(2) }}</span>
                </span>
                <span v-if="!l.terms.length" class="block text-[10px] text-ink-faint">Chiều này chưa có từ điều chống đỡ.</span>
                <span class="mt-1 block text-[9px] leading-relaxed text-ink-faint">
                  Các mục bên dưới cộng lại chính là điểm số của chiều này; sao sẽ tăng theo điểm số.
                </span>
              </span>
            </button>
          </div>
          <p class="mt-1 text-[10px] text-ink-faint">Nhấn vào một chiều để xem nó được cấu thành từ những từ điều nào.</p>
          <p class="mt-1 text-[10px] leading-relaxed text-ink-faint">
            Hai cấu trúc cùng cấp sao ai mạnh hơn do môi trường và tương khắc quyết định —— Vì vậy nơi đây cung cấp hình thái chứ không xếp thứ hạng.
          </p>
        </div>
        <!-- Tổ hợp kỹ -->
        <div v-if="comboInfo" class="mt-2.5 rounded-md px-3 py-2" :class="comboInfo.active ? 'bg-violet-ink/8' : 'bg-ink/4'">
          <p class="flex items-center gap-2">
            <span class="font-kai text-[13px]" :class="comboInfo.active ? 'text-violet-ink' : 'text-ink-faint'">
              Tổ hợp kỹ「{{ displayComboArtName(comboInfo.art.name) }}」
            </span>
            <span class="text-[10px]" :class="comboInfo.active ? 'text-jade' : 'text-ink-faint'">
              {{ comboInfo.active ? 'Đã thành' : `Hệ thống phụ đạt ${Math.round(COMBO_SECONDARY_MIN * 100)}% khế hợp có thể thành` }}
            </span>
          </p>
          <p class="mt-0.5 text-[11px] leading-relaxed" :class="comboInfo.active ? 'text-ink-soft' : 'text-ink-faint'">
            {{ displayComboArtDesc(comboInfo.art.desc) }}
          </p>
          <p class="mt-0.5 text-[10px] text-cinnabar">Giá phải trả: {{ displayComboArtCost(comboInfo.art.costText) }}</p>
        </div>
        <!-- Độ bền cấu trúc -->
        <div v-if="resilience" class="mt-2.5 rounded-md bg-ink/4 px-3 py-2">
          <p class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[11px]">
            <span class="font-kai whitespace-nowrap text-ink-soft">Độ bền cấu trúc</span>
            <span class="text-[10px] text-ink-faint">(Dưới tác động phong ấn cốt lõi phái chính)</span>
            <span
              class="ml-auto shrink-0 whitespace-nowrap tabular"
              :class="resilience.retention >= 0.45 ? 'text-jade' : 'text-cinnabar'"
            >
              Tỷ lệ thắng {{ Math.round(resilience.normal * 100) }}% → {{ Math.round(resilience.sealed * 100) }}%
            </span>
          </p>
          <p class="mt-0.5 text-[10px] text-ink-faint">{{ translateResilience(resilienceText(resilience)) }}</p>
        </div>
        <!-- Đối cục kiếp này -->
        <div v-if="matchupRows" class="mt-2.5 rounded-md bg-paper-deep/60 px-3 py-2">
          <p class="text-[10px] text-ink-faint">Đối cục kiếp này —— Dùng cấu trúc hiện tại giao đấu 7 loại thực địch, ước tính tỷ lệ thắng, điểm yếu xếp trước</p>
          <div class="mt-1.5 space-y-1">
            <div v-for="row in matchupSorted" :key="row.id" class="flex items-center gap-2">
              <span class="w-14 shrink-0 truncate text-[11px] text-ink-soft">{{ ARCHETYPE_VN_NAMES[row.name] ?? row.name }}</span>
              <span v-if="row.wall" class="shrink-0 rounded bg-cinnabar/10 px-1 py-0.5 text-[9px] leading-none text-cinnabar">Tường</span>
              <span class="track-ink h-1.25 min-w-0 flex-1 overflow-hidden rounded-full">
                <span class="bar-fill h-full rounded-full" :class="winBarCls(row.winRate)" :style="{ width: `${row.winRate * 100}%` }" />
              </span>
              <span class="w-9 shrink-0 text-right tabular text-[11px]" :class="winTextCls(row.winRate)">
                {{ Math.round(row.winRate * 100) }}%
              </span>
            </div>
          </div>
          <p class="mt-1.5 text-[9px] leading-relaxed text-ink-faint">
            Mỗi loại ước tính qua {{ MATCHUP_SAMPLE_RUNS }} 场估算 (trận), xem hướng「mặt nào chịu thiệt」, không phải tỷ lệ thắng chuẩn xác; bốn tường (Thủ lĩnh / Bạo phát cao / Sát thương chuẩn / Tật ảnh) thông suốt mới gọi là vạn kim du.
          </p>
        </div>
      </template>
      <p v-else class="text-[12px] leading-relaxed text-ink-faint">
        Đạo đồ chưa thành đường. Gom đủ từ điều, công pháp và pháp bảo cùng một hướng, tự thành một phái ——
        <br />
        <span class="text-ink-faint">Bối Thủy / Cương Thuẫn / Phản Chấn / Liên Kích / Mộc Trạch / Phong Mang, mỗi phái đều có khắc chế, cũng đều có thiên địch.</span>
      </p>
    </div>

    <!-- Bản ghi cấu trúc -->
    <SectionTitle title="Bản Ghi Cấu Trúc" :hint="`${loadouts.list.length}/${MAX_LOADOUTS}`" />
    <div class="card-ink px-4 py-3">
      <p class="mb-1.5 flex items-center justify-between">
        <span class="text-[11px] text-ink-faint">Lưu lại nguyên bộ công pháp / pháp bảo / trang bị thuận tay, chuyển đổi bằng một chạm</span>
        <button
          :disabled="loadouts.list.length >= MAX_LOADOUTS"
          class="-my-1 py-1.5 text-[11px]"
          :class="loadouts.list.length >= MAX_LOADOUTS ? 'cursor-not-allowed text-ink-faint' : 'text-cinnabar active:opacity-60'"
          @click="openSave"
        >{{ loadouts.list.length >= MAX_LOADOUTS ? 'Bản ghi đã đầy' : '+ Lưu cấu trúc hiện tại' }}</button>
      </p>
      <div v-if="loadouts.list.length" class="space-y-1.5">
        <div v-for="lo in loadouts.list" :key="lo.id" class="flex items-center gap-2 rounded-md bg-paper-deep/70 px-2.5 py-1.5">
          <span class="grid h-6 w-6 shrink-0 place-items-center rounded bg-cinnabar/85 font-kai text-[12px] seal-face">
            {{ lo.seal }}
          </span>
          <span class="min-w-0 grow truncate font-kai text-[12px] text-ink">{{ lo.name }}</span>
          <button class="btn-ghost !px-2.5 !py-2 !text-[11px]" @click="applyLoadout(lo.id)">Thay Đồ</button>
          <button class="btn-ghost !px-2 !py-2 !text-[11px] !text-ink-faint" @click="openRename(lo)">Đổi Tên</button>
          <template v-if="confirmDelete !== lo.id">
            <button
              class="-m-1.5 flex min-h-[28px] min-w-[28px] items-center justify-center p-1.5 text-ink-faint active:text-cinnabar"
              aria-label="Xóa cấu trúc"
              @click="confirmDelete = lo.id"
            >
              <GameIcon name="trash" :size="12" />
            </button>
          </template>
          <template v-else>
            <button class="btn-seal -my-4 !px-2 !py-2.5 !text-[10px]" @click="doDeleteLoadout(lo.id)">Xác Nhận Xóa</button>
            <button class="-my-4 py-2.5 text-[10px] text-ink-faint active:text-ink" @click="confirmDelete = null">Hủy</button>
          </template>
        </div>
      </div>
      <p v-else class="text-[10px] text-ink-faint">Chưa có bản ghi, lưu một bộ sau đó có thể ung dung chuyển đổi giữa các khu vực.</p>
    </div>

    <!-- Đối chiếu song cấu trúc -->
    <template v-if="compareCandidates.length">
      <SectionTitle title="So Sánh Cấu Trúc" hint="Tùy môi trường luận ngắn dài, không phân thắng bại" />
      <div class="card-ink px-4 py-3">
        <p class="text-[11px] text-ink-faint">Lấy cấu trúc hiện tại đối chiếu với một cấu trúc quá khứ đóng băng trong đạo ngân, xem cục diện bốn phương có gì khác biệt.</p>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <button
            v-for="c in compareCandidates"
            :key="c.at"
            class="chip-ink !py-1.5"
            :class="compareAt === c.at ? 'border-cinnabar text-cinnabar' : 'border-ink/25 text-ink-faint'"
            @click="pickCompare(c.at)"
          >
            Kiếp thứ {{ c.life }} · {{ c.buildName }}
          </button>
        </div>
        <template v-if="compareResult">
          <div class="mt-2 space-y-0.5">
            <p v-for="row in compareResult.rows" :key="row.worldName" class="flex justify-between text-[11px]">
              <span class="text-ink-faint">{{ row.worldName }}</span>
              <span class="tabular">
                <span class="text-ink-soft">Nay {{ row.aText }}</span>
                <span class="mx-1 text-ink-faint">|</span>
                <span :class="row.trend === 'down' ? 'text-jade' : row.trend === 'up' ? 'text-cinnabar' : 'text-ink-faint'">
                  Đó {{ row.bText }}
                </span>
              </span>
            </p>
          </div>
          <p v-if="compareResult.diffLines.length" class="mt-1 text-[10px] text-azure tabular">
            Đó so với nay: {{ compareResult.diffLines.join(' · ') }}
          </p>
          <p class="mt-0.5 text-[10px] text-ink-faint">Hai phương án đều có cảnh giới riêng, giữ hay bỏ tùy ngươi.</p>
        </template>
      </div>
    </template>

    <!-- Phòng thí nghiệm lưu phái -->
    <BuildLabPanel />

    <!-- Lưu / Đổi tên cấu trúc -->
    <BaseModal :open="saveOpen" :title="renameId ? 'Đổi Tên Cấu Trúc' : 'Lưu Thành Cấu Trúc'" @close="closeSave">
      <p v-if="renameId" class="text-[11px] text-ink-faint">Chỉ đổi danh xưng của bộ này, công pháp / pháp bảo / toàn bộ trang bị đã lưu giữ nguyên.</p>
      <p v-else class="text-[11px] text-ink-faint">Lưu công pháp / pháp bảo / toàn bộ trang bị hiện tại thành một bộ, có thể chuyển đổi một chạm bất cứ lúc nào.</p>
      <input
        v-model="saveName"
        maxlength="8"
        class="mt-2 w-full rounded-md border border-ink/20 bg-paper-deep/60 px-3 py-2 font-kai text-[14px] tracking-widest text-ink outline-none focus:border-cinnabar/50"
        placeholder="Đặt một danh xưng cho bộ cấu trúc này"
      />
      <template #footer>
        <button class="btn-seal w-full" @click="onSaveSubmit">{{ renameId ? 'Đổi Tên' : 'Lưu Vào' }}</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { usePlayerStore } from '@/stores/player'
  import { detectBuild, buildSources } from '@/core/buildDetect'
  import { ratePower, ratingStars, type PowerDimKey } from '@/core/powerRating'
  import { matchComboArt, COMBO_SECONDARY_MIN } from '@/data/comboArts'
  import { measureResilience, resilienceText } from '@/core/resilience'
  import { playerMatchups, MATCHUP_SAMPLE_RUNS } from '@/core/playerMatchup'
  import { buildPlayerSnap } from '@/core/playerSnap'
  import { compareSnaps, type CompareReport } from '@/core/compare'
  import { endgameUnlocked, snapFromReplay } from '@/core/endgameService'
  import { useEndgameStore } from '@/stores/endgame'
  import { applyLoadout, captureLoadout, deleteLoadout, renameLoadout } from '@/core/loadoutService'
  import { useLoadoutsStore, MAX_LOADOUTS, type Loadout } from '@/stores/loadouts'
  import { cnNumber } from '@/utils/format'
  import {
  displayCnNum,
  displayComboArtName,
  displayComboArtDesc,
  displayComboArtCost,
  displayBuildSourceName
} from '@/ui/displayZhVi'
  import { STAT_NAMES, signedPercent, statCaveat } from '@/ui/statNames'
  import { isSoftCapped } from '@/core/statsCalc'
  import SectionTitle from '@/components/common/SectionTitle.vue'
  import BuildLabPanel from '@/components/build/BuildLabPanel.vue'
  import GameIcon from '@/components/common/GameIcon.vue'
  import BaseModal from '@/components/common/BaseModal.vue'

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
    overhealShield: 'Hóa Thuẫn Khi Trị Liệu Tràn'
  }

  const STAT_CAVEAT_VN: Record<string, string> = {
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
    critRate: 'Cộng dồn trên cơ bản bạo kích',
    critDamage: 'Cộng dồn trên cơ bản sát thương bạo kích',
    executeDamage: 'Chỉ gây sát thương địch dưới ngưỡng khí huyết',
    lowHpDamage: 'Bản thân khí huyết phải dưới ngưỡng',
    lowHpReduction: 'Bản thân khí huyết phải dưới ngưỡng',
    fullHpDamage: 'Bản thân khí huyết phải trên ngưỡng',
    shieldOnStart: 'Vào trận ngưng thuẫn',
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

  const DIM_VN_NAMES: Record<string, string> = {
    进攻: 'Tấn Công',
    生存: 'Sinh Tồn',
    身法: 'Thân Pháp',
    恢复: 'Hồi Phục',
    机制: 'Cơ Chế'
  }

  const ARCHETYPE_VN_NAMES: Record<string, string> = {
    寻常: 'Bình Thường',
    精锐: 'Tinh Anh',
    首领: 'Thủ Lĩnh',
    高爆发: 'Bạo Phát Cao',
    多段: 'Đa Đoạn',
    真伤: 'Thương Chuẩn',
    疾影: 'Tật Ảnh'
  }

  function translateResilience(text: string): string {
    if (text.includes('道基浑厚')) return 'Đạo cơ hùng hậu —— Phái chính bị phong ấn vẫn còn chiến lực, Nghịch Mệnh Khế là cơ hội cho ngươi'
    if (text.includes('尚有余地')) return 'Vẫn còn dư địa —— Hệ thống phụ chống đỡ được nửa bầu trời, Nghịch Mệnh Khế cần cẩn trọng'
    if (text.includes('孤注一掷')) return 'Dốc hết vốn liếng —— Cấu trúc này cực kỳ phụ thuộc cốt lõi phái chính, Nghịch Mệnh Khế gần như tự trói mình'
    return text
  }

  const player = usePlayerStore()
  const loadouts = useLoadoutsStore()

  const build = computed(() => detectBuild(player.finalStats.mods))
  const powerRating = computed(() => ratePower(player.finalStats))

  const dimKey = ref<PowerDimKey | null>(null)
  function toggleDim(key: PowerDimKey): void {
    dimKey.value = dimKey.value === key ? null : key
  }
  const buildSourceNames = computed(() => (build.value ? buildSources(build.value.style) : []))
  const coreCaveats = computed(() =>
    (build.value?.coreValues ?? [])
      .map(cv => ({ key: cv.key, label: STAT_VN_NAMES[cv.key] ?? STAT_NAMES[cv.key], caveat: statCaveat(cv.key) }))
      .filter((row): row is { key: typeof row.key; label: string; caveat: string } => Boolean(row.caveat))
  )

  const comboInfo = computed(() => {
    const b = build.value
    if (!b?.secondary) return null
    const art = matchComboArt(b.style.id, b.secondary.style.id)
    if (!art) return null
    return { art, active: b.secondary.affinity >= COMBO_SECONDARY_MIN }
  })

  const resilience = computed(() => (build.value ? measureResilience(buildPlayerSnap()) : null))

  const matchupRows = computed(() => (build.value ? playerMatchups(buildPlayerSnap(), MATCHUP_SAMPLE_RUNS) : null))
  const matchupSorted = computed(() => [...(matchupRows.value ?? [])].sort((a, b) => a.winRate - b.winRate))
  function winBarCls(rate: number): string {
    return rate >= 0.7 ? 'bg-jade' : rate >= 0.45 ? 'bg-amber-ink' : 'bg-cinnabar'
  }
  function winTextCls(rate: number): string {
    return rate >= 0.7 ? 'text-jade' : rate >= 0.45 ? 'text-amber-ink' : 'text-cinnabar'
  }

  // ---- So sánh 2 cấu trúc ----
  const endgame = useEndgameStore()
  const compareAt = ref<number | null>(null)
  const compareResult = ref<CompareReport | null>(null)

  const compareCandidates = computed(() =>
    endgameUnlocked()
      ? endgame.marks
          .filter(m => m.replay !== undefined)
          .slice(0, 8)
          .map(m => ({ at: m.at, life: m.life, buildName: m.buildName }))
      : []
  )

  function pickCompare(at: number): void {
    compareAt.value = at
    const mark = endgame.marks.find(m => m.at === at)
    if (!mark?.replay) return
    compareResult.value = compareSnaps(buildPlayerSnap(), snapFromReplay('Cấu trúc thuở ấy', mark.replay))
  }

  const saveOpen = ref(false)
  const saveName = ref('')
  const confirmDelete = ref<string | null>(null)

  function openSave(): void {
    saveName.value = build.value?.style.name ?? ''
    saveOpen.value = true
  }

  const renameId = ref<string | null>(null)
  function openRename(lo: Loadout): void {
    renameId.value = lo.id
    saveName.value = lo.name
    saveOpen.value = true
  }

  function confirmRename(): void {
    if (renameId.value && renameLoadout(renameId.value, saveName.value)) {
      saveOpen.value = false
      renameId.value = null
    }
  }

  function onSaveSubmit(): void {
    if (renameId.value) confirmRename()
    else if (captureLoadout(saveName.value)) saveOpen.value = false
  }

  function closeSave(): void {
    renameId.value = null
    saveOpen.value = false
  }

  function doDeleteLoadout(id: string): void {
    deleteLoadout(id)
    confirmDelete.value = null
  }
</script>
