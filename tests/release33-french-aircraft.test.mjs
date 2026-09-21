import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { recognitionIndex } from '../ui/recognition.mjs';

test('French recognition references resolve the actual campaign types with distinct hull and propulsion arrangements', async () => {
  const registry = JSON.parse(await fs.readFile('assets/recognition/aircraft/french-supplement.json'));
  const index = recognitionIndex([registry]);
  const references = [
    ['fra_gov_maritime_patrol_1930', 'cams-55-1', 2, 2, true, 2],
    ['fra_gov_maritime_patrol_1939', 'latecoere-523', 6, 1, true, 2],
    ['fra_gov_maritime_strike_1936', 'liore-h257bis', 2, 2, false, 2],
    ['fra_gov_strategic_bomber_1936', 'farman-f221', 4, 1, false, 0]
  ];
  for (const [id, slug, engines, wings, boat, floats] of references) {
    const entry = index.platforms.get('aircraft:' + id)?.entry;
    assert.equal(entry?.id, 'aircraft-original-reference-' + slug);
    for (const campaign of Object.values(CATALOG.campaigns))
      assert(campaign.nations.FRA.armyAircraft.some(a => a.id === id), id + ' exists in every campaign');
    const bytes = await fs.readFile(entry.file), svg = bytes.toString('utf8');
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256);
    assert.equal(bytes.length, entry.bytes);
    assert.deepEqual(entry.views, ['profile']);
    assert.equal(entry.geometry.engineCount, engines);
    assert.equal(entry.geometry.wingPlanes, wings);
    assert.equal(entry.geometry.boatHull, boat);
    assert.equal(entry.geometry.floatCount, floats);
    assert.equal((svg.match(/data-feature="engine"/g) || []).length, engines, slug + ' physical engine stations');
    assert.equal((svg.match(/data-feature="wing"/g) || []).length, wings, slug + ' wing geometry');
    assert.equal((svg.match(/data-feature="float"/g) || []).length, floats, slug + ' float geometry');
    assert.equal(svg.includes('data-feature="flying-boat-hull"'), boat);
    assert.equal(svg.includes('data-feature="fixed-landing-gear"'), slug === 'farman-f221');
    assert(!/<text\b|<image\b|<script\b/.test(svg));
    assert.match(svg, /<rect width="1200" height="570" fill="white"\/>/);
    if (slug === 'latecoere-523') {
      assert.equal((svg.match(/data-propulsion="Hispano Suiza inline tractor"/g) || []).length, 4);
      assert.equal((svg.match(/data-propulsion="Hispano Suiza inline pusher"/g) || []).length, 2);
    }
    if (slug === 'farman-f221') {
      assert.equal((svg.match(/data-propulsion="Gnome Rhone radial tractor"/g) || []).length, 2);
      assert.equal((svg.match(/data-propulsion="Gnome Rhone radial pusher"/g) || []).length, 2);
    }
  }
});

test('Bizerte keeps its attributed source geometry and independent original view scales', async () => {
  const registry = JSON.parse(await fs.readFile('assets/recognition/aircraft/french-supplement.json'));
  const entry = recognitionIndex([registry]).platforms.get('aircraft:fra_gov_maritime_patrol_1936').entry;
  const bytes = await fs.readFile(entry.file), svg = bytes.toString('utf8');
  assert.equal(entry.origin, 'historical');
  assert.deepEqual(entry.views, ['plan', 'profile']);
  assert.equal(entry.source.author, 'Rama');
  assert.equal(entry.source.license, 'CC BY-SA 2.0 fr');
  assert(entry.display.monochrome);
  assert.match(svg, /viewBox="0 0 800 800"/);
  assert.match(svg, /width="600pt"/);
  assert.match(svg, /height="600pt"/);
  assert.match(svg, /<rect width="800" height="800" fill="white"\/>/);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256);
  assert.equal(bytes.length, entry.bytes);
});
