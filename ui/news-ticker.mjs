import { noticeReceipt } from "../mechanics/alert-lifecycle.mjs";
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);

// Animation stays on the UI/compositor thread. Worker snapshots retain this node.
export class NewsTicker {
  constructor(onRead) { this.onRead=onRead; this.read=new Set(); }
  reset() { this.animation?.cancel(); this.animation=null; this.node=null; this.current=null; this.read.clear(); }
  finish(a) { this.read.add(noticeReceipt(a)); return this.onRead(a.id,noticeReceipt(a)); }
  markup(notices, pending = '') {
    const available=notices.filter(a=>!this.read.has(noticeReceipt(a)));
    this.current=available.find(a=>this.current && noticeReceipt(a)===noticeReceipt(this.current))
      || available.find(a=>this.current && a.id===this.current.id)
      || (this.current && this.current.kind!=="contact" && !this.read.has(noticeReceipt(this.current)) ? this.current : null)
      || available.at(-1) || null;
    const a=this.current;
    return '<div class="alert-rail news-rail" aria-label="Naval news">'+pending+'<span class="alert-heading">NEWS</span><div class="news-viewport">'+
      (a ? '<button type="button" class="news-message" data-action="open-news" data-id="'+esc(a.id)+'" data-key="news-'+esc(noticeReceipt(a))+'" data-preserve="true" title="Open the related report, ship or ministry panel">'+
        (a.dispatch ? esc(a.body) : '<strong>'+esc(a.title)+'</strong>'+(a.body && a.body!==a.title ? ' — '+esc(a.body) : ''))+'</button>'
        : '<span class="news-idle">No new dispatches</span>')+'</div></div>';
  }
  refresh(root, blocked=false) {
    const node=root.querySelector('.news-message');
    if(!node) { this.animation?.cancel(); this.animation=null; this.node=null; return; }
    if(this.node!==node) {
      this.animation?.cancel(); this.node=node;
      const a={...this.current}, width=node.parentElement.clientWidth, travel=width+node.scrollWidth;
      this.animation=node.animate([{transform:`translateX(${width}px)`},{transform:`translateX(${-node.scrollWidth}px)`}],
        {duration:Math.max(10000,travel/42*1000),iterations:1,fill:'forwards'});
      this.animation.onfinish=()=>this.finish(a);
      node.parentElement.onpointerenter=()=>this.animation?.pause();
      const resume=()=>{if(!root.querySelector('.modal-backdrop') && !node.parentElement.matches(':hover,:focus-within'))this.animation?.play();};
      node.parentElement.onpointerleave=resume;
      node.onfocus=()=>this.animation?.pause();
      node.onblur=resume;
    }
    if(blocked || node.parentElement.matches(':hover,:focus-within'))this.animation?.pause();
    else if(this.animation?.playState==='paused')this.animation.play();
  }
}
