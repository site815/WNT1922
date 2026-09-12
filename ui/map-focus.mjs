import {
  NODES,
  PORT_LOCATIONS,
  MAP_CAPITALS,
  HOME_PORT,
} from "../mechanics/world.mjs";
import { fleetPosition, visibleContacts } from "../mechanics/task-forces.mjs";
import { frontPosition } from "../mechanics/land-war.mjs";
import { mapPoint, wrapLongitude } from "./projection.mjs";
export function chartPosition(s, data, kind, id) {
  const n = s.nations[s.player];
  if (kind === "fleet")
    return (
      n.fleets.find((f) => f.id === id) &&
      fleetPosition(
        s,
        n.fleets.find((f) => f.id === id),
      )
    );
  if (kind === "ship") {
    const g = n.groups.find((g) => g.id === id);
    if (!g) return null;
    const f = n.fleets.find((f) => f.id === g.fleetId);
    return f ? fleetPosition(s, f) : NODES[g.dockPort || HOME_PORT[s.player]];
  }
  if (kind === "port") return PORT_LOCATIONS[id] || NODES[id];
  if (kind === "country") return MAP_CAPITALS[id]?.point;
  if (kind === "territory")
    return data.features.find((t) => t.id === id)?.point;
  if (kind === "front") {
    const f = s.world?.fronts.find((f) => f.id === id);
    return f && frontPosition(f);
  }
  if (kind === "contact")
    return visibleContacts(s).find((t) => t.id === id)?.position;
  if (kind === "convoy") {
    const v = n.convoys.find((v) => v.id === id);
    return v && fleetPosition(s, v);
  }
  return null;
}
export function centerChart(chart, point, { zoom = false } = {}) {
  if (!point) return;
  chart.rotation = point[0];
  chart.cx = 600;
  chart.cy = mapPoint(point, point[0])[1];
  chart.focusPoint = [...point];
  if (zoom) chart.zoom = Math.min(64, Math.max(2, chart.zoom * 2));
}
export function chartCoordinates(point, rotation = 0) {
  let lo = -90,
    hi = 90;
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2;
    if (mapPoint([rotation, mid], rotation)[1] > point[1]) lo = mid;
    else hi = mid;
  }
  const lat = (lo + hi) / 2,
    scale = mapPoint([rotation + 1, lat], rotation)[0] - 600;
  return [wrapLongitude(rotation + (point[0] - 600) / scale), lat];
}
