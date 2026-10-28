/** Adapt legacy saved-version routes to the actual authenticated mount. */
export function scopedEditorURL(value,baseURL){
 try{const base=new URL(baseURL),url=new URL(value,base);if(url.origin!==base.origin||url.username||url.password||url.hash||!['/editor/','/workbench/editor/',base.pathname+'editor/'].includes(url.pathname))return null;
 const query=new URLSearchParams();for(const[key,value]of url.searchParams){if(!['screen','profile','optionsSheet'].includes(key)||query.has(key)||!/^[-\w:;.]{1,160}$/.test(value))return null;query.set(key,value)}
 if(!query.get('screen'))return null;return new URL('editor/?'+query,base).href;
 }catch{return null}
}
export function mountScopedEditorLinks({frame,baseURL,open,onError=()=>{}}={}){
 let doc;try{const current=new URL(frame.contentWindow.location.href),base=new URL(baseURL);if(current.origin!==base.origin||!current.pathname.startsWith(base.pathname))return()=>{};doc=frame.contentDocument}catch{return()=>{}}
 if(!doc)return()=>{};
 const rewrite=()=>{for(const anchor of doc.querySelectorAll('a[href]')){const scoped=scopedEditorURL(anchor.href,baseURL);if(scoped&&scoped!==anchor.href)anchor.href=scoped}};
 const click=event=>{if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;const anchor=event.target.closest?.('a[href]');if(!anchor||anchor.target!=='_blank')return;const scoped=scopedEditorURL(anchor.href,baseURL);if(!scoped)return;event.preventDefault();anchor.href=scoped;void Promise.resolve().then(()=>open(scoped.slice(baseURL.length))).catch(error=>onError(error.message))};
 rewrite();const Observer=doc.defaultView.MutationObserver,observer=new Observer(rewrite);observer.observe(doc.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['href']});doc.addEventListener('click',click,true);
 return()=>{observer.disconnect();doc.removeEventListener('click',click,true)};
}
