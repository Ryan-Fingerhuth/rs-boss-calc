export const themes = [
  { id: 'monochrome', name: 'Black & White' },
  { id: 'forest', name: 'Forest' },
  { id: 'midnight', name: 'Midnight Blue' },
  { id: 'plum', name: 'Plum' },
] as const

export type Theme = (typeof themes)[number]['id']
const storageKey = 'dropwise.theme.v1'

export function readTheme(): Theme {
  try {
    const saved = window.localStorage.getItem(storageKey)
    return themes.find(theme => theme.id === saved)?.id ?? 'monochrome'
  } catch {
    return 'monochrome'
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  try { window.localStorage.setItem(storageKey, theme) }
  catch { /* The selected theme still works when storage is unavailable. */ }
}
