import {battleInstances} from './battle-watch.mjs';
import {battleVisualEvents} from './battle-events.mjs';
import {TICK_MINUTES} from '../mechanics/campaign-clock.mjs';
import {buildTacticalMovie} from './tactical-scene-packet.mjs';

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const MAX_MOVIE_EVENTS=4096;
export const MAX_MOVIE_FRAMES=128;

// A movie is a frozen copy of retained observations. It has no simulation
// client, combat rolls or campaign clock. Tactical tracks use recorded physics;
// older aggregate reports retain their explicitly labelled illustrations.
export function buildBattleMovie(report) {
  if(report.tactical?.ships?.length)return buildTacticalMovie(report);
  const source=report.replay?.frames || [];
  if(source.length<2)return null;
  const snapshot=structuredClone(report);
  if(source.length>MAX_MOVIE_FRAMES){snapshot.replay.frames=[source[0],...source.slice(1-MAX_MOVIE_FRAMES)].map(frame=>structuredClone(frame));snapshot.replay.truncated=true;}
  const frames=snapshot.replay.frames;
  const raw=frames.map((frame,index)=>battleVisualEvents(snapshot,frame,index));
  const active=raw.filter(events=>events.length).length;
  const durationSeconds=clamp(12+active*7,20,90),tail=8;
  const weights=frames.slice(1).map((frame,i)=>raw[i+1].length?4:frame.stage!==frames[i].stage?1.4:.15);
  const weight=weights.reduce((sum,value)=>sum+value,0);
  const times=[0];for(const value of weights)times.push(times.at(-1)+(durationSeconds-tail)*value/weight);
  const events=[];
  for(let index=1;index<frames.length;index++){
    const width=Math.min(8,index+1<times.length?times[index+1]-times[index]:tail);
    for(const event of raw[index]){
      const phase=event.type==='salvo'?.04:event.type==='hit'?.34:.55;
      const time=times[index]+width*(phase+(event.time%1)*.03);
      const desired=event.type==='sink'?5.5:event.type==='hit'?2.8:width*.22;
      events.push({...event,time,duration:Math.min(desired,durationSeconds-time),frameIndex:index});
    }
  }
  events.sort((a,b)=>a.time-b.time||a.key.localeCompare(b.key));
  const hulls=new Map(),firstSink=new Map();
  for(const event of events)if(event.type==='sink')firstSink.set(event.targetKey,event.time);
  let gapCount=0;
  for(let index=0;index<frames.length;index++){
    const frame=frames[index],cut=index>0&&frame.at-frames[index-1].at!==TICK_MINUTES;
    if(cut)gapCount++;
    const elapsed=Math.max(0,frame.at-snapshot.startedAt);
    for(const unit of battleInstances(frame,snapshot.startedAt)){
      let row=hulls.get(unit.key);
      if(!row){row={...unit,appearsAt:times[index],lostAtSeconds:null,trajectory:[]};hulls.set(unit.key,row);}
      const position=[...unit.positionMetres];
      position[1]*=2.3; // Room for full-length hulls while columns turn.
      // Recorded stages supply the order; an opposing column's modest lateral
      // travel makes its course readable without pretending to be tactical truth.
      position[1]+=(unit.side==='A'?1:-1)*Math.min(1600,elapsed*3.5);
      row.trajectory.push({time:times[index],positionMetres:position,headingDegrees:unit.heading*180/Math.PI,cut});
      Object.assign(row,{health:unit.health,sunkHull:unit.sunkHull,name:unit.name});
      if(unit.sunkHull&&row.lostAtSeconds==null)row.lostAtSeconds=firstSink.get(unit.key)??times[index];
    }
  }
  for(const unit of hulls.values()){
    const track=unit.trajectory;
    for(let i=0;i<track.length;i++){
      const next=track[i+1],previous=track[i-1],a=next&&!next.cut?track[i]:previous&&!track[i].cut?previous:null,b=next&&!next.cut?next:a?track[i]:null;
      if(a&&b){const dx=b.positionMetres[0]-a.positionMetres[0],dy=b.positionMetres[1]-a.positionMetres[1];if(Math.hypot(dx,dy)>.01)track[i].headingDegrees=Math.atan2(dy,dx)*180/Math.PI;}
    }
    unit.positionMetres=track.at(-1).positionMetres;
    unit.headingDegrees=track.at(-1).headingDegrees;
  }
  return {report:snapshot,reportId:String(report.id),durationSeconds,frameTimes:times,frameCount:frames.length,
    recordedUntil:frames.at(-1).at,partial:report.status==='ongoing',gapCount,
    units:[...hulls.values()],events:events.slice(0,MAX_MOVIE_EVENTS),omittedVisualEvents:Math.max(0,events.length-MAX_MOVIE_EVENTS)};
}

export function movieFrameIndex(plan,seconds) {
  let index=0;for(let i=1;i<plan.frameTimes.length;i++){if(seconds<plan.frameTimes[i])break;index=i;}return index;
}

// Presentation-only clock, injected in tests. Pausing freezes both the chapter
// UI and the native clock. Reopening/restarting gets a distinct playback key.
export class RecordedBattleMovie {
  constructor({onChange=()=>{},now=()=>performance.now(),schedule=fn=>setTimeout(fn,100),cancel=id=>clearTimeout(id)}={}) {
    Object.assign(this,{onChange,now,schedule,cancel});this.serial=0;this.plan=null;this.timer=null;
  }
  start(report){const plan=buildBattleMovie(report);if(!plan)return false;this.stop(false);this.plan=plan;this.key=`movie:${plan.reportId}:${plan.recordedUntil}:${++this.serial}`;this.elapsed=0;this.startedAt=this.now();this.paused=false;this.notify();this.arm();return true;}
  seconds(){return this.plan?clamp(this.elapsed+(this.paused?0:(this.now()-this.startedAt)/1000),0,this.plan.durationSeconds):0;}
  state(){if(!this.plan)return null;const elapsedSeconds=this.seconds();return{plan:this.plan,key:this.key,elapsedSeconds,paused:this.paused,ended:elapsedSeconds>=this.plan.durationSeconds,frameIndex:movieFrameIndex(this.plan,elapsedSeconds)};}
  notify(){this.onChange(this.state());}
  arm(){if(this.timer!=null||this.paused||!this.plan)return;this.timer=this.schedule(()=>{this.timer=null;if(!this.plan)return;if(this.seconds()>=this.plan.durationSeconds){this.elapsed=this.plan.durationSeconds;this.paused=true;}this.notify();this.arm();});}
  toggle(){if(!this.plan||this.seconds()>=this.plan.durationSeconds)return;this.elapsed=this.seconds();this.paused=!this.paused;this.startedAt=this.now();if(this.timer!=null){this.cancel(this.timer);this.timer=null;}this.notify();this.arm();}
  pause(){if(this.plan&&!this.paused)this.toggle();}
  stop(notify=true){if(this.timer!=null)this.cancel(this.timer);this.timer=null;this.plan=null;if(notify)this.notify();}
}
