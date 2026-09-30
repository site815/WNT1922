import { CATALOG } from "../worker/catalog-loader.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  newGame,
  orderShip,
  clearOptionalAlerts,
} from "../mechanics/engine.mjs";
import { contentFor } from "../mechanics/campaign-content.mjs";
import { contactAlerts } from "../mechanics/contact-alerts.mjs";
import {
  recordContact,
  fleetStats,
  visibleContacts,
  fleetPosition,
} from "../mechanics/task-forces.mjs";
import {
  campaignMinutes,
  setCampaignMinutes,
} from "../mechanics/campaign-clock.mjs";
import { observedNavigation, sampleObservedNavigation } from "../ui/unreal-scene-packet.mjs";
import {
  productionBlock,
  aircraftBlock,
  orderAircraft,
} from "../mechanics/naval-resources.mjs";
import { catalogCountdown } from "../ui/progress-view.mjs";
import { aircraftCatalogView } from "../ui/ministry-view.mjs";
import { fleetReadinessHover, mapHover } from "../ui/inspection-view.mjs";
const bundle = structuredClone(CATALOG);
test("contact alerts follow current war status without erasing peacetime chart intelligence", () => {
  const s = newGame(bundle, "JPN", 120),
    c = contentFor(bundle, s),
    f = s.nations.USA.fleets[0];
  s.nations.JPN.contacts = [];
  recordContact(s, "JPN", "USA", f, [130, 5], fleetStats(s, c, "USA", f));
  assert.equal(contactAlerts(s).length, 0);
  assert.equal(visibleContacts(s).length, 1);
  clearOptionalAlerts(s, c);
  s.relations["JPN-USA"].war = true;
  assert.equal(contactAlerts(s).length, 1);
  s.relations["JPN-USA"].war = false;
  assert.equal(contactAlerts(s).length, 0);
  assert.deepEqual(visibleContacts(s)[0].position, [130, 5]);
});
test("native motion interpolates only received positions and snaps correctly on pause", () => {
  const base = { day: 10, fraction: 0, paused: false },
    later = { ...base };
  setCampaignMinutes(later, campaignMinutes(base) + 100);
  const fleet = {id:'own',route:[[140,25],[150,25]],departAt:14000,arriveAt:16000,speed:20};
  const row = {fleet,sceneScope:'own',scenePaused:false,sceneMinute:14500};
  const prior = {...row,sceneMinute:14400};
  const force = {navigation:observedNavigation(later,row,prior),position:fleetPosition(later,fleet),moving:true};
  for (const [at,expected] of [[14400,14400],[14450,14450],[16000,14500],[13000,14400]]) {
    const point = sampleObservedNavigation(force,at).position;
    const truth = fleetPosition(later,fleet,expected);
    assert(point.every((value,i)=>Math.abs(value-truth[i])<1e-8));
  }
  later.paused = true;
  assert.equal(observedNavigation(later,row,prior).fromAt,14500);
  assert.deepEqual(observedNavigation(later,row,prior).segments,[]);
  later.paused = false;
  prior.scenePaused = true;
  assert.equal(observedNavigation(later,row,prior).fromAt,14500);
});
test("native route transitions use the actual prior route only until a new order departs", () => {
  const prior = {
      id: "own",
      route: [
        [140, 25],
        [150, 25],
      ],
      departAt: 0,
      arriveAt: 2000,
      speed: 20,
    },
    next = {
      ...prior,
      route: [
        [142, 25],
        [145, 30],
      ],
      departAt: 400,
    },
    state = {day:0,paused:false};
  setCampaignMinutes(state,500);
  const oldRow = {fleet:prior,sceneScope:'own',sceneMinute:300,scenePaused:false};
  const row = {fleet:next,sceneScope:'own',sceneMinute:500,scenePaused:false};
  const navigation = observedNavigation(state,row,oldRow);
  assert.equal(navigation.segments.length,2);
  assert.equal(navigation.segments[0].toAt,400);
  assert.deepEqual(navigation.segments[0].from,fleetPosition(state,prior,300));
  assert.deepEqual(navigation.segments[1].from,fleetPosition(state,next,400));
  assert.deepEqual(navigation.segments[1].to,fleetPosition(state,next,500));
  assert.deepEqual(observedNavigation(state,row,{...oldRow,sceneScope:'foreign'}).segments,[]);
  assert.deepEqual(observedNavigation(state,row,null).segments,[]);
});
test("future catalog countdowns never authorize purchases or silently fund qualification", () => {
  const s = newGame(bundle, "USA", 12, "in_good_faith_1936"),
    c = contentFor(bundle, s),
    n = s.nations.USA;
  n.gold = n.industry = 1e8;
  n.influence = 500;
  const future = c.nations.USA.designs
    .map((id) => c.classes[id])
    .find(
      (cl) =>
        cl.year > 1936 &&
        !productionBlock(s, c, cl.id, "USA", { includeFuture: true }),
    );
  assert.ok(future);
  assert.match(catalogCountdown(s, future.year), /Under development/);
  assert.match(productionBlock(s, c, future.id), /Development opens/);
  const before = JSON.stringify(s);
  assert.throws(() => orderShip(s, c, future.id), /Development opens/);
  assert.equal(JSON.stringify(s), before);
  const plane = c.nations.JPN.aircraft.find((a) => a.type_year > 1936);
  assert.throws(
    () => orderAircraft(s, c, plane.id, 1, "JPN"),
    /Development opens/,
  );
  const html = aircraftCatalogView({...s,player:"JPN"}, c);
  assert.ok(
    html.indexOf('class="aircraft-production"') <
      html.indexOf('class="aircraft-models"'),
  );
  assert.equal((html.match(/data-production=/g) || []).length, 3);
  const card = html
    .split('data-model="' + plane.id + '"')[1]
    .split("</article>")[0];
  assert.match(card, /Under development/);
  assert.doesNotMatch(card, /data-action="air-design"|gold|after funding/);
});
test("fleet rows expose readiness on hover while reported contacts only describe observed intelligence", () => {
  const s = newGame(bundle, "USA", 120),
    c = contentFor(bundle, s),
    f = s.nations.USA.fleets[0],
    tip = fleetReadinessHover(s, c, f);
  assert.match(tip, /Training \/ morale/);
  assert.match(tip, /Remaining endurance/);
  assert.doesNotMatch(tip, /FLEET COMPOSITION/);
  const enemy = s.nations.JPN.fleets[0];
  s.nations.USA.contacts = [];
  recordContact(
    s,
    "USA",
    "JPN",
    enemy,
    [135, 10],
    fleetStats(s, c, "JPN", enemy),
  );
  const before = mapHover(s, c, "contact:" + enemy.id);
  enemy.route = [[0, 0]];
  assert.equal(mapHover(s, c, "contact:" + enemy.id), before);
});
