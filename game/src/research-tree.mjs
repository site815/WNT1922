import { PROGRAMS } from './balance.mjs';

// In-universe doctrine and organization, shared by the UI and docs/tech-tree.md.
// Level one is the opening baseline. Hardware remains subject to its own catalog date.
export const LEVELS={
 industry:[
  'Existing yards rely on their established workshops and skilled trades.',
  'Add machine tools and enlarge workshops serving the naval yards.',
  'Expand plate rolling and arrange regular deliveries of naval steel.',
  'Build dedicated machinery shops for turbines, boilers and reduction gears.',
  'Separate fitting-out work from hull construction to free the building slips.',
  'Increase crane coverage and prepare larger hull sections beside the slips.',
  'Coordinate subcontractors and inspect sections before delivery to the yards.',
  'Duplicate critical workshops so a damaged or overloaded yard has alternatives.',
  'Run an integrated national yard program with balanced machinery and fitting-out capacity.'
 ],
 aircraft_factory:[
  'Existing aircraft workshops produce small batches for the fleet.',
  'Add assembly benches and train another shift of aircraft fitters.',
  'Expand engine assembly and propeller production alongside the airframe shops.',
  'Create dedicated lines for fighters, strike aircraft and reconnaissance machines.',
  'Introduce production jigs and inspect subassemblies before final assembly.',
  'Expand acceptance testing so completed aircraft reach squadrons sooner.',
  'Disperse component work while preserving common gauges and quality standards.',
  'Maintain duplicate tooling and a larger pool of trained production supervisors.',
  'Coordinate engines, airframes and acceptance fields as a continuous national program.'
 ],
 school:[
  'Existing naval schools train replacements for the commissioned fleet.',
  'Open additional recruit divisions and qualify more instructors.',
  'Expand seamanship schools and practical instruction aboard harbor craft.',
  'Add engineering classrooms and working examples of ship machinery.',
  'Establish regional schools for signals, gunnery and torpedo ratings.',
  'Expand petty-officer courses to supply instructors and watch leaders.',
  'Standardize examinations while allowing each specialist school practical sea time.',
  'Add reserve instructor cadres and accommodation for larger intakes.',
  'Operate a national training pipeline with balanced intakes across every naval trade.'
 ],
 pilots:[
  'The existing aviation schools supply trained naval aircrews.',
  'Add elementary flying courses and recruit experienced flying instructors.',
  'Expand navigation, observation and wireless training for multi-seat aircrews.',
  'Open advanced schools for formation flying and weapons delivery.',
  'Add deck-landing practice and seaplane handling courses.',
  'Expand instrument flying and bad-weather navigation instruction.',
  'Train replacement instructors and standardize operational conversion courses.',
  'Add advanced aircrew schools with coordinated fighter and strike exercises.',
  'Maintain a continuous aircrew pipeline from elementary flying to fleet conversion.'
 ],
 training:[
  'Ships drill individually, with occasional squadron maneuvers.',
  'Publish common watch routines and increase practical exercises at sea.',
  'Practice station keeping and emergency turns by entire squadrons.',
  'Rehearse night recognition and signals under realistic restrictions.',
  'Train mixed formations to maintain screens during course and speed changes.',
  'Run exercises with opposing forces and independent umpires.',
  'Rotate experienced crews through training appointments and share exercise lessons.',
  'Rehearse prolonged operations with fatigue, casualties and interrupted communications.',
  'Maintain a fleet-wide exercise cycle that repeatedly tests every operational watch.'
 ],
 logistics:[
  'Ports and ships maintain separate stores lists and repair schedules.',
  'Create common stores returns and improve the distribution of essential spares.',
  'Coordinate fuel deliveries with expected fleet movements and convoy arrivals.',
  'Pre-position machinery spares and repair parties at the busiest naval bases.',
  'Introduce standard maintenance schedules and rotating workshop detachments.',
  'Coordinate depot ships, oilers and shore workshops under regional supply staffs.',
  'Inspect critical machinery before failure and organize interchangeable repair teams.',
  'Maintain alternate supply schedules for damaged ports and interrupted routes.',
  'Run a unified maintenance network with contingency stocks and fleet repair planning.'
 ],
 standardization:[
  'Each class and contractor uses its own drawings, fittings and workshop gauges.',
  'Agree common fasteners, pipe fittings and workshop gauges for new orders.',
  'Standardize auxiliary machinery and electrical fittings across new ship classes.',
  'Issue common drawing standards and inspect supplier tooling against master gauges.',
  'Purchase repeated components in larger batches across several naval contracts.',
  'Reduce unnecessary variants of pumps, valves and other service machinery.',
  'Design recurring machinery spaces around interchangeable component assemblies.',
  'Share proven production drawings and component inspection records among yards.',
  'Use a mature common-parts system throughout the new-construction program.'
 ],
 radar:[
  'Lookouts, wireless reports and optical plots provide the fleet picture.',
  'Introduce early warning sets and train operators to report range and bearing.',
  'Combine radar, lookout and wireless plots in a central information room.',
  'Improve short-wavelength search and train fighter direction teams.',
  'Standardize radar plotting, identification procedures and air-warning circuits.',
  'Improve tracking in clutter and coordinate search with gun direction.',
  'Link air-warning reports between ships and reduce delays in target handover.',
  'Refine electronic countermeasure drills and track confirmation procedures.',
  'Integrate search, identification and weapon direction into a practiced fleet network.'
 ],
 asw:[
  'Escorts rely on lookouts, basic listening equipment and stern depth charges.',
  'Test depth-charge patterns and train escorts to maintain contact through an attack.',
  'Organize convoy screens around common sonar reports and coordinated search turns.',
  'Introduce forward-thrown attack drills and dedicated support-group tactics.',
  'Coordinate air patrols with escort searches and post-attack contact recovery.',
  'Refine sonar interpretation and depth settings against maneuvering submarines.',
  'Practice layered screens with aircraft directing surface escorts onto contacts.',
  'Improve attack plots and train multiple escorts to prosecute a contact together.',
  'Integrate airborne search, escort tracking and repeated attacks in one ASW plan.'
 ],
 aviation:[
  'Carriers operate small air groups with separate spotting and striking routines.',
  'Rehearse deck cycles and assemble coordinated fighter and strike formations.',
  'Synchronize launches, rendezvous and multi-carrier attacks.',
  'Improve fighter direction and coordinate torpedo and bombing approaches.',
  'Organize rapid deck turnaround and reserve aircraft handling after a strike.',
  'Develop bad-weather recovery and coordinated attacks against dispersed targets.',
  'Train air-group staffs to redirect strikes when reconnaissance changes the target.',
  'Coordinate successive waves while preserving fighter cover over the carriers.',
  'Maintain continuous scouting, combat air patrol and concentrated fleet strikes.'
 ],
 gunnery:[
  'Optical directors and local spotting teams control the gun batteries.',
  'Improve rangefinder calibration and train centralized spotting teams.',
  'Coordinate director orders, plotting tables and salvo corrections.',
  'Combine radar ranges with optical observation and improve night firing drills.',
  'Refine stable tracking and the handover of targets between directors.',
  'Improve plotting against rapidly changing courses and speeds.',
  'Coordinate multiple batteries against maneuvering surface targets.',
  'Train fallback control teams to sustain accurate fire after director casualties.',
  'Integrate tracking, spotting and resilient battery control into a common firing doctrine.'
 ],
 damage_control:[
  'Each ship relies on its own fire parties and engineering watch.',
  'Establish dedicated repair parties with common flood and fire drills.',
  'Mark isolation valves and rehearse rapid compartment closure.',
  'Distribute portable pumps and improve emergency electrical arrangements.',
  'Train teams to shore bulkheads and counter progressive flooding.',
  'Coordinate firefighting, casualty collection and emergency machinery control.',
  'Practice repairs with damaged communications and missing watch leaders.',
  'Analyze fleet casualties and revise drills around recurring failure points.',
  'Maintain a practiced, redundant damage-control organization throughout the fleet.'
 ],
 intelligence:[
  'Naval attaches, coast watchers and signals offices submit separate reports.',
  'Create a central naval desk to compare sightings and shipping reports.',
  'Standardize contact times, identification confidence and circulation of estimates.',
  'Coordinate traffic analysis with coastal listening and reconnaissance reports.',
  'Maintain working estimates of enemy formations, repairs and replenishment cycles.',
  'Assign liaison officers to connect analysis sections with operational commanders.',
  'Compare independent sources before issuing urgent fleet intelligence.',
  'Develop deception checks and track uncertainty in older contact reports.',
  'Maintain a continuous intelligence cycle linking collection, assessment and fleet search.'
 ],
 influence:[
  'The ministry presents its estimates through ordinary government channels.',
  'Create a permanent liaison office for the naval estimates.',
  'Explain procurement priorities to the treasury and relevant government committees.',
  'Coordinate naval requirements with industrial and transport authorities.',
  'Publish consistent readiness returns to strengthen confidence in naval spending.',
  'Negotiate longer planning horizons for personnel and construction appropriations.',
  'Maintain regular briefings on trade protection and the fleet readiness program.',
  'Coordinate emergency appropriations with standing national economic plans.',
  'Build durable government confidence in the ministry through credible plans and reporting.'
 ]
};
export const levelDescription=(key,level)=>LEVELS[key]?.[Math.max(0,Math.min(8,level-1))]||'';
export const levelYear=(key,level)=>level<=1?null:PROGRAMS[key].year?PROGRAMS[key].year+(level-2)*3:1922;
export function researchOrder(s,entries){return [...entries].sort(([a],[b])=>levelYear(a,Math.min(9,s.nations[s.player].tech[a]+1))-levelYear(b,Math.min(9,s.nations[s.player].tech[b]+1))||PROGRAMS[a].name.localeCompare(PROGRAMS[b].name));}
export const levelHint=(key,level)=>'Level '+level+': '+levelDescription(key,level)+(level<9?'\nNext: '+levelDescription(key,level+1):'')+'\n'+PROGRAMS[key].effect;
