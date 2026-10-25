/**
 * Kiểm tra việc kế thừa qua luân hồi
 *
 * Xuất phát từ phản hồi của người chơi: "Số lần luân hồi quá nhiều nhưng không có ý nghĩa". Chẩn đoán chỉ ra một điều:
 * Nếu luân hồi không tạo ra cái giá phải trả, nó sẽ thoái hóa thành New Game+ theo kiểu "kế thừa bản lưu rồi chạy lại từ đầu".
 *
 * Mô-đun này chỉ thực hiện đo lường, không thay đổi bất kỳ chỉ số nào —— trước hết lượng hóa
 * "sau khi người chơi luân hồi một đời thì rốt cuộc còn cần phải trải nghiệm lại bao nhiêu",
 * sau đó mới bàn đến việc cắt giảm những gì.
 *
 * Nguyên tắc cốt lõi (dùng làm tiêu chí phán đoán): **Giữ lại "ta là ai", đặt lại "ta hiện có bao nhiêu".**
 *   Di sản được kế thừa (nên kế thừa) = Ký ức / Tinh thần / Linh hồn: Nhận thức và đan phương, lý lịch và thành tựu, Đạo quả và thiên phú cùng túc tuệ,
 *     Danh hiệu (vinh dự), Sư thừa (đạo thống), Đạo nguyên và đạo ngân, Ký ức thế giới (tư cách trấn áp / kẻ thù truyền kiếp / lựa chọn cơ duyên)
 *   Trạng thái (nên xây dựng lại) = Thể xác / Ngoại vật: Cảnh giới và tu vi, linh thạch và linh tài, trang bị và pháp bảo, đan dược,
 *     linh thú, công trình động phủ, đầu tư linh mạch, tiến độ khu vực, giới vực kiếp này, bí cảnh/sự kiện đang diễn ra, chuỗi thắng
 *
 * Danh sách này yêu cầu **tối thiểu đầy đủ**: Bất kỳ tính năng nào có quyết định giữ lại hay đặt lại qua các đời đều phải đăng ký một dòng tại đây (xem samsaraAudit.spec
 * mục "độ bao phủ"), không để lại trạng thái dở dang, cũng không bỏ sót bất kỳ hệ thống con nào.
 *
 * Chỉ số đo lường then chốt không phải là "chiến lực lúc sinh ra kế thừa được bao nhiêu" —— cảnh giới từ Chân Tiên rơi về Luyện Khí, chiến lực xuất sinh tất nhiên cực thấp.
 * Điều thực sự quyết định luân hồi có ý nghĩa hay không là **Thời gian đuổi kịp**: Đời thứ N cần bao lâu để tu luyện lại đến điểm kết thúc của đời trước.
 * Nếu đời thứ 10 chỉ tốn một phần nhỏ của đời thứ 1, thì đời đó coi như không còn gì gọi là "trải nghiệm lại".
 *
 * ⚠ Cảnh báo quy chuẩn (saveCalibration đã kiểm chứng bằng bản lưu thực tế):
 * hoursToPeakAt của mô-đun này được xây dựng trên progressionSim, mà progressionSim lại **được ước tính cao hơn khoảng 100~400 lần** ——
 * nó tính toán "cần bao nhiêu giây để thuần túy tích lũy tu vi", trong khi tu vi thực tế của người chơi phần lớn đến từ chiến đấu, sự kiện,
 * đan dược và lợi ích ngoại tuyến. Đồng thời nó giả định "mỗi đời đều tu đầy Chân Tiên", trong khi người chơi thực tế chuyển thế trong khoảng Nguyên Anh đến Hợp Thể.
 *
 * Do đó: **Tỷ lệ có thể dùng, giá trị tuyệt đối không thể dùng.**
 *   Đáng tin cậy: Đời thứ N ÷ Đời thứ 1, mức độ hiện thực hóa, lợi ích biên —— sai số cùng một hệ số, khi chia sẽ bị triệt tiêu
 *   Không dùng: Bất kỳ kết quả nào ghi "Đời thứ N cần X giờ"
 * Trước khi trích dẫn kết luận về thời lượng tuyệt đối từ mô-đun này, hãy xem saveCalibration.spec.ts trước.
 */
import { DAO_FRUIT_COMBAT_BONUS, TALENT_DRAW_DIV } from '@/data/constants'
import { TALENTS } from '@/data/talents'
import { REBIRTH_REFERENCE_MAJOR } from '@/data/realms'
import type { StatMods } from '@/types'
import { daoFruitGain } from './formulas'
import { effectiveDaoFruit } from './statsCalc'
import { hoursToReach, type SimAssumptions } from './progressionSim'

