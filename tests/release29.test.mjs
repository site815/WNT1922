import test from "node:test";
import assert from "node:assert/strict";
import { CATALOG } from "../worker/catalog-loader.mjs";
import { newGame, queueDecision, chooseDecision, addAlert, fleetPower, orderShip } from "../mechanics/engine.mjs";
import { contentFor } from "../mechanics/campaign-content.mjs";
import { applyCommand } from "../mechanics/game-actions.mjs";
import { campaignMinutes, setCampaignMinutes } from "../mechanics/campaign-clock.mjs";
import { merchantEconomy } from "../mechanics/merchant-economy.mjs";
import { convoyTraffic } from "../mechanics/convoy-traffic.mjs";
import { moveConvoys, syncConvoys, shippingPlan } from "../mechanics/merchant-convoys.mjs";
import { recordConvoy, convoyRecord } from "../mechanics/economy-rules.mjs";
import { productionBlock } from "../mechanics/naval-resources.mjs";
import { supplyDetails } from "../mechanics/logistics.mjs";
import { noticeReceipt } from "../mechanics/alert-lifecycle.mjs";
import { politicsTick } from "../mechanics/war-politics.mjs";
import { validateSave } from "../mechanics/state-io.mjs";
import { commandView } from "../ui/command-view.mjs";
import { politicalPopup } from "../ui/diplomacy-popup.mjs";
import { alertItems } from "../ui/ministry-view.mjs";
import { NewsTicker } from "../ui/news-ticker.mjs";
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const start=(id="USA",campaign="in_good_faith_1936")=>{
  const s=newGame(CATALOG,id,290029,campaign);s.decisions=[];s.log=[];s.alerts=[];s.paused=false;
  delete s.pauseReason;delete s.resumeAfterDecision;
  return [s,contentFor(CATALOG,s),s.nations[id]];
};

test("all 14 starts put 20% of actual merchants underway and show peacetime traffic",()=>{
  for(const camp of Object.keys(CATALOG.campaigns))for(const id of Object.keys(CATALOG.nations)) {
    const [s,c,n]=start(id,camp),t=convoyTraffic(s,id),e=merchantEconomy(s,c,id);
    assert.equal(t.hullsAtSea,Math.round(n.merchant.hulls*.2),camp+id);
    assert.equal(t.hullsAtSea,t.targetAtSea);assert.ok(t.convoyCount>0);
    near(t.averageHulls,t.hullsAtSea/t.convoyCount);
    assert.equal(n.merchant.hulls,e.hulls);
    assert.equal((commandView(s,c).match(/class="convoy-marker"/g)||[]).length,n.convoys.length);
    validateSave(s,CATALOG);
  }
});

test("convoy relief sailings conserve hulls and maintain traffic through 60 days of real round trips",()=>{
  for(const id of ["GBR","JPN","USA"]) {
    const [s,c,n]=start(id),now=campaignMinutes(s),hulls=n.merchant.hulls,target=convoyTraffic(s,id).targetAtSea;
    let fullTicks=0,peak=0;
    for(let i=1;i<=60*96;i++) {
      setCampaignMinutes(s,now+i*15);moveConvoys(s,c,id);
      const t=convoyTraffic(s,id);peak=Math.max(peak,t.hullsAtSea);
      if(t.hullsAtSea===target)fullTicks++;
      assert.ok(n.convoys.reduce((sum,v)=>sum+v.count,0)<=hulls,"no merchant duplication");
      assert.equal(n.merchant.hulls,hulls);assert.ok(n.convoys.length<=64);
    }
    assert.equal(peak,target);assert.ok(fullTicks>60*96*.99,id+" maintains its moving pool");
    assert.ok(convoyRecord(s,id).delivered>0);validateSave(s,CATALOG);
  }
});

