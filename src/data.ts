/** Selected drop facts verified against the RuneScape Wiki on 2026-09-05.
 * See SOURCES.md for source links, assumptions, and differences from its calculator.
 * Denominators are per roll; rolls default to one per completed encounter.
 */
import { additionalBosses } from './boss-groups.ts'
import { expandBossDrops } from './extra-drops.ts'

export type Drop = { name: string; denominator: number; threshold?: number; rolls?: number; note?: string }
export type UnmodelledDrop = { name: string; note: string }
export type Scenario = { name: string; drops: Drop[]; unmodelledDrops?: UnmodelledDrop[]; note?: string }
export type Boss = { name: string; area: string; symbol: string; source: string; scenarios: Scenario[]; custom?: boolean; group?: string; killCountHelp?: string }
const items = (denominator: number, names: string[], extra: Partial<Drop> = {}): Drop[] => names.map(name => ({ name, denominator, ...extra }))
const pet = (name: string, denominator: number, threshold: number, extra: Partial<Drop> = {}): Drop => ({ name: `${name} · Pet`, denominator, threshold, ...extra })
const scenario = (name: string, drops: Drop[], note?: string): Scenario => ({ name, drops, note })
const dungeonGroups: Record<string, string> = {
  'General Graardor': 'God Wars Dungeon',
  "Kree'arra": 'God Wars Dungeon',
  "K'ril Tsutsaroth": 'God Wars Dungeon',
  'Commander Zilyana': 'God Wars Dungeon',
  'Nex': 'God Wars Dungeon',
  'Nex, Angel of Death': 'God Wars Dungeon',
  'Gregorovic': 'Heart of Gielinor',
  'Twin Furies': 'Heart of Gielinor',
  'Vindicta': 'Heart of Gielinor',
  'Helwyr': 'Heart of Gielinor',
  'Telos, the Warden': 'Heart of Gielinor',
}
const boss = (name: string, source: string, area: string, scenarios: Scenario[], symbol = '◇'): Boss => ({ name, source, area, scenarios, symbol, group: dungeonGroups[name] })
const fixed = (name: string, source: string, drops: Drop[], note?: string) => boss(name, source, 'RuneScape 3', [scenario('Standard encounter', drops, note)])
const recipient = 'Rates assume you receive the boss loot. Group kills alone do not guarantee a loot roll; LootShare allocation is not simulated.'
const modes = (create: (hard: boolean) => Drop[], note?: string) => [scenario('Normal mode', create(false), note), scenario('Hard mode', create(true), note)]
const gw1 = (name: string, source: string, names: string[], rate: number, petName: string) => boss(name, source, 'God Wars Dungeon', modes(hard => [
  ...items(rate, names), pet(petName, hard ? 1000 : 5000, 1000),
], recipient), '⚔')
const dormant = ['Dormant anima core helm', 'Dormant anima core body', 'Dormant anima core legs']
const gw2 = (name: string, source: string, names: string[], pets: string[], normalRate = 256) => boss(name, source, 'The Heart of Gielinor', modes(hard => [
  ...items(hard ? 179 : normalRate, [...names, ...dormant]), ...pets.map(name => pet(name, hard ? 1000 : 2000, 400)),
], `Maximum reputation drop-rate bonus (100%); no luck enhancer. ${recipient}`), '❖')

const araxxi = boss('Araxxor / Araxxi', 'Araxxor', 'Araxyte Lair', ['Solo', 'Duo'].flatMap(group => ['Melee', 'Ranged', 'Magic'].map(style => scenario(`${group} · ${style} Araxxor`, [
  ...items(group === 'Solo' ? 40 : 70, ['Spider leg top', 'Spider leg middle', 'Spider leg bottom'], { note: 'Only eligible when you take the corresponding phase-two path: top = minions, middle = acid, bottom = darkness. Repeat that path for every planned kill.' }),
  ...['fang', 'web', 'eye'].map((part, i) => ({ name: `Araxxi's ${part}`, denominator: (group === 'Solo' ? 480 : 800) / (['Melee', 'Ranged', 'Magic'][i] === style ? 2 : 1) })),
  pet('Barry · Araxyte egg', 500, 200, { note: 'Only eligible after unlocking all six base araxyte pets; assumes Barry is not yet owned.' }),
  pet('Mallory · Araxyte egg', 500, 200, { note: 'Only eligible after unlocking Barry; assumes Mallory is not yet owned.' }),
], 'Base araxyte pets depend on enrage gained during the fight and gambling; those rolls are not included.'))), '♜')

