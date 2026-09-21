import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { newGame, orderShip, advanceMinutes, supply } from '../mechanics/engine.mjs';
import { contentFor } from '../mechanics/campaign-content.mjs';
import { buildView, installView } from '../mechanics/queries.mjs';
import { campaignMinutes, setCampaignMinutes } from '../mechanics/campaign-clock.mjs';
import { dailyMoraleRecovery } from '../mechanics/campaign-impact.mjs';
import { organizeSupport, minuteSupport } from '../mechanics/support-operations.mjs';
import { replenishmentRelief } from '../mechanics/support-effects.mjs';
import { invalidateOperations } from '../mechanics/task-forces.mjs';
import { syncConvoys, moveConvoys } from '../mechanics/merchant-convoys.mjs';
import { convoyRecord } from '../mechanics/economy-rules.mjs';
import { repairPorts, portSummary } from '../mechanics/ports.mjs';
import { NODES } from '../mechanics/world.mjs';
import { goldAccount } from '../mechanics/gold-accounting.mjs';
import { resourceHover } from '../ui/resource-breakdown.mjs';
import { economyView } from '../ui/economy-view.mjs';
import { topBars } from '../ui/top-bars.mjs';
import { fleetReadinessHover, mapHover, portPopup } from '../ui/inspection-view.mjs';

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const start=(id='USA',campaign='in_good_faith_1936')=>{
  const s=newGame(CATALOG,id,340034,campaign);
  s.decisions=[];s.autoPause=false;s.paused=false;
  return [s,contentFor(CATALOG,s),s.nations[id]];
};
const invalid=/NaN|undefined|Infinity/;

test('every opening has complete finite resource and economy views with matching cached fleet supply',()=>{
  let openings=0;
  for(const [campaign,data] of Object.entries(CATALOG.campaigns))for(const id of Object.keys(data.nations)) {
    const [s,c,n]=start(id,campaign),view=buildView(s,CATALOG);
    const before=resourceHover(s,c,'SUPPLY');
    for(const f of n.fleets)assert.ok(before.includes(f.name.replaceAll('&','&amp;')),f.name);
    near(view.averageSupply,supply(s,c,id));
    installView(s,view);
    assert.equal(resourceHover(s,c,'SUPPLY'),before,'worker view and direct snapshot supply read models agree');
    for(const key of ['GOLD','INDUSTRY','STRATEGIC','INFLUENCE','GDP','GTP','SHIPPING','PORT TRADE','LOGISTICS','SUPPLY','TRAINING','MORALE','YARDS','SAILORS','AVIATORS','AIRCRAFT'])
      assert.doesNotMatch(resourceHover(s,c,key),invalid,`${campaign}/${id}/${key}`);
    assert.doesNotMatch(economyView(s,c),invalid);
    assert.doesNotMatch(topBars(s,c),invalid);
    openings++;
  }
  assert.equal(openings,14);
});

test('supply hover does not silently truncate the command list above twenty fleets',()=>{
  const [s,c,n]=start();
  while(n.fleets.length<24)n.fleets.push({...structuredClone(n.fleets[0]),id:'audit-force-'+n.fleets.length,name:'Audit force '+n.fleets.length});
  assert.match(resourceHover(s,c,'SUPPLY'),/Audit force 23/);
  installView(s,buildView(s,CATALOG));
  assert.match(resourceHover(s,c,'SUPPLY'),/Audit force 23/);
});

test('unreplenished historical fleets show no invented relief duration or cooldown',()=>{
  for(const campaign of Object.keys(CATALOG.campaigns)) {
    const [s,c,n]=start('JPN',campaign),f=n.fleets[0];
    delete f.replenishedUntil;delete f.nextReplenishment;
    assert.ok(campaignMinutes(s)<0,'historical clocks precede the Unix epoch');
    assert.match(fleetReadinessHover(s,c,f),/Relief remaining<\/dt><dd>0 hours/);
    f.role='support';
    assert.match(fleetReadinessHover(s,c,f),/Transfer availability<\/dt><dd>Ready at rendezvous/);
  }
});

test('delivered support cargo and fading relief remain visible and agree with the physical transfer',()=>{
  const [s,c,n]=start();n.gold=n.industry=n.strategic=1e7;n.influence=500;n.crew=1e7;
  const id=orderShip(s,c,'us_support_1932'),g=n.groups.find(g=>g.id===id);
  g.status='active';g.dockPort='hawaii';organizeSupport(s,c);
  const f=n.fleets.find(f=>f.id===g.fleetId),target=n.fleets.find(f=>f.role==='cruiser'),now=campaignMinutes(s);
  Object.assign(target,{route:[NODES.hawaii],phase:'patrol',fuelNm:2000,maxRangeNm:10000});
  Object.assign(f,{supportTarget:target.id,route:[NODES.hawaii],phase:'patrol',nextPlanAt:now+20000,supportCargo:14000,arriveAt:now,departAt:now});
  g.atSea=true;invalidateOperations(s);
  minuteSupport(s,c,'USA',f);
  assert.ok(target.fuelNm>2000);assert.ok(f.supportCargo<14000);assert.ok(replenishmentRelief(s,target)>0);
  const giver=fleetReadinessHover(s,c,f),receiver=fleetReadinessHover(s,c,target);
  assert.match(giver,/Replenishment cargo aboard \/ delivered/);assert.ok(giver.includes(target.name));
  assert.match(receiver,/Delivered replenishment relief/);assert.match(receiver,/72 hours/);
  assert.match(resourceHover(s,c,'SUPPLY'),/Forces receiving delivered AO relief/);
  setCampaignMinutes(s,now+4320);invalidateOperations(s);
  assert.equal(replenishmentRelief(s,target),0);
  assert.match(fleetReadinessHover(s,c,target),/Relief remaining<\/dt><dd>0 hours/);
});

