import { describe, expect, it } from 'vitest'
import {
  calcMaxComprehendLevel,
  checkGongfaEligibility,
  getElementAptitude,
  type CharacterCultivationSnapshot
} from './gongfaEligibility'
import type { GongfaDef } from '@/types'

const dummyFireGongfa: GongfaDef = {
  id: 'test_fire_gongfa',
  name: 'Liệt Hỏa Quyết',
  type: 'main',
  quality: 'fine',
  minRealm: 0,
  maxLevel: 9,
  element: 'fire',
  desc: 'Test fire gongfa',
  baseMods: {},
  perLevelMods: {}
}

const dummyWaterGongfa: GongfaDef = {
  id: 'test_water_gongfa',
  name: 'Hàn Thủy Quyết',
  type: 'main',
  quality: 'fine',
  minRealm: 1,
  maxLevel: 9,
  element: 'water',
  desc: 'Test water gongfa',
  baseMods: {},
  perLevelMods: {}
}

const dummySecretArt: GongfaDef = {
  id: 'test_secret_art',
  name: 'Hỏa Diễm Thuẫn',
  type: 'secret',
  quality: 'fine',
  minRealm: 0,
  maxLevel: 3,
  element: 'fire',
  desc: 'Test secret art',
  baseMods: {},
  perLevelMods: {}
}

const dummyNeutralGongfa: GongfaDef = {
  id: 'test_neutral_gongfa',
  name: 'Thái Huyền Quyết',
  type: 'main',
  quality: 'mortal',
  minRealm: 0,
  maxLevel: 9,
  desc: 'Test neutral gongfa',
  baseMods: {},
  perLevelMods: {}
}

