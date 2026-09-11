// Retain interactive elements and scroll containers between snapshots. Stable
// nodes avoid dropped clicks, collapsed reports and resets of a scrolled panel.
const identity=n=>n.nodeType===1?[n.tagName,n.id,...['key','action','id','view','kind','ship','detail-key','scroll-key'].map(k=>n.getAttribute('data-'+k)||'')].join('|'):n.nodeName;
function sync(old,next){
 if(old.nodeType!==1){if(old.nodeValue!==next.nodeValue)old.nodeValue=next.nodeValue;return;}
 const focused=old===document.activeElement;
 for(const a of [...old.attributes])if(!next.hasAttribute(a.name)&&!(a.name==='open'&&old.tagName==='DETAILS'))old.removeAttribute(a.name);
 for(const a of next.attributes)if(old.getAttribute(a.name)!==a.value)old.setAttribute(a.name,a.value);
 if(next.dataset.preserve==='true')return;
 if(old.tagName==='INPUT'&&!focused){old.value=next.value;old.checked=next.checked;}
 if(old.tagName==='SELECT'&&focused)return;
 reconcile(old,next);
 if(old.tagName==='SELECT'&&!focused)old.value=next.value;
}
function reconcile(old,next){
 const previous=[...old.childNodes],used=new Set();let cursor=old.firstChild;
 for(const child of [...next.childNodes]){
  let match=cursor&&identity(cursor)===identity(child)&&!used.has(cursor)?cursor:previous.find(n=>!used.has(n)&&identity(n)===identity(child));
  if(match){used.add(match);if(match!==cursor)old.insertBefore(match,cursor);sync(match,child);cursor=match.nextSibling;}
  else{old.insertBefore(child,cursor);used.add(child);}
 }
 for(const n of previous)if(!used.has(n))n.remove();
}
export function updateDOM(root,html){
 const template=document.createElement('template');template.innerHTML=html;reconcile(root,template.content);
}
