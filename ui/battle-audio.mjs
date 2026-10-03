import {playBattleSound, stopBattleSounds, soundStatus} from './sound.mjs';

const finite=(value,fallback=0)=>Number.isFinite(value)?value:fallback;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const weaponKind=weapon=>/depth/i.test(weapon)?'depth-charge':/air/i.test(weapon)?'air':/torpedo|submarine/i.test(weapon)?'torpedo':'gun';

// Both native presentation packets and raw combat records can be audited here.
// A launch's predicted hit count never creates a hit sound: only an observed
// damage event does. A miss splashes at its recorded arrival, not at launch.
export function battleAudioCues(events, {tactical=true}={}) {
  const cues=[];
  for(const event of (events||[]).slice(-4096)){
    const type=event.type||event.kind, time=finite(event.time,finite(event.seconds,NaN));
    if(!Number.isFinite(time))continue;
    const identity=String(event.key??event.id??`${type}:${time}:${event.sourceKey??event.attackerId}:${event.targetKey??event.targetId}`);
    const add=(suffix,kind,at,priority,intensity=.75)=>{
      if(Number.isFinite(at))cues.push({key:`${identity}:${suffix}`,kind,time:at,priority,intensity});
    };
    if(['salvo','torpedo','air-attack'].includes(type)){
      const kind=type==='torpedo'?'torpedo':type==='air-attack'?'air':weaponKind(event.weapon||'');
      add('launch',kind,time,2,kind==='air'?.55:.75);
      if(event.hits===0){
        const arrival=Number.isFinite(event.arrivalAt)?event.arrivalAt:
          Number.isFinite(event.duration)?time+Math.max(0,event.duration):type==='air-attack'?time:NaN;
        add('miss',kind==='depth-charge'?'depth-charge':'splash',arrival,1,.55);
      }
    } else if(type==='hit'||type==='impact'){
      if(event.damage>0 || !tactical&&event.damage===undefined)
        add('impact',/depth/i.test(event.weapon||'')?'depth-charge':'impact',time,4);
    } else if(type==='sink')add('sink','sinking',time,5,.85);
    else if(type==='air-launch')add('launch','air',time,2,.45);
  }
  return cues.sort((a,b)=>a.time-b.time||b.priority-a.priority);
}

