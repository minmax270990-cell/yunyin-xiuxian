/**
 * Quần thể NPC & Thế lực tu tiên (NPC Population & Sects)
 *
 * Tách dữ liệu tĩnh làm nền tảng cho hệ thống Đạo lữ mở rộng,
 * Tông môn và các hoạt động xã hội tu chân giới.
 */
import type { ElementId } from '@/types'
import type { DaoLean, Temperament } from './daolu'

/** Mã định danh Môn phái / Thế lực */
export type SectId =
  | 'qingyun'    // Thanh Vân Tông (Chính đạo, kiếm tu thanh nhã)
  | 'danxia'     // Đan Hà Cốc (Đan đạo, y tu, tế thế)
  | 'tianji'     // Thiên Cơ Các (Kỳ môn độn giáp, diễn toán thiên cơ)
  | 'jianshan'   // Vạn Kiếm Sơn (Thuần kiếm tu, sát phạt quả quyết)
  | 'xuanming'   // Huyền Minh Giáo (Băng hàn, u minh, cô tịch)
  | 'tianhuo'    // Thiên Hỏa Môn (Khí đạo, luyện bảo, nhiệt huyết)
  | 'wuji'       // Vô Cực Tông (Đạo pháp tự nhiên, trường sinh)
  | 'sanxiu'     // Tán Tu Các Phương (Du phương tu sĩ, tự do)
  | 'vandoc'     // Vạn Độc Môn (Độc đạo, cổ thuật, chướng khí)
  | 'thietkiem'  // Thiết Kiếm Môn (Cương mãnh, kiếm ý thuần túy)
  | 'thanhmoc'   // Thanh Mộc Tông (Mộc linh, linh dược trường sinh)
  | 'xichdiem'   // Xích Diễm Phái (Hỏa linh, cương liệt cuồng bạo)
  | 'cuuloi'     // Cửu Lôi Các (Lôi đình, hạo nhiên chính khí)
  | 'thandao'    // Thần Đao Môn (Bá đao tuyệt sát, vô kiên bất tồi)
  | 'bangphach'  // Băng Phách Cốc (Hàn băng vạn năm, minh tâm băng phách)
  | 'huyetsat'   // Huyết Sát Tông (Ma đạo cự phách, huyết hải vô biên)
  | 'thienam'    // Thiên Âm Tự (Phật môn kim cang, từ bi phổ độ)
  | 'thienyeu'   // Thiên Yêu Khuyết (Yêu thần thái cổ, nhục thân bất tử)
  | 'daochi'     // Dao Trì Tiên Cung (Thánh địa tiên gia, ngọc cốt băng cơ)
  | 'yujing'     // Ngọc Kinh Tiên Tông (Cửu thiên ngọc kinh, hạo khí thông thiên)
  | 'tutieu'     // Tử Tiêu Cung (Chín tầng trời tím, tử khí đông lai)
  | 'thaihu'     // Thái Hư Tiên Cung (Đệ nhất thánh địa cửu thiên)
  | 'vanthan'    // Vạn Thần Điện (Thần giới chí tôn, vạn thần tề tựu)
  | 'hondon'     // Hỗn Độn Tiên Tông (Khai thiên tịch địa, vạn đạo quy nguyên)
  | 'luanhoi'    // Luân Hồi Điện (Sinh tử luân hồi, chưởng khống u minh)
  | 'vanco'      // Vạn Cổ Tiên Đình (Thống ngự chư thiên vạn giới)

export interface SectDef {
  id: SectId
  name: string
  brief: string
  doctrine: string // Tông chỉ tu hành
  favoredElement: ElementId
  location: string
}

