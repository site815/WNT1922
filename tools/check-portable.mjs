import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {setTimeout as delay} from 'node:timers/promises';
import {GAME_VERSION} from '../game/src/version.mjs';
import {verifyPackage} from './verify-package.mjs';

const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=createRequire(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'))('playwright');}
const executable=path.resolve(process.argv[2]||`dist/WNT1922-${GAME_VERSION}-portable-win-x64.exe`);
const output=path.resolve('game/browser-test-output');await fs.mkdir(output,{recursive:true});
const testRoot=await fs.mkdtemp(path.join(output,'portable test '));
const result={version:GAME_VERSION,executable,checks:[],errors:[]};
let child,browser,page,finished,unpacked;
async function unusedPort(){const server=net.createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=server.address().port;await new Promise(resolve=>server.close(resolve));return port;}
async function launch(profile){
 const temp=await fs.mkdtemp(path.join(testRoot,'temporary files '));const port=await unusedPort();
 child=spawn(executable,['/S','--test-mode','--remote-debugging-address=127.0.0.1',`--remote-debugging-port=${port}`],{windowsHide:true,stdio:'ignore',env:{...process.env,WNT_TEST_USER_DATA:profile,PATH:process.env.SystemRoot+'\\System32',TEMP:temp,TMP:temp}});
 finished=new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',(code,signal)=>resolve({code,signal}));});
 let connected=false;
 for(let i=0;i<240;i++){
  assert.equal(child.exitCode,null,'Launcher exited before opening the game');
  try{const response=await fetch(`http://127.0.0.1:${port}/json/version`,{signal:AbortSignal.timeout(500)});if(response.ok){connected=true;break;}}catch{}
  await delay(250);
 }
 assert(connected,'Portable game did not open its test endpoint within 60 seconds');
 browser=await playwright.chromium.connectOverCDP(`http://127.0.0.1:${port}`);
 const context=browser.contexts()[0];page=context.pages()[0]||await context.waitForEvent('page');
 page.on('pageerror',error=>result.errors.push(error.message));
 await page.locator('.nation-card').first().waitFor();assert.equal(await page.evaluate(()=>typeof require),'undefined');
 const directories=await fs.readdir(temp,{withFileTypes:true});unpacked=null;
 for(const entry of directories.filter(entry=>entry.isDirectory())){
  const candidate=path.join(temp,entry.name,'WNT1922');
  if(await fs.stat(path.join(candidate,'package-manifest.json')).catch(()=>null)){unpacked=candidate;break;}
 }
 assert(unpacked,'The game must unpack only into its isolated temporary directory');
 await verifyPackage(unpacked);
 assert.deepEqual(await fs.readFile(path.join(unpacked,'../NSIS-LICENSE.txt')),await fs.readFile('licenses/NSIS-LICENSE.txt'));
}
async function closeSaved(){
 await page.evaluate(()=>window.close());
 const exit=await Promise.race([finished,delay(30000).then(()=>{throw new Error('Portable game failed to save and exit');})]);
 assert.equal(exit.code,0,'Portable launcher exit code');child=null;
 await browser.close();browser=null;
 assert.equal(await fs.stat(unpacked).catch(()=>null),null,'Temporary game files must be removed on normal exit');
}
try{
 for(const [campaign,nation]of [['in_good_faith_1936','USA'],['campaign_1922','GBR']]){
  const profile=path.join(testRoot,'save profile '+nation);await launch(profile);
  await page.locator(`[data-action="select-campaign"][data-id="${campaign}"]`).click();
  await page.locator(`[data-action="select-nation"][data-id="${nation}"]`).click();
  await page.locator('[data-action="new"]').click();
  if(await page.locator('[data-action="begin"]').count())await page.locator('[data-action="begin"]').click();
  await page.locator('.world-map').waitFor();
  await page.locator('.fleet-command-row').first().click();await page.locator('.selected-manifest').waitFor();
  await page.locator('#fleet-mission').selectOption('guard');await page.locator('[data-action="fleet-order"]').click();await delay(400);assert.equal(await page.locator('#fleet-mission').inputValue(),'guard');
  await page.locator('.sidebar [data-view="programs"]').click();await page.locator('#industryFunding').fill('40');await page.locator('#industryFunding').dispatchEvent('change');await delay(400);
  await page.locator('#auto-pause').uncheck();await page.locator('#speed').selectOption('10');const before=await page.locator('.campaign-clock').innerText();
  await page.locator('[data-action="pause"]').click();await delay(1800);await page.locator('[data-action="pause"]').click();assert.notEqual(await page.locator('.campaign-clock').innerText(),before);
  const music=await page.evaluate(async()=>{const module=await import('/music.mjs');module.unlockMusic();return module.musicStatus();});assert(music.started);
  await delay(600);assert.equal(await page.evaluate(async()=>(await import('/music.mjs')).musicStatus().blocked),false);
  assert((await page.request.get(new URL('/third-party-notices.html',page.url()).href)).ok());
  await closeSaved();const saved=JSON.parse(await fs.readFile(path.join(profile,'saves/campaign.json')));assert.equal(saved.player,nation);assert.equal(saved.nations[nation].industryFunding,.4);
  await launch(profile);await page.locator('[data-action="continue"]').click();await page.locator('.world-map').waitFor();
  await page.locator('.sidebar [data-view="programs"]').click();assert.equal(await page.locator('#industryFunding').inputValue(),'40');await closeSaved();
  result.checks.push(`${campaign} ${nation}: one EXE, embedded runtime without Node on PATH, exact payload hashes, fleet order, funding, minute simulation, music, credits, close/save, temporary cleanup and reopen`);
 }
 assert.deepEqual(result.errors,[]);console.log(JSON.stringify(result));
}catch(error){result.errors.push(error.stack);console.error(error);process.exitCode=1;await page?.screenshot({path:path.join(output,'portable-failure.png')}).catch(()=>{});}
finally{
 if(browser){await page?.evaluate(()=>window.close()).catch(()=>{});await browser.close().catch(()=>{});}
 if(child&&child.exitCode===null){await Promise.race([finished,delay(5000)]).catch(()=>{});if(child.exitCode===null)child.kill();}
 await fs.writeFile(path.join(output,'portable-result.json'),JSON.stringify(result,null,2));
}
