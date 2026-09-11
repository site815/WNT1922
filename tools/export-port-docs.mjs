import fs from 'node:fs';
import assert from 'node:assert/strict';
import {PORTS} from '../game/src/world.mjs';
import {portSpec,PORT_TIERS} from '../game/src/port-catalog.mjs';
import {PROFILES,NATION_ORDER} from '../game/src/catalog.mjs';
const fmt=n=>n.toLocaleString('en-US'),cell=s=>String(s).replaceAll('|','/');
let text=`# Strategic ports

The playable map contains ${Object.keys(PORTS).length} selected ports. Each represents a naval facility and its surrounding commercial access. These are a strategic network, not a complete census of every harbor. The three tiers are **major dock & naval base**, **naval base**, and **minor waystation**. Naval-base and waystation classifications do not mean an absence of small repair facilities: major docks alone supply the weights used to distribute national shipyard throughput.

**Capacity, defensive power and trade values are provisional game weights.** Supply capacity measures supported warship displacement, not historical dock lifting capacity. Artillery is abstract combat power. Aircraft slots are physical capacity; actual stationed models, counts, crews and stores determine aviation power. See docs/base-aviation.md for the operational rules. Trade value is an index, not money or recorded cargo tonnage. Numeric adjustments belong in game/src/port-catalog.mjs; regenerate this document with node tools/export-port-docs.mjs. Opening profiles remain those of the selected campaign; later historical construction is not automatically added.

## Opening facilities

Capacity is in thousands of supported warship tons. A pair reads **1922 / 1936**. The national affiliation is the opening ministry responsible for supply; British imperial and Dominion facilities are grouped under the United Kingdom. Occupation may change their controller during play.

| Nation | Port | 1922 tier | 1936 tier | Capacity (kt) | Artillery power | Aircraft slots | Trade value | Gun reach (km) |
|---|---|---|---|---:|---:|---:|---:|---:|
`;
const entries=Object.entries(PORTS).sort((a,b)=>NATION_ORDER.indexOf(a[1].nation)-NATION_ORDER.indexOf(b[1].nation)||a[1].name.localeCompare(b[1].name));
for(const [id,p]of entries){const a=portSpec({campaignId:'campaign_1922'},id),b=portSpec({campaignId:'in_good_faith_1936'},id);text+='| '+[p.nation,p.name,PORT_TIERS[a.tier],PORT_TIERS[b.tier],fmt(a.capacity/1000)+' / '+fmt(b.capacity/1000),fmt(a.artillery)+' / '+fmt(b.artillery),fmt(a.aircraft)+' / '+fmt(b.aircraft),a.trade+' / '+b.trade,a.gunRangeKm+' / '+b.gunRangeKm].map(cell).join(' | ')+' |\n';}
text+=`
## Historical roles and limits

Manila/Cavite was the Asiatic Fleet’s principal local repair and refueling center; its limited facilities are represented as a naval base. Guam retains a small, weak station at Apra/Piti rather than the much larger base developed during the Pacific war. [US Navy: Philippine bases](https://www.history.navy.mil/browse-by-topic/organization-and-administration/historic-bases/philippine-bases.html), [US Navy: wartime base construction and Guam’s earlier facilities](https://www.history.navy.mil/research/library/online-reading-room/title-list-alphabetically/b/building-the-navys-bases/buidling-navys-bases-vol-2-chapter-26.html).

Singapore’s naval-base scheme was announced in 1923. Its large floating dock was commissioned in 1928; the permanent King George VI graving dock opened in 1938. Therefore the 1922 opening uses commercial/refueling support, and the 1936 opening represents an incomplete naval-base complex. [National Library Board: the two shipyards](https://biblioasia.nlb.gov.sg/vol-15/issue-2/jul-sep-2019/shipyards-keppel-sembawang/), [National Heritage Board: King George VI Dock](https://www.roots.gov.sg/places/places-landing/Places/surveyed-sites/Sembawang-Naval-Base-King-George-VI-Dock).

Article XIX covered the Philippines, Guam, Hong Kong and specified Pacific possessions. Singapore lay west of the British restriction’s 110° east boundary; Hawaii was expressly exempt. The base freeze therefore does not explain Singapore’s construction schedule. [Signed Washington treaty, Article XIX](https://history.state.gov/historicaldocuments/frus1922v01/d77).

San Diego’s early destroyer-base role differs from the major Pacific arsenals at Mare Island and Puget Sound. Pearl Harbor had a permanent dry dock from 1919, although its facilities continued to expand. [US Navy: Naval Base San Diego](https://www.history.navy.mil/browse-by-topic/organization-and-administration/installations/naval-base-san-diego.html), [US Navy archaeological resource study](https://www.history.navy.mil/content/dam/nhhc/research/underwater-archaeology/PDF/UA_ResourcesMgt.pdf).

Scapa Flow is a fleet anchorage; the United Kingdom’s dockyard pool is distributed across mainland and imperial dockyards. Soviet opening capacity is reduced in 1922 to represent revolution and civil-war disruption. The limited map treats the Soviet ministry as responsible for its future Far Eastern network, even though control around Vladivostok was contested at the opening date. Map approaches are offshore routing points and port icons use geographic harbor locations. Canals and detailed commercial cargo destinations are not modeled.

## Per-port notes

`;
for(const [id,p]of entries){const a=portSpec({campaignId:'campaign_1922'},id),b=portSpec({campaignId:'in_good_faith_1936'},id);text+='- **'+p.name+' ('+p.nation+'):** '+(a.note===b.note?b.note:'1922: '+a.note+' 1936: '+b.note)+'\n';}
text+=`
## Connected systems

- **Trade:** sum the nominal trade value of controlled ports × condition × (1 − blockade), then divide by the nation’s opening trade value and cap at 100%. Capture adds usable access; occupation removes it. Enemy forces within approximately 120 km contest access, with stronger siege pressure and resistance from friendly fleets and shore artillery. The assessment is refreshed each game hour.
- **Economy:** domestic share + trade share × shipping coverage × convoy flow × port-trade coverage scales gold, industry and influence income. Effective logistics uses domestic share + trade share × shipping coverage × port-trade coverage. Extra merchant capacity cannot replace closed ports, and extra port access cannot replace lost merchant tonnage.
- **Supply:** accessible port capacity is shared by fleets physically near the port. Distance penalties, occupation, damage and diplomatic access affect availability.
- **Construction:** the national yard pool is multiplied by the condition-weighted surviving capacity of major docks divided by opening major-dock capacity. The player sees one total throughput and one committed/spare/overload graph.
- **Combat:** raid anchorage strikes ships in harbor; siege port sustains facility damage and supply disruption. Shore defenses use actual stationed aircraft, model-specific combat radius, complete crews and finite aviation stocks. Coastal guns use a battery profile, with zero range at unarmed ports. Aircraft ferries and vulnerable merchant transports replenish bases; see [base aviation](base-aviation.md). Naval attacks do not directly capture territory. Separate island campaigns require nearby surface cover and merchant supply; occupation transfers port and trade access.
- **Repair:** safe damaged ports repair automatically after 24 hours without an attack, spending up to 128 gold and 96 industry per day to restore 0.8 percentage points of condition. Smaller damage or budgets scale both work and cost.
`;
const file='docs/strategic-ports.md';if(process.argv.includes('--check'))assert.equal(fs.readFileSync(file,'utf8'),text,'Port document is stale');else fs.writeFileSync(file,text);
const scenario=JSON.parse(fs.readFileSync('data/scenarios/campaign_1922.json'));
const brief='# The Treaty System — national briefings\n\nThe campaign opens on 6 February 1922. These descriptions are the same text used in nation selection; `data/scenarios/campaign_1922.json` owns them. Historical opening fleets include the campaign’s documented construction, disposal and reserve arrangements.\n\n'+NATION_ORDER.map(id=>'## '+PROFILES[id].name+' ('+id+')\n\n'+scenario.country_briefings[id]).join('\n\n')+'\n';
const briefFile='docs/treaty-system-briefings.md';if(process.argv.includes('--check'))assert.equal(fs.readFileSync(briefFile,'utf8'),brief,'National briefings are stale');else fs.writeFileSync(briefFile,brief);
console.log(JSON.stringify({ports:entries.length,periods:2,briefings:NATION_ORDER.length,checked:process.argv.includes('--check')}));
