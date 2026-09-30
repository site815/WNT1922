import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../',import.meta.url));

test('ordinary browser entry explains the native launch without starting a campaign or renderer',async()=>{
  const app = {innerHTML:''};
  const source = await fs.readFile(path.join(root,'ui/boot.mjs'),'utf8');
  const imports = [];
  const script = new vm.Script('(async()=>{'+source+'})()',{
    importModuleDynamically:async specifier=>{imports.push(specifier);throw Error('Unexpected browser startup');},
  });
  await script.runInNewContext({location:{search:''},URLSearchParams,document:{querySelector:selector=>{
    assert.equal(selector,'#app'); return app;
  }}});
  assert.match(app.innerHTML,/Open WNT1922 in Unreal Engine/);
  assert.match(app.innerHTML,/Test-Unreal\.cmd/);
  assert.doesNotMatch(app.innerHTML,/<canvas|data-action="new"/);
  assert.deepEqual(imports,[]);
});

test('the native HUD dependency graph contains no alternate world or battle graphics backend',async()=>{
  const seen = new Set();
  const visit = async file=>{
    if(seen.has(file))return;
    seen.add(file);
    const source=await fs.readFile(file,'utf8');
    assert.doesNotMatch(source,/voxel|isometric|vendor\/three|new\s+(?:THREE\.)?WebGLRenderer|\.getContext\(['"](?:2d|webgl2?)['"]\)/i,path.relative(root,file));
    for(const match of source.matchAll(/(?:from\s*|import\s*\()(['"])(\.[^'"]+\.mjs)\1/g)) {
      const next=path.resolve(path.dirname(file),match[2]);
      if(next.startsWith(path.join(root,'ui')+path.sep))await visit(next);
    }
  };
  await visit(path.join(root,'ui/app.mjs'));
  assert(seen.has(path.join(root,'ui/unreal-scene.mjs')));
  assert(seen.has(path.join(root,'ui/start-battle-demo.mjs')));
});
