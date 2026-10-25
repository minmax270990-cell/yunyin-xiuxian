/**
 * Display layer localization helpers (Sino-Vietnamese / Hán Việt)
 * 
 * Provides runtime visual translations for dynamic data strings
 * without mutating underlying frozen data structures or breaking spec invariants.
 */

function replaceAll(target: string, search: string, replacement: string): string {
  return target.split(search).join(replacement)
}

const REALM_MAP: Record<string, string> = {
  '炼气': 'Luyện Khí',
  '筑基': 'Trúc Cơ',
  '金丹': 'Kim Đan',
  '元婴': 'Nguyên Anh',
  '化神': 'Hóa Thần',
  '炼虚': 'Luyện Hư',
  '合体': 'Hợp Thể',
  '大乘': 'Đại Thừa',
  '渡劫': 'Độ Kiếp',
  '真仙': 'Chân Tiên',
  '玄仙': 'Huyền Tiên',
  '金仙': 'Kim Tiên',
  '太乙': 'Thái Ất',
  '大罗': 'Đại La',
  '神人': 'Thần Nhân',
  '神将': 'Thần Tướng',
  '神王': 'Thần Vương',
  '神帝': 'Thần Đế',
  '混沌真灵': 'Hỗn Độn Chân Linh',
  '混沌神魔': 'Hỗn Độn Thần Ma',
  '混沌道祖': 'Hỗn Độn Đạo Tổ'
}

const SUB_MAP: Record<string, string> = {
  '一层': 'Tầng 1',
  '二层': 'Tầng 2',
  '三层': 'Tầng 3',
  '四层': 'Tầng 4',
  '五层': 'Tầng 5',
  '六层': 'Tầng 6',
  '七层': 'Tầng 7',
  '八层': 'Tầng 8',
  '九层': 'Tầng 9',
  '圆满': 'Viên Mãn',
  '初期': 'Sơ Kỳ',
  '中期': 'Trung Kỳ',
  '后期': 'Hậu Kỳ'
}

export function displayRealmName(nameOrLabel: string): string {
  if (!nameOrLabel) return ''
  let text = nameOrLabel
  for (const [zh, vi] of Object.entries(REALM_MAP)) {
    if (text.includes(zh)) {
      text = replaceAll(text, zh, vi)
    }
  }
  for (const [zh, vi] of Object.entries(SUB_MAP)) {
    if (text.includes(zh)) {
      text = replaceAll(text, zh, vi)
    }
  }
  return replaceAll(text, '·', ' · ')
}

export function displayYears(yOrStr: number | string): string {
  if (typeof yOrStr === 'number') {
    return `${Math.floor(yOrStr)} năm`
  }
  return replaceAll(yOrStr, '载', ' năm')
}

const ENLIGHTEN_LABEL_MAP: Record<string, string> = {
  '静心凝神': 'Tĩnh Tâm Ngưng Thần',
  '道心通明': 'Đạo Tâm Thông Minh',
  '锤炼筋骨': 'Chùy Luyện Cân Cốt',
  '凝气护体': 'Ngưng Khí Hộ Thể',
  '悟透瓶颈': 'Ngộ Thấu Bình Cảnh',
  '吐纳有序': 'Thổ Nạp Hữu Tự',
  '灵机一动': 'Linh Cơ Nhất Động'
}

export function displayEnlightenmentLabel(label: string): string {
  return ENLIGHTEN_LABEL_MAP[label] ?? label
}

export function displayEnlightenmentDesc(text: string): string {
  if (!text) return ''
  let res = text
  res = replaceAll(res, '进阶成功率', 'Tỉ lệ tiến giai thành công')
  res = replaceAll(res, '只入小进阶;大关天劫不与', 'chỉ áp dụng tiểu tiến giai; đại quan thiên kiếp không tính')
  res = replaceAll(res, '大关天劫不与', 'đại quan thiên kiếp không tính')
  res = replaceAll(res, '修炼速度', 'Tốc độ tu luyện')
  res = replaceAll(res, '伤害增幅', 'Tăng phúc sát thương')
  res = replaceAll(res, '战斗伤害', 'Sát thương chiến đấu')
  res = replaceAll(res, '战斗防御', 'Phòng ngự chiến đấu')
  res = replaceAll(res, '灵气回复速度', 'Tốc độ hồi linh khí')
  res = replaceAll(res, '持续', 'duy trì')
  res = replaceAll(res, '分钟', ' phút')
  res = replaceAll(res, '秒', ' giây')
  res = replaceAll(res, '小时', ' giờ')
  res = replaceAll(res, '立即获得', 'Lập tức nhận được')
  res = res.replace(/\s*悟道点/, ' điểm ngộ đạo')
  res = replaceAll(res, ',duy trì', ', duy trì')
  res = replaceAll(res, '%(', '% (')
  return res
}

const WEATHER_NAME_MAP: Record<string, string> = {
  lingyu: 'Linh Vũ',
  chiyang: 'Xích Dương',
  yueshi: 'Nguyệt Thực',
  leiming: 'Lôi Minh',
  qinghe: 'Thanh Hòa',
  xianyu: 'Tiên Vũ',
  ziqi: 'Tử Khí Đông Lai',
  xianjie: 'Tiên Kiếp Nhật',
  shenhui: 'Thần Huy',
  faze: 'Pháp Tắc Triều',
  shenwei: 'Thần Uy Nhật',
  hundunchao: 'Hỗn Độn Triều',
  benyuan: 'Bản Nguyên Dũng Động',
  daoyin: 'Đạo Âm'
}

const WEATHER_DESC_MAP: Record<string, string> = {
  lingyu: 'Mưa linh nhuần thấm, hồi phục linh khí cùng tu luyện đều có lợi.',
  chiyang: 'Xích dương treo cao, xuất chiêu càng thêm cuồng liệt.',
  yueshi: 'Đêm nguyệt thực, khí vận hưng thịnh, pháp khí dễ xuất thế hơn.',
  leiming: 'Sấm rền từng trận, mũi nhọn càng sắc, nhưng độ kiếp hiểm hơn.',
  qinghe: 'Gió hòa trời đẹp, bốn mùa thanh hòa.',
  xianyu: 'Tiên linh chi khí hóa mưa tuôn rơi, trong hơi thở linh khí tự sinh.',
  ziqi: 'Tử khí từ phương đông cuồn cuộn lại, khí vận càng thịnh, pháp khí dễ xuất thế.',
  xianjie: 'Thiên môn chấn động, tiên kiếp sắp đến —— độ kiếp càng hiểm, nhưng sát khí càng bén.',
  shenhui: 'Thần quang chiếu khắp, từng chiêu xuất ra tự có thiên uy.',
  faze: 'Quy tắc dâng trào như sóng, toàn thân đều được chở che.',
  shenwei: 'Chư thần uy áp giáng xuống, thần kiếp càng dữ dội, thần khu cũng càng thêm kiên cố.',
  hundunchao: 'Hỗn Độn chi khí chìm nổi như triều dâng, mỗi hơi thở tu vi cuồn cuộn.',
  benyuan: 'Bản nguyên sôi trào, mỗi cử chỉ đều hợp với đại đạo.',
  daoyin: 'Trong hư không đạo âm bất tuyệt, phúc duyên tự đến trong tâm.'
}

export function displayWeatherName(w: { id?: string; name: string } | string): string {
  if (typeof w === 'string') {
    return WEATHER_NAME_MAP[w] ?? w
  }
  if (w.id && WEATHER_NAME_MAP[w.id]) {
    return WEATHER_NAME_MAP[w.id]!
  }
  return WEATHER_NAME_MAP[w.name] ?? w.name
}

export function displayWeatherDesc(w: { id?: string; desc: string }): string {
  if (w.id && WEATHER_DESC_MAP[w.id]) {
    return WEATHER_DESC_MAP[w.id]!
  }
  return w.desc
}

export function displayWeatherLine(line: string): string {
  if (!line) return ''
  let res = line
  res = replaceAll(res, '今日:', 'Hôm nay: ')
  res = replaceAll(res, '今日无加减', 'Hôm nay không tăng giảm')
  res = replaceAll(res, '灵气恢复', 'Hồi phục linh khí')
  res = replaceAll(res, '修炼速度', 'Tốc độ tu luyện')
  res = replaceAll(res, '伤害增幅', 'Tăng phúc sát thương')
  res = replaceAll(res, '攻击', 'Tấn công')
  res = replaceAll(res, '防御', 'Phòng ngự')
  res = replaceAll(res, '气运', 'Khí vận')
  res = replaceAll(res, '装备掉落率', 'Tỉ lệ rơi trang bị')
  res = replaceAll(res, '渡劫难度', 'Độ khó thiên kiếp')
  res = replaceAll(res, '御劫', 'Ngự kiếp')
  res = replaceAll(res, '大关天劫不与', 'đại quan thiên kiếp không tính')
  res = replaceAll(res, '小进阶', 'tiểu tiến giai')
  res = replaceAll(res, '进阶成功率', 'Tỉ lệ tiến giai thành công')
  res = replaceAll(res, '减伤', 'Giảm thương')
  res = replaceAll(res, '气血上限', 'Khí huyết tối đa')
  return res
}

export function displayGoalText(text: string): string {
  if (!text) return ''
  let res = displayRealmName(text)
  res = res.replace(/^完善「(.*)」流派$/, 'Hoàn thiện lưu phái 「$1」')
  res = res.replace(/^深入「(.*)」$/, 'Tiến sâu vào 「$1」')
  res = res.replace(/^去「(.*)」采集灵草$/, 'Đến 「$1」 thu thập linh thảo')
  res = res.replace(/^寻一件(.*)$/, 'Tìm kiếm một kiện $1')
  return res
}

export function displayGoalHint(hint: string | undefined): string | undefined {
  if (!hint) return undefined
  let res = hint
  res = replaceAll(res, '这一步是小进阶,静坐调息、服用聚气丹或凝神丹可提升进阶成功率', 'Bước này là tiểu tiến giai, tĩnh tọa điều tức, dùng Tụ Khí Đan hoặc Ngưng Thần Đan có thể nâng cao tỉ lệ tiến giai')
  res = replaceAll(res, '这一步是大关天劫,凝神丹与静坐不加成功率,先看劫势再决意', 'Bước này là thiên kiếp đại quan, Ngưng Thần Đan và tĩnh tọa không tăng tỉ lệ, hãy quan sát thế kiếp rồi quyết định')
  res = replaceAll(res, '这一步是小进阶,', 'Bước này là tiểu tiến giai, ')
  res = replaceAll(res, '可提升进阶成功率', 'có thể nâng cao tỉ lệ tiến giai')
  res = replaceAll(res, ';灵气还差', '; linh khí còn thiếu')
  res = replaceAll(res, '才够破境', 'mới đủ phá cảnh')
  res = res.replace(/当前已凑出 (\d+\/\d+) 个核心词条,继续寻找关键装备/, 'Hiện đã gom đủ $1 dòng thuộc tính cốt lõi, tiếp tục tìm kiếm trang bị then chốt')
  res = replaceAll(res, '增长阅历,也寻些机缘与材料', 'Gia tăng lịch duyệt, cũng tìm kiếm chút cơ duyên và tài liệu')
  res = replaceAll(res, '丹药原料所剩无几,历练途中常有灵草可采', 'Nguyên liệu đan dược còn lại không nhiều, trên đường lịch luyện thường có linh thảo để hái')
  res = res.replace(/还缺一件(.*),历练所得的装备里常有/, 'Còn thiếu một kiện $1, trong chiến lợi phẩm lịch luyện thường có')
  return res
}

export function displayCountdownVi(str: string): string {
  if (!str) return ''
  let res = str
  res = res.replace(/(\d+)天(\d+)时/, '$1 ngày $2 giờ')
  res = res.replace(/(\d+)时(\d+)分/, '$1 giờ $2 phút')
  res = res.replace(/(\d+)分(\d+)秒/, '$1 phút $2 giây')
  return res
}

export function displayRewardPreview(preview: string): string {
  if (!preview) return ''
  let res = preview
  res = replaceAll(res, '灵石', 'Linh Thạch')
  res = replaceAll(res, '玄铁', 'Huyền Thiết')
  res = replaceAll(res, '残页', 'Tàn Diệp')
  res = replaceAll(res, '凡品灵草', 'Phàm Phẩm Linh Thảo')
  res = replaceAll(res, '中品灵草', 'Trung Phẩm Linh Thảo')
  res = replaceAll(res, '上品灵草', 'Thượng Phẩm Linh Thảo')
  res = replaceAll(res, '极品灵草', 'Cực Phẩm Linh Thảo')
  res = replaceAll(res, '仙品灵草', 'Tiên Phẩm Linh Thảo')
  res = replaceAll(res, '神品灵草', 'Thần Phẩm Linh Thảo')
  res = replaceAll(res, '悟道点', 'Điểm Ngộ Đạo')
  res = replaceAll(res, '修为', 'Tu Vi')
  res = replaceAll(res, '贡献', 'Cống Hiến')
  res = replaceAll(res, '声望', 'Danh Vọng')
  res = replaceAll(res, '器灵尘', 'Khí Linh Trần')
  res = replaceAll(res, '强化石', 'Cường Hóa Thạch')
  res = replaceAll(res, '洗炼石', 'Tẩy Luyện Thạch')
  res = res.replace(/称号「(.*?)」/g, (_m, name) => `Danh Hiệu「${displayTitleName(name)}」`)
  res = res.replace(/丹药「(.*?)」/g, (_m, name) => `Đan Dược「${displayPillName(name)}」`)
  return res
}

const TERRAIN_MAP: Record<string, string> = {
  '山岳': 'Sơn Nhạc',
  '林泽': 'Lâm Trạch',
  '水泽': 'Thủy Trạch',
  '火域': 'Hỏa Vực',
  '天象': 'Thiên Tượng',
  '废墟': 'Phế Tích',
  '幽冥': 'U Minh',
  '密林': 'Mật Lâm',
  '平原': 'Bình Nguyên',
  '深渊': 'Thâm Uyên',
  '洞天': 'Động Thiên',
  '雪域': 'Tuyết Vực',
  '荒漠': 'Hoang Mạc'
}

export function displayTerrain(t: string): string {
  return TERRAIN_MAP[t] ?? t
}

export function displayWorldBrief(brief: string): string {
  if (!brief) return ''
  let res = brief
  const dualMatch = res.match(/^(.*)与(.*)交错之世$/)
  if (dualMatch) {
    const t1 = TERRAIN_MAP[dualMatch[1]!] ?? dualMatch[1]!
    const t2 = TERRAIN_MAP[dualMatch[2]!] ?? dualMatch[2]!
    return `Thế giới ${t1} cùng ${t2} đan xen`
  }
  const singleMatch = res.match(/^(.*)的(.*)之世$/)
  if (singleMatch) {
    const theme = singleMatch[1]!
    const terrain = TERRAIN_MAP[singleMatch[2]!] ?? singleMatch[2]!
    return `Thế giới ${terrain} mang phong vị ${theme}`
  }
  const scatteredMatch = res.match(/^(.*)的杂涌之世$/)
  if (scatteredMatch) {
    return `Thế giới hỗn tạp mang phong vị ${scatteredMatch[1]!}`
  }
  for (const [zh, vi] of Object.entries(TERRAIN_MAP)) {
    res = replaceAll(res, zh, vi)
  }
  return res
}

export function displayWorldSummary(summary: string): string {
  if (!summary) return ''
  let res = summary
  res = replaceAll(res, '草木丰饶', 'cây cỏ tốt tươi')
  res = replaceAll(res, '矿脉深厚', 'mỏ khoáng dồi dào')
  res = replaceAll(res, '典籍散佚', 'sách cổ lưu lạc')
  res = replaceAll(res, '灵石充盈', 'linh thạch tràn đầy')
  res = replaceAll(res, '药气氤氲', 'hơi thuốc mịt mù')
  for (const [zh, vi] of Object.entries(TERRAIN_MAP)) {
    res = replaceAll(res, zh, vi)
  }
  res = replaceAll(res, '生机断绝', 'Sinh Cơ Đoạn Tuyệt')
  res = replaceAll(res, '天时如刀', 'Thiên Thời Như Đao')
  res = replaceAll(res, '杀气沸腾', 'Sát Khí Sôi Trào')
  res = replaceAll(res, '虚影幢幢', 'Bóng Ảo Chập Chờn')
  res = replaceAll(res, '磐石难移', 'Đá Tảng Khó Dời')
  res = replaceAll(res, '之地,', ' vùng đất, ')
  res = replaceAll(res, '与', ' cùng ')
  res = replaceAll(res, '相间,为', ' đan xen, bị ')
  res = replaceAll(res, '所笼罩', ' bao trùm')
  res = replaceAll(res, '山川无序、诸相杂陈,唯', 'núi sông vô định, vạn tượng hỗn độn, duy chỉ có ')
  res = replaceAll(res, '贯穿始终', ' bao trùm xuyên suốt')
  res = replaceAll(res, '的', ' ')
  return res.trim()
}

export function displayMutatorText(text: string): string {
  if (!text) return ''
  let res = text
  res = replaceAll(res, '治疗效率', 'Hiệu suất trị liệu')
  res = replaceAll(res, '护盾上限', 'Giới hạn hộ thuẫn')
  res = replaceAll(res, '敌人闪避', 'Kẻ địch né tránh')
  res = replaceAll(res, '回合上限', 'Giới hạn hiệp đấu')
  res = replaceAll(res, '敌我暴击伤害皆', 'Sát thương bạo kích địch ta đều')
  res = replaceAll(res, '敌人生命', 'Sinh mệnh kẻ địch')
  res = replaceAll(res, '敌我攻击皆', 'Tấn công địch ta đều')
  res = replaceAll(res, '敌人暴击率', 'Tỉ lệ bạo kích kẻ địch')
  return res
}

const WORLD_NAME_MAP: Record<string, string> = {
  '人间界': 'Nhân Gian Giới',
  '仙界': 'Tiên Giới',
  '神界': 'Thần Giới',
  '混沌海': 'Hỗn Độn Hải'
}

export function displayWorldName(name: string): string {
  return WORLD_NAME_MAP[name] ?? name
}

const PREP_MAP: Record<string, string> = {
  '直接突破': 'Trực Tiếp Đột Phá',
  '静坐调息': 'Tĩnh Tọa Điều Tức',
  '服用聚气丹': 'Uống Tụ Khí Đan',
  '服聚气丹': 'Uống Tụ Khí Đan',
  '服凝神丹': 'Uống Ngưng Thần Đan'
}

export function displayPrepLabel(label: string): string {
  return PREP_MAP[label] ?? label
}