export const SECTS: readonly SectDef[] = [
  {
    id: 'qingyun',
    name: 'Thanh Vân Tông',
    brief: 'Đệ nhất huyền môn chính đạo của Vân Châu, lấy ngự kiếm phi thăng làm gốc.',
    doctrine: 'Kiếm xuất phong lôi, tâm như minh kính',
    favoredElement: 'wind',
    location: 'Thanh Vân Phong'
  },
  {
    id: 'danxia',
    name: 'Đan Hà Cốc',
    brief: 'Nơi tập hợp các đan sư và y tu thiên hạ, chuyên nghiên cứu linh dược thảo mộc.',
    doctrine: 'Đan tâm tế thế, dược lý thông thần',
    favoredElement: 'wood',
    location: 'Đan Hà Cốc'
  },
  {
    id: 'tianji',
    name: 'Thiên Cơ Các',
    brief: 'Ẩn thế thế lực nắm giữ thiên cơ tinh đồ, thông hiểu kỳ môn trận pháp cổ xưa.',
    doctrine: 'Biết trước thiên số, tìm đạo trong hư vô',
    favoredElement: 'water',
    location: 'Thiên Cơ Nhai'
  },
  {
    id: 'jianshan',
    name: 'Vạn Kiếm Sơn',
    brief: 'Kiếm tu tông môn chí cương chí liệt, người đệ tử chỉ trọng một thanh kiếm trong tay.',
    doctrine: 'Vạn vật giai vi kiếm, một kiếm định càn khôn',
    favoredElement: 'metal',
    location: 'Kiếm Khí Cương'
  },
  {
    id: 'xuanming',
    name: 'Huyền Minh Giáo',
    brief: 'Đông thổ bắc cương cổ giáo, tu hành hàn băng và u minh chi đạo, hành sự quái dị.',
    doctrine: 'Hàn cốt ngưng sương, minh tâm kiến tính',
    favoredElement: 'ice',
    location: 'Huyền Băng Quật'
  },
  {
    id: 'tianhuo',
    name: 'Thiên Hỏa Môn',
    brief: 'Lò đúc danh khí chấn động bát hoang, môn nhân đều là đại sư luyện khí.',
    doctrine: 'Lửa thiêu cặn bã, rèn đúc thần binh',
    favoredElement: 'fire',
    location: 'Liệt Diễm Cốc'
  },
  {
    id: 'wuji',
    name: 'Vô Cực Tông',
    brief: 'Cổ tông truyền thừa từ thái cổ, chủ trương đạo pháp tự nhiên, cầu trường sinh cửu thị.',
    doctrine: 'Thanh tĩnh vô vi, vạn pháp quy nhất',
    favoredElement: 'earth',
    location: 'Vô Cực Điện'
  },
  {
    id: 'sanxiu',
    name: 'Tán Tu Giang Hồ',
    brief: 'Những người tu đạo không chịu sự ràng buộc của môn quy tông môn.',
    doctrine: 'Thiên địa vi gia, tùy tâm sở dục',
    favoredElement: 'chaos',
    location: 'Bát phương du lịch'
  },
  {
    id: 'vandoc',
    name: 'Vạn Độc Môn',
    brief: 'Ẩn mình trong u cốc ngập tràn chướng khí, giỏi dùng độc cổ và ám khí đoạt mệnh.',
    doctrine: 'Độc Đạo Hóa Cốt, tuyệt diệt tà tâm',
    favoredElement: 'wood',
    location: 'Mê Vụ Chiểu Trạch'
  },
  {
    id: 'thietkiem',
    name: 'Thiết Kiếm Môn',
    brief: 'Kiếm phái cương nghị vùng sơn lâm, lấy kiếm thiết trảm yêu trừ ma bảo vệ bách tính.',
    doctrine: 'Thiết Kiếm Trảm Yêu, kiên định bất diệt',
    favoredElement: 'metal',
    location: 'Hắc Phong Lâm'
  },
  {
    id: 'thanhmoc',
    name: 'Thanh Mộc Tông',
    brief: 'Môn phái tu dưỡng mộc linh sinh cơ, hộ sơn thần thụ che chở vạn mẫu linh điền.',
    doctrine: 'Thanh Mộc Trường Sinh, sinh sinh bất tức',
    favoredElement: 'wood',
    location: 'Vạn Mộc Cương'
  },
  {
    id: 'xichdiem',
    name: 'Xích Diễm Phái',
    brief: 'Tọa lạc bên hỏa diệm sơn mạch rực lửa, môn nhân tính tình cương liệt hào hiệp.',
    doctrine: 'Xích Diễm Đốt Trời, phần tận u ám',
    favoredElement: 'fire',
    location: 'Xích Diễm Hỏa Vực'
  },
  {
    id: 'cuuloi',
    name: 'Cửu Lôi Các',
    brief: 'Ngự trên đỉnh Phong Lôi Lĩnh, tu luyện Lôi Cương chính khí, bá đạo chính trực.',
    doctrine: 'Cửu Thiên Thần Lôi, chính khí trừ tà',
    favoredElement: 'fire',
    location: 'Phong Lôi Lĩnh'
  },
  {
    id: 'thandao',
    name: 'Thần Đao Môn',
    brief: 'Đao cương sắc bén trảm phá hư không, một đao đoạn thủy, uy chấn bát phương.',
    doctrine: 'Bá Đao Tuyệt Sát, vô kiên bất tồi',
    favoredElement: 'metal',
    location: 'Bá Đao Phong'
  },
  {
    id: 'bangphach',
    name: 'Băng Phách Cốc',
    brief: 'Cốc sâu phủ đầy băng tuyết ngàn năm, đệ tử toàn tâm tu luyện hàn băng tuyệt kỹ.',
    doctrine: 'Hàn Băng Thấu Xương, minh tâm băng phách',
    favoredElement: 'water',
    location: 'Hàn Băng Cốc'
  },
  {
    id: 'huyetsat',
    name: 'Huyết Sát Tông',
    brief: 'Ma đạo cự phách chấn nhiếp một phương, chuyên tu luyện huyết sát công pháp hung bạo.',
    doctrine: 'Huyết Hải Vô Biên, sát phạt đoạn tuyệt',
    favoredElement: 'water',
    location: 'Ma Uyên Thâm Cốc'
  },
  {
    id: 'thienam',
    name: 'Thiên Âm Tự',
    brief: 'Cổ sát nghìn năm nơi thánh sơn, phật quang chiếu rọi, kim thân bất toái từ bi phổ độ.',
    doctrine: 'Phật Môn Kim Cang, phổ độ hữu duyên',
    favoredElement: 'earth',
    location: 'Côn Lôn Cổ Sát'
  },
  {
    id: 'thienyeu',
    name: 'Thiên Yêu Khuyết',
    brief: 'Lãnh địa yêu tộc hùng mạnh bậc nhất, nhục thân bất tử, sức mạnh khai sơn đoạn hải.',
    doctrine: 'Thượng Cổ Yêu Thần, tôn sùng cường giả',
    favoredElement: 'chaos',
    location: 'Hoàng Đình Cổ Điện'
  },
  {
    id: 'daochi',
    name: 'Dao Trì Tiên Cung',
    brief: 'Cung uyển Dao Trì tiên thụ kết quả nghìn năm, tiên nga tề tựu, đạo vận vô cùng thanh tao.',
    doctrine: 'Dao Trì Tiên Vận, ngọc cốt băng cơ',
    favoredElement: 'water',
    location: 'Dao Trì La Thiên'
  },
  {
    id: 'yujing',
    name: 'Ngọc Kinh Tiên Tông',
    brief: 'Thành trì ngọc kinh nguy nga tráng lệ trên biển mây tiên giới, đệ tử ngọc thụ lâm phong.',
    doctrine: 'Ngọc Kinh Hạo Khí, quang diệu chư thiên',
    favoredElement: 'metal',
    location: 'Vân Hải Ngọc Kinh'
  },
  {
    id: 'tutieu',
    name: 'Tử Tiêu Cung',
    brief: 'Điện các trôi lơ lửng trên chín tầng trời mây tía, tử lôi oanh thiên sát phạt bá đạo.',
    doctrine: 'Tử Khí Đông Lai, thần tiêu ngự lôi',
    favoredElement: 'fire',
    location: 'Tử Tiêu Phong'
  },
  {
    id: 'thaihu',
    name: 'Thái Hư Tiên Cung',
    brief: 'Thánh địa đệ nhất cửu thiên thập địa, tiên nhân tọa trấn, danh vang vạn cổ trường tồn.',
    doctrine: 'Thái Hư Hóa Cực, diễn hóa đại đạo',
    favoredElement: 'chaos',
    location: 'Thái Hư Cực Cảnh'
  },
  {
    id: 'vanthan',
    name: 'Vạn Thần Điện',
    brief: 'Thánh điện tối cao của Thần Giới, vạn thần tề tựu, pháp tắc ngưng tụ trấn áp bát hoang.',
    doctrine: 'Vạn Thần Quy Tông, thần uy cái thế',
    favoredElement: 'earth',
    location: 'Thần Thánh Cương Vực'
  },
  {
    id: 'hondon',
    name: 'Hỗn Độn Tiên Tông',
    brief: 'Đạo thống khai thiên tịch địa lưu truyền từ thuở sơ khai, diễn hóa vạn vật siêu thoát luân hồi.',
    doctrine: 'Hỗn Độn Vô Cực, vạn đạo quy nguyên',
    favoredElement: 'chaos',
    location: 'Hỗn Độn Đạo Nguyên'
  },
  {
    id: 'luanhoi',
    name: 'Luân Hồi Điện',
    brief: 'Thần bí điện phủ nắm giữ luân hồi chi lực, thấu triệt sinh tử huyền cơ vạn kiếp trầm luân.',
    doctrine: 'Chưởng Khống Luân Hồi, sinh tử nhất niệm',
    favoredElement: 'chaos',
    location: 'U Đàm Minh Giới'
  },
  {
    id: 'vanco',
    name: 'Vạn Cổ Tiên Đình',
    brief: 'Thế lực chí cao vô thượng thống ngự chư thiên vạn giới, thiên binh vạn mã tiên uy vạn trượng.',
    doctrine: 'Thống Ngự Chư Thiên, vạn cổ bất hủ',
    favoredElement: 'chaos',
    location: 'Hồng Mông Bản Nguyên'
  }
]

export function sectDef(id: SectId): SectDef | undefined {
  return SECTS.find(s => s.id === id)
}

/** Phẩm cấp Thiên Kiêu của NPC */
export type NpcTierRank = 'normal' | 'silver' | 'gold'

