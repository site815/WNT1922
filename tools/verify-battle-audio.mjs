// Browser WebAudio PCM verification. This measures synthesis, the production
// compressed mix, stereo placement and lifecycle; it is not speaker listening.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
import {createGameServer} from '../worker/desktop/server.mjs';
let playwright;
try{playwright=createRequire(import.meta.url)('playwright');}
catch{playwright=createRequire(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'))('playwright');}
const output=path.resolve(process.argv.find(arg=>arg.startsWith('--output='))?.slice(9)||'test-output/battle-audio-upgrade');await fs.mkdir(output,{recursive:true});
const saveDir=await fs.mkdtemp(path.join(output,'saves-'));
const server=await createGameServer({saveDir});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;const report={passed:false,errors:[],cues:[],master:[],limitations:['Actual browser-generated PCM was measured. No claim of speaker listening or historical recording authenticity.','Layered voices are original procedural synthesis and use no external audio downloads.','The battle bus is measured separately from music and UI alerts, which have their own volume controls.']};
function wave(channels,sampleRate){
  const count=channels.length,length=channels[0].length,bytes=Buffer.alloc(44+length*count*2);
  bytes.write('RIFF');bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVE',8);bytes.write('fmt ',12);
  bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(count,22);
  bytes.writeUInt32LE(sampleRate,24);bytes.writeUInt32LE(sampleRate*count*2,28);bytes.writeUInt16LE(count*2,32);bytes.writeUInt16LE(16,34);
  bytes.write('data',36);bytes.writeUInt32LE(length*count*2,40);
  for(let i=0;i<length;i++)for(let channel=0;channel<count;channel++)bytes.writeInt16LE(Math.round(Math.max(-1,Math.min(1,channels[channel][i]))*32767),44+(i*count+channel)*2);
  return bytes;
}
try{
  browser=await playwright.chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage();page.on('pageerror',error=>report.errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/favicon.ico`);
  const result=await page.evaluate(async()=>{
    const sound=await import('/ui/sound.mjs'),rate=24000;
    const stats=samples=>{
      let peak=0,energy=0,earlyEnergy=0,changes=0,variation=0,nonzero=0,lastSignal=0,low=0,bassEnergy=0;
      const coefficient=1-Math.exp(-2*Math.PI*180/rate);
      for(let i=0;i<samples.length;i++){
        const value=samples[i];if(!Number.isFinite(value))throw new Error('Non-finite PCM');
        peak=Math.max(peak,Math.abs(value));energy+=value*value;if(i<rate*2)earlyEnergy+=value*value;
        low+=coefficient*(value-low);bassEnergy+=low*low;
        if(Math.abs(value)>1e-6){nonzero++;lastSignal=i/rate;}
        if(i){variation+=Math.abs(value-samples[i-1]);if(value*samples[i-1]<0)changes++;}
      }
      const rms=Math.sqrt(energy/samples.length),firstTwoSecondsRms=Math.sqrt(earlyEnergy/Math.min(rate*2,samples.length));
      return{peak,rms,rmsDbFS:20*Math.log10(rms||1e-12),firstTwoSecondsRms,bassRms:Math.sqrt(bassEnergy/samples.length),zeroCrossings:changes,variation,nonzero,lastSignal,clipped:samples.filter(value=>Math.abs(value)>=1).length};
    };
    const capture=buffer=>({left:stats(buffer.getChannelData(0)),right:stats(buffer.getChannelData(1)),channels:Array.from({length:buffer.numberOfChannels},(_,index)=>Array.from(buffer.getChannelData(index)))});
    const warmContext=new OfflineAudioContext(2,48000*4,48000),warmStarted=performance.now();
    let heartbeats=0,longestGap=0,lastBeat=performance.now();
    const heartbeat=setInterval(()=>{const now=performance.now();longestGap=Math.max(longestGap,now-lastBeat);lastBeat=now;heartbeats++;},10);
    const prewarmed=await sound.prewarmBattleSounds(warmContext);clearInterval(heartbeat);
    const warmupMs=performance.now()-warmStarted,cachedCalls=[];
    for(const kind of Object.keys(sound.BATTLE_SOUND_PROFILES)){
      const at=performance.now(),voice=sound.synthesizeBattleSound(warmContext,warmContext.destination,kind,{key:'cached-'+kind});
      cachedCalls.push({kind,milliseconds:performance.now()-at});voice.stop();
    }
    const worker={prewarmed,warmupMs,heartbeats,longestHeartbeatGapMs:longestGap,cachedCalls};
    const cues=[];
    for(const [kind,profile]of Object.entries(sound.BATTLE_SOUND_PROFILES)){
      const audio=new OfflineAudioContext(2,Math.ceil(rate*(profile.duration+.15)),rate);
      const start=performance.now();sound.synthesizeBattleSound(audio,audio.destination,kind,{intensity:.85,key:'audit-'+kind});const coldMs=performance.now()-start;
      const rendered=capture(await audio.startRendering());
      cues.push({kind,description:profile.description,duration:profile.duration,coldSynthesisMs:coldMs,...rendered});
    }
    const denseContext=new OfflineAudioContext(2,rate*10,rate),bus=sound.createBattleMix(denseContext,denseContext.destination,{level:.95});
    const denseKinds=['gun','gun','gun','impact','impact','depth-charge','torpedo','splash','air','sinking','gun','impact'];
    for(const [i,kind]of denseKinds.entries())sound.synthesizeBattleSound(denseContext,bus.input,kind,{intensity:1,at:(i%3)*.08,pan:(i%5-2)*.3,key:'dense-'+i});
    const dense=capture(await denseContext.startRendering());
    const stereo=[];
    for(const pan of [-.8,.8]){
      const audio=new OfflineAudioContext(2,rate*4,rate);sound.synthesizeBattleSound(audio,audio.destination,'impact',{pan,intensity:.8,key:'pan'});
      const buffer=await audio.startRendering();stereo.push({pan,left:stats(buffer.getChannelData(0)),right:stats(buffer.getChannelData(1))});
    }
    const flightContext=new OfflineAudioContext(2,rate*2,rate);
    sound.synthesizeBattleSound(flightContext,flightContext.destination,'shell-flight',{duration:.3,intensity:.85});
    const compressedFlight=stats((await flightContext.startRendering()).getChannelData(0));
    const master=[];const original=globalThis.AudioContext;
    try{
      for(const [label,volume,mute,stop]of [['quarter',.25,false,false],['three-quarter',.75,false,false],['muted',.75,true,false],['owner-stopped',.75,false,true]]){
        const offline=new OfflineAudioContext(2,rate*4,rate);
        const wrapper=new Proxy(offline,{get(target,key){if(key==='state')return'running';const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}});
        globalThis.AudioContext=class{constructor(){return wrapper;}};
        const module=await import(`/ui/sound.mjs?pcm=${label}`);
        module.soundSettings(true,volume);module.unlockSound();const owner=Symbol(label);
        const played=module.playBattleSound('gun',{owner,key:'gain-check',intensity:.9});
        if(mute)module.soundSettings(false,volume);if(stop)module.stopBattleSounds(owner);
        const buffer=await offline.startRendering();master.push({label,played,...stats(buffer.getChannelData(0)),preferences:module.soundPreferences(),status:module.soundStatus()});
      }
    }finally{globalThis.AudioContext=original;}
    const {BattleAudioController}=await import('/ui/battle-audio.mjs');
    const controller=new BattleAudioController({canPlay:()=>true,play:()=>true,stop:()=>{}});
    const packet={id:'timers',eventKey:'one',durationSeconds:2,elapsedSeconds:0,playbackPaused:false,events:[]};
    controller.update(packet);controller.pause();controller.update(packet);controller.reset();controller.update(packet);controller.destroy();
    return{cues,dense,stereo,master,worker,compressedFlight,controller:controller.diagnostics(),sampleRate:rate};
  });
  for(const {channels,...cue}of result.cues){
    for(const channel of [cue.left,cue.right]){
      assert.ok(channel.peak>.1&&channel.peak<1,`${cue.kind}: finite, nonzero, unclipped stereo PCM`);
      assert.ok(channel.rms>.015&&channel.nonzero>1000&&channel.lastSignal<=cue.duration+.05,`${cue.kind}: substantial, bounded signal`);
      assert.equal(channel.clipped,0);
    }
    await fs.writeFile(path.join(output,`${cue.kind}.wav`),wave(channels,result.sampleRate));report.cues.push(cue);
  }
  assert.equal(new Set(report.cues.map(cue=>`${cue.left.zeroCrossings}:${cue.left.variation.toFixed(3)}`)).size,8,'Every cue has distinct spectral/temporal output');
  assert.ok(report.cues.find(cue=>cue.kind==='gun').left.bassRms>.03,'Broadside includes sustained low-frequency body');
  assert.ok(report.cues.find(cue=>cue.kind==='sinking').left.lastSignal>6,'Sinking retains prolonged structural/water decay');
  const {channels,...dense}=result.dense;report.denseMix={voiceCount:12,...dense};
  for(const channel of [dense.left,dense.right]){assert.ok(channel.peak<.94&&channel.rms>.025,'Dense mix has controlled unclipped energy');assert.equal(channel.clipped,0);}
  await fs.writeFile(path.join(output,'dense-battle-mix.wav'),wave(channels,result.sampleRate));
  report.stereo=result.stereo;
  assert.ok(result.stereo[0].left.rms>result.stereo[0].right.rms*3,'Left impact is audibly left-weighted');
  assert.ok(result.stereo[1].right.rms>result.stereo[1].left.rms*3,'Right impact is audibly right-weighted');
  report.compressedFlight=result.compressedFlight;
  assert.ok(result.compressedFlight.peak>.05&&result.compressedFlight.lastSignal<=.301,'Accelerated shell whistle stops at its recorded arrival instead of continuing after impact');
  report.master=result.master;report.controller=result.controller;report.worker=result.worker;
  assert.ok(result.worker.prewarmed,'The real same-origin synthesis worker prepares every variant');
  assert.ok(result.worker.heartbeats>0,'The UI event loop keeps running while PCM is generated');
  assert.ok(result.worker.cachedCalls.every(call=>call.milliseconds<12),'Prepared voice creation does not repeat expensive PCM construction');
  const [quarter,threeQuarter,muted,stopped]=result.master;
  assert.ok(quarter.peak>0&&threeQuarter.peak>quarter.peak&&quarter.played&&threeQuarter.played);
  assert.ok(Math.abs(quarter.peak/threeQuarter.peak-1/3)<.00001,'Actual battle bus gain tracks volume');
  assert.equal(muted.peak,0,'SFX off silences already-scheduled layered voices and their tails');
  assert.equal(stopped.peak,0,'Owner stop cancels the complete PCM voice before rendering');
  assert.equal(stopped.status.battleVoiceCount,0);assert.equal(result.controller.timerScheduled,false);
  try{
    const baseline=JSON.parse(await fs.readFile('test-output/046-audio/report.json','utf8'));
    report.comparison=report.cues.filter(cue=>baseline.cues.some(old=>old.kind===cue.kind)).map(cue=>{const old=baseline.cues.find(item=>item.kind===cue.kind);return{kind:cue.kind,previousRawRmsOverTwoSeconds:old.rms,newRawRmsFirstTwoSeconds:cue.left.firstTwoSecondsRms,energyGainDb:20*Math.log10(cue.left.firstTwoSecondsRms/old.rms),note:'Raw synthesis comparison; previous render intensity .75, new .85. New duration and mix processing are reported separately.'};});
  }catch{}
  assert.deepEqual(report.errors,[]);report.passed=true;console.log(JSON.stringify({passed:true,output,worker:report.worker,cues:report.cues.map(cue=>({kind:cue.kind,peak:cue.left.peak,rmsDbFS:cue.left.rmsDbFS,duration:cue.duration,coldSynthesisMs:cue.coldSynthesisMs})),dense:report.denseMix,comparison:report.comparison},null,2));
}catch(error){report.errors.push(error.stack);throw error;}
finally{await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));await browser?.close();await new Promise(resolve=>server.close(resolve));}
