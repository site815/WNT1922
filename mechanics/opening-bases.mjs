import { PORTS, NODES, distanceNm, seaRoute, routeLength } from "./world.mjs";
import { portSpec } from "./port-catalog.mjs";

// Assign only unspecified opening stations. Authored deployments stay in place;
// subsequent moves always go through the operational route and fuel system.
export function assignOpeningBases(s, c, id) {
  const n = s.nations[id],
    loads = {},
    rows = n.fleets.map((f) => {
      const groups = n.groups.filter((g) => g.fleetId === f.id),
        tons = groups.reduce(
          (v, g) => v + c.classes[g.classId].tons * g.count,
          0,
        );
      return {
        f,
        groups,
        tons,
        fixed: groups.some((g) => g.dockPort) || f.phase !== "port",
      };
    });
  for (const g of n.groups)
    if (
      !g.fleetId &&
      g.service === "warship" &&
      ["active", "repair"].includes(g.status) &&
      g.dockPort
    )
      loads[g.dockPort] =
        (loads[g.dockPort] || 0) + c.classes[g.classId].tons * g.count;
  for (const row of rows.filter((r) => r.fixed))
    loads[row.f.port] = (loads[row.f.port] || 0) + row.tons;
  for (const { f, groups, tons } of rows
    .filter((r) => !r.fixed)
    .sort((a, b) => b.tons - a.tons)) {
    const origin = f.port,
      atlantic = id === "USA" && groups.some((g) => g.region === "atlantic"),
      candidates = Object.keys(PORTS).filter(
        (p) =>
          PORTS[p].nation === id &&
          (id !== "USA" ||
            (atlantic
              ? NODES[p][0] > -100
              : NODES[p][0] < -100 || NODES[p][0] > 100)) &&
          portSpec(s, p).tier !== "station" &&
          distanceNm(NODES[origin], NODES[p]) <= 3500,
      );
    const score = (p) => (loads[p] || 0) + tons;
    const ranked = candidates
      .map((p) => ({
        p,
        cost:
          score(p) / portSpec(s, p).capacity +
          routeLength(seaRoute(origin, p).map((k) => NODES[k])) / 15000,
      }))
      .sort((a, b) => a.cost - b.cost);
    const port = ranked[0]?.p || origin;
    loads[port] = (loads[port] || 0) + tons;
    f.port = f.node = f.targetNode = port;
    f.route = [[...NODES[port]]];
    for (const g of groups) g.dockPort = port;
  }
}
