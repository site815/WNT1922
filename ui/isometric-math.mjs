// The chart is a raised atlas plane. These transforms are also used for mouse
// picking: never infer a geographic position from an untransformed screen pixel.
// Keep the atlas north-up and east/west level; depth comes from pitch and height,
// not a sideways roll of the geographic chart.
export const ISO_ANGLE = 0;
export const ISO_TILT = .68;
export const MAX_SCENE_ZOOM = 256;
export const FLEET_DETAIL_ZOOM = 10;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

export function sceneCamera(chart, viewport) {
  const zoom = clamp(Number(chart.zoom) || 1, 1, MAX_SCENE_ZOOM);
  const scale = Math.max(.05, Math.min(viewport.width / 1270, viewport.height / 560)) * zoom;
  const c = Math.cos(ISO_ANGLE), s = Math.sin(ISO_ANGLE);
  return { a: c * scale, b: s * ISO_TILT * scale, c: -s * scale,
    d: c * ISO_TILT * scale, x: (viewport.x || 0) + viewport.width / 2,
    y: (viewport.y || 0) + viewport.height / 2,
    cx: Number(chart.cx ?? 600), cy: Number(chart.cy ?? 300), zoom, scale };
}
export function scenePoint(camera, point, elevation = 0) {
  const x = point[0] - camera.cx, y = point[1] - camera.cy;
  return [camera.x + camera.a * x + camera.c * y,
    camera.y + camera.b * x + camera.d * y - elevation];
}
export function sceneInverse(camera, point) {
  const x = point[0] - camera.x, y = point[1] - camera.y;
  const det = camera.a * camera.d - camera.b * camera.c;
  return [camera.cx + (camera.d * x - camera.c * y) / det,
    camera.cy + (-camera.b * x + camera.a * y) / det];
}
export function sceneZoomAt(chart, viewport, point, nextZoom) {
  const before = sceneInverse(sceneCamera(chart, viewport), point);
  chart.zoom = clamp(nextZoom, 1, MAX_SCENE_ZOOM);
  const after = sceneInverse(sceneCamera(chart, viewport), point);
  chart.cx = (chart.cx ?? 600) + before[0] - after[0];
  chart.cy = (chart.cy ?? 300) + before[1] - after[1];
  return chart;
}
export function intersectsViewport(bounds, viewport, margin = 0) {
  return bounds.x + bounds.width >= (viewport.x || 0) - margin &&
    bounds.y + bounds.height >= (viewport.y || 0) - margin &&
    bounds.x <= (viewport.x || 0) + viewport.width + margin &&
    bounds.y <= (viewport.y || 0) + viewport.height + margin;
}
export function containsPoint(bounds, point, margin = 0) {
  return point[0] >= bounds.x - margin && point[0] <= bounds.x + bounds.width + margin &&
    point[1] >= bounds.y - margin && point[1] <= bounds.y + bounds.height + margin;
}
export function hullLabel(group, hullIndex) {
  return group.shipNames?.[hullIndex] || (group.count === 1 ? group.name : `${group.name} · hull ${hullIndex + 1}`);
}

// There is no tactical-position data in the strategic simulation. A fixed
// review formation displays every surviving hull, without pretending that these
// offsets are an authoritative battle track. No random numbers or ship caps.
export function fleetHullInstances(groups, fleetId) {
  const rows = groups.filter(g => g.fleetId === fleetId && g.count > 0 &&
    !['sunk', 'scrapped', 'building'].includes(g.status));
  const total = rows.reduce((n, g) => n + Math.max(0, Math.floor(g.count)), 0);
  const columns = Math.max(1, Math.ceil(Math.sqrt(total * .7)));
  const instances = [];
  let index = 0;
  for (const group of rows) {
    for (let hullIndex = 0; hullIndex < Math.floor(group.count); hullIndex++, index++) {
      const row = Math.floor(index / columns), column = index % columns;
      const inRow = Math.min(columns, total - row * columns);
      instances.push({ key: `${group.id}:${hullIndex}`, groupId: group.id,
        classId: group.classId, hullIndex, group, label: hullLabel(group, hullIndex),
        offset: [(column - (inRow - 1) / 2) * 2.75,
          (row - (Math.ceil(total / columns) - 1) / 2) * 1.7] });
    }
  }
  return instances;
}

