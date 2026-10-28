import{scopedEditorURL}from'./scoped-editor-links.js';
/** Mount unmodified private runtime paths below the generic public Pages shell. */
import{createPrivateResources}from'./private-resources.js';
export async function mountPrivateRuntime({workerURL,scope,transport,handleAPI,navigator:nav=globalThis.navigator,origin=globalThis.location.origin,Channel=globalThis.MessageChannel,timeoutMs=20000,onRecovered=()=>{}}={}){
 const worker=new URL(workerURL,origin),root=new URL(scope,origin);
 if(worker.origin!==origin||root.origin!==origin||!root.pathname.endsWith('/')||!worker.pathname.startsWith(root.pathname))throw Error('Same-origin scoped worker required');
 const registration=await nav.serviceWorker.register(worker.href,{scope:root.pathname,type:'classic'});
 if(registration.active)await registration.update();
 const incoming=registration.installing||registration.waiting;
 if(incoming&&incoming.state!=='activated')await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{incoming.removeEventListener('statechange',changed);reject(Error('Private workspace worker update timed out'))},timeoutMs);
  function changed(){if(incoming.state==='activated'){clearTimeout(timer);incoming.removeEventListener('statechange',changed);resolve()}else if(incoming.state==='redundant'){clearTimeout(timer);incoming.removeEventListener('statechange',changed);reject(Error('Private workspace worker could not activate'))}}
  incoming.addEventListener('statechange',changed);changed();
 });
 await nav.serviceWorker.ready;
 if(!nav.serviceWorker.controller)await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{nav.serviceWorker.removeEventListener('controllerchange',changed);reject(Error('Reload the workspace to activate private delivery'))},timeoutMs);
  function changed(){if(nav.serviceWorker.controller){clearTimeout(timer);nav.serviceWorker.removeEventListener('controllerchange',changed);resolve()}}
  nav.serviceWorker.addEventListener('controllerchange',changed);changed();
 });
 const active=nav.serviceWorker.controller;
 if(active.scriptURL!==worker.href)throw Error('Unexpected workspace worker; reload before opening private data');

 const mountPath=root.pathname+'private/',resources=createPrivateResources({origin,mountPath,transport});
 const openRequests=new Map(),claimRequests=new Map();let closed=false,entry=null,nextOpen=0,channel=null,connecting=null;
 function controller(){const current=nav.serviceWorker.controller;if(!current||current.scriptURL!==worker.href)throw Error('Workspace controller changed');return current}
 async function receive(port,event){
  if(closed)return;const data=event.data;
  if(data?.type==='open-entry'){const request=openRequests.get(data.requestId);if(!request)return;clearTimeout(request.timer);openRequests.delete(data.requestId);if(data.error||typeof data.url!=='string')request.reject(Error('Private UI entry refused'));else request.resolve(data.url);return}
  if(data?.type==='reclaimed'){const request=claimRequests.get(data.challenge);if(request){clearTimeout(request.timer);claimRequests.delete(data.challenge);onRecovered();request.resolve()}return}
  if(!['resource','api'].includes(data?.type)||!Number.isSafeInteger(data.id))return;
  let response;try{const request=new Request(data.url,{method:data.method,...(data.body?{body:data.body,headers:{'Content-Type':data.contentType||'application/json'}}:{})});response=data.type==='api'?await handleAPI?.(request):await resources.respond(request)}catch{response=null}
  response??=data.type==='api'?Response.json({error:'GitHub API route is not connected yet',saved:false},{status:501}):new Response('Private resource refused',{status:400});
  const bytes=await response.arrayBuffer();if(!closed)try{port.postMessage({id:data.id,status:response.status,headers:Object.fromEntries(response.headers),bytes},[bytes])}catch{}
 }
 function bind(){return connecting??=new Promise((resolve,reject)=>{
  const next=new Channel(),timer=setTimeout(()=>{next.port1.close();reject(Error('Private workspace mount timed out'))},timeoutMs);
  next.port1.onmessage=event=>{const data=event.data;if(data?.type==='mounted'){
   clearTimeout(timer);if(data.protocol!==5||data.mountPath!==mountPath||typeof data.entry!=='string'||data.entry.length<8){next.port1.close();reject(Error('Reload the workspace to update private delivery'));return}
   if(closed){next.port1.close();reject(Error('GitHub sign-in required'));return}
   channel?.port1.close();channel=next;entry=data.entry;resolve();return;
  }void receive(next.port1,event)};next.port1.start();controller().postMessage({type:'private-mount'},[next.port2]);
 }).finally(()=>{connecting=null})}
 async function ensure(){
  if(closed)throw Error('GitHub sign-in required');if(connecting)return connecting;
  const alive=await new Promise(resolve=>{const check=new Channel(),timer=setTimeout(()=>{check.port1.close();resolve(false)},1500);check.port1.onmessage=event=>{clearTimeout(timer);check.port1.close();resolve(event.data?.alive===true)};check.port1.start();controller().postMessage({type:'private-check'},[check.port2])});
  if(closed)throw Error('GitHub sign-in required');if(!alive)await bind();
 }
 function close(){if(closed)return;closed=true;resources.close();for(const map of[openRequests,claimRequests]){for(const request of map.values()){clearTimeout(request.timer);request.reject(Error('GitHub sign-in required'))}map.clear()}channel?.port1.postMessage({type:'close'});channel?.port1.close()}
 await bind();
 return {baseURL:new URL(mountPath,origin).href,ensure,
  entryURL(path){const url=new URL(path,new URL(mountPath,origin));if(url.origin!==origin||!url.pathname.startsWith(mountPath))throw Error('Private entry path required');url.searchParams.set('_mount',entry);return url.href},
  async openEntryURL(path){await ensure();const url=new URL(path,new URL(mountPath,origin));const editor=[mountPath+'editor/',mountPath+'editor/index.html'].includes(url.pathname);if(url.origin!==origin||url.username||url.password||url.hash||!(editor?scopedEditorURL(url.href.replace('/editor/index.html','/editor/'),new URL(mountPath,origin).href):[mountPath+'prototype/',mountPath+'prototype/index.html'].includes(url.pathname)))throw Error('Exact private UI entry required');return new Promise((resolve,reject)=>{const requestId=++nextOpen,timer=setTimeout(()=>{openRequests.delete(requestId);reject(Error('Private UI entry timed out'))},5000);openRequests.set(requestId,{resolve,reject,timer});channel.port1.postMessage({type:'open-entry',requestId,url:url.href})})},
  async reclaim(challenge){if(typeof challenge!=='string'||!/^[-a-zA-Z0-9]{8,100}$/.test(challenge))throw Error('Valid client challenge required');await ensure();return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{claimRequests.delete(challenge);reject(Error('Client recovery timed out'))},5000);claimRequests.set(challenge,{resolve,reject,timer});controller().postMessage({type:'private-reclaim',challenge})})},close,registration};
}
