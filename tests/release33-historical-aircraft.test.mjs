import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { CATALOG } from '../worker/catalog-loader.mjs';

const decode = s => s.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
const coordinates = path => (path.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
const bounds = (path, axis) => {
  const values = coordinates(path).filter((_, index) => index % 2 === axis);
  return [Math.min(...values), Math.max(...values)];
};
const close = (a, b, description) => assert(Math.abs(a - b) < 0.001, description + ': ' + a + ' != ' + b);

test('historical Japanese reconstructions retain their real wing decks and propulsion across actual SVG views', async () => {
  const registry = JSON.parse(await fs.readFile('assets/recognition/aircraft/japanese-redraws.json'));
  const expected = {
    'mitsubishi-1mf3-redraw': [1, 2, 'wheels'],
    'mitsubishi-1mt-redraw': [1, 3, 'wheels'],
    'yokosuka-rogo-redraw': [1, 2, 'floats'],
    'nakajima-kikka-redraw': [2, 1, 'tricycle'],
  };
  assert.equal(registry.entries.length, Object.keys(expected).length);
  for (const entry of registry.entries) {
    const svg = await fs.readFile(entry.file, 'utf8');
    const model = JSON.parse(decode(svg.match(/<metadata>(.*?)<\/metadata>/s)[1]));
    const airframe = model.airframe;
    const [engines, planes, gear] = expected[airframe.slug];
    assert.equal(airframe.engine.length, engines);
    assert.equal(airframe.planes.length, planes);
    assert.equal(airframe.gear.kind, gear);
    assert.deepEqual(new Set(entry.views), new Set(['plan', 'profile', 'front']));
    const views = Object.fromEntries(entry.views.map(view => [view, svg.split('<g data-view="' + view + '">')[1].split('<g data-view=')[0]]));
    const enginePaths = {};
    for (const [view, projection] of Object.entries(model.projections)) {
      const matches = [...views[view].matchAll(/<g data-feature="engine" data-station="(\d+)" data-center="([^"]+)" data-projected="([^"]+)"><path d="([^"]+)"/g)];
      assert.equal(matches.length, engines, entry.id + ' ' + view + ' engine count');
      assert.equal((views[view].match(/data-feature="wing"/g) || []).length, planes * 2, entry.id + ' ' + view + ' wing count');
      enginePaths[view] = matches.map(match => match[4]);
      for (const match of matches) {
        const engine = airframe.engine[Number(match[1])];
        const center = [engine.x, engine.y, engine.z];
        const projected = projection.axes.map((axis, i) => projection.origin[i] + model.scale * axis.reduce((sum, value, j) => sum + value * center[j], 0));
        match[3].split(',').map(Number).forEach((value, i) => close(value, projected[i], entry.id + ' engine projection'));
        const axis = view === 'profile' ? 1 : 0;
        const actual = bounds(match[4], axis);
        close((actual[0] + actual[1]) / 2, projected[axis], entry.id + ' actual engine center');
      }
    }
    for (let i = 0; i < engines; i++) {
      const plan = bounds(enginePaths.plan[i], 1).map(v => (v - model.projections.plan.origin[1]) / model.scale);
      const profile = bounds(enginePaths.profile[i], 0).map(v => (v - model.projections.profile.origin[0]) / model.scale);
      plan.forEach((v, n) => close(v, profile[n], entry.id + ' actual engine longitudinal extent'));
      close(plan[0], airframe.engine[i].x, entry.id + ' engine fore station');
      close(plan[1], airframe.engine[i].x + airframe.engine[i].length, entry.id + ' engine aft station');
    }
    for (let deck = 0; deck < planes; deck++) for (const side of [-1, 1]) {
      const expression = new RegExp('<g data-feature="wing" data-plane="' + deck + '" data-side="' + side + '"[^>]*><path d="([^"]+)"');
      const spans = ['plan', 'front'].map(view => bounds(views[view].match(expression)[1], 0).map(v => (v - model.projections[view].origin[0]) / model.scale));
      spans[0].forEach((v, i) => close(v, spans[1][i], entry.id + ' actual wing span'));
      close(Math.max(...spans[0].map(Math.abs)), airframe.planes[deck].span / 2, entry.id + ' wing tip station');
    }
    if (airframe.slug === 'nakajima-kikka-redraw') {
      assert(airframe.engine.every(engine => !engine.prop));
      assert(airframe.engine[0].y < 0 && airframe.engine[1].y > 0);
    }
    if (airframe.slug === 'mitsubishi-1mt-redraw') {
      assert.equal(airframe.cockpits.length, 1);
      assert.equal(new Set(airframe.planes.map(plane => plane.z)).size, 3);
      assert(airframe.torpedo);
    }
  }
});

test('1MT keeps its single pilot requirement and historical factual profiles do not imply unsupported extra views', async () => {
  for (const campaign of Object.values(CATALOG.campaigns)) {
    const aircraft = campaign.nations.JPN.aircraft.find(plane => plane.id === 'jp_naval_strike_1921');
    if (aircraft) assert.equal(aircraft.crew.normal, 1);
  }
  const registry = JSON.parse(await fs.readFile('assets/recognition/aircraft/historical-profiles.json'));
  for (const entry of registry.entries) {
    assert.deepEqual(entry.views, ['profile']);
    const svg = await fs.readFile(entry.file, 'utf8');
    assert.deepEqual([...svg.matchAll(/data-view="([^"]+)"/g)].map(match => match[1]), ['profile']);
    assert(entry.references.length > 0 && entry.origin === 'original');
  }
});
