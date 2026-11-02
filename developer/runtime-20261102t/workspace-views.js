import{mountScopedEditorLinks,watchOwnedPrivateWindow,PROTOTYPE_SELECTORS}from'./scoped-editor-links.js?v=editor-selectors1';
import{DEPOSIT_CONTEXTS,EDITOR_NATIVE_SELECTORS,exactEditorSelectors}from'./editor-selectors.js';
export{EDITOR_NATIVE_SELECTORS};
/** Native FCIL Wallet editor selectors by source type (inverse of the private FCIL_WALLET_TYPES).
 * A prototype screen value is a source type, never a saved record ID, so these never become editor screen=. */
export const FCIL_WALLET_EDITOR_PROFILES=Object.freeze({'fcil-wallet-collapsed-native-v1':'collapsed','fcil-wallet-cfd-native-v1':'cfd','fcil-wallet-portfolio-entry-native-v1':'portfolioEntry'});
/** Retain independent editor/review/Inbox DOMs; persistent state contains navigation only.
 * Surface 'developer' has exactly Constructor + Inbox; the legacy 'questions' mode name maps
 * to Inbox there and owner review is never loaded. Surface 'lab' keeps the owner workflow. */
export const LEGACY_VIEW_KEY='dsl2-github:workspace-view',DEVELOPER_VIEW_KEY='dsl2-github:workspace-view:developer:v2';
export function mountWorkspaceViews({mount,editorFrame,questionsFrame,inboxFrame,window:win=globalThis.window,storage=globalThis.localStorage,tabStorage=globalThis.sessionStorage,surface='lab',initialEditorPath='editor/',initialQuestionsPath='index.html',initialInboxPath='inbox/index.html',initialMode,initialPrototypePath,preferInitial=false,onMode=()=>{},onError=()=>{},onInboxLocation=()=>{},onComposeHandled=()=>{}}={}){
 if(typeof mount?.entryURL!=='function'||!editorFrame||!questionsFrame)throw Error('Private mount and workspace views required');
 if(!['index.html','index.html?reviewMode=calibration','index.html?reviewMode=calibration&calibrationQA=1'].includes(initialQuestionsPath)&&!/^signals\/(?:\?node-id=\d+%3A\d+)?$/.test(initialQuestionsPath))throw Error('Exact review entry required');
 if(!['lab','developer'].includes(surface))throw Error('Unknown workspace surface');const developer=surface==='developer';if(developer&&!inboxFrame)throw Error('Developer Inbox frame required');
 const base=new URL(mount.baseURL),key=developer?DEVELOPER_VIEW_KEY:LEGACY_VIEW_KEY,children=new Set(),childWatchers=new Map(),modes=developer?['constructor','inbox']:inboxFrame?['constructor','questions','inbox']:['constructor','questions'];let mode='constructor',editorPath=initialEditorPath,inboxPath=initialInboxPath,started=new Set(),disposed=false,pendingCompose=null,pendingRequest=null;
 const modeFor=value=>developer&&value==='questions'?'inbox':value;
 // Editor paths use the shared exact selector contract (editor-selectors.js). The editor's own reported
 // location drops other names (auth, transient mounts) as before; a prototype's Edit target refuses them
 // and must name a source, so no target is ever the bare default editor.
 function editorQuery(value,strict){const url=new URL(value,base);if(url.origin!==base.origin||![base.pathname+'editor/',base.pathname+'editor/index.html'].includes(url.pathname)||strict&&(url.username||url.password||url.hash))return null;
  return exactEditorSelectors(url.searchParams,strict?{}:{dropUnknown:true,allowEmpty:true})}
 function safePath(value){try{const query=editorQuery(value,false);return query?'editor/'+(query.size?'?'+query:''):null}catch{return null}}
 function editTarget(value){try{if(typeof value!=='string')return null;const query=editorQuery(value,true);return query?'editor/?'+query:null}catch{return null}}
 function safeInbox(value){try{const url=new URL(value,base);if(url.origin!==base.origin||![base.pathname+'inbox/',base.pathname+'inbox/index.html'].includes(url.pathname)||url.hash)return null;const query=new URLSearchParams();for(const name of ['request','screenId','componentId','variantId','fileKey','nodeId','link']){const values=url.searchParams.getAll(name);if(values.length>1)return null;if(!values.length)continue;const value=values[0];if(name==='link'){const link=new URL(value);if(link.username||link.password||value.length>2048||!(link.protocol==='https:'||link.protocol==='http:'&&['localhost','127.0.0.1'].includes(link.hostname)))return null}else if(!/^[-\w:;.]{1,512}$/.test(value)||name!=='nodeId'&&value.length>100)return null;query.set(name,value)}return'inbox/index.html'+(query.size?'?'+query:'')}catch{return null}}
 function safePrototype(value){try{const url=new URL(value,base);if(url.origin!==base.origin||url.username||url.password||url.hash||!['prototype/','prototype/index.html'].some(p=>url.pathname===base.pathname+p))return null;const query=new URLSearchParams();for(const[key,value]of url.searchParams){if(key==='_mount')continue;if(!PROTOTYPE_SELECTORS.includes(key)||query.has(key)||!/^[-\w:;.]{1,160}$/.test(value)||key==='depositContext'&&!DEPOSIT_CONTEXTS.includes(value))return null;query.set(key,value)}return'prototype/'+(query.size?'?'+query:'')}catch{return null}}
 editorPath=safePath(editorPath);inboxPath=safeInbox(inboxPath);if(!editorPath||!inboxPath)throw Error('Exact workspace entries required');
 // A consumed direct prototype link is shown in this tab's constructor frame through the live
 // root mount entry: no popup, no extra click, no default constructor screen first. Switching
 // to Inbox and back keeps that same prototype; it is persisted as navigation so a reload
 // returns to it. Only an explicit leave swaps the frame to the corresponding editor screen.
 // The editor for a shown prototype is never derived from its URL (a prototype screen= is a source type,
 // the editor's screen= is a saved record ID). The prototype frame reports its exact current URL and the
 // Edit target it actually computed; only that validated target is used to leave the prototype.
 let prototypePath=null,prototypeEdit=null;if(initialPrototypePath!=null){prototypePath=safePrototype(initialPrototypePath);if(!prototypePath)throw Error('Exact prototype entry required')}
 function restored(store,lookup=key){try{const saved=JSON.parse(store?.getItem(lookup)||'null');if(saved?.version!==1)return null;const restoredMode=modeFor(saved.mode);return modes.includes(restoredMode)?{...saved,mode:restoredMode}:null}catch{return null}}
 // Developer tabs migrate an existing legacy view once, so open working copies and Inbox threads survive.
 const saved=preferInitial?null:restored(tabStorage)||restored(storage)||(developer?restored(tabStorage,LEGACY_VIEW_KEY)||restored(storage,LEGACY_VIEW_KEY):null);if(saved){mode=saved.mode;editorPath=safePath(saved.editorPath)||editorPath;if(!initialMode)inboxPath=safeInbox(saved.inboxPath)||inboxPath;
  // A stored prototype is restored only in its exact canonical form; anything else is dropped.
  if(!prototypePath&&typeof saved.prototypePath==='string'&&safePrototype(saved.prototypePath)===saved.prototypePath){prototypePath=saved.prototypePath;if(typeof saved.prototypeEdit==='string'&&editTarget(saved.prototypeEdit)===saved.prototypeEdit)prototypeEdit=saved.prototypeEdit}}
 if(initialMode&&modes.includes(modeFor(initialMode)))mode=modeFor(initialMode);if(initialPrototypePath!=null)mode='constructor';
 function persist(){const value=JSON.stringify({version:1,mode,editorPath,inboxPath,...prototypePath?{prototypePath,...prototypeEdit?{prototypeEdit}:{}}:{}});for(const store of [tabStorage,storage])try{store?.setItem(key,value)}catch{}}
 const own=source=>source===editorFrame.contentWindow||source===questionsFrame.contentWindow||inboxFrame&&source===inboxFrame.contentWindow||children.has(source);
 async function start(which){if(started.has(which)||disposed)return;started.add(which);try{if(mount.ensure)await mount.ensure();if(disposed)return;const frame=which==='constructor'?editorFrame:which==='questions'?questionsFrame:inboxFrame;frame.src=mount.entryURL(which==='constructor'?prototypePath||editorPath:which==='questions'?initialQuestionsPath:inboxPath)}catch(error){started.delete(which);onError(error.message)}}
 function setMode(next){next=modeFor(next);if(!modes.includes(next))throw Error('Unknown workspace mode');if(next==='constructor'&&mode==='constructor'&&prototypePath&&started.has('constructor')){leavePrototype();return}mode=next;start(mode);editorFrame.hidden=mode!=='constructor';questionsFrame.hidden=mode!=='questions';if(inboxFrame)inboxFrame.hidden=mode!=='inbox';persist();onMode(mode)}
 // Explicit leave (the constructor control pressed while the prototype is shown): the same frame loads
 // the Edit target the current prototype reported, never a guessed or default constructor screen.
 function leavePrototype(){if(!prototypePath)return false;if(!prototypeEdit){onError('This prototype screen has no editor target yet');return false}editorPath=prototypeEdit;prototypePath=null;prototypeEdit=null;showConstructor();return true}
 // Only the owned constructor frame while it shows a prototype, and only for the URL it actually has.
 function prototypeLocation(data){if(!prototypePath||!started.has('constructor'))return;let actual;try{actual=safePrototype(editorFrame.contentWindow.location.href)}catch{return}
  if(!actual||typeof data?.url!=='string'||safePrototype(data.url)!==actual)return;prototypePath=actual;prototypeEdit=data.edit==null?null:editTarget(data.edit);persist()}
 function showConstructor(){started.delete('constructor');mode='constructor';start(mode);editorFrame.hidden=false;questionsFrame.hidden=true;if(inboxFrame)inboxFrame.hidden=true;persist();onMode(mode)}
 // Every Prototype request (the editor's button, a tracked child) is shown in this tab's own
 // constructor frame through the live root entry: no window.open, no permit wait, nothing a popup
 // blocker can stop. The editor already persisted its working copy before asking.
 function showPrototype(value){const path=safePrototype(value);if(!path||disposed)return false;prototypePath=path;prototypeEdit=null;showConstructor();return true}
 // The prototype's own Edit this screen link reloads the same frame through the live root entry too.
 function showEditor(value){const path=editTarget(value);if(!path||disposed)return false;editorPath=path;prototypePath=null;prototypeEdit=null;showConstructor();return true}
 function interceptPrototypeEdit(){let doc;try{const current=new URL(editorFrame.contentWindow.location.href);if(current.origin!==base.origin||!['prototype/','prototype/index.html'].some(p=>current.pathname===base.pathname+p))return()=>{};doc=editorFrame.contentDocument}catch{return()=>{}}if(!doc)return()=>{};
  const click=event=>{if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;const anchor=event.target.closest?.('a[href]');if(!anchor||anchor.target)return;// Only exact Edit targets; any other link keeps its own route.
   const path=editTarget(anchor.href);if(!path)return;event.preventDefault();event.stopImmediatePropagation?.();showEditor(path)};
  doc.addEventListener('click',click,true);return()=>doc.removeEventListener('click',click,true)}
 function trackChild(child){children.add(child);childWatchers.set(child,watchOwnedPrivateWindow({child,baseURL:base.href,open:openPrivateChild,onError,prototype:showPrototype}));}
 async function openPrivateChild(path){if(disposed)throw Error('GitHub sign-in required');const url=await mount.openEntryURL(path);if(disposed)throw Error('GitHub sign-in required');const child=win.open(url,'_blank');if(!child)throw Error('Private window could not open');trackChild(child)}
 let closeEditorLinks=()=>{};
 function ready(){closeEditorLinks();const links=mountScopedEditorLinks({frame:editorFrame,baseURL:base.href,open:openPrivateChild,onError,prototype:false}),edit=interceptPrototypeEdit();closeEditorLinks=()=>{links();edit()};editorFrame.contentWindow?.postMessage({type:'dsl2-workspace-host-ready'},base.origin)}
 function readyInbox(){if(pendingRequest)inboxFrame?.contentWindow?.postMessage({type:'dsl2-inbox-open',requestId:pendingRequest},base.origin);if(pendingCompose)inboxFrame?.contentWindow?.postMessage({type:'dsl2-inbox-compose-intent',hash:pendingCompose},base.origin)}
 function openInbox(hash,path){if(!inboxFrame){onError('Inbox is not connected');return false}if(hash!==undefined&&(typeof hash!=='string'||!hash.startsWith('#compose=')||hash.length>128000)){onError('Question link is invalid; existing draft is unchanged');return false}if(pendingCompose&&hash&&pendingCompose!==hash){onError('Finish the current question draft choice before opening another context');return false}if(path){const next=safeInbox(path);if(!next){onError('Inbox link is invalid');return false}if(next!==inboxPath){const request=new URL(next,base).searchParams.get('request');if(!started.has('inbox'))inboxPath=next;else if(request){inboxPath=next;pendingRequest=request}}}if(hash)pendingCompose=hash;const existing=started.has('inbox');setMode('inbox');if(existing)readyInbox();return true}
 async function openPrototype(value){return showPrototype(value)}
 async function receive(event){if(disposed||event.origin!==base.origin||!own(event.source))return;const data=event.data;
  if(data?.type==='dsl2-private-client-reclaim'){try{await mount.reclaim(data.challenge)}catch(error){onError(error.message)}return}
  if(data?.type==='dsl2-workspace-compose'){openInbox(data.hash);return}
  if(data?.type==='dsl2-workspace-inbox'){openInbox(undefined,data.path);return}
  if(data?.type==='dsl2-workspace-switch'&&modes.includes(modeFor(data.mode))){setMode(data.mode);return}
  if(inboxFrame&&event.source===inboxFrame.contentWindow){
   if(data?.type==='dsl2-inbox-compose-handled'&&data.hash===pendingCompose){pendingCompose=null;onComposeHandled(data.hash);return}
   if(data?.type==='dsl2-inbox-location'){const next=safeInbox(data.url);if(next){inboxPath=next;if(new URL(next,base).searchParams.get('request')===pendingRequest)pendingRequest=null;persist();onInboxLocation(next)}return}
  }
  if(data?.type==='dsl2-workspace-open-prototype'&&(event.source===editorFrame.contentWindow||children.has(event.source))){showPrototype(data.url);return}
  if(event.source!==editorFrame.contentWindow)return;
  if(data?.type==='dsl2-workspace-prototype-location'){prototypeLocation(data);return}
  if(data?.type==='dsl2-workspace-location'){const next=safePath(data.url);if(next){editorPath=next;prototypePath=null;prototypeEdit=null;persist()}}
 }
 editorFrame.addEventListener('load',ready);inboxFrame?.addEventListener('load',readyInbox);win.addEventListener('message',receive);setMode(mode);
 return{setMode,leavePrototype,openPrototype,openInbox,getMode:()=>mode,showsPrototype:()=>!!prototypePath,modes:[...modes],surface,destroy(){disposed=true;closeEditorLinks();pendingCompose=null;pendingRequest=null;editorFrame.removeEventListener('load',ready);inboxFrame?.removeEventListener('load',readyInbox);win.removeEventListener('message',receive);editorFrame.src='about:blank';questionsFrame.src='about:blank';if(inboxFrame)inboxFrame.src='about:blank';started.clear();for(const stop of childWatchers.values())stop();childWatchers.clear();for(const child of children)try{child.close()}catch{}children.clear()}};
}
