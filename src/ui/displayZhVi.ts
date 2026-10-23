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

const PHASE_LABEL_MAP: Record<string, string> = {
  '狂化': 'Cuồng Hóa',
  '缠绕': 'Quấn Chặt',
  '噬法': 'Thôn Pháp',
  '真元迸发': 'Chân Nguyên Bộc Phát',
  '神速': 'Thần Tốc',
  '绝脉': 'Tuyệt Mạch',
  '暴怒': 'Bạo Nộ',
  '死战': 'Tử Chiến'
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
  GONGFA_DESC_MAP
} from './displayMappings'

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
  return ENEMY_NAME_MAP[name] ?? name
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

export function displayArtifactPassive(line: string): string {
  if (!line) return ''
  let res = line
  res = replaceAll(res, '攻击', 'Công kích')
  res = replaceAll(res, '生命上限', 'Sinh mệnh tối đa')
  res = replaceAll(res, '防御', 'Phòng ngự')
  res = replaceAll(res, '双枚成丹', 'Song Đan thành dược')
  res = replaceAll(res, '(再得一枚之机;与手艺合计不过八成)', '(Cơ hội thêm 1 viên; cộng dồn không quá 80%)')
  res = replaceAll(res, '（再得一枚之机；与手艺合计不过八成）', '(Cơ hội thêm 1 viên; cộng dồn không quá 80%)')
  return res
}

export function displayArtifactActiveDesc(desc: string): string {
  if (!desc) return ''
  let res = desc
  res = res.replace(/每\s*(\d+)\s*回合/g, 'Mỗi $1 hiệp ')
  res = replaceAll(res, '喷吐真火', 'phun ra chân hỏa')
  res = replaceAll(res, '喷出三昧真火', 'phun ra Tam Muội Chân Hỏa')
  res = replaceAll(res, '造成', 'tạo thành')
  res = replaceAll(res, '攻击伤害', 'sát thương công kích')
  res = replaceAll(res, '伤害', 'sát thương')
  res = replaceAll(res, '回复', 'hồi phục')
  res = replaceAll(res, '获得', 'nhận')
  res = replaceAll(res, '生命护盾', 'lá chắn sinh mệnh')
  res = replaceAll(res, '生命', 'sinh mệnh')
  res = replaceAll(res, '攻击', 'Công kích')
  res = replaceAll(res, '生命上限', 'Sinh mệnh tối đa')
  res = replaceAll(res, '防御', 'Phòng ngự')
  res = replaceAll(res, '双枚成丹', 'Song Đan thành dược')
  res = replaceAll(res, 'Thần thông uy lực', 'Uy lực thần thông')
  res = replaceAll(res, 'Thần thông hồi phục', 'Hồi phục thần thông')
  res = replaceAll(res, '(再得一枚之机;与手艺合计不过八成)', '(Cơ hội thêm 1 viên; cộng dồn không quá 80%)')
  res = replaceAll(res, '（再得一枚之机；与手艺合计不过八成）', '(Cơ hội thêm 1 viên; cộng dồn không quá 80%)')
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

  // Tên yêu thú / thủ lĩnh trong ngoặc vuông (tự thêm khoảng trắng phân tách nếu chữ tiếp theo liền kề)
  res = res.replace(/【(.*?)】(?=[^\s,.!?:;\uFF0C\u3002\uFF01\uFF1F])/g, (_m, name) => `【${displayEnemyName(name)}】 `)
  res = res.replace(/【(.*?)】/g, (_m, name) => `【${displayEnemyName(name)}】`)

  // Các mẫu chiến báo
  res = replaceAll(res, '你与', 'Ngươi và ')
  res = replaceAll(res, '狭路相逢!', 'ngõ hẹp tương phùng!')
  res = replaceAll(res, '你祭出一记攻势', 'Ngươi xuất chiêu một đòn công kích')
  res = replaceAll(res, '你祭出', 'Ngươi xuất chiêu ')
  res = replaceAll(res, '你施展', 'Ngươi thi triển ')
  res = replaceAll(res, '祭出一记攻势', 'xuất chiêu một đòn công kích')
  res = replaceAll(res, '祭出一记爪击', 'xuất chiêu một đòn trảo kích')
  res = replaceAll(res, '施展【', 'thi triển 【')
  res = replaceAll(res, '祭出', 'xuất chiêu ')
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
  res = replaceAll(res, '狂化!', 'Cuồng Hóa!')
  res = replaceAll(res, '缠绕!', 'Quấn Chặt!')
  res = replaceAll(res, '噬法!', 'Thôn Pháp!')
  res = replaceAll(res, '神速!', 'Thần Tốc!')
  res = replaceAll(res, '暴怒!', 'Bạo Nộ!')
  res = replaceAll(res, '死战!', 'Tử Chiến!')
  res = replaceAll(res, '。', '.')
  res = replaceAll(res, '你', 'Ngươi ')
  res = res.replace(/\s+/g, ' ').replace(/\s+([,.!?])/g, '$1').trim()
  res = res.replace(/,([^\s0-9])/g, ', $1')

  return res
}

