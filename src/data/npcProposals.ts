/**
 * Hệ thống Đề Nghị Chủ Động Từ NPC (NPC Autonomous Proposals System)
 *
 * Cho phép tu sĩ trong cửu giới chủ động gửi lời mời, thỉnh cầu,
 * thách đấu hoặc tặng quà đến nhân vật chính.
 */
import type { WorldNpcDef } from './npc'
import { rng, type RandomService } from '@/utils/random'

export type ProposalType =
  | 'daolu_pledge'      // Xin kết duyên Đạo lữ
  | 'dual_cultivate'    // Mời cùng Song tu
  | 'spar'              // Mời Tỉ thí luận kiếm
  | 'discuss'           // Mời Luận đạo
  | 'master_apprentice' // Xin bái người chơi làm sư phụ
  | 'recruit_disciple'  // Đề nghị nhận người chơi làm đồ đệ
  | 'gift_give'         // Chủ động tặng quà cho người chơi
  | 'gift_request'      // Xin người chơi trợ giúp tài nguyên
  | 'bounty_news'       // Báo tin cơ duyên / bí cảnh

export interface ProposalReward {
  type: 'stone' | 'exp' | 'wudao' | 'pill' | 'herb' | 'ore'
  amount?: number
  id?: string
  label: string
}

export interface ProposalCost {
  type: 'stone' | 'pill' | 'herb' | 'ore'
  amount: number
  id?: string
  label: string
}

export interface NpcProposal {
  id: string
  npcId: string
  type: ProposalType
  title: string
  message: string
  createdAtDay: number
  status: 'pending' | 'accepted' | 'rejected' | 'deferred'
  reward?: ProposalReward
  cost?: ProposalCost
}

export const PROPOSAL_TYPE_NAMES: Record<ProposalType, string> = {
  daolu_pledge: 'Kết Duyên Đạo Lữ',
  dual_cultivate: 'Cùng Nhau Song Tu',
  spar: 'Tỉ Thí Luận Kiếm',
  discuss: 'Đàm Đạo Huyền Cơ',
  master_apprentice: 'Xin Bái Sư Phụ',
  recruit_disciple: 'Thu Nhận Đồ Đệ',
  gift_give: 'Chủ Động Tặng Quà',
  gift_request: 'Thỉnh Cầu Trợ Giúp',
  bounty_news: 'Báo Tin Cơ Duyên'
}

/**
 * Sinh đề nghị chủ động từ một NPC dựa trên bối cảnh và quan hệ
 */
