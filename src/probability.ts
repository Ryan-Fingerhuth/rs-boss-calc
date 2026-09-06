function outcomes(kills: number, denominator: number, current: number, threshold: number, rolls: number) {
  let remaining = kills, kc = current, logMiss = 0, expectedDrops = 0
  while (remaining > 0) {
    const multiplier = threshold ? Math.min(10, 1 + Math.floor(kc / threshold)) : 1
    const count = threshold && multiplier < 10 ? Math.min(remaining, threshold - kc % threshold) : remaining
    const rate = Math.min(1, multiplier / denominator)
    expectedDrops += count * rolls * rate
    logMiss += count * rolls * Math.log1p(-rate)
    remaining -= count
    kc += count
  }
  return { logMiss, expectedDrops }
}

export function probability(kills: number, denominator: number, current = 0, threshold = 0, rolls = 1): number {
  return -Math.expm1(outcomes(kills, denominator, current, threshold, rolls).logMiss)
}

// Historical odds assume zero drops and the selected encounter throughout.
export function dryStreak(kills: number, denominator: number, threshold = 0, rolls = 1) {
  const { logMiss, expectedDrops } = outcomes(kills, denominator, 0, threshold, rolls)
  return { noDrop: Math.exp(logMiss), receivedDrop: logMiss === 0 ? 0 : -Math.expm1(logMiss), expectedDrops }
}
export function milestone(target: number, denominator: number, current: number, threshold: number, rolls = 1): number {
  let low = 0, high = 1
  while (probability(high, denominator, current, threshold, rolls) < target) high *= 2
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (probability(mid, denominator, current, threshold, rolls) >= target) high = mid
    else low = mid + 1
  }
  return low
}
