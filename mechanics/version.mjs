import { readText } from "../worker/documents.mjs";
export const GAME_VERSION = JSON.parse(
  await readText(new URL("../package.json", import.meta.url)),
).version;
export const SAVE_VERSION = 19;
