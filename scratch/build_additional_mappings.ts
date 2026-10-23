import { GONGFA } from '../src/data/gongfa'
import { GONGFA_BRANCHES } from '../src/data/gongfaBranches'
import { REGIONS } from '../src/data/regions'
import { MANSIONS, IMAGES } from '../src/data/xiangxiu'
import * as fs from 'fs'

export const GONGFA_NAME_MAP: Record<string, string> = {
  '太玄引气诀': 'Thái Huyền Dẫn Khí Quyết',
  '青木长生功': 'Thanh Mộc Trường Sinh Công',
  '离火焚天诀': 'Ly Hỏa Phần Thiên Quyết',
  '玄水凝真经': 'Huyền Thủy Ngưng Chân Kinh',
  '庚金剑典': 'Canh Kim Kiếm Điển',
  '厚土不动明王功': 'Hậu Thổ Bất Động Minh Vương Công',
  '紫霄神雷诀': 'Tử Tiêu Thần Lôi Quyết',
  '罡风渡虚法': 'Cương Phong Độ Hư Pháp',
  '玄冰道典': 'Huyền Băng Đạo Điển',
  '大光明普照经': 'Đại Quang Minh Phổ Chiếu Kinh',
  '幽冥噬魂录': 'U Minh Phệ Hồn Lục',
  '混沌一气功': 'Hỗn Độn Nhất Khí Công',
  '九霄渡劫经': 'Cửu Tiêu Độ Kiếp Kinh',
  '太虚炼神篇': 'Thái Hư Luyện Thần Thiên',
  '无量寿光经': 'Vô Lượng Thọ Quang Kinh',
  '龟灵吐纳术': 'Quy Linh Thổ Nạp Thuật',
  '百炼锻体术': 'Bách Luyện Đoán Thể Thuật',
  '御风步': 'Ngự Phong Bộ',
  '敛息诀': 'Liễm Tức Quyết',
  '聚灵阵法初解': 'Tụ Linh Trận Pháp Sơ Giải',
  '明心见性篇': 'Minh Tâm Kiến Tánh Thiên',
  '铁骨铮铮功': 'Thiết Cốt Tranh Tranh Công',
  '灵犀一指': 'Linh Tê Nhất Chỉ',
  '点石成金术': 'Điểm Thạch Thành Kim Thuật',
  '龟息养寿功': 'Quy Tức Dưỡng Thọ Công',
  '周天星辰图': 'Chu Thiên Tinh Thần Đồ',
  '万剑归宗图': 'Vạn Kiếm Quy Tông Đồ',
  '不动如山章': 'Bất Động Như Sơn Chương',
  '形神合一诀': 'Hình Thần Hợp Nhất Quyết',
  '菩提明镜功': 'Bồ Đề Minh Kính Công',
  '天眼通': 'Thiên Nhãn Thông',
  '金刚不坏身': 'Kim Cương Bất Hoại Thân',
  '剑心通明': 'Kiếm Tâm Thông Minh',
  '向死而生诀': 'Hướng Tử Nhi Sinh Quyết',
  '天罡反震诀': 'Thiên Cương Phản Chấn Quyết',
  '一气化三清': 'Nhất Khí Hóa Tam Thanh',
  '斡旋造化': 'Oát Toàn Tạo Hóa',
  '逆天改命经': 'Nghịch Thiên Cải Mệnh Kinh',
  '九霄劫印': 'Cửu Tiêu Kiếp Ấn',
  '御虚仙典': 'Ngự Hư Tiên Điển',
  '仙灵淬体术': 'Tiên Linh Thối Thể Thuật',
  '仙机通玄': 'Tiên Cơ Thông Huyền',
  '太乙金华': 'Thái Ất Kim Hoa',
  '大罗天章': 'Đại La Thiên Chương',
  '神霄九变': 'Thần Tiêu Cửu Biến',
  '神将兵符': 'Thần Tướng Binh Phù',
  '神炼不灭身': 'Thần Luyện Bất Diệt Thân',
  '混元无极经': 'Hỗn Nguyên Vô Cực Kinh',
  '混沌体术': 'Hỗn Độn Thể Thuật',
  '神机衍数': 'Thần Cơ Diễn Số',
  '道音玄章': 'Đạo Âm Huyền Chương',
  '仙光护体诀': 'Tiên Quang Hộ Thể Quyết',
  '玄仙御气经': 'Huyền Tiên Ngự Khí Kinh',
  '金阙玉章': 'Kim Khuyết Ngọc Chương',
  '太乙救苦经': 'Thái Ất Cứu Khổ Kinh',
  '罗天星辰诀': 'La Thiên Tinh Thần Quyết',
  '藐姑射神章': 'Mạc Cô Xạ Thần Chương',
  '天关神兵诀': 'Thiên Quan Thần Binh Quyết',
  '神王御极经': 'Thần Vương Ngự Cực Kinh',
  '神帝临尘章': 'Thần Đế Lâm Trần Chương',
  '真灵不昧诀': 'Chân Linh Bất Muội Quyết',
  '神魔开天经': 'Thần Ma Khai Thiên Kinh',
  '道祖本源经': 'Đạo Tổ Bản Nguyên Kinh'
}

