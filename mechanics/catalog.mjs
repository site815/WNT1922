import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/catalog.md");
import { MISSIONS } from "./missions.mjs";
export const PROFILES = await readDocument("common/nations.md");

export const REGIONS = data.REGIONS;

export const NATION_ORDER = data.NATION_ORDER;
export const submarineAttack = (c) =>
  ["SS", "SM"].includes(c.type)
    ? (c.tubes || 0) * 16 * (1 + (c.submergedSpeed || 0) / 25)
    : 0;
export const PRIORITIES = data.PRIORITIES;

export const TYPES = data.TYPES;
export const SERVICES = data.SERVICES;
export const fleetService = (c) =>
  c.service ||
  (["AK", "AM"].includes(c.type)
    ? "merchant"
    : ["AO", "AD", "AV"].includes(c.type)
      ? "support"
      : "warship");

export function normalizeClass(c, equipment, aircraft = []) {
  const component = (code) => equipment[code] || {};
  const battery = (c.batteries || []).find((b) => b.role === "main");
  const gun = battery
    ? { ...component(battery.component), ...battery.spec }
    : c.armament?.main_battery || {};
  const caliber =
    gun.caliber_mm ||
    gun.bore_mm ||
    (gun.caliber_cm || gun.bore_cm || 0) * 10 ||
    (gun.caliber_in || gun.bore_in || 0) * 25.4;
  const barrels = battery
    ? (battery.mounts || 1) * (battery.barrels_per_mount || gun.barrels || 1)
    : gun.count || 0;
  const torpedo = (c.batteries || []).find((b) => b.role === "torpedo");
  const torp = component(torpedo?.component);
  const machinery = c.machinery?.fits?.[0] || c.propulsion || {};
  const carrier = ["CV", "CVL"].includes(c.type);
  const footprint = aircraft
    .filter((a) => a.type_year <= 1936)
    .map((a) => a.dimensions?.hangar_footprint_m2)
    .filter(Boolean);
  const air = carrier
    ? c.aviation?.aircraft_capacity ||
      Math.floor((c.aviation?.hangar_m2 || 0) / (footprint[0] || 60))
    : 0;
  const sensors = c.sensors || [];
  const tons = c.displacement?.standard_tons || 0;
  const tubes =
    torpedo?.tubes ||
    (torpedo?.mounts || 0) * (torpedo?.tubes_per_mount || 1) ||
    c.armament?.torpedo_tubes?.count ||
    0;
  const aa =
    (c.batteries || [])
      .filter(
        (b) =>
          /aa/.test(b.role) ||
          ({ ...component(b.component), ...b.spec }.elevation_deg || 0) >= 60,
      )
      .reduce((s, b) => s + (b.mounts || 1) * (b.barrels_per_mount || 1), 0) +
    (c.armament?.aa_battery || []).reduce((s, b) => s + (b.count || 0), 0);
  return {
    id: c.id,
    nation: c.nation,
    name: c.name,
    type: c.type,
    category: c.treaty_category,
    tons,
    cost: c.cost_gold || Math.round(tons * 0.48),
    year: c.design_year || c.type_year || 1922,
    durability: c.durability || Math.round(tons / 12),
    speed: machinery.speed_kn || c.speed_submerged?.surfaced_kn || 12,
    range: machinery.range_km || (machinery.range_nm || 3000) * 1.852,
    shp: machinery.shp || 0,
    caliber,
    barrels,
    tubes,
    torpedoRange: torp.range_km || 8,
    belt: c.protection?.belt_mm || 0,
    deck: c.protection?.deck_mm || 0,
    air,
    aa,
    scoutAircraft: carrier ? 0 : c.aviation?.aircraft_capacity || 0,
    sonar: sensors.some((s) => /snr/.test(s)),
    radar: sensors.some((s) => /rad/.test(s)),
    crew: c.complement || 50,
    submergedSpeed: c.speed_submerged?.sprint_kn || 0,
    provisioned: (c.provisions || []).filter((p) => p.count > p.fitted).length,
    raw: c,
  };
}

export function equipmentIndex(files) {
  const result = {};
  for (const file of files)
    for (const line of file.lines || []) {
      let spec = { ...line.common };
      for (const gen of line.generations) {
        spec = { ...spec, ...gen.spec };
        result[gen.code] = {
          ...spec,
          year: gen.year,
          name: line.name,
          family: line.family,
          interface: line.interface,
        };
      }
    }
  return result;
}
