/** Mount unmodified private runtime paths below the generic public Pages shell. */
import{createPrivateResources}from'./private-resources.js';
export async function mountPrivateRuntime({workerURL,scope,transport,handleAPI,navigator:nav=globalThis.navigator,origin=globalThis.location.origin,Channel=globalThis.MessageChannel,timeoutMs=20000}={}){
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
 const channel=new Channel(),mountPath=root.pathname+'private/';
 const resources=createPrivateResources({origin,mountPath,transport}),openRequests=new Map();let closed=false,entry=null,nextOpen=0;
 const ready=new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{close();reject(Error('Private workspace mount timed out'))},timeoutMs);
  channel.port1.onmessage=async event=>{
   if(closed)return;const data=event.data;
   if(data?.type==='mounted'){if(data.protocol!==4){clearTimeout(timer);close();reject(Error('Reload the workspace to update private delivery'));return}if(data.mountPath===mountPath&&typeof data.entry==='string'&&data.entry.length>=8){entry=data.entry;clearTimeout(timer);resolve()}return}
   if(data?.type==='open-entry'){const request=openRequests.get(data.requestId);if(!request)return;clearTimeout(request.timer);openRequests.delete(data.requestId);if(data.error||typeof data.url!=='string')request.reject(Error('Prototype entry refused'));else request.resolve(data.url);return}
   if(!['resource','api'].includes(data?.type)||!Number.isSafeInteger(data.id))return;
   let response;try{const request=new Request(data.url,{method:data.method,...(data.body?{body:data.body,headers:{'Content-Type':'application/json'}}:{})});response=data.type==='api'?await handleAPI?.(request):await resources.respond(request);}catch{response=null}
   response??=data.type==='api'?Response.json({error:'GitHub API route is not connected yet',saved:false},{status:501}):new Response('Private resource refused',{status:400});
   const bytes=await response.arrayBuffer();if(!closed)channel.port1.postMessage({id:data.id,status:response.status,headers:Object.fromEntries(response.headers),bytes},[bytes]);
  };channel.port1.start();
 });
 function close(){if(closed)return;closed=true;resources.close();for(const request of openRequests.values()){clearTimeout(request.timer);request.reject(Error('GitHub sign-in required'))}openRequests.clear();channel.port1.postMessage({type:'close'});channel.port1.close()}
 active.postMessage({type:'private-mount'},[channel.port2]);await ready;
 return {baseURL:new URL(mountPath,origin).href,entryURL(path){const url=new URL(path,new URL(mountPath,origin));if(url.origin!==origin||!url.pathname.startsWith(mountPath))throw Error('Private entry path required');url.searchParams.set('_mount',entry);return url.href},openEntryURL(path){if(closed)return Promise.reject(Error('GitHub sign-in required'));const url=new URL(path,new URL(mountPath,origin));if(url.origin!==origin||![mountPath+'prototype/',mountPath+'prototype/index.html'].includes(url.pathname))return Promise.reject(Error('Exact prototype entry required'));return new Promise((resolve,reject)=>{const requestId=++nextOpen,timer=setTimeout(()=>{openRequests.delete(requestId);reject(Error('Prototype entry timed out'))},5000);openRequests.set(requestId,{resolve,reject,timer});channel.port1.postMessage({type:'open-entry',requestId,url:url.href})})},close,registration};
}