export const GONGFA_SKILL_NAME_MAP: Record<string, string> = {
  '太玄一气': 'Thái Huyền Nhất Khí',
  '木灵缠绕': 'Mộc Linh Triền Nhiễu',
  '焚天火': 'Phần Thiên Hỏa',
  '寒潮': 'Hàn Triều',
  '庚金剑气': 'Canh Kim Kiếm Khí',
  '山岳压顶': 'Sơn Nhạc Áp Đỉnh',
  '紫霄神雷': 'Tử Tiêu Thần Lôi',
  '风刃千重': 'Phong Nhận Thiên Trùng',
  '冰封千里': 'Băng Phong Thiên Lý',
  '大光明拳': 'Đại Quang Minh Quyền',
  '噬魂': 'Phệ Hồn',
  '混沌一击': 'Hỗn Độn Nhất Kích',
  '九霄雷劫': 'Cửu Tiêu Lôi Kiếp',
  '炼神返虚': 'Luyện Thần Phản Hư',
  '无量寿光': 'Vô Lượng Thọ Quang',
  '御虚仙光': 'Ngự Hư Tiên Quang',
  '神霄神雷': 'Thần Tiêu Thần Lôi',
  '混元一炁': 'Hỗn Nguyên Nhất Khí',
  '玄仙一气': 'Huyền Tiên Nhất Khí',
  '金阙剑气': 'Kim Khuyết Kiếm Khí',
  '太乙金光': 'Thái Ất Kim Quang',
  '天关神兵': 'Thiên Quan Thần Binh',
  '神王御极': 'Thần Vương Ngự Cực',
  '神帝临尘': 'Thần Đế Lâm Trần',
  '开天一击': 'Khai Thiên Nhất Kích',
  '本源一炁': 'Bản Nguyên Nhất Khí'
}

