/**
 * Dịch Vụ Sư Đồ & Chuyên Môn Trưởng Lão Tông Môn (Sect Mentorship & Elder Specialization Service)
 *
 * Quản lý cơ chế bái sư, dạy dỗ và phát triển đệ tử dưới quyền các Trưởng lão, Phó tông chủ và Hộ pháp:
 * 1. Giới hạn nghiêm ngặt: Mỗi người hướng dẫn tối đa 10 đệ tử dưới trướng.
 * 2. Nguồn đệ tử: Chỉ tuyển chọn từ đệ tử Ngoại môn hiện hữu, một đệ tử chỉ thuộc 1 người hướng dẫn.
 * 3. Bồi dưỡng hàng tháng: Sư phụ truyền thụ tu vi, công pháp và hưởng lợi ích theo chức danh chuyên môn (Đan Các, Luyện Khí, Chấp Sự, Truyền Công, Hình Phạt, Ngoại Vụ).
 * 4. Tranh giành đệ tử thiên kiêu: Phát sinh khi có đệ tử thiên kiêu chưa có sư phụ, phân định bằng giao đấu thực lực chiến đấu thực tế.
 */
import {
  MAX_MENTORED_PER_MASTER,
  ELDER_SPECIALTY_DEFS,
  gameMonthToCalendar,
  type DiscipleData,
  type ElderSpecialty,
  type SectHistoryEntry
} from '@/data/sect'
import { createDiscipleCombatSnap, nextSectUid } from './sectService'
import { simulateMentorTeachGongfa } from './npcGongfaService'
import { rng, type RandomService } from '@/utils/random'
import { toNum } from '@/utils/gnum'

export interface MentorshipDuelResult {
  occurred: boolean
  winnerId?: string
  winnerName?: string
  loserId?: string
  loserName?: string
  discipleId?: string
  discipleName?: string
  log?: SectHistoryEntry
}

/**
 * Kiểm tra xem một NPC có quyền thu nhận đệ tử dưới trướng hay không
 */
export function isEligibleMentor(disciple: DiscipleData): boolean {
  if (disciple.status === 'deceased') return false
  return disciple.rank === 'elder' || disciple.rank === 'vice_master' || disciple.rank === 'guardian'
}

/**
 * Lấy số lượng đệ tử hiện tại dưới trướng một người hướng dẫn
 */
export function getMentoredCount(mentor: DiscipleData, allDisciples: DiscipleData[]): number {
  if (mentor.mentoredDiscipleIds && mentor.mentoredDiscipleIds.length > 0) {
    return mentor.mentoredDiscipleIds.filter(id => {
      const d = allDisciples.find(x => x.id === id)
      return d && d.status !== 'deceased' && d.mentorElderId === mentor.id
    }).length
  }
  return allDisciples.filter(d => d.mentorElderId === mentor.id && d.status !== 'deceased').length
}

/**
 * Phân bổ hoặc thu nhận một đệ tử Ngoại môn vào dưới trướng người hướng dẫn
 */
export function assignDiscipleToMentor(
  mentorId: string,
  discipleId: string,
  disciples: DiscipleData[],
  currentMonth: number
): { success: boolean; message: string; historyEntry?: SectHistoryEntry } {
  const mentor = disciples.find(d => d.id === mentorId)
  const disciple = disciples.find(d => d.id === discipleId)

  if (!mentor || !isEligibleMentor(mentor)) {
    return { success: false, message: 'Người hướng dẫn không hợp lệ hoặc không đủ thẩm quyền.' }
  }

  if (!disciple || disciple.status === 'deceased') {
    return { success: false, message: 'Đệ tử không tồn tại hoặc đã tạ thế.' }
  }

  if (disciple.rank !== 'outer') {
    return { success: false, message: 'Chỉ đệ tử Ngoại môn mới có thể được thu nhận vào dưới trướng rèn giũa.' }
  }

  if (disciple.mentorElderId && disciple.mentorElderId !== mentorId) {
    const oldMentor = disciples.find(d => d.id === disciple.mentorElderId)
    return {
      success: false,
      message: `Đệ tử này hiện đã thuộc quyền hướng dẫn của【${oldMentor?.name || 'Vị khác'}】.`
    }
  }

  const currentCount = getMentoredCount(mentor, disciples)
  if (currentCount >= MAX_MENTORED_PER_MASTER) {
    return {
      success: false,
      message: `【${mentor.name}】đã thu nhận đủ ${MAX_MENTORED_PER_MASTER} đệ tử dưới trướng, không thể thu nhận thêm!`
    }
  }

  // Cập nhật quan hệ sư đồ
  disciple.mentorElderId = mentor.id
  mentor.mentoredDiscipleIds = mentor.mentoredDiscipleIds || []
  if (!mentor.mentoredDiscipleIds.includes(disciple.id)) {
    mentor.mentoredDiscipleIds.push(disciple.id)
  }

  const { year, month } = gameMonthToCalendar(currentMonth)
  const specialtyTitle = mentor.elderSpecialty ? ELDER_SPECIALTY_DEFS[mentor.elderSpecialty].title : 'Trưởng Lão'
  const summary = `Tháng ${month}, năm thứ ${year} —【${specialtyTitle} · ${mentor.name}】chính thức thu nhận đệ tử Ngoại môn【${disciple.name}】vào dưới trướng trực tiếp dạy dỗ.`

  const entry: SectHistoryEntry = {
    id: nextSectUid('hist'),
    gameMonth: currentMonth,
    year,
    month,
    category: 'personnel',
    discipleId: disciple.id,
    discipleName: disciple.name,
    summary
  }

  return {
    success: true,
    message: `Đã phân bổ đệ tử ${disciple.name} vào dưới trướng ${mentor.name}!`,
    historyEntry: entry
  }
}

