import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/personnel-training.md");
const DAY = data.DAY;
export function initializeTraining(s, n) {
  n.personnelTraining ??= { sailors: 0, aviators: 0, lastDay: s.day };
}
export function nextGraduationDay(s, type) {
  const date = new Date(s.day * DAY),
    month = date.getUTCMonth();
  return (
    Date.UTC(
      date.getUTCFullYear(),
      type === "aviators" ? (Math.floor(month / 3) + 1) * 3 : month + 1,
      1,
    ) / DAY
  );
}
export function graduationProgress(s, n, type) {
  const date = new Date(s.day * DAY),
    month = date.getUTCMonth(),
    periodStart =
      Date.UTC(
        date.getUTCFullYear(),
        type === "aviators" ? Math.floor(month / 3) * 3 : month,
        1,
      ) / DAY;
  const opening =
      Date.parse(
        s.campaignId === "campaign_1922" ? "1922-02-06" : "1936-01-01",
      ) / DAY,
    end = nextGraduationDay(s, type),
    start = Math.max(opening, periodStart);
  return {
    start,
    end,
    duration: Math.max(1, end - start),
    trainees: Math.floor(n.personnelTraining?.[type] || 0),
    label: type === "aviators" ? "Quarterly graduation" : "Monthly graduation",
    hint: trainingDescription(s, n, type),
  };
}
export function trainingDescription(s, n, type) {
  const date = new Date(nextGraduationDay(s, type) * DAY).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" },
  );
  return (
    (type === "sailors"
      ? "Monthly · every 1st"
      : "Quarterly · 1 Jan / Apr / Jul / Oct") +
    " (UTC). Next: " +
    date +
    " · " +
    Math.floor(n.personnelTraining?.[type] || 0).toLocaleString("en-US") +
    " in training. Costs accrue daily; resource shortages reduce the batch."
  );
}
// Each daily update pays for the day just completed. Training stock cannot
// crew ships or aircraft until its calendar graduation; rescue is independent.
export function trainPersonnel(s, n, fund) {
  initializeTraining(s, n);
  const pool = n.personnelTraining;
  if (s.day <= pool.lastDay) return { sailors: 0, aviators: 0 };
  const past = new Date((s.day - 1) * DAY),
    year = past.getUTCFullYear();
  const days = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / DAY;
  pool.sailors += fund((n.crewYear * n.schoolFunding) / days, 3, 0.15);
  pool.aviators += fund((n.aviatorsYear * n.aviatorFunding) / days, 25, 2);
  pool.lastDay = s.day;
  const date = new Date(s.day * DAY),
    graduates = { sailors: 0, aviators: 0 };
  if (date.getUTCDate() === 1) {
    graduates.sailors = Math.floor(pool.sailors + 1e-9);
    pool.sailors = Math.max(0, pool.sailors - graduates.sailors);
    n.crew += graduates.sailors;
    if (date.getUTCMonth() % 3 === 0) {
      graduates.aviators = Math.floor(pool.aviators + 1e-9);
      pool.aviators = Math.max(0, pool.aviators - graduates.aviators);
      n.aviators += graduates.aviators;
    }
  }
  return graduates;
}