test("surplus deliveries are visible but never lift logistics above 100% or erase wartime sinkings",()=>{
  const [s,c,n]=start(),required=shippingPlan(s,c,"USA").required;
  recordConvoy(s,"USA",{delivered:required*3});let e=merchantEconomy(s,c);
  near(e.deliveryCoverage,3);near(e.effectiveDeliveryCoverage,1);near(e.logistics,100);
  s.relations['JPN-USA'].war=true;recordConvoy(s,"USA",{sunk:required*3});e=merchantEconomy(s,c);
  near(e.convoys.success,.5);near(e.logistics,75);
  assert.equal(n.gtp,c.nations.USA.economy.gtp);
});

test("naval supply applies logistics and empty strategic reserves exactly once",()=>{
  const [s,c,n]=start(),f=n.fleets[0];
  let d=supplyDetails(s,c,"USA",f);near(d.nationalLogistics,50);near(d.logisticsFactor,.9);
  near(d.factor,d.distanceFactor*d.enduranceFactor*.9);
  recordConvoy(s,"USA",{delivered:shippingPlan(s,c,"USA").required});
  d=supplyDetails(s,c,"USA",f);near(d.logisticsFactor,1);
  const before=fleetPower(s,c,"USA").surface;n.strategic=0;
  near(supplyDetails(s,c,"USA",f).factor,d.factor*.5);
  near(fleetPower(s,c,"USA").surface,before*.5);
  n.strategic=1;near(supplyDetails(s,c,"USA",f).factor,d.factor);
  n.convoyRecord=[];for(const p of Object.values(s.ports))p.health=0;
  d=supplyDetails(s,c,"USA",f);near(d.logisticsFactor,.8);near(d.factor,0);
});

test("every navy has one working support type per decade, while ALB Japan retains Maru",()=>{
  for(const camp of Object.keys(CATALOG.campaigns))for(const id of Object.keys(CATALOG.nations)) {
    const [s,c,n]=start(id,camp),designs=c.nations[id].designs.map(k=>c.classes[k]).filter(cl=>cl.service==='support');
    if(id==='JPN'&&camp==='in_good_faith_1936') {
      assert.deepEqual(designs.map(cl=>cl.id),['maru_depot_t23']);assert.equal(designs[0].tons,4700);
    } else {
      assert.deepEqual(designs.map(cl=>cl.year).sort(),[1922,1932,1942]);
      for(const year of [1922,1932,1942]) {
        setCampaignMinutes(s,Date.parse(year+'-01-01')/60000);
        const current=designs.filter(cl=>!productionBlock(s,c,cl.id,id));
        assert.equal(current.length,1);assert.equal(current[0].year,year);
      }
    }
    for(const cl of designs)assert.ok(cl.type==='AO'&&cl.crew>0&&cl.tons>0&&cl.speed>0&&cl.supportHybrid);
  }
});

test("Republic is a 1941 Tillman successor with consistent machinery, protection and six triple turrets",()=>{
  const [s,c,n]=start(),cl=c.classes.republic_bb41,col=c.classes.columbia_bb32;
  assert.equal(cl.tons,200000);assert.equal(cl.speed,32);assert.equal(cl.barrels,18);assert.equal(cl.caliber,546);
  assert.deepEqual(cl.raw.protection,col.raw.protection);
  const estimated=col.shp*(cl.tons/col.tons)**(2/3)*(cl.speed/col.speed)**3;
  assert.ok(Math.abs(cl.shp-estimated)/estimated<.001);assert.equal(cl.shp,cl.raw.propulsion.shp);
  const main=cl.raw.batteries.find(b=>b.role==='main');assert.equal(main.mounts,6);assert.equal(main.barrels_per_mount,3);
  assert.equal(main.rounds_total,main.mounts*3*main.rounds_per_gun);assert.match(main.arrangement,/3 forward.*3 aft.*superfiring/);
  assert.ok(!n.groups.some(g=>g.classId===cl.id));assert.match(productionBlock(s,c,cl.id),/1941/);
  setCampaignMinutes(s,Date.parse('1941-01-01')/60000);assert.equal(productionBlock(s,c,cl.id),'');
  assert.match(productionBlock(s,c,col.id),/superseded/);
  n.gold=n.industry=n.strategic=1e8;n.influence=500;assert.ok(orderShip(s,c,cl.id));validateSave(s,CATALOG);
});

