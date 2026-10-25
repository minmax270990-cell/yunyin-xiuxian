import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkChars, checkWorldMark, allReservedNames, existingGongfaIds } from './build-gongfa-data.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const SUB_GONGFA_DATA = [
  // ---- PHÀM GIỚI (Cảnh giới 0 - 8) ----
  {
    id: 's_yinyang_huan',
    name: '阴阳化生诀',
    nameVi: 'Âm Dương Hóa Sinh Quyết',
    type: 'sub',
    quality: 'fine',
    minRealm: 0,
    element: 'wood',
    desc: '调和体内阴阳二气,绵绵滋养脏腑',
    descVi: 'Điều hòa âm dương nhị khí trong cơ thể, miên man nuôi dưỡng tạng phủ',
    baseMods: { maxHpPct: 0.07, qiRegen: 0.08 },
    perLevelMods: { maxHpPct: 0.01, qiRegen: 0.015 },
    branches: [
      { name: '阴生', nameVi: 'Âm Sinh', desc: '阴气内藏,气血悠长', descVi: 'Âm khí nội tàng, khí huyết lâu dài' },
      { name: '阳化', nameVi: 'Dương Hóa', desc: '阳气运转,筋骨坚稳', descVi: 'Dương khí vận chuyển, gân cốt vững chãi' }
    ]
  },
  {
    id: 's_jingang_gu',
    name: '金骨锻玉篇',
    nameVi: 'Kim Cốt Đoán Ngọc Thiên',
    type: 'sub',
    quality: 'fine',
    minRealm: 0,
    element: 'metal',
    desc: '以内息打熬骨骼,坚实如铁似玉',
    descVi: 'Dùng nội tức tôi luyện xương cốt, cứng chắc như sắt tựa ngọc',
    baseMods: { defensePct: 0.06, maxHpPct: 0.05 },
    perLevelMods: { defensePct: 0.01, maxHpPct: 0.008 },
    branches: [
      { name: '铁甲', nameVi: 'Thiết Giáp', desc: '周身骨硬,御力沉凝', descVi: 'Xương cốt cứng rắn, lực thủ trầm ngưng' },
      { name: '玉髓', nameVi: 'Ngọc Tủy', desc: '骨生微玉,体魄自壮', descVi: 'Xương sinh ngọc mịn, thể phách tự cường' }
    ]
  },
  {
    id: 's_chiyan_dun',
    name: '赤炎游身步',
    nameVi: 'Xích Viêm Du Thân Bộ',
    type: 'sub',
    quality: 'fine',
    minRealm: 0,
    element: 'fire',
    desc: '步走离位,足下火生,游走若烈焰闪动',
    descVi: 'Bước theo quẻ Ly, dưới chân sinh lửa, di chuyển tựa ánh lửa chập chờn',
    baseMods: { speed: 0.05, dodgeRate: 0.02 },
    perLevelMods: { speed: 0.006, dodgeRate: 0.004 },
    branches: [
      { name: '疾焰', nameVi: 'Tật Viêm', desc: '火影闪现,避害从容', descVi: 'Hỏa ảnh chớp giật, tránh hiểm thong dong' },
      { name: '灼足', nameVi: 'Chước Túc', desc: '热浪逼人,攻守自若', descVi: 'Khí nóng bức người, công thủ tự nhiên' }
    ]
  },
  {
    id: 's_houting',
    name: '听泉凝神引',
    nameVi: 'Thính Tuyền Ngưng Thần Dẫn',
    type: 'sub',
    quality: 'fine',
    minRealm: 0,
    element: 'water',
    desc: '聆听泉流清韵以养灵识,心无旁骛',
    descVi: 'Lắng nghe suối reo thanh vận tĩnh dưỡng linh thức, tâm không tạp niệm',
    baseMods: { qiRegen: 0.1, eventLuck: 0.04 },
    perLevelMods: { qiRegen: 0.02, eventLuck: 0.008 },
    branches: [
      { name: '清心', nameVi: 'Thanh Tâm', desc: '明澈澄静,元气顺畅', descVi: 'Trong sáng thanh tịnh, nguyên khí thông suốt' },
      { name: '灵耳', nameVi: 'Linh Nhĩ', desc: '见微知著,处世明察', descVi: 'Thấy nhỏ biết lớn, hiểu thấu vạn vật' }
    ]
  },
  {
    id: 's_houti_jue',
    name: '厚土培元功',
    nameVi: 'Hậu Thổ Bồi Nguyên Công',
    type: 'sub',
    quality: 'fine',
    minRealm: 0,
    element: 'earth',
    desc: '引地脉厚土之温气培固丹田,厚重端正',
    descVi: 'Dẫn khí ấm Hậu Thổ địa mạch củng cố đan điền, đôn hậu đoan chính',
    baseMods: { maxHpPct: 0.08, alchemyYield: 0.08 },
    perLevelMods: { maxHpPct: 0.012, alchemyYield: 0.015 },
    branches: [
      { name: '深根', nameVi: 'Thâm Căn', desc: '根基稳如巨木,耐受风雨', descVi: 'Căn cơ vững như cây lớn, chịu đựng mưa gió' },
      { name: '沃壤', nameVi: 'Ốc Nhưỡng', desc: '气机滋养灵材,获益颇丰', descVi: 'Khí cơ nuôi dưỡng linh tài, thu hoạch dồi dào' }
    ]
  },
  {
    id: 's_feixing',
    name: '追星逐日步',
    nameVi: 'Truy Tinh Trục Nhật Bộ',
    type: 'sub',
    quality: 'excellent',
    minRealm: 1,
    desc: '脚踏星斗之位,身形快若追星逐日',
    descVi: 'Chân đạp phương vị tinh tú, thân hình nhanh tựa đuổi sao bắt trăng',
    baseMods: { speed: 0.06, explorationSpeed: 0.08 },
    perLevelMods: { speed: 0.007, explorationSpeed: 0.015 },
    branches: [
      { name: '踏斗', nameVi: 'Đạp Đẩu', desc: '足踏天罡,避其锐气', descVi: 'Chân đạp thiên cương, tránh mũi nhọn địch' },
      { name: '远游', nameVi: 'Viễn Du', desc: '身游四方,搜罗灵奇', descVi: 'Thân du bốn phương, tìm kiếm kỳ trân' }
    ]
  },
  {
    id: 's_cuiyu',
    name: '翠竹守心诀',
    nameVi: 'Thúy Trúc Thủ Tâm Quyết',
    type: 'sub',
    quality: 'excellent',
    minRealm: 1,
    element: 'wood',
    desc: '取劲竹经霜不折之意,修御敌守心之法',
    descVi: 'Lấy ý tứ trúc xanh dầm sương không gãy, tu tập pháp môn thủ tâm phòng ngự',
    baseMods: { defensePct: 0.06, damageReduction: 0.04 },
    perLevelMods: { defensePct: 0.01, damageReduction: 0.006 },
    branches: [
      { name: '坚韧', nameVi: 'Kiên Nhẫn', desc: '劲节如铁,强力难伤', descVi: 'Đốt tre như sắt, lực mạnh khó hại' },
      { name: '回柔', nameVi: 'Hồi Nhu', desc: '柔劲卸力,守御从容', descVi: 'Nhu kình hóa giải, phòng thủ thong dong' }
    ]
  },
  {
    id: 's_lingyu',
    name: '灵雨滋养术',
    nameVi: 'Linh Vũ Tư Dưỡng Thuật',
    type: 'sub',
    quality: 'excellent',
    minRealm: 1,
    element: 'water',
    desc: '凝雨露之水汽以灌体培元,滋养身心',
    descVi: 'Ngưng tụ hơi nước mưa móc rót vào cơ thể, tẩm bổ thân tâm',
    baseMods: { alchemyYield: 0.12, qiRegen: 0.12 },
    perLevelMods: { alchemyYield: 0.02, qiRegen: 0.02 },
    branches: [
      { name: '甘露', nameVi: 'Cam Lộ', desc: '雨润百草,采撷充盈', descVi: 'Mưa nhuận trăm cỏ, hái lượm dồi dào' },
      { name: '滋元', nameVi: 'Tư Nguyên', desc: '流水润气,回元有度', descVi: 'Nước chảy nhuận khí, hồi nguyên đều đặn' }
    ]
  },
  {
    id: 's_liehuo_ti',
    name: '烈火百炼法',
    nameVi: 'Liệt Hỏa Bách Luyện Pháp',
    type: 'sub',
    quality: 'excellent',
    minRealm: 1,
    element: 'fire',
    desc: '引地心火意熔炼精金顽矿,增强臂力杀伐',
    descVi: 'Dẫn hỏa ý lòng đất nung chảy tinh kim quặng sắt, tăng cường cánh tay sát phạt',
    baseMods: { attackPct: 0.08, forgeDiscount: 0.12 },
    perLevelMods: { attackPct: 0.012, forgeDiscount: 0.02 },
    branches: [
      { name: '熔煞', nameVi: 'Dung Sát', desc: '烈火化煞,剑气凌厉', descVi: 'Lửa mạnh tan sát, kiếm khí lăng lệ' },
      { name: '开山', nameVi: 'Khai Sơn', desc: '神力开石,掘金得宝', descVi: 'Thần lực mở đá, đào quặng tìm báu' }
    ]
  },
  {
    id: 's_chensha',
    name: '沉沙御土真诀',
    nameVi: 'Trầm Sa Ngự Thổ Chân Quyết',
    type: 'sub',
    quality: 'excellent',
    minRealm: 1,
    element: 'earth',
    desc: '聚沉沙厚土以为壁垒,立如重山',
    descVi: 'Gom tụ cát lắng đất dày làm hàng rào, đứng sừng sững như núi non',
    baseMods: { defensePct: 0.08, maxHpPct: 0.06 },
    perLevelMods: { defensePct: 0.012, maxHpPct: 0.01 },
    branches: [
      { name: '壁垒', nameVi: 'Bích Lũy', desc: '重砂如墙,御敌御坚', descVi: 'Cát nặng tựa tường, ngăn địch kiên cố' },
      { name: '固原', nameVi: 'Cố Nguyên', desc: '血气如磐,不拔不移', descVi: 'Huyết khí như bàn thạch, không lay không chuyển' }
    ]
  },
  {
    id: 's_fengxing',
    name: '罡风护体术',
    nameVi: 'Cương Phong Hộ Thể Thuật',
    type: 'sub',
    quality: 'spirit',
    minRealm: 2,
    element: 'wind',
    desc: '引九天罡风环绕周身,削弱敌势,身若飞絮',
    descVi: 'Dẫn cửu thiên cương phong vây quanh thân thể, suy yếu thế địch, thân nhẹ tựa lông hồng',
    baseMods: { dodgeRate: 0.04, speed: 0.06 },
    perLevelMods: { dodgeRate: 0.006, speed: 0.008 },
    branches: [
      { name: '随风', nameVi: 'Tùy Phong', desc: '风起影动,避害无形', descVi: 'Gió nổi bóng dời, né hiểm vô hình' },
      { name: '旋风', nameVi: 'Toàn Phong', desc: '风罡回护,从容御伤', descVi: 'Gió lốc xoay vòng, thong dong phòng hộ' }
    ]
  },
  {
    id: 's_hanxuan',
    name: '极寒凝霜诀',
    nameVi: 'Cực Hàn Ngưng Sương Quyết',
    type: 'sub',
    quality: 'spirit',
    minRealm: 2,
    element: 'ice',
    desc: '化极寒冰霜之息于体表,凝结一层无形霜甲',
    descVi: 'Hóa cực hàn băng sương tức ngoài cơ thể, ngưng kết một tầng vô hình sương giáp',
    baseMods: { defensePct: 0.09, damageReduction: 0.05 },
    perLevelMods: { defensePct: 0.014, damageReduction: 0.007 },
    branches: [
      { name: '霜铠', nameVi: 'Sương Khải', desc: '冰霜固守,难伤分毫', descVi: 'Băng sương cố thủ, khó tổn phân hào' },
      { name: '凝煞', nameVi: 'Ngưng Sát', desc: '寒气逼退,杀伐自护', descVi: 'Hàn khí bức lùi, sát phạt tự hộ' }
    ]
  },
  {
    id: 's_zixiao_yin',
    name: '紫霄引雷法',
    nameVi: 'Tử Tiêu Dẫn Lôi Pháp',
    type: 'sub',
    quality: 'spirit',
    minRealm: 2,
    element: 'thunder',
    desc: '引一缕紫霄天雷入体,激荡真气,出手狂猛',
    descVi: 'Dẫn một sợi Tử Tiêu thiên lôi vào cơ thể, kích động chân khí, xuất chiêu cuồng mãnh',
    baseMods: { critRate: 0.04, critDamage: 0.12 },
    perLevelMods: { critRate: 0.006, critDamage: 0.02 },
    branches: [
      { name: '雷煞', nameVi: 'Lôi Sát', desc: '雷光四溢,锋芒更甚', descVi: 'Lôi quang tràn ngập, phong mang càng tăng' },
      { name: '惊天', nameVi: 'Kinh Thiên', desc: '雷音震心,破敌心胆', descVi: 'Tiếng sấm kinh tâm, phá vỡ tâm can kẻ địch' }
    ]
  },
  {
    id: 's_guangming_hu',
    name: '阳和神光佑',
    nameVi: 'Dương Hòa Thần Quang Hựu',
    type: 'sub',
    quality: 'spirit',
    minRealm: 2,
    element: 'light',
    desc: '采集正午神光入体,诸邪退避,体质纯阳',
    descVi: 'Thu thập thần quang chính ngọ vào thân, tà ma lui bước, thể chất thuần dương',
    baseMods: { maxHpPct: 0.1, damageReduction: 0.05 },
    perLevelMods: { maxHpPct: 0.015, damageReduction: 0.008 },
    branches: [
      { name: '圣阳', nameVi: 'Thánh Dương', desc: '阳火护身,百毒难侵', descVi: 'Dương hỏa hộ thân, bách độc khó xâm' },
      { name: '纯照', nameVi: 'Thuần Chiếu', desc: '光曜普施,神清气爽', descVi: 'Quang diệu ban phát, thần thanh khí sảng' }
    ]
  },
  {
    id: 's_youming_dun',
    name: '幽冥敛影经',
    nameVi: 'U Minh Liễm Ảnh Kinh',
    type: 'sub',
    quality: 'spirit',
    minRealm: 2,
    element: 'dark',
    desc: '隐匿身形气机于幽暗阴影之中,悄无声息',
    descVi: 'Ẩn nấp thân hình khí tức trong bóng tối u uất, lặng lẽ không một tiếng động',
    baseMods: { dodgeRate: 0.05, luck: 0.05 },
    perLevelMods: { dodgeRate: 0.007, luck: 0.008 },
    branches: [
      { name: '潜影', nameVi: 'Tiềm Ảnh', desc: '如影随形,难测去留', descVi: 'Như hình với bóng, khó dò phương hướng' },
      { name: '暗福', nameVi: 'Ám Phúc', desc: '阴极生吉,偶得奇遇', descVi: 'Âm cực sinh cát, tình cờ gặp kỳ ngộ' }
    ]
  },
  {
    id: 's_lingtai',
    name: '灵台静笃诀',
    nameVi: 'Linh Đài Tĩnh Đốc Quyết',
    type: 'sub',
    quality: 'spirit',
    minRealm: 3,
    desc: '致虚极,守静笃,灵台空明,参道通达',
    descVi: 'Tột cùng hư không, giữ tròn tĩnh lặng, linh đài rỗng sáng, ngộ đạo thông suốt',
    baseMods: { cultivationSpeed: 0.15, breakthroughRate: 0.04 },
    perLevelMods: { cultivationSpeed: 0.02, breakthroughRate: 0.006 },
    branches: [
      { name: '静心', nameVi: 'Tĩnh Tâm', desc: '澄神绝照,修持益稳', descVi: 'Lắng thần chiếu sáng, tu trì vững vàng' },
      { name: '破障', nameVi: 'Phá Chướng', desc: '灵台通明,关卡易渡', descVi: 'Linh đài thông tỏ, cửa ải dễ qua' }
    ]
  },
  {
    id: 's_duanjin',
    name: '百炼断金诀',
    nameVi: 'Bách Luyện Đoạn Kim Quyết',
    type: 'sub',
    quality: 'spirit',
    minRealm: 3,
    element: 'metal',
    desc: '聚金煞锐气淬砺剑锋,开石断玉只在一指之间',
    descVi: 'Gom kim sát sắc bén mài giũa mũi kiếm, xẻ đá cắt ngọc chỉ trong một ngón tay',
    baseMods: { attackPct: 0.1, forgeDiscount: 0.15 },
    perLevelMods: { attackPct: 0.015, forgeDiscount: 0.025 },
    branches: [
      { name: '断金', nameVi: 'Đoạn Kim', desc: '利刃无匹,杀伐摧山', descVi: 'Lưỡi sắc vô song, sát phạt đập tan núi non' },
      { name: '精金', nameVi: 'Tinh Kim', desc: '妙手寻矿,多获灵珍', descVi: 'Diệu thủ tìm quặng, thu nhiều linh trân' }
    ]
  },
  {
    id: 's_wanxiang_mu',
    name: '万象乙木长青诀',
    nameVi: 'Vạn Tượng Ất Mộc Trường Thanh Quyết',
    type: 'sub',
    quality: 'spirit',
    minRealm: 3,
    element: 'wood',
    desc: '以乙木生发之德壮大气海,生机连绵不绝',
    descVi: 'Dùng đức sinh sôi của Ất Mộc bồi đắp khí hải, sinh cơ dạt dào bất tận',
    baseMods: { maxHpPct: 0.12, qiRegen: 0.15 },
    perLevelMods: { maxHpPct: 0.018, qiRegen: 0.025 },
    branches: [
      { name: '长青', nameVi: 'Trường Thanh', desc: '松柏长寿,体健气和', descVi: 'Tùng bách trường thọ, thân khỏe khí hòa' },
      { name: '回春', nameVi: 'Hồi Xuân', desc: '生生之气,元气常沛', descVi: 'Khí sinh sôi, nguyên khí luôn tràn đầy' }
    ]
  },
  {
    id: 's_kanyuan',
    name: '坎水凝煞经',
    nameVi: 'Khảm Thủy Ngưng Sát Kinh',
    type: 'sub',
    quality: 'spirit',
    minRealm: 3,
    element: 'water',
    desc: '引九地渊泉之坎水护持丹田,化解狂暴攻击',
    descVi: 'Dẫn nước Khảm của suối sâu chín tầng đất bảo vệ đan điền, hóa giải đòn đánh hung hãn',
    baseMods: { defensePct: 0.1, damageReduction: 0.06 },
    perLevelMods: { defensePct: 0.015, damageReduction: 0.009 },
    branches: [
      { name: '柔水', nameVi: 'Nhu Thủy', desc: '如水化劲,难损毫发', descVi: 'Tựa nước triệt kình, khó tổn sợi tóc' },
      { name: '深渊', nameVi: 'Thâm Uyên', desc: '渊深不测,守御固实', descVi: 'Vực sâu khôn dò, phòng ngự vững chắc' }
    ]
  },
  {
    id: 's_chiyang_gang',
    name: '赤阳烈罡诀',
    nameVi: 'Xích Dương Liệt Cương Quyết',
    type: 'sub',
    quality: 'spirit',
    minRealm: 3,
    element: 'fire',
    desc: '赤阳烈焰凝为护体天罡,攻守两端皆具暴烈威能',
    descVi: 'Xích Dương liệt diễm ngưng thành hộ thể thiên cương, công thủ song toàn đầy uy lực bạo liệt',
    baseMods: { attackPct: 0.12, critRate: 0.03 },
    perLevelMods: { attackPct: 0.018, critRate: 0.005 },
    branches: [
      { name: '天罡', nameVi: 'Thiên Cương', desc: '纯火如罡,势不可当', descVi: 'Thuần hỏa như cương, khí thế khó cản' },
      { name: '烈爆', nameVi: 'Liệt Bạo', desc: '暴劲迸发,重创顽敌', descVi: 'Kình lực bùng nổ, trọng thương cường địch' }
    ]
  },
  {
    id: 's_huntian_dun',
    name: '混元五行遁法',
    nameVi: 'Hỗn Nguyên Ngũ Hành Độn Pháp',
    type: 'sub',
    quality: 'profound',
    minRealm: 4,
    desc: '依五行生克遁走山川万物,御气如飞',
    descVi: 'Nương theo ngũ hành tương sinh tương khắc độn qua non sông vạn vật, ngự khí như bay',
    baseMods: { speed: 0.08, dodgeRate: 0.06 },
    perLevelMods: { speed: 0.01, dodgeRate: 0.008 },
    branches: [
      { name: '五遁', nameVi: 'Ngũ Độn', desc: '随物化遁,莫可触及', descVi: 'Tùy vật hóa độn, không thể chạm tới' },
      { name: '神行', nameVi: 'Thần Hành', desc: '周天迅步,从容自若', descVi: 'Bước chân mau lẹ, thong dong tự tại' }
    ]
  },
  {
    id: 's_xuanhuang_ti',
    name: '玄黄不灭躯',
    nameVi: 'Huyền Hoàng Bất Diệt Khu',
    type: 'sub',
    quality: 'profound',
    minRealm: 4,
    element: 'earth',
    desc: '吸纳大地玄黄母气铸练体魄,沉稳似神山巍峨',
    descVi: 'Hút nạp Huyền Hoàng mẫu khí của đại địa rèn đúc thể phách, vững chãi tựa thần sơn sừng sững',
    baseMods: { defensePct: 0.14, maxHpPct: 0.14 },
    perLevelMods: { defensePct: 0.02, maxHpPct: 0.02 },
    branches: [
      { name: '玄黄', nameVi: 'Huyền Hoàng', desc: '厚土不灭,金石同寿', descVi: 'Đất dày bất diệt, sống mãi cùng non nước' },
      { name: '岳立', nameVi: 'Nhạc Lập', desc: '巍巍群岳,威压四方', descVi: 'Núi non sừng sững, uy áp bốn phương' }
    ]
  },
  {
    id: 's_leiyin_lian',
    name: '天雷锻骨真经',
    nameVi: 'Thiên Lôi Đoán Cốt Chân Kinh',
    type: 'sub',
    quality: 'profound',
    minRealm: 4,
    element: 'thunder',
    desc: '借云中狂雷震荡经脉气血,破除周身暗伤垢秽',
    descVi: 'Mượn sấm sét trên mây chấn động kinh mạch khí huyết, gột rửa thương tật cặn bã trong người',
    baseMods: { attackPct: 0.14, critRate: 0.05 },
    perLevelMods: { attackPct: 0.02, critRate: 0.007 },
    branches: [
      { name: '雷骨', nameVi: 'Lôi Cốt', desc: '骨铸神雷,出手沉重', descVi: 'Xương đúc thần lôi, xuất chiêu trầm nặng' },
      { name: '震杀', nameVi: 'Chấn Sát', desc: '雷鸣轰烈,破敌护元', descVi: 'Sấm ran dữ dội, phá vỡ hộ nguyên kẻ địch' }
    ]
  },
  {
    id: 's_bingpo_huan',
    name: '冰魄玄灵遁',
    nameVi: 'Băng Phách Huyền Linh Độn',
    type: 'sub',
    quality: 'profound',
    minRealm: 4,
    element: 'ice',
    desc: '以万年玄冰之气隐去身形,踏雪无痕,冷香飘渺',
    descVi: 'Dùng khí vạn năm huyền băng ẩn giấu thân hình, đạp tuyết không vết tích, hương lạnh mịt mùng',
    baseMods: { dodgeRate: 0.06, speed: 0.07 },
    perLevelMods: { dodgeRate: 0.008, speed: 0.009 },
    branches: [
      { name: '冰影', nameVi: 'Băng Ảnh', desc: '残雪化身,敌攻落空', descVi: 'Tàn tuyết hóa thân, đòn địch hụt hẫng' },
      { name: '霜遁', nameVi: 'Sương Độn', desc: '冷霜彻骨,进退皆宜', descVi: 'Sương lạnh thấu xương, tiến thoái đều hay' }
    ]
  },
  {
    id: 's_daming_you',
    name: '大明净心诀',
    nameVi: 'Đại Minh Tĩnh Tâm Quyết',
    type: 'sub',
    quality: 'profound',
    minRealm: 5,
    element: 'light',
    desc: '神光如镜,照彻心扉,令修行无心魔之扰',
    descVi: 'Thần quang như gương, soi tỏ đáy lòng, giúp tu hành không bị tâm ma quấy rầy',
    baseMods: { damageReduction: 0.08, cultivationSpeed: 0.16 },
    perLevelMods: { damageReduction: 0.012, cultivationSpeed: 0.022 },
    branches: [
      { name: '明镜', nameVi: 'Minh Kính', desc: '心无挂碍,安如古井', descVi: 'Tâm không vướng bận, yên ả tựa giếng cổ' },
      { name: '阳曜', nameVi: 'Dương Diệu', desc: '神光普照,修途明朗', descVi: 'Thần quang chiếu khắp, nẻo tu sáng ngời' }
    ]
  },
  {
    id: 's_anming_xie',
    name: '幽煞护神录',
    nameVi: 'U Sát Hộ Thần Lục',
    type: 'sub',
    quality: 'profound',
    minRealm: 5,
    element: 'dark',
    desc: '以九幽阴煞凝聚护神法衣,危难之时愈显凶性',
    descVi: 'Dùng cửu u âm sát ngưng tụ pháp y hộ thần, lúc hiểm nguy càng hiển lộ hung tính',
    baseMods: { lowHpReduction: 0.18, defensePct: 0.12 },
    perLevelMods: { lowHpReduction: 0.025, defensePct: 0.016 },
    branches: [
      { name: '煞衣', nameVi: 'Sát Y', desc: '深煞护命,绝境逢生', descVi: 'Sát khí hộ mạng, trong tuyệt cảnh tìm thấy sự sống' },
      { name: '幽壁', nameVi: 'U Bích', desc: '九幽沉璧,难破半分', descVi: 'Cửu u vách chắn, khó phá nửa phần' }
    ]
  },
  {
    id: 's_tianyi_zhen',
    name: '天乙神木续命经',
    nameVi: 'Thiên Ất Thần Mộc Tục Mệnh Kinh',
    type: 'sub',
    quality: 'profound',
    minRealm: 5,
    element: 'wood',
    desc: '天乙贵人之灵化入百木真气,气血丰足生生不已',
    descVi: 'Linh khí Thiên Ất Quý Nhân hòa vào mộc khí, khí huyết dồi dào sinh sôi không dứt',
    baseMods: { maxHpPct: 0.18, qiRegen: 0.2 },
    perLevelMods: { maxHpPct: 0.025, qiRegen: 0.028 },
    branches: [
      { name: '续命', nameVi: 'Tục Mệnh', desc: '木气化元,血脉充盈', descVi: 'Mộc khí hóa nguyên, huyết mạch dồi dào' },
      { name: '神木', nameVi: 'Thần Mộc', desc: '体若建木,不畏强敌', descVi: 'Thân tựa Kiến Mộc, chẳng sợ cường địch' }
    ]
  },
  {
    id: 's_taixu_gui',
    name: '太虚归元法',
    nameVi: 'Thái Hư Quy Nguyên Pháp',
    type: 'sub',
    quality: 'heaven',
    minRealm: 6,
    desc: '引虚空精气纳于丹田之内,修持吐纳如有神助',
    descVi: 'Dẫn tinh khí hư không nạp vào đan điền, tu trì thổ nạp như có thần trợ giúp',
    baseMods: { cultivationSpeed: 0.2, qiRegen: 0.25 },
    perLevelMods: { cultivationSpeed: 0.03, qiRegen: 0.035 },
    branches: [
      { name: '归元', nameVi: 'Quy Nguyên', desc: '百川归海,修为日进', descVi: 'Trăm sông về biển, tu vi tiến triển từng ngày' },
      { name: '虚空', nameVi: 'Hư Không', desc: '身如太虚,元气沛然', descVi: 'Thân tựa thái hư, nguyên khí tràn trề' }
    ]
  },
  {
    id: 's_jiuxiao_yu',
    name: '九霄御罡真经',
    nameVi: 'Cửu Tiêu Ngự Cương Chân Kinh',
    type: 'sub',
    quality: 'heaven',
    minRealm: 6,
    element: 'wind',
    desc: '炼就九天罡风为本命风羽,翱翔天地,随风破浪',
    descVi: 'Luyện thành chín tầng cương phong làm lông vũ bản mệnh, bay lượn trời đất cưỡi gió đạp sóng',
    baseMods: { speed: 0.09, dodgeRate: 0.07 },
    perLevelMods: { speed: 0.012, dodgeRate: 0.01 },
    branches: [
      { name: '风羽', nameVi: 'Phong Vũ', desc: '展翼扶摇,绝尘难追', descVi: 'Tung cánh vút cao, bụi trần khôn đuổi' },
      { name: '御空', nameVi: 'Ngự Không', desc: '罡风蔽体,避敌锋刃', descVi: 'Cương phong che thân, tránh né mũi nhọn địch' }
    ]
  },
  {
    id: 's_zhenhai_ling',
    name: '镇海伏波玄录',
    nameVi: 'Trấn Hải Phục Ba Huyền Lục',
    type: 'sub',
    quality: 'heaven',
    minRealm: 7,
    element: 'water',
    desc: '如定海神铁镇压巨浪波澜,任敌狂攻我自巍然',
    descVi: 'Tựa gậy định hải thần thiết trấn áp sóng to bão lớn, mặc địch cuồng công ta vẫn sừng sững',
    baseMods: { defensePct: 0.18, damageReduction: 0.1 },
    perLevelMods: { defensePct: 0.025, damageReduction: 0.014 },
    branches: [
      { name: '平波', nameVi: 'Bình Ba', desc: '浪止风停,泰然自若', descVi: 'Sóng lặn gió dừng, thản nhiên tự tại' },
      { name: '定海', nameVi: 'Định Hải', desc: '重如深海,万力难移', descVi: 'Nặng tựa biển sâu, vạn lực khôn lay' }
    ]
  },
  {
    id: 's_nanming_ti',
    name: '南明离火真罡',
    nameVi: 'Nam Minh Ly Hỏa Chân Cương',
    type: 'sub',
    quality: 'heaven',
    minRealm: 7,
    element: 'fire',
    desc: '修练南明神雀本源神火,烈罡一出,焚尽八荒',
    descVi: 'Tu luyện thần hỏa bản nguyên thần tước Nam Minh, liệt cương vừa ra thiêu sạch bát hoang',
    baseMods: { attackPct: 0.2, critRate: 0.06 },
    perLevelMods: { attackPct: 0.028, critRate: 0.009 },
    branches: [
      { name: '离火', nameVi: 'Ly Hỏa', desc: '雀炎炽烈,杀敌焚身', descVi: 'Lửa chim tước bừng cháy, diệt địch thiêu thân' },
      { name: '南明', nameVi: 'Nam Minh', desc: '神火如罡,势不可挡', descVi: 'Thần hỏa như cương, khí thế khó cản' }
    ]
  },
  {
    id: 's_dahuang_gu',
    name: '大荒霸岳炼魄经',
    nameVi: 'Đại Hoang Bá Nhạc Luyện Phách Kinh',
    type: 'sub',
    quality: 'heaven',
    minRealm: 8,
    element: 'earth',
    desc: '吞吐大荒山岳精气以铸神魄,体若古岳,气若洪荒',
    descVi: 'Hút nhả tinh khí non cao Đại Hoang đúc luyện thần phách, thân tựa núi cổ, khí tựa hồng hoang',
    baseMods: { damageReduction: 0.1, speed: 0.05, breakthroughRate: 0.04 },
    perLevelMods: { damageReduction: 0.012, speed: 0.006, breakthroughRate: 0.005 },
    branches: [
      { name: '霸岳', nameVi: 'Bá Nhạc', desc: '山岳之躯,固若金汤', descVi: 'Thân hình non núi, kiên cố vững vàng' },
      { name: '洪荒', nameVi: 'Hồng Hoang', desc: '力沉气足,反震敌势', descVi: 'Lực trầm khí đủ, dội ngược đòn địch' }
    ]
  },
  {
    id: 's_wuji_ling',
    name: '周天无极护元经',
    nameVi: 'Chu Thiên Vô Cực Hộ Nguyên Kinh',
    type: 'sub',
    quality: 'heaven',
    minRealm: 8,
    desc: '运转周天无极之数护住真元,百战不殆',
    descVi: 'Vận hành số Chu Thiên Vô Cực bảo vệ chân nguyên, trăm trận không nguy',
    baseMods: { damageReduction: 0.12, breakthroughRate: 0.06 },
    perLevelMods: { damageReduction: 0.016, breakthroughRate: 0.009 },
    branches: [
      { name: '护元', nameVi: 'Hộ Nguyên', desc: '真元坚实,气贯长虹', descVi: 'Chân nguyên vững chắc, khí quán cầu vồng' },
      { name: '周天', nameVi: 'Chu Thiên', desc: '生生相生,万劫安然', descVi: 'Sinh sôi nương tựa, vạn kiếp bình an' }
    ]
  },

  // ---- TIÊN GIỚI (Cảnh giới 9 - 13) ----
  // Yêu cầu chữ ấn ký: '仙', '云', '玉', '瑶', '星', '虚', '太', '罗', '雷'
  {
    id: 's_xianyun_bu',
    name: '仙云凌虚踏浪步',
    nameVi: 'Tiên Vân Lăng Hư Đạp Lãng Bộ',
    type: 'sub',
    quality: 'immortal',
    minRealm: 9,
    element: 'wind',
    desc: '足踏仙云,凌虚步月,瞬息千万里',
    descVi: 'Chân đạp mây tiên, lướt cõi hư không, chớp mắt ngàn vạn dặm',
    baseMods: { speed: 0.1, explorationSpeed: 0.18 },
    perLevelMods: { speed: 0.014, explorationSpeed: 0.025 },
    branches: [
      { name: '凌虚', nameVi: 'Lăng Hư', desc: '仙步绝尘,避险于前', descVi: 'Tiên bộ tuyệt trần, né tránh hiểm nguy từ sớm' },
      { name: '踏云', nameVi: 'Đạp Vân', desc: '云游仙界,探宝自如', descVi: 'Dạo mây cõi tiên, tìm báu tự tại' }
    ]
  },
  {
    id: 's_yutang_chun',
    name: '玉虚生生回春诀',
    nameVi: 'Ngọc Hư Sinh Sinh Hồi Xuân Quyết',
    type: 'sub',
    quality: 'immortal',
    minRealm: 9,
    element: 'wood',
    desc: '采玉虚神峰之灵木生机,枯木亦能生白骨',
    descVi: 'Hái sinh cơ linh mộc đỉnh Ngọc Hư, cây khô cũng có thể mọc lại xương thịt',
    baseMods: { maxHpPct: 0.22, alchemyYield: 0.22 },
    perLevelMods: { maxHpPct: 0.032, alchemyYield: 0.03 },
    branches: [
      { name: '玉生', nameVi: 'Ngọc Sinh', desc: '体生玉骨,寿数绵延', descVi: 'Người sinh ngọc cốt, tuổi thọ kéo dài' },
      { name: '生荣', nameVi: 'Sinh Vinh', desc: '仙草灵药,采撷倍增', descVi: 'Cỏ tiên thuốc quý, hái lượm gấp bội' }
    ]
  },
  {
    id: 's_yaochi_lian',
    name: '瑶池玉露涤魂真法',
    nameVi: 'Dao Trì Ngọc Lộ Địch Hồn Chân Pháp',
    type: 'sub',
    quality: 'immortal',
    minRealm: 10,
    element: 'water',
    desc: '引九天瑶池仙露洗涤神魂灵台,清心明智',
    descVi: 'Dẫn sương tiên Dao Trì chín tầng trời gột rửa thần hồn linh đài, thanh tâm sáng trí',
    baseMods: { qiRegen: 0.3, cultivationSpeed: 0.22 },
    perLevelMods: { qiRegen: 0.04, cultivationSpeed: 0.032 },
    branches: [
      { name: '玉露', nameVi: 'Ngọc Lộ', desc: '甘露润神,吐纳无滞', descVi: 'Sương ngọt nhuận thần, thổ nạp không vướng' },
      { name: '涤魂', nameVi: 'Địch Hồn', desc: '灵台澄明,悟法通幽', descVi: 'Linh đài trong sáng, ngộ pháp thấu sâu' }
    ]
  },
  {
    id: 's_taihe_leigang',
    name: '太虚神雷铸仙骨',
    nameVi: 'Thái Hư Thần Lôi Chú Tiên Cốt',
    type: 'sub',
    quality: 'immortal',
    minRealm: 10,
    element: 'thunder',
    desc: '以太虚混沌天雷淬砺仙人体魄,肉身可抗天劫',
    descVi: 'Dùng thiên lôi Thái Hư rèn luyện thể phách tiên nhân, thân thể kháng được thiên kiếp',
    baseMods: { defensePct: 0.22, attackPct: 0.18 },
    perLevelMods: { defensePct: 0.032, attackPct: 0.026 },
    branches: [
      { name: '雷魄', nameVi: 'Lôi Phách', desc: '神雷护骨,万法难损', descVi: 'Thần lôi hộ cốt, vạn pháp khó làm tổn thương' },
      { name: '太虚', nameVi: 'Thái Hư', desc: '雷威外化,克敌无前', descVi: 'Uy lôi phát tác ra ngoài, khắc địch không lui' }
    ]
  },
  {
    id: 's_xinghai_you',
    name: '星海遨游御虚经',
    nameVi: 'Tinh Hải Ngao Du Ngự Hư Kinh',
    type: 'sub',
    quality: 'immortal',
    minRealm: 11,
    desc: '化周天星光为护身遁光,横渡星海太虚',
    descVi: 'Hóa ánh sao khắp trời thành hào quang độn thân hộ thể, vượt qua biển sao thái hư',
    baseMods: { speed: 0.11, dodgeRate: 0.08 },
    perLevelMods: { speed: 0.015, dodgeRate: 0.012 },
    branches: [
      { name: '星光', nameVi: 'Tinh Quang', desc: '星芒闪烁,规避百杀', descVi: 'Ánh sao lấp lánh, tránh né muôn bề sát phạt' },
      { name: '游虚', nameVi: 'Du Hư', desc: '太虚漫步,御风绝尘', descVi: 'Thái hư dạo bước, đón gió tuyệt trần' }
    ]
  },
  {
    id: 's_luotian_gang',
    name: '罗天仙霞固本诀',
    nameVi: 'La Thiên Tiên Hà Cố Bổn Quyết',
    type: 'sub',
    quality: 'immortal',
    minRealm: 11,
    desc: '采大罗天外七彩仙霞凝固命宫,气血坚牢如天壁',
    descVi: 'Hái ráng tiên bảy màu ngoài cõi Đại La củng cố mệnh cung, khí huyết kiên cố tựa tường trời',
    baseMods: { damageReduction: 0.14, maxHpPct: 0.25 },
    perLevelMods: { damageReduction: 0.02, maxHpPct: 0.035 },
    branches: [
      { name: '仙霞', nameVi: 'Tiên Hà', desc: '云霞蔽日,伤损自消', descVi: 'Mây ráng che trời, thương tổn tự tan' },
      { name: '固本', nameVi: 'Cố Bổn', desc: '金汤之固,稳立不倾', descVi: 'Kiên cố vững vàng, đứng mãi không nghiêng' }
    ]
  },
  {
    id: 's_xianfeng_dun',
    name: '太乙仙风逐月步',
    nameVi: 'Thái Ất Tiên Phong Trục Nguyệt Bộ',
    type: 'sub',
    quality: 'immortal',
    minRealm: 13,
    element: 'wind',
    desc: '太乙清风环身,一步跨出便达月明之境',
    descVi: 'Thanh phong Thái Ất quấn quanh người, một bước phóng ra liền tới cõi trăng sáng',
    baseMods: { speed: 0.12, dodgeRate: 0.09 },
    perLevelMods: { speed: 0.016, dodgeRate: 0.012 },
    branches: [
      { name: '太乙', nameVi: 'Thái Ất', desc: '清风随行,进退如意', descVi: 'Gió mát theo cùng, tiến thoái như ý' },
      { name: '追月', nameVi: 'Truy Nguyệt', desc: '身如皓月,难寻真容', descVi: 'Thân tựa vầng trăng, khó tìm chân ảnh' }
    ]
  },
  {
    id: 's_yulian_bing',
    name: '玉华玄冰凝魄经',
    nameVi: 'Ngọc Hoa Huyền Băng Ngưng Phách Kinh',
    type: 'sub',
    quality: 'immortal',
    minRealm: 12,
    element: 'ice',
    desc: '寒玉凝魄,仙躯内外冰心无垢,不堕凡尘',
    descVi: 'Hàn ngọc ngưng phách, trong ngoài thân tiên băng tâm không chút bụi bẩn, không rơi phàm trần',
    baseMods: { defensePct: 0.24, damageReduction: 0.15 },
    perLevelMods: { defensePct: 0.035, damageReduction: 0.022 },
    branches: [
      { name: '冰魄', nameVi: 'Băng Phách', desc: '玉骨冰肌,坚若神晶', descVi: 'Xương ngọc da băng, cứng tựa pha lê' },
      { name: '寒华', nameVi: 'Hàn Hoa', desc: '寒气逼人,敌意难侵', descVi: 'Hàn khí bức người, địch ý khôn phạm' }
    ]
  },
  {
    id: 's_yaoguang_ming',
    name: '星瑶万灵引真经',
    nameVi: 'Tinh Dao Vạn Linh Dẫn Chân Kinh',
    type: 'sub',
    quality: 'immortal',
    minRealm: 13,
    desc: '汇聚诸天星宿与瑶台仙真气象,福泽常驻',
    descVi: 'Hội tụ khí tượng chư thiên tinh tú và tiên chân đài Dao Trì, phúc trạch thường còn',
    baseMods: { eventLuck: 0.15, luck: 0.15 },
    perLevelMods: { eventLuck: 0.02, luck: 0.02 },
    branches: [
      { name: '星运', nameVi: 'Tinh Vận', desc: '吉宿高照,百祸不临', descVi: 'Sao lành chiếu rọi, trăm họa không tới' },
      { name: '仙佑', nameVi: 'Tiên Hựu', desc: '仙真垂青,遇事逢吉', descVi: 'Tiên chân đoái thương, gặp việc hóa lành' }
    ]
  },
  {
    id: 's_xianluo_gang',
    name: '仙罗周天护体罡',
    nameVi: 'Tiên La Chu Thiên Hộ Thể Cương',
    type: 'sub',
    quality: 'immortal',
    minRealm: 13,
    desc: '以仙罗万重神霞护体,立于不败之地',
    descVi: 'Dùng vạn tầng ráng thần Tiên La hộ thể, đứng ở thế bất bại',
    baseMods: { defensePct: 0.26, maxHpPct: 0.28 },
    perLevelMods: { defensePct: 0.038, maxHpPct: 0.04 },
    branches: [
      { name: '罗天', nameVi: 'La Thiên', desc: '大罗罡气,固若天门', descVi: 'Cương khí Đại La, kiên cố tựa cửa trời' },
      { name: '仙体', nameVi: 'Tiên Thể', desc: '血肉通仙,无生无灭', descVi: 'Máu thịt thành tiên, không sinh không diệt' }
    ]
  },

  // ---- THẦN GIỚI (Cảnh giới 14 - 17) ----
  // Yêu cầu chữ ấn ký: '神', '帝', '王', '冕', '诏', '法', '则'
  {
    id: 's_shendi_bahuang',
    name: '神帝御天不灭功',
    nameVi: 'Thần Đế Ngự Thiên Bất Diệt Công',
    type: 'sub',
    quality: 'divine',
    minRealm: 14,
    desc: '修持上古神帝不灭至尊道法,神威盖世',
    descVi: 'Tu trì đạo pháp chí tôn bất diệt của thần đế thượng cổ, thần uy che khắp thế gian',
    baseMods: { defensePct: 0.28, maxHpPct: 0.3 },
    perLevelMods: { defensePct: 0.04, maxHpPct: 0.042 },
    branches: [
      { name: '帝躯', nameVi: 'Đế Khu', desc: '神躯无铸,诸法难侵', descVi: 'Thần躯 đúc thành, chư pháp khó xâm' },
      { name: '神尊', nameVi: 'Thần Tôn', desc: '威严具足,强力自消', descVi: 'Uy nghiêm đầy đủ, sức mạnh tự tan' }
    ]
  },
  {
    id: 's_shenwang_su',
    name: '神王定界玄金体',
    nameVi: 'Thần Vương Định Giới Huyền Kim Thể',
    type: 'sub',
    quality: 'divine',
    minRealm: 14,
    element: 'metal',
    desc: '化诸界神金铸入神体,一拳可撼天地山河',
    descVi: 'Hóa thần kim các giới đúc vào thần thể, một quyền làm lay động đất trời non sông',
    baseMods: { attackPct: 0.28, forgeDiscount: 0.3 },
    perLevelMods: { attackPct: 0.04, forgeDiscount: 0.04 },
    branches: [
      { name: '定界', nameVi: 'Định Giới', desc: '神力开天,诛灭强敌', descVi: 'Thần lực mở trời, tru diệt cường địch' },
      { name: '金躯', nameVi: 'Kim Khu', desc: '玄金成体,珍宝自得', descVi: 'Huyền kim thành thể, trân bảo tự có' }
    ]
  },
  {
    id: 's_faze_wansheng',
    name: '法则万物生息录',
    nameVi: 'Pháp Tắc Vạn Vật Sinh Tức Lục',
    type: 'sub',
    quality: 'divine',
    minRealm: 15,
    element: 'wood',
    desc: '参悟天地生命法则本源,神躯生机如瀚海奔流',
    descVi: 'Lĩnh ngộ quy luật sự sống cội nguồn đất trời, sinh cơ thần thể tựa biển rộng cuộn trào',
    baseMods: { maxHpPct: 0.32, qiRegen: 0.35 },
    perLevelMods: { maxHpPct: 0.045, qiRegen: 0.05 },
    branches: [
      { name: '生机', nameVi: 'Sinh Cơ', desc: '法则长存,气血无休', descVi: 'Quy luật trường tồn, khí huyết không nghỉ' },
      { name: '复始', nameVi: 'Phục Thủy', desc: '枯荣自化,元气丰沛', descVi: 'Héo tốt tự chuyển, nguyên khí dồi dào' }
    ]
  },
  {
    id: 's_diwang_leiting',
    name: '帝王神诏天雷罡',
    nameVi: 'Đế Vương Thần Chiếu Thiên Lôi Cương',
    type: 'sub',
    quality: 'divine',
    minRealm: 17,
    element: 'thunder',
    desc: '奉万神帝王神诏号令诸天神雷,雷罡暴烈绝伦',
    descVi: 'Vâng thần chiếu Đế Vương muôn thần hiệu triệu thiên lôi chư thiên, lôi cương hung bạo tuyệt luân',
    baseMods: { critRate: 0.08, critDamage: 0.25 },
    perLevelMods: { critRate: 0.012, critDamage: 0.035 },
    branches: [
      { name: '天诏', nameVi: 'Thiên Chiếu', desc: '雷奉帝敕,中者无生', descVi: 'Lôi phụng đế sắc, trúng đòn khó sống' },
      { name: '帝威', nameVi: 'Đế Uy', desc: '神王重铠,诛邪荡煞', descVi: 'Thần vương giáp nặng, trừ tà quét sát' }
    ]
  },
  {
    id: 's_shenmian_feng',
    name: '法冕乘风御界步',
    nameVi: 'Pháp Mão Thừa Phong Ngự Giới Bộ',
    type: 'sub',
    quality: 'divine',
    minRealm: 16,
    element: 'wind',
    desc: '头戴天地法冕,御万界虚风跨界而行',
    descVi: 'Đầu đội mũ pháp trời đất, cưỡi gió hư không vạn giới vượt giới mà đi',
    baseMods: { speed: 0.14, dodgeRate: 0.1 },
    perLevelMods: { speed: 0.02, dodgeRate: 0.015 },
    branches: [
      { name: '御界', nameVi: 'Ngự Giới', desc: '跨界无阻,神影莫寻', descVi: 'Vượt cõi không cản, thần ảnh khôn tìm' },
      { name: '神冕', nameVi: 'Thần Mão', desc: '法度森严,避凶无碍', descVi: 'Pháp độ nghiêm minh, tránh hung không ngại' }
    ]
  },
  {
    id: 's_shendi_yuhun',
    name: '神帝净元固魄典',
    nameVi: 'Thần Đế Tịnh Nguyên Cố Phách Điển',
    type: 'sub',
    quality: 'divine',
    minRealm: 17,
    desc: '以神帝至高神力凝铸元神真魄,坚不可摧',
    descVi: 'Dùng thần lực tối cao của Thần Đế ngưng đúc nguyên thần chân phách, cứng không thể phá',
    baseMods: { damageReduction: 0.18, breakthroughRate: 0.08 },
    perLevelMods: { damageReduction: 0.025, breakthroughRate: 0.012 },
    branches: [
      { name: '固魄', nameVi: 'Cố Phách', desc: '元神如金,不可摇动', descVi: 'Nguyên thần như vàng, không thể lay động' },
      { name: '通天', nameVi: 'Thông Thiên', desc: '冲破关隘,成就帝道', descVi: 'Phá vỡ bình phong, thành tựu đế đạo' }
    ]
  },

  // ---- HỖN ĐỘN HẢI (Cảnh giới 18 - 20) ----
  // Yêu cầu chữ ấn ký: '混', '沌', '鸿', '蒙', '本', '源', '真', '灵', '无', '极', '开', '道', '界', '神', '魔'
  {
    id: 's_hongmeng_ti',
    name: '鸿蒙混沌万劫不磨体',
    nameVi: 'Hồng Mông Hỗn Độn Vạn Kiếp Bất Ma Thể',
    type: 'sub',
    quality: 'divine',
    minRealm: 18,
    element: 'chaos',
    desc: '以鸿蒙未开之混沌本源铸体,万劫临身而不坏',
    descVi: 'Dùng cội nguồn hỗn độn lúc hồng mông chưa phân đúc thể, vạn kiếp ập tới cũng không hư',
    baseMods: { maxHpPct: 0.38, defensePct: 0.35 },
    perLevelMods: { maxHpPct: 0.05, defensePct: 0.048 },
    branches: [
      { name: '不磨', nameVi: 'Bất Ma', desc: '肉身化界,永存不灭', descVi: 'Thân xác hóa cõi, vĩnh viễn không tắt' },
      { name: '混元', nameVi: 'Hỗn Nguyên', desc: '气融混沌,诸伤化解', descVi: 'Khí hòa hỗn độn, các vết thương tự tiêu' }
    ]
  },
  {
    id: 's_kaitian_yuan',
    name: '开天道源玄罡气',
    nameVi: 'Khai Thiên Đạo Nguyên Huyền Cương Khí',
    type: 'sub',
    quality: 'divine',
    minRealm: 19,
    element: 'chaos',
    desc: '蕴藏开天辟地之第一缕道源真气,玄罡破万物',
    descVi: 'Chứa đựng luồng chân khí đạo nguyên đầu tiên khi khai thiên lập địa, huyền cương phá vạn vật',
    baseMods: { damageReduction: 0.22, attackPct: 0.32 },
    perLevelMods: { damageReduction: 0.03, attackPct: 0.045 },
    branches: [
      { name: '道源', nameVi: 'Đạo Nguyên', desc: '一气生化,无可争锋', descVi: 'Một khí sinh thành, không gì tranh phong' },
      { name: '开天', nameVi: 'Khai Thiên', desc: '锋芒辟易,镇压诸天', descVi: 'Mũi nhọn mở lối, trấn áp chư thiên' }
    ]
  },
  {
    id: 's_wuji_wanshen',
    name: '无极混沌万神长生经',
    nameVi: 'Vô Cực Hỗn Độn Vạn Thần Trường Sinh Kinh',
    type: 'sub',
    quality: 'divine',
    minRealm: 20,
    element: 'chaos',
    desc: '身化混沌万象,与道同寿,历万劫而不灭',
    descVi: 'Thân hóa vạn tượng hỗn độn, thọ cùng đạo trời, trải qua vạn kiếp bất diệt',
    baseMods: { cultivationSpeed: 0.35, qiRegen: 0.35, maxHpPct: 0.32 },
    perLevelMods: { cultivationSpeed: 0.04, qiRegen: 0.04, maxHpPct: 0.03 },
    branches: [
      { name: '长生', nameVi: 'Trường Sinh', desc: '同道长存,造化无尽', descVi: 'Cùng đạo trường tồn, tạo hóa vô tận' },
      { name: '神化', nameVi: 'Thần Hóa', desc: '归于虚无,万法归心', descVi: 'Quy về hư vô, vạn pháp quy tâm' }
    ]
  }
]
