import { describe, expect, it } from 'vitest'
import { homeStatusText, type HomePresence } from './homeStatus'

function presence(over: Partial<HomePresence> = {}): HomePresence {
  return {
    dead: false,
    adventuring: false,
    regionName: '',
    injured: false,
    retreating: false,
    expFull: false,
    ...over
  }
}

describe('主页状态行', () => {
  it('默认是修炼,不是闭关', () => {
    expect(homeStatusText(presence())).toBe('Đang tu luyện')
  })

  it('只有闭关增益在身时才写闭关', () => {
    expect(homeStatusText(presence({ retreating: true }))).toBe('Đang bế quan')
  })

  it('修为圆满单独成句,避免和闭关混成一句', () => {
    expect(homeStatusText(presence({ expFull: true }))).toBe('Tu vi đã viên mãn')
  })

  it('疗伤优先于闭关:伤势比封洞更需要看见', () => {
    expect(homeStatusText(presence({ injured: true, retreating: true }))).toBe('Đang trị thương')
  })

  it('历练带上地界名', () => {
    expect(homeStatusText(presence({ adventuring: true, regionName: '青云山麓' }))).toBe('Đang lịch luyện · 青云山麓')
  })

  it('陨落压过其余一切', () => {
    expect(homeStatusText(presence({ dead: true, adventuring: true, regionName: '青云山麓' }))).toBe('Vẫn lạc')
  })
})
