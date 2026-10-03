import {renderBattlePCM} from './battle-synthesis.mjs';
// Same-origin local worker; no network fetches or game-state access.
self.onmessage=({data})=>{
  try{
    const pcm=renderBattlePCM(data.kind,data.variant,data.sampleRate);
    self.postMessage({key:data.key,...pcm},pcm.channels.map(channel=>channel.buffer));
  }catch(error){self.postMessage({key:data.key,error:String(error?.message||error)});}
};
