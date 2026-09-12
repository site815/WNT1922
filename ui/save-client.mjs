import { validateSave, saveEnvelope } from "../mechanics/state-io.mjs";
import {
  SAVE_VERSION as VERSION,
  GAME_VERSION,
} from "../mechanics/version.mjs";
const RECOVERY_KEY = "wnt1922-campaign-recovery-v" + VERSION;
export function writeRecovery(state) {
  try {
    if (typeof localStorage !== "undefined")
      localStorage.setItem(RECOVERY_KEY, JSON.stringify(saveEnvelope(state)));
  } catch {
    /* Disk saves remain available when browser storage is full or disabled. */
  }
}

let writeInFlight = Promise.resolve();
export function saveCampaign(state) {
  writeRecovery(state);
  const body = JSON.stringify(saveEnvelope(state));
  writeInFlight = writeInFlight
    .catch(() => {})
    .then(async () => {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!response.ok)
        throw new Error(
          "The campaign could not be saved to disk. Export a save file before closing the game.",
        );
      return response.json();
    });
  return writeInFlight;
}

export async function loadCampaign(content) {
  const response = await fetch("/api/save");
  let disk = null;
  if (response.ok) disk = validateSave(await response.json(), content);
  else if (response.status === 409) {
    const backup = await fetch("/api/save?backup=1");
    if (backup.ok) {
      disk = validateSave(await backup.json(), content);
      disk.recoveredSave = true;
    }
  } else if (response.status !== 404)
    throw new Error("The saved campaign could not be read.");
  try {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(RECOVERY_KEY);
      if (stored) {
        const recovery = validateSave(JSON.parse(stored), content);
        if (
          !disk ||
          Date.parse(recovery.savedAt) >
            Date.parse(disk.savedAt || "1970-01-01")
        ) {
          recovery.recoveredSave = true;
          return recovery;
        }
      }
    }
  } catch {
    /* A broken browser journal cannot replace a valid disk save. */
  }
  if (!disk && response.status === 409)
    throw new Error(
      `Version ${GAME_VERSION} needs a new campaign. Your previous save remains on disk.`,
    );
  return disk;
}
