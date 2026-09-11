import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newGame,chooseDecision,diplomaticAction,advanceMinutes} from '../src/engine.mjs';
import {contentFor} from '../src/campaign-content.mjs';
import {validateSave} from '../src/state-io.mjs';
import {applyCommand} from '../src/game-actions.mjs';
import {campaignMinutes,setCampaignMinutes,adjustEuropeanTimeline} from '../src/campaign-clock.mjs';
import {RELATIONS_1922,RELATIONS_1936,warningRisk,relationChanges} from '../src/diplomacy-history.mjs';
import {addCalendarMonths,beginWarWarning,commenceWar,politicsTick,historicalWarnings,formAlliance,endAlliance,activePacts,monthlyRelations,PACT_EVENTS} from '../src/war-politics.mjs';
const bundle=JSON.parse(fs.readFileSync((process.env.WNT_TEST_PUBLIC||'game/staging')+'/content.json'));
const start=(player='USA',campaign='in_good_faith_1936',seed=47000)=>{const s=newGame(bundle,player,seed,campaign);s.decisions=[];s.completedEvents=[];s.autoPause=false;s.paused=false;delete s.pauseReason;delete s.resumeAfterDecision;return [s,contentFor(bundle,s),s.nations[player]];};
const clearPopups=(s,c)=>{while(s.decisions.some(d=>d.popup)){const d=s.decisions.find(d=>d.popup);chooseDecision(s,c,d.key,d.defaultOption);}};
test('all fourteen openings use the two historical matrices and four 50% funding settings',()=>{
 for(const campaign of Object.keys(bundle.campaigns))for(const id of Object.keys(bundle.campaigns[campaign].nations)){
  const [s]=start(id,campaign),expected=campaign==='campaign_1922'?RELATIONS_1922:RELATIONS_1936;
  assert.equal(Object.keys(s.relations).length,21);for(const [pair,r]of Object.entries(s.relations))assert.equal(r.score,expected[pair][0]);
  for(const n of Object.values(s.nations))for(const field of ['industryFunding','schoolFunding','aviatorFunding','aircraftFunding'])assert.equal(n[field],.5);
  validateSave(s,bundle);
 }
});
test('historical monthly changes expose their actual applied sum; pressure gates ordinary warnings',()=>{
 const [s,c]=start(),r=s.relations['GBR-USA'],before=r.score,change=relationChanges(s,r);monthlyRelations(s,c);assert.ok(Math.abs(r.score-before-change.total)<1e-8);assert.ok(r.lastRelationChange.historical>0);
 r.score=-30;r.allied=false;r.warning=null;r.pressure=49.9;assert.equal(warningRisk(s,r),0);r.pressure=50;assert.equal(warningRisk(s,r),.3);r.allied=true;assert.equal(warningRisk(s,r),0);
});
test('calendar warnings cover 1–12 months and clamp dates such as January 31 correctly',()=>{
 const jan=Date.parse('1936-01-31T09:17:00Z')/60000;assert.equal(new Date(addCalendarMonths(jan,1)*60000).toISOString(),'1936-02-29T09:17:00.000Z');
 const seen=new Set();for(let seed=1;seed<100;seed++){const [s,c]=start('USA','in_good_faith_1936',seed),w=beginWarWarning(s,c,'USA','JPN');assert.ok(w.months>=1&&w.months<=12);assert.equal(w.endsAt,addCalendarMonths(w.startedAt,w.months));seen.add(w.months);}assert.equal(seen.size,12);
});
test('warnings pause even with optional autopause off, survive reload, and cannot be canceled by friendship',()=>{
 const [s,c]=start(),w=beginWarWarning(s,c,'USA','JPN',{months:2});assert.equal(s.paused,true);assert.equal(s.decisions.at(-1).popup,true);assert.throws(()=>applyCommand(s,bundle,{type:'pause',args:{value:false}}),/Acknowledge/);
 const loaded=validateSave(s,bundle);assert.deepEqual(loaded.relations['JPN-USA'].warning,w);
 clearPopups(s,c);assert.equal(s.paused,false);s.relations['JPN-USA'].score=100;
 setCampaignMinutes(s,w.endsAt-1);politicsTick(s,c);assert.equal(s.relations['JPN-USA'].war,false);
 setCampaignMinutes(s,w.endsAt);politicsTick(s,c);assert.equal(s.relations['JPN-USA'].war,true);assert.equal(s.relations['JPN-USA'].warning,null);assert.equal(s.paused,true);assert.ok(s.decisions.some(d=>d.popup&&d.kind==='war'));validateSave(s,bundle);
});
test('acknowledging a warning preserves a preexisting manual pause',()=>{
 const [s,c]=start();s.paused=true;beginWarWarning(s,c,'USA','JPN',{months:1});clearPopups(s,c);assert.equal(s.paused,true);
});
test('historical advance warnings preserve outbreak windows and freeze the announced 1922 date',()=>{
 for(const campaign of ['campaign_1922','in_good_faith_1936']){
  const [s,c]=start('GBR',campaign);adjustEuropeanTimeline(s);const outbreak=s.timeline.britainAt,startAt=addCalendarMonths(outbreak,-s.warningMonths.europe);
  setCampaignMinutes(s,startAt);historicalWarnings(s,c);const w=s.relations['DEU-GBR'].warning;assert.equal(w.endsAt,outbreak);assert.equal(w.scripted,true);assert.equal(s.timeline.europeWarningLocked,true);
  for(const r of Object.values(s.relations))r.score=-100;adjustEuropeanTimeline(s);assert.equal(s.timeline.britainAt,outbreak);
  clearPopups(s,c);setCampaignMinutes(s,s.timeline.polandAt);advanceMinutes(s,bundle,0);assert.equal(s.timeline.polandOccurred,true);clearPopups(s,c);setCampaignMinutes(s,outbreak);advanceMinutes(s,bundle,0);assert.equal(s.relations['DEU-GBR'].war,true);assert.equal(s.relations['DEU-FRA'].war,true);validateSave(s,bundle);
 }
});
test('a defender calls its player ally; accepting enters immediately without a second warning',()=>{
 const [s,c]=start();s.relations['GBR-USA'].score=100;formAlliance(s,'USA','GBR',{announce:false});commenceWar(s,c,'DEU','GBR',{aggressor:'DEU'});
 const d=s.decisions.find(d=>d.kind==='call-to-arms');assert.ok(d);assert.equal(d.enemy,'DEU');assert.equal(s.relations['DEU-USA'].war,false);
 chooseDecision(s,c,d.key,'join');assert.equal(s.relations['DEU-USA'].war,true);assert.equal(s.relations['DEU-USA'].warning,null);validateSave(s,bundle);
});
test('refusing a call costs relations and influence, ends the alliance and preserves neutrality',()=>{
 const [s,c,n]=start();s.relations['GBR-USA'].score=100;formAlliance(s,'USA','GBR',{announce:false});commenceWar(s,c,'DEU','GBR',{aggressor:'DEU'});const d=s.decisions.find(d=>d.kind==='call-to-arms'),influence=n.influence;chooseDecision(s,c,d.key,'refuse');assert.equal(s.relations['DEU-USA'].war,false);assert.equal(s.relations['GBR-USA'].allied,false);assert.equal(s.relations['GBR-USA'].score,65);assert.equal(n.influence,influence-10);validateSave(s,bundle);
});
test('offensive wars do not call allies; a mutual triangle is a three-power alliance',()=>{
 const [s,c]=start();for(const [a,b]of [['USA','GBR'],['GBR','FRA'],['FRA','USA']])formAlliance(s,a,b,{announce:false});assert.ok(s.pacts.some(p=>p.active&&p.members.length===3&&p.kind==='defensive'));
 commenceWar(s,c,'GBR','DEU',{aggressor:'GBR'});assert.equal(s.decisions.some(d=>d.kind==='call-to-arms'),false);assert.equal(s.relations['DEU-USA'].war,false);
});
test('historical political pacts are distinct from military alliances; a participant can decline',()=>{
 let [s,c]=start('USA');setCampaignMinutes(s,PACT_EVENTS[0].at);politicsTick(s,c);assert.ok(s.pacts.some(p=>p.id==='axis-friendship'&&p.active));assert.equal(s.relations['DEU-ITA'].allied,false);validateSave(s,bundle);
 [s,c]=start('DEU');setCampaignMinutes(s,PACT_EVENTS[0].at);politicsTick(s,c);const d=s.decisions.find(d=>d.pactEvent==='axis-friendship');assert.ok(d);chooseDecision(s,c,d.key,'decline');assert.equal(s.pacts.some(p=>p.id==='axis-friendship'),false);
});
test('fractional-day diplomacy cooldowns remain valid saves',()=>{
 const [s,c,n]=start();setCampaignMinutes(s,campaignMinutes(s)+137);n.gold=n.industry=1e6;n.influence=500;diplomaticAction(s,'GBR','visit',s.player,c);assert.ok(!Number.isInteger(n.cooldowns['visit-GBR']));validateSave(s,bundle);
});


