/**
 * 先天资质系统 (Tư chất nhân vật - Lấy cảm hứng từ Quỷ Cốc Bát Hoang)
 * 
 * Cung cấp kho 120 tư chất khởi đầu khi tạo nhân vật,
 * phân bổ đều thành 6 cấp bậc phẩm chất (mỗi cấp 20 tư chất):
 *   - Cấp 1: Phàm phẩm (Có ưu điểm nhỏ và nhược điểm rõ rệt, bắt buộc có cả cộng và trừ)
 *   - Cấp 2: Trung phẩm (Bắt đầu hình thành sở trường, phần lớn có đánh đổi nhẹ)
 *   - Cấp 3: Thượng phẩm (Có sở trường nổi bật, thuần cộng)
 *   - Cấp 4: Địa phẩm (Tư chất hiếm, định hình một hướng build chuyên biệt)
 *   - Cấp 5: Thiên phẩm (Thiên tài hiếm gặp, chỉ số mạnh mẽ)
 *   - Cấp 6: Tuyệt phẩm (Cực hiếm, cảnh giới chí tôn, được kiểm soát cân bằng với soft-cap)
 */
import type { AptitudeCategory, AptitudeDef, AptitudeGrade, StatMods } from '@/types'
import type { RandomService } from '@/utils/random'

export const APTITUDE_CATEGORY_NAMES: Record<AptitudeCategory, string> = {
  comprehension: 'Ngộ tính',
  cultivation: 'Tu luyện',
  fortune: 'Khí vận',
  charm: 'Mị lực',
  physique: 'Thể chất',
  craft: 'Bách nghệ'
}

export const APTITUDE_GRADE_META: Record<AptitudeGrade, { name: string; color: string; borderClass: string; textClass: string }> = {
  1: { name: 'Phàm phẩm', color: 'var(--color-ink-faint)', borderClass: 'border-ink/20', textClass: 'text-ink-faint' },
  2: { name: 'Trung phẩm', color: 'var(--color-azure)', borderClass: 'border-azure/40', textClass: 'text-azure' },
  3: { name: 'Thượng phẩm', color: 'var(--color-violet-ink)', borderClass: 'border-violet-ink/40', textClass: 'text-violet-ink' },
  4: { name: 'Địa phẩm', color: 'var(--color-amber-ink)', borderClass: 'border-amber-ink/50', textClass: 'text-amber-ink' },
  5: { name: 'Thiên phẩm', color: 'var(--color-cinnabar)', borderClass: 'border-cinnabar/60', textClass: 'text-cinnabar' },
  6: { name: 'Tuyệt phẩm', color: 'var(--color-gold-ink)', borderClass: 'border-gold-ink/70', textClass: 'text-gold-ink' }
}

// Tỉ lệ xuất hiện các phẩm cấp tư chất là ngang nhau (đều 10 điểm trọng số)
const GRADE_WEIGHTS: Record<AptitudeGrade, number> = {
  1: 10,
  2: 10,
  3: 10,
  4: 10,
  5: 10,
  6: 10
}

function a(
  id: string,
  name: string,
  category: AptitudeCategory,
  grade: AptitudeGrade,
  desc: string,
  mods: StatMods,
  charmBonus = 0
): AptitudeDef {
  return {
    id,
    name,
    category,
    grade,
    desc,
    mods,
    weight: GRADE_WEIGHTS[grade],
    charmBonus
  }
}

