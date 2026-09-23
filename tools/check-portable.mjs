import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import net from "node:net";
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";
import { GAME_VERSION } from "../mechanics/version.mjs";
import { verifyPackage } from "./verify-package.mjs";
import { CATALOG } from "../worker/catalog-loader.mjs";
import { newGame, queueDecision, addLog } from "../mechanics/engine.mjs";
import { contentFor } from "../mechanics/campaign-content.mjs";
import { beginEngagement } from "../mechanics/engagements.mjs";
import { fleetStats } from "../mechanics/task-forces.mjs";
import { campaignMinutes } from "../mechanics/campaign-clock.mjs";
import { navalAircraftInventory } from "../mechanics/aircraft-inventory.mjs";
import { staffAircraft } from "../mechanics/naval-resources.mjs";
import { validateSave } from "../mechanics/state-io.mjs";
import { automaticAircraftDraft, commissionAircraft } from "../mechanics/aircraft-designer.mjs";

const require = createRequire(import.meta.url);
// Set WNT_PORTABLE_FRAME_ONLY=1 for a short, normally rendered map performance check.
const performanceOnly = process.env.WNT_PORTABLE_FRAME_ONLY === "1";
let playwright;
try {
  playwright = require("playwright");
} catch {
  playwright = createRequire(
    path.join(
      os.homedir(),
      ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/",
    ),
  )("playwright");
}
const executable = path.resolve(
  process.argv[2] || `.build/releases/WNT1922-${GAME_VERSION}-portable-win-x64.exe`,
);
const output = path.resolve("test-output/portable");
await fs.mkdir(output, { recursive: true });
const testRoot = await fs.mkdtemp(path.join(output, "portable test "));
const result = { version: GAME_VERSION, executable, checks: [], errors: [] };
let child, browser, page, finished, unpacked;
async function acknowledgeDispatches() {
  for (let i=0; i<12 && await page.locator(".diplomatic-dispatch").count(); i++) {
    await page.locator(".diplomatic-dispatch [data-action=choose]:not(:disabled)").last().click();
    await delay(250);
  }
  assert.equal(await page.locator(".diplomatic-dispatch").count(),0);
}
async function unusedPort() {
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}
async function launch(profile) {
  const temp = await fs.mkdtemp(path.join(testRoot, "temporary files "));
  const port = await unusedPort();
  child = spawn(
    executable,
    [
      "/S",
      "--test-mode",
      "--test-rendering",
      "--disable-backgrounding-occluded-windows",
      "--disable-features=CalculateNativeWinOcclusion",
      "--remote-debugging-address=127.0.0.1",
      `--remote-debugging-port=${port}`,
    ],
    {
      windowsHide: true,
      stdio: "ignore",
      env: {
        ...process.env,
        WNT_TEST_USER_DATA: profile,
        WNT_RECOGNITION_ROOT: "",
        WNT_VOXEL_ROOT: "",
        PATH: process.env.SystemRoot + "\\System32",
        TEMP: temp,
        TMP: temp,
      },
    },
  );
  finished = new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
  let connected = false;
  for (let i = 0; i < 240; i++) {
    assert.equal(
      child.exitCode,
      null,
      "Launcher exited before opening the game",
    );
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`, {
        signal: AbortSignal.timeout(500),
      });
      if (response.ok) {
        // The HTTP probe can answer just before the debugging socket is ready.
        browser = await playwright.chromium.connectOverCDP(`http://127.0.0.1:${port}`,{timeout:2000});
        connected = true;
        break;
      }
    } catch {}
    await delay(250);
  }
  assert(
    connected,
    "Portable game did not open its test endpoint within 60 seconds",
  );
  const context = browser.contexts()[0];
  page = context.pages()[0] || (await context.waitForEvent("page"));
  page.setDefaultTimeout(15000);
  await page.setViewportSize({width:1920,height:1080});
  const displaySession = await context.newCDPSession(page);
  if (!performanceOnly) {
    // Keep a compositor surface without letting the desktop pointer override
    // automated hover/click tests while the player uses their own game.
    assert(Number.isInteger(child.pid));
    await promisify(execFile)('powershell.exe',['-NoProfile','-Command',`
$testNativeProcess = Get-CimInstance Win32_Process -Filter "ParentProcessId = ${child.pid} AND Name = 'WNT1922.exe'"
if (@($testNativeProcess).Count -ne 1) { throw 'Cannot identify isolated test window process.' }
$testWindowHandle = (Get-Process -Id $testNativeProcess.ProcessId).MainWindowHandle
if ($testWindowHandle -eq [IntPtr]::Zero) { throw 'The isolated test window has no native handle.' }
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class PortableTestPosition {
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr after, int x, int y, int w, int hgt, uint flags);
}
'@
if (-not [PortableTestPosition]::SetWindowPos($testWindowHandle,[IntPtr]::Zero,-20000,-20000,0,0,0x0015)) { throw 'Cannot position the isolated test window.' }
`],{windowsHide:true});
  }
  await displaySession.send('Emulation.setFocusEmulationEnabled',{enabled:true});
  page.on("pageerror", (error) => result.errors.push(error.message));
  await page.locator(".nation-card").first().waitFor();
  await page.evaluate(() => {
    window.testNotices = [];
    const toast = document.querySelector("#toast");
    new MutationObserver(() => {
      if (toast.textContent) window.testNotices.push(toast.textContent);
    }).observe(toast, { childList: true, characterData: true, subtree: true });
  });
  assert.equal(await page.evaluate(() => typeof require), "undefined");
  const directories = await fs.readdir(temp, { withFileTypes: true });
  unpacked = null;
  for (const entry of directories.filter((entry) => entry.isDirectory())) {
    const candidate = path.join(temp, entry.name, "WNT1922");
    if (
      await fs
        .stat(path.join(candidate, "package-manifest.json"))
        .catch(() => null)
    ) {
      unpacked = candidate;
      break;
    }
  }
  assert(
    unpacked,
    "The game must unpack only into its isolated temporary directory",
  );
  await verifyPackage(unpacked);
  assert.deepEqual(
    await fs.readFile(path.join(unpacked, "../NSIS-LICENSE.txt")),
    await fs.readFile("assets/licenses/NSIS-LICENSE.txt"),
  );
}
async function checkRecognition(nation) {
  for (const [view, selector, type] of [
    ["yards", ".design-card .class-name", "spec"],
    ["aircraft", '.aircraft-models [data-action="aircraft-spec"]', "aircraft-spec"],
  ]) {
    await page.locator('.sidebar [data-view="' + view + '"]').click();
    await page.locator(selector).first().click();
    await page.locator('[data-dialog-type="' + type + '"] .recognition-card img').waitFor();
    await page.waitForFunction(() => {
      const image = document.querySelector('.modal .recognition-card img');
      return image?.complete && image.naturalWidth > 0;
    });
    const presentation = await page.locator('.modal .recognition-card img').evaluate(image => ({
      fit: getComputedStyle(image).objectFit,
      background: getComputedStyle(image).backgroundColor,
      blend: getComputedStyle(image).mixBlendMode,
      paper: getComputedStyle(image.closest('.recognition-image')).backgroundColor,
      source: new URL(image.src).pathname,
      caption: !!image.closest('figure').querySelector('figcaption strong'),
    }));
    assert.equal(presentation.fit, "contain");
    assert.equal(presentation.background, "rgba(0, 0, 0, 0)");
    assert.equal(presentation.blend, "multiply");
    assert.equal(presentation.paper, "rgb(185, 180, 160)");
    assert(presentation.source.startsWith("/assets/recognition/"));
    assert(presentation.caption);
    const artInfo = page.locator('.modal .recognition-info');
    assert.equal(await artInfo.evaluate(el => el.open), false);
    await artInfo.locator('summary').click();
    assert.equal(await artInfo.evaluate(el => el.open), true);
    assert.match(await artInfo.innerText(), /source file unchanged/);
    await artInfo.locator('summary').click();
    await page.locator('.modal [data-action="recognition"]').click();
    await page.locator('[data-dialog-type="recognition"] .recognition-sheet img').waitFor();
    await page.waitForFunction(() => {
      const image = document.querySelector('.recognition-sheet img');
      return image?.complete && image.naturalWidth > 0;
    });
    assert.equal(await page.locator('.recognition-sheet').evaluate(el => getComputedStyle(el).overflow), "auto");
    await page.locator('[data-action="recognition-zoom"]').click();
    await page.locator('.recognition-sheet.actual-size').waitFor();
    await page.locator('[data-action="recognition-zoom"]').click();
    await page.locator('.recognition-sheet:not(.actual-size)').waitFor();
    await page.screenshot({ path: path.join(output, `recognition-${view}-${nation}.png`) });
    await page.locator('.modal .close').click();
  }
  const direct = await page.evaluate(async () => {
    const read = async file => {
      const response = await fetch(file, { cache: "no-store" });
      if (!response.ok) throw Error("Missing direct artwork: " + file);
      return response;
    };
    const index = await (await read('/assets/recognition/index.json')).json();
    const entries = (await Promise.all(index.registries.map(async file =>
      (await (await read('/assets/recognition/' + file)).json()).entries))).flat();
    const examples = ['ship', 'aircraft'].map(kind => entries.find(entry => entry.kind === kind));
    const checks = [];
    for (const entry of examples) {
      const response = await read('/' + entry.file);
      const bytes = await response.arrayBuffer();
      const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(byte => byte.toString(16).padStart(2, '0')).join('');
      checks.push({ file: entry.file, length: bytes.byteLength, expectedBytes: entry.bytes, digest, expectedHash: entry.sha256, cache: response.headers.get('cache-control') });
    }
    return checks;
  });
  for (const check of direct) {
    assert.equal(check.length, check.expectedBytes, check.file);
    assert.equal(check.digest, check.expectedHash, check.file);
    assert.equal(check.cache, "no-store");
  }
  await page.locator('[data-action="menu"]').click();
  await page.locator('[data-action="recognition-credits"]').click();
  await page.locator('.recognition-credits figcaption').first().waitFor();
  assert.match(await page.locator('.modal-body').innerText(), /recognition drawings cover/);
  await page.locator('.modal .close').click();
  result.checks.push(nation + ": muted recognition paper, toggled art information, ship and aircraft cards, full-size drawings, original packaged file bytes and SHA-256 verified without external requests.");
}
async function closeSaved() {
  // Closing webContents from page JavaScript bypasses Electron's native close
  // event. Send the same window message as the title-bar X to this test child.
  assert(Number.isInteger(child.pid));
  await promisify(execFile)("powershell.exe",["-NoProfile","-Command",`
$testNativeProcess = Get-CimInstance Win32_Process -Filter "ParentProcessId = ${child.pid} AND Name = 'WNT1922.exe'"
if (@($testNativeProcess).Count -ne 1) { throw 'Cannot identify isolated test window process.' }
Add-Type @'
using System;
using System.Text;
using System.Runtime.InteropServices;
public static class PortableTestWindow {
  private delegate bool WindowCallback(IntPtr h, IntPtr p);
  [DllImport("user32.dll")] private static extern bool EnumWindows(WindowCallback callback, IntPtr p);
  [DllImport("user32.dll")] private static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] private static extern int GetWindowText(IntPtr h, StringBuilder text, int size);
  [DllImport("user32.dll")] private static extern bool PostMessage(IntPtr h, uint message, IntPtr w, IntPtr l);
  public static bool Close(uint pid) {
    bool sent=false;
    EnumWindows((h,p)=>{
      uint owner; GetWindowThreadProcessId(h,out owner);
      var title=new StringBuilder(512); GetWindowText(h,title,title.Capacity);
      if(owner==pid && title.ToString().Contains("WNT1922")) {
        sent=PostMessage(h,0x0010,IntPtr.Zero,IntPtr.Zero); return false;
      }
      return true;
    },IntPtr.Zero);
    return sent;
  }
}
'@
if (-not [PortableTestWindow]::Close($testNativeProcess.ProcessId)) { throw 'Isolated test window did not accept normal close.' }
`],{windowsHide:true});
  const exit = await Promise.race([
    finished,
    delay(30000).then(() => {
      throw new Error("Portable game failed to save and exit");
    }),
  ]);
  assert.equal(exit.code, 0, "Portable launcher exit code");
  child = null;
  await browser.close();
  browser = null;
  assert.equal(
    await fs.stat(unpacked).catch(() => null),
    null,
    "Temporary game files must be removed on normal exit",
  );
}
// The visible canvas owns hit testing. Its keyboard-accessible objects expose
// the same screen rectangles, so native tests can exercise real pointer picks
// without dispatching clicks into the hidden SVG fallback.
async function sceneHitPoint(kind, { id = null, lastFleet = false } = {}) {
  return page.locator('.isometric-accessibility [data-iso-kind]').evaluateAll((nodes, options) => {
    const objects = nodes.map((node, order) => ({ node, order, box: node.getBoundingClientRect(),
      kind: node.dataset.isoKind, id: node.dataset.id, hullIndex: Number(node.dataset.hullIndex) }));
    const fleetOrder = new Map([...document.querySelectorAll('.fleet-command-row')].map((node, i) => [node.dataset.id, i]));
    const candidates = objects.filter(row => row.kind === options.kind && (!options.id || row.id === options.id));
    if (options.lastFleet) candidates.sort((a, b) => (fleetOrder.get(b.id) || 0) - (fleetOrder.get(a.id) || 0));
    else if (options.kind === 'ship') candidates.sort((a, b) => b.box.width - a.box.width);
    for (const row of candidates) for (const [rx, ry] of [[.5,.5],[.5,.12],[.12,.5],[.88,.5],[.5,.88],[.12,.12],[.88,.12]]) {
      const x = row.box.x + row.box.width * rx, y = row.box.y + row.box.height * ry;
      if (!document.elementFromPoint(x, y)?.matches('.isometric-canvas')) continue;
      const covered = objects.some(other => other.order > row.order && x >= other.box.x - 3 && x <= other.box.right + 3 &&
        y >= other.box.y - 3 && y <= other.box.bottom + 3);
      if (!covered) return { x, y, id: row.id, hullIndex: row.hullIndex };
    }
    return null;
  }, {kind, id, lastFleet});
}
async function checkVoxelScene(nation) {
  const resolution=await page.locator('.isometric-canvas').evaluate(canvas=>{
    const box=canvas.getBoundingClientRect(),ratio=Math.min(2,devicePixelRatio||1);
    return {actual:[canvas.width,canvas.height],expected:[Math.ceil(box.width*ratio),Math.ceil(box.height*ratio)]};
  });
  assert.deepEqual(resolution.actual,resolution.expected,'Canvas backing resolution survives title-screen/new/continue at the same window size');
  const assets = await page.evaluate(async () => {
    const {loadVoxelModels,voxelModelFor} = await import('/ui/voxel-models.mjs');
    const collection = await loadVoxelModels();
    const response = await fetch('/assets/voxels/ships/index.json', {cache:'no-store'});
    const index = await response.json();
    const entry = index.models.find(row => row.platforms.length > 0);
    const file = await fetch('/assets/voxels/ships/' + entry.file, {cache:'no-store'}), model = await file.json();
    const platform = entry.platforms[0], selected = voxelModelFor(platform.id, {campaign:platform.campaign || '',type:model.type});
    return {models:collection.models.size,expected:index.models.length,platforms:collection.platforms.size,
      selected:selected.id,expectedModel:entry.id,parts:model.parts.length,cache:file.headers.get('cache-control')};
  });
  assert.equal(assets.models, assets.expected, 'Every packaged voxel model loads');
  assert(assets.platforms > 200 && assets.parts > 3, 'Historical and original campaign classes have prebuilt geometry');
  assert.equal(assets.selected, assets.expectedModel, 'Campaign class resolves to its authored model');
  assert.equal(assets.cache, 'no-store', 'Model files are served directly without a build cache');
  await page.locator('[data-iso-camera="fleet"]').click();
  await page.waitForFunction(() => document.querySelector('.isometric-canvas')?.dataset.lod === 'fleet');
  assert(Number(await page.locator('.isometric-canvas').getAttribute('data-visible-hulls')) > 0);
  const point = await sceneHitPoint('ship');
  assert(point, 'Fleet zoom provides an uncovered, individually clickable hull');
  await page.mouse.move(point.x, point.y);
  await page.waitForFunction(() => {
    const image = document.querySelector('.class-hover:not([hidden]) .recognition-thumbnail img');
    return image?.complete && image.naturalWidth > 0;
  });
  assert.match(await page.locator('.class-hover:not([hidden])').innerText(), /Sailors aboard/);
  await page.mouse.move(1, 1); await delay(300);
  await page.mouse.click(point.x, point.y);
  await page.locator('[data-dialog-type="ship"]').waitFor();
  assert.match(await page.locator('.modal').innerText(), /Sailors aboard/);
  await page.locator('.modal [data-action="close"]').first().click();
  await page.mouse.move(1, 1);
  await page.screenshot({path:path.join(output,'voxel-fleet-'+nation+'.png')});
  await page.locator('[data-iso-camera="home"]').click();
  assert.equal(await page.locator('.isometric-canvas').getAttribute('data-lod'), 'strategic');
  assert.equal(await page.locator('.world-map').evaluate(node => getComputedStyle(node).visibility), 'hidden', 'The isometric canvas is the visible engine');
  result.checks.push({nation,voxelAssets:assets,scene:'World-to-fleet zoom, actual canvas ship hover and click, complete ship inspection, and return to strategic world verified.'});
}
async function measureMapFrames() {
  return page.evaluate(() => new Promise(resolve => {
    const start=performance.now(),gaps=[],startFrames=Number(document.querySelector('.isometric-canvas')?.dataset.sceneFrames || 0);let last=start;
    function frame(now) {
      gaps.push(now-last);last=now;
      const panel=document.querySelector('.command-side-panel');
      if(panel)panel.scrollTop=(now-start)%500;
      if(now-start<8000)requestAnimationFrame(frame);
      else { const scene=document.querySelector('.isometric-canvas'); resolve({visible:!document.hidden,fps:1000*gaps.length/(now-start),largestFrameMs:Math.max(...gaps),sceneFps:1000*(Number(scene?.dataset.sceneFrames || 0)-startFrames)/(now-start),sceneCpuMs:Number(scene?.dataset.sceneCpuMs || 0),sceneFrames:Number(scene?.dataset.sceneFrames || 0)}); }
    }
    requestAnimationFrame(frame);
  }));
}
try {
  if (performanceOnly) {
    const profile=path.join(testRoot,"rendering profile");
    if(process.env.WNT_PORTABLE_PERFORMANCE_SAVE) {
      const saved=JSON.parse(await fs.readFile(process.env.WNT_PORTABLE_PERFORMANCE_SAVE,'utf8'));
      saved.paused=true;saved.autoPause=false;saved.controllers[saved.player]='human';
      validateSave(saved,CATALOG);
      await fs.mkdir(path.join(profile,'saves'),{recursive:true});
      await fs.writeFile(path.join(profile,'saves/campaign.json'),JSON.stringify(saved));
      result.campaignDate=new Date(saved.day*86400000).toISOString().slice(0,10);
      await launch(profile);
      await page.locator('[data-action="continue"]').click();
    } else {
      await launch(profile);
      await page.locator('[data-action="select-campaign"][data-id="in_good_faith_1936"]').click();
      await page.locator('[data-action="select-nation"][data-id="USA"]').click();
      await page.locator('[data-action="new"]').click();
      if(await page.locator('[data-action="begin"]').count())await page.locator('[data-action="begin"]').click();
    }
    await page.locator('.isometric-canvas').waitFor();

    await acknowledgeDispatches();
    await page.locator('#auto-pause').uncheck();
    await page.locator('#speed').selectOption('100');
    await delay(1000);
    result.paused=await measureMapFrames();
    await page.locator('[data-action="pause"]').click();
    await delay(1000);
    result.running1000000=await measureMapFrames();
    result.actualSpeed=await page.locator('.actual-speed').innerText();
    await page.locator('#speed').selectOption('10');
    result.running100000=await measureMapFrames();
    assert.equal(await page.locator('#auto-pause').isChecked(),false);
    assert.match(await page.locator('[data-action=pause]').innerText(),/Pause/);
    await page.locator('[data-action="pause"]').click();
    await page.screenshot({path:path.join(output,'map-performance.png')});
    assert(result.running1000000.fps>=20 && result.running1000000.largestFrameMs<1000,
      'Visible map responsiveness: '+JSON.stringify(result.running1000000));
    await closeSaved();
  } else {
  for (const [campaign, nation] of process.env.WNT_PORTABLE_BATTLE_ONLY ? [] : [
    ["in_good_faith_1936", "USA"],
    ["campaign_1922", "GBR"],
  ]) {
    const profile = path.join(testRoot, "save profile " + nation);
    await launch(profile);
    await page
      .locator(`[data-action="select-campaign"][data-id="${campaign}"]`)
      .click();
    await page
      .locator(`[data-action="select-nation"][data-id="${nation}"]`)
      .click();
    await page.locator('[data-action="new"]').click();
    if (await page.locator('[data-action="begin"]').count())
      await page.locator('[data-action="begin"]').click();
    await page.locator(".isometric-canvas").waitFor();
    if(nation==='USA') {
      const bounds=await page.locator('.diplomatic-dispatch').boundingBox(),workspace=await page.locator('.workspace').boundingBox();
      assert(bounds.x>=workspace.x && bounds.y>=workspace.y,'Dispatch leaves menus and resource bars visible');
      assert(Math.abs(bounds.x+bounds.width/2-workspace.x-workspace.width/2)<2,'Dispatch centers in the workspace');
      assert(Math.abs(bounds.y+bounds.height/2-workspace.y-workspace.height/2)<2,'Dispatch uses the lower workspace center');
      assert.equal(await page.locator('.dispatch-backdrop').evaluate(el=>getComputedStyle(el).backdropFilter),'none');
      const deadline=await page.locator('.diplomatic-dispatch .modal-body small').innerText();
      await page.screenshot({path:path.join(output,'choice-dispatch.png')});
      await page.locator('.dispatch-options [data-action="defer-decision"]').click();
      await page.locator('.diplomatic-dispatch').waitFor({state:'detached'});
      assert.match(await page.locator('[data-action="pause"]').innerText(),/Resume/);
      await page.locator('.sidebar [data-view="fleet"]').click();
      await page.locator('.pending-decision').click();
      assert.equal(await page.locator('.diplomatic-dispatch .modal-body small').innerText(),deadline);
      await page.keyboard.press('Escape');
      await page.locator('.diplomatic-dispatch').waitFor({state:'detached'});
      await page.locator('.pending-decision').click();
      await page.locator('.diplomatic-dispatch').waitFor();
      result.checks.push('Lower-centered, unblurred dispatches leave menus/resources visible; defer, reopen and Escape preserve the deadline and manual pause.');
    }
    await acknowledgeDispatches();
    // Inspect before visiting either catalog: artwork must be available on the
    // first fleet hover, including legacy ships outside the procurement list.
    await page.locator('.sidebar [data-view="fleet"]').click();
    await page.locator('.workspace [data-ship]').first().hover();
    await page.waitForFunction(() => {
      const image = document.querySelector('.class-hover:not([hidden]) .recognition-thumbnail img');
      return image?.complete && image.naturalWidth > 0;
    });
    assert.match(await page.locator('.class-hover').innerText(), /Complement/);
    assert.equal(await page.locator('.class-hover .recognition-info').count(), 0);
    await page.mouse.move(12, 12);
    await page.locator('.sidebar [data-view="command"]').click();
    result.checks.push(nation + ': first fleet hover displays its complete recognition thumbnail before any catalog visit.');
    if(nation==='USA') {
      for(const action of ['continue','new']) {
        await page.locator('.sidebar [data-view="fleet"]').click();
        await page.locator('#fleet-filter').selectOption('reserve');
        await page.locator('#fleet-search').fill('reset test');
        await page.locator('[data-action="menu"]').click();
        await page.locator('[data-action="title-screen"]').click();
        await page.locator('[data-action="'+action+'"]').click();
        if(action==='new' && await page.locator('[data-action="begin"]').count())await page.locator('[data-action="begin"]').click();
        await page.locator('.isometric-canvas').waitFor();
        await acknowledgeDispatches();
        await page.locator('.sidebar [data-view="fleet"]').click();
        assert.equal(await page.locator('#fleet-filter').inputValue(),'all');
        assert.equal(await page.locator('#fleet-search').inputValue(),'');
      }
      await page.locator('.sidebar [data-view="command"]').click();
    }
    assert.equal(await page.locator(".news-rail").count(),1);
    const cells=await page.locator('.resource-bar > div').evaluateAll(rows=>rows.map(x=>{const b=x.getBoundingClientRect();return {width:b.width,height:b.height};}));
    assert(Math.max(...cells.map(x=>x.width))-Math.min(...cells.map(x=>x.width))<1,'Resource cells use equal widths');
    assert(cells.every(x=>x.height===55),'Resource cells keep the compact fixed height');
    for (const key of ["YARDS", "SAILORS", "AVIATORS", "AIRCRAFT"]) {
      const counter = page.locator('[data-resource="' + key + '"] strong');
      assert.match((await counter.innerText()).replace(/\s/g, ''), /^[\d,]+\([+−][\d,]+\)$/);
      assert(await counter.evaluate(el => el.scrollWidth <= el.clientWidth + 1), key + " counter must fit without truncation");
    }
    await page.mouse.move(12, 12);
    await delay(300);
    await page.screenshot({ path: path.join(output, `map-${nation}.png`) });
    await checkRecognition(nation);
    await page.locator('.sidebar [data-view="aircraft"]').click();
    assert.equal(await page.locator('[data-action="air-design"]').count(), 0);
    assert.equal(await page.locator('[data-model][data-future="false"]:not(:has(.badge.active))').count(), 0);
    assert.equal(
      await page.locator(".government-aircraft").evaluate((el) => el.open),
      false,
    );
    await page.locator("[data-aircraft]").first().hover();
    await page.locator(".class-hover:not([hidden])").waitFor();
    await page.waitForFunction(() => {
      const image = document.querySelector('.class-hover:not([hidden]) .recognition-thumbnail img');
      return image?.complete && image.naturalWidth > 0;
    });
    assert.match(
      await page.locator(".class-hover").innerText(),
      /Combat radius/,
    );
    assert.doesNotMatch(
      await page.locator(".class-hover").innerText(),
      /DERIVED|ASSERTED|comparator|NaN/,
    );
    assert.doesNotMatch(
      await page.locator(".class-hover").innerText(),
      /^0 (?:km|kg|m)\b/m,
    );
    await page.screenshot({
      path: path.join(output, `aircraft-${nation}.png`),
    });
    await page.locator('[data-action="open-aircraft-designer"]').click();
    await page.locator('[data-draft="name"]').fill("Tester carrier fighter");
    await page.locator('[data-draft="name"]').dispatchEvent("change");
    const power = page.locator('[data-draft="hp"]');
    const hp = Number(await power.inputValue());
    await power.fill(String(hp - 20));
    await power.dispatchEvent("change");
    await page.screenshot({
      path: path.join(output, `designer-${nation}.png`),
    });
    await page.locator('[data-action="commission-aircraft"]').click();
    await page.locator(".ship-designer").waitFor({ state: "detached" });
    const fighterLine = page.locator('[data-production="fighter"]');
    const newModel = await fighterLine
      .locator("option")
      .filter({ hasText: "Tester carrier fighter" })
      .getAttribute("value");
    assert(newModel);
    await fighterLine.selectOption(newModel);
    await page.waitForFunction(() => !document.querySelector('[data-production-automatic="fighter"]').checked);
    assert.equal(await page.locator('[data-production-automatic="fighter"]').isChecked(),false);
    await page.locator('[data-production-automatic="fighter"]').check();
    await page.waitForFunction(() => document.querySelector('[data-production-automatic="fighter"]').checked);
    assert.equal(await page.locator('[data-production-automatic="fighter"]').isChecked(),true);
    await fighterLine.selectOption(newModel);
    await page
      .locator('[data-aircraft="' + newModel + '"]')
      .first()
      .hover();
    await page.locator(".class-hover:not([hidden])").waitFor();
    assert.match(await page.locator(".class-hover").innerText(), /Armament/);
    await page.locator('.sidebar [data-view="yards"]').click();
    await page.locator('[data-action="open-designer"]').click();
    await page.locator('[data-draft="name"]').fill("Tester escort");
    await page.locator('[data-draft="name"]').dispatchEvent("change");
    await page.locator('[data-action="commission-draft"]').click();
    await page.locator(".ship-designer").waitFor({ state: "detached" });
    await page.locator('.sidebar [data-view="command"]').click();
    await page
      .locator(".fleet-command-row")
      .first()
      .locator("strong")
      .first()
      .click();
    await page.locator('.fleet-command-row.selected').waitFor();
    assert.equal(await page.locator('.fleet-command-row.selected').count(),1);
    await page.locator('[data-iso-camera="home"]').click();
    const fleetPoint=await sceneHitPoint('fleet',{lastFleet:true});
    assert(fleetPoint,'The strategic canvas exposes a directly clickable friendly fleet');
    const firstFleet=fleetPoint.id;
    await page.mouse.click(fleetPoint.x,fleetPoint.y);
    await delay(450);
    assert.equal(await page.locator('.fleet-command-row.selected').getAttribute('data-id'),firstFleet);
    const visibleSelection=await page.locator('.fleet-command-row.selected').evaluate(el=>{
      const r=el.getBoundingClientRect(),p=el.closest('.command-side-panel').getBoundingClientRect();
      return r.top>=p.top && r.bottom<=p.bottom;
    });
    assert(visibleSelection,'Map selection scrolls its highlighted row into view');
    await page.mouse.move(260, 180);
    const rowLayout = await page
      .locator(".fleet-command-row")
      .first()
      .evaluate((el) => ({
        height: el.getBoundingClientRect().height,
        content: el.scrollHeight,
      }));
    assert(
      rowLayout.content <= rowLayout.height + 2,
      "Fleet controls must fit inside each row",
    );
    await page.screenshot({ path: path.join(output, `orders-${nation}.png`) });
    assert.equal(await page.locator("[data-fleet-mission],[data-fleet-aggression],[data-action=send-inline-order]").count(),0);
    assert.equal(await page.locator("[data-action=alert-history]").count(),0);
    await checkVoxelScene(nation);
    const count = await page.locator(".fleet-command-row").count();
    // The chart extends behind the tiles; choose a port the player can actually
    // point at instead of assuming the first cataloged port is unobstructed.
    const portPoint = await sceneHitPoint('port');
    assert(portPoint, 'The uncovered chart offers a directly clickable port');
    await page.mouse.click(portPoint.x,portPoint.y);
    await delay(450);
    assert.equal(await page.locator(".fleet-command-row").count(), count);
    const home=nation==='USA'?'norfolk':'portsmouth';
    await page.locator('[data-iso-camera="home"]').click();
    const portTarget=page.locator('.isometric-accessibility [data-iso-kind="port"][data-id="'+home+'"]');
    assert.equal(await portTarget.count(),1,'The home port has an accessible canvas target');
    {
      await portTarget.dispatchEvent('click',{bubbles:true});
      await delay(450);
      // Give nearby capital/fleet icons room while keeping the chosen port at
      // the camera centre, then hover a real exposed portion of its hit area.
      let hoverPoint=null;
      for(let i=0;i<6&&!hoverPoint;i++) {
        await page.locator('[data-iso-camera="in"]').click();
        if(i>=2)hoverPoint=await sceneHitPoint('port',{id:home});
      }
      assert(hoverPoint,'The home port has an exposed canvas hit area');
      await page.mouse.move(10,10);
      await page.mouse.move(hoverPoint.x,hoverPoint.y);
      await page.waitForFunction(()=>{const e=document.querySelector('.class-hover.base-hover:not([hidden])');return e?.textContent.includes('Depot capacity / assigned load');});
      assert.match(await page.locator('.class-hover.base-hover').innerText(),/does not multiply fleet supply/);
      const box=await page.locator('.class-hover').evaluate(el=>({width:el.clientWidth,height:el.clientHeight,scroll:el.scrollHeight}));
      assert.ok(box.width>=700,'Base hover must be wide enough for two columns');
      assert.ok(box.scroll<=box.height+2,'Base hover must fit without scrolling');
      await page.screenshot({path:path.join(output,'base-hover-'+nation+'.png')});
      await page.mouse.move(180,160);
    }
    await page.locator('.sidebar [data-view="land"]').click();
    await page.locator('.isometric-canvas').waitFor();
    const mapBox = await page.locator(".world-board").boundingBox(),
      sideBox = await page.locator(".command-side-panel").boundingBox(),
      navBox = await page.locator(".sidebar").boundingBox(),
      viewport = page.viewportSize();
    assert(
      mapBox.x === 0 && mapBox.y === 0 &&
      Math.abs(mapBox.width - viewport.width) < 1 &&
      Math.abs(mapBox.height - viewport.height) < 1,
      "The world map fills the viewport behind the ministry tiles",
    );
    assert.equal(await page.locator('.isometric-canvas').count(), 1, 'Only one visible world scene is mounted');
    assert.equal(await page.locator('.world-map').count(), 1, 'One semantic SVG fallback retains the political geography');
    assert(Math.abs(sideBox.width - navBox.width) < 1, 'Campaign and navigation tiles have equal widths');
    assert(sideBox.x > viewport.width / 2 && sideBox.x + sideBox.width <= viewport.width,
      'Campaign information overlays the right edge of the chart');
    assert(
      (await page.locator(".political-territory").count()) > 100,
      "Land map retains political geography",
    );
    if (await page.locator(".land-campaign-card").count()) {
      await page.locator(".land-campaign-card").first().click();
      assert.match(
        await page.locator(".command-side-panel").innerText(),
        /Land campaigns/,
      );
    }
    await page.screenshot({ path: path.join(output, `land-${nation}.png`) });
    await page.locator('.sidebar [data-view="airwar"]').click();
    assert.match(
      await page.locator(".command-side-panel").innerText(),
      /Strategic air/,
    );
    assert(
      (await page.locator(".political-territory").count()) > 100,
      "Strategic air map retains political geography",
    );
    await page.screenshot({ path: path.join(output, `airwar-${nation}.png`) });
    await page.locator('.sidebar [data-view="economy"]').click();
    assert.match(
      await page.locator(".economy-ledger").innerText(),
      /GTP naval budget/,
    );
    for (const width of nation==='USA'?[1920,2560]:[1920]) {
      await page.setViewportSize({width,height:1080});
      await delay(250);
      const layout=await page.evaluate(()=>({
        width:document.documentElement.clientWidth,content:document.documentElement.scrollWidth,
        cards:[...document.querySelectorAll('.economy-ledger > .ledger-panel')].map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};}),
        controls:[...document.querySelectorAll('.clock-controls > *')].map(e=>{const r=e.getBoundingClientRect();return {right:r.right,bottom:r.bottom};})}));
      assert(layout.content<=layout.width+1,'No horizontal page overflow at '+width);
      const row=layout.cards.filter(c=>Math.abs(c.y-layout.cards[0].y)<1);
      assert(row.length===3,'Economy has three equal columns at '+width);
      assert(Math.max(...row.map(c=>c.width))-Math.min(...row.map(c=>c.width))<1);
      assert(Math.max(...row.map(c=>c.height))-Math.min(...row.map(c=>c.height))<1);
      await page.screenshot({path:path.join(output,'economy-'+nation+'-'+width+'.png')});
      result.checks.push('Aligned economy and time controls at '+width+'×1080.');
    }
    await page.setViewportSize({width:1920,height:1080});
    await page.locator('.sidebar [data-view="review"]').click();
    assert.match(await page.locator('.record-ledger').innerText(), /Civilian hulls built/);
    assert.doesNotMatch(await page.locator('.record-ledger').innerText(), /NaN|undefined|Infinity/);
    await page.screenshot({ path: path.join(output, `naval-record-${nation}.png`) });
    await page.locator('.sidebar [data-view="economy"]').click();
    await page.locator('.resource-bar [data-resource="STRATEGIC"]').hover();
    await page.locator(".resource-breakdown").waitFor();
    assert.match(await page.locator(".resource-breakdown").innerText(), /Actual change this month/);
    await page.evaluate(() => document.activeElement.blur());
    assert(await page.locator('.class-hover').isVisible(),'Unrelated focus changes retain the resource tooltip');
    await page.locator('.resource-bar [data-resource="GTP"]').hover();
    await page.waitForFunction(()=>document.querySelector('.resource-breakdown')?.textContent.includes('Opening GTP naval budget'));
    assert.match(await page.locator('.resource-breakdown').innerText(),/next GTP = current GTP/);
    const tipBox=await page.locator('.class-hover').boundingBox(),resourceBox=await page.locator('.resource-bar').boundingBox();
    assert(tipBox.y>=resourceBox.y+resourceBox.height,'Resource explanations must stay below resource controls');
    await page.screenshot({path:path.join(output,'gtp-hover-'+nation+'.png')});
    for (const [key,formula] of [['GDP','home access'],['SHIPPING','Shortfall'],['MORALE','Significant victory']]) {
      await page.locator('.resource-bar [data-resource="'+key+'"]').hover();
      await page.waitForFunction(text=>document.querySelector('.resource-breakdown')?.textContent.includes(text),formula);
      const layout=await page.locator('.class-hover').evaluate(el=>({height:el.clientHeight,content:el.scrollHeight}));
      assert(layout.content<=layout.height+2,key+' derivation must fit its hover');
      await page.screenshot({path:path.join(output,key.toLowerCase()+'-hover-'+nation+'.png')});
    }
    await page.locator('.resource-bar [data-resource="AIRCRAFT"]').hover();
    await page.locator('.resource-aircraft-types').waitFor();
    assert.match(await page.locator('.resource-aircraft-types').innerText(),/Reserve/);
    await page.locator('.sidebar [data-view="diplomacy"]').click();
    assert.equal(await page.locator(".government").count(), 6);
    assert.doesNotMatch(
      await page.locator(".government-grid").innerText(),
      /war pressure|warning risk|relations/i,
    );
    const tradePartner = nation === "USA" ? "GBR" : "USA";
    const visit = page.locator(
        `[data-action="diplomatic"][data-kind="visit"][data-id="${tradePartner}"]`,
      ),
      beforeBox = await visit.boundingBox();
    await page
      .locator(
        `[data-action="diplomatic"][data-kind="visit"][data-id="${tradePartner}"]`,
      )
      .click();
    await delay(400);
    assert.equal(
      await page
        .locator(
          `[data-action="diplomatic"][data-kind="visit"][data-id="${tradePartner}"]`,
        )
        .count(),
      0,
    );
    assert(await page.locator(".government .timed-progress").count());
    const progressBox = await page
      .locator(".government .timed-progress")
      .first()
      .boundingBox();
    assert.ok(
      Math.abs(beforeBox.height - progressBox.height) <= 1,
      "Cooldown preserves button height",
    );
    assert.ok(
      Math.abs(beforeBox.width - progressBox.width) <= 1,
      "Cooldown preserves button width",
    );
    if (nation === "USA") {
      assert.equal(await page.locator("[data-provocation-country]").count(),0);
      await page
        .locator(
          '[data-action="diplomatic"][data-kind="provoke"][data-id="JPN"]',
        )
        .click();
      await page.locator('[data-action="confirm"]').click();
      await delay(500);
      assert.match(
        await page.locator(".government-grid").innerText(),
        /deployed until/,
      );
    }
    await page.screenshot({
      path: path.join(output, `diplomacy-${nation}.png`),
    });
    await page.locator('.sidebar [data-view="programs"]').click();
    await page.locator("#industryFunding").fill("40");
    await page.locator("#industryFunding").dispatchEvent("change");
    await delay(400);

    await page.locator('.sidebar [data-view="command"]').click();
    await page.locator("#speed").selectOption("10");
    const before = await page.locator(".campaign-clock").innerText();
    const controlGeometry=async()=>page.locator('.actual-speed,.pause-control,.step-control').evaluateAll(rows=>rows.map(x=>{const b=x.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height};}));
    const pausedControls=await controlGeometry();
    await page.locator('[data-action="pause"]').click();
    await page.waitForFunction(()=>document.querySelector('[data-action="step-six-hours"]')?.disabled);
    assert.deepEqual(await controlGeometry(),pausedControls,'Time control dimensions and positions do not change during play');
    const responsiveness=await page.evaluate(()=>new Promise(resolve=>{
      const start=performance.now(),gaps=[],startFrames=Number(document.querySelector('.isometric-canvas')?.dataset.sceneFrames || 0);let last=start;
      function frame(now){gaps.push(now-last);last=now;
        if(now-start<5000){const panel=document.querySelector('.command-side-panel');if(panel)panel.scrollTop=(now-start)%500;requestAnimationFrame(frame);}
        else {const scene=document.querySelector('.isometric-canvas');resolve({visible:!document.hidden,fps:gaps.length*1000/(now-start),largestFrameMs:Math.max(...gaps),sceneFps:1000*(Number(scene?.dataset.sceneFrames || 0)-startFrames)/(now-start),sceneCpuMs:Number(scene?.dataset.sceneCpuMs || 0),sceneFrames:Number(scene?.dataset.sceneFrames || 0)});}
      }requestAnimationFrame(frame);
    }));
    assert(responsiveness.largestFrameMs<2000,'The hidden test window must keep receiving simulation updates');
    const workers=page.workers().map(w=>w.url());
    assert(workers.some(u=>u.endsWith('/worker/simulation-worker.mjs')));
    assert(workers.some(u=>u.endsWith('/worker/view-worker.mjs')));
    result.checks.push({nation,hiddenWindowScheduling:responsiveness});
    await acknowledgeDispatches();
    if ((await page.locator('[data-action="pause"]').innerText()).includes('Pause'))
      await page.locator('[data-action="pause"]').click();
    assert.notEqual(await page.locator(".campaign-clock").innerText(), before);
    const music = await page.evaluate(async () => {
      const module = await import("/ui/music.mjs");
      module.unlockMusic();
      return module.musicStatus();
    });
    assert(music.started);
    assert.equal(music.nation,nation);
    assert.equal(music.mood,'Peace');
    await delay(1100);
    const softened=await page.evaluate(async()=>(await import('/ui/music.mjs')).musicStatus());
    assert(Math.abs(softened.outputVolume-softened.volume/3)<.01,'Paused music softens to one-third');
    if(nation==='USA') {
      const metadata=await page.evaluate(async()=>{
        const {TRACKS}=await import('/ui/music.mjs'), results=[];
        for(const t of TRACKS) results.push(await new Promise(resolve=>{
          const a=new Audio('/assets/music/'+t.file);const timer=setTimeout(()=>resolve({track:t.id,error:'timeout'}),8000);
          a.onloadedmetadata=()=>{clearTimeout(timer);resolve({track:t.id,duration:a.duration});a.removeAttribute('src');a.load();};
          a.onerror=()=>{clearTimeout(timer);resolve({track:t.id,error:'decode'});};
          a.preload='metadata';a.load();
        }));return results;
      });
      assert(metadata.every(t=>t.duration>30 && !t.error),JSON.stringify(metadata.filter(t=>t.error)));
      result.musicMetadata=metadata;
    }
    assert.equal(
      await page.evaluate(
        async () => (await import("/ui/music.mjs")).musicStatus().blocked,
      ),
      false,
    );
    assert(
      (
        await page.request.get(
          new URL("/assets/licenses/third-party-notices.html", page.url()).href,
        )
      ).ok(),
    );
    await closeSaved();
    const saved = JSON.parse(
      await fs.readFile(path.join(profile, "saves/campaign.json")),
    );
    assert.equal(saved.player, nation);
    assert.equal(saved.nations[nation].industryFunding, 0.4);
    assert.equal(
      saved.nations[nation].customAircraft[0].name,
      "Tester carrier fighter",
    );
    assert.equal(saved.nations[nation].customDesigns[0].name, "Tester escort");
    assert.equal(saved.nations[nation].productionModels.fighter, newModel);
    assert(
      saved.nations[nation].cooldowns["visit-" + tradePartner] > saved.day,
    );
    assert(!("score" in saved.relations["GBR-USA"]));
    if (nation === "USA")
      assert(
        saved.provocations.some(
          (p) => p.nation === "USA" && p.target === "JPN",
        ),
      );
    await launch(profile);
    await page.locator('[data-action="continue"]').click();
    await page.locator(".isometric-canvas").waitFor();
    await page.locator('.sidebar [data-view="programs"]').click();
    assert.equal(await page.locator("#industryFunding").inputValue(), "40");
    await closeSaved();
    result.checks.push(
      `${campaign} ${nation}: one EXE, embedded runtime without Node on PATH, exact payload hashes, admiral-controlled fleet selection, five-action diplomacy, bilateral trade cooldown, automatic strongest-force provocation, funding, fifteen-minute simulation, music, credits, close/save, temporary cleanup and reopen`,
    );
  }
  // A prepared save exercises the actual packaged UI during a long surface action.
  const battleProfile = path.join(testRoot, "ongoing battle profile");
  const battleSave = newGame(CATALOG, "USA", 250025, "in_good_faith_1936");
  battleSave.log=[];battleSave.alerts=[];
  battleSave.nations.USA.contacts=[];
  let battleContent = contentFor(CATALOG, battleSave);
  const replacement=commissionAircraft(battleSave,battleContent,automaticAircraftDraft(battleSave,battleContent,'fighter','USA'),'USA');
  battleContent=contentFor(CATALOG,battleSave);
  battleSave.nations.USA.productionModels.fighter=replacement.aircraft.id;
  battleSave.decisions = [];
  battleSave.autoPause = true;
  battleSave.paused = true;
  battleSave.speed = 0.25;
  Object.assign(battleSave.relations["JPN-USA"], { war: true, allied: false, warSince: battleSave.day });
  const forces = ["USA", "JPN"].map(id => battleSave.nations[id].fleets
    .filter(f => f.role === "battle")
    .sort((a,b) => fleetStats(battleSave,battleContent,id,b).tons - fleetStats(battleSave,battleContent,id,a).tons)[0]);
  const report = beginEngagement(battleSave,battleContent,{
    kind:"surface", a:"USA", b:"JPN", fleetA:forces[0].id, fleetB:forces[1].id,
    region:"pacific", position:[160,20],
  });
  report.mainRounds = 5;
  report.durations = [30,30,15,45,15];
  report.nextStageAt = campaignMinutes(battleSave) + 30;
  const newsShip=battleSave.nations.USA.groups.find(g=>g.count&&g.status==='active');
  addLog(battleSave,'Commissioning news: '+newsShip.name+'.','industry',{shipId:newsShip.id,newsView:'fleet'});
  battleSave.log[0].minute=campaignMinutes(battleSave)-1;
  addLog(battleSave,'A routine naval bulletin.','navy');
  battleSave.log[0].minute=campaignMinutes(battleSave)-2;
  const oldAircraft=navalAircraftInventory(battleSave,battleContent,'USA').find(r=>r.replacement && !Object.values(battleSave.nations.USA.productionModels).includes(r.model.id));
  assert(oldAircraft);
  battleSave.nations.USA.aircraft[oldAircraft.model.id]+=12;
  battleSave.nations.USA.aviators+=12*(oldAircraft.model.crew?.normal||1);
  staffAircraft(battleSave,battleContent,'USA');
  queueDecision(battleSave,"native-dispatch-first","War in China","A major world event requires acknowledgement.",[{id:"acknowledge",label:"Acknowledge",detail:"Return to the ministry."}],{critical:true,kind:"war"});
  queueDecision(battleSave,"native-dispatch-second","Ministry dispatch","A second war dispatch tests consistent placement with longer text. Fleets are reviewing convoy protection and support deployments.",[{id:"acknowledge",label:"Acknowledge",detail:"Return to the ministry."}],{critical:true,kind:"war"});
  validateSave(battleSave,CATALOG);
  await fs.mkdir(path.join(battleProfile,"saves"),{recursive:true});
  await fs.writeFile(path.join(battleProfile,"saves/campaign.json"),JSON.stringify(battleSave));
  await launch(battleProfile);
  await page.locator('[data-action="continue"]').click();
  await page.locator('.diplomatic-dispatch').waitFor();
  const firstDispatch = await page.locator('.diplomatic-dispatch').boundingBox();
  const firstButton = await page.locator('.dispatch-options [data-action="choose"]').boundingBox();
  await page.screenshot({path:path.join(output,'mandatory-dispatch.png')});
  await page.locator('.dispatch-options [data-action="choose"]').click();
  await page.waitForFunction(()=>document.querySelector('#dispatch-title')?.textContent==='Ministry dispatch');
  assert.deepEqual(await page.locator('.diplomatic-dispatch').boundingBox(), firstDispatch);
  assert.deepEqual(await page.locator('.dispatch-options [data-action="choose"]').boundingBox(), firstButton);
  await page.locator('.dispatch-options [data-action="choose"]').click();
  await page.locator('.diplomatic-dispatch').waitFor({state:'detached'});
  assert.match(await page.locator('[data-action=pause]').innerText(),/Resume/);
  result.checks.push('Mandatory dispatches use identical envelopes and footer positions; acknowledgements preserve manual pause.');
  await page.locator('.news-message').waitFor();
  assert.match(await page.locator('.news-message').innerText(),/A routine naval bulletin/);
  const newsKey=await page.locator('.news-message').getAttribute('data-key');
  const railBefore=await page.locator('.news-rail').boundingBox();
  await page.locator('.news-message').evaluate(el=>el.getAnimations()[0].finish());
  await page.waitForFunction(key=>document.querySelector('.news-message')?.dataset.key!==key,newsKey);
  assert.deepEqual(await page.locator('.news-rail').boundingBox(),railBefore);
  result.checks.push('Routine ticker advances once, stores a read receipt, and keeps a fixed rail height.');
  const clickNews = async () => {
    await page.locator('.news-message').evaluate(el=>{
      const animation=el.getAnimations()[0];animation.pause();animation.currentTime=el.parentElement.clientWidth/42*1000;
    });
    await page.locator('.news-message').click({position:{x:30,y:18}});
  };
  await page.waitForFunction(()=>document.querySelector('.news-message')?.textContent.includes('Commissioning news:'));
  await clickNews();
  await page.locator('.view-fleet .news-highlight').waitFor();
  assert.equal(await page.locator('.news-highlight [data-ship]').getAttribute('data-ship'),newsShip.id);
  await page.waitForFunction(()=>document.querySelector('.news-message')?.textContent.toLowerCase().includes('battle underway'));
  await clickNews();
  await page.locator('.modal .battle-progress').waitFor();
  await page.locator('.modal header [data-action="close"]').click();
  result.checks.push('Ticker clicks open and highlight the commissioning ship, then open the exact ongoing battle report.');
  await page.waitForFunction(async()=>(await import('/ui/music.mjs')).musicStatus().mood==='War');
  await page.locator('.sidebar [data-view="aircraft"]').click();
  await page.locator('.superseded-aircraft summary').click();
  await page.locator('[data-action="retire-aircraft"][data-id="'+oldAircraft.model.id+'"]').click();
  await page.locator('[data-action="confirm"]').click();
  await delay(450);
  assert(await page.locator('[data-action="retire-aircraft"][data-id="'+oldAircraft.model.id+'"]').isDisabled());
  await page.locator('.sidebar [data-view="reports"]').click();
  await page.locator('.report-card').first().click();
  assert.match(await page.locator('.modal .battle-progress').innerText(),/ONGOING · Contact/);
  await page.screenshot({path:path.join(output,"battle-ongoing.png")});
  await page.locator('.modal [data-action="watch-battle"]').click();
  await page.locator('.battle-canvas').waitFor();
  assert(Number(await page.locator('.battle-canvas').getAttribute('data-visible-hulls'))>0);
  for(const action of ['pause','step-minute','step-six-hours'])assert(await page.locator('[data-action="'+action+'"]').isDisabled());
  await page.locator('[data-action="battle-next"]').click();
  await page.waitForFunction(at=>Number(document.querySelector('.battle-canvas')?.dataset.frameAt)===at+15,report.startedAt);
  await page.locator('[data-action="battle-previous"]').click();
  assert.equal(Number(await page.locator('.battle-canvas').getAttribute('data-frame-at')),report.startedAt);
  await page.locator('[data-action="battle-next"]').click();
  assert.equal(Number(await page.locator('.battle-canvas').getAttribute('data-frame-at')),report.startedAt+15);
  await page.screenshot({path:path.join(output,'battle-watch.png')});
  await page.locator('.modal header [data-action="close"]').click();
  assert.match(await page.locator('[data-action="pause"]').innerText(),/Resume/);
  assert.equal(await page.locator('[data-action="pause"]').isDisabled(),false);
  await page.waitForFunction(() => document.querySelector('.report-card .battle-progress progress')?.value === 50);
  result.checks.push('Native Battle watch loads packaged voxel ships, owns pause/step controls, advances exactly one global tick, replays known ticks read-only and closes paused.');
  await closeSaved();
  const savedBattle = JSON.parse(await fs.readFile(path.join(battleProfile,"saves/campaign.json")));
  assert.equal(campaignMinutes(savedBattle),report.startedAt+15,"Normal window close must save the latest fifteen-minute step");
  assert.equal(savedBattle.reports.find(r => r.id === report.id).status,"ongoing");
  await launch(battleProfile);
  await page.locator('[data-action="continue"]').click();
  await page.locator('.sidebar [data-view="reports"]').click();
  assert.equal(await page.locator('.report-card .battle-progress progress').first().evaluate(el => el.value),50);
  for(let step=0;step<4;step++) {
    const prior=await page.locator('.campaign-clock').innerText();
    await page.locator('[data-action="step-minute"]').click();
    await page.waitForFunction(text=>document.querySelector('.campaign-clock')?.innerText!==text,prior);
  }
  await page.waitForFunction(() => document.querySelector('.report-card .battle-progress strong')?.textContent.includes('Main engagement'));
  await page.locator('[data-action="pause"]').click();
  await page.locator('.report-card').first().click();
  const phaseBefore = await page.locator('.modal .battle-progress').innerText();
  await page.locator('.modal .combat-calculations summary').click();
  const scrolled = await page.locator('.modal-body').evaluate(el => {
    el.scrollTop = el.scrollHeight;
    return el.scrollTop;
  });
  assert(scrolled > 0,"Long battle details must scroll");
  await page.waitForFunction(before => {
    const current=document.querySelector('.modal .battle-progress')?.innerText;
    return current && current!==before;
  }, phaseBefore, {timeout:5000});
  assert.equal(await page.locator('.modal .combat-calculations').evaluate(el => el.open),true);
  assert((await page.locator('.modal-body').evaluate(el => el.scrollTop)) >= scrolled - 20,"Live refresh preserves report scrolling");
  assert.notEqual(await page.locator('.modal .battle-progress').innerText(),phaseBefore,"The open battle report must update during simulation");
  await page.screenshot({path:path.join(output,"battle-calculations.png")});
  await page.locator('.modal-body').evaluate(el => {el.scrollTop=0;});
  await page.locator('.modal .battle-progress').waitFor({state:"detached",timeout:30000});
  assert.match(await page.locator('.modal-body').innerText(),/Battle duration:/);
  await page.screenshot({path:path.join(output,"battle-completed.png")});
  await closeSaved();
  const completedBattle = JSON.parse(await fs.readFile(path.join(battleProfile,"saves/campaign.json")));
  assert.equal(completedBattle.reports.find(r => r.id === report.id).status,"completed");
  validateSave(completedBattle,CATALOG);
  result.checks.push("Ongoing surface battle: fifteen-minute controls, mid-stage save/reopen, five main rounds, live report updates, reserve aircraft retirement, persistent calculations/scrolling, completion and valid final save");
  }
  assert.deepEqual(result.errors, []);
  console.log(JSON.stringify(result));
} catch (error) {
  result.errors.push(error.stack);
  result.notices = await page
    ?.evaluate(() => window.testNotices)
    .catch(() => []);
  console.error(error);
  process.exitCode = 1;
  await page
    ?.screenshot({ path: path.join(output, "portable-failure.png") })
    .catch(() => {});
} finally {
  if (browser) {
    await page?.evaluate(() => window.close()).catch(() => {});
    await browser.close().catch(() => {});
  }
  if (child && child.exitCode === null) {
    await Promise.race([finished, delay(5000)]).catch(() => {});
    if (child.exitCode === null) child.kill();
  }
  await fs.writeFile(
    path.join(output, performanceOnly ? "performance-result.json" : "portable-result.json"),
    JSON.stringify(result, null, 2),
  );
}
