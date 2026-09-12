import { orderBulkFleet } from "./bulk-fleet.mjs";
import { retireAircraft } from "./aircraft-inventory.mjs";
import * as sim from "./engine.mjs";
import { TICK_MINUTES } from "./campaign-clock.mjs";
import { contentFor } from "./campaign-content.mjs";
import { commissionDraft } from "./designer.mjs";
import { commissionAircraft } from "./aircraft-designer.mjs";
import {
  orderAircraft,
  setFacilityFunding,
  setProductionModel,
  SPEEDS,
} from "./naval-resources.mjs";

// Only serializable commands cross the worker boundary. UI callbacks never run
// simulation code, including manual time steps, procurement or fleet orders.
export function applyCommand(s, bundle, { type, args = {} }, actor = s.player) {
  if (!s.nations[actor]) throw Error("Unknown command issuer.");
  const session = [
    "pause",
    "speed",
    "step",
    "settings",
    "dismiss-alert",
    "clear-alerts",
  ];
  if (session.includes(type) && actor !== s.player)
    throw Error("Only the local session controls time and interface settings.");
  const c = contentFor(bundle, s),
    n = s.nations[actor];
  switch (type) {
    case "pause":
      if (
        (args.value === false || (args.value === undefined && s.paused)) &&
        s.decisions.some((d) => d.forcePause)
      )
        throw Error("Acknowledge the diplomatic dispatch before resuming.");
      s.paused = args.value ?? !s.paused;
      delete s.pauseReason;
      delete s.resumeAfterDecision;
      break;
    case "speed":
      if (!SPEEDS.some(([v]) => v === args.value))
        throw Error("Unknown simulation speed.");
      s.speed = args.value;
      break;
    case "step":
      if (s.decisions.some((d) => d.forcePause))
        throw Error(
          "Acknowledge the diplomatic dispatch before stepping time.",
        );
      if (![TICK_MINUTES, 60].includes(args.minutes)) throw Error("Invalid time step.");
      s.paused = false;
      sim.advanceMinutes(s, bundle, args.minutes, { respectPause: true });
      s.paused = true;
      delete s.resumeAfterDecision;
      break;
    case "settings":
      for (const [key, value] of Object.entries(args)) {
        if (
          ["audioEnabled", "musicEnabled", "autoPause"].includes(key) &&
          typeof value === "boolean"
        )
          s[key] = value;
        else if (
          ["audioVolume", "musicVolume"].includes(key) &&
          Number.isFinite(value) &&
          value >= 0 &&
          value <= 1
        )
          s[key] = value;
        else throw Error("Invalid game setting.");
      }
      break;
    case "funding":
      setFacilityFunding(s, args.field, args.value, actor);
      break;
    case "production":
      setProductionModel(s, c, args.role, args.model, actor);
      break;
    case "air-design":
      orderAircraft(s, c, args.id, 1, actor, { development: true });
      break;
    case "retire-aircraft":
      return retireAircraft(s,c,args.id,actor);
    case "commission-draft": {
      const r = commissionDraft(s, c, args.recipe, actor);
      if (actor === s.player)
        sim.addLog(
          s,
          r.ship.name + " draft registered. " + r.fee + " gold paid.",
          "industry",
        );
      return { name: r.ship.name, fee: r.fee };
    }
    case "commission-aircraft": {
      const r = commissionAircraft(s, c, args.recipe, actor);
      if (actor === s.player)
        sim.addLog(
          s,
          r.aircraft.name +
            " aircraft draft registered. " +
            r.fee +
            " gold paid.",
          "industry",
        );
      return { name: r.aircraft.name, fee: r.fee };
    }
    case "fleet-order":
      sim.issueFleetOrder(s, c, args.id, args.mission, args.aggressive, actor);
      break;
    case "order":
      sim.orderShip(s, c, args.id, args.count, actor);
      break;
    case "develop":
      sim.developDesign(s, c, args.id, actor);
      break;
    case "project":
      sim.startProject(s, args.id, actor);
      break;
    case "cancel":
      sim.cancelOrder(s, args.id, actor);
      break;
    case "bulk-fleet":
      return orderBulkFleet(s, c, args.ids, args.mode, actor);
    case "reserve":
      sim.reserveGroup(s, args.id, c, actor);
      break;
    case "scrap":
      sim.scrapGroup(s, c, args.id, actor);
      break;
    case "diplomatic":
      return sim.diplomaticAction(
        s,
        args.id,
        args.kind,
        actor,
        c,
        args.fleetId,
      );
    case "treaty":
      sim.setTreatyPolicy(s, args.policy, actor);
      break;
    case "dismiss-alert":
      sim.dismissNotice(s, c, args.id);
      break;
    case "clear-alerts":
      sim.clearOptionalAlerts(s, c);
      break;
    case "choose": {
      const d = sim.decisionQueue(s, actor).find((d) => d.key === args.key),
        o = d?.options.find((o) => o.id === args.id);
      sim.chooseDecision(s, c, args.key, args.id, { actor });
      return { receipt: o?.label + ". " + o?.detail };
    }
    default:
      throw Error("Unknown command: " + type);
  }
  return null;
}
