// Read-only summary of saved controlled native-render profile evidence.
// Never launches a game, connects to a browser or modifies source profile data.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const finite = values => values.filter(Number.isFinite);
const mean = values => { const v = finite(values); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
const minimum = values => { const v = finite(values); return v.length ? Math.min(...v) : null; };
const maximum = values => { const v = finite(values); return v.length ? Math.max(...v) : null; };
const metric = (rows, field) => rows.map(row => field.split('.').reduce((value, key) => value?.[key], row));

export function summarizeProfile(profile) {
  const workloadRows = (profile.metrics || []).filter(row => row.kind === 'workload');
  const workloadNames = [...new Set([...workloadRows.map(row => row.workload), ...(profile.samples || []).map(row => row.workload)])];
  return {
    passed: profile.passed === true,
    uninterrupted: profile.uninterrupted === true,
    startedAt: profile.startedAt ?? null,
    finishedAt: profile.finishedAt ?? null,
    viewport: profile.metrics?.find(row => row.kind === 'CEF')?.viewport ?? null,
    workloads: workloadNames.map(workload => {
      const rows = (profile.samples || []).filter(row => row.workload === workload);
      const run = workloadRows.find(row => row.workload === workload);
      const values = field => metric(rows, field);
      return {
        workload, sampleCount: rows.length,
        inputIterations: run?.iterations ?? null,
        durationMs: run?.durationMs ?? null,
        cefLongTaskCount: Array.isArray(run?.longTasks) ? run.longTasks.length : null,
        cefLongTaskTotalMs: Array.isArray(run?.longTasks) ? run.longTasks.reduce((sum, row) => sum + row.duration, 0) : null,
        frameMeanMs: mean(values('frameMeanMs')),
        averageRollingP95Ms: mean(values('frameP95Ms')),
        maximumRollingP95Ms: maximum(values('frameP95Ms')),
        maximumRollingFrameMaxMs: maximum(values('frameMaxMs')),
        maximumRollingHitchCount: maximum(values('frameHitchCount')),
        averageDiagnosticBuildMs: mean(values('diagnosticBuildMilliseconds')),
        maximumDiagnosticBuildMs: maximum(values('diagnosticBuildMilliseconds')),
        averageChartDrawMs: mean(values('chart.drawMilliseconds')),
        maximumChartDrawMs: maximum(values('chart.drawMilliseconds')),
        averageChartProjectionSetupMs: mean(values('chart.projectionSetupMilliseconds')),
        averageChartIndexedBatchMs: mean(values('chart.indexedBatchMilliseconds')),
        averageMapRepositionMs: mean(values('chart.mapRepositionMilliseconds')),
        maximumMapRepositionMs: maximum(values('chart.mapRepositionMilliseconds')),
        averageMapShipUpdateMs: mean(values('chart.mapShipUpdateMilliseconds')),
        averageSubmittedVertices: mean(values('chart.submittedVertices')),
        averageSubmittedTriangles: mean(values('chart.submittedTriangles')),
        averageDrawnMarkers: mean(values('chart.drawnMarkers')),
        averageDrawnPortLabels: mean(values('chart.drawnPortLabels')),
        maximumRibbonUpdateMs: maximum(values('chart.mapStyle.ribbonUpdateMilliseconds')),
        maximumZoomVertexUploads: maximum(values('chart.mapStyle.zoomVertexUploads')),
        cameraCoverage: Object.fromEntries(['zoom', 'longitude', 'latitude'].map(field => [field, {
          min: minimum(values(field)), max: maximum(values(field)),
        }])),
      };
    }),
  };
}

export function compareProfiles(baseline, candidate) {
  const fields = ['frameMeanMs', 'averageRollingP95Ms', 'maximumRollingP95Ms',
    'averageChartDrawMs', 'averageChartIndexedBatchMs', 'averageMapRepositionMs',
    'averageSubmittedVertices', 'averageSubmittedTriangles'];
  return baseline.workloads.map(before => {
    const after = candidate.workloads.find(row => row.workload === before.workload);
    return { workload: before.workload, candidatePresent: !!after,
      baselineInputIterations: before.inputIterations, candidateInputIterations: after?.inputIterations ?? null,
      metrics: Object.fromEntries(fields.map(field => {
        const a = before[field], b = after?.[field];
        const valid = Number.isFinite(a) && Number.isFinite(b);
        return [field, { baseline: a, candidate: b ?? null, delta: valid ? b - a : null,
          percentChange: valid && a !== 0 ? (b - a) / a * 100 : null }];
      })),
    };
  });
}

async function readProfile(file) {
  const resolved = path.resolve(file), bytes = await fs.readFile(resolved);
  const value = JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, ''));
  return { file: resolved, sha256: createHash('sha256').update(bytes).digest('hex'), ...summarizeProfile(value) };
}

async function main() {
  const arg = name => process.argv.find(value => value.startsWith(name + '='))?.slice(name.length + 1);
  const baselinePath = arg('--baseline'), candidatePath = arg('--candidate'), outputPath = arg('--output');
  if (!baselinePath || !outputPath) throw Error('Required: --baseline=<result.json> --output=<summary.json>; optional --candidate=<result.json>');
  const report = {
    createdAt: new Date().toISOString(),
    purpose: 'Saved native profile comparison; no live process access.',
    baseline: await readProfile(baselinePath),
    candidate: candidatePath ? await readProfile(candidatePath) : null,
    limitations: [
      'frameMeanMs is the arithmetic mean of sampled rolling frame means, not a pooled average of unique frames.',
      'Average/max rolling P95 describe overlapping recent native-frame windows, not an independent per-workload percentile distribution.',
      'Each workload runs for approximately12seconds. Diagnostic round trips affect input cadence; faster runs can execute more wheel/pan iterations and cover different camera ranges.',
      'Chart/map timings are sampled native counters, not a GPU profiler. Last-update counters can repeat while unchanged; averages are per diagnostic sample, not per distinct operation.',
      'Profiler results do not prove process isolation. The operator must confirm only the intended renderer was running for each compared run.',
      'Missing telemetry is null, never interpreted as zero. Individual fields with different camera coverage should be interpreted together with iteration counts and coverage.',
    ],
  };
  if (report.candidate) {
    report.sameViewport = JSON.stringify(report.baseline.viewport) === JSON.stringify(report.candidate.viewport);
    report.comparison = compareProfiles(report.baseline, report.candidate);
  }
  await fs.mkdir(path.dirname(path.resolve(outputPath)), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ output: path.resolve(outputPath), baseline: report.baseline.workloads,
    candidate: report.candidate?.workloads ?? null, sameViewport: report.sameViewport ?? null }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main();
