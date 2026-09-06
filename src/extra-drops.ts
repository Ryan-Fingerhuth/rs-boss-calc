import type { Boss, Drop, UnmodelledDrop } from './data.ts'

// Equipment, components and collection targets found in the 2026-09-05 audit.
// Rates come from the individual boss tables, including their prerequisite rolls.
// See DROP-AUDIT.md for the complete coverage and explicit exclusions.
const items = (denominator: number, names: string[], note?: string, rolls?: number): Drop[] =>
  names.map(name => ({ name, denominator, note, ...(rolls ? { rolls } : {}) }))
const unknown = (names: string[], note: string): UnmodelledDrop[] => names.map(name => ({ name, note }))
const loreNote = 'This book has changing drop odds or unlock-order requirements that this calculator does not yet model. See the boss Wiki for the conditions.'
const cycleNote = (aggregate: string) => `Specific pieces depend on your personal drop sequence, which is not yet modelled. Select “${aggregate}” to calculate the chance of any next piece instead.`

const fixedExtras: Record<string, Drop[]> = {
  'King Black Dragon': items(2000, ['Dragon Rider gloves', 'Dragon Rider boots', 'Dragon kite ornament kit (or)', 'Dragon kite ornament kit (sp)']),
  'Solak': items(1000, ['Cinderbane gloves', 'Ancient elven ritual shard']),
  'Corporeal Beast': items(512 / 3, ['Holy elixir']),
  'The Magister': items(128, ['Key to the Crossing']),
  'Barrows: Rise of the Six': items(1, ['Malevolent energy (unstable)'], 'Receive a stack from the chest; a successful escape converts it to malevolent energy. This is not a quantity or pet-purchase calculation.'),
  'Nex': items(64 / 3, ["Nex's Followers"], 'Only while the book is not already owned.'),
  'Nex, Angel of Death': items(1, ['The Promised Gift', 'The Praesul'], 'If not awarded directly, search the teleport shard after the kill. Assumes the book is not already unlocked.'),
  'Amascut, the Devourer': items(1, ['Memoirs of the Devourer'], 'Guaranteed on the first full boss kill if not already unlocked; the quest encounter does not qualify.'),
  'Black stone dragon': items(1, ['Draconic energy'], 'Chance of a stack, not a specified quantity. Assumes the pet is already owned so regular loot is not replaced.'),
  'Dagannoth Prime': items(64, ['Skeletal helm', 'Skeletal top', 'Skeletal bottoms']),
  'Dagannoth Rex': items(64, ['Rock-shell helm', 'Rock-shell plate', 'Rock-shell legs']),
  'Dagannoth Supreme': items(64, ['Spined helm', 'Spined body', 'Spined chaps']),
}

const lore: Record<string, string[]> = {
  'King Black Dragon': ['Last riders'],
  'The Magister': [1, 2, 3, 4, 5].map(n => `The Magister's Journal ${n}`),
  'Queen Black Dragon': ['First dragonkin journal', 'Second dragonkin journal', 'Third dragonkin journal', 'Fourth dragonkin journal'],
  'Vermyx, Brood Mother': ['The Brood Mother'],
  'Kezalam, the Wanderer': ['The Beast of Darkness'],
  'Nakatra, Devourer Eternal': ['Death and Devourers'],
  'The Gate of Elidinis': ['After The Flood'],
  'Arch-Glacor': ['The Journal of Fell Arnessen'],
  'The Sanctum Guardian': ['Crassian Allegiance'],
  'Masuta the Ascended': ["Himiko's Vision"],
  'Astellarn': ['Diary of an Overzealous Gnome'],
  'Verak Lith': ['Redacted Dragonkin Research'],
  'Crassian Leviathan': ['The Last Offering'],
  'Taraket the Necromancer': ["Kranon's Ancient Journal"],
}
const gods: Record<string, [string, string, number]> = {
  'General Graardor': ['Bandos', 'The Glory of General Graardor', 512 / 9],
  "Kree'arra": ['Armadyl', "Armadyl's Assault", 64],
  "K'ril Tsutsaroth": ['Zamorak', "Razulei's Tale", 64],
  'Commander Zilyana': ['Saradomin', "Zilyana's Notes", 512 / 9],
}
const essences: Record<string, string> = {
  'Gregorovic': 'Sliskean essence', 'Twin Furies': 'Zamorakian essence',
  'Vindicta': 'Zarosian essence', 'Helwyr': 'Serenic essence',
}

