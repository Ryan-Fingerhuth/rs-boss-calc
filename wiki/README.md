# Wiki source maintenance

Requires Node 24 (the same TypeScript stripping support used by the tests).

This first phase downloads and tracks Wiki source content. It does **not** parse
drop rates or rewrite the catalogue. Source-specific parsers and explicit local
override rules are future work. The corrections in `SOURCES.md` and encounter
formulas remain authoritative for this application until reviewed and edited.

1. Run `npm run wiki:fetch` to download every non-custom boss source plus Wiki
   links in `SOURCES.md` and `DROP-AUDIT.md`. Downloads use the MediaWiki API in
   batches with timeouts, pacing and bounded retries for throttling/maxlag.
   A failed download leaves the previous complete cache intact.
2. Run `npm run wiki:check` to compare the cached content against the accepted
   `wiki/snapshot.json`. Read `.wiki-cache/report.json` and its pinned revision
   and Wiki diff links. The initial run lists all sources as additions.
   Content hashes ignore revision changes that leave source text identical.
3. Review changed sources, including transcluded templates/modules where relevant,
   and manually update catalogue rates, formulas, tests and source notes as needed.
   Run `npm run wiki:sync -- --accept=<hash printed by check>` to accept exactly
   the downloaded snapshot. Sync runs the full test suite before saving the baseline.
   Commit `wiki/snapshot.json` alongside any reviewed catalogue changes.

`wiki:sync` without `--accept` only writes a report. It never fetches newer content
behind the reviewer's back. `wiki:check` exits 0 when unchanged, 1 when changes
need review, and 2 on errors. Fetch and sync exit 2 on errors. Cache and reports
are ignored by Git; the accepted snapshot contains raw source text and revision
metadata and is intended to be tracked. Fetching does not advance verification
dates in the project documentation.

The report detects source-text changes, including unrelated edits. It cannot yet
identify specific changed rates, automatically discover new bosses, or detect
changes in transcluded dependencies absent from the source list. Add relevant
Wiki links to `SOURCES.md` to track additional dependencies. No baseline is
accepted automatically on first use.

Downloaded text originates from the RuneScape Wiki; preserve source attribution
and consult its licensing terms when redistributing snapshots.
