import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/research-tree.md");
import { LEVEL_YEARS } from "./levels.mjs";
import { PROGRAMS } from "./balance.mjs";

// In-universe doctrine and organization, read from catalog/common/rules/research-tree.md.
// 1922 begins at level one; 1936 begins at level five. Hardware remains subject to its own catalog date.
export const LEVELS = data.LEVELS;
export const levelDescription = (key, level) =>
  LEVELS[key]?.[Math.max(0, Math.min(8, level - 1))] || "";
export const levelYear = (key, level) =>
  PROGRAMS[key].kind === "Technology"
    ? LEVEL_YEARS[Math.max(0, Math.min(8, level - 1))]
    : 1922;
export function researchOrder(s, entries) {
  return [...entries].sort(
    ([a], [b]) =>
      levelYear(a, Math.min(9, s.nations[s.player].tech[a] + 1)) -
        levelYear(b, Math.min(9, s.nations[s.player].tech[b] + 1)) ||
      PROGRAMS[a].name.localeCompare(PROGRAMS[b].name),
  );
}
export const levelHint = (key, level) =>
  "Level " +
  level +
  ": " +
  levelDescription(key, level) +
  (level < 9 ? "\nNext: " + levelDescription(key, level + 1) : "") +
  "\n" +
  PROGRAMS[key].effect;