export const GONGFA_BRANCH_NAME_MAP: Record<string, string> = {
  '杀伐': 'Sát Phạt',
  '守御': 'Thủ Ngự',
  '归一': 'Quy Nhất',
  '生生': 'Sinh Sinh',
  '缠连': 'Triền Miên',
  '焚天': 'Phần Thiên',
  '续焰': 'Tục Diễm',
  '凝真': 'Ngưng Chân',
  '化柔': 'Hóa Nhu',
  '润物': 'Nhuận Vật',
  '锋锐': 'Phong Nhuệ',
  '破军': 'Phá Quân',
  '破妄': 'Phá Vọng',
  '剑意': 'Kiếm Ý',
  '不动': 'Bất Động',
  '载物': 'Tải Vật',
  '镇岳': 'Trấn Nhạc',
  '疾雷': 'Tật Lôi',
  '贯霄': 'Quán Tiêu',
  '淬体': 'Thối Thể',
  '渡虚': 'Độ Hư',
  '乘风': 'Thừa Phong',
  '风刃': 'Phong Nhận',
  '封灵': 'Phong Linh',
  '琉璃': 'Lưu Ly',
  '通明': 'Thông Minh',
  '普照': 'Phổ Chiếu',
  '辟易': 'Tịch Dịch',
  '证道': 'Chứng Đạo',
  '噬魂': 'Phệ Hồn',
  '夺魄': 'Đoạt Phách',
  '入邪': 'Nhập Tà',
  '化形': 'Hóa Hình',
  '归元': 'Quy Nguyên',
  '开天': 'Khai Thiên',
  '绵长': 'Miên Trường',
  '养元': 'Dưỡng Nguyên',
  '铁身': 'Thiết Thân',
  '炉火': 'Lô Hỏa',
  '疾影': 'Tật Ảnh',
  '缩地': 'Súc Địa',
  '藏形': 'Tàng Hình',
  '避劫': 'Tị Kiếp',
  '聚元': 'Tụ Nguyên',
  '化盾': 'Hóa Thuẫn',
  '观心': 'Quan Tâm',
  '见性': 'Kiến Tánh',
  '玄铁': 'Huyền Thiết',
  '宁折': 'Ninh Chiết',
  '犀照': 'Tê Chiếu',
  '一指': 'Nhất Chỉ',
  '罡壳': 'Cương Giáp',
  '盾锋': 'Thuẫn Phong',
  '点金': 'Điểm Kim',
  '淘沙': 'Đào Sa',
  '养寿': 'Dưỡng Thọ',
  '息元': 'Tức Nguyên',
  '周天': 'Chu Thiên',
  '列宿': 'Liệt Túc',
  '朝宗': 'Triều Tông',
  '窥机': 'Khuy Cơ',
  '照宝': 'Chiếu Bảo',
  '不坏': 'Bất Hoại',
  '不灭': 'Bất Diệt',
  '澄澈': 'Trừng Triệt',
  '先机': 'Tiên Cơ',
  '死地': 'Tử Địa',
  '后生': 'Hậu Sinh',
  '反震': 'Phản Chấn',
  '天罡': 'Thiên Cương',
  '化三': 'Hóa Tam',
  '斡旋': 'Oát Toàn',
  '窃化': 'Thiết Hóa',
  '改命': 'Cải Mệnh',
  '逆天': 'Nghịch Thiên',
  '由我': 'Do Ngã',
  '空明': 'Không Minh',
  '仙锋': 'Tiên Phong',
  '仙体': 'Tiên Thể',
  '固本': 'Cố Bản',
  '愈体': 'Dũ Thể',
  '撷珍': 'Hiệt Trân',
  '雷变': 'Lôi Biến',
  '神变': 'Thần Biến',
  '体变': 'Thể Biến',
  '愈神': 'Dũ Thần',
  '润身': 'Nhuận Thân',
  '测算': 'Trắc Toán',
  '验天': 'Nghiệm Thiên',
  '明道': 'Minh Đạo',
  '悟道': 'Ngộ Đạo',
  '雷罚': 'Lôi Phạt',
  '守中': 'Thủ Trung',
  '回光': 'Hồi Quang',
  '归真': 'Quy Chân',
  '天章': 'Thiên Chương',
  '天罚': 'Thiên Phạt',
  '军律': 'Quân Luật',
  '炼神': 'Luyện Thần',
  '还虚': 'Hoàn Hư',
  '合一': 'Hợp Nhất',
  '凝形': 'Ngưng Hình',
  '寿光': 'Thọ Quang',
  '明照': 'Minh Chiếu',
  '明镜': 'Minh Kính',
  '悟禅': 'Ngộ Thiền',
  '劫印': 'Kiếp Ấn',
  '引雷': 'Dẫn Lôi',
  '护体': 'Hộ Thể',
  '光照': 'Quang Chiếu',
  '御气': 'Ngự Khí',
  '金性': 'Kim Tính',
  '玉章': 'Ngọc Chương',
  '救苦': 'Cứu Khổ',
  '渡厄': 'Độ Ách',
  '星辰': 'Tinh Thần',
  '罗天': 'La Thiên',
  '神凝': 'Thần Ngưng',
  '游世': 'Du Thế',
  '神兵': 'Thần Binh',
  '守关': 'Thủ Quan',
  '御极': 'Ngự Cực',
  '王权': 'Vương Quyền',
  '临尘': 'Lâm Trần',
  '垂泽': 'Thùy Trạch',
  '不昧': 'Bất Muội',
  '守灵': 'Thủ Linh',
  '神魔': 'Thần Ma',
  '本源': 'Bản Nguyên',
  '道祖': 'Đạo Tổ'
}

