import type { Boss, Drop, Scenario } from './data.ts'

// Per-boss Wiki tables, retrieved 2026-09-05. See SOURCES.md.
const items = (denominator: number, names: string[], note?: string): Drop[] => names.map(name => ({ name, denominator, note }))
const pet = (name: string, denominator: number, threshold: number): Drop => ({ name: `${name} · Pet`, denominator, threshold })
const encounter = (name: string, drops: Drop[], note?: string): Scenario => ({ name, drops, note })
const makeBoss = (name: string, group: string, area: string, scenarios: Scenario[], killCountHelp?: string): Boss => ({
  name, group, area, source: name.replaceAll(' ', '_'), symbol: '❖', scenarios, killCountHelp,
})
const edNote = 'Normal mode only; personal loot, no story mode, lucky charms, Dungeoneering master cape or chest-doubling bonuses. Count kills of this boss, not full dungeon runs or mini-bosses. Lore-book mitigation is excluded.'
const edPetHelp = 'For this pet, enter this boss’s combined solo, duo and trio kill count. Planned kills all use the selected group size.'
const ed = (name: string, dungeon: string, drops: (size: number) => Drop[], note = edNote, hasPet = false) => makeBoss(name, 'Elite Dungeons', dungeon,
  ['Solo', 'Duo', 'Trio'].map((group, size) => encounter(`Normal mode · ${group}`, drops(size), note)), hasPet ? edPetHelp : undefined)
const dungeonPet = (name: string, size: number) => pet(name, [300, 1000, 1500][size], [60, 200, 300][size])
const mainLoot = 'Main-table rates assume the boss pet is already owned, since rolling a new pet can replace regular loot. Select the pet itself when hunting it.'

const eliteDungeons: Boss[] = [
  ed('The Sanctum Guardian', 'ED1 · Temple of Aminishi', size => items([20, 100 / 3, 50][size], ['Fishy treat'])),
  ed('Masuta the Ascended', 'ED1 · Temple of Aminishi', size => items([20, 33, 50][size], ["Masuta's warspear"])),
  ed('Seiryu the Azure Serpent', 'ED1 · Temple of Aminishi', size => [
    dungeonPet('Kuroryu · Chipped black stone crystal', size),
    ...items(1, ['Ancient scale'], 'Chance of receiving a stack, not a specified quantity. Assumes no pet replacement of the regular loot.'),
  ], `${edNote} ${mainLoot}`, true),
  ed('Astellarn', 'ED2 · Dragonkin Laboratory', size => items([83, 166, 250][size], ['Greater Flurry ability codex'])),
  ed('Verak Lith', 'ED2 · Dragonkin Laboratory', size => items([83, 166, 250][size], ['Greater Fury ability codex'])),
  ed('Black stone dragon', 'ED2 · Dragonkin Laboratory', size => [
    ...items([83, 166, 250][size], ['Greater Barge ability codex']),
    dungeonPet('Bisdi · Inert black stone crystal', size),
  ], `${edNote} ${mainLoot}`, true),
  ed('Crassian Leviathan', 'ED3 · The Shadow Reef', size => items([10, 1000 / 75, 20][size], ['Black stone heart'])),
  ed('Taraket the Necromancer', 'ED3 · The Shadow Reef', size => items([1000 / 195, 5, 5][size], ['Black stone heart'])),
  ed('The Ambassador', 'ED3 · The Shadow Reef', size => [
    ...items([55, 111, 166][size], ['Any Eldritch crossbow piece'], 'The first piece is random, then limb, stock and mechanism cycle. This is the chance of any next piece, not a specific piece or complete crossbow.'),
    dungeonPet('Ambi · Umbral urn', size),
  ], `${edNote} ${mainLoot}`, true),
  makeBoss('Zamorak, Lord of Chaos', 'Elite Dungeons', 'ED4 · The Zamorakian Undercity', [false, true].flatMap(group => [0, 20, 50].map((enrage, i) => {
    const unique = [100, 99, 97][i]
    return encounter(`${group ? 'Group' : 'Solo'} · ${enrage}% enrage`, [
      ...items(unique / .35, ['Codex of lost knowledge']),
      ...items(unique / .165, ['Chaos Roar ability codex']),
      ...items(unique / .09, ['Vestments of havoc hood', 'Vestments of havoc robe top', 'Vestments of havoc robe bottom', 'Vestments of havoc boots']),
      ...items(unique / .125, ["Any Bow of the Last Guardian piece"], 'Any next piece in the bow-piece sequence; not a specific piece or full bow.'),
      pet('Jewels of Zamorak', group ? 500 : 300, 100),
    ], 'Repeat this exact enrage; no luck or chaos-die rerolls. These sub-100% presets have no bad-luck mitigation. Higher enrages are not modelled. Count Zamorak kills, not dungeon enemies.')
  }))),
]

