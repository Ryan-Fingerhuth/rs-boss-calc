import assert from 'node:assert/strict'
import test from 'node:test'
import { sourceTitles, hash, validateSnapshot, compareSnapshots, fetchSnapshot } from '../scripts/wiki-lib.mjs'

const page = (title, content, revision = 1) => ({ title, content, revision, sha256: hash(content) })
const snapshot = pages => ({ version: 1, pages })

test('sources combine catalogue and documentation, normalizing URLs and excluding custom entries', () => {
  assert.deepEqual(sourceTitles([{ source: 'Giant_mole' }, { source: 'Bosses', custom: true }],
    ['[source](https://runescape.wiki/w/Giant_mole#Drops) [module](https://runescape.wiki/w/Module%3ATelos_calculator)']),
  ['Giant mole', 'Module:Telos calculator'])
})

test('reports content additions, changes and removals but ignores revision-only changes', () => {
  const old = snapshot([page('A', 'old'), page('B', 'same'), page('C', 'removed')])
  const next = snapshot([page('A', 'new', 2), page('B', 'same', 2), page('D', 'added')])
  assert.deepEqual(compareSnapshots(old, next).map(p => [p.title, p.status]), [['A', 'changed'], ['D', 'added'], ['C', 'removed']])
})

test('rejects corrupt, duplicate, and incomplete snapshots', () => {
  assert.throws(() => validateSnapshot(snapshot([{ ...page('A', 'content'), content: 'tampered' }])))
  assert.throws(() => validateSnapshot(snapshot([page('A', 'content'), page('A', 'content')])))
  assert.throws(() => validateSnapshot(snapshot([page('A', 'content')]), ['A', 'B']))
})

test('fetch resolves redirects and retains the requested source identity', async () => {
  const result = await fetchSnapshot(['Alias'], { fetchImpl: async () => ({ ok: true, json: async () => ({ query: {
    redirects: [{ from: 'Alias', to: 'Canonical' }], pages: [{ title: 'Canonical', revisions: [{ revid: 12, slots: { main: { content: 'wiki text' } } }] }],
  } }) }) })
  assert.equal(result.pages[0].title, 'Alias')
  assert.equal(result.pages[0].resolvedTitle, 'Canonical')
  assert.equal(result.pages[0].revision, 12)
})

test('fetch retries rate limits and fails closed on missing content', async () => {
  let calls = 0
  const pauses = []
  await assert.rejects(fetchSnapshot(['Missing'], {
    pause: async ms => pauses.push(ms),
    fetchImpl: async () => ++calls === 1
      ? { status: 429, headers: new Headers({ 'retry-after': '2' }) }
      : { ok: true, json: async () => ({ query: { pages: [{ title: 'Missing', missing: true }] } }) },
  }), /Missing Wiki content/)
  assert.equal(calls, 2)
  assert.deepEqual(pauses, [2000])
})