export const REGION_DESC_MAP: Record<string, string> = {
  '云雾缭绕的山麓,是初入仙途者的试炼之地': 'Sơn lăng mây mù lượn lờ, là nơi thí luyện của người mới bước vào tiên đồ',
  '每逢黄昏,满谷霞光如焚': 'Mỗi độ hoàng hôn, ráng chiều khắp cốc rực rỡ như thiêu',
  '林中黑风终年不散,吹人骨髓生寒': 'Gió đen trong rừng quanh năm không tan, thổi vào tận xương tủy phát lạnh',
  '幽潭之下别有洞天,寒气砭骨': 'Dưới đầm sâu có động thiên riêng, hàn khí thấu xương',
  '万妖聚居之地,机缘与凶险并存': 'Nơi vạn yêu tụ cư, cơ duyên cùng hung hiểm cùng tồn tại',
  '上古大战的残迹,怨气凝而不散': 'Tàn tích đại chiến thượng cổ, oán khí ngưng tụ chẳng tan',
  '地火奔涌,寸草不生': 'Địa hỏa cuộn trào, cỏ cây chẳng mọc',
  '海面漆黑如墨,不见天日': 'Mặt biển tối đen như mực, chẳng thấy ánh mặt trời',
  '瘴雾弥漫,一步踏错便是万劫不复': 'Chướng khí mịt mù, một bước sẩy chân là muôn kiếp không trở lại',
  '埋葬万剑之地,剑气冲霄': 'Nơi chôn vùi vạn kiếm, kiếm khí xông thẳng mây xanh',
  '雷霆万年不歇,是炼体悟道的绝地': 'Lôi đình vạn năm không dứt, là tuyệt địa luyện thể ngộ đạo',
  '万古冰封的圣山,藏着上古秘辛': 'Thánh sơn vạn cổ đóng băng, ẩn giấu bí ẩn thượng cổ',
  '妖族古庭的废墟,妖威犹存': 'Phế tích yêu đình cổ xưa, yêu uy vẫn còn',
  '黄沙之下,埋着一座千年古城': 'Dưới lớp cát vàng, chôn vùi một tòa cổ thành ngàn năm',
  '真真幻幻,迷失其中者不知凡几': 'Thực thực hư hư, kẻ lạc bước trong đó không biết bao nhiêu mà kể',
  '深渊之下,魔气滔天': 'Dưới vực sâu, ma khí ngập trời',
  '星辰坠落之地,遍地陨铁星髓': 'Nơi tinh thần rơi rụng, khắp nơi là vẫn thiết cùng tinh tủy',
  '穿过天幕,方知天外有天': 'Vượt qua màn trời, mới biết trời ngoại còn có trời',
  '陨落仙人的洞府,仙光犹在': 'Động phủ của tiên nhân vẫn lạc, tiên quang vẫn còn lưu lại',
  '天地未开时的裂隙,万物之始': 'Vết nứt lúc thiên địa chưa mở, khởi đầu của vạn vật',
  '云海尽头,一道仙门巍然矗立,过此门者方称仙人': 'Nơi tận cùng biển mây, một đạo tiên môn sừng sững uy nghiêm, qua cửa này mới xứng xưng tiên nhân',
  '古渡无舟,只有被贬下界的仙人在此徘徊': 'Bến cổ không đò, chỉ có tiên nhân bị đày xuống hạ giới lang thang nơi đây',
  '金阙千重,玉京巍峨,天兵列阵森然': 'Kim khuyết nghìn trùng, Ngọc Kinh nguy nga, thiên binh chỉnh tề uy nghiêm',
  '陨落的仙星堆积成台,台上紫气昼夜不散': 'Tiên tinh vẫn lạc xếp thành đài cao, tử khí trên đài ngày đêm không tan',
  '瑶池之畔仙桃垂枝,守苑仙兽蛰伏于花影之间': 'Bên bờ Dao Trì tiên đào trĩu cành, tiên thú canh giữ ẩn mình giữa bóng hoa',
  '一渊金气沉如渊海,号称不朽之物尽沉其中': 'Vực sâu kim khí nặng như biển thẳm, vạn vật bất hủ đều chìm đắm trong đó',
  '一池雷水亘古不涸,太乙仙光自池底冲天而起': 'Hồ lôi thủy vạn thuở không cạn, Thái Ất tiên quang từ đáy hồ xông thẳng mây trời',
  '残破的道场里机关仍在自转,道童仍在扫地': 'Trong đạo trường tàn tạ cơ quan vẫn tự chuyển, đạo đồng vẫn đang quét dọn',
  '大罗天阙悬于星河之上,星君执掌周天星斗': 'Đại La thiên khuyết lơ lửng trên ngân hà, tinh quân chưởng quản chu thiên tinh tú',
  '星海浩瀚无垠,每一粒星都是一位陨落星君的余烬': 'Biển sao mênh mông vô tận, mỗi hạt tinh trần là tàn tích của một vị tinh quân vẫn lạc',
  '神域边陲法则紊乱,斥候与凶兽游弋其间': 'Biên thùy thần vực pháp tắc hỗn loạn, trinh sát cùng hung thú lượn lờ chung quanh',
  '荒原上散落着上古神迹,抬眼即是神明留下的手笔': 'Trên hoang nguyên rải rác thần tích thượng cổ, ngước mắt liền thấy dấu vết của thần minh',
  '神兵列于天关,代天神将持戈而立': 'Thần binh xếp hàng tại thiên quan, đại thiên thần tướng cầm mâu đứng gác',
  '众神陨落之处的战场,千百年后仍有战意翻涌': 'Chiến trường nơi chúng thần vẫn lạc, nghìn năm sau chiến ý vẫn cuộn trào',
  '圣殿神光普照,神官诵念法则之名': 'Thánh điện thần quang phổ chiếu, thần quan tụng niệm danh tự pháp tắc',
  '一万尊神像并列成堂,神像脚下的香火从未熄过': 'Một vạn pho tượng thần xếp thành điện đường, hương hỏa dưới chân tượng chưa từng tắt',
  '天宫之上,神帝垂目,法则化形为兽': 'Trên thiên cung, thần đế rũ mắt, pháp tắc hóa hình thành thú',
  '帝阙之下九千级天阶,一步一重神威压身': 'Dưới đế khuyết chín ngàn bậc thiên giai, mỗi bước một tầng thần uy áp thân',
  '混沌之滨,天地未分,一点真灵游走其间': 'Bên bờ hỗn độn, trời đất chưa phân, một tia chân linh du tẩu trong đó',
  '幽滩之上真灵浮沉,似是徘徊又似在守着什么': 'Trên bãi cát u ám chân linh trôi nổi, như đang quanh quẩn lại như đang trông giữ điều gì',
  '神魔一体,开天辟地的余威仍在此渊回荡': 'Thần ma nhất thể, dư uy khai thiên tích địa vẫn vang vọng trong vực sâu này',
  '一座比天地更早的古祭坛,祭的正是开天的那场厮杀': 'Một tòa cổ tế đàn có trước cả trời đất, tế tự chính trận chém giết khai thiên năm ấy',
  '万道之源,鸿蒙本源静悬于此,道祖一念可开天地': 'Nguồn gốc vạn đạo, Hồng Mông bản nguyên lặng lẽ lơ lửng nơi đây, Đạo Tổ một niệm có thể khai mở thiên địa',
  '传说混沌道祖曾在这面崖下坐了三万年,崖上字迹至今依稀': 'Tương truyền Hỗn Độn Đạo Tổ từng ngồi dưới vách đá này ba vạn năm, nét chữ trên vách đá đến nay vẫn mơ hồ thấy rõ'
}

