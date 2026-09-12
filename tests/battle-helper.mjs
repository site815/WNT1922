import assert from "node:assert/strict";
import { resolveBattle, resolvePortAction } from "../mechanics/engine.mjs";
import { progressEngagements } from "../mechanics/engagements.mjs";
import { campaignMinutes, setCampaignMinutes } from "../mechanics/campaign-clock.mjs";
export function finishBattle(s,c,r) {
  for(let i=0;r?.status==="ongoing" && i<12;i++) {
    setCampaignMinutes(s,Math.max(campaignMinutes(s),r.nextStageAt));
    progressEngagements(s,c);
  }
  if(r) assert.equal(r.status,"completed","The scheduled battle must finish");
  return r;
}
export const resolveBattleToEnd=(s,c,...args)=>finishBattle(s,c,resolveBattle(s,c,...args));
export const resolvePortActionToEnd=(s,c,...args)=>finishBattle(s,c,resolvePortAction(s,c,...args));
