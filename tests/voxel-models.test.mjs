import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {CATALOG} from '../worker/catalog-loader.mjs';
import {validateVoxels} from '../tools/check-voxels.mjs';
import {loadVoxelModels, voxelModelFor, validateVoxelModel, voxelModelIndex} from '../ui/voxel-models.mjs';

const fileFetcher = async (url, options) => {
  assert(url.startsWith('/assets/voxels/ships/') && !url.includes('..'));
  assert.equal(options.cache, 'no-store');
  return {ok: true, json: async () => JSON.parse(await fs.readFile('.' + url, 'utf8'))};
};

test('prebuilt voxel files cover every authored class, opening legacy hull and campaign conversion', async () => {
  const result = await validateVoxels({catalog: CATALOG});
  assert.equal(result.classTypes, 166);
  assert.equal(result.campaignMappings, 281);
  assert.equal(result.fallbackTypes, 13);
  assert(result.openingLegacyGroups > 0);
  assert(result.maxParts <= 512);
});

test('voxel loader reads editable assets directly, limits concurrency and keeps campaign fits distinct', async () => {
  let active = 0, peak = 0, reads = 0;
  const fetcher = async (...args) => {
    active++; reads++; peak = Math.max(peak, active);
    try {
      const response = await fileFetcher(...args), value = await response.json();
      return {ok:true,json:async () => value};
    } finally { active--; }
  };
  const collection = await loadVoxelModels({refresh: true, fetcher});
  assert.equal(reads, collection.models.size + 1);
  assert(peak >= 2 && peak <= 8);
  assert.equal(voxelModelFor('courageous_llc', {campaign:'campaign_1922'}).type, 'BC');
  assert.equal(voxelModelFor('courageous_llc', {campaign:'in_good_faith_1936'}).type, 'CV');
  assert.equal(voxelModelFor('custom', {type:'CV'}).id, 'fallback-cv');
  assert.equal(voxelModelFor('custom', {type:'invalid'}).id, 'fallback-dd');
  assert.equal(await loadVoxelModels({fetcher:() => {throw Error('Should be cached');}}), collection);
});

test('failed model refresh preserves loaded ships and rejects executable colors and out-of-bounds geometry', async () => {
  await loadVoxelModels({refresh: true, fetcher: fileFetcher});
  const previous = voxelModelFor('queen_elizabeth', {campaign:'campaign_1922'});
  await assert.rejects(loadVoxelModels({refresh:true,fetcher:async () => ({ok:false,status:404})}), /unavailable/);
  assert.equal(voxelModelFor('queen_elizabeth', {campaign:'campaign_1922'}), previous);
  await assert.rejects(loadVoxelModels({refresh:true,fetcher:async (...args) => {
    const response = await fileFetcher(...args), value = await response.json();
    if (value.id === 'queen_elizabeth') value.parts[0].color = 'invalid';
    return {ok:true,json:async () => value};
  }}), /Invalid voxel part/);
  assert.equal(voxelModelFor('queen_elizabeth', {campaign:'campaign_1922'}), previous);
  for (const mutation of [
    model => {model.parts[0].color = 'url(https://invalid)';},
    model => {model.parts[0].x = Infinity;},
    model => {model.parts[0].w = model.dimensions.length * 2;},
    model => {model.parts[0].z = -1;},
  ]) {
    const model = structuredClone(previous); mutation(model);
    assert.throws(() => validateVoxelModel(model), /Invalid voxel part/);
  }
  const index = {format:1, models:[{id:previous.id,file:'../outside.json',platforms:[]}],fallbacks:{}};
  assert.throws(() => voxelModelIndex(index, new Map([[previous.id,previous]])), /Invalid voxel model mapping/);
});

test('shared geometry preserves distinctive armament and equipment rather than assigning one hull to every type', async () => {
  await loadVoxelModels({refresh:true,fetcher:fileFetcher});
  const model = id => voxelModelFor(id, {campaign:'in_good_faith_1936'});
  const republic = model('republic_bb41'), nelson = model('nelson'), pt = model('ecole_pt32'), sub = model('i_series_t33');
  assert.equal(republic.parts.filter(p => p.role === 'main').length, 6);
  assert.equal(republic.parts.filter(p => p.role === 'main-barrel').length, 18);
  assert(nelson.parts.filter(p => p.role === 'main').every(p => p.x > 0), 'Nelson battery remains forward');
  assert.equal(pt.parts.filter(p => p.role === 'torpedo-tube').length, 6);
  assert(!sub.parts.some(p => p.role === 'main-barrel' || p.role === 'funnel'), 'Gunless diesel submarine stays gunless');
  assert(republic.dimensions.length > pt.dimensions.length * 5);
  for (const id of ['akagi_cv','kaga_cv']) {
    const carrier = model(id);
    assert(carrier.parts.some(p => p.role === 'middle-flight-deck') && carrier.parts.some(p => p.role === 'lower-flight-deck'), 'Early carrier keeps three flight-deck levels');
    assert(!carrier.parts.some(p => p.role === 'island'), 'Early carrier keeps its islandless fit');
  }
  assert.equal(model('eagle').parts.filter(p => p.role === 'funnel').length, 2);
  assert.equal(model('hosho').parts.filter(p => p.role === 'hinged-exhaust').length, 3);
});
