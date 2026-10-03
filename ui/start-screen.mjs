import { NATION_ORDER, PROFILES } from '../mechanics/catalog.mjs';
import { campaignList } from '../mechanics/campaign-content.mjs';
import { newGame, fleetSummary } from '../mechanics/engine.mjs';
import { SCENARIOS } from '../combatmechanics/scenarios.mjs';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number = value => Math.round(Number(value) || 0).toLocaleString('en-US');
const summaries = new WeakMap();
export function openingFleet(content, nation) {
  if (!summaries.has(content)) summaries.set(content, new Map());
  const entries = summaries.get(content);
  if (!entries.has(nation)) {
    // Preview this navy as the human player: AI treaty choices can cancel
    // another navy's opening construction. Cache only the resulting summary.
    const preview = newGame(content, nation, 19221936, content.scenario.id);
    entries.set(nation, fleetSummary(preview, content, nation));
  }
  return entries.get(nation);
}

export function startScreen({bundle, content, selectedCampaign, selected, saved, version}) {
  const nation = content.nations[selected], fleet = openingFleet(content, selected);
  const date = saved && new Date(saved.day * 86400000).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
  return `<main class="start-screen">
    <header class="start-screen-header"><div><span class="start-brand">WNT<span>1922</span></span><span class="start-subtitle">Naval command · global strategy</span></div><span class="start-version">v${esc(version)} · single player · local save</span></header>
    <div class="start-screen-layout">
      <section class="start-setup" aria-label="Choose a campaign and navy">
        <header class="start-mode-heading"><span class="start-mode-label">Global strategy</span><h1>Campaign</h1><p>Build your navy, manage its economy and shape the war at sea.</p></header>
        <div class="start-setup-scroll" data-scroll-key="start-setup">
        <div class="start-section-label"><span>01 / Campaign</span><span>${esc(content.scenario.start)}</span></div>
        <div class="start-campaigns">${campaignList(bundle).map(c => `<button data-action="select-campaign" data-id="${esc(c.id)}" aria-pressed="${c.id === selectedCampaign}" class="${c.id === selectedCampaign ? 'selected' : ''}"><strong>${esc(c.title)}</strong><span>${esc(c.start.slice(0,4))} start</span></button>`).join('')}</div>
        <details class="start-campaign-description"><summary>About this campaign</summary><p>${esc(content.scenario.description)}</p></details>
        <div class="start-section-label"><span>02 / Your navy</span><span>7 playable powers</span></div>
        <div class="start-nations">${NATION_ORDER.filter(id => content.nations[id]).map(id => {
          const p = content.nations[id];
          return `<button data-action="select-nation" data-id="${id}" aria-pressed="${id === selected}" class="${id === selected ? 'selected' : ''}" style="--nation:${esc(p.color)}"><span class="start-nation-code">${id}</span><span>${esc(p.name)}</span>${id === selected ? '<span class="start-nation-check" aria-hidden="true">✓</span>' : ''}</button>`;
        }).join('')}</div>
        <section class="start-nation-details" data-key="selected-navy" aria-label="Selected navy details">
          <h2>${esc(nation.name)}</h2><h3>${esc(nation.title)}</h3><p>${esc(nation.description)}</p>
          <div class="start-nation-stats"><span><strong>${number(fleet.active)}</strong>active warships</span><span><strong>${number(fleet.building)}</strong>warships building</span><span><strong>${number(nation.merchants.hulls)}</strong>merchant hulls</span><span><strong>${number(nation.support.reduce((sum,g) => sum + g.count, 0))}</strong>support hulls cataloged</span></div>
        </section>
        </div>
        <button class="primary start-command" data-action="new">Take command of ${esc(PROFILES[selected]?.name || nation.name)} <span aria-hidden="true">→</span></button>
        ${saved ? `<div class="start-resume"><div><strong>${esc(PROFILES[saved.player]?.name || saved.player)} · ${esc(date)}</strong><span>Saved campaign · resumes paused</span></div><button data-action="continue">Continue</button></div>` : '<p class="start-save-note">Your campaign saves automatically on this computer.</p>'}
      </section>
      <section class="start-tactical" aria-labelledby="start-tactical-title">
        <header class="start-mode-heading"><span class="start-mode-label">Standalone combat</span><h1 id="start-tactical-title">Tactical Battles</h1><p>Watch historical battles or choose opposing fleets and doctrine for a free simulation.</p></header>
        <div class="start-battle-options" aria-label="Choose a tactical battle">
          ${SCENARIOS.map(scenario => `<button class="start-battle-choice" data-action="tactical" data-preset="${esc(scenario.id)}"><span class="start-battle-date">${esc(scenario.date)}</span><strong>${esc(scenario.title)}</strong><span class="start-battle-sides">${esc(scenario.sideA)} / ${esc(scenario.sideB)}</span><span class="start-battle-description">${esc(scenario.description)}</span><span class="start-battle-link">Set up battle <span aria-hidden="true">→</span></span></button>`).join('')}
          <button class="start-battle-choice start-battle-custom" data-action="tactical" data-preset="custom"><span class="start-battle-date">Your fleets. Your conditions.</span><strong>Custom battle</strong><span class="start-battle-sides">Any catalog fleet against any other</span><span class="start-battle-description">Choose ship classes, numbers, formation, doctrine and weather for both sides.</span><span class="start-battle-link">Create battle <span aria-hidden="true">→</span></span></button>
        </div>
        <p class="start-tactical-note">Historical playback follows scripted milestones. Free simulation and custom battles use the campaign combat rules. Your campaign stays paused and unchanged.</p>
      </section>
    </div>
    <footer class="start-screen-footer"><div><button data-action="ship-gallery">3D ship gallery</button><button data-action="import">Import campaign</button><button data-action="recognition-credits">Artwork & sources</button><a href="/assets/licenses/third-party-notices.html" target="_blank" rel="noreferrer">Licenses & credits</a></div><span>Build your fleet. Shape the balance of sea power.</span></footer>
  </main>`;
}
