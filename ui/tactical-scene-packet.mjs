// Presentation adapter only: kilometres/north bearings become native metres/yaw.
// No simulation, outcome rolls or campaign state changes belong in this module.
const clamp = (n,lo,hi) => Math.max(lo,Math.min(hi,n));
const finite = (n,fallback=0) => Number.isFinite(n) ? n : fallback;
const position = (p,z=0) => [finite(p[0])*1000,-finite(p[1])*1000,z];
const yaw = ship => finite(ship.heading)-90;
const keyOf = ship => String(ship.id);
const frameIndexes=new WeakMap();
function frameUnit(frame,id,kind){
  let indexes=frameIndexes.get(frame);if(!indexes){indexes={};frameIndexes.set(frame,indexes);}
  const index=indexes[kind] ||= new Map((frame[kind]||[]).map(unit=>[keyOf(unit),unit]));
  return index.get(id);
}

export function tacticalSceneSnapshot(state) {
  return {seconds:state.seconds,ships:state.ships.map(ship=>({...ship,stats:undefined})),
    airstrikes:(state.airstrikes||[]).map(flight=>({...flight}))};
}

function observations(state, previous) {
  const byTime = new Map((state.history?.frames||[]).map(frame=>[frame.seconds,frame]));
  if(previous)byTime.set(previous.seconds,previous);
  if(Array.isArray(state.ships))byTime.set(state.seconds,tacticalSceneSnapshot(state));
  return [...byTime.values()].sort((a,b)=>a.seconds-b.seconds);
}

// Kept public for campaign replays and tests. Gaps in a bounded archive are cuts,
// while ordinary sampled intervals interpolate the actual observed course.
export function tacticalPoseAt(frames,seconds,id,kind='ships',interval=30) {
  let before,after;
  for(const frame of frames){
    const unit=frameUnit(frame,id,kind);if(!unit)continue;
    if(frame.seconds<=seconds)before={unit,seconds:frame.seconds};
    if(frame.seconds>=seconds){after={unit,seconds:frame.seconds};break;}
  }
  before ||= after; after ||= before;if(!before)return null;
  const a=before.unit,b=after.unit,span=after.seconds-before.seconds;
  const fraction=span>0&&span<=interval*1.5?clamp((seconds-before.seconds)/span,0,1):0;
  const turn=((finite(b.heading)-finite(a.heading)+540)%360)-180;
  return {...a,x:a.x+(b.x-a.x)*fraction,y:a.y+(b.y-a.y)*fraction,heading:finite(a.heading)+turn*fraction};
}

