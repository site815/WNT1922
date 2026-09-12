import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/campaign-content.md");
import { evaluateDesign } from "./designer.mjs";
import { evaluateAircraft } from "./aircraft-designer.mjs";
export const DEFAULT_CAMPAIGN = data.DEFAULT_CAMPAIGN;
export const campaignList = (bundle) =>
  Object.values(bundle.campaigns || { [DEFAULT_CAMPAIGN]: bundle }).map(
    (c) => c.scenario,
  );
const cache = new WeakMap();
export function contentFor(bundle, stateOrId = DEFAULT_CAMPAIGN) {
  bundle = bundle._baseContent || bundle;
  const id =
    typeof stateOrId === "string"
      ? stateOrId
      : stateOrId.campaignId || DEFAULT_CAMPAIGN;
  const base =
    bundle.campaigns?.[id] ||
    (bundle.scenario.id === id || id === DEFAULT_CAMPAIGN ? bundle : null);
  if (!base) throw new Error("Unknown campaign.");
  if (typeof stateOrId === "string" || !stateOrId.nations) return base;
  const recipes = Object.entries(stateOrId.nations).flatMap(([nation, n]) =>
    (n.customDesigns || []).map((r) => [nation, r]),
  );
  const airRecipes = Object.entries(stateOrId.nations).flatMap(([nation, n]) =>
    (n.customAircraft || []).map((r) => [nation, r]),
  );
  if (!recipes.length && !airRecipes.length) return base;
  const key = recipes
      .concat(airRecipes)
      .map(([id, r]) => id + ":" + r.id)
      .join("|"),
    entries = cache.get(stateOrId) || [],
    old = entries.find((e) => e.key === key && e.base === base);
  if (old) return old.value;
  const c = {
    ...base,
    classes: { ...base.classes },
    nations: Object.fromEntries(
      Object.entries(base.nations).map(([k, n]) => [
        k,
        { ...n, designs: [...n.designs], aircraft: [...n.aircraft] },
      ]),
    ),
  };
  Object.defineProperty(c, "_baseContent", { value: base });
  for (const [nation, r] of recipes) {
    if (
      !c.nations[nation] ||
      !/^draft-(JPN|USA|GBR|DEU|FRA|ITA|SOV)-\d+$/.test(r.id) ||
      !r.id.startsWith("draft-" + nation + "-") ||
      c.classes[r.id]
    )
      throw new Error("Invalid saved design draft.");
    const result = evaluateDesign(r, nation);
    if (!result.valid) throw new Error("Invalid saved draft displacement.");
    c.classes[r.id] = result.ship;
    c.nations[nation].designs.push(r.id);
  }
  for (const [nation, r] of airRecipes) {
    if (
      !c.nations[nation] ||
      !new RegExp("^airdraft-" + nation + "-\\d+$").test(r.id) ||
      c.nations[nation].aircraft.some((a) => a.id === r.id)
    )
      throw Error("Invalid saved aircraft draft.");
    const result = evaluateAircraft(r, nation);
    if (!result.valid) throw Error("Invalid saved aircraft fit.");
    c.nations[nation].aircraft.push(result.aircraft);
  }
  cache.set(stateOrId, [{ key, base, value: c }]);
  return c;
}
