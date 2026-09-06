import assert from 'node:assert/strict'
import test from 'node:test'
import { probability, milestone, dryStreak } from '../src/probability.ts'

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} != ${expected}`)

test('dry streak measures the historical no-drop probability and expected drops', () => {
  const result = dryStreak(1000, 512)
  close(result.noDrop, (511 / 512) ** 1000)
  close(result.receivedDrop, 1 - result.noDrop)
  close(result.expectedDrops, 1000 / 512)
  assert.deepEqual(dryStreak(0, 512), { noDrop: 1, receivedDrop: 0, expectedDrops: 0 })
  assert.deepEqual(dryStreak(1, 1), { noDrop: 0, receivedDrop: 1, expectedDrops: 1 })
})

test('dry streak includes historical thresholds and multiple rolls', () => {
  const result = dryStreak(1000, 1500, 500, 3)
  close(result.noDrop, (1 - 1 / 1500) ** 1500 * (1 - 2 / 1500) ** 1500)
  close(result.expectedDrops, 3)
  const rare = dryStreak(20000, 512)
  assert.ok(rare.noDrop > 0)
  assert.ok(rare.noDrop < 1e-16)
})

test('fixed-rate probabilities include all independent loot rolls', () => {
  close(probability(500, 384), 1 - (383 / 384) ** 500)
  close(probability(100, 5400, 0, 0, 12), 1 - (5399 / 5400) ** 1200)
  close(probability(0, 1, 0, 0, 3), 0)
  close(probability(1, 1, 0, 0, 3), 1)
})

test('pet thresholds use completed kills, not loot rolls', () => {
  close(probability(1, 1500, 499, 500, 3), 1 - (1 - 1 / 1500) ** 3)
  close(probability(1, 1500, 500, 500, 3), 1 - (1 - 2 / 1500) ** 3)
  close(probability(2, 1500, 499, 500, 3), 1 - (1 - 1 / 1500) ** 3 * (1 - 2 / 1500) ** 3)
  close(probability(100, 2500, 9000, 500, 5), 1 - (1 - 10 / 2500) ** 500)
})

test('grouped calculation matches explicit kill-by-kill rolls across thresholds', () => {
  for (const rolls of [1, 3, 5, 12]) {
    for (const current of [0, 199, 200, 1799, 1800]) {
      let miss = 1
      for (let i = 0; i < 1000; i++) {
        const p = Math.min(10, 1 + Math.floor((current + i) / 200)) / 1000
        miss *= (1 - p) ** rolls
      }
      close(probability(1000, 1000, current, 200, rolls), 1 - miss)
    }
  }
})

test('milestones return the first qualifying kill, including multi-roll pets', () => {
  for (const rolls of [1, 3, 12]) {
    for (const threshold of [0, 500]) {
      for (const target of [.5, .9, .95, .99]) {
        const kills = milestone(target, 1500, 499, threshold, rolls)
        assert.ok(probability(kills, 1500, 499, threshold, rolls) >= target)
        assert.ok(probability(kills - 1, 1500, 499, threshold, rolls) < target)
      }
    }
  }
})