// The same presentation clock used by the native scene drives audio. A bounded
// real-time mix remains listenable at 120x, while a skipped/paused/hidden/seeked
// interval never produces a catch-up burst. No simulation timers are advanced.
export class BattleAudioController {
  constructor({play=playBattleSound,stop=stopBattleSounds,now=()=>performance.now(),
    schedule=(fn,ms)=>setTimeout(fn,ms),cancel=id=>clearTimeout(id),
    canPlay=()=>{const s=soundStatus();return s.enabled&&s.volume>0&&s.unlocked;},
    hidden=()=>!!globalThis.document?.hidden}={}){
    Object.assign(this,{play,stop,now,schedule,cancel,canPlay,hidden});
    this.owner=Symbol('battle-audio');this.seen=new Set();this.cues=[];
    this.session=null;this.frame=null;this.timer=null;this.active=false;this.destroyed=false;
    this.audible=false;
    this.cursor=0;this.baseElapsed=0;this.baseWall=0;this.duration=0;this.lastWall=0;
    this.tokens=3;this.tokenWall=this.now();this.played=0;this.dropped=0;this.crossed=0;
  }
  #remember(key){
    this.seen.add(key);
    if(this.seen.size>8192)this.seen.delete(this.seen.values().next().value);
  }
  #stop(){
    if(this.timer!==null)this.cancel(this.timer);
    this.timer=null;this.stop(this.owner);
  }
  #clock(wall){return Math.min(this.duration,this.baseElapsed+(this.active?Math.max(0,wall-this.baseWall)/1000:0));}
  #past(elapsed){
    for(const cue of this.cues)if(cue.time<=elapsed)this.#remember(cue.key);
    this.cursor=elapsed;
  }
  #emit(candidates,wall){
    this.tokens=Math.min(3,this.tokens+Math.max(0,wall-this.tokenWall)*.004);this.tokenWall=wall;
    for(const cue of candidates.sort((a,b)=>b.priority-a.priority||a.time-b.time)){
      this.crossed++;
      if(this.tokens<1){this.dropped++;continue;}
      this.tokens--;
      if(this.play(cue.kind,{owner:this.owner,intensity:cue.intensity})!==false)this.played++;
      else this.dropped++;
    }
  }
  #advance(wall){
    const elapsed=this.#clock(wall), stalled=wall-this.lastWall>1000;
    const ready=this.canPlay(),silent=stalled||this.hidden()||!ready||!this.audible, candidates=[];
    for(const cue of this.cues){
      if(cue.time>elapsed || this.seen.has(cue.key))continue;
      this.#remember(cue.key);
      if(cue.time>this.cursor){
        if(silent)this.dropped++;else candidates.push(cue);
      }
    }
    this.cursor=Math.max(this.cursor,elapsed);this.lastWall=wall;
    this.audible=ready;
    if(silent)this.stop(this.owner);else this.#emit(candidates,wall);
  }
  #schedule(){
    if(this.timer!==null || !this.active || this.destroyed || this.cursor>=this.duration || !this.canPlay())return;
    this.timer=this.schedule(()=>{
      this.timer=null;
      if(!this.active||this.destroyed)return;
      this.#advance(this.now());this.#schedule();
    },50);
    this.timer?.unref?.();
  }
  update(packet,{silent=false,seek=false,singleStep=false}={}){
    if(this.destroyed)return;
    if(!packet){this.reset();return;}
    const wall=this.now(), session=String(packet.tacticalSessionId??`${packet.id??'battle'}:${packet.eventKey??''}`);
    const frame=String(packet.eventKey??packet.at??'');
    const changed=session!==this.session, newFrame=frame!==this.frame;
    const duration=clamp(finite(packet.durationSeconds),0,21600), elapsed=clamp(finite(packet.elapsedSeconds),0,duration);
    const active=packet.playbackPaused===false&&packet.animate!==false&&!silent;
    // Drain the old observed window before its relative timestamps move. A
    // pause or quick resolve instead silences its outstanding sounds at once.
    if(this.active && active && !changed && !seek)this.#advance(wall);
    if(changed||seek){
      this.#stop();this.seen.clear();this.cues=[];this.tokens=3;this.tokenWall=wall;
    } else if(!active)this.#stop();
    const wasActive=this.active;
    this.session=session;this.frame=frame;this.duration=duration;
    this.cues=battleAudioCues(packet.events,{tactical:!!packet.tactical});
    this.active=active;
    if(changed||seek||newFrame||!active||!wasActive){
      if(singleStep&&!silent&&!changed&&!seek&&this.canPlay()&&!this.hidden()){
        const candidates=this.cues.filter(cue=>cue.time<=elapsed&&cue.time>elapsed-.3&&!this.seen.has(cue.key));
        for(const cue of candidates)this.#remember(cue.key);
        this.#emit(candidates,wall);
      }
      this.#past(elapsed);this.baseElapsed=elapsed;this.baseWall=wall;this.lastWall=wall;
    }
    // Selection/hover refreshes of an unchanged packet do not restart its
    // clock. Movie packets may give a newer cursor, so consume that interval.
    else if(elapsed>this.#clock(wall)+.05){
      this.baseElapsed=elapsed;this.baseWall=wall;this.#advance(wall);
    }
    this.audible=this.canPlay();
    this.#schedule();
  }
  pause(){
    this.baseElapsed=this.#clock(this.now());this.active=false;this.#stop();
  }
  reset(){
    this.#stop();this.active=false;this.session=null;this.frame=null;this.cues=[];this.seen.clear();
    this.cursor=this.baseElapsed=this.duration=0;
  }
  destroy(){this.reset();this.destroyed=true;}
  diagnostics(){return {session:this.session,playing:this.active,timerScheduled:this.timer!==null,
    elapsedSeconds:this.cursor,played:this.played,dropped:this.dropped,crossed:this.crossed,seenCount:this.seen.size};}
}