export const APTITUDES: AptitudeDef[] = [
  // =========================================================================
  // CẤP 1 — PHÀM PHẨM (Grade 1): 20 tư chất (Bắt buộc có CẢ CỘNG VÀ TRỪ)
  // =========================================================================
  a('apt_p_01', 'Thân Thể Suy Nhược', 'physique', 1, 'Thân thể ốm yếu nhiều bệnh tật, nhưng tâm trí thanh tịnh, tu vi tiến cảnh nhanh hơn', { cultivationSpeed: 0.08, maxHpPct: -0.1 }),
  a('apt_p_02', 'Căn Cơ Phù Phiếm', 'cultivation', 1, 'Tụ khí mau lẹ nhưng linh lực bất định, bình cảnh khó phá vỡ', { cultivationSpeed: 0.1, breakthroughRate: -0.05 }),
  a('apt_p_03', 'Tâm Tính Phù Phiếm', 'comprehension', 1, 'Tâm ý dính mắc phàm trần hoàng kim, khó lòng nhập định cảm ngộ đạo lý', { spiritStoneGain: 0.12, expGain: -0.1 }),
  a('apt_p_04', 'Thiên Sinh Trì Độn', 'comprehension', 1, 'Nhục thân dày dặn chịu đòn tốt, nhưng tư chất chậm hiểu, học đạo gian nan', { defensePct: 0.1, cultivationSpeed: -0.08 }),
  a('apt_p_05', 'Khí Huyết Bạc Nhược', 'physique', 1, 'Khí mạch dễ lưu thông nhưng tiên thiên huyết khí thiếu hụt, sinh mệnh mỏng manh', { qiRegen: 0.15, maxHpPct: -0.12 }),
  a('apt_p_06', 'Tạp Niệm Quấn Thân', 'comprehension', 1, 'Trong lòng nhiều hung hiểm kích động nên đòn đánh hiểm ác, song tu hành dễ phân tâm', { critRate: 0.05, cultivationSpeed: -0.08 }),
  a('apt_p_07', 'Tứ Chi Vụng Về', 'physique', 1, 'Tay chân thô kệch vung đòn nặng ngàn cân, nhưng thân pháp vụng về chậm chạp', { attackPct: 0.1, speed: -10 }),
  a('apt_p_08', 'Linh Đài Ám Muội', 'comprehension', 1, 'Thần trí u mê tựa gỗ đá ít bị thương tổn, song lĩnh hội kinh nghiệm chiến đấu rất chậm', { damageReduction: 0.05, expGain: -0.1 }),
  a('apt_p_09', 'Khí Vận Bình Thường', 'fortune', 1, 'Cẩn trọng tự bảo vệ bản thân, song cả đời ít khi nhặt được của báu', { defensePct: 0.08, dropRate: -0.08, luck: -0.05 }),
  a('apt_p_10', 'Tính Tình Nóng Nảy', 'physique', 1, 'Ra tay hung hãn bất chấp hậu quả, chỉ công không thủ', { attackPct: 0.12, defensePct: -0.08 }),
  a('apt_p_11', 'Tâm Cảnh Bất Định', 'comprehension', 1, 'Lúc thuận lợi hăng hái phi thường, khi lâm nguy lại hoang mang sợ hãi', { fullHpDamage: 0.12, lowHpReduction: -0.08 }),
  a('apt_p_12', 'Kinh Mạch Bế Tắc', 'cultivation', 1, 'Gân cốt rắn rỏi huyết khí dồi dào, song khiếu huyệt bế tắc, linh khí khó thông', { maxHpPct: 0.12, cultivationSpeed: -0.08 }),
  a('apt_p_13', 'Căn Cốt Tầm Thường', 'physique', 1, 'Thể chất bình thường như bao người, tính nết cần cù bù đắp nhưng tiến cảnh vẫn chậm', { defensePct: 0.08, cultivationSpeed: -0.06 }),
  a('apt_p_14', 'Tài Vận Đạm Bạc', 'fortune', 1, 'Quyết chiến liều mình đoạt mạng, nhưng số phận thanh bần nghèo khó', { damageBonus: 0.06, spiritStoneGain: -0.15 }),
  a('apt_p_15', 'Thiếu Kiên Nhẫn', 'cultivation', 1, 'Thích tốc chiến tốc thắng, không chịu nổi sự tĩnh mịch cô quạnh khi tọa thiền', { critRate: 0.05, cultivationSpeed: -0.08 }),
  a('apt_p_16', 'Khó Lĩnh Hội', 'comprehension', 1, 'Đầu óc mộc mạc khó hiểu đạo kinh thâm sâu, thân thể dẻo dai làm điểm tựa', { maxHpPct: 0.1, expGain: -0.1 }),
  a('apt_p_17', 'Thân Pháp Vụng Về', 'physique', 1, 'Bộ pháp vụng về không biết lạng lách né đòn, chỉ biết gồng mình chống cự', { defensePct: 0.1, dodgeRate: -0.05 }),
  a('apt_p_18', 'Tâm Chí Yếu Mềm', 'charm', 1, 'Thiếu sát khí quyết liệt, song tính tình hòa nhã, sinh cơ điều hòa tự dưỡng', { regenPerRound: 0.015, attackPct: -0.06 }, 0.1),
  a('apt_p_19', 'Linh Khí Khó Tụ', 'cultivation', 1, 'Chiêu thức sắc bén đâm thủng giáp hộ thân, nhưng linh hải trống trải tích lũy gian nan', { armorPen: 0.06, qiRegen: -0.12 }),
  a('apt_p_20', 'Phúc Duyên Nông Cạn', 'fortune', 1, 'Không trông cậy vào số mệnh trời ban, chỉ tin vào nắm đấm của chính mình', { attackPct: 0.08, eventLuck: -0.1, luck: -0.05 }),

  // =========================================================================
  // CẤP 2 — TRUNG PHẨM (Grade 2): 20 tư chất (Bắt đầu có sở trường, có đánh đổi nhẹ)
  // =========================================================================
  a('apt_m_21', 'Chuyên Tâm Tu Luyện', 'cultivation', 2, 'Say mê tu hành chẳng màng thế sự, buông bỏ việc tích lũy tài vật phàm trần', { cultivationSpeed: 0.14, spiritStoneGain: -0.08 }),
  a('apt_m_22', 'Thiên Sinh Thần Lực', 'physique', 2, 'Trời sinh sức mạnh dời non lấp bể, song thân thể nặng nề di chuyển chậm hơn', { attackPct: 0.14, speed: -8 }),
  a('apt_m_23', 'Tâm Cảnh Đạm Bạc', 'comprehension', 2, 'Lòng nhẹ như mây khói, dễ hòa nhập vào đạo cảnh, coi nhẹ tiền tài', { expGain: 0.14, spiritStoneGain: -0.1 }),
  a('apt_m_24', 'Thân Pháp Linh Hoạt', 'physique', 2, 'Thân như lá bay phiêu dật né đòn, nhưng thể chất mảnh khảnh khó chịu đòn nặng', { dodgeRate: 0.06, defensePct: -0.05 }),
  a('apt_m_25', 'Khí Huyết Sung Túc', 'physique', 2, 'Huyết khí dồi dào sinh mạng bền vững, đòn đánh trầm ổn ít biến chiêu hiểm', { maxHpPct: 0.15, critRate: -0.02 }),
  a('apt_m_26', 'Kiếm Tâm Sơ Thành', 'comprehension', 2, 'Bước đầu hiểu ý tứ mũi kiếm sắc bén, đòn bạo kích kinh người, song phòng ngự sơ hở', { critDamage: 0.18, critRate: 0.03, defensePct: -0.05 }),
  a('apt_m_27', 'Tụ Khí Hữu Thành', 'cultivation', 2, 'Thở hít nhịp nhàng nạp khí cực nhanh, kinh mạch chuyên chở linh năng lấn át thể phách', { qiRegen: 0.18, maxHpPct: -0.04 }),
  a('apt_m_28', 'Tinh Thần Chuyên Chú', 'comprehension', 2, 'Một lòng hướng tới bình cảnh phá giới, không để ý thu thập chiến lợi phẩm bên đường', { breakthroughRate: 0.04, dropRate: -0.05 }),
  a('apt_m_29', 'Căn Cốt Dẻo Dai', 'physique', 2, 'Gân mạch dẻo dai như dây cung chịu lực, song không thiên về tốc độ ra đòn', { damageReduction: 0.06, speed: -6 }),
  a('apt_m_30', 'Thiện Về Phòng Thủ', 'physique', 2, 'Dựng lập phòng tuyến vững chắc như thạch bàn, lấy thủ vi công', { defensePct: 0.16, attackPct: -0.06 }),
  a('apt_m_31', 'Thiện Về Tấn Công', 'physique', 2, 'Quyết liệt dốc toàn lực công kích áp đảo đối phương', { attackPct: 0.16, defensePct: -0.06 }),
  a('apt_m_32', 'Tài Trí Lanh Lợi', 'comprehension', 2, 'Trí tuệ thông minh học nhanh hiểu rộng, song thân thể có phần mảnh mai', { cultivationSpeed: 0.12, maxHpPct: -0.05 }),
  a('apt_m_33', 'Tính Tình Cẩn Trọng', 'physique', 2, 'Luôn quan sát đối phương chờ cơ hội an toàn nhất mới tiến tới', { defensePct: 0.12, speed: -6 }),
  a('apt_m_34', 'Bản Năng Chiến Đấu', 'physique', 2, 'Trực giác chiến đấu nhạy bén hung hãn, song tu dưỡng tâm tính chưa đủ tĩnh', { damageBonus: 0.07, cultivationSpeed: -0.05 }),
  a('apt_m_35', 'Dược Tính Thân Hòa', 'craft', 2, 'Bẩm sinh hòa hợp với thảo mộc đan linh, ra đan viên mãn, không chuộng sát phạt', { alchemyYield: 0.18, attackPct: -0.04 }),
  a('apt_m_36', 'Khí Vận Thiên Lệch', 'fortune', 2, 'Thường gặp kỳ ngộ bí ẩn ly kỳ, song đồ rơi lúc săn quái lại ít ỏi', { eventLuck: 0.16, dropRate: -0.06 }),
  a('apt_m_37', 'Linh Giác Nhạy Bén', 'comprehension', 2, 'Cảm giác đối phương xuất chiêu trong chớp mắt, ra tay đón đầu phá né tránh', { accuracy: 0.08, speed: 8, maxHpPct: -0.05 }),
  a('apt_m_38', 'Bền Bỉ Chịu Khổ', 'cultivation', 2, 'Cần cù bền bỉ ngày qua ngày, khí huyết bền lâu dẫu bước chân thong thả', { regenPerRound: 0.015, cultivationSpeed: 0.08, speed: -6 }),
  a('apt_m_39', 'Tâm Chí Kiên Định', 'comprehension', 2, 'Đạo tâm như thép nguội trước thiên kiếp lôi đình, tâm niệm không nghiêng về tàn sát', { tribulationResist: 0.08, damageReduction: 0.04, attackPct: -0.04 }),
  a('apt_m_40', 'Khéo Tay Luyện Khí', 'craft', 2, 'Đôi tay tinh anh hiểu rõ thớ sắt linh khoáng, mê đắm búa đe hơn bồ đoàn', { forgeDiscount: 0.14, cultivationSpeed: -0.05 }),

  // =========================================================================
  // CẤP 3 — THƯỢNG PHẨM (Grade 3): 20 tư chất (Sở trường nổi bật, thuần cộng)
  // =========================================================================
  a('apt_u_41', 'Tu Luyện Tinh Tiến', 'cultivation', 3, 'Tu vi tiến cảnh vững vàng, mỗi ngày đều có thu hoạch mới', { cultivationSpeed: 0.15 }),
  a('apt_u_42', 'Căn Cốt Cường Kiện', 'physique', 3, 'Nhục thân kiên cố, huyết khí tràn trề tựa bàn thạch', { maxHpPct: 0.15, defensePct: 0.08 }),
  a('apt_u_43', 'Ngộ Tính Cao Minh', 'comprehension', 3, 'Tư duy mẫn tiệp thông tuệ, học đạo mau hiểu, kinh nghiệm chiến đấu phong phú', { cultivationSpeed: 0.12, expGain: 0.15 }),
  a('apt_u_44', 'Chiến Đấu Trực Giác', 'physique', 3, 'Bản năng dã thú tôi luyện trong chiến trận, ra đòn nặng và chuẩn xác', { damageBonus: 0.08, critRate: 0.04 }),
  a('apt_u_45', 'Tụ Tài Hữu Đạo', 'fortune', 3, 'Đầu óc kinh tài hữu phương, thu thập linh thạch và bảo vật dồi dào', { spiritStoneGain: 0.2, dropRate: 0.08 }),
  a('apt_u_46', 'Kiếm Đạo Thông Minh', 'comprehension', 3, 'Ý kiếm sắc sảo tự nhiên, đâm thủng phòng hộ, bạo kích hiểm hóc', { armorPen: 0.08, critDamage: 0.18 }),
  a('apt_u_47', 'Đao Pháp Tinh Thông', 'physique', 3, 'Đao ý hung tợn, lúc lâm nguy càng chém ra đòn bối thủy uy lực', { attackPct: 0.12, lowHpDamage: 0.12 }),
  a('apt_u_48', 'Thân Pháp Xuất Chúng', 'physique', 3, 'Tốc độ như gió cuốn mây bay, ra tay trước địch và né tránh nhẹ nhàng', { speed: 14, dodgeRate: 0.05 }),
  a('apt_u_49', 'Khí Huyết Như Rồng', 'physique', 3, 'Khí huyết sục sôi dồi dào, thân thể tự phục hồi sinh lực không ngừng', { maxHpPct: 0.18, regenPerRound: 0.015 }),
  a('apt_u_50', 'Linh Đài Thanh Minh', 'comprehension', 3, 'Linh đài sáng sủa không bụi bặm, phá giải bình cảnh thuận buồm xuôi gió', { cultivationSpeed: 0.14, breakthroughRate: 0.04 }),
  a('apt_u_51', 'Đạo Tâm Kiên Cố', 'comprehension', 3, 'Đạo tâm vững như bàn thạch, ngạnh kháng thiên kiếp lôi phạt', { tribulationResist: 0.1, damageReduction: 0.06 }),
  a('apt_u_52', 'Kinh Mạch Thông Suốt', 'cultivation', 3, 'Kinh mạch toàn thân rộng mở thông suốt, hấp thu chuyển hóa linh khí cực nhanh', { qiRegen: 0.2, cultivationSpeed: 0.1 }),
  a('apt_u_53', 'Linh Khí Thân Hòa', 'cultivation', 3, 'Thân thể tự nhiên thu hút linh khí trời đất, dung lượng khí hải bao la', { qiCapPct: 0.18, qiRegen: 0.16 }),
  a('apt_u_54', 'Đan Đạo Sơ Tông', 'craft', 3, 'Nắm bắt dược tính tinh vi, tăng tỷ lệ ra đan kép và kéo dài thọ nguyên', { alchemyYield: 0.22, lifespanPct: 0.12 }),
  a('apt_u_55', 'Khí Đạo Tinh Thông', 'craft', 3, 'Thông thạo trận văn rèn đúc, giảm tiêu hao tôi luyện và tăng công kích khí giới', { forgeDiscount: 0.16, attackPct: 0.06 }),
  a('apt_u_56', 'Thể Phách Cường Tráng', 'physique', 3, 'Gân cốt đúc bằng tinh thiết, vào trận tự ngưng tụ hộ thuẫn bảo vệ', { maxHpPct: 0.16, shieldOnStart: 0.08 }),
  a('apt_u_57', 'Thiện Chiến Đa Biến', 'physique', 3, 'Chiêu thức biến hóa khôn lường, liên kích liên miên không dứt', { comboRate: 0.07, accuracy: 0.08 }),
  a('apt_u_58', 'Phúc Duyên Thâm Hậu', 'fortune', 3, 'Được thiên đạo che chở, kỳ ngộ tốt lành thường xuyên giáng xuống', { luck: 0.14, eventLuck: 0.16 }),
  a('apt_u_59', 'Tâm Thần Tập Trung', 'comprehension', 3, 'Tinh thần ngưng tụ như mũi kim, nhắm chuẩn yếu hại đối phương gây bạo kích', { critDamage: 0.2, accuracy: 0.08 }),
  a('apt_u_60', 'Tiềm Lực Dồi Dào', 'cultivation', 3, 'Nội lực tiềm tàng sâu không thấy đáy, phá cảnh dẫu hỏng cũng hoàn trả tu vi', { expGain: 0.18, breakRefund: 0.12 }),

  // =========================================================================
  // CẤP 4 — ĐỊA PHẨM (Grade 4): 20 tư chất (Hiếm, định hình hướng build)
  // =========================================================================
  a('apt_e_61', 'Thiên Sinh Đạo Thể', 'cultivation', 4, 'Đạo thể bẩm sinh tương thông trời đất, tốc độ tu luyện và hồi linh khí vượt trội', { cultivationSpeed: 0.2, qiRegen: 0.22 }),
  a('apt_e_62', 'Linh Đài Sáng Tỏ', 'comprehension', 4, 'Linh đài trong vắt như gương sáng soi chiếu muôn pháp, phá cảnh hanh thông', { cultivationSpeed: 0.18, expGain: 0.2, breakthroughRate: 0.05 }),
  a('apt_e_63', 'Bách Chiến Chi Tài', 'physique', 4, 'Tài năng trăm trận trăm thắng, đòn đánh sắc bén hiểm hóc áp đảo quần hùng', { damageBonus: 0.12, critRate: 0.06, accuracy: 0.1 }),
  a('apt_e_64', 'Luyện Khí Kỳ Tài', 'craft', 4, 'Kỳ tài đúc luyện pháp khí, giảm sâu tiêu hao khoáng vật và gia tăng uy lực vũ khí', { forgeDiscount: 0.2, attackPct: 0.1 }),
  a('apt_e_65', 'Đan Đạo Linh Tâm', 'craft', 4, 'Trái tim thấu hiểu dược linh muôn cỏ cây, đan thành bội số, thọ mệnh dồi dào', { alchemyYield: 0.25, lifespanPct: 0.15 }),
  a('apt_e_66', 'Kiếm Cốt Thiên Thành', 'comprehension', 4, 'Cốt cách tựa thanh kiếm sắc bén xuất thế, phong mang áp chế, phá giáp xuyên tâm', { fullHpDamage: 0.18, armorPen: 0.12, critRate: 0.06 }),
  a('apt_e_67', 'Đao Tâm Bất Khuất', 'physique', 4, 'Ý chí đao đạo ngút trời, thương tích càng nặng sát thương bối thủy càng kinh hoàng', { lowHpDamage: 0.2, lowHpReduction: 0.1 }),
  a('apt_e_68', 'Kim Cương Thể Phách', 'physique', 4, 'Nhục thân kim cương bất hoại, cương thuẫn hộ thể biến thủ thành công', { defensePct: 0.2, shieldOnStart: 0.1, shieldPower: 0.12 }),
  a('apt_e_69', 'Thần Thức Tinh Thuần', 'comprehension', 4, 'Thần niệm sắc bén nhìn thấu mọi sơ hở, ra đòn tiên thủ chính xác tuyệt luân', { accuracy: 0.15, speed: 20, dodgeRate: 0.06 }),
  a('apt_e_70', 'Kinh Mạch Kỳ Dị', 'cultivation', 4, 'Kinh mạch biến dị dị thường, khí hải mở rộng dung nạp lượng linh khí khổng lồ', { qiCapPct: 0.2, qiRegen: 0.24, cultivationSpeed: 0.15 }),
  a('apt_e_71', 'Ngộ Đạo Thiên Phú', 'comprehension', 4, 'Thiên phú ngộ đạo trác tuyệt, bình cảnh dễ qua, thất bại cũng hoàn trả phần lớn', { breakthroughRate: 0.06, breakRefund: 0.2, cultivationSpeed: 0.16 }),
  a('apt_e_72', 'Linh Khí Cộng Minh', 'cultivation', 4, 'Linh khí toàn thân cộng minh cùng thiên địa, khuếch đại uy lực mọi đòn đánh', { damageBonus: 0.1, qiCapPct: 0.25 }),
  a('apt_e_73', 'Thiên Sinh Chiến Cốt', 'physique', 4, 'Xương cốt sinh ra để chiến trận, liên kích cuồng phong bão táp dồn dập', { comboRate: 0.1, comboDamage: 0.15 }),
  a('apt_e_74', 'Tĩnh Tâm Thủ Nhất', 'comprehension', 4, 'Tâm cảnh an định vững như bàn thạch, tu vi vững bước và miễn giảm sát thương', { cultivationSpeed: 0.18, damageReduction: 0.08 }),
  a('apt_e_75', 'Phúc Tinh Cao Chiếu', 'fortune', 4, 'Phúc tinh rực rỡ soi rọi đường tu tiên, kỳ ngộ thượng phẩm tự đến tìm người', { luck: 0.2, eventLuck: 0.22, dropRate: 0.15 }),
  a('apt_e_76', 'Thân Pháp Vô Song', 'physique', 4, 'Bộ pháp hư ảo thần sầu quỷ khốc, né tránh đòn đánh và xuất chiêu chớp nhoáng', { speed: 25, dodgeRate: 0.08 }),
  a('apt_e_77', 'Khí Huyết Hùng Hậu', 'physique', 4, 'Huyết mạch sục sôi như sông lớn, sinh lực dồi dào tự phục hồi mỗi hiệp', { maxHpPct: 0.25, regenPerRound: 0.02 }),
  a('apt_e_78', 'Bách Nghệ Thông Minh', 'craft', 4, 'Tinh thông đa nghệ đan phù khí trận, làm việc gì cũng thu được nhiều thành quả', { alchemyYield: 0.18, forgeDiscount: 0.16, spiritStoneGain: 0.2 }),
  a('apt_e_79', 'Đạo Tâm Bất Động', 'comprehension', 4, 'Trước thiên lôi sấm sét tâm không lay động, giảm sâu thương tổn thiên kiếp', { tribulationResist: 0.15, damageReduction: 0.08 }),
  a('apt_e_80', 'Tiềm Long Tại Uyên', 'fortune', 4, 'Rồng thiêng ẩn mình tích lũy chờ ngày bay lượn, chiến đấu thu hoạch gấp bội', { expGain: 0.22, doubleDropRate: 0.08 }),

  // =========================================================================
  // CẤP 5 — THIÊN PHẨM (Grade 5): 20 tư chất (Thiên tài hiếm gặp, chỉ số mạnh)
  // =========================================================================
  a('apt_h_81', 'Thiên Linh Đạo Cốt', 'cultivation', 5, 'Linh cốt trời ban ngưng tụ đạo vận, tu luyện thần tốc, phá cảnh tựa nước vỡ bờ', { cultivationSpeed: 0.25, breakthroughRate: 0.08, qiRegen: 0.25 }),
  a('apt_h_82', 'Vô Cấu Linh Thể', 'physique', 5, 'Thân thể không vướng bụi trần, sinh lực sung mãn, phòng ngự và miễn thương tuyệt hảo', { maxHpPct: 0.25, defensePct: 0.18, damageReduction: 0.1 }),
  a('apt_h_83', 'Thất Khiếu Linh Lung', 'comprehension', 5, 'Bảy khiếu thông suốt hiểu tận chân lý tạo hóa, tu vi tăng tiến với tốc độ kinh người', { cultivationSpeed: 0.22, expGain: 0.25, breakthroughRate: 0.06 }),
  a('apt_h_84', 'Thiên Mệnh Chiến Giả', 'physique', 5, 'Chiến giả mang thiên mệnh diệt thế, công kích bạo liệt và bạo kích chí mạng', { attackPct: 0.2, critRate: 0.08, critDamage: 0.25 }),
  a('apt_h_85', 'Phúc Duyên Trời Ban', 'fortune', 5, 'Trời cao ưu ái ban cho phúc trạch vô biên, bảo vật kỳ ngộ không ngừng xuất hiện', { luck: 0.28, eventLuck: 0.3, dropRate: 0.2 }),
  a('apt_h_86', 'Kiếm Đạo Thiên Tài', 'comprehension', 5, 'Đại tài kiếm đạo ngàn năm có một, phong mang kiếm ý phá sạch phòng hộ đối phương', { fullHpDamage: 0.25, armorPen: 0.18, critRate: 0.08 }),
  a('apt_h_87', 'Đao Đạo Thiên Tài', 'physique', 5, 'Đao ý bối thủy cuồng ngạo nghịch chuyển càn khôn, hút máu chuyển thành sức mạnh', { lowHpDamage: 0.28, lifesteal: 0.08, lowHpReduction: 0.12 }),
  a('apt_h_88', 'Bất Hoại Kim Thân', 'physique', 5, 'Kim thân bất hoại ngạo thị quần hùng, cương thuẫn hộ thể khuếch đại uy lực tối đa', { defensePct: 0.25, shieldOnStart: 0.15, shieldPower: 0.18 }),
  a('apt_h_89', 'Thần Thức Siêu Phàm', 'comprehension', 5, 'Thần niệm bao phủ chiến trường, tiên thủ tuyệt đối, không đòn nào né được', { speed: 35, accuracy: 0.2, dodgeRate: 0.1 }),
  a('apt_h_90', 'Đan Đạo Kỳ Tài', 'craft', 5, 'Kỳ tài đan đạo nắm giữ bí quyết đan thần, dược lực tột bực, thọ mệnh trường xuân', { alchemyYield: 0.3, lifespanPct: 0.2, spiritStoneGain: 0.2 }),
  a('apt_h_91', 'Khí Đạo Kỳ Tài', 'craft', 5, 'Đôi tay luyện ra thần binh bảo giáp, tôi luyện tiết kiệm và nâng tầm chiến lực', { forgeDiscount: 0.25, attackPct: 0.12, defensePct: 0.1 }),
  a('apt_h_92', 'Thiên Sinh Chiến Thể', 'physique', 5, 'Thân thể chiến thần bẩm sinh, liên kích cuồng bạo đánh tan tác phòng tuyến địch', { comboRate: 0.14, comboDamage: 0.2, damageBonus: 0.12 }),
  a('apt_h_93', 'Linh Khí Thân Hòa Tuyệt Hảo', 'cultivation', 5, 'Linh khí vây quanh tựa mây ôm núi, linh hải vô biên hồi phục thần tốc', { qiCapPct: 0.3, qiRegen: 0.3, cultivationSpeed: 0.15 }),
  a('apt_h_94', 'Đạo Tâm Thuần Nhất', 'comprehension', 5, 'Tâm ý thanh tịnh thuần khiết không vướng trần ai, tu luyện vững bền và giảm thương', { cultivationSpeed: 0.24, damageReduction: 0.1, tribulationResist: 0.15 }),
  a('apt_h_95', 'Ngộ Tính Siêu Quần', 'comprehension', 5, 'Ngộ tính siêu việt thời đại, ngộ đạo một ngày bằng người khác tu trăm năm', { expGain: 0.3, breakRefund: 0.25, cultivationSpeed: 0.2 }),
  a('apt_h_96', 'Thánh Thể Sơ Thành', 'physique', 5, 'Nhục thân bước vào cảnh giới thánh thể, sinh mệnh vô tận hóa thuẫn hộ mạng', { maxHpPct: 0.28, regenPerRound: 0.025, overhealShield: 0.12 }),
  a('apt_h_97', 'Thiên Cơ Linh Giác', 'fortune', 5, 'Linh giác chạm đến thiên cơ, rơi đồ nhân đôi và kỳ ngộ thượng cổ thường gặp', { doubleDropRate: 0.12, luck: 0.25, eventLuck: 0.25 }),
  a('apt_h_98', 'Vạn Pháp Tinh Thông', 'comprehension', 5, 'Hiểu thấu áo nghĩa vạn pháp huyền môn, sát thương toàn diện và phá giáp', { damageBonus: 0.16, armorPen: 0.15, breakthroughRate: 0.06 }),
  a('apt_h_99', 'Long Tượng Thần Lực', 'physique', 5, 'Thần lực rồng voi trong huyết quản, công kích kinh hoàng chấn nhiếp choáng địch', { attackPct: 0.22, stunRate: 0.08, executeDamage: 0.15 }),
  a(
    'apt_nhatkien',
    'Nhất Kiến Chung Tình',
    'charm',
    5,
    'Dung mạo xuất trần, gặp gỡ kết duyên. Vừa bước vào tiên lộ đã có một đạo lữ kề vai sát cánh',
    { attackPct: 0.12, cultivationSpeed: 0.15, maxHpPct: 0.1 },
    1.0
  ),

  // =========================================================================
  // CẤP 6 — TUYỆT PHẨM (Grade 6): 20 tư chất (Cực hiếm, chí tôn đỉnh phong)
  // =========================================================================
  a('apt_s_101', 'Tiên Thiên Đạo Thai', 'cultivation', 6, 'Bẩm sinh kết thành tiên thiên đạo thai, hấp nạp linh khí vô biên, phá vỡ mọi bình cảnh', { cultivationSpeed: 0.32, qiRegen: 0.35, breakthroughRate: 0.1 }),
  a('apt_s_102', 'Hỗn Nguyên Linh Thể', 'physique', 6, 'Hỗn nguyên một thể bất hoại trước vạn kiếp lôi đình, phòng ngự và sinh lực tối thượng', { maxHpPct: 0.35, defensePct: 0.25, tribulationResist: 0.2, damageReduction: 0.12 }),
  a('apt_s_103', 'Ngộ Đạo Chân Chủng', 'comprehension', 6, 'Gieo mầm chân chủng đại đạo vào thần hồn, ngộ tính nghịch thiên, tu vi chiến đấu bùng nổ', { cultivationSpeed: 0.3, expGain: 0.35, breakRefund: 0.3 }),
  a('apt_s_104', 'Thiên Mệnh Chi Tử', 'fortune', 6, 'Khí vận thiên mệnh chi tử đích thực, bảo vật tự tìm đến, chiến lợi phẩm thường nhân đôi', { luck: 0.35, eventLuck: 0.35, dropRate: 0.25, doubleDropRate: 0.15 }),
  a('apt_s_105', 'Vạn Pháp Thông Minh', 'comprehension', 6, 'Vạn pháp quy tông thông tỏ nguồn cội, gia tăng toàn diện uy lực sát thương và tu luyện', { damageBonus: 0.2, cultivationSpeed: 0.25, armorPen: 0.18 }),
  a('apt_s_106', 'Bất Diệt Chiến Thể', 'physique', 6, 'Thể phách thần ma bất tử trong chiến trận, hút máu dưỡng thân, hồi phục không ngừng', { maxHpPct: 0.3, regenPerRound: 0.03, lowHpReduction: 0.18, lifesteal: 0.1 }),
  a('apt_s_107', 'Vô Thượng Kiếm Cốt', 'comprehension', 6, 'Kiếm cốt vô thượng ngạo thị chư thiên, phong mang sắc lạnh chém vỡ mọi hộ giáp', { fullHpDamage: 0.32, critRate: 0.1, critDamage: 0.35, armorPen: 0.2 }),
  a('apt_s_108', 'Tuyệt Thế Đao Tâm', 'physique', 6, 'Đao ý bối thủy cái thế nghịch cảnh đoạt mạng, cuồng sát hút máu lúc nguy nan', { lowHpDamage: 0.35, lifesteal: 0.12, attackPct: 0.22, lowHpReduction: 0.15 }),
  a('apt_s_109', 'Tiên Phẩm Đan Tâm', 'craft', 6, 'Đan tâm hóa cảnh đại tông sư huyền thoại, một lò đan xuất bội số, thọ mệnh trường cửu', { alchemyYield: 0.4, lifespanPct: 0.3, spiritStoneGain: 0.25 }),
  a('apt_s_110', 'Tiên Phẩm Khí Cốt', 'craft', 6, 'Khí cốt tiên nhân tôi luyện thần khí, tôi rèn đại giảm chi phí, tăng công thủ toàn diện', { forgeDiscount: 0.32, attackPct: 0.16, defensePct: 0.16 }),
  a('apt_s_111', 'Hư Không Linh Giác', 'physique', 6, 'Thân hình tựa như hòa vào hư vô, né tránh đòn đánh thần sầu, thân pháp cực nhanh', { dodgeRate: 0.12, speed: 40, accuracy: 0.2 }),
  a('apt_s_112', 'Thái Sơ Thần Thức', 'comprehension', 6, 'Thần niệm thái sơ mênh mông như biển cả, tiên thủ áp đảo toàn trường, không ai né được', { speed: 45, accuracy: 0.25, firstStrike: 0.2 }),
  a('apt_s_113', 'Vạn Kiếp Bất Khuất', 'physique', 6, 'Vạn kiếp lôi đình không thể khuất phục, phản kích cuồng phong, giảm thương kiên cố', { tribulationResist: 0.25, counterRate: 0.12, counterDamage: 0.25, damageReduction: 0.12 }),
  a('apt_s_114', 'Thiên Địa Thân Hòa', 'cultivation', 6, 'Hòa làm một cùng càn khôn đại địa, dung lượng khí hải vô cùng và tốc độ tu luyện vượt bậc', { qiCapPct: 0.35, qiRegen: 0.35, cultivationSpeed: 0.25 }),
  a('apt_s_115', 'Chí Tôn Đạo Tâm', 'comprehension', 6, 'Đạo tâm chí tôn bất động trước vạn ma, tu vi và kinh nghiệm chiến đấu tăng tiến đỉnh cao', { cultivationSpeed: 0.3, expGain: 0.3, damageReduction: 0.12 }),
  a('apt_s_116', 'Vô Song Chiến Hồn', 'physique', 6, 'Chiến hồn vô song bách chiến bách thắng, liên kích kinh hoàng và xử quyết địch nhân', { comboRate: 0.18, comboDamage: 0.25, executeDamage: 0.22, attackPct: 0.2 }),
  a('apt_s_117', 'Cửu Chuyển Linh Thể', 'physique', 6, 'Cửu chuyển viên mãn nhục thân đại đạo, huyết mạch hồi phục hóa thành tầng tầng hộ thuẫn', { maxHpPct: 0.32, overhealShield: 0.2, regenPerRound: 0.025, defensePct: 0.2 }),
  a('apt_s_118', 'Đại Đạo Chi Tư', 'cultivation', 6, 'Tư chất đệ nhất xưa nay chưa từng có, nâng đỡ toàn diện công thủ, khí huyết và vận số', { cultivationSpeed: 0.25, attackPct: 0.15, defensePct: 0.15, maxHpPct: 0.2, luck: 0.2 }),
  a('apt_s_119', 'Hỗn Độn Đạo Chủng', 'comprehension', 6, 'Đạo chủng hỗn độn sơ khai sinh vạn pháp, uy lực sát thương và phòng ngự chí tôn', { damageBonus: 0.2, defensePct: 0.2, armorPen: 0.2, breakthroughRate: 0.08 }),
  a('apt_s_120', 'Vô Thượng Tiên Tư', 'charm', 6, 'Tư chất tiên nhân chí cao vô thượng, dung hợp khí vận ngút trời, mị lực cái thế độc tôn', { cultivationSpeed: 0.28, attackPct: 0.18, maxHpPct: 0.22, luck: 0.25 }, 1.2)
]