/** Phương thức kế thừa */
export type HeritageMode = 'full' | 'partial' | 'reset'

export interface HeritageRow {
  id: string
  name: string
  mode: HeritageMode
  /** Xử lý thực tế trong mã nguồn (đã kiểm chứng, không theo tài liệu thiết kế) */
  detail: string
  /** Thuộc về "Di sản" (ta là ai) hay "Trạng thái" (ta sở hữu bao nhiêu) */
  kind: 'legacy' | 'state'
  /** Đóng góp trực tiếp vào chiến lực: none / low / mid / high */
  power: 'none' | 'low' | 'mid' | 'high'
  /** Có thu hẹp không gian tăng trưởng của đời kế tiếp hay không —— cột này mới là trọng tâm cần theo dõi */
  compressesGrowth: boolean
}

/**
 * Danh sách kế thừa thực tế hiện tại.
 * Đối chiếu xác thực từng mục với confirmReincarnation, không dựa vào tài liệu thiết kế hay ký ức.
 */
export const HERITAGE: HeritageRow[] = [
  {
    id: 'realm',
    name: 'Cảnh giới và tu vi',
    mode: 'reset',
    detail: 'rebirth() đưa major/sub/exp về 0, tuổi trở lại START_AGE',
    kind: 'state',
    power: 'high',
    compressesGrowth: false
  },
  {
    id: 'equipment',
    name: 'Trang bị',
    mode: 'reset',
    detail: 'items = [] và equipped = {}, trang bị trên thân và hành trang cùng xóa sạch',
    kind: 'state',
    power: 'high',
    compressesGrowth: false
  },
  {
    id: 'pills',
    name: 'Đan dược',
    mode: 'reset',
    detail: 'pills = {}',
    kind: 'state',
    power: 'mid',
    compressesGrowth: false
  },
  {
    id: 'artifacts',
    name: 'Pháp bảo',
    mode: 'reset',
    detail: 'artifacts = [] và equippedArtifacts = []',
    kind: 'state',
    power: 'high',
    compressesGrowth: false
  },
  {
    id: 'materials',
    name: 'Nguyên liệu và linh thạch',
    mode: 'reset',
    detail: 'spiritStone/qi/wudao/herb/ore/page/dust toàn bộ đặt về không',
    kind: 'state',
    power: 'low',
    compressesGrowth: false
  },
  {
    id: 'regions',
    name: 'Tiến độ khu vực',
    mode: 'reset',
    detail: 'unlocked lùi về qingyun, cleared xóa sạch',
    kind: 'state',
    power: 'none',
    compressesGrowth: false
  },
  {
    id: 'buildings',
    name: 'Công trình động phủ',
    mode: 'reset',
    detail: 'dongfu.resetForRebirth() đưa cấp mỗi công trình về 0 —— nhà cửa là ngoại vật, tan biến cùng thể xác',
    kind: 'state',
    power: 'mid',
    compressesGrowth: false
  },
  {
    id: 'gongfa',
    name: 'Công pháp',
    mode: 'partial',
    detail: 'Nhớ những công pháp (môn loại) nào là ký ức, giữ lại; luyện tới tầng mấy là tiến độ tu vi, đặt về không trở lại tầng 1; túc tuệ đỉnh giai có thể giữ lại một môn mãn tầng',
    kind: 'state',
    power: 'high',
    compressesGrowth: true
  },
  {
    id: 'daoFruit',
    name: 'Đạo quả',
    mode: 'full',
    detail: `Mỗi đời ngưng tụ ${daoFruitGain(REBIRTH_REFERENCE_MAJOR, 9)} quả (tu đầy nhân gian giới và phi thăng Chân Tiên), vĩnh viễn không đặt về không`,
    kind: 'legacy',
    power: 'high',
    compressesGrowth: true
  },
  {
    id: 'talents',
    name: 'Tư chất tiên thiên',
    mode: 'full',
    detail: `Mỗi đời nhận 1 + major/${TALENT_DRAW_DIV} mục, tổng cộng ${TALENTS.length} mục có thể thu thập đủ`,
    kind: 'legacy',
    power: 'high',
    compressesGrowth: true
  },
  {
    id: 'heritage',
    name: 'Túc mệnh truyền thừa',
    mode: 'full',
    detail: 'reincarnation.heritage cùng thần hồn bất diệt, qua các đời không đặt về không; mỗi đời tối đa trui rèn một ngưỡng sâu nhất chưa nhập môn (xem core/heritageForge), trui rèn trùng lặp bị bỏ qua',
    kind: 'legacy',
    power: 'none',
    compressesGrowth: false
  },
  {
    id: 'insight',
    name: 'Túc tuệ',
    mode: 'full',
    detail: 'Quyết định giai vị, ảnh hưởng mức giữ lại công pháp và lượng bù đắp nhận thức; không trực tiếp tăng chiến lực',
    kind: 'legacy',
    power: 'none',
    compressesGrowth: true
  },
  {
    id: 'title',
    name: 'Danh hiệu',
    mode: 'full',
    detail: 'rebirth() không đặt lại titleId, mods danh hiệu trực tiếp mang vào đời sau',
    kind: 'state',
    power: 'mid',
    compressesGrowth: true
  },
  {
    id: 'pet',
    name: 'Linh thú',
    mode: 'reset',
    detail: 'rebirth() gọi setPet(null) —— linh thú là ngoại vật đồng hành, đời sau sẽ làm quen với linh thú mới',
    kind: 'state',
    power: 'mid',
    compressesGrowth: false
  },
  {
    id: 'mentor',
    name: 'Sư thừa',
    mode: 'full',
    detail: 'rebirth() không đặt lại mentor, mods sư thừa trực tiếp mang vào đời sau',
    kind: 'state',
    power: 'mid',
    compressesGrowth: true
  },
  {
    id: 'veins',
    name: 'Đầu tư linh mạch',
    mode: 'reset',
    detail: 'dongfu.resetForRebirth() xóa sạch veinPoints/veinMain —— đầu tư linh mạch là ngoại vật, mỗi đời đầu tư lại từ đầu (bản thảo cũ từng cho phép giữ lại qua các đời sau khi đầu tư đầy)',
    kind: 'state',
    power: 'mid',
    compressesGrowth: false
  },
  {
    id: 'lore',
    name: 'Nhận thức (Đan phương/Dược tính/Khí văn/Địch thủ)',
    mode: 'full',
    detail: 'lore store toàn bộ không xóa, ngoài ra căn cứ theo giai vị túc tuệ carryLore bù đắp',
    kind: 'legacy',
    power: 'none',
    compressesGrowth: false
  },
  {
    id: 'quests',
    name: 'Thành tựu và đồ giám',
    mode: 'full',
    detail: 'quests store không tham gia đặt lại luân hồi',
    kind: 'legacy',
    power: 'none',
    compressesGrowth: false
  },
  {
    id: 'endgame',
    name: 'Đạo nguyên và đạo ngân',
    mode: 'partial',
    detail: 'onRebirth chỉ hoàn trả đạo đồ, đạo nguyên/đạo ngân/kỷ lục cùng thần hồn bất diệt',
    kind: 'legacy',
    power: 'low',
    compressesGrowth: false
  },
  {
    id: 'suppress',
    name: 'Trấn áp khu vực và kẻ thù truyền kiếp',
    mode: 'partial',
    detail:
      'Lợi ích trấn áp và tư cách là "ta sở hữu bao nhiêu": Vùng xa kiếp trước trấn áp nếu qua đời, kiếp mới Luyện Khí vẫn nhận trang bị/linh thạch bậc cao, chỉ số nổ tung ngay tại chỗ (người chơi phản ánh thực tế). Do đó rebirth() xóa sạch suppressedRegions/suppressedSince/suppressQualified —— yêu khí tụ lại, trở về nơi lịch luyện; sanitize cũng đỡ cho các save cũ đã chuyển thế trước khi sửa (xóa sạch tàn dư có minRealm > cảnh giới hiện tại). Chiến tích regionStats và kẻ thù truyền kiếp nemeses vẫn cùng thần hồn bất diệt (lời tự sự "thế giới ghi nhớ bạn" và bia đá không mất)',
    kind: 'state',
    power: 'none',
    compressesGrowth: false
  },
  // ---- Bổ sung: Các tính năng trước đây chưa được đưa vào danh sách nhưng cũng có quyết định giữ/bỏ qua các đời ----
  {
    id: 'secretRealm',
    name: 'Bí cảnh ngắn hạn',
    mode: 'reset',
    detail: 'player.rebirth() đặt secretRealm=null —— nội dung dùng một lần đang diễn ra kết thúc cùng kiếp này',
    kind: 'state',
    power: 'none',
    compressesGrowth: false
  },
  {
    id: 'regionEvent',
    name: 'Sự kiện động khu vực',
    mode: 'reset',
    detail: 'player.rebirth() đặt regionEvent=null (dị tượng tạm thời không nên truyền qua đời sau)',
    kind: 'state',
    power: 'none',
    compressesGrowth: false
  },
  {
    id: 'mortalWorld',
    name: 'Giới vực kiếp này',
    mode: 'reset',
    detail: 'rerollMortalWorld() mỗi đời đổi một phương thiên địa (không trùng với kiếp trước)',
    kind: 'state',
    power: 'none',
    compressesGrowth: false
  },
  {
    id: 'fortuneMemory',
    name: 'Ký ức cơ duyên và tao ngộ',
    mode: 'full',
    detail: 'fortuneChoices / eventChains / eventMemories không xóa —— "Thế giới ghi nhớ lựa chọn của bạn"',
    kind: 'legacy',
    power: 'none',
    compressesGrowth: false
  },
  {
    id: 'bonds',
    name: 'Đạo hữu',
    mode: 'partial',
    detail: 'Quan hệ lưu vào lý lịch (archiveBond), người không giữ lại; giữ lại là việc đã từng đồng hành',
    kind: 'legacy',
    power: 'none',
    compressesGrowth: false
  },
  {
    id: 'trial',
    name: 'Nghịch Lữ Khế',
    mode: 'reset',
    detail: 'Khế ước tiêu tán cùng thể xác, kiếp sau muốn ký phải tiêu hao lại Đạo quả (setLifeTrial(null))',
    kind: 'state',
    power: 'none',
    compressesGrowth: false
  },
  {
    id: 'streak',
    name: 'Chuỗi thắng và tuần du trong ngày',
    mode: 'reset',
    detail: 'winStreak / lastCaveEventDay đặt về không —— thuộc tiến độ hiện tại của "kiếp này"',
    kind: 'state',
    power: 'none',
    compressesGrowth: false
  },
  {
    id: 'linggen',
    name: 'Linh căn',
    mode: 'reset',
    detail: 'rebirth() gieo lại linh căn; sàn tư chất tăng dần theo túc tuệ (aptitudeFloorNow)',
    kind: 'state',
    power: 'high',
    compressesGrowth: false
  },
  // ---- Bổ sung: Các trạng thái và thân phận được thêm vào sau ----
  {
    id: 'divination',
    name: 'Quẻ bói khi vấn quẻ',
    mode: 'reset',
    detail: 'rebirth() đặt divination=null —— quẻ là "thời cơ tại thời điểm này", không phải "ta là ai"',
    kind: 'state',
    power: 'low',
    compressesGrowth: false
  },
  {
    id: 'breakthroughPrep',
    name: 'Chuẩn bị phá cảnh (Tọa thiền/Tụ Khí Đan)',
    mode: 'reset',
    detail: 'rebirth() đặt breakthroughPrep=null —— kiếp sau phải chuẩn bị lại; gia thành một lần chưa dùng hết cũng không qua đời',
    kind: 'state',
    power: 'low',
    compressesGrowth: false
  },
  {
    id: 'wudaoExchange',
    name: 'Đổi ngộ đạo (Linh thạch → điểm ngộ đạo hạn mức trong ngày)',
    mode: 'full',
    detail: 'Sổ sách ngày không tính theo kiếp: đúng gameDay mới tính vào ngày hôm đó, ngày hôm sau tự động đặt lại; chuyển thế không xóa — nếu không trong cùng một ngày chuyển thế sẽ làm mới hạn ngạch đổi',
    kind: 'state',
    power: 'low',
    compressesGrowth: false
  },
  {
    id: 'mansionRedirect',
    name: 'Định hướng tinh tượng trực nhật (Bảo bọc chiến thuật cho giới vực có lợi hôm nay)',
    mode: 'full',
    detail: 'Sổ sách ngày không tính theo kiếp: đúng gameDay mới có hiệu lực, ngày hôm sau tự động trở về suy diễn số ngày; chuyển thế không xóa — nếu không trong cùng một ngày chuyển thế sẽ làm mới hạn ngạch đổi hướng',
    kind: 'state',
    power: 'low',
    compressesGrowth: false
  },
  {
    id: 'fateFocus',
    name: 'Điểm hóa chủ tinh mệnh cách (Chọn một chủ tinh hiển hóa)',
    mode: 'reset',
    detail: 'rebirth() đặt fateFocus=null —— điểm hóa là lựa chọn "kiếp này nghiêng về hướng nào", vị trí chuyển theo bàn: chuyển thế sắp xếp lại mệnh bàn, điểm hóa theo đó tiêu tán',
    kind: 'state',
    power: 'low',
    compressesGrowth: false
  },
  {
    id: 'enlightenmentAt',
    name: 'Tần suất ngộ đạo (Hồi chiêu đốn ngộ)',
    mode: 'full',
    detail: 'enlightenmentAt không đặt về không khi chuyển thế —— nó là van tần suất chứ không phải tiến độ kiếp này; nếu xóa thì có thể lợi dụng chuyển thế để cày đốn ngộ',
    kind: 'legacy',
    power: 'none',
    compressesGrowth: false
  },
  {
    id: 'name',
    name: 'Đạo hiệu',
    mode: 'reset',
    detail: 'rebirth() mỗi đời gieo đạo hiệu mới —— thần hồn bất diệt mang theo sở tri sở lịch, không phải danh hiệu; thể xác mới đổi tên mới (xem stores/player.rebirth)',
    kind: 'state',
    power: 'none',
    compressesGrowth: false
  },
  {
    id: 'reincarnationCount',
    name: 'Số lần luân hồi',
    mode: 'full',
    detail: 'reincarnation.count chỉ tăng không giảm —— phát Đạo quả và thiên phú mỗi đời đều tính theo nó',
    kind: 'legacy',
    power: 'none',
    compressesGrowth: true
  },
  {
    id: 'lives',
    name: 'Lý lịch các đời',
    mode: 'full',
    detail: 'recordLife trong confirmReincarnation lưu trữ từng đời, chỉ tăng không sửa (Tu Tiên Lục căn cứ vào đó viết thành sách)',
    kind: 'legacy',
    power: 'none',
    compressesGrowth: false
  },
  {
    id: 'vow',
    name: 'Đề tài kiếp này',
    mode: 'reset',
    detail: 'beginLife() mỗi đời lập lại; đề tài kiếp trước chỉ lưu vào lý lịch và túc tuệ, không tham gia kết toán kiếp này nữa',
    kind: 'state',
    power: 'none',
    compressesGrowth: false
  }
]

