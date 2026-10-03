// Original deterministic stereo synthesis. Pure PCM construction is shared by
// the local warm-up worker and the synchronous unsupported-worker fallback.
export const BATTLE_SOUND_PROFILES=Object.freeze({
  gun:Object.freeze({duration:3.25,priority:2,description:'Staggered heavy reports, pressure crack, bass recoil and rolling open-air tail'}),
  impact:Object.freeze({duration:2.8,priority:4,description:'Explosive pressure, ringing steel fragments and low hull resonance'}),
  splash:Object.freeze({duration:2.6,priority:1,description:'Water-column thump, foaming spray and falling water'}),
  torpedo:Object.freeze({duration:2.35,priority:2,description:'Tube release, compressed-air rush and underwater propeller churn'}),
  air:Object.freeze({duration:5.1,priority:2,description:'Layered piston engines, propeller beating and a receding Doppler pass'}),
  sinking:Object.freeze({duration:7.2,priority:5,description:'Hull fracture, changing steel resonance, deep collapse and prolonged water ingress'}),
  'depth-charge':Object.freeze({duration:3.4,priority:4,description:'Muffled underwater detonation, pressure pulses and rising disturbed water'}),
  'shell-flight':Object.freeze({duration:1.1,priority:1,description:'Approaching turbulent shell whistle; no predicted explosion'}),
});