const REALM_DESC_MAP: Record<string, string> = {
  '感应天地灵气，引气入体，初踏仙途': 'Cảm ứng linh khí đất trời, dẫn khí nhập thể, bước đầu bước lên tiên đồ',
  '开辟气海丹田，灵力化液，寿元延展': 'Khai mở khí hải đan điền, linh lực hóa dịch, thọ nguyên kéo dài',
  '凝气成丹，九转功成，神识初生': 'Ngưng khí thành đan, cửu chuyển công thành, thần thức sơ sinh',
  '碎丹结婴，阳神出窍，断肢重生': 'Toái đan kết anh, dương thần xuất khiếu, tái sinh tứ chi',
  '元神化形，感应天地法则，御空而行': 'Nguyên thần hóa hình, cảm ứng quy tắc đất trời, ngự không mà đi',
  '返璞归真，神游太虚，肉身与神魂渐融': 'Phản phác quy chân, thần du thái hư, nhục thân cùng thần hồn dung hợp',
  '身魂合一，法相天地，举手投足引动天地之威': 'Thân hồn hợp nhất, pháp tướng thiên địa, giơ tay nhấc chân dẫn động thiên uy',
  '道法圆融，登峰造极，静候天劫降临': 'Đạo pháp viên dung, đăng phong tạo cực, tĩnh hậu thiên kiếp giáng lâm',
  '九重雷劫淬体，褪尽凡胎，羽化飞升': 'Cửu trọng lôi kiếp thối thể, trút sạch phàm thai, vũ hóa phi thăng',
  '铸就仙体，脱离凡尘，仙界初登': 'Đúc nên tiên thể, thoát ly phàm trần, bước đầu bước vào Tiên Giới',
  '参悟天道幽微，仙元凝练，法力无边': 'Tham ngộ thiên đạo u vi, tiên nguyên ngưng luyện, pháp lực vô biên',
  '不朽金身，万劫不磨，与天地同寿': 'Bất hủ kim thân, vạn kiếp bất ma, cùng trời đất đồng thọ',
  '超脱五行，不入轮回，掌一方天地之运': 'Siêu thoát ngũ hành, không vào luân hồi, nắm giữ vận số một phương thiên địa',
  '大罗天阙，无所不知，超然物外': 'Đại La thiên khuyết, không gì không thông, siêu nhiên vật ngoại',
  '神性初醒，纳神道之气，体悟至高威能': 'Thần tính sơ tỉnh, nạp thần đạo chi khí, thể ngộ uy năng chí cao',
  '披坚执锐，镇压一方，神威浩荡': 'Khoác giáp cầm binh, trấn áp một phương, thần uy hạo đãng',
  '神域之主，号令万物，一言可定生死': 'Chủ nhân thần vực, hiệu lệnh vạn vật, một lời định sinh tử',
  '诸天神主，万界至尊，神权之极': 'Chư thiên thần chủ, vạn giới chí tôn, cực điểm thần quyền',
  '化入混沌，超脱诸界，返归鸿蒙': 'Hóa vào Hỗn Độn, siêu thoát chư giới, trở về hồng mông',
  '混沌初开之灵，掌开天辟地之力': 'Chân linh từ thuở hỗn độn khai mở, nắm giữ sức mạnh khai thiên tích địa',
  '道之源头，无始无终，与大道同在': 'Cội nguồn của Đạo, vô thủy vô chung, trường tồn cùng đại đạo',
  '引气入体,踏上仙途': 'Dẫn khí nhập thể, bước lên tiên đồ',
  '筑道之基,凡躯渐蜕': 'Đắp nền đạo cơ, phàm khu dần lột xác',
  '丹成一粒,吞吐天地': 'Đan thành một hạt, nuốt nhả thiên địa',
  '婴现顶门,神游太虚': 'Anh hiện đỉnh đầu, thần du thái hư',
  '神念化形,言出法随': 'Thần niệm hóa hình, ngôn xuất pháp tùy',
  '炼神返虚,窥见大道': 'Luyện thần phản hư, nhìn thấu đại đạo',
  '身道相合,举念移山': 'Thân đạo tương hợp, khởi niệm dời núi',
  '大道将成,静候天命': 'Đại đạo sắp thành, tĩnh hầu thiên mệnh',
  '九重雷海,向死而生': 'Chín tầng biển sét, hướng tử mà sinh',
  '超脱轮回,与道同存': 'Siêu thoát luân hồi, cùng đạo trường tồn',
  '仙体玄妙,一念山河': 'Tiên thể huyền diệu, một niệm sơn hà',
  '金性不朽,历劫不磨': 'Kim tính bất hủ, qua kiếp không mòn',
  '太乙近道,万法归流': 'Thái Ất cận đạo, vạn pháp quy lưu',
  '大罗金仙,逍遥三界': 'Đại La Kim Tiên, tiêu dao tam giới',
  '神光照世,超脱仙凡': 'Thần quang chiếu thế, siêu thoát tiên phàm',
  '执掌神兵,代天行罚': 'Chấp chưởng thần binh, thay trời hành phạt',
  '神域之主,言出法随': 'Chủ tể thần vực, ngôn xuất pháp tùy',
  '神帝临尘,众神俯首': 'Thần Đế giáng trần, vạn thần cúi đầu',
  '混沌初开,一点真灵不昧': 'Hỗn độn sơ khai, một điểm chân linh bất diệt',
  '神魔一体,开天辟地': 'Thần ma nhất thể, khai thiên lập địa',
  '万道之祖,与混沌同寿': 'Vạn đạo chi tổ, cùng hỗn độn đồng thọ'
}

export function displayRealmDesc(desc: string): string {
  return REALM_DESC_MAP[desc] ?? desc
}

const REALM_BASIS_MAP: Record<string, string> = {
  '内丹': 'Nội Đan',
  '佛道': 'Phật Đạo',
  '道教仙阶': 'Đạo Giáo Tiên Giai',
  '道家本源': 'Đạo Gia Bản Nguyên',
  '网文': 'Văn học Tiên Hiệp'
}

export function displayRealmBasis(basis: string): string {
  return REALM_BASIS_MAP[basis] ?? basis
}

const REALM_LORE_MAP: Record<string, string> = {
  '起点取网文最常见的「炼气」——吐纳导引、引气入体,对应道家「服气」之说;凡人由此入道,故名。': 'Khởi điểm lấy từ "Luyện Khí" phổ biến nhất trong tiên hiệp —— thổ nạp đạo dẫn, dẫn khí nhập thể, ứng với thuyết "Phục Khí" của Đạo gia; người phàm từ đây bước vào con đường tu đạo, nên gọi như vậy.',
  '承炼气。《周易参同契》讲「筑基炼己」,先把道基夯实,才谈得上结丹;故曰筑基。': 'Tiếp nối Luyện Khí. 《Chu Dịch Tham Đồng Khế》nói "Trúc cơ luyện kỷ", trước phải đắp vững đạo cơ, mới tính đến chuyện kết đan; nên gọi là Trúc Cơ.',
  '承筑基。内丹术中「金丹」为药,张伯端《悟真篇》以金丹喻道;一粒丹成,可吞吐天地。': 'Tiếp nối Trúc Cơ. Trong thuật Nội Đan "Kim Đan" là thánh dược, Trương Bá Đoan viết 《Ngộ Chân Thiên》lấy kim đan ví như đạo; một hạt đan thành, nuốt nhả thiên địa.',
  '承金丹。《性命圭旨》述「婴儿现形」,金丹化婴、顶门出窍,是为元婴。': 'Tiếp nối Kim Đan. 《Tính Mệnh Khuê Chỉ》chép "Anh nhi hiện hình", Kim Đan hóa anh, đỉnh đầu xuất khiếu, ấy là Nguyên Anh.',
  '承元婴。《性命圭旨》「炼气化神」,神念离体而化形,言出法随。': 'Tiếp nối Nguyên Anh. 《Tính Mệnh Khuê Chỉ》nói "Luyện khí hóa thần", thần niệm xuất thể hóa hình, ngôn xuất pháp tùy.',
  '承化神。《性命圭旨》「炼神还虚」,即炼虚;形神渐与大道相通。': 'Tiếp nối Hóa Thần. 《Tính Mệnh Khuê Chỉ》nói "Luyện thần hoàn hư", tức là Luyện Hư; hình thần dần tương thông cùng đại đạo.',
  '承炼虚。内丹谓「形神俱妙」,身与道合、举念移山,是为合体。': 'Tiếp nối Luyện Hư. Nội đan gọi là "Hình thần câu diệu", thân cùng đạo hợp, khởi niệm dời núi, ấy là Hợp Thể.',
  '承合体。取佛教「大乘」之名,大道将成、静候天命;世称大乘。': 'Tiếp nối Hợp Thể. Lấy từ danh xưng "Đại Thừa" trong Phật giáo, đại đạo sắp thành, tĩnh hầu thiên mệnh; đời xưng Đại Thừa.',
  '承大乘。《云笈七签》有雷劫之说,修至尽头须历九重雷海,向死而生,故曰渡劫。': 'Tiếp nối Đại Thừa. 《Vân Cấp Thất Thiêm》có thuyết lôi kiếp, tu tới tận cùng phải trải qua chín tầng biển sét, hướng tử mà sinh, nên gọi Độ Kiếp.',
  '承渡劫。《钟吕传道集》分仙为五等,天仙之上为真仙;飞升入天,与道同存。': 'Tiếp nối Độ Kiếp. 《Chung Lữ Truyền Đạo Tập》chia tiên nhân thành năm bậc, trên Thiên Tiên là Chân Tiên; phi thăng cửu thiên, trường tồn cùng đạo.',
  '承真仙。取其「玄」字(《道德经》「玄之又玄」),仙体玄妙,一念山河。': 'Tiếp nối Chân Tiên. Lấy từ chữ "Huyền" (《Đạo Đức Kinh》"Huyền chi hựu huyền"), tiên thể huyền diệu, một niệm sơn hà.',
  '承玄仙。道教称「金仙」为历劫不磨之仙,金性不朽,故名。': 'Tiếp nối Huyền Tiên. Đạo giáo gọi "Kim Tiên" là bậc tiên trải vạn kiếp không mòn, kim tính bất hủ, nên gọi như vậy.',
  '承金仙。取道教「太乙」(太乙救苦天尊)与网文近道之阶,谓太乙近道、万法归流。': 'Tiếp nối Kim Tiên. Lấy từ danh hiệu "Thái Ất" (Thái Ất Cứu Khổ Thiên Tôn) trong Đạo giáo và cấp bậc cận đạo trong văn học tiên hiệp, gọi là Thái Ất cận đạo, vạn pháp quy lưu.',
  '承太乙。道教以「大罗天」为最高天界,居其上者为大罗金仙;逍遥三界,故名大罗。': 'Tiếp nối Thái Ất. Đạo giáo coi "Đại La Thiên" là cõi trời cao nhất, ngự trên đó là Đại La Kim Tiên; tiêu dao tam giới, nên gọi Đại La.',
  '承大罗。《庄子·逍遥游》「藐姑射之山,有神人居焉」——超脱仙身、入神界之始,故名神人。': 'Tiếp nối Đại La. 《Trang Tử · Tiêu Dao Du》chép "Miểu Cô Xạ chi sơn, hữu thần nhân cư yên" —— siêu thoát tiên thân, bước đầu vào Thần Giới, nên gọi Thần Nhân.',
  '承神人。神界阶位常见「神将」,执掌神兵、代天行罚。': 'Tiếp nối Thần Nhân. Bậc vị Thần Giới thường thấy "Thần Tướng", chấp chưởng thần binh, thay trời hành phạt.',
  '承神将。神域之主为神王,言出法随,一方神域皆循其名。': 'Tiếp nối Thần Tướng. Chủ tể Thần Vực là Thần Vương, ngôn xuất pháp tùy, một phương thần vực đều thuận theo uy danh.',
  '承神王。众神之极曰神帝,神帝临尘,众神俯首。': 'Tiếp nối Thần Vương. Đỉnh cao của chúng thần gọi là Thần Đế, Thần Đế giáng trần, vạn thần cúi đầu.',
  '承神帝。《三五历纪》「天地混沌如鸡子」——混沌初开,一点真灵不昧,故名混沌真灵。': 'Tiếp nối Thần Đế. 《Tam Ngũ Lịch Kỷ》chép "Thiên địa hỗn độn như kê tử" —— hỗn độn sơ khai, một điểm chân linh bất diệt, nên gọi Hỗn Độn Chân Linh.',
  '承混沌真灵。开天辟地之象:神魔一体,以身开界,故名混沌神魔。': 'Tiếp nối Hỗn Độn Chân Linh. Hình tượng khai thiên lập địa: thần ma nhất thể, lấy thân mở cõi, nên gọi Hỗn Độn Thần Ma.',
  '承混沌神魔。《道德经》「道生一」——万道之祖,与混沌同寿,是为混沌道祖,亦为全境之极。': 'Tiếp nối Hỗn Độn Thần Ma. 《Đạo Đức Kinh》chép "Đạo sinh nhất" —— vạn đạo chi tổ, cùng hỗn độn đồng thọ, ấy là Hỗn Độn Đạo Tổ, cũng là cực điểm của toàn bộ cảnh giới.'
}

export function displayRealmLore(lore: string): string {
  if (REALM_LORE_MAP[lore]) {
    return REALM_LORE_MAP[lore]
  }
  let res = lore
  for (const [zh, vi] of Object.entries(REALM_MAP)) {
    res = replaceAll(res, zh, vi)
  }
  return res
}

const CN_NUM_MAP: Record<string, string> = {
  '零': '0',
  '一': '1',
  '二': '2',
  '三': '3',
  '四': '4',
  '五': '5',
  '六': '6',
  '七': '7',
  '八': '8',
  '九': '9',
  '十': '10',
  '十一': '11',
  '十二': '12',
  '十三': '13',
  '十四': '14',
  '十五': '15',
  '十六': '16',
  '十七': '17',
  '十八': '18',
  '十九': '19',
  '二十': '20',
  '二十一': '21',
  '二十八': '28',
  '六十四': '64',
  '一百': '100'
}

export function displayCnNum(str: string): string {
  return CN_NUM_MAP[str] ?? str
}

const LORE_STAGE_MAP: Record<string, string> = {
  '未识': 'Chưa rõ',
  '眼熟': 'Trông quen',
  '知其路数': 'Rõ đường đi nước bước',
  '洞悉': 'Thấu triệt'
}

export function displayLoreStageName(stage: string): string {
  return LORE_STAGE_MAP[stage] ?? stage
}

const ELEMENT_MAP: Record<string, string> = {
  '金': 'Kim',
  '木': 'Mộc',
  '水': 'Thủy',
  '火': 'Hỏa',
  '土': 'Thổ',
  '雷': 'Lôi',
  '风': 'Phong',
  '光': 'Quang',
  '暗': 'Ám'
}

export function displayLoreElement(elem: string): string {
  return ELEMENT_MAP[elem] ?? elem
}

const FRAME_MAP: Record<string, string> = {
  '气血绵长': 'Khí huyết miên trường',
  '身子单薄': 'Thân thể đơn bạc',
  '出手极重': 'Ra tay cực nặng',
  '力道平平': 'Lực đạo bình thường',
  '皮坚甲厚': 'Da bền giáp dày',
  '皮肉松软': 'Bì nhục mềm yếu',
  '身法迅捷': 'Thân pháp nhanh nhẹn',
  '行动迟缓': 'Hành động chậm chạp'
}

export function displayLoreFrame(frame: string): string {
  return FRAME_MAP[frame] ?? frame
}

export function displayLoreSkillNote(note: string): string {
  if (!note) return ''
  let res = note
  res = replaceAll(res, '出手 ', 'Tỉ lệ ra chiêu ')
  res = replaceAll(res, '威力 ', 'uy lực ')
  res = replaceAll(res, '命中后再以 ', 'Sau khi trúng đòn thêm ')
  res = replaceAll(res, '摄住心神', 'nhiếp trụ tâm thần')
  res = replaceAll(res, '事后再伤 ', 'Về sau gây thêm sát thương bằng ')
  res = replaceAll(res, '攻击', 'công kích')
  res = replaceAll(res, '回补 ', 'Hồi phục ')
  res = replaceAll(res, '气血', 'khí huyết')
  res = replaceAll(res, '凝 ', 'Ngưng tụ ')
  res = replaceAll(res, '气血为盾', 'khí huyết thành khiên')
  res = replaceAll(res, '本击之后另起 ', 'Sau đòn này đánh thêm ')
  res = replaceAll(res, '段,各按威力 ', 'đoạn, mỗi đoạn tính uy lực ')
  res = replaceAll(res, '真伤贯体,护盾挡不住', 'Sát thương thực xuyên thấu, hộ thuẫn không đỡ được')
  res = replaceAll(res, '一记重手', 'Một đòn cực nặng')
  res = replaceAll(res, '发力凶狠', 'Phát lực hung hãn')
  res = replaceAll(res, '寻常一击', 'Đòn đánh thông thường')
  return res
}

export function displayLorePhaseAt(at: string): string {
  if (!at) return ''
  return replaceAll(at, '血余 ', 'Máu còn lại ')
}

export function displayLorePhaseLabel(label: string): string {
  return PHASE_LABEL_MAP[label] ?? label
}

const ARCHETYPE_NOTE_MAP: Record<string, string> = {
  '越战越狂——拖得越久它越凶': 'Càng đánh càng cuồng —— Kéo càng lâu nó càng hung hãn',
  '你多段出手,它便回敬': 'Ngươi ra tay nhiều đoạn, nó liền đáp trả',
  '有一记绕过一切护体的杀招': 'Có một sát chiêu vòng qua mọi hộ thể',
  '压治疗——你回的血在它面前不值钱': 'Áp chế trị liệu —— Máu ngươi hồi phục trước mặt nó chẳng đáng là bao',
  '吞法——你法门越多,它反倒越硬': 'Thôn pháp —— Pháp môn của ngươi càng nhiều, nó ngược lại càng cứng cáp',
  '身形飘忽,不容易打实': 'Thân hình phiêu hốt, khó lòng đánh trúng thực thể',
  '自愈不止,久战反而是它的场': 'Tự lành không dứt, chiến đấu trường kỳ càng là sân nhà của nó',
  '开战即有罡盾,破不开便伤不着它': 'Khai chiến liền có cương thuẫn, không phá được thì không tổn thương được nó'
}

export function displayLoreArchetype(arch: string): string {
  return ARCHETYPE_NOTE_MAP[arch] ?? arch
}