export function expandBossDrops(boss: Boss): Boss {
  if (boss.custom) return boss
  return { ...boss, scenarios: boss.scenarios.map(scenario => {
    const hard = scenario.name.startsWith('Hard mode')
    const extra: Drop[] = [...(fixedExtras[boss.name] ?? [])]
    const unmodelled: UnmodelledDrop[] = unknown(lore[boss.name] ?? [], loreNote)
    const god = gods[boss.name]
    if (god) {
      extra.push(...items(512, [`${god[0]} hilt`]), ...items(768, ['Godsword shard 1', 'Godsword shard 2', 'Godsword shard 3']))
      extra.push(...items(god[2], [god[1]], 'Only while unowned; received alongside a qualifying unique drop. Assumes you receive the boss loot.'))
      unmodelled.push(...unknown(['helm', 'cape', 'cuirass', 'greaves', 'gauntlets', 'boots'].map(part => `Warpriest of ${god[0]} ${part}`), 'Warpriest drops depend on pieces already owned. Those ownership rules are not yet modelled.'))
    }
    if (essences[boss.name]) {
      const equipment = scenario.drops.filter(d => !d.threshold)
      const missEquipment = 1 - equipment.reduce((sum, d) => sum + 1 / d.denominator, 0)
      extra.push(...items((hard ? 44 : 64) / missEquipment, [essences[boss.name]], 'Includes the chance of failing the preceding equipment roll. Uses the same maximum-reputation, no-luck assumptions as this scenario.'))
    }
    if (boss.name === 'Giant Mole') {
      extra.push(...items(hard ? 52 : 520 / 46, ['Numbing root']))
      if (hard) extra.push(...items(520 / 30, ['Ultra-growth potion (1)']))
    }
    if (boss.name === 'Commander Zilyana') unmodelled.push(...unknown(["Saradomin's hum"], 'The Wiki currently lists this drop as “Very rare” without a confirmed numerical rate. No probability is calculated.'))
    if (boss.name === 'Flesh-hatcher Mhekarnahz') {
      unmodelled.push(...unknown(["Seeker's charm"], 'The Wiki lists this drop as “Rare” without a numerical rate. No probability is calculated.'))
      unmodelled.push(...unknown(['Hexhunter bow'], 'The Wiki lists 1/1,000,000, but the application of the seven reward rolls to this tertiary drop is not confirmed here. A per-kill probability is not modelled.'))
    }
    if (boss.group === 'Monastery of Ascension') {
      extra.push(...items(2056, ['Ascension grips'], 'Requires an eligible Slayer assignment for every planned kill. Off-task kills cannot drop these gloves.'))
      extra.push(...items(64, ['Ascension Keystone'], 'Any keystone, not a particular numbered keystone.'))
      extra.push(...items(19, ['Order journal page'], 'Only until all journal pages have been found. Chance of any next page.'))
    }
    if (boss.group === 'Rex Matriarchs') {
      const note = 'Requires having read the Aged journal before every planned kill. No luck or necklace of salamancy boost.'
      extra.push(...items(5000 / 7, ["Skeka's hypnowand focus"], note), ...items(5000, ["Skeka's hypnowand projector", "Skeka's hypnowand handle", "Skeka's hypnowand base"], note))
      const dinosaur: Record<string, string> = { Rathis: 'Corbicula rex', Pthentraken: 'Pavosaurus rex', Orikalka: 'Bagrada rex' }
      if (dinosaur[boss.name]) extra.push(...items(399, [`${dinosaur[boss.name]} (unchecked)`]))
    }
    if (boss.group === 'Sanctum of Rebirth' && boss.name !== 'The Gate of Elidinis') extra.push(...items(10, ['Manuscript of Amascut']))
    if (boss.name === 'The Gate of Elidinis') extra.push(...items(100 / 7, ['Manuscript of Elidinis'], 'Chance of at least one stack across the four common-loot rolls.', 4))
    if (boss.name === 'Kerapac, the bound') {
      const rolls = scenario.drops[0].rolls ?? 1
      extra.push(...items(hard ? 7 : 10, ['Manuscript of Jas'], 'Chance of a stack in your selected personal loot piles.', rolls))
      if (hard) unmodelled.push(...unknown(["Staff of Armadyl's fractured shaft", 'Fractured stabilisation gem', 'Fractured Armadyl symbol'], cycleNote('Any fractured Staff of Armadyl piece')))
    }
    if (boss.name === 'Croesus') extra.push(...items(10, ['Manuscript of Bik'], 'One tertiary roll per kill; contribution-based equipment rolls do not multiply this rate.'))
    if (boss.name === 'Arch-Glacor') {
      if (!hard) {
        extra.push(...items(25, ['Manuscript of Wen'], 'Three normal-mode rolls.', 3))
        extra.push(...items(1 / (.09 * .965 + .005 * 32 / 80), ['Glacor remnants'], 'Sums both remnant slots in the five-mechanic normal-mode table; chance of any stack across three rolls.', 3))
      }
      else unmodelled.push(...unknown(['Manuscript of Wen', 'Glacor remnants'], 'Hard-mode material and manuscript rewards depend on reward-table and streak mechanics that are not modelled for this target.'))
    }
    if (boss.name === 'The Ambassador') {
      extra.push(...items(scenario.name.endsWith('Trio') ? 2.5 : 2, ['Black stone heart'], 'Chance of a stack; assumes the pet is already owned, so it does not replace regular loot.'))
      extra.push(...items(15, ['Ultra elite chest'], 'Requires completing ED1, ED2 and ED3 consecutively in normal mode, in that order, for every planned Ambassador kill.'))
      extra.push(...items(15 / 14, ['Elite chest'], 'Requires completing ED1, ED2 and ED3 consecutively in normal mode, in that order, for every planned Ambassador kill.'))
      unmodelled.push(...unknown(['Eldritch crossbow limb', 'Eldritch crossbow stock', 'Eldritch crossbow mechanism'], cycleNote('Any Eldritch crossbow piece')))
    }
    if (boss.name === 'Nex, Angel of Death') unmodelled.push(...unknown(['Intricate smoke-shrouded chest', 'Intricate shadow chest', 'Intricate blood stained chest', 'Intricate ice chest'], 'Chests initially drop in order and become random after all four are obtained. That collection state is not yet modelled; select "Any intricate chest" for the chance of any chest.'))
    if (boss.name === 'Telos, the Warden') unmodelled.push(...unknown(['Orb of pure anima', 'Orb of volcanic anima', 'Orb of corrupted anima'], cycleNote('Any anima orb')))
    if (boss.name === 'Zamorak, Lord of Chaos') unmodelled.push(...unknown(["Top of the Last Guardian's bow", 'Divine bowstring', "Bottom of the Last Guardian's bow"], cycleNote('Any Bow of the Last Guardian piece')))
    if (boss.name === 'TzKal-Zuk') {
      if (!scenario.name.includes('with checkpoints')) extra.push(...items(1, ['Igneous stone'], 'Only when the entire encounter is cleared without using any checkpoint. In normal mode, this target assumes a no-checkpoint run.'))
      if (hard) unmodelled.push(...unknown(['Obsidian blade', 'Magma core', 'Ancient hilt'], cycleNote('Any Ek-ZekKil sword piece')))
      unmodelled.push(...unknown(['Manuscript of Ful'], 'The boss Wiki lists this as “Uncommon” without a numerical per-kill rate.'))
    }
    if (boss.name === 'Hermod, the Spirit of War') unmodelled.push(...unknown(['Animated drumsticks'], 'The initial 1/64 chance improves with bad-luck mitigation. This changing rate is not yet modelled; it is separate from the pet threshold.'))
    if (boss.name === 'Araxxor / Araxxi') {
      unmodelled.push(...unknown(['Araxyte pheromone'], 'Drop chance depends on starting enrage (1/50 to 1/35), which is not selected in these presets.'))
      unmodelled.push(...unknown(['Araxyte pet'], 'The initial pet uses enrage gained during the fight and optional loot gambling. It does not use the Barry/Mallory threshold formula.'))
    }
    if (boss.name === 'Zemouregal & Vorkath') unmodelled.push(...unknown(['Undead dragonhide'], 'The quantity and reward-table chance vary with encounter rewards; this target is not yet modelled.'))
    return { ...scenario, drops: [...scenario.drops, ...extra], ...(unmodelled.length ? { unmodelledDrops: unmodelled } : {}) }
  }) }
}