import {
  PILL_DESC_MAP,
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

export function displayPillDesc(desc: string): string {
  if (!desc) return ''
  return PILL_DESC_MAP[desc] ?? desc
}

export function displayPillFuncText(text: string): string {
  if (!text) return ''
  let res = text
  res = replaceAll(res, '服之:修为 +', 'Uống: Tu vi +')
  res = replaceAll(res, '服之:灵气 +', 'Uống: Linh khí +')
  res = replaceAll(res, '服之:上限的', 'Uống: ')
  res = replaceAll(res, '上限的', 'giới hạn ')
  res = replaceAll(res, '服之化开', 'Uống giải hóa')
  res = replaceAll(res, '茶香悟道', 'Trà Hương Ngộ Đạo')
  res = replaceAll(res, '战斗修为', 'Tu vi chiến đấu')
  res = replaceAll(res, '只入历练战胜之修为,静修不与', 'chỉ tính tu vi thắng lịch luyện, tĩnh tu không tính')
  res = replaceAll(res, '只入历练战胜之修为，静修不与', 'chỉ tính tu vi thắng lịch luyện, tĩnh tu không tính')
  res = replaceAll(res, '持续', 'duy trì ')
  res = replaceAll(res, '分钟', ' phút')
  res = replaceAll(res, '小时', ' giờ')
  res = replaceAll(res, '秒', ' giây')
  res = replaceAll(res, '折合闭关', 'tương đương bế quan ')
  res = replaceAll(res, '一刻有余', 'hơn một khắc')
  res = replaceAll(res, '一刻', 'một khắc')
  res = replaceAll(res, '至多不满一层', 'tối đa không quá 1 tầng')
  res = replaceAll(res, '有方:', ' | Có đơn: ')
  res = replaceAll(res, '无方,只在历练掉落与际遇里偶得', 'Không có đơn, chỉ ngẫu nhiên nhận được từ rơi rớt lịch luyện và tế ngộ')
  res = replaceAll(res, '无方，只在历练掉落与际遇里偶得', 'Không có đơn, chỉ ngẫu nhiên nhận được từ rơi rớt lịch luyện và tế ngộ')
  res = replaceAll(res, '无方,', 'Không có đơn, ')
  res = replaceAll(res, '丹房可炼', 'Đan phòng có thể luyện')
  res = replaceAll(res, '凡品灵草', 'Linh thảo Phàm phẩm')
  res = replaceAll(res, '灵品灵草', 'Linh thảo Linh phẩm')
  res = replaceAll(res, '玄品灵草', 'Linh thảo Huyền phẩm')
  res = replaceAll(res, '地品灵草', 'Linh thảo Địa phẩm')
  res = replaceAll(res, '天品灵草', 'Linh thảo Thiên phẩm')
  res = replaceAll(res, '道品灵草', 'Linh thảo Đạo phẩm')
  res = replaceAll(res, '点', ' điểm')
  return res
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
  const res = toast
  if (res.includes('炉中一声闷响,丹毁了。') || res.includes('炉中一声闷响，丹毁了。')) {
    const after = res.replace(/炉中一声闷响[,，]丹毁了。/g, '').trim()
    const weaknessVi = displayCraftWeakness(after)
    return `Trong lò vang lên một tiếng trầm đục, đan đã hỏng rồi. ${weaknessVi}`
  }
  return res
}

export function displayEventTitle(title: string): string {
  if (!title) return ''
  return EVENT_TITLE_MAP[title] ?? title
}

export function displayEventText(text: string): string {
  if (!text) return ''
  return EVENT_TEXT_MAP[text] ?? text
}

export function displayEventChoiceLabel(label: string): string {
  if (!label) return ''
  return EVENT_CHOICE_MAP[label] ?? label
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
  return DAOLU_NAME_MAP[name] ?? name
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



