import { readText, readDocument } from "./documents.mjs";
const geography = JSON.parse(
  await readText(new URL("../assets/maps/geometry.json", import.meta.url)),
);
export const [POLITICAL, POLITICAL_1922] = await Promise.all(
  ["1936hindsight/map.md", "1922/map.md"].map(async (file) => {
    const map = await readDocument(file);
    return {
      ...map,
      source: geography.source,
      license: geography.license,
      sourceSha256: geography.sourceSha256,
      features: map.features.map((f) => {
        const geometry = geography.geometry[f.geometry];
        if (!geometry) throw Error("Missing map geometry: " + f.geometry);
        return { ...f, geometry };
      }),
    };
  }),
);
