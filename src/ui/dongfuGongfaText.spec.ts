import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  buildingActLabel,
  buildingDoneToast,
  buildingMansionGateToast,
  buildingPeakToast,
  buildingRealmGate,
  buildingShortToast
} from './buildingText'
import {
  gongfaAllLearnedToast,
  gongfaComprehendToast,
  gongfaPageShortToast,
  gongfaSubFullToast,
  gongfaUpDoneToast,
  gongfaUpShortToast
} from './gongfaText'

describe('洞府与功法提示 · 文言仍报清层数与材料', () => {
  it('营造拒绝原因不说不足、升至', () => {
    expect(buildingRealmGate('筑基')).toBe('Chưa đến 筑基 cảnh, khó dựng kiến trúc này')
    expect(buildingPeakToast()).toContain('đỉnh tầng')
    expect(buildingMansionGateToast()).toContain('Động phủ chưa đủ rộng')
    expect(buildingShortToast()).toContain('Linh thạch')
    expect(buildingShortToast()).toContain('huyền thiết')
    expect(buildingDoneToast('Đan Phòng', 4)).toBe('Xây dựng「Đan Phòng」tiến thêm, đã đạt cấp 4')
    expect(buildingDoneToast('Đan Phòng', 4)).not.toContain('升至')
    expect(buildingActLabel(0)).toBe('Khởi Dựng')
    expect(buildingActLabel(3)).toBe('Tái Dựng')
  })

  it('参悟与精进仍报残页、悟道点与层数', () => {
    expect(gongfaPageShortToast()).toContain('Tàn trang')
    expect(gongfaPageShortToast()).not.toContain('không đủ')
    expect(gongfaAllLearnedToast()).toContain('lĩnh ngộ toàn bộ')
    expect(gongfaComprehendToast('Thái Huyền Dẫn Khí Quyết')).toContain('《Thái Huyền Dẫn Khí Quyết》')
    expect(gongfaUpShortToast()).toContain('Ngộ Đạo')
    expect(gongfaUpDoneToast('Thái Huyền Dẫn Khí Quyết', 3)).toBe('《Thái Huyền Dẫn Khí Quyết》lại tiến thêm một tầng, đã đạt tầng 3')
    expect(gongfaSubFullToast(2)).toContain('2 vị trí')
    expect(gongfaSubFullToast(2)).toContain('Tàng Kinh Các')
    expect(gongfaSubFullToast(2)).not.toContain('thăng cấp')
  })
})

describe('洞府卡片按钮与提示同源', () => {
  it('可营时写起造或再营,不写升级建造', () => {
    const card = readFileSync(new URL('../components/dongfu/BuildingCard.vue', import.meta.url), 'utf8')
    expect(card).toContain('buildingActLabel(')
    expect(card).not.toMatch(/level > 0 \? '升级' : '建造'/)
  })
})
