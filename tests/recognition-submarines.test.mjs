import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {CATALOG} from '../worker/catalog-loader.mjs';

const decode=s=>s.replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
test('reference submarines align real equipment projections and keep periscopes supported',async()=>{
  const registry=JSON.parse(await fs.readFile('assets/recognition/originals/submarine-supplement.json'));
  assert.equal(registry.entries.length,5);
  for(const entry of registry.entries){
    const svg=await fs.readFile(entry.file,'utf8');
    const g=JSON.parse(decode(svg.match(/<metadata id="recognition-geometry">(.*?)<\/metadata>/s)[1]));
    const cl=CATALOG.campaigns.campaign_1922.classes[g.platformId];
    assert.equal(g.mainBarrels,cl.barrels,entry.id);
    assert.equal((svg.match(/data-main-barrel=/g)||[]).length,cl.barrels,entry.id+' actual gun count');
    assert.equal(g.internalTorpedoTubes,cl.tubes);
    assert.equal((svg.match(/data-torpedo-tube=/g)||[]).length,0,'Internal tubes are not invented deck equipment');
    const tower=g.stations.find(s=>s.role==='tower');
    for(const scope of g.stations.filter(s=>s.role==='periscope'))
      assert(Math.abs(scope.x_m-tower.x_m)<=tower.length_m/2,entry.id+' periscope inside tower footprint');
    const actual=[...svg.matchAll(/<g data-station="([^"]+)" data-role="([^"]+)" transform="translate\(([^ ]+) 0\)">/g)];
    assert.equal(actual.length,g.stations.length);
    for(const[i,match]of actual.entries()){
      const recorded=g.stations[i];
      assert.equal(match[1],recorded.id);
      assert(Math.abs(Number(match[3])-(g.hullDatums.profile.x+recorded.x_m*g.scale_px_per_m))<.02);
      const chunk=svg.slice(match.index,actual[i+1]?.index??svg.length);
      assert.equal((chunk.match(/data-view="profile"/g)||[]).length,1);
      assert.equal((chunk.match(/data-view="plan"/g)||[]).length,1);
      assert(!/data-view="(?:profile|plan)"[^>]*transform=/.test(chunk));
    }
    assert.equal(g.hullDatums.profile.length,g.hullDatums.plan.length);
    if(g.platformId==='k_class_ss_rn'){
      assert.equal(cl.caliber,101.6);
      assert.equal(cl.barrels,2);
      const guns=g.stations.filter(s=>s.role==='main'),funnels=g.stations.filter(s=>s.role==='funnel');
      assert.equal(funnels.length,2);
      assert(guns[0].x_m<tower.x_m&&tower.x_m<funnels[0].x_m&&funnels[1].x_m<guns[1].x_m);
    }
    if(g.platformId==='m_class_ss_rn')assert(g.stations.find(s=>s.role==='main').x_m<tower.x_m);
    if(g.platformId==='kaichu')assert(g.stations.find(s=>s.role==='main').x_m>tower.x_m);
    assert(!/<image\b|<script\b|<text\b/.test(svg));
  }
});
