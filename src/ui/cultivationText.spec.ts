import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  breakthroughActLabel,
  breakthroughExpReason,
  breakthroughGoalText,
  breakthroughPeakReason,
  breakthroughQiReason,
  breakthroughReadyNote,
  prepPillDisabledLabel,
  prepPillShortToast,
  repairActLabel,
  repairDoneToast,
  repairIdleToast,
  repairShortToast
} from './cultivationText'

describe('修行页提示 · 文言仍报清缕数与药资', () => {
  it('疗伤缺气、落成、无伤,不说不足', () => {
    expect(repairIdleToast()).toContain('vô ngại')
    expect(repairShortToast('120')).toBe('Linh khí chưa đủ, tĩnh dưỡng cần 120 luồng')
    expect(repairShortToast('120')).not.toContain('不足')
    expect(repairDoneToast('120')).toContain('tiêu hao 120')
    expect(repairActLabel(true, '80')).toContain('Dẫn khí trị thương')
    expect(repairActLabel(false, '80')).toBe(repairShortToast('80'))
  })

  it('备药与突破门槛仍报灵石、灵气', () => {
    expect(prepPillShortToast()).toContain('Linh thạch')
    expect(prepPillShortToast()).toContain('bị dược')
    expect(prepPillShortToast()).not.toContain('不足')
    // 欠资禁用说明与备药 toast 同一句「未足」,也不够硬
    expect(prepPillDisabledLabel()).toContain('Linh thạch')
    expect(prepPillDisabledLabel()).not.toContain('不足')
    expect(breakthroughPeakReason()).toContain('đại đạo')
    expect(breakthroughExpReason()).toContain('viên mãn')
    expect(breakthroughQiReason('40')).toBe('Linh khí chưa đủ, ải này cần 40 luồng')
    expect(breakthroughActLabel(false)).toBe('Thử đột phá')
    expect(breakthroughActLabel(true)).toBe('Dẫn kiếp đột phá')
    expect(breakthroughGoalText(true, true, '筑基初期')).toBe('Dẫn kiếp đột phá「筑基初期」')
    expect(breakthroughGoalText(true, false, '炼气中期')).toBe('Thử đột phá「炼气中期」')
    expect(breakthroughReadyNote(true)).toBe('Tu vi đã đạt viên mãn, có thể Dẫn kiếp đột phá')
    expect(breakthroughReadyNote(false)).not.toContain('Dẫn kiếp')
  })
})


describe('修行页与提示同源', () => {
  it('疗伤按钮与备药 toast 走 cultivationText', () => {
    const view = readFileSync(new URL('../views/CultivationView.vue', import.meta.url), 'utf8')
    expect(view).toContain('repairActLabel(')
    expect(view).toContain('prepPillShortToast()')
    expect(view).not.toContain('灵气不足')
    expect(view).not.toContain('灵石不足')
    expect(view, '天威区间须乘入今日 tribulationMult,与劫势/引劫同源').toContain(
      'tribulationWaveSpan(tribPlan.value.def, tribTargetMajor.value, tribWeather.value.tribulationMult)'
    )
    expect(view).toContain('weatherTribulationLine')
    expect(view, '开劫护持与每波恢复须走 guardScore / sustainScore').toContain('guardScore(')
    expect(view).toContain('sustainScore(')
    const offline = readFileSync(new URL('../core/offline.ts', import.meta.url), 'utf8')
    expect(offline).toContain('breakthroughReadyNote(')
    expect(offline).toContain('atMaxRealm')
  })
})
