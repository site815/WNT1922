import { readDocument } from "./documents.mjs";

// Loading assembles references only. Specifications and opening values are never
// generated, patched or copied into a second data format.
export async function loadCatalog(read = readDocument) {
  const index = await read("manifest.md");
  if (index.format !== 1) throw Error("Unknown catalog format.");
  const [sharedShips, equipment, governmentAircraft, profiles] =
    await Promise.all([
      read(index.common.ships),
      read(index.common.equipment),
      read(index.common.governmentAircraft),
      read(index.common.profiles),
    ]);
  const campaigns = {};
  await Promise.all(
    Object.entries(index.campaigns).map(async ([id, refs]) => {
      const [metadata, ships, nationRows] = await Promise.all([
        read(refs.scenario),
        read(refs.ships),
        Promise.all(
          Object.entries(refs.nations).map(async ([nation, file]) => {
            const [opening, aircraft] = await Promise.all([
              read(file),
              read(refs.aircraft[nation]),
            ]);
            return [
              nation,
              {
                ...profiles[nation],
                ...opening,
                aircraft,
                armyAircraft: governmentAircraft[nation],
              },
            ];
          }),
        ),
      ]);
      for (const key of Object.keys(ships))
        if (key in sharedShips)
          throw Error(`Duplicate ship definition: ${key}`);
      if (metadata.scenario.id !== id)
        throw Error(`Campaign ID mismatch: ${id}`);
      campaigns[id] = {
        ...metadata,
        classes: { ...sharedShips, ...ships },
        equipment,
        nations: Object.fromEntries(nationRows),
      };
    }),
  );
  if (!campaigns[index.defaultCampaign])
    throw Error("Missing default campaign.");
  const ordered = Object.fromEntries(
    Object.keys(index.campaigns).map((id) => [id, campaigns[id]]),
  );
  return { ...ordered[index.defaultCampaign], campaigns: ordered };
}

export const CATALOG = await loadCatalog();
export const startingNation = (campaign, nation) => {
  const result = CATALOG.campaigns[campaign]?.nations[nation];
  if (!result) throw Error(`Unknown campaign/nation: ${campaign}/${nation}`);
  return result;
};
