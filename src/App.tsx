import { useEffect, useState } from 'react'
import { bosses, bossCount, wikiUrl } from './data'
import { milestone, probability } from './probability'
import { readPreferences, savePreferences } from './preferences'
import { dropOptions } from './drop-options'
import { bossImages } from './boss-images'
import { parsePlannedKills, addPlannedKills, MAX_PLANS } from './planned-kills'
import './App.css'
const fmt = (n: number) => n.toLocaleString('en-US')
const pct = (n: number) => n > .99995 && n < 1 ? '>99.99%' : `${(n * 100).toFixed(2)}%`
const bossGroup = (boss: (typeof bosses)[number]) => boss.custom ? 'Custom' : boss.group ?? 'Other bosses'
const bossGroups = [...new Set(bosses.map(bossGroup))]
const planColors = ['#67e8f9', '#fbbf24', '#c4b5fd', '#fb7185', '#60a5fa', '#a3e635', '#fdba74', '#f0abfc', '#5eead4', '#e2e8f0']
const assetBase = import.meta.env?.BASE_URL ?? '/'
function App() {
  const [initial] = useState(readPreferences)
  const [bossIndex, setBossIndex] = useState(() => bosses.findIndex(b => b.name === initial.boss))
  const [scenarioIndex, setScenarioIndex] = useState(() => Math.max(0, bosses.find(b => b.name === initial.boss)?.scenarios.findIndex(s => s.name === initial.scenario) ?? 0))
  const [dropName, setDropName] = useState(initial.drop)
  const [kills, setKills] = useState(initial.kills)
  const [current, setCurrent] = useState(initial.current)
  const [customRate, setCustomRate] = useState(initial.customRate)
  const [customThreshold, setCustomThreshold] = useState(initial.customThreshold)
  const [advanced, setAdvanced] = useState(initial.advanced)
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [failedImages, setFailedImages] = useState<string[]>([])
  const boss = bosses[bossIndex]
  const portraits = (bossImages[boss?.name ?? ''] ?? []).filter(path => !failedImages.includes(path))
  const scenario = boss?.scenarios[scenarioIndex]
  const targets = boss && scenario ? dropOptions(boss, scenario) : []
  const target = targets.find(d => d.name === dropName)
  const drop = target?.drop
  const unmodelled = target?.unmodelled
  const unavailable = !!boss && !target?.available
  const denominator = Number(customRate || drop?.denominator || 1), threshold = Number(customThreshold || drop?.threshold || 0)
  useEffect(() => {
    savePreferences({ boss: boss?.name ?? '', scenario: scenario?.name ?? '', drop: dropName, kills, current, customRate, customThreshold, advanced })
  }, [boss, scenario, dropName, kills, current, customRate, customThreshold, advanced])
  // An explicit custom rate is per kill, so do not also multiply by preset piles.
  const rolls = customRate !== '' ? 1 : drop?.rolls || 1
  const plans = parsePlannedKills(kills)
  const n = selectedPlan !== null && plans?.includes(selectedPlan) ? selectedPlan : plans?.at(-1) ?? 0
  const kc = Number(current)
  const valid = !!drop && !!plans && current !== '' && Number.isInteger(kc) && kc >= 0 && kc <= 10000000 && Number.isFinite(denominator) && denominator >= 1 && denominator <= 1000000000 && Number.isInteger(threshold) && threshold >= 0 && threshold <= 10000000
  const chance = valid ? probability(n, denominator, kc, threshold, rolls) : 0
  const comparisons = valid ? (plans ?? []).map((count, index) => ({ count, chance: probability(count, denominator, kc, threshold, rolls), color: planColors[index] })) : []
  const chartMax = valid ? Math.min(10000000, Math.max((plans?.at(-1) ?? 0) * 1.15, 100)) : 1000
  const chartKills = [...new Set([...Array.from({ length: 101 }, (_, i) => Math.floor(i / 100 * chartMax)), ...(plans ?? [])])].sort((a, b) => a - b)
  const points = chartKills.map(count => `${50 + count / chartMax * 580},${210 - (valid ? probability(count, denominator, kc, threshold, rolls) : 0) * 180}`)
  const addPlan = (count: number) => { setKills(previous => addPlannedKills(previous, count)); setSelectedPlan(count); setHover(null) }
  const changeDrop = (name: string) => { setDropName(name); setCustomRate(''); setCustomThreshold(''); setHover(null) }
  const reset = () => { setBossIndex(-1); setScenarioIndex(0); changeDrop(''); setKills('500'); setCurrent('0'); setAdvanced(false); setSelectedPlan(null); setHover(null) }
  return <>
    <header className="topbar"><a className="brand" href="#"><span className="brand-mark">ᛟ</span> DROP<span className="brand-light">WISE</span><span className="rs-badge">RS3</span></a><nav><a className="active" href="#calculator">Drop calculator</a><a href="#how-it-works">How it works</a><a href="https://runescape.wiki/w/Bosses" target="_blank" rel="noreferrer">RuneScape Wiki ↗</a></nav><span className="community"><span /> Built for the grind</span></header>
    <main id="calculator"><div className="intro"><div className="eyebrow">A LITTLE MATH. A BETTER BOSSING PLAN.</div><h1>Know your odds.<br className="mobile-break" /> Plan your next drop.</h1><p>Pick your boss, choose your drop, and see what your next kills could bring.</p></div>
      <div className="workspace"><section className="panel setup"><div className="panel-title"><div><span className="step">01</span><h2>Set up your hunt</h2></div><button className="text-button" onClick={reset}>↺ Reset</button></div>
        <label htmlFor="boss">Boss <span className="label-note">{bossCount} bosses</span></label><select id="boss" value={bossIndex} onChange={e => { const index = Number(e.target.value); setBossIndex(index); setScenarioIndex(0); changeDrop(bosses[index]?.scenarios[0].drops[0].name ?? ''); setAdvanced(!!bosses[index]?.custom) }}><option value={-1}>Select a boss…</option>{bossGroups.map(group => <optgroup key={group} label={group}>{bosses.map((b, i) => bossGroup(b) === group ? <option value={i} key={b.name}>{b.name}</option> : null)}</optgroup>)}</select>
        {boss && scenario && <>
        <div className="boss-card"><div className="boss-emblem" aria-hidden="true">{portraits.length ? portraits.map(path => <img key={path} src={`${assetBase}${path}`} alt="" width={64} height={72} decoding="async" onError={() => setFailedImages(previous => [...previous, path])} />) : boss.symbol}</div><div><strong>{boss.name}</strong><span>{boss.area}</span><span className="small-tag">{boss.custom ? 'Custom scenario' : 'Wiki drop-rate preset'}</span></div></div>
        {boss.scenarios.length > 1 && <><label htmlFor="scenario">Encounter scenario</label><select id="scenario" value={scenarioIndex} onChange={e => { setScenarioIndex(Number(e.target.value)); setCustomRate(''); setCustomThreshold(''); setHover(null) }}>{boss.scenarios.map((s, i) => <option value={i} key={s.name}>{s.name}</option>)}</select></>}
        {scenario.note && <p className="scenario-note">{scenario.note}</p>}
        <label htmlFor="drop">Target drop <span className="label-note">{targets.length} targets</span></label><select id="drop" value={dropName} aria-invalid={unavailable} aria-describedby={unavailable ? 'unavailable-drop' : undefined} onChange={e => changeDrop(e.target.value)}>{targets.map(d => <option key={d.name} value={d.name}>{d.label}</option>)}</select>
        {unavailable && <p id="unavailable-drop" className="unavailable-note" role="alert">⚠ {dropName} will not drop in {scenario.name}. Available in: {target?.scenarios.join('; ')}.</p>}
        {unmodelled && <p className="scenario-note drop-note">{unmodelled.note}</p>}
        {drop?.note && <p className="scenario-note drop-note">{drop.note}</p>}
        {drop && <>
        <div className="rate-line"><span className="diamond">◇</span><span>{customRate ? 'Custom rate / kill' : rolls > 1 ? 'Base rate / roll' : 'Base rate / kill'}</span><strong>1 / {fmt(denominator)}</strong><a href={wikiUrl(boss?.source ?? 'Bosses')} target="_blank" rel="noreferrer" aria-label="View Wiki source">↗</a></div>
        {rolls > 1 && <p className="field-help">{rolls} independent rolls per kill are included. Pet thresholds advance by kills, not rolls.</p>}</>}<div className="divider" />
        <label htmlFor="kills">Planned kills <span className="label-note">Compare up to 10</span></label>
        <input id="kills" type="text" inputMode="text" value={kills} maxLength={100} placeholder="50, 100, 500" aria-invalid={!plans} aria-describedby="kills-help" onChange={e => { setKills(e.target.value); setHover(null) }} />
        <p id="kills-help" className="field-help">Separate plans with commas: 50, 100, 500. Use whole numbers from 0 to 10000000, without thousands separators. Each plan starts at your current kill count.</p>
        <div className="presets">{[50, 100, 500, 1000].map(v => <button className={plans?.includes(v) ? 'selected' : ''} disabled={!plans || (!plans.includes(v) && plans.length >= MAX_PLANS)} key={v} onClick={() => addPlan(v)} aria-label={`Compare ${v} kills`}>{plans?.includes(v) ? '' : '+ '}{fmt(v)}</button>)}</div>
        <label htmlFor="current">Current kill count <span className="label-note">Already completed</span></label><div className="number-wrap"><input id="current" type="number" min="0" max="10000000" value={current} onChange={e => setCurrent(e.target.value)} /><span>kills</span></div><p className="field-help">{boss.killCountHelp ?? 'For pets, include normal and hard mode kills.'}</p>
        {drop && <><div className={`threshold-note ${threshold ? 'enabled' : ''}`}><span>♧</span><div><strong>{threshold ? 'Pet thresholds included' : 'Every kill is a fresh chance'}</strong><p>{threshold ? `Drop chance improves every ${fmt(threshold)} kills, up to 10× the base rate.` : 'This item has a fixed drop rate. Previous kills don’t change your next roll.'}</p></div></div>
        <button className="advanced-toggle" onClick={() => setAdvanced(!advanced)} aria-expanded={advanced}>Custom rate & threshold <span>{advanced ? '−' : '+'}</span></button>
        {advanced && <div className="advanced"><label htmlFor="rate">Custom per-kill rate: 1 in</label><input id="rate" type="number" step="any" min="1" max="1000000000" placeholder="Leave blank to use preset" value={customRate} onChange={e => setCustomRate(e.target.value)} /><label htmlFor="threshold">Pet threshold (0 for fixed rate)</label><input id="threshold" type="number" min="0" max="10000000" placeholder={String(drop.threshold || 0)} value={customThreshold} onChange={e => setCustomThreshold(e.target.value)} /><p className="field-help">A custom rate replaces all preset loot rolls with one per-kill chance. Leave blank to restore the preset.</p></div>}
        </>}</>}
      </section><div className="results" aria-live="polite">{!boss ? <section className="panel empty-state"><span className="diamond">◇</span><h2>Choose your next hunt</h2><p>Select a boss to explore drops and calculate your odds.</p></section> : unavailable ? <section className="panel error"><h2>Drop unavailable in this encounter</h2><p>{dropName} will not drop in {scenario.name}. Your target is saved; switch to a compatible scenario or choose another item to calculate odds.</p></section> : unmodelled ? <section className="panel error"><h2>Drop rate not modelled</h2><p>{unmodelled.note}</p><a href={wikiUrl(boss.source)} target="_blank" rel="noreferrer">View boss Wiki drop table</a></section> : !valid ? <section className="panel error" role="alert">Enter up to 10 comma-separated planned kill counts (for example 50, 100, 500). Counts and thresholds must be whole numbers from 0 to 10000000; the drop-rate denominator must be from 1 to 1000000000.</section> : <>
        <section className="panel result-card"><div className="result-heading"><span className="eyebrow">YOUR DROP OUTLOOK</span><span className="live"><i /> Live calculation</span></div><div className="outlook"><div><div className="big-percent">{pct(chance)}</div><h2>chance of at least one drop</h2><p>in your next <strong>{fmt(n)} kills</strong> of {boss.name}</p></div><div className="probability-ring" style={{ background: `conic-gradient(var(--green) ${chance * 360}deg, #29332f 0deg)` }}><div><span>◇</span><small>THE NEXT<br />BIG DROP</small></div></div></div><div className="result-bottom"><span><i className="legend-dot" /> At least one <strong>{pct(chance)}</strong></span><span><i className="legend-dot muted-dot" /> No drop <strong>{pct(1 - chance)}</strong></span></div></section>
        <section className="panel chart-panel">
          <div className="chart-heading"><div><h2>Compare your kill plans</h2><p>Cumulative chance of at least one {dropName}</p></div><span className="chart-key"><i className="legend-dot" /> Drop probability</span></div>
          <div className="chart"><svg viewBox="0 0 660 250" role="img" aria-label={`Probability curve comparing ${comparisons.map(p => `${fmt(p.count)} kills: ${pct(p.chance)}`).join('; ')}.`} onMouseMove={e => { const rect = e.currentTarget.getBoundingClientRect(); setHover(Math.round(Math.max(0, Math.min(1, ((e.clientX - rect.left) / rect.width * 660 - 50) / 580)) * chartMax)) }} onMouseLeave={() => setHover(null)}>
            <defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#38bdf8" stopOpacity=".4" /><stop offset="100%" stopColor="#818cf8" stopOpacity=".03" /></linearGradient></defs>
            {[0, 25, 50, 75, 100].map(v => <g key={v}><line x1="50" x2="630" y1={210 - v * 1.8} y2={210 - v * 1.8} stroke="#364968" strokeDasharray="3 5" /><text x="35" y={214 - v * 1.8} textAnchor="end">{v}%</text></g>)}
            <polygon points={`50,210 ${points.join(' ')} 630,210`} fill="url(#area)" />
            <polyline className="probability-curve" points={points.join(' ')} fill="none" stroke="#67e8f9" strokeWidth="3.5" />
            {comparisons.map((plan, index) => { const x = 50 + plan.count / chartMax * 580, y = 210 - plan.chance * 180; return <g key={plan.count}><title>{fmt(plan.count)} kills: {pct(plan.chance)}</title><line x1={x} x2={x} y1="25" y2="210" stroke={plan.color} strokeOpacity={plan.count === n ? .9 : .4} strokeDasharray="4 5" /><circle cx={x} cy={y} r={plan.count === n ? 10 : 8} fill={plan.color} stroke="#0f172a" strokeWidth="2" /><text className="plan-marker-label" x={x} y={y + 3} textAnchor="middle">{index + 1}</text></g> })}
            {[0, 1, 2, 3, 4].map(i => <text key={i} x={50 + i * 145} y="237" textAnchor="middle">{fmt(Math.round(i / 4 * chartMax))}</text>)}
          </svg></div>
          <div className="chart-caption">{hover !== null ? `${fmt(hover)} kills: ${pct(probability(hover, denominator, kc, threshold, rolls))} chance` : 'Additional planned kills'}<span>Numbered markers match the plans below</span></div>
          <div className="plan-table-wrap"><table className="plan-table"><caption>Compare plans for {dropName}. Select a plan to view its drop outlook above.</caption><thead><tr><th scope="col">Planned kills</th><th scope="col">At least one</th><th scope="col">No drop</th></tr></thead><tbody>{comparisons.map((plan, index) => <tr key={plan.count} className={plan.count === n ? 'active-plan' : ''}><th scope="row"><button onClick={() => setSelectedPlan(plan.count)} aria-pressed={plan.count === n}><span className="plan-swatch" style={{ backgroundColor: plan.color }}>{index + 1}</span>{fmt(plan.count)} kills</button></th><td>{pct(plan.chance)}</td><td>{pct(1 - plan.chance)}</td></tr>)}</tbody></table></div>
        </section>
        <section className="panel milestones"><div className="milestone-title"><h2>Set your sights</h2><span>Kills needed from your current count</span></div><div className="milestone-grid">{[.5, .9, .95, .99].map(p => { const count = milestone(p, denominator, kc, threshold, rolls); return <button key={p} disabled={count > 10000000 || (!!plans && !plans.includes(count) && plans.length >= MAX_PLANS)} onClick={() => addPlan(count)}><span>{p * 100}% chance <span>↗</span></span><strong>{fmt(count)}<small> kills</small></strong></button> })}</div><p>Milestones are probabilities, never guarantees. Select one to add that plan to your comparison.</p></section>
      </>}</div></div>
      <section className="explain" id="how-it-works"><div><span className="info-icon">i</span><div><h3>Luck has no memory. Your plan can.</h3><p>For fixed drops, we calculate 1 − (1 − p)ⁿ. For threshold pets, we multiply the chance of missing each roll as your rate improves. Thresholds use completed kills before each roll, capped at a 10× multiplier.</p></div></div><a href="https://runescape.wiki/w/Boss_pets" target="_blank" rel="noreferrer">Explore pet mechanics ↗</a></section>
      <footer><div><span className="footer-logo">ᛟ</span> Made for the next “one more kill.”</div><p>Curated Wiki presets · No luck boosts or minion rolls · <a href={wikiUrl(boss?.source ?? 'Bosses')} target="_blank" rel="noreferrer">View source ↗</a></p><p><a href={`${assetBase}bosses/CREDITS.md`}>Boss image credits</a></p><p className="disclaimer">Independent fan tool. RuneScape is a trademark of Jagex Ltd. Selected drops from {bossCount} bosses; use custom rates for other scenarios. Rates checked September 5, 2026; not a live Wiki sync.</p></footer>
    </main>
  </>
}
export default App