const ARCHETYPE_LABEL_MAP: Record<string, string> = {
  '狂暴': 'Cuồng Bạo',
  '反震': 'Phản Chấn',
  '真伤': 'Sát Thương Thực',
  '重伤': 'Trọng Thương',
  '禁法': 'Cấm Pháp',
  '飘忽': 'Phiêu Hốt',
  '愈合': 'Dũ Hợp',
  '罡盾': 'Cương Thuẫn'
}

export function displayLoreArchetypeLabel(label: string): string {
  return ARCHETYPE_LABEL_MAP[label] ?? label
}

const DIRECTION_MAP: Record<string, string> = {
  '东': 'Đông',
  '南': 'Nam',
  '西': 'Tây',
  '北': 'Bắc',
  '中': 'Trung'
}

export function displayDirection(dir: string): string {
  return DIRECTION_MAP[dir] ?? dir
}

const IMAGE_NAME_MAP: Record<string, string> = {
  '青龙': 'Thanh Long',
  '朱雀': 'Chu Tước',
  '白虎': 'Bạch Hổ',
  '玄武': 'Huyền Vũ'
}

export function displayImageName(name: string): string {
  return IMAGE_NAME_MAP[name] ?? name
}

import {
  REGION_NAME_MAP,
  ENEMY_NAME_MAP,
  EQUIP_NAME_MAP,
  SLOT_NAME_MAP,
  EXPLORE_MODE_MAP,
  EQUIP_SET_MAP,
  PILL_NAME_MAP,
  ARTIFACT_NAME_MAP,
  ARTIFACT_ACTIVE_NAME_MAP,
  QUALITY_NAME_MAP,
  TRIBULATION_NAME_MAP,
  TRIBULATION_VERDICT_MAP,
  TRIBULATION_DESC_MAP,
  TRIBULATION_RISK_MAP,
  TRIBULATION_ADVICE_MAP,
  GONGFA_NAME_MAP,
  GONGFA_SKILL_NAME_MAP,
  GONGFA_BRANCH_NAME_MAP,
  REGION_DESC_MAP,
  MANSION_NAME_MAP,
  MANSION_IMAGE_MAP,
  MANSION_DIRECTION_MAP,
  MANSION_DOMAIN_MAP,
  MANSION_GOOD_MAP,
  EVENT_TIER_NAME_MAP,
  DANGER_NAME_MAP,
  PROSPERITY_NAME_MAP,
  FOE_ORIGIN_LABEL_MAP,
  SUPPRESS_RESOURCE_NAME_MAP,
  GONGFA_DESC_MAP,
  TITLE_NAME_MAP,
  TITLE_DESC_MAP,
  COMBO_ART_NAME_MAP,
  COMBO_ART_DESC_MAP,
  COMBO_ART_COST_MAP,
  GONGFA_BRANCH_DESC_MAP,
  ENEMY_SKILL_NAME_MAP,
  PHASE_LABEL_MAP,
  MUTATOR_NAME_MAP,
  DAO_PATH_MAP,
  DAO_SEAL_MAP,
  DAO_DESC_MAP,
  DAO_RULE_MAP,
  DAO_DEEP_MAP,
  CELESTIAL_WORLD_NAME_MAP,
  CELESTIAL_WORLD_SEAL_MAP,
  CELESTIAL_WORLD_DESC_MAP,
  CELESTIAL_WORLD_RULE_MAP,
  ROUTE_NODE_NAME_MAP,
  ROUTE_NODE_DESC_MAP,
  ROUTE_RISK_MAP,
  TRIAL_NAME_MAP,
  TRIAL_SEAL_MAP,
  TRIAL_DESC_MAP,
  TRIAL_RULE_MAP,
  PACT_NAME_MAP,
  PACT_SEAL_MAP,
  PACT_DESC_MAP,
  PACT_RULE_MAP,
  FURNACE_RATE_MAP,
  VOID_HEAD_MAP,
  VOID_TAIL_MAP,
  VOID_SEAL_MAP,
  THEME_IDENTITY_MAP,
  VOID_NODE_HEAD_MAP,
  VOID_NODE_TAIL_MAP
} from './displayMappings'

export function displayEnemySkillName(name: string): string {
  if (!name) return ''
  return ENEMY_SKILL_NAME_MAP[name] ?? name
}

export function displayMutatorName(name: string): string {
  if (!name) return ''
  return MUTATOR_NAME_MAP[name] ?? name
}

export function displayCombatBracket(content: string): string {
  if (!content) return ''
  if (GONGFA_SKILL_NAME_MAP[content]) return GONGFA_SKILL_NAME_MAP[content]
  if (ENEMY_SKILL_NAME_MAP[content]) return ENEMY_SKILL_NAME_MAP[content]
  const enemy = displayEnemyName(content)
  if (enemy !== content) return enemy
  const art = displayArtifactName(content)
  if (art !== content) return art
  const artActive = displayArtifactActiveName(content)
  if (artActive !== content) return artActive
  const npc = displayDaoluName(content)
  if (npc !== content) return npc
  const gf = displayGongfaName(content)
  if (gf !== content) return gf
  const br = displayGongfaBranchName(content)
  if (br !== content) return br
  const title = displayTitleName(content)
  if (title !== content) return title
  return content
}

export function displayBuildSourceName(source: string): string {
  if (!source) return ''
  if (source.startsWith('称号·')) {
    const raw = source.slice(3)
    return `Danh hiệu · ${displayTitleName(raw)}`
  }
  if (source.startsWith('师承·')) {
    const raw = source.slice(3)
    return `Sư thừa · ${raw}`
  }
  if (source.startsWith('灵兽·')) {
    const raw = source.slice(3)
    return `Linh thú · ${displayPetName(raw)}`
  }
  if (source.startsWith('功法·')) {
    const raw = source.slice(3)
    return `Công pháp · ${displayGongfaName(raw)}`
  }
  if (source.startsWith('分支·')) {
    const raw = source.slice(3)
    return `Nhánh · ${displayGongfaBranchName(raw)}`
  }
  if (source.startsWith('丹效·')) {
    const raw = source.slice(3)
    return `Đan hiệu · ${displayPillName(raw)}`
  }
  if (source.startsWith('装备·')) {
    const raw = source.slice(3)
    return `Trang bị · ${raw}`
  }
  if (source.startsWith('法宝·')) {
    const raw = source.slice(3)
    return `Pháp bảo · ${displayArtifactName(raw)}`
  }
  return source
}

export function displayFightPreviewSkillLine(line: string): string {
  if (!line) return ''
  let res = line
  res = res.replace(/【(.*?)】/g, (_m, name) => `【${displayEnemySkillName(name)}】`)
  res = replaceAll(res, '重击', 'Trọng Kích')
  res = replaceAll(res, '连击', 'Liên Kích')
  res = replaceAll(res, '摄神', 'Nhiếp Thần')
  res = replaceAll(res, '吸血', 'Hút Máu')
  res = replaceAll(res, '护盾', 'Hộ Thuẫn')
  res = replaceAll(res, '流血', 'Chảy Máu')
  res = replaceAll(res, '贯穿', 'Xuyên Thấu')
  res = replaceAll(res, '频频出手', 'Ra tay dồn dập')
  res = replaceAll(res, '寻常出手', 'Ra tay bình thường')
  res = replaceAll(res, '伺机偶发', 'Chờ cơ hội ngẫu phát')
  res = replaceAll(res, '威力 ', 'Uy lực ')
  res = replaceAll(res, ' 倍', ' lần')
  res = replaceAll(res, '身法诡谲,闪避约 ', 'Thân pháp quỷ quyệt, né tránh ước ')
  return res
}

export function displayFightPreviewRiskLine(line: string): string {
  if (!line) return ''
  let res = line
  res = res.replace(/【(.*?)】/g, (_m, name) => `【${displayEnemySkillName(name)}】`)
  res = res.replace(/天时仅 (\d+) 回合,拖延即败/, 'Thiên thời chỉ có $1 hiệp, kéo dài liền bại')
  res = res.replace(/每 (\d+) 回合敌人杀意渐涨,战局越晚越凶/, 'Mỗi $1 hiệp sát ý kẻ địch tăng dần, càng muộn càng hung hiểm')
  res = replaceAll(res, '足以重创,留足气血以备不测', 'đủ sức trọng thương, giữ đủ khí huyết đề phòng bất trắc')
  res = replaceAll(res, '此地生机稀薄,回血难以为继', 'Nơi này sinh cơ thưa thớt, hồi máu khó duy trì')
  return res
}

export function displayFightPreviewWinText(winText: string): string {
  if (!winText) return ''
  const WIN_TEXT_MAP: Record<string, string> = {
    '胜算在握': 'Thắng phần nắm chắc',
    '约有七成胜算': 'Ước chừng bảy phần thắng',
    '五五之数,凶险参半': 'Năm ăn năm thua, hung hiểm chia đôi',
    '凶多吉少': 'Lành ít dữ nhiều'
  }
  return WIN_TEXT_MAP[winText] ?? winText
}

export function displayTitleName(name: string): string {
  if (!name) return ''
  return TITLE_NAME_MAP[name] ?? name
}

export function displayTitleDesc(desc: string): string {
  if (!desc) return ''
  return TITLE_DESC_MAP[desc] ?? desc
}

export function displayComboArtName(name: string): string {
  if (!name) return ''
  return COMBO_ART_NAME_MAP[name] ?? name
}

export function displayComboArtDesc(desc: string): string {
  if (!desc) return ''
  return COMBO_ART_DESC_MAP[desc] ?? desc
}

export function displayComboArtCost(costText: string): string {
  if (!costText) return ''
  return COMBO_ART_COST_MAP[costText] ?? costText
}

export function displayGongfaBranchDesc(desc: string): string {
  if (!desc) return ''
  return GONGFA_BRANCH_DESC_MAP[desc] ?? desc
}

export function displayGongfaName(name: string): string {
  return GONGFA_NAME_MAP[name] ?? name
}

export function displayGongfaSkillName(name: string): string {
  return GONGFA_SKILL_NAME_MAP[name] ?? name
}

export function displayGongfaBranchName(name: string): string {
  return GONGFA_BRANCH_NAME_MAP[name] ?? name
}

export function displayGongfaDesc(desc: string): string {
  return GONGFA_DESC_MAP[desc] ?? desc
}

export function displayGongfaSkillLine(skill: { name: string; mult: number; rate: number } | undefined): string {
  if (!skill) return ''
  const skillName = displayGongfaSkillName(skill.name)
  const ratePct = Math.round(skill.rate * 100) + '%'
  const multPct = Math.round(skill.mult * 100) + '%'
  return `Kèm theo thần thông「${skillName}」: Ra chiêu xác suất ${ratePct}, uy lực ${multPct}. Cần đặt làm Chủ Tu, trong chiến đấu chỉ xuất chiêu thức này`
}

export function displayGongfaFuncText(text: string): string {
  if (!text) return ''
  let res = text
  res = res.replace(/圆满\((\d+)\s*层\)可得:/g, 'Viên mãn ($1 tầng) nhận được: ')
  res = res.replace(/附带神通「(.*?)」:出手\s*(.*?)\s*几率,\s*(.*?)\s*威力。须设为主修,战斗只出这一式/g, (_m, name, rate, mult) =>
    `Kèm thần thông「${displayGongfaSkillName(name)}」: Xuất chiêu ${rate} xác suất, ${mult} uy lực. Cần đặt làm Chủ Tu, trong chiến đấu chỉ xuất chiêu thức này`
  )
  return res
}

export function displayRegionDesc(desc: string): string {
  return REGION_DESC_MAP[desc] ?? desc
}

export function displayEventTierName(name: string): string {
  return EVENT_TIER_NAME_MAP[name] ?? name
}

export function displayDangerName(danger: string): string {
  return DANGER_NAME_MAP[danger] ?? danger
}

export function displayProsperityName(p: string): string {
  return PROSPERITY_NAME_MAP[p] ?? p
}

export function displayProduceTierText(tierOrText: number | string): string {
  if (typeof tierOrText === 'number') {
    return `Rơi vật phẩm bậc ${tierOrText}`
  }
  return tierOrText.replace(/产\s*(\d+)\s*阶之物/, 'Rơi vật phẩm bậc $1')
}

export function displaySuppressResourceName(name: string): string {
  if (name.endsWith('灵草')) {
    const prefix = name.slice(0, -2)
    return `${prefix} Linh Thảo`
  }
  let res = SUPPRESS_RESOURCE_NAME_MAP[name] ?? name
  for (const [zh, vi] of Object.entries(SUPPRESS_RESOURCE_NAME_MAP)) {
    res = replaceAll(res, zh, vi)
  }
  return res
}

export function displayRetreatGainText(text: string): string {
  return text
    .replace('此行约多得修为', 'Chuyến này ước tính nhận thêm tu vi')
    .replace('此行已多得修为', 'Chuyến này đã nhận thêm tu vi')
}

export function displayTierOddsText(text: string): string {
  return text
    .replace('缘起之后才来', 'Duyên khởi mới đến')
    .replace('不出现', 'Không xuất hiện')
    .replace(/约每\s*(\d+)\s*程一次/, 'Khoảng mỗi $1 dặm một lần')
}

export function displayFoeOriginPartsText(text: string): string {
  let res = text
  for (const [zh, vi] of Object.entries(FOE_ORIGIN_LABEL_MAP)) {
    res = replaceAll(res, zh, vi)
  }
  return res
}

export function displayMansionLine(line: string): string {
  let res = line
  for (const [zh, vi] of Object.entries(MANSION_NAME_MAP)) {
    res = replaceAll(res, zh, vi)
  }
  for (const [zh, vi] of Object.entries(MANSION_IMAGE_MAP)) {
    res = replaceAll(res, zh, vi)
  }
  for (const [zh, vi] of Object.entries(MANSION_DIRECTION_MAP)) {
    res = replaceAll(res, zh + '方', ' phương ' + vi)
  }
  for (const [zh, vi] of Object.entries(MANSION_DOMAIN_MAP)) {
    res = replaceAll(res, '分野' + zh, 'Phân dã ' + vi)
  }
  for (const [zh, vi] of Object.entries(MANSION_GOOD_MAP)) {
    const rawZh = zh.startsWith('宜') ? zh.slice(1) : zh
    res = replaceAll(res, '宜宜' + rawZh, vi)
    res = replaceAll(res, '宜' + rawZh, vi)
    res = replaceAll(res, zh, vi)
  }
  res = replaceAll(res, '直日', ' trực nhật')
  return res.replace(/\s+/g, ' ').trim()
}

export function displayRegionName(name: string): string {
  return REGION_NAME_MAP[name] ?? name
}

export function displayExploreMode(mode: string): string {
  return EXPLORE_MODE_MAP[mode] ?? mode
}

export function displayEnemyName(name: string): string {
  if (!name) return ''
  if (name.startsWith('残魂·')) {
    const raw = name.replace(/^残魂·/, '')
    return `Tàn Hồn · ${ENEMY_NAME_MAP[raw] ?? raw}`
  }
  if (ENEMY_NAME_MAP[name]) return ENEMY_NAME_MAP[name]
  if (name.endsWith('之主')) {
    const base = name.slice(0, -2)
    const baseTrans = displayCelestialWorldName(base)
    if (baseTrans !== base) return `${baseTrans} Chi Chủ`
  }
  return name
}

export function displayEquipName(name: string): string {
  return EQUIP_NAME_MAP[name] ?? name
}

export function displayEquipSlot(slotOrName: string): string {
  return SLOT_NAME_MAP[slotOrName] ?? slotOrName
}

export function displayEquipSetName(setName: string): string {
  return EQUIP_SET_MAP[setName] ?? setName
}

export function displayPillName(name: string): string {
  return PILL_NAME_MAP[name] ?? name
}

export function displayArtifactName(name: string): string {
  return ARTIFACT_NAME_MAP[name] ?? name
}

export function displayArtifactActiveName(name: string): string {
  return ARTIFACT_ACTIVE_NAME_MAP[name] ?? name
}

export function displayQualityName(qualityOrName: string): string {
  return QUALITY_NAME_MAP[qualityOrName] ?? qualityOrName
}

export function displayTribulationName(name: string): string {
  return TRIBULATION_NAME_MAP[name] ?? name
}

export function displayTribulationTitle(title: string): string {
  if (!title) return ''
  return title.replace(/(.+)之劫/, (_, name) => `${TRIBULATION_NAME_MAP[name] ?? name} Chi Kiếp`)
}

export function displayTribulationDesc(desc: string): string {
  return TRIBULATION_DESC_MAP[desc] ?? desc
}

export function displayTribulationVerdict(verdict: string): string {
  return TRIBULATION_VERDICT_MAP[verdict] ?? verdict
}

export function displayTribulationRisk(risk: string): string {
  if (!risk) return ''
  if (TRIBULATION_RISK_MAP[risk]) return TRIBULATION_RISK_MAP[risk]
  const m = risk.match(/推演于第\s*(\d+)\s*道天雷不支/)
  if (m) return `Suy tính gục ngã ở đạo thiên lôi thứ ${m[1]}`
  return risk
}

export function displayTribulationAdvice(advice: string): string {
  return TRIBULATION_ADVICE_MAP[advice] ?? advice
}

export function displayArtifactLevelLabel(label: string): string {
  if (!label) return ''
  return label.replace(/祭炼\s*(\d+\/\d+)\s*重/, 'Tế luyện $1 tầng')
}

export function displayArtifactDesc(desc: string): string {
  if (!desc) return ''
  return ARTIFACT_DESC_MAP[desc] ?? desc
}

