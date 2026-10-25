import { MAIN_GONGFA_DATA } from './data-main-gongfa.mjs'
import { SUB_GONGFA_DATA } from './data-sub-gongfa.mjs'
import { SECRET_GONGFA_DATA } from './data-secret-gongfa.mjs'
import { generateArchetypeMods, weightOf, TARGET_WEIGHTS } from './test-archetypes.mjs'

const allGongfa = [...MAIN_GONGFA_DATA, ...SUB_GONGFA_DATA, ...SECRET_GONGFA_DATA]

const KEYWORDS = {
  CRIT_ARMORPEN: ['破', '锋', '锐', '斩', '刺', '贯', '剑', '裂', '诛', '截', '决', '极锋', '芒', '金', '刀', '穿'],
  COMBO_STRIKE: ['连', '疾', '迅', '影', '冲', '袭', '闪', '踏', '飞', '瞬', '雷', '掣', '暴', '疾风', '惊鸿'],
  SHIELD_BARRIER: ['盾', '罡', '壳', '甲', '障', '护', '固', '坚', '壁', '守', '阵', '冰', '极', '琉璃', '寒', '霜', '凝冰', '护心', '守御'],
  COUNTER_STUN: ['反', '震', '不动', '镇', '岳', '磐', '山', '沉', '渊', '定', '摄', '封', '压', '控', '缚', '撼'],
  LIFESTEAL_EXEC: ['噬', '吸', '饮', '夺', '魂', '幽', '冥', '戮', '绝', '死', '灭', '阎', '血', '杀', '残', '撕', '毒', '暗'],
  LOW_HP_BERSERK: ['狂', '战', '怒', '逆', '绝境', '残血', '燃', '焚', '沸', '命', '殉', '争', '焚天', '赤阳', '烈'],
  FULL_HP_DOMINANCE: ['辟', '阳', '炽', '光', '纯', '皇', '帝', '威', '霸', '傲', '盖', '耀', '浩', '瀚', '圣', '照', '神威'],
  REGEN_LIFE: ['生', '润', '泽', '愈', '荣', '木', '春', '根', '泉', '滋', '养', '绵', '寿', '益', '长生'],
  DODGE_EVASION: ['避', '躲', '遁', '虚', '隐', '藏', '幻', '游', '渺', '步', '风', '飘', '灵身', '脱身'],
  TRIBULATION_BREAK: ['劫', '厄', '渡', '难', '破境', '冲关', '证', '禅', '心', '明', '鉴', '窥', '悟', '道心', '登仙'],
  CULTIVATION_QI: ['气', '元', '纳', '吐', '息', '循', '归', '聚', '涌', '沧', '海', '川', '演', '经', '典', '玄气', '真元'],
  TREASURE_LUCK: ['宝', '珍', '淘', '富', '运', '福', '财', '缘', '机', '察', '探'],
  CRAFTING_MASTERY: ['丹', '鼎', '炉', '冶', '炼', '锻', '材', '药', '草', '壤', '沃', '锤', '熔', '淬']
}

function scoreArchetype(text, element, type, secretType, arch) {
  let score = 0
  for (const kw of KEYWORDS[arch]) {
    if (text.includes(kw)) score += 2
  }

  // Element synergy
  if (element === 'metal' && arch === 'CRIT_ARMORPEN') score += 1.5
  if (element === 'fire' && (arch === 'LOW_HP_BERSERK' || arch === 'FULL_HP_DOMINANCE')) score += 1.5
  if (element === 'wood' && (arch === 'REGEN_LIFE' || arch === 'CRAFTING_MASTERY')) score += 1.5
  if (element === 'water' && (arch === 'CULTIVATION_QI' || arch === 'DODGE_EVASION')) score += 1.5
  if (element === 'earth' && (arch === 'COUNTER_STUN' || arch === 'SHIELD_BARRIER')) score += 1.5
  if (element === 'thunder' && (arch === 'COMBO_STRIKE' || arch === 'TRIBULATION_BREAK')) score += 1.5
  if (element === 'wind' && (arch === 'DODGE_EVASION' || arch === 'COMBO_STRIKE')) score += 1.5
  if (element === 'ice' && (arch === 'SHIELD_BARRIER' || arch === 'COUNTER_STUN')) score += 1.5
  if (element === 'light' && (arch === 'FULL_HP_DOMINANCE' || arch === 'REGEN_LIFE')) score += 1.5
  if (element === 'dark' && (arch === 'LIFESTEAL_EXEC' || arch === 'LOW_HP_BERSERK')) score += 1.5
  if (element === 'chaos' && (arch === 'TRIBULATION_BREAK' || arch === 'CRIT_ARMORPEN')) score += 1.5

  // Secret type synergy
  if (secretType === 'attack' && (arch === 'CRIT_ARMORPEN' || arch === 'COMBO_STRIKE' || arch === 'FULL_HP_DOMINANCE')) score += 2
  if (secretType === 'defense' && (arch === 'SHIELD_BARRIER' || arch === 'COUNTER_STUN' || arch === 'DODGE_EVASION')) score += 2
  if (secretType === 'speed' && (arch === 'COMBO_STRIKE' || arch === 'DODGE_EVASION')) score += 2
  if (secretType === 'support' && (arch === 'REGEN_LIFE' || arch === 'CRAFTING_MASTERY' || arch === 'TREASURE_LUCK')) score += 2
  if (secretType === 'perception' && (arch === 'CULTIVATION_QI' || arch === 'TRIBULATION_BREAK')) score += 2
  if (secretType === 'special' && (arch === 'LIFESTEAL_EXEC' || arch === 'LOW_HP_BERSERK' || arch === 'TRIBULATION_BREAK')) score += 2

  return score
}

function pickArchetypes(gongfa) {
  const b0Text = (gongfa.branches[0].name + ' ' + gongfa.branches[0].desc)
  const b1Text = (gongfa.branches[1].name + ' ' + gongfa.branches[1].desc)

  const archetypes = Object.keys(KEYWORDS)

  // Rank archetypes for b0
  const scores0 = archetypes.map(arch => ({
    arch,
    score: scoreArchetype(b0Text, gongfa.element, gongfa.type, gongfa.secretType, arch)
  })).sort((a, b) => b.score - a.score)

  let arch0 = scores0[0].arch

  // Rank archetypes for b1, excluding arch0
  const scores1 = archetypes
    .filter(arch => arch !== arch0)
    .map(arch => ({
      arch,
      score: scoreArchetype(b1Text, gongfa.element, gongfa.type, gongfa.secretType, arch)
    })).sort((a, b) => b.score - a.score)

  let arch1 = scores1[0].arch

  return [arch0, arch1]
}

const archetypeUsage = {}
let ratioOk = true

for (const g of allGongfa) {
  const [arch0, arch1] = pickArchetypes(g)
  archetypeUsage[arch0] = (archetypeUsage[arch0] || 0) + 1
  archetypeUsage[arch1] = (archetypeUsage[arch1] || 0) + 1

  const mods0 = generateArchetypeMods(arch0, g.quality)
  const mods1 = generateArchetypeMods(arch1, g.quality)
  const w0 = weightOf(mods0)
  const w1 = weightOf(mods1)
  const ratio = Math.max(w0, w1) / Math.min(w0, w1)
  if (ratio > 2.0) {
    console.error(`RATIO FAIL: ${g.id} ${w0} vs ${w1} = ${ratio}`)
    ratioOk = false
  }
}

console.log("Archetype usage across all 428 branches:")
console.table(archetypeUsage)
if (ratioOk) {
  console.log("All 214 gongfa branches satisfy ratio <= 2.0!")
}
