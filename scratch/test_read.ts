import { readFileSync, writeFileSync } from 'node:fs'

const extracted = JSON.parse(readFileSync('./scratch_extracted.json', 'utf-8'))
const eventsData = JSON.parse(readFileSync('./scratch_events.json', 'utf-8'))

console.log('Read pills:', extracted.pills.length)
console.log('Read events:', eventsData.events.length)