export function displayArtifactPassive(line: string): string {
  if (!line) return ''
  let res = line
  // Stats
  res = replaceAll(res, '生命上限', 'Sinh mệnh tối đa')
  res = replaceAll(res, '攻击', 'Công kích')
  res = replaceAll(res, '防御', 'Phòng ngự')
  res = replaceAll(res, '气运', 'Khí vận')
  res = replaceAll(res, '修炼速度', 'Tốc độ tu luyện')
  res = replaceAll(res, '战斗修为', 'Tu vi chiến đấu')
  res = replaceAll(res, '命中', 'Chuẩn xác')
  res = replaceAll(res, '闪避', 'Né tránh')
  res = replaceAll(res, '暴击率', 'Tỉ lệ bạo kích')
  res = replaceAll(res, '暴击伤害', 'Sát thương bạo kích')
  res = replaceAll(res, '破甲', 'Phá giáp')
  res = replaceAll(res, '吸血', 'Hút máu')
  res = replaceAll(res, '伤害增幅', 'Tăng sát thương')
  res = replaceAll(res, '造成伤害', 'Sát thương tạo thành')
  res = replaceAll(res, '受到伤害降低', 'Giảm sát thương')
  res = replaceAll(res, '受到伤害', 'Sát thương gánh chịu')
  res = replaceAll(res, '濒危减伤', 'Giảm thương khi nguy nan')
  res = replaceAll(res, '背水增伤', 'Tăng thương khi máu thấp')
  res = replaceAll(res, '锋芒增伤', 'Tăng thương khi đầy máu')
  res = replaceAll(res, '罡盾增伤', 'Tăng thương khi có thuẫn')
  res = replaceAll(res, '追击威力', 'Uy lực truy kích')
  res = replaceAll(res, '反击威力', 'Uy lực phản kích')
  res = replaceAll(res, '反击概率', 'Tỉ lệ phản kích')
  res = replaceAll(res, '连击', 'Liên kích')
  res = replaceAll(res, '震慑', 'Nhiếp thần')
  res = replaceAll(res, '首回合伤害', 'Sát thương hiệp đầu')
  res = replaceAll(res, '速度', 'Tốc độ')
  res = replaceAll(res, '灵气回复', 'Hồi phục linh khí')
  res = replaceAll(res, '灵气上限', 'Giới hạn linh khí')
  res = replaceAll(res, '回合回复', 'Hồi phục mỗi hiệp')
  res = replaceAll(res, '开战护盾', 'Hộ thuẫn khai chiến')
  res = replaceAll(res, '溢疗成盾', 'Tràn trị liệu thành thuẫn')
  res = replaceAll(res, '处决伤害', 'Sát thương xử quyết')
  res = replaceAll(res, '双枚成丹', 'Song Đan thành dược')
  res = replaceAll(res, '双倍战利', 'Gấp đôi chiến lợi phẩm')
  res = replaceAll(res, '历练遇敌', 'Tần suất gặp địch lịch luyện')
  res = replaceAll(res, '历练际遇', 'Tế ngộ lịch luyện')
  res = replaceAll(res, '装备掉落率', 'Tỉ lệ rơi trang bị')
  res = replaceAll(res, '失败返还修为', 'Thất bại hoàn trả tu vi')
  res = replaceAll(res, '小进阶成功率', 'Tỉ lệ tiểu tiến giai')
  res = replaceAll(res, '突破率', 'Tỉ lệ đột phá')
  res = replaceAll(res, '御劫', 'Ngự kiếp')
  res = replaceAll(res, '灵兽效果', 'Hiệu quả linh thú')
  res = replaceAll(res, '强化减耗', 'Giảm tiêu hao cường hóa')
  res = replaceAll(res, '寿元上限', 'Giới hạn thọ nguyên')
  res = replaceAll(res, '战利灵石', 'Linh thạch chiến lợi')

  // Caveats
  res = replaceAll(res, '只抵对手闪避;不闪则无增益', 'Chỉ khắc chế né tránh của địch; không né thì không có hiệu quả')
  res = replaceAll(res, '叠于固有会心之伤', 'Cộng dồn trên sát thương bạo kích cơ bản')
  res = replaceAll(res, '叠于固有会心', 'Cộng dồn trên bạo kích cơ bản')
  res = replaceAll(res, '之上', '')
  res = replaceAll(res, '先削其防,再入减免;不是真伤', 'Trừ phòng ngự trước khi tính giảm thương; không phải sát thương chuẩn')
  res = replaceAll(res, '按造成之伤回血', 'Hồi máu theo sát thương tạo thành')
  res = replaceAll(res, '须己身气血未满', 'Khi sinh mệnh bản thân dưới')
  res = replaceAll(res, '须己身气血逾', 'Khi sinh mệnh bản thân vượt')
  res = replaceAll(res, '须护盾仍在', 'Khi hộ thuẫn còn tồn tại')
  res = replaceAll(res, '只化溢出之疗', 'Chỉ chuyển hóa trị liệu tràn')
  res = replaceAll(res, '回合初回血;已满则无', 'Đầu hiệp hồi máu; đầy thì không hồi')
  res = replaceAll(res, '主器物成色;小进阶另借此数半成', 'Chủ yếu ảnh hưởng phẩm chất vật phẩm; tiểu tiến giai hưởng 5% số này')
  res = replaceAll(res, '须不弱于对手,方得抢先', 'Không thấp hơn đối thủ mới có thể xuất thủ trước')
  res = replaceAll(res, '只重开局一合;不改谁先出手', 'Chỉ tăng hiệp đầu khai cuộc; không đổi thứ tự xuất chiêu')
  res = replaceAll(res, '须高于对手命中,方得避开', 'Cao hơn chuẩn xác của địch mới có thể né tránh')
  res = replaceAll(res, '只增装备现世;灵石草矿不与', 'Chỉ tăng rơi trang bị; linh thạch, thảo mộc, khoáng thạch không tính')
  res = replaceAll(res, '同程妖踪更密;行程不减', 'Yêu thú xuất hiện dày đặc hơn; lộ trình không giảm')
  res = replaceAll(res, '只入小进阶;大关天劫不与', 'Chỉ tính tiểu tiến giai; đại quan thiên kiếp không tính')
  res = replaceAll(res, '只还败时所损修为;灵气不退', 'Chỉ hoàn trả tu vi tổn thất khi bại; linh khí không hoàn')
  res = replaceAll(res, '再得一枚之机;与手艺合计不过八成', 'Cơ hội thêm 1 viên; cộng dồn không quá 80%')
  res = replaceAll(res, '只入历练战胜之石;洞府所产不与', 'Chỉ tính linh thạch thắng lịch luyện; động phủ sản sinh không tính')
  res = replaceAll(res, '只省装备强化之耗;法宝祭炼不与', 'Chỉ tiết kiệm tiêu hao cường hóa trang bị; tế luyện pháp bảo không tính')
  res = replaceAll(res, '只增历练途中际遇;洞府巡游不与', 'Chỉ tăng tế ngộ trên đường lịch luyện; tuần du động phủ không tính')
  res = replaceAll(res, '当场灵石、修为、材料与装备一并翻倍', 'Linh thạch, tu vi, nguyên liệu và trang bị đồng loạt gấp đôi')
  res = replaceAll(res, '只入历练战胜之修为;静修不与', 'Chỉ tính tu vi thắng lịch luyện; tĩnh tu không tính')
  res = replaceAll(res, '只减天劫之伤;小进阶之骰不改', 'Chỉ giảm sát thương thiên kiếp; xúc xắc tiểu tiến giai không đổi')
  res = replaceAll(res, '灵气上限上浮,积余之仓随之', 'Giới hạn linh khí nâng lên, dung lượng tích trữ nâng theo')
  res = replaceAll(res, '放大灵兽词条;灵兽园等级不在其中', 'Khuếch đại dòng linh thú; cấp Linh Thú Viên không tính')
  res = replaceAll(res, '只伤气血未满', 'Chỉ gây thương tổn cho địch có sinh mệnh dưới')
  res = replaceAll(res, '之敌', '')
  res = replaceAll(res, '开战凝盾;总量不过', 'Khai chiến ngưng thuẫn; tổng lượng không quá')
  res = replaceAll(res, '气血', 'sinh mệnh')
  res = replaceAll(res, '另起一击,非连段暴击', 'Thêm một đòn tấn công, không phải bạo kích liên đoạn')
  res = replaceAll(res, '只增追击,不增本击', 'Chỉ tăng truy kích, không tăng đòn chính')
  res = replaceAll(res, '受击后方可还手', 'Sau khi trúng đòn mới có thể phản kích')
  res = replaceAll(res, '只增反击,不增本击', 'Chỉ tăng phản kích, không tăng đòn chính')
  res = replaceAll(res, '震慑一合;净念或可破之', 'Nhiếp thần một hiệp; định niệm có thể hóa giải')
  return res
}

export function displayArtifactActiveDesc(desc: string): string {
  if (!desc) return ''
  let res = desc

  // Specific full phrases
  res = replaceAll(res, '受慑时以七成概率当场挣脱,那一手照出', 'Khi bị nhiếp tâm có 70% xác suất lập tức thoát khống, chiêu thức vẫn phát ra như thường')
  res = res.replace(/受慑时以\s*([一二三四五六七八九十\d]+)\s*成概率当场挣脱[,，]那一手照出/g, (_m, cheng) => {
    const pct = cheng === '七' ? 70 : cheng === '九' ? 90 : cheng === '八' ? 80 : 70
    return `Khi bị nhiếp tâm có ${pct}% xác suất lập tức thoát khống, chiêu thức vẫn phát ra như thường`
  })

  res = res.replace(/每\s*(\d+)\s*回合/g, 'Mỗi $1 hiệp ')
  res = replaceAll(res, '喷吐真火', 'phun ra chân hỏa')
  res = replaceAll(res, '喷出三昧真火', 'phun ra Tam Muội Chân Hỏa')
  res = replaceAll(res, '大印镇压', 'đại ấn trấn áp')
  res = replaceAll(res, '降下雷霆', 'giáng xuống sấm sét')
  res = replaceAll(res, '引星辉入体', 'dẫn ánh sao nhập thể')
  res = replaceAll(res, '鼎压四方', 'đỉnh áp bốn phương')
  res = replaceAll(res, '碧波洗身', 'sóng biếc gột thân')
  res = replaceAll(res, '幡卷灵力', 'cờ cuộn linh lực')
  res = replaceAll(res, '飞刀取首', 'phi đao đoạt mạng')
  res = replaceAll(res, '钟镇万物', 'chuông trấn vạn vật')
  res = replaceAll(res, '造化加身', 'tạo hóa gia thân')
  res = replaceAll(res, '仙火护主', 'tiên hỏa hộ chủ')
  res = replaceAll(res, '琴音摄神,打断敌人这一手', 'tiếng đàn nhiếp thần, đánh gãy chiêu này của địch')
  res = replaceAll(res, '神钟自成壁垒', 'thần chung tự thành thành lũy')
  res = replaceAll(res, '挥鞭裂其护体,余下回合敌人防御降低', 'vung roi xé rách hộ thể, các hiệp còn lại phòng ngự của địch giảm')
  res = replaceAll(res, '开天一击', 'đòn đánh Khai Thiên')
  res = replaceAll(res, '本源涌动', 'bản nguyên cuộn trào')
  res = replaceAll(res, '剑气纵横', 'kiếm khí dọc ngang')
  res = replaceAll(res, '踏云掠影', 'đạp mây lướt bóng')
  res = replaceAll(res, '镇压四方,定住敌人这一手', 'trấn áp bốn phương, định trụ chiêu này của địch')
  res = replaceAll(res, '引雷加身', 'dẫn lôi nhập thể')
  res = replaceAll(res, '青莲护身', 'thanh liên hộ thân')
  res = replaceAll(res, '挪移虚界,敌人伤害降低', 'di chuyển hư giới, sát thương của địch giảm')
  res = replaceAll(res, '云海四合', 'biển mây khép lại')
  res = replaceAll(res, '引星陨落', 'dẫn sao rơi rụng')
  res = replaceAll(res, '扫落敌人气机', 'quét sạch khí cơ địch')
  res = replaceAll(res, '玉京垂护,敌人伤害降低', 'Ngọc Kinh che chở, sát thương của địch giảm')
  res = replaceAll(res, '神域压落', 'thần vực đè xuống')
  res = replaceAll(res, '鼓声催战', 'tiếng trống giục chiến')
  res = replaceAll(res, '香火回照', 'hương hỏa phản chiếu')
  res = replaceAll(res, '帝威加身', 'đế uy gia thân')
  res = replaceAll(res, '真灵回照', 'chân linh phản chiếu')
  res = replaceAll(res, '本源护持', 'bản nguyên che chở')
  res = replaceAll(res, '神魔噬影', 'thần ma phệ ảnh')
  res = replaceAll(res, '束缚敌人,其攻击降低', 'trói buộc kẻ địch, công kích của địch giảm')
  res = replaceAll(res, '摄敌心魂,其攻击降低', 'nhiếp tâm hồn địch, công kích của địch giảm')
  res = replaceAll(res, '铃音慑敌,其攻击降低', 'tiếng chuông nhiếp địch, công kích của địch giảm')
  res = replaceAll(res, '并回复其中', 'và hồi phục')
  res = replaceAll(res, '造成', 'tạo thành')
  res = replaceAll(res, '攻击伤害', 'sát thương công kích')
  res = replaceAll(res, '伤害', 'sát thương')
  res = replaceAll(res, '回复', 'hồi phục')
  res = replaceAll(res, '获得', 'nhận')
  res = replaceAll(res, '生命护盾', 'lá chắn sinh mệnh')
  res = replaceAll(res, '生命', 'sinh mệnh')
  res = replaceAll(res, 'Thần thông uy lực', 'Uy lực thần thông')
  res = replaceAll(res, 'Thần thông hồi phục', 'Hồi phục thần thông')
  res = res.replace(/,([^\s])/g, ', $1')
  res = res.replace(/\s+/g, ' ').trim()
  return res
}

export function displayEquipSetDesc(desc: string): string {
  if (!desc) return ''
  let res = desc
  res = replaceAll(res, '受到致命伤害时,首次保留 1 点气血', 'Khi chịu sát thương chí mạng, lần đầu giữ lại 1 điểm khí huyết')
  res = replaceAll(res, '受到致命伤害时，首次保留 1 点气血', 'Khi chịu sát thương chí mạng, lần đầu giữ lại 1 điểm khí huyết')
  res = replaceAll(res, '每场战斗开始时获得一层星光护体', 'Mỗi trận bắt đầu nhận một tầng tinh quang hộ thể')
  res = replaceAll(res, '开战时仙光护体', 'Khai chiến tiên quang hộ thể')
  res = replaceAll(res, '开战时本源护体', 'Khai chiến bản nguyên hộ thể')
  res = replaceAll(res, '妖庭三器同鸣,噬敌之血自补', 'Yêu Đình tam khí đồng minh, phệ huyết của địch tự bổ')
  res = replaceAll(res, '妖庭三器同鸣，噬敌之血自补', 'Yêu Đình tam khí đồng minh, phệ huyết của địch tự bổ')
  res = replaceAll(res, '(护盾+', '(Hộ thuẫn +')
  res = replaceAll(res, '(造成伤害的', '(Đem ')
  res = replaceAll(res, '转化为生命)', 'sát thương chuyển hóa thành sinh mệnh)')
  return res
}