export function generateNpcProposal(
  npc: WorldNpcDef,
  playerMajor: number,
  playerGender: 'male' | 'female',
  currentDay: number,
  hasDaolu: boolean,
  customRng: RandomService = rng
): NpcProposal | null {
  const isOppositeGender = npc.gender !== playerGender
  const id = `prop_${npc.id}_${currentDay}_${customRng.int(100, 999)}`

  // 1. Nếu khác giới, chưa có đạo lữ, cảnh giới tương đương -> cơ hội kết duyên
  if (isOppositeGender && !hasDaolu && Math.abs(npc.major - playerMajor) <= 1 && customRng.chance(0.25)) {
    return {
      id,
      npcId: npc.id,
      type: 'daolu_pledge',
      title: 'Ngỏ Ý Kết Duyên Đạo Lữ',
      message: `【${npc.name}】đỏ mặt gửi gắm tâm thư: "Từ độ tao ngộ đạo hữu đến nay, tâm ta chẳng khi nào dứt nhớ nhung. Đại đạo độc hành gian nan vô tận, nguyện cùng đạo hữu kết tóc đồng tâm, chung đường sinh tử."`,
      createdAtDay: currentDay,
      status: 'pending'
    }
  }

  // 2. Mời Song Tu (khi khác giới và cảnh giới xấp xỉ)
  if (isOppositeGender && Math.abs(npc.major - playerMajor) <= 1 && customRng.chance(0.3)) {
    const expGain = (playerMajor + 1) * 1200
    return {
      id,
      npcId: npc.id,
      type: 'dual_cultivate',
      title: 'Mời Cùng Tĩnh Tọa Song Tu',
      message: `【${npc.name}】truyền âm: "Đêm nay trăng thanh gió mát, thiên địa linh khí quy tụ. Ta muốn cùng đạo hữu liên kết linh thức, cùng nhau thổ nạp song tu để củng cố đạo cơ."`,
      createdAtDay: currentDay,
      status: 'pending',
      reward: {
        type: 'exp',
        amount: expGain,
        label: `Tu vi +${expGain}`
      }
    }
  }

  // 3. Tỉ Thí Luận Kiếm (NPC tính cách bold hoặc kiếm tu hoặc thiên kiêu)
  if ((npc.temper === 'bold' || npc.lean === 'sword' || npc.tierRank === 'gold') && customRng.chance(0.35)) {
    return {
      id,
      npcId: npc.id,
      type: 'spar',
      title: 'Chiến Thư Luận Kiếm',
      message: `【${npc.name}】cầm kiếm đứng đợi: "Nghe danh đạo hữu kiếm thuật bất phàm, xuất thần nhập hóa. Hôm nay cơ duyên tao ngộ, tại hạ mạn phép thỉnh cầu tỉ thí một trận để mài giũa đạo tâm!"`,
      createdAtDay: currentDay,
      status: 'pending',
      reward: {
        type: 'wudao',
        amount: 3,
        label: 'Điểm Ngộ Đạo +3'
      }
    }
  }

  // 4. Bái Sư: Nếu người chơi có cảnh giới cao hơn NPC ít nhất 1 bậc
  if (playerMajor > npc.major && customRng.chance(0.25)) {
    return {
      id,
      npcId: npc.id,
      type: 'master_apprentice',
      title: 'Khẩn Cầu Bái Nhập Môn Hạ',
      message: `【${npc.name}】cung kính dập đầu: "Tiền bối đạo pháp tinh thâm, phong thái cái thế. Vãn bối tư chất thô lậu nhưng một lòng hướng đạo, tha thiết khẩn cầu tiền bối thu nhận làm đệ tử ký danh!"`,
      createdAtDay: currentDay,
      status: 'pending',
      reward: {
        type: 'stone',
        amount: (npc.major + 1) * 300,
        label: `Lễ bái sư: Linh Thạch +${(npc.major + 1) * 300}`
      }
    }
  }

  // 5. Thu Nhận Đồ Đệ: Nếu NPC có cảnh giới cao hơn người chơi ít nhất 1 bậc
  if (npc.major > playerMajor && customRng.chance(0.25)) {
    return {
      id,
      npcId: npc.id,
      type: 'recruit_disciple',
      title: 'Ý Muốn Thu Nhận Làm Đồ Đệ',
      message: `【${npc.name}】gật đầu khen ngợi: "Căn cốt ngươi thanh kỳ, linh đài sáng sủa, là hạt giống tu tiên hiếm có. Ngươi có nguyện bái ta làm sư phụ, theo ta tu tập chính tông đạo pháp chăng?"`,
      createdAtDay: currentDay,
      status: 'pending',
      reward: {
        type: 'exp',
        amount: (npc.major + 1) * 2000,
        label: `Truyền đạo thụ nghiệp: Tu vi +${(npc.major + 1) * 2000}`
      }
    }
  }

  // 6. Tặng Quà Chủ Động (khi NPC là Thiên Kiêu hoặc có duyên)
  if (customRng.chance(0.3)) {
    const giftTypes = ['stone', 'herb', 'ore', 'wudao'] as const
    const gType = customRng.pick(giftTypes)
    let reward: ProposalReward
    if (gType === 'stone') {
      const amount = (playerMajor + 1) * 250
      reward = { type: 'stone', amount, label: `Linh Thạch +${amount}` }
    } else if (gType === 'herb') {
      reward = { type: 'herb', amount: 5, label: 'Linh Thảo +5' }
    } else if (gType === 'ore') {
      reward = { type: 'ore', amount: 5, label: 'Huyền Thiết +5' }
    } else {
      reward = { type: 'wudao', amount: 2, label: 'Điểm Ngộ Đạo +2' }
    }

    return {
      id,
      npcId: npc.id,
      type: 'gift_give',
      title: 'Mang Lễ Vật Đến Tặng',
      message: `【${npc.name}】mỉm cười trao tặng: "Hôm trước ta du lịch sơn hà, may mắn thu được chút cơ duyên này, xin gửi tặng đạo hữu trợ lực trên bước đường tu hành."`,
      createdAtDay: currentDay,
      status: 'pending',
      reward
    }
  }

  // 7. Thỉnh Cầu Trợ Giúp (Xin linh thạch hoặc thảo dược)
  if (customRng.chance(0.25)) {
    const stoneCost = (playerMajor + 1) * 150
    return {
      id,
      npcId: npc.id,
      type: 'gift_request',
      title: 'Khẩn Cầu Hỗ Trợ Linh Thạch',
      message: `【${npc.name}】ngập ngừng cất lời: "Tại hạ tu luyện đến lúc then chốt, nhưng linh thạch trong tay chẳng may cạn kiệt. Mong đạo hữu hào phóng tương trợ, ân tình này tất khắc sâu."`,
      createdAtDay: currentDay,
      status: 'pending',
      cost: {
        type: 'stone',
        amount: stoneCost,
        label: `Linh Thạch ×${stoneCost}`
      },
      reward: {
        type: 'wudao',
        amount: 2,
        label: 'Điểm Ngộ Đạo +2 & Tăng hảo cảm'
      }
    }
  }

  // 8. Đàm Đạo Huyền Cơ
  return {
    id,
    npcId: npc.id,
    type: 'discuss',
    title: 'Mời Đàm Đạo Luận Pháp',
    message: `【${npc.name}】khoanh tay mỉm cười: "Tu đạo vô nhai, một mình ngẫm nghĩ khó tránh khỏi phiến diện. Rất mong được cùng đạo hữu ngồi lại uống chén thanh trà, đàm đạo huyền cơ."`,
    createdAtDay: currentDay,
    status: 'pending',
    reward: {
      type: 'wudao',
      amount: 1,
      label: 'Điểm Ngộ Đạo +1'
    }
  }
}
