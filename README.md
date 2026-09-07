# Dropwise — RuneScape Boss Drop Calculator

**[Open the calculator →](https://uoxo-rs.github.io/rs-boss-calc/)**

Dropwise helps RuneScape 3 players understand their chances of getting a boss drop. Choose a boss, encounter scenario, and target item to estimate the chance of receiving at least one drop over your planned kills, compare different kill goals, or see how unusual your dry streak is.

The calculator runs in your browser with no account or installation required.

## Features

- **62 bosses and custom drops:** Browse encounters grouped by dungeon or boss family, with selected equipment, components, and pet targets sourced from the RuneScape Wiki.
- **Encounter presets:** Select supported modes, group sizes, personal loot piles, contribution bands, or enrage presets where relevant.
- **Pet thresholds:** Include existing kill count when calculating threshold-based pet chances, with supported multiple-roll mechanics accounted for.
- **Kill-plan comparisons:** Compare up to 10 planned kill counts, explore the probability chart, and select probability milestones to find a kill goal.
- **Dry-streak statistics:** See the chance of going your entered kill count without a drop and the expected number of drops over that hunt.
- **Custom inputs:** Enter your own per-kill drop rate and pet threshold for a custom calculation.
- **Clear target restrictions:** See drops from every scenario, including hard-mode-only items. Targets without a supported numerical model show an explanation.
- **Saved preferences and themes:** Return to your previous selections in the same browser, choose a visual theme, or reset your inputs. The layout adapts to desktop and mobile screens.

## Getting started

1. Visit **[Dropwise](https://uoxo-rs.github.io/rs-boss-calc/)**.
2. Choose a boss, scenario, and target drop.
3. Enter your existing kill count, following any boss-specific guidance shown below the input.
4. Enter planned additional kills, or several counts separated by commas, such as `50, 100, 500`.
5. Explore your odds, compare plans, and use milestones to choose a target.

For dry-streak statistics, the existing kill count is treated as a hunt with no target drop. For bosses with shared pet thresholds, follow the displayed guidance about combined kill counts.

## Data and assumptions

Dropwise uses a curated local snapshot of RuneScape Wiki information. Each boss links to its Wiki page, and scenario notes explain the assumptions behind its rates. The site does not fetch live rates during use.

Probabilities are estimates under the selected model, not guarantees. Fixed-rate drops do not become more likely after previous misses. Supported pet thresholds improve the rate as kill count increases; other forms of bad-luck mitigation are not generally simulated.

This is a selected-drop calculator, not a full collection-log completion simulator. Some ordered rewards are represented as **any next piece**, and unsupported or unknown rates have no numerical estimate. Luck boosts and other encounter-specific exclusions are documented in the linked notes.

- [Calculator mechanics and limitations](CALCULATOR.md)
- [Wiki sources and curated corrections](SOURCES.md)
- [Drop coverage and audit notes](DROP-AUDIT.md)
- [Boss artwork credits](public/bosses/CREDITS.md)

## Local development

Built with React, TypeScript, and Vite. Use Node.js 24 and npm.

```sh
npm install
npm run dev
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm test` | Run catalogue, probability, UI, preferences, and Wiki tooling tests. |
| `npm run lint` | Run ESLint. |
| `npm run build` | Check TypeScript and build the site into `dist/`. |
| `npm run preview` | Preview the production build locally. |

## Maintaining Wiki sources

The repository includes tools to track changes to the Wiki sources used by the catalogue:

- `npm run wiki:fetch` downloads and caches source content and revision IDs.
- `npm run wiki:check` compares cached sources with the accepted snapshot and generates a review report.
- `npm run wiki:sync` shows the report and instructions for accepting a reviewed snapshot; acceptance runs the tests before saving it.

These tools track source changes. They do not automatically import drop rates or replace curated formulas. See the [Wiki sync guide](wiki/README.md) for the full review and acceptance workflow.
