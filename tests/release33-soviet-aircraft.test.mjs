import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { recognitionIndex } from '../ui/recognition.mjs';

test('Nomad and Muromets use distinct historical configurations rather than generic aircraft substitutes', async () => {
  const registry = JSON.parse(await fs.readFile('assets/recognition/aircraft/early-soviet-supplement.json'));
  const index = recognitionIndex([registry]);
  const cases = [
    ['sov_gov_maritime_patrol_1945', 'pbn-1-nomad', 2, 1],
    ['sov_gov_strategic_bomber_1921', 'ilya-muromets-g3', 4, 2]
  ];
  for (const [id, slug, engineCount, wingPlanes] of cases) {
    for (const campaign of Object.values(CATALOG.campaigns))
      assert(campaign.nations.SOV.armyAircraft.some(a => a.id === id));
    const entry = index.platforms.get('aircraft:' + id)?.entry;
    assert.equal(entry?.id, 'aircraft-original-reference-' + slug);
    const bytes = await fs.readFile(entry.file), svg = bytes.toString('utf8');
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256);
    assert.equal(bytes.length, entry.bytes);
    assert.deepEqual(entry.views, ['profile']);
    assert.equal(entry.geometry.engineCount, engineCount);
    assert.equal(entry.geometry.wingPlanes, wingPlanes);
    assert.equal((svg.match(/data-feature="engine"/g) || []).length, engineCount);
    assert.equal((svg.match(/data-feature="wing"/g) || []).length, wingPlanes);
    assert(!/<text\b|<image\b|<script\b/.test(svg));
    assert.match(svg, /<rect width="1200" height="570" fill="white"\/>/);
    if (slug === 'pbn-1-nomad') {
      assert.equal(entry.geometry.boatHull, true);
      assert.equal(entry.geometry.floatCount, 2);
      assert.equal((svg.match(/data-feature="retracted-tip-float"/g) || []).length, 2);
      assert.match(svg, /data-feature="enlarged-nomad-fin"/);
      assert(!/data-feature="main-wheel"/.test(svg));
      assert(entry.references.some(r => r.url === 'https://ntrs.nasa.gov/citations/19930093043'));
    } else {
      assert.equal(entry.geometry.boatHull, false);
      assert.equal(entry.geometry.rudderCount, 2);
      assert.equal((svg.match(/data-feature="outboard-rudder"/g) || []).length, 2);
      assert.equal((svg.match(/data-feature="overhead-fuel-tank"/g) || []).length, 2);
      assert.equal((svg.match(/data-propulsion="Renault inline tractor"/g) || []).length, 2);
      assert.equal((svg.match(/data-propulsion="RBVZ-6 inline tractor"/g) || []).length, 2);
      assert.match(svg, /data-feature="wheel-undercarriage"/);
      assert.match(svg, /data-feature="tail-gun-position"/);
    }
  }
});