const APTITUDE_MAP = new Map<string, AptitudeDef>(APTITUDES.map(x => [x.id, x]))

export const FIRST_LOVE_APTITUDE_ID = 'apt_nhatkien'

/**
 * Bảng ánh xạ ID từ hệ thống cũ (29 tư chất bản nháp) sang các tư chất tương ứng trong hệ thống 120 tư chất mới,
 * bảo đảm 100% tương thích ngược và không làm hỏng bất kỳ bản save nào của người chơi.
 */
const OLD_ID_ALIASES: Record<string, string> = {
  apt_tongtue: 'apt_u_43',
  apt_minhtam: 'apt_u_50',
  apt_quangminh: 'apt_e_62',
  apt_thatkhieu: 'apt_h_83',
  apt_thiennhan: 'apt_s_103',
  apt_khihai: 'apt_u_52',
  apt_tienthiendaogu: 'apt_e_61',
  apt_tuthuydanphuong: 'apt_e_70',
  apt_thuanduongthe: 'apt_h_81',
  apt_honnguyendaothe: 'apt_s_101',
  apt_huuphuc: 'apt_u_58',
  apt_phuctrach: 'apt_e_75',
  apt_dakhivan: 'apt_h_85',
  apt_thienmenhquy: 'apt_s_104',
  apt_nghichthienkhivan: 'apt_s_104',
  apt_thanhnha: 'apt_m_23',
  apt_phongluu: 'apt_u_48',
  apt_khuynhthanh: 'apt_e_76',
  apt_h_100: 'apt_nhatkien',
  apt_trichtien: 'apt_nhatkien',
  apt_tuyetdaithienkieu: 'apt_s_120',
  apt_khangkien: 'apt_u_42',
  apt_kimcang: 'apt_u_56',
  apt_cuuchuyenhuyenthe: 'apt_e_68',
  apt_batdietkimthan: 'apt_h_88',
  apt_thanmabatdiet: 'apt_s_106',
  apt_dannghe: 'apt_u_54',
  apt_bachluyen: 'apt_u_55',
  apt_duocthan: 'apt_e_65',
  apt_thancong: 'apt_h_91',
  apt_vanvatthonglinh: 'apt_s_110'
}

