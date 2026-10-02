import assert from 'node:assert/strict';

export const nativeCameraFields = d => ({instanceId:d.instanceId,zoom:d.zoom,longitude:d.longitude,latitude:d.latitude,tilt:d.tilt,yaw:d.yaw});
const focus = d => ({instanceId:d.instanceId,zoom:d.zoom,longitude:d.longitude,latitude:d.latitude});

export async function verifyNativeFPS({page,metrics}) {
  await page.waitForFunction(() => /^\d+ FPS$/.test(document.querySelector('[data-native-fps]')?.textContent || '') && parseInt(document.querySelector('[data-native-fps]').textContent)>0);
  const fps=await page.locator('[data-native-fps]').evaluate(node => {
    const speed=document.querySelector('#speed');const a=node.getBoundingClientRect(),b=speed.getBoundingClientRect();
    return {text:node.textContent,sameRow:Math.abs((a.top+a.bottom)-(b.top+b.bottom))<4,leftOfSpeed:a.right<=b.left+1,gap:b.left-a.right,insideViewport:a.left>=0&&a.right<=innerWidth&&a.top>=0&&a.bottom<=innerHeight};
  });
  assert(fps.sameRow&&fps.leftOfSpeed&&fps.gap<12&&fps.insideViewport,'Native FPS is readable immediately left of game speed');
  metrics.push({kind:'native-fps-display',...fps});
}

export function verifyWorldExtentFit(d) {
  assert.equal(d.zoom,1);assert.equal(d.tilt,0);assert.equal(d.yaw,0);
  const north=d.viewRect.y+d.viewRect.height*.03,south=d.viewRect.y+d.viewRect.height*.97;
  assert(Number.isFinite(d.northPoleScreenY)&&Number.isFinite(d.southPoleScreenY),'Native diagnostics expose both projected chart ends');
  assert(Math.abs(d.northPoleScreenY-north)<.001&&Math.abs(d.southPoleScreenY-south)<.001,'Home fits both poles inside the unobscured map with small top/bottom margins');
}

async function drag(page, clearPoint, button, dx, dy) {
  const p=await clearPoint();
  await page.mouse.move(p.x,p.y);await page.mouse.down({button});
  await page.mouse.move(p.x+dx,p.y+dy,{steps:8});await page.mouse.up({button});
}

export async function verifyStrategicMiddleNoop({page,diagnostics,clearPoint,metrics}) {
  const before=await diagnostics('world');
  assert(before.zoom<before.worldOrbitZoom&&before.orbitEnabled===false,'Strategic view must disable orbit');
  await drag(page,clearPoint,'middle',70,-25);
  const after=await diagnostics('world');
  assert.deepEqual(nativeCameraFields(after),nativeCameraFields(before),'Strategic middle drag neither pans nor orbits');
  assert.equal(await page.locator('.modal').count(),0,'Middle dragging cannot select a unit');
  metrics.push({kind:'real-strategic-middle-noop',before:nativeCameraFields(before),after:nativeCameraFields(after)});
}

// Call only after focusing an actual own fleet at close zoom in a paused,
// isolated native session. This uses real mouse gestures, never camera mocks.
export async function verifyCloseWorldOrbit({page,diagnostics,clearPoint,waitFor,metrics}) {
  const before=await diagnostics('world');
  assert(before.orbitEnabled&&before.zoom>=before.worldOrbitZoom,'Close ship view must enable middle orbit');
  assert(Number.isFinite(before.requestedYaw)&&Number.isFinite(before.requestedTilt),'Native requested orientation is required to distinguish terrain clearance from controls');
  assert(Math.abs(before.requestedTilt)<.001 && Math.abs(before.requestedYaw)<.001, 'Close zoom never tilts automatically');
  await drag(page,clearPoint,'middle',46,32);
  const orbit=await waitFor('real middle drag rotates the ship camera',d=>Math.abs(d.yaw-before.yaw)>1&&Math.abs(d.requestedTilt-before.requestedTilt)>1);
  assert.deepEqual(focus(orbit),focus(before),'Middle orbit keeps the same geographic focus and zoom');
  assert.equal(await page.locator('.modal').count(),0,'Middle orbit cannot open a ship dialog');
  await drag(page,clearPoint,'right',30,25);
  const pan=await waitFor('right drag still pans an orbited map',d=>Math.abs(d.longitude-orbit.longitude)>1e-10||Math.abs(d.latitude-orbit.latitude)>1e-10);
  for(const key of ['requestedYaw','requestedTilt','yaw'])assert(Math.abs(pan[key]-orbit[key])<.01,'Right pan preserves '+key);
  // Ground clearance can reduce actual tilt over a coast; the requested angle
  // must still be identical, and actual tilt must remain within that bound.
  assert(pan.tilt>=0&&pan.tilt<=pan.requestedTilt+.01,'Terrain protection preserves the requested inspection bound');
  const p=await clearPoint();
  // One small outward notch must reset immediately even while orbit remains
  // available. Crossing a strategic threshold is not required.
  await page.mouse.move(p.x,p.y);await page.mouse.wheel(0,1);
  const smallReset=await waitFor('any outward wheel resets manual orientation at close zoom',d=>Math.abs(d.requestedTilt)<.001&&Math.abs(d.requestedYaw)<.001);
  assert(smallReset.zoom>=smallReset.worldOrbitZoom&&smallReset.orbitEnabled,'The small outward step stays at ship zoom');
  assert(Math.abs(smallReset.tilt)<.001&&Math.abs(smallReset.yaw)<.001,'Outward input immediately resets both rendered axes');
  const lowZoom=before.worldOrbitZoom*.75;
  await page.mouse.move(p.x,p.y);await page.mouse.wheel(0,Math.log(smallReset.targetZoom/lowZoom)/.0015);
  const reset=await waitFor('wheel zoom out restores overhead north-up',d=>d.zoom<d.worldOrbitZoom&&Math.abs(d.zoom-d.targetZoom)<.01);
  assert.equal(reset.orbitEnabled,false);assert(Math.abs(reset.yaw)<.001&&Math.abs(reset.tilt)<.001,'Zoom out resets both rendered axes');
  await verifyStrategicMiddleNoop({page,diagnostics,clearPoint,metrics});
  await page.mouse.move(p.x,p.y);await page.mouse.wheel(0,-Math.log(before.zoom/reset.zoom)/.0015);
  const returned=await waitFor('wheel returns to close inspection after orientation reset',d=>d.orbitEnabled&&Math.abs(d.zoom-d.targetZoom)<.01);
  assert(Math.abs(returned.yaw)<.001&&Math.abs(returned.requestedYaw)<.001,'Old manual yaw cannot return after strategic zoom');
  assert(Math.abs(returned.requestedTilt)<.001&&Math.abs(returned.tilt)<.001,'No automatic or old manual pitch returns after zooming in');
  assert(Math.abs(returned.zoom-before.zoom)<.1,'The real wheel restores the original close zoom');
  metrics.push({kind:'real-world-orbit-and-reset',before:nativeCameraFields(before),orbit:nativeCameraFields(orbit),pan:nativeCameraFields(pan),smallReset:nativeCameraFields(smallReset),reset:nativeCameraFields(reset),returned:nativeCameraFields(returned)});
  return returned;
}
