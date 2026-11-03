/** Generic public host. Private coordinates, code and records arrive only after sign-in. */
import{createWorkspaceLocationMirror}from'./workspace-location.js?v=developer2';
import{readSealedAsset}from'./sealed-asset.js';
import{loadSelectedRuntime,prepareDeferredSelectedRuntime,createDeferredSelectedSource}from'./selected-runtime.js';
import{loadFullNativeRuntime}from'./full-native-runtime.js';
import{createOtherRecipeValidator}from'./other-recipe-validator.js?v=save-diagnostics2';
import{sourceEntryTarget,prototypeEntryPath}from'./entry-target.js?v=editor-selectors1';
import{createGitHubSession}from'./auth-session.js?v=memory-reuse1';
import{createRepositoryTransport}from'./repository-transport.js?v=save-diagnostics2';
import{createSourceSession}from'./source-session.js?v=verified-group1';
import{createDeferredSource}from'./deferred-source.js';
import{verifySealedBytes,readSealedTarGzip}from'./sealed-tar.js?v=lab-members1';
import{createRecordReader}from'./record-reader.js';
import{createScreenWriter}from'./screen-writer.js?v=save-diagnostics2';
import{createDecisionWriter}from'./decision-writer.js';
import{createRecordAPI}from'./record-api.js?v=save-diagnostics2';
import{mountPrivateRuntime}from'./private-mount.js?v=editor-selectors1';
import{mountWorkspaceViews}from'./workspace-views.js?v=editor-selectors1';
import{workspaceSurface,configureModeControls,consumedEntryURL}from'./workspace-surface.js?v=lab-entry1';
function workspaceDesignCapabilities(config){return{schemaVersion:1,supported:{applicationScreens:config.readableApplicationScreens,componentStackFamilies:Array.isArray(config.readableComponentFamilies)&&config.readableComponentFamilies.includes('active-trade-v2')?['active-trade-v2']:[]},readable:{applicationScreens:config.readableApplicationScreens,componentStackFamilies:Array.isArray(config.readableComponentFamilies)?[...new Set(config.readableComponentFamilies.filter(name=>typeof name==='string'&&/^[-a-z0-9]{1,64}$/.test(name)))].slice(0,32):[]}};}
export function startWorkspaceHost({document:doc=globalThis.document,window:win=globalThis.window,bridgeOrigin,workerURL,scope,surface:requestedSurface,fetcher=globalThis.fetch}={}){
 const session=createGitHubSession({window:win,bridgeOrigin}),get=id=>doc.getElementById(id);
 const requested=new URL(win.location.href).searchParams.get('returnTo'),entryTarget=requested?sourceEntryTarget(requested,new URL(scope,win.location.origin).href):null;
 const surface=workspaceSurface({requested:requestedSurface,entryTarget,url:win.location.href});
 const inboxId=new URL(win.location.href).searchParams.get('inbox'),initialInboxId=entryTarget?.inboxId||(/^[-\w]{1,100}$/.test(inboxId||'')?inboxId:null);
 const prototypeTarget=prototypeEntryPath(entryTarget);
 const login=get('login'),gate=get('gate'),shell=get('shell'),status=get('status'),meter=get('meter'),modes=get('mode-controls');configureModeControls(modes,surface,doc);
 let workspace=null,epoch=0,controller=null;
 const reportConnectionError=()=>{let notice=get('workspace-notice');if(!notice){notice=doc.createElement('p');notice.id='workspace-notice';notice.setAttribute('role','alert');doc.body.append(notice)}notice.textContent='Соединение прервалось. Повторите переход.';notice.hidden=false};
 const phase=text=>{status.textContent=text;meter.removeAttribute('value')};
 function stop(){epoch++;controller?.abort();workspace?.views.destroy();workspace?.mount.close();workspace?.source.close();workspace?.deferred.closeDeferred();workspace=null;if(get('workspace-notice'))get('workspace-notice').hidden=true;shell.hidden=true;gate.hidden=false;modes.hidden=true;meter.hidden=true}
 async function response(url,{signal,method='GET'}={}){const token=session.getToken();if(!token)throw Error('Войдите через GitHub повторно.');const r=await fetcher(url,{method,headers:{Authorization:'Bearer '+token},redirect:'error',cache:'no-store',signal});if(!r.ok)throw Object.assign(Error('Не удалось получить приватные ресурсы: '+r.status),{status:r.status});return r}
 async function asset(seal,label,signal){if(typeof seal?.alias!=='string'||!/^[-a-z0-9]+$/.test(seal.alias)||!Number.isSafeInteger(seal.bytes)||seal.bytes>16000000)throw Error('Неизвестный пакет ресурсов.');phase(label);meter.max=seal.bytes;meter.value=0;const bytes=await readSealedAsset({load:(part,partSignal)=>response(bridgeOrigin+'/assets/'+seal.alias+(Number.isSafeInteger(part)?'/parts/'+part:''),{signal:partSignal||signal}),seal,signal,onBytes:value=>{meter.value=value},onRetry:()=>phase('Передача прервалась. Повторяем проверенный пакет…')});meter.value=bytes.length;return bytes;
 }
 async function bundle(spec,kind,limit,signal){try{const manifest=JSON.parse(new TextDecoder().decode(await asset(spec.manifest,'Проверяем описание приватных ресурсов…',signal)));if(manifest.kind!==kind||manifest.archive.sha256!==spec.archive.sha256||manifest.archive.bytes!==spec.archive.bytes)throw Error('Описание пакета изменилось.');const raw=await asset(spec.archive,'Загружаем пакет приватных ресурсов…',signal);phase('Проверяем исходники и графику…');meter.max=Object.keys(manifest.members).length;meter.value=0;const files=await readSealedTarGzip(raw,{seal:spec.archive,members:manifest.members,maxExpandedBytes:limit,maxMembers:kind==='private-workspace-browser-imports'?2200:2000,onProgress:p=>{meter.max=p.total;meter.value=p.completed}});return{manifest,files}}catch(error){throw Error(kind+': '+error.message)}}
 login.onclick=async()=>{
  if(login.disabled)return;const current=++epoch;controller=new AbortController();const signal=controller.signal;login.disabled=true;meter.hidden=false;let source,mount,views,deferred,selectedSource,reviewSource;
  try{
   phase('Входим через GitHub…');if(!session.identity())await session.login();if(current!==epoch)return;
   phase('Проверяем доступ к рабочему столу…');const config=await(await response(bridgeOrigin+'/workspace',{signal})).json();
   if(config.schemaVersion!==1||config.repository?.id!==session.repository()?.id||!/^[-a-zA-Z0-9_.]+$/.test(config.repository.owner)||!/^[-a-zA-Z0-9_.]+$/.test(config.repository.name)||!/^[a-f0-9]{40}$/.test(config.sourceCommit))throw Error('Источник рабочего стола не подтверждён.');
   const repo=createRepositoryTransport({owner:config.repository.owner,repo:config.repository.name,commit:config.sourceCommit,dataBranch:config.dataBranch,getToken:()=>session.getToken(),fetcher});
   const imports=await bundle(config.assets.sources,'private-workspace-browser-imports',32000000,signal);if(imports.manifest.sourceRevision!==config.sourceCommit)throw Error('Workspace source revision changed.');
   const selectedOptions={spec:config.assets.selected,expectedSourceRevision:config.sourceCommit,loadAsset:(seal,signal)=>asset(seal,'Загружаем проверенный пакет ресурсов…',signal),loadLegacy:bundle,signal,onProgress:p=>{meter.max=p.total;meter.value=p.completed}},lazySelected=config.assets.selected?.mode==='bounded-selected-shards-v2',selected=lazySelected?await prepareDeferredSelectedRuntime(selectedOptions):await loadSelectedRuntime(selectedOptions);
   const sealPath='review-workspace/options-sheets/resource-seals.json',sourceSeal=await repo.readSource(sealPath,{signal});await verifySealedBytes(sourceSeal.bytes,selected.manifest.sourcePins[sealPath]);
   const reviewSpec=config.assets.reviews,reviewManifestBytes=await asset(reviewSpec.manifest,'Проверяем описание вопросов…',signal),reviewManifest=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(reviewManifestBytes));
   if(reviewManifest.kind!=='private-review-preview-storage'||reviewManifest.sourceRevision!==config.sourceCommit||reviewManifest.archive.sha256!==reviewSpec.archive.sha256||reviewManifest.archive.bytes!==reviewSpec.archive.bytes)throw Error('Описание вопросов изменилось.');
   const reviews={manifest:reviewManifest};
   const queueFile=await repo.readSource('review-workspace/data/queue.json',{signal});await verifySealedBytes(queueFile.bytes,{bytes:queueFile.bytes.length,sha256:reviews.manifest.queueSHA256});
   const queue=JSON.parse(new TextDecoder().decode(queueFile.bytes));if(!Array.isArray(queue.items))throw Error('Вопросы не загружены.');
   const files=new Map(selected.files||[]);for(const[path,bytes]of [...imports.files]){if(files.has(path))throw Error('Повторный приватный ресурс.');files.set(path,bytes)}
   files.set('options-sheets/resource-seals.json',sourceSeal.bytes);files.set('data/queue.json',queueFile.bytes);
   const fullPaths=new Set(['native.json','native.css','token-bindings.json','server-contract.json'].map(p=>'review-workspace/options-sheets/'+p));
   if(lazySelected)selectedSource=createDeferredSelectedSource({transport:repo,prepared:selected,getToken:()=>session.getToken(),admit:group=>source.admitSelectedSources(group),admitShared:group=>source.admitVerifiedSources(group),onState:state=>{doc.documentElement.dataset.selectedNativeState=state}});
   reviewSource=createDeferredSelectedSource({transport:selectedSource||repo,prepared:{manifest:reviews.manifest,load:async({signal:reviewSignal})=>{
    const raw=await asset(reviewSpec.archive,'Загружаем изображения вопросов…',reviewSignal);
    return{manifest:reviews.manifest,files:await readSealedTarGzip(raw,{seal:reviewSpec.archive,members:reviews.manifest.members,maxExpandedBytes:16000000,maxMembers:2000})};
   }},getToken:()=>session.getToken(),admit:group=>source.admitReviewSources(group),onState:state=>{doc.documentElement.dataset.reviewPreviewsState=state}});
   deferred=createDeferredSource({transport:reviewSource,paths:fullPaths,getToken:()=>session.getToken(),load:async({signal:fullSignal})=>{
    doc.documentElement.dataset.fullNativeState='loading';let full,admitted=false;
    try{
     const pins=JSON.parse(new TextDecoder().decode(sourceSeal.bytes)).files,expectedMembers=Object.fromEntries(['native.json','native.css','token-bindings.json','server-contract.json'].map(name=>['options-sheets/'+name,pins[name]]));
     full=await loadFullNativeRuntime({spec:config.assets.fullNative,expectedSourceRevision:config.sourceCommit,expectedMembers,maxReassembledBytes:384000000-source.stats().bytes,loadAsset:(seal,signal)=>asset(seal,'Проверяем исходники и графику…',signal),loadLegacy:bundle,signal:fullSignal,onProgress:p=>{meter.max=p.total;meter.value=p.completed}});
     const result=new Map([...full.files].map(([path,bytes])=>['review-workspace/'+path,bytes]));
     source.admitVerifiedSources(result);admitted=true;doc.documentElement.dataset.fullNativeState='verified';delete doc.documentElement.dataset.fullNativeError;return result;
    }catch(error){if(full&&!admitted){for(const b of full.files.values())b.fill(0);full.files.clear()}doc.documentElement.dataset.fullNativeState='failed';doc.documentElement.dataset.fullNativeError=String(error.message).slice(0,240);throw error}
   }});
   source=createSourceSession({transport:deferred,getToken:()=>session.getToken(),verifiedFiles:files,selectedMembers:lazySelected?selected.manifest.members:null,reviewMembers:reviews.manifest.members,maxCacheBytes:384000000});
   {const close=deferred.closeDeferred;deferred.closeDeferred=()=>{close();selectedSource?.closeSelected();reviewSource.closeSelected()}}
   const reader=createRecordReader({transport:source}),decisionWriter=createDecisionWriter({reader,transport:source,canWrite:()=>Boolean(session.identity()?.canWrite&&config.canWrite),questionIds:new Set(queue.items.map(q=>q.id))});
   let authorities;
   const authorityFor=async(recipe,{signal}={})=>{
    if(!authorities)authorities=Promise.all(config.nativeContracts.map(async path=>{const file=await source.readSource(path,{signal});return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(file.bytes))})).catch(error=>{authorities=null;throw error});
    const list=await authorities,match=list.find(a=>a.profiles?.[recipe?.context?.nativeProfile]?.recipe?.screenType===recipe?.screenType);if(!match)throw Error('Native source validation is unavailable');return match;
   };
   let componentStudyValidator,otherRecipeValidator;
   const validateOtherRecipe=async(recipe,{signal}={})=>{
    await mount.ensure();if(recipe?.schemaVersion===1){if(!componentStudyValidator){const{createComponentStudyValidator}=await import(new URL('compose/study-authority.js',mount.baseURL).href);componentStudyValidator=createComponentStudyValidator({readSource:path=>source.readSource(path)});}return componentStudyValidator(recipe,{signal});}
    // The editor's own source dispatcher (editor/source-loaders.js); strict runtime.validate, context and entry decide.
    otherRecipeValidator??=createOtherRecipeValidator({loadModules:()=>Promise.all(['editor/runtime.js','editor/source-startup.js','editor/source-loaders.js'].map(path=>import(new URL(path,mount.baseURL).href))).then(([runtime,startup,loaders])=>({loadPreviewRuntime:runtime.loadPreviewRuntime,requiresCompleteRuntime:startup.requiresCompleteRuntime,createSourceLoaders:loaders.createSourceLoaders}))});
    return otherRecipeValidator(recipe);
   };
   const screenWriter=createScreenWriter({reader,transport:source,canWrite:()=>Boolean(session.identity()?.canWrite&&config.canWrite),authorityFor,validateOtherRecipe});
   let inboxAPI,calibrationAPI;const recordAPI=createRecordAPI({reader,origin:win.location.origin,decisionWriter,screenWriter,resourceCapabilities:()=>({selectedOptionsProfiles:true}),onSaveDiagnostic:d=>{doc.documentElement.dataset.variantSaveDiagnostic=d?.saved?'saved':d?d.stage+':'+d.reason+':'+d.writeOutcome:'unclassified'},designCapabilities:()=>workspaceDesignCapabilities(config)});
   const handleAPI=async request=>(calibrationAPI?await calibrationAPI(request):null)??(inboxAPI?await inboxAPI(request):null)??recordAPI(request);
   phase('Подключаем конструктор и вопросы…');if(entryTarget)win.history.replaceState(win.history.state,'',consumedEntryURL(win.location.href,{surface,requestedSurface}));mount=await mountPrivateRuntime({workerURL,scope,transport:source,handleAPI,origin:win.location.origin,onRecovered:()=>{doc.documentElement.dataset.recoveredClients=String(Number(doc.documentElement.dataset.recoveredClients||0)+1)}});
   if(current!==epoch){mount.close();source.close();deferred.closeDeferred();return}
   const[{createInboxAPI},{createAttachmentAPI}]=await Promise.all([import(new URL('github/inbox-api.js',mount.baseURL).href),import(new URL('github/attachment-api.js',mount.baseURL).href)]);
   const attachmentActor=()=>{const identity=session.identity();return identity?{id:'github:'+identity.user.id,scope:'repository:'+session.repository().id}:null},attachmentWrite=()=>Boolean(session.identity()?.canWrite&&config.canWrite),attachments=createAttachmentAPI({reader,transport:source,origin:win.location.origin,getActor:attachmentActor,canWrite:attachmentWrite});
   inboxAPI=createInboxAPI({reader,transport:source,origin:win.location.origin,attachmentAPI:attachments.handle,validateAttachments:attachments.validateAttachments,getActor:()=>{const identity=session.identity();return identity?{id:'github:'+identity.user.id,scope:'repository:'+session.repository().id}:null},getIdentity:()=>session.identity()?.user,canWrite:()=>Boolean(session.identity()?.canWrite&&config.canWrite),canOperate:()=>Boolean(session.identity()?.canWrite&&config.canWrite&&session.identity().user.login.toLowerCase()===config.repository.owner.toLowerCase())});
   const {createCalibrationAPI}=await import(new URL('github/calibration-api.js',mount.baseURL).href);
   const bankFile=await source.readSource('review-workspace/calibration/cases.json');
   calibrationAPI=createCalibrationAPI({transport:source,origin:win.location.origin,bank:JSON.parse(new TextDecoder().decode(bankFile.bytes)),getActor:attachmentActor,canWrite:attachmentWrite});
   const route=createWorkspaceLocationMirror({privateBaseURL:mount.baseURL,surface,getURL:()=>win.location.href,replaceURL:url=>win.history.replaceState(win.history.state,'',url),initialMode:entryTarget?.review?'questions':initialInboxId?'inbox':'constructor',initialInboxPath:initialInboxId?'inbox/index.html?request='+encodeURIComponent(initialInboxId):'inbox/index.html'});
   views=mountWorkspaceViews({mount,surface,editorFrame:get('builder'),questionsFrame:get('questions'),initialQuestionsPath:entryTarget?.reviewPath||'index.html',inboxFrame:get('inbox'),initialInboxPath:initialInboxId?'inbox/index.html?request='+encodeURIComponent(initialInboxId):'inbox/index.html',initialMode:entryTarget?.review?'questions':initialInboxId?'inbox':undefined,onInboxLocation:route.inboxLocation,onComposeHandled:hash=>{if(win.location.hash===hash){const url=new URL(win.location.href);url.hash='';win.history.replaceState(win.history.state,'',url.href)}},initialEditorPath:(!prototypeTarget&&entryTarget?.editorPath)||config.initialEditorPath,initialPrototypePath:prototypeTarget,preferInitial:!!entryTarget,onError:reportConnectionError,onMode:mode=>{route.setMode(mode);if(get('workspace-notice'))get('workspace-notice').hidden=true;for(const button of modes.querySelectorAll('[data-mode]'))button.setAttribute('aria-pressed',String(button.dataset.mode===mode))}});
   workspace={source,mount,views,deferred};if(win.location.hash.startsWith('#compose='))views.openInbox(win.location.hash);shell.hidden=false;gate.hidden=true;modes.hidden=false;meter.hidden=true;
  }catch(error){views?.destroy();mount?.close();source?.close();deferred?.closeDeferred();selectedSource?.closeSelected();reviewSource?.closeSelected();if(current!==epoch)return;if([401,403].includes(error.status))session.logout();status.textContent=error.message||'Рабочий стол не загрузился. Можно повторить.';meter.hidden=true;login.textContent='Повторить загрузку'}finally{if(current===epoch)login.disabled=false}
 };
 for(const button of modes.querySelectorAll('[data-mode]'))button.onclick=()=>workspace?.views.setMode(button.dataset.mode);
 const logout=get('logout');if(logout)logout.onclick=()=>{stop();session.logout();status.textContent='Вы вышли из рабочего стола.';login.textContent='Войти через GitHub';login.disabled=false};
 const expiry=win.setInterval(()=>{if(workspace&&!session.identity()){stop();status.textContent='Сессия закончилась. Войдите через GitHub повторно.';login.disabled=false}},10000);
 win.addEventListener('pagehide',()=>{stop();session.logout();win.clearInterval(expiry)},{once:true});
 return{close(){stop();session.logout();win.clearInterval(expiry)}};
}
