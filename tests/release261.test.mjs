import test from "node:test";
import assert from "node:assert/strict";
import { CATALOG } from "../worker/catalog-loader.mjs";
import { newGame, shipOrderBlock, shipPrice, yardLoad } from "../mechanics/engine.mjs";
import { contentFor } from "../mechanics/campaign-content.mjs";
import { setCampaignMinutes } from "../mechanics/campaign-clock.mjs";
import { applyCommand } from "../mechanics/game-actions.mjs";
import { aircraftSummary, aircraftBlock, planeRole } from "../mechanics/naval-resources.mjs";
import { sailorSummary } from "../mechanics/ship-staffing.mjs";
import { validateSave } from "../mechanics/state-io.mjs";
import { topBars } from "../ui/top-bars.mjs";
import { aircraftCatalogView } from "../ui/ministry-view.mjs";
import { resourceHover } from "../ui/resource-breakdown.mjs";

const at = (s, year) => setCampaignMinutes(s, Date.UTC(year, 0, 1) / 60000);
const number = value => Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 });
const strip = html => html.replace(/<[^>]+>/g, "");

test("all fourteen starts use calendar availability for player and AI catalogs", () => {
  for (const campaign of Object.keys(CATALOG.campaigns)) {
    for (const id of Object.keys(CATALOG.campaigns[campaign].nations)) {
      const s = newGame(CATALOG, id, 261, campaign), c = contentFor(CATALOG, s), n = s.nations[id];
      const opening = new Date(s.day * 86400000).getUTCFullYear();
      Object.assign(n, { gold: 1e8, industry: 1e8, influence: 1e6, strategic: 1e8 });
      const ships = c.nations[id].designs.map(key => c.classes[key]).filter(cl => cl.year > opening);
      const planes = c.nations[id].aircraft.filter(a => a.type_year > opening);
      for (const year of [...new Set([...ships.map(cl => cl.year), ...planes.map(a => a.type_year)])].sort((a,b) => a-b)) {
        at(s, year-1);
        for (const cl of ships.filter(cl => cl.year === year)) assert.match(shipOrderBlock(s,c,cl.id,id), /Development opens/);
        for (const a of planes.filter(a => a.type_year === year)) assert.match(aircraftBlock(s,c,a.id,id), /Development opens/);
        at(s, year);
        const cash = n.gold;
        for (const a of planes.filter(a => a.type_year === year)) {
          assert.equal(aircraftBlock(s,c,a.id,id), "");
          const role = planeRole(a) === "multirole" ? "fighter" : planeRole(a);
          applyCommand(s, CATALOG, { type:"production", args:{ role, model:a.id } }, id);
        }
        assert.equal(n.gold, cash, "Calendar availability and model selection are free");
        assert.equal(n.projects.length, 0);
        assert.equal(n.airOrders.length, 0);
        const cl = ships.find(cl => cl.year === year && !shipOrderBlock(s,c,cl.id,id));
        if (cl) {
          const price = shipPrice(s,c,cl.id,1,id);
          applyCommand(s,CATALOG,{type:"order",args:{id:cl.id,count:1}},id);
          assert.equal(n.gold,cash-price.gold,"Only hull construction is charged");
        }
        assert.doesNotMatch(aircraftCatalogView(s,c), /data-action="air-design"|Develop aircraft model/);
      }
      const snapshot = structuredClone(n);
      for(const type of ["develop","air-design"]) assert.throws(() => applyCommand(s,CATALOG,{type,args:{id:"unused"}},id),/Unknown command/);
      assert.deepEqual(n,snapshot,"Retired unlock commands cannot charge resources");
      validateSave(s,CATALOG);
    }
  }
});

test("four resource counters show exact total and reserve, including staffing deficits", () => {
  for (const campaign of Object.keys(CATALOG.campaigns)) for (const id of Object.keys(CATALOG.campaigns[campaign].nations)) {
    const s=newGame(CATALOG,id,261,campaign),c=contentFor(CATALOG,s),n=s.nations[id];
    for(const deficit of [false,true]) {
      if(deficit) { n.crew=0; n.aviators=0; }
      const air=aircraftSummary(s,c),crew=sailorSummary(s,c),yard=yardLoad(s,c),html=topBars(s,c);
      for(const [key,total,reserve] of [["YARDS",yard.capacity*365,yard.spare*365],["SAILORS",crew.total,crew.balance],["AVIATORS",n.aviators,air.aviatorBalance],["AIRCRAFT",air.total,air.reserve]]) {
        const section=html.split('data-resource="'+key+'"')[1].split('</div>')[0];
        assert(section.includes('resource-reserve'));
        assert(strip(section).includes(number(total)+'('+(reserve<0?'−':'+')+number(Math.abs(reserve))+')'));
        assert.doesNotMatch(resourceHover(s,c,key),/NaN|undefined|Infinity/);
      }
    }
  }
});
