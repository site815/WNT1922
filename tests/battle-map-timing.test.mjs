import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { newGame } from '../mechanics/engine.mjs';
import { setCampaignMinutes } from '../mechanics/campaign-clock.mjs';
import { ongoingMapBattles, battleMapHover } from '../ui/battle-map.mjs';
import { commandView } from '../ui/command-view.mjs';

function fixture(tactical) {
  const state=newGame(CATALOG,'USA',90210);
  setCampaignMinutes(state,100);
  state.reports=[{id:71,a:'USA',b:'JPN',status:'ongoing',stage:3,round:2,mainRounds:3,
    region:'pacific',position:[179.8,25],startedAt:40,durations:[15,15,30,60,15],nextStageAt:130,
    resultA:{sunk:1,conditions:[{count:4,sunk:1}]},resultB:{sunk:2,conditions:[{count:8,sunk:2}]},
    ...(tactical?{tactical:{seconds:70,maxDurationSeconds:7200}}:{})}];
  return state;
}
const card = state => commandView(state,CATALOG).match(/<button data-action="watch-battle"[\s\S]*?<\/button>/)?.[0] || '';
const progressValue = html => Number(html.match(/<progress[^>]*value="([^"]+)"/)?.[1]);

test('campaign map tactical cards and hovers use actual combat seconds and scenario limits, not legacy stage time',()=>{
  const state=fixture(true),before=JSON.stringify(state),[marker]=ongoingMapBattles(state);
  assert.equal(marker.elapsedSeconds,70);assert.equal(marker.elapsedMinutes,70/60);
  assert.equal(marker.scenarioProgress,70/7200);assert.equal(marker.scenarioLimitSeconds,7200);
  assert.equal(marker.stageProgress,undefined);assert.match(marker.label,/1 min 10 s elapsed/);
  for(const html of [card(state),battleMapHover(state,71)]) {
    assert.match(html,/1 min 10 s elapsed/);assert.match(html,/120 min 0 s/);
    assert.equal(progressValue(html),70/7200);
    assert.match(html,/1% of scenario time limit/);assert.match(html,/not a completion estimate/);
    assert.doesNotMatch(html,/current stage|60 minutes elapsed|60 min\b|round 2/);
  }
  assert.equal(JSON.stringify(state),before,'Rendering never advances combat or rewrites its report');
  state.reports[0].tactical.seconds=7500;
  for(const html of [card(state),battleMapHover(state,71)]) {
    assert.equal(progressValue(html),1);assert.match(html,/125 min 0 s elapsed/);
    assert.match(html,/100% of scenario time limit/);assert.doesNotMatch(html,/100% complete/);
  }
});

test('legacy staged battle markers, cards and hovers keep their stage progress and campaign elapsed time',()=>{
  const state=fixture(false),[marker]=ongoingMapBattles(state);
  assert.equal(marker.elapsedMinutes,60);assert.equal(marker.stageProgress,.5);
  assert.match(marker.label,/round 2 \/ 3/);assert.match(marker.label,/60 min/);
  assert.equal(progressValue(card(state)),.5);
  for(const html of [card(state),battleMapHover(state,71)]) {
    assert.match(html,/50% of current stage/);assert.doesNotMatch(html,/scenario time limit/);
  }
  assert.match(battleMapHover(state,71),/60 minutes elapsed/);
});
