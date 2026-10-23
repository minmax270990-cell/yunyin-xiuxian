/**
 * 主页状态行 —— 只报玩家此刻真正处在的状态。
 *
 * 「闭关」是一条有时限、禁历练的增益,不是默认挂机。把静修一律写成闭关,
 * 玩家会以为自己已经封洞、出不去,或者反过来觉得闭关按钮没生效。
 */
export interface HomePresence {
  dead: boolean
  /** 正在历练会话中(与闭关互斥,由探索入口守卫) */
  adventuring: boolean
  regionName: string
  injured: boolean
  retreating: boolean
  expFull: boolean
}

export function homeStatusText(p: HomePresence): string {
  if (p.dead) return 'Vẫn lạc'
  if (p.adventuring) return `Đang lịch luyện · ${p.regionName}`
  if (p.injured) return 'Đang trị thương'
  if (p.retreating) return 'Đang bế quan'
  if (p.expFull) return 'Tu vi đã viên mãn'
  return 'Đang tu luyện'
}
