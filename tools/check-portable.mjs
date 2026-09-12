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
import { newGame } from "../mechanics/engine.mjs";
import { contentFor } from "../mechanics/campaign-content.mjs";
import { beginEngagement } from "../mechanics/engagements.mjs";
import { fleetStats } from "../mechanics/task-forces.mjs";
import { campaignMinutes } from "../mechanics/campaign-clock.mjs";
import { navalAircraftInventory } from "../mechanics/aircraft-inventory.mjs";
import { staffAircraft } from "../mechanics/naval-resources.mjs";
import { validateSave } from "../mechanics/state-io.mjs";

const require = createRequire(import.meta.url);
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
  process.argv[2] || `dist/WNT1922-${GAME_VERSION}-portable-win-x64.exe`,
);
const output = path.resolve("test-output/portable");
await fs.mkdir(output, { recursive: true });
const testRoot = await fs.mkdtemp(path.join(output, "portable test "));
const result = { version: GAME_VERSION, executable, checks: [], errors: [] };
let child, browser, page, finished, unpacked;
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
      "--remote-debugging-address=127.0.0.1",
      `--remote-debugging-port=${port}`,
    ],
    {
      windowsHide: true,
      stdio: "ignore",
      env: {
        ...process.env,
        WNT_TEST_USER_DATA: profile,
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
  browser = await playwright.chromium.connectOverCDP(
    `http://127.0.0.1:${port}`,
  );
  const context = browser.contexts()[0];
  page = context.pages()[0] || (await context.waitForEvent("page"));
  page.setDefaultTimeout(15000);
  await page.setViewportSize({width:1920,height:1080});
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
try {
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
    await page.locator(".world-map").waitFor();
    for (const key of ["YARDS", "SAILORS", "AVIATORS", "AIRCRAFT"]) {
      const counter = page.locator('[data-resource="' + key + '"] strong');
      assert.match(await counter.innerText(), /^[\d,]+\([+−][\d,]+\)$/);
      assert(await counter.evaluate(el => el.scrollWidth <= el.clientWidth + 1), key + " counter must fit without truncation");
    }
    await page.mouse.move(12, 12);
    await delay(300);
    await page.screenshot({ path: path.join(output, `map-${nation}.png`) });
    await page.locator('.sidebar [data-view="aircraft"]').click();
    assert.equal(await page.locator('[data-action="air-design"]').count(), 0);
    assert.equal(await page.locator('[data-model][data-future="false"]:not(:has(.badge.active))').count(), 0);
    assert.equal(
      await page.locator(".government-aircraft").evaluate((el) => el.open),
      false,
    );
    await page.locator("[data-aircraft]").first().hover();
    await page.locator(".class-hover:not([hidden])").waitFor();
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
    await page.locator(".chart-focus").waitFor();
    assert.equal(await page.locator('.fleet-command-row.selected').count(),1);
    const firstFleet=await page.locator('.fleet-command-row').last().getAttribute('data-id');
    await page.locator('.world-map [data-action="select-fleet"][data-id="'+firstFleet+'"]').first().dispatchEvent('click',{bubbles:true,detail:1});
    await delay(450);
    assert.equal(await page.locator('.fleet-command-row.selected').getAttribute('data-id'),firstFleet);
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
    const fleetRow = page.locator(".fleet-command-row").first();
    await fleetRow.locator("[data-fleet-mission]").selectOption("guard");
    await fleetRow.locator('[data-action="send-inline-order"]').click();
    await delay(400);
    assert.equal(
      await fleetRow.locator("[data-fleet-mission]").inputValue(),
      "guard",
    );
    const count = await page.locator(".fleet-command-row").count();
    await page
      .locator('.world-map [data-action="select-port"]')
      .first()
      .locator("circle:not(.map-hit):not(.island-front)")
      .click();
    await delay(450);
    assert.equal(await page.locator(".fleet-command-row").count(), count);
    const home=nation==='USA'?'norfolk':'portsmouth';
    const portTarget=page.locator('.world-map [data-map-hover="port:'+home+'"]').first();
    if(await portTarget.count()) {
      await portTarget.dispatchEvent('click',{bubbles:true,detail:1});
      await delay(450);
      await page.mouse.move(10,10);
      await portTarget.focus();
      await page.waitForFunction(()=>{const e=document.querySelector('.class-hover.base-hover:not([hidden])');return e?.textContent.includes('Supply capacity / demand');});
      const box=await page.locator('.class-hover').evaluate(el=>({width:el.clientWidth,height:el.clientHeight,scroll:el.scrollHeight}));
      assert.ok(box.width>=700,'Base hover must be wide enough for two columns');
      assert.ok(box.scroll<=box.height+2,'Base hover must fit without scrolling');
      await page.screenshot({path:path.join(output,'base-hover-'+nation+'.png')});
      await page.mouse.move(180,160);
    }
    await page.locator('.sidebar [data-view="land"]').click();
    assert(await page.locator(".world-map").count());
    const mapBox = await page.locator(".world-board").boundingBox(),
      sideBox = await page.locator(".command-side-panel").boundingBox();
    assert(
      sideBox.x >= mapBox.x + mapBox.width - 2,
      "Campaign panel stays to the right of the map",
    );
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
      /Strategic air campaigns/,
    );
    assert(
      (await page.locator(".political-territory").count()) > 100,
      "Strategic air map retains political geography",
    );
    await page.screenshot({ path: path.join(output, `airwar-${nation}.png`) });
    await page.locator('.sidebar [data-view="economy"]').click();
    assert.match(
      await page.locator(".economy-growth").innerText(),
      /GTP/,
    );
    await page.screenshot({ path: path.join(output, `economy-${nation}.png`) });
    await page.locator('[data-resource="STRATEGIC"]').hover();
    await page.locator(".resource-breakdown").waitFor();
    assert.match(await page.locator(".resource-breakdown").innerText(), /Actual change this month/);
    await page.locator('.resource-bar [data-resource="GTP"]').hover();
    await page.waitForFunction(()=>document.querySelector('.resource-breakdown')?.textContent.includes('Authored opening GTP'));
    assert.match(await page.locator('.resource-breakdown').innerText(),/next GTP = current GTP/);
    const tipBox=await page.locator('.class-hover').boundingBox(),resourceBox=await page.locator('.resource-bar').boundingBox();
    assert(tipBox.y>=resourceBox.y+resourceBox.height,'Resource explanations must stay below resource controls');
    await page.screenshot({path:path.join(output,'gtp-hover-'+nation+'.png')});
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
    await page.locator("#auto-pause").uncheck();
    await page.locator("#speed").selectOption("10");
    const before = await page.locator(".campaign-clock").innerText();
    await page.locator('[data-action="pause"]').click();
    await delay(1800);
    await page.locator('[data-action="pause"]').click();
    assert.notEqual(await page.locator(".campaign-clock").innerText(), before);
    const music = await page.evaluate(async () => {
      const module = await import("/ui/music.mjs");
      module.unlockMusic();
      return module.musicStatus();
    });
    assert(music.started);
    await delay(600);
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
    await page.locator(".world-map").waitFor();
    await page.locator('.sidebar [data-view="programs"]').click();
    assert.equal(await page.locator("#industryFunding").inputValue(), "40");
    await closeSaved();
    result.checks.push(
      `${campaign} ${nation}: one EXE, embedded runtime without Node on PATH, exact payload hashes, fleet order, five-action diplomacy, bilateral trade cooldown, automatic strongest-force provocation, funding, fifteen-minute simulation, music, credits, close/save, temporary cleanup and reopen`,
    );
  }
  // A prepared save exercises the actual packaged UI during a long surface action.
  const battleProfile = path.join(testRoot, "ongoing battle profile");
  const battleSave = newGame(CATALOG, "USA", 250025, "in_good_faith_1936");
  const battleContent = contentFor(CATALOG, battleSave);
  battleSave.decisions = [];
  battleSave.autoPause = false;
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
  const oldAircraft=navalAircraftInventory(battleSave,battleContent,'USA').find(r=>r.replacement && !Object.values(battleSave.nations.USA.productionModels).includes(r.model.id));
  assert(oldAircraft);
  battleSave.nations.USA.aircraft[oldAircraft.model.id]+=12;
  battleSave.nations.USA.aviators+=12*(oldAircraft.model.crew?.normal||1);
  staffAircraft(battleSave,battleContent,'USA');
  validateSave(battleSave,CATALOG);
  await fs.mkdir(path.join(battleProfile,"saves"),{recursive:true});
  await fs.writeFile(path.join(battleProfile,"saves/campaign.json"),JSON.stringify(battleSave));
  await launch(battleProfile);
  await page.locator('[data-action="continue"]').click();
  await page.locator('.sidebar [data-view="aircraft"]').click();
  await page.locator('[data-action="retire-aircraft"][data-id="'+oldAircraft.model.id+'"]').click();
  await page.locator('[data-action="confirm"]').click();
  await delay(450);
  assert(await page.locator('[data-action="retire-aircraft"][data-id="'+oldAircraft.model.id+'"]').isDisabled());
  await page.locator('.sidebar [data-view="reports"]').click();
  await page.locator('.report-card').first().click();
  assert.match(await page.locator('.modal .battle-progress').innerText(),/ONGOING · Contact/);
  await page.screenshot({path:path.join(output,"battle-ongoing.png")});
  await page.locator('.modal header [data-action="close"]').click();
  await page.locator('[data-action="step-minute"]').click();
  await page.waitForFunction(() => document.querySelector('.report-card .battle-progress progress')?.value === 50);
  await closeSaved();
  const savedBattle = JSON.parse(await fs.readFile(path.join(battleProfile,"saves/campaign.json")));
  assert.equal(campaignMinutes(savedBattle),report.startedAt+15,"Normal window close must save the latest fifteen-minute step");
  assert.equal(savedBattle.reports.find(r => r.id === report.id).status,"ongoing");
  await launch(battleProfile);
  await page.locator('[data-action="continue"]').click();
  await page.locator('.sidebar [data-view="reports"]').click();
  assert.equal(await page.locator('.report-card .battle-progress progress').first().evaluate(el => el.value),50);
  await page.locator('[data-action="step-hour"]').click();
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
  await delay(700);
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
    path.join(output, "portable-result.json"),
    JSON.stringify(result, null, 2),
  );
}