export function displayCombatLog(text: string): string {
  if (!text) return ''
  let res = text

  // Các mục trong ngoặc vuông (quái, kỹ năng, pháp bảo...)
  res = res.replace(/【(.*?)】(?=[^\s,.!?:;\uFF0C\u3002\uFF01\uFF1F])/g, (_m, name) => `【${displayCombatBracket(name)}】 `)
  res = res.replace(/【(.*?)】/g, (_m, name) => `【${displayCombatBracket(name)}】`)

  // Pháp bảo chủ động xuất chiêu
  res = res.replace(/自行出手——(.*?)([!\\uFF01])/g, (_m, name, punc) => `tự động xuất chiêu —— ${displayArtifactActiveName(name)}${punc}`)
  res = res.replace(/吸取敌手精血——(.*?)([!\\uFF01])/g, (_m, name, punc) => `hút lấy tinh huyết đối thủ —— ${displayArtifactActiveName(name)}${punc}`)

  // Các mẫu chiến báo
  res = replaceAll(res, '你与', 'Ngươi và ')
  res = replaceAll(res, '狭路相逢!', 'ngõ hẹp tương phùng!')
  res = replaceAll(res, '灵光一照,摄魂之力散于无形。', 'linh quang chiếu rọi, lực nhiếp hồn tiêu tán vô hình.')
  res = replaceAll(res, '灵光一照，摄魂之力散于无形。', 'linh quang chiếu rọi, lực nhiếp hồn tiêu tán vô hình.')
  res = replaceAll(res, '你施展一记攻势', 'Ngươi thi triển một đòn công kích')
  res = replaceAll(res, '你祭出一记攻势', 'Ngươi xuất chiêu một đòn công kích')
  res = replaceAll(res, '施展一记攻势', 'thi triển một đòn công kích')
  res = replaceAll(res, '施展一记爪击', 'thi triển một đòn trảo kích')
  res = replaceAll(res, '施展一记', 'thi triển một đòn ')
  res = replaceAll(res, '你祭出', 'Ngươi xuất chiêu ')
  res = replaceAll(res, '你施展', 'Ngươi thi triển ')
  res = replaceAll(res, '祭出一记攻势', 'xuất chiêu một đòn công kích')
  res = replaceAll(res, '祭出一记爪击', 'xuất chiêu một đòn trảo kích')
  res = replaceAll(res, '一记爪击', 'một đòn trảo kích')
  res = replaceAll(res, '一记攻势', 'một đòn công kích')
  res = replaceAll(res, '施展【', 'thi triển 【')
  res = replaceAll(res, '祭出', 'xuất chiêu ')
  res = replaceAll(res, '身形微晃,招式落空。', 'thân hình khẽ lắc, chiêu thức thất bại.')
  res = replaceAll(res, '身形微晃，招式落空。', 'thân hình khẽ lắc, chiêu thức thất bại.')
  res = replaceAll(res, '身形微晃', 'thân hình khẽ lắc')
  res = replaceAll(res, '招式落空', 'chiêu thức thất bại')
  res = replaceAll(res, '击中你。', 'đánh trúng ngươi.')
  res = replaceAll(res, '击中你', 'đánh trúng ngươi')
  res = replaceAll(res, ',击中', ', đánh trúng ')
  res = replaceAll(res, '，击中', ', đánh trúng ')
  res = replaceAll(res, '。击中', '. Đánh trúng ')
  res = replaceAll(res, '会心一击!', 'đòn đánh chí mạng! ')
  res = replaceAll(res, '受创甚重。', 'bị thương cực nặng.')
  res = replaceAll(res, '受创甚重', 'bị thương cực nặng')
  res = replaceAll(res, '你气息平复,伤势缓缓愈合。', 'Ngươi khí tức bình phục, thương thế dần dần hồi phục.')
  res = replaceAll(res, '你气息平复，伤势缓缓愈合。', 'Ngươi khí tức bình phục, thương thế dần dần hồi phục.')
  res = replaceAll(res, '气息平复,伤势缓缓愈合。', 'khí tức bình phục, thương thế dần dần hồi phục.')
  res = replaceAll(res, '气息平复，伤势缓缓愈合。', 'khí tức bình phục, thương thế dần dần hồi phục.')
  res = replaceAll(res, '轰然倒地,魂飞魄散。此战,你胜了。', 'ầm ầm ngã xuống, hồn phi phách tán. Trận này, ngươi thắng rồi.')
  res = replaceAll(res, '轰然倒地，魂飞魄散。此战，你胜了。', 'ầm ầm ngã xuống, hồn phi phách tán. Trận này, ngươi thắng rồi.')
  res = replaceAll(res, '你气血耗尽,身负重伤,含恨败退……', 'Ngươi khí huyết cạn kiệt, thân mang trọng thương, ngậm hờn bại lui……')
  res = replaceAll(res, '你气血耗尽，身负重伤，含恨败退……', 'Ngươi khí huyết cạn kiệt, thân mang trọng thương, ngậm hờn bại lui……')
  res = replaceAll(res, '鏖战多时仍未能建功,', 'Huyết chiến đã lâu vẫn chưa thể lập công, ')
  res = replaceAll(res, '遁走,你无功而返。', 'đào tẩu, ngươi đành lui bước.')
  res = replaceAll(res, '遁走，你无功而返。', 'đào tẩu, ngươi đành lui bước.')
  res = replaceAll(res, '气血逆涌,这一招被生生打断。', 'khí huyết nghịch chuyển, chiêu thức này bị đánh gãy giữa chừng.')
  res = replaceAll(res, '顺势反击!', 'thuận thế phản kích!')
  res = replaceAll(res, '罡盾崩碎,碎光尽数化作反震之力!', 'cương thuẫn vỡ nát, hào quang vỡ vụn đều hóa thành lực phản chấn!')
  res = replaceAll(res, '锋芒未敛,剑势连绵——锋连诀!', 'phong mang chưa dứt, kiếm thế liên miên —— Phong Liên Quyết!')
  res = replaceAll(res, '被震得气血翻涌,一时难以动弹!', 'bị chấn động khí huyết sôi trào, tạm thời khó lòng cử động!')
  res = replaceAll(res, '灵光护体,凝起一层护盾。', 'linh quang hộ thể, ngưng tụ một tầng hộ thuẫn.')
  res = replaceAll(res, '气血将尽,铁壁共鸣铮然作响——性命保住了!', 'khí huyết sắp cạn, Thiết Bích cộng hưởng leng keng rung động —— tính mạng giữ được rồi!')
  res = replaceAll(res, '却被', ', lại bị ')
  res = replaceAll(res, '身形一晃避开。', 'nghiêng mình né tránh.')
  res = replaceAll(res, '自行出手——', 'tự động xuất chiêu —— ')
  res = replaceAll(res, '吸取敌手精血——', 'hút lấy tinh huyết đối thủ —— ')
  res = replaceAll(res, '灵光大盛,护盾加身。', 'linh quang đại thịnh, hộ thuẫn gia thân.')
  res = replaceAll(res, '洒下灵光,', 'rải xuống linh quang, ')
  res = replaceAll(res, '伤势恢复。', 'thương thế hồi phục.')
  res = replaceAll(res, '摄住', 'nhiếp trụ ')
  res = replaceAll(res, '的心神,那一手没能出。', 'tâm thần, chiêu thức không thể xuất ra.')
  res = replaceAll(res, '的护体被撕开一道口子。', 'hộ thể bị xé rách một khe hở.')
  res = replaceAll(res, '发威,', 'phát uy, ')
  res = replaceAll(res, '的攻势被削弱了。', 'thế công bị suy yếu.')
  res = replaceAll(res, '岁月为你加冕——长生印生效,气血与护盾俱增;敌人杀意亦涨。', 'Năm tháng gia miện cho ngươi —— Trường Sinh Ấn có hiệu lực, khí huyết cùng hộ thuẫn đều tăng; sát ý của kẻ địch cũng dâng cao.')
  res = replaceAll(res, ' (重伤坠地)', '')
  res = replaceAll(res, ' (渡劫)', '')
  res = res.replace(/(.*)余温尚存[,，]心头微生暖意。/g, 'Hơi ấm của $1 vẫn còn vương lại, trong lòng khẽ dâng lên tia ấm áp.')
  res = res.replace(/(.*)余韵未消[,，]往事历历在目。/g, 'Dư vận của $1 chưa tan, chuyện xưa rõ ràng trước mắt.')
  res = res.replace(/(.*)渐行渐远[,，]归于寂静。/g, '$1 dần đi xa, quy về tịch tĩnh.')
  res = res.replace(/曾\s*(\d+)\s*败于此[,，]终斩此獠于剑下。如今残魂再现拦路\s*——\s*他似乎还认得你。/g, 'Từng $1 lần bại trận tại đây, cuối cùng chém kẻ này dưới kiếm. Nay tàn hồn lại hiện chắn đường —— Hắn dường như vẫn còn nhận ra ngươi.')
  for (const [zh, vi] of Object.entries(PHASE_LABEL_MAP)) {
    if (res.includes(zh + '!')) {
      res = replaceAll(res, zh + '!', vi + '!')
    }
  }
  res = replaceAll(res, '。', '.')
  res = replaceAll(res, '你', 'Ngươi ')
  res = res.replace(/\s+/g, ' ').replace(/\s+([,.!?])/g, '$1').trim()
  res = res.replace(/,([^\s0-9])/g, ', $1')

  return res
}

import {
  PILL_DESC_MAP,
  BUFF_NAME_MAP,
  BUFF_DESC_MAP,
  ARTIFACT_DESC_MAP,
  PET_NAME_MAP,
  BUILD_NAME_MAP,
  DAOLU_NAME_MAP,
  DAOLU_BRIEF_MAP,
  DAOLU_PURSUIT_MAP,
  DAOLU_TABOO_MAP,
  DAOLU_TEMPER_MAP,
  DAOLU_LEAN_MAP,
  DAOLU_STAGE_MAP,
  DAOLU_GATE_MAP,
  BOND_EVENT_TITLE_MAP,
  BOND_ENDING_MAP,
  BOND_TRIGGER_MAP,
  BOND_CHOICE_MAP,
  BOND_WISH_MAP,
  BOND_LIMIT_MAP,
  BOND_RESPONSE_MAP,
  CRAFT_WEAKNESS_MAP,
  EVENT_TITLE_MAP,
  EVENT_TEXT_MAP,
  EVENT_CHOICE_MAP,
  TIER_BRIEF_MAP
} from './displayMappings'
import {
  EVENT_TITLE_TRANSLATIONS,
  EVENT_TEXT_TRANSLATIONS,
  EVENT_CHOICE_TRANSLATIONS,
  EVENT_OUTCOME_TRANSLATIONS,
  CAVE_EVENT_TRANSLATIONS
} from './eventTranslations'

export function displayBuffName(name: string): string {
  if (!name) return ''
  return BUFF_NAME_MAP[name] ?? name
}

export function displayBuffDesc(desc: string): string {
  if (!desc) return ''
  return BUFF_DESC_MAP[desc] ?? desc
}

export function displayPillDesc(desc: string): string {
  if (!desc) return ''
  return PILL_DESC_MAP[desc] ?? desc
}

export function displayPillFuncText(text: string): string {
  if (!text) return ''
  let res = text

  // Match buff usage: 服之化开「name」:mods(持续 X 分钟)
  res = res.replace(/服之化开「(.*?)」:(.*?)\(持续\s*(\d+)\s*分钟\)/g, (_m, buffName, mods, mins) => {
    const bNameVi = displayBuffName(buffName)
    const modsVi = displayArtifactPassive(mods)
    return `Uống vào giải hóa「${bNameVi}」: ${modsVi} (Duy trì ${mins} phút)`
  })

  // Classical duration
  res = replaceAll(res, '一个半时辰', 'Một canh giờ rưỡi')
  res = replaceAll(res, '两个半时辰', 'Hai canh giờ rưỡi')
  res = replaceAll(res, '三个半时辰', 'Ba canh giờ rưỡi')
  res = replaceAll(res, '半个时辰', 'Nửa canh giờ')
  res = replaceAll(res, '一个时辰', 'Một canh giờ')
  res = replaceAll(res, '两个时辰', 'Hai canh giờ')
  res = replaceAll(res, '三个时辰', 'Ba canh giờ')
  res = replaceAll(res, '一炷香', 'Một nén nhang')
  res = replaceAll(res, '一盏茶', 'Một chén trà')
  res = replaceAll(res, '十三刻有余', 'Hơn mười ba khắc')
  res = replaceAll(res, '十八刻', 'Mười tám khắc')
  res = replaceAll(res, '九刻', 'Chín khắc')
  res = replaceAll(res, '六刻', 'Sáu khắc')
  res = replaceAll(res, '一刻有余', 'Hơn một khắc')
  res = replaceAll(res, '将近一刻', 'Gần một khắc')
  res = replaceAll(res, '一刻', 'Một khắc')

  // Herb grades
  res = replaceAll(res, '凡品灵草', 'Linh thảo Phàm phẩm')
  res = replaceAll(res, '良品灵草', 'Linh thảo Lương phẩm')
  res = replaceAll(res, '精品灵草', 'Linh thảo Tinh phẩm')
  res = replaceAll(res, '灵品灵草', 'Linh thảo Linh phẩm')
  res = replaceAll(res, '玄品灵草', 'Linh thảo Huyền phẩm')
  res = replaceAll(res, '地品灵草', 'Linh thảo Địa phẩm')
  res = replaceAll(res, '天品灵草', 'Linh thảo Thiên phẩm')
  res = replaceAll(res, '仙品灵草', 'Linh thảo Tiên phẩm')
  res = replaceAll(res, '神品灵草', 'Linh thảo Thần phẩm')
  res = replaceAll(res, '道品灵草', 'Linh thảo Đạo phẩm')

  // Stats and effects
  res = replaceAll(res, '服之:修为 +', 'Uống vào: Tu vi +')
  res = replaceAll(res, '服之:灵气 +', 'Uống vào: Linh khí +')
  res = replaceAll(res, '服之:寿元 +', 'Uống vào: Thọ nguyên +')
  res = replaceAll(res, '服之:悟道点 +', 'Uống vào: Điểm Ngộ Đạo +')
  res = replaceAll(res, '服之:上限的', 'Uống vào: Hồi phục ')
  res = replaceAll(res, '服之:', 'Uống vào: ')
  res = replaceAll(res, '上限的', 'giới hạn ')
  res = replaceAll(res, '茶香悟道', 'Trà Hương Ngộ Đạo')
  res = replaceAll(res, '战斗修为', 'Tu vi chiến đấu')
  res = replaceAll(res, '只入历练战胜之修为,静修不与', 'chỉ tính tu vi thắng lịch luyện, tĩnh tu không tính')
  res = replaceAll(res, '只入历练战胜之修为，静修不与', 'chỉ tính tu vi thắng lịch luyện, tĩnh tu không tính')
  res = replaceAll(res, '折合闭关', 'tương đương bế quan ')
  res = replaceAll(res, '至多不满一层', 'tối đa không quá 1 tầng')
  res = replaceAll(res, '载', ' năm')
  res = replaceAll(res, '点', ' điểm')
  res = replaceAll(res, '持续', 'duy trì ')
  res = replaceAll(res, '分钟', ' phút')
  res = replaceAll(res, '小时', ' giờ')
  res = replaceAll(res, '秒', ' giây')

  // Recipes and sources
  res = replaceAll(res, '有方:', 'Đan phương: ')
  res = replaceAll(res, '无方,只在历练掉落与际遇里偶得', 'Không có đơn, chỉ ngẫu nhiên nhận được từ rơi rớt lịch luyện và cơ duyên')
  res = replaceAll(res, '无方，只在历练掉落与际遇里偶得', 'Không có đơn, chỉ ngẫu nhiên nhận được từ rơi rớt lịch luyện và cơ duyên')
  res = replaceAll(res, '无方,', 'Không có đơn, ')
  res = replaceAll(res, '丹房可炼', 'Đan phòng có thể luyện')

  return displayArtifactPassive(res)
}

export function displayCraftWeakness(weakness: string): string {
  if (!weakness) return ''
  let text = weakness
  let prefix = ''
  if (text.startsWith('·')) {
    prefix = '· '
    text = text.slice(1).trim()
  }

  // Check direct mapping
  if (CRAFT_WEAKNESS_MAP[text]) {
    return prefix + CRAFT_WEAKNESS_MAP[text]
  }

  // Handle prefix labels like 凝丹不足:, 配伍不足:
  const colonIdx = text.indexOf(':')
  if (colonIdx !== -1) {
    const head = text.slice(0, colonIdx)
    const rest = text.slice(colonIdx + 1).trim()
    const headVi = head
      .replace('凝丹不足', 'Ngưng Đan chưa đủ')
      .replace('配伍不足', 'Phối Ngũ chưa đủ')
      .replace('辨药不足', 'Biện Dược chưa đủ')
      .replace('控火不足', 'Khống Hỏa chưa đủ')
      .replace('淬药不足', 'Thối Dược chưa đủ')
      .replace('养丹不足', 'Dưỡng Đan chưa đủ')
      .replace('识材不足', 'Thức Tài chưa đủ')
      .replace('锻打不足', 'Đoán Đả chưa đủ')
      .replace('铭纹不足', 'Minh Văn chưa đủ')
      .replace('丹方尚未烂熟于心', 'Đan phương chưa thuần thục')
    const restVi = CRAFT_WEAKNESS_MAP[rest] ?? rest
    return `${prefix}${headVi}: ${restVi}`
  }

  return prefix + (CRAFT_WEAKNESS_MAP[text] ?? text)
}

export function displayToastText(toast: string): string {
  if (!toast) return ''
  let res = toast

  if (res.includes('炉中一声闷响,丹毁了。') || res.includes('炉中一声闷响，丹毁了。')) {
    const after = res.replace(/炉中一声闷响[,，]丹毁了。/g, '').trim()
    const weaknessVi = displayCraftWeakness(after)
    return `Trong lò vang lên một tiếng trầm đục, đan đã hỏng rồi. ${weaknessVi}`
  }

  // 服下「...」,...
  if (res.startsWith('服下「')) {
    res = res.replace(/服下「(.*?)」[,，](.*)/g, (_m, pillName, effects) => {
      const nameVi = displayPillName(pillName)
      let effVi = effects
      effVi = replaceAll(effVi, '药力化开,状态加身', 'dược lực giải hóa, trạng thái gia thân')
      effVi = replaceAll(effVi, '药力已至上限,这一颗白费了', 'dược lực đã đạt giới hạn, viên này uổng phí rồi')
      effVi = replaceAll(effVi, '药力已至上限,这一颗只延续到顶', 'dược lực đã đạt giới hạn, viên này chỉ duy trì tới đỉnh')
      effVi = replaceAll(effVi, '药力温养周身', 'dược lực ôn dưỡng quanh thân')
      effVi = replaceAll(effVi, '修为精进', 'tu vi tinh tiến')
      effVi = replaceAll(effVi, '灵气充盈', 'linh khí tràn đầy')
      effVi = replaceAll(effVi, '修为 +', 'tu vi +')
      effVi = replaceAll(effVi, '寿元 +', 'thọ nguyên +')
      effVi = replaceAll(effVi, '悟道点 +', 'điểm Ngộ Đạo +')
      effVi = replaceAll(effVi, '载', ' năm')
      effVi = replaceAll(effVi, '约抵闭关', 'khoảng tương đương bế quan')
      effVi = replaceAll(effVi, '一个半时辰', 'Một canh giờ rưỡi')
      effVi = replaceAll(effVi, '两个半时辰', 'Hai canh giờ rưỡi')
      effVi = replaceAll(effVi, '三个半时辰', 'Ba canh giờ rưỡi')
      effVi = replaceAll(effVi, '半个时辰', 'Nửa canh giờ')
      effVi = replaceAll(effVi, '一个时辰', 'Một canh giờ')
      effVi = replaceAll(effVi, '两个时辰', 'Hai canh giờ')
      effVi = replaceAll(effVi, '三个时辰', 'Ba canh giờ')
      effVi = replaceAll(effVi, '一炷香', 'Một nén nhang')
      effVi = replaceAll(effVi, '一盏茶', 'Một chén trà')
      effVi = replaceAll(effVi, '十三刻有余', 'Hơn mười ba khắc')
      effVi = replaceAll(effVi, '十八刻', 'Mười tám khắc')
      effVi = replaceAll(effVi, '九刻', 'Chín khắc')
      effVi = replaceAll(effVi, '六刻', 'Sáu khắc')
      effVi = replaceAll(effVi, '一刻有余', 'Hơn một khắc')
      effVi = replaceAll(effVi, '将近一刻', 'Gần một khắc')
      effVi = replaceAll(effVi, '一刻', 'Một khắc')
      effVi = replaceAll(effVi, '分钟', ' phút')
      effVi = replaceAll(effVi, '小时', ' giờ')
      return `Uống vào「${nameVi}」, ${effVi}`
    })
  }

  // 连服 X 枚「...」
  if (res.startsWith('连服')) {
    res = res.replace(/连服\s*(\d+)\s*枚「(.*?)」(.*)/g, (_m, count, pillName, rest) => {
      const nameVi = displayPillName(pillName)
      let restVi = rest
      restVi = restVi.replace(/仅存\s*/g, 'chỉ còn ')
      restVi = restVi.replace(/\s*枚/g, ' viên')
      return `Uống liên tiếp ${count} viên「${nameVi}」${restVi}`
    })
  }

  // Crafting toasts
  res = replaceAll(res, '囊中无此丹', 'Túi không có đan này')
  res = replaceAll(res, '灵草或灵石未足,难开此炉', 'Linh thảo hoặc linh thạch chưa đủ, khó mở lò này')
  res = replaceAll(res, '尚不知此方,无从开炉', 'Chưa biết đan phương này, không thể mở lò')
  res = res.replace(/一炉双丹[,，]「(.*?)」品相极佳/g, (_m, pillName) => `Một lò song đan,「${displayPillName(pillName)}」phẩm tướng cực phẩm`)
  res = res.replace(/炉开丹成[,，]得「(.*?)」一枚/g, (_m, pillName) => `Lò mở đan thành, nhận được một viên「${displayPillName(pillName)}」`)

  // Batch craft pill
  res = res.replace(/连炼\s*(\d+)\s*炉「(.*?)」:成\s*(\d+)\s*枚(?:,炸\s*(\d+)\s*炉)?/g, (_m, rounds, name, made, failed) => {
    const pillVi = displayPillName(name)
    const failText = failed ? `, hỏng ${failed} lò` : ''
    return `Luyện liên tiếp ${rounds} lò「${pillVi}」: thành ${made} viên${failText}`
  })

  // Artifact batch
  res = res.replace(/连炼\s*(\d+)\s*重,已至第\s*(\d+)\s*重,共耗悟道×(\d+)\s*·\s*灵石\s*(.+)/g, (_m, count, cur, wudao, stone) => {
    return `Luyện liên tiếp ${count} tầng, đã đạt tầng ${cur}, tiêu hao Ngộ Đạo ×${wudao} · Linh Thạch ${stone}`
  })

  // Affix & Gear & Salvage toasts
  res = replaceAll(res, '器灵尘未足', 'Khí Linh Trần không đủ')
  res = replaceAll(res, '灵石未足', 'Linh Thạch không đủ')
  res = replaceAll(res, '同一件', 'Cùng một món')
  res = replaceAll(res, '装备不在', 'Trang bị không tồn tại')
  res = replaceAll(res, '此器化尘', 'Khí này hóa thành tro bụi')
  res = res.replace(/炉中化去\s*(\d+)\s*件,得器灵尘×(\d+)/g, 'Trong lò phân giải $1 món, nhận được Khí Linh Trần ×$2')
  res = res.replace(/已改名「(.*?)」/g, 'Đã đổi tên thành「$1」')
  res = replaceAll(res, '已改名', 'Đã đổi tên')
  res = replaceAll(res, '已存入行囊', 'Đã cất vào túi trữ vật')

  // Nemesis toasts
  res = res.replace(/败北\s*(\d+)\s*次[,，]此獠成了你的宿敌!/g, 'Bại trận $1 lần, kẻ này đã trở thành túc địch của ngươi!')
  res = replaceAll(res, '败于宿敌之手……', 'Thất bại dưới tay túc địch……')

  // Soul toasts
  res = replaceAll(res, '此器已锁,先解锁再凝', 'Vật phẩm này đã khóa, hãy mở khóa trước khi ngưng tụ')
  res = replaceAll(res, '身上之物无法入炉,先卸下', 'Vật phẩm trên người không thể vào lò, hãy tháo xuống trước')
  res = replaceAll(res, '此器平平无奇,无形意可存', 'Vật phẩm này bình thường không có gì lạ, không có hình ý để lưu tồn')
  res = res.replace(/神魂只容得下\s*(\d+)\s*缕形意,先散去一缕/g, 'Thần hồn chỉ chứa được $1 luồng hình ý, hãy giải tán bớt một luồng trước')
  res = res.replace(/「(.*?)」形销而意存,凝作(.*)/g, (_m, name, soul) => `「${name}」hình tiêu mà ý còn, ngưng tụ thành ${soul}`)
  res = res.replace(/(.*)散入天地/g, '$1 tiêu tán vào thiên địa')

  // Progress / Quests toasts
  res = res.replace(/成就达成「(.*?)」(.*)/g, (_m, name, rest) => {
    const restVi = rest ? displayRewardPreview(rest) : ''
    return `Thành tựu đạt thành「${name}」${restVi}`
  })
  res = res.replace(/任务完成「(.*?)」(.*)/g, (_m, name, rest) => {
    const restVi = rest ? displayRewardPreview(rest) : ''
    return `Nhiệm vụ hoàn thành「${name}」${restVi}`
  })
  res = res.replace(/日课已成「(.*?)」(.*)/g, (_m, name, rest) => {
    const restVi = rest ? displayRewardPreview(rest) : ''
    return `Nhật khóa hoàn thành「${name}」${restVi}`
  })
  res = res.replace(/获得称号「(.*?)」/g, (_m, titleName) => `Nhận được danh hiệu「${displayTitleName(titleName)}」`)

  return res
}

