import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/historical-gdp-data.md");
// Maddison Project Database 2023, Bolt & van Zanden (2024), via Our World in Data.
// CC BY 4.0. See catalog/common/rules/historical-gdp-data.md and the bundled third-party notices.
// Observations only: USSR 1941â€“45 are absent and interpolated, not invented data.
export const HISTORICAL_GDP = data.HISTORICAL_GDP;
