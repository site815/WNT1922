// Select immediately, but keep the native surface unobstructed through a
// double click. A new interaction also invalidates an in-flight artwork load.
export const SHIP_INSPECTION_DELAY_MS = 600;
export class NativeShipInspection {
  constructor({select,focus,prepare=async()=>{},inspect,schedule=(fn,ms)=>setTimeout(fn,ms),cancel=id=>clearTimeout(id)}) {
    Object.assign(this,{select,focus,prepare,inspect,schedule,cancelTimer:cancel});
    this.generation=0;this.timer=null;
  }
  cancel() {
    this.generation++;
    if(this.timer!=null)this.cancelTimer(this.timer);
    this.timer=null;
  }
  pick(selection) {
    this.cancel();this.select(selection);
    if(selection.zoom){this.focus(selection);return;}
    const generation=this.generation;
    this.timer=this.schedule(async()=>{
      if(this.generation!==generation)return;
      this.timer=null;
      try {await this.prepare(selection);} catch {return;}
      if(this.generation===generation)this.inspect(selection);
    },SHIP_INSPECTION_DELAY_MS);
  }
}
