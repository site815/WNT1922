import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { newGame, queueDecision, addAlert, addLog, advanceMinutes } from '../mechanics/engine.mjs';
import { contentFor } from '../mechanics/campaign-content.mjs';
import { campaignMinutes, setCampaignMinutes } from '../mechanics/campaign-clock.mjs';
import { applyCommand } from '../mechanics/game-actions.mjs';
import { convoyTraffic } from '../mechanics/convoy-traffic.mjs';
import { moveConvoys, convoyRoute, shippingPlan } from '../mechanics/merchant-convoys.mjs';
import { convoyRecord } from '../mechanics/economy-rules.mjs';
import { commenceWar, dispatchPopup } from '../mechanics/war-politics.mjs';
import { fleetPosition, usablePorts } from '../mechanics/task-forces.mjs';
import { PORTS, distanceNm } from '../mechanics/world.mjs';
import { validateSave } from '../mechanics/state-io.mjs';
import { activeDispatch } from '../mechanics/alert-lifecycle.mjs';
import { politicalPopup } from '../ui/diplomacy-popup.mjs';
import { alertsView, alertItems } from '../ui/ministry-view.mjs';
import { newsDestination } from '../ui/news-navigation.mjs';
import { NewsTicker } from '../ui/news-ticker.mjs';
const start=(id='USA')=>{
  const s=newGame(CATALOG,id,310031,'in_good_faith_1936');
  s.decisions=[];s.alerts=[];s.log=[];s.paused=false;delete s.pauseReason;delete s.resumeAfterDecision;
  return [s,contentFor(CATALOG,s),s.nations[id]];
};
const options=[{id:'approve',label:'Approve',detail:'Approve the estimate.',gold:100},
  {id:'decline',label:'Retain current policy',detail:'No new spending.'}];
const command=(s,type,key)=>applyCommand(s,CATALOG,{type,args:{key}});

test('2% shipping keeps compact convoys across all fourteen starts',()=>{
  for(const campaign of Object.keys(CATALOG.campaigns))for(const id of Object.keys(CATALOG.nations)) {
    const s=newGame(CATALOG,id,310031,campaign),t=convoyTraffic(s,id);
    assert.equal(t.hullsAtSea,Math.round(s.nations[id].merchant.hulls*.02));
    assert.ok(t.convoyCount<=15,id+' keeps compact convoy groups');
  }
});

test('war immediately diverts enemy-bound merchants without teleporting or crediting cargo',()=>{
  const[s,c,n]=start(),v=n.convoys.find(v=>v.destination==='portsmouth');
  assert.ok(v);v.leg='outbound';convoyRoute(s,v,'portsmouth');
  const position=fleetPosition(s,v),delivered=convoyRecord(s,'USA').delivered;
  commenceWar(s,c,'USA','GBR');
  assert.equal(v.aborted,true);assert.equal(v.targetNode,v.port);assert.equal(v.leg,'returning');
  assert.ok(distanceNm(position,fleetPosition(s,v))<1e-6);
  assert.equal(convoyRecord(s,'USA').delivered,delivered);
  assert.ok(shippingPlan(s,c,'USA').routes.every(r=>r.to!=='portsmouth'));
  assert.ok(n.convoys.filter(v=>v.leg==='outbound'&&!v.aborted).every(v=>v.targetNode!=='portsmouth'));
  validateSave(s,CATALOG);
});

test('merchants with no accessible port hold physically and later divert without earning deliveries',()=>{
  const[s,c,n]=start('JPN'),v=n.convoys[0];
  Object.assign(s.relations['JPN-USA'],{war:true,warSince:s.day});
  for(const id of Object.keys(PORTS))s.world.portControl[id]='USA';
  assert.equal(usablePorts(s,'JPN').length,0);
  const position=fleetPosition(s,v),hulls=n.merchant.hulls;
  moveConvoys(s,c,'JPN');assert.equal(v.waitingForPort,true);
  setCampaignMinutes(s,campaignMinutes(s)+1440);moveConvoys(s,c,'JPN');
  assert.ok(distanceNm(position,fleetPosition(s,v))<1e-6);
  assert.ok(convoyTraffic(s,'JPN').hullsAtSea>0);
  s.world.portControl[v.port]='JPN';n.convoyPlanAt=-Infinity;
  moveConvoys(s,c,'JPN');assert.ok(!v.waitingForPort);assert.equal(v.aborted,true);
  assert.ok(distanceNm(position,fleetPosition(s,v))<1e-6);
  assert.equal(convoyRecord(s,'JPN').delivered,0);assert.equal(n.merchant.hulls,hulls);
  validateSave(s,CATALOG);
});

