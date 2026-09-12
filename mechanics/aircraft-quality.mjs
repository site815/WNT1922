const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export function aircraftQuality(a, role) {
  if (!a) return 1;
  const era = 1 + Math.max(0, a.type_year - 1930) * 0.035;
  if (!a.custom) return era;
  const speed = a.performance?.speed_kmh?.sea_level || 250,
    guns = a.armament?.guns || 0,
    caliber = a.armament?.caliber_mm || 8,
    payload = a.bomb_load_kg || 0;
  if (role === "fighter")
    return clamp(
      Math.sqrt((guns * Math.pow(caliber / 8, 1.5)) / 4) *
        Math.sqrt(speed / 300),
      0.1,
      3.5,
    );
  if (["strike", "bomber"].includes(role))
    return clamp(Math.sqrt(payload / 400) * Math.sqrt(speed / 280), 0.1, 4);
  return clamp(speed / 220, 0.5, 2);
}
export function aircraftProtection(a) {
  return a?.custom
    ? 1 /
        (1 +
          (a.armor_kg || 0) / 350 +
          (a.features?.includes("self_sealing") ? 0.18 : 0))
    : 1;
}
