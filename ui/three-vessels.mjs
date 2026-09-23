import { BoxGeometry, BufferGeometry, Float32BufferAttribute, Color, Mesh, MeshStandardMaterial } from './vendor/three/three.module.js';

// Geometry is shared by every instance of a model. A scene must not dispose a
// mesh's shared geometry; call disposeVoxelGeometry3D after unloading/reloading
// the collection instead. Source JSON remains the only ship geometry asset.
const geometries = new Map();
let defaultMaterial;

export function voxelGeometry3D(model) {
  if (geometries.has(model)) return geometries.get(model);
  if (!model || !Array.isArray(model.parts) || !model.parts.length) throw Error('A voxel model with cuboid parts is required.');
  const positions = new Float32Array(model.parts.length * 36 * 3);
  const normals = new Float32Array(positions.length), colors = new Float32Array(positions.length);
  let offset = 0;
  for (const part of model.parts) {
    if (!['x','y','z','w','d','h'].every(key => Number.isFinite(part[key])) ||
      part.w <= 0 || part.d <= 0 || part.h <= 0 || !/^#[\da-f]{6}$/i.test(part.color)) throw Error('Invalid voxel cuboid in ' + model.id);
    // BoxGeometry uses Y-up. Source x/y are horizontal centres and source z is
    // the cuboid's base, so this transform preserves the authored waterline.
    const indexed = new BoxGeometry(part.w,part.h,part.d);
    const box = indexed.toNonIndexed(); indexed.dispose();
    box.translate(part.x,part.z + part.h / 2,part.y);
    positions.set(box.attributes.position.array,offset);
    normals.set(box.attributes.normal.array,offset);
    const color = new Color(part.color); // sRGB asset colors -> linear lighting.
    for (let i=offset;i<offset + 36 * 3;i+=3) {colors[i]=color.r; colors[i+1]=color.g; colors[i+2]=color.b;}
    offset += 36 * 3; box.dispose();
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position',new Float32BufferAttribute(positions,3));
  geometry.setAttribute('normal',new Float32BufferAttribute(normals,3));
  geometry.setAttribute('color',new Float32BufferAttribute(colors,3));
  geometry.computeBoundingBox(); geometry.computeBoundingSphere();
  geometry.name = 'voxel-' + model.id;
  geometry.userData = {modelId:model.id,sourceParts:model.parts.length,axes:'source x -> X, source z -> Y up, source y -> Z'};
  geometries.set(model,geometry);
  return geometry;
}

export function createVoxelMesh(model, materialOrOptions) {
  const supplied = materialOrOptions?.isMaterial ? materialOrOptions : materialOrOptions?.material;
  if (!supplied && !defaultMaterial) defaultMaterial = new MeshStandardMaterial({vertexColors:true,roughness:.85,metalness:.12});
  const mesh = new Mesh(voxelGeometry3D(model),supplied || defaultMaterial);
  mesh.name = model.name || model.id;
  mesh.userData.voxelModelId = model.id;
  mesh.userData.sharedVoxel = true;
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

export function disposeVoxelGeometry3D(model) {
  if (model) {
    const geometry = geometries.get(model);
    if (geometry) {geometry.dispose(); geometries.delete(model);}
    return;
  }
  for (const geometry of geometries.values()) geometry.dispose();
  geometries.clear();
  defaultMaterial?.dispose(); defaultMaterial = null;
}
