/** Entry hints are consumed before exact root-referrer binding.
 * Generic Pages service worker. Private bytes travel through a live page port only. */
const brokers=new Map(),claims=new Map();
const mountPath=new URL('private/',self.registration.scope).pathname;
const apiFailure=(message,status=503)=>Response.json({error:message,saved:false},{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const attachmentPath=path=>/^\/data\/attachments\/[a-f0-9]{32}\.(png|jpg|webp|gif)$/.test(path);
const writableJSON=path=>['/api/decisions','/api/screens','/api/inbox','/api/calibration'].includes(path)||/^\/api\/inbox\/([-\w]{1,100})(?:\/(archive|response))?$/.test(path);
const depositContexts=['current28','historical11'];
// Mirror of github/editor-selectors.js (this classic worker cannot import it); a test keeps them equal.
const walletProfiles=['collapsed','cfd','portfolioEntry'],editorNativeSelectors=['historicalMore','accountBenefits','depositSeven','optionsSheet','outcomeScreen','marketsList','metatrader','reports','internalTransfer','historicalWallet','instrumentSearch','about','onboarding','calendar','news','notificationSettings','welcomeBonus','productInbox','personalDetails','settingsProfile','depositTier','accountHistory','depositWarning','paymentOverlay','recurringDraft','withdrawalDraft','depositExtended','depositDraft','markets','notifications','currentPayments','fcilPayments','fcilWallet','wallet','nativeTrades','f1Trades'],editorSelectors=['screen','workingCopy','profile',...editorNativeSelectors,'depositContext'];
/** Exact editor selectors (one source: record, local copy with its exact parent, or one native selector) or null. */
function exactEditorSelectors(params,{drop=[],allowEmpty=false}={}){
 for(const name of params.keys())if(!editorSelectors.includes(name)&&!drop.includes(name))return null;
 const query=new URLSearchParams();for(const name of editorSelectors){const values=params.getAll(name);if(values.length>1)return null;if(values.length){if(!/^[-\w:;.]{1,160}$/.test(values[0]))return null;query.set(name,values[0])}}
 if(!query.size)return allowEmpty?query:null;
 const natives=editorNativeSelectors.filter(name=>query.has(name));if(natives.length>1)return null;const native=natives[0],record=query.has('screen'),copy=query.has('workingCopy');
 if(!native&&!record&&!copy)return null;
 if(query.has('fcilWallet')&&!walletProfiles.includes(query.get('fcilWallet')))return null;
 if(query.has('depositContext')&&(native!=='fcilWallet'||!depositContexts.includes(query.get('depositContext'))))return null;
 if(query.has('profile')&&!record)return null;
 if(native&&record&&!copy&&!['fcilWallet','optionsSheet'].includes(native))return null;
 return query;
}
const fallback=(message,status=503)=>new Response(message,{status,headers:{'Cache-Control':'no-store','Content-Type':'text/plain; charset=utf-8','X-Content-Type-Options':'nosniff'}});
function signInEntry(request){
 const current=new URL(request.url),root=new URL(self.registration.scope),entry=new URL('workspace-preview.html',root);
 // Direct editor: every supported selector survives exactly; a stale _mount is discarded; anything else
 // unknown, duplicate or incompatible withholds the return target instead of continuing to the bare editor.
 if(['editor/','editor/index.html'].some(p=>current.pathname===mountPath+p)){
  const params=exactEditorSelectors(current.searchParams,{drop:['_mount'],allowEmpty:true});
  if(params)entry.searchParams.set('returnTo',current.pathname.slice(root.pathname.length)+(params.size?'?'+params:''));
 }
 if(['prototype/','prototype/index.html'].some(p=>current.pathname===mountPath+p)){const params=new URLSearchParams();
  for(const name of ['screen','record','profile','optionsSheet','nativeTrades','f1Trades','map','view']){const values=current.searchParams.getAll(name);if(values.length===1&&/^[-\w:;.]{1,160}$/.test(values[0]))params.set(name,values[0])}
  // Prototype Deposit context survives exactly or the return target is withheld; never defaulted to 28.
  const contexts=current.searchParams.getAll('depositContext'),context=contexts.length===1&&depositContexts.includes(contexts[0]);if(context)params.set('depositContext',contexts[0]);
  if(!contexts.length||context)entry.searchParams.set('returnTo',current.pathname.slice(root.pathname.length)+(params.size?'?'+params:''));
 }
 if(['signals/','signals/index.html'].some(p=>current.pathname===mountPath+p)){
  const params=new URLSearchParams();let valid=true;
  for(const[key,value]of current.searchParams){if(key==='_mount')continue;if(key!=='node-id'||params.has(key)||!/^\d+:\d+$/.test(value)){valid=false;break}params.set(key,value)}
  if(valid)entry.searchParams.set('returnTo','private/signals/'+(params.size?'?'+params:''));
 }
 if(['inbox/','inbox/index.html'].some(p=>current.pathname===mountPath+p)){const values=current.searchParams.getAll('request');if(values.length===1&&/^[-\w]{1,100}$/.test(values[0]))entry.searchParams.set('inbox',values[0])}
 const href=entry.href.replaceAll('&','&amp;').replaceAll('"','&quot;');
 return new Response('<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="referrer" content="no-referrer"><title>Вход в рабочий стол</title><body style="font:18px system-ui;background:#151515;color:#eee;padding:48px;max-width:640px"><h1>Войдите в рабочий стол</h1><p>Для этого экрана нужен GitHub-вход. После входа можно открыть исходный экран. Локальный черновик доступен только на устройстве, где он создан.</p><a style="color:#f9a367" href="'+href+'">Продолжить через GitHub →</a></body></html>',{status:401,headers:{'Cache-Control':'no-store','Content-Type':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'"}});
}

self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
// History navigation hints are not credentials; HTTP referrers never carry hashes.
// Keep exact origin/path/other query fields plus the root-issued random entry.
function rootReferrer(referrer,sourceURL){try{const actual=new URL(referrer),source=new URL(sourceURL);for(const url of [actual,source]){url.hash='';url.searchParams.delete('returnTo');url.searchParams.delete('inbox')}return actual.href===source.href}catch{return false}}
function forget(broker){for(const[id,value]of brokers)if(value===broker)brokers.delete(id);for(const item of broker.pending.values()){clearTimeout(item.timer);item.resolve((item.type==='api'?apiFailure:fallback)('GitHub sign-in required',401))}broker.pending.clear();broker.entries.clear();broker.port.close()}
function issueUIEntry(broker,value){
 const url=new URL(value),paths=['prototype/','prototype/index.html','editor/','editor/index.html','compose/','compose/index.html','inbox/','inbox/index.html','calibration/','calibration/index.html','index.html'];
 if(![...brokers.values()].includes(broker)||url.origin!==self.location.origin||url.username||url.password||url.hash||url.href.length>2048||!paths.some(path=>url.pathname===mountPath+path))throw Error('Exact private UI entry required');
 const editor=['editor/','editor/index.html'].some(path=>url.pathname===mountPath+path),prototype=['prototype/','prototype/index.html'].some(path=>url.pathname===mountPath+path);if(editor&&!exactEditorSelectors(url.searchParams))throw Error('Exact editor selector required');if(prototype){const allowed=['screen','record','workingCopy','profile','optionsSheet','nativeTrades','f1Trades','map','view','depositContext'],query=new URLSearchParams();for(const[key,value]of url.searchParams){if(!allowed.includes(key)||query.has(key)||!/^[-\w:;.]{1,160}$/.test(value)||key==='depositContext'&&!depositContexts.includes(value))throw Error('Exact private selector required');query.set(key,value)}}
 // Nested calibration frames carry only the explicit QA scope flag; owner canonical uses the bare path.
 if(['calibration/','calibration/index.html'].some(path=>url.pathname===mountPath+path)&&url.search&&url.search!=='?calibrationQA=1')throw Error('Exact calibration selector required');
 url.searchParams.delete('_mount');for(const[key,item]of broker.entries)if(item.expires<Date.now())broker.entries.delete(key);if(broker.entries.size>=8)throw Error('Too many pending entries');
 const entry=crypto.randomUUID();broker.entries.set(entry,{url:url.href,expires:Date.now()+10000});url.searchParams.set('_mount',entry);return url.href;
}
self.addEventListener('message',event=>{
 if(!event.source?.id)return;
 const source=new URL(event.source.url);if(source.origin!==self.location.origin||!source.href.startsWith(self.registration.scope))return;
 if(event.data?.type==='private-check'&&event.ports?.[0]){event.ports[0].postMessage({alive:brokers.has(event.source.id)});event.ports[0].close();return}
 if(event.data?.type==='private-ui-entry'&&event.ports?.[0]){
  const port=event.ports[0],work=(async()=>{try{const broker=brokers.get(event.source.id)||await recover({clientId:event.source.id});if(!broker)throw Error('GitHub sign-in required');port.postMessage({url:issueUIEntry(broker,event.data.url)})}catch{port.postMessage({error:true})}finally{port.close()}})();event.waitUntil?.(work);return;
 }
 if(event.data?.type==='private-reclaim'){
  const claim=claims.get(event.data.challenge),broker=brokers.get(event.source.id);
  if(claim&&broker){clearTimeout(claim.timer);claims.delete(event.data.challenge);brokers.set(claim.clientId,broker);broker.port.postMessage({type:'reclaimed',challenge:event.data.challenge});claim.resolve(broker)}return;
 }
 if(event.data?.type!=='private-mount'||!event.ports?.[0])return;
 const old=brokers.get(event.source.id);if(old)forget(old);
 const broker={port:event.ports[0],pending:new Map(),entries:new Map(),next:0,entry:crypto.randomUUID(),sourceURL:source.href};brokers.set(event.source.id,broker);
 broker.port.onmessage=message=>{
  const data=message.data;if(data?.type==='close'){forget(broker);return}
  if(data?.type==='open-entry'&&Number.isSafeInteger(data.requestId)){
   try{broker.port.postMessage({type:'open-entry',requestId:data.requestId,url:issueUIEntry(broker,data.url)});
   }catch{broker.port.postMessage({type:'open-entry',requestId:data.requestId,error:true})}return;
  }
  const item=broker.pending.get(data?.id);if(!item)return;
  clearTimeout(item.timer);broker.pending.delete(data.id);
  if(!(data.bytes instanceof ArrayBuffer)||!Number.isInteger(data.status)||data.status<200||data.status>599){item.resolve(fallback('Invalid private resource response',502));return}
  item.resolve(new Response(item.method==='HEAD'||[204,205,304].includes(data.status)?null:data.bytes,{status:data.status,headers:{...data.headers,'Cache-Control':'no-store'}}));
 };
 broker.port.start();broker.port.postMessage({type:'mounted',mountPath,entry:broker.entry,protocol:5});
});
function forward(event,broker,type){event.respondWith(forwarded(event.request,broker,type))}
function forwarded(request,broker,type){
 if(type==='api'&&!['GET','HEAD'].includes(request.method)&&!(request.method==='POST'&&(writableJSON(new URL(request.url).pathname)||new URL(request.url).pathname==='/api/attachments')))return Promise.resolve(apiFailure('GitHub record writes are not connected yet. Keep your draft.',501));
 return (async()=>{
  let body,contentType;
  if(request.method==='POST'){
   contentType=request.headers.get('Content-Type')?.split(';')[0];const image=new URL(request.url).pathname==='/api/attachments';if(image?!['image/png','image/jpeg','image/webp','image/gif'].includes(contentType):contentType!=='application/json')return apiFailure('Matching JSON or image content required',415);const maxBody=image?10485760:1900000;
   const reader=request.body?.getReader();if(!reader)return apiFailure('Answer body required',400);
   const chunks=[];let total=0,expired=false;
   const bodyTimer=setTimeout(()=>{expired=true;void reader.cancel().catch(()=>{})},20000);
   try{for(;;){const{done,value}=await reader.read();if(expired)return apiFailure('Answer upload timed out; keep your draft',504);if(done)break;total+=value.byteLength;if(total>maxBody){await reader.cancel();return apiFailure('Answer document is too large',413)}chunks.push(value)}}finally{clearTimeout(bodyTimer)}
   const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}body=bytes.buffer;
   if(![...brokers.values()].includes(broker))return apiFailure('GitHub sign-in required',401);
  }
  return new Promise(resolve=>{
  const id=++broker.next;const timer=setTimeout(()=>{broker.pending.delete(id);resolve((type==='api'?apiFailure:fallback)('Private workspace request timed out',504))},type==='resource'||(type==='api'&&request.method==='POST'&&new URL(request.url).pathname==='/api/screens')?120000:20000);
  broker.pending.set(id,{resolve,timer,method:request.method,type});
  broker.port.postMessage({type,id,url:request.url,method:request.method,...(body?{body,contentType}:{})},body?[body]:[]);
 });})().catch(()=>apiFailure('Private workspace request failed; keep your draft',503));
}
async function recover(event){
 const clientId=event.clientId||event.replacesClientId;if(!clientId||typeof self.clients.get!=='function')return null;
 const client=await self.clients.get(clientId);if(!client)return null;const url=new URL(client.url);if(url.origin!==self.location.origin||!url.pathname.startsWith(mountPath))return null;
 return new Promise(resolve=>{const challenge=crypto.randomUUID(),timer=setTimeout(()=>{claims.delete(challenge);resolve(null)},4000);claims.set(challenge,{clientId,resolve,timer});client.postMessage({type:'private-owner-probe',challenge})});
}
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
 let broker=brokers.get(event.clientId)||brokers.get(event.replacesClientId);
 if(!broker&&event.request.mode==='navigate'&&url.pathname.startsWith(mountPath)){
  const entry=url.searchParams.get('_mount');
  broker=[...new Set(brokers.values())].find(value=>entry===value.entry&&rootReferrer(event.request.referrer,value.sourceURL));
  if(!broker&&event.request.method==='GET'){
   const destination=new URL(url);destination.searchParams.delete('_mount');
   broker=[...new Set(brokers.values())].find(value=>{const permit=value.entries.get(entry);if(!permit||permit.expires<Date.now()||permit.url!==destination.href)return false;
    if(event.request.referrer&&new URL(event.request.referrer).origin!==self.location.origin)return false;value.entries.delete(entry);return true;
   });
  }
 }
 if(!url.pathname.startsWith(mountPath)){
  // Existing absolute API calls must never fall through to a public host or old Sites.
  if(broker&&(url.pathname.startsWith('/api/')||attachmentPath(url.pathname))){
   if(!['GET','HEAD'].includes(event.request.method)&&!(event.request.method==='POST'&&(writableJSON(url.pathname)||url.pathname==='/api/attachments')))event.respondWith(apiFailure('GitHub record writes are not connected yet. Keep your draft.',501));
   else forward(event,broker,'api');
  }else if(url.pathname.startsWith('/api/')||attachmentPath(url.pathname))event.respondWith(recover(event).then(b=>b?forwarded(event.request,b,'api'):apiFailure('GitHub sign-in required',401)));
  return;
 }
 if(!broker){event.respondWith(recover(event).then(b=>{if(!b)return event.request.mode==='navigate'?signInEntry(event.request):fallback('Open the workspace and sign in with GitHub',401);if(event.resultingClientId)brokers.set(event.resultingClientId,b);return forwarded(event.request,b,'resource')}));return}
 if(event.resultingClientId)brokers.set(event.resultingClientId,broker);
 forward(event,broker,'resource');
});
