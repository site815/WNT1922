// Scores and monthly modifiers are authored interpretations, not historical measurements.
// Sources and every opening pair are documented in docs/diplomacy.md.
export const relationKey=(a,b)=>[a,b].sort().join('-');
export const RELATIONS_1922={
 'GBR-USA':[55,.55,'Naval parity, trade and postwar cooperation'],
 'GBR-JPN':[65,.25,'The Anglo-Japanese alliance is giving way to Washington consultation'],
 'FRA-GBR':[40,.35,'Wartime partners disagree over reparations and European security'],
 'GBR-ITA':[35,.25,'Allied cooperation, with Mediterranean competition'],
 'DEU-GBR':[5,.1,'Reconciliation and trade under the Versailles settlement'],
 'GBR-SOV':[-25,-.1,'Trade contacts coexist with intervention and revolutionary distrust'],
 'JPN-USA':[-15,-.25,'Pacific rivalry tempered by the Washington settlement'],
 'FRA-USA':[35,.35,'Wartime partnership strained by war debts'],
 'ITA-USA':[30,.25,'Peaceful diplomatic and commercial ties'],
 'DEU-USA':[15,.25,'Restored peace and interest in economic recovery'],
 'SOV-USA':[-35,-.2,'Non-recognition, disputed debts and ideological distrust'],
 'FRA-JPN':[25,.2,'Recent allies with limited direct naval rivalry'],
 'ITA-JPN':[20,.15,'Limited conflict of interests between former allies'],
 'DEU-JPN':[5,.1,'Relations recovering after the First World War'],
 'JPN-SOV':[-65,-.35,'Japanese intervention in Siberia and disputed regional security'],
 'FRA-ITA':[10,-.1,'Mediterranean rivalry and competing postwar ambitions'],
 'DEU-FRA':[-55,-.45,'Reparations, border security and the Versailles settlement'],
 'FRA-SOV':[-45,-.25,'Intervention, unrecognized debts and revolutionary hostility'],
 'DEU-ITA':[10,.15,'Postwar normalization and commercial interests'],
 'ITA-SOV':[-15,.05,'Cautious commercial contacts despite political mistrust'],
 'DEU-SOV':[0,.15,'Mutual isolation; Rapallo has not yet been signed']
};
export const RELATIONS_1936={
 'GBR-USA':[65,.75,'Close commercial ties and growing strategic cooperation'],
 'GBR-JPN':[5,-.4,'China, Pacific security and the failing naval treaty system'],
 'FRA-GBR':[55,.7,'Shared European security interests despite policy disagreements'],
 'GBR-ITA':[-25,-.4,'The Ethiopian war and League sanctions strain relations'],
 'DEU-GBR':[5,-.35,'The naval agreement coexists with concern over German rearmament'],
 'GBR-SOV':[-10,.1,'Deep distrust tempered by concern over Germany'],
 'JPN-USA':[-25,-.7,'Manchuria, China and incompatible Pacific ambitions'],
 'FRA-USA':[40,.5,'Friendly relations tempered by neutrality and war debts'],
 'ITA-USA':[5,-.2,'The Ethiopian war strains otherwise peaceful relations'],
 'DEU-USA':[-15,-.4,'Growing opposition to the Nazi regime and its foreign policy'],
 'SOV-USA':[-5,-.15,'Recognition has not resolved debts and political distrust'],
 'FRA-JPN':[10,-.2,'China and French Asian interests cause growing concern'],
 'ITA-JPN':[10,.2,'Prospects of cooperation, before the Anti-Comintern alignment'],
 'DEU-JPN':[15,.35,'A developing anti-Soviet alignment, not yet a military alliance'],
 'JPN-SOV':[-55,-.7,'Manchurian and Soviet frontier security are in direct conflict'],
 'FRA-ITA':[-10,-.25,'The Ethiopian crisis undermines the Stresa relationship'],
 'DEU-FRA':[-55,-.9,'German rearmament threatens the European settlement'],
 'FRA-SOV':[30,.55,'The 1935 mutual-assistance treaty supports collective security'],
 'DEU-ITA':[5,.2,'Austria remains a disagreement; the Rome-Berlin Axis is still ahead'],
 'ITA-SOV':[-5,-.2,'Political opposition despite limited commercial relations'],
 'DEU-SOV':[-55,-.85,'Nazi anti-Bolshevism has displaced the Rapallo relationship']
};
const day=iso=>Date.parse(iso+'T00:00:00Z')/86400000;
export function historicalRelation(s,a,b){
 const key=relationKey(a,b),early=s.day<day('1936-01-01'),row=(early?RELATIONS_1922:RELATIONS_1936)[key];
 let [score,modifier,note]=row;
 if(early&&key==='DEU-SOV'&&s.day>=day('1922-04-16'))[score,modifier,note]=[35,.7,'Rapallo restores diplomatic and commercial cooperation'];
 if(early&&key==='DEU-FRA'&&s.day>=day('1925-10-16'))[score,modifier,note]=[-5,.6,'Locarno encourages European reconciliation'];
 if(key==='JPN-SOV'&&s.day>=day('1925-01-20')&&early)[score,modifier,note]=[-15,.15,'Recognition and the Soviet-Japanese convention ease post-intervention tension'];
 if(key==='FRA-SOV'&&s.day>=day('1924-10-28')&&early)[score,modifier,note]=[-10,.25,'Diplomatic recognition reopens relations'];
 if(key==='GBR-JPN'&&s.day>=day('1923-08-17')&&early)[score,modifier,note]=[30,.05,'Washington consultation replaces the bilateral alliance'];
 if(early&&s.day>=day('1933-01-30')&&key.includes('DEU'))[score,modifier,note]=RELATIONS_1936[key];
 if(early&&key==='SOV-USA'&&s.day>=day('1933-11-16'))[score,modifier,note]=RELATIONS_1936[key];
 if(early&&key==='FRA-SOV'&&s.day>=day('1935-05-02'))[score,modifier,note]=RELATIONS_1936[key];
 if(early&&['GBR-ITA','FRA-ITA','ITA-USA'].includes(key)&&s.day>=day('1935-10-03'))[score,modifier,note]=RELATIONS_1936[key];
 if(['JPN-USA','GBR-JPN'].includes(key)&&s.day>=day('1931-09-18')){modifier=key==='JPN-USA'?-.7:-.4;note='Manchuria and China undermine Pacific cooperation';}
 const pact=id=>s.pacts?.some(p=>p.id===id&&p.active);
 if(key==='DEU-ITA'&&s.day>=day('1936-10-25')&&pact('axis-friendship'))[score,modifier,note]=[50,.8,'Rome-Berlin political alignment and military cooperation'];
 if(key==='DEU-JPN'&&s.day>=day('1936-11-25')&&pact('anti-comintern'))[score,modifier,note]=[45,.65,'The Anti-Comintern alignment brings Berlin and Tokyo closer'];
 if(key==='ITA-JPN'&&s.day>=day('1937-11-06')&&pact('anti-comintern-italy'))[score,modifier,note]=[40,.55,'Shared Anti-Comintern alignment'];
 if(key==='DEU-SOV'&&s.day>=day('1939-08-23')&&s.day<day('1941-06-22'))[score,modifier,note]=[5,.3,'A tactical non-aggression and trade agreement masks continued distrust'];
 if(['GBR-SOV','SOV-USA','FRA-SOV'].includes(key)&&s.day>=day('1941-06-22'))[score,modifier,note]=[45,.7,'A common German enemy encourages wartime cooperation'];
 if(['DEU-GBR','DEU-FRA','DEU-USA','DEU-SOV'].includes(key)&&s.day>=day('1945-05-08'))modifier=.1;
 return {score,modifier,note};
}
export function openingRelation(s,a,b){const row=(s.campaignId==='campaign_1922'?RELATIONS_1922:RELATIONS_1936)[relationKey(a,b)];return {score:row[0],modifier:row[1],note:row[2]};}
export function historicalPressure(s,r){
 const year=new Date(s.day*86400000).getUTCFullYear(),key=relationKey(r.a,r.b);
 if(year<1931)return 5;
 if(['JPN-USA','GBR-JPN'].includes(key))return year<1937?18:year===1937?25:year===1938?35:year===1939?45:year===1940?60:75;
 if(['DEU-GBR','DEU-FRA'].includes(key))return year<1936?15:year===1936?25:year===1937?35:year===1938?60:80;
 if(key==='DEU-SOV')return year<1939?20:year===1939?25:year===1940?45:80;
 if(key==='JPN-SOV')return year<1937?25:year<1941?55:35;
 if(['GBR-ITA','FRA-ITA'].includes(key))return year<1935?10:year<1939?25:year===1939?40:70;
 return year<1936?8:18;
}
export function relationChanges(s,r){
 const historical=historicalRelation(s,r.a,r.b),years=Math.max(0,(s.day-day('1936-01-01'))/365.25),era=s.campaignId==='campaign_1922'&&new Date(s.day*86400000).getUTCFullYear()<1935?.07:1;
 const treaty=era*(.9+Math.min(3,years*.12))*(s.day<=s.treatyUntil?1:.2);
 // The small peacetime historical trend does not force friendliness during a war.
 const history=r.war?Math.min(0,historical.modifier):historical.modifier;
 return {historical:history,treaty:-treaty,total:history-treaty,note:historical.note};
}
export const WAR_PRESSURE_THRESHOLD=50;
export function scheduledWarningOnly(s,r){
 const key=relationKey(r.a,r.b),scheduled=(['DEU-GBR','DEU-FRA'].includes(key)&&!s.timeline.europeOccurred)||(key==='DEU-SOV'&&!s.completedEvents.includes('barbarossa'))||(['GBR-ITA','FRA-ITA'].includes(key)&&!s.completedEvents.includes('italian-entry'));
 // In 1922, an actual crisis can exceed background pressure; background drift alone
 // must not bypass the agreed historical window. Direct provocation clashes also
 // create their own warnings through beginWarWarning.
 return scheduled&&(s.campaignId!=='campaign_1922'||r.pressure<=historicalPressure(s,r)+10);
}
export function warningRisk(s,r){return r.war||r.warning||r.allied||s.day<r.truceUntil||r.pressure<WAR_PRESSURE_THRESHOLD||scheduledWarningOnly(s,r)?0:Math.max(0,-r.score)/100;}