/**
 * Rời khỏi hoặc hủy quan hệ sư đồ
 */
export function removeDiscipleFromMentor(
  discipleId: string,
  disciples: DiscipleData[]
): { success: boolean; message: string } {
  const disciple = disciples.find(d => d.id === discipleId)
  if (!disciple || !disciple.mentorElderId) {
    return { success: false, message: 'Đệ tử chưa có người hướng dẫn.' }
  }

  const mentor = disciples.find(d => d.id === disciple.mentorElderId)
  if (mentor && mentor.mentoredDiscipleIds) {
    mentor.mentoredDiscipleIds = mentor.mentoredDiscipleIds.filter(id => id !== discipleId)
  }
  disciple.mentorElderId = undefined

  return { success: true, message: `Đã hủy quan hệ trực thuộc của đệ tử ${disciple.name}.` }
}

/**
 * Gán chức danh chuyên môn cho Trưởng lão
 */
export function assignElderSpecialty(
  elderId: string,
  specialty: ElderSpecialty,
  disciples: DiscipleData[]
): { success: boolean; message: string } {
  const elder = disciples.find(d => d.id === elderId)
  if (!elder || elder.rank !== 'elder') {
    return { success: false, message: 'Chỉ Trưởng lão mới có thể phân nhiệm chức danh chuyên môn.' }
  }

  elder.elderSpecialty = specialty
  const specDef = ELDER_SPECIALTY_DEFS[specialty]
  return {
    success: true,
    message: `Đã bổ nhiệm ${elder.name} làm【${specDef.title}】!`
  }
}

/**
 * Tự động gán chức danh chuyên môn ngẫu nhiên phù hợp cho các Trưởng lão chưa có chức danh
 */
export function autoAssignMissingElderSpecialties(disciples: DiscipleData[], customRng: RandomService = rng): void {
  const specialties: ElderSpecialty[] = ['dan', 'craft', 'affairs', 'arts', 'discipline', 'external']
  for (const d of disciples) {
    if (d.rank === 'elder' && !d.elderSpecialty) {
      if (d.lean === 'alchemy') d.elderSpecialty = 'dan'
      else if (d.lean === 'sword') d.elderSpecialty = 'discipline'
      else if (d.element === 'metal') d.elderSpecialty = 'craft'
      else if (d.element === 'wood') d.elderSpecialty = 'dan'
      else if (d.comprehension >= 80) d.elderSpecialty = 'arts'
      else {
        d.elderSpecialty = customRng.pick(specialties) || 'affairs'
      }
    }
  }
}

/**
 * Mô phỏng quá trình dạy dỗ và bồi dưỡng đệ tử hàng tháng từ các sư phụ
 */
