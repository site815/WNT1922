import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newGame,queueDecision,chooseDecision,addAlert,advanceMinutes} from '../src/engine.mjs';
import {contentFor} from '../src/campaign-content.mjs';
import {campaignMinutes,setCampaignMinutes} from '../src/campaign-clock.mjs';
import {initializeTraining,trainPersonnel,nextGraduationDay} from '../src/personnel-training.mjs';
import {dailyResources} from '../src/naval-resources.mjs';
import {recordCasualties} from '../src/recovery.mjs';
import {applyCommand} from '../src/game-actions.mjs';
import {validateSave,saveEnvelope} from '../src/state-io.mjs';
import {alertVisible,recordFrontAlert} from '../src/alert-lifecycle.mjs';
import {alertItems,alertsView} from '../src/ministry-view.mjs';
import {updateFrontNotice,dailyWorld} from '../src/land-war.mjs';
import {escortEligible,escortsForConvoy,coverageAt,escortCircle,ESCORT_RADIUS_NM} from '../src/convoy-coverage.mjs';
import {convoyCoverage,fleetPosition} from '../src/task-forces.mjs';
import {distanceNm} from '../src/world.mjs';
import {polygonPath} from '../src/projection.mjs';
const bundle=JSON.parse(fs.readFileSync((process.env.WNT_TEST_PUBLIC||'game/staging')+'/content.json'));
const start=()=>{const s=newGame(bundle,'JPN',714);return [s,contentFor(bundle,s)];};
const day=iso=>Date.parse(iso+'T00:00:00Z')/86400000;
const demand=(s,key)=>queueDecision(s,key,'Mandatory '+key,'A test demand.',[{id:'ok',label:'Respond',detail:'Settle the demand.'}],{critical:true});