export function displayBattleAnalysisText(text: string): string {
  if (!text) return ''
  let res = text
  // Headline
  res = res.replace(/此战\s*(\d+)\s*回合而胜[,，]战后气血\s*(\d+)%/g, 'Trận này thắng sau $1 hiệp, khí huyết sau trận còn $2%')
  res = res.replace(/败于第\s*(\d+)\s*回合/g, 'Thất bại ở hiệp thứ $1')

  // Findings
  res = replaceAll(res, '并无明显短板,只是道行尚浅——修为与装备再进一步即可', 'Không có điểm yếu rõ rệt, chỉ là đạo hạnh còn nông cạn —— nâng cao tu vi cùng trang bị thêm một bước là được')
  res = replaceAll(res, '并无明显短板，只是道行尚浅——修为与装备再进一步即可', 'Không có điểm yếu rõ rệt, chỉ là đạo hạnh còn nông cạn —— nâng cao tu vi cùng trang bị thêm một bước là được')
  res = res.replace(/真伤占总承伤\s*(.*?),护盾与减伤被绕过/g, 'Sát thương chuẩn chiếm $1 tổng sát thương gánh chịu, hộ thuẫn cùng giảm thương bị bỏ qua')
  res = res.replace(/(\d+)\s*次出手落空\(落空率\s*(.*?)\),连击与暴击难以衔接/g, '$1 lần xuất chiêu đánh trượt (tỷ lệ trượt $2), liên kích cùng bạo kích khó lòng kết nối')
  res = res.replace(/单次重击最高打掉你\s*(.*?)\s*气血,硬抗不是办法/g, 'Đòn nặng đơn lẻ đánh tụt tối đa $1 khí huyết của ngươi, chống đỡ trực diện không phải là cách')
  res = res.replace(/鏖战\s*(\d+)\s*回合却几乎没有回复,久战无以为继/g, 'Huyết chiến $1 hiệp lại gần như không có hồi phục, chiến đấu lâu dài khó lòng duy trì')
  res = res.replace(/(\d+)\s*个回合被震慑打断,节奏尽失/g, '$1 hiệp bị uy chấn làm gián đoạn, hoàn toàn mất nhịp')
  res = res.replace(/先手判定是一条阈值:你\s*(.*?)\s*<\s*敌\s*(.*?),被对手抢了先。先手类词条再凑\s*(\d+)%\s*即可跨过这条线\(跨过即抢先,不必堆更多\)。/g, 'Phán định tiên thủ là một ngưỡng cố định: Bạn $1 < Địch $2, bị đối thủ ra tay trước. Từ khóa thuộc tính tiên thủ thêm $3% nữa là có thể vượt qua ngưỡng này (vượt qua là chiếm tiên thủ, không cần gom thêm).')
  res = res.replace(/敌之加成\((.*?)\):/g, 'Gia thành của địch ($1): ')
  res = replaceAll(res, '层级补偿', 'Bù trừ cảnh giới')
  res = replaceAll(res, '危地', 'Nguy địa')
  res = replaceAll(res, '增伤', 'Tăng sát thương')
  res = replaceAll(res, '减伤', 'Giảm sát thương')
  res = replaceAll(res, '三维', 'Tam duy')

  return res
}

export function displayEventTitle(title: string): string {
  if (!title) return ''
  return EVENT_TITLE_TRANSLATIONS[title] ?? EVENT_TITLE_MAP[title] ?? title
}

export function displayEventText(text: string): string {
  if (!text) return ''
  return EVENT_TEXT_TRANSLATIONS[text] ?? EVENT_TEXT_MAP[text] ?? text
}

export function displayEventChoiceLabel(label: string): string {
  if (!label) return ''
  return EVENT_CHOICE_TRANSLATIONS[label] ?? EVENT_CHOICE_MAP[label] ?? label
}

export function displayEventOutcomeText(text: string): string {
  if (!text) return ''
  return EVENT_OUTCOME_TRANSLATIONS[text] ?? text
}

export function displayChoiceHint(hint: string): string {
  if (!hint) return ''
  let res = hint
  res = replaceAll(res, '可能花费灵石', 'Có thể chi trả Linh Thạch')
  res = replaceAll(res, '花费灵石', 'Chi trả Linh Thạch')
  res = replaceAll(res, '需备灵石', 'Cần chuẩn bị Linh Thạch')
  res = replaceAll(res, '需备足', 'Cần chuẩn bị đủ')
  return res
}

export function displayCaveEventTitle(title?: string): string {
  if (!title) return ''
  return CAVE_EVENT_TRANSLATIONS[title] ?? title
}

export function displayCaveEventDesc(desc?: string): string {
  if (!desc) return ''
  return CAVE_EVENT_TRANSLATIONS[desc] ?? desc
}

export function displayCaveEventOptionLabel(label?: string): string {
  if (!label) return ''
  return CAVE_EVENT_TRANSLATIONS[label] ?? label
}

export function displayCaveOptionText(text: string): string {
  if (!text) return ''
  return displayModsText(text)
}

export function displayTierBrief(brief: string): string {
  if (!brief) return ''
  return TIER_BRIEF_MAP[brief] ?? brief
}

export function displayBuildName(name: string): string {
  if (!name) return ''
  return BUILD_NAME_MAP[name] ?? name
}

export function displayPetName(name: string): string {
  if (!name) return ''
  return PET_NAME_MAP[name] ?? name
}

export function displayDaoluName(name: string): string {
  if (!name) return ''
  if (DAOLU_NAME_MAP[name]) return DAOLU_NAME_MAP[name]
  let res = name
  for (const [zh, vi] of Object.entries(DAOLU_NAME_MAP)) {
    if (res.includes(zh)) {
      res = replaceAll(res, zh, vi)
    }
  }
  return res
}

export function displayDaoluBrief(brief: string): string {
  if (!brief) return ''
  return DAOLU_BRIEF_MAP[brief] ?? brief
}

export function displayDaoluPursuit(pursuit: string): string {
  if (!pursuit) return ''
  return DAOLU_PURSUIT_MAP[pursuit] ?? pursuit
}

export function displayDaoluTaboo(taboo: string): string {
  if (!taboo) return ''
  return DAOLU_TABOO_MAP[taboo] ?? taboo
}

export function displayDaoluTemper(temper: string): string {
  if (!temper) return ''
  return DAOLU_TEMPER_MAP[temper] ?? temper
}

export function displayDaoluLean(lean: string): string {
  if (!lean) return ''
  return DAOLU_LEAN_MAP[lean] ?? lean
}

export function displayDaoluStage(stage: string): string {
  if (!stage) return ''
  return DAOLU_STAGE_MAP[stage] ?? stage
}

export function displayGateHint(hint: string): string {
  if (!hint) return ''
  return DAOLU_GATE_MAP[hint] ?? hint
}

export function displayBondEventTitle(title: string): string {
  if (!title) return ''
  return BOND_EVENT_TITLE_MAP[title] ?? title
}

export function displayBondEnding(ending: string): string {
  if (!ending) return ''
  return BOND_ENDING_MAP[ending] ?? ending
}

export function displayBondEventText(text: string): string {
  if (!text) return ''
  return text
}

export function displayBondEventWish(wish: string): string {
  if (!wish) return ''
  return BOND_WISH_MAP[wish] ?? wish
}

export function displayBondEventLimit(limit: string): string {
  if (!limit) return ''
  return BOND_LIMIT_MAP[limit] ?? limit
}

export function displayBondChoiceLabel(label: string): string {
  if (!label) return ''
  return BOND_CHOICE_MAP[label] ?? label
}

export function displayBondTrigger(trigger: string): string {
  if (!trigger) return ''
  return BOND_TRIGGER_MAP[trigger] ?? trigger
}

export function displayBondResponse(resp: string): string {
  if (!resp) return ''
  return BOND_RESPONSE_MAP[resp] ?? resp
}

export function displayTierOdds(odds: string): string {
  if (!odds) return ''
  return odds.replace(/约每/g, 'Ước chừng mỗi ').replace(/程一次/g, ' chặng một lần')
}

export function displayIdentityNarrative(narrative: string): string {
  if (!narrative) return ''
  let res = narrative
  res = replaceAll(res, '曾丹方得承认', 'Từng được đan phương thừa nhận ')
  res = replaceAll(res, '立身', ' lập thân, ')
  res = replaceAll(res, '悟至杀伐', 'ngộ đến sát phạt')
  res = replaceAll(res, '悟至', 'ngộ đến ')
  res = replaceAll(res, '偏于以险求胜', 'thiên về lấy hiểm cầu thắng')
  res = replaceAll(res, '诸事观之,此修士', 'Xem xét mọi sự, tu sĩ này ')
  res = replaceAll(res, '诸事观之，此修士', 'Xem xét mọi sự, tu sĩ này ')
  res = replaceAll(res, '之相已现', ' chi tướng đã hiển hiện')
  res = replaceAll(res, '反震', 'Phản Chấn ')
  res = replaceAll(res, '背水', 'Bối Thủy ')
  res = replaceAll(res, '与', ' và ')
  res = replaceAll(res, '。', '. ')
  res = replaceAll(res, '，', ', ')
  return res.replace(/\s+/g, ' ').trim()
}

// ==================== MODS & STAT NAMES LOCALIZATION ====================

export const STAT_LABEL_MAP: Record<string, string> = {
  '攻击': 'Tấn Công',
  '防御': 'Phòng Ngự',
  '生命上限': 'Sinh Mệnh Tối Đa',
  '暴击率': 'Tỉ Lệ Bạo Kích',
  '暴击伤害': 'Sát Thương Bạo Kích',
  '先手判定': 'Phán Định Tiên Thủ',
  '伤害增幅': 'Tăng Sát Thương',
  '伤害减免': 'Giảm Sát Thương',
  '修炼速度': 'Tốc Độ Tu Luyện',
  '灵气恢复': 'Hồi Linh Khí',
  '进阶成功率': 'Tỉ Lệ Tiến Giai',
  '气运': 'Khí Vận',
  '历练遇敌': 'Lịch Luyện Gặp Địch',
  '寿元上限': 'Thọ Nguyên Tối Đa',
  '战利灵石': 'Linh Thạch Chiến Lợi',
  '装备掉落率': 'Tỉ Lệ Rơi Trang Bị',
  '战斗修为': 'Tu Vi Chiến Đấu',
  '双枚成丹': 'Song Mai Thành Đan',
  '强化减耗': 'Giảm Hao Tổn Cường Hóa',
  '灵气上限': 'Linh Khí Tối Đa',
  '灵兽效果': 'Hiệu Quả Linh Thú',
  '破甲': 'Phá Giáp',
  '首回合伤害': 'Sát Thương Lượt Đầu',
  '反击概率': 'Tỉ Lệ Phản Kích',
  '吸血': 'Hút Máu',
  '开战护盾': 'Hộ Thuẫn Khai Chiến',
  '处决伤害': 'Sát Thương Hành Quyết',
  '回合回复': 'Hồi Phục Mỗi Lượt',
  '闪避': 'Né Tránh',
  '命中': 'Chính Xác',
  '濒危减伤': 'Giảm Thương Khi Nguy Cấp',
  '失败返还修为': 'Hoàn Trả Tu Vi Khi Thất Bại',
  '双倍战利': 'Gấp Đôi Chiến Lợi',
  '历练际遇': 'Kỳ Ngộ Lịch Luyện',
  '御劫': 'Ngự Kiếp',
  '连击': 'Liên Kích',
  '震慑': 'Uy Nhiếp',
  '背水增伤': 'Tăng Thương Bối Thủy',
  '锋芒增伤': 'Tăng Thương Phong Mang',
  '罡盾增伤': 'Tăng Thương Cương Thuẫn',
  '追击威力': 'Uy Lực Truy Kích',
  '反击威力': 'Uy Lực Phản Kích',
  '溢疗成盾': 'Tràn Trị Liệu Thành Khiên',
  '气血': 'Khí Huyết'
}

export const STAT_CAVEAT_MAP: Record<string, string> = {
  '只入小进阶;大关天劫不与': 'cần cho tiểu tiến giai; đại quan thiên kiếp không tính',
  '主器物成色;小进阶另借此数半成': 'chủ yếu ảnh hưởng phẩm chất vật phẩm; tiểu tiến giai được hưởng thêm nửa phần',
  '只还败时所损修为;灵气不退': 'chỉ hoàn lại tu vi tổn thất khi bại; linh khí không hoàn',
  '再得一枚之机;与手艺合计不过八成': 'cơ hội nhận thêm một viên; cộng với thủ nghệ không quá 80%',
  '同程妖踪更密;行程不减': 'yêu thú dày đặc hơn trên cùng hành trình; chiều dài hành trình không giảm',
  '只入历练战胜之石;洞府所产不与': 'chỉ tính linh thạch thắng trận lịch luyện; động phủ sinh ra không tính',
  '只省装备强化之耗;法宝祭炼不与': 'chỉ giảm hao phí cường hóa trang bị; tế luyện pháp bảo không tính',
  '只增装备现世;灵石草矿不与': 'chỉ tăng rơi trang bị; linh thạch, thảo mộc, quặng không tính',
  '只增历练途中际遇;洞府巡游不与': 'chỉ tăng kỳ ngộ trên đường lịch luyện; tuần du động phủ không tính',
  '当场灵石、修为、材料与装备一并翻倍': 'linh thạch, tu vi, nguyên liệu và trang bị tại trận đồng loạt nhân đôi',
  '只入历练战胜之修为;静修不与': 'chỉ tính tu vi thắng trận lịch luyện; tĩnh tu không tính',
  '只减天劫之伤;小进阶之骰不改': 'chỉ giảm sát thương thiên kiếp; không đổi xúc xắc tiểu tiến giai',
  '灵气上限上浮,积余之仓随之': 'linh khí tối đa tăng lên, dung lượng tích trữ tăng theo',
  '放大灵兽词条;灵兽园等级不在其中': 'khuếch đại từ điều linh thú; cấp Linh Thú Viên không tính',
  '须不弱于对手,方得抢先': 'cần không yếu hơn đối thủ mới được đi trước',
  '只重开局一合;不改谁先出手': 'chỉ tính hiệp đầu khai chiến; không đổi ai ra tay trước',
  '须高于对手命中,方得避开': 'cần cao hơn độ chính xác của đối thủ mới có thể né tránh',
  '只抵对手闪避;不闪则无增益': 'chỉ khắc chế né tránh của đối thủ; không né thì không có lợi ích',
  '须护盾仍在': 'cần hộ thuẫn còn tồn tại',
  '先削其防,再入减免;不是真伤': 'trước giảm phòng ngự, sau mới trừ miễn thương; không phải sát thương chuẩn',
  '另起一击,非连段暴击': 'đánh thêm một đòn, không phải bạo kích nhiều đoạn',
  '只增追击,不增本击': 'chỉ tăng truy kích, không tăng bản kích',
  '受击后方可还手': 'bị đánh trúng mới có thể trả đòn',
  '只增反击,不增本击': 'chỉ tăng phản kích, không tăng bản kích',
  '震慑一合;净念或可破之': 'uy nhiếp một hiệp; tịnh niệm có thể hóa giải',
  '按造成之伤回血': 'hồi máu theo lượng sát thương gây ra',
  '回合初回血;已满则无': 'hồi máu đầu mỗi hiệp; đã đầy thì không có tác dụng',
  '只化溢出之疗': 'chỉ chuyển hóa phần trị liệu bị tràn'
}

export function displayStatLabel(label: string): string {
  if (!label) return ''
  return STAT_LABEL_MAP[label] ?? label
}

