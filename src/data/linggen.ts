/** 五行与特殊灵根元数据 */
import type { ElementId } from '@/types'

export interface ElementMeta {
  id: ElementId
  name: string
  /** 单字符号,用于水墨圆章展示 */
  char: string
  color: string
  special: boolean
}

export const ELEMENTS: Record<ElementId, ElementMeta> = {
  metal: { id: 'metal', name: 'Kim', char: 'Kim', color: 'var(--color-gold-ink)', special: false },
  wood: { id: 'wood', name: 'Mộc', char: 'Mộc', color: 'var(--color-jade)', special: false },
  water: { id: 'water', name: 'Thủy', char: 'Thủy', color: 'var(--color-azure)', special: false },
  fire: { id: 'fire', name: 'Hỏa', char: 'Hỏa', color: 'var(--color-cinnabar)', special: false },
  earth: { id: 'earth', name: 'Thổ', char: 'Thổ', color: '#8A6F4D', special: false },
  wind: { id: 'wind', name: 'Phong', char: 'Phong', color: '#5E8C8A', special: true },
  thunder: { id: 'thunder', name: 'Lôi', char: 'Lôi', color: 'var(--color-violet-ink)', special: true },
  ice: { id: 'ice', name: 'Băng', char: 'Băng', color: '#6D93B8', special: true },
  light: { id: 'light', name: 'Quang', char: 'Quang', color: '#C9A227', special: true },
  dark: { id: 'dark', name: 'Ám', char: 'Ám', color: '#4A463D', special: true },
  chaos: { id: 'chaos', name: 'Hỗn Độn', char: 'Hỗn', color: 'var(--color-ink)', special: true }
}

export const BASIC_ELEMENTS: ElementId[] = ['metal', 'wood', 'water', 'fire', 'earth']
export const SPECIAL_ELEMENTS: ElementId[] = ['wind', 'thunder', 'ice', 'light', 'dark']
