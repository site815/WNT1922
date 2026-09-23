// Prebuilt models contain axis-aligned cuboids in metres. Bow is +X, centreline
// is Y=0, Z points up. Rotate once, then derive every visible face from that same
// geometry, so deck/superstructure/guns cannot disagree between orientations.
const SQRT3_2 = Math.sqrt(3) / 2;
const tint = (hex, factor) => {
  const value = /^#[0-9a-f]{6}$/i.test(hex || '') ? hex : '#87999b';
  return '#' + [1, 3, 5].map(i => Math.max(0, Math.min(255,
    Math.round(parseInt(value.slice(i, i + 2), 16) * factor))).toString(16).padStart(2, '0')).join('');
};
export function voxelFaces(model, { heading = 0, scale = 1 } = {}) {
  const cosine = Math.cos(heading), sine = Math.sin(heading), faces = [];
  const rotate = ([x, y, z]) => [x * cosine - y * sine, x * sine + y * cosine, z];
  const project = ([x, y, z]) => [(x - y) * SQRT3_2 * scale, ((x + y) * .5 - z) * scale];
  for (const part of model?.parts || []) {
    const x0 = part.x - part.w / 2, x1 = part.x + part.w / 2,
      y0 = part.y - part.d / 2, y1 = part.y + part.d / 2,
      z0 = part.z, z1 = part.z + part.h;
    const corners = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
      [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]].map(rotate);
    const sides = [{ ids: [4, 5, 6, 7], light: 1.15, normal: [0, 0, 1] },
      { ids: [1, 2, 6, 5], light: .9, normal: [1, 0, 0] },
      { ids: [3, 0, 4, 7], light: .68, normal: [-1, 0, 0] },
      { ids: [2, 3, 7, 6], light: .72, normal: [0, 1, 0] },
      { ids: [0, 1, 5, 4], light: .85, normal: [0, -1, 0] }];
    for (const side of sides) {
      const normal = rotate(side.normal);
      if (!normal[2] && normal[0] + normal[1] <= 1e-8) continue;
      const vertices = side.ids.map(i => corners[i]);
      faces.push({ points: vertices.map(project), color: tint(part.color, side.light),
        depths: vertices.map(p => p[0] + p[1] + p[2]),
        depth: vertices.reduce((n, p) => n + p[0] + p[1] + p[2], 0) / 4,
        role: part.role || 'hull' });
    }
  }
  return faces.sort((a, b) => a.depth - b.depth);
}
export function voxelBounds(faces) {
  let x = Infinity, y = Infinity, right = -Infinity, bottom = -Infinity;
  for (const face of faces) for (const point of face.points) {
    x = Math.min(x, point[0]); y = Math.min(y, point[1]);
    right = Math.max(right, point[0]); bottom = Math.max(bottom, point[1]);
  }
  return Number.isFinite(x) ? { x, y, width: right - x, height: bottom - y } : { x: 0, y: 0, width: 0, height: 0 };
}

// Face-centre painter sorting fails for overhanging flight decks and long gun
// barrels. Rasterise the same projected cuboids with a depth buffer once, then
// reuse that tiny sprite. This also makes different camera headings consistent.
export function voxelRaster(model, { heading = 0, scale = 1, pixelRatio = 1 } = {}) {
  const faces = voxelFaces(model, { heading, scale }), bounds = voxelBounds(faces);
  const width = Math.max(1, Math.ceil((bounds.width + 2) * pixelRatio)),
    height = Math.max(1, Math.ceil((bounds.height + 2) * pixelRatio));
  const data = new Uint8ClampedArray(width * height * 4), depth = new Float32Array(width * height).fill(-Infinity);
  for (const face of faces) {
    const points = face.points.map(p => [(p[0] - bounds.x + 1) * pixelRatio, (p[1] - bounds.y + 1) * pixelRatio]);
    const color = [1, 3, 5].map(i => parseInt(face.color.slice(i, i + 2), 16));
    for (const triangle of [[0, 1, 2], [0, 2, 3]]) {
      const [a, b, c] = triangle.map(i => points[i]);
      const divisor = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
      if (Math.abs(divisor) < 1e-10) continue;
      const minX = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0]))), maxX = Math.min(width - 1, Math.ceil(Math.max(a[0], b[0], c[0]))),
        minY = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1]))), maxY = Math.min(height - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
      for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
        const px = x + .5, py = y + .5;
        const u = ((b[1] - c[1]) * (px - c[0]) + (c[0] - b[0]) * (py - c[1])) / divisor;
        const v = ((c[1] - a[1]) * (px - c[0]) + (a[0] - c[0]) * (py - c[1])) / divisor, w = 1 - u - v;
        if (u < -1e-7 || v < -1e-7 || w < -1e-7) continue;
        const z = u * face.depths[triangle[0]] + v * face.depths[triangle[1]] + w * face.depths[triangle[2]], index = y * width + x;
        if (z < depth[index] - 1e-5) continue;
        depth[index] = z; data[index * 4] = color[0]; data[index * 4 + 1] = color[1]; data[index * 4 + 2] = color[2]; data[index * 4 + 3] = 255;
      }
    }
  }
  return { data, width, height, bounds: { ...bounds, x: bounds.x - 1, y: bounds.y - 1 }, pixelRatio };
}
const rasterCache = new WeakMap();
function browserSprite(ctx, model, scale, heading) {
  if (!globalThis.document?.createElement || !ctx.getTransform) return null;
  const transform = ctx.getTransform(), ratio = Math.min(2, Math.max(1, Math.hypot(transform.a, transform.b)));
  let cache = rasterCache.get(model); if (!cache) { cache = new Map(); rasterCache.set(model, cache); }
  const key = `${scale.toFixed(5)}:${heading.toFixed(5)}:${ratio.toFixed(2)}`;
  if (cache.has(key)) return cache.get(key);
  const raster = voxelRaster(model, { scale, heading, pixelRatio: ratio });
  const canvas = document.createElement('canvas'); canvas.width = raster.width; canvas.height = raster.height;
  const context = canvas.getContext('2d'), image = context.createImageData(raster.width, raster.height); image.data.set(raster.data); context.putImageData(image, 0, 0);
  const sprite = { canvas, bounds: raster.bounds, ratio };
  if (cache.size >= 24) cache.delete(cache.keys().next().value); cache.set(key, sprite); return sprite;
}
export function drawVoxelShip(ctx, model, { x = 0, y = 0, scale = 1, heading = 0,
  selected = false, alpha = 1, outline = false } = {}) {
  const faces = voxelFaces(model, { heading, scale }), bounds = voxelBounds(faces);
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= alpha;
  if (selected) {
    ctx.strokeStyle = '#efcf88'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(0, 2, Math.max(8, bounds.width * .62),
      Math.max(4, bounds.height * .38), 0, 0, Math.PI * 2); ctx.stroke();
  }
  const sprite = browserSprite(ctx, model, scale, heading);
  if (sprite) ctx.drawImage(sprite.canvas, sprite.bounds.x, sprite.bounds.y, sprite.canvas.width / sprite.ratio, sprite.canvas.height / sprite.ratio);
  else for (const face of faces) {
      ctx.beginPath(); face.points.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath();
      ctx.fillStyle = face.color; ctx.fill();
      if (outline) { ctx.strokeStyle = '#10232a66'; ctx.lineWidth = .5; ctx.stroke(); }
    }
  ctx.restore(); return { ...bounds, x: bounds.x + x, y: bounds.y + y };
}