// ---------------- Sự tích lũy các đại lượng vĩnh viễn qua các đời ----------------

export interface HeritageGroup {
  mode: HeritageMode
  /** Ngôn ngữ giao diện: Nhóm này là "mang đi" hay "buông xuống" */
  title: string
  rows: HeritageRow[]
}

/**
 * Danh sách kế thừa được phân nhóm theo giữ/bỏ —— giao diện (kết toán luân hồi) và kiểm toán cùng dùng một bản,
 * đảm bảo thông tin "mang đi / buông xuống" người chơi nhìn thấy không bị phân nhánh so với thực tế bàn giao trong mã nguồn.
 */
export function heritageGroups(): HeritageGroup[] {
  const titles: Record<HeritageMode, string> = {
    full: 'Theo thần hồn mang đi',
    partial: 'Chiết tổn mang đi',
    reset: 'Theo thể xác buông xuống'
  }
  return (['full', 'partial', 'reset'] as const).map(mode => ({
    mode,
    title: titles[mode],
    rows: HERITAGE.filter(r => r.mode === mode)
  }))
}

/** Số Đạo quả ngưng tụ được mỗi đời khi tu đầy nhân gian giới, phi thăng Chân Tiên rồi mới chuyển thế */
export const FRUIT_PER_LIFE = daoFruitGain(REBIRTH_REFERENCE_MAJOR, 9)

