# Unique-drop audit — September 5, 2026

Rechecked all 62 included bosses against their RuneScape Wiki pages, following Araxxor to Araxxi, Vindicta to Vindicta & Gorvek, and Twin Furies to The Twin Furies for the actual reward tables. The Wiki collection-log calculator was used as a second item checklist; individual boss tables take precedence where the two disagree. This audits the existing catalogue, not every boss in RuneScape.

Nakatra's **Shard of Genesis Essence** was already present at **1/75 in hard mode**. It was hidden by the normal-mode dropdown. The target selector now lists the union of targets across a boss's scenarios, marks incompatible targets, and names compatible scenarios in the warning. Switching scenarios preserves the target; it never calculates normal-mode shard odds. [Nakatra source](https://runescape.wiki/w/Nakatra,_Devourer_Eternal#Drops).

## Added rates and conditions

- GWD generals: respective hilts (1/512), all three godsword shards (1/768 each), and lore books. Graardor and Zilyana books accompany the qualifying 1/64 equipment or 1/512 hilt event, giving 9/512; Kree'arra and K'ril list 1/64. See each boss link in the checklist below.
- King Black Dragon: Dragon Rider gloves/boots and both dragon kite ornament kits, each 1/2000.
- Solak: Cinderbane gloves and ancient elven ritual shard, each 1/1000.
- Corporeal Beast: holy elixir uses the exact table probability **3/512**, rather than the collection calculator's rounded 1/171.
- GWD2: essences are rolled after the equipment roll fails. Per-kill probability is `(1 - sum(equipment probabilities)) / essence denominator`, where the denominator is 64 normal or 44 hard. This uses the existing maximum-reputation presets; Vindicta has five equipment outcomes, the others six. This adjustment is derived from the Wiki's stated roll order, rather than treating a conditional 1/64 or 1/44 as an unconditional per-kill chance.
- Legiones: Ascension grips (1/2056, eligible Slayer assignment required), any Ascension Keystone (1/64), and any next Order journal page (1/19, until all are found).
- Rex Matriarchs: all four Skeka hypnowand pieces, requiring the Aged journal. All four boss pages list focus at 7/5000 and each other piece at 1/5000. Added the corresponding unchecked dinosaur on the three living matriarchs at 1/399. No luck or salamancy boost.
- Giant Mole: numbing root (46/520 normal, 10/520 hard) and hard-only ultra-growth potion (30/520), using members' tables.
- ROTS: unstable malevolent energy as a guaranteed stack, requiring successful escape. Black stone dragon: draconic energy as a guaranteed stack, under the existing pet-owned assumption.
- Ambassador: black stone heart stack at 1/2 solo/duo, 2/5 trio. Elite/ultra elite chests use 14/15 and 1/15 only when each planned kill completes an ordered ED1–ED2–ED3 trilogy. Crossbow-piece rolls remain separate aggregate targets.
- Manuscripts: Amascut at 1/10 from each Sanctum boss; Jas at 1/10 normal or 1/7 hard per personal Kerapac pile; Bik at 1/10 tertiary; Wen at 1/25 across three normal-mode rolls; Elidinis at 7/100 across four common-loot rolls.
- Arch-Glacor: normal five-mechanic Glacor remnants sum both remnant slots, `(.09 * .965) + (.005 * 32/80)` per roll, with three rolls. Hard-mode remnants/manuscripts have no invented numerical preset.
- Zuk: igneous stone is guaranteed only on a complete no-checkpoint run; unavailable in the hard-mode checkpoint preset. Normal mode displays the no-checkpoint prerequisite explicitly.
- Also added the Magister's Key to the Crossing, guaranteed/unowned Amascut and AoD books, Nex's Followers, and the three Dagannoth armour sets (1/64 per piece).

## Explicit limitations

Unknown-rate or unmodelled key targets are selectable with a **rate not modelled** status and explanatory text. These entries have no numerical denominator, graph, milestones, or inferred probability. They survive local-storage restoration. A mode restriction is distinct from an unmodelled rate: individual Kerapac/Zuk pieces are unavailable in normal mode and unmodelled in hard mode.

These entries include Saradomin's hum (Wiki says “Very rare”), Seeker's charm (“Rare”), the ambiguously applied seven-roll Hexhunter reward, Warpriest ownership rules, specific cycling weapon pieces/orbs/chests, non-pet lore mitigation, Hermod's drumsticks, the base araxyte pet and pheromone, Vorkath hide, and unknown manuscript rates. Existing **any next piece/orb/chest** targets remain usable. These do not predict a specific piece or completed weapon. [Warpriest drop template](https://runescape.wiki/w/Template:DropsLineWarpriest), [collection checklist](https://runescape.wiki/w/Module:Collection_log_calculator/Boss/Data).

This remains a key-equipment/component/pet calculator. Generic supplies, rare-drop-table items, clue scrolls, effigies, trophy heads/furniture plans, quest-only materials, crafted outputs and purchased pets are outside this audit's dropdown scope. Appearance and achievement unlocks, lucky-charm rewards, ordinary dungeon relics, and enrage/streak scenarios absent from the catalogue are not newly simulated. Eligibility prerequisites are shown as notes; the calculator does not query a player's account or inventory.

## Per-boss checklist

Every linked boss was checked. “Existing key targets retained” means no further fixed-rate key equipment/component target was identified within the scope above. The final column lists newly exposed targets that still need a dedicated probability model. Item names are deduplicated across modes in this checklist; actual rates remain scenario-specific.

| Boss / Wiki source | Added numerical targets | Exposed without a numerical model |
| --- | --- | --- |
| [General Graardor](https://runescape.wiki/w/General_Graardor) | Bandos hilt; Godsword shard 1; Godsword shard 2; Godsword shard 3; The Glory of General Graardor | Warpriest of Bandos helm; Warpriest of Bandos cape; Warpriest of Bandos cuirass; Warpriest of Bandos greaves; Warpriest of Bandos gauntlets; Warpriest of Bandos boots |
| [King Black Dragon](https://runescape.wiki/w/King_Black_Dragon) | Dragon Rider gloves; Dragon Rider boots; Dragon kite ornament kit (or); Dragon kite ornament kit (sp) | Last riders |
| [Kree'arra](https://runescape.wiki/w/Kree'arra) | Armadyl hilt; Godsword shard 1; Godsword shard 2; Godsword shard 3; Armadyl's Assault | Warpriest of Armadyl helm; Warpriest of Armadyl cape; Warpriest of Armadyl cuirass; Warpriest of Armadyl greaves; Warpriest of Armadyl gauntlets; Warpriest of Armadyl boots |
| [Giant Mole](https://runescape.wiki/w/Giant_mole) | Numbing root; Ultra-growth potion (1) | None added |
| [Chaos Elemental](https://runescape.wiki/w/Chaos_Elemental) | Existing key targets retained | None added |
| [Kalphite Queen](https://runescape.wiki/w/Kalphite_Queen) | Existing key targets retained | None added |
| [Flesh-hatcher Mhekarnahz](https://runescape.wiki/w/Flesh-hatcher_Mhekarnahz) | Existing key targets retained | Seeker's charm; Hexhunter bow |
| [Ivar, King of Bones](https://runescape.wiki/w/Ivar%2C_King_of_Bones) | Existing key targets retained | None added |
| [Silverquill, the Dreadhog](https://runescape.wiki/w/Silverquill%2C_the_Dreadhog) | Existing key targets retained | None added |
| [Vorago](https://runescape.wiki/w/Vorago) | Existing key targets retained | None added |
| [Solak](https://runescape.wiki/w/Solak%2C_Guardian_of_the_Grove) | Cinderbane gloves; Ancient elven ritual shard | None added |
| [Barrows: Rise of the Six](https://runescape.wiki/w/The_Barrows%3A_Rise_of_the_Six) | Malevolent energy (unstable) | None added |
| [Araxxor / Araxxi](https://runescape.wiki/w/Araxxi) | Existing key targets retained | Araxyte pheromone; Araxyte pet |
| [Kalphite King](https://runescape.wiki/w/Kalphite_King) | Existing key targets retained | None added |
| [Queen Black Dragon](https://runescape.wiki/w/Queen_Black_Dragon) | Existing key targets retained | First dragonkin journal; Second dragonkin journal; Third dragonkin journal; Fourth dragonkin journal |
| [Corporeal Beast](https://runescape.wiki/w/Corporeal_Beast) | Holy elixir | None added |
| [The Magister](https://runescape.wiki/w/The_Magister) | Key to the Crossing | The Magister's Journal 1; The Magister's Journal 2; The Magister's Journal 3; The Magister's Journal 4; The Magister's Journal 5 |
| [Raksha, the Shadow Colossus](https://runescape.wiki/w/Raksha%2C_the_Shadow_Colossus) | Existing key targets retained | None added |
| [Zemouregal & Vorkath](https://runescape.wiki/w/Zemouregal_%26_Vorkath) | Existing key targets retained | Undead dragonhide |
| [Amascut, the Devourer](https://runescape.wiki/w/Amascut%2C_the_Devourer) | Memoirs of the Devourer | None added |
| [Nex, Angel of Death](https://runescape.wiki/w/Nex%2C_Angel_of_Death) | The Promised Gift; The Praesul | Intricate smoke-shrouded chest; Intricate shadow chest; Intricate blood stained chest; Intricate ice chest |
| [Nex](https://runescape.wiki/w/Nex) | Nex's Followers | None added |
| [K'ril Tsutsaroth](https://runescape.wiki/w/K'ril_Tsutsaroth) | Zamorak hilt; Godsword shard 1; Godsword shard 2; Godsword shard 3; Razulei's Tale | Warpriest of Zamorak helm; Warpriest of Zamorak cape; Warpriest of Zamorak cuirass; Warpriest of Zamorak greaves; Warpriest of Zamorak gauntlets; Warpriest of Zamorak boots |
| [Commander Zilyana](https://runescape.wiki/w/Commander_Zilyana) | Saradomin hilt; Godsword shard 1; Godsword shard 2; Godsword shard 3; Zilyana's Notes | Warpriest of Saradomin helm; Warpriest of Saradomin cape; Warpriest of Saradomin cuirass; Warpriest of Saradomin greaves; Warpriest of Saradomin gauntlets; Warpriest of Saradomin boots; Saradomin's hum |
| [Telos, the Warden](https://runescape.wiki/w/Telos%2C_the_Warden) | Existing key targets retained | Orb of pure anima; Orb of volcanic anima; Orb of corrupted anima |
| [Gregorovic](https://runescape.wiki/w/Gregorovic) | Sliskean essence | None added |
| [Twin Furies](https://runescape.wiki/w/The%20Twin%20Furies) | Zamorakian essence | None added |
| [Vindicta](https://runescape.wiki/w/Vindicta%20%26%20Gorvek) | Zarosian essence | None added |
| [Helwyr](https://runescape.wiki/w/Helwyr) | Serenic essence | None added |
| [Kerapac, the bound](https://runescape.wiki/w/Kerapac%2C_the_bound) | Manuscript of Jas | Staff of Armadyl's fractured shaft; Fractured stabilisation gem; Fractured Armadyl symbol |
| [Arch-Glacor](https://runescape.wiki/w/Arch-Glacor) | Manuscript of Wen; Glacor remnants | The Journal of Fell Arnessen; Manuscript of Wen; Glacor remnants |
| [Croesus](https://runescape.wiki/w/Croesus) | Manuscript of Bik | None added |
| [TzKal-Zuk](https://runescape.wiki/w/TzKal-Zuk) | Igneous stone | Manuscript of Ful; Obsidian blade; Magma core; Ancient hilt |
| [Hermod, the Spirit of War](https://runescape.wiki/w/Hermod%2C_the_Spirit_of_War) | Existing key targets retained | Animated drumsticks |
| [Rasial, the First Necromancer](https://runescape.wiki/w/Rasial%2C_the_First_Necromancer) | Existing key targets retained | None added |
| [The Sanctum Guardian](https://runescape.wiki/w/The_Sanctum_Guardian) | Existing key targets retained | Crassian Allegiance |
| [Masuta the Ascended](https://runescape.wiki/w/Masuta_the_Ascended) | Existing key targets retained | Himiko's Vision |
| [Seiryu the Azure Serpent](https://runescape.wiki/w/Seiryu_the_Azure_Serpent) | Existing key targets retained | None added |
| [Astellarn](https://runescape.wiki/w/Astellarn) | Existing key targets retained | Diary of an Overzealous Gnome |
| [Verak Lith](https://runescape.wiki/w/Verak_Lith) | Existing key targets retained | Redacted Dragonkin Research |
| [Black stone dragon](https://runescape.wiki/w/Black_stone_dragon) | Draconic energy | None added |
| [Crassian Leviathan](https://runescape.wiki/w/Crassian_Leviathan) | Existing key targets retained | The Last Offering |
| [Taraket the Necromancer](https://runescape.wiki/w/Taraket_the_Necromancer) | Existing key targets retained | Kranon's Ancient Journal |
| [The Ambassador](https://runescape.wiki/w/The_Ambassador) | Black stone heart; Ultra elite chest; Elite chest | Eldritch crossbow limb; Eldritch crossbow stock; Eldritch crossbow mechanism |
| [Zamorak, Lord of Chaos](https://runescape.wiki/w/Zamorak%2C_Lord_of_Chaos) | Existing key targets retained | Top of the Last Guardian's bow; Divine bowstring; Bottom of the Last Guardian's bow |
| [Vermyx, Brood Mother](https://runescape.wiki/w/Vermyx%2C_Brood_Mother) | Manuscript of Amascut | The Brood Mother |
| [Kezalam, the Wanderer](https://runescape.wiki/w/Kezalam%2C_the_Wanderer) | Manuscript of Amascut | The Beast of Darkness |
| [Nakatra, Devourer Eternal](https://runescape.wiki/w/Nakatra%2C_Devourer_Eternal) | Manuscript of Amascut | Death and Devourers |
| [The Gate of Elidinis](https://runescape.wiki/w/The_Gate_of_Elidinis) | Manuscript of Elidinis | After The Flood |
| [Legio Primus](https://runescape.wiki/w/Legio_Primus) | Ascension grips; Ascension Keystone; Order journal page | None added |
| [Legio Secundus](https://runescape.wiki/w/Legio_Secundus) | Ascension grips; Ascension Keystone; Order journal page | None added |
| [Legio Tertius](https://runescape.wiki/w/Legio_Tertius) | Ascension grips; Ascension Keystone; Order journal page | None added |
| [Legio Quartus](https://runescape.wiki/w/Legio_Quartus) | Ascension grips; Ascension Keystone; Order journal page | None added |
| [Legio Quintus](https://runescape.wiki/w/Legio_Quintus) | Ascension grips; Ascension Keystone; Order journal page | None added |
| [Legio Sextus](https://runescape.wiki/w/Legio_Sextus) | Ascension grips; Ascension Keystone; Order journal page | None added |
| [Rathis](https://runescape.wiki/w/Rathis) | Skeka's hypnowand focus; Skeka's hypnowand projector; Skeka's hypnowand handle; Skeka's hypnowand base; Corbicula rex (unchecked) | None added |
| [Pthentraken](https://runescape.wiki/w/Pthentraken) | Skeka's hypnowand focus; Skeka's hypnowand projector; Skeka's hypnowand handle; Skeka's hypnowand base; Pavosaurus rex (unchecked) | None added |
| [Orikalka](https://runescape.wiki/w/Orikalka) | Skeka's hypnowand focus; Skeka's hypnowand projector; Skeka's hypnowand handle; Skeka's hypnowand base; Bagrada rex (unchecked) | None added |
| [Osseous](https://runescape.wiki/w/Osseous) | Skeka's hypnowand focus; Skeka's hypnowand projector; Skeka's hypnowand handle; Skeka's hypnowand base | None added |
| [Dagannoth Prime](https://runescape.wiki/w/Dagannoth_Prime) | Skeletal helm; Skeletal top; Skeletal bottoms | None added |
| [Dagannoth Rex](https://runescape.wiki/w/Dagannoth_Rex) | Rock-shell helm; Rock-shell plate; Rock-shell legs | None added |
| [Dagannoth Supreme](https://runescape.wiki/w/Dagannoth_Supreme) | Spined helm; Spined body; Spined chaps | None added |