const sanctumNote = 'Personal loot per kill of this boss, not a combined three-boss run. No luck enhancer; lore books with separate bad-luck mitigation are excluded.'
const sanctum: Boss[] = [
  ...['Vermyx, Brood Mother', 'Kezalam, the Wanderer', 'Nakatra, Devourer Eternal'].map((name, index) => makeBoss(name, 'Sanctum of Rebirth', 'Sanctum of Rebirth', [false, true].map(hard => encounter(hard ? 'Hard mode' : 'Normal mode', [
    ...items(hard ? 200 : 250, ['Divine Rage prayer codex', 'Scripture of Amascut']),
    ...(index === 2 ? [
      ...items(hard ? 120 : 150, ['Roar of Awakening', 'Ode to Deceit']),
      ...(hard ? items(75, ['Shard of Genesis Essence']) : []),
      pet('Neffie · Nefthys’ tooth', hard ? 240 : 400, 80),
    ] : []),
  ], sanctumNote)), index === 2 ? 'For Neffie, enter combined normal and hard mode Nakatra kills. Vermyx and Kezalam kills do not advance this threshold.' : undefined)),
  makeBoss('The Gate of Elidinis', 'Sanctum of Rebirth', 'Separate skilling encounter', [encounter('Standard encounter', [
    ...items(480, ['Runic attuner', 'Memory dowser', 'Scripture of Elidinis', 'Eclipsed Soul prayer codex']),
    ...items(71, ['Latent Offering']), pet('Edie · Fragment of the Gate', 1500, 400),
  ], 'Per personal encounter reward. The four common-loot rolls are not applied to these unique rates. This encounter is separate from the three-boss Sanctum dungeon.')]),
]

const legioNames = ['Primus', 'Secundus', 'Tertius', 'Quartus', 'Quintus', 'Sextus']
const legioPets = ['Primulus', 'Secundulus', 'Tertiolus', 'Quartulus', 'Quintulus', 'Sextulus']
const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI']
const legiones = legioNames.map((name, i) => makeBoss(`Legio ${name}`, 'Monastery of Ascension', 'Monastery of Ascension', [encounter('Standard encounter', [
  ...items(50, [`Ascension signet ${numerals[i]}`]),
  pet(`Legio ${legioPets[i]} · Corrupted Ascension signet ${numerals[i]}`, 1000, 1200),
], 'Requires the matching keystone and 95 Slayer. Assumes you receive the loot, without luck boosts. Planned kills are of this Legio only.')], 'Enter combined kills of all six Legiones for the shared pet threshold. Planned kills are only of the selected Legio.'))

const rexHelp = 'Enter combined kills of all four Rex Matriarchs, including Osseous. Planned kills are only of this selected matriarch, not rotations.'
const rexParts = ['Savage spear tip', 'Savage spear shaft', 'Savage spear cap', 'Savage plume']
const rexMatriarchs = [
  ['Rathis', 'Heart of the Archer', 'Corbi'], ['Pthentraken', 'Heart of the Seer', 'Pavo'], ['Orikalka', 'Heart of the Warrior', 'Bagra'], ['Osseous', "Occultist's ring", 'Baby Osseous'],
].map(([name, unique, petName]) => makeBoss(name, 'Rex Matriarchs', 'Anachronia', [encounter('Standard encounter', [
  ...items(399 / 2, [unique]), ...items(225, ['Heart of the Berserker']), ...items(450, rexParts),
  ...(name === 'Osseous' ? items(399, ['Jail cell key']) : []),
  pet(petName, 2000, 1000),
], 'Personal loot without luck or necklace of salamancy boosts. Shared pet kill count includes Osseous despite her separate collection log.')], rexHelp))

const dagannothKings = [
  { name: 'Dagannoth Prime', drops: ["Seers' ring", 'Mud battlestaff'], pet: 'Prime hatchling' },
  { name: 'Dagannoth Rex', drops: ['Berserker ring', 'Warrior ring'], pet: 'Rex hatchling' },
  { name: 'Dagannoth Supreme', drops: ["Archers' ring", 'Seercull'], pet: 'Supreme hatchling' },
].map(king => makeBoss(king.name, 'Dagannoth Kings', 'Waterbirth Island', [encounter('Standard encounter', [
  ...items(128, [...king.drops, 'Dragon hatchet']), pet(king.pet, 2500, 1500),
], 'Assumes you receive loot from the selected king; no luck boosts. A rotation through all three kings is not one planned kill.')], 'Enter combined kills of all three Dagannoth Kings for the shared pet threshold. Planned kills are only of the selected king.'))

export const additionalBosses: Boss[] = [...eliteDungeons, ...sanctum, ...legiones, ...rexMatriarchs, ...dagannothKings]
