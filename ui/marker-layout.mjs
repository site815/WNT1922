// Stable per-unit displacement in screen-scaled map units. Only a collision (or
// cleared space) changes a leader; renderer snapshots never reset its position.
export function movingMarkerLayout(items, offsets, scale, elapsed = 16) {
  const placed = [], result = new Map(), live = new Set();
  const blend = 1 - Math.exp(-Math.max(0, Math.min(100, elapsed)) / 160);
  for (const item of items) {
    live.add(item.id);
    const old = offsets.get(item.id) || item.initial || [0, 0];
    const clear = offset => placed.every(p =>
      Math.hypot(item.point[0] + offset[0] * scale - p.x,
        item.point[1] + offset[1] * scale - p.y) >= (item.radius + p.radius + 2) * scale);
    let target = [0, 0];
    if (!clear(target)) {
      target = old;
      if (!clear(target)) for (let i = 1; i <= 100; i++) {
        const r = Math.sqrt(i) * 18, angle = i * 2.399963;
        target = [Math.cos(angle) * r, Math.sin(angle) * r];
        if (clear(target)) break;
      }
    }
    placed.push({ x:item.point[0]+target[0]*scale, y:item.point[1]+target[1]*scale, radius:item.radius });
    const next = old.map((v,i) => Math.abs(v-target[i]) < .01 ? target[i] : v+(target[i]-v)*blend);
    offsets.set(item.id,next);
    result.set(item.id,next.map(v=>v*scale));
  }
  for (const id of offsets.keys()) if (!live.has(id)) offsets.delete(id);
  return result;
}
