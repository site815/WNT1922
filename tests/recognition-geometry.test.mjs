import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { CATALOG } from '../worker/catalog-loader.mjs';

test('original aircraft project identical engine, wing, cockpit and gear stations in all three views', async () => {
  const registry=JSON.parse(await fs.readFile('assets/recognition/originals/aircraft-registry.json'));
  assert(registry.entries.length>=19);
  for(const entry of registry.entries){
    const svg=await fs.readFile(entry.file,'utf8');
    const encoded=svg.match(/<metadata id="shared-airframe">([\s\S]*?)<\/metadata>/)?.[1];
    assert(encoded,entry.id+' shared geometry metadata');
    const model=JSON.parse(encoded.replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&'));
    assert.equal(model.engineCount,model.engines.length);
    assert.equal(model.units,'metres');
    assert(!/<text\b|<image\b|<script\b/.test(svg),entry.id+' geometry only with no painted labels');
    assert.match(svg,/<rect width="1800" height="1160" fill="white"\/>/);
    for(const [view,projection] of Object.entries(model.projections)){
      const start=svg.indexOf('<g id="'+view+'"');
      const end=svg.indexOf('<g id="',start+1);
      const section=svg.slice(start,end<0?svg.length:end);
      const engines=[...section.matchAll(/<g data-feature="engine" data-station="(\d+)" data-projected="([^"]+)" data-center="([^"]+)">/g)];
      assert.equal(engines.length,model.engineCount,entry.id+' '+view+' engine count');
      assert.equal((section.match(/data-feature="wing"/g)||[]).length,model.wing.planes*2,entry.id+' '+view+' wing planes');
      assert.match(section,new RegExp('data-feature="canopy" data-seats="'+model.canopy.seats+'"'));
      assert.equal((section.match(/data-feature="float"/g)||[]).length,model.gear==='twin-floats'?2:0,entry.id+' '+view+' float state');
      assert.equal((section.match(/data-feature="wheel"/g)||[]).length,model.gear==='fixed-wheels'?2:0,entry.id+' '+view+' wheel state');
      for(const engine of engines){
        const station=model.engines[Number(engine[1])],center=[station.x,station.y,station.z];
        engine[3].split(',').map(Number).forEach((value,index)=>assert(Math.abs(value-center[index])<0.0001));
        const expected=projection.axes.map((axis,i)=>projection.origin[i]+model.scale*axis.reduce((sum,value,j)=>sum+value*center[j],0));
        engine[2].split(',').map(Number).forEach((value,index)=>assert(Math.abs(value-expected[index])<0.001,entry.id+' '+view+' projected engine position'));
        if(model.propulsion!=='jet'){
          const geometry=section.slice(engine.index+engine[0].length).match(/^<path d="([^"]+)"/)[1];
          const coordinates=[...geometry.matchAll(/-?\d+(?:\.\d+)?/g)].map(match=>Number(match[0]));
          // The actual nacelle path must be centred on the same transverse / vertical station.
          const dimension=view==='profile'?1:0,values=coordinates.filter((_,index)=>index%2===dimension);
          assert(Math.abs((Math.min(...values)+Math.max(...values))/2-expected[dimension])<0.001,entry.id+' '+view+' actual nacelle geometry');
        }
      }
    }
    if(['hibari_t33','raiden_t39','shinden_t44'].includes(model.id)){
      const aircraft=CATALOG.campaigns.in_good_faith_1936.nations.JPN.aircraft.find(a=>a.id===model.id);
      assert.equal(model.span,aircraft.dimensions.span_m);
      assert.equal(model.length,aircraft.dimensions.length_m);
      assert.equal(model.engineCount,aircraft.powerplant.count);
      assert.equal(model.canopy.seats,aircraft.crew.seats);
      assert(model.tail.x>model.length*.75,'Conventional aft tail, never a canard interpretation');
      if(model.id==='shinden_t44'){
        assert.equal(model.propulsion,'jet');
        assert.equal(model.wing.sweep,40);
        assert(model.engines.every(engine=>engine.propeller===null));
      }
      if(model.id==='raiden_t39')assert(model.engines[0].y<0&&model.engines[1].y>0,'Twin wing-mounted engines');
    }
  }
});
