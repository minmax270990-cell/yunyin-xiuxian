import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { HERITAGE } from '@/core/samsaraAudit'
import { heritageViewRows, rebirthDecisionHint } from './rebirthText'

describe('rebirthDecisionHint', () => {
  it('matches carryGongfa: levels return to 1, artifacts are not kept', () => {
    const text = rebirthDecisionHint()
    expect(HERITAGE.find(r => r.id === 'artifacts')?.mode).toBe('reset')
    expect(HERITAGE.find(r => r.id === 'gongfa')?.mode).toBe('partial')
    expect(text).toContain('tầng 1')
    expect(text).toContain('Pháp bảo')
    expect(text).not.toContain('Chiết tổn')
    expect(text).not.toMatch(/giữ lại[^.]*Pháp bảo/i)
  })

  it('the character sheet uses the shared hint, not a second summary', () => {
    const src = readFileSync(resolve(__dirname, '../views/CharacterView.vue'), 'utf8')
    expect(src).toContain('rebirthDecisionHint()')
    expect(src).not.toContain('công pháp chiết bán')
  })

  it('ngưỡng cảnh giới binh giải không chép tay: toast và popup cùng đọc MANUAL_REBIRTH_MIN_MAJOR', () => {
    const src = readFileSync(resolve(__dirname, '../views/CharacterView.vue'), 'utf8')
    expect(src).toContain('REALMS[MANUAL_REBIRTH_MIN_MAJOR]?.name')
    expect(src).not.toContain('ít nhất Kim Đan cảnh mới có thể tự hành binh giải')
  })
})

describe('heritageViewRows Danh sách giữ lại hay đặt lại (cùng bảng với HERITAGE)', () => {
  it('đối chiếu từng dòng: một dòng HERITAGE một hàng, tên gọi đồng nhất, giữ/bỏ đồng nghĩa với mode', () => {
    const rows = heritageViewRows()
    expect(rows.length).toBe(HERITAGE.length)
    for (const r of HERITAGE) {
      const row = rows.find(x => x.id === r.id)
      expect(row).toBeDefined()
      expect(row!.name).toBe(r.name)
      expect(row!.mode).toBe(r.mode)
    }
  })

  it('cách dùng từ ba trạng thái: giữ đủ/một phần/về 0 thành từ riêng, theo hồn một màu, về 0 màu xám', () => {
    const rows = heritageViewRows()
    expect(rows.find(r => r.id === 'daoFruit')!.modeLabel).toBe('Theo hồn giữ lại')
    expect(rows.find(r => r.id === 'daoFruit')!.cls).toBe('text-jade')
    expect(rows.find(r => r.id === 'gongfa')!.modeLabel).toBe('Giữ lại một phần')
    expect(rows.find(r => r.id === 'realm')!.modeLabel).toBe('Về 0 làm lại')
    expect(rows.find(r => r.id === 'realm')!.cls).toBe('text-ink-faint')
  })
})
