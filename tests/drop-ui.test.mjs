import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { defaultPreferences } from '../src/preferences.ts'

// Render the real component so a correct helper cannot mask an outdated select.
const source = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText.replace(/^import ['"][^'"]+\.css['"];?$/gm, '').replace(/^(import .+? from )(['"])([^'"]+)\2;?$/gm, (_, prefix, quote, specifier) => {
  const resolved = specifier.startsWith('.')
    ? new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href
    : import.meta.resolve(specifier)
  return `${prefix}${quote}${resolved}${quote};`
})
const { default: App } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

function render(preferences) {
  const previousWindow = globalThis.window
  globalThis.window = { localStorage: { getItem: () => preferences ? JSON.stringify({ ...defaultPreferences, ...preferences }) : null } }
  try { return renderToStaticMarkup(createElement(App)) }
  finally {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }
}

test('rendered normal-mode dropdown exposes the shard and preserves an incompatible saved target', () => {
  const html = render({ boss: 'Nakatra, Devourer Eternal', scenario: 'Normal mode', drop: 'Shard of Genesis Essence' })
  assert.match(html, /<option value="Shard of Genesis Essence" selected="">Shard of Genesis Essence — unavailable in this scenario<\/option>/)
  assert.match(html, /id="drop" aria-invalid="true"/)
  assert.match(html, /Drop unavailable in this encounter/)
  assert.match(html, /Available in: Hard mode/)
  assert.doesNotMatch(html, /chance of at least one drop/)
})

test('rendered compatible mode calculates the saved shard at the Wiki rate', () => {
  const html = render({ boss: 'Nakatra, Devourer Eternal', scenario: 'Hard mode', drop: 'Shard of Genesis Essence', kills: '1' })
  assert.match(html, /<option value="Shard of Genesis Essence" selected="">Shard of Genesis Essence<\/option>/)
  assert.match(html, /1 \/ 75/)
  assert.match(html, /1\.33%/)
  assert.match(html, /chance of at least one drop/)
  assert.doesNotMatch(html, /Drop unavailable in this encounter/)
})

test('unknown-rate selection renders an explanation without odds or a false mode error', () => {
  const html = render({ boss: 'Commander Zilyana', scenario: 'Normal mode', drop: "Saradomin's hum" })
  assert.match(html, /Drop rate not modelled/)
  assert.match(html, /without a confirmed numerical rate/)
  assert.doesNotMatch(html, /chance of at least one drop|Drop unavailable in this encounter/)
})

test('a first visit still begins with no boss selected', () => {
  const html = render(null)
  assert.match(html, /<option value="-1" selected="">Select a boss/)
  assert.match(html, /Choose your next hunt/)
  assert.doesNotMatch(html, /id="drop"/)
})

test('multiple plans render exact comparison probabilities and three numbered graph markers', () => {
  const html = render({ boss: 'Nakatra, Devourer Eternal', scenario: 'Hard mode', drop: 'Shard of Genesis Essence', kills: '50, 100, 500' })
  assert.equal((html.match(/class="plan-marker-label"/g) ?? []).length, 3)
  for (const count of [50, 100, 500]) {
    const chance = ((1 - (1 - 1 / 75) ** count) * 100).toFixed(2)
    assert.ok(html.includes(`${count} kills: ${chance}%`))
    assert.ok(html.includes(`<td>${chance}%</td>`))
  }
  assert.match(html, /in your next <strong>500 kills<\/strong>/)
  assert.match(html, /id="kills" type="text"/)
  assert.match(html, /stroke="#67e8f9"/)
})

test('an unfinished comparison list shows validation instead of misleading partial odds', () => {
  const html = render({ boss: 'Nakatra, Devourer Eternal', scenario: 'Hard mode', drop: 'Shard of Genesis Essence', kills: '50, 100,' })
  assert.match(html, /Enter up to 10 comma-separated planned kill counts/)
  assert.doesNotMatch(html, /class="plan-table"|chance of at least one drop/)
})
