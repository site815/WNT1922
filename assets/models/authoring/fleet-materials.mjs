import fs from 'node:fs/promises';
import {createAuthoredMesh} from './authored-mesh.mjs';
const cache=new Map(),woodTypes=new Set(['BB','BC','CA','CL','CV','CVL']);
// A common physically scaled surface treatment. Geometry and historical paint
// colors stay class-specific; maps distinguish materials instead of flat tint.
export async function createNavalMesh(spec){
  spec.indexVertices=true;spec.curveToleranceMetres=.003;
  const timber=spec.deckFinish==='timber'||(!spec.deckFinish&&woodTypes.has(spec.type));
  const used=new Set();
  for(const [name,m]of Object.entries(spec.materials)){
    for(const key of ['baseColorTexture','normalTexture','metallicRoughnessTexture','occlusionTexture'])delete m[key];
    if(name==='glass')continue;
    const finish=name==='deck'?(timber?'timber':'steel-deck'):name==='upperdeck'?'steel-deck':name==='canvas'?'canvas':'paint';used.add(finish);
    m.baseColorTexture=finish+'-albedo';m.normalTexture=finish+'-normal';m.normalScale=finish==='timber'?.8:finish==='steel-deck'?.6:.65;
    if(m.metallic<.5){m.metallicRoughnessTexture=finish+'-orm';m.occlusionTexture=finish+'-orm';m.roughness=1;}
    if(name==='deck'&&timber)m.color=[.42,.39,.33,1];
  }
  spec.materialSources=[{name:'Original fleet paint, timber, nonslip decking and canvas PBR maps',author:'WNT1922',license:'Original project artwork',manifest:'assets/models/textures/fleet-surfaces/source.json',usage:'Embedded physically scaled albedo, OpenGL normal and packed occlusion/roughness/metalness. Original inferred weathering, not an exact camouflage or refit claim.'}];
  spec.sources=spec.sources?.filter(s=>!s.url?.includes('polyhaven.com')).map(s=>s.file?.includes('textures/naval-paint')?{...s,title:'Original WNT1922 fleet surface library',file:'assets/models/textures/fleet-surfaces/source.json',usedFor:'Original physically scaled PBR surface treatment; inferred wear, not measured class-specific plating.'}:s);
  spec.surfaceProfile={version:1,tileMetres:spec.textureMetres||2.5,textureSize:256,deckFinish:timber?'timber':'steel-deck',curveToleranceMetres:spec.curveToleranceMetres,geometryPolicy:'Preserve hull loft, fittings and weapon stations. Reduced cylinder and ring tessellation adds at most 3 mm radial error; already coarser original fittings are unchanged. Lossless Float32 vertex indexing preserves UV and hard-normal seams.'};
  const mesh=createAuthoredMesh(spec);
  for(const finish of used)for(const role of ['albedo','normal','orm']){const name=finish+'-'+role;if(!cache.has(name))cache.set(name,await fs.readFile(new URL('../textures/fleet-surfaces/'+name+'.png',import.meta.url)));mesh.addTexture(name,cache.get(name));}
  return mesh;
}
