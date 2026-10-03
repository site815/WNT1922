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
  assert.equal((html.match(/data-action="select-campaign"/g) || []).length,2);
  for (const action of ['new','continue','import','recognition-credits']) assert(html.includes('data-action="' + action + '"'));
  assert.match(html,/data-action="select-nation" data-id="JPN" aria-pressed="true"/);
  assert.match(html,/aria-label="Choose a campaign and navy"/);
  assert.match(html,/id="start-tactical-title">Tactical Battles/);
  assert.doesNotMatch(html,/<canvas|start-demo|data-demo-action/);
  assert.match(html,/>13<\/strong>warships building/);
  assert(!html.includes('modal-backdrop'));
  assert.equal(JSON.stringify(saved),before,'rendering must not mutate a saved campaign');
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
