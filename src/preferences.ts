import { bosses } from './data.ts'
import { dropOptions } from './drop-options.ts'

export const STORAGE_KEY = 'dropwise.preferences.v1'
export type Preferences = {
  boss: string
  scenario: string
  drop: string
  kills: string
  current: string
  customRate: string
  customThreshold: string
  advanced: boolean
}
export const defaultPreferences: Preferences = {
  boss: '', scenario: '', drop: '', kills: '500', current: '0',
  customRate: '', customThreshold: '', advanced: false,
}

export function restorePreferences(raw: string | null): Preferences {
  try {
    const saved = JSON.parse(raw ?? 'null')
    if (!saved || typeof saved !== 'object') return { ...defaultPreferences }
    const boss = bosses.find(b => b.name === saved.boss)
    if (!boss) return { ...defaultPreferences }
    const scenario = boss.scenarios.find(s => s.name === saved.scenario) ?? boss.scenarios[0]
    // An unavailable target remains selected if it exists in another scenario.
    const knownDrop = dropOptions(boss, scenario).some(d => d.name === saved.drop)
    const text = (key: keyof Preferences) => typeof saved[key] === 'string' && saved[key].length <= 100
      ? saved[key] as string : defaultPreferences[key] as string
    return {
      boss: boss.name, scenario: scenario.name,
      drop: knownDrop ? saved.drop : scenario.drops[0].name,
      kills: text('kills'), current: text('current'),
      customRate: text('customRate'), customThreshold: text('customThreshold'),
      advanced: typeof saved.advanced === 'boolean' ? saved.advanced : !!boss.custom,
    }
  } catch {
    return { ...defaultPreferences }
  }
}

export function readPreferences(): Preferences {
  try { return restorePreferences(window.localStorage.getItem(STORAGE_KEY)) }
  catch { return { ...defaultPreferences } }
}

export function savePreferences(preferences: Preferences): void {
  // Storage may be disabled, full, or unavailable; the calculator still works.
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)) }
  catch { /* Keep the current in-memory selections. */ }
}