test('convoy hover follows real outward, unloading and return stages without crediting projected deliveries',()=>{
  const [s,c,n]=start();n.convoys=[];n.convoysMobilized=true;syncConvoys(s,c,'USA',{force:true});
  const v=n.convoys[0],expected=v.count*v.cargoGRTPerHull;
  n.convoys=[v];n.convoyPlanAt=campaignMinutes(s)+1e8;
  assert.match(mapHover(s,c,'convoy:'+v.id),/Outbound/);assert.equal(convoyRecord(s,'USA').delivered,0);
  setCampaignMinutes(s,v.arriveAt);moveConvoys(s,c,'USA');
  assert.equal(v.leg,'unloading');assert.match(mapHover(s,c,'convoy:'+v.id),/Awaiting return departure/);
  assert.equal(convoyRecord(s,'USA').delivered,0);
  n.convoys=[v];n.convoyPlanAt=-1e9;setCampaignMinutes(s,v.readyAt);moveConvoys(s,c,'USA');
  assert.equal(v.leg,'returning');assert.match(mapHover(s,c,'convoy:'+v.id),/Returning to origin/);
  setCampaignMinutes(s,v.arriveAt);moveConvoys(s,c,'USA');near(convoyRecord(s,'USA').delivered,expected);
  moveConvoys(s,c,'USA');near(convoyRecord(s,'USA').delivered,expected);
});

test('convoy holds and diversion hovers do not invent arrival times or eligible trade credit',()=>{
  const [s,c,n]=start(),v=n.convoys[0];
  v.waitingForPort=true;v.aborted=true;
  let html=mapHover(s,c,'convoy:'+v.id);
  assert.match(html,/Holding; no accessible port/);assert.match(html,/Held until passage resumes/);
  assert.match(html,/Potential round-trip credit<\/dt><dd>0 GRT/);
  delete v.waitingForPort;
  html=mapHover(s,c,'convoy:'+v.id);assert.match(html,/Diverting home; no trade delivery credit/);
});

test('territory inspections follow real front territory arrays and distinguish fighting from ceasefire',()=>{
  const [s,c]=start(),id='audit-territory',data={features:[{id,name:'Audit territory',owner:'FRA'}]};
  const front={id:'audit-front',name:'Audit campaign',territories:[id],status:'Contested',progress:.4};
  s.world.fronts.push(front);
  assert.match(mapHover(s,c,'territory:'+id,data),/Land campaign underway/);
  front.status='Ceasefire';assert.match(mapHover(s,c,'territory:'+id,data),/Ceasefire/);
  front.status='Occupied';front.progress=1;
  assert.match(mapHover(s,c,'territory:'+id,data),/Occupied · attacker 100%/);
  assert.doesNotMatch(mapHover(s,c,'territory:'+id,data),/Land campaign underway/);
});

test('displayed daily training loss respects its floor and morale uses the same daily rule as simulation',()=>{
  const [s,c,n]=start();n.training=20;n.tech.training=9;n.morale=90;
  const morale=n.morale,change=dailyMoraleRecovery(n);
  advanceMinutes(s,c,1440);
  assert.equal(n.training,20);near(n.morale,morale+change);
  const hover=resourceHover(s,c,'TRAINING');
  assert.match(hover,/Daily skill decay<\/dt><dd class="">0/);
  assert.match(hover,/Next training upgrade<\/dt><dd class="">0/);
  assert.match(topBars(s,c),/data-resource="TRAINING"[\s\S]*?\+0 \/day/);
});

test('economy panel reconciles paid war repairs and exposes bilateral transfers without adding them twice',()=>{
  const [s,c,n]=start();Object.assign(s.ports.norfolk,{health:.5,lastAttack:campaignMinutes(s)-3000});
  const before=n.gold;repairPorts(s);assert.ok(n.gold<before);
  const cash=goldAccount(n),view=economyView(s,c);
  near(cash.change,n.gold-n.monthAccount.opening.gold);
  assert.ok(view.includes('Port repairs'));assert.match(view,/Gold actually paid \/ received/);
  n.monthAccount.diplomaticFlows={gold:1400,industry:-2500,strategic:1000};
  n.monthAccount.last={gold:0,industry:0,strategic:0,diplomaticFlows:{gold:-4000,industry:0,strategic:2000}};
  assert.match(resourceHover(s,c,'INDUSTRY'),/Diplomatic transfers this month · included above<\/dt><dd class="negative">−2,500/);
  assert.match(resourceHover(s,c,'STRATEGIC'),/Diplomatic transfers last month · included above<\/dt><dd class="positive">\+2,000/);
  assert.match(economyView(s,c),/Diplomatic exchanges · national stocks/);
  const p=portSummary(s,c,'norfolk');assert.ok(p.coverage>=0&&p.coverage<=1);
  assert.match(portPopup(s,c,'norfolk'),/Capacity guides depot assignments; it does not multiply fleet supply/);
});
