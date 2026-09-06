import assert from 'node:assert/strict'
import test from 'node:test'
import { bosses } from '../src/data.ts'
import { defaultPreferences, restorePreferences, readPreferences, savePreferences, STORAGE_KEY } from '../src/preferences.ts'

const vorkath = bosses.find(b => b.name === 'Zemouregal & Vorkath')
const scale = "Vorkath's scale"
const saved = {
  ...defaultPreferences, boss: vorkath.name, scenario: 'Hard mode', drop: scale,
  kills: '1500', current: '399', customRate: '180', customThreshold: '0', advanced: true,
}

test('fresh visits, reset, corrupt storage and obsolete bosses have no boss selected', () => {
  for (const raw of [null, '', 'broken', 'null', '[]', '42', JSON.stringify(defaultPreferences), '{"boss":"Removed boss"}']) {
    assert.deepEqual(restorePreferences(raw), defaultPreferences)
  }
})

test('preferences round-trip all selected fields by name', () => {
  assert.deepEqual(restorePreferences(JSON.stringify(saved)), saved)
})

test('an unavailable hard-mode target survives a reload in normal mode', () => {
  const result = restorePreferences(JSON.stringify({ ...saved, scenario: 'Normal mode' }))
  assert.equal(result.drop, scale)
  const normal = vorkath.scenarios.find(s => s.name === result.scenario)
  assert.equal(normal.drops.find(d => d.name === result.drop), undefined)
  const hard = vorkath.scenarios.find(s => s.name === 'Hard mode')
  assert.ok(hard.drops.find(d => d.name === result.drop))
})

test('shared targets resolve to scenario-specific rates, even at different indices', () => {
  const name = 'Vorki · Pet'
  const normal = vorkath.scenarios[0].drops.find(d => d.name === name)
  const hard = vorkath.scenarios[1].drops.find(d => d.name === name)
  assert.equal(normal.denominator, 2000)
  assert.equal(hard.denominator, 1000)
  assert.notEqual(vorkath.scenarios[0].drops.indexOf(normal), vorkath.scenarios[1].drops.indexOf(hard))
  for (const scenario of vorkath.scenarios) {
    assert.equal(restorePreferences(JSON.stringify({ ...saved, scenario: scenario.name, drop: name })).drop, name)
  }
})

test('stale scenarios, removed drops and malformed fields get safe fallbacks', () => {
  const result = restorePreferences(JSON.stringify({ ...saved, scenario: 'Removed mode', drop: 'Removed drop', kills: {}, current: null, customRate: 10, advanced: 'yes' }))
  assert.equal(result.scenario, vorkath.scenarios[0].name)
  assert.equal(result.drop, vorkath.scenarios[0].drops[0].name)
  assert.equal(result.kills, '500')
  assert.equal(result.current, '0')
  assert.equal(result.customRate, '')
  assert.equal(result.advanced, false)
})

test('local storage writes, restores and tolerates access failures', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'window')
  try {
    const entries = new Map()
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: {
      getItem: key => entries.get(key) ?? null,
      setItem: (key, value) => entries.set(key, value),
    } } })
    savePreferences(saved)
    assert.ok(entries.has(STORAGE_KEY))
    assert.deepEqual(readPreferences(), saved)
    savePreferences(defaultPreferences)
    assert.deepEqual(readPreferences(), defaultPreferences)
    Object.defineProperty(globalThis, 'window', { configurable: true, get() { throw new Error('Storage blocked') } })
    assert.deepEqual(readPreferences(), defaultPreferences)
    assert.doesNotThrow(() => savePreferences(saved))
  } finally {
    if (original) Object.defineProperty(globalThis, 'window', original)
    else delete globalThis.window
  }
})
