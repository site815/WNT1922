// Comparison for disposable native test saves. Never normalize gameplay data.
import {createHash} from 'node:crypto';

function normalized(state,{ignoreSaveMetadata,allowNewsAcknowledgements}){
 const result={...state};
 if(ignoreSaveMetadata){delete result.savedAt;delete result.recoveredSave;}
 if(allowNewsAcknowledgements){
  for(const key of ['log','alerts'])if(Array.isArray(result[key]))result[key]=result[key].map(entry=>{
   const {dismissed,...content}=entry;return content;
  });
 }
 return result;
}
function canonical(value){
 if(Array.isArray(value))return value.map(canonical);
 if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])]));
 return value;
}
const digest=value=>createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const brief=value=>{
 if(Array.isArray(value))return `[array of ${value.length}]`;
 if(value&&typeof value==='object')return `[object with ${Object.keys(value).length} keys]`;
 const text=JSON.stringify(value)??'[absent]';return text.length>96?text.slice(0,93)+'...':text;
};

export function compareSavedCampaigns(expected,actual,{ignoreSaveMetadata=true,allowNewsAcknowledgements=false}={}){
 const left=normalized(expected,{ignoreSaveMetadata,allowNewsAcknowledgements});
 const right=normalized(actual,{ignoreSaveMetadata,allowNewsAcknowledgements});
 const expectedSha256=digest(left),actualSha256=digest(right),differences=[];
 let differenceCount=0;
 function record(location,a,b){
  differenceCount++;
  if(differences.length<8)differences.push({path:location.length>180?location.slice(0,177)+'...':location,expected:brief(a),actual:brief(b)});
 }
 function visit(a,b,location){
  if(Object.is(a,b))return;
  if(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)){
   for(const key of new Set([...Object.keys(a),...Object.keys(b)])){
    const child=Array.isArray(a)?`${location}[${key}]`:`${location}.${key}`;
    if(!Object.hasOwn(a,key)||!Object.hasOwn(b,key))record(child,a[key],b[key]);
    else visit(a[key],b[key],child);
   }
  }else record(location,a,b);
 }
 if(expectedSha256!==actualSha256)visit(left,right,'$');
 return {equal:expectedSha256===actualSha256,allowNewsAcknowledgements,ignoreSaveMetadata,expectedSha256,actualSha256,differenceCount,differences,truncated:differenceCount>differences.length};
}

export function assertSavedCampaignsEqual(expected,actual,message,options){
 const comparison=compareSavedCampaigns(expected,actual,options);
 if(!comparison.equal)throw Error(message+': '+JSON.stringify(comparison));
 return comparison;
}