export const MANSION_NAME_MAP: Record<string, string> = {
  '角木蛟': 'Giác Mộc Giao',
  '亢金龙': 'Kháng Kim Long',
  '氐土貉': 'Đê Thổ Lạc',
  '房日兔': 'Phòng Nhật Thố',
  '心月狐': 'Tâm Nguyệt Hồ',
  '尾火虎': 'Vĩ Hỏa Hổ',
  '箕水豹': 'Cơ Thủy Báo',
  '斗木獬': 'Đấu Mộc Giải',
  '牛金牛': 'Ngưu Kim Ngưu',
  '女土蝠': 'Nữ Thổ Bức',
  '虚日鼠': 'Hư Nhật Thử',
  '危月燕': 'Nguy Nguyệt Yến',
  '室火猪': 'Thất Hỏa Trư',
  '壁水貐': 'Bích Thủy Du',
  '奎木狼': 'Khuê Mộc Lang',
  '娄金狗': 'Lâu Kim Cẩu',
  '胃土雉': 'Vị Thổ Trĩ',
  '昴日鸡': 'Mão Nhật Kê',
  '毕月乌': 'Tất Nguyệt Ô',
  '觜火猴': 'Chủy Hỏa Hầu',
  '参水猿': 'Sâm Thủy Viên',
  '井木犴': 'Tỉnh Mộc Hãn',
  '鬼金羊': 'Quỷ Kim Dương',
  '柳土獐': 'Liễu Thổ Chương',
  '星日马': 'Tinh Nhật Mã',
  '张月鹿': 'Trương Nguyệt Lộc',
  '翼火蛇': 'Dực Hỏa Xà',
  '轸水蚓': 'Chẩn Thủy Dẫn'
}

