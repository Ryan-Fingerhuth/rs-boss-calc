export function probability(kills: number, denominator: number, current = 0, threshold = 0, rolls = 1): number {
  let remaining = kills, kc = current, logMiss = 0
  while (remaining > 0) {
    const multiplier = threshold ? Math.min(10, 1 + Math.floor(kc / threshold)) : 1
    const count = threshold && multiplier < 10 ? Math.min(remaining, threshold - kc % threshold) : remaining
    const rate = Math.min(1, multiplier / denominator)
    if (rate === 1) return 1
    logMiss += count * rolls * Math.log1p(-rate)
    remaining -= count
    kc += count
  }
  return -Math.expm1(logMiss)
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
