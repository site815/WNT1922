import assert from 'node:assert/strict';
import { mapSymbolLegend } from '../ui/map-symbols.mjs';
import { PROFILES } from '../mechanics/catalog.mjs';

export function assertNativeChartWithLegend(html) {
  const matches = [...new Set(Object.values(PROFILES).map(profile =>
    mapSymbolLegend({fleetColor: profile.color})))].filter(legend => html.includes(legend));
  assert.equal(matches.length, 1, 'one national-color variant of the shared legend is present');
  const [legend] = matches;
  assert.equal(html.split(legend).length, 2, 'the exact shared symbol legend appears once');
  const chart = html.replace(legend, '');
  assert.equal((chart.match(/data-key="native-world-surface"/g) || []).length, 1);
  assert.match(chart, /class="native-world-surface"[^>]*data-preserve="true"/);
  assert.doesNotMatch(chart, /<svg\b|political-territory/, 'SVG is allowed only inside the shared legend, never as a map renderer');
}
