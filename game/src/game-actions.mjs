import { orderBulkFleet } from './bulk-fleet.mjs';
import * as sim from './engine.mjs';
import { contentFor } from './campaign-content.mjs';
import { commissionDraft } from './designer.mjs';
import { orderAircraft, setFacilityFunding, setProductionModel, SPEEDS } from './naval-resources.mjs';

// Only serializable commands cross the worker boundary. UI callbacks never run
// simulation code, including manual time steps, procurement or fleet orders.
export function applyCommand(s,bundle,{type,args={}}){
 const c=contentFor(bundle,s),n=s.nations[s.player];
 switch(type){
 case 'pause':if((args.value===false||args.value===undefined&&s.paused)&&s.decisions.some(d=>d.forcePause))throw Error('Acknowledge the diplomatic dispatch before resuming.');s.paused=args.value??!s.paused;delete s.pauseReason;delete s.resumeAfterDecision;break;
 case 'speed':if(!SPEEDS.some(([v])=>v===args.value))throw Error('Unknown simulation speed.');s.speed=args.value;break;
 case 'step':if(s.decisions.some(d=>d.forcePause))throw Error('Acknowledge the diplomatic dispatch before stepping time.');if(![1,60].includes(args.minutes))throw Error('Invalid time step.');s.paused=false;sim.advanceMinutes(s,bundle,args.minutes,{respectPause:true});s.paused=true;delete s.resumeAfterDecision;break;
 case 'settings':for(const [key,value]of Object.entries(args)){if(['audioEnabled','musicEnabled','autoPause'].includes(key)&&typeof value==='boolean')s[key]=value;else if(['audioVolume','musicVolume'].includes(key)&&Number.isFinite(value)&&value>=0&&value<=1)s[key]=value;else throw Error('Invalid game setting.');}break;
 case 'funding':setFacilityFunding(s,args.field,args.value);break;
 case 'production':setProductionModel(s,c,args.role,args.model);break;
 case 'air-design':orderAircraft(s,c,args.id,1,s.player,{development:true});break;
 case 'commission-draft':{const r=commissionDraft(s,c,args.recipe);sim.addLog(s,r.ship.name+' draft registered. '+r.fee+' gold paid.','industry');return {name:r.ship.name,fee:r.fee};}
 case 'fleet-order':sim.issueFleetOrder(s,c,args.id,args.mission,args.aggressive);break;
 case 'order':sim.orderShip(s,c,args.id,args.count);break;
 case 'develop':sim.developDesign(s,c,args.id);break;
 case 'project':sim.startProject(s,args.id);break;
 case 'cancel':sim.cancelOrder(s,args.id);break;
 case 'bulk-fleet':return orderBulkFleet(s,c,args.ids,args.mode);
 case 'reserve':sim.reserveGroup(s,args.id,c);break;
 case 'scrap':sim.scrapGroup(s,c,args.id);break;
 case 'diplomatic':return sim.diplomaticAction(s,args.id,args.kind,s.player,c);
 case 'treaty':sim.setTreatyPolicy(s,args.policy);break;
 case 'dismiss-alert':sim.dismissNotice(s,c,args.id);break;
 case 'clear-alerts':sim.clearOptionalAlerts(s,c);break;
 case 'choose':{const d=s.decisions.find(d=>d.key===args.key),o=d?.options.find(o=>o.id===args.id);sim.chooseDecision(s,c,args.key,args.id);return {receipt:o?.label+'. '+o?.detail};}
 default:throw Error('Unknown command: '+type);
 }
 return null;
}
