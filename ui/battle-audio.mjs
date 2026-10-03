import {playBattleSound, stopBattleSounds, soundStatus} from './sound.mjs';

const finite=(value,fallback=0)=>Number.isFinite(value)?value:fallback;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const weaponKind=weapon=>/depth/i.test(weapon)?'depth-charge':/air/i.test(weapon)?'air':/torpedo|submarine/i.test(weapon)?'torpedo':'gun';

// Both native presentation packets and raw combat records can be audited here.
// A launch's predicted hit count never creates a hit sound: only an observed
// damage event does. A miss splashes at its recorded arrival, not at launch.
export function battleAudioCues(events, {tactical=true,units=[],listener}={}) {
  const cues=[];
  const positions=new Map(units.map(unit=>[String(unit.key??unit.id),unit.positionMetres]));
  const recorded=units.map(unit=>unit.positionMetres).filter(p=>Array.isArray(p)&&Number.isFinite(p[0]));
  if(!recorded.length)for(const event of events||[])for(const key of ['sourcePositionMetres','targetPositionMetres'])if(Array.isArray(event[key]))recorded.push(event[key]);
  const centre=listener?.positionMetres||[recorded.length?recorded.reduce((sum,p)=>sum+p[0],0)/recorded.length:0,recorded.length?recorded.reduce((sum,p)=>sum+p[1],0)/recorded.length:0];
  const right=listener?.right||[1,0],projection=p=>Array.isArray(p)?(p[0]-centre[0])*right[0]+(p[1]-centre[1])*right[1]:0;
  const radius=Math.max(800,...recorded.map(p=>Math.abs(projection(p))));
  const pan=p=>clamp(projection(p)/radius*.78,-.85,.85);
  for(const event of (events||[]).slice(-4096)){
    const type=event.type||event.kind, time=finite(event.time,finite(event.seconds,NaN));
    if(!Number.isFinite(time))continue;
    const identity=String(event.key??event.id??`${type}:${time}:${event.sourceKey??event.attackerId}:${event.targetKey??event.targetId}`);
    const source=event.sourcePositionMetres||positions.get(String(event.sourceKey??event.attackerId));
    const target=event.targetPositionMetres||positions.get(String(event.targetKey??event.targetId));
    const weapon=event.weaponType||event.weapon||'';
    const caliber=finite(event.caliberMm,356),pitch=clamp(1.03-(caliber-203)/1500,.85,1.16);
    const add=(suffix,kind,at,priority,intensity=.85,position=target,extra={})=>{
      if(Number.isFinite(at))cues.push({key:`${identity}:${suffix}`,kind,time:at,priority,intensity,pan:pan(position),pitch:kind==='gun'?pitch:1,...extra});
    };
    if(['salvo','torpedo','air-attack'].includes(type)){
      const kind=type==='torpedo'?'torpedo':type==='air-attack'?'air':weaponKind(weapon);
      const airIntensity=clamp(.62+Math.log2(1+Math.max(0,finite(event.planes,1)))*.035,.65,.87);
      add('launch',kind,time,2,kind==='air'?airIntensity:.9,source,kind==='air'?{endPan:pan(target)}:{});
      // Air damage/misses are observed at the recorded attack time. Its native
      // duration is only a representative attack/egress animation window.
      const arrival=kind==='air'?time:Number.isFinite(event.arrivalAt)?event.arrivalAt:
        Number.isFinite(event.duration)?time+Math.max(0,event.duration):type==='air-attack'?time:NaN;
      if(kind==='gun'&&arrival-time>=.35){
        const flightAt=Math.max(time+.08,arrival-.8);
        add('flight','shell-flight',flightAt,1,.46,source,{endPan:pan(target),duration:arrival-flightAt});
      }
      if(event.hits===0){
        add('miss',kind==='depth-charge'?'depth-charge':'splash',arrival,1,.7);
      }
    } else if(type==='hit'||type==='impact'){
      if(event.damage>0 || !tactical&&event.damage===undefined)
        add('impact',/depth/i.test(weapon)?'depth-charge':'impact',time,4,.8+.18*Math.sqrt(clamp(finite(event.damage,.2),0,1)));
    } else if(type==='sink')add('sink','sinking',time,5,.92);
    else if(type==='air-launch')add('launch','air',time,2,.65,source,{endPan:pan(target)});
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
      if(this.tokens<(cue.priority<=1?1.6:1)){this.dropped++;continue;}
      this.tokens--;
      if(this.play(cue.kind,{owner:this.owner,intensity:cue.intensity,priority:cue.priority,pan:cue.pan,endPan:cue.endPan,pitch:cue.pitch,key:cue.key,duration:cue.duration})!==false)this.played++;
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
    this.cues=battleAudioCues(packet.events,{tactical:!!packet.tactical,units:[...(packet.units||[]),...(packet.shoreBatteries||[])],listener:packet.audioListener});
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
