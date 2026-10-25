import { AFFIXES } from '../src/data/affixes.ts'

// Build SCALE
const SCALE = new Map()
for (const a of AFFIXES) {
  const min = a.min / 100
  const max = a.max / 100
  const cur = SCALE.get(a.key)
  SCALE.set(a.key, cur ? { unit: Math.min(cur.unit, min), cap: Math.max(cur.cap, max) } : { unit: min, cap: max })
}

export function weightOf(mods) {
  let sum = 0
  for (const [k, v] of Object.entries(mods)) {
    const s = SCALE.get(k)
    if (s) sum += (v ?? 0) / s.unit
    else throw new Error(`Unknown stat key: ${k}`)
  }
  return sum
}

// Target weights per rank
export const TARGET_WEIGHTS = {
  mortal: 4.0,     // rank 0
  fine: 4.6,       // rank 1
  excellent: 5.6,  // rank 2
  spirit: 7.1,     // rank 3
  profound: 8.6,   // rank 4
  heaven: 11.8,    // rank 6
  immortal: 16.0,  // rank 7
  divine: 22.5     // rank 8
}

// Build archetype mod builders:
// Each archetype builder takes `(quality, targetWeight)` and returns a valid `mods` object.
// Archetype definitions:
// 1. CRIT_ARMORPEN: critRate, critDamage, armorPen
// 2. COMBO_STRIKE: comboRate, comboDamage, firstStrike (or speed)
// 3. SHIELD_BARRIER: shieldOnStart, shieldPower, overhealShield
// 4. COUNTER_STUN: counterRate, counterDamage, stunRate
// 5. LIFESTEAL_EXEC: lifesteal, executeDamage, armorPen
// 6. LOW_HP_BERSERK: lowHpDamage, lowHpReduction, lifesteal
// 7. FULL_HP_DOMINANCE: fullHpDamage, damageBonus, critRate
// 8. REGEN_LIFE: regenPerRound, maxHpPct, overhealShield (or lifespanPct)
// 9. DODGE_EVASION: dodgeRate, speed, damageReduction
// 10. TRIBULATION_BREAK: tribulationResist, breakthroughRate, breakRefund
// 11. CULTIVATION_QI: cultivationSpeed, qiRegen, expGain
// 12. TREASURE_LUCK: dropRate, doubleDropRate, spiritStoneGain (or luck, eventLuck)
// 13. CRAFTING_MASTERY: alchemyYield, forgeDiscount, spiritStoneGain

