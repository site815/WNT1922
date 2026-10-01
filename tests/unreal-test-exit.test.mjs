import test from 'node:test';
import assert from 'node:assert/strict';
import {compareSavedCampaigns,assertSavedCampaignsEqual} from '../tools/unreal-save-comparison.mjs';

const campaign=()=>({paused:true,savedAt:'first',recoveredSave:false,rng:123,gold:500,log:[{id:'news',text:'Fleet arrived',dismissed:false}],alerts:[{id:'alert',text:'Order ready'}],decisions:[{id:'choice',dismissed:false}]});

test('native cleanup stays strict unless news acknowledgements are explicitly allowed',()=>{
 const prior=campaign(),current=structuredClone(prior);current.savedAt='later';current.log[0].dismissed=true;current.alerts[0].dismissed=true;
 assert.equal(compareSavedCampaigns(prior,current).equal,false);
 const comparison=compareSavedCampaigns(prior,current,{allowNewsAcknowledgements:true});
 assert.equal(comparison.equal,true);assert.equal(comparison.expectedSha256,comparison.actualSha256);
 assert.equal(prior.log[0].dismissed,false);assert.equal(current.log[0].dismissed,true);
});

test('news acknowledgement mode preserves gameplay, decision flags and news contents',()=>{
 for(const change of [state=>state.rng++,state=>state.gold++,state=>state.log[0].text='Changed',state=>state.alerts.push({id:'new'}),state=>state.decisions[0].dismissed=true,state=>state.log[0].details={dismissed:true},state=>state.log[0].read=true]){
  const prior=campaign(),current=structuredClone(prior);change(current);
  assert.equal(compareSavedCampaigns(prior,current,{allowNewsAcknowledgements:true}).equal,false);
 }
});

test('strict disk-versus-served comparison includes save metadata',()=>{
 const prior=campaign(),current=structuredClone(prior);current.savedAt='later';
 assert.equal(compareSavedCampaigns(prior,current).equal,true);
 assert.equal(compareSavedCampaigns(prior,current,{ignoreSaveMetadata:false}).equal,false);
});

test('cleanup mismatches report bounded changed paths and stable hashes, not full campaigns',()=>{
 const prior=campaign(),current=structuredClone(prior);
 for(let i=0;i<100;i++)current['change'+i]='x'.repeat(10000);
 const comparison=compareSavedCampaigns(prior,current);
 assert.equal(comparison.differenceCount,100);assert.equal(comparison.differences.length,8);assert.equal(comparison.truncated,true);
 assert.equal(comparison.differences[0].path,'$.change0');assert.match(comparison.expectedSha256,/^[0-9a-f]{64}$/);
 assert.throws(()=>assertSavedCampaignsEqual(prior,current,'Cleanup mismatch'),error=>error.message.length<2500&&error.message.includes('$.change0'));
 const reordered=Object.fromEntries(Object.entries(prior).reverse());
 assert.equal(compareSavedCampaigns(prior,reordered).equal,true);
});