test('deferred choices preserve deadlines and resources, remain accessible, and reopen with a pause',()=>{
  const[s,c,n]=start(),gold=n.gold,now=campaignMinutes(s);
  queueDecision(s,'first','First estimate','Choose the estimate.',options);
  queueDecision(s,'second','Second estimate','Another estimate.',options);
  assert.equal(s.paused,true);assert.equal(s.decisions[0].deadline,now+14*1440);
  command(s,'defer-decision','first');assert.equal(s.paused,true);
  command(s,'defer-decision','second');assert.equal(s.paused,false);assert.equal(n.gold,gold);
  assert.equal(politicalPopup(s),'');assert.match(alertsView(s,c),/pending-decision/);
  assert.match(alertsView(s,c),/If ignored: No new spending/);
  const deadline=s.decisions[0].deadline;
  setCampaignMinutes(s,now+1440);command(s,'reopen-decision','first');
  assert.equal(s.paused,true);assert.equal(s.decisions[0].deadline,deadline);
  assert.match(politicalPopup(s),/Return to ministry/);
  command(s,'defer-decision','first');assert.equal(s.paused,false);
  const loaded=validateSave(s,CATALOG);assert.ok(loaded.decisions.every(d=>d.deferred));
  applyCommand(loaded,CATALOG,{type:'pause',args:{value:false}});assert.equal(loaded.paused,false);
  s.paused=true;command(s,'reopen-decision','first');command(s,'defer-decision','first');
  assert.equal(s.paused,true,'Manual pause is preserved');
});

test('a deferred deadline applies its default once and permits time stepping',()=>{
  const[s,c,n]=start(),before=n.influence;
  queueDecision(s,'deadline','Aid request','Choose.',[
    {id:'aid',label:'Send aid',detail:'Pay 100 gold.',gold:100},
    {id:'decline',label:'Decline',detail:'Lose 5 influence.',influence:5}
  ],{deadline:campaignMinutes(s)+15});
  command(s,'defer-decision','deadline');assert.equal(s.paused,false);
  applyCommand(s,CATALOG,{type:'pause',args:{value:true}});
  applyCommand(s,CATALOG,{type:'step',args:{minutes:15}});
  assert.equal(n.influence,before-5);assert.equal(s.decisions.length,0);
  assert.ok(s.alerts.some(a=>a.title==='Deadline reached: Aid request'));
  advanceMinutes(s,c,15);assert.equal(n.influence,before-5);
  validateSave(s,CATALOG);
});

test('only war announcements and choices interrupt play; informational events become news',()=>{
  const[s,c]=start();s.autoPause=true;
  dispatchPopup(s,'politics','Political development','A diplomatic development.');
  assert.equal(s.paused,false);assert.equal(s.decisions.length,0);
  assert.ok(alertItems(s).some(a=>a.title==='Political development'));
  dispatchPopup(s,'war','War begins','Hostilities have begun.','war');
  assert.equal(s.paused,true);assert.ok(s.decisions.some(activeDispatch));
  command(s,'defer-decision','war');assert.equal(s.paused,false);assert.equal(s.decisions.length,0);
  assert.ok(s.completedEvents.includes('war'));assert.equal(politicalPopup(s),'');
});

test('clickable news retains exact report and ship links and keeps unrelated same-tick notices',()=>{
  const[s,c,n]=start(),ship=n.groups.find(g=>g.count),ticker=new NewsTicker(()=>{});
  addLog(s,'A new ship has commissioned.','industry',{shipId:ship.id,newsView:'fleet'});
  addAlert(s,'Program complete','A different program completed.','industry',{programKey:'school'});
  const items=alertItems(s);assert.equal(items.length,2);
  const commissioned=items.find(a=>a.shipId);
  assert.deepEqual(newsDestination(s,commissioned),{view:'fleet',shipId:ship.id});
  assert.match(ticker.markup(items),/data-action="open-news"/);
  assert.deepEqual(newsDestination(s,items.find(a=>a.programKey)),{view:'programs',programKey:'school'});
  s.reports.push({id:1234});
  assert.deepEqual(newsDestination(s,{reportId:1234}),{view:'reports',reportId:1234});
  assert.deepEqual(newsDestination(s,{reportId:9999}),{view:'reports'});
  assert.deepEqual(newsDestination(s,{shipId:'missing'}),{view:'fleet'});
});
