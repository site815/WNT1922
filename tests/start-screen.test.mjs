import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { NATION_ORDER } from '../mechanics/catalog.mjs';
import { newGame, fleetSummary } from '../mechanics/engine.mjs';
import { startScreen, openingFleet } from '../ui/start-screen.mjs';
import { SCENARIOS } from '../combatmechanics/scenarios.mjs';

test('each opening navy matches its human-player fleet, including 1922 treaty choices', () => {
  for (const content of Object.values(CATALOG.campaigns)) for (const nation of NATION_ORDER) {
    const expected = fleetSummary(newGame(content, nation, 19221936, content.scenario.id),content,nation);
    assert.deepEqual(openingFleet(content,nation),expected,content.scenario.id + '/' + nation);
    assert.equal(openingFleet(content,nation),openingFleet(content,nation),'cached summary');
  }
});

test('compact start screen retains campaign, navy, save, import and artwork actions', () => {
  const content = CATALOG.campaigns.campaign_1922, saved = newGame(CATALOG,'USA',87,'in_good_faith_1936');
  const before = JSON.stringify(saved);
  const html = startScreen({bundle:CATALOG,content,selectedCampaign:content.scenario.id,selected:'JPN',saved,version:'0.37.0'});
  assert.equal((html.match(/data-action="select-nation"/g) || []).length,7);
  assert.equal((html.match(/data-action="select-campaign"/g) || []).length,Object.keys(CATALOG.campaigns).length);
  for (const action of ['new','continue','import','recognition-credits']) assert(html.includes('data-action="' + action + '"'));
  assert.match(html,/data-action="select-nation" data-id="JPN" aria-pressed="true"/);
  assert.match(html,/id="start-historical-title">Historical Campaigns/);
  assert.match(html,/id="start-alternate-title">Alternate History/);
  assert.match(html,/id="start-tactical-title">Tactical Battles/);
  assert.doesNotMatch(html,/<canvas|start-demo|data-demo-action/);
  assert.match(html,/>13<\/strong>warships building/);
  assert(!html.includes('modal-backdrop'));
  assert.equal(JSON.stringify(saved),before,'rendering must not mutate a saved campaign');
});

test('campaign category metadata keeps historical and alternate starts separate and supports new entries',()=>{
 const base=CATALOG.campaigns.campaign_1922,alternate=CATALOG.campaigns.in_good_faith_1936;
 const extra={...alternate,scenario:{...alternate.scenario,id:'future-alternate',category:'alternate',title:'Future setting',start:'1940-01-01'}};
 const bundle={...CATALOG,campaigns:{...CATALOG.campaigns,'future-alternate':extra}};
 for(const content of [base,alternate]){
  const html=startScreen({bundle,content,selectedCampaign:content.scenario.id,selected:'USA',saved:null,version:'test'});
  const historic=html.slice(html.indexOf('data-campaign-category="historical"'),html.indexOf('data-campaign-category="alternate"'));
  const alt=html.slice(html.indexOf('data-campaign-category="alternate"'),html.indexOf('aria-labelledby="start-tactical-title"'));
  assert(historic.includes('data-id="campaign_1922"'));assert(!historic.includes('data-id="in_good_faith_1936"'));
  assert(alt.includes('data-id="in_good_faith_1936"'));assert(alt.includes('data-id="future-alternate"'));
  assert.equal((html.match(/data-action="select-nation"/g)||[]).length,7);
  assert.equal((html.match(/data-action="new"/g)||[]).length,1);
  assert(html.includes(content.scenario.start));
 }
});

test('title offers every actual tactical scenario and custom setup without an autoplay viewport', () => {
 const content=CATALOG.campaigns.in_good_faith_1936;
 const html=startScreen({bundle:CATALOG,content,selectedCampaign:content.scenario.id,selected:'USA',saved:null,version:'test'});
 assert.deepEqual([...html.matchAll(/data-action="tactical" data-preset="([^"]+)"/g)].map(m=>m[1]),[...SCENARIOS.map(s=>s.id),'custom']);
 for(const scenario of SCENARIOS){assert(html.includes(scenario.title));assert(html.includes(scenario.date));}
 assert.match(html,/data-action="ship-gallery"/);
 assert.doesNotMatch(html,/data-action="continue"|start-demo|<canvas/);
 assert.match(html,/campaign stays paused and unchanged/);
});

test('historical start details expose the authored campaign scope and exact date',()=>{
 for(const [id,date]of [['eve_european_war_1939','1939-08-01'],['eve_pacific_war_1941','1941-11-01']]){
  const content=CATALOG.campaigns[id];assert.equal(content.scenario.start,date);assert(content.scenario.scope);
  const html=startScreen({bundle:CATALOG,content,selectedCampaign:id,selected:'GBR',saved:null,version:'test'});
  assert(html.includes(content.scenario.scope.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll("'",'&#39;')));
  assert(html.includes(date));
 }
});
