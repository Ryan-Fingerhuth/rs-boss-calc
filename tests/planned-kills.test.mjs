import assert from 'node:assert/strict'
import test from 'node:test'
import { parsePlannedKills, addPlannedKills } from '../src/planned-kills.ts'
import { restorePreferences, defaultPreferences } from '../src/preferences.ts'

test('planned kills support single values and sorted, deduplicated comparisons', () => {
  assert.deepEqual(parsePlannedKills('500'), [500])
  assert.deepEqual(parsePlannedKills('500, 50, 100, 50'), [50, 100, 500])
  assert.deepEqual(parsePlannedKills('0, 10000000'), [0, 10000000])
})

test('partial, malformed and out-of-range lists do not silently become valid plans', () => {
  for (const input of ['', ' ', '50,', ',100', '50,,100', '-1', '1.5', '1e3', 'NaN', 'Infinity', '10000001', '1 000', Array(11).fill('50').join(',')]) {
    assert.equal(parsePlannedKills(input), null, input)
  }
})

test('adding presets or milestones retains plans and respects the limit', () => {
  assert.equal(addPlannedKills('50, 500', 100), '50, 100, 500')
  assert.equal(addPlannedKills('50, 100, 500', 100), '50, 100, 500')
  assert.equal(addPlannedKills('50,', 100), '50,')
  const full = '1, 2, 3, 4, 5, 6, 7, 8, 9, 10'
  assert.equal(addPlannedKills(full, 11), full)
  assert.equal(addPlannedKills('50', 10000001), '50')
})

test('multi-plan and legacy single-plan preferences both survive restoration', () => {
  for (const kills of ['500', '50, 100, 500', '10000000, 9999999, 9999998, 9999997, 9999996, 9999995, 9999994, 9999993, 9999992, 9999991']) {
    const restored = restorePreferences(JSON.stringify({ ...defaultPreferences, boss: 'Nakatra, Devourer Eternal', scenario: 'Hard mode', drop: 'Shard of Genesis Essence', kills }))
    assert.equal(restored.kills, kills)
  }
})
