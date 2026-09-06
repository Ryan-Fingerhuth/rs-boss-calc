import assert from 'node:assert/strict'
import test from 'node:test'
import { bosses } from '../src/data.ts'
import { dropOptions } from '../src/drop-options.ts'
import { restorePreferences, defaultPreferences } from '../src/preferences.ts'
import { probability } from '../src/probability.ts'

const boss = name => bosses.find(b => b.name === name)
const drop = (name, item, scenario = 0) => boss(name).scenarios[scenario].drops.find(d => d.name === item)

test('Nakatra shard is discoverable in normal mode, unavailable there, and 1/75 in hard mode', () => {
  const nakatra = boss('Nakatra, Devourer Eternal')
  const target = 'Shard of Genesis Essence'
  const normal = dropOptions(nakatra, nakatra.scenarios[0]).find(d => d.name === target)
  assert.equal(normal.available, false)
  assert.equal(normal.drop, undefined)
  assert.match(normal.label, /unavailable/)
  assert.deepEqual(normal.scenarios, ['Hard mode'])
  const hard = dropOptions(nakatra, nakatra.scenarios[1]).find(d => d.name === target)
  assert.equal(hard.available, true)
  assert.equal(hard.drop.denominator, 75)
  assert.equal(probability(1, hard.drop.denominator), 1 / 75)
})

test('all boss targets remain visible across modes without duplicate names', () => {
  for (const b of bosses) {
    const all = dropOptions(b, b.scenarios[0]).map(d => d.name)
    assert.equal(new Set(all).size, all.length)
    for (const scenario of b.scenarios) {
      const targets = dropOptions(b, scenario)
      assert.deepEqual(targets.map(d => d.name), all)
      for (const target of targets) {
        assert.equal(target.available, !!target.drop || !!target.unmodelled)
        assert.ok(!(target.drop && target.unmodelled), `${b.name}: ${target.name} must have one rate status`)
        if (target.unmodelled) assert.ok(target.unmodelled.note.length > 20)
      }
    }
  }
})

test('audited missing equipment and materials use Wiki table rates', () => {
  for (const [name, item, rate] of [
    ['General Graardor', 'Bandos hilt', 512], ["Kree'arra", 'Armadyl hilt', 512],
    ["K'ril Tsutsaroth", 'Zamorak hilt', 512], ['Commander Zilyana', 'Saradomin hilt', 512],
    ['King Black Dragon', 'Dragon Rider gloves', 2000], ['King Black Dragon', 'Dragon Rider boots', 2000],
    ['King Black Dragon', 'Dragon kite ornament kit (or)', 2000], ['King Black Dragon', 'Dragon kite ornament kit (sp)', 2000],
    ['Solak', 'Cinderbane gloves', 1000], ['Solak', 'Ancient elven ritual shard', 1000],
    ['Corporeal Beast', 'Holy elixir', 512 / 3], ['Black stone dragon', 'Draconic energy', 1],
    ['The Ambassador', 'Black stone heart', 2], ['The Magister', 'Key to the Crossing', 128],
  ]) assert.equal(drop(name, item)?.denominator, rate, `${name}: ${item}`)
  for (const name of ['General Graardor', "Kree'arra", "K'ril Tsutsaroth", 'Commander Zilyana']) {
    for (let scenario = 0; scenario < 2; scenario++) {
      for (let part = 1; part <= 3; part++) assert.equal(drop(name, `Godsword shard ${part}`, scenario).denominator, 768)
    }
  }
})

test('conditional essence odds include failure of the preceding equipment roll', () => {
  for (const [name, item, count, normal] of [
    ['Gregorovic', 'Sliskean essence', 6, 256], ['Twin Furies', 'Zamorakian essence', 6, 256],
    ['Helwyr', 'Serenic essence', 6, 256], ['Vindicta', 'Zarosian essence', 5, 255],
  ]) {
    assert.equal(drop(name, item).denominator, 64 / (1 - count / normal))
    assert.equal(drop(name, item, 1).denominator, 44 / (1 - count / 179))
  }
})

test('new prerequisite drops state their conditions and mode restrictions', () => {
  for (const b of bosses.filter(b => b.group === 'Monastery of Ascension')) {
    const grips = drop(b.name, 'Ascension grips')
    assert.equal(grips.denominator, 2056)
    assert.match(grips.note, /Slayer assignment/)
  }
  for (const b of bosses.filter(b => b.group === 'Rex Matriarchs')) {
    assert.equal(drop(b.name, "Skeka's hypnowand focus").denominator, 5000 / 7)
    for (const piece of ['projector', 'handle', 'base']) {
      const target = drop(b.name, `Skeka's hypnowand ${piece}`)
      assert.equal(target.denominator, 5000)
      assert.match(target.note, /Aged journal/)
    }
  }
  assert.equal(drop('Giant Mole', 'Ultra-growth potion (1)'), undefined)
  assert.equal(drop('Giant Mole', 'Ultra-growth potion (1)', 1).denominator, 520 / 30)
  assert.equal(drop('TzKal-Zuk', 'Igneous stone', 2), undefined)
})

test('unmodelled targets survive storage and never acquire an invented preset rate', () => {
  const b = boss('Commander Zilyana')
  const saved = restorePreferences(JSON.stringify({ ...defaultPreferences, boss: b.name, scenario: 'Normal mode', drop: "Saradomin's hum" }))
  assert.equal(saved.drop, "Saradomin's hum")
  const target = dropOptions(b, b.scenarios[0]).find(d => d.name === saved.drop)
  assert.equal(target.available, true)
  assert.equal(target.drop, undefined)
  assert.match(target.unmodelled.note, /without a confirmed numerical rate/)
  const kerapac = boss('Kerapac, the bound')
  const staff = dropOptions(kerapac, kerapac.scenarios[0]).find(d => d.name === 'Fractured stabilisation gem')
  assert.equal(staff.available, false)
  assert.ok(staff.scenarios.every(s => s.startsWith('Hard mode')))
})

test('manuscripts use their own roll counts rather than equipment rolls', () => {
  assert.equal(drop('The Gate of Elidinis', 'Manuscript of Elidinis').rolls, 4)
  assert.equal(drop('Croesus', 'Manuscript of Bik').rolls, undefined)
  assert.equal(drop('Arch-Glacor', 'Manuscript of Wen').rolls, 3)
  assert.equal(drop('Kerapac, the bound', 'Manuscript of Jas').rolls, 3)
  assert.equal(drop('Kerapac, the bound', 'Manuscript of Jas', 2).rolls, 1)
})