export function generateArchetypeMods(archetype, quality) {
  const target = TARGET_WEIGHTS[quality] || 4.6
  let mods = {}

  switch (archetype) {
    case 'CRIT_ARMORPEN': {
      if (quality === 'mortal') {
        mods = { critRate: 0.02, critDamage: 0.12, attackPct: 0.01 }
      } else if (quality === 'fine') {
        mods = { critRate: 0.02, critDamage: 0.12, armorPen: 0.044 }
      } else if (quality === 'excellent') {
        // target 5.6: critRate: 0.03 (3.0), critDamage: 0.16 (2.0), armorPen: 0.04 (1.0) -> 6.0
        // let's do: critRate: 0.025 (2.5), critDamage: 0.16 (2.0), armorPen: 0.044 (1.1) -> 5.6
        mods = { critRate: 0.025, critDamage: 0.16, armorPen: 0.044 }
      } else if (quality === 'spirit') {
        // target 7.1: critRate: 0.035 (3.5), critDamage: 0.20 (2.5), armorPen: 0.044 (1.1) -> 7.1
        mods = { critRate: 0.035, critDamage: 0.20, armorPen: 0.044 }
      } else if (quality === 'profound') {
        // target 8.6: critRate: 0.045 (4.5), critDamage: 0.24 (3.0), armorPen: 0.044 (1.1) -> 8.6
        mods = { critRate: 0.045, critDamage: 0.24, armorPen: 0.044 }
      } else if (quality === 'heaven') {
        // target 11.8: critRate: 0.06 (6.0), critDamage: 0.32 (4.0), armorPen: 0.072 (1.8) -> 11.8
        mods = { critRate: 0.06, critDamage: 0.32, armorPen: 0.072 }
      } else if (quality === 'immortal') {
        // target 16.0: critRate: 0.08 (8.0), critDamage: 0.48 (6.0), armorPen: 0.08 (2.0) -> 16.0
        mods = { critRate: 0.08, critDamage: 0.48, armorPen: 0.08 }
      } else { // divine (22.5)
        // target 22.5: critRate: 0.09 (9.0), critDamage: 0.64 (8.0), armorPen: 0.22 (5.5) -> 22.5
        mods = { critRate: 0.09, critDamage: 0.64, armorPen: 0.22 }
      }
      break
    }
    case 'COMBO_STRIKE': {
      if (quality === 'mortal') {
        mods = { comboRate: 0.06, comboDamage: 0.24, firstStrike: 0.12 }
      } else if (quality === 'fine') {
        mods = { comboRate: 0.08, comboDamage: 0.30, firstStrike: 0.10 }
      } else if (quality === 'excellent') {
        // 5.6: comboRate: 0.10 (2.0), comboDamage: 0.39 (2.6), firstStrike: 0.10 (1.0) -> 5.6
        mods = { comboRate: 0.10, comboDamage: 0.39, firstStrike: 0.10 }
      } else if (quality === 'spirit') {
        // 7.1: comboRate: 0.12 (2.4), comboDamage: 0.45 (3.0), firstStrike: 0.17 (1.7) -> 7.1
        mods = { comboRate: 0.12, comboDamage: 0.45, firstStrike: 0.17 }
      } else if (quality === 'profound') {
        // 8.6: comboRate: 0.14 (2.8), comboDamage: 0.45 (3.0), firstStrike: 0.28 (2.8) -> 8.6
        mods = { comboRate: 0.14, comboDamage: 0.45, firstStrike: 0.28 }
      } else if (quality === 'heaven') {
        // 11.8: comboRate: 0.16 (3.2), comboDamage: 0.48 (3.2), firstStrike: 0.36 (3.6), speed: 0.09 (1.8) -> 11.8
        mods = { comboRate: 0.16, comboDamage: 0.48, firstStrike: 0.36, speed: 0.09 }
      } else if (quality === 'immortal') {
        // 16.0: comboRate: 0.17 (3.4), comboDamage: 0.50 (3.33), firstStrike: 0.40 (4.0), speed: 0.25 (5.0), attackPct: 0.0054 -> adjust
        // let's use: comboRate: 0.18 (3.6), comboDamage: 0.50 (3.333), firstStrike: 0.40 (4.0), speed: 0.25 (5.0) -> sum = 15.93 + attackPct: 0.01 (0.5) -> wait, attackPct unit is 0.02.
        // attackPct: 0.02 is 1.0. 15.93 is close to 16.0. Let's do firstStrike: 0.40 (4.0), comboRate: 0.18 (3.6), comboDamage: 0.50 (3.333), speed: 0.25 (5.0) -> 15.93
        mods = { comboRate: 0.18, comboDamage: 0.50, firstStrike: 0.40, speed: 0.25 }
      } else { // divine 22.5
        // comboRate: 0.18 (3.6), comboDamage: 0.50 (3.333), firstStrike: 0.40 (4.0), speed: 0.25 (5.0), attackPct: 0.13 (6.5) -> sum = 22.43
        mods = { comboRate: 0.18, comboDamage: 0.50, firstStrike: 0.40, speed: 0.25, attackPct: 0.13 }
      }
      break
    }
    case 'SHIELD_BARRIER': {
      if (quality === 'mortal') {
        mods = { shieldOnStart: 0.08, shieldPower: 0.12, overhealShield: 0.27 }
      } else if (quality === 'fine') {
        mods = { shieldOnStart: 0.10, shieldPower: 0.12, overhealShield: 0.33 }
      } else if (quality === 'excellent') {
        mods = { shieldOnStart: 0.12, shieldPower: 0.16, overhealShield: 0.36 }
      } else if (quality === 'spirit') {
        mods = { shieldOnStart: 0.15, shieldPower: 0.20, overhealShield: 0.48 }
      } else if (quality === 'profound') {
        mods = { shieldOnStart: 0.18, shieldPower: 0.24, overhealShield: 0.60 }
      } else if (quality === 'heaven') {
        mods = { shieldOnStart: 0.24, shieldPower: 0.25, overhealShield: 0.86, maxHpPct: 0.03 }
      } else if (quality === 'immortal') {
        mods = { shieldOnStart: 0.30, shieldPower: 0.25, overhealShield: 1.16, maxHpPct: 0.09 }
      } else {
        mods = { shieldOnStart: 0.32, shieldPower: 0.25, overhealShield: 1.20, maxHpPct: 0.27 }
      }
      break
    }
    case 'COUNTER_STUN': {
      if (quality === 'mortal') {
        mods = { counterRate: 0.06, counterDamage: 0.36, stunRate: 0.03 }
      } else if (quality === 'fine') {
        mods = { counterRate: 0.08, counterDamage: 0.40, stunRate: 0.03 }
      } else if (quality === 'excellent') {
        mods = { counterRate: 0.10, counterDamage: 0.50, stunRate: 0.033 }
      } else if (quality === 'spirit') {
        mods = { counterRate: 0.12, counterDamage: 0.60, stunRate: 0.051 }
      } else if (quality === 'profound') {
        mods = { counterRate: 0.15, counterDamage: 0.60, stunRate: 0.078 }
      } else if (quality === 'heaven') {
        mods = { counterRate: 0.18, counterDamage: 0.60, stunRate: 0.10, defensePct: 0.056 }
      } else if (quality === 'immortal') {
        mods = { counterRate: 0.20, counterDamage: 0.60, stunRate: 0.12, defensePct: 0.15 }
      } else {
        mods = { counterRate: 0.20, counterDamage: 0.60, stunRate: 0.12, defensePct: 0.32, damageReduction: 0.016 }
      }
      break
    }
    case 'LIFESTEAL_EXEC': {
      if (quality === 'mortal') {
        mods = { lifesteal: 0.03, executeDamage: 0.15, armorPen: 0.04 }
      } else if (quality === 'fine') {
        mods = { lifesteal: 0.04, executeDamage: 0.16, armorPen: 0.04 }
      } else if (quality === 'excellent') {
        mods = { lifesteal: 0.05, executeDamage: 0.20, armorPen: 0.044 }
      } else if (quality === 'spirit') {
        mods = { lifesteal: 0.06, executeDamage: 0.25, armorPen: 0.064 }
      } else if (quality === 'profound') {
        mods = { lifesteal: 0.08, executeDamage: 0.30, armorPen: 0.064 }
      } else if (quality === 'heaven') {
        mods = { lifesteal: 0.10, executeDamage: 0.36, armorPen: 0.128 }
      } else if (quality === 'immortal') {
        mods = { lifesteal: 0.14, executeDamage: 0.40, armorPen: 0.20 }
      } else {
        mods = { lifesteal: 0.16, executeDamage: 0.40, armorPen: 0.25, attackPct: 0.085 }
      }
      break
    }
    case 'LOW_HP_BERSERK': {
      if (quality === 'mortal') {
        mods = { lowHpDamage: 0.24, lowHpReduction: 0.14, lifesteal: 0.02 }
      } else if (quality === 'fine') {
        mods = { lowHpDamage: 0.30, lowHpReduction: 0.16, lifesteal: 0.02 }
      } else if (quality === 'excellent') {
        mods = { lowHpDamage: 0.36, lowHpReduction: 0.20, lifesteal: 0.024 }
      } else if (quality === 'spirit') {
        mods = { lowHpDamage: 0.45, lowHpReduction: 0.25, lifesteal: 0.032 }
      } else if (quality === 'profound') {
        mods = { lowHpDamage: 0.54, lowHpReduction: 0.30, lifesteal: 0.04 }
      } else if (quality === 'heaven') {
        mods = { lowHpDamage: 0.60, lowHpReduction: 0.35, lifesteal: 0.086 }
      } else if (quality === 'immortal') {
        mods = { lowHpDamage: 0.60, lowHpReduction: 0.35, lifesteal: 0.14, attackPct: 0.03 }
      } else {
        mods = { lowHpDamage: 0.60, lowHpReduction: 0.35, lifesteal: 0.16, attackPct: 0.14 }
      }
      break
    }
    case 'FULL_HP_DOMINANCE': {
      if (quality === 'mortal') {
        mods = { fullHpDamage: 0.16, damageBonus: 0.045, critRate: 0.009 }
      } else if (quality === 'fine') {
        mods = { fullHpDamage: 0.20, damageBonus: 0.048, critRate: 0.01 }
      } else if (quality === 'excellent') {
        mods = { fullHpDamage: 0.24, damageBonus: 0.06, critRate: 0.012 }
      } else if (quality === 'spirit') {
        mods = { fullHpDamage: 0.28, damageBonus: 0.075, critRate: 0.018 }
      } else if (quality === 'profound') {
        mods = { fullHpDamage: 0.30, damageBonus: 0.09, critRate: 0.026 }
      } else if (quality === 'heaven') {
        mods = { fullHpDamage: 0.30, damageBonus: 0.15, critRate: 0.038 }
      } else if (quality === 'immortal') {
        mods = { fullHpDamage: 0.30, damageBonus: 0.20, critRate: 0.063 }
      } else {
        mods = { fullHpDamage: 0.30, damageBonus: 0.20, critRate: 0.098, armorPen: 0.12 }
      }
      break
    }
    case 'REGEN_LIFE': {
      if (quality === 'mortal') {
        mods = { regenPerRound: 0.016, maxHpPct: 0.045, overhealShield: 0.27 }
      } else if (quality === 'fine') {
        mods = { regenPerRound: 0.02, maxHpPct: 0.048, overhealShield: 0.30 }
      } else if (quality === 'excellent') {
        mods = { regenPerRound: 0.024, maxHpPct: 0.06, overhealShield: 0.36 }
      } else if (quality === 'spirit') {
        mods = { regenPerRound: 0.03, maxHpPct: 0.075, overhealShield: 0.48 }
      } else if (quality === 'profound') {
        mods = { regenPerRound: 0.036, maxHpPct: 0.09, overhealShield: 0.60 }
      } else if (quality === 'heaven') {
        mods = { regenPerRound: 0.045, maxHpPct: 0.12, overhealShield: 0.99 }
      } else if (quality === 'immortal') {
        mods = { regenPerRound: 0.055, maxHpPct: 0.18, overhealShield: 1.20, lifespanPct: 0.01 }
      } else {
        mods = { regenPerRound: 0.06, maxHpPct: 0.27, overhealShield: 1.20, lifespanPct: 0.07 }
      }
      break
    }
    case 'DODGE_EVASION': {
      if (quality === 'mortal') {
        mods = { speed: 0.05, dodgeRate: 0.04, damageReduction: 0.02 }
      } else if (quality === 'fine') {
        mods = { speed: 0.05, dodgeRate: 0.05, damageReduction: 0.022 }
      } else if (quality === 'excellent') {
        mods = { speed: 0.06, dodgeRate: 0.064, damageReduction: 0.024 }
      } else if (quality === 'spirit') {
        mods = { speed: 0.08, dodgeRate: 0.08, damageReduction: 0.03 }
      } else if (quality === 'profound') {
        mods = { speed: 0.10, dodgeRate: 0.096, damageReduction: 0.036 }
      } else if (quality === 'heaven') {
        mods = { speed: 0.14, dodgeRate: 0.12, damageReduction: 0.06 }
      } else if (quality === 'immortal') {
        mods = { speed: 0.20, dodgeRate: 0.14, damageReduction: 0.10 }
      } else {
        mods = { speed: 0.25, dodgeRate: 0.14, damageReduction: 0.15, maxHpPct: 0.09 }
      }
      break
    }
    case 'TRIBULATION_BREAK': {
      if (quality === 'mortal') {
        mods = { tribulationResist: 0.08, breakthroughRate: 0.014, breakRefund: 0.05 }
      } else if (quality === 'fine') {
        mods = { tribulationResist: 0.10, breakthroughRate: 0.016, breakRefund: 0.05 }
      } else if (quality === 'excellent') {
        mods = { tribulationResist: 0.12, breakthroughRate: 0.02, breakRefund: 0.06 }
      } else if (quality === 'spirit') {
        mods = { tribulationResist: 0.15, breakthroughRate: 0.025, breakRefund: 0.08 }
      } else if (quality === 'profound') {
        mods = { tribulationResist: 0.18, breakthroughRate: 0.03, breakRefund: 0.10 }
      } else if (quality === 'heaven') {
        mods = { tribulationResist: 0.24, breakthroughRate: 0.04, breakRefund: 0.15 }
      } else if (quality === 'immortal') {
        mods = { tribulationResist: 0.28, breakthroughRate: 0.054, breakRefund: 0.20, luck: 0.02 }
      } else {
        mods = { tribulationResist: 0.30, breakthroughRate: 0.06, breakRefund: 0.20, luck: 0.13 }
      }
      break
    }
    case 'CULTIVATION_QI': {
      if (quality === 'mortal') {
        mods = { cultivationSpeed: 0.048, qiRegen: 0.056, expGain: 0.04 }
      } else if (quality === 'fine') {
        mods = { cultivationSpeed: 0.06, qiRegen: 0.064, expGain: 0.04 }
      } else if (quality === 'excellent') {
        mods = { cultivationSpeed: 0.075, qiRegen: 0.08, expGain: 0.044 }
      } else if (quality === 'spirit') {
        mods = { cultivationSpeed: 0.09, qiRegen: 0.10, expGain: 0.064 }
      } else if (quality === 'profound') {
        mods = { cultivationSpeed: 0.12, qiRegen: 0.12, expGain: 0.064 }
      } else if (quality === 'heaven') {
        mods = { cultivationSpeed: 0.15, qiRegen: 0.16, expGain: 0.112 }
      } else if (quality === 'immortal') {
        mods = { cultivationSpeed: 0.21, qiRegen: 0.20, expGain: 0.16 }
      } else {
        mods = { cultivationSpeed: 0.28, qiRegen: 0.26, expGain: 0.267 }
      }
      break
    }
    case 'TREASURE_LUCK': {
      if (quality === 'mortal') {
        mods = { dropRate: 0.064, doubleDropRate: 0.07, spiritStoneGain: 0.05 }
      } else if (quality === 'fine') {
        mods = { dropRate: 0.08, doubleDropRate: 0.08, spiritStoneGain: 0.05 }
      } else if (quality === 'excellent') {
        mods = { dropRate: 0.10, doubleDropRate: 0.10, spiritStoneGain: 0.055 }
      } else if (quality === 'spirit') {
        mods = { dropRate: 0.12, doubleDropRate: 0.12, spiritStoneGain: 0.085 }
      } else if (quality === 'profound') {
        mods = { dropRate: 0.14, doubleDropRate: 0.15, spiritStoneGain: 0.105 }
      } else if (quality === 'heaven') {
        mods = { dropRate: 0.18, doubleDropRate: 0.18, spiritStoneGain: 0.185 }
      } else if (quality === 'immortal') {
        mods = { dropRate: 0.22, doubleDropRate: 0.20, spiritStoneGain: 0.275, luck: 0.02 }
      } else {
        mods = { dropRate: 0.25, doubleDropRate: 0.20, spiritStoneGain: 0.35, luck: 0.105 }
      }
      break
    }
    case 'CRAFTING_MASTERY': {
      if (quality === 'mortal') {
        mods = { alchemyYield: 0.08, forgeDiscount: 0.07, spiritStoneGain: 0.05 }
      } else if (quality === 'fine') {
        mods = { alchemyYield: 0.10, forgeDiscount: 0.08, spiritStoneGain: 0.05 }
      } else if (quality === 'excellent') {
        mods = { alchemyYield: 0.12, forgeDiscount: 0.10, spiritStoneGain: 0.06 }
      } else if (quality === 'spirit') {
        mods = { alchemyYield: 0.15, forgeDiscount: 0.125, spiritStoneGain: 0.08 }
      } else if (quality === 'profound') {
        mods = { alchemyYield: 0.18, forgeDiscount: 0.15, spiritStoneGain: 0.10 }
      } else if (quality === 'heaven') {
        mods = { alchemyYield: 0.20, forgeDiscount: 0.20, spiritStoneGain: 0.19 }
      } else if (quality === 'immortal') {
        mods = { alchemyYield: 0.20, forgeDiscount: 0.20, spiritStoneGain: 0.35, dropRate: 0.04 }
      } else {
        mods = { alchemyYield: 0.20, forgeDiscount: 0.20, spiritStoneGain: 0.35, dropRate: 0.25, luck: 0.025 }
      }
      break
    }
  }

  // Safety cleanup: round to 4 decimals
  for (const k of Object.keys(mods)) {
    mods[k] = Math.round(mods[k] * 10000) / 10000
  }
  return mods
}

