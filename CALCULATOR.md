# Dropwise

Run `npm run dev` to start. `npm run build` checks TypeScript and produces `dist`; `npm run lint` runs ESLint.

The typed catalogue in `src/data.ts`, `src/boss-groups.ts`, and `src/extra-drops.ts` contains selected drops from 62 bosses, plus custom input. All requested groups are included: ten Elite Dungeon bosses (including Zamorak), four Sanctum encounters (including the separate Gate of Elidinis), six Legiones, four Rex Matriarchs (including Osseous), and three Dagannoth Kings. The Boss dropdown groups these encounters for navigation. Each boss links to its RuneScape Wiki page. Direct Wiki data and calculator modules were retrieved September 5, 2026; see [SOURCES.md](SOURCES.md) for verification notes. This is not a full collection-log calculator or a live Wiki sync.

For Legiones, Rex Matriarchs, and Dagannoth Kings, existing kill count is the combined family kill count. Planned kills must all be of the selected boss; rotating between bosses is not simulated. Elite Dungeon pet presets use combined solo/group kills of that particular boss and group-specific thresholds. Normal/hard mode Sanctum counts are per boss, not full dungeon runs. These instructions appear under the kill-count input.

Zamorak presets cover repeat 0%, 20%, and 50% enrage kills, where unique-drop bad-luck mitigation does not apply. Higher-enrage mitigation is not modelled. Regular loot presets for the final bosses of ED1–3 assume the pet is already owned, since a pet roll can replace main-table loot; the separate pet target models an unowned pet. No story mode, lucky charms, Dungeoneering master cape boosts, or chest doubling is included.

Encounter scenarios select modes, personal loot piles, group sizes, contribution bands, or fixed enrage as appropriate. Telos and hard mode Arch-Glacor presets assume claiming after every kill. Amascut uses the listed enrage presets. GWD2 presets assume the maximum reputation drop-rate bonus. No luck or pontifex ring boosts, minion drops, LootShare allocation, changing enrage, streaking, or special non-pet bad-luck mitigation are simulated.

Numerical presets for ordered staff/sword pieces, anima orbs, and AoD chests represent **any next piece/orb/chest**; these are not probabilities for completing a set or obtaining a particular position in a sequence. ROTS pets are purchased using malevolent energy and are not treated as random drops. Araxxi pet and leg-path prerequisites are shown beside the selected item. Only eligible kills should be entered.

The target dropdown lists the union of drops across all scenarios for a boss, with unavailable items marked and compatible scenarios named. This makes Nakatra's hard-only Genesis shard visible even when normal mode is selected. Unmodelled targets (unknown rates, ownership rules, or sequences) are selectable and saved, but show an explanation instead of odds. See [DROP-AUDIT.md](DROP-AUDIT.md) for the 62-boss audit and remaining limitations.

Custom rates must represent a per-kill probability. An explicit custom rate disables the preset's multiple-roll count, preventing double-counting. A zero threshold disables threshold mechanics. Changing boss selects its first scenario and drop. Changing scenario preserves the target by name and clears rate overrides so the new scenario's rate applies. If that scenario cannot drop the selected item, the selection remains visible with an accessible error and results are withheld, including custom calculations, until a compatible scenario or item is selected.

First-time visits have no boss selected. Boss, scenario, target, kill counts, custom inputs, and the expanded settings state persist in local storage under `dropwise.preferences.v1`. Names rather than array positions identify saved selections. Returning visits restore those preferences, including an unavailable target that belongs to another scenario of the boss. Invalid JSON, unknown bosses, and unavailable storage fall back safely. Removed scenarios or drops fall back to a valid catalogue option. Reset saves the empty initial state. Storage is local to this browser and origin; nothing is sent to a server.

Fixed rates with `r` independent rolls per kill use `1 - (1 - p)^(n*r)`. Pet rates use one minus the product of miss probabilities across the session. The multiplier for a roll is `min(10, 1 + floor(completedKills / threshold))`; completing a threshold improves the next kill's rolls. Include both normal and hard mode kills in existing kill count. Threshold progress is measured in kills, never loot piles. Denominators represent the selected scenario and are per roll when multiple rolls apply.

Vorago seismic weapons are mutually exclusive across piles, so their personal per-kill chance is calculated by adding the eligible pile probabilities. Independent pet and energy rolls use the product of miss probabilities instead. Vitalis rerolls from pet-owning teammates are excluded; Vorago presets assume the same integer number of personal piles on every kill.

`src/probability.ts` groups equal-rate rolls and uses `log1p` and `expm1` for precision. Binary search finds the smallest additional kill count meeting each milestone. Counts are limited to 10 million; denominators to 1 billion. Larger milestones are displayed but disabled. Very high probabilities can round to 100% due to floating-point precision; milestones never guarantee a drop.

The interface includes responsive layout, labeled controls, live calculations, a probability chart, and selectable milestones. Google Fonts have sans-serif fallbacks. No backend is required.

`npm test` runs catalogue coverage and probability regression tests with Node.js 22.6+ TypeScript stripping (verified with Node 24). Checks cover all requested bosses, mode restrictions, multi-roll thresholds, numerical agreement with explicit per-kill calculations, and milestone boundaries.

Tests also render the actual React component to verify shard discoverability, normal-mode rejection, hard-mode odds, unmodelled-rate explanations, and the empty first visit. Catalogue checks cover the added equipment, conditional essence rates, item prerequisites, and manuscript roll counts.

Selected bosses use local Wiki thumbnails mapped in `src/boss-images.ts`. Twin Furies and Zemouregal & Vorkath show both combatants; Rise of the Six uses its shadow Ahrim portrait. Failed images fall back to the original symbol, as does custom input. Artwork sources are credited in `public/bosses/CREDITS.md`, linked from the footer.
