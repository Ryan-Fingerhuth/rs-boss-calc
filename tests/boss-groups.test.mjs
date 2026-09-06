import assert from 'node:assert/strict'
import test from 'node:test'
import { bosses } from '../src/data.ts'
import { restorePreferences, defaultPreferences } from '../src/preferences.ts'
import { probability } from '../src/probability.ts'

const find = name => {
  const boss = bosses.find(b => b.name === name)
  assert.ok(boss, `Missing ${name}`)
  return boss
}
test('all requested groups contain the individual bosses listed by the Wiki', () => {
  const groups = {
    'God Wars Dungeon': ['General Graardor', "Kree'arra", 'Nex, Angel of Death', 'Nex', "K'ril Tsutsaroth", 'Commander Zilyana'],
    'Heart of Gielinor': ['Telos, the Warden', 'Gregorovic', 'Twin Furies', 'Vindicta', 'Helwyr'],
    'Elite Dungeons': ['The Sanctum Guardian', 'Masuta the Ascended', 'Seiryu the Azure Serpent', 'Astellarn', 'Verak Lith', 'Black stone dragon', 'Crassian Leviathan', 'Taraket the Necromancer', 'The Ambassador', 'Zamorak, Lord of Chaos'],
    'Sanctum of Rebirth': ['Vermyx, Brood Mother', 'Kezalam, the Wanderer', 'Nakatra, Devourer Eternal', 'The Gate of Elidinis'],
    'Monastery of Ascension': ['Legio Primus', 'Legio Secundus', 'Legio Tertius', 'Legio Quartus', 'Legio Quintus', 'Legio Sextus'],
    'Rex Matriarchs': ['Rathis', 'Pthentraken', 'Orikalka', 'Osseous'],
    'Dagannoth Kings': ['Dagannoth Prime', 'Dagannoth Rex', 'Dagannoth Supreme'],
  }
  for (const [group, names] of Object.entries(groups)) {
    assert.deepEqual(bosses.filter(b => b.group === group).map(b => b.name), names)
  }
})

test('Sanctum drops belong to the right boss and respect hard mode', () => {
  for (const name of ['Vermyx, Brood Mother', 'Kezalam, the Wanderer']) {
    const boss = find(name)
    assert.ok(boss.scenarios.every(s => !s.drops.some(d => ['Shard of Genesis Essence', 'Roar of Awakening', 'Ode to Deceit'].includes(d.name))))
    assert.equal(boss.scenarios[0].drops[0].denominator, 250)
    assert.equal(boss.scenarios[1].drops[0].denominator, 200)
  }
  const nakatra = find('Nakatra, Devourer Eternal')
  const normal = nakatra.scenarios[0], hard = nakatra.scenarios[1]
  assert.equal(normal.drops.find(d => d.name === 'Roar of Awakening').denominator, 150)
  assert.equal(hard.drops.find(d => d.name === 'Roar of Awakening').denominator, 120)
  assert.equal(hard.drops.find(d => d.name === 'Shard of Genesis Essence').denominator, 75)
  const restored = restorePreferences(JSON.stringify({ ...defaultPreferences, boss: nakatra.name, scenario: normal.name, drop: 'Shard of Genesis Essence' }))
  assert.equal(restored.drop, 'Shard of Genesis Essence')
  assert.equal(normal.drops.find(d => d.name === restored.drop), undefined)
})

test('elite dungeon group size changes both pet base rate and threshold', () => {
  for (const name of ['Seiryu the Azure Serpent', 'Black stone dragon', 'The Ambassador']) {
    const boss = find(name)
    const drops = boss.scenarios.map(s => s.drops.find(d => d.threshold))
    assert.deepEqual(drops.map(d => d.denominator), [300, 1000, 1500])
    assert.deepEqual(drops.map(d => d.threshold), [60, 200, 300])
    assert.ok(drops.every(d => d.name === drops[0].name))
    assert.ok(probability(100, drops[0].denominator, 245, drops[0].threshold) > probability(100, drops[2].denominator, 245, drops[2].threshold))
  }
})

test('shared-count bosses have family thresholds and only their own unique drops', () => {
  for (const [group, denominator, threshold] of [['Monastery of Ascension', 1000, 1200], ['Rex Matriarchs', 2000, 1000], ['Dagannoth Kings', 2500, 1500]]) {
    for (const boss of bosses.filter(b => b.group === group)) {
      const drop = boss.scenarios[0].drops.find(d => d.threshold)
      assert.equal(drop.denominator, denominator)
      assert.equal(drop.threshold, threshold)
      assert.match(boss.killCountHelp, /combined kills/)
    }
  }
  assert.ok(!find('Dagannoth Prime').scenarios[0].drops.some(d => d.name === 'Berserker ring'))
  assert.ok(!find('Legio Primus').scenarios[0].drops.some(d => d.name === 'Ascension signet II'))
  assert.ok(!find('Rathis').scenarios[0].drops.some(d => d.name === 'Heart of the Seer'))
})

test('saved custom selection remains custom after inserting bosses before it', () => {
  const saved = restorePreferences(JSON.stringify({ ...defaultPreferences, boss: 'Custom boss / drop', scenario: 'Standard encounter', drop: 'Custom item' }))
  assert.equal(saved.boss, 'Custom boss / drop')
  assert.equal(saved.drop, 'Custom item')
})
