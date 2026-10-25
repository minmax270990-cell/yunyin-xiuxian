<template>
  <BaseModal
    :open="open"
    :title="sect ? `Quan Sát Tông Môn · ${sect.name}` : 'Chi Tiết Tông Môn'"
    @close="$emit('close')"
  >
    <div v-if="sect" class="space-y-4">
      <!-- HEADER: TỔNG QUAN TÔNG MÔN -->
      <div class="card-ink p-4 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="grid h-11 w-11 place-items-center rounded-lg bg-cinnabar/10 text-cinnabar">
              <GameIcon name="swords" :size="24" />
            </div>
            <div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <h3 class="font-kai text-[16px] font-bold text-ink">{{ sect.name }}</h3>
                <span class="rounded bg-cinnabar/10 px-2 py-0.5 text-[10px] font-kai font-bold text-cinnabar">
                  Cấp {{ sect.level }}
                </span>
                <span
                  class="rounded px-2 py-0.5 text-[10px] font-kai"
                  :class="sect.status === 'active' ? 'bg-jade/10 text-jade' : sect.status === 'vassal' ? 'bg-amber-ink/10 text-amber-ink' : 'bg-ink/10 text-ink-faint'"
                >
                  {{ sect.status === 'active' ? 'Đang Hoạt Động' : sect.status === 'vassal' ? 'Phụ Thuộc' : 'Đã Diệt Vong' }}
                </span>
              </div>
              <p class="text-[11px] text-ink-faint">
                Chưởng Môn: <strong class="text-ink">{{ sect.leaderName }}</strong> · Tông Chỉ: {{ sect.doctrine }}
              </p>
            </div>
          </div>

          <div class="text-right">
            <span class="text-[10px] tracking-widest text-ink-faint block">TỔNG LỰC CHIẾN</span>
            <span class="font-kai text-[18px] font-bold text-cinnabar tabular">
              {{ sect.combatPower.toLocaleString() }}
            </span>
          </div>
        </div>

        <p class="text-[11px] text-ink-soft leading-relaxed">{{ sect.desc }}</p>

        <!-- Tài nguyên tông môn đối thủ -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-ink/10 text-[11px]">
          <div class="bg-paper-deep/40 rounded p-1.5 text-center">
            <span class="text-ink-faint text-[10px] block">Linh thạch</span>
            <span class="font-semibold text-gold-ink">{{ sect.resources.stone.toLocaleString() }}</span>
          </div>
          <div class="bg-paper-deep/40 rounded p-1.5 text-center">
            <span class="text-ink-faint text-[10px] block">Huyền thiết</span>
            <span class="font-semibold text-azure">{{ sect.resources.ore.toLocaleString() }}</span>
          </div>
          <div class="bg-paper-deep/40 rounded p-1.5 text-center">
            <span class="text-ink-faint text-[10px] block">Linh thảo</span>
            <span class="font-semibold text-jade">{{ sect.resources.herb.toLocaleString() }}</span>
          </div>
          <div class="bg-paper-deep/40 rounded p-1.5 text-center">
            <span class="text-ink-faint text-[10px] block">Đan dược</span>
            <span class="font-semibold text-cinnabar">{{ sect.resources.pills.toLocaleString() }} viên</span>
          </div>
        </div>
      </div>

      <!-- CƠ CẤU NHÂN SỰ & CÔNG PHÁP CHỦ TU -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
        <!-- Phân bố cấp bậc -->
        <div class="card-ink p-3 space-y-2">
          <span class="font-kai font-semibold text-ink block text-[12px]">Cơ Cấu Chức Vụ:</span>
          <div class="grid grid-cols-2 gap-1.5 text-ink-soft">
            <div>Lão Tổ: <strong class="text-ink">{{ rankCounts.ancestor }}</strong></div>
            <div>Tông Chủ: <strong class="text-ink">{{ rankCounts.master }}</strong></div>
            <div>Phó Tông Chủ: <strong class="text-ink">{{ rankCounts.vice_master }}</strong></div>
            <div>Hộ Pháp: <strong class="text-ink">{{ rankCounts.guardian }}</strong></div>
            <div>Trưởng Lão: <strong class="text-ink">{{ rankCounts.elder }}</strong></div>
            <div>Chân Truyền: <strong class="text-ink">{{ rankCounts.true }}</strong></div>
            <div>Nội Môn: <strong class="text-ink">{{ rankCounts.inner }}</strong></div>
            <div>Ngoại Môn: <strong class="text-ink">{{ rankCounts.outer }}</strong></div>
          </div>
        </div>

        <!-- Công pháp chủ tu & Phân bố cảnh giới -->
        <div class="card-ink p-3 space-y-2">
          <span class="font-kai font-semibold text-ink block text-[12px]">Công Pháp Chủ Tu:</span>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="gId in sect.majorGongfas || []"
              :key="gId"
              class="rounded bg-gold-ink/10 border border-gold-ink/30 px-2 py-0.5 text-gold-ink font-kai text-[11px]"
            >
              {{ displayGongfaName(gongfaDef(gId)?.name || gId) }}
            </span>
          </div>

          <div class="pt-1 border-t border-ink/10 space-y-1">
            <span class="font-kai font-semibold text-ink block text-[11px]">Phân Bố Cảnh Giới:</span>
            <div class="flex flex-wrap gap-1.5 text-[10px]">
              <span
                v-for="(count, rName) in realmDistribution"
                :key="rName"
                class="rounded bg-ink/5 px-2 py-0.5 border border-ink/10 text-ink-soft"
              >
                {{ rName }}: <strong class="text-ink">{{ count }}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- DANH SÁCH THÀNH VIÊN TÔNG MÔN ĐỐI THỦ -->
      <div class="space-y-2.5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="font-kai font-bold text-ink text-[13px]">
            Danh Sách Môn Hạ ({{ filteredMembers.length }}/{{ (sect.members || []).length }})
          </span>

          <div class="flex items-center gap-2">
            <input
              v-model="searchName"
              type="text"
              placeholder="Tìm theo tên..."
              class="w-28 rounded border border-ink/20 bg-paper px-2 py-0.5 text-[11px] text-ink"
            />
            <select
              v-model="selectedRankFilter"
              class="rounded border border-ink/20 bg-paper px-2 py-0.5 text-[11px] text-ink"
            >
              <option value="all">Tất cả cấp bậc</option>
              <option value="ancestor">Lão Tổ</option>
              <option value="master">Tông Chủ</option>
              <option value="vice_master">Phó Tông Chủ</option>
              <option value="guardian">Hộ Pháp</option>
              <option value="elder">Trưởng Lão</option>
              <option value="true">Chân Truyền</option>
              <option value="inner">Nội Môn</option>
              <option value="outer">Ngoại Môn</option>
            </select>
          </div>
        </div>

        <div v-if="filteredMembers.length === 0" class="card-ink p-6 text-center text-ink-faint text-[12px]">
          Không tìm thấy thành viên nào phù hợp bộ lọc.
        </div>

        <div v-else class="max-h-72 overflow-y-auto space-y-2 pr-1">
          <div
            v-for="m in filteredMembers"
            :key="m.id"
            class="card-ink p-2.5 flex items-center justify-between cursor-pointer transition-colors hover:border-cinnabar/40 hover:bg-ink/5"
            @click="$emit('inspectMember', m)"
          >
            <div class="flex items-center gap-2">
              <span
                class="rounded px-1.5 py-0.2 text-[9px] font-kai font-semibold border"
                :class="m.gender === 'female' ? 'border-cinnabar/40 bg-cinnabar/10 text-cinnabar' : 'border-azure/40 bg-azure/10 text-azure'"
              >
                {{ m.gender === 'female' ? 'Nữ' : 'Nam' }}
              </span>
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="font-kai font-bold text-ink text-[13px]">{{ m.name }}</span>
                  <span class="rounded bg-gold-ink/10 border border-gold-ink/20 px-1.5 py-0.2 text-[9px] font-kai text-gold-ink">
                    {{ SECT_RANK_NAMES[m.rank] ?? m.rank }}
                  </span>
                </div>
                <p class="text-[10px] text-ink-faint">
                  {{ REALMS[m.major]?.name ?? 'Luyện Khí' }} tầng {{ m.sub + 1 }} · Ngộ tính {{ m.comprehension }}
                </p>
              </div>
            </div>

            <div class="text-right shrink-0">
              <span class="text-[10px] text-cinnabar font-semibold underline block">Xem Hồ Sơ →</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-2">
        <button class="btn-ghost !px-5 !py-1.5 !text-[12px]" @click="$emit('close')">
          Đóng
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import BaseModal from '@/components/common/BaseModal.vue'
  import GameIcon from '@/components/common/GameIcon.vue'
  import { SECT_RANK_NAMES, type DiscipleData, type SectMemberRank, type WorldSectData } from '@/data/sect'
  import { REALMS } from '@/data/realms'
  import { gongfaDef } from '@/data/gongfa'
  import { displayGongfaName } from '@/ui/displayZhVi'

  const props = defineProps<{
    open: boolean
    sect: WorldSectData | null
  }>()

  defineEmits<{
    (e: 'close'): void
    (e: 'inspectMember', member: DiscipleData): void
  }>()

  const searchName = ref('')
  const selectedRankFilter = ref<string>('all')

  const rankCounts = computed(() => {
    const counts: Record<SectMemberRank, number> = {
      ancestor: 0,
      master: 0,
      vice_master: 0,
      guardian: 0,
      elder: 0,
      true: 0,
      inner: 0,
      outer: 0
    }
    for (const m of props.sect?.members || []) {
      if (m.rank in counts) {
        counts[m.rank]++
      }
    }
    return counts
  })

  const realmDistribution = computed(() => {
    const dist: Record<string, number> = {}
    for (const m of props.sect?.members || []) {
      const rName = REALMS[m.major]?.name ?? 'Luyện Khí'
      dist[rName] = (dist[rName] ?? 0) + 1
    }
    return dist
  })

  const filteredMembers = computed(() => {
    let list = props.sect?.members || []
    if (selectedRankFilter.value !== 'all') {
      list = list.filter(m => m.rank === selectedRankFilter.value)
    }
    if (searchName.value.trim()) {
      const q = searchName.value.trim().toLowerCase()
      list = list.filter(m => m.name.toLowerCase().includes(q))
    }
    return list
  })
</script>
