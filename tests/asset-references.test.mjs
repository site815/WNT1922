import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CATALOG} from '../worker/catalog-loader.mjs';
import {assetReference,referencedAsset} from '../mechanics/asset-references.mjs';
import {newGame} from '../mechanics/engine.mjs';
import {buildUnrealScenePacket} from '../ui/unreal-scene-packet.mjs';
import {unrealBattlePacket} from '../ui/unreal-scene.mjs';
import {buildBattleMovie} from '../ui/battle-movie.mjs';
import {createCombat,buildCustomScenario,advanceCombat} from '../combatmechanics/index.mjs';
import {recognitionIndex,loadRecognition,recognitionCard,recognitionThumbnail} from '../ui/recognition.mjs';
import {nativeArtNotice} from '../ui/native-art-status.mjs';

const index=JSON.parse(fs.readFileSync('assets/models/ships/index.json','utf8'));
const models=new Map(index.models.flatMap(model=>model.platforms.map(p=>[(p.campaign?p.campaign+':':'')+p.id,model])));
const historical=Object.values(CATALOG.campaigns).filter(c=>c.scenario.historicalOpening);
test('asset references preserve explicit class fit and source campaign without guessing another catalog',()=>{
  const source={id:'new-class',modelId:'dated-fit',modelCampaign:'original',representativeModel:true};
  assert.deepEqual(assetReference(source,{assetCampaign:'base'},'current'),{modelClassId:'dated-fit',modelCampaign:'original',representativeModel:true});
  const platforms=new Map([['original:dated-fit',1],['dated-fit',2],['other:unknown',3]]);
  assert.equal(referencedAsset(platforms,assetReference(source)),1);
  assert.equal(referencedAsset(platforms,assetReference({id:'unknown'},{},'current')),undefined);
  assert.throws(()=>assetReference({id:'unsafe',modelId:'../other'}),/Invalid/);
});
test('all 44 added historical class references resolve stored detailed assets and world packets retain actual identity',()=>{
  for(const content of historical){
    const definitions=Object.values(content.classes).filter(s=>s.id.startsWith('hist-'));
    assert.equal(definitions.length,44);
    for(const ship of definitions){const asset=referencedAsset(models,assetReference(ship,content.scenario));assert(asset?.file.endsWith('.glb'),ship.id);assert(!asset.id.startsWith('fallback-'),ship.id);}
    for(const nation of Object.keys(content.nations)){
      const state=newGame(CATALOG,nation,4187,content.scenario.id),before=JSON.stringify(state);
      for(const force of buildUnrealScenePacket(state,CATALOG).forces)for(const hull of force.hulls){
        if(force.merchant)continue;
        const definition=content.classes[hull.classId];assert(definition,hull.classId);
        assert.deepEqual({modelClassId:hull.modelClassId,modelCampaign:hull.modelCampaign,representativeModel:hull.representativeModel},assetReference(definition,content.scenario));
        assert(referencedAsset(models,hull),hull.classId);
      }
      assert.equal(JSON.stringify(state),before,'Asset selection does not alter campaigns');
    }
  }
});
test('historical campaign reports without stored asset metadata resolve current, movie and legacy views identically',()=>{
  for(const content of historical){
    const classes=['hist-kgv','hist-hipper'];
    const config=buildCustomScenario(content,{shipsA:[{classId:classes[0],count:1}],shipsB:[{classId:classes[1],count:1}],seed:114});
    const tactical=createCombat(config);advanceCombat(tactical,60);tactical.metadata={};
    const report={id:912,startedAt:0,minute:1,status:'ongoing',tactical,replay:{frames:[{at:0,tacticalSeconds:0},{at:1,tacticalSeconds:60}]}};
    const before=JSON.stringify(report),campaign=content.scenario.id,plan=buildBattleMovie(report);
    const packets=[unrealBattlePacket(report,campaign,1,null),unrealBattlePacket(report,campaign,1,null,true,{plan,key:'movie',elapsedSeconds:0,paused:true})];
    const groups=classes.map((classId,i)=>({id:'group-'+i,classId,type:content.classes[classId].type,count:1,health:1,name:classId}));
    packets.push(unrealBattlePacket({id:913,startedAt:0,replay:{frames:[{at:1,groupsA:[groups[0]],groupsB:[groups[1]]}]}},campaign,0,null));
    for(const packet of packets)for(const unit of packet.units){
      const reference=assetReference(content.classes[unit.classId],content.scenario);
      assert.deepEqual({modelClassId:unit.modelClassId,modelCampaign:unit.modelCampaign,representativeModel:unit.representativeModel},reference);
      assert(referencedAsset(models,unit));
    }
    assert.equal(JSON.stringify(report),before,'Presentation does not rewrite old reports');
  }
});
test('historical aircraft aliases and distinct drawing references remain explicit about representative artwork',async()=>{
  const root='assets/recognition/',manifest=JSON.parse(fs.readFileSync(root+'index.json','utf8'));
  const registries=manifest.registries.map(file=>JSON.parse(fs.readFileSync(root+file,'utf8'))),drawings=recognitionIndex(registries,CATALOG);
  await loadRecognition({refresh:true,catalog:CATALOG,fetcher:async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync('.'+url,'utf8'))})});
  for(const content of historical){
    const aircraft=Object.values(content.nations).flatMap(n=>n.aircraft).filter(a=>a.modelId);
    assert.equal(new Set(aircraft.map(a=>a.id)).size,21);
    for(const plane of aircraft)assert(drawings.platforms.get(content.scenario.id+':aircraft:'+plane.id),plane.id);
    const ship=content.classes['hist-bismarck'],drawing=drawings.platforms.get(content.scenario.id+':ship:'+ship.id);
    assert.equal(drawing.reference.modelClassId,'admiral','Drawing provenance is separate from the Bismarck 3D model');
    assert(drawing.representative);assert(drawing.note.includes(ship.recognitionNote));
    for(const html of [recognitionCard('ship',ship.id,{campaign:content.scenario.id}),recognitionThumbnail('ship',ship.id,{campaign:content.scenario.id})])assert.match(html,/Representative drawing · not this exact class/);
  }
  for(const visualStatus of ['detailed-model','model-not-loaded'])assert.match(nativeArtNotice({visualStatus,representativeModel:true}),/not this exact class/);
  assert.doesNotMatch(nativeArtNotice({visualStatus:'detailed-model'}),/Representative/);
});
