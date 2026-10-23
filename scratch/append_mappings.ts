import { readFileSync, appendFileSync } from 'node:fs'

const script = `
// ==================== PILL LOCALIZATION ====================
export const PILL_DESC_MAP: Record<string, string> = {
  "最粗浅的灵药,聊胜于无": "Linh dược thô sơ nhất, có còn hơn không",
  "服之灵气涌动,修为小进": "Uống vào linh khí dạt dào, tu vi tiến thêm một bước nhỏ",
  "回复五成灵气": "Hồi phục 50% linh khí",
  "以灵茶入道,战斗中所悟更多": "Lấy linh trà nhập đạo, trong chiến đấu ngộ được nhiều hơn",
  "心神凝定,宜于小进阶之前;大关天劫,丹力不入": "Tâm thần ngưng định, thích hợp trước tiểu tiến giai; đại quan thiên kiếp, đan lực không trợ",
  "一炷香内修炼倍增(30 分钟)": "Trong một nén nhang tu luyện nhân đôi (30 phút)",
  "战意沸腾,攻防俱增": "Chiến ý sôi trào, công phòng đều tăng",
  "护住心脉,减免伤害": "Hộ trì tâm mạch, giảm bớt sát thương",
  "脚下生风,同程妖踪更密,行程不减": "Dưới chân sinh phong, cùng chặng yêu tung dày đặc hơn, hành trình không giảm",
  "破境只开小进阶;大关天劫,此丹不与": "Phá cảnh chỉ mở tiểu tiến giai; đại quan thiên kiếp, đan này không trợ",
  "玄元之气化入丹中,服之如闭关一刻(15 分钟)": "Huyền nguyên chi khí hóa vào trong đan, uống vào như bế quan một khắc (15 phút)",
  "服之肉身坚若金刚": "Uống vào nhục thân kiên cố như kim cương",
  "窃一缕天运,福泽加身": "Đoạt một sợi thiên vận, phúc trạch gia thân",
  "渡劫前服用,可抵雷霆": "Uống trước khi độ kiếp, có thể chống đỡ sấm sét",
  "一缕真龙之气,服之如闭关一刻有余(18 分钟)": "Một luồng chân long chi khí, uống vào như bế quan hơn một khắc (18 phút)",
  "太玄之精,大增修为(折合 30 分钟静修)": "Thái huyền chi tinh, tăng mạnh tu vi (tương đương 30 phút tĩnh tu)",
  "九转金丹一粒,夺天地造化(折合 1 小时静修)": "Một viên Cửu Chuyển Kim Đan, đoạt thiên địa tạo hóa (tương đương 1 giờ tĩnh tu)",
  "洗髓易经,脱胎换骨": "Tẩy tủy dịch cân, thoát thai hoán cốt",
  "服之神魂大定,万邪不侵": "Uống vào thần hồn đại định, vạn tà không xâm",
  "阴阳相济,水火相生": "Âm dương tương tế, thủy hỏa tương sinh",
  "服之如有神助,万法通达": "Uống vào như có thần trợ, vạn pháp thông đạt",
  "一丹入腹,始知我命由我不由天": "Một viên vào bụng, mới biết mệnh ta do ta không do trời",
  "返老还童,再续生机": "Phản lão hoàn đồng, tiếp thêm sinh cơ",
  "大道至简,一气化生": "Đại đạo chí giản, nhất khí hóa sinh",
  "服之如沐春风,气血充盈": "Uống vào như tắm gió xuân, khí huyết dồi dào",
  "聚天地之灵,纳日月之华": "Tụ linh khí đất trời, nạp tinh hoa nhật nguyệt",
  "神泉一滴,灵气回涌": "Một giọt thần tuyền, linh khí hồi trào"
}

// ==================== PET LOCALIZATION ====================
export const PET_NAME_MAP: Record<string, string> = {
  "青羽灵狐": "Thanh Vũ Linh Hồ",
  "雪背小龟": "Tuyết Bối Tiểu Quy",
  "赤火雀": "Xích Hỏa Tước",
  "月影狸": "Nguyệt Ảnh Ly",
  "三足金蟾": "Tam Túc Kim Thiềm",
  "摇光鹿": "Dao Quang Lộc",
  "御雷猴": "Ngự Lôi Hầu",
  "螭龙幼子": "Ly Long Ấu Tử",
  "应龙": "Ứng Long",
  "麒麟": "Kỳ Lân",
  "鲲鹏": "Côn Bằng",
  "混沌饕餮": "Hỗn Độn Thao Thiết",
  "青鸾": "Thanh Loan",
  "白泽": "Bạch Trạch"
}

// ==================== BUILD LOCALIZATION ====================
export const BUILD_NAME_MAP: Record<string, string> = {
  "反震背水": "Phản Chấn Bối Thủy",
  "纯阳暴烈": "Thuần Dương Bạo Liệt",
  "回春磐石": "Hồi Xuân Bàn Thạch",
  "疾风连击": "Tật Phong Liên Kích",
  "太阴吸血": "Thái Âm Hấp Huyết",
  "均衡之道": "Cân Bằng Chi Đạo"
}

// ==================== DAOLU LOCALIZATION ====================
export const DAOLU_NAME_MAP: Record<string, string> = {
  "沈青璃": "Thẩm Thanh Ly",
  "赵砚": "Triệu Nghiễn",
  "慕烟": "Mộ Yên",
  "韩峥": "Hàn Tranh",
  "云舒": "Vân Thư",
  "厉孤": "Lệ Cô",
  "白薇": "Bạch Vi",
  "钟离越": "Chung Ly Việt",
  "雪无痕": "Tuyết Vô Vết",
  "苍冥": "Thương Minh"
}

export const DAOLU_BRIEF_MAP: Record<string, string> = {
  "寡言的女修,袖口常沾着药渣": "Nữ tu ít lời, cổ tay áo thường vương bã thuốc",
  "背一柄未开锋的铁剑,说要等它自己认主": "Đeo thanh thiết kiếm chưa mài bén, nói muốn đợi nó tự nhận chủ",
  "走到哪里都在记录草木,笔比剑用得勤": "Đi đến đâu cũng ghi chép cỏ cây, bút dùng chăm hơn kiếm",
  "旧战场上活下来的人,袖中永远有三把匕首": "Người sống sót từ chiến trường xưa, trong tay áo luôn giấu ba thanh chủy thủ",
  "总在打盹的散修,醒着的时候话很准": "Tán tu luôn gà gật ngủ gật, lúc tỉnh táo lời nói cực kỳ chuẩn xác",
  "独来独往的炼器师,十指有旧烫痕": "Luyện khí sư độc hành độc vãng, mười ngón tay có vết phỏng cũ",
  "医修出身,救人时手很稳,收钱时也很稳": "Y tu xuất thân, lúc cứu người tay rất vững, lúc lấy tiền cũng rất vững",
  "前宗门执法,如今只信自己那一套规矩": "Cựu chấp pháp tông môn, giờ chỉ tin vào quy củ của riêng mình",
  "雪岭里长大的剑修,话少,出手更少但更狠": "Kiếm tu lớn lên giữa tuyết lĩnh, kiệm lời, ra tay càng ít nhưng cực kỳ tàn nhẫn",
  "来历不明的修士,自称只是路过": "Tu sĩ lai lịch bất minh, tự xưng chỉ là khách qua đường"
}

export const DAOLU_PURSUIT_MAP: Record<string, string> = {
  "寻找十年前失踪的师尊": "Tìm kiếm sư tôn mất tích mười năm trước",
  "把那柄铁剑养到出鞘": "Dưỡng thanh thiết kiếm kia đến lúc xuất vỏ",
  "走遍此世每一处地界,把它记下来": "Đi khắp mọi nơi chốn của thế gian này, ghi chép lại toàn bộ",
  "找到当年灭他满门的那个人": "Tìm ra kẻ diệt môn năm xưa",
  "活得够久,久到看见一件事的结局": "Sống đủ lâu, lâu đến mức nhìn thấy kết cục của một việc",
  "复原一件残缺的古器": "Phục hồi một món cổ khí tàn khuyết",
  "把一门失传的疗伤方子补全": "Bổ khuyết hoàn chỉnh một phương thuốc trị thương thất truyền",
  "查清当年宗门覆灭的真相": "Điều tra chân tướng tông môn bị diệt năm xưa",
  "在有生之年递出一剑无悔的剑": "Trong quãng đời còn lại xuất ra một kiếm không hối tiếc",
  "弄清自己为何会在这里醒来": "Làm rõ vì sao bản thân lại thức tỉnh ở nơi này"
}

export const DAOLU_TABOO_MAP: Record<string, string> = {
  "不喜杀伐,见人滥杀则远之": "Không thích chém giết, thấy kẻ lạm sát ắt lánh xa",
  "不肯用丹药抄近路": "Không chịu dùng đan dược để đi đường tắt",
  "不愿为赶路而毁掉见到的东西": "Không muốn vì vội đường mà hủy hoại những vật nhìn thấy",
  "受人恩惠必偿,欠债则寝食难安": "Nhận ân huệ tất báo, nợ nần ắt ăn ngủ không yên",
  "厌恶把命押在一次豪赌上": "Chán ghét việc đặt cược mạng sống vào một canh bạc",
  "不许他人碰他未成的器胚": "Không cho phép người khác chạm vào phôi khí cụ chưa thành",
  "见死不救是她的底线": "Thấy chết không cứu là lằn ranh đỏ của nàng",
  "不与背信者同行": "Không đồng hành cùng kẻ thất tín",
  "不受嗟来之食": "Không chịu nhận của bố thí",
  "不谈来处,问急了便走": "Không bàn về nguồn gốc, hỏi gấp ắt bỏ đi"
}

export const DAOLU_TEMPER_MAP: Record<string, string> = {
  "cautious": "Cẩn Trọng",
  "谨慎": "Cẩn Trọng",
  "frugal": "Đạm Bạc",
  "淡泊": "Đạm Bạc",
  "curious": "Cầu Sách",
  "求索": "Cầu Sách",
  "bold": "Quả Quyết",
  "果决": "Quả Quyết"
}

export const DAOLU_LEAN_MAP: Record<string, string> = {
  "alchemy": "Đan Đỉnh",
  "丹鼎": "Đan Đỉnh",
  "sword": "Kiếm Đạo",
  "剑道": "Kiếm Đạo",
  "truth": "Cầu Chân",
  "求真": "Cầu Chân",
  "slaughter": "Sát Phạt",
  "杀伐": "Sát Phạt",
  "longevity": "Trường Sinh",
  "长生": "Trường Sinh",
  "artifice": "Khí Đạo",
  "器道": "Khí Đạo"
}

export const DAOLU_STAGE_MAP: Record<string, string> = {
  "stranger": "Bình Thủy",
  "萍水": "Bình Thủy",
  "acquaintance": "Tri Giao",
  "知交": "Tri Giao",
  "companion": "Đồng Đạo",
  "同道": "Đồng Đạo",
  "sworn": "Đạo Khế",
  "道契": "Đạo Khế"
}

export const DAOLU_GATE_MAP: Record<string, string> = {
  "道心未契": "Đạo tâm chưa khế hợp",
  "天道誓未立": "Thiên đạo thệ chưa lập",
  "已立道契": "Đã lập đạo khế"
}

export const BOND_EVENT_TITLE_MAP: Record<string, string> = {
  "遗府": "Di Phủ",
  "刀下": "Dưới Đao",
  "线索": "Manh Mối",
  "代价": "Đại Giá",
  "岔路": "Ngã Rẽ",
  "重伤": "Trọng Thương",
  "共劫": "Cộng Kiếp"
}

export const BOND_TRIGGER_MAP: Record<string, string> = {
  "踏入新地界": "Bước vào địa giới mới",
  "首胜之后": "Sau trận thắng đầu",
  "击破首领": "Đánh bại thủ lĩnh",
  "濒死之际": "Thời khắc cận kề cái chết"
}

export const BOND_CHOICE_MAP: Record<string, string> = {
  "取丹方,依她所愿": "Lấy đan phương, theo ý nàng",
  "取法宝,丹方作罢": "Lấy pháp bảo, bỏ qua đan phương",
  "两样都要": "Cả hai thứ đều muốn",
  "放他走": "Thả hắn đi",
  "斩草除根": "Nhổ cỏ tận gốc",
  "不管他,径自离去": "Mặc kệ hắn, tự rời đi",
  "陪她进去": "Cùng nàng đi vào",
  "劝她别去": "Khuyên nàng đừng đi",
  "你自己进去,让她在外面等": "Ngươi tự mình đi vào, bảo nàng ở ngoài chờ",
  "作罢,另寻他法": "Thôi vậy, tìm cách khác",
  "取药引,救她要紧": "Lấy dược dẫn, cứu nàng là việc gấp",
  "让她自己决定": "Để nàng tự mình quyết định",
  "陪她走这一趟": "Cùng nàng đi chuyến này",
  "拦下她": "Giữ nàng lại",
  "各走各的路": "Mỗi người đi đường riêng",
  "受了她这枚丹": "Nhận viên đan này của nàng",
  "推开她的手": "Đẩy tay nàng ra",
  "要她记下这份人情": "Muốn nàng ghi nhớ phần nhân tình này",
  "与她同担此劫(她未必撑得住)": "Cùng nàng gánh kiếp này (nàng chưa chắc chống đỡ nổi)",
  "替她挡下这一击": "Thay nàng đỡ một đòn này",
  "让她先走": "Để nàng đi trước"
}

export const BOND_WISH_MAP: Record<string, string> = {
  "她想要那卷丹方——那是她找了很久的东西": "Nàng muốn cuốn đan phương kia —— đó là thứ nàng đã tìm kiếm bấy lâu",
  "她希望留他一条命": "Nàng hy vọng tha cho hắn một mạng",
  "她想进去看看": "Nàng muốn đi vào trong xem xét",
  "她宁可自己扛着伤": "Nàng thà rằng tự mình chịu đựng thương thế",
  "她想去完成自己的事": "Nàng muốn đi hoàn thành tâm nguyện của mình",
  "她已经把丹药握在手里了": "Nàng đã nắm chặt viên đan dược trong tay",
  "她说:「一起走吧。」语气很平,像在说一件已经想好的事。": "Nàng nói: 「Cùng đi thôi.」 Giọng điệu rất bình thản, như đang nói một việc đã sớm nghĩ kỹ."
}

export const BOND_LIMIT_MAP: Record<string, string> = {
  "她不会为了法宝眼睁睁看你去死": "Nàng sẽ không vì pháp bảo mà trơ mắt nhìn ngươi bỏ mạng",
  "她不看着人被杀": "Nàng không nhìn người bị giết",
  "她不愿因自己的事把别人拖下水": "Nàng không muốn vì chuyện của mình mà kéo người khác xuống nước",
  "她不肯让别人替她付代价": "Nàng không chịu để người khác gánh chịu cái giá thay mình",
  "她不肯让人为她改道": "Nàng không chịu để người khác vì mình mà đổi hướng",
  "她不喜欢欠人情,也不喜欢别人欠她": "Nàng không thích nợ nhân tình, cũng không thích người khác nợ mình",
  "她不怕死,但她怕拖累别人;你若把她推开,她会记很久": "Nàng không sợ chết, nhưng sợ làm liên lụy người khác; nếu ngươi đẩy nàng ra, nàng sẽ ghi nhớ rất lâu"
}

export const BOND_RESPONSE_MAP: Record<string, string> = {
  "应下": "Đồng ý",
  "回绝": "Từ chối",
  "不作声": "Im lặng"
}

// ==================== CRAFTING LOCALIZATION ====================
export const CRAFT_WEAKNESS_MAP: Record<string, string> = {
  "丹方尚未烂熟于心,关键几步还要现想。": "Đan phương chưa thuộc làu làu, mấy bước mấu chốt vẫn phải nghĩ ngợi.",
  "药性在炉中互斗,成丹药力散乱。": "Dược tính trong lò tương tranh, đan thành dược lực tán loạn.",
  "火候到了却聚不拢,药液在炉底摊成一片。": "Hỏa hầu đủ nhưng không kết tụ được, dược dịch trải thành một mảng dưới đáy lò.",
  "急火催得药性发躁,灵气早散了大半。": "Lửa gấp khiến dược tính phát nôn nóng, linh khí sớm đã tan hơn nửa.",
  "火性把药底子烧穿了,成丹也存不住。": "Hỏa tính thiêu thủng đáy dược, thành đan cũng không giữ được.",
  "药渣没滤净,炼到后头全是焦味。": "Dược cặn chưa lọc sạch, luyện về sau toàn là mùi khét.",
  "封口慢了半拍,好好的药气散了个干净。": "Niêm phong chậm nửa nhịp, dược khí tốt lành đều bay sạch sẽ.",
  "压制不住药力,最后关头全喷出炉外。": "Không áp chế nổi dược lực, thời khắc cuối cùng đều phun trào ra ngoài lò.",
  "炉温忽冷忽热,药性始终混不成一体。": "Nhiệt độ lò lúc nóng lúc lạnh, dược tính trước sau không thể quy về một mối.",
  "采回来的东西堆在角落,你叫不出它的名字。": "Đồ hái về chất đống trong góc, ngươi không gọi nổi tên của nó.",
  "寒热不分,烈药下炉便是一炉焦糊。": "Hàn nhiệt không phân, dược tính quá gắt vừa vào lò đã cháy khét.",
  "丹是成了,药力却虚浮不实。": "Đan đã thành, nhưng dược lực lại hư phù không chắc.",
  "出炉即散气,毒性也压不住。": "Ra lò liền tán khí, độc tính cũng không áp chế nổi.",
  "炉温忽高忽低,越好的方子越经不起你这么烧。": "Nhiệt độ lò lúc cao lúc thấp, đan phương càng tốt càng không chịu nổi cách thiêu này.",
  "锤下去的是力气,不是形。": "Nện búa xuống chỉ là sức lực, chứ không thành hình.",
  "纹刻得工整,却是死纹,引不进一丝灵气。": "Văn khắc ngay ngắn, nhưng lại là tử văn, không dẫn nổi một tia linh khí."
}

// ==================== ADVENTURE EVENTS LOCALIZATION ====================
export const EVENT_TITLE_MAP: Record<string, string> = {
  "古老玉简": "Ngọc Giản Cổ Xưa",
  "灵泉": "Linh Tuyền",
  "游方商人": "Du Phương Thương Nhân",
  "青石上的老者": "Lão Giả Trên Thanh Thạch",
  "妖兽尸骸": "Thi Hài Yêu Thú",
  "残破阵法": "Tàn Trận Phá Hoại",
  "迷路的小和尚": "Tiểu Hòa Thượng Lạc Đường",
  "路边赌石": "Đổ Thạch Bên Đường",
  "雷雨夜": "Đêm Mưa Sấm Sét",
  "无主药园": "Dược Viên Vô Chủ",
  "插剑石": "Đá Cắm Kiếm",
  "月下湖泊": "Hồ Nước Dưới Trăng",
  "褴褛乞丐": "Kẻ Ăn Mày Rách Rưới",
  "塌方": "Sạt Lở Đất",
  "石桌残局": "Tàn Cuộc Bàn Đá",
  "受伤的灵兽": "Linh Thú Bị Thương",
  "夜遇同道": "Đêm Gặp Đồng Đạo",
  "流星坠地": "Sao Băng Rơi Xuống Đất",
  "灵雾温泉": "Suối Nước Nóng Linh Vụ",
  "倾覆的货车": "Xe Hàng Bị Lật"
}

export const EVENT_TEXT_MAP: Record<string, string> = {
  "一头妖兽的尸骸横在路旁,死去不久,周围隐有血腥气。": "Một cỗ thi hài yêu thú nằm ngang bên đường, chết chưa bao lâu, quanh mình phảng phất mùi tanh máu.",
  "你在山洞深处发现一枚古老玉简,其上灵光隐现。": "Ngươi phát hiện một miếng ngọc giản cổ xưa nơi sơn động thẳm sâu, linh quang ẩn hiện trên đó.",
  "一汪清泉自石缝中涌出,泉水灵气氤氲。": "Một làn thanh tuyền trào ra từ khe đá, dòng nước linh khí lượn lờ.",
  "一位背着大葫芦的游方商人拦住你,神秘兮兮地要与你做笔买卖。": "Một du phương thương nhân đeo hồ lô lớn chặn ngươi lại, vẻ thần thần bí bí muốn cùng ngươi giao dịch.",
  "一位老者坐在青石上打盹,身旁放着一个酒葫芦,气息深不可测。": "Một vị lão giả ngồi gật gù trên tảng thanh thạch, cạnh mình đặt hồ lô rượu, khí tức sâu không lường được.",
  "前方隐约有阵法波动,阵纹已残,似乎护着什么。": "Phía trước thoáng có trận pháp dao động, trận văn đã tàn khuyết, dường như đang bảo hộ thứ gì.",
  "一个小和尚坐在路边哭,说自己找不到回寺的路了。": "Một tiểu hòa thượng ngồi khóc bên đường, bảo rằng mình không tìm thấy đường về chùa.",
  "几个修士围着一堆灵石原石叫嚷,说是能开出宝贝。": "Vài tu sĩ vây quanh một đống đá nguyên thạch linh thạch hò hét, bảo rằng có thể mở ra bảo bối.",
  "暴雨骤至,雷霆在头顶炸开。有胆大的修士借雷淬体。": "Mưa to ập đến, sấm sét nổ vang trên đỉnh đầu. Có tu sĩ to gan mượn lôi thối thể.",
  "你发现一处荒废的药园,灵草虽杂,却也不少。": "Ngươi phát hiện một dược viên hoang phế, linh thảo tuy lẫn lộn nhưng cũng không ít.",
  "一柄古剑插在巨石中,剑身布满铭文,无数人拔之不动。": "Một thanh cổ kiếm cắm sâu trong cự thạch, thân kiếm phủ đầy minh văn, vô số người rút không nhúc nhích.",
  "月圆之夜,湖面浮起点点银辉,灵气随月光沉入水中。": "Đêm trăng tròn, mặt hồ dập dềnh ánh bạc li ti, linh khí nương theo ánh trăng chìm vào đáy nước."
}

export const EVENT_CHOICE_MAP: Record<string, string> = {
  "剥取材料": "Thu thập vật liệu",
  "离开": "Rời đi",
  "参悟玉简": "Tham ngộ ngọc giản",
  "直接取走": "Trực tiếp lấy đi",
  "饮用泉水": "Uống nước suối",
  "装入水囊": "Đựng vào túi nước",
  "购买灵物": "Mua linh vật",
  "打探消息": "Dò hỏi tin tức",
  "上前请教": "Tiến lên thỉnh giáo",
  "悄悄绕过": "Lặng lẽ đi vòng qua",
  "破除残阵": "Phá giải tàn trận",
  "指引方向": "Chỉ dẫn phương hướng",
  "赠予口粮": "Tặng chút lương khô",
  "尝试选石": "Thử chọn đá",
  "在一旁观看": "Đứng một bên quan sát",
  "引雷入体": "Dẫn lôi vào cơ thể",
  "避雨静待": "Trú mưa tĩnh đợi",
  "采摘成熟草药": "Hái thảo dược đã chín",
  "尝试拔剑": "Thử rút kiếm",
  "静心感悟剑意": "Tĩnh tâm cảm ngộ kiếm ý",
  "静坐湖畔吞吐月华": "Ngồi tĩnh tọa bên hồ thổ nạp nguyệt hoa",
  "潜入湖底寻宝": "Lặn xuống đáy hồ tìm bảo vật"
}

export const TIER_BRIEF_MAP: Record<string, string> = {
  "路上撞见的事,常来": "Chuyện gặp trên đường, thường xảy ra",
  "天道给的便宜,遇上就是赚到": "Hời do Thiên Đạo ban, gặp được là kiếm lớn",
  "千百载修来的造化,往往能改一世命途": "Tạo hóa ngàn năm tu được, thường có thể cải biến mệnh đồ một đời"
}
`

appendFileSync('./src/ui/displayMappings.ts', script)
console.log('Appended mappings to src/ui/displayMappings.ts')
