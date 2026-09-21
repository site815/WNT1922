import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { newGame, advanceMinutes } from '../mechanics/engine.mjs';
import { contentFor } from '../mechanics/campaign-content.mjs';
import { campaignMinutes, setCampaignMinutes } from '../mechanics/campaign-clock.mjs';
import { repairIndustry } from '../mechanics/strategic-air.mjs';
import { repairPorts } from '../mechanics/ports.mjs';
import { governmentProduction, currentGovernmentModels } from '../mechanics/government-aviation.mjs';
import { goldAccount } from '../mechanics/gold-accounting.mjs';
import { closeEconomicMonth } from '../mechanics/economic-growth.mjs';
import { resourceHover } from '../ui/resource-breakdown.mjs';
import { validateSave } from '../mechanics/state-io.mjs';
import { CONVOY_RULES, convoyTraffic } from '../mechanics/convoy-traffic.mjs';
import { SPEEDS } from '../mechanics/naval-resources.mjs';

const start=()=>{const s=newGame(CATALOG,'USA',330033,'in_good_faith_1936');
  s.decisions=[];s.paused=false;s.autoPause=false;
  const n=s.nations.USA;n.gold=1e7;n.industry=1e7;n.strategic=1e7;
  n.monthAccount.opening.gold=n.gold;return[s,contentFor(CATALOG,s),n];};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);

test('gold hover reconciles actual wartime repairs and replacement procurement',()=>{
  const[s,c,n]=start();
  Object.assign(n.industrialDamage,{industry:.2,yards:.2,lastAttack:campaignMinutes(s)-3000});
  const before=n.gold;repairIndustry(s);
  near(n.monthAccount.goldFlows.industrialRepairs,n.gold-before);
  Object.assign(s.ports.norfolk,{health:.5,lastAttack:campaignMinutes(s)-3000});
  const beforePort=n.gold;repairPorts(s);
  assert.ok(n.monthAccount.goldFlows.portRepairs<0);
  near(n.monthAccount.goldFlows.portRepairs,n.gold-beforePort);
  n.governmentMonth=-1;
  const lostModel=currentGovernmentModels(s,c,'USA')[0].id;
  n.governmentAircraft[lostModel]=0;
  for(const base of Object.values(n.airBases)) {
    base.governmentWing=base.governmentWing.filter(w=>w.model!==lostModel);
    base.reserve=base.reserve.filter(w=>w.model!==lostModel);
  }
  const procurement=structuredClone(c);
  // Government types may be treasury-funded at zero ministry gold; exercise
  // an authored paid replacement without changing the live catalog.
  procurement.nations.USA.armyAircraft.find(a=>a.id===lostModel).cost_gold=200;
  const beforeAir=n.gold;governmentProduction(s,procurement,'USA');
  assert.ok(n.gold<beforeAir);
  near(n.monthAccount.goldFlows.governmentAircraft,n.gold-beforeAir);
  n.gold-=123; // Other commands remain explicitly reconciled, including old saves.
  const account=goldAccount(n);
  near(account.rows.reduce((v,r)=>v+r.amount,0),n.gold-n.monthAccount.opening.gold);
  near(account.rows.find(r=>r.key==='other').amount,-123);
  const hover=resourceHover(s,c,'GOLD');
  for(const label of ['Government aircraft replacements','Port repairs','Industrial and yard repairs','Cash-flow total'])
    assert.ok(hover.includes(label),label);
  validateSave(s,CATALOG);
});

test('daily production and ship repairs record cash actually paid, retained across month close',()=>{
  const[s,c,n]=start(),g=n.groups.find(g=>g.status==='active'&&!g.atSea);
  g.status='repair';g.health=.7;g.dockPort='norfolk';delete g.fleetId;
  advanceMinutes(s,c,1440);
  for(const key of ['output','industry','training','aircraft','shipRepairs'])
    assert.ok(Number.isFinite(n.monthAccount.goldFlows[key])&&n.monthAccount.goldFlows[key]!==0,key);
  const flows={...n.monthAccount.goldFlows};
  setCampaignMinutes(s,Date.parse('1936-02-01T00:00:00Z')/60000);
  closeEconomicMonth(s,c,'USA');
  assert.deepEqual(n.monthAccount.last.goldFlows,flows);
  assert.deepEqual(n.monthAccount.goldFlows,{});
  assert.equal(goldAccount(n).change,0);
  validateSave(s,CATALOG);
});

test('convoys target twelve groups and three percent; removed speed migrates safely',()=>{
  assert.equal(CONVOY_RULES.TARGET_ACTIVE_CONVOYS,12);
  assert.equal(CONVOY_RULES.AT_SEA_SHARE,.03);
  const[s,,n]=start();const traffic=convoyTraffic(s,'USA');
  assert.equal(traffic.targetAtSea,Math.round(n.merchant.hulls*.03));
  assert.equal(traffic.hullsAtSea,traffic.targetAtSea);
  assert.ok(!SPEEDS.some(([v])=>v===50));
  s.speed=50;assert.equal(validateSave(s,CATALOG).speed,10);
  n.monthAccount.goldFlows={shipRepairs:NaN};
  assert.throws(()=>validateSave(s,CATALOG),/not a compatible/);
});