export function simulateMonthlyMentorshipTeaching(
  disciples: DiscipleData[],
  currentMonth: number,
  customRng: RandomService = rng
): SectHistoryEntry[] {
  const events: SectHistoryEntry[] = []
  const { year, month } = gameMonthToCalendar(currentMonth)

  // Đảm bảo các Trưởng lão đều có chức danh chuyên môn
  autoAssignMissingElderSpecialties(disciples, customRng)

  const mentors = disciples.filter(d => isEligibleMentor(d))

  for (const mentor of mentors) {
    const mentoredDisciples = disciples.filter(
      d => d.mentorElderId === mentor.id && d.status !== 'deceased' && d.rank === 'outer'
    )
    if (mentoredDisciples.length === 0) continue

    const spec = mentor.elderSpecialty

    for (const disciple of mentoredDisciples) {
      // 1. Gia tốc tu vi cơ bản từ sư phụ
      const realmGap = Math.max(0, mentor.major - disciple.major)
      let bonusExp = 8 + realmGap * 4
      if (spec === 'arts') bonusExp += 6 // Trưởng lão Truyền Công tăng tốc tu vi

      disciple.expPct = Math.min(100, disciple.expPct + bonusExp)

      // 2. Lợi ích đặc thù theo chuyên môn
      if (spec === 'dan') {
        // Trưởng lão Đan Các: Hỗ trợ phá giải bình cảnh khi đệ tử nghẽn lại
        if (disciple.status === 'bottleneck' && customRng.chance(0.6)) {
          disciple.status = 'idle'
          disciple.expPct = 20
          events.push({
            id: nextSectUid('hist'),
            gameMonth: currentMonth,
            year,
            month,
            category: 'cultivation',
            discipleId: disciple.id,
            discipleName: disciple.name,
            summary: `Tháng ${month}, năm thứ ${year} —【Đan Các · ${mentor.name}】ban tặng ngưng khí đan, giúp đệ tử ${disciple.name} thuận lợi phá vỡ bình cảnh tu hành!`
          })
        }
      } else if (spec === 'affairs') {
        // Trưởng lão Chấp Sự: Tăng điểm cống hiến sự vụ
        const extraPts = customRng.int(10, 20)
        disciple.totalContributions = (disciple.totalContributions ?? 0) + extraPts
        disciple.contributionPoints = (disciple.contributionPoints ?? 0) + extraPts
      } else if (spec === 'discipline') {
        // Trưởng lão Hình Phạt: Trừ khử tà niệm, tâm tính kiên định
        if (disciple.status === 'demonic') {
          disciple.status = 'idle'
          events.push({
            id: nextSectUid('hist'),
            gameMonth: currentMonth,
            year,
            month,
            category: 'cultivation',
            discipleId: disciple.id,
            discipleName: disciple.name,
            summary: `Tháng ${month}, năm thứ ${year} —【Hình Phạt · ${mentor.name}】dùng thanh quy pháp giới trục xuất ma khí, cứu đệ tử ${disciple.name} thoát khỏi hiểm cảnh nhập ma!`
          })
        }
      } else if (spec === 'external') {
        // Trưởng lão Ngoại Vụ: Rèn luyện thực chiến, tăng tầng tháp
        if (customRng.chance(0.35)) {
          disciple.towerFloor = (disciple.towerFloor || 0) + 1
          disciple.battlesWon = (disciple.battlesWon || 0) + 1
        }
      }

      // 3. Truyền thụ công pháp
      const teachRes = simulateMentorTeachGongfa(mentor, disciple, customRng)
      if (teachRes.success && teachRes.gongfa) {
        disciple.learnedGongfa = [...disciple.learnedGongfa, teachRes.gongfa.id]
        disciple.gongfaOrigins = disciple.gongfaOrigins || {}
        disciple.gongfaOrigins[teachRes.gongfa.id] = 'inherited'

        events.push({
          id: nextSectUid('hist'),
          gameMonth: currentMonth,
          year,
          month,
          category: 'cultivation',
          discipleId: disciple.id,
          discipleName: disciple.name,
          summary: `Tháng ${month}, năm thứ ${year} — Sư phụ【${mentor.name}】tận tâm truyền thụ bí kíp【${teachRes.gongfa.name}】cho đệ tử ${disciple.name}!`
        })
      }
    }
  }

  return events
}

/**
 * Mô phỏng sự kiện Tranh Giành Đệ Tử Thiên Kiêu giữa các Trưởng Lão:
 * - Điều kiện phát sinh thực tế: Có đệ tử Ngoại môn Thiên Kiêu (Vàng/Bạc hoặc Ngộ tính >= 80) chưa có sư phụ.
 * - Có ít nhất 2 người hướng dẫn còn chỗ trống (< 10).
 * - Kết quả phân định bằng giao đấu thực lực chiến đấu thực tế (ATK, DEF, HP quy đổi).
 * - Chỉ phát sinh tối đa 1 vụ tranh giành trong tháng để tạo sự kiện điểm nhấn, không gây spam thông báo.
 */