/** Tổng số Đạo quả tích lũy sau khi đi qua n đời */
export function daoFruitAfterLives(lives: number): number {
  return Math.max(0, lives) * FRUIT_PER_LIFE
}

/** Số lượng thiên phú nắm giữ sau khi đi qua n đời (mỗi đời 1 + major/DIV, chặn trần ở tổng số thiên phú) */
export function talentsAfterLives(lives: number): number {
  const perLife = 1 + Math.floor(REBIRTH_REFERENCE_MAJOR / TALENT_DRAW_DIV)
  return Math.min(TALENTS.length, Math.max(0, lives) * perLife)
}

/** Gia thành tốc độ tu luyện ước tính theo số lượng thiên phú (lấy trung bình toàn tập ngoại suy tuyến tính) */
export function talentCultBonusAt(lives: number): number {
  const total = TALENTS.reduce((sum, t) => sum + (t.mods.cultivationSpeed ?? 0), 0)
  const avg = TALENTS.length > 0 ? total / TALENTS.length : 0
  return avg * talentsAfterLives(lives)
}

/** Gia thành chiến lực ước tính theo số lượng thiên phú (hướng tấn công, cùng quy chuẩn trên) */
export function talentPowerBonusAt(lives: number): number {
  const total = TALENTS.reduce((sum, t) => sum + modSum(t.mods), 0)
  const avg = TALENTS.length > 0 ? total / TALENTS.length : 0
  return avg * talentsAfterLives(lives)
}