export function displayStatCaveat(text: string): string {
  if (!text) return ''
  if (STAT_CAVEAT_MAP[text]) return STAT_CAVEAT_MAP[text]
  let res = text
  res = res.replace(/叠于固有会心 (.+) 之上/g, (_m, p1) => `xếp chồng trên Hội Tâm cơ bản ${p1}`)
  res = res.replace(/叠于固有会心之伤 (.+) 之上/g, (_m, p1) => `xếp chồng trên Sát Thương Hội Tâm cơ bản ${p1}`)
  res = res.replace(/只伤气血未满 (.+) 之敌/g, (_m, p1) => `chỉ gây thêm thương tổn cho địch có khí huyết dưới ${p1}`)
  res = res.replace(/须己身气血未满 (.+)/g, (_m, p1) => `cần khí huyết bản thân dưới ${p1}`)
  res = res.replace(/须己身气血逾 (.+)/g, (_m, p1) => `cần khí huyết bản thân vượt trên ${p1}`)
  res = res.replace(/开战凝盾;总量不过 (.+) 气血/g, (_m, p1) => `khai chiến ngưng thuẫn; tổng lượng không quá ${p1} khí huyết`)
  return res
}

export function displayStatValue(valueText: string): string {
  if (!valueText) return ''
  return valueText.replace(/\(([^)]+)\)/g, (_m, caveat) => `(${displayStatCaveat(caveat)})`)
}

export function displayModsText(text: string): string {
  if (!text) return ''
  let res = text
  for (const [zh, vi] of Object.entries(STAT_CAVEAT_MAP)) {
    if (res.includes(zh)) {
      res = replaceAll(res, zh, vi)
    }
  }
  res = displayStatCaveat(res)
  const sortedLabels = Object.entries(STAT_LABEL_MAP).sort((a, b) => b[0].length - a[0].length)
  for (const [zh, vi] of sortedLabels) {
    if (res.includes(zh)) {
      res = replaceAll(res, zh, vi)
    }
  }
  return res
}

export function displayGNVi(str: string): string {
  if (!str) return ''
  let res = str
  res = replaceAll(res, '万', ' Vạn')
  res = replaceAll(res, '亿', ' Ức')
  res = replaceAll(res, '兆', ' Triệu')
  res = replaceAll(res, '京', ' Kinh')
  res = replaceAll(res, '垓', ' Cai')
  res = replaceAll(res, '秭', ' Tỉ')
  res = replaceAll(res, '穰', ' Nhưỡng')
  res = replaceAll(res, '沟', ' Câu')
  res = replaceAll(res, '涧', ' Giản')
  res = replaceAll(res, '正', ' Chính')
  res = replaceAll(res, '载', ' Tái')
  res = replaceAll(res, '极', ' Cực')
  return res
}

const HERB_GRADE_SHORT_VI: Record<number, string> = {
  1: 'Phàm Phẩm',
  2: 'Linh Phẩm',
  3: 'Tiên Phẩm',
  4: 'Thần Phẩm',
  5: 'Đạo Phẩm'
}

export function displayHerbGradeShort(grade: number): string {
  return HERB_GRADE_SHORT_VI[grade] ?? ''
}

export function displayOfflineAwayLine(text: string): string {
  if (!text) return ''
  let res = text
  res = replaceAll(res, '此去', 'Đã rời đi')
  res = replaceAll(res, '天', ' ngày ')
  res = replaceAll(res, '小时', ' giờ ')
  res = replaceAll(res, '分钟', ' phút ')
  res = replaceAll(res, '分', ' phút ')
  res = replaceAll(res, '秒', ' giây')
  res = replaceAll(res, '离线按', 'Ngoại tuyến tính')
  res = replaceAll(res, '收益计', 'thu ích')
  res = replaceAll(res, '收益按', 'Thu ích tính theo')
  res = replaceAll(res, '结算', 'kết toán')
  res = res.replace(/\s+/g, ' ')
  res = replaceAll(res, ' ·', ' ·')
  res = replaceAll(res, '( ', '(')
  return res.trim()
}

export function displayOfflineNote(note: string): string {
  if (!note) return ''

  // 1. Buff expiration: 「气运加身、混天一气、道胎不灭、清风拂面」已到期
  const buffMatch = note.match(/^「(.+)」已到期$/)
  if (buffMatch && buffMatch[1]) {
    const names = buffMatch[1].split('、').map(n => BUFF_NAME_MAP[n] ?? n)
    return `「${names.join(', ')}」đã hết hạn`
  }

  // 2. Suppress yield: 镇压诸域仍有余韵:灵石 +176.1万 · 玄铁 +46 · 凡品灵草 +132 · 功法残页 +30
  if (note.startsWith('镇压诸域仍有余韵:')) {
    let res = replaceAll(note, '镇压诸域仍有余韵:', 'Trấn áp các vực vẫn còn dư vận: ')
    res = replaceAll(res, '灵石', 'Linh Thạch')
    res = replaceAll(res, '玄铁', 'Huyền Thiết')
    res = replaceAll(res, '凡品灵草', 'Phàm Phẩm Linh Thảo')
    res = replaceAll(res, '灵品灵草', 'Linh Phẩm Linh Thảo')
    res = replaceAll(res, '仙品灵草', 'Tiên Phẩm Linh Thảo')
    res = replaceAll(res, '神品灵草', 'Thần Phẩm Linh Thảo')
    res = replaceAll(res, '道品灵草', 'Đạo Phẩm Linh Thảo')
    res = replaceAll(res, '功法残页', 'Công Pháp Tàn Trang')
    res = replaceAll(res, '器灵尘', 'Khí Linh Trần')
    return displayGNVi(res)
  }

  // 3. Exploration completion: 沉沙古城之行圆满结束
  const exploreMatch = note.match(/^(.+)之行圆满结束$/)
  if (exploreMatch && exploreMatch[1]) {
    const reg = REGION_NAME_MAP[exploreMatch[1]] ?? exploreMatch[1]
    return `Hành trình ${reg} viên mãn kết thúc`
  }

  // 4. Lifespan: 此去寿元流逝 2 载
  const ageMatch = note.match(/^此去寿元流逝\s*(\d+)\s*载$/)
  if (ageMatch && ageMatch[1]) {
    return `Chuyến đi này thọ nguyên trôi qua ${ageMatch[1]} năm`
  }

  // 5. Normal items to dust: 另有 2 件寻常之物,已折作器灵尘
  const dustMatch = note.match(/^另有\s*(\d+)\s*件寻常之物,已折作器灵尘$/)
  if (dustMatch && dustMatch[1]) {
    return `Ngoài ra có ${dustMatch[1]} vật phẩm tầm thường, đã quy đổi thành Khí Linh Trần`
  }

  // 6. Battles lost: 有 1 战失利,幸而全身而退
  const battleMatch = note.match(/^有\s*(\d+)\s*战失利,幸而全身而退$/)
  if (battleMatch && battleMatch[1]) {
    return `Có ${battleMatch[1]} trận thất lợi, may mắn toàn thân trở lui`
  }

  // 7. Boss defeat: 挂单之间,你已将【...】斩于剑下(离线战果,收益折损)
  const bossWin = note.match(/^挂单之间,你已将【(.+)】斩于剑下\(离线战果,收益折损\)$/)
  if (bossWin && bossWin[1]) {
    const boss = ENEMY_NAME_MAP[bossWin[1]] ?? bossWin[1]
    return `Trong lúc bận rộn, ngươi đã chém 【${boss}】 dưới mũi kiếm (chiến quả ngoại tuyến, thu ích chiết giảm)`
  }

  // 8. Boss retreat: 曾遭遇区域之主【...】,惜败而退,需再蓄力
  const bossLoss = note.match(/^曾遭遇区域之主【(.+)】,惜败而退,需再蓄力$/)
  if (bossLoss && bossLoss[1]) {
    const boss = ENEMY_NAME_MAP[bossLoss[1]] ?? bossLoss[1]
    return `Từng tao ngộ chúa tể khu vực 【${boss}】, tiếc nuối bại lui, cần tích lũy thêm sức lực`
  }

  // 9. Secret realm / world run
  if (note.includes('秘境之行原样留着')) {
    return 'Hành trình Bí Cảnh vẫn giữ nguyên trạng —— số tầng, khí huyết và quy tắc không đổi, trở lại tiếp tục tiến bước'
  }
  if (note.includes('那趟远征仍在途')) {
    return 'Chuyến viễn chinh vẫn đang tiếp diễn —— số tầng và chiến tích giữ nguyên vẹn, trở lại tiếp tục tiến bước'
  }

  return displayGNVi(displayRealmName(note))
}

import { EQUIP_DESC_MAP } from './equipDescTranslations'
import { affixDef } from '@/data/affixes'

export function displayEquipDesc(desc: string): string {
  if (!desc) return ''
  return EQUIP_DESC_MAP[desc] ?? desc
}

const MENTOR_NAME_MAP: Record<string, string> = {
  '剑修': 'Kiếm Tu',
  '丹修': 'Đan Tu',
  '阵修': 'Trận Tu',
  '猎修': 'Liệp Tu'
}

export function displayMentorName(name: string): string {
  if (!name) return ''
  return MENTOR_NAME_MAP[name] ?? name
}

const MENTOR_MASTER_MAP: Record<string, string> = {
  '青松剑叟': 'Thanh Tùng Kiếm Tẩu',
  '百草婆婆': 'Bách Thảo Bà Bà',
  '玄机子': 'Huyền Cơ Tử',
  '哮天翁': 'Hao Thiên Ông'
}

export function displayMentorMaster(master: string): string {
  if (!master) return ''
  return MENTOR_MASTER_MAP[master] ?? master
}

const MENTOR_TITLE_MAP: Record<string, string> = {
  '一剑破万法': 'Nhất Kiếm Phá Vạn Pháp',
  '草木通神': 'Thảo Mộc Thông Thần',
  '定鼎乾坤': 'Định Đỉnh Càn Khôn',
  '踏遍山河': 'Đạp Biến Sơn Hà'
}

export function displayMentorTitle(title: string): string {
  if (!title) return ''
  return MENTOR_TITLE_MAP[title] ?? title
}

const MENTOR_DESC_MAP: Record<string, string> = {
  '锋芒更利,暴击更易': 'Phong mang càng bén, bạo kích càng dễ',
  '回合间回气,炉中更易出丹': 'Giữa hiệp hồi khí, trong lò dễ kết đan hơn',
  '开战便有护盾,受击更轻': 'Khai chiến liền có hộ thuẫn, nhận đòn nhẹ hơn',
  '赶路更快,所得更多': 'Đường đi nhanh hơn, thu hoạch nhiều hơn'
}

export function displayMentorDesc(desc: string): string {
  if (!desc) return ''
  return MENTOR_DESC_MAP[desc] ?? desc
}

const MENTOR_NARRATIVE_MAP: Record<string, string> = {
  '师尊抚剑而笑:「剑心渐明,锋芒初露。」': 'Sư tôn vuốt kiếm mỉm cười: "Kiếm tâm dần sáng, phong mang sơ lộ."',
  '师尊摇头:「剑意未纯。你心中有剑,手里却无剑。」': 'Sư tôn lắc đầu: "Kiếm ý chưa thuần. Lòng ngươi có kiếm, nhưng trong tay lại không kiếm."',
  '师尊捻须:「丹道亦是道,你已得其味。」': 'Sư tôn vuốt râu: "Đan đạo cũng là đạo, ngươi đã hiểu được vị của nó."',
  '师尊叹曰:「丹炉蒙尘久矣。你求的是药,还是力?」': 'Sư tôn thở dài: "Lò đan đã phủ bụi từ lâu. Thứ ngươi cầu là dược, hay là lực?"',
  '师尊抚阵纹:「以阵护道,此心甚稳。」': 'Sư tôn vuốt trận văn: "Lấy trận hộ đạo, tâm này rất vững."',
  '师尊蹙眉:「阵脚虚浮。守不住,何谈困敌?」': 'Sư tôn nhíu mày: "Trận cước hư phù. Thủ còn không được, nói chi khốn địch?"',
  '师尊拍肩:「行万里路,猎万兽。你正是猎修的苗子。」': 'Sư tôn vỗ vai: "Đi vạn dặm đường, săn vạn thú. Ngươi đúng là hạt giống của Liệp Tu."',
  '师尊远望:「你足不出户,也配称猎?」': 'Sư tôn nhìn ra xa: "Ngươi chân không bước ra khỏi cửa, cũng xứng xưng là Liệp?"'
}

export function displayMentorNarrative(line: string): string {
  if (!line) return ''
  return MENTOR_NARRATIVE_MAP[line] ?? line
}

const AFFIX_NAME_MAP: Record<string, string> = {
  '锋锐': 'Phong Nhuệ',
  '破军': 'Phá Quân',
  '灭世': 'Diệt Thế',
  '开天': 'Khai Thiên',
  '坚壁': 'Kiên Bích',
  '磐石': 'Bàn Thạch',
  '不朽': 'Bất Hủ',
  '亘古': 'Cổ Cổ',
  '蕴生': 'Uẩn Sinh',
  '厚土': 'Hậu Thổ',
  '长生': 'Trường Sinh',
  '不灭': 'Bất Diệt',
  '会心': 'Hội Tâm',
  '锐目': 'Nhuệ Mục',
  '天瞳': 'Thiên Đồng',
  '重击': 'Trọng Kích',
  '碎玉': 'Toái Ngọc',
  '裂空': 'Liệt Không',
  '诛天': 'Tru Thiên',
  '破妄': 'Phá Vọng',
  '诛邪': 'Tru Tà',
  '屠灭': 'Đồ Diệt',
  '云甲': 'Vân Giáp',
  '霞衣': 'Hà Y',
  '不坏': 'Bất Hoại',
  '静心': 'Tĩnh Tâm',
  '悟道': 'Ngộ Đạo',
  '天启': 'Thiên Khải',
  '证道': 'Chứng Đạo',
  '聚灵': 'Tụ Linh',
  '引灵': 'Dẫn Linh',
  '吞灵': 'Thôn Linh',
  '通明': 'Thông Minh',
  '道基': 'Đạo Cơ',
  '天命': 'Thiên Mệnh',
  '福缘': 'Phúc Duyên',
  '鸿运': 'Hồng Vận',
  '天眷': 'Thiên Quyến',
  '疾行': 'Tật Hành',
  '御风': 'Ngự Phong',
  '寻踪': 'Tầm Tung',
  '迅捷': 'Tấn Tiệp',
  '流光': 'Lưu Quang',
  '瞬影': 'Thuấn Ảnh',
  '参悟': 'Tham Ngộ',
  '明心': 'Minh Tâm',
  '大彻': 'Đại Triệt',
  '聚财': 'Tụ Tài',
  '点金': 'Điểm Kim',
  '化宝': 'Hóa Bảo',
  '寻宝': 'Tầm Bảo',
  '探骊': 'Thám Li',
  '摘星': 'Trích Tinh',
  '破甲': 'Phá Giáp',
  '碎甲': 'Toái Giáp',
  '洞虚': 'Động Hư',
  '先发': 'Tiên Phát',
  '雷霆': 'Lôi Đình',
  '反击': 'Phản Kích',
  '荆棘': 'Kinh Cức',
  '噬血': 'Phệ Huyết',
  '血魔': 'Huyết Ma',
  '化生': 'Hóa Sinh',
  '护体': 'Hộ Thể',
  '罡罩': 'Cương Tráo',
  '琉璃': 'Lưu Ly',
  '斩灭': 'Trảm Diệt',
  '断魂': 'Đoạn Hồn',
  '回春': 'Hồi Xuân',
  '造化': 'Tạo Hóa',
  '不息': 'Bất Tức',
  '轻身': 'Khinh Thân',
  '虚步': 'Hư Bộ',
  '化影': 'Hóa Ảnh',
  '洞彻': 'Động Triệt',
  '明察': 'Minh Sát',
  '背水': 'Bối Thủy',
  '涅槃': 'Niết Bàn',
  '稳固': 'Vững Chắc',
  '道心': 'Đạo Tâm',
  '丰饶': 'Phong Nhiêu',
  '满载': 'Mãn Tải',
  '际遇': 'Tế Ngộ',
  '仙缘': 'Tiên Duyên',
  '御雷': 'Ngự Lôi',
  '渡厄': 'Độ Ách',
  '劫外': 'Kiếp Ngoại',
  '连击': 'Liên Kích',
  '疾风': 'Tật Phong',
  '震慑': 'Chấn Nhiếp',
  '镇岳': 'Trấn Nhạc',
  '养寿': 'Dưỡng Thọ',
  '龟息': 'Quy Tức',
  '长存': 'Trường Tồn',
  '丹心': 'Đan Tâm',
  '丹圣': 'Đan Thánh',
  '巧手': 'Xảo Thủ',
  '器道': 'Khí Đạo',
  '轻鸿': 'Khinh Hồng',
  '踏虚': 'Đạp Hư',
  '御空': 'Ngự Không',
  '饮灵': 'Ẩm Linh',
  '吮魄': 'Thuẫn Phách',
  '噬命': 'Phệ Mệnh',
  '背水一击': 'Bối Thủy Nhất Kích',
  '向死而生': 'Hướng Tử Nhi Sinh',
  '绝境道心': 'Tuyệt Cảnh Đạo Tâm',
  '锋芒': 'Phong Mang',
  '一鼓作气': 'Nhất Cổ Tác Khí',
  '罡盾': 'Cương Thuẫn',
  '盾魂': 'Thuẫn Hồn',
  '连环': 'Liên Hoàn',
  '风雷九连': 'Phong Lôi Cửu Liên',
  '锋反': 'Phong Phản',
  '万刃归返': 'Vạn Nhận Quy Phản',
  '余泽': 'Dư Trạch',
  '生生不息': 'Sinh Sinh Bất Tức',
  '造化盾心': 'Tạo Hóa Thuẫn Tâm'
}

export function displayAffixName(name: string): string {
  if (!name) return ''
  return AFFIX_NAME_MAP[name] ?? name
}

const AFFIX_RARITY_MAP: Record<string, string> = {
  '常见': 'Thường',
  '稀有': 'Hiếm',
  '珍稀': 'Trân quý',
  '传世': 'Truyền thế'
}

export function displayAffixRarity(rarityName: string): string {
  if (!rarityName) return ''
  return AFFIX_RARITY_MAP[rarityName] ?? rarityName
}

export function displayAffixRoll(rollText: string): string {
  if (!rollText) return ''
  return rollText.replace(/^浮\s*/, '~')
}

