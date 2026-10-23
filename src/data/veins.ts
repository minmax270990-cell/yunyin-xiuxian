/**
 * 洞府灵脉 —— Phase 30.3
 * 一条主脉(70 点)+ 若干副脉(各 ≤30 点),总容量 100:不能全部点满,方向即取舍。
 */
import type { StatMods } from '@/types'

export type VeinId = 'gather' | 'craft' | 'alchemy' | 'insight'

export interface VeinDef {
  id: VeinId
  name: string
  seal: string
  desc: string
  /** 每点带来的属性加成(悟道脉走参悟折扣,不在此表) */
  perPoint: StatMods
}

export const VEINS: VeinDef[] = [
  {
    id: 'gather',
    name: 'Thanh Mộc Linh Mạch',
    seal: 'Tụ',
    desc: 'Linh khí tụ lưu, tu hành công bội',
    perPoint: { cultivationSpeed: 0.004 }
  },
  {
    id: 'craft',
    name: 'Xích Viêm Linh Mạch',
    seal: 'Luyện',
    desc: 'Địa hỏa thối khí, cường hóa hao tài càng bớt',
    perPoint: { forgeDiscount: 0.003 }
  },
  {
    id: 'alchemy',
    name: 'Ngọc Tủy Linh Mạch',
    seal: 'Đan',
    desc: 'Dược khí mịt mù, trong lò thường ra đan đôi',
    perPoint: { alchemyYield: 0.005 }
  },
  {
    id: 'insight',
    name: 'Hàn Minh Linh Mạch',
    seal: 'Ngộ',
    desc: 'Tĩnh thủy ánh nguyệt, tham ngộ công pháp tốn hao càng ít',
    perPoint: {}
  }
]

/** 悟道脉每点参悟折扣 */
export const INSIGHT_DISCOUNT_PER_POINT = 0.004
/** 参悟省耗封顶 —— 展示与结算都以它为顶(现容量最多 70 点=28%,此值防未来加容量或调每点后展示与结算分叉) */
export const INSIGHT_DISCOUNT_CAP = 0.5
/** 与投资卡「当前加成」同一称呼,避免一条脉两个名字 */
export const INSIGHT_EFFECT_NAME = 'Giảm hao tổn tham ngộ'

export function veinDef(id: VeinId): VeinDef {
  return VEINS.find(v => v.id === id)!
}
