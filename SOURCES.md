# Boss catalogue sources

Verified September 5, 2026 using raw pages downloaded directly from RuneScape Wiki. Rates are a local, curated snapshot; source links are also available in the calculator.

The [Wiki collection calculator data](https://runescape.wiki/w/Module:Collection_log_calculator/Boss/Data) supplies item lists, rates, thresholds, and mode variants. Its [scenario handlers](https://runescape.wiki/w/Module:Collection_log_calculator/Boss/Handlers) explain encounter-specific calculations. [Boss pets](https://runescape.wiki/w/Boss_pets) documents the shared kill-count thresholds and 10× numerator cap. The implementation uses these published facts and mathematical relationships, not a runtime dependency on the Wiki.

The follow-up [unique-drop audit](DROP-AUDIT.md) rechecked all 62 included bosses, added 98 numerical targets across 40 bosses, and exposed 74 boss-specific targets with explanations where a numerical model is unavailable. The target selector now includes every mode so hard-only items are discoverable from normal mode.

## Source checks and corrections

- **Giant Mole:** the [boss page](https://runescape.wiki/w/Giant_mole) gives the unboosted normal-mode dragon 2h sword rate as 1/520; the collection module says 1/502. Use 1/520. Hard mode is 2/520. Clingy mole uses 5/520 and 10/520 for members. Falador shield boosts are excluded.
- **Hermod:** the [boss page](https://runescape.wiki/w/Hermod,_the_Spirit_of_War) gives plates as 1/10, or 1/9 with tier 3 luck. Use the unboosted 1/10, despite 1/9 in the collection module. Drumsticks use a different mitigation system; they are listed without a numerical preset.
- **AoD:** the [boss page](https://runescape.wiki/w/Nex,_Angel_of_Death) gives any chest as 1/1024, rather than the collection module's 1/1000. Wand/core rates scale with group size, and codex probability includes failing that roll. The UI models groups of 1–7.
- **Arch-Glacor:** the [dedicated calculator](https://runescape.wiki/w/Module:Arch-Glacor_calculator) uses `(1500 + 15*enrage + 25*streak)/1,000,000`, with unique weights 24% core / 38% scripture / 38% artefact. Use these weights instead of the collection handler's older 36% entries. Claim presets use streak = 1 and no pontifex boost. Normal mode is explicitly five mechanics and three piles.
- **Telos:** the [dedicated calculator](https://runescape.wiki/w/Module:Telos_calculator) rounds the inverse unique rate down and caps it at 1/15. Presets include its sub-100% and sub-25% penalties, with streak = 1 and no luck enhancer. Orbs are shown as any next orb because they cycle.
- **Vorago:** the [boss page](https://runescape.wiki/w/Vorago) distinguishes exclusive seismic drops from independent energy/pet rolls. The implementation multiplies pet miss probabilities per pile before advancing the kill threshold. Bombi is 1/50 per pile with no threshold and requires the hard mode maul unlock; Vitalis team rerolls are not modelled.
- **Kerapac:** [personal loot piles](https://runescape.wiki/w/Kerapac,_the_bound) are 3 solo, 2 duo top damage, and 1 duo lower damage or trio. The collection handler gives hard-mode regular uniques as `(399/400)/540` per pile after failing a staff roll. Kerry has a 500-kill threshold regardless of piles. Staff pieces are represented as any next piece.
- **Croesus:** [contribution bands](https://runescape.wiki/w/Croesus) determine 1–12 unique rolls, starting at 60 points and reaching 12 at 420+. Individual uniques use 1/5400 per roll; pet uses one roll per kill. Enriched pontifex boost is excluded.
- **Flesh-hatcher:** use the [collection module](https://runescape.wiki/w/Module:Collection_log_calculator/Boss/Data)'s encounter-level 1/128 charm/harpoon and 1/800 pet with threshold 200. Do not multiply those rates by the seven general loot rolls mentioned on the [boss page](https://runescape.wiki/w/Flesh-hatcher_Mhekarnahz). Seeker's charm and the separate Hexhunter roll are now listed without a numerical preset, with their uncertainty explained.
- **New Havenhythe pets:** the current [Ivar page](https://runescape.wiki/w/Ivar,_King_of_Bones) confirms 1/1250 with threshold 250; [Silverquill](https://runescape.wiki/w/Silverquill,_the_Dreadhog) confirms 1/1000 with threshold 200. These supersede older indexed snippets showing only qualitative rarity.
- **GWD2:** collection-module presets use maximum reputation rates, explicitly labelled in the UI. Essence probabilities include failure of the preceding equipment roll; see DROP-AUDIT.md for the derivation. No claim is made to support arbitrary reputation levels.
- **Ordered and conditional rewards:** Araxxi leg paths and Barry/Mallory prerequisites are described next to the selection. ROTS bobbleheads are purchased for 250 energy each, not rolled. AoD chests, Telos orbs, Kerapac staff pieces and Zuk sword pieces use aggregate next-drop events; no collection completion probability is implied.

## Additional boss groups

The dropdown also follows the Wiki's [God Wars Dungeon](https://runescape.wiki/w/Bosses#God_Wars_Dungeon) category (the four generals, Nex, and Nex, Angel of Death) and [Heart of Gielinor](https://runescape.wiki/w/Bosses#Heart_of_Gielinor) category (Gregorovic, Twin Furies, Vindicta, Helwyr, and Telos). These are grouping-only changes to existing entries.

The [Bosses directory](https://runescape.wiki/w/Bosses) was checked for individual encounters in all five requested sections. These additions use per-boss loot tables rather than probabilities aggregated over a complete dungeon or family rotation.

- **Elite Dungeons:** [Sanctum Guardian](https://runescape.wiki/w/The_Sanctum_Guardian), [Masuta](https://runescape.wiki/w/Masuta_the_Ascended), [Seiryu](https://runescape.wiki/w/Seiryu_the_Azure_Serpent), [Astellarn](https://runescape.wiki/w/Astellarn), [Verak Lith](https://runescape.wiki/w/Verak_Lith), [Black stone dragon](https://runescape.wiki/w/Black_stone_dragon), [Crassian Leviathan](https://runescape.wiki/w/Crassian_Leviathan), [Taraket](https://runescape.wiki/w/Taraket_the_Necromancer), [Ambassador](https://runescape.wiki/w/The_Ambassador), and [Zamorak](https://runescape.wiki/w/Zamorak,_Lord_of_Chaos). Solo/duo/trio ED1–3 pet rates are 1/300, 1/1000, 1/1500, with thresholds 60, 200, 300 using combined solo/group kills. ED2 codices use the individual pages' 1/83, 1/166, 1/250 figures. Masuta's duo warspear is the page's 1/33; the Guardian's duo treat is explicitly 3/100. Ambassador's aggregate next crossbow piece uses 1/55, 1/111, 1/166. Pet replacement of main loot is explicitly excluded for regular loot presets by assuming the pet is owned. Zamorak covers only 0%, 20%, and 50% enrage to avoid presenting a fixed rate for higher-enrage bad-luck mitigation.
- **Sanctum:** [Vermyx](https://runescape.wiki/w/Vermyx,_Brood_Mother), [Kezalam](https://runescape.wiki/w/Kezalam,_the_Wanderer), and [Nakatra](https://runescape.wiki/w/Nakatra,_Devourer_Eternal) each have 1/250 normal and 1/200 hard scripture/codex rates. Nakatra alone has weapons (1/150 normal; 1/120 hard), Genesis shard (1/75 hard only), and Neffie (1/400 normal; 1/240 hard; threshold 80). These current per-boss table values take precedence over the collection calculator. [Gate of Elidinis](https://runescape.wiki/w/The_Gate_of_Elidinis) is included separately with 1/480 uniques and Edie at 1/1500, threshold 400; its common-loot roll count is not applied to uniques.
- **Ascension:** [Primus](https://runescape.wiki/w/Legio_Primus), [Secundus](https://runescape.wiki/w/Legio_Secundus), [Tertius](https://runescape.wiki/w/Legio_Tertius), [Quartus](https://runescape.wiki/w/Legio_Quartus), [Quintus](https://runescape.wiki/w/Legio_Quintus), and [Sextus](https://runescape.wiki/w/Legio_Sextus) each drop their own 1/50 signet and 1/1000 pet. All six share the 1200-kill threshold counter.
- **Rex Matriarchs:** [Rathis](https://runescape.wiki/w/Rathis), [Pthentraken](https://runescape.wiki/w/Pthentraken), [Orikalka](https://runescape.wiki/w/Orikalka), and [Osseous](https://runescape.wiki/w/Osseous) share the family kill count. Individual pets use 1/2000 with threshold 1000. Spears are 1/450 per part; Heart of the Berserker is 1/225; boss-specific hearts and Osseous's ring are 2/399. Osseous's key is 1/399. No necklace of salamancy or luck boosts.
- **Dagannoth Kings:** [Prime](https://runescape.wiki/w/Dagannoth_Prime), [Rex](https://runescape.wiki/w/Dagannoth_Rex), and [Supreme](https://runescape.wiki/w/Dagannoth_Supreme) each have their own rings/weapons, plus dragon hatchet, at 1/128. Pets use 1/2500 and threshold 1500 across all three kings. Each dropdown entry contains only that king's drops.

## Boss pages

| Boss | Source |
| --- | --- |
| Giant Mole | [Wiki](https://runescape.wiki/w/Giant_mole) |
| Chaos Elemental | [Wiki](https://runescape.wiki/w/Chaos_Elemental) |
| Kalphite Queen | [Wiki](https://runescape.wiki/w/Kalphite_Queen) |
| Flesh-hatcher Mhekarnahz | [Wiki](https://runescape.wiki/w/Flesh-hatcher_Mhekarnahz) |
| Ivar, King of Bones | [Wiki](https://runescape.wiki/w/Ivar,_King_of_Bones) |
| Silverquill, the Dreadhog | [Wiki](https://runescape.wiki/w/Silverquill,_the_Dreadhog) |
| Vorago | [Wiki](https://runescape.wiki/w/Vorago) |
| Solak | [Wiki](https://runescape.wiki/w/Solak,_Guardian_of_the_Grove) |
| Barrows: Rise of the Six | [Wiki](https://runescape.wiki/w/The_Barrows:_Rise_of_the_Six) |
| Araxxor / Araxxi | [Wiki](https://runescape.wiki/w/Araxxor) |
| Kalphite King | [Wiki](https://runescape.wiki/w/Kalphite_King) |
| Queen Black Dragon | [Wiki](https://runescape.wiki/w/Queen_Black_Dragon) |
| Corporeal Beast | [Wiki](https://runescape.wiki/w/Corporeal_Beast) |
| The Magister | [Wiki](https://runescape.wiki/w/The_Magister) |
| Raksha | [Wiki](https://runescape.wiki/w/Raksha,_the_Shadow_Colossus) |
| Zemouregal & Vorkath | [Wiki](https://runescape.wiki/w/Zemouregal_%26_Vorkath) |
| Amascut | [Wiki](https://runescape.wiki/w/Amascut,_the_Devourer) |
| Nex, Angel of Death | [Wiki](https://runescape.wiki/w/Nex,_Angel_of_Death) |
| Nex | [Wiki](https://runescape.wiki/w/Nex) |
| K'ril Tsutsaroth | [Wiki](https://runescape.wiki/w/K%27ril_Tsutsaroth) |
| General Graardor | [Wiki](https://runescape.wiki/w/General_Graardor) |
| Commander Zilyana | [Wiki](https://runescape.wiki/w/Commander_Zilyana) |
| Kree'arra | [Wiki](https://runescape.wiki/w/Kree%27arra) |
| Telos | [Wiki](https://runescape.wiki/w/Telos,_the_Warden) |
| Gregorovic | [Wiki](https://runescape.wiki/w/Gregorovic) |
| Twin Furies | [Wiki](https://runescape.wiki/w/Twin_Furies) |
| Vindicta | [Wiki](https://runescape.wiki/w/Vindicta) |
| Helwyr | [Wiki](https://runescape.wiki/w/Helwyr) |
| Kerapac | [Wiki](https://runescape.wiki/w/Kerapac,_the_bound) |
| Arch-Glacor | [Wiki](https://runescape.wiki/w/Arch-Glacor) |
| Croesus | [Wiki](https://runescape.wiki/w/Croesus) |
| TzKal-Zuk | [Wiki](https://runescape.wiki/w/TzKal-Zuk) |
| Hermod | [Wiki](https://runescape.wiki/w/Hermod,_the_Spirit_of_War) |
| Rasial | [Wiki](https://runescape.wiki/w/Rasial,_the_First_Necromancer) |
| King Black Dragon | [Wiki](https://runescape.wiki/w/King_Black_Dragon) |

RuneScape Wiki content is published under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/). Boss/item names belong to RuneScape; this is an independent fan tool. Raw downloaded pages are research material and are not shipped with the app.
