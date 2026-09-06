import assert from 'node:assert/strict'
import test from 'node:test'
import { bosses, bossCount, wikiUrl } from '../src/data.ts'
import { probability } from '../src/probability.ts'

const find = name => {
  const result = bosses.find(boss => boss.name === name)
  assert.ok(result, `Missing boss: ${name}`)
  return result
}
const drop = (scenario, name) => {
  const result = scenario.drops.find(drop => drop.name.includes(name))
  assert.ok(result, `Missing drop: ${name}`)
  return result
}

test('all requested bosses are present once, retaining King Black Dragon and custom input', () => {
  const expected = ['Giant Mole', 'Chaos Elemental', 'Kalphite Queen', 'Flesh-hatcher Mhekarnahz', 'Ivar, King of Bones', 'Silverquill, the Dreadhog', 'Vorago', 'Solak', 'Barrows: Rise of the Six', 'Araxxor / Araxxi', 'Kalphite King', 'Queen Black Dragon', 'Corporeal Beast', 'The Magister', 'Raksha, the Shadow Colossus', 'Zemouregal & Vorkath', 'Amascut, the Devourer', 'Nex, Angel of Death', 'Nex', "K'ril Tsutsaroth", 'General Graardor', 'Commander Zilyana', "Kree'arra", 'Telos, the Warden', 'Gregorovic', 'Twin Furies', 'Vindicta', 'Helwyr', 'Kerapac, the bound', 'Arch-Glacor', 'Croesus', 'TzKal-Zuk', 'Hermod, the Spirit of War', 'Rasial, the First Necromancer', 'King Black Dragon']
  assert.equal(bossCount, 62)
  assert.equal(new Set(bosses.map(b => b.name)).size, bosses.length)
  assert.equal(bosses.filter(b => b.custom).length, 1)
  for (const name of expected) find(name)
})

test('every scenario has distinct, usable drop rates and valid thresholds', () => {
  for (const boss of bosses) {
    assert.ok(boss.scenarios.length > 0)
    assert.equal(new Set(boss.scenarios.map(s => s.name)).size, boss.scenarios.length)
    for (const scenario of boss.scenarios) {
      assert.ok(scenario.drops.length > 0)
      assert.equal(new Set(scenario.drops.map(d => d.name)).size, scenario.drops.length)
      for (const d of scenario.drops) {
        assert.ok(Number.isFinite(d.denominator) && d.denominator >= 1)
        assert.ok(Number.isInteger(d.threshold ?? 0) && (d.threshold ?? 0) >= 0)
        assert.ok(Number.isInteger(d.rolls ?? 1) && (d.rolls ?? 1) >= 1)
        const chance = probability(500, d.denominator, 499, d.threshold, d.rolls)
        assert.ok(Number.isFinite(chance) && chance >= 0 && chance <= 1)
      }
    }
  }
})

test('hard-mode-only drops are absent from normal mode', () => {
  for (const [name, item] of [['Kerapac, the bound', 'Any fractured'], ['Arch-Glacor', 'Frozen core'], ['TzKal-Zuk', 'Any Ek-ZekKil'], ['Zemouregal & Vorkath', "Vorkath's scale"], ['Amascut, the Devourer', 'Shard of Genesis']]) {
    const b = find(name)
    assert.ok(!b.scenarios[0].drops.some(d => d.name.includes(item)))
    assert.ok(b.scenarios.slice(1).some(s => s.drops.some(d => d.name.includes(item))))
  }
})

test('source-specific corrections avoid stale or luck-boosted calculator values', () => {
  assert.equal(drop(find('Giant Mole').scenarios[0], 'Dragon 2h').denominator, 520)
  assert.equal(drop(find('Hermod, the Spirit of War').scenarios[0], 'Hermodic').denominator, 10)
  assert.equal(drop(find('Nex, Angel of Death').scenarios[0], 'Any intricate').denominator, 1024)
  const glacor = find('Arch-Glacor').scenarios[1]
  assert.equal(drop(glacor, 'Scripture').denominator, 1 / (.001525 * .38))
})

test('pet rolls and thresholds match encounter mechanics', () => {
  const kerapac = drop(find('Kerapac, the bound').scenarios[0], 'Kerry')
  assert.equal(kerapac.rolls, 3)
  assert.equal(kerapac.threshold, 500)
  const croesus = find('Croesus').scenarios[0]
  assert.equal(drop(croesus, 'Cryptbloom').rolls, 12)
  assert.equal(drop(croesus, 'Little sus').rolls ?? 1, 1)
  const rots = find('Barrows: Rise of the Six').scenarios[0]
  assert.ok(!rots.drops.some(d => d.threshold))
  assert.match(rots.note, /250 malevolent energy/)
})

test('source URLs safely encode boss names with ampersands and commas', () => {
  assert.equal(wikiUrl('Zemouregal_&_Vorkath'), 'https://runescape.wiki/w/Zemouregal_%26_Vorkath')
  assert.ok(wikiUrl('Ivar,_King_of_Bones').includes('%2C'))
})
