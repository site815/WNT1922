# research tree — data and balance

Edit the JSON block directly. The game reads this document at startup; no export step is required.

```json game-data
{
  "LEVELS": {
    "industry": [
      "Existing yards rely on their established workshops and skilled trades.",
      "Add machine tools and enlarge workshops serving the naval yards.",
      "Expand plate rolling and arrange regular deliveries of naval steel.",
      "Build dedicated machinery shops for turbines, boilers and reduction gears.",
      "Separate fitting-out work from hull construction to free the building slips.",
      "Increase crane coverage and prepare larger hull sections beside the slips.",
      "Coordinate subcontractors and inspect sections before delivery to the yards.",
      "Duplicate critical workshops so a damaged or overloaded yard has alternatives.",
      "Run an integrated national yard program with balanced machinery and fitting-out capacity."
    ],
    "aircraft_factory": [
      "Existing aircraft workshops produce small batches for the fleet.",
      "Add assembly benches and train another shift of aircraft fitters.",
      "Expand engine assembly and propeller production alongside the airframe shops.",
      "Create dedicated lines for fighters, strike aircraft and reconnaissance machines.",
      "Introduce production jigs and inspect subassemblies before final assembly.",
      "Expand acceptance testing so completed aircraft reach squadrons sooner.",
      "Disperse component work while preserving common gauges and quality standards.",
      "Maintain duplicate tooling and a larger pool of trained production supervisors.",
      "Coordinate engines, airframes and acceptance fields as a continuous national program."
    ],
    "school": [
      "Existing naval schools train replacements for the commissioned fleet.",
      "Open additional recruit divisions and qualify more instructors.",
      "Expand seamanship schools and practical instruction aboard harbor craft.",
      "Add engineering classrooms and working examples of ship machinery.",
      "Establish regional schools for signals, gunnery and torpedo ratings.",
      "Expand petty-officer courses to supply instructors and watch leaders.",
      "Standardize examinations while allowing each specialist school practical sea time.",
      "Add reserve instructor cadres and accommodation for larger intakes.",
      "Operate a national training pipeline with balanced intakes across every naval trade."
    ],
    "pilots": [
      "The existing aviation schools supply trained naval aircrews.",
      "Add elementary flying courses and recruit experienced flying instructors.",
      "Expand navigation, observation and wireless training for multi-seat aircrews.",
      "Open advanced schools for formation flying and weapons delivery.",
      "Add deck-landing practice and seaplane handling courses.",
      "Expand instrument flying and bad-weather navigation instruction.",
      "Train replacement instructors and standardize operational conversion courses.",
      "Add advanced aircrew schools with coordinated fighter and strike exercises.",
      "Maintain a continuous aircrew pipeline from elementary flying to fleet conversion."
    ],
    "training": [
      "Ships drill individually, with occasional squadron maneuvers.",
      "Publish common watch routines and increase practical exercises at sea.",
      "Practice station keeping and emergency turns by entire squadrons.",
      "Rehearse night recognition and signals under realistic restrictions.",
      "Train mixed formations to maintain screens during course and speed changes.",
      "Run exercises with opposing forces and independent umpires.",
      "Rotate experienced crews through training appointments and share exercise lessons.",
      "Rehearse prolonged operations with fatigue, casualties and interrupted communications.",
      "Maintain a fleet-wide exercise cycle that repeatedly tests every operational watch."
    ],
    "logistics": [
      "Ports and ships maintain separate stores lists and repair schedules.",
      "Create common stores returns and improve the distribution of essential spares.",
      "Coordinate fuel deliveries with expected fleet movements and convoy arrivals.",
      "Pre-position machinery spares and repair parties at the busiest naval bases.",
      "Introduce standard maintenance schedules and rotating workshop detachments.",
      "Coordinate AO support ships and shore workshops under regional supply staffs.",
      "Inspect critical machinery before failure and organize interchangeable repair teams.",
      "Maintain alternate supply schedules for damaged ports and interrupted routes.",
      "Run a unified maintenance network with contingency stocks and fleet repair planning."
    ],
    "standardization": [
      "Each class and contractor uses its own drawings, fittings and workshop gauges.",
      "Agree common fasteners, pipe fittings and workshop gauges for new orders.",
      "Standardize auxiliary machinery and electrical fittings across new ship classes.",
      "Issue common drawing standards and inspect supplier tooling against master gauges.",
      "Purchase repeated components in larger batches across several naval contracts.",
      "Reduce unnecessary variants of pumps, valves and other service machinery.",
      "Design recurring machinery spaces around interchangeable component assemblies.",
      "Share proven production drawings and component inspection records among yards.",
      "Use a mature common-parts system throughout the new-construction program."
    ],
    "radar": [
      "Lookouts, wireless reports and optical plots provide the fleet picture.",
      "Standardize bearing reports, recognition silhouettes and lookout watches.",
      "Use radio direction finding and compare bearings between shore stations.",
      "Combine coast-watcher reports, aircraft sightings and radio traffic on shore plots.",
      "Trial early warning radar ashore while fleets still rely on optical and radio methods.",
      "Install operational air-warning radar and train dedicated operators and plotters.",
      "Introduce surface-search radar and a central combat information room.",
      "Coordinate fighter direction and radar-assisted gunnery across the formation.",
      "Improve tracking in sea clutter and integrate reliable electronic identification."
    ],
    "asw": [
      "Escorts use lookouts, hydrophones and basic stern-dropped depth charges.",
      "Improve hydrophone listening drills and estimate a contact’s course.",
      "Trial active echo-ranging sets and standardize depth-charge settings.",
      "Train escorts to hold active-sonar contact during coordinated search turns.",
      "Equip dedicated escorts with contemporary ASDIC and practice depth-charge patterns.",
      "Rehearse convoy support groups and coordinate shore patrol reports with escorts.",
      "Introduce forward-thrown weapons and aircraft-guided contact prosecution.",
      "Refine multi-escort attack plots and repeated attacks without losing contact.",
      "Integrate airborne search, improved sonar and layered convoy defenses."
    ],
    "aviation": [
      "Carriers operate small air groups with separate spotting and striking routines.",
      "Rehearse deck cycles and assemble coordinated fighter and strike formations.",
      "Synchronize launches, rendezvous and multi-carrier attacks.",
      "Improve fighter direction and coordinate torpedo and bombing approaches.",
      "Organize rapid deck turnaround and reserve aircraft handling after a strike.",
      "Develop bad-weather recovery and coordinated attacks against dispersed targets.",
      "Train air-group staffs to redirect strikes when reconnaissance changes the target.",
      "Coordinate successive waves while preserving fighter cover over the carriers.",
      "Maintain continuous scouting, combat air patrol and concentrated fleet strikes."
    ],
    "gunnery": [
      "Optical directors and local spotting teams control the gun batteries.",
      "Improve rangefinder calibration and train centralized spotting teams.",
      "Coordinate director orders, plotting tables and salvo corrections.",
      "Improve night recognition, illumination and optical salvo corrections.",
      "Refine stable tracking and the handover of targets between directors.",
      "Introduce early radar ranges alongside optical plotting against changing courses.",
      "Coordinate multiple batteries against maneuvering surface targets.",
      "Train fallback control teams to sustain accurate fire after director casualties.",
      "Integrate tracking, spotting and resilient battery control into a common firing doctrine."
    ],
    "damage_control": [
      "Each ship relies on its own fire parties and engineering watch.",
      "Establish dedicated repair parties with common flood and fire drills.",
      "Mark isolation valves and rehearse rapid compartment closure.",
      "Distribute portable pumps and improve emergency electrical arrangements.",
      "Train teams to shore bulkheads and counter progressive flooding.",
      "Coordinate firefighting, casualty collection and emergency machinery control.",
      "Practice repairs with damaged communications and missing watch leaders.",
      "Analyze fleet casualties and revise drills around recurring failure points.",
      "Maintain a practiced, redundant damage-control organization throughout the fleet."
    ],
    "intelligence": [
      "Naval attaches, coast watchers and signals offices submit separate reports.",
      "Create a central naval desk to compare sightings and shipping reports.",
      "Standardize contact times, identification confidence and circulation of estimates.",
      "Coordinate traffic analysis with coastal listening and reconnaissance reports.",
      "Maintain working estimates of enemy formations, repairs and replenishment cycles.",
      "Assign liaison officers to connect analysis sections with operational commanders.",
      "Compare independent sources before issuing urgent fleet intelligence.",
      "Develop deception checks and track uncertainty in older contact reports.",
      "Maintain a continuous intelligence cycle linking collection, assessment and fleet search."
    ],
    "influence": [
      "The ministry presents its estimates through ordinary government channels.",
      "Create a permanent liaison office for the naval estimates.",
      "Explain procurement priorities to the treasury and relevant government committees.",
      "Coordinate naval requirements with industrial and transport authorities.",
      "Publish consistent readiness returns to strengthen confidence in naval spending.",
      "Negotiate longer planning horizons for personnel and construction appropriations.",
      "Maintain regular briefings on trade protection and the fleet readiness program.",
      "Coordinate emergency appropriations with standing national economic plans.",
      "Build durable government confidence in the ministry through credible plans and reporting."
    ]
  }
}
```
