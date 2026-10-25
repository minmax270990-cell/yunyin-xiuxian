import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkChars, checkWorldMark, allReservedNames, existingGongfaIds } from './build-gongfa-data.mjs'

export const SECRET_GONGFA_DATA = [
  // ==========================================
  // NHÓM 1: ATTACK (22 Bí thuật Công kích / Tuyệt kỹ / Sát thương)
  // ==========================================
  // Phàm giới (0-8)
  {
    id: 'x_pojun_zhan',
    name: '破军贯日真决',
    nameVi: 'Phá Quân Quán Nhật Chân Quyết',
    type: 'secret',
    quality: 'fine',
    minRealm: 0,
    element: 'metal',
    secretCategory: 'attack',
    minComprehension: 40,
    desc: '破军星力注入剑气,直贯长日,破灭护体罡气',
    descVi: 'Lực sao Phá Quân rót vào kiếm khí, đâm xuyên vầng dương, phá diệt hộ thể cương khí',
    baseMods: { attackPct: 0.08, critRate: 0.03 },
    perLevelMods: { attackPct: 0.02, critRate: 0.01 },
    branches: [
      { name: '破甲', nameVi: 'Phá Giáp', desc: '利芒破重铠,无往不利', descVi: 'Mũi nhọn xuyên giáp nặng, đánh đâu thắng đó' },
      { name: '贯日', nameVi: 'Quán Nhật', desc: '星力炽烈,锋锐难当', descVi: 'Lực sao rực rỡ, độ sắc bén khôn cùng' }
    ]
  },
  {
    id: 'x_fenxiao_yan',
    name: '焚霄赤炎煞',
    nameVi: 'Phần Tiêu Xích Viêm Sát',
    type: 'secret',
    quality: 'fine',
    minRealm: 1,
    element: 'fire',
    secretCategory: 'attack',
    minComprehension: 42,
    desc: '引地火煞气附着于掌劲,烈焰焚霄,灼敌肉身',
    descVi: 'Dẫn địa hỏa sát khí vào chưởng kình, ngọn lửa thiêu mây, thiêu đốt thân thể địch',
    baseMods: { attackPct: 0.1, damageBonus: 0.04 },
    perLevelMods: { attackPct: 0.025, damageBonus: 0.015 },
    branches: [
      { name: '焚骨', nameVi: 'Phần Cốt', desc: '烈火蚀髓,伤敌极深', descVi: 'Lửa mạnh gặm tủy, làm tổn thương cực sâu' },
      { name: '赤煞', nameVi: 'Xích Sát', desc: '煞气冲天,出手更狠', descVi: 'Sát khí ngút trời, ra tay càng tàn khốc' }
    ]
  },
  {
    id: 'x_liekong_zhao',
    name: '裂空幽冥爪',
    nameVi: 'Liệt Không U Minh Trảo',
    type: 'secret',
    quality: 'excellent',
    minRealm: 1,
    element: 'dark',
    secretCategory: 'attack',
    minComprehension: 45,
    desc: '双爪淬幽冥厉煞,爪裂长空,留下不灭死气',
    descVi: 'Đôi vuốt tẩm u minh lệ sát, vuốt xé không trung để lại tử khí bất diệt',
    baseMods: { critDamage: 0.15, critRate: 0.04 },
    perLevelMods: { critDamage: 0.04, critRate: 0.012 },
    branches: [
      { name: '撕空', nameVi: 'Tê Không', desc: '爪痕裂界,敌甲立碎', descVi: 'Vết cào xé rách, giáp địch lập tức vỡ vụn' },
      { name: '噬魂', nameVi: 'Phệ Hồn', desc: '死气蚀魂,重创根本', descVi: 'Tử khí gặm hồn, tổn hại nặng nề căn bản' }
    ]
  },
  {
    id: 'x_hanfeng_mang',
    name: '极冰刺骨芒',
    nameVi: 'Cực Băng Thứ Cốt Mang',
    type: 'secret',
    quality: 'excellent',
    minRealm: 2,
    element: 'ice',
    secretCategory: 'attack',
    minComprehension: 48,
    desc: '凝九地玄冰为无影毫芒,透骨而入,冰封生机',
    descVi: 'Ngưng huyền băng chín tầng đất thành hào quang vô ảnh, thấu tận xương tủy đóng băng sinh cơ',
    baseMods: { attackPct: 0.12, critRate: 0.04 },
    perLevelMods: { attackPct: 0.028, critRate: 0.012 },
    branches: [
      { name: '透骨', nameVi: 'Thấu Cốt', desc: '寒芒入体,经脉皆冻', descVi: 'Hàn mang vào thân, kinh mạch đều đóng băng' },
      { name: '凝冰', nameVi: 'Ngưng Băng', desc: '冰华环绕,攻势严正', descVi: 'Băng hoa quấn quanh, thế công nghiêm cẩn' }
    ]
  },
  {
    id: 'x_leiting_pi',
    name: '玄雷诛魔印',
    nameVi: 'Huyền Lôi Tru Ma Ấn',
    type: 'secret',
    quality: 'spirit',
    minRealm: 3,
    element: 'thunder',
    secretCategory: 'attack',
    minComprehension: 52,
    desc: '结天雷法印当空轰落,破邪诛魔,雷威荡世',
    descVi: 'Kết lôi ấn giữa trời giáng xuống, phá tà diệt ma, sấm sét quét sạch cõi đời',
    baseMods: { critRate: 0.06, damageBonus: 0.06 },
    perLevelMods: { critRate: 0.015, damageBonus: 0.02 },
    branches: [
      { name: '诛邪', nameVi: 'Tru Tà', desc: '正气破魔,万煞不存', descVi: 'Chính khí diệt ma, muôn sát tiêu tan' },
      { name: '雷印', nameVi: 'Lôi Ấn', desc: '雷光崩灭,声震八荒', descVi: 'Ánh lôi tan biến, tiếng vang bát hoang' }
    ]
  },
  {
    id: 'x_wanjian_gui',
    name: '万剑朝宗真诀',
    nameVi: 'Vạn Kiếm Triều Tông Chân Quyết',
    type: 'secret',
    quality: 'spirit',
    minRealm: 4,
    element: 'metal',
    secretCategory: 'attack',
    minComprehension: 56,
    desc: '御千百剑芒如群星朝宗,剑雨滂沱,无可逃遁',
    descVi: 'Điều khiển ngàn vạn kiếm mang như vạn tinh quy tông, mưa kiếm dạt dào khó bề lẩn trốn',
    baseMods: { attackPct: 0.15, critRate: 0.05 },
    perLevelMods: { attackPct: 0.035, critRate: 0.015 },
    branches: [
      { name: '剑阵', nameVi: 'Kiếm Trận', desc: '漫天飞刃,绞杀群敌', descVi: 'Rợp trời lưỡi kiếm, giảo sát quân thù' },
      { name: '朝宗', nameVi: 'Triều Tông', desc: '剑皇立世,万兵俯首', descVi: 'Kiếm hoàng đứng sững, vạn binh cúi đầu' }
    ]
  },
  {
    id: 'x_chiyan_beng',
    name: '天炎崩山煞',
    nameVi: 'Thiên Viêm Băng Sơn Sát',
    type: 'secret',
    quality: 'profound',
    minRealm: 5,
    element: 'fire',
    secretCategory: 'attack',
    minComprehension: 60,
    desc: '汇聚纯阳神火如火山迸发,一击摧山倒岳',
    descVi: 'Gom tụ thần hỏa thuần dương như núi lửa bùng nổ, một kích lở đất nghiêng non',
    baseMods: { attackPct: 0.18, critDamage: 0.2 },
    perLevelMods: { attackPct: 0.04, critDamage: 0.05 },
    branches: [
      { name: '崩山', nameVi: 'Băng Sơn', desc: '山崩地裂,力贯万钧', descVi: 'Núi lở đất nứt, lực quán vạn cân' },
      { name: '炎爆', nameVi: 'Viêm Bạo', desc: '火浪滔天,无物能当', descVi: 'Sóng lửa ngút trời, không vật nào cản nổi' }
    ]
  },
  {
    id: 'x_duanhun_mang',
    name: '幽冥断魂血芒',
    nameVi: 'U Minh Đoạn Hồn Huyết Mang',
    type: 'secret',
    quality: 'heaven',
    minRealm: 6,
    element: 'dark',
    secretCategory: 'attack',
    minComprehension: 64,
    desc: '炼九幽怨血为索命阴芒,无视甲胄,专伤元神',
    descVi: 'Luyện máu oán hận chín tầng u minh thành huyết mang đoạt mạng, không màng giáp trụ chỉ đả thương nguyên thần',
    baseMods: { critRate: 0.07, lowHpDamage: 0.25 },
    perLevelMods: { critRate: 0.018, lowHpDamage: 0.06 },
    branches: [
      { name: '断魂', nameVi: 'Đoạn Hồn', desc: '伤损神魄,战力骤减', descVi: 'Tổn thương thần phách, chiến lực giảm sút' },
      { name: '饮血', nameVi: 'Ẩm Huyết', desc: '残血狂暴,越战越悍', descVi: 'Máu cạn càng cuồng, càng đánh càng hăng' }
    ]
  },
  {
    id: 'x_gangfeng_xiao',
    name: '九天罡风破岳斩',
    nameVi: 'Cửu Thiên Cương Phong Phá Nhạc Trảm',
    type: 'secret',
    quality: 'heaven',
    minRealm: 7,
    element: 'wind',
    secretCategory: 'attack',
    minComprehension: 68,
    desc: '驾驭极天罡风凝为百丈风刃,斩碎千仞群岳',
    descVi: 'Ngự cương phong chín tầng mây ngưng thành phong nhận trăm trượng, chém nát ngàn ngọn núi cao',
    baseMods: { attackPct: 0.22, critRate: 0.08 },
    perLevelMods: { attackPct: 0.05, critRate: 0.02 },
    branches: [
      { name: '风斩', nameVi: 'Phong Trảm', desc: '刀刃破空,锋利绝伦', descVi: 'Đao sắc phá không, bén ngót tuyệt luân' },
      { name: '罡煞', nameVi: 'Cương Sát', desc: '九天狂流,震散顽守', descVi: 'Cuồng phong chín tầng, đánh tan phòng thủ' }
    ]
  },
  {
    id: 'x_fentian_shen',
    name: '八荒焚天真煞',
    nameVi: 'Bát Hoang Phần Thiên Chân Sát',
    type: 'secret',
    quality: 'heaven',
    minRealm: 8,
    element: 'fire',
    secretCategory: 'attack',
    minComprehension: 72,
    desc: '引动八荒神火降世,天地皆成赤红火海',
    descVi: 'Dẫn động thần hỏa tám cõi giáng trần, đất trời hóa biển lửa đỏ rực',
    baseMods: { attackPct: 0.25, damageBonus: 0.12 },
    perLevelMods: { attackPct: 0.055, damageBonus: 0.03 },
    branches: [
      { name: '焚天', nameVi: 'Phần Thiên', desc: '真火冲霄,八荒辟易', descVi: 'Lửa thiêng ngút trời, tám cõi dạt ra' },
      { name: '天烬', nameVi: 'Thiên Hẫn', desc: '万物皆烬,威慑四海', descVi: 'Vạn vật thành tro, uy nhiếp bốn biển' }
    ]
  },

  // Tiên giới (9-13) - Cần mark: '仙', '云', '玉', '瑶', '星', '虚', '太', '罗', '雷'
  {
    id: 'x_xianjian_po',
    name: '九天仙光破虚剑',
    nameVi: 'Cửu Thiên Tiên Quang Phá Hư Kiếm',
    type: 'secret',
    quality: 'immortal',
    minRealm: 9,
    element: 'metal',
    secretCategory: 'attack',
    minComprehension: 75,
    desc: '纳九重仙界太虚天光入剑,一剑斩落,虚空粉碎',
    descVi: 'Gom ánh sáng thái hư chín tầng tiên giới vào kiếm, chém xuống một kiếm hư không vỡ vụn',
    baseMods: { attackPct: 0.28, critRate: 0.09 },
    perLevelMods: { attackPct: 0.06, critRate: 0.022 },
    branches: [
      { name: '破虚', nameVi: 'Phá Hư', desc: '虚空崩碎,诛灭神形', descVi: 'Hư không tan nát, tiêu diệt thần hình' },
      { name: '仙锋', nameVi: 'Tiên Phong', desc: '仙光耀目,避无可避', descVi: 'Ánh tiên chói lọi, không thể né tránh' }
    ]
  },
  {
    id: 'x_yaochi_sha',
    name: '瑶池紫华荡魔芒',
    nameVi: 'Dao Trì Tử Hoa Đãng Ma Mang',
    type: 'secret',
    quality: 'immortal',
    minRealm: 10,
    element: 'water',
    secretCategory: 'attack',
    minComprehension: 78,
    desc: '瑶台仙华凝为紫光灵芒,涤荡万界阴邪之气',
    descVi: 'Tiên hoa Dao Trì ngưng tụ thành ánh tím sáng rực, gột rửa u uất âm tà vạn cõi',
    baseMods: { attackPct: 0.3, damageBonus: 0.14 },
    perLevelMods: { attackPct: 0.065, damageBonus: 0.035 },
    branches: [
      { name: '荡魔', nameVi: 'Đãng Ma', desc: '紫华诛凶,魔煞自灭', descVi: 'Ánh tím diệt hung, tà ma tự tắt' },
      { name: '瑶光', nameVi: 'Dao Quang', desc: '仙池浩渺,神力不绝', descVi: 'Hồ tiên bao la, thần lực không dứt' }
    ]
  },
  {
    id: 'x_xianlei_zhu',
    name: '太乙仙雷寂灭劫',
    nameVi: 'Thái Ất Tiên Lôi Tịch Diệt Kiếp',
    type: 'secret',
    quality: 'immortal',
    minRealm: 11,
    element: 'thunder',
    secretCategory: 'attack',
    minComprehension: 80,
    desc: '召太乙清微神雷化为天劫降世,神形俱灭',
    descVi: 'Gọi thần lôi Thái Ất hóa thành thiên kiếp giáng thế, thần hình câu diệt',
    baseMods: { critDamage: 0.35, critRate: 0.1 },
    perLevelMods: { critDamage: 0.08, critRate: 0.025 },
    branches: [
      { name: '仙劫', nameVi: 'Tiên Kiếp', desc: '天罚加身,无从抵挡', descVi: 'Hình phạt trời giáng, không thể ngăn đỡ' },
      { name: '太乙', nameVi: 'Thái Ất', desc: '清微神霄,雷霆万道', descVi: 'Thần tiêu thanh khiết, ngàn vạn lôi đình' }
    ]
  },
  {
    id: 'x_xingchen_po',
    name: '大罗星辰陨灭印',
    nameVi: 'Đại La Tinh Thần Vẫn Diệt Ấn',
    type: 'secret',
    quality: 'immortal',
    minRealm: 12,
    secretCategory: 'attack',
    minComprehension: 82,
    desc: '拘大罗天外陨星凝作神印砸下,天塌地陷',
    descVi: 'Bắt sao băng ngoài cõi Đại La đúc thành thần ấn nện xuống, trời sụp đất lún',
    baseMods: { attackPct: 0.34, critDamage: 0.38 },
    perLevelMods: { attackPct: 0.075, critDamage: 0.09 },
    branches: [
      { name: '星陨', nameVi: 'Tinh Vẫn', desc: '星坠如雨,崩灭万物', descVi: 'Sao sa như mưa, hủy diệt vạn vật' },
      { name: '大罗', nameVi: 'Đại La', desc: '天罗威临,不可违逆', descVi: 'Thiên la giáng thế, không thể trái lời' }
    ]
  },
  {
    id: 'x_yuxu_shen',
    name: '玉虚太玄裂界芒',
    nameVi: 'Ngọc Hư Thái Huyền Liệt Giới Mang',
    type: 'secret',
    quality: 'immortal',
    minRealm: 13,
    element: 'light',
    secretCategory: 'attack',
    minComprehension: 85,
    desc: '开天玉虚圣光破界而出,一芒洞穿诸天世界',
    descVi: 'Ánh sáng thánh thiện Ngọc Hư khai thiên phá giới xuất thế, một tia xuyên thủng chư thiên thế giới',
    baseMods: { attackPct: 0.36, damageBonus: 0.18 },
    perLevelMods: { attackPct: 0.08, damageBonus: 0.045 },
    branches: [
      { name: '裂界', nameVi: 'Liệt Giới', desc: '光贯诸天,破界灭敌', descVi: 'Ánh sáng thông chư thiên, phá giới diệt địch' },
      { name: '玉芒', nameVi: 'Ngọc Mang', desc: '玄光护体,出手极烈', descVi: 'Huyền quang hộ thân, ra chiêu cực liệt' }
    ]
  },

  // Thần giới (14-17) - Cần mark: '神', '帝', '王', '冕', '诏', '法', '则'
  {
    id: 'x_shendi_mie',
    name: '神帝敕天诛仙诀',
    nameVi: 'Thần Đế Sắc Thiên Tru Tiên Quyết',
    type: 'secret',
    quality: 'divine',
    minRealm: 14,
    secretCategory: 'attack',
    minComprehension: 88,
    desc: '以神帝至尊法令敕令天道,剑落诛仙屠神',
    descVi: 'Dùng pháp lệnh tối cao của Thần Đế sai khiến thiên đạo, kiếm hạ tru tiên đồ thần',
    baseMods: { attackPct: 0.38, damageBonus: 0.2 },
    perLevelMods: { attackPct: 0.085, damageBonus: 0.05 },
    branches: [
      { name: '诛仙', nameVi: 'Tru Tiên', desc: '神剑所指,仙魔尽灭', descVi: 'Thần kiếm chỉ nơi đâu, tiên ma tận diệt' },
      { name: '敕令', nameVi: 'Sắc Lệnh', desc: '代天行罚,无可逃脱', descVi: 'Thay trời hành phạt, khôn đường trốn chạy' }
    ]
  },
  {
    id: 'x_shenwang_chong',
    name: '神王破日贯天矛',
    nameVi: 'Thần Vương Phá Nhật Quán Thiên Mâu',
    type: 'secret',
    quality: 'divine',
    minRealm: 15,
    element: 'metal',
    secretCategory: 'attack',
    minComprehension: 90,
    desc: '凝万界金精铸就神王战矛,掷出破灭日月',
    descVi: 'Ngưng tụ kim tinh vạn cõi rèn chiến mâu Thần Vương, ném ra bắn rụng nhật nguyệt',
    baseMods: { attackPct: 0.4, critRate: 0.11 },
    perLevelMods: { attackPct: 0.09, critRate: 0.028 },
    branches: [
      { name: '破日', nameVi: 'Phá Nhật', desc: '神矛贯日,万物破碎', descVi: 'Thần mâu xuyên mặt trời, vạn vật nát tan' },
      { name: '神威', nameVi: 'Thần Uy', desc: '战王凌世,锋芒无上', descVi: 'Chiến vương ngự thế, phong mang vô song' }
    ]
  },
  {
    id: 'x_faze_leiting',
    name: '法则劫雷开天破',
    nameVi: 'Pháp Tắc Kiếp Lôi Khai Thiên Phá',
    type: 'secret',
    quality: 'divine',
    minRealm: 16,
    element: 'thunder',
    secretCategory: 'attack',
    minComprehension: 92,
    desc: '驾驭宇宙毁灭法则神雷,一击雷破万宇',
    descVi: 'Điều khiển thần lôi của quy luật hủy diệt vũ trụ, một đòn lôi đình phá tan muôn cõi',
    baseMods: { critRate: 0.12, critDamage: 0.4 },
    perLevelMods: { critRate: 0.03, critDamage: 0.1 },
    branches: [
      { name: '劫雷', nameVi: 'Kiếp Lôi', desc: '毁灭劫雷,诸天难逃', descVi: 'Kiếp lôi hủy diệt, chư thiên khôn tránh' },
      { name: '法则', nameVi: 'Pháp Tắc', desc: '大道权柄,诛灭无形', descVi: 'Quyền bính đại đạo, tru diệt vô hình' }
    ]
  },
  {
    id: 'x_shenmian_fen',
    name: '神冕万道寂灭杀',
    nameVi: 'Thần Mão Vạn Đạo Tịch Diệt Sát',
    type: 'secret',
    quality: 'divine',
    minRealm: 17,
    secretCategory: 'attack',
    minComprehension: 94,
    desc: '聚神冕冠顶之至高神力,引动万道齐齐寂灭',
    descVi: 'Tụ thần lực tối cao trên vương miện thần, khiến muôn vàn đạo trời đồng loạt tịch diệt',
    baseMods: { attackPct: 0.44, damageBonus: 0.24 },
    perLevelMods: { attackPct: 0.1, damageBonus: 0.06 },
    branches: [
      { name: '寂灭', nameVi: 'Tịch Diệt', desc: '归于死寂,神佛难留', descVi: 'Quy về chết lặng, thần phật khôn còn' },
      { name: '神冕', nameVi: 'Thần Mão', desc: '帝道压境,所向披靡', descVi: 'Đế đạo ép cảnh, quét sạch quân thù' }
    ]
  },

  // Hỗn Độn (18-20) - Cần mark: '混', '沌', '鸿', '蒙', '本', '源', '真', '灵', '无', '极', '开', '道', '界', '神', '魔'
  {
    id: 'x_hongmeng_po',
    name: '鸿蒙开天辟地斩',
    nameVi: 'Hồng Mông Khai Thiên Tích Địa Trảm',
    type: 'secret',
    quality: 'divine',
    minRealm: 18,
    element: 'chaos',
    secretCategory: 'attack',
    minComprehension: 96,
    desc: '参悟鸿蒙最初之开辟真意,劈开混沌造化大千',
    descVi: 'Lĩnh ngộ ý niệm mở cõi đầu tiên của Hồng Mông, xẻ đôi hỗn độn tạo dựng đại thiên',
    baseMods: { attackPct: 0.46, critRate: 0.14 },
    perLevelMods: { attackPct: 0.105, critRate: 0.035 },
    branches: [
      { name: '开辟', nameVi: 'Khai Tích', desc: '神斧开界,斩落万星', descVi: 'Rìu thần mở cõi, chém rụng vạn sao' },
      { name: '鸿蒙', nameVi: 'Hồng Mông', desc: '始初真气,破绝万法', descVi: 'Khí chân nguyên thủy, phá sạch vạn pháp' }
    ]
  },
  {
    id: 'x_hundun_shenmo',
    name: '混沌神魔灭世击',
    nameVi: 'Hỗn Độn Thần Ma Diệt Thế Kích',
    type: 'secret',
    quality: 'divine',
    minRealm: 19,
    element: 'chaos',
    secretCategory: 'attack',
    minComprehension: 98,
    desc: '显化混沌神魔真身全力一击,诸界崩坏沦为归墟',
    descVi: 'Hiện hóa chân thân thần ma Hỗn Độn tung đòn toàn lực, các cõi sụp đổ biến thành cõi chết',
    baseMods: { attackPct: 0.48, critDamage: 0.45 },
    perLevelMods: { attackPct: 0.11, critDamage: 0.12 },
    branches: [
      { name: '灭世', nameVi: 'Diệt Thế', desc: '天地破散,重归混沌', descVi: 'Đất trời tan biến, trở lại hỗn độn' },
      { name: '神魔', nameVi: 'Thần Ma', desc: '神魔之躯,横压诸界', descVi: 'Thân hình thần ma, đè bẹp các cõi' }
    ]
  },
  {
    id: 'x_wuji_daoyi',
    name: '无极道源寂灭神枪',
    nameVi: 'Vô Cực Đạo Nguyên Tịch Diệt Thần Thương',
    type: 'secret',
    quality: 'divine',
    minRealm: 20,
    element: 'chaos',
    secretCategory: 'attack',
    minComprehension: 100,
    desc: '道祖以无极本源凝成寂灭神枪,一枪既出因果皆断',
    descVi: 'Đạo Tổ dùng bản nguyên Vô Cực ngưng thành ngọn thương tịch diệt, một thương đâm ra nhân quả đều dứt',
    baseMods: { attackPct: 0.36, damageBonus: 0.18 },
    perLevelMods: { attackPct: 0.08, damageBonus: 0.04 },
    branches: [
      { name: '绝因', nameVi: 'Tuyệt Nhân', desc: '断尽因果,万劫不复', descVi: 'Dứt sạch nhân quả, vạn kiếp khôn về' },
      { name: '道源', nameVi: 'Đạo Nguyên', desc: '本源同化,万兵成空', descVi: 'Bản nguyên đồng hóa, vạn binh thành không' }
    ]
  },

  // ==========================================
  // NHÓM 2: DEFENSE (18 Bí thuật Phòng ngự / Hộ thể / Hóa kình / Hộ giáp)
  // ==========================================
  // Phàm giới (0-8)
  {
    id: 'x_xuanwu_jia',
    name: '玄武磐石神甲',
    nameVi: 'Huyền Vũ Bàn Thạch Thần Giáp',
    type: 'secret',
    quality: 'fine',
    minRealm: 0,
    element: 'earth',
    secretCategory: 'defense',
    desc: '观想玄武圣兽负山之姿,凝聚厚实重甲御敌',
    descVi: 'Quán tưởng dáng dấp thánh thú Huyền Vũ cõng núi, ngưng tụ trọng giáp dày dặn phòng ngự',
    baseMods: { defensePct: 0.08, damageReduction: 0.04 },
    perLevelMods: { defensePct: 0.02, damageReduction: 0.012 },
    branches: [
      { name: '负山', nameVi: 'Phụ Sơn', desc: '重甲如岳,岿然不动', descVi: 'Giáp nặng như núi, sừng sững không lay' },
      { name: '磐甲', nameVi: 'Bàn Giáp', desc: '土煞坚实,硬逾玄铁', descVi: 'Thổ sát kiên cố, cứng hơn sắt thép' }
    ]
  },
  {
    id: 'x_qingmu_bi',
    name: '青木回生圣体',
    nameVi: 'Thanh Mộc Hồi Sinh Thánh Thể',
    type: 'secret',
    quality: 'excellent',
    minRealm: 1,
    element: 'wood',
    secretCategory: 'defense',
    desc: '纳青木精粹于四肢百骸,重创之下亦能瞬息复原',
    descVi: 'Nạp tinh túy gỗ xanh vào tứ chi trăm đốt, dẫu trọng thương cũng có thể hồi phục trong nháy mắt',
    baseMods: { maxHpPct: 0.1, lowHpReduction: 0.1 },
    perLevelMods: { maxHpPct: 0.025, lowHpReduction: 0.03 },
    branches: [
      { name: '回生', nameVi: 'Hồi Sinh', desc: '枯木逢春,生机如泉', descVi: 'Cây khô gặp xuân, sinh cơ tựa suối' },
      { name: '木甲', nameVi: 'Mộc Giáp', desc: '坚韧不折,御御强伤', descVi: 'Dẻo dai không gãy, ngăn ngừa trọng thương' }
    ]
  },
  {
    id: 'x_liushui_hua',
    name: '天河化劲真罡',
    nameVi: 'Thiên Hà Hóa Kình Chân Cương',
    type: 'secret',
    quality: 'excellent',
    minRealm: 2,
    element: 'water',
    secretCategory: 'defense',
    desc: '如天河弱水深不见底,敌劲击来皆随柔波化解',
    descVi: 'Như nước sông trời không đáy khôn lường, kình lực kẻ địch ập tới đều theo sóng nhu hòa giải',
    baseMods: { damageReduction: 0.06, counterRate: 0.06 },
    perLevelMods: { damageReduction: 0.015, counterRate: 0.018 },
    branches: [
      { name: '柔化', nameVi: 'Nhu Hóa', desc: '以柔克刚,反劲伤敌', descVi: 'Lấy mềm chế cứng, dội ngược kình lực' },
      { name: '天波', nameVi: 'Thiên Ba', desc: '天河护体,水波荡漾', descVi: 'Sông trời hộ thể, sóng nước dập dờn' }
    ]
  },
  {
    id: 'x_chiyang_dun',
    name: '赤阳烈火神钟',
    nameVi: 'Xích Dương Liệt Hỏa Thần Chung',
    type: 'secret',
    quality: 'spirit',
    minRealm: 3,
    element: 'fire',
    secretCategory: 'defense',
    desc: '烈焰化为纯阳神钟倒扣周身,触之者被烈火反噬',
    descVi: 'Lửa mạnh hóa thành chuông thần thuần dương chụp quanh người, kẻ chạm vào liền bị phản phệ',
    baseMods: { defensePct: 0.12, counterDamage: 0.2 },
    perLevelMods: { defensePct: 0.03, counterDamage: 0.06 },
    branches: [
      { name: '金钟', nameVi: 'Kim Chung', desc: '神钟长鸣,御力卓绝', descVi: 'Chuông thần vang rền, phòng ngự trác tuyệt' },
      { name: '反炎', nameVi: 'Phản Viêm', desc: '烈火灼敌,伤我者死', descVi: 'Lửa mạnh đốt địch, kẻ hại ta phải trả giá' }
    ]
  },
  {
    id: 'x_hunyuan_gang',
    name: '混元无极金刚体',
    nameVi: 'Hỗn Nguyên Vô Cực Kim Cương Thể',
    type: 'secret',
    quality: 'profound',
    minRealm: 4,
    secretCategory: 'defense',
    desc: '周身百穴凝结混元金刚之膜,刀枪难入水火不侵',
    descVi: 'Trăm huyệt toàn thân ngưng màng kim cương hỗn nguyên, đao thương khó lọt nước lửa chẳng sờn',
    baseMods: { defensePct: 0.15, damageReduction: 0.08 },
    perLevelMods: { defensePct: 0.035, damageReduction: 0.02 },
    branches: [
      { name: '金刚', nameVi: 'Kim Cương', desc: '肉身如铁,万刃难折', descVi: 'Thân xác như sắt, vạn đao khôn cong' },
      { name: '混元', nameVi: 'Hỗn Nguyên', desc: '五行相护,百灾不磨', descVi: 'Ngũ hành bảo vệ, trăm kiếp chẳng sờn' }
    ]
  },
  {
    id: 'x_youming_dun',
    name: '幽冥化骨煞衣',
    nameVi: 'U Minh Hóa Cốt Sát Y',
    type: 'secret',
    quality: 'profound',
    minRealm: 5,
    element: 'dark',
    secretCategory: 'defense',
    desc: '聚九幽阴煞凝作轻薄黑纱,来攻之兵刃皆被腐蚀',
    descVi: 'Gom âm sát chín cõi u minh dệt lớp áo sa đen mỏng manh, binh khí chém tới đều bị ăn mòn rỉ sét',
    baseMods: { lowHpReduction: 0.2, damageReduction: 0.09 },
    perLevelMods: { lowHpReduction: 0.05, damageReduction: 0.022 },
    branches: [
      { name: '煞衣', nameVi: 'Sát Y', desc: '阴煞蔽体,绝境逢安', descVi: 'Âm sát che người, bước vào đường cùng vẫn bình an' },
      { name: '化骨', nameVi: 'Hóa Cốt', desc: '腐劲伤骨,折敌锋芒', descVi: 'Ăn mòn gãy xương, bẻ gãy mũi nhọn của địch' }
    ]
  },
  {
    id: 'x_dahuang_bi',
    name: '大荒神山镇煞体',
    nameVi: 'Đại Hoang Thần Sơn Trấn Sát Thể',
    type: 'secret',
    quality: 'heaven',
    minRealm: 6,
    element: 'earth',
    secretCategory: 'defense',
    desc: '身化远古蛮荒天柱神岳,稳如泰山任凭风吹浪打',
    descVi: 'Thân hóa núi trụ trời thời thượng cổ hoang dã, vững như Thái Sơn mặc cho gió quất sóng dập',
    baseMods: { maxHpPct: 0.25, defensePct: 0.18 },
    perLevelMods: { maxHpPct: 0.06, defensePct: 0.045 },
    branches: [
      { name: '镇岳', nameVi: 'Trấn Nhạc', desc: '神岳当关,万力不侵', descVi: 'Thần sơn trấn ải, muôn vạn sức mạnh không thể phạm' },
      { name: '古蛮', nameVi: 'Cổ Man', desc: '气血雄沉,命元悠远', descVi: 'Khí huyết hùng dũng, mệnh căn dài lâu' }
    ]
  },
  {
    id: 'x_wanfa_gui',
    name: '万法不侵玄冥罩',
    nameVi: 'Vạn Pháp Bất Xâm Huyền Minh Tráo',
    type: 'secret',
    quality: 'heaven',
    minRealm: 7,
    secretCategory: 'defense',
    desc: '头顶升起玄冥神气光罩,隔绝诸界五行术法伤害',
    descVi: 'Đầu đội lồng khí thần Huyền Minh tỏa sáng, ngăn cách mọi đòn đánh pháp thuật ngũ hành các cõi',
    baseMods: { damageReduction: 0.14, lowHpReduction: 0.22 },
    perLevelMods: { damageReduction: 0.035, lowHpReduction: 0.05 },
    branches: [
      { name: '不侵', nameVi: 'Bất Xâm', desc: '五行难伤,从容破法', descVi: 'Ngũ hành khó tổn thương, thong thả phá pháp' },
      { name: '玄冥', nameVi: 'Huyền Minh', desc: '神光如幕,守御固本', descVi: 'Ánh thần như rèm, củng cố phòng ngự' }
    ]
  },
  {
    id: 'x_jiuxiao_leijia',
    name: '紫霄神雷护法铠',
    nameVi: 'Tử Tiêu Thần Lôi Hộ Pháp Khải',
    type: 'secret',
    quality: 'heaven',
    minRealm: 8,
    element: 'thunder',
    secretCategory: 'defense',
    desc: '天雷聚为周身奔腾战甲,受创之时神雷狂轰袭击者',
    descVi: 'Thiên lôi ngưng tụ thành giáp chiến rực lửa quanh người, khi chịu đòn thì sấm sét lập tức dội thẳng kẻ tấn công',
    baseMods: { defensePct: 0.22, counterRate: 0.12, counterDamage: 0.3 },
    perLevelMods: { defensePct: 0.05, counterRate: 0.03, counterDamage: 0.07 },
    branches: [
      { name: '雷甲', nameVi: 'Lôi Giáp', desc: '奔雷护体,坚固绝伦', descVi: 'Sấm lôi bảo vệ, bền chắc tuyệt luân' },
      { name: '雷反', nameVi: 'Lôi Phản', desc: '触者遭劫,雷殛顽凶', descVi: 'Chạm vào gặp kiếp, sét đánh kẻ hung' }
    ]
  },

  // Tiên giới (9-13) - Cần mark: '仙', '云', '玉', '瑶', '星', '虚', '太', '罗', '雷'
  {
    id: 'x_xianluo_zhang',
    name: '仙罗万劫不灭身',
    nameVi: 'Tiên La Vạn Kiếp Bất Diệt Thân',
    type: 'secret',
    quality: 'immortal',
    minRealm: 9,
    secretCategory: 'defense',
    desc: '大罗仙光重塑仙体,任凭天劫地难临身亦不磨灭',
    descVi: 'Ánh sáng tiên Đại La tái tạo thân tiên, mặc kệ kiếp trời nạn đất ập vào thân cũng không tiêu biến',
    baseMods: { defensePct: 0.25, maxHpPct: 0.25 },
    perLevelMods: { defensePct: 0.055, maxHpPct: 0.055 },
    branches: [
      { name: '仙身', nameVi: 'Tiên Thân', desc: '超脱劫数,永享清平', descVi: 'Vượt ngoài kiếp số, hưởng cõi an nhàn' },
      { name: '罗光', nameVi: 'La Quang', desc: '大罗仙障,神兵难损', descVi: 'Tấm khiên Đại La, thần binh khó gãy' }
    ]
  },
  {
    id: 'x_yaochi_lianjia',
    name: '瑶池仙玉护魄铠',
    nameVi: 'Dao Trì Tiên Ngọc Hộ Phách Khải',
    type: 'secret',
    quality: 'immortal',
    minRealm: 10,
    element: 'water',
    secretCategory: 'defense',
    desc: '瑶池万年温玉所化宝铠,贴身护住三魂七魄',
    descVi: 'Giáp báu kết từ ngọc ấm vạn năm Dao Trì, kề sát bảo vệ ba hồn bảy phách',
    baseMods: { damageReduction: 0.16, maxHpPct: 0.28 },
    perLevelMods: { damageReduction: 0.04, maxHpPct: 0.06 },
    branches: [
      { name: '玉铠', nameVi: 'Ngọc Khải', desc: '温玉化甲,从容御劫', descVi: 'Ngọc ấm hóa giáp, thong dong đỡ kiếp' },
      { name: '护魄', nameVi: 'Hộ Phách', desc: '神魄无瑕,安如泰岳', descVi: 'Thần phách vẹn toàn, vững như núi cao' }
    ]
  },
  {
    id: 'x_taixu_guiyuan',
    name: '太虚玄罡辟劫光',
    nameVi: 'Thái Hư Huyền Cương Tịch Kiếp Quang',
    type: 'secret',
    quality: 'immortal',
    minRealm: 11,
    secretCategory: 'defense',
    desc: '以太虚无极罡气消弭万千劫数,万物触之皆化无形',
    descVi: 'Dùng thái hư vô cực cương khí tiêu tan vạn nghìn tai kiếp, vật chạm vào đều hóa vô hình',
    baseMods: { damageReduction: 0.18, lowHpReduction: 0.25 },
    perLevelMods: { damageReduction: 0.045, lowHpReduction: 0.06 },
    branches: [
      { name: '辟劫', nameVi: 'Tịch Kiếp', desc: '劫难消散,身如长风', descVi: 'Tai kiếp tan biến, thân tựa gió dài' },
      { name: '太虚', nameVi: 'Thái Hư', desc: '虚空同体,无懈可乘', descVi: 'Cùng thể hư không, chẳng hở sơ hở' }
    ]
  },
  {
    id: 'x_xingyun_zhen',
    name: '星云万象护体罡',
    nameVi: 'Tinh Vân Vạn Tượng Hộ Thể Cương',
    type: 'secret',
    quality: 'immortal',
    minRealm: 12,
    secretCategory: 'defense',
    desc: '纳亿万星云环抱法体,如同身负诸天银河',
    descVi: 'Gom hàng ức mây sao ôm trọn pháp thể, tựa như mang trên mình dải ngân hà chư thiên',
    baseMods: { defensePct: 0.28, damageReduction: 0.2 },
    perLevelMods: { defensePct: 0.06, damageReduction: 0.05 },
    branches: [
      { name: '星罡', nameVi: 'Tinh Cương', desc: '银河为甲,坚不可破', descVi: 'Ngân hà làm giáp, kiên cố khôn phá' },
      { name: '星云', nameVi: 'Tinh Vân', desc: '星芒化盾,抵挡杀伐', descVi: 'Ánh sao làm khiên, cản đòn sát phạt' }
    ]
  },

  // Thần giới (14-17) - Cần mark: '神', '帝', '王', '冕', '诏', '法', '则'
  {
    id: 'x_shendi_bahuangjia',
    name: '神帝不磨至尊铠',
    nameVi: 'Thần Đế Bất Ma Chí Tôn Khải',
    type: 'secret',
    quality: 'divine',
    minRealm: 14,
    secretCategory: 'defense',
    desc: '凝聚上古神帝之皇道帝气,成就永恒不磨之神铠',
    descVi: 'Ngưng tụ hoàng đạo đế khí của Thần Đế thượng cổ, thành tựu giáp thần vĩnh hằng không hoại',
    baseMods: { defensePct: 0.32, maxHpPct: 0.32 },
    perLevelMods: { defensePct: 0.07, maxHpPct: 0.07 },
    branches: [
      { name: '至尊', nameVi: 'Chí Tôn', desc: '帝躯至圣,万神臣服', descVi: 'Thân đế chí thánh, muôn thần cúi đầu' },
      { name: '不磨', nameVi: 'Bất Ma', desc: '不灭真金,硬若天界', descVi: 'Vàng ròng bất diệt, cứng tựa cõi tiên' }
    ]
  },
  {
    id: 'x_faze_wanshou',
    name: '法则固元定界壁',
    nameVi: 'Pháp Tắc Cố Nguyên Định Giới Bích',
    type: 'secret',
    quality: 'divine',
    minRealm: 15,
    secretCategory: 'defense',
    desc: '以宇宙至高防御法则构建神壁,不可逾越',
    descVi: 'Dùng quy luật phòng ngự tối cao của vũ trụ dựng nên bức tường thần, không thể vượt qua',
    baseMods: { damageReduction: 0.22, lowHpReduction: 0.3 },
    perLevelMods: { damageReduction: 0.05, lowHpReduction: 0.07 },
    branches: [
      { name: '界壁', nameVi: 'Giới Bích', desc: '界壁立前,隔断天堑', descVi: 'Vách ngăn dựng trước, chắn ngang rãnh trời' },
      { name: '固元', nameVi: 'Cố Nguyên', desc: '法则加持,命基长固', descVi: 'Quy luật gia trì, gốc mệnh trường tồn' }
    ]
  },
  {
    id: 'x_shenwang_zhenjia',
    name: '神王金冕护命符',
    nameVi: 'Thần Vương Kim Mão Hộ Mệnh Phù',
    type: 'secret',
    quality: 'divine',
    minRealm: 16,
    secretCategory: 'defense',
    desc: '神王顶戴帝冕降下神符,濒死之时瞬间化险为夷',
    descVi: 'Thần Vương đội mũ đế giáng xuống bùa thần, lúc lâm nguy tức khắc chuyển nguy thành an',
    baseMods: { maxHpPct: 0.35, lowHpReduction: 0.35 },
    perLevelMods: { maxHpPct: 0.08, lowHpReduction: 0.08 },
    branches: [
      { name: '金冕', nameVi: 'Kim Mão', desc: '王冕护神,诸煞难侵', descVi: 'Mũ vương hộ thần, mọi sát khó phạm' },
      { name: '护命', nameVi: 'Hộ Mệnh', desc: '真符延寿,化险为夷', descVi: 'Bùa thật kéo dài thọ mệnh, chuyển nguy thành an' }
    ]
  },

  // Hỗn Độn (18-20) - Cần mark: '混', '沌', '鸿', '蒙', '本', '源', '真', '灵', '无', '极', '开', '道', '界', '神', '魔'
  {
    id: 'x_hongmeng_dun',
    name: '鸿蒙混沌本源钟',
    nameVi: 'Hồng Mông Hỗn Độn Bản Nguyên Chung',
    type: 'secret',
    quality: 'divine',
    minRealm: 18,
    element: 'chaos',
    secretCategory: 'defense',
    desc: '以鸿蒙初开之太初之气凝就混沌古钟,万劫不动',
    descVi: 'Dùng khí thái sơ lúc Hồng Mông hé mở kết thành chuông cổ Hỗn Độn, vạn kiếp khôn lay',
    baseMods: { defensePct: 0.36, damageReduction: 0.25 },
    perLevelMods: { defensePct: 0.08, damageReduction: 0.06 },
    branches: [
      { name: '本源', nameVi: 'Bản Nguyên', desc: '钟鸣定界,镇压因果', descVi: 'Chuông vang định giới, trấn áp nhân quả' },
      { name: '混沌', nameVi: 'Hỗn Độn', desc: '万力归虚,万物难伤', descVi: 'Vạn lực về không, vạn vật khó hại' }
    ]
  },
  {
    id: 'x_wuji_daoti',
    name: '无极大乘开天神躯',
    nameVi: 'Vô Cực Đại Thừa Khai Thiên Thần Khu',
    type: 'secret',
    quality: 'divine',
    minRealm: 20,
    element: 'chaos',
    secretCategory: 'defense',
    desc: '与无极大道相合,身即是天地,天地即是身',
    descVi: 'Hòa mình cùng đại đạo Vô Cực, thân chính là đất trời, đất trời chính là thân',
    baseMods: { maxHpPct: 0.35, defensePct: 0.3, damageReduction: 0.12 },
    perLevelMods: { maxHpPct: 0.08, defensePct: 0.07, damageReduction: 0.03 },
    branches: [
      { name: '合道', nameVi: 'Hợp Đạo', desc: '身合无极,与道同休', descVi: 'Thân hợp vô cực, cùng đạo trường tồn' },
      { name: '开天', nameVi: 'Khai Thiên', desc: '神躯无铸,不死不休', descVi: 'Thần thể đúc thành, bất tử bất diệt' }
    ]
  },

  // ==========================================
  // NHÓM 3: SPEED (16 Bí thuật Thân pháp / Tốc độ / Né tránh / Du tẩu)
  // ==========================================
  // Phàm giới (0-8)
  {
    id: 'x_tianfeng_bu',
    name: '天风御虚步',
    nameVi: 'Thiên Phong Ngự Hư Bộ',
    type: 'secret',
    quality: 'fine',
    minRealm: 0,
    element: 'wind',
    secretCategory: 'speed',
    desc: '脚踏清风,凌波微步,身形飘忽若仙',
    descVi: 'Chân đạp gió lành, lướt sóng nhẹ nhàng, thân hình phiêu dật tựa tiên nhân',
    baseMods: { speed: 0.05, dodgeRate: 0.03 },
    perLevelMods: { speed: 0.01, dodgeRate: 0.01 },
    branches: [
      { name: '飘忽', nameVi: 'Phiêu Hốt', desc: '足不沾尘,避害自如', descVi: 'Chân không dính bụi, tránh nạn tự nhiên' },
      { name: '清风', nameVi: 'Thanh Phong', desc: '乘风自适,行动从容', descVi: 'Cưỡi gió thảnh thơi, cử chỉ ung dung' }
    ]
  },
  {
    id: 'x_feiyan_dun',
    name: '飞燕穿云逐日遁',
    nameVi: 'Phi Yến Xuyên Vân Trục Nhật Độn',
    type: 'secret',
    quality: 'fine',
    minRealm: 1,
    secretCategory: 'speed',
    desc: '身若灵燕破空穿云,行动迅捷莫测',
    descVi: 'Thân tựa chim yến vút mây xé gió, hành động mau lẹ khôn lường',
    baseMods: { speed: 0.06, explorationSpeed: 0.08 },
    perLevelMods: { speed: 0.012, explorationSpeed: 0.02 },
    branches: [
      { name: '穿云', nameVi: 'Xuyên Vân', desc: '穿云破雾,极速远行', descVi: 'Xuyên mây rẽ sương, đi xa cực nhanh' },
      { name: '飞燕', nameVi: 'Phi Yến', desc: '轻灵回旋,闪转自如', descVi: 'Nhẹ nhàng xoay chuyển, lượn lách tự tại' }
    ]
  },
  {
    id: 'x_youling_bu',
    name: '幽影幻身瞬息步',
    nameVi: 'U Ảnh Huyễn Thân Thuấn Tức Bộ',
    type: 'secret',
    quality: 'excellent',
    minRealm: 2,
    element: 'dark',
    secretCategory: 'speed',
    desc: '分化九重暗夜残影,真身难测,敌攻尽皆落空',
    descVi: 'Phân hóa chín tầng tàn ảnh đêm tối, chân thân khó dò, đòn địch đều hụt vào hư không',
    baseMods: { dodgeRate: 0.06, speed: 0.06 },
    perLevelMods: { dodgeRate: 0.015, speed: 0.012 },
    branches: [
      { name: '幻影', nameVi: 'Huyễn Ảnh', desc: '残影重重,诱敌落空', descVi: 'Bóng ảo chập chờn, dỗ địch đánh hụt' },
      { name: '夜遁', nameVi: 'Dạ Độn', desc: '遁入夜幕,从容脱身', descVi: 'Ẩn vào màn đêm, thong dong thoát hiểm' }
    ]
  },
  {
    id: 'x_leiting_shan',
    name: '九天雷霆闪空术',
    nameVi: 'Cửu Thiên Lôi Đình Thiểm Không Thuật',
    type: 'secret',
    quality: 'spirit',
    minRealm: 3,
    element: 'thunder',
    secretCategory: 'speed',
    desc: '身化电芒一闪而逝,跨越虚空只在瞬息',
    descVi: 'Thân hóa tia sét vụt lóe rồi tắt, vượt qua hư không chỉ trong một hơi thở',
    baseMods: { speed: 0.08, critRate: 0.04 },
    perLevelMods: { speed: 0.016, critRate: 0.01 },
    branches: [
      { name: '电闪', nameVi: 'Điện Thiểm', desc: '雷光骤至,先夺敌先', descVi: 'Ánh lôi chợt tới, đoạt thế tiên phong' },
      { name: '破空', nameVi: 'Phá Không', desc: '雷行无阻,进退随心', descVi: 'Sét đi không cản, tiến thoái tùy tâm' }
    ]
  },
  {
    id: 'x_wanli_suo',
    name: '缩地成寸灵隐步',
    nameVi: 'Súc Địa Thành Thốn Linh Ẩn Bộ',
    type: 'secret',
    quality: 'profound',
    minRealm: 4,
    secretCategory: 'speed',
    desc: '参悟大地脉理,一步踏出咫尺化为千里天涯',
    descVi: 'Hiểu thấu mạch ngầm đại địa, một bước đặt xuống gang tấc hóa ngàn dặm chân trời',
    baseMods: { speed: 0.09, explorationSpeed: 0.12 },
    perLevelMods: { speed: 0.018, explorationSpeed: 0.03 },
    branches: [
      { name: '缩地', nameVi: 'Súc Địa', desc: '咫尺天涯,神游八表', descVi: 'Gang tấc chân trời, dạo bước tám cõi' },
      { name: '地隐', nameVi: 'Địa Ẩn', desc: '步入地脉,敌难追踪', descVi: 'Bước vào lòng đất, giặc khôn đuổi theo' }
    ]
  },
  {
    id: 'x_chiyan_dunbu',
    name: '赤炎神光逐电步',
    nameVi: 'Xích Viêm Thần Quang Trục Điện Bộ',
    type: 'secret',
    quality: 'profound',
    minRealm: 5,
    element: 'fire',
    secretCategory: 'speed',
    desc: '烈焰化为两道狂暴火翼,振翅之间掠过苍穹',
    descVi: 'Lửa thiêng hóa hai cánh hỏa cuồng bạo, vỗ cánh một cái lướt qua bầu trời',
    baseMods: { speed: 0.1, attackPct: 0.1 },
    perLevelMods: { speed: 0.02, attackPct: 0.025 },
    branches: [
      { name: '火翼', nameVi: 'Hỏa Dực', desc: '展翅冲霄,身动雷随', descVi: 'Tung cánh ngút mây, thân dời sấm theo' },
      { name: '逐电', nameVi: 'Trục Điện', desc: '奔流如虹,神形难测', descVi: 'Cuồn cuộn như vồng, thần hình khó đoán' }
    ]
  },
  {
    id: 'x_fengxiao_po',
    name: '破霄绝影神风遁',
    nameVi: 'Phá Tiêu Tuyệt Ảnh Thần Phong Độn',
    type: 'secret',
    quality: 'heaven',
    minRealm: 6,
    element: 'wind',
    secretCategory: 'speed',
    desc: '身躯彻底融汇于九霄罡风之中,无影无形',
    descVi: 'Thân xác hoàn toàn tan vào chín tầng cương phong, không hình không bóng',
    baseMods: { speed: 0.12, dodgeRate: 0.08 },
    perLevelMods: { speed: 0.025, dodgeRate: 0.02 },
    branches: [
      { name: '绝影', nameVi: 'Tuyệt Ảnh', desc: '不见形迹,避无可避', descVi: 'Chẳng thấy tung tích, khôn đường đánh trúng' },
      { name: '神风', nameVi: 'Thần Phong', desc: '罡风绕行,随风自化', descVi: 'Cương phong quanh thân, nương gió tự tan' }
    ]
  },
  {
    id: 'x_taixu_liubing',
    name: '玄冰极冻凌波遁',
    nameVi: 'Huyền Băng Cực Đống Lăng Ba Độn',
    type: 'secret',
    quality: 'heaven',
    minRealm: 7,
    element: 'ice',
    secretCategory: 'speed',
    desc: '步过之处凝结晶莹冰霜,踏冰而行绝尘而去',
    descVi: 'Bước chân lướt qua kết sương băng lấp lánh, đạp băng mà đi bụi trần khôn vướng',
    baseMods: { speed: 0.13, dodgeRate: 0.09 },
    perLevelMods: { speed: 0.028, dodgeRate: 0.022 },
    branches: [
      { name: '凌波', nameVi: 'Lăng Ba', desc: '踏霜无迹,身形飘忽', descVi: 'Đạp sương không dấu, thân hình chập chờn' },
      { name: '冷香', nameVi: 'Lãnh Hương', desc: '冰霜阻敌,从容避祸', descVi: 'Băng sương cản bước, ung dung lánh nạn' }
    ]
  },
  {
    id: 'x_zhoukong_dun',
    name: '周天星辰破界步',
    nameVi: 'Chu Thiên Tinh Thần Phá Giới Bộ',
    type: 'secret',
    quality: 'heaven',
    minRealm: 8,
    secretCategory: 'speed',
    desc: '踩周天星斗之方位行进,一步可跨一重天地',
    descVi: 'Đạp theo phương vị tinh tú khắp trời mà tiến, một bước có thể băng qua một tầng trời đất',
    baseMods: { speed: 0.15, explorationSpeed: 0.18 },
    perLevelMods: { speed: 0.03, explorationSpeed: 0.04 },
    branches: [
      { name: '星步', nameVi: 'Tinh Bộ', desc: '移星换斗,瞬息无踪', descVi: 'Dời sao đổi đẩu, chớp mắt không dấu' },
      { name: '天行', nameVi: 'Thiên Hành', desc: '跨界云游,探尽奇珍', descVi: 'Vượt cõi dạo chơi, tìm hết kỳ trân' }
    ]
  },

  // Tiên giới (9-13) - Cần mark: '仙', '云', '玉', '瑶', '星', '虚', '太', '罗', '雷'
  {
    id: 'x_xianyun_tian',
    name: '大罗仙云踏月步',
    nameVi: 'Đại La Tiên Vân Đạp Nguyệt Bộ',
    type: 'secret',
    quality: 'immortal',
    minRealm: 9,
    secretCategory: 'speed',
    desc: '乘大罗仙霞云气逍遥而行,跨界逐月',
    descVi: 'Cưỡi ráng mây Đại La tiêu dao mà đi, vượt cõi đuổi trăng',
    baseMods: { speed: 0.16, dodgeRate: 0.1 },
    perLevelMods: { speed: 0.035, dodgeRate: 0.025 },
    branches: [
      { name: '踏月', nameVi: 'Đạp Nguyệt', desc: '漫步虚空,诸险难加', descVi: 'Dạo bước hư không, mọi nạn khôn tới' },
      { name: '仙云', nameVi: 'Tiên Vân', desc: '云霞蔽日,身遁无形', descVi: 'Mây che bóng râm, thân ẩn vô hình' }
    ]
  },
  {
    id: 'x_yaochi_feixian',
    name: '瑶池飞仙御虚术',
    nameVi: 'Dao Trì Phi Tiên Ngự Hư Thuật',
    type: 'secret',
    quality: 'immortal',
    minRealm: 10,
    secretCategory: 'speed',
    desc: '身如瑶台仙子踏空飞升,超拔于万丈红尘之外',
    descVi: 'Thân tựa tiên tử Dao Trì bay lượn hư không, thoát khỏi chốn hồng trần muôn trượng',
    baseMods: { speed: 0.18, explorationSpeed: 0.22 },
    perLevelMods: { speed: 0.04, explorationSpeed: 0.05 },
    branches: [
      { name: '飞仙', nameVi: 'Phi Tiên', desc: '凌虚远遁,神鬼难测', descVi: 'Lướt cõi đi xa, quỷ thần khó lường' },
      { name: '瑶华', nameVi: 'Dao Hoa', desc: '仙华流转,进退从容', descVi: 'Tiên hoa xoay vần, tiến thoái thong dong' }
    ]
  },
  {
    id: 'x_taiyi_leiyun',
    name: '太乙仙雷破虚步',
    nameVi: 'Thái Ất Tiên Lôi Phá Hư Bộ',
    type: 'secret',
    quality: 'immortal',
    minRealm: 13,
    element: 'thunder',
    secretCategory: 'speed',
    desc: '太乙神雷破开虚空阻隔,神躯直入天外太虚',
    descVi: 'Thần lôi Thái Ất xé toang vách ngăn hư không, thân thể tiến thẳng vào thái hư ngoài trời',
    baseMods: { speed: 0.2, critRate: 0.08 },
    perLevelMods: { speed: 0.045, critRate: 0.02 },
    branches: [
      { name: '雷虚', nameVi: 'Lôi Hư', desc: '破空如电,敌势落空', descVi: 'Xé gió như chớp, đòn địch hụt tăm' },
      { name: '太乙', nameVi: 'Thái Ất', desc: '清风雷引,行者从容', descVi: 'Gió mát sấm đưa, hành xử thong dong' }
    ]
  },

  // Thần giới (14-17) - Cần mark: '神', '帝', '王', '冕', '诏', '法', '则'
  {
    id: 'x_shendi_lingkong',
    name: '神帝御界破空步',
    nameVi: 'Thần Đế Ngự Giới Phá Không Bộ',
    type: 'secret',
    quality: 'divine',
    minRealm: 14,
    secretCategory: 'speed',
    desc: '神帝巡视大千世界,一步之下诸界山河皆在脚底',
    descVi: 'Thần Đế tuần du đại thiên thế giới, một bước phóng ra muôn dặm non sông đều dưới bàn chân',
    baseMods: { speed: 0.22, dodgeRate: 0.12 },
    perLevelMods: { speed: 0.05, dodgeRate: 0.03 },
    branches: [
      { name: '御界', nameVi: 'Ngự Giới', desc: '神行无疆,万界俯首', descVi: 'Thần đi không bến, muôn cõi cúi mình' },
      { name: '帝行', nameVi: 'Đế Hành', desc: '威严无上,诸阻尽消', descVi: 'Uy nghiêm tột bực, mọi cản trở tan biến' }
    ]
  },
  {
    id: 'x_faze_wuxian',
    name: '法则空间无距瞬',
    nameVi: 'Pháp Tắc Không Gian Vô Cự Thuấn',
    type: 'secret',
    quality: 'divine',
    minRealm: 16,
    secretCategory: 'speed',
    desc: '执掌空间法则枢纽,天地之间再无距离之分',
    descVi: 'Nắm giữ then chốt của quy luật không gian, đất trời giữa muôn nơi không còn khoảng cách',
    baseMods: { speed: 0.25, explorationSpeed: 0.3 },
    perLevelMods: { speed: 0.06, explorationSpeed: 0.07 },
    branches: [
      { name: '无距', nameVi: 'Vô Cự', desc: '心念所至,身形立达', descVi: 'Ý nghĩ vừa tới, thân hình tức thì xuất hiện' },
      { name: '法则', nameVi: 'Pháp Tắc', desc: '虚空折叠,探宝如取', descVi: 'Gấp nếp hư không, lấy bảo bối như lấy đồ trong túi' }
    ]
  },

  // Hỗn Độn (18-20) - Cần mark: '混', '沌', '鸿', '蒙', '本', '源', '真', '灵', '无', '极', '开', '道', '界', '神', '魔'
  {
    id: 'x_hongmeng_you',
    name: '鸿蒙混沌大化遁',
    nameVi: 'Hồng Mông Hỗn Độn Đại Hóa Độn',
    type: 'secret',
    quality: 'divine',
    minRealm: 18,
    element: 'chaos',
    secretCategory: 'speed',
    desc: '化身为无形混沌之气,游走于纪元崩灭之时',
    descVi: 'Hóa thân làm luồng khí hỗn độn vô hình, dạo chơi qua các thời kỳ kỷ nguyên sụp đổ',
    baseMods: { speed: 0.2, dodgeRate: 0.1 },
    perLevelMods: { speed: 0.05, dodgeRate: 0.02 },
    branches: [
      { name: '大化', nameVi: 'Đại Hóa', desc: '与道合真,不可捉摸', descVi: 'Hòa cùng chân đạo, không thể bắt nắm' },
      { name: '混沌', nameVi: 'Hỗn Độn', desc: '游于无界,安享永劫', descVi: 'Dạo cõi vô biên, hưởng trọn vạn kiếp' }
    ]
  },
  {
    id: 'x_wuji_zhoutian',
    name: '无极道源神行步',
    nameVi: 'Vô Cực Đạo Nguyên Thần Hành Bộ',
    type: 'secret',
    quality: 'divine',
    minRealm: 20,
    element: 'chaos',
    secretCategory: 'speed',
    desc: '跳出三界外不在五行中,身在无极亦在万方',
    descVi: 'Nhảy ra khỏi ba cõi không nằm trong ngũ hành, thân ở Vô Cực cũng hiện khắp muôn phương',
    baseMods: { speed: 0.32, explorationSpeed: 0.4 },
    perLevelMods: { speed: 0.08, explorationSpeed: 0.09 },
    branches: [
      { name: '超脱', nameVi: 'Siêu Thoát', desc: '超出因果,神游无限', descVi: 'Vượt ngoài nhân quả, thần du vô hạn' },
      { name: '道步', nameVi: 'Đạo Bộ', desc: '道祖临凡,万物避道', descVi: 'Đạo tổ giáng trần, vạn vật nhường đường' }
    ]
  },

  // ==========================================
  // NHÓM 4: SUPPORT (18 Bí thuật Phụ trợ / Hồi phục / Tu vi / Tụ khí / Dược thảo)
  // ==========================================
  // Phàm giới (0-8)
  {
    id: 'x_houting_ling',
    name: '清心凝神静修篇',
    nameVi: 'Thanh Tâm Ngưng Thần Tĩnh Tu Thiên',
    type: 'secret',
    quality: 'fine',
    minRealm: 0,
    secretCategory: 'support',
    desc: '止熄妄念,内观气海,吐纳真气绵长平稳',
    descVi: 'Dập tắt tạp niệm, nhìn sâu vào khí hải, thổ nạp chân khí êm đềm bình ổn',
    baseMods: { cultivationSpeed: 0.08, qiRegen: 0.1 },
    perLevelMods: { cultivationSpeed: 0.02, qiRegen: 0.025 },
    branches: [
      { name: '静心', nameVi: 'Tĩnh Tâm', desc: '心无杂质,修为精纯', descVi: 'Lòng không vẩn đục, tu vi tinh thuần' },
      { name: '回气', nameVi: 'Hồi Khí', desc: '气脉通达,生生不息', descVi: 'Khí mạch thông tỏ, sinh sôi không dứt' }
    ]
  },
  {
    id: 'x_lingcao_jue',
    name: '百草凝露采撷典',
    nameVi: 'Bách Thảo Ngưng Lộ Thải Hốt Điển',
    type: 'secret',
    quality: 'fine',
    minRealm: 1,
    element: 'wood',
    secretCategory: 'support',
    desc: '通晓灵药草木枯荣之理,采集所得灵性倍增',
    descVi: 'Tường tận quy luật héo tươi cỏ thuốc linh dược, hái lượm được linh tính tăng gấp bội',
    baseMods: { alchemyYield: 0.15, breakthroughRate: 0.03 },
    perLevelMods: { alchemyYield: 0.035, breakthroughRate: 0.008 },
    branches: [
      { name: '采撷', nameVi: 'Thải Hốt', desc: '识药得真,采药倍获', descVi: 'Biết thuốc tìm thật, hái thuốc bội thu' },
      { name: '药理', nameVi: 'Dược Lý', desc: '灵丹化生,药力绵绵', descVi: 'Linh đan sinh nở, dược lực dồi dào' }
    ]
  },
  {
    id: 'x_diyan_rong',
    name: '地火熔金点石法',
    nameVi: 'Địa Hỏa Dung Kim Điểm Thạch Pháp',
    type: 'secret',
    quality: 'excellent',
    minRealm: 2,
    element: 'fire',
    secretCategory: 'support',
    desc: '以心火温养炉鼎矿脉,探寻顽石之中的至精玄铁',
    descVi: 'Dùng tâm hỏa ủ ấm quặng mỏ lò đan, tìm kiếm huyền thiết tinh túy trong đá tảng',
    baseMods: { forgeDiscount: 0.18, dropRate: 0.08 },
    perLevelMods: { forgeDiscount: 0.04, dropRate: 0.02 },
    branches: [
      { name: '熔金', nameVi: 'Dung Kim', desc: '矿石化纯,收获颇丰', descVi: 'Quặng đá hóa ròng, gặt hái rất nhiều' },
      { name: '炉火', nameVi: 'Lò Hỏa', desc: '温火慢炖,丹成上乘', descVi: 'Lửa êm ninh chậm, đan dược hảo hạng' }
    ]
  },
  {
    id: 'x_wanmu_changsheng',
    name: '万木朝元长春经',
    nameVi: 'Vạn Mộc Triều Nguyên Trường Xuân Kinh',
    type: 'secret',
    quality: 'spirit',
    minRealm: 3,
    element: 'wood',
    secretCategory: 'support',
    desc: '聚林木之万千生机反哺己身,延年益寿',
    descVi: 'Gom muôn vàn sinh cơ của rừng cây bù đắp bản thân, kéo dài tuổi thọ dồi dào sức sống',
    baseMods: { maxHpPct: 0.14, qiRegen: 0.18 },
    perLevelMods: { maxHpPct: 0.035, qiRegen: 0.04 },
    branches: [
      { name: '长春', nameVi: 'Trường Xuân', desc: '木气化津,生机长存', descVi: 'Mộc khí hóa dịch, sinh cơ bền lâu' },
      { name: '朝元', nameVi: 'Triều Nguyên', desc: '五气朝元,神清气爽', descVi: 'Năm khí chầu về, thần thanh khí sảng' }
    ]
  },
  {
    id: 'x_shengling_dan',
    name: '生灵造化炼丹篇',
    nameVi: 'Sinh Linh Tạo Hóa Luyện Đan Thiên',
    type: 'secret',
    quality: 'spirit',
    minRealm: 4,
    secretCategory: 'support',
    desc: '以造化生灵之火温养丹药,丹效通神',
    descVi: 'Dùng lửa tạo hóa sinh linh nuôi nấng đan dược, dược hiệu thông thần',
    baseMods: { dropRate: 0.15, breakthroughRate: 0.05 },
    perLevelMods: { dropRate: 0.035, breakthroughRate: 0.012 },
    branches: [
      { name: '丹效', nameVi: 'Đan Hiệu', desc: '神丹吞服,功效大增', descVi: 'Uống đan thần diệu, hiệu quả tăng vọt' },
      { name: '通窍', nameVi: 'Thông Khiếu', desc: '药力洗髓,冲破关卡', descVi: 'Dược lực tẩy tủy, phá tan cửa ải' }
    ]
  },
  {
    id: 'x_taixu_jue',
    name: '太虚吐纳聚灵真诀',
    nameVi: 'Thái Hư Thổ Nạp Tụ Linh Chân Quyết',
    type: 'secret',
    quality: 'profound',
    minRealm: 5,
    secretCategory: 'support',
    desc: '于太虚之中布设引灵玄阵,汇聚万里纯灵入体',
    descVi: 'Tại thái hư bày bố huyền trận dẫn linh, gom tụ linh khí thuần khiết vạn dặm vào người',
    baseMods: { cultivationSpeed: 0.2, qiRegen: 0.25 },
    perLevelMods: { cultivationSpeed: 0.05, qiRegen: 0.06 },
    branches: [
      { name: '聚灵', nameVi: 'Tụ Linh', desc: '灵潮如海,吐纳日进', descVi: 'Triều linh như biển, thổ nạp tiến xa' },
      { name: '培元', nameVi: 'Bồi Nguyên', desc: '根基固若神峰,无惧阻滞', descVi: 'Căn cơ vững như ngọn núi thần, chẳng ngại đình trệ' }
    ]
  },
  {
    id: 'x_bahuang_cai',
    name: '八荒地脉寻珍录',
    nameVi: 'Bát Hoang Địa Mạch Tầm Trân Lục',
    type: 'secret',
    quality: 'heaven',
    minRealm: 6,
    element: 'earth',
    secretCategory: 'support',
    desc: '勘测八荒地脉之走势,寻龙点穴采掘万年真金',
    descVi: 'Khảo sát mạch ngầm tám phương trời, điểm huyệt tầm long đào bới vạn năm chân kim',
    baseMods: { forgeDiscount: 0.28, alchemyYield: 0.28 },
    perLevelMods: { forgeDiscount: 0.07, alchemyYield: 0.07 },
    branches: [
      { name: '寻脉', nameVi: 'Tầm Mạch', desc: '掘金得玉,矿藏倍丰', descVi: 'Đào vàng được ngọc, quặng mỏ dồi dào' },
      { name: '点穴', nameVi: 'Điểm Huyệt', desc: '地气通畅,草木化珍', descVi: 'Địa khí hanh thông, cây cỏ hóa báu' }
    ]
  },
  {
    id: 'x_jiuxiao_yulu',
    name: '九霄甘露涤灵经',
    nameVi: 'Cửu Tiêu Cam Lộ Địch Linh Kinh',
    type: 'secret',
    quality: 'heaven',
    minRealm: 7,
    element: 'water',
    secretCategory: 'support',
    desc: '引九天玉液甘露洗髓伐脉,通体晶莹气血畅通',
    descVi: 'Dẫn sương ngọt ngọc dịch chín tầng trời gột rửa tủy mạch, toàn thân trong suốt khí huyết thông suốt',
    baseMods: { maxHpPct: 0.25, qiRegen: 0.3 },
    perLevelMods: { maxHpPct: 0.06, qiRegen: 0.07 },
    branches: [
      { name: '甘露', nameVi: 'Cam Lộ', desc: '神露涤身,旧疾尽消', descVi: 'Sương thần tẩy trần, bệnh cũ tan biến' },
      { name: '纯净', nameVi: 'Thuần Tịnh', desc: '体内无秽,道法自然', descVi: 'Trong người không nhơ, đạo pháp thuận tự nhiên' }
    ]
  },
  {
    id: 'x_tiandao_changsheng',
    name: '天道长生周天篇',
    nameVi: 'Thiên Đạo Trường Sinh Chu Thiên Thiên',
    type: 'secret',
    quality: 'heaven',
    minRealm: 8,
    secretCategory: 'support',
    desc: '顺应天道运转周天之息,修持速度一日千里',
    descVi: 'Thuận theo thiên đạo vận hành chu thiên tức, tốc độ tu trì một ngày ngàn dặm',
    baseMods: { cultivationSpeed: 0.25, breakthroughRate: 0.08 },
    perLevelMods: { cultivationSpeed: 0.065, breakthroughRate: 0.02 },
    branches: [
      { name: '周天', nameVi: 'Chu Thiên', desc: '生生运转,修为猛进', descVi: 'Vận chuyển không dứt, tu vi tiến vọt' },
      { name: '破障', nameVi: 'Phá Chướng', desc: '道眼通达,破劫如履', descVi: 'Mắt đạo thông suốt, vượt kiếp dễ dàng' }
    ]
  },

  // Tiên giới (9-13) - Cần mark: '仙', '云', '玉', '瑶', '星', '虚', '太', '罗', '雷'
  {
    id: 'x_yaochi_xiancao',
    name: '瑶池仙苑育灵诀',
    nameVi: 'Dao Trì Tiên Uyển Dục Linh Quyết',
    type: 'secret',
    quality: 'immortal',
    minRealm: 9,
    secretCategory: 'support',
    desc: '以瑶池仙水灌溉天下灵植,仙药成材速度倍增',
    descVi: 'Dùng nước tiên Dao Trì tưới tắm linh thực thiên hạ, tốc độ thuốc tiên lớn mạnh tăng gấp bội',
    baseMods: { alchemyYield: 0.35, dropRate: 0.2 },
    perLevelMods: { alchemyYield: 0.08, dropRate: 0.05 },
    branches: [
      { name: '仙泉', nameVi: 'Tiên Tuyền', desc: '瑶水润物,药香充盈', descVi: 'Nước Dao thấm nhuần vạn vật, hương thuốc nồng nàn' },
      { name: '育灵', nameVi: 'Dục Linh', desc: '仙材成丹,药力通天', descVi: 'Tiên tài thành đan, dược lực ngút trời' }
    ]
  },
  {
    id: 'x_yuxu_danfang',
    name: '玉虚九转神丹录',
    nameVi: 'Ngọc Hư Cửu Chuyển Thần Đan Lục',
    type: 'secret',
    quality: 'immortal',
    minRealm: 10,
    secretCategory: 'support',
    desc: '载录玉虚九转金丹之玄妙法门,服之延寿万载',
    descVi: 'Chép lại huyền môn kim đan chín chuyển Ngọc Hư, uống vào thọ muôn năm',
    baseMods: { dropRate: 0.25, breakthroughRate: 0.1 },
    perLevelMods: { dropRate: 0.06, breakthroughRate: 0.025 },
    branches: [
      { name: '九转', nameVi: 'Cửu Chuyển', desc: '金丹九转,妙用通玄', descVi: 'Kim đan chín chuyển, diệu dụng thông huyền' },
      { name: '冲霄', nameVi: 'Trùng Tiêu', desc: '药力破障,境界大成', descVi: 'Dược lực phá rào, cảnh giới viên mãn' }
    ]
  },
  {
    id: 'x_daluo_tuna',
    name: '大罗仙气洗心篇',
    nameVi: 'Đại La Tiên Khí Tẩy Tâm Thiên',
    type: 'secret',
    quality: 'immortal',
    minRealm: 11,
    secretCategory: 'support',
    desc: '引大罗天清净仙气入心宫,洗去万劫红尘羁绊',
    descVi: 'Dẫn khí tiên thanh tịnh cõi Đại La vào tâm cung, gột sạch vướng bận hồng trần muôn kiếp',
    baseMods: { cultivationSpeed: 0.3, qiRegen: 0.35 },
    perLevelMods: { cultivationSpeed: 0.075, qiRegen: 0.08 },
    branches: [
      { name: '洗心', nameVi: 'Tẩy Tâm', desc: '灵台绝照,修为沛然', descVi: 'Linh đài sáng tỏ, tu vi dạt dào' },
      { name: '大罗', nameVi: 'Đại La', desc: '身合仙境,安然自若', descVi: 'Thân hợp cảnh tiên, ung dung tự tại' }
    ]
  },
  {
    id: 'x_xinghai_cai',
    name: '太虚星海点金经',
    nameVi: 'Thái Hư Tinh Hải Điểm Kim Kinh',
    type: 'secret',
    quality: 'immortal',
    minRealm: 12,
    secretCategory: 'support',
    desc: '从太虚星海之中提炼星辰精金,铸造无上仙器',
    descVi: 'Chiết xuất tinh kim tinh tú từ biển sao thái hư, đúc nên tiên khí vô thượng',
    baseMods: { forgeDiscount: 0.4, breakthroughRate: 0.12 },
    perLevelMods: { forgeDiscount: 0.09, breakthroughRate: 0.03 },
    branches: [
      { name: '星金', nameVi: 'Tinh Kim', desc: '星海采矿,珍藏倍厚', descVi: 'Khai thác biển sao, kho báu chất dày' },
      { name: '点化', nameVi: 'Điểm Hóa', desc: '顽铁点金,悟道神速', descVi: 'Sắt vụn hóa vàng, ngộ đạo cực nhanh' }
    ]
  },

  // Thần giới (14-17) - Cần mark: '神', '帝', '王', '冕', '诏', '法', '则'
  {
    id: 'x_shendi_zaohua',
    name: '神帝万象造化篇',
    nameVi: 'Thần Đế Vạn Tượng Tạo Hóa Thiên',
    type: 'secret',
    quality: 'divine',
    minRealm: 14,
    secretCategory: 'support',
    desc: '神帝御令宇宙生机万象,气血如海奔腾不休',
    descVi: 'Thần Đế ban lệnh cho muôn loài sinh cơ vũ trụ, khí huyết như biển cuộn sóng không ngừng',
    baseMods: { maxHpPct: 0.35, qiRegen: 0.45 },
    perLevelMods: { maxHpPct: 0.08, qiRegen: 0.1 },
    branches: [
      { name: '造化', nameVi: 'Tạo Hóa', desc: '万物滋养,神体安稳', descVi: 'Vạn vật nuôi dưỡng, thần thể vững vàng' },
      { name: '神帝', nameVi: 'Thần Đế', desc: '生生不绝,帝气沛然', descVi: 'Sinh sôi bất tận, đế khí dạt dào' }
    ]
  },
  {
    id: 'x_faze_changsheng',
    name: '法则生生不息录',
    nameVi: 'Pháp Tắc Sinh Sinh Bất Tức Lục',
    type: 'secret',
    quality: 'divine',
    minRealm: 15,
    secretCategory: 'support',
    desc: '参悟宇宙生命法则真谛,寿数与日月星辰并驾',
    descVi: 'Lĩnh ngộ chân lý quy luật sự sống vũ trụ, tuổi thọ sánh vai cùng trăng sao nhật nguyệt',
    baseMods: { cultivationSpeed: 0.38, dropRate: 0.3 },
    perLevelMods: { cultivationSpeed: 0.09, dropRate: 0.07 },
    branches: [
      { name: '生生', nameVi: 'Sinh Sinh', desc: '生机无穷,吐纳极快', descVi: 'Sinh cơ vô tận, thổ nạp cực nhanh' },
      { name: '法则', nameVi: 'Pháp Tắc', desc: '丹道通玄,破境神速', descVi: 'Đan đạo thông huyền, vượt cảnh thần tốc' }
    ]
  },
  {
    id: 'x_shenwang_tong',
    name: '神王金冕造天典',
    nameVi: 'Thần Vương Kim Mão Tạo Thiên Điển',
    type: 'secret',
    quality: 'divine',
    minRealm: 17,
    secretCategory: 'support',
    desc: '以神王无上权柄赐福众生,采矿寻珍皆获神助',
    descVi: 'Dùng quyền bính tối cao của Thần Vương ban phúc chúng sinh, đào mỏ tìm báu đều có thần trợ lực',
    baseMods: { forgeDiscount: 0.45, alchemyYield: 0.45 },
    perLevelMods: { forgeDiscount: 0.1, alchemyYield: 0.1 },
    branches: [
      { name: '王权', nameVi: 'Vương Quyền', desc: '地宝出世,收获无限', descVi: 'Địa bảo xuất thế, gặt hái vô hạn' },
      { name: '神赐', nameVi: 'Thần Tứ', desc: '天降福泽,草木皆灵', descVi: 'Trời ban phúc trạch, cây cỏ đều linh' }
    ]
  },

  // Hỗn Độn (18-20) - Cần mark: '混', '沌', '鸿', '蒙', '本', '源', '真', '灵', '无', '极', '开', '道', '界', '神', '魔'
  {
    id: 'x_hongmeng_zaohua',
    name: '鸿蒙本源万劫生化经',
    nameVi: 'Hồng Mông Bản Nguyên Vạn Kiếp Sinh Hóa Kinh',
    type: 'secret',
    quality: 'divine',
    minRealm: 18,
    element: 'chaos',
    secretCategory: 'support',
    desc: '从混沌鸿蒙最初元气中汲取生息,逆天改命',
    descVi: 'Từ luồng nguyên khí đầu tiên của Hồng Mông hỗn độn hút lấy sự sống, nghịch thiên cải mệnh',
    baseMods: { cultivationSpeed: 0.45, qiRegen: 0.55 },
    perLevelMods: { cultivationSpeed: 0.11, qiRegen: 0.12 },
    branches: [
      { name: '生化', nameVi: 'Sinh Hóa', desc: '一气化生,修为长进', descVi: 'Một khí sinh hóa, tu vi tăng tiến' },
      { name: '鸿蒙', nameVi: 'Hồng Mông', desc: '本源充足,永不受阻', descVi: 'Bản nguyên tràn trề, vĩnh viễn không tắc' }
    ]
  },
  {
    id: 'x_wuji_daoyuan_sheng',
    name: '无极大乘道源长生经',
    nameVi: 'Vô Cực Đại Thừa Đạo Nguyên Trường Sinh Kinh',
    type: 'secret',
    quality: 'divine',
    minRealm: 20,
    element: 'chaos',
    secretCategory: 'support',
    desc: '道祖修持之无上长生真经,与混沌同寿不生不灭',
    descVi: 'Trường sinh chân kinh tối cao Đạo Tổ tu trì, thọ cùng hỗn độn không sinh không diệt',
    baseMods: { cultivationSpeed: 0.5, maxHpPct: 0.5, breakthroughRate: 0.15 },
    perLevelMods: { cultivationSpeed: 0.12, maxHpPct: 0.12, breakthroughRate: 0.04 },
    branches: [
      { name: '道生', nameVi: 'Đạo Sinh', desc: '大道同行,生生不已', descVi: 'Đại đạo đồng hành, sinh sôi chẳng dứt' },
      { name: '无极', nameVi: 'Vô Cực', desc: '万境皆破,证道长生', descVi: 'Vạn cảnh đều phá, chứng đạo trường sinh' }
    ]
  },

  // ==========================================
  // NHÓM 5: PERCEPTION (13 Bí thuật Cảm tri / Ngộ tính / Cơ duyên / Thiên nhãn)
  // ==========================================
  // Phàm giới (0-8)
  {
    id: 'x_wangqi_jue',
    name: '观天望气辨机篇',
    nameVi: 'Quan Thiên Vọng Khí Biện Cơ Thiên',
    type: 'secret',
    quality: 'fine',
    minRealm: 0,
    secretCategory: 'perception',
    minComprehension: 45,
    desc: '抬头观天象祥瑞与死煞,趋吉避凶逢凶化吉',
    descVi: 'Ngẩng đầu xem điềm lành điềm dữ trên trời, lánh dữ tìm lành gặp nguy hóa an',
    baseMods: { luck: 0.05, eventLuck: 0.06 },
    perLevelMods: { luck: 0.012, eventLuck: 0.015 },
    branches: [
      { name: '望气', nameVi: 'Vọng Khí', desc: '早觉凶吉,趋福避难', descVi: 'Sớm hiểu hung cát, hướng phúc tránh nạn' },
      { name: '辨机', nameVi: 'Biện Cơ', desc: '机变通达,福佑随行', descVi: 'Cơ biến thông suốt, phúc lành theo gót' }
    ]
  },
  {
    id: 'x_lingtai_tong',
    name: '灵台明镜照微经',
    nameVi: 'Linh Đài Minh Kính Chiếu Vi Kinh',
    type: 'secret',
    quality: 'excellent',
    minRealm: 1,
    secretCategory: 'perception',
    minComprehension: 50,
    desc: '拂拭灵台不染微尘,观敌破绽如掌上观纹',
    descVi: 'Lau phủi linh đài không vướng hạt bụi, nhìn sơ hở địch như soi đường chỉ tay',
    baseMods: { critRate: 0.04, luck: 0.06 },
    perLevelMods: { critRate: 0.01, luck: 0.015 },
    branches: [
      { name: '破妄', nameVi: 'Phá Vọng', desc: '洞悉破绽,击中要害', descVi: 'Thấu suốt sơ hở, đánh trúng chỗ hiểm' },
      { name: '明镜', nameVi: 'Minh Kính', desc: '心如止水,吉运常伴', descVi: 'Tâm như nước lặng, vận may thường theo' }
    ]
  },
  {
    id: 'x_tianji_suan',
    name: '太乙天机推衍篇',
    nameVi: 'Thái Ất Thiên Cơ Thôi Diễn Thiên',
    type: 'secret',
    quality: 'spirit',
    minRealm: 3,
    secretCategory: 'perception',
    minComprehension: 60,
    desc: '屈指推衍周天八卦吉凶,占卜前路灵脉福地',
    descVi: 'Bấm ngón tay suy diễn hung cát bát quái, bói toán nẻo đường linh mạch phúc địa',
    baseMods: { eventLuck: 0.1, luck: 0.08 },
    perLevelMods: { eventLuck: 0.025, luck: 0.02 },
    branches: [
      { name: '推衍', nameVi: 'Thôi Diễn', desc: '先知先觉,福缘深厚', descVi: 'Biết trước hiểu sớm, phúc duyên thâm sâu' },
      { name: '定数', nameVi: 'Định Số', desc: '趋吉而行,奇遇频生', descVi: 'Thuận lành mà đi, kỳ ngộ liên miên' }
    ]
  },
  {
    id: 'x_tianyan_dong',
    name: '洞真玄天神眼录',
    nameVi: 'Đổng Chân Huyền Thiên Thần Nhãn Lục',
    type: 'secret',
    quality: 'profound',
    minRealm: 5,
    secretCategory: 'perception',
    minComprehension: 70,
    desc: '眉心生出通天法眼,看透诸界阵法虚实与宝气',
    descVi: 'Giữa lông mày mở ra pháp nhãn thông thiên, nhìn thấu hư thực trận pháp cùng bảo khí các cõi',
    baseMods: { critRate: 0.06, eventLuck: 0.12 },
    perLevelMods: { critRate: 0.015, eventLuck: 0.03 },
    branches: [
      { name: '神眼', nameVi: 'Thần Nhãn', desc: '双目神光,透视玄虚', descVi: 'Mắt tỏa ánh thần, nhìn thấu hư ảo' },
      { name: '洞真', nameVi: 'Đổng Chân', desc: '见宝知珍,采掘不虚', descVi: 'Thấy bảo vật biết đồ quý, đào bới không công cốc' }
    ]
  },
  {
    id: 'x_bahuang_tianji',
    name: '八荒问天卜吉典',
    nameVi: 'Bát Hoang Vấn Thiên Bốc Cát Điển',
    type: 'secret',
    quality: 'heaven',
    minRealm: 7,
    secretCategory: 'perception',
    minComprehension: 78,
    desc: '向八荒苍天问卜大势,冥冥之中自有神运庇佑',
    descVi: 'Hỏi trời xanh tám cõi về thế lớn, trong cõi mịt mờ tự có thần vận chở che',
    baseMods: { luck: 0.12, eventLuck: 0.15 },
    perLevelMods: { luck: 0.03, eventLuck: 0.035 },
    branches: [
      { name: '问天', nameVi: 'Vấn Thiên', desc: '得天之佑,逢凶化吉', descVi: 'Được trời che chở, gặp dữ hóa lành' },
      { name: '得运', nameVi: 'Đắc Vận', desc: '吉星临门,造化无边', descVi: 'Sao lành tới cửa, tạo hóa vô biên' }
    ]
  },

  // Tiên giới (9-13) - Cần mark: '仙', '云', '玉', '瑶', '星', '虚', '太', '罗', '雷'
  {
    id: 'x_xianling_tianyan',
    name: '九重仙灵通天法目',
    nameVi: 'Cửu Trọng Tiên Linh Thông Thiên Pháp Mục',
    type: 'secret',
    quality: 'immortal',
    minRealm: 9,
    secretCategory: 'perception',
    minComprehension: 82,
    desc: '仙灵之光汇聚双瞳,上窥三十三重天阙',
    descVi: 'Ánh sáng tiên linh tụ nơi đôi mắt, trên soi ba mươi ba tầng trời',
    baseMods: { luck: 0.15, eventLuck: 0.18 },
    perLevelMods: { luck: 0.035, eventLuck: 0.04 },
    branches: [
      { name: '法目', nameVi: 'Pháp Mục', desc: '仙瞳辨真,破尽虚妄', descVi: 'Mắt tiên phân thật, phá sạch hư vọng' },
      { name: '通天', nameVi: 'Thông Thiên', desc: '福禄照临,仙缘常伴', descVi: 'Phúc lộc chiếu tới, tiên duyên luôn theo' }
    ]
  },
  {
    id: 'x_yaochi_xianyun',
    name: '瑶池紫气占机篇',
    nameVi: 'Dao Trì Tử Khí Chiêm Cơ Thiên',
    type: 'secret',
    quality: 'immortal',
    minRealm: 11,
    secretCategory: 'perception',
    minComprehension: 85,
    desc: '观瑶台仙池紫气东来,预知大千界域机缘',
    descVi: 'Ngắm sắc tím hồ tiên Dao Trì bay về đông, biết trước cơ duyên khắp cõi',
    baseMods: { eventLuck: 0.2, luck: 0.16 },
    perLevelMods: { eventLuck: 0.045, luck: 0.04 },
    branches: [
      { name: '紫气', nameVi: 'Tử Khí', desc: '紫气东来,万事通达', descVi: 'Khí tím về đông, vạn sự hanh thông' },
      { name: '仙机', nameVi: 'Tiên Cơ', desc: '预见天机,先拔头筹', descVi: 'Thấy trước thiên cơ, đi trước một bước' }
    ]
  },
  {
    id: 'x_xingxiu_tong',
    name: '大罗星宿参玄录',
    nameVi: 'Đại La Tinh Tú Tham Huyền Lục',
    type: 'secret',
    quality: 'immortal',
    minRealm: 13,
    secretCategory: 'perception',
    minComprehension: 88,
    desc: '参悟大罗天外二十八星宿之神妙玄机,明悟万象',
    descVi: 'Lĩnh ngộ huyền cơ thần diệu của hai mươi tám tinh tú cõi Đại La, thấu tỏ muôn loài',
    baseMods: { critRate: 0.08, luck: 0.18 },
    perLevelMods: { critRate: 0.02, luck: 0.045 },
    branches: [
      { name: '星宿', nameVi: 'Tinh Tú', desc: '星官照命,逢事必成', descVi: 'Quan sao chiếu mệnh, việc làm ắt thành' },
      { name: '参玄', nameVi: 'Tham Huyền', desc: '悟彻玄妙,战伐从容', descVi: 'Hiểu thấu huyền vi, chiến đấu thong dong' }
    ]
  },

  // Thần giới (14-17) - Cần mark: '神', '帝', '王', '冕', '诏', '法', '则'
  {
    id: 'x_shendi_dongtian',
    name: '神帝照世观宇经',
    nameVi: 'Thần Đế Chiếu Thế Quan Vũ Kinh',
    type: 'secret',
    quality: 'divine',
    minRealm: 14,
    secretCategory: 'perception',
    minComprehension: 90,
    desc: '神帝神念笼罩寰宇,大千世界秋毫必现',
    descVi: 'Thần niệm Thần Đế bao trùm hoàn vũ, chuyện nhỏ như sợi lông trong đại thiên cũng hiện rõ',
    baseMods: { luck: 0.2, eventLuck: 0.25 },
    perLevelMods: { luck: 0.05, eventLuck: 0.06 },
    branches: [
      { name: '照世', nameVi: 'Chiếu Thế', desc: '神目如炬,明见万里', descVi: 'Mắt thần tựa đuốc, thấy rõ vạn dặm' },
      { name: '观宇', nameVi: 'Quan Vũ', desc: '宇内气机,尽入胸怀', descVi: 'Khí cơ vũ trụ, đều gom trong lòng' }
    ]
  },
  {
    id: 'x_faze_dongcha',
    name: '宇宙法则洞彻真卷',
    nameVi: 'Vũ Trụ Pháp Tắc Đổng Triệt Chân Quyển',
    type: 'secret',
    quality: 'divine',
    minRealm: 16,
    secretCategory: 'perception',
    minComprehension: 94,
    desc: '洞彻宇宙因果命运法则,逆转命途逢凶化吉',
    descVi: 'Thấu tỏ quy luật vận mệnh nhân quả vũ trụ, xoay chuyển đường đời gặp dữ hóa lành',
    baseMods: { critRate: 0.1, eventLuck: 0.28 },
    perLevelMods: { critRate: 0.025, eventLuck: 0.065 },
    branches: [
      { name: '洞彻', nameVi: 'Đổng Triệt', desc: '通达天数,击中破绽', descVi: 'Thông tỏ số trời, đánh trúng điểm yếu' },
      { name: '法则', nameVi: 'Pháp Tắc', desc: '命运垂青,诸事顺遂', descVi: 'Số phận đoái hoài, mọi sự êm xuôi' }
    ]
  },

  // Hỗn Độn (18-20) - Cần mark: '混', '沌', '鸿', '蒙', '本', '源', '真', '灵', '无', '极', '开', '道', '界', '神', '魔'
  {
    id: 'x_hongmeng_ming',
    name: '鸿蒙本源知命通神典',
    nameVi: 'Hồng Mông Bản Nguyên Tri Mệnh Thông Thần Điển',
    type: 'secret',
    quality: 'divine',
    minRealm: 18,
    element: 'chaos',
    secretCategory: 'perception',
    minComprehension: 96,
    desc: '从鸿蒙之初推衍万古命数,早知前尘后世',
    descVi: 'Từ thuở đầu Hồng Mông suy diễn số mệnh vạn cổ, sớm biết tiền kiếp hậu lai',
    baseMods: { luck: 0.25, eventLuck: 0.32 },
    perLevelMods: { luck: 0.06, eventLuck: 0.08 },
    branches: [
      { name: '知命', nameVi: 'Tri Mệnh', desc: '命格超拔,万吉汇聚', descVi: 'Mệnh cách vượt trội, vạn điềm lành tụ' },
      { name: '本源', nameVi: 'Bản Nguyên', desc: '追溯太初,奇遇无尽', descVi: 'Truy tìm thái sơ, kỳ ngộ vô tận' }
    ]
  },
  {
    id: 'x_hundun_daoyan',
    name: '混沌道眼观虚真诀',
    nameVi: 'Hỗn Độn Đạo Nhãn Quan Hư Chân Quyết',
    type: 'secret',
    quality: 'divine',
    minRealm: 19,
    element: 'chaos',
    secretCategory: 'perception',
    minComprehension: 98,
    desc: '以混沌真元开辟道祖神眼,看透诸界过去未来',
    descVi: 'Dùng chân nguyên Hỗn Độn mở thần nhãn Đạo Tổ, nhìn thấu quá khứ tương lai các cõi',
    baseMods: { critRate: 0.12, luck: 0.28 },
    perLevelMods: { critRate: 0.03, luck: 0.07 },
    branches: [
      { name: '道眼', nameVi: 'Đạo Nhãn', desc: '勘破因果,出手致命', descVi: 'Nhìn thấu nhân quả, ra đòn đoạt mạng' },
      { name: '观虚', nameVi: 'Quan Hư', desc: '虚空藏宝,信手拈来', descVi: 'Hư không cất của báu, tiện tay cầm về' }
    ]
  },
  {
    id: 'x_wuji_zhizun',
    name: '无极道祖至尊天命章',
    nameVi: 'Vô Cực Đạo Tổ Chí Tôn Thiên Mệnh Chương',
    type: 'secret',
    quality: 'divine',
    minRealm: 20,
    element: 'chaos',
    secretCategory: 'perception',
    minComprehension: 100,
    desc: '道祖执掌天命核心,万道万物皆受其冥冥敕令',
    descVi: 'Đạo Tổ nắm giữ lõi thiên mệnh, muôn đạo vạn vật đều chịu sự sai khiến thầm kín',
    baseMods: { luck: 0.35, eventLuck: 0.4 },
    perLevelMods: { luck: 0.08, eventLuck: 0.09 },
    branches: [
      { name: '天命', nameVi: 'Thiên Mệnh', desc: '至尊加身,诸天称颂', descVi: 'Chí tôn vào người, chư thiên ca tụng' },
      { name: '无极', nameVi: 'Vô Cực', desc: '道祖敕命,无往不吉', descVi: 'Đạo tổ ra lệnh, đánh đâu cũng lành' }
    ]
  },

  // ==========================================
  // NHÓM 6: SPECIAL (13 Bí thuật Đặc thù / Tuyệt cảnh / Phản kích / Hỗn độn dị thuật)
  // ==========================================
  // Phàm giới (0-8)
  {
    id: 'x_juejing_beng',
    name: '绝境逢生狂暴决',
    nameVi: 'Tuyệt Cảnh Phùng Sinh Cuồng Bạo Quyết',
    type: 'secret',
    quality: 'fine',
    minRealm: 0,
    secretCategory: 'special',
    desc: '身处绝境濒死之时,激发全身潜能狂暴反杀',
    descVi: 'Lâm vào đường cùng gần chết, kích hoạt toàn bộ tiềm năng bùng nổ phản sát',
    baseMods: { lowHpDamage: 0.18, lowHpReduction: 0.12 },
    perLevelMods: { lowHpDamage: 0.045, lowHpReduction: 0.03 },
    branches: [
      { name: '绝境', nameVi: 'Tuyệt Cảnh', desc: '血战破敌,反败为胜', descVi: 'Máu chiến diệt địch, biến bại thành thắng' },
      { name: '逢生', nameVi: 'Phùng Sinh', desc: '命硬如铁,绝处生还', descVi: 'Mạng cứng như sắt, thoát chết tìm đường' }
    ]
  },
  {
    id: 'x_yinyang_ni',
    name: '阴阳逆乱神功篇',
    nameVi: 'Âm Dương Nghịch Loạn Thần Công Thiên',
    type: 'secret',
    quality: 'excellent',
    minRealm: 2,
    secretCategory: 'special',
    desc: '颠倒经脉阴阳二气,反制对手一切猛攻',
    descVi: 'Đảo ngược nhị khí âm dương trong kinh mạch, phản chế mọi đòn tấn công mãnh liệt của đối phương',
    baseMods: { counterRate: 0.07, counterDamage: 0.22 },
    perLevelMods: { counterRate: 0.018, counterDamage: 0.05 },
    branches: [
      { name: '逆乱', nameVi: 'Nghịch Loạn', desc: '倒错阴阳,卸力伤人', descVi: 'Đảo lộn âm dương, hóa giải kình lực làm tổn thương người' },
      { name: '反震', nameVi: 'Phản Chấn', desc: '大力回敬,敌势难支', descVi: 'Trả đòn mạnh mẽ, thế địch khó chống' }
    ]
  },
  {
    id: 'x_chisha_xue',
    name: '赤煞浴血破阵诀',
    nameVi: 'Xích Sát Dục Huyết Phá Trận Quyết',
    type: 'secret',
    quality: 'spirit',
    minRealm: 4,
    element: 'fire',
    secretCategory: 'special',
    desc: '身染敌血愈战愈狂,以煞养战所向披靡',
    descVi: 'Nhuốm máu quân thù càng đánh càng hăng, lấy sát nuôi chiến quét sạch muôn phương',
    baseMods: { lowHpDamage: 0.25, critDamage: 0.2 },
    perLevelMods: { lowHpDamage: 0.06, critDamage: 0.05 },
    branches: [
      { name: '浴血', nameVi: 'Dục Huyết', desc: '残躯狂战,愈挫愈坚', descVi: 'Thân tàn chiến cuồng, càng đánh càng dẻo dai' },
      { name: '破阵', nameVi: 'Phá Trận', desc: '煞气开锋,锐不可当', descVi: 'Sát khí mở lối, bén ngót khôn ngăn' }
    ]
  },
  {
    id: 'x_jiuxiao_duan',
    name: '天冥两绝断魂引',
    nameVi: 'Thiên Minh Lưỡng Tuyệt Đoạn Hồn Dẫn',
    type: 'secret',
    quality: 'profound',
    minRealm: 5,
    element: 'dark',
    secretCategory: 'special',
    desc: '引九幽九天生死双极之力,令对手元神混乱失常',
    descVi: 'Dẫn lực lượng sinh tử lưỡng cực chín tầng trời và chín tầng u minh, khiến đối phương nguyên thần hỗn loạn',
    baseMods: { damageBonus: 0.12, counterRate: 0.09 },
    perLevelMods: { damageBonus: 0.03, counterRate: 0.02 },
    branches: [
      { name: '两绝', nameVi: 'Lưỡng Tuyệt', desc: '生死剥离,敌破神衰', descVi: 'Sinh tử tách rời, địch vỡ thần tàn' },
      { name: '断魂', nameVi: 'Đoạn Hồn', desc: '冥煞缠身,万念俱灭', descVi: 'Minh sát vấn vương, vạn niệm đều tắt' }
    ]
  },
  {
    id: 'x_bahuang_zhen',
    name: '八荒十方同归煞',
    nameVi: 'Bát Hoang Thập Phương Đồng Quy Sát',
    type: 'secret',
    quality: 'heaven',
    minRealm: 7,
    secretCategory: 'special',
    desc: '燃烧神魂精血与强敌同归于尽,爆发出毁天灭地之能',
    descVi: 'Đốt cháy thần hồn tinh huyết quyết một trận sống mái, bùng nổ năng lực hủy thiên diệt địa',
    baseMods: { lowHpDamage: 0.35, lowHpReduction: 0.25 },
    perLevelMods: { lowHpDamage: 0.08, lowHpReduction: 0.06 },
    branches: [
      { name: '同归', nameVi: 'Đồng Quy', desc: '决死一击,天地皆惊', descVi: 'Đòn đánh quyết tử, đất trời kinh hãi' },
      { name: '煞绝', nameVi: 'Sát Tuyệt', desc: '孤注一掷,破釜沉舟', descVi: 'Dốc toàn bộ vốn liếng, không đường lui' }
    ]
  },

  // Tiên giới (9-13) - Cần mark: '仙', '云', '玉', '瑶', '星', '虚', '太', '罗', '雷'
  {
    id: 'x_xianjie_ni',
    name: '大罗逆天改命诀',
    nameVi: 'Đại La Nghịch Thiên Cải Mệnh Quyết',
    type: 'secret',
    quality: 'immortal',
    minRealm: 10,
    secretCategory: 'special',
    desc: '大罗金仙逆转岁月长河,强行扭转生死定数',
    descVi: 'Đại La kim tiên xoay ngược dòng sông thời gian, cưỡng ép đảo ngược định số sinh tử',
    baseMods: { lowHpReduction: 0.3, breakthroughRate: 0.1 },
    perLevelMods: { lowHpReduction: 0.07, breakthroughRate: 0.025 },
    branches: [
      { name: '改命', nameVi: 'Cải Mệnh', desc: '转危为安,死中求活', descVi: 'Chuyển nguy thành an, trong chết tìm sống' },
      { name: '逆天', nameVi: 'Nghịch Thiên', desc: '斩破命途,道果圆融', descVi: 'Chém nát đường mệnh, đạo quả tròn đầy' }
    ]
  },
  {
    id: 'x_taixu_fen',
    name: '太虚玄黄炼虚神术',
    nameVi: 'Thái Hư Huyền Hoàng Luyện Hư Thần Thuật',
    type: 'secret',
    quality: 'immortal',
    minRealm: 12,
    secretCategory: 'special',
    desc: '炼太虚玄黄母气入道,化一切攻击为养分',
    descVi: 'Luyện mẫu khí thái hư huyền hoàng nhập đạo, hóa mọi đòn đánh thành dinh dưỡng',
    baseMods: { damageBonus: 0.16, counterDamage: 0.35 },
    perLevelMods: { damageBonus: 0.04, counterDamage: 0.08 },
    branches: [
      { name: '炼虚', nameVi: 'Luyện Hư', desc: '融化强攻,反哺自身', descVi: 'Hòa tan đòn mạnh, bù đắp bản thân' },
      { name: '玄黄', nameVi: 'Huyền Hoàng', desc: '重气沉凝,反创强敌', descVi: 'Khí nặng lắng đọng, phản kích cường địch' }
    ]
  },

  // Thần giới (14-17) - Cần mark: '神', '帝', '王', '冕', '诏', '法', '则'
  {
    id: 'x_shendi_beng',
    name: '神帝焚血破天罡',
    nameVi: 'Thần Đế Phần Huyết Phá Thiên Cương',
    type: 'secret',
    quality: 'divine',
    minRealm: 15,
    secretCategory: 'special',
    desc: '神帝燃烧古神之血,爆发出超越境界极限之神威',
    descVi: 'Thần Đế đốt cháy máu cổ thần, bộc phát thần uy vượt khỏi giới hạn cảnh giới',
    baseMods: { lowHpDamage: 0.4, critRate: 0.1 },
    perLevelMods: { lowHpDamage: 0.09, critRate: 0.025 },
    branches: [
      { name: '焚血', nameVi: 'Phần Huyết', desc: '神血奔涌,威震寰宇', descVi: 'Máu thần cuộn trào, uy chấn hoàn vũ' },
      { name: '破天', nameVi: 'Phá Thiên', desc: '撕裂天穹,一往无前', descVi: 'Xé toang vòm trời, tiến thẳng không lui' }
    ]
  },
  {
    id: 'x_faze_ni',
    name: '因果法则逆反神卷',
    nameVi: 'Nhân Quả Pháp Tắc Nghịch Phản Thần Quyển',
    type: 'secret',
    quality: 'divine',
    minRealm: 17,
    secretCategory: 'special',
    desc: '执掌因果法则将受到的伤害全数逆转奉还',
    descVi: 'Nắm giữ quy luật nhân quả đem trọn vẹn thương tổn chịu vào dội ngược trả lại',
    baseMods: { counterRate: 0.15, counterDamage: 0.45 },
    perLevelMods: { counterRate: 0.035, counterDamage: 0.1 },
    branches: [
      { name: '因果', nameVi: 'Nhân Quả', desc: '以果逆因,敌攻自受', descVi: 'Lấy quả ngược nhân, địch đánh tự chịu' },
      { name: '逆反', nameVi: 'Nghịch Phản', desc: '全数奉还,破敌胆魄', descVi: 'Trả lại toàn bộ, phá vỡ mật gan địch' }
    ]
  },

  // Hỗn Độn (18-20) - Cần mark: '混', '沌', '鸿', '蒙', '本', '源', '真', '灵', '无', '极', '开', '道', '界', '神', '魔'
  {
    id: 'x_hongmeng_ni',
    name: '鸿蒙混沌逆道玄枢',
    nameVi: 'Hồng Mông Hỗn Độn Nghịch Đạo Huyền Xu',
    type: 'secret',
    quality: 'divine',
    minRealm: 18,
    element: 'chaos',
    secretCategory: 'special',
    desc: '颠倒鸿蒙阴阳黑白,让天道秩序彻底化为混沌',
    descVi: 'Đảo lộn âm dương trắng đen thời Hồng Mông, khiến trật tự thiên đạo hoàn toàn hóa hỗn độn',
    baseMods: { lowHpDamage: 0.45, counterDamage: 0.5 },
    perLevelMods: { lowHpDamage: 0.1, counterDamage: 0.12 },
    branches: [
      { name: '逆道', nameVi: 'Nghịch Đạo', desc: '颠倒法则,敌乱我胜', descVi: 'Đảo ngược quy luật, giặc loạn ta thắng' },
      { name: '玄枢', nameVi: 'Huyền Xu', desc: '枢纽在手,掌控生死', descVi: 'Then chốt trong tay, nắm quyền sinh tử' }
    ]
  },
  {
    id: 'x_hundun_tonggui',
    name: '混沌神魔归墟同寂术',
    nameVi: 'Hỗn Độn Thần Ma Quy Khương Đồng Tịch Thuật',
    type: 'secret',
    quality: 'divine',
    minRealm: 19,
    element: 'chaos',
    secretCategory: 'special',
    desc: '引混沌归墟寂灭之力,使对战双方陷入永恒死寂',
    descVi: 'Dẫn lực lượng tịch diệt cõi chết Hỗn Độn, khiến hai bên giao tranh chìm vào vĩnh hằng chết lặng',
    baseMods: { lowHpReduction: 0.4, lowHpDamage: 0.5 },
    perLevelMods: { lowHpReduction: 0.09, lowHpDamage: 0.12 },
    branches: [
      { name: '归墟', nameVi: 'Quy Khương', desc: '诸神黄昏,万物沉寂', descVi: 'Chư thần hoàng hôn, vạn vật chìm lặng' },
      { name: '同寂', nameVi: 'Đồng Tịch', desc: '绝死反扑,斩杀强敌', descVi: 'Cùng đường cắn trả, chém giết cường địch' }
    ]
  },
  {
    id: 'x_kaitian_beng',
    name: '开天辟地混元同化引',
    nameVi: 'Khai Thiên Tích Địa Hỗn Nguyên Đồng Hóa Dẫn',
    type: 'secret',
    quality: 'divine',
    minRealm: 20,
    element: 'chaos',
    secretCategory: 'special',
    desc: '将对手一切法宝神力全部化为开天神火自用',
    descVi: 'Đem mọi pháp bảo thần lực của kẻ địch toàn bộ biến thành thần hỏa khai thiên cho ta dùng',
    baseMods: { damageBonus: 0.18, damageReduction: 0.15 },
    perLevelMods: { damageBonus: 0.04, damageReduction: 0.03 },
    branches: [
      { name: '同化', nameVi: 'Đồng Hóa', desc: '收归己用,神力无穷', descVi: 'Gom về làm của mình, thần lực vô cùng' },
      { name: '开天', nameVi: 'Khai Thiên', desc: '神火燎原,无物不化', descVi: 'Lửa thần cháy rực, không vật chẳng tan' }
    ]
  },
  {
    id: 'x_wuji_daoyi_tong',
    name: '无极道祖万法归宗印',
    nameVi: 'Vô Cực Đạo Tổ Vạn Pháp Quy Tông Ấn',
    type: 'secret',
    quality: 'divine',
    minRealm: 20,
    element: 'chaos',
    secretCategory: 'special',
    desc: '道祖一印镇下,万界万道万法万兵皆归于本源',
    descVi: 'Đạo Tổ một ấn giáng xuống, muôn cõi muôn đạo vạn pháp vạn binh đều quy về nguồn cội',
    baseMods: { damageBonus: 0.2, damageReduction: 0.15 },
    perLevelMods: { damageBonus: 0.05, damageReduction: 0.035 },
    branches: [
      { name: '归宗', nameVi: 'Quy Tông', desc: '万法俯首,莫敢不从', descVi: 'Vạn pháp cúi đầu, chẳng ai dám trái' },
      { name: '道尊', nameVi: 'Đạo Tôn', desc: '至高无上,独步诸界', descVi: 'Tối cao vô thượng, tung hoành các cõi' }
    ]
  }
]