const vorago = boss('Vorago', 'Vorago', 'Borehole', [false, true].flatMap(hard => [1, 2, 3, 4, 5].map(rolls => scenario(`${hard ? 'Hard' : 'Normal'} mode · ${rolls} loot pile${rolls === 1 ? '' : 's'}`, [
  // Seismics are mutually exclusive across piles, unlike independent pet rolls.
  ...items((hard ? 200 : 400) / rolls, ['Seismic wand', 'Seismic singularity']),
  ...items(1.25, ['Tectonic energy'], { rolls }),
  pet('Vitalis · Ancient summoning stone', hard ? 2500 : 5000, 1000, { rolls }),
  ...(hard ? items(50, ['Bombi · Ancient artefact (pet)'], { rolls, note: 'Requires having mauled Vorago on every hard mode base rotation. This pet has no threshold.' }) : []),
], 'Assumes this exact number of personal loot piles on every kill. Vitalis rerolls from teammates who already own the pet are excluded.'))), '♜')

const kerapac = boss('Kerapac, the bound', 'Kerapac,_the_bound', 'Nodon Front', [false, true].flatMap(hard => [3, 2, 1].map(rolls => scenario(`${hard ? 'Hard' : 'Normal'} mode · ${rolls} loot pile${rolls === 1 ? '' : 's'}`, [
  ...items(hard ? 540 * 400 / 399 : 768, ["Kerapac's wrist wraps", 'Greater Concentrated blast ability codex', 'Scripture of Jas'], { rolls }),
  ...(hard ? items(400, ['Any fractured Staff of Armadyl piece'], { rolls, note: 'Chance of at least one piece. Specific pieces follow a personal cycle; this is not the chance of a chosen piece or a complete staff.' }) : []),
  pet('Kerry', hard ? 1500 : 3000, 500, { rolls }),
], 'Solo gives 3 piles; duo top damage gives 2, duo lower damage or trio gives 1. Hard mode common uniques include the failed staff-piece roll. No pontifex ring boost.'))))

const croesus = boss('Croesus', 'Croesus', 'Croesus Front', ['60–99', '100–179', '180–229', '230–279', '280–309', '310–329', '330–344', '345–359', '360–379', '380–399', '400–419', '420+'].map((range, i) => scenario(`${range} contribution · ${i + 1} unique roll${i ? 's' : ''}`, [
  ...items(5400, ['Cryptbloom helm (incomplete)', 'Cryptbloom top (incomplete)', 'Cryptbloom bottoms (incomplete)', 'Cryptbloom gloves (incomplete)', 'Cryptbloom boots (incomplete)', 'Croesus sporehammer', 'Croesus foultorch', 'Croesus spore sack', 'Scripture of Bik'], { rolls: i + 1 }),
  pet('Little sus', 1000, 500),
], 'Requires at least 60 contribution for unique items. Pet rolls once per kill, independently of loot-pile count. No enriched pontifex ring boost.')).reverse())

const aod = boss('Nex, Angel of Death', 'Nex,_Angel_of_Death', 'Ancient Prison', [7, 6, 5, 4, 3, 2, 1].map(size => scenario(`${size}-player group`, [
  ...items(284 * size, ['Wand of the praesul', 'Imperium core']),
  ...items(36 * size / (1 - 2 / (284 * size)), ['Praesul codex']),
  ...items(1024, ['Any intricate chest'], { note: 'At least one chest of any colour; specific colours depend on chest collection order.' }),
  pet('Reeves', 3000, 600),
], 'Personal drop chances in a group of at most 7 players. The codex rate includes failing the wand/core roll. Larger groups are not modelled.')))

const amascut = boss('Amascut, the Devourer', 'Amascut,_the_Devourer', 'Menaphos', [
  ['Normal mode', 600], ['100% enrage', 70], ['500% enrage', 60], ['750% enrage', 50], ['1000% enrage', 35], ['2000%+ enrage', 25],
].map(([name, base], i) => scenario(String(name), [
  ...items(Number(base) * 8, ["Devourer's Guard", "Tumeken's Light"]),
  ...items(Number(base) * 20 / 3, ["Mask of Tumeken's resplendence", "Robe top of Tumeken's resplendence", "Robe bottom of Tumeken's resplendence", "Gloves of Tumeken's resplendence", "Boots of Tumeken's resplendence"]),
  ...items(i === 0 ? 750 : Number(base) * 4, ["The Devourer's Nexus (unattuned)"]),
  ...(i ? items(Number(base) * 4, ['Shard of Genesis Essence']) : []),
  pet('Amaskitty', i === 0 ? 500 : 300, 100),
], 'Fixed enrage preset for every planned kill, without luck boosts. Choose the listed enrage; intermediate enrages are not interpolated.')))

