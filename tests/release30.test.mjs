import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { newGame } from '../mechanics/engine.mjs';
import { contentFor } from '../mechanics/campaign-content.mjs';
import { applyCommand } from '../mechanics/game-actions.mjs';
import { setCampaignMinutes, campaignMinutes } from '../mechanics/campaign-clock.mjs';
import { updateProductionModels, setProductionModel } from '../mechanics/naval-resources.mjs';
import { currentGovernmentModels, retireGovernmentAircraft } from '../mechanics/government-aviation.mjs';
import { validateSave } from '../mechanics/state-io.mjs';
import { economyFor } from '../mechanics/balance.mjs';
import { ECONOMY } from '../mechanics/economy-rules.mjs';
import { WORLD_NEWS, PACT_EVENTS, politicsTick } from '../mechanics/war-politics.mjs';
import { economyView } from '../ui/economy-view.mjs';
import { navalRecordView } from '../ui/naval-record.mjs';
import { resourceHover } from '../ui/resource-breakdown.mjs';
import { aircraftCatalogView } from '../ui/ministry-view.mjs';
import { topBars } from '../ui/top-bars.mjs';
const start=(id='JPN',campaign='in_good_faith_1936')=>{const s=newGame(CATALOG,id,300030,campaign);return [s,contentFor(CATALOG,s),s.nations[id]];};
const at=(s,date)=>setCampaignMinutes(s,Date.parse(date+'T12:00:00Z')/60000);

