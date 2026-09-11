import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as sim from '../src/engine.mjs';
import { contactAlerts } from '../src/contact-alerts.mjs';
import { alertItems, alertsView } from '../src/ministry-view.mjs';
import { recordContact, fleetStats, visibleContacts, applyStandingOrders } from '../src/task-forces.mjs';
import { campaignMinutes, setCampaignMinutes } from '../src/campaign-clock.mjs';
import { validateSave } from '../src/state-io.mjs';
import { automaticDraft } from '../src/designer.mjs';
const c=JSON.parse(fs.readFileSync((process.env.WNT_TEST_PUBLIC||'game/staging')+'/content.json'));
const start=()=>sim.newGame(c,'JPN',120);
function observed(s){Object.assign(s.relations['JPN-USA'],{war:true,allied:false,warSince:s.day});const f=s.nations.USA.fleets[0];s.nations.JPN.contacts=[];return recordContact(s,'JPN','USA',f,[132,5],fleetStats(s,c,'USA',f));}
test('Contact alerts refresh known information, expire at staleness, and do not reveal live positions',()=>{
  const s=start(),contact=observed(s),id='contact-'+contact.id,entry=alertItems(s).find(a=>a.id===id);
  assert.match(entry.body,/132.0°E/);assert.match(entry.body,/approximately/);
  s.nations.USA.fleets[0].route=[[15,60]];
  assert.match(alertItems(s).find(a=>a.id===id).body,/132.0°E/);
  setCampaignMinutes(s,campaignMinutes(s)+48*60);assert.equal(contactAlerts(s).length,1);
  setCampaignMinutes(s,campaignMinutes(s)+1);assert.equal(contactAlerts(s).length,0);assert.equal(visibleContacts(s)[0].stage,'Stale');
  assert.doesNotMatch(alertsView(s,c,id,entry),/class="alert-detail"/,'An open alert must expire too');
  setCampaignMinutes(s,campaignMinutes(s)+120*60);assert.equal(visibleContacts(s).length,0);
});
test('Contact dismissal survives tracking and saves; reacquisition after a stale gap alerts again',()=>{
  const s=start(),contact=observed(s),f=s.nations.USA.fleets[0],id='contact-'+contact.id;
  sim.dismissNotice(s,c,id);assert.equal(contactAlerts(s).length,0);validateSave(s,c);
  setCampaignMinutes(s,campaignMinutes(s)+15);recordContact(s,'JPN','USA',f,[133,6],fleetStats(s,c,'USA',f));assert.equal(contactAlerts(s).length,0);
  setCampaignMinutes(s,campaignMinutes(s)+49*60);recordContact(s,'JPN','USA',f,[136,8],fleetStats(s,c,'USA',f));assert.equal(contactAlerts(s).length,1);
  sim.clearOptionalAlerts(s,c);assert.equal(contactAlerts(s).length,0);assert.ok(s.decisions.every(d=>d.critical));validateSave(s,c);
});
test('Player fleet missions are independent of hidden national priorities; AI missions follow peace and war',()=>{
  const s=start(),n=s.nations.JPN,f=n.fleets.find(f=>f.role==='battle');assert.ok(f);f.manual=false;f.mission='presence';n.priority='decisive';applyStandingOrders(s,c,'JPN');assert.equal(f.mission,'presence');
  const ai=s.nations.USA,other=ai.fleets.find(f=>f.role==='battle');other.manual=false;other.mission='presence';ai.priority='decisive';applyStandingOrders(s,c,'USA');assert.equal(other.mission,'presence');s.relations['JPN-USA'].war=true;other.salt=1;applyStandingOrders(s,c,'USA');assert.equal(other.mission,'decisive');
});
test('Suggested fits follow assigned missions, without a hidden national directive',()=>{
  const s=start(),n=s.nations.JPN;for(const f of n.fleets)f.mission='guard';
  const fit=automaticDraft(s,c,'DD');assert.ok(fit.torpedoes<=6);n.priority='decisive';assert.deepEqual(automaticDraft(s,c,'DD'),fit);
});
