// Infrastructure reflects the campaign's opening period. Capacity, defensive
// power and trade weights are provisional game units, not historical tonnages.
export const PORT_TIERS={dock:'Major dock & naval base',base:'Naval base',station:'Minor waystation'};
const tiers={dock:{capacity:420000,artillery:1000,aircraft:60,dock:1},base:{capacity:180000,artillery:650,aircraft:30,dock:0},station:{capacity:35000,artillery:120,aircraft:4,dock:0}};
// Representative coastal batteries where a complete historical battery list
// has not been authored. Range is physical reach, never increased by doctrine.
const entry=(tier,trade,note,extra={})=>({...tiers[tier],tier,trade,note,...extra});
export const PORT_CATALOG={
 midway:entry('station',1,'Cable and communications outpost; the wartime naval air station had not yet been built.',{capacity:8000,artillery:0,aircraft:0}),
 wake:entry('station',1,'Remote American atoll. Pan American flying boats began using it in 1935; its Marine defenses were established in 1941.',{capacity:5000,artillery:0,aircraft:0}),
 saipan:entry('station',12,'Japanese South Seas Mandate administrative and commercial harbor, before its major wartime defenses.',{capacity:25000,artillery:30,aircraft:2}),
 truk:entry('station',8,'Large natural lagoon in the Japanese mandate; limited interwar facilities, not yet the wartime fleet base.',{capacity:45000,artillery:40,aircraft:2}),
 palau:entry('station',10,'Koror administrative and commercial anchorage in the Japanese mandate.',{capacity:20000,artillery:20,aircraft:0}),
 kwajalein:entry('station',3,'Marshall Islands lagoon in the Japanese mandate; extensive military facilities came later.',{capacity:15000,artillery:10,aircraft:0}),
 majuro:entry('station',2,'Lightly developed Marshall Islands anchorage; it was not a major prewar fleet base.',{capacity:8000,artillery:0,aircraft:0}),
 tarawa:entry('station',3,'British Gilbert Islands anchorage; the later Japanese defenses are not part of the opening position.',{capacity:8000,artillery:0,aircraft:0}),
 brest:entry('dock',90,'Atlantic naval arsenal and repair base.'),toulon:entry('dock',75,'Principal French Mediterranean arsenal.'),dakar:entry('base',45,'West African fleet and commercial support port.'),
 la_spezia:entry('dock',55,'Italian naval arsenal.'),taranto:entry('dock',55,'Major southern fleet base and arsenal.'),tobruk:entry('station',10,'Forward Libyan anchorage with limited repair support.'),
 leningrad:entry('dock',85,'Kronstadt fleet base and the Leningrad naval shipbuilding complex.'),sevastopol:entry('dock',55,'Principal Black Sea fleet base and repair facilities.'),vladivostok:entry('base',40,'Far Eastern fleet and commercial port.'),
 scapa:entry('base',8,'Large sheltered fleet anchorage; major dockyard work requires a mainland arsenal.',{artillery:900}),
 portsmouth:entry('dock',100,'Royal dockyard and Channel fleet base.'),rosyth:entry('dock',45,'Forth dockyard, opened during the First World War; reduced interwar activity.',{capacity:280000}),
 heligoland:entry('dock',75,'Wilhelmshaven naval dockyard; the icon marks the coastal base, not Heligoland island.'),kiel:entry('dock',65,'Baltic arsenal and fleet base. Routes go around Denmark; the Kiel Canal is not simulated.'),
 yokosuka:entry('dock',85,'Tokyo Bay naval arsenal and fleet base.'),kure:entry('dock',65,'Inland Sea naval arsenal and battleship repair base.'),sasebo:entry('dock',50,'Western Japanese fleet arsenal and repair base.'),
 san_diego:entry('base',65,'Fleet operating base and destroyer support; major construction is represented at the Pacific arsenals.'),mare_island:entry('dock',95,'San Francisco Bay naval shipyard and repair complex.'),puget:entry('dock',60,'Puget Sound naval shipyard and capital-ship repair base.'),
 norfolk:entry('dock',100,'Hampton Roads fleet base and Norfolk Navy Yard.'),hawaii:entry('dock',55,'Pearl Harbor naval station, dry dock and Pacific fleet support.',{capacity:300000,artillery:1500}),
 manila:entry('base',70,'Manila/Cavite: principal Asiatic Fleet repair and refueling base. Limited yard capacity; harbor defenses include Corregidor.',{capacity:120000,artillery:1400,aircraft:16}),
 guam:entry('station',3,'Apra Harbor and the small Piti naval yard. Limited facilities, without the major base developed during the Second World War.',{capacity:12000,artillery:30,aircraft:0,gunRange:5}),
 gibraltar:entry('dock',50,'Fortified strait, dry docks and Mediterranean fleet support.',{capacity:220000,artillery:1800}),alexandria:entry('base',70,'Commercial harbor and eastern Mediterranean fleet anchorage.'),
 singapore:entry('base',100,'Naval base under construction in 1936. The King George VI graving dock did not open until February 1938.',{capacity:160000,artillery:850}),
 freetown:entry('station',35,'Sierra Leone coaling and convoy station.'),ascension:entry('station',3,'Isolated anchorage; minimal local infrastructure.',{capacity:12000,artillery:25,aircraft:0}),
 cape:entry('dock',65,'Simon’s Town dockyard and Cape sea-route support.',{capacity:230000}),durban:entry('base',55,'Commercial harbor and repair support on the Indian Ocean route.'),mauritius:entry('station',25,'Port Louis commercial harbor and refueling station.'),
 diego_garcia:entry('station',2,'Small Chagos anchorage; no modern naval base in this period.',{capacity:8000,artillery:0,aircraft:0}),
 ceylon:entry('base',65,'Trincomalee anchorage and Ceylon sea-route support.'),australia_west:entry('base',45,'Fremantle commercial harbor and fleet support.'),malta:entry('dock',55,'Valletta dockyard and fortified Mediterranean fleet base.',{capacity:260000,artillery:1800}),
};
const opening1922={
 wake:entry('station',1,'Unfortified American atoll; no commercial flying-boat station yet.',{capacity:2000,artillery:0,aircraft:0}),
 singapore:entry('station',100,'Commercial harbor and refueling station in 1922. The new naval base was approved in 1923.',{capacity:50000,artillery:250,aircraft:4}),
 hawaii:entry('dock',45,'Pearl Harbor’s first permanent dry dock opened in 1919; facilities were still expanding.',{capacity:220000,artillery:1000,aircraft:12}),
 san_diego:entry('base',50,'Destroyer base established in 1922, with limited early repair facilities.',{capacity:110000,aircraft:8}),
 vladivostok:entry('station',20,'Civil-war disruption and foreign intervention constrain Far Eastern naval support at the 1922 opening.',{capacity:45000,artillery:200,aircraft:0}),
 leningrad:entry('dock',65,'Petrograd and Kronstadt retain arsenals, with reduced activity following revolution and civil war.',{capacity:230000,aircraft:8}),
 sevastopol:entry('base',35,'Black Sea naval infrastructure recovering from the civil war.',{capacity:100000,artillery:400,aircraft:4}),
};
export function portSpec(s,id){
 const p=(s.campaignId==='campaign_1922'&&opening1922[id])||PORT_CATALOG[id];if(!p)throw Error('Port specifications missing: '+id);
 const profile=p.artillery<=0?['No coastal battery',0]:id==='manila'?['Long-range 305 mm harbor batteries',27.4]:p.artillery>=1500?['Heavy coastal battery · representative',28]:p.tier==='dock'?['Heavy harbor battery · representative',24]:p.tier==='base'?['152 mm coast defense · representative',16]:['Light coastal battery · representative',8];
 return {...p,battery:profile[0],gunRange:profile[1]/1.852,gunRangeKm:profile[1],gunBasis:id==='manila'?'Moore report: long-range 12-inch guns reached about 30,000 yards. Other batteries had shorter reach.':'Provisional representative battery and mounting; not a verified inventory of every historical gun.'};
}