test('all fourteen starts explain naval budgets, strategic output and complete dense ledgers',()=>{
  for(const campaign of Object.keys(CATALOG.campaigns))for(const id of Object.keys(CATALOG.campaigns[campaign].nations)){
    const [s,c,n]=start(id,campaign),b=economyFor(s,id);
    assert.equal(b.strategicYear,ECONOMY.STRATEGIC_OUTPUT_SHARE*(b.productiveGDP*b.strategicModifier+b.gtp*Math.min(1,b.gtp/b.gdp)));
    const views=[economyView(s,c),navalRecordView(s,c),aircraftCatalogView(s,c),topBars(s,c),...['GDP','GTP','STRATEGIC'].map(k=>resourceHover(s,c,k))];
    for(const html of views)assert.doesNotMatch(html,/NaN|undefined|Infinity/);
    assert.match(views[0],/GDP naval budget/);assert.match(views[0],/GTP naval budget/);
    assert.match(views[0],/Annual output =/);assert.match(views[1],/Civilian hulls built/);
    assert.equal(c.nations[id].designs.map(k=>c.classes[k]).filter(cl=>cl.supportHybrid).every(cl=>cl.type==='AO'),true);
    assert.deepEqual(n.productionAutomatic,{fighter:true,strike:true,scout:true});validateSave(s,CATALOG);
  }
});
test('1936 naval catalogs contain opening designs, with only the designated ALB progression kept',()=>{
  const c=CATALOG.campaigns.in_good_faith_1936;
  for(const [id,n]of Object.entries(c.nations)){
    assert.equal(n.aircraft.some(a=>a.type_year>1936),id==='JPN');
    if(!['JPN','USA'].includes(id))assert.ok(n.aircraft.every(a=>a.type_year===1936));
  }
  assert.deepEqual(c.nations.USA.aircraft.map(a=>a.name),['F1 carrier fighter','O1 observation floatplane']);
  assert.ok(c.nations.USA.designs.includes('republic_bb41'));
});
test('automatic production upgrades on availability, manual choice persists, and auto can be restored',()=>{
  const[s,c,n]=start();at(s,'1939-01-01');
  setProductionModel(s,c,'fighter','hibari_t33');updateProductionModels(s,c);
  assert.equal(n.productionModels.fighter,'hibari_t33');assert.equal(n.productionAutomatic.fighter,false);
  assert.equal(n.productionModels.strike,'raiden_t39');
  applyCommand(s,CATALOG,{type:'production-automatic',args:{role:'fighter',enabled:true}});
  assert.equal(n.productionModels.fighter,'raiden_t39');
  at(s,'1944-01-01');updateProductionModels(s,c);assert.equal(n.productionModels.fighter,'shinden_t44');
  assert.equal(validateSave(s,CATALOG).nations.JPN.productionAutomatic.fighter,true);
});
test('time steps remain visible, require pause, and six hours processes twenty-four real ticks',()=>{
  const[s,c]=start();s.decisions=[];s.paused=true;
  const initial=campaignMinutes(s),ticks=s.minuteTicks || 0;
  applyCommand(s,CATALOG,{type:'step',args:{minutes:360}});
  assert.equal(campaignMinutes(s),initial+360);assert.equal(s.minuteTicks,ticks+24);assert.equal(s.paused,true);
  s.paused=false;const before=campaignMinutes(s);
  assert.throws(()=>applyCommand(s,CATALOG,{type:'step',args:{minutes:15}}),/Pause/);assert.equal(campaignMinutes(s),before);
  const html=topBars(s,c);assert.match(html,/step-six-hours[^>]*disabled/);assert.match(html,/step-minute[^>]*disabled/);assert.match(html,/\+6h/);
});
test('government generations are distinct, 1948 fighters are jets, and retirement does not fabricate casualties or replacement airframes',()=>{
  for(const id of Object.keys(CATALOG.nations)){
    const[s,c,n]=start(id),models=c.nations[id].armyAircraft;
    assert.equal(new Set(models.map(a=>a.role+'|'+a.name)).size,models.length);
    const old=currentGovernmentModels(s,c,id).map(a=>a.id),beforeLoss=JSON.stringify(n.governmentLosses);
    const before=Object.values(n.governmentAircraft).reduce((v,count)=>v+count,0);
    at(s,'1948-01-01');const current=currentGovernmentModels(s,c,id),fighter=current.find(a=>a.role==='fighter');
    assert.equal(fighter.propulsion,'turbojet');assert.ok(fighter.performance.speed_kmh.sea_level>=750);
    retireGovernmentAircraft(s,c,id);
    for(const model of old)if(!current.some(a=>a.id===model))assert.equal(n.governmentAircraft[model],0);
    assert.equal(JSON.stringify(n.governmentLosses),beforeLoss);
    assert.equal(Object.values(n.governmentAircraft).reduce((v,count)=>v+count,0)+(n.governmentRetired||0),before);
    const html=aircraftCatalogView(s,c);
    for(const model of old)if(!current.some(a=>a.id===model))assert.ok(!html.includes('data-government-model="'+model+'"'));
    validateSave(s,CATALOG);
  }
});
test('France dispatches require actual defeat; Indochina access follows the event chain exactly once',()=>{
  const[s]=start('FRA');at(s,'1941-08-01');s.timeline.offsetDays=0;s.decisions=[];
  const chain=new Set(['fall-france','vichy-france','northern-indochina','southern-indochina','japan-assets-frozen']);
  s.completedEvents.push(...[...WORLD_NEWS,...PACT_EVENTS].filter(e=>!chain.has(e.id)).map(e=>'historical-news-'+e.id));
  s.nextDiplomaticAt=-Infinity;politicsTick(s);
  assert.ok(!s.completedEvents.includes('historical-news-fall-france'));
  assert.notEqual(s.world.portControl.saigon,'JPN');
  s.world.control.c220='DEU';s.nextDiplomaticAt=-Infinity;politicsTick(s);
  for(const key of chain)assert.ok(s.completedEvents.includes('historical-news-'+key),key);
  assert.equal(s.world.portControl.saigon,'JPN');assert.equal(s.world.stationControl.saigon,'JPN');
  assert.ok(s.alerts.some(d=>d.title==='Vichy France is established'));
  assert.ok(!s.decisions.some(d=>d.title==='Vichy France is established'));
  const count=s.decisions.length;s.nextDiplomaticAt=-Infinity;politicsTick(s);assert.equal(s.decisions.length,count);
});
