/** Tự động tạo đạo hiệu ngẫu nhiên */
import { RandomService } from '@/utils/random'

const SURNAMES = ['Vân', 'Phong', 'Diệp', 'Tô', 'Lạc', 'Thẩm', 'Cố', 'Lục', 'Tần', 'Sở', 'Tiêu', 'Lăng', 'Bạch', 'Mặc', 'Giang', 'Hàn']
const GIVEN = ['Trần', 'Thanh', 'Sương', 'Nghiên', 'Lâm Uyên', 'Sơ Ảnh', 'Chiếu Dạ', 'Quy Hồng', 'Phù Dao', 'Thính Tuyết', 'Cô Hạc', 'Vô Cữu', 'Tri Phi', 'Thủ Chuyết', 'Vọng Thư', 'Kinh Hồng']

export function randomDaoName(rng: RandomService): string {
  return rng.pick(SURNAMES) + ' ' + rng.pick(GIVEN)
}
