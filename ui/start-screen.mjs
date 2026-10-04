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
  const campaigns=campaignList(bundle),category=scenario=>scenario.category || (scenario.id==='in_good_faith_1936'?'alternate':'historical');
  const navy=`<div class="start-section-label"><span>Your navy</span><span>${NATION_ORDER.filter(id=>content.nations[id]).length} playable powers</span></div>
    <div class="start-nations">${NATION_ORDER.filter(id=>content.nations[id]).map(id=>{const p=content.nations[id];return `<button data-action="select-nation" data-id="${id}" aria-pressed="${id===selected}" class="${id===selected?'selected':''}" style="--nation:${esc(p.color)}"><span class="start-nation-code">${id}</span><span>${esc(p.name)}</span>${id===selected?'<span class="start-nation-check" aria-hidden="true">✓</span>':''}</button>`;}).join('')}</div>
    <section class="start-nation-details" data-key="selected-navy" aria-label="Selected navy details"><h2>${esc(nation.name)}</h2><h3>${esc(nation.title)}</h3><p>${esc(nation.description)}</p><div class="start-nation-stats"><span><strong>${number(fleet.active)}</strong>active warships</span><span><strong>${number(fleet.building)}</strong>warships building</span><span><strong>${number(nation.merchants.hulls)}</strong>merchant hulls</span><span><strong>${number(nation.support.reduce((sum,g)=>sum+g.count,0))}</strong>support hulls cataloged</span></div></section>`;
  const campaignPanel=(kind,title,subtitle,description)=>{
    const active=category(content.scenario)===kind,choices=campaigns.filter(c=>category(c)===kind);
    return `<section class="start-setup start-campaign-panel ${active?'active-campaign-panel':''}" data-campaign-category="${kind}" aria-labelledby="start-${kind}-title">
      <header class="start-mode-heading"><span class="start-mode-label">${subtitle}</span><h1 id="start-${kind}-title">${title}</h1><p>${description}</p></header>
      <div class="start-setup-scroll" data-scroll-key="start-${kind}">
        <div class="start-campaigns">${choices.map(c=>`<button data-action="select-campaign" data-id="${esc(c.id)}" aria-pressed="${c.id===selectedCampaign}" class="${c.id===selectedCampaign?'selected':''}"><strong>${esc(c.title)}</strong><span>${esc(c.start)}</span></button>`).join('')}</div>
        ${active?`<details class="start-campaign-description"><summary>About ${esc(content.scenario.title)}</summary><p>${esc(content.scenario.description)}</p>${content.scenario.scope?`<p>${esc(content.scenario.scope)}</p>`:''}</details>${navy}`:`<div class="start-campaign-intro"><p>${kind==='historical'?'Begin at a selected historical opening, then choose the navy you will command.':'Explore a different naval balance. Select an alternate campaign to choose your navy.'}</p><p class="muted">${kind==='historical'?'Starting forces and world conditions belong to each campaign; your decisions determine what follows.':'Alternate scenarios are listed separately, leaving room for future settings.'}</p></div>`}
      </div>${active?`<button class="primary start-command" data-action="new">Take command of ${esc(PROFILES[selected]?.name||nation.name)} <span aria-hidden="true">→</span></button>`:'<p class="start-save-note">Select a campaign above to prepare your navy.</p>'}
    </section>`;
  };
  return `<main class="start-screen">
    <header class="start-screen-header"><div><span class="start-brand">WNT<span>1922</span></span><span class="start-subtitle">Naval command · global strategy</span></div><span class="start-version">v${esc(version)} · single player · local save</span></header>
    <div class="start-screen-layout">
      ${campaignPanel('historical','Historical Campaigns','Historical openings','Choose a historical starting point and command your navy through a changing world.')}
      ${campaignPanel('alternate','Alternate History','Different possibilities','Build your fleet in an alternative naval and political setting.')}
      <section class="start-tactical" aria-labelledby="start-tactical-title">
        <header class="start-mode-heading"><span class="start-mode-label">Standalone combat</span><h1 id="start-tactical-title">Tactical Battles</h1><p>Watch historical battles or choose opposing fleets and doctrine for a free simulation.</p></header>
        <div class="start-battle-options" aria-label="Choose a tactical battle">
          ${SCENARIOS.map(scenario => `<button class="start-battle-choice" data-action="tactical" data-preset="${esc(scenario.id)}"><strong>${esc(scenario.title)}</strong><span class="start-battle-date">${esc(scenario.date)}</span><span class="start-battle-sides">${esc(scenario.sideA)} / ${esc(scenario.sideB)}</span><span class="start-battle-link" aria-hidden="true">→</span></button>`).join('')}
          <button class="start-battle-choice start-battle-custom" data-action="tactical" data-preset="custom"><strong>Custom battle</strong><span class="start-battle-date">Your fleets. Your conditions.</span><span class="start-battle-sides">Choose ships, formations and doctrine.</span><span class="start-battle-link" aria-hidden="true">→</span></button>
        </div>
        <p class="start-tactical-note">Historical playback follows scripted milestones. Free simulation and custom battles use the campaign combat rules. Your campaign stays paused and unchanged.</p>
      </section>
    </div>
    <footer class="start-screen-footer"><div><button data-action="ship-gallery">3D ship gallery</button><button data-action="import">Import campaign</button><button data-action="recognition-credits">Artwork & sources</button><a href="/assets/licenses/third-party-notices.html" target="_blank" rel="noreferrer">Licenses & credits</a></div>${saved?`<div class="start-resume"><div><strong>${esc(PROFILES[saved.player]?.name||saved.player)} · ${esc(date)}</strong><span>Saved campaign · resumes paused</span></div><button data-action="continue">Continue</button></div>`:'<span>Your campaign saves automatically on this computer.</span>'}</footer>
  </main>`;
}
