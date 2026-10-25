/**
 * Linh Căn Quả —— Vật phẩm quý hiếm bồi dưỡng tư chất linh căn.
 *
 * Chỉ đản sinh trong bí cảnh thiên địa hiểm trở với xác suất thấp.
 * Gồm 3 cấp độ:
 * - Phàm Phẩm Linh Căn Quả: Tăng +1 tư chất linh căn
 * - Trung Phẩm Linh Căn Quả: Tăng +5 tư chất linh căn
 * - Thượng Phẩm Linh Căn Quả: Tăng +10 tư chất linh căn
 */

export type SpiritRootFruitTier = 'mortal' | 'earth' | 'heaven'

export interface SpiritRootFruitDef {
  tier: SpiritRootFruitTier
  name: string
  bonus: number
  color: string
  desc: string
  icon: string
}

export const SPIRIT_ROOT_FRUITS: Record<SpiritRootFruitTier, SpiritRootFruitDef> = {
  mortal: {
    tier: 'mortal',
    name: 'Phàm Phẩm Linh Căn Quả',
    bonus: 1,
    color: 'var(--color-ink-soft)',
    desc: 'Linh quả sinh trưởng nơi bí cảnh thiên địa, ẩn chứa tinh hoa linh khí thuần khiết. Uống vào giúp tăng vĩnh viễn 1 điểm tư chất linh căn.',
    icon: 'sparkles'
  },
  earth: {
    tier: 'earth',
    name: 'Trung Phẩm Linh Căn Quả',
    bonus: 5,
    color: 'var(--color-gold-ink)',
    desc: 'Linh quả ngàn năm hấp thu linh mạch bí cảnh, linh vận nồng đượm. Uống vào giúp tăng vĩnh viễn 5 điểm tư chất linh căn.',
    icon: 'sparkles'
  },
  heaven: {
    tier: 'heaven',
    name: 'Thượng Phẩm Linh Căn Quả',
    bonus: 10,
    color: 'var(--color-violet-ink)',
    desc: 'Thiên địa kỳ quả vạn năm khó gặp, chỉ đản sinh tại nơi sâu thẳm nhất của bí cảnh hiểm địa. Uống vào giúp tăng vĩnh viễn 10 điểm tư chất linh căn.',
    icon: 'sparkles'
  }
}

export const SPIRIT_ROOT_FRUIT_TIERS: readonly SpiritRootFruitTier[] = ['mortal', 'earth', 'heaven']