// Contact markers use only the player's observation list. Enemy groups are
// deliberately absent from this model, even when close enough to draw a hull.
export function ownFleetScene(state) {
  const navy = state?.nations?.[state.player];
  if (!navy) return [];
  return (navy.fleets || []).map(fleet => ({ fleet,
    hulls: fleetHullInstances(navy.groups || [], fleet.id) })).filter(row => row.hulls.length);
}

export function formationBounds(hulls, padding = 3.2) {
  let left = 0, right = 0, top = 0, bottom = 0;
  for (const hull of hulls) {
    left = Math.min(left, hull.offset[0]); right = Math.max(right, hull.offset[0]);
    top = Math.min(top, hull.offset[1]); bottom = Math.max(bottom, hull.offset[1]);
  }
  return { x: left - padding, y: top - padding, width: right - left + padding * 2, height: bottom - top + padding * 2 };
}
export const translatedBounds = (bounds, anchor) => ({ ...bounds, x: bounds.x + anchor[0], y: bounds.y + anchor[1] });

// Whole formations move as a unit into open water. The outward square rings
// visit candidates in distance order, with no random placement and no omitted
// hulls. A conservative rectangle also keeps enlarged bows and superstructures
// clear of a raised coastline. The callback is an O(1) land-mask query.
export function waterFormationAnchor(preferred, bounds, clearWater, occupied = [], cachedOffset = null) {
  const suitable = anchor => {
    const rectangle = translatedBounds(bounds, anchor);
    return clearWater(rectangle) && !occupied.some(other => intersectsViewport(rectangle, other, 1));
  };
  if (suitable(preferred)) return [...preferred];
  if (cachedOffset) {
    const prior = [preferred[0] + cachedOffset[0], preferred[1] + cachedOffset[1]];
    if (suitable(prior)) return prior;
  }
  const step = 3;
  // Usually the first few rings clear a harbour. The wider final rings cover
  // dense fleets in enclosed seas without putting some hulls back over land.
  for (let ring = 1; ring <= 240; ring++) {
    const candidates = [];
    for (let axis = -ring; axis <= ring; axis++) {
      candidates.push([axis, -ring], [axis, ring]);
      if (Math.abs(axis) !== ring) candidates.push([-ring, axis], [ring, axis]);
    }
    candidates.sort((a, b) => a[0] * a[0] + a[1] * a[1] - b[0] * b[0] - b[1] * b[1]);
    for (const [x, y] of candidates) {
      const anchor = [preferred[0] + x * step, preferred[1] + y * step];
      if (suitable(anchor)) return anchor;
    }
  }
  // An unusually large modded fleet can exceed the atlas itself. Keep the full
  // formation in the surrounding ocean, retaining its leader to the real port.
  const bottom = occupied.reduce((value, rectangle) => Math.max(value, rectangle.y + rectangle.height + 3), 700);
  return [preferred[0], bottom - bounds.y];
}

export function landIntegral(alpha, width, height) {
  const stride = width + 1, sums = new Uint32Array(stride * (height + 1));
  for (let y = 0; y < height; y++) {
    let row = 0;
    for (let x = 0; x < width; x++) {
      row += alpha[(y * width + x) * 4 + 3] > 0 ? 1 : 0;
      sums[(y + 1) * stride + x + 1] = sums[y * stride + x + 1] + row;
    }
  }
  return { width, height, sums };
}
export function clearWaterRectangle(mask, bounds) {
  const x0 = Math.max(0, Math.min(mask.width, Math.floor(bounds.x))),
    y0 = Math.max(0, Math.min(mask.height, Math.floor(bounds.y))),
    x1 = Math.max(0, Math.min(mask.width, Math.ceil(bounds.x + bounds.width))),
    y1 = Math.max(0, Math.min(mask.height, Math.ceil(bounds.y + bounds.height))), stride = mask.width + 1;
  return mask.sums[y1 * stride + x1] - mask.sums[y0 * stride + x1] -
    mask.sums[y1 * stride + x0] + mask.sums[y0 * stride + x0] === 0;
}
