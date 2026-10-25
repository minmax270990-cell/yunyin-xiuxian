import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MAIN_GONGFA_DATA } from './data-main-gongfa.mjs'
import { SUB_GONGFA_DATA } from './data-sub-gongfa.mjs'
import { SECRET_GONGFA_DATA } from './data-secret-gongfa.mjs'
import { addGongfa, NEW_GONGFA, NEW_BRANCHES, VI_TRANSLATIONS } from './generate-gongfa-library.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

console.log('--- Step 1: Ingesting Gongfa Data ---')
MAIN_GONGFA_DATA.forEach(addGongfa)
SUB_GONGFA_DATA.forEach(addGongfa)
SECRET_GONGFA_DATA.forEach(addGongfa)

console.log(`Ingested ${NEW_GONGFA.length} new Gongfa and ${NEW_BRANCHES.length} new Branches.`)

// Format data clean
const gongfaExportCode = `// Generated Gongfa Expansion Data
import type { GongfaDef } from '@/types'

export const EXPANDED_GONGFA: GongfaDef[] = ${JSON.stringify(NEW_GONGFA.map(g => {
  const { nameVi, descVi, branches, ...rest } = g
  if (rest.skill) {
    const { nameVi: sVi, ...sRest } = rest.skill
    rest.skill = sRest
  }
  return rest
}), null, 2)}
`

const branchesExportCode = `// Generated Gongfa Branches Expansion Data
import type { GongfaBranchDef } from './gongfaBranches'

export const EXPANDED_BRANCHES: GongfaBranchDef[] = ${JSON.stringify(NEW_BRANCHES, null, 2)}
`

// Step 2: Write expanded data files
console.log('--- Step 2: Writing Expanded Data Files ---')
fs.writeFileSync(path.join(root, 'src/data/gongfaExpanded.ts'), gongfaExportCode, 'utf-8')
fs.writeFileSync(path.join(root, 'src/data/gongfaBranchesExpanded.ts'), branchesExportCode, 'utf-8')
console.log('Wrote src/data/gongfaExpanded.ts and src/data/gongfaBranchesExpanded.ts')

// Step 3: Update src/data/gongfa.ts
console.log('--- Step 3: Updating src/data/gongfa.ts ---')
let gongfaContent = fs.readFileSync(path.join(root, 'src/data/gongfa.ts'), 'utf-8')

// Update header comment
gongfaContent = gongfaContent.replace(
  /\/\*\* 功法库 —— \d+ 部:主修 \d+ \/ 辅修 \d+ \/ 秘术 \d+,每境都有新东西可参 \*\//,
  '/** 功法库 —— 277 部:主修 89 / 辅修 74 / 秘术 114,每境都有新东西可参 */'
)

// Add import if not present
if (!gongfaContent.includes("from './gongfaExpanded'")) {
  gongfaContent = gongfaContent.replace(
    "import type { GongfaDef, GongfaType, QualityId, StatMods } from '@/types'",
    "import type { GongfaDef, GongfaType, QualityId, StatMods } from '@/types'\nimport { EXPANDED_GONGFA } from './gongfaExpanded'"
  )
}

// Add ...EXPANDED_GONGFA to GONGFA array if not present
if (!gongfaContent.includes('...EXPANDED_GONGFA')) {
  gongfaContent = gongfaContent.replace(
    /\)\n\]\n\nconst BY_ID/,
    '),\n  ...EXPANDED_GONGFA\n]\n\nconst BY_ID'
  )
}
fs.writeFileSync(path.join(root, 'src/data/gongfa.ts'), gongfaContent, 'utf-8')
console.log('Updated src/data/gongfa.ts')

// Step 4: Update src/data/gongfaBranches.ts
console.log('--- Step 4: Updating src/data/gongfaBranches.ts ---')
let branchesContent = fs.readFileSync(path.join(root, 'src/data/gongfaBranches.ts'), 'utf-8')

if (!branchesContent.includes("from './gongfaBranchesExpanded'")) {
  branchesContent = branchesContent.replace(
    "import type { GongfaBranchDef, StatMods } from '@/types'",
    "import type { GongfaBranchDef, StatMods } from '@/types'\nimport { EXPANDED_BRANCHES } from './gongfaBranchesExpanded'"
  )
}

