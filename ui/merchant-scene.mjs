import { campaignMinutes } from '../mechanics/campaign-clock.mjs';
import { convoyUnderway } from '../mechanics/convoy-traffic.mjs';
import { fleetHullInstances } from './isometric-math.mjs';

export const MERCHANT_MODEL_ID = 'merchant-freighter';
export const MERCHANT_SCENE_NOTE = 'One representative freighter per surviving convoy hull. Merchant GRT is an aggregate registered-volume measure; the model does not imply individual dimensions, crew or armament.';

// A convoy stores a surviving count, not named individual ships. Stable indices
// are display identities only, just as they are for a naval ship group.
export function merchantHullInstances(convoy) {
  if (!convoy?.id || !Number.isSafeInteger(convoy.count) || convoy.count <= 0) return [];
  const formation = fleetHullInstances([{id:convoy.id,fleetId:convoy.id,classId:MERCHANT_MODEL_ID,
    count:convoy.count,name:convoy.name || 'Merchant convoy',status:'active'}], convoy.id);
  return formation.map(({hullIndex,offset}) => ({
    key:`merchant:${convoy.id}:${hullIndex}`,groupId:convoy.id,convoyId:convoy.id,
    classId:MERCHANT_MODEL_ID,type:'AK',merchant:true,hullIndex,convoy,
    label:`${convoy.name || 'Merchant convoy'} · merchant hull ${hullIndex + 1}`,offset,
  }));
}

// Only the player's active voyages enter the scene. Idle national merchant
// capacity, unloading packets and enemy convoy records are never expanded.
export function ownMerchantScene(state, minute = state ? campaignMinutes(state) : 0) {
  const navy = state?.nations?.[state.player];
  if (!navy) return [];
  return (navy.convoys || []).filter(convoy => convoyUnderway(convoy,minute))
    .map(convoy => ({fleet:convoy,convoy,merchant:true,hulls:merchantHullInstances(convoy)}))
    .filter(row => row.hulls.length);
}
