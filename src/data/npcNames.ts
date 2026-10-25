/**
 * Hệ Thống Họ, Phụ (Tên Đệm) và Tên Tu Chân Giới (Cultivation NPC Name Generation)
 *
 * Cung cấp kho dữ liệu phong phú gồm:
 * - Họ (Surnames): Gồm họ đơn phổ biến và các phức tính (họ kép) cổ phong tu tiên.
 * - Phụ (Middle Names): Tên đệm phân hóa theo giới tính Nam, Nữ và Trung tính.
 * - Tên (Given Names): Tên gọi mang đậm âm hưởng tiên hiệp, kiếm hiệp, huyền huyễn.
 *
 * Hỗ trợ sinh tên ngẫu nhiên không trùng lặp (Unique Name Generator) với hơn 200,000 tổ hợp.
 */
import { rng, type RandomService } from '@/utils/random'

/** Danh sách Họ đơn và Phức tính (Họ kép) tu tiên (gần 90 họ) */
export const SURNAMES: readonly string[] = [
  // Họ đơn phổ biến tu tiên
  'Tiêu', 'Diệp', 'Sở', 'Hàn', 'Thẩm', 'Lâm', 'Cố', 'Tô', 'Lục', 'Cơ',
  'Liễu', 'Bạch', 'Khương', 'Doãn', 'Ninh', 'Lãnh', 'Dạ', 'Trần', 'Hoàng', 'Vũ',
  'Đặng', 'Tạ', 'Chung', 'Tần', 'Phan', 'Kha', 'Càn', 'Tống', 'Tào', 'Vương',
  'Chu', 'Trịnh', 'Tôn', 'Lý', 'Triệu', 'Phùng', 'Quách', 'Hứa', 'Viên', 'Bành',
  'Hà', 'Đổng', 'Lương', 'Dương', 'Phong', 'Lôi', 'Vân', 'Thủy', 'Mặc', 'Hoa',
  'Nhiễm', 'Cung', 'Du', 'Giản', 'Úc', 'Trình', 'Bùi', 'Chúc', 'Ngu', 'Nhạc',
  'Thôi', 'Mạnh', 'Khang', 'Thạch', 'Thi', 'Nhậm', 'Cảnh', 'Nghiêm', 'Thường', 'Cổ',

  // Phức tính (Họ kép cổ phong)
  'Mộ Dung', 'Thượng Quan', 'Âu Dương', 'Tư Đồ', 'Lệnh Hồ', 'Nam Cung', 'Độc Cô',
  'Gia Cát', 'Đông Phương', 'Bách Lý', 'Tây Môn', 'Hách Liên', 'Hoàng Phủ', 'Đan Đài',
  'Vạn Sĩ', 'Đoan Mộc', 'Tư Mã', 'Bắc Minh'
]

/** Danh sách Phụ (Tên đệm) cho Nam tu sĩ */
export const MIDDLE_NAMES_MALE: readonly string[] = [
  'Tử', 'Thiên', 'Thanh', 'Vô', 'Huyền', 'Thần', 'Minh', 'Trạch', 'Mặc', 'Lạc',
  'Vân', 'Kiếm', 'Nhược', 'Cảnh', 'Trường', 'Triệt', 'Hạo', 'Phong', 'Dật', 'Tiêu',
  'Lăng', 'Đình', 'Hải', 'Phách', 'Ngạn', 'Tông', 'Trọng', 'Bá', 'Khang', 'Trí',
  'Dực', 'Khải', 'Nguyên', 'Tuấn', 'Chính', 'Quốc', 'Quân', 'Tùng', 'Bách', 'Chấn',
  'Trực', 'Hùng', 'Long', 'Chấn', 'Đức', 'Tấn', 'Vũ', 'Viêm', 'Lôi', 'Thái'
]

/** Danh sách Phụ (Tên đệm) cho Nữ tu sĩ */
export const MIDDLE_NAMES_FEMALE: readonly string[] = [
  'Tử', 'Uyển', 'Vũ', 'Như', 'Thiền', 'Linh', 'Vân', 'Nhược', 'Mộng', 'Nguyệt',
  'Tố', 'Thanh', 'Dạ', 'Tuyết', 'Dao', 'Băng', 'Hàm', 'Ngưng', 'Bạch', 'Yên',
  'Mộc', 'Lan', 'Cẩm', 'Tinh', 'Tâm', 'Thi', 'Diễm', 'Thải', 'Tú', 'Khanh',
  'Ngọc', 'Tiên', 'Hân', 'Hà', 'Thu', 'Thục', 'Giai', 'Xuân', 'Thảo', 'Trúc',
  'Quỳnh', 'Mai', 'Thùy', 'Hương', 'Huyền', 'Thư', 'Diệp', 'Phương', 'Bích', 'Ý'
]

