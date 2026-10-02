// Campaign reporting / legacy-save compatibility; all new naval damage uses
// engine.mjs. Duration/weight fields below only schedule older aggregate records
// and strategic infrastructure raids that contain no participating ships.
export const CAMPAIGN_BATTLE_RULES = Object.freeze({
  STAGES: ['Contact','Approach','Opening attack','Main engagement','Disengagement'],
  DURATIONS_MINUTES: { surface:[[10,20],[25,45],[20,35],[40,65],[15,30]],
    port:[[10,15],[15,25],[10,20],[20,30],[10,20]],air:[[5,10],[5,10],[5,10],[10,15],[5,10]],convoy:[[5,10],[10,15],[5,10],[10,20],[5,15]] },
  SURFACE_ROUND_WEIGHTS:[55,25,12,6,2],
  DECISIVE:{CAPITAL_TYPES:['BB','BC','CV','CVL'],MIN_OPPOSING_WARSHIP_TONS:5000,MIN_STRIKE_AIRCRAFT:24,LARGE_ACTION_SIDE_TONS:20000,LARGE_ACTION_TOTAL_TONS:60000},
  OPENING_WEIGHT:.25,MAIN_WEIGHT:.75,EXTRA_ROUND_WEIGHT:.35,
});
