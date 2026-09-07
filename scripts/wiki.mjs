import { readFile, mkdir, writeFile, rename } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
import { spawnSync } from 'node:child_process'
import { bosses } from '../src/data.ts'
import { sourceTitles, validateSnapshot, compareSnapshots, fetchSnapshot, hash } from './wiki-lib.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const cachedPath = resolve(root, '.wiki-cache/latest.json')
const baselinePath = resolve(root, 'wiki/snapshot.json')
const reportPath = resolve(root, '.wiki-cache/report.json')
async function readOptional(path) {
  try { return await readFile(path, 'utf8') } catch (error) { if (error.code === 'ENOENT') return null; throw error }
}
async function save(path, value) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(`${path}.tmp`, value, 'utf8')
  await rename(`${path}.tmp`, path)
}
const json = value => JSON.stringify(value, null, 2) + '\n'

async function main() {
  const [command, ...args] = process.argv.slice(2)
  if (!['fetch', 'check', 'sync'].includes(command) || args.some(a => command !== 'sync' || !/^--accept=[a-f0-9]{64}$/.test(a)) || args.length > 1) {
    throw new Error('Usage: npm run wiki:fetch | wiki:check | wiki:sync -- --accept=<report snapshot hash>')
  }
  const documents = await Promise.all(['SOURCES.md', 'DROP-AUDIT.md'].map(p => readFile(resolve(root, p), 'utf8')))
  const titles = sourceTitles(bosses, documents)
  if (command === 'fetch') {
    const snapshot = await fetchSnapshot(titles, { onProgress: (done, total) => console.log(`Fetched ${done}/${total} Wiki sources`) })
    await save(cachedPath, json(snapshot))
    console.log('Cached complete snapshot. Run npm run wiki:check to review.')
    return
  }
  const raw = await readOptional(cachedPath)
  if (!raw) throw new Error('No cached snapshot. Run npm run wiki:fetch first.')
  const current = validateSnapshot(JSON.parse(raw), titles)
  const baseline = await readOptional(baselinePath)
  const previous = baseline ? validateSnapshot(JSON.parse(baseline)) : null
  const changes = compareSnapshots(previous, current)
  const digest = hash(raw)
  const report = { snapshotHash: digest, fetchedAt: current.fetchedAt, baselineExists: !!previous,
    scope: 'Source content changes only. Rates and mechanics require review; no automatic catalogue imports are configured.', changes }
  await save(reportPath, json(report))
  console.log(`${changes.length} source changes${previous ? '' : ' (initial baseline)'}. Report: .wiki-cache/report.json`)
  for (const change of changes) console.log(`${change.status}: ${change.title}\n  ${change.diff ?? change.url ?? 'Removed from source list'}`)
  if (command === 'check' || !args.length) {
    console.log(`After reviewing sources and any necessary catalogue edits, accept this exact snapshot:\nnpm run wiki:sync -- --accept=${digest}`)
    if (command === 'check' && changes.length) process.exitCode = 1
    return
  }
  if (args[0] !== `--accept=${digest}`) throw new Error('Snapshot changed since review; run wiki:check again')
  const tests = spawnSync(process.execPath, ['--experimental-strip-types', '--test', 'tests/*.test.mjs'], { cwd: root, stdio: 'inherit' })
  if (tests.error || tests.status !== 0) throw new Error('Tests failed; baseline was not updated')
  await save(baselinePath, raw)
  console.log('Accepted source snapshot saved to wiki/snapshot.json. Catalogue rates remain curated.')
}

main().catch(error => { console.error(`Wiki sync: ${error.message}`); process.exitCode = 2 })
