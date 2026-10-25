import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkChars, checkWorldMark, branchModsForQuality, allReservedNames, existingGongfaIds, existingBranchIds } from './build-gongfa-data.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const NEW_GONGFA = []
const NEW_BRANCHES = []
const VI_TRANSLATIONS = {
  names: {},
  skills: {},
  branches: {},
  descs: {}
}

const seenGongfaIds = new Set(existingGongfaIds)
const seenGongfaNames = new Set(allReservedNames)
const seenBranchIds = new Set(existingBranchIds)

function addGongfa(item) {
  // Validate ID
  if (seenGongfaIds.has(item.id)) throw new Error(`Duplicate Gongfa ID: ${item.id}`)
  seenGongfaIds.add(item.id)

  // Validate Name
  if (seenGongfaNames.has(item.name)) throw new Error(`Duplicate Name: ${item.name}`)
  seenGongfaNames.add(item.name)

  // Validate World Mark
  checkWorldMark(item.name, item.minRealm)

  // Validate Chars
  checkChars(item.name, `Gongfa name ${item.id}`)
  checkChars(item.desc, `Gongfa desc ${item.id}`)
  if (item.skill) checkChars(item.skill.name, `Skill name ${item.id}`)

  // Store translation
  if (item.nameVi) VI_TRANSLATIONS.names[item.name] = item.nameVi
  if (item.descVi) VI_TRANSLATIONS.descs[item.desc] = item.descVi
  if (item.skill && item.skill.nameVi) VI_TRANSLATIONS.skills[item.skill.name] = item.skill.nameVi

  item.maxLevel = item.maxLevel ?? (item.type === 'secret' ? 3 : 9)
  NEW_GONGFA.push(item)

  // Generate 2 branches
  const [mods1, mods2] = branchModsForQuality(item.quality)
  const b1Id = `b_${item.id}_1`
  const b2Id = `b_${item.id}_2`
  if (seenBranchIds.has(b1Id) || seenBranchIds.has(b2Id)) throw new Error(`Duplicate Branch ID for ${item.id}`)
  seenBranchIds.add(b1Id)
  seenBranchIds.add(b2Id)

  const b1Name = item.branches?.[0]?.name ?? '精进'
  const b1Desc = item.branches?.[0]?.desc ?? '真意通透,杀伐自显'
  const b2Name = item.branches?.[1]?.name ?? '守御'
  const b2Desc = item.branches?.[1]?.desc ?? '真意内蕴,护持神躯'

  checkChars(b1Name, `Branch 1 name ${b1Id}`)
  checkChars(b1Desc, `Branch 1 desc ${b1Id}`)
  checkChars(b2Name, `Branch 2 name ${b2Id}`)
  checkChars(b2Desc, `Branch 2 desc ${b2Id}`)

  if (item.branches?.[0]?.nameVi) VI_TRANSLATIONS.branches[b1Name] = item.branches[0].nameVi
  if (item.branches?.[1]?.nameVi) VI_TRANSLATIONS.branches[b2Name] = item.branches[1].nameVi
  if (item.branches?.[0]?.descVi) VI_TRANSLATIONS.descs[b1Desc] = item.branches[0].descVi
  if (item.branches?.[1]?.descVi) VI_TRANSLATIONS.descs[b2Desc] = item.branches[1].descVi

  NEW_BRANCHES.push({
    gongfaId: item.id,
    id: b1Id,
    name: b1Name,
    desc: b1Desc,
    mods: mods1
  })
  NEW_BRANCHES.push({
    gongfaId: item.id,
    id: b2Id,
    name: b2Name,
    desc: b2Desc,
    mods: mods2
  })
}

console.log('Expansion framework initialized.')
export { addGongfa, NEW_GONGFA, NEW_BRANCHES, VI_TRANSLATIONS }
