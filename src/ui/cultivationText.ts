/**
 * 修行页提示 —— 疗伤、备药、突破门槛。
 *
 * 卡片与 toast 同源。写成「不足」太硬,缕数与药资仍得报清。
 */
export function repairIdleToast(): string {
  return 'Chu thân vô ngại, không cần tĩnh dưỡng'
}

export function repairShortToast(qiText: string): string {
  return `Linh khí chưa đủ, tĩnh dưỡng cần ${qiText} luồng`
}

export function repairDoneToast(qiText: string): string {
  return `Ngươi dẫn linh khí tĩnh dưỡng, thương thế khỏi hẳn (tiêu hao ${qiText} linh khí)`
}

export function repairActLabel(affordable: boolean, qiText: string): string {
  return affordable ? `Dẫn khí trị thương · Tiêu hao ${qiText} linh khí` : repairShortToast(qiText)
}

export function prepPillShortToast(): string {
  return 'Linh thạch chưa đủ, không thể bị dược'
}

/** 服聚气丹按钮欠资时的禁用说明 —— 与备药 toast 同一句「灵石未足」,不在模板里手打 */
export function prepPillDisabledLabel(): string {
  return 'Linh thạch chưa đủ'
}

export function breakthroughPeakReason(): string {
  return 'Đã đến đỉnh cao đại đạo'
}

export function breakthroughExpReason(): string {
  return 'Tu vi chưa đạt viên mãn'
}

export function breakthroughQiReason(qiText: string): string {
  return `Linh khí chưa đủ, ải này cần ${qiText} luồng`
}

export function breakthroughActLabel(needTribulation: boolean): string {
  return needTribulation ? 'Dẫn kiếp đột phá' : 'Thử đột phá'
}

export function breakthroughGoalText(near: boolean, needTribulation: boolean, targetLabel: string): string {
  if (!near) return `Hướng tới「${targetLabel}」tiến bước`
  return `${breakthroughActLabel(needTribulation)}「${targetLabel}」`
}

export function breakthroughReadyNote(needTribulation: boolean): string {
  return `Tu vi đã đạt viên mãn, có thể ${breakthroughActLabel(needTribulation)}`
}

// ---- 悟道兑换(Phase C-1):灵石 → 悟道点,tost 文案一处出,不在视图里硬写 ----
export function exchangeOkToast(reward: number): string {
  return `Điểm Ngộ Đạo +${reward}`
}
export function exchangeFailText(lockedByRealm: boolean): string {
  return lockedByRealm ? 'Cảnh giới chưa tới, chưa mở đổi' : 'Linh thạch chưa đủ / Hôm nay đã đổi đầy'
}

