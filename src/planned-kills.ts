export const MAX_PLANS = 10;
export const MAX_KILLS = 10_000_000;

/** Commas separate plans, so thousands separators are intentionally unsupported. */
export function parsePlannedKills(input: string): number[] | null {
  const parts = input.split(",").map((part) => part.trim());
  if (parts.length > MAX_PLANS || parts.some((part) => !/^\d+$/.test(part)))
    return null;
  const values = parts.map(Number);
  if (values.some((value) => !Number.isSafeInteger(value) || value > MAX_KILLS))
    return null;
  return [...new Set(values)].sort((a, b) => a - b);
}

export function addPlannedKills(input: string, count: number): string {
  const plans = parsePlannedKills(input);
  if (!plans || !Number.isInteger(count) || count < 0 || count > MAX_KILLS)
    return input;
  if (plans.includes(count) || plans.length >= MAX_PLANS) return input;
  return [...plans, count].sort((a, b) => a - b).join(", ");
}