export function variantSeed(value) {
  let hash=2166136261;
  for(const ch of String(value??0)){hash^=ch.charCodeAt(0);hash=Math.imul(hash,16777619);}
  return hash>>>0;
}
export function renderBattlePCM(kind,variant=0,rate=24000) {
  const spec=BATTLE_SOUND_PROFILES[kind];
  if(!spec)throw new Error('Unknown battle sound: '+kind);
  rate=Math.max(8000,Math.min(24000,Number.isFinite(rate)?Math.round(rate):24000));
  const length=Math.ceil(spec.duration*rate);
  const dry=new Float32Array(length);let seed=variantSeed(kind+variant)||1;
  const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
  const envelope=(t,duration,attack,decay)=>Math.min(1,t/Math.max(.0002,attack))*Math.exp(-t/decay)*Math.min(1,(duration-t)/.035);
  const layer=(start,duration,amplitude,lowpass=3000,highpass=0,attack=.002,decay=duration*.22)=>{
    const lo=1-Math.exp(-2*Math.PI*lowpass/rate),hi=1-Math.exp(-2*Math.PI*highpass/rate);
    const makeup=Math.min(7,Math.sqrt(rate/(4*Math.max(80,lowpass))));let low=0,high=0;
    const begin=Math.floor(start*rate),end=Math.min(length,begin+Math.ceil(duration*rate));
    for(let i=begin;i<end;i++){
      low+=lo*((random()*2-1)-low);high+=hi*(low-high);
      dry[i]+=(low-high)*makeup*amplitude*envelope((i-begin)/rate,duration,attack,decay);
    }
  };
  const tone=(start,duration,amplitude,from,to,decay=duration*.28,attack=.004,grit=0)=>{
    let phase=random()*Math.PI*2;
    const begin=Math.floor(start*rate),end=Math.min(length,begin+Math.ceil(duration*rate));
    for(let i=begin;i<end;i++){
      const t=(i-begin)/rate,p=t/duration;phase+=Math.PI*2*(to+(from-to)*Math.exp(-p*4))/rate;
      dry[i]+=(Math.sin(phase)+grit*Math.sin(phase*2.71))*amplitude*envelope(t,duration,attack,decay);
    }
  };
  const blast=(at,weight=1,bass=82)=>{
    layer(at,.13,.65*weight,6200,400,.001,.035);
    layer(at+.012,.75,.9*weight,650,70,.003,.21);
    layer(at+.07,2,.38*weight,190,25,.025,.5);
    tone(at,.95,.88*weight,bass,bass*.4,.32,.002,.08);
  };
  if(kind==='gun'){
    // Three irregular pressure fronts create the texture of a heavy salvo.
    for(const [i,w]of [1,.62,.46].entries())blast(i*(.073+variant*.008),w,92-variant*5);
    layer(.18,2.6,.23,420,35,.04,.8);
  }else if(kind==='impact'){
    blast(0,.9,110);layer(.014,.24,.66,8500,1000,.001,.06);
    for(const [index,f]of [181,293,467,733].entries())tone(.015+index*.013,1.7,.19/(1+index*.3),f,f*.83,.4,.001,.32);
    for(let i=0;i<5;i++)layer(.13+i*.11,.15,.2/(1+i*.25),5500,750,.001,.03);
  }else if(kind==='splash'){
    tone(0,.65,.52,95,38,.18,.004);layer(.035,1.35,.8,1300,90,.06,.34);
    layer(.23,2.25,.48,6400,600,.13,.66);
    for(let i=0;i<8;i++)layer(.35+i*.19,.16,.14,3100,350,.018,.07);
  }else if(kind==='torpedo'){
    tone(0,.28,.45,180,75,.055,.001,.3);layer(.015,.63,.65,2100,250,.012,.17);
    layer(.18,1.7,.36,600,35,.16,.65);
    for(let i=0;i<8;i++)tone(.22+i*.17,.3,.12,95+i*2,55,.085,.01);
  }else if(kind==='air'){
    // A three-engine harmonic bed beats slowly; the pitch bends past the listener.
    const begin=0,end=Math.floor(rate*4.9);let phases=[0,.6,1.8];
    for(let i=begin;i<end;i++){
      const t=i/rate,p=t/4.9,amp=Math.pow(Math.sin(Math.PI*p),1.35),f=118-65/(1+Math.exp(-(p-.51)*14));
      let engines=0;
      for(let j=0;j<3;j++){phases[j]+=Math.PI*2*(f*(1+j*.023)+Math.sin(t*2+j)*.9)/rate;engines+=(Math.sin(phases[j])*.55+Math.sin(phases[j]*2)*.26+Math.sin(phases[j]*3)*.13)*(1+.1*Math.sin(t*37+j));}
      dry[i]+=engines*amp*.31;
    }
    layer(.05,4.8,.22,1800,100,.8,4.5);layer(1.1,3.8,.28,4600,550,.6,1.5);
  }else if(kind==='sinking'){
    blast(.1,.43,64);layer(.2,6.8,.37,600,30,.45,2.5);
    for(let i=0;i<6;i++){
      const at=.35+i*.83;
      tone(at,1.4,.28,125-i*9,37+i*2,.52,.09,.28);
      layer(at+.16,.24,.3,3400,320,.002,.06);
    }
    layer(1.1,5.9,.32,2800,190,.5,2.5);tone(2.3,3.8,.38,48,29,1.5,.15);
  }else if(kind==='depth-charge'){
    tone(0,1.1,1.1,76,28,.37,.003);layer(.005,1.35,.85,340,28,.006,.34);
    for(let i=1;i<4;i++)tone(i*.24,.58,.4/(i+.3),64,31,.15,.008);
    layer(.16,2.7,.36,1300,110,.18,.8);
  }else if(kind==='shell-flight'){
    let phase=0;
    for(let i=0;i<Math.min(length,Math.ceil(rate*.98));i++){
      const t=i/rate,p=t/.98,envelope=Math.pow(Math.sin(Math.PI*p),1.1);
      phase+=Math.PI*2*(1700-1150*p+55*Math.sin(t*41))/rate;
      dry[i]+=(Math.sin(phase)*.16+Math.sin(phase*1.43)*.09)*envelope;
    }
    layer(0,1.05,.26,4500,750,.3,.9);
  }
  const left=new Float32Array(length),right=new Float32Array(length);
  // Small stereo differences in reflected/rolling energy give width, without
  // pretending the listener is inside a reverberant room on the open sea.
  let peak=0;
  for(let side=0;side<2;side++){
    const samples=side?right:left;
    for(let i=0;i<length;i++)samples[i]=dry[i];
    for(const [tap,weight]of [[.071,.15],[.139,.12],[.227,.085],[.391,.058],[.617,.035]]){
      const delay=Math.round((tap+side*.011+variant*.001)*rate);
      for(let i=delay;i<length;i++)samples[i]+=dry[i-delay]*weight;
    }
    let dc=0;
    for(let i=0;i<length;i++){
      const shaped=Math.tanh(samples[i]*.85);dc+=.002*(shaped-dc);
      samples[i]=(shaped-dc)*Math.min(1,i/(rate*.001),(length-1-i)/(rate*.075));
      peak=Math.max(peak,Math.abs(samples[i]));
    }
  }
  const level=peak>0?.9/peak:1;
  for(const samples of [left,right])for(let i=0;i<length;i++)samples[i]*=level;
  return {channels:[left,right],sampleRate:rate};
}