/** Danh sách Phụ (Tên đệm) dùng chung */
const MIDDLE_NAMES_UNISEX: readonly string[] = [
  'Thanh', 'Tử', 'Vân', 'Thiên', 'Nhược', 'Mặc', 'Lạc', 'Tố', 'Huyền', 'Tinh',
  'Minh', 'Dạ', 'Lam', 'Thu', 'Diệu', 'An', 'Bình', 'Hạo', 'Kỳ', 'Hân'
]

/** Danh sách Tên (Given Name) cho Nam tu sĩ */
export const FIRST_NAMES_MALE: readonly string[] = [
  'Dật', 'Phong', 'Triệt', 'Hạo', 'Tiêu', 'Hàn', 'Hiên', 'Viễn', 'Duệ', 'Vũ',
  'Trần', 'Hoan', 'Hà', 'Thâm', 'Minh', 'Hải', 'Nhất', 'Huyền', 'Lân', 'Thần',
  'Cương', 'Tung', 'Liệt', 'Xuyên', 'Dương', 'Khuyết', 'Luân', 'Kiếm', 'Đạo', 'Đăng',
  'Quân', 'Long', 'Hổ', 'Bằng', 'Diệu', 'Sâm', 'Vực', 'Uy', 'Cực', 'Tông',
  'Tề', 'Bác', 'Trực', 'Khiêm', 'Vọng', 'Lãng', 'Sách', 'Kỳ', 'Thương', 'Nguyên'
]

/** Danh sách Tên (Given Name) cho Nữ tu sĩ */
export const FIRST_NAMES_FEMALE: readonly string[] = [
  'Thanh', 'Đồng', 'Tuyết', 'Y', 'Huyên', 'Yên', 'Tê', 'Vi', 'Điệp', 'Thiềm',
  'Thành', 'Vân', 'Tâm', 'Uyển', 'Nguyệt', 'Nhi', 'Cơ', 'Ngưng', 'Hương', 'Lạc',
  'San', 'Lộ', 'Vũ', 'Sương', 'Mi', 'Nghi', 'Dung', 'Thường', 'Tiên', 'Thảo',
  'Trúc', 'Cầm', 'Họa', 'Trân', 'Linh', 'Châu', 'Huỳnh', 'Kiều', 'Thiến', 'Bích',
  'Lan', 'Nhàn', 'Tú', 'Khuê', 'Cúc', 'Mai', 'Thoa', 'Trang', 'Loan', 'Phượng'
]

/**
 * Sinh ngẫu nhiên một Họ + Phụ + Tên hoàn chỉnh
 */
export function generateRandomFullName(
  gender: 'male' | 'female',
  customRng: RandomService = rng
): string {
  const surname = customRng.pick(SURNAMES)
  const middle = customRng.chance(0.15)
    ? customRng.pick(MIDDLE_NAMES_UNISEX)
    : gender === 'male'
      ? customRng.pick(MIDDLE_NAMES_MALE)
      : customRng.pick(MIDDLE_NAMES_FEMALE)
  const first = gender === 'male'
    ? customRng.pick(FIRST_NAMES_MALE)
    : customRng.pick(FIRST_NAMES_FEMALE)

  // Tránh đệm và tên trùng chữ nhau (ví dụ: Vũ Vũ, Thanh Thanh)
  if (middle === first) {
    const altFirst = gender === 'male'
      ? customRng.pick(FIRST_NAMES_MALE.filter(n => n !== middle))
      : customRng.pick(FIRST_NAMES_FEMALE.filter(n => n !== middle))
    return `${surname} ${middle} ${altFirst}`
  }

  return `${surname} ${middle} ${first}`
}

/**
 * Sinh tên NPC bảo đảm không trùng lặp với danh sách tên đã tồn tại
 *
 * @param gender Giới tính NPC ('male' | 'female')
 * @param existingNames Tập hợp các tên đã xuất hiện trong game
 * @param customRng Máy sinh số ngẫu nhiên
 * @param maxAttempts Số lần thử tối đa trước khi thêm định danh số phụ
 */
export function generateUniqueNpcName(
  gender: 'male' | 'female',
  existingNames: Set<string>,
  customRng: RandomService = rng,
  maxAttempts = 50
): string {
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = generateRandomFullName(gender, customRng)
    if (!existingNames.has(candidate)) {
      existingNames.add(candidate)
      return candidate
    }
  }

  // Trường hợp hiếm hoi trùng quá nhiều lần: ghép thêm một hậu tố phân biệt nhẹ
  const fallbackSurname = customRng.pick(SURNAMES)
  const fallbackFirst = gender === 'male'
    ? customRng.pick(FIRST_NAMES_MALE)
    : customRng.pick(FIRST_NAMES_FEMALE)
  const numberedCandidate = `${fallbackSurname} ${fallbackFirst} ${customRng.int(1, 99)}`
  existingNames.add(numberedCandidate)
  return numberedCandidate
}
