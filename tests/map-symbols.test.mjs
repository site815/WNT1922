import test from 'node:test';
import assert from 'node:assert/strict';
import { MAP_SYMBOLS, mapSymbolSvg, mapSymbolLegend, fleetSymbolVariant } from '../ui/map-symbols.mjs';

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

test('own fleet type symbols distinguish carriers, battle fleets, cruisers, escorts, submarines and support', () => {
  for (const [types, expected] of [[['CV','BB','DD'],'carrier'],[['BC','CL'],'capital'],[['CA','DD'],'cruiser'],
    [['DD','SS'],'escort'],[['SS','SM'],'submarine'],[['AO','AK'],'support'],[[],'escort']]) {
    const variant=fleetSymbolVariant(types.map(type=>({type})));assert.equal(variant,expected);
    assert(mapSymbolLegend().includes(MAP_SYMBOLS.fleetVariants[variant].label));
    const colored=mapSymbolSvg('fleet',19,{variant,color:'#42a58d'});
    assert(colored.includes('fill="#42a58d"'));
    assert(colored.includes(MAP_SYMBOLS.backingColor),'Contrast casing and internal silhouette retain their own dark ink');
  }
  const glyphs=Object.keys(MAP_SYMBOLS.fleetVariants).map(variant=>mapSymbolSvg('fleet',19,{variant}));
  assert.equal(new Set(glyphs).size,6,'Every composition class has genuinely different vector geometry');
  assert.doesNotMatch(mapSymbolSvg('contact',19,{variant:'carrier'}),/fill="#/,'Uncertain contacts retain their unfilled question-mark badge');
  assert(mapSymbolSvg('contact',19,{color:'#42a58d'}).includes('stroke="#42a58d"'));
  assert(!mapSymbolSvg('port',19,{color:'red\" onload=\"bad'}).includes('onload'),'Only bounded RGB ink can reach markup');
});
