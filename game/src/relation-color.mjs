// Neutral is readable gray. Magnitude controls saturation independently of nationality.
export function relationColor(value){
 const score=Math.max(-100,Math.min(100,Number(value)||0)),neutral=[184,194,204],end=score<0?[255,48,48]:[72,255,118],amount=Math.abs(score)/100;
 return '#'+neutral.map((n,i)=>Math.round(n+(end[i]-n)*amount).toString(16).padStart(2,'0')).join('');
}