// Claim after each kill: streak argument = 1 in the Wiki calculator.
const telos = boss('Telos, the Warden', 'Telos,_the_Warden', 'The Heart of Gielinor', [0, 25, 100, 500, 1000, 2449, 4000].map(enrage => {
  const rawChance = (1300 + 25 * enrage) / 1000000 / (enrage < 100 ? 10 : 1) / (enrage < 25 ? 3 : 1)
  const denominator = Math.floor(Math.max(1 / rawChance, 15))
  return scenario(`${enrage}% enrage · claim every kill`, [
    ...items(denominator * 115 / 10, ['Dormant Seren godbow', 'Dormant staff of Sliske', 'Dormant Zaros godsword', 'Reprisal ability codex']),
    ...items(denominator * 115 / 75, ['Any anima orb'], { note: 'Orbs drop in sequence. This is the chance of any orb, not a selected colour or a complete orb set.' }),
    pet('Tess', enrage < 100 ? 1400 : 700, 300),
  ], 'Repeat the selected enrage and claim after every kill. No streaking, lost chests, or Luck of the Dwarves boost.')
}))

const archGlacor = boss('Arch-Glacor', 'Arch-Glacor', 'Glacor Front', [
  scenario('Normal mode · 5 mechanics · 3 loot piles', [
    ...items(500, ['Leng artefact', 'Scripture of Wen'], { rolls: 3 }),
    ...items(1 / (.09 * .035), ['Dark nilas'], { rolls: 3 }), pet('Gladys', 3000, 500),
  ], 'Full 5-mechanic normal mode and all 3 loot piles. Frozen cores do not drop in normal mode; pet rolls once per kill.'),
  ...[0, 100, 500, 1000, 2000, 4000].map(enrage => {
    const unique = (1525 + 15 * enrage) / 1000000
    return scenario(`Hard mode · ${enrage}% enrage · claim every kill`, [
      ...items(1 / (unique * .24), ['Frozen core of Leng']),
      ...items(1 / (unique * .38), ['Leng artefact', 'Scripture of Wen']),
      ...items(100, ['Dark nilas']), pet('Gladys', 1000, 500),
    ], 'Claim after each kill at the selected enrage. Uses the current hard mode formula and 24%/38%/38% unique weights. No streaking or pontifex ring boost.')
  }),
])

