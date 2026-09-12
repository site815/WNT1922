import { readDocument } from "../worker/documents.mjs";
const rules = await readDocument("1922/rules.md");
const events = await readDocument("1922/events.md");
const day = (iso) => Date.parse(iso + "T00:00:00Z") / 86400000;
export function historical1922Decisions(s, c, queue) {
  const earthquake = rules.earthquake;
  if (
    s.day >= day(events.find((e) => e.key === earthquake.event).date) &&
    !s.completedEvents.includes(earthquake.completedKey)
  ) {
    const japan = s.nations[earthquake.nation],
      amagi = japan.groups.find(
        (g) =>
          g.id === earthquake.damagedHull &&
          ["building", "converting", "trials"].includes(g.status),
      );
    if (amagi) {
      amagi.status = "scrapped";
      amagi.sailors = 0;
      amagi.atSea = false;
      amagi.airWing = [];
      delete amagi.fleetId;
      const kaga = japan.groups.find(
        (g) => g.id === rules.heldHull.id && g.status === "reserve",
      );
      if (kaga) {
        kaga.classId = earthquake.replacementClass;
        kaga.status = "converting";
        kaga.sailors = 0;
        kaga.atSea = false;
        kaga.progress = earthquake.progress;
        kaga.days = rules.conversionDays;
      }
    }
    s.completedEvents.push(earthquake.completedKey);
  }
}
export function apply1922Decision(s, c, choice, id = s.player) {
  const n = s.nations[id];
  if (choice === "reject") {
    n.treatyPolicy = "false_numbers";
    n.dispositionRejected = true;
    return;
  }
  if (choice !== "comply") throw new Error("Unknown treaty disposition.");
  const conversion = rules.carrierConversions;
  for (const g of n.groups) {
    if (
      ["scrap", "canceled", "target"].includes(g.treatyFate) &&
      !["sunk", "scrapped"].includes(g.status)
    ) {
      n.industry += Math.floor(
        c.classes[g.classId].tons * g.count * rules.salvageFactor * g.progress,
      );
      g.status = "scrapped";
      g.sailors = 0;
      g.atSea = false;
      g.airWing = [];
      delete g.fleetId;
    }
    if (
      g.treatyFate === "convert_carrier" &&
      conversion[g.classId] &&
      g.id !== rules.heldHull.id
    ) {
      g.classId = conversion[g.classId];
      g.status = "converting";
      g.sailors = 0;
      g.atSea = false;
      g.days = rules.conversionDays;
      g.airWing = [];
      delete g.fleetId;
    }
    // Kaga is held as a reserve hull until the historical Amagi substitution.
    if (g.id === rules.heldHull.id) {
      g.status = "reserve";
      g.health = rules.heldHull.health;
      g.notes = rules.heldHull.notes;
    }
  }
}
export function retireReplacedTreatyHulls(s, c, id) {
  if (
    s.campaignId !== "campaign_1922" ||
    s.nations[id].treatyPolicy !== "disclose"
  )
    return;
  const n = s.nations[id],
    replacements = rules.replacementHulls[id] || [];
  if (
    !replacements.length ||
    !replacements.every((key) =>
      n.groups.some(
        (g) =>
          g.id === key &&
          ["active", "returning", "repair", "sunk"].includes(g.status),
      ),
    )
  )
    return;
  for (const g of n.groups)
    if (
      g.treatyFate === "scrap_on_replacement" &&
      !["scrapped", "sunk"].includes(g.status)
    ) {
      n.industry += Math.floor(c.classes[g.classId].tons * g.count * rules.salvageFactor);
      g.status = "scrapped";
      g.airWing = [];
      delete g.fleetId;
    }
}