export function simulateProdigyContention(
  disciples: DiscipleData[],
  currentMonth: number,
  customRng: RandomService = rng
): MentorshipDuelResult {
  // 1. Tìm đệ tử thiên kiêu chưa có sư phụ
  const unmentoredProdigies = disciples.filter(
    d =>
      d.status !== 'deceased' &&
      d.rank === 'outer' &&
      !d.mentorElderId &&
      (d.tierRank === 'gold' || d.tierRank === 'silver' || d.comprehension >= 80)
  )

  if (unmentoredProdigies.length === 0) {
    return { occurred: false }
  }

  // 2. Tìm các người hướng dẫn còn chỗ trống (< 10 đệ tử)
  const availableMentors = disciples.filter(
    m => isEligibleMentor(m) && getMentoredCount(m, disciples) < MAX_MENTORED_PER_MASTER
  )

  if (availableMentors.length < 2) {
    return { occurred: false }
  }

  // 3. Chọn ngẫu nhiên 1 đệ tử thiên kiêu nổi bật nhất
  const sortedProdigies = [...unmentoredProdigies].sort((a, b) => {
    const scoreA = (a.tierRank === 'gold' ? 100 : 50) + a.comprehension
    const scoreB = (b.tierRank === 'gold' ? 100 : 50) + b.comprehension
    return scoreB - scoreA
  })
  const prodigy = sortedProdigies[0]!

  // 4. Chọn 2 Trưởng lão tranh giành (ưu tiên những người có tương đồng linh căn hoặc sở trường)
  const candidateMentors = [...availableMentors].sort((a, b) => {
    const matchA = a.element === prodigy.element ? 2 : 0
    const matchB = b.element === prodigy.element ? 2 : 0
    return matchB - matchA
  })

  const mentorA = candidateMentors[0]!
  const mentorB = candidateMentors[1]!

  // 5. Giao đấu luận kiếm thực tế dựa trên chiến lực của hai vị trưởng lão
  const snapA = createDiscipleCombatSnap(mentorA)
  const snapB = createDiscipleCombatSnap(mentorB)

  const powerA = toNum(snapA.attack) * 1.5 + toNum(snapA.defense) * 1.2 + toNum(snapA.maxHp) * 0.1
  const powerB = toNum(snapB.attack) * 1.5 + toNum(snapB.defense) * 1.2 + toNum(snapB.maxHp) * 0.1

  // Tính may rủi nhỏ trong giao đấu (5% dao động)
  const duelScoreA = powerA * (0.95 + customRng.float(0, 0.1))
  const duelScoreB = powerB * (0.95 + customRng.float(0, 0.1))

  const winner = duelScoreA >= duelScoreB ? mentorA : mentorB
  const loser = winner === mentorA ? mentorB : mentorA

  // 6. Gán đệ tử cho người chiến thắng
  prodigy.mentorElderId = winner.id
  winner.mentoredDiscipleIds = winner.mentoredDiscipleIds || []
  if (!winner.mentoredDiscipleIds.includes(prodigy.id)) {
    winner.mentoredDiscipleIds.push(prodigy.id)
  }

  const { year, month } = gameMonthToCalendar(currentMonth)
  const titleW = winner.elderSpecialty ? ELDER_SPECIALTY_DEFS[winner.elderSpecialty].title : 'Trưởng Lão'
  const titleL = loser.elderSpecialty ? ELDER_SPECIALTY_DEFS[loser.elderSpecialty].title : 'Trưởng Lão'

  const tierText = prodigy.tierRank === 'gold' ? 'Thiên Kiêu Vàng' : prodigy.tierRank === 'silver' ? 'Thiên Kiêu Bạc' : 'kỳ tài ngộ tính cao'

  const summary = `Tháng ${month}, năm thứ ${year} — [Tranh Giành Đệ Tử] Nhận thấy đệ tử ${prodigy.name} (${tierText}) tư chất phi phàm, cả【${titleW} · ${winner.name}】lẫn【${titleL} · ${loser.name}】cùng muốn nhận vào dưới trướng. Đôi bên ước định tỉ thí tại Diễn Võ Trường... Sau trăm hiệp kịch chiến, ${winner.name} thắng nửa chiêu, chính thức thu nhận ${prodigy.name} làm đồ đệ chân truyền!`

  const logEntry: SectHistoryEntry = {
    id: nextSectUid('hist'),
    gameMonth: currentMonth,
    year,
    month,
    category: 'personnel',
    discipleId: prodigy.id,
    discipleName: prodigy.name,
    summary
  }

  return {
    occurred: true,
    winnerId: winner.id,
    winnerName: winner.name,
    loserId: loser.id,
    loserName: loser.name,
    discipleId: prodigy.id,
    discipleName: prodigy.name,
    log: logEntry
  }
}
