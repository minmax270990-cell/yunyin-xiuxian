export const MAIN_GONGFA_DATA = [
  // ---- PHÀM GIỚI (Cảnh giới 0-8) ----
  {
    id: 'm_chiyang',
    name: '赤阳真火诀',
    nameVi: 'Xích Dương Chân Hỏa Quyết',
    type: 'main',
    quality: 'fine',
    minRealm: 0,
    element: 'fire',
    desc: '采初生赤阳之炎以炼内气,刚正炽烈',
    descVi: 'Hấp thu sơ sinh Xích Dương chi viêm rèn luyện nội khí, cương chính sí liệt',
    baseMods: { cultivationSpeed: 0.11, attackPct: 0.07 },
    perLevelMods: { cultivationSpeed: 0.02, attackPct: 0.01 },
    skill: { name: '赤阳火符', nameVi: 'Xích Dương Hỏa Phù', mult: 1.6, rate: 0.22 },
    branches: [
      { name: '炽阳', nameVi: 'Sí Dương', desc: '阳火大盛,出手更猛', descVi: 'Dương hỏa đại thịnh, xuất chiêu càng mãnh liệt' },
      { name: '化焰', nameVi: 'Hóa Diễm', desc: '火气固元,守御从容', descVi: 'Hỏa khí cố nguyên, phòng ngự thong dong' }
    ]
  },
  {
    id: 'm_qingyun_jian',
    name: '青云裂空剑诀',
    nameVi: 'Thanh Vân Liệt Không Kiếm Quyết',
    type: 'main',
    quality: 'fine',
    minRealm: 0,
    element: 'metal',
    desc: '青云门筑基入门剑典,剑意凌厉破空',
    descVi: 'Kiếm điển nhập môn Trúc Cơ Thanh Vân Môn, kiếm ý lăng lệ phá không',
    baseMods: { cultivationSpeed: 0.12, critRate: 0.03 },
    perLevelMods: { cultivationSpeed: 0.02, critRate: 0.005 },
    skill: { name: '裂空一剑', nameVi: 'Liệt Không Nhất Kiếm', mult: 1.7, rate: 0.2 },
    branches: [
      { name: '破空', nameVi: 'Phá Không', desc: '剑势破空,锋芒无匹', descVi: 'Kiếm thế phá không, phong mang vô song' },
      { name: '守心', nameVi: 'Thủ Tâm', desc: '剑气护心,无懈可击', descVi: 'Kiếm khí hộ tâm, không thể phá vỡ' }
    ]
  },
  {
    id: 'm_wanmu',
    name: '万木回春真诀',
    nameVi: 'Vạn Mộc Hồi Xuân Chân Quyết',
    type: 'main',
    quality: 'fine',
    minRealm: 0,
    element: 'wood',
    desc: '通天地草木之灵,生生不息,生机绵延',
    descVi: 'Thông linh tính cây cỏ đất trời, sinh sinh bất tức, sinh cơ miên viễn',
    baseMods: { cultivationSpeed: 0.12, maxHpPct: 0.08 },
    perLevelMods: { cultivationSpeed: 0.02, maxHpPct: 0.012 },
    skill: { name: '春藤缠绕', nameVi: 'Xuân Đằng Triền Nhiễu', mult: 1.4, rate: 0.24 },
    branches: [
      { name: '生生', nameVi: 'Sinh Sinh', desc: '万木生息,体质绵长', descVi: 'Vạn mộc sinh tức, thể chất kéo dài' },
      { name: '繁荣', nameVi: 'Phồn Vinh', desc: '灵木成林,攻守相谐', descVi: 'Linh mộc thành rừng, công thủ hài hòa' }
    ]
  },
  {
    id: 'm_canghai',
    name: '沧海浩渺经',
    nameVi: 'Thương Hải Hạo Diểu Kinh',
    type: 'main',
    quality: 'fine',
    minRealm: 0,
    element: 'water',
    desc: '海纳百川,以浩瀚真气护体化劲',
    descVi: 'Biển nạp trăm sông, dùng hạo hãn chân khí hộ thể hóa kình',
    baseMods: { cultivationSpeed: 0.11, defensePct: 0.08, qiRegen: 0.06 },
    perLevelMods: { cultivationSpeed: 0.02, defensePct: 0.012 },
    skill: { name: '惊涛骇浪', nameVi: 'Kinh Đào Hãi Lãng', mult: 1.5, rate: 0.22 },
    branches: [
      { name: '纳川', nameVi: 'Nạp Xuyên', desc: '百川归流,气脉通畅', descVi: 'Trăm sông đổ về biển, khí mạch hanh thông' },
      { name: '沉渊', nameVi: 'Trầm Uyên', desc: '深海如渊,坚不可摧', descVi: 'Biển sâu như vực, kiên cố khôn cùng' }
    ]
  },
  {
    id: 'm_kunlun',
    name: '昆仑磐石真经',
    nameVi: 'Côn Lôn Bàn Thạch Chân Kinh',
    type: 'main',
    quality: 'fine',
    minRealm: 0,
    element: 'earth',
    desc: '若昆仑古峰耸立,根基深厚,诸法难摇',
    descVi: 'Như đỉnh Côn Lôn sừng sững, căn cơ thâm hậu, vạn pháp khó chuyển',
    baseMods: { cultivationSpeed: 0.1, defensePct: 0.1, maxHpPct: 0.08 },
    perLevelMods: { cultivationSpeed: 0.02, defensePct: 0.014 },
    skill: { name: '磐石崩', nameVi: 'Bàn Thạch Băng', mult: 1.5, rate: 0.2 },
    branches: [
      { name: '重岳', nameVi: 'Trọng Nhạc', desc: '山势巍峨,攻势沉雄', descVi: 'Thế núi nguy nga, công thế trầm hùng' },
      { name: '安峦', nameVi: 'An Loan', desc: '不动如山,守御自如', descVi: 'Bất động như sơn, thủ ngự tự nhiên' }
    ]
  },
  {
    id: 'm_bafang_dao',
    name: '八荒斩绝刀典',
    nameVi: 'Bát Hoang Trảm Tuyệt Đao Điển',
    type: 'main',
    quality: 'excellent',
    minRealm: 1,
    desc: '大开大阖,八荒所向,一刀破万法',
    descVi: 'Đại khai đại hợp, bát hoang hướng tới, một đao phá vạn pháp',
    baseMods: { cultivationSpeed: 0.13, attackPct: 0.12, critRate: 0.03 },
    perLevelMods: { cultivationSpeed: 0.02, attackPct: 0.015 },
    skill: { name: '八荒开天斩', nameVi: 'Bát Hoang Khai Thiên Trảm', mult: 1.85, rate: 0.22 },
    branches: [
      { name: '狂绝', nameVi: 'Cuồng Tuyệt', desc: '刀意无前,所向披靡', descVi: 'Đao ý không lui, quét sạch muôn phương' },
      { name: '刀罡', nameVi: 'Đao Cương', desc: '罡气护体,攻守两全', descVi: 'Cương khí hộ thể, công thủ vẹn toàn' }
    ]
  },
  {
    id: 'm_tianfeng',
    name: '天风御虚玄经',
    nameVi: 'Thiên Phong Ngự Hư Huyền Kinh',
    type: 'main',
    quality: 'excellent',
    minRealm: 1,
    element: 'wind',
    desc: '行如天风过林,御气凌虚,飘忽不定',
    descVi: 'Đi như gió trời lướt rừng, ngự khí lăng hư, phiêu hốt khôn lường',
    baseMods: { cultivationSpeed: 0.14, dodgeRate: 0.03, speed: 0.05 },
    perLevelMods: { cultivationSpeed: 0.02, dodgeRate: 0.005 },
    skill: { name: '御风神刃', nameVi: 'Ngự Phong Thần Nhận', mult: 1.75, rate: 0.25 },
    branches: [
      { name: '追风', nameVi: 'Truy Phong', desc: '风无止境,乘风破浪', descVi: 'Gió không bến bờ, đạp gió rẽ sóng' },
      { name: '虚影', nameVi: 'Hư Ảnh', desc: '身如幻影,难以捉摸', descVi: 'Thân như ảo ảnh, khó lòng nắm bắt' }
    ]
  },
  {
    id: 'm_hanbing',
    name: '玄冰凝魄玄经',
    nameVi: 'Huyền Băng Ngưng Phách Huyền Kinh',
    type: 'main',
    quality: 'excellent',
    minRealm: 1,
    element: 'ice',
    desc: '凝万年寒气于魄,一念霜降,冰封千里',
    descVi: 'Ngưng tụ vạn năm hàn khí vào phách, một niệm sương giáng, đóng băng ngàn dặm',
    baseMods: { cultivationSpeed: 0.13, defensePct: 0.1, damageReduction: 0.04 },
    perLevelMods: { cultivationSpeed: 0.02, defensePct: 0.015 },
    skill: { name: '冰魄霜裂', nameVi: 'Băng Phách Sương Liệt', mult: 1.7, rate: 0.22 },
    branches: [
      { name: '极寒', nameVi: 'Cực Hàn', desc: '寒气逼人,摧枯拉朽', descVi: 'Hàn khí bức người, bẻ gãy nghiền nát' },
      { name: '坚冰', nameVi: 'Kiên Băng', desc: '厚冰护身,万法难透', descVi: 'Băng dày hộ thân, vạn pháp khó thấu' }
    ]
  },
  {
    id: 'm_chiyan',
    name: '赤焰降魔宝典',
    nameVi: 'Xích Diễm Hàng Ma Bảo Điển',
    type: 'main',
    quality: 'excellent',
    minRealm: 1,
    element: 'fire',
    desc: '纯阳烈焰降伏外道,炽火无情,涤荡魔氛',
    descVi: 'Thuần dương liệt diễm hàng phục ngoại đạo, lửa nóng vô tình, quét sạch ma khí',
    baseMods: { cultivationSpeed: 0.14, attackPct: 0.12, damageBonus: 0.05 },
    perLevelMods: { cultivationSpeed: 0.02, attackPct: 0.016 },
    skill: { name: '降魔金焰', nameVi: 'Hàng Ma Kim Diễm', mult: 1.8, rate: 0.24 },
    branches: [
      { name: '诛魔', nameVi: 'Tru Ma', desc: '烈火克魔,杀伐无情', descVi: 'Lửa dữ diệt ma, sát phạt vô tình' },
      { name: '炽阳', nameVi: 'Sí Dương', desc: '纯阳护体,诸邪莫侵', descVi: 'Thuần dương hộ thể, tà ma bất xâm' }
    ]
  },
  {
    id: 'm_qinglian',
    name: '青莲悟道剑歌',
    nameVi: 'Thanh Liên Ngộ Đạo Kiếm Ca',
    type: 'main',
    quality: 'excellent',
    minRealm: 1,
    element: 'wood',
    desc: '诗酒仗剑,青莲吐艳,剑锋回环,暗合大道',
    descVi: 'Thơ rượu mang kiếm, thanh liên hé nở, mũi kiếm luân chuyển, ngầm hợp đại đạo',
    baseMods: { cultivationSpeed: 0.15, critRate: 0.03, attackPct: 0.08 },
    perLevelMods: { cultivationSpeed: 0.02, critRate: 0.005 },
    skill: { name: '青莲九落', nameVi: 'Thanh Liên Cửu Lạc', mult: 1.75, rate: 0.25 },
    branches: [
      { name: '剑仙', nameVi: 'Kiếm Tiên', desc: '诗意化剑,快意恩仇', descVi: 'Ý thơ hóa kiếm, khoái ý ân cừu' },
      { name: '莲华', nameVi: 'Liên Hoa', desc: '步步生莲,道基沉稳', descVi: 'Từng bước sinh sen, đạo cơ trầm ổn' }
    ]
  },
  {
    id: 'm_jiuyou',
    name: '九幽玄冥引',
    nameVi: 'Cửu U Huyền Minh Dẫn',
    type: 'main',
    quality: 'spirit',
    minRealm: 2,
    element: 'dark',
    desc: '引九幽玄冥阴气炼魄,行止幽深,夺敌神魂',
    descVi: 'Dẫn âm khí Cửu U rèn luyện phách, hành tung u thâm, đoạt thần hồn kẻ địch',
    baseMods: { cultivationSpeed: 0.16, attackPct: 0.14, critDamage: 0.15 },
    perLevelMods: { cultivationSpeed: 0.025, attackPct: 0.018 },
    skill: { name: '九幽夺魄爪', nameVi: 'Cửu U Đoạt Phách Trảo', mult: 2.1, rate: 0.22 },
    branches: [
      { name: '幽煞', nameVi: 'U Sát', desc: '玄阴极煞,一击裂魂', descVi: 'Huyền âm cực sát, một kích liệt hồn' },
      { name: '冥护', nameVi: 'Minh Hộ', desc: '阴气护周,避劫销声', descVi: 'Âm khí quanh thân, tránh kiếp ẩn danh' }
    ]
  },
  {
    id: 'm_tianlei',
    name: '九天引雷神典',
    nameVi: 'Cửu Thiên Dẫn Lôi Thần Điển',
    type: 'main',
    quality: 'spirit',
    minRealm: 2,
    element: 'thunder',
    desc: '引九天神雷入道胎,雷震八荒,天威莫测',
    descVi: 'Dẫn lôi đình chín tầng trời nhập đạo thai, sấm dậy tám phương, uy trời khôn lường',
    baseMods: { cultivationSpeed: 0.17, attackPct: 0.16, critRate: 0.04 },
    perLevelMods: { cultivationSpeed: 0.025, attackPct: 0.02 },
    skill: { name: '神雷落世', nameVi: 'Thần Lôi Lạc Thế', mult: 2.2, rate: 0.24 },
    branches: [
      { name: '雷暴', nameVi: 'Lôi Bạo', desc: '狂雷击世,威不可当', descVi: 'Cuồng lôi giáng thế, uy không thể cản' },
      { name: '雷御', nameVi: 'Lôi Ngự', desc: '雷光绕体,震慑八方', descVi: 'Lôi quang quanh thân, chấn nhiếp tám phương' }
    ]
  },
  {
    id: 'm_hanyue',
    name: '寒月冰魄古录',
    nameVi: 'Hàn Nguyệt Băng Phách Cổ Lục',
    type: 'main',
    quality: 'spirit',
    minRealm: 2,
    element: 'ice',
    desc: '望空明冷月,炼至阴寒魄,神识如镜,冰封神躯',
    descVi: 'Ngắm trăng lạnh vằng vặc, luyện chí âm hàn phách, thần thức như gương, phong tỏa thần thể',
    baseMods: { cultivationSpeed: 0.16, defensePct: 0.12, damageReduction: 0.05 },
    perLevelMods: { cultivationSpeed: 0.025, defensePct: 0.016 },
    skill: { name: '月华凝晶', nameVi: 'Nguyệt Hoa Ngưng Tinh', mult: 1.9, rate: 0.22 },
    branches: [
      { name: '霜月', nameVi: 'Sương Nguyệt', desc: '冷月无声,寒霜断骨', descVi: 'Trăng lạnh vô thanh, sương lạnh đoạt cốt' },
      { name: '清辉', nameVi: 'Thanh Huy', desc: '月华护体,澄澈安宁', descVi: 'Ánh trăng hộ thể, trong sáng an bình' }
    ]
  },
  {
    id: 'm_chongguang',
    name: '重光照世金经',
    nameVi: 'Trùng Quang Chiếu Thế Kim Kinh',
    type: 'main',
    quality: 'spirit',
    minRealm: 2,
    element: 'light',
    desc: '光明大作,普照大千,破诸幽暗邪祟',
    descVi: 'Quang minh đại tác, chiếu rọi thế gian, phá tan mọi u ám tà uế',
    baseMods: { cultivationSpeed: 0.18, attackPct: 0.12, breakthroughRate: 0.03 },
    perLevelMods: { cultivationSpeed: 0.025, attackPct: 0.015 },
    skill: { name: '破妄明光', nameVi: 'Phá Vọng Minh Quang', mult: 2.0, rate: 0.23 },
    branches: [
      { name: '曜世', nameVi: 'Diệu Thế', desc: '明光破邪,威势赫赫', descVi: 'Minh quang phá tà, uy thế hiển hách' },
      { name: '慧光', nameVi: 'Tuệ Quang', desc: '光照心台,道心澄明', descVi: 'Ánh sáng soi đài tâm, đạo tâm trong sáng' }
    ]
  },
  {
    id: 'm_wuying',
    name: '无影幻虚步典',
    nameVi: 'Vô Ảnh Huyễn Hư Bộ Điển',
    type: 'main',
    quality: 'spirit',
    minRealm: 2,
    element: 'wind',
    desc: '捕风捉影,身化虚无,来去无端',
    descVi: 'Bắt gió đuổi bóng, thân hóa hư vô, thoắt ẩn thoắt hiện',
    baseMods: { cultivationSpeed: 0.16, dodgeRate: 0.04, speed: 0.05 },
    perLevelMods: { cultivationSpeed: 0.025, dodgeRate: 0.006 },
    skill: { name: '幻影连环斩', nameVi: 'Ảo Ảnh Liên Hoàn Trảm', mult: 1.95, rate: 0.26 },
    branches: [
      { name: '疾影', nameVi: 'Tật Ảnh', desc: '如风随行,无影无踪', descVi: 'Như gió đồng hành, không bóng không hình' },
      { name: '脱身', nameVi: 'Thoát Thân', desc: '避险还虚,从容脱困', descVi: 'Tránh hiểm về hư, ung dung thoát khốn' }
    ]
  },
  {
    id: 'm_duanhan',
    name: '断岳移山宝典',
    nameVi: 'Đoạn Nhạc Di Sơn Bảo Điển',
    type: 'main',
    quality: 'spirit',
    minRealm: 3,
    element: 'earth',
    desc: '身纳万仞山岳,重若千钧,力可裂地',
    descVi: 'Thân dung nạp vạn trượng non cao, nặng ngàn cân, sức có thể xé đất',
    baseMods: { cultivationSpeed: 0.16, defensePct: 0.15, maxHpPct: 0.12 },
    perLevelMods: { cultivationSpeed: 0.025, defensePct: 0.018 },
    skill: { name: '山崩地裂', nameVi: 'Sơn Băng Địa Liệt', mult: 2.05, rate: 0.22 },
    branches: [
      { name: '裂岳', nameVi: 'Liệt Nhạc', desc: '势大力沉,崩山裂岳', descVi: 'Thế lớn lực nặng, sập núi nứt non' },
      { name: '固原', nameVi: 'Cố Nguyên', desc: '地气连脉,坚若磐石', descVi: 'Địa khí liền mạch, vững như bàn thạch' }
    ]
  },
  {
    id: 'm_tianji_jian',
    name: '天机无极剑典',
    nameVi: 'Thiên Cơ Vô Cực Kiếm Điển',
    type: 'main',
    quality: 'spirit',
    minRealm: 3,
    element: 'metal',
    desc: '算尽天机,剑意无常,无声无息断人生机',
    descVi: 'Tính hết thiên cơ, kiếm ý vô thường, lặng yên không tiếng động dứt đoạn sinh cơ',
    baseMods: { cultivationSpeed: 0.17, attackPct: 0.15, critRate: 0.04 },
    perLevelMods: { cultivationSpeed: 0.025, attackPct: 0.018 },
    skill: { name: '天机斩道', nameVi: 'Thiên Cơ Trảm Đạo', mult: 2.15, rate: 0.25 },
    branches: [
      { name: '推演', nameVi: 'Suy Diễn', desc: '洞烛先机,招招致命', descVi: 'Thấu suốt thời cơ, chiêu chiêu đoạt mạng' },
      { name: '定心', nameVi: 'Định Tâm', desc: '天机定神,剑意常在', descVi: 'Thiên cơ định thần, kiếm ý trường tồn' }
    ]
  },
  {
    id: 'm_shengling',
    name: '生灵甘露妙典',
    nameVi: 'Sinh Linh Cam Lộ Diệu Điển',
    type: 'main',
    quality: 'spirit',
    minRealm: 3,
    element: 'wood',
    desc: '唤九天甘露滋养道体,生生循环,百病不侵',
    descVi: 'Gọi cam lộ chín tầng trời nuôi dưỡng đạo thể, tuần hoàn sinh hóa, bách bệnh bất xâm',
    baseMods: { cultivationSpeed: 0.17, maxHpPct: 0.14, qiRegen: 0.08 },
    perLevelMods: { cultivationSpeed: 0.025, maxHpPct: 0.015 },
    skill: { name: '甘露化生', nameVi: 'Cam Lộ Hóa Sinh', mult: 1.8, rate: 0.25 },
    branches: [
      { name: '甘霖', nameVi: 'Cam Lâm', desc: '春雨滋润,道体充盈', descVi: 'Mưa xuân tưới mát, đạo thể dồi dào' },
      { name: '逢春', nameVi: 'Phùng Xuân', desc: '枯木逢春,生生不息', descVi: 'Cây khô gặp xuân, sinh sôi không dứt' }
    ]
  },
  {
    id: 'm_fenhai',
    name: '焚海真炎录',
    nameVi: 'Phần Hải Chân Viêm Lục',
    type: 'main',
    quality: 'spirit',
    minRealm: 3,
    element: 'fire',
    desc: '炎火滔天,可煮沸万顷沧海,焚尽万物',
    descVi: 'Lửa dữ ngập trời, nấu sôi vạn khoảnh biển biếc, thiêu rụi muôn loài',
    baseMods: { cultivationSpeed: 0.17, attackPct: 0.16, damageBonus: 0.06 },
    perLevelMods: { cultivationSpeed: 0.025, attackPct: 0.02 },
    skill: { name: '狂炎焚海', nameVi: 'Cuồng Viêm Phần Hải', mult: 2.2, rate: 0.23 },
    branches: [
      { name: '焚灭', nameVi: 'Phần Diệt', desc: '真火漫天,摧敌筋骨', descVi: 'Chân hỏa ngập trời, đập nát gân cốt kẻ địch' },
      { name: '熔甲', nameVi: 'Dung Giáp', desc: '烈火破坚,无往不利', descVi: 'Lửa nóng chảy giáp, đánh đâu thắng đó' }
    ]
  },
  {
    id: 'm_xuanyuan',
    name: '玄渊化水玄典',
    nameVi: 'Huyền Uyên Hóa Thủy Huyền Điển',
    type: 'main',
    quality: 'spirit',
    minRealm: 3,
    element: 'water',
    desc: '水至柔而克刚,化万重浪涛,御守由心',
    descVi: 'Nước chí nhu mà khắc cương, hóa vạn tầng sóng cuộn, thủ ngự tùy tâm',
    baseMods: { cultivationSpeed: 0.16, defensePct: 0.14, damageReduction: 0.06 },
    perLevelMods: { cultivationSpeed: 0.025, defensePct: 0.016 },
    skill: { name: '万顷浪涛', nameVi: 'Vạn Khoảnh Lãng Đào', mult: 1.85, rate: 0.22 },
    branches: [
      { name: '柔水', nameVi: 'Nhu Thủy', desc: '以柔克刚,化劲于无', descVi: 'Lấy nhu thắng cương, triệt tiêu lực đánh' },
      { name: '寒流', nameVi: 'Hàn Lưu', desc: '冰寒入脉,迟滞敌势', descVi: 'Băng hàn nhập mạch, trì trệ thế địch' }
    ]
  },
  {
    id: 'm_taiyi_leigang',
    name: '太乙雷罡正典',
    nameVi: 'Thái Ất Lôi Cương Chính Điển',
    type: 'main',
    quality: 'profound',
    minRealm: 4,
    element: 'thunder',
    desc: '太乙真雷淬真灵,罡气护道,霸道绝伦',
    descVi: 'Thái Ất chân lôi rèn chân linh, cương khí hộ đạo, bá đạo tuyệt luân',
    baseMods: { cultivationSpeed: 0.2, attackPct: 0.18, critRate: 0.04 },
    perLevelMods: { cultivationSpeed: 0.03, attackPct: 0.022 },
    skill: { name: '太乙神雷破', nameVi: 'Thái Ất Thần Lôi Phá', mult: 2.3, rate: 0.25 },
    branches: [
      { name: '雷煞', nameVi: 'Lôi Sát', desc: '雷光四溢,破尽强敌', descVi: 'Lôi quang bốn phía, phá tan cường địch' },
      { name: '神威', nameVi: 'Thần Uy', desc: '雷罡固本,万法退避', descVi: 'Lôi cương cố bản, vạn pháp thoái lui' }
    ]
  },
  {
    id: 'm_jiuxiao_feng',
    name: '九霄裂风破界典',
    nameVi: 'Cửu Tiêu Liệt Phong Phá Giới Điển',
    type: 'main',
    quality: 'profound',
    minRealm: 4,
    element: 'wind',
    desc: '九霄罡风如利刃,割裂虚空,瞬息千里',
    descVi: 'Cửu Tiêu cương phong tựa lưỡi dao, xé toạc hư không, chớp mắt ngàn dặm',
    baseMods: { cultivationSpeed: 0.2, dodgeRate: 0.05, attackPct: 0.14 },
    perLevelMods: { cultivationSpeed: 0.03, dodgeRate: 0.006 },
    skill: { name: '裂空风旋', nameVi: 'Liệt Không Phong Toàn', mult: 2.1, rate: 0.27 },
    branches: [
      { name: '疾烈', nameVi: 'Tật Liệt', desc: '狂风裂界,锐不可当', descVi: 'Gió giận xé cõi, sắc bén khôn cùng' },
      { name: '虚渡', nameVi: 'Hư Độ', desc: '乘风化虚,避祸无形', descVi: 'Cưỡi gió hóa hư, tránh họa vô hình' }
    ]
  },
  {
    id: 'm_xuanshuang',
    name: '玄霜极阴真经',
    nameVi: 'Huyền Sương Cực Âm Chân Kinh',
    type: 'main',
    quality: 'profound',
    minRealm: 4,
    element: 'ice',
    desc: '纳至阴玄霜,冻天冻地,使敌人难施寸劲',
    descVi: 'Hấp thụ chí âm huyền sương, đông lạnh trời đất, khiến địch khó thi triển kình lực',
    baseMods: { cultivationSpeed: 0.19, defensePct: 0.16, damageReduction: 0.06 },
    perLevelMods: { cultivationSpeed: 0.03, defensePct: 0.02 },
    skill: { name: '玄霜冻界', nameVi: 'Huyền Sương Đống Giới', mult: 2.05, rate: 0.24 },
    branches: [
      { name: '冻魄', nameVi: 'Đống Phách', desc: '寒髓侵心,伤敌元神', descVi: 'Hàn tủy xâm tâm, tổn thương nguyên thần kẻ địch' },
      { name: '冰壁', nameVi: 'Băng Bích', desc: '万重霜甲,难伤毫发', descVi: 'Vạn tầng sương giáp, khó tổn mảy may' }
    ]
  },
  {
    id: 'm_daming',
    name: '无上大明神经',
    nameVi: 'Vô Thượng Đại Minh Thần Kinh',
    type: 'main',
    quality: 'profound',
    minRealm: 4,
    element: 'light',
    desc: '大明日月同辉,纯阳大明之光护身克煞',
    descVi: 'Đại minh nhật nguyệt cùng sáng, ánh sáng thuần dương hộ thân khắc chế sát khí',
    baseMods: { cultivationSpeed: 0.21, attackPct: 0.15, critRate: 0.04 },
    perLevelMods: { cultivationSpeed: 0.03, attackPct: 0.02 },
    skill: { name: '神曜大千', nameVi: 'Thần Diệu Đại Thiên', mult: 2.25, rate: 0.23 },
    branches: [
      { name: '明彻', nameVi: 'Minh Triệt', desc: '光明洞烛,杀意破妄', descVi: 'Quang minh soi chiếu, sát ý phá vọng' },
      { name: '庇佑', nameVi: 'Tí Hựu', desc: '神光普降,福慧绵绵', descVi: 'Thần quang rủ xuống, phúc tuệ miên man' }
    ]
  },
  {
    id: 'm_youming_xue',
    name: '幽冥血影神典',
    nameVi: 'U Minh Huyết Ảnh Thần Điển',
    type: 'main',
    quality: 'profound',
    minRealm: 4,
    element: 'dark',
    desc: '聚幽冥死煞入道,血影化形,吞噬生灵',
    descVi: 'Gom tụ tử sát U Minh nhập đạo, huyết ảnh hóa hình, thôn phệ sinh linh',
    baseMods: { cultivationSpeed: 0.19, attackPct: 0.18, lowHpDamage: 0.15 },
    perLevelMods: { cultivationSpeed: 0.03, attackPct: 0.022 },
    skill: { name: '血煞灭魂击', nameVi: 'Huyết Sát Diệt Hồn Kích', mult: 2.3, rate: 0.22 },
    branches: [
      { name: '嗜血', nameVi: 'Thị Huyết', desc: '饮血化劲,愈杀愈狂', descVi: 'Hút máu hóa kình, càng giết càng cuồng' },
      { name: '幽遁', nameVi: 'U Độn', desc: '化影归冥,难以寻踪', descVi: 'Hóa ảnh về cõi u, khó tầm tung tích' }
    ]
  },
  {
    id: 'm_hundun_yuan',
    name: '混元一气初玄经',
    nameVi: 'Hỗn Nguyên Nhất Khí Sơ Huyền Kinh',
    type: 'main',
    quality: 'profound',
    minRealm: 5,
    element: 'chaos',
    desc: '参混元未分之始,万象同源,道气充沛',
    descVi: 'Tham ngộ thủa hỗn nguyên chưa phân, vạn tượng cùng nguồn, đạo khí dồi dào',
    baseMods: { cultivationSpeed: 0.22, attackPct: 0.16, defensePct: 0.16 },
    perLevelMods: { cultivationSpeed: 0.03, attackPct: 0.02 },
    skill: { name: '混元化虚劲', nameVi: 'Hỗn Nguyên Hóa Hư Kình', mult: 2.35, rate: 0.24 },
    branches: [
      { name: '归元', nameVi: 'Quy Nguyên', desc: '万象归真,威能无穷', descVi: 'Vạn tượng quy chân, uy năng vô cùng' },
      { name: '抱真', nameVi: 'Bão Chân', desc: '混元无缺,神躯自固', descVi: 'Hỗn nguyên không khuyết, thần thể tự vững' }
    ]
  },
  {
    id: 'm_dahuang',
    name: '大荒不灭霸体经',
    nameVi: 'Đại Hoang Bất Diệt Bá Thể Kinh',
    type: 'main',
    quality: 'profound',
    minRealm: 5,
    element: 'earth',
    desc: '承古大荒坤土厚意,肉身不坏,血气贯日',
    descVi: 'Thừa hưởng đức dày của đất Đại Hoang cổ xưa, nhục thân bất hoại, huyết khí ngút trời',
    baseMods: { cultivationSpeed: 0.2, defensePct: 0.18, maxHpPct: 0.18 },
    perLevelMods: { cultivationSpeed: 0.03, defensePct: 0.022 },
    skill: { name: '大荒撼天劲', nameVi: 'Đại Hoang Hám Thiên Kình', mult: 2.2, rate: 0.2 },
    branches: [
      { name: '霸击', nameVi: 'Bá Kích', desc: '雄沉一力,破万法阵', descVi: 'Hùng trầm một lực, phá vạn pháp trận' },
      { name: '金身', nameVi: 'Kim Thân', desc: '躯如精金,万劫不毁', descVi: 'Thân như vàng ròng, muôn kiếp không hủy' }
    ]
  },
  {
    id: 'm_wuji_jian',
    name: '玄空无极剑典',
    nameVi: 'Huyền Không Vô Cực Kiếm Điển',
    type: 'main',
    quality: 'profound',
    minRealm: 5,
    element: 'metal',
    desc: '剑出无形无迹,断虚空而不沾尘埃',
    descVi: 'Kiếm xuất vô hình vô tích, chém đứt hư không mà chẳng vướng bụi trần',
    baseMods: { cultivationSpeed: 0.22, attackPct: 0.2, critRate: 0.05 },
    perLevelMods: { cultivationSpeed: 0.03, attackPct: 0.025 },
    skill: { name: '无极破空刺', nameVi: 'Vô Cực Phá Không Thứ', mult: 2.45, rate: 0.24 },
    branches: [
      { name: '极锋', nameVi: 'Cực Phong', desc: '锋芒夺目,瞬断生机', descVi: 'Phong mang chói mắt, đoạn dứt sinh cơ' },
      { name: '虚空', nameVi: 'Hư Không', desc: '剑遁无形,神鬼难测', descVi: 'Kiếm độn vô hình, thần quỷ khó lường' }
    ]
  },
  {
    id: 'm_tianluo',
    name: '天罗神木化生录',
    nameVi: 'Thiên La Thần Mộc Hóa Sinh Lục',
    type: 'main',
    quality: 'profound',
    minRealm: 5,
    element: 'wood',
    desc: '通神木长生大道,扎根虚空,吸纳八荒菁华',
    descVi: 'Thông thần mộc trường sinh đại đạo, bén rễ hư không, hút lấy tinh hoa tám cõi',
    baseMods: { cultivationSpeed: 0.22, maxHpPct: 0.2, regenPerRound: 0.012 },
    perLevelMods: { cultivationSpeed: 0.03, maxHpPct: 0.022 },
    skill: { name: '天罗缠灵根', nameVi: 'Thiên La Triền Linh Căn', mult: 2.1, rate: 0.25 },
    branches: [
      { name: '逢源', nameVi: 'Phùng Nguyên', desc: '枝繁叶茂,生机无量', descVi: 'Cành lá sum suê, sinh cơ vô lượng' },
      { name: '锁脉', nameVi: 'Tỏa Mạch', desc: '千藤锁魄,困绝敌手', descVi: 'Ngàn dây khóa phách, vây khốn địch thủ' }
    ]
  },
  {
    id: 'm_nanming',
    name: '南明真火焚天典',
    nameVi: 'Nam Minh Chân Hỏa Phần Thiên Điển',
    type: 'main',
    quality: 'heaven',
    minRealm: 6,
    element: 'fire',
    desc: '南明离火本源化成,一缕可燃苍穹,焚尽凡胎',
    descVi: 'Bản nguyên Nam Minh Ly Hỏa hóa thành, một sợi có thể cháy bầu trời, thiêu rụi phàm thai',
    baseMods: { cultivationSpeed: 0.24, attackPct: 0.22, damageBonus: 0.08 },
    perLevelMods: { cultivationSpeed: 0.035, attackPct: 0.028 },
    skill: { name: '南明神雀击', nameVi: 'Nam Minh Thần Tước Kích', mult: 2.6, rate: 0.25 },
    branches: [
      { name: '离火', nameVi: 'Ly Hỏa', desc: '烈焰焚神,绝灭一切', descVi: 'Liệt diễm thiêu thần, tuyệt diệt vạn vật' },
      { name: '灵雀', nameVi: 'Linh Tước', desc: '朱雀庇身,神躯不竭', descVi: 'Chu Tước che thân, thần thể không cạn' }
    ]
  },
  {
    id: 'm_beihai',
    name: '北海真渊玄冥录',
    nameVi: 'Bắc Hải Chân Uyên Huyền Minh Lục',
    type: 'main',
    quality: 'heaven',
    minRealm: 6,
    element: 'water',
    desc: '沉入极北玄渊深处,水流千折,重若星辰',
    descVi: 'Lặn sâu vào cực bắc huyền uyên, nước chảy ngàn khúc, nặng tựa vì sao',
    baseMods: { cultivationSpeed: 0.23, defensePct: 0.2, damageReduction: 0.08 },
    perLevelMods: { cultivationSpeed: 0.035, defensePct: 0.025 },
    skill: { name: '北冥狂澜', nameVi: 'Bắc Minh Cuồng Làn', mult: 2.35, rate: 0.24 },
    branches: [
      { name: '狂澜', nameVi: 'Cuồng Làn', desc: '大浪滔天,覆灭诸强', descVi: 'Sóng lớn ngợp trời, lật đổ cường giả' },
      { name: '深渊', nameVi: 'Thâm Uyên', desc: '渊深不测,难伤根本', descVi: 'Vực sâu khôn lường, khó tổn căn bản' }
    ]
  },
  {
    id: 'm_jiuxiao_shenlei',
    name: '紫府神雷破劫经',
    nameVi: 'Tử Phủ Thần Lôi Phá Kiếp Kinh',
    type: 'main',
    quality: 'heaven',
    minRealm: 6,
    element: 'thunder',
    desc: '紫府生紫电,专克天劫厄难,横扫外魔',
    descVi: 'Tử phủ sinh tia chớp tím, chuyên khắc thiên kiếp ách nạn, quét sạch ngoại ma',
    baseMods: { cultivationSpeed: 0.25, attackPct: 0.24, tribulationResist: 0.08 },
    perLevelMods: { cultivationSpeed: 0.035, attackPct: 0.03 },
    skill: { name: '紫府雷霆怒', nameVi: 'Tử Phủ Lôi Đình Nộ', mult: 2.7, rate: 0.26 },
    branches: [
      { name: '破厄', nameVi: 'Phá Ách', desc: '天雷荡邪,无劫不克', descVi: 'Thiên lôi trừ tà, không kiếp nào không vượt' },
      { name: '霆威', nameVi: 'Đình Uy', desc: '万雷慑魄,霸气凌霄', descVi: 'Vạn lôi nhiếp phách, bá khí lăng tiêu' }
    ]
  },
  {
    id: 'm_xuankong',
    name: '无涯碎空风神典',
    nameVi: 'Vô Nhai Toái Không Phong Thần Điển',
    type: 'main',
    quality: 'heaven',
    minRealm: 6,
    element: 'wind',
    desc: '风破乾坤无涯,瞬移千步,割裂山川',
    descVi: 'Gió phá càn khôn vô bờ, di chuyển ngàn bước trong chớp mắt, xé rách non sông',
    baseMods: { cultivationSpeed: 0.24, dodgeRate: 0.06, speed: 0.05 },
    perLevelMods: { cultivationSpeed: 0.035, dodgeRate: 0.008 },
    skill: { name: '碎空旋杀', nameVi: 'Toái Không Toàn Sát', mult: 2.5, rate: 0.26 },
    branches: [
      { name: '碎风', nameVi: 'Toái Phong', desc: '罡刃如割,所过皆摧', descVi: 'Cương nhận như cưa, qua đâu nát đấy' },
      { name: '风隐', nameVi: 'Phong Ẩn', desc: '遁行虚境,进退自若', descVi: 'Độn vào hư cảnh, tiến thoái tự tại' }
    ]
  },
  {
    id: 'm_hanyuan',
    name: '极寒天渊冰魄典',
    nameVi: 'Cực Hàn Thiên Uyên Băng Phách Điển',
    type: 'main',
    quality: 'heaven',
    minRealm: 7,
    element: 'ice',
    desc: '聚天渊无尽玄霜,连时光亦能凝结成寒晶',
    descVi: 'Tụ thiên uyên vô tận huyền sương, đến cả thời gian cũng đông thành tinh thể băng',
    baseMods: { cultivationSpeed: 0.25, defensePct: 0.22, damageReduction: 0.09 },
    perLevelMods: { cultivationSpeed: 0.04, defensePct: 0.026 },
    skill: { name: '万载寒晶破', nameVi: 'Vạn Tải Hàn Tinh Phá', mult: 2.55, rate: 0.25 },
    branches: [
      { name: '绝寒', nameVi: 'Tuyệt Hàn', desc: '寸草不生,冻灭万象', descVi: 'Cỏ cây chẳng mọc, đông lạnh vạn tượng' },
      { name: '冰神', nameVi: 'Băng Thần', desc: '神魄化冰,不破不坏', descVi: 'Thần phách hóa băng, không vỡ không hỏng' }
    ]
  },
  {
    id: 'm_chongtianguang',
    name: '太虚玄天神光录',
    nameVi: 'Thái Hư Huyền Thiên Thần Quang Lục',
    type: 'main',
    quality: 'heaven',
    minRealm: 7,
    element: 'light',
    desc: '引九霄玄天耀光照彻躯壳,驱除万邪,道基长明',
    descVi: 'Dẫn chín tầng trời huyền quang chiếu soi thân xác, xua đuổi tà uế, đạo cơ sáng mãi',
    baseMods: { cultivationSpeed: 0.26, attackPct: 0.22, critRate: 0.05 },
    perLevelMods: { cultivationSpeed: 0.04, attackPct: 0.028 },
    skill: { name: '天光净邪斩', nameVi: 'Thiên Quang Tịnh Tà Trảm', mult: 2.65, rate: 0.24 },
    branches: [
      { name: '净照', nameVi: 'Tịnh Chiếu', desc: '神光如洗,妖邪尽散', descVi: 'Thần quang như rửa, yêu tà tan tác' },
      { name: '圣躯', nameVi: 'Thánh Khu', desc: '金光护佑,从容不惊', descVi: 'Kim quang bảo hộ, ung dung không sợ' }
    ]
  },
  {
    id: 'm_wuwang',
    name: '无妄寂灭暗天经',
    nameVi: 'Vô Vọng Tịch Diệt Ám Thiên Kinh',
    type: 'main',
    quality: 'heaven',
    minRealm: 7,
    element: 'dark',
    desc: '踏入暗无天日之境,化无妄凶煞为灭顶杀伐',
    descVi: 'Bước vào cõi trời u tối, hóa vô vọng hung sát thành đòn sát phạt diệt đỉnh',
    baseMods: { cultivationSpeed: 0.25, attackPct: 0.25, lowHpDamage: 0.2 },
    perLevelMods: { cultivationSpeed: 0.04, attackPct: 0.03 },
    skill: { name: '寂灭暗光杀', nameVi: 'Tịch Diệt Ám Quang Sát', mult: 2.75, rate: 0.23 },
    branches: [
      { name: '寂灭', nameVi: 'Tịch Diệt', desc: '煞气冲霄,寸草难存', descVi: 'Sát khí ngút trời, cỏ cây khó sống' },
      { name: '暗影', nameVi: 'Ám Ảnh', desc: '身化暗渊,从容自保', descVi: 'Thân hóa vực tối, thong dong tự bảo vệ' }
    ]
  },
  {
    id: 'm_tiandao_hundun',
    name: '周天混元道极典',
    nameVi: 'Chu Thiên Hỗn Nguyên Đạo Cực Điển',
    type: 'main',
    quality: 'heaven',
    minRealm: 8,
    element: 'chaos',
    desc: '行周天大化之道,化混元为己力,诸法万物皆可衍化',
    descVi: 'Hành chu thiên đại hóa đạo, biến hỗn nguyên thành sức mình, vạn vật đều có thể diễn sinh',
    baseMods: { cultivationSpeed: 0.28, attackPct: 0.22, defensePct: 0.22 },
    perLevelMods: { cultivationSpeed: 0.045, attackPct: 0.026 },
    skill: { name: '周天破界印', nameVi: 'Chu Thiên Phá Giới Ấn', mult: 2.8, rate: 0.25 },
    branches: [
      { name: '周天', nameVi: 'Chu Thiên', desc: '混元合一,威震十方', descVi: 'Hỗn nguyên hợp nhất, uy chấn mười phương' },
      { name: '化元', nameVi: 'Hóa Nguyên', desc: '海纳万法,道体无损', descVi: 'Chứa nạp vạn pháp, đạo thể không tổn hại' }
    ]
  },
  {
    id: 'm_taixu_po',
    name: '太虚裂界神剑典',
    nameVi: 'Thái Hư Liệt Giới Thần Kiếm Điển',
    type: 'main',
    quality: 'heaven',
    minRealm: 8,
    element: 'metal',
    desc: '太虚古剑道,一剑可破界膜,碎尽诸天法障',
    descVi: 'Kiếm đạo Thái Hư cổ xưa, một kiếm có thể phá vỡ giới màng, chặt đứt mọi chướng ngại chư thiên',
    baseMods: { cultivationSpeed: 0.28, attackPct: 0.26, critRate: 0.06 },
    perLevelMods: { cultivationSpeed: 0.045, attackPct: 0.032 },
    skill: { name: '裂界灭度斩', nameVi: 'Liệt Giới Diệt Độ Trảm', mult: 2.9, rate: 0.25 },
    branches: [
      { name: '裂空', nameVi: 'Liệt Không', desc: '剑破界虚,万魔首落', descVi: 'Kiếm xé cõi hư, vạn ma rơi đầu' },
      { name: '固神', nameVi: 'Cố Thần', desc: '以剑立道,神台永固', descVi: 'Lấy kiếm lập đạo, thần đài vững bền' }
    ]
  },
  {
    id: 'm_canglong',
    name: '苍龙镇世玄水典',
    nameVi: 'Thương Long Trấn Thế Huyền Thủy Điển',
    type: 'main',
    quality: 'heaven',
    minRealm: 8,
    element: 'water',
    desc: '唤万古苍龙之息,翻江倒海,镇服八极诸夷',
    descVi: 'Kêu gọi hơi thở Thương Long muôn thuở, dời non lấp biển, trấn áp tám phương',
    baseMods: { cultivationSpeed: 0.27, defensePct: 0.24, maxHpPct: 0.24 },
    perLevelMods: { cultivationSpeed: 0.045, defensePct: 0.028 },
    skill: { name: '苍龙探爪', nameVi: 'Thương Long Thám Trảo', mult: 2.75, rate: 0.24 },
    branches: [
      { name: '龙威', nameVi: 'Long Uy', desc: '龙威浩荡,威压四海', descVi: 'Long uy dạt dào, uy áp bốn biển' },
      { name: '龙铠', nameVi: 'Long Khải', desc: '龙鳞密覆,固若金汤', descVi: 'Vảy rồng bao phủ, kiên cố vững vàng' }
    ]
  },

  // ---- TIÊN GIỚI (Cảnh giới 9-13: mang dấu ấn 仙, 云, 玉, 瑶, 星, 虚, 太, 罗, 雷) ----
  {
    id: 'm_xianyu_jian',
    name: '九天仙玉破虚剑',
    nameVi: 'Cửu Thiên Tiên Ngọc Phá Hư Kiếm',
    type: 'main',
    quality: 'immortal',
    minRealm: 9,
    element: 'metal',
    desc: '以仙界温玉凝就真灵古剑,斩破虚空障碍',
    descVi: 'Dùng ôn ngọc Tiên giới ngưng tụ thành cổ kiếm chân linh, chém đứt chướng ngại hư không',
    baseMods: { cultivationSpeed: 0.29, attackPct: 0.25, critRate: 0.05 },
    perLevelMods: { cultivationSpeed: 0.05, attackPct: 0.03 },
    skill: { name: '仙玉凌波斩', nameVi: 'Tiên Ngọc Lăng Ba Trảm', mult: 2.8, rate: 0.25 },
    branches: [
      { name: '破障', nameVi: 'Phá Chướng', desc: '仙锋凌厉,斩尽因果', descVi: 'Tiên phong sắc bén, chém dứt nhân quả' },
      { name: '温润', nameVi: 'Ôn Nhuận', desc: '玉光养神,百劫从容', descVi: 'Ánh ngọc dưỡng thần, trăm kiếp an nhiên' }
    ]
  },
  {
    id: 'm_yunxiao_sheng',
    name: '青云霄汉长生典',
    nameVi: 'Thanh Vân Tiêu Hán Trường Sinh Điển',
    type: 'main',
    quality: 'immortal',
    minRealm: 9,
    element: 'wood',
    desc: '云霄深处孕育之仙木灵华,枯荣随心,生机无穷',
    descVi: 'Tinh hoa tiên mộc nuôi dưỡng chốn trời mây, nở tàn tùy tâm, sinh cơ bất tận',
    baseMods: { cultivationSpeed: 0.3, maxHpPct: 0.24, regenPerRound: 0.015 },
    perLevelMods: { cultivationSpeed: 0.05, maxHpPct: 0.03 },
    skill: { name: '云霄百华绽', nameVi: 'Vân Tiêu Bách Hoa Trán', mult: 2.65, rate: 0.26 },
    branches: [
      { name: '生荣', nameVi: 'Sinh Vinh', desc: '万木朝宗,神体自茂', descVi: 'Vạn mộc quy tông, thần thể tự tươi' },
      { name: '藤界', nameVi: 'Đằng Giới', desc: '密林如阵,固若天牢', descVi: 'Rừng rậm thành trận, vững tựa thiên lao' }
    ]
  },
  {
    id: 'm_yaochi_xuan',
    name: '瑶池玄真化水经',
    nameVi: 'Dao Trì Huyền Chân Hóa Thủy Kinh',
    type: 'main',
    quality: 'immortal',
    minRealm: 10,
    element: 'water',
    desc: '汲取瑶池玉液仙水之精,以至净至纯之水养炼道胎',
    descVi: 'Lấy tinh hoa ngọc dịch tiên thủy hồ Dao Trì, dùng nước chí tịnh chí thuần rèn luyện đạo thai',
    baseMods: { cultivationSpeed: 0.3, defensePct: 0.25, damageReduction: 0.09 },
    perLevelMods: { cultivationSpeed: 0.05, defensePct: 0.03 },
    skill: { name: '瑶池荡涤波', nameVi: 'Dao Trì Đãng Địch Ba', mult: 2.7, rate: 0.24 },
    branches: [
      { name: '清波', nameVi: 'Thanh Ba', desc: '玉液涤神,万垢不染', descVi: 'Ngọc dịch gột thần, không nhiễm trần nhơ' },
      { name: '潮御', nameVi: 'Triều Ngự', desc: '浪叠千重,御守万方', descVi: 'Sóng dồn ngàn lớp, phòng thủ muôn nơi' }
    ]
  },
  {
    id: 'm_taixu_lihuo',
    name: '太虚玄霄离火典',
    nameVi: 'Thái Hư Huyền Tiêu Ly Hỏa Điển',
    type: 'main',
    quality: 'immortal',
    minRealm: 10,
    element: 'fire',
    desc: '从太虚深处召取离天神炎,焚虚煮海,无物不化',
    descVi: 'Gọi ngọn lửa trời từ cõi Thái Hư sâu thẳm, đốt cõi sôi biển, vạn vật khó cản',
    baseMods: { cultivationSpeed: 0.31, attackPct: 0.26, damageBonus: 0.09 },
    perLevelMods: { cultivationSpeed: 0.05, attackPct: 0.032 },
    skill: { name: '太虚炽天焱', nameVi: 'Thái Hư Sí Thiên Diễm', mult: 2.9, rate: 0.24 },
    branches: [
      { name: '赤灭', nameVi: 'Xích Diệt', desc: '极炎崩神,无所不克', descVi: 'Cực viêm diệt thần, không gì không phá' },
      { name: '炎神', nameVi: 'Viêm Thần', desc: '真火锻躯,百炼成圣', descVi: 'Chân hỏa rèn thể, trăm lần thành thánh' }
    ]
  },
  {
    id: 'm_luotian_hou',
    name: '罗天九重厚土经',
    nameVi: 'La Thiên Cửu Trọng Hậu Thổ Kinh',
    type: 'main',
    quality: 'immortal',
    minRealm: 11,
    element: 'earth',
    desc: '采罗天界厚重坤地之精,坚如星辰核心,难以撼动',
    descVi: 'Hấp thu đất dày cõi La Thiên, vững như tâm sao trời, không thể lay chuyển',
    baseMods: { cultivationSpeed: 0.31, defensePct: 0.28, maxHpPct: 0.26 },
    perLevelMods: { cultivationSpeed: 0.05, defensePct: 0.034 },
    skill: { name: '罗天坠岳击', nameVi: 'La Thiên Trụy Nhạc Kích', mult: 2.8, rate: 0.22 },
    branches: [
      { name: '镇煞', nameVi: 'Trấn Sát', desc: '山岳镇邪,威伏四荒', descVi: 'Non cao trấn tà, uy phục bốn phương' },
      { name: '坤德', nameVi: 'Khôn Đức', desc: '厚德载物,长存无忧', descVi: 'Đức dày nâng đỡ, trường tồn vô lo' }
    ]
  },
  {
    id: 'm_xianlei_jiu',
    name: '九重仙雷度化典',
    nameVi: 'Cửu Trọng Tiên Lôi Độ Hóa Điển',
    type: 'main',
    quality: 'immortal',
    minRealm: 11,
    element: 'thunder',
    desc: '炼九重仙界神雷入法体,电光过处,诸妄尽消',
    descVi: 'Luyện lôi đình chín tầng Tiên giới nhập pháp thể, tia chớp rạch qua, mọi điều hư ảo đều tan',
    baseMods: { cultivationSpeed: 0.32, attackPct: 0.28, critRate: 0.06 },
    perLevelMods: { cultivationSpeed: 0.05, attackPct: 0.034 },
    skill: { name: '仙雷诛邪伐', nameVi: 'Tiên Lôi Tru Tà Phạt', mult: 2.95, rate: 0.26 },
    branches: [
      { name: '雷亟', nameVi: 'Lôi Cực', desc: '极雷落顶,刹那绝杀', descVi: 'Sấm sét giáng đỉnh, trong chớp mắt tuyệt sát' },
      { name: '霆甲', nameVi: 'Đình Giáp', desc: '雷光化甲,退敌三千', descVi: 'Lôi quang hóa giáp, đẩy lui ba ngàn địch' }
    ]
  },
  {
    id: 'm_xingyun_feng',
    name: '星云九转罡风典',
    nameVi: 'Tinh Vân Cửu Chuyển Cương Phong Điển',
    type: 'main',
    quality: 'immortal',
    minRealm: 12,
    element: 'wind',
    desc: '御周天星云之罡风,穿梭大千界域如等闲',
    descVi: 'Ngự cương phong chốn mây sao chu thiên, xuyên qua đại thiên giới vực tựa trò chơi',
    baseMods: { cultivationSpeed: 0.32, dodgeRate: 0.07, speed: 0.05 },
    perLevelMods: { cultivationSpeed: 0.055, dodgeRate: 0.009 },
    skill: { name: '星云破界裂', nameVi: 'Tinh Vân Phá Giới Liệt', mult: 2.85, rate: 0.27 },
    branches: [
      { name: '神风', nameVi: 'Thần Phong', desc: '罡刃如雨,破灭星穹', descVi: 'Lưỡi gió như mưa, phá diệt vòm sao' },
      { name: '星移', nameVi: 'Tinh Di', desc: '身随星转,神鬼莫辨', descVi: 'Thân dời theo sao, thần quỷ chẳng hay' }
    ]
  },
  {
    id: 'm_yuhan_shuang',
    name: '玉寒仙魄凝华经',
    nameVi: 'Ngọc Hàn Tiên Phách Ngưng Hoa Kinh',
    type: 'main',
    quality: 'immortal',
    minRealm: 12,
    element: 'ice',
    desc: '寒玉凝精化仙魄,万劫不损,一缕冰魄冻三界',
    descVi: 'Hàn ngọc ngưng tinh hóa tiên phách, muôn kiếp không mòn, một sợi băng phách đóng băng tam giới',
    baseMods: { cultivationSpeed: 0.32, defensePct: 0.26, damageReduction: 0.1 },
    perLevelMods: { cultivationSpeed: 0.055, defensePct: 0.032 },
    skill: { name: '玉霜封天印', nameVi: 'Ngọc Sương Phong Thiên Ấn', mult: 2.8, rate: 0.24 },
    branches: [
      { name: '封禁', nameVi: 'Phong Cấm', desc: '千里冰封,断敌生机', descVi: 'Ngàn dặm đóng băng, đoạn dứt sinh cơ địch' },
      { name: '寒仙', nameVi: 'Hàn Tiên', desc: '魄如温玉,万魔不侵', descVi: 'Phách tựa ngọc lành, vạn ma chẳng hại' }
    ]
  },
  {
    id: 'm_xianling_guang',
    name: '太华仙灵明耀典',
    nameVi: 'Thái Hoa Tiên Linh Minh Diệu Điển',
    type: 'main',
    quality: 'immortal',
    minRealm: 12,
    element: 'light',
    desc: '仙灵神曜普照三千界,光明正大,道意永昌',
    descVi: 'Tiên linh thần diệu chiếu khắp ba ngàn cõi, quang minh chính đại, đạo ý trường hưng',
    baseMods: { cultivationSpeed: 0.33, attackPct: 0.26, critRate: 0.06 },
    perLevelMods: { cultivationSpeed: 0.055, attackPct: 0.032 },
    skill: { name: '仙耀大明诛', nameVi: 'Tiên Diệu Đại Minh Tru', mult: 2.9, rate: 0.25 },
    branches: [
      { name: '普照', nameVi: 'Phổ Chiếu', desc: '金芒破煞,诸恶伏诛', descVi: 'Ánh vàng trừ sát, muôn ác đền tội' },
      { name: '光身', nameVi: 'Quang Thân', desc: '光明在体,神圣长存', descVi: 'Quang minh quanh thân, thần thánh trường tồn' }
    ]
  },
  {
    id: 'm_taixu_you',
    name: '太虚幽煞断魂典',
    nameVi: 'Thái Hư U Sát Đoạn Hồn Điển',
    type: 'main',
    quality: 'immortal',
    minRealm: 13,
    element: 'dark',
    desc: '取太虚极幽之煞气,暗藏锋芒,一击夺命',
    descVi: 'Lấy sát khí cực u của Thái Hư, giấu kín phong mang, một kích đoạt mạng',
    baseMods: { cultivationSpeed: 0.33, attackPct: 0.3, lowHpDamage: 0.22 },
    perLevelMods: { cultivationSpeed: 0.06, attackPct: 0.036 },
    skill: { name: '太虚灭绝爪', nameVi: 'Thái Hư Diệt Tuyệt Trảo', mult: 3.0, rate: 0.24 },
    branches: [
      { name: '绝煞', nameVi: 'Tuyệt Sát', desc: '幽芒裂道,夺敌真元', descVi: 'U mang xé đạo, đoạt chân nguyên kẻ thù' },
      { name: '虚冥', nameVi: 'Hư Minh', desc: '遁入幽暗,从容避祸', descVi: 'Độn vào chốn tối, ung dung lánh nạn' }
    ]
  },
  {
    id: 'm_xianluo_hun',
    name: '罗天仙华混元经',
    nameVi: 'La Thiên Tiên Hoa Hỗn Nguyên Kinh',
    type: 'main',
    quality: 'immortal',
    minRealm: 13,
    element: 'chaos',
    desc: '熔罗天仙华与大千混元于一身,诸法随心,道基登峰',
    descVi: 'Dung hợp tiên hoa La Thiên cùng hỗn nguyên vào thân, vạn pháp tùy tâm, đạo cơ chạm đỉnh',
    baseMods: { cultivationSpeed: 0.34, attackPct: 0.28, defensePct: 0.28 },
    perLevelMods: { cultivationSpeed: 0.06, attackPct: 0.035 },
    skill: { name: '仙混裂星拳', nameVi: 'Tiên Hỗn Liệt Tinh Quyền', mult: 3.05, rate: 0.25 },
    branches: [
      { name: '合仙', nameVi: 'Hợp Tiên', desc: '万相合真,神力通霄', descVi: 'Vạn tướng hợp chân, thần lực thấu trời' },
      { name: '混化', nameVi: 'Hỗn Hóa', desc: '真道归朴,不毁不磨', descVi: 'Chân đạo quy phác, không mài không mòn' }
    ]
  },

  // ---- THẦN GIỚI (Cảnh giới 14-17: mang dấu ấn 神, 帝, 王, 冕, 诏, 法, 则) ----
  {
    id: 'm_shenwang_jian',
    name: '神王破天诛魔剑',
    nameVi: 'Thần Vương Phá Thiên Tru Ma Kiếm',
    type: 'main',
    quality: 'divine',
    minRealm: 14,
    element: 'metal',
    desc: '上古神王所佩征天神剑,剑意纵横万界,神魔皆惧',
    descVi: 'Chinh thiên thần kiếm thời thượng cổ Thần Vương, kiếm ý tung hoành muôn cõi, thần ma đều khiếp',
    baseMods: { cultivationSpeed: 0.35, attackPct: 0.32, critRate: 0.07 },
    perLevelMods: { cultivationSpeed: 0.065, attackPct: 0.04 },
    skill: { name: '神王碎宇斩', nameVi: 'Thần Vương Toái Vũ Trảm', mult: 3.15, rate: 0.26 },
    branches: [
      { name: '破宇', nameVi: 'Phá Vũ', desc: '神剑所向,天地皆摧', descVi: 'Thần kiếm chém tới, trời đất đều tan' },
      { name: '王威', nameVi: 'Vương Uy', desc: '王者之师,神体自强', descVi: 'Thế vương giả, thần thể tự cường' }
    ]
  },
  {
    id: 'm_shengdi_mulin',
    name: '神帝古灵神木录',
    nameVi: 'Thần Đế Cổ Linh Thần Mộc Lục',
    type: 'main',
    quality: 'divine',
    minRealm: 14,
    element: 'wood',
    desc: '记载神界至尊神帝亲手植就的世界灵木奥义,生息长存',
    descVi: 'Ghi chép áo nghĩa của cây thần thế giới do Thần Đế tự tay gieo cấy, sinh sôi trường tồn',
    baseMods: { cultivationSpeed: 0.35, maxHpPct: 0.3, regenPerRound: 0.02 },
    perLevelMods: { cultivationSpeed: 0.065, maxHpPct: 0.04 },
    skill: { name: '神木开世波', nameVi: 'Thần Mộc Khai Thế Ba', mult: 2.9, rate: 0.27 },
    branches: [
      { name: '万生', nameVi: 'Vạn Sinh', desc: '神息润世,长生无极', descVi: 'Hơi thở thần tưới cõi, trường sinh vô cực' },
      { name: '帝印', nameVi: 'Đế Ấn', desc: '帝木结阵,牢不可破', descVi: 'Gỗ thiêng kết trận, bền chặt khôn lay' }
    ]
  },
  {
    id: 'm_faze_xuanhai',
    name: '万象法则玄海经',
    nameVi: 'Vạn Tượng Pháp Tắc Huyền Hải Kinh',
    type: 'main',
    quality: 'divine',
    minRealm: 15,
    element: 'water',
    desc: '掌天地万象法则之水,浩浩荡荡,洗涤三千神界',
    descVi: 'Nắm giữ dòng nước pháp tắc vạn tượng đất trời, cuồn cuộn dâng trào, gột rửa ba ngàn thần giới',
    baseMods: { cultivationSpeed: 0.36, defensePct: 0.3, damageReduction: 0.12 },
    perLevelMods: { cultivationSpeed: 0.07, defensePct: 0.04 },
    skill: { name: '法则汪洋覆', nameVi: 'Pháp Tắc Uông Dương Phúc', mult: 3.0, rate: 0.25 },
    branches: [
      { name: '法涛', nameVi: 'Pháp Đào', desc: '巨浪滔天,覆尽万道', descVi: 'Sóng lớn ngập trời, chôn vùi vạn đạo' },
      { name: '天渊', nameVi: 'Thiên Uyên', desc: '渊深海阔,波澜不惊', descVi: 'Vực sâu biển rộng, không chút gợn sóng' }
    ]
  },
  {
    id: 'm_shenhuo_fen',
    name: '神火九阳焚道录',
    nameVi: 'Thần Hỏa Cửu Dương Phần Đạo Lục',
    type: 'main',
    quality: 'divine',
    minRealm: 17,
    element: 'fire',
    desc: '纳神界至高之火,烈焰炽盛如九阳齐坠,焚毁诸神障',
    descVi: 'Dung nạp ngọn lửa chí cao thần giới, hỏa diễm rực sáng tựa chín vầng thái dương rụng xuống',
    baseMods: { cultivationSpeed: 0.36, attackPct: 0.34, damageBonus: 0.12 },
    perLevelMods: { cultivationSpeed: 0.07, attackPct: 0.042 },
    skill: { name: '九阳落世爆', nameVi: 'Cửu Dương Lạc Thế Bạo', mult: 3.2, rate: 0.25 },
    branches: [
      { name: '焚穹', nameVi: 'Phần Khung', desc: '神火裂虚,诸神退避', descVi: 'Thần hỏa xé cõi, chư thần thoái lui' },
      { name: '九阳', nameVi: 'Cửu Dương', desc: '真火淬道,神躯无伤', descVi: 'Chân hỏa rèn đạo, thần thể không thương tích' }
    ]
  },
  {
    id: 'm_diwang_zhenyue',
    name: '帝王真岳神岳录',
    nameVi: 'Đế Vương Chân Nhạc Thần Nhạc Lục',
    type: 'main',
    quality: 'divine',
    minRealm: 16,
    element: 'earth',
    desc: '诸天帝王以神岳镇国,厚重莫测,压胜万灵',
    descVi: 'Chư thiên đế vương dùng thần nhạc trấn quốc, dày nặng khôn lường, trấn áp vạn linh',
    baseMods: { cultivationSpeed: 0.37, defensePct: 0.34, maxHpPct: 0.3 },
    perLevelMods: { cultivationSpeed: 0.075, defensePct: 0.045 },
    skill: { name: '帝岳镇神崩', nameVi: 'Đế Nhạc Trấn Thần Băng', mult: 3.1, rate: 0.23 },
    branches: [
      { name: '帝岳', nameVi: 'Đế Nhạc', desc: '山岳崩灭,力贯千钧', descVi: 'Non cao vỡ vụn, lực dội ngàn cân' },
      { name: '磐帝', nameVi: 'Bàn Đế', desc: '巍然不动,威严长存', descVi: 'Sừng sững không dời, uy nghiêm trường tồn' }
    ]
  },
  {
    id: 'm_shenzhao_leiting',
    name: '神诏万界雷霆典',
    nameVi: 'Thần Chiếu Vạn Giới Lôi Đình Điển',
    type: 'main',
    quality: 'divine',
    minRealm: 16,
    element: 'thunder',
    desc: '神诏如律令,号令诸天万界极道雷霆,行苍天杀伐',
    descVi: 'Chiếu chỉ thần như sắc lệnh, chỉ huy lôi đình cực đạo của muôn cõi trời đất',
    baseMods: { cultivationSpeed: 0.37, attackPct: 0.35, critRate: 0.08 },
    perLevelMods: { cultivationSpeed: 0.075, attackPct: 0.045 },
    skill: { name: '神诏灭道雷', nameVi: 'Thần Chiếu Diệt Đạo Lôi', mult: 3.25, rate: 0.26 },
    branches: [
      { name: '灭道', nameVi: 'Diệt Đạo', desc: '天诏破极,雷落无生', descVi: 'Chiếu trời phá cực, lôi giáng tuyệt mạng' },
      { name: '雷尊', nameVi: 'Lôi Tôn', desc: '神威如海,号令群雷', descVi: 'Thần uy như biển, chỉ huy vạn lôi' }
    ]
  },
  {
    id: 'm_faguan_tianfeng',
    name: '法冕凌天神风经',
    nameVi: 'Pháp Miện Lăng Thiên Thần Phong Kinh',
    type: 'main',
    quality: 'divine',
    minRealm: 17,
    element: 'wind',
    desc: '法冕加身,乘万劫无极神风,俯察神界兴废',
    descVi: 'Đội miện pháp trên đầu, cưỡi thần phong muôn kiếp, nhìn xuống sự thịnh suy chư cõi',
    baseMods: { cultivationSpeed: 0.38, dodgeRate: 0.08, speed: 0.05 },
    perLevelMods: { cultivationSpeed: 0.08, dodgeRate: 0.01 },
    skill: { name: '法冕破虚风', nameVi: 'Pháp Miện Phá Hư Phong', mult: 3.15, rate: 0.28 },
    branches: [
      { name: '凌天', nameVi: 'Lăng Thiên', desc: '狂风裂宙,所向无碍', descVi: 'Gió giận xé trời, tiến bước không ngăn' },
      { name: '神度', nameVi: 'Thần Độ', desc: '飘渺无痕,万法皆空', descVi: 'Phiêu miểu không vết, vạn pháp thành không' }
    ]
  },
  {
    id: 'm_shendi_bingling',
    name: '神帝绝天冰魄典',
    nameVi: 'Thần Đế Tuyệt Thiên Băng Phách Điển',
    type: 'main',
    quality: 'divine',
    minRealm: 17,
    element: 'ice',
    desc: '神帝至尊寒法,一念封冻诸天世界之运势',
    descVi: 'Hàn pháp chí tôn của Thần Đế, một niệm đóng băng vận mệnh chư thiên thế giới',
    baseMods: { cultivationSpeed: 0.38, defensePct: 0.35, damageReduction: 0.14 },
    perLevelMods: { cultivationSpeed: 0.08, defensePct: 0.045 },
    skill: { name: '绝天寒星落', nameVi: 'Tuyệt Thiên Hàn Tinh Lạc', mult: 3.2, rate: 0.25 },
    branches: [
      { name: '绝冻', nameVi: 'Tuyệt Đống', desc: '冰封三千,生机俱灭', descVi: 'Đóng băng ba ngàn cõi, sinh cơ đều diệt' },
      { name: '帝魄', nameVi: 'Đế Phách', desc: '冰魄为尊,万劫不移', descVi: 'Băng phách làm tôn, muôn kiếp không dời' }
    ]
  },

  // ---- HỖN ĐỘN (Cảnh giới 18-20: mang dấu ấn 混, 沌, 鸿, 蒙, 本, 源, 真, 灵, 无, 极, 开, 道, 界, 神, 魔) ----
  {
    id: 'm_hongmeng_zhen',
    name: '鸿蒙本源真灵圣典',
    nameVi: 'Hồng Mông Bản Nguyên Chân Linh Thánh Điển',
    type: 'main',
    quality: 'divine',
    minRealm: 18,
    element: 'chaos',
    desc: '汲取鸿蒙本源之气,证真灵不灭真身,超拔天地之表',
    descVi: 'Hấp thụ khí bản nguyên Hồng Mông, chứng ngộ chân linh bất diệt chân thân, vượt khỏi đất trời',
    baseMods: { cultivationSpeed: 0.4, attackPct: 0.36, defensePct: 0.36 },
    perLevelMods: { cultivationSpeed: 0.085, attackPct: 0.05 },
    skill: { name: '鸿蒙真灵击', nameVi: 'Hồng Mông Chân Linh Kích', mult: 3.3, rate: 0.26 },
    branches: [
      { name: '真灵', nameVi: 'Chân Linh', desc: '返本归源,神力盖世', descVi: 'Về nguồn về gốc, thần lực áp đời' },
      { name: '圣体', nameVi: 'Thánh Thể', desc: '身如鸿蒙,难毁难消', descVi: 'Thân như Hồng Mông, khó hủy khó tan' }
    ]
  },
  {
    id: 'm_kaitian_mo',
    name: '开天辟地混沌神魔典',
    nameVi: 'Khai Thiên Tích Địa Hỗn Độn Thần Ma Điển',
    type: 'main',
    quality: 'divine',
    minRealm: 19,
    element: 'chaos',
    desc: '演混沌古神魔开天伟力,一斧劈开虚空乾坤',
    descVi: 'Diễn hóa vĩ lực khai thiên của Thần Ma cổ xưa thời Hỗn Độn, một búa bổ toác càn khôn hư không',
    baseMods: { cultivationSpeed: 0.42, attackPct: 0.4, critRate: 0.08 },
    perLevelMods: { cultivationSpeed: 0.09, attackPct: 0.055 },
    skill: { name: '神魔开天斩', nameVi: 'Thần Ma Khai Thiên Trảm', mult: 3.4, rate: 0.27 },
    branches: [
      { name: '神魔', nameVi: 'Thần Ma', desc: '霸力辟地,破尽诸天', descVi: 'Bá lực xẻ đất, phá tan chư thiên' },
      { name: '辟元', nameVi: 'Tích Nguyên', desc: '开天立地,道骨长存', descVi: 'Khai thiên lập địa, đạo cốt trường tồn' }
    ]
  },
  {
    id: 'm_wuji_daoyuan',
    name: '无极大乘道源玄录',
    nameVi: 'Vô Cực Đại Thừa Đạo Nguyên Huyền Lục',
    type: 'main',
    quality: 'divine',
    minRealm: 20,
    element: 'chaos',
    desc: '达大道之源头,万法皆空,物我两忘,超脱一切法则',
    descVi: 'Đạt tới ngọn nguồn đại đạo, vạn pháp thành không, quên mình quên vật, siêu thoát mọi quy luật',
    baseMods: { cultivationSpeed: 0.4, attackPct: 0.26, defensePct: 0.25, breakthroughRate: 0.05 },
    perLevelMods: { cultivationSpeed: 0.04, attackPct: 0.02, defensePct: 0.02 },
    skill: { name: '无极道源破', nameVi: 'Vô Cực Đạo Nguyên Phá', mult: 3.45, rate: 0.28 },
    branches: [
      { name: '道源', nameVi: 'Đạo Nguyên', desc: '源始之理,无往不利', descVi: 'Lý lẽ cội nguồn, đánh đâu thắng đó' },
      { name: '极境', nameVi: 'Cực Cảnh', desc: '身合无极,与道同休', descVi: 'Thân hợp vô cực, cùng đạo nghỉ ngơi' }
    ]
  },
  {
    id: 'm_hundun_wanshen',
    name: '混沌道极万神归真典',
    nameVi: 'Hỗn Độn Đạo Cực Vạn Thần Quy Chân Điển',
    type: 'main',
    quality: 'divine',
    minRealm: 20,
    element: 'chaos',
    desc: '诸天万道归于混沌一元,一念可生世界,一念可灭寰宇',
    descVi: 'Muôn vàn đạo trời quy về một mối Hỗn Độn, một niệm sinh thế giới, một niệm diệt hoàn vũ',
    baseMods: { cultivationSpeed: 0.45, attackPct: 0.26, defensePct: 0.24, maxHpPct: 0.24 },
    perLevelMods: { cultivationSpeed: 0.05, attackPct: 0.022, defensePct: 0.02 },
    skill: { name: '万道归真一击', nameVi: 'Vạn Đạo Quy Chân Nhất Kích', mult: 3.5, rate: 0.28 },
    branches: [
      { name: '万神', nameVi: 'Vạn Thần', desc: '万道归真,威临绝顶', descVi: 'Vạn đạo về chân, uy lâm tột đỉnh' },
      { name: '道一', nameVi: 'Đạo Nhất', desc: '一气化生,万物难伤', descVi: 'Một khí sinh hóa, vạn vật khó làm tổn thương' }
    ]
  }
]