if (!branchesContent.includes('...EXPANDED_BRANCHES')) {
  branchesContent = branchesContent.replace(
    /\)\n\]\n\nconst BY_ID/,
    '),\n  ...EXPANDED_BRANCHES\n]\n\nconst BY_ID'
  )
}
fs.writeFileSync(path.join(root, 'src/data/gongfaBranches.ts'), branchesContent, 'utf-8')
console.log('Updated src/data/gongfaBranches.ts')

// Step 5: Update src/ui/displayMappings.ts with translations
console.log('--- Step 5: Updating src/ui/displayMappings.ts ---')
let dispContent = fs.readFileSync(path.join(root, 'src/ui/displayMappings.ts'), 'utf-8')

// Format entries avoiding duplicate keys
function mapToCode(record, existingText) {
  const seen = new Set()
  const lines = []
  for (const [k, v] of Object.entries(record)) {
    if (seen.has(k)) continue
    seen.add(k)
    if (existingText.includes(`'${k}':`) || existingText.includes(`"${k}":`)) continue
    lines.push(`  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
  }
  return lines.join('\n')
}

// Append entries into maps
if (!dispContent.includes('// === EXPANDED GONGFA TRANSLATIONS ===')) {
  dispContent = dispContent.replace(
    'export const GONGFA_NAME_MAP: Record<string, string> = {',
    `export const GONGFA_NAME_MAP: Record<string, string> = {\n  // === EXPANDED GONGFA TRANSLATIONS ===\n${mapToCode(VI_TRANSLATIONS.names, dispContent)}`
  )

  dispContent = dispContent.replace(
    'export const GONGFA_SKILL_NAME_MAP: Record<string, string> = {',
    `export const GONGFA_SKILL_NAME_MAP: Record<string, string> = {\n  // === EXPANDED SKILL TRANSLATIONS ===\n${mapToCode(VI_TRANSLATIONS.skills, dispContent)}`
  )

  dispContent = dispContent.replace(
    'export const GONGFA_BRANCH_NAME_MAP: Record<string, string> = {',
    `export const GONGFA_BRANCH_NAME_MAP: Record<string, string> = {\n  // === EXPANDED BRANCH TRANSLATIONS ===\n${mapToCode(VI_TRANSLATIONS.branches, dispContent)}`
  )

  dispContent = dispContent.replace(
    'export const GONGFA_DESC_MAP: Record<string, string> = {',
    `export const GONGFA_DESC_MAP: Record<string, string> = {\n  // === EXPANDED DESC TRANSLATIONS ===\n${mapToCode(VI_TRANSLATIONS.descs, dispContent)}`
  )

  dispContent = dispContent.replace(
    'export const GONGFA_BRANCH_DESC_MAP: Record<string, string> = {',
    `export const GONGFA_BRANCH_DESC_MAP: Record<string, string> = {\n  // === EXPANDED BRANCH DESC TRANSLATIONS ===\n${mapToCode(VI_TRANSLATIONS.descs, dispContent)}`
  )
}
fs.writeFileSync(path.join(root, 'src/ui/displayMappings.ts'), dispContent, 'utf-8')
console.log('Updated src/ui/displayMappings.ts')

// Step 6: Update README.md
console.log('--- Step 6: Updating README.md ---')
let readme = fs.readFileSync(path.join(root, 'README.md'), 'utf-8')

// Replace claims
readme = readme.replace(/\d+ 部功法/g, '277 部功法')
readme = readme.replace(/\d+ 条分支/g, '569 条分支')
readme = readme.replace(
  /\| 功法 \| \d+ 部（主修 \/ 辅修 \/ 秘术），圆满后开启 \d+ 条悟道分支\s*\|/g,
  '| 功法 | 277 部（主修 / 辅修 / 秘术），圆满后开启 569 条悟道分支                        |'
)
fs.writeFileSync(path.join(root, 'README.md'), readme, 'utf-8')
console.log('Updated README.md')

console.log('Expansion assembly completed successfully!')
