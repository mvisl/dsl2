/** Generic Pages service worker. Private bytes travel through a live page port only. */
const brokers=new Map();
const mountPath=new URL('private/',self.registration.scope).pathname;
const apiFailure=(message,status=503)=>Response.json({error:message,saved:false},{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const fallback=(message,status=503)=>new Response(message,{status,headers:{'Cache-Control':'no-store','Content-Type':'text/plain; charset=utf-8','X-Content-Type-Options':'nosniff'}});
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
function forget(broker){for(const[id,value]of brokers)if(value===broker)brokers.delete(id);for(const item of broker.pending.values()){clearTimeout(item.timer);item.resolve((item.type==='api'?apiFailure:fallback)('GitHub sign-in required',401))}broker.pending.clear();broker.entries.clear();broker.port.close()}
self.addEventListener('message',event=>{
 if(event.data?.type!=='private-mount'||!event.ports?.[0]||!event.source?.id)return;
 const source=new URL(event.source.url);
 if(source.origin!==self.location.origin||!source.href.startsWith(self.registration.scope))return;
 const old=brokers.get(event.source.id);if(old)forget(old);
 const broker={port:event.ports[0],pending:new Map(),entries:new Map(),next:0,entry:crypto.randomUUID(),sourceURL:source.href};brokers.set(event.source.id,broker);
 broker.port.onmessage=message=>{
  const data=message.data;if(data?.type==='close'){forget(broker);return}
  if(data?.type==='open-entry'&&Number.isSafeInteger(data.requestId)){
   try{const url=new URL(data.url);if(url.origin!==self.location.origin||url.username||url.password||url.hash||url.href.length>2048||![mountPath+'prototype/',mountPath+'prototype/index.html'].includes(url.pathname))throw Error();
    url.searchParams.delete('_mount');for(const[key,value]of broker.entries)if(value.expires<Date.now())broker.entries.delete(key);if(broker.entries.size>=8)throw Error();
    const entry=crypto.randomUUID();broker.entries.set(entry,{url:url.href,expires:Date.now()+10000});url.searchParams.set('_mount',entry);broker.port.postMessage({type:'open-entry',requestId:data.requestId,url:url.href});
   }catch{broker.port.postMessage({type:'open-entry',requestId:data.requestId,error:true})}return;
  }
  const item=broker.pending.get(data?.id);if(!item)return;
  clearTimeout(item.timer);broker.pending.delete(data.id);
  if(!(data.bytes instanceof ArrayBuffer)||!Number.isInteger(data.status)||data.status<200||data.status>599){item.resolve(fallback('Invalid private resource response',502));return}
  item.resolve(new Response(item.method==='HEAD'||[204,205,304].includes(data.status)?null:data.bytes,{status:data.status,headers:{...data.headers,'Cache-Control':'no-store'}}));
 };
 broker.port.start();broker.port.postMessage({type:'mounted',mountPath,entry:broker.entry,protocol:4});
});
function forward(event,broker,type){
 event.respondWith((async()=>{
  let body;
  if(event.request.method==='POST'){
   if(event.request.headers.get('Content-Type')?.split(';')[0]!=='application/json')return apiFailure('JSON answer required',415);
   const reader=event.request.body?.getReader();if(!reader)return apiFailure('Answer body required',400);
   const chunks=[];let total=0,expired=false;
   const bodyTimer=setTimeout(()=>{expired=true;void reader.cancel().catch(()=>{})},20000);
   try{for(;;){const{done,value}=await reader.read();if(expired)return apiFailure('Answer upload timed out; keep your draft',504);if(done)break;total+=value.byteLength;if(total>1900000){await reader.cancel();return apiFailure('Answer document is too large',413)}chunks.push(value)}}finally{clearTimeout(bodyTimer)}
   const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}body=bytes.buffer;
   if(![...brokers.values()].includes(broker))return apiFailure('GitHub sign-in required',401);
  }
  return new Promise(resolve=>{
  const id=++broker.next;const timer=setTimeout(()=>{broker.pending.delete(id);resolve((type==='api'?apiFailure:fallback)('Private workspace request timed out',504))},20000);
  broker.pending.set(id,{resolve,timer,method:event.request.method,type});
  broker.port.postMessage({type,id,url:event.request.url,method:event.request.method,...(body?{body}:{})},body?[body]:[]);
 });})().catch(()=>apiFailure('Private workspace request failed; keep your draft',503)));
}
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
 let broker=brokers.get(event.clientId)||brokers.get(event.replacesClientId);
 if(!broker&&event.request.mode==='navigate'&&url.pathname.startsWith(mountPath)){
  const entry=url.searchParams.get('_mount');
  broker=[...new Set(brokers.values())].find(value=>entry===value.entry&&event.request.referrer===value.sourceURL);
  if(!broker&&event.request.method==='GET'){
   const destination=new URL(url);destination.searchParams.delete('_mount');
   broker=[...new Set(brokers.values())].find(value=>{const permit=value.entries.get(entry);if(!permit||permit.expires<Date.now()||permit.url!==destination.href)return false;
    if(event.request.referrer&&new URL(event.request.referrer).origin!==self.location.origin)return false;value.entries.delete(entry);return true;
   });
  }
 }
 if(!url.pathname.startsWith(mountPath)){
  // Existing absolute API calls must never fall through to a public host or old Sites.
  if(broker&&url.pathname.startsWith('/api/')){
   if(!['GET','HEAD'].includes(event.request.method)&&!(event.request.method==='POST'&&url.pathname==='/api/decisions'))event.respondWith(apiFailure('GitHub record writes are not connected yet. Keep your draft.',501));
   else forward(event,broker,'api');
  }
  return;
 }
 if(!broker){event.respondWith(fallback('Open the workspace and sign in with GitHub',401));return}
 if(event.resultingClientId)brokers.set(event.resultingClientId,broker);
 forward(event,broker,'resource');
});
