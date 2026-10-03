// Browser WebAudio rendering, not a mocked graph: verifies generated PCM and
// the real shared gain/mute path without requiring speakers or recording input.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
import {createGameServer} from '../worker/desktop/server.mjs';
let playwright;
try{playwright=createRequire(import.meta.url)('playwright');}
catch{playwright=createRequire(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'))('playwright');}
const output=path.resolve('test-output/046-audio');await fs.mkdir(output,{recursive:true});
const saveDir=await fs.mkdtemp(path.join(output,'saves-'));
const server=await createGameServer({saveDir});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;const report={passed:false,errors:[],cues:[],master:[]};
function wave(samples,sampleRate){
  const bytes=Buffer.alloc(44+samples.length*2);
  bytes.write('RIFF');bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVE',8);bytes.write('fmt ',12);
  bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);
  bytes.writeUInt32LE(sampleRate,24);bytes.writeUInt32LE(sampleRate*2,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);
  bytes.write('data',36);bytes.writeUInt32LE(samples.length*2,40);
  for(let i=0;i<samples.length;i++)bytes.writeInt16LE(Math.round(Math.max(-1,Math.min(1,samples[i]))*32767),44+i*2);
  return bytes;
}
try{
  browser=await playwright.chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage();page.on('pageerror',error=>report.errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/favicon.ico`);
  const result=await page.evaluate(async()=>{
    const sound=await import('/ui/sound.mjs'),rate=24000,length=rate*2;
    const stats=samples=>{
      let peak=0,energy=0,changes=0,variation=0,nonzero=0,lastSignal=0;
      for(let i=0;i<samples.length;i++){
        const value=samples[i];peak=Math.max(peak,Math.abs(value));energy+=value*value;
        if(Math.abs(value)>1e-6){nonzero++;lastSignal=i/rate;}
        if(i){variation+=Math.abs(value-samples[i-1]);if(value*samples[i-1]<0)changes++;}
      }
      return{peak,rms:Math.sqrt(energy/samples.length),zeroCrossings:changes,variation,nonzero,lastSignal};
    };
    const cues=[];
    for(const kind of ['gun','impact','splash','torpedo','air','sinking','depth-charge']){
      const audio=new OfflineAudioContext(1,length,rate);
      sound.synthesizeBattleSound(audio,audio.destination,kind,{intensity:.75});
      const samples=(await audio.startRendering()).getChannelData(0);
      cues.push({kind,...stats(samples),samples:Array.from(samples)});
    }
    const master=[];
    const original=globalThis.AudioContext;
    try{
      for(const [label,volume,mute]of[['quarter',.25,false],['three-quarter',.75,false],['muted',.75,true]]){
        const offline=new OfflineAudioContext(1,length,rate);
        // Use a real offline destination and graph. Only the running state is
        // adapted so the normal user-unlocked production wrapper can schedule.
        const wrapper=new Proxy(offline,{get(target,key){
          if(key==='state')return'running';
          const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
        }});
        globalThis.AudioContext=class{constructor(){return wrapper;}};
        const module=await import(`/ui/sound.mjs?pcm=${label}`);
        module.soundSettings(true,volume);module.unlockSound();module.playSound('click');
        if(mute)module.soundSettings(false,volume);
        const samples=(await offline.startRendering()).getChannelData(0);
        master.push({label,...stats(samples),preferences:module.soundPreferences()});
      }
    }finally{globalThis.AudioContext=original;}
    // Exercise default browser host timers; detached clearTimeout calls must
    // not accidentally receive the controller object as their Window receiver.
    const {BattleAudioController}=await import('/ui/battle-audio.mjs');
    const controller=new BattleAudioController({canPlay:()=>true,play:()=>true,stop:()=>{}});
    const packet={id:'timers',eventKey:'one',durationSeconds:2,elapsedSeconds:0,playbackPaused:false,events:[]};
    controller.update(packet);controller.pause();controller.update(packet);controller.reset();controller.update(packet);controller.destroy();
    return{cues,master,controller:controller.diagnostics(),sampleRate:rate};
  });
  for(const {samples,...cue}of result.cues){
    assert.ok(cue.peak>.001&&cue.peak<1,`${cue.kind}: finite, nonzero, unclipped PCM`);
    assert.ok(cue.rms>.0001&&cue.nonzero>100&&cue.lastSignal<=1.81,`${cue.kind}: bounded audible lifetime`);
    await fs.writeFile(path.join(output,`${cue.kind}.wav`),wave(samples,result.sampleRate));report.cues.push(cue);
  }
  assert.equal(new Set(report.cues.map(cue=>`${cue.zeroCrossings}:${cue.variation.toFixed(3)}`)).size,7,'Every cue has distinct spectral/temporal output');
  report.master=result.master;report.controller=result.controller;
  const [quarter,threeQuarter,muted]=result.master;
  assert.ok(quarter.peak>0&&threeQuarter.peak>quarter.peak);
  assert.ok(Math.abs(quarter.peak/threeQuarter.peak-1/3)<.00001,'Actual shared gain tracks volume');
  assert.equal(muted.peak,0,'SFX off silences already-scheduled audio through the actual master gain');
  assert.equal(result.controller.timerScheduled,false);assert.deepEqual(report.errors,[]);
  report.passed=true;console.log(JSON.stringify(report,null,2));
}catch(error){report.errors.push(error.stack);throw error;}
finally{
  await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));
  await browser?.close();await new Promise(resolve=>server.close(resolve));
}