const AFFIX_TEMPLATE_MAP: Record<string, string> = {
  '攻击提升 {v}%': 'Tấn công tăng {v}%',
  '防御提升 {v}%': 'Phòng ngự tăng {v}%',
  '生命上限提升 {v}%': 'Khí huyết tối đa tăng {v}%',
  '暴击率提升 {v}%': 'Tỉ lệ bạo kích tăng {v}%',
  '暴击伤害提升 {v}%': 'Sát thương bạo kích tăng {v}%',
  '造成伤害提升 {v}%': 'Sát thương tạo thành tăng {v}%',
  '受到伤害降低 {v}%': 'Sát thương gánh chịu giảm {v}%',
  '修炼速度提升 {v}%': 'Tốc độ tu luyện tăng {v}%',
  '灵气恢复提升 {v}%': 'Hồi phục linh khí tăng {v}%',
  '进阶成功率提升 {v}%': 'Tỉ lệ tiến giai tăng {v}%',
  '气运提升 {v}%': 'Khí vận tăng {v}%',
  '同程妖踪 +{v}%': 'Cùng hành trình yêu tung +{v}%',
  '先手判定 +{v}%': 'Phán định tiên thủ +{v}%',
  '战斗所得修为提升 {v}%': 'Tu vi nhận từ chiến đấu tăng {v}%',
  '战利灵石提升 {v}%': 'Chiến lợi linh thạch tăng {v}%',
  '装备掉落率提升 {v}%': 'Tỉ lệ rớt trang bị tăng {v}%',
  '攻击时无视目标 {v}% 防御': 'Khi tấn công bỏ qua {v}% phòng ngự của mục tiêu',
  '首回合造成伤害提升 {v}%': 'Sát thương tạo thành ở hiệp đầu tăng {v}%',
  '受击后 {v}% 概率反击': 'Sau khi nhận đòn có {v}% xác suất phản kích',
  '造成伤害的 {v}% 转化为生命': '{v}% sát thương tạo thành chuyển hóa thành khí huyết',
  '开战获得 {v}% 生命的护盾': 'Vào trận nhận hộ thuẫn bằng {v}% khí huyết',
  '对生命低于三成之敌伤害提升 {v}%': 'Sát thương lên kẻ địch dưới 30% khí huyết tăng {v}%',
  '每回合回复 {v}% 生命': 'Mỗi hiệp hồi phục {v}% khí huyết',
  '闪避概率提升 {v}%': 'Tỉ lệ né tránh tăng {v}%',
  '无视目标 {v}% 闪避': 'Bỏ qua {v}% né tránh của mục tiêu',
  '生命低于三成时受伤降低 {v}%': 'Khi khí huyết dưới 30%, sát thương gánh chịu giảm {v}%',
  '突破失败返还 {v}% 损耗修为': 'Đột phá thất bại hoàn trả {v}% tu vi tổn thất',
  '{v}% 概率当场战利翻倍': '{v}% xác suất nhân đôi chiến lợi phẩm tại chỗ',
  '历练际遇提升 {v}%': 'Cơ duyên lịch luyện tăng {v}%',
  '天劫伤害降低 {v}%': 'Sát thương thiên kiếp giảm {v}%',
  '攻击后 {v}% 概率追击': 'Sau khi tấn công có {v}% xác suất truy kích',
  '攻击 {v}% 概率震慑目标一回合': 'Tấn công có {v}% xác suất chấn nhiếp mục tiêu 1 hiệp',
  '寿元上限提升 {v}%': 'Thọ nguyên tối đa tăng {v}%',
  '双枚成丹概率提升 {v}%': 'Xác suất song đan thành dược tăng {v}%',
  '强化消耗降低 {v}%': 'Tiêu hao cường hóa giảm {v}%',
  '生命低于三成时造成伤害提升 {v}%': 'Khi khí huyết dưới 30%, sát thương tạo thành tăng {v}%',
  '生命高于九成时造成伤害提升 {v}%': 'Khi khí huyết trên 90%, sát thương tạo thành tăng {v}%',
  '持有护盾时造成伤害提升 {v}%': 'Khi có hộ thuẫn, sát thương tạo thành tăng {v}%',
  '追击造成的伤害提升 {v}%': 'Sát thương tạo thành từ truy kích tăng {v}%',
  '反击造成的伤害提升 {v}%': 'Sát thương tạo thành từ phản kích tăng {v}%',
  '溢出治疗的 {v}% 转化为护盾': '{v}% trị liệu tràn chuyển hóa thành hộ thuẫn'
}

export function displayAffixDescParts(line: { id: string; before: string; after: string }): { before: string; after: string } {
  const def = affixDef(line.id)
  const template = def ? AFFIX_TEMPLATE_MAP[def.desc] : undefined
  if (template) {
    const [b = '', a = ''] = template.split('{v}')
    return { before: b, after: a }
  }
  return { before: line.before, after: line.after }
}

const TRANSFER_LABEL_MAP: Record<string, string> = {
  '转移词条': 'Chuyển Từ Điều',
  '耗费': 'Tiêu hao',
  '顶替': 'Thay thế',
  '原器将失去': 'Trang bị gốc sẽ mất',
  '穿戴中': 'Đang trang bị',
  '取消': 'Hủy bỏ',
  '确认转移': 'Xác nhận chuyển',
  '返回': 'Trở về',
  '去挑选': 'Đi chọn',
  '移出词条': 'Từ điều chuyển ra',
  '重选': 'Chọn lại',
  '原器无词条可移': 'Trang bị gốc không có từ điều để chuyển',
  '已封存': 'Đã phong tồn',
  '移入目标': 'Mục tiêu chuyển vào',
  '查看': 'Xem',
  '无合规目标': 'Không có mục tiêu phù hợp',
  '落脚位置': 'Vị trí tiếp nhận',
  '追加一栏': 'Thêm một ô',
  '转移后': 'Sau khi chuyển',
  '新增': 'Mới',
  '原器封存已随条保留': 'Phong tồn của trang bị gốc được giữ nguyên',
  '补封印费': 'Bổ sung phí phong ấn',
  '封存已满': 'Phong tồn đã đầy',
  '属性净变': 'Biến động thuộc tính'
}

export function displayTransferLabel(label: string): string {
  if (!label) return ''
  return TRANSFER_LABEL_MAP[label] ?? label
}

const TRANSFER_BLOCK_MAP: Record<string, string> = {
  '同一件': 'Cùng một món',
  '无词条': 'Không có từ điều',
  '无模板': 'Không có mẫu',
  '部位不合': 'Bộ vị không hợp',
  '需同品': 'Cần cùng phẩm',
  '已有此条': 'Đã có từ điều này',
  '无处落脚': 'Không có chỗ tiếp nhận',
  '词条已满': 'Từ điều đã đầy',
  '词条同名': 'Trùng tên từ điều',
  '封存已满': 'Phong tồn đã đầy'
}

export function displayTransferBlock(blockText: string): string {
  if (!blockText) return ''
  if (TRANSFER_BLOCK_MAP[blockText]) return TRANSFER_BLOCK_MAP[blockText]
  const rankMatch = blockText.match(/^需(.)品$/)
  if (rankMatch && rankMatch[1]) {
    const qName = QUALITY_NAME_MAP[rankMatch[1] + '品'] ?? (rankMatch[1] + ' phẩm')
    return `Cần ${qName}`
  }
  return blockText
}

// ============ 天界 · 道途 / 特殊世界 / 虚界 / 试炼 / 契约 / 熔炉 展示层 ============

export function displayDaoPathName(name: string): string {
  if (!name) return ''
  return DAO_PATH_MAP[name] ?? name
}

export function displayDaoPathSeal(seal: string): string {
  if (!seal) return ''
  return DAO_SEAL_MAP[seal] ?? seal
}

export function displayDaoPathDesc(desc: string): string {
  if (!desc) return ''
  return DAO_DESC_MAP[desc] ?? desc
}

export function displayDaoPathRule(rule: string): string {
  if (!rule) return ''
  return DAO_RULE_MAP[rule] ?? rule
}

export function displayDaoPathDeep(deep: string): string {
  if (!deep) return ''
  return DAO_DEEP_MAP[deep] ?? deep
}

export function displayCelestialWorldName(name: string): string {
  if (!name) return ''
  if (CELESTIAL_WORLD_NAME_MAP[name]) return CELESTIAL_WORLD_NAME_MAP[name]
  return displayVoidWorldName(name)
}

export function displayCelestialWorldSeal(seal: string): string {
  if (!seal) return ''
  return CELESTIAL_WORLD_SEAL_MAP[seal] ?? VOID_SEAL_MAP[seal] ?? seal
}

export function displayCelestialWorldDesc(desc: string): string {
  if (!desc) return ''
  return CELESTIAL_WORLD_DESC_MAP[desc] ?? desc
}

export function displayCelestialWorldRule(rule: string): string {
  if (!rule) return ''
  return CELESTIAL_WORLD_RULE_MAP[rule] ?? rule
}

export function displayVoidWorldName(name: string): string {
  if (!name) return ''
  if (name.endsWith('之主')) {
    const base = name.slice(0, -2)
    return `${displayVoidWorldName(base)} Chi Chủ`
  }
  if (CELESTIAL_WORLD_NAME_MAP[name]) return CELESTIAL_WORLD_NAME_MAP[name]
  if (name.length === 3) {
    const head = VOID_HEAD_MAP[name.slice(0, 2)]
    const tail = VOID_TAIL_MAP[name.slice(2)]
    if (head && tail) return `${head} ${tail}`
  }
  return name
}

export function displayVoidWorldSeal(seal: string): string {
  if (!seal) return ''
  return VOID_SEAL_MAP[seal] ?? seal
}

export function displayVoidWorldDesc(desc: string): string {
  if (!desc) return ''
  let res = desc
  res = res.replace(/此乃「(.*?)」之界,天道以变数织成。/g, (_m, iden) => {
    const viIden = THEME_IDENTITY_MAP[iden] ?? iden
    return `Đây là thế giới 「${viIden}」, Thiên Đạo lấy biến số dệt thành. `
  })
  res = res.replace(/与诸天相似不足(\d+)成,规则无常,过审方存。/g, 'Tương tự chư thiên không đến $1 phần, quy tắc vô thường, qua thẩm định mới tồn tại.')
  return res
}

export function displayVoidWorldRule(rule: string): string {
  if (!rule) return ''
  if (CELESTIAL_WORLD_RULE_MAP[rule]) return CELESTIAL_WORLD_RULE_MAP[rule]
  const colonIdx = rule.indexOf(':')
  if (colonIdx > 0) {
    const namePart = rule.slice(0, colonIdx)
    const textPart = rule.slice(colonIdx + 1)
    return `${displayMutatorName(namePart)}: ${displayMutatorText(textPart)}`
  }
  return rule
}

export function displayRouteNodeName(name: string): string {
  if (!name) return ''
  if (ROUTE_NODE_NAME_MAP[name]) return ROUTE_NODE_NAME_MAP[name]
  if (name.length === 2) {
    const head = VOID_NODE_HEAD_MAP[name[0] ?? '']
    const tail = VOID_NODE_TAIL_MAP[name[1] ?? '']
    if (head && tail) return `${head} ${tail}`
  }
  return name
}

export function displayRouteNodeDesc(desc: string): string {
  if (!desc) return ''
  if (ROUTE_NODE_DESC_MAP[desc]) return ROUTE_NODE_DESC_MAP[desc]
  const match = desc.match(/^(.*?)盘踞于此$/)
  if (match && match[1]) {
    const rawTarget = match[1]
    if (rawTarget.startsWith('【') && rawTarget.endsWith('】')) {
      const inner = rawTarget.slice(1, -1)
      return `【${displayEnemyName(inner)}】 chiếm giữ nơi này`
    }
    return `${displayEnemyName(rawTarget)} chiếm giữ nơi này`
  }
  return desc
}

export function displayRouteRisk(risk: string): string {
  if (!risk) return ''
  return ROUTE_RISK_MAP[risk] ?? risk
}

export function displayTrialName(name: string): string {
  if (!name) return ''
  return TRIAL_NAME_MAP[name] ?? name
}

export function displayTrialSeal(seal: string): string {
  if (!seal) return ''
  return TRIAL_SEAL_MAP[seal] ?? seal
}

export function displayTrialDesc(desc: string): string {
  if (!desc) return ''
  return TRIAL_DESC_MAP[desc] ?? desc
}

export function displayTrialRule(rule: string): string {
  if (!rule) return ''
  return TRIAL_RULE_MAP[rule] ?? rule
}

export function displayPactName(name: string): string {
  if (!name) return ''
  return PACT_NAME_MAP[name] ?? name
}

export function displayPactSeal(seal: string): string {
  if (!seal) return ''
  return PACT_SEAL_MAP[seal] ?? seal
}

export function displayPactDesc(desc: string): string {
  if (!desc) return ''
  return PACT_DESC_MAP[desc] ?? desc
}

export function displayPactRule(rule: string): string {
  if (!rule) return ''
  return PACT_RULE_MAP[rule] ?? rule
}

export function displayFurnaceRateName(name: string): string {
  if (!name) return ''
  return FURNACE_RATE_MAP[name] ?? name
}

export function displayJudgementLine(line: string): string {
  if (!line) return ''
  let res = line
  res = res.replace(/^道之理解:你的构筑厚度 (.*?)\(基准 (.*?)\)—— 守关者三维 ×(.*)$/, 'Đạo chi lý giải: Độ dày cấu hình của ngươi $1 (cơ chuẩn $2) —— Tam vi thủ quan giả ×$3')
  res = res.replace(/^道之理解:路数被看破 —— 守关者增伤 \+(.*?)%、减伤 \+(.*?)%$/, 'Đạo chi lý giải: Lối đánh bị nhìn thấu —— Thủ quan giả tăng sát thương +$1%, giảm sát thương +$2%')
  res = res.replace(/^境界压制:未及此界该有的境界 —— 守关者额外增伤 \+(.*?)%$/, 'Cảnh giới áp chế: Chưa đạt đến cảnh giới giới này yêu cầu —— Thủ quan giả tăng thêm sát thương +$1%')
  res = replaceAll(res, '判定随你的厚度与境界而来 —— 换个方向而非继续堆,或再破一境,它自会退回去。', 'Phán đoán đến từ độ dày và cảnh giới của ngươi —— Hãy đổi hướng thay vì tiếp tục dồn ép, hoặc phá thêm một cảnh, nó sẽ tự lùi lại.')
  res = replaceAll(res, '这一界对你没有额外判定 —— 胜败只由三维与构筑形状决定。', 'Giới này không có phán đoán thêm đối với ngươi —— Thắng bại chỉ quyết định bởi tam vi và hình thái cấu hình.')
  res = replaceAll(res, '增伤', 'Tăng sát thương')
  res = replaceAll(res, '减伤', 'Giảm sát thương')
  res = replaceAll(res, '层级补偿', 'Bù trừ tầng bậc')
  res = replaceAll(res, '危地', 'Địa thế nguy hiểm')
  res = replaceAll(res, '首领', 'Thủ lĩnh')
  res = replaceAll(res, '道之理解', 'Đạo chi lý giải')
  res = replaceAll(res, '境界压制', 'Cảnh giới áp chế')
  res = replaceAll(res, '无判定', 'Không phán đoán')
  return res
}

const DIFFICULTY_MAP: Record<string, string> = {
  '闲庭信步': 'Nhàn Đình Tín Bộ',
  '略有凶险': 'Hơi Có Hung Hiểm',
  '凶险': 'Hung Hiểm',
  '九死一生': 'Cửu Tử Nhất Sinh',
  '胜券在望': 'Thắng Phần Nắm Chắc',
  '略占上风': 'Hơi Chiếm Thượng Phong',
  '胜负各半': 'Thắng Bại Chia Đôi'
}

export function displayChallengeDifficulty(diff: string): string {
  if (!diff) return ''
  return DIFFICULTY_MAP[diff] ?? diff
}

const REASON_MAP: Record<string, string> = {
  '此局近乎无解,天道不受此约': 'Cục diện này gần như vô giải, Thiên Đạo không nhận ước hẹn này',
  '此局形同虚设,不配称为挑战': 'Cục diện này thùng rỗng kêu to, không xứng gọi là khiêu chiến'
}

export function displayChallengeReason(reason: string | undefined): string | undefined {
  if (!reason) return undefined
  return REASON_MAP[reason] ?? reason
}

export function displayDaoStory(story: string | null): string | null {
  if (!story) return null
  let res = story
  res = res.replace(/^这一世你已换过 (\d+) 条路数——你的剑心并不执着于一途。$/, 'Kiếp này ngươi đã đổi qua $1 lối đánh —— Kiếm tâm của ngươi vốn chẳng chấp niệm vào một đường.')
  res = replaceAll(res, '一剑一世,道心如铁。', 'Một kiếm một kiếp, đạo tâm như sắt.')
  res = res.replace(/^你曾 (\d+) 次以残躯血契求胜——所谓长生,似乎并非你唯一所求。$/, 'Ngươi từng $1 lần dùng thân tàn huyết khế cầu thắng —— Cái gọi là trường sinh, dường như chẳng phải điều duy nhất ngươi kiếm tìm.')
  res = replaceAll(res, '你惜身如玉,确是长生之相。', 'Ngươi tiếc thân như ngọc, quả thực là tướng mạo trường sinh.')
  res = res.replace(/^你曾 (\d+) 次主动接下天道重注,杀伐之名不虚。$/, 'Ngươi từng $1 lần chủ động nhận lấy trọng chú của Thiên Đạo, danh tiếng sát phạt không ngoa.')
  res = replaceAll(res, '此世杀伐尚温,刀锋未尽出鞘。', 'Kiếp này sát phạt còn ôn hòa, lưỡi đao chưa hoàn toàn rời vỏ.')
  res = replaceAll(res, '你很少凭未知下注——天机在手,何必赌运。', 'Ngươi rất ít khi đặt cược vào điều chưa biết —— Thiên cơ trong tay, hà tất đánh cược vận may.')
  res = replaceAll(res, '窥天机而行险,亦是一种道。', 'Thấu thiên cơ mà mạo hiểm, cũng là một loại đạo.')
  return res
}

const RATE_TEXT_MAP: Record<string, string> = {
  '九死一生': 'Cửu tử nhất sinh',
  '凶险': 'Hung hiểm',
  '胜负各半': 'Thắng bại chia đôi',
  '略占上风': 'Hơi chiếm thượng phong',
  '稳操胜券': 'Nắm chắc phần thắng'
}

export function displayLegacyRateText(text: string): string {
  if (!text) return ''
  return RATE_TEXT_MAP[text] ?? text
}

export function displayLegacyDiffLine(line: string): string {
  if (!line) return ''
  let res = line
  res = replaceAll(res, '场均回合', 'Hiệp bình quân mỗi trận')
  res = replaceAll(res, '场均承伤', 'Chịu sát thương bq mỗi trận')
  res = replaceAll(res, '场均反击', 'Phản kích bq mỗi trận')
  res = replaceAll(res, ' 次', ' lần')
  return res
}





