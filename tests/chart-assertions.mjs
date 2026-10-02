import assert from 'node:assert/strict';
import { mapSymbolLegend } from '../ui/map-symbols.mjs';

export function assertNativeChartWithLegend(html) {
  const legend = mapSymbolLegend();
  assert.equal(html.split(legend).length, 2, 'the exact shared symbol legend appears once');
  const chart = html.replace(legend, '');
  assert.equal((chart.match(/data-key="native-world-surface"/g) || []).length, 1);
  assert.match(chart, /class="native-world-surface"[^>]*data-preserve="true"/);
  assert.doesNotMatch(chart, /<svg\b|political-territory/, 'SVG is allowed only inside the shared legend, never as a map renderer');
}
