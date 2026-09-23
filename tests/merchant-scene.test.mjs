import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { merchantHullInstances, ownMerchantScene, MERCHANT_MODEL_ID } from '../ui/merchant-scene.mjs';
import { fleetHullInstances } from '../ui/isometric-math.mjs';
import { convoyTraffic } from '../mechanics/convoy-traffic.mjs';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { newGame } from '../mechanics/engine.mjs';
import { validateVoxelModel } from '../ui/voxel-models.mjs';

test('merchant formations keep every real hull and share the naval deterministic spacing without mutating counts', () => {
  const convoy = {id:'convoy-USA-17',name:'Cargo route',count:1201,cargoGRTPerHull:5500};
  const original = structuredClone(convoy), hulls = merchantHullInstances(convoy);
  assert.equal(hulls.length,1201,'no artificial display cap');
  assert.equal(new Set(hulls.map(h => h.key)).size,1201);
  assert.deepEqual(hulls.map(h => h.offset),fleetHullInstances([{id:'dummy',fleetId:'f',name:'Test',count:1201}],'f').map(h => h.offset));
  assert.deepEqual(merchantHullInstances(convoy),hulls);
  assert.deepEqual(convoy,original);
  assert(hulls.every(h => h.classId === MERCHANT_MODEL_ID && h.type === 'AK' && h.convoy === convoy));
  assert(!hulls.some(h => 'crew' in h || 'armament' in h || 'health' in h || 'tons' in h));
  convoy.count = 7;
  assert.deepEqual(merchantHullInstances(convoy).map(h => h.key),hulls.slice(0,7).map(h => h.key),'survivor display identities stay stable');
});

test('merchant scene only expands own underway convoys including waiting and fighting voyages', () => {
  const voyage = (id,extra={}) => ({id,name:id,count:3,leg:'outbound',arriveAt:200,...extra});
  const state = {player:'USA',day:0,nations:{USA:{convoys:[voyage('sailing'),voyage('unloading',{leg:'unloading'}),voyage('arrived',{arriveAt:90}),voyage('waiting',{arriveAt:80,waitingForPort:true}),voyage('engaged',{arriveAt:70,battleId:123}),voyage('lost',{count:0})]}}};
  Object.defineProperty(state.nations,'JPN',{get(){throw Error('Must not read enemy convoys');}});
  const rows = ownMerchantScene(state,100);
  assert.deepEqual(rows.map(r => r.convoy.id),['sailing','waiting','engaged']);
  assert(rows.every(r => r.fleet === r.convoy && r.merchant && r.hulls.length === 3));
  assert.deepEqual(ownMerchantScene(null),[]);
  for (const count of [-1,0,1.2,Infinity,NaN]) assert.deepEqual(merchantHullInstances({id:'bad',count}),[]);
});

test('both campaign scenes agree with the economy actual own merchant hulls at sea', () => {
  for (const campaign of Object.keys(CATALOG.campaigns)) for (const nation of Object.keys(CATALOG.campaigns[campaign].nations)) {
    const state = newGame(CATALOG,nation,3701,campaign), before = JSON.stringify(state);
    assert.equal(ownMerchantScene(state).reduce((sum,row) => sum + row.hulls.length,0),convoyTraffic(state,nation).hullsAtSea);
    assert.equal(JSON.stringify(state),before);
  }
});

test('merchant model is a directly editable original cargo ship with no fabricated military fit', async () => {
  const model = validateVoxelModel(JSON.parse(await fs.readFile('assets/voxels/ships/generic/merchant-freighter.json','utf8')));
  const index = JSON.parse(await fs.readFile('assets/voxels/ships/index.json','utf8'));
  assert.equal(model.id,MERCHANT_MODEL_ID); assert.equal(model.type,'AK');
  assert.equal(index.fallbacks.AK,model.id);
  assert(model.parts.some(p => p.role === 'cargo-hatch') && model.parts.some(p => p.role === 'cargo-derrick'));
  assert(!model.parts.some(p => /barrel|gun|torpedo|turret/.test(p.role)));
  assert.equal(model.reference.license,'Original project artwork');
  assert.match(model.dimensionBasis,/independent of convoy GRT/);
});