export const MANSION_IMAGE_MAP: Record<string, string> = {
  '青龙': 'Thanh Long',
  '朱雀': 'Chu Tước',
  '白虎': 'Bạch Hổ',
  '玄武': 'Huyền Vũ'
}

export const MANSION_DIRECTION_MAP: Record<string, string> = {
  '东': 'Đông',
  '南': 'Nam',
  '西': 'Tây',
  '北': 'Bắc'
}

export const MANSION_DOMAIN_MAP: Record<string, string> = {
  '兖州': 'Diễn Châu',
  '豫州': 'Dự Châu',
  '幽州': 'U Châu',
  '江湖': 'Giang Hồ',
  '扬州': 'Dương Châu',
  '青州': 'Thanh Châu',
  '并州': 'Tinh Châu',
  '徐州': 'Từ Châu',
  '冀州': 'Ký Châu',
  '益州': 'Ích Châu',
  '雍州': 'Ung Châu',
  '三河': 'Tam Hà',
  '荆州': 'Kinh Châu'
}

export const MANSION_GOOD_MAP: Record<string, string> = {
  '修造与开市,宜起手': 'Tu tạo cùng khai thị, thích hợp xuất thủ',
  '宜结契与立约': 'Thích hợp kết khế cùng lập ước',
  '宜安宅与定基': 'Thích hợp an trạch cùng định cơ',
  '宜与人同游': 'Thích hợp cùng người đồng du',
  '宜静修与内观': 'Thích hợp tĩnh tu cùng nội quan',
  '宜远行与追逐': 'Thích hợp viễn hành cùng truy trục',
  '宜蓄养与积聚': 'Thích hợp súc dưỡng cùng tích lũy',
  '宜决断与执事': 'Thích hợp quyết đoán cùng chấp sự',
  '宜耕耘与实干': 'Thích hợp canh tân cùng thực cán',
  '宜织造与巧作': 'Thích hợp dệt may cùng xảo tác',
  '宜守静与避事': 'Thích hợp thủ tĩnh cùng tị sự',
  '宜涉险与探幽': 'Thích hợp mạo hiểm cùng thám u',
  '宜营造与经营': 'Thích hợp doanh tạo cùng kinh doanh',
  '宜藏书与研读': 'Thích hợp tàng thư cùng nghiên cứu',
  '宜文事与记述': 'Thích hợp văn sự cùng ghi chép',
  '宜聚众与设宴': 'Thích hợp tụ chúng cùng thiết yến',
  '宜囤积与备荒': 'Thích hợp tích trữ cùng phòng nạn',
  '宜晨起与先行': 'Thích hợp dậy sớm cùng đi trước',
  '宜收束与了结': 'Thích hợp thu xếp cùng kết thúc',
  '宜精工与细作': 'Thích hợp tinh xảo cùng tỉ mỉ',
  '宜用兵与争锋': 'Thích hợp dụng binh cùng tranh phong',
  '宜定法与立制': 'Thích hợp định pháp cùng lập chế',
  '宜祭祀与慎终': 'Thích hợp tế tự cùng thận trọng',
  '宜调和与解纷': 'Thích hợp điều hòa cùng giải tỏa',
  '宜疾行与捷径': 'Thích hợp đi nhanh cùng đường tắt',
  '宜张扬与示人': 'Thích hợp giương cờ cùng thị chúng',
  '宜远举与飞升': 'Thích hợp đi xa cùng phi thăng',
  '宜息事与收尾': 'Thích hợp an ổn cùng kết thúc'
}