export const bosses: Boss[] = [
  gw1('General Graardor', 'General_Graardor', ['Bandos chestplate', 'Bandos tassets', 'Bandos helmet', 'Bandos gloves', 'Bandos boots', 'Bandos warshield'], 384, 'General Awwdor · Decaying tooth'),
  fixed('King Black Dragon', 'King_Black_Dragon', [...items(5000, ['Draconic visage']), ...items(128, ['King black dragon head']), pet('King Black Dragonling · Dragon scale', 2500, 500)], recipient),
  gw1("Kree'arra", "Kree'arra", ['Armadyl chestplate', 'Armadyl chainskirt', 'Armadyl helmet', 'Armadyl gloves', 'Armadyl boots', 'Armadyl buckler'], 384, "Chick'arra · Giant feather"),
  boss('Giant Mole', 'Giant_mole', 'Falador Mole Lair', modes(hard => [...items(hard ? 260 : 520, ['Dragon 2h sword']), ...items(hard ? 52 : 104, ['Clingy mole']), pet('Molly · Rotten fang', hard ? 500 : 2500, 500)], 'Members rates, without Falador shield boost; assumes solo or eligibility for a personal loot roll.')),
  fixed('Chaos Elemental', 'Chaos_Elemental', items(128, ['Dragon 2h sword']).concat(
    items(14400, ["Statius's full helm", "Statius's platebody", "Statius's platelegs", "Statius's warhammer", "Vesta's chainbody", "Vesta's plateskirt", "Vesta's longsword", "Vesta's spear", "Zuriel's hood", "Zuriel's robe top", "Zuriel's robe bottom", "Zuriel's staff", "Morrigan's coif", "Morrigan's leather body", "Morrigan's leather chaps", "Morrigan's javelin", "Morrigan's throwing axe"]),
    items(28800, ['Corrupt dragon helm', 'Corrupt dragon chainbody', 'Corrupt dragon platelegs', 'Corrupt dragon plateskirt', 'Corrupt dragon battleaxe', 'Corrupt dragon dagger', 'Corrupt dragon longsword', 'Corrupt dragon mace', 'Corrupt dragon scimitar', 'Corrupt dragon spear', 'Corrupt dragon sq shield']),
    [pet('Ellie', 2500, 500)]), recipient),
  boss('Kalphite Queen', 'Kalphite_Queen', 'Kalphite Hive', [false, true].map(exiled => scenario(exiled ? 'Exiled Kalphite Queen' : 'Kalphite Queen', [...items(128, ['Dragon chainbody', 'Kalphite queen head']), ...items(exiled ? 128 : 256, ['Dragon 2h sword']), pet('Kalphite Grublet · Kalphite egg', 2500, 500)], `One kill means defeating both forms. ${recipient}`))),
  fixed('Flesh-hatcher Mhekarnahz', 'Flesh-hatcher_Mhekarnahz', [...items(128, ["Stalker's charm", 'Dragon harpoon']), pet('Flesh-hatchling Mhekarnahz · Mhekarnahz’s eye', 800, 200)], 'Uses the Wiki collection calculator’s per-encounter unique rates. The seven general loot rolls are not applied again to these rates.'),
  fixed('Ivar, King of Bones', 'Ivar,_King_of_Bones', [...items(64, ['Bonecrusher maul', 'Magic skull mask']), ...items(1, ['Colossal bone']), pet('Ivarsson · Ivar’s loincloth', 1250, 250)]),
  fixed('Silverquill, the Dreadhog', 'Silverquill,_the_Dreadhog', [...items(2, ['Sanguine spines', 'Silver spines']), ...items(14, ['Sanguine matter']), pet('Needlemouse · Silverquill’s blood-filled cyst', 1000, 200)], 'Spine probabilities refer to receiving a stack, not each individual spine.'),
  vorago,
  fixed('Solak', 'Solak,_Guardian_of_the_Grove', [...items(400, ['Blightbound crossbow', 'Off-hand Blightbound crossbow']), ...items(200, ["Erethdor's grimoire"]), ...items(500, ['Purple mushroom', "Merethiel's stave"]), ...items(1, ['Torn grimoire page']), pet('Solly', 1200, 240)], 'Personal loot rates for each eligible player.'),
  fixed('Barrows: Rise of the Six', 'The_Barrows:_Rise_of_the_Six', items(240, ['Malevolent kiteshield', 'Merciless kiteshield', 'Vengeful kiteshield']), 'Per personal chest, with a successful escape. Bobblehead pets are bought for 250 malevolent energy each; they are not random pet drops and have no threshold.'),
  araxxi,
  fixed('Kalphite King', 'Kalphite_King', [...items(256, ['Drygore longsword', 'Off-hand drygore longsword', 'Drygore mace', 'Off-hand drygore mace', 'Drygore rapier', 'Off-hand drygore rapier']), ...items(50, ['Perfect chitin'], { note: 'Requires an eligible tier 80 or 90 defender carried or equipped.' }), pet('Kalphite Grubling', 2000, 400)], recipient),
  fixed('Queen Black Dragon', 'Queen_Black_Dragon', [...items(250, ['Dragon kiteshield']), ...items(50, ['Royal bolt stabiliser', 'Royal frame', 'Royal sight', 'Royal torsion spring']), ...items(109, ['Draconic visage']), ...items(125, ['Dragonbone upgrade kit']), pet('Queen Black Dragonling', 2500, 500)]),
  fixed('Corporeal Beast', 'Corporeal_Beast', [...items(1024, ['Spectral sigil', 'Arcane sigil', 'Elysian sigil', 'Divine sigil']), ...items(64, ['Spirit shield']), pet('Corporeal Puppy', 2500, 500)], recipient),
  fixed('The Magister', 'The_Magister', [...items(18, ['Phylactery']), ...items(500, ['Gloves of passage']), pet('The Minister', 1000, 200)]),
  fixed('Raksha, the Shadow Colossus', 'Raksha,_the_Shadow_Colossus', [...items(130, ['Fleeting boots']), ...items(325, ['Shadow spike', 'Greater Ricochet ability codex', 'Greater Chain ability codex', 'Divert ability codex']), pet('Raklette', 1000, 200)], 'Personal loot rates, solo or duo; no luck enhancer.'),
  boss('Zemouregal & Vorkath', 'Zemouregal_&_Vorkath', 'Ungael', modes(hard => [...items(hard ? 15 : 45, ["Vorkath's spike"]), ...items(hard ? 150 : 249, ['Invoke Lord of Bones incantation codex']), ...(hard ? items(150, ["Vorkath's scale"]) : []), pet('Vorki', hard ? 1000 : 2000, 400)])),
  amascut, aod,
  fixed('Nex', 'Nex', [...items(384, ['Torva full helm', 'Torva platebody', 'Torva platelegs', 'Torva boots', 'Torva gloves', 'Pernix cowl', 'Pernix body', 'Pernix chaps', 'Pernix boots', 'Pernix gloves', 'Virtus mask', 'Virtus robe top', 'Virtus robe legs', 'Virtus boots', 'Virtus gloves', 'Virtus wand', 'Virtus book', 'Zaryte bow']), ...items(50, ['Ancient emblem'], { note: 'Requires an eligible tier 70 or higher defender carried or equipped.' }), pet('Nexterminator', 2000, 400)], recipient),
  gw1("K'ril Tsutsaroth", "K'ril_Tsutsaroth", ['Hood of subjugation', 'Garb of subjugation', 'Gown of subjugation', 'Gloves of subjugation', 'Boots of subjugation', 'Ward of subjugation', 'Zamorakian spear', 'Steam battlestaff'], 512, "K'ril Tinyroth · Severed hoof"),
  gw1('Commander Zilyana', 'Commander_Zilyana', ["Saradomin's hiss", "Saradomin's murmur", "Saradomin's whisper", 'Saradomin sword', 'Armadyl crossbow', 'Off-hand Armadyl crossbow'], 384, 'Commander Miniana · Auburn lock'),
  telos,
  gw2('Gregorovic', 'Gregorovic', ['Crest of Sliske', 'Shadow glaive', 'Off-hand shadow glaive'], ['Greg']),
  gw2('Twin Furies', 'Twin_Furies', ['Crest of Zamorak', 'Blade of Nymora', 'Blade of Avaryss'], ['Nylessa', 'Ava']),
  gw2('Vindicta', 'Vindicta', ['Crest of Zaros', 'Dragon Rider lance'], ['Rawrvek', 'Vindiddy'], 255),
  gw2('Helwyr', 'Helwyr', ['Crest of Seren', 'Wand of the Cywir elders', 'Orb of the Cywir elders'], ['Lilwyr']),
  kerapac, archGlacor, croesus,
  boss('TzKal-Zuk', 'TzKal-Zuk', 'Ful Front', [scenario('Normal mode', [...items(100, ['Magma Tempest ability codex', 'Scripture of Ful']), pet('Little Zuk', 500, 100)]), ...[false, true].map(checkpoints => scenario(`Hard mode · ${checkpoints ? 'with' : 'without'} checkpoints`, [...items(50, ['Magma Tempest ability codex', 'Scripture of Ful']), ...items(checkpoints ? 30 : 27, ['Any Ek-ZekKil sword piece'], { note: 'Chance of at least one piece; individual pieces drop in sequence. This is not a complete-sword probability.' }), pet('Little Zuk', 300, 100)]))]),
  fixed('Hermod, the Spirit of War', 'Hermod,_the_Spirit_of_War', [...items(10, ['Hermodic plate']), pet('Herman · Hermod’s armour spike', 2000, 400)], 'No luck enhancer. Animated drumsticks have separate bad-luck mitigation and are not included.'),
  fixed('Rasial, the First Necromancer', 'Rasial,_the_First_Necromancer', [...items(640, ['Omni guard', 'Soulbound lantern', 'Crown of the First Necromancer', 'Robe top of the First Necromancer', 'Robe bottom of the First Necromancer', 'Hand wrap of the First Necromancer', 'Foot wraps of the First Necromancer']), pet('Miso', 1500, 300)]),
  ...additionalBosses,
  { ...fixed('Custom boss / drop', 'Bosses', items(1000, ['Custom item'])), custom: true },
].map(expandBossDrops)

export const bossCount = bosses.filter(boss => !boss.custom).length
export const wikiUrl = (page: string) => `https://runescape.wiki/w/${encodeURIComponent(page)}`