test('monthly sailors and quarterly aviators graduate whole batches on calendar boundaries',()=>{
 const s={day:day('1936-01-01')},n={crew:0,aviators:0,crewYear:3660,aviatorsYear:366,schoolFunding:1,aviatorFunding:1};initializeTraining(s,n);
 assert.equal(nextGraduationDay(s,'sailors'),day('1936-02-01'));assert.equal(nextGraduationDay(s,'aviators'),day('1936-04-01'));
 let cost=0;const fund=(q,g)=>{cost+=q*g;return q;};
 for(let i=0;i<30;i++){s.day++;trainPersonnel(s,n,fund);}assert.equal(n.crew,0);assert.equal(n.aviators,0);assert.equal(n.personnelTraining.sailors,300);
 s.day++;assert.deepEqual(trainPersonnel(s,n,fund),{sailors:310,aviators:0});assert.equal(n.personnelTraining.aviators,31);
 const once=cost;trainPersonnel(s,n,fund);assert.equal(cost,once,'same-day updates cannot pay or graduate twice');
 while(s.day<day('1936-04-01')){s.day++;trainPersonnel(s,n,fund);}assert.equal(n.crew,910);assert.equal(n.aviators,91);
 while(s.day<day('1937-01-01')){s.day++;trainPersonnel(s,n,fund);}assert.equal(n.crew,3660);assert.equal(n.aviators,366);
 assert.equal(nextGraduationDay(s,'aviators'),day('1937-04-01'));
});
test('funding shortages and fractions carry through monthly training without free graduates',()=>{
 const s={day:day('1922-02-06')},n={crew:5,aviators:2,crewYear:365,aviatorsYear:365,schoolFunding:.1,aviatorFunding:.1};initializeTraining(s,n);
 for(let i=0;i<23;i++){s.day++;trainPersonnel(s,n,q=>q);}assert.equal(s.day,day('1922-03-01'));assert.equal(n.crew,7);assert.equal(n.aviators,2);assert.ok(Math.abs(n.personnelTraining.sailors-.3)<1e-9);
 const pending=n.personnelTraining.aviators;while(s.day<day('1922-04-01')){s.day++;trainPersonnel(s,n,()=>0);}assert.equal(n.crew,7);assert.equal(n.aviators,4);assert.ok(Math.abs(n.personnelTraining.aviators-(pending-2))<1e-9);
});
test('daily resource integration withholds trainees and returns rescued personnel on recovery dates',()=>{
 const [s,c]=start(),n=s.nations.JPN;n.gold=n.industry=1e8;const before=[n.crew,n.aviators];s.day++;dailyResources(s,c,()=>{});
 assert.deepEqual([n.crew,n.aviators],before);assert.ok(n.personnelTraining.sailors>0&&n.personnelTraining.aviators>0);
 const sailors=recordCasualties(s,n,'sailors',10,{rescue:1,days:2}),aviators=recordCasualties(s,n,'aviators',4,{rescue:1,days:2});s.day+=2;dailyResources(s,c,()=>{});
 assert.equal(n.crew,before[0]+sailors.rescued);assert.equal(n.aviators,before[1]+aviators.rescued);
 const copy=validateSave(saveEnvelope(s),bundle);assert.deepEqual(copy.nations.JPN.personnelTraining,n.personnelTraining);
 const invalid=saveEnvelope(s);invalid.nations.JPN.personnelTraining.sailors=-1;assert.throws(()=>validateSave(invalid,bundle));
});
test('critical decision auto-pause resumes only after all pending mandatory decisions are resolved',()=>{
 const [s,c]=start();s.decisions=[];s.paused=false;demand(s,'one');demand(s,'two');assert.equal(s.paused,true);
 chooseDecision(s,c,'one','ok');assert.equal(s.paused,true);assert.equal(s.pauseReason,'two');
 chooseDecision(s,c,'two','ok');assert.equal(s.paused,false);assert.equal(s.pauseReason,undefined);assert.equal(s.resumeAfterDecision,undefined);
});
test('manual pause, loading and failed choices cannot cause an unexpected auto-resume',()=>{
 const [s,c]=start();s.decisions=[];demand(s,'manual');chooseDecision(s,c,'manual','ok');assert.equal(s.paused,true);
 s.paused=false;demand(s,'stopped');applyCommand(s,bundle,{type:'pause',args:{value:true}});chooseDecision(s,c,'stopped','ok');assert.equal(s.paused,true);
 s.paused=false;demand(s,'persist');const loaded=validateSave(saveEnvelope(s),bundle);chooseDecision(loaded,c,'persist','ok');assert.equal(loaded.paused,true);
 assert.throws(()=>chooseDecision(s,c,'persist','bad'));assert.equal(s.paused,true);chooseDecision(s,c,'persist','ok');assert.equal(s.paused,false);
});
test('battle notices expire at exactly 48 game hours including an open reading snapshot',()=>{
 const [s,c]=start();s.log=[];s.decisions=[];addAlert(s,'Recent battle','Combat resolved.','battle');const notice=s.alerts[0],reading=structuredClone(notice),minute=campaignMinutes(s);
 setCampaignMinutes(s,minute+2879);assert.equal(alertVisible(s,notice),true);assert.match(alertsView(s,c,notice.id,reading),/alert-detail/);
 setCampaignMinutes(s,minute+2880);assert.equal(alertItems(s).length,0);assert.doesNotMatch(alertsView(s,c,notice.id,reading),/alert-detail/);
 assert.equal(alertVisible(s,{kind:'war',minute}),true);assert.equal(alertVisible(s,{kind:'convoy',minute}),false);
});
test('assault notices persist through fighting and expire after resolution, including counterattacks and ceasefires',()=>{
 const [s]=start();s.alerts=[];s.log=[];const f={id:'island-guam',name:'Guam',island:true,progress:.1};const notify=(...args)=>recordFrontAlert(s,...args);
 updateFrontNotice(s,f,0,notify);const opening=s.alerts[0];assert.equal(opening.resolvedAt,null);
 setCampaignMinutes(s,campaignMinutes(s)+10000);assert.equal(alertVisible(s,opening),true);
 for(let i=0;i<150;i++)addAlert(s,'Other notice '+i,'Routine.');assert.equal(s.alerts.includes(opening),true);assert.ok(s.alerts.length<=100);
 f.progress=1;updateFrontNotice(s,f,.9,notify);assert.equal(s.alerts.filter(a=>a.frontId===f.id).length,1);const resolved=campaignMinutes(s);assert.equal(opening.resolvedAt,resolved);
 setCampaignMinutes(s,resolved+2880);assert.equal(alertVisible(s,opening),false);
 f.progress=.9;updateFrontNotice(s,f,1,notify);assert.notEqual(s.alerts[0].id,opening.id);f.progress=1;updateFrontNotice(s,f,.9,notify);assert.equal(s.alerts[0].resolvedAt,campaignMinutes(s),'a repulsed counterattack still resolves its alert');
 f.progress=.8;updateFrontNotice(s,f,1,notify);updateFrontNotice(s,f,.8,notify,{ceasefire:true});assert.match(s.alerts[0].title,/ceasefire/);assert.equal(s.alerts[0].resolvedAt,campaignMinutes(s));
});
test('land simulation emits associated front notices, retained outside the twelve recent ordinary notices',()=>{
 const [s,c]=start();s.day=day('1939-09-02');s.timeline.polandOccurred=true;s.timeline.polandAt=day('1939-09-01')*1440;
 dailyWorld(s,c,(...args)=>recordFrontAlert(s,...args));const a=s.alerts.find(a=>a.frontId==='poland');assert.ok(a);assert.equal(a.resolvedAt,null);
 for(let i=0;i<15;i++)addAlert(s,'Dispatch '+i,'Routine.');assert.match(alertsView(s,c,null),/Poland: fighting underway/);
});
test('convoy overlay and combat use the same active, same-nation escorts and coverage radius',()=>{
 const make=(id,position,mission='guard',phase='patrol',role='escort')=>({id,kind:'fleet',position,f:{mission,phase,role}});
 const target={id:'JPN',position:[140,20]},rows=[make('JPN',[140,20]),make('JPN',[143,20]),make('USA',[140,20]),make('JPN',[140,20],'raid'),make('JPN',[140,20],'guard','port'),make('JPN',[140,20],'guard','returning'),make('JPN',[140,20],'guard','patrol','submarine')];
 assert.deepEqual(escortsForConvoy(rows,target),[rows[0]]);assert.equal(escortEligible(rows[5]),false);
 const escorts=[{id:'near',position:[140,20],defense:120},{id:'far',position:[143,20],defense:300}];const cover=coverageAt(escorts,target.position);assert.deepEqual(cover.escorts,['near']);assert.equal(cover.defense,120);assert.equal(cover.nearestKm,0);
 for(const p of escortCircle([179.8,45]))assert.ok(Math.abs(distanceNm([179.8,45],p)-ESCORT_RADIUS_NM)<.1);
 const path=polygonPath([escortCircle([179.8,45])]);assert.doesNotMatch(path,/NaN|Infinity/);assert.ok((path.match(/M/g)||[]).length>=2,'coverage wraps across the map seam');
});
test('derived coverage uses actual own fleet positions and never reveals opposing fleets',()=>{
 const [s,c]=start(),n=s.nations.JPN,f=n.fleets.find(f=>!['support','submarine','repair'].includes(f.role)),v=n.convoys[0];f.mission='guard';f.phase='patrol';f.route=[fleetPosition(s,v)];f.departAt=f.arriveAt=campaignMinutes(s);
 const cover=convoyCoverage(s,c);assert.ok(cover.escorts.some(e=>e.id===f.id));assert.ok(cover.convoys.find(x=>x.id===v.id).defense>0);
 assert.ok(cover.escorts.every(e=>n.fleets.some(f=>f.id===e.id)));f.phase='returning';assert.ok(!convoyCoverage(s,c).escorts.some(e=>e.id===f.id));
});
test('real minute advancement crosses midnight and pays a single funded monthly batch',()=>{
 const [s,c]=start(),n=s.nations.JPN;s.decisions=[];s.autoPause=false;n.gold=n.industry=1e8;setCampaignMinutes(s,day('1936-02-01')*1440-1);n.personnelTraining={sailors:99.5,aviators:14.5,lastDay:s.day};const before=n.crew,pilots=n.aviators;
 advanceMinutes(s,c,1);assert.ok(n.crew>before);assert.equal(n.aviators,pilots);const graduated=n.crew;advanceMinutes(s,c,1);assert.equal(n.crew,graduated);
});
