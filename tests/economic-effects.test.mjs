import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { newGame, campaignScores } from '../mechanics/engine.mjs';
import { contentFor } from '../mechanics/campaign-content.mjs';
import { economyFor } from '../mechanics/balance.mjs';
import { growthOutlook, closeEconomicMonth } from '../mechanics/economic-growth.mjs';
import { merchantEconomy, merchantProduction } from '../mechanics/merchant-economy.mjs';
import { portTradeSummary } from '../mechanics/port-trade.mjs';
import { portOwner, invalidatePorts } from '../mechanics/ports.mjs';
import { portSpec } from '../mechanics/port-catalog.mjs';
import { ECONOMY, recordConvoy } from '../mechanics/economy-rules.mjs';
import { setCampaignMinutes, campaignMinutes } from '../mechanics/campaign-clock.mjs';
import { beginEngagement, progressEngagements } from '../mechanics/engagements.mjs';
import { battleSignificance, applyTerritoryMorale } from '../mechanics/campaign-impact.mjs';
import { CAMPAIGNS, dailyWorld } from '../mechanics/land-war.mjs';
import { homeEconomy } from '../mechanics/domestic-economy.mjs';
import { NODES } from '../mechanics/world.mjs';
import { validateSave } from '../mechanics/state-io.mjs';
import { resourceHover } from '../ui/resource-breakdown.mjs';
import { battleProgress } from '../ui/battle-progress.mjs';
const near = (a,b) => assert.ok(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(b)), `${a} != ${b}`);

test('blockade denies access while island occupation transfers the port, with no direct GDP or GTP transfer', () => {
  for (const campaign of Object.keys(CATALOG.campaigns)) {
    const s = newGame(CATALOG,'USA',280001,campaign), c = contentFor(CATALOG,s);
    const before = Object.fromEntries(['USA','JPN'].map(id => [id, {
      product:economyFor(s,id), growth:growthOutlook(s,c,id), ports:portTradeSummary(s,id)
    }]));
    const port = 'guam', trade = portSpec(s,port).trade;
    s.ports[port].blockade = 1;
    assert.equal(portOwner(s,port),'USA');
    near(portTradeSummary(s,'USA').available,before.USA.ports.available-trade);
    near(portTradeSummary(s,'JPN').available,before.JPN.ports.available);
    near(growthOutlook(s,c,'USA').monthly,before.USA.growth.monthly);
    assert.ok(growthOutlook(s,c,'USA').tradeMonthly < before.USA.growth.tradeMonthly);

    s.ports[port].blockade = 0;
    s.world.portControl[port] = 'JPN';
    invalidatePorts(s);
    assert.equal(portOwner(s,port),'JPN');
    near(portTradeSummary(s,'USA').available,before.USA.ports.available-trade);
    near(portTradeSummary(s,'JPN').available,before.JPN.ports.available+trade);
    for (const id of ['USA','JPN']) {
      const current = economyFor(s,id);
      for (const key of ['gdp','gtp','goldYear','industryYear','strategicYear'])
        near(current[key],before[id].product[key]);
      near(growthOutlook(s,c,id).monthly,before[id].growth.monthly);
    }
    assert.equal(merchantEconomy(s,c,'JPN').ports.coverage,1,'additional ports cannot exceed 100% access');
  }
});

test('merchant average is derived from the opening register, with the provisional Soviet register clearly marked', () => {
  for (const campaign of Object.keys(CATALOG.campaigns))
    for (const id of Object.keys(CATALOG.campaigns[campaign].nations)) {
      const s = newGame(CATALOG,id,280002,campaign), c = contentFor(CATALOG,s), e = merchantEconomy(s,c,id);
      near(e.openingAverage,e.baseline/e.openingHulls);
      near(e.current,e.hulls*e.average);
      near(e.average,e.openingAverage);
      assert.equal(e.estimated,campaign === 'campaign_1922' && id === 'SOV');
    }
});