export function aptitudeDef(id: string): AptitudeDef | undefined {
  const resolvedId = OLD_ID_ALIASES[id] ?? id
  const item = APTITUDE_MAP.get(resolvedId)
  if (item && resolvedId !== id) {
    // Nếu tra qua ID cũ, giữ lại alias name/id để tương thích spec cũ
    if (id === 'apt_tongtue') return { ...item, id, name: 'Thông Tuệ' }
    if (id === 'apt_khangkien') return { ...item, id, name: 'Thân Thể Khang Kiện' }
    return { ...item, id }
  }
  return item
}

/**
 * Gieo xúc xắc ngẫu nhiên tư chất khởi đầu (mặc định 3 tư chất không trùng lặp)
 */
export function rollAptitudes(random: RandomService, count = 3): AptitudeDef[] {
  const selected: AptitudeDef[] = []
  const pool = [...APTITUDES]

  while (selected.length < count && pool.length > 0) {
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0)
    let roll = random.int(1, Math.floor(totalWeight * 10)) / 10
    let pickedIdx = 0

    for (let i = 0; i < pool.length; i++) {
      const item = pool[i]!
      if (roll <= item.weight) {
        pickedIdx = i
        break
      }
      roll -= item.weight
    }

    const [picked] = pool.splice(pickedIdx, 1)
    if (picked) {
      selected.push(picked)
    }
  }

  // Sắp xếp hiển thị theo phẩm cấp từ cao xuống thấp
  return selected.sort((a, b) => b.grade - a.grade)
}
