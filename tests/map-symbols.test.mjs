import test from 'node:test';
import assert from 'node:assert/strict';
import { MAP_SYMBOLS, mapSymbolSvg, mapSymbolLegend } from '../ui/map-symbols.mjs';

test('map roles have distinct accessible legend glyphs and one bounded geometry/palette contract', () => {
  const symbols = MAP_SYMBOLS.symbols, legend = mapSymbolLegend();
  assert.deepEqual(Object.keys(symbols), ['fleet','contact','convoy','port','country','front','battle']);
  assert(symbols.convoy.pixels < symbols.fleet.pixels);
  assert(symbols.port.pixels >= 30 && symbols.country.pixels >= 28);
  assert(symbols.fleet.polygons.length > 0 && !symbols.contact.polygons?.length);
  assert.notEqual(symbols.fleet.color, symbols.contact.color);
  for (const [kind, spec] of Object.entries({...symbols, selection:MAP_SYMBOLS.selection})) {
    const svg = mapSymbolSvg(kind);
    assert(legend.includes(svg) && legend.includes(spec.label));
    assert(svg.includes(spec.color));
    for (const path of [...(spec.strokes || []), ...(spec.polygons || [])]) {
      assert(path.points.length >= 2);
      for (const point of path.points) assert(point.length === 2 && point.every(n => Number.isFinite(n) && Math.abs(n) <= 60));
      assert(svg.includes(`points="${path.points.map(p => p.join(',')).join(' ')}"`));
    }
  }
  assert.equal(new Set(Object.keys(symbols).map(mapSymbolSvg)).size,7);
  assert.throws(() => mapSymbolSvg('unknown'));
});
