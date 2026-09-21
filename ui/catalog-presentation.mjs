import { TYPES } from "../mechanics/catalog.mjs";

const shipRoles = {
  BB: "Heavy guns and armor for the battle line.",
  BC: "Fast capital ship for scouting and surface combat.",
  CV: "Fleet carrier for embarked air operations.",
  CVL: "Light carrier for air cover, scouting and strikes.",
  CA: "Heavy cruiser for scouting and surface combat.",
  CL: "Light cruiser for scouting, screening and surface combat.",
  DD: "Destroyer for fleet screening, torpedo attacks and escort duties.",
  DL: "Flotilla leader for destroyer command, screening and torpedo attacks.",
  DE: "Escort for convoy protection and antisubmarine duties.",
  TB: "Torpedo boat for short-range coastal attacks and patrols.",
  SS: "Submarine for submerged attacks and sea denial.",
  SM: "Submarine for submerged attacks and sea denial.",
  AO: "Fleet support ship for port depots and replenishment at sea.",
  AK: "Cargo ship supporting merchant trade and transport.",
  AM: "Merchant hull supporting trade and transport.",
};

export function shipDescription(c) {
  return `${TYPES[c.type] || c.type} · ${c.year}. ${shipRoles[c.type] || "Naval vessel with the equipment and performance listed below."}`;
}

export function aircraftDescription(a, { government = false } = {}) {
  const role = (a.role || "naval aircraft").replaceAll("_", " ");
  const bases = [a.basing?.carrier && "carrier decks", a.basing?.floatplane && "floatplane stations", a.basing?.land && "shore bases"].filter(Boolean);
  return `${role.charAt(0).toUpperCase() + role.slice(1)} · ${a.type_year}. ${government ? "Government operated" : "Operates"}${bases.length ? " from " + bases.join(" and ") : " with role-specific basing"}.`;
}

export function aircraftSpeed(a) {
  const speeds = a.performance?.speed_kmh || {};
  const maximum = Math.max(0, ...Object.entries(speeds).filter(([key]) => !key.includes("torpedo") && key !== "cruise").map(([, value]) => value));
  return { label: maximum ? "Maximum speed" : "Cruising speed", value: maximum || speeds.cruise || 240 };
}