test('civilian hull production follows shortage, logistics and additive industry bonuses in every opening', () => {
  for (const campaign of Object.keys(CATALOG.campaigns))
    for (const id of Object.keys(CATALOG.campaigns[campaign].nations)) {
      const s=newGame(CATALOG,id,280003,campaign),c=contentFor(CATALOG,s),n=s.nations[id];
      const opening=merchantEconomy(s,c,id);
      for (const [capacity,base] of [[0,10],[.5,5.5],[1,1],[2,1]])
        for (const [logistics,multiplier] of [[0,.5],[25,.75],[50,1],[75,1.5],[100,2]]) {
          const production=merchantProduction({...opening,current:opening.baseline*capacity,logistics},{multiplier:1.3});
          near(production.baseHulls,base);
          near(production.hullsPerMonth,base*multiplier*1.3);
        }
      n.gtp*=2;
      near(growthOutlook(s,c,id).production.shortfall,.5,'GTP growth raises the fleet requirement');
      n.merchant.hulls=0;n.convoys=[];
      for(const p of Object.values(s.ports))p.health=0;
      n.convoyRecord=[];
      const g=growthOutlook(s,c,id),gtp=n.gtp;
      near(g.merchantHullsMonth,5);near(g.tradeMonthly,-.02);
      const d=new Date(s.day*86400000);
      setCampaignMinutes(s,Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1)/60000);
      const fraction=campaign==='campaign_1922'?23/28:1;
      closeEconomicMonth(s,c,id);
      near(n.merchant.hulls+n.civilianShipping.carry,5*fraction);
      near(n.gtp,gtp*.98**fraction);
      assert.ok(n.merchant.hulls>0,'a completely lost merchant fleet can rebuild');
      assert.ok(n.civilianShipping.carry>=0 && n.civilianShipping.carry<1);
      validateSave(s,CATALOG);
    }
});

test('home occupation denies only the relevant domestic output, combines with bombing once and reverses on liberation', () => {
  for (const campaign of Object.keys(CATALOG.campaigns))
    for (const [id,regions] of Object.entries(ECONOMY.GDP_HOME_REGIONS)) {
      const s=newGame(CATALOG,id,280004,campaign),n=s.nations[id],c=contentFor(CATALOG,s);
      const occupier=id==='DEU'?'USA':'DEU',r=s.relations[[id,occupier].sort().join('-')];
      r.allied=false;
      const base=economyFor(s,id),growth=growthOutlook(s,c,id).monthly,region=regions[0];
      s.world.control[region.territory]=occupier;
      near(homeEconomy(s,id).access,1-region.share);
      near(economyFor(s,id).productiveGDP,base.gdp*(1-region.share));
      near(growthOutlook(s,c,id).monthly,growth,'occupation does not overwrite GDP growth');
      n.industrialDamage.industry=.4;
      const e=economyFor(s,id);
      near(e.productiveGDP,base.gdp*(1-region.share)*.6);
      near(e.goldYear,e.productiveGDP*.2+base.gtp*.8);
      near(e.industryYear,e.productiveGDP*.8+base.gtp*.2);
      near(n.gdp,base.gdp);near(n.gtp,base.gtp);
      r.allied=true;
      near(homeEconomy(s,id).access,1,'friendly liberation restores access');
      near(economyFor(s,id).productiveGDP,base.gdp*.6,'bombing damage remains after liberation');
      r.allied=false;s.world.control[region.territory]=id;
      near(economyFor(s,id).productiveGDP,base.gdp*.6);
      const hover=resourceHover(s,c,'GDP');
      assert.match(hover,/home access|Home occupation/);assert.doesNotMatch(hover,/NaN|undefined/);
    }
});

test('battle significance distinguishes minor damage from significant naval, air and convoy losses', () => {
  const report=()=>({resultA:{},resultB:{},merchantGRT:0});
  for(const [key,threshold] of [['tons',5000],['damagedTons',20000],['planesLost',100]]) {
    const r=report();r.resultA[key]=threshold-1;
    assert.equal(battleSignificance(r).significant,false,key+' below threshold');
    r.resultB[key]=1;
    assert.equal(battleSignificance(r).significant,true,key+' combined threshold');
  }
  const r=report();r.airOperation={merchantGRT:49999};
  assert.equal(battleSignificance(r).significant,false);
  r.airOperation.merchantGRT=50000;assert.equal(battleSignificance(r).significant,true);
  r.airOperation.merchantGRT=0;r.resultB.planesRescued=500;
  assert.equal(battleSignificance(r).significant,false,'repairable aircraft are not destroyed aircraft');
});