describe('Hệ thống Đánh Giá Tương Thích & Giới Hạn Lĩnh Ngộ Công Pháp (gongfaEligibility)', () => {
  it('Nguyên tắc 1: Linh căn tương thích 30 điểm có giới hạn lĩnh ngộ tầng 5, 90-100 điểm đạt Viên Mãn (tầng 9)', () => {
    const snap30: CharacterCultivationSnapshot = {
      major: 0,
      roots: [{ element: 'fire', aptitude: 30 }]
    }
    const snap95: CharacterCultivationSnapshot = {
      major: 0,
      roots: [{ element: 'fire', aptitude: 95 }]
    }

    const limit30 = calcMaxComprehendLevel(dummyFireGongfa, snap30)
    const limit95 = calcMaxComprehendLevel(dummyFireGongfa, snap95)

    expect(limit30).toBe(5)
    expect(limit95).toBe(9)
    expect(limit30).toBeLessThan(limit95)
  })

  it('Nguyên tắc 2: Bí thuật (maxLevel = 3) phân bậc: <35 -> 1 tầng, 35-74 -> 2 tầng, >=75 -> 3 tầng', () => {
    const snapLow: CharacterCultivationSnapshot = {
      major: 0,
      roots: [{ element: 'fire', aptitude: 25 }]
    }
    const snapMid: CharacterCultivationSnapshot = {
      major: 0,
      roots: [{ element: 'fire', aptitude: 50 }]
    }
    const snapHigh: CharacterCultivationSnapshot = {
      major: 0,
      roots: [{ element: 'fire', aptitude: 85 }]
    }

    expect(calcMaxComprehendLevel(dummySecretArt, snapLow)).toBe(1)
    expect(calcMaxComprehendLevel(dummySecretArt, snapMid)).toBe(2)
    expect(calcMaxComprehendLevel(dummySecretArt, snapHigh)).toBe(3)
  })

  it('Nguyên tắc 3: Xét đúng linh căn tương ứng, không nhận vơ hệ khác', () => {
    const fireSnap: CharacterCultivationSnapshot = {
      major: 2,
      roots: [{ element: 'fire', aptitude: 80 }]
    }

    // Xét Hỏa cho Hỏa
    expect(getElementAptitude(fireSnap, 'fire')).toBe(80)
    // Xét Thủy cho người chỉ có Hỏa -> 0
    expect(getElementAptitude(fireSnap, 'water')).toBe(0)

    const checkWater = checkGongfaEligibility(dummyWaterGongfa, fireSnap, 0)
    expect(checkWater.status).toBe('incompatible')
    expect(checkWater.canLearn).toBe(false)
    expect(checkWater.maxComprehendLevel).toBe(0)
  })

  it('Nguyên tắc 4: Công pháp vô thuộc tính tính theo ngộ tính của nhân vật', () => {
    const lowCompSnap: CharacterCultivationSnapshot = {
      major: 0,
      roots: [{ element: 'wood', aptitude: 20 }],
      comprehension: 20
    }
    const normalCompSnap: CharacterCultivationSnapshot = {
      major: 0,
      roots: [{ element: 'wood', aptitude: 20 }],
      comprehension: 50
    }

    expect(calcMaxComprehendLevel(dummyNeutralGongfa, lowCompSnap)).toBe(6)
    expect(calcMaxComprehendLevel(dummyNeutralGongfa, normalCompSnap)).toBe(9)
  })

  it('Nguyên tắc 5: Rào cản cảnh giới (major < minRealm) trả về realm_locked', () => {
    const snapMajor0: CharacterCultivationSnapshot = {
      major: 0,
      roots: [{ element: 'water', aptitude: 80 }]
    }
    // dummyWaterGongfa minRealm = 1
    const res = checkGongfaEligibility(dummyWaterGongfa, snapMajor0, 0)
    expect(res.status).toBe('realm_locked')
    expect(res.canLearn).toBe(false)
  })

  it('Nguyên tắc 6: Hỗn Độn linh căn có thể diễn hóa vạn linh căn ở 80% tư chất', () => {
    const chaosSnap: CharacterCultivationSnapshot = {
      major: 0,
      roots: [{ element: 'chaos', aptitude: 90 }]
    }
    // 90 * 0.8 = 72 (nằm trong ngưỡng 60-79 -> 8 tầng)
    expect(getElementAptitude(chaosSnap, 'fire')).toBe(72)
    expect(getElementAptitude(chaosSnap, 'water')).toBe(72)
    expect(calcMaxComprehendLevel(dummyFireGongfa, chaosSnap)).toBe(8)

    const chaosMaxSnap: CharacterCultivationSnapshot = {
      major: 0,
      roots: [{ element: 'chaos', aptitude: 100 }]
    }
    // 100 * 0.8 = 80 (nằm trong ngưỡng 80-89 -> 9 tầng)
    expect(getElementAptitude(chaosMaxSnap, 'fire')).toBe(80)
    expect(calcMaxComprehendLevel(dummyFireGongfa, chaosMaxSnap)).toBe(9)
  })

  it('Nguyên tắc 7: Khi đã học và đạt maxComprehendLevel, canUpgrade chuyển thành false', () => {
    const snap30: CharacterCultivationSnapshot = {
      major: 0,
      roots: [{ element: 'fire', aptitude: 30 }]
    }
    // Chưa học
    const resUnlearned = checkGongfaEligibility(dummyFireGongfa, snap30, 0)
    expect(resUnlearned.canLearn).toBe(true)
    expect(resUnlearned.maxComprehendLevel).toBe(5)

    // Đang ở tầng 3 (< 5) -> có thể upgrade
    const resLv3 = checkGongfaEligibility(dummyFireGongfa, snap30, 3)
    expect(resLv3.canUpgrade).toBe(true)
    expect(resLv3.isAtComprehendLimit).toBe(false)

    // Đã chạm tầng 5 -> bị kẹt bởi giới hạn linh căn
    const resLv5 = checkGongfaEligibility(dummyFireGongfa, snap30, 5)
    expect(resLv5.canUpgrade).toBe(false)
    expect(resLv5.isAtComprehendLimit).toBe(true)
    expect(resLv5.reason).toContain('Đã đạt giới hạn lĩnh ngộ của linh căn')
  })
})
