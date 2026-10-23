/**
 * 功法参悟提示 —— 残卷、精进。
 *
 * 藏经阁与功法升级是修行页高频短句。残页、悟道点、层数仍报清。
 */
export function gongfaPageShortToast(): string {
  return 'Tàn trang chưa đủ, khó ghép thiên này'
}

export function gongfaAllLearnedToast(): string {
  return 'Công pháp cảnh giới này đã lĩnh ngộ toàn bộ'
}

export function gongfaComprehendToast(name: string): string {
  return `Tàn quyển ghép lại, ngươi lĩnh ngộ ra《${name}》`
}

export function gongfaUpShortToast(): string {
  return 'Điểm Ngộ Đạo hoặc tàn trang chưa đủ, khó lòng tinh tiến'
}

export function gongfaUpDoneToast(name: string, level: number): string {
  return `《${name}》lại tiến thêm một tầng, đã đạt tầng ${level}`
}

export function gongfaSubFullToast(slots: number): string {
  return `Phụ tu đã đầy ${slots} vị trí, mở rộng Tàng Kinh Các mới có thể thêm nạp`
}
