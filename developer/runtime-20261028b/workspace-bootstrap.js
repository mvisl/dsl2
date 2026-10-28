/** Generic public host. Private coordinates, code and records arrive only after sign-in. */
import{createGitHubSession}from'./auth-session.js';
import{createRepositoryTransport}from'./repository-transport.js';
import{createSourceSession}from'./source-session.js';
import{verifySealedBytes,readSealedTarGzip}from'./sealed-tar.js';
import{createRecordReader}from'./record-reader.js';
import{createDecisionWriter}from'./decision-writer.js';
import{createRecordAPI}from'./record-api.js';
import{mountPrivateRuntime}from'./private-mount.js';
import{mountWorkspaceViews}from'./workspace-views.js';
export function startWorkspaceHost({document:doc=globalThis.document,window:win=globalThis.window,bridgeOrigin,workerURL,scope,fetcher=globalThis.fetch}={}){
 const session=createGitHubSession({window:win,bridgeOrigin}),get=id=>doc.getElementById(id);
 const login=get('login'),gate=get('gate'),shell=get('shell'),status=get('status'),meter=get('meter'),modes=get('mode-controls');
 let workspace=null,epoch=0,controller=null;
 const phase=text=>{status.textContent=text;meter.removeAttribute('value')};
 function stop(){epoch++;controller?.abort();workspace?.views.destroy();workspace?.mount.close();workspace?.source.close();workspace=null;shell.hidden=true;gate.hidden=false;modes.hidden=true;meter.hidden=true}
 async function response(url,{signal,method='GET'}={}){const token=session.getToken();if(!token)throw Error('Войдите через GitHub повторно.');const r=await fetcher(url,{method,headers:{Authorization:'Bearer '+token},redirect:'error',cache:'no-store',signal});if(!r.ok)throw Object.assign(Error('Не удалось получить приватные ресурсы: '+r.status),{status:r.status});return r}
 async function asset(seal,label,signal){if(typeof seal?.alias!=='string'||!/^[-a-z0-9]+$/.test(seal.alias)||!Number.isSafeInteger(seal.bytes)||seal.bytes>16000000)throw Error('Неизвестный пакет ресурсов.');phase(label);meter.max=seal.bytes;meter.value=0;const r=await response(bridgeOrigin+'/assets/'+seal.alias,{signal}),reader=r.body.getReader(),chunks=[];let count=0;
  for(;;){const{done,value}=await reader.read();if(done)break;count+=value.length;if(count>seal.bytes){await reader.cancel();throw Error('Размер пакета изменился.')}chunks.push(value);meter.value=count}
  const bytes=new Uint8Array(count);let position=0;for(const chunk of chunks){bytes.set(chunk,position);position+=chunk.length}await verifySealedBytes(bytes,seal);return bytes;
 }
 async function bundle(spec,kind,limit,signal){const manifest=JSON.parse(new TextDecoder().decode(await asset(spec.manifest,'Проверяем описание приватных ресурсов…',signal)));if(manifest.kind!==kind||manifest.archive.sha256!==spec.archive.sha256||manifest.archive.bytes!==spec.archive.bytes)throw Error('Описание пакета изменилось.');const raw=await asset(spec.archive,'Загружаем пакет приватных ресурсов…',signal);phase('Проверяем исходники и графику…');meter.max=Object.keys(manifest.members).length;meter.value=0;const files=await readSealedTarGzip(raw,{seal:spec.archive,members:manifest.members,maxExpandedBytes:limit,onProgress:p=>{meter.max=p.total;meter.value=p.completed}});return{manifest,files}}
 login.onclick=async()=>{
  if(login.disabled)return;const current=++epoch;controller=new AbortController();const signal=controller.signal;login.disabled=true;meter.hidden=false;let source,mount,views;
  try{
   phase('Входим через GitHub…');if(!session.identity())await session.login();if(current!==epoch)return;
   phase('Проверяем доступ к рабочему столу…');const config=await(await response(bridgeOrigin+'/workspace',{signal})).json();
   if(config.schemaVersion!==1||config.repository?.id!==session.repository()?.id||!/^[-a-zA-Z0-9_.]+$/.test(config.repository.owner)||!/^[-a-zA-Z0-9_.]+$/.test(config.repository.name)||!/^[a-f0-9]{40}$/.test(config.sourceCommit))throw Error('Источник рабочего стола не подтверждён.');
   const repo=createRepositoryTransport({owner:config.repository.owner,repo:config.repository.name,commit:config.sourceCommit,dataBranch:config.dataBranch,getToken:()=>session.getToken(),fetcher});
   const imports=await bundle(config.assets.sources,'private-workspace-browser-imports',32000000,signal);if(imports.manifest.sourceRevision!==config.sourceCommit)throw Error('Workspace source revision changed.');
   const selected=await bundle(config.assets.selected,'private-selected-profile-runtime',128000000,signal);
   const sealPath='review-workspace/options-sheets/resource-seals.json',sourceSeal=await repo.readSource(sealPath,{signal});await verifySealedBytes(sourceSeal.bytes,selected.manifest.sourcePins[sealPath]);
   const reviews=await bundle(config.assets.reviews,'private-review-preview-storage',16000000,signal);
   const queueFile=await repo.readSource('review-workspace/data/queue.json',{signal});await verifySealedBytes(queueFile.bytes,{bytes:queueFile.bytes.length,sha256:reviews.manifest.queueSHA256});
   const queue=JSON.parse(new TextDecoder().decode(queueFile.bytes));if(!Array.isArray(queue.items))throw Error('Вопросы не загружены.');
   const files=new Map(selected.files);for(const[path,bytes]of [...imports.files,...reviews.files]){if(files.has(path))throw Error('Повторный приватный ресурс.');files.set(path,bytes)}
   files.set('options-sheets/resource-seals.json',sourceSeal.bytes);files.set('data/queue.json',queueFile.bytes);
   source=createSourceSession({transport:repo,getToken:()=>session.getToken(),verifiedFiles:files});
   const reader=createRecordReader({transport:source}),decisionWriter=createDecisionWriter({reader,transport:source,canWrite:()=>Boolean(session.identity()?.canWrite&&config.canWrite),questionIds:new Set(queue.items.map(q=>q.id))});
   const handleAPI=createRecordAPI({reader,origin:win.location.origin,decisionWriter,resourceCapabilities:()=>({selectedOptionsProfiles:true})});
   phase('Подключаем конструктор и вопросы…');mount=await mountPrivateRuntime({workerURL,scope,transport:source,handleAPI,origin:win.location.origin});
   if(current!==epoch){mount.close();source.close();return}
   views=mountWorkspaceViews({mount,editorFrame:get('builder'),questionsFrame:get('questions'),initialEditorPath:config.initialEditorPath,onMode:mode=>{for(const button of modes.querySelectorAll('[data-mode]'))button.setAttribute('aria-pressed',String(button.dataset.mode===mode))}});
   workspace={source,mount,views};shell.hidden=false;gate.hidden=true;modes.hidden=false;meter.hidden=true;
  }catch(error){views?.destroy();mount?.close();source?.close();if(current!==epoch)return;if([401,403].includes(error.status))session.logout();status.textContent=error.message||'Рабочий стол не загрузился. Можно повторить.';meter.hidden=true;login.textContent='Повторить загрузку'}finally{if(current===epoch)login.disabled=false}
 };
 for(const button of modes.querySelectorAll('[data-mode]'))button.onclick=()=>workspace?.views.setMode(button.dataset.mode);
 get('logout').onclick=()=>{stop();session.logout();status.textContent='Вы вышли из рабочего стола.';login.textContent='Войти через GitHub';login.disabled=false};
 const expiry=win.setInterval(()=>{if(workspace&&!session.identity()){stop();status.textContent='Сессия закончилась. Войдите через GitHub повторно.';login.disabled=false}},10000);
 win.addEventListener('pagehide',()=>{stop();session.logout();win.clearInterval(expiry)},{once:true});
 return{close(){stop();session.logout();win.clearInterval(expiry)}};
}