/** Cấu trúc định nghĩa một NPC trong thế giới */
export interface WorldNpcDef {
  id: string
  name: string
  gender: 'male' | 'female'
  sectId: SectId
  sectRole: string // Ngoại môn đệ tử, Nội môn, Chân truyền, Trưởng lão...
  major: number    // 0: Luyện Khí -> 9: Chân Tiên
  sub: number      // 0..8
  temper: Temperament
  lean: DaoLean
  element: ElementId
  brief: string
  pursuit: string
  taboo: string
  isDaoluCandidate: boolean
  preferredGifts: readonly string[] // ['pill', 'herb', 'ore', 'sword', 'tea', 'talisman', 'manual']
  tierRank?: NpcTierRank
  comprehension?: number
  aptitudes?: readonly string[]
  stage?: number
}

function npc(
  id: string,
  name: string,
  gender: 'male' | 'female',
  sectId: SectId,
  sectRole: string,
  major: number,
  sub: number,
  temper: Temperament,
  lean: DaoLean,
  element: ElementId,
  brief: string,
  pursuit: string,
  taboo: string,
  isDaoluCandidate: boolean = true,
  preferredGifts: readonly string[] = ['pill', 'herb'],
  tierRank: NpcTierRank = 'normal',
  comprehension = 60,
  aptitudes: readonly string[] = []
): WorldNpcDef {
  return {
    id,
    name,
    gender,
    sectId,
    sectRole,
    major,
    sub,
    temper,
    lean,
    element,
    brief,
    pursuit,
    taboo,
    isDaoluCandidate,
    preferredGifts,
    tierRank,
    comprehension,
    aptitudes,
    stage: major
  }
}

/**
 * Danh sách Quần thể NPC định danh thế giới (36 NPC phân bố đều các cảnh giới và giới tính)
 * Phân bổ cân bằng 18 Nam và 18 Nữ.
 */
