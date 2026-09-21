import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { CATALOG } from '../worker/catalog-loader.mjs';

const classes=Object.assign({},...Object.values(CATALOG.campaigns).map(c=>c.classes));
const decode=text=>text.replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
const near=(a,b,message)=>assert.ok(Math.abs(a-b)<.002,message+`: ${a} vs ${b}`);
const originalShips=async()=>({entries:(await Promise.all(['ships-registry.json','planned-ships-registry.json'].map(async file=>JSON.parse(await fs.readFile('assets/recognition/originals/'+file))))).flatMap(registry=>registry.entries)});

test('original ship projections share hull dimensions and actual equipment translations and counts',async()=>{
  const registry=await originalShips();
  assert.equal(registry.entries.length,53);
  for(const entry of registry.entries){
    const svg=await fs.readFile(entry.file,'utf8');
    const geometry=JSON.parse(decode(svg.match(/<metadata id="recognition-geometry">(.*?)<\/metadata>/s)[1]));
    const cl=classes[entry.platforms[0].id],raw=cl.raw||{};
    const stations=[...svg.matchAll(/<g data-station="([^"]+)" data-role="([^"]+)" data-x-m="([^"]+)" transform="translate\(([^ ]+) 0\)">/g)];
    assert.equal(stations.length,geometry.stations.length,entry.id+' actual station count');
    assert.equal((svg.match(/data-hull-view=/g)||[]).length,2);
    near(geometry.hullDatums.profile.x,geometry.hullDatums.plan.x,entry.id+' hull origins');
    near(geometry.hullDatums.profile.length,geometry.hullDatums.plan.length,entry.id+' hull lengths');
    if(raw.dimensions){
      assert.equal(geometry.length_m,raw.dimensions.length_m);
      assert.equal(geometry.beam_m,raw.dimensions.beam_m);
    }else assert.equal(geometry.dimensionsAreIllustrationChoices,true);
    for(const [i,station]of stations.entries()){
      const recorded=geometry.stations[i];
      assert.equal(station[1],recorded.id);
      near(Number(station[3]),recorded.x_m,entry.id+' station in metres');
      near(Number(station[4]),geometry.hullDatums.plan.x+recorded.x_m*geometry.scale_px_per_m,entry.id+' physical projection');
      const section=svg.slice(station.index,stations[i+1]?.index??svg.length);
      assert.equal((section.match(/data-view="profile"/g)||[]).length,1);
      assert.equal((section.match(/data-view="plan"/g)||[]).length,1);
      assert(!/data-view="(?:profile|plan)"[^>]*transform=/.test(section),'No independent view movement');
      if(recorded.role==='main')assert.equal((section.match(/data-main-barrel=/g)||[]).length,recorded.barrels);
      if(recorded.role==='torpedo')assert.equal((section.match(/data-torpedo-tube=/g)||[]).length,recorded.tubes);
      if(recorded.role==='mast')assert.match(section,new RegExp('y1="'+recorded.base_y+'"'),'Mast reaches its supported deck');
    }
    if(!['CV','CVL','CVE'].includes(cl.type))
      assert.equal((svg.match(/data-main-barrel=/g)||[]).length,cl.barrels,entry.id+' fitted main battery');
    const internalTubes=cl.type==='SS'||raw.batteries?.some(b=>b.role==='torpedo'&&/submerged/.test(b.arrangement));
    assert.equal((svg.match(/data-torpedo-tube=/g)||[]).length,internalTubes?0:cl.tubes,entry.id+' exposed versus internal tubes');
    assert.equal(geometry.catapults,raw.aviation?.catapults||0,entry.id+' fitted catapults, excluding reservations');
    const light=raw.batteries?.find(b=>b.role==='light_aa');
    if(light)assert.equal((svg.match(/data-aa-barrel=/g)||[]).length,light.mounts*light.barrels_per_mount,entry.id+' fitted AA');
    if(cl.type==='SS')near(geometry.stations.find(x=>x.role==='conning-tower').base_y,
      geometry.hullDatums.profile.y-geometry.beam_m*geometry.scale_px_per_m*.4489,entry.id+' tower attached to hull');
    if(['CV','CVL','CVE'].includes(cl.type))assert.match(svg,/data-hangar-support="profile"/);
    assert(!/<text\b|<image\b|<script\b/.test(svg));
  }
});

test('original ship major deck fittings do not occupy each other’s footprints',async()=>{
  const registry=await originalShips();
  for(const entry of registry.entries){
    const svg=await fs.readFile(entry.file,'utf8');
    const g=JSON.parse(decode(svg.match(/<metadata id="recognition-geometry">(.*?)<\/metadata>/s)[1]));
    const stations=g.stations.filter(s=>['main','bridge','funnel','torpedo','catapult'].includes(s.role)&&s.length_m&&s.beam_m);
    for(let i=0;i<stations.length;i++)for(let j=i+1;j<stations.length;j++){
      const a=stations[i],b=stations[j];
      const longitudinal=Math.abs(a.x_m-b.x_m)<(a.length_m+b.length_m)/2-.05;
      const transverse=Math.abs((a.lateral_m||0)-(b.lateral_m||0))<(a.beam_m+b.beam_m)/2-.05;
      assert(!(longitudinal&&transverse),entry.id+' overlapping '+a.id+' and '+b.id);
    }
  }
});

test('G3 profile and plan preserve the amidships main turret behind the bridge and before machinery',async()=>{
  const registry=await originalShips();
  for(const id of ['g3','invincible_bc22']){
    const entry=registry.entries.find(e=>e.platforms.some(p=>p.id===id));
    const svg=await fs.readFile(entry.file,'utf8');
    const g=JSON.parse(decode(svg.match(/<metadata id="recognition-geometry">(.*?)<\/metadata>/s)[1]));
    const mains=g.stations.filter(s=>s.role==='main'),bridge=g.stations.find(s=>s.role==='bridge');
    assert.equal(mains.length,3);
    assert(mains[0].x_m<mains[1].x_m&&mains[1].x_m<bridge.x_m&&bridge.x_m<mains[2].x_m);
    assert(g.stations.filter(s=>s.role==='funnel').every(s=>s.x_m>mains[2].x_m));
    assert.equal(mains[2].direction,1);
    assert.equal(g.stations.filter(s=>s.role==='secondary').reduce((n,s)=>n+s.barrels,0),16);
    assert.equal(g.stations.filter(s=>s.role==='light-aa').length,id==='invincible_bc22'?6:0);
    assert.equal(g.catapults,id==='invincible_bc22'?1:0);
  }
});