test('completed skirmishes do not change morale, significant battles apply once and score ignores battle counts', () => {
  for (const [tons,significant] of [[4999,false],[5000,true]]) {
    const s=newGame(CATALOG,'JPN',280005,'in_good_faith_1936'),c=contentFor(CATALOG,s);
    const a=s.nations.JPN,b=s.nations.USA;
    const r=beginEngagement(s,c,{a:'JPN',b:'USA',kind:'surface',region:'pacific',
      fleetA:a.fleets.find(f=>f.role==='carrier').id,fleetB:b.fleets.find(f=>f.role==='carrier').id});
    const ma=a.morale,mb=b.morale;
    r.resultB.tons=tons;r.stage=4;r.nextStageAt=campaignMinutes(s);
    progressEngagements(s,c);
    assert.equal(r.status,'completed');assert.equal(r.significantAction,significant);
    near(a.morale,ma+(significant?3:0));near(b.morale,mb-(significant?5:0));
    const after=[a.morale,b.morale];progressEngagements(s,c);
    assert.deepEqual([a.morale,b.morale],after);
    assert.match(battleProgress(r),significant?/Japan \+3/:/No morale change/);
    a.battlesWon=9000;a.battlesLost=3000;a.sunkTons=0;
    assert.equal(campaignScores(s,c).find(x=>x.id==='JPN').war,0);
    a.sunkTons=1000000;
    assert.equal(campaignScores(s,c).find(x=>x.id==='JPN').war,1000,'tonnage score has no old 150-point cap');
  }
});

test('territorial morale counts actual ownership changes once per resolved campaign, not every province', () => {
  const s=newGame(CATALOG,'DEU',280006,'in_good_faith_1936');
  const before=Object.fromEntries(Object.entries(s.nations).map(([id,n])=>[id,n.morale]));
  s.relations['DEU-FRA'].allied=false;
  const effects=applyTerritoryMorale(s,[
    {territory:'c220',previous:'FRA',owner:'DEU'},
    {territory:'c210',previous:'NLD',owner:'DEU'},
    {territory:'c211',previous:'BEL',owner:'DEU'}]);
  assert.deepEqual(effects,{DEU:3,FRA:-5});
  near(s.nations.GBR.morale,before.GBR,'France is the actual losing government');
  assert.deepEqual(applyTerritoryMorale(s,[{territory:'c220',previous:'DEU',owner:'DEU'}]),{});
});

test('an island capture in the real land update changes port ownership and morale without changing GDP', () => {
  const s=newGame(CATALOG,'JPN',280007,'in_good_faith_1936'),c=contentFor(CATALOG,s),a=s.nations.JPN,b=s.nations.USA;
  Object.assign(s.relations['JPN-USA'],{war:true,allied:false,warSince:s.day});
  recordConvoy(s,'JPN',{delivered:1e7});recordConvoy(s,'USA',{delivered:1e7});
  const f=a.fleets.find(f=>f.role==='carrier'),now=campaignMinutes(s);
  Object.assign(f,{phase:'patrol',route:[NODES.guam],departAt:now,arriveAt:now});
  for(const g of a.groups)if(g.fleetId===f.id)g.atSea=true;
  const definition=CAMPAIGNS.find(f=>f.id==='island-guam');
  s.world.fronts.push({...definition,progress:.999,momentum:0,lastOutcome:'Repulsed',started:s.day});
  const before={gdp:a.gdp,gtp:a.gtp,enemyGDP:b.gdp,ma:a.morale,mb:b.morale};
  dailyWorld(s,c);
  assert.equal(portOwner(s,'guam'),'JPN');
  near(a.morale,before.ma+1);near(b.morale,before.mb-2);
  near(a.gdp,before.gdp);near(b.gdp,before.enemyGDP);near(a.gtp,before.gtp);
  dailyWorld(s,c);
  near(a.morale,before.ma+1);near(b.morale,before.mb-2);
});
