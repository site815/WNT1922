// Legacy aggregate-report fixtures for replay and model regression tests.
// The main menu never imports these illustrative, non-simulated reports.
const ship = (id, name, type, classId, modelNote) => ({id, name, type, classId, modelNote});
const generic = type => `Detailed ${type} exterior reconstructed from historical references. Undocumented hull sections and small fittings are inferred; see the ship gallery's Art info for sources and fit limits.`;
const freeze = value => { if (value && typeof value === 'object') {Object.values(value).forEach(freeze); Object.freeze(value);} return value; };

export const DEMO_BATTLES = freeze([
  {
    id:'denmark-strait', title:'Denmark Strait', date:'24 May 1941', a:'GBR', b:'DEU',
    subtitle:'A brief encounter in the North Atlantic',
    history:'Hood and Prince of Wales intercepted Bismarck and Prinz Eugen. Hood was lost; the damaged Prince of Wales withdrew. Bismarck also suffered damage.',
    source:{title:'Royal Navy · Remembering the loss of HMS Hood',url:'https://www.royalnavy.mod.uk/news/2021/may/24/20210524-loss-hood'},
    scope:'Four principal ships. Formations, timing and damage levels are illustrative; this is not a reconstruction of their tracks or gunnery.',
    shipsA:[ship('hood','HMS Hood','BC','demo-hood1941',generic('Hood, 1941')),ship('prince-of-wales','HMS Prince of Wales','BB','demo-prince-of-wales',generic('battleship'))],
    shipsB:[ship('bismarck','Bismarck','BB','demo-bismarck','Detailed Bismarck reconstruction by everlasting17th (CC BY 4.0); artist proportions and paint fit are approximate.'),ship('prinz-eugen','Prinz Eugen','CA','demo-prinz-eugen',generic('heavy cruiser'))],
    stages:[
      {label:'Opposing squadrons',note:'Select a ship to inspect it. Scroll to zoom; drag to pan.',health:{}},
      {label:'Opening salvos',note:'The roster records illustrative damage; individual shells and historical hit locations are not reconstructed.',health:{hood:.82,bismarck:.9}},
      {label:'Hood is lost',note:'The historical loss is marked in the roster and removes the hull from the scene.',health:{hood:0,bismarck:.8,'prince-of-wales':.78}},
      {label:'Prince of Wales withdraws',note:'Damage values and formation changes are illustrative, not historical estimates.',health:{hood:0,bismarck:.76,'prince-of-wales':.66}},
      {label:'The pursuit continues',note:'Bismarck’s Atlantic sortie continued after this encounter.',health:{hood:0,bismarck:.76,'prince-of-wales':.66}},
    ],
  },
  {
    id:'midway',title:'Midway',date:'4–7 June 1942',a:'USA',b:'JPN',subtitle:'Carrier aviation changes the battle at sea',
    history:'Enterprise, Hornet and Yorktown opposed the Japanese carrier force. Akagi, Kaga, Soryu and Hiryu were lost, as was Yorktown.',
    source:{title:'U.S. Naval History and Heritage Command · Battle of Midway',url:'https://www.history.navy.mil/browse-by-topic/wars-conflicts-and-operations/world-war-ii/1942/midway.html'},
    scope:'Seven carriers only; escorts, submarines and land-based aircraft are omitted. Opposing carrier groups are displayed together for inspection, not at their actual distances. Stages compress several days.',
    shipsA:[ship('enterprise','USS Enterprise','CV','demo-enterprise',generic('fleet carrier')),ship('hornet','USS Hornet','CV','demo-hornet',generic('fleet carrier')),ship('yorktown','USS Yorktown','CV','demo-yorktown',generic('fleet carrier'))],
    shipsB:[ship('akagi','Akagi','CV','demo-akagi1942',generic('Akagi, 1942')),ship('kaga','Kaga','CV','demo-kaga1942',generic('Kaga, 1942')),ship('soryu','Soryu','CV','demo-soryu',generic('fleet carrier')),ship('hiryu','Hiryu','CV','demo-hiryu',generic('fleet carrier'))],
    stages:[
      {label:'The carrier forces',note:'An inspection tableau of the principal carriers, not a surface engagement.',health:{}},
      {label:'Air strikes reach the carriers',note:'Illustrative damage marks the effects of carrier aircraft; aircraft tracks are omitted.',health:{akagi:.55,kaga:.4,soryu:.5}},
      {label:'Three Japanese carriers lost',note:'Scripted stages summarize the battle; exact attack times and damage are not simulated.',health:{akagi:0,kaga:0,soryu:0}},
      {label:'Yorktown is hit',note:'Yorktown is shown damaged during the Japanese counterattack.',health:{akagi:0,kaga:0,soryu:0,yorktown:.42}},
      {label:'Hiryu is lost',note:'All four Japanese carriers would be lost in the battle.',health:{akagi:0,kaga:0,soryu:0,hiryu:0,yorktown:.42}},
      {label:'The wider battle ends',note:'Yorktown was subsequently torpedoed and sank. This final frame compresses the later loss.',health:{akagi:0,kaga:0,soryu:0,hiryu:0,yorktown:0}},
    ],
  },
  {
    id:'north-cape',title:'North Cape',date:'26 December 1943',a:'GBR',b:'DEU',subtitle:'An Arctic interception in the winter darkness',
    history:'British forces intercepted Scharnhorst during her attempt to attack Arctic convoy JW 55B. Duke of York, cruisers and destroyers brought her to battle; Scharnhorst was sunk.',
    source:{title:'Royal Navy · Scharnhorst sunk at North Cape',url:'https://www.royalnavy.mod.uk/news/2020/december/26/20201226-scharnhorst-sunk'},
    scope:'Selected ships: Duke of York, Belfast, Norfolk and Scharnhorst. Other cruisers, destroyers and convoy ships are omitted; their contribution is not represented as an exact order of battle.',
    shipsA:[ship('duke-of-york','HMS Duke of York','BB','demo-duke-of-york',generic('battleship')),ship('belfast','HMS Belfast','CL','demo-belfast',generic('light cruiser')),ship('norfolk','HMS Norfolk','CA','demo-norfolk',generic('heavy cruiser'))],
    shipsB:[ship('scharnhorst','Scharnhorst','BC','demo-scharnhorst',generic('battlecruiser'))],
    stages:[
      {label:'Arctic interception',note:'The selected ships are brought together in an illustrative formation.',health:{}},
      {label:'Cruisers make contact',note:'Scripted damage shows the early exchange, without reproducing exact hits.',health:{scharnhorst:.83,norfolk:.88}},
      {label:'Duke of York engages',note:'The battleship closes the action; formation and damage remain illustrative.',health:{scharnhorst:.48,norfolk:.88}},
      {label:'Scharnhorst is disabled',note:'The historical action also involved destroyer torpedo attacks, not shown in this selected roster.',health:{scharnhorst:.16,norfolk:.88}},
      {label:'The Arctic battle ends',note:'Scharnhorst was lost. Select her name in the roster to inspect the recorded condition.',health:{scharnhorst:0,norfolk:.88}},
    ],
  },
]);

export function createDemoReport(battle) {
  const frame = (stage, index) => {
    const rows = side => battle['ships' + side].map(s => ({...s,count:1,health:stage.health[s.id] ?? 1,sunk:stage.health[s.id] === 0 ? 1 : 0}));
    return {at:index * 15,stage:3,round:index + 1,label:stage.label,status:index === battle.stages.length - 1 ? 'completed' : 'ongoing',groupsA:rows('A'),groupsB:rows('B')};
  };
  return {id:'title-demo-' + battle.id,a:battle.a,b:battle.b,startedAt:-240,status:'completed',replay:{frames:battle.stages.map(frame)}};
}
