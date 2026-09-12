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
import { visualMinute, visualFleet } from "../ui/map-motion.mjs";
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
test("visual motion interpolates received minutes, stops under load and snaps correctly on pause", () => {
  const base = { day: 10, fraction: 0, paused: false },
    later = { ...base };
  setCampaignMinutes(later, campaignMinutes(base) + 100);
  const a = { state: base, at: 1000 },
    b = { state: later, at: 1350 };
  assert.equal(visualMinute(a, b, 1350), 14400);
  assert.equal(visualMinute(a, b, 1525), 14450);
  assert.equal(visualMinute(a, b, 2500), 14500);
  assert.equal(visualMinute(a, b, 1300), 14400);
  later.paused = true;
  assert.equal(visualMinute(a, b, 1350), 14500);
  later.paused = false;
  base.paused = true;
  assert.equal(visualMinute(a, b, 1350), 14500);
});
test("visual route transitions use the actual prior route and do not expose enemy movement", () => {
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
    a = { forces: new Map([["own", prior]]) },
    b = { forces: new Map([["own", next]]) };
  assert.equal(visualFleet(a, b, "own", 399), prior);
  assert.equal(visualFleet(a, b, "own", 400), next);
  assert.equal(visualFleet(a, b, "enemy", 400), null);
  assert.equal(visualFleet(a, { forces: new Map() }, "own", 400), null);
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
  const plane = c.nations.USA.aircraft.find((a) => a.type_year > 1936);
  assert.throws(
    () => orderAircraft(s, c, plane.id, 1, "USA"),
    /Development opens/,
  );
  const html = aircraftCatalogView(s, c);
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