export function unrealTacticalPacket(state, options={}) {
  const frames=observations(state,options.previous), interval=state.history?.sampledIntervalSeconds||30;
  const end=clamp(finite(options.replaySeconds,state.seconds),0,state.seconds);
  const from=clamp(finite(options.fromSeconds,end),0,end);
  const rate=clamp(finite(options.speed,(end-from)/Math.max(.001,options.durationSeconds||.5))||20,1,10000);
  // A rolling clock preserves visible smoke and sinking across live step packets.
  const start=Math.max(0,from-rate*12), endTime=(end-start)/rate;
  const durationSeconds=Math.min(90,Math.max(.1,endTime+6));
  const time=seconds=>(seconds-start)/rate;
  const sessionId=String(options.sessionId||state.id||'tactical');
  const animate=options.animate!==false;
  const packet={format:1,campaign:options.campaign||state.metadata?.campaign||'campaign_1922',id:sessionId,
    tacticalSessionId:sessionId,at:end,index:0,movie:true,tactical:true,animate,
    cameraDirector:options.cinematic!==false,eventKey:`${sessionId}:${from}:${end}:${rate}`,
    durationSeconds,elapsedSeconds:time(options.paused?end:from),playbackPaused:!!options.paused,
    historyTruncated:!!state.history?.truncated,events:[],units:[],airstrikes:[],shoreBatteries:[]};
  // A completed static view is an aftermath. Do not freeze a terminal loss at
  // the start of its sinking animation and leave a destroyed hull upright.
  if(options.paused&&state.status==='completed'&&end===state.seconds)packet.elapsedSeconds=durationSeconds;
  const retained=frames.filter((f,i)=>f.seconds<=end&&(f.seconds>=start||frames[i+1]?.seconds>start));
  const records=state.ships||frames.at(-1)?.ships||[];
  const events=state.history?.events||[];
  const sinks=new Map(events.filter(e=>e.kind==='sink').map(e=>[e.targetId,e.seconds]));
  const departures=new Map(events.filter(e=>e.kind==='withdraw'&&e.status==='escaped').map(e=>[e.targetId,e.seconds]));
  const selected=options.selected;
  for(const ship of records){
    const key=keyOf(ship),now=tacticalPoseAt(frames,end,key,'ships',interval);if(!now)continue;
    const groupId=ship.groupId??key, hullIndex=ship.hullIndex||0;
    const points=[];
    const add=(seconds,unit,cut=false)=>{if(unit)points.push({time:Math.max(0,time(seconds)),positionMetres:position([unit.x,unit.y]),headingDegrees:yaw(unit),health:unit.health,cut});};
    add(start,tacticalPoseAt(frames,start,key,'ships',interval));
    let prior=start;
    for(const frame of retained){if(frame.seconds<=start)continue;add(frame.seconds,frameUnit(frame,key,'ships'),frame.seconds-prior>interval*1.5);prior=frame.seconds;}
    if(points.at(-1)?.time!==endTime)add(end,now,end-prior>interval*1.5);
    const loss=Number.isFinite(ship.sunkAt)?ship.sunkAt:sinks.get(key);
    const lost=Number.isFinite(loss)&&loss<=end;
    const escaped=now.status==='escaped';
    const escapedAt=ship.escapedAt??departures.get(key)??frames.find(f=>frameUnit(f,key,'ships')?.status==='escaped')?.seconds??end;
    const row={key,id:String(groupId),side:ship.side,hullIndex,classId:ship.classId,type:ship.type,label:ship.name,
      campaign:state.metadata?.modelCampaigns?.[ship.classId]||packet.campaign,
      positionMetres:position([now.x,now.y]),headingDegrees:yaw(now),health:now.health,sunk:lost,
      trajectory:points.slice(-128),appearsAt:0,...(lost?{lostAtSeconds:Math.max(0,time(loss))}:{}),
      ...(escaped?{disappearsAt:Math.max(0,time(escapedAt))}:{}),
      selected:selected?.key===key||selected?.id===key||selected?.side===ship.side&&String(selected.id)===String(groupId)&&(selected.hullIndex||0)===hullIndex};
    if(ship.hiddenFromScene||ship.type==='FORT')packet.shoreBatteries.push(row);else packet.units.push(row);
  }
  for(const event of events){
    if(event.seconds>end)continue;
    // Depth charges are dropped below water; gun tracers would misrepresent
    // their attack. Retain the confirmed underwater impact without gunfire FX.
    if(event.kind==='salvo'&&event.weapon==='depth charge')continue;
    const type={salvo:'salvo',torpedo:'salvo',impact:'hit',sink:'sink','air-attack':'salvo'}[event.kind];if(!type)continue;
    const at=time(event.seconds),base=type==='sink'?5:type==='hit'?2.4:Math.max(.15,(finite(event.arrivalAt,event.seconds+10)-event.seconds)/rate);
    if(at<0&&type!=='salvo'||at>=durationSeconds||at+base<packet.elapsedSeconds-1)continue;
    const targetKey=event.targetId;if(!targetKey)continue;
    packet.events.push({key:String(event.id),type,sourceKey:event.attackerId||'',targetKey,
      weapon:event.kind==='torpedo'||event.weapon==='torpedo'?'submarine':event.kind==='air-attack'||String(event.weapon).includes('air')?'air':'surface',
      time:at,duration:type==='salvo'?Math.min(base,21600):Math.min(base,durationSeconds-at),hits:event.hits,damage:event.damage,
      ...(event.position?{sourcePositionMetres:position(event.position,event.kind==='air-attack'?450:event.kind==='torpedo'?1:20)}:{}),
      ...(event.targetPosition?{targetPositionMetres:position(event.targetPosition,type==='hit'?15:0)}:{})});
  }
  // One aggregate wing marker travels on its actual route, labelled with the
  // remaining aircraft count; it is never presented as an individual plane.
  const flights=new Map(retained.flatMap(frame=>(frame.airstrikes||[]).map(f=>[keyOf(f),f])));
  for(const [key,flight] of flights){
    const now=tacticalPoseAt(frames,end,key,'airstrikes',interval);if(!now)continue;
    const observed=frames.filter(f=>frameUnit(f,key,'airstrikes'));
    const first=observed[0].seconds,last=observed.at(-1).seconds;
    const gone=frames.find(f=>f.seconds>last&&!frameUnit(f,key,'airstrikes'))?.seconds;
    const points=[];for(const frame of retained){const f=frameUnit(frame,key,'airstrikes');if(f)points.push({time:Math.max(0,time(frame.seconds)),positionMetres:position([f.x,f.y],800),headingDegrees:yaw(f),planes:f.planes,fighters:f.fighters||0});}
    packet.airstrikes.push({key,side:flight.side,planes:now.planes,fighters:now.fighters||0,phase:now.phase,
      appearsAt:Math.max(0,time(first)),...(gone!=null?{disappearsAt:Math.max(0,time(gone))}:{}),
      positionMetres:position([now.x,now.y],800),headingDegrees:yaw(now),trajectory:points.slice(-128)});
  }
  packet.events=packet.events.slice(-4096);
  return packet;
}

export function buildTacticalMovie(report){
  const combat=report.tactical;if(!combat?.history?.frames?.length||!(combat.seconds>0))return null;
  const duration=clamp(20+Math.sqrt(combat.seconds)*.7,30,90),speed=combat.seconds/(duration-6);
  const packet=unrealTacticalPacket(combat,{sessionId:String(report.id),fromSeconds:0,replaySeconds:combat.seconds,speed,paused:false});
  const frames=report.replay?.frames||[];
  return {report:structuredClone(report),reportId:String(report.id),durationSeconds:packet.durationSeconds,
    frameTimes:frames.map(frame=>Math.min(duration-6,(frame.tacticalSeconds??Math.max(0,(frame.at-report.startedAt)*60))/speed)),
    frameCount:frames.length,recordedUntil:frames.at(-1)?.at??report.completedAt??report.minute,
    partial:report.status==='ongoing',gapCount:combat.history.truncated?1:0,tactical:true,
    units:packet.units.map(unit=>({...unit,campaign:combat.metadata?.modelCampaigns?.[unit.classId]||combat.metadata?.campaign,
      name:unit.label,sunkHull:unit.sunk})),airstrikes:packet.airstrikes,shoreBatteries:packet.shoreBatteries,events:packet.events,
    omittedVisualEvents:combat.history.omittedEvents||0};
}