export const EVENT_TIER_NAME_MAP: Record<string, string> = {
  '际遇': 'Tế Ngộ',
  '奇缘': 'Kỳ Duyên',
  '机缘': 'Cơ Duyên'
}

export const DANGER_NAME_MAP: Record<string, string> = {
  '平缓': 'Bình hòa',
  '寻常': 'Tầm thường',
  '凶险': 'Hung hiểm',
  '大凶': 'Đại hung',
  '绝地': 'Tuyệt địa'
}

export const PROSPERITY_NAME_MAP: Record<string, string> = {
  '混乱': 'Hỗn Loạn',
  '稳定': 'Ổn Định',
  '繁盛': 'Phồn Thịnh',
  'chaos': 'Hỗn Loạn',
  'stable': 'Ổn Định',
  'flourish': 'Phồn Thịnh'
}

export const FOE_ORIGIN_LABEL_MAP: Record<string, string> = {
  '层级补偿': 'Bù trừ cấp bậc',
  '地界凶险': 'Địa giới hung hiểm',
  '出行方式': 'Phương thức xuất hành',
  '事件影响': 'Ảnh hưởng sự kiện',
  '凶险修正': 'Hiệu chỉnh hung hiểm',
  '异变加成': 'Gia thành dị biến'
}

export const SUPPRESS_RESOURCE_NAME_MAP: Record<string, string> = {
  '灵草': 'Linh Thảo',
  '玄铁': 'Huyền Thiết',
  '功法残页': 'Tàn Trang Công Pháp',
  '器灵尘': 'Khí Linh Trần'
}

// Kiểm tra coverage
console.log('Validating coverage:');
let missingGongfa = 0;
for (const g of GONGFA) {
  if (!GONGFA_NAME_MAP[g.name]) {
    console.error('Missing gongfa:', g.name);
    missingGongfa++;
  }
}
let missingRegions = 0;
for (const r of REGIONS) {
  if (!REGION_DESC_MAP[r.desc]) {
    console.error('Missing region desc:', r.name, r.desc);
    missingRegions++;
  }
}
let missingMansions = 0;
for (const m of MANSIONS) {
  if (!MANSION_NAME_MAP[m.fullName]) {
    console.error('Missing mansion fullName:', m.fullName);
    missingMansions++;
  }
  if (!MANSION_DOMAIN_MAP[m.domain]) {
    console.error('Missing domain:', m.domain);
    missingMansions++;
  }
  if (!MANSION_GOOD_MAP[m.good]) {
    console.error('Missing good:', m.good);
    missingMansions++;
  }
}
console.log(`Results: missingGongfa=${missingGongfa}, missingRegions=${missingRegions}, missingMansions=${missingMansions}`);
