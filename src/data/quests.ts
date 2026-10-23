/** 主线任务链与每日任务 */
import type { QuestDef } from '@/types'

/** 主线任务:按顺序逐个推进,自动完成自动发奖 */
export const MAIN_QUESTS: QuestDef[] = [
  {
    id: 'q_start',
    name: 'Bước Lên Tiên Đồ',
    desc: 'Đột phá tới Luyện Khí tầng ba',
    cond: { type: 'custom', key: 'realm_0_2' },
    reward: { stoneTier: 15, herb: 10 }
  },
  {
    id: 'q_explore',
    name: 'Sơ Xuất Mao Lư',
    desc: 'Hoàn thành 1 lần lịch luyện',
    cond: { type: 'counter', key: 'explores', value: 1 },
    reward: { stoneTier: 20, page: 6 }
  },
  {
    id: 'q_kill10',
    name: 'Trảm Yêu Trừ Ma',
    desc: 'Đánh bại 10 kẻ địch',
    cond: { type: 'counter', key: 'kills', value: 10 },
    reward: { stoneTier: 25, dust: 8 }
  },
  {
    id: 'q_equip',
    name: 'Phi Quải Thượng Trận',
    desc: 'Nhận được 5 món trang bị',
    cond: { type: 'counter', key: 'equipsGained', value: 5 },
    reward: { stoneTier: 25, dust: 10 }
  },
  {
    id: 'q_lianqi9',
    name: 'Luyện Khí Viên Mãn',
    desc: 'Tu tới Luyện Khí viên mãn',
    cond: { type: 'custom', key: 'realm_0_9' },
    reward: { stoneTier: 40, herb: 20 }
  },
  { id: 'q_zhuji', name: 'Trúc Cơ Vấn Đạo', desc: 'Đột phá tới Trúc Cơ cảnh', cond: { type: 'realm', major: 1 }, reward: { stoneTier: 60, wudao: 10 } },
  {
    id: 'q_gongfa',
    name: 'Bác Lãm Đạo Tàng',
    desc: 'Học được 3 bộ công pháp',
    cond: { type: 'counter', key: 'gongfaLearned', value: 3 },
    reward: { page: 20, wudao: 8 }
  },
  {
    id: 'q_building',
    name: 'Kinh Doanh Động Phủ',
    desc: 'Tích lũy nâng cấp kiến trúc 5 lần',
    cond: { type: 'counter', key: 'buildingUpgrades', value: 5 },
    reward: { stoneTier: 50, ore: 20 }
  },
  { id: 'q_pill', name: 'Đan Đạo Sơ Khuy', desc: 'Luyện chế 5 viên đan dược', cond: { type: 'counter', key: 'pillsCrafted', value: 5 }, reward: { herb: 30 } },
  {
    id: 'q_boss3',
    name: 'Tảo Đãng Quần Yêu',
    desc: 'Đánh bại 3 thủ lĩnh khu vực',
    cond: { type: 'counter', key: 'bossKills', value: 3 },
    reward: { stoneTier: 80, wudao: 15 }
  },
  { id: 'q_jindan', name: 'Kim Đan Đại Đạo', desc: 'Đột phá tới Kim Đan cảnh', cond: { type: 'realm', major: 2 }, reward: { stoneTier: 100, wudao: 25 } },
  {
    id: 'q_upgrade20',
    name: 'Thiên Chùy Bách Luyện',
    desc: 'Tích lũy cường hóa trang bị 20 lần',
    cond: { type: 'counter', key: 'upgrades', value: 20 },
    reward: { dust: 40 }
  },
  { id: 'q_yuanying', name: 'Nguyên Anh Chi Lộ', desc: 'Đột phá tới Nguyên Anh cảnh', cond: { type: 'realm', major: 3 }, reward: { stoneTier: 150, wudao: 40 } },
  {
    id: 'q_boss10',
    name: 'Uy Chấn Chư Vực',
    desc: 'Đánh bại 10 thủ lĩnh khu vực',
    cond: { type: 'counter', key: 'bossKills', value: 10 },
    reward: { stoneTier: 200, wudao: 50 }
  },
  { id: 'q_huashen', name: 'Vấn Đỉnh Hóa Thần', desc: 'Đột phá tới Hóa Thần cảnh', cond: { type: 'realm', major: 4 }, reward: { stoneTier: 300, wudao: 80 } },

  // ---- 人间界后期:主线一路铺到飞升 ----
  {
    id: 'q_boss20',
    name: 'Đạp Bình Yêu Đình',
    desc: 'Đánh bại 20 thủ lĩnh khu vực',
    cond: { type: 'counter', key: 'bossKills', value: 20 },
    reward: { stoneTier: 350, wudao: 90, dust: 60 }
  },
  { id: 'q_lianxu', name: 'Luyện Hư Phản Chân', desc: 'Đột phá tới Luyện Hư cảnh', cond: { type: 'realm', major: 5 }, reward: { stoneTier: 420, wudao: 110 } },
  { id: 'q_heti', name: 'Thân Đạo Tương Hợp', desc: 'Đột phá tới Hợp Thể cảnh', cond: { type: 'realm', major: 6 }, reward: { stoneTier: 520, wudao: 140 } },
  { id: 'q_dacheng', name: 'Đại Đạo Tương Thành', desc: 'Đột phá tới Đại Thừa cảnh', cond: { type: 'realm', major: 7 }, reward: { stoneTier: 640, wudao: 180 } },
  { id: 'q_dujie', name: 'Cửu Trọng Lôi Hải', desc: 'Đột phá tới Độ Kiếp cảnh', cond: { type: 'realm', major: 8 }, reward: { stoneTier: 800, wudao: 220 } },
  {
    id: 'q_zhenxian',
    name: 'Phi Thăng Tiên Giới',
    desc: 'Vượt qua thiên môn, chứng đắc Chân Tiên —— Từ nay về sau, trời không còn là đỉnh',
    cond: { type: 'realm', major: 9 },
    reward: { stoneTier: 1000, wudao: 300 }
  },
  // ---- 仙界 ----
  { id: 'q_xuanxian', name: 'Huyền Chi Hựu Huyền', desc: 'Đột phá tới Huyền Tiên cảnh', cond: { type: 'realm', major: 10 }, reward: { stoneTier: 1200, wudao: 360 } },
  { id: 'q_jinxian', name: 'Kim Tính Bất Hủ', desc: 'Đột phá tới Kim Tiên cảnh', cond: { type: 'realm', major: 11 }, reward: { stoneTier: 1450, wudao: 430 } },
  { id: 'q_taiyi', name: 'Thái Ất Cận Đạo', desc: 'Đột phá tới Thái Ất cảnh', cond: { type: 'realm', major: 12 }, reward: { stoneTier: 1750, wudao: 520 } },
  { id: 'q_daluo', name: 'Đại La Tiêu Dao', desc: 'Đột phá tới Đại La cảnh', cond: { type: 'realm', major: 13 }, reward: { stoneTier: 2100, wudao: 620 } },
  // ---- 神界 ----
  {
    id: 'q_shenren',
    name: 'Phá Giới Nhập Thần',
    desc: 'Từ Tiên Giới bước vào Thần Giới, chứng đắc Thần Nhân cảnh',
    cond: { type: 'realm', major: 14 },
    reward: { stoneTier: 2500, wudao: 750 }
  },
  { id: 'q_shenjiang', name: 'Đại Thiên Hành Phạt', desc: 'Đột phá tới Thần Tướng cảnh', cond: { type: 'realm', major: 15 }, reward: { stoneTier: 2900, wudao: 900 } },
  { id: 'q_shenwang', name: 'Thần Vực Chi Chủ', desc: 'Đột phá tới Thần Vương cảnh', cond: { type: 'realm', major: 16 }, reward: { stoneTier: 3400, wudao: 1080 } },
  { id: 'q_shendi', name: 'Thần Đế Lâm Trần', desc: 'Đột phá tới Thần Đế cảnh', cond: { type: 'realm', major: 17 }, reward: { stoneTier: 4000, wudao: 1300 } },
  // ---- 混沌海 ----
  {
    id: 'q_hundunling',
    name: 'Quy Phản Hỗn Độn',
    desc: 'Bước vào Hỗn Độn Hải, chứng đắc Hỗn Độn Chân Linh',
    cond: { type: 'realm', major: 18 },
    reward: { stoneTier: 4800, wudao: 1600 }
  },
  { id: 'q_hundunshenmo', name: 'Khai Thiên Tích Địa', desc: 'Đột phá tới Hỗn Độn Thần Ma cảnh', cond: { type: 'realm', major: 19 }, reward: { stoneTier: 5700, wudao: 1950 } },
  {
    id: 'q_hundundaozu',
    name: 'Vạn Đạo Chi Tổ',
    desc: 'Chứng đạo Hỗn Độn Đạo Tổ —— Đi tới đây, con đường này mới thực sự đến hồi viên mãn',
    cond: { type: 'realm', major: 20 },
    reward: { stoneTier: 7000, wudao: 2400 }
  }
]

export interface DailyTaskDef {
  id: string
  name: string
  desc: string
  counterKey: 'kills' | 'pillsUsed' | 'explores' | 'breakthroughs'
  target: number
  reward: QuestDef['reward']
}

/** 每日任务:按当日计数器增量结算 */
export const DAILY_TASKS: DailyTaskDef[] = [
  { id: 'd_kill', name: 'Hằng Ngày Trảm Yêu', desc: 'Hôm nay đánh bại 15 kẻ địch', counterKey: 'kills', target: 15, reward: { stoneTier: 20 } },
  { id: 'd_pill', name: 'Hằng Ngày Dùng Thuốc', desc: 'Hôm nay dùng 1 viên đan dược', counterKey: 'pillsUsed', target: 1, reward: { herb: 8 } },
  { id: 'd_explore', name: 'Hằng Ngày Lịch Luyện', desc: 'Hôm nay hoàn thành 1 lần lịch luyện', counterKey: 'explores', target: 1, reward: { wudao: 4 } }
]