// Test all archetypes and qualities
const archetypes = [
  'CRIT_ARMORPEN', 'COMBO_STRIKE', 'SHIELD_BARRIER', 'COUNTER_STUN',
  'LIFESTEAL_EXEC', 'LOW_HP_BERSERK', 'FULL_HP_DOMINANCE', 'REGEN_LIFE',
  'DODGE_EVASION', 'TRIBULATION_BREAK', 'CULTIVATION_QI', 'TREASURE_LUCK',
  'CRAFTING_MASTERY'
]
const qualities = ['mortal', 'fine', 'excellent', 'spirit', 'profound', 'heaven', 'immortal', 'divine']

console.log("Testing archetypes...")
let allPassed = true
for (const q of qualities) {
  for (const arch of archetypes) {
    const mods = generateArchetypeMods(arch, q)
    const w = weightOf(mods)
    const target = TARGET_WEIGHTS[q]
    const diff = Math.abs(w - target)
    if (diff > 0.15) {
      console.error(`FAIL: ${arch} at ${q}: weight=${w.toFixed(2)}, target=${target}, diff=${diff.toFixed(2)}`)
      allPassed = false
    }
    // check caps
    for (const [k, v] of Object.entries(mods)) {
      const s = SCALE.get(k)
      if (v > s.cap) {
        console.error(`CAP OVERFLOW: ${arch} ${q} ${k}=${v} > cap ${s.cap}`)
        allPassed = false
      }
      if (v <= 0) {
        console.error(`NON-POSITIVE: ${arch} ${q} ${k}=${v}`)
        allPassed = false
      }
      if (k === 'speed' && v < 0.05) {
        console.error(`SPEED < 0.05: ${arch} ${q} ${k}=${v}`)
        allPassed = false
      }
    }
  }
}

if (allPassed) {
  console.log("ALL ARCHETYPES AND QUALITIES PASSED WEIGHT AND CAP AUDIT!")
}
