import {readDocument} from '../worker/documents.mjs';
import {openingTimeline} from './campaign-clock.mjs';

const [starts, politics, land, events] = await Promise.all([
  readDocument('common/historical/starts.md'), readDocument('common/rules/war-politics.md'),
  readDocument('common/rules/land-war.md'), readDocument('common/events.md'),
]);
const day = iso => Date.parse(iso)/86400000;
const key = (a,b) => [a,b].sort().join('-');

// Called only by newGame, before fleets, bases and resources are initialized.
// Save migration must never replay an opening or restore historical losses.
export function applyHistoricalOpening(state, content) {
  const opening = starts[content.scenario.id];
  if (!opening) return;
  state.timeline = openingTimeline(state.seed, state.campaignId);
  state.timeline.polandOccurred = state.day*1440 >= state.timeline.polandAt;
  state.timeline.europeOccurred = state.day*1440 >= state.timeline.britainAt;
  state.world = {revision:1,fronts:[],control:{...opening.control},portControl:{...opening.portControl},
    stationControl:{...opening.stationControl},openingControl:{...opening.control},openingPortControl:{...opening.portControl},openingDay:state.day,changes:[]};
  for (const [id, progress] of Object.entries(opening.fronts)) {
    const definition = land.CAMPAIGNS.find(f=>f.id===id);
    if (!definition) throw Error(`Unknown historical opening front: ${id}`);
    state.world.fronts.push({...structuredClone(definition),progress,momentum:0,
      attackerSupply:.7,defenderSupply:.7,started:definition.start,
      lastOutcome:progress>=1?'Occupied':null,status:progress>=1?'Occupied':'Contested',
      offensiveActive:progress>0&&progress<1});
  }
  for (const war of opening.wars) {
    const relation=state.relations[key(...war.pair)];
    if (!relation) throw Error('Historical war uses an unsupported navy.');
    Object.assign(relation,{war:true,allied:false,warSince:Math.floor(day(war.since)),truceUntil:state.day});
  }
  for(const [nation,rival] of Object.entries(opening.rivals))state.nations[nation].rival=rival;
  // Dates before the snapshot are already history, not a queue of delayed news
  // or declarations to be executed again on the first operational tick.
  for (const event of [...politics.PACT_EVENTS,...politics.WORLD_NEWS])
    if(day(event.date)<state.day)state.completedEvents.push('historical-news-'+event.id);
  for (const event of politics.HISTORICAL_WARS)
    if(day(event.date)<state.day)state.completedEvents.push(event.key);
  for(const [nation,n]of Object.entries(state.nations))for(const event of events)
    if(event.date&&day(event.date)<state.day&&!event.months){
      const completed=nation===state.player?state.completedEvents:(n.completedDecisions??=[]);
      if(!completed.includes(event.key))completed.push(event.key);
    }
}