test("mandatory dispatches pause regardless of settings, queue safely, and resume only an interrupted game",()=>{
  const [s,c]=start();s.autoPause=false;
  const options=[{id:'ok',label:'Acknowledge',detail:'Return to the ministry.'}];
  queueDecision(s,'first','First dispatch','A required response.',options);
  queueDecision(s,'second','Second dispatch','Another response.',options,{critical:true});
  assert.equal(s.paused,true);assert.match(politicalPopup(s),/First dispatch/);
  assert.throws(()=>applyCommand(s,CATALOG,{type:'pause',args:{value:false}}),/Acknowledge/);
  chooseDecision(s,c,'first','ok');assert.equal(s.paused,true);
  chooseDecision(s,c,'second','ok');assert.equal(s.paused,false);
  s.paused=true;queueDecision(s,'third','Third','Already paused.',options);chooseDecision(s,c,'third','ok');
  assert.equal(s.paused,true);validateSave(s,CATALOG);
});

test("China's war is a worldwide mandatory event and routine foreign pact accessions are ticker news",()=>{
  for(const id of ['USA','JPN']) {
    const [s,c]=start(id);setCampaignMinutes(s,Date.parse('1937-07-08')/60000);s.nextDiplomaticAt=-1e9;politicsTick(s);
    const d=s.decisions.find(d=>d.title==='War in China');assert.ok(d?.forcePause);assert.equal(s.paused,true);
    for(const d of [...s.decisions])chooseDecision(s,c,d.key,'acknowledge');
    assert.ok(!alertItems(s).some(a=>a.title==='War in China'));
  }
  const [s]=start();setCampaignMinutes(s,Date.parse('1937-11-07')/60000);politicsTick(s);
  assert.ok(!s.decisions.some(d=>d.title==='Italy joins the Anti-Comintern Pact'));
  assert.ok(alertItems(s).some(a=>a.body.includes('Italy has joined')));
});

test("news is shown once, stale read receipts cannot dismiss new battle results, and decisions are never ticker items",()=>{
  const [s,c]=start(),ticker=new NewsTicker((id,receipt)=>applyCommand(s,CATALOG,{type:'read-news',args:{id,receipt}}));
  addAlert(s,'Underway','Fleet has sailed.','operations');const a=s.alerts[0];
  assert.match(ticker.markup(alertItems(s)),/Underway/);
  ticker.finish(a);
  assert.doesNotMatch(ticker.markup(alertItems(s)),/Underway/);
  addAlert(s,'Battle underway','Contact.','battle',{ongoing:true});const b=s.alerts[0],old=noticeReceipt(b);
  b.ongoing=false;b.title='Battle resolved';
  applyCommand(s,CATALOG,{type:'read-news',args:{id:b.id,receipt:old}});assert.ok(!b.dismissed);
  queueDecision(s,'critical','Important decision','Choose.',[{id:'ok',label:'Accept',detail:'Done.'}],{critical:true});
  const html=ticker.markup(alertItems(s));assert.doesNotMatch(html,/Important decision|alert-history|clear-alerts|0 alerts/);
  assert.match(politicalPopup(s),/Important decision/);
});

test("selecting a force circles it on the chart and highlights the list without any mission controls",()=>{
  const [s,c,n]=start(),f=n.fleets.find(f=>f.role==='battle'),html=commandView(s,c,{fleetId:f.id});
  assert.ok(html.includes('class="fleet-command-row selected" data-action="focus-fleet" data-id="'+f.id+'"'));
  assert.ok(html.includes('class="chart-focus" data-motion-id="'+f.id+'"'));
  assert.doesNotMatch(html,/send-inline-order|data-fleet-mission|data-fleet-aggression/);
  assert.match(html,/Admiral control/);
});
