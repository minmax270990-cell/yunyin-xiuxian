import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

// Read existing font chars
const fontChars = new Set(fs.readFileSync(path.join(root, 'scripts/fonts/kai-subset.chars.txt'), 'utf-8'))
const meta = JSON.parse(fs.readFileSync(path.join(root, 'scripts/fonts/kai-subset.meta.json'), 'utf-8'))
const delegated = new Set(meta.delegated_to_system ?? '')

function checkChars(str, label) {
  for (const c of str) {
    if (/\s/.test(c)) continue
    if (!fontChars.has(c) && !delegated.has(c)) {
      throw new Error(`[Font Error] Character '${c}' in "${str}" (${label}) not in font subset!`)
    }
  }
}

// Read existing reserved names and IDs
const gText = fs.readFileSync(path.join(root, 'src/data/gongfa.ts'), 'utf-8')
const eqText = fs.readFileSync(path.join(root, 'src/data/equipment.ts'), 'utf-8')
const arText = fs.readFileSync(path.join(root, 'src/data/artifacts.ts'), 'utf-8')
const gbText = fs.readFileSync(path.join(root, 'src/data/gongfaBranches.ts'), 'utf-8')

const existingGongfaIds = new Set()
const existingGongfaNames = new Set()
let m
const reG = /id:\s*'([^']+)',\s*\n\s*name:\s*'([^']+)'|g\(\s*'([^']+)',\s*'([^']+)'/g
while ((m = reG.exec(gText))) {
  existingGongfaIds.add(m[1] || m[3])
  existingGongfaNames.add(m[2] || m[4])
}

const existingEquipNames = new Set()
const reEq = /t\(\s*'[^']+',\s*'([^']+)'/g
while ((m = reEq.exec(eqText))) existingEquipNames.add(m[1])

const existingArtifactNames = new Set()
const reAr = /f\(\s*'[^']+',\s*'([^']+)'/g
while ((m = reAr.exec(arText))) existingArtifactNames.add(m[1])

const existingBranchIds = new Set()
const reGb = /b\(\s*'([^']+)',\s*'([^']+)'/g
while ((m = reGb.exec(gbText))) existingBranchIds.add(m[2])

const allReservedNames = new Set([...existingGongfaNames, ...existingEquipNames, ...existingArtifactNames])
console.log(`Reserved names count: ${allReservedNames.size}, Reserved Gongfa IDs: ${existingGongfaIds.size}, Reserved Branch IDs: ${existingBranchIds.size}`)

// Helper for branch weights based on quality
function branchModsForQuality(quality) {
  switch (quality) {
    case 'mortal': // rank 0: target ~4.0
      return [
        { attackPct: 0.08 },
        { defensePct: 0.12 }
      ]
    case 'fine': // rank 1: target ~4.5
      return [
        { attackPct: 0.07, damageBonus: 0.03 },
        { defensePct: 0.09, damageReduction: 0.03 }
      ]
    case 'excellent': // rank 2: target ~5.5
      return [
        { attackPct: 0.08, damageBonus: 0.045 },
        { defensePct: 0.12, damageReduction: 0.03 }
      ]
    case 'spirit': // rank 3: target ~7.0
      return [
        { attackPct: 0.10, damageBonus: 0.06 },
        { defensePct: 0.15, damageReduction: 0.04 }
      ]
    case 'profound': // rank 4: target ~8.5
      return [
        { attackPct: 0.11, damageBonus: 0.09 },
        { defensePct: 0.18, maxHpPct: 0.075 }
      ]
    case 'heaven': // rank 6: target ~11.5
      return [
        { attackPct: 0.15, damageBonus: 0.12 },
        { defensePct: 0.24, damageReduction: 0.07 }
      ]
    case 'immortal': // rank 7: target ~15.5
      return [
        { attackPct: 0.19, damageBonus: 0.18 },
        { defensePct: 0.30, damageReduction: 0.11 }
      ]
    case 'divine': // rank 8: target ~22.0
      return [
        { attackPct: 0.24, damageBonus: 0.20, critRate: 0.03 },
        { defensePct: 0.30, maxHpPct: 0.30, damageReduction: 0.04 }
      ]
    default:
      return [{ attackPct: 0.1 }, { defensePct: 0.1 }]
  }
}

// World mark check
const MARKS = {
  immortal: ['仙', '云', '玉', '瑶', '星', '虚', '太', '罗', '雷'],
  god: ['神', '帝', '王', '冕', '诏', '法', '则'],
  chaos: ['混', '沌', '鸿', '蒙', '本', '源', '真', '灵', '无', '极', '开', '道', '界', '神', '魔']
}

function checkWorldMark(name, minRealm) {
  if (minRealm >= 9 && minRealm <= 13) {
    if (!MARKS.immortal.some(c => name.includes(c))) {
      throw new Error(`[World Mark Error] Realm ${minRealm} (Immortal) requires mark in ${name}`)
    }
  } else if (minRealm >= 14 && minRealm <= 17) {
    if (!MARKS.god.some(c => name.includes(c))) {
      throw new Error(`[World Mark Error] Realm ${minRealm} (God) requires mark in ${name}`)
    }
  } else if (minRealm >= 18 && minRealm <= 20) {
    if (!MARKS.chaos.some(c => name.includes(c))) {
      throw new Error(`[World Mark Error] Realm ${minRealm} (Chaos) requires mark in ${name}`)
    }
  }
}

export { checkChars, checkWorldMark, branchModsForQuality, allReservedNames, existingGongfaIds, existingBranchIds }
