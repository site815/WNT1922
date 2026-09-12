import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/missions.md");
export const MISSIONS = data.MISSIONS;