test('named multi-power pacts appear once and retain unrelated commitments after withdrawal',()=>{
 const [s,c]=start('USA');setCampaignMinutes(s,PACT_EVENTS.at(-1).at);politicsTick(s,c);
 let shown=activePacts(s).filter(p=>p.kind==='defensive');assert.equal(shown.length,1);assert.equal(shown[0].name,'The Tripartite Pact');assert.equal(shown[0].members.length,3);
 endAlliance(s,'DEU','ITA');shown=activePacts(s).filter(p=>p.kind==='defensive');assert.equal(shown.length,2);assert.ok(shown.every(p=>p.members.includes('JPN')));validateSave(s,bundle);
});

test('declined political pacts do not supply the historical alignment modifier',()=>{
 const [s,c]=start('DEU');setCampaignMinutes(s,PACT_EVENTS[0].at);politicsTick(s,c);const d=s.decisions.find(d=>d.pactEvent==='axis-friendship');chooseDecision(s,c,d.key,'decline');assert.equal(relationChanges(s,s.relations['DEU-ITA']).historical,.2);
});


test('background 1922 pressure cannot bypass European windows, but crisis pressure can',()=>{
 const [s]=start('GBR','campaign_1922');setCampaignMinutes(s,Date.parse('1938-06-01T00:00:00Z')/60000);const r=s.relations['DEU-GBR'];r.score=-90;r.pressure=60;assert.equal(warningRisk(s,r),0);r.pressure=85;assert.equal(warningRisk(s,r),.9);
});
