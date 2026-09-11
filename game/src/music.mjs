export const TRACKS=[
 {title:'Long Road Ahead',file:'long-road-ahead.mp3',isrc:'USUAN1100588',composer:'Kevin MacLeod',style:'Orchestral'},
 {title:'Opportunity Walks',file:'opportunity-walks.mp3',isrc:'USUAN1100123',composer:'Kevin MacLeod',style:'Piano jazz'},
 {title:'The Entertainer',file:'the-entertainer.mp3',isrc:'USUAN1900059',composer:'Scott Joplin · recording by Kevin MacLeod',style:'Ragtime'},
 {"title":"Dark Times","file":"dark-times.mp3","isrc":"USUAN1100747","composer":"Kevin MacLeod","style":"Orchestral"},
 {"title":"Prelude and Action","file":"prelude-and-action.mp3","isrc":"USUAN1100887","composer":"Kevin MacLeod","style":"Orchestral action"},
 {"title":"On the Ground","file":"on-the-ground.mp3","isrc":"USUAN1400030","composer":"Kevin MacLeod","style":"Noir jazz"},
 {"title":"Jazz Brunch","file":"jazz-brunch.mp3","isrc":"USUAN1700074","composer":"Kevin MacLeod","style":"Relaxed jazz"},
 {"title":"Lobby Time","file":"lobby-time.mp3","isrc":"USUAN1600054","composer":"Kevin MacLeod","style":"Jazz"},
 {"title":"Anguish","file":"anguish.mp3","isrc":"USUAN1400047","composer":"Kevin MacLeod","style":"Orchestral"},
 {"title":"Lost Frontier","file":"lost-frontier.mp3","isrc":"USUAN1300039","composer":"Kevin MacLeod","style":"Orchestral"},
 {"title":"The Descent","file":"the-descent.mp3","isrc":"USUAN1200094","composer":"Kevin MacLeod","style":"Orchestral"},
 {"title":"Unpromised","file":"unpromised.mp3","isrc":"USUAN1100603","composer":"Kevin MacLeod","style":"Orchestral"},
 {"title":"Dances and Dames","file":"dances-and-dames.mp3","isrc":"USUAN1100595","composer":"Kevin MacLeod","style":"Jazz"},
 {"title":"Walking Along","file":"walking-along.mp3","isrc":"USUAN1100020","composer":"Kevin MacLeod","style":"Jazz"},
 {"title":"With the Sea","file":"with-the-sea.mp3","isrc":"USUAN1100008","composer":"Kevin MacLeod","style":"Piano"},
];
let audio=null,index=0,enabled=true,volume=.28,started=false,blocked=false,running=false,fade=null,target=0;
export const playbackVolume=(level,playing)=>Math.max(0,Math.min(1,level))*(playing?1:1/3);
function fadeVolume(){if(!audio)return;const next=playbackVolume(volume,running);if(next===target&&fade)return;target=next;clearInterval(fade);const from=audio.volume,start=performance.now();if(Math.abs(from-target)<.001){audio.volume=target;fade=null;return;}fade=setInterval(()=>{const fraction=Math.min(1,(performance.now()-start)/900);audio.volume=from+(target-from)*fraction;if(fraction===1){clearInterval(fade);fade=null;}},50);}
export function musicPlayback(playing){if(running===!!playing)return;running=!!playing;fadeVolume();}
export function musicSettings(on=true,level=.28){const changed=volume!==Math.max(0,Math.min(1,level));enabled=on;volume=Math.max(0,Math.min(1,level));if(!audio)return;if(changed)fadeVolume();if(!enabled)audio.pause();else if(started&&audio.paused&&!document.hidden)audio.play().then(()=>blocked=false).catch(()=>blocked=true);}
export function unlockMusic(){if(!enabled)return;if(!audio){audio=new Audio('/music/'+TRACKS[index].file);audio.preload='auto';audio.volume=playbackVolume(volume,running);target=audio.volume;audio.addEventListener('ended',nextTrack);audio.addEventListener('error',()=>{blocked=true;});}started=true;if(audio.paused)audio.play().then(()=>blocked=false).catch(()=>blocked=true);}
export function nextTrack(){index=(index+1)%TRACKS.length;if(audio){audio.src='/music/'+TRACKS[index].file;if(enabled)audio.play().then(()=>blocked=false).catch(()=>blocked=true);}}
export function musicStatus(){return {track:TRACKS[index],enabled,volume,started,blocked,running,outputVolume:audio?.volume??playbackVolume(volume,running)};}
export function musicCredits(){return '<h3>Music credits</h3><p>Kevin MacLeod (incompetech.com). Recordings licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">Creative Commons Attribution 4.0</a>. Audio files are unmodified; playback volume is adjustable.</p><ul>'+TRACKS.map(t=>'<li><a href="https://incompetech.com/music/royalty-free/index.html?isrc='+t.isrc+'" target="_blank" rel="noreferrer">'+t.title+'</a> — '+t.composer+'</li>').join('')+'</ul>';}