function modSum(mods: StatMods): number {
  let sum = 0
  for (const k in mods) {
    const v = mods[k as keyof StatMods]
    if (typeof v === 'number' && v > 0) sum += v
  }
  return sum
}

/** Hệ số nhân chiến lực vĩnh viễn mang theo khi sinh ra ở đời thứ n (Đạo quả + Thiên phú) */
export function permanentPowerMultAt(lives: number): number {
  const fruit = effectiveDaoFruit(daoFruitAfterLives(lives)) * DAO_FRUIT_COMBAT_BONUS
  return 1 + fruit + talentPowerBonusAt(lives)
}

// ---------------- Thời gian đuổi kịp: Luân hồi còn lại bao nhiêu "trải nghiệm lại" ----------------

export interface PaceRow {
  /** Đời thứ mấy (1 = Đời đầu tiên) */
  life: number
  daoFruit: number
  talents: number
  /** Số giờ cần để đời này tu từ số không lên Chân Tiên */
  hoursToPeak: number
  /** Tỷ lệ thời gian so với đời đầu tiên */
  vsFirstLife: number
  /** Hệ số nhân chiến lực vĩnh viễn mang theo khi sinh ra ở đời này */
  permanentMult: number
}

/**
 * Giả định tu hành ở đời thứ n: Linh căn lấy giá trị điển hình, thiên phú quy đổi theo lượng đã tích lũy.
 * Linh mạch không còn được tính vào —— địa mạch là ngoại vật, mỗi đời đầu tư lại từ đầu (xem dòng veins trong HERITAGE).
 */
