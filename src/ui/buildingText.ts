/**
 * 洞府营造提示 —— 起造与再进。
 *
 * 卡片上的拒绝原因与 toast 同源。写成「不足」「升至 N 级」太硬,
 * 但境界、层数、灵石玄铁仍得报清。
 */
import { REALMS } from '@/data/realms'

export function buildingRealmGate(realmName: string): string {
  return `Chưa đến ${realmName} cảnh, khó dựng kiến trúc này`
}

/**
 * 建筑境界闸所对的境名 —— unlockRealm 就是 REALMS 的下标(与 player.major 同轴:
 * 判据是 player.major < def.unlockRealm),故直接读表取境名,不手抄「金丹」这类字
 * (三处调用曾各有一份 ['炼气','筑基','金丹'],门槛一改四处对对不上)。
 */
export function buildingGateRealmName(unlockRealm: number): string {
  return REALMS[unlockRealm]?.name ?? 'Cao hơn'
}

export function buildingPeakToast(): string {
  return 'Kiến trúc này đã đạt đỉnh tầng'
}

export function buildingMansionGateToast(): string {
  return 'Động phủ chưa đủ rộng, kiến trúc này khó thăng tiếp'
}

export function buildingShortToast(): string {
  return 'Linh thạch hoặc huyền thiết chưa đủ, khó bắt đầu công trình'
}

export function buildingDoneToast(name: string, level: number): string {
  return `Xây dựng「${name}」tiến thêm, đã đạt cấp ${level}`
}

/** 建筑连升的总结账:一级一级报太吵,连升只报一次总况(stoneText 由调用方 formatGN 好) */
export function buildingBatchDoneToast(name: string, levels: number, newLevel: number, stoneText: string, ore: number): string {
  return `「${name}」liên tục thăng ${levels} cấp, nay đạt cấp ${newLevel}, tổng tiêu hao ${stoneText} linh thạch · ${ore} khối huyền thiết`
}

export function buildingActLabel(level: number): string {
  return level > 0 ? 'Tái Dựng' : 'Khởi Dựng'
}
