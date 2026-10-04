import test from 'node:test';
import assert from 'node:assert/strict';
import {campaignMapFronts,campaignMapOccupations} from '../ui/campaign-map-fronts.mjs';

test('occupation follows saved advance, survives ceasefire and does not change campaign state',()=>{
 const front={id:'advance',name:'Example',from:[170,10],to:[-170,10],progress:.4,territories:['c220','c220'],attacker:'DEU',defender:'FRA',status:'Contested'};
 const state={world:{fronts:[front,{...front,id:'peace',status:'Ceasefire'},{...front,id:'resolved',progress:1},{...front,id:'repulsed',progress:0}]}};
 const before=structuredClone(state),occupation=campaignMapOccupations(state);
 assert.deepEqual(occupation.map(f=>f.id),['advance','peace']);
 assert.deepEqual(campaignMapFronts(state).map(f=>f.id),['advance']);
 assert.deepEqual(occupation[0].position,[178,10]);
 assert.deepEqual(occupation[0].territories,['c220']);
 assert.match(occupation[0].color,/^#[0-9a-f]{6}$/i);
 front.progress=.1;assert.deepEqual(campaignMapOccupations(state)[0].position,[172,10]);front.progress=.4;
 assert.deepEqual(state,before);
});