export const WORLD_NPCS: readonly WorldNpcDef[] = [
  // ================= CẢNH GIỚI 0: LUYỆN KHÍ (GIAI ĐOẠN ĐẦU) =================
  npc(
    'npc_truc_linh',
    'Trúc Linh Nhi',
    'female',
    'danxia',
    'Dược đồng ngoại môn',
    0,
    3,
    'curious',
    'alchemy',
    'wood',
    'Thiếu nữ dược đồng lanh lợi, cả ngày bận rộn trong vườn linh dược.',
    'Nhận biết được một vạn loại linh thảo trên đời',
    'Ghét kẻ dẫm đạp làm hỏng cây cỏ',
    true,
    ['herb', 'tea'],
    'silver',
    82,
    ['apt_u_42']
  ),
  npc(
    'npc_lam_phong',
    'Lâm Phong',
    'male',
    'qingyun',
    'Ký danh đệ tử',
    0,
    4,
    'bold',
    'sword',
    'wind',
    'Thiếu niên mới bước vào tu tiên lộ, ánh mắt sáng ngời đầy nhiệt huyết.',
    'Sớm ngày ngự kiếm phi thăng vào nội môn',
    'Không chấp nhận kẻ ỷ mạnh hiếp yếu',
    true,
    ['sword', 'ore'],
    'silver',
    80,
    ['apt_u_43']
  ),
  npc(
    'npc_tieu_vu',
    'Tiểu Vũ',
    'female',
    'sanxiu',
    'Giang hồ tán tu',
    0,
    5,
    'frugal',
    'longevity',
    'water',
    'Nữ hài mồ côi sống nương tựa vào việc săn bắt linh trùng vùng phụ cận.',
    'Tích góp đủ linh thạch thuê một gian phòng ở linh phường',
    'Cực kỳ ghét thói xa hoa lãng phí',
    true,
    ['tea', 'pill']
  ),
  npc(
    'npc_so_nguyen',
    'Sở Nguyên',
    'male',
    'tianhuo',
    'Học đồ rèn đúc',
    0,
    6,
    'cautious',
    'artifice',
    'fire',
    'Thiếu niên vạm vỡ, hai tay đầy vết chai sần vì luyện búa.',
    'Rèn được thanh kiếm đầu tiên có khắc linh văn',
    'Không cho phép người khác chạm vào lò lửa của mình',
    true,
    ['ore', 'manual']
  ),

  // ================= CẢNH GIỚI 1: TRÚC CƠ (BƯỚC VÀO HUYỀN MÔN) =================
  npc(
    'npc_diep_thanh_han',
    'Diệp Thanh Hàn',
    'female',
    'qingyun',
    'Nội môn kiếm tu',
    1,
    2,
    'cautious',
    'sword',
    'metal',
    'Nữ kiếm tu tính tình lành lạnh, thường một mình luyện kiếm dưới trăng.',
    'Lĩnh ngộ được ba tầng Kiếm Khí Hóa Hình',
    'Cực ghét kẻ bất trung bất nghĩa',
    true,
    ['sword', 'tea']
  ),
  npc(
    'npc_tuong_van',
    'Tưởng Vân',
    'male',
    'danxia',
    'Đan sư sơ giai',
    1,
    5,
    'frugal',
    'alchemy',
    'fire',
    'Nam tu sĩ cử chỉ hòa nhã, bên hông đeo một hồ lô thuốc nhỏ.',
    'Luyện thành nhất lò Cố Bản Bồi Nguyên Đan cực phẩm',
    'Không dùng đan dược để mưu lợi hại người',
    true,
    ['herb', 'pill']
  ),
  npc(
    'npc_to_tieu_man',
    'Tô Tiểu Mạn',
    'female',
    'tianji',
    'Trận đồ học sĩ',
    1,
    4,
    'curious',
    'truth',
    'water',
    'Nàng thường ngồi xếp bằng trước la bàn cổ để suy diễn thiên tượng.',
    'Giải mã được Cửu Cung Bát Quái tàn trận',
    'Không thích kẻ thô lỗ gián đoạn suy nghĩ',
    true,
    ['manual', 'tea']
  ),
  npc(
    'npc_nghiem_tieu_lanh',
    'Nghiêm Lãnh',
    'male',
    'jianshan',
    'Chấp pháp đệ tử',
    1,
    7,
    'bold',
    'slaughter',
    'metal',
    'Kiếm khách gầy gò, sát khí bức người, phụ trách tuần tra sơn môn.',
    'Trảm trừ hết ma tu lẩn khuất quanh Vạn Kiếm Sơn',
    'Tuyệt đối không dung thứ cho kẻ trốn chạy',
    true,
    ['sword', 'ore']
  ),

  // ================= CẢNH GIỚI 2: KIM ĐAN (ĐAN ĐẠO TIỂU THÀNH) =================
  npc(
    'npc_lieu_nhu_ngoc',
    'Liễu Như Ngọc',
    'female',
    'danxia',
    'Đan các thủ tọa đệ tử',
    2,
    3,
    'cautious',
    'alchemy',
    'wood',
    'Đan đạo kỳ tài, dung mạo thanh tú, cử chỉ đoan trang đài các.',
    'Bổ khuyết tàn phương Ngũ Chuyển Kim Đan',
    'Không kết giao với kẻ dã tâm thâm độc',
    true,
    ['herb', 'pill', 'tea']
  ),
  npc(
    'npc_phong_vo_ky',
    'Phong Vô Kỵ',
    'male',
    'qingyun',
    'Kiếm các chân truyền',
    2,
    6,
    'bold',
    'sword',
    'wind',
    'Tuấn lãng tiêu sái, uống rượu ngự phong, kiếm pháp phiêu dật vô tung.',
    'Đạt đến cảnh giới Kiếm Tùy Ý Động',
    'Không thích sự gò bó của giáo điều',
    true,
    ['sword', 'tea']
  ),
  npc(
    'npc_ha_lang_tuyet',
    'Hạ Lăng Tuyết',
    'female',
    'xuanming',
    'Hàn băng thánh nữ',
    2,
    5,
    'cautious',
    'longevity',
    'ice',
    'Nàng quanh năm ở tại băng cốc, thần sắc lạnh lùng tựa băng tuyết ngàn năm.',
    'Tu thành Băng Tâm Ngọc Phách vô cấu',
    'Kỵ nhất kẻ nói lời xảo quyệt khinh bạc',
    true,
    ['ore', 'tea']
  ),
  npc(
    'npc_monh_than_chu',
    'Mạnh Thần Chu',
    'male',
    'wuji',
    'Thủ sơn đạo tử',
    2,
    8,
    'frugal',
    'truth',
    'earth',
    'Trang phục đạo bào đơn sơ, ngồi bất động tĩnh tọa dưới gốc tùng cổ.',
    'Cảm ngộ được chu kỳ tuần hoàn của cỏ cây bốn mùa',
    'Không tham dự vào các cuộc tranh đoạt quyền lực',
    true,
    ['manual', 'tea']
  ),

  // ================= CẢNH GIỚI 3: NGUYÊN ANH (MỘT PHƯƠNG TÔNG SƯ) =================
  npc(
    'npc_tu_tinh_ha',
    'Tạ Tinh Hà',
    'male',
    'tianji',
    'Các chủ phân các',
    3,
    2,
    'curious',
    'truth',
    'water',
    'Thầy tướng số thần bí của Thiên Cơ Các, trong tay áo luôn giấu tinh bàn.',
    'Chiêm bái ra tung tích của đại đạo cổ tích',
    'Không nhìn vận mệnh kẻ mệnh mang đại hung',
    true,
    ['manual', 'talisman']
  ),
  npc(
    'npc_vuong_uy_chau',
    'Vương Uy Châu',
    'female',
    'tianhuo',
    'Luyện khí trưởng lão',
    3,
    4,
    'bold',
    'artifice',
    'fire',
    'Nữ tông sư đúc khí danh tiếng, tính cách bộc trực thẳng thắn.',
    'Đúc ra một kiện Cửu Giai Thông Thiên Linh Bảo',
    'Cực ghét kẻ làm việc cẩu thả qua loa',
    true,
    ['ore', 'manual']
  ),
  npc(
    'npc_duong_nguyet_linh',
    'Dương Nguyệt Linh',
    'female',
    'qingyun',
    'Chưởng luật trưởng lão',
    3,
    7,
    'cautious',
    'sword',
    'light',
    'Thực thi môn quy nghiêm cẩn, uy phong hiển hách khắp chính đạo Vân Châu.',
    'Duy trì sự tôn nghiêm và thanh tĩnh của tông môn',
    'Không khoan nhượng với bất kỳ sự dối trá nào',
    true,
    ['sword', 'manual']
  ),
  npc(
    'npc_khuong_vo_ngai',
    'Khương Vô Ngai',
    'male',
    'sanxiu',
    'Nguyên Anh tán nhân',
    3,
    5,
    'curious',
    'slaughter',
    'thunder',
    'Tung hoành hải ngoại tà ma chi địa, từng một kiếm chém chết ba đại yêu.',
    'Tìm kiếm bí cảnh viễn cổ chưa từng ai đặt chân',
    'Không thích quy củ của các đại tông môn',
    true,
    ['sword', 'pill']
  ),

  // ================= CẢNH GIỚI 4: HÓA THẦN (THẦN THÔNG QUẢNG ĐẠI) =================
  npc(
    'npc_co_nguyet_thien',
    'Cố Nguyệt Thiền',
    'female',
    'wuji',
    'Thái thượng hộ pháp',
    4,
    3,
    'frugal',
    'longevity',
    'wood',
    'Thần thái siêu phàm thoát tục, dường như đã hòa tan vào thiên nhiên.',
    'Chứng đắc Hóa Thần viên mãn, nhìn thấu sinh tử hư vô',
    'Không vướng bận ân oán hồng trần tục thế',
    true,
    ['tea', 'herb']
  ),
  npc(
    'npc_bach_vo_song',
    'Bạch Vô Song',
    'male',
    'jianshan',
    'Phó sơn chủ',
    4,
    6,
    'bold',
    'sword',
    'metal',
    'Kiếm đạo tuyệt đỉnh, khí thế như cầu vồng xé toạc tầng mây.',
    'Khiêu chiến hết thảy cao thủ kiếm đạo các châu thiên hạ',
    'Không ra tay với kẻ không cầm kiếm',
    true,
    ['sword', 'ore']
  ),
  npc(
    'npc_ninh_dao_chan',
    'Ninh Đạo Chân',
    'female',
    'tianji',
    'Thiên Cơ Các trưởng lão',
    4,
    4,
    'cautious',
    'truth',
    'chaos',
    'Đôi mắt nàng dường như có thể xuyên thấu thời gian và tiền kiếp.',
    'Tìm lại bản đồ thất lạc của Thượng Giới Chân Tiên',
    'Không tiết lộ thiên cơ cho kẻ tâm thuật bất chính',
    true,
    ['manual', 'tea']
  ),
  npc(
    'npc_tieu_hac_nghiem',
    'Tiêu Hắc Nghiêm',
    'male',
    'xuanming',
    'U minh giáo chủ',
    4,
    8,
    'cautious',
    'slaughter',
    'dark',
    'Uy chấn phương bắc, thân mang vạn quỷ chi khí nhưng đạo tâm kiên định.',
    'Chấn hưng Huyền Minh Cổ Giáo trường tồn cùng nhật nguyệt',
    'Không dung thứ cho kẻ phản bội đồng môn',
    true,
    ['pill', 'manual']
  ),

  // ================= CẢNH GIỚI 5: LUYỆN HƯ (HƯ KHÔNG THÔNG THẦN) =================
  npc(
    'npc_thanh_van_tu',
    'Thanh Vân Tử',
    'male',
    'qingyun',
    'Thái thượng tông chủ',
    5,
    2,
    'cautious',
    'longevity',
    'wind',
    'Lão tổ ngự tại đỉnh Thanh Vân, hơi thở cùng thiên địa tương hợp.',
    'Dẫn dắt tông môn trải qua kiếp nạn đại thiên kiếp',
    'Không can thiệp chuyện phàm tục của hậu bối',
    false,
    ['tea', 'manual']
  ),
  npc(
    'npc_tieu_dao_tien_tu',
    'Tiêu Dao Tiên Tử',
    'female',
    'sanxiu',
    'Tán tu đại năng',
    5,
    5,
    'curious',
    'longevity',
    'water',
    'Du ngoạn tứ hải bát hoang, nơi nào có cảnh đẹp rượu ngon nơi đó có bóng hình nàng.',
    'Thưởng thức trọn vẹn mỹ vị và kỳ hoa dị thảo của cửu giới',
    'Ghét nhất kẻ câu nệ danh phận',
    true,
    ['tea', 'herb']
  ),
  npc(
    'npc_viem_hoang',
    'Viêm Hoàng',
    'male',
    'tianhuo',
    'Thái thượng khí tôn',
    5,
    7,
    'bold',
    'artifice',
    'fire',
    'Thân thể ngâm trong cửu u huyền hỏa ngàn năm, hai mắt tựa hỏa tinh.',
    'Rèn thành Đế Khí chấn nhiếp chư thiên',
    'Không bao giờ rèn khí cho kẻ nhu nhược',
    false,
    ['ore', 'manual']
  ),
  npc(
    'npc_da_u_tien_co',
    'Dạ U Tiên Cô',
    'female',
    'xuanming',
    'Minh hà lão tổ',
    5,
    4,
    'frugal',
    'slaughter',
    'ice',
    'Tu vi Luyện Hư thâm sâu khôn lường, bế quan nơi Minh Hà đáy vực.',
    'Đột phá giới hạn sinh tử thọ nguyên của nhân tộc',
    'Không ưa kẻ quấy nhiễu sự thanh tĩnh của động phủ',
    true,
    ['tea', 'ore']
  ),

  // ================= CẢNH GIỚI 6: HỢP THỂ (THÂN VỚI THIÊN ĐẠO) =================
  npc(
    'npc_kiem_dien_ton',
    'Kiếm Điên Tôn Giả',
    'male',
    'jianshan',
    'Sơn hà lão kiếm thần',
    6,
    3,
    'bold',
    'sword',
    'metal',
    'Một đời si mê kiếm đạo, trong mắt chỉ có kiếm, ngoài kiếm ra không còn vật gì.',
    'Tìm kiếm một đối thủ xứng tầm để dốc cạn một kiếm cuối đời',
    'Không dung thứ cho kẻ dùng kiếm vào việc hèn hạ',
    false,
    ['sword', 'tea']
  ),
  npc(
    'npc_thanh_y_thanh_mau',
    'Thanh Y Thánh Mẫu',
    'female',
    'danxia',
    'Đan đạo thủy tổ',
    6,
    6,
    'cautious',
    'alchemy',
    'wood',
    'Tôn sư đan đạo ngàn năm của Vân Châu, từng luyện đan cứu vớt trăm vạn sinh linh.',
    'Cầu đắc Đan Đạo Hỗn Nguyên, hồi sinh người thân đã mất trong kiếp trước',
    'Cực kỵ kẻ coi mạng người như cỏ rác',
    true,
    ['herb', 'pill']
  ),
  npc(
    'npc_huyen_thien_chan_nhan',
    'Huyền Thiên Chân Nhân',
    'male',
    'wuji',
    'Vô cực cổ tổ',
    6,
    5,
    'frugal',
    'truth',
    'earth',
    'Trông như một lão tiều phu đốn củi, nhưng mỗi bước chân đều lay động hư không.',
    'Chứng ngộ Chân Ngã Vô Ngã cảnh giới',
    'Không thích kẻ kiêu căng tự mãn',
    false,
    ['tea', 'manual']
  ),
  npc(
    'npc_ngoc_han_tien_tu',
    'Ngọc Hàn Tiên Tử',
    'female',
    'sanxiu',
    'Cực bắc tán tiên',
    6,
    8,
    'curious',
    'longevity',
    'ice',
    'Đại năng nữ tu ẩn cư nơi cực bắc tuyết sơn, tuổi thọ đã ngoài vạn năm.',
    'Chờ đợi hoa Tuyết Liên vạn năm nở rộ để chứng ngộ luân hồi',
    'Không muốn dây dưa nhân quả trần gian',
    true,
    ['tea', 'herb']
  ),

  // ================= CẢNH GIỚI 7: ĐẠI THỪA (ĐẠI ĐẠO CHI VIÊN MÃN) =================
  npc(
    'npc_tuyet_kiem_tien',
    'Tuyệt Kiếm Tiên',
    'male',
    'jianshan',
    'Thái thượng kiếm thần',
    7,
    4,
    'bold',
    'sword',
    'metal',
    'Người đã chạm tới cảnh giới tối cao của kiếm thuật thế gian, một niệm khai thiên.',
    'Phá vỡ giới bích hạ giới, phi thăng Tiên Giới',
    'Không màng tranh chấp thế tục',
    false,
    ['sword', 'tea']
  ),
  npc(
    'npc_dieu_am_thien_nu',
    'Diệu Âm Thiên Nữ',
    'female',
    'tianji',
    'Thiên âm thánh tổ',
    7,
    6,
    'curious',
    'truth',
    'water',
    'Nàng dùng tiếng đàn diễn tấu đại đạo, một khúc đàn có thể làm vạn vật sinh sôi.',
    'Diễn tấu bản nhạc Tiên Âm Viên Mãn Thông Thần',
    'Không tiếp kẻ mang lòng trần tục ô uế',
    true,
    ['manual', 'tea']
  ),

  // ================= CẢNH GIỚI 8: ĐỘ KIẾP (TRƯỚC CỬA TIÊN MÔN) =================
  npc(
    'npc_loi_dinh_chan_quan',
    'Lôi Đình Chân Quân',
    'male',
    'sanxiu',
    'Độ kiếp đại tôn',
    8,
    5,
    'bold',
    'slaughter',
    'thunder',
    'Chuẩn bị nghênh đón Cửu Cửu Thiên Kiếp, toàn thân lôi đình lượn quanh sáng rực.',
    'Vượt qua lôi kiếp vũ hóa thành tiên',
    'Không cho phép kẻ khác quấy nhiễu trận đồ độ kiếp',
    false,
    ['ore', 'pill']
  ),
  npc(
    'npc_phi_tuyet_than_nu',
    'Phi Tuyết Thần Nữ',
    'female',
    'xuanming',
    'Băng phách thủy tổ',
    8,
    7,
    'cautious',
    'longevity',
    'ice',
    'Băng hà vạn dặm chỉ vì một hơi thở của nàng mà ngưng tụ, khí tức uy nghi tuyệt trần.',
    'Tẩy rửa hết phàm trần trọc khí để ngưng tụ Tiên Thể',
    'Không dung thứ cho sự thất tín',
    true,
    ['tea', 'herb']
  ),

  // ================= CẢNH GIỚI 9: CHÂN TIÊN (TIÊN NHÂN HẠ PHÀM) =================
  npc(
    'npc_thai_at_chan_tien',
    'Thái Ất Chân Tiên',
    'male',
    'wuji',
    'Tiên giới phân thân',
    9,
    1,
    'frugal',
    'truth',
    'chaos',
    'Phân thân của Tiên giới chân tiên lưu lại hạ giới để tìm kiếm người có duyên.',
    'Tìm kiếm truyền nhân có thể gánh vác đại đạo',
    'Không kết duyên với kẻ đạo tâm dao động',
    false,
    ['tea', 'manual'],
    'gold',
    96,
    ['apt_s_102', 'apt_h_88']
  ),
  npc(
    'npc_cuu_thien_huyen_nu',
    'Cửu Thiên Huyền Nữ',
    'female',
    'qingyun',
    'Thượng giới tiên tử',
    9,
    2,
    'curious',
    'longevity',
    'light',
    'Hóa thân tiên tử giáng trần quan sát tu chân giới, phong hoa tuyệt đại.',
    'Bảo hộ trật tự vận hành của hạ giới không bị ma giới xâm lấn',
    'Cấm kỵ kẻ nghịch thiên làm điều tàn ác',
    true,
    ['tea', 'herb', 'manual'],
    'gold',
    98,
    ['apt_s_101', 'apt_h_84']
  ),

  // ================= CÁC MÔN PHÁI ĐỒNG BỘ THẾ GIỚI =================
  // 1. Vạn Độc Môn (vandoc)
  npc('npc_doc_co_han', 'Độc Cô Hàn', 'male', 'vandoc', 'Chấp sự ngoại môn', 2, 2, 'cautious', 'truth', 'wood', 'Môn nhân Vạn Độc Môn am hiểu dược lý chướng khí và độc cổ.', 'Luyện thành vạn độc bất xâm thể', 'Không thích kẻ hồ đồ khinh địch', true, ['herb', 'ore'], 'normal', 70),
  npc('npc_diep_u_lan', 'Diệp U Lan', 'female', 'vandoc', 'Độc sư chân truyền', 2, 5, 'frugal', 'alchemy', 'wood', 'Nữ tử cô độc trong rừng độc thảo, tính tình trầm mặc ít nói.', 'Tìm kiếm u lan linh thảo ngàn năm', 'Cực ghét kẻ phá hoại hoa cỏ trong đầm', true, ['herb', 'tea'], 'silver', 84, ['apt_u_42']),

  // 2. Thiết Kiếm Môn (thietkiem)
  npc('npc_nhac_thiet_tam', 'Nhạc Thiết Tâm', 'male', 'thietkiem', 'Kiếm đầu lĩnh', 1, 4, 'bold', 'sword', 'metal', 'Kiếm tu cương trực, coi kiếm như mạng sống, ghét điều tà ngụy.', 'Luyện thành thiết kiếm vô song', 'Không dung thứ kẻ lén lút ám toán', true, ['sword', 'ore'], 'normal', 72),
  npc('npc_so_ngoc_dao', 'Sở Ngọc Đao', 'female', 'thietkiem', 'Nội môn đệ tử', 1, 2, 'cautious', 'sword', 'metal', 'Nữ kiếm khách luyện kiếm ngày đêm dưới thác nước lạnh giá.', 'Đạt tới cảnh giới tâm kiếm hợp nhất', 'Không thích kẻ hoa ngôn xảo ngữ', true, ['sword', 'ore'], 'silver', 80, ['apt_u_42']),

  // 3. Thanh Mộc Tông (thanhmoc)
  npc('npc_moc_thanh_duong', 'Mộc Thanh Dương', 'male', 'thanhmoc', 'Dược cốc chấp sự', 1, 6, 'cautious', 'longevity', 'wood', 'Dược sư chăm sóc linh mộc ngàn năm của Thanh Mộc Tông.', 'Nuôi dưỡng thần thụ sinh hoa kết quả', 'Kỵ kẻ chặt phá rừng già bừa bãi', true, ['herb', 'tea'], 'normal', 74),
  npc('npc_lieu_thuy_y', 'Liễu Thúy Y', 'female', 'thanhmoc', 'Hộ sơn linh nữ', 1, 3, 'curious', 'alchemy', 'wood', 'Thiếu nữ áo xanh bên rặng liễu, tiếng sáo thanh tao xua tan mệt mỏi.', 'Hiểu thấu ngôn ngữ của vạn mộc', 'Ghét sự giả dối lừa gạt', true, ['tea', 'herb'], 'silver', 82, ['apt_u_42']),

  // 4. Xích Diễm Phái (xichdiem)
  npc('npc_liet_hoa_chan', 'Liệt Hỏa Chân', 'male', 'xichdiem', 'Chân truyền đệ tử', 2, 1, 'bold', 'slaughter', 'fire', 'Chiến tu nhiệt huyết, toàn thân bốc lên hỏa diễm cương liệt.', 'Đốt cháy mọi chướng ngại trên con đường tu tiên', 'Khinh miệt kẻ nhát gan lùi bước', true, ['ore', 'sword'], 'silver', 83, ['apt_u_42']),
  npc('npc_hoa_linh_nhi', 'Hỏa Linh Nhi', 'female', 'xichdiem', 'Luyện đan sư', 2, 3, 'curious', 'alchemy', 'fire', 'Thiếu nữ đan sư tinh nghịch, thuần thục ngự hỏa luyện chế đan dược.', 'Sáng tạo đan phương hỏa hệ độc nhất vô nhị', 'Kỵ kẻ chê bai tay nghề luyện đan', true, ['pill', 'herb'], 'normal', 72),

  // 5. Cửu Lôi Các (cuuloi)
  npc('npc_loi_pha_thien', 'Lôi Phá Thiên', 'male', 'cuuloi', 'Chấp pháp đường chủ', 3, 4, 'bold', 'sword', 'fire', 'Cương trực thiết diện, chưởng quản lôi phạt trừng trị môn quy.', 'Dùng thần lôi tinh lọc cõi trần', 'Căm ghét ma đạo tà tu', true, ['sword', 'ore'], 'silver', 86, ['apt_u_42']),
  npc('npc_loi_van_nhi', 'Lôi Vân Nhi', 'female', 'cuuloi', 'Thần tiêu sứ giả', 3, 2, 'curious', 'truth', 'fire', 'Nữ tu ngự lôi phi hành trong tầng mây giông bão, mắt sáng tựa tinh tú.', 'Lĩnh ngộ chín tầng thần lôi áo nghĩa', 'Không ưa kẻ dối trá lật lọng', true, ['ore', 'tea'], 'gold', 91, ['apt_h_83']),

  // 6. Thần Đao Môn (thandao)
  npc('npc_lanh_vo_nhiem', 'Lãnh Vô Nhiễm', 'male', 'thandao', 'Đao tông trưởng lão', 3, 5, 'bold', 'slaughter', 'metal', 'Đao khách cô độc, một đao trảm thiên hạ không bao giờ rút chiêu thứ hai.', 'Đao đạo đăng phong tạo cực', 'Ghét kẻ do dự thiếu quyết đoán', true, ['sword', 'ore'], 'silver', 87, ['apt_u_42']),
  npc('npc_dao_phuong_hoa', 'Đao Phượng Hoa', 'female', 'thandao', 'Bá đao chân truyền', 3, 3, 'cautious', 'sword', 'metal', 'Nữ tử hiên ngang mang thanh cự đao sau lưng, khí thế bất phàm.', 'Chứng minh đao pháp không thua kiếm thuật', 'Không chấp nhận bị coi thường', true, ['sword', 'ore'], 'normal', 73),

  // 7. Băng Phách Cốc (bangphach)
  npc('npc_bang_tuyet_khiem', 'Băng Tuyết Khiêm', 'male', 'bangphach', 'Hàn cốc chấp sự', 3, 1, 'cautious', 'truth', 'water', 'Tu sĩ áo trắng như tuyết, cử chỉ nho nhã lạnh lùng như sương mai.', 'Đạt tới cảnh giới bất động như băng', 'Tránh xa chốn thị phi náo nhiệt', true, ['tea', 'herb'], 'normal', 71),
  npc('npc_han_bang_tam', 'Hàn Băng Tâm', 'female', 'bangphach', 'Băng phách thánh nữ', 3, 6, 'frugal', 'longevity', 'water', 'Thánh nữ băng cốc dung mạo tuyệt trần, lãnh diễm như đóa tuyết liên.', 'Bảo vệ thánh địa băng phách nghìn năm', 'Không tiếp cận kẻ có tà tâm', true, ['tea', 'herb'], 'gold', 92, ['apt_h_84']),

  // 8. Huyết Sát Tông (huyetsat)
  npc('npc_huyet_vo_ngan', 'Huyết Vô Ngân', 'male', 'huyetsat', 'Ma ảnh chấp pháp', 6, 2, 'bold', 'slaughter', 'water', 'Ma tu thoắt ẩn thoắt hiện trong bóng tối, sát khí lẫm liệt kinh người.', 'Đoạt lấy sức mạnh chí cao của huyết đạo', 'Kỵ kẻ phản bội đồng minh', true, ['ore', 'sword'], 'silver', 88, ['apt_u_42']),
  npc('npc_huyet_mi_nhi', 'Huyết Mị Nhi', 'female', 'huyetsat', 'Huyết liên ma nữ', 6, 4, 'curious', 'truth', 'water', 'Ma nữ xinh đẹp quyến rũ mang nụ cười ma mị khó dò.', 'Tự do tự tại tung hoành thiên hạ', 'Ghét kẻ đạo đức giả', true, ['tea', 'herb'], 'silver', 89, ['apt_u_42']),

  // 9. Thiên Âm Tự (thienam)
  npc('npc_tinh_khong_dai_su', 'Tịnh Không Đại Sư', 'male', 'thienam', 'Kim cương đường tọa chủ', 8, 3, 'cautious', 'truth', 'earth', 'Cao tăng phật môn đắc đạo, phật quang phổ chiếu, tâm tịnh như gương.', 'Độ hóa tà niệm chúng sinh', 'Kỵ sát sinh vô cớ', true, ['tea', 'manual'], 'gold', 94, ['apt_s_101']),
  npc('npc_dieu_am_thien_nu', 'Diệu Âm Thiện Nữ', 'female', 'thienam', 'Phật môn hộ pháp', 8, 1, 'frugal', 'longevity', 'earth', 'Nữ cư sĩ trang nghiêm từ ái, tiếng tụng kinh xoa dịu vạn nỗi khổ đau.', 'Giữ gìn ngọn đèn trí tuệ của phật tự', 'Ghét điều bạo tàn dối trá', true, ['tea', 'herb'], 'silver', 88, ['apt_u_42']),

  // 10. Thiên Yêu Khuyết (thienyeu)
  npc('npc_yeu_vuong_man_nguu', 'Yêu Vương Man Ngưu', 'male', 'thienyeu', 'Chiến tướng yêu hoàng', 8, 4, 'bold', 'slaughter', 'chaos', 'Cự hán yêu tộc sức mạnh kinh thiên động địa, mình đồng da sắt.', 'Đưa yêu tộc trở lại đỉnh cao thời thái cổ', 'Không phục kẻ yếu thế', true, ['ore', 'sword'], 'silver', 88, ['apt_u_42']),
  npc('npc_bach_ho_thanh_nu', 'Bạch Hổ Thánh Nữ', 'female', 'thienyeu', 'Thiên yêu hộ linh', 8, 2, 'curious', 'artifice', 'chaos', 'Thánh nữ yêu tộc mang huyết mạch bạch hổ thượng cổ cao quý.', 'Tìm lại tàn tích của vương triều yêu tộc', 'Kỵ kẻ bất kính với tổ tiên', true, ['ore', 'tea'], 'gold', 93, ['apt_h_87']),

  // 11. Dao Trì Tiên Cung (daochi)
  npc('npc_ngoc_lam_tien_quan', 'Ngọc Lâm Tiên Quân', 'male', 'daochi', 'Dao trì hộ pháp', 8, 5, 'cautious', 'truth', 'water', 'Tiên quan thanh nhã cư ngụ bên hồ tiên, phẩm cách thanh cao thoát tục.', 'Canh giữ đạo thụ không để ngoại ma xâm nhập', 'Tránh xa tranh đoạt danh lợi', true, ['tea', 'manual'], 'silver', 89, ['apt_u_42']),
  npc('npc_dao_tri_tien_tu', 'Dao Trì Tiên Tử', 'female', 'daochi', 'Bàn đào hộ thụ linh nữ', 8, 6, 'curious', 'longevity', 'water', 'Tiên nữ áo lụa tha thướt, bước chân đi tới đâu hoa sen nở tới đó.', 'Chăm sóc bàn đào thánh thụ đơm hoa kết trái', 'Không ưa kẻ thô lỗ thất lễ', true, ['tea', 'herb'], 'gold', 95, ['apt_s_102']),

  // 12. Ngọc Kinh Tiên Tông (yujing)
  npc('npc_ngoc_kinh_chan_nhan', 'Ngọc Kinh Chân Nhân', 'male', 'yujing', 'Cửu thiên sứ giả', 8, 2, 'cautious', 'truth', 'metal', 'Tiên nhân ngọc thụ lâm phong, nắm giữ điển tịch của thành Ngọc Kinh.', 'Hoằng dương tiên đạo quang minh', 'Ghét kẻ mưu đồ ám hại', true, ['manual', 'tea'], 'silver', 88, ['apt_u_42']),
  npc('npc_ngoc_hoa_tien_phi', 'Ngọc Hoa Tiên Phi', 'female', 'yujing', 'Ngọc kinh chưởng tịch', 8, 5, 'frugal', 'artifice', 'metal', 'Tiên tử quý phái cai quản tàng thư các của Ngọc Kinh thượng giới.', 'Khôi phục mọi cổ thư thất truyền', 'Kỵ kẻ làm rách điển tịch tiên môn', true, ['manual', 'herb'], 'gold', 94, ['apt_h_88']),

  // 13. Tử Tiêu Cung (tutieu)
  npc('npc_tu_tieu_dao_truong', 'Tử Tiêu Đạo Trưởng', 'male', 'tutieu', 'Tử lôi điện chủ', 8, 7, 'bold', 'sword', 'fire', 'Đạo trưởng tay cầm phất trần tím, sấm sét quanh thân lấp lánh uy nghiêm.', 'Khai sáng lôi đình đại đạo mới', 'Không dung túng kẻ làm trái thiên quy', true, ['sword', 'ore'], 'gold', 94, ['apt_s_101']),
  npc('npc_tu_van_huyen_nu', 'Tử Vân Huyền Nữ', 'female', 'tutieu', 'Chân truyền tử tiêu', 8, 4, 'curious', 'truth', 'fire', 'Nữ tử ngự mây tía du ngoạn thiên hạ, khí phách hào sảng phóng khoáng.', 'Lĩnh hội trọn vẹn tử khí đông lai quyết', 'Ghét sự câu nệ giáo điều', true, ['tea', 'ore'], 'silver', 89, ['apt_u_42']),

  // 14. Thái Hư Tiên Cung (thaihu)
  npc('npc_thai_hu_lao_nhan', 'Thái Hư Lão Nhân', 'male', 'thaihu', 'Thái hư thái thượng', 9, 5, 'cautious', 'longevity', 'chaos', 'Lão giả râu tóc bạc phơ sống qua trăm vạn năm, đôi mắt nhìn thấu hồng trần.', 'Chiêm nghiệm sự sinh diệt của chư thiên', 'Không màng phân tranh thế tục', true, ['tea', 'manual'], 'gold', 97, ['apt_s_101', 'apt_s_102']),
  npc('npc_thai_hu_tien_mau', 'Thái Hư Tiên Mẫu', 'female', 'thaihu', 'Thánh mẫu tiên cung', 9, 6, 'frugal', 'truth', 'chaos', 'Tiên mẫu tôn kính ngự trên đài sen bát bảo, đạo vận trang nghiêm viên mãn.', 'Bảo hộ tiên đồ nhân loại truyền thừa vạn kiếp', 'Kỵ kẻ nghịch thiên làm càn', true, ['tea', 'herb'], 'gold', 98, ['apt_s_102', 'apt_h_88']),

  // 15. Vạn Thần Điện (vanthan)
  npc('npc_than_vuong_vo_cuc', 'Thần Vương Vô Cực', 'male', 'vanthan', 'Thần vương chấp pháp', 9, 3, 'bold', 'truth', 'earth', 'Thần vương khoác thần giáp hoàng kim, uy áp bức người khiến vạn vật phục tùng.', 'Duy trì trật tự tối thượng của Thần Giới', 'Tuyệt đối không tha kẻ phản bội thiên đình', true, ['sword', 'ore'], 'gold', 96, ['apt_s_101']),
  npc('npc_than_hau_ngoc_tuyet', 'Thần Hậu Ngọc Tuyết', 'female', 'vanthan', 'Thần giới thánh mẫu', 9, 4, 'cautious', 'longevity', 'earth', 'Nữ thần đoan trang cao quý, tay cầm thần trượng cai quản linh tuyền.', 'Gìn giữ sự bình yên cho bờ cõi thần thánh', 'Không thích sự nhiễu loạn hỗn tạp', true, ['tea', 'herb'], 'gold', 96, ['apt_s_102']),

  // 16. Hỗn Độn Tiên Tông (hondon)
  npc('npc_hon_don_chan_quan', 'Hỗn Độn Chân Quân', 'male', 'hondon', 'Đạo nguyên trưởng lão', 9, 7, 'cautious', 'truth', 'chaos', 'Đạo sĩ áo xám dung hợp với khí hỗn độn nguyên sơ, thâm sâu không lường.', 'Luyện thành Hỗn Độn Vô Cực Kim Thân', 'Không ưa chốn ồn ào bụi bặm', true, ['manual', 'tea'], 'gold', 98, ['apt_s_101', 'apt_h_88']),
  npc('npc_hon_don_thanh_nu', 'Hỗn Độn Thánh Nữ', 'female', 'hondon', 'Sơ khai linh thể', 9, 8, 'curious', 'longevity', 'chaos', 'Thiếu nữ sinh ra từ đóa sen hỗn độn sơ khai, ngây thơ thuần khiết tuyệt luân.', 'Hiểu rõ nguồn gốc của vũ trụ sơ khai', 'Ghét sát phạt và hủy diệt sinh linh', true, ['tea', 'herb'], 'gold', 99, ['apt_s_102', 'apt_s_101']),

  // 17. Luân Hồi Điện (luanhoi)
  npc('npc_luan_hoi_phan_quan', 'Luân Hồi Phán Quan', 'male', 'luanhoi', 'Minh giới chưởng bộ', 9, 6, 'cautious', 'truth', 'chaos', 'Phán quan tay cầm bút sinh tử, ghi chép luân hồi quả báo của vạn linh.', 'Thực thi công lý luân hồi của trời đất', 'Không dung thứ kẻ trốn tránh nghiệp báo', true, ['manual', 'tea'], 'gold', 97, ['apt_s_101']),
  npc('npc_u_minh_thanh_mau', 'U Minh Thánh Mẫu', 'female', 'luanhoi', 'U đàm điện chủ', 9, 7, 'frugal', 'slaughter', 'chaos', 'Nữ chúa u đàm tịch mịch, tay cầm đèn dẫn linh hồn qua dòng vong xuyên.', 'Chỉ dẫn linh hồn lầm lạc về bến bờ giải thoát', 'Kỵ kẻ quấy nhiễu cõi âm', true, ['tea', 'herb'], 'gold', 98, ['apt_s_102']),

  // 18. Vạn Cổ Tiên Đình (vanco)
  npc('npc_tien_de_van_the', 'Tiên Đế Vạn Thế', 'male', 'vanco', 'Thiên binh thống soái', 9, 8, 'bold', 'truth', 'chaos', 'Đại đế hùng tài đại lược, một ánh mắt trấn áp ngàn vạn tinh cầu chư thiên.', 'Xây dựng tiên đình bất hủ trường tồn cùng đại đạo', 'Không cho phép kẻ làm phản trật tự', true, ['sword', 'manual'], 'gold', 99, ['apt_s_101', 'apt_s_102']),
  npc('npc_van_co_tien_hau', 'Vạn Cổ Tiên Hậu', 'female', 'vanco', 'Hồng mông mẫu nghi', 9, 8, 'curious', 'longevity', 'chaos', 'Mẫu nghi thiên hạ, đạo tâm bao la dung nạp vạn vật, ân trạch trải khắp chư thiên.', 'Bảo bọc vạn linh sinh sôi nảy nở trường tồn', 'Ghét chiến tranh tang tóc chia ly', true, ['tea', 'herb'], 'gold', 99, ['apt_s_102', 'apt_s_101'])
]

/** Tìm thông tin NPC theo ID */
export function worldNpcDef(id: string): WorldNpcDef | undefined {
  return WORLD_NPCS.find(n => n.id === id)
}

/** Lọc danh sách NPC theo môn phái */
export function npcsBySect(sectId: SectId): WorldNpcDef[] {
  return WORLD_NPCS.filter(n => n.sectId === sectId)
}

/** Lọc danh sách ứng viên Đạo lữ theo giới tính yêu cầu (khác giới với người chơi) */
export function daoluCandidatesByGender(gender: 'male' | 'female'): WorldNpcDef[] {
  return WORLD_NPCS.filter(n => n.isDaoluCandidate && n.gender === gender)
}

// Re-export stage generation and comprehension evaluation
export {
  generateNpc,
  generateStageNpcBatch,
  comprehensionRankText
} from './npcGeneration'
