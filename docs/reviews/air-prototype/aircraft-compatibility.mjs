export function aircraftBasing(a){return a?.basing||{carrier:!/float|patrol|scout/.test(a?.role||''),floatplane:/float|scout|multirole/.test(a?.role||''),land:true};}
export function aircraftFitsShip(a,cl){const b=aircraftBasing(a);return !!(cl?.air>0?b.carrier:cl?.scoutAircraft>0&&b.floatplane);}
export function basingText(a){const b=aircraftBasing(a);return [b.carrier&&'Carrier deck',b.floatplane&&'Ship floatplane station',b.land&&'Shore base'].filter(Boolean).join(' · ');}