function assumptionsAt(lives: number): SimAssumptions {
  return { linggenMult: 1.6, talentCultBonus: talentCultBonusAt(lives - 1) }
}

/**
 * Số giờ cần để đời thứ n tu từ Luyện Khí lên Chân Tiên.
 * Đạo quả và thiên phú đều tính theo tồn lượng "ở thời điểm kết thúc đời trước" —— đời này sinh ra đã mang theo chúng.
 */
export function hoursToPeakAt(lives: number): number {
  return hoursToReach(REBIRTH_REFERENCE_MAJOR, daoFruitAfterLives(lives - 1), assumptionsAt(lives))
}

export function pacePerLife(lifeList: number[]): PaceRow[] {
  const first = hoursToPeakAt(1)
  return lifeList.map(life => {
    const hours = hoursToPeakAt(life)
    return {
      life,
      daoFruit: daoFruitAfterLives(life - 1),
      talents: talentsAfterLives(life - 1),
      hoursToPeak: hours,
      vsFirstLife: first > 0 ? hours / first : 1,
      permanentMult: permanentPowerMultAt(life - 1)
    }
  })
}

// ---------------- Tổng hợp tiêu chuẩn đánh giá ----------------

export interface HeritageSummary {
  /** Số lượng mục kế thừa đầy đủ */
  fullCount: number
  partialCount: number
  resetCount: number
  /** Các mục làm thu hẹp không gian tăng trưởng của đời kế tiếp */
  compressing: HeritageRow[]
  /** Các mục thuộc nhóm "Trạng thái" nhưng lại được kế thừa đầy đủ —— vi phạm nguyên tắc "đặt lại những gì ta hiện có" */
  stateButFull: HeritageRow[]
}

export function summarize(rows: HeritageRow[] = HERITAGE): HeritageSummary {
  return {
    fullCount: rows.filter(r => r.mode === 'full').length,
    partialCount: rows.filter(r => r.mode === 'partial').length,
    resetCount: rows.filter(r => r.mode === 'reset').length,
    compressing: rows.filter(r => r.compressesGrowth),
    stateButFull: rows.filter(r => r.kind === 'state' && r.mode === 'full')
  }
}
