import { createHash } from 'node:crypto'

export const hash = value => createHash('sha256').update(value).digest('hex')

export function sourceTitles(bosses, documents) {
  const titles = bosses.filter(b => !b.custom).map(b => b.source)
  for (const document of documents) {
    for (const match of document.matchAll(/https:\/\/runescape\.wiki\/w\/([^\s)\]>]+)/g)) {
      titles.push(decodeURIComponent(match[1].split('#')[0]))
    }
  }
  return [...new Set(titles.map(t => t.replaceAll('_', ' ').trim()))].sort()
}

export function validateSnapshot(snapshot, titles) {
  if (snapshot?.version !== 1 || !Array.isArray(snapshot.pages)) throw new Error('Invalid snapshot format')
  const seen = new Set()
  for (const page of snapshot.pages) {
    if (!page || typeof page.title !== 'string' || seen.has(page.title) ||
        !Number.isSafeInteger(page.revision) || page.revision < 1 ||
        typeof page.content !== 'string' || !page.content.trim() ||
        page.sha256 !== hash(page.content)) throw new Error('Invalid or duplicate snapshot page')
    seen.add(page.title)
  }
  if (titles && (seen.size !== titles.length || titles.some(t => !seen.has(t)))) {
    throw new Error('Snapshot does not match current source list; run wiki:fetch again')
  }
  return snapshot
}

export function compareSnapshots(previous, current) {
  const before = new Map((previous?.pages ?? []).map(p => [p.title, p]))
  const changes = []
  for (const page of current.pages) {
    const old = before.get(page.title)
    if (!old || old.sha256 !== page.sha256) {
      changes.push({ title: page.title, status: old ? 'changed' : 'added',
        previousRevision: old?.revision ?? null, revision: page.revision,
        url: `https://runescape.wiki/w/${encodeURIComponent(page.title)}?oldid=${page.revision}`,
        diff: old ? `https://runescape.wiki/w/${encodeURIComponent(page.title)}?diff=${page.revision}&oldid=${old.revision}` : null })
    }
    before.delete(page.title)
  }
  for (const page of before.values()) changes.push({ title: page.title, status: 'removed', previousRevision: page.revision })
  return changes
}

export async function fetchSnapshot(titles, { fetchImpl = fetch, pause = ms => new Promise(r => setTimeout(r, ms)), onProgress = () => {} } = {}) {
  const pages = []
  for (let offset = 0; offset < titles.length; offset += 10) {
    const batch = titles.slice(offset, offset + 10)
    const url = new URL('https://runescape.wiki/api.php')
    url.search = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2',
      prop: 'revisions', rvprop: 'ids|timestamp|content', rvslots: 'main',
      titles: batch.join('|'), redirects: '1', maxlag: '5' }).toString()
    let data
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await fetchImpl(url, { headers: { 'User-Agent': 'rs-boss-calc-source-sync/1.0 (local source maintenance)', Accept: 'application/json' }, signal: AbortSignal.timeout(30000) })
      if (response.status === 429 || response.status === 503) {
        if (attempt === 2) throw new Error(`Wiki HTTP ${response.status}; try again later`)
        const retry = Number(response.headers.get('retry-after'))
        await pause(Math.min(30000, Math.max(2000, Number.isFinite(retry) ? retry * 1000 : 2000)))
        continue
      }
      if (!response.ok) throw new Error(`Wiki HTTP ${response.status}`)
      data = await response.json()
      if (data.error?.code === 'maxlag' && attempt < 2) { await pause(5000); continue }
      if (data.error) throw new Error(`Wiki API: ${data.error.info ?? data.error.code}`)
      break
    }
    const aliases = new Map([...(data.query?.normalized ?? []), ...(data.query?.redirects ?? [])].map(x => [x.from, x.to]))
    for (const title of batch) {
      let resolved = title
      const visited = new Set()
      while (aliases.has(resolved)) {
        if (visited.has(resolved)) throw new Error(`Redirect cycle: ${title}`)
        visited.add(resolved)
        resolved = aliases.get(resolved)
      }
      const page = data.query?.pages?.find(p => p.title === resolved)
      const revision = page?.revisions?.[0]
      const content = revision?.slots?.main?.content
      if (!revision || typeof content !== 'string' || !content.trim()) throw new Error(`Missing Wiki content: ${title}`)
      pages.push({ title, resolvedTitle: resolved, revision: revision.revid, timestamp: revision.timestamp, content, sha256: hash(content) })
    }
    onProgress(Math.min(offset + 10, titles.length), titles.length)
    if (offset + 10 < titles.length) await pause(1000)
  }
  return validateSnapshot({ version: 1, fetchedAt: new Date().toISOString(), pages }, titles)
}
