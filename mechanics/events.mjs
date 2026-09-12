import { readDocument } from "../worker/documents.mjs";
import { PROFILES } from "./catalog.mjs";
import {
  queueDecision,
  decisionQueue,
  chooseDecision,
  affordability,
  projectBlock,
  projectPrice,
} from "./engine.mjs";
import { historical1922Decisions } from "./vanilla.mjs";
const [common, early, hindsight] = await Promise.all([
  readDocument("common/events.md"),
  readDocument("1922/events.md"),
  readDocument("1936hindsight/events.md"),
]);
const at = (date) => Date.parse(date + "T00:00:00Z") / 86400000;

function resolveAIChoices(s, c, id) {
  const nation = s.nations[id];
  for (const event of [...decisionQueue(s, id)]) {
    const due = event.critical && s.day * 1440 >= event.deadline;
    const possible = event.options.filter((o) =>
      o.program
        ? !projectBlock(s, o.program, id) &&
          !affordability(nation, projectPrice(s, o.program, id))
        : !affordability(nation, {
            gold: o.gold || 0,
            influence: o.influence || 0,
            industry: o.industry || 0,
          }),
    );
    // Conservative policy: honor mandatory defaults, otherwise preserve the
    // appropriation. Choice effects and prices always use the common resolver.
    const choice = due
      ? event.options.find((o) => o.id === event.defaultOption)
      : possible.find((o) => o.id === event.defaultOption) || possible.at(-1);
    if (choice)
      chooseDecision(s, c, event.key, choice.id, { actor: id, automatic: due });
  }
}

export function scriptedDecisions(s, c, { opening = false } = {}) {
  if (s.campaignId === "campaign_1922") historical1922Decisions(s, c);
  const definitions = [
    ...common,
    ...(s.campaignId === "campaign_1922" ? early : hindsight),
  ];
  const date = new Date(s.day * 86400000),
    year = date.getUTCFullYear(),
    month = date.getUTCMonth();
  for (const id of Object.keys(s.nations))
    for (const event of definitions) {
      if (
        opening
          ? !event.opening &&
            !(id !== s.player && event.key === "washington-disposal")
          : event.opening
      )
        continue;
      if (
        (event.nations && !event.nations.includes(id)) ||
        event.exclude?.includes(id)
      )
        continue;
      if (
        (event.date && s.day < at(event.date)) ||
        (event.expiredTreaty && s.day <= s.treatyUntil)
      )
        continue;
      const rival = s.nations[id].rival,
        pair = s.relations[[id, rival].sort().join("-")];
      if (
        event.months &&
        (date.getUTCDate() !== 1 || !event.months.includes(month))
      )
        continue;
      if (
        event.positive !== undefined &&
        event.positive !== ((year + month) % 3 === 0)
      )
        continue;
      if (
        (event.peaceWithRival && pair?.war) ||
        (event.requiresTreaty && s.day > s.treatyUntil)
      )
        continue;
      if (
        event.excludeSovietTreaty &&
        s.campaignId === "campaign_1922" &&
        [id, rival].includes("SOV")
      )
        continue;
      const key = event.months ? `incident-${year}-${month}` : event.key;
      queueDecision(
        s,
        key,
        event.title,
        event.body.replaceAll("{rival}", PROFILES[rival].name),
        structuredClone(event.options),
        {
          actor: id,
          critical: !!event.critical,
          ...(event.kind ? { kind: event.kind } : {}),
          ...(event.peaceWithRival ? { target: rival } : {}),
          ...(event.defaultOption
            ? {
                defaultOption: event.defaultOption,
                defaultText: event.defaultText,
              }
            : {}),
          ...(event.deadlineDate
            ? { deadline: at(event.deadlineDate) * 1440 }
            : {}),
        },
      );
    }
  for (const [id, controller] of Object.entries(s.controllers))
    if (controller === "ai") resolveAIChoices(s, c, id);
}
